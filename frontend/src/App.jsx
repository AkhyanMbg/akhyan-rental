import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import Catalog from './pages/Catalog';
import AccountDetail from './pages/AccountDetail';
import Checkout from './pages/Checkout';
import Login from './pages/Login';
import Register from './pages/Register';
import MyOrders from './pages/MyOrders';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminOrders from './pages/admin/AdminOrders';
import AdminGames from './pages/admin/AdminGames';
import AdminAccounts from './pages/admin/AdminAccounts';
import AdminUsers from './pages/admin/AdminUsers';
import PaymentProof from './pages/PaymentProof';
import ConfirmPayment from './pages/ConfirmPayment';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen flex flex-col">
          <Navbar />
          <main className="flex-1">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/catalog" element={<Catalog />} />
              <Route path="/account/:id" element={<AccountDetail />} />
              <Route path="/checkout/:id" element={<Checkout />} />
              <Route path="/payment/:orderId" element={<PaymentProof />} />
              <Route path="/confirm" element={<ConfirmPayment />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/my-orders" element={<MyOrders />} />
              <Route path="/admin" element={<AdminDashboard />} />
              <Route path="/admin/orders" element={<AdminOrders />} />
              <Route path="/admin/games" element={<AdminGames />} />
              <Route path="/admin/accounts" element={<AdminAccounts />} />
              <Route path="/admin/users" element={<AdminUsers />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
