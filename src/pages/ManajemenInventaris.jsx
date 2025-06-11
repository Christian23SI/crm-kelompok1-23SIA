import React, { useState, useEffect } from 'react';
import { FiPackage, FiPlus, FiSearch, FiFilter, FiRefreshCw, FiEdit2, FiTrash2, FiPrinter } from 'react-icons/fi';

const ManajemenInventaris = () => {
  // Data contoh inventaris
  const initialInventory = [
    {
      id: 1,
      nama: "Biji Kopi Arabika",
      kategori: "Bahan Baku",
      stok: 150,
      satuan: "kg",
      supplier: "PT Kopi Nusantara",
      hargaBeli: 120000,
      hargaJual: 180000,
      lokasi: "Gudang A",
      minStok: 50,
      terakhirDiperbarui: "2023-05-15",
      catatan: "Stok aman"
    },
    {
      id: 2,
      nama: "Susu UHT Full Cream",
      kategori: "Bahan Tambahan",
      stok: 80,
      satuan: "liter",
      supplier: "PT Greenfields Indonesia",
      hargaBeli: 25000,
      hargaJual: 0,
      lokasi: "Lemari Es 1",
      minStok: 30,
      terakhirDiperbarui: "2023-05-18",
      catatan: "Kadaluarsa 2023-07-20"
    },
    {
      id: 3,
      nama: "Cup 12oz",
      kategori: "Kemasan",
      stok: 1200,
      satuan: "pcs",
      supplier: "PT Cup Makmur",
      hargaBeli: 1500,
      hargaJual: 0,
      lokasi: "Gudang B",
      minStok: 500,
      terakhirDiperbarui: "2023-05-10",
      catatan: "Stok hampir habis"
    }
  ];

  // State management
  const [inventory, setInventory] = useState(initialInventory);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    nama: '',
    kategori: 'Bahan Baku',
    stok: '',
    satuan: 'kg',
    supplier: '',
    hargaBeli: '',
    hargaJual: '',
    lokasi: '',
    minStok: '',
    catatan: ''
  });
  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Semua');
  const [sortConfig, setSortConfig] = useState({ key: 'nama', direction: 'ascending' });

  // Kategori unik untuk filter
  const categories = ['Semua', ...new Set(initialInventory.map(item => item.kategori))];

  // Filter dan sort inventory
  const filteredInventory = inventory.filter(item => {
    const matchesSearch = item.nama.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         item.supplier.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'Semua' || item.kategori === selectedCategory;
    return matchesSearch && matchesCategory;
  }).sort((a, b) => {
    if (a[sortConfig.key] < b[sortConfig.key]) {
      return sortConfig.direction === 'ascending' ? -1 : 1;
    }
    if (a[sortConfig.key] > b[sortConfig.key]) {
      return sortConfig.direction === 'ascending' ? 1 : -1;
    }
    return 0;
  });

  // Request sort
  const requestSort = (key) => {
    let direction = 'ascending';
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };

  // Format currency
  const formatCurrency = (num) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(num);
  };

  // Handle form change
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      nama: '',
      kategori: 'Bahan Baku',
      stok: '',
      satuan: 'kg',
      supplier: '',
      hargaBeli: '',
      hargaJual: '',
      lokasi: '',
      minStok: '',
      catatan: ''
    });
    setIsEditing(false);
    setEditId(null);
    setShowForm(false);
  };

  // Handle add/update item
  const handleAddOrUpdate = () => {
    if (!formData.nama || !formData.stok || !formData.satuan || !formData.supplier) {
      alert('Harap isi semua field yang wajib diisi');
      return;
    }

    const updatedItem = {
      ...formData,
      stok: parseInt(formData.stok),
      hargaBeli: parseInt(formData.hargaBeli) || 0,
      hargaJual: parseInt(formData.hargaJual) || 0,
      minStok: parseInt(formData.minStok) || 0,
      terakhirDiperbarui: new Date().toISOString().split('T')[0]
    };

    if (isEditing) {
      updatedItem.id = editId;
      setInventory(prev => prev.map(item => item.id === editId ? updatedItem : item));
    } else {
      updatedItem.id = inventory.length ? Math.max(...inventory.map(item => item.id)) + 1 : 1;
      setInventory([...inventory, updatedItem]);
    }

    resetForm();
  };

  // Handle edit
  const handleEdit = (item) => {
    setFormData({
      nama: item.nama,
      kategori: item.kategori,
      stok: item.stok.toString(),
      satuan: item.satuan,
      supplier: item.supplier,
      hargaBeli: item.hargaBeli.toString(),
      hargaJual: item.hargaJual.toString(),
      lokasi: item.lokasi,
      minStok: item.minStok.toString(),
      catatan: item.catatan
    });
    setIsEditing(true);
    setEditId(item.id);
    setShowForm(true);
  };

  // Handle delete
  const handleDelete = (id) => {
    if (window.confirm('Apakah Anda yakin ingin menghapus item ini?')) {
      setInventory(inventory.filter(item => item.id !== id));
    }
  };

  // Handle stock adjustment
  const handleStockAdjustment = (id, adjustment) => {
    setInventory(inventory.map(item => 
      item.id === id ? { ...item, stok: item.stok + adjustment } : item
    ));
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="print:hidden flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-800 flex items-center">
              <FiPackage className="mr-2" /> Manajemen Inventaris
            </h1>
            <p className="text-gray-600 print:hidden">Kelola stok bahan baku dan perlengkapan Fore Coffee</p>
          </div>
          
          <div className="print:hidden mt-4 md:mt-0 flex space-x-3">
            <button 
              onClick={() => window.print()}
              className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
            >
              <FiPrinter /> Cetak
            </button>
            <button
              onClick={() => setShowForm(true)}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
            >
              <FiPlus /> Tambah Item
            </button>
          </div>
        </div>

        {/* Search and Filter */}
        <div className="print:hidden bg-white p-4 rounded-lg shadow-sm mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Cari</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiSearch className="text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="Cari item atau supplier..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Kategori</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiFilter className="text-gray-400" />
                </div>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="pl-10 w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                >
                  {categories.map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="flex items-end">
              <button
                onClick={() => {
                  setSearchTerm('');
                  setSelectedCategory('Semua');
                }}
                className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
              >
                <FiRefreshCw /> Reset Filter
              </button>
            </div>
          </div>
        </div>

        {/* Inventory Summary */}
        <div className="print:hidden grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white p-4 rounded-lg shadow-sm border-l-4 border-blue-500">
            <h3 className="text-sm font-medium text-gray-500">Total Item</h3>
            <p className="text-2xl font-bold text-gray-800">{inventory.length}</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm border-l-4 border-green-500">
            <h3 className="text-sm font-medium text-gray-500">Stok Aman</h3>
            <p className="text-2xl font-bold text-gray-800">
              {inventory.filter(item => item.stok > item.minStok).length}
            </p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm border-l-4 border-yellow-500">
            <h3 className="text-sm font-medium text-gray-500">Hampir Habis</h3>
            <p className="text-2xl font-bold text-gray-800">
              {inventory.filter(item => item.stok <= item.minStok && item.stok > 0).length}
            </p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm border-l-4 border-red-500">
            <h3 className="text-sm font-medium text-gray-500">Stok Habis</h3>
            <p className="text-2xl font-bold text-gray-800">
              {inventory.filter(item => item.stok === 0).length}
            </p>
          </div>
        </div>

        {/* Form Tambah/Edit Item */}
        {showForm && (
          <div className="bg-white p-6 rounded-lg shadow-md mb-8 animate-fade-in">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              {isEditing ? 'Edit Item Inventaris' : 'Tambah Item Inventaris'}
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nama Item*</label>
                <input
                  type="text"
                  name="nama"
                  value={formData.nama}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  placeholder="Contoh: Biji Kopi Arabika"
                />
              </div>
              
              <div >
                <label className="block text-sm font-medium text-gray-700 mb-1">Kategori*</label>
                <select
                  name="kategori"
                  value={formData.kategori}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                >
                  <option value="Bahan Baku">Bahan Baku</option>
                  <option value="Bahan Tambahan">Bahan Tambahan</option>
                  <option value="Kemasan">Kemasan</option>
                  <option value="Peralatan">Peralatan</option>
                  <option value="Lainnya">Lainnya</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Stok*</label>
                <input
                  type="number"
                  name="stok"
                  value={formData.stok}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Satuan*</label>
                <select
                  name="satuan"
                  value={formData.satuan}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                >
                  <option value="kg">kg</option>
                  <option value="gram">gram</option>
                  <option value="liter">liter</option>
                  <option value="ml">ml</option>
                  <option value="pcs">pcs</option>
                  <option value="pack">pack</option>
                  <option value="dus">dus</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Supplier*</label>
                <input
                  type="text"
                  name="supplier"
                  value={formData.supplier}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  placeholder="Nama supplier"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Harga Beli (IDR)</label>
                <input
                  type="number"
                  name="hargaBeli"
                  value={formData.hargaBeli}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Harga Jual (IDR)</label>
                <input
                  type="number"
                  name="hargaJual"
                  value={formData.hargaJual}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Lokasi Penyimpanan</label>
                <input
                  type="text"
                  name="lokasi"
                  value={formData.lokasi}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  placeholder="Contoh: Gudang A, Lemari Es 1"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Stok Minimum</label>
                <input
                  type="number"
                  name="minStok"
                  value={formData.minStok}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                />
              </div>
              
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Catatan</label>
                <textarea
                  name="catatan"
                  value={formData.catatan}
                  onChange={handleChange}
                  rows="2"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  placeholder="Catatan tambahan..."
                />
              </div>
            </div>
            
            <div className="mt-6 flex justify-end space-x-3">
              <button
                onClick={resetForm}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
              >
                Batal
              </button>
              <button
                onClick={handleAddOrUpdate}
                className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
              >
                {isEditing ? 'Update Item' : 'Simpan Item'}
              </button>
            </div>
          </div>
        )}

        {/* Inventory Table */}
        <div className="print:hidden bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th 
                    scope="col" 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                    onClick={() => requestSort('nama')}
                  >
                    <div className="flex items-center">
                      Nama Item
                      {sortConfig.key === 'nama' && (
                        <span className="ml-1">
                          {sortConfig.direction === 'ascending' ? '↑' : '↓'}
                        </span>
                      )}
                    </div>
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Kategori
                  </th>
                  <th 
                    scope="col" 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                    onClick={() => requestSort('stok')}
                  >
                    <div className="flex items-center">
                      Stok
                      {sortConfig.key === 'stok' && (
                        <span className="ml-1">
                          {sortConfig.direction === 'ascending' ? '↑' : '↓'}
                        </span>
                      )}
                    </div>
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Supplier
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Harga Beli
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Aksi
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredInventory.length > 0 ? (
                  filteredInventory.map((item) => (
                    <tr key={item.id} className={item.stok <= item.minStok ? (item.stok === 0 ? 'bg-red-50' : 'bg-yellow-50') : ''}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10 bg-gray-200 rounded-md flex items-center justify-center">
                            <FiPackage className="text-gray-500" />
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">{item.nama}</div>
                            <div className="text-sm text-gray-500">{item.lokasi}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{item.kategori}</div>
                        <div className="text-sm text-gray-500">{item.satuan}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{item.stok} {item.satuan}</div>
                        <div className="text-xs text-gray-500">Min: {item.minStok}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {item.supplier}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatCurrency(item.hargaBeli)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {item.stok === 0 ? (
                          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">
                            Habis
                          </span>
                        ) : item.stok <= item.minStok ? (
                          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">
                            Hampir Habis
                          </span>
                        ) : (
                          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                            Aman
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex justify-end space-x-2">
                          <button
                            onClick={() => handleStockAdjustment(item.id, 1)}
                            className="text-green-600 hover:text-green-900"
                            title="Tambah Stok"
                          >
                            +1
                          </button>
                          <button
                            onClick={() => handleStockAdjustment(item.id, -1)}
                            className="text-red-600 hover:text-red-900"
                            title="Kurangi Stok"
                          >
                            -1
                          </button>
                          <button
                            onClick={() => handleEdit(item)}
                            className="text-blue-600 hover:text-blue-900"
                            title="Edit"
                          >
                            <FiEdit2 />
                          </button>
                          <button
                            onClick={() => handleDelete(item.id)}
                            className="text-red-600 hover:text-red-900"
                            title="Hapus"
                          >
                            <FiTrash2 />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="7" className="px-6 py-4 text-center text-sm text-gray-500">
                      Tidak ada item yang ditemukan
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Inventory Summary for Printing */}
        <div className="hidden print:block mt-8">
          <h2 className="text-xl font-bold mb-4">Laporan Inventaris Fore Coffee</h2>
          <p className="mb-2">Tanggal: {new Date().toLocaleDateString('id-ID')}</p>
          <p className="mb-4">Total Item: {inventory.length}</p>
          
          <table className="min-w-full border border-gray-200">
            <thead>
              <tr className="bg-gray-100">
                <th className="border px-4 py-2 text-left">Nama Item</th>
                <th className="border px-4 py-2 text-left">Kategori</th>
                <th className="border px-4 py-2 text-left">Stok</th>
                <th className="border px-4 py-2 text-left">Supplier</th>
                <th className="border px-4 py-2 text-left">Status</th>
              </tr>
            </thead>
            <tbody>
              {inventory.map(item => (
                <tr key={item.id}>
                  <td className="border px-4 py-2">{item.nama}</td>
                  <td className="border px-4 py-2">{item.kategori}</td>
                  <td className="border px-4 py-2">{item.stok} {item.satuan}</td>
                  <td className="border px-4 py-2">{item.supplier}</td>
                  <td className="border px-4 py-2">
                    {item.stok === 0 ? 'Habis' : item.stok <= item.minStok ? 'Hampir Habis' : 'Aman'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ManajemenInventaris;