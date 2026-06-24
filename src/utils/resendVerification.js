import { message } from 'antd';
import { resendVerification } from '../services/auth';

export const handleResendVerification = async (email) => {
  try {
    message.loading({ content: 'Resending verification email...', key: 'resend' });
    await resendVerification(email);
    message.success({ content: 'Verification email resent! Check your inbox', key: 'resend', duration: 4 });
  } catch (err) {
    console.error('Resend error:', err);
    message.error({ content: err.message || 'Failed to resend verification email.', key: 'resend' });
  }
};
