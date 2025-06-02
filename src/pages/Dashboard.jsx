import React, { useState } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
} from 'chart.js';
import { Bar, Line, Pie } from 'react-chartjs-2';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

const Dashboard = () => {
  const [timeRange, setTimeRange] = useState('week');
  const [activeTab, setActiveTab] = useState('sales');

  // Data statistik
  const stats = [
    { 
      label: "Total Pendapatan", 
      value: timeRange === 'week' ? "Rp 12.450.000" : "Rp 48.750.000", 
      change: "+15%", 
      icon: "💰" 
    },
    { 
      label: "Total Penjualan", 
      value: timeRange === 'week' ? "1.245" : "4.892", 
      change: "+8%", 
      icon: "☕" 
    },
    { 
      label: "Pelanggan Baru", 
      value: timeRange === 'week' ? "87" : "342", 
      change: "+12%", 
      icon: "👥" 
    },
    { 
      label: "Rating Rata-rata", 
      value: "4.8", 
      change: "+0.2", 
      icon: "⭐" 
    }
  ];

  // Data produk terlaris
  const topProducts = [
    { name: "Espresso", sales: 320, category: "minuman" },
    { name: "Croissant", sales: 215, category: "makanan" },
    { name: "Latte", sales: 198, category: "minuman" },
    { name: "Sandwich", sales: 175, category: "makanan" },
    { name: "Cappuccino", sales: 162, category: "minuman" }
  ];

  // Data untuk grafik penjualan
  const salesData = {
    labels: timeRange === 'week' 
      ? ["Sen", "Sel", "Rab", "Kam", "Jum", "Sab", "Min"] 
      : ["Minggu 1", "Minggu 2", "Minggu 3", "Minggu 4"],
    datasets: [
      {
        label: "Penjualan Minuman",
        data: timeRange === 'week' 
          ? [120, 190, 130, 170, 210, 250, 220] 
          : [4500, 5200, 4800, 5100],
        backgroundColor: "rgba(101, 163, 13, 0.7)", // green-600
      },
      {
        label: "Penjualan Makanan",
        data: timeRange === 'week' 
          ? [80, 110, 95, 120, 140, 180, 150] 
          : [3200, 3500, 3800, 4000],
        backgroundColor: "rgba(202, 138, 4, 0.7)", // amber-600
      }
    ]
  };

  // Data untuk grafik pertumbuhan pelanggan
  const customerGrowthData = {
    labels: ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun"],
    datasets: [
      {
        label: "Pelanggan Aktif",
        data: [450, 620, 780, 890, 1020, 1250],
        borderColor: "rgba(59, 130, 246, 1)", // blue-500
        backgroundColor: "rgba(59, 130, 246, 0.1)",
        fill: true,
        tension: 0.3
      }
    ]
  };

  // Data untuk pie chart produk terlaris
  const productPieData = {
    labels: topProducts.map(p => p.name),
    datasets: [
      {
        data: topProducts.map(p => p.sales),
        backgroundColor: [
          "rgba(101, 163, 13, 0.7)", // green-600
          "rgba(202, 138, 4, 0.7)", // amber-600
          "rgba(22, 163, 74, 0.7)", // emerald-600
          "rgba(234, 88, 12, 0.7)", // orange-600
          "rgba(220, 38, 38, 0.7)" // red-600
        ],
        borderWidth: 1
      }
    ]
  };

  // Data pesanan terbaru
  const recentOrders = [
    { id: "#FC-1001", customer: "Budi Santoso", items: "2x Latte, 1x Croissant", total: "Rp 85.000", status: "Selesai" },
    { id: "#FC-1002", customer: "Ani Wijaya", items: "1x Espresso", total: "Rp 25.000", status: "Diproses" },
    { id: "#FC-1003", customer: "Rina Permata", items: "3x Cappuccino, 2x Sandwich", total: "Rp 145.000", status: "Selesai" },
    { id: "#FC-1004", customer: "Doni Pratama", items: "1x Americano, 1x Muffin", total: "Rp 65.000", status: "Dibatalkan" }
  ];

  // Data feedback pelanggan
  const customerFeedback = [
    { customer: "Budi Santoso", rating: 5, comment: "Espresso-nya sempurna!" },
    { customer: "Ani Wijaya", rating: 4, comment: "Pelayanan cepat, tapi tempat agak ramai" },
    { customer: "Rina Permata", rating: 5, comment: "Cappuccino terbaik di kota ini!" }
  ];

  return (
    <div className="flex h-screen bg-gray-50">
      
      <div className="flex-1 flex flex-col overflow-hidden">
        
        <main className="flex-1 overflow-y-auto p-6">
          {/* Filter dan Tab */}
          <div className="flex justify-between items-center mb-6">
            <div className="flex space-x-2">
              <button
                onClick={() => setTimeRange('week')}
                className={`px-4 py-2 rounded-lg ${timeRange === 'week' ? 'bg-green-600 text-white' : 'bg-white text-gray-700'}`}
              >
                Minggu Ini
              </button>
              <button
                onClick={() => setTimeRange('month')}
                className={`px-4 py-2 rounded-lg ${timeRange === 'month' ? 'bg-green-600 text-white' : 'bg-white text-gray-700'}`}
              >
                Bulan Ini
              </button>
            </div>
            
            <div className="flex space-x-2">
              <button
                onClick={() => setActiveTab('sales')}
                className={`px-4 py-2 rounded-lg ${activeTab === 'sales' ? 'bg-green-600 text-white' : 'bg-white text-gray-700'}`}
              >
                Penjualan
              </button>
              <button
                onClick={() => setActiveTab('operations')}
                className={`px-4 py-2 rounded-lg ${activeTab === 'operations' ? 'bg-green-600 text-white' : 'bg-white text-gray-700'}`}
              >
                Operasional
              </button>
              <button
                onClick={() => setActiveTab('feedback')}
                className={`px-4 py-2 rounded-lg ${activeTab === 'feedback' ? 'bg-green-600 text-white' : 'bg-white text-gray-700'}`}
              >
                Feedback
              </button>
            </div>
          </div>

          {/* Statistik Utama */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {stats.map((stat, index) => (
              <div key={index} className="bg-white rounded-xl shadow p-6 flex items-center">
                <div className="text-3xl mr-4">{stat.icon}</div>
                <div>
                  <p className="text-sm text-gray-500">{stat.label}</p>
                  <div className="flex items-baseline">
                    <h2 className="text-2xl font-bold text-gray-800">{stat.value}</h2>
                    <span className="ml-2 text-sm font-semibold text-green-600">{stat.change}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Grafik dan Data Utama */}
          {activeTab === 'sales' && (
            <div className="space-y-8">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-white rounded-xl shadow p-6">
                  <h3 className="text-lg font-semibold mb-4">Performa Penjualan</h3>
                  <Bar 
                    data={salesData}
                    options={{
                      responsive: true,
                      plugins: {
                        legend: { position: 'top' },
                        title: { display: false }
                      }
                    }}
                  />
                </div>
                
                <div className="bg-white rounded-xl shadow p-6">
                  <h3 className="text-lg font-semibold mb-4">Pertumbuhan Pelanggan</h3>
                  <Line 
                    data={customerGrowthData}
                    options={{
                      responsive: true,
                      plugins: {
                        legend: { position: 'top' },
                        title: { display: false }
                      }
                    }}
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-white rounded-xl shadow p-6">
                  <h3 className="text-lg font-semibold mb-4">Produk Terlaris</h3>
                  <div className="h-64">
                    <Pie 
                      data={productPieData}
                      options={{
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                          legend: { position: 'right' }
                        }
                      }}
                    />
                  </div>
                </div>
                
                <div className="bg-white rounded-xl shadow p-6">
                  <h3 className="text-lg font-semibold mb-4">Detail Produk Terlaris</h3>
                  <div className="space-y-4">
                    {topProducts.map((product, index) => (
                      <div key={index} className="flex justify-between items-center">
                        <div>
                          <p className="font-medium">{product.name}</p>
                          <p className="text-sm text-gray-500 capitalize">{product.category}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold">{product.sales} penjualan</p>
                          <p className="text-sm text-green-600">
                            {Math.round((product.sales / topProducts.reduce((a, b) => a + b.sales, 0)) * 100)}%
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'operations' && (
            <div className="space-y-8">
              <div className="bg-white rounded-xl shadow p-6">
                <h3 className="text-lg font-semibold mb-4">Daftar Pesanan Terbaru</h3>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID Pesanan</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Pelanggan</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Items</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {recentOrders.map((order, index) => (
                        <tr key={index}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{order.id}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{order.customer}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{order.items}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{order.total}</td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                              order.status === 'Selesai' ? 'bg-green-100 text-green-800' :
                              order.status === 'Diproses' ? 'bg-blue-100 text-blue-800' :
                              'bg-red-100 text-red-800'
                            }`}>
                              {order.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
              
              <div className="bg-white rounded-xl shadow p-6">
                <h3 className="text-lg font-semibold mb-4">Manajemen Inventaris</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="border rounded-lg p-4">
                    <h4 className="font-medium text-gray-700 mb-2">Stok Rendah</h4>
                    <ul className="space-y-2">
                      <li className="flex justify-between text-sm">
                        <span>Biji Kopi Arabica</span>
                        <span className="text-red-600 font-medium">2kg</span>
                      </li>
                      <li className="flex justify-between text-sm">
                        <span>Susu Segar</span>
                        <span className="text-red-600 font-medium">3L</span>
                      </li>
                    </ul>
                  </div>
                  <div className="border rounded-lg p-4">
                    <h4 className="font-medium text-gray-700 mb-2">Stok Normal</h4>
                    <ul className="space-y-2">
                      <li className="flex justify-between text-sm">
                        <span>Gula</span>
                        <span className="text-green-600 font-medium">15kg</span>
                      </li>
                      <li className="flex justify-between text-sm">
                        <span>Croissant</span>
                        <span className="text-green-600 font-medium">25</span>
                      </li>
                    </ul>
                  </div>
                  <div className="border rounded-lg p-4">
                    <h4 className="font-medium text-gray-700 mb-2">Permintaan Tinggi</h4>
                    <ul className="space-y-2">
                      <li className="flex justify-between text-sm">
                        <span>Espresso</span>
                        <span className="text-amber-600 font-medium">+45%</span>
                      </li>
                      <li className="flex justify-between text-sm">
                        <span>Sandwich</span>
                        <span className="text-amber-600 font-medium">+32%</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'feedback' && (
            <div className="space-y-8">
              <div className="bg-white rounded-xl shadow p-6">
                <h3 className="text-lg font-semibold mb-4">Feedback Pelanggan</h3>
                <div className="space-y-4">
                  {customerFeedback.map((feedback, index) => (
                    <div key={index} className="border-b pb-4 last:border-b-0 last:pb-0">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-medium">{feedback.customer}</p>
                          <div className="flex items-center mt-1">
                            {[...Array(5)].map((_, i) => (
                              <svg
                                key={i}
                                className={`w-4 h-4 ${i < feedback.rating ? 'text-amber-400' : 'text-gray-300'}`}
                                fill="currentColor"
                                viewBox="0 0 20 20"
                              >
                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                              </svg>
                            ))}
                          </div>
                        </div>
                        <span className="text-xs text-gray-500">2 hari lalu</span>
                      </div>
                      <p className="mt-2 text-gray-700">{feedback.comment}</p>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="bg-white rounded-xl shadow p-6">
                <h3 className="text-lg font-semibold mb-4">Manajemen Loyalty</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-medium text-gray-700 mb-3">Top Members</h4>
                    <ul className="space-y-3">
                      <li className="flex items-center justify-between">
                        <div className="flex items-center">
                          <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center text-green-800 font-medium mr-3">1</div>
                          <span className="font-medium">Budi Santoso</span>
                        </div>
                        <span className="text-sm bg-green-100 text-green-800 px-2 py-1 rounded-full">1200 pts</span>
                      </li>
                      <li className="flex items-center justify-between">
                        <div className="flex items-center">
                          <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-800 font-medium mr-3">2</div>
                          <span className="font-medium">Ani Wijaya</span>
                        </div>
                        <span className="text-sm bg-blue-100 text-blue-800 px-2 py-1 rounded-full">980 pts</span>
                      </li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-700 mb-3">Reward yang Tersedia</h4>
                    <ul className="space-y-3">
                      <li className="flex items-center justify-between">
                        <div className="flex items-center">
                          <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center text-amber-800 mr-3">🎁</div>
                          <span className="font-medium">Minuman Gratis</span>
                        </div>
                        <span className="text-sm text-gray-500">500 pts</span>
                      </li>
                      <li className="flex items-center justify-between">
                        <div className="flex items-center">
                          <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center text-purple-800 mr-3">🏆</div>
                          <span className="font-medium">VIP Membership</span>
                        </div>
                        <span className="text-sm text-gray-500">1500 pts</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default Dashboard;