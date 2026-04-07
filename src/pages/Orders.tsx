import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import { CheckCircle2, XCircle, ShoppingBag } from 'lucide-react';
import toast from 'react-hot-toast';

export default function Orders() {
  const queryClient = useQueryClient();

  const { data: orders, isLoading } = useQuery({
    queryKey: ['orders'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('bookings')
        .select(`
          id,
          booking_date,
          booking_time,
          status,
          total_price,
          payment_method,
          payment_status,
          user_id,
          notes,
          profiles(full_name, phone)
        `)
        .order('created_at', { ascending: false });
        
      if (error) throw error;
      
      // Filtrer en javascript pour éviter les erreurs d'encodage SQL sur l'emoji ou les sauts de lignes
      const ordersOnly = data?.filter((b: any) => b.notes && b.notes.includes('COMMANDE BOUTIQUE')) || [];
      return ordersOnly;
    }
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string, status: string }) => {
      const { error } = await supabase.from('bookings').update({ status }).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      toast.success('Statut de la commande mis à jour');
    },
    onError: (err: any) => toast.error('Erreur: ' + err.message)
  });

  const handleUpdateStatus = (id: string, currentStatus: string) => {
    let nextStatus = '';
    if (currentStatus === 'pending') nextStatus = 'confirmed';
    else if (currentStatus === 'confirmed') nextStatus = 'completed';
    if (nextStatus) updateStatusMutation.mutate({ id, status: nextStatus });
  };

  const handleCancel = (id: string) => {
    if (confirm("Confirmer l'annulation de la commande ?")) {
      updateStatusMutation.mutate({ id, status: 'cancelled' });
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'XOF', maximumFractionDigits: 0 }).format(price);
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1>Commandes Boutique</h1>
      </div>

      <div className="data-table-container">
        {isLoading ? (
          <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--color-text-secondary)' }}>Chargement...</div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Client</th>
                <th>Détails de la commande</th>
                <th>Montant</th>
                <th>Paiement</th>
                <th>Statut</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {orders?.map((order) => {
                // Formatting notes to remove the tag
                const itemsText = order.notes?.replace('🛍️ COMMANDE BOUTIQUE :\n', '') || '';

                return (
                  <tr key={order.id}>
                    <td>
                      <div style={{ fontWeight: 600 }}>{order.booking_date}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)' }}>{order.booking_time?.substring(0,5)}</div>
                    </td>
                    <td>
                      <div style={{ fontWeight: 600 }}>{(order.profiles as any)?.full_name || 'Inconnu'}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)' }}>{(order.profiles as any)?.phone || 'N/A'}</div>
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <ShoppingBag size={16} color="var(--color-text-secondary)" />
                        <span style={{ fontSize: '0.875rem', whiteSpace: 'pre-line' }}>{itemsText}</span>
                      </div>
                    </td>
                    <td style={{ fontWeight: 600, color: 'var(--color-primary)' }}>
                      {formatPrice(order.total_price)}
                    </td>
                    <td>
                      <span className={`badge badge-${order.payment_status === 'paid' ? 'completed' : 'pending'}`}>
                        {order.payment_method === 'orange_money' ? 'OM' : order.payment_method === 'mtn_money' ? 'MoMo' : order.payment_method === 'card' ? 'Carte' : 'Cash'}
                      </span>
                    </td>
                    <td>
                      <span className={`badge badge-${order.status}`}>{order.status}</span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        {order.status === 'pending' && (
                          <button onClick={() => handleUpdateStatus(order.id, order.status)} className="btn btn-primary" style={{ padding: '0.5rem' }} title="Confirmer / En cours de livraison">
                            <CheckCircle2 size={16} />
                          </button>
                        )}
                        {order.status === 'confirmed' && (
                          <button onClick={() => handleUpdateStatus(order.id, order.status)} className="btn btn-primary" style={{ padding: '0.5rem', backgroundColor: 'var(--color-success)' }} title="Marquer Livré/Terminé">
                            <CheckCircle2 size={16} />
                          </button>
                        )}
                        {(order.status === 'pending' || order.status === 'confirmed') && (
                          <button onClick={() => handleCancel(order.id)} className="btn" style={{ padding: '0.5rem', backgroundColor: 'rgba(239, 68, 68, 0.1)', color: 'var(--color-error)' }} title="Annuler">
                            <XCircle size={16} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                )
              })}
              {orders?.length === 0 && (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: '2rem' }}>Aucune commande trouvée</td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
