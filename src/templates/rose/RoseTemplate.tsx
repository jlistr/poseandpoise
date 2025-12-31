'use client';

import { useState } from 'react';
import type { PortfolioData } from '@/types/portfolio';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { PortfolioPage } from './components/PortfolioPage';
import { AboutPage } from './components/AboutPage';
import { ServicesPage } from './components/ServicesPage';
import { ContactPage } from './components/ContactPage';
import { FullScreenMenu } from './components/FullScreenMenu';
import { BookMeButton } from './components/BookMeButton';

export type RosePage = 'portfolio' | 'about' | 'services' | 'contact';

interface RoseTemplateProps {
  data: PortfolioData;
}

export function RoseTemplate({ data }: RoseTemplateProps) {
  const [currentPage, setCurrentPage] = useState<RosePage>('portfolio');
  const [menuOpen, setMenuOpen] = useState(false);

  const navigate = (page: RosePage) => {
    setCurrentPage(page);
    setMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const renderPage = () => {
    switch (currentPage) {
      case 'about':
        return <AboutPage data={data} />;
      case 'services':
        return <ServicesPage data={data} />;
      case 'contact':
        return <ContactPage data={data} />;
      default:
        return <PortfolioPage data={data} />;
    }
  };

  return (
    <div style={{ 
      minHeight: '100vh', 
      backgroundColor: '#FAF8F6',
      fontFamily: "'Cormorant Garamond', Georgia, serif",
    }}>
      <Header 
        data={data} 
        currentPage={currentPage}
        onNavigate={navigate}
        onMenuToggle={() => setMenuOpen(true)}
      />
      
      <main>
        {renderPage()}
      </main>
      
      <Footer data={data} />
      
      <BookMeButton onClick={() => navigate('contact')} />
      
      <FullScreenMenu
        isOpen={menuOpen}
        currentPage={currentPage}
        onNavigate={navigate}
        onClose={() => setMenuOpen(false)}
        backgroundImage={data.photos[0]?.url}
      />
    </div>
  );
}
