import React, { useState, useEffect } from "react";

const initialProducts = [
  {
    id: 1,
    name: "Latte Macchiato",
    category: "Coffee",
    stock: 10,
    price: 38000,
    active: true,
    description: "Kopi susu dengan layer espresso dan steamed milk.",
    image: "https://fore.coffee/assets/img/menu/latte-macchiato.jpg",
  },
  {
    id: 2,
    name: "Matcha Latte",
    category: "Non-Coffee",
    stock: 7,
    price: 42000,
    active: true,
    description: "Perpaduan matcha premium dan susu segar.",
    image: "https://fore.coffee/assets/img/menu/matcha-latte.jpg",
  },
];

function formatCurrency(num) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
  }).format(num);
}

export default function ProductManagement() {
  const [products, setProducts] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    category: "",
    stock: "",
    price: "",
    description: "",
    image: "",
    active: true,
  });
  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState(null);

  // Load from localStorage
  useEffect(() => {
    const stored = localStorage.getItem("products");
    if (stored) {
      setProducts(JSON.parse(stored));
    } else {
      setProducts(initialProducts);
    }
  }, []);

  // Save to localStorage
  useEffect(() => {
    localStorage.setItem("products", JSON.stringify(products));
  }, [products]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const resetForm = () => {
    setFormData({
      name: "",
      category: "",
      stock: "",
      price: "",
      description: "",
      image: "",
      active: true,
    });
    setIsEditing(false);
    setEditId(null);
    setShowForm(false);
  };

  const handleAddOrUpdate = () => {
    if (!formData.name || !formData.category || !formData.stock || !formData.price || !formData.description || !formData.image) {
      alert("Semua kolom harus diisi");
      return;
    }

    const updatedProduct = {
      ...formData,
      stock: parseInt(formData.stock),
      price: parseFloat(formData.price),
    };

    if (isEditing) {
      updatedProduct.id = editId;
      setProducts((prev) =>
        prev.map((p) => (p.id === editId ? updatedProduct : p))
      );
    } else {
      updatedProduct.id = products.length ? products[products.length - 1].id + 1 : 1;
      setProducts([...products, updatedProduct]);
    }

    resetForm();
  };

  const handleEdit = (product) => {
    setFormData({ ...product });
    setIsEditing(true);
    setEditId(product.id);
    setShowForm(true);
  };

  const handleDelete = (id) => {
    if (window.confirm("Yakin ingin menghapus produk ini?")) {
      setProducts(products.filter((p) => p.id !== id));
    }
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h1 className="text-2xl font-semibold mb-4">Manajemen Produk Fore Coffee</h1>

       <button
        onClick={() => setShowForm((prev) => !prev)}
        className="mb-4 flex items-center gap-2 px-5 py-2 bg-[#025A46] text-white rounded-full hover:bg-[#014c3b] transition"
      >
        🛒 Tambah Produk
      </button>

      {showForm && (
        <div className="mb-6 p-4 border border-gray-300 rounded bg-white shadow-sm">
          <div className="mb-2">
            <label className="block mb-1 font-medium">Nama Produk</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="w-full px-3 py-2 border rounded"
              placeholder="Masukkan nama produk"
            />
          </div>
          <div className="mb-2">
            <label className="block mb-1 font-medium">Kategori</label>
            <input
              type="text"
              name="category"
              value={formData.category}
              onChange={handleChange}
              className="w-full px-3 py-2 border rounded"
              placeholder="Contoh: Coffee, Non-Coffee, Fore Deli"
            />
          </div>
          <div className="mb-2">
            <label className="block mb-1 font-medium">Stok</label>
            <input
              type="number"
              name="stock"
              value={formData.stock}
              onChange={handleChange}
              className="w-full px-3 py-2 border rounded"
            />
          </div>
          <div className="mb-2">
            <label className="block mb-1 font-medium">Harga</label>
            <input
              type="number"
              name="price"
              value={formData.price}
              onChange={handleChange}
              className="w-full px-3 py-2 border rounded"
            />
          </div>
          <div className="mb-2">
            <label className="block mb-1 font-medium">Deskripsi</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              className="w-full px-3 py-2 border rounded"
              placeholder="Deskripsi singkat mengenai produk"
            />
          </div>
          <div className="mb-2">
            <label className="block mb-1 font-medium">URL Gambar</label>
            <input
              type="text"
              name="image"
              value={formData.image}
              onChange={handleChange}
              className="w-full px-3 py-2 border rounded"
              placeholder="https://..."
            />
          </div>
          <div className="mb-4">
            <label className="inline-flex items-center">
              <input
                type="checkbox"
                name="active"
                checked={formData.active}
                onChange={handleChange}
                className="mr-2"
              />
              Aktif
            </label>
          </div>

          <button
            onClick={handleAddOrUpdate}
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
          >
            {isEditing ? "Update Produk" : "Simpan Produk"}
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {products.map((product) => (
          <div key={product.id} className="border rounded shadow-sm p-4 bg-white">
            <img src={product.image} alt={product.name} className="w-full h-40 object-cover rounded mb-2" />
            <h2 className="text-lg font-semibold">{product.name}</h2>
            <p className="text-sm text-gray-600 mb-1">{product.category}</p>
            <p className="text-sm text-gray-800 mb-1">{product.description}</p>
            <p className="text-md font-bold text-green-600 mb-2">{formatCurrency(product.price)}</p>
            <div className="flex justify-between items-center">
              <span className="text-sm">Stok: {product.stock}</span>
              <span className={`text-xs px-2 py-1 rounded ${product.active ? "bg-green-100 text-green-800" : "bg-gray-200 text-gray-600"}`}>
                {product.active ? "Aktif" : "Nonaktif"}
              </span>
            </div>
            <div className="mt-3 text-right">
              <button
                className="text-indigo-600 hover:text-indigo-900 text-sm mr-3"
                onClick={() => handleEdit(product)}
              >
                Edit
              </button>
              <button
                className="text-red-600 hover:text-red-900 text-sm"
                onClick={() => handleDelete(product.id)}
              >
                Hapus
              </button>
            </div>
          </div>
        ))}
        {products.length === 0 && (
          <p className="text-center text-gray-500 col-span-full">Tidak ada produk tersedia.</p>
        )}
      </div>
    </div>
  );
}