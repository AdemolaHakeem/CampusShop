import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Typography, Button, Spin, Tag, Card, Divider, Space, Rate, Input, message, Row, Col, Empty, Grid } from 'antd';
import {
  ArrowLeft, MessageCircle, Clock, User, Phone, ChevronLeft, ChevronRight,
  CheckCircle, Star, Send, AlertTriangle, Image as ImageIcon,
} from 'lucide-react';
import { supabase } from '../services/supabase';
import { mapListing } from '../services/listings';
import { useAuth } from '../context/AuthContext';
import { formatPrice, getWhatsAppLink, timeAgo } from '../utils/helpers';
import { CATEGORY_COLORS } from '../utils/categories';
import HeartToggle from '../components/HeartToggle';
import ReportListingModal from '../components/ReportListingModal';

const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;
const { useBreakpoint } = Grid;

const CONDITION_LABELS = {
  'new': 'New',
  'like-new': 'Like New',
  'used': 'Used',
};

const ListingDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const screens = useBreakpoint();
  const [listing, setListing] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [averageRating, setAverageRating] = useState(0);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [reportModalOpen, setReportModalOpen] = useState(false);

  useEffect(() => {
    const fetchListing = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('listings')
          .select('*')
          .eq('id', id)
          .single();

        if (error) throw error;
        setListing(mapListing(data));

        // Fetch reviews
        const { data: reviewData } = await supabase
          .from('reviews')
          .select('*, reviewer:profiles!reviewer_id(name)')
          .eq('listing_id', id)
          .order('created_at', { ascending: false });

        if (reviewData) {
          setReviews(reviewData);
          const avg = reviewData.reduce((s, r) => s + r.rating, 0) / reviewData.length;
          setAverageRating(Math.round(avg * 10) / 10);
        }
      } catch (err) {
        console.error('Error fetching listing:', err);
        message.error('Listing not found');
        navigate('/market');
      } finally {
        setLoading(false);
      }
    };

    fetchListing();
  }, [id, navigate]);

  const handleSubmitReview = async () => {
    if (!currentUser) {
      message.warning('Please sign in to leave a review');
      return;
    }

    setSubmittingReview(true);
    try {
      const { error } = await supabase
        .from('reviews')
        .upsert({
          listing_id: id,
          reviewer_id: currentUser.id,
          rating: reviewRating,
          comment: reviewComment,
        }, { onConflict: 'listing_id,reviewer_id' });

      if (error) throw error;

      message.success('Review submitted! ⭐');
      setReviewComment('');

      // Refresh reviews
      const { data: newReviews } = await supabase
        .from('reviews')
        .select('*, reviewer:profiles!reviewer_id(name)')
        .eq('listing_id', id)
        .order('created_at', { ascending: false });

      if (newReviews) {
        setReviews(newReviews);
        const avg = newReviews.reduce((s, r) => s + r.rating, 0) / newReviews.length;
        setAverageRating(Math.round(avg * 10) / 10);
      }
    } catch (err) {
      console.error('Review error:', err);
      message.error('Failed to submit review');
    } finally {
      setSubmittingReview(false);
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <Spin size="large" tip="Loading listing..." />
      </div>
    );
  }

  if (!listing) return null;

  const isSold = listing.status === 'sold';
  const fallbackImg = `https://placehold.co/600x400/f1f3f7/64748b?text=${encodeURIComponent(listing.title || 'Item')}`;
  const l = listing; // shorter alias
  const hasReviewed = currentUser && reviews.some(r => r.reviewer_id === currentUser.id);

  // Collect all images (single + multi)
  const allImages = [listing.imageURL, ...(listing.images || [])].filter(Boolean);
  const allImagesDeduped = [...new Set(allImages)];
  const displayImages = allImagesDeduped.length > 0 ? allImagesDeduped : [listing.imageURL || fallbackImg];

  return (
    <div className="listing-detail-page" style={{ maxWidth: 1000, margin: '0 auto', padding: '24px', animation: 'pageIn 0.35s ease-out' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <Button
          type="text"
          icon={<ArrowLeft size={16} />}
          onClick={() => navigate('/market')}
          style={{ color: 'var(--text-secondary)', padding: '4px 0' }}
        >
          Back to Marketplace
        </Button>
        <Space>
          {!isSold && <HeartToggle listingId={listing.id} size={20} />}
          {!isSold && (
            <Button
              type="text"
              size="small"
              icon={<AlertTriangle size={16} color="#ef4444" />}
              onClick={(e) => { e.stopPropagation(); setReportModalOpen(true); }}
              style={{ color: '#ef4444' }}
            >
              Report
            </Button>
          )}
        </Space>
      </div>

      <Row gutter={[32, 32]}>
        {/* Image gallery */}
        <Col xs={24} md={12}>
          <Card
            style={{
              borderRadius: 'var(--radius-lg)',
              overflow: 'hidden',
              border: '1px solid var(--border-color)',
              position: 'relative',
            }}
            bodyStyle={{ padding: 0 }}
          >
            <div style={{ position: 'relative' }}>
              <img
                src={displayImages[currentImageIndex]}
                alt={listing.title}
                style={{
                  width: '100%',
                  height: screens.md ? 400 : 280,
                  objectFit: 'cover',
                  display: 'block',
                  opacity: isSold ? 0.5 : 1,
                }}
                onError={(e) => { e.target.src = fallbackImg; }}
              />

              {/* Image navigation arrows */}
              {displayImages.length > 1 && !isSold && (
                <>
                  <Button
                    type="text"
                    icon={<ChevronLeft size={20} />}
                    onClick={(e) => { e.stopPropagation(); setCurrentImageIndex(prev => prev === 0 ? displayImages.length - 1 : prev - 1); }}
                    style={{
                      position: 'absolute', left: 8, top: '50%', transform: 'translateY(-50%)',
                      background: 'rgba(255,255,255,0.8)', border: 'none',
                      width: 36, height: 36, borderRadius: '50%',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}
                  />
                  <Button
                    type="text"
                    icon={<ChevronRight size={20} />}
                    onClick={(e) => { e.stopPropagation(); setCurrentImageIndex(prev => prev === displayImages.length - 1 ? 0 : prev + 1); }}
                    style={{
                      position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)',
                      background: 'rgba(255,255,255,0.8)', border: 'none',
                      width: 36, height: 36, borderRadius: '50%',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}
                  />
                </>
              )}

              {/* Image dots indicator */}
              {displayImages.length > 1 && (
                <div style={{
                  position: 'absolute', bottom: 12, left: '50%', transform: 'translateX(-50%)',
                  display: 'flex', gap: 6,
                }}>
                  {displayImages.map((_, idx) => (
                    <div
                      key={idx}
                      onClick={(e) => { e.stopPropagation(); setCurrentImageIndex(idx); }}
                      style={{
                        width: 8, height: 8, borderRadius: '50%',
                        background: idx === currentImageIndex ? '#fff' : 'rgba(255,255,255,0.5)',
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                      }}
                    />
                  ))}
                </div>
              )}

              {isSold && (
                <div style={{
                  position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
                  background: 'rgba(0,0,0,0.7)', color: '#fff', padding: '12px 24px', borderRadius: 'var(--radius-md)',
                  display: 'flex', alignItems: 'center', gap: 8, fontSize: 18, fontWeight: 700,
                }}>
                  <CheckCircle size={24} /> SOLD
                </div>
              )}
            </div>

            {/* Thumbnail strip */}
            {displayImages.length > 1 && (
              <div style={{
                display: 'flex', gap: 8, padding: 12, overflowX: 'auto',
                borderTop: '1px solid var(--border-color)',
              }}>
                {displayImages.map((img, idx) => (
                  <div
                    key={idx}
                    onClick={() => setCurrentImageIndex(idx)}
                    style={{
                      width: 56, height: 56, borderRadius: 8, overflow: 'hidden',
                      cursor: 'pointer', flexShrink: 0,
                      border: idx === currentImageIndex ? '2px solid #2563eb' : '2px solid transparent',
                      opacity: idx === currentImageIndex ? 1 : 0.6,
                      transition: 'all 0.2s',
                    }}
                  >
                    <img src={img} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </div>
                ))}
              </div>
            )}
          </Card>
        </Col>

        {/* Details */}
        <Col xs={24} md={12}>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 12 }}>
            <Tag color={CATEGORY_COLORS[l.category] || '#8c8c8c'}>
              {l.category}
            </Tag>
            {l.condition && (
              <Tag style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', color: '#16a34a' }}>
                {CONDITION_LABELS[l.condition] || l.condition}
              </Tag>
            )}
            {isSold && <Tag color="red">Sold</Tag>}
          </div>

          <Title level={2} style={{ margin: '0 0 8px', letterSpacing: '-0.5px' }}>
            {l.title}
          </Title>

          <Title level={3} style={{ color: '#16a34a', margin: '0 0 16px' }}>
            {formatPrice(l.price)}
          </Title>

          <Paragraph style={{ fontSize: 15, lineHeight: 1.7, color: 'var(--text-primary)', marginBottom: 24 }}>
            {l.description}
          </Paragraph>

          <Divider style={{ margin: '16px 0' }} />

          <Space direction="vertical" size={12} style={{ width: '100%' }}>
            <div
              style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--accent-blue)', fontSize: 14, cursor: 'pointer' }}
              onClick={() => navigate(`/seller/${l.sellerId}`)}
            >
              <User size={16} /> <Text style={{ color: 'var(--accent-blue)' }}>{l.sellerName}</Text>
              <Tag style={{ fontSize: 10, border: 'none', background: 'transparent', padding: 0, color: 'var(--accent-blue)', cursor: 'pointer' }}>View Profile →</Tag>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--text-secondary)', fontSize: 14 }}>
              <Clock size={16} /> <Text>{timeAgo(l.createdAt)}</Text>
            </div>
            {averageRating > 0 && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 14 }}>
                <Star size={16} color="#eab308" fill="#eab308" />
                <Text strong>{averageRating}</Text>
                <Text type="secondary">({reviews.length} review{reviews.length !== 1 ? 's' : ''})</Text>
              </div>
            )}
          </Space>

          <Divider style={{ margin: '20px 0' }} />

          {l.sellerPhone && !isSold && (
            <a
              href={getWhatsAppLink(l.sellerPhone, l.title)}
              target="_blank"
              rel="noopener noreferrer"
              style={{ textDecoration: 'none' }}
            >
              <Button
                type="primary"
                size="large"
                block
                icon={<MessageCircle size={18} />}
                style={{
                  height: 48, borderRadius: 'var(--radius-md)', fontWeight: 600,
                  background: '#25D366', border: 'none', boxShadow: '0 4px 14px rgba(37, 211, 102, 0.3)',
                }}
              >
                Contact Seller on WhatsApp
              </Button>
            </a>
          )}

          {l.sellerPhone && (
            <Text type="secondary" style={{ display: 'block', fontSize: 12, marginTop: 8, textAlign: 'center' }}>
              <Phone size={12} style={{ verticalAlign: 'middle', marginRight: 4 }} />
              {l.sellerPhone}
            </Text>
          )}
        </Col>
      </Row>

      {/* Report Listing Modal */}
      <ReportListingModal
        listingId={id}
        open={reportModalOpen}
        onClose={() => setReportModalOpen(false)}
      />

      {/* Reviews Section */}
      <Divider style={{ margin: '40px 0 24px' }} />
      <Title level={3} style={{ margin: '0 0 20px', letterSpacing: '-0.3px' }}>
        Reviews {averageRating > 0 && <>— <Rate disabled value={Math.round(averageRating)} /> <Text type="secondary">({averageRating})</Text></>}
      </Title>

      {/* Review Form */}
      {currentUser && !hasReviewed && !isSold && (
        <Card
          style={{ marginBottom: 24, borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}
          bodyStyle={{ padding: 20 }}
        >
          <Space direction="vertical" size={12} style={{ width: '100%' }}>
            <div>
              <Text strong style={{ display: 'block', marginBottom: 8 }}>Rate this item</Text>
              <Rate value={reviewRating} onChange={setReviewRating} />
            </div>
            <TextArea
              placeholder="Share your experience with this item..."
              rows={3}
              value={reviewComment}
              onChange={(e) => setReviewComment(e.target.value)}
              maxLength={500}
              showCount
            />
            <Button
              type="primary"
              icon={<Send size={14} />}
              onClick={handleSubmitReview}
              loading={submittingReview}
              disabled={!reviewComment.trim()}
            >
              Submit Review
            </Button>
          </Space>
        </Card>
      )}

      {/* Review List */}
      {reviews.length === 0 ? (
        <Empty
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          description={currentUser ? 'Be the first to review this item!' : 'No reviews yet'}
        />
      ) : (
        <Space direction="vertical" size={16} style={{ width: '100%' }}>
          {reviews.map((review) => (
            <Card
              key={review.id}
              size="small"
              style={{ borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                <Space>
                  <Text strong>{review.reviewer?.name || 'Anonymous'}</Text>
                  <Rate disabled value={review.rating} style={{ fontSize: 12 }} />
                </Space>
                <Text type="secondary" style={{ fontSize: 11 }}>{timeAgo(review.created_at)}</Text>
              </div>
              {review.comment && (
                <Paragraph style={{ margin: 0, fontSize: 14, color: 'var(--text-secondary)' }}>
                  {review.comment}
                </Paragraph>
              )}
            </Card>
          ))}
        </Space>
      )}
    </div>
  );
};

export default ListingDetailPage;
