import { Empty, Typography, Space, Button } from 'antd';

const { Text } = Typography;

const EmptyState = ({ title, description, actionLabel, actionIcon, onAction }) => {
  return (
    <div className="empty-state">
      <Empty
        image={Empty.PRESENTED_IMAGE_SIMPLE}
        description={
          <Space direction="vertical" size={4}>
            <Text strong style={{ fontSize: 16 }}>{title}</Text>
            <Text type="secondary">{description}</Text>
          </Space>
        }
      >
        {actionLabel && onAction && (
          <Button type="primary" icon={actionIcon} onClick={onAction}>
            {actionLabel}
          </Button>
        )}
      </Empty>
    </div>
  );
};

export default EmptyState;
