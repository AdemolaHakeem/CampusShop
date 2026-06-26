import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Form, Input, Button, Typography, message, Modal } from 'antd';
import { Mail, Lock, ArrowRight } from 'lucide-react';
import { loginUser, resendVerification, resetPassword } from '../services/auth';
import logoIcon from '../assets/CampusShop2.0.png';

const { Title, Text, Paragraph } = Typography;

const LoginPage = () => {
  const [loading, setLoading] = useState(false);
  const [forgotPasswordVisible, setForgotPasswordVisible] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);
  const [resetForm] = Form.useForm();
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
            <img src={logoIcon} alt="CampusShop Logo" style={{ height: 56, width: 56, objectFit: 'contain' }} />
          </div>
          <Title level={2} style={{ margin: 0, letterSpacing: '-0.5px' }}>Welcome Back</Title>
          <Paragraph type="secondary" style={{ margin: '4px 0 0' }}>
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
              prefix={<Mail size={16} color="#94a3b8" />}
              placeholder="Enter your email"
              autoComplete="email"
            />
          </Form.Item>

          <Form.Item
            name="password"
            rules={[{ required: true, message: 'Please enter your password' }]}
            style={{ marginBottom: 12 }}
          >
            <Input.Password
              prefix={<Lock size={16} color="#94a3b8" />}
              placeholder="Enter your password"
              autoComplete="current-password"
            />
          </Form.Item>

          <div style={{ textAlign: 'right', marginBottom: 24 }}>
            <a
              onClick={() => setForgotPasswordVisible(true)}
              className="auth-link"
              style={{ fontSize: 13, fontWeight: 500, cursor: 'pointer' }}
            >
              Forgot Password?
            </a>
          </div>

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              block
              className="auth-btn"
            >
              Sign In <ArrowRight size={16} style={{ marginLeft: 6 }} />
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

      <Modal
        title="Reset Password"
        open={forgotPasswordVisible}
        onCancel={() => {
          setForgotPasswordVisible(false);
          resetForm.resetFields();
        }}
        footer={null}
        centered
        width={400}
      >
        <div style={{ marginTop: 16 }}>
          <Paragraph type="secondary" style={{ marginBottom: 24 }}>
            Enter your email below. We'll send you a secure link to reset your password.
          </Paragraph>

          <Form
            form={resetForm}
            layout="vertical"
            requiredMark={false}
            onFinish={async (values) => {
              setResetLoading(true);
              try {
                await resetPassword(values.email);
                message.success('Password reset link sent! Check your email inbox ✉️');
                setForgotPasswordVisible(false);
                resetForm.resetFields();
              } catch (err) {
                console.error('Reset password error:', err);
                message.error(err.message || 'Failed to send reset link. Please try again.');
              } finally {
                setResetLoading(false);
              }
            }}
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
                prefix={<Mail size={16} color="#94a3b8" />}
                placeholder="Enter your email"
                autoComplete="email"
              />
            </Form.Item>

            <Form.Item style={{ marginBottom: 0 }}>
              <Button
                type="primary"
                htmlType="submit"
                loading={resetLoading}
                block
                className="auth-btn"
                style={{ marginTop: 8 }}
              >
                Send Reset Link
              </Button>
            </Form.Item>
          </Form>
        </div>
      </Modal>
    </div>
  );
};

export default LoginPage;
