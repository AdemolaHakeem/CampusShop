import { useNavigate } from 'react-router-dom';
import { Typography, Button, Space, Input } from 'antd';
import { Mail, MessageCircle, MapPin, Send } from 'lucide-react';
import { useState } from 'react';
import Footer from '../components/Footer';
import logoIcon from '../assets/campusshopwordlogo.png';

const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;

const ContactPage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ name: '', email: '', subject: '', message: '' });

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Future: connect to backend
    alert('Thank you for your message! We\'ll get back to you soon.');
    setFormData({ name: '', email: '', subject: '', message: '' });
  };

  const contactCards = [
    {
      icon: <Mail size={24} />,
      title: 'Email Us',
      desc: 'Get a response within 24 hours',
      detail: 'support@campusshop.ng',
      color: '#2563eb',
    },
    {
      icon: <MessageCircle size={24} />,
      title: 'WhatsApp',
      desc: 'Chat with us directly',
      detail: '+234 xxx xxx xxxx',
      color: '#16a34a',
    },
    {
      icon: <MapPin size={24} />,
      title: 'Location',
      desc: 'Based in Nigeria',
      detail: 'Lagos, Nigeria',
      color: '#8b5cf6',
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
          <Text className="section-tag">GET IN TOUCH</Text>
          <Title level={1} className="static-page-title">Contact Us</Title>
          <Paragraph className="static-page-subtitle">
            Have a question, feedback, or need help? We'd love to hear from you.
          </Paragraph>
        </div>

        <div className="contact-cards">
          {contactCards.map((card, i) => (
            <div className="contact-card" key={i}>
              <div className="contact-card-icon" style={{ background: `${card.color}10`, color: card.color }}>
                {card.icon}
              </div>
              <Title level={4} style={{ marginBottom: 4 }}>{card.title}</Title>
              <Text type="secondary" style={{ fontSize: 13 }}>{card.desc}</Text>
              <Text strong style={{ fontSize: 14, marginTop: 8, display: 'block', color: card.color }}>{card.detail}</Text>
            </div>
          ))}
        </div>

        <div className="contact-form-section">
          <Title level={3} style={{ marginBottom: 8 }}>Send us a message</Title>
          <Paragraph type="secondary" style={{ marginBottom: 32 }}>
            Fill out the form below and we'll get back to you as soon as possible.
          </Paragraph>

          <form className="contact-form" onSubmit={handleSubmit}>
            <div className="contact-form-row">
              <div className="contact-form-group">
                <label className="contact-label">Your Name</label>
                <Input
                  size="large"
                  placeholder="Full name"
                  value={formData.name}
                  onChange={(e) => handleChange('name', e.target.value)}
                  required
                />
              </div>
              <div className="contact-form-group">
                <label className="contact-label">Email Address</label>
                <Input
                  size="large"
                  type="email"
                  placeholder="you@university.edu.ng"
                  value={formData.email}
                  onChange={(e) => handleChange('email', e.target.value)}
                  required
                />
              </div>
            </div>
            <div className="contact-form-group">
              <label className="contact-label">Subject</label>
              <Input
                size="large"
                placeholder="What's this about?"
                value={formData.subject}
                onChange={(e) => handleChange('subject', e.target.value)}
                required
              />
            </div>
            <div className="contact-form-group">
              <label className="contact-label">Message</label>
              <TextArea
                rows={5}
                placeholder="Tell us more..."
                value={formData.message}
                onChange={(e) => handleChange('message', e.target.value)}
                required
              />
            </div>
            <Button type="primary" size="large" htmlType="submit" className="hero-btn-primary" style={{ marginTop: 8 }}>
              Send Message <Send size={16} style={{ marginLeft: 6 }} />
            </Button>
          </form>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default ContactPage;
