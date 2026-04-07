import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import { Plus, Trash2, Image as ImageIcon } from 'lucide-react';
import Modal, { Input, Checkbox, FileUpload } from '../components/ui/Modal';
import toast from 'react-hot-toast';

export default function Gallery() {
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const [formData, setFormData] = useState({
    title: '', description: '', category: '', image_url: '', is_featured: false
  });

  const { data: gallery, isLoading } = useQuery({
    queryKey: ['gallery_items'],
    queryFn: async () => {
      const { data, error } = await supabase.from('gallery_items').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    }
  });

  const saveMutation = useMutation({
    mutationFn: async (payload: any) => {
      const { error } = await supabase.from('gallery_items').insert([payload]);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['gallery_items'] });
      toast.success('Photo ajoutée à la galerie');
      closeModal();
    },
    onError: (err: any) => toast.error(err.message)
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('gallery_items').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['gallery_items'] });
      toast.success('Photo supprimée');
    }
  });

  const openModal = () => {
    setFormData({ title: '', description: '', category: 'Pose Gel', image_url: '', is_featured: false });
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
        <h1>Galerie Photos</h1>
        <button className="btn btn-primary" onClick={openModal}>
          <Plus size={18} /> Ajouter une réalisation
        </button>
      </div>

      {isLoading ? <div style={{ textAlign: 'center', marginTop: '2rem', color: 'var(--color-text-secondary)' }}>Chargement...</div> : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.5rem' }}>
          {gallery?.map((item) => (
            <div key={item.id} className="card" style={{ padding: 0, overflow: 'hidden', position: 'relative' }}>
              <div style={{ height: '200px', backgroundColor: 'var(--color-bg-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {item.image_url.startsWith('http') ? (
                  <img src={item.image_url} alt={item.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <div style={{ textAlign: 'center' }}>
                    <ImageIcon size={40} color="var(--color-text-muted)" style={{ margin: '0 auto 0.5rem' }} />
                    <span style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)' }}>{item.image_url}</span>
                  </div>
                )}
              </div>
              <div style={{ padding: '1rem' }}>
                <h3 style={{ fontSize: '1rem', marginBottom: '0.25rem' }}>{item.title}</h3>
                <p style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)' }}>{item.category}</p>
                <button 
                  onClick={() => { if(confirm('Supprimer cette photo ?')) deleteMutation.mutate(item.id) }} 
                  style={{ position: 'absolute', top: '10px', right: '10px', width: '32px', height: '32px', borderRadius: '50%', backgroundColor: 'rgba(239, 68, 68, 0.9)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                  title="Supprimer"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal isOpen={isModalOpen} onClose={closeModal} title="Ajouter une Réalisation">
        <form onSubmit={handleSubmit}>
          <Input label="Titre de la réalisation" value={formData.title} onChange={(e:any) => setFormData({...formData, title: e.target.value})} required />
          <Input label="Catégorie (ex: Manucure, Maquillage)" value={formData.category} onChange={(e:any) => setFormData({...formData, category: e.target.value})} />
          
          <FileUpload 
            label="Photo de la réalisation" 
            bucket="galerie" 
            currentImage={formData.image_url} 
            onUploadSuccess={(url: string) => setFormData({...formData, image_url: url})} 
          />
          
          <Input label="Petite description" type="textarea" value={formData.description} onChange={(e:any) => setFormData({...formData, description: e.target.value})} />
          <Checkbox label="Afficher la photo en page d'accueil de l'app" checked={formData.is_featured} onChange={(e:any) => setFormData({...formData, is_featured: e.target.checked})} />

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1.5rem' }}>
            <button type="button" onClick={closeModal} className="btn btn-secondary">Annuler</button>
            <button type="submit" className="btn btn-primary" disabled={saveMutation.isPending}>{saveMutation.isPending ? 'Enregistrement...' : 'Ajouter'}</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
