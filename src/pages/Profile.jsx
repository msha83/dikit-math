import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom';

const Profile = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('profile');
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    bio: '',
    school: '',
    grade: '',
    avatarUrl: ''
  });
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [stats, setStats] = useState({
    completedTopics: 0,
    totalTopics: 0,
    completedExercises: 0,
    totalExercises: 0,
    totalXP: 0,
    dailyStreak: 0,
    rank: 'Pemula',
    nextRank: 'Bintang',
    xpToNextRank: 100,
    topicsCompleted: [],
    recentActivities: []
  });
  const [isEditing, setIsEditing] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    // Check if user is logged in
    const checkAuth = async () => {
      const token = localStorage.getItem('token');
      const storedUser = localStorage.getItem('user');
      
      if (!token || !storedUser) {
        navigate('/login');
        return;
      }
      
      try {
        const userData = JSON.parse(storedUser);
        setUser(userData);
        
        // Set form data from user data
        setFormData({
          name: userData.name || '',
          email: userData.email || '',
          bio: userData.bio || '',
          school: userData.school || '',
          grade: userData.grade || '',
          avatarUrl: userData.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(userData.name || 'User')}&background=random`
        });
        
        // Fetch user statistics (simulated for now)
        fetchUserStats(userData.id);
      } catch (error) {
        console.error("Error loading user data:", error);
        navigate('/login');
      } finally {
        setLoading(false);
      }
    };
    
    checkAuth();
  }, [navigate]);

  const fetchUserStats = (userId) => {
    // Simulated API call to get user stats
    setTimeout(() => {
      // For demo, we'll use random data
      const mockStats = {
        completedTopics: Math.floor(Math.random() * 15) + 5,
        totalTopics: 30,
        completedExercises: Math.floor(Math.random() * 50) + 20,
        totalExercises: 100,
        totalXP: Math.floor(Math.random() * 1000) + 500,
        dailyStreak: Math.floor(Math.random() * 10) + 1,
        rank: 'Bintang',
        nextRank: 'Juara',
        xpToNextRank: Math.floor(Math.random() * 200) + 50,
        topicsCompleted: [
          { id: 1, name: 'Persamaan Linear', date: '2023-10-15', xpEarned: 50 },
          { id: 2, name: 'Fungsi Kuadrat', date: '2023-10-10', xpEarned: 75 },
          { id: 3, name: 'Trigonometri Dasar', date: '2023-10-05', xpEarned: 60 }
        ],
        recentActivities: [
          { id: 1, type: 'quiz', name: 'Latihan Soal Persamaan Linear', date: '2023-10-20', result: '8/10' },
          { id: 2, type: 'flashcard', name: 'Flashcard Logaritma', date: '2023-10-18', result: 'Selesai' },
          { id: 3, type: 'material', name: 'Belajar Materi Statistika', date: '2023-10-15', result: 'Selesai' }
        ]
      };
      
      setStats(mockStats);
    }, 800);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({ ...prev, [name]: value }));
  };

  const handleProfileSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      try {
        // Update localStorage
        const updatedUser = { ...user, ...formData };
        localStorage.setItem('user', JSON.stringify(updatedUser));
        setUser(updatedUser);
        setIsEditing(false);
        setMessage({ type: 'success', text: 'Profil berhasil diperbarui!' });
      } catch (error) {
        setMessage({ type: 'error', text: 'Gagal memperbarui profil. Silakan coba lagi.' });
      } finally {
        setLoading(false);
      }
    }, 1000);
  };

  const handlePasswordSubmit = (e) => {
    e.preventDefault();
    
    // Validate passwords
    if (passwordData.newPassword.length < 6) {
      setMessage({ type: 'error', text: 'Password baru minimal 6 karakter' });
      return;
    }
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setMessage({ type: 'error', text: 'Password baru dan konfirmasi tidak sama' });
      return;
    }
    
    setLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      try {
        // In a real app, you would send this to the server
        setMessage({ type: 'success', text: 'Password berhasil diubah!' });
        setPasswordData({
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        });
      } catch (error) {
        setMessage({ type: 'error', text: 'Gagal mengubah password. Silakan coba lagi.' });
      } finally {
        setLoading(false);
      }
    }, 1000);
  };

  const renderProfileContent = () => {
    if (isEditing) {
      return (
        <form onSubmit={handleProfileSubmit} className="space-y-4">
          <div className="flex flex-col md:flex-row gap-6">
            <div className="md:w-1/3 flex flex-col items-center space-y-3">
              <img 
                src={formData.avatarUrl} 
                alt="Profile" 
                className="w-32 h-32 rounded-full border-4 border-blue-500 object-cover"
              />
              <div className="text-center">
                <input 
                  type="text" 
                  name="avatarUrl" 
                  value={formData.avatarUrl} 
                  onChange={handleInputChange}
                  placeholder="URL Avatar (opsional)"
                  className="mt-2 w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                />
                <p className="text-xs text-gray-500 mt-1">Masukkan URL gambar atau gunakan layanan UI Avatars</p>
              </div>
            </div>
            
            <div className="md:w-2/3 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Nama</label>
                  <input 
                    type="text" 
                    name="name" 
                    value={formData.name} 
                    onChange={handleInputChange}
                    className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Email</label>
                  <input 
                    type="email" 
                    name="email" 
                    value={formData.email} 
                    onChange={handleInputChange}
                    className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Sekolah</label>
                  <input 
                    type="text" 
                    name="school" 
                    value={formData.school} 
                    onChange={handleInputChange}
                    className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Kelas</label>
                  <select 
                    name="grade" 
                    value={formData.grade} 
                    onChange={handleInputChange}
                    className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md"
                  >
                    <option value="">Pilih Kelas</option>
                    <option value="10">Kelas 10</option>
                    <option value="11">Kelas 11</option>
                    <option value="12">Kelas 12</option>
                  </select>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">Bio</label>
                <textarea 
                  name="bio" 
                  value={formData.bio} 
                  onChange={handleInputChange}
                  rows="3"
                  className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md"
                  placeholder="Ceritakan sedikit tentang dirimu..."
                ></textarea>
              </div>
              
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700"
                  disabled={loading}
                >
                  {loading ? 'Menyimpan...' : 'Simpan Perubahan'}
                </button>
              </div>
            </div>
          </div>
        </form>
      );
    } else {
      return (
        <div className="flex flex-col md:flex-row gap-6">
          <div className="md:w-1/3 flex flex-col items-center space-y-3">
            <img 
              src={formData.avatarUrl} 
              alt="Profile" 
              className="w-32 h-32 rounded-full border-4 border-blue-500 object-cover"
            />
            <div className="text-center">
              <h3 className="font-bold text-xl">{formData.name}</h3>
              <p className="text-gray-500">{formData.email}</p>
            </div>
          </div>
          
          <div className="md:w-2/3 space-y-4">
            <div className="flex justify-end">
              <button
                onClick={() => setIsEditing(true)}
                className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700"
              >
                Edit Profil
              </button>
            </div>
            
            <div className="bg-white rounded-lg border p-4 space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="text-sm text-gray-500">Sekolah</h4>
                  <p className="font-medium">{formData.school || 'Belum diisi'}</p>
                </div>
                <div>
                  <h4 className="text-sm text-gray-500">Kelas</h4>
                  <p className="font-medium">{formData.grade ? `Kelas ${formData.grade}` : 'Belum diisi'}</p>
                </div>
              </div>
              
              <div>
                <h4 className="text-sm text-gray-500">Bio</h4>
                <p className="font-medium">{formData.bio || 'Belum ada bio'}</p>
              </div>
            </div>
            
            <div className="bg-white rounded-lg border p-4">
              <h3 className="font-bold text-lg mb-2">Statistik Pembelajaran</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-3 bg-blue-50 rounded-lg">
                  <div className="font-bold text-blue-600 text-xl">{stats.completedTopics}/{stats.totalTopics}</div>
                  <div className="text-gray-600 text-sm">Topik Selesai</div>
                </div>
                <div className="text-center p-3 bg-green-50 rounded-lg">
                  <div className="font-bold text-green-600 text-xl">{stats.completedExercises}/{stats.totalExercises}</div>
                  <div className="text-gray-600 text-sm">Latihan Soal</div>
                </div>
                <div className="text-center p-3 bg-purple-50 rounded-lg">
                  <div className="font-bold text-purple-600 text-xl">{stats.totalXP} XP</div>
                  <div className="text-gray-600 text-sm">Total XP</div>
                </div>
                <div className="text-center p-3 bg-orange-50 rounded-lg">
                  <div className="font-bold text-orange-600 text-xl">{stats.dailyStreak} hari</div>
                  <div className="text-gray-600 text-sm">Streak Harian</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      );
    }
  };

  const renderPasswordContent = () => {
    return (
      <div className="max-w-md mx-auto">
        <h3 className="font-bold text-lg mb-4">Ubah Password</h3>
        <form onSubmit={handlePasswordSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Password Saat Ini</label>
            <input 
              type="password" 
              name="currentPassword" 
              value={passwordData.currentPassword} 
              onChange={handlePasswordChange}
              className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Password Baru</label>
            <input 
              type="password" 
              name="newPassword" 
              value={passwordData.newPassword} 
              onChange={handlePasswordChange}
              className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md"
              required
            />
            <p className="text-xs text-gray-500 mt-1">Minimal 6 karakter</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Konfirmasi Password Baru</label>
            <input 
              type="password" 
              name="confirmPassword" 
              value={passwordData.confirmPassword} 
              onChange={handlePasswordChange}
              className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md"
              required
            />
          </div>
          <div className="pt-2">
            <button
              type="submit"
              className="w-full px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700"
              disabled={loading}
            >
              {loading ? 'Memproses...' : 'Ubah Password'}
            </button>
          </div>
        </form>
      </div>
    );
  };

  const renderAchievementsContent = () => {
    return (
      <div className="space-y-6">
        <div>
          <h3 className="font-bold text-lg mb-4">Level Pengguna</h3>
          <div className="bg-white p-4 rounded-lg border">
            <div className="flex justify-between items-center mb-2">
              <div>
                <span className="font-bold text-lg">{stats.rank}</span>
                <span className="text-gray-500 ml-2">({stats.totalXP} XP)</span>
              </div>
              <div className="text-gray-500">
                <span>{stats.xpToNextRank} XP lagi ke level {stats.nextRank}</span>
              </div>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2.5">
              <div 
                className="bg-blue-600 h-2.5 rounded-full" 
                style={{ width: `${(stats.totalXP / (stats.totalXP + stats.xpToNextRank)) * 100}%` }}
              ></div>
            </div>
          </div>
        </div>
        
        <div>
          <h3 className="font-bold text-lg mb-4">Aktivitas Terbaru</h3>
          <div className="bg-white rounded-lg border overflow-hidden">
            <ul className="divide-y">
              {stats.recentActivities.length > 0 ? (
                stats.recentActivities.map(activity => (
                  <li key={activity.id} className="p-4 hover:bg-gray-50">
                    <div className="flex justify-between">
                      <div>
                        <p className="font-medium">{activity.name}</p>
                        <p className="text-sm text-gray-500">{activity.date}</p>
                      </div>
                      <div>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          activity.type === 'quiz' ? 'bg-green-100 text-green-800' : 
                          activity.type === 'flashcard' ? 'bg-blue-100 text-blue-800' : 
                          'bg-purple-100 text-purple-800'
                        }`}>
                          {activity.result}
                        </span>
                      </div>
                    </div>
                  </li>
                ))
              ) : (
                <li className="p-4 text-center text-gray-500">
                  Belum ada aktivitas
                </li>
              )}
            </ul>
          </div>
        </div>
        
        <div>
          <h3 className="font-bold text-lg mb-4">Topik Selesai</h3>
          <div className="bg-white rounded-lg border overflow-hidden">
            <ul className="divide-y">
              {stats.topicsCompleted.length > 0 ? (
                stats.topicsCompleted.map(topic => (
                  <li key={topic.id} className="p-4 hover:bg-gray-50">
                    <div className="flex justify-between">
                      <div>
                        <p className="font-medium">{topic.name}</p>
                        <p className="text-sm text-gray-500">{topic.date}</p>
                      </div>
                      <div>
                        <span className="text-blue-600 font-medium">+{topic.xpEarned} XP</span>
                      </div>
                    </div>
                  </li>
                ))
              ) : (
                <li className="p-4 text-center text-gray-500">
                  Belum ada topik yang diselesaikan
                </li>
              )}
            </ul>
          </div>
        </div>
      </div>
    );
  };

  if (loading && !user) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Profil Saya</h2>
          <p className="text-gray-600">Kelola informasi profil dan preferensi pembelajaran Anda</p>
        </div>

        {message.text && (
          <div className={`mb-4 p-3 rounded-md ${message.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
            {message.text}
          </div>
        )}
        
        <div className="bg-white shadow rounded-lg overflow-hidden mb-8">
          <div className="border-b">
            <nav className="flex">
              <button
                onClick={() => {
                  setActiveTab('profile');
                  setMessage({ type: '', text: '' });
                }}
                className={`px-6 py-4 text-sm font-medium ${
                  activeTab === 'profile' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Profil
              </button>
              <button
                onClick={() => {
                  setActiveTab('password');
                  setMessage({ type: '', text: '' });
                }}
                className={`px-6 py-4 text-sm font-medium ${
                  activeTab === 'password' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Ubah Password
              </button>
              <button
                onClick={() => {
                  setActiveTab('achievements');
                  setMessage({ type: '', text: '' });
                }}
                className={`px-6 py-4 text-sm font-medium ${
                  activeTab === 'achievements' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Pencapaian
              </button>
            </nav>
          </div>
          
          <div className="p-6">
            {activeTab === 'profile' && renderProfileContent()}
            {activeTab === 'password' && renderPasswordContent()}
            {activeTab === 'achievements' && renderAchievementsContent()}
          </div>
        </div>
        
        <div className="text-center">
          <Link to="/dashboard" className="text-blue-600 hover:text-blue-800">
            &larr; Kembali ke Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Profile; 