import { useState, useEffect, useRef } from 'react';
import { Plus, Edit, Trash2, Upload, X, Image as ImageIcon } from 'lucide-react';
import { gameService, uploadService } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

const AdminGames = () => {
  const { isAdmin } = useAuth();
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingGame, setEditingGame] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [formData, setFormData] = useState({ name: '', slug: '', image_url: '', description: '' });
  const fileInputRef = useRef(null);

  useEffect(() => {
    const fetchGames = async () => {
      try {
        const response = await gameService.getAll();
        setGames(response.data);
      } catch (error) {
        console.error('Error fetching games:', error);
      }
      setLoading(false);
    };
    fetchGames();
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
      if (editingGame) {
        await gameService.update(editingGame.id, formData);
        setGames(games.map(g => g.id === editingGame.id ? { ...g, ...formData } : g));
      } else {
        const response = await gameService.create(formData);
        setGames([...games, response.data]);
      }
      setShowModal(false);
      setEditingGame(null);
      setFormData({ name: '', slug: '', image_url: '', description: '' });
    } catch (error) {
      alert(error.response?.data?.message || 'Terjadi kesalahan');
    }
  };

  const handleEdit = (game) => {
    setEditingGame(game);
    setFormData({ name: game.name, slug: game.slug, image_url: game.image_url || '', description: game.description || '' });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!confirm('Yakin ingin menghapus game ini?')) return;
    try {
      await gameService.delete(id);
      setGames(games.filter(g => g.id !== id));
    } catch (error) {
      alert('Gagal menghapus game');
    }
  };

  if (!isAdmin) return null;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Kelola Game</h1>
          <button
            onClick={() => { setEditingGame(null); setFormData({ name: '', slug: '', image_url: '', description: '' }); setShowModal(true); }}
            className="flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
          >
            <Plus className="w-5 h-5 mr-2" />
            Tambah Game
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
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Game</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Slug</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {games.map((game) => (
                  <tr key={game.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-3">
                        {game.image_url ? (
                          <img 
                            src={`http://localhost:5000${game.image_url}`} 
                            alt={game.name}
                            className="w-12 h-12 object-cover rounded-lg"
                          />
                        ) : (
                          <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-blue-500 rounded-lg flex items-center justify-center">
                            <span className="text-lg font-bold text-white opacity-50">{game.name.charAt(0)}</span>
                          </div>
                        )}
                        <div>
                          <div className="font-semibold">{game.name}</div>
                          {game.description && <div className="text-sm text-gray-500 truncate max-w-xs">{game.description}</div>}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-500">{game.slug}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button onClick={() => handleEdit(game)} className="p-2 hover:bg-gray-100 rounded-lg mr-2">
                        <Edit className="w-5 h-5 text-blue-500" />
                      </button>
                      <button onClick={() => handleDelete(game.id)} className="p-2 hover:bg-gray-100 rounded-lg">
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
          <div className="bg-white rounded-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b flex justify-between items-center">
              <h2 className="text-xl font-bold">{editingGame ? 'Edit Game' : 'Tambah Game'}</h2>
              <button onClick={() => setShowModal(false)} className="p-2 hover:bg-gray-100 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Nama Game</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Slug</label>
                <input
                  type="text"
                  value={formData.slug}
                  onChange={(e) => setFormData({ ...formData, slug: e.target.value.toLowerCase().replace(/\s+/g, '-') })}
                  className="w-full px-4 py-2 border rounded-lg"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Gambar Game</label>
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

              <div>
                <label className="block text-sm font-medium mb-2">Deskripsi</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg"
                  rows="3"
                />
              </div>
              <div className="flex space-x-3 pt-4">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300">
                  Batal
                </button>
                <button type="submit" className="flex-1 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700">
                  Simpan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminGames;
