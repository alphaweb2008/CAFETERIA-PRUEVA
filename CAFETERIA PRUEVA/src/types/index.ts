export interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  image: string;
  popular?: boolean;
}

export interface Reservation {
  id: string;
  name: string;
  phone: string;
  email: string;
  date: string;
  time: string;
  guests: number;
  notes: string;
  status: 'pending' | 'confirmed' | 'cancelled';
  createdAt: string;
}

export interface AboutFeature {
  id: string;
  icon: string; // icon name: 'wifi' | 'parking' | 'music' | 'pet' | 'power' | 'ac' | 'garden' | 'accessibility' | 'custom'
  label: string;
  enabled: boolean;
}

export interface AboutConfig {
  sectionLabel: string;        // "Nuestra historia"
  title: string;               // "Un espacio pensado para"
  titleHighlight: string;      // "inspirarte"
  paragraph1: string;
  paragraph2: string;
  image: string;               // about section image
  floatingNumber: string;      // "+5"
  floatingText: string;        // "Años sirviendo café de especialidad"
  features: AboutFeature[];
}

export interface BusinessConfig {
  name: string;
  subtitle: string;
  description: string;
  logo: string;
  heroImage: string;
  address: string;
  city: string;
  phone: string;
  email: string;
  instagram: string;
  mapUrl: string;
  hours: {
    weekdays: string;
    saturday: string;
    sunday: string;
  };
  about: AboutConfig;
}

export interface Category {
  id: string;
  name: string;
  icon: string;
}
