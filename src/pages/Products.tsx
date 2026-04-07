import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import { Plus, Edit2, Trash2, Package } from 'lucide-react';
import Modal, { Input, Checkbox, FileUpload } from '../components/ui/Modal';
import toast from 'react-hot-toast';

export default function Products() {
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  
  const [formData, setFormData] = useState({
    name: '', brand: '', category: '', description: '',
    price: 0, stock_quantity: 0, image_url: '', is_featured: false
  });

  const { data: products, isLoading } = useQuery({
    queryKey: ['products'],
    queryFn: async () => {
      const { data, error } = await supabase.from('products').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    }
  });

  const saveMutation = useMutation({
    mutationFn: async (payload: any) => {
      if (editingItem) {
        const { error } = await supabase.from('products').update(payload).eq('id', editingItem.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('products').insert([payload]);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      toast.success('Produit sauvegardé');
      closeModal();
    },
    onError: (err: any) => toast.error(err.message)
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('products').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      toast.success('Produit supprimé');
    }
  });

  const openModal = (item?: any) => {
    if (item) {
      setEditingItem(item);
      setFormData({
        name: item.name, brand: item.brand || '', category: item.category || '', description: item.description || '',
        price: item.price, stock_quantity: item.stock_quantity, image_url: item.image_url || '', is_featured: item.is_featured
      });
    } else {
      setEditingItem(null);
      setFormData({ name: '', brand: '', category: '', description: '', price: 0, stock_quantity: 10, image_url: '', is_featured: false });
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
        <h1>Gestion Boutique</h1>
        <button className="btn btn-primary" onClick={() => openModal()}>
          <Plus size={18} /> Nouveau Produit
        </button>
      </div>

      <div className="data-table-container">
        {isLoading ? <div style={{ padding: '2rem', textAlign: 'center' }}>Chargement...</div> : (
          <table className="data-table">
            <thead>
              <tr><th>Produit</th><th>Marque/Catégorie</th><th>Prix</th><th>Stock</th><th>Vedette</th><th>Actions</th></tr>
            </thead>
            <tbody>
              {products?.map((product) => (
                <tr key={product.id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                      <div style={{ width: '40px', height: '40px', borderRadius: '8px', backgroundColor: 'var(--color-bg-secondary)', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyItems: 'center' }}>
                         {product.image_url ? (
                           <img src={product.image_url} alt="Aperçu" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                         ) : <Package size={20} color="var(--color-text-muted)" style={{margin: 'auto'}}/>}
                      </div>
                      <div>
                        <div style={{ fontWeight: 600 }}>{product.name}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)' }}>{product.description?.substring(0,30)}...</div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <div style={{ fontWeight: 500 }}>{product.brand}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)' }}>{product.category}</div>
                  </td>
                  <td style={{ fontWeight: 600, color: 'var(--color-primary)' }}>{product.price} F</td>
                  <td><span className={`badge ${product.stock_quantity < 5 ? 'badge-cancelled' : 'badge-completed'}`}>{product.stock_quantity} u.</span></td>
                  <td><span className={`badge ${product.is_featured ? 'badge-completed' : 'badge-pending'}`}>{product.is_featured ? 'Oui' : 'Non'}</span></td>
                  <td>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button onClick={() => openModal(product)} className="btn" style={{ padding: '0.5rem', backgroundColor: 'var(--color-bg-secondary)' }}><Edit2 size={16} /></button>
                      <button onClick={() => { if(confirm('Supprimer ?')) deleteMutation.mutate(product.id) }} className="btn" style={{ padding: '0.5rem', backgroundColor: 'rgba(239, 68, 68, 0.1)', color: 'var(--color-error)' }}><Trash2 size={16} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <Modal isOpen={isModalOpen} onClose={closeModal} title={editingItem ? 'Modifier Produit' : 'Nouveau Produit'}>
        <form onSubmit={handleSubmit}>
          <Input label="Nom du produit" value={formData.name} onChange={(e:any) => setFormData({...formData, name: e.target.value})} required />
          
          <div style={{ display: 'flex', gap: '1rem' }}>
            <div style={{ flex: 1 }}><Input label="Marque" value={formData.brand} onChange={(e:any) => setFormData({...formData, brand: e.target.value})} /></div>
            <div style={{ flex: 1 }}><Input label="Catégorie" value={formData.category} onChange={(e:any) => setFormData({...formData, category: e.target.value})} /></div>
          </div>

          <div style={{ display: 'flex', gap: '1rem' }}>
            <div style={{ flex: 1 }}><Input label="Prix (FCFA)" type="number" value={formData.price} onChange={(e:any) => setFormData({...formData, price: Number(e.target.value)})} required /></div>
            <div style={{ flex: 1 }}><Input label="Stock (Quantité)" type="number" value={formData.stock_quantity} onChange={(e:any) => setFormData({...formData, stock_quantity: Number(e.target.value)})} required /></div>
          </div>

          <Input label="Description" type="textarea" value={formData.description} onChange={(e:any) => setFormData({...formData, description: e.target.value})} />
          <FileUpload 
            label="Image du Produit" 
            bucket="productimages" 
            currentImage={formData.image_url} 
            onUploadSuccess={(url: string) => setFormData({...formData, image_url: url})} 
          />
          <Checkbox label="Placer en vedette dans la boutique" checked={formData.is_featured} onChange={(e:any) => setFormData({...formData, is_featured: e.target.checked})} />

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1.5rem' }}>
            <button type="button" onClick={closeModal} className="btn btn-secondary">Annuler</button>
            <button type="submit" className="btn btn-primary" disabled={saveMutation.isPending}>{saveMutation.isPending ? 'Enregistrement...' : 'Enregistrer'}</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
