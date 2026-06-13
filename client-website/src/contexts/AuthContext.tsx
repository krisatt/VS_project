//AuthContext.tsx
'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { 
  auth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile,
  signOut,
  onAuthStateChanged
} from '@/lib/firebase';
import { db } from '@/lib/firebase';
import { doc, getDoc, collection, query, where, getDocs, setDoc } from 'firebase/firestore';
import { User } from 'firebase/auth';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string) => Promise<User>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
  isBanned: boolean;
  banInfo: { reason: string; date: string; phone: string } | null;
  checkBanStatus: (email: string, phone?: string) => Promise<{ isBanned: boolean; banInfo: any }>;
  checkOrdersLimit: (userId: string) => Promise<{ canOrder: boolean; currentCount: number; maxLimit: number }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isBanned, setIsBanned] = useState(false);
  const [banInfo, setBanInfo] = useState<{ reason: string; date: string; phone: string } | null>(null);
  const MAX_ORDERS_PER_MONTH = 5;

  // Функция проверки черного списка
  const checkBanStatus = async (email: string, phone?: string) => {
    try {
      const blacklistRef = collection(db, 'blacklist');
      
      let q = query(blacklistRef, where('email', '==', email));
      let querySnapshot = await getDocs(q);
      
      if (querySnapshot.empty && phone) {
        q = query(blacklistRef, where('phone', '==', phone));
        querySnapshot = await getDocs(q);
      }
      
      if (!querySnapshot.empty) {
        const banData = querySnapshot.docs[0].data();
        return {
          isBanned: true,
          banInfo: {
            reason: banData.banReason,
            date: banData.banDate,
            phone: banData.phone || '',
          }
        };
      }
      
      return { isBanned: false, banInfo: null };
    } catch (error) {
      console.error('Ошибка проверки черного списка:', error);
      return { isBanned: false, banInfo: null };
    }
  };

  // Функция проверки лимита заказов в месяц
const checkOrdersLimit = async (userId: string): Promise<{ canOrder: boolean; currentCount: number; maxLimit: number }> => {
  try {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
    
    const ordersRef = collection(db, 'orders');
    const q = query(
      ordersRef,
      where('clientId', '==', userId)
    );
    
    const querySnapshot = await getDocs(q);
    
    // Фильтруем по дате вручную, так как Firestore не всегда корректно сравнивает ISO строки
    let currentCount = 0;
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      const createdAt = new Date(data.createdAt);
      if (createdAt >= startOfMonth && createdAt <= endOfMonth) {
        currentCount++;
      }
    });
    
    console.log(`Пользователь ${userId} сделал ${currentCount} заказов в этом месяце`); // Для отладки
    
    return {
      canOrder: currentCount < MAX_ORDERS_PER_MONTH,
      currentCount,
      maxLimit: MAX_ORDERS_PER_MONTH
    };
  } catch (error) {
    console.error('Ошибка проверки лимита заказов:', error);
    return { canOrder: true, currentCount: 0, maxLimit: MAX_ORDERS_PER_MONTH };
  }
};

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const userEmail = user.email || '';
        const { isBanned: banned, banInfo: info } = await checkBanStatus(userEmail);
        
        if (banned) {
          setIsBanned(true);
          setBanInfo(info);
          await signOut(auth);
          setUser(null);
        } else {
          setIsBanned(false);
          setBanInfo(null);
          setUser(user);
        }
      } else {
        setUser(null);
        setIsBanned(false);
        setBanInfo(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const login = async (email: string, password: string) => {
    const { isBanned: banned, banInfo: info } = await checkBanStatus(email);
    
    if (banned) {
      setIsBanned(true);
      setBanInfo(info);
      throw new Error('Ваш аккаунт заблокирован');
    }
    
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (error: any) {
      let message = 'Ошибка входа';
      if (error.code === 'auth/user-not-found') {
        message = 'Пользователь не найден';
      } else if (error.code === 'auth/wrong-password') {
        message = 'Неверный пароль';
      } else if (error.code === 'auth/invalid-email') {
        message = 'Неверный формат email';
      }
      throw new Error(message);
    }
  };

  const register = async (email: string, password: string, name: string): Promise<User> => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(userCredential.user, { displayName: name });
      
      await setDoc(doc(db, 'clients', userCredential.user.uid), {
        fullName: name,
        email: email,
        phone: '',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        ordersCount: 0,
        isFavorite: false,
      });
      
      return userCredential.user;
    } catch (error: any) {
      let message = 'Ошибка регистрации';
      if (error.code === 'auth/email-already-in-use') {
        message = 'Email уже используется';
      } else if (error.code === 'auth/weak-password') {
        message = 'Пароль должен быть не менее 6 символов';
      } else if (error.code === 'auth/invalid-email') {
        message = 'Неверный формат email';
      }
      throw new Error(message);
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
      setIsBanned(false);
      setBanInfo(null);
    } catch (error) {
      console.error('Ошибка выхода:', error);
      throw new Error('Ошибка выхода из аккаунта');
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      loading,
      login,
      register,
      logout,
      isAuthenticated: !!user && !isBanned,
      isBanned,
      banInfo,
      checkBanStatus,
      checkOrdersLimit,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};