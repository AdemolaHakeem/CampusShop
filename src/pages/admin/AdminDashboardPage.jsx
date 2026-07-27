import { useEffect, useState } from 'react';
import { Row, Col, Card, Statistic, Typography, Spin, Tag, Space, Table } from 'antd';
import {
  ShoppingBag,
  Users,
  TrendingUp,
  DollarSign,
  AlertTriangle,
  CheckCircle,
  Clock,
} from 'lucide-react';
import { supabase } from '../../services/supabase';
import { useAuth } from '../../context/AuthContext';

const { Title, Text } = Typography;

const AdminDashboardPage = () => {
  const { currentUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalListings: 0,
    activeListings: 0,
    soldListings: 0,
    totalUsers: 0,
    totalCampuses: 0,
    recentListings: [],
    topCampuses: [],
    categoryBreakdown: [],
  });

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    setLoading(true);
    try {
      const [
        { count: totalListings },
        { count: activeListings },
        { count: soldListings },
        { count: totalUsers },
        { count: totalCampuses },
        { data: recentListings },
      ] = await Promise.all([
        supabase.from('listings').select('*', { count: 'exact', head: true }),
        supabase.from('listings').select('*', { count: 'exact', head: true }).eq('status', 'active'),
        supabase.from('listings').select('*', { count: 'exact', head: true }).eq('status', 'sold'),
        supabase.from('profiles').select('*', { count: 'exact', head: true }),
        supabase.from('campuses').select('*', { count: 'exact', head: true }),
        supabase
          .from('listings')
          .select('id, title, price, category, status, created_at, seller_name, campus_id')
          .order('created_at', { ascending: false })
          .limit(10),
      ]);

      // Get top campuses by listing count
      const { data: campusData } = await supabase
        .from('listings')
        .select('campus_id, campuses!inner(name)')
        .not('campus_id', 'is', null);

      const campusCount = {};
      (campusData || []).forEach((l) => {
        const name = l.campuses?.name || 'Unknown';
        campusCount[name] = (campusCount[name] || 0) + 1;
      });

      const topCampuses = Object.entries(campusCount)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 10)
        .map(([name, count]) => ({ name, count }));

      // Category breakdown
      const { data: catData } = await supabase
        .from('listings')
        .select('category, status')
        .eq('status', 'active');

      const catCount = {};
      (catData || []).forEach((l) => {
        catCount[l.category] = (catCount[l.category] || 0) + 1;
      });

      const categoryBreakdown = Object.entries(catCount)
        .sort(([, a], [, b]) => b - a)
        .map(([category, count]) => ({ category, count }));

      setStats({
        totalListings: totalListings || 0,
        activeListings: activeListings || 0,
        soldListings: soldListings || 0,
        totalUsers: totalUsers || 0,
        totalCampuses: totalCampuses || 0,
        recentListings: (recentListings || []).map((l) => ({
          key: l.id,
          title: l.title,
          price: l.price,
          category: l.category,
          status: l.status,
          seller: l.seller_name,
          created: new Date(l.created_at).toLocaleDateString(),
        })),
        topCampuses,
        categoryBreakdown,
      });
    } catch (err) {
      console.error('Error loading admin stats:', err);
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

  const recentColumns = [
    { title: 'Title', dataIndex: 'title', key: 'title', ellipsis: true },
    { title: 'Price', dataIndex: 'price', key: 'price', render: (p) => `₦${Number(p).toLocaleString()}` },
    { title: 'Category', dataIndex: 'category', key: 'category' },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (s) => (
        <Tag color={s === 'active' ? 'green' : s === 'sold' ? 'default' : 'blue'}>{s}</Tag>
      ),
    },
    { title: 'Seller', dataIndex: 'seller', key: 'seller' },
    { title: 'Posted', dataIndex: 'created', key: 'created' },
  ];

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <Title level={4} style={{ margin: 0, color: '#0f172a' }}>Welcome back, {currentUser?.displayName || 'Admin'}</Title>
        <Text type="secondary">Here's what's happening across CampusShop</Text>
      </div>

      {/* Stat cards */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={12} sm={12} md={6}>
          <Card
            style={{
              borderRadius: 12,
              border: '1px solid #e2e8f0',
              boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
            }}
          >
            <Statistic
              title="Total Listings"
              value={stats.totalListings}
              prefix={<ShoppingBag size={18} style={{ color: '#2563eb', marginRight: 6 }} />}
              valueStyle={{ fontSize: 28, fontWeight: 700, color: '#0f172a' }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={12} md={6}>
          <Card
            style={{
              borderRadius: 12,
              border: '1px solid #e2e8f0',
              boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
            }}
          >
            <Statistic
              title="Active Listings"
              value={stats.activeListings}
              prefix={<CheckCircle size={18} style={{ color: '#16a34a', marginRight: 6 }} />}
              valueStyle={{ fontSize: 28, fontWeight: 700, color: '#0f172a' }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={12} md={6}>
          <Card
            style={{
              borderRadius: 12,
              border: '1px solid #e2e8f0',
              boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
            }}
          >
            <Statistic
              title="Sold Items"
              value={stats.soldListings}
              prefix={<DollarSign size={18} style={{ color: '#f59e0b', marginRight: 6 }} />}
              valueStyle={{ fontSize: 28, fontWeight: 700, color: '#0f172a' }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={12} md={6}>
          <Card
            style={{
              borderRadius: 12,
              border: '1px solid #e2e8f0',
              boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
            }}
          >
            <Statistic
              title="Total Users"
              value={stats.totalUsers}
              prefix={<Users size={18} style={{ color: '#8b5cf6', marginRight: 6 }} />}
              valueStyle={{ fontSize: 28, fontWeight: 700, color: '#0f172a' }}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]}>
        {/* Recent listings */}
        <Col xs={24} lg={16}>
          <Card
            title={
              <Space>
                <Clock size={16} />
                <span>Recent Listings</span>
              </Space>
            }
            style={{
              borderRadius: 12,
              border: '1px solid #e2e8f0',
              boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
            }}
          >
            <Table
              dataSource={stats.recentListings}
              columns={recentColumns}
              pagination={false}
              size="small"
            />
          </Card>
        </Col>

        {/* Right column */}
        <Col xs={24} lg={8}>
          {/* Top campuses */}
          <Card
            title={
              <Space>
                <TrendingUp size={16} />
                <span>Top Campuses</span>
              </Space>
            }
            style={{
              borderRadius: 12,
              border: '1px solid #e2e8f0',
              boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
              marginBottom: 16,
            }}
          >
            {stats.topCampuses.slice(0, 5).map((campus, i) => (
              <div
                key={campus.name}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '8px 0',
                  borderBottom: i < 4 ? '1px solid #f1f5f9' : 'none',
                }}
              >
                <Text style={{ fontSize: 13, color: '#0f172a' }}>{campus.name}</Text>
                <Tag style={{ margin: 0 }}>{campus.count}</Tag>
              </div>
            ))}
          </Card>

          {/* Category breakdown */}
          <Card
            title={
              <Space>
                <ShoppingBag size={16} />
                <span>Categories</span>
              </Space>
            }
            style={{
              borderRadius: 12,
              border: '1px solid #e2e8f0',
              boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
            }}
          >
            {stats.categoryBreakdown.slice(0, 8).map((cat, i) => (
              <div
                key={cat.category}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '6px 0',
                  borderBottom: i < 7 ? '1px solid #f1f5f9' : 'none',
                }}
              >
                <Text style={{ fontSize: 13, color: '#0f172a' }}>{cat.category}</Text>
                <Tag style={{ margin: 0 }}>{cat.count}</Tag>
              </div>
            ))}
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default AdminDashboardPage;
