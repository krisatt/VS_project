'use client';

import { useScrollAnimation } from '@/hooks/useScrollAnimation';
import { useState, useEffect } from 'react';
import RequestModal from '@/components/modals/RequestModal';

export default function DiscountSection() {
  const { ref, isVisible } = useScrollAnimation();
  const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);
  
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0
  });

  // Функция для получения следующей даты 10 числа
  const getNextTargetDate = (): Date => {
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth();
    const currentDay = now.getDate();
    
    let targetDate = new Date(currentYear, currentMonth, 10, 23, 59, 59);
    
    // Если сегодня уже после 10 числа или сегодня 10 число после 23:59:59
    if (currentDay > 10 || (currentDay === 10 && now.getHours() >= 23)) {
      // Переходим на 10 число следующего месяца
      targetDate = new Date(currentYear, currentMonth + 1, 10, 23, 59, 59);
    }
    
    return targetDate;
  };

  useEffect(() => {
    let targetDate = getNextTargetDate();
    let timer: NodeJS.Timeout;
    
    const updateTimer = () => {
      const now = new Date();
      const difference = targetDate.getTime() - now.getTime();
      
      // Если время вышло, пересчитываем следующую дату
      if (difference <= 0) {
        targetDate = getNextTargetDate();
        // Рекурсивно вызываем обновление с новой датой
        updateTimer();
        return;
      }
      
      setTimeLeft({
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        minutes: Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((difference % (1000 * 60)) / 1000)
      });
    };
    
    // Запускаем таймер
    updateTimer();
    timer = setInterval(updateTimer, 1000);
    
    return () => clearInterval(timer);
  }, []); // Пустой массив зависимостей - таймер работает постоянно

  const handleOpenRequest = () => {
    setIsRequestModalOpen(true);
  };

  // Форматируем дату для отображения
  const getFormattedTargetDate = () => {
    const targetDate = getNextTargetDate();
    return targetDate.toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  return (
    <>
      <section 
        id="discount" 
        ref={ref} 
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
          
          @keyframes floatLine {
            0%, 100% { transform: translateY(0); opacity: 0.3; }
            50% { transform: translateY(-10px); opacity: 0.6; }
          }
          
          @keyframes rotateStar {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
          
          .fade-in-up { animation: fadeInUp 0.6s ease-out 0.3s forwards; }
          .expand-width { animation: expandWidth 0.5s ease-out 0.5s forwards; }
          .expand-width-delay { animation: expandWidth 0.5s ease-out 0.7s forwards; }
          .float-line { animation: floatLine 4s ease-in-out infinite; }
          .rotate-star { animation: rotateStar 8s linear infinite; }
          
          .timer-number {
            transition: all 0.2s ease;
          }
          
          .timer-number:hover {
            transform: scale(1.05);
            border-color: #DDDA84;
            box-shadow: 0 0 15px rgba(221, 216, 132, 0.3);
          }
          
          /* АДАПТИВНОСТЬ */
          @media (max-width: 768px) {
            .section-title {
              font-size: 32px !important;
            }
            .timer-container {
              padding: 30px 20px !important;
            }
            .timer-number {
              width: 70px !important;
              height: 70px !important;
              font-size: 24px !important;
            }
            .timer-label {
              font-size: 12px !important;
              margin-top: 8px !important;
            }
            .timer-subtitle {
              font-size: 14px !important;
              margin-top: 20px !important;
            }
            .button {
              padding: 12px 30px !important;
              font-size: 16px !important;
            }
            .decorative-element {
              display: none !important;
            }
          }
          
          @media (max-width: 480px) {
            .section-title {
              font-size: 28px !important;
            }
            .timer-number {
              width: 55px !important;
              height: 55px !important;
              font-size: 18px !important;
            }
            .timer-gap {
              gap: 15px !important;
            }
            .button {
              padding: 10px 25px !important;
              font-size: 14px !important;
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
            backgroundImage: 'url(/images/discount-bg.png)',
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
              backgroundColor: 'rgba(17, 19, 20, 0.8)',
              zIndex: 1
            }}
          />

          {/* ДЕКОРАТИВНЫЕ ЭЛЕМЕНТЫ (СКРЫВАЮТСЯ НА ТЕЛЕФОНАХ) */}
          <div className="decorative-element">
            <div
              className="float-line"
              style={{
                position: 'absolute',
                left: '5%',
                top: '15%',
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
                left: '8%',
                bottom: '20%',
                width: '40px',
                height: '2px',
                backgroundColor: '#DDDA84',
                opacity: 0.3,
                zIndex: 2,
                animationDelay: '1s'
              }}
            />
            <div
              className="float-line"
              style={{
                position: 'absolute',
                right: '5%',
                top: '20%',
                width: '80px',
                height: '2px',
                backgroundColor: '#DDDA84',
                opacity: 0.3,
                zIndex: 2,
                animationDelay: '0.5s'
              }}
            />
            <div
              className="float-line"
              style={{
                position: 'absolute',
                right: '8%',
                bottom: '15%',
                width: '50px',
                height: '2px',
                backgroundColor: '#DDDA84',
                opacity: 0.3,
                zIndex: 2,
                animationDelay: '1.5s'
              }}
            />
            <div
              className="rotate-star"
              style={{
                position: 'absolute',
                left: '3%',
                top: '40%',
                fontSize: '20px',
                color: '#DDDA84',
                opacity: 0.2,
                zIndex: 2
              }}
            >
              ✦
            </div>
            <div
              className="rotate-star"
              style={{
                position: 'absolute',
                right: '4%',
                bottom: '35%',
                fontSize: '16px',
                color: '#DDDA84',
                opacity: 0.2,
                zIndex: 2,
                animationDelay: '2s'
              }}
            >
              ✦
            </div>
          </div>

          {/* ЗАГОЛОВОК */}
          <div 
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
                fontSize: 'clamp(36px, 6vw, 70px)',
                marginBottom: '20px',
                textAlign: 'center',
                textShadow: '0 0 30px rgba(221, 216, 132, 0.3)'
              }}
            >
              Специальное предложение
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

          {/* ТАЙМЕР */}
          <div 
            style={{ 
              width: '100%',
              flex: 1,
              position: 'relative',
              zIndex: 2,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              opacity: isVisible ? 1 : 0,
              transform: isVisible ? 'translateY(0)' : 'translateY(30px)',
              transition: 'all 0.6s ease-out 0.4s'
            }}
          >
            <div 
              className="timer-container"
              style={{ 
                backgroundColor: 'rgba(17, 19, 20, 0.6)',
                borderRadius: '30px',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(221, 216, 132, 0.2)',
                padding: 'clamp(30px, 5%, 50px)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                width: '90%',
                maxWidth: '900px',
                position: 'relative'
              }}
            >
              <h3
                style={{
                  fontFamily: 'var(--font-poiret-one), Poiret One, cursive',
                  fontWeight: '300',
                  color: '#DDDA84',
                  fontSize: 'clamp(20px, 3vw, 28px)',
                  marginBottom: 'clamp(15px, 2vh, 20px)',
                  textAlign: 'center'
                }}
              >
                До конца акции осталось:
              </h3>
              
              <p
                style={{
                  fontFamily: 'var(--font-jura), Jura, sans-serif',
                  color: '#E8FFFB',
                  fontSize: 'clamp(12px, 2vw, 14px)',
                  opacity: 0.6,
                  marginBottom: 'clamp(25px, 4vh, 35px)',
                  textAlign: 'center'
                }}
              >
                Акция действует до {getFormattedTargetDate()}
              </p>
              
              <div 
                className="timer-gap"
                style={{
                  display: 'flex',
                  gap: 'clamp(15px, 4vw, 40px)',
                  justifyContent: 'center',
                  flexWrap: 'wrap'
                }}
              >
                <div style={{ textAlign: 'center' }}>
                  <div
                    className="timer-number"
                    style={{
                      fontFamily: 'var(--font-poiret-one), Poiret One, cursive',
                      fontSize: 'clamp(24px, 4vw, 36px)',
                      fontWeight: 'bold',
                      color: '#E8FFFB',
                      backgroundColor: 'rgba(221, 216, 132, 0.1)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      borderRadius: '16px',
                      width: 'clamp(70px, 10vw, 100px)',
                      height: 'clamp(70px, 10vw, 100px)',
                      border: '1px solid rgba(221, 216, 132, 0.3)',
                    }}
                  >
                    {String(timeLeft.days).padStart(2, '0')}
                  </div>
                  <div 
                    className="timer-label"
                    style={{ 
                      color: '#E8FFFB', 
                      opacity: 0.7, 
                      marginTop: 'clamp(8px, 2vh, 12px)', 
                      fontSize: 'clamp(12px, 2vw, 16px)' 
                    }}
                  >
                    Дней
                  </div>
                </div>
                
                <div style={{ textAlign: 'center' }}>
                  <div
                    className="timer-number"
                    style={{
                      fontFamily: 'var(--font-poiret-one), Poiret One, cursive',
                      fontSize: 'clamp(24px, 4vw, 36px)',
                      fontWeight: 'bold',
                      color: '#E8FFFB',
                      backgroundColor: 'rgba(221, 216, 132, 0.1)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      borderRadius: '16px',
                      width: 'clamp(70px, 10vw, 100px)',
                      height: 'clamp(70px, 10vw, 100px)',
                      border: '1px solid rgba(221, 216, 132, 0.3)',
                    }}
                  >
                    {String(timeLeft.hours).padStart(2, '0')}
                  </div>
                  <div 
                    className="timer-label"
                    style={{ 
                      color: '#E8FFFB', 
                      opacity: 0.7, 
                      marginTop: 'clamp(8px, 2vh, 12px)', 
                      fontSize: 'clamp(12px, 2vw, 16px)' 
                    }}
                  >
                    Часов
                  </div>
                </div>
                
                <div style={{ textAlign: 'center' }}>
                  <div
                    className="timer-number"
                    style={{
                      fontFamily: 'var(--font-poiret-one), Poiret One, cursive',
                      fontSize: 'clamp(24px, 4vw, 36px)',
                      fontWeight: 'bold',
                      color: '#E8FFFB',
                      backgroundColor: 'rgba(221, 216, 132, 0.1)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      borderRadius: '16px',
                      width: 'clamp(70px, 10vw, 100px)',
                      height: 'clamp(70px, 10vw, 100px)',
                      border: '1px solid rgba(221, 216, 132, 0.3)',
                    }}
                  >
                    {String(timeLeft.minutes).padStart(2, '0')}
                  </div>
                  <div 
                    className="timer-label"
                    style={{ 
                      color: '#E8FFFB', 
                      opacity: 0.7, 
                      marginTop: 'clamp(8px, 2vh, 12px)', 
                      fontSize: 'clamp(12px, 2vw, 16px)' 
                    }}
                  >
                    Минут
                  </div>
                </div>
                
                <div style={{ textAlign: 'center' }}>
                  <div
                    className="timer-number"
                    style={{
                      fontFamily: 'var(--font-poiret-one), Poiret One, cursive',
                      fontSize: 'clamp(24px, 4vw, 36px)',
                      fontWeight: 'bold',
                      color: '#E8FFFB',
                      backgroundColor: 'rgba(221, 216, 132, 0.1)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      borderRadius: '16px',
                      width: 'clamp(70px, 10vw, 100px)',
                      height: 'clamp(70px, 10vw, 100px)',
                      border: '1px solid rgba(221, 216, 132, 0.3)',
                    }}
                  >
                    {String(timeLeft.seconds).padStart(2, '0')}
                  </div>
                  <div 
                    className="timer-label"
                    style={{ 
                      color: '#E8FFFB', 
                      opacity: 0.7, 
                      marginTop: 'clamp(8px, 2vh, 12px)', 
                      fontSize: 'clamp(12px, 2vw, 16px)' 
                    }}
                  >
                    Секунд
                  </div>
                </div>
              </div>
              
              <p 
                className="timer-subtitle"
                style={{
                  fontFamily: 'var(--font-jura), Jura, sans-serif',
                  color: '#E8FFFB',
                  opacity: 0.8,
                  marginTop: 'clamp(25px, 4vh, 35px)',
                  fontSize: 'clamp(14px, 2vw, 18px)',
                  textAlign: 'center'
                }}
              >
                Успейте забронировать со скидкой 30%!
              </p>
            </div>
          </div>

          {/* КНОПКА */}
          <div 
            style={{ 
              width: '100%',
              height: 'auto',
              paddingBottom: 'clamp(40px, 8vh, 60px)',
              position: 'relative',
              zIndex: 2,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              opacity: isVisible ? 1 : 0,
              transform: isVisible ? 'translateY(0)' : 'translateY(30px)',
              transition: 'all 0.6s ease-out 0.6s'
            }}
          >
            <button
              className="button"
              style={{
                fontFamily: 'var(--font-jura), Jura, sans-serif',
                padding: 'clamp(14px, 2vw, 20px) clamp(40px, 5vw, 80px)',
                backgroundColor: '#DDDA84',
                color: '#111314',
                border: 'none',
                borderRadius: '50px',
                fontSize: 'clamp(18px, 2vw, 22px)',
                fontWeight: 'bold',
                cursor: 'pointer',
                transition: 'all 0.3s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#111314';
                e.currentTarget.style.color = '#DDDA84';
                e.currentTarget.style.transform = 'translateY(-3px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#DDDA84';
                e.currentTarget.style.color = '#111314';
                e.currentTarget.style.transform = 'translateY(0)';
              }}
              onClick={handleOpenRequest}
            >
              Оставить заявку
            </button>
          </div>
        </div>
      </section>

      {/* Модальное окно заявки */}
      <RequestModal 
        isOpen={isRequestModalOpen} 
        onClose={() => setIsRequestModalOpen(false)} 
      />
    </>
  );
}