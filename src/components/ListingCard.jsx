import { useNavigate } from 'react-router-dom';
import { Card, Tag, Typography, Space, Tooltip } from 'antd';
import { MessageCircle, Clock, Trash2, CheckCircle, Star, AlertTriangle } from 'lucide-react';
import { formatPrice, getWhatsAppLink, timeAgo } from '../utils/helpers';
import { CATEGORY_COLORS } from '../utils/categories';
import HeartToggle from './HeartToggle';

const { Meta } = Card;
const { Text, Paragraph } = Typography;

const CONDITION_LABELS = {
  'new': 'New',
  'like-new': 'Like New',
  'used': 'Used',
};

const ListingCard = ({ listing, showActions = false, onDelete, onMarkSold }) => {
  const navigate = useNavigate();
  const {
    title,
    price,
    description,
    category,
    imageURL,
    sellerName,
    sellerPhone,
    createdAt,
    status,
    condition,
  } = listing;

  const isSold = status === 'sold';
  const fallbackImg = `https://placehold.co/400x300/f1f3f7/64748b?text=${encodeURIComponent(title || 'Item')}`;

  const cardActions = [];

  if (sellerPhone && !isSold) {
    cardActions.push(
      <Tooltip title="Contact via WhatsApp" key="whatsapp">
        <a href={getWhatsAppLink(sellerPhone, title)} target="_blank" rel="noopener noreferrer">
          <MessageCircle size={18} color="#25D366" />
        </a>
      </Tooltip>
    );
  }

  if (showActions && onDelete) {
    cardActions.push(
      <Tooltip title="Delete listing" key="delete">
        <Trash2
          size={16}
          color="#ef4444"
          style={{ cursor: 'pointer' }}
          onClick={(e) => { e.stopPropagation(); onDelete(listing.id); }}
        />
      </Tooltip>
    );
  }

  if (showActions && onMarkSold && !isSold) {
    cardActions.push(
      <Tooltip title="Mark as sold" key="sold">
        <CheckCircle
          size={16}
          color="#16a34a"
          style={{ cursor: 'pointer' }}
          onClick={(e) => { e.stopPropagation(); onMarkSold(listing.id); }}
        />
      </Tooltip>
    );
  }

  return (
    <Card
      hoverable
      className={`listing-card ${isSold ? 'listing-card-sold' : ''}`}
      onClick={() => navigate(`/listing/${listing.id}`)}
      cover={
        <div className="listing-card-cover">
          <img
            alt={title}
            src={imageURL || fallbackImg}
            onError={(e) => { e.target.src = fallbackImg; }}
            style={{ opacity: isSold ? 0.6 : 1 }}
          />
          <div className="listing-card-price-badge">
            {formatPrice(price)}
          </div>
          {!isSold && (
            <div style={{ position: 'absolute', top: 8, right: 8, zIndex: 2 }}>
              <HeartToggle listingId={listing.id} size={16} />
            </div>
          )}
          {isSold && (
            <div className="listing-card-sold-overlay">
              <CheckCircle size={20} />
              <span>SOLD</span>
            </div>
          )}
        </div>
      }
      actions={cardActions.length > 0 ? cardActions : undefined}
    >
      <div className="listing-card-content">
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 10 }}>
          <Tag 
            color={CATEGORY_COLORS[category] || '#8c8c8c'} 
            style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.02em' }}
          >
            {category}
          </Tag>
          {condition && (
            <Tag style={{ fontSize: 11, background: '#f0fdf4', border: '1px solid #bbf7d0', color: '#16a34a' }}>
              {CONDITION_LABELS[condition] || condition}
            </Tag>
          )}
        </div>
        <Meta
          title={
            <Text 
              ellipsis={{ tooltip: title }} 
              className="listing-title"
              style={{ textDecoration: isSold ? 'line-through' : 'none', opacity: isSold ? 0.6 : 1 }}
            >
              {title}
            </Text>
          }
          description={
            <Paragraph
              ellipsis={{ rows: 2 }}
              type="secondary"
              style={{ marginBottom: 10, fontSize: 13, lineHeight: 1.5 }}
            >
              {description}
            </Paragraph>
          }
        />
        <div className="listing-card-footer">
          <Text 
            type="secondary" 
            style={{ fontSize: 12, display: 'flex', alignItems: 'center', gap: 4, cursor: 'pointer' }}
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/seller/${sellerId}`);
            }}
          >
            {sellerName}
          </Text>
          <Text type="secondary" style={{ fontSize: 12, display: 'flex', alignItems: 'center', gap: 4 }}>
            <Clock size={12} />
            {timeAgo(createdAt)}
          </Text>
          <Text type="secondary" style={{ fontSize: 12, display: 'flex', alignItems: 'center', gap: 4 }}>
            <Clock size={12} />
            {timeAgo(createdAt)}
          </Text>
        </div>
      </div>
    </Card>
  );
};

export default ListingCard;
