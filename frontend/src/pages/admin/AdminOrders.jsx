import { useState, useEffect } from 'react';
import { CheckCircle, XCircle, Clock, Eye, MessageCircle, Send, ChevronDown, User, Copy, Check, X, Image as ImageIcon } from 'lucide-react';
import { adminService } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

const AdminOrders = () => {
  const { isAdmin } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [accountCredentials, setAccountCredentials] = useState('');
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await adminService.getOrders(filterStatus);
        setOrders(response.data);
      } catch (error) {
        console.error('Error fetching orders:', error);
      }
      setLoading(false);
    };
    fetchOrders();
  }, [filterStatus]);

  const getStatusInfo = (status) => {
    const statusMap = {
      pending: { color: 'bg-yellow-100 text-yellow-700 border-yellow-300', icon: Clock, label: 'Pending' },
      waiting_confirmation: { color: 'bg-blue-100 text-blue-700 border-blue-300', icon: Clock, label: 'Menunggu Konfirmasi' },
      approved: { color: 'bg-purple-100 text-purple-700 border-purple-300', icon: CheckCircle, label: 'Disetujui' },
      completed: { color: 'bg-green-100 text-green-700 border-green-300', icon: CheckCircle, label: 'Selesai' },
      rejected: { color: 'bg-red-100 text-red-700 border-red-300', icon: XCircle, label: 'Ditolak' },
      cancelled: { color: 'bg-gray-100 text-gray-700 border-gray-300', icon: XCircle, label: 'Dibatalkan' },
      active: { color: 'bg-emerald-100 text-emerald-700 border-emerald-300', icon: Clock, label: 'Aktif' },
    };
    return statusMap[status] || statusMap.pending;
  };

  const handleUpdateStatus = async (orderId, status, credentials = null) => {
    setUpdating(true);
    try {
      await adminService.updateOrderStatus(orderId, { status, account_credentials: credentials });
      setOrders(orders.map(o => o.id === orderId ? { ...o, status, account_credentials: credentials } : o));
      setShowModal(false);
      setSelectedOrder(null);
      setAccountCredentials('');
      alert(`Order berhasil diupdate ke status: ${status}`);
    } catch (error) {
      alert('Gagal mengupdate status');
    }
    setUpdating(false);
  };

  const openApproveModal = (order) => {
    setSelectedOrder(order);
    setShowModal(true);
  };

  if (!isAdmin) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-purple-50 to-blue-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-black">Kelola Pesanan</h1>
            <p className="text-gray-600">Proses pesanan dan kirim akun ke pembeli</p>
          </div>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-3 bg-white border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-purple-100 focus:border-purple-500"
          >
            <option value="">Semua Status</option>
            <option value="pending">Pending</option>
            <option value="waiting_confirmation">Menunggu Konfirmasi</option>
            <option value="approved">Disetujui</option>
            <option value="active">Aktif</option>
            <option value="completed">Selesai</option>
            <option value="rejected">Ditolak</option>
          </select>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
          </div>
        ) : orders.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-3xl shadow-lg">
            <p className="text-gray-500">Tidak ada pesanan</p>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => {
              const statusInfo = getStatusInfo(order.status);
              const StatusIcon = statusInfo.icon;
              
              return (
                <div key={order.id} className="bg-white rounded-2xl shadow-lg overflow-hidden">
                  <div className="p-6">
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                      <div className="flex items-start space-x-4">
                        <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-blue-500 rounded-xl flex items-center justify-center">
                          <span className="text-2xl font-bold text-white opacity-50">{order.game_name?.charAt(0) || 'G'}</span>
                        </div>
                        <div>
                          <div className="flex items-center space-x-2 mb-1">
                            <span className="text-sm text-purple-600 font-semibold">{order.game_name}</span>
                            <span className={`px-2 py-0.5 rounded-full text-xs font-medium border ${statusInfo.color}`}>
                              <StatusIcon className="w-3 h-3 inline mr-1" />
                              {statusInfo.label}
                            </span>
                          </div>
                          <h3 className="font-bold text-lg">{order.account_title}</h3>
                          <div className="flex items-center gap-3 mt-1">
                            <span className="px-3 py-1 bg-gradient-to-r from-pink-500 to-purple-500 text-white rounded-lg text-sm font-mono font-bold">
                              {order.confirmation_code || 'N/A'}
                            </span>
                            {order.payment_confirmed ? (
                              <span className="px-2 py-1 bg-green-100 text-green-700 rounded-lg text-xs font-medium flex items-center">
                                <CheckCircle className="w-3 h-3 mr-1" />
                                Lunas
                              </span>
                            ) : (
                              <span className="px-2 py-1 bg-amber-100 text-amber-700 rounded-lg text-xs font-medium">
                                Belum Bayar
                              </span>
                            )}
                          </div>
                          <div className="flex items-center mt-2 space-x-4 text-sm text-gray-500">
                            <span className="flex items-center">
                              <User className="w-4 h-4 mr-1" />
                              {order.username || 'User'}
                            </span>
                            {order.whatsapp && (
                              <a 
                                href={`https://wa.me/${order.whatsapp.replace(/[^0-9]/g, '')}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center text-green-600 hover:text-green-700"
                              >
                                <MessageCircle className="w-4 h-4 mr-1" />
                                {order.whatsapp}
                              </a>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center space-x-6">
                        <div className="text-right">
                          <div className="text-xl font-bold text-purple-600">Rp{parseInt(order.total_price).toLocaleString()}</div>
                          <div className="text-gray-500 text-sm">{order.duration_hours} jam</div>
                          <div className="text-gray-400 text-xs">{new Date(order.created_at).toLocaleDateString('id-ID')}</div>
                        </div>

                        <div className="flex space-x-2">
                          <button
                            onClick={() => openApproveModal(order)}
                            className="p-3 bg-green-100 text-green-600 rounded-xl hover:bg-green-200 transition-colors"
                            title="Proses Order"
                          >
                            <Send className="w-5 h-5" />
                          </button>
                        </div>
                      </div>
                    </div>

                    {order.payment_proof && (
                      <div className="mt-4 p-4 bg-blue-50 rounded-xl">
                        <p className="text-sm font-semibold text-blue-700 mb-2 flex items-center">
                          <ImageIcon className="w-4 h-4 mr-2" />
                          Bukti Pembayaran:
                        </p>
                        <img 
                          src={`http://localhost:5000${order.payment_proof}`}
                          alt="Bukti Pembayaran"
                          className="max-w-xs h-32 object-cover rounded-lg cursor-pointer hover:scale-105 transition-transform"
                          onClick={() => window.open(`http://localhost:5000${order.payment_proof}`, '_blank')}
                        />
                      </div>
                    )}

                    {order.account_credentials && (
                      <div className="mt-4 p-4 bg-green-50 rounded-xl border border-green-200">
                        <p className="text-sm font-semibold text-green-700 mb-2">Akun yang Dikirim:</p>
                        <pre className="bg-white p-3 rounded-lg text-sm font-mono">{order.account_credentials}</pre>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {showModal && selectedOrder && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b flex justify-between items-center">
              <div>
                <h2 className="text-xl font-bold">Proses Pesanan</h2>
                <p className="text-sm text-gray-500">Order #{selectedOrder.id} - AKH-{selectedOrder.id}</p>
              </div>
              <button onClick={() => { setShowModal(false); setSelectedOrder(null); }} className="p-2 hover:bg-gray-100 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6 space-y-4">
              <div className="bg-gray-50 rounded-xl p-4">
                <h3 className="font-semibold mb-2">Detail Pesanan</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Kode:</span>
                    <span className="font-mono font-bold text-pink-600">{selectedOrder.confirmation_code || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Game:</span>
                    <span className="font-medium">{selectedOrder.game_name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Akun:</span>
                    <span className="font-medium">{selectedOrder.account_title}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Durasi:</span>
                    <span className="font-medium">{selectedOrder.duration_hours} jam</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Total:</span>
                    <span className="font-bold text-purple-600">Rp{parseInt(selectedOrder.total_price).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">User:</span>
                    <span className="font-medium">{selectedOrder.username}</span>
                  </div>
                  {selectedOrder.whatsapp && (
                    <div className="flex justify-between">
                      <span className="text-gray-500">WhatsApp:</span>
                      <a href={`https://wa.me/${selectedOrder.whatsapp.replace(/[^0-9]/g, '')}`} target="_blank" className="text-green-600 font-medium">{selectedOrder.whatsapp}</a>
                    </div>
                  )}
                </div>
              </div>

              {selectedOrder.status === 'pending' || selectedOrder.status === 'waiting_confirmation' ? (
                <>
                  <div>
                    <label className="block text-sm font-semibold mb-2">Akun Game (Username & Password)</label>
                    <textarea
                      value={accountCredentials}
                      onChange={(e) => setAccountCredentials(e.target.value)}
                      placeholder={`Username: gameaccount123\nPassword: secretpass123`}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:ring-0"
                      rows="4"
                    />
                  </div>

                  <div className="flex flex-col space-y-3">
                    <button
                      onClick={() => handleUpdateStatus(selectedOrder.id, 'approved', accountCredentials)}
                      disabled={updating || !accountCredentials}
                      className="w-full py-3 bg-purple-500 text-white rounded-xl font-semibold hover:bg-purple-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                    >
                      {updating ? 'Memproses...' : '✓ Setujui & Kirim Akun'}
                    </button>
                    <button
                      onClick={() => handleUpdateStatus(selectedOrder.id, 'rejected')}
                      disabled={updating}
                      className="w-full py-3 bg-red-500 text-white rounded-xl font-semibold hover:bg-red-600 disabled:opacity-50 flex items-center justify-center"
                    >
                      <XCircle className="w-5 h-5 mr-2" />
                      Tolak Pesanan
                    </button>
                  </div>
                </>
              ) : selectedOrder.status === 'approved' || selectedOrder.status === 'active' ? (
                <div className="space-y-3">
                  <div className="p-4 bg-green-50 rounded-xl border border-green-200">
                    <p className="text-sm text-green-700">
                      {selectedOrder.status === 'approved' ? 'Akun sudah disetujui.' : 'Pesanan sedang aktif.'}
                    </p>
                  </div>
                  <button
                    onClick={() => handleUpdateStatus(selectedOrder.id, 'completed')}
                    disabled={updating}
                    className="w-full py-3 bg-blue-500 text-white rounded-xl font-semibold hover:bg-blue-600 disabled:opacity-50 flex items-center justify-center"
                  >
                    <CheckCircle className="w-5 h-5 mr-2" />
                    Tandai Selesai
                  </button>
                  {selectedOrder.status === 'approved' && (
                    <button
                      onClick={() => handleUpdateStatus(selectedOrder.id, 'active', selectedOrder.account_credentials)}
                      disabled={updating}
                      className="w-full py-3 bg-green-500 text-white rounded-xl font-semibold hover:bg-green-600 disabled:opacity-50 flex items-center justify-center"
                    >
                      <CheckCircle className="w-5 h-5 mr-2" />
                      Tandai Aktif
                    </button>
                  )}
                </div>
              ) : null}

              <div className="pt-4 border-t">
                <a
                  href={`https://wa.me/${(selectedOrder.whatsapp || '6281532822792').replace(/[^0-9]/g, '')}?text=${encodeURIComponent(`Halo ${selectedOrder.username}!

Order AKH-${selectedOrder.id} sedang diproses.

${selectedOrder.status === 'approved' ? `Akun kamu:\n${selectedOrder.account_credentials}\n\nDurasi sewa: ${selectedOrder.duration_hours} jam\n\nNikmati gamenya! 🎮` : 'Mohon tunggu, pesanan akan segera diproses.'}`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center w-full py-3 bg-green-500 text-white rounded-xl font-semibold hover:bg-green-600 transition-colors"
                >
                  <MessageCircle className="w-5 h-5 mr-2" />
                  Hubungi via WhatsApp
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminOrders;
