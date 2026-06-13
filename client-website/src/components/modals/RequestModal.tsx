'use client';

import { useState, useEffect, useRef } from 'react';
import { X, ChevronLeft, ChevronRight, Phone, Mail, Check, Trash2 } from 'lucide-react';
import { useAuth } from '@/contexts';
import { db } from '@/lib/firebase';
import { doc, setDoc, getDoc, collection, getDocs, addDoc, query, where } from 'firebase/firestore';import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { auth } from '@/lib/firebase';

interface RequestModalProps {
  isOpen: boolean;
  onClose: () => void;
}
// Функция для преобразования даты из формата "DD.MM.YYYY" в "YYYY-MM-DD"
const formatDateToYMD = (dateStr: string): string => {
  if (!dateStr) return '';
  const parts = dateStr.split('.');
  if (parts.length === 3) {
    return `${parts[2]}-${parts[1]}-${parts[0]}`;
  }
  return dateStr.split('T')[0];
};

// Функция для преобразования даты из Firebase в формат для сравнения
const formatDateForCompare = (date: any): string => {
  if (!date) return '';
  // Если дата в формате Timestamp Firebase
  if (date.toDate) {
    return date.toDate().toISOString().split('T')[0];
  }
  // Если строка в формате "DD.MM.YYYY"
  if (typeof date === 'string' && date.includes('.')) {
    return formatDateToYMD(date);
  }
  return date.split('T')[0];
};

// Данные для календаря
const generateDaysForMonth = (year: number, month: number, busyDates: string[], semiDates: string[], dayOffs: string[]) => {
  const days = [];
  const firstDayOfMonth = new Date(year, month, 1);
  const lastDayOfMonth = new Date(year, month + 1, 0);
  const startDayOfWeek = firstDayOfMonth.getDay() === 0 ? 7 : firstDayOfMonth.getDay();
  
  for (let i = 1; i < startDayOfWeek; i++) {
    days.push({ day: null, status: 'empty', date: null });
  }
  
  const today = new Date();
  const minDate = new Date();
  minDate.setDate(today.getDate() + 15);
  minDate.setHours(0, 0, 0, 0);
  
  for (let i = 1; i <= lastDayOfMonth.getDate(); i++) {
    const currentDate = new Date(year, month, i);
    currentDate.setHours(0, 0, 0, 0);
    
    // Форматируем дату для сравнения в YYYY-MM-DD
    const yearMonthDay = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
    
    const isPastOrTooEarly = currentDate < minDate;
    const dayOfWeek = currentDate.getDay();
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
    
    let status = 'free';
    if (isPastOrTooEarly) status = 'disabled';
    else if (dayOffs.includes(yearMonthDay)) status = 'weekend';
    else if (busyDates.includes(yearMonthDay)) status = 'busy';
    else if (semiDates.includes(yearMonthDay)) status = 'semi';
    
    days.push({ day: i, status, date: currentDate.toISOString() });
  }
  
  return days;
};

const solutions = [
  { id: 'partition', name: 'Интерьерная / Loft перегородка' },
  { id: 'door', name: 'Офисная перегородка' },
  { id: 'shower', name: 'Душевая кабина / перегородка' },
  { id: 'office', name: 'Лестничное ограждение' },
];

const rooms = [
  { id: 'living', name: 'Комната в квартире' },
  { id: 'bedroom', name: 'Комната в частном доме' },
  { id: 'bathroom', name: 'Ванная' },
  { id: 'office', name: 'Офис' },
];

const glassTypes = [
  { id: 'clear', name: 'Прозрачное' },
  { id: 'matte', name: 'Матовое' },
  { id: 'tinted', name: 'Тонированное' },
  { id: 'pattern', name: 'Не определились' },
];

const hardwareColors = [
  { id: 'black', name: 'Черный', color: '#1a1a1a' },
  { id: 'white', name: 'Хром матовый', color: '#e0e0e0' },
  { id: 'gold', name: 'Хром глянец', color: '#DDDA84' },
  { id: 'silver', name: 'Не определились', color: '#888888' },
];

const contactMethods = [
  { id: 'phone', name: 'По телефону', icon: Phone },
  { id: 'sms', name: 'SMS', icon: Phone },
  { id: 'both', name: 'SMS + По телефону', icon: Phone },
  { id: 'email', name: 'Email', icon: Mail },
];

