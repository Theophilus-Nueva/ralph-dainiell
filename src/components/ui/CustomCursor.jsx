import React, { useEffect, useState, useRef } from 'react';
import './CustomCursor.css';

export default function CustomCursor() {
  const [isVisible, setIsVisible] = useState(false);
  const [cursorMode, setCursorMode] = useState('default'); // 'default' | 'selecting' | 'lens'
  const [isClicking, setIsClicking] = useState(false);
  const cursorRef = useRef(null);

  useEffect(() => {
    // Only enable custom cursor if fine pointer (mouse) is present
    const hasFinePointer = window.matchMedia('(pointer: fine)').matches;
    if (!hasFinePointer) return;

    const handleMouseMove = (e) => {
      if (!isVisible) setIsVisible(true);

      if (cursorRef.current) {
        cursorRef.current.style.transform = `translate3d(${e.clientX}px, ${e.clientY}px, 0)`;
      }

      const target = e.target;
      if (target) {
        if (target.closest('[data-cursor="lens"]')) {
          setCursorMode((prev) => (prev !== 'lens' ? 'lens' : prev));
        } else if (
          target.closest('a, button, [role="button"], input, textarea, select, .hero-badge, .nav-link')
        ) {
          setCursorMode((prev) => (prev !== 'selecting' ? 'selecting' : prev));
        } else {
          setCursorMode((prev) => (prev !== 'default' ? 'default' : prev));
        }
      }
    };

    const handleMouseDown = () => setIsClicking(true);
    const handleMouseUp = () => setIsClicking(false);

    const handleMouseEnter = () => setIsVisible(true);
    const handleMouseLeave = () => setIsVisible(false);

    // Detect cursor modes
    const handleMouseOver = (e) => {
      const target = e.target;
      if (!target) return;

      // Check if over the photo lens
      const isLens = target.closest('[data-cursor="lens"]');
      if (isLens) {
        setCursorMode('lens');
        return;
      }

      // Check if over interactive / selectable elements
      const isClickable = target.closest(
        'a, button, [role="button"], input, textarea, select, .hero-badge, .nav-link'
      );
      if (isClickable) {
        setCursorMode('selecting');
        return;
      }

      setCursorMode('default');
    };

    const handleSelectionChange = () => {
      const selection = window.getSelection();
      const hasTextSelected = selection && selection.toString().trim().length > 0;
      if (hasTextSelected) {
        setCursorMode('selecting');
      }
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    window.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mouseup', handleMouseUp);
    document.addEventListener('mouseenter', handleMouseEnter);
    document.addEventListener('mouseleave', handleMouseLeave);
    document.addEventListener('mouseover', handleMouseOver);
    document.addEventListener('selectionchange', handleSelectionChange);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('mouseenter', handleMouseEnter);
      document.removeEventListener('mouseleave', handleMouseLeave);
      document.removeEventListener('mouseover', handleMouseOver);
      document.removeEventListener('selectionchange', handleSelectionChange);
    };
  }, [isVisible]);

  return (
    <div
      ref={cursorRef}
      className={`custom-cursor ${isVisible ? 'visible' : ''} mode-${cursorMode} ${
        isClicking ? 'clicking' : ''
      }`}
      aria-hidden="true"
    >
      {/* Default circular pointer */}
      <div className="cursor-circle" />

      {/* Triangle pointer for selecting & interacting */}
      <svg
        viewBox="0 0 24 24"
        className="cursor-triangle"
        fill="currentColor"
      >
        <path d="M5.5 3.5a1.5 1.5 0 0 0-2.25 1.3v14.4a1.5 1.5 0 0 0 2.25 1.3l13.5-7.2a1.5 1.5 0 0 0 0-2.6L5.5 3.5z" />
      </svg>
    </div>
  );
}
