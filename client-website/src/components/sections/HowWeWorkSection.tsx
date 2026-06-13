//HowWeWorkSection
'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';

const steps = [
  { 
    icon: '/icons/paper.svg',
    title: 'Заявка и консультация',
    desc: 'Оставляете заявку → Мы связываемся с вами в течение 15 минут для уточнения деталей.'
  },
  { 
    icon: '/icons/edit_light.svg',
    title: 'Бесплатный замер',
    desc: 'Приезжаем на объект в удобное время → Делаем замеры → Предлагаем 2-3 варианта сметы.'
  },
  { 
    icon: '/icons/group_duotone_line.svg',
    title: 'Договор и оплата',
    desc: 'Фиксируем стоимость и сроки в договоре: 75% предоплата, 25% после монтажа.'
  },
  { 
    icon: '/icons/package_car.svg',
    title: 'Производство и монтаж',
    desc: 'Изготовление: до 14 дней. Монтаж: 1 день. Гарантия: 5 лет.'
  },
];

export default function HowWeWorkSection() {
  const [isVisible, setIsVisible] = useState(false);
  const [pulsingContainer, setPulsingContainer] = useState(-1);
  const sectionRef = useRef<HTMLElement>(null);
  const loopIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const isVisibleRef = useRef(false);

  // Функция для проверки видимости секции
  const checkVisibility = () => {
    if (sectionRef.current) {
      const rect = sectionRef.current.getBoundingClientRect();
      const windowHeight = window.innerHeight;
      const isIntersecting = rect.top < windowHeight - 100 && rect.bottom > 100;
      
      if (isIntersecting && !isVisibleRef.current) {
        isVisibleRef.current = true;
        setIsVisible(true);
        setTimeout(() => {
          startLoopPulsing();
        }, 1000);
      } else if (!isIntersecting && isVisibleRef.current) {
        isVisibleRef.current = false;
        setIsVisible(false);
        if (loopIntervalRef.current) {
          clearInterval(loopIntervalRef.current);
          loopIntervalRef.current = null;
        }
      }
    }
  };

  const startLoopPulsing = () => {
    if (loopIntervalRef.current) {
      clearInterval(loopIntervalRef.current);
    }
    
    let current = 0;
    
    const pulse = () => {
      setPulsingContainer(current);
      setTimeout(() => setPulsingContainer(-1), 600);
      current = (current + 1) % steps.length;
    };
    
    pulse();
    
    loopIntervalRef.current = setInterval(pulse, 2000);
  };

  useEffect(() => {
    // Начальная проверка
    checkVisibility();
    
    // Подписываемся на scroll и resize
    window.addEventListener('scroll', checkVisibility);
    window.addEventListener('resize', checkVisibility);
    
    return () => {
      window.removeEventListener('scroll', checkVisibility);
      window.removeEventListener('resize', checkVisibility);
      if (loopIntervalRef.current) {
        clearInterval(loopIntervalRef.current);
      }
    };
  }, []); // Пустой массив зависимостей - эффект выполняется только один раз

  return (
    <section 
      id="how-we-work" 
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
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        @keyframes expandWidth {
          from { transform: scaleX(0); }
          to { transform: scaleX(1); }
        }
        
        .fade-in-up { animation: fadeInUp 0.6s ease-out 0.3s forwards; }
        .expand-width { animation: expandWidth 0.5s ease-out 0.5s forwards; }
        .expand-width-delay { animation: expandWidth 0.5s ease-out 0.7s forwards; }
        
        @keyframes pulseContainer {
          0% {
            transform: scale(1);
            box-shadow: 0 0 0 0 rgba(221, 216, 132, 0.3);
          }
          50% {
            transform: scale(1.02);
            box-shadow: 0 0 20px 0 rgba(221, 216, 132, 0.5);
          }
          100% {
            transform: scale(1);
            box-shadow: 0 0 0 0 rgba(221, 216, 132, 0.3);
          }
        }
        
        .pulse-container {
          animation: pulseContainer 0.6s ease-out forwards;
        }
        
        @keyframes slideInStep {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .slide-in-step {
          animation: slideInStep 0.5s ease-out forwards;
        }
        
        @keyframes floatLine {
          0%, 100% { transform: translateY(0); opacity: 0.3; }
          50% { transform: translateY(-10px); opacity: 0.6; }
        }
        
        @keyframes rotateGear {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        
        .float-line {
          animation: floatLine 4s ease-in-out infinite;
        }
        
        .rotate-gear {
          animation: rotateGear 12s linear infinite;
        }
        
        .step-card {
          transition: all 0.3s ease;
        }
        
        .step-card:hover {
          transform: translateY(-5px);
          border-color: #DDDA84;
          box-shadow: 0 0 25px rgba(221, 216, 132, 0.3);
        }
        
        /* АДАПТИВНОСТЬ */
        @media (max-width: 768px) {
          .steps-container {
            grid-template-columns: 1fr !important;
            gap: 30px !important;
            padding: 20px !important;
          }
          .step-card {
            min-height: auto !important;
            padding: 30px 20px !important;
          }
          .section-title {
            font-size: 32px !important;
          }
          .desktop-decoration {
            display: none !important;
          }
        }
        
        @media (max-width: 480px) {
          .section-title {
            font-size: 28px !important;
          }
          .step-card {
            padding: 25px 15px !important;
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
          backgroundImage: 'url(/images/how-work-bg.png)',
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

        {/* ДЕКОРАТИВНЫЕ ЭЛЕМЕНТЫ (ТОЛЬКО НА ДЕСКТОПЕ) */}
        <div className="desktop-decoration">
          <div
            className="float-line"
            style={{
              position: 'absolute',
              left: '5%',
              top: '30%',
              width: '80px',
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
              right: '5%',
              bottom: '30%',
              width: '120px',
              height: '2px',
              backgroundColor: '#DDDA84',
              opacity: 0.3,
              zIndex: 2,
              animationDelay: '1s'
            }}
          />

          <div
            className="rotate-gear"
            style={{
              position: 'absolute',
              left: '8%',
              bottom: '15%',
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              border: '2px dotted #DDDA84',
              opacity: 0.25,
              zIndex: 2
            }}
          >
            <div
              style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                width: '12px',
                height: '12px',
                borderRadius: '50%',
                backgroundColor: '#DDDA84',
                transform: 'translate(-50%, -50%)',
                opacity: 0.5
              }}
            />
          </div>

          <div
            style={{
              position: 'absolute',
              right: '10%',
              top: '20%',
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
          style={{ 
            width: '100%',
            height: 'auto',
            paddingTop: 'clamp(30px, 5vh, 50px)',
            paddingBottom: 'clamp(20px, 3vh, 30px)',
            position: 'relative',
            zIndex: 2,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            opacity: isVisible ? 1 : 0,
            transform: isVisible ? 'translateY(0)' : 'translateY(-30px)',
            transition: 'all 0.6s ease-out 0.3s'
          }}
        >
          <h2
            className="section-title"
            style={{ 
              fontFamily: 'var(--font-poiret-one), Poiret One, cursive',
              fontWeight: '300',
              color: '#E8FFFB',
              fontSize: 'clamp(32px, 6vw, 70px)',
              marginBottom: '20px',
              textAlign: 'center'
            }}
          >
            Как мы работаем
          </h2>
          
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <div 
              style={{ 
                width: 'clamp(80px, 10vw, 120px)', 
                height: '2px', 
                backgroundColor: '#DDDA84', 
                marginBottom: '8px',
                transform: isVisible ? 'scaleX(1)' : 'scaleX(0)',
                transition: 'transform 0.5s ease-out 0.5s',
                transformOrigin: 'center'
              }} 
            />
            <div 
              style={{ 
                width: 'clamp(50px, 7vw, 70px)', 
                height: '2px', 
                backgroundColor: '#DDDA84',
                transform: isVisible ? 'scaleX(1)' : 'scaleX(0)',
                transition: 'transform 0.5s ease-out 0.7s',
                transformOrigin: 'center'
              }} 
            />
          </div>
        </div>

        {/* СЕТКА 2x2 С БЛОКАМИ */}
        <div 
          className="steps-container"
          style={{ 
            width: '100%',
            flex: 1,
            position: 'relative',
            zIndex: 2,
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap: 'clamp(25px, 4vw, 50px)',
            padding: 'clamp(25px, 4%, 50px)',
            maxWidth: '1400px',
            margin: '0 auto'
          }}
        >
          {steps.map((step, index) => (
            <div
              key={index}
              className={`step-card ${pulsingContainer === index ? 'pulse-container' : ''}`}
              style={{ 
                backgroundColor: 'rgba(17, 19, 20, 0.8)',
                borderRadius: '24px',
                padding: 'clamp(25px, 4%, 35px)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                border: '1px solid rgba(221, 216, 132, 0.3)',
                textAlign: 'center',
                backdropFilter: 'blur(5px)',
                width: '100%',
                height: '100%',
                position: 'relative'
              }}
            >
              {/* ЖЕЛТЫЙ КРУГ С ЦИФРОЙ */}
              <div
                style={{
                  position: 'absolute',
                  top: '-12px',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  width: 'clamp(30px, 4vw, 36px)',
                  height: 'clamp(30px, 4vw, 36px)',
                  borderRadius: '50%',
                  backgroundColor: '#DDDA84',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 'clamp(14px, 2vw, 16px)',
                  fontWeight: 'bold',
                  color: '#111314',
                  zIndex: 10,
                  transition: 'all 0.3s ease',
                  cursor: 'pointer'
                }}
              >
                {index + 1}
              </div>
              
              {/* КОНТЕНТ БЛОКА */}
              <div
                style={{
                  opacity: isVisible ? 1 : 0,
                  transform: isVisible ? 'translateY(0)' : 'translateY(30px)',
                  transition: `all 0.5s ease-out ${0.2 + index * 0.15}s`,
                  width: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center'
                }}
              >
                <div 
                  style={{ 
                    width: 'clamp(70px, 10vw, 90px)',
                    height: 'clamp(70px, 10vw, 90px)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderRadius: '50%',
                    backgroundColor: 'rgba(221, 216, 132, 0.15)',
                    border: '2px solid #DDDA84',
                    marginBottom: 'clamp(15px, 3vw, 20px)',
                  }}
                  className="hover:scale-110"
                >
                  <Image
                    src={step.icon}
                    alt={step.title}
                    width={45}
                    height={45}
                    style={{ width: '55%', height: '55%', objectFit: 'contain' }}
                  />
                </div>
                
                <h3 style={{ 
                  fontFamily: 'var(--font-poiret-one), Poiret One, cursive',
                  color: '#DDDA84',
                  fontSize: 'clamp(16px, 2.5vw, 20px)',
                  fontWeight: 'bold',
                  marginBottom: 'clamp(10px, 2vw, 12px)'
                }}>
                  {step.title}
                </h3>
                
                <p style={{ 
                  fontFamily: 'var(--font-jura), Jura, sans-serif',
                  color: '#E8FFFB',
                  fontSize: 'clamp(13px, 2vw, 16px)',
                  lineHeight: 1.5,
                  opacity: 0.9
                }}>
                  {step.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}