export default function RequestModal({ isOpen, onClose }: RequestModalProps) {
  const { user, isAuthenticated, checkOrdersLimit } = useAuth();

  const [step, setStep] = useState(1);
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [days, setDays] = useState<Array<{ day: number | null; status: string; date: string | null }>>([]);
  const [busyDates, setBusyDates] = useState<string[]>([]);
  const [semiDates, setSemiDates] = useState<string[]>([]);
  const [dayOffs, setDayOffs] = useState<string[]>([]);
  const [loadingCalendar, setLoadingCalendar] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [generatedPassword, setGeneratedPassword] = useState('');
  const [limitError, setLimitError] = useState('');
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [formData, setFormData] = useState({
    solution: '',
    room: '',
    glassType: '',
    hardwareColor: '',
    name: '',
    phone: '',
    email: '',
    address:'',
    contactMethod: '',
    comment: '',
  });
  const [submitted, setSubmitted] = useState(false);
  const [emailError, setEmailError] = useState('');
  const [orientation, setOrientation] = useState('portrait');
  const modalContentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    const checkOrientation = () => {
      setOrientation(window.innerHeight < window.innerWidth ? 'landscape' : 'portrait');
    };
    checkOrientation();
    window.addEventListener('resize', checkOrientation);
    return () => window.removeEventListener('resize', checkOrientation);
  }, []);

  // Загрузка данных календаря из Firebase
  useEffect(() => {
    const fetchCalendarData = async () => {
      if (!isOpen) return;
      
      setLoadingCalendar(true);
      try {
        // Получаем все заказы
        const ordersSnapshot = await getDocs(collection(db, 'orders'));
        const busyDatesMap: Map<string, number> = new Map();
        
        ordersSnapshot.forEach((doc) => {
          const data = doc.data();
          const date = data.date;
          if (date) {
            const formattedDate = formatDateForCompare(date);
            const count = busyDatesMap.get(formattedDate) || 0;
            busyDatesMap.set(formattedDate, count + 1);
          }
        });
        
        // Определяем busy (2+ заказа) и semi (1 заказ)
        const busy: string[] = [];
        const semi: string[] = [];
        
        busyDatesMap.forEach((count, date) => {
          if (count >= 2) {
            busy.push(date);
          } else if (count === 1) {
            semi.push(date);
          }
        });
        
        // Получаем выходные дни (нерабочие дни)
        const dayOffsSnapshot = await getDocs(collection(db, 'day_offs'));
        const dayOffsList: string[] = [];
        
        dayOffsSnapshot.forEach((doc) => {
          const data = doc.data();
          const date = data.date;
          if (date) {
            const formattedDate = formatDateForCompare(date);
            dayOffsList.push(formattedDate);
          }
        });
        
        setBusyDates(busy);
        setSemiDates(semi);
        setDayOffs(dayOffsList);
      } catch (error) {
        console.error('Ошибка загрузки данных календаря:', error);
      } finally {
        setLoadingCalendar(false);
      }
    };
    
    fetchCalendarData();
  }, [isOpen]);

  useEffect(() => {
    if (isAuthenticated && user) {
      const fetchClientData = async () => {
        try {
          const clientDoc = await getDoc(doc(db, 'clients', user.uid));
          if (clientDoc.exists()) {
            const clientData = clientDoc.data();
            setFormData(prev => ({
              ...prev,
              name: user.displayName || clientData.fullName || '',
              email: user.email || '',
              phone: clientData.phone || '',
            }));
          } else {
            setFormData(prev => ({
              ...prev,
              name: user.displayName || '',
              email: user.email || '',
            }));
          }
        } catch (error) {
          console.error('Ошибка загрузки данных клиента:', error);
          setFormData(prev => ({
            ...prev,
            name: user.displayName || '',
            email: user.email || '',
          }));
        }
      };
      fetchClientData();
    }
  }, [isAuthenticated, user]);

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

  useEffect(() => {
    if (busyDates.length > 0 || semiDates.length > 0 || dayOffs.length > 0 || currentYear) {
      const newDays = generateDaysForMonth(currentYear, currentMonth, busyDates, semiDates, dayOffs);
      setDays(newDays);
    }
  }, [currentYear, currentMonth, busyDates, semiDates, dayOffs]);

  if (!isOpen) return null;

  const clearPhone = () => {
    setFormData({ ...formData, phone: '' });
  };

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
    setFormData({ ...formData, phone: formatted });
  };

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'free': return '#2ecc71';
      case 'semi': return '#f1c40f';
      case 'busy': return '#e74c3c';
      case 'weekend': return '#95a5a6';
      case 'disabled': return '#555555';
      default: return '#2ecc71';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'free': return 'Свободно';
      case 'semi': return 'Полусвоб.';
      case 'busy': return 'Занято';
      case 'weekend': return 'Вых.';
      case 'disabled': return 'Недост.';
      default: return 'Свободно';
    }
  };

  const nextStep = () => {
  if (step === 7) return;
  setEmailError('');
  setLimitError('');
  setStep(step + 1);
  setTimeout(() => {
    if (modalContentRef.current) modalContentRef.current.scrollTop = 0;
  }, 100);
};

const prevStep = () => {
  if (step === 1) return;
  setEmailError('');
  setLimitError('');
  setStep(step - 1);
  setTimeout(() => {
    if (modalContentRef.current) modalContentRef.current.scrollTop = 0;
  }, 100);
};

  const generateRandomPassword = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%';
    let password = '';
    for (let i = 0; i < 10; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return password;
  };

  const createUserAndSendPassword = async (email: string, password: string, name: string) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(userCredential.user, { displayName: name });
      await setDoc(doc(db, 'clients', userCredential.user.uid), {
        fullName: name,
        email: email,
        phone: formData.phone || '',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        ordersCount: 1,
        isFavorite: false,
      });
      return userCredential.user;
    } catch (error: any) {
      if (error.code === 'auth/email-already-in-use') {
        throw new Error('email-already-in-use');
      }
      throw error;
    }
  };

  const handleNewOrder = () => {
  setSubmitted(false);
  setStep(1);
  setSelectedDate(null);
  setFormData({
    solution: '',
    room: '',
    glassType: '',
    hardwareColor: '',
    name: isAuthenticated && user ? user.displayName || '' : '',
    phone: '',
    email: isAuthenticated && user ? user.email || '' : '',
    address: '',
    contactMethod: '',
    comment: '',
  });
  setEmailError('');
};

  // Функция для отправки заказа в Firestore
const sendOrderToFirestore = async (clientId: string) => {
  try {
    const selectedSolution = solutions.find(s => s.id === formData.solution);
    const selectedRoom = rooms.find(r => r.id === formData.room);
    const selectedGlass = glassTypes.find(g => g.id === formData.glassType);
    const selectedHardware = hardwareColors.find(c => c.id === formData.hardwareColor);
    
    let formattedDate = '';
    if (selectedDate) {
      const date = new Date(selectedDate);
      formattedDate = `${String(date.getDate()).padStart(2, '0')}.${String(date.getMonth() + 1).padStart(2, '0')}.${date.getFullYear()}`;
    }
    
    // Получаем выбранный способ связи
    let feedback = '';
    switch (formData.contactMethod) {
      case 'phone': feedback = 'По телефону'; break;
      case 'sms': feedback = 'SMS'; break;
      case 'both': feedback = 'SMS + По телефону'; break;
      case 'email': feedback = 'Email'; break;
      default: feedback = 'По телефону';
    }
    
    const orderData = {
  address: formData.address || "",
  clientId: clientId,
  comment: formData.comment || "",
  createdAt: new Date(),  // ← ТАК (или serverTimestamp())
  date: formattedDate,
  expenses: "0 ₽",
  feedback: feedback,
  fittingsColor: selectedHardware?.name || "",
  glassType: selectedGlass?.name || "",
  room: selectedRoom?.name || "",
  serviceCost: "0 ₽",
  solution: selectedSolution?.name || "",
  status: "Новый",
  time: "12:00",
  updatedAt: new Date(),  // ← ТАК (или serverTimestamp())
};
    
    await addDoc(collection(db, 'orders'), orderData);
    console.log('Заказ успешно отправлен!');
  } catch (error) {
    console.error('Ошибка при отправке заказа:', error);
    throw new Error('Не удалось отправить заказ');
  }
};

