import React, { lazy, Suspense, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute';
import Navbar from './components/Navbar';
import Loading from './components/Loading';
import PageTransition from './components/PageTransition';
import LottieAnimation from './components/LottieAnimation';
import { loadingAnimation } from './animations/mathAnimations';
import TestPage from './pages/TestPage';
import ErrorBoundary from './components/ErrorBoundary';

// Lazy loading para todos los componentes de página
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Materi = lazy(() => import('./pages/Materi'));
const MateriTopic = lazy(() => import('./pages/MateriTopic'));
const Soal = lazy(() => import('./pages/Soal'));
const SoalTopic = lazy(() => import('./pages/SoalTopic'));
const Leaderboard = lazy(() => import('./pages/Leaderboard'));
const Onboarding = lazy(() => import('./pages/Onboarding'));
const Flashcard = lazy(() => import('./pages/Flashcard'));
const FlashcardTopic = lazy(() => import('./pages/FlashcardTopic'));
const Activity = lazy(() => import('./pages/Activity'));
const Profile = lazy(() => import('./pages/Profile'));
const Login = lazy(() => import('./pages/Login'));
const Register = lazy(() => import('./pages/Register'));
const NotFound = lazy(() => import('./pages/NotFound'));

// GeoGebra Tools
const GeoGebraClassic = lazy(() => import('./pages/tools/Classic'));
const GraphCalculator = lazy(() => import('./pages/tools/Calculator'));
const GeometryApp = lazy(() => import('./pages/tools/Geometry'));

// Componente de carga optimizado
const OptimizedLoading = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="w-32 h-32">
      <LottieAnimation animationData={loadingAnimation} />
    </div>
  </div>
);

// HomeRedirect component to handle root path routing
const HomeRedirect = () => {
  const token = localStorage.getItem('token');
  return token ? <Navigate to="/dashboard" replace /> : <Navigate to="/login" replace />;
};

function App() {
  // Precarga de componentes críticos en producción
  useEffect(() => {
    // Precarga de páginas principales para mejorar la UX
    if (process.env.NODE_ENV === 'production') {
      const preloadComponents = async () => {
        try {
          // Precargar componentes más usados
          await Promise.all([
            import('./pages/Dashboard'),
            import('./pages/Login')
          ]);
        } catch (err) {
          console.error('Error al precargar componentes:', err);
        }
      };
      
      // Precargar después de que la aplicación haya cargado
      window.requestIdleCallback ? 
        window.requestIdleCallback(preloadComponents) : 
        setTimeout(preloadComponents, 200);
    }
  }, []);

  return (
    <Router>
      <Navbar />
      <Suspense fallback={<OptimizedLoading />}>
        <PageTransition transitionType="fade" duration={300}>
          <Routes>
            {/* Test Route (public) */}
            <Route path="/test" element={<TestPage />} />
          
            {/* Protected Routes */}
            <Route path="/dashboard" element={
              <ProtectedRoute>
                <ErrorBoundary>
                  <Dashboard />
                </ErrorBoundary>
              </ProtectedRoute>
            } />
            <Route path="/materi" element={<ProtectedRoute><Materi /></ProtectedRoute>} />
            <Route path="/materi/:category/:topic" element={<ProtectedRoute><MateriTopic /></ProtectedRoute>} />
            <Route path="/soal" element={<ProtectedRoute><Soal /></ProtectedRoute>} />
            <Route path="/soal/:category/:topic" element={<ProtectedRoute><SoalTopic /></ProtectedRoute>} />
            <Route path="/leaderboard" element={<ProtectedRoute><Leaderboard /></ProtectedRoute>} />
            <Route path="/onboarding" element={<ProtectedRoute><Onboarding /></ProtectedRoute>} />
            <Route path="/flashcard" element={<ProtectedRoute><Flashcard /></ProtectedRoute>} />
            <Route path="/flashcard/:category/:topic" element={<ProtectedRoute><FlashcardTopic /></ProtectedRoute>} />
            <Route path="/aktivitas" element={<ProtectedRoute><Activity /></ProtectedRoute>} />
            <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
            
            {/* GeoGebra Tools Routes */}
            <Route path="/tools/classic" element={<ProtectedRoute><GeoGebraClassic /></ProtectedRoute>} />
            <Route path="/tools/calculator" element={<ProtectedRoute><GraphCalculator /></ProtectedRoute>} />
            <Route path="/tools/geometry" element={<ProtectedRoute><GeometryApp /></ProtectedRoute>} />
            
            {/* Public Routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/" element={<HomeRedirect />} />
            
            {/* 404 Route */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </PageTransition>
      </Suspense>
    </Router>
  );
}

export default App;
