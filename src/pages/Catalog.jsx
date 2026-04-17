import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Search, Filter, Star, SlidersHorizontal, X, ChevronDown, Zap } from 'lucide-react';
import { gameService, accountService } from '../services/api';
import { API_BASE_URL } from '../config';

const Catalog = () => {
  const [searchParams] = useSearchParams();
  const [games, setGames] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [selectedGame, setSelectedGame] = useState(searchParams.get('game') || '');
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [sortBy, setSortBy] = useState('newest');
  const [priceRange, setPriceRange] = useState([0, 100000]);

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
    const fetchAccounts = async () => {
      setLoading(true);
      try {
        const params = {};
        if (selectedGame) {
          const game = games.find(g => g.slug === selectedGame);
          if (game) params.game_id = game.id;
        }
        const response = await accountService.getAll(params);
        let filtered = response.data;
        
        filtered = filtered.filter(a => 
          parseFloat(a.price_per_hour) >= priceRange[0] && 
          parseFloat(a.price_per_hour) <= priceRange[1]
        );

        if (sortBy === 'price-low') {
          filtered.sort((a, b) => parseFloat(a.price_per_hour) - parseFloat(b.price_per_hour));
        } else if (sortBy === 'price-high') {
          filtered.sort((a, b) => parseFloat(b.price_per_hour) - parseFloat(a.price_per_hour));
        }

        setAccounts(filtered);
      } catch (error) {
        console.error('Error fetching accounts:', error);
      }
      setLoading(false);
    };
    if (games.length > 0) {
      fetchAccounts();
    }
  }, [selectedGame, games, sortBy, priceRange]);

  const gameColors = {
    'mobile-legends': 'from-blue-500 to-purple-600',
    'pubg-mobile': 'from-green-500 to-yellow-500',
    'valorant': 'from-red-500 to-pink-500',
    'genshin-impact': 'from-blue-400 to-cyan-300',
  };

  const selectedGameData = games.find(g => g.slug === selectedGame);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-purple-50 to-blue-50 pt-28 pb-16">
      <div className="max-w-7xl mx-auto px-4">
        <div className="mb-10">
          <h1 className="text-4xl md:text-5xl font-black mb-4 bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-blue-600">
            Katalog Akun Game
          </h1>
          <p className="text-xl text-gray-600">Temukan akun game premium dengan rank tinggi dan harga terjangkau</p>
        </div>

        <div className="flex flex-col lg:flex-row gap-6 mb-10">
          <div className="flex-1">
            <div className="relative group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-purple-500 transition-colors" />
              <select
                value={selectedGame}
                onChange={(e) => setSelectedGame(e.target.value)}
                className="w-full pl-12 pr-4 py-4 bg-white border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-purple-100 focus:border-purple-500 transition-all duration-300 text-lg appearance-none cursor-pointer hover:border-purple-300"
              >
                <option value="">Semua Game</option>
                {games.map((game) => (
                  <option key={game.id} value={game.slug}>{game.name}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
            </div>
          </div>

          <button
            onClick={() => setShowFilters(!showFilters)}
            className="lg:hidden flex items-center justify-center px-6 py-4 bg-white border-2 border-gray-200 rounded-2xl hover:border-purple-500 transition-colors"
          >
            <SlidersHorizontal className="w-5 h-5 mr-2" />
            Filter
          </button>

          <div className={`lg:flex items-center space-x-4 ${showFilters ? 'flex' : 'hidden'} flex-col lg:flex-row w-full lg:w-auto`}>
            <div className="flex items-center space-x-4 bg-white px-4 py-2 rounded-2xl border-2 border-gray-200">
              <span className="text-gray-600 font-medium">Urutkan:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="py-2 pr-8 border-none focus:ring-0 bg-transparent cursor-pointer font-medium text-purple-600"
              >
                <option value="newest">Terbaru</option>
                <option value="price-low">Harga Terendah</option>
                <option value="price-high">Harga Tertinggi</option>
              </select>
            </div>

            <div className="flex items-center space-x-2 bg-white px-4 py-2 rounded-2xl border-2 border-gray-200">
              <span className="text-gray-600 font-medium">Harga:</span>
              <input
                type="number"
                value={priceRange[0]}
                onChange={(e) => setPriceRange([parseInt(e.target.value) || 0, priceRange[1]])}
                className="w-20 py-1 px-2 border border-gray-200 rounded-lg text-center"
                placeholder="Min"
              />
              <span>-</span>
              <input
                type="number"
                value={priceRange[1]}
                onChange={(e) => setPriceRange([priceRange[0], parseInt(e.target.value) || 100000])}
                className="w-20 py-1 px-2 border border-gray-200 rounded-lg text-center"
                placeholder="Max"
              />
            </div>
          </div>
        </div>

        {selectedGameData && (
          <div className={`mb-10 p-6 bg-gradient-to-r ${gameColors[selectedGame] || 'from-purple-500 to-blue-500'} rounded-3xl text-white relative overflow-hidden`}>
            <div className="absolute inset-0 bg-black/10"></div>
            <div className="relative flex items-center justify-between">
              <div>
                <h2 className="text-3xl font-bold mb-2">{selectedGameData.name}</h2>
                <p className="text-white/80">{selectedGameData.description || 'Deskripsi game'}</p>
                <div className="mt-3 flex items-center space-x-4">
                  <span className="px-3 py-1 bg-white/20 rounded-full text-sm">
                    {accounts.length} akun tersedia
                  </span>
                </div>
              </div>
              <button
                onClick={() => setSelectedGame('')}
                className="p-2 bg-white/20 rounded-full hover:bg-white/30 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
          </div>
        )}

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="relative w-20 h-20">
              <div className="absolute inset-0 border-4 border-purple-200 rounded-full"></div>
              <div className="absolute inset-0 border-4 border-purple-600 rounded-full border-t-transparent animate-spin"></div>
            </div>
            <p className="mt-4 text-gray-600 font-medium">Memuat akun game...</p>
          </div>
        ) : accounts.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-3xl shadow-lg">
            <div className="text-6xl mb-4">🎮</div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">Tidak Ada Akun Ditemukan</h3>
            <p className="text-gray-500 mb-6">Coba ubah filter atau pilih game lain</p>
            <button
              onClick={() => { setSelectedGame(''); setPriceRange([0, 100000]); }}
              className="px-6 py-3 bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-xl font-medium hover:shadow-lg transition-all"
            >
              Reset Filter
            </button>
          </div>
        ) : (
          <>
            <div className="mb-6 text-gray-600">
              Menampilkan <span className="font-bold text-purple-600">{accounts.length}</span> akun
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {accounts.map((account, index) => (
                <Link 
                  key={account.id} 
                  to={`/account/${account.id}`}
                  className="group"
                  style={{ animationDelay: `${index * 0.05}s` }}
                >
                  <div className="relative bg-white rounded-3xl shadow-lg overflow-hidden group-hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2">
                    <div className={`h-48 bg-gradient-to-br ${gameColors[account.game_slug] || 'from-purple-500 to-blue-500'} relative overflow-hidden`}>
                      {account.image_url ? (
                        <img src={`${API_BASE_URL}${account.image_url}`} alt={account.title} className="w-full h-full object-cover" />
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <span className="text-7xl transform group-hover:scale-125 transition-transform duration-500 opacity-50">
                            {account.game_name?.charAt(0) || '🎮'}
                          </span>
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                      <div className="absolute top-4 left-4 px-3 py-1.5 bg-white/95 backdrop-blur-sm rounded-xl shadow-lg">
                        <span className={`text-sm font-bold ${
                          account.status === 'available' 
                            ? 'text-green-600' 
                            : 'text-red-600'
                        }`}>
                          {account.status === 'available' ? '✓ Tersedia' : 'Tidak Tersedia'}
                        </span>
                      </div>
                      {account.rank && (
                        <div className="absolute top-4 right-4 px-3 py-1.5 bg-yellow-500/95 backdrop-blur-sm rounded-xl shadow-lg">
                          <span className="text-sm font-bold text-white flex items-center">
                            <Star className="w-4 h-4 mr-1" />
                            {account.rank}
                          </span>
                        </div>
                      )}
                      <div className="absolute bottom-4 left-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity transform translate-y-4 group-hover:translate-y-0">
                        <div className="px-4 py-2 bg-white/95 backdrop-blur-sm rounded-xl shadow-lg text-center">
                          <span className="font-bold text-purple-600">Lihat Detail</span>
                        </div>
                      </div>
                    </div>

                    <div className="p-6">
                      <div className="text-sm text-purple-600 font-semibold mb-1">{account.game_name}</div>
                      <h3 className="font-bold text-xl mb-3 line-clamp-1 group-hover:text-purple-600 transition-colors">
                        {account.title}
                      </h3>

                      <div className="flex flex-wrap gap-2 mb-4">
                        {account.rank && (
                          <span className="px-3 py-1 bg-yellow-50 text-yellow-700 rounded-lg text-sm font-medium flex items-center">
                            <Star className="w-3 h-3 mr-1" />
                            {account.rank}
                          </span>
                        )}
                        {account.hero_count > 0 && (
                          <span className="px-3 py-1 bg-blue-50 text-blue-700 rounded-lg text-sm font-medium">
                            {account.hero_count} Hero
                          </span>
                        )}
                        {account.skin_count > 0 && (
                          <span className="px-3 py-1 bg-pink-50 text-pink-700 rounded-lg text-sm font-medium">
                            {account.skin_count} Skin
                          </span>
                        )}
                      </div>

                      <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                        <div>
                          <div className="flex items-baseline">
                            <span className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-blue-600">
                              Rp{parseInt(account.price_per_hour).toLocaleString()}
                            </span>
                            <span className="text-gray-500 ml-1">/jam</span>
                          </div>
                        </div>
                        <div className="flex items-center text-purple-600 font-semibold group-hover:translate-x-1 transition-transform">
                          <span>Sewa</span>
                          <Zap className="w-4 h-4 ml-1" />
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Catalog;
