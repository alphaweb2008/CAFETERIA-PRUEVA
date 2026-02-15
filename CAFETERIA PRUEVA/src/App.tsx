import { useState } from 'react';
import { AppProvider } from './context/AppContext';
import { Header } from './components/Header';
import { HeroBanner } from './components/HeroBanner';
import { MenuView } from './components/MenuView';
import { ReservationForm } from './components/ReservationForm';
import { BusinessInfo } from './components/BusinessInfo';
import { Footer } from './components/Footer';
import { AdminLogin } from './components/admin/AdminLogin';
import { AdminPanel } from './components/admin/AdminPanel';
import { InstallBanner } from './components/InstallBanner';
import { PWAManager } from './components/PWAManager';

type View = 'public' | 'admin-login' | 'admin';

function AppContent() {
  const [view, setView] = useState<View>('public');

  if (view === 'admin-login') {
    return (
      <AdminLogin
        onLogin={() => setView('admin')}
        onBack={() => setView('public')}
      />
    );
  }

  if (view === 'admin') {
    return (
      <AdminPanel
        onBack={() => setView('public')}
      />
    );
  }

  return (
    <div className="min-h-screen bg-stone-50">
      <Header onAdminClick={() => setView('admin-login')} />
      <main>
        <HeroBanner />
        <MenuView />
        <ReservationForm />
        <BusinessInfo />
      </main>
      <Footer />
      <InstallBanner />
    </div>
  );
}

export function App() {
  return (
    <AppProvider>
      <PWAManager />
      <AppContent />
    </AppProvider>
  );
}
