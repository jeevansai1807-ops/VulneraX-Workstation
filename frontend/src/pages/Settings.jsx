import React, { useState } from 'react';
import { User, Shield, Key, Mail, Lock, Save, Loader2, CheckCircle, XCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../lib/AuthContext';
import PlatformPlaceholder from '../components/PlatformPlaceholder';
import { updatePassword } from '../api/client';

export default function Settings() {
  const [activeTab, setActiveTab] = useState('profile');
  const { user } = useAuth();
  
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordStatus, setPasswordStatus] = useState({ type: '', message: '' });
  const [isUpdating, setIsUpdating] = useState(false);

  const tabs = [
    { id: 'profile', label: 'Profile', icon: User, description: 'Manage your public details' },
    { id: 'security', label: 'Security', icon: Shield, description: 'Update password & 2FA' },
    { id: 'api', label: 'API Keys', icon: Key, description: 'Manage developer access' },
  ];

  const handlePasswordUpdate = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      setPasswordStatus({ type: 'error', message: 'All fields are required.' });
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordStatus({ type: 'error', message: 'New passwords do not match.' });
      return;
    }
    if (newPassword.length < 8) {
      setPasswordStatus({ type: 'error', message: 'Password must be at least 8 characters.' });
      return;
    }

    setIsUpdating(true);
    setPasswordStatus({ type: '', message: '' });

    try {
      await updatePassword(currentPassword, newPassword);
      setPasswordStatus({ type: 'success', message: 'Password updated successfully!' });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (error) {
      setPasswordStatus({ 
        type: 'error', 
        message: error.response?.data?.detail || 'Failed to update password.' 
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'profile':
        return (
          <div className="space-y-6">
            <div className="glass-panel p-6">
              <h3 className="text-lg font-bold mb-4 flex items-center gap-2 text-foreground">
                <User className="h-5 w-5 text-primary" />
                Personal Information
              </h3>
              <div className="space-y-4 max-w-md">
                <div>
                  <label className="block text-sm font-medium text-foreground/60 mb-1">Username</label>
                  <input 
                    type="text" 
                    defaultValue={user?.username || 'Admin'} 
                    className="w-full bg-foreground/5 border border-border rounded-lg px-4 py-2 text-foreground focus:ring-2 focus:ring-primary focus:outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground/60 mb-1">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-foreground/40" />
                    <input 
                      type="email" 
                      defaultValue={user?.email || ""} 
                      className="w-full bg-foreground/5 border border-border rounded-lg pl-10 pr-4 py-2 text-foreground focus:ring-2 focus:ring-primary focus:outline-none transition-all"
                    />
                  </div>
                </div>
                <button className="flex items-center gap-2 bg-primary/20 text-primary border border-primary/50 px-4 py-2 rounded-lg font-medium hover:bg-primary/30 transition-colors">
                  <Save className="h-4 w-4" /> Save Changes
                </button>
              </div>
            </div>
          </div>
        );

      case 'security':
        return (
          <div className="space-y-6">
            <div className="glass-panel p-6">
              <h3 className="text-lg font-bold mb-4 flex items-center gap-2 text-foreground">
                <Lock className="h-5 w-5 text-primary" />
                Change Password
              </h3>
              <div className="space-y-4 max-w-md">
                
                {passwordStatus.message && (
                  <div className={`p-3 rounded-lg text-sm flex items-start gap-2 ${
                    passwordStatus.type === 'error' ? 'bg-red-500/10 text-red-400 border border-red-500/20' : 'bg-green-500/10 text-green-400 border border-green-500/20'
                  }`}>
                    {passwordStatus.type === 'error' ? <XCircle className="h-4 w-4 mt-0.5 shrink-0" /> : <CheckCircle className="h-4 w-4 mt-0.5 shrink-0" />}
                    {passwordStatus.message}
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-foreground/60 mb-1">Current Password</label>
                  <input 
                    type="password" 
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className="w-full bg-foreground/5 border border-border rounded-lg px-4 py-2 text-foreground focus:ring-2 focus:ring-primary focus:outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground/60 mb-1">New Password</label>
                  <input 
                    type="password" 
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full bg-foreground/5 border border-border rounded-lg px-4 py-2 text-foreground focus:ring-2 focus:ring-primary focus:outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground/60 mb-1">Confirm New Password</label>
                  <input 
                    type="password" 
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full bg-foreground/5 border border-border rounded-lg px-4 py-2 text-foreground focus:ring-2 focus:ring-primary focus:outline-none transition-all"
                  />
                </div>
                <button 
                  onClick={handlePasswordUpdate}
                  disabled={isUpdating}
                  className="flex items-center gap-2 bg-red-500/20 text-red-400 border border-red-500/50 px-4 py-2 rounded-lg font-medium hover:bg-red-500/30 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isUpdating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Shield className="h-4 w-4" />}
                  Update Password
                </button>
              </div>
            </div>
          </div>
        );

      case 'api':
        return (
          <div className="space-y-6">
            <PlatformPlaceholder
              eyebrow="Developer"
              title="API Keys"
              description="Generate and manage API keys for external integrations and programmatic access to VulneraX capabilities."
            />
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="h-full flex flex-col md:flex-row gap-6 p-6">
      
      {/* Sidebar Navigation */}
      <div className="w-full md:w-64 flex-shrink-0">
        <div className="glass-panel p-4 h-full sticky top-0">
          <h2 className="text-xl font-bold mb-6 px-2 text-foreground">Settings</h2>
          <nav className="space-y-2">
            {tabs.map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-start gap-3 px-4 py-3 rounded-xl text-left transition-all ${
                    isActive 
                      ? 'bg-foreground/10 border border-border shadow-lg text-foreground' 
                      : 'text-foreground/50 hover:bg-foreground/5 hover:text-foreground'
                  }`}
                >
                  <tab.icon className={`h-5 w-5 mt-0.5 ${isActive ? 'text-primary' : ''}`} />
                  <div>
                    <div className={`text-sm font-medium ${isActive ? 'text-foreground' : ''}`}>
                      {tab.label}
                    </div>
                    <div className="text-xs opacity-70 mt-0.5">
                      {tab.description}
                    </div>
                  </div>
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-auto">
        <div className="max-w-4xl">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              <div className="mb-6">
                <h1 className="text-2xl font-bold text-foreground">{tabs.find(t => t.id === activeTab)?.label}</h1>
                <p className="text-foreground/60 mt-1">{tabs.find(t => t.id === activeTab)?.description}</p>
              </div>
              
              {renderTabContent()}
              
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

    </div>
  );
}
