import { motion } from 'framer-motion';
import {
  MapPin, Clock, Phone, Mail, Instagram,
  Wifi, ParkingMeter, Music, PawPrint, Plug, Wind, TreePalm, Accessibility,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { AboutFeature } from '../types';

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  wifi: Wifi,
  parking: ParkingMeter,
  music: Music,
  pet: PawPrint,
  power: Plug,
  ac: Wind,
  garden: TreePalm,
  accessibility: Accessibility,
};

function FeatureIcon({ feature }: { feature: AboutFeature }) {
  const Icon = iconMap[feature.icon];
  if (Icon) return <Icon className="w-5 h-5 text-stone-600 mx-auto mb-2" />;
  // For custom features, show an emoji or a dot
  return <span className="text-lg block mx-auto mb-1">{feature.icon}</span>;
}

export function BusinessInfo() {
  const { business } = useApp();
  const about = business.about;
  const enabledFeatures = about.features.filter((f) => f.enabled);

  return (
    <>
      {/* About / Nosotros */}
      <section id="nosotros" className="py-16 sm:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
            {/* Image Side */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="relative"
            >
              <div className="relative rounded-3xl overflow-hidden aspect-[4/5]">
                <img
                  src={about.image}
                  alt={`Interior ${business.name}`}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
              </div>
              {/* Floating card */}
              {(about.floatingNumber || about.floatingText) && (
                <div className="absolute -bottom-6 -right-4 sm:right-8 bg-stone-900 text-white p-5 sm:p-6 rounded-2xl shadow-2xl max-w-[220px]">
                  {about.floatingNumber && (
                    <span className="text-3xl sm:text-4xl font-bold block">{about.floatingNumber}</span>
                  )}
                  {about.floatingText && (
                    <span className="text-white/70 text-sm">{about.floatingText}</span>
                  )}
                </div>
              )}
            </motion.div>

            {/* Text Side */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <span className="inline-block text-xs uppercase tracking-[0.3em] text-stone-400 font-medium mb-3">
                {about.sectionLabel}
              </span>
              <h2 className="text-3xl sm:text-4xl font-bold text-stone-900 tracking-tight leading-tight">
                {about.title}
                {about.titleHighlight && (
                  <span className="text-amber-600"> {about.titleHighlight}</span>
                )}
              </h2>
              {about.paragraph1 && (
                <p className="text-stone-500 mt-4 leading-relaxed">
                  {about.paragraph1}
                </p>
              )}
              {about.paragraph2 && (
                <p className="text-stone-500 mt-3 leading-relaxed">
                  {about.paragraph2}
                </p>
              )}

              {/* Features */}
              {enabledFeatures.length > 0 && (
                <div className={`grid gap-4 mt-8 ${
                  enabledFeatures.length <= 3
                    ? `grid-cols-${enabledFeatures.length}`
                    : enabledFeatures.length === 4
                    ? 'grid-cols-2 sm:grid-cols-4'
                    : 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-4'
                }`}>
                  {enabledFeatures.map((feature) => (
                    <div key={feature.id} className="text-center p-4 bg-stone-50 rounded-2xl">
                      <FeatureIcon feature={feature} />
                      <span className="text-xs text-stone-500 font-medium">{feature.label}</span>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          </div>
        </div>
      </section>

      {/* Contact / Info */}
      <section id="contacto" className="py-16 sm:py-24 bg-stone-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          {/* Section Header */}
          <div className="text-center mb-12">
            <motion.span
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="inline-block text-xs uppercase tracking-[0.3em] text-stone-400 font-medium mb-3"
            >
              Encuéntranos
            </motion.span>
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="text-3xl sm:text-5xl font-bold text-stone-900 tracking-tight"
            >
              Visítanos
            </motion.h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Location Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="bg-white border border-stone-100 rounded-3xl p-6 sm:p-8 hover:shadow-xl hover:shadow-stone-200/50 transition-all duration-300"
            >
              <div className="w-12 h-12 bg-amber-50 rounded-2xl flex items-center justify-center mb-5">
                <MapPin className="w-6 h-6 text-amber-600" />
              </div>
              <h3 className="text-lg font-semibold text-stone-900 mb-2">Ubicación</h3>
              <p className="text-stone-500 text-sm leading-relaxed">
                {business.address}
              </p>
              <p className="text-stone-500 text-sm leading-relaxed">
                {business.city}
              </p>
              <a
                href="https://maps.google.com"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-amber-600 hover:text-amber-700 text-sm font-medium mt-4 transition-colors"
              >
                Ver en Google Maps
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </a>
            </motion.div>

            {/* Hours Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="bg-white border border-stone-100 rounded-3xl p-6 sm:p-8 hover:shadow-xl hover:shadow-stone-200/50 transition-all duration-300"
            >
              <div className="w-12 h-12 bg-green-50 rounded-2xl flex items-center justify-center mb-5">
                <Clock className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="text-lg font-semibold text-stone-900 mb-4">Horario</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-stone-500">Lunes — Viernes</span>
                  <span className="text-sm font-semibold text-stone-900 bg-stone-50 px-3 py-1 rounded-full">
                    {business.hours.weekdays}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-stone-500">Sábado</span>
                  <span className="text-sm font-semibold text-stone-900 bg-stone-50 px-3 py-1 rounded-full">
                    {business.hours.saturday}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-stone-500">Domingo</span>
                  <span className="text-sm font-semibold text-stone-900 bg-stone-50 px-3 py-1 rounded-full">
                    {business.hours.sunday}
                  </span>
                </div>
              </div>
              <div className="mt-4 flex items-center gap-2 bg-green-50 text-green-700 text-xs font-medium px-3 py-2 rounded-xl">
                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                Abierto ahora
              </div>
            </motion.div>

            {/* Contact Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
              className="bg-white border border-stone-100 rounded-3xl p-6 sm:p-8 hover:shadow-xl hover:shadow-stone-200/50 transition-all duration-300"
            >
              <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center mb-5">
                <Phone className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold text-stone-900 mb-4">Contacto</h3>
              <div className="space-y-3">
                <a
                  href={`tel:${business.phone.replace(/\s/g, '')}`}
                  className="flex items-center gap-3 text-stone-500 hover:text-stone-900 transition-colors group"
                >
                  <div className="w-9 h-9 bg-stone-50 group-hover:bg-stone-100 rounded-xl flex items-center justify-center transition-colors">
                    <Phone className="w-4 h-4" />
                  </div>
                  <span className="text-sm">{business.phone}</span>
                </a>
                <a
                  href={`mailto:${business.email}`}
                  className="flex items-center gap-3 text-stone-500 hover:text-stone-900 transition-colors group"
                >
                  <div className="w-9 h-9 bg-stone-50 group-hover:bg-stone-100 rounded-xl flex items-center justify-center transition-colors">
                    <Mail className="w-4 h-4" />
                  </div>
                  <span className="text-sm">{business.email}</span>
                </a>
                <a
                  href={`https://instagram.com/${business.instagram.replace('@', '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 text-stone-500 hover:text-stone-900 transition-colors group"
                >
                  <div className="w-9 h-9 bg-stone-50 group-hover:bg-stone-100 rounded-xl flex items-center justify-center transition-colors">
                    <Instagram className="w-4 h-4" />
                  </div>
                  <span className="text-sm">{business.instagram}</span>
                </a>
              </div>
            </motion.div>
          </div>

          {/* Map Embed */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4 }}
            className="mt-8 rounded-3xl overflow-hidden border border-stone-100 bg-white h-[300px] sm:h-[400px]"
          >
            <iframe
              src={business.mapUrl}
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title={`Ubicación ${business.name}`}
            />
          </motion.div>
        </div>
      </section>
    </>
  );
}
