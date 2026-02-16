import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Save,
  CheckCircle,
  ImageIcon,
  Upload,
  Link,
  Trash2,
  Type,
  AlignLeft,
  Sparkles,
  Plus,
  X,
  GripVertical,
  Wifi,
  ParkingMeter,
  Music,
  PawPrint,
  Plug,
  Wind,
  TreePalm,
  Accessibility,
  Eye,
  EyeOff,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { AboutConfig, AboutFeature } from '../../types';

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

const iconOptions: { value: string; label: string; Icon: React.ComponentType<{ className?: string }> }[] = [
  { value: 'wifi', label: 'WiFi', Icon: Wifi },
  { value: 'parking', label: 'Parking', Icon: ParkingMeter },
  { value: 'music', label: 'Música/Ambiente', Icon: Music },
  { value: 'pet', label: 'Pet Friendly', Icon: PawPrint },
  { value: 'power', label: 'Enchufes', Icon: Plug },
  { value: 'ac', label: 'Aire Acondicionado', Icon: Wind },
  { value: 'garden', label: 'Terraza/Jardín', Icon: TreePalm },
  { value: 'accessibility', label: 'Accesible', Icon: Accessibility },
];

function getIconComponent(iconName: string) {
  const found = iconOptions.find((o) => o.value === iconName);
  return found ? found.Icon : null;
}

