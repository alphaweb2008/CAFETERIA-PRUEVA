import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus,
  Pencil,
  Trash2,
  X,
  Star,
  Search,
  ImageIcon,
  Save,
  FolderPlus,
  Upload,
  Link,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { MenuItem } from '../../types';

const emptyItem: MenuItem = {
  id: '',
  name: '',
  description: '',
  price: 0,
  category: '',
  image: '',
  popular: false,
};

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

export function AdminMenuManager() {
  const { menuItems, categories, addMenuItem, updateMenuItem, deleteMenuItem, addCategory, deleteCategory } = useApp();
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [newCatName, setNewCatName] = useState('');
  const [newCatIcon, setNewCatIcon] = useState('');
  const [imageMode, setImageMode] = useState<'upload' | 'url'>('upload');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const filteredItems = menuItems.filter((item) => {
    const matchCategory = filterCategory === 'all' || item.category === filterCategory;
    const matchSearch =
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCategory && matchSearch;
  });

  const handleNew = () => {
    setEditingItem({
      ...emptyItem,
      id: `item-${Date.now()}`,
      category: categories.length > 1 ? categories[1].id : '',
    });
    setIsNew(true);
    setImageMode('upload');
  };

  const handleEdit = (item: MenuItem) => {
    setEditingItem({ ...item });
    setIsNew(false);
    setImageMode(item.image && item.image.startsWith('http') ? 'url' : 'upload');
  };

  const handleSave = () => {
    if (!editingItem) return;
    if (!editingItem.name || !editingItem.price) return;
    if (isNew) {
      addMenuItem(editingItem);
    } else {
      updateMenuItem(editingItem);
    }
    setEditingItem(null);
  };

  const handleDelete = (id: string) => {
    deleteMenuItem(id);
    setShowDeleteConfirm(null);
  };

  const handleAddCategory = () => {
    if (!newCatName.trim()) return;
    const id = newCatName.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
    addCategory({ id, name: newCatName, icon: newCatIcon || '•' });
    setNewCatName('');
    setNewCatIcon('');
    setShowCategoryModal(false);
  };

  // Handle image upload — same as reference project
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !editingItem) return;
    const data = await compressImage(file, 600, 0.7);
    setEditingItem({ ...editingItem, image: data });
    e.target.value = '';
  };

  return (
    <div>
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar productos..."
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-stone-900/10 transition-all"
          />
        </div>
        <select
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value)}
          className="px-4 py-2.5 bg-white border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-stone-900/10"
        >
          <option value="all">Todas las categorías</option>
          {categories.filter((c) => c.id !== 'all').map((cat) => (
            <option key={cat.id} value={cat.id}>
              {cat.icon} {cat.name}
            </option>
          ))}
        </select>
        <button
          onClick={() => setShowCategoryModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-stone-200 hover:bg-stone-300 text-stone-700 rounded-xl text-sm font-medium transition-colors"
        >
          <FolderPlus className="w-4 h-4" />
          Categoría
        </button>
        <button
          onClick={handleNew}
          className="flex items-center gap-2 px-5 py-2.5 bg-stone-900 hover:bg-stone-700 text-white rounded-xl text-sm font-medium transition-colors"
        >
          <Plus className="w-4 h-4" />
          Nuevo Producto
        </button>
      </div>

      {/* Categories management bar */}
      <div className="flex gap-2 flex-wrap mb-4">
        {categories.filter((c) => c.id !== 'all').map((cat) => (
          <div
            key={cat.id}
            className="flex items-center gap-1.5 bg-white border border-stone-200 rounded-lg px-3 py-1.5 text-xs text-stone-600"
          >
            <span>{cat.icon}</span>
            <span>{cat.name}</span>
            <button
              onClick={() => deleteCategory(cat.id)}
              className="ml-1 text-stone-300 hover:text-red-500 transition-colors"
              title="Eliminar categoría"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        ))}
      </div>

      {/* Items Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredItems.map((item) => (
          <div
            key={item.id}
            className="bg-white border border-stone-200 rounded-2xl overflow-hidden hover:shadow-md transition-all"
          >
            <div className="relative h-36">
              {item.image ? (
                <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-stone-100 flex items-center justify-center">
                  <ImageIcon className="w-8 h-8 text-stone-300" />
                </div>
              )}
              {item.popular && (
                <div className="absolute top-2 left-2 flex items-center gap-1 bg-amber-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                  <Star className="w-2.5 h-2.5 fill-current" />
                  Popular
                </div>
              )}
              <div className="absolute top-2 right-2 bg-stone-900/70 text-white text-xs font-bold px-2.5 py-1 rounded-lg">
                ${item.price.toFixed(2)}
              </div>
            </div>
            <div className="p-4">
              <h3 className="font-semibold text-stone-900 text-sm">{item.name}</h3>
              <p className="text-stone-400 text-xs mt-1 line-clamp-2">{item.description}</p>
              <div className="flex items-center justify-between mt-3 pt-3 border-t border-stone-100">
                <span className="text-xs text-stone-400 bg-stone-50 px-2 py-1 rounded-lg">
                  {categories.find((c) => c.id === item.category)?.name || item.category}
                </span>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleEdit(item)}
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-stone-400 hover:bg-stone-100 hover:text-stone-900 transition-colors"
                  >
                    <Pencil className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => setShowDeleteConfirm(item.id)}
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-stone-400 hover:bg-red-50 hover:text-red-500 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredItems.length === 0 && (
        <div className="text-center py-16">
          <ImageIcon className="w-12 h-12 text-stone-300 mx-auto mb-3" />
          <p className="text-stone-400 text-sm">No se encontraron productos</p>
          <button onClick={handleNew} className="mt-3 text-stone-900 underline text-sm font-medium">
            Crear uno nuevo
          </button>
        </div>
      )}

      {/* Edit/Create Modal */}
      <AnimatePresence>
        {editingItem && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={() => setEditingItem(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-3xl w-full max-w-lg max-h-[90vh] overflow-y-auto"
            >
              <div className="p-6 border-b border-stone-100 flex items-center justify-between">
                <h2 className="text-lg font-bold text-stone-900">
                  {isNew ? 'Nuevo Producto' : 'Editar Producto'}
                </h2>
                <button
                  onClick={() => setEditingItem(null)}
                  className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-stone-100 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="p-6 space-y-4">
                {/* Image Section */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-xs font-medium text-stone-500 uppercase tracking-wider">
                      Imagen del producto
                    </label>
                    <div className="flex bg-stone-100 rounded-lg p-0.5">
                      <button
                        type="button"
                        onClick={() => setImageMode('upload')}
                        className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-medium transition-all ${
                          imageMode === 'upload'
                            ? 'bg-white text-stone-900 shadow-sm'
                            : 'text-stone-500 hover:text-stone-700'
                        }`}
                      >
                        <Upload className="w-3 h-3" />
                        Subir
                      </button>
                      <button
                        type="button"
                        onClick={() => setImageMode('url')}
                        className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-medium transition-all ${
                          imageMode === 'url'
                            ? 'bg-white text-stone-900 shadow-sm'
                            : 'text-stone-500 hover:text-stone-700'
                        }`}
                      >
                        <Link className="w-3 h-3" />
                        URL
                      </button>
                    </div>
                  </div>

                  {imageMode === 'upload' ? (
                    <div>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                      />

                      <div
                        onClick={() => fileInputRef.current?.click()}
                        className={`relative border-2 border-dashed rounded-xl cursor-pointer transition-all overflow-hidden ${
                          editingItem.image
                            ? 'border-stone-200 hover:border-stone-400'
                            : 'border-stone-300 hover:border-stone-500 bg-stone-50'
                        }`}
                      >
                        {editingItem.image ? (
                          <div className="relative h-40">
                            <img
                              src={editingItem.image}
                              alt="Preview"
                              className="w-full h-full object-cover"
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
                                setEditingItem({ ...editingItem, image: '' });
                              }}
                              className="absolute top-2 right-2 w-7 h-7 bg-red-500 hover:bg-red-600 text-white rounded-lg flex items-center justify-center transition-colors shadow-lg"
                            >
                              <X className="w-3.5 h-3.5" />
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
                        value={editingItem.image}
                        onChange={(e) => setEditingItem({ ...editingItem, image: e.target.value })}
                        placeholder="https://images.unsplash.com/..."
                        className="w-full px-4 py-2.5 border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-stone-900/10"
                      />
                      {editingItem.image && editingItem.image.startsWith('http') && (
                        <div className="mt-2 h-32 rounded-xl overflow-hidden border border-stone-200">
                          <img
                            src={editingItem.image}
                            alt="Preview"
                            className="w-full h-full object-cover"
                            onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                          />
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Name */}
                <div>
                  <label className="block text-xs font-medium text-stone-500 uppercase tracking-wider mb-1.5">
                    Nombre *
                  </label>
                  <input
                    type="text"
                    value={editingItem.name}
                    onChange={(e) => setEditingItem({ ...editingItem, name: e.target.value })}
                    placeholder="Ej: Cappuccino"
                    className="w-full px-4 py-2.5 border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-stone-900/10"
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="block text-xs font-medium text-stone-500 uppercase tracking-wider mb-1.5">
                    Descripción
                  </label>
                  <textarea
                    value={editingItem.description}
                    onChange={(e) => setEditingItem({ ...editingItem, description: e.target.value })}
                    rows={3}
                    placeholder="Describe el producto..."
                    className="w-full px-4 py-2.5 border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-stone-900/10 resize-none"
                  />
                </div>

                {/* Price & Category */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-stone-500 uppercase tracking-wider mb-1.5">
                      Precio *
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={editingItem.price || ''}
                      onChange={(e) =>
                        setEditingItem({ ...editingItem, price: parseFloat(e.target.value) || 0 })
                      }
                      placeholder="0.00"
                      className="w-full px-4 py-2.5 border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-stone-900/10"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-stone-500 uppercase tracking-wider mb-1.5">
                      Categoría
                    </label>
                    <select
                      value={editingItem.category}
                      onChange={(e) =>
                        setEditingItem({ ...editingItem, category: e.target.value })
                      }
                      className="w-full px-4 py-2.5 border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-stone-900/10"
                    >
                      <option value="">Seleccionar...</option>
                      {categories.filter((c) => c.id !== 'all').map((cat) => (
                        <option key={cat.id} value={cat.id}>
                          {cat.icon} {cat.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Popular Toggle */}
                <label className="flex items-center gap-3 cursor-pointer">
                  <div
                    className={`w-11 h-6 rounded-full relative transition-colors ${
                      editingItem.popular ? 'bg-amber-500' : 'bg-stone-200'
                    }`}
                    onClick={() =>
                      setEditingItem({ ...editingItem, popular: !editingItem.popular })
                    }
                  >
                    <div
                      className={`w-5 h-5 bg-white rounded-full absolute top-0.5 shadow transition-transform ${
                        editingItem.popular ? 'translate-x-5.5' : 'translate-x-0.5'
                      }`}
                    />
                  </div>
                  <span className="text-sm text-stone-600">Marcar como popular</span>
                </label>
              </div>

              <div className="p-6 border-t border-stone-100 flex gap-3">
                <button
                  onClick={() => setEditingItem(null)}
                  className="flex-1 px-4 py-3 border border-stone-200 rounded-xl text-sm font-medium text-stone-600 hover:bg-stone-50 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleSave}
                  disabled={!editingItem.name || !editingItem.price}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-stone-900 text-white rounded-xl text-sm font-medium hover:bg-stone-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  <Save className="w-4 h-4" />
                  {isNew ? 'Crear Producto' : 'Guardar Cambios'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Delete Confirmation */}
      <AnimatePresence>
        {showDeleteConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={() => setShowDeleteConfirm(null)}
          >
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl p-6 max-w-sm w-full"
            >
              <h3 className="text-lg font-bold text-stone-900 mb-2">¿Eliminar producto?</h3>
              <p className="text-stone-500 text-sm mb-6">
                Esta acción no se puede deshacer. El producto será eliminado del menú.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowDeleteConfirm(null)}
                  className="flex-1 px-4 py-2.5 border border-stone-200 rounded-xl text-sm font-medium hover:bg-stone-50 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={() => handleDelete(showDeleteConfirm)}
                  className="flex-1 px-4 py-2.5 bg-red-500 text-white rounded-xl text-sm font-medium hover:bg-red-600 transition-colors"
                >
                  Eliminar
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Category Modal */}
      <AnimatePresence>
        {showCategoryModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={() => setShowCategoryModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl p-6 max-w-sm w-full"
            >
              <h3 className="text-lg font-bold text-stone-900 mb-4">Nueva Categoría</h3>
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-medium text-stone-500 uppercase tracking-wider mb-1.5">
                    Nombre
                  </label>
                  <input
                    type="text"
                    value={newCatName}
                    onChange={(e) => setNewCatName(e.target.value)}
                    placeholder="Ej: Smoothies"
                    className="w-full px-4 py-2.5 border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-stone-900/10"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-stone-500 uppercase tracking-wider mb-1.5">
                    Ícono (emoji)
                  </label>
                  <input
                    type="text"
                    value={newCatIcon}
                    onChange={(e) => setNewCatIcon(e.target.value)}
                    placeholder="🥤"
                    className="w-full px-4 py-2.5 border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-stone-900/10"
                  />
                </div>
              </div>
              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setShowCategoryModal(false)}
                  className="flex-1 px-4 py-2.5 border border-stone-200 rounded-xl text-sm font-medium hover:bg-stone-50 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleAddCategory}
                  disabled={!newCatName.trim()}
                  className="flex-1 px-4 py-2.5 bg-stone-900 text-white rounded-xl text-sm font-medium hover:bg-stone-700 disabled:opacity-40 transition-colors"
                >
                  Crear
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
