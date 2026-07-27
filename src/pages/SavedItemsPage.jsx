import { useEffect, useState } from 'react';
import { Typography, Row, Col, Empty, Spin, Button, message } from 'antd';
import { Heart, ArrowLeft, ShoppingBag } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { getUserFavorites } from '../services/favorites';
import ListingCard from '../components/ListingCard';
import { useNavigate } from 'react-router-dom';

const { Title, Text } = Typography;

const SavedItemsPage = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!currentUser) return;
    loadFavorites();
  }, [currentUser]);

  const loadFavorites = async () => {
    setLoading(true);
    try {
      const data = await getUserFavorites(currentUser.id);
      setFavorites(data);
    } catch (err) {
      console.error('Error loading favorites:', err);
      message.error('Failed to load saved items');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div className="my-listings-page">
      <div className="page-header">
        <Button
          type="text"
          icon={<ArrowLeft size={16} />}
          onClick={() => navigate('/market')}
          style={{ color: 'var(--text-secondary)', padding: '4px 0' }}
        >
          Back to Marketplace
        </Button>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 8 }}>
          <div style={{
            width: 40, height: 40, borderRadius: 12,
            background: 'rgba(239, 68, 68, 0.1)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Heart size={20} color="#ef4444" fill="#ef4444" />
          </div>
          <div>
            <Title level={2} style={{ margin: 0, letterSpacing: '-0.5px' }}>
              Saved Items
            </Title>
            <Text type="secondary" style={{ fontSize: 14 }}>
              {favorites.length} saved listing{favorites.length !== 1 ? 's' : ''}
            </Text>
          </div>
        </div>
      </div>

      <div style={{ padding: '24px', maxWidth: 1400, margin: '0 auto' }}>
        {favorites.length === 0 ? (
          <div className="empty-state">
            <Empty
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              description={
                <div>
                  <Text strong style={{ fontSize: 16 }}>No saved items yet</Text>
                  <div style={{ marginTop: 4 }}>
                    <Text type="secondary">
                      Tap the heart icon on any listing to save it for later
                    </Text>
                  </div>
                </div>
              }
            >
              <Button
                type="primary"
                icon={<ShoppingBag size={16} />}
                onClick={() => navigate('/market')}
                className="submit-btn"
                style={{ marginTop: 8 }}
              >
                Browse Marketplace
              </Button>
            </Empty>
          </div>
        ) : (
          <Row gutter={[20, 20]}>
            {favorites.map((fav) => (
              <Col key={fav.favoriteId} xs={24} sm={12} md={8} lg={6}>
                <ListingCard listing={fav.listing} />
              </Col>
            ))}
          </Row>
        )}
      </div>
    </div>
  );
};

export default SavedItemsPage;
