import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { supabase } from '../../../config/supabase';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { renderMixedContent } from '../../../utils/mathUtils.jsx';
import { ExampleProblem } from '../../../components/MaterialContent';

const MaterialForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditing = !!id;
  
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [categories, setCategories] = useState([]);
  const [material, setMaterial] = useState({
    title: '',
    slug: '',
    description: '',
    category: '',
    content: '',
    video_url: '',
    example_problems: [{ question: '', answer: '', explanation: '' }]
  });
  const [errors, setErrors] = useState({});

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
        
        if (isEditing) {
          fetchMaterial();
        }
      } catch (error) {
        console.error('Error checking admin status:', error);
        navigate('/');
      } finally {
        setLoading(false);
      }
    };
    
    checkAdminStatus();
  }, [navigate, id, isEditing]);
  
  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('material_categories')
        .select('*')
        .order('name');
      
      if (error) throw error;
      setCategories(data || []);
      
      // Set first category as default if creating new material
      if (!isEditing && data && data.length > 0) {
        setMaterial(prev => ({ ...prev, category: data[0].id }));
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };
  
  const fetchMaterial = async () => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('materials')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) throw error;
      
      if (data) {
        // If example_problems field is missing or not an array, initialize it
        const example_problems = 
          Array.isArray(data.example_problems) 
            ? data.example_problems 
            : [{ question: '', answer: '', explanation: '' }];
            
        setMaterial({
          ...data,
          example_problems
        });
      }
    } catch (error) {
      console.error('Error fetching material:', error);
      alert('Materi tidak ditemukan');
      navigate('/admin/materials');
    } finally {
      setLoading(false);
    }
  };
  
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setMaterial(prev => ({ ...prev, [name]: value }));
    
    // Auto-generate slug from title
    if (name === 'title') {
      const slug = value
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
      
      setMaterial(prev => ({ ...prev, slug }));
    }
  };
  
  const handleContentChange = (value) => {
    setMaterial(prev => ({ ...prev, content: value }));
  };
  
  const addExampleProblem = () => {
    setMaterial(prev => ({
      ...prev,
      example_problems: [
        ...prev.example_problems,
        { question: '', answer: '', explanation: '' }
      ]
    }));
  };
  
  const removeExampleProblem = (index) => {
    setMaterial(prev => ({
      ...prev,
      example_problems: prev.example_problems.filter((_, i) => i !== index)
    }));
  };
  
  const handleExampleProblemChange = (index, field, value) => {
    setMaterial(prev => {
      const newExampleProblems = [...prev.example_problems];
      newExampleProblems[index] = {
        ...newExampleProblems[index],
        [field]: value
      };
      return { ...prev, example_problems: newExampleProblems };
    });
  };
  
  const validateForm = () => {
    const newErrors = {};
    
    if (!material.title.trim()) newErrors.title = 'Judul wajib diisi';
    if (!material.slug.trim()) newErrors.slug = 'Slug wajib diisi';
    if (!material.category) newErrors.category = 'Kategori wajib dipilih';
    if (!material.description.trim()) newErrors.description = 'Deskripsi wajib diisi';
    if (!material.content.trim()) newErrors.content = 'Konten wajib diisi';
    
    // Validate URL format if provided
    if (material.video_url && !/^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/.*/.test(material.video_url)) {
      newErrors.video_url = 'URL video harus berformat YouTube yang valid';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      window.scrollTo(0, 0);
      return;
    }
    
    try {
      setSaving(true);
      
      const { video_url, ...materialData } = material;
      
      // Format video URL if provided
      if (video_url) {
        // Extract video ID from various YouTube URL formats
        let videoId = '';
        const youtubeRegex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
        const match = video_url.match(youtubeRegex);
        
        if (match && match[1]) {
          videoId = match[1];
          materialData.video_embed = `https://www.youtube.com/embed/${videoId}`;
        } else {
          materialData.video_embed = video_url;
        }
      }
      
      materialData.updated_at = new Date();
      
      let result;
      
      if (isEditing) {
        const updateObject = {
          title: materialData.title,
          slug: materialData.slug,
          description: materialData.description,
          content: materialData.content,
          category: materialData.category,
          video_embed: materialData.video_embed,
          example_problems: materialData.example_problems,
          updated_at: materialData.updated_at
        };
        
        result = await supabase
          .from('materials')
          .update(updateObject)
          .eq('id', id);
      } else {
        const insertData = {
          title: materialData.title,
          slug: materialData.slug,
          description: materialData.description,
          content: materialData.content,
          video_embed: materialData.video_embed,
          example_problems: materialData.example_problems,
          category: materialData.category,
          created_at: new Date(),
          created_by: (await supabase.auth.getUser()).data.user.id,
          updated_at: new Date()
        };
        
        console.log("Mencoba menyimpan data:", insertData);

        result = await supabase
          .from('materials')
          .insert({
            title: insertData.title,
            slug: insertData.slug,
            description: insertData.description,
            content: insertData.content,
            category: insertData.category,
            video_embed: insertData.video_embed,
            example_problems: insertData.example_problems,
            created_by: insertData.created_by,
            created_at: insertData.created_at,
            updated_at: insertData.updated_at
          });
      }
      
      const { error } = result;
      
      if (error) {
        console.error("Error detail:", error);
        throw error;
      }
      
      alert(isEditing ? 'Materi berhasil diperbarui' : 'Materi berhasil ditambahkan');
      navigate('/admin/materials');
    } catch (error) {
      console.error('Error saving material:', error);
      alert(`Gagal menyimpan materi: ${error.message || 'Silakan coba lagi.'}`);
    } finally {
      setSaving(false);
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
  
  const modules = {
    toolbar: [
      [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ 'list': 'ordered'}, { 'list': 'bullet' }],
      ['blockquote', 'code-block'],
      ['link', 'image', 'formula'],
      [{ 'align': [] }],
      ['clean']
    ],
  };
  
  const PreviewTab = ({ problem, index }) => {
    if (!problem) return null;
    return <ExampleProblem problem={problem} index={index} />;
  };
  
  return (
    <div className="min-h-screen bg-gray-100">
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <h1 className="text-xl font-bold text-gray-900">
              {isEditing ? 'Edit Materi' : 'Tambah Materi Baru'}
            </h1>
            <div className="flex space-x-2">
              <button
                type="button"
                onClick={() => {
                  console.log("Selected category:", material.category);
                  console.log("Available categories:", categories);
                  console.log("Current material data:", material);
                  alert("Data telah dicatat di console untuk debugging");
                }}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
              >
                Debug Data
              </button>
              <button
                onClick={() => navigate('/admin/materials')}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-gray-700 bg-gray-200 hover:bg-gray-300"
              >
                Batal
              </button>
            </div>
          </div>
        </div>
      </div>
      
      <div className="py-10">
        <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
          <div className="bg-white shadow-sm rounded-lg overflow-hidden">
            <div className="p-6">
              {Object.keys(errors).length > 0 && (
                <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-red-800">
                        Ada beberapa kesalahan dalam formulir:
                      </h3>
                      <div className="mt-2 text-sm text-red-700">
                        <ul className="list-disc pl-5 space-y-1">
                          {Object.entries(errors).map(([field, message]) => (
                            <li key={field}>{message}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                  {/* Judul */}
                  <div className="sm:col-span-4">
                    <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                      Judul <span className="text-red-500">*</span>
                    </label>
                    <div className="mt-1">
                      <input
                        type="text"
                        name="title"
                        id="title"
                        className={`shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md ${errors.title ? 'border-red-300' : ''}`}
                        value={material.title}
                        onChange={handleInputChange}
                      />
                    </div>
                  </div>
                  
                  {/* Slug */}
                  <div className="sm:col-span-2">
                    <label htmlFor="slug" className="block text-sm font-medium text-gray-700">
                      Slug <span className="text-red-500">*</span>
                    </label>
                    <div className="mt-1">
                      <input
                        type="text"
                        name="slug"
                        id="slug"
                        className={`shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md ${errors.slug ? 'border-red-300' : ''}`}
                        value={material.slug}
                        onChange={handleInputChange}
                      />
                    </div>
                    <p className="mt-1 text-xs text-gray-500">
                      Digunakan untuk URL. Contoh: "aljabar-dasar"
                    </p>
                  </div>
                  
                  {/* Kategori */}
                  <div className="sm:col-span-3">
                    <label htmlFor="category" className="block text-sm font-medium text-gray-700">
                      Kategori <span className="text-red-500">*</span>
                    </label>
                    <div className="mt-1">
                      <select
                        id="category"
                        name="category"
                        className={`shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md ${errors.category ? 'border-red-300' : ''}`}
                        value={material.category}
                        onChange={handleInputChange}
                      >
                        <option value="">Pilih Kategori</option>
                        {categories.map(category => (
                          <option key={category.id} value={category.id}>{category.name}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  
                  {/* Video URL */}
                  <div className="sm:col-span-3">
                    <label htmlFor="video_url" className="block text-sm font-medium text-gray-700">
                      URL Video (Opsional)
                    </label>
                    <div className="mt-1">
                      <input
                        type="text"
                        name="video_url"
                        id="video_url"
                        className={`shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md ${errors.video_url ? 'border-red-300' : ''}`}
                        value={material.video_url || ''}
                        onChange={handleInputChange}
                        placeholder="https://www.youtube.com/watch?v=..."
                      />
                    </div>
                    <p className="mt-1 text-xs text-gray-500">
                      Masukkan URL video YouTube
                    </p>
                  </div>
                  
                  {/* Deskripsi */}
                  <div className="sm:col-span-6">
                    <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                      Deskripsi Singkat <span className="text-red-500">*</span>
                    </label>
                    <div className="mt-1">
                      <textarea
                        id="description"
                        name="description"
                        rows={3}
                        className={`shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md ${errors.description ? 'border-red-300' : ''}`}
                        value={material.description}
                        onChange={handleInputChange}
                      />
                    </div>
                    <p className="mt-1 text-xs text-gray-500">
                      Deskripsi singkat tentang materi yang akan ditampilkan di daftar materi
                    </p>
                  </div>
                  
                  {/* Konten */}
                  <div className="sm:col-span-6">
                    <label htmlFor="content" className="block text-sm font-medium text-gray-700">
                      Konten <span className="text-red-500">*</span>
                    </label>
                    <div className="mt-1">
                      <ReactQuill
                        theme="snow"
                        modules={modules}
                        value={material.content}
                        onChange={handleContentChange}
                        className={`block w-full sm:text-sm rounded-md ${errors.content ? 'border-red-300' : ''}`}
                      />
                    </div>
                    <p className="mt-1 text-xs text-gray-500">
                      Isi konten materi dengan penjelasan lengkap, rumus, dan contoh. Mendukung format rich text.
                    </p>
                  </div>
                  
                  {/* Contoh Soal */}
                  <div className="sm:col-span-6">
                    <div className="flex justify-between items-center">
                      <label className="block text-sm font-medium text-gray-700">
                        Contoh Soal (Opsional)
                      </label>
                      <button
                        type="button"
                        onClick={addExampleProblem}
                        className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200"
                      >
                        + Tambah Soal
                      </button>
                    </div>
                    
                    {material.example_problems.map((problem, index) => (
                      <div key={index} className="mb-8 p-4 bg-gray-50 rounded-lg">
                        <div className="flex justify-between items-center mb-4">
                          <h3 className="text-lg font-medium">Contoh Soal #{index + 1}</h3>
                          <div className="flex gap-2">
                            <button
                              type="button"
                              onClick={() => removeExampleProblem(index)}
                              className="px-2 py-1 text-sm text-red-600 border border-red-300 rounded hover:bg-red-50"
                            >
                              Hapus
                            </button>
                            
                            <button
                              type="button" 
                              onClick={() => {
                                setMaterial(prev => {
                                  const newExampleProblems = [...prev.example_problems];
                                  newExampleProblems[index] = {
                                    ...newExampleProblems[index],
                                    isPreview: !newExampleProblems[index].isPreview
                                  };
                                  return { ...prev, example_problems: newExampleProblems };
                                });
                              }}
                              className="px-2 py-1 text-sm text-blue-600 border border-blue-300 rounded hover:bg-blue-50"
                            >
                              {problem.isPreview ? 'Edit' : 'Preview'}
                            </button>
                          </div>
                        </div>
                        
                        {problem.isPreview ? (
                          <PreviewTab problem={problem} index={index} />
                        ) : (
                          <>
                            <div className="mb-4">
                              <label className="block text-sm font-medium mb-1">
                                Pertanyaan <span className="text-xs text-gray-500">(Gunakan $...$ untuk rumus matematika)</span>
                              </label>
                              <textarea
                                value={problem.question || ''}
                                onChange={(e) => handleExampleProblemChange(index, 'question', e.target.value)}
                                className="w-full p-2 border rounded"
                                rows="3"
                              />
                            </div>
                            
                            <div className="mb-4">
                              <label className="block text-sm font-medium mb-1">
                                Jawaban <span className="text-xs text-gray-500">(Gunakan $...$ untuk rumus matematika)</span>
                              </label>
                              <textarea
                                value={problem.answer || ''}
                                onChange={(e) => handleExampleProblemChange(index, 'answer', e.target.value)}
                                className="w-full p-2 border rounded"
                                rows="3"
                              />
                            </div>
                            
                            <div className="mb-4">
                              <label className="block text-sm font-medium mb-1">
                                Penjelasan <span className="text-xs text-gray-500">(Gunakan $...$ untuk rumus matematika)</span>
                              </label>
                              <textarea
                                value={problem.explanation || ''}
                                onChange={(e) => handleExampleProblemChange(index, 'explanation', e.target.value)}
                                className="w-full p-2 border rounded"
                                rows="3"
                              />
                            </div>
                          </>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="pt-5 flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => navigate('/admin/materials')}
                    className="inline-flex justify-center py-2 px-4 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                  >
                    Batal
                  </button>
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
                      'Simpan'
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MaterialForm; 