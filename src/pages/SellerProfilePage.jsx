import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Typography, Row, Col, Empty, Spin, Button, Avatar, Tag, Card, Space, Divider, Rate } from 'antd';
import { ArrowLeft, User, ShoppingBag, Star, Calendar, Phone, Shield } from 'lucide-react';
import { supabase } from '../services/supabase';
import { formatPrice, timeAgo } from '../utils/helpers';
import ListingCard from '../components/ListingCard';

const { Title, Text, Paragraph } = Typography;

const SellerProfilePage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [seller, setSeller] = useState(null);
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [averageRating, setAverageRating] = useState(0);
  const [totalSales, setTotalSales] = useState(0);

  useEffect(() => {
    const fetchSeller = async () => {
      if (!id) return;
      setLoading(true);
      try {
        // Get seller profile
        const { data: profile } = await supabase
          .from('profiles')
          .select('*, campuses(name)')
          .eq('id', id)
          .single();

        if (!profile) {
          navigate('/market');
          return;
        }

        // Get their active listings
        const { data: listingData } = await supabase
          .from('listings')
          .select('*')
          .eq('seller_id', id)
          .order('created_at', { ascending: false });

        // Get their sold count
        const { count: soldCount } = await supabase
          .from('listings')
          .select('*', { count: 'exact', head: true })
          .eq('seller_id', id)
          .eq('status', 'sold');

        // Get average rating from their listings' reviews
        const listingIds = (listingData || []).map(l => l.id);
        let avgRating = 0;
        let totalReviews = 0;

        if (listingIds.length > 0) {
          const { data: reviewData } = await supabase
            .from('reviews')
            .select('rating, listing_id')
            .in('listing_id', listingIds);

          if (reviewData && reviewData.length > 0) {
            avgRating = reviewData.reduce((s, r) => s + r.rating, 0) / reviewData.length;
            totalReviews = reviewData.length;
          }
        }

        setSeller({
          id: profile.id,
          name: profile.name || 'Anonymous',
          phone: profile.phone || '',
          campus: profile.campuses?.name || 'Unknown Campus',
          role: profile.role || 'user',
          joined: profile.created_at,
          totalListings: (listingData || []).length,
        });

        setListings((listingData || []).map(l => ({
          id: l.id,
          title: l.title,
          description: l.description,
          price: l.price,
          category: l.category,
          condition: l.condition || null,
          imageURL: l.image_url || '',
          sellerId: l.seller_id,
          sellerName: l.seller_name,
          sellerPhone: l.whatsapp_number,
          campusId: l.campus_id,
          createdAt: l.created_at,
          status: l.status || 'active',
        })));

        setAverageRating(Math.round(avgRating * 10) / 10);
        setTotalSales(soldCount || 0);
      } catch (err) {
        console.error('Error fetching seller:', err);
        navigate('/market');
      } finally {
        setLoading(false);
      }
    };

    fetchSeller();
  }, [id, navigate]);

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <Spin size="large" />
      </div>
    );
  }

  if (!seller) return null;

  const activeListings = listings.filter(l => l.status === 'active');
  const soldListings = listings.filter(l => l.status === 'sold');

  return (
    <div style={{ padding: '24px', maxWidth: 1000, margin: '0 auto', animation: 'pageIn 0.35s ease-out' }}>
      <Button
        type="text"
        icon={<ArrowLeft size={16} />}
        onClick={() => navigate(-1)}
        style={{ color: 'var(--text-secondary)', marginBottom: 16, padding: '4px 0' }}
      >
        Back
      </Button>

      {/* Profile header */}
      <Card
        style={{
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--border-color)',
          marginBottom: 24,
        }}
        bodyStyle={{ padding: '32px' }}
      >
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 24, flexWrap: 'wrap' }}>
          <Avatar
            size={80}
            icon={<User size={36} />}
            style={{ background: '#1a1f36', flexShrink: 0 }}
          />

          <div style={{ flex: 1, minWidth: 200 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 4 }}>
              <Title level={3} style={{ margin: 0 }}>{seller.name}</Title>
              {seller.role === 'admin' || seller.role === 'super_admin' ? (
                <Tag icon={<Shield size={12} />} color="blue">Admin</Tag>
              ) : null}
            </div>

            <Space direction="vertical" size={4}>
              <Text type="secondary">
                <Calendar size={14} style={{ verticalAlign: 'middle', marginRight: 6 }} />
                Joined {new Date(seller.joined).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
              </Text>
              <Text type="secondary">
                <ShoppingBag size={14} style={{ verticalAlign: 'middle', marginRight: 6 }} />
                {seller.campus}
              </Text>
            </Space>
          </div>

          {/* Stats */}
          <div style={{ display: 'flex', gap: 24, flexShrink: 0 }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 28, fontWeight: 800, color: '#0f172a', lineHeight: 1 }}>{activeListings.length}</div>
              <Text type="secondary" style={{ fontSize: 12 }}>Active</Text>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 28, fontWeight: 800, color: '#0f172a', lineHeight: 1 }}>{totalSales}</div>
              <Text type="secondary" style={{ fontSize: 12 }}>Sold</Text>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 28, fontWeight: 800, color: '#0f172a', lineHeight: 1 }}>
                {averageRating > 0 ? averageRating : '—'}
              </div>
              <Text type="secondary" style={{ fontSize: 12 }}>
                {averageRating > 0 ? (
                  <span><Star size={12} color="#eab308" fill="#eab308" style={{ verticalAlign: 'middle' }} /> Rating</span>
                ) : 'No ratings'}
              </Text>
            </div>
          </div>
        </div>
      </Card>

      {/* Active listings */}
      <Title level={4} style={{ marginBottom: 16 }}>
        Active Listings ({activeListings.length})
      </Title>

      {activeListings.length === 0 ? (
        <Empty
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          description="This seller has no active listings right now"
        />
      ) : (
        <Row gutter={[20, 20]}>
          {activeListings.map((listing) => (
            <Col key={listing.id} xs={24} sm={12} md={8}>
              <ListingCard listing={listing} />
            </Col>
          ))}
        </Row>
      )}

      {/* Sold listings */}
      {soldListings.length > 0 && (
        <>
          <Divider style={{ margin: '32px 0 24px' }} />
          <Title level={4} style={{ marginBottom: 16 }}>
            Sold Items ({soldListings.length})
          </Title>
          <Row gutter={[20, 20]}>
            {soldListings.map((listing) => (
              <Col key={listing.id} xs={24} sm={12} md={8}>
                <ListingCard listing={listing} />
              </Col>
            ))}
          </Row>
        </>
      )}
    </div>
  );
};

export default SellerProfilePage;
