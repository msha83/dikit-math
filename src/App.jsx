import React, { lazy, Suspense, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate, useLocation } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute';
import Navbar from './components/Navbar';
import AdminNavbar from './components/AdminNavbar';
import Loading from './components/Loading';
import PageTransition from './components/PageTransition';
import LottieAnimation from './components/LottieAnimation';
import { loadingAnimation } from './animations/mathAnimations';
import ErrorBoundary from './components/ErrorBoundary';
import OptimizedLoading from './components/OptimizedLoading';
import LoadingSpinner from './components/LoadingSpinner';

// Direct import for Flashcard components - no lazy loading for these
import Flashcard from './pages/Flashcard';
import FlashcardTopic from './pages/FlashcardTopic';
import DirectFlashcard from './pages/DirectFlashcard';

// Import AuthProvider
import { AuthProvider, useAuth } from './context/AuthContext';

// Lazy loading para todos los componentes de página
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Materi = lazy(() => import('./pages/Materi'));
const MateriTopic = lazy(() => import('./pages/MateriTopic'));
const MaterialDetailPage = lazy(() => import('./pages/MaterialDetailPage'));
const Materials = lazy(() => import('./pages/Materials'));
const Soal = lazy(() => import('./pages/Soal'));
const SoalTopic = lazy(() => import('./pages/SoalTopic'));
const Leaderboard = lazy(() => import('./pages/Leaderboard'));
const Onboarding = lazy(() => import('./pages/Onboarding'));
const Activity = lazy(() => import('./pages/Activity'));
const Profile = lazy(() => import('./pages/Profile'));
const Login = lazy(() => import('./pages/Login'));
const Register = lazy(() => import('./pages/Register'));
const NotFound = lazy(() => import('./pages/NotFound'));
const ForgotPassword = lazy(() => import('./pages/ForgotPassword'));
const ResetPassword = lazy(() => import('./pages/ResetPassword'));
const AdminDashboard = lazy(() => import("./pages/admin/Dashboard"));
const AdminMaterials = lazy(() => import("./pages/admin/Materials"));
const AdminUsers = lazy(() => import("./pages/admin/Users"));
const AdminFlashcards = lazy(() => import("./pages/admin/flashcards"));
const AdminFlashcardForm = lazy(() => import("./pages/admin/flashcard-form"));
const MaterialForm = lazy(() => import("./pages/admin/materials/MaterialForm"));
const CategoryManager = lazy(() => import("./pages/admin/materials/CategoryManager"));
const QuizList = lazy(() => import('./pages/admin/quizzes/QuizList'));
const QuizForm = lazy(() => import('./pages/admin/quizzes/QuizForm'));
const AdminTools = lazy(() => import('./pages/admin/AdminTools'));

// HomeRedirect component to handle root path routing
const HomeRedirect = () => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return <OptimizedLoading />;
  }
  
  return user ? <Navigate to="/dashboard" replace /> : <Navigate to="/login" replace />;
};

// Custom Navbar selector component
const CustomNavbar = () => {
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith('/admin');
  
  return isAdminRoute ? <AdminNavbar /> : <Navbar />;
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
    <AuthProvider>
      <Router>
        <CustomNavbar />
        <div className="min-h-screen bg-gray-50 pt-20">
          <ErrorBoundary>
            <Suspense fallback={<OptimizedLoading />}>
              <PageTransition>
                <Routes>
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
                  <Route path="/materials" element={<ProtectedRoute><Materials /></ProtectedRoute>} />
                  <Route path="/material/:slug" element={<ProtectedRoute><MaterialDetailPage /></ProtectedRoute>} />
                  <Route path="/soal" element={<ProtectedRoute><Soal /></ProtectedRoute>} />
                  <Route path="/soal/:category/:topic" element={<ProtectedRoute><SoalTopic /></ProtectedRoute>} />
                  <Route path="/leaderboard" element={<ProtectedRoute><Leaderboard /></ProtectedRoute>} />
                  
                  {/* Flashcard routes - using directly imported components */}
                  <Route path="/flashcard" element={
                    <ProtectedRoute>
                      <ErrorBoundary>
                        <Flashcard />
                      </ErrorBoundary>
                    </ProtectedRoute>
                  } />
                  <Route path="/flashcard/:category/:topic" element={
                    <ProtectedRoute>
                      <ErrorBoundary>
                        <FlashcardTopic />
                      </ErrorBoundary>
                    </ProtectedRoute>
                  } />
                  
                  {/* Direct flashcard route */}
                  <Route path="/direktflashcard" element={
                    <ProtectedRoute>
                      <ErrorBoundary>
                        <DirectFlashcard />
                      </ErrorBoundary>
                    </ProtectedRoute>
                  } />
                  
                  <Route path="/aktivitas" element={<ProtectedRoute><Activity /></ProtectedRoute>} />
                  <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
                  
                  
                  {/* Public Routes */}
                  <Route path="/" element={<HomeRedirect />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/register" element={<Register />} />
                  <Route path="/forgot-password" element={<ForgotPassword />} />
                  <Route path="/reset-password" element={<ResetPassword />} />
                  <Route path="/onboarding" element={<Onboarding />} />
      
                  
                  
                  {/* 404 Route */}
                  <Route path="*" element={<NotFound />} />
                   {/* Rute Admin */}
                   <Route path="/admin" element={<ProtectedRoute><AdminDashboard /></ProtectedRoute>} />
                   <Route path="/admin/materials" element={<ProtectedRoute><AdminMaterials /></ProtectedRoute>} />
                   <Route path="/admin/materials/new" element={<ProtectedRoute><MaterialForm /></ProtectedRoute>} />
                   <Route path="/admin/materials/edit/:id" element={<ProtectedRoute><MaterialForm /></ProtectedRoute>} />
                   <Route path="/admin/materials/categories" element={<ProtectedRoute><CategoryManager /></ProtectedRoute>} />
                   <Route path="/admin/users" element={<ProtectedRoute><AdminUsers /></ProtectedRoute>} />
                   <Route path="/admin/flashcards" element={<ProtectedRoute><AdminFlashcards /></ProtectedRoute>} />
                   <Route path="/admin/flashcard-form" element={<ProtectedRoute><AdminFlashcardForm /></ProtectedRoute>} />
                   <Route path="/admin/quizzes" element={<ProtectedRoute><QuizList /></ProtectedRoute>} />
                   <Route path="/admin/quizzes/new" element={<ProtectedRoute><QuizForm /></ProtectedRoute>} />
                   <Route path="/admin/quizzes/edit/:id" element={<ProtectedRoute><QuizForm /></ProtectedRoute>} />
                   <Route path="/admin/tools" element={<ProtectedRoute><AdminTools /></ProtectedRoute>} />
                </Routes>
              </PageTransition>
            </Suspense>
          </ErrorBoundary>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
