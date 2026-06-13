'use client';

import { Phone, Mail, MapPin } from 'lucide-react';
import { useState, useEffect } from 'react';

export default function Footer() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkScreen = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkScreen();
    window.addEventListener('resize', checkScreen);
    return () => window.removeEventListener('resize', checkScreen);
  }, []);

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer 
      id="footer" 
      style={{ 
        width: '100%',
        backgroundColor: '#000000',
        padding: 'clamp(40px, 5%, 60px) clamp(20px, 4vw, 60px)',
        marginTop: 'auto',
        position: 'relative',
        zIndex: 998,
        borderTop: '1px solid rgba(221, 216, 132, 0.3)'
      }}
    >
      <div style={{ 
        maxWidth: '1200px', 
        margin: '0 auto'
      }}>
        {/* ПЕРВАЯ СТРОКА - ЛОГОТИП ПО ЦЕНТРУ */}
        <div style={{ 
          textAlign: 'center',
          marginBottom: 'clamp(40px, 5%, 60px)'
        }}>
          <span style={{ 
            fontFamily: 'var(--font-poiret-one), Poiret One, cursive',
            fontSize: 'clamp(28px, 4vw, 36px)',
            fontWeight: '300',
            color: '#DDDA84',
            letterSpacing: '2px'
          }}>
            LOFT MAX
          </span>
        </div>

        {/* ВТОРАЯ СТРОКА - ТРИ КОЛОНКИ */}
        <div style={{
          display: 'flex',
          flexDirection: isMobile ? 'column' : 'row',
          gap: 'clamp(40px, 5%, 60px)',
          justifyContent: 'space-between'
        }}>
          
          {/* КОЛОНКА 1 - НАВИГАЦИЯ */}
          <div style={{ flex: 1 }}>
            <h3 
              style={{ 
                fontFamily: 'var(--font-poiret-one), Poiret One, cursive',
                fontWeight: '300',
                color: '#DDDA84',
                fontSize: 'clamp(18px, 2vw, 20px)',
                marginBottom: '20px'
              }}
            >
              Навигация
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <button
                onClick={scrollToTop}
                style={{ 
                  fontFamily: 'var(--font-jura), Jura, sans-serif',
                  color: '#E8FFFB',
                  fontSize: 'clamp(13px, 1.5vw, 14px)',
                  opacity: 0.7,
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'all 0.3s ease',
                  background: 'none',
                  border: 'none',
                  padding: 0
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.opacity = '1';
                  e.currentTarget.style.transform = 'translateX(5px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.opacity = '0.7';
                  e.currentTarget.style.transform = 'translateX(0)';
                }}
              >
                В начало
              </button>
              <button
                onClick={() => scrollToSection('about_chek')}
                style={{ 
                  fontFamily: 'var(--font-jura), Jura, sans-serif',
                  color: '#E8FFFB',
                  fontSize: 'clamp(13px, 1.5vw, 14px)',
                  opacity: 0.7,
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'all 0.3s ease',
                  background: 'none',
                  border: 'none',
                  padding: 0
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.opacity = '1';
                  e.currentTarget.style.transform = 'translateX(5px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.opacity = '0.7';
                  e.currentTarget.style.transform = 'translateX(0)';
                }}
              >
                О компании
              </button>
              <button
                onClick={() => scrollToSection('why-us')}
                style={{ 
                  fontFamily: 'var(--font-jura), Jura, sans-serif',
                  color: '#E8FFFB',
                  fontSize: 'clamp(13px, 1.5vw, 14px)',
                  opacity: 0.7,
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'all 0.3s ease',
                  background: 'none',
                  border: 'none',
                  padding: 0
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.opacity = '1';
                  e.currentTarget.style.transform = 'translateX(5px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.opacity = '0.7';
                  e.currentTarget.style.transform = 'translateX(0)';
                }}
              >
                Почему мы
              </button>
              <button
                onClick={() => scrollToSection('projects')}
                style={{ 
                  fontFamily: 'var(--font-jura), Jura, sans-serif',
                  color: '#E8FFFB',
                  fontSize: 'clamp(13px, 1.5vw, 14px)',
                  opacity: 0.7,
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'all 0.3s ease',
                  background: 'none',
                  border: 'none',
                  padding: 0
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.opacity = '1';
                  e.currentTarget.style.transform = 'translateX(5px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.opacity = '0.7';
                  e.currentTarget.style.transform = 'translateX(0)';
                }}
              >
                Проекты
              </button>
              <button
                onClick={() => scrollToSection('how-we-work')}
                style={{ 
                  fontFamily: 'var(--font-jura), Jura, sans-serif',
                  color: '#E8FFFB',
                  fontSize: 'clamp(13px, 1.5vw, 14px)',
                  opacity: 0.7,
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'all 0.3s ease',
                  background: 'none',
                  border: 'none',
                  padding: 0
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.opacity = '1';
                  e.currentTarget.style.transform = 'translateX(5px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.opacity = '0.7';
                  e.currentTarget.style.transform = 'translateX(0)';
                }}
              >
                Как мы работаем
              </button>
              <button
                onClick={() => scrollToSection('discount')}
                style={{ 
                  fontFamily: 'var(--font-jura), Jura, sans-serif',
                  color: '#E8FFFB',
                  fontSize: 'clamp(13px, 1.5vw, 14px)',
                  opacity: 0.7,
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'all 0.3s ease',
                  background: 'none',
                  border: 'none',
                  padding: 0
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.opacity = '1';
                  e.currentTarget.style.transform = 'translateX(5px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.opacity = '0.7';
                  e.currentTarget.style.transform = 'translateX(0)';
                }}
              >
                Акции
              </button>
              <button
                onClick={() => scrollToSection('comments')}
                style={{ 
                  fontFamily: 'var(--font-jura), Jura, sans-serif',
                  color: '#E8FFFB',
                  fontSize: 'clamp(13px, 1.5vw, 14px)',
                  opacity: 0.7,
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'all 0.3s ease',
                  background: 'none',
                  border: 'none',
                  padding: 0
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.opacity = '1';
                  e.currentTarget.style.transform = 'translateX(5px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.opacity = '0.7';
                  e.currentTarget.style.transform = 'translateX(0)';
                }}
              >
                Отзывы
              </button>
            </div>
          </div>

          {/* КОЛОНКА 2 - КОНТАКТЫ */}
          <div style={{ flex: 1 }}>
            <h3 
              style={{ 
                fontFamily: 'var(--font-poiret-one), Poiret One, cursive',
                fontWeight: '300',
                color: '#DDDA84',
                fontSize: 'clamp(18px, 2vw, 20px)',
                marginBottom: '20px'
              }}
            >
              Контакты
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                <MapPin style={{ width: '18px', height: '18px', color: '#DDDA84', opacity: 0.7, marginTop: '2px', flexShrink: 0 }} />
                <span style={{ 
                  fontFamily: 'var(--font-jura), Jura, sans-serif',
                  color: '#E8FFFB',
                  fontSize: 'clamp(13px, 1.5vw, 14px)',
                  opacity: 0.8,
                  lineHeight: 1.4
                }}>
                  г. Хабаровск,<br />
                  ул. Проспект 60 лет Октября, 170
                </span>
              </div>
              <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                <Phone style={{ width: '16px', height: '16px', color: '#DDDA84', opacity: 0.7, flexShrink: 0 }} />
                <div>
                  <p style={{ 
                    fontFamily: 'var(--font-jura), Jura, sans-serif',
                    color: '#E8FFFB',
                    fontSize: 'clamp(11px, 1.5vw, 12px)',
                    opacity: 0.5,
                    margin: 0
                  }}>
                    Тел. для консультаций:
                  </p>
                  <p style={{ 
                    fontFamily: 'var(--font-jura), Jura, sans-serif',
                    color: '#E8FFFB',
                    fontSize: 'clamp(14px, 1.8vw, 16px)',
                    fontWeight: 'bold',
                    margin: 0
                  }}>
                    +7 (994) 073-33-11
                  </p>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                <Mail style={{ width: '16px', height: '16px', color: '#DDDA84', opacity: 0.7, flexShrink: 0 }} />
                <span style={{ 
                  fontFamily: 'var(--font-jura), Jura, sans-serif',
                  color: '#E8FFFB',
                  fontSize: 'clamp(13px, 1.5vw, 14px)',
                  opacity: 0.8
                }}>
                  info@loftmax.ru
                </span>
              </div>
            </div>
          </div>

          {/* КОЛОНКА 3 - КАРТА */}
          <div style={{ flex: 1 }}>
            <h3 
              style={{ 
                fontFamily: 'var(--font-poiret-one), Poiret One, cursive',
                fontWeight: '300',
                color: '#DDDA84',
                fontSize: 'clamp(18px, 2vw, 20px)',
                marginBottom: '20px'
              }}
            >
              Мы на карте
            </h3>
            <div 
  style={{ 
    width: '100%',
    height: '200px',
    borderRadius: '16px',
    overflow: 'hidden',
    border: '2px solid rgba(221, 216, 132, 0.3)',
    marginBottom: '10px',
    backgroundColor: '#1a1c1d',
    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)',
    transition: 'all 0.3s ease'
  }}
  className="hover:shadow-xl hover:border-[#DDDA84] hover:scale-[1.02]"
