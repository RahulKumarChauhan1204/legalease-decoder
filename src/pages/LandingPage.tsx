import React from 'react';
import { motion } from 'motion/react';
import { 
  Zap, 
  ShieldAlert, 
  DollarSign, 
  ArrowRight, 
  CheckCircle2, 
  Scale, 
  Lock, 
  FileSearch 
} from 'lucide-react';
import { ModalTab } from '../types';

interface LandingViewProps {
  onStart: () => void;
  onOpenInfo: (tab: ModalTab) => void;
}

export const LandingPage: React.FC<LandingViewProps> = ({ onStart, onOpenInfo }) => {
  return (
    <div className="overflow-hidden">
      {/* Hero Section */}
      <section className="relative pt-20 pb-24 lg:pt-32 lg:pb-40 bg-transparent">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <h1 className="font-display text-5xl lg:text-8xl font-bold tracking-tight text-slate-900 mb-6 leading-[0.9]">
                Stop Signing Things You <span className="text-indigo-600">Don't Understand.</span>
              </h1>
            </motion.div>
            
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-xl text-slate-600 mb-10 leading-relaxed max-w-2xl mx-auto"
            >
              Legal documents are designed to be confusing. Use our AI decoder to translate jargon, identify hidden risks, and protect yourself in seconds.
            </motion.p>
            
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="flex flex-col sm:flex-row items-center justify-center gap-4"
            >
              <button 
                onClick={onStart}
                className="w-full sm:w-auto bg-indigo-600 text-white px-8 py-4 rounded-xl font-bold text-lg hover:bg-indigo-700 shadow-xl shadow-indigo-200 transition-all hover:scale-105 flex items-center justify-center gap-2"
              >
                Decode Your First Document
                <ArrowRight className="w-5 h-5" />
              </button>
              <button 
                onClick={() => onOpenInfo('mission')}
                className="w-full sm:w-auto bg-white/60 backdrop-blur-sm text-slate-700 border border-slate-200 px-8 py-4 rounded-xl font-bold text-lg hover:bg-white transition-all shadow-sm flex items-center justify-center gap-2"
              >
                How It Works
              </button>
            </motion.div>
            
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.6 }}
              transition={{ duration: 1, delay: 0.8 }}
              className="mt-12 flex items-center justify-center gap-8 text-slate-400 grayscale"
            >
              <span className="text-sm font-bold tracking-widest uppercase">Trusted for</span>
              <div className="flex gap-6 items-center italic text-sm">
                <span>Rental Agreements</span>
                <span>•</span>
                <span>Employment Contracts</span>
                <span>•</span>
                <span>Terms of Service</span>
              </div>
            </motion.div>
          </div>
        </div>
        
        {/* Decorative Background Elements */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full pointer-events-none overflow-hidden -z-0">
          <motion.div 
            animate={{ 
              scale: [1, 1.1, 1],
              opacity: [0.3, 0.4, 0.3]
            }}
            transition={{ duration: 8, repeat: Infinity }}
            className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] bg-indigo-100/50 rounded-full blur-[120px]"
          ></motion.div>
          <motion.div 
            animate={{ 
              scale: [1, 1.2, 1],
              opacity: [0.3, 0.5, 0.3]
            }}
            transition={{ duration: 10, repeat: Infinity, delay: 1 }}
            className="absolute -bottom-[10%] -right-[10%] w-[40%] h-[40%] bg-blue-100/50 rounded-full blur-[120px]"
          ></motion.div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="py-24 bg-slate-50/40 backdrop-blur-[1px] border-y border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="font-display text-4xl font-bold text-slate-900 mb-4">Knowledge is Power</h2>
            <p className="text-slate-600">Our tool scans every line to ensure you know exactly what you're agreeing to.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            <FeatureCard 
              icon={<Zap className="w-6 h-6" />}
              title="Jargon Translation"
              description="Instantly convert 'heretofore' and 'indemnification' into clear, simple English you actually speak."
            />
            <FeatureCard 
              icon={<ShieldAlert className="w-6 h-6" />}
              title="Risk Detection"
              description="Identify predatory clauses like unfair termination rights, hidden liability, and one-sided arbitration."
            />
            <FeatureCard 
              icon={<DollarSign className="w-6 h-6" />}
              title="Hidden Fee Alert"
              description="Find that tiny font section that mentions service charges, automatic renewals, or late payment penalties."
            />
          </div>
        </div>
      </section>

      {/* Impact Section */}
      <section className="py-24 bg-transparent">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="bg-indigo-600/95 backdrop-blur-sm rounded-3xl overflow-hidden shadow-2xl flex flex-col lg:flex-row items-center border border-indigo-500/30"
          >
            <div className="p-8 lg:p-16 flex-1 text-white">
              <h3 className="font-display text-3xl lg:text-4xl font-bold mb-6">Democratizing Legal Intelligence</h3>
              <p className="text-indigo-100 text-lg mb-8">
                Legal systems were built for lawyers. We built this for everyone else. By making complex documents accessible, we level the playing field for tenants, employees, and consumers everywhere.
              </p>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/10">
                  <FileSearch className="w-8 h-8 mb-3 text-indigo-200" />
                  <div className="text-3xl font-bold mb-1">50+</div>
                  <div className="text-[10px] text-indigo-200 uppercase font-black tracking-widest">Pages Scanned</div>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/10">
                  <Lock className="w-8 h-8 mb-3 text-indigo-200" />
                  <div className="text-3xl font-bold mb-1">100%</div>
                  <div className="text-[10px] text-indigo-200 uppercase font-black tracking-widest">Privacy Focused</div>
                </div>
              </div>
            </div>
            <div className="w-full lg:w-2/5 h-64 lg:h-auto self-stretch">
              <img 
                src="https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&q=80&w=2000" 
                alt="Justice Gavel" 
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </div>
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 text-center">
        <div className="max-w-3xl mx-auto px-4">
          <Scale className="w-16 h-16 text-indigo-600 mx-auto mb-8" />
          <h2 className="font-display text-4xl font-bold text-slate-900 mb-6">Ready to decode your first contract?</h2>
          <p className="text-xl text-slate-600 mb-10">Join thousands of users who are taking control of their legal agreements.</p>
          <button 
            onClick={onStart}
            className="bg-indigo-600 text-white px-10 py-5 rounded-2xl font-bold text-xl hover:bg-indigo-700 shadow-2xl shadow-indigo-200 transition-all hover:scale-105 flex items-center justify-center gap-3 mx-auto"
          >
            Get Started Now
            <ArrowRight className="w-6 h-6" />
          </button>
        </div>
      </section>
    </div>
  );
};

const FeatureCard: React.FC<{ icon: React.ReactNode, title: string, description: string }> = ({ icon, title, description }) => (
  <motion.div 
    whileHover={{ y: -5 }}
    className="bg-white/80 backdrop-blur-[2px] p-8 rounded-2xl border border-white shadow-sm hover:shadow-md transition-all group"
  >
    <div className="w-12 h-12 bg-indigo-100 text-indigo-600 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
      {icon}
    </div>
    <h4 className="text-xl font-bold text-slate-900 mb-3">{title}</h4>
    <p className="text-slate-600 leading-relaxed text-sm">
      {description}
    </p>
  </motion.div>
);
