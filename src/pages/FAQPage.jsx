import { useNavigate } from 'react-router-dom';
import { Typography, Collapse, Space, Button, Input } from 'antd';
import { Search, ChevronRight } from 'lucide-react';
import { useState } from 'react';
import Footer from '../components/Footer';
import logoIcon from '../assets/campusshopwordlogo.png';

const { Title, Text, Paragraph } = Typography;

const faqCategories = [
  {
    category: 'Getting Started',
    questions: [
      {
        q: 'What is CampusShop?',
        a: 'CampusShop is a student-only marketplace that connects university students for buying and selling items within their campus community. It\'s designed exclusively for Nigerian university students.',
      },
      {
        q: 'How do I create an account?',
        a: 'Click "Get Started" on the homepage, fill in your name, email, and password, and you\'re ready to start trading. It takes less than 30 seconds.',
      },
      {
        q: 'Is CampusShop free to use?',
        a: 'Yes! CampusShop is completely free. There are no listing fees, no commissions, and no hidden charges. We believe campus commerce should be accessible to all students.',
      },
    ],
  },
  {
    category: 'Buying',
    questions: [
      {
        q: 'How do I find items I want to buy?',
        a: 'Browse the Marketplace page, use the search bar to find specific items, or filter by category. You can also sort listings by price, date, or relevance.',
      },
      {
        q: 'How do I contact a seller?',
        a: 'Each listing includes a "Contact via WhatsApp" button. Click it to start a direct conversation with the seller. No in-app messaging — just real conversations.',
      },
      {
        q: 'Can I negotiate prices?',
        a: 'Absolutely! Prices listed are set by sellers, but you\'re free to negotiate directly with them via WhatsApp. Most sellers are open to reasonable offers.',
      },
    ],
  },
  {
    category: 'Selling',
    questions: [
      {
        q: 'How do I list an item for sale?',
        a: 'Go to "Sell Item" in the navigation, fill in the item details (title, description, price, category, photos), add your WhatsApp number, and publish. Your listing goes live immediately.',
      },
      {
        q: 'How many items can I list?',
        a: 'There\'s no limit! You can list as many items as you want. Whether you\'re selling one textbook or clearing out your entire dorm, CampusShop has you covered.',
      },
      {
        q: 'Can I edit or delete my listings?',
        a: 'Yes. Go to "My Listings" to view all your active listings. From there, you can edit details, update prices, or delete listings that have been sold.',
      },
    ],
  },
  {
    category: 'Safety & Trust',
    questions: [
      {
        q: 'Is it safe to buy and sell on CampusShop?',
        a: 'CampusShop is designed for campus-based transactions between verified students. We recommend meeting in public campus locations, bringing a friend, and inspecting items before paying.',
      },
      {
        q: 'How do I report a suspicious listing?',
        a: 'If you encounter a suspicious listing or user, please contact us through the Contact page. We take reports seriously and will investigate promptly.',
      },
      {
        q: 'What items are prohibited?',
        a: 'Illegal items, weapons, drugs, counterfeit goods, and anything that violates university policies are strictly prohibited. See our Community Guidelines for the full list.',
      },
    ],
  },
  {
    category: 'Account & Technical',
    questions: [
      {
        q: 'I forgot my password. How do I reset it?',
        a: 'Click "Forgot Password?" on the login page, enter your email address, and we\'ll send you a password reset link.',
      },
      {
        q: 'Can I change my display name or email?',
        a: 'Currently, you can update your display name through your account settings. Email changes require contacting our support team.',
      },
      {
        q: 'Does CampusShop work on mobile?',
        a: 'Yes! CampusShop is fully responsive and works beautifully on phones, tablets, and desktops. No app download needed — just visit the website from any browser.',
      },
    ],
  },
];

const FAQPage = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');

  const filteredCategories = faqCategories
    .map((cat) => ({
      ...cat,
      questions: cat.questions.filter(
        (q) =>
          q.q.toLowerCase().includes(searchQuery.toLowerCase()) ||
          q.a.toLowerCase().includes(searchQuery.toLowerCase())
      ),
    }))
    .filter((cat) => cat.questions.length > 0);

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
          <Title level={1} className="static-page-title">Frequently Asked Questions</Title>
          <Paragraph className="static-page-subtitle">
            Find answers to common questions about CampusShop. Can't find what you're looking for?{' '}
            <a onClick={() => navigate('/contact')} style={{ color: 'var(--accent-blue)', cursor: 'pointer' }}>Contact us</a>.
          </Paragraph>
          <div className="faq-search">
            <Search size={16} />
            <Input
              placeholder="Search FAQs..."
              bordered={false}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ flex: 1 }}
            />
          </div>
        </div>

        <div className="faq-content">
          {filteredCategories.map((cat, i) => (
            <div key={i} className="faq-category">
              <Title level={3} className="faq-category-title">{cat.category}</Title>
              <Collapse
                ghost
                expandIcon={({ isActive }) => (
                  <ChevronRight
                    size={16}
                    style={{
                      transform: isActive ? 'rotate(90deg)' : 'rotate(0deg)',
                      transition: 'transform 0.2s ease',
                    }}
                  />
                )}
                items={cat.questions.map((q, j) => ({
                  key: `${i}-${j}`,
                  label: <Text strong style={{ fontSize: 15 }}>{q.q}</Text>,
                  children: <Paragraph style={{ color: 'var(--text-secondary)', lineHeight: 1.7 }}>{q.a}</Paragraph>,
                }))}
              />
            </div>
          ))}
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default FAQPage;
