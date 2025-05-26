import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
// import './App.css'
import { Route, Routes } from 'react-router-dom'
import MainLayout from './components/MainLayout'
import Dashboard from './pages/Dashboard'
import SalesManagement from './pages/SalesManagement'

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
      <Routes>
        <Route element={<MainLayout />} >
        <Route path='/' element={<Dashboard />} />
        <Route path ='/penjualan' element={<SalesManagement/>} />
        </Route>
      </Routes>
    </>
  )
}

export default App
