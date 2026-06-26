import { useNavigate } from 'react-router-dom';
import { Typography, Button, Space } from 'antd';
import Footer from '../components/Footer';
import logoIcon from '../assets/campusshopwordlogo.png';

const { Title, Text, Paragraph } = Typography;

const TermsPage = () => {
  const navigate = useNavigate();

  const sections = [
    {
      title: '1. Acceptance of Terms',
      content: `By accessing and using CampusShop ("the Platform"), you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use the Platform. CampusShop reserves the right to update these terms at any time, and continued use of the Platform constitutes acceptance of any changes.`,
    },
    {
      title: '2. Eligibility',
      content: `CampusShop is designed for Nigerian university students. By using the Platform, you confirm that you are currently enrolled at a recognized Nigerian university or tertiary institution. CampusShop reserves the right to verify your student status and restrict access if eligibility requirements are not met.`,
    },
    {
      title: '3. Account Registration',
      content: `You must provide accurate and complete information when creating an account. You are responsible for maintaining the confidentiality of your login credentials and for all activity under your account. You must notify us immediately of any unauthorized access. CampusShop is not liable for any losses arising from unauthorized use of your account.`,
    },
    {
      title: '4. Listing and Trading',
      content: `Users may list items for sale, browse listings, and contact sellers via WhatsApp. CampusShop does not facilitate payments, shipping, or dispute resolution between buyers and sellers. All transactions are conducted directly between users. You agree to list only items that are legal, accurately described, and comply with our Community Guidelines.`,
    },
    {
      title: '5. Prohibited Items',
      content: `The following items may not be listed on CampusShop: illegal substances and drugs, weapons and ammunition, counterfeit goods, stolen property, adult content, items that violate university policies, and any items prohibited by Nigerian law. CampusShop reserves the right to remove listings and suspend accounts that violate these rules.`,
    },
    {
      title: '6. User Conduct',
      content: `You agree not to: use the Platform for fraudulent purposes, harass or threaten other users, post false or misleading listings, attempt to circumvent Platform features, scrape or collect data from the Platform, or engage in any activity that disrupts the Platform's operation.`,
    },
    {
      title: '7. Intellectual Property',
      content: `All content on CampusShop, including logos, designs, and text, is owned by CampusShop and protected by intellectual property laws. Users retain ownership of content they post (photos, descriptions) but grant CampusShop a non-exclusive license to display this content on the Platform.`,
    },
    {
      title: '8. Limitation of Liability',
      content: `CampusShop is a platform that connects student buyers and sellers. We do not guarantee the quality, safety, or legality of listed items. CampusShop is not a party to any transaction between users and is not liable for any disputes, damages, or losses arising from user interactions or transactions.`,
    },
    {
      title: '9. Termination',
      content: `CampusShop may suspend or terminate your account at any time for violations of these Terms, Community Guidelines, or for any other reason at our discretion. Upon termination, your right to use the Platform ceases immediately.`,
    },
    {
      title: '10. Contact',
      content: `If you have questions about these Terms of Service, please contact us through the Contact page or email us at support@campusshop.ng.`,
    },
  ];

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
          <Text className="section-tag">LEGAL</Text>
          <Title level={1} className="static-page-title">Terms of Service</Title>
          <Paragraph className="static-page-subtitle">
            Last updated: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
          </Paragraph>
        </div>

        <div className="legal-content">
          {sections.map((section, i) => (
            <div key={i} className="legal-section">
              <Title level={4} style={{ marginBottom: 12 }}>{section.title}</Title>
              <Paragraph style={{ fontSize: 15, lineHeight: 1.8, color: 'var(--text-secondary)' }}>
                {section.content}
              </Paragraph>
            </div>
          ))}
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default TermsPage;
