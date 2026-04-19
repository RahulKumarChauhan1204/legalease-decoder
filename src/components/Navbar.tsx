import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Menu, X, Scale, Info, Zap, FileSearch, ChevronRight } from 'lucide-react';
import { AppView, ModalTab } from '../types';

interface NavbarProps {
  onNavigate: (view: AppView) => void;
  onOpenInfo: (tab: ModalTab) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onNavigate, onOpenInfo }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleMobileAction = (action: () => void) => {
    setIsMobileMenuOpen(false);
    action();
  };

  return (
    <>
      <header className="bg-white/80 backdrop-blur-md sticky top-0 z-50 border-b border-slate-200 no-print">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div 
            className="flex items-center gap-2 cursor-pointer group"
            onClick={() => onNavigate(AppView.LANDING)}
          >
            <div className="w-10 h-10 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-bold text-xl shadow-lg group-hover:scale-105 transition-transform">
              <Scale className="w-6 h-6" />
            </div>
            <span className="font-display text-xl font-bold tracking-tight text-slate-800">LegalEase</span>
          </div>
          
          <nav className="hidden md:flex items-center gap-8">
            <button 
              onClick={() => onOpenInfo('mission')}
              className="text-sm font-medium text-slate-600 hover:text-indigo-600 transition-colors"
            >
              How it Works
            </button>
            <button 
              onClick={() => onOpenInfo('features')}
              className="text-sm font-medium text-slate-600 hover:text-indigo-600 transition-colors"
            >
              Features
            </button>
            <button 
              onClick={() => onNavigate(AppView.DASHBOARD)}
              className="bg-indigo-600 text-white px-5 py-2.5 rounded-full text-sm font-semibold hover:bg-indigo-700 shadow-md transition-all hover:shadow-indigo-200 flex items-center gap-2"
            >
              Analyze Document
              <ChevronRight className="w-4 h-4" />
            </button>
          </nav>

          <button 
            className="md:hidden p-2 text-slate-600 hover:bg-slate-50 rounded-lg transition-colors"
            onClick={() => setIsMobileMenuOpen(true)}
            aria-label="Open menu"
          >
            <Menu className="w-6 h-6" />
          </button>
        </div>
      </header>

      <AnimatePresence>
        {isMobileMenuOpen && (
          <div className="fixed inset-0 z-[100] md:hidden">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm"
              onClick={() => setIsMobileMenuOpen(false)}
            ></motion.div>
            
            <motion.div 
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="absolute top-0 right-0 w-4/5 max-w-sm h-full bg-white shadow-2xl flex flex-col"
            >
              <div className="p-6 flex items-center justify-between border-b border-slate-100">
                <span className="font-display font-bold text-slate-900">Navigation</span>
                <button 
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="p-2 text-slate-400 hover:text-slate-600"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              
              <div className="flex-grow p-6 space-y-4">
                <button 
                  onClick={() => handleMobileAction(() => onOpenInfo('mission'))}
                  className="w-full flex items-center gap-4 p-4 rounded-2xl bg-slate-50 text-slate-700 font-bold hover:bg-indigo-50 hover:text-indigo-600 transition-all text-left"
                >
                  <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm text-indigo-600">
                    <Info className="w-5 h-5" />
                  </div>
                  How it Works
                </button>
                
                <button 
                  onClick={() => handleMobileAction(() => onOpenInfo('features'))}
                  className="w-full flex items-center gap-4 p-4 rounded-2xl bg-slate-50 text-slate-700 font-bold hover:bg-indigo-50 hover:text-indigo-600 transition-all text-left"
                >
                  <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm text-indigo-600">
                    <Zap className="w-5 h-5" />
                  </div>
                  Platform Features
                </button>

                <button 
                  onClick={() => handleMobileAction(() => onNavigate(AppView.DASHBOARD))}
                  className="w-full flex items-center gap-4 p-4 rounded-2xl bg-indigo-600 text-white font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100 text-left"
                >
                  <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center text-white">
                    <FileSearch className="w-5 h-5" />
                  </div>
                  Analyze Document
                </button>
              </div>

              <div className="p-8 border-t border-slate-100">
                <p className="text-xs text-slate-400 leading-relaxed text-center italic">
                  Empowering individuals against complex legal systems.
                </p>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};
