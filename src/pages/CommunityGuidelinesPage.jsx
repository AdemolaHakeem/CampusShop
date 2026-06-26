import { useNavigate } from 'react-router-dom';
import { Typography, Button, Space, Row, Col } from 'antd';
import { Ban, Heart, Flag, AlertTriangle, MessageCircle, ThumbsUp } from 'lucide-react';
import Footer from '../components/Footer';
import logoIcon from '../assets/campusshopwordlogo.png';

const { Title, Text, Paragraph } = Typography;

const guidelines = [
  {
    icon: <Heart size={24} />,
    title: 'Be Respectful',
    points: [
      'Treat all users with respect and courtesy',
      'Communicate honestly and professionally',
      'Be patient and understanding in negotiations',
      'Respond to messages in a timely manner',
    ],
    color: '#ef4444',
  },
  {
    icon: <ThumbsUp size={24} />,
    title: 'Be Honest',
    points: [
      'Accurately describe items in your listings',
      'Use real photos of the actual item',
      'Disclose any defects, damage, or wear',
      'Price items fairly and transparently',
    ],
    color: '#16a34a',
  },
  {
    icon: <Ban size={24} />,
    title: 'Prohibited Items',
    points: [
      'Illegal substances, drugs, and drug paraphernalia',
      'Weapons, ammunition, and explosives',
      'Stolen property or counterfeit goods',
      'Adult content and inappropriate materials',
      'Exam answers, plagiarized assignments',
      'Items violating university policies',
    ],
    color: '#ef4444',
  },
  {
    icon: <AlertTriangle size={24} />,
    title: 'Prohibited Behavior',
    points: [
      'Scamming or defrauding other users',
      'Harassment, threats, or bullying',
      'Spam, fake listings, or misleading content',
      'Impersonating other students or staff',
      'Collecting personal data from other users',
      'Discriminating based on tribe, religion, or gender',
    ],
    color: '#ea580c',
  },
  {
    icon: <Flag size={24} />,
    title: 'Reporting Violations',
    points: [
      'Report suspicious listings or users through the Contact page',
      'Provide as much detail as possible in your report',
      'All reports are reviewed within 24 hours',
      'Reporters\' identities are kept confidential',
      'False reporting is itself a violation of guidelines',
    ],
    color: '#2563eb',
  },
  {
    icon: <MessageCircle size={24} />,
    title: 'Consequences',
    points: [
      'First violation: Warning and content removal',
      'Second violation: Temporary account suspension',
      'Severe or repeated violations: Permanent ban',
      'Illegal activity: Reported to relevant authorities',
      'CampusShop reserves the right to take action at its discretion',
    ],
    color: '#8b5cf6',
  },
];

const CommunityGuidelinesPage = () => {
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
          <Text className="section-tag">COMMUNITY</Text>
          <Title level={1} className="static-page-title">Community Guidelines</Title>
          <Paragraph className="static-page-subtitle">
            CampusShop is a community built on trust. These guidelines help keep our marketplace safe, 
            fair, and respectful for all students.
          </Paragraph>
        </div>

        <Row gutter={[24, 24]}>
          {guidelines.map((guide, i) => (
            <Col key={i} xs={24} sm={12}>
              <div className="guideline-card">
                <div className="guideline-header">
                  <div className="guideline-icon" style={{ background: `${guide.color}10`, color: guide.color }}>
                    {guide.icon}
                  </div>
                  <Title level={4} style={{ marginBottom: 0 }}>{guide.title}</Title>
                </div>
                <ul className="guideline-list">
                  {guide.points.map((point, j) => (
                    <li key={j}>
                      <Text style={{ fontSize: 14, color: 'var(--text-secondary)' }}>{point}</Text>
                    </li>
                  ))}
                </ul>
              </div>
            </Col>
          ))}
        </Row>
      </div>

      <Footer />
    </div>
  );
};

export default CommunityGuidelinesPage;
