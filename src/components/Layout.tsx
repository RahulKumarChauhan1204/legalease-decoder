import React from 'react';
import { AppView, ModalTab } from '../types';
import { Navbar } from './Navbar';
import { Footer } from './Footer';

interface LayoutProps {
  children: React.ReactNode;
  onNavigate: (view: AppView) => void;
  onOpenInfo: (tab: ModalTab) => void;
}

export const Layout: React.FC<LayoutProps> = ({ children, onNavigate, onOpenInfo }) => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar onNavigate={onNavigate} onOpenInfo={onOpenInfo} />
      <main className="flex-grow">
        {children}
      </main>
      <Footer onOpenInfo={onOpenInfo} />
    </div>
  );
};
