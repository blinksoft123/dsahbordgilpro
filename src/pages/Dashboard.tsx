import { useQuery } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';

export default function Dashboard() {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: async () => {
      // 1. Chiffre d'affaires (Réservations confirmées et payées - on va faire simple pour le moment)
      const { data: bookingsTotal } = await supabase
        .from('bookings')
        .select('total_price')
        .in('status', ['confirmed', 'completed']);
        
      const totalRevenue = bookingsTotal?.reduce((acc, curr) => acc + (curr.total_price || 0), 0) || 0;

      // 2. Réservations/Commandes du jour (Aujourd'hui)
      const startOfDay = new Date();
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date();
      endOfDay.setHours(23, 59, 59, 999);

      const { data: todayBookings } = await supabase
        .from('bookings')
        .select('id, notes')
        .gte('created_at', startOfDay.toISOString())
        .lte('created_at', endOfDay.toISOString());

      const ordersToday = todayBookings?.filter((b: any) => b.notes?.includes('COMMANDE BOUTIQUE'))?.length || 0;
      const rdvToday = (todayBookings?.length || 0) - ordersToday;

      // 3. Produits en rupture (stock < 5)
      const { count: lowStockCount } = await supabase
        .from('products')
        .select('*', { count: 'exact', head: true })
        .lt('stock_quantity', 5);

      return {
        revenue: totalRevenue,
        rdvToday: rdvToday,
        ordersToday: ordersToday,
        lowStock: lowStockCount || 0
      };
    }
  });

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XOF',
      maximumFractionDigits: 0
    }).format(price);
  };

  if (isLoading) {
    return <div style={{ color: 'var(--color-text-secondary)' }}>Chargement des statistiques...</div>;
  }

  return (
    <div>
      <h1 style={{ marginBottom: '2rem' }}>Tableau de Bord</h1>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
        <div className="card glass">
          <h3 style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)', marginBottom: '0.5rem', fontFamily: 'var(--font-sans)' }}>Chiffre d'Affaires Global</h3>
          <p style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--color-primary)' }}>{formatPrice(stats?.revenue || 0)}</p>
        </div>
        <div className="card glass">
          <h3 style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)', marginBottom: '0.5rem', fontFamily: 'var(--font-sans)' }}>Rendez-vous du Jour</h3>
          <p style={{ fontSize: '2rem', fontWeight: 'bold' }}>{stats?.rdvToday}</p>
        </div>
        <div className="card glass">
          <h3 style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)', marginBottom: '0.5rem', fontFamily: 'var(--font-sans)' }}>Commandes Boutique (Aujourd'hui)</h3>
          <p style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--color-primary)' }}>{stats?.ordersToday}</p>
        </div>
        <div className="card glass">
          <h3 style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)', marginBottom: '0.5rem', fontFamily: 'var(--font-sans)' }}>Produits en rupture (Stock &lt; 5)</h3>
          <p style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--color-error)' }}>{stats?.lowStock}</p>
        </div>
      </div>
    </div>
  );
}
