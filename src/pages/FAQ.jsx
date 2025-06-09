import { useState } from "react";

const FaqPage = () => {
  const [faqs, setFaqs] = useState([
    {
      id: 1,
      kategori: "Masalah Akun",
      pertanyaan: "Bagaimana cara reset password?",
      jawaban: 'Klik "Lupa Password" di halaman login.',
    },
    {
      id: 2,
      kategori: "Masalah Akun",
      pertanyaan: "Bagaimana cara mengubah email?",
      jawaban: "Masuk ke pengaturan profil dan edit email.",
    },
    {
      id: 3,
      kategori: "Pembelian & Pembayaran",
      pertanyaan: "Metode pembayaran apa saja yang tersedia?",
      jawaban: "Kartu kredit, e-wallet, dan transfer bank.",
    },
  ]);

  const [kategori, setKategori] = useState("");
  const [pertanyaan, setPertanyaan] = useState("");
  const [jawaban, setJawaban] = useState("");

  const handleAddFaq = () => {
    if (!kategori || !pertanyaan || !jawaban) return;

    const newFaq = {
      id: faqs.length + 1,
      kategori,
      pertanyaan,
      jawaban,
    };

    setFaqs([...faqs, newFaq]);
    setKategori("");
    setPertanyaan("");
    setJawaban("");
  };

  const handleDeleteFaq = (id) => {
    setFaqs(faqs.filter((faq) => faq.id !== id));
  };

  return (
    <div className="px-12 py-6 w-full max-w-screen-xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">Kelola FAQ</h2>

      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-2">Tambah Pertanyaan Baru</h3>
        <div className="mb-2">
          <select
            className="w-full p-2 border rounded"
            value={kategori}
            onChange={(e) => setKategori(e.target.value)}
          >
            <option value="">-- Pilih Kategori --</option>
            <option value="Masalah Akun">Masalah Akun</option>
            <option value="Pembelian & Pembayaran">Pembelian & Pembayaran</option>
            <option value="Pengiriman">Pengiriman</option>
            <option value="Lainnya">Lainnya</option>
          </select>
        </div>
        <div className="mb-2">
          <input
            type="text"
            className="w-full p-2 border rounded"
            placeholder="Pertanyaan"
            value={pertanyaan}
            onChange={(e) => setPertanyaan(e.target.value)}
          />
        </div>
        <div className="mb-2">
          <textarea
            className="w-full p-2 border rounded"
            placeholder="Jawaban"
            value={jawaban}
            onChange={(e) => setJawaban(e.target.value)}
          />
        </div>
        <button
          className="bg-blue-500 text-white px-4 py-2 rounded"
          onClick={handleAddFaq}
        >
          Tambah FAQ
        </button>
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-2">Daftar FAQ</h3>
        {Object.entries(
          faqs.reduce((acc, faq) => {
            if (!acc[faq.kategori]) acc[faq.kategori] = [];
            acc[faq.kategori].push(faq);
            return acc;
          }, {})
        ).map(([kategori, items]) => (
          <div key={kategori} className="mb-4">
            <h4 className="font-semibold text-gray-700">{kategori}</h4>
            {items.map((faq) => (
              <div
                key={faq.id}
                className="border rounded p-3 mb-2 bg-white shadow-sm"
              >
                <p className="font-medium">{faq.pertanyaan}</p>
                <p className="text-gray-600">{faq.jawaban}</p>
                <div className="text-sm mt-2 space-x-2">
                  <button className="text-blue-600 hover:underline">Edit</button>
                  <button
                    className="text-red-600 hover:underline"
                    onClick={() => handleDeleteFaq(faq.id)}
                  >
                    Hapus
                  </button>
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};

export default FaqPage;
