import { Coffee, Instagram, Mail, Phone } from 'lucide-react';
import { useApp } from '../context/AppContext';

export function Footer() {
  const { business } = useApp();

  return (
    <footer className="bg-stone-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {/* Main Footer */}
        <div className="py-12 sm:py-16 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Brand */}
          <div className="lg:col-span-1">
            <div className="flex items-center gap-2.5 mb-4">
              {business.logo ? (
                <div className="w-9 h-9 rounded-xl overflow-hidden">
                  <img src={business.logo} alt={business.name} className="w-full h-full object-contain" />
                </div>
              ) : (
                <div className="w-9 h-9 bg-white/10 rounded-xl flex items-center justify-center">
                  <Coffee className="w-5 h-5 text-white" />
                </div>
              )}
              <div className="flex flex-col">
                <span className="text-lg font-bold tracking-tight leading-none">
                  {business.name}
                </span>
                <span className="text-[10px] uppercase tracking-[0.2em] text-white/50 leading-none mt-0.5">
                  {business.subtitle}
                </span>
              </div>
            </div>
            <p className="text-white/50 text-sm leading-relaxed max-w-xs">
              {business.description}
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wider text-white/70 mb-4">
              Navegación
            </h4>
            <ul className="space-y-2.5">
              {[
                { label: 'Inicio', id: 'inicio' },
                { label: 'Menú', id: 'menu' },
                { label: 'Reservar', id: 'reservar' },
                { label: 'Nosotros', id: 'nosotros' },
                { label: 'Contacto', id: 'contacto' },
              ].map((item) => (
                <li key={item.id}>
                  <button
                    onClick={() => {
                      const el = document.getElementById(item.id);
                      if (el) el.scrollIntoView({ behavior: 'smooth' });
                    }}
                    className="text-white/50 hover:text-white text-sm transition-colors"
                  >
                    {item.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Hours */}
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wider text-white/70 mb-4">
              Horario
            </h4>
            <ul className="space-y-2.5 text-sm text-white/50">
              <li className="flex justify-between">
                <span>Lun — Vie</span>
                <span className="text-white/70">{business.hours.weekdays}</span>
              </li>
              <li className="flex justify-between">
                <span>Sábado</span>
                <span className="text-white/70">{business.hours.saturday}</span>
              </li>
              <li className="flex justify-between">
                <span>Domingo</span>
                <span className="text-white/70">{business.hours.sunday}</span>
              </li>
            </ul>
          </div>

          {/* Social */}
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wider text-white/70 mb-4">
              Síguenos
            </h4>
            <div className="flex gap-3">
              <a
                href={`https://instagram.com/${business.instagram.replace('@', '')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 bg-white/10 hover:bg-white/20 rounded-xl flex items-center justify-center transition-colors"
              >
                <Instagram className="w-4 h-4" />
              </a>
              <a
                href={`mailto:${business.email}`}
                className="w-10 h-10 bg-white/10 hover:bg-white/20 rounded-xl flex items-center justify-center transition-colors"
              >
                <Mail className="w-4 h-4" />
              </a>
              <a
                href={`tel:${business.phone.replace(/\s/g, '')}`}
                className="w-10 h-10 bg-white/10 hover:bg-white/20 rounded-xl flex items-center justify-center transition-colors"
              >
                <Phone className="w-4 h-4" />
              </a>
            </div>
            <p className="text-white/40 text-xs mt-4">
              Comparte tu experiencia con
              <br />
              <span className="text-white/60 font-medium">#{business.name}{business.subtitle}</span>
            </p>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-white/10 py-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-white/30">
            © {new Date().getFullYear()} {business.name} {business.subtitle} — Todos los derechos
            reservados
          </p>
          <p className="text-xs text-white/30">
            Hecho con ♥ y mucho café
          </p>
        </div>
      </div>
    </footer>
  );
}
