import React, { useState } from 'react';
import { X, Upload } from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

export default function Modal({ isOpen, onClose, title, children }: ModalProps) {
  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: 'rgba(15, 13, 26, 0.8)',
      backdropFilter: 'blur(4px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 50, padding: '1rem'
    }}>
      <div className="card" style={{
        width: '100%', maxWidth: '500px', backgroundColor: 'var(--color-bg-secondary)',
        padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.5rem',
        maxHeight: '90vh', overflowY: 'auto'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 style={{ fontSize: '1.25rem' }}>{title}</h2>
          <button onClick={onClose} style={{ color: 'var(--color-text-secondary)' }}>
            <X size={20} />
          </button>
        </div>
        <div>
          {children}
        </div>
      </div>
    </div>
  );
}

// Reusable Input Component
export function Input({ label, type = 'text', value, onChange, placeholder, required }: any) {
  return (
    <div style={{ marginBottom: '1rem' }}>
      <label style={{ display: 'block', fontSize: '0.875rem', marginBottom: '0.5rem', color: 'var(--color-text-secondary)' }}>{label}</label>
      {type === 'textarea' ? (
        <textarea
          value={value} onChange={onChange} placeholder={placeholder} required={required}
          style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--color-bg-primary)', border: '1px solid var(--color-border)', color: 'white', minHeight: '80px' }}
        />
      ) : (
        <input 
          type={type} value={value} onChange={onChange} placeholder={placeholder} required={required}
          style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--color-bg-primary)', border: '1px solid var(--color-border)', color: 'white' }}
        />
      )}
    </div>
  );
}

// Reusable File Upload Component
export function FileUpload({ label, bucket, onUploadSuccess, currentImage }: any) {
  const [uploading, setUploading] = useState(false);

  const handleFileChange = async (event: any) => {
    try {
      setUploading(true);
      const file = event.target.files[0];
      if (!file) return;

      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from(bucket)
        .upload(filePath, file);

      if (uploadError) {
        throw uploadError;
      }

      const { data } = supabase.storage.from(bucket).getPublicUrl(filePath);
      onUploadSuccess(data.publicUrl);
    } catch (error: any) {
      alert('Erreur lors du transfert de l\'image: ' + error.message);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div style={{ marginBottom: '1rem' }}>
      <label style={{ display: 'block', fontSize: '0.875rem', marginBottom: '0.5rem', color: 'var(--color-text-secondary)' }}>{label}</label>
      
      {currentImage ? (
        <div style={{ marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <img src={currentImage} alt="Aperçu" style={{ width: '60px', height: '60px', objectFit: 'cover', borderRadius: '8px' }} />
          <button type="button" onClick={() => onUploadSuccess('')} className="btn" style={{ fontSize: '0.75rem', padding: '0.5rem' }}>Retirer l'image</button>
        </div>
      ) : null}

      <div style={{ position: 'relative' }}>
        <input
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          disabled={uploading}
          style={{ position: 'absolute', opacity: 0, width: '100%', height: '100%', cursor: 'pointer' }}
        />
        <div style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--color-bg-primary)', border: '1px dashed var(--color-border)', color: 'var(--color-text-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
          <Upload size={18} />
          {uploading ? 'Téléchargement...' : 'Cliquer pour uploader une image'}
        </div>
      </div>
    </div>
  );
}

// Reusable Checkbox
export function Checkbox({ label, checked, onChange }: any) {
  return (
    <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', marginBottom: '1rem' }}>
      <input type="checkbox" checked={checked} onChange={onChange} style={{ width: '16px', height: '16px', cursor: 'pointer' }} />
      <span style={{ fontSize: '0.875rem', color: 'var(--color-text-primary)' }}>{label}</span>
    </label>
  );
}
