import { useNavigate, useLocation, Link } from 'react-router-dom';
import { Layout, Menu, Typography, Avatar, Dropdown, Space, Grid } from 'antd';
import {
  Store,
  PlusCircle,
  List,
  LogOut,
  User,
  Search,
  Bell,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { logoutUser } from '../services/auth';
import logoIcon from '../assets/campusshopwordlogo.png';

const { Header } = Layout;
const { Text } = Typography;
const { useBreakpoint } = Grid;

const Navbar = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const screens = useBreakpoint();

  const handleLogout = async () => {
    await logoutUser();
    navigate('/login');
  };

  if (!currentUser) return null;

  const menuItems = [
    {
      key: '/market',
      icon: <Store size={16} />,
      label: 'Marketplace',
    },
    {
      key: '/add-listing',
      icon: <PlusCircle size={16} />,
      label: 'Sell Item',
    },
    {
      key: '/my-listings',
      icon: <List size={16} />,
      label: 'My Listings',
    },
  ];

  const userMenuItems = [
    {
      key: 'profile',
      label: (
        <Space direction="vertical" size={0}>
          <Text strong>{currentUser.displayName}</Text>
          <Text type="secondary" style={{ fontSize: 12 }}>{currentUser.email}</Text>
        </Space>
      ),
      disabled: true,
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
    <Header className="navbar">
      <Link to="/market" className="navbar-brand">
        <img 
          src={logoIcon} 
          alt="CampusShop Logo" 
          style={{ 
            height: 40, 
            objectFit: 'contain',
            transition: 'transform 0.2s ease',
          }} 
          className="logo-img-hover"
        />
      </Link>

      <Menu
        mode="horizontal"
        selectedKeys={[location.pathname]}
        items={menuItems}
        onClick={({ key }) => navigate(key)}
        className="navbar-menu"
        style={{ flex: 1, minWidth: 0, border: 'none', background: 'transparent' }}
      />

      <div className="navbar-extras">
        {screens.md && (
          <div className="navbar-search" onClick={() => {}}>
            <Search size={14} />
            <span>Search for items, categories, etc.</span>
          </div>
        )}
        <button className="navbar-bell" onClick={() => {}}>
          <Bell size={18} />
        </button>
      </div>

      <Dropdown menu={{ items: userMenuItems }} placement="bottomRight" trigger={['click']}>
        <div className="navbar-avatar">
          <Avatar
            size={36}
            icon={<User size={18} />}
            style={{ background: '#1a1f36', cursor: 'pointer' }}
          />
        </div>
      </Dropdown>
    </Header>
  );
};

export default Navbar;
