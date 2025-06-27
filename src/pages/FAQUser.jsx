import { useState } from "react";
import {
  FaChevronDown,
  FaChevronUp,
  FaSearch
} from "react-icons/fa";


const FaqUser = () => {
  const [activeCategory, setActiveCategory] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [expandedFaqs, setExpandedFaqs] = useState([]);

  // Data FAQ - dalam implementasi nyata ini bisa diambil dari props/API
  const faqs = [
    {
      id: 1,
      kategori: "Masalah Akun",
      pertanyaan: "Bagaimana cara reset password?",
      jawaban: 'Anda dapat mereset password dengan mengklik tombol "Lupa Password" di halaman login. Sistem akan mengirimkan link reset password ke email yang terdaftar. Ikuti instruksi dalam email tersebut untuk membuat password baru.',
    },
    {
      id: 2,
      kategori: "Masalah Akun",
      pertanyaan: "Bagaimana cara mengubah email?",
      jawaban: "Untuk mengubah alamat email, masuk ke menu Pengaturan Akun di profil Anda. Klik tombol 'Edit Email' dan masukkan alamat email baru Anda. Kami akan mengirimkan email verifikasi ke alamat baru tersebut untuk memastikan keamanan akun Anda.",
    },
    {
      id: 3,
      kategori: "Pembelian & Pembayaran",
      pertanyaan: "Metode pembayaran apa saja yang tersedia?",
      jawaban: "Kami menerima berbagai metode pembayaran termasuk:\n- Kartu kredit/debit (Visa, Mastercard)\n- E-wallet (Gopay, OVO, Dana)\n- Transfer bank (BCA, Mandiri, BRI, BNI)\n- Pembayaran di tempat (COD) untuk area tertentu",
    },
    {
      id: 4,
      kategori: "Pembelian & Pembayaran",
      pertanyaan: "Berapa lama waktu proses pembayaran?",
      jawaban: "Pembayaran melalui e-wallet dan kartu kredit biasanya diproses secara instan. Untuk transfer bank, proses verifikasi mungkin memakan waktu 1-3 jam. Jika pembayaran Anda belum terverifikasi setelah 3 jam, silakan hubungi customer service kami.",
    },
    {
      id: 5,
      kategori: "Pengiriman",
      pertanyaan: "Berapa lama waktu pengiriman?",
      jawaban: "Waktu pengiriman bervariasi tergantung lokasi Anda:\n- Jabodetabek: 1-2 hari kerja\n- Pulau Jawa: 2-3 hari kerja\n- Luar Jawa: 3-5 hari kerja\n- Daerah terpencil: 5-7 hari kerja\nKami akan mengirimkan nomor resi yang dapat Anda lacak melalui website kami atau website jasa pengiriman.",
    },
    {
      id: 6,
      kategori: "Pengiriman",
      pertanyaan: "Apakah tersedia pengiriman internasional?",
      jawaban: "Saat ini kami hanya melayani pengiriman dalam negeri (Indonesia). Kami sedang mempersiapkan layanan pengiriman internasional yang akan segera hadir di masa depan. Silakan pantau terus website kami untuk informasi terbaru.",
    },
  ];

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