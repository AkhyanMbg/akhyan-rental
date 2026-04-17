import { Link, useNavigate } from 'react-router-dom';
import { Gamepad2, User, LogOut, Menu, X, ShoppingCart, ChevronDown } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = () => {
    logout();
    setShowUserMenu(false);
    navigate('/');
  };

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      scrolled 
        ? 'bg-white/95 backdrop-blur-lg shadow-xl' 
        : 'bg-gradient-to-r from-purple-900/90 via-blue-900/90 to-indigo-900/90 backdrop-blur-sm'
    }`}>
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between items-center h-20">
          <Link to="/" className="flex items-center space-x-3 group">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-300 group-hover:scale-110 ${
              scrolled ? 'bg-gradient-to-br from-purple-500 to-blue-500' : 'bg-white/20 backdrop-blur-sm'
            }`}>
              <Gamepad2 className={`w-7 h-7 ${scrolled ? 'text-white' : 'text-white'} transition-colors`} />
            </div>
            <span className={`text-2xl font-black tracking-tight transition-colors ${
              scrolled ? 'bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-blue-600' : 'text-white'
            }`}>
              Akhyan Rental
            </span>
          </Link>

          <div className="hidden md:flex items-center space-x-2">
            <Link 
              to="/" 
              className={`px-4 py-2 rounded-xl font-medium transition-all duration-300 hover:bg-white/10 ${
                scrolled ? 'text-gray-700 hover:text-purple-600' : 'text-white hover:text-purple-200'
              }`}
            >
              Beranda
            </Link>
            <Link 
              to="/catalog" 
              className={`px-4 py-2 rounded-xl font-medium transition-all duration-300 hover:bg-white/10 ${
                scrolled ? 'text-gray-700 hover:text-purple-600' : 'text-white hover:text-purple-200'
              }`}
            >
              Katalog
            </Link>
            <Link 
              to="/confirm" 
              className={`px-4 py-2 rounded-xl font-medium transition-all duration-300 hover:bg-white/10 ${
                scrolled ? 'text-gray-700 hover:text-purple-600' : 'text-white hover:text-purple-200'
              }`}
            >
              Konfirmasi
            </Link>
            {user && (
              <Link 
                to="/my-orders" 
                className={`px-4 py-2 rounded-xl font-medium transition-all duration-300 hover:bg-white/10 flex items-center ${
                  scrolled ? 'text-gray-700 hover:text-purple-600' : 'text-white hover:text-purple-200'
                }`}
              >
                <ShoppingCart className="w-4 h-4 mr-2" />
                Pesanan Saya
              </Link>
            )}
            {isAdmin && (
              <Link 
                to="/admin" 
                className={`px-4 py-2 rounded-xl font-medium transition-all duration-300 hover:bg-white/10 ${
                  scrolled ? 'text-gray-700 hover:text-purple-600' : 'text-white hover:text-purple-200'
                }`}
              >
                Admin Panel
              </Link>
            )}
          </div>

          <div className="hidden md:flex items-center space-x-4">
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className={`flex items-center space-x-3 px-4 py-2 rounded-xl transition-all duration-300 hover:bg-white/10 ${
                    scrolled ? 'text-gray-700' : 'text-white'
                  }`}
                >
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold ${
                    scrolled ? 'bg-gradient-to-br from-purple-500 to-blue-500 text-white' : 'bg-white/20 text-white'
                  }`}>
                    {user.username.charAt(0).toUpperCase()}
                  </div>
                  <span className="font-medium">{user.username}</span>
                  <ChevronDown className="w-4 h-4" />
                </button>

                {showUserMenu && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-2xl py-2 border border-gray-100 overflow-hidden">
                    <div className="px-4 py-3 border-b border-gray-100">
                      <p className="font-medium text-gray-900">{user.username}</p>
                      <p className="text-sm text-gray-500">{user.email}</p>
                      <span className={`inline-block mt-2 px-2 py-1 text-xs rounded-full ${
                        user.role === 'admin' 
                          ? 'bg-purple-100 text-purple-600' 
                          : 'bg-blue-100 text-blue-600'
                      }`}>
                        {user.role === 'admin' ? 'Administrator' : 'Member'}
                      </span>
                    </div>
                    <Link 
                      to="/my-orders" 
                      className="flex items-center px-4 py-3 text-gray-700 hover:bg-purple-50 hover:text-purple-600 transition-colors"
                      onClick={() => setShowUserMenu(false)}
                    >
                      <ShoppingCart className="w-5 h-5 mr-3" />
                      Pesanan Saya
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center px-4 py-3 text-red-600 hover:bg-red-50 transition-colors"
                    >
                      <LogOut className="w-5 h-5 mr-3" />
                      Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <>
                <Link 
                  to="/login" 
                  className={`px-6 py-2.5 rounded-xl font-medium transition-all duration-300 ${
                    scrolled 
                      ? 'text-purple-600 hover:bg-purple-50' 
                      : 'text-white hover:text-purple-200'
                  }`}
                >
                  Login
                </Link>
                <Link 
                  to="/register" 
                  className="px-6 py-2.5 bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 text-white rounded-xl font-semibold hover:shadow-lg hover:shadow-purple-500/30 transform hover:scale-105 transition-all duration-300"
                >
                  Daftar
                </Link>
              </>
            )}
          </div>

          <button 
            className="md:hidden p-2 rounded-xl transition-colors"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? (
              <X className={`w-6 h-6 ${scrolled ? 'text-gray-900' : 'text-white'}`} />
            ) : (
              <Menu className={`w-6 h-6 ${scrolled ? 'text-gray-900' : 'text-white'}`} />
            )}
          </button>
        </div>

        {mobileOpen && (
          <div className="md:hidden pb-6 bg-white rounded-2xl shadow-2xl mt-2 overflow-hidden">
            <div className="flex flex-col p-4 space-y-2">
              <Link to="/" className="px-4 py-3 text-gray-900 hover:bg-purple-50 rounded-xl transition-colors font-medium" onClick={() => setMobileOpen(false)}>Beranda</Link>
              <Link to="/catalog" className="px-4 py-3 text-gray-900 hover:bg-purple-50 rounded-xl transition-colors font-medium" onClick={() => setMobileOpen(false)}>Katalog</Link>
              <Link to="/confirm" className="px-4 py-3 text-gray-900 hover:bg-purple-50 rounded-xl transition-colors font-medium" onClick={() => setMobileOpen(false)}>Konfirmasi</Link>
              {user && (
                <Link to="/my-orders" className="px-4 py-3 text-gray-900 hover:bg-purple-50 rounded-xl transition-colors font-medium" onClick={() => setMobileOpen(false)}>
                  <div className="flex items-center">
                    <ShoppingCart className="w-5 h-5 mr-2" />
                    Pesanan Saya
                  </div>
                </Link>
              )}
              {isAdmin && (
                <Link to="/admin" className="px-4 py-3 text-gray-900 hover:bg-purple-50 rounded-xl transition-colors font-medium" onClick={() => setMobileOpen(false)}>Admin Panel</Link>
              )}
              <div className="border-t my-2 pt-4">
                {user ? (
                  <div className="space-y-2">
                    <div className="px-4 py-3 bg-gray-50 rounded-xl">
                      <p className="font-medium text-gray-900">{user.username}</p>
                      <p className="text-sm text-gray-500">{user.email}</p>
                    </div>
                    <button 
                      onClick={() => { handleLogout(); setMobileOpen(false); }} 
                      className="w-full px-4 py-3 text-red-600 hover:bg-red-50 rounded-xl transition-colors font-medium text-left"
                    >
                      Logout
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-col space-y-2">
                    <Link to="/login" className="px-4 py-3 bg-gray-100 text-gray-900 rounded-xl font-medium text-center hover:bg-gray-200 transition-colors" onClick={() => setMobileOpen(false)}>Login</Link>
                    <Link to="/register" className="px-4 py-3 bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 text-white rounded-xl font-medium text-center" onClick={() => setMobileOpen(false)}>Daftar</Link>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
