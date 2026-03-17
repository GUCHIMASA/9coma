'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function ScrollToTop() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const toggleVisibility = () => {
      if (window.scrollY > 300) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener('scroll', toggleVisibility);
    return () => window.removeEventListener('scroll', toggleVisibility);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  if (!isVisible) return null;

  return (
    <div className="scroll-to-top-container">
      <div className="scroll-to-top-inner">
        <Link href="/" className="nav-btn" aria-label="トップページへ">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>
          </svg>
          <span className="nav-btn-text">ホーム</span>
        </Link>
        <button onClick={scrollToTop} className="nav-btn" aria-label="うえに戻る">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="m18 15-6-6-6 6"/>
          </svg>
          <span className="nav-btn-text">うえに</span>
        </button>
      </div>

      <style jsx>{`
        .scroll-to-top-container {
          position: fixed;
          z-index: 1000;
          pointer-events: none;
          transition: all 0.3s ease;
          animation: slideIn 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
        }

        @keyframes slideIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .scroll-to-top-inner {
          display: flex;
          gap: 12px;
          pointer-events: auto;
          background: rgba(255, 255, 255, 0.95);
          padding: 8px 10px;
          border-radius: 16px;
          border: 2px solid var(--color-border);
          box-shadow: 0 4px 20px rgba(0,0,0,0.15);
          backdrop-filter: blur(8px);
        }

        :global(.nav-btn) {
          display: flex !important;
          flex-direction: column !important;
          align-items: center !important;
          justify-content: center !important;
          width: 54px !important;
          height: 54px !important;
          border-radius: 10px !important;
          background-color: var(--color-bg) !important;
          color: var(--color-text) !important;
          border: 2px solid var(--color-border) !important;
          box-shadow: 3px 3px 0px var(--color-border) !important;
          transition: all 0.1s ease !important;
          cursor: pointer !important;
          text-decoration: none !important;
          padding: 0 !important;
          box-sizing: border-box !important;
          outline: none !important;
          appearance: none !important;
        }

        :global(.nav-btn:hover) {
          transform: translate(-1px, -1px) !important;
          box-shadow: 4px 4px 0px var(--color-border) !important;
        }

        :global(.nav-btn:active) {
          transform: translate(1px, 1px) !important;
          box-shadow: 0px 0px 0px var(--color-border) !important;
        }

        .nav-btn-text {
          font-size: 0.65rem;
          font-weight: 800;
          margin-top: -1px;
          line-height: 1;
        }

        /* Responsive Positioning */
        @media (min-width: 769px) {
          .scroll-to-top-container {
            right: 2rem;
            bottom: 2rem;
          }
          .scroll-to-top-inner {
            flex-direction: column;
            background: none;
            padding: 0;
            border: none;
            box-shadow: none;
            backdrop-filter: none;
          }
        }

        @media (max-width: 768px) {
          .scroll-to-top-container {
            left: 0;
            right: 0;
            bottom: 1.5rem;
            display: flex;
            justify-content: center;
          }
          :global(.nav-btn) {
            width: 52px !important;
            height: 52px !important;
          }
        }
      `}</style>
    </div>
  );
}
