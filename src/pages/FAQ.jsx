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

  const [kategoriTersedia, setKategoriTersedia] = useState([
    "Masalah Akun",
    "Pembelian & Pembayaran",
    "Pengiriman",
  ]);

  const [kategori, setKategori] = useState("");
  const [kategoriBaru, setKategoriBaru] = useState("");
  const [pertanyaan, setPertanyaan] = useState("");
  const [jawaban, setJawaban] = useState("");

  const handleAddFaq = () => {
    const finalKategori = kategori === "baru" ? kategoriBaru.trim() : kategori;

    if (!finalKategori || !pertanyaan.trim() || !jawaban.trim()) return;

    if (kategori === "baru" && !kategoriTersedia.includes(finalKategori)) {
      setKategoriTersedia([...kategoriTersedia, finalKategori]);
    }

    const newFaq = {
      id: faqs.length + 1,
      kategori: finalKategori,
      pertanyaan: pertanyaan.trim(),
      jawaban: jawaban.trim(),
    };

    setFaqs([...faqs, newFaq]);
    setKategori("");
    setKategoriBaru("");
    setPertanyaan("");
    setJawaban("");
  };

  const handleDeleteFaq = (id) => {
    setFaqs(faqs.filter((faq) => faq.id !== id));
  };

  return (
    <div className="w-full py-8 px-6">
      <h2 className="text-3xl font-bold text-green-800 mb-6">Kelola FAQ</h2>

      <div className="bg-green-50 p-6 rounded-lg shadow mb-10">
        <h3 className="text-xl font-semibold text-green-800 mb-4">
          Tambah Pertanyaan Baru
        </h3>

        <div className="mb-3">
          <label className="block mb-1 text-sm text-gray-700">Kategori</label>
          <select
            className="w-full p-2 border rounded"
            value={kategori}
            onChange={(e) => setKategori(e.target.value)}
          >
            <option value="">-- Pilih Kategori --</option>
            {kategoriTersedia.map((item, index) => (
              <option key={index} value={item}>
                {item}
              </option>
            ))}
            <option value="baru">+ Tambahkan Kategori Baru</option>
          </select>
        </div>

        {kategori === "baru" && (
          <div className="mb-3">
            <input
              type="text"
              className="w-full p-2 border rounded"
              placeholder="Nama Kategori Baru"
              value={kategoriBaru}
              onChange={(e) => setKategoriBaru(e.target.value)}
            />
          </div>
        )}

        <div className="mb-3">
          <input
            type="text"
            className="w-full p-2 border rounded"
            placeholder="Pertanyaan"
            value={pertanyaan}
            onChange={(e) => setPertanyaan(e.target.value)}
          />
        </div>

        <div className="mb-3">
          <textarea
            className="w-full p-2 border rounded"
            placeholder="Jawaban"
            value={jawaban}
            onChange={(e) => setJawaban(e.target.value)}
          />
        </div>

        <button
          className="bg-green-800 hover:bg-green-900 text-white px-4 py-2 rounded shadow"
          onClick={handleAddFaq}
        >
          Tambah FAQ
        </button>
      </div>

      <div>
        <h3 className="text-xl font-semibold text-green-800 mb-4">Daftar FAQ</h3>
        {Object.entries(
          faqs.reduce((acc, faq) => {
            if (!acc[faq.kategori]) acc[faq.kategori] = [];
            acc[faq.kategori].push(faq);
            return acc;
          }, {})
        ).map(([kategori, items]) => (
          <div key={kategori} className="mb-6">
            <h4 className="text-lg font-bold text-green-700 mb-2">{kategori}</h4>
            {items.map((faq) => (
              <div
                key={faq.id}
                className="bg-white p-4 rounded shadow border border-green-100 mb-3"
              >
                <p className="font-medium text-gray-800">{faq.pertanyaan}</p>
                <p className="text-gray-600">{faq.jawaban}</p>
                <div className="text-sm mt-2 space-x-3">
                  <button className="text-green-700 hover:underline">Edit</button>
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
