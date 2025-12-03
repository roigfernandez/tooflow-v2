
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/lib/auth-context';
import { ThemeProvider } from '@/lib/theme-context';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import BottomNavigation from '@/components/BottomNavigation';
import ReminderNotification from '@/components/ReminderNotification';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  metadataBase: new URL('http://localhost:3000'),
  title: 'TooFlow - Gestión Inteligente de Proyectos',
  description: 'Plataforma avanzada para gestión de proyectos, tareas y colaboración en equipo',
  keywords: 'gestión de proyectos, tareas, colaboración, productividad, equipos',
  authors: [{ name: 'TooFlow Team' }],
  openGraph: {
    title: 'TooFlow - Gestión Inteligente de Proyectos',
    description: 'Plataforma avanzada para gestión de proyectos, tareas y colaboración en equipo',
    type: 'website',
    locale: 'es_ES',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'TooFlow - Gestión Inteligente de Proyectos',
    description: 'Plataforma avanzada para gestión de proyectos, tareas y colaboración en equipo',
  },
  robots: {
    index: true,
    follow: true,
  },
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" className="h-full">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap"
          rel="stylesheet"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Pacifico&display=swap"
          rel="stylesheet"
        />
        <link
          href="https://cdnjs.cloudflare.com/ajax/libs/remixicon/4.5.0/remixicon.min.css"
          rel="stylesheet"
        />
        <style dangerouslySetInnerHTML={{
          __html: `
            .font-pacifico { font-family: 'Pacifico', serif; }
            .btn-primary {
              background: linear-gradient(135deg, #3B82F6, #1D4ED8);
              color: white;
              font-weight: 500;
              padding: 0.5rem 1rem;
              border-radius: 0.5rem;
              transition: all 0.2s;
              border: none;
              cursor: pointer;
            }
            .btn-primary:hover {
              transform: translateY(-1px);
              box-shadow: 0 4px 12px rgba(59, 130, 246, 0.4);
            }
            .btn-secondary {
              background: #F3F4F6;
              color: #374151;
              font-weight: 500;
              padding: 0.5rem 1rem;
              border-radius: 0.5rem;
              border: 1px solid #D1D5DB;
              transition: all 0.2s;
              cursor: pointer;
            }
            .btn-secondary:hover {
              background: #E5E7EB;
            }
            .card {
              background: white;
              border: 1px solid #E5E7EB;
              border-radius: 0.75rem;
              box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
              transition: all 0.2s;
            }
            .card:hover {
              box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            }
            @media (prefers-color-scheme: dark) {
              .btn-secondary {
                background: #374151;
                color: #D1D5DB;
                border-color: #4B5563;
              }
              .btn-secondary:hover {
                background: #4B5563;
              }
              .card {
                background: #1F2937;
                border-color: #374151;
              }
            }
            .gradient-text {
              background: linear-gradient(135deg, #3B82F6, #8B5CF6);
              -webkit-background-clip: text;
              -webkit-text-fill-color: transparent;
              background-clip: text;
            }
            .gradient-bg {
              background: linear-gradient(135deg, #3B82F6, #8B5CF6);
            }
            .glass-effect {
              backdrop-filter: blur(10px);
              background: rgba(255, 255, 255, 0.9);
            }
            @media (prefers-color-scheme: dark) {
              .glass-effect {
                background: rgba(31, 41, 55, 0.9);
              }
            }
          `
        }} />
      </head>
      <body className={`${inter.className} h-full bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100`}>
        <AuthProvider>
          <ThemeProvider>
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200 flex flex-col md:pb-0 pb-16 md:pt-0 pt-16">
              <Header />
              <div className="flex-1 transition-all duration-200">
                {children}
              </div>
              <Footer />
              <BottomNavigation />
              <ReminderNotification />
            </div>
          </ThemeProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
