import { useNavigate } from 'react-router-dom';
import { Button, Typography, Row, Col, Space, Card } from 'antd';
import {
  Shield,
  Zap,
  Users,
  MessageCircle,
  Search,
  PlusCircle,
  ArrowRight,
  CheckCircle,
  Star,
  Rocket,
  CircleCheck,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import logoIcon from '../assets/CampusShop2.0.png';
import macbookImg from '../assets/MACBOOK.jpg';
import textbookImg from '../assets/TEXTBOOK.jpg';
import deskImg from '../assets/DESK.jpg';

const { Title, Text, Paragraph } = Typography;

const features = [
  {
    icon: <Shield size={22} />,
    title: 'Students Only',
    desc: 'A trusted community exclusive to verified university students. Trade with confidence.',
    color: '#2563eb',
  },
  {
    icon: <Zap size={22} />,
    title: 'Instant Listings',
    desc: 'Post items in under 30 seconds. Your listing goes live immediately for everyone to see.',
    color: '#8b5cf6',
  },
  {
    icon: <MessageCircle size={22} />,
    title: 'WhatsApp Connect',
    desc: 'Contact sellers directly via WhatsApp. No in-app messaging hassle, just real conversations.',
    color: '#16a34a',
  },
  {
    icon: <Search size={22} />,
    title: 'Smart Search',
    desc: 'Find exactly what you need with powerful search and category filtering.',
    color: '#eab308',
  },
  {
    icon: <Users size={22} />,
    title: 'Campus Community',
    desc: 'Buy and sell within your campus. Meet locally, trade safely, build connections.',
    color: '#0891b2',
  },
  {
    icon: <Rocket size={22} />,
    title: 'Real-Time Sync',
    desc: 'Listings update in real-time across all devices. Never miss a great deal.',
    color: '#ea580c',
  },
];

const steps = [
  {
    num: '01',
    title: 'Create Your Account',
    desc: 'Sign up in seconds with your email. Join the campus marketplace community.',
    icon: <PlusCircle size={24} />,
  },
  {
    num: '02',
    title: 'Post or Browse',
    desc: 'List items you want to sell or browse what others are offering on campus.',
    icon: <Search size={24} />,
  },
  {
    num: '03',
    title: 'Connect & Trade',
    desc: 'Contact sellers via WhatsApp, meet on campus, and complete your trade.',
    icon: <MessageCircle size={24} />,
  },
];

const stats = [
  { value: '100%', label: 'Free to Use', icon: <CircleCheck size={18} color="#2563eb" /> },
  { value: '< 30s', label: 'To Post a Listing', icon: <Zap size={18} color="#2563eb" /> },
  { value: '24/7', label: 'Always Available', icon: <Shield size={18} color="#2563eb" /> },
  { value: '∞', label: 'Unlimited Listings', icon: <Rocket size={18} color="#2563eb" /> },
  { value: 'Verified', label: 'Students Only', icon: <Users size={18} color="#2563eb" /> },
];

const LandingPage = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();

  if (currentUser) {
    navigate('/market', { replace: true });
    return null;
  }

  return (
    <div className="landing-page">
      {/* ===== NAVBAR ===== */}
      <nav className="landing-nav">
        <div className="landing-nav-inner">
          <div className="landing-nav-brand">
            <img 
              src={logoIcon} 
              alt="CampusShop Logo" 
              style={{ 
                height: 36, 
                width: 36, 
                objectFit: 'contain',
                transition: 'transform 0.2s ease',
              }} 
              className="logo-img-hover"
            />
            <span className="logo-text">CampusShop</span>
          </div>
          <Space size={12}>
            <Button
              type="text"
              onClick={() => navigate('/login')}
              className="landing-nav-link"
            >
              Sign In
            </Button>
            <Button
              type="primary"
              onClick={() => navigate('/signup')}
              className="landing-nav-cta"
            >
              Get Started
            </Button>
          </Space>
        </div>
      </nav>

      {/* ===== HERO ===== */}
      <section className="hero-section">
        <div className="hero-content">
          <div className="hero-badge">
            <CircleCheck size={14} style={{ marginRight: 6 }} />
            <span>The #1 Campus Marketplace for Students</span>
          </div>

          <Title level={1} className="hero-title">
            Buy & Sell
            <br />
            Within <span className="hero-gradient-text">Your Campus</span>
          </Title>

          <Paragraph className="hero-subtitle">
            CampusShop connects university students in a trusted,
            campus-only marketplace. Sell what you don&apos;t need,
            find what you do, all within your university community.
          </Paragraph>

          <Space size={16} wrap className="hero-actions">
            <Button
              type="primary"
              size="large"
              onClick={() => navigate('/signup')}
              className="hero-btn-primary"
            >
              Start Trading <ArrowRight size={16} style={{ marginLeft: 6 }} />
            </Button>
            <Button
              size="large"
              onClick={() => navigate('/login')}
              className="hero-btn-secondary"
            >
              I Have an Account
            </Button>
          </Space>

          <div className="hero-social-proof">
            <div className="hero-avatars">
              {['#2563eb', '#16a34a', '#0891b2', '#ea580c', '#8b5cf6'].map((bg, i) => (
                <div key={i} className="hero-avatar" style={{ background: bg, zIndex: 5 - i }}>
                  {String.fromCharCode(65 + i)}
                </div>
              ))}
            </div>
            <Text className="hero-social-text">
              Join students already trading on CampusShop
            </Text>
          </div>
        </div>

        {/* Floating cards decoration */}
        <div className="hero-floating-cards">
          <div className="floating-card floating-card-1">
            <img className="floating-card-img" src={macbookImg} alt="MacBook Pro M3" />
            <div className="floating-card-info">
              <Text strong style={{ fontSize: 13 }}>MacBook Pro M3</Text>
              <Text style={{ color: '#16a34a', fontWeight: 700, fontSize: 14 }}>₦450,000</Text>
            </div>
          </div>
          <div className="floating-card floating-card-2">
            <img className="floating-card-img" src={textbookImg} alt="Textbook Bundle" />
            <div className="floating-card-info">
              <Text strong style={{ fontSize: 13 }}>Textbook Bundle</Text>
              <Text style={{ color: '#16a34a', fontWeight: 700, fontSize: 14 }}>₦15,000</Text>
            </div>
          </div>
          <div className="floating-card floating-card-3">
            <img className="floating-card-img" src={deskImg} alt="Study Desk" />
            <div className="floating-card-info">
              <Text strong style={{ fontSize: 13 }}>Study Desk</Text>
              <Text style={{ color: '#16a34a', fontWeight: 700, fontSize: 14 }}>₦15,000</Text>
            </div>
          </div>
        </div>
      </section>

      {/* ===== STATS ===== */}
      <section className="stats-section">
        <Row gutter={[32, 32]} justify="center">
          {stats.map((stat, i) => (
            <Col key={i} xs={12} sm={4}>
              <div className="stat-item">
                <div className="stat-icon-wrap">{stat.icon}</div>
                <div className="stat-value">{stat.value}</div>
                <div className="stat-label">{stat.label}</div>
              </div>
            </Col>
          ))}
        </Row>
      </section>

      {/* ===== FEATURES ===== */}
      <section className="features-section" id="features">
        <div className="section-header">
          <Text className="section-tag">WHY CAMPUSSHOP</Text>
          <Title level={2} className="section-title">
            Everything You Need to
            <span className="hero-gradient-text"> Trade on Campus</span>
          </Title>
          <Paragraph className="section-subtitle">
            Built specifically for university students who want a safe, fast, and easy way to buy and sell.
          </Paragraph>
        </div>

        <Row gutter={[24, 24]} className="features-grid">
          {features.map((feat, i) => (
            <Col key={i} xs={24} sm={12} lg={8}>
              <Card className="feature-card" bordered={false}>
                <div className="feature-icon" style={{ color: feat.color, background: `${feat.color}10` }}>
                  {feat.icon}
                </div>
                <Title level={4} style={{ marginTop: 16, marginBottom: 8, letterSpacing: '-0.3px' }}>
                  {feat.title}
                </Title>
                <Paragraph type="secondary" style={{ marginBottom: 0, fontSize: 14, lineHeight: 1.6 }}>
                  {feat.desc}
                </Paragraph>
              </Card>
            </Col>
          ))}
        </Row>
      </section>

      {/* ===== HOW IT WORKS ===== */}
      <section className="steps-section">
        <div className="section-header">
          <Text className="section-tag">HOW IT WORKS</Text>
          <Title level={2} className="section-title">
            Get Started in
            <span className="hero-gradient-text"> Three Simple Steps</span>
          </Title>
        </div>

        <Row gutter={[32, 32]} justify="center" className="steps-grid">
          {steps.map((step, i) => (
            <Col key={i} xs={24} sm={8}>
              <div className="step-card">
                <div className="step-num">{step.num}</div>
                <div className="step-icon">{step.icon}</div>
                <Title level={4} style={{ marginBottom: 8, letterSpacing: '-0.3px' }}>{step.title}</Title>
                <Paragraph type="secondary" style={{ marginBottom: 0, fontSize: 14, lineHeight: 1.6 }}>
                  {step.desc}
                </Paragraph>
                {i < steps.length - 1 && <div className="step-connector" />}
              </div>
            </Col>
          ))}
        </Row>
      </section>

      {/* ===== TESTIMONIALS ===== */}
      <section className="testimonials-section">
        <div className="section-header">
          <Text className="section-tag">WHAT STUDENTS SAY</Text>
          <Title level={2} className="section-title">
            Loved by Students
            <span className="hero-gradient-text"> Across Campus</span>
          </Title>
        </div>

        <Row gutter={[24, 24]} justify="center">
          {[
            {
              name: 'Adaeze O.',
              dept: 'Computer Science, 300L',
              text: 'Sold my old textbooks in less than 24 hours! The WhatsApp integration makes it so easy to connect with buyers directly.',
              avatar: '#2563eb',
            },
            {
              name: 'Tunde M.',
              dept: 'Engineering, 400L',
              text: 'Found a barely-used drafting set for half the price. CampusShop saved me a lot of money this semester.',
              avatar: '#ea580c',
            },
            {
              name: 'Fatima A.',
              dept: 'Medicine, 200L',
              text: "I love that it's only students. Feels way safer than random marketplaces. Already recommended it to my entire class.",
              avatar: '#8b5cf6',
            },
          ].map((t, i) => (
            <Col key={i} xs={24} sm={8}>
              <div className="testimonial-card">
                <div className="testimonial-stars">
                  {[...Array(5)].map((_, j) => (
                    <Star key={j} size={14} color="#eab308" fill="#eab308" />
                  ))}
                </div>
                <Paragraph style={{ fontSize: 14, lineHeight: 1.7, marginBottom: 16, color: '#334155' }}>
                  &ldquo;{t.text}&rdquo;
                </Paragraph>
                <div className="testimonial-author">
                  <div className="testimonial-avatar" style={{ background: t.avatar }}>
                    {t.name.charAt(0)}
                  </div>
                  <div>
                    <Text strong style={{ fontSize: 14 }}>{t.name}</Text>
                    <br />
                    <Text type="secondary" style={{ fontSize: 12 }}>{t.dept}</Text>
                  </div>
                </div>
              </div>
            </Col>
          ))}
        </Row>
      </section>

      {/* ===== CTA ===== */}
      <section className="cta-section">
        <div className="cta-content">
          <Title level={2} style={{ marginBottom: 8, fontSize: 36, letterSpacing: '-1px' }}>
            Ready to Start Trading?
          </Title>
          <Paragraph type="secondary" style={{ fontSize: 16, maxWidth: 540, margin: '0 auto 32px', lineHeight: 1.6 }}>
            Join hundreds of students who are already buying and selling on campus.
            Your next great deal is just a click away.
          </Paragraph>

          <Row gutter={[32, 16]} justify="center" style={{ marginBottom: 32, maxWidth: 700, margin: '0 auto 32px' }}>
            {[
              'No fees or commissions',
              'List in under 30 seconds',
              'Direct WhatsApp contact',
              'Students-only community',
              'Real-time live listings',
              'Works on any device',
            ].map((item, i) => (
              <Col key={i} xs={12} sm={8}>
                <Space size={8} align="center">
                  <CheckCircle size={16} color="#16a34a" />
                  <Text style={{ fontSize: 14 }}>{item}</Text>
                </Space>
              </Col>
            ))}
          </Row>

          <Space size={16} wrap style={{ justifyContent: 'center' }}>
            <Button
              type="primary"
              size="large"
              onClick={() => navigate('/signup')}
              className="hero-btn-primary"
            >
              Create Free Account <ArrowRight size={16} style={{ marginLeft: 6 }} />
            </Button>
            <Button
              size="large"
              onClick={() => navigate('/login')}
              className="hero-btn-secondary"
            >
              Sign In Instead
            </Button>
          </Space>
        </div>
      </section>

      {/* ===== FOOTER ===== */}
      <footer className="landing-footer">
        <div className="landing-footer-inner">
          <div className="landing-nav-brand">
            <img 
              src={logoIcon} 
              alt="CampusShop Logo" 
              style={{ 
                height: 28, 
                width: 28, 
                objectFit: 'contain',
              }} 
            />
            <span className="logo-text" style={{ fontSize: 15 }}>CampusShop</span>
          </div>
          <Text type="secondary" style={{ fontSize: 13 }}>
            © {new Date().getFullYear()} CampusShop. Built for students, by students.
          </Text>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
