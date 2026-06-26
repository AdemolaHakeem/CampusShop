import { useNavigate } from 'react-router-dom';
import { Typography, Button, Space, Row, Col } from 'antd';
import { BookOpen, ShoppingCart, Tag, Shield, Settings, HelpCircle } from 'lucide-react';
import Footer from '../components/Footer';
import logoIcon from '../assets/campusshopwordlogo.png';

const { Title, Text, Paragraph } = Typography;

const topics = [
  {
    icon: <BookOpen size={28} />,
    title: 'Getting Started',
    desc: 'New to CampusShop? Learn how to create your account, set up your profile, and start trading.',
    link: '/faq',
    color: '#2563eb',
  },
  {
    icon: <ShoppingCart size={28} />,
    title: 'Buying Guide',
    desc: 'How to search, filter, contact sellers, and make safe purchases on campus.',
    link: '/faq',
    color: '#16a34a',
  },
  {
    icon: <Tag size={28} />,
    title: 'Selling Guide',
    desc: 'List items quickly, write great descriptions, take good photos, and attract buyers.',
    link: '/faq',
    color: '#8b5cf6',
  },
  {
    icon: <Shield size={28} />,
    title: 'Safety & Trust',
    desc: 'Stay safe while trading. Best practices for meeting, paying, and verifying student identity.',
    link: '/safety',
    color: '#ef4444',
  },
  {
    icon: <Settings size={28} />,
    title: 'Account Settings',
    desc: 'Manage your profile, update your information, reset your password, and more.',
    link: '/faq',
    color: '#ea580c',
  },
  {
    icon: <HelpCircle size={28} />,
    title: 'Troubleshooting',
    desc: 'Having issues? Find solutions to common problems and learn how to contact support.',
    link: '/contact',
    color: '#0891b2',
  },
];

const HelpCenterPage = () => {
  const navigate = useNavigate();

  return (
    <div className="static-page">
      <nav className="landing-nav">
        <div className="landing-nav-inner">
          <div className="landing-nav-brand" onClick={() => navigate('/')} style={{ cursor: 'pointer' }}>
            <img src={logoIcon} alt="CampusShop Logo" style={{ height: 46, objectFit: 'contain' }} />
          </div>
          <Space size={12}>
            <Button type="text" onClick={() => navigate('/login')} className="landing-nav-link">Sign In</Button>
            <Button type="primary" onClick={() => navigate('/signup')} className="landing-nav-cta">Get Started</Button>
          </Space>
        </div>
      </nav>

      <div className="static-page-content">
        <div className="static-page-header">
          <Text className="section-tag">SUPPORT</Text>
          <Title level={1} className="static-page-title">Help Center</Title>
          <Paragraph className="static-page-subtitle">
            Everything you need to know about using CampusShop. Choose a topic below to get started.
          </Paragraph>
        </div>

        <Row gutter={[24, 24]} className="help-topics-grid">
          {topics.map((topic, i) => (
            <Col key={i} xs={24} sm={12} md={8}>
              <div
                className="help-topic-card"
                onClick={() => navigate(topic.link)}
                role="button"
                tabIndex={0}
              >
                <div className="help-topic-icon" style={{ background: `${topic.color}10`, color: topic.color }}>
                  {topic.icon}
                </div>
                <Title level={4} style={{ marginBottom: 8 }}>{topic.title}</Title>
                <Paragraph type="secondary" style={{ fontSize: 14, lineHeight: 1.6, marginBottom: 0 }}>
                  {topic.desc}
                </Paragraph>
              </div>
            </Col>
          ))}
        </Row>

        <div className="help-cta-card">
          <Title level={3} style={{ marginBottom: 8 }}>Still need help?</Title>
          <Paragraph type="secondary" style={{ marginBottom: 24 }}>
            Can't find what you're looking for? Our support team is here to help.
          </Paragraph>
          <Space size={16}>
            <Button type="primary" size="large" onClick={() => navigate('/contact')} className="hero-btn-primary">
              Contact Support
            </Button>
            <Button size="large" onClick={() => navigate('/faq')} className="hero-btn-secondary">
              Browse FAQs
            </Button>
          </Space>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default HelpCenterPage;
