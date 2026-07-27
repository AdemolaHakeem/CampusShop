import { useState } from 'react';
import { useNavigate, useLocation, Outlet } from 'react-router-dom';
import { Layout, Menu, Typography, Avatar, Dropdown, Space } from 'antd';
import {
  LayoutDashboard,
  ShoppingBag,
  Users,
  Building2,
  ChevronLeft,
  ChevronRight,
  LogOut,
  User,
  ArrowLeft,
  AlertTriangle,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { logoutUser } from '../../services/auth';

const { Sider, Content, Header } = Layout;
const { Text } = Typography;

const AdminLayout = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);

  const handleLogout = async () => {
    await logoutUser();
    navigate('/login');
  };

  const menuItems = [
    {
      key: '/admin',
      icon: <LayoutDashboard size={18} />,
      label: 'Dashboard',
    },
    {
      key: '/admin/listings',
      icon: <ShoppingBag size={18} />,
      label: 'Listings',
    },
    {
      key: '/admin/users',
      icon: <Users size={18} />,
      label: 'Users',
    },
    {
      key: '/admin/campuses',
      icon: <Building2 size={18} />,
      label: 'Campuses',
    },
    {
      key: '/admin/reports',
      icon: <AlertTriangle size={18} />,
      label: 'Reports',
    },
  ];

  const userMenuItems = [
    {
      key: 'profile',
      label: (
        <Space direction="vertical" size={0}>
          <Text strong>{currentUser?.displayName}</Text>
          <Text type="secondary" style={{ fontSize: 12 }}>{currentUser?.email}</Text>
          <Text type="secondary" style={{ fontSize: 11, textTransform: 'capitalize', color: '#2563eb' }}>
            {currentUser?.role?.replace('_', ' ')}
          </Text>
        </Space>
      ),
      disabled: true,
    },
    { type: 'divider' },
    {
      key: 'marketplace',
      icon: <ArrowLeft size={14} />,
      label: 'Back to Marketplace',
      onClick: () => navigate('/market'),
    },
    { type: 'divider' },
    {
      key: 'logout',
      icon: <LogOut size={14} />,
      label: 'Sign Out',
      danger: true,
      onClick: handleLogout,
    },
  ];

  return (
    <Layout style={{ minHeight: '100vh', background: '#f8f9fb' }}>
      <Sider
        width={240}
        collapsedWidth={64}
        collapsed={collapsed}
        onCollapse={setCollapsed}
        style={{
          background: '#0f172a',
          position: 'fixed',
          left: 0,
          top: 0,
          bottom: 0,
          zIndex: 100,
          overflow: 'auto',
          borderRight: '1px solid rgba(255,255,255,0.06)',
        }}
      >
        {/* Brand */}
        <div
          style={{
            height: 64,
            display: 'flex',
            alignItems: 'center',
            justifyContent: collapsed ? 'center' : 'flex-start',
            padding: collapsed ? 0 : '0 20px',
            borderBottom: '1px solid rgba(255,255,255,0.06)',
            cursor: 'pointer',
          }}
          onClick={() => navigate('/admin')}
        >
          <div
            style={{
              width: 32,
              height: 32,
              borderRadius: 8,
              background: '#2563eb',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fff',
              fontWeight: 700,
              fontSize: 14,
              flexShrink: 0,
            }}
          >
            CS
          </div>
          {!collapsed && (
            <div style={{ marginLeft: 12 }}>
              <Text style={{ color: '#fff', fontWeight: 700, fontSize: 15, display: 'block', lineHeight: 1.2 }}>
                CampusShop
              </Text>
              <Text style={{ color: 'rgba(255,255,255,0.45)', fontSize: 11, display: 'block' }}>
                Admin Panel
              </Text>
            </div>
          )}
        </div>

        {/* Navigation */}
        <Menu
          mode="inline"
          selectedKeys={[location.pathname]}
          items={menuItems}
          onClick={({ key }) => navigate(key)}
          style={{
            background: 'transparent',
            border: 'none',
            marginTop: 12,
          }}
          theme="dark"
        />

        {/* Collapse toggle */}
        <div
          onClick={() => setCollapsed(!collapsed)}
          style={{
            position: 'absolute',
            bottom: 16,
            left: '50%',
            transform: 'translateX(-50%)',
            width: 32,
            height: 32,
            borderRadius: 8,
            background: 'rgba(255,255,255,0.06)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            color: 'rgba(255,255,255,0.45)',
            transition: 'all 0.2s',
          }}
        >
          {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </div>
      </Sider>

      {/* Main area */}
      <Layout style={{ marginLeft: collapsed ? 64 : 240, transition: 'margin-left 0.2s' }}>
        {/* Top bar */}
        <Header
          style={{
            background: 'rgba(255,255,255,0.85)',
            backdropFilter: 'blur(12px)',
            borderBottom: '1px solid #e2e8f0',
            padding: '0 24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            height: 64,
            position: 'sticky',
            top: 0,
            zIndex: 50,
          }}
        >
          <Text style={{ fontSize: 13, color: '#64748b' }}>
            {menuItems.find(m => m.key === location.pathname)?.label || 'Admin'}
          </Text>

          <Dropdown menu={{ items: userMenuItems }} placement="bottomRight" trigger={['click']}>
            <div style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8 }}>
              <Avatar size={34} icon={<User size={16} />} style={{ background: '#1a1f36' }} />
            </div>
          </Dropdown>
        </Header>

        {/* Page content */}
        <Content style={{ padding: 24 }}>
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
};

export default AdminLayout;