>
  <iframe
    src="https://yandex.ru/map-widget/v1/?um=constructor%3A6fc385bd4d49bfb824a15989abe4f21b225a6c8a5e50296bd2e2717d4c27f19f&amp;source=constructor"
    width="100%"
    height="100%"
    style={{ border: 0, filter: 'brightness(0.95) contrast(1.05)' }}
    allowFullScreen
    loading="lazy"
    title="Карта расположения Loft Max"
  />
</div>
            <p 
              style={{ 
                fontFamily: 'var(--font-jura), Jura, sans-serif',
                color: '#E8FFFB',
                fontSize: '11px',
                opacity: 0.4,
                textAlign: 'center'
              }}
            >
              Проспект 60 лет Октября, 170
            </p>
          </div>
        </div>

        {/* КОПИРАЙТ */}
        <div 
          style={{ 
            marginTop: 'clamp(40px, 5%, 60px)',
            paddingTop: 'clamp(20px, 3%, 30px)',
            borderTop: '1px solid rgba(221, 216, 132, 0.2)',
            textAlign: 'center'
          }}
        >
          <p 
            style={{ 
              fontFamily: 'var(--font-jura), Jura, sans-serif',
              color: '#E8FFFB',
              fontSize: '11px',
              opacity: 0.4
            }}
          >
            © {new Date().getFullYear()} Loft Max. Все права защищены.
          </p>
        </div>
      </div>
    </footer>
  );
}