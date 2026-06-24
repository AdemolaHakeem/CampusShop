import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Form, Input, Button, Typography, message, Modal, Divider } from 'antd';
import { Mail, Lock, User, Phone, Building2 } from 'lucide-react';
import { registerUser, resendVerification } from '../services/auth';
import logger from '../utils/logger';
import CampusSearch from '../components/CampusSearch';
import logoIcon from '../assets/CampusShop2.0.png';

const { Title, Text, Paragraph } = Typography;

const SignupPage = () => {
  const [loading, setLoading] = useState(false);
  const [campusId, setCampusId] = useState(null);
  const [campusName, setCampusName] = useState('');
  const navigate = useNavigate();

  const onFinish = async (values) => {
    // --- Strict campus validation (must be selected from autocomplete) ---
    if (!campusId) {
      message.warning('Please select your school or university from the search results.');
      return;
    }

    setLoading(true);
    try {
      const response = await registerUser({
        ...values,
        campusId,
        campusName,
      });

      // If email confirmation is disabled, Supabase returns a session immediately
      if (response?.session) {
        message.success('Account created successfully! Welcome to CampusShop 🎉');
        navigate('/market');
      } else {
        // If email confirmation is enabled, no session is returned yet
        Modal.info({
          title: 'Confirm Your Email ✉️',
          content: (
            <div style={{ marginTop: 12 }}>
              <p>We've sent a verification link to <strong>{values.email}</strong>.</p>
              <p>Please click the link in your email to activate your account and start trading on CampusShop!</p>
            </div>
          ),
          okText: 'Go to Sign In',
          centered: true,
          onOk() {
            navigate('/login');
          }
        });
      }
    } catch (err) {
      logger.error('Registration error:', err);
      if (err.message?.toLowerCase().includes('user already registered')) {
        Modal.info({
          title: 'Account Already Exists 👤',
          content: (
            <div style={{ marginTop: 12 }}>
              <p>An account with <strong>{values.email}</strong> is already registered.</p>
              <p>If you haven't confirmed your email yet, we can resend the confirmation link so you can activate it.</p>
            </div>
          ),
          okText: 'Resend Verification Link',
          cancelText: 'Go to Login',
          okCancel: true,
          centered: true,
          async onOk() {
            try {
              message.loading({ content: 'Resending verification email...', key: 'resend' });
              await resendVerification(values.email);
              message.success({ content: 'Verification email resent! Check your inbox ✉️', key: 'resend', duration: 4 });
            } catch (resendErr) {
              logger.error('Resend error:', resendErr);
              message.error({ content: resendErr.message || 'Failed to resend verification email.', key: 'resend' });
            }
          },
          onCancel() {
            navigate('/login');
          }
        });
      } else {
        message.error(err.message || 'Registration failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-header">
          <div className="auth-logo" style={{ background: 'transparent', boxShadow: 'none' }}>
            <img src={logoIcon} alt="CampusShop Logo" style={{ height: 60, width: 60, objectFit: 'contain' }} />
          </div>
          <Title level={2} style={{ margin: 0 }}>Join CampusShop</Title>
          <Paragraph type="secondary" style={{ margin: 0 }}>
            Create your account and start trading on campus
          </Paragraph>
        </div>

        <Form
          name="signup"
          layout="vertical"
          onFinish={onFinish}
          size="large"
          requiredMark={false}
          className="auth-form"
        >
          {/* ---- Campus Selection (Mandatory) ---- */}
          <div style={{ marginBottom: 24 }}>
            <div style={{ marginBottom: 8 }}>
              <Text strong style={{ fontSize: 14, color: 'var(--text-primary)' }}>
                <Building2 size={16} style={{ marginRight: 6, color: '#0062ff' }} />
                Your School or University
              </Text>
              <Text type="secondary" style={{ fontSize: 12, marginLeft: 8 }}>
                (Required)
              </Text>
            </div>
            <CampusSearch
              value={campusId}
              onChange={(id, name) => {
                setCampusId(id);
                setCampusName(name || '');
              }}
            />
            <Text type="secondary" style={{ fontSize: 11, display: 'block', marginTop: 6 }}>
              Select your institution from the list. Type at least 2 characters to search.
            </Text>
          </div>

          <Divider style={{ margin: '0 0 20px', borderColor: 'var(--border-color)' }} />

          <Form.Item
            name="name"
            rules={[{ required: true, message: 'Please enter your full name' }]}
          >
            <Input
              prefix={<User size={16} />}
              placeholder="e.g. Alex Johnson"
              autoComplete="name"
            />
          </Form.Item>

          <Form.Item
            name="email"
            rules={[
              { required: true, message: 'Please enter your email' },
              { type: 'email', message: 'Please enter a valid email' },
            ]}
          >
            <Input
              prefix={<Mail size={16} />}
              placeholder="e.g. alex@email.com"
              autoComplete="email"
            />
          </Form.Item>

          <Form.Item
            name="phone"
          >
            <Input
              prefix={<Phone size={16} />}
              placeholder="Phone Number e.g. +234... (for WhatsApp)"
              autoComplete="tel"
            />
          </Form.Item>

          <Form.Item
            name="password"
            rules={[
              { required: true, message: 'Please create a password' },
              { min: 8, message: 'Password must be at least 8 characters' },
            ]}
          >
            <Input.Password
              prefix={<Lock size={16} />}
              placeholder="Create a password (min. 8 characters)"
              autoComplete="new-password"
            />
          </Form.Item>

          <Form.Item
            name="confirmPassword"
            dependencies={['password']}
            rules={[
              { required: true, message: 'Please confirm your password' },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue('password') === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error('Passwords do not match!'));
                },
              }),
            ]}
          >
            <Input.Password
              prefix={<Lock size={16} />}
              placeholder="Confirm your password"
              autoComplete="new-password"
            />
          </Form.Item>

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              block
              className="auth-btn"
            >
              Create Account
            </Button>
          </Form.Item>
        </Form>

        <div className="auth-footer">
          <Text type="secondary">
            Already have an account?{' '}
            <Link to="/login" className="auth-link">Sign in</Link>
          </Text>
        </div>
      </div>
    </div>
  );
};

export default SignupPage;
