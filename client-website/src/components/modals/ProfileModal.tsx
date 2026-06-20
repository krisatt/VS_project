'use client';

import { useState, useEffect, useCallback } from 'react';
import { X, User, Mail, Phone, ShoppingBag, Star, AlertCircle, Calendar, Clock, Edit2, Check, XCircle, Trash2, Package, Home, Droplet, Palette, MessageCircle, Calendar as CalendarIcon, MapPin } from 'lucide-react';
import { useAuth } from '@/contexts';
import { db } from '@/lib/firebase';
import { doc, getDoc, updateDoc, collection, query, where, getDocs, addDoc } from 'firebase/firestore';


interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface Order {
  id: string;
  date: string;
  solution: string;
  status: string;
  price: string;
  room: string;
  glassType: string;
  fittingsColor: string;
  comment: string;
  feedback: string;
  address: string;
  createdAt: string;
}

export default function ProfileModal({ isOpen, onClose }: ProfileModalProps) {
  const { user, logout, checkBanStatus } = useAuth();
  const [activeTab, setActiveTab] = useState<'info' | 'orders' | 'reviews'>('info');
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [clientData, setClientData] = useState({ name: '', phone: '', updatedAt: '' });
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [updateError, setUpdateError] = useState('');
  const [isBanned, setIsBanned] = useState(false);
  const [banInfo, setBanInfo] = useState<{ reason: string; date: string } | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [loadingReviewStatus, setLoadingReviewStatus] = useState(false);

  const [userReview, setUserReview] = useState<{ 
  id: string; 
  text: string; 
  rating: number; 
  date?: string;
  createdAt: string;
  updatedAt: string;
  responseText?: string; 
  canEdit: boolean;
  isAgree?: boolean;  // 👈 Добавлено поле
} | null>(null);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewText, setReviewText] = useState('');
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewError, setReviewError] = useState('');
  const [editingReview, setEditingReview] = useState(false);
  const [loadingReview, setLoadingReview] = useState(false);
  const [hasCompletedOrder, setHasCompletedOrder] = useState(false);

  // Функция для проверки возможности редактирования отзыва (по updatedAt)
  const canEditReview = (updatedAt: string) => {
    if (!updatedAt) return true;
    const lastUpdate = new Date(updatedAt);
    const now = new Date();
    lastUpdate.setHours(0, 0, 0, 0);
    now.setHours(0, 0, 0, 0);
    const diffDays = Math.floor((now.getTime() - lastUpdate.getTime()) / (1000 * 60 * 60 * 24));
    return diffDays >= 10;
  };

