import { useNavigate } from 'react-router-dom';
import { Typography, Button, Space, Row, Col } from 'antd';
import { Heart, Target, Eye, Users, Rocket, Globe } from 'lucide-react';
import Footer from '../components/Footer';
import logoIcon from '../assets/campusshopwordlogo.png';

const { Title, Text, Paragraph } = Typography;

const values = [
  {
    icon: <Heart size={24} />,
    title: 'Student-First',
    desc: 'Every decision we make puts students at the center. CampusShop is built by understanding real student needs.',
    color: '#ef4444',
  },
  {
    icon: <Users size={24} />,
    title: 'Community-Driven',
    desc: 'We believe in the power of campus communities. Trading should be local, trusted, and personal.',
    color: '#2563eb',
  },
  {
    icon: <Target size={24} />,
    title: 'Simplicity',
    desc: 'No complicated processes. List in 30 seconds, connect via WhatsApp, trade on campus. That simple.',
    color: '#16a34a',
  },
  {
    icon: <Eye size={24} />,
    title: 'Transparency',
    desc: 'No hidden fees, no commissions, no surprises. What you see is what you get — always.',
    color: '#8b5cf6',
  },
  {
    icon: <Rocket size={24} />,
    title: 'Innovation',
    desc: 'We\'re constantly improving CampusShop to make campus commerce faster, safer, and more enjoyable.',
    color: '#ea580c',
  },
  {
    icon: <Globe size={24} />,
    title: 'Accessibility',
    desc: 'Works on any device, any browser, any network. CampusShop is designed for every Nigerian student.',
    color: '#0891b2',
  },
];

const AboutPage = () => {
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
          <Text className="section-tag">OUR STORY</Text>
          <Title level={1} className="static-page-title">About CampusShop</Title>
          <Paragraph className="static-page-subtitle">
            Building the future of campus commerce in Nigeria, one university at a time.
          </Paragraph>
        </div>

        <div className="about-story">
          <div className="about-story-card">
            <Title level={3} style={{ marginBottom: 16 }}>Why CampusShop?</Title>
            <Paragraph style={{ fontSize: 15, lineHeight: 1.8, color: 'var(--text-secondary)' }}>
              Every semester, thousands of Nigerian university students need to buy textbooks, electronics, furniture, 
              and everyday items — while others have exactly those items sitting unused. The problem? There was no trusted, 
              student-only platform to connect them.
            </Paragraph>
            <Paragraph style={{ fontSize: 15, lineHeight: 1.8, color: 'var(--text-secondary)' }}>
              Random marketplaces are risky. Social media posts get buried. Notice boards are outdated. 
              Students deserved something better — a dedicated space where campus commerce is safe, simple, 
              and community-driven.
            </Paragraph>
            <Paragraph style={{ fontSize: 15, lineHeight: 1.8, color: 'var(--text-secondary)' }}>
              That's why we built <strong>CampusShop</strong>. A marketplace designed exclusively for Nigerian 
              university students, where every user is a verified student, every transaction happens on campus, 
              and every interaction is just a WhatsApp message away.
            </Paragraph>
          </div>

          <div className="about-story-card">
            <Title level={3} style={{ marginBottom: 16 }}>Our Vision</Title>
            <Paragraph style={{ fontSize: 15, lineHeight: 1.8, color: 'var(--text-secondary)' }}>
              We envision a Nigeria where every university campus has a thriving, trusted marketplace that makes 
              student life more affordable and connected. CampusShop isn't just about buying and selling — it's 
              about building campus communities where students help each other.
            </Paragraph>
            <Paragraph style={{ fontSize: 15, lineHeight: 1.8, color: 'var(--text-secondary)' }}>
              Starting with the top universities, we're expanding across the country to reach every campus, 
              every student, and every community. Because great campus commerce shouldn't be limited to a 
              few schools.
            </Paragraph>
          </div>
        </div>

        <div className="about-values-section">
          <div className="section-header" style={{ marginBottom: 48 }}>
            <Text className="section-tag">WHAT WE STAND FOR</Text>
            <Title level={2} className="section-title">Our Values</Title>
          </div>
          <Row gutter={[24, 24]}>
            {values.map((v, i) => (
              <Col key={i} xs={24} sm={12} md={8}>
                <div className="about-value-card">
                  <div className="about-value-icon" style={{ background: `${v.color}10`, color: v.color }}>
                    {v.icon}
                  </div>
                  <Title level={4} style={{ marginBottom: 8 }}>{v.title}</Title>
                  <Paragraph type="secondary" style={{ fontSize: 14, lineHeight: 1.7 }}>{v.desc}</Paragraph>
                </div>
              </Col>
            ))}
          </Row>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default AboutPage;
