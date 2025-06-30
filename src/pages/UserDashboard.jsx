import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../supabase";
import Logo from '../assets/Logo.png';

export default function UserDashboard() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("recommended");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [products, setProducts] = useState([]);
  const [vouchers, setVouchers] = useState([]);
  const [orders, setOrders] = useState([]);
  const [userData, setUserData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [appliedVoucher, setAppliedVoucher] = useState(null);

  // Fetch data from Supabase
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);

      try {
        // Fetch user data
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          setUserData({
            name: user.user_metadata?.full_name || "Abelia",
            email: user.email,
            avatar: `https://i.pravatar.cc/150?img=31`
          });

          // Fetch user orders (last 3 months)
          const threeMonthsAgo = new Date();
          threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);

          const { data: ordersData } = await supabase
            .from('orders')
            .select('*')
            .eq('customer_id', user.id)
            .gte('order_date', threeMonthsAgo.toISOString())
            .order('created_at', { ascending: false })
            .limit(10);
          setOrders(ordersData || []);
        }

        // Fetch products with full-text search support
        let productsQuery = supabase
          .from('products')
          .select('*')
          .eq('active', true);

        if (searchTerm) {
          productsQuery = productsQuery.textSearch('search_vector', searchTerm);
        }

        const { data: productsData } = await productsQuery;
        setProducts(productsData || []);

        // Fetch active vouchers
        const currentDate = new Date().toISOString();
        const { data: vouchersData } = await supabase
          .from('vouchers')
          .select('*')
          .eq('is_active', true)
          .lte('valid_from', currentDate)
          .gte('valid_until', currentDate);
        setVouchers(vouchersData || []);

      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [searchTerm]);

  // Get unique categories for filter
  const categories = ["All", ...new Set(products.map(item => item.category))];

  // Filter products based on category
  const filteredItems = selectedCategory === "All"
    ? products
    : products.filter(item => item.category === selectedCategory);

  // Recommended items logic
  const recommendedItems = (() => {
    if (orders.length === 0) return products.slice(0, 4);

    // Get product IDs from order items
    const orderedProductIds = orders.flatMap(order =>
      order.items ? order.items.map(item => item.product_id) : []
    );

    // Filter products that appear in orders
    return products.filter(product =>
      orderedProductIds.includes(product.id)
    ).slice(0, 4); // Limit to 4 items
  })();

  // Get discounted items (products that have discount field)
  const discountedItems = products.filter(product => product.discount > 0);

  // Get items to display based on active tab
  const getDisplayItems = () => {
    switch (activeTab) {
      case "recommended":
        return recommendedItems;
      case "discount":
        return discountedItems;
      case "all":
        return filteredItems;
      default:
        return filteredItems;
    }
  };

  const displayItems = getDisplayItems();

  const navigateToProduct = (productId) => {
    navigate(`/produkuser`);
  };

  const applyVoucher = (voucher) => {
    setAppliedVoucher(voucher);
  };

  const removeVoucher = () => {
    setAppliedVoucher(null);
  };

  const formatCurrency = (num) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(num);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-amber-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-amber-800">Loading your coffee experience...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-amber-20 p-4 md:p-6 font-sans">
      <div className="max-w-7xl mx-auto">
        {/* Welcome Section */}
        <div className="bg-gradient-to-r from-amber-700 to-amber-900 rounded-3xl p-6 mb-8 text-white shadow-lg relative overflow-hidden">
          <div className="absolute top-0 right-0 w-1/3 h-full bg-gradient-to-l from-amber-600/20 to-transparent"></div>
          <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between">
            <div className="flex items-center mb-4 md:mb-0">
  <div className="relative">
    <img
      src={userData?.avatar || "https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&auto=format&fit=crop&w=200&q=80"} 
      alt={userData?.name || "User"}
      className="w-16 h-16 rounded-full border-2 border-amber-300 object-cover bg-gray-200"
      onError={(e) => {
        e.target.onerror = null;
        e.target.src = "https://i.pravatar.cc/150?img=31";
      }}
    />
  </div>
  <div className="ml-4">
    <h1 className="text-2xl text-black font-bold">Welcome back, {userData?.name || 'Abellia'}!</h1>
    <div className="flex items-center mt-1">
      <span className="bg-amber-300/20 px-2 py-1 rounded-full text-xs text-yellow-700 font-medium flex items-center">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
        </svg>
        Gold Member
      </span>
      <span className="ml-2 text-amber-700 text-sm">• 12 orders this month</span>
    </div>
  </div>
