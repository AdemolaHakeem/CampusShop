import { useState, useMemo } from 'react';
import { Input, Select, Row, Col, Empty, Spin, Typography, Space, Tag, Statistic, Button } from 'antd';
import { Search, Filter, LayoutGrid, PlusCircle, Tag as TagIcon, TrendingUp, Store } from 'lucide-react';
import { useListings } from '../hooks/useListings';
import { useAuth } from '../context/AuthContext';
import ListingCard from '../components/ListingCard';
import { CATEGORIES, CATEGORY_COLORS } from '../utils/categories';
import { useNavigate } from 'react-router-dom';

const { Title, Text } = Typography;

const MarketplacePage = () => {
  const { listings, loading } = useListings();
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('all');

  const campusName = currentUser?.campusName;
  const pageTitle = campusName ? `${campusName} Marketplace` : 'Campus Marketplace';

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

  const activeCategories = useMemo(() => {
    return CATEGORIES.filter((c) => (categoryCounts[c] || 0) > 0);
  }, [categoryCounts]);

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
        <div className="marketplace-hero-bg" />
        <div className="marketplace-hero-content">
          <Space align="center" size={14} className="marketplace-hero-title-row">
            <div className="marketplace-hero-icon">
              <Store size={24} color="#fff" />
            </div>
            <div>
              <Title level={2} className="marketplace-hero-title">
                {pageTitle}
              </Title>
              <Text className="marketplace-hero-subtitle">
                {listings.length} item{listings.length !== 1 ? 's' : ''} available — find your next deal
              </Text>
            </div>
          </Space>
        </div>
      </div>

      {/* Stats Row */}
      <div className="marketplace-stats-row">
        <Row gutter={[16, 16]}>
          <Col xs={12} sm={6}>
            <div className="marketplace-stat-card">
              <Statistic
                title="Total Items"
                value={listings.length}
                prefix={<Store size={16} color="#0062ff" />}
                valueStyle={{ color: 'var(--text-primary)', fontWeight: 700 }}
              />
            </div>
          </Col>
          <Col xs={12} sm={6}>
            <div className="marketplace-stat-card">
              <Statistic
                title="Categories"
                value={activeCategories.length}
                prefix={<TagIcon size={16} color="#0fb659" />}
                valueStyle={{ color: 'var(--text-primary)', fontWeight: 700 }}
              />
            </div>
          </Col>
          <Col xs={12} sm={6}>
            <div className="marketplace-stat-card">
              <Statistic
                title="Trending"
                value={categoryCounts[category] || 0}
                prefix={<TrendingUp size={16} color="#f093fb" />}
                valueStyle={{ color: 'var(--text-primary)', fontWeight: 700 }}
              />
            </div>
          </Col>
          <Col xs={12} sm={6}>
            <div className="marketplace-stat-card marketplace-stat-card-accent">
              <Statistic
                title="Sell Something"
                value=""
                prefix={<PlusCircle size={16} color="#fff" />}
                valueStyle={{ color: '#fff', fontWeight: 700, fontSize: 0 }}
              />
              <Button
                type="link"
                className="marketplace-stat-cta"
                onClick={() => navigate('/add-listing')}
              >
                Post an item →
              </Button>
            </div>
          </Col>
        </Row>
      </div>

      {/* Category Pills */}
      <div className="marketplace-filters">
        <div className="marketplace-category-pills">
          <Tag
            className={`marketplace-pill ${category === 'all' ? 'marketplace-pill-active' : ''}`}
            onClick={() => setCategory('all')}
            style={{ cursor: 'pointer', marginBottom: 8 }}
          >
            All ({categoryCounts.all || 0})
          </Tag>
          {CATEGORIES.map((cat) => (
            <Tag
              key={cat}
              className={`marketplace-pill ${category === cat ? 'marketplace-pill-active' : ''}`}
              color={category === cat ? CATEGORY_COLORS[cat] : undefined}
              onClick={() => setCategory(cat)}
              style={{ cursor: 'pointer', marginBottom: 8 }}
            >
              {cat} ({categoryCounts[cat] || 0})
            </Tag>
          ))}
        </div>

        <Row gutter={[16, 16]} align="middle" style={{ marginTop: 16 }}>
          <Col xs={24} sm={24} md={14} lg={16}>
            <Input
              placeholder="Search for items..."
              prefix={<Search size={16} color="#0062ff" />}
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
              suffixIcon={<Filter size={14} />}
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
          >
            {!search && category === 'all' && (
              <Button
                type="primary"
                icon={<PlusCircle size={16} />}
                onClick={() => navigate('/add-listing')}
                className="hero-btn-primary"
                style={{ marginTop: 8 }}
              >
                Create First Listing
              </Button>
            )}
          </Empty>
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
