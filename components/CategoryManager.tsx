import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, X, AlertCircle, CheckCircle } from 'lucide-react';
import { categoryService, Category } from '../services/databaseService';

interface CategoryManagerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CategoryManager: React.FC<CategoryManagerProps> = ({ isOpen, onClose }) => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({ name: '', icon: '📦', parentId: '' });
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      loadCategories();
    }
  }, [isOpen]);

  const loadCategories = async () => {
    setLoading(true);
    const data = await categoryService.getAllCategories();
    setCategories(data);
    setLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!formData.name.trim()) {
      setError('Category name is required');
      return;
    }

    try {
      if (editingId) {
        const success = await categoryService.updateCategory(editingId, {
          name: formData.name,
          icon: formData.icon,
          parent_id: formData.parentId || null,
        });
        if (success) {
          setSuccess('Category updated successfully');
          setEditingId(null);
        }
      } else {
        await categoryService.createCategory(formData.name, formData.icon, formData.parentId || null);
        setSuccess('Category created successfully');
      }

      setFormData({ name: '', icon: '📦', parentId: '' });
      setShowForm(false);
      await loadCategories();
    } catch (err) {
      setError(String(err));
    }
  };

  const handleEdit = (category: Category) => {
    setFormData({
      name: category.name,
      icon: category.icon,
      parentId: category.parent_id || '',
    });
    setEditingId(category.id);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure? This will also delete all subcategories.')) return;

    const success = await categoryService.deleteCategory(id);
    if (success) {
      setSuccess('Category deleted successfully');
      await loadCategories();
    } else {
      setError('Failed to delete category');
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingId(null);
    setFormData({ name: '', icon: '📦', parentId: '' });
  };

  if (!isOpen) return null;

  const rootCategories = categories.filter(c => !c.parent_id);
  const getSubcategories = (parentId: string) => categories.filter(c => c.parent_id === parentId);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-lg shadow-lg max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <h2 className="text-lg font-bold text-[#16191f]">Manage Categories</h2>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded">
            <X size={20} className="text-[#545b64]" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {!showForm && (
            <button
              onClick={() => setShowForm(true)}
              className="flex items-center gap-2 px-4 py-2 bg-[#ec7211] text-white rounded hover:bg-[#eb5f07] text-sm font-medium"
            >
              <Plus size={16} /> New Category
            </button>
          )}

          {/* Form */}
          {showForm && (
            <form onSubmit={handleSubmit} className="border border-gray-300 rounded p-4 bg-blue-50">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-xs font-bold text-[#545b64] mb-1">Category Name *</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 border border-[#879596] rounded text-sm focus:outline-none focus:border-[#ec7211]"
                    placeholder="e.g., Electronics"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#545b64] mb-1">Icon</label>
                  <input
                    type="text"
                    value={formData.icon}
                    onChange={e => setFormData({ ...formData, icon: e.target.value })}
                    className="w-full px-3 py-2 border border-[#879596] rounded text-sm focus:outline-none focus:border-[#ec7211]"
                    placeholder="e.g., 📱"
                    maxLength={2}
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-xs font-bold text-[#545b64] mb-1">Parent Category (optional)</label>
                  <select
                    value={formData.parentId}
                    onChange={e => setFormData({ ...formData, parentId: e.target.value })}
                    className="w-full px-3 py-2 border border-[#879596] rounded text-sm focus:outline-none focus:border-[#ec7211]"
                  >
                    <option value="">-- No Parent (Root Category) --</option>
                    {categories.map(c => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded text-sm text-red-700 mb-4 flex items-start gap-2">
                  <AlertCircle size={16} className="mt-0.5 flex-shrink-0" />
                  {error}
                </div>
              )}

              {success && (
                <div className="p-3 bg-green-50 border border-green-200 rounded text-sm text-green-700 mb-4 flex items-start gap-2">
                  <CheckCircle size={16} className="mt-0.5 flex-shrink-0" />
                  {success}
                </div>
              )}

              <div className="flex gap-2">
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#ec7211] text-white rounded hover:bg-[#eb5f07] text-sm font-medium"
                >
                  {editingId ? 'Update' : 'Create'}
                </button>
                <button
                  type="button"
                  onClick={handleCancel}
                  className="px-4 py-2 border border-gray-300 text-[#16191f] rounded hover:bg-gray-50 text-sm font-medium"
                >
                  Cancel
                </button>
              </div>
            </form>
          )}

          {/* Categories List */}
          {loading ? (
            <div className="text-center py-8 text-[#545b64]">Loading categories...</div>
          ) : (
            <div className="space-y-3">
              {rootCategories.length === 0 ? (
                <p className="text-sm text-[#545b64]">No categories yet. Create one to get started.</p>
              ) : (
                rootCategories.map(category => (
                  <div key={category.id} className="space-y-2">
                    <div className="border border-gray-200 rounded p-3 bg-gray-50 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{category.icon}</span>
                        <div>
                          <p className="font-medium text-[#16191f]">{category.name}</p>
                          <p className="text-xs text-[#545b64]">{getSubcategories(category.id).length} subcategories</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleEdit(category)}
                          className="p-1 hover:bg-white rounded text-[#0073bb]"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button
                          onClick={() => handleDelete(category.id)}
                          className="p-1 hover:bg-white rounded text-red-600"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>

                    {/* Subcategories */}
                    {getSubcategories(category.id).length > 0 && (
                      <div className="ml-8 space-y-2">
                        {getSubcategories(category.id).map(sub => (
                          <div
                            key={sub.id}
                            className="border border-gray-200 rounded p-2 bg-white flex items-center justify-between"
                          >
                            <div className="flex items-center gap-2">
                              <span className="text-xl">{sub.icon}</span>
                              <p className="text-sm font-medium text-[#16191f]">{sub.name}</p>
                            </div>
                            <div className="flex items-center gap-1">
                              <button
                                onClick={() => handleEdit(sub)}
                                className="p-0.5 hover:bg-gray-100 rounded text-[#0073bb]"
                              >
                                <Edit2 size={14} />
                              </button>
                              <button
                                onClick={() => handleDelete(sub.id)}
                                className="p-0.5 hover:bg-gray-100 rounded text-red-600"
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 px-6 py-4 flex items-center justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-[#16191f] border border-gray-300 rounded hover:bg-gray-50"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
