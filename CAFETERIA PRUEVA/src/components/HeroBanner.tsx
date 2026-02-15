import { motion } from 'framer-motion';
import { ArrowDown } from 'lucide-react';
import { useApp } from '../context/AppContext';

export function HeroBanner() {
  const { business } = useApp();

  const scrollToMenu = () => {
    const el = document.getElementById('menu');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section
      id="inicio"
      className="relative h-screen min-h-[600px] max-h-[900px] flex items-center justify-center overflow-hidden"
    >
      {/* Background Image */}
      <div className="absolute inset-0">
        <img
          src={business.heroImage}
          alt={business.name}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/30 to-black/60" />
      </div>

      {/* Content */}
      <div className="relative z-10 text-center px-4 max-w-3xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <span className="inline-block text-xs uppercase tracking-[0.3em] text-white/60 font-medium mb-4 border border-white/20 px-4 py-1.5 rounded-full">
            Cafetería de Especialidad
          </span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="text-5xl sm:text-7xl lg:text-8xl font-bold text-white tracking-tight leading-[0.9]"
        >
          {business.name}
          <span className="block text-2xl sm:text-3xl lg:text-4xl font-light tracking-[0.15em] mt-2 text-white/80">
            {business.subtitle}
          </span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="text-white/60 text-base sm:text-lg mt-6 max-w-md mx-auto leading-relaxed font-light"
        >
          {business.description}
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.8 }}
          className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <button
            onClick={scrollToMenu}
            className="bg-white text-stone-900 px-8 py-3.5 rounded-full font-medium text-sm hover:bg-white/90 transition-all active:scale-95 shadow-2xl shadow-black/20"
          >
            Ver nuestro menú
          </button>
          <button
            onClick={() => {
              const el = document.getElementById('reservar');
              if (el) el.scrollIntoView({ behavior: 'smooth' });
            }}
            className="text-white/80 hover:text-white px-8 py-3.5 rounded-full font-medium text-sm border border-white/20 hover:border-white/40 transition-all"
          >
            Reservar mesa
          </button>
        </motion.div>
      </div>

      {/* Scroll indicator */}
      <motion.button
        onClick={scrollToMenu}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 text-white/40 hover:text-white/80 transition-colors"
      >
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
        >
          <ArrowDown className="w-5 h-5" />
        </motion.div>
      </motion.button>
    </section>
  );
}
