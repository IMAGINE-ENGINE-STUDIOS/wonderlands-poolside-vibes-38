
import React from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import TanningLedgeSection from '@/components/TanningLedgeSection';

const TanningLedges = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-20">
        <TanningLedgeSection />
      </main>
      <Footer />
    </div>
  );
};

export default TanningLedges;