export function AdminAbout() {
  const { business, updateBusiness } = useApp();
  const [form, setForm] = useState<AboutConfig>({ ...business.about });
  const [saved, setSaved] = useState(false);
  const [imageMode, setImageMode] = useState<'upload' | 'url'>('upload');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showAddFeature, setShowAddFeature] = useState(false);
  const [newFeatureLabel, setNewFeatureLabel] = useState('');
  const [newFeatureIcon, setNewFeatureIcon] = useState('wifi');

  const handleSave = () => {
    updateBusiness({ ...business, about: form });
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const updateField = <K extends keyof AboutConfig>(field: K, value: AboutConfig[K]) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const toggleFeature = (id: string) => {
    setForm((prev) => ({
      ...prev,
      features: prev.features.map((f) =>
        f.id === id ? { ...f, enabled: !f.enabled } : f
      ),
    }));
  };

  const updateFeatureLabel = (id: string, label: string) => {
    setForm((prev) => ({
      ...prev,
      features: prev.features.map((f) =>
        f.id === id ? { ...f, label } : f
      ),
    }));
  };

  const updateFeatureIcon = (id: string, icon: string) => {
    setForm((prev) => ({
      ...prev,
      features: prev.features.map((f) =>
        f.id === id ? { ...f, icon } : f
      ),
    }));
  };

  const deleteFeature = (id: string) => {
    setForm((prev) => ({
      ...prev,
      features: prev.features.filter((f) => f.id !== id),
    }));
  };

  const addFeature = () => {
    if (!newFeatureLabel.trim()) return;
    const newFeature: AboutFeature = {
      id: `custom-${Date.now()}`,
      icon: newFeatureIcon,
      label: newFeatureLabel,
      enabled: true,
    };
    setForm((prev) => ({
      ...prev,
      features: [...prev.features, newFeature],
    }));
    setNewFeatureLabel('');
    setNewFeatureIcon('wifi');
    setShowAddFeature(false);
  };

  // Handle image upload — same as reference project
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const data = await compressImage(file, 800, 0.7);
    updateField('image', data);
    e.target.value = '';
  };

  const inputClass =
    'w-full px-4 py-2.5 bg-white border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-stone-900/10 transition-all';
  const labelClass = 'block text-xs font-medium text-stone-500 uppercase tracking-wider mb-1.5';

  const enabledCount = form.features.filter((f) => f.enabled).length;

  return (
    <div className="max-w-2xl">
      {/* Save notification */}
      <AnimatePresence>
        {saved && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="mb-6 flex items-center gap-2 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-xl text-sm font-medium"
          >
            <CheckCircle className="w-4 h-4" />
            Sección "Nosotros" guardada exitosamente
          </motion.div>
        )}
      </AnimatePresence>

      {/* Textos de la sección */}
      <div className="bg-white border border-stone-200 rounded-2xl p-6 mb-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-amber-50 rounded-xl flex items-center justify-center">
            <Type className="w-5 h-5 text-amber-600" />
          </div>
          <div>
            <h3 className="font-semibold text-stone-900">Textos de la Sección</h3>
            <p className="text-xs text-stone-400">Etiqueta, título y contenido</p>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className={labelClass}>Etiqueta superior</label>
            <input type="text" value={form.sectionLabel} onChange={(e) => updateField('sectionLabel', e.target.value)} placeholder="Nuestra historia" className={inputClass} />
            <p className="text-[11px] text-stone-400 mt-1">Aparece en letras pequeñas arriba del título</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Título</label>
              <input type="text" value={form.title} onChange={(e) => updateField('title', e.target.value)} placeholder="Un espacio pensado para" className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Palabra destacada</label>
              <input type="text" value={form.titleHighlight} onChange={(e) => updateField('titleHighlight', e.target.value)} placeholder="inspirarte" className={inputClass} />
              <p className="text-[11px] text-stone-400 mt-1">Se muestra en color dorado</p>
            </div>
          </div>

          <div>
            <label className={labelClass}>
              <span className="flex items-center gap-1.5"><AlignLeft className="w-3 h-3" />Primer párrafo</span>
            </label>
            <textarea value={form.paragraph1} onChange={(e) => updateField('paragraph1', e.target.value)} rows={4} placeholder="Escribe sobre la historia..." className={`${inputClass} resize-none`} />
          </div>

          <div>
            <label className={labelClass}>
              <span className="flex items-center gap-1.5"><AlignLeft className="w-3 h-3" />Segundo párrafo</span>
            </label>
            <textarea value={form.paragraph2} onChange={(e) => updateField('paragraph2', e.target.value)} rows={4} placeholder="Más detalles... (opcional)" className={`${inputClass} resize-none`} />
          </div>
        </div>
      </div>

      {/* Imagen de la sección */}
      <div className="bg-white border border-stone-200 rounded-2xl p-6 mb-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center">
            <ImageIcon className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <h3 className="font-semibold text-stone-900">Imagen de la Sección</h3>
            <p className="text-xs text-stone-400">Foto que aparece al lado del texto</p>
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <label className={labelClass}>Imagen</label>
            <div className="flex bg-stone-100 rounded-lg p-0.5">
              <button type="button" onClick={() => setImageMode('upload')} className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-medium transition-all ${imageMode === 'upload' ? 'bg-white text-stone-900 shadow-sm' : 'text-stone-500 hover:text-stone-700'}`}>
                <Upload className="w-3 h-3" /> Subir
              </button>
              <button type="button" onClick={() => setImageMode('url')} className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-medium transition-all ${imageMode === 'url' ? 'bg-white text-stone-900 shadow-sm' : 'text-stone-500 hover:text-stone-700'}`}>
                <Link className="w-3 h-3" /> URL
              </button>
            </div>
          </div>

          {imageMode === 'upload' ? (
            <div>
              <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
              <div
                onClick={() => fileInputRef.current?.click()}
                className={`relative border-2 border-dashed rounded-xl cursor-pointer transition-all overflow-hidden ${form.image ? 'border-stone-200 hover:border-stone-400' : 'border-stone-300 hover:border-stone-500 bg-stone-50'}`}
              >
                {form.image ? (
                  <div className="relative h-48">
                    <img src={form.image} alt="Preview" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/0 hover:bg-black/30 transition-colors flex items-center justify-center group">
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity bg-white/90 backdrop-blur-sm rounded-xl px-4 py-2 flex items-center gap-2 text-sm font-medium text-stone-900">
                        <Upload className="w-4 h-4" /> Cambiar imagen
                      </div>
                    </div>
                    <button onClick={(e) => { e.stopPropagation(); updateField('image', ''); }} className="absolute top-2 right-2 w-7 h-7 bg-red-500 hover:bg-red-600 text-white rounded-lg flex items-center justify-center transition-colors shadow-lg">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ) : (
                  <div className="py-8 text-center">
                    <div className="w-12 h-12 bg-stone-200 rounded-xl flex items-center justify-center mx-auto mb-3">
                      <Upload className="w-5 h-5 text-stone-500" />
                    </div>
                    <p className="text-sm font-medium text-stone-600">Haz clic para subir una imagen</p>
                    <p className="text-xs text-stone-400 mt-1">JPG, PNG o WebP • Recomendado: formato vertical</p>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div>
              <input type="text" value={form.image} onChange={(e) => updateField('image', e.target.value)} placeholder="https://images.unsplash.com/..." className={inputClass} />
              {form.image && form.image.startsWith('http') && (
                <div className="mt-2 h-40 rounded-xl overflow-hidden border border-stone-200 bg-stone-50">
                  <img src={form.image} alt="Preview" className="w-full h-full object-cover" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Tarjeta flotante */}
      <div className="bg-white border border-stone-200 rounded-2xl p-6 mb-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-stone-800 rounded-xl flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-stone-900">Tarjeta Flotante</h3>
            <p className="text-xs text-stone-400">El dato destacado que se superpone a la imagen</p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Número / Dato</label>
              <input type="text" value={form.floatingNumber} onChange={(e) => updateField('floatingNumber', e.target.value)} placeholder="+5" className={inputClass} />
              <p className="text-[11px] text-stone-400 mt-1">Ej: "+5", "100%", "★4.9"</p>
            </div>
            <div>
              <label className={labelClass}>Texto descriptivo</label>
              <input type="text" value={form.floatingText} onChange={(e) => updateField('floatingText', e.target.value)} placeholder="Años sirviendo café de especialidad" className={inputClass} />
            </div>
          </div>

          <div className="bg-stone-50 rounded-xl p-4">
            <p className="text-[10px] text-stone-400 uppercase tracking-wider mb-2">Vista previa</p>
            <div className="bg-stone-900 text-white p-4 rounded-xl max-w-[200px]">
              {form.floatingNumber && <span className="text-2xl font-bold block">{form.floatingNumber}</span>}
              {form.floatingText && <span className="text-white/70 text-xs">{form.floatingText}</span>}
              {!form.floatingNumber && !form.floatingText && <span className="text-white/40 text-xs">Sin contenido</span>}
            </div>
          </div>
        </div>
      </div>

      {/* Amenidades */}
      <div className="bg-white border border-stone-200 rounded-2xl p-6 mb-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-50 rounded-xl flex items-center justify-center">
              <Wifi className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <h3 className="font-semibold text-stone-900">Amenidades & Servicios</h3>
              <p className="text-xs text-stone-400">{enabledCount} activas de {form.features.length}</p>
            </div>
          </div>
          <button onClick={() => setShowAddFeature(true)} className="flex items-center gap-1.5 px-3 py-2 bg-stone-900 hover:bg-stone-700 text-white rounded-xl text-xs font-medium transition-colors">
            <Plus className="w-3.5 h-3.5" /> Agregar
          </button>
        </div>

        <div className="space-y-2">
          {form.features.map((feature) => {
            const IconComp = getIconComponent(feature.icon);
            return (
              <div key={feature.id} className={`flex items-center gap-3 p-3 rounded-xl border transition-all ${feature.enabled ? 'bg-white border-stone-200' : 'bg-stone-50 border-stone-100 opacity-60'}`}>
                <GripVertical className="w-4 h-4 text-stone-300 shrink-0" />
                <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${feature.enabled ? 'bg-stone-100' : 'bg-stone-200/50'}`}>
                  {IconComp ? <IconComp className="w-4 h-4 text-stone-600" /> : <span className="text-sm">{feature.icon}</span>}
                </div>
                <input type="text" value={feature.label} onChange={(e) => updateFeatureLabel(feature.id, e.target.value)} className="flex-1 min-w-0 px-2 py-1 text-sm text-stone-900 bg-transparent border-b border-transparent hover:border-stone-200 focus:border-stone-400 focus:outline-none transition-colors" />
                <select value={feature.icon} onChange={(e) => updateFeatureIcon(feature.id, e.target.value)} className="text-xs bg-stone-50 border border-stone-200 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-stone-300 w-24 shrink-0">
                  {iconOptions.map((opt) => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                </select>
                <button onClick={() => toggleFeature(feature.id)} className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 transition-colors ${feature.enabled ? 'bg-green-50 text-green-600 hover:bg-green-100' : 'bg-stone-100 text-stone-400 hover:bg-stone-200'}`} title={feature.enabled ? 'Desactivar' : 'Activar'}>
                  {feature.enabled ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                </button>
                <button onClick={() => deleteFeature(feature.id)} className="w-9 h-9 rounded-lg flex items-center justify-center text-stone-400 hover:bg-red-50 hover:text-red-500 transition-colors shrink-0">
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            );
          })}
        </div>

        {form.features.length === 0 && (
          <div className="text-center py-8 text-stone-400 text-sm">No hay amenidades. Agrega una para mostrar en la sección.</div>
        )}

        {enabledCount > 0 && (
          <div className="mt-4 bg-stone-50 rounded-xl p-4">
            <p className="text-[10px] text-stone-400 uppercase tracking-wider mb-3">Vista previa ({enabledCount} activas)</p>
            <div className="flex flex-wrap gap-3">
              {form.features.filter((f) => f.enabled).map((feature) => {
                const IconComp = getIconComponent(feature.icon);
                return (
                  <div key={feature.id} className="text-center p-3 bg-white rounded-xl border border-stone-100 min-w-[80px]">
                    {IconComp ? <IconComp className="w-4 h-4 text-stone-600 mx-auto mb-1.5" /> : <span className="text-base block mx-auto mb-1">{feature.icon}</span>}
                    <span className="text-[11px] text-stone-500 font-medium">{feature.label}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Add Feature Modal */}
      <AnimatePresence>
        {showAddFeature && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setShowAddFeature(false)}>
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} onClick={(e) => e.stopPropagation()} className="bg-white rounded-2xl p-6 max-w-sm w-full">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-stone-900">Nueva Amenidad</h3>
                <button onClick={() => setShowAddFeature(false)} className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-stone-100">
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className={labelClass}>Nombre</label>
                  <input type="text" value={newFeatureLabel} onChange={(e) => setNewFeatureLabel(e.target.value)} placeholder="Ej: Terraza, WiFi 5G..." className={inputClass} autoFocus />
                </div>
                <div>
                  <label className={labelClass}>Ícono</label>
                  <div className="grid grid-cols-4 gap-2">
                    {iconOptions.map((opt) => (
                      <button key={opt.value} type="button" onClick={() => setNewFeatureIcon(opt.value)} className={`flex flex-col items-center gap-1 p-3 rounded-xl border text-xs transition-all ${newFeatureIcon === opt.value ? 'border-stone-900 bg-stone-900 text-white' : 'border-stone-200 hover:border-stone-400 text-stone-600'}`}>
                        <opt.Icon className="w-4 h-4" />
                        <span className="text-[10px] leading-tight text-center">{opt.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
              <div className="flex gap-3 mt-6">
                <button onClick={() => setShowAddFeature(false)} className="flex-1 px-4 py-2.5 border border-stone-200 rounded-xl text-sm font-medium hover:bg-stone-50 transition-colors">Cancelar</button>
                <button onClick={addFeature} disabled={!newFeatureLabel.trim()} className="flex-1 px-4 py-2.5 bg-stone-900 text-white rounded-xl text-sm font-medium hover:bg-stone-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors">Agregar</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Save Button */}
      <button
        onClick={handleSave}
        className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-stone-900 hover:bg-stone-700 text-white rounded-2xl font-semibold text-sm transition-colors active:scale-[0.98]"
      >
        <Save className="w-4 h-4" />
        Guardar Sección Nosotros
      </button>
    </div>
  );
}
