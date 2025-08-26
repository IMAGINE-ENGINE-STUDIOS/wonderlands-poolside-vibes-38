
import React from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import SpaSection from '@/components/SpaSection';

const Spas = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-20">
        <SpaSection />
      </main>
      <Footer />
    </div>
  );
};

export default Spas;
