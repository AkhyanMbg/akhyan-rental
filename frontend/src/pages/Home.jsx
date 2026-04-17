import { Link } from 'react-router-dom';
import { Shield, Clock, CreditCard, Headphones, ChevronRight, Star, Zap, Award, Users, TrendingUp } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { gameService } from '../services/api';

const Home = () => {
  const [games, setGames] = useState([]);
  const [stats, setStats] = useState({ accounts: 120, users: 850, rating: 4.9 });
  const [typedText, setTypedText] = useState('');
  const fullText = 'Sewa Akun Game Premium';
  const heroRef = useRef(null);

  useEffect(() => {
    const fetchGames = async () => {
      try {
        const response = await gameService.getAll();
        setGames(response.data);
      } catch (error) {
        console.error('Error fetching games:', error);
      }
    };
    fetchGames();
  }, []);

  useEffect(() => {
    let index = 0;
    const timer = setInterval(() => {
      if (index <= fullText.length) {
        setTypedText(fullText.slice(0, index));
        index++;
      } else {
        clearInterval(timer);
      }
    }, 100);
    return () => clearInterval(timer);
  }, []);

  const features = [
    { icon: Shield, title: 'Aman & Terpercaya', desc: 'Akun original dan legal 100%', color: 'from-green-400 to-emerald-500' },
    { icon: Clock, title: 'Layanan 24/7', desc: 'Siap membantu kapan saja', color: 'from-blue-400 to-cyan-500' },
    { icon: CreditCard, title: 'Pembayaran Mudah', desc: 'DANA & QRIS tersedia', color: 'from-purple-400 to-pink-500' },
    { icon: Headphones, title: 'Support Responsif', desc: 'Tim profesional siap membantu', color: 'from-orange-400 to-red-500' },
  ];

  const gameColors = {
    'mobile-legends': 'from-blue-500 to-purple-600',
    'pubg-mobile': 'from-green-500 to-yellow-500',
    'valorant': 'from-red-500 to-pink-500',
    'genshin-impact': 'from-blue-400 to-cyan-300',
  };

  const gameIcons = {
    'mobile-legends': '⚔️',
    'pubg-mobile': '🎯',
    'valorant': '🔫',
    'genshin-impact': '✨',
  };

  return (
    <div className="overflow-x-hidden">
      <section ref={heroRef} className="relative min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 text-white overflow-hidden">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500/30 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-500/30 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
          <div className="absolute top-1/2 left-1/2 w-96 h-96 bg-pink-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
        </div>

        <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%239C92AC%22%20fill-opacity%3D%220.05%22%3E%3Cpath%20d%3D%22M36%2034v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6%2034v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6%204V0H4v4H0v2h4v4h2V6h4V4H6z%22%2F%3E%3C%2Fg%3E%3C%2Fg%3E%3C%2Fsvg%3E')] opacity-50"></div>

        <div className="relative max-w-7xl mx-auto px-4 pt-20 pb-32">
          <div className="text-center">
            <div className="inline-flex items-center px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full mb-6 border border-white/20 animate-fade-in">
              <Zap className="w-4 h-4 text-yellow-400 mr-2" />
              <span className="text-sm">Platform Rental Akun Terpercaya</span>
            </div>

            <h1 className="text-5xl md:text-7xl font-black mb-6 leading-tight">
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400">
                {typedText}
              </span>
              <span className="animate-bounce inline-block w-2 h-12 bg-yellow-400 ml-2"></span>
            </h1>

            <p className="text-xl text-purple-200 mb-10 max-w-2xl mx-auto leading-relaxed">
              Nikmati pengalaman gaming premium tanpa perlu membeli akun mahal. 
              Tersedia berbagai game populer dengan rank tinggi dan harga terjangkau!
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
              <Link to="/catalog" className="group relative inline-flex items-center justify-center px-8 py-4 bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 text-white rounded-2xl font-bold text-lg shadow-2xl shadow-purple-500/30 hover:shadow-purple-500/50 transform hover:scale-105 transition-all duration-300">
                <span>Lihat Katalog</span>
                <ChevronRight className="w-6 h-6 ml-2 group-hover:translate-x-1 transition-transform" />
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 animate-pulse opacity-0 group-hover:opacity-30"></div>
              </Link>
              <Link to="/register" className="relative inline-flex items-center justify-center px-8 py-4 bg-white/10 backdrop-blur-sm border border-white/30 rounded-2xl font-bold text-lg text-white hover:bg-white/20 transition-all duration-300 overflow-hidden group">
                <Users className="w-5 h-5 mr-2" />
                <span>Daftar Sekarang</span>
                <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
              </Link>
            </div>

            <div className="grid grid-cols-3 gap-8 max-w-2xl mx-auto">
              <div className="text-center group">
                <div className="text-4xl md:text-5xl font-black text-white mb-2 group-hover:scale-110 transition-transform">{stats.accounts}+</div>
                <div className="text-purple-300 text-sm">Akun Premium</div>
              </div>
              <div className="text-center group">
                <div className="text-4xl md:text-5xl font-black text-white mb-2 group-hover:scale-110 transition-transform">{stats.users}+</div>
                <div className="text-purple-300 text-sm">Pengguna Puas</div>
              </div>
              <div className="text-center group">
                <div className="text-4xl md:text-5xl font-black text-white mb-2 group-hover:scale-110 transition-transform flex items-center justify-center">
                  {stats.rating} <Star className="w-6 h-6 text-yellow-400 ml-1" />
                </div>
                <div className="text-purple-300 text-sm">Rating</div>
              </div>
            </div>
          </div>
        </div>

        <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-gray-50 to-transparent"></div>
      </section>

      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <div 
                key={index} 
                className="group relative bg-white p-8 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 overflow-hidden"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${feature.color} opacity-10 rounded-full blur-2xl group-hover:opacity-20 transition-opacity`}></div>
                <div className={`relative inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br ${feature.color} rounded-2xl mb-6 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                  <feature.icon className="w-8 h-8 text-white" />
                </div>
                <h3 className="font-bold text-xl mb-3 text-gray-900">{feature.title}</h3>
                <p className="text-gray-600 leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-24 bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 text-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <span className="inline-block px-4 py-2 bg-white/10 text-white rounded-full text-sm font-medium mb-4">
              Panduan
            </span>
            <h2 className="text-4xl md:text-5xl font-black mb-4">
              Cara Penyewaan
            </h2>
            <p className="text-xl text-purple-200 max-w-2xl mx-auto">
              Langkah mudah untuk menyewa akun game premium
            </p>
          </div>

          <div className="grid md:grid-cols-4 gap-8">
            <div className="relative text-center">
              <div className="w-20 h-20 bg-gradient-to-br from-pink-500 to-rose-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-2xl">
                <span className="text-3xl font-black">1</span>
              </div>
              <h3 className="text-xl font-bold mb-3">Pilih Akun</h3>
              <p className="text-purple-200">Pilih akun game yang ingin disewa dari katalog kami</p>
              <div className="hidden md:block absolute top-10 -right-4 w-8 border-t-2 border-dashed border-white/30"></div>
            </div>
            
            <div className="relative text-center">
              <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-2xl">
                <span className="text-3xl font-black">2</span>
              </div>
              <h3 className="text-xl font-bold mb-3">Chat WhatsApp</h3>
              <p className="text-purple-200">Klik tombol sewa, pesan otomatis terbuka di WhatsApp</p>
              <div className="hidden md:block absolute top-10 -right-4 w-8 border-t-2 border-dashed border-white/30"></div>
            </div>
            
            <div className="relative text-center">
              <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-2xl">
                <span className="text-3xl font-black">3</span>
              </div>
              <h3 className="text-xl font-bold mb-3">Transfer</h3>
              <p className="text-purple-200">Transfer sesuai nominal + kode unik, upload bukti bayar</p>
              <div className="hidden md:block absolute top-10 -right-4 w-8 border-t-2 border-dashed border-white/30"></div>
            </div>
            
            <div className="text-center">
              <div className="w-20 h-20 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-2xl">
                <span className="text-3xl font-black">4</span>
              </div>
              <h3 className="text-xl font-bold mb-3">Terima Akun</h3>
              <p className="text-purple-200">Akun game dikirim via WhatsApp setelah konfirmasi</p>
            </div>
          </div>

          <div className="mt-16 text-center">
            <Link 
              to="/catalog" 
              className="inline-flex items-center px-8 py-4 bg-white text-purple-600 rounded-2xl font-bold text-lg hover:shadow-2xl transform hover:scale-105 transition-all duration-300"
            >
              Mulai Sewa Sekarang
              <ChevronRight className="w-6 h-6 ml-2" />
            </Link>
          </div>
        </div>
      </section>

      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <span className="inline-block px-4 py-2 bg-purple-100 text-purple-600 rounded-full text-sm font-medium mb-4">
              Koleksi Game
            </span>
            <h2 className="text-4xl md:text-5xl font-black mb-4 bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-blue-600">
              Game Populer
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Pilihan game terpopuler yang bisa kamu sewa dengan berbagai rank tinggi
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {(games.length > 0 ? games : [
              { name: 'Mobile Legends', slug: 'mobile-legends' },
              { name: 'PUBG Mobile', slug: 'pubg-mobile' },
              { name: 'Valorant', slug: 'valorant' },
              { name: 'Genshin Impact', slug: 'genshin-impact' }
            ]).map((game, index) => (
              <Link 
                key={game.slug} 
                to={`/catalog?game=${game.slug}`} 
                className="group"
              >
                <div className="relative bg-white rounded-3xl shadow-xl overflow-hidden group-hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-3">
                  <div className={`h-48 bg-gradient-to-br ${gameColors[game.slug] || 'from-purple-500 to-blue-500'} relative overflow-hidden`}>
                    {game.image_url ? (
                      <img src={`http://localhost:5000${game.image_url}`} alt={game.name} className="w-full h-full object-cover" />
                    ) : (
                      <>
                        <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors"></div>
                        <div className="absolute inset-0 flex items-center justify-center">
                          <span className="text-8xl transform group-hover:scale-125 transition-transform duration-500">{gameIcons[game.slug] || '🎮'}</span>
                        </div>
                      </>
                    )}
                    <div className="absolute top-4 right-4 px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full">
                      <span className="text-white text-sm font-medium flex items-center">
                        <TrendingUp className="w-4 h-4 mr-1" />
                        Trending
                      </span>
                    </div>
                  </div>
                  <div className="p-6">
                    <h3 className="font-bold text-xl mb-3 group-hover:text-purple-600 transition-colors">{game.name}</h3>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center text-gray-500 text-sm">
                        <Star className="w-4 h-4 text-yellow-400 mr-1" />
                        <span>4.9 Rating</span>
                      </div>
                      <div className="flex items-center text-purple-600 font-bold group-hover:translate-x-2 transition-transform">
                        <span>Sewa Sekarang</span>
                        <ChevronRight className="w-5 h-5 ml-1" />
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="py-24 bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 text-white relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-pink-500/20 rounded-full blur-3xl"></div>
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl"></div>
        </div>

        <div className="relative max-w-4xl mx-auto px-4 text-center">
          <Award className="w-20 h-20 mx-auto mb-8 text-yellow-400 animate-bounce" />
          <h2 className="text-4xl md:text-5xl font-black mb-6">
            Siap Memulai Petualangan Gaming?
          </h2>
          <p className="text-xl text-purple-200 mb-10 max-w-2xl mx-auto">
            Daftar sekarang dan mulai sewa akun game favoritmu dengan harga terjangkau!
          </p>
          <Link to="/register" className="inline-flex items-center px-10 py-5 bg-gradient-to-r from-yellow-400 to-orange-500 text-gray-900 rounded-2xl font-bold text-xl shadow-2xl shadow-yellow-400/30 hover:shadow-yellow-400/50 transform hover:scale-105 transition-all duration-300">
            <Zap className="w-6 h-6 mr-3" />
            Daftar Gratis Sekarang
          </Link>
        </div>
      </section>

      <style>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fade-in 0.6s ease-out forwards;
        }
      `}</style>
    </div>
  );
};

export default Home;
