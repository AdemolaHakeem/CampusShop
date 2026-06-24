import { Typography } from 'antd';
import logoIcon from '../assets/CampusShop2.0.png';

const { Title, Paragraph } = Typography;

const AuthPageLayout = ({ title, subtitle, children, footer }) => {
  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-header">
          <div className="auth-logo" style={{ background: 'transparent', boxShadow: 'none' }}>
            <img src={logoIcon} alt="CampusShop Logo" style={{ height: 60, width: 60, objectFit: 'contain' }} />
          </div>
          <Title level={2} style={{ margin: 0 }}>{title}</Title>
          <Paragraph type="secondary" style={{ margin: 0 }}>
            {subtitle}
          </Paragraph>
        </div>

        {children}

        {footer && <div className="auth-footer">{footer}</div>}
      </div>
    </div>
  );
};

export default AuthPageLayout;
