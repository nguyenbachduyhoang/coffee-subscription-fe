import { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Header } from './components/Header';
import { Hero } from './components/Hero';
import { Packages } from './components/Packages';
import { Benefits } from './components/Benefits';
import { Contact } from './components/Contact';
import { Profile } from './components/Profile';
import { Subscription } from './components/Subscription';
import { AuthModal } from './components/AuthModal';
import { PaymentModal } from './components/PaymentModal';
import { Footer } from './components/Footer';
import { Package } from './types';
import Notifications, { NotificationsPopover } from './components/Notifications';

function AppContent() {
  const [activeSection, setActiveSection] = useState('home');
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showNotificationsPopover, setShowNotificationsPopover] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState<Package | null>(null);
  const { user } = useAuth();

  const handleSectionChange = (section: string) => {
    setActiveSection(section);
    
    if ((section === 'profile' || section === 'subscription' || section === 'notifications') && !user) {
      setShowAuthModal(true);
      return;
    }

    if (section !== 'profile' && section !== 'subscription' && section !== 'notifications') {
      const element = document.getElementById(section);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      } else if (section === 'home') {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }
  };

  const handleShowPackages = () => {
    setActiveSection('packages');
    const element = document.getElementById('packages');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleSelectPackage = (pkg: Package) => {
    if (!user) {
      setShowAuthModal(true);
      return;
    }
    setSelectedPackage(pkg);
    setShowPaymentModal(true);
  };

  const handleShowAuth = () => {
    setShowAuthModal(true);
  };
  const handleShowNotifications = () => {
    if (!user) {
      setShowAuthModal(true);
      return;
    }
    setShowNotificationsPopover(true);
  };

  return (
    <div className="font-poppins">
      <Header 
        activeSection={activeSection}
        onSectionChange={handleSectionChange}
        onShowAuth={handleShowAuth}
        onShowNotifications={handleShowNotifications}
      />

      {activeSection === 'profile' && user ? (
        <Profile />
      ) : activeSection === 'subscription' && user ? (
        <Subscription onShowPackages={handleShowPackages} />
      ) : activeSection === 'notifications' && user ? (
        <Notifications />
      ) : (
        <>
          <Hero onShowPackages={handleShowPackages} />
          <Packages onSelectPackage={handleSelectPackage} />
          <Benefits />
          <Contact />
        </>
      )}

      <Footer />

      <AuthModal 
        isOpen={showAuthModal} 
        onClose={() => setShowAuthModal(false)} 
      />

      <PaymentModal
        isOpen={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        selectedPackage={selectedPackage}
      />

      {/* Small popover under bell icon */}
      <NotificationsPopover
        isOpen={showNotificationsPopover}
        onClose={() => setShowNotificationsPopover(false)}
      />
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;