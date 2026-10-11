import React, { useEffect } from 'react';
import '../../styles/admin.css';
import HomeTab from './HomeTab';
import WorksTab from './WorksTab';
import CertsTab from './CertsTab';
import StackTab from './StackTab';
import ConnectTab from './ConnectTab';

export default function AdminView({
  data,
  onUpdateData,
}) {
  useEffect(() => {
    document.documentElement.classList.add('on-admin');
    return () => {
      document.documentElement.classList.remove('on-admin');
    };
  }, []);

  return (
    <div className="admin-viewport">
      {/* Top Navigation */}
      <header className="admin-navbar">
        <div className="admin-nav-left">
          <div className="admin-brand">
            <span className="admin-brand-prefix">RD //</span> ADMIN CONSOLE
          </div>
          <span className="admin-badge-terminal">EDIT ACCESS GRANTED</span>
        </div>
      </header>

      {/* Main Content — One-Pager */}
      <main className="admin-content">
        <section className="admin-section-block">
          <HomeTab data={data} onChange={onUpdateData} />
        </section>
        <section className="admin-section-block">
          <WorksTab data={data} onChange={onUpdateData} />
        </section>
        <section className="admin-section-block">
          <CertsTab data={data} onChange={onUpdateData} />
        </section>
        <section className="admin-section-block">
          <StackTab data={data} onChange={onUpdateData} />
        </section>
        <section className="admin-section-block">
          <ConnectTab data={data} onChange={onUpdateData} />
        </section>
      </main>
    </div>
  );
}
