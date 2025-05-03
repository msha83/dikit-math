import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext'; // Impor useAuth dari AuthContext

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  // Gunakan user dari AuthContext, bukan useState lokal
  const { user, signOut } = useAuth();
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  
  const isActive = (path) => location.pathname === path;

  // Effect to add class when scrolling
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };
    
    // Add effect only in client browsers
    if (typeof window !== 'undefined') {
      window.addEventListener('scroll', handleScroll);
      
      // Clean up event when component unmounts
      return () => {
        window.removeEventListener('scroll', handleScroll);
      };
    }
  }, []);
  
  const handleLogout = async () => {
    try {
      await signOut(); // Gunakan signOut dari AuthContext
      navigate('/');
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };
  
  // Function to get user's display name
  const getUserDisplayName = () => {
    if (!user) return '';
    
    // Jika user.user_metadata dan user.user_metadata.name ada, gunakan itu
    if (user.user_metadata?.name) {
      // For display in navbar, use only first name if full name is available
      if (user.user_metadata.name.includes(' ')) {
        return user.user_metadata.name.split(' ')[0]; // Use first name only
      } else {
        return user.user_metadata.name; // Use the only name available
      }
    }
    
    // Fallback to email without domain if no name is available
    if (user.email) {
      return user.email.split('@')[0];
    }
    
    return '';
  };
  
  // Navigation links for dashboard/landing page
  const publicLinks = [
    { path: '/', label: 'Beranda' },
    { path: '/login', label: 'Login' },
    { path: '/register', label: 'Register' },
  ];
  
  // Navigation links for logged in users
  const authLinks = [
    { path: '/dashboard', label: 'Dashboard' },
    { path: '/materi', label: 'Materi' },
    { path: '/materials', label: 'Konten Matematika' },
    { path: '/soal', label: 'Latihan Soal' },
    { path: '/flashcard', label: 'Flashcard' },
    { path: '/leaderboard', label: 'Leaderboard' },
  ];
  
  // Choose navigation links based on login status
  const navLinks = user ? authLinks : publicLinks;

  return (
    <nav 
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 will-change-transform ${
        scrolled ? 'shadow-lg' : 'shadow-sm'
      } mx-4 mt-2`}
      style={{ 
        transform: `translateY(0)`,
        backdropFilter: scrolled ? 'blur(8px)' : 'none',
        backgroundColor: scrolled ? 'rgba(255, 255, 255, 0.9)' : 'rgba(255, 255, 255, 0.95)',
        borderRadius: '1.5rem'
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-14">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <Link to="/" className="flex items-center gap-2 transition-transform duration-300 hover:scale-105">
                <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center will-change-transform">
                  <span className="text-white font-bold">M</span>
                </div>
                <span className="text-blue-800 font-bold text-xl">MathMax</span>
              </Link>
            </div>
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
              {navLinks.map((link, index) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`${
                    isActive(link.path)
                      ? 'border-blue-500 text-gray-900'
                      : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                  } inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-all duration-200 animate-fade-in`}
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
          
          {/* Right side of navbar */}
          <div className="flex items-center">
            {user ? (
              <div className="ml-3 relative">
                <div className="flex items-center space-x-4">
                  {/* Profile dropdown */}
                  <div className="relative">
                    <button
                      onClick={() => setIsOpen(!isOpen)}
                      className="max-w-xs flex items-center text-sm rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                      id="user-menu"
                      aria-expanded="false"
                      aria-haspopup="true"
                    >
                      <span className="sr-only">Open user menu</span>
                      <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-semibold">
                        {getUserDisplayName().charAt(0).toUpperCase()}
                      </div>
                    </button>
                    
                    {/* Dropdown menu */}
                    {isOpen && (
                      <div
                        className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg py-1 bg-white ring-1 ring-black ring-opacity-5 focus:outline-none z-50 animate-fade-in"
                        role="menu"
                        aria-orientation="vertical"
                        aria-labelledby="user-menu"
                      >
                        <div className="px-4 py-2 text-xs text-gray-500 border-b">
                          Masuk sebagai <span className="font-semibold">{getUserDisplayName()}</span>
                        </div>
                        <Link
                          to="/profile"
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          role="menuitem"
                          onClick={() => setIsOpen(false)}
                        >
                          Profil Saya
                        </Link>
                        <Link
                          to="/aktivitas"
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          role="menuitem"
                          onClick={() => setIsOpen(false)}
                        >
                          Aktivitas Saya
                        </Link>
                        <button
                          onClick={() => {
                            setIsOpen(false);
                            handleLogout();
                          }}
                          className="w-full text-left block px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                          role="menuitem"
                        >
                          Logout
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Link
                  to="/login"
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-blue-600 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200"
                >
                  Register
                </Link>
              </div>
            )}
            
            {/* Mobile menu button */}
            <div className="flex items-center sm:hidden ml-3">
              <button
                onClick={() => setIsOpen(!isOpen)}
                className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500"
                aria-expanded="false"
              >
                <span className="sr-only">Open main menu</span>
                {isOpen ? (
                  <svg
                    className="block h-6 w-6"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                ) : (
                  <svg
                    className="block h-6 w-6"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M4 6h16M4 12h16M4 18h16"
                    />
                  </svg>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Mobile menu, show/hide based on menu state */}
      {isOpen && (
        <div className="sm:hidden">
          <div className="pt-2 pb-3 space-y-1">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`${
                  isActive(link.path)
                    ? 'bg-indigo-50 border-blue-500 text-blue-700'
                    : 'border-transparent text-gray-500 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-700'
                } block pl-3 pr-4 py-2 border-l-4 text-base font-medium transition-all duration-200`}
                onClick={() => setIsOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            
            {user && (
              <button
                onClick={() => {
                  setIsOpen(false);
                  handleLogout();
                }}
                className="w-full text-left border-transparent text-red-500 hover:bg-gray-50 hover:border-red-300 hover:text-red-700 block pl-3 pr-4 py-2 border-l-4 text-base font-medium transition-all duration-200"
              >
                Logout
              </button>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
