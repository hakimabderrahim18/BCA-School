import React from 'react';
import { Outlet } from 'react-router-dom';
import { Header } from './Header';
import { Footer } from './Footer';
import { FloatingWhatsApp } from './FloatingWhatsApp';

export const PublicLayout = () => {
  return (
    <div className="flex flex-col min-h-screen bg-slate-50 text-slate-800 antialiased selection:bg-brand-500 selection:text-white">
      <Header />
      <main className="flex-1">
        <Outlet />
      </main>
      <FloatingWhatsApp />
      <Footer />
    </div>
  );
};
