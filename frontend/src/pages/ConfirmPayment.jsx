import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle, Clock, Upload, MessageCircle, Image as ImageIcon, X, AlertCircle, Copy, Check, Search } from 'lucide-react';
import { orderService, uploadService } from '../services/api';
import { API_BASE_URL } from '../config';

const ConfirmPayment = () => {
  const navigate = useNavigate();
  const [code, setCode] = useState('');
  const [order, setOrder] = useState(null);
  const [notFound, setNotFound] = useState(false);
  const [loading, setLoading] = useState(false);
  const [searching, setSearching] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadedUrl, setUploadedUrl] = useState('');
  const [copied, setCopied] = useState(false);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!code.trim()) return;

    setSearching(true);
    setNotFound(false);
    setOrder(null);

    try {
      const response = await orderService.getByCode(code.toUpperCase());
      setOrder(response.data);
    } catch (error) {
      if (error.response?.status === 404) {
        setNotFound(true);
      }
    }
    setSearching(false);
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    try {
      const response = await uploadService.uploadImage(file);
      setUploadedUrl(response.data.url);
    } catch (error) {
      alert('Gagal upload bukti pembayaran');
    }
    setUploading(false);
  };

  const handleSubmit = async () => {
    if (!uploadedUrl) {
      alert('Silakan upload bukti pembayaran terlebih dahulu');
      return;
    }

    setLoading(true);
    try {
      await orderService.confirmPaymentByCode(code.toUpperCase(), { payment_proof: uploadedUrl });
      alert('Pembayaran berhasil dikonfirmasi! Admin akan segera memproses pesanan Anda.');
      navigate('/');
    } catch (error) {
      alert(error.response?.data?.message || 'Gagal mengkonfirmasi pembayaran');
    }
    setLoading(false);
  };

  const getStatusInfo = (status) => {
    const statusMap = {
      pending: { color: 'bg-yellow-100 text-yellow-700 border-yellow-300', icon: Clock, label: 'Menunggu Pembayaran', bg: 'bg-yellow-50' },
      waiting_confirmation: { color: 'bg-blue-100 text-blue-700 border-blue-300', icon: Clock, label: 'Menunggu Konfirmasi', bg: 'bg-blue-50' },
      approved: { color: 'bg-purple-100 text-purple-700 border-purple-300', icon: CheckCircle, label: 'Disetujui', bg: 'bg-purple-50' },
      completed: { color: 'bg-green-100 text-green-700 border-green-300', icon: CheckCircle, label: 'Selesai', bg: 'bg-green-50' },
      rejected: { color: 'bg-red-100 text-red-700 border-red-300', icon: AlertCircle, label: 'Ditolak', bg: 'bg-red-50' },
      active: { color: 'bg-emerald-100 text-emerald-700 border-emerald-300', icon: Clock, label: 'Aktif', bg: 'bg-emerald-50' },
    };
    return statusMap[status] || statusMap.pending;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-purple-50 to-blue-50 pt-28 pb-16">
      <div className="max-w-2xl mx-auto px-4">
        <div className="text-center mb-10">
          <div className="w-20 h-20 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl font-black mb-2 bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-blue-600">
            Konfirmasi Pembayaran
          </h1>
          <p className="text-gray-600">Masukkan kode konfirmasi yang Anda dapatkan setelah chat admin via WhatsApp</p>
        </div>

        <div className="bg-white rounded-3xl shadow-xl p-8 mb-8">
          <form onSubmit={handleSearch} className="mb-6">
            <label className="block text-sm font-semibold text-gray-700 mb-2">Kode Konfirmasi</label>
            <div className="flex gap-3">
              <input
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                placeholder="Contoh: AKH-X7K9M2PQ"
                className="flex-1 px-4 py-4 text-lg font-mono border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:ring-4 focus:ring-purple-100 transition-all"
              />
              <button
                type="submit"
                disabled={searching || !code.trim()}
                className="px-6 py-4 bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-xl font-semibold hover:shadow-lg disabled:opacity-50 flex items-center"
              >
                {searching ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                ) : (
                  <Search className="w-5 h-5" />
                )}
              </button>
            </div>
          </form>

          {notFound && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-xl flex items-center">
              <AlertCircle className="w-5 h-5 text-red-500 mr-3" />
              <span className="text-red-700">Kode konfirmasi tidak ditemukan. Pastikan kode yang dimasukkan benar.</span>
            </div>
          )}

          {order && (
            <div className="space-y-4">
              <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-2xl p-6 text-white text-center">
                <p className="text-purple-200 text-sm mb-2">Kode Konfirmasi Anda</p>
                <p className="text-4xl font-black font-mono tracking-wider">{order.confirmation_code}</p>
                <p className="text-purple-200 text-xs mt-2">Simpan kode ini untuk referensi</p>
              </div>

              <div className={`p-4 rounded-xl border-2 ${getStatusInfo(order.status).bg} ${getStatusInfo(order.status).color}`}>
                <div className="flex items-center">
                  {order.payment_confirmed ? (
                    <CheckCircle className="w-6 h-6 mr-3" />
                  ) : (
                    <Clock className="w-6 h-6 mr-3" />
                  )}
                  <div>
                    <p className="font-semibold">{getStatusInfo(order.status).label}</p>
                    <p className="text-sm opacity-80">Kode: {order.confirmation_code}</p>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-r from-purple-500 to-blue-600 rounded-2xl p-6 text-white">
                <div className="text-center">
                  <p className="text-purple-200 text-sm mb-1">Total Pembayaran</p>
                  <p className="text-4xl font-black">Rp{parseInt(order.total_price).toLocaleString()}</p>
                  <p className="text-purple-200 text-sm mt-2">
                    {order.game_name} - {order.account_title}
                  </p>
                </div>
              </div>

              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                <h3 className="font-semibold text-amber-800 mb-2">Transfer ke DANA:</h3>
                <div className="flex items-center justify-between bg-white p-3 rounded-lg">
                  <span className="font-mono text-lg font-bold">081532822792</span>
                  <button 
                    onClick={() => {
                      navigator.clipboard.writeText('081532822792');
                      setCopied(true);
                      setTimeout(() => setCopied(false), 2000);
                    }}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    {copied ? <Check className="w-5 h-5 text-green-500" /> : <Copy className="w-5 h-5 text-gray-600" />}
                  </button>
                </div>
                <p className="text-sm text-amber-700 mt-2">Transfer sesuai nominal di atas</p>
              </div>

              {!order.payment_confirmed && (
                <>
                  <div>
                    <h3 className="font-semibold mb-3">Upload Bukti Pembayaran</h3>
                    <input
                      type="file"
                      id="payment-proof"
                      onChange={handleFileUpload}
                      accept="image/*"
                      className="hidden"
                    />
                    
                    {uploadedUrl ? (
                      <div className="relative">
                        <img 
                          src={`${API_BASE_URL}${uploadedUrl}`}
                          alt="Bukti Pembayaran"
                          className="w-full h-48 object-cover rounded-2xl"
                        />
                        <button
                          onClick={() => setUploadedUrl('')}
                          className="absolute top-4 right-4 p-2 bg-red-500 text-white rounded-full hover:bg-red-600"
                        >
                          <X className="w-5 h-5" />
                        </button>
                        <div className="mt-3 p-3 bg-green-50 rounded-xl border border-green-200 flex items-center">
                          <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
                          <span className="text-green-700 font-medium">Bukti pembayaran berhasil diupload!</span>
                        </div>
                      </div>
                    ) : (
                      <label
                        htmlFor="payment-proof"
                        className={`block border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer hover:border-purple-500 transition-colors ${uploading ? 'opacity-50' : ''}`}
                      >
                        {uploading ? (
                          <div className="flex items-center justify-center">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mr-3"></div>
                            <span>Mengupload...</span>
                          </div>
                        ) : (
                          <>
                            <Upload className="w-12 h-12 mx-auto text-gray-400 mb-3" />
                            <p className="text-gray-600 font-medium">Klik untuk upload bukti transfer</p>
                            <p className="text-sm text-gray-400 mt-1">PNG, JPG (max 5MB)</p>
                          </>
                        )}
                      </label>
                    )}
                  </div>

                  <button
                    onClick={handleSubmit}
                    disabled={!uploadedUrl || loading}
                    className={`w-full py-4 rounded-2xl font-bold text-lg flex items-center justify-center transition-all ${
                      uploadedUrl && !loading
                        ? 'bg-gradient-to-r from-green-500 to-green-600 text-white hover:shadow-xl'
                        : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                    }`}
                  >
                    {loading ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                        Mengirim...
                      </>
                    ) : (
                      <>
                        <CheckCircle className="w-6 h-6 mr-2" />
                        Konfirmasi Pembayaran
                      </>
                    )}
                  </button>
                </>
              )}

              {order.payment_confirmed && (
                <div className="p-4 bg-green-50 rounded-xl border border-green-200 text-center">
                  <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-2" />
                  <p className="font-semibold text-green-700">Pembayaran sudah dikonfirmasi!</p>
                  <p className="text-sm text-green-600 mt-1">Mohon tunggu, admin akan segera memproses pesanan Anda.</p>
                </div>
              )}

              <a
                href={`https://wa.me/6281532822792?text=${encodeURIComponent(`Halo Admin, saya sudah konfirmasi pembayaran.\n\nKode: ${order.confirmation_code}\nAkun: ${order.account_title}\nTotal: Rp${parseInt(order.total_price).toLocaleString()}\n\nMohon bantuannya untuk proses lebih lanjut!`)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center w-full py-3 bg-green-500 text-white rounded-xl font-semibold hover:bg-green-600 transition-colors"
              >
                <MessageCircle className="w-5 h-5 mr-2" />
                Hubungi Admin via WhatsApp
              </a>
            </div>
          )}
        </div>

        <div className="text-center">
          <p className="text-gray-500 text-sm">
            Belum punya kode? <a href="https://wa.me/6281532822792" target="_blank" rel="noopener noreferrer" className="text-purple-600 font-semibold hover:underline">Hubungi Admin</a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default ConfirmPayment;
