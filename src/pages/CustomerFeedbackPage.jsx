import React, { useState } from 'react';
import {
  FaChevronDown,
  FaChevronUp,
  FaCheckCircle,
  FaTimesCircle,
  FaStar
} from 'react-icons/fa';


const CustomerFeedbackPage = () => {
  const [activeTab, setActiveTab] = useState('new');
  const [expandedFeedback, setExpandedFeedback] = useState(null);
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [feedbackText, setFeedbackText] = useState('');
  const [submitted, setSubmitted] = useState(false);

  // Mock data feedback yang sudah dikirim
  const myFeedbacks = [
    {
      id: 1,
      rating: 5,
      comment: "Kopinya enak banget! Pelayanan juga ramah.",
      date: "2023-05-20",
      responses: [
        {
          id: 1,
          message: "Terima kasih atas rating 5 bintang! Kami sangat senang Anda menikmati kopi dan pelayanan kami.",
          date: "2023-05-20",
          staffName: "Tim Fore Coffee"
        }
      ],
      status: "completed"
    },
    {
      id: 2,
      rating: 3,
      comment: "Rasanya cukup enak tapi tempatnya terlalu ramai.",
      date: "2023-05-18",
      responses: [
        {
          id: 1,
          message: "Terima kasih atas feedback 3 bintang Anda. Kami akan berusaha meningkatkan pelayanan kami.",
          date: "2023-05-18",
          staffName: "Tim Fore Coffee"
        },
        {
          id: 2,
          message: "Halo, terima kasih atas masukannya. Kami sedang mempertimbangkan perluasan tempat untuk kenyamanan pelanggan.",
          date: "2023-05-19",
          staffName: "Ahmad - Customer Service"
        }
      ],
      status: "in-progress"
    },
    {
      id: 3,
      rating: 1,
      comment: "Pesanan saya salah dan pelayannya lambat!",
      date: "2023-05-15",
      responses: [
        {
          id: 1,
          message: "Kami sangat menyesal mendengar pengalaman Anda. Tim kami akan segera menindaklanjuti keluhan ini.",
          date: "2023-05-15",
          staffName: "Tim Fore Coffee"
        },
        {
          id: 2,
          message: "Halo, mohon maaf atas ketidaknyamanan. Kami telah memberikan voucher gratis sebagai kompensasi. Mohon cek email Anda.",
          date: "2023-05-16",
          staffName: "Rina - Manajer"
        }
      ],
      status: "completed"
    }
  ];

  const filteredFeedbacks = activeTab === 'all' 
    ? myFeedbacks 
    : myFeedbacks.filter(fb => 
        activeTab === 'new' ? fb.status === 'in-progress' : fb.status === 'completed'
      );

  const handleSubmitFeedback = (e) => {
    e.preventDefault();
    if (rating === 0 || !feedbackText.trim()) return;
    
    // Simpan feedback ke state atau kirim ke API
    const newFeedback = {
      id: Date.now(),
      rating,
      comment: feedbackText,
      date: new Date().toISOString().split('T')[0],
      responses: [],
      status: "in-progress"
    };
    
    // Dalam implementasi nyata, ini akan diupdate ke state/API
    console.log("Feedback submitted:", newFeedback);
    setSubmitted(true);
    setRating(0);
    setFeedbackText('');
  };

  const toggleFeedback = (id) => {
    setExpandedFeedback(expandedFeedback === id ? null : id);
  };

  const getStatusBadge = (status) => {
    const statusClasses = {
      'in-progress': 'bg-yellow-100 text-yellow-800',
      'completed': 'bg-green-100 text-green-800'
    };
    
    const statusText = {
      'in-progress': 'Dalam Proses',
      'completed': 'Selesai'
    };
    
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusClasses[status]}`}>
        {statusText[status]}
      </span>
    );
  };

  const renderStars = (rating) => {
    return Array(5).fill(0).map((_, i) => (
      <FaStar 
        key={i} 
        className={`h-5 w-5 ${i < rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`}
      />
    ));
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header Section */}
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold text-gray-900">Feedback Pelanggan</h1>
          <p className="text-lg text-gray-600">Bagikan pengalaman Anda dengan Fore Coffee</p>
        </div>

        {/* Feedback Form */}
        {!submitted ? (
          <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Kirim Feedback Baru</h2>
            
            <form onSubmit={handleSubmitFeedback}>
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">Rating</label>
                <div className="flex items-center">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      type="button"
                      key={star}
                      className="focus:outline-none"
                      onClick={() => setRating(star)}
                      onMouseEnter={() => setHoverRating(star)}
                      onMouseLeave={() => setHoverRating(0)}
                    >
                      <FaStar
                        className={`h-10 w-10 ${(hoverRating || rating) >= star ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`}
                      />
                    </button>
                  ))}
                  <span className="ml-3 text-gray-500">
                    {rating === 0 ? 'Pilih rating' : `${rating} bintang`}
                  </span>
                </div>
              </div>
              
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">Ulasan Anda</label>
                <textarea
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  placeholder="Bagikan pengalaman Anda..."
                  value={feedbackText}
                  onChange={(e) => setFeedbackText(e.target.value)}
                  required
                />
              </div>
              
              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={rating === 0 || !feedbackText.trim()}
                  className={`px-6 py-3 rounded-lg font-medium ${rating === 0 || !feedbackText.trim() ? 'bg-gray-300 text-gray-500 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700 text-white'}`}
                >
                  Kirim Feedback
                </button>
              </div>
            </form>
          </div>
        ) : (
          <div className="bg-green-50 border border-green-200 rounded-xl p-6 mb-8 text-center">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
              <FaCheckCircle className="h-6 w-6 text-green-600" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Terima kasih atas Feedback Anda!</h3>
            <p className="text-gray-600 mb-4">
              Kami sangat menghargai masukan Anda. Tim kami akan meninjau feedback ini dan memberikan tanggapan jika diperlukan.
            </p>
            <button
              onClick={() => setSubmitted(false)}
              className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg"
            >
              Kirim Feedback Lagi
            </button>
          </div>
        )}

        {/* My Feedbacks */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab('new')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'new' ? 'border-green-500 text-green-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
              >
                Feedback Aktif
              </button>
              <button
                onClick={() => setActiveTab('completed')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'completed' ? 'border-green-500 text-green-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
              >
                Selesai
              </button>
              <button
                onClick={() => setActiveTab('all')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'all' ? 'border-green-500 text-green-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
              >
                Semua Feedback
              </button>
            </nav>
          </div>
          
          <div className="divide-y divide-gray-200">
            {filteredFeedbacks.length > 0 ? (
              filteredFeedbacks.map(feedback => (
                <div key={feedback.id} className="hover:bg-gray-50 transition-colors">
                  <button
                    className="w-full p-4 text-left flex justify-between items-center"
                    onClick={() => toggleFeedback(feedback.id)}
                  >
                    <div className="flex items-center space-x-4">
                      <div className={`p-2 rounded-lg ${feedback.rating >= 4 ? 'bg-green-100 text-green-800' : feedback.rating >= 3 ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'}`}>
                        <span className="font-bold">{feedback.rating}</span>
                        <FaStar className="h-4 w-4 inline ml-1 -mt-1" />
                      </div>
                      <div>
                        <p className="text-gray-800 font-medium line-clamp-1">{feedback.comment}</p>
                        <p className="text-sm text-gray-500">{feedback.date}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      {getStatusBadge(feedback.status)}
                      {expandedFeedback === feedback.id ? (
                        <FaChevronUp className="h-5 w-5 text-gray-400" />
                      ) : (
                        <FaChevronDown className="h-5 w-5 text-gray-400" />
                      )}
                    </div>
                  </button>
                  
                  {expandedFeedback === feedback.id && (
                    <div className="px-4 pb-4 animate-fade-in">
                      <div className="bg-gray-50 p-4 rounded-lg mb-4">
                        <p className="text-gray-800">{feedback.comment}</p>
                        <div className="mt-2 flex items-center">
                          {renderStars(feedback.rating)}
                          <span className="ml-2 text-sm text-gray-500">{feedback.rating} bintang</span>
                        </div>
                      </div>
                      
                      {feedback.responses.length > 0 ? (
                        <div>
                          <h4 className="font-medium text-gray-700 mb-3">Tanggapan dari Fore Coffee</h4>
                          <div className="space-y-3">
                            {feedback.responses.map(response => (
                              <div key={response.id} className="bg-green-50 border border-green-100 p-4 rounded-lg">
                                <div className="flex justify-between items-start mb-1">
                                  <div className="font-medium text-gray-800">{response.staffName}</div>
                                  <div className="text-sm text-gray-500">{response.date}</div>
                                </div>
                                <p className="text-gray-700">{response.message}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      ) : (
                        <div className="bg-yellow-50 border border-yellow-100 p-4 rounded-lg text-center">
                          <p className="text-yellow-800">Feedback Anda sedang ditinjau oleh tim kami</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))
            ) : (
              <div className="p-8 text-center">
                <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-gray-100 mb-4">
                  <FaTimesCircle className="h-6 w-6 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-1">
                  {activeTab === 'new' ? 'Tidak ada feedback aktif' : 'Tidak ada feedback selesai'}
                </h3>
                <p className="text-gray-500">Anda belum memiliki feedback pada kategori ini</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomerFeedbackPage;