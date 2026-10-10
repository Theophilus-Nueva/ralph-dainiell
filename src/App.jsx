import React, { useRef, useCallback, useEffect } from 'react';
import SvgDefs from './components/SvgDefs';
import WelcomeScreen from './components/WelcomeScreen';
import CustomCursor from './components/CustomCursor';
import RailNav from './components/RailNav';
import ConnectButton from './components/ConnectButton';
import { shouldShowWelcome } from './lib/utils';
import HomeSection from './sections/HomeSection';
import WorksSection from './sections/WorksSection';
import CertificateSection from './sections/CertificateSection';
import StackSection from './sections/StackSection';
import ConnectSection from './sections/ConnectSection';
import { usePageNavigation } from './lib/usePageNavigation';

export default function App() {
  const pulseRef = useRef(null);

  useEffect(() => {
    if ('scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'auto';
    }

    const showWelcome = shouldShowWelcome();

    if (showWelcome) {
      try {
        sessionStorage.removeItem('last_scroll_y');
      } catch {}
      window.scrollTo(0, 0);
    } else {
      // Normal reload: restore scroll if browser landed at 0
      try {
        const savedY = sessionStorage.getItem('last_scroll_y');
        if (savedY && Number(savedY) > 0 && window.scrollY === 0) {
          window.scrollTo(0, Number(savedY));
        }
      } catch {}
    }

    // Continuously save scroll position so normal reload can restore cleanly
    const handleScroll = () => {
      try {
        sessionStorage.setItem('last_scroll_y', String(window.scrollY));
      } catch {}
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const { navigateTo, connectFlow } = usePageNavigation({
    pulseRef,
  });

  const handleWelcomeComplete = useCallback(() => {
    // When welcome finishes, trigger hero split-flap sequence if defined
    if (typeof window.__playHeroFlaps === 'function') {
      window.__playHeroFlaps();
    }
  }, []);

  return (
    <>
      <SvgDefs />
      <WelcomeScreen onComplete={handleWelcomeComplete} />
      <CustomCursor />
      <RailNav onNavigate={navigateTo} pulseRef={pulseRef} />
      <ConnectButton onConnectClick={connectFlow} />

      <HomeSection />
      <WorksSection />
      <CertificateSection />
      <StackSection />
      <ConnectSection />
    </>
  );
}
