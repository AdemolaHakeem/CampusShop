import { useEffect, useState } from 'react';
import { Table, Card, Tag, Button, Space, Typography, message, Select, Modal } from 'antd';
import { AlertTriangle, RefreshCw, CheckCircle, XCircle, Eye } from 'lucide-react';
import { getReports, updateReportStatus } from '../../services/reports';
import { useNavigate } from 'react-router-dom';

const { Text } = Typography;

const AdminReportsPage = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const navigate = useNavigate();

  useEffect(() => {
    loadReports();
  }, [statusFilter]);

  const loadReports = async () => {
    setLoading(true);
    try {
      const data = await getReports(statusFilter);
      setReports(data.map((r) => ({
        key: r.id,
        id: r.id,
        listingId: r.listing_id,
        title: r.listing?.title || 'Deleted listing',
        seller: r.listing?.seller_name || 'Unknown',
        price: r.listing?.price || 0,
        reporter: r.reporter?.name || 'Anonymous',
        reason: r.reason,
        description: r.description || '—',
        status: r.status,
        created: new Date(r.created_at).toLocaleDateString(),
      })));
    } catch (err) {
      message.error('Failed to load reports');
    } finally {
      setLoading(false);
    }
  };

  const handleStatus = async (reportId, newStatus) => {
    try {
      await updateReportStatus(reportId, newStatus);
      message.success(`Report ${newStatus}`);
      loadReports();
    } catch (err) {
      message.error('Failed to update report');
    }
  };

  const columns = [
    {
      title: 'Listing',
      dataIndex: 'title',
      key: 'title',
      ellipsis: true,
      render: (text, record) => (
        <Button type="link" style={{ padding: 0 }} onClick={() => navigate(`/listing/${record.listingId}`)}>
          {text}
        </Button>
      ),
    },
    {
      title: 'Seller',
      dataIndex: 'seller',
      key: 'seller',
    },
    { title: 'Price', dataIndex: 'price', key: 'price', render: (p) => `₦${Number(p).toLocaleString()}` },
    { title: 'Reported By', dataIndex: 'reporter', key: 'reporter' },
    {
      title: 'Reason',
      dataIndex: 'reason',
      key: 'reason',
      render: (reason) => <Tag color="red">{reason}</Tag>,
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Tag color={status === 'pending' ? 'orange' : status === 'reviewed' ? 'green' : 'default'}>
          {status}
        </Tag>
      ),
    },
    { title: 'Date', dataIndex: 'created', key: 'created' },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space>
          {record.status === 'pending' && (
            <>
              <Button
                size="small"
                type="primary"
                icon={<CheckCircle size={14} />}
                onClick={() => handleStatus(record.id, 'reviewed')}
                style={{ background: '#16a34a' }}
              >
                Resolve
              </Button>
              <Button
                size="small"
                icon={<XCircle size={14} />}
                onClick={() => handleStatus(record.id, 'dismissed')}
              >
                Dismiss
              </Button>
            </>
          )}
        </Space>
      ),
    },
  ];

  return (
    <div>
      <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <Text strong style={{ fontSize: 18, color: '#0f172a' }}>Reported Listings</Text>
          <Text type="secondary" style={{ display: 'block', fontSize: 13 }}>
            Review and resolve user reports
          </Text>
        </div>
        <Space>
          <Select
            value={statusFilter}
            onChange={setStatusFilter}
            style={{ width: 140 }}
            options={[
              { value: 'all', label: 'All Reports' },
              { value: 'pending', label: 'Pending' },
              { value: 'reviewed', label: 'Reviewed' },
              { value: 'dismissed', label: 'Dismissed' },
            ]}
          />
          <Button icon={<RefreshCw size={14} />} onClick={loadReports}>Refresh</Button>
        </Space>
      </div>

      <Card
        style={{
          borderRadius: 12,
          border: '1px solid #e2e8f0',
          boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
        }}
      >
        <Table
          dataSource={reports}
          columns={columns}
          loading={loading}
          size="middle"
          pagination={{ pageSize: 20, showSizeChanger: true, showTotal: (t) => `${t} reports` }}
        />
      </Card>
    </div>
  );
};

export default AdminReportsPage;
