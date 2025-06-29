import { useState, useEffect } from "react";
import {
  FaChevronDown,
  FaChevronUp,
  FaSearch
} from "react-icons/fa";
import { supabase } from "../supabase";


const FaqUser = () => {
  const [activeCategory, setActiveCategory] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [expandedFaqs, setExpandedFaqs] = useState([]);
  const [faqs, setFaqs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch data dari Supabase
  useEffect(() => {
    const fetchFaqs = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('faqs')
          .select('*')
          .order('kategori', { ascending: true });

        if (error) throw error;
        
        setFaqs(data || []);
        setError(null);
      } catch (err) {
        console.error('Error fetching FAQs:', err);
        setError('Gagal memuat data FAQ. Silakan coba lagi.');
        setFaqs([]);
      } finally {
        setLoading(false);
      }
    };

    fetchFaqs();
  }, []);

  // Kategori unik
  const categories = [...new Set(faqs.map(faq => faq.kategori))];

  // Filter FAQ berdasarkan pencarian
  const filteredFaqs = searchTerm
    ? faqs.filter(faq => 
        faq.pertanyaan.toLowerCase().includes(searchTerm.toLowerCase()) ||
        faq.jawaban.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : faqs;

  // Kelompokkan FAQ berdasarkan kategori
  const categorizedFaqs = filteredFaqs.reduce((acc, faq) => {
    if (!acc[faq.kategori]) acc[faq.kategori] = [];
    acc[faq.kategori].push(faq);
    return acc;
  }, {});

  // Toggle FAQ expanded/collapsed
  const toggleFaq = (id) => {
    setExpandedFaqs(prev =>
      prev.includes(id)
        ? prev.filter(faqId => faqId !== id)
        : [...prev, id]
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
        <div className="max-w-4xl mx-auto text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Memuat data FAQ...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
        <div className="max-w-4xl mx-auto text-center bg-white p-8 rounded-xl shadow-sm">
          <h3 className="text-lg font-medium text-gray-700 mb-2">Terjadi Kesalahan</h3>
          <p className="text-gray-500 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
          >
            Coba Lagi
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header Section */}
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Pusat Bantuan</h1>
          <p className="text-lg text-gray-600">Temukan jawaban untuk pertanyaan Anda</p>
        </div>

        {/* Search Bar */}
        <div className="relative mb-8">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <FaSearch className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Cari pertanyaan atau kata kunci..."
            className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Categories Navigation */}
        <div className="flex flex-wrap gap-2 mb-8">
          <button
            onClick={() => setActiveCategory(null)}
            className={`px-4 py-2 rounded-full text-sm font-medium ${activeCategory === null ? 'bg-green-600 text-white' : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'}`}
          >
            Semua Kategori
          </button>
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setActiveCategory(category)}
              className={`px-4 py-2 rounded-full text-sm font-medium ${activeCategory === category ? 'bg-green-600 text-white' : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'}`}
            >
              {category}
            </button>
          ))}
        </div>

        {/* FAQ Content */}
        {Object.entries(categorizedFaqs).map(([category, items]) => {
          // Skip jika kategori tidak aktif (dan ada kategori aktif)
          if (activeCategory && activeCategory !== category) return null;
          
          return (
            <div key={category} className="mb-10">
              <h2 className="text-xl font-bold text-gray-800 mb-4">{category}</h2>
              <div className="space-y-3">
                {items.map((faq) => (
                  <div key={faq.id} className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-200">
                    <button
                      className="w-full flex justify-between items-center p-4 text-left hover:bg-gray-50 transition-colors"
                      onClick={() => toggleFaq(faq.id)}
                    >
                      <h3 className="font-medium text-gray-800">{faq.pertanyaan}</h3>
                      {expandedFaqs.includes(faq.id) ? (
                        <FaChevronUp className="h-5 w-5 text-gray-500" />
                      ) : (
                        <FaChevronDown className="h-5 w-5 text-gray-500" />
                      )}
                    </button>
                    {expandedFaqs.includes(faq.id) && (
                      <div className="p-4 pt-0 border-t border-gray-100 animate-fade-in">
                        <div className="prose prose-sm text-gray-600 whitespace-pre-line">
                          {faq.jawaban}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          );
        })}

        {/* Empty State */}
        {filteredFaqs.length === 0 && (
          <div className="bg-white rounded-xl shadow-sm p-8 text-center">
            <img
              src="https://cdn-icons-png.flaticon.com/512/4076/4076478.png"
              alt="No results found"
              className="w-32 mx-auto mb-4 opacity-60"
            />
            <h3 className="text-lg font-medium text-gray-700 mb-1">Tidak ditemukan</h3>
            <p className="text-gray-500 mb-4">Kami tidak dapat menemukan FAQ yang sesuai dengan pencarian Anda</p>
            <button
              onClick={() => {
                setSearchTerm("");
                setActiveCategory(null);
              }}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
            >
              Lihat Semua FAQ
            </button>
          </div>
        )}

        {/* Contact Support */}
        <div className="bg-green-50 rounded-xl p-6 mt-10">
          <h2 className="text-xl font-bold text-gray-800 mb-2">Masih butuh bantuan?</h2>
          <p className="text-gray-600 mb-4">Tim dukungan kami siap membantu Anda</p>
          <button className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium">
            Hubungi Customer Service
          </button>
        </div>
      </div>
    </div>
  );
};

export default FaqUser;