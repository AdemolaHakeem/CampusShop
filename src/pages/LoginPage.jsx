import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Form, Input, Button, Typography, message, Modal } from 'antd';
import { Mail, Lock } from 'lucide-react';
import { loginUser, resetPassword } from '../services/auth';
import { handleResendVerification } from '../utils/resendVerification';
import { emailRules } from '../utils/formRules';
import AuthPageLayout from '../components/AuthPageLayout';

const { Text, Paragraph } = Typography;

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
      message.success('Welcome back!');
      navigate('/market');
    } catch (err) {
      console.error('Login error:', err);
      if (err.message?.toLowerCase().includes('email not confirmed')) {
        Modal.warning({
          title: 'Email Verification Required',
          content: (
            <div style={{ marginTop: 12 }}>
              <p>Your email has not been confirmed yet. Please verify your email to log in.</p>
              <p>Didn&apos;t receive the email, or has the link expired?</p>
            </div>
          ),
          okText: 'Resend Verification Link',
          cancelText: 'Cancel',
          okCancel: true,
          centered: true,
          async onOk() {
            await handleResendVerification(values.email);
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
    <AuthPageLayout
      title="Welcome Back"
      subtitle="Sign in to your CampusShop account"
      footer={
        <Text type="secondary">
          Don&apos;t have an account?{' '}
          <Link to="/signup" className="auth-link">Create one</Link>
        </Text>
      }
    >
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
          rules={emailRules}
        >
          <Input
            prefix={<Mail size={16} />}
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
            prefix={<Lock size={16} />}
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
            Sign In
          </Button>
        </Form.Item>
      </Form>

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
            Enter your email below. We&apos;ll send you a secure link to reset your password.
          </Paragraph>
          
          <Form
            form={resetForm}
            layout="vertical"
            requiredMark={false}
            onFinish={async (values) => {
              setResetLoading(true);
              try {
                await resetPassword(values.email);
                message.success('Password reset link sent! Check your email inbox.');
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
              rules={emailRules}
            >
              <Input 
                prefix={<Mail size={16} />} 
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
    </AuthPageLayout>
  );
};

export default LoginPage;
