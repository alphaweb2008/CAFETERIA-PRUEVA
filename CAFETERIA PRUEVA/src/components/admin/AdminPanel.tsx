import { useState, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import type { MenuItem, Reservation, AboutFeature, AboutConfig, BusinessConfig } from '../../types';

type Tab = 'menu' | 'reservas' | 'nosotros' | 'config' | 'password';

export function AdminPanel({ onBack }: { onBack: () => void; onLogout?: () => void }) {
  const ctx = useApp();
  const [tab, setTab] = useState<Tab>('menu');

  // ---- CONFIG STATE ----
  const [configForm, setConfigForm] = useState<BusinessConfig>({ ...ctx.business });
  const logoRef = useRef<HTMLInputElement>(null);
  const heroRef = useRef<HTMLInputElement>(null);

  // ---- MENU STATE ----
  const [menuFilter, setMenuFilter] = useState('all');
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newItem, setNewItem] = useState({
    name: '', description: '', price: 0, category: 'cafe', image: '', popular: false,
  });
  const menuImageRef = useRef<HTMLInputElement>(null);
  const editImageRef = useRef<HTMLInputElement>(null);

  // ---- ABOUT STATE ----
  const [aboutForm, setAboutForm] = useState<AboutConfig>({ ...ctx.business.about });
  const aboutImageRef = useRef<HTMLInputElement>(null);

  // ---- RESERVAS STATE ----
  const [resFilter, setResFilter] = useState<'all' | 'pending' | 'confirmed' | 'cancelled'>('all');
  const [resSearch, setResSearch] = useState('');

  // ---- PASSWORD STATE ----
  const [oldPass, setOldPass] = useState('');
  const [newPass, setNewPass] = useState('');
  const [confirmPass, setConfirmPass] = useState('');
  const [passMsg, setPassMsg] = useState('');

  // ==================== IMAGE COMPRESS — EXACT COPY FROM REFERENCE ====================
  const compressImage = (file: File, maxW: number, quality: number): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = document.createElement('img');
        img.onload = () => {
          try {
            const canvas = document.createElement('canvas');
            const ratio = Math.min(maxW / img.width, 1);
            canvas.width = img.width * ratio;
            canvas.height = img.height * ratio;
            const c = canvas.getContext('2d')!;
            c.drawImage(img, 0, 0, canvas.width, canvas.height);
            const result = canvas.toDataURL('image/jpeg', quality);
            console.log('✅ Imagen comprimida:', Math.round(result.length / 1024), 'KB');
            resolve(result);
          } catch (err) {
            reject(err);
          }
        };
        img.onerror = () => reject('img load error');
        img.src = e.target?.result as string;
      };
      reader.onerror = () => reject('reader error');
      reader.readAsDataURL(file);
    });
  };

  // ==================== MENU IMAGE HANDLER ====================
  const handleMenuImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, target: 'new' | 'edit') => {
    const file = e.target.files?.[0];
    if (!file) return;
    console.log('📷 Procesando imagen:', file.name, Math.round(file.size / 1024), 'KB');
    try {
      // Compress to 400px max, quality 0.5 — keeps it under 50KB for Firestore
      const data = await compressImage(file, 400, 0.5);
      if (target === 'new') {
        setNewItem(prev => ({ ...prev, image: data }));
      } else if (editingItem) {
        setEditingItem(prev => prev ? { ...prev, image: data } : prev);
      }
      console.log('✅ Imagen lista');
    } catch (err) {
      console.error('❌ Compress failed:', err);
      alert('Error al procesar la imagen. Intenta con otra.');
    }
    e.target.value = '';
  };

  // ==================== CONFIG IMAGE HANDLERS ====================
  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    console.log('📷 Procesando logo:', file.name);
    try {
      const data = await compressImage(file, 200, 0.6);
      setConfigForm(prev => ({ ...prev, logo: data }));
      console.log('✅ Logo listo');
    } catch (err) {
      console.error('❌ Logo compress failed:', err);
      alert('Error al procesar el logo.');
    }
    e.target.value = '';
  };

  const handleHeroUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    console.log('📷 Procesando banner:', file.name);
    try {
      const data = await compressImage(file, 800, 0.5);
      setConfigForm(prev => ({ ...prev, heroImage: data }));
      console.log('✅ Banner listo');
    } catch (err) {
      console.error('❌ Banner compress failed:', err);
      alert('Error al procesar la imagen del banner.');
    }
    e.target.value = '';
  };

  // ==================== ABOUT IMAGE HANDLER ====================
  const handleAboutImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    console.log('📷 Procesando imagen nosotros:', file.name);
    try {
      const data = await compressImage(file, 400, 0.5);
      setAboutForm(prev => ({ ...prev, image: data }));
      console.log('✅ Imagen nosotros lista');
    } catch (err) {
      console.error('❌ About image compress failed:', err);
      alert('Error al procesar la imagen.');
    }
    e.target.value = '';
  };

  // ==================== MENU ACTIONS ====================
  const handleAddItem = () => {
    if (!newItem.name || !newItem.price) return alert('Nombre y precio son requeridos');
    const item: MenuItem = {
      id: Date.now().toString(),
      name: newItem.name,
      description: newItem.description,
      price: newItem.price,
      category: newItem.category,
      image: newItem.image,
      popular: newItem.popular,
    };
    console.log('➕ Agregando:', item.name, 'imagen:', item.image ? Math.round(item.image.length / 1024) + 'KB' : 'sin imagen');
    ctx.addMenuItem(item);
    setNewItem({ name: '', description: '', price: 0, category: 'cafe', image: '', popular: false });
    setShowAddForm(false);
    alert('✅ Producto agregado');
  };

  const handleUpdateItem = () => {
    if (!editingItem) return;
    console.log('✏️ Actualizando:', editingItem.name);
    ctx.updateMenuItem(editingItem);
    setEditingItem(null);
    alert('✅ Producto actualizado');
  };

  const handleDeleteItem = (id: string) => {
    if (!confirm('¿Eliminar este producto?')) return;
    ctx.deleteMenuItem(id);
  };

  // ==================== SAVES ====================
  const saveConfig = () => {
    const configToSave = { ...configForm, about: ctx.business.about };
    console.log('💾 Guardando config:', configToSave.name);
    ctx.updateBusiness(configToSave);
    alert('✅ Configuración guardada');
  };

  const saveAbout = () => {
    const bizToSave = { ...ctx.business, about: aboutForm };
    console.log('💾 Guardando nosotros');
    ctx.updateBusiness(bizToSave);
    alert('✅ Sección Nosotros guardada');
  };

  // ==================== RESERVATION ACTIONS ====================
  const updateResStatus = (id: string, status: 'pending' | 'confirmed' | 'cancelled') => {
    const res = ctx.reservations.find((r: Reservation) => r.id === id);
    if (res) {
      ctx.updateReservation({ ...res, status });
    }
  };

  const handleDeleteReservation = (id: string) => {
    if (!confirm('¿Eliminar esta reserva?')) return;
    ctx.deleteReservation(id);
  };

  // ==================== FILTERS ====================
  const categories = [
    { key: 'all', label: 'Todos', icon: '📋' },
    { key: 'cafe', label: 'Café', icon: '☕' },
    { key: 'postres', label: 'Postres', icon: '🥐' },
    { key: 'desayuno', label: 'Desayuno', icon: '🍳' },
    { key: 'otros', label: 'Otros', icon: '📦' },
  ];

  const filteredMenu = ctx.menuItems.filter((i: MenuItem) => menuFilter === 'all' || i.category === menuFilter);

  const filteredReservations = ctx.reservations.filter((r: Reservation) => {
    const matchStatus = resFilter === 'all' || r.status === resFilter;
    const matchSearch = !resSearch || r.name.toLowerCase().includes(resSearch.toLowerCase()) ||
      r.phone.includes(resSearch) || r.email.toLowerCase().includes(resSearch.toLowerCase());
    return matchStatus && matchSearch;
  });

  const resCounts = {
    pending: ctx.reservations.filter((r: Reservation) => r.status === 'pending').length,
    confirmed: ctx.reservations.filter((r: Reservation) => r.status === 'confirmed').length,
    cancelled: ctx.reservations.filter((r: Reservation) => r.status === 'cancelled').length,
  };

  // ==================== ABOUT FEATURES ====================
  const featureIcons = ['wifi', 'parking', 'music', 'pet', 'power', 'ac', 'garden', 'accessibility'];
  const featureEmojis: Record<string, string> = {
    wifi: '📶', parking: '🅿️', music: '🎵', pet: '🐾', power: '🔌', ac: '❄️', garden: '🌿', accessibility: '♿',
  };

  const addFeature = () => {
    const newFeature: AboutFeature = { id: Date.now().toString(), icon: 'wifi', label: 'Nuevo servicio', enabled: true };
    setAboutForm({ ...aboutForm, features: [...aboutForm.features, newFeature] });
  };

  const updateFeature = (index: number, updates: Partial<AboutFeature>) => {
    const features = [...aboutForm.features];
    features[index] = { ...features[index], ...updates };
    setAboutForm({ ...aboutForm, features });
  };

  const removeFeature = (index: number) => {
    setAboutForm({ ...aboutForm, features: aboutForm.features.filter((_: AboutFeature, i: number) => i !== index) });
  };

  // ==================== STYLES ====================
  const inputClass = 'w-full bg-stone-800/50 border border-stone-700 rounded-xl px-4 py-3 text-white placeholder-stone-500 focus:outline-none focus:border-white/30 transition-all text-sm';
  const btnPrimary = 'px-5 py-2.5 bg-white text-stone-900 rounded-xl hover:bg-stone-200 transition-all text-sm font-semibold shadow-sm';
  const btnSecondary = 'px-5 py-2.5 bg-stone-800 text-stone-300 rounded-xl hover:bg-stone-700 transition-all text-sm border border-stone-700';

  const tabs: { key: Tab; label: string; icon: string }[] = [
    { key: 'menu', label: 'Menú', icon: '🍽️' },
    { key: 'reservas', label: 'Reservas', icon: '📅' },
    { key: 'nosotros', label: 'Nosotros', icon: 'ℹ️' },
    { key: 'config', label: 'Config', icon: '⚙️' },
    { key: 'password', label: 'Clave', icon: '🔑' },
  ];

  const statusLabels: Record<string, string> = {
    pending: 'Pendiente',
    confirmed: 'Confirmada',
    cancelled: 'Rechazada',
  };

  return (
    <div className="min-h-screen bg-stone-950">
      {/* Top Bar */}
      <div className="sticky top-0 z-50 bg-stone-950/95 backdrop-blur-md border-b border-stone-800">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
          <button onClick={onBack} className="flex items-center gap-2 text-stone-400 hover:text-white transition-colors text-sm">
            ← Volver al sitio
          </button>
          <h1 className="text-white font-bold text-lg">Panel Admin</h1>
          <button onClick={onBack} className="text-stone-500 hover:text-red-400 transition-colors text-sm">
            Salir
          </button>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-8">
        {/* Tabs */}
        <div className="flex flex-wrap justify-center gap-2 mb-8">
          {tabs.map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`px-4 py-2.5 rounded-xl text-sm font-medium transition-all flex items-center gap-2 ${
                tab === t.key
                  ? 'bg-white text-stone-900 shadow-lg'
                  : 'bg-stone-800/50 text-stone-400 hover:bg-stone-800 border border-stone-700/50'
              }`}
            >
              <span>{t.icon}</span>
              <span className="hidden sm:inline">{t.label}</span>
            </button>
          ))}
        </div>

        <div className="bg-stone-900/50 border border-stone-800 rounded-2xl p-5 sm:p-8">

          {/* ============ MENÚ ============ */}
          {tab === 'menu' && (
            <div className="space-y-6">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <h3 className="text-xl font-bold text-white">Gestión del Menú</h3>
                <button onClick={() => { setShowAddForm(!showAddForm); setEditingItem(null); }} className={btnPrimary}>
                  {showAddForm ? '✕ Cerrar' : '+ Agregar Producto'}
                </button>
              </div>

              {/* Category Filters */}
              <div className="flex flex-wrap gap-2">
                {categories.map((c) => (
                  <button
                    key={c.key}
                    onClick={() => setMenuFilter(c.key)}
                    className={`px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                      menuFilter === c.key ? 'bg-white/15 text-white border border-white/30' : 'bg-stone-800/50 text-stone-500 border border-stone-700/50'
                    }`}
                  >
                    {c.icon} {c.label}
                  </button>
                ))}
              </div>

              {/* Add Form */}
              {showAddForm && (
                <div className="bg-stone-800/30 border border-white/10 rounded-xl p-5 space-y-4">
                  <h4 className="text-white font-semibold">Nuevo Producto</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <input placeholder="Nombre *" value={newItem.name} onChange={(e) => setNewItem({ ...newItem, name: e.target.value })} className={inputClass} />
                    <input placeholder="Precio *" type="number" step="0.01" value={newItem.price || ''} onChange={(e) => setNewItem({ ...newItem, price: Number(e.target.value) })} className={inputClass} />
                  </div>
                  <textarea placeholder="Descripción" value={newItem.description} onChange={(e) => setNewItem({ ...newItem, description: e.target.value })} className={inputClass + ' resize-none'} rows={2} />

                  <div className="flex flex-wrap gap-3 items-center">
                    <select value={newItem.category} onChange={(e) => setNewItem({ ...newItem, category: e.target.value })} className={inputClass + ' !w-auto'}>
                      {categories.filter(c => c.key !== 'all').map(c => (
                        <option key={c.key} value={c.key} className="bg-stone-900">{c.icon} {c.label}</option>
                      ))}
                    </select>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" checked={newItem.popular} onChange={(e) => setNewItem({ ...newItem, popular: e.target.checked })} className="accent-white" />
                      <span className="text-stone-400 text-sm">⭐ Popular</span>
                    </label>

                    {/* FILE INPUT — EXACT PATTERN FROM REFERENCE */}
                    <input type="file" ref={menuImageRef} onChange={(e) => handleMenuImageUpload(e, 'new')} accept="image/*" className="hidden" />
                    <button onClick={() => menuImageRef.current?.click()} className={btnSecondary}>
                      📷 Subir foto
                    </button>
                    {newItem.image && (
                      <div className="relative">
                        <img src={newItem.image} alt="preview" className="w-14 h-14 rounded-lg object-cover border border-stone-700" />
                        <button onClick={() => setNewItem({ ...newItem, image: '' })} className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white rounded-full text-xs flex items-center justify-center">✕</button>
                      </div>
                    )}
                  </div>

                  <div className="flex gap-3">
                    <button onClick={handleAddItem} className={btnPrimary}>✅ Agregar</button>
                    <button onClick={() => setShowAddForm(false)} className={btnSecondary}>Cancelar</button>
                  </div>
                </div>
              )}

              {/* Edit Form */}
              {editingItem && (
                <div className="bg-stone-800/30 border border-blue-500/20 rounded-xl p-5 space-y-4">
                  <h4 className="text-white font-semibold">Editando: {editingItem.name}</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <input value={editingItem.name} onChange={(e) => setEditingItem({ ...editingItem, name: e.target.value })} className={inputClass} />
                    <input type="number" step="0.01" value={editingItem.price} onChange={(e) => setEditingItem({ ...editingItem, price: Number(e.target.value) })} className={inputClass} />
                  </div>
                  <textarea value={editingItem.description} onChange={(e) => setEditingItem({ ...editingItem, description: e.target.value })} className={inputClass + ' resize-none'} rows={2} />

                  <div className="flex flex-wrap gap-3 items-center">
                    <select value={editingItem.category} onChange={(e) => setEditingItem({ ...editingItem, category: e.target.value })} className={inputClass + ' !w-auto'}>
                      {categories.filter(c => c.key !== 'all').map(c => (
                        <option key={c.key} value={c.key} className="bg-stone-900">{c.icon} {c.label}</option>
                      ))}
                    </select>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" checked={editingItem.popular || false} onChange={(e) => setEditingItem({ ...editingItem, popular: e.target.checked })} className="accent-white" />
                      <span className="text-stone-400 text-sm">⭐ Popular</span>
                    </label>

                    {/* FILE INPUT — EXACT PATTERN FROM REFERENCE */}
                    <input type="file" ref={editImageRef} onChange={(e) => handleMenuImageUpload(e, 'edit')} accept="image/*" className="hidden" />
                    <button onClick={() => editImageRef.current?.click()} className={btnSecondary}>
                      📷 Cambiar foto
                    </button>
                    {editingItem.image && (
                      <div className="relative">
                        <img src={editingItem.image} alt="preview" className="w-14 h-14 rounded-lg object-cover border border-stone-700" />
                        <button onClick={() => setEditingItem({ ...editingItem, image: '' })} className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white rounded-full text-xs flex items-center justify-center">✕</button>
                      </div>
                    )}
                  </div>

                  <div className="flex gap-3">
                    <button onClick={handleUpdateItem} className={btnPrimary}>💾 Guardar</button>
                    <button onClick={() => setEditingItem(null)} className={btnSecondary}>Cancelar</button>
                  </div>
                </div>
              )}

              {/* Items List */}
              <div className="space-y-3">
                {filteredMenu.length === 0 && (
                  <p className="text-stone-600 text-center py-8">No hay productos en esta categoría.</p>
                )}
                {filteredMenu.map((item: MenuItem) => (
                  <div key={item.id} className="flex items-center gap-4 p-4 rounded-xl border bg-stone-800/20 border-stone-800 transition-all hover:border-stone-700">
                    {item.image ? (
                      <img src={item.image} alt={item.name} className="w-14 h-14 rounded-xl object-cover flex-shrink-0" />
                    ) : (
                      <div className="w-14 h-14 rounded-xl bg-stone-800 flex items-center justify-center text-2xl flex-shrink-0">☕</div>
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-white font-medium truncate">{item.name}</span>
                        {item.popular && <span className="text-xs text-white bg-white/10 px-2 py-0.5 rounded">⭐</span>}
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-white text-sm font-semibold">${item.price.toFixed(2)}</span>
                        <span className="text-stone-600 text-xs">{categories.find(c => c.key === item.category)?.icon} {categories.find(c => c.key === item.category)?.label}</span>
                      </div>
                    </div>
                    <div className="flex gap-2 flex-shrink-0">
                      <button onClick={() => { setEditingItem(item); setShowAddForm(false); }} className="p-2 text-stone-400 hover:text-blue-400 transition-colors" title="Editar">✏️</button>
                      <button onClick={() => handleDeleteItem(item.id)} className="p-2 text-stone-400 hover:text-red-400 transition-colors" title="Eliminar">🗑️</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ============ RESERVAS ============ */}
          {tab === 'reservas' && (
            <div className="space-y-6">
              <h3 className="text-xl font-bold text-white">Gestión de Reservas</h3>

              <div className="grid grid-cols-3 gap-3">
                <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-4 text-center">
                  <div className="text-2xl font-bold text-yellow-400">{resCounts.pending}</div>
                  <div className="text-yellow-400/60 text-xs mt-1">Pendientes</div>
                </div>
                <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-4 text-center">
                  <div className="text-2xl font-bold text-green-400">{resCounts.confirmed}</div>
                  <div className="text-green-400/60 text-xs mt-1">Confirmadas</div>
                </div>
                <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 text-center">
                  <div className="text-2xl font-bold text-red-400">{resCounts.cancelled}</div>
                  <div className="text-red-400/60 text-xs mt-1">Rechazadas</div>
                </div>
              </div>

              <div className="flex flex-wrap gap-3">
                <input placeholder="🔍 Buscar..." value={resSearch} onChange={(e) => setResSearch(e.target.value)} className={inputClass + ' sm:!w-64'} />
                <div className="flex gap-2">
                  {(['all', 'pending', 'confirmed', 'cancelled'] as const).map((f) => (
                    <button key={f} onClick={() => setResFilter(f)}
                      className={`px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                        resFilter === f ? 'bg-white/15 text-white border border-white/30' : 'bg-stone-800/50 text-stone-500 border border-stone-700/50'
                      }`}
                    >
                      {f === 'all' ? 'Todas' : statusLabels[f]}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                {filteredReservations.length === 0 && (
                  <p className="text-stone-600 text-center py-8">No hay reservas.</p>
                )}
                {filteredReservations.map((r: Reservation) => (
                  <div key={r.id} className="bg-stone-800/20 border border-stone-800 rounded-xl p-4 space-y-3">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h4 className="text-white font-semibold">{r.name}</h4>
                        <div className="flex flex-wrap gap-x-4 gap-y-1 text-stone-500 text-xs mt-1">
                          <span>📞 {r.phone}</span>
                          {r.email && <span>✉️ {r.email}</span>}
                          <span>📅 {r.date}</span>
                          <span>🕐 {r.time}</span>
                          <span>👥 {r.guests}</span>
                        </div>
                        {r.notes && <p className="text-stone-600 text-xs mt-2 italic">"{r.notes}"</p>}
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap ${
                        r.status === 'pending' ? 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/30' :
                        r.status === 'confirmed' ? 'bg-green-500/20 text-green-300 border border-green-500/30' :
                        'bg-red-500/20 text-red-300 border border-red-500/30'
                      }`}>
                        {statusLabels[r.status]}
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-2 pt-2 border-t border-stone-800">
                      {r.status !== 'confirmed' && (
                        <button onClick={() => updateResStatus(r.id, 'confirmed')} className="px-3 py-1.5 text-xs bg-green-500/10 text-green-400 rounded-lg hover:bg-green-500/20 transition-all">✅ Confirmar</button>
                      )}
                      {r.status !== 'cancelled' && (
                        <button onClick={() => updateResStatus(r.id, 'cancelled')} className="px-3 py-1.5 text-xs bg-red-500/10 text-red-400 rounded-lg hover:bg-red-500/20 transition-all">❌ Rechazar</button>
                      )}
                      {r.status !== 'pending' && (
                        <button onClick={() => updateResStatus(r.id, 'pending')} className="px-3 py-1.5 text-xs bg-yellow-500/10 text-yellow-400 rounded-lg hover:bg-yellow-500/20 transition-all">🟡 Pendiente</button>
                      )}
                      <button onClick={() => handleDeleteReservation(r.id)} className="px-3 py-1.5 text-xs bg-stone-800 text-stone-500 rounded-lg hover:bg-red-500/10 hover:text-red-400 transition-all ml-auto">🗑️</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ============ NOSOTROS ============ */}
          {tab === 'nosotros' && (
            <div className="space-y-6">
              <h3 className="text-xl font-bold text-white">Sección Nosotros</h3>

              {/* Image */}
              <div>
                <label className="text-stone-400 text-xs uppercase tracking-wider mb-2 block">Imagen</label>
                <div className="flex items-center gap-4">
                  {aboutForm.image ? (
                    <img src={aboutForm.image} alt="About" className="w-24 h-24 rounded-xl object-cover border border-stone-700" />
                  ) : (
                    <div className="w-24 h-24 rounded-xl bg-stone-800 flex items-center justify-center text-stone-600 text-3xl">🖼️</div>
                  )}
                  <div className="flex flex-col gap-2">
                    <input type="file" ref={aboutImageRef} onChange={handleAboutImageUpload} accept="image/*" className="hidden" />
                    <button onClick={() => aboutImageRef.current?.click()} className={btnSecondary}>📷 Subir foto</button>
                    {aboutForm.image && (
                      <button onClick={() => setAboutForm({ ...aboutForm, image: '' })} className="text-red-400 hover:text-red-300 text-xs">Quitar</button>
                    )}
                  </div>
                </div>
              </div>

              {/* Floating Card */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-stone-400 text-xs uppercase tracking-wider mb-1.5 block">Dato destacado (ej: +5)</label>
                  <input value={aboutForm.floatingNumber} onChange={(e) => setAboutForm({ ...aboutForm, floatingNumber: e.target.value })} className={inputClass} />
                </div>
                <div>
                  <label className="text-stone-400 text-xs uppercase tracking-wider mb-1.5 block">Texto del dato</label>
                  <input value={aboutForm.floatingText} onChange={(e) => setAboutForm({ ...aboutForm, floatingText: e.target.value })} className={inputClass} />
                </div>
              </div>

              {/* Texts */}
              <div>
                <label className="text-stone-400 text-xs uppercase tracking-wider mb-1.5 block">Etiqueta superior</label>
                <input value={aboutForm.sectionLabel} onChange={(e) => setAboutForm({ ...aboutForm, sectionLabel: e.target.value })} className={inputClass} />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-stone-400 text-xs uppercase tracking-wider mb-1.5 block">Título</label>
                  <input value={aboutForm.title} onChange={(e) => setAboutForm({ ...aboutForm, title: e.target.value })} className={inputClass} />
                </div>
                <div>
                  <label className="text-stone-400 text-xs uppercase tracking-wider mb-1.5 block">Palabra destacada</label>
                  <input value={aboutForm.titleHighlight} onChange={(e) => setAboutForm({ ...aboutForm, titleHighlight: e.target.value })} className={inputClass} />
                </div>
              </div>
              <div>
                <label className="text-stone-400 text-xs uppercase tracking-wider mb-1.5 block">Párrafo 1</label>
                <textarea value={aboutForm.paragraph1} onChange={(e) => setAboutForm({ ...aboutForm, paragraph1: e.target.value })} className={inputClass + ' resize-none'} rows={3} />
              </div>
              <div>
                <label className="text-stone-400 text-xs uppercase tracking-wider mb-1.5 block">Párrafo 2</label>
                <textarea value={aboutForm.paragraph2} onChange={(e) => setAboutForm({ ...aboutForm, paragraph2: e.target.value })} className={inputClass + ' resize-none'} rows={3} />
              </div>

              {/* Features / Amenidades */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <label className="text-stone-400 text-xs uppercase tracking-wider">Amenidades y Servicios</label>
                  <button onClick={addFeature} className="text-white text-xs hover:text-stone-300">+ Agregar</button>
                </div>
                <div className="space-y-2">
                  {aboutForm.features.map((f: AboutFeature, i: number) => (
                    <div key={f.id} className="flex items-center gap-3 bg-stone-800/30 rounded-lg p-3">
                      <select value={f.icon} onChange={(e) => updateFeature(i, { icon: e.target.value })} className="bg-stone-800 border border-stone-700 rounded-lg px-2 py-1 text-lg cursor-pointer">
                        {featureIcons.map(icon => <option key={icon} value={icon}>{featureEmojis[icon] || '☕'} {icon}</option>)}
                      </select>
                      <input value={f.label} onChange={(e) => updateFeature(i, { label: e.target.value })} className="flex-1 bg-transparent border-b border-stone-700 text-white text-sm px-1 py-1 focus:outline-none focus:border-white/50" />
                      <button onClick={() => updateFeature(i, { enabled: !f.enabled })} className={`text-xs px-2 py-1 rounded ${f.enabled ? 'text-green-400' : 'text-stone-600'}`}>
                        {f.enabled ? '✅' : '❌'}
                      </button>
                      <button onClick={() => removeFeature(i)} className="text-red-400/50 hover:text-red-400 text-sm">🗑️</button>
                    </div>
                  ))}
                </div>
              </div>

              <button onClick={saveAbout} className={btnPrimary}>💾 Guardar Nosotros</button>
            </div>
          )}

          {/* ============ CONFIG ============ */}
          {tab === 'config' && (
            <div className="space-y-6">
              <h3 className="text-xl font-bold text-white">Configuración del Negocio</h3>

              {/* Logo */}
              <div>
                <label className="text-stone-400 text-xs uppercase tracking-wider mb-2 block">Logo</label>
                <div className="flex items-center gap-4">
                  {configForm.logo ? (
                    <img src={configForm.logo} alt="Logo" className="w-16 h-16 rounded-full object-cover border-2 border-white/30" />
                  ) : (
                    <div className="w-16 h-16 rounded-full bg-stone-800 border border-stone-700 flex items-center justify-center text-stone-600 text-2xl">
                      {configForm.name?.charAt(0) || '?'}
                    </div>
                  )}
                  <div className="flex gap-2">
                    <input type="file" ref={logoRef} onChange={handleLogoUpload} accept="image/*" className="hidden" />
                    <button onClick={() => logoRef.current?.click()} className={btnSecondary}>📷 Subir logo</button>
                    {configForm.logo && (
                      <button onClick={() => setConfigForm({ ...configForm, logo: '' })} className="px-3 py-2 text-red-400 hover:text-red-300 text-sm">Quitar</button>
                    )}
                  </div>
                </div>
              </div>

              {/* Hero Image */}
              <div>
                <label className="text-stone-400 text-xs uppercase tracking-wider mb-2 block">Imagen del Banner</label>
                <div className="flex items-center gap-4">
                  {configForm.heroImage ? (
                    <img src={configForm.heroImage} alt="Hero" className="w-32 h-20 rounded-xl object-cover border border-stone-700" />
                  ) : (
                    <div className="w-32 h-20 rounded-xl bg-stone-800 flex items-center justify-center text-stone-600">🖼️</div>
                  )}
                  <div className="flex flex-col gap-2">
                    <input type="file" ref={heroRef} onChange={handleHeroUpload} accept="image/*" className="hidden" />
                    <button onClick={() => heroRef.current?.click()} className={btnSecondary}>📷 Subir banner</button>
                    {configForm.heroImage && (
                      <button onClick={() => setConfigForm({ ...configForm, heroImage: '' })} className="text-red-400 hover:text-red-300 text-xs">Quitar</button>
                    )}
                  </div>
                </div>
              </div>

              {/* Texts */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-stone-400 text-xs uppercase tracking-wider mb-1.5 block">Nombre</label>
                  <input value={configForm.name} onChange={(e) => setConfigForm({ ...configForm, name: e.target.value })} className={inputClass} />
                </div>
                <div>
                  <label className="text-stone-400 text-xs uppercase tracking-wider mb-1.5 block">Subtítulo</label>
                  <input value={configForm.subtitle} onChange={(e) => setConfigForm({ ...configForm, subtitle: e.target.value })} className={inputClass} />
                </div>
              </div>
              <div>
                <label className="text-stone-400 text-xs uppercase tracking-wider mb-1.5 block">Descripción</label>
                <textarea value={configForm.description} onChange={(e) => setConfigForm({ ...configForm, description: e.target.value })} className={inputClass + ' resize-none'} rows={2} />
              </div>

              <h4 className="text-white font-semibold pt-2">Ubicación</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-stone-400 text-xs uppercase tracking-wider mb-1.5 block">Dirección</label>
                  <input value={configForm.address} onChange={(e) => setConfigForm({ ...configForm, address: e.target.value })} className={inputClass} />
                </div>
                <div>
                  <label className="text-stone-400 text-xs uppercase tracking-wider mb-1.5 block">Ciudad / CP</label>
                  <input value={configForm.city} onChange={(e) => setConfigForm({ ...configForm, city: e.target.value })} className={inputClass} />
                </div>
              </div>
              <div>
                <label className="text-stone-400 text-xs uppercase tracking-wider mb-1.5 block">URL del Mapa</label>
                <input value={configForm.mapUrl} onChange={(e) => setConfigForm({ ...configForm, mapUrl: e.target.value })} className={inputClass} />
              </div>

              <h4 className="text-white font-semibold pt-2">Horarios</h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="text-stone-400 text-xs uppercase tracking-wider mb-1.5 block">Lun - Vie</label>
                  <input value={configForm.hours.weekdays} onChange={(e) => setConfigForm({ ...configForm, hours: { ...configForm.hours, weekdays: e.target.value } })} className={inputClass} />
                </div>
                <div>
                  <label className="text-stone-400 text-xs uppercase tracking-wider mb-1.5 block">Sábado</label>
                  <input value={configForm.hours.saturday} onChange={(e) => setConfigForm({ ...configForm, hours: { ...configForm.hours, saturday: e.target.value } })} className={inputClass} />
                </div>
                <div>
                  <label className="text-stone-400 text-xs uppercase tracking-wider mb-1.5 block">Domingo</label>
                  <input value={configForm.hours.sunday} onChange={(e) => setConfigForm({ ...configForm, hours: { ...configForm.hours, sunday: e.target.value } })} className={inputClass} />
                </div>
              </div>

              <h4 className="text-white font-semibold pt-2">Contacto</h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="text-stone-400 text-xs uppercase tracking-wider mb-1.5 block">Teléfono</label>
                  <input value={configForm.phone} onChange={(e) => setConfigForm({ ...configForm, phone: e.target.value })} className={inputClass} />
                </div>
                <div>
                  <label className="text-stone-400 text-xs uppercase tracking-wider mb-1.5 block">Email</label>
                  <input value={configForm.email} onChange={(e) => setConfigForm({ ...configForm, email: e.target.value })} className={inputClass} />
                </div>
                <div>
                  <label className="text-stone-400 text-xs uppercase tracking-wider mb-1.5 block">Instagram</label>
                  <input value={configForm.instagram} onChange={(e) => setConfigForm({ ...configForm, instagram: e.target.value })} className={inputClass} />
                </div>
              </div>

              <button onClick={saveConfig} className={btnPrimary}>💾 Guardar Configuración</button>
            </div>
          )}

          {/* ============ PASSWORD ============ */}
          {tab === 'password' && (
            <div className="space-y-6 max-w-md">
              <h3 className="text-xl font-bold text-white">Cambiar Contraseña</h3>
              <div>
                <label className="text-stone-400 text-xs uppercase tracking-wider mb-1.5 block">Contraseña actual</label>
                <input type="password" value={oldPass} onChange={(e) => setOldPass(e.target.value)} className={inputClass} />
              </div>
              <div>
                <label className="text-stone-400 text-xs uppercase tracking-wider mb-1.5 block">Nueva contraseña</label>
                <input type="password" value={newPass} onChange={(e) => setNewPass(e.target.value)} className={inputClass} />
              </div>
              <div>
                <label className="text-stone-400 text-xs uppercase tracking-wider mb-1.5 block">Confirmar nueva</label>
                <input type="password" value={confirmPass} onChange={(e) => setConfirmPass(e.target.value)} className={inputClass} />
              </div>
              {passMsg && <p className={`text-sm ${passMsg.includes('✅') ? 'text-green-400' : 'text-red-400'}`}>{passMsg}</p>}
              <button
                onClick={() => {
                  if (oldPass !== 'admin123') { setPassMsg('❌ Contraseña actual incorrecta'); return; }
                  if (newPass.length < 4) { setPassMsg('❌ Mínimo 4 caracteres'); return; }
                  if (newPass !== confirmPass) { setPassMsg('❌ No coinciden'); return; }
                  setPassMsg('✅ Contraseña actualizada');
                  setOldPass(''); setNewPass(''); setConfirmPass('');
                  setTimeout(() => setPassMsg(''), 3000);
                }}
                className={btnPrimary}
              >
                🔑 Cambiar Contraseña
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
