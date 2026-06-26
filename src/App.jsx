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
import FAQPage from './pages/FAQPage';
import ContactPage from './pages/ContactPage';
import AboutPage from './pages/AboutPage';
import HelpCenterPage from './pages/HelpCenterPage';
import SafetyTipsPage from './pages/SafetyTipsPage';
import TermsPage from './pages/TermsPage';
import PrivacyPage from './pages/PrivacyPage';
import CommunityGuidelinesPage from './pages/CommunityGuidelinesPage';
import HowItWorksPage from './pages/HowItWorksPage';

const { Content } = Layout;

const AppContent = () => {
  const { currentUser } = useAuth();
  const location = useLocation();

  // Pages that should NOT show the navbar
  const noNavbarRoutes = [
    '/', '/login', '/signup', '/reset-password',
    '/faq', '/contact', '/about', '/help', '/safety',
    '/terms', '/privacy', '/community-guidelines', '/how-it-works',
  ];
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
          <Route path="/faq" element={<FAQPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/help" element={<HelpCenterPage />} />
          <Route path="/safety" element={<SafetyTipsPage />} />
          <Route path="/terms" element={<TermsPage />} />
          <Route path="/privacy" element={<PrivacyPage />} />
          <Route path="/community-guidelines" element={<CommunityGuidelinesPage />} />
          <Route path="/how-it-works" element={<HowItWorksPage />} />
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
          colorPrimary: '#1a1f36',
          colorBgContainer: '#ffffff',
          colorBgElevated: '#ffffff',
          colorBgLayout: '#f8f9fb',
          borderRadius: 12,
          fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
          colorText: '#0f172a',
          colorTextSecondary: '#64748b',
          colorBorder: '#e2e8f0',
          colorBorderSecondary: '#f1f5f9',
        },
        components: {
          Button: {
            primaryShadow: '0 4px 14px rgba(26, 31, 54, 0.2)',
          },
          Card: {
            colorBgContainer: '#ffffff',
          },
          Input: {
            colorBgContainer: '#f4f5f8',
            activeBorderColor: '#2563eb',
            hoverBorderColor: 'rgba(37, 99, 235, 0.3)',
          },
          Select: {
            colorBgContainer: '#f4f5f8',
          },
          Menu: {
            itemSelectedBg: 'rgba(37, 99, 235, 0.06)',
            itemSelectedColor: '#2563eb',
            colorBgContainer: 'transparent',
          },
          Layout: {
            headerBg: '#f8f9fb',
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
