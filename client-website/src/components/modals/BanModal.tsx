'use client';

import { X } from 'lucide-react';

interface BanModalProps {
  isOpen: boolean;
  onClose: () => void;
  banInfo: {
    reason: string;
    date: string;
    phone: string;
  } | null;
}

export default function BanModal({ isOpen, onClose, banInfo }: BanModalProps) {
  if (!isOpen) return null;

  const formatDate = (dateString: string) => {
    if (!dateString) return 'неизвестно';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('ru-RU', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      });
    } catch {
      return dateString;
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 999999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        animation: 'fadeIn 0.3s ease-out',
      }}
    >
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.85)',
          backdropFilter: 'blur(8px)',
        }}
        onClick={onClose}
      />
      
      <div
        style={{
          position: 'relative',
          width: '90%',
          maxWidth: '500px',
          backgroundColor: '#111314',
          borderRadius: '24px',
          border: '1px solid rgba(255, 100, 100, 0.3)',
          boxShadow: '0 20px 40px rgba(0, 0, 0, 0.5)',
          animation: 'scaleIn 0.3s ease-out',
          overflow: 'hidden',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '20px 24px',
            borderBottom: '1px solid rgba(255, 100, 100, 0.2)',
            backgroundColor: 'rgba(255, 100, 100, 0.05)',
          }}
        >
          <h3
            style={{
              fontFamily: 'var(--font-poiret-one), Poiret One, cursive',
              fontSize: '28px',
              fontWeight: '300',
              color: '#ff6b6b',
              margin: 0,
            }}
          >
            Аккаунт заблокирован
          </h3>
          <button
            onClick={onClose}
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '50%',
              backgroundColor: 'rgba(255, 100, 100, 0.1)',
              border: '1px solid rgba(255, 100, 100, 0.3)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.3s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(255, 100, 100, 0.2)';
              e.currentTarget.style.transform = 'scale(1.1)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(255, 100, 100, 0.1)';
              e.currentTarget.style.transform = 'scale(1)';
            }}
          >
            <X size={18} color="#ff6b6b" />
          </button>
        </div>
        
        <div style={{ padding: '28px 24px 32px' }}>
          {/* Иконка предупреждения */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'center',
              marginBottom: '24px',
            }}
          >
            <div
              style={{
                width: '80px',
                height: '80px',
                borderRadius: '50%',
                backgroundColor: 'rgba(255, 100, 100, 0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <svg
                width="48"
                height="48"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#ff6b6b"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <circle cx="12" cy="16" r="0.5" fill="#ff6b6b" />
              </svg>
            </div>
          </div>
          
          <p
            style={{
              fontFamily: 'var(--font-jura), Jura, sans-serif',
              color: '#E8FFFB',
              fontSize: '16px',
              lineHeight: 1.5,
              textAlign: 'center',
              marginBottom: '24px',
            }}
          >
            Ваш аккаунт был заблокирован администратором.
          </p>
          
          {/* Причина бана */}
          {banInfo?.reason && (
            <div
              style={{
                backgroundColor: 'rgba(255, 100, 100, 0.05)',
                borderLeft: '3px solid #ff6b6b',
                padding: '12px 16px',
                borderRadius: '8px',
                marginBottom: '20px',
              }}
            >
              <p
                style={{
                  fontFamily: 'var(--font-jura), Jura, sans-serif',
                  color: '#ff6b6b',
                  fontSize: '13px',
                  marginBottom: '4px',
                  fontWeight: 'bold',
                }}
              >
                Причина блокировки:
              </p>
              <p
                style={{
                  fontFamily: 'var(--font-jura), Jura, sans-serif',
                  color: '#E8FFFB',
                  fontSize: '14px',
                  margin: 0,
                }}
              >
                {banInfo.reason}
              </p>
            </div>
          )}
          
          {/* Дата бана */}
          {banInfo?.date && (
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                marginBottom: '20px',
                padding: '8px 0',
                borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
              }}
            >
              <span
                style={{
                  fontFamily: 'var(--font-jura), Jura, sans-serif',
                  color: '#E8FFFB',
                  fontSize: '13px',
                  opacity: 0.7,
                }}
              >
                Дата блокировки:
              </span>
              <span
                style={{
                  fontFamily: 'var(--font-jura), Jura, sans-serif',
                  color: '#DDDA84',
                  fontSize: '13px',
                }}
              >
                {formatDate(banInfo.date)}
              </span>
            </div>
          )}
          
          {/* Контакты для связи */}
          <div
            style={{
              backgroundColor: 'rgba(221, 216, 132, 0.05)',
              borderRadius: '12px',
              padding: '16px',
              textAlign: 'center',
              marginBottom: '24px',
            }}
          >
            <p
              style={{
                fontFamily: 'var(--font-jura), Jura, sans-serif',
                color: '#DDDA84',
                fontSize: '14px',
                marginBottom: '12px',
              }}
            >
              Для уточнения деталей свяжитесь с нами:
            </p>
            <a
              href="tel:+79940733311"
              style={{
                display: 'inline-block',
                fontFamily: 'var(--font-jura), Jura, sans-serif',
                color: '#E8FFFB',
                fontSize: '16px',
                textDecoration: 'none',
                marginRight: '16px',
                transition: 'all 0.3s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = '#DDDA84';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = '#E8FFFB';
              }}
            >
              +7 (994) 073-33-11
            </a>
            <a
              href="mailto:info@loftmax.ru"
              style={{
                display: 'inline-block',
                fontFamily: 'var(--font-jura), Jura, sans-serif',
                color: '#E8FFFB',
                fontSize: '16px',
                textDecoration: 'none',
                transition: 'all 0.3s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = '#DDDA84';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = '#E8FFFB';
              }}
            >
              info@loftmax.ru
            </a>
          </div>
          
          <button
            onClick={onClose}
            style={{
              width: '100%',
              padding: '14px',
              backgroundColor: 'rgba(255, 100, 100, 0.1)',
              border: '1px solid rgba(255, 100, 100, 0.3)',
              borderRadius: '12px',
              color: '#ff6b6b',
              fontFamily: 'var(--font-jura), Jura, sans-serif',
              fontSize: '16px',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(255, 100, 100, 0.2)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(255, 100, 100, 0.1)';
            }}
          >
            Закрыть
          </button>
        </div>
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes scaleIn {
          from {
            opacity: 0;
            transform: scale(0.95);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
      `}</style>
    </div>
  );
}