import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Send, MapPin, Phone, Mail } from 'lucide-react';
import { storageUtils } from '../utils/localStorage';
import { ContactMessage } from '../types';

export function Contact() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));

    const contactMessage: ContactMessage = {
      id: Date.now().toString(),
      ...formData,
      timestamp: new Date().toISOString()
    };

    storageUtils.addContactMessage(contactMessage);

    setFormData({ name: '', email: '', message: '' });
    setIsSubmitting(false);
    setShowSuccess(true);

    setTimeout(() => setShowSuccess(false), 3000);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  return (
    <section id="contact" className="py-20 bg-gray-50">
      <div className="container mx-auto px-4">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <h2 className="text-4xl md:text-5xl font-bold text-espresso mb-4 font-poppins">
            Liên Hệ Với Chúng Tôi
          </h2>
          <p className="text-lg text-gray-700 max-w-2xl mx-auto">
            Có câu hỏi hoặc cần hỗ trợ? Chúng tôi luôn sẵn sàng lắng nghe và giúp đỡ bạn.
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-12 max-w-6xl mx-auto">
          {/* Contact Form */}
          <motion.div
            className="bg-white p-8 rounded-2xl shadow-xl"
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h3 className="text-2xl font-bold text-espresso mb-6 font-poppins">
              Gửi Tin Nhắn
            </h3>

            {showSuccess && (
              <motion.div
                className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-lg mb-6"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
              >
                Cảm ơn bạn đã liên hệ! Chúng tôi sẽ phản hồi trong thời gian sớm nhất.
              </motion.div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Họ và tên
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-beige focus:border-transparent transition-all duration-200"
                  placeholder="Nhập họ và tên của bạn"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-beige focus:border-transparent transition-all duration-200"
                  placeholder="email@example.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tin nhắn
                </label>
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  required
                  rows={5}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-beige focus:border-transparent transition-all duration-200 resize-none"
                  placeholder="Nhập tin nhắn của bạn..."
                />
              </div>

              <motion.button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-espresso text-white py-3 rounded-full font-semibold flex items-center justify-center space-x-2 hover:bg-opacity-90 transition-all duration-300 disabled:opacity-50"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                {isSubmitting ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                ) : (
                  <>
                    <Send className="h-5 w-5" />
                    <span>Gửi tin nhắn</span>
                  </>
                )}
              </motion.button>
            </form>
          </motion.div>

          {/* Contact Info & Map */}
          <motion.div
            className="space-y-8"
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <div className="bg-white p-8 rounded-2xl shadow-xl">
              <h3 className="text-2xl font-bold text-espresso mb-6 font-poppins">
                Thông Tin Liên Hệ
              </h3>

              <div className="space-y-4">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-espresso rounded-full flex items-center justify-center">
                    <MapPin className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <div className="font-semibold text-espresso">Địa chỉ</div>
                    <div className="text-gray-600">123 Đường Nguyễn Huệ, Quận 1, TP.HCM</div>
                  </div>
                </div>

                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-espresso rounded-full flex items-center justify-center">
                    <Phone className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <div className="font-semibold text-espresso">Số điện thoại</div>
                    <div className="text-gray-600">0901 234 567</div>
                  </div>
                </div>

                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-espresso rounded-full flex items-center justify-center">
                    <Mail className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <div className="font-semibold text-espresso">Email</div>
                    <div className="text-gray-600">info@cafedaily.vn</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Google Map Embed */}
            <div className="bg-white p-4 rounded-2xl shadow-xl">
              <div className="w-full h-64 bg-gray-200 rounded-lg flex items-center justify-center">
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3919.4326461705!2d106.69312631534675!3d10.776889192318516!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x31752f38f9ed887b%3A0x14aded5703768989!2zUXXhuq1uIDEsIFRow6BuaCBwaOG7kSBI4buTIENow60gTWluaCwgVmnhu4d0IE5hbQ!5e0!3m2!1svi!2s!4v1635000000000!5m2!1svi!2s"
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  className="rounded-lg"
                ></iframe>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}