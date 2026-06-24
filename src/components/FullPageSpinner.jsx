import { Spin } from 'antd';

const FullPageSpinner = ({ tip }) => {
  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
      <Spin size="large" tip={tip} />
    </div>
  );
};

export default FullPageSpinner;
