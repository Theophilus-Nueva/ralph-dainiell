import React, { useRef, useCallback, useEffect } from 'react';
import SvgDefs from './components/SvgDefs';
import WelcomeScreen from './components/WelcomeScreen';
import CustomCursor from './components/CustomCursor';
import RailNav from './components/RailNav';
import ConnectButton from './components/ConnectButton';
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
      window.history.scrollRestoration = 'manual';
    }
    window.scrollTo(0, 0);

    const handleBeforeUnload = () => {
      window.scrollTo(0, 0);
    };
    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
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
