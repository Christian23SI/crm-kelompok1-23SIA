 import {
LayoutDashboard,
  Users,         // untuk pelanggan
  ShoppingCart,  // untuk penjualan   // untuk laporan
  Settings,      // untuk pengaturan akun
  MessagesSquareIcon,
  LogOut,
  MenuIcon,
  Store
  
} from 'lucide-react'
import { Link, useLocation } from 'react-router-dom'
import Logo from '../assets/Logo.png';
import { FiMail } from 'react-icons/fi';
import { BiNotification } from 'react-icons/bi';
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../pages/AuthContext'; // Import useAuth

const menuItems = [
  { name: 'Dashboard', icon: <LayoutDashboard />, path: '/dashboarduser' },
  { name: 'Produk', icon: <Store />, path: '/produkuser' },
  { name: 'Riwayat Pemesanan', icon: <ShoppingCart />, path: '/pemesananuser' },
  { name: 'Saya', icon: <Users />, path: '/loyaltymanagement' },
  { name: 'FAQ', icon: <Users />, path: '/faquser' },
  { name: 'Feedback', icon: <MessagesSquareIcon />, path: '/feedbackuser' },
]

const accountItems = [
  { name: 'Pengaturan Akun', icon: <Settings />, path: '/akunuser' },
]

const SidebarUser = () => {
  const location = useLocation()
  const navigate = useNavigate()
  const { logout } = useAuth() // Dapatkan fungsi logout dari context

  const isActive = (path) => location.pathname === path

  const handleLogout = async () => {
    try {
      await logout() // Panggil fungsi logout
      navigate('/signin') // Redirect ke halaman signin
    } catch (error) {
      console.error('Logout error:', error)
    }
  }

  return (
    <aside className="bg-white w-64 h-screen shadow-lg px-4 py-6 hidden md:block flex flex-col">
      <div className="flex-grow">
        <div className="text-xl mb-8 flex justify-center">
          <img src={Logo} alt="Logo" className='h-30 w-45'/>
        </div>
        
        <nav className="space-y-1">
          {menuItems.map((item) => (
            <Link
              key={item.name}
              to={item.path}
              className={`flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-purple-100 transition ${
                isActive(item.path)
                  ? 'bg-purple-200 text-purple-800 font-semibold'
                  : 'text-gray-700'
              }`}
            >
              <span className="w-5 h-5">{item.icon}</span>
              {item.name}
            </Link>
          ))}
        </nav>

        <div className="mt-8 text-xs font-semibold text-gray-500">AKUN</div>
        <nav className="mt-2 space-y-1">
          {accountItems.map((item) => (
            <Link
              key={item.name}
              to={item.path}
              className={`flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-purple-100 transition ${
                isActive(item.path)
                  ? 'bg-purple-200 text-purple-800 font-semibold'
                  : 'text-gray-700'
              }`}
            >
              <span className="w-5 h-5">{item.icon}</span>
              {item.name}
            </Link>
          ))}
        </nav>
      </div>

      {/* Tombol Logout di bagian bawah sidebar */}
      <button
        onClick={handleLogout}
        className="flex items-center gap-3 px-3 py-2 rounded-lg text-gray-700 hover:bg-red-100 hover:text-red-800 transition mt-4"
      >
        <span className="w-5 h-5"><LogOut /></span>
        Logout
      </button>
    </aside>
  )
}

export default SidebarUser