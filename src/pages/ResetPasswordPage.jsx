import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Form, Input, Button, message } from 'antd';
import { Lock } from 'lucide-react';
import { updatePassword } from '../services/auth';
import { createPasswordConfirmRules } from '../utils/formRules';
import AuthPageLayout from '../components/AuthPageLayout';

const ResetPasswordPage = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const onFinish = async (values) => {
    setLoading(true);
    try {
      await updatePassword(values.password);
      message.success('Password reset successfully! Please sign in with your new password.');
      navigate('/login');
    } catch (err) {
      console.error('Password reset error:', err);
      message.error(err.message || 'Failed to reset password. The link may have expired or is invalid.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthPageLayout
      title="Reset Password"
      subtitle="Create a secure new password for your account"
    >
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
            prefix={<Lock size={16} />}
            placeholder="Enter new password (min. 8 characters)"
            autoComplete="new-password"
          />
        </Form.Item>

        <Form.Item
          name="confirmPassword"
          dependencies={['password']}
          rules={createPasswordConfirmRules('password', 'Please confirm your new password', 'The two passwords do not match!')}
        >
          <Input.Password
            prefix={<Lock size={16} />}
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
            Update Password
          </Button>
        </Form.Item>
      </Form>
    </AuthPageLayout>
  );
};

export default ResetPasswordPage;
