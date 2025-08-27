import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Coffee, User, Menu, X, Bell } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useEffect as useReactEffect, useState as useReactState } from 'react';
import { getMyNotifications } from '../utils/notificationsAPI';

interface HeaderProps {
  activeSection: string;
  onSectionChange: (section: string) => void;
  onShowAuth: () => void;
  onShowNotifications?: () => void;
}

export function Header({ activeSection, onSectionChange, onShowAuth, onShowNotifications }: HeaderProps) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { user, logout } = useAuth();
  const [unreadCount, setUnreadCount] = useReactState<number>(0);
  const [showPing, setShowPing] = useReactState<boolean>(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Lightweight polling for unread notifications when logged in
  useReactEffect(() => {
    let timer: number | undefined;
    const fetchUnread = async () => {
      try {
        if (!user) {
          setUnreadCount(0);
          return;
        }
        const list = await getMyNotifications();
        const unread = list.filter(n => n.isRead === false).length;
        setUnreadCount(unread);
      } catch {
        // silent fail; keep last known count
      }
    };
    fetchUnread();
    if (user) {
      timer = window.setInterval(fetchUnread, 60000);
      const onNotify = () => {
        fetchUnread();
        setShowPing(true);
        window.setTimeout(() => setShowPing(false), 5000);
      };
      window.addEventListener('notifications:new', onNotify as EventListener);
      // Clean up event listener
      return () => {
        if (timer) window.clearInterval(timer);
        window.removeEventListener('notifications:new', onNotify as EventListener);
      };
    }
    return () => {
      if (timer) window.clearInterval(timer);
    };
  }, [user]);

  const menuItems = [
    { id: 'home', label: 'Trang chủ' },
    { id: 'packages', label: 'Gói dịch vụ' },
    { id: 'benefits', label: 'Lợi ích' },
    { id: 'contact', label: 'Liên hệ' },
  ];

  // Keep simple explicit buttons below; list removed to avoid unused var

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
        <div className="relative grid grid-cols-[auto_1fr_auto] items-center gap-4">
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
          <nav className="hidden md:flex items-center justify-center space-x-8 absolute left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2">
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
          <div className="hidden md:flex items-center justify-end space-x-3">
            {user ? (
              <div className="flex items-center space-x-3">
                <motion.button
                  onClick={() => handleSectionClick('profile')}
                  className={`flex items-center space-x-2 px-3 py-1.5 rounded-full transition-colors duration-200 ${
                    activeSection === 'profile'
                      ? 'bg-beige text-espresso'
                      : isScrolled
                      ? 'bg-espresso text-white hover:bg-opacity-90'
                      : 'bg-white bg-opacity-20 text-white hover:bg-opacity-30'
                  }`}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <User className="h-4 w-4" />
                  <span className="font-medium">Profile</span>
                </motion.button>
                
                <motion.button
                  onClick={() => handleSectionClick('subscription')}
                  className={`flex items-center space-x-2 px-3 py-1.5 rounded-full transition-colors duration-200 ${
                    activeSection === 'subscription'
                      ? 'bg-beige text-espresso'
                      : isScrolled
                      ? 'bg-espresso text-white hover:bg-opacity-90'
                      : 'bg-white bg-opacity-20 text-white hover:bg-opacity-30'
                  }`}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <span className="font-medium">Subscription</span>
                </motion.button>

                <motion.button
                  onClick={() => (onShowNotifications ? onShowNotifications() : handleSectionClick('notifications'))}
                  className={`relative flex items-center justify-center h-9 w-9 rounded-full transition-colors duration-200 ${
                    activeSection === 'notifications'
                      ? 'bg-beige text-espresso'
                      : isScrolled
                      ? 'bg-espresso text-white hover:bg-opacity-90'
                      : 'bg-white bg-opacity-20 text-white hover:bg-opacity-30'
                  }`}
                  aria-label="Notifications"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Bell className="h-5 w-5" />
                  {showPing && (
                    <span className="absolute -top-1 -right-1 flex h-3 w-3">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                    </span>
                  )}
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-red-500 text-white text-[10px] flex items-center justify-center">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                </motion.button>

                <motion.button
                  onClick={logout}
                  className={`px-3 py-1.5 rounded-full border transition-colors duration-200 ${
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
                className={`px-5 py-1.5 rounded-full font-medium transition-colors duration-200 ${
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
                      activeSection === 'profile'
                        ? 'text-beige'
                        : isScrolled
                        ? 'text-espresso hover:text-beige'
                        : 'text-white hover:text-beige'
                    }`}
                  >
                    Profile
                  </button>
                  <button
                    onClick={() => handleSectionClick('subscription')}
                    className={`text-left font-medium font-poppins transition-colors duration-200 ${
                      activeSection === 'subscription'
                        ? 'text-beige'
                        : isScrolled
                        ? 'text-espresso hover:text-beige'
                        : 'text-white hover:text-beige'
                    }`}
                  >
                    Subscription
                  </button>
                  <button
                    onClick={() => (onShowNotifications ? onShowNotifications() : handleSectionClick('notifications'))}
                    className={`flex items-center gap-2 text-left font-medium font-poppins transition-colors duration-200 ${
                      activeSection === 'notifications'
                        ? 'text-beige'
                        : isScrolled
                        ? 'text-espresso hover:text-beige'
                        : 'text-white hover:text-beige'
                    }`}
                  >
                    <span className="relative inline-flex items-center justify-center h-9 w-9 rounded-full bg-white/20">
                      <Bell className="h-5 w-5" />
                      {showPing && (
                        <span className="absolute -top-1 -right-1 flex h-3 w-3">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                        </span>
                      )}
                      {unreadCount > 0 && (
                        <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-red-500 text-white text-[10px] flex items-center justify-center">
                          {unreadCount > 9 ? '9+' : unreadCount}
                        </span>
                      )}
                    </span>
                    Thông báo
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