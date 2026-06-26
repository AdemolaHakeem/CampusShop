import { useNavigate } from 'react-router-dom';
import { Typography, Button, Space, Row, Col } from 'antd';
import { MapPin, UserCheck, AlertTriangle, Eye, Phone, ShieldCheck } from 'lucide-react';
import Footer from '../components/Footer';
import logoIcon from '../assets/campusshopwordlogo.png';

const { Title, Text, Paragraph } = Typography;

const tips = [
  {
    icon: <MapPin size={24} />,
    title: 'Meet in Public Spaces',
    desc: 'Always meet at well-known campus locations like the library, student center, or cafeteria. Avoid private or isolated areas. Trade during daylight hours when possible.',
    color: '#2563eb',
  },
  {
    icon: <UserCheck size={24} />,
    title: 'Verify Student Identity',
    desc: 'You\'re trading with fellow students. If something feels off, ask to see a student ID or verify they attend the same university. Trust your instincts.',
    color: '#16a34a',
  },
  {
    icon: <Eye size={24} />,
    title: 'Inspect Before Paying',
    desc: 'Always inspect items thoroughly before paying. Check that electronics work, textbooks are the correct edition, and items match the listing description and photos.',
    color: '#8b5cf6',
  },
  {
    icon: <AlertTriangle size={24} />,
    title: 'Avoid Wire Transfers',
    desc: 'Pay in person when you collect the item. Avoid sending money before meeting. If a deal seems too good to be true, it probably is.',
    color: '#ef4444',
  },
  {
    icon: <Phone size={24} />,
    title: 'Keep Communication on WhatsApp',
    desc: 'Use the WhatsApp contact provided on each listing. Keep a record of your conversations. Don\'t share personal banking details unnecessarily.',
    color: '#ea580c',
  },
  {
    icon: <ShieldCheck size={24} />,
    title: 'Report Suspicious Activity',
    desc: 'If you encounter fake listings, scam attempts, or inappropriate behavior, report it immediately through our Contact page. We take every report seriously.',
    color: '#0891b2',
  },
];

const SafetyTipsPage = () => {
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
          <Text className="section-tag">STAY SAFE</Text>
          <Title level={1} className="static-page-title">Safety Tips</Title>
          <Paragraph className="static-page-subtitle">
            Your safety is our priority. Follow these guidelines to trade safely on CampusShop.
          </Paragraph>
        </div>

        <Row gutter={[24, 24]}>
          {tips.map((tip, i) => (
            <Col key={i} xs={24} sm={12}>
              <div className="safety-tip-card">
                <div className="safety-tip-icon" style={{ background: `${tip.color}10`, color: tip.color }}>
                  {tip.icon}
                </div>
                <div>
                  <Title level={4} style={{ marginBottom: 8 }}>{tip.title}</Title>
                  <Paragraph type="secondary" style={{ fontSize: 14, lineHeight: 1.7, marginBottom: 0 }}>
                    {tip.desc}
                  </Paragraph>
                </div>
              </div>
            </Col>
          ))}
        </Row>

        <div className="help-cta-card" style={{ marginTop: 48 }}>
          <Title level={3} style={{ marginBottom: 8 }}>Need to report something?</Title>
          <Paragraph type="secondary" style={{ marginBottom: 24 }}>
            If you've encountered suspicious behavior or feel unsafe, reach out to us immediately.
          </Paragraph>
          <Button type="primary" size="large" onClick={() => navigate('/contact')} className="hero-btn-primary">
            Report an Issue
          </Button>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default SafetyTipsPage;
