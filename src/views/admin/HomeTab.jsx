import React, { useState, useRef } from 'react';
import { PHOTO, HERO_WORDS } from '../../data/portfolioData';

export default function HomeTab({ data, onChange }) {
  const home = data.home || {};
  const currentPhoto = home.photo || PHOTO;
  const currentResume = data.connect?.url?.resume || home.resume || '';
  const heroWords = home.heroWords || HERO_WORDS;

  const [wantsChangePhoto, setWantsChangePhoto] = useState(false);
  const [wantsChangeResume, setWantsChangeResume] = useState(false);
  const [wantsChangeWords, setWantsChangeWords] = useState(false);
  const [photoInputMode, setPhotoInputMode] = useState('upload'); // 'upload' | 'url'
  const [resumeInputMode, setResumeInputMode] = useState('upload'); // 'upload' | 'url'
  const [photoFileName, setPhotoFileName] = useState('');
  const [resumeFileName, setResumeFileName] = useState('');
  const [newWord, setNewWord] = useState('');

  const photoFileInputRef = useRef(null);
  const resumeFileInputRef = useRef(null);

  // Update hero words
  const handleUpdateHeroWords = (newWords) => {
    onChange({
      ...data,
      home: {
        ...home,
        heroWords: newWords,
      },
    });
  };

  const handleWordChange = (index, value) => {
    const updated = [...heroWords];
    updated[index] = value;
    handleUpdateHeroWords(updated);
  };

  const handleAddWord = (e) => {
    e.preventDefault();
    if (!newWord.trim()) return;
    handleUpdateHeroWords([...heroWords, newWord.trim()]);
    setNewWord('');
  };

  const handleRemoveWord = (index) => {
    if (heroWords.length <= 1) {
      alert('You need at least one rotating keyword.');
      return;
    }
    const updated = heroWords.filter((_, i) => i !== index);
    handleUpdateHeroWords(updated);
  };

  const handleResetWords = () => {
    handleUpdateHeroWords([...HERO_WORDS]);
  };

  // Update photo
  const handleUpdatePhoto = (value) => {
    onChange({
      ...data,
      home: {
        ...home,
        photo: value,
      },
    });
  };

  // Update resume across both home and connect objects
  const handleUpdateResume = (value) => {
    onChange({
      ...data,
      home: {
        ...home,
        resume: value,
      },
      connect: {
        ...data.connect,
        url: {
          ...(data.connect?.url || {}),
          resume: value,
        },
      },
    });
  };

  // File upload handler for Photo (converts to base64 Data URL)
  const handlePhotoFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Please select a valid image file (PNG, JPG, WebP, SVG).');
      return;
    }

    setPhotoFileName(file.name);
    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result;
      if (typeof result === 'string') {
        handleUpdatePhoto(result);
      }
    };
    reader.readAsDataURL(file);
  };

  // File upload handler for Resume (PDF or Doc)
  const handleResumeFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setResumeFileName(file.name);
    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result;
      if (typeof result === 'string') {
        handleUpdateResume(result);
      }
    };
    reader.readAsDataURL(file);
  };

  // Reset to defaults
  const handleResetPhoto = () => {
    handleUpdatePhoto(PHOTO);
    setPhotoFileName('');
  };

  const handleResetResume = () => {
    handleUpdateResume('https://YOUR_RESUME_LINK');
    setResumeFileName('');
  };

  return (
    <div className="admin-tab-content">
      <div className="admin-section-header">
        <div>
          <h2>Home & Hero Section</h2>
          <p>Manage your client's profile picture and resume credentials.</p>
        </div>
      </div>

      {/* 1. Permanent Client Identity Card */}
      <div className="admin-card-box">
        <div className="admin-identity-row">
          <div>
            <span className="admin-label">Client Identity</span>
            <h3 className="admin-identity-title">
              Ralph Dainiell Gonzaga
            </h3>
            <p className="admin-identity-subtitle">
              Client name and portfolio typography are permanent and locked against accidental modification.
            </p>
          </div>
          <span className="admin-badge-permanent">
            🔒 PERMANENT
          </span>
        </div>
      </div>

      {/* 2. Profile Picture Update Form */}
      <div className="admin-card-box">
        <div className="admin-card-header-flex">
          <div>
            <h3 className="admin-card-header-title">
              Profile Picture
            </h3>
            <p className="admin-card-header-desc">
              Controls the portrait photo displayed in the hero section and x-ray lens frame.
            </p>
          </div>

          <label className="admin-toggle-label">
            <span className={`admin-toggle-text ${wantsChangePhoto ? 'active' : ''}`}>
              {wantsChangePhoto ? 'Changing Photo' : 'Change Profile Picture?'}
            </span>
            <input
              type="checkbox"
              className="admin-toggle-checkbox"
              checked={wantsChangePhoto}
              onChange={(e) => setWantsChangePhoto(e.target.checked)}
            />
          </label>
        </div>

        {/* Current Photo Preview */}
        <div className={`admin-status-bar ${wantsChangePhoto ? 'with-margin' : ''}`}>
          <div className="admin-status-flex">
            <div className="admin-photo-frame">
              <img
                src={currentPhoto}
                alt="Current Profile"
                className="admin-photo-img"
              />
            </div>
            <div className="admin-status-info">
              <div className="admin-status-meta">
                <span className="admin-item-badge">Active Photo</span>
                {photoFileName && (
                  <span className="admin-status-filename">
                    {photoFileName}
                  </span>
                )}
              </div>
              <p className="admin-status-sub">
                {currentPhoto.startsWith('data:') ? '[Uploaded Local Image File]' : currentPhoto}
              </p>
            </div>
          </div>
          {currentPhoto !== PHOTO && (
            <button
              type="button"
              className="admin-btn admin-btn-outline admin-btn-sm"
              onClick={handleResetPhoto}
              title="Reset to default portrait asset"
            >
              ↺ Reset to Default
            </button>
          )}
        </div>

        {/* Conditional Form: When user chooses to change profile picture */}
        {wantsChangePhoto && (
          <div className="admin-expand-form">
            <div className="admin-button-group">
              <button
                type="button"
                className={`admin-btn admin-btn-sm ${photoInputMode === 'upload' ? 'admin-btn-primary' : 'admin-btn-outline'}`}
                onClick={() => setPhotoInputMode('upload')}
              >
                📁 Upload Image File
              </button>
              <button
                type="button"
                className={`admin-btn admin-btn-sm ${photoInputMode === 'url' ? 'admin-btn-primary' : 'admin-btn-outline'}`}
                onClick={() => setPhotoInputMode('url')}
              >
                🔗 Image URL / Path
              </button>
            </div>

            {photoInputMode === 'upload' ? (
              <div>
                <input
                  type="file"
                  ref={photoFileInputRef}
                  accept="image/png,image/jpeg,image/webp,image/svg+xml"
                  onChange={handlePhotoFileChange}
                  className="admin-hidden-input"
                />
                <div
                  onClick={() => photoFileInputRef.current?.click()}
                  className="admin-dropzone"
                >
                  <div className="admin-dropzone-icon">📸</div>
                  <strong className="admin-dropzone-title">
                    Click to browse and upload new portrait image
                  </strong>
                  <span className="admin-dropzone-desc">
                    Supports PNG, JPG, WebP, or SVG (Transparent PNG recommended)
                  </span>
                </div>
              </div>
            ) : (
              <div className="admin-form-group no-margin">
                <label className="admin-label">Image URL or Local Asset Path</label>
                <input
                  type="text"
                  className="admin-input"
                  value={currentPhoto.startsWith('data:') ? '' : currentPhoto}
                  onChange={(e) => handleUpdatePhoto(e.target.value)}
                  placeholder="e.g. /assets/ralph-dainiell-transparent.png or https://example.com/photo.png"
                />
                <div className="admin-hint">Provide an absolute image URL or path in public assets</div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* 3. Resume Update Form */}
      <div className="admin-card-box">
        <div className="admin-card-header-flex">
          <div>
            <h3 className="admin-card-header-title">
              Resume / CV Document
            </h3>
            <p className="admin-card-header-desc">
              Controls the download and preview target for the "Resume" button in the hero header.
            </p>
          </div>

          <label className="admin-toggle-label">
            <span className={`admin-toggle-text ${wantsChangeResume ? 'active' : ''}`}>
              {wantsChangeResume ? 'Updating Resume' : 'Update Resume?'}
            </span>
            <input
              type="checkbox"
              className="admin-toggle-checkbox"
              checked={wantsChangeResume}
              onChange={(e) => setWantsChangeResume(e.target.checked)}
            />
          </label>
        </div>

        {/* Current Resume Status Bar */}
        <div className={`admin-status-bar ${wantsChangeResume ? 'with-margin' : ''}`}>
          <div className="admin-status-flex">
            <span className="admin-dropzone-icon">📄</span>
            <div className="admin-status-info">
              <div className="admin-status-meta">
                <span className="admin-item-badge">Current Resume Target</span>
                {resumeFileName && (
                  <span className="admin-status-filename">
                    {resumeFileName}
                  </span>
                )}
              </div>
              <p className="admin-status-sub">
                {currentResume.startsWith('data:') ? '[Uploaded Local Document File]' : currentResume || 'No link configured'}
              </p>
            </div>
          </div>

          <div className="admin-status-actions">
            {currentResume && currentResume !== 'https://YOUR_RESUME_LINK' && (
              <a
                href={currentResume}
                target="_blank"
                rel="noopener noreferrer"
                className="admin-btn admin-btn-outline admin-btn-sm"
              >
                👁️ View Current Resume ↗
              </a>
            )}
            {currentResume && currentResume !== 'https://YOUR_RESUME_LINK' && (
              <button
                type="button"
                className="admin-btn admin-btn-outline admin-btn-sm"
                onClick={handleResetResume}
                title="Reset to default placeholder"
              >
                ↺ Reset
              </button>
            )}
          </div>
        </div>

        {/* Conditional Form: When user chooses to update resume */}
        {wantsChangeResume && (
          <div className="admin-expand-form">
            <div className="admin-button-group">
              <button
                type="button"
                className={`admin-btn admin-btn-sm ${resumeInputMode === 'upload' ? 'admin-btn-primary' : 'admin-btn-outline'}`}
                onClick={() => setResumeInputMode('upload')}
              >
                📁 Upload Resume File (PDF)
              </button>
              <button
                type="button"
                className={`admin-btn admin-btn-sm ${resumeInputMode === 'url' ? 'admin-btn-primary' : 'admin-btn-outline'}`}
                onClick={() => setResumeInputMode('url')}
              >
                🔗 External Link / URL
              </button>
            </div>

            {resumeInputMode === 'upload' ? (
              <div>
                <input
                  type="file"
                  ref={resumeFileInputRef}
                  accept=".pdf,.doc,.docx"
                  onChange={handleResumeFileChange}
                  className="admin-hidden-input"
                />
                <div
                  onClick={() => resumeFileInputRef.current?.click()}
                  className="admin-dropzone"
                >
                  <div className="admin-dropzone-icon">📄</div>
                  <strong className="admin-dropzone-title">
                    Click to select and upload new Resume file
                  </strong>
                  <span className="admin-dropzone-desc">
                    Accepted formats: PDF (.pdf), Word Document (.docx, .doc)
                  </span>
                </div>
              </div>
            ) : (
              <div className="admin-form-group no-margin">
                <label className="admin-label">Direct Resume Document URL</label>
                <input
                  type="text"
                  className="admin-input"
                  value={currentResume.startsWith('data:') ? '' : currentResume}
                  onChange={(e) => handleUpdateResume(e.target.value)}
                  placeholder="e.g. https://drive.google.com/... or https://yourdomain.com/resume.pdf"
                />
                <div className="admin-hint">
                  Paste a direct link to your PDF hosted on Google Drive, Dropbox, LinkedIn, or personal domain
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* 4. Split-Flap Rotating Word Changing Effect */}
      <div className="admin-card-box">
        <div className="admin-card-header-flex">
          <div>
            <h3 className="admin-card-header-title">
              Rotating Word Changing Effect
            </h3>
            <p className="admin-card-header-desc">
              Controls the animated rotating words flip effect on the hero board (currently "Cybersecurity", "iOS Engineer").
            </p>
          </div>

          <label className="admin-toggle-label">
            <span className={`admin-toggle-text ${wantsChangeWords ? 'active' : ''}`}>
              {wantsChangeWords ? 'Editing Words' : 'Change Rotating Words?'}
            </span>
            <input
              type="checkbox"
              className="admin-toggle-checkbox"
              checked={wantsChangeWords}
              onChange={(e) => setWantsChangeWords(e.target.checked)}
            />
          </label>
        </div>

        {/* Current Active Keywords Status */}
        <div className={`admin-status-bar ${wantsChangeWords ? 'with-margin' : ''}`}>
          <div className="admin-chips-preview">
            <span className="admin-item-badge">Active Flip Words ({heroWords.length})</span>
            {heroWords.map((word, wIdx) => (
              <span
                key={wIdx}
                className="admin-chip admin-chip-active"
              >
                {word}
              </span>
            ))}
          </div>

          <button
            type="button"
            className="admin-btn admin-btn-outline admin-btn-sm"
            onClick={handleResetWords}
            title="Reset keywords back to factory defaults"
          >
            ↺ Reset to Default
          </button>
        </div>

        {/* Conditional Form: When user chooses to change the rotating words */}
        {wantsChangeWords && (
          <div className="admin-expand-form">
            <p className="admin-form-desc">
              Edit existing titles or add new ones. Each keyword will flip and cycle continuously in the hero terminal board.
            </p>

            <div className="admin-words-list">
              {heroWords.map((word, index) => (
                <div key={index} className="admin-word-row">
                  <span className="admin-item-badge badge-compact">
                    #{index + 1}
                  </span>
                  <input
                    type="text"
                    className="admin-input admin-word-input"
                    value={word}
                    onChange={(e) => handleWordChange(index, e.target.value)}
                    placeholder="e.g. Cybersecurity, iOS Engineer, etc."
                  />
                  <button
                    type="button"
                    className="admin-btn admin-btn-danger"
                    onClick={() => handleRemoveWord(index)}
                    title="Delete this rotating keyword"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>

            <form onSubmit={handleAddWord} className="admin-word-form">
              <input
                type="text"
                className="admin-input"
                value={newWord}
                onChange={(e) => setNewWord(e.target.value)}
                placeholder="Add new title (e.g. Security Analyst)..."
              />
              <button type="submit" className="admin-btn admin-btn-primary">
                + Add Word
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
