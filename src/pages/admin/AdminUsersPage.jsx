import { useEffect, useState } from 'react';
import { Table, Card, Tag, Button, Modal, Space, Typography, message, Select, Input } from 'antd';
import { Shield, ShieldOff, Search, RefreshCw, AlertTriangle } from 'lucide-react';
import { supabase } from '../../services/supabase';
import { useAuth } from '../../context/AuthContext';

const { Text } = Typography;

const AdminUsersPage = () => {
  const { currentUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [promoteTarget, setPromoteTarget] = useState(null);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    setLoading(true);
    try {
      // Fetch profiles (email is stored directly in profiles table by trigger)
      const { data, error } = await supabase
        .from('profiles')
        .select('*, campuses(name)')
        .order('created_at', { ascending: false })
        .limit(200);

      if (error) throw error;

      const enriched = (data || []).map((profile) => ({
        key: profile.id,
        id: profile.id,
        name: profile.name || 'Unknown',
        email: profile.email || '—',
        phone: profile.phone || '—',
        role: profile.role || 'user',
        campus: profile.campuses?.name || '—',
        created: new Date(profile.created_at).toLocaleDateString(),
        lastActive: profile.last_active
          ? new Date(profile.last_active).toLocaleDateString()
          : '—',
      }));

      setUsers(enriched);
    } catch (err) {
      console.error('Error loading users:', err);
      message.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const handlePromote = async () => {
    if (!promoteTarget) return;
    try {
      const newRole = promoteTarget.currentRole === 'admin' ? 'user' : 'admin';
      const { error } = await supabase
        .from('profiles')
        .update({ role: newRole })
        .eq('id', promoteTarget.id);

      if (error) throw error;
      message.success(`${promoteTarget.name} is now ${newRole === 'admin' ? 'an admin' : 'a regular user'}`);
      setPromoteTarget(null);
      loadUsers();
    } catch (err) {
      message.error('Failed to update role');
    }
  };

  const isSuperAdmin = currentUser?.role === 'super_admin';

  const filtered = users.filter((u) => {
    if (roleFilter !== 'all' && u.role !== roleFilter) return false;
    if (search) {
      const q = search.toLowerCase();
      return u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q);
    }
    return true;
  });

  const columns = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      render: (text) => <Text strong>{text}</Text>,
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
      ellipsis: true,
    },
    {
      title: 'Phone',
      dataIndex: 'phone',
      key: 'phone',
    },
    {
      title: 'Role',
      dataIndex: 'role',
      key: 'role',
      render: (role) => (
        <Tag
          color={role === 'super_admin' ? 'purple' : role === 'admin' ? 'blue' : 'default'}
          style={{ textTransform: 'capitalize' }}
        >
          {role.replace('_', ' ')}
        </Tag>
      ),
    },
    {
      title: 'Campus',
      dataIndex: 'campus',
      key: 'campus',
      ellipsis: true,
    },
    {
      title: 'Joined',
      dataIndex: 'created',
      key: 'created',
    },
    {
      title: 'Last Active',
      dataIndex: 'lastActive',
      key: 'lastActive',
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => {
        if (!isSuperAdmin) return null;
        if (record.role === 'super_admin') return <Text type="secondary">—</Text>;
        return (
          <Button
            type="link"
            size="small"
            icon={record.role === 'admin' ? <ShieldOff size={14} /> : <Shield size={14} />}
            onClick={() => setPromoteTarget({ id: record.id, name: record.name, currentRole: record.role })}
          >
            {record.role === 'admin' ? 'Demote' : 'Make Admin'}
          </Button>
        );
      },
    },
  ];

  return (
    <div>
      <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <Text strong style={{ fontSize: 18, color: '#0f172a' }}>User Management</Text>
          <Text type="secondary" style={{ display: 'block', fontSize: 13 }}>Manage user roles and access</Text>
        </div>
        <Space>
          <Input
            placeholder="Search users..."
            prefix={<Search size={14} style={{ color: '#94a3b8' }} />}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ width: 200 }}
          />
          <Select
            value={roleFilter}
            onChange={setRoleFilter}
            style={{ width: 140 }}
            options={[
              { value: 'all', label: 'All Roles' },
              { value: 'user', label: 'Users' },
              { value: 'admin', label: 'Admins' },
              { value: 'super_admin', label: 'Super Admins' },
            ]}
          />
          <Button icon={<RefreshCw size={14} />} onClick={loadUsers}>Refresh</Button>
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
          dataSource={filtered}
          columns={columns}
          loading={loading}
          size="middle"
          pagination={{ pageSize: 20, showSizeChanger: true, showTotal: (t) => `${t} users` }}
        />
      </Card>

      <Modal
        title="Change User Role"
        open={!!promoteTarget}
        onCancel={() => setPromoteTarget(null)}
        onOk={handlePromote}
        okText="Confirm"
      >
        <Space>
          <AlertTriangle size={18} style={{ color: '#f59e0b' }} />
          <Text>
            {promoteTarget?.currentRole === 'admin'
              ? `Remove admin privileges from "${promoteTarget?.name}"?`
              : `Make "${promoteTarget?.name}" an admin?`}
          </Text>
        </Space>
      </Modal>
    </div>
  );
};

export default AdminUsersPage;
