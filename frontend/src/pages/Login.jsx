import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { login } from '../api/client';
import { Lock, Sun, Moon } from 'lucide-react';
import { useTheme } from '../components/ThemeProvider';
import { useAuth } from '../lib/AuthContext';
import Logo from '../components/Logo';

export default function Login() {
  const { theme, toggleTheme } = useTheme();
  const { setUser } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await login(email, password);
      localStorage.setItem('vulnerax_token', res.data.access_token);
      window.location.href = '/';
    } catch (err) {
      setError(err.response?.data?.detail || 'Login failed');
    }
  };

  return (
    <div className="w-full h-full flex flex-col items-center justify-center p-4">
      {/* Top Bar for Auth pages */}
      <div className="absolute top-0 left-0 right-0 p-6 flex justify-between items-center z-20">
        <Link to="/" className="text-2xl font-black text-foreground flex items-center gap-3 hover:opacity-80 transition-opacity">
          <Logo size="sm" />
          <span>Vulnera<span className="text-primary">X</span></span>
        </Link>
        <div className="flex items-center gap-4">
          <button 
            onClick={toggleTheme}
            className="flex items-center justify-center h-9 w-9 rounded-full bg-foreground/5 hover:bg-foreground/10 transition-all shadow-sm focus:outline-none ring-1 ring-border text-foreground/80"
          >
            {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </button>
          <div className="text-sm text-foreground/60 font-medium">
            Don't have an account? <Link to="/register" className="text-primary hover:text-foreground transition-colors ml-1 font-bold">Sign up</Link>
          </div>
        </div>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="w-full max-w-[420px] glass-panel p-8 relative z-10"
      >
        <div className="flex justify-center mb-6">
          <Logo size="xl" />
        </div>
        
        <h1 className="text-3xl font-bold text-foreground text-center mb-2">Welcome Back</h1>
        <p className="text-foreground/60 text-center mb-8 text-sm">Enter your credentials to access the network.</p>
        
        {error && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
            className="p-3 mb-6 text-sm text-destructive bg-destructive/10 rounded-lg border border-destructive/20 text-center font-medium"
          >
            {error}
          </motion.div>
        )}
        
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <input 
              type="text" 
              placeholder="Username or Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-3.5 rounded-xl bg-foreground/5 text-foreground placeholder-foreground/40 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all border border-border focus:border-primary/50"
              required
            />
          </div>
          <div>
            <input 
              type="password" 
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-3.5 rounded-xl bg-foreground/5 text-foreground placeholder-foreground/40 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all border border-border focus:border-primary/50"
              required
            />
          </div>
          
          <div className="flex items-center justify-between pt-2">
            <div className="flex items-center gap-2">
              <input type="checkbox" id="remember" className="w-4 h-4 rounded border-foreground/20 text-primary focus:ring-primary bg-foreground/5 accent-primary" />
              <label htmlFor="remember" className="text-sm text-foreground/70 cursor-pointer">Remember me</label>
            </div>
            <Link to="/forgot-password" className="text-sm text-primary hover:text-foreground transition-colors">Forgot password?</Link>
          </div>

          <button 
            type="submit" 
            className="w-full mt-6 py-3.5 px-4 bg-primary text-primary-foreground rounded-xl font-bold hover:bg-primary/90 transition-all shadow-[0_0_20px_rgba(6,182,212,0.3)] hover:shadow-[0_0_30px_rgba(6,182,212,0.5)]"
          >
            Sign In
          </button>
        </form>

        <div className="mt-8 flex items-center justify-center gap-2 text-xs text-foreground/40">
          <Lock className="h-3 w-3" />
          <span>Secure AES-256 encrypted connection.</span>
        </div>
      </motion.div>
    </div>
  );
}
