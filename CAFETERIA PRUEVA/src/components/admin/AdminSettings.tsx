import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import {
  Save,
  Store,
  MapPin,
  Clock,
  Phone,
  Mail,
  Instagram,
  ImageIcon,
  CheckCircle,
  Map,
  Upload,
  Link,
  Trash2,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { BusinessConfig } from '../../types';

// Compress image — SAME method as reference project
const compressImage = (file: File, maxW: number, quality: number): Promise<string> => {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ratio = Math.min(maxW / img.width, 1);
        canvas.width = img.width * ratio;
        canvas.height = img.height * ratio;
        const ctx = canvas.getContext('2d')!;
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL('image/jpeg', quality));
      };
      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  });
};

type ImageField = 'logo' | 'heroImage';

export function AdminSettings() {
  const { business, updateBusiness } = useApp();
  const [form, setForm] = useState<BusinessConfig>({ ...business });
  const [saved, setSaved] = useState(false);
  const [logoMode, setLogoMode] = useState<'upload' | 'url'>('upload');
  const [heroMode, setHeroMode] = useState<'upload' | 'url'>('upload');
  const logoInputRef = useRef<HTMLInputElement>(null);
  const heroInputRef = useRef<HTMLInputElement>(null);

  const handleSave = () => {
    updateBusiness(form);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const update = (field: keyof BusinessConfig, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const updateHours = (field: keyof BusinessConfig['hours'], value: string) => {
    setForm((prev) => ({ ...prev, hours: { ...prev.hours, [field]: value } }));
  };

  // Handle image upload — same as reference project
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, field: ImageField) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const maxW = field === 'logo' ? 300 : 800;
    const data = await compressImage(file, maxW, 0.8);
    setForm((prev) => ({ ...prev, [field]: data }));
    e.target.value = '';
  };

  const inputClass =
    'w-full px-4 py-2.5 bg-white border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-stone-900/10 transition-all';
  const labelClass = 'block text-xs font-medium text-stone-500 uppercase tracking-wider mb-1.5';

  const renderImageUploader = (
    field: ImageField,
    label: string,
    mode: 'upload' | 'url',
    setMode: (m: 'upload' | 'url') => void,
    inputRef: React.RefObject<HTMLInputElement | null>,
    aspectClass: string
  ) => (
    <div>
      <div className="flex items-center justify-between mb-2">
        <label className={labelClass}>
          <span className="flex items-center gap-1.5">
            <ImageIcon className="w-3 h-3" />
            {label}
          </span>
        </label>
        <div className="flex bg-stone-100 rounded-lg p-0.5">
          <button
            type="button"
            onClick={() => setMode('upload')}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-medium transition-all ${
              mode === 'upload'
                ? 'bg-white text-stone-900 shadow-sm'
                : 'text-stone-500 hover:text-stone-700'
            }`}
          >
            <Upload className="w-3 h-3" />
            Subir
          </button>
          <button
            type="button"
            onClick={() => setMode('url')}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-medium transition-all ${
              mode === 'url'
                ? 'bg-white text-stone-900 shadow-sm'
                : 'text-stone-500 hover:text-stone-700'
            }`}
          >
            <Link className="w-3 h-3" />
            URL
          </button>
        </div>
      </div>

      {mode === 'upload' ? (
        <div>
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            onChange={(e) => handleImageUpload(e, field)}
            className="hidden"
          />
          <div
            onClick={() => inputRef.current?.click()}
            className={`relative border-2 border-dashed rounded-xl cursor-pointer transition-all overflow-hidden ${
              form[field]
                ? 'border-stone-200 hover:border-stone-400'
                : 'border-stone-300 hover:border-stone-500 bg-stone-50'
            }`}
          >
            {form[field] ? (
              <div className={`relative ${aspectClass}`}>
                <img
                  src={form[field]}
                  alt={`${label} preview`}
                  className={`w-full h-full ${field === 'logo' ? 'object-contain p-4 bg-stone-50' : 'object-cover'}`}
                />
                <div className="absolute inset-0 bg-black/0 hover:bg-black/30 transition-colors flex items-center justify-center group">
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity bg-white/90 backdrop-blur-sm rounded-xl px-4 py-2 flex items-center gap-2 text-sm font-medium text-stone-900">
                    <Upload className="w-4 h-4" />
                    Cambiar imagen
                  </div>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setForm((prev) => ({ ...prev, [field]: '' }));
                  }}
                  className="absolute top-2 right-2 w-7 h-7 bg-red-500 hover:bg-red-600 text-white rounded-lg flex items-center justify-center transition-colors shadow-lg"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <div className="py-8 text-center">
                <div className="w-12 h-12 bg-stone-200 rounded-xl flex items-center justify-center mx-auto mb-3">
                  <Upload className="w-5 h-5 text-stone-500" />
                </div>
                <p className="text-sm font-medium text-stone-600">
                  Haz clic para subir una imagen
                </p>
                <p className="text-xs text-stone-400 mt-1">
                  JPG, PNG o WebP
                </p>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div>
          <input
            type="text"
            value={form[field]}
            onChange={(e) => update(field, e.target.value)}
            placeholder={`https://...${field === 'logo' ? ' (dejar vacío para usar ícono por defecto)' : ''}`}
            className={inputClass}
          />
          {form[field] && form[field].startsWith('http') && (
            <div className={`mt-2 ${aspectClass} rounded-xl overflow-hidden border border-stone-200 bg-stone-50`}>
              <img
                src={form[field]}
                alt={`${label} preview`}
                className={`w-full h-full ${field === 'logo' ? 'object-contain p-2' : 'object-cover'}`}
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = 'none';
                }}
              />
            </div>
          )}
        </div>
      )}
    </div>
  );

  return (
    <div className="max-w-2xl">
      {/* Save notification */}
      {saved && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          className="mb-6 flex items-center gap-2 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-xl text-sm font-medium"
        >
          <CheckCircle className="w-4 h-4" />
          Configuración guardada exitosamente
        </motion.div>
      )}

      {/* Identidad del Negocio */}
      <div className="bg-white border border-stone-200 rounded-2xl p-6 mb-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-stone-100 rounded-xl flex items-center justify-center">
            <Store className="w-5 h-5 text-stone-600" />
          </div>
          <div>
            <h3 className="font-semibold text-stone-900">Identidad del Negocio</h3>
            <p className="text-xs text-stone-400">Nombre, logo y descripción</p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Nombre</label>
              <input type="text" value={form.name} onChange={(e) => update('name', e.target.value)} placeholder="KAIRO" className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Subtítulo</label>
              <input type="text" value={form.subtitle} onChange={(e) => update('subtitle', e.target.value)} placeholder="COFFEE" className={inputClass} />
            </div>
          </div>

          <div>
            <label className={labelClass}>Descripción</label>
            <textarea value={form.description} onChange={(e) => update('description', e.target.value)} rows={3} className={`${inputClass} resize-none`} />
          </div>

          {renderImageUploader('logo', 'Logo del Negocio', logoMode, setLogoMode, logoInputRef, 'h-24 w-24')}
          {renderImageUploader('heroImage', 'Imagen del Banner Principal', heroMode, setHeroMode, heroInputRef, 'h-40')}
        </div>
      </div>

      {/* Ubicación */}
      <div className="bg-white border border-stone-200 rounded-2xl p-6 mb-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-amber-50 rounded-xl flex items-center justify-center">
            <MapPin className="w-5 h-5 text-amber-600" />
          </div>
          <div>
            <h3 className="font-semibold text-stone-900">Ubicación</h3>
            <p className="text-xs text-stone-400">Dirección y mapa</p>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className={labelClass}>Dirección</label>
            <input type="text" value={form.address} onChange={(e) => update('address', e.target.value)} placeholder="Calle, número, colonia" className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>Ciudad / CP</label>
            <input type="text" value={form.city} onChange={(e) => update('city', e.target.value)} placeholder="Ciudad de México, CP 06000" className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>
              <span className="flex items-center gap-1.5"><Map className="w-3 h-3" />URL del Mapa (Google Maps embed)</span>
            </label>
            <input type="text" value={form.mapUrl} onChange={(e) => update('mapUrl', e.target.value)} placeholder="https://www.google.com/maps/embed?pb=..." className={inputClass} />
          </div>
        </div>
      </div>

      {/* Horarios */}
      <div className="bg-white border border-stone-200 rounded-2xl p-6 mb-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-green-50 rounded-xl flex items-center justify-center">
            <Clock className="w-5 h-5 text-green-600" />
          </div>
          <div>
            <h3 className="font-semibold text-stone-900">Horarios</h3>
            <p className="text-xs text-stone-400">Horarios de atención</p>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className={labelClass}>Lunes — Viernes</label>
            <input type="text" value={form.hours.weekdays} onChange={(e) => updateHours('weekdays', e.target.value)} placeholder="7:00 — 21:00" className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>Sábado</label>
            <input type="text" value={form.hours.saturday} onChange={(e) => updateHours('saturday', e.target.value)} placeholder="8:00 — 22:00" className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>Domingo</label>
            <input type="text" value={form.hours.sunday} onChange={(e) => updateHours('sunday', e.target.value)} placeholder="9:00 — 18:00" className={inputClass} />
          </div>
        </div>
      </div>

      {/* Contacto */}
      <div className="bg-white border border-stone-200 rounded-2xl p-6 mb-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center">
            <Phone className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <h3 className="font-semibold text-stone-900">Contacto</h3>
            <p className="text-xs text-stone-400">Teléfono, email y redes sociales</p>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className={labelClass}><span className="flex items-center gap-1.5"><Phone className="w-3 h-3" />Teléfono</span></label>
            <input type="text" value={form.phone} onChange={(e) => update('phone', e.target.value)} placeholder="+52 55 1234 5678" className={inputClass} />
          </div>
          <div>
            <label className={labelClass}><span className="flex items-center gap-1.5"><Mail className="w-3 h-3" />Email</span></label>
            <input type="text" value={form.email} onChange={(e) => update('email', e.target.value)} placeholder="hola@kairocoffee.mx" className={inputClass} />
          </div>
          <div>
            <label className={labelClass}><span className="flex items-center gap-1.5"><Instagram className="w-3 h-3" />Instagram</span></label>
            <input type="text" value={form.instagram} onChange={(e) => update('instagram', e.target.value)} placeholder="@kairocoffee" className={inputClass} />
          </div>
        </div>
      </div>

      {/* Save Button */}
      <button
        onClick={handleSave}
        className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-stone-900 hover:bg-stone-700 text-white rounded-2xl font-semibold text-sm transition-colors active:scale-[0.98]"
      >
        <Save className="w-4 h-4" />
        Guardar Configuración
      </button>
    </div>
  );
}
