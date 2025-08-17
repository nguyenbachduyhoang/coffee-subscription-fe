import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Coffee, User, Menu, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface HeaderProps {
  activeSection: string;
  onSectionChange: (section: string) => void;
  onShowAuth: () => void;
}

export function Header({ activeSection, onSectionChange, onShowAuth }: HeaderProps) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { user, logout } = useAuth();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const menuItems = [
    { id: 'home', label: 'Trang chủ' },
    { id: 'packages', label: 'Gói dịch vụ' },
    { id: 'benefits', label: 'Lợi ích' },
    { id: 'contact', label: 'Liên hệ' },
  ];

  const handleSectionClick = (sectionId: string) => {
    onSectionChange(sectionId);
    setIsMobileMenuOpen(false);
  };

  return (
    <motion.header
      className={`fixed top-0 w-full z-50 transition-all duration-300 ${
        isScrolled 
          ? 'bg-white shadow-lg py-3' 
          : 'bg-transparent py-4'
      }`}
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <motion.div 
            className="flex items-center space-x-2 cursor-pointer"
            onClick={() => handleSectionClick('home')}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Coffee className={`h-8 w-8 ${isScrolled ? 'text-espresso' : 'text-white'}`} />
            <span className={`text-xl font-bold font-poppins ${
              isScrolled ? 'text-espresso' : 'text-white'
            }`}>
              CafeDaily
            </span>
          </motion.div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            {menuItems.map((item) => (
              <motion.button
                key={item.id}
                onClick={() => handleSectionClick(item.id)}
                className={`font-medium font-poppins transition-colors duration-200 ${
                  activeSection === item.id
                    ? 'text-beige border-b-2 border-beige'
                    : isScrolled
                    ? 'text-espresso hover:text-beige'
                    : 'text-white hover:text-beige'
                }`}
                whileHover={{ y: -2 }}
                whileTap={{ y: 0 }}
              >
                {item.label}
              </motion.button>
            ))}
          </nav>

          {/* User Section */}
          <div className="hidden md:flex items-center space-x-4">
            {user ? (
              <div className="flex items-center space-x-3">
                <motion.button
                  onClick={() => handleSectionClick('profile')}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-full transition-colors duration-200 ${
                    isScrolled
                      ? 'bg-espresso text-white hover:bg-opacity-90'
                      : 'bg-white bg-opacity-20 text-white hover:bg-opacity-30'
                  }`}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <User className="h-4 w-4" />
                  <span className="font-medium">{user.name}</span>
                </motion.button>
                <motion.button
                  onClick={logout}
                  className={`px-4 py-2 rounded-full border transition-colors duration-200 ${
                    isScrolled
                      ? 'border-espresso text-espresso hover:bg-espresso hover:text-white'
                      : 'border-white text-white hover:bg-white hover:text-espresso'
                  }`}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Đăng xuất
                </motion.button>
              </div>
            ) : (
              <motion.button
                onClick={onShowAuth}
                className={`px-6 py-2 rounded-full font-medium transition-colors duration-200 ${
                  isScrolled
                    ? 'bg-espresso text-white hover:bg-opacity-90'
                    : 'bg-white text-espresso hover:bg-opacity-90'
                }`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Đăng nhập
              </motion.button>
            )}
          </div>

          {/* Mobile Menu Button */}
          <motion.button
            className={`md:hidden ${isScrolled ? 'text-espresso' : 'text-white'}`}
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            whileTap={{ scale: 0.95 }}
          >
            {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </motion.button>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <motion.div
            className="md:hidden mt-4 pb-4"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
          >
            <div className="flex flex-col space-y-4">
              {menuItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => handleSectionClick(item.id)}
                  className={`text-left font-medium font-poppins transition-colors duration-200 ${
                    activeSection === item.id
                      ? 'text-beige'
                      : isScrolled
                      ? 'text-espresso hover:text-beige'
                      : 'text-white hover:text-beige'
                  }`}
                >
                  {item.label}
                </button>
              ))}
              
              {user ? (
                <>
                  <button
                    onClick={() => handleSectionClick('profile')}
                    className={`text-left font-medium font-poppins transition-colors duration-200 ${
                      isScrolled ? 'text-espresso hover:text-beige' : 'text-white hover:text-beige'
                    }`}
                  >
                    Profile - {user.name}
                  </button>
                  <button
                    onClick={logout}
                    className={`text-left font-medium font-poppins transition-colors duration-200 ${
                      isScrolled ? 'text-espresso hover:text-beige' : 'text-white hover:text-beige'
                    }`}
                  >
                    Đăng xuất
                  </button>
                </>
              ) : (
                <button
                  onClick={onShowAuth}
                  className={`text-left font-medium font-poppins transition-colors duration-200 ${
                    isScrolled ? 'text-espresso hover:text-beige' : 'text-white hover:text-beige'
                  }`}
                >
                  Đăng nhập
                </button>
              )}
            </div>
          </motion.div>
        )}
      </div>
    </motion.header>
  );
}