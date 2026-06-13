//MobileMenu.tsx
'use client';

import { useState, useEffect } from 'react';
import { X } from 'lucide-react';

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (sectionId: string) => void;
  onOpenRequest?: () => void;
  onOpenGallery?: () => void;
}

const navItems = [
  { name: 'О компании', id: 'about_chek' },
  { name: 'Почему мы', id: 'why-us' },
  { name: 'Проекты', id: 'projects' },
  { name: 'Как работаем', id: 'how-we-work' },
  { name: 'Акции', id: 'discount' },
  { name: 'Отзывы', id: 'comments' },
  { name: 'Контакты', id: 'footer' },
];

const additionalItems = [
  { name: 'Оставить заявку', action: 'request' },
  { name: 'Галерея', action: 'gallery' },
];

export default function MobileMenu({ 
  isOpen, 
  onClose, 
  onNavigate,
  onOpenRequest,
  onOpenGallery
}: MobileMenuProps) {
  const [showAdditional, setShowAdditional] = useState(false);
  const [shouldRender, setShouldRender] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setShouldRender(true);
      document.body.style.overflow = 'hidden';
    } else {
      setTimeout(() => {
        setShouldRender(false);
        document.body.style.overflow = 'unset';
      }, 300);
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const handleClose = () => {
    onClose();
  };

  if (!shouldRender) return null;

  const handleNavigate = (sectionId: string) => {
    onNavigate(sectionId);
    handleClose();
  };

  const handleAdditionalClick = () => {
    setShowAdditional(!showAdditional);
  };

  const handleAdditionalAction = (action: string) => {
    if (action === 'request' && onOpenRequest) {
      onOpenRequest();
    } else if (action === 'gallery' && onOpenGallery) {
      onOpenGallery();
    }
    handleClose();
  };

  return (
    <>
      <style>{`
        @keyframes slideIn {
          from { transform: translateX(-100%); }
          to { transform: translateX(0); }
        }
        @keyframes slideOut {
          from { transform: translateX(0); }
          to { transform: translateX(-100%); }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
      `}</style>
      
      {/* Меню */}
      <div 
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '320px',
          height: '100vh',
          backgroundColor: '#111314',
          display: 'flex',
          flexDirection: 'column',
          zIndex: 999999,
          borderRight: '1px solid rgba(221, 216, 132, 0.2)',
          animation: isOpen ? 'slideIn 0.3s ease-out forwards' : 'slideOut 0.3s ease-out forwards',
          overflow: 'hidden',
          boxShadow: '4px 0 20px rgba(0, 0, 0, 0.3)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Контент с прокруткой */}
        <div style={{
          flex: 1,
          overflowY: 'auto',
          overflowX: 'hidden',
          padding: '24px 20px',
          scrollbarWidth: 'thin',
          scrollbarColor: '#DDDA84 #111314',
        }}
        className="custom-scroll"
        >
          {/* Кнопка закрытия */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '30px' }}>
            <button
              onClick={handleClose}
              style={{
                background: 'rgba(221, 216, 132, 0.1)',
                border: '1px solid rgba(221, 216, 132, 0.3)',
                borderRadius: '50%',
                padding: '8px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.3s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(221, 216, 132, 0.2)';
                e.currentTarget.style.transform = 'scale(1.1)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(221, 216, 132, 0.1)';
                e.currentTarget.style.transform = 'scale(1)';
              }}
            >
              <X size={20} color="#DDDA84" />
            </button>
          </div>

          {/* Навигация */}
          <nav style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {navItems.map((item, index) => (
              <button
                key={item.name}
                onClick={() => handleNavigate(item.id)}
                style={{
                  color: '#E8FFFB',
                  fontSize: '18px',
                  fontFamily: 'var(--font-jura), Jura, sans-serif',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  textAlign: 'left',
                  padding: '8px 0',
                  transition: 'all 0.3s ease',
                  animation: isOpen ? `fadeIn 0.3s ease-out ${index * 0.05}s forwards` : 'none',
                  opacity: 0,
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = '#DDDA84';
                  e.currentTarget.style.transform = 'translateX(5px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = '#E8FFFB';
                  e.currentTarget.style.transform = 'translateX(0)';
                }}
              >
                {item.name}
              </button>
            ))}

            {/* Разделитель */}
            <div style={{ 
              height: '1px', 
              background: 'rgba(221, 216, 132, 0.2)', 
              margin: '10px 0',
              animation: isOpen ? 'fadeIn 0.3s ease-out 0.3s forwards' : 'none',
              opacity: 0,
            }} />

            {/* Другое */}
            <div>
              <button
                onClick={handleAdditionalClick}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  width: '100%',
                  color: '#DDDA84',
                  fontSize: '18px',
                  fontFamily: 'var(--font-jura), Jura, sans-serif',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  padding: '8px 0',
                  transition: 'all 0.3s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = '#E8FFFB';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = '#DDDA84';
                }}
              >
                <span>Другое</span>
                <span style={{ 
                  transform: showAdditional ? 'rotate(180deg)' : 'none', 
                  transition: 'transform 0.3s ease',
                  display: 'inline-block'
                }}>▼</span>
              </button>
              
              {showAdditional && (
                <div style={{ 
                  display: 'flex', 
                  flexDirection: 'column', 
                  gap: '12px', 
                  marginTop: '12px', 
                  paddingLeft: '16px',
                }}>
                  {additionalItems.map((item) => (
                    <button
                      key={item.name}
                      onClick={() => handleAdditionalAction(item.action)}
                      style={{
                        color: 'rgba(232, 255, 251, 0.8)',
                        fontSize: '16px',
                        fontFamily: 'var(--font-jura), Jura, sans-serif',
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        textAlign: 'left',
                        padding: '6px 0',
                        transition: 'all 0.3s ease',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.color = '#DDDA84';
                        e.currentTarget.style.transform = 'translateX(5px)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.color = 'rgba(232, 255, 251, 0.8)';
                        e.currentTarget.style.transform = 'translateX(0)';
                      }}
                    >
                      {item.name}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </nav>

          {/* Контакты */}
          <div style={{ 
            marginTop: '40px', 
            paddingTop: '20px',
            animation: isOpen ? 'fadeIn 0.3s ease-out 0.4s forwards' : 'none',
            opacity: 0,
          }}>
            <div style={{ height: '1px', background: 'rgba(221, 216, 132, 0.2)', marginBottom: '20px' }} />
            <p style={{ color: 'rgba(232, 255, 251, 0.5)', fontSize: '11px', marginBottom: '10px', letterSpacing: '1px' }}>
              СВЯЖИТЕСЬ С НАМИ
            </p>
            <a 
              href="tel:+79940733311" 
              style={{ 
                color: '#DDDA84', 
                fontSize: '14px', 
                textDecoration: 'none', 
                display: 'block', 
                marginBottom: '8px',
                transition: 'all 0.3s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = '#E8FFFB';
                e.currentTarget.style.transform = 'translateX(5px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = '#DDDA84';
                e.currentTarget.style.transform = 'translateX(0)';
              }}
            >
              +7 (994) 073-33-11
            </a>
            <a 
              href="mailto:info@loftmax.ru" 
              style={{ 
                color: '#DDDA84', 
                fontSize: '14px', 
                textDecoration: 'none', 
                display: 'block',
                transition: 'all 0.3s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = '#E8FFFB';
                e.currentTarget.style.transform = 'translateX(5px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = '#DDDA84';
                e.currentTarget.style.transform = 'translateX(0)';
              }}
            >
              info@loftmax.ru
            </a>
            <p style={{ color: 'rgba(232, 255, 251, 0.2)', fontSize: '11px', marginTop: '20px' }}>
              © 2024 Loft Max
            </p>
          </div>
        </div>
      </div>

      {/* Стили для скроллбара */}
      <style jsx global>{`
        .custom-scroll::-webkit-scrollbar {
          width: 4px;
        }
        
        .custom-scroll::-webkit-scrollbar-track {
          background: #111314;
        }
        
        .custom-scroll::-webkit-scrollbar-thumb {
          background: #DDDA84;
          border-radius: 4px;
        }
        
        .custom-scroll::-webkit-scrollbar-thumb:hover {
          background: #E8FFFB;
        }
      `}</style>
    </>
  );
}