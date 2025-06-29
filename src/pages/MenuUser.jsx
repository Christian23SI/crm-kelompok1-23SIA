import React, { useState, useEffect } from "react";
import { supabase } from "../supabase";
import { ShoppingCart, X, Plus, Minus, Gift, CreditCard } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function MenuUser() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");
  const [cart, setCart] = useState([]);
  const [showCart, setShowCart] = useState(false);
  const [tableNumber, setTableNumber] = useState("");
  const [voucherCode, setVoucherCode] = useState("");
  const [voucher, setVoucher] = useState(null);
  const [voucherError, setVoucherError] = useState("");
  const [user, setUser] = useState(null);
  const [namaPemesan, setNamaPemesan] = useState("");
  const [notes, setNotes] = useState("");
  const [showStockAlert, setShowStockAlert] = useState(false);
  const [stockAlertMessage, setStockAlertMessage] = useState("");
  const navigate = useNavigate();

  // Fetch products
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('products')
          .select('*')
          .eq('active', true)
          .order('category', { ascending: true });

        if (error) throw error;
        setProducts(data || []);
      } catch (error) {
        console.error("Error fetching products:", error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  // Get user session
  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    };
    getUser();
  }, []);

  // Filter products
  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "All" || product.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Get unique categories
  const categories = ["All", ...new Set(products.map(p => p.category))];

  // Add to cart
  const addToCart = (product) => {
    setCart(prev => {
      const existingItem = prev.find(item => item.id === product.id);
      if (existingItem) {
        return prev.map(item =>
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { ...product, quantity: 1 }];
    });
  };

  // Remove from cart
  const removeFromCart = (productId) => {
    setCart(prev => prev.filter(item => item.id !== productId));
  };

  // Update quantity
  const updateQuantity = (productId, newQuantity) => {
    if (newQuantity < 1) return;
    setCart(prev =>
      prev.map(item =>
        item.id === productId ? { ...item, quantity: newQuantity } : item
      )
    );
  };

  // Calculate totals
  const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const discount = voucher ? (subtotal * voucher.discount) / 100 : 0;
  const total = subtotal - discount;

  // Apply voucher
  const applyVoucher = async () => {
    if (!voucherCode) {
      setVoucherError("Please enter voucher code");
      return;
    }

    try {
      const { data, error } = await supabase
        .from('vouchers')
        .select('*')
        .eq('code', voucherCode)
        .eq('is_active', true)
        .single();

      if (error) throw error;
      if (!data) {
        setVoucherError("Voucher not found");
        return;
      }

      const now = new Date();
      const validFrom = new Date(data.valid_from);
      const validUntil = new Date(data.valid_until);

      if (now < validFrom || now > validUntil) {
        setVoucherError("Voucher is not valid");
        return;
      }

      if (data.max_usage && data.current_usage >= data.max_usage) {
        setVoucherError("Voucher has reached maximum usage");
        return;
      }

      if (subtotal < data.min_order) {
        setVoucherError(`Minimum order Rp${data.min_order.toLocaleString('id-ID')}`);
        return;
      }

      setVoucher(data);
      setVoucherError("");
    } catch (error) {
      console.error("Error applying voucher:", error.message);
      setVoucherError("Invalid voucher code");
    }
  };

  const placeOrder = async () => {
    if (!tableNumber || !namaPemesan) {
      alert("Harap masukkan nomor meja dan nama pemesan");
      return;
    }

    if (cart.length === 0) {
      alert("Keranjang belanja Anda kosong");
      return;
    }

    try {
      // 1. Verifikasi stok produk
      for (const item of cart) {
        const { data: product, error } = await supabase
          .from('products')
          .select('stock')
          .eq('id', item.id)
          .single();
        
        if (error) throw error;
        if (product.stock < item.quantity) {
          setStockAlertMessage(`Stok ${item.name} tidak mencukupi (tersedia: ${product.stock})`);
          setShowStockAlert(true);
          return;
        }
      }

      // 2. Buat order
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert({
          customer_id: user?.id,
          nama_pemesan: namaPemesan,
          table_number: tableNumber,
          total_amount: subtotal,
          discount_amount: discount,
          final_amount: total,
          payment_method: 'cashless',
          voucher_code: voucher?.code,
          notes: notes,
          status: 'Processing'
        })
        .select()
        .single();

      if (orderError) throw orderError;

      // 3. Buat order items
      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(
          cart.map(item => ({
            order_id: order.id,
            product_id: item.id,
            quantity: item.quantity,
            price: item.price,
            notes: item.notes || ''
          }))
        );

      if (itemsError) throw itemsError;

      // 4. Update stok produk menggunakan RPC
      for (const item of cart) {
        const { error: stockError } = await supabase
          .rpc('decrement_stock', {
            product_id: item.id,
            quantity: item.quantity
          });

        if (stockError) throw stockError;
      }

      // 5. Update voucher jika digunakan
      if (voucher) {
        const { error: voucherError } = await supabase
          .rpc('increment_voucher_usage', {
            voucher_code: voucher.code
          });

        if (voucherError) throw voucherError;
      }

      // Redirect ke halaman riwayat
      navigate('/pemesananuser', {
        state: { 
          success: true,
          orderId: order.id,
          orderData: {
            ...order,
            items: cart
          }
        }
      });

      // Reset state
      setCart([]);
      setShowCart(false);
      setVoucher(null);
      setVoucherCode("");

    } catch (error) {
      console.error('Error:', error);
      alert(`Pemesanan gagal: ${error.message}`);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">☕ Fore Coffee Menu</h1>
            <p className="text-gray-500">Order your favorite coffee</p>
          </div>
          <button
            onClick={() => setShowCart(true)}
            className="relative p-2 text-gray-700 hover:text-green-600"
          >
            <ShoppingCart size={24} />
            {cart.length > 0 && (
              <span className="absolute -top-1 -right-1 bg-green-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                {cart.length}
              </span>
            )}
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
        {/* Search and Filter */}
        <div className="mb-6 bg-white p-4 rounded-lg shadow-sm">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
              <input
                type="text"
                placeholder="Search menu..."
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
                Showing {filteredProducts.length} items
              </span>
            </div>
          </div>
        </div>

        {/* Menu Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredProducts.map(product => (
            <div
              key={product.id}
              className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-all flex flex-col h-full"
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
                {product.stock < 5 && (
                  <span className="absolute top-2 right-2 bg-red-100 text-red-800 text-xs px-2 py-1 rounded-full">
                    Low stock
                  </span>
                )}
              </div>
              <div className="p-4 flex flex-col flex-grow">
                <div className="flex justify-between items-start mb-1">
                  <h3 className="font-semibold text-lg text-gray-800">{product.name}</h3>
                  <span className="font-bold text-green-600">
                    Rp{product.price.toLocaleString('id-ID')}
                  </span>
                </div>
                <p className="text-gray-600 text-sm mb-3 line-clamp-2 flex-grow">{product.description}</p>
                <button
                  onClick={() => addToCart(product)}
                  disabled={product.stock <= 0}
                  className={`w-full py-2 rounded-lg flex items-center justify-center gap-2 mt-auto ${product.stock <= 0
                      ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                      : 'bg-green-600 text-white hover:bg-green-700'
                    }`}
                >
                  <Plus size={16} />
                  {product.stock <= 0 ? 'Out of stock' : 'Add to order'}
                </button>
              </div>
            </div>
          ))}
        </div>
      </main>

      {/* Shopping Cart Sidebar */}
      {showCart && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          <div className="absolute inset-0 overflow-hidden">
            <div
              className="absolute inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
              onClick={() => setShowCart(false)}
            ></div>
            <div className="fixed inset-y-0 right-0 max-w-full flex">
              <div className="relative w-screen max-w-md">
                <div className="h-full flex flex-col bg-white shadow-xl">
                  <div className="flex-1 overflow-y-auto">
                    <div className="px-4 py-6 sm:px-6 bg-green-600 text-white">
                      <div className="flex items-center justify-between">
                        <h2 className="text-lg font-medium">Your Order</h2>
                        <button
                          type="button"
                          className="text-white hover:text-gray-200"
                          onClick={() => setShowCart(false)}
                        >
                          <X size={24} />
                        </button>
                      </div>
                    </div>

                    <div className="px-4 py-6 sm:px-6">
                      <div className="space-y-4">
                        {cart.length === 0 ? (
                          <p className="text-gray-500 text-center py-8">Your cart is empty</p>
                        ) : (
                          cart.map(item => (
                            <div key={item.id} className="flex items-start border-b pb-4">
                              <div className="flex-shrink-0">
                                <img
                                  src={item.image}
                                  alt={item.name}
                                  className="h-16 w-16 rounded-md object-cover"
                                />
                              </div>
                              <div className="ml-4 flex-1">
                                <div className="flex justify-between">
                                  <h3 className="text-sm font-medium text-gray-900">{item.name}</h3>
                                  <p className="ml-4 text-sm font-medium text-gray-900">
                                    Rp{(item.price * item.quantity).toLocaleString('id-ID')}
                                  </p>
                                </div>
                                <div className="flex items-center mt-2">
                                  <button
                                    onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                    className="text-gray-500 hover:text-green-600"
                                  >
                                    <Minus size={16} />
                                  </button>
                                  <span className="mx-2 text-gray-700">{item.quantity}</span>
                                  <button
                                    onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                    className="text-gray-500 hover:text-green-600"
                                  >
                                    <Plus size={16} />
                                  </button>
                                  <button
                                    onClick={() => removeFromCart(item.id)}
                                    className="ml-auto text-red-500 hover:text-red-700"
                                  >
                                    <X size={16} />
                                  </button>
                                </div>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="border-t border-gray-200 px-4 py-6 sm:px-6">
                    {/* Voucher Section */}
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Voucher Code
                      </label>
                      <div className="flex">
                        <input
                          type="text"
                          value={voucherCode}
                          onChange={(e) => setVoucherCode(e.target.value)}
                          placeholder="Enter voucher code"
                          className="flex-1 px-4 py-2 border border-gray-300 rounded-l-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                        />
                        <button
                          onClick={applyVoucher}
                          className="px-4 py-2 bg-green-600 text-white rounded-r-lg hover:bg-green-700"
                        >
                          Apply
                        </button>
                      </div>
                      {voucherError && (
                        <p className="mt-1 text-sm text-red-600">{voucherError}</p>
                      )}
                      {voucher && (
                        <div className="mt-2 p-2 bg-green-50 text-green-800 text-sm rounded-lg flex items-center">
                          <Gift size={16} className="mr-2" />
                          Voucher applied: {voucher.code} (-{voucher.discount}%)
                          <button
                            onClick={() => {
                              setVoucher(null);
                              setVoucherCode("");
                            }}
                            className="ml-auto text-green-600 hover:text-green-800"
                          >
                            <X size={16} />
                          </button>
                        </div>
                      )}
                    </div>

                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Your Name*
                      </label>
                      <input
                        type="text"
                        value={namaPemesan}
                        onChange={(e) => setNamaPemesan(e.target.value)}
                        placeholder="Enter your name"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                        required
                      />
                    </div>

                    {/* Table Number */}
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Table Number*
                      </label>
                      <input
                        type="text"
                        value={tableNumber}
                        onChange={(e) => setTableNumber(e.target.value)}
                        placeholder="Enter your table number"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                        required
                      />
                    </div>

                    {/* Notes */}
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Additional Notes
                      </label>
                      <textarea
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        placeholder="Special requests, allergies, etc."
                        rows={2}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                      />
                    </div>

                    {/* Order Summary */}
                    <div className="space-y-2 mb-4">
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Subtotal</span>
                        <span className="text-sm font-medium">
                          Rp{subtotal.toLocaleString('id-ID')}
                        </span>
                      </div>
                      {voucher && (
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Discount ({voucher.discount}%)</span>
                          <span className="text-sm font-medium text-green-600">
                            -Rp{discount.toLocaleString('id-ID')}
                          </span>
                        </div>
                      )}
                      <div className="flex justify-between border-t border-gray-200 pt-2">
                        <span className="text-base font-medium">Total</span>
                        <span className="text-base font-bold">
                          Rp{total.toLocaleString('id-ID')}
                        </span>
                      </div>
                    </div>

                    {/* Payment Method */}
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Payment Method
                      </label>
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center">
                          <CreditCard className="text-green-600 mr-2" size={20} />
                          <span className="text-sm">Cashless Payment</span>
                        </div>
                      </div>
                    </div>

                    {/* Place Order Button */}
                    <button
                      onClick={placeOrder}
                      disabled={cart.length === 0 || !tableNumber || !namaPemesan}
                      className={`w-full py-3 rounded-lg flex items-center justify-center gap-2 ${cart.length === 0 || !tableNumber || !namaPemesan
                          ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                          : 'bg-green-600 text-white hover:bg-green-700'
                        }`}
                    >
                      Place Order
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Stock Alert Modal */}
      {showStockAlert && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-red-600">Stok Tidak Mencukupi</h3>
              <button 
                onClick={() => setShowStockAlert(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X size={20} />
              </button>
            </div>
            <p className="mb-4">{stockAlertMessage}</p>
            <div className="flex justify-end">
              <button
                onClick={() => setShowStockAlert(false)}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                OK
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}