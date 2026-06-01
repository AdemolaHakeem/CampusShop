import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { ConfigProvider, Layout } from 'antd';
import { AuthProvider, useAuth } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Navbar from './components/Navbar';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import MarketplacePage from './pages/MarketplacePage';
import AddListingPage from './pages/AddListingPage';
import MyListingsPage from './pages/MyListingsPage';
import ResetPasswordPage from './pages/ResetPasswordPage';

const { Content } = Layout;

const AppContent = () => {
  const { currentUser } = useAuth();
  const location = useLocation();

  // Pages that should NOT show the navbar
  const noNavbarRoutes = ['/', '/login', '/signup', '/reset-password'];
  const showNavbar = currentUser && !noNavbarRoutes.includes(location.pathname);

  return (
    <Layout className="app-layout">
      {showNavbar && <Navbar />}
      <Content className="app-content">
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />
          <Route
            path="/market"
            element={
              <ProtectedRoute>
                <MarketplacePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/add-listing"
            element={
              <ProtectedRoute>
                <AddListingPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/my-listings"
            element={
              <ProtectedRoute>
                <MyListingsPage />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Content>
    </Layout>
  );
};

const App = () => {
  return (
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: '#0062ff',
          colorBgContainer: '#ffffff',
          colorBgElevated: '#ffffff',
          colorBgLayout: '#f5f6fa',
          borderRadius: 12,
          fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
        },
        components: {
          Button: {
            primaryShadow: '0 4px 14px rgba(0, 98, 255, 0.25)',
          },
          Card: {
            colorBgContainer: '#ffffff',
          },
          Input: {
            colorBgContainer: '#f5f6fa',
            activeBorderColor: '#0062ff',
          },
          Select: {
            colorBgContainer: '#f5f6fa',
          },
          Menu: {
            itemSelectedBg: 'rgba(0, 98, 255, 0.08)',
            itemSelectedColor: '#0062ff',
            colorBgContainer: 'transparent',
          },
          Layout: {
            headerBg: '#ffffff',
          },
        },
      }}
    >
      <AuthProvider>
        <BrowserRouter>
          <AppContent />
        </BrowserRouter>
      </AuthProvider>
    </ConfigProvider>
  );
};

export default App;
