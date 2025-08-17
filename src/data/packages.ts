import { Package } from '../types';

export const packages: Package[] = [
  {
    id: '1',
    name: 'Gói Cơ Bản',
    price: 150000,
    description: 'Mỗi ngày một ly cà phê chất lượng',
    features: [
      '1 ly cà phê mỗi ngày',
      'Khung giờ: 7:00 - 18:00',
      'Giao hàng miễn phí',
      'Hỗ trợ 24/7'
    ],
    image: 'https://images.pexels.com/photos/302899/pexels-photo-302899.jpeg?auto=compress&cs=tinysrgb&w=400'
  },
  {
    id: '2',
    name: 'Gói Premium',
    price: 300000,
    description: 'Hai ly cà phê ngon mỗi ngày',
    features: [
      '2 ly cà phê mỗi ngày',
      'Khung giờ: 6:00 - 20:00',
      'Giao hàng miễn phí',
      'Ưu tiên hỗ trợ',
      'Tặng kèm bánh ngọt'
    ],
    image: 'https://images.pexels.com/photos/851555/pexels-photo-851555.jpeg?auto=compress&cs=tinysrgb&w=400',
    popular: true
  }
];