import { Typography, Row, Col, Modal, message } from 'antd';
import { List, AlertCircle, Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useUserListings } from '../hooks/useListings';
import { deleteListing } from '../services/listings';
import ListingCard from '../components/ListingCard';
import FullPageSpinner from '../components/FullPageSpinner';
import EmptyState from '../components/EmptyState';

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
          console.error(err);
        }
      },
    });
  };

  if (loading) {
    return <FullPageSpinner tip="Loading your listings..." />;
  }

  return (
    <div className="my-listings-page">
      <div className="page-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <List size={28} color="#0062ff" />
          <div>
            <Title level={2} style={{ margin: 0 }}>My Listings</Title>
            <Text type="secondary">
              {listings.length} item{listings.length !== 1 ? 's' : ''} posted
            </Text>
          </div>
        </div>
      </div>

      {listings.length === 0 ? (
        <EmptyState
          title="You haven't posted anything yet"
          description="Start selling by creating your first listing"
          actionLabel="Create Listing"
          actionIcon={<Plus size={16} />}
          onAction={() => navigate('/add-listing')}
        />
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
