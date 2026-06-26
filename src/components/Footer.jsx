import { useNavigate, Link } from 'react-router-dom';
import { Button, Typography, Space } from 'antd';
import {
  ArrowRight,
  Shield,
  Mail,
  MessageCircle,
  DollarSign,
  MapPin,
  Users,
  ShoppingBag,
  GraduationCap,
  Clock,
  CircleCheck,
} from 'lucide-react';
import logoIcon from '../assets/campusshopwordlogo.png';

const { Title, Text, Paragraph } = Typography;

const Footer = () => {
  const navigate = useNavigate();

  const trustBadges = [
    { icon: <Shield size={14} />, text: 'Verified Students Only' },
    { icon: <Mail size={14} />, text: 'University Email Required' },
    { icon: <MessageCircle size={14} />, text: 'Direct WhatsApp Contact' },
    { icon: <DollarSign size={14} />, text: 'No Hidden Fees' },
    { icon: <MapPin size={14} />, text: 'Built for Nigerian Campuses' },
  ];

  const productLinks = [
    { label: 'Marketplace', to: '/market' },
    { label: 'Sell an Item', to: '/add-listing' },
    { label: 'Browse Categories', to: '/market' },
    { label: 'How It Works', to: '/how-it-works' },
    { label: 'Universities', to: null },
  ];

  const companyLinks = [
    { label: 'About Us', to: '/about' },
    { label: 'Blog', to: null, badge: null },
    { label: 'Careers', to: null, badge: 'Soon' },
    { label: 'Press Kit', to: null },
    { label: 'Contact Us', to: '/contact' },
  ];

  const resourceLinks = [
    { label: 'Help Center', to: '/help' },
    { label: 'Safety Tips', to: '/safety' },
    { label: 'Campus Guidelines', to: '/community-guidelines' },
    { label: 'FAQs', to: '/faq' },
    { label: 'Status Page', to: null },
  ];

  const legalLinks = [
    { label: 'Terms of Service', to: '/terms' },
    { label: 'Privacy Policy', to: '/privacy' },
    { label: 'Cookie Policy', to: '/privacy' },
    { label: 'Community Guidelines', to: '/community-guidelines' },
  ];

  const universities = [
    { name: 'University of Ibadan (UI)', color: '#e74c3c' },
    { name: 'UNILAG', color: '#16a34a' },
    { name: 'OAU Ile-Ife', color: '#e74c3c' },
    { name: 'University of Nigeria, Nsukka', color: '#2563eb' },
    { name: 'Covenant University', color: '#8b5cf6' },
  ];

  const stats = [
    { icon: <Users size={20} color="#2563eb" />, value: '1,000+', label: 'Students' },
    { icon: <ShoppingBag size={20} color="#2563eb" />, value: '500+', label: 'Listings' },
    { icon: <GraduationCap size={20} color="#2563eb" />, value: '25+', label: 'Universities' },
    { icon: <Clock size={20} color="#2563eb" />, value: '24/7', label: 'Available' },
  ];

  const renderLink = (link) => {
    if (link.to) {
      return (
        <Link to={link.to} className="footer-link" key={link.label}>
          {link.label}
          {link.badge && <span className="footer-badge">{link.badge}</span>}
        </Link>
      );
    }
    return (
      <span className="footer-link footer-link-disabled" key={link.label}>
        {link.label}
        {link.badge && <span className="footer-badge">{link.badge}</span>}
      </span>
    );
  };

  return (
    <footer className="site-footer">
      {/* ===== CTA BANNER ===== */}
      <section className="footer-cta">
        <div className="footer-cta-inner">
          <div className="footer-cta-badge">
            <Users size={14} />
            <span>JOIN THOUSANDS OF STUDENTS</span>
          </div>

          <Title level={2} className="footer-cta-title">
            Ready to Join Your{' '}
            <span className="footer-cta-accent">Campus Marketplace?</span>
          </Title>

          <Paragraph className="footer-cta-subtitle">
            Join thousands of students buying and selling safely across Nigerian universities.
          </Paragraph>

          <Space size={16} wrap className="footer-cta-actions">
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

          <div className="footer-trust-badges">
            {trustBadges.map((badge, i) => (
              <div className="footer-trust-badge" key={i}>
                <span className="footer-trust-icon">{badge.icon}</span>
                <span>{badge.text}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== LINK COLUMNS ===== */}
      <section className="footer-links-section">
        <div className="footer-links-inner">
          {/* Brand Column */}
          <div className="footer-brand-col">
            <img
              src={logoIcon}
              alt="CampusShop Logo"
              className="footer-brand-logo"
            />
            <Text className="footer-brand-tagline">
              Built for students.<br />
              Designed for campus commerce.
            </Text>
            <div className="footer-socials">
              {['instagram', 'twitter', 'tiktok', 'linkedin', 'github'].map((platform) => (
                <a
                  key={platform}
                  href="#"
                  className="footer-social-icon"
                  aria-label={platform}
                  onClick={(e) => e.preventDefault()}
                >
                  <SocialIcon name={platform} />
                </a>
              ))}
            </div>
          </div>

          {/* Product */}
          <div className="footer-link-col">
            <h4 className="footer-col-title">PRODUCT</h4>
            {productLinks.map(renderLink)}
          </div>

          {/* Company */}
          <div className="footer-link-col">
            <h4 className="footer-col-title">COMPANY</h4>
            {companyLinks.map(renderLink)}
          </div>

          {/* Resources */}
          <div className="footer-link-col">
            <h4 className="footer-col-title">RESOURCES</h4>
            {resourceLinks.map(renderLink)}
          </div>

          {/* Legal */}
          <div className="footer-link-col">
            <h4 className="footer-col-title">LEGAL</h4>
            {legalLinks.map(renderLink)}
          </div>

          {/* Popular Universities */}
          <div className="footer-link-col footer-uni-col">
            <h4 className="footer-col-title">POPULAR UNIVERSITIES</h4>
            {universities.map((uni, i) => (
              <div className="footer-uni-item" key={i}>
                <span className="footer-uni-dot" style={{ background: uni.color }} />
                <span>{uni.name}</span>
              </div>
            ))}
            <span className="footer-link footer-link-accent">View All Universities</span>
          </div>
        </div>
      </section>

      {/* ===== STATS BAR ===== */}
      <section className="footer-stats">
        <div className="footer-stats-inner">
          <div className="footer-stats-grid">
            {stats.map((stat, i) => (
              <div className="footer-stat-item" key={i}>
                <div className="footer-stat-icon">{stat.icon}</div>
                <div>
                  <div className="footer-stat-value">{stat.value}</div>
                  <div className="footer-stat-label">{stat.label}</div>
                </div>
              </div>
            ))}
          </div>
          <div className="footer-trust-blurb">
            <CircleCheck size={20} color="#16a34a" />
            <div>
              <Text strong style={{ fontSize: 14 }}>A Trusted Community</Text>
              <br />
              <Text type="secondary" style={{ fontSize: 12, lineHeight: 1.4 }}>
                Every student is verified. Every listing is real.<br />
                Every transaction is between students.
              </Text>
            </div>
          </div>
        </div>
      </section>

      {/* ===== BOTTOM BAR ===== */}
      <section className="footer-bottom">
        <div className="footer-bottom-inner">
          <div className="footer-bottom-left">
            <Text style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
              © {new Date().getFullYear()} CampusShop
            </Text>
            <Text style={{ fontSize: 13, color: 'var(--text-tertiary)' }}>
              Made with <span style={{ color: '#ef4444' }}>❤️</span> in Nigeria.
            </Text>
          </div>
          <div className="footer-watermark">CAMPUSSHOP</div>
          <div className="footer-bottom-right">
            <Text style={{ fontSize: 12, color: 'var(--text-tertiary)', lineHeight: 1.5, textAlign: 'right' }}>
              CampusShop exists to make buying and selling within<br />
              Nigerian universities simple, trusted, and accessible.<br />
              Connecting students. Building communities.
            </Text>
          </div>
        </div>
      </section>
    </footer>
  );
};

/* Simple inline SVG social icons */
const SocialIcon = ({ name }) => {
  const icons = {
    instagram: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
        <circle cx="12" cy="12" r="5" />
        <circle cx="17.5" cy="6.5" r="1.5" fill="currentColor" stroke="none" />
      </svg>
    ),
    twitter: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
      </svg>
    ),
    tiktok: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
        <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1v-3.5a6.37 6.37 0 00-.79-.05A6.34 6.34 0 003.15 15.2a6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.34-6.34V8.87a8.16 8.16 0 004.76 1.52v-3.4a4.85 4.85 0 01-1-.3z" />
      </svg>
    ),
    linkedin: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
      </svg>
    ),
    github: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
      </svg>
    ),
  };
  return icons[name] || null;
};

export default Footer;
