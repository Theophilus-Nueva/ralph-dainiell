import React, { useState } from 'react';
import '../../styles/admin.css';
import HomeTab from './HomeTab';
import WorksTab from './WorksTab';
import CertsTab from './CertsTab';
import StackTab from './StackTab';
import ConnectTab from './ConnectTab';

export default function AdminView({
  data,
  onUpdateData,
  onSaveData,
  onResetData,
  onTogglePreview,
  onExit,
}) {
  const [activeTab, setActiveTab] = useState('home');
  const [toastMessage, setToastMessage] = useState(null);
  const [showExportModal, setShowExportModal] = useState(false);
  const [copied, setCopied] = useState(false);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3200);
  };

  const handleSave = () => {
    const success = onSaveData();
    if (success) {
      showToast('Changes saved to localStorage! (Server sync pending backend setup)');
    } else {
      showToast('Failed to save changes. Please try again.');
    }
  };

  const handleReset = () => {
    if (
      window.confirm(
        'Are you sure you want to revert all changes back to default portfolio constants?'
      )
    ) {
      onResetData();
      showToast('Portfolio data reset to initial defaults.');
    }
  };

  const handleCopyJson = () => {
    const jsonStr = JSON.stringify(data, null, 2);
    navigator.clipboard.writeText(jsonStr).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div className="admin-viewport">
      {/* Top Navigation */}
      <header className="admin-navbar">
        <div className="admin-nav-left">
          <div className="admin-brand">
            <span style={{ color: 'var(--admin-accent-cyan)' }}>RD //</span> ADMIN CONSOLE
          </div>
          <span className="admin-badge-terminal">EDIT ACCESS GRANTED</span>
        </div>

        <div className="admin-nav-actions">
          <button
            type="button"
            className="admin-btn admin-btn-outline"
            onClick={onTogglePreview}
            title="Preview current modifications on the live portfolio"
          >
            👁️ Live Preview
          </button>
          <button
            type="button"
            className="admin-btn admin-btn-outline"
            onClick={() => setShowExportModal(true)}
            title="Export portfolio configuration as JSON"
          >
            📋 Export JSON
          </button>
          <button
            type="button"
            className="admin-btn admin-btn-danger"
            onClick={handleReset}
            title="Reset data back to factory defaults"
          >
            ↺ Reset
          </button>
          <button
            type="button"
            className="admin-btn admin-btn-primary"
            onClick={handleSave}
            title="Save changes to local browser storage"
          >
            💾 Save Changes
          </button>
          <button
            type="button"
            className="admin-btn admin-btn-outline"
            onClick={onExit}
            title="Exit back to public portfolio"
          >
            Exit ↗
          </button>
        </div>
      </header>

      {/* Navigation Tabs Bar */}
      <nav className="admin-tabs-bar">
        <button
          type="button"
          className={`admin-tab ${activeTab === 'home' ? 'active' : ''}`}
          onClick={() => setActiveTab('home')}
        >
          🏠 Home & Hero
        </button>
        <button
          type="button"
          className={`admin-tab ${activeTab === 'works' ? 'active' : ''}`}
          onClick={() => setActiveTab('works')}
        >
          💼 Works & Lab
          <span className="admin-tab-count">{data.works?.apps?.length || 0}</span>
        </button>
        <button
          type="button"
          className={`admin-tab ${activeTab === 'certs' ? 'active' : ''}`}
          onClick={() => setActiveTab('certs')}
        >
          🎓 Certificates
          <span className="admin-tab-count">{data.certs?.list?.length || 0}</span>
        </button>
        <button
          type="button"
          className={`admin-tab ${activeTab === 'stack' ? 'active' : ''}`}
          onClick={() => setActiveTab('stack')}
        >
          ⚡ Tech Stack
          <span className="admin-tab-count">{data.stack?.items?.length || 0}</span>
        </button>
        <button
          type="button"
          className={`admin-tab ${activeTab === 'connect' ? 'active' : ''}`}
          onClick={() => setActiveTab('connect')}
        >
          📬 Connect & Socials
        </button>
      </nav>

      {/* Main Tab Panels */}
      <main className="admin-content">
        {activeTab === 'home' && <HomeTab data={data} onChange={onUpdateData} />}
        {activeTab === 'works' && <WorksTab data={data} onChange={onUpdateData} />}
        {activeTab === 'certs' && <CertsTab data={data} onChange={onUpdateData} />}
        {activeTab === 'stack' && <StackTab data={data} onChange={onUpdateData} />}
        {activeTab === 'connect' && <ConnectTab data={data} onChange={onUpdateData} />}
      </main>

      {/* Notification Toast */}
      {toastMessage && (
        <div className="admin-toast">
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Export JSON Modal */}
      {showExportModal && (
        <div className="admin-modal-overlay" onClick={() => setShowExportModal(false)}>
          <div className="admin-modal" onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal-header">
              <h3>Export Portfolio JSON</h3>
              <button
                type="button"
                className="admin-btn-icon"
                onClick={() => setShowExportModal(false)}
              >
                ✕
              </button>
            </div>
            <div className="admin-modal-body">
              <p style={{ margin: '0 0 1rem 0', color: 'var(--admin-text-sub)', fontSize: '0.85rem' }}>
                You can copy this JSON configuration to commit it directly or send it to your
                backend server when ready.
              </p>
              <pre className="admin-json-code">{JSON.stringify(data, null, 2)}</pre>
            </div>
            <div className="admin-modal-footer">
              <button
                type="button"
                className="admin-btn admin-btn-outline"
                onClick={() => setShowExportModal(false)}
              >
                Close
              </button>
              <button
                type="button"
                className="admin-btn admin-btn-primary"
                onClick={handleCopyJson}
              >
                {copied ? '✓ Copied to Clipboard!' : '📋 Copy JSON'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
