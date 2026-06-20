'use client';

import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import WhyUsSection from '@/components/sections/WhyUsSection';
import ProjectsSection from '@/components/sections/ProjectsSection';
import HowWeWorkSection from '@/components/sections/HowWeWorkSection';
import DiscountSection from '@/components/sections/DiscountSection';
import CommentSection from '@/components/sections/CommentSection';
import AuthModal from '@/components/modals/AuthModal';
import ProfileModal from '@/components/modals/ProfileModal';
import RequestModal from '@/components/modals/RequestModal';
import GalleryModal from '@/components/modals/GalleryModal';
import Image from 'next/image';
import { useEffect, useState, useRef, useCallback, useMemo } from 'react';

export default function Home() {
  const [progress, setProgress] = useState(0);
  const [showHeader, setShowHeader] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isAboutVisible, setIsAboutVisible] = useState(false);
  const aboutRef = useRef<HTMLDivElement>(null);
  const [activeBg, setActiveBg] = useState('hero');
  const [hideAbout, setHideAbout] = useState(false);
  const [isAtBottom, setIsAtBottom] = useState(false);
  
  // Состояния для модальных окон
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);
  const [isGalleryModalOpen, setIsGalleryModalOpen] = useState(false);

  // Оптимизация: используем useRef для флагов, чтобы избежать лишних ререндеров
  const scrollState = useRef({
    progress: 0,
    showHeader: false,
    isAboutVisible: false,
    hideAbout: false,
    activeBg: 'hero',
  });

  // Определяем мобильное устройство
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Оптимизированная функция скролла с requestAnimationFrame
  const handleScroll = useCallback(() => {
    // Используем requestAnimationFrame для синхронизации с частотой обновления экрана
    if (typeof window !== 'undefined') {
      window.requestAnimationFrame(() => {
        const scrollY = window.scrollY;
        const windowHeight = window.innerHeight;
        const maxScroll = windowHeight;
        const newProgress = Math.min(1, scrollY / maxScroll);
        
        // Обновляем только если значение изменилось
        if (Math.abs(newProgress - scrollState.current.progress) > 0.01) {
          scrollState.current.progress = newProgress;
          setProgress(newProgress);
        }
        
        const newShowHeader = newProgress > 0.7;
        if (newShowHeader !== scrollState.current.showHeader) {
          scrollState.current.showHeader = newShowHeader;
          setShowHeader(newShowHeader);
        }
        
        const newIsAboutVisible = newProgress > 0.5;
        if (newIsAboutVisible !== scrollState.current.isAboutVisible) {
          scrollState.current.isAboutVisible = newIsAboutVisible;
          setIsAboutVisible(newIsAboutVisible);
        }
        
        // Проверяем секцию "Почему выбирают нас"
        const whyUsSection = document.getElementById('why-us');
        if (whyUsSection) {
          const whyUsRect = whyUsSection.getBoundingClientRect();
          const newHideAbout = whyUsRect.top < windowHeight * 0.1;
          if (newHideAbout !== scrollState.current.hideAbout) {
            scrollState.current.hideAbout = newHideAbout;
            setHideAbout(newHideAbout);
          }
        }
        
        // Проверяем секцию "О компании"
        const aboutSection = document.getElementById('switch');
        if (aboutSection) {
          const aboutRect = aboutSection.getBoundingClientRect();
          const newActiveBg = aboutRect.bottom < 0 ? 'projects' : 'hero';
          if (newActiveBg !== scrollState.current.activeBg) {
            scrollState.current.activeBg = newActiveBg;
            setActiveBg(newActiveBg);
          }
        }
      });
    }
  }, []);

  // Отдельный эффект для определения положения внизу страницы
  useEffect(() => {
    // Используем useRef для timeout
    const timeoutRef = { current: null as NodeJS.Timeout | null };
    
    const handleBottomCheck = () => {
      const commentSection = document.getElementById('comments');
      const commentRect = commentSection?.getBoundingClientRect();
      const isCommentVisible = commentRect && commentRect.top < window.innerHeight * 0.5;
      setIsAtBottom(isCommentVisible === true);
    };
    
    // Используем throttle для проверки дна
    const throttledCheck = () => {
      if (timeoutRef.current) return;
      timeoutRef.current = setTimeout(() => {
        handleBottomCheck();
        timeoutRef.current = null;
      }, 100);
    };
    
    window.addEventListener('scroll', throttledCheck);
    handleBottomCheck();
    
    return () => {
      window.removeEventListener('scroll', throttledCheck);
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    };
  }, []);

  // Основной обработчик скролла с throttle
  useEffect(() => {
    let ticking = false;
    
    const onScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          handleScroll();
          ticking = false;
        });
        ticking = true;
      }
    };
    
    window.addEventListener('scroll', onScroll, { passive: true });
    handleScroll();
    
    return () => window.removeEventListener('scroll', onScroll);
  }, [handleScroll]);

  // Мемоизация значений для производительности
  const heroStyles = useMemo(() => ({
    transform: `scale(${Math.max(0, 1 - progress * 1.2)})`,
    opacity: Math.max(0, 1 - progress * 1.5),
    filter: `blur(${isMobile ? Math.min(progress * 15, 10) : progress * 20}px)`,
  }), [progress, isMobile]);

  const textStyles = useMemo(() => ({
    transform: `translateY(${Math.min(200, progress * 250)}px)`,
    opacity: Math.max(0, 1 - progress * 1.8),
  }), [progress]);

  const arrowStyles = useMemo(() => ({
    transform: `translateY(${Math.min(200, progress * 500)}px)`,
    opacity: Math.max(0, 1 - progress * 3.5),
  }), [progress]);

  const aboutStyles = useMemo(() => ({
    transform: `translateY(${Math.max(0, 100 - progress * 200)}%)`,
    opacity: Math.min(1, Math.max(0, (progress - 0.3) * 2.5)),
    pointerEvents: progress > 0.4 ? 'auto' : 'none',
  }), [progress]);

  // Для мобильных устройств отключаем сложные эффекты
  const isMobileOptimized = isMobile;

  return (
    <div className="min-h-screen flex flex-col">
      {/* Шапка */}
      <div style={{ 
        opacity: showHeader ? 1 : 0,
        transform: `translateY(${showHeader ? 0 : -50}px)`,
        transition: 'all 0.5s ease-out',
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 50
      }}>
        <Header 
          isVisible={true} 
          hideHero={false}
          onOpenAuth={() => setIsAuthModalOpen(true)}
          onOpenProfile={() => setIsProfileModalOpen(true)}
          onOpenRequest={() => setIsRequestModalOpen(true)}
          onOpenGallery={() => setIsGalleryModalOpen(true)}
        />
      </div>
      
      <main className="flex-grow">
        {/* ФОН ДЛЯ СЕКЦИЙ ПРИВЕТСТВИЯ И О КОМПАНИИ - оптимизирован для мобильных */}
        <div 
          className="fixed inset-0 z-0 w-full h-full overflow-hidden transition-opacity duration-700"
          style={{ 
            opacity: activeBg === 'hero' ? 1 : 0,
            pointerEvents: 'none',
            // Для мобильных используем более легкий filter
            willChange: isMobile ? 'opacity' : 'opacity, filter',
          }}
        >
          <div style={{ width: '100%', height: '100%', position: 'relative' }}>
            <img
              src="/images/hero-bg-normal.png"
              alt="Background"
              className="absolute inset-0 w-full h-full object-cover"
              style={{ 
                // На мобильных уменьшаем blur до минимума
                filter: isMobile 
                  ? `blur(${Math.max(0, 4 - progress * 5)}px) brightness(0.7) contrast(0.8)`
                  : `blur(${Math.max(0, 12 - progress * 15)}px) brightness(0.7) contrast(0.8)`,
                // Оптимизация для GPU
                transform: 'translateZ(0)',
                willChange: isMobile ? 'transform' : 'transform, filter',
              }}
            />
          </div>
        </div>

        {/* ФОН ДЛЯ СЕКЦИИ ПРОЕКТЫ И ДАЛЬШЕ */}
        <div 
          className="fixed inset-0 z-0 w-full h-full overflow-hidden transition-opacity duration-700"
          style={{ 
            opacity: activeBg === 'projects' ? 1 : 0,
            pointerEvents: 'none',
            willChange: 'opacity',
          }}
        >
          <div style={{ width: '100%', height: '100%', position: 'relative' }}>
            <img
              src="/images/projects-bg.png"
              alt="Projects Background"
              className="absolute inset-0 w-full h-full object-cover"
              style={{ 
                filter: isMobile ? 'blur(4px) brightness(0.6) contrast(0.8)' : 'blur(8px) brightness(0.6) contrast(0.8)',
                transform: 'translateZ(0)',
                willChange: 'transform',
              }}
            />
          </div>
        </div>

        {/* ОБЩИЙ КОНТЕЙНЕР ЗАТЕМНЕНИЯ */}
        <div className="fixed inset-0 z-0 w-full h-full pointer-events-none">
          <div className="absolute inset-0 w-full h-full" style={{ backgroundColor: 'rgba(17, 19, 20, 0.7)' }} />
        </div>

        {/* КОНТЕНТ ПРИВЕТСТВИЯ - оптимизирован для мобильных */}
        <div 
          id="hero"
          className="fixed inset-0 z-10"
          style={{ 
            pointerEvents: progress > 0.5 ? 'none' : 'auto',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            left: 0,
            right: 0,
            top: 0,
            bottom: 0,
            padding: 'clamp(20px, 5vh, 40px) 0',
            // Оптимизация для GPU
            transform: 'translateZ(0)',
            willChange: isMobile ? 'opacity' : 'opacity, transform',
          }}
        >
          <div className="w-full max-w-4xl mx-auto px-4" style={{ 
            display: 'flex', 
            flexDirection: 'column', 
            justifyContent: 'space-between',
            height: '100%'
          }}>
            
            {/* ВЕРХНЯЯ ЧАСТЬ - ЛОГОТИП И ТЕКСТ */}
            <div style={{ 
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center'
            }}>
              {/* ЛОГОТИП - упрощенная анимация для мобильных */}
              <div 
                style={{ 
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  // Для мобильных используем упрощенную анимацию
                  transform: isMobile 
                    ? `scale(${Math.max(0.3, 1 - progress * 1.2)})` 
                    : `scale(${Math.max(0, 1 - progress * 1.2)})`,
                  opacity: Math.max(0, 1 - progress * 1.5),
                  // Упрощаем blur для мобильных
                  filter: isMobile 
                    ? `blur(${Math.min(progress * 10, 5)}px)`
                    : `blur(${progress * 20}px)`,
                  transition: isMobile ? 'all 0.3s ease-out' : 'all 0.5s ease-out',
                  marginBottom: 'clamp(15px, 3vh, 30px)',
                  willChange: isMobile ? 'transform, opacity' : 'transform, opacity, filter',
                }}
              >
                <div style={{ width: 'clamp(250px, 50vw, 800px)' }}>
                  <Image
                    src="/logos/logo.svg"
                    alt="Loft Max Logo"
                    width={800}
                    height={150}
                    priority
                    className="w-full h-auto"
                    // Оптимизация для мобильных
                    sizes="(max-width: 768px) 100vw, 50vw"
                    quality={isMobile ? 75 : 90}
                  />
                </div>
              </div>

              {/* ТЕКСТОВЫЙ БЛОК - упрощенная анимация для мобильных */}
              <div
                style={{
                  transform: `translateY(${Math.min(200, progress * 250)}px)`,
                  opacity: Math.max(0, 1 - progress * 1.8),
                  transition: isMobile ? 'all 0.2s ease-out' : 'all 0.3s ease-out',
                  willChange: 'transform, opacity',
                }}
              >
                <div className="loft-text-block">
                  <div className="loft-text-container">
                    <h1 className="loft-h1">
                      Хотите разделить пространство,{' '}
                      <span className="loft-h1-span">не теряя света и простора?</span>
                    </h1>
                    <p className="loft-text">Loft Max <span className="font-light">знает, как!</span></p>
                    <p className="loft-text">Стеклянные лофт-перегородки — современно, стильно, функционально.</p>
                  </div>
                </div>
              </div>
            </div>

            {/* НИЖНЯЯ ЧАСТЬ - СТРЕЛКА */}
            <div
              style={{
                transform: `translateY(${Math.min(200, progress * 500)}px)`,
                opacity: Math.max(0, 1 - progress * 3.5),
                transition: isMobile ? 'all 0.15s ease-out' : 'all 0.2s ease-out',
                marginBottom: 'clamp(20px, 4vh, 40px)',
                willChange: 'transform, opacity',
              }}
            >
              <div className="flex flex-col items-center">
                <div 
                  className="animate-bounce cursor-pointer" 
                  style={{ width: 'clamp(80px, 12vw, 140px)' }}
                  onClick={() => {
                    const aboutSection = document.getElementById('switch');
                    if (aboutSection) aboutSection.scrollIntoView({ behavior: 'smooth' });
                  }}
                >
                  <Image
                    src="/icons/arrow-down.svg"
                    alt="Прокрутить вниз"
                    width={140}
                    height={140}
                    className="w-full h-auto"
                    loading="lazy"
                  />
                </div>
                <span 
                  className="loft-small-text tracking-wide"
                  style={{ cursor: 'pointer', marginTop: '8px' }}
                  onClick={() => {
                    const aboutSection = document.getElementById('about_chek');
                    if (aboutSection) aboutSection.scrollIntoView({ behavior: 'smooth' });
                  }}
                >
                  Прокрутите вниз
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* КОНТЕНТ О КОМПАНИИ - оптимизирован для мобильных */}
        {!hideAbout && (
          <div 
            ref={aboutRef}
            className="fixed inset-0 z-10 transition-all duration-500 ease-out"
            style={{ 
              transform: `translateY(${Math.max(0, 100 - progress * 200)}%) translateZ(0)`,
              opacity: Math.min(1, Math.max(0, (progress - 0.3) * 2.5)),
              pointerEvents: progress > 0.4 ? 'auto' : 'none',
              left: 0,
              right: 0,
              top: 0,
              bottom: 0,
              display: 'flex',
              flexDirection: 'column',
              overflowY: 'auto',
              overflowX: 'hidden',
              // Оптимизация для GPU
              willChange: isMobile ? 'transform, opacity' : 'transform, opacity',
              // Для мобильных упрощаем переход
              transition: isMobile ? 'all 0.3s ease-out' : 'all 0.7s ease-out',
            }}
          >
            {/* Отступ под шапку */}
            <div style={{ 
              height: 'clamp(70px, 12vh, 100px)',
              flexShrink: 0 
            }} />

            <div className="about-container">
              {/* ЛЕВАЯ ДЕКОРАТИВНАЯ ЛИНИЯ - скрываем на мобильных */}
              {!isMobile && (
                <div className={`about-left-line ${isAboutVisible ? 'active' : ''}`}>
                  <div style={{
                    position: 'absolute',
                    top: -10,
                    left: -4,
                    width: '10px',
                    height: '10px',
                    borderRadius: '50%',
                    backgroundColor: '#DDDA84',
                    opacity: 0.8
                  }} />
                  <div style={{
                    position: 'absolute',
                    bottom: -10,
                    left: -4,
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                    backgroundColor: '#DDDA84',
                    opacity: 0.6
                  }} />
                </div>
              )}

              {/* ПРАВАЯ ДЕКОРАТИВНАЯ ЛИНИЯ - скрываем на мобильных */}
              {!isMobile && (
                <div className={`about-right-line ${isAboutVisible ? 'active' : ''}`}>
                  <div style={{
                    position: 'absolute',
                    top: -8,
                    right: -4,
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                    backgroundColor: '#DDDA84',
                    opacity: 0.7
                  }} />
                  <div style={{
                    position: 'absolute',
                    bottom: -12,
                    right: -5,
                    width: '10px',
                    height: '10px',
                    borderRadius: '50%',
                    backgroundColor: '#DDDA84',
                    opacity: 0.5
                  }} />
                </div>
              )}

              <div className="about-content">
                {/* ЗАГОЛОВОК - упрощенная анимация для мобильных */}
                <div style={{
                  transition: isMobile ? 'all 0.3s ease-out' : 'all 0.6s ease-out',
                  opacity: isAboutVisible ? 1 : 0,
                  transform: isAboutVisible ? 'translateY(0)' : 'translateY(-20px)',
                  width: '100%',
                  willChange: 'transform, opacity',
                }}>
                  <h2 className="about-title">О компании</h2>
                  <div className="about-subtitle">
                    <div className="about-line-1" style={{
                      transition: isMobile ? 'transform 0.3s ease-out 0.2s' : 'transform 0.5s ease-out 0.3s',
                      transform: isAboutVisible ? 'scaleX(1)' : 'scaleX(0)'
                    }} />
                    <div className="about-line-2" style={{
                      transition: isMobile ? 'transform 0.3s ease-out 0.4s' : 'transform 0.5s ease-out 0.5s',
                      transform: isAboutVisible ? 'scaleX(1)' : 'scaleX(0)'
                    }} />
                  </div>
                </div>

                {/* БЛОКИ - упрощенная анимация для мобильных */}
                <div className="about-blocks">
                  {/* БЛОК 1 */}
                  <div className="about-block" style={{
                    transition: isMobile ? 'all 0.3s ease-out 0.2s' : 'all 0.5s ease-out 0.4s',
                    opacity: isAboutVisible ? 1 : 0,
                    transform: isAboutVisible ? 'translateY(0)' : 'translateY(30px)',
                    willChange: 'transform, opacity',
                  }}>
                    <svg>
                      <rect x="2" y="2" width="calc(100% - 4px)" height="calc(100% - 4px)" rx="18" />
                    </svg>
                    <h3 className="about-block-title">С 2014 года на рынке</h3>
                    <p className="about-block-text">
                      Изготовили и смонтировали <strong style={{ color: '#DDDA84' }}>1200+</strong> перегородок из стекла для жителей Хабаровского края.
                    </p>
                  </div>

                  {/* БЛОК 2 */}
                  <div className="about-block" style={{
                    transition: isMobile ? 'all 0.3s ease-out 0.3s' : 'all 0.5s ease-out 0.6s',
                    opacity: isAboutVisible ? 1 : 0,
                    transform: isAboutVisible ? 'translateY(0)' : 'translateY(30px)',
                    willChange: 'transform, opacity',
                  }}>
                    <svg>
                      <rect x="2" y="2" width="calc(100% - 4px)" height="calc(100% - 4px)" rx="18" />
                    </svg>
                    <h3 className="about-block-title">Профессиональный подход</h3>
                    <p className="about-block-text">
                      Бесплатный замер и <strong style={{ color: '#DDDA84' }}>3D-визуализация</strong> уже завтра. Изготовим и установим перегородку под ключ.
                    </p>
                  </div>

                  {/* БЛОК 3 */}
                  <div className="about-block" style={{
                    transition: isMobile ? 'all 0.3s ease-out 0.4s' : 'all 0.5s ease-out 0.8s',
                    opacity: isAboutVisible ? 1 : 0,
                    transform: isAboutVisible ? 'translateY(0)' : 'translateY(30px)',
                    willChange: 'transform, opacity',
                  }}>
                    <svg>
                      <rect x="2" y="2" width="calc(100% - 4px)" height="calc(100% - 4px)" rx="18" />
                    </svg>
                    <h3 className="about-block-title">Выгодные условия</h3>
                    <p className="about-block-text">
                      Цена на <strong style={{ color: '#DDDA84' }}>30% ниже рынка</strong>, монтаж — всего за <strong style={{ color: '#DDDA84' }}>1 день</strong>. Лофт-перегородки из стекла под ключ.
                    </p>
                    <button className="about-button" onClick={() => {
                      const discountSection = document.getElementById('discount');
                      if (discountSection) discountSection.scrollIntoView({ behavior: 'smooth' });
                    }}>
                      Оставить заявку
                    </button>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Дополнительный отступ снизу */}
            <div style={{ height: '20px', flexShrink: 0 }} />
          </div>
        )}

        {/* ПУСТЫЕ СЕКЦИИ ДЛЯ ПРОКРУТКИ */}
        <div style={{ height: '100vh' }} />
        <div id="about_chek" style={{ height: '100vh' }} />
        <div id="switch" style={{ height: '100vh' }} />

        {/* ОСТАЛЬНЫЕ СЕКЦИИ */}
        <div className="relative z-20">
          <WhyUsSection />
          <ProjectsSection onOpenGallery={() => setIsGalleryModalOpen(true)} />
          <HowWeWorkSection />
          <DiscountSection />
          <CommentSection onOpenProfile={() => setIsProfileModalOpen(true)} />
        </div>

        {/* ХЛЕБНЫЕ КРОШКИ - СТРЕЛКА ВНИЗ/ВВЕРХ */}
        {progress > 0.3 && (
          <div
            style={{
              position: 'fixed',
              bottom: 'clamp(40px, 8vh, 80px)',
              right: 'clamp(40px, 8vw, 80px)',
              zIndex: 30,
              pointerEvents: 'auto'
            }}
          >
            <button
              onClick={() => {
                const scrollY = window.scrollY;
                const windowHeight = window.innerHeight;
                
                if (isAtBottom) {
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                  return;
                }
                
                if (scrollY < windowHeight * 1.5) {
                  const aboutSection = document.getElementById('switch');
                  if (aboutSection) aboutSection.scrollIntoView({ behavior: 'smooth' });
                } else if (scrollY < windowHeight * 2.5) {
                  const whyUsSection = document.getElementById('why-us');
                  if (whyUsSection) whyUsSection.scrollIntoView({ behavior: 'smooth' });
                } else if (scrollY < windowHeight * 3.5) {
                  const projectsSection = document.getElementById('projects');
                  if (projectsSection) projectsSection.scrollIntoView({ behavior: 'smooth' });
                } else if (scrollY < windowHeight * 4.5) {
                  const howWeWorkSection = document.getElementById('how-we-work');
                  if (howWeWorkSection) howWeWorkSection.scrollIntoView({ behavior: 'smooth' });
                } else if (scrollY < windowHeight * 5.5) {
                  const discountSection = document.getElementById('discount');
                  if (discountSection) discountSection.scrollIntoView({ behavior: 'smooth' });
                } else {
                  const commentSection = document.getElementById('comments');
                  if (commentSection) commentSection.scrollIntoView({ behavior: 'smooth' });
                }
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: 'clamp(50px, 8vw, 70px)',
                height: 'clamp(50px, 8vw, 70px)',
                borderRadius: '50%',
                backgroundColor: 'rgba(17, 19, 20, 0.6)',
                backdropFilter: 'blur(10px)',
                border: '2px solid rgba(221, 216, 132, 0.3)',
                cursor: 'pointer',
                transition: 'all 0.3s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(221, 216, 132, 0.2)';
                e.currentTarget.style.transform = 'scale(1.05)';
                e.currentTarget.style.borderColor = '#DDDA84';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(17, 19, 20, 0.6)';
                e.currentTarget.style.transform = 'scale(1)';
                e.currentTarget.style.borderColor = 'rgba(221, 216, 132, 0.3)';
              }}
            >
              {isAtBottom ? (
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#DDDA84" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="18 15 12 9 6 15" />
                </svg>
              ) : (
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#DDDA84" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              )}
            </button>
          </div>
        )}
      </main>
      
      <Footer />
      
      {/* МОДАЛЬНЫЕ ОКНА */}
      <AuthModal 
        isOpen={isAuthModalOpen} 
        onClose={() => setIsAuthModalOpen(false)}
        onSuccess={() => {
          setIsAuthModalOpen(false);
          setIsProfileModalOpen(true);
        }}
      />
      
      <ProfileModal 
        isOpen={isProfileModalOpen} 
        onClose={() => setIsProfileModalOpen(false)} 
      />
      
      <RequestModal 
        isOpen={isRequestModalOpen} 
        onClose={() => setIsRequestModalOpen(false)} 
      />
      
      <GalleryModal 
        isOpen={isGalleryModalOpen} 
        onClose={() => setIsGalleryModalOpen(false)} 
      />
    </div>
  );
}