import { useState } from 'react'

const faqData = [
  {
    category: 'Kendala Pesanan',
    items: [
      {
        question: 'Transaksi saya tidak diproses',
        answer:
          'Mohon maaf atas kendala yang Anda alami. Harap laporkan melalui layanan Customer Service Fore Coffee maksimal 1x24 jam sejak melakukan transaksi. Setelah memvalidasi laporan, kami akan melakukan pembatalan transaksi dan pengembalian dana akan diproses dalam waktu maksimal 5x24 jam hari kerja, tidak terhitung hari Sabtu, Minggu maupun libur nasional.',
      },
      {
        question: 'Pesanan yang diterima tidak lengkap/sesuai',
        answer: 'Mohon maaf atas ketidaknyamanannya. Kirimkan detail dan foto produk ke pusat bantuan agar dapat kami tindak lanjuti.',
      },
    ],
  },
  {
    category: 'Kualitas Produk',
    items: [
      {
        question: 'Minuman terasa berbeda dari biasanya',
        answer: 'Kami mohon maaf atas hal tersebut. Silakan laporkan melalui pusat bantuan disertai foto jika memungkinkan.',
      },
      {
        question: 'Produk tidak sesuai dengan deskripsi',
        answer: 'Mohon kirimkan detail produk dan perbedaannya agar kami bisa menindaklanjuti laporan Anda.',
      },
    ],
  },
  {
    category: 'Pembayaran',
    items: [
      {
        question: 'Saya sudah bayar tapi status belum berubah',
        answer: 'Silakan tunggu beberapa saat atau hubungi customer service jika tidak ada perubahan dalam 10 menit.',
      },
      {
        question: 'Metode pembayaran gagal terus',
        answer: 'Pastikan akun Anda aktif dan dana mencukupi. Jika masih bermasalah, coba metode lain atau hubungi kami.',
      },
    ],
  },
  {
    category: 'Reward',
    items: [
      {
        question: 'Kenapa saya tidak mendapatkan poin?',
        answer: 'Poin hanya diberikan untuk transaksi tertentu. Silakan cek ketentuan program reward.',
      },
      {
        question: 'Bagaimana cara menukar poin saya?',
        answer: 'Masuk ke menu Reward dan pilih penawaran yang tersedia untuk ditukar dengan poin Anda.',
      },
    ],
  },
  {
    category: 'Kendala Aplikasi',
    items: [
      {
        question: 'Aplikasi error atau force close',
        answer: 'Coba hapus cache atau instal ulang aplikasi. Jika tetap error, hubungi tim dukungan teknis kami.',
      },
      {
        question: 'Tidak bisa login ke akun saya',
        answer: 'Pastikan email dan password benar. Jika lupa, gunakan fitur lupa password.',
      },
    ],
  },
  {
    category: 'Topik Lainnya',
    items: [
      {
        question: 'Bagaimana cara menghubungi customer service?',
        answer: 'Kamu bisa klik tombol “Hubungi Kami” di halaman Bantuan atau melalui email support resmi kami.',
      },
      {
        question: 'Apakah bisa refund?',
        answer: 'Refund bisa dilakukan jika memenuhi syarat tertentu. Hubungi layanan pelanggan untuk prosesnya.',
      },
    ],
  },
]

