import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Upload, CheckCircle, Clock, MessageCircle, Image as ImageIcon, X, AlertCircle, Copy, Check } from 'lucide-react';
import { orderService, uploadService } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { API_BASE_URL } from '../config';

const PaymentProof = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [paymentProof, setPaymentProof] = useState(null);
  const [uploadedUrl, setUploadedUrl] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const response = await orderService.getById(orderId);
        setOrder(response.data);
        if (response.data.payment_proof) {
          setUploadedUrl(response.data.payment_proof);
        }
      } catch (error) {
        console.error('Error fetching order:', error);
        alert('Pesanan tidak ditemukan');
        navigate('/my-orders');
      }
      setLoading(false);
    };
    if (orderId) {
      fetchOrder();
    }
  }, [orderId, navigate]);

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    try {
      const response = await uploadService.uploadImage(file);
      setUploadedUrl(response.data.url);
      setPaymentProof(file);
    } catch (error) {
      alert('Gagal upload bukti pembayaran');
      console.error(error);
    }
    setUploading(false);
  };

  const handleSubmit = async () => {
    if (!uploadedUrl) {
      alert('Silakan upload bukti pembayaran terlebih dahulu');
      return;
    }

    setSubmitting(true);
    try {
      await orderService.confirmPayment(orderId, { payment_proof: uploadedUrl });
      alert('Bukti pembayaran berhasil dikirim! Admin akan segera memproses pesanan Anda.');
      navigate('/my-orders');
    } catch (error) {
      alert('Gagal mengirim bukti pembayaran');
    }
    setSubmitting(false);
  };

  const copyOrderCode = () => {
    navigator.clipboard.writeText(`AKH-${orderId}-${Date.now().toString(36).toUpperCase()}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 pt-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  if (!order) return null;

  const totalPrice = parseInt(order.total_price);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-purple-50 to-blue-50 pt-28 pb-16">
      <div className="max-w-2xl mx-auto px-4">
        <button 
          onClick={() => navigate('/my-orders')}
          className="mb-6 flex items-center text-gray-600 hover:text-purple-600 transition-colors"
        >
          <X className="w-5 h-5 mr-1" />
          Kembali
        </button>

        <div className="bg-white rounded-3xl shadow-xl p-8">
          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-3xl font-black mb-2">Konfirmasi Pembayaran</h1>
            <p className="text-gray-600">Lengkapi pembayaran dan upload bukti transfer</p>
          </div>

          <div className="bg-gradient-to-r from-purple-500 to-blue-600 rounded-2xl p-6 text-white mb-8">
            <div className="text-center">
              <p className="text-purple-200 text-sm mb-1">Total Pembayaran</p>
              <p className="text-4xl font-black">Rp{totalPrice.toLocaleString()}</p>
              <p className="text-purple-200 text-sm mt-2">
                Durasi: {order.duration_hours} jam | {order.account_title}
              </p>
            </div>
          </div>

          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 mb-8">
            <h3 className="font-bold text-lg text-amber-800 mb-4 flex items-center">
              <AlertCircle className="w-5 h-5 mr-2" />
              Cara Pembayaran
            </h3>
            <div className="space-y-4">
              <div className="bg-white rounded-xl p-4">
                <p className="font-semibold text-gray-800 mb-2">Transfer ke DANA:</p>
                <div className="flex items-center justify-between bg-gray-50 p-3 rounded-lg">
                  <span className="font-mono text-lg font-bold">081532822792</span>
                  <button 
                    onClick={() => navigator.clipboard.writeText('081532822792')}
                    className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
                  >
                    <Copy className="w-5 h-5 text-gray-600" />
                  </button>
                </div>
              </div>
              <p className="text-sm text-amber-700">
                <strong>Note:</strong> Transfer sesuai nominal di atas. Kode unik akan membantu verifikasi.
              </p>
            </div>
          </div>

          <div className="mb-8">
            <h3 className="font-bold text-lg mb-4">Upload Bukti Pembayaran</h3>
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
                  className="w-full h-64 object-cover rounded-2xl"
                />
                <button
                  onClick={() => { setUploadedUrl(''); setPaymentProof(null); }}
                  className="absolute top-4 right-4 p-2 bg-red-500 text-white rounded-full hover:bg-red-600"
                >
                  <X className="w-5 h-5" />
                </button>
                <div className="mt-4 p-4 bg-green-50 rounded-xl border border-green-200 flex items-center">
                  <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
                  <span className="text-green-700 font-medium">Bukti pembayaran berhasil diupload!</span>
                </div>
              </div>
            ) : (
              <label
                htmlFor="payment-proof"
                className={`block border-2 border-dashed rounded-2xl p-12 text-center cursor-pointer hover:border-purple-500 transition-colors ${uploading ? 'opacity-50' : ''}`}
              >
                {uploading ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mr-3"></div>
                    <span>Mengupload...</span>
                  </div>
                ) : (
                  <>
                    <Upload className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                    <p className="text-gray-600 font-medium">Klik untuk upload bukti transfer</p>
                    <p className="text-sm text-gray-400 mt-2">PNG, JPG (max 5MB)</p>
                  </>
                )}
              </label>
            )}
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-2xl p-6 mb-8">
            <h3 className="font-bold text-lg text-blue-800 mb-4 flex items-center">
              <MessageCircle className="w-5 h-5 mr-2" />
              Hubungi Admin via WhatsApp
            </h3>
            <p className="text-sm text-blue-700 mb-4">
              Setelah transfer, silakan hubungi admin untuk konfirmasi lebih cepat.
            </p>
            <a
              href={`https://wa.me/6281532822792?text=${encodeURIComponent(`Halo Admin Akhyan Rental!

Saya sudah transfer untuk pesanan:
- Akun: ${order.account_title}
- Durasi: ${order.duration_hours} jam
- Total: Rp${totalPrice.toLocaleString()}
- Order ID: #${orderId}

Mohon bantuannya untuk proses selanjutnya. Terima kasih!`)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center px-6 py-3 bg-green-500 text-white rounded-xl font-medium hover:bg-green-600 transition-colors"
            >
              <MessageCircle className="w-5 h-5 mr-2" />
              Chat WhatsApp
            </a>
          </div>

          <button
            onClick={handleSubmit}
            disabled={!uploadedUrl || submitting}
            className={`w-full py-4 rounded-2xl font-bold text-lg flex items-center justify-center transition-all ${
              uploadedUrl && !submitting
                ? 'bg-gradient-to-r from-purple-500 to-blue-600 text-white hover:shadow-xl'
                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
            }`}
          >
            {submitting ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                Mengirim...
              </>
            ) : (
              <>
                <CheckCircle className="w-6 h-6 mr-2" />
                Kirim Bukti Pembayaran
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default PaymentProof;
