import React, { useRef, useCallback, useEffect } from 'react';
import SvgDefs from '../../components/SvgDefs';
import WelcomeScreen from '../../components/WelcomeScreen';
import CustomCursor from '../../components/CustomCursor';
import RailNav from '../../components/RailNav';
import ConnectButton from '../../components/ConnectButton';
import { shouldShowWelcome } from '../../lib/utils';
import { usePageNavigation } from '../../lib/usePageNavigation';
import HomeSection from './HomeSection';
import WorksSection from './WorksSection';
import CertificateSection from './CertificateSection';
import StackSection from './StackSection';
import ConnectSection from './ConnectSection';

export default function UserView({
  portfolioData,
  isAdmin = false,
  isPreviewMode = false,
  onBackToAdmin,
  onExitAdmin,
}) {
  const pulseRef = useRef(null);

  // Standard scroll restoration
  useEffect(() => {
    if (isAdmin && !isPreviewMode) return;

    if ('scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'auto';
    }

    const showWelcome = shouldShowWelcome();

    if (showWelcome && !isAdmin) {
      try {
        sessionStorage.removeItem('last_scroll_y');
      } catch {}
      window.scrollTo(0, 0);
    } else {
      try {
        const savedY = sessionStorage.getItem('last_scroll_y');
        if (savedY && Number(savedY) > 0 && window.scrollY === 0) {
          window.scrollTo(0, Number(savedY));
        }
      } catch {}
    }

    const handleScroll = () => {
      try {
        sessionStorage.setItem('last_scroll_y', String(window.scrollY));
      } catch {}
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [isAdmin, isPreviewMode]);

  const { navigateTo, connectFlow } = usePageNavigation({
    pulseRef,
  });

  const handleWelcomeComplete = useCallback(() => {
    if (typeof window.__playHeroFlaps === 'function') {
      window.__playHeroFlaps();
    }
  }, []);

  return (
    <>
      {/* Top Banner when in Admin Live Preview */}
      {isAdmin && isPreviewMode && (
        <div className="admin-preview-banner">
          <div className="admin-preview-info">
            <span className="admin-preview-pill">ADMIN PREVIEW</span>
            <span>Live Portfolio with Active Edits</span>
          </div>
          <div style={{ display: 'flex', gap: '0.65rem' }}>
            <button
              type="button"
              className="admin-btn admin-btn-primary"
              onClick={onBackToAdmin}
            >
              ← Back to Admin Console
            </button>
            <button
              type="button"
              className="admin-btn admin-btn-outline"
              onClick={onExitAdmin}
            >
              Exit Admin ↗
            </button>
          </div>
        </div>
      )}

      <SvgDefs />
      {!isAdmin && <WelcomeScreen onComplete={handleWelcomeComplete} />}
      <CustomCursor />
      <RailNav onNavigate={navigateTo} pulseRef={pulseRef} />
      <ConnectButton
        onConnectClick={connectFlow}
        resumeUrl={portfolioData?.connect?.url?.resume}
      />

      <HomeSection
        heroWords={portfolioData?.home?.heroWords}
        photo={portfolioData?.home?.photo}
        name={portfolioData?.home?.name}
      />
      <WorksSection
        apps={portfolioData?.works?.apps}
        lab={portfolioData?.works?.lab}
      />
      <CertificateSection
        certs={portfolioData?.certs?.list}
        showCount={portfolioData?.certs?.showCount}
      />
      <StackSection stack={portfolioData?.stack?.items} />
      <ConnectSection connectData={portfolioData?.connect} />
    </>
  );
}
