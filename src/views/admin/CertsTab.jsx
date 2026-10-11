import React from 'react';

const LOGO_OPTIONS = [
  { value: 'letsdefend', label: 'LetsDefend' },
  { value: 'tryhackme', label: 'TryHackMe' },
  { value: 'cisco', label: 'Cisco' },
  { value: 'google', label: 'Google' },
  { value: 'meta', label: 'Meta' },
  { value: 'packt', label: 'PackT' },
];

export default function CertsTab({ data, onChange }) {
  const certs = data.certs || {};
  const list = certs.list || [];

  const handleUpdateList = (newList) => {
    onChange({
      ...data,
      certs: {
        ...certs,
        list: newList,
      },
    });
  };

  const handleCertFieldChange = (index, fieldIndex, value) => {
    const updated = [...list];
    const item = [...updated[index]];
    item[fieldIndex] = value;
    updated[index] = item;
    handleUpdateList(updated);
  };

  const handleAddCert = () => {
    const newCert = ['letsdefend', 'New Certificate Title', 'LetsDefend', '#'];
    // Added at top as newer certifications go first
    handleUpdateList([newCert, ...list]);
  };

  const handleDeleteCert = (index) => {
    const updated = list.filter((_, i) => i !== index);
    handleUpdateList(updated);
  };

  const handleMoveCert = (index, direction) => {
    const targetIndex = index + direction;
    if (targetIndex < 0 || targetIndex >= list.length) return;
    const updated = [...list];
    const temp = updated[index];
    updated[index] = updated[targetIndex];
    updated[targetIndex] = temp;
    handleUpdateList(updated);
  };

  return (
    <div className="admin-tab-content">
      <div className="admin-section-header">
        <div>
          <h2>Certificates & Credentials</h2>
          <p>Manage your verified certifications, issuers, and verification credentials.</p>
        </div>
        <button type="button" className="admin-btn admin-btn-success" onClick={handleAddCert}>
          + Add Certificate (Newest First)
        </button>
      </div>

      <div className="admin-list-col">
        {list.map((cert, index) => {
          const [logoKey, title, issuer, verifyUrl] = cert;
          return (
            <div key={index} className="admin-item-card">
              <div className="admin-item-header">
                <div className="admin-item-title-wrap">
                  <span className="admin-item-badge">#{index + 1}</span>
                  <strong className="admin-item-title">
                    {title || `Certificate ${index + 1}`}
                  </strong>
                  <span className="admin-item-subtitle">({issuer})</span>
                </div>
                <div className="admin-item-actions">
                  <button
                    type="button"
                    className="admin-btn-icon"
                    disabled={index === 0}
                    onClick={() => handleMoveCert(index, -1)}
                    title="Move Up"
                  >
                    ▲
                  </button>
                  <button
                    type="button"
                    className="admin-btn-icon"
                    disabled={index === list.length - 1}
                    onClick={() => handleMoveCert(index, 1)}
                    title="Move Down"
                  >
                    ▼
                  </button>
                  <button
                    type="button"
                    className="admin-btn-icon delete"
                    onClick={() => handleDeleteCert(index)}
                    title="Delete Certificate"
                  >
                    ✕
                  </button>
                </div>
              </div>

              <div className="admin-form-row">
                <div className="admin-form-group">
                  <label className="admin-label">Certification Title</label>
                  <input
                    type="text"
                    className="admin-input"
                    value={title || ''}
                    onChange={(e) => handleCertFieldChange(index, 1, e.target.value)}
                    placeholder="e.g. SOC Fundamentals"
                  />
                </div>
                <div className="admin-form-group">
                  <label className="admin-label">Issuing Organization</label>
                  <input
                    type="text"
                    className="admin-input"
                    value={issuer || ''}
                    onChange={(e) => handleCertFieldChange(index, 2, e.target.value)}
                    placeholder="e.g. LetsDefend"
                  />
                </div>
              </div>

              <div className="admin-form-row">
                <div className="admin-form-group">
                  <label className="admin-label">Logo Icon Provider</label>
                  <select
                    className="admin-select"
                    value={logoKey || 'letsdefend'}
                    onChange={(e) => handleCertFieldChange(index, 0, e.target.value)}
                  >
                    {LOGO_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="admin-form-group">
                  <label className="admin-label">Verify Credential URL</label>
                  <input
                    type="text"
                    className="admin-input"
                    value={verifyUrl || ''}
                    onChange={(e) => handleCertFieldChange(index, 3, e.target.value)}
                    placeholder="https://coursera.org/verify/... or #"
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
