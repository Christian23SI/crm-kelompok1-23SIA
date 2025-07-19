import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const SalesPrediction = () => {
  const [date, setDate] = useState('');
  const [prediction, setPrediction] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [apiUrl] = useState('https://f85d944d7ac7.ngrok-free.app');
  const [predictionsHistory, setPredictionsHistory] = useState([]);
  const [showAnimation, setShowAnimation] = useState(false);

  // Efek untuk animasi
  useEffect(() => {
    if (prediction) {
      setShowAnimation(true);
      const timer = setTimeout(() => setShowAnimation(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [prediction]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!date) {
      setError('Silakan pilih tanggal terlebih dahulu');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const response = await axios.post(`${apiUrl}/predict`, { date });
      
      if (!response.data.success) {
        throw new Error(response.data.error || 'Prediksi gagal');
      }

      setPrediction(response.data);
      
      // Tambahkan ke history prediksi
      if (response.data.type === 'prediction') {
        setPredictionsHistory(prev => [
          ...prev,
          {
            date: response.data.date,
            value: response.data.value,
            confidence: response.data.confidence
          }
        ]);
      }
    } catch (err) {
      console.error('Error:', err);
      setError(err.response?.data?.error || err.message || 'Terjadi kesalahan');
    } finally {
      setLoading(false);
    }
  };

  // Data untuk grafik prediksi
  const getChartData = () => {
    return {
      labels: predictionsHistory.map(item => item.date),
      datasets: [
        {
          label: 'History Prediksi',
          data: predictionsHistory.map(item => item.value),
          borderColor: 'rgba(79, 70, 229, 0.8)',
          backgroundColor: 'rgba(79, 70, 229, 0.1)',
          borderWidth: 2,
          tension: 0.4,
          fill: true,
          pointBackgroundColor: 'rgba(79, 70, 229, 1)',
          pointRadius: 5,
          pointHoverRadius: 7
        }
      ]
    };
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      tooltip: {
        callbacks: {
          label: (context) => {
            const pred = predictionsHistory[context.dataIndex];
            return [
              `Prediksi: ${context.raw.toFixed(2)} produk`,
            ];
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: false,
        grid: {
          color: 'rgba(0, 0, 0, 0.05)'
        },
        ticks: {
          callback: (value) => `${value} produk`
        }
      },
      x: {
        grid: {
          display: false
        },
        ticks: {
          maxRotation: 45,
          minRotation: 45
        }
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Header dengan animasi */}
        <div className="text-center mb-8 transform transition-all duration-500 hover:scale-105">
          <h1 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
            Ramalan Penjualan Fore Coffee
          </h1>
          <p className="mt-3 text-xl text-gray-600">
            Sistem ramalan penjualan harian untuk optimasi stok dan manajemen toko
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Form Prediksi */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-lg overflow-hidden transition-all duration-300 hover:shadow-xl">
              <div className="p-6">
                <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
                  <svg className="w-5 h-5 text-indigo-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  Prediksi Penjualan
                </h2>
                
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-1">
                      Tanggal Prediksi
                    </label>
                    <div className="relative">
                      <input
                        type="date"
                        id="date"
                        value={date}
                        onChange={(e) => setDate(e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
                        min={new Date().toISOString().split('T')[0]}
                        required
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className={`w-full px-4 py-3 rounded-lg font-medium text-white transition-all duration-300 flex items-center justify-center
                      ${loading ? 'bg-indigo-400' : 'bg-indigo-600 hover:bg-indigo-700 shadow-md hover:shadow-lg'}`}
                  >
                    {loading ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Memproses...
                      </>
                    ) : (
                      <>
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                        </svg>
                        Buat Prediksi
                      </>
                    )}
                  </button>
                </form>

                {error && (
                  <div className="mt-4 p-3 bg-red-50 text-red-600 rounded-lg text-sm border border-red-100 animate-pulse">
                    {error}
                  </div>
                )}
              </div>
            </div>

            {/* Hasil Prediksi */}
            {prediction && (
              <div className={`mt-6 bg-white rounded-xl shadow-lg overflow-hidden transition-all duration-500 ${showAnimation ? 'animate-bounce' : ''}`}>
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-semibold text-gray-800">Hasil Prediksi</h3>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      prediction.type === 'actual' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-indigo-100 text-indigo-800'
                    }`}>
                      {prediction.type === 'actual' ? 'DATA AKTUAL' : 'PREDIKSI'}
                    </span>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <span className="text-gray-600">Tanggal</span>
                      <span className="font-medium">{prediction.date}</span>
                    </div>

                    <div className="flex items-center justify-between p-3 bg-indigo-50 rounded-lg border border-indigo-100">
                      <span className="text-indigo-600">Jumlah Produk</span>
                      <span className="text-xl font-bold text-indigo-700">
                        {prediction.value.toFixed(2)} produk
                      </span>
                    </div>

                    {prediction.message && (
                      <div className="p-3 bg-blue-50 text-blue-600 rounded-lg text-sm">
                        {prediction.message}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Grafik dan History Prediksi */}
          <div className="lg:col-span-2 space-y-6">
            {/* Grafik Prediksi */}
            <div className="bg-white rounded-xl shadow-lg overflow-hidden p-6 transition-all duration-300 hover:shadow-xl">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-800 flex items-center">
                  <svg className="w-5 h-5 text-indigo-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                  Trend Prediksi
                </h2>
                <span className="text-sm text-gray-500">
                  {predictionsHistory.length} prediksi dibuat
                </span>
              </div>
              
              <div className="h-80">
                {predictionsHistory.length > 0 ? (
                  <Line data={getChartData()} options={chartOptions} />
                ) : (
                  <div className="h-full flex items-center justify-center bg-gray-50 rounded-lg">
                    <div className="text-center p-6 max-w-sm">
                      <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                      </svg>
                      <h3 className="mt-2 text-sm font-medium text-gray-900">Belum ada data prediksi</h3>
                      <p className="mt-1 text-sm text-gray-500">Buat prediksi pertama Anda untuk melihat visualisasi</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Informasi Model */}
            <div className="bg-white rounded-xl shadow-lg overflow-hidden transition-all duration-300 hover:shadow-xl">
              <div className="p-6">
                <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
                  <svg className="w-5 h-5 text-indigo-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                  Tentang Model Prediksi
                </h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 bg-indigo-50 rounded-lg">
                    <h3 className="font-medium text-indigo-800 mb-2">Spesifikasi Model</h3>
                    <ul className="space-y-2 text-sm text-indigo-700">
                      <li className="flex items-start">
                        <svg className="flex-shrink-0 h-4 w-4 text-indigo-500 mt-0.5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        Random Forest 
                      </li>
                      <li className="flex items-start">
                        <svg className="flex-shrink-0 h-4 w-4 text-indigo-500 mt-0.5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        Data historis 2023-2025
                      </li>
                      <li className="flex items-start">
                        <svg className="flex-shrink-0 h-4 w-4 text-indigo-500 mt-0.5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        Mean Absolute Error &lt;5%
                      </li>
                    </ul>
                  </div>
                  
                  <div className="p-4 bg-amber-50 rounded-lg">
                    <h3 className="font-medium text-amber-800 mb-2">Panduan Penggunaan</h3>
                    <ul className="space-y-2 text-sm text-amber-700">
                      <li className="flex items-start">
                        <svg className="flex-shrink-0 h-4 w-4 text-amber-500 mt-0.5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Pilih tanggal di masa depan untuk prediksi
                      </li>
                      <li className="flex items-start">
                        <svg className="flex-shrink-0 h-4 w-4 text-amber-500 mt-0.5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Hasil akan muncul dalam 1-2 detik
                      </li>
                      <li className="flex items-start">
                        <svg className="flex-shrink-0 h-4 w-4 text-amber-500 mt-0.5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Grafik akan terupdate otomatis
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SalesPrediction;