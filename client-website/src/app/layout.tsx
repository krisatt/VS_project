//layout.tsx
import type { Metadata } from 'next';
import { Inter, Jura, Poiret_One } from 'next/font/google';
import { AuthProvider } from '@/contexts';  // убрали /AuthContext
import './globals.css';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });
const jura = Jura({ subsets: ['latin'], variable: '--font-jura' });
const poiretOne = Poiret_One({ 
  weight: '400',
  subsets: ['latin'], 
  variable: '--font-poiret-one' 
});

export const metadata: Metadata = {
  title: 'Loft Max | Студия дизайна интерьера',
  description: 'Превращаем ваши мечты в реальность.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru" className={`${inter.variable} ${jura.variable} ${poiretOne.variable}`}>
      <body className="m-0 p-0 overflow-x-hidden">
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}