const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setEmailError('');
  setLimitError('');
  
  // Проверка черного списка для авторизованных пользователей
  if (isAuthenticated && user) {
    try {
      const blacklistRef = collection(db, 'blacklist');
      const q = query(blacklistRef, where('email', '==', user.email));
      const querySnapshot = await getDocs(q);
      
      if (!querySnapshot.empty) {
        const banData = querySnapshot.docs[0].data();
        setLimitError(`Ваш аккаунт заблокирован. Причина: ${banData.banReason || 'не указана'}. Свяжитесь с нами для уточнения.`);
        setTimeout(() => {
          const errorElement = document.querySelector('.limit-error-message');
          if (errorElement) errorElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }, 100);
        return;
      }
    } catch (error) {
      console.error('Ошибка проверки черного списка:', error);
    }
  }
  
  // ========== ПРОВЕРКА ЛИМИТА (САМОСТОЯТЕЛЬНАЯ) ==========
  const userId = isAuthenticated && user ? user.uid : null;
  
  if (userId) {
    try {
      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
      
      // Получаем заказы пользователя за текущий месяц
      const ordersRef = collection(db, 'orders');
      const q = query(
        ordersRef,
        where('clientId', '==', userId),
        where('createdAt', '>=', startOfMonth),
        where('createdAt', '<=', endOfMonth)
      );
      
      const querySnapshot = await getDocs(q);
      const currentCount = querySnapshot.size;
      const maxLimit = 5;
      const canOrder = currentCount < maxLimit;
      
      console.log('Проверка лимита:', { currentCount, maxLimit, canOrder });
      
      if (!canOrder) {
        setLimitError(`Вы уже оформили ${currentCount} из ${maxLimit} возможных заявок в этом месяце. Лимит на месяц исчерпан.`);
        setTimeout(() => {
          const errorElement = document.querySelector('.limit-error-message');
          if (errorElement) errorElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }, 100);
        return;
      }
    } catch (error) {
      console.error('Ошибка при проверке лимита:', error);
      // Продолжаем выполнение, если проверка не удалась
    }
  }
  // ========== КОНЕЦ ПРОВЕРКИ ==========
  
  // Проверка черного списка для неавторизованных пользователей
  if (!isAuthenticated) {
    try {
      const blacklistRef = collection(db, 'blacklist');
      const q = query(blacklistRef, where('email', '==', formData.email));
      const querySnapshot = await getDocs(q);
      
      if (!querySnapshot.empty) {
        const banData = querySnapshot.docs[0].data();
        setLimitError(`Ваш email находится в черном списке. Причина: ${banData.banReason || 'не указана'}. Свяжитесь с нами для уточнения.`);
        setTimeout(() => {
          const errorElement = document.querySelector('.limit-error-message');
          if (errorElement) errorElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }, 100);
        return;
      }
    } catch (error) {
      console.error('Ошибка проверки черного списка:', error);
    }
  }
  
  if (!isAuthenticated) {
    try {
      const password = generateRandomPassword();
      setGeneratedPassword(password);
      const newUser = await createUserAndSendPassword(formData.email, password, formData.name);
      setShowPasswordModal(true);
      await sendOrderToFirestore(newUser.uid);
      setSubmitted(true);
    } catch (error: any) {
      if (error.message === 'email-already-in-use') {
        setEmailError('Пользователь с таким email уже существует. Пожалуйста, войдите в аккаунт. Если ранее вы не регистрировались, то просто укажите в заявке другую почту!');
        setTimeout(() => {
          const errorElement = document.querySelector('.email-error-message');
          if (errorElement) errorElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }, 100);
        return;
      }
      console.error('Ошибка:', error);
      return;
    }
  } else if (user) {
    await sendOrderToFirestore(user.uid);
    setSubmitted(true);
  }
};

  const closePasswordModalAndFinish = () => {
    setShowPasswordModal(false);
    setSubmitted(true);
  };

  const changeMonth = (delta: number) => {
    const newDate = new Date(currentYear, currentMonth + delta);
    setCurrentYear(newDate.getFullYear());
    setCurrentMonth(newDate.getMonth());
  };

  const changeYear = (delta: number) => {
    setCurrentYear(currentYear + delta);
  };

  const isStepValid = () => {
    switch (step) {
      case 1: return selectedDate !== null;
      case 2: return formData.solution !== '';
      case 3: return formData.room !== '';
      case 4: return formData.glassType !== '';
      case 5: return formData.hardwareColor !== '';
      case 6: return formData.name !== '' && formData.email !== '' && formData.contactMethod !== '';
      case 7: return true;
      default: return false;
    }
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: isMobile ? '12px' : '16px' }}>
            <h4 style={{ fontFamily: 'var(--font-poiret-one), Poiret One, cursive', color: '#DDDA84', fontSize: isMobile ? '16px' : '22px', margin: 0 }}>
              Выберите удобную дату
            </h4>
            
            {loadingCalendar ? (
              <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '40px' }}>
                <div style={{ width: '40px', height: '40px', border: '3px solid rgba(221, 216, 132, 0.3)', borderTopColor: '#DDDA84', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
              </div>
            ) : (
              <>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px', flexWrap: 'wrap' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <button type="button" onClick={() => changeYear(-1)} style={{ padding: isMobile ? '4px 8px' : '6px 10px', backgroundColor: 'rgba(221, 216, 132, 0.1)', border: '1px solid rgba(221, 216, 132, 0.3)', borderRadius: '8px', color: '#DDDA84', cursor: 'pointer', fontSize: isMobile ? '10px' : '12px', transition: 'all 0.3s ease' }}>◀◀</button>
                    <button type="button" onClick={() => changeMonth(-1)} style={{ padding: isMobile ? '4px 8px' : '6px 10px', backgroundColor: 'rgba(221, 216, 132, 0.1)', border: '1px solid rgba(221, 216, 132, 0.3)', borderRadius: '8px', color: '#DDDA84', cursor: 'pointer', fontSize: isMobile ? '10px' : '12px', transition: 'all 0.3s ease' }}>◀</button>
                  </div>
                  <span style={{ color: '#E8FFFB', fontFamily: 'var(--font-jura), Jura, sans-serif', fontSize: isMobile ? '11px' : '14px', textAlign: 'center' }}>
                    {new Date(currentYear, currentMonth).toLocaleString('ru', { month: 'long', year: 'numeric' })}
                  </span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <button type="button" onClick={() => changeMonth(1)} style={{ padding: isMobile ? '4px 8px' : '6px 10px', backgroundColor: 'rgba(221, 216, 132, 0.1)', border: '1px solid rgba(221, 216, 132, 0.3)', borderRadius: '8px', color: '#DDDA84', cursor: 'pointer', fontSize: isMobile ? '10px' : '12px', transition: 'all 0.3s ease' }}>▶</button>
                    <button type="button" onClick={() => changeYear(1)} style={{ padding: isMobile ? '4px 8px' : '6px 10px', backgroundColor: 'rgba(221, 216, 132, 0.1)', border: '1px solid rgba(221, 216, 132, 0.3)', borderRadius: '8px', color: '#DDDA84', cursor: 'pointer', fontSize: isMobile ? '10px' : '12px', transition: 'all 0.3s ease' }}>▶▶</button>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: isMobile ? '2px' : '4px' }}>
                  {['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'].map(day => (
                    <div key={day} style={{ textAlign: 'center', color: '#E8FFFB', opacity: 0.6, fontSize: isMobile ? '8px' : '10px', fontFamily: 'var(--font-jura), Jura, sans-serif', padding: isMobile ? '2px 0' : '4px 0' }}>{day}</div>
                  ))}
                  {days && days.map((day, index) => (
                    <button
                      key={index}
                      type="button"
                      onClick={() => day.status !== 'disabled' && day.status !== 'weekend' && day.status !== 'busy' && day.day && setSelectedDate(day.date)}
                      disabled={!day.day || day.status === 'disabled' || day.status === 'weekend' || day.status === 'busy'}
                      style={{
                        backgroundColor: selectedDate === day.date ? getStatusColor(day.status) : 'transparent',
                        border: `1px solid ${getStatusColor(day.status)}`,
                        borderRadius: '4px',
                        padding: isMobile ? '3px 0' : '5px',
                        cursor: day.day && day.status !== 'disabled' && day.status !== 'weekend' && day.status !== 'busy' ? 'pointer' : 'not-allowed',
                        opacity: day.day === null ? 0 : 1,
                        transition: 'all 0.3s ease',
                      }}
                    >
                      <div style={{ color: '#E8FFFB', fontFamily: 'var(--font-jura), Jura, sans-serif', fontSize: isMobile ? '9px' : '11px' }}>{day.day || ''}</div>
                    </button>
                  ))}
                </div>

                <div style={{ display: 'flex', justifyContent: 'center', gap: isMobile ? '6px' : '10px', flexWrap: 'wrap', marginTop: '4px' }}>
                  {['free', 'semi', 'busy', 'weekend', 'disabled'].map(status => (
                    <div key={status} style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                      <div style={{ width: isMobile ? '6px' : '8px', height: isMobile ? '6px' : '8px', borderRadius: '2px', backgroundColor: getStatusColor(status) }} />
                      <span style={{ color: '#E8FFFB', opacity: 0.7, fontSize: isMobile ? '7px' : '9px', fontFamily: 'var(--font-jura), Jura, sans-serif' }}>{getStatusText(status)}</span>
                    </div>
                  ))}
                </div>

                {selectedDate && (
                  <div style={{ marginTop: '6px', padding: isMobile ? '8px' : '10px', backgroundColor: 'rgba(221, 216, 132, 0.1)', borderRadius: '8px' }}>
                    <p style={{ color: '#DDDA84', fontFamily: 'var(--font-jura), Jura, sans-serif', fontSize: isMobile ? '11px' : '12px', margin: 0 }}>
                      📅 Выбрано: {new Date(selectedDate).toLocaleDateString('ru')}
                    </p>
                  </div>
                )}
              </>
            )}
          </div>
        );
      case 2:
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: isMobile ? '8px' : '10px' }}>
            <h4 style={{ fontFamily: 'var(--font-poiret-one), Poiret One, cursive', color: '#DDDA84', fontSize: isMobile ? (orientation === 'landscape' ? '14px' : '16px') : '22px', margin: 0 }}>Выберите решение</h4>
            {solutions.map(solution => (
              <button key={solution.id} type="button" onClick={() => setFormData({ ...formData, solution: solution.id })} style={{ width: '100%', padding: isMobile ? '10px' : '12px', backgroundColor: formData.solution === solution.id ? 'rgba(221, 216, 132, 0.15)' : 'transparent', border: `2px solid ${formData.solution === solution.id ? '#DDDA84' : 'rgba(221, 216, 132, 0.3)'}`, borderRadius: '10px', cursor: 'pointer', transition: 'all 0.3s ease', textAlign: 'left' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ color: '#E8FFFB', fontFamily: 'var(--font-jura), Jura, sans-serif', fontSize: '13px', fontWeight: 'bold' }}>{solution.name}</div>
                  {formData.solution === solution.id && <Check style={{ width: isMobile ? '16px' : '18px', height: isMobile ? '16px' : '18px', color: '#DDDA84' }} />}
                </div>
              </button>
            ))}
          </div>
        );
      case 3:
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: isMobile ? '8px' : '10px' }}>
            <h4 style={{ fontFamily: 'var(--font-poiret-one), Poiret One, cursive', color: '#DDDA84', fontSize: isMobile ? (orientation === 'landscape' ? '14px' : '16px') : '22px', margin: 0 }}>Выберите помещение</h4>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: isMobile ? '6px' : '10px' }}>
              {rooms.map(room => (
                <button key={room.id} type="button" onClick={() => setFormData({ ...formData, room: room.id })} style={{ padding: isMobile ? '8px' : '10px', backgroundColor: formData.room === room.id ? 'rgba(221, 216, 132, 0.15)' : 'transparent', border: `2px solid ${formData.room === room.id ? '#DDDA84' : 'rgba(221, 216, 132, 0.3)'}`, borderRadius: '8px', cursor: 'pointer', transition: 'all 0.3s ease' }}>
                  <div style={{ color: '#E8FFFB', fontFamily: 'var(--font-jura), Jura, sans-serif', fontSize: '13px', textAlign: 'center' }}>{room.name}</div>
                </button>
              ))}
            </div>
          </div>
        );
      case 4:
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: isMobile ? '8px' : '10px' }}>
            <h4 style={{ fontFamily: 'var(--font-poiret-one), Poiret One, cursive', color: '#DDDA84', fontSize: isMobile ? (orientation === 'landscape' ? '14px' : '16px') : '22px', margin: 0 }}>Выберите вид стекла</h4>
            {glassTypes.map(glass => (
              <button key={glass.id} type="button" onClick={() => setFormData({ ...formData, glassType: glass.id })} style={{ width: '100%', padding: isMobile ? '10px' : '12px', backgroundColor: formData.glassType === glass.id ? 'rgba(221, 216, 132, 0.15)' : 'transparent', border: `2px solid ${formData.glassType === glass.id ? '#DDDA84' : 'rgba(221, 216, 132, 0.3)'}`, borderRadius: '10px', cursor: 'pointer', transition: 'all 0.3s ease', textAlign: 'left' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ color: '#E8FFFB', fontFamily: 'var(--font-jura), Jura, sans-serif', fontSize: '13px', fontWeight: 'bold' }}>{glass.name}</div>
                  {formData.glassType === glass.id && <Check style={{ width: isMobile ? '16px' : '18px', height: isMobile ? '16px' : '18px', color: '#DDDA84' }} />}
                </div>
              </button>
            ))}
          </div>
        );
      case 5:
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: isMobile ? '8px' : '10px' }}>
            <h4 style={{ fontFamily: 'var(--font-poiret-one), Poiret One, cursive', color: '#DDDA84', fontSize: isMobile ? (orientation === 'landscape' ? '14px' : '16px') : '22px', margin: 0 }}>Выберите цвет фурнитуры</h4>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: isMobile ? '6px' : '10px' }}>
              {hardwareColors.map(color => (
                <button key={color.id} type="button" onClick={() => setFormData({ ...formData, hardwareColor: color.id })} style={{ padding: isMobile ? '8px' : '10px', backgroundColor: formData.hardwareColor === color.id ? 'rgba(221, 216, 132, 0.15)' : 'transparent', border: `2px solid ${formData.hardwareColor === color.id ? '#DDDA84' : 'rgba(221, 216, 132, 0.3)'}`, borderRadius: '8px', cursor: 'pointer', transition: 'all 0.3s ease', display: 'flex', alignItems: 'center', justifyContent: formData.hardwareColor === color.id ? 'space-between' : 'flex-start', gap: '6px', width: '100%' }}>
                  <div style={{ width: isMobile ? '16px' : '18px', height: isMobile ? '16px' : '18px', borderRadius: '50%', backgroundColor: color.color, border: '1px solid rgba(255,255,255,0.2)' }} />
                  <div style={{ color: '#E8FFFB', fontFamily: 'var(--font-jura), Jura, sans-serif', fontSize: '13px', flex: 1, textAlign: 'left' }}>{color.name}</div>
                  {formData.hardwareColor === color.id && <Check style={{ width: isMobile ? '12px' : '14px', height: isMobile ? '12px' : '14px', color: '#DDDA84' }} />}
                </button>
              ))}
            </div>
          </div>
        );
      case 6:
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: isMobile ? '10px' : '12px' }}>
      {/* Блок ошибок вверху */}
      {(emailError || limitError) && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '20px' }}>
          {emailError && (
            <div className="error-message" style={{ backgroundColor: 'rgba(231, 76, 60, 0.1)', border: '1px solid #e74c3c', borderRadius: '8px', padding: '12px' }}>
              <p style={{ color: '#e74c3c', fontFamily: 'var(--font-jura), Jura, sans-serif', fontSize: '13px', margin: 0, textAlign: 'center' }}>{emailError}</p>
            </div>
          )}
          {limitError && (
            <div className="error-message" style={{ backgroundColor: 'rgba(231, 76, 60, 0.1)', border: '1px solid #e74c3c', borderRadius: '8px', padding: '12px' }}>
              <p style={{ color: '#e74c3c', fontFamily: 'var(--font-jura), Jura, sans-serif', fontSize: '13px', margin: 0, textAlign: 'center' }}>{limitError}</p>
            </div>
          )}
        </div>
      )}
      
      <h4 style={{ fontFamily: 'var(--font-poiret-one), Poiret One, cursive', color: '#DDDA84', fontSize: isMobile ? (orientation === 'landscape' ? '14px' : '16px') : '22px', margin: 0 }}>Контактная информация</h4>
      
      <input 
        type="text" 
        placeholder="Ваше имя *" 
        value={formData.name} 
        onChange={(e) => setFormData({ ...formData, name: e.target.value })} 
        disabled={isAuthenticated} 
        style={{ 
          width: '100%', 
          padding: isMobile ? '10px 12px' : '12px 14px', 
          backgroundColor: isAuthenticated ? '#2a2a2a' : '#191B1B', 
          border: '1px solid rgba(221, 216, 132, 0.3)', 
          borderRadius: '8px', 
          color: '#E8FFFB', 
          fontFamily: 'var(--font-jura), Jura, sans-serif', 
          fontSize: isMobile ? '12px' : '13px', 
          outline: 'none', 
          transition: 'all 0.3s ease', 
          opacity: isAuthenticated ? 0.7 : 1 
        }} 
        required 
      />
      
      <div style={{ position: 'relative' }}>
        <input 
          type="tel" 
          placeholder="Телефон" 
          value={formData.phone} 
          onChange={handlePhoneChange} 
          disabled={isAuthenticated} 
          maxLength={18} 
          style={{ 
            width: '100%', 
            paddingTop: isMobile ? '10px' : '12px', 
            paddingBottom: isMobile ? '10px' : '12px', 
            paddingLeft: isMobile ? '12px' : '14px', 
            paddingRight: '35px', 
            backgroundColor: isAuthenticated ? '#2a2a2a' : '#191B1B', 
            border: '1px solid rgba(221, 216, 132, 0.3)', 
            borderRadius: '8px', 
            color: '#E8FFFB', 
            fontFamily: 'var(--font-jura), Jura, sans-serif', 
            fontSize: isMobile ? '12px' : '13px', 
            outline: 'none', 
            transition: 'all 0.3s ease', 
            opacity: isAuthenticated ? 0.7 : 1 
          }} 
        />
        {formData.phone && !isAuthenticated && (
          <button 
            type="button" 
            onClick={clearPhone} 
            style={{ 
              position: 'absolute', 
              right: '10px', 
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
              transition: 'all 0.3s ease' 
            }} 
            onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'rgba(221, 216, 132, 0.2)'; }} 
            onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; }}
          >
            <Trash2 size={14} color="#DDDA84" />
          </button>
        )}
      </div>
      
      <input 
        type="email" 
        placeholder="Email *" 
        value={formData.email} 
        onChange={(e) => setFormData({ ...formData, email: e.target.value })} 
        disabled={isAuthenticated} 
        style={{ 
          width: '100%', 
          padding: isMobile ? '10px 12px' : '12px 14px', 
          backgroundColor: isAuthenticated ? '#2a2a2a' : '#191B1B', 
          border: '1px solid rgba(221, 216, 132, 0.3)', 
          borderRadius: '8px', 
          color: '#E8FFFB', 
          fontFamily: 'var(--font-jura), Jura, sans-serif', 
          fontSize: isMobile ? '12px' : '13px', 
          outline: 'none', 
          transition: 'all 0.3s ease', 
          opacity: isAuthenticated ? 0.7 : 1 
        }} 
        required 
      />
      
      {/* Добавлено поле "Адрес" */}
      <input 
        type="text" 
        placeholder="Адрес *" 
        value={formData.address || ''} 
        onChange={(e) => setFormData({ ...formData, address: e.target.value })} 
        style={{ 
          width: '100%', 
          padding: isMobile ? '10px 12px' : '12px 14px', 
          backgroundColor: '#191B1B', 
          border: '1px solid rgba(221, 216, 132, 0.3)', 
          borderRadius: '8px', 
          color: '#E8FFFB', 
          fontFamily: 'var(--font-jura), Jura, sans-serif', 
          fontSize: isMobile ? '12px' : '13px', 
          outline: 'none', 
          transition: 'all 0.3s ease', 
        }} 
        required 
      />
      
      <textarea 
        placeholder="Комментарий к заказу" 
        value={formData.comment} 
        onChange={(e) => setFormData({ ...formData, comment: e.target.value })} 
        rows={2} 
        style={{ 
          width: '100%', 
          padding: isMobile ? '10px 12px' : '12px 14px', 
          backgroundColor: '#191B1B', 
          border: '1px solid rgba(221, 216, 132, 0.3)', 
          borderRadius: '8px', 
          color: '#E8FFFB', 
          fontFamily: 'var(--font-jura), Jura, sans-serif', 
          fontSize: isMobile ? '12px' : '13px', 
          outline: 'none', 
          transition: 'all 0.3s ease', 
          resize: 'vertical' 
        }} 
      />
      
      <div>
        <p style={{ color: '#E8FFFB', fontFamily: 'var(--font-jura), Jura, sans-serif', fontSize: isMobile ? '11px' : '12px', marginBottom: '8px' }}>Удобный способ связи *</p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '6px' }}>
          {contactMethods.map(method => (
            <button 
              key={method.id} 
              type="button" 
              onClick={() => setFormData({ ...formData, contactMethod: method.id })} 
              style={{ 
                padding: isMobile ? '8px' : '10px', 
                backgroundColor: formData.contactMethod === method.id ? 'rgba(221, 216, 132, 0.15)' : 'transparent', 
                border: `2px solid ${formData.contactMethod === method.id ? '#DDDA84' : 'rgba(221, 216, 132, 0.3)'}`, 
                borderRadius: '8px', 
                cursor: 'pointer', 
                transition: 'all 0.3s ease', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center', 
                gap: '4px' 
              }}
            >
              <method.icon style={{ width: isMobile ? '12px' : '14px', height: isMobile ? '12px' : '14px', color: '#DDDA84' }} />
              <span style={{ color: '#E8FFFB', fontFamily: 'var(--font-jura), Jura, sans-serif', fontSize: isMobile ? '10px' : '11px' }}>{method.name}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );

case 7:
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: isMobile ? '10px' : '14px' }}>
      {/* Блок ошибок вверху */}
      {(emailError || limitError) && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '20px' }}>
          {emailError && (
            <div className="error-message" style={{ backgroundColor: 'rgba(231, 76, 60, 0.1)', border: '1px solid #e74c3c', borderRadius: '8px', padding: '12px' }}>
              <p style={{ color: '#e74c3c', fontFamily: 'var(--font-jura), Jura, sans-serif', fontSize: '13px', margin: 0, textAlign: 'center' }}>{emailError}</p>
            </div>
          )}
          {limitError && (
            <div className="error-message" style={{ backgroundColor: 'rgba(231, 76, 60, 0.1)', border: '1px solid #e74c3c', borderRadius: '8px', padding: '12px' }}>
              <p style={{ color: '#e74c3c', fontFamily: 'var(--font-jura), Jura, sans-serif', fontSize: '13px', margin: 0, textAlign: 'center' }}>{limitError}</p>
            </div>
          )}
        </div>
      )}
      
      <h4 style={{ fontFamily: 'var(--font-poiret-one), Poiret One, cursive', color: '#DDDA84', fontSize: isMobile ? (orientation === 'landscape' ? '14px' : '16px') : '22px', margin: 0 }}>Подтверждение заявки</h4>
      <div style={{ backgroundColor: '#191B1B', borderRadius: '12px', padding: isMobile ? '12px' : '16px', display: 'flex', flexDirection: 'column', gap: isMobile ? '6px' : '8px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '4px', borderBottom: '1px solid rgba(221, 216, 132, 0.2)' }}><span style={{ color: '#E8FFFB', opacity: 0.6, fontFamily: 'var(--font-jura), Jura, sans-serif', fontSize: isMobile ? '11px' : '12px' }}>Дата:</span><span style={{ color: '#DDDA84', fontFamily: 'var(--font-jura), Jura, sans-serif', fontSize: isMobile ? '11px' : '12px', fontWeight: 'bold' }}>{selectedDate ? new Date(selectedDate).toLocaleDateString('ru') : 'Не выбрана'}</span></div>
        <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '4px', borderBottom: '1px solid rgba(221, 216, 132, 0.2)' }}><span style={{ color: '#E8FFFB', opacity: 0.6, fontFamily: 'var(--font-jura), Jura, sans-serif', fontSize: isMobile ? '11px' : '12px' }}>Решение:</span><span style={{ color: '#DDDA84', fontFamily: 'var(--font-jura), Jura, sans-serif', fontSize: isMobile ? '11px' : '12px', fontWeight: 'bold' }}>{solutions.find(s => s.id === formData.solution)?.name || 'Не выбрано'}</span></div>
        <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '4px', borderBottom: '1px solid rgba(221, 216, 132, 0.2)' }}><span style={{ color: '#E8FFFB', opacity: 0.6, fontFamily: 'var(--font-jura), Jura, sans-serif', fontSize: isMobile ? '11px' : '12px' }}>Помещение:</span><span style={{ color: '#DDDA84', fontFamily: 'var(--font-jura), Jura, sans-serif', fontSize: isMobile ? '11px' : '12px', fontWeight: 'bold' }}>{rooms.find(r => r.id === formData.room)?.name || 'Не выбрано'}</span></div>
        <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '4px', borderBottom: '1px solid rgba(221, 216, 132, 0.2)' }}><span style={{ color: '#E8FFFB', opacity: 0.6, fontFamily: 'var(--font-jura), Jura, sans-serif', fontSize: isMobile ? '11px' : '12px' }}>Вид стекла:</span><span style={{ color: '#DDDA84', fontFamily: 'var(--font-jura), Jura, sans-serif', fontSize: isMobile ? '11px' : '12px', fontWeight: 'bold' }}>{glassTypes.find(g => g.id === formData.glassType)?.name || 'Не выбрано'}</span></div>
        <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '4px', borderBottom: '1px solid rgba(221, 216, 132, 0.2)' }}><span style={{ color: '#E8FFFB', opacity: 0.6, fontFamily: 'var(--font-jura), Jura, sans-serif', fontSize: isMobile ? '11px' : '12px' }}>Цвет фурнитуры:</span><span style={{ color: '#DDDA84', fontFamily: 'var(--font-jura), Jura, sans-serif', fontSize: isMobile ? '11px' : '12px', fontWeight: 'bold' }}>{hardwareColors.find(c => c.id === formData.hardwareColor)?.name || 'Не выбрано'}</span></div>
        <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '4px', borderBottom: '1px solid rgba(221, 216, 132, 0.2)' }}><span style={{ color: '#E8FFFB', opacity: 0.6, fontFamily: 'var(--font-jura), Jura, sans-serif', fontSize: isMobile ? '11px' : '12px' }}>Email:</span><span style={{ color: '#DDDA84', fontFamily: 'var(--font-jura), Jura, sans-serif', fontSize: isMobile ? '11px' : '12px', fontWeight: 'bold' }}>{formData.email || 'Не указан'}</span></div>
        <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '4px', borderBottom: '1px solid rgba(221, 216, 132, 0.2)' }}><span style={{ color: '#E8FFFB', opacity: 0.6, fontFamily: 'var(--font-jura), Jura, sans-serif', fontSize: isMobile ? '11px' : '12px' }}>Клиент:</span><span style={{ color: '#DDDA84', fontFamily: 'var(--font-jura), Jura, sans-serif', fontSize: isMobile ? '11px' : '12px', fontWeight: 'bold' }}>{formData.name || 'Не указано'}</span></div>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: '#E8FFFB', opacity: 0.6, fontFamily: 'var(--font-jura), Jura, sans-serif', fontSize: isMobile ? '11px' : '12px' }}>Телефон:</span><span style={{ color: '#DDDA84', fontFamily: 'var(--font-jura), Jura, sans-serif', fontSize: isMobile ? '11px' : '12px', fontWeight: 'bold' }}>{formData.phone || 'Не указан'}</span></div>
      </div>
      <p style={{ color: '#E8FFFB', opacity: 0.5, fontSize: isMobile ? '9px' : '10px', fontFamily: 'var(--font-jura), Jura, sans-serif', textAlign: 'center', margin: 0 }}>Нажимая «Отправить заявку», вы соглашаетесь с обработкой персональных данных</p>
    </div>
  );
      default: return null;
    }
  };

  return (
    <>
      {/* Модальное окно с паролем */}
      {showPasswordModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 1000000, display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(0, 0, 0, 0.9)', backdropFilter: 'blur(8px)' }} onClick={handleOverlayClick}>
          <div style={{ 
            position: 'relative', 
            width: '100%', 
            maxWidth: orientation === 'landscape' && isMobile ? '80%' : '650px',
            height: 'auto',
            maxHeight: orientation === 'landscape' && isMobile ? '90vh' : (isMobile ? '85vh' : '85vh'),
            minHeight: orientation === 'landscape' && isMobile ? 'auto' : (isMobile ? '450px' : '550px'),
            backgroundColor: '#111314', 
            borderRadius: '20px', 
            border: '1px solid rgba(221, 216, 132, 0.3)', 
            boxShadow: '0 20px 40px rgba(0, 0, 0, 0.5)', 
            animation: 'scaleIn 0.3s ease-out', 
            display: 'flex', 
            flexDirection: 'column', 
            overflow: 'hidden' 
          }} onClick={(e) => e.stopPropagation()}>
            <div style={{ width: '50px', height: '50px', borderRadius: '50%', backgroundColor: 'rgba(221, 216, 132, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}><Check style={{ width: '24px', height: '24px', color: '#DDDA84' }} /></div>
            <h3 style={{ fontFamily: 'var(--font-poiret-one), Poiret One, cursive', color: '#DDDA84', fontSize: '20px', marginBottom: '12px' }}>Аккаунт создан!</h3>
            <p style={{ fontFamily: 'var(--font-jura), Jura, sans-serif', color: '#E8FFFB', fontSize: '13px', marginBottom: '16px' }}>Ваш пароль для входа в личный кабинет:</p>
            <div style={{ backgroundColor: '#191B1B', border: '1px solid rgba(221, 216, 132, 0.3)', borderRadius: '10px', padding: '10px', marginBottom: '16px' }}><code style={{ fontFamily: 'monospace', color: '#DDDA84', fontSize: '16px', fontWeight: 'bold', letterSpacing: '1px' }}>{generatedPassword}</code></div>
            <p style={{ fontFamily: 'var(--font-jura), Jura, sans-serif', color: '#E8FFFB', fontSize: '11px', opacity: 0.7, marginBottom: '20px' }}>Вы сможете изменить пароль в личном кабинете после входа</p>
            <button onClick={closePasswordModalAndFinish} style={{ width: '100%', padding: '12px', backgroundColor: '#DDDA84', border: 'none', borderRadius: '10px', color: '#111314', fontFamily: 'var(--font-jura), Jura, sans-serif', fontSize: '14px', fontWeight: 'bold', cursor: 'pointer', transition: 'all 0.3s ease' }} onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#E8FFFB'; }} onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#DDDA84'; }}>Продолжить</button>
          </div>
        </div>
      )}

      {/* Основное модальное окно заявки */}
      <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 999999, display: 'flex', alignItems: 'center', justifyContent: 'center', animation: 'fadeIn 0.3s ease-out', padding: orientation === 'landscape' && isMobile ? '8px' : '16px' }} onClick={handleOverlayClick}>
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0, 0, 0, 0.85)', backdropFilter: 'blur(8px)' }} />
        
        <div style={{ 
          position: 'relative', 
          width: '100%', 
          maxWidth: orientation === 'landscape' && isMobile ? '80%' : '650px',
          height: 'auto',
          maxHeight: orientation === 'landscape' && isMobile ? '90vh' : (isMobile ? '85vh' : '85vh'),
          minHeight: orientation === 'landscape' && isMobile ? 'auto' : (isMobile ? '450px' : '550px'),
          backgroundColor: '#111314', 
          borderRadius: '20px', 
          border: '1px solid rgba(221, 216, 132, 0.3)', 
          boxShadow: '0 20px 40px rgba(0, 0, 0, 0.5)', 
          animation: 'scaleIn 0.3s ease-out', 
          display: 'flex', 
          flexDirection: 'column', 
          overflow: 'hidden' 
        }} onClick={(e) => e.stopPropagation()}>
          
          {/* Header */}
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'space-between', 
            padding: (orientation === 'landscape' && isMobile) ? '8px 12px' : (isMobile ? '14px 16px' : '20px 24px'),
            borderBottom: '1px solid rgba(221, 216, 132, 0.2)', 
            backgroundColor: 'rgba(17, 19, 20, 0.95)', 
            flexShrink: 0 
          }}>
            <div style={{ flex: 1 }}>
              <h3 style={{ 
                fontFamily: 'var(--font-poiret-one), Poiret One, cursive', 
                fontSize: (orientation === 'landscape' && isMobile) ? '16px' : (isMobile ? '20px' : '28px'),
                fontWeight: '300', 
                color: '#DDDA84', 
                margin: 0 
              }}>
                Оставить заявку
              </h3>
              <div style={{ display: 'flex', gap: '2px', marginTop: (orientation === 'landscape' && isMobile) ? '4px' : (isMobile ? '6px' : '8px') }}>
                {[1, 2, 3, 4, 5, 6, 7].map(s => (<div key={s} style={{ flex: 1, height: '2px', backgroundColor: s <= step ? '#DDDA84' : 'rgba(221, 216, 132, 0.2)', borderRadius: '2px', transition: 'all 0.3s ease' }} />))}
              </div>
            </div>
            <button 
              onClick={onClose} 
              style={{ 
                width: (orientation === 'landscape' && isMobile) ? '24px' : (isMobile ? '28px' : '36px'),
                height: (orientation === 'landscape' && isMobile) ? '24px' : (isMobile ? '28px' : '36px'),
                borderRadius: '50%', 
                backgroundColor: 'rgba(221, 216, 132, 0.1)', 
                border: '1px solid rgba(221, 216, 132, 0.3)', 
                cursor: 'pointer', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center', 
                transition: 'all 0.3s ease', 
                marginLeft: '10px', 
                flexShrink: 0 
              }} 
              onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'rgba(221, 216, 132, 0.2)'; e.currentTarget.style.transform = 'scale(1.1)'; }} 
              onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'rgba(221, 216, 132, 0.1)'; e.currentTarget.style.transform = 'scale(1)'; }}
            >
              <X size={(orientation === 'landscape' && isMobile) ? 12 : (isMobile ? 14 : 20)} color="#DDDA84" />
            </button>
          </div>

          {/* Content */}
          <div 
            ref={modalContentRef}
            style={{ 
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              overflowY: 'auto',
              padding: (orientation === 'landscape' && isMobile) ? '8px' : (isMobile ? '16px' : '20px'),
              minHeight: 0,
            }}
          >
            {submitted && !showPasswordModal ? (
              <div style={{ textAlign: 'center', padding: isMobile ? '20px 16px' : '30px 20px' }}>
                <div style={{ width: isMobile ? '45px' : '50px', height: isMobile ? '45px' : '50px', borderRadius: '50%', backgroundColor: 'rgba(221, 216, 132, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}><Check style={{ width: isMobile ? '22px' : '24px', height: isMobile ? '22px' : '24px', color: '#DDDA84' }} /></div>
                <p style={{ color: '#DDDA84', fontFamily: 'var(--font-jura), Jura, sans-serif', fontSize: isMobile ? '15px' : '16px', marginBottom: '6px' }}>Заявка отправлена!</p>
                <p style={{ color: '#E8FFFB', opacity: 0.6, fontFamily: 'var(--font-jura), Jura, sans-serif', fontSize: isMobile ? '11px' : '12px', marginBottom: '20px' }}>Мы свяжемся с вами в ближайшее время</p>
                <button onClick={handleNewOrder} style={{ padding: isMobile ? '8px 16px' : '10px 20px', backgroundColor: 'transparent', border: '2px solid #DDDA84', borderRadius: '8px', color: '#DDDA84', fontFamily: 'var(--font-jura), Jura, sans-serif', fontSize: isMobile ? '13px' : '14px', fontWeight: 'bold', cursor: 'pointer', transition: 'all 0.3s ease' }} onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#DDDA84'; e.currentTarget.style.color = '#111314'; }} onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = '#DDDA84'; }}>Сделать еще один заказ</button>
              </div>
            ) : (
              <form 
                onSubmit={step === 7 ? handleSubmit : (e) => { e.preventDefault(); if (isStepValid()) nextStep(); }}
                style={{ 
                  display: 'flex', 
                  flexDirection: 'column', 
                  height: '100%',
                  flex: 1,
                  minHeight: 0,
                }}
              >
                <div style={{ flex: 1 }}>
                 
                  {renderStep()}
                </div>
                
                {/* Navigation Buttons - прижаты к низу */}
                <div style={{ 
                  display: 'flex', 
                  gap: step > 1 ? '10px' : '0px',
                  marginTop: '20px',
                  paddingTop: isMobile ? '16px' : '20px',
                  flexShrink: 0,
                }}>
                  <button
                    type="button"
                    onClick={prevStep}
                    style={{
                      width: step > 1 ? '50%' : '0%',
                      padding: step > 1 ? (isMobile ? '10px' : (orientation === 'landscape' ? '12px' : '14px')) : '0',
                      backgroundColor: 'transparent',
                      border: step > 1 ? '2px solid rgba(221, 216, 132, 0.3)' : 'none',
                      borderRadius: '10px',
                      color: '#DDDA84',
                      fontFamily: 'var(--font-jura), Jura, sans-serif',
                      fontSize: step > 1 ? (isMobile ? '14px' : (orientation === 'landscape' ? '15px' : '18px')) : '0',
                      fontWeight: 'bold',
                      textAlign: 'center',
                      cursor: step > 1 ? 'pointer' : 'default',
                      transition: 'all 0.3s ease',
                      opacity: step > 1 ? 1 : 0,
                      pointerEvents: step > 1 ? 'auto' : 'none',
                      overflow: 'hidden',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    Назад
                  </button>
                  <button
                    type="submit"
                    disabled={!isStepValid()}
                    style={{
                      width: step > 1 ? '50%' : '100%',
                      padding: isMobile ? '10px' : (orientation === 'landscape' ? '12px' : '14px'),
                      backgroundColor: '#DDDA84',
                      border: 'none',
                      borderRadius: '10px',
                      color: '#111314',
                      fontFamily: 'var(--font-jura), Jura, sans-serif',
                      fontSize: isMobile ? '14px' : (orientation === 'landscape' ? '15px' : '18px'),
                      fontWeight: 'bold',
                      textAlign: 'center',
                      cursor: isStepValid() ? 'pointer' : 'not-allowed',
                      transition: 'all 0.3s ease',
                      opacity: isStepValid() ? 1 : 0.5,
                    }}
                  >
                    {step === 7 ? 'Отправить' : 'Далее'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>

      <style>{`
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes scaleIn { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }
        .email-error-message { scroll-margin-top: 100px; }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </>
  );
}