import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Form, Input, InputNumber, Select, Button, Typography, message, Card, Space, Row, Col, Upload, Grid
} from 'antd';
import {
  Tag, DollarSign, LayoutGrid, Image, Phone, Plus, ArrowLeft, Loader2,
  Camera, FileText, CheckCircle, Lightbulb,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { addListing, uploadListingImage } from '../services/listings';
import { CATEGORIES } from '../utils/categories';

const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;
const { useBreakpoint } = Grid;

const AddListingPage = () => {
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [imageUrl, setImageUrl] = useState('');
  const [form] = Form.useForm();
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const screens = useBreakpoint();

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
        campusId: currentUser.campusId || null,
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

  const progressSteps = [
    { num: 1, label: 'Item Details', desc: 'Basic information about your item', active: true },
    { num: 2, label: 'Item Photos', desc: 'Add photos of your item', active: false },
    { num: 3, label: 'Review & Post', desc: 'Review and publish your listing', active: false },
  ];

  const tips = [
    { icon: <Camera size={14} color="#16a34a" />, text: 'Use clear, well-lit photos' },
    { icon: <FileText size={14} color="#16a34a" />, text: 'Write a detailed description' },
    { icon: <DollarSign size={14} color="#16a34a" />, text: 'Set a fair, competitive price' },
    { icon: <Phone size={14} color="#16a34a" />, text: 'Respond to messages quickly' },
  ];

  return (
    <div className="add-listing-page">
      <div className="page-header">
        <Button
          type="text"
          icon={<ArrowLeft size={16} />}
          onClick={() => navigate('/market')}
          style={{ color: 'var(--text-secondary)', padding: '4px 0' }}
        >
          Back to Marketplace
        </Button>
        <Title level={2} style={{ margin: '8px 0 0', letterSpacing: '-0.5px' }}>
          Create New Listing
        </Title>
        <Paragraph type="secondary" style={{ margin: 0, fontSize: 14 }}>
          Fill in the details below to list your item for sale
        </Paragraph>
      </div>

      <div className="add-listing-layout">
        {/* Left sidebar — progress steps */}
        {screens.lg && (
          <div className="add-listing-sidebar">
            {progressSteps.map((step) => (
              <div key={step.num} className={`progress-step ${step.active ? 'active' : ''}`}>
                <div className="progress-step-num">{step.num}</div>
                <div>
                  <div className="progress-step-label">{step.label}</div>
                  <div className="progress-step-desc">{step.desc}</div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Main form */}
        <div className="add-listing-main">
          <Card className="form-card" style={{ margin: 0 }}>
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
                      prefix={<Tag size={16} />}
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
                      prefix={<DollarSign size={16} />}
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
                <Col xs={24} md={8}>
                  <Form.Item
                    name="category"
                    label="Category"
                    rules={[{ required: true, message: 'Select a category' }]}
                  >
                    <Select
                      placeholder="Select a category"
                      suffixIcon={<LayoutGrid size={14} />}
                      options={CATEGORIES.map((c) => ({ value: c, label: c }))}
                    />
                  </Form.Item>
                </Col>
                <Col xs={24} md={8}>
                  <Form.Item
                    name="condition"
                    label="Condition"
                  >
                    <Select
                      placeholder="Select condition"
                      options={[
                        { value: 'new', label: 'New' },
                        { value: 'like-new', label: 'Like New' },
                        { value: 'used', label: 'Used' },
                      ]}
                    />
                  </Form.Item>
                </Col>
                <Col xs={24} md={8}>
                  <Form.Item
                    name="sellerPhone"
                    label="WhatsApp Number"
                    tooltip="Include country code, e.g., +2348012345678"
                  >
                    <Input
                      prefix={<Phone size={16} />}
                      placeholder="+234 801 234 5678"
                    />
                  </Form.Item>
                </Col>
              </Row>

              {/* Image upload section */}
              <div style={{ 
                marginBottom: 24, 
                padding: 24, 
                borderRadius: 'var(--radius-lg)', 
                border: '1px solid var(--border-color)', 
                background: 'var(--bg-primary)' 
              }}>
                <div style={{ marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Camera size={16} color="var(--accent-blue)" />
                  <Text strong style={{ fontSize: 14 }}>Item Photos</Text>
                  <Text type="secondary" style={{ fontSize: 12, marginLeft: 4 }}>
                    Upload directly or paste a link
                  </Text>
                </div>

                <Row gutter={[20, 20]}>
                  <Col xs={24} sm={12}>
                    {imageUrl ? (
                      <div style={{
                        position: 'relative',
                        borderRadius: 'var(--radius-md)',
                        overflow: 'hidden',
                        border: '1px solid var(--border-color)',
                        height: 160,
                        background: 'var(--bg-card)',
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
                          icon={<Plus size={14} style={{ transform: 'rotate(45deg)' }} />}
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
                          padding: '20px 12px',
                          background: 'var(--bg-card)',
                          borderRadius: 'var(--radius-md)',
                          border: '2px dashed var(--border-color)',
                          height: 160,
                          display: 'flex',
                          flexDirection: 'column',
                          justifyContent: 'center',
                          alignItems: 'center'
                        }}
                      >
                        <p style={{ margin: '0 0 8px 0' }}>
                          {uploading ? (
                            <Loader2 size={28} color="var(--accent-blue)" className="animate-spin" />
                          ) : (
                            <Camera size={28} color="var(--accent-blue)" />
                          )}
                        </p>
                        <p style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)', margin: '0 0 4px 0' }}>
                          {uploading ? 'Uploading...' : 'Click to upload or drag and drop'}
                        </p>
                        <p style={{ fontSize: '11px', color: 'var(--text-tertiary)', margin: 0 }}>
                          PNG, JPG up to 5MB each
                        </p>
                      </Upload.Dragger>
                    )}
                  </Col>

                  <Col xs={24} sm={12} style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                    <div style={{ marginBottom: 8 }}>
                      <Text strong style={{ fontSize: 12, color: 'var(--text-primary)' }}>
                        Or Paste Image URL
                      </Text>
                    </div>

                    <Form.Item
                      name="imageURL"
                      noStyle
                      rules={[{ type: 'url', message: 'Please enter a valid URL' }]}
                    >
                      <Input
                        prefix={<Image size={16} color="var(--text-tertiary)" />}
                        placeholder="https://example.com/image.jpg"
                        onChange={(e) => {
                          setImageUrl(e.target.value);
                        }}
                        style={{ height: '44px', borderRadius: 'var(--radius-md)' }}
                      />
                    </Form.Item>

                    <Text type="secondary" style={{ fontSize: '11px', marginTop: 8, lineHeight: 1.4 }}>
                      If you have a direct link to an image online, paste it here instead.
                    </Text>
                  </Col>
                </Row>
              </div>

              <Form.Item style={{ marginTop: 8, marginBottom: 0 }}>
                <Button
                  type="primary"
                  htmlType="submit"
                  loading={loading}
                  block
                  className="submit-btn"
                  icon={<Plus size={16} />}
                >
                  Publish Listing
                </Button>
              </Form.Item>
            </Form>
          </Card>
        </div>

        {/* Right sidebar — tips */}
        {screens.lg && (
          <div className="add-listing-tips">
            <div className="tips-card">
              <div className="tips-title">
                <Lightbulb size={16} color="#eab308" style={{ marginRight: 8, verticalAlign: 'middle' }} />
                Listing Tips
              </div>
              {tips.map((tip, i) => (
                <div key={i} className="tip-item">
                  <div className="tip-icon">{tip.icon}</div>
                  <span className="tip-text">{tip.text}</span>
                </div>
              ))}
              <div style={{ 
                marginTop: 20, 
                padding: 16, 
                background: 'var(--accent-blue-bg)', 
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--accent-blue-border)',
              }}>
                <Text style={{ fontSize: 12, color: '#2563eb', fontWeight: 600, lineHeight: 1.5 }}>
                  💡 Items with photos sell 3x faster than those without!
                </Text>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AddListingPage;
