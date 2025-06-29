import React, { useState } from 'react';
import {
  Star, Gift, CheckCircle2, ShoppingBag, RefreshCw, X,
  ChevronRight, Gem, Award, Trophy, Zap, Coffee, Cake,
  Clock, Mail, Smartphone, CalendarDays, CircleDollarSign
} from 'lucide-react';

const userData = {
  id: 1,
  name: 'Abellia',
  email: 'abel@mail.com',
  phone: '081234567890',
  tier: 'Gold',
  points: 1250,
  joinDate: '2023-05-15',
  purchases: [
    { id: 'INV-001', date: '2023-06-10', items: '2x Latte, 1x Croissant', total: 85000, status: 'Completed', pointsEarned: 85 },
    { id: 'INV-002', date: '2023-06-15', items: '1x Espresso', total: 25000, status: 'Completed', pointsEarned: 25 },
    { id: 'INV-005', date: '2023-07-01', items: '3x Cappuccino', total: 90000, status: 'Completed', pointsEarned: 90 }
  ]
};

const rewards = [
  {
    id: 1,
    name: "Diskon 10%",
    description: "Dapatkan diskon 10% untuk pembelian berikutnya",
    pointsRequired: 200,
    category: "discount",
    validity: "30 hari",
    claimed: false,
    icon: <CircleDollarSign className="w-5 h-5" />
  },
  {
    id: 2,
    name: "Minuman Gratis",
    description: "Tukarkan dengan minuman reguler gratis",
    pointsRequired: 500,
    category: "free-drink",
    validity: "14 hari",
    claimed: true,
    icon: <Coffee className="w-5 h-5" />
  },
  {
    id: 3,
    name: "Sarapan Spesial",
    description: "1 Minuman + 1 Makanan dengan harga spesial",
    pointsRequired: 300,
    category: "special-deal",
    validity: "60 hari",
    claimed: false,
    icon: <Cake className="w-5 h-5" />
  },
  {
    id: 4,
    name: "Diskon 20%",
    description: "Dapatkan diskon 20% untuk pembelian di akhir pekan",
    pointsRequired: 800,
    category: "discount",
    validity: "30 hari",
    claimed: false,
    icon: <Zap className="w-5 h-5" />
  }
];

const tiers = [
  {
    name: "Silver",
    pointsRequired: 0,
    benefits: ["1 poin per Rp1.000", "Voucher ulang tahun"],
    icon: <Award className="w-6 h-6 text-gray-400" />
  },
  {
    name: "Gold",
    pointsRequired: 1000,
    benefits: ["1.5 poin per Rp1.000", "Voucher ulang tahun", "Prioritas pembuatan pesanan"],
    icon: <Trophy className="w-6 h-6 text-amber-400" />
  },
  {
    name: "Platinum",
    pointsRequired: 3000,
    benefits: ["2 poin per Rp1.000", "Voucher ulang tahun spesial", "Prioritas pembuatan pesanan", "Undangan event eksklusif"],
    icon: <Gem className="w-6 h-6 text-purple-500" />
  }
];

function formatCurrency(num) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(num);
}

function formatDate(dateString) {
  const options = { year: 'numeric', month: 'long', day: 'numeric' };
  return new Date(dateString).toLocaleDateString('id-ID', options);
}

