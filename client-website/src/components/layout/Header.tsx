//Header.tsx
'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Menu, User, ChevronDown } from 'lucide-react';
import MobileMenu from './MobileMenu';
import { useAuth } from '@/contexts';

const navItems = [
  { name: 'О компании', id: 'about_chek' },
  { name: 'Почему мы', id: 'why-us' },
  { name: 'Проекты', id: 'projects' },
  { name: 'Как работаем', id: 'how-we-work' },
  { name: 'Акции', id: 'discount' },
  { name: 'Отзывы', id: 'comments' },
  { name: 'Контакты', id: 'footer' },
];

const dropdownItems = [
  { name: 'Оставить заявку', action: 'request' },
  { name: 'Галерея', action: 'gallery' },
];

interface HeaderProps {
  isVisible: boolean;
  hideHero?: boolean;
  onOpenAuth?: () => void;
  onOpenProfile?: () => void;
  onOpenRequest?: () => void;
  onOpenGallery?: () => void;
}

export default function Header({ 
  isVisible, 
  hideHero = false,
  onOpenAuth,
  onOpenProfile,
  onOpenRequest,
  onOpenGallery
}: HeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [isTablet, setIsTablet] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownContainerRef = useRef<HTMLDivElement>(null);
  const closeTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    const checkScreenSize = () => {
      setIsTablet(window.innerWidth < 1024);
    };
    
    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleMouseEnter = () => {
    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current);
      closeTimeoutRef.current = null;
    }
    setIsDropdownOpen(true);
  };

  const handleMouseLeave = () => {
    closeTimeoutRef.current = setTimeout(() => {
      setIsDropdownOpen(false);
    }, 150);
  };

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      const elementRect = element.getBoundingClientRect();
      const absoluteElementTop = elementRect.top + window.pageYOffset;
      const windowHeight = window.innerHeight;
      const elementHeight = elementRect.height;
      const scrollPosition = absoluteElementTop - (windowHeight / 2) + (elementHeight / 2);
      
      window.scrollTo({
        top: scrollPosition,
        behavior: 'smooth'
      });
    }
    setIsDropdownOpen(false);
  };

  const handleProfileClick = () => {
    if (isAuthenticated && onOpenProfile) {
      onOpenProfile();
    } else if (!isAuthenticated && onOpenAuth) {
      onOpenAuth();
    }
  };

  const handleDropdownAction = (action: string) => {
    setIsDropdownOpen(false);
    if (action === 'request' && onOpenRequest) {
      onOpenRequest();
    } else if (action === 'gallery' && onOpenGallery) {
      onOpenGallery();
    }
  };

  if (!isVisible) return null;

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled || hideHero ? 'shadow-lg' : ''
      }`}
      style={{
        backgroundColor: scrolled || hideHero ? 'rgba(17, 19, 20, 0.9)' : 'transparent',
        backdropFilter: scrolled || hideHero ? 'blur(10px)' : 'none',
        width: '100%',
        height: '80px',
        display: 'flex',
        alignItems: 'center'
      }}
    >
      <div style={{ 
        width: '100%', 
        paddingLeft: 'clamp(16px, 5vw, 64px)', 
        paddingRight: 'clamp(16px, 5vw, 64px)' 
      }}>
        {!isTablet ? (
          // ДЕСКТОПНАЯ ВЕРСИЯ
          <div className="flex items-center justify-between">
            <div 
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              style={{ 
                cursor: 'pointer',
                width: 'clamp(80px, 12vw, 130px)',
                display: 'flex',
                alignItems: 'center'
              }}
            >
              <Image
                src="/logos/logo-white.svg"
                alt="Loft Max"
                width={130}
                height={33}
                className="w-full h-auto"
                priority
              />
            </div>

            <div className="flex items-center" style={{ gap: 'clamp(10px, 2vw, 40px)' }}>
              <nav className="flex items-center" style={{ gap: 'clamp(8px, 1.5vw, 40px)' }}>
                {navItems.map((item) => (
                  <button
                    key={item.name}
                    onClick={() => scrollToSection(item.id)}
                    className="text-[#E8FFFB] hover:text-[#DDDA84] transition-colors duration-300 font-jura cursor-pointer whitespace-nowrap"
                    style={{ 
                      fontSize: 'clamp(10px, 1.2vw, 16px)',
                      background: 'none',
                      border: 'none',
                      padding: 0
                    }}
                  >
                    {item.name}
                  </button>
                ))}
                
                <div 
                  ref={dropdownContainerRef}
                  style={{ position: 'relative' }}
                  onMouseEnter={handleMouseEnter}
                  onMouseLeave={handleMouseLeave}
                >
                  <button
                    className="flex items-center gap-1 text-[#DDDA84] hover:text-[#E8FFFB] transition-colors duration-300 font-jura cursor-pointer whitespace-nowrap"
                    style={{ 
                      fontSize: 'clamp(10px, 1.2vw, 16px)',
                      padding: '8px 0',
                      background: 'none',
                      border: 'none'
                    }}
                  >
                    Другое
                    <ChevronDown className="w-4 h-4 transition-transform duration-300" style={{ transform: isDropdownOpen ? 'rotate(180deg)' : 'none' }} />
                  </button>
                  
                  {isDropdownOpen && (
                    <div
                      style={{
                        position: 'absolute',
                        top: '100%',
                        left: '50%',
                        transform: 'translateX(-50%)',
                        marginTop: '8px',
                        backgroundColor: 'rgba(17, 19, 20, 0.95)',
                        backdropFilter: 'blur(10px)',
                        border: '1px solid rgba(221, 216, 132, 0.3)',
                        borderRadius: '12px',
                        padding: '8px 0',
                        minWidth: '180px',
                        zIndex: 100,
                        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)'
                      }}
                    >
                      {dropdownItems.map((item) => (
                        <button
                          key={item.name}
                          onClick={() => handleDropdownAction(item.action)}
                          style={{
                            display: 'block',
                            width: '100%',
                            padding: '10px 20px',
                            color: '#E8FFFB',
                            fontSize: 'clamp(12px, 1.2vw, 14px)',
                            fontFamily: 'var(--font-jura), Jura, sans-serif',
                            textAlign: 'left',
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer'
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.color = '#DDDA84';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.color = '#E8FFFB';
                          }}
                        >
                          {item.name}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </nav>

              <button
                onClick={handleProfileClick}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '8px',
                  borderRadius: '50%',
                  transition: 'all 0.3s ease',
                  backgroundColor: scrolled || hideHero ? 'rgba(221, 216, 132, 0.1)' : 'transparent'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = 'rgba(221, 216, 132, 0.2)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = scrolled || hideHero ? 'rgba(221, 216, 132, 0.1)' : 'transparent';
                }}
              >
                <User className="w-5 h-5 text-[#E8FFFB]" />
              </button>
            </div>
          </div>
        ) : (
          // ПЛАНШЕТНАЯ/МОБИЛЬНАЯ ВЕРСИЯ
          <div className="flex items-center justify-between">
            {/* Бургер слева */}
            <button
              onClick={() => setMobileMenuOpen(true)}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '8px',
                borderRadius: '50%',
                transition: 'all 0.3s ease',
                backgroundColor: scrolled || hideHero ? 'rgba(221, 216, 132, 0.1)' : 'transparent'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(221, 216, 132, 0.2)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = scrolled || hideHero ? 'rgba(221, 216, 132, 0.1)' : 'transparent';
              }}
            >
              <Menu className="w-5 h-5 text-[#E8FFFB]" />
            </button>

            {/* Логотип по центру */}
            <div 
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              style={{ 
                cursor: 'pointer',
                position: 'absolute',
                left: '50%',
                transform: 'translateX(-50%)',
                width: 'clamp(80px, 35vw, 110px)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <Image
                src="/logos/logo-white.svg"
                alt="Loft Max"
                width={110}
                height={28}
                className="w-full h-auto"
                priority
              />
            </div>

            {/* Иконка пользователя справа */}
            <button
              onClick={handleProfileClick}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '8px',
                borderRadius: '50%',
                transition: 'all 0.3s ease',
                backgroundColor: scrolled || hideHero ? 'rgba(221, 216, 132, 0.1)' : 'transparent'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(221, 216, 132, 0.2)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = scrolled || hideHero ? 'rgba(221, 216, 132, 0.1)' : 'transparent';
              }}
            >
              <User className="w-5 h-5 text-[#E8FFFB]" />
            </button>
          </div>
        )}
      </div>

      <MobileMenu 
        isOpen={mobileMenuOpen} 
        onClose={() => setMobileMenuOpen(false)} 
        onNavigate={scrollToSection}
        onOpenRequest={onOpenRequest}
        onOpenGallery={onOpenGallery}
      />
    </header>
  );
}