// Функция для санитизации текста
const sanitizeText = (text: string): string => {
  if (!text) return '';
  return text
    .replace(/[<>]/g, '')           // Удаляем < и >
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;')
    .trim();
};

  // Функция для проверки наличия выполненных заказов и загрузки отзыва пользователя
  const checkUserReviewStatus = async () => {
  if (!user) return;
  
  setLoadingReviewStatus(true); // 👈 Начинаем загрузку
  
  try {
    // Проверяем наличие выполненных заказов
    const ordersRef = collection(db, 'orders');
    const q = query(ordersRef, where('clientId', '==', user.uid), where('status', '==', 'Выполнен'));
    const ordersSnapshot = await getDocs(q);
    setHasCompletedOrder(!ordersSnapshot.empty);
    
    // Проверяем, оставлял ли пользователь отзыв
    const reviewsRef = collection(db, 'reviews');
    const reviewQuery = query(reviewsRef, where('clientId', '==', user.uid));
    const reviewSnapshot = await getDocs(reviewQuery);
    
    if (!reviewSnapshot.empty) {
      const reviewDoc = reviewSnapshot.docs[0];
      const data = reviewDoc.data();
      const updatedAt = data.updatedAt || data.createdAt;
      
      setUserReview({
        id: reviewDoc.id,
        text: data.reviewText || '',
        rating: data.rating || 5,
        date: data.date || '',
        createdAt: data.createdAt,
        updatedAt: updatedAt,
        responseText: data.responseText || '',
        canEdit: canEditReview(updatedAt),
        isAgree: data.isAgree || false,
      });
    } else {
      setUserReview(null);
    }
  } catch (error) {
    console.error('Ошибка проверки отзывов:', error);
  } finally {
    setLoadingReviewStatus(false); // 👈 Завершаем загрузку
  }
};

  // Загрузка заказов пользователя
  const fetchOrders = async () => {
    if (!user) return;
    setLoadingOrders(true);
    try {
      const ordersRef = collection(db, 'orders');
      const q = query(ordersRef, where('clientId', '==', user.uid));
      const querySnapshot = await getDocs(q);
      const ordersData: Order[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        ordersData.push({
          id: doc.id,
          date: data.date || '',
          solution: data.solution || '',
          status: data.status || 'Новый',
          price: data.serviceCost || '0 ₽',
          room: data.room || '',
          glassType: data.glassType || '',
          fittingsColor: data.fittingsColor || '',
          comment: data.comment || '',
          feedback: data.feedback || '',
          address: data.address || '',
          createdAt: data.createdAt || '',
        });
      });
      ordersData.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      setOrders(ordersData);
    } catch (error) {
      console.error('Ошибка загрузки заказов:', error);
    } finally {
      setLoadingOrders(false);
    }
  };

  // Функция проверки блокировки
  const checkBan = useCallback(async () => {
    if (!user?.email) return;
    const { isBanned: banned, banInfo: info } = await checkBanStatus(user.email);
    setIsBanned(banned);
    setBanInfo(info);
    return banned;
  }, [user, checkBanStatus]);

  // Проверка блокировки при открытии модального окна и каждые 30 секунд
  useEffect(() => {
    if (isOpen && user) {
      checkBan();
      
      const interval = setInterval(() => {
        checkBan();
      }, 30000);
      
      return () => clearInterval(interval);
    }
  }, [isOpen, user, checkBan]);

  // Загрузка данных клиента
  useEffect(() => {
    const fetchClientData = async () => {
      if (!user) return;
      
      const isBannedNow = await checkBan();
      if (isBannedNow) return;
      
      try {
        const clientDoc = await getDoc(doc(db, 'clients', user.uid));
        if (clientDoc.exists()) {
          const data = clientDoc.data();
          setClientData({
            name: data.fullName || user.displayName || '',
            phone: data.phone || '',
            updatedAt: data.updatedAt || '',
          });
          setEditName(data.fullName || user.displayName || '');
          setEditPhone(data.phone || '');
        } else {
          setClientData({
            name: user.displayName || '',
            phone: '',
            updatedAt: '',
          });
          setEditName(user.displayName || '');
          setEditPhone('');
        }
      } catch (error) {
        console.error('Ошибка загрузки данных:', error);
      }
    };
    fetchClientData();
  }, [user, checkBan]);

  // Загрузка заказов при открытии вкладки заказов
  useEffect(() => {
    if (activeTab === 'orders' && user) {
      fetchOrders();
    }
  }, [activeTab, user]);

  // Загрузка отзывов при открытии вкладки отзывов
  useEffect(() => {
    if (activeTab === 'reviews' && user) {
      checkUserReviewStatus();
    }
  }, [activeTab, user]);

  if (!isOpen) return null;

  // Функция для получения цвета статуса
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Новый': return '#3498db';
      case 'В работе': return '#e67e22';
      case 'Выполнен': return '#2ecc71';
      case 'Отменен': return '#e74c3c';
      default: return '#95a5a6';
    }
  };

  const getStatusBgColor = (status: string) => {
    switch (status) {
      case 'Новый': return 'rgba(52, 152, 219, 0.15)';
      case 'В работе': return 'rgba(230, 126, 34, 0.15)';
      case 'Выполнен': return 'rgba(46, 204, 113, 0.15)';
      case 'Отменен': return 'rgba(231, 76, 60, 0.15)';
      default: return 'rgba(149, 165, 166, 0.15)';
    }
  };

  // Если пользователь заблокирован, показываем сообщение
  if (isBanned) {
    return (
      <div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 999999,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          animation: 'fadeIn 0.3s ease-out',
        }}
      >
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.85)',
            backdropFilter: 'blur(8px)',
          }}
          onClick={onClose}
        />
        
        <div
          style={{
            position: 'relative',
            width: '90%',
            maxWidth: '400px',
            backgroundColor: '#111314',
            borderRadius: '24px',
            border: '1px solid rgba(255, 100, 100, 0.3)',
            padding: '32px 24px',
            textAlign: 'center',
            animation: 'scaleIn 0.3s ease-out',
          }}
        >
          <div
            style={{
              width: '64px',
              height: '64px',
              borderRadius: '50%',
              backgroundColor: 'rgba(255, 100, 100, 0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 20px',
            }}
          >
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#ff6b6b" strokeWidth="1.5">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <circle cx="12" cy="16" r="0.5" fill="#ff6b6b" />
            </svg>
          </div>
          <h3
            style={{
              fontFamily: 'var(--font-poiret-one), Poiret One, cursive',
              color: '#ff6b6b',
              fontSize: '24px',
              marginBottom: '12px',
            }}
          >
            Аккаунт заблокирован
          </h3>
          <p
            style={{
              fontFamily: 'var(--font-jura), Jura, sans-serif',
              color: '#E8FFFB',
              fontSize: '14px',
              marginBottom: '16px',
            }}
          >
            Ваш аккаунт был заблокирован администратором.
          </p>
          {banInfo?.reason && (
            <div
              style={{
                backgroundColor: 'rgba(255, 100, 100, 0.1)',
                borderRadius: '8px',
                padding: '12px',
                marginBottom: '20px',
                textAlign: 'left',
              }}
            >
              <p
                style={{
                  fontFamily: 'var(--font-jura), Jura, sans-serif',
                  color: '#ff6b6b',
                  fontSize: '12px',
                  marginBottom: '4px',
                  fontWeight: 'bold',
                }}
              >
                Причина:
              </p>
              <p
                style={{
                  fontFamily: 'var(--font-jura), Jura, sans-serif',
                  color: '#E8FFFB',
                  fontSize: '13px',
                  margin: 0,
                }}
              >
                {banInfo.reason}
              </p>
            </div>
          )}
          <p
            style={{
              fontFamily: 'var(--font-jura), Jura, sans-serif',
              color: '#E8FFFB',
              fontSize: '13px',
              opacity: 0.7,
              marginBottom: '24px',
            }}
          >
            Для уточнения деталей обратитесь в поддержку.
          </p>
          <button
            onClick={() => {
              onClose();
              setIsBanned(false);
              setBanInfo(null);
            }}
            style={{
              width: '100%',
              padding: '12px',
              backgroundColor: '#DDDA84',
              border: 'none',
              borderRadius: '10px',
              color: '#111314',
              fontFamily: 'var(--font-jura), Jura, sans-serif',
              fontSize: '14px',
              fontWeight: 'bold',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#E8FFFB'; }}
            onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#DDDA84'; }}
          >
            Закрыть
          </button>
        </div>
      </div>
    );
  }

  // Проверка возможности обновления (раз в день, только по дате)
  const canUpdate = () => {
    if (!clientData.updatedAt) return true;
    const lastUpdate = new Date(clientData.updatedAt);
    const now = new Date();
    lastUpdate.setHours(0, 0, 0, 0);
    now.setHours(0, 0, 0, 0);
    const diffDays = Math.floor((now.getTime() - lastUpdate.getTime()) / (1000 * 60 * 60 * 24));
    return diffDays >= 1;
  };

  // Функция маски телефона
  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value;
    const digits = value.replace(/\D/g, '');
    const limitedDigits = digits.slice(0, 11);
    
    let formatted = '';
    if (limitedDigits.length === 0) {
      formatted = '';
    } else {
      formatted = '+7';
      if (limitedDigits.length > 1) {
        formatted += ` (${limitedDigits.substring(1, 4)}`;
      }
      if (limitedDigits.length >= 4) {
        formatted += `) ${limitedDigits.substring(4, 7)}`;
      }
      if (limitedDigits.length >= 7) {
        formatted += `-${limitedDigits.substring(7, 9)}`;
      }
      if (limitedDigits.length >= 9) {
        formatted += `-${limitedDigits.substring(9, 11)}`;
      }
    }
    setEditPhone(formatted);
  };

  // Очистка телефона
  const clearPhone = () => {
    setEditPhone('');
  };

  // Сохранение изменений
  const handleSave = async () => {
  if (!user) return;
  
  const isBannedNow = await checkBan();
  if (isBannedNow) return;
  
  if (!canUpdate()) {
    setUpdateError('Изменение данных доступно не чаще 1 раза в день');
    setTimeout(() => setUpdateError(''), 3000);
    return;
  }
  
  setLoading(true);
  setUpdateError('');
  try {
    const clientRef = doc(db, 'clients', user.uid);
    
    // 👇 ЗАМЕНИТЕ editName НА sanitizeText(editName)
    const sanitizedName = sanitizeText(editName);
    
    await updateDoc(clientRef, {
      fullName: sanitizedName,  // ← здесь используем sanitizedName
      phone: editPhone,
      updatedAt: new Date().toISOString(),
    });
    setClientData({ 
      name: sanitizedName,  // ← и здесь
      phone: editPhone, 
      updatedAt: new Date().toISOString() 
    });
    setIsEditing(false);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  } catch (error) {
    console.error('Ошибка сохранения:', error);
    setUpdateError('Ошибка при сохранении');
    setTimeout(() => setUpdateError(''), 3000);
  } finally {
    setLoading(false);
  }
};

  // Отмена редактирования
  const handleCancel = () => {
    setEditName(clientData.name);
    setEditPhone(clientData.phone);
    setIsEditing(false);
    setUpdateError('');
  };

  // Выход из аккаунта
  const handleLogout = async () => {
    await logout();
    onClose();
  };

  // Функция для отправки/обновления отзыва
