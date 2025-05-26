import React from 'react'
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
} from 'chart.js'
import { Bar, Line } from 'react-chartjs-2'

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend
)

const Dashboard = () => {
  // Data summary cards
  const stats = [
    { label: "Pendapatan Hari Ini", value: "$53,000", percent: "+55%", color: "green" },
    { label: "Pengguna Hari Ini", value: "2,300", percent: "+3%", color: "blue" },
    { label: "Klien Baru", value: "+3,462", percent: "-2%", color: "red" },
    { label: "Penjualan", value: "$103,430", percent: "+5%", color: "purple" },
  ]

  // Data untuk grafik Penjualan Bulanan (Bar Chart)
  const barData = {
    labels: ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"],
    datasets: [
      {
        label: "Penjualan (dalam ribuan $)",
        data: [12, 19, 14, 17, 22, 30, 28, 26, 32, 35, 40, 45],
        backgroundColor: "rgba(99, 102, 241, 0.7)", // purple-600
      },
    ],
  }

  const barOptions = {
    responsive: true,
    plugins: {
      legend: { position: 'top' },
      title: { display: true, text: 'Penjualan Bulanan Tahun Ini' },
    },
  }

  // Data untuk grafik Pertumbuhan Pelanggan (Line Chart)
  const lineData = {
    labels: ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"],
    datasets: [
      {
        label: "Jumlah Pelanggan",
        data: [50, 75, 120, 180, 220, 260, 300, 350, 400, 430, 460, 500],
        borderColor: "rgba(59, 130, 246, 1)", // blue-500
        backgroundColor: "rgba(59, 130, 246, 0.3)",
        fill: true,
        tension: 0.3,
        pointRadius: 4,
      },
    ],
  }

  const lineOptions = {
    responsive: true,
    plugins: {
      legend: { position: 'top' },
      title: { display: true, text: 'Pertumbuhan Pelanggan Tahun Ini' },
    },
  }

  return (
    <div className="p-6 space-y-8">
      {/* Statistik utama */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map(({ label, value, percent, color }) => (
          <div key={label} className="bg-white rounded-xl shadow p-5">
            <p className="text-sm text-gray-500">{label}</p>
            <h2 className={`text-2xl font-bold text-${color}-600 flex items-center gap-2`}>
              {value}
              <span className={`text-xs font-semibold text-${color}-500`}>{percent}</span>
            </h2>
          </div>
        ))}
      </div>

      {/* Grafik Penjualan Bulanan */}
      <div className="bg-white rounded-xl shadow p-6">
        <Bar options={barOptions} data={barData} />
      </div>

      {/* Grafik Pertumbuhan Pelanggan */}
      <div className="bg-white rounded-xl shadow p-6">
        <Line options={lineOptions} data={lineData} />
      </div>
    </div>
  )
}

export default Dashboard