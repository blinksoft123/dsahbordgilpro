import { useQuery } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';

export default function Clients() {
  const { data: profiles, isLoading } = useQuery({
    queryKey: ['profiles'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });
        
      if (error) throw error;
      return data;
    }
  });

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1>Gestion des Clients</h1>
      </div>

      <div className="data-table-container">
        {isLoading ? (
          <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--color-text-secondary)' }}>Chargement...</div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Nom & Email</th>
                <th>Téléphone</th>
                <th>Points Fadélité</th>
                <th>Date d'inscription</th>
              </tr>
            </thead>
            <tbody>
              {profiles?.map((profile) => (
                <tr key={profile.id}>
                  <td>
                    <div style={{ fontWeight: 600 }}>{profile.full_name || 'Inconnu'}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)' }}>{profile.email}</div>
                  </td>
                  <td>{profile.phone || '-'}</td>
                  <td style={{ fontWeight: 600, color: 'var(--color-primary)' }}>{profile.loyalty_points} pts</td>
                  <td>{new Date(profile.created_at).toLocaleDateString('fr-FR')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
