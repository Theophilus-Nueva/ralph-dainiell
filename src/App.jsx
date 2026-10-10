import React, { useState, useEffect, useRef } from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import About from './components/About';
import CustomCursor from './components/ui/CustomCursor';
import './App.css';

function App() {
  const [activeSection, setActiveSection] = useState('ABOUT');
  const isAutoScrollingRef = useRef(false);
  const currentSectionRef = useRef('hero');
  const touchStartYRef = useRef(0);

  const scrollToSection = (sectionId) => {
    const el = document.getElementById(sectionId);
    if (!el) return;

    isAutoScrollingRef.current = true;
    currentSectionRef.current = sectionId;
    if (sectionId === 'about') {
      setActiveSection('ABOUT');
    }

    el.scrollIntoView({ behavior: 'smooth', block: 'start' });

    setTimeout(() => {
      isAutoScrollingRef.current = false;
    }, 850);
  };

  useEffect(() => {
    const heroEl = document.getElementById('hero');
    const aboutEl = document.getElementById('about');

    // Sync section awareness via IntersectionObserver
    const observer = new IntersectionObserver(
      (entries) => {
        if (isAutoScrollingRef.current) return;
        entries.forEach((entry) => {
          if (entry.isIntersecting && entry.intersectionRatio >= 0.45) {
            currentSectionRef.current = entry.target.id;
            if (entry.target.id === 'about') {
              setActiveSection('ABOUT');
            }
          }
        });
      },
      { threshold: [0.45, 0.7] }
    );

    if (heroEl) observer.observe(heroEl);
    if (aboutEl) observer.observe(aboutEl);

    // Auto-scroll on wheel gesture when user scrolls for a bit
    const handleWheel = (e) => {
      if (isAutoScrollingRef.current) return;

      const delta = e.deltaY;
      const scrollY = window.scrollY || window.pageYOffset;

      // When at Hero section and scrolling down for a bit
      if (currentSectionRef.current === 'hero' || scrollY < 100) {
        if (delta > 20) {
          scrollToSection('about');
        }
      } 
      // When at About section and scrolling up
      else if (currentSectionRef.current === 'about' || scrollY >= (aboutEl?.offsetTop || 400) - 100) {
        if (delta < -20) {
          scrollToSection('hero');
        }
      }
    };

    // Auto-scroll on touch gestures for mobile screens
    const handleTouchStart = (e) => {
      if (e.touches && e.touches[0]) {
        touchStartYRef.current = e.touches[0].clientY;
      }
    };

    const handleTouchMove = (e) => {
      if (isAutoScrollingRef.current || !e.touches || !e.touches[0]) return;
      const touchY = e.touches[0].clientY;
      const diffY = touchStartYRef.current - touchY;
      const scrollY = window.scrollY || window.pageYOffset;

      if ((currentSectionRef.current === 'hero' || scrollY < 100) && diffY > 30) {
        scrollToSection('about');
      } else if ((currentSectionRef.current === 'about' || scrollY >= (aboutEl?.offsetTop || 400) - 100) && diffY < -30) {
        scrollToSection('hero');
      }
    };

    // Fallback scroll listener (e.g. keyboard navigation or dragging scrollbar)
    const handleScroll = () => {
      if (isAutoScrollingRef.current) return;
      const scrollY = window.scrollY || window.pageYOffset;
      if (currentSectionRef.current === 'hero' && scrollY > 60) {
        scrollToSection('about');
      }
    };

    window.addEventListener('wheel', handleWheel, { passive: true });
    window.addEventListener('touchstart', handleTouchStart, { passive: true });
    window.addEventListener('touchmove', handleTouchMove, { passive: true });
    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      observer.disconnect();
      window.removeEventListener('wheel', handleWheel);
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const handleNavClick = (item) => {
    if (item === 'ABOUT') {
      scrollToSection('about');
    }
  };

  return (
    <div className="app-layout">
      <CustomCursor />
      <Navbar activeSection={activeSection} onNavigate={handleNavClick} />
      <Hero />
      <About />
    </div>
  );
}

export default App;
