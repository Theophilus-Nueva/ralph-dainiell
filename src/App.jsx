import React, { useCallback, useEffect, useState } from 'react';
import AdminView from './views/admin/AdminView';
import UserView from './views/user/UserView';
import {
  loadPortfolioData,
  savePortfolioData,
  resetPortfolioData,
} from './lib/portfolioStorage';

export default function App() {
  // Check if current URL route is /admin or #admin
  const checkIsAdminPath = () => {
    if (typeof window === 'undefined') return false;
    const pathname = window.location.pathname.replace(/\/+$/, '') || '/';
    return (
      pathname === '/admin' ||
      pathname.startsWith('/admin/') ||
      window.location.hash === '#admin'
    );
  };

  const [isAdmin, setIsAdmin] = useState(() => checkIsAdminPath());
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [portfolioData, setPortfolioData] = useState(() => loadPortfolioData());

  // Listen to browser URL changes (e.g. back/forward, direct pushState)
  useEffect(() => {
    const handleLocationChange = () => {
      setIsAdmin(checkIsAdminPath());
    };

    window.addEventListener('popstate', handleLocationChange);
    window.addEventListener('hashchange', handleLocationChange);

    return () => {
      window.removeEventListener('popstate', handleLocationChange);
      window.removeEventListener('hashchange', handleLocationChange);
    };
  }, []);

  // When entering admin mode, unlock any welcome screen classes
  useEffect(() => {
    if (isAdmin && !isPreviewMode) {
      window.WCB = false;
      document.documentElement.classList.remove('wc-hide', 'wc-lock');
    }
  }, [isAdmin, isPreviewMode]);

  // Admin routing helpers
  const navigateToAdmin = useCallback(() => {
    window.history.pushState({}, '', '/admin');
    setIsAdmin(true);
    setIsPreviewMode(false);
    window.scrollTo(0, 0);
  }, []);

  const navigateToPublic = useCallback(() => {
    window.history.pushState({}, '', '/');
    setIsAdmin(false);
    setIsPreviewMode(false);
  }, []);

  const handleUpdateData = useCallback((newData) => {
    setPortfolioData(newData);
  }, []);

  const handleSaveData = useCallback(() => {
    return savePortfolioData(portfolioData);
  }, [portfolioData]);

  const handleResetData = useCallback(() => {
    const defaults = resetPortfolioData();
    setPortfolioData(defaults);
  }, []);

  // ==========================================
  // CONDITIONAL RENDERING: Admin View (/admin)
  // ==========================================
  if (isAdmin && !isPreviewMode) {
    return (
      <AdminView
        data={portfolioData}
        onUpdateData={handleUpdateData}
        onSaveData={handleSaveData}
        onResetData={handleResetData}
        onTogglePreview={() => setIsPreviewMode(true)}
        onExit={navigateToPublic}
      />
    );
  }

  // ==========================================
  // CONDITIONAL RENDERING: User View (default '/')
  // (Also used when previewing live edits)
  // ==========================================
  return (
    <UserView
      portfolioData={portfolioData}
      isAdmin={isAdmin}
      isPreviewMode={isPreviewMode}
      onBackToAdmin={() => setIsPreviewMode(false)}
      onExitAdmin={navigateToPublic}
      onOpenAdmin={navigateToAdmin}
    />
  );
}
