import { useState } from 'react';
import { motion } from 'framer-motion';
import { Lock, Eye, EyeOff, Coffee } from 'lucide-react';

interface Props {
  onLogin: () => void;
  onBack: () => void;
}

const ADMIN_PASSWORD = 'admin123';

export function AdminLogin({ onLogin, onBack }: Props) {
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [shake, setShake] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === ADMIN_PASSWORD) {
      onLogin();
    } else {
      setError('Contraseña incorrecta');
      setShake(true);
      setTimeout(() => setShake(false), 600);
    }
  };

  return (
    <div className="min-h-screen bg-stone-950 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-sm"
      >
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Coffee className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white">Panel de Administración</h1>
          <p className="text-white/40 text-sm mt-2">Ingresa la contraseña para acceder</p>
        </div>

        <motion.form
          onSubmit={handleSubmit}
          animate={shake ? { x: [0, -10, 10, -10, 10, 0] } : {}}
          transition={{ duration: 0.5 }}
          className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6 sm:p-8"
        >
          <div className="mb-6">
            <label className="block text-white/60 text-xs uppercase tracking-wider font-medium mb-2">
              Contraseña
            </label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setError('');
                }}
                placeholder="••••••••"
                className="w-full pl-11 pr-12 py-3.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-white/20 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500/50 transition-all text-sm"
                autoFocus
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {error && (
              <motion.p
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-red-400 text-xs mt-2"
              >
                {error}
              </motion.p>
            )}
          </div>

          <button
            type="submit"
            className="w-full bg-white text-stone-900 py-3.5 rounded-xl font-semibold text-sm hover:bg-white/90 transition-all active:scale-[0.98]"
          >
            Ingresar
          </button>

          <button
            type="button"
            onClick={onBack}
            className="w-full text-white/40 hover:text-white/70 py-3 text-sm font-medium mt-2 transition-colors"
          >
            ← Volver al sitio
          </button>
        </motion.form>

        <p className="text-center text-white/20 text-xs mt-6">
          Acceso exclusivo para administradores
        </p>
      </motion.div>
    </div>
  );
}
