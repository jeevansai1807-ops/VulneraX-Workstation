import React from 'react';
import { BrowserRouter, Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import Topbar from './components/Topbar';
import Dashboard from './pages/Dashboard';
import History from './pages/History';
import Websites from './pages/Websites';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import Contact from './pages/Contact';
import Users from './pages/Users';
import Settings from './pages/Settings';
import Landing from './pages/Landing';
import { AuthProvider, useAuth } from './lib/AuthContext';
import { ThemeProvider } from './components/ThemeProvider';

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return (
    <div className="h-screen w-screen flex flex-col items-center justify-center bg-background text-foreground gap-4">
      <div className="w-12 h-12 rounded-full border-4 border-rose-500/20 border-t-rose-500 animate-spin" />
      <span className="font-mono text-xs text-rose-400 tracking-widest uppercase">Connecting to VulneraX Sentinel...</span>
    </div>
  );
  if (!user) return <Navigate to="/login" />;
  return children;
}

function MainLayout() {
  const location = useLocation();
  
  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-transparent relative">
      <Topbar />
      <div className="flex-1 overflow-hidden relative z-10">
        <main className="h-full w-full overflow-auto flex flex-col relative px-4 md:px-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
              className="w-full min-h-full flex-1 flex flex-col max-w-7xl mx-auto pt-20 pb-20"
            >
              <Routes location={location}>
                <Route path="/" element={<Landing />} />
                <Route path="/scanner" element={<Dashboard />} />
                <Route path="/database" element={<History />} />
                <Route path="/settings" element={<Settings />} />
                <Route path="/websites" element={<Websites />} />
                <Route path="/history" element={<History />} />
                <Route path="/contact" element={<Contact />} />
                <Route path="/users" element={<Users />} />
                <Route path="*" element={<Navigate to="/" />} />
              </Routes>
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <div className="relative w-screen h-screen overflow-hidden bg-background text-foreground transition-colors duration-500">
          <div className="relative z-10 w-full h-full">
            <BrowserRouter>
              <Routes>
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/reset-password" element={<ResetPassword />} />
                <Route path="/*" element={
                  <ProtectedRoute>
                    <MainLayout />
                  </ProtectedRoute>
                } />
              </Routes>
            </BrowserRouter>
          </div>
        </div>
      </AuthProvider>
    </ThemeProvider>
  );
}
