import React, { useState, useEffect } from "react";
import { supabase } from "../supabase"; // Sesuaikan dengan path Anda

function formatCurrency(num) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
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
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [loading, setLoading] = useState(true);

  // Get products from Supabase
  const fetchProducts = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('id', { ascending: true });

      if (error) throw error;
      setProducts(data || []);
    } catch (error) {
      console.error("Error fetching products:", error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  // Get unique categories for filter
  const categories = ["All", ...new Set(products.map(p => p.category))];

  // Filter products
  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "All" || product.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
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

  const handleAddOrUpdate = async () => {
    if (!formData.name || !formData.category || !formData.stock || !formData.price || !formData.description || !formData.image) {
      alert("Please fill all required fields");
      return;
    }

    const productData = {
      name: formData.name,
      category: formData.category,
      stock: parseInt(formData.stock),
      price: parseFloat(formData.price),
      description: formData.description,
      image: formData.image,
      active: formData.active,
    };

    try {
      if (isEditing) {
        const { error } = await supabase
          .from('products')
          .update(productData)
          .eq('id', editId);

        if (error) throw error;
      } else {
        const { data, error } = await supabase
          .from('products')
          .insert([productData])
          .select();

        if (error) throw error;
      }
      
      await fetchProducts();
      resetForm();
    } catch (error) {
      console.error("Error saving product:", error.message);
      alert("Failed to save product");
    }
  };

  const handleEdit = (product) => {
    setFormData({
      ...product,
      stock: product.stock.toString(),
      price: product.price.toString()
    });
    setIsEditing(true);
    setEditId(product.id);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this product?")) return;

    try {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      await fetchProducts();
    } catch (error) {
      console.error("Error deleting product:", error.message);
      alert("Failed to delete product");
    }
  };

  const toggleProductStatus = async (id) => {
    try {
      const product = products.find(p => p.id === id);
      const { error } = await supabase
        .from('products')
        .update({ active: !product.active })
        .eq('id', id);

      if (error) throw error;
      
      await fetchProducts();
    } catch (error) {
      console.error("Error updating product status:", error.message);
    }
  };

  if (loading && products.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 p-6 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading products...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">☕ Fore Coffee Menu</h1>
            <p className="text-gray-600">Manage your coffee shop products</p>
          </div>
         
          <div className="mt-4 md:mt-0 flex space-x-3">
            <button
              onClick={() => setShowForm(prev => !prev)}
              className="flex items-center gap-2 px-5 py-2.5 bg-[#025A46] text-white rounded-lg hover:bg-[#014c3b] transition-all shadow-md hover:shadow-lg"
            >
              <span>+</span>
              <span>{showForm ? "Cancel" : "Add Product"}</span>
            </button>
          </div>
        </div>

        {/* Search and Filter Section */}
        <div className="bg-white p-4 rounded-xl shadow-sm mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
              <input
                type="text"
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
              >
                {categories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>
            <div className="flex items-end">
              <span className="text-sm text-gray-500">
                Showing {filteredProducts.length} of {products.length} products
              </span>
            </div>
          </div>
        </div>

        {/* Product Form */}
        {showForm && (
          <div className="bg-white p-6 rounded-xl shadow-md mb-8 animate-fade-in">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              {isEditing ? "Edit Product" : "Add New Product"}
            </h2>
           
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Product Name*</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  placeholder="e.g. Iced Bumi Latte"
                />
              </div>
             
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category*</label>
                <input
                  type="text"
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  placeholder="e.g. Coffee, Non-Coffee"
                />
              </div>
             
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Stock*</label>
                <input
                  type="number"
                  name="stock"
                  value={formData.stock}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                />
              </div>
             
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Price*</label>
                <input
                  type="number"
                  name="price"
                  value={formData.price}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                />
              </div>
             
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Description*</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows="3"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  placeholder="Product description..."
                />
              </div>
             
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Image URL*</label>
                <input
                  type="text"
                  name="image"
                  value={formData.image}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  placeholder="https://example.com/image.jpg"
                />
                {formData.image && (
                  <div className="mt-2">
                    <img
                      src={formData.image}
                      alt="Preview"
                      className="h-32 object-cover rounded-lg border"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = "https://via.placeholder.com/300x200?text=Invalid+Image+URL";
                      }}
                    />
                  </div>
                )}
              </div>
             
              <div className="flex items-center">
                <input
                  type="checkbox"
                  name="active"
                  checked={formData.active}
                  onChange={handleChange}
                  className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                />
                <label className="ml-2 block text-sm text-gray-700">Active Product</label>
              </div>
            </div>
           
            <div className="mt-6 flex justify-end space-x-3">
              <button
                onClick={resetForm}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleAddOrUpdate}
                className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
              >
                {isEditing ? "Update Product" : "Add Product"}
              </button>
            </div>
          </div>
        )}

        {/* Products Grid */}
        {filteredProducts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredProducts.map(product => (
              <div
                key={product.id}
                className={`bg-white rounded-xl shadow-sm overflow-hidden transition-all hover:shadow-md ${!product.active ? "opacity-70" : ""}`}
              >
                <div className="relative">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-48 object-cover"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = "https://via.placeholder.com/300x200?text=No+Image";
                    }}
                  />
                  <button
                    onClick={() => toggleProductStatus(product.id)}
                    className={`absolute top-2 right-2 px-2 py-1 rounded-full text-xs font-medium ${product.active ? "bg-green-100 text-green-800" : "bg-gray-200 text-gray-600"}`}
                  >
                    {product.active ? "Active" : "Inactive"}
                  </button>
                </div>
               
                <div className="p-4">
                  <div className="flex justify-between items-start mb-1">
                    <h3 className="font-semibold text-lg text-gray-800">{product.name}</h3>
                    <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded">
                      {product.category}
                    </span>
                  </div>
                 
                  <p className="text-gray-600 text-sm mb-3 line-clamp-2">{product.description}</p>
                 
                  <div className="flex justify-between items-center mb-3">
                    <span className="font-bold text-green-600">{formatCurrency(product.price)}</span>
                    <span className={`text-sm ${product.stock < 5 ? "text-red-500" : "text-gray-500"}`}>
                      Stock: {product.stock}
                    </span>
                  </div>
                 
                  <div className="flex justify-end space-x-2">
                    <button
                      onClick={() => handleEdit(product)}
                      className="text-sm px-3 py-1 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(product.id)}
                      className="text-sm px-3 py-1 bg-red-50 text-red-600 rounded-lg hover:bg-red-100"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm p-8 text-center">
            <img
              src="https://cdn-icons-png.flaticon.com/512/4076/4076478.png"
              alt="No products"
              className="w-32 mx-auto mb-4 opacity-60"
            />
            <h3 className="text-lg font-medium text-gray-700 mb-1">No products found</h3>
            <p className="text-gray-500 mb-4">Try adjusting your search or filter criteria</p>
            <button
              onClick={() => {
                setSearchTerm("");
                setSelectedCategory("All");
                setShowForm(true);
              }}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
            >
              Add New Product
            </button>
          </div>
        )}
      </div>
    </div>
  );
}