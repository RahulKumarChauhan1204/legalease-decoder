import React from 'react';
import { Scale, Twitter, Linkedin, Mail, ShieldCheck } from 'lucide-react';
import { ModalTab } from '../types';

interface FooterProps {
  onOpenInfo: (tab: ModalTab) => void;
}

export const Footer: React.FC<FooterProps> = ({ onOpenInfo }) => {
  return (
    <footer className="bg-slate-900 text-slate-400 py-12 border-t border-slate-800 no-print">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center gap-2 mb-4 text-left">
              <div className="w-8 h-8 bg-indigo-500 rounded flex items-center justify-center text-white font-bold text-lg">
                <Scale className="w-5 h-5" />
              </div>
              <span className="font-display text-lg font-bold text-white tracking-tight">LegalEase Decoder</span>
            </div>
            <p className="max-w-xs mb-6 text-sm leading-relaxed text-left">
              Empowering everyday people with AI-driven legal clarity. We believe complex language shouldn't be a barrier to justice.
            </p>
            <div className="flex gap-4">
              <a href="#" className="p-2 bg-slate-800 rounded-lg hover:bg-indigo-600 transition-colors text-white">
                <Twitter className="w-4 h-4" />
              </a>
              <a href="#" className="p-2 bg-slate-800 rounded-lg hover:bg-indigo-600 transition-colors text-white">
                <Linkedin className="w-4 h-4" />
              </a>
              <a href="#" className="p-2 bg-slate-800 rounded-lg hover:bg-indigo-600 transition-colors text-white">
                <Mail className="w-4 h-4" />
              </a>
            </div>
          </div>
          <div className="text-left">
            <h4 className="text-white font-semibold mb-4">Product</h4>
            <ul className="space-y-2 text-sm">
              <li><button onClick={() => onOpenInfo('features')} className="hover:text-white transition-colors text-left">Capabilities</button></li>
              <li><button onClick={() => onOpenInfo('security')} className="hover:text-white transition-colors text-left">Security</button></li>
              <li><button onClick={() => onOpenInfo('mission')} className="hover:text-white transition-colors text-left">Our Mission</button></li>
            </ul>
          </div>
          <div className="text-left">
            <h4 className="text-white font-semibold mb-4">Support</h4>
            <ul className="space-y-2 text-sm">
              <li><a href="#" className="hover:text-white transition-colors">Privacy Policy</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Terms of Service</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Contact Support</a></li>
            </ul>
          </div>
        </div>
        <div className="mt-12 pt-8 border-t border-slate-800 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-center md:text-left">
          <p>&copy; 2026 LegalEase Decoder.</p>
          <p className="flex items-center gap-1">
            <ShieldCheck className="w-3 h-3" />
            Disclaimer: Not a replacement for professional legal advice.
          </p>
        </div>
      </div>
    </footer>
  );
};
