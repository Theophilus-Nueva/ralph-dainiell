import React, { useState } from 'react';
import './Navbar.css';

const NAV_ITEMS = ['ABOUT', 'WORKS', 'CERTIFICATE', 'STACK', 'CONNECT'];

export default function Navbar({ activeSection, onNavigate }) {
  const [internalActive, setInternalActive] = useState('ABOUT');
  const currentActive = activeSection || internalActive;

  const handleClick = (item) => {
    setInternalActive(item);
    if (onNavigate) {
      onNavigate(item);
    } else if (item === 'ABOUT') {
      const el = document.getElementById('about');
      el?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <header className="navbar-wrapper">
      <nav className="navbar-pill" aria-label="Main Navigation">
        <ul className="nav-list">
          {NAV_ITEMS.map((item) => {
            const isActive = currentActive === item;
            return (
              <li key={item} className="nav-item">
                <button
                  type="button"
                  className={`nav-link ${isActive ? 'active' : ''}`}
                  onClick={() => handleClick(item)}
                  aria-current={isActive ? 'page' : undefined}
                >
                  <span className="nav-text">{item}</span>
                </button>
              </li>
            );
          })}
        </ul>
      </nav>
    </header>
  );
}