</div>
            {orders.length > 2 && (
              <div className="bg-white/10 p-4 rounded-xl backdrop-blur-sm border border-amber-300/20">
                <p className="text-gray-700 text-sm">Last ordered</p>
                <p className="font-semibold text-lg">
                  {orders[0].items?.[0]?.name || "Your favorite drink"}
                </p>
                <button
                  onClick={() => navigateToProduct(orders[0].items[0].product_id)}
                  className="mt-2 text-sm bg-amber-400 hover:bg-amber-300 text-amber-900 px-4 py-1 rounded-full font-medium flex items-center"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" clipRule="evenodd" />
                  </svg>
                  Reorder
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Applied Voucher Banner */}
        {appliedVoucher && (
          <div className="mb-6 bg-green-50 border border-green-200 rounded-xl p-4 flex justify-between items-center">
            <div className="flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-600 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 14l6-6m-5.5.5h.01m4.99 5h.01M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16l3.5-2 3.5 2 3.5-2 3.5 2zM10 8.5a.5.5 0 11-1 0 .5.5 0 011 0zm5 5a.5.5 0 11-1 0 .5.5 0 011 0z" />
              </svg>
              <div>
                <p className="font-medium text-green-800">Voucher applied: {appliedVoucher.code}</p>
                <p className="text-sm text-green-600">{appliedVoucher.discount}% discount on orders over {formatCurrency(appliedVoucher.min_order || 0)}</p>
              </div>
            </div>
            <button
              onClick={removeVoucher}
              className="text-sm text-green-600 hover:text-green-800 font-medium"
            >
              Remove
            </button>
          </div>
        )}

        {/* Quick Stats */}
<div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
  {/* Active Vouchers */}
  <div className="bg-white p-4 rounded-xl shadow-sm border border-amber-100 hover:shadow-md transition-shadow">
    <p className="text-amber-600 text-xs uppercase font-semibold tracking-wider">Active Vouchers</p>
    <p className="text-2xl font-bold text-amber-800 mt-1">3</p>
    <div className="w-full bg-amber-100 h-1 mt-2 rounded-full">
      <div className="bg-amber-500 h-1 rounded-full" style={{width: "60%"}}></div>
    </div>
  </div>

  {/* Monthly Orders */}
  <div className="bg-white p-4 rounded-xl shadow-sm border border-amber-100 hover:shadow-md transition-shadow">
    <p className="text-amber-600 text-xs uppercase font-semibold tracking-wider">Monthly Orders</p>
    <p className="text-2xl font-bold text-amber-800 mt-1">20</p>
    <div className="w-full bg-amber-100 h-1 mt-2 rounded-full">
      <div className="bg-amber-500 h-1 rounded-full" style={{width: "100%"}}></div>
    </div>
  </div>

  {/* Favorite Category */}
  <div className="bg-white p-4 rounded-xl shadow-sm border border-amber-100 hover:shadow-md transition-shadow">
    <p className="text-amber-600 text-xs uppercase font-semibold tracking-wider">Favorite Category</p>
    <p className="text-2xl font-bold text-amber-800 mt-1">Coffee</p>
    <div className="w-full bg-amber-100 h-1 mt-2 rounded-full">
      <div className="bg-amber-500 h-1 rounded-full" style={{width: "75%"}}></div>
    </div>
  </div>

  {/* Loyalty Points - sekarang konsisten dengan yang lain */}
  <div className="bg-white p-4 rounded-xl shadow-sm border border-amber-100 hover:shadow-md transition-shadow">
    <p className="text-amber-600 text-xs uppercase font-semibold tracking-wider">Loyalty Points</p>
    <p className="text-2xl font-bold text-amber-800 mt-1">1250</p>
    <div className="w-full bg-amber-100 h-1 mt-2 rounded-full">
      <div className="bg-amber-500 h-1 rounded-full" style={{width: "42%"}}></div>
    </div>
    <p className="text-xs text-amber-600 mt-1 text-center">1250/3000 points</p>
  </div>
</div>

        {/* Vouchers Section */}
        {vouchers.length > 0 && (
          <div className="bg-white rounded-xl shadow-sm p-6 mb-8 border border-amber-50">
            <h2 className="text-xl font-bold text-amber-900 mb-4">Your Available Vouchers</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {vouchers.slice(0, 3).map(voucher => (
                <div key={voucher.code} className="border border-green-200 rounded-lg p-4 bg-gradient-to-r from-green-50 to-white">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-bold text-green-700">{voucher.code}</h4>
                      <p className="text-sm text-gray-600">{voucher.discount}% discount</p>
                      <p className="text-xs text-gray-500 mt-2">
                        Valid until {new Date(voucher.valid_until).toLocaleDateString('id-ID')}
                      </p>
                      {voucher.min_order > 0 && (
                        <p className="text-xs text-gray-500">
                          Min. order {formatCurrency(voucher.min_order)}
                        </p>
                      )}
                    </div>
                    <button
                      onClick={() => applyVoucher(voucher)}
                      className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded-md text-sm font-medium"
                    >
                      {appliedVoucher?.code === voucher.code ? "Applied" : "Use"}
                    </button>
                  </div>
                </div>
              ))}
            </div>
            {vouchers.length > 3 && (
              <button className="mt-4 text-sm text-amber-600 hover:text-amber-800 font-medium">
                View all {vouchers.length} vouchers →
              </button>
            )}
          </div>
        )}

        {/* Menu Navigation */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-8 border border-amber-50">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div className="mb-4 md:mb-0">
              <h2 className="text-xl font-bold text-amber-900">Our Menu</h2>
              <p className="text-amber-600 text-sm">Discover your next favorite drink</p>
            </div>

            <div className="flex flex-col md:flex-row space-y-2 md:space-y-0 md:space-x-2">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-amber-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                  </svg>
                </div>
                <input
                  type="text"
                  placeholder="Search menu..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full md:w-64 pl-10 pr-4 py-2 border border-amber-200 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 bg-amber-50 text-amber-900 placeholder-amber-400"
                />
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm("")}
                    className="absolute right-3 top-2.5 text-amber-400 hover:text-amber-600"
                  >
                    ✕
                  </button>
                )}
              </div>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-4 py-2 border border-amber-200 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 bg-amber-50 text-amber-900"
              >
                {categories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Menu Tabs */}
          <div className="mt-6 border-b border-amber-100">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab("recommended")}
                className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center ${activeTab === "recommended" ? "border-amber-600 text-amber-700" : "border-transparent text-amber-500 hover:text-amber-700 hover:border-amber-300"}`}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 mr-2 ${activeTab === "recommended" ? "text-amber-500" : "text-amber-400"}`} viewBox="0 0 20 20" fill="currentColor">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
                Recommended For You
              </button>
              <button
                onClick={() => setActiveTab("discount")}
                className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center ${activeTab === "discount" ? "border-amber-600 text-amber-700" : "border-transparent text-amber-500 hover:text-amber-700 hover:border-amber-300"}`}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 mr-2 ${activeTab === "discount" ? "text-amber-500" : "text-amber-400"}`} viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M5 2a2 2 0 00-2 2v14l3.5-2 3.5 2 3.5-2 3.5 2V4a2 2 0 00-2-2H5zm4.707 3.707a1 1 0 00-1.414-1.414l-3 3a1 1 0 000 1.414l3 3a1 1 0 001.414-1.414L8.414 9H10a3 3 0 013 3v1a1 1 0 102 0v-1a5 5 0 00-5-5H8.414l1.293-1.293z" clipRule="evenodd" />
                </svg>
                Discounts & Promos
              </button>
              <button
                onClick={() => setActiveTab("all")}
                className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center ${activeTab === "all" ? "border-amber-600 text-amber-700" : "border-transparent text-amber-500 hover:text-amber-700 hover:border-amber-300"}`}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 mr-2 ${activeTab === "all" ? "text-amber-500" : "text-amber-400"}`} viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M3 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 15a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
                </svg>
                Full Menu
              </button>
            </nav>
          </div>
        </div>

        {/* Menu Items Grid */}
        {displayItems.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {displayItems.map(product => {
              // Hitung rating acak antara 4.0-5.0 jika tidak ada rating
              const productRating = product.rating || (Math.random() * 1 + 4).toFixed(1);
              // Cek apakah produk memenuhi syarat voucher
              const hasDiscount = appliedVoucher && product.price >= (appliedVoucher.min_order || 0);
              const discountedPrice = hasDiscount
                ? product.price * (1 - appliedVoucher.discount / 100)
                : product.price;

              return (
                <div
                  key={product.id}
                  onClick={() => navigateToProduct(product.id)}
                  className="bg-white rounded-xl shadow-sm overflow-hidden transition-all hover:shadow-lg cursor-pointer group border border-amber-100"
                >
                  <div className="relative">
                    <img
                      src={product.image || "https://via.placeholder.com/300x200?text=No+Image"}
                      alt={product.name}
                      className="w-full h-48 object-cover group-hover:opacity-90 transition-opacity"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = "https://via.placeholder.com/300x200?text=No+Image";
                      }}
                    />

                    {/* Tampilkan badge diskon jika ada voucher yang diterapkan */}
                    {hasDiscount && (
                      <div className="absolute top-2 left-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full shadow-md">
                        {appliedVoucher.discount}% OFF
                      </div>
                    )}

                    {/* Tampilkan badge favorit jika pernah dipesan */}
                    {orders.some(o => o.items?.some(i => i.product_id === product.id)) && (
                      <div className="absolute top-2 right-2 bg-amber-100 text-amber-700 p-2 rounded-full shadow-md">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      </div>
                    )}
                  </div>

                  <div className="p-4">
                    <div className="flex justify-between items-start mb-1">
                      <h3 className="font-bold text-lg text-amber-900 group-hover:text-amber-700 transition-colors">
                        {product.name}
                      </h3>
                      <span className="bg-amber-100 text-amber-800 text-xs px-2 py-1 rounded-full">
                        {product.category}
                      </span>
                    </div>

                    {/* Rating Display */}
                    <div className="flex items-center mb-2">
                      <div className="flex text-amber-400">
                        {[...Array(5)].map((_, i) => (
                          <svg
                            key={i}
                            className={`w-4 h-4 ${i < Math.floor(productRating) ? "fill-current" : "stroke-current fill-none"}`}
                            viewBox="0 0 24 24"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={i < Math.floor(productRating) ? 0 : 1}
                              d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
                            />
                          </svg>
                        ))}
                      </div>
                      <span className="text-xs text-amber-600 ml-1">{productRating}</span>
                    </div>

                    <p className="text-amber-700 text-sm mb-3 line-clamp-2">{product.description}</p>

                    <div className="flex justify-between items-center">
                      <div>
                        {hasDiscount ? (
                          <>
                            <span className="font-bold text-amber-800">
                              {formatCurrency(discountedPrice)}
                            </span>
                            <span className="text-xs text-amber-400 line-through ml-2">
                              {formatCurrency(product.price)}
                            </span>
                          </>
                        ) : (
                          <span className="font-bold text-amber-800">
                            {formatCurrency(product.price)}
                          </span>
                        )}
                      </div>
                      <span className={`text-xs ${product.stock < 5 ? "text-red-500 font-bold" : "text-amber-500"}`}>
                        {product.stock < 5 ? `Only ${product.stock} left` : "In stock"}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm p-8 text-center border border-amber-100">
            <img
              src="https://cdn-icons-png.flaticon.com/512/4076/4076478.png"
              alt="No items found"
              className="w-32 mx-auto mb-4 opacity-60"
            />
            <h3 className="text-lg font-medium text-amber-800 mb-1">No menu items found</h3>
            <p className="text-amber-600 mb-4">Try adjusting your search or filter criteria</p>
            <button
              onClick={() => {
                setSearchTerm("");
                setSelectedCategory("All");
                setActiveTab("all");
              }}
              className="px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 flex items-center mx-auto"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M9 14l6-6m-5.5.5h.01m4.99 5h.01M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16l3.5-2 3.5 2 3.5-2 3.5 2zM10 8.5a.5.5 0 11-1 0 .5.5 0 011 0zm5 5a.5.5 0 11-1 0 .5.5 0 011 0z" clipRule="evenodd" />
              </svg>
              Show Full Menu
            </button>
          </div>
        )}

        {/* Personalized Recommendation Banner */}
        {activeTab === "recommended" && recommendedItems.length > 0 && (
          <div className="mt-8 bg-gradient-to-r from-amber-50 to-amber-100 border border-amber-200 rounded-xl p-6">
            <div className="flex flex-col md:flex-row items-center">
              <div className="md:mr-6 mb-4 md:mb-0">
                <img
                  src="https://cdn-icons-png.flaticon.com/512/2965/2965879.png"
                  alt="Personalized recommendation"
                  className="w-20 h-20"
                />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-amber-800 mb-1">Personalized Just For You</h3>
                <p className="text-amber-700 mb-3">
                  Based on your order history, we've selected these special items just for you.
                </p>
                <button
                  onClick={() => setActiveTab("recommended")}
                  className="text-sm bg-amber-600 hover:bg-amber-700 text-white px-4 py-2 rounded-lg flex items-center"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                  See More Recommendations
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="max-w-7xl mx-auto mt-12 pt-6 border-t border-amber-200">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="mb-4 md:mb-0">
            <img
              src={Logo}
              alt="Fore Coffee Logo"
              className="h-8 opacity-80"
            />
          </div>
          <div className="flex space-x-4">
            <a href="#" className="text-amber-600 hover:text-amber-800 text-sm">Terms</a>
            <a href="#" className="text-amber-600 hover:text-amber-800 text-sm">Privacy</a>
            <a href="#" className="text-amber-600 hover:text-amber-800 text-sm">Help Center</a>
          </div>
        </div>
        <p className="text-center text-amber-500 text-xs mt-4">
          © {new Date().getFullYear()} Fore Coffee. All rights reserved.
        </p>
      </div>
    </div>
  );
}