import { useNavigate } from 'react-router-dom';
import { Typography, Button, Space, Row, Col } from 'antd';
import { UserPlus, Search, MessageCircle, Handshake, ArrowRight } from 'lucide-react';
import Footer from '../components/Footer';
import logoIcon from '../assets/campusshopwordlogo.png';

const { Title, Text, Paragraph } = Typography;

const steps = [
  {
    num: '01',
    icon: <UserPlus size={32} />,
    title: 'Create Your Account',
    desc: 'Sign up in seconds with your email. No university email required — just a valid email and a password. Your account is instantly ready to use.',
    details: [
      'Click "Get Started" on the homepage',
      'Enter your name, email, and password',
      'You\'re in! Start browsing or selling immediately',
    ],
    color: '#2563eb',
  },
  {
    num: '02',
    icon: <Search size={32} />,
    title: 'Browse or List Items',
    desc: 'Looking to buy? Browse the marketplace, search for items, and filter by category. Want to sell? List your item in under 30 seconds with photos and details.',
    details: [
      'Use the search bar to find specific items',
      'Filter by category: textbooks, electronics, furniture, etc.',
      'To sell: click "Sell Item" and fill in the details',
      'Your listing goes live immediately',
    ],
    color: '#8b5cf6',
  },
  {
    num: '03',
    icon: <MessageCircle size={32} />,
    title: 'Connect via WhatsApp',
    desc: 'Found something you want? Click "Contact via WhatsApp" to message the seller directly. No in-app messaging hassle — just real, instant conversations.',
    details: [
      'Each listing has a WhatsApp contact button',
      'One click opens a direct chat with the seller',
      'Negotiate price, ask questions, arrange meetup',
      'All communication happens on WhatsApp',
    ],
    color: '#16a34a',
  },
  {
    num: '04',
    icon: <Handshake size={32} />,
    title: 'Meet and Trade',
    desc: 'Arrange to meet on campus, inspect the item, and complete your trade in person. It\'s that simple — student to student, campus to campus.',
    details: [
      'Meet at a public campus location',
      'Inspect the item before paying',
      'Pay directly — no platform fees or commissions',
      'Both sides happy? Trade complete!',
    ],
    color: '#ea580c',
  },
];

const HowItWorksPage = () => {
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
          <Text className="section-tag">SIMPLE & FAST</Text>
          <Title level={1} className="static-page-title">How CampusShop Works</Title>
          <Paragraph className="static-page-subtitle">
            From sign-up to trade — campus commerce in 4 easy steps. No fees, no complications.
          </Paragraph>
        </div>

        <div className="how-it-works-steps">
          {steps.map((step, i) => (
            <div className="how-step-card" key={i}>
              <div className="how-step-num" style={{ color: step.color }}>{step.num}</div>
              <div className="how-step-content">
                <div className="how-step-icon" style={{ background: `${step.color}10`, color: step.color }}>
                  {step.icon}
                </div>
                <Title level={3} style={{ marginBottom: 12 }}>{step.title}</Title>
                <Paragraph style={{ fontSize: 15, lineHeight: 1.8, color: 'var(--text-secondary)', marginBottom: 16 }}>
                  {step.desc}
                </Paragraph>
                <ul className="how-step-details">
                  {step.details.map((d, j) => (
                    <li key={j}>
                      <Text style={{ fontSize: 14, color: 'var(--text-secondary)' }}>{d}</Text>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>

        <div className="help-cta-card" style={{ marginTop: 48 }}>
          <Title level={3} style={{ marginBottom: 8 }}>Ready to get started?</Title>
          <Paragraph type="secondary" style={{ marginBottom: 24 }}>
            Join thousands of students already trading on CampusShop.
          </Paragraph>
          <Space size={16}>
            <Button type="primary" size="large" onClick={() => navigate('/signup')} className="hero-btn-primary">
              Create Free Account <ArrowRight size={16} style={{ marginLeft: 6 }} />
            </Button>
            <Button size="large" onClick={() => navigate('/login')} className="hero-btn-secondary">
              Sign In Instead
            </Button>
          </Space>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default HowItWorksPage;
