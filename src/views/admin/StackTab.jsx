import React, { useState } from 'react';

export default function StackTab({ data, onChange }) {
  const stack = data.stack || {};
  const items = stack.items || [];
  const [newSkillName, setNewSkillName] = useState({});

  const handleUpdateItems = (newItems) => {
    onChange({
      ...data,
      stack: {
        ...stack,
        items: newItems,
      },
    });
  };

  const handleAddSkill = (catIdx) => {
    const name = (newSkillName[catIdx] || '').trim();
    if (!name) return;

    const updated = [...items];
    const category = [...updated[catIdx]];
    const skillList = [...category[1]];

    // Default badge parameters: [name, width, fontSize, weight, bg, textCol, glowCol]
    const newBadge = [name, 120, 16, 600, '#1d1e20', '#fff', '#00c8e0'];
    skillList.push(newBadge);
    category[1] = skillList;
    updated[catIdx] = category;

    handleUpdateItems(updated);
    setNewSkillName({ ...newSkillName, [catIdx]: '' });
  };

  const handleRemoveSkill = (catIdx, skillIdx) => {
    const updated = [...items];
    const category = [...updated[catIdx]];
    const skillList = category[1].filter((_, i) => i !== skillIdx);
    category[1] = skillList;
    updated[catIdx] = category;
    handleUpdateItems(updated);
  };

  const handleCategoryTitleChange = (catIdx, title) => {
    const updated = [...items];
    const category = [...updated[catIdx]];
    category[0] = title;
    updated[catIdx] = category;
    handleUpdateItems(updated);
  };

  return (
    <div className="admin-tab-content">
      <div className="admin-section-header">
        <div>
          <h2>Tech Stack & Skills</h2>
          <p>Configure technology badges grouped by domains (Languages, Security Tools, Databases, etc.).</p>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        {items.map((cat, catIdx) => {
          const [catTitle, skills] = cat;
          const displayTitle = (catTitle || '').replace('\n', ' ');
          return (
            <div key={catIdx} className="admin-card-box">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <input
                  type="text"
                  className="admin-input"
                  value={catTitle}
                  onChange={(e) => handleCategoryTitleChange(catIdx, e.target.value)}
                  style={{ fontWeight: '700', fontSize: '0.95rem', maxWidth: '360px' }}
                />
                <span className="admin-item-badge">{skills?.length || 0} skills</span>
              </div>

              <div className="admin-chips-container" style={{ marginBottom: '1.25rem' }}>
                {skills?.map((skill, skillIdx) => {
                  const [skillName, , , , bg, _textCol, glow] = skill;
                  return (
                    <span
                      key={skillIdx}
                      className="admin-chip"
                      style={{
                        background: typeof bg === 'string' && bg.startsWith('#') ? `${bg}22` : 'rgba(255,255,255,0.08)',
                        borderColor: glow && glow.startsWith('#') ? glow : 'var(--admin-border)',
                      }}
                    >
                      <span style={{ color: glow && glow.startsWith('#') ? glow : '#fff', fontWeight: '600' }}>
                        {skillName}
                      </span>
                      <button
                        type="button"
                        className="admin-chip-remove"
                        onClick={() => handleRemoveSkill(catIdx, skillIdx)}
                        title={`Remove ${skillName}`}
                      >
                        ✕
                      </button>
                    </span>
                  );
                })}
              </div>

              <div style={{ display: 'flex', gap: '0.5rem', maxWidth: '340px' }}>
                <input
                  type="text"
                  className="admin-input"
                  placeholder={`Add skill to ${displayTitle}...`}
                  value={newSkillName[catIdx] || ''}
                  onChange={(e) => setNewSkillName({ ...newSkillName, [catIdx]: e.target.value })}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddSkill(catIdx);
                    }
                  }}
                />
                <button
                  type="button"
                  className="admin-btn admin-btn-outline"
                  onClick={() => handleAddSkill(catIdx)}
                >
                  + Add
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
