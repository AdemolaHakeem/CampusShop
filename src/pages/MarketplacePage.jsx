import { useState, useMemo } from 'react';
import { Input, Select, Row, Col, Empty, Spin, Typography, Space, Tag, Badge } from 'antd';
import { SearchOutlined, FilterOutlined, ShopOutlined, AppstoreOutlined } from '@ant-design/icons';
import { useListings } from '../hooks/useListings';
import ListingCard from '../components/ListingCard';
import { CATEGORIES, CATEGORY_COLORS } from '../utils/categories';

const { Title, Text, Paragraph } = Typography;

const MarketplacePage = () => {
  const { listings, loading } = useListings();
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('all');

  const filtered = useMemo(() => {
    return listings.filter((item) => {
      const matchSearch = item.title?.toLowerCase().includes(search.toLowerCase()) ||
        item.description?.toLowerCase().includes(search.toLowerCase());
      const matchCategory = category === 'all' || item.category === category;
      return matchSearch && matchCategory;
    });
  }, [listings, search, category]);

  const categoryCounts = useMemo(() => {
    const counts = { all: listings.length };
    listings.forEach((item) => {
      counts[item.category] = (counts[item.category] || 0) + 1;
    });
    return counts;
  }, [listings]);

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <Spin size="large" tip="Loading marketplace..." />
      </div>
    );
  }

  return (
    <div className="marketplace-page">
      {/* Hero Section */}
      <div className="marketplace-hero">
        <div className="marketplace-hero-content">
          <Space align="center" size={12}>
            <AppstoreOutlined style={{ fontSize: 32, color: '#0062ff' }} />
            <div>
              <Title level={2} style={{ margin: 0 }}>
                Campus Marketplace
              </Title>
              <Text type="secondary">
                {listings.length} items available from your campus community
              </Text>
            </div>
          </Space>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="marketplace-filters">
        <Row gutter={[16, 16]} align="middle">
          <Col xs={24} sm={24} md={14} lg={16}>
            <Input
              placeholder="Search for items..."
              prefix={<SearchOutlined style={{ color: '#0062ff' }} />}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              allowClear
              size="large"
              className="search-input"
            />
          </Col>
          <Col xs={24} sm={24} md={10} lg={8}>
            <Select
              value={category}
              onChange={setCategory}
              size="large"
              style={{ width: '100%' }}
              suffixIcon={<FilterOutlined />}
              className="filter-select"
              options={[
                { value: 'all', label: `All Categories (${categoryCounts.all || 0})` },
                ...CATEGORIES.map((cat) => ({
                  value: cat,
                  label: `${cat} (${categoryCounts[cat] || 0})`,
                })),
              ]}
            />
          </Col>
        </Row>

        {/* Active filter tags */}
        {(search || category !== 'all') && (
          <div style={{ marginTop: 12 }}>
            <Space size={[8, 8]} wrap>
              <Text type="secondary" style={{ fontSize: 13 }}>Active filters:</Text>
              {search && (
                <Tag closable onClose={() => setSearch('')} color="blue">
                  Search: "{search}"
                </Tag>
              )}
              {category !== 'all' && (
                <Tag closable onClose={() => setCategory('all')} color={CATEGORY_COLORS[category]}>
                  {category}
                </Tag>
              )}
              <Text type="secondary" style={{ fontSize: 13 }}>
                ({filtered.length} result{filtered.length !== 1 ? 's' : ''})
              </Text>
            </Space>
          </div>
        )}
      </div>

      {/* Listings Grid */}
      {filtered.length === 0 ? (
        <div className="empty-state">
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description={
              <Space direction="vertical" size={4}>
                <Text strong style={{ fontSize: 16 }}>No listings found</Text>
                <Text type="secondary">
                  {search || category !== 'all'
                    ? 'Try adjusting your search or filters'
                    : 'Be the first to post something!'}
                </Text>
              </Space>
            }
          />
        </div>
      ) : (
        <Row gutter={[20, 20]} className="listings-grid">
          {filtered.map((listing) => (
            <Col key={listing.id} xs={24} sm={12} md={8} lg={6}>
              <ListingCard listing={listing} />
            </Col>
          ))}
        </Row>
      )}
    </div>
  );
};

export default MarketplacePage;
