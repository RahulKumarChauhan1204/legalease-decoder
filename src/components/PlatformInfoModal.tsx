import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, 
  Info, 
  Cpu, 
  Zap, 
  ShieldCheck, 
  CheckCircle2, 
  Target, 
  Lock, 
  Search, 
  History, 
  DollarSign 
} from 'lucide-react';
import { ModalTab } from '../types';
import { cn } from '../lib/utils';

interface PlatformInfoModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeTab: ModalTab;
  onTabChange: (tab: ModalTab) => void;
}

export const PlatformInfoModal: React.FC<PlatformInfoModalProps> = ({ 
  isOpen, 
  onClose, 
  activeTab, 
  onTabChange 
}) => {
  const tabs: { id: ModalTab; label: string; icon: React.ReactNode }[] = [
    { id: 'mission', label: 'Mission', icon: <Target className="w-4 h-4" /> },
    { id: 'tech', label: 'Technology', icon: <Cpu className="w-4 h-4" /> },
    { id: 'features', label: 'Features', icon: <Zap className="w-4 h-4" /> },
    { id: 'security', label: 'Security', icon: <ShieldCheck className="w-4 h-4" /> },
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
            onClick={onClose}
          ></motion.div>
          
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative bg-white w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden"
          >
            <div className="p-8 md:p-10 text-left">
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white">
                    <Info className="w-6 h-6" />
                  </div>
                  <h3 className="font-display text-2xl font-bold text-slate-900">Platform Intelligence</h3>
                </div>
                <button 
                  onClick={onClose}
                  className="p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* Tab Navigation */}
              <div className="flex border-b border-slate-100 mb-8 overflow-x-auto scrollbar-hide">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => onTabChange(tab.id)}
                    className={cn(
                      "px-4 py-3 text-sm font-bold border-b-2 transition-all whitespace-nowrap flex items-center gap-2",
                      activeTab === tab.id 
                        ? "border-indigo-600 text-indigo-600" 
                        : "border-transparent text-slate-400 hover:text-slate-600"
                    )}
                  >
                    {tab.icon}
                    {tab.label}
                  </button>
                ))}
              </div>

              <div className="min-h-[300px]">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeTab}
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    transition={{ duration: 0.2 }}
                  >
                    {activeTab === 'mission' && (
                      <div>
                        <h4 className="text-indigo-600 font-bold uppercase tracking-widest text-xs mb-3">The Mission</h4>
                        <p className="text-slate-600 leading-relaxed mb-6">
                          LegalEase Decoder was built with a high social impact mission: to democratize legal intelligence. We empower regular people—tenants, employees, and consumers—to understand complex contracts that are often designed to confuse.
                        </p>
                        <div className="bg-indigo-50 p-6 rounded-2xl border border-indigo-100">
                          <p className="text-indigo-700 text-sm font-medium italic">
                            "Our goal is to eliminate the 'Knowledge Gap' that predatory corporations use to take advantage of individuals."
                          </p>
                        </div>
                      </div>
                    )}

                    {activeTab === 'tech' && (
                      <div>
                        <h4 className="text-indigo-600 font-bold uppercase tracking-widest text-xs mb-3">The Technology</h4>
                        <p className="text-slate-600 leading-relaxed mb-4">
                          Our platform leverages <span className="font-bold text-slate-800">Gemini 3.1 Pro</span>, utilizing its massive context window to process multi-page documents (up to 50+ pages) in a single pass.
                        </p>
                        <div className="space-y-4 mt-6">
                          <div className="flex items-start gap-3 bg-slate-50 p-4 rounded-xl">
                            <div className="w-8 h-8 bg-white border border-slate-200 rounded flex items-center justify-center text-indigo-600 shrink-0 font-bold">1</div>
                            <div>
                              <h5 className="font-bold text-slate-900 text-sm">Deep Reasoning</h5>
                              <p className="text-xs text-slate-500">The model identifies logical inconsistencies and missing clauses that standard OCR ignores.</p>
                            </div>
                          </div>
                          <div className="flex items-start gap-3 bg-slate-50 p-4 rounded-xl">
                            <div className="w-8 h-8 bg-white border border-slate-200 rounded flex items-center justify-center text-indigo-600 shrink-0 font-bold">2</div>
                            <div>
                              <h5 className="font-bold text-slate-900 text-sm">Pattern Matching</h5>
                              <p className="text-xs text-slate-500">Scans against thousands of predatory clause patterns used in rental and employment agreements.</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {activeTab === 'features' && (
                      <div>
                        <h4 className="text-indigo-600 font-bold uppercase tracking-widest text-xs mb-3">Platform Features</h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <FeatureItem 
                            icon={<Search className="w-4 h-4" />}
                            title="Jargon Decoder" 
                            desc="Translates archaic legal terms into clear, actionable advice." 
                          />
                          <FeatureItem 
                            icon={<ShieldCheck className="w-4 h-4" />}
                            title="Risk Radar" 
                            desc="Categorizes risks by severity so you know what to negotiate first." 
                          />
                          <FeatureItem 
                            icon={<DollarSign className="w-4 h-4" />}
                            title="Cost Analysis" 
                            desc="Uncovers hidden subscription fees and one-time penalties." 
                          />
                          <FeatureItem 
                            icon={<History className="w-4 h-4" />}
                            title="Historical Tracking" 
                            desc="Store and compare previous analyses to see document trends." 
                          />
                        </div>
                      </div>
                    )}

                    {activeTab === 'security' && (
                      <div>
                        <h4 className="text-indigo-600 font-bold uppercase tracking-widest text-xs mb-3">Security & Privacy</h4>
                        <p className="text-slate-600 leading-relaxed mb-6">
                          Your documents are processed with ephemeral logic. We do not store original files after analysis is complete, and your data is never used to train external AI models.
                        </p>
                        <ul className="space-y-3">
                          <li className="flex items-center gap-2 text-sm text-slate-500">
                            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                            256-bit Document Encryption
                          </li>
                          <li className="flex items-center gap-2 text-sm text-slate-500">
                            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                            SOC2 Compliant Infrastructure
                          </li>
                          <li className="flex items-center gap-2 text-sm text-slate-500">
                            <Lock className="w-4 h-4 text-emerald-500" />
                            Privacy-First Data Handling
                          </li>
                        </ul>
                      </div>
                    )}
                  </motion.div>
                </AnimatePresence>
              </div>

              <div className="mt-10 pt-8 border-t border-slate-100 flex justify-end">
                <button 
                  onClick={onClose}
                  className="bg-slate-900 text-white px-6 py-2.5 rounded-xl font-bold hover:bg-slate-800 transition-colors"
                >
                  Close Information
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

const FeatureItem: React.FC<{ icon: React.ReactNode; title: string; desc: string }> = ({ icon, title, desc }) => (
  <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
    <div className="flex items-center gap-2 mb-1">
      <div className="text-indigo-600">{icon}</div>
      <div className="font-bold text-slate-900 text-sm">{title}</div>
    </div>
    <p className="text-xs text-slate-500 leading-relaxed">{desc}</p>
  </div>
);