const handleSubmitReview = async () => {
  if (!user) return;
  setReviewError('');
  
  // Санитизация текста
  const sanitizedText = sanitizeText(reviewText);
  
  if (!sanitizedText.trim()) {
    setReviewError('Пожалуйста, введите текст отзыва');
    return;
  }
  
  if (sanitizedText.length < 10) {
    setReviewError('Текст отзыва должен содержать не менее 10 символов');
    return;
  }
  
  // Проверка на блокировку
  const isBannedNow = await checkBan();
  if (isBannedNow) return;
  
  setLoadingReview(true);
  
  try {
    const now = new Date();
    const nowISO = now.toISOString();
    
    // Форматируем дату и время для отображения
    const formattedDate = `${String(now.getDate()).padStart(2, '0')}.${String(now.getMonth() + 1).padStart(2, '0')}.${now.getFullYear()}`;
    const formattedTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    const timestamp = now.getTime();
    
    if (userReview && editingReview) {
      // Обновление существующего отзыва
      if (!canEditReview(userReview.updatedAt)) {
        setReviewError('Изменение отзыва доступно не чаще 1 раза в 10 дней');
        setLoadingReview(false);
        return;
      }
      const reviewRef = doc(db, 'reviews', userReview.id);
      await updateDoc(reviewRef, {
        reviewText: sanitizedText,
        rating: reviewRating,
        updatedAt: nowISO,
        // isAgree при редактировании сбрасывается на false, так как нужна повторная проверка
        isAgree: false,
      });
    } else {
      // Новый отзыв
      const reviewsRef = collection(db, 'reviews');
      const reviewData = {
        clientId: user.uid,
        clientName: clientData.name || user.displayName || 'Клиент',
        reviewText: sanitizedText,
        rating: reviewRating,
        date: formattedDate,
        time: formattedTime,
        timestamp: timestamp,
        createdAt: new Date(),
        updatedAt: new Date(),
        hasResponse: false,
        isAgree: false,  // 👈 Добавлено поле для модерации
      };
      await addDoc(reviewsRef, reviewData);
    }
    
    // Обновляем состояние
    await checkUserReviewStatus();
    setShowReviewForm(false);
    setEditingReview(false);
    setReviewText('');
    setReviewRating(5);
    
    // Показываем сообщение о том, что отзыв отправлен на модерацию
    setReviewError(''); // Очищаем ошибку
    // Можно добавить отдельное сообщение об успехе
    
  } catch (error) {
    console.error('Ошибка при сохранении отзыва:', error);
    setReviewError('Не удалось сохранить отзыв. Попробуйте позже.');
  } finally {
    setLoadingReview(false);
  }
};

  // Функция для начала редактирования
