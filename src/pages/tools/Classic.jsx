import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';

const GeoGebraClassic = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const appRef = useRef(null);
  const iframeRef = useRef(null);
  
  useEffect(() => {
    // Function to load GeoGebra script
    const loadGeoGebraScript = () => {
      if (window.GGBApplet) {
        // If script is already loaded, initialize the app
        initializeGeoGebra();
        return;
      }

      // Create script tag
      const script = document.createElement('script');
      script.src = 'https://www.geogebra.org/apps/deployggb.js';
      script.async = true;
      script.onload = () => {
        initializeGeoGebra();
      };
      script.onerror = () => {
        setError('Gagal memuat GeoGebra. Silakan coba lagi nanti.');
        setIsLoading(false);
      };
      document.head.appendChild(script);
    };

    // Function to initialize GeoGebra app
    const initializeGeoGebra = () => {
      if (!window.GGBApplet) {
        setError('GeoGebra tidak tersedia. Silakan coba lagi nanti.');
        setIsLoading(false);
        return;
      }

      // Configure GeoGebra applet
      const parameters = {
        id: "ggbApplet",
        width: '100%',
        height: window.innerHeight - 150, // Adjust height based on viewport
        showMenuBar: true,
        showAlgebraInput: true,
        showToolBar: true,
        customToolBar: "0 1 2 3 4 5 6 7 8 9 10 11 | 12 13 14 15 16 17 18 19 20 21 22 23 24 25 26 27 28 29 30 31 32 33 34 35 36 37 38 39 40 41 42 43 44 45 46 47 | 48 49 50 51 52 53 54 55 56 57 58 59",
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
        showLogging: false,
        language: "id", // Set to Indonesian
        appName: "classic", // Use classic app
        perspective: "G/A", // Show both Graphics and Algebra views
        appletOnLoad: () => {
          setIsLoading(false);
        }
      };

      // Create and inject applet
      const applet = new window.GGBApplet(parameters, true);
      appRef.current = applet;
      applet.inject('geogebra-container');
    };

    // Load the GeoGebra script when the component mounts
    loadGeoGebraScript();

    // Set up window resize handler
    const handleResize = () => {
      if (iframeRef.current) {
        iframeRef.current.style.height = `${window.innerHeight - 150}px`;
      }
    };

    window.addEventListener('resize', handleResize);

    // Clean up
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

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
    if (!appRef.current) return;
    
    try {
      // Get GeoGebra base64 string
      const state = appRef.current.getBase64();
      // Create a temporary link to download the file
      const element = document.createElement('a');
      element.setAttribute('href', `data:application/vnd.geogebra.file;base64,${state}`);
      element.setAttribute('download', `geogebra_${new Date().getTime()}.ggb`);
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
            <h1 className="text-xl font-bold text-gray-800">GeoGebra Classic</h1>
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
              <p className="mt-4 text-gray-600 text-sm">Memuat GeoGebra...</p>
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

        {/* Help Text */}
        <div className="mt-4 bg-white shadow-sm rounded-lg p-4">
          <h2 className="text-lg font-medium text-gray-800 mb-2">Tentang GeoGebra Classic</h2>
          <p className="text-gray-600 text-sm mb-3">
            GeoGebra Classic adalah alat matematika interaktif yang menggabungkan geometri, aljabar, spreadsheet, grafik, statistik, dan kalkulus. 
            Anda dapat membuat konstruksi geometri, menggambar grafik fungsi, dan berinteraksi dengan materi matematika secara visual.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
            <div>
              <h3 className="font-medium text-gray-700 mb-1">Tampilan Aljabar</h3>
              <p>Masukkan persamaan dan koordinat langsung, atau tampilkan nilai-nilai dari objek geometris.</p>
            </div>
            <div>
              <h3 className="font-medium text-gray-700 mb-1">Tampilan Grafik</h3>
              <p>Buat dan manipulasi konstruksi geometri seperti titik, garis, lingkaran, dan poligon.</p>
            </div>
            <div>
              <h3 className="font-medium text-gray-700 mb-1">Spreadsheet & CAS</h3>
              <p>Gunakan tampilan spreadsheet dan Sistem Aljabar Komputer (CAS) untuk perhitungan simbolik.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GeoGebraClassic; 