import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Form, Input, Button, Typography, message } from 'antd';
import { Lock, ArrowRight } from 'lucide-react';
import { updatePassword } from '../services/auth';
import logoIcon from '../assets/CampusShop2.0.png';

const { Title, Paragraph } = Typography;

const ResetPasswordPage = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const onFinish = async (values) => {
    setLoading(true);
    try {
      await updatePassword(values.password);
      message.success('Password reset successfully! Please sign in with your new password. 🔐');
      navigate('/login');
    } catch (err) {
      console.error('Password reset error:', err);
      message.error(err.message || 'Failed to reset password. The link may have expired or is invalid.');
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
          <Title level={2} style={{ margin: 0, letterSpacing: '-0.5px' }}>Reset Password</Title>
          <Paragraph type="secondary" style={{ margin: '4px 0 0' }}>
            Create a secure new password for your account
          </Paragraph>
        </div>

        <Form
          name="reset-password"
          layout="vertical"
          onFinish={onFinish}
          size="large"
          requiredMark={false}
          className="auth-form"
        >
          <Form.Item
            name="password"
            rules={[
              { required: true, message: 'Please enter your new password' },
              { min: 8, message: 'Password must be at least 8 characters' },
            ]}
          >
            <Input.Password
              prefix={<Lock size={16} color="#94a3b8" />}
              placeholder="Enter new password (min. 8 characters)"
              autoComplete="new-password"
            />
          </Form.Item>

          <Form.Item
            name="confirmPassword"
            dependencies={['password']}
            rules={[
              { required: true, message: 'Please confirm your new password' },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue('password') === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error('The two passwords do not match!'));
                },
              }),
            ]}
          >
            <Input.Password
              prefix={<Lock size={16} color="#94a3b8" />}
              placeholder="Confirm new password"
              autoComplete="new-password"
            />
          </Form.Item>

          <Form.Item style={{ marginBottom: 0 }}>
            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              block
              className="auth-btn"
            >
              Update Password <ArrowRight size={16} style={{ marginLeft: 6 }} />
            </Button>
          </Form.Item>
        </Form>
      </div>
    </div>
  );
};

export default ResetPasswordPage;
