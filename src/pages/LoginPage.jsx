import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Form, Input, Button, Typography, message, Modal } from 'antd';
import { MailOutlined, LockOutlined } from '@ant-design/icons';
import { loginUser, resendVerification } from '../services/auth';
import logoIcon from '../assets/CampusShop2.0.png';

const { Title, Text, Paragraph } = Typography;

const LoginPage = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const onFinish = async (values) => {
    setLoading(true);
    try {
      await loginUser(values);
      message.success('Welcome back! 👋');
      navigate('/market');
    } catch (err) {
      console.error('Login error:', err);
      if (err.message?.toLowerCase().includes('email not confirmed')) {
        Modal.warning({
          title: 'Email Verification Required ✉️',
          content: (
            <div style={{ marginTop: 12 }}>
              <p>Your email has not been confirmed yet. Please verify your email to log in.</p>
              <p>Didn't receive the email, or has the link expired?</p>
            </div>
          ),
          okText: 'Resend Verification Link',
          cancelText: 'Cancel',
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
          }
        });
      } else {
        message.error(err.message || 'Login failed. Please try again.');
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
          <Title level={2} style={{ margin: 0 }}>Welcome Back</Title>
          <Paragraph type="secondary" style={{ margin: 0 }}>
            Sign in to your CampusShop account
          </Paragraph>
        </div>

        <Form
          name="login"
          layout="vertical"
          onFinish={onFinish}
          size="large"
          requiredMark={false}
          className="auth-form"
        >
          <Form.Item
            name="email"
            rules={[
              { required: true, message: 'Please enter your email' },
              { type: 'email', message: 'Please enter a valid email' },
            ]}
          >
            <Input
              prefix={<MailOutlined />}
              placeholder="Enter your school email"
              autoComplete="email"
            />
          </Form.Item>

          <Form.Item
            name="password"
            rules={[{ required: true, message: 'Please enter your password' }]}
          >
            <Input.Password
              prefix={<LockOutlined />}
              placeholder="Enter your password"
              autoComplete="current-password"
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
              Sign In
            </Button>
          </Form.Item>
        </Form>

        <div className="auth-footer">
          <Text type="secondary">
            Don&apos;t have an account?{' '}
            <Link to="/signup" className="auth-link">Create one</Link>
          </Text>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