export default function LoyaltyManagement() {
  const [activeTab, setActiveTab] = useState('rewards');
  const [selectedReward, setSelectedReward] = useState(null);
  const [showClaimModal, setShowClaimModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const handleClaimReward = (reward) => {
    setSelectedReward(reward);
    setShowClaimModal(true);
  };

  const confirmClaim = () => {
    setShowClaimModal(false);
    setShowSuccessModal(true);
  };

  const nextTier = tiers.find(tier => tier.pointsRequired > userData.points) || tiers[tiers.length - 1];
  const progressToNextTier = Math.min(100, (userData.points / nextTier.pointsRequired) * 100);

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        {/* Header Section */}
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold text-gray-900">Program Loyalty</h1>
          <p className="mt-3 text-lg text-gray-600 max-w-2xl mx-auto">
            Kumpulkan poin dari setiap pembelian dan nikmati berbagai keuntungan eksklusif
          </p>
        </div>

        {/* User Profile Card */}
        <div className="bg-gradient-to-r from-amber-500 to-yellow-600 rounded-2xl shadow-xl p-6 text-black mb-8 transform transition-all hover:shadow-2xl">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="flex items-center mb-4 md:mb-0">
              <div className="bg-white/20 p-3 rounded-full backdrop-blur-sm mr-4">
                <Star className="h-8 w-8" />
              </div>
              <div>
                <h2 className="text-xl font-bold">{userData.name}</h2>
                <div className="flex items-center mt-1">
                  <span className="bg-white/20 px-2 py-1 rounded-full text-sm flex items-center">
                    <Trophy className="w-4 h-4 mr-1" />
                    {userData.tier} Member
                  </span>
                  <span className="ml-3 text-yellow-600 text-sm flex items-center">
                    <CalendarDays className="w-4 h-4 mr-1" />
                    Bergabung {formatDate(userData.joinDate)}
                  </span>
                </div>
              </div>
            </div>
            <div className="text-center md:text-right bg-white/10 p-3 rounded-lg">
              <p className="text-3xl font-bold flex items-center justify-center md:justify-end">
                {userData.points.toLocaleString('id-ID')}
                <span className="ml-2 text-yellow-600 text-lg">poin</span>
              </p>
              <p className="text-yellow-600 text-sm flex items-center justify-center md:justify-end mt-1">
                <CircleDollarSign className="w-4 h-4 mr-1" />
                1.5x poin untuk member Gold
              </p>
            </div>
          </div>
        </div>

        {/* Progress to Next Tier */}
        <div className="bg-white rounded-2xl shadow-md p-6 mb-8 border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <RefreshCw className="w-5 h-5 mr-2 text-amber-500" />
              Progress Menuju Tier Platinum
            </h3>
            <span className="text-sm font-medium text-amber-600">
              42% tercapai
            </span>
          </div>

          <div className="mb-2 flex justify-between text-sm text-gray-600">
            <span className="flex items-center">
              <span className="w-3 h-3 rounded-full bg-amber-400 mr-2"></span>
              Gold (1250 poin)
            </span>
            <span className="flex items-center">
              <span className="w-3 h-3 rounded-full bg-gray-300 mr-2"></span>
              Platinum (3000 poin)
            </span>
          </div>

          <div className="w-full bg-gray-200 rounded-full h-3 mb-2">
            <div
              className="h-3 rounded-full"
              style={{
                width: '42%',
                background: 'linear-gradient(to right, #fbbf24, #d97706)'
              }}
            ></div>
          </div>

          <p className="text-sm text-gray-500">
            Butuh <span className="font-medium">1750</span> poin lagi untuk mencapai tier Platinum
          </p>
        </div>

        {/* Tabs Navigation */}
        <div className="border-b border-gray-200 mb-8">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('rewards')}
              className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center ${activeTab === 'rewards' ? 'border-amber-500 text-amber-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
            >
              <Gift className="w-5 h-5 mr-2" />
              Hadiah & Reward
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center ${activeTab === 'history' ? 'border-amber-500 text-amber-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
            >
              <ShoppingBag className="w-5 h-5 mr-2" />
              Riwayat Pembelian
            </button>
            <button
              onClick={() => setActiveTab('tiers')}
              className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center ${activeTab === 'tiers' ? 'border-amber-500 text-amber-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
            >
              <Trophy className="w-5 h-5 mr-2" />
              Level Membership
            </button>
          </nav>
        </div>

        {/* Rewards Tab */}
        {activeTab === 'rewards' && (
          <div className="space-y-8">
            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
                <Gift className="w-6 h-6 mr-2 text-amber-500" />
                Reward Tersedia
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {rewards.filter(r => !r.claimed).map(reward => (
                  <div key={reward.id} className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-all">
                    <div className="p-5">
                      <div className="flex justify-between items-start">
                        <div className="flex items-start">
                          <div className="bg-amber-100 p-2 rounded-lg mr-4">
                            {reward.icon}
                          </div>
                          <div>
                            <h4 className="text-lg font-bold text-gray-900">{reward.name}</h4>
                            <p className="text-gray-600 mt-1 text-sm">{reward.description}</p>
                          </div>
                        </div>
                        <span className="bg-amber-100 text-amber-800 text-xs px-2 py-1 rounded-full whitespace-nowrap">
                          {reward.pointsRequired} poin
                        </span>
                      </div>
                      <div className="mt-4 flex justify-between items-center">
                        <span className="text-xs text-gray-500 flex items-center">
                          <Clock className="w-3 h-3 mr-1" />
                          Berlaku {reward.validity}
                        </span>
                        <button
                          onClick={() => handleClaimReward(reward)}
                          disabled={userData.points < reward.pointsRequired}
                          className={`px-4 py-2 rounded-lg font-medium text-sm flex items-center ${userData.points >= reward.pointsRequired ?
                            'bg-amber-500 hover:bg-amber-600 text-white' :
                            'bg-gray-100 text-gray-400 cursor-not-allowed'}`}
                        >
                          Klaim Sekarang
                          <ChevronRight className="w-4 h-4 ml-1" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
                <CheckCircle2 className="w-6 h-6 mr-2 text-green-500" />
                Reward yang Sudah Diklaim
              </h3>
              {rewards.filter(r => r.claimed).length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {rewards.filter(r => r.claimed).map(reward => (
                    <div key={reward.id} className="bg-white border border-green-100 rounded-xl shadow-sm overflow-hidden">
                      <div className="p-5">
                        <div className="flex justify-between items-start">
                          <div className="flex items-start">
                            <div className="bg-green-100 p-2 rounded-lg mr-4">
                              {reward.icon}
                            </div>
                            <div>
                              <h4 className="text-lg font-bold text-gray-900">{reward.name}</h4>
                              <p className="text-gray-600 mt-1 text-sm">{reward.description}</p>
                            </div>
                          </div>
                          <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                            Diklaim
                          </span>
                        </div>
                        <div className="mt-4">
                          <span className="text-xs text-gray-500 flex items-center">
                            <Clock className="w-3 h-3 mr-1" />
                            Berlaku {reward.validity}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="bg-gray-50 rounded-xl p-8 text-center border border-dashed border-gray-300">
                  <Gift className="w-10 h-10 mx-auto text-gray-400" />
                  <p className="text-gray-500 mt-3">Anda belum memiliki reward yang sudah diklaim</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Purchase History Tab */}
        {activeTab === 'history' && (
          <div>
            <h3 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
              <ShoppingBag className="w-6 h-6 mr-2 text-amber-500" />
              Riwayat Pembelian
            </h3>
            <div className="bg-white shadow-sm rounded-xl overflow-hidden">
              <ul className="divide-y divide-gray-200">
                {userData.purchases.map((purchase) => (
                  <li key={purchase.id} className="hover:bg-gray-50 transition-colors">
                    <div className="px-5 py-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-900 flex items-center">
                            <span className="bg-gray-100 px-2 py-1 rounded mr-3">#{purchase.id}</span>
                            {formatDate(purchase.date)}
                          </p>
                          <p className="mt-2 text-sm text-gray-600">{purchase.items}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-semibold text-gray-900">{formatCurrency(purchase.total)}</p>
                          <p className="mt-1 text-sm text-amber-600 flex items-center justify-end">
                            <Star className="w-4 h-4 mr-1" />
                            +{purchase.pointsEarned} poin
                          </p>
                        </div>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {/* Tiers Tab */}
        {activeTab === 'tiers' && (
          <div>
            <h3 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
              <Trophy className="w-6 h-6 mr-2 text-amber-500" />
              Level Membership
            </h3>
            <div className="space-y-4">
              {tiers.map((tier, index) => (
                <div
                  key={tier.name}
                  className={`border rounded-xl p-5 transition-all ${userData.tier === tier.name ?
                    'border-amber-300 bg-amber-50 shadow-sm' :
                    'border-gray-200 hover:border-gray-300'}`}
                >
                  <div className="flex items-center">
                    <div className={`p-3 rounded-lg mr-4 ${userData.tier === tier.name ?
                      'bg-amber-100 text-amber-600' :
                      'bg-gray-100 text-gray-500'}`}
                    >
                      {tier.icon}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center">
                        <h4 className="font-bold text-lg">
                          {tier.name}
                        </h4>
                        {userData.tier === tier.name && (
                          <span className="ml-3 text-xs bg-amber-500 text-white px-2 py-1 rounded-full">
                            Tier Anda
                          </span>
                        )}
                      </div>
                      <p className="text-gray-600 text-sm mt-1">
                        Minimum {tier.pointsRequired} poin
                      </p>
                    </div>
                  </div>
                  <div className="mt-4 pl-16">
                    <h5 className="text-sm font-medium text-gray-900 mb-2">Keuntungan:</h5>
                    <ul className="space-y-2">
                      {tier.benefits.map((benefit, i) => (
                        <li key={i} className="flex items-start">
                          <CheckCircle2 className="h-4 w-4 text-amber-500 mt-0.5 mr-2 flex-shrink-0" />
                          <span className="text-sm text-gray-600">{benefit}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Claim Reward Modal */}
      {showClaimModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6 animate-fade-in">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-gray-900">Klaim Reward</h3>
              <button onClick={() => setShowClaimModal(false)} className="text-gray-400 hover:text-gray-500">
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="mb-4 text-gray-600">Anda akan menukarkan poin untuk reward berikut:</p>

            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-4">
              <div className="flex items-start">
                <div className="bg-amber-100 p-2 rounded-lg mr-3">
                  {selectedReward.icon}
                </div>
                <div>
                  <h4 className="font-bold text-amber-800">{selectedReward.name}</h4>
                  <p className="text-amber-700 text-sm">{selectedReward.description}</p>
                </div>
              </div>
              <div className="mt-3 pt-3 border-t border-amber-100 flex justify-between text-sm">
                <span className="text-amber-600 flex items-center">
                  <Clock className="w-4 h-4 mr-1" />
                  Berlaku {selectedReward.validity}
                </span>
                <span className="font-medium text-amber-800">
                  {selectedReward.pointsRequired} poin
                </span>
              </div>
            </div>

            <div className="bg-gray-50 p-3 rounded-lg mb-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-700">Poin Anda:</span>
                <span className="font-medium">{userData.points} poin</span>
              </div>
              <div className="flex justify-between items-center mt-1">
                <span className="text-gray-700">Poin setelah klaim:</span>
                <span className="font-medium text-amber-600">
                  {userData.points - selectedReward.pointsRequired} poin
                </span>
              </div>
            </div>

            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowClaimModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Batal
              </button>
              <button
                onClick={confirmClaim}
                className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-lg transition-colors flex items-center"
              >
                Konfirmasi Klaim
                <ChevronRight className="w-4 h-4 ml-1" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Success Modal */}
      {showSuccessModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6 text-center animate-fade-in">
            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-4">
              <CheckCircle2 className="h-8 w-8 text-green-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Reward Berhasil Diklaim!</h3>
            <p className="text-gray-600 mb-4">
              Anda telah berhasil menukarkan poin untuk reward <span className="font-medium">{selectedReward.name}</span>.
            </p>

            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4 text-left">
              <div className="flex items-center text-green-800">
                <Mail className="w-5 h-5 mr-2 flex-shrink-0" />
                <span>Kode voucher telah dikirim ke email {userData.email}</span>
              </div>
              <div className="flex items-center text-green-800 mt-2">
                <Smartphone className="w-5 h-5 mr-2 flex-shrink-0" />
                <span>Juga tersedia di halaman Riwayat Pembelian</span>
              </div>
            </div>

            <button
              onClick={() => setShowSuccessModal(false)}
              className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg w-full transition-colors"
            >
              Tutup
            </button>
          </div>
        </div>
      )}
    </div>
  );
}