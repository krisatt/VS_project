'use client';

import { useEffect } from 'react';
import { X } from 'lucide-react';

interface NotificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  message: string;
  type?: 'error' | 'success' | 'info';
}

export default function NotificationModal({ isOpen, onClose, message, type = 'info' }: NotificationModalProps) {
  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => {
        onClose();
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const getColors = () => {
    switch (type) {
      case 'error':
        return { bg: 'rgba(231, 76, 60, 0.95)', border: '#e74c3c', icon: '⚠️' };
      case 'success':
        return { bg: 'rgba(46, 204, 113, 0.95)', border: '#2ecc71', icon: '✅' };
      default:
        return { bg: 'rgba(221, 216, 132, 0.95)', border: '#DDDA84', icon: 'ℹ️' };
    }
  };

  const colors = getColors();

  return (
    <div
      style={{
        position: 'fixed',
        top: '10%',
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 999999,
        animation: 'slideUp 0.3s ease-out',
      }}
    >
      <div
        style={{
          backgroundColor: colors.bg,
          backdropFilter: 'blur(10px)',
          border: `1px solid ${colors.border}`,
          borderRadius: '16px',
          padding: '16px 24px',
          minWidth: '300px',
          maxWidth: '450px',
          boxShadow: '0 10px 25px rgba(0, 0, 0, 0.2)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span style={{ fontSize: '24px' }}>{colors.icon}</span>
          <p style={{
            fontFamily: 'var(--font-jura), Jura, sans-serif',
            color: type === 'info' ? '#111314' : '#fff',
            fontSize: '14px',
            margin: 0,
            flex: 1,
          }}>
            {message}
          </p>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: '4px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: '50%',
              transition: 'all 0.3s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.2)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
            }}
          >
            <X size={16} color={type === 'info' ? '#111314' : '#fff'} />
          </button>
        </div>
      </div>

      <style>{`
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateX(-50%) translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateX(-50%) translateY(0);
          }
        }
      `}</style>
    </div>
  );
}