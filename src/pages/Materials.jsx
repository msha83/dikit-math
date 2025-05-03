import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../config/supabase';
import { renderMixedContent } from '../utils/mathUtils.jsx';

const Materials = () => {
  const [materials, setMaterials] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const { data, error } = await supabase
          .from('material_categories')
          .select('*')
          .order('name');
          
        if (error) throw error;
        setCategories(data || []);
      } catch (error) {
        console.error('Error fetching categories:', error);
      }
    };
    
    const fetchMaterials = async () => {
      try {
        setLoading(true);
        
        let query = supabase
          .from('materials')
          .select(`
            *,
            material_categories:category_id(id, name)
          `)
          .order('created_at', { ascending: false });
        
        if (selectedCategory !== 'all') {
          query = query.eq('category_id', selectedCategory);
        }
        
        if (searchTerm) {
          query = query.ilike('title', `%${searchTerm}%`);
        }
        
        const { data, error } = await query;
        
        if (error) throw error;
        setMaterials(data || []);
      } catch (error) {
        console.error('Error fetching materials:', error);
        setError('Failed to load materials. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchCategories();
    fetchMaterials();
  }, [selectedCategory, searchTerm]);

  // Function to truncate text
  const truncateText = (text, maxLength = 150) => {
    if (!text) return '';
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  // Format date to readable format
  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Daftar Materi</h1>
      
      {/* Search and filter */}
      <div className="mb-8 flex flex-col md:flex-row gap-4">
        <div className="flex-1">
          <input
            type="text"
            placeholder="Cari materi..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        
        <div className="w-full md:w-64">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">Semua Kategori</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </div>
      </div>
      
      {/* Error message */}
      {error && (
        <div className="bg-red-50 text-red-700 p-4 rounded-md mb-6">
          {error}
        </div>
      )}
      
      {/* Loading state */}
      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : materials.length === 0 ? (
        <div className="bg-yellow-50 p-6 rounded-lg text-center">
          <h3 className="text-xl font-medium text-yellow-700 mb-2">Tidak ada materi ditemukan</h3>
          <p className="text-yellow-600">
            {searchTerm || selectedCategory !== 'all' 
              ? 'Coba ubah filter pencarian Anda' 
              : 'Belum ada materi yang tersedia'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {materials.map((material) => (
            <Link 
              key={material.id}
              to={`/material/${material.slug}`}
              className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
            >
              <div className="p-6">
                <div className="text-sm font-medium text-blue-600 mb-2">
                  {material.material_categories?.name || 'Uncategorized'}
                </div>
                <h2 className="text-xl font-bold text-gray-800 mb-3">{material.title}</h2>
                <p className="text-gray-600 mb-4 text-sm h-16 overflow-hidden">
                  {truncateText(material.description, 100)}
                </p>
                
                <div className="flex justify-between items-center text-sm text-gray-500 mt-auto">
                  <span>
                    {formatDate(material.created_at)}
                  </span>
                  <span className="inline-flex items-center px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
                    Lihat Detail
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default Materials; 