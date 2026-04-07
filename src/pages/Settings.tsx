import { useState } from 'react';
import toast from 'react-hot-toast';

export default function Settings() {
  const [loading, setLoading] = useState(false);
  const [settings, setSettings] = useState({
    salonName: 'Gilbert Pro',
    phone: '+225 01 02 03 04 05',
    address: 'Abidjan, Cocody Riviera',
    openingHours: 'Lun - Sam: 09h00 - 19h00',
    pointsValue: 5000,
    pointsThreshold: 500
  });

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    // Simulation API
    setTimeout(() => {
      setLoading(false);
      toast.success('Paramètres mis à jour avec succès');
    }, 1000);
  };

  return (
    <div>
      <h1 style={{ marginBottom: '2rem' }}>Paramètres du Salon</h1>
      
      <div className="card" style={{ maxWidth: '800px', margin: '0 auto' }}>
        <form onSubmit={handleSave}>
          <div style={{ marginBottom: '2rem' }}>
            <h2 style={{ fontSize: '1.25rem', marginBottom: '1rem', color: 'var(--color-primary)' }}>Coordonnées & Infos</h2>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--color-text-secondary)' }}>Nom du Salon</label>
                <input type="text" value={settings.salonName} onChange={(e) => setSettings({...settings, salonName: e.target.value})} style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--color-bg-primary)', border: '1px solid var(--color-border)', color: 'white' }} />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--color-text-secondary)' }}>Téléphone Contact</label>
                <input type="text" value={settings.phone} onChange={(e) => setSettings({...settings, phone: e.target.value})} style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--color-bg-primary)', border: '1px solid var(--color-border)', color: 'white' }} />
              </div>
              <div style={{ gridColumn: 'span 2' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--color-text-secondary)' }}>Adresse complète</label>
                <input type="text" value={settings.address} onChange={(e) => setSettings({...settings, address: e.target.value})} style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--color-bg-primary)', border: '1px solid var(--color-border)', color: 'white' }} />
              </div>
              <div style={{ gridColumn: 'span 2' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--color-text-secondary)' }}>Horaires d'ouverture</label>
                <input type="text" value={settings.openingHours} onChange={(e) => setSettings({...settings, openingHours: e.target.value})} style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--color-bg-primary)', border: '1px solid var(--color-border)', color: 'white' }} />
              </div>
            </div>
          </div>

          <hr style={{ border: 'none', borderTop: '1px solid var(--color-border)', margin: '2rem 0' }} />

          <div style={{ marginBottom: '2rem' }}>
            <h2 style={{ fontSize: '1.25rem', marginBottom: '1rem', color: 'var(--color-primary)' }}>Règles de Fidélité</h2>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--color-text-secondary)' }}>Palier de points pour récompense</label>
                <input type="number" value={settings.pointsThreshold} onChange={(e) => setSettings({...settings, pointsThreshold: Number(e.target.value)})} style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--color-bg-primary)', border: '1px solid var(--color-border)', color: 'white' }} />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--color-text-secondary)' }}>Valeur promo de la récompense (FCFA)</label>
                <input type="number" value={settings.pointsValue} onChange={(e) => setSettings({...settings, pointsValue: Number(e.target.value)})} style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--color-bg-primary)', border: '1px solid var(--color-border)', color: 'white' }} />
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1.5rem' }}>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Sauvegarde...' : 'Enregistrer les paramètres'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
