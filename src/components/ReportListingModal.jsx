import { useState, useEffect } from 'react';
import { Modal, Rate, Input, message, Select } from 'antd';
import { AlertTriangle } from 'lucide-react';
import { submitReport, REPORT_REASONS } from '../services/reports';

const { TextArea } = Input;

const ReportListingModal = ({ listingId, open, onClose }) => {
  const [reason, setReason] = useState('');
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [step, setStep] = useState('form');

  const handleSubmit = async () => {
    if (!reason) {
      message.warning('Please select a reason');
      return;
    }

    setSubmitting(true);
    try {
      await submitReport({
        listingId,
        reason,
        description,
      });
      setStep('success');
      setTimeout(() => {
        setStep('form');
        setReason('');
        setDescription('');
        onClose();
      }, 2000);
    } catch (err) {
      message.error('Failed to submit report. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    setStep('form');
    setReason('');
    setDescription('');
    onClose();
  };

  return (
    <Modal
      title={
        <span>
          <AlertTriangle size={16} style={{ color: '#ef4444', marginRight: 8, verticalAlign: 'middle' }} />
          Report Listing
        </span>
      }
      open={open}
      onCancel={handleClose}
      onOk={step === 'form' ? handleSubmit : undefined}
      okText={step === 'form' ? 'Submit Report' : undefined}
      confirmLoading={submitting}
      cancelText="Cancel"
      okButtonProps={step === 'form' ? { danger: true, style: { display: step === 'form' ? 'inline-flex' : 'none' } } : { style: { display: 'none' } }}
    >
      {step === 'form' ? (
        <div style={{ marginTop: 8 }}>
          <p style={{ color: '#64748b', marginBottom: 16, fontSize: 14 }}>
            Help keep CampusShop safe. Let us know why you're reporting this listing.
          </p>
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', marginBottom: 6, fontWeight: 500, fontSize: 13, color: '#0f172a' }}>
              Reason for report <span style={{ color: '#ef4444' }}>*</span>
            </label>
            <Select
              placeholder="Select a reason"
              value={reason}
              onChange={setReason}
              style={{ width: '100%' }}
              options={REPORT_REASONS.map((r) => ({ value: r, label: r }))}
            />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: 6, fontWeight: 500, fontSize: 13, color: '#0f172a' }}>
              Additional details (optional)
            </label>
            <TextArea
              placeholder="Provide any extra information that might help us review this listing..."
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              maxLength={500}
              showCount
            />
          </div>
        </div>
      ) : (
        <div style={{ textAlign: 'center', padding: '24px 0' }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>✅</div>
          <strong>Report submitted!</strong>
          <p style={{ color: '#64748b', margin: '8px 0 0', fontSize: 14 }}>
            Our team will review this listing shortly.
          </p>
        </div>
      )}
    </Modal>
  );
};

export default ReportListingModal;
