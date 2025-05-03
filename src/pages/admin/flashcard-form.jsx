import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { FaSave, FaArrowLeft } from 'react-icons/fa';
import { supabase } from '../../config/supabase';
import LoadingSpinner from '../../components/LoadingSpinner';

const AdminFlashcardForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditMode = Boolean(id);
  
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [categories, setCategories] = useState([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [formData, setFormData] = useState({
    question: '',
    answer: '',
    category_id: '',
    difficulty: 1
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    checkAdminStatus();
    fetchCategories();
    if (isEditMode) {
      fetchFlashcard();
    }
  }, [id, isEditMode]);

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
      
      // Set default category if creating new flashcard and categories exist
      if (!isEditMode && data && data.length > 0) {
        setFormData(prev => ({ ...prev, category_id: data[0].id }));
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };
  
  const fetchFlashcard = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('flashcards')
        .select('*')
        .eq('id', id)
        .single();
        
      if (error) {
        console.error('Error fetching flashcard:', error);
        navigate('/admin/flashcards');
        return;
      }
      
      if (data) {
        setFormData({
          question: data.question || '',
          answer: data.answer || '',
          category_id: data.category_id || '',
          difficulty: data.difficulty || 1
        });
      }
    } catch (error) {
      console.error('Error fetching flashcard:', error);
      navigate('/admin/flashcards');
    } finally {
      setLoading(false);
    }
  };
  
  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.question.trim()) {
      newErrors.question = 'Pertanyaan harus diisi';
    }
    
    if (!formData.answer.trim()) {
      newErrors.answer = 'Jawaban harus diisi';
    }
    
    if (!formData.category_id) {
      newErrors.category_id = 'Kategori harus dipilih';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    let finalValue = value;
    
    // Convert difficulty to number
    if (name === 'difficulty') {
      finalValue = parseInt(value, 10);
    }
    
    setFormData(prev => ({ ...prev, [name]: finalValue }));
    
    // Clear error when field is updated
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setSaving(true);
    
    try {
      if (isEditMode) {
        // Update existing flashcard
        const { error } = await supabase
          .from('flashcards')
          .update({
            question: formData.question.trim(),
            answer: formData.answer.trim(),
            category_id: formData.category_id,
            difficulty: formData.difficulty,
            updated_at: new Date().toISOString()
          })
          .eq('id', id);
          
        if (error) throw error;
        
        alert('Flashcard berhasil diperbarui!');
      } else {
        // Create new flashcard
        const { error } = await supabase
          .from('flashcards')
          .insert([
            {
              question: formData.question.trim(),
              answer: formData.answer.trim(),
              category_id: formData.category_id,
              difficulty: formData.difficulty
            }
          ]);
          
        if (error) throw error;
        
        alert('Flashcard baru berhasil dibuat!');
      }
      
      navigate('/admin/flashcards');
    } catch (error) {
      console.error('Error saving flashcard:', error);
      alert(`Gagal ${isEditMode ? 'memperbarui' : 'membuat'} flashcard. Silakan coba lagi.`);
    } finally {
      setSaving(false);
    }
  };
  
  if (loading) {
    return <LoadingSpinner />;
  }

  if (!isAdmin) {
    return null; // Akan di-redirect oleh useEffect
  }
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">
            {isEditMode ? 'Edit Flashcard' : 'Tambah Flashcard Baru'}
          </h1>
          <Link
            to="/admin/flashcards"
            className="flex items-center text-blue-600 hover:text-blue-800"
          >
            <FaArrowLeft className="mr-1" /> Kembali
          </Link>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-gray-700 font-medium mb-2" htmlFor="category_id">
              Kategori
            </label>
            <select
              id="category_id"
              name="category_id"
              value={formData.category_id}
              onChange={handleChange}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.category_id ? 'border-red-500' : 'border-gray-300'
              }`}
            >
              <option value="">-- Pilih Kategori --</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
            {errors.category_id && (
              <p className="text-red-500 text-sm mt-1">{errors.category_id}</p>
            )}
          </div>
          
          <div className="mb-4">
            <label className="block text-gray-700 font-medium mb-2" htmlFor="difficulty">
              Tingkat Kesulitan
            </label>
            <select
              id="difficulty"
              name="difficulty"
              value={formData.difficulty}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value={1}>Mudah</option>
              <option value={2}>Sedang</option>
              <option value={3}>Sulit</option>
            </select>
          </div>
          
          <div className="mb-4">
            <label className="block text-gray-700 font-medium mb-2" htmlFor="question">
              Pertanyaan
            </label>
            <textarea
              id="question"
              name="question"
              value={formData.question}
              onChange={handleChange}
              rows="3"
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.question ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Masukkan pertanyaan flashcard"
            />
            {errors.question && (
              <p className="text-red-500 text-sm mt-1">{errors.question}</p>
            )}
          </div>
          
          <div className="mb-6">
            <label className="block text-gray-700 font-medium mb-2" htmlFor="answer">
              Jawaban
            </label>
            <textarea
              id="answer"
              name="answer"
              value={formData.answer}
              onChange={handleChange}
              rows="5"
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.answer ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Masukkan jawaban flashcard"
            />
            {errors.answer && (
              <p className="text-red-500 text-sm mt-1">{errors.answer}</p>
            )}
          </div>
          
          <div className="flex justify-end">
            <button
              type="submit"
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center"
              disabled={saving}
            >
              {saving ? (
                <>
                  <LoadingSpinner size="sm" className="mr-2" />
                  Menyimpan...
                </>
              ) : (
                <>
                  <FaSave className="mr-2" />
                  {isEditMode ? 'Perbarui Flashcard' : 'Simpan Flashcard'}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdminFlashcardForm; 