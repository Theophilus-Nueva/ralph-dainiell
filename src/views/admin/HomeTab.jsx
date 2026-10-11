import React, { useState } from 'react';

export default function HomeTab({ data, onChange }) {
  const home = data.home || {};
  const heroWords = home.heroWords || [];
  const [newWord, setNewWord] = useState('');

  const handleUpdate = (field, value) => {
    onChange({
      ...data,
      home: {
        ...home,
        [field]: value,
      },
    });
  };

  const handleAddWord = (e) => {
    e.preventDefault();
    if (!newWord.trim()) return;
    handleUpdate('heroWords', [...heroWords, newWord.trim()]);
    setNewWord('');
  };

  const handleRemoveWord = (index) => {
    const updated = heroWords.filter((_, i) => i !== index);
    handleUpdate('heroWords', updated);
  };

  const handleWordChange = (index, value) => {
    const updated = [...heroWords];
    updated[index] = value;
    handleUpdate('heroWords', updated);
  };

  return (
    <div className="admin-tab-content">
      <div className="admin-section-header">
        <div>
          <h2>Home & Hero Section</h2>
          <p>Configure headline text, rotating split-flap keywords, and portrait settings.</p>
        </div>
      </div>

      <div className="admin-card-box">
        <h3 className="admin-card-title">Identity & Profile</h3>
        <div className="admin-form-row">
          <div className="admin-form-group">
            <label className="admin-label">Full Name</label>
            <input
              type="text"
              className="admin-input"
              value={home.name || ''}
              onChange={(e) => handleUpdate('name', e.target.value)}
              placeholder="Ralph Dainiell Gonzaga"
            />
            <div className="admin-hint">Display name rendered in title and metadata</div>
          </div>
          <div className="admin-form-group">
            <label className="admin-label">Portrait Photo URL or Path</label>
            <input
              type="text"
              className="admin-input"
              value={home.photo || ''}
              onChange={(e) => handleUpdate('photo', e.target.value)}
              placeholder="e.g. /assets/ralph-dainiell-transparent.png"
            />
            <div className="admin-hint">Image asset displayed in the hero portrait frame</div>
          </div>
        </div>

        {home.photo && (
          <div style={{ marginTop: '0.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <span className="admin-label" style={{ margin: 0 }}>Preview:</span>
            <img
              src={home.photo}
              alt="Portrait Preview"
              style={{
                width: '64px',
                height: '64px',
                objectFit: 'contain',
                background: '#050608',
                borderRadius: '6px',
                border: '1px solid var(--admin-border)',
                padding: '4px',
              }}
            />
          </div>
        )}
      </div>

      <div className="admin-card-box">
        <h3 className="admin-card-title">Split-Flap Rotating Words</h3>
        <p style={{ color: 'var(--admin-text-sub)', fontSize: '0.85rem', marginTop: 0 }}>
          These keywords cycle continuously in the hero terminal board (e.g. "Cybersecurity", "iOS Engineer").
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.25rem' }}>
          {heroWords.map((word, index) => (
            <div key={index} style={{ display: 'flex', gap: '0.65rem', alignItems: 'center' }}>
              <span className="admin-item-badge" style={{ minWidth: '24px', textAlign: 'center' }}>
                {index + 1}
              </span>
              <input
                type="text"
                className="admin-input"
                value={word}
                onChange={(e) => handleWordChange(index, e.target.value)}
                style={{ maxWidth: '380px' }}
              />
              <button
                type="button"
                className="admin-btn admin-btn-danger"
                style={{ padding: '0.45rem 0.75rem' }}
                onClick={() => handleRemoveWord(index)}
                title="Delete word"
              >
                ✕
              </button>
            </div>
          ))}
        </div>

        <form onSubmit={handleAddWord} style={{ display: 'flex', gap: '0.65rem', maxWidth: '440px' }}>
          <input
            type="text"
            className="admin-input"
            value={newWord}
            onChange={(e) => setNewWord(e.target.value)}
            placeholder="Add new keyword..."
          />
          <button type="submit" className="admin-btn admin-btn-primary">
            + Add Word
          </button>
        </form>
      </div>
    </div>
  );
}
