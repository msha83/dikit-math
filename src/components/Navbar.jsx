import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [scrolled, setScrolled] = useState(false);
  const [showGeoGebraMenu, setShowGeoGebraMenu] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  
  const isActive = (path) => location.pathname === path;

  // Check login status on render and location changes
  useEffect(() => {
    const checkLoginStatus = () => {
      const loggedInUser = localStorage.getItem('user');
      
      if (loggedInUser) {
        try {
          const foundUser = JSON.parse(loggedInUser);
          setUser(foundUser);
        } catch (e) {
          // Invalid user data
          localStorage.removeItem('user');
          localStorage.removeItem('token');
          setUser(null);
        }
      } else {
        setUser(null);
      }
    };
    
    checkLoginStatus();
  }, [location.pathname]); // Re-check when path changes
  
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
  
  // Close GeoGebra menu when user clicks outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showGeoGebraMenu && !event.target.closest('.geogebra-menu-container')) {
        setShowGeoGebraMenu(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showGeoGebraMenu]);
  
  const handleLogout = () => {
    // Clear user data from localStorage
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    navigate('/');
  };
  
  // Function to get user's display name
  const getUserDisplayName = () => {
    if (!user) return '';
    
    // If user has a name property, use it
    if (user.name) {
      // For display in navbar, use only first name if full name is available
      if (user.name.includes(' ')) {
        return user.name.split(' ')[0]; // Use first name only
      } else {
        return user.name; // Use the only name available
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
    { path: '/soal', label: 'Latihan Soal' },
    { path: '/flashcard', label: 'Flashcard' },
    { path: '/leaderboard', label: 'Leaderboard' },
  ];
  
  // Choose navigation links based on login status
  const navLinks = user ? authLinks : publicLinks;
  
  // GeoGebra tool options
  const geoGebraTools = [
    { path: '/tools/calculator', label: 'Kalkulator Grafik', icon: 'graph-line' },
    { path: '/tools/geometry', label: 'Geometri', icon: 'shape-polygon' },
    { path: '/tools/algebra', label: 'Aljabar', icon: 'function' },
    { path: '/tools/3d', label: 'Kalkulator 3D', icon: 'cube' },
    { path: '/tools/cas', label: 'CAS', icon: 'sigma' },
    { path: '/tools/probability', label: 'Probabilitas', icon: 'chart-pie' },
  ];

  return (
    <nav 
      className={`fixed top-0 left-0 right-0 z-50 bg-white transition-all duration-300 will-change-transform ${
        scrolled ? 'shadow-md' : 'shadow-sm'
      }`}
      style={{ 
        transform: `translateY(0)`,
        backdropFilter: scrolled ? 'blur(8px)' : 'none',
        backgroundColor: scrolled ? 'rgba(255, 255, 255, 0.9)' : 'rgba(255, 255, 255, 1)'
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <Link to="/" className="flex items-center gap-2 transition-transform duration-300 hover:scale-105">
                <div className="w-8 h-8 bg-blue-600 rounded-md flex items-center justify-center will-change-transform">
                  <span className="text-white font-bold">M</span>
                </div>
                <span className="text-blue-800 font-bold text-xl">MathEdu</span>
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
              
              {/* GeoGebra Classic Dropdown */}
              {user && (
                <div className="relative geogebra-menu-container">
                  <button
                    onClick={() => setShowGeoGebraMenu(!showGeoGebraMenu)}
                    className={`${
                      showGeoGebraMenu
                        ? 'border-blue-500 text-gray-900'
                        : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                    } inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-all duration-200`}
                  >
                    <span className="mr-1">GeoGebra</span>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                    </svg>
                  </button>
                  
                  {/* Dropdown Menu */}
                  {showGeoGebraMenu && (
                    <div className="absolute left-0 mt-2 w-60 bg-white shadow-lg rounded-md ring-1 ring-black ring-opacity-5 overflow-hidden z-50 animate-fade-in">
                      <div className="py-1">
                        <div className="px-4 py-2 text-xs font-semibold text-gray-500 border-b">
                          GEOGEBRA TOOLS
                        </div>
                        {geoGebraTools.map((tool) => (
                          <Link
                            key={tool.path}
                            to={tool.path}
                            className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-700 transition-colors duration-150"
                            onClick={() => setShowGeoGebraMenu(false)}
                          >
                            <span className={`mr-3 w-5 h-5 flex-shrink-0 flex items-center justify-center`}>
                              {tool.icon === 'graph-line' && (
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4v16"></path>
                                </svg>
                              )}
                              {tool.icon === 'shape-polygon' && (
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"></path>
                                </svg>
                              )}
                              {tool.icon === 'function' && (
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.871 4A17.926 17.926 0 003 12c0 2.874.673 5.59 1.871 8m14.13 0a17.926 17.926 0 001.87-8c0-2.874-.673-5.59-1.87-8M9 9h1.246a1 1 0 01.961.725l1.586 5.55a1 1 0 00.961.725H15m1-7h-.08a2 2 0 00-1.519.698L9.6 15.302A2 2 0 018.08 16H8"></path>
                                </svg>
                              )}
                              {tool.icon === 'cube' && (
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"></path>
                                </svg>
                              )}
                              {tool.icon === 'sigma' && (
                                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                  <path d="M5 4H19L12 12V20H19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                </svg>
                              )}
                              {tool.icon === 'chart-pie' && (
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z"></path>
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z"></path>
                                </svg>
                              )}
                            </span>
                            {tool.label}
                          </Link>
                        ))}
                        <div className="border-t border-gray-100">
                          <Link
                            to="/tools/classic"
                            className="block px-4 py-2 text-sm text-center font-medium text-blue-600 hover:bg-blue-50 transition-colors duration-150"
                            onClick={() => setShowGeoGebraMenu(false)}
                          >
                            Buka GeoGebra Classic
                          </Link>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
          <div className="hidden sm:ml-6 sm:flex sm:items-center">
            <div className="flex space-x-4 animate-fade-in" style={{ animationDelay: '150ms' }}>
              {user ? (
                <div className="flex items-center gap-4">
                  <Link to="/profile" className="text-gray-700 hover:text-gray-900 transition-all duration-200 hover:scale-105">
                    <div className="flex items-center gap-2">
                      {user.avatarUrl ? (
                        <img 
                          src={user.avatarUrl} 
                          alt="Profile" 
                          className="w-8 h-8 rounded-full border border-gray-300"
                        />
                      ) : (
                        <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center will-change-transform">
                          <span className="text-sm font-medium">{getUserDisplayName().charAt(0).toUpperCase()}</span>
                        </div>
                      )}
                      <span className="font-medium">{getUserDisplayName()}</span>
                    </div>
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="bg-red-600 text-white hover:bg-red-700 px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 hover:shadow-md"
                  >
                    Logout
                  </button>
                </div>
              ) : (
                <>
                  <Link
                    to="/login"
                    className="text-gray-700 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 hover:bg-gray-50"
                  >
                    Login
                  </Link>
                  <Link
                    to="/register"
                    className="bg-blue-600 text-white hover:bg-blue-700 px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 hover:shadow-md"
                  >
                    Register
                  </Link>
                </>
              )}
            </div>
          </div>
          <div className="-mr-2 flex items-center sm:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500 transition-colors duration-200"
            >
              <span className="sr-only">Open main menu</span>
              {!isOpen ? (
                <svg className="block h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              ) : (
                <svg className="block h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      <div 
        className={`sm:hidden transition-all duration-300 overflow-hidden will-change-transform ${
          isOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        <div className="pt-2 pb-3 space-y-1">
          {navLinks.map((link, index) => (
            <Link
              key={link.path}
              to={link.path}
              className={`${
                isActive(link.path)
                  ? 'bg-blue-50 border-blue-500 text-blue-700'
                  : 'border-transparent text-gray-500 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-700'
              } block pl-3 pr-4 py-2 border-l-4 text-base font-medium transition-all duration-200 animate-fade-in`}
              style={{ animationDelay: `${index * 50}ms` }}
              onClick={() => setIsOpen(false)}
            >
              {link.label}
            </Link>
          ))}
          
          {/* Mobile GeoGebra Menu */}
          {user && (
            <div className="border-l-4 border-transparent">
              <div
                className="pl-3 pr-4 py-2 text-base font-medium text-gray-500 block"
                onClick={(e) => {
                  e.preventDefault();
                  setShowGeoGebraMenu(!showGeoGebraMenu);
                }}
              >
                <div className="flex justify-between items-center">
                  <span>GeoGebra</span>
                  <svg 
                    className={`w-4 h-4 transition-transform duration-200 ${showGeoGebraMenu ? 'transform rotate-180' : ''}`}
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24" 
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                  </svg>
                </div>
              </div>
              
              {showGeoGebraMenu && (
                <div className="ml-4 pl-3 border-l border-gray-200 animate-fade-in">
                  {geoGebraTools.map((tool) => (
                    <Link
                      key={tool.path}
                      to={tool.path}
                      className="py-2 pl-3 pr-4 block text-sm text-gray-600 hover:text-blue-600 transition-colors duration-150"
                      onClick={() => {
                        setShowGeoGebraMenu(false);
                        setIsOpen(false);
                      }}
                    >
                      {tool.label}
                    </Link>
                  ))}
                  <Link
                    to="/tools/classic"
                    className="py-2 pl-3 pr-4 block text-sm font-medium text-blue-600 hover:text-blue-800 transition-colors duration-150"
                    onClick={() => {
                      setShowGeoGebraMenu(false);
                      setIsOpen(false);
                    }}
                  >
                    Buka GeoGebra Classic
                  </Link>
                </div>
              )}
            </div>
          )}
          
          <div className="mt-4 flex flex-col space-y-2 px-3">
            {user ? (
              <>
                <Link 
                  to="/profile"
                  className="text-center text-gray-700 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium border border-gray-300 transition-all duration-200 hover:bg-gray-50 animate-fade-in"
                  style={{ animationDelay: '200ms' }}
                  onClick={() => setIsOpen(false)}
                >
                  Profil Saya
                </Link>
                <button
                  onClick={() => {
                    handleLogout();
                    setIsOpen(false);
                  }}
                  className="text-center bg-red-600 text-white hover:bg-red-700 px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 hover:shadow-md animate-fade-in"
                  style={{ animationDelay: '250ms' }}
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="text-center text-gray-700 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium border border-gray-300 transition-all duration-200 hover:bg-gray-50 animate-fade-in"
                  style={{ animationDelay: '200ms' }}
                  onClick={() => setIsOpen(false)}
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="text-center bg-blue-600 text-white hover:bg-blue-700 px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 hover:shadow-md animate-fade-in"
                  style={{ animationDelay: '250ms' }}
                  onClick={() => setIsOpen(false)}
                >
                  Register
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
