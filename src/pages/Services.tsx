import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import { Plus, Edit2, Trash2, Image as ImageIcon } from 'lucide-react';
import Modal, { Input, Checkbox, FileUpload } from '../components/ui/Modal';
import toast from 'react-hot-toast';

export default function Services() {
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  
  const [formData, setFormData] = useState({
    name: '',
    category_id: '',
    description: '',
    price: 0,
    duration_minutes: 30,
    image_url: '',
    is_featured: false
  });

  const { data: services, isLoading } = useQuery({
    queryKey: ['services'],
    queryFn: async () => {
      const { data, error } = await supabase.from('services').select(`*, categories(name)`).order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    }
  });

  const { data: categories } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const { data } = await supabase.from('categories').select('*');
      return data || [];
    }
  });

  const saveMutation = useMutation({
    mutationFn: async (payload: any) => {
      if (editingItem) {
        const { error } = await supabase.from('services').update(payload).eq('id', editingItem.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('services').insert([payload]);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['services'] });
      toast.success('Prestation sauvegardée');
      closeModal();
    },
    onError: (err: any) => toast.error(err.message)
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('services').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['services'] });
      toast.success('Prestation supprimée');
    }
  });

  const openModal = (item?: any) => {
    if (item) {
      setEditingItem(item);
      setFormData({
        name: item.name, category_id: item.category_id || '', description: item.description || '',
        price: item.price, duration_minutes: item.duration_minutes, image_url: item.image_url || '', is_featured: item.is_featured
      });
    } else {
      setEditingItem(null);
      setFormData({ name: '', category_id: categories?.[0]?.id || '', description: '', price: 0, duration_minutes: 30, image_url: '', is_featured: false });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => setIsModalOpen(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    saveMutation.mutate(formData);
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1>Gestion des Prestations</h1>
        <button className="btn btn-primary" onClick={() => openModal()}>
          <Plus size={18} /> Nouvelle Prestation
        </button>
      </div>

      <div className="data-table-container">
        {isLoading ? <div style={{ padding: '2rem', textAlign: 'center' }}>Chargement...</div> : (
          <table className="data-table">
            <thead>
              <tr><th>Service</th><th>Catégorie</th><th>Prix</th><th>Durée</th><th>Vedette</th><th>Actions</th></tr>
            </thead>
            <tbody>
              {services?.map((service) => (
                <tr key={service.id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                      <div style={{ width: '40px', height: '40px', borderRadius: '8px', backgroundColor: 'var(--color-bg-secondary)', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyItems: 'center' }}>
                         {service.image_url ? (
                           <img src={service.image_url} alt="Aperçu" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                         ) : <ImageIcon size={20} color="var(--color-text-muted)" style={{margin: 'auto'}}/>}
                      </div>
                      <div>
                        <div style={{ fontWeight: 600 }}>{service.name}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)' }}>{service.description?.substring(0,30)}...</div>
                      </div>
                    </div>
                  </td>
                  <td>{service.categories?.name || '-'}</td>
                  <td style={{ fontWeight: 600, color: 'var(--color-primary)' }}>{service.price} F</td>
                  <td>{service.duration_minutes} min</td>
                  <td><span className={`badge ${service.is_featured ? 'badge-completed' : 'badge-pending'}`}>{service.is_featured ? 'Oui' : 'Non'}</span></td>
                  <td>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button onClick={() => openModal(service)} className="btn" style={{ padding: '0.5rem', backgroundColor: 'var(--color-bg-secondary)' }}><Edit2 size={16} /></button>
                      <button onClick={() => { if(confirm('Supprimer ?')) deleteMutation.mutate(service.id) }} className="btn" style={{ padding: '0.5rem', backgroundColor: 'rgba(239, 68, 68, 0.1)', color: 'var(--color-error)' }}><Trash2 size={16} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <Modal isOpen={isModalOpen} onClose={closeModal} title={editingItem ? 'Modifier Prestation' : 'Nouvelle Prestation'}>
        <form onSubmit={handleSubmit}>
          <Input label="Nom de la prestation" value={formData.name} onChange={(e:any) => setFormData({...formData, name: e.target.value})} required />
          
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', fontSize: '0.875rem', marginBottom: '0.5rem', color: 'var(--color-text-secondary)' }}>Catégorie</label>
            <select value={formData.category_id} onChange={(e:any) => setFormData({...formData, category_id: e.target.value})} style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--color-bg-primary)', border: '1px solid var(--color-border)', color: 'white' }} required>
              <option value="">Sélectionner</option>
              {categories?.map((cat:any) => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
            </select>
          </div>

          <div style={{ display: 'flex', gap: '1rem' }}>
            <div style={{ flex: 1 }}><Input label="Prix (FCFA)" type="number" value={formData.price} onChange={(e:any) => setFormData({...formData, price: Number(e.target.value)})} required /></div>
            <div style={{ flex: 1 }}><Input label="Durée (min)" type="number" value={formData.duration_minutes} onChange={(e:any) => setFormData({...formData, duration_minutes: Number(e.target.value)})} required /></div>
          </div>

          <Input label="Description" type="textarea" value={formData.description} onChange={(e:any) => setFormData({...formData, description: e.target.value})} />
          <FileUpload 
            label="Image de la prestation" 
            bucket="servicesimages" 
            currentImage={formData.image_url} 
            onUploadSuccess={(url: string) => setFormData({...formData, image_url: url})} 
          />
          
          <Checkbox label="Mettre en avant sur l'accueil (Vedette)" checked={formData.is_featured} onChange={(e:any) => setFormData({...formData, is_featured: e.target.checked})} />

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1.5rem' }}>
            <button type="button" onClick={closeModal} className="btn btn-secondary">Annuler</button>
            <button type="submit" className="btn btn-primary" disabled={saveMutation.isPending}>{saveMutation.isPending ? 'Enregistrement...' : 'Enregistrer'}</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
