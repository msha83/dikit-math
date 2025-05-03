import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../../config/supabase';
import { FaEdit, FaTrash, FaPlus, FaArrowLeft, FaSave, FaTimes } from 'react-icons/fa';
import LoadingSpinner from '../../components/LoadingSpinner';

const FlashcardCategories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [newCategory, setNewCategory] = useState('');
  const [editingCategory, setEditingCategory] = useState(null);
  const [editName, setEditName] = useState('');
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    checkAdminStatus();
    fetchCategories();
  }, []);

  const checkAdminStatus = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate('/login');
        return;
      }

      const userId = session.user.id;
      const { data: userRoles, error: userRolesError } = await supabase
        .from('user_roles')
        .select('role')
        .eq('id', userId)
        .single();

      if (userRolesError) {
        console.error('Error checking admin status:', userRolesError);
        navigate('/');
        return;
      }

      if (userRoles?.role !== 'admin') {
        navigate('/');
        return;
      }

      setIsAdmin(true);
    } catch (error) {
      console.error('Error checking admin status:', error);
      navigate('/');
    }
  };

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('flashcard_categories')
        .select('*')
        .order('name');

      if (error) {
        console.error('Error fetching categories:', error);
        return;
      }

      setCategories(data || []);
    } catch (error) {
      console.error('Error fetching categories:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddCategory = async (e) => {
    e.preventDefault();
    
    if (!newCategory.trim()) {
      setErrors({ newCategory: 'Nama kategori tidak boleh kosong' });
      return;
    }
    
    setErrors({});
    
    try {
      const { data, error } = await supabase
        .from('flashcard_categories')
        .insert([{ name: newCategory.trim() }])
        .select();

      if (error) {
        console.error('Error adding category:', error);
        alert('Gagal menambahkan kategori');
        return;
      }

      setCategories([...categories, data[0]]);
      setNewCategory('');
      alert('Kategori baru berhasil ditambahkan');
    } catch (error) {
      console.error('Error adding category:', error);
      alert('Gagal menambahkan kategori');
    }
  };

  const handleEditCategory = async (e) => {
    e.preventDefault();
    
    if (!editName.trim()) {
      setErrors({ editName: 'Nama kategori tidak boleh kosong' });
      return;
    }
    
    setErrors({});
    
    try {
      const { error } = await supabase
        .from('flashcard_categories')
        .update({ name: editName.trim() })
        .eq('id', editingCategory.id);

      if (error) {
        console.error('Error updating category:', error);
        alert('Gagal memperbarui kategori');
        return;
      }

      setCategories(categories.map(cat => 
        cat.id === editingCategory.id ? { ...cat, name: editName.trim() } : cat
      ));
      
      setEditingCategory(null);
      setEditName('');
      alert('Kategori berhasil diperbarui');
    } catch (error) {
      console.error('Error updating category:', error);
      alert('Gagal memperbarui kategori');
    }
  };

  const startEditing = (category) => {
    setEditingCategory(category);
    setEditName(category.name);
    setErrors({});
  };

  const cancelEditing = () => {
    setEditingCategory(null);
    setEditName('');
    setErrors({});
  };

  const handleDelete = async (id) => {
    // Check if there are flashcards using this category
    const { data, error } = await supabase
      .from('flashcards')
      .select('id')
      .eq('category_id', id)
      .limit(1);
      
    if (error) {
      console.error('Error checking flashcards:', error);
      alert('Terjadi kesalahan saat memeriksa kategori');
      return;
    }
    
    if (data && data.length > 0) {
      alert('Kategori ini tidak dapat dihapus karena masih digunakan oleh flashcard. Silakan hapus atau pindahkan flashcard terlebih dahulu.');
      return;
    }
    
    if (window.confirm('Apakah Anda yakin ingin menghapus kategori ini?')) {
      try {
        const { error } = await supabase
          .from('flashcard_categories')
          .delete()
          .eq('id', id);

        if (error) {
          console.error('Error deleting category:', error);
          alert('Gagal menghapus kategori');
          return;
        }

        setCategories(categories.filter(cat => cat.id !== id));
        alert('Kategori berhasil dihapus');
      } catch (error) {
        console.error('Error deleting category:', error);
        alert('Gagal menghapus kategori');
      }
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!isAdmin) {
    return null; // Akan di-redirect oleh useEffect
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Kelola Kategori Flashcard</h1>
      
      <div className="flex gap-4 mb-6">
        <Link to="/admin/flashcards" className="btn btn-secondary">
          <FaArrowLeft className="mr-2" /> Kembali ke Flashcards
        </Link>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Form Tambah Kategori */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Tambah Kategori Baru</h2>
          <form onSubmit={handleAddCategory}>
            <div className="mb-4">
              <label htmlFor="newCategory" className="block text-gray-700 mb-2">
                Nama Kategori
              </label>
              <input
                type="text"
                id="newCategory"
                className={`w-full p-2 border rounded ${errors.newCategory ? 'border-red-500' : 'border-gray-300'}`}
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
                placeholder="Masukkan nama kategori baru"
              />
              {errors.newCategory && (
                <p className="text-red-500 text-sm mt-1">{errors.newCategory}</p>
              )}
            </div>
            <button 
              type="submit"
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded flex items-center"
            >
              <FaPlus className="mr-2" /> Tambah Kategori
            </button>
          </form>
        </div>
        
        {/* Daftar Kategori */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Daftar Kategori</h2>
          
          {categories.length === 0 ? (
            <p className="text-gray-500">Belum ada kategori yang ditambahkan.</p>
          ) : (
            <ul className="divide-y">
              {categories.map((category) => (
                <li key={category.id} className="py-3">
                  {editingCategory && editingCategory.id === category.id ? (
                    <form onSubmit={handleEditCategory} className="flex items-center">
                      <input
                        type="text"
                        className={`flex-grow p-2 border rounded mr-2 ${errors.editName ? 'border-red-500' : 'border-gray-300'}`}
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                      />
                      {errors.editName && (
                        <p className="text-red-500 text-sm absolute -mt-6">{errors.editName}</p>
                      )}
                      <button 
                        type="submit"
                        className="bg-green-600 hover:bg-green-700 text-white p-2 rounded mr-1"
                        title="Simpan"
                      >
                        <FaSave />
                      </button>
                      <button 
                        type="button"
                        onClick={cancelEditing}
                        className="bg-gray-600 hover:bg-gray-700 text-white p-2 rounded"
                        title="Batal"
                      >
                        <FaTimes />
                      </button>
                    </form>
                  ) : (
                    <div className="flex items-center justify-between">
                      <span className="text-gray-800">{category.name}</span>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => startEditing(category)}
                          className="text-blue-600 hover:text-blue-800 p-1"
                          title="Edit"
                        >
                          <FaEdit />
                        </button>
                        <button
                          onClick={() => handleDelete(category.id)}
                          className="text-red-600 hover:text-red-800 p-1"
                          title="Hapus"
                        >
                          <FaTrash />
                        </button>
                      </div>
                    </div>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
};

export default FlashcardCategories; 