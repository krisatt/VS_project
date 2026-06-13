'use client';

import { useEffect, useState } from 'react';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';
import { db } from '@/lib/firebase';
import { collection, getDocs } from 'firebase/firestore';

interface GalleryModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface Photo {
  id: string;
  url: string;
}

export default function GalleryModal({ isOpen, onClose }: GalleryModalProps) {
  const [isMobile, setIsMobile] = useState(false);
  const [selectedImage, setSelectedImage] = useState<Photo | null>(null);
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(0);
  const PHOTOS_PER_PAGE = 9;

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Загрузка фото из Firebase
  useEffect(() => {
    const fetchPhotos = async () => {
      if (!isOpen) return;
      
      setLoading(true);
      try {
        const querySnapshot = await getDocs(collection(db, 'photos'));
        const photosData: Photo[] = [];
        querySnapshot.forEach((doc) => {
          photosData.push({
            id: doc.id,
            url: doc.data().url,
          });
        });
        setPhotos(photosData);
        setCurrentPage(0);
      } catch (error) {
        console.error('Ошибка загрузки фото:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPhotos();
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  // Закрытие полноэкранного режима по Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (selectedImage && e.key === 'Escape') {
        setSelectedImage(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedImage]);

  if (!isOpen) return null;

  const openFullscreen = (photo: Photo) => {
    setSelectedImage(photo);
  };

  const nextImage = () => {
    if (selectedImage) {
      const currentIndex = photos.findIndex(photo => photo.id === selectedImage.id);
      const nextIndex = (currentIndex + 1) % photos.length;
      setSelectedImage(photos[nextIndex]);
    }
  };

  const prevImage = () => {
    if (selectedImage) {
      const currentIndex = photos.findIndex(photo => photo.id === selectedImage.id);
      const prevIndex = (currentIndex - 1 + photos.length) % photos.length;
      setSelectedImage(photos[prevIndex]);
    }
  };

  // Пагинация
  const totalPages = Math.ceil(photos.length / PHOTOS_PER_PAGE);
  const startIndex = currentPage * PHOTOS_PER_PAGE;
  const currentPhotos = photos.slice(startIndex, startIndex + PHOTOS_PER_PAGE);

  const nextPage = () => {
    if (currentPage < totalPages - 1) {
      setCurrentPage(currentPage + 1);
      // Прокрутка вверх при смене страницы
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const prevPage = () => {
    if (currentPage > 0) {
      setCurrentPage(currentPage - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <>
      {/* Основное модальное окно с сеткой */}
      <div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 999999,
          backgroundColor: 'rgba(0, 0, 0, 0.9)',
          backdropFilter: 'blur(8px)',
          overflowY: 'auto',
          overflowX: 'hidden',
        }}
        onClick={onClose}
      >
        {/* Контейнер с контентом */}
        <div
          style={{
            maxWidth: '1400px',
            margin: '0 auto',
            padding: 'clamp(60px, 8vh, 80px) clamp(16px, 4vw, 32px)',
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Кнопка закрытия */}
          <button
            onClick={onClose}
            style={{
              position: 'fixed',
              top: '20px',
              right: '20px',
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              backgroundColor: 'rgba(221, 216, 132, 0.1)',
              border: '1px solid rgba(221, 216, 132, 0.3)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.3s ease',
              zIndex: 10,
              backdropFilter: 'blur(5px)',
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

          {/* Заголовок */}
          <h2
            style={{
              fontFamily: 'var(--font-poiret-one), Poiret One, cursive',
              fontWeight: '300',
              color: '#E8FFFB',
              fontSize: 'clamp(32px, 6vw, 50px)',
              textAlign: 'center',
              marginBottom: 'clamp(30px, 5vh, 50px)',
            }}
          >
            Наша галерея
          </h2>

          {/* Состояние загрузки */}
          {loading && (
            <div
              style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                minHeight: '400px',
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

          {/* Сетка 3 колонки */}
          {!loading && (
            <>
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)',
                  gap: 'clamp(16px, 2vw, 24px)',
                }}
              >
                {currentPhotos.map((photo, index) => (
                  <div
                    key={photo.id}
                    style={{
                      position: 'relative',
                      backgroundColor: '#111314',
                      borderRadius: '16px',
                      overflow: 'hidden',
                      border: '1px solid rgba(221, 216, 132, 0.2)',
                      transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                      cursor: 'pointer',
                    }}
                    className="hover:scale-105 hover:shadow-xl"
                    onClick={() => openFullscreen(photo)}
                  >
                    <img
                      src={photo.url}
                      alt={`Фото ${startIndex + index + 1}`}
                      style={{
                        width: '100%',
                        height: '250px',
                        objectFit: 'cover',
                        display: 'block',
                      }}
                      loading="lazy"
                    />
                    <div
                      style={{
                        position: 'absolute',
                        bottom: 0,
                        left: 0,
                        right: 0,
                        padding: '12px',
                        background: 'linear-gradient(to top, rgba(0,0,0,0.8), transparent)',
                        color: '#E8FFFB',
                      }}
                    >
                      <p
                        style={{
                          fontFamily: 'var(--font-jura), Jura, sans-serif',
                          fontSize: '14px',
                          opacity: 0.9,
                        }}
                      >
                        Фото {startIndex + index + 1}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Пагинация */}
              {totalPages > 1 && (
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    gap: '20px',
                    marginTop: 'clamp(40px, 8vh, 60px)',
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
                    <ChevronLeft size={24} color="#DDDA84" />
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
                    <ChevronRight size={24} color="#DDDA84" />
                  </button>
                </div>
              )}
            </>
          )}

          {/* Если фото нет */}
          {!loading && photos.length === 0 && (
            <div
              style={{
                textAlign: 'center',
                color: '#E8FFFB',
                fontFamily: 'var(--font-jura), Jura, sans-serif',
                fontSize: '18px',
                padding: '50px',
              }}
            >
              Фотографии временно отсутствуют
            </div>
          )}
        </div>
      </div>

      {/* Полноэкранный просмотр изображения */}
{selectedImage && (
  <div
    style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      zIndex: 1000000,
      backgroundColor: 'rgba(0, 0, 0, 0.95)',
      backdropFilter: 'blur(10px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      animation: 'fadeIn 0.3s ease-out',
      padding: isMobile ? '60px 10px 20px 10px' : '20px',
    }}
    onClick={() => setSelectedImage(null)}
  >
    {/* Контейнер изображения */}
    <div
      style={{
        position: 'relative',
        width: '100%',
        maxWidth: '95vw',
        maxHeight: '95vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
      onClick={(e) => e.stopPropagation()}
    >
      <img
        src={selectedImage.url}
        alt="Фото"
        style={{
          maxWidth: '100%',
          maxHeight: isMobile ? '85vh' : '90vh',
          objectFit: 'contain',
          display: 'block',
        }}
      />

      {/* Кнопка "Назад" */}
      {photos.length > 1 && (
        <button
          onClick={prevImage}
          style={{
            position: 'absolute',
            left: isMobile ? '5px' : '-50px',
            top: '50%',
            transform: 'translateY(-50%)',
            width: isMobile ? '35px' : '45px',
            height: isMobile ? '35px' : '45px',
            borderRadius: '50%',
            backgroundColor: 'rgba(221, 216, 132, 0.1)',
            border: '1px solid rgba(221, 216, 132, 0.3)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all 0.3s ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = 'rgba(221, 216, 132, 0.2)';
            e.currentTarget.style.transform = 'translateY(-50%) scale(1.1)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'rgba(221, 216, 132, 0.1)';
            e.currentTarget.style.transform = 'translateY(-50%) scale(1)';
          }}
        >
          <ChevronLeft size={isMobile ? 20 : 28} color="#DDDA84" />
        </button>
      )}

      {/* Кнопка "Вперед" */}
      {photos.length > 1 && (
        <button
          onClick={nextImage}
          style={{
            position: 'absolute',
            right: isMobile ? '5px' : '-50px',
            top: '50%',
            transform: 'translateY(-50%)',
            width: isMobile ? '35px' : '45px',
            height: isMobile ? '35px' : '45px',
            borderRadius: '50%',
            backgroundColor: 'rgba(221, 216, 132, 0.1)',
            border: '1px solid rgba(221, 216, 132, 0.3)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all 0.3s ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = 'rgba(221, 216, 132, 0.2)';
            e.currentTarget.style.transform = 'translateY(-50%) scale(1.1)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'rgba(221, 216, 132, 0.1)';
            e.currentTarget.style.transform = 'translateY(-50%) scale(1)';
          }}
        >
          <ChevronRight size={isMobile ? 20 : 28} color="#DDDA84" />
        </button>
      )}

      {/* Кнопка закрытия */}
      <button
        onClick={() => setSelectedImage(null)}
        style={{
          position: 'absolute',
          top: isMobile ? '10px' : '20px',
          right: isMobile ? '10px' : '20px',
          width: isMobile ? '35px' : '40px',
          height: isMobile ? '35px' : '40px',
          borderRadius: '50%',
          backgroundColor: 'rgba(221, 216, 132, 0.1)',
          border: '1px solid rgba(221, 216, 132, 0.3)',
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
        <X size={isMobile ? 18 : 22} color="#DDDA84" />
      </button>

      {/* Номер фото */}
      {photos.length > 1 && (
        <div
          style={{
            position: 'absolute',
            bottom: isMobile ? '10px' : '20px',
            left: '50%',
            transform: 'translateX(-50%)',
            padding: '6px 12px',
            backgroundColor: 'rgba(0, 0, 0, 0.6)',
            borderRadius: '20px',
            backdropFilter: 'blur(5px)',
          }}
        >
          <span
            style={{
              fontFamily: 'var(--font-jura), Jura, sans-serif',
              color: '#DDDA84',
              fontSize: isMobile ? '12px' : '14px',
            }}
          >
            {photos.findIndex(p => p.id === selectedImage.id) + 1} / {photos.length}
          </span>
        </div>
      )}
    </div>
  </div>
)}

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </>
  );
}