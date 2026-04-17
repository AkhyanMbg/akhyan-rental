import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Star, Users, Shirt, Clock, Shield, CheckCircle, AlertCircle, ChevronLeft, ChevronRight, Heart, Share2, MessageCircle, Loader2 } from 'lucide-react';
import { accountService, orderService } from '../services/api';
import { useAuth } from '../context/AuthContext';

const AccountDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [account, setAccount] = useState(null);
  const [duration, setDuration] = useState(1);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [creatingOrder, setCreatingOrder] = useState(false);

  useEffect(() => {
    const fetchAccount = async () => {
      try {
        const response = await accountService.getById(id);
        setAccount(response.data);
      } catch (error) {
        console.error('Error fetching account:', error);
        navigate('/catalog');
      }
      setLoading(false);
    };
    fetchAccount();
  }, [id, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="relative w-20 h-20 mx-auto mb-4">
            <div className="absolute inset-0 border-4 border-purple-200 rounded-full"></div>
            <div className="absolute inset-0 border-4 border-purple-600 rounded-full border-t-transparent animate-spin"></div>
          </div>
          <p className="text-gray-600 font-medium">Memuat detail akun...</p>
        </div>
      </div>
    );
  }

  if (!account) return null;

  const totalPrice = duration * parseFloat(account.price_per_hour);

  const handleRent = async () => {
    if (!user) {
      navigate('/login');
      return;
    }

    setCreatingOrder(true);
    try {
      const response = await orderService.create({
        account_id: account.id,
        duration_hours: duration,
        payment_method: 'dana'
      });
      
      const confirmationCode = response.data.confirmation_code;

      const message = `Halo Admin Akhyan Rental! 👋

Saya ingin menyewa akun game dengan detail berikut:

📋 *Detail Pesanan*
🎫 Kode Konfirmasi: *${confirmationCode}*
Game: ${account.game_name}
Akun: ${account.title}
Rank: ${account.rank || '-'}
Durasi: ${duration} jam
Total Harga: Rp${totalPrice.toLocaleString()}

👤 *Data Pemesan*
Nama: ${user.username}
Email: ${user.email}

Silakan transfer ke DANA 081532822792 dan konfirmasi pembayaran di website dengan kode di atas.

Terima kasih! 🙏`;

      window.open(`https://wa.me/6281532822792?text=${encodeURIComponent(message)}`, '_blank');
      
      alert(`Pesanan berhasil dibuat!\n\nKode Konfirmasi: ${confirmationCode}\n\nSimpan kode ini dan gunakan untuk konfirmasi pembayaran di halaman /konfirmasi`);
      navigate('/confirm');
    } catch (error) {
      alert(error.response?.data?.message || 'Gagal membuat pesanan. Silakan coba lagi.');
    }
    setCreatingOrder(false);
  };

  const gameColors = {
    'mobile-legends': 'from-blue-500 to-purple-600',
    'pubg-mobile': 'from-green-500 to-yellow-500',
    'valorant': 'from-red-500 to-pink-500',
    'genshin-impact': 'from-blue-400 to-cyan-300',
  };

  const images = account.image_url 
    ? [account.image_url] 
    : [`https://via.placeholder.com/800x600?text=${account.game_name}`];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-purple-50 to-blue-50 pt-28 pb-16">
      <div className="max-w-7xl mx-auto px-4">
        <button 
          onClick={() => navigate(-1)}
          className="mb-6 flex items-center text-gray-600 hover:text-purple-600 transition-colors group"
        >
          <ChevronLeft className="w-5 h-5 mr-1 group-hover:-translate-x-1 transition-transform" />
          Kembali ke Katalog
        </button>

        <div className="grid lg:grid-cols-2 gap-10">
          <div>
            <div className="bg-white rounded-3xl shadow-xl overflow-hidden">
              <div className={`h-80 lg:h-96 bg-gradient-to-br ${gameColors[account.game_slug] || 'from-purple-500 to-blue-500'} relative overflow-hidden`}>
                <img 
                  src={images[selectedImage]} 
                  alt={account.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/20"></div>
                <div className="absolute top-4 left-4 flex items-center space-x-2">
                  <span className={`px-4 py-2 rounded-xl font-bold text-white shadow-lg ${
                    account.status === 'available' ? 'bg-green-500' : 'bg-red-500'
                  }`}>
                    {account.status === 'available' ? '✓ Tersedia' : 'Tidak Tersedia'}
                  </span>
                </div>
                <div className="absolute top-4 right-4 flex space-x-2">
                  <button className="p-3 bg-white/90 backdrop-blur-sm rounded-xl shadow-lg hover:bg-white transition-colors">
                    <Heart className="w-5 h-5 text-gray-600" />
                  </button>
                  <button className="p-3 bg-white/90 backdrop-blur-sm rounded-xl shadow-lg hover:bg-white transition-colors">
                    <Share2 className="w-5 h-5 text-gray-600" />
                  </button>
                </div>
              </div>
            </div>

            <div className="mt-6 bg-white rounded-2xl shadow-lg p-6">
              <h3 className="font-bold text-lg mb-4">Deskripsi Akun</h3>
              <p className="text-gray-600 leading-relaxed">
                {account.description || 'Akun premium dengan rank tinggi dan inventory lengkap. Siap digunakan untuk push rank atau main casual.'}
              </p>
              
              <div className="mt-6 grid grid-cols-2 gap-4">
                <div className="p-4 bg-gradient-to-br from-yellow-50 to-orange-50 rounded-xl">
                  <div className="flex items-center mb-2">
                    <Star className="w-5 h-5 text-yellow-500 mr-2" />
                    <span className="text-sm text-gray-500">Rank</span>
                  </div>
                  <span className="font-bold text-lg text-yellow-700">{account.rank || '-'}</span>
                </div>
                <div className="p-4 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl">
                  <div className="flex items-center mb-2">
                    <Users className="w-5 h-5 text-blue-500 mr-2" />
                    <span className="text-sm text-gray-500">Hero/Char</span>
                  </div>
                  <span className="font-bold text-lg text-blue-700">{account.hero_count}</span>
                </div>
                <div className="p-4 bg-gradient-to-br from-pink-50 to-rose-50 rounded-xl">
                  <div className="flex items-center mb-2">
                    <Shirt className="w-5 h-5 text-pink-500 mr-2" />
                    <span className="text-sm text-gray-500">Skin</span>
                  </div>
                  <span className="font-bold text-lg text-pink-700">{account.skin_count}</span>
                </div>
                <div className="p-4 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl">
                  <div className="flex items-center mb-2">
                    <Shield className="w-5 h-5 text-green-500 mr-2" />
                    <span className="text-sm text-gray-500">Keamanan</span>
                  </div>
                  <span className="font-bold text-lg text-green-700">100% Aman</span>
                </div>
              </div>
            </div>
          </div>

          <div>
            <div className="bg-white rounded-3xl shadow-xl p-8 sticky top-28">
              <div className="mb-4">
                <span className="text-sm font-semibold text-purple-600 uppercase tracking-wider">
                  {account.game_name}
                </span>
              </div>
              
              <h1 className="text-3xl font-black mb-4">{account.title}</h1>

              <div className="flex flex-wrap gap-2 mb-6">
                <span className="px-4 py-2 bg-purple-100 text-purple-700 rounded-xl text-sm font-semibold">
                  Full Doc
                </span>
                <span className="px-4 py-2 bg-green-100 text-green-700 rounded-xl text-sm font-semibold">
                  {account.status === 'available' ? 'Ready Stock' : 'Sold Out'}
                </span>
                <span className="px-4 py-2 bg-yellow-100 text-yellow-700 rounded-xl text-sm font-semibold flex items-center">
                  <Star className="w-4 h-4 mr-1" />
                  {account.rank || 'Unranked'}
                </span>
              </div>

              <div className="border-t border-b border-gray-100 py-6 my-6">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-gray-600">Durasi Sewa</span>
                  <div className="flex items-center space-x-3">
                    <button
                      onClick={() => setDuration(Math.max(1, duration - 1))}
                      className="w-10 h-10 bg-gray-100 rounded-xl font-bold hover:bg-purple-100 hover:text-purple-600 transition-colors"
                    >
                      -
                    </button>
                    <input
                      type="number"
                      min="1"
                      value={duration}
                      onChange={(e) => setDuration(Math.max(1, parseInt(e.target.value) || 1))}
                      className="w-16 text-center py-2 border-2 border-gray-200 rounded-xl font-bold text-lg focus:border-purple-500 focus:ring-0 transition-colors"
                    />
                    <button
                      onClick={() => setDuration(duration + 1)}
                      className="w-10 h-10 bg-gray-100 rounded-xl font-bold hover:bg-purple-100 hover:text-purple-600 transition-colors"
                    >
                      +
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between text-sm text-gray-500 mb-2">
                  <span>Harga per jam</span>
                  <span className="font-medium">Rp{parseInt(account.price_per_hour).toLocaleString()}</span>
                </div>
                <div className="flex items-center justify-between text-sm text-gray-500">
                  <span>Durasi</span>
                  <span className="font-medium">{duration} jam</span>
                </div>
              </div>

              <div className="bg-gradient-to-br from-purple-500 to-blue-600 rounded-2xl p-6 mb-6 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-purple-200 text-sm mb-1">Total Harga</div>
                    <div className="text-4xl font-black">
                      Rp{totalPrice.toLocaleString()}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-purple-200 text-sm">{duration} jam</div>
                    <div className="text-lg font-semibold">Rp{parseInt(account.price_per_hour).toLocaleString()}/jam</div>
                  </div>
                </div>
              </div>

              <button
                onClick={handleRent}
                disabled={account.status !== 'available' || creatingOrder}
                className={`w-full py-4 rounded-2xl font-bold text-lg flex items-center justify-center transition-all duration-300 transform ${
                  account.status === 'available' && !creatingOrder
                    ? 'bg-gradient-to-r from-green-500 to-green-600 text-white hover:shadow-xl hover:shadow-green-500/30 hover:scale-[1.02]' 
                    : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                }`}
              >
                {account.status === 'available' ? (
                  creatingOrder ? (
                    <>
                      <Loader2 className="w-6 h-6 mr-2 animate-spin" />
                      Membuat Pesanan...
                    </>
                  ) : (
                    <>
                      <MessageCircle className="w-6 h-6 mr-2" />
                      Sewa via WhatsApp
                    </>
                  )
                ) : (
                  <>
                    <AlertCircle className="w-6 h-6 mr-2" />
                    Tidak Tersedia
                  </>
                )}
              </button>

              {account.status === 'available' && !creatingOrder && (
                <div className="mt-4 p-4 bg-blue-50 rounded-xl border border-blue-200">
                  <p className="text-sm text-blue-700 text-center">
                    <strong>Cara Pesan:</strong><br/>
                    1. Tekan tombol di atas untuk chat WhatsApp<br/>
                    2. Transfer ke DANA 081532822792<br/>
                    3. Konfirmasi pembayaran dengan kode yang diberikan
                  </p>
                </div>
              )}

              <div className="mt-6 p-4 bg-gray-50 rounded-xl">
                <h4 className="font-semibold mb-3 flex items-center">
                  <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
                  Yang Kamu Dapat:
                </h4>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li className="flex items-start">
                    <CheckCircle className="w-4 h-4 text-green-500 mr-2 mt-0.5" />
                    Akun {account.rank || 'Unranked'} siap main
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="w-4 h-4 text-green-500 mr-2 mt-0.5" />
                    {account.hero_count} Hero/Character
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="w-4 h-4 text-green-500 mr-2 mt-0.5" />
                    {account.skin_count} Skin premium
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="w-4 h-4 text-green-500 mr-2 mt-0.5" />
                    Support 24/7 via WhatsApp
                  </li>
                </ul>
              </div>

              <div className="mt-4 p-4 bg-amber-50 rounded-xl border border-amber-200">
                <p className="text-sm text-amber-800">
                  <strong>Cara Order:</strong> Tekan tombol "Sewa via WhatsApp" untuk langsung chat admin dengan kode pesanan unik Anda.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AccountDetail;
