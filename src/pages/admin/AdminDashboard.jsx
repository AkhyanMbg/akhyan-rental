import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { LayoutDashboard, GamepadIcon, Package, Users, DollarSign, Clock, TrendingUp, Plus } from 'lucide-react';
import { adminService } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { user, isAdmin } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAdmin) {
      navigate('/');
      return;
    }
    const fetchStats = async () => {
      try {
        const response = await adminService.getDashboard();
        setStats(response.data);
      } catch (error) {
        console.error('Error fetching stats:', error);
      }
      setLoading(false);
    };
    fetchStats();
  }, [isAdmin, navigate]);

  if (!isAdmin) return null;

  const statCards = [
    { title: 'Total Akun', value: stats?.totalAccounts || 0, icon: GamepadIcon, color: 'bg-purple-500' },
    { title: 'Akun Tersedia', value: stats?.availableAccounts || 0, icon: Package, color: 'bg-green-500' },
    { title: 'Total Pesanan', value: stats?.totalOrders || 0, icon: Clock, color: 'bg-blue-500' },
    { title: 'Pesanan Pending', value: stats?.pendingOrders || 0, icon: TrendingUp, color: 'bg-yellow-500' },
    { title: 'Total Revenue', value: `Rp${(stats?.totalRevenue || 0).toLocaleString()}`, icon: DollarSign, color: 'bg-green-500' },
    { title: 'Revenue Bulan Ini', value: `Rp${(stats?.monthlyRevenue || 0).toLocaleString()}`, icon: TrendingUp, color: 'bg-purple-500' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center space-x-2 text-gray-500">
            <LayoutDashboard className="w-5 h-5" />
            <span>Admin Dashboard</span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <div className="flex space-x-3">
            <Link to="/admin/games/new" className="flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition">
              <Plus className="w-5 h-5 mr-2" />
              Tambah Game
            </Link>
            <Link to="/admin/accounts/new" className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">
              <Plus className="w-5 h-5 mr-2" />
              Tambah Akun
            </Link>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
          </div>
        ) : (
          <>
            <div className="grid md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
              {statCards.map((stat, index) => (
                <div key={index} className="bg-white rounded-xl shadow-md p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className={`p-3 rounded-lg ${stat.color}`}>
                      <stat.icon className="w-6 h-6 text-white" />
                    </div>
                  </div>
                  <div className="text-2xl font-bold">{stat.value}</div>
                  <div className="text-gray-500 text-sm">{stat.title}</div>
                </div>
              ))}
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <Link to="/admin/orders" className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-lg mb-1">Kelola Pesanan</h3>
                    <p className="text-gray-500">{stats?.pendingOrders || 0} pesanan pending</p>
                  </div>
                  <Clock className="w-10 h-10 text-purple-500" />
                </div>
              </Link>

              <Link to="/admin/games" className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-lg mb-1">Kelola Game</h3>
                    <p className="text-gray-500">Tambah atau edit game</p>
                  </div>
                  <GamepadIcon className="w-10 h-10 text-blue-500" />
                </div>
              </Link>

              <Link to="/admin/accounts" className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-lg mb-1">Kelola Akun</h3>
                    <p className="text-gray-500">{stats?.totalAccounts || 0} akun game</p>
                  </div>
                  <Package className="w-10 h-10 text-green-500" />
                </div>
              </Link>

              <Link to="/admin/users" className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-lg mb-1">Kelola Users</h3>
                    <p className="text-gray-500">Lihat semua pengguna</p>
                  </div>
                  <Users className="w-10 h-10 text-yellow-500" />
                </div>
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
