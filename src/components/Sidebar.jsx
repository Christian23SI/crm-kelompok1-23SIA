import {
  LayoutDashboard,
  Users,
  ShoppingCart,
  Box,
  BarChart2,
  Settings,
  User,
  LogIn,
  UserPlus,
  MessagesSquareIcon,
  List,
  LogOut, // Tambahkan icon logout dari lucide-react
  BarChart
} from 'lucide-react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import Logo from '../assets/Logo.png';
import { FiMail } from 'react-icons/fi';
import { useAuth } from '../pages/AuthContext'; // Import useAuth
import { MdBatchPrediction } from 'react-icons/md';

const menuItems = [
  { name: 'Dashboard', icon: <LayoutDashboard />, path: '/' },
  { name: 'Produk', icon: <Box />, path: '/produk' },
  { name: 'Manajemen Inventaris', icon: <BarChart2 />, path: '/inventaris' },
  { name: 'Pelanggan', icon: <Users />, path: '/customermanagement' },
  { name: 'Penjualan', icon: <ShoppingCart />, path: '/penjualan' },
  { name: 'FAQ', icon: <Users />, path: '/faq' },
  { name: 'Manajemen Feedback', icon: <MessagesSquareIcon />, path: '/feedback' },
  { name: 'Prediksi Loyalitas', icon: <MdBatchPrediction />, path: '/predict' },
  { name: 'Ramalan Penjualan', icon: <BarChart />, path: '/ramalan' },
  { name: 'Email Notification', icon: <FiMail />, path: '/email' },
]

const accountItems = [
  { name: 'Pengaturan Akun', icon: <Settings />, path: '/akun' },
  { name: 'List User', icon: <List />, path: '/user' },
]

const Sidebar = () => {
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

export default Sidebar