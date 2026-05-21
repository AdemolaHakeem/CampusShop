import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Form, Input, Button, Typography, message, Divider, Space, Modal } from 'antd';
import { MailOutlined, LockOutlined, UserOutlined, PhoneOutlined } from '@ant-design/icons';
import { registerUser, resendVerification } from '../services/auth';
import logoIcon from '../assets/CampusShop2.0.png';

const { Title, Text, Paragraph } = Typography;

const SignupPage = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const onFinish = async (values) => {
    setLoading(true);
    try {
      const response = await registerUser(values);
      
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
      console.error('Registration error:', err);
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
              console.error('Resend error:', resendErr);
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
          <Form.Item
            name="name"
            rules={[{ required: true, message: 'Please enter your full name' }]}
          >
            <Input
              prefix={<UserOutlined />}
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
              prefix={<MailOutlined />}
              placeholder="e.g. alex@student.edu"
              autoComplete="email"
            />
          </Form.Item>

          <Form.Item
            name="phone"
          >
            <Input
              prefix={<PhoneOutlined />}
              placeholder="Phone Number e.g. +234... (for WhatsApp)"
              autoComplete="tel"
            />
          </Form.Item>

          <Form.Item
            name="password"
            rules={[
              { required: true, message: 'Please create a password' },
              { min: 6, message: 'Password must be at least 6 characters' },
            ]}
          >
            <Input.Password
              prefix={<LockOutlined />}
              placeholder="Create a password (min. 6 characters)"
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
