//AuthModal.tsx
'use client';

import { useState } from 'react';
import { X } from 'lucide-react';
import { useAuth } from '@/contexts';
import { db } from '@/lib/firebase';
import { doc, setDoc } from 'firebase/firestore';
import { sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import BanModal from './BanModal';


interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export default function AuthModal({ isOpen, onClose, onSuccess }: AuthModalProps) {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showResetPassword, setShowResetPassword] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetMessage, setResetMessage] = useState('');
  const { isBanned, banInfo } = useAuth();

  
  const { login, register } = useAuth();

  // Исправленная функция для маски телефона
  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value;
    
    // Если пользователь удаляет символы, обрабатываем правильно
    if (value.length < phone.length) {
      // Удаляем только цифры, маска обновляется автоматически
      const digits = value.replace(/\D/g, '');
      setPhone(formatPhoneNumber(digits));
      return;
    }
    
    // Извлекаем только цифры
    const digits = value.replace(/\D/g, '');
    
    // Ограничиваем 11 цифрами (включая 7)
    const limitedDigits = digits.slice(0, 11);
    
    setPhone(formatPhoneNumber(limitedDigits));
  };

  const formatPhoneNumber = (digits: string): string => {
    if (digits.length === 0) return '';
    
    let formatted = '+7';
    
    if (digits.length > 1) {
      formatted += ` (${digits.substring(1, 4)}`;
    }
    if (digits.length >= 4) {
      formatted += `) ${digits.substring(4, 7)}`;
    }
    if (digits.length >= 7) {
      formatted += `-${digits.substring(7, 9)}`;
    }
    if (digits.length >= 9) {
      formatted += `-${digits.substring(9, 11)}`;
    }
    
    return formatted.trim();
  };

  // Валидация пароля
  const isValidPassword = (password: string): { isValid: boolean; message: string } => {
    if (password.length < 6) {
      return { isValid: false, message: 'Пароль должен содержать не менее 6 символов' };
    }
    if (!/[A-Z]/.test(password)) {
      return { isValid: false, message: 'Пароль должен содержать хотя бы одну заглавную букву' };
    }
    if (!/[a-z]/.test(password)) {
      return { isValid: false, message: 'Пароль должен содержать хотя бы одну строчную букву' };
    }
    if (!/[0-9]/.test(password)) {
      return { isValid: false, message: 'Пароль должен содержать хотя бы одну цифру' };
    }
    if (!/^[A-Za-z0-9]+$/.test(password)) {
      return { isValid: false, message: 'Пароль должен содержать только латинские буквы и цифры' };
    }
    return { isValid: true, message: '' };
  };

  // Валидация email
  const isValidEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@([^\s@.,]+\.)+[^\s@.,]{2,}$/;
    return emailRegex.test(email);
  };

  // Валидация имени
  const isValidName = (name: string): boolean => {
    return name.length >= 2 && name.length <= 50 && /^[a-zA-Zа-яА-Я\s-]+$/.test(name);
  };

  // Валидация телефона
  const isValidPhone = (phone: string): boolean => {
    if (!phone) return true;
    const digits = phone.replace(/\D/g, '');
    return digits.length === 11;
  };

  // Обработка восстановления пароля
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setResetMessage('');
    
    if (!isValidEmail(resetEmail)) {
      setError('Введите корректный email адрес');
      return;
    }
    
    setLoading(true);
    
    try {
      await sendPasswordResetEmail(auth, resetEmail);
      setResetMessage('Инструкция по восстановлению пароля отправлена на ваш email');
      setTimeout(() => {
        setShowResetPassword(false);
        setResetEmail('');
        setResetMessage('');
      }, 3000);
    } catch (err: any) {
      if (err.code === 'auth/user-not-found') {
        setError('Пользователь с таким email не найден');
      } else {
        setError('Ошибка при отправке письма. Попробуйте позже.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    const sanitizedEmail = email.toLowerCase().trim();
    const sanitizedName = name.trim();
    const sanitizedPhone = phone;
    
    if (!isValidEmail(sanitizedEmail)) {
      setError('Введите корректный email адрес');
      return;
    }
    
    if (!isLogin) {
      if (!isValidName(sanitizedName)) {
        setError('Имя должно содержать от 2 до 50 символов (только буквы, пробелы и дефисы)');
        return;
      }
      
      const passwordValidation = isValidPassword(password);
      if (!passwordValidation.isValid) {
        setError(passwordValidation.message);
        return;
      }
      
      if (!isValidPhone(sanitizedPhone)) {
        setError('Введите корректный номер телефона (11 цифр)');
        return;
      }
    }
    
    setLoading(true);

    try {
      if (isLogin) {
        await login(sanitizedEmail, password);
      } else {
        const user = await register(sanitizedEmail, password, sanitizedName);
        
        const now = new Date().toISOString();
        await setDoc(doc(db, 'clients', user.uid), {
          fullName: sanitizedName,
          email: sanitizedEmail,
          phone: sanitizedPhone || '',
          createdAt: now,
          updatedAt: now,
          ordersCount: 0,
          isFavorite: false,
        });
      }
      
      onClose();
      onSuccess?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка авторизации');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;
// Если пользователь забанен, показываем сообщение
if (isBanned && banInfo) {
  return (
    <BanModal
      isOpen={true}
      onClose={() => {
        // Закрываем модальное окно и очищаем состояние
        onClose();
      }}
      banInfo={banInfo}
    />
  );
}
  // Форма восстановления пароля
  if (showResetPassword) {
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
          onClick={() => {
            setShowResetPassword(false);
            setResetEmail('');
            setResetMessage('');
            setError('');
          }}
        />
        
        <div
          style={{
            position: 'relative',
            width: '90%',
            maxWidth: '450px',
            backgroundColor: '#111314',
            borderRadius: '24px',
            border: '1px solid rgba(221, 216, 132, 0.3)',
            boxShadow: '0 20px 40px rgba(0, 0, 0, 0.5)',
            animation: 'scaleIn 0.3s ease-out',
            overflow: 'hidden',
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '20px 24px',
              borderBottom: '1px solid rgba(221, 216, 132, 0.2)',
              backgroundColor: 'rgba(17, 19, 20, 0.95)',
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
              Восстановление пароля
            </h3>
            <button
              onClick={() => {
                setShowResetPassword(false);
                setResetEmail('');
                setResetMessage('');
                setError('');
              }}
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
            >
              <X size={18} color="#DDDA84" />
            </button>
          </div>
          
          <form onSubmit={handleResetPassword} style={{ padding: '28px 24px 32px' }}>
            <div style={{ marginBottom: '20px' }}>
              <input
                type="email"
                placeholder="Введите ваш email"
                value={resetEmail}
                onChange={(e) => setResetEmail(e.target.value)}
                style={{
                  width: '100%',
                  padding: '14px 16px',
                  backgroundColor: '#191B1B',
                  border: '1px solid rgba(221, 216, 132, 0.2)',
                  borderRadius: '12px',
                  color: '#E8FFFB',
                  fontFamily: 'var(--font-jura), Jura, sans-serif',
                  fontSize: '15px',
                  outline: 'none',
                  transition: 'all 0.3s ease',
                }}
                required
              />
            </div>
            
            {resetMessage && (
              <div
                style={{
                  backgroundColor: 'rgba(46, 204, 113, 0.1)',
                  border: '1px solid rgba(46, 204, 113, 0.3)',
                  borderRadius: '8px',
                  padding: '10px',
                  marginBottom: '20px',
                }}
              >
                <p
                  style={{
                    color: '#2ecc71',
                    fontFamily: 'var(--font-jura), Jura, sans-serif',
                    fontSize: '13px',
                    margin: 0,
                    textAlign: 'center',
                  }}
                >
                  {resetMessage}
                </p>
              </div>
            )}
            
            {error && (
              <div
                style={{
                  backgroundColor: 'rgba(255, 0, 0, 0.1)',
                  border: '1px solid rgba(255, 0, 0, 0.3)',
                  borderRadius: '8px',
                  padding: '10px',
                  marginBottom: '20px',
                }}
              >
                <p
                  style={{
                    color: '#ff6b6b',
                    fontFamily: 'var(--font-jura), Jura, sans-serif',
                    fontSize: '13px',
                    margin: 0,
                    textAlign: 'center',
                  }}
                >
                  {error}
                </p>
              </div>
            )}
            
            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%',
                padding: '14px',
                backgroundColor: '#DDDA84',
                border: 'none',
                borderRadius: '12px',
                color: '#111314',
                fontFamily: 'var(--font-jura), Jura, sans-serif',
                fontSize: '16px',
                fontWeight: 'bold',
                cursor: loading ? 'not-allowed' : 'pointer',
                transition: 'all 0.3s ease',
                opacity: loading ? 0.6 : 1,
              }}
            >
              {loading ? 'Отправка...' : 'Отправить инструкцию'}
            </button>
            
            <div style={{ textAlign: 'center', marginTop: '20px' }}>
              <button
                type="button"
                onClick={() => {
                  setShowResetPassword(false);
                  setResetEmail('');
                  setResetMessage('');
                  setError('');
                }}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: 'rgba(232, 255, 251, 0.6)',
                  fontFamily: 'var(--font-jura), Jura, sans-serif',
                  fontSize: '14px',
                  transition: 'all 0.3s ease',
                }}
              >
                Вернуться к входу
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

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
          maxWidth: '450px',
          backgroundColor: '#111314',
          borderRadius: '24px',
          border: '1px solid rgba(221, 216, 132, 0.3)',
          boxShadow: '0 20px 40px rgba(0, 0, 0, 0.5)',
          animation: 'scaleIn 0.3s ease-out',
          overflow: 'hidden',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '20px 24px',
            borderBottom: '1px solid rgba(221, 216, 132, 0.2)',
            backgroundColor: 'rgba(17, 19, 20, 0.95)',
          }}
        >
          <h3
            style={{
              fontFamily: 'var(--font-poiret-one), Poiret One, cursive',
              fontSize: '28px',
              fontWeight: '300',
              color: '#DDDA84',
              margin: 0,
            }}
          >
            {isLogin ? 'Вход' : 'Регистрация'}
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

        <form onSubmit={handleSubmit} style={{ padding: '28px 24px 32px' }}>
          {!isLogin && (
            <>
              <div style={{ marginBottom: '20px' }}>
                <input
                  type="text"
                  placeholder="Ваше имя"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  maxLength={50}
                  style={{
                    width: '100%',
                    padding: '14px 16px',
                    backgroundColor: '#191B1B',
                    border: '1px solid rgba(221, 216, 132, 0.2)',
                    borderRadius: '12px',
                    color: '#E8FFFB',
                    fontFamily: 'var(--font-jura), Jura, sans-serif',
                    fontSize: '15px',
                    outline: 'none',
                    transition: 'all 0.3s ease',
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = '#DDDA84';
                    e.currentTarget.style.backgroundColor = '#1f2223';
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = 'rgba(221, 216, 132, 0.2)';
                    e.currentTarget.style.backgroundColor = '#191B1B';
                  }}
                  required
                />
              </div>
              
              <div style={{ marginBottom: '20px' }}>
                <input
                  type="tel"
                  placeholder="+7 (***) ***-**-**"
                  value={phone}
                  onChange={handlePhoneChange}
                  style={{
                    width: '100%',
                    padding: '14px 16px',
                    backgroundColor: '#191B1B',
                    border: '1px solid rgba(221, 216, 132, 0.2)',
                    borderRadius: '12px',
                    color: '#E8FFFB',
                    fontFamily: 'var(--font-jura), Jura, sans-serif',
                    fontSize: '15px',
                    outline: 'none',
                    transition: 'all 0.3s ease',
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = '#DDDA84';
                    e.currentTarget.style.backgroundColor = '#1f2223';
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = 'rgba(221, 216, 132, 0.2)';
                    e.currentTarget.style.backgroundColor = '#191B1B';
                  }}
                />
              </div>
            </>
          )}
          
          <div style={{ marginBottom: '20px' }}>
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              maxLength={100}
              style={{
                width: '100%',
                padding: '14px 16px',
                backgroundColor: '#191B1B',
                border: '1px solid rgba(221, 216, 132, 0.2)',
                borderRadius: '12px',
                color: '#E8FFFB',
                fontFamily: 'var(--font-jura), Jura, sans-serif',
                fontSize: '15px',
                outline: 'none',
                transition: 'all 0.3s ease',
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = '#DDDA84';
                e.currentTarget.style.backgroundColor = '#1f2223';
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = 'rgba(221, 216, 132, 0.2)';
                e.currentTarget.style.backgroundColor = '#191B1B';
              }}
              required
            />
          </div>
          
          <div style={{ marginBottom: '16px' }}>
            <input
              type="password"
              placeholder="Пароль"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              maxLength={100}
              style={{
                width: '100%',
                padding: '14px 16px',
                backgroundColor: '#191B1B',
                border: '1px solid rgba(221, 216, 132, 0.2)',
                borderRadius: '12px',
                color: '#E8FFFB',
                fontFamily: 'var(--font-jura), Jura, sans-serif',
                fontSize: '15px',
                outline: 'none',
                transition: 'all 0.3s ease',
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = '#DDDA84';
                e.currentTarget.style.backgroundColor = '#1f2223';
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = 'rgba(221, 216, 132, 0.2)';
                e.currentTarget.style.backgroundColor = '#191B1B';
              }}
              required
            />
          </div>

          {isLogin && (
            <div style={{ textAlign: 'right', marginBottom: '24px' }}>
              <button
                type="button"
                onClick={() => setShowResetPassword(true)}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: 'rgba(221, 216, 132, 0.6)',
                  fontFamily: 'var(--font-jura), Jura, sans-serif',
                  fontSize: '13px',
                  transition: 'all 0.3s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = '#DDDA84';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = 'rgba(221, 216, 132, 0.6)';
                }}
              >
                Забыли пароль?
              </button>
            </div>
          )}

          {error && (
            <div
              style={{
                backgroundColor: 'rgba(255, 0, 0, 0.1)',
                border: '1px solid rgba(255, 0, 0, 0.3)',
                borderRadius: '8px',
                padding: '10px',
                marginBottom: '20px',
              }}
            >
              <p
                style={{
                  color: '#ff6b6b',
                  fontFamily: 'var(--font-jura), Jura, sans-serif',
                  fontSize: '13px',
                  margin: 0,
                  textAlign: 'center',
                }}
              >
                {error}
              </p>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              padding: '14px',
              backgroundColor: '#DDDA84',
              border: 'none',
              borderRadius: '12px',
              color: '#111314',
              fontFamily: 'var(--font-jura), Jura, sans-serif',
              fontSize: '16px',
              fontWeight: 'bold',
              cursor: loading ? 'not-allowed' : 'pointer',
              transition: 'all 0.3s ease',
              opacity: loading ? 0.6 : 1,
            }}
            onMouseEnter={(e) => {
              if (!loading) {
                e.currentTarget.style.backgroundColor = '#E8FFFB';
                e.currentTarget.style.transform = 'translateY(-2px)';
              }
            }}
            onMouseLeave={(e) => {
              if (!loading) {
                e.currentTarget.style.backgroundColor = '#DDDA84';
                e.currentTarget.style.transform = 'translateY(0)';
              }
            }}
          >
            {loading ? 'Загрузка...' : (isLogin ? 'Войти' : 'Зарегистрироваться')}
          </button>

          <div style={{ textAlign: 'center', marginTop: '20px' }}>
            <button
              type="button"
              onClick={() => {
                setIsLogin(!isLogin);
                setError('');
                setName('');
                setPhone('');
                setEmail('');
                setPassword('');
              }}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: 'rgba(232, 255, 251, 0.6)',
                fontFamily: 'var(--font-jura), Jura, sans-serif',
                fontSize: '14px',
                transition: 'all 0.3s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = '#DDDA84';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = 'rgba(232, 255, 251, 0.6)';
              }}
            >
              {isLogin ? 'Нет аккаунта? Зарегистрироваться' : 'Уже есть аккаунт? Войти'}
            </button>
          </div>
        </form>
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes scaleIn {
          from {
            opacity: 0;
            transform: scale(0.95);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
      `}</style>
    </div>
  );
}