const FAQ = () => {
  const [selectedFAQ, setSelectedFAQ] = useState(null)
  const [feedback, setFeedback] = useState(null) // 'like' | 'dislike' | null

  // Nomor WhatsApp Fore Coffee dan pesan default
  const waNumber = '+6281211118456' // ganti dengan nomor WA resmi Fore Coffee tanpa tanda + dan spasi
  const waMessage = encodeURIComponent('Halo Fore Coffee, saya ingin bertanya mengenai FAQ.')

  if (selectedFAQ !== null) {
    const { categoryIdx, itemIdx } = selectedFAQ
    const category = faqData[categoryIdx].category
    const item = faqData[categoryIdx].items[itemIdx]

    return (
      <div className="w-full max-w-3xl mx-auto bg-white px-4 md:px-12 py-8 pb-20 relative rounded-md shadow-md">
        <h1 className="text-2xl font-bold text-purple-700 mb-4">{category}</h1>
        <h2 className="text-xl font-semibold mb-4">{item.question}</h2>
        <p className="text-gray-700 whitespace-pre-line leading-relaxed">{item.answer}</p>

        {/* Feedback section */}
        <div className="mt-8 border-t pt-6 flex flex-col items-start space-y-3">
          <span className="font-medium text-gray-800">Apakah artikel ini membantu?</span>
          <div className="flex space-x-4">
            <button
              onClick={() => setFeedback(feedback === 'like' ? null : 'like')}
              className={`text-2xl transition-colors duration-300 focus:outline-none ${
                feedback === 'like' ? 'text-green-600' : 'text-gray-400 hover:text-green-600'
              }`}
              aria-label="Like"
              title="Beri nilai positif"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="currentColor"
                viewBox="0 0 24 24"
                className="w-7 h-7"
              >
                <path d="M2 21h4V9H2v12zM23 10c0-1.1-.9-2-2-2h-6.31l.95-4.57.03-.32c0-.41-.17-.79-.44-1.06L14.17 2 7.59 8.59C7.22 8.95 7 9.45 7 10v9c0 1.1.9 2 2 2h7c.83 0 1.54-.5 1.84-1.22l3.02-7.05c.09-.23.14-.47.14-.73v-1z" />
              </svg>
            </button>
            <button
              onClick={() => setFeedback(feedback === 'dislike' ? null : 'dislike')}
              className={`text-2xl transition-colors duration-300 focus:outline-none ${
                feedback === 'dislike' ? 'text-red-600' : 'text-gray-400 hover:text-red-600'
              }`}
              aria-label="Dislike"
              title="Beri nilai negatif"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="currentColor"
                viewBox="0 0 24 24"
                className="w-7 h-7"
              >
                <path d="M15 3H6c-.83 0-1.54.5-1.84 1.22L1.14 10.27c-.09.23-.14.47-.14.73v1c0 1.1.9 2 2 2h6.31l-.95 4.57-.03.32c0 .41.17.79.44 1.06L9.83 22l6.59-6.59c.37-.36.59-.86.59-1.41V5c0-1.1-.9-2-2-2zm4 0v12h4V3h-4z" />
              </svg>
            </button>
          </div>
          {feedback && (
            <p
              className={`mt-2 font-semibold ${
                feedback === 'like' ? 'text-green-600' : 'text-red-600'
              }`}
            >
              Terima kasih atas feedback Anda!
            </p>
          )}
        </div>

        {/* Toolbar kecil dalam card */}
        <div className="mt-10 p-4 bg-purple-100 rounded-lg shadow-md flex justify-center">
          <button
            onClick={() =>
              window.open(`https://wa.me/${waNumber}?text=${waMessage}`, '_blank')
            }
            className="bg-purple-700 text-white font-semibold px-6 py-2 rounded-md hover:bg-purple-800 transition"
          >
            Hubungi Kami
          </button>
        </div>

        {/* Tombol kembali */}
        <button
          onClick={() => {
            setSelectedFAQ(null)
            setFeedback(null)
          }}
          className="mt-6 text-purple-700 hover:underline font-semibold focus:outline-none"
        >
          ← Kembali ke daftar FAQ
        </button>
      </div>
    )
  }

  // Halaman daftar FAQ
  return (
    <div className="w-full max-w-3xl mx-auto bg-white px-4 md:px-12 py-8 rounded-md shadow-md">
      <h1 className="text-3xl font-bold text-gray-800 mb-8">Pusat Bantuan</h1>

      {faqData.map((section, categoryIdx) => (
        <div key={categoryIdx} className="mb-10">
          <h2 className="text-xl font-semibold text-purple-700 mb-4">{section.category}</h2>
          <div className="space-y-4">
            {section.items.map((item, itemIdx) => (
              <div
                key={itemIdx}
                className="border border-gray-200 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-300"
              >
                <button
                  onClick={() => setSelectedFAQ({ categoryIdx, itemIdx })}
                  className="w-full text-left px-4 py-3 font-medium text-gray-800 hover:bg-gray-100 focus:outline-none focus:bg-gray-100"
                >
                  {item.question}
                </button>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}

export default FAQ
