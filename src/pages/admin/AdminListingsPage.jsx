import { useEffect, useState } from 'react';
import { Table, Card, Tag, Button, Modal, Space, Typography, Spin, message, Select } from 'antd';
import { Trash2, Eye, AlertTriangle, RefreshCw } from 'lucide-react';
import { supabase } from '../../services/supabase';
import { deleteListing } from '../../services/listings';

const { Text } = Typography;

const AdminListingsPage = () => {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [deleteTarget, setDeleteTarget] = useState(null);

  useEffect(() => {
    loadListings();
  }, [statusFilter]);

  const loadListings = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from('listings')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);

      if (statusFilter !== 'all') {
        query = query.eq('status', statusFilter);
      }

      const { data, error } = await query;
      if (error) throw error;

      setListings((data || []).map((l) => ({
        key: l.id,
        id: l.id,
        title: l.title,
        price: l.price,
        category: l.category,
        condition: l.condition || '—',
        status: l.status || 'active',
        seller: l.seller_name || 'Anonymous',
        campus_id: l.campus_id,
        created: new Date(l.created_at).toLocaleDateString(),
      })));
    } catch (err) {
      console.error('Error loading listings:', err);
      message.error('Failed to load listings');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteListing(deleteTarget);
      message.success('Listing deleted');
      setDeleteTarget(null);
      loadListings();
    } catch (err) {
      message.error('Failed to delete listing');
    }
  };

  const handleStatusToggle = async (id, newStatus) => {
    try {
      const { error } = await supabase
        .from('listings')
        .update({ status: newStatus })
        .eq('id', id);

      if (error) throw error;
      message.success(`Listing marked as ${newStatus}`);
      loadListings();
    } catch (err) {
      message.error('Failed to update listing status');
    }
  };

  const columns = [
    {
      title: 'Title',
      dataIndex: 'title',
      key: 'title',
      ellipsis: true,
      render: (text) => <Text strong style={{ fontSize: 14 }}>{text}</Text>,
    },
    {
      title: 'Price',
      dataIndex: 'price',
      key: 'price',
      width: 120,
      render: (p) => `₦${Number(p).toLocaleString()}`,
    },
    {
      title: 'Category',
      dataIndex: 'category',
      key: 'category',
      width: 120,
      render: (cat) => <Tag>{cat}</Tag>,
    },
    {
      title: 'Condition',
      dataIndex: 'condition',
      key: 'condition',
      width: 100,
    },
    {
      title: 'Seller',
      dataIndex: 'seller',
      key: 'seller',
      width: 140,
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      width: 110,
      render: (status) => (
        <Tag color={status === 'active' ? 'green' : status === 'sold' ? 'default' : 'blue'}>
          {status}
        </Tag>
      ),
    },
    {
      title: 'Date',
      dataIndex: 'created',
      key: 'created',
      width: 100,
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 160,
      render: (_, record) => (
        <Space>
          <Select
            size="small"
            value={record.status}
            style={{ width: 90 }}
            onChange={(val) => handleStatusToggle(record.id, val)}
            options={[
              { value: 'active', label: 'Active' },
              { value: 'sold', label: 'Sold' },
              { value: 'flagged', label: 'Flagged' },
            ]}
          />
          <Button
            type="text"
            danger
            size="small"
            icon={<Trash2 size={14} />}
            onClick={() => setDeleteTarget(record.id)}
          />
        </Space>
      ),
    },
  ];

  return (
    <div>
      <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <Text strong style={{ fontSize: 18, color: '#0f172a' }}>Listing Moderation</Text>
          <Text type="secondary" style={{ display: 'block', fontSize: 13 }}>Review and manage all listings on the platform</Text>
        </div>
        <Space>
          <Select
            value={statusFilter}
            onChange={setStatusFilter}
            style={{ width: 140 }}
            options={[
              { value: 'all', label: 'All Statuses' },
              { value: 'active', label: 'Active Only' },
              { value: 'sold', label: 'Sold Only' },
              { value: 'flagged', label: 'Flagged Only' },
            ]}
          />
          <Button icon={<RefreshCw size={14} />} onClick={loadListings}>Refresh</Button>
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
          dataSource={listings}
          columns={columns}
          loading={loading}
          size="middle"
          pagination={{ pageSize: 20, showSizeChanger: true, showTotal: (t) => `${t} listings` }}
        />
      </Card>

      <Modal
        title="Delete Listing"
        open={!!deleteTarget}
        onCancel={() => setDeleteTarget(null)}
        onOk={handleDelete}
        okText="Delete"
        okButtonProps={{ danger: true }}
      >
        <Space>
          <AlertTriangle size={18} style={{ color: '#ef4444' }} />
          <Text>Are you sure you want to delete this listing? This action cannot be undone.</Text>
        </Space>
      </Modal>
    </div>
  );
};

export default AdminListingsPage;
