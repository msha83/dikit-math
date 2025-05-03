import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../../config/supabase';
import { FaEdit, FaTrash, FaPlus, FaArrowLeft, FaSearch } from 'react-icons/fa';
import { BiCategoryAlt } from 'react-icons/bi';
import LoadingSpinner from '../../components/LoadingSpinner';

const AdminFlashcards = () => {
  const [flashcards, setFlashcards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const navigate = useNavigate();

  useEffect(() => {
    checkAdminStatus();
    fetchCategories();
    fetchFlashcards();
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
    }
  };

  const fetchFlashcards = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from('flashcards')
        .select(`
          *,
          flashcard_categories(id, name)
        `)
        .order('created_at', { ascending: false });

      if (selectedCategory !== 'all') {
        query = query.eq('category_id', selectedCategory);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching flashcards:', error);
        return;
      }

      setFlashcards(data || []);
    } catch (error) {
      console.error('Error fetching flashcards:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCategoryChange = (e) => {
    setSelectedCategory(e.target.value);
    setTimeout(() => {
      fetchFlashcards();
    }, 100);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Apakah Anda yakin ingin menghapus flashcard ini?')) {
      try {
        const { error } = await supabase
          .from('flashcards')
          .delete()
          .eq('id', id);

        if (error) {
          console.error('Error deleting flashcard:', error);
          alert('Gagal menghapus flashcard');
          return;
        }

        setFlashcards(flashcards.filter(card => card.id !== id));
        alert('Flashcard berhasil dihapus');
      } catch (error) {
        console.error('Error deleting flashcard:', error);
        alert('Gagal menghapus flashcard');
      }
    }
  };

  const filteredFlashcards = flashcards.filter(card => 
    card.question.toLowerCase().includes(searchTerm.toLowerCase()) || 
    card.answer.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!isAdmin) {
    return null; // Akan di-redirect oleh useEffect
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Kelola Flashcard</h1>
      
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <Link to="/admin" className="btn btn-secondary">
          <FaArrowLeft className="mr-2" /> Kembali ke Dashboard
        </Link>
        <Link to="/admin/flashcard-form" className="btn btn-primary">
          <FaPlus className="mr-2" /> Tambah Flashcard Baru
        </Link>
        <Link to="/admin/flashcard-categories" className="btn btn-info">
          <BiCategoryAlt className="mr-2" /> Kelola Kategori
        </Link>
      </div>

      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="relative flex-grow">
          <input
            type="text"
            placeholder="Cari flashcard..."
            className="w-full p-2 border rounded pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <FaSearch className="absolute left-3 top-3 text-gray-400" />
        </div>
        
        <select
          className="p-2 border rounded"
          value={selectedCategory}
          onChange={handleCategoryChange}
        >
          <option value="all">Semua Kategori</option>
          {categories.map(category => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </select>
      </div>

      {filteredFlashcards.length === 0 ? (
        <div className="text-center p-6 bg-gray-100 rounded-md">
          <p className="text-gray-600">Tidak ada flashcard yang ditemukan.</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border rounded-lg">
            <thead className="bg-gray-100">
              <tr>
                <th className="p-3 text-left">Pertanyaan</th>
                <th className="p-3 text-left">Jawaban</th>
                <th className="p-3 text-left">Kategori</th>
                <th className="p-3 text-left">Tingkat Kesulitan</th>
                <th className="p-3 text-center">Tindakan</th>
              </tr>
            </thead>
            <tbody>
              {filteredFlashcards.map((card) => (
                <tr key={card.id} className="border-b hover:bg-gray-50">
                  <td className="p-3">{card.question}</td>
                  <td className="p-3">{card.answer}</td>
                  <td className="p-3">{card.flashcard_categories?.name || '-'}</td>
                  <td className="p-3">
                    {card.difficulty === 1 && 'Mudah'}
                    {card.difficulty === 2 && 'Sedang'}
                    {card.difficulty === 3 && 'Sulit'}
                  </td>
                  <td className="p-3 text-center">
                    <div className="flex justify-center space-x-2">
                      <Link 
                        to={`/admin/flashcards/edit/${card.id}`}
                        className="btn btn-sm btn-primary"
                      >
                        <FaEdit />
                      </Link>
                      <button 
                        onClick={() => handleDelete(card.id)}
                        className="btn btn-sm btn-error"
                      >
                        <FaTrash />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AdminFlashcards; 