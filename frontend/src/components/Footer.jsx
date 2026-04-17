import { Link } from 'react-router-dom';
import { Gamepad2, MessageCircle, Mail, Phone, Send, ChevronRight, Heart, Globe } from 'lucide-react';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gradient-to-br from-gray-900 via-purple-900 to-indigo-900 text-white">
      <div className="max-w-7xl mx-auto px-4 py-16">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-12">
          <div>
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-12 h-12 bg-gradient-to-br from-pink-500 to-purple-600 rounded-xl flex items-center justify-center">
                <Gamepad2 className="w-7 h-7 text-white" />
              </div>
              <span className="text-2xl font-black">Akhyan Rental</span>
            </div>
            <p className="text-gray-400 leading-relaxed mb-6">
              Platform rental akun game terpercaya. Nikmati pengalaman gaming premium dengan harga terjangkau.
            </p>
            <div className="flex space-x-3">
              <a href="#" className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center hover:bg-pink-500 transition-colors">
                <Globe className="w-5 h-5" />
              </a>
              <a href="https://wa.me/6281532822792" target="_blank" rel="noopener noreferrer" className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center hover:bg-green-500 transition-colors">
                <MessageCircle className="w-5 h-5" />
              </a>
              <a href="#" className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center hover:bg-blue-500 transition-colors">
                <Send className="w-5 h-5" />
              </a>
            </div>
          </div>

          <div>
            <h3 className="font-bold text-lg mb-6">Menu</h3>
            <ul className="space-y-3">
              <li>
                <Link to="/" className="text-gray-400 hover:text-white transition-colors flex items-center">
                  <ChevronRight className="w-4 h-4 mr-2" />
                  Beranda
                </Link>
              </li>
              <li>
                <Link to="/catalog" className="text-gray-400 hover:text-white transition-colors flex items-center">
                  <ChevronRight className="w-4 h-4 mr-2" />
                  Katalog Game
                </Link>
              </li>
              <li>
                <Link to="/my-orders" className="text-gray-400 hover:text-white transition-colors flex items-center">
                  <ChevronRight className="w-4 h-4 mr-2" />
                  Pesanan Saya
                </Link>
              </li>
              <li>
                <Link to="/register" className="text-gray-400 hover:text-white transition-colors flex items-center">
                  <ChevronRight className="w-4 h-4 mr-2" />
                  Daftar Akun
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-bold text-lg mb-6">Kontak</h3>
            <ul className="space-y-4">
              <li>
                <a href="https://wa.me/6281532822792" className="flex items-center text-gray-400 hover:text-green-400 transition-colors">
                  <MessageCircle className="w-5 h-5 mr-3 text-green-500" />
                  <span>WhatsApp: 0812-3456-7890</span>
                </a>
              </li>
              <li>
                <a href="mailto:akhyanrental@rentail.id" className="flex items-center text-gray-400 hover:text-blue-400 transition-colors">
                  <Mail className="w-5 h-5 mr-3 text-blue-500" />
                  <span>akhyanrental@rentail.id</span>
                </a>
              </li>
              <li>
                <a href="tel:+6281532822792" className="flex items-center text-gray-400 hover:text-purple-400 transition-colors">
                  <Phone className="w-5 h-5 mr-3 text-purple-500" />
                  <span>0812-3456-7890</span>
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-bold text-lg mb-6">Metode Pembayaran</h3>
            <div className="space-y-4">
              <div className="p-4 bg-white/5 rounded-xl border border-white/10">
                <div className="font-semibold mb-1">DANA</div>
                <div className="text-gray-400 text-sm">Bayar dengan aplikasi DANA</div>
              </div>
              <div className="p-4 bg-white/5 rounded-xl border border-white/10">
                <div className="font-semibold mb-1">QRIS</div>
                <div className="text-gray-400 text-sm">Scan dari berbagai e-wallet</div>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-white/10 mt-12 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400 text-sm mb-4 md:mb-0">
              &copy; {currentYear} GameRent. All rights reserved.
            </p>
            <p className="text-gray-400 text-sm flex items-center">
              Made with <Heart className="w-4 h-4 mx-1 text-red-500" /> in Indonesia
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
