import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Form, Input, InputNumber, Select, Button, Typography, message, Card, Space, Row, Col, Upload
} from 'antd';
import {
  TagOutlined, DollarOutlined, FileTextOutlined, AppstoreOutlined,
  PictureOutlined, PhoneOutlined, PlusOutlined, ArrowLeftOutlined, LoadingOutlined
} from '@ant-design/icons';
import { useAuth } from '../context/AuthContext';
import { addListing, uploadListingImage } from '../services/listings';
import { CATEGORIES } from '../utils/categories';

const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;

const AddListingPage = () => {
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [imageUrl, setImageUrl] = useState('');
  const [form] = Form.useForm();
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  const handleUpload = async (options) => {
    const { file, onSuccess, onError } = options;
    setUploading(true);
    try {
      const publicUrl = await uploadListingImage(file);
      setImageUrl(publicUrl);
      form.setFieldsValue({ imageURL: publicUrl });
      message.success('Image uploaded successfully! 📸');
      onSuccess("Ok");
    } catch (err) {
      console.error('Upload error:', err);
      message.error(err.message || 'Image upload failed. Please make sure storage is configured.');
      onError(err);
    } finally {
      setUploading(false);
    }
  };

  const onFinish = async (values) => {
    setLoading(true);
    try {
      await addListing({
        title: values.title,
        price: values.price,
        description: values.description,
        category: values.category,
        imageURL: values.imageURL || '',
        sellerId: currentUser.uid,
        sellerName: currentUser.displayName || 'Anonymous',
        sellerPhone: values.sellerPhone || '',
      });
      message.success('Listing created successfully! 🎉');
      form.resetFields();
      navigate('/market');
    } catch (err) {
      message.error('Failed to create listing. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="add-listing-page">
      <div className="page-header">
        <Button
          type="text"
          icon={<ArrowLeftOutlined />}
          onClick={() => navigate('/market')}
          style={{ color: 'var(--text-secondary)' }}
        >
          Back to Marketplace
        </Button>
        <Title level={2} style={{ margin: '8px 0 0' }}>
          <PlusOutlined style={{ marginRight: 8 }} />
          Create New Listing
        </Title>
        <Paragraph type="secondary" style={{ margin: 0 }}>
          Fill in the details below to list your item for sale
        </Paragraph>
      </div>

      <Card className="form-card">
        <Form
          form={form}
          name="addListing"
          layout="vertical"
          onFinish={onFinish}
          size="large"
          requiredMark={false}
        >
          <Row gutter={24}>
            <Col xs={24} md={12}>
              <Form.Item
                name="title"
                label="Item Title"
                rules={[{ required: true, message: 'Give your item a title' }]}
              >
                <Input
                  prefix={<TagOutlined />}
                  placeholder="e.g., MacBook Pro 2023"
                  maxLength={100}
                  showCount
                />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item
                name="price"
                label="Price (₦)"
                rules={[{ required: true, message: 'Set a price' }]}
              >
                <InputNumber
                  prefix={<DollarOutlined />}
                  placeholder="0"
                  min={0}
                  max={10000000}
                  style={{ width: '100%' }}
                  formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                  parser={(value) => value.replace(/,/g, '')}
                />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="description"
            label="Description"
            rules={[{ required: true, message: 'Describe your item' }]}
          >
            <TextArea
              placeholder="Describe the condition, features, and why someone should buy it..."
              rows={4}
              maxLength={500}
              showCount
            />
          </Form.Item>

          <Row gutter={24}>
            <Col xs={24} md={12}>
              <Form.Item
                name="category"
                label="Category"
                rules={[{ required: true, message: 'Select a category' }]}
              >
                <Select
                  placeholder="Select a category"
                  suffixIcon={<AppstoreOutlined />}
                  options={CATEGORIES.map((c) => ({ value: c, label: c }))}
                />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item
                name="sellerPhone"
                label="WhatsApp Number"
                tooltip="Include country code, e.g., +2348012345678"
              >
                <Input
                  prefix={<PhoneOutlined />}
                  placeholder="+234..."
                />
              </Form.Item>
            </Col>
          </Row>

          <Card 
            size="small"
            style={{ 
              marginBottom: 24, 
              borderRadius: 'var(--radius-md)', 
              border: '1px solid var(--border-color)',
              background: 'rgba(255,255,255,0.6)',
              overflow: 'hidden'
            }}
            bodyStyle={{ padding: 20 }}
          >
            <div style={{ marginBottom: 12 }}>
              <span style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)' }}>
                <PictureOutlined style={{ marginRight: 8, color: 'var(--accent)' }} />
                Item Photo
              </span>
              <span style={{ fontSize: '12px', color: 'var(--text-secondary)', marginLeft: 8 }}>
                (Upload directly or paste a link)
              </span>
            </div>

            <Row gutter={[20, 20]}>
              <Col xs={24} sm={12}>
                {imageUrl ? (
                  <div style={{
                    position: 'relative',
                    borderRadius: 'var(--radius-md)',
                    overflow: 'hidden',
                    border: '1px solid var(--border-color)',
                    height: 140,
                    background: 'var(--bg-primary)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <img 
                      src={imageUrl} 
                      alt="Uploaded Preview" 
                      style={{ width: '100%', height: '100%', objectFit: 'contain' }} 
                    />
                    <Button
                      type="primary"
                      danger
                      shape="circle"
                      size="small"
                      icon={<PlusOutlined style={{ transform: 'rotate(45deg)' }} />}
                      onClick={() => {
                        setImageUrl('');
                        form.setFieldsValue({ imageURL: '' });
                      }}
                      style={{
                        position: 'absolute',
                        top: 8,
                        right: 8,
                        boxShadow: '0 2px 8px rgba(0,0,0,0.15)'
                      }}
                    />
                  </div>
                ) : (
                  <Upload.Dragger
                    accept="image/*"
                    showUploadList={false}
                    customRequest={handleUpload}
                    disabled={uploading}
                    style={{
                      padding: '16px 8px',
                      background: 'var(--bg-primary)',
                      borderRadius: 'var(--radius-md)',
                      border: '2px dashed var(--border-color)',
                      height: 140,
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'center',
                      alignItems: 'center'
                    }}
                  >
                    <p style={{ margin: '0 0 8px 0' }}>
                      {uploading ? (
                        <LoadingOutlined style={{ fontSize: 24, color: 'var(--accent)' }} />
                      ) : (
                        <PictureOutlined style={{ fontSize: 24, color: 'var(--accent)' }} />
                      )}
                    </p>
                    <p style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)', margin: '0 0 2px 0' }}>
                      {uploading ? 'Uploading...' : 'Upload from Device/Camera'}
                    </p>
                    <p style={{ fontSize: '11px', color: 'var(--text-secondary)', margin: 0 }}>
                      Tap to open camera or files
                    </p>
                  </Upload.Dragger>
                )}
              </Col>
              
              <Col xs={24} sm={12} style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                <div style={{ marginBottom: 8 }}>
                  <Text strong style={{ fontSize: '12px', color: 'var(--text-primary)' }}>
                    Or Paste Image URL
                  </Text>
                </div>
                
                <Form.Item
                  name="imageURL"
                  noStyle
                  rules={[{ type: 'url', message: 'Please enter a valid URL' }]}
                >
                  <Input
                    prefix={<PictureOutlined style={{ color: 'var(--text-secondary)' }} />}
                    placeholder="https://example.com/image.jpg"
                    onChange={(e) => {
                      setImageUrl(e.target.value);
                    }}
                    style={{ height: '40px', borderRadius: 'var(--radius-md)' }}
                  />
                </Form.Item>
                
                <Text type="secondary" style={{ fontSize: '11px', marginTop: 8 }}>
                  If you have a direct link to an image online, paste it here instead.
                </Text>
              </Col>
            </Row>
          </Card>

          <Form.Item style={{ marginTop: 16, marginBottom: 0 }}>
            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              block
              className="submit-btn"
              icon={<PlusOutlined />}
            >
              Publish Listing
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default AddListingPage;
