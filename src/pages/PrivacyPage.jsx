import { useNavigate } from 'react-router-dom';
import { Typography, Button, Space } from 'antd';
import Footer from '../components/Footer';
import logoIcon from '../assets/campusshopwordlogo.png';

const { Title, Text, Paragraph } = Typography;

const PrivacyPage = () => {
  const navigate = useNavigate();

  const sections = [
    {
      title: '1. Information We Collect',
      content: `When you create a CampusShop account, we collect your name, email address, and password. When you create listings, we collect item details, photos, descriptions, prices, and your WhatsApp contact number. We also automatically collect basic usage data such as pages visited, actions taken, browser type, and device information to improve the Platform.`,
    },
    {
      title: '2. How We Use Your Information',
      content: `We use your information to: operate and maintain the Platform, display your listings to other users, enable communication between buyers and sellers, improve our features and user experience, send important account notifications, and ensure the safety and security of our community. We do not sell your personal information to third parties.`,
    },
    {
      title: '3. Information Sharing',
      content: `Your listing information (item details, photos, price) is publicly visible to all CampusShop users. Your WhatsApp number is shared with users who click the "Contact via WhatsApp" button on your listings. We do not share your email address or password with other users or third parties, except as required by law or to protect the safety of our community.`,
    },
    {
      title: '4. Data Storage and Security',
      content: `Your data is stored securely using industry-standard cloud infrastructure (Firebase/Google Cloud). We implement appropriate technical and organizational measures to protect your personal data against unauthorized access, alteration, disclosure, or destruction. However, no method of internet transmission is 100% secure.`,
    },
    {
      title: '5. Your Rights',
      content: `You have the right to: access the personal data we hold about you, request correction of inaccurate data, request deletion of your account and associated data, withdraw consent for data processing, and lodge a complaint with a data protection authority. To exercise these rights, contact us through the Contact page.`,
    },
    {
      title: '6. Cookies and Tracking',
      id: 'cookies',
      content: `CampusShop uses essential cookies to maintain your login session and remember your preferences. We use analytics tools to understand how users interact with the Platform. You can control cookie settings through your browser preferences. Essential cookies are required for the Platform to function properly.`,
    },
    {
      title: '7. Third-Party Services',
      content: `CampusShop uses the following third-party services: Firebase (authentication and database), Google Cloud (hosting and storage), and WhatsApp (seller communication). Each of these services has its own privacy policy. We recommend reviewing their policies for more information.`,
    },
    {
      title: '8. Children\'s Privacy',
      content: `CampusShop is not intended for children under the age of 16. We do not knowingly collect personal information from children. If you believe a child has provided us with personal data, please contact us immediately.`,
    },
    {
      title: '9. Changes to This Policy',
      content: `We may update this Privacy Policy from time to time. We will notify you of significant changes by posting a notice on the Platform. Continued use of CampusShop after changes are posted constitutes acceptance of the updated policy.`,
    },
    {
      title: '10. Contact Us',
      content: `For questions about this Privacy Policy or our data practices, please contact us at support@campusshop.ng or through the Contact page.`,
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
          <Title level={1} className="static-page-title">Privacy Policy</Title>
          <Paragraph className="static-page-subtitle">
            Last updated: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
          </Paragraph>
        </div>

        <div className="legal-content">
          <Paragraph style={{ fontSize: 15, lineHeight: 1.8, color: 'var(--text-secondary)', marginBottom: 32 }}>
            CampusShop ("we", "our", "us") is committed to protecting your privacy. This Privacy Policy explains 
            how we collect, use, and safeguard your personal information when you use our platform.
          </Paragraph>
          {sections.map((section, i) => (
            <div key={i} className="legal-section" id={section.id || undefined}>
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

export default PrivacyPage;
