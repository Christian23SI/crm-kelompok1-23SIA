import React, { useState, useEffect } from 'react';
import { FiStar, FiMessageSquare, FiSearch, FiUser, FiMail, FiThumbsUp, FiThumbsDown, FiSend } from 'react-icons/fi';
import { supabase } from '../supabase';

const FeedbackSystem = () => {
  const [feedbacks, setFeedbacks] = useState([]);
  const [newResponse, setNewResponse] = useState("");
  const [activeFeedback, setActiveFeedback] = useState(null);
  const [filter, setFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [stats, setStats] = useState({
    total: 0,
    averageRating: 0,
    ratingCounts: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
  });
  const [loading, setLoading] = useState(true);

  // Auto-response templates
  const autoResponses = {
    1: "Kami sangat menyesal mendengar pengalaman Anda. Tim kami akan segera menindaklanjuti keluhan ini.",
    2: "Kami memohon maaf atas ketidakpuasan Anda. Kami akan memperbaiki pelayanan kami.",
    3: "Terima kasih atas feedback 3 bintang Anda. Kami akan berusaha meningkatkan pelayanan kami.",
    4: "Terima kasih atas rating 4 bintang! Kami senang Anda menikmati pengalaman di Fore Coffee.",
    5: "Terima kasih atas rating 5 bintang! Kami sangat senang Anda menikmati kopi dan pelayanan kami."
  };

  // Fetch feedbacks from Supabase
  const fetchFeedbacks = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('feedbacks')
        .select(`
          *,
          feedback_responses (*)
        `)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      setFeedbacks(data || []);
    } catch (error) {
      console.error('Error fetching feedbacks:', error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFeedbacks();
  }, []);

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
      feedback.customer_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      feedback.comment.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesFilter && matchesSearch;
  });

  // Handle send response
  const handleSendResponse = async () => {
    if (!newResponse.trim() || !activeFeedback) return;
    
    try {
      // Insert new response
      const { data: response, error } = await supabase
        .from('feedback_responses')
        .insert([{
          feedback_id: activeFeedback.id,
          message: newResponse,
          response_type: 'manual',
          staff_name: 'Admin',
          staff_role: 'Staff'
        }])
        .select();
      
      if (error) throw error;
      
      // Update local state
      const updatedFeedbacks = feedbacks.map(fb => 
        fb.id === activeFeedback.id 
          ? { 
              ...fb, 
              feedback_responses: [...fb.feedback_responses, response[0]] 
            } 
          : fb
      );
      
      setFeedbacks(updatedFeedbacks);
      setNewResponse("");
    } catch (error) {
      console.error('Error sending response:', error.message);
    }
  };

  // Handle auto response
  const handleAutoResponse = async (feedback) => {
    try {
      // Insert auto response
      const { data: response, error } = await supabase
        .from('feedback_responses')
        .insert([{
          feedback_id: feedback.id,
          message: autoResponses[feedback.rating],
          response_type: 'auto'
        }])
        .select();
      
      if (error) throw error;
      
      // Update local state
      const updatedFeedbacks = feedbacks.map(fb => 
        fb.id === feedback.id 
          ? { 
              ...fb, 
              feedback_responses: [...fb.feedback_responses, response[0]] 
            } 
          : fb
      );
      
      setFeedbacks(updatedFeedbacks);
    } catch (error) {
      console.error('Error sending auto response:', error.message);
    }
  };

  // Handle resolve toggle
  const toggleResolve = async (id) => {
    try {
      const feedback = feedbacks.find(fb => fb.id === id);
      const { error } = await supabase
        .from('feedbacks')
        .update({ resolved: !feedback.resolved })
        .eq('id', id);
      
      if (error) throw error;
      
      // Update local state
      setFeedbacks(feedbacks.map(fb => 
        fb.id === id ? { ...fb, resolved: !fb.resolved } : fb
      ));
    } catch (error) {
      console.error('Error toggling resolve status:', error.message);
    }
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-8 flex justify-center items-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Memuat feedback...</p>
        </div>
      </div>
    );
  }

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
                        <div className="font-medium text-gray-800 mr-2">{feedback.customer_name}</div>
                        <div className="text-sm text-gray-500">
                          {new Date(feedback.created_at).toLocaleDateString()}
                        </div>
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
                  {feedback.feedback_responses.length > 0 && (
                    <div className="mt-3 pl-4 border-l-2 border-green-500">
                      <div className="text-sm text-gray-500 mb-1">
                        {feedback.feedback_responses.length} tanggapan
                      </div>
                      <div className="text-sm text-gray-700 line-clamp-1">
                        {feedback.feedback_responses[feedback.feedback_responses.length - 1].message}
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
                    <FiUser className="mr-2" /> {activeFeedback.customer_name}
                  </h3>
                  <div className="text-sm text-gray-500 mb-2">{activeFeedback.email}</div>
                  <div className="flex items-center">
                    <div className="mr-3">
                      {renderStars(activeFeedback.rating)}
                    </div>
                    <div className="text-sm text-gray-500">
                      {new Date(activeFeedback.created_at).toLocaleDateString()}
                    </div>
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
              {!activeFeedback.feedback_responses.some(r => r.response_type === "auto") && (
                <div className="mb-6">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Balasan Otomatis Disarankan:</h4>
                  <div className="bg-blue-50 border border-blue-100 p-3 rounded-lg">
                    <p className="text-blue-800 mb-2">{autoResponses[activeFeedback.rating]}</p>
                    <button
                      onClick={() => handleAutoResponse(activeFeedback)}
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
                  Tanggapan ({activeFeedback.feedback_responses.length})
                </h4>
                
                {activeFeedback.feedback_responses.length > 0 ? (
                  activeFeedback.feedback_responses.map(response => (
                    <div 
                      key={response.id} 
                      className={`p-4 rounded-lg ${
                        response.response_type === "auto" 
                          ? 'bg-green-50 border border-green-100' 
                          : 'bg-white border border-gray-200'
                      }`}
                    >
                      <div className="flex justify-between items-start mb-1">
                        <div className="font-medium text-gray-800">
                          {response.response_type === "auto" 
                            ? 'Balasan Otomatis' 
                            : response.staff_name || 'Staff'}
                        </div>
                        <div className="text-sm text-gray-500">
                          {new Date(response.created_at).toLocaleDateString()}
                        </div>
                      </div>
                      {response.response_type === "manual" && (
                        <div className="text-xs text-gray-500 mb-1">
                          {response.staff_role || 'Staff'}
                        </div>
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