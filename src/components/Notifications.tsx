import { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { getMyNotifications, NotificationItem } from '../utils/notificationsAPI';

const formatRelativeTime = (iso?: string): string => {
  if (!iso) return '';
  const now = Date.now();
  const then = new Date(iso).getTime();
  const diff = Math.max(0, Math.floor((now - then) / 1000));
  if (diff < 60) return `${diff}s trước`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m trước`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h trước`;
  return new Date(iso).toLocaleString();
};

const EmptyState = ({ onRefresh }: { onRefresh: () => void }) => (
  <div className="text-center py-16 bg-white/60 rounded-xl border border-gray-200">
    <div className="text-5xl mb-3">☕</div>
    <p className="text-gray-600 mb-4">Hiện chưa có thông báo nào</p>
    <button
      onClick={onRefresh}
      className="px-4 py-2 rounded-lg bg-espresso text-white hover:opacity-90"
    >
      Tải lại
    </button>
  </div>
);

const LoadingState = () => (
  <div className="py-8 animate-pulse text-gray-500">Đang tải thông báo...</div>
);

const ErrorState = ({ message, onRetry }: { message: string; onRetry: () => void }) => (
  <div className="py-4 text-red-600 flex items-center justify-between">
    <span>{message}</span>
    <button onClick={onRetry} className="text-sm px-3 py-1 rounded bg-red-600 text-white">Thử lại</button>
  </div>
);

const typeToStyle = (type?: string) => {
  const t = (type || '').toLowerCase();
  if (t.includes('promo') || t.includes('offer')) return { badge: 'bg-pink-100 text-pink-700', dot: 'bg-pink-500' };
  if (t.includes('warning')) return { badge: 'bg-amber-100 text-amber-800', dot: 'bg-amber-500' };
  if (t.includes('error') || t.includes('fail')) return { badge: 'bg-red-100 text-red-700', dot: 'bg-red-500' };
  if (t.includes('system')) return { badge: 'bg-indigo-100 text-indigo-700', dot: 'bg-indigo-500' };
  return { badge: 'bg-emerald-100 text-emerald-700', dot: 'bg-emerald-500' };
};

export const NotificationCard = ({ item }: { item: NotificationItem }) => {
  const styles = typeToStyle(item.type);
  return (
    <div className="group rounded-xl border border-gray-200 p-4 bg-white shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-start gap-4">
        <span className={`mt-2 h-2.5 w-2.5 rounded-full ${item.isRead === false ? styles.dot : 'bg-gray-300'}`} />
        <div className="flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h4 className="font-semibold text-gray-900">{item.title || 'Thông báo'}</h4>
            {item.type && (
              <span className={`text-xs px-2 py-0.5 rounded-full ${styles.badge}`}>{item.type}</span>
            )}
          </div>
          <p className="mt-1 text-gray-700 leading-relaxed">{item.message || item.content}</p>
          <div className="mt-2 flex items-center gap-3 text-sm text-gray-500">
            {item.createdAt && <span>{formatRelativeTime(item.createdAt)}</span>}
            {item.link && (
              <a href={item.link} className="text-indigo-600 hover:underline">Xem chi tiết</a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export function NotificationsView({ variant = 'page' }: { variant?: 'page' | 'panel' } = {}) {
  const [items, setItems] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');
  const [query, setQuery] = useState<string>('');

  const fetchData = async () => {
    setError(null);
    setLoading(true);
    try {
      const data = await getMyNotifications();
      setItems(data);
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : 'Không thể tải thông báo.';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const filtered = useMemo(() => {
    const base = filter === 'unread' ? items.filter(n => n.isRead === false) : items;
    if (!query.trim()) return base;
    const q = query.toLowerCase();
    return base.filter(n => `${n.title ?? ''} ${n.message ?? n.content ?? ''}`.toLowerCase().includes(q));
  }, [items, filter, query]);

  const grouped = useMemo(() => {
    const map = new Map<string, NotificationItem[]>();
    for (const it of filtered) {
      const key = it.createdAt ? new Date(it.createdAt).toDateString() : 'Khác';
      const arr = map.get(key) || [];
      arr.push(it);
      map.set(key, arr);
    }
    return Array.from(map.entries()).sort((a, b) => new Date(b[0]).getTime() - new Date(a[0]).getTime());
  }, [filtered]);

  const unreadCount = items.filter(n => n.isRead === false).length;

  const content = (
    <div className="rounded-2xl overflow-hidden shadow-sm border border-gray-200 bg-gradient-to-br from-beige/30 to-white">
        <div className="px-6 py-5 border-b border-gray-200 flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between bg-white/70 backdrop-blur">
          <div>
            <h3 className="text-2xl font-bold text-espresso">Thông báo</h3>
            <p className="text-sm text-gray-500">{unreadCount} chưa đọc</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-lg px-2">
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Tìm kiếm..."
                className="px-2 py-2 outline-none text-sm bg-transparent"
              />
            </div>
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value as 'all' | 'unread')}
              className="px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm"
            >
              <option value="all">Tất cả</option>
              <option value="unread">Chưa đọc</option>
            </select>
            <button onClick={fetchData} className="px-3 py-2 rounded-lg bg-espresso text-white text-sm hover:opacity-90">
              Làm mới
            </button>
          </div>
        </div>

        <div className="p-6">
          {loading && <LoadingState />}
          {!loading && error && <ErrorState message={error} onRetry={fetchData} />}
          {!loading && !error && filtered.length === 0 && <EmptyState onRefresh={fetchData} />}
          {!loading && !error && filtered.length > 0 && (
            <div className="space-y-6">
              {grouped.map(([day, arr]) => (
                <div key={day} className="space-y-3">
                  <div className="text-sm font-medium text-gray-500">{day}</div>
                  {arr.map(item => (
                    <NotificationCard key={(item.id ?? `${item.createdAt}-${Math.random()}`).toString()} item={item} />
                  ))}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
  );

  if (variant === 'panel') {
    return content;
  }
  return (
    <section className="max-w-3xl mx-auto px-4 py-8">{content}</section>
  );
}

export default function Notifications() {
  // Keep default export for existing route/section usage
  return <NotificationsView />;
}

export function NotificationsModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            className="w-full max-w-3xl bg-white rounded-2xl shadow-2xl overflow-hidden"
            initial={{ y: 40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 40, opacity: 0 }}
            transition={{ type: 'spring', damping: 20, stiffness: 250 }}
            onClick={(e) => e.stopPropagation()}
          >
            <NotificationsView />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export function NotificationsPopover({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <div className="absolute inset-0" />
          <motion.div
            className="absolute top-16 right-6 w-[420px] max-w-[92vw] max-h-[75vh] overflow-auto rounded-2xl shadow-2xl border bg-white"
            initial={{ y: -8, opacity: 0, scale: 0.98 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: -8, opacity: 0, scale: 0.98 }}
            transition={{ type: 'spring', damping: 20, stiffness: 250 }}
            onClick={(e) => e.stopPropagation()}
          >
            <NotificationsView variant="panel" />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}


