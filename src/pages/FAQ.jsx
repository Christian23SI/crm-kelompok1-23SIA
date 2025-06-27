import { useState, useEffect } from "react";
import { supabase } from "../supabase"; 

const FaqPage = () => {
  // State untuk data FAQ
  const [faqs, setFaqs] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // State untuk form tambah FAQ
  const [newFaq, setNewFaq] = useState({
    kategori: "",
    kategoriBaru: "",
    pertanyaan: "",
    jawaban: ""
  });

  // State untuk edit FAQ
  const [editingId, setEditingId] = useState(null);
  const [editFaq, setEditFaq] = useState({
    kategori: "",
    pertanyaan: "",
    jawaban: ""
  });

  // Fetch data FAQ dari Supabase
  useEffect(() => {
    const fetchFaqs = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('faqs')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) throw error;

        if (data) {
          setFaqs(data);
          // Ekstrak kategori unik
          const uniqueCategories = [...new Set(data.map(faq => faq.kategori))];
          setCategories(uniqueCategories);
        }
      } catch (error) {
        console.error('Error fetching FAQs:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchFaqs();
  }, []);

  // Handler untuk form tambah FAQ
  const handleAddFaq = async () => {
    const finalCategory = newFaq.kategori === "baru" 
      ? newFaq.kategoriBaru.trim() 
      : newFaq.kategori;

    if (!finalCategory || !newFaq.pertanyaan.trim() || !newFaq.jawaban.trim()) {
      alert("Semua field harus diisi!");
      return;
    }

    try {
      setLoading(true);
      
      // Insert new FAQ ke Supabase
      const { data, error } = await supabase
        .from('faqs')
        .insert([{
          kategori: finalCategory,
          pertanyaan: newFaq.pertanyaan.trim(),
          jawaban: newFaq.jawaban.trim()
        }])
        .select();

      if (error) throw error;

      if (data && data.length > 0) {
        // Update state lokal
        setFaqs([data[0], ...faqs]);
        
        // Update kategori jika baru
        if (newFaq.kategori === "baru" && !categories.includes(finalCategory)) {
          setCategories([...categories, finalCategory]);
        }

        // Reset form
        setNewFaq({
          kategori: "",
          kategoriBaru: "",
          pertanyaan: "",
          jawaban: ""
        });
      }
    } catch (error) {
      console.error('Error adding FAQ:', error);
      alert("Gagal menambahkan FAQ: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  // Handler untuk memulai edit FAQ
  const startEdit = (faq) => {
    setEditingId(faq.id);
    setEditFaq({
      kategori: faq.kategori,
      pertanyaan: faq.pertanyaan,
      jawaban: faq.jawaban
    });
  };

  // Handler untuk menyimpan perubahan edit
  const handleUpdateFaq = async () => {
    if (!editFaq.kategori || !editFaq.pertanyaan.trim() || !editFaq.jawaban.trim()) {
      alert("Semua field harus diisi!");
      return;
    }

    try {
      setLoading(true);
      
      // Update FAQ di Supabase
      const { data, error } = await supabase
        .from('faqs')
        .update({
          kategori: editFaq.kategori,
          pertanyaan: editFaq.pertanyaan.trim(),
          jawaban: editFaq.jawaban.trim(),
          updated_at: new Date().toISOString()
        })
        .eq('id', editingId)
        .select();

      if (error) throw error;

      if (data && data.length > 0) {
        // Update state lokal
        setFaqs(faqs.map(f => f.id === editingId ? data[0] : f));
        setEditingId(null);
        
        // Update kategori jika baru
        if (!categories.includes(editFaq.kategori)) {
          setCategories([...categories, editFaq.kategori]);
        }
      }
    } catch (error) {
      console.error('Error updating FAQ:', error);
      alert("Gagal mengupdate FAQ: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  // Handler untuk membatalkan edit
  const cancelEdit = () => {
    setEditingId(null);
    setEditFaq({
      kategori: "",
      pertanyaan: "",
      jawaban: ""
    });
  };

  // Handler untuk menghapus FAQ
  const handleDeleteFaq = async (id) => {
    if (!window.confirm('Apakah Anda yakin ingin menghapus FAQ ini?')) return;
    
    try {
      setLoading(true);
      const { error } = await supabase
        .from('faqs')
        .delete()
        .eq('id', id);

      if (error) throw error;

      // Update state lokal
      setFaqs(faqs.filter(faq => faq.id !== id));
    } catch (error) {
      console.error('Error deleting FAQ:', error);
      alert('Gagal menghapus FAQ: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  // Kelompokkan FAQ berdasarkan kategori
  const faqsByCategory = faqs.reduce((acc, faq) => {
    if (!acc[faq.kategori]) acc[faq.kategori] = [];
    acc[faq.kategori].push(faq);
    return acc;
  }, {});

  return (
    <div className="w-full py-8 px-6">
      <h2 className="text-3xl font-bold text-green-800 mb-6">Kelola FAQ</h2>

      {/* Form Tambah FAQ */}
      <div className="bg-green-50 p-6 rounded-lg shadow mb-10">
        <h3 className="text-xl font-semibold text-green-800 mb-4">
          Tambah Pertanyaan Baru
        </h3>

        <div className="mb-3">
          <label className="block mb-1 text-sm text-gray-700">Kategori</label>
          <select
            className="w-full p-2 border rounded"
            value={newFaq.kategori}
            onChange={(e) => setNewFaq({...newFaq, kategori: e.target.value})}
            disabled={loading}
          >
            <option value="">-- Pilih Kategori --</option>
            {categories.map((category, index) => (
              <option key={index} value={category}>{category}</option>
            ))}
            <option value="baru">+ Tambahkan Kategori Baru</option>
          </select>
        </div>

        {newFaq.kategori === "baru" && (
          <div className="mb-3">
            <input
              type="text"
              className="w-full p-2 border rounded"
              placeholder="Nama Kategori Baru"
              value={newFaq.kategoriBaru}
              onChange={(e) => setNewFaq({...newFaq, kategoriBaru: e.target.value})}
              disabled={loading}
            />
          </div>
        )}

        <div className="mb-3">
          <input
            type="text"
            className="w-full p-2 border rounded"
            placeholder="Pertanyaan"
            value={newFaq.pertanyaan}
            onChange={(e) => setNewFaq({...newFaq, pertanyaan: e.target.value})}
            disabled={loading}
          />
        </div>

        <div className="mb-3">
          <textarea
            className="w-full p-2 border rounded"
            placeholder="Jawaban"
            value={newFaq.jawaban}
            onChange={(e) => setNewFaq({...newFaq, jawaban: e.target.value})}
            disabled={loading}
          />
        </div>

        <button
          className={`px-4 py-2 rounded shadow ${loading ? 'bg-gray-400' : 'bg-green-800 hover:bg-green-900'} text-white`}
          onClick={handleAddFaq}
          disabled={loading}
        >
          {loading ? 'Menambahkan...' : 'Tambah FAQ'}
        </button>
      </div>

      {/* Daftar FAQ */}
      <div>
        <h3 className="text-xl font-semibold text-green-800 mb-4">Daftar FAQ</h3>
        
        {loading && faqs.length === 0 ? (
          <div className="text-center py-10">Memuat data...</div>
        ) : Object.entries(faqsByCategory).length === 0 ? (
          <div className="text-center py-10">Belum ada FAQ</div>
        ) : (
          Object.entries(faqsByCategory).map(([category, items]) => (
            <div key={category} className="mb-6">
              <h4 className="text-lg font-bold text-green-700 mb-2">{category}</h4>
              {items.map((faq) => (
                <div key={faq.id} className="bg-white p-4 rounded shadow border border-green-100 mb-3">
                  {editingId === faq.id ? (
                    <div className="space-y-3">
                      <select
                        className="w-full p-2 border rounded"
                        value={editFaq.kategori}
                        onChange={(e) => setEditFaq({...editFaq, kategori: e.target.value})}
                      >
                        <option value="">-- Pilih Kategori --</option>
                        {categories.map((cat, index) => (
                          <option key={index} value={cat}>{cat}</option>
                        ))}
                        <option value="baru">+ Kategori Baru</option>
                      </select>
                      
                      {editFaq.kategori === "baru" && (
                        <input
                          type="text"
                          className="w-full p-2 border rounded"
                          placeholder="Nama Kategori Baru"
                          value={editFaq.kategori}
                          onChange={(e) => setEditFaq({...editFaq, kategori: e.target.value})}
                        />
                      )}
                      
                      <input
                        type="text"
                        className="w-full p-2 border rounded"
                        value={editFaq.pertanyaan}
                        onChange={(e) => setEditFaq({...editFaq, pertanyaan: e.target.value})}
                      />
                      
                      <textarea
                        className="w-full p-2 border rounded"
                        value={editFaq.jawaban}
                        onChange={(e) => setEditFaq({...editFaq, jawaban: e.target.value})}
                      />
                      
                      <div className="flex space-x-2">
                        <button
                          className="bg-green-600 text-white px-3 py-1 rounded"
                          onClick={handleUpdateFaq}
                          disabled={loading}
                        >
                          {loading ? 'Menyimpan...' : 'Simpan'}
                        </button>
                        <button
                          className="bg-gray-500 text-white px-3 py-1 rounded"
                          onClick={cancelEdit}
                          disabled={loading}
                        >
                          Batal
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <p className="font-medium text-gray-800">{faq.pertanyaan}</p>
                      <p className="text-gray-600">{faq.jawaban}</p>
                      <div className="text-sm mt-2 space-x-3">
                        <button
                          className="text-green-700 hover:underline"
                          onClick={() => startEdit(faq)}
                          disabled={loading}
                        >
                          Edit
                        </button>
                        <button
                          className="text-red-600 hover:underline"
                          onClick={() => handleDeleteFaq(faq.id)}
                          disabled={loading}
                        >
                          Hapus
                        </button>
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default FaqPage;