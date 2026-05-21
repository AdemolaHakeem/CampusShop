import { Card, Tag, Button, Typography, Space, Tooltip } from 'antd';
import { WhatsAppOutlined, ClockCircleOutlined, DeleteOutlined, EditOutlined } from '@ant-design/icons';
import { formatPrice, getWhatsAppLink, timeAgo } from '../utils/helpers';
import { CATEGORY_COLORS } from '../utils/categories';

const { Meta } = Card;
const { Text, Paragraph } = Typography;

const ListingCard = ({ listing, showActions = false, onDelete }) => {
  const {
    title,
    price,
    description,
    category,
    imageURL,
    sellerName,
    sellerPhone,
    createdAt,
  } = listing;

  const fallbackImg = `https://placehold.co/400x300/1a1a2e/0062ff?text=${encodeURIComponent(title || 'Item')}`;

  const cardActions = [];

  if (sellerPhone) {
    cardActions.push(
      <Tooltip title="Contact via WhatsApp" key="whatsapp">
        <a href={getWhatsAppLink(sellerPhone, title)} target="_blank" rel="noopener noreferrer">
          <WhatsAppOutlined style={{ color: '#25D366', fontSize: 18 }} />
        </a>
      </Tooltip>
    );
  }

  if (showActions && onDelete) {
    cardActions.push(
      <Tooltip title="Delete listing" key="delete">
        <DeleteOutlined
          style={{ color: '#ff4d4f', fontSize: 16 }}
          onClick={() => onDelete(listing.id)}
        />
      </Tooltip>
    );
  }

  return (
    <Card
      hoverable
      className="listing-card"
      cover={
        <div className="listing-card-cover">
          <img
            alt={title}
            src={imageURL || fallbackImg}
            onError={(e) => { e.target.src = fallbackImg; }}
          />
          <div className="listing-card-price-badge">
            {formatPrice(price)}
          </div>
        </div>
      }
      actions={cardActions.length > 0 ? cardActions : undefined}
    >
      <div className="listing-card-content">
        <Tag color={CATEGORY_COLORS[category] || '#8c8c8c'} style={{ marginBottom: 8 }}>
          {category}
        </Tag>
        <Meta
          title={<Text ellipsis={{ tooltip: title }} className="listing-title">{title}</Text>}
          description={
            <Paragraph
              ellipsis={{ rows: 2 }}
              type="secondary"
              style={{ marginBottom: 8, fontSize: 13 }}
            >
              {description}
            </Paragraph>
          }
        />
        <div className="listing-card-footer">
          <Text type="secondary" style={{ fontSize: 12 }}>
            <ClockCircleOutlined style={{ marginRight: 4 }} />
            {timeAgo(createdAt)}
          </Text>
          <Text type="secondary" style={{ fontSize: 12 }}>
            by {sellerName}
          </Text>
        </div>
      </div>
    </Card>
  );
};

export default ListingCard;
