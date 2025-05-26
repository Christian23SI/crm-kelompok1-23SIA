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
        </Route>
      </Routes>
    </>
  )
}

export default App
