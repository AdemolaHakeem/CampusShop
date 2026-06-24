import { Typography, Row, Col, Empty, Spin, Space, Modal, message, Button } from 'antd';
import { List, AlertCircle, Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useUserListings } from '../hooks/useListings';
import { deleteListing } from '../services/listings';
import logger from '../utils/logger';
import ListingCard from '../components/ListingCard';

const { Title, Text } = Typography;
const { confirm } = Modal;

const MyListingsPage = () => {
  const { currentUser } = useAuth();
  const { listings, loading } = useUserListings(currentUser?.uid);
  const navigate = useNavigate();

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
          logger.error('Delete listing error:', err);
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
      <div className="page-header">
        <Space align="center" size={12}>
          <List size={28} color="#0062ff" />
          <div>
            <Title level={2} style={{ margin: 0 }}>My Listings</Title>
            <Text type="secondary">
              {listings.length} item{listings.length !== 1 ? 's' : ''} posted
            </Text>
          </div>
        </Space>
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
            <Button type="primary" icon={<Plus size={16} />} onClick={() => navigate('/add-listing')}>
              Create Listing
            </Button>
          </Empty>
        </div>
      ) : (
        <Row gutter={[20, 20]} className="listings-grid">
          {listings.map((listing) => (
            <Col key={listing.id} xs={24} sm={12} md={8} lg={6}>
              <ListingCard listing={listing} showActions onDelete={handleDelete} />
            </Col>
          ))}
        </Row>
      )}
    </div>
  );
};

export default MyListingsPage;
