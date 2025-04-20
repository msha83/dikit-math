import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';

const GeometryApp = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const appRef = useRef(null);
  const iframeRef = useRef(null);
  
  useEffect(() => {
    console.log('Geometry component mounted');
    // Function to load GeoGebra script
    const loadGeoGebraScript = () => {
      if (window.GGBApplet) {
        console.log('GeoGebra script already loaded');
        // If script is already loaded, initialize the app
        initializeGeoGebra();
        return;
      }

      console.log('Loading GeoGebra script');
      // Create script tag
      const script = document.createElement('script');
      script.src = 'https://www.geogebra.org/apps/deployggb.js';
      script.async = true;
      script.onload = () => {
        console.log('GeoGebra script loaded successfully');
        initializeGeoGebra();
      };
      script.onerror = (e) => {
        console.error('Failed to load GeoGebra script:', e);
        setError('Gagal memuat Geometri. Silakan coba lagi nanti.');
        setIsLoading(false);
      };
      document.head.appendChild(script);
    };

    // Function to initialize GeoGebra app
    const initializeGeoGebra = () => {
      if (!window.GGBApplet) {
        console.error('GeoGebra not available after script load');
        setError('GeoGebra tidak tersedia. Silakan coba lagi nanti.');
        setIsLoading(false);
        return;
      }

      try {
        console.log('Configuring GeoGebra parameters');
        // Configure GeoGebra applet specifically for Geometry
        const parameters = {
          id: "ggbApplet",
          width: '100%',
          height: window.innerHeight - 150, // Adjust height based on viewport
          showMenuBar: false,
          showAlgebraInput: true,
          showToolBar: true,
          showToolBarHelp: true,
          showResetIcon: true,
          enableLabelDrags: true,
          enableShiftDragZoom: true,
          enableRightClick: true,
          showZoomButtons: true,
          errorDialogsActive: true,
          useBrowserForJS: true,
          allowStyleBar: true,
          preventFocus: false,
          showLogging: true, // Enable logging for debugging
          language: "id", // Set to Indonesian
          appName: "geometry", // Use geometry app
          perspective: "G", // Show Graphics view
          appletOnLoad: () => {
            console.log('GeoGebra applet loaded and initialized');
            setIsLoading(false);
          }
        };

        console.log('Creating GeoGebra applet');
        // Create and inject applet with a small delay to ensure DOM is ready
        const applet = new window.GGBApplet(parameters, true);
        appRef.current = applet;
        
        // Small delay to ensure container is properly rendered
        setTimeout(() => {
          const container = document.getElementById('geogebra-container');
          if (container) {
            console.log('Injecting GeoGebra into container');
            applet.inject('geogebra-container');
          } else {
            console.error('GeoGebra container not found in DOM');
            setError('Container tidak ditemukan. Silakan muat ulang halaman.');
            setIsLoading(false);
          }
        }, 200);
      } catch (err) {
        console.error('Error initializing GeoGebra:', err);
        setError(`Gagal menginisialisasi GeoGebra: ${err.message}`);
        setIsLoading(false);
      }
    };

    // Load the GeoGebra script when the component mounts
    loadGeoGebraScript();

    // Set up window resize handler
    const handleResize = () => {
      console.log('Window resize detected');
      if (iframeRef.current) {
        iframeRef.current.style.height = `${window.innerHeight - 150}px`;
      }
      
      // Also update the applet size if it's already initialized
      if (window.ggbApplet && typeof window.ggbApplet.setSize === 'function') {
        try {
          window.ggbApplet.setSize(window.innerWidth, window.innerHeight - 150);
        } catch (e) {
          console.warn('Error resizing GeoGebra:', e);
        }
      }
    };

    window.addEventListener('resize', handleResize);

    // Clean up
    return () => {
      console.log('Geometry component unmounting');
      window.removeEventListener('resize', handleResize);
      // Clean up GeoGebra applet
      if (window.ggbApplet) {
        try {
          // Attempt clean removal of applet
          const container = document.getElementById('geogebra-container');
          if (container) {
            container.innerHTML = '';
          }
        } catch (e) {
          console.warn('Error cleaning up GeoGebra:', e);
        }
      }
    };
  }, []); // Empty dependency array so the effect runs only once

  // Handle fullscreen mode
  const toggleFullscreen = () => {
    const container = document.getElementById('geogebra-container');
    if (!container) return;

    if (!document.fullscreenElement) {
      if (container.requestFullscreen) {
        container.requestFullscreen();
      } else if (container.webkitRequestFullscreen) { /* Safari */
        container.webkitRequestFullscreen();
      } else if (container.msRequestFullscreen) { /* IE11 */
        container.msRequestFullscreen();
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      } else if (document.webkitExitFullscreen) { /* Safari */
        document.webkitExitFullscreen();
      } else if (document.msExitFullscreen) { /* IE11 */
        document.msExitFullscreen();
      }
    }
  };

  // Save current state
  const saveState = () => {
    if (!window.ggbApplet) {
      console.error('Cannot save: GeoGebra applet not initialized');
      alert('Tidak dapat menyimpan: Applet belum siap.');
      return;
    }
    
    try {
      // Get GeoGebra base64 string
      const state = window.ggbApplet.getBase64();
      // Create a temporary link to download the file
      const element = document.createElement('a');
      element.setAttribute('href', `data:application/vnd.geogebra.file;base64,${state}`);
      element.setAttribute('download', `geometry_${new Date().getTime()}.ggb`);
      element.style.display = 'none';
      document.body.appendChild(element);
      element.click();
      document.body.removeChild(element);
    } catch (e) {
      console.error('Error saving GeoGebra state:', e);
      alert('Gagal menyimpan file. Silakan coba lagi.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Top Bar */}
        <div className="bg-white shadow-sm rounded-t-lg p-4 flex flex-col sm:flex-row justify-between items-center">
          <div className="flex items-center mb-4 sm:mb-0">
            <Link to="/dashboard" className="text-blue-600 hover:text-blue-700 mr-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M9.707 14.707a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 1.414L7.414 9H15a1 1 0 110 2H7.414l2.293 2.293a1 1 0 010 1.414z" clipRule="evenodd" />
              </svg>
            </Link>
            <h1 className="text-xl font-bold text-gray-800">Geometri</h1>
          </div>

          <div className="flex space-x-3">
            <button 
              onClick={toggleFullscreen}
              className="px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-md text-sm font-medium transition-colors duration-150 flex items-center"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M3 4a1 1 0 011-1h4a1 1 0 010 2H6.414l2.293 2.293a1 1 0 01-1.414 1.414L5 6.414V8a1 1 0 01-2 0V4zm9 1a1 1 0 010-2h4a1 1 0 011 1v4a1 1 0 01-2 0V6.414l-2.293 2.293a1 1 0 11-1.414-1.414L13.586 5H12zm-9 7a1 1 0 012 0v1.586l2.293-2.293a1 1 0 011.414 1.414L6.414 15H8a1 1 0 010 2H4a1 1 0 01-1-1v-4zm13-1a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 010-2h1.586l-2.293-2.293a1 1 0 011.414-1.414L15 13.586V12a1 1 0 011-1z" clipRule="evenodd" />
              </svg>
              Layar Penuh
            </button>
            <button 
              onClick={saveState}
              className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-sm font-medium transition-colors duration-150 flex items-center"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
              Simpan
            </button>
          </div>
        </div>

        {/* GeoGebra Container */}
        <div 
          id="geogebra-container" 
          className="bg-white border border-gray-200 rounded-b-lg relative overflow-hidden"
          style={{ minHeight: '500px' }}
          ref={iframeRef}
        >
          {isLoading && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-white">
              <div className="w-16 h-16 border-t-4 border-b-4 border-blue-500 rounded-full animate-spin"></div>
              <p className="mt-4 text-gray-600 text-sm">Memuat Geometri...</p>
            </div>
          )}
          
          {error && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-white p-6 text-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-red-500 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Terjadi Kesalahan</h3>
              <p className="text-gray-600 mb-4">{error}</p>
              <button
                onClick={() => window.location.reload()}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors duration-150"
              >
                Coba Lagi
              </button>
            </div>
          )}
        </div>

        {/* Tips */}
        <div className="mt-4 bg-white shadow-sm rounded-lg p-4">
          <h2 className="text-lg font-medium text-gray-800 mb-2">Tips Geometri</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
            <div>
              <h3 className="font-medium text-gray-700 mb-1">Peralatan Dasar</h3>
              <ul className="list-disc list-inside space-y-1">
                <li>Titik - Membuat titik pada bidang</li>
                <li>Garis - Menggambar garis dan segmen</li>
                <li>Poligon - Membuat bentuk dengan beberapa sisi</li>
                <li>Lingkaran & Busur - Membuat lingkaran dan busur</li>
              </ul>
            </div>
            <div>
              <h3 className="font-medium text-gray-700 mb-1">Transformasi</h3>
              <ul className="list-disc list-inside space-y-1">
                <li>Refleksi - Mencerminkan objek</li>
                <li>Rotasi - Memutar objek</li>
                <li>Translasi - Menggeser objek</li>
                <li>Dilatasi - Memperbesar/memperkecil objek</li>
              </ul>
            </div>
          </div>
          
          <div className="mt-4 bg-blue-50 p-3 rounded-md border border-blue-100">
            <p className="text-sm text-blue-700">
              <strong>Tip:</strong> Gunakan perintah sudut untuk mengukur sudut antara dua garis, dan perintah jarak untuk mengukur jarak antara dua titik.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GeometryApp; 