import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Clock, CheckCircle, XCircle, AlertCircle, Eye, Upload, MessageCircle, Copy, Check } from 'lucide-react';
import { orderService } from '../services/api';
import { useAuth } from '../context/AuthContext';

const MyOrders = () => {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [copiedId, setCopiedId] = useState(null);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await orderService.getAll();
        setOrders(response.data);
      } catch (error) {
        console.error('Error fetching orders:', error);
      }
      setLoading(false);
    };
    fetchOrders();
  }, []);

  const getStatusInfo = (status) => {
    const statusMap = {
      pending: { color: 'bg-yellow-100 text-yellow-700 border-yellow-300', icon: Clock, label: 'Menunggu Pembayaran', bg: 'bg-yellow-50' },
      waiting_confirmation: { color: 'bg-blue-100 text-blue-700 border-blue-300', icon: AlertCircle, label: 'Menunggu Konfirmasi', bg: 'bg-blue-50' },
      approved: { color: 'bg-purple-100 text-purple-700 border-purple-300', icon: CheckCircle, label: 'Disetujui - Kirim Akun', bg: 'bg-purple-50' },
      completed: { color: 'bg-green-100 text-green-700 border-green-300', icon: CheckCircle, label: 'Selesai', bg: 'bg-green-50' },
      rejected: { color: 'bg-red-100 text-red-700 border-red-300', icon: XCircle, label: 'Ditolak', bg: 'bg-red-50' },
      cancelled: { color: 'bg-gray-100 text-gray-700 border-gray-300', icon: XCircle, label: 'Dibatalkan', bg: 'bg-gray-50' },
      active: { color: 'bg-emerald-100 text-emerald-700 border-emerald-300', icon: Clock, label: 'Aktif', bg: 'bg-emerald-50' },
    };
    return statusMap[status] || statusMap.pending;
  };

  const copyCredentials = (id, text) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center pt-20">
        <div className="text-center">
          <p className="text-gray-500 mb-4">Silakan login untuk melihat pesanan</p>
          <Link to="/login" className="text-purple-600 font-medium hover:underline">Login</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-purple-50 to-blue-50 pt-28 pb-16">
      <div className="max-w-6xl mx-auto px-4">
        <h1 className="text-4xl font-black mb-2 bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-blue-600">
          Pesanan Saya
        </h1>
        <p className="text-gray-600 mb-8">Kelola semua pesanan dan pembayaran Anda</p>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
          </div>
        ) : orders.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-3xl shadow-lg">
            <div className="text-6xl mb-4">📦</div>
            <p className="text-gray-500 mb-4">Belum ada pesanan</p>
            <Link to="/catalog" className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-xl font-medium hover:shadow-lg transition-all">
              Lihat Katalog
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => {
              const statusInfo = getStatusInfo(order.status);
              const StatusIcon = statusInfo.icon;
              const orderCode = `AKH-${order.id}-${Date.now().toString(36).toUpperCase()}`;
              
              return (
                <div key={order.id} className={`${statusInfo.bg} rounded-3xl shadow-lg overflow-hidden border ${statusInfo.color.replace('100', '200').split(' ')[0]}`}>
                  <div className="p-6">
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                      <div className="flex items-start space-x-4">
                        <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-blue-500 rounded-2xl flex items-center justify-center shadow-lg">
                          <span className="text-3xl font-bold text-white opacity-50">{order.game_name?.charAt(0) || 'G'}</span>
                        </div>
                        <div>
                          <div className="text-sm text-purple-600 font-semibold">{order.game_name}</div>
                          <h3 className="font-bold text-xl">{order.account_title}</h3>
                          <div className="flex items-center space-x-4 text-sm text-gray-500 mt-1">
                            <span>Order #{order.id}</span>
                            <span>•</span>
                            <span>{new Date(order.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                          </div>
                          <div className="flex items-center mt-2">
                            <span className="text-xs bg-white/50 px-2 py-1 rounded-lg font-mono">Kode: AKH-{order.id}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center space-x-6">
                        <div className="text-right">
                          <div className="text-2xl font-black text-purple-600">Rp{parseInt(order.total_price).toLocaleString()}</div>
                          <div className="text-gray-500 text-sm">{order.duration_hours} jam</div>
                        </div>

                        <div className={`flex items-center px-4 py-2 rounded-xl border ${statusInfo.color}`}>
                          <StatusIcon className="w-5 h-5 mr-2" />
                          <span className="font-semibold">{statusInfo.label}</span>
                        </div>
                      </div>
                    </div>

                    {order.status === 'active' && order.account_credentials && (
                      <div className="mt-6 p-4 bg-white rounded-2xl border-2 border-green-200">
                        <div className="flex items-center justify-between mb-3">
                          <h4 className="font-bold text-green-700 flex items-center">
                            <CheckCircle className="w-5 h-5 mr-2" />
                            Akun Rental Anda
                          </h4>
                          <button
                            onClick={() => copyCredentials(order.id, order.account_credentials)}
                            className="flex items-center px-3 py-1 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors text-sm"
                          >
                            {copiedId === order.id ? <Check className="w-4 h-4 mr-1" /> : <Copy className="w-4 h-4 mr-1" />}
                            {copiedId === order.id ? 'Tersalin!' : 'Salin'}
                          </button>
                        </div>
                        <pre className="bg-gray-50 p-4 rounded-xl text-sm font-mono whitespace-pre-wrap">{order.account_credentials}</pre>
                        <p className="text-xs text-gray-500 mt-2">Waktu sewa: {order.duration_hours} jam sejak akun diterima</p>
                      </div>
                    )}

                    <div className="mt-6 flex flex-wrap gap-3">
                      {order.status === 'pending' && (
                        <>
                          <Link
                            to={`/payment/${order.id}`}
                            className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl font-medium hover:shadow-lg transition-all"
                          >
                            <Upload className="w-5 h-5 mr-2" />
                            Upload Bukti Bayar
                          </Link>
                          <a
                            href={`https://wa.me/6281532822792?text=${encodeURIComponent(`Halo Admin, saya ingin menyewa:\n\nAkun: ${order.account_title}\nDurasi: ${order.duration_hours} jam\nTotal: Rp${parseInt(order.total_price).toLocaleString()}\n\nKode Order: AKH-${order.id}`)}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center px-6 py-3 bg-green-500 text-white rounded-xl font-medium hover:bg-green-600 transition-all"
                          >
                            <MessageCircle className="w-5 h-5 mr-2" />
                            Chat WhatsApp
                          </a>
                        </>
                      )}
                      
                      {order.status === 'waiting_confirmation' && (
                        <a
                          href={`https://wa.me/6281532822792?text=${encodeURIComponent(`Halo Admin, saya sudah upload bukti pembayaran.\n\nOrder: AKH-${order.id}\nAkun: ${order.account_title}\nTotal: Rp${parseInt(order.total_price).toLocaleString()}\n\nMohon bantuannya untuk proses lebih lanjut!`)}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center px-6 py-3 bg-blue-500 text-white rounded-xl font-medium hover:bg-blue-600 transition-all"
                        >
                          <MessageCircle className="w-5 h-5 mr-2" />
                          Hubungi Admin
                        </a>
                      )}

                      {order.status === 'approved' && (
                        <a
                          href={`https://wa.me/6281532822792?text=${encodeURIComponent(`Halo Admin, saya sudah melihat pesanan disetujui.\n\nOrder: AKH-${order.id}\n\nBisa tolong kirimkan akunnya? Terima kasih!`)}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center px-6 py-3 bg-purple-500 text-white rounded-xl font-medium hover:bg-purple-600 transition-all"
                        >
                          <MessageCircle className="w-5 h-5 mr-2" />
                          Minta Akun
                        </a>
                      )}

                      <Link
                        to={`/account/${order.account_id}`}
                        className="inline-flex items-center px-6 py-3 bg-white border-2 border-gray-200 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-all"
                      >
                        <Eye className="w-5 h-5 mr-2" />
                        Lihat Detail
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyOrders;
