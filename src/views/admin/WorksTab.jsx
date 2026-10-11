import React, { useState } from 'react';

export default function WorksTab({ data, onChange }) {
  const works = data.works || {};
  const apps = works.apps || [];
  const lab = works.lab || {};
  const [activeSubTab, setActiveSubTab] = useState('apps'); // 'apps' | 'lab'

  const handleUpdateApps = (newApps) => {
    onChange({
      ...data,
      works: {
        ...works,
        apps: newApps,
      },
    });
  };

  const handleUpdateLab = (field, value) => {
    onChange({
      ...data,
      works: {
        ...works,
        lab: {
          ...lab,
          [field]: value,
        },
      },
    });
  };

  // App manipulation
  const handleAppFieldChange = (index, fieldIndex, value) => {
    const updated = [...apps];
    const item = [...updated[index]];
    item[fieldIndex] = value;
    updated[index] = item;
    handleUpdateApps(updated);
  };

  const handleTagsChange = (index, commaSeparatedTags) => {
    const tagsArray = commaSeparatedTags
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);
    handleAppFieldChange(index, 3, tagsArray);
  };

  const handleAddApp = () => {
    const nextNum = (apps.length + 1).toString().padStart(2, '0');
    const newApp = [
      '',
      `App Name ${nextNum}`,
      'A short description about what this application does and why you built it.',
      ['Swift', 'SwiftUI'],
      '#',
      [],
    ];
    handleUpdateApps([...apps, newApp]);
  };

  const handleDeleteApp = (index) => {
    if (apps.length <= 1) {
      alert('You must have at least one app in the portfolio.');
      return;
    }
    const updated = apps.filter((_, i) => i !== index);
    handleUpdateApps(updated);
  };

  const handleMoveApp = (index, direction) => {
    const targetIndex = index + direction;
    if (targetIndex < 0 || targetIndex >= apps.length) return;
    const updated = [...apps];
    const temp = updated[index];
    updated[index] = updated[targetIndex];
    updated[targetIndex] = temp;
    handleUpdateApps(updated);
  };

  // Lab link manipulation
  const handleLabLinkChange = (linkIdx, keyOrUrl, val) => {
    const links = [...(lab.links || [])];
    const linkItem = [...links[linkIdx]];
    if (keyOrUrl === 'name') linkItem[0] = val;
    else linkItem[1] = val;
    links[linkIdx] = linkItem;
    handleUpdateLab('links', links);
  };

  return (
    <div className="admin-tab-content">
      <div className="admin-section-header">
        <div>
          <h2>Works & Projects</h2>
          <p>Manage iOS Applications (macOS dock apps) and the CyberSec Analyst Lab.</p>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button
            type="button"
            className={`admin-btn ${activeSubTab === 'apps' ? 'admin-btn-primary' : 'admin-btn-outline'}`}
            onClick={() => setActiveSubTab('apps')}
          >
            iOS Apps ({apps.length})
          </button>
          <button
            type="button"
            className={`admin-btn ${activeSubTab === 'lab' ? 'admin-btn-primary' : 'admin-btn-outline'}`}
            onClick={() => setActiveSubTab('lab')}
          >
            CyberSec Lab
          </button>
        </div>
      </div>

      {activeSubTab === 'apps' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--admin-text-sub)' }}>
              These apps are displayed with interactive macOS dock icons and detail flyouts.
            </span>
            <button type="button" className="admin-btn admin-btn-success" onClick={handleAddApp}>
              + Add New App
            </button>
          </div>

          {apps.map((app, index) => {
            const [icon, name, desc, tags, url] = app;
            return (
              <div key={index} className="admin-item-card">
                <div className="admin-item-header">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                    <span className="admin-item-badge">#{index + 1}</span>
                    <strong style={{ color: '#fff', fontSize: '0.95rem' }}>{name || `App ${index + 1}`}</strong>
                  </div>
                  <div className="admin-item-actions">
                    <button
                      type="button"
                      className="admin-btn-icon"
                      disabled={index === 0}
                      onClick={() => handleMoveApp(index, -1)}
                      title="Move Up"
                    >
                      ▲
                    </button>
                    <button
                      type="button"
                      className="admin-btn-icon"
                      disabled={index === apps.length - 1}
                      onClick={() => handleMoveApp(index, 1)}
                      title="Move Down"
                    >
                      ▼
                    </button>
                    <button
                      type="button"
                      className="admin-btn-icon delete"
                      onClick={() => handleDeleteApp(index)}
                      title="Delete App"
                    >
                      ✕
                    </button>
                  </div>
                </div>

                <div className="admin-form-row">
                  <div className="admin-form-group">
                    <label className="admin-label">App Name</label>
                    <input
                      type="text"
                      className="admin-input"
                      value={name || ''}
                      onChange={(e) => handleAppFieldChange(index, 1, e.target.value)}
                      placeholder="e.g. Swift Notes"
                    />
                  </div>
                  <div className="admin-form-group">
                    <label className="admin-label">App Link / Repository URL</label>
                    <input
                      type="text"
                      className="admin-input"
                      value={url || ''}
                      onChange={(e) => handleAppFieldChange(index, 4, e.target.value)}
                      placeholder="https://github.com/... or #"
                    />
                  </div>
                </div>

                <div className="admin-form-group">
                  <label className="admin-label">Description / Story</label>
                  <textarea
                    className="admin-textarea"
                    rows={2}
                    value={desc || ''}
                    onChange={(e) => handleAppFieldChange(index, 2, e.target.value)}
                    placeholder="Why you built this app and key features..."
                  />
                </div>

                <div className="admin-form-row">
                  <div className="admin-form-group">
                    <label className="admin-label">Tech Stack Tags (Comma-Separated)</label>
                    <input
                      type="text"
                      className="admin-input"
                      value={Array.isArray(tags) ? tags.join(', ') : ''}
                      onChange={(e) => handleTagsChange(index, e.target.value)}
                      placeholder="Swift, SwiftUI, Realm, Supabase"
                    />
                    <div className="admin-chips-container">
                      {Array.isArray(tags) &&
                        tags.map((tag, tIdx) => (
                          <span key={tIdx} className="admin-chip">
                            {tag}
                          </span>
                        ))}
                    </div>
                  </div>
                  <div className="admin-form-group">
                    <label className="admin-label">Icon Image URL (Optional)</label>
                    <input
                      type="text"
                      className="admin-input"
                      value={icon || ''}
                      onChange={(e) => handleAppFieldChange(index, 0, e.target.value)}
                      placeholder="Leave blank for auto-generated 2-letter badge"
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {activeSubTab === 'lab' && (
        <div className="admin-card-box">
          <h3 className="admin-card-title">CyberSecurity SOC Lab Information</h3>
          <div className="admin-form-group">
            <label className="admin-label">Lab Title</label>
            <input
              type="text"
              className="admin-input"
              value={lab.title || ''}
              onChange={(e) => handleUpdateLab('title', e.target.value)}
              placeholder="Security Analyst Level 1"
            />
          </div>

          <div className="admin-form-group">
            <label className="admin-label">Description</label>
            <textarea
              className="admin-textarea"
              rows={3}
              value={lab.desc || ''}
              onChange={(e) => handleUpdateLab('desc', e.target.value)}
              placeholder="evaluate and train you to perform..."
            />
          </div>

          <div className="admin-form-row">
            <div className="admin-form-group">
              <label className="admin-label">Badge Image URL</label>
              <input
                type="text"
                className="admin-input"
                value={lab.badge || ''}
                onChange={(e) => handleUpdateLab('badge', e.target.value)}
                placeholder="Leave blank for built-in SVG shield badge"
              />
            </div>
            <div className="admin-form-group">
              <label className="admin-label">Media URL (Screenshot / Video MP4)</label>
              <input
                type="text"
                className="admin-input"
                value={lab.media || ''}
                onChange={(e) => handleUpdateLab('media', e.target.value)}
                placeholder="URL or path to media preview"
              />
            </div>
          </div>

          <div className="admin-form-group">
            <label className="admin-label">Verification & Code Links</label>
            {lab.links?.map((link, lIdx) => (
              <div key={lIdx} style={{ display: 'flex', gap: '0.75rem', marginBottom: '0.5rem' }}>
                <input
                  type="text"
                  className="admin-input"
                  style={{ width: '130px' }}
                  value={link[0] || ''}
                  onChange={(e) => handleLabLinkChange(lIdx, 'name', e.target.value)}
                  placeholder="Label (e.g. Github)"
                />
                <input
                  type="text"
                  className="admin-input"
                  value={link[1] || ''}
                  onChange={(e) => handleLabLinkChange(lIdx, 'url', e.target.value)}
                  placeholder="https://..."
                />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
