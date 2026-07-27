import { Typography, Row, Col, Empty, Spin, Space, Modal, message, Button } from 'antd';
import { List, AlertCircle, Plus, Package, CheckCircle, RotateCcw } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useUserListings } from '../hooks/useListings';
import { deleteListing, markListingAsSold, markListingAsActive } from '../services/listings';
import ListingCard from '../components/ListingCard';

const { Title, Text } = Typography;
const { confirm } = Modal;

const MyListingsPage = () => {
  const { currentUser } = useAuth();
  const { listings, loading } = useUserListings(currentUser?.uid);
  const navigate = useNavigate();

  const activeListings = listings.filter(l => l.status !== 'sold');
  const soldListings = listings.filter(l => l.status === 'sold');

  const handleDelete = (id) => {
    confirm({
      title: 'Delete this listing?',
      icon: <AlertCircle size={20} />,
      content: 'This action cannot be undone. The listing will be permanently removed.',
      okText: 'Delete',
      okType: 'danger',
      cancelText: 'Cancel',
      centered: true,
      onOk: async () => {
        try {
          await deleteListing(id);
          message.success('Listing deleted successfully');
        } catch (err) {
          message.error('Failed to delete listing');
          console.error(err);
        }
      },
    });
  };

  const handleMarkSold = (id) => {
    confirm({
      title: 'Mark this item as sold?',
      icon: <CheckCircle size={20} style={{ color: '#16a34a' }} />,
      content: 'This will hide the listing from the marketplace. Buyers can still contact you about past listings.',
      okText: 'Mark as Sold',
      okType: 'primary',
      cancelText: 'Cancel',
      centered: true,
      onOk: async () => {
        try {
          await markListingAsSold(id);
          message.success('Listing marked as sold ✅');
        } catch (err) {
          message.error('Failed to update listing');
          console.error(err);
        }
      },
    });
  };

  const handleMarkActive = (id) => {
    confirm({
      title: 'Relist this item?',
      icon: <RotateCcw size={20} style={{ color: '#2563eb' }} />,
      content: 'This will make the listing visible in the marketplace again.',
      okText: 'Relist',
      cancelText: 'Cancel',
      centered: true,
      onOk: async () => {
        try {
          await markListingAsActive(id);
          message.success('Listing relisted 🔄');
        } catch (err) {
          message.error('Failed to relist');
          console.error(err);
        }
      },
    });
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <Spin size="large" tip="Loading your listings..." />
      </div>
    );
  }

  return (
    <div className="my-listings-page">
      <div className="page-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
        <Space align="center" size={14}>
          <div style={{
            width: 44,
            height: 44,
            borderRadius: 'var(--radius-md)',
            background: 'var(--accent-blue-bg)',
            border: '1px solid var(--accent-blue-border)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            <Package size={22} color="#2563eb" />
          </div>
          <div>
            <Title level={2} style={{ margin: 0, letterSpacing: '-0.5px' }}>My Listings</Title>
            <Text type="secondary" style={{ fontSize: 14 }}>
              {listings.length} item{listings.length !== 1 ? 's' : ''} posted
            </Text>
          </div>
        </Space>
        <Button
          type="primary"
          icon={<Plus size={16} />}
          onClick={() => navigate('/add-listing')}
          className="sell-btn"
        >
          New Listing
        </Button>
      </div>

      {listings.length === 0 ? (
        <div className="empty-state">
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description={
              <Space direction="vertical" size={4}>
                <Text strong style={{ fontSize: 16 }}>You haven't posted anything yet</Text>
                <Text type="secondary">Start selling by creating your first listing</Text>
              </Space>
            }
          >
            <Button 
              type="primary" 
              icon={<Plus size={16} />} 
              onClick={() => navigate('/add-listing')}
              className="sell-btn"
            >
              Create Listing
            </Button>
          </Empty>
        </div>
      ) : (
        <>
          {/* Active Listings */}
          {activeListings.length > 0 && (
            <>
              <Title level={4} style={{ margin: '24px 0 16px', letterSpacing: '-0.3px' }}>
                Active ({activeListings.length})
              </Title>
              <Row gutter={[20, 20]} className="listings-grid">
                {activeListings.map((listing) => (
                  <Col key={listing.id} xs={24} sm={12} md={8} lg={6}>
                    <ListingCard listing={listing} showActions onDelete={handleDelete} onMarkSold={handleMarkSold} />
                  </Col>
                ))}
              </Row>
            </>
          )}

          {/* Sold Listings */}
          {soldListings.length > 0 && (
            <>
              <Title level={4} style={{ margin: '32px 0 16px', letterSpacing: '-0.3px', color: 'var(--text-secondary)' }}>
                Sold ({soldListings.length})
              </Title>
              <Row gutter={[20, 20]} className="listings-grid">
                {soldListings.map((listing) => (
                  <Col key={listing.id} xs={24} sm={12} md={8} lg={6}>
                    <ListingCard listing={listing} showActions onDelete={handleDelete} onMarkSold={handleMarkSold} />
                  </Col>
                ))}
              </Row>
            </>
          )}
        </>
      )}
    </div>
  );
};

export default MyListingsPage;
