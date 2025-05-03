import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../../config/supabase';

const CategoryManager = () => {
  const navigate = useNavigate();
  
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [error, setError] = useState(null);
  
  const [newCategory, setNewCategory] = useState({
    id: null,
    name: '',
    slug: '',
    description: ''
  });
  
  const [isEditing, setIsEditing] = useState(false);
  
  useEffect(() => {
    const checkAdminStatus = async () => {
      try {
        setLoading(true);
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session) {
          navigate('/login');
          return;
        }
        
        // Check if user is admin
        const { data, error } = await supabase
          .from('user_roles')
          .select('role')
          .eq('id', session.user.id)
          .single();
        
        if (error || !data || data.role !== 'admin') {
          navigate('/');
          return;
        }
        
        setIsAdmin(true);
        fetchCategories();
      } catch (error) {
        console.error('Error checking admin status:', error);
        navigate('/');
      } finally {
        setLoading(false);
      }
    };
    
    checkAdminStatus();
  }, [navigate]);
  
  const fetchCategories = async () => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('material_categories')
        .select('*')
        .order('name');
      
      if (error) throw error;
      setCategories(data || []);
    } catch (error) {
      console.error('Error fetching categories:', error);
      setError('Gagal memuat kategori');
    } finally {
      setLoading(false);
    }
  };
  
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewCategory(prev => ({ ...prev, [name]: value }));
    
    // Auto-generate slug from name
    if (name === 'name') {
      const slug = value
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
      
      setNewCategory(prev => ({ ...prev, slug }));
    }
  };
  
  const validateForm = () => {
    if (!newCategory.name.trim()) {
      setError('Nama kategori wajib diisi');
      return false;
    }
    
    if (!newCategory.slug.trim()) {
      setError('Slug wajib diisi');
      return false;
    }
    
    // Check for duplicate slugs when adding a new category
    if (!isEditing && categories.some(cat => cat.slug === newCategory.slug)) {
      setError('Slug sudah digunakan');
      return false;
    }
    
    setError(null);
    return true;
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    try {
      setSaving(true);
      
      let result;
      
      if (isEditing) {
        result = await supabase
          .from('material_categories')
          .update({
            name: newCategory.name,
            slug: newCategory.slug,
            description: newCategory.description,
            updated_at: new Date()
          })
          .eq('id', newCategory.id);
      } else {
        result = await supabase
          .from('material_categories')
          .insert([{
            name: newCategory.name,
            slug: newCategory.slug,
            description: newCategory.description
          }]);
      }
      
      const { error } = result;
      
      if (error) throw error;
      
      // Reset form
      setNewCategory({
        id: null,
        name: '',
        slug: '',
        description: ''
      });
      setIsEditing(false);
      
      // Refresh categories
      fetchCategories();
    } catch (error) {
      console.error('Error saving category:', error);
      setError('Gagal menyimpan kategori');
    } finally {
      setSaving(false);
    }
  };
  
  const handleEdit = (category) => {
    setNewCategory({
      id: category.id,
      name: category.name,
      slug: category.slug,
      description: category.description || ''
    });
    setIsEditing(true);
  };
  
  const handleCancel = () => {
    setNewCategory({
      id: null,
      name: '',
      slug: '',
      description: ''
    });
    setIsEditing(false);
    setError(null);
  };
  
  const handleDelete = async (id) => {
    if (!window.confirm('Apakah Anda yakin ingin menghapus kategori ini? Materi yang terkait dengan kategori ini mungkin akan terpengaruh.')) {
      return;
    }
    
    try {
      setLoading(true);
      
      const { error } = await supabase
        .from('material_categories')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      fetchCategories();
    } catch (error) {
      console.error('Error deleting category:', error);
      setError('Gagal menghapus kategori. Pastikan tidak ada materi yang menggunakan kategori ini.');
    } finally {
      setLoading(false);
    }
  };
  
  if (loading && !isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }
  
  if (!isAdmin) {
    return null; // Will redirect in useEffect
  }
  
  return (
    <div className="min-h-screen bg-gray-100">
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <h1 className="text-xl font-bold text-gray-900">Kelola Kategori Materi</h1>
            <button
              onClick={() => navigate('/admin/materials')}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-gray-700 bg-gray-200 hover:bg-gray-300"
            >
              Kembali
            </button>
          </div>
        </div>
      </div>
      
      <div className="py-10">
        <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
          {/* Form kategori */}
          <div className="bg-white shadow-sm rounded-lg overflow-hidden">
            <div className="p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">
                {isEditing ? 'Edit Kategori' : 'Tambah Kategori Baru'}
              </h2>
              
              {error && (
                <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-4">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <p className="text-sm text-red-700">
                        {error}
                      </p>
                    </div>
                  </div>
                </div>
              )}
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                      Nama Kategori <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={newCategory.name}
                      onChange={handleInputChange}
                      className="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                      required
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="slug" className="block text-sm font-medium text-gray-700">
                      Slug <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      id="slug"
                      name="slug"
                      value={newCategory.slug}
                      onChange={handleInputChange}
                      className="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                      required
                    />
                    <p className="mt-1 text-xs text-gray-500">
                      ID unik untuk URL (contoh: "aljabar")
                    </p>
                  </div>
                </div>
                
                <div>
                  <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                    Deskripsi
                  </label>
                  <textarea
                    id="description"
                    name="description"
                    rows="3"
                    value={newCategory.description}
                    onChange={handleInputChange}
                    className="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                  ></textarea>
                </div>
                
                <div className="flex justify-end space-x-3">
                  {isEditing && (
                    <button
                      type="button"
                      onClick={handleCancel}
                      className="inline-flex justify-center py-2 px-4 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                    >
                      Batal
                    </button>
                  )}
                  
                  <button
                    type="submit"
                    disabled={saving}
                    className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                  >
                    {saving ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Menyimpan...
                      </>
                    ) : (
                      isEditing ? 'Update Kategori' : 'Tambah Kategori'
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
          
          {/* Daftar kategori */}
          <div className="mt-8 bg-white shadow-sm rounded-lg overflow-hidden">
            <div className="p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">
                Daftar Kategori
              </h2>
              
              {loading ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
                </div>
              ) : categories.length === 0 ? (
                <div className="text-center py-4 text-gray-500">
                  Belum ada kategori tersimpan
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Nama
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Slug
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Deskripsi
                        </th>
                        <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Aksi
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {categories.map((category) => (
                        <tr key={category.id}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {category.name}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {category.slug}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-500">
                            {category.description || 'Tidak ada deskripsi'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <button
                              onClick={() => handleEdit(category)}
                              className="text-blue-600 hover:text-blue-900 mr-4"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleDelete(category.id)}
                              className="text-red-600 hover:text-red-900"
                            >
                              Hapus
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CategoryManager; 