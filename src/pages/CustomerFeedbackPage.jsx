import React, { useState, useEffect } from 'react';
import {
  FaChevronDown,
  FaChevronUp,
  FaCheckCircle,
  FaTimesCircle,
  FaStar
} from 'react-icons/fa';
import { supabase } from '../supabase';
import Loading from '../components/Loading';

const CustomerFeedbackPage = () => {
  // State untuk form feedback
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [feedbackText, setFeedbackText] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  
  // State untuk manajemen feedback
  const [activeTab, setActiveTab] = useState('new');
  const [expandedFeedback, setExpandedFeedback] = useState(null);
  const [submitted, setSubmitted] = useState(false);
  const [feedbacks, setFeedbacks] = useState([]);
  
  // State untuk loading dan error
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch feedback dari database
  const fetchFeedbacks = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('feedbacks')
        .select(`
          id,
          customer_name,
          email,
          rating,
          comment,
          created_at,
          resolved,
          feedback_responses (
            id,
            message,
            created_at,
            response_type,
            staff_name,
            staff_role
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const formattedData = data.map(feedback => ({
        ...feedback,
        status: feedback.resolved ? 'completed' : 'in-progress',
        responses: feedback.feedback_responses || []
      }));

      setFeedbacks(formattedData);
    } catch (error) {
      console.error('Error fetching feedbacks:', error);
      setError('Gagal memuat daftar feedback');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFeedbacks();
  }, []);

  // Filter feedback berdasarkan tab aktif
  const filteredFeedbacks = activeTab === 'all' 
    ? feedbacks 
    : feedbacks.filter(fb => 
        activeTab === 'new' ? !fb.resolved : fb.resolved
      );

  // Handle submit feedback
  const handleSubmitFeedback = async (e) => {
    e.preventDefault();
    setError(null);
    
    // Validasi input
    if (rating === 0 || !feedbackText.trim() || !customerName.trim() || !customerEmail.trim()) {
      setError('Harap lengkapi semua field yang wajib diisi');
      return;
    }

    // Validasi format email
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customerEmail)) {
      setError('Format email tidak valid');
      return;
    }

    try {
      setLoading(true);
      
      // Insert data ke tabel feedbacks
      const { data: feedback, error: feedbackError } = await supabase
        .from('feedbacks')
        .insert([{
          customer_name: customerName,
          email: customerEmail,
          rating,
          comment: feedbackText
        }])
        .select()
        .single();

      if (feedbackError) throw feedbackError;

      // Insert auto response ke tabel feedback_responses
      const { error: responseError } = await supabase
        .from('feedback_responses')
        .insert({
          feedback_id: feedback.id,
          message: getAutoResponse(rating),
          response_type: 'auto'
        });

      if (responseError) throw responseError;

      // Reset form setelah sukses
      setSubmitted(true);
      setRating(0);
      setFeedbackText('');
      setCustomerName('');
      setCustomerEmail('');
      
      // Refresh daftar feedback
      await fetchFeedbacks();

    } catch (error) {
      console.error('Error details:', error);
      
      let errorMessage = 'Gagal mengirim feedback';
      if (error.message.includes('violates check constraint')) {
        errorMessage = 'Rating harus antara 1-5';
      } else if (error.message.includes('null value in column')) {
        errorMessage = 'Harap lengkapi semua field yang wajib diisi';
      } else if (error.message.includes('network error')) {
        errorMessage = 'Koneksi jaringan bermasalah. Silakan coba lagi.';
      } else {
        errorMessage = error.message;
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Auto response berdasarkan rating
  const getAutoResponse = (rating) => {
    const responses = {
      1: "Kami sangat menyesal mendengar pengalaman Anda. Tim kami akan segera menindaklanjuti keluhan ini.",
      2: "Kami memohon maaf atas ketidakpuasan Anda. Kami akan memperbaiki pelayanan kami.",
      3: "Terima kasih atas feedback 3 bintang Anda. Kami akan berusaha meningkatkan pelayanan kami.",
      4: "Terima kasih atas rating 4 bintang! Kami senang Anda menikmati pengalaman di Fore Coffee.",
      5: "Terima kasih atas rating 5 bintang! Kami sangat senang Anda menikmati kopi dan pelayanan kami."
    };
    return responses[rating];
  };

  // Toggle expand/collapse feedback
  const toggleFeedback = (id) => {
    setExpandedFeedback(expandedFeedback === id ? null : id);
  };

  // Komponen badge status
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

  // Komponen bintang rating
  const renderStars = (rating) => {
    return Array(5).fill(0).map((_, i) => (
      <FaStar 
        key={i} 
        className={`h-5 w-5 ${i < rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`}
      />
    ));
  };

  // Tampilkan loading jika sedang fetch data
  if (loading && !submitted) {
    return (
      <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8 flex justify-center items-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Memuat...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header Section */}
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold text-gray-900">Feedback Pelanggan</h1>
          <p className="text-lg text-gray-600">Bagikan pengalaman Anda dengan kami</p>
        </div>

        {/* Feedback Form */}
        {!submitted ? (
          <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Kirim Feedback Baru</h2>
            
            {error && (
              <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-lg">
                <p className="font-medium">Gagal mengirim feedback:</p>
                <p>{error}</p>
                <button 
                  onClick={() => setError(null)}
                  className="mt-2 text-sm underline"
                >
                  Tutup
                </button>
              </div>
            )}
            
            <form onSubmit={handleSubmitFeedback}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nama Anda*</label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    placeholder="Nama lengkap"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email*</label>
                  <input
                    type="email"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    placeholder="Alamat email Anda"
                    value={customerEmail}
                    onChange={(e) => setCustomerEmail(e.target.value)}
                    required
                  />
                  {customerEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customerEmail) && (
                    <p className="mt-1 text-sm text-red-600">Format email tidak valid</p>
                  )}
                </div>
              </div>
              
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">Rating*</label>
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
                <label className="block text-sm font-medium text-gray-700 mb-2">Ulasan Anda*</label>
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
                  disabled={rating === 0 || !feedbackText.trim() || !customerName.trim() || !customerEmail.trim() || loading}
                  className={`px-6 py-3 rounded-lg font-medium flex items-center ${
                    rating === 0 || !feedbackText.trim() || !customerName.trim() || !customerEmail.trim() || loading
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      : 'bg-green-600 hover:bg-green-700 text-white'
                  }`}
                >
                  {loading ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Mengirim...
                    </>
                  ) : (
                    'Kirim Feedback'
                  )}
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
              onClick={() => {
                setSubmitted(false);
                fetchFeedbacks();
              }}
              className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg flex items-center mx-auto"
            >
              Kirim Feedback Lagi
            </button>
          </div>
        )}

        {/* Feedbacks List */}
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
                        <div className="flex items-center space-x-2 text-sm text-gray-500">
                          <span>{feedback.customer_name}</span>
                          <span>•</span>
                          <span>
                            {new Date(feedback.created_at).toLocaleDateString('id-ID', {
                              day: 'numeric',
                              month: 'long',
                              year: 'numeric'
                            })}
                          </span>
                        </div>
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
                        <div className="flex justify-between items-start mb-2">
                          <h3 className="font-medium text-gray-800">{feedback.customer_name}</h3>
                          {feedback.email && (
                            <span className="text-sm text-gray-500">{feedback.email}</span>
                          )}
                        </div>
                        <p className="text-gray-800 mb-3">{feedback.comment}</p>
                        <div className="flex items-center">
                          {renderStars(feedback.rating)}
                          <span className="ml-2 text-sm text-gray-500">{feedback.rating} bintang</span>
                        </div>
                      </div>
                      
                      {feedback.responses.length > 0 ? (
                        <div>
                          <h4 className="font-medium text-gray-700 mb-3">Tanggapan dari Kami</h4>
                          <div className="space-y-3">
                            {feedback.responses.map(response => (
                              <div 
                                key={response.id} 
                                className={`p-4 rounded-lg ${
                                  response.response_type === 'auto' 
                                    ? 'bg-green-50 border border-green-100' 
                                    : 'bg-blue-50 border border-blue-100'
                                }`}
                              >
                                <div className="flex justify-between items-start mb-1">
                                  <div className="font-medium text-gray-800">
                                    {response.response_type === 'auto' 
                                      ? 'Tim Fore Coffee' 
                                      : response.staff_name || ''}
                                    {response.staff_role && ` (${response.staff_role})`}
                                  </div>
                                  <div className="text-sm text-gray-500">
                                    {new Date(response.created_at).toLocaleDateString('id-ID', {
                                      day: 'numeric',
                                      month: 'long',
                                      year: 'numeric'
                                    })}
                                  </div>
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
                <p className="text-gray-500">Belum ada feedback pada kategori ini</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomerFeedbackPage;