import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CalendarDays,
  Clock,
  Users,
  Phone,
  Mail,
  MessageSquare,
  Check,
  X,
  Trash2,
  Filter,
  Search,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Reservation } from '../../types';

export function AdminReservations() {
  const { reservations, updateReservation, deleteReservation } = useApp();
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'confirmed' | 'cancelled'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedReservation, setSelectedReservation] = useState<Reservation | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);

  const filteredReservations = reservations.filter((r) => {
    const matchStatus = filterStatus === 'all' || r.status === filterStatus;
    const matchSearch =
      r.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.phone.includes(searchQuery) ||
      r.email.toLowerCase().includes(searchQuery.toLowerCase());
    return matchStatus && matchSearch;
  });

  const handleConfirm = (res: Reservation) => {
    updateReservation({ ...res, status: 'confirmed' });
    if (selectedReservation?.id === res.id) {
      setSelectedReservation({ ...res, status: 'confirmed' });
    }
  };

  const handleCancel = (res: Reservation) => {
    updateReservation({ ...res, status: 'cancelled' });
    if (selectedReservation?.id === res.id) {
      setSelectedReservation({ ...res, status: 'cancelled' });
    }
  };

  const handleDelete = (id: string) => {
    deleteReservation(id);
    setShowDeleteConfirm(null);
    if (selectedReservation?.id === id) setSelectedReservation(null);
  };

  const statusConfig = {
    pending: { label: 'Pendiente', color: 'bg-amber-100 text-amber-700', dot: 'bg-amber-500' },
    confirmed: { label: 'Confirmada', color: 'bg-green-100 text-green-700', dot: 'bg-green-500' },
    cancelled: { label: 'Cancelada', color: 'bg-red-100 text-red-700', dot: 'bg-red-500' },
  };

  const pendingCount = reservations.filter((r) => r.status === 'pending').length;
  const confirmedCount = reservations.filter((r) => r.status === 'confirmed').length;
  const cancelledCount = reservations.filter((r) => r.status === 'cancelled').length;

  return (
    <div>
      {/* Summary */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        <div className="bg-amber-50 border border-amber-100 rounded-xl p-4 text-center">
          <p className="text-2xl font-bold text-amber-700">{pendingCount}</p>
          <p className="text-xs text-amber-600 mt-1">Pendientes</p>
        </div>
        <div className="bg-green-50 border border-green-100 rounded-xl p-4 text-center">
          <p className="text-2xl font-bold text-green-700">{confirmedCount}</p>
          <p className="text-xs text-green-600 mt-1">Confirmadas</p>
        </div>
        <div className="bg-red-50 border border-red-100 rounded-xl p-4 text-center">
          <p className="text-2xl font-bold text-red-700">{cancelledCount}</p>
          <p className="text-xs text-red-600 mt-1">Canceladas</p>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar por nombre, teléfono o email..."
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-stone-900/10 transition-all"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-stone-400" />
          {(['all', 'pending', 'confirmed', 'cancelled'] as const).map((status) => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className={`px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                filterStatus === status
                  ? 'bg-stone-900 text-white'
                  : 'bg-white border border-stone-200 text-stone-500 hover:bg-stone-50'
              }`}
            >
              {status === 'all' ? 'Todas' : statusConfig[status].label}
            </button>
          ))}
        </div>
      </div>

      {/* Reservations List */}
      {filteredReservations.length === 0 ? (
        <div className="text-center py-16">
          <CalendarDays className="w-12 h-12 text-stone-300 mx-auto mb-3" />
          <p className="text-stone-400 text-sm">
            {reservations.length === 0
              ? 'No hay reservas aún. Aparecerán aquí cuando los clientes reserven desde el sitio.'
              : 'No se encontraron reservas con estos filtros.'}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredReservations.map((res) => {
            const sc = statusConfig[res.status];
            return (
              <div
                key={res.id}
                onClick={() => setSelectedReservation(res)}
                className="bg-white border border-stone-200 rounded-2xl p-4 sm:p-5 hover:shadow-md transition-all cursor-pointer"
              >
                <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
                  {/* Status & Name */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-1 rounded-full ${sc.color}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${sc.dot}`} />
                        {sc.label}
                      </span>
                    </div>
                    <h3 className="font-semibold text-stone-900">{res.name}</h3>
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1">
                      <span className="flex items-center gap-1.5 text-xs text-stone-400">
                        <CalendarDays className="w-3 h-3" />
                        {res.date}
                      </span>
                      <span className="flex items-center gap-1.5 text-xs text-stone-400">
                        <Clock className="w-3 h-3" />
                        {res.time}
                      </span>
                      <span className="flex items-center gap-1.5 text-xs text-stone-400">
                        <Users className="w-3 h-3" />
                        {res.guests} persona{res.guests !== 1 ? 's' : ''}
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 shrink-0" onClick={(e) => e.stopPropagation()}>
                    {res.status === 'pending' && (
                      <>
                        <button
                          onClick={() => handleConfirm(res)}
                          className="flex items-center gap-1.5 px-3 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg text-xs font-medium transition-colors"
                        >
                          <Check className="w-3 h-3" />
                          Confirmar
                        </button>
                        <button
                          onClick={() => handleCancel(res)}
                          className="flex items-center gap-1.5 px-3 py-2 bg-stone-100 hover:bg-stone-200 text-stone-600 rounded-lg text-xs font-medium transition-colors"
                        >
                          <X className="w-3 h-3" />
                          Rechazar
                        </button>
                      </>
                    )}
                    <button
                      onClick={() => setShowDeleteConfirm(res.id)}
                      className="w-8 h-8 rounded-lg flex items-center justify-center text-stone-400 hover:bg-red-50 hover:text-red-500 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Reservation Detail Modal */}
      <AnimatePresence>
        {selectedReservation && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={() => setSelectedReservation(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-3xl w-full max-w-md overflow-hidden"
            >
              <div className="p-6 border-b border-stone-100 flex items-center justify-between">
                <h2 className="text-lg font-bold text-stone-900">Detalle de Reserva</h2>
                <button
                  onClick={() => setSelectedReservation(null)}
                  className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-stone-100"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="p-6 space-y-4">
                {/* Status */}
                <div>
                  <span
                    className={`inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full ${
                      statusConfig[selectedReservation.status].color
                    }`}
                  >
                    <span
                      className={`w-2 h-2 rounded-full ${
                        statusConfig[selectedReservation.status].dot
                      }`}
                    />
                    {statusConfig[selectedReservation.status].label}
                  </span>
                </div>

                {/* Info */}
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 bg-stone-100 rounded-lg flex items-center justify-center">
                      <Users className="w-4 h-4 text-stone-500" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-stone-900">{selectedReservation.name}</p>
                      <p className="text-xs text-stone-400">{selectedReservation.guests} persona{selectedReservation.guests !== 1 ? 's' : ''}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 bg-stone-100 rounded-lg flex items-center justify-center">
                      <CalendarDays className="w-4 h-4 text-stone-500" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-stone-900">{selectedReservation.date}</p>
                      <p className="text-xs text-stone-400">{selectedReservation.time}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 bg-stone-100 rounded-lg flex items-center justify-center">
                      <Phone className="w-4 h-4 text-stone-500" />
                    </div>
                    <p className="text-sm text-stone-900">{selectedReservation.phone}</p>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 bg-stone-100 rounded-lg flex items-center justify-center">
                      <Mail className="w-4 h-4 text-stone-500" />
                    </div>
                    <p className="text-sm text-stone-900">{selectedReservation.email}</p>
                  </div>

                  {selectedReservation.notes && (
                    <div className="flex items-start gap-3">
                      <div className="w-9 h-9 bg-stone-100 rounded-lg flex items-center justify-center shrink-0 mt-0.5">
                        <MessageSquare className="w-4 h-4 text-stone-500" />
                      </div>
                      <p className="text-sm text-stone-500">{selectedReservation.notes}</p>
                    </div>
                  )}
                </div>

                <p className="text-[10px] text-stone-300 pt-2">
                  Creada: {new Date(selectedReservation.createdAt).toLocaleString('es-MX')}
                </p>
              </div>

              {/* Actions */}
              {selectedReservation.status === 'pending' && (
                <div className="p-6 border-t border-stone-100 flex gap-3">
                  <button
                    onClick={() => handleCancel(selectedReservation)}
                    className="flex-1 px-4 py-3 border border-stone-200 rounded-xl text-sm font-medium text-stone-600 hover:bg-stone-50 transition-colors"
                  >
                    Rechazar
                  </button>
                  <button
                    onClick={() => handleConfirm(selectedReservation)}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-green-500 text-white rounded-xl text-sm font-medium hover:bg-green-600 transition-colors"
                  >
                    <Check className="w-4 h-4" />
                    Confirmar
                  </button>
                </div>
              )}
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
              <h3 className="text-lg font-bold text-stone-900 mb-2">¿Eliminar reserva?</h3>
              <p className="text-stone-500 text-sm mb-6">
                Esta acción eliminará la reserva permanentemente.
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
    </div>
  );
}
