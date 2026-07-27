import { useEffect, useState } from 'react';
import { Table, Card, Tag, Button, Modal, Space, Typography, Spin, message, Input, Form } from 'antd';
import { Plus, RefreshCw, Trash2, Building2 } from 'lucide-react';
import { supabase } from '../../services/supabase';

const { Text } = Typography;

const AdminCampusesPage = () => {
  const [campuses, setCampuses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [form] = Form.useForm();
  const [submitting, setSubmitting] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);

  useEffect(() => {
    loadCampuses();
  }, []);

  const loadCampuses = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('campuses')
        .select('id, name, domain, created_at')
        .order('name', { ascending: true });

      if (error) throw error;

      // Get listing count per campus
      const { data: listingCounts } = await supabase
        .from('listings')
        .select('campus_id');

      const countMap = {};
      (listingCounts || []).forEach((l) => {
        if (l.campus_id) {
          countMap[l.campus_id] = (countMap[l.campus_id] || 0) + 1;
        }
      });

      setCampuses((data || []).map((c) => ({
        key: c.id,
        id: c.id,
        name: c.name,
        domain: c.domain || '—',
        listings: countMap[c.id] || 0,
        created: new Date(c.created_at).toLocaleDateString(),
      })));
    } catch (err) {
      console.error('Error loading campuses:', err);
      message.error('Failed to load campuses');
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = async () => {
    try {
      const values = await form.validateFields();
      setSubmitting(true);

      const { error } = await supabase
        .from('campuses')
        .insert([{
          name: values.name,
          domain: values.domain || null,
        }]);

      if (error) throw error;

      message.success(`Added ${values.name}`);
      setAddModalOpen(false);
      form.resetFields();
      loadCampuses();
    } catch (err) {
      if (err.errorFields) return; // validation errors
      message.error(err.message || 'Failed to add campus');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      const { error } = await supabase
        .from('campuses')
        .delete()
        .eq('id', deleteTarget);

      if (error) throw error;
      message.success('Campus removed');
      setDeleteTarget(null);
      loadCampuses();
    } catch (err) {
      message.error('Failed to delete campus');
    }
  };

  const columns = [
    {
      title: 'University',
      dataIndex: 'name',
      key: 'name',
      render: (text) => (
        <Space>
          <Building2 size={16} style={{ color: '#64748b' }} />
          <Text strong>{text}</Text>
        </Space>
      ),
    },
    {
      title: 'Domain',
      dataIndex: 'domain',
      key: 'domain',
      render: (d) => d !== '—' ? <Tag>{d}</Tag> : <Text type="secondary">—</Text>,
    },
    {
      title: 'Listings',
      dataIndex: 'listings',
      key: 'listings',
      width: 100,
      render: (count) => <Tag color={count > 0 ? 'blue' : 'default'}>{count}</Tag>,
    },
    {
      title: 'Added',
      dataIndex: 'created',
      key: 'created',
      width: 110,
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 80,
      render: (_, record) => (
        <Button
          type="text"
          danger
          size="small"
          icon={<Trash2 size={14} />}
          onClick={() => setDeleteTarget(record.id)}
        />
      ),
    },
  ];

  return (
    <div>
      <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <Text strong style={{ fontSize: 18, color: '#0f172a' }}>Campus Management</Text>
          <Text type="secondary" style={{ display: 'block', fontSize: 13 }}>
            {campuses.length} universities registered
          </Text>
        </div>
        <Space>
          <Button
            type="primary"
            icon={<Plus size={14} />}
            onClick={() => setAddModalOpen(true)}
            style={{ background: '#1a1f36' }}
          >
            Add Campus
          </Button>
          <Button icon={<RefreshCw size={14} />} onClick={loadCampuses}>Refresh</Button>
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
          dataSource={campuses}
          columns={columns}
          loading={loading}
          size="middle"
          pagination={{ pageSize: 30, showSizeChanger: true, showTotal: (t) => `${t} campuses` }}
        />
      </Card>

      {/* Add Campus Modal */}
      <Modal
        title="Add University"
        open={addModalOpen}
        onCancel={() => { setAddModalOpen(false); form.resetFields(); }}
        onOk={handleAdd}
        confirmLoading={submitting}
        okText="Add University"
      >
        <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
          <Form.Item
            name="name"
            label="University Name"
            rules={[{ required: true, message: 'University name is required' }]}
          >
            <Input placeholder="e.g. University of Ibadan" />
          </Form.Item>
          <Form.Item
            name="domain"
            label="Email Domain (optional)"
            tooltip="Students with this email domain will be matched to this campus automatically"
          >
            <Input placeholder="e.g. ui.edu.ng" />
          </Form.Item>
        </Form>
      </Modal>

      {/* Delete confirmation */}
      <Modal
        title="Remove Campus"
        open={!!deleteTarget}
        onCancel={() => setDeleteTarget(null)}
        onOk={handleDelete}
        okText="Remove"
        okButtonProps={{ danger: true }}
      >
        <Space>
          <Trash2 size={18} style={{ color: '#ef4444' }} />
          <Text>Remove this campus and its association with all listings?</Text>
        </Space>
      </Modal>
    </div>
  );
};

export default AdminCampusesPage;
