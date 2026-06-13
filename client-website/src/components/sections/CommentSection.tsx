'use client';

import { useState, useEffect, useRef } from 'react';
import { db } from '@/lib/firebase';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { useAuth } from '@/contexts';
import NotificationModal from '@/components/modals/NotificationModal';

interface CommentSectionProps {
  onOpenProfile?: () => void;
}

interface Review {
  id: string;
  clientName: string;
  clientId: string;
  timestamp: number;
  date: string;
  time: string;
  reviewText: string;
  hasResponse: boolean;
  responseText?: string;
  rating?: number;
  isDemo?: boolean;
  isAgree?: boolean;
}

// Демонстрационные отзывы (всегда показываются)
const demoReviews: Review[] = [
  {
    id: 'demo1',
    clientName: 'Анна Иванова',
    clientId: 'demo',
    timestamp: Date.now() - 30 * 24 * 60 * 60 * 1000,
    date: '15.03.2024',
    time: '14:30',
    reviewText: 'Отличная компания! Заказывали перегородку для квартиры. Всё сделали качественно, быстро и аккуратно. Рекомендую!',
    hasResponse: true,
    responseText: 'Анна, спасибо за отзыв! Рады, что вам понравилось.',
    rating: 5,
    isDemo: true,
  },
  {
    id: 'demo2',
    clientName: 'Дмитрий Петров',
    clientId: 'demo',
    timestamp: Date.now() - 45 * 24 * 60 * 60 * 1000,
    date: '20.02.2024',
    time: '11:15',
    reviewText: 'Заказывали душевую кабину. Всё сделали за 1 день, качество отличное. Цена порадовала.',
    hasResponse: true,
    responseText: 'Дмитрий, благодарим за отзыв! Обращайтесь ещё.',
    rating: 5,
    isDemo: true,
  },
  {
    id: 'demo3',
    clientName: 'Елена Смирнова',
    clientId: 'demo',
    timestamp: Date.now() - 60 * 24 * 60 * 60 * 1000,
    date: '10.02.2024',
    time: '09:45',
    reviewText: 'Очень довольна результатом! Перегородка выглядит стильно, свет не теряется. Менеджеры вежливые, монтажники профессиональные.',
    hasResponse: false,
    rating: 5,
    isDemo: true,
  },
  {
    id: 'demo4',
    clientName: 'Михаил Соколов',
    clientId: 'demo',
    timestamp: Date.now() - 90 * 24 * 60 * 60 * 1000,
    date: '15.01.2024',
    time: '16:20',
    reviewText: 'Хорошая компания. Сделали замер бесплатно, учли все пожелания. Перегородка получилась именно такой, как хотели.',
    hasResponse: true,
    responseText: 'Михаил, спасибо за доверие! Будем рады помочь снова.',
    rating: 4,
    isDemo: true,
  },
  {
    id: 'demo5',
    clientName: 'Ольга Кузнецова',
    clientId: 'demo',
    timestamp: Date.now() - 120 * 24 * 60 * 60 * 1000,
    date: '05.01.2024',
    time: '12:00',
    reviewText: 'Заказывали офисную перегородку. Всё сделали в срок, без пыли и грязи. Рекомендую!',
    hasResponse: false,
    rating: 5,
    isDemo: true,
  },
];

