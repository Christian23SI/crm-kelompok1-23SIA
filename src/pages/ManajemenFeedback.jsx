import React, { useState, useEffect } from 'react';
import { FiStar, FiMessageSquare,FiSearch, FiUser, FiMail, FiThumbsUp, FiThumbsDown, FiSend } from 'react-icons/fi';

const FeedbackSystem = () => {
  // Data feedback contoh
  const initialFeedbacks = [
    {
      id: 1,
      customerName: "Budi Santoso",
      email: "budi@example.com",
      rating: 5,
      comment: "Kopinya enak banget! Pelayanan juga ramah.",
      date: "2023-05-20",
      responses: [
        {
          id: 1,
          type: "auto",
          message: "Terima kasih atas rating 5 bintang! Kami sangat senang Anda menikmati kopi dan pelayanan kami.",
          date: "2023-05-20"
        }
      ],
      resolved: true
    },
    {
      id: 2,
      customerName: "Ani Wijaya",
      email: "ani@example.com",
      rating: 3,
      comment: "Rasanya cukup enak tapi tempatnya terlalu ramai.",
      date: "2023-05-18",
      responses: [
        {
          id: 1,
          type: "auto",
          message: "Terima kasih atas feedback 3 bintang Anda. Kami akan berusaha meningkatkan pelayanan kami.",
          date: "2023-05-18"
        },
        {
          id: 2,
          type: "manual",
          message: "Halo Ani, terima kasih atas masukannya. Kami sedang mempertimbangkan perluasan tempat untuk kenyamanan pelanggan.",
          date: "2023-05-19",
          staffName: "Ahmad",
          staffRole: "Customer Service"
        }
      ],
      resolved: false
    },
    {
      id: 3,
      customerName: "Citra Dewi",
      email: "citra@example.com",
      rating: 1,
      comment: "Pesanan saya salah dan pelayannya lambat!",
      date: "2023-05-15",
      responses: [
        {
          id: 1,
          type: "auto",
          message: "Kami sangat menyesal mendengar pengalaman Anda. Tim kami akan segera menindaklanjuti keluhan ini.",
          date: "2023-05-15"
        },
        {
          id: 2,
          type: "manual",
          message: "Halo Citra, mohon maaf atas ketidaknyamanan. Kami telah memberikan voucher gratis sebagai kompensasi. Mohon cek email Anda.",
          date: "2023-05-16",
          staffName: "Rina",
          staffRole: "Manajer"
        }
      ],
      resolved: true
    }
  ];

  // State management
  const [feedbacks, setFeedbacks] = useState(initialFeedbacks);
  const [newResponse, setNewResponse] = useState("");
  const [activeFeedback, setActiveFeedback] = useState(null);
  const [filter, setFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [stats, setStats] = useState({
    total: 0,
    averageRating: 0,
    ratingCounts: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
  });

  // Auto-response templates based on rating
  const autoResponses = {
    1: "Kami sangat menyesal mendengar pengalaman Anda. Tim kami akan segera menindaklanjuti keluhan ini.",
    2: "Kami memohon maaf atas ketidakpuasan Anda. Kami akan memperbaiki pelayanan kami.",
    3: "Terima kasih atas feedback 3 bintang Anda. Kami akan berusaha meningkatkan pelayanan kami.",
    4: "Terima kasih atas rating 4 bintang! Kami senang Anda menikmati pengalaman di Fore Coffee.",
    5: "Terima kasih atas rating 5 bintang! Kami sangat senang Anda menikmati kopi dan pelayanan kami."
  };

  // Calculate stats
  useEffect(() => {
    const total = feedbacks.length;
    const sum = feedbacks.reduce((acc, curr) => acc + curr.rating, 0);
    const average = total > 0 ? (sum / total).toFixed(1) : 0;
    
    const counts = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    feedbacks.forEach(fb => counts[fb.rating]++);
    
    setStats({
      total,
      averageRating: average,
      ratingCounts: counts
    });
  }, [feedbacks]);

  // Filter feedbacks
  const filteredFeedbacks = feedbacks.filter(feedback => {
    const matchesFilter = 
      filter === "all" || 
      (filter === "unresolved" && !feedback.resolved) ||
      (filter === "resolved" && feedback.resolved) ||
      (filter === "low" && feedback.rating <= 2);
    
    const matchesSearch = 
      feedback.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      feedback.comment.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesFilter && matchesSearch;
  });

  // Handle send response
  const handleSendResponse = () => {
    if (!newResponse.trim() || !activeFeedback) return;
    
    const newResponseObj = {
      id: Date.now(),
      type: "manual",
      message: newResponse,
      date: new Date().toISOString().split('T')[0],
      staffName: "Anda", // Ini bisa diganti dengan nama staff dari CRM
      staffRole: "Staff" // Ini bisa diganti dengan role dari CRM
    };
    
    const updatedFeedbacks = feedbacks.map(fb => 
      fb.id === activeFeedback.id 
        ? { ...fb, responses: [...fb.responses, newResponseObj] }
        : fb
    );
    
    setFeedbacks(updatedFeedbacks);
    setNewResponse("");
  };

  // Handle resolve toggle
  const toggleResolve = (id) => {
    setFeedbacks(feedbacks.map(fb => 
      fb.id === id ? { ...fb, resolved: !fb.resolved } : fb
    ));
  };

  // Render stars
  const renderStars = (rating) => {
    return Array(5).fill(0).map((_, i) => (
      <FiStar 
        key={i} 
        className={`${i < rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'} inline`}
      />
    ));
  };

  // Render rating distribution bar
  const renderRatingBar = (rating, count) => {
    const percentage = stats.total > 0 ? (count / stats.total) * 100 : 0;
    return (
      <div className="flex items-center mb-1">
        <div className="w-8">{rating} <FiStar className="inline text-yellow-400 fill-yellow-400" /></div>
        <div className="flex-1 mx-2">
          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
            <div 
              className="h-full bg-yellow-400" 
              style={{ width: `${percentage}%` }}
            ></div>
          </div>
        </div>
        <div className="w-8 text-right text-sm text-gray-600">{count}</div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-800 flex items-center">
              <FiMessageSquare className="mr-2" /> Customer Feedback
            </h1>
            <p className="text-gray-600">Kelola masukan dari pelanggan Fore Coffee</p>
          </div>
          
          <div className="mt-4 md:mt-0 flex items-center space-x-3">
            <span className="text-sm bg-green-100 text-green-800 px-3 py-1 rounded-full">
              {stats.total} Feedback
            </span>
          </div>
        </div>

        {/* Stats and Filters */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-6">
          {/* Rating Overview */}
          <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
            <h3 className="font-medium text-gray-700 mb-2">Rating Rata-rata</h3>
            <div className="flex items-center justify-between">
              <div className="text-4xl font-bold text-gray-800">{stats.averageRating}</div>
              <div className="text-2xl">
                {renderStars(Math.round(stats.averageRating))}
                <div className="text-sm text-gray-500 mt-1">
                  dari {stats.total} ulasan
                </div>
              </div>
            </div>
          </div>
          
          {/* Rating Distribution */}
          <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 lg:col-span-2">
            <h3 className="font-medium text-gray-700 mb-3">Distribusi Rating</h3>
            {[5, 4, 3, 2, 1].map(rating => (
              renderRatingBar(rating, stats.ratingCounts[rating])
            ))}
          </div>
          
          {/* Filters */}
          <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
            <h3 className="font-medium text-gray-700 mb-3">Filter</h3>
            <div className="space-y-3">
              <div>
                <label className="block text-sm text-gray-600 mb-1">Cari</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FiSearch className="text-gray-400" />
                  </div>
                  <input
                    type="text"
                    placeholder="Cari feedback..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm text-gray-600 mb-1">Status</label>
                <select
                  value={filter}
                  onChange={(e) => setFilter(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                >
                  <option value="all">Semua Feedback</option>
                  <option value="unresolved">Belum Ditanggapi</option>
                  <option value="resolved">Sudah Ditanggapi</option>
                  <option value="low">Rating Rendah (1-2 bintang)</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Feedback List */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden mb-6">
          <div className="divide-y divide-gray-200">
            {filteredFeedbacks.length > 0 ? (
              filteredFeedbacks.map(feedback => (
                <div 
                  key={feedback.id} 
                  className={`p-4 hover:bg-gray-50 transition ${feedback === activeFeedback ? 'bg-blue-50' : ''}`}
                  onClick={() => setActiveFeedback(feedback)}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="flex items-center mb-1">
                        <div className="font-medium text-gray-800 mr-2">{feedback.customerName}</div>
                        <div className="text-sm text-gray-500">{feedback.date}</div>
                      </div>
                      <div className="mb-2">
                        {renderStars(feedback.rating)}
                      </div>
                      <p className="text-gray-700">{feedback.comment}</p>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        feedback.resolved 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {feedback.resolved ? 'Selesai' : 'Perlu Ditanggapi'}
                      </span>
                      <span className={`text-lg ${
                        feedback.rating >= 4 ? 'text-green-500' : 
                        feedback.rating >= 3 ? 'text-yellow-500' : 'text-red-500'
                      }`}>
                        {feedback.rating}
                      </span>
                    </div>
                  </div>
                  
                  {/* Responses preview */}
                  {feedback.responses.length > 0 && (
                    <div className="mt-3 pl-4 border-l-2 border-green-500">
                      <div className="text-sm text-gray-500 mb-1">
                        {feedback.responses.length} tanggapan
                      </div>
                      <div className="text-sm text-gray-700 line-clamp-1">
                        {feedback.responses[feedback.responses.length - 1].message}
                      </div>
                    </div>
                  )}
                </div>
              ))
            ) : (
              <div className="p-8 text-center text-gray-500">
                <FiMessageSquare className="mx-auto text-4xl mb-3 text-gray-300" />
                <p>Tidak ada feedback yang sesuai dengan filter</p>
              </div>
            )}
          </div>
        </div>

        {/* Feedback Detail and Response */}
        {activeFeedback && (
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-bold text-gray-800 flex items-center">
                    <FiUser className="mr-2" /> {activeFeedback.customerName}
                  </h3>
                  <div className="text-sm text-gray-500 mb-2">{activeFeedback.email}</div>
                  <div className="flex items-center">
                    <div className="mr-3">
                      {renderStars(activeFeedback.rating)}
                    </div>
                    <div className="text-sm text-gray-500">{activeFeedback.date}</div>
                  </div>
                </div>
                
                <button
                  onClick={() => toggleResolve(activeFeedback.id)}
                  className={`px-3 py-1 rounded-full text-sm flex items-center ${
                    activeFeedback.resolved
                      ? 'bg-green-100 text-green-800'
                      : 'bg-yellow-100 text-yellow-800'
                  }`}
                >
                  {activeFeedback.resolved ? (
                    <FiThumbsUp className="mr-1" />
                  ) : (
                    <FiThumbsDown className="mr-1" />
                  )}
                  {activeFeedback.resolved ? 'Selesai' : 'Tandai Selesai'}
                </button>
              </div>
              
              <div className="bg-gray-50 p-4 rounded-lg mb-4">
                <p className="text-gray-800">{activeFeedback.comment}</p>
              </div>
              
              {/* Auto response suggestion */}
              {!activeFeedback.responses.some(r => r.type === "auto") && (
                <div className="mb-6">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Balasan Otomatis Disarankan:</h4>
                  <div className="bg-blue-50 border border-blue-100 p-3 rounded-lg">
                    <p className="text-blue-800 mb-2">{autoResponses[activeFeedback.rating]}</p>
                    <button
                      onClick={() => {
                        const autoResponse = {
                          id: Date.now(),
                          type: "auto",
                          message: autoResponses[activeFeedback.rating],
                          date: new Date().toISOString().split('T')[0]
                        };
                        
                        const updatedFeedbacks = feedbacks.map(fb => 
                          fb.id === activeFeedback.id 
                            ? { ...fb, responses: [...fb.responses, autoResponse] }
                            : fb
                        );
                        
                        setFeedbacks(updatedFeedbacks);
                      }}
                      className="text-sm bg-blue-100 text-blue-800 px-3 py-1 rounded hover:bg-blue-200"
                    >
                      Kirim Balasan Otomatis
                    </button>
                  </div>
                </div>
              )}
              
              {/* Responses */}
              <div className="space-y-4 mb-6">
                <h4 className="font-medium text-gray-700">
                  Tanggapan ({activeFeedback.responses.length})
                </h4>
                
                {activeFeedback.responses.length > 0 ? (
                  activeFeedback.responses.map(response => (
                    <div 
                      key={response.id} 
                      className={`p-4 rounded-lg ${
                        response.type === "auto" ? 'bg-green-50 border border-green-100' : 'bg-white border border-gray-200'
                      }`}
                    >
                      <div className="flex justify-between items-start mb-1">
                        <div className="font-medium text-gray-800">
                          {response.type === "auto" ? 'Balasan Otomatis' : response.staffName}
                        </div>
                        <div className="text-sm text-gray-500">{response.date}</div>
                      </div>
                      {response.type === "manual" && (
                        <div className="text-xs text-gray-500 mb-1">{response.staffRole}</div>
                      )}
                      <p className="text-gray-700">{response.message}</p>
                    </div>
                  ))
                ) : (
                  <div className="text-center text-gray-500 py-4">
                    Belum ada tanggapan untuk feedback ini
                  </div>
                )}
              </div>
              
              {/* New Response */}
              <div>
                <h4 className="font-medium text-gray-700 mb-2">Beri Tanggapan</h4>
                <div className="flex">
                  <input
                    type="text"
                    value={newResponse}
                    onChange={(e) => setNewResponse(e.target.value)}
                    placeholder="Ketik tanggapan Anda..."
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-l-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  />
                  <button
                    onClick={handleSendResponse}
                    disabled={!newResponse.trim()}
                    className={`px-4 py-2 rounded-r-lg flex items-center ${
                      newResponse.trim() 
                        ? 'bg-green-600 text-white hover:bg-green-700' 
                        : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                    }`}
                  >
                    <FiSend className="mr-1" /> Kirim
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {/* Empty state when no feedback selected */}
        {!activeFeedback && filteredFeedbacks.length > 0 && (
          <div className="bg-white rounded-xl shadow-sm p-8 text-center">
            <FiMessageSquare className="mx-auto text-4xl mb-3 text-gray-300" />
            <h3 className="text-lg font-medium text-gray-700 mb-1">Pilih Feedback</h3>
            <p className="text-gray-500">Klik salah satu feedback pelanggan untuk melihat detail dan memberikan tanggapan</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default FeedbackSystem;