import { useState, useEffect, useRef } from 'react';
import { Plus, Edit, Trash2, Eye, EyeOff, Upload, X } from 'lucide-react';
import { accountService, gameService, uploadService } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

const AdminAccounts = () => {
  const { isAdmin } = useAuth();
  const [accounts, setAccounts] = useState([]);
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingAccount, setEditingAccount] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);
  const [formData, setFormData] = useState({
    game_id: '', title: '', description: '', rank: '', hero_count: 0, skin_count: 0, price_per_hour: '', image_url: '', account_username: '', account_password: ''
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [accountsRes, gamesRes] = await Promise.all([
          accountService.getAll(),
          gameService.getAll()
        ]);
        setAccounts(accountsRes.data);
        setGames(gamesRes.data);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
      setLoading(false);
    };
    fetchData();
  }, []);

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    try {
      const response = await uploadService.uploadImage(file);
      setFormData({ ...formData, image_url: response.data.url });
    } catch (error) {
      alert('Gagal upload gambar');
      console.error(error);
    }
    setUploading(false);
  };

  const handleRemoveImage = () => {
    setFormData({ ...formData, image_url: '' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingAccount) {
        const response = await accountService.update(editingAccount.id, formData);
        setAccounts(accounts.map(a => a.id === editingAccount.id ? response.data : a));
      } else {
        const response = await accountService.create(formData);
        setAccounts([...accounts, response.data]);
      }
      setShowModal(false);
      setEditingAccount(null);
      resetForm();
    } catch (error) {
      alert(error.response?.data?.message || 'Terjadi kesalahan');
    }
  };

  const resetForm = () => {
    setFormData({ game_id: '', title: '', description: '', rank: '', hero_count: 0, skin_count: 0, price_per_hour: '', image_url: '', account_username: '', account_password: '' });
  };

  const handleEdit = (account) => {
    setEditingAccount(account);
    setFormData({
      game_id: account.game_id,
      title: account.title,
      description: account.description || '',
      rank: account.rank || '',
      hero_count: account.hero_count,
      skin_count: account.skin_count,
      price_per_hour: account.price_per_hour,
      image_url: account.image_url || '',
      account_username: account.account_username || '',
      account_password: account.account_password || ''
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!confirm('Yakin ingin menghapus akun ini?')) return;
    try {
      await accountService.delete(id);
      setAccounts(accounts.filter(a => a.id !== id));
    } catch (error) {
      alert('Gagal menghapus akun');
    }
  };

  if (!isAdmin) return null;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Kelola Akun Game</h1>
          <button onClick={() => { setEditingAccount(null); resetForm(); setShowModal(true); }} className="flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700">
            <Plus className="w-5 h-5 mr-2" />
            Tambah Akun
          </button>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Akun</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Game</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Rank</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Harga/Jam</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {accounts.map((account) => (
                  <tr key={account.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-3">
                        {account.image_url ? (
                          <img 
                            src={`http://localhost:5000${account.image_url}`}
                            alt={account.title}
                            className="w-12 h-12 object-cover rounded-lg"
                          />
                        ) : (
                          <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-blue-500 rounded-lg flex items-center justify-center">
                            <span className="text-lg font-bold text-white opacity-50">{account.game_name?.charAt(0) || 'G'}</span>
                          </div>
                        )}
                        <div>
                          <div className="font-semibold">{account.title}</div>
                          <div className="text-sm text-gray-500">{account.hero_count} hero, {account.skin_count} skin</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">{account.game_name}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{account.rank || '-'}</td>
                    <td className="px-6 py-4 whitespace-nowrap font-semibold">Rp{parseInt(account.price_per_hour).toLocaleString()}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <select
                        value={account.status}
                        onChange={async (e) => {
                          const newStatus = e.target.value;
                          try {
                            await fetch(`http://localhost:5000/api/accounts/${account.id}/status`, {
                              method: 'PATCH',
                              headers: {
                                'Content-Type': 'application/json',
                                'Authorization': `Bearer ${localStorage.getItem('token')}`
                              },
                              body: JSON.stringify({ status: newStatus })
                            });
                            setAccounts(accounts.map(a => a.id === account.id ? { ...a, status: newStatus } : a));
                          } catch (error) {
                            alert('Gagal update status');
                          }
                        }}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold border-2 cursor-pointer focus:outline-none ${
                          account.status === 'available' ? 'bg-green-100 text-green-700 border-green-300 hover:bg-green-200' :
                          account.status === 'rented' ? 'bg-purple-100 text-purple-700 border-purple-300 hover:bg-purple-200' :
                          account.status === 'booked' ? 'bg-blue-100 text-blue-700 border-blue-300 hover:bg-blue-200' :
                          account.status === 'maintenance' ? 'bg-orange-100 text-orange-700 border-orange-300 hover:bg-orange-200' :
                          'bg-gray-100 text-gray-700 border-gray-300 hover:bg-gray-200'
                        }`}
                      >
                        <option value="available">Tersedia</option>
                        <option value="rented">Disewa</option>
                        <option value="booked">Dipesan</option>
                        <option value="maintenance">Maintenance</option>
                      </select>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button onClick={() => handleEdit(account)} className="p-2 hover:bg-gray-100 rounded-lg mr-2">
                        <Edit className="w-5 h-5 text-blue-500" />
                      </button>
                      <button onClick={() => handleDelete(account.id)} className="p-2 hover:bg-gray-100 rounded-lg">
                        <Trash2 className="w-5 h-5 text-red-500" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b flex justify-between items-center">
              <h2 className="text-xl font-bold">{editingAccount ? 'Edit Akun' : 'Tambah Akun'}</h2>
              <button onClick={() => setShowModal(false)} className="p-2 hover:bg-gray-100 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Game</label>
                <select value={formData.game_id} onChange={(e) => setFormData({ ...formData, game_id: e.target.value })} className="w-full px-4 py-2 border rounded-lg" required>
                  <option value="">Pilih Game</option>
                  {games.map(game => <option key={game.id} value={game.id}>{game.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Judul</label>
                <input type="text" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} className="w-full px-4 py-2 border rounded-lg" required />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Rank</label>
                  <input type="text" value={formData.rank} onChange={(e) => setFormData({ ...formData, rank: e.target.value })} className="w-full px-4 py-2 border rounded-lg" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Harga/Jam (Rp)</label>
                  <input type="number" value={formData.price_per_hour} onChange={(e) => setFormData({ ...formData, price_per_hour: e.target.value })} className="w-full px-4 py-2 border rounded-lg" required />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Jumlah Hero</label>
                  <input type="number" value={formData.hero_count} onChange={(e) => setFormData({ ...formData, hero_count: parseInt(e.target.value) || 0 })} className="w-full px-4 py-2 border rounded-lg" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Jumlah Skin</label>
                  <input type="number" value={formData.skin_count} onChange={(e) => setFormData({ ...formData, skin_count: parseInt(e.target.value) || 0 })} className="w-full px-4 py-2 border rounded-lg" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Deskripsi</label>
                <textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} className="w-full px-4 py-2 border rounded-lg" rows="2" />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Gambar Akun</label>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleImageUpload}
                  accept="image/*"
                  className="hidden"
                />
                
                {formData.image_url ? (
                  <div className="relative">
                    <img 
                      src={`http://localhost:5000${formData.image_url}`}
                      alt="Preview"
                      className="w-full h-40 object-cover rounded-lg"
                    />
                    <button
                      type="button"
                      onClick={handleRemoveImage}
                      className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-full hover:bg-red-600"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <div 
                    onClick={() => fileInputRef.current?.click()}
                    className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer hover:border-purple-500 transition-colors ${uploading ? 'opacity-50' : ''}`}
                  >
                    {uploading ? (
                      <div className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mr-3"></div>
                        <span>Mengupload...</span>
                      </div>
                    ) : (
                      <>
                        <Upload className="w-10 h-10 mx-auto text-gray-400 mb-2" />
                        <p className="text-gray-500">Klik untuk upload gambar</p>
                        <p className="text-xs text-gray-400 mt-1">PNG, JPG, GIF (max 5MB)</p>
                      </>
                    )}
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Username Akun</label>
                  <input type="text" value={formData.account_username} onChange={(e) => setFormData({ ...formData, account_username: e.target.value })} className="w-full px-4 py-2 border rounded-lg" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Password Akun</label>
                  <div className="relative">
                    <input type={showPassword ? 'text' : 'password'} value={formData.account_password} onChange={(e) => setFormData({ ...formData, account_password: e.target.value })} className="w-full px-4 py-2 border rounded-lg pr-10" />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400">
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>
              </div>
              <div className="flex space-x-3 pt-4">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300">Batal</button>
                <button type="submit" className="flex-1 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700">Simpan</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminAccounts;
