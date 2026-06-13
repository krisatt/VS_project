'use client';

import { useState, useEffect, useRef } from 'react';

const projects = [
  { id: 1, title: 'Современная квартира', category: 'Жилой интерьер', image: '/images/project1.jpg' },
  { id: 2, title: 'Loft офис', category: 'Коммерческий', image: '/images/project2.jpg' },
  { id: 3, title: 'Загородный дом', category: 'Частный дом', image: '/images/project3.jpg' },
  { id: 4, title: 'Минимализм', category: 'Жилой интерьер', image: '/images/project4.jpg' },
  { id: 5, title: 'Студия дизайна', category: 'Коммерческий', image: '/images/project5.jpg' },
  { id: 6, title: 'Душ кабина', category: 'Частный дом', image: '/images/project6.jpg' },
];

// ✅ Интерфейс должен быть здесь, до функции компонента
interface ProjectsSectionProps {
  onOpenGallery?: () => void;
}

export default function ProjectsSection({ onOpenGallery }: ProjectsSectionProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [selectedImage, setSelectedImage] = useState<{ src: string; title: string; category: string } | null>(null);
  const sectionRef = useRef<HTMLElement>(null);
  const carouselRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
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

    return () => {
      observer.disconnect();
      window.removeEventListener('resize', checkMobile);
    };
  }, []);

  // Блокировка скролла при открытом модальном окне
  useEffect(() => {
    if (selectedImage) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [selectedImage]);

  // Создаем массив с тремя копиями для плавной бесконечной прокрутки
  const infiniteProjects = [...projects, ...projects, ...projects];

  const handleImageClick = (project: typeof projects[0]) => {
    setSelectedImage({
      src: project.image,
      title: project.title,
      category: project.category
    });
  };

  const closeModal = () => {
    setSelectedImage(null);
  };

  return (
    <>
      <section 
        id="projects" 
        ref={sectionRef}
        style={{ 
          width: '100%',
          height: '100vh',
          backgroundColor: 'transparent',
          position: 'relative',
          zIndex: 20,
          overflow: 'hidden'
        }}
      >
        <style>{`
          @keyframes scroll {
            0% { transform: translateX(0); }
            100% { transform: translateX(-33.333%); }
          }
          
          @keyframes slideInLeft {
            from { opacity: 0; transform: translateX(-100px); }
            to { opacity: 0.6; transform: translateX(0); }
          }
          
          @keyframes slideInRight {
            from { opacity: 0; transform: translateX(100px); }
            to { opacity: 0.6; transform: translateX(0); }
          }
          
          @keyframes fadeInUp {
            from { opacity: 0; transform: translateY(30px); }
            to { opacity: 1; transform: translateY(0); }
          }
          
          @keyframes expandWidth {
            from { transform: scaleX(0); }
            to { transform: scaleX(1); }
          }
          
          @keyframes rotateGear {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
          
          @keyframes floatAnimation {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-10px); }
          }
          
          .slide-in-left { animation: slideInLeft 0.8s ease-out 0.2s forwards; }
          .slide-in-right { animation: slideInRight 0.8s ease-out 0.4s forwards; }
          .fade-in-up { animation: fadeInUp 0.6s ease-out 0.3s forwards; }
          .expand-width { animation: expandWidth 0.5s ease-out 0.5s forwards; }
          .expand-width-delay { animation: expandWidth 0.5s ease-out 0.7s forwards; }
          .rotate-gear { animation: rotateGear 12s linear infinite; }
          .float-animation { animation: floatAnimation 4s ease-in-out infinite; }
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
            backgroundColor: 'transparent',
            display: 'flex',
            flexDirection: 'column'
          }}
          className="h-[calc(100vh-64px)] md:h-[calc(100vh-80px)] lg:h-[calc(100vh-96px)]"
        >
          {/* ДЕКОРАТИВНЫЕ ЛИНИИ */}
          {isVisible && !isMobile && (
            <>
              <div
                className="slide-in-left"
                style={{
                  position: 'absolute',
                  left: 0,
                  top: '25%',
                  width: 'clamp(80px, 10vw, 120px)',
                  height: '2px',
                  backgroundColor: '#DDDA84',
                  opacity: 0,
                  zIndex: 2
                }}
              />
              
              <div
                className="slide-in-right"
                style={{
                  position: 'absolute',
                  right: 0,
                  bottom: '25%',
                  width: 'clamp(100px, 12vw, 150px)',
                  height: '2px',
                  backgroundColor: '#DDDA84',
                  opacity: 0,
                  zIndex: 2
                }}
              />

              <div
                className="float-animation"
                style={{
                  position: 'absolute',
                  top: '15%',
                  right: '10%',
                  width: '6px',
                  height: '6px',
                  borderRadius: '50%',
                  backgroundColor: '#DDDA84',
                  opacity: 0.4,
                  zIndex: 2
                }}
              />
              
              <div
                className="float-animation"
                style={{
                  position: 'absolute',
                  bottom: '20%',
                  left: '8%',
                  width: '4px',
                  height: '4px',
                  borderRadius: '50%',
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
                  bottom: '15%',
                  right: '5%',
                  width: 'clamp(30px, 5vw, 50px)',
                  height: 'clamp(30px, 5vw, 50px)',
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
                    width: 'clamp(8px, 2vw, 15px)',
                    height: 'clamp(8px, 2vw, 15px)',
                    borderRadius: '50%',
                    backgroundColor: '#DDDA84',
                    transform: 'translate(-50%, -50%)',
                    opacity: 0.5
                  }}
                />
              </div>
            </>
          )}

          {/* ЗАГОЛОВОК */}
          <div 
            className={isVisible ? 'fade-in-up' : ''}
            style={{ 
              width: '100%',
              height: '20%',
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
              style={{ 
                fontFamily: 'var(--font-poiret-one), Poiret One, cursive',
                fontWeight: '300',
                color: '#E8FFFB',
                fontSize: 'clamp(32px, 6vw, 70px)',
                marginBottom: 'clamp(12px, 2vh, 20px)',
                textAlign: 'center'
              }}
            >
              Наши проекты
            </h2>
            
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <div 
                className={isVisible ? 'expand-width' : ''}
                style={{ 
                  width: 'clamp(80px, 15vw, 120px)', 
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
                  width: 'clamp(50px, 10vw, 70px)', 
                  height: '2px', 
                  backgroundColor: '#DDDA84',
                  transform: 'scaleX(0)',
                  transformOrigin: 'center'
                }} 
              />
            </div>
          </div>

          {/* КАРУСЕЛЬ */}
          <div 
            style={{ 
              width: '100%',
              height: '55%',
              position: 'relative',
              zIndex: 2,
              overflow: 'hidden',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              opacity: isVisible ? 1 : 0,
              transform: isVisible ? 'translateY(0)' : 'translateY(20px)',
              transition: 'all 0.6s ease-out 0.5s'
            }}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
          >
            <div
              ref={carouselRef}
              style={{
                display: 'flex',
                gap: 'clamp(12px, 3vw, 20px)',
                animation: isHovered ? 'scroll 40s linear infinite paused' : 'scroll 40s linear infinite',
                width: 'fit-content'
              }}
            >
              {infiniteProjects.map((project, index) => (
                <div
                  key={`${project.id}-${index}`}
                  style={{
                    flexShrink: 0,
                    width: isMobile ? 'clamp(250px, 60vw, 300px)' : '350px',
                    height: 'auto',
                    minHeight: isMobile ? 'clamp(350px, 50vh, 400px)' : '500px',
                    borderRadius: '16px',
                    overflow: 'hidden',
                    position: 'relative',
                    cursor: 'pointer',
                    transition: 'transform 0.3s ease, box-shadow 0.3s ease'
                  }}
                  className="hover:scale-105 hover:shadow-xl"
                  onClick={() => handleImageClick(project)}
                >
                  <img
                    src={project.image}
                    alt={project.title}
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover'
                    }}
                  />
                  <div
                    style={{
                      position: 'absolute',
                      bottom: 0,
                      left: 0,
                      right: 0,
                      padding: isMobile ? '12px' : '15px',
                      background: 'linear-gradient(to top, rgba(0,0,0,0.8), transparent)',
                      color: '#E8FFFB'
                    }}
                  >
                    <h4 style={{ 
                      fontSize: isMobile ? '14px' : '16px', 
                      fontWeight: 'bold', 
                      marginBottom: '5px' 
                    }}>
                      {project.title}
                    </h4>
                    <p style={{ 
                      fontSize: isMobile ? '11px' : '12px', 
                      opacity: 0.8 
                    }}>
                      {project.category}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* КНОПКА */}
          <div 
            style={{ 
              width: '100%',
              height: '25%',
              position: 'relative',
              zIndex: 2,
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              opacity: isVisible ? 1 : 0,
              transform: isVisible ? 'translateY(0)' : 'translateY(20px)',
              transition: 'all 0.6s ease-out 0.7s'
            }}
          >
            <button
              style={{
                fontFamily: 'var(--font-jura), Jura, sans-serif',
                fontSize: isMobile ? '14px' : '16px',
                padding: isMobile ? '10px 24px' : '12px 32px',
                backgroundColor: 'transparent',
                border: '2px solid #DDDA84',
                color: '#DDDA84',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                borderRadius: '30px',
                position: 'relative',
                overflow: 'hidden'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#DDDA84';
                e.currentTarget.style.color = '#111314';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
                e.currentTarget.style.color = '#DDDA84';
              }}
              onClick={() => {
                // Вызываем пропс onOpenGallery, если он передан
                if (onOpenGallery) {
                  onOpenGallery();
                }
              }}
            >
              Перейти в галерею
            </button>
          </div>
        </div>
      </section>

      {/* МОДАЛЬНОЕ ОКНО ДЛЯ ПРОСМОТРА ИЗОБРАЖЕНИЯ */}
      {selectedImage && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.9)',
            zIndex: 999999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            animation: 'fadeIn 0.3s ease-out'
          }}
          onClick={closeModal}
        >
          <div
            style={{
              position: 'relative',
              maxWidth: '90vw',
              maxHeight: '90vh',
              backgroundColor: '#111314',
              borderRadius: '16px',
              overflow: 'hidden',
              cursor: 'default'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={selectedImage.src}
              alt={selectedImage.title}
              style={{
                maxWidth: '100%',
                maxHeight: '80vh',
                objectFit: 'contain',
                display: 'block'
              }}
            />
            <div
              style={{
                position: 'absolute',
                bottom: 0,
                left: 0,
                right: 0,
                padding: '16px',
                background: 'linear-gradient(to top, rgba(0,0,0,0.8), transparent)',
                color: '#E8FFFB'
              }}
            >
              <h3 style={{ 
                fontSize: isMobile ? '16px' : '20px', 
                fontWeight: 'bold', 
                marginBottom: '5px',
                fontFamily: 'var(--font-poiret-one), Poiret One, cursive'
              }}>
                {selectedImage.title}
              </h3>
              <p style={{ 
                fontSize: isMobile ? '12px' : '14px', 
                opacity: 0.8,
                fontFamily: 'var(--font-jura), Jura, sans-serif'
              }}>
                {selectedImage.category}
              </p>
            </div>
            <button
              onClick={closeModal}
              style={{
                position: 'absolute',
                top: '16px',
                right: '16px',
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                backgroundColor: 'rgba(0, 0, 0, 0.5)',
                border: '1px solid rgba(221, 216, 132, 0.3)',
                color: '#DDDA84',
                fontSize: '24px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.3s ease',
                backdropFilter: 'blur(5px)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(221, 216, 132, 0.2)';
                e.currentTarget.style.transform = 'scale(1.1)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
                e.currentTarget.style.transform = 'scale(1)';
              }}
            >
              ✕
            </button>
          </div>
        </div>
      )}

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
      `}</style>
    </>
  );
}