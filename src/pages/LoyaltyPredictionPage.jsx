import { useState } from 'react';
import axios from 'axios';
import { Pie } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';

// Register ChartJS components
ChartJS.register(ArcElement, Tooltip, Legend);

const LoyaltyPredictionPage = () => {
  const [formData, setFormData] = useState({
    nama: '',
    usia: '',
    jenis_kelamin: 'Wanita',
    membership: 'Silver',
    total_kunjungan: '',
    pengeluaran: '',
    hari: ''
  });
  
  const [prediction, setPrediction] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('prediction');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    try {
      const response = await axios.post('https://3583ed4af4a2.ngrok-free.app/predict', {
        usia: parseInt(formData.usia),
        membership: formData.membership,
        total_kunjungan: parseInt(formData.total_kunjungan),
        pengeluaran: parseInt(formData.pengeluaran),
        hari: parseInt(formData.hari)
      });
      
      setPrediction(response.data.prediksi);
      setActiveTab('result');
    } catch (err) {
      setError('Terjadi kesalahan saat melakukan prediksi. Silakan coba lagi.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getLoyaltyInfo = () => {
    if (!prediction) return null;
    
    const info = {
      'Biasa': {
        title: 'Pelanggan Biasa',
        description: 'Pelanggan dengan tingkat loyalitas standar. Mereka mungkin tidak terlalu sering berkunjung atau menghabiskan banyak uang.',
        color: 'bg-blue-100 text-blue-800',
        icon: (
          <svg className="h-6 w-6 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        ),
        action: [
          'Tawarkan promo khusus untuk meningkatkan frekuensi kunjungan',
          'Berikan sampling produk baru',
          'Kirim reminder tentang program membership'
        ]
      },
      'Loyal': {
        title: 'Pelanggan Loyal',
        description: 'Pelanggan yang sudah setia dengan brand Fore Coffee. Mereka berkunjung cukup sering dan memiliki pengeluaran yang baik.',
        color: 'bg-green-100 text-green-800',
        icon: (
          <svg className="h-6 w-6 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        ),
        action: [
          'Berikan reward khusus untuk loyalitas mereka',
          'Tawarkan early access ke produk baru',
          'Kirim personalized recommendation berdasarkan preferensi mereka'
        ]
      },
      'Sangat Loyal': {
        title: 'Pelanggan Sangat Loyal',
        description: 'Pelanggan yang sangat setia dan memberikan nilai tinggi untuk bisnis. Mereka adalah pengunjung rutin dengan pengeluaran besar.',
        color: 'bg-purple-100 text-purple-800',
        icon: (
          <svg className="h-6 w-6 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
          </svg>
        ),
        action: [
          'Berikan treatment VIP dan exclusive benefits',
          'Undang ke event khusus',
          'Tawarkan program referral untuk mendapatkan reward'
        ]
      },
      'Berisiko Churn': {
        title: 'Pelanggan Berisiko Churn',
        description: 'Pelanggan yang menunjukkan tanda-tanda akan berhenti menggunakan layanan Fore Coffee. Mereka jarang berkunjung atau sudah lama tidak melakukan pembelian.',
        color: 'bg-red-100 text-red-800',
        icon: (
          <svg className="h-6 w-6 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        ),
        action: [
          'Kirim email re-engagement dengan penawaran spesial',
          'Tanyakan feedback untuk memahami alasan berkurangnya kunjungan',
          'Tawarkan promo comeback dengan diskon menarik'
        ]
      }
    };
    
    return info[prediction] || info['Biasa'];
  };

  const getLoyaltyPercentage = () => {
    if (!prediction) return { loyal: 0, notLoyal: 100 };
    
    const percentages = {
      'Biasa': { loyal: 50, notLoyal: 50 },
      'Loyal': { loyal: 75, notLoyal: 25 },
      'Sangat Loyal': { loyal: 99, notLoyal: 1 },
      'Berisiko Churn': { loyal: 15, notLoyal: 85 }
    };
    
    return percentages[prediction] || { loyal: 50, notLoyal: 50 };
  };

  const loyaltyInfo = getLoyaltyInfo();
  const loyaltyPercentage = getLoyaltyPercentage();

  const chartData = {
    labels: ['Loyal', 'Tidak Loyal'],
    datasets: [
      {
        data: [loyaltyPercentage.loyal, loyaltyPercentage.notLoyal],
        backgroundColor: [
          '#10B981',
          '#EF4444'
        ],
        borderColor: [
          '#047857',
          '#B91C1C'
        ],
        borderWidth: 1,
      },
    ],
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
            Prediksi Loyalitas Pelanggan Fore Coffee
          </h1>
          <p className="mt-3 text-xl text-gray-600">
            Masukkan data pelanggan untuk memprediksi tingkat loyalitas mereka
          </p>
        </div>
        
        <div className="bg-white shadow-xl rounded-lg overflow-hidden">
          <div className="border-b border-gray-200">
            <nav className="flex -mb-px">
              <button
                onClick={() => setActiveTab('prediction')}
                className={`py-4 px-6 text-center border-b-2 font-medium text-sm ${activeTab === 'prediction' ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
              >
                Form Prediksi
              </button>
              {prediction && (
                <button
                  onClick={() => setActiveTab('result')}
                  className={`py-4 px-6 text-center border-b-2 font-medium text-sm ${activeTab === 'result' ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
                >
                  Hasil Prediksi
                </button>
              )}
            </nav>
          </div>
          
          <div className="p-6 sm:p-8">
            {activeTab === 'prediction' ? (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                  <div className="sm:col-span-3">
                    <label htmlFor="nama" className="block text-sm font-medium text-gray-700">
                      Nama Pelanggan
                    </label>
                    <div className="mt-1 relative rounded-md shadow-sm">
                      <input
                        type="text"
                        name="nama"
                        id="nama"
                        value={formData.nama}
                        onChange={handleChange}
                        className="block w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                        placeholder="Nama lengkap pelanggan"
                      />
                    </div>
                  </div>
                  
                  <div className="sm:col-span-3">
                    <label htmlFor="usia" className="block text-sm font-medium text-gray-700">
                      Usia
                    </label>
                    <div className="mt-1 relative rounded-md shadow-sm">
                      <input
                        type="number"
                        name="usia"
                        id="usia"
                        value={formData.usia}
                        onChange={handleChange}
                        className="block w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                        required
                        min="18"
                        placeholder="Usia pelanggan"
                      />
                    </div>
                  </div>
                  
                  <div className="sm:col-span-3">
                    <label htmlFor="jenis_kelamin" className="block text-sm font-medium text-gray-700">
                      Jenis Kelamin
                    </label>
                    <div className="mt-1 relative rounded-md shadow-sm">
                      <select
                        id="jenis_kelamin"
                        name="jenis_kelamin"
                        value={formData.jenis_kelamin}
                        onChange={handleChange}
                        className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                      >
                        <option>Wanita</option>
                        <option>Pria</option>
                      </select>
                    </div>
                  </div>
                  
                  <div className="sm:col-span-3">
                    <label htmlFor="membership" className="block text-sm font-medium text-gray-700">
                      Membership
                    </label>
                    <div className="mt-1 relative rounded-md shadow-sm">
                      <select
                        id="membership"
                        name="membership"
                        value={formData.membership}
                        onChange={handleChange}
                        className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                        required
                      >
                        <option>Non-Member</option>
                        <option>Silver</option>
                        <option>Gold</option>
                        <option>Platinum</option>
                      </select>
                    </div>
                  </div>
                  
                  <div className="sm:col-span-2">
                    <label htmlFor="total_kunjungan" className="block text-sm font-medium text-gray-700">
                      Total Kunjungan/Bulan
                    </label>
                    <div className="mt-1 relative rounded-md shadow-sm">
                      <input
                        type="number"
                        name="total_kunjungan"
                        id="total_kunjungan"
                        value={formData.total_kunjungan}
                        onChange={handleChange}
                        className="block w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                        required
                        min="0"
                        placeholder="Jumlah kunjungan"
                      />
                    </div>
                  </div>
                  
                  <div className="sm:col-span-2">
                    <label htmlFor="pengeluaran" className="block text-sm font-medium text-gray-700">
                      Total Pengeluaran (Rp)
                    </label>
                    <div className="mt-1 relative rounded-md shadow-sm">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <span className="text-gray-500 sm:text-sm">Rp</span>
                      </div>
                      <input
                        type="number"
                        name="pengeluaran"
                        id="pengeluaran"
                        value={formData.pengeluaran}
                        onChange={handleChange}
                        className="block w-full pl-10 border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                        required
                        min="0"
                        placeholder="0"
                      />
                    </div>
                  </div>
                  
                  <div className="sm:col-span-2">
                    <label htmlFor="hari" className="block text-sm font-medium text-gray-700">
                      Hari Sejak Pembelian Terakhir
                    </label>
                    <div className="mt-1 relative rounded-md shadow-sm">
                      <input
                        type="number"
                        name="hari"
                        id="hari"
                        value={formData.hari}
                        onChange={handleChange}
                        className="block w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                        required
                        min="0"
                        placeholder="Jumlah hari"
                      />
                    </div>
                  </div>
                </div>
                
                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={loading}
                    className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
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
                      'Prediksi Loyalitas'
                    )}
                  </button>
                </div>
              </form>
            ) : (
              <div className="space-y-6">
                <div className="p-4 rounded-lg shadow-inner border border-gray-200">
                  <div className="flex items-center">
                    <div className={`flex-shrink-0 p-3 rounded-full ${loyaltyInfo.color}`}>
                      {loyaltyInfo.icon}
                    </div>
                    <div className="ml-4">
                      <h3 className="text-lg font-medium text-gray-900">
                        {formData.nama || 'Pelanggan'} dikategorikan sebagai: <span className="font-bold">{prediction}</span>
                      </h3>
                      <p className="mt-1 text-sm text-gray-600">
                        {loyaltyInfo.description}
                      </p>
                    </div>
                  </div>
                </div>
                
                {/* Pie Chart Section */}
                <div className="bg-white shadow overflow-hidden sm:rounded-lg">
                  <div className="px-4 py-5 sm:px-6 bg-gray-50 border-b border-gray-200">
                    <h3 className="text-lg leading-6 font-medium text-gray-900">
                      Tingkat Loyalitas
                    </h3>
                  </div>
                  <div className="px-4 py-5 sm:p-6">
                    <div className="max-w-md mx-auto">
                      <Pie 
                        data={chartData} 
                        options={{
                          responsive: true,
                          plugins: {
                            legend: {
                              position: 'bottom',
                            },
                            tooltip: {
                              callbacks: {
                                label: function(context) {
                                  return `${context.label}: ${context.raw}%`;
                                }
                              }
                            }
                          }
                        }}
                      />
                      <div className="mt-4 text-center text-sm text-gray-600">
                        <p>Pelanggan ini memiliki <span className="font-semibold">{loyaltyPercentage.loyal}%</span> kecenderungan loyalitas</p>
                        <p>dan <span className="font-semibold">{loyaltyPercentage.notLoyal}%</span> risiko tidak loyal</p>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="bg-white shadow overflow-hidden sm:rounded-lg">
                  <div className="px-4 py-5 sm:px-6 bg-gray-50 border-b border-gray-200">
                    <h3 className="text-lg leading-6 font-medium text-gray-900">
                      Insight & Rekomendasi
                    </h3>
                  </div>
                  <div className="border-t border-gray-200 px-4 py-5 sm:p-0">
                    <dl className="sm:divide-y sm:divide-gray-200">
                      <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                        <dt className="text-sm font-medium text-gray-500">
                          Deskripsi
                        </dt>
                        <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                          {loyaltyInfo.description}
                        </dd>
                      </div>
                      <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                        <dt className="text-sm font-medium text-gray-500">
                          Yang Perlu Dilakukan
                        </dt>
                        <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                          <ul className="list-disc pl-5 space-y-2">
                            {loyaltyInfo.action.map((action, index) => (
                              <li key={index} className="hover:text-indigo-600 transition-colors duration-150">
                                {action}
                              </li>
                            ))}
                          </ul>
                        </dd>
                      </div>
                      {prediction === 'Loyal' || prediction === 'Sangat Loyal' ? (
                        <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                          <dt className="text-sm font-medium text-gray-500">
                            Untuk Email Marketing
                          </dt>
                          <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              Loyalty Members
                            </span>
                            <p className="mt-2">Pelanggan ini dapat ditambahkan ke segment "Loyalty Members" untuk menerima penawaran eksklusif dan program loyalitas.</p>
                          </dd>
                        </div>
                      ) : null}
                      {prediction === 'Berisiko Churn' ? (
                        <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                          <dt className="text-sm font-medium text-gray-500">
                            Tindakan Prioritas
                          </dt>
                          <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                            <div className="bg-red-50 border-l-4 border-red-400 p-4">
                              <div className="flex">
                                <div className="flex-shrink-0">
                                  <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                  </svg>
                                </div>
                                <div className="ml-3">
                                  <p className="text-sm text-red-700">
                                    Segera lakukan tindakan retensi karena pelanggan ini berisiko untuk berhenti berlangganan.
                                  </p>
                                </div>
                              </div>
                            </div>
                          </dd>
                        </div>
                      ) : null}
                    </dl>
                  </div>
                </div>
                
                <div className="flex justify-end">
                  <button
                    onClick={() => setActiveTab('prediction')}
                    className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-200"
                  >
                    Kembali ke Form
                  </button>
                </div>
              </div>
            )}
            
            {error && (
              <div className="mt-6 rounded-md bg-red-50 p-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-red-800">{error}</h3>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoyaltyPredictionPage;