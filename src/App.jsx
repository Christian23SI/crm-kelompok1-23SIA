import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
// import './App.css'
import { Route, Routes } from 'react-router-dom'
import MainLayout from './components/MainLayout'
import Dashboard from './pages/Dashboard'
import CustomerManagement from './pages/CustomerManagement'
import SalesManagement from './pages/SalesManagement'
import ProductManagement from './pages/ProductManagement'
import AccountSetting from './pages/AccountSetting'
import SignIn from './pages/SignIn'
import SignUp from './pages/SignUp'
import FAQ from './pages/FAQ'
import ManajemenInventaris from './pages/ManajemenInventaris'
import ManajemenFeedback from './pages/ManajemenFeedback'
import EmailNotification from './pages/EmailNotification'
import User from './pages/ListUser'

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
      <Routes>
        <Route element={<MainLayout />} >
        <Route path='/' element={<Dashboard />} />
        <Route path='/customermanagement' element={<CustomerManagement />} />
        <Route path ='/penjualan' element={<SalesManagement/>} />
        <Route path ='/produk' element={<ProductManagement/>} />
        <Route path ='/akun' element={<AccountSetting/>} />
        <Route path ='/signin' element={<SignIn/>} />
        <Route path ='/signup' element={<SignUp/>} />
        <Route path='/faq' element={<FAQ />} />
        <Route path ='/inventaris' element={<ManajemenInventaris />} />
        <Route path ='/feedback' element={<ManajemenFeedback />} />
        <Route path ='/email' element={<EmailNotification />} />
        <Route path ='/user' element={<User />} />
        </Route>
      </Routes>
    </>
  )
}

export default App
