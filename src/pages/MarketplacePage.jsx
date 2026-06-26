import { useState, useMemo } from 'react';
import { Input, Select, Row, Col, Empty, Spin, Typography, Space, Tag, Button, Grid } from 'antd';
import { 
  Search, Filter, PlusCircle, TrendingUp, Store,
  Cpu, BookOpen, Shirt, Sofa, Dumbbell, Pen, UtensilsCrossed, 
  Bus, Wrench, MoreHorizontal, LayoutGrid,
} from 'lucide-react';
import { useListings } from '../hooks/useListings';
import { useAuth } from '../context/AuthContext';
import ListingCard from '../components/ListingCard';
import { CATEGORIES, CATEGORY_COLORS } from '../utils/categories';
import { useNavigate } from 'react-router-dom';

const { Title, Text } = Typography;
const { useBreakpoint } = Grid;

const CATEGORY_ICONS = {
  'Electronics': Cpu,
  'Books & Notes': BookOpen,
  'Clothing': Shirt,
  'Furniture': Sofa,
  'Sports & Fitness': Dumbbell,
  'Stationery': Pen,
  'Food & Kitchen': UtensilsCrossed,
  'Transport': Bus,
  'Services': Wrench,
  'Other': MoreHorizontal,
};

const MarketplacePage = () => {
  const { listings, loading } = useListings();
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const screens = useBreakpoint();
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

  const sidebarContent = (
    <div className="marketplace-sidebar">
      <div className="sidebar-heading">Categories</div>
      <ul className="sidebar-cat-list">
        <li
          className={`sidebar-cat-item ${category === 'all' ? 'active' : ''}`}
          onClick={() => setCategory('all')}
        >
          <div className="sidebar-cat-icon" style={{ background: 'rgba(37, 99, 235, 0.06)' }}>
            <LayoutGrid size={16} color="#2563eb" />
          </div>
          <span>All Categories</span>
          <span className="sidebar-cat-count">{categoryCounts.all || 0}</span>
        </li>
        {CATEGORIES.map((cat) => {
          const IconComp = CATEGORY_ICONS[cat] || MoreHorizontal;
          const catColor = CATEGORY_COLORS[cat] || '#64748b';
          return (
            <li
              key={cat}
              className={`sidebar-cat-item ${category === cat ? 'active' : ''}`}
              onClick={() => setCategory(cat)}
            >
              <div className="sidebar-cat-icon" style={{ background: `${catColor}10` }}>
                <IconComp size={16} color={catColor} />
              </div>
              <span>{cat}</span>
              <span className="sidebar-cat-count">{categoryCounts[cat] || 0}</span>
            </li>
          );
        })}
      </ul>
    </div>
  );

  return (
    <div className="marketplace-page">
      <div className="marketplace-layout">
        {/* Sidebar — desktop only */}
        {screens.lg && sidebarContent}

        {/* Main content */}
        <div className="marketplace-main">
          {/* Header */}
          <div className="marketplace-header">
            <div className="marketplace-header-left">
              <div className="marketplace-header-title">{pageTitle}</div>
              <div className="marketplace-header-subtitle">
                Find great deals from students in your community.
              </div>
            </div>
            <Button
              type="primary"
              icon={<PlusCircle size={16} />}
              onClick={() => navigate('/add-listing')}
              className="sell-btn"
            >
              Sell Something
            </Button>
          </div>

          {/* Inline stats */}
          <div className="inline-stats">
            <div className="inline-stat">
              <div className="inline-stat-dot" style={{ background: '#2563eb' }} />
              <span className="inline-stat-label">Total Items</span>
              <span className="inline-stat-value">{listings.length}</span>
            </div>
            <div className="inline-stat">
              <div className="inline-stat-dot" style={{ background: '#16a34a' }} />
              <span className="inline-stat-label">Trending</span>
              <span className="inline-stat-value">{categoryCounts[category] || 0}</span>
            </div>
            <div className="inline-stat">
              <div className="inline-stat-dot" style={{ background: '#eab308' }} />
              <span className="inline-stat-label">Categories</span>
              <span className="inline-stat-value">{activeCategories.length}</span>
            </div>
          </div>

          {/* Category pills for mobile/tablet */}
          {!screens.lg && (
            <div className="marketplace-category-pills" style={{ marginBottom: 16 }}>
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
          )}

          {/* Search and filter */}
          <Row gutter={[16, 16]} align="middle" style={{ marginBottom: 24 }}>
            <Col xs={24} sm={24} md={16} lg={16}>
              <Input
                placeholder="Search for items, categories, etc."
                prefix={<Search size={16} color="#94a3b8" />}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                allowClear
                size="large"
                className="search-input"
              />
            </Col>
            <Col xs={24} sm={24} md={8} lg={8}>
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
            <div style={{ marginBottom: 20 }}>
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

          {/* Results bar */}
          <div className="results-bar">
            <span className="results-count">
              Showing {filtered.length} item{filtered.length !== 1 ? 's' : ''}
            </span>
            <div className="results-sort">
              <span>Sort by:</span>
              <Text strong style={{ fontSize: 13 }}>Newest</Text>
            </div>
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
                    className="sell-btn"
                    style={{ marginTop: 8 }}
                  >
                    Create First Listing
                  </Button>
                )}
              </Empty>
            </div>
          ) : (
            <Row gutter={[20, 20]}>
              {filtered.map((listing) => (
                <Col key={listing.id} xs={24} sm={12} md={8} lg={8}>
                  <ListingCard listing={listing} />
                </Col>
              ))}
            </Row>
          )}
        </div>
      </div>
    </div>
  );
};

export default MarketplacePage;
