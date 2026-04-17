import { useState, useEffect } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { CreditCard, Smartphone, QrCode, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import { accountService, orderService, paymentService } from '../services/api';
import { useAuth } from '../context/AuthContext';

const Checkout = () => {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [account, setAccount] = useState(null);
  const [duration, setDuration] = useState(1);
  const [paymentMethod, setPaymentMethod] = useState('dana');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [orderCreated, setOrderCreated] = useState(false);
  const [orderId, setOrderId] = useState(null);
  const [showQris, setShowQris] = useState(false);
  const [qrisData, setQrisData] = useState(null);

  useEffect(() => {
    const fetchAccount = async () => {
      try {
        const response = await accountService.getById(id);
        setAccount(response.data);
        const dur = parseInt(searchParams.get('duration')) || 1;
        setDuration(dur);
      } catch (error) {
        console.error('Error fetching account:', error);
        navigate('/catalog');
      }
      setLoading(false);
    };
    fetchAccount();
  }, [id, searchParams, navigate]);

  const totalPrice = account ? duration * parseFloat(account.price_per_hour) : 0;

  const handleCreateOrder = async () => {
    setSubmitting(true);
    try {
      const response = await orderService.create({
        account_id: parseInt(id),
        duration_hours: duration,
        payment_method: paymentMethod,
      });
      setOrderId(response.data.id);
      setOrderCreated(true);

      if (paymentMethod === 'qris') {
        const qrisResponse = await paymentService.generateQris({
          amount: totalPrice,
          order_id: response.data.id,
        });
        setQrisData(qrisResponse.data);
        setShowQris(true);
      }
    } catch (error) {
      alert(error.response?.data?.message || 'Gagal membuat pesanan');
    }
    setSubmitting(false);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  if (!account) return null;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-3xl font-bold mb-8">Checkout</h1>

        <div className="grid md:grid-cols-2 gap-8">
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-semibold mb-4">Detail Akun</h2>
              <div className="flex items-start space-x-4">
                <div className="w-24 h-24 bg-gradient-to-br from-purple-500 to-blue-500 rounded-lg flex items-center justify-center">
                  <span className="text-3xl font-bold text-white opacity-50">{account.game_name?.charAt(0) || 'G'}</span>
                </div>
                <div>
                  <div className="text-sm text-purple-600 font-medium">{account.game_name}</div>
                  <h3 className="font-semibold text-lg">{account.title}</h3>
                  {account.rank && <p className="text-gray-500">Rank: {account.rank}</p>}
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-semibold mb-4">Metode Pembayaran</h2>
              <div className="space-y-3">
                <label className={`flex items-center p-4 border rounded-xl cursor-pointer transition ${paymentMethod === 'dana' ? 'border-purple-500 bg-purple-50' : 'border-gray-200 hover:border-purple-300'}`}>
                  <input
                    type="radio"
                    name="payment"
                    value="dana"
                    checked={paymentMethod === 'dana'}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="mr-3"
                  />
                  <Smartphone className="w-6 h-6 text-blue-500 mr-3" />
                  <div>
                    <div className="font-semibold">DANA</div>
                    <div className="text-sm text-gray-500">Bayar melalui aplikasi DANA</div>
                  </div>
                </label>

                <label className={`flex items-center p-4 border rounded-xl cursor-pointer transition ${paymentMethod === 'qris' ? 'border-purple-500 bg-purple-50' : 'border-gray-200 hover:border-purple-300'}`}>
                  <input
                    type="radio"
                    name="payment"
                    value="qris"
                    checked={paymentMethod === 'qris'}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="mr-3"
                  />
                  <QrCode className="w-6 h-6 text-green-500 mr-3" />
                  <div>
                    <div className="font-semibold">QRIS</div>
                    <div className="text-sm text-gray-500">Scan QR untuk bayar dari berbagai aplikasi</div>
                  </div>
                </label>
              </div>
            </div>

            {showQris && qrisData && (
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h2 className="text-xl font-semibold mb-4">Scan QRIS</h2>
                <div className="bg-gray-100 p-4 rounded-xl text-center">
                  <div className="bg-white p-4 rounded-lg inline-block mb-4">
                    <QrCode className="w-48 h-48 text-gray-800" />
                  </div>
                  <p className="text-gray-600">Scan QR code di atas dengan aplikasi e-wallet atau mobile banking</p>
                  <p className="text-xl font-bold text-purple-600 mt-2">Rp{totalPrice.toLocaleString()}</p>
                </div>
              </div>
            )}
          </div>

          <div>
            <div className="bg-white rounded-xl shadow-lg p-6 sticky top-24">
              <h2 className="text-xl font-semibold mb-6">Ringkasan Pesanan</h2>
              
              <div className="space-y-4 mb-6">
                <div className="flex justify-between">
                  <span className="text-gray-600">Durasi</span>
                  <span className="font-medium">{duration} jam</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Harga per jam</span>
                  <span className="font-medium">Rp{parseInt(account.price_per_hour).toLocaleString()}</span>
                </div>
                <div className="border-t pt-4 flex justify-between items-center">
                  <span className="text-lg font-semibold">Total</span>
                  <span className="text-2xl font-bold text-purple-600">Rp{totalPrice.toLocaleString()}</span>
                </div>
              </div>

              {orderCreated ? (
                <div className="space-y-4">
                  <div className="p-4 bg-green-50 rounded-xl border border-green-200">
                    <div className="flex items-center text-green-700">
                      <CheckCircle className="w-6 h-6 mr-2" />
                      <span className="font-semibold">Pesanan berhasil dibuat!</span>
                    </div>
                    <p className="text-sm text-green-600 mt-2">Order ID: #{orderId}</p>
                  </div>

                  <div className="p-4 bg-yellow-50 rounded-xl border border-yellow-200">
                    <div className="flex items-center text-yellow-700">
                      <AlertCircle className="w-6 h-6 mr-2" />
                      <span className="font-semibold">Lakukan Pembayaran</span>
                    </div>
                    <p className="text-sm text-yellow-600 mt-2">
                      {paymentMethod === 'dana' 
                        ? `Transfer ke nomor DANA: 0812-3456-7890\nDengan nominal: Rp${totalPrice.toLocaleString()}`
                        : 'Scan QRIS di sebelah kiri, lalu upload bukti transfer.'}
                    </p>
                  </div>

                  <button
                    onClick={() => navigate('/my-orders')}
                    className="w-full py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl font-semibold hover:opacity-90 transition"
                  >
                    Lihat Pesanan Saya
                  </button>
                </div>
              ) : (
                <button
                  onClick={handleCreateOrder}
                  disabled={submitting}
                  className="w-full py-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl font-semibold hover:opacity-90 transition disabled:opacity-50"
                >
                  {submitting ? 'Memproses...' : 'Buat Pesanan'}
                </button>
              )}

              <div className="mt-6 p-4 bg-gray-50 rounded-xl">
                <h3 className="font-semibold mb-2">Informasi Penting:</h3>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li className="flex items-start">
                    <Clock className="w-4 h-4 mr-2 mt-0.5 text-purple-500" />
                    Akun akan dikirim via WhatsApp setelah pembayaran dikonfirmasi
                  </li>
                  <li className="flex items-start">
                    <Clock className="w-4 h-4 mr-2 mt-0.5 text-purple-500" />
                    Waktu sewa dimulai setelah akun diterima
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