export default function CommentSection({ onOpenProfile }: CommentSectionProps) {
  const { isAuthenticated } = useAuth();
  const [isVisible, setIsVisible] = useState(false);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [allReviews, setAllReviews] = useState<Review[]>([]);
  const [showAuthNotification, setShowAuthNotification] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);
  const REVIEWS_PER_PAGE = 6;

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(entry.target);
        }
      },
      { threshold: 0.3 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  // Загрузка отзывов из Firebase (только одобренные)
  useEffect(() => {
    const fetchReviews = async () => {
      setLoading(true);
      try {
        // Получаем только одобренные отзывы (isAgree === true)
        const q = query(collection(db, 'reviews'), where('isAgree', '==', true));
        const querySnapshot = await getDocs(q);
        const fbReviews: Review[] = [];
        
        querySnapshot.forEach((doc) => {
          const data = doc.data();
          fbReviews.push({
            id: doc.id,
            clientName: data.clientName || 'Клиент',
            clientId: data.clientId,
            timestamp: data.timestamp || Date.now(),
            date: data.date,
            time: data.time,
            reviewText: data.reviewText,
            hasResponse: data.hasResponse || false,
            responseText: data.responseText || '',
            rating: data.rating || 5,
            isDemo: false,
            isAgree: data.isAgree || false,
          });
        });

        // Сортируем реальные отзывы по дате (новые сверху)
        fbReviews.sort((a, b) => b.timestamp - a.timestamp);
        
        // Объединяем: сначала реальные одобренные отзывы, затем демо
        const allReviewsCombined = [...fbReviews, ...demoReviews];
        
        setAllReviews(allReviewsCombined);
        setTotalPages(Math.ceil(allReviewsCombined.length / REVIEWS_PER_PAGE));
        
        // Загружаем первую страницу
        const firstPageReviews = allReviewsCombined.slice(0, REVIEWS_PER_PAGE);
        setReviews(firstPageReviews);
        
      } catch (error) {
        console.error('Ошибка загрузки отзывов:', error);
        // При ошибке показываем только демо-отзывы
        setAllReviews(demoReviews);
        setTotalPages(Math.ceil(demoReviews.length / REVIEWS_PER_PAGE));
        setReviews(demoReviews.slice(0, REVIEWS_PER_PAGE));
      } finally {
        setLoading(false);
      }
    };

    fetchReviews();
  }, []);

  const handleOpenProfile = () => {
    if (isAuthenticated && onOpenProfile) {
      onOpenProfile();
    } else if (!isAuthenticated) {
      setShowAuthNotification(true);
    }
  };

  const nextPage = () => {
    if (currentPage < totalPages - 1) {
      const newPage = currentPage + 1;
      setCurrentPage(newPage);
      const start = newPage * REVIEWS_PER_PAGE;
      const end = start + REVIEWS_PER_PAGE;
      setReviews(allReviews.slice(start, end));
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const prevPage = () => {
    if (currentPage > 0) {
      const newPage = currentPage - 1;
      setCurrentPage(newPage);
      const start = newPage * REVIEWS_PER_PAGE;
      const end = start + REVIEWS_PER_PAGE;
      setReviews(allReviews.slice(start, end));
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <>
      <section 
        id="comments" 
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
          
          @keyframes floatLine {
            0%, 100% { transform: translateY(0); opacity: 0.3; }
            50% { transform: translateY(-10px); opacity: 0.6; }
          }
          
          .float-line {
            animation: floatLine 4s ease-in-out infinite;
          }
          
          @media (max-width: 768px) {
            .comments-grid {
              grid-template-columns: 1fr !important;
              gap: 30px !important;
            }
            .section-title {
              font-size: 32px !important;
            }
          }
        `}</style>

        {/* ВЕРХНЯЯ ЧАСТЬ */}
        <div 
          style={{ 
            width: '100%', 
            height: 'clamp(60px, 10vh, 80px)',
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
            backgroundImage: 'url(/images/comments-bg.png)',
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
              backgroundColor: 'rgba(17, 19, 20, 0.85)',
              zIndex: 1
            }}
          />

          {/* ДЕКОРАТИВНЫЕ ЛИНИИ */}
          <div
            className="float-line"
            style={{
              position: 'absolute',
              left: '5%',
              top: '20%',
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
              bottom: '20%',
              width: '100px',
              height: '2px',
              backgroundColor: '#DDDA84',
              opacity: 0.3,
              zIndex: 2,
              animationDelay: '1s'
            }}
          />

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
                textAlign: 'center'
              }}
            >
              Отзывы клиентов
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

          {/* Состояние загрузки */}
          {loading && (
            <div
              style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                minHeight: '400px',
                position: 'relative',
                zIndex: 2,
              }}
            >
              <div
                style={{
                  width: '50px',
                  height: '50px',
                  border: '3px solid rgba(221, 216, 132, 0.3)',
                  borderTopColor: '#DDDA84',
                  borderRadius: '50%',
                  animation: 'spin 1s linear infinite',
                }}
              />
            </div>
          )}

          {/* БЛОКИ С ОТЗЫВАМИ */}
          {!loading && (
            <>
              <div 
                className="comments-grid"
                style={{ 
                  width: '100%',
                  flex: 1,
                  position: 'relative',
                  zIndex: 2,
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
                  gap: 'clamp(25px, 3vw, 40px)',
                  padding: 'clamp(25px, 4%, 50px)',
                  maxWidth: '1400px',
                  margin: '0 auto'
                }}
              >
                {reviews.map((review, index) => (
                  <div
                    key={review.id}
                    style={{ 
                      backgroundColor: 'rgba(17, 19, 20, 0.8)',
                      borderRadius: '20px',
                      padding: 'clamp(25px, 4%, 35px)',
                      border: '1px solid rgba(221, 216, 132, 0.2)',
                      backdropFilter: 'blur(5px)',
                      opacity: isVisible ? 1 : 0,
                      transform: isVisible ? 'translateY(0)' : 'translateY(30px)',
                      transition: `all 0.6s ease-out ${0.2 + index * 0.1}s`,
                      position: 'relative'
                    }}
                  >
                    {/* Кавычка */}
                    <div
                      style={{
                        position: 'absolute',
                        top: '15px',
                        left: '20px',
                        fontSize: '40px',
                        color: '#DDDA84',
                        opacity: 0.2,
                        fontFamily: 'Georgia, serif'
                      }}
                    >
                      &ldquo;
                    </div>

                    {/* Текст отзыва */}
                    <p style={{ 
                      fontFamily: 'var(--font-jura), Jura, sans-serif',
                      color: '#E8FFFB',
                      fontSize: 'clamp(14px, 1.8vw, 16px)',
                      lineHeight: 1.6,
                      marginBottom: '15px',
                      opacity: 0.9,
                      marginTop: '20px'
                    }}>
                      {review.reviewText}
                    </p>

                    {/* Ответ от компании */}
                    {review.hasResponse && review.responseText && (
                      <div
                        style={{
                          backgroundColor: 'rgba(221, 216, 132, 0.05)',
                          borderRadius: '12px',
                          padding: '12px 15px',
                          marginTop: '15px',
                          marginBottom: '15px',
                          borderLeft: '2px solid #DDDA84',
                        }}
                      >
                        <p style={{
                          fontFamily: 'var(--font-jura), Jura, sans-serif',
                          color: '#DDDA84',
                          fontSize: '12px',
                          marginBottom: '6px',
                          opacity: 0.8,
                        }}>
                          Ответ компании:
                        </p>
                        <p style={{
                          fontFamily: 'var(--font-jura), Jura, sans-serif',
                          color: '#E8FFFB',
                          fontSize: 'clamp(13px, 1.6vw, 14px)',
                          lineHeight: 1.5,
                          opacity: 0.9,
                        }}>
                          {review.responseText}
                        </p>
                      </div>
                    )}

                    {/* Информация о клиенте */}
                    <div style={{ 
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      flexWrap: 'wrap',
                      gap: '10px',
                      borderTop: '1px solid rgba(221, 216, 132, 0.2)',
                      paddingTop: '15px',
                      marginTop: review.hasResponse ? '0' : '15px'
                    }}>
                      <div>
                        <div style={{ 
                          fontFamily: 'var(--font-poiret-one), Poiret One, cursive',
                          color: '#DDDA84',
                          fontSize: 'clamp(14px, 1.5vw, 16px)',
                          fontWeight: 'bold'
                        }}>
                          {review.clientName}
                        </div>
                        <div style={{ 
                          fontFamily: 'var(--font-jura), Jura, sans-serif',
                          color: '#E8FFFB',
                          fontSize: 'clamp(11px, 1.5vw, 12px)',
                          opacity: 0.6,
                          marginTop: '2px'
                        }}>
                          {review.date} в {review.time}
                        </div>
                      </div>

                      {/* Звезды рейтинга */}
                      {review.rating && (
                        <div style={{
                          display: 'flex',
                          gap: '3px'
                        }}>
                          {[...Array(5)].map((_, i) => (
                            <span
                              key={i}
                              style={{
                                color: i < (review.rating || 0) ? '#DDDA84' : 'rgba(221, 216, 132, 0.3)',
                                fontSize: 'clamp(12px, 1.5vw, 14px)'
                              }}
                            >
                              ★
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* ПАГИНАЦИЯ */}
              {totalPages > 1 && (
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    gap: '20px',
                    margin: 'clamp(30px, 5vh, 50px) auto',
                    padding: '0 20px',
                    position: 'relative',
                    zIndex: 2,
                  }}
                >
                  <button
                    onClick={prevPage}
                    disabled={currentPage === 0}
                    style={{
                      width: '40px',
                      height: '40px',
                      borderRadius: '50%',
                      backgroundColor: currentPage === 0 
                        ? 'rgba(221, 216, 132, 0.05)' 
                        : 'rgba(221, 216, 132, 0.1)',
                      border: '1px solid rgba(221, 216, 132, 0.3)',
                      cursor: currentPage === 0 ? 'not-allowed' : 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      transition: 'all 0.3s ease',
                      opacity: currentPage === 0 ? 0.5 : 1,
                    }}
                    onMouseEnter={(e) => {
                      if (currentPage !== 0) {
                        e.currentTarget.style.backgroundColor = 'rgba(221, 216, 132, 0.2)';
                        e.currentTarget.style.transform = 'scale(1.1)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (currentPage !== 0) {
                        e.currentTarget.style.backgroundColor = 'rgba(221, 216, 132, 0.1)';
                        e.currentTarget.style.transform = 'scale(1)';
                      }
                    }}
                  >
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#DDDA84" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="15 18 9 12 15 6" />
                    </svg>
                  </button>

                  <span
                    style={{
                      fontFamily: 'var(--font-jura), Jura, sans-serif',
                      color: '#E8FFFB',
                      fontSize: '16px',
                    }}
                  >
                    Страница {currentPage + 1} из {totalPages}
                  </span>

                  <button
                    onClick={nextPage}
                    disabled={currentPage === totalPages - 1}
                    style={{
                      width: '40px',
                      height: '40px',
                      borderRadius: '50%',
                      backgroundColor: currentPage === totalPages - 1 
                        ? 'rgba(221, 216, 132, 0.05)' 
                        : 'rgba(221, 216, 132, 0.1)',
                      border: '1px solid rgba(221, 216, 132, 0.3)',
                      cursor: currentPage === totalPages - 1 ? 'not-allowed' : 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      transition: 'all 0.3s ease',
                      opacity: currentPage === totalPages - 1 ? 0.5 : 1,
                    }}
                    onMouseEnter={(e) => {
                      if (currentPage !== totalPages - 1) {
                        e.currentTarget.style.backgroundColor = 'rgba(221, 216, 132, 0.2)';
                        e.currentTarget.style.transform = 'scale(1.1)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (currentPage !== totalPages - 1) {
                        e.currentTarget.style.backgroundColor = 'rgba(221, 216, 132, 0.1)';
                        e.currentTarget.style.transform = 'scale(1)';
                      }
                    }}
                  >
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#DDDA84" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="9 18 15 12 9 6" />
                    </svg>
                  </button>
                </div>
              )}
            </>
          )}

          {/* Если нет ни одного отзыва (включая демо) */}
          {!loading && reviews.length === 0 && (
            <div
              style={{
                textAlign: 'center',
                color: '#E8FFFB',
                fontFamily: 'var(--font-jura), Jura, sans-serif',
                fontSize: '18px',
                padding: '50px',
                position: 'relative',
                zIndex: 2,
              }}
            >
              Отзывы временно отсутствуют
            </div>
          )}

          {/* Пояснение о том, как оставить отзыв */}
          <div
            style={{
              textAlign: 'center',
              padding: 'clamp(20px, 3vh, 30px) clamp(20px, 5vw, 50px)',
              position: 'relative',
              zIndex: 2,
              borderTop: '1px solid rgba(221, 216, 132, 0.15)',
              marginTop: '20px',
            }}
          >
            <p
              style={{
                fontFamily: 'var(--font-jura), Jura, sans-serif',
                color: '#E8FFFB',
                fontSize: 'clamp(12px, 2vw, 14px)',
                opacity: 0.6,
                margin: 0,
              }}
            >
              💬 Оставить отзыв можно в{' '}
              <span
                style={{
                  color: '#DDDA84',
                  cursor: 'pointer',
                  textDecoration: 'underline',
                }}
                onClick={handleOpenProfile}
                onMouseEnter={(e) => {
                  e.currentTarget.style.opacity = '0.8';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.opacity = '1';
                }}
              >
                личном кабинете
              </span>
              . После проверки администратором он появится здесь.
            </p>
          </div>
        </div>

        <style>{`
          @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
        `}</style>
      </section>

      {/* Уведомление об авторизации */}
      <NotificationModal
        isOpen={showAuthNotification}
        onClose={() => setShowAuthNotification(false)}
        message="Для оставления отзыва необходимо авторизоваться"
        type="error"
      />
    </>
  );
}