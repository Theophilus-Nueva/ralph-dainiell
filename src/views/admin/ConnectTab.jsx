import React from 'react';

export default function ConnectTab({ data, onChange }) {
  const connect = data.connect || {};
  const text = connect.text || [];
  const url = connect.url || {};

  const handleUpdate = (field, value) => {
    onChange({
      ...data,
      connect: {
        ...connect,
        [field]: value,
      },
    });
  };

  const handleUrlChange = (platform, value) => {
    onChange({
      ...data,
      connect: {
        ...connect,
        url: {
          ...url,
          [platform]: value,
        },
      },
    });
  };

  const handleHeadlineLineChange = (index, value) => {
    const updated = [...text];
    updated[index] = value;
    handleUpdate('text', updated);
  };

  return (
    <div className="admin-tab-content">
      <div className="admin-section-header">
        <div>
          <h2>Connect & Social Links</h2>
          <p>Update headline copy, contact endpoints, resume link, and meeting scheduling URL.</p>
        </div>
      </div>

      <div className="admin-card-box">
        <h3 className="admin-card-title">Closing Callout Headlines</h3>
        <div className="admin-form-row">
          <div className="admin-form-group">
            <label className="admin-label">Headline Line 1</label>
            <input
              type="text"
              className="admin-input"
              value={text[0] || ''}
              onChange={(e) => handleHeadlineLineChange(0, e.target.value)}
              placeholder="We’ve exhausted"
            />
          </div>
          <div className="admin-form-group">
            <label className="admin-label">Headline Line 2</label>
            <input
              type="text"
              className="admin-input"
              value={text[1] || ''}
              onChange={(e) => handleHeadlineLineChange(1, e.target.value)}
              placeholder="the pleasantries."
            />
          </div>
        </div>

        <div className="admin-form-group">
          <label className="admin-label">Subtitle Description</label>
          <input
            type="text"
            className="admin-input"
            value={connect.sub || ''}
            onChange={(e) => handleUpdate('sub', e.target.value)}
            placeholder="It’s time we synchronized our efforts."
          />
        </div>
      </div>

      <div className="admin-card-box">
        <h3 className="admin-card-title">Direct Social & Profile Links</h3>
        <div className="admin-form-row">
          <div className="admin-form-group">
            <label className="admin-label">Email Address / Mailto</label>
            <input
              type="text"
              className="admin-input"
              value={url.email || ''}
              onChange={(e) => handleUrlChange('email', e.target.value)}
              placeholder="mailto:gonzagaralphd@gmail.com"
            />
          </div>
          <div className="admin-form-group">
            <label className="admin-label">LinkedIn Profile URL</label>
            <input
              type="text"
              className="admin-input"
              value={url.linkedin || ''}
              onChange={(e) => handleUrlChange('linkedin', e.target.value)}
              placeholder="https://www.linkedin.com/in/ralph-dainiell"
            />
          </div>
        </div>

        <div className="admin-form-row">
          <div className="admin-form-group">
            <label className="admin-label">GitHub Profile URL</label>
            <input
              type="text"
              className="admin-input"
              value={url.github || ''}
              onChange={(e) => handleUrlChange('github', e.target.value)}
              placeholder="https://github.com/Dainiell"
            />
          </div>
          <div className="admin-form-group">
            <label className="admin-label">Instagram Profile URL</label>
            <input
              type="text"
              className="admin-input"
              value={url.instagram || ''}
              onChange={(e) => handleUrlChange('instagram', e.target.value)}
              placeholder="https://www.instagram.com/gonzagaralphh/"
            />
          </div>
        </div>

        <div className="admin-form-row">
          <div className="admin-form-group">
            <label className="admin-label">Resume Link (PDF / Cloud Document)</label>
            <input
              type="text"
              className="admin-input"
              value={url.resume || ''}
              onChange={(e) => handleUrlChange('resume', e.target.value)}
              placeholder="https://... (or /assets/resume.pdf)"
            />
          </div>
          <div className="admin-form-group">
            <label className="admin-label">Scheduling URL (Koalendar / Calendly)</label>
            <input
              type="text"
              className="admin-input"
              value={connect.scheduleUrl || ''}
              onChange={(e) => handleUpdate('scheduleUrl', e.target.value)}
              placeholder="https://koalendar.com/e/..."
            />
          </div>
        </div>
      </div>
    </div>
  );
}
