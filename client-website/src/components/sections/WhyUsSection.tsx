'use client';

import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';

const features = [
  { 
    icon: '/icons/trending-down 1.svg',
    title: 'Цена на 30% ниже рынка',
    desc: 'За 7 лет отобрали лучших поставщиков. Их оптовые скидки позволяют предложить вам лучшее качество по сниженной цене.'
  },
  { 
    icon: '/icons/check 1.svg',
    title: 'Гарантия 5 лет — без скрытых условий',
    desc: 'При любых проблемах приедем в тот же день и бесплатно всё исправим. Ваши риски — нулевые.'
  },
  { 
    icon: '/icons/airplay 1.svg',
    title: '3D-макет за 2 дня — до монтажа',
    desc: 'После замера наш дизайнер покажет, как будет выглядеть перегородка. Никаких сюрпризов — только точный результат.'
  },
];

export default function WhyUsSection() {
  const [maxHeight, setMaxHeight] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const [animationStarted, setAnimationStarted] = useState(false);
  const textRefs = useRef<(HTMLParagraphElement | null)[]>([]);
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const heights = textRefs.current.map(ref => ref?.offsetHeight || 0);
    const max = Math.max(...heights);
    setMaxHeight(max);
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          setTimeout(() => {
            setAnimationStarted(true);
          }, 1500);
        }
      },
      { threshold: 0.2 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <section 
      id="why-us" 
      ref={sectionRef}
      style={{ 
        width: '100%',
        minHeight: '100vh',
        backgroundColor: 'transparent',
        position: 'relative',
        zIndex: 20,
        overflow: 'hidden'
      }}
    >
      <style>{`
        @keyframes heartbeat {
          0% { transform: scale(1); }
          50% { transform: scale(0.98); }
          100% { transform: scale(1); }
        }
        
        .heartbeat-animation {
          animation: heartbeat 4s ease-in-out infinite;
        }
        
        @keyframes pulseGlow {
          0% {
            box-shadow: 0 0 0 0 rgba(221, 216, 132, 0.4);
            transform: scale(1);
          }
          50% {
            box-shadow: 0 0 0 15px rgba(221, 216, 132, 0);
            transform: scale(1.05);
          }
          100% {
            box-shadow: 0 0 0 0 rgba(221, 216, 132, 0);
            transform: scale(1);
          }
        }
        
        @keyframes iconFloat {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-5px); }
        }
        
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        @keyframes expandWidth {
          from { transform: scaleX(0); }
          to { transform: scaleX(1); }
        }
        
        @keyframes rotateStar {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        
        @keyframes floatLine {
          0%, 100% { transform: translateY(0); opacity: 0.3; }
          50% { transform: translateY(-10px); opacity: 0.6; }
        }
        
        @keyframes shineBorder {
          0% {
            border-color: rgba(221, 216, 132, 0.2);
          }
          50% {
            border-color: rgba(221, 216, 132, 0.6);
          }
          100% {
            border-color: rgba(221, 216, 132, 0.2);
          }
        }
        
        .fade-in-up { animation: fadeInUp 0.6s ease-out 0.3s forwards; }
        .expand-width { animation: expandWidth 0.5s ease-out 0.5s forwards; }
        .expand-width-delay { animation: expandWidth 0.5s ease-out 0.7s forwards; }
        
        @keyframes slideInLeft {
          from { opacity: 0; transform: translateX(-100px); }
          to { opacity: 0.5; transform: translateX(0); }
        }
        
        @keyframes slideInRight {
          from { opacity: 0; transform: translateX(100px); }
          to { opacity: 0.5; transform: translateX(0); }
        }
        
        .slide-in-left {
          animation: slideInLeft 0.8s ease-out 0.2s forwards;
        }
        
        .slide-in-right {
          animation: slideInRight 0.8s ease-out 0.4s forwards;
        }
        
        .rotate-star {
          animation: rotateStar 8s linear infinite;
        }
        
        .float-line {
          animation: floatLine 4s ease-in-out infinite;
        }
        
        .shine-border {
          animation: shineBorder 3s ease-in-out infinite;
        }
        
        @media (max-width: 768px) {
          .desktop-decoration {
            display: none !important;
          }
          .steps-container {
            gap: 30px !important;
            padding: 20px !important;
          }
          .step-card {
            min-width: 100% !important;
            max-width: 100% !important;
          }
          .section-title {
            font-size: 32px !important;
          }
        }
        
        @media (max-width: 480px) {
          .section-title {
            font-size: 28px !important;
          }
        }
      `}</style>

      {/* ВЕРХНЯЯ ЧАСТЬ */}
      <div 
        style={{ 
          width: '100%', 
          height: '80px',
          backgroundColor: '#191B1B',
          position: 'relative',
          zIndex: 21
        }}
        className="md:h-20 lg:h-24"
      />
      
      {/* НИЖНЯЯ ЧАСТЬ */}
      <div 
        style={{ 
          width: '100%', 
          position: 'relative',
          zIndex: 21,
          backgroundImage: 'url(/images/why-us-bg.png)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          display: 'flex',
          flexDirection: 'column'
        }}
        className="min-h-[calc(100vh-64px)] md:min-h-[calc(100vh-80px)] lg:min-h-[calc(100vh-96px)]"
      >
        {/* ЗАТЕМНЕНИЕ */}
        <div 
          style={{ 
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(17, 19, 20, 0.7)',
            zIndex: 1
          }}
        />

        {/* ДЕКОРАТИВНЫЕ ЭЛЕМЕНТЫ (СКРЫВАЮТСЯ НА ТЕЛЕФОНАХ) */}
        <div className="desktop-decoration">
          <div
            className={isVisible ? 'slide-in-left' : ''}
            style={{
              position: 'absolute',
              left: 0,
              top: '20%',
              width: '100px',
              height: '2px',
              backgroundColor: '#DDDA84',
              opacity: 0,
              zIndex: 2
            }}
          />
          
          <div
            className={isVisible ? 'slide-in-right' : ''}
            style={{
              position: 'absolute',
              right: 0,
              bottom: '20%',
              width: '150px',
              height: '2px',
              backgroundColor: '#DDDA84',
              opacity: 0,
              zIndex: 2
            }}
          />

          <div
            className="rotate-star"
            style={{
              position: 'absolute',
              left: '5%',
              top: '15%',
              fontSize: '24px',
              color: '#DDDA84',
              opacity: 0.2,
              zIndex: 2
            }}
          >
            ✦
          </div>

          <div
            className="float-line"
            style={{
              position: 'absolute',
              right: '8%',
              top: '30%',
              width: '60px',
              height: '2px',
              backgroundColor: '#DDDA84',
              opacity: 0.3,
              zIndex: 2
            }}
          />
          
          <div
            className="float-line"
            style={{
              position: 'absolute',
              left: '10%',
              bottom: '25%',
              width: '80px',
              height: '2px',
              backgroundColor: '#DDDA84',
              opacity: 0.3,
              zIndex: 2,
              animationDelay: '1s'
            }}
          />

          <div
            style={{
              position: 'absolute',
              right: '12%',
              bottom: '15%',
              display: 'flex',
              gap: '8px',
              zIndex: 2
            }}
          >
            {[...Array(3)].map((_, i) => (
              <div
                key={i}
                className="float-line"
                style={{
                  width: '4px',
                  height: '4px',
                  borderRadius: '50%',
                  backgroundColor: '#DDDA84',
                  opacity: 0.4,
                  animationDelay: `${i * 0.5}s`
                }}
              />
            ))}
          </div>
        </div>

        {/* ЗАГОЛОВОК */}
        <div 
          className={isVisible ? 'fade-in-up' : ''}
          style={{ 
            width: '100%',
            height: 'auto',
            paddingTop: 'clamp(40px, 8vh, 60px)',
            paddingBottom: 'clamp(20px, 4vh, 30px)',
            position: 'relative',
            zIndex: 2,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            opacity: 0
          }}
        >
          <h2
            className="section-title"
            style={{ 
              fontFamily: 'var(--font-poiret-one), Poiret One, cursive',
              fontWeight: '300',
              color: '#E8FFFB',
              fontSize: 'clamp(36px, 6vw, 70px)',
              marginBottom: '20px',
              textAlign: 'center'
            }}
          >
            Почему выбирают нас
          </h2>
          
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <div 
              className={isVisible ? 'expand-width' : ''}
              style={{ 
                width: 'clamp(80px, 10vw, 120px)', 
                height: '2px', 
                backgroundColor: '#DDDA84', 
                marginBottom: '8px',
                transform: 'scaleX(0)',
                transformOrigin: 'center'
              }} 
            />
            <div 
              className={isVisible ? 'expand-width-delay' : ''}
              style={{ 
                width: 'clamp(50px, 7vw, 70px)', 
                height: '2px', 
                backgroundColor: '#DDDA84',
                transform: 'scaleX(0)',
                transformOrigin: 'center'
              }} 
            />
          </div>
        </div>

        {/* ТРИ БЛОКА */}
        <div 
          className="steps-container flex-col md:flex-row"
          style={{ 
            width: '100%',
            height: 'auto',
            flex: 1,
            position: 'relative',
            zIndex: 2,
            display: 'flex',
            flexDirection: 'row',
            justifyContent: 'center',
            alignItems: 'stretch',
            gap: 'clamp(20px, 3vw, 40px)',
            padding: 'clamp(20px, 4%, 50px)',
            flexWrap: 'wrap'
          }}
        >
          {features.map((feature, index) => (
            <div
              key={index}
              className={`step-card ${animationStarted ? 'heartbeat-animation' : ''} shine-border`}
              style={{ 
                flex: '1 1 280px',
                minWidth: 'clamp(280px, 40%, 320px)',
                maxWidth: 'clamp(320px, 45%, 400px)',
                backgroundColor: 'rgba(17, 19, 20, 0.7)',
                borderRadius: '24px',
                padding: 'clamp(25px, 4%, 35px)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                border: '1px solid rgba(221, 216, 132, 0.2)',
                justifyContent: 'flex-start',
                height: 'auto',
                opacity: isVisible ? 1 : 0,
                transform: isVisible ? 'translateY(0)' : 'translateY(50px)',
                transition: `all 0.6s ease-out ${0.4 + index * 0.15}s`,
                transformOrigin: 'center',
                position: 'relative',
                overflow: 'hidden'
              }}
            >
              {/* Декоративный уголок сверху слева */}
              <div
                className="desktop-decoration"
                style={{
                  position: 'absolute',
                  top: '0',
                  left: '0',
                  width: '30px',
                  height: '30px',
                  borderTop: '2px solid rgba(221, 216, 132, 0.3)',
                  borderLeft: '2px solid rgba(221, 216, 132, 0.3)',
                  borderTopLeftRadius: '24px',
                  zIndex: 1
                }}
              />
              
              {/* Декоративный уголок снизу справа */}
              <div
                className="desktop-decoration"
                style={{
                  position: 'absolute',
                  bottom: '0',
                  right: '0',
                  width: '30px',
                  height: '30px',
                  borderBottom: '2px solid rgba(221, 216, 132, 0.3)',
                  borderRight: '2px solid rgba(221, 216, 132, 0.3)',
                  borderBottomRightRadius: '24px',
                  zIndex: 1
                }}
              />
              
              {/* Декоративная точка в углу */}
              <div
                className="desktop-decoration"
                style={{
                  position: 'absolute',
                  top: '15px',
                  right: '20px',
                  width: '6px',
                  height: '6px',
                  borderRadius: '50%',
                  backgroundColor: '#DDDA84',
                  opacity: 0.3
                }}
              />
              
              {/* Декоративная линия под заголовком */}
              <div
                className="desktop-decoration"
                style={{
                  width: '40px',
                  height: '1px',
                  backgroundColor: '#DDDA84',
                  opacity: 0.2,
                  marginBottom: '15px'
                }}
              />
              
              <h3 
                style={{ 
                  fontFamily: 'var(--font-poiret-one), Poiret One, cursive',
                  color: '#DDDA84',
                  fontSize: 'clamp(18px, 2.5vw, 22px)',
                  fontWeight: 'bold',
                  textAlign: 'center',
                  marginBottom: '20px',
                  minHeight: 'clamp(55px, 7vh, 65px)'
                }}
              >
                {feature.title}
              </h3>
              
              <div 
                style={{ 
                  width: 'clamp(80px, 12vw, 100px)',
                  height: 'clamp(80px, 12vw, 100px)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: '50%',
                  backgroundColor: 'rgba(221, 216, 132, 0.15)',
                  border: '2px solid #DDDA84',
                  marginBottom: '20px',
                  flexShrink: 0,
                  transition: 'all 0.3s ease',
                  cursor: 'pointer',
                  animation: 'pulseGlow 2s ease-in-out infinite',
                  boxShadow: '0 0 20px rgba(221, 216, 132, 0.3)'
                }}
                className="hover:scale-110"
              >
                <Image
                  src={feature.icon}
                  alt={feature.title}
                  width={45}
                  height={45}
                  style={{ 
                    width: '55%',
                    height: '55%',
                    objectFit: 'contain',
                    filter: 'drop-shadow(0 0 5px rgba(221, 216, 132, 0.5))',
                    animation: 'iconFloat 3s ease-in-out infinite',
                    position: 'relative',
                    zIndex: 2
                  }}
                />
              </div>
              
              <p 
                ref={el => { textRefs.current[index] = el; }}
                style={{ 
                  fontFamily: 'var(--font-jura), Jura, sans-serif',
                  color: '#E8FFFB',
                  fontSize: 'clamp(16px, 2.2vw, 20px)',
                  lineHeight: 1.5,
                  opacity: 0.9,
                  height: maxHeight > 0 ? `${maxHeight}px` : 'auto',
                  display: 'flex',
                  alignItems: 'center',
                  textAlign: 'center'
                }}
              >
                {feature.desc}
              </p>
              
              {/* Декоративная звездочка внизу */}
              <div
                className="desktop-decoration"
                style={{
                  position: 'absolute',
                  bottom: '10px',
                  left: '15px',
                  fontSize: '10px',
                  color: '#DDDA84',
                  opacity: 0.2
                }}
              >
                ✦
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}