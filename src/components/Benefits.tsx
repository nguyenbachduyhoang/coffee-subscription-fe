import React from 'react';
import { motion } from 'framer-motion';
import { DollarSign, Zap, Coffee, Gift } from 'lucide-react';

export function Benefits() {
  const benefits = [
    {
      icon: DollarSign,
      title: 'Tiết Kiệm',
      description: 'Giá ưu đãi so với mua lẻ, tiết kiệm đến 30% chi phí cà phê hàng ngày.'
    },
    {
      icon: Zap,
      title: 'Tiện Lợi',
      description: 'Giao hàng tận nơi đúng giờ, không cần ra ngoài hay xếp hàng chờ đợi.'
    },
    {
      icon: Coffee,
      title: 'Chất Lượng',
      description: 'Cà phê premium từ những vùng trồng uy tín, rang xay tươi mỗi ngày.'
    },
    {
      icon: Gift,
      title: 'Tích Điểm',
      description: 'Hệ thống tích điểm thưởng, đổi quà tặng và nhận ưu đãi đặc biệt.'
    }
  ];

  return (
    <section id="benefits" className="py-20 bg-white">
      <div className="container mx-auto px-4">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <h2 className="text-4xl md:text-5xl font-bold text-espresso mb-4 font-poppins">
            Tại Sao Chọn CafeDaily?
          </h2>
          <p className="text-lg text-gray-700 max-w-2xl mx-auto">
            Chúng tôi mang đến trải nghiệm cà phê tuyệt vời với nhiều lợi ích vượt trội.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {benefits.map((benefit, index) => (
            <motion.div
              key={index}
              className="text-center p-6 rounded-2xl bg-latte hover:bg-beige transition-all duration-300 shadow-lg hover:shadow-xl"
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
              whileHover={{ y: -10 }}
            >
              <motion.div
                className="w-16 h-16 bg-espresso rounded-full flex items-center justify-center mx-auto mb-4"
                whileHover={{ rotate: 360 }}
                transition={{ duration: 0.6 }}
              >
                <benefit.icon className="h-8 w-8 text-white" />
              </motion.div>
              
              <h3 className="text-xl font-bold text-espresso mb-3 font-poppins">
                {benefit.title}
              </h3>
              
              <p className="text-gray-700 leading-relaxed">
                {benefit.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}