const handleEditReview = () => {
  if (userReview) {
    setReviewText(userReview.text);
    setReviewRating(userReview.rating);
    setEditingReview(true);
    setShowReviewForm(true);
    setReviewError('');
  }
};

  // Функция для отмены редактирования
  const handleCancelReview = () => {
    setShowReviewForm(false);
    setEditingReview(false);
    setReviewText('');
    setReviewRating(5);
    setReviewError('');
  };

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 999999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        animation: 'fadeIn 0.3s ease-out',
      }}
    >
      {/* Затемнение */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.85)',
          backdropFilter: 'blur(8px)',
        }}
        onClick={onClose}
      />
      
      {/* Модальное окно */}
      <div
        style={{
          position: 'relative',
          width: '90%',
          maxWidth: '550px',
          maxHeight: '85vh',
          backgroundColor: '#111314',
          borderRadius: '24px',
          border: '1px solid rgba(221, 216, 132, 0.3)',
          boxShadow: '0 20px 40px rgba(0, 0, 0, 0.5)',
          animation: 'scaleIn 0.3s ease-out',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Заголовок */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '20px 24px',
            borderBottom: '1px solid rgba(221, 216, 132, 0.2)',
            backgroundColor: 'rgba(17, 19, 20, 0.95)',
            flexShrink: 0,
          }}
        >
          <h3
            style={{
              fontFamily: 'var(--font-poiret-one), Poiret One, cursive',
              fontSize: '24px',
              fontWeight: '300',
              color: '#DDDA84',
              margin: 0,
            }}
          >
            Личный кабинет
          </h3>
          <button
            onClick={onClose}
            style={{
              width: '36px',
              height: '36px',
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
            <X size={18} color="#DDDA84" />
          </button>
        </div>

        {/* Вкладки */}
        <div
          style={{
            display: 'flex',
            borderBottom: '1px solid rgba(221, 216, 132, 0.2)',
            flexShrink: 0,
          }}
        >
          <button
            onClick={() => setActiveTab('info')}
            style={{
              flex: 1,
              padding: '10px 10px',
              backgroundColor: activeTab === 'info' ? 'rgba(221, 216, 132, 0.1)' : 'transparent',
              border: 'none',
              borderBottom: activeTab === 'info' ? '2px solid #DDDA84' : '2px solid transparent',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
            }}
          >
            <User size={16} color={activeTab === 'info' ? '#DDDA84' : '#E8FFFB'} />
            <span style={{ fontFamily: 'var(--font-jura), Jura, sans-serif', fontSize: '14px', color: activeTab === 'info' ? '#DDDA84' : '#E8FFFB', fontWeight: activeTab === 'info' ? 'bold' : 'normal' }}>Контакты</span>
          </button>
          <button
            onClick={() => setActiveTab('orders')}
            style={{
              flex: 1,
              padding: '14px 16px',
              backgroundColor: activeTab === 'orders' ? 'rgba(221, 216, 132, 0.1)' : 'transparent',
              border: 'none',
              borderBottom: activeTab === 'orders' ? '2px solid #DDDA84' : '2px solid transparent',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
            }}
          >
            <ShoppingBag size={16} color={activeTab === 'orders' ? '#DDDA84' : '#E8FFFB'} />
            <span style={{ fontFamily: 'var(--font-jura), Jura, sans-serif', fontSize: '14px', color: activeTab === 'orders' ? '#DDDA84' : '#E8FFFB', fontWeight: activeTab === 'orders' ? 'bold' : 'normal' }}>Заказы</span>
          </button>
          <button
            onClick={() => setActiveTab('reviews')}
            style={{
              flex: 1,
              padding: '14px 16px',
              backgroundColor: activeTab === 'reviews' ? 'rgba(221, 216, 132, 0.1)' : 'transparent',
              border: 'none',
              borderBottom: activeTab === 'reviews' ? '2px solid #DDDA84' : '2px solid transparent',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
            }}
          >
            <Star size={16} color={activeTab === 'reviews' ? '#DDDA84' : '#E8FFFB'} />
            <span style={{ fontFamily: 'var(--font-jura), Jura, sans-serif', fontSize: '14px', color: activeTab === 'reviews' ? '#DDDA84' : '#E8FFFB', fontWeight: activeTab === 'reviews' ? 'bold' : 'normal' }}>Отзывы</span>
          </button>
        </div>

        {/* Контент вкладок */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '24px' }}>
          {/* Вкладка "Контактная информация" */}
          {activeTab === 'info' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {saveSuccess && (
                <div style={{ backgroundColor: 'rgba(46, 204, 113, 0.15)', border: '1px solid #2ecc71', borderRadius: '8px', padding: '10px', textAlign: 'center' }}>
                  <p style={{ color: '#2ecc71', fontFamily: 'var(--font-jura), Jura, sans-serif', fontSize: '13px', margin: 0 }}>Данные успешно обновлены!</p>
                </div>
              )}

              {updateError && (
                <div style={{ backgroundColor: 'rgba(231, 76, 60, 0.15)', border: '1px solid #e74c3c', borderRadius: '8px', padding: '10px', textAlign: 'center' }}>
                  <p style={{ color: '#e74c3c', fontFamily: 'var(--font-jura), Jura, sans-serif', fontSize: '13px', margin: 0 }}>{updateError}</p>
                </div>
              )}

              <div style={{ display: 'flex', alignItems: 'center', gap: '16px', paddingBottom: '20px', borderBottom: '1px solid rgba(221, 216, 132, 0.2)' }}>
                <div style={{ width: '64px', height: '64px', borderRadius: '50%', backgroundColor: 'rgba(221, 216, 132, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <User size={32} color="#DDDA84" />
                </div>
                <div style={{ flex: 1 }}>
                  {isEditing ? (
                    <input
                      type="text"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      placeholder="Ваше имя"
                      style={{
                        width: '100%',
                        padding: '8px 12px',
                        backgroundColor: '#191B1B',
                        border: '1px solid #DDDA84',
                        borderRadius: '8px',
                        color: '#E8FFFB',
                        fontFamily: 'var(--font-jura), Jura, sans-serif',
                        fontSize: '18px',
                        outline: 'none',
                      }}
                    />
                  ) : (
                    <p style={{ fontFamily: 'var(--font-poiret-one), Poiret One, cursive', color: '#DDDA84', fontSize: '20px', margin: 0 }}>{clientData.name || 'Имя не указано'}</p>
                  )}
                  <p style={{ fontFamily: 'var(--font-jura), Jura, sans-serif', color: '#E8FFFB', fontSize: '12px', opacity: 0.6, margin: '4px 0 0 0' }}>ID: {user?.uid?.slice(0, 8)}...</p>
                </div>
                {!isEditing && (
                  <button
                    onClick={() => setIsEditing(true)}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '8px', borderRadius: '50%', transition: 'all 0.3s ease' }}
                    onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'rgba(221, 216, 132, 0.1)'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; }}
                  >
                    <Edit2 size={18} color="#DDDA84" />
                  </button>
                )}
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 0', borderBottom: '1px solid rgba(221, 216, 132, 0.1)' }}>
                <Mail size={18} color="#DDDA84" />
                <div style={{ flex: 1 }}>
                  <p style={{ fontFamily: 'var(--font-jura), Jura, sans-serif', color: '#E8FFFB', fontSize: '12px', opacity: 0.6, margin: 0 }}>Email</p>
                  <p style={{ fontFamily: 'var(--font-jura), Jura, sans-serif', color: '#E8FFFB', fontSize: '14px', margin: '4px 0 0 0' }}>{user?.email || 'Не указан'}</p>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 0', borderBottom: '1px solid rgba(221, 216, 132, 0.1)' }}>
                <Phone size={18} color="#DDDA84" />
                <div style={{ flex: 1 }}>
                  <p style={{ fontFamily: 'var(--font-jura), Jura, sans-serif', color: '#E8FFFB', fontSize: '12px', opacity: 0.6, margin: 0 }}>Телефон</p>
                  {isEditing ? (
                    <div style={{ position: 'relative', marginTop: '4px' }}>
                      <input
                        type="tel"
                        value={editPhone}
                        onChange={handlePhoneChange}
                        placeholder="+7 (___) ___-__-__"
                        maxLength={18}
                        style={{
                          width: '100%',
                          paddingTop: '8px',
                          paddingBottom: '8px',
                          paddingLeft: '12px',
                          paddingRight: '35px',
                          backgroundColor: '#191B1B',
                          border: '1px solid #DDDA84',
                          borderRadius: '8px',
                          color: '#E8FFFB',
                          fontFamily: 'var(--font-jura), Jura, sans-serif',
                          fontSize: '14px',
                          outline: 'none',
                        }}
                      />
                      {editPhone && (
                        <button
                          onClick={clearPhone}
                          style={{
                            position: 'absolute',
                            right: '8px',
                            top: '50%',
                            transform: 'translateY(-50%)',
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            padding: '4px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            borderRadius: '50%',
                          }}
                          onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'rgba(221, 216, 132, 0.2)'; }}
                          onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; }}
                        >
                          <Trash2 size={14} color="#DDDA84" />
                        </button>
                      )}
                    </div>
                  ) : (
                    <p style={{ fontFamily: 'var(--font-jura), Jura, sans-serif', color: '#E8FFFB', fontSize: '14px', margin: '4px 0 0 0' }}>{clientData.phone || 'Не указан'}</p>
                  )}
                </div>
              </div>

              {isEditing && (
                <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
                  <button
                    onClick={handleSave}
                    disabled={loading}
                    style={{
                      flex: 1,
                      padding: '12px',
                      backgroundColor: '#DDDA84',
                      border: 'none',
                      borderRadius: '10px',
                      color: '#111314',
                      fontFamily: 'var(--font-jura), Jura, sans-serif',
                      fontSize: '14px',
                      fontWeight: 'bold',
                      cursor: loading ? 'not-allowed' : 'pointer',
                      transition: 'all 0.3s ease',
                      opacity: loading ? 0.6 : 1,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                    }}
                    onMouseEnter={(e) => { if (!loading) e.currentTarget.style.backgroundColor = '#E8FFFB'; }}
                    onMouseLeave={(e) => { if (!loading) e.currentTarget.style.backgroundColor = '#DDDA84'; }}
                  >
                    <Check size={16} /> Сохранить
                  </button>
                  <button
                    onClick={handleCancel}
                    style={{
                      flex: 1,
                      padding: '12px',
                      backgroundColor: 'transparent',
                      border: '2px solid rgba(221, 216, 132, 0.3)',
                      borderRadius: '10px',
                      color: '#DDDA84',
                      fontFamily: 'var(--font-jura), Jura, sans-serif',
                      fontSize: '14px',
                      fontWeight: 'bold',
                      cursor: 'pointer',
                      transition: 'all 0.3s ease',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#DDDA84'; e.currentTarget.style.backgroundColor = 'rgba(221, 216, 132, 0.1)'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'rgba(221, 216, 132, 0.3)'; e.currentTarget.style.backgroundColor = 'transparent'; }}
                  >
                    <XCircle size={16} /> Отмена
                  </button>
                </div>
              )}

              <button
                onClick={handleLogout}
                style={{
                  width: '100%',
                  marginTop: '20px',
                  padding: '14px',
                  backgroundColor: 'transparent',
                  border: '2px solid #DDDA84',
                  borderRadius: '12px',
                  color: '#DDDA84',
                  fontFamily: 'var(--font-jura), Jura, sans-serif',
                  fontSize: '16px',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#DDDA84';
                  e.currentTarget.style.color = '#111314';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent';
                  e.currentTarget.style.color = '#DDDA84';
                }}
              >
                Выйти из аккаунта
              </button>
            </div>
          )}

          {/* Вкладка "История заказов" */}
          {activeTab === 'orders' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {loadingOrders ? (
                <div style={{ textAlign: 'center', padding: '40px 20px' }}>
                  <div style={{ width: '40px', height: '40px', border: '3px solid rgba(221, 216, 132, 0.3)', borderTopColor: '#DDDA84', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto' }} />
                </div>
              ) : orders.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px 20px' }}>
                  <ShoppingBag size={48} color="#DDDA84" opacity={0.3} style={{ margin: '0 auto 16px' }} />
                  <p style={{ fontFamily: 'var(--font-jura), Jura, sans-serif', color: '#E8FFFB', fontSize: '14px', opacity: 0.6 }}>У вас пока нет заказов</p>
                </div>
              ) : selectedOrder ? (
                <div>
                  <button
                    onClick={() => setSelectedOrder(null)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      marginBottom: '20px',
                      padding: '8px 0',
                      color: '#DDDA84',
                      fontFamily: 'var(--font-jura), Jura, sans-serif',
                      fontSize: '14px',
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.opacity = '0.8'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.opacity = '1'; }}
                  >
                    ← Назад к списку
                  </button>
                  
                  <div style={{ backgroundColor: '#191B1B', borderRadius: '16px', padding: '20px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', paddingBottom: '12px', borderBottom: '1px solid rgba(221, 216, 132, 0.2)' }}>
                      <h4 style={{ fontFamily: 'var(--font-poiret-one), Poiret One, cursive', color: '#DDDA84', fontSize: '18px', margin: 0 }}>Детали заказа</h4>
                      <div style={{ backgroundColor: getStatusBgColor(selectedOrder.status), padding: '4px 12px', borderRadius: '20px' }}>
                        <span style={{ fontFamily: 'var(--font-jura), Jura, sans-serif', color: getStatusColor(selectedOrder.status), fontSize: '12px', fontWeight: 'bold' }}>{selectedOrder.status}</span>
                      </div>
                    </div>
                    
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <CalendarIcon size={16} color="#DDDA84" />
                        <span style={{ fontFamily: 'var(--font-jura), Jura, sans-serif', color: '#E8FFFB', fontSize: '14px' }}>Дата заказа: <strong>{selectedOrder.date || 'Не указана'}</strong></span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <Package size={16} color="#DDDA84" />
                        <span style={{ fontFamily: 'var(--font-jura), Jura, sans-serif', color: '#E8FFFB', fontSize: '14px' }}>Решение: <strong>{selectedOrder.solution}</strong></span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <Home size={16} color="#DDDA84" />
                        <span style={{ fontFamily: 'var(--font-jura), Jura, sans-serif', color: '#E8FFFB', fontSize: '14px' }}>Помещение: <strong>{selectedOrder.room}</strong></span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <Droplet size={16} color="#DDDA84" />
                        <span style={{ fontFamily: 'var(--font-jura), Jura, sans-serif', color: '#E8FFFB', fontSize: '14px' }}>Вид стекла: <strong>{selectedOrder.glassType}</strong></span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <Palette size={16} color="#DDDA84" />
                        <span style={{ fontFamily: 'var(--font-jura), Jura, sans-serif', color: '#E8FFFB', fontSize: '14px' }}>Цвет фурнитуры: <strong>{selectedOrder.fittingsColor}</strong></span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                        <MapPin size={16} color="#DDDA84" />
                        <span style={{ fontFamily: 'var(--font-jura), Jura, sans-serif', color: '#E8FFFB', fontSize: '14px' }}>Адрес: <strong>{selectedOrder.address || 'Не указан'}</strong></span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <MessageCircle size={16} color="#DDDA84" />
                        <span style={{ fontFamily: 'var(--font-jura), Jura, sans-serif', color: '#E8FFFB', fontSize: '14px' }}>Способ связи: <strong>{selectedOrder.feedback}</strong></span>
                      </div>
                      {selectedOrder.comment && (
                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', marginTop: '8px', paddingTop: '8px', borderTop: '1px solid rgba(221, 216, 132, 0.1)' }}>
                          <MessageCircle size={16} color="#DDDA84" />
                          <span style={{ fontFamily: 'var(--font-jura), Jura, sans-serif', color: '#E8FFFB', fontSize: '14px' }}>Комментарий: <strong>{selectedOrder.comment}</strong></span>
                        </div>
                      )}
                    </div>
                    
                    <div style={{ marginTop: '24px', paddingTop: '16px', borderTop: '1px solid rgba(221, 216, 132, 0.2)' }}>
                      <p style={{ fontFamily: 'var(--font-jura), Jura, sans-serif', color: '#E8FFFB', fontSize: '12px', opacity: 0.5, textAlign: 'center' }}>
                        Для изменения данных заказа обратитесь к администратору
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                orders.map((order) => (
                  <div
                    key={order.id}
                    style={{
                      backgroundColor: 'rgba(17, 19, 20, 0.8)',
                      borderRadius: '12px',
                      padding: '16px',
                      border: '1px solid rgba(221, 216, 132, 0.2)',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Calendar size={14} color="#DDDA84" />
                        <span style={{ fontFamily: 'var(--font-jura), Jura, sans-serif', color: '#E8FFFB', fontSize: '12px', opacity: 0.7 }}>{order.date}</span>
                      </div>
                      <div style={{ backgroundColor: getStatusBgColor(order.status), padding: '4px 10px', borderRadius: '20px' }}>
                        <span style={{ fontFamily: 'var(--font-jura), Jura, sans-serif', color: getStatusColor(order.status), fontSize: '11px', fontWeight: 'bold' }}>{order.status}</span>
                      </div>
                    </div>
                    <p style={{ fontFamily: 'var(--font-jura), Jura, sans-serif', color: '#DDDA84', fontSize: '15px', fontWeight: 'bold', marginBottom: '8px' }}>{order.solution}</p>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontFamily: 'var(--font-jura), Jura, sans-serif', color: '#E8FFFB', fontSize: '14px', fontWeight: 'bold' }}>{order.price}</span>
                      <button
                        onClick={() => setSelectedOrder(order)}
                        style={{
                          backgroundColor: 'transparent',
                          border: '1px solid rgba(221, 216, 132, 0.3)',
                          borderRadius: '8px',
                          padding: '6px 12px',
                          cursor: 'pointer',
                          transition: 'all 0.3s ease',
                        }}
                        onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'rgba(221, 216, 132, 0.1)'; e.currentTarget.style.borderColor = '#DDDA84'; }}
                        onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.borderColor = 'rgba(221, 216, 132, 0.3)'; }}
                      >
                        <span style={{ fontFamily: 'var(--font-jura), Jura, sans-serif', color: '#DDDA84', fontSize: '12px' }}>Подробнее</span>
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* Вкладка "Отзывы" */}
{activeTab === 'reviews' && (
  <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
    {isBanned ? (
      <div style={{ textAlign: 'center', padding: '40px 20px' }}>
        <AlertCircle size={48} color="#e74c3c" opacity={0.5} style={{ margin: '0 auto 16px' }} />
        <p style={{ fontFamily: 'var(--font-jura), Jura, sans-serif', color: '#E8FFFB', fontSize: '14px', opacity: 0.6 }}>
          Заблокированные пользователи не могут оставлять отзывы
        </p>
      </div>
    ) : loadingReviewStatus ? (
      <div style={{ textAlign: 'center', padding: '40px 20px' }}>
        <div style={{ width: '40px', height: '40px', border: '3px solid rgba(221, 216, 132, 0.3)', borderTopColor: '#DDDA84', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto' }} />
      </div>
    ) : !hasCompletedOrder ? (
      <div style={{ textAlign: 'center', padding: '40px 20px' }}>
        <Star size={48} color="#DDDA84" opacity={0.3} style={{ margin: '0 auto 16px' }} />
        <p style={{ fontFamily: 'var(--font-jura), Jura, sans-serif', color: '#E8FFFB', fontSize: '14px', opacity: 0.6 }}>
          Вы сможете оставить отзыв после выполнения хотя бы одного заказа
        </p>
      </div>
    ) : showReviewForm ? (
      // Форма для написания/редактирования отзыва
      <div style={{ backgroundColor: '#191B1B', borderRadius: '16px', padding: '20px' }}>
        <h4 style={{ fontFamily: 'var(--font-poiret-one), Poiret One, cursive', color: '#DDDA84', fontSize: '18px', marginBottom: '16px' }}>
          {editingReview ? 'Редактировать отзыв' : 'Оставить отзыв'}
        </h4>
        
        <div style={{ marginBottom: '16px' }}>
          <p style={{ fontFamily: 'var(--font-jura), Jura, sans-serif', color: '#E8FFFB', fontSize: '13px', marginBottom: '8px' }}>Ваша оценка:</p>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {[1, 2, 3, 4, 5].map((rating) => (
              <button
                key={rating}
                type="button"
                onClick={() => setReviewRating(rating)}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  padding: '4px',
                  transition: 'transform 0.2s ease',
                }}
                onMouseEnter={(e) => { e.currentTarget.style.transform = 'scale(1.1)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.transform = 'scale(1)'; }}
              >
                <Star
                  size={28}
                  fill={rating <= reviewRating ? '#DDDA84' : 'none'}
                  color={rating <= reviewRating ? '#DDDA84' : 'rgba(221, 216, 132, 0.3)'}
                />
              </button>
            ))}
          </div>
        </div>
        
        <textarea
          placeholder="Расскажите о своем опыте... Минимум 10 символов"
          value={reviewText}
          onChange={(e) => setReviewText(e.target.value)}
          rows={4}
          style={{
            width: '100%',
            padding: '12px',
            backgroundColor: '#111314',
            border: '1px solid rgba(221, 216, 132, 0.3)',
            borderRadius: '12px',
            color: '#E8FFFB',
            fontFamily: 'var(--font-jura), Jura, sans-serif',
            fontSize: '14px',
            outline: 'none',
            resize: 'vertical',
          }}
        />
        
        {reviewError && (
          <div style={{ marginTop: '12px', padding: '10px', backgroundColor: 'rgba(231, 76, 60, 0.1)', border: '1px solid #e74c3c', borderRadius: '8px' }}>
            <p style={{ color: '#e74c3c', fontFamily: 'var(--font-jura), Jura, sans-serif', fontSize: '12px', margin: 0, textAlign: 'center' }}>{reviewError}</p>
          </div>
        )}
        
        <div style={{ display: 'flex', gap: '12px', marginTop: '20px' }}>
          <button
            type="button"
            onClick={handleSubmitReview}
            disabled={loadingReview}
            style={{
              flex: 1,
              padding: '12px',
              backgroundColor: '#DDDA84',
              border: 'none',
              borderRadius: '10px',
              color: '#111314',
              fontFamily: 'var(--font-jura), Jura, sans-serif',
              fontSize: '14px',
              fontWeight: 'bold',
              cursor: loadingReview ? 'not-allowed' : 'pointer',
              transition: 'all 0.3s ease',
              opacity: loadingReview ? 0.6 : 1,
            }}
            onMouseEnter={(e) => { if (!loadingReview) e.currentTarget.style.backgroundColor = '#E8FFFB'; }}
            onMouseLeave={(e) => { if (!loadingReview) e.currentTarget.style.backgroundColor = '#DDDA84'; }}
          >
            {loadingReview ? 'Сохранение...' : (editingReview ? 'Сохранить' : 'Отправить отзыв')}
          </button>
          <button
            type="button"
            onClick={handleCancelReview}
            style={{
              flex: 1,
              padding: '12px',
              backgroundColor: 'transparent',
              border: '2px solid rgba(221, 216, 132, 0.3)',
              borderRadius: '10px',
              color: '#DDDA84',
              fontFamily: 'var(--font-jura), Jura, sans-serif',
              fontSize: '14px',
              fontWeight: 'bold',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#DDDA84'; e.currentTarget.style.backgroundColor = 'rgba(221, 216, 132, 0.1)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'rgba(221, 216, 132, 0.3)'; e.currentTarget.style.backgroundColor = 'transparent'; }}
          >
            Отмена
          </button>
        </div>
      </div>
    ) : userReview ? (
      // Отображение существующего отзыва
      <div>
        <div style={{ 
          backgroundColor: 'rgba(17, 19, 20, 0.8)', 
          borderRadius: '16px', 
          padding: '20px',
          border: '1px solid rgba(221, 216, 132, 0.2)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Star size={20} fill="#DDDA84" color="#DDDA84" />
              <span style={{ fontFamily: 'var(--font-jura), Jura, sans-serif', color: '#DDDA84', fontSize: '16px', fontWeight: 'bold' }}>
                Ваш отзыв
              </span>
            </div>
            {userReview.canEdit && (
              <button
                onClick={handleEditReview}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  padding: '6px 12px',
                  borderRadius: '8px',
                  color: '#DDDA84',
                  fontFamily: 'var(--font-jura), Jura, sans-serif',
                  fontSize: '12px',
                  transition: 'all 0.3s ease',
                }}
                onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'rgba(221, 216, 132, 0.1)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; }}
              >
                <Edit2 size={14} /> Редактировать
              </button>
            )}
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              {[...Array(5)].map((_, i) => (
                <Star key={i} size={16} fill={i < userReview.rating ? '#DDDA84' : 'none'} color={i < userReview.rating ? '#DDDA84' : 'rgba(221, 216, 132, 0.3)'} />
              ))}
            </div>
            <Clock size={12} color="#DDDA84" opacity={0.5} />
            <span style={{ fontFamily: 'var(--font-jura), Jura, sans-serif', color: '#E8FFFB', fontSize: '11px', opacity: 0.5 }}>
              {userReview.date || 'Дата не указана'}
            </span>
          </div>
          
          <p style={{ fontFamily: 'var(--font-jura), Jura, sans-serif', color: '#E8FFFB', fontSize: '14px', lineHeight: 1.5, margin: 0 }}>
            {userReview.text}
          </p>
          
          {userReview.responseText && (
            <div style={{ 
              marginTop: '16px', 
              padding: '12px 16px', 
              backgroundColor: 'rgba(221, 216, 132, 0.05)',
              borderRadius: '12px',
              borderLeft: '3px solid #DDDA84'
            }}>
              <p style={{ fontFamily: 'var(--font-jura), Jura, sans-serif', color: '#DDDA84', fontSize: '12px', marginBottom: '6px', fontWeight: 'bold' }}>
                Ответ компании:
              </p>
              <p style={{ fontFamily: 'var(--font-jura), Jura, sans-serif', color: '#E8FFFB', fontSize: '13px', lineHeight: 1.5, margin: 0 }}>
                {userReview.responseText}
              </p>
            </div>
          )}
          
          {!userReview.canEdit && (
            <p style={{ marginTop: '12px', fontFamily: 'var(--font-jura), Jura, sans-serif', color: '#E8FFFB', fontSize: '11px', opacity: 0.4, textAlign: 'center' }}>
              Редактирование отзыва доступно не чаще 1 раза в 10 дней
            </p>
          )}
        </div>
      </div>
    ) : (
      // Кнопка для создания отзыва (показывается только если нет отзыва и загрузка завершена)
      <button
        onClick={() => setShowReviewForm(true)}
        style={{
          padding: '14px',
          backgroundColor: '#DDDA84',
          border: 'none',
          borderRadius: '12px',
          color: '#111314',
          fontFamily: 'var(--font-jura), Jura, sans-serif',
          fontSize: '16px',
          fontWeight: 'bold',
          cursor: 'pointer',
          transition: 'all 0.3s ease',
        }}
        onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#E8FFFB'; }}
        onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#DDDA84'; }}
      >
        + Оставить отзыв
      </button>
    )}
  </div>
)}
        </div>
      </div>

      <style>{`
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes scaleIn { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}