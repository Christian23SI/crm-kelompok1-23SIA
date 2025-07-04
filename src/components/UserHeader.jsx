import { Search, User } from 'lucide-react'
import { NavLink, useLocation } from 'react-router-dom'

const UserHeader = () => {
  const location = useLocation()
  
  // Fungsi untuk mendapatkan nama halaman user berdasarkan path
  const getPageName = (path) => {
    const pathToName = {
      '/dashboarduser': 'Dashboard',
      '/produkuser': 'Menu',
      '/pemesananuser': 'Riwayat Pemesanan',
      '/loyaltymanagement': 'Saya',
      '/faquser': 'FAQ',
      '/akunuser': 'Pengaturan Akun',
      '/feedbackuser': 'Feedback'
    }
    
    return pathToName[path] || 'Dashboard'
  }
  

  const getMainBreadcrumb = () => {
    return 'Pages'
  }

  return (
    <header className="print:hidden flex justify-between items-center px-6 py-4 bg-white shadow-sm border-b sticky top-0 z-10">
      <div className="text-sm text-gray-500">
        {getMainBreadcrumb()} / <span className="text-gray-900 font-semibold">{getPageName(location.pathname)}</span>
      </div>
      <div className="flex items-center gap-4">
        <div className="relative">
          <input
            type="text"
            placeholder="Type here..."
            className="px-4 py-2 pl-10 text-sm border rounded-full focus:outline-none"
          />
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
        </div>
        <NavLink to="/signin">
          <div className="flex items-center gap-2 text-sm cursor-pointer text-gray-700 hover:text-purple-700">   
            <User className="w-4 h-4" />
            Sign In
          </div>
        </NavLink>
      </div>
    </header>
  )
}

export default UserHeader