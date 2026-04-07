import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import { CheckCircle2, XCircle } from 'lucide-react';
import toast from 'react-hot-toast';

export default function Bookings() {
  const queryClient = useQueryClient();

  // Fetch bookings with profiles and services related data if possible
  // Since we don't have deeply nested foreign keys completely mapped in simple select sometimes,
  // we'll fetch bookings and join profiles for client name.
  const { data: bookings, isLoading } = useQuery({
    queryKey: ['bookings'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('bookings')
        .select(`
          id,
          booking_date,
          booking_time,
          status,
          total_price,
          professional,
          payment_method,
          payment_status,
          user_id,
          notes,
          profiles(full_name, phone),
          services(name)
        `)
        .order('booking_date', { ascending: false })
        .order('booking_time', { ascending: false });
        
      if (error) throw error;
      return data?.filter((b: any) => !b.notes?.includes('COMMANDE BOUTIQUE')) || [];
    }
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string, status: string }) => {
      const { error } = await supabase
        .from('bookings')
        .update({ status })
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
      toast.success('Statut mis à jour');
    },
    onError: (err: any) => {
      toast.error('Erreur: ' + err.message);
    }
  });

  const handleUpdateStatus = (id: string, currentStatus: string) => {
    let nextStatus = '';
    if (currentStatus === 'pending') nextStatus = 'confirmed';
    else if (currentStatus === 'confirmed') nextStatus = 'completed';
    
    if (nextStatus) {
      updateStatusMutation.mutate({ id, status: nextStatus });
    }
  };

  const handleCancel = (id: string) => {
    if (confirm("Confirmer l'annulation ?")) {
      updateStatusMutation.mutate({ id, status: 'cancelled' });
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'XOF', maximumFractionDigits: 0 }).format(price);
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1>Gestion des Réservations</h1>
      </div>

      <div className="data-table-container">
        {isLoading ? (
          <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--color-text-secondary)' }}>Chargement...</div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Date & Heure</th>
                <th>Client</th>
                <th>Prestation / Commande</th>
                <th>Expert / Notes</th>
                <th>Montant</th>
                <th>Paiement</th>
                <th>Statut</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {bookings?.map((booking) => (
                <tr key={booking.id}>
                  <td>
                    <div style={{ fontWeight: 600 }}>{booking.booking_date}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)' }}>{booking.booking_time?.substring(0,5)}</div>
                  </td>
                  <td>
                    <div style={{ fontWeight: 600 }}>{(booking.profiles as any)?.full_name || 'Client Inconnu'}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)' }}>{(booking.profiles as any)?.phone || 'N/A'}</div>
                  </td>
                  <td>
                    <div style={{ fontWeight: 600 }}>{(booking.services as any)?.name || 'Boutique / Autre'}</div>
                  </td>
                  <td>
                    <div style={{ fontWeight: 500 }}>{booking.professional || '-'}</div>
                    {booking.notes && (
                      <div style={{ fontSize: '0.75rem', color: 'var(--color-primary)', marginTop: '4px', whiteSpace: 'pre-line' }}>{booking.notes}</div>
                    )}
                  </td>
                  <td style={{ fontWeight: 600, color: 'var(--color-primary)' }}>
                    {formatPrice(booking.total_price)}
                  </td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span className={`badge badge-${booking.payment_status === 'paid' ? 'completed' : 'pending'}`}>
                        {booking.payment_method === 'orange_money' ? 'OM' : booking.payment_method === 'mtn_money' ? 'MoMo' : booking.payment_method === 'card' ? 'Carte' : 'Cash'}
                      </span>
                    </div>
                  </td>
                  <td>
                    <span className={`badge badge-${booking.status}`}>{booking.status}</span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      {booking.status === 'pending' && (
                        <button onClick={() => handleUpdateStatus(booking.id, booking.status)} className="btn btn-primary" style={{ padding: '0.5rem' }} title="Confirmer">
                          <CheckCircle2 size={16} />
                        </button>
                      )}
                      {booking.status === 'confirmed' && (
                        <button onClick={() => handleUpdateStatus(booking.id, booking.status)} className="btn btn-primary" style={{ padding: '0.5rem', backgroundColor: 'var(--color-success)' }} title="Marquer Terminé">
                          <CheckCircle2 size={16} />
                        </button>
                      )}
                      {(booking.status === 'pending' || booking.status === 'confirmed') && (
                        <button onClick={() => handleCancel(booking.id)} className="btn" style={{ padding: '0.5rem', backgroundColor: 'rgba(239, 68, 68, 0.1)', color: 'var(--color-error)' }} title="Annuler">
                          <XCircle size={16} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {bookings?.length === 0 && (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: '2rem' }}>Aucune réservation trouvée</td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
