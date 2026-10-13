import React, { useEffect, useRef } from 'react';

export default function ConnectButton({ onConnectClick }) {
  const btnRef = useRef(null);

  useEffect(() => {
    const home = document.getElementById('home');
    if (!home) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const isHome = entries[0]?.isIntersecting;
        document.documentElement.classList.toggle('on-home', !!isHome);
      },
      { threshold: 0.55 }
    );

    observer.observe(home);
    return () => observer.disconnect();
  }, []);

  const handleClick = (e) => {
    e.preventDefault();
    if (onConnectClick) {
      onConnectClick();
    } else {
      const connectEl = document.getElementById('connect');
      connectEl?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div id="hactions" className="hactions">
      <a
        id="hcon"
        ref={btnRef}
        href="#connect"
        onClick={handleClick}
        aria-label="Go to the Connect section"
      >
        <span className="cbx-t">Connect</span>
        <span className="cbx-a" aria-hidden="true">
          <svg className="a1" viewBox="0 0 24 24">
            <path d="M6.5 17.5L17.5 6.5M8 6.5h9.5V16" />
          </svg>
          <svg className="a2" viewBox="0 0 24 24">
            <path d="M6.5 17.5L17.5 6.5M8 6.5h9.5V16" />
          </svg>
        </span>
      </a>
    </div>
  );
}
