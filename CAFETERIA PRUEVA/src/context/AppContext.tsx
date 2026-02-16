import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { MenuItem, Reservation, BusinessConfig, Category, AboutConfig } from '../types';
import { menuItems as defaultMenuItems, categories as defaultCategories } from '../data/menu';
import * as fb from '../firebase/services';

const defaultAbout: AboutConfig = {
  sectionLabel: 'Nuestra historia',
  title: 'Un espacio pensado para',
  titleHighlight: 'inspirarte',
  paragraph1: 'En KAIRO creemos que el café es más que una bebida — es un ritual.',
  paragraph2: 'Nuestro espacio minimalista fue diseñado para que puedas disfrutar cada momento.',
  image: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=800&h=1000&fit=crop',
  floatingNumber: '+5',
  floatingText: 'Años sirviendo café de especialidad',
  features: [
    { id: 'wifi', icon: 'wifi', label: 'WiFi Gratis', enabled: true },
    { id: 'parking', icon: 'parking', label: 'Parking', enabled: true },
    { id: 'music', icon: 'music', label: 'Ambiente', enabled: true },
    { id: 'pet', icon: 'pet', label: 'Pet Friendly', enabled: false },
    { id: 'power', icon: 'power', label: 'Enchufes', enabled: false },
    { id: 'ac', icon: 'ac', label: 'Aire Acondicionado', enabled: false },
    { id: 'garden', icon: 'garden', label: 'Terraza', enabled: false },
    { id: 'accessibility', icon: 'accessibility', label: 'Accesible', enabled: false },
  ],
};

const defaultBiz: BusinessConfig = {
  name: 'KAIRO',
  subtitle: 'COFFEE',
  description: 'Café de especialidad en un espacio minimalista diseñado para inspirarte.',
  logo: '',
  heroImage: 'https://images.unsplash.com/photo-1447933601403-0c6688de566e?w=1600&h=900&fit=crop',
  address: 'Calle Artesanal 42, Colonia Centro',
  city: 'Ciudad de México, CP 06000',
  phone: '+52 55 1234 5678',
  email: 'hola@kairocoffee.mx',
  instagram: '@kairocoffee',
  mapUrl: '',
  hours: { weekdays: '7:00 — 21:00', saturday: '8:00 — 22:00', sunday: '9:00 — 18:00' },
  about: defaultAbout,
};

interface AppContextType {
  menuItems: MenuItem[];
  categories: Category[];
  reservations: Reservation[];
  business: BusinessConfig;
  addMenuItem: (item: MenuItem) => void;
  updateMenuItem: (item: MenuItem) => void;
  deleteMenuItem: (id: string) => void;
  addCategory: (cat: Category) => void;
  deleteCategory: (id: string) => void;
  addReservation: (res: Reservation) => void;
  updateReservation: (res: Reservation) => void;
  deleteReservation: (id: string) => void;
  updateBusiness: (config: BusinessConfig) => void;
}

const AppContext = createContext<AppContextType | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [menu, setMenu] = useState<MenuItem[]>(defaultMenuItems);
  const [cats, setCats] = useState<Category[]>(defaultCategories);
  const [res, setRes] = useState<Reservation[]>([]);
  const [biz, setBiz] = useState<BusinessConfig>(defaultBiz);

  // Subscribe to Firebase on mount — no test, just subscribe directly
  useEffect(() => {
    const u1 = fb.onMenu((items) => {
      if (items.length > 0) setMenu(items);
    });

    const u2 = fb.onCategories((c) => {
      if (c.length > 0) setCats(c);
    });

    const u3 = fb.onReservations((r) => {
      setRes(r);
    });

    const u4 = fb.onBusiness((config) => {
      if (config) {
        setBiz({
          ...defaultBiz,
          ...config,
          about: {
            ...defaultAbout,
            ...(config.about || {}),
            features: config.about?.features || defaultAbout.features,
          },
        });
      }
    });

    return () => { u1(); u2(); u3(); u4(); };
  }, []);

  // ─── CRUD — always write to Firebase, no conditions ────
  const addMenuItem = useCallback((item: MenuItem) => {
    setMenu(prev => [...prev, item]);
    fb.saveItem(item).catch(e => console.error('❌ add:', e));
  }, []);

  const updateMenuItem = useCallback((item: MenuItem) => {
    setMenu(prev => prev.map(i => i.id === item.id ? item : i));
    fb.saveItem(item).catch(e => console.error('❌ update:', e));
  }, []);

  const deleteMenuItem = useCallback((id: string) => {
    setMenu(prev => prev.filter(i => i.id !== id));
    fb.removeItem(id).catch(e => console.error('❌ delete:', e));
  }, []);

  const addCategory = useCallback((cat: Category) => {
    setCats(prev => [...prev, cat]);
    fb.saveCat(cat).catch(e => console.error('❌ addCat:', e));
  }, []);

  const deleteCategory = useCallback((id: string) => {
    setCats(prev => prev.filter(c => c.id !== id));
    fb.removeCat(id).catch(e => console.error('❌ delCat:', e));
  }, []);

  const addReservation = useCallback((r: Reservation) => {
    setRes(prev => [r, ...prev]);
    fb.saveRes(r).catch(e => console.error('❌ addRes:', e));
  }, []);

  const updateReservation = useCallback((r: Reservation) => {
    setRes(prev => prev.map(x => x.id === r.id ? r : x));
    fb.saveRes(r).catch(e => console.error('❌ updateRes:', e));
  }, []);

  const deleteReservation = useCallback((id: string) => {
    setRes(prev => prev.filter(r => r.id !== id));
    fb.removeRes(id).catch(e => console.error('❌ delRes:', e));
  }, []);

  const updateBusiness = useCallback((config: BusinessConfig) => {
    setBiz(config);
    fb.saveBusiness(config).catch(e => console.error('❌ saveBiz:', e));
  }, []);

  return (
    <AppContext.Provider value={{
      menuItems: menu, categories: cats, reservations: res, business: biz,
      addMenuItem, updateMenuItem, deleteMenuItem,
      addCategory, deleteCategory,
      addReservation, updateReservation, deleteReservation,
      updateBusiness,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be inside AppProvider');
  return ctx;
}
