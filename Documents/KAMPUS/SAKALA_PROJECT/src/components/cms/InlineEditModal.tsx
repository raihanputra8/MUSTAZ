'use client';

import React, { useState, useEffect } from 'react';
import { X, Save, Trash2, Loader2, Crop } from 'lucide-react';
import { useInlineCMS, EditingItem } from '@/context/InlineCMSContext';
import { updateBike, deleteBike } from '@/lib/supabase/admin';
import { updateProduct, deleteProduct } from '@/lib/supabase/admin';
import { updateJournalPost, deleteJournalPost } from '@/lib/supabase/admin';
import { updateSiteContent, uploadImage } from '@/lib/supabase/admin';
import { Bike, Product, JournalPost } from '@/types/database';
import ImageCropperModal from './ImageCropperModal';

export default function InlineEditModal() {
  const { editingItem, setEditingItem, triggerRefresh, showToast, saveContent } = useInlineCMS();
  const [formData, setFormData] = useState<Record<string, unknown>>({});
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [imageUploading, setImageUploading] = useState(false);

  // Image Cropper State
  const [cropperOpen, setCropperOpen] = useState(false);
  const [imageToCrop, setImageToCrop] = useState<string>('');
  const [cropTargetField, setCropTargetField] = useState<string>('image_url');
  const [cropTargetFolder, setCropTargetFolder] = useState<string>('bikes');

  useEffect(() => {
    if (editingItem) {
      setFormData({ ...editingItem.data });
      setConfirmDelete(false);
    }
  }, [editingItem]);

  // Lock background body scroll when modal is open so the page behind cannot move
  useEffect(() => {
    if (editingItem) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = originalOverflow;
      };
    }
  }, [editingItem]);

  if (!editingItem) return null;

  function updateField(key: string, value: unknown) {
    setFormData((prev) => ({ ...prev, [key]: value }));
  }

  function updateSpec(key: string, value: string) {
    setFormData((prev) => ({
      ...prev,
      specs: { ...(prev.specs as Record<string, string> || {}), [key]: value },
    }));
  }

  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>, field: string, folder: string) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      showToast('Please upload an image file', 'error');
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      showToast('File must be less than 10MB', 'error');
      return;
    }

    const objectUrl = URL.createObjectURL(file);
    setImageToCrop(objectUrl);
    setCropTargetField(field);
    setCropTargetFolder(folder);
    setCropperOpen(true);
    e.target.value = '';
  }

  function handleOpenCropperForCurrent(field: string, folder: string) {
    const currentUrl = (formData[field] as string) || '';
    if (!currentUrl) {
      showToast('Belum ada foto untuk di-crop', 'error');
      return;
    }
    setImageToCrop(currentUrl);
    setCropTargetField(field);
    setCropTargetFolder(folder);
    setCropperOpen(true);
  }

  async function handleCropComplete(croppedBlob: Blob) {
    setImageUploading(true);
    try {
      const croppedFile = new File([croppedBlob], `crop-${Date.now()}.jpg`, { type: 'image/jpeg' });
      const url = await uploadImage(croppedFile, cropTargetFolder);
      updateField(cropTargetField, url);
      showToast('Foto berhasil di-crop & disimpan! ✓');
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Gagal mengunggah foto', 'error');
    } finally {
      setImageUploading(false);
    }
  }

  async function handleSave() {
    if (!editingItem) return;
    setSaving(true);
    try {
      const { id, type } = editingItem;
      // Build the update payload (exclude 'id' from formData)
      const updates = { ...formData };
      delete updates.id;
      delete updates.created_at;

      if (type === 'bike') {
        await updateBike(id, updates as Partial<Bike>);
      } else if (type === 'product') {
        await updateProduct(id, updates as Partial<Product>);
      } else if (type === 'journal') {
        await updateJournalPost(id, updates as Partial<JournalPost>);
      } else if (type === 'content') {
        await saveContent(id, updates);
      }

      showToast('Saved successfully! ✓');
      triggerRefresh();
      setEditingItem(null);
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Failed to save', 'error');
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!editingItem) return;
    setDeleting(true);
    try {
      const { id, type } = editingItem;
      if (type === 'bike') await deleteBike(id);
      else if (type === 'product') await deleteProduct(id);
      else if (type === 'journal') await deleteJournalPost(id);

      showToast('Deleted successfully');
      triggerRefresh();
      setEditingItem(null);
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Failed to delete', 'error');
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-[65] flex items-center justify-center p-3 sm:p-4 overflow-hidden">
      {/* Overlay Backdrop */}
      <div
        className="fixed inset-0 bg-black/75 backdrop-blur-sm"
        onClick={() => setEditingItem(null)}
      />

      {/* Modal Dialog Card */}
      <div 
        className="relative bg-white border border-[#E5E2D9] rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col z-10 animate-fade-in-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header (Fixed Top) */}
        <div className="shrink-0 flex items-center justify-between px-6 py-4 border-b border-[#E5E2D9] bg-[#070F18] rounded-t-xl">
          <div>
            <span className="text-[9px] font-bold tracking-[0.22em] text-[#C5AA00] uppercase block">
              INLINE CMS EDITOR
            </span>
            <h2 className="font-serif-editorial text-lg font-bold text-white">
              Edit {editingItem.type === 'bike' ? 'Bike' : editingItem.type === 'product' ? 'Product' : editingItem.type === 'journal' ? 'Journal Post' : 'Page Content'}
            </h2>
          </div>
          <button
            onClick={() => setEditingItem(null)}
            className="text-gray-400 hover:text-white transition-colors p-1.5 rounded cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Body (Smooth scrolling, overscroll contained) */}
        <div 
          className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-5 min-h-0"
          style={{ overscrollBehavior: 'contain' }}
        >
          {/* Image Preview & Upload & Crop */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-[10px] font-bold text-[#64748B] uppercase tracking-wider">
                Image / Visual Media
              </label>
              {((formData.image_url as string) || (formData.cover_image_url as string)) && (
                <button
                  type="button"
                  onClick={() =>
                    handleOpenCropperForCurrent(
                      editingItem.type === 'journal' ? 'cover_image_url' : 'image_url',
                      editingItem.type === 'bike' ? 'bikes' : editingItem.type === 'product' ? 'products' : editingItem.type === 'content' ? 'content' : 'journal'
                    )
                  }
                  className="flex items-center gap-1.5 text-[10px] font-bold text-[#070F18] hover:text-[#C5AA00] transition-colors cursor-pointer"
                >
                  <Crop className="w-3.5 h-3.5 text-[#C5AA00]" />
                  <span>SESUAIKAN CROP</span>
                </button>
              )}
            </div>

            <div className="relative group">
              {((formData.image_url as string) || (formData.cover_image_url as string)) && (
                <div className="relative w-full h-52 bg-[#FAF9F5] border border-[#E5E2D9] rounded-md overflow-hidden mb-2 group">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={(formData.image_url || formData.cover_image_url) as string}
                    alt="Preview"
                    className="w-full h-full object-contain p-2"
                  />
                  {/* Hover Overlay Button to Crop */}
                  <button
                    type="button"
                    onClick={() =>
                      handleOpenCropperForCurrent(
                        editingItem.type === 'journal' ? 'cover_image_url' : 'image_url',
                        editingItem.type === 'bike' ? 'bikes' : editingItem.type === 'product' ? 'products' : editingItem.type === 'content' ? 'content' : 'journal'
                      )
                    }
                    className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2 text-white text-xs font-bold tracking-wider uppercase cursor-pointer backdrop-blur-[2px]"
                  >
                    <Crop className="w-6 h-6 text-[#C5AA00]" />
                    <span>KLIK UNTUK CROP / ATUR POSISI FOTO</span>
                    <span className="text-[10px] text-[#94A3B8] font-normal normal-case">
                      Geser &amp; zoom area foto yang ingin ditampilkan
                    </span>
                  </button>
                </div>
              )}

              {/* Dedicated Crop Action Button */}
              {((formData.image_url as string) || (formData.cover_image_url as string)) && (
                <button
                  type="button"
                  onClick={() =>
                    handleOpenCropperForCurrent(
                      editingItem.type === 'journal' ? 'cover_image_url' : 'image_url',
                      editingItem.type === 'bike' ? 'bikes' : editingItem.type === 'product' ? 'products' : editingItem.type === 'content' ? 'content' : 'journal'
                    )
                  }
                  className="w-full mb-3 py-2.5 px-3 bg-[#070F18] hover:bg-[#C5AA00] text-white hover:text-black text-[11px] font-bold tracking-wider uppercase rounded-md transition-all flex items-center justify-center gap-2 border border-[#070F18] shadow-xs btn-tactile cursor-pointer"
                >
                  <Crop className="w-4 h-4 text-[#C5AA00] group-hover:text-black" />
                  <span>PILIH CROP / SESUAIKAN FRAMING FOTO</span>
                </button>
              )}

              <div className="flex items-center gap-2">
                <label className={`flex-1 flex items-center justify-center gap-2 px-3 py-2.5 border-2 border-dashed border-[#E5E2D9] hover:border-[#C5AA00] rounded-md cursor-pointer transition-all ${imageUploading ? 'opacity-50 pointer-events-none' : ''}`}>
                  {imageUploading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin text-[#C5AA00]" />
                      <span className="text-[10px] text-[#64748B]">Menyimpan &amp; Mengunggah...</span>
                    </>
                  ) : (
                    <>
                      <span className="text-[10px] font-bold text-[#64748B] uppercase tracking-wider">
                        Upload Image (Bisa Langsung Di-Crop)
                      </span>
                    </>
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) =>
                      handleFileSelect(
                        e,
                        editingItem.type === 'journal' ? 'cover_image_url' : 'image_url',
                        editingItem.type === 'bike' ? 'bikes' : editingItem.type === 'product' ? 'products' : editingItem.type === 'content' ? 'content' : 'journal'
                      )
                    }
                    className="hidden"
                  />
                </label>
              </div>

              {/* Manual URL input */}
              <div className="mt-2">
                <label className="block text-[9px] font-bold text-[#94A3B8] uppercase tracking-wider mb-1">
                  Atau Masukkan Path / URL Gambar
                </label>
                <input
                  type="text"
                  placeholder="/assets/... atau https://..."
                  value={(formData.image_url || formData.cover_image_url || '') as string}
                  onChange={(e) =>
                    updateField(
                      editingItem.type === 'journal' ? 'cover_image_url' : 'image_url',
                      e.target.value
                    )
                  }
                  className="w-full bg-[#FAF9F5] border border-[#E5E2D9] px-3 py-1.5 text-xs rounded-md outline-none focus:border-[#070F18] transition-colors font-mono"
                />
              </div>
            </div>
          </div>

          {/* Dynamic Fields Based on Type */}
          {editingItem.type === 'bike' && (
            <>
              <FieldInput label="Title" value={formData.title as string} onChange={(v) => updateField('title', v)} />
              <div className="grid grid-cols-3 gap-3">
                <FieldInput label="Year" type="number" value={String(formData.year)} onChange={(v) => updateField('year', Number(v))} />
                <FieldInput label="Make" value={formData.make as string} onChange={(v) => updateField('make', v)} />
                <FieldInput label="Model" value={formData.model as string} onChange={(v) => updateField('model', v)} />
              </div>
              <FieldSelect
                label="Status"
                value={formData.status as string}
                onChange={(v) => updateField('status', v)}
                options={[
                  { value: 'archival', label: 'Archival' },
                  { value: 'commissioned', label: 'Commissioned' },
                  { value: 'private_collection', label: 'Private Collection' },
                ]}
              />
              <FieldTextarea
                label="Deskripsi / Garis Besar Build"
                value={((formData.description as string) || '')}
                onChange={(v) => updateField('description', v)}
                rows={3}
              />
              {/* Specs */}
              <div>
                <label className="block text-[10px] font-bold text-[#64748B] uppercase tracking-wider mb-2">
                  Technical Specs
                </label>
                <div className="space-y-2 bg-[#FAF9F5] p-3 rounded-md border border-[#E5E2D9]">
                  {Object.entries((formData.specs as Record<string, string>) || {}).map(([key, val]) => (
                    <div key={key} className="flex items-center gap-2">
                      <span className="text-[10px] font-bold text-[#64748B] uppercase tracking-wider w-24 flex-shrink-0">
                        {key}
                      </span>
                      <input
                        type="text"
                        value={val}
                        onChange={(e) => updateSpec(key, e.target.value)}
                        className="flex-1 bg-white border border-[#E5E2D9] px-2 py-1.5 text-xs rounded outline-none focus:border-[#070F18] transition-colors"
                      />
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          {editingItem.type === 'product' && (
            <>
              <FieldInput label="Product Name" value={formData.name as string} onChange={(v) => updateField('name', v)} />
              <div className="grid grid-cols-2 gap-3">
                <FieldInput label="SKU" value={formData.sku as string} onChange={(v) => updateField('sku', v)} />
                <FieldSelect
                  label="Category"
                  value={formData.category as string}
                  onChange={(v) => updateField('category', v)}
                  options={[
                    { value: 't-shirts', label: 'T-Shirts' },
                    { value: 'hoodies', label: 'Hoodies' },
                    { value: 'jackets', label: 'Jackets' },
                    { value: 'headwear', label: 'Headwear' },
                    { value: 'accessories', label: 'Accessories' },
                  ]}
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <FieldInput label="Price IDR" type="number" value={String(formData.price_idr)} onChange={(v) => updateField('price_idr', Number(v))} />
                <FieldInput label="Price USD" type="number" value={String(formData.price_usd)} onChange={(v) => updateField('price_usd', Number(v))} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <FieldSelect
                  label="Stock Status"
                  value={formData.stock_status as string}
                  onChange={(v) => updateField('stock_status', v)}
                  options={[
                    { value: 'available', label: 'Available' },
                    { value: 'low_stock', label: 'Low Stock' },
                    { value: 'waitlist', label: 'Waitlist' },
                    { value: 'sold_out', label: 'Sold Out' },
                  ]}
                />
                <FieldInput label="Stock Count" type="number" value={String(formData.stock_count || 0)} onChange={(v) => updateField('stock_count', Number(v))} />
              </div>
              <FieldTextarea label="Description" value={formData.description as string} onChange={(v) => updateField('description', v)} />
            </>
          )}

          {editingItem.type === 'journal' && (
            <>
              <FieldInput label="Title" value={formData.title as string} onChange={(v) => updateField('title', v)} />
              <div className="grid grid-cols-2 gap-3">
                <FieldInput label="Slug" value={formData.slug as string} onChange={(v) => updateField('slug', v)} />
                <FieldInput label="Category" value={formData.category as string} onChange={(v) => updateField('category', v)} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <FieldInput label="Author" value={formData.author as string} onChange={(v) => updateField('author', v)} />
                <FieldInput label="Read Time" value={formData.read_time as string} onChange={(v) => updateField('read_time', v)} />
              </div>
              <FieldInput label="Publish Date" value={formData.publish_date as string} onChange={(v) => updateField('publish_date', v)} />
              <FieldTextarea label="Excerpt" value={formData.excerpt as string} onChange={(v) => updateField('excerpt', v)} />
              <FieldTextarea label="Content" value={(formData.content || '') as string} onChange={(v) => updateField('content', v)} rows={8} />
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={Boolean(formData.featured)}
                  onChange={(e) => updateField('featured', e.target.checked)}
                  id="featured-toggle"
                  className="w-4 h-4 accent-[#C5AA00]"
                />
                <label htmlFor="featured-toggle" className="text-xs font-semibold text-[#070F18]">
                  Featured Article
                </label>
              </div>
            </>
          )}

          {/* Content Block Editor */}
          {editingItem.type === 'content' && (
            <>
              <FieldInput
                label="Section / Block Label"
                value={((formData.label || formData.subtitle) as string) || ''}
                onChange={(v) => {
                  updateField('label', v);
                  updateField('subtitle', v);
                }}
              />
              <FieldInput
                label="Headline / Title"
                value={((formData.title || formData.value) as string) || ''}
                onChange={(v) => {
                  updateField('title', v);
                  updateField('value', v);
                }}
              />
              <FieldTextarea
                label="Description / Caption Body"
                value={((formData.description || formData.content || formData.caption) as string) || ''}
                onChange={(v) => {
                  updateField('description', v);
                  updateField('content', v);
                  updateField('caption', v);
                }}
                rows={4}
              />

              {/* YouTube / Video URL */}
              {(formData.video_url !== undefined || editingItem.id.includes('video') || editingItem.id.includes('youtube')) && (
                <FieldInput
                  label="YouTube / Video URL (contoh: https://youtu.be/IK0VG7j2P9s)"
                  value={((formData.video_url || formData.link) as string) || ''}
                  onChange={(v) => {
                    updateField('video_url', v);
                  }}
                />
              )}

              {/* Instagram / External Post Link */}
              {(formData.link !== undefined || formData.post_link !== undefined || formData.external_link !== undefined || editingItem.id.includes('ig') || editingItem.id.includes('post')) && (
                <FieldInput
                  label="Instagram Post URL / Link (contoh: https://www.instagram.com/sakala_ina)"
                  value={((formData.link || formData.post_link || formData.external_link) as string) || ''}
                  onChange={(v) => {
                    updateField('link', v);
                    updateField('post_link', v);
                    updateField('external_link', v);
                  }}
                />
              )}

              {/* Instagram Metrics (Likes, Comments, Date) */}
              {(formData.likes !== undefined || formData.comments !== undefined || formData.date !== undefined || editingItem.id.includes('ig')) && (
                <div className="grid grid-cols-3 gap-3">
                  <FieldInput
                    label="Likes (cth: 1.2k)"
                    value={(formData.likes as string) || ''}
                    onChange={(v) => updateField('likes', v)}
                  />
                  <FieldInput
                    label="Comments"
                    value={(formData.comments as string) || ''}
                    onChange={(v) => updateField('comments', v)}
                  />
                  <FieldInput
                    label="Date Label"
                    value={(formData.date as string) || ''}
                    onChange={(v) => updateField('date', v)}
                  />
                </div>
              )}

              {formData.cta_text !== undefined && (
                <FieldInput
                  label="Button / CTA Text"
                  value={(formData.cta_text as string) || ''}
                  onChange={(v) => updateField('cta_text', v)}
                />
              )}
            </>
          )}
        </div>

        {/* Footer Actions (Fixed Bottom) */}
        <div className="shrink-0 flex items-center justify-between px-6 py-4 border-t border-[#E5E2D9] bg-[#FAF9F5] rounded-b-xl">
          {/* Delete */}
          <div>
            {editingItem.type !== 'content' && (
              confirmDelete ? (
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-red-600 font-bold">Yakin hapus?</span>
                  <button
                    onClick={handleDelete}
                    disabled={deleting}
                    className="px-3 py-1.5 bg-red-600 text-white text-[10px] font-bold tracking-wider uppercase rounded-md hover:bg-red-700 disabled:opacity-50"
                  >
                    {deleting ? 'Deleting...' : 'Ya, Hapus'}
                  </button>
                  <button
                    onClick={() => setConfirmDelete(false)}
                    className="px-3 py-1.5 border border-[#E5E2D9] text-[10px] font-bold tracking-wider uppercase rounded-md hover:border-[#070F18]"
                  >
                    Batal
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setConfirmDelete(true)}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-red-500 hover:text-red-700 text-[10px] font-bold tracking-wider uppercase transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Delete
                </button>
              )
            )}
          </div>

          {/* Save / Cancel */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setEditingItem(null)}
              className="px-4 py-2 border border-[#E5E2D9] text-[#64748B] hover:text-[#070F18] text-[10px] font-bold tracking-wider uppercase rounded-md transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-2 px-5 py-2 bg-[#070F18] hover:bg-[#0047AB] text-white text-[10px] font-bold tracking-wider uppercase rounded-md transition-colors disabled:opacity-50"
            >
              {saving ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-3.5 h-3.5" />
                  Save Changes
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Interactive Crop Modal */}
      <ImageCropperModal
        isOpen={cropperOpen}
        imageSrc={imageToCrop}
        defaultAspectRatio={editingItem.type === 'product' ? 1 : 16 / 9}
        onClose={() => setCropperOpen(false)}
        onCropComplete={handleCropComplete}
        title={`Crop Foto ${editingItem.type === 'bike' ? 'Motor' : editingItem.type === 'product' ? 'Produk' : 'Artikel'}`}
      />
    </div>
  );
}

// ========================================
// Reusable Form Field Components
// ========================================

function FieldInput({
  label,
  value,
  onChange,
  type = 'text',
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
}) {
  return (
    <div>
      <label className="block text-[10px] font-bold text-[#64748B] uppercase tracking-wider mb-1.5">
        {label}
      </label>
      <input
        type={type}
        value={value || ''}
        onChange={(e) => onChange(e.target.value)}
        className="w-full bg-[#FAF9F5] border border-[#E5E2D9] px-3 py-2 text-xs rounded-md outline-none focus:border-[#070F18] transition-colors"
      />
    </div>
  );
}

function FieldTextarea({
  label,
  value,
  onChange,
  rows = 4,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  rows?: number;
}) {
  return (
    <div>
      <label className="block text-[10px] font-bold text-[#64748B] uppercase tracking-wider mb-1.5">
        {label}
      </label>
      <textarea
        value={value || ''}
        onChange={(e) => onChange(e.target.value)}
        rows={rows}
        className="w-full bg-[#FAF9F5] border border-[#E5E2D9] px-3 py-2 text-xs rounded-md outline-none focus:border-[#070F18] resize-none transition-colors"
      />
    </div>
  );
}

function FieldSelect({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
}) {
  return (
    <div>
      <label className="block text-[10px] font-bold text-[#64748B] uppercase tracking-wider mb-1.5">
        {label}
      </label>
      <select
        value={value || ''}
        onChange={(e) => onChange(e.target.value)}
        className="w-full bg-[#FAF9F5] border border-[#E5E2D9] px-3 py-2 text-xs rounded-md outline-none focus:border-[#070F18] transition-colors"
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
}
