import { useNavigate, useLocation, Link } from 'react-router-dom';
import { Layout, Menu, Typography, Avatar, Dropdown, Space, Grid } from 'antd';
import {
  Store,
  PlusCircle,
  List,
  LogOut,
  User,
  Menu as MenuIcon,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { logoutUser } from '../services/auth';
import logoIcon from '../assets/CampusShop2.0.png';

const { Header } = Layout;
const { Text } = Typography;
const { useBreakpoint } = Grid;

const iconStyle = { fontSize: 16, display: 'inline-flex', alignItems: 'center' };

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
            width: 40, 
            objectFit: 'contain',
            transition: 'transform 0.2s ease',
          }} 
          className="logo-img-hover"
        />
        {screens.sm && <span className="logo-text">CampusShop</span>}
      </Link>

      <Menu
        mode="horizontal"
        selectedKeys={[location.pathname]}
        items={menuItems}
        onClick={({ key }) => navigate(key)}
        className="navbar-menu"
        style={{ flex: 1, minWidth: 0, border: 'none', background: 'transparent' }}
      />

      <Dropdown menu={{ items: userMenuItems }} placement="bottomRight" trigger={['click']}>
        <div className="navbar-avatar">
          <Avatar
            size={36}
            icon={<User size={18} />}
            style={{ background: 'linear-gradient(135deg, #0062ff 0%, #0fb659 100%)', cursor: 'pointer' }}
          />
        </div>
      </Dropdown>
    </Header>
  );
};

export default Navbar;
