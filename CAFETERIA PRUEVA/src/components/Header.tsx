import { useState, useEffect } from 'react';
import { Coffee, Menu, X, Lock } from 'lucide-react';
import { useApp } from '../context/AppContext';

interface Props {
  onAdminClick: () => void;
}

export function Header({ onAdminClick }: Props) {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { business } = useApp();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
      setMobileOpen(false);
    }
  };

  const navItems = [
    { id: 'inicio', label: 'Inicio' },
    { id: 'menu', label: 'Menú' },
    { id: 'reservar', label: 'Reservar' },
    { id: 'nosotros', label: 'Nosotros' },
    { id: 'contacto', label: 'Contacto' },
  ];

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-white/90 backdrop-blur-xl shadow-sm border-b border-stone-100'
          : 'bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16 sm:h-20">
          {/* Logo */}
          <button
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="flex items-center gap-2.5 group"
          >
            {business.logo ? (
              <div className="w-9 h-9 rounded-xl overflow-hidden">
                <img
                  src={business.logo}
                  alt={business.name}
                  className="w-full h-full object-contain"
                />
              </div>
            ) : (
              <div
                className={`w-9 h-9 rounded-xl flex items-center justify-center transition-colors ${
                  scrolled ? 'bg-stone-900' : 'bg-white/20 backdrop-blur-sm'
                }`}
              >
                <Coffee className="w-5 h-5 text-white" />
              </div>
            )}
            <div className="flex flex-col">
              <span
                className={`text-lg font-bold tracking-tight leading-none transition-colors ${
                  scrolled ? 'text-stone-900' : 'text-white'
                }`}
              >
                {business.name}
              </span>
              <span
                className={`text-[10px] uppercase tracking-[0.2em] leading-none mt-0.5 transition-colors ${
                  scrolled ? 'text-stone-400' : 'text-white/70'
                }`}
              >
                {business.subtitle}
              </span>
            </div>
          </button>

          {/* Desktop Nav */}
          <nav className="hidden sm:flex items-center gap-1">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => scrollTo(item.id)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  scrolled
                    ? 'text-stone-500 hover:text-stone-900 hover:bg-stone-100'
                    : 'text-white/80 hover:text-white hover:bg-white/10'
                }`}
              >
                {item.label}
              </button>
            ))}
            <button
              onClick={onAdminClick}
              className={`ml-2 w-9 h-9 rounded-full flex items-center justify-center transition-all ${
                scrolled
                  ? 'text-stone-400 hover:text-stone-900 hover:bg-stone-100'
                  : 'text-white/40 hover:text-white hover:bg-white/10'
              }`}
              title="Panel de Admin"
            >
              <Lock className="w-3.5 h-3.5" />
            </button>
          </nav>

          {/* Mobile hamburger */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className={`sm:hidden w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${
              scrolled ? 'text-stone-900 hover:bg-stone-100' : 'text-white hover:bg-white/10'
            }`}
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="sm:hidden bg-white border-t border-stone-100 shadow-xl">
          <nav className="flex flex-col p-4 gap-1">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => scrollTo(item.id)}
                className="text-left px-4 py-3 rounded-xl text-stone-700 hover:bg-stone-50 font-medium text-sm transition-colors"
              >
                {item.label}
              </button>
            ))}
            <button
              onClick={() => {
                setMobileOpen(false);
                onAdminClick();
              }}
              className="text-left px-4 py-3 rounded-xl text-stone-400 hover:bg-stone-50 font-medium text-sm transition-colors flex items-center gap-2"
            >
              <Lock className="w-3.5 h-3.5" />
              Panel Admin
            </button>
          </nav>
        </div>
      )}
    </header>
  );
}
