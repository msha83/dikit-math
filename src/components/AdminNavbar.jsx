import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { supabase } from '../config/supabase';
import { FaHome, FaBook, FaQuestion, FaLayerGroup, FaUsers, FaCog } from 'react-icons/fa';

const AdminNavbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const navLinks = [
    { to: '/admin', label: 'Dashboard', icon: FaHome },
    { to: '/admin/materials', label: 'Materi', icon: FaBook },
    { to: '/admin/quizzes', label: 'Kuis', icon: FaQuestion },
    { to: '/admin/flashcards', label: 'Flashcard', icon: FaLayerGroup },
    { to: '/admin/users', label: 'Pengguna', icon: FaUsers },
    { to: '/admin/tools', label: 'Pengaturan', icon: FaCog },
  ];

  useEffect(() => {
    const getUser = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          const { data: userData, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single();

          if (!error && userData) {
            setUser(userData);
          }
        }
      } catch (error) {
        console.error('Error fetching user:', error);
      } finally {
        setLoading(false);
      }
    };

    getUser();
  }, []);

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
      navigate('/login');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const isActive = (path) => {
    if (path === '/admin' && location.pathname === '/admin') {
      return true;
    }
    return location.pathname.startsWith(path) && path !== '/admin';
  };

  return (
    <nav className="bg-blue-800 text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/admin" className="flex-shrink-0 flex items-center">
              <div className="h-8 w-8 bg-blue-600 rounded-md flex items-center justify-center text-xl font-bold mr-2">M</div>
              <span className="font-bold text-xl">MathMax Admin</span>
            </Link>
            <div className="hidden md:ml-6 md:flex md:space-x-4">
              {navLinks.map((link) => (
                <Link 
                  key={link.to}
                  to={link.to} 
                  className={`px-3 py-2 rounded-md text-sm font-medium flex items-center ${
                    isActive(link.to) ? 'bg-blue-900 text-white' : 'text-blue-100 hover:bg-blue-700'
                  }`}
                >
                  {link.icon && <link.icon className="mr-1.5 h-4 w-4" />}
                  {link.label}
                </Link>
              ))}
              <Link 
                to="/dashboard" 
                className="px-3 py-2 rounded-md text-sm font-medium text-blue-100 hover:bg-blue-700 flex items-center"
              >
                <svg className="mr-1.5 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
                </svg>
                Kembali ke Aplikasi
              </Link>
            </div>
          </div>
          <div className="flex items-center">
            <div className="ml-3 relative">
              <div>
                <button
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="flex text-sm rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-blue-800 focus:ring-white"
                >
                  <span className="sr-only">Open user menu</span>
                  <div className="h-8 w-8 rounded-full bg-blue-600 flex items-center justify-center text-white uppercase">
                    {user?.username ? user.username.charAt(0) : user?.full_name ? user.full_name.charAt(0) : 'A'}
                  </div>
                </button>
              </div>
              {isDropdownOpen && (
                <div 
                  className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg py-1 bg-white ring-1 ring-black ring-opacity-5 z-10"
                  role="menu"
                  aria-orientation="vertical"
                  aria-labelledby="user-menu"
                >
                  <Link 
                    to="/profile" 
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100" 
                    role="menuitem"
                    onClick={() => setIsDropdownOpen(false)}
                  >
                    Profil
                  </Link>
                  <button
                    onClick={() => {
                      setIsDropdownOpen(false);
                      handleSignOut();
                    }}
                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    role="menuitem"
                  >
                    Keluar
                  </button>
                </div>
              )}
            </div>
          </div>
          
          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              className="inline-flex items-center justify-center p-2 rounded-md text-blue-200 hover:text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            >
              <span className="sr-only">Open main menu</span>
              <svg
                className={`${isDropdownOpen ? 'hidden' : 'block'} h-6 w-6`}
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
              <svg
                className={`${isDropdownOpen ? 'block' : 'hidden'} h-6 w-6`}
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu, toggle based on state */}
      <div className={`${isDropdownOpen ? 'block' : 'hidden'} md:hidden`}>
        <div className="px-2 pt-2 pb-3 space-y-1">
          {navLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className={`block px-3 py-2 rounded-md text-base font-medium flex items-center ${
                isActive(link.to) ? 'bg-blue-900 text-white' : 'text-blue-100 hover:bg-blue-700'
              }`}
              onClick={() => setIsDropdownOpen(false)}
            >
              {link.icon && <link.icon className="mr-1.5 h-5 w-5" />}
              {link.label}
            </Link>
          ))}
          <Link
            to="/dashboard"
            className="block px-3 py-2 rounded-md text-base font-medium text-blue-100 hover:bg-blue-700 flex items-center"
            onClick={() => setIsDropdownOpen(false)}
          >
            <svg className="mr-1.5 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
            </svg>
            Kembali ke Aplikasi
          </Link>
          <button
            onClick={() => {
              setIsDropdownOpen(false);
              handleSignOut();
            }}
            className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-blue-100 hover:bg-blue-700"
          >
            Keluar
          </button>
        </div>
      </div>
    </nav>
  );
};

export default AdminNavbar; 