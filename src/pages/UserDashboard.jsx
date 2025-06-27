import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

// Mock user data
const userData = {
  name: "Sarah Johnson",
  membership: "Gold Member",
  points: 1250,
  favoriteCategory: "Coffee",
  lastOrder: "Iced Bumi Latte",
  avatar: "https://randomuser.me/api/portraits/women/44.jpg"
};

// Extended product data with discounts
const menuItems = [
  {
    id: 1,
    name: "Iced Bumi Latte",
    category: "Coffee",
    stock: 10,
    price: 24000,
    discount: 10, // percentage
    active: true,
    description: "The creamy and subtly sweet sensation of caramel and butterscotch sauce blends with authentic Indonesian coffee",
    image: "https://static.fore.coffee/product/Bumi%20Latte%20w%20Badge.jpg",
    isFavorite: true,
    rating: 4.8
  },
  {
    id: 2,
    name: "Matcha Ice Blended",
    category: "Non-Coffee",
    stock: 7,
    price: 33000,
    discount: 0,
    active: true,
    description: "Fore Coffee's signature Creamy Matcha blend, fresh milk, with ice, just right to cool your day!",
    image: "https://static.fore.coffee/product/matchablended173.jpg",
    isFavorite: false,
    rating: 4.5
  },
  {
    id: 3,
    name: "Pain au Tiramisu",
    category: "Fore-Deli",
    stock: 7,
    price: 36000,
    discount: 15,
    active: true,
    description: "Pastry with tiramisu flavoured almond paste and cocoa crumble topping",
    image: "https://static.fore.coffee/product/Pain%20au%20Tiramisu.png",
    isFavorite: true,
    rating: 4.7
  },
  {
    id: 4,
    name: "Avocado Coffee",
    category: "Coffee",
    stock: 5,
    price: 35000,
    discount: 20,
    active: true,
    description: "Unique combination of avocado and espresso with chocolate drizzle",
    image: "https://static.fore.coffee/product/Avocado%20Coffee.jpg",
    isFavorite: false,
    rating: 4.9
  },
  {
    id: 5,
    name: "Chocolate Hazelnut Croissant",
    category: "Fore-Deli",
    stock: 3,
    price: 28000,
    discount: 0,
    active: true,
    description: "Flaky croissant filled with rich chocolate hazelnut spread",
    image: "https://static.fore.coffee/product/Chocolate%20Croissant.jpg",
    isFavorite: true,
    rating: 4.6
  },
  {
    id: 6,
    name: "Tropical Ice Tea",
    category: "Non-Coffee",
    stock: 12,
    price: 22000,
    discount: 5,
    active: true,
    description: "Refreshing blend of tropical fruits with premium tea leaves",
    image: "https://static.fore.coffee/product/Tropical%20Ice%20Tea.jpg",
    isFavorite: false,
    rating: 4.4
  }
];

function formatCurrency(num) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(num);
}

export default function UserDashboard() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("recommended");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  
  // Get unique categories for filter
  const categories = ["All", ...new Set(menuItems.map(item => item.category))];
  
  // Filter menu items based on search and category
  const filteredItems = menuItems.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "All" || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });
  
  // Get recommended items (based on user preferences)
  const recommendedItems = menuItems.filter(item => 
    item.category === userData.favoriteCategory || item.isFavorite
  );
  
  // Get discounted items
  const discountedItems = menuItems.filter(item => item.discount > 0);
  
  // Get items to display based on active tab
  const getDisplayItems = () => {
    switch(activeTab) {
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
  
  const navigateToMenu = (itemId) => {
    navigate(`/menu/${itemId}`);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Welcome Section */}
        <div className="bg-gradient-to-r from-green-600 to-green-800 rounded-2xl p-6 mb-6 text-white shadow-lg">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between">
            <div className="flex items-center mb-4 md:mb-0">
              <img 
                src={userData.avatar} 
                alt={userData.name}
                className="w-16 h-16 rounded-full border-2 border-white mr-4"
              />
              <div>
                <h1 className="text-2xl font-bold">Welcome back, {userData.name.split(" ")[0]}!</h1>
                <p className="text-green-100">{userData.membership} • {userData.points} points</p>
              </div>
            </div>
            <div className="bg-white/20 p-3 rounded-lg backdrop-blur-sm">
              <p className="text-sm">Last ordered</p>
              <p className="font-semibold">{userData.lastOrder}</p>
              <button className="mt-2 text-xs bg-white text-green-800 px-3 py-1 rounded-full font-medium">
                Reorder
              </button>
            </div>
          </div>
        </div>
        
        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white p-4 rounded-xl shadow-sm">
            <p className="text-gray-500 text-sm">Your Favorites</p>
            <p className="text-2xl font-bold text-green-600">
              {menuItems.filter(item => item.isFavorite).length}
            </p>
          </div>
          <div className="bg-white p-4 rounded-xl shadow-sm">
            <p className="text-gray-500 text-sm">Available Discounts</p>
            <p className="text-2xl font-bold text-green-600">
              {discountedItems.length}
            </p>
          </div>
          <div className="bg-white p-4 rounded-xl shadow-sm">
            <p className="text-gray-500 text-sm">Favorite Category</p>
            <p className="text-2xl font-bold text-green-600">
              {userData.favoriteCategory}
            </p>
          </div>
          <div className="bg-white p-4 rounded-xl shadow-sm">
            <p className="text-gray-500 text-sm">Special Offer</p>
            <p className="text-2xl font-bold text-green-600">
              1 Free Drink
            </p>
          </div>
        </div>
        
        {/* Menu Navigation */}
        <div className="bg-white rounded-xl shadow-sm p-4 mb-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div className="mb-4 md:mb-0">
              <h2 className="text-xl font-semibold text-gray-800">Our Menu</h2>
              <p className="text-gray-500 text-sm">Discover your next favorite drink</p>
            </div>
            
            <div className="flex flex-col md:flex-row space-y-2 md:space-y-0 md:space-x-2">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search menu..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full md:w-64 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                />
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm("")}
                    className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
                  >
                    ✕
                  </button>
                )}
              </div>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
              >
                {categories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>
          </div>
          
          {/* Menu Tabs */}
          <div className="mt-4 border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab("recommended")}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${activeTab === "recommended" ? "border-green-500 text-green-600" : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"}`}
              >
                Recommended For You
              </button>
              <button
                onClick={() => setActiveTab("discount")}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${activeTab === "discount" ? "border-green-500 text-green-600" : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"}`}
              >
                Discounts & Promos
              </button>
              <button
                onClick={() => setActiveTab("all")}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${activeTab === "all" ? "border-green-500 text-green-600" : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"}`}
              >
                Full Menu
              </button>
            </nav>
          </div>
        </div>
        
        {/* Menu Items Grid */}
        {displayItems.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {displayItems.map(item => (
              <div
                key={item.id}
                onClick={() => navigateToMenu(item.id)}
                className="bg-white rounded-xl shadow-sm overflow-hidden transition-all hover:shadow-md cursor-pointer group"
              >
                <div className="relative">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-full h-48 object-cover group-hover:opacity-90 transition-opacity"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = "https://via.placeholder.com/300x200?text=No+Image";
                    }}
                  />
                  {item.discount > 0 && (
                    <div className="absolute top-2 left-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded">
                      {item.discount}% OFF
                    </div>
                  )}
                  {item.isFavorite && (
                    <div className="absolute top-2 right-2 bg-yellow-500 text-white p-1 rounded-full">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    </div>
                  )}
                </div>
                
                <div className="p-4">
                  <div className="flex justify-between items-start mb-1">
                    <h3 className="font-semibold text-lg text-gray-800 group-hover:text-green-600 transition-colors">
                      {item.name}
                    </h3>
                    <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded">
                      {item.category}
                    </span>
                  </div>
                  
                  <div className="flex items-center mb-2">
                    <div className="flex text-yellow-400">
                      {[...Array(5)].map((_, i) => (
                        <svg
                          key={i}
                          className={`w-4 h-4 ${i < Math.floor(item.rating) ? "fill-current" : "stroke-current fill-none"}`}
                          viewBox="0 0 24 24"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={i < Math.floor(item.rating) ? 0 : 1}
                            d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
                          />
                        </svg>
                      ))}
                    </div>
                    <span className="text-xs text-gray-500 ml-1">{item.rating}</span>
                  </div>
                  
                  <p className="text-gray-600 text-sm mb-3 line-clamp-2">{item.description}</p>
                  
                  <div className="flex justify-between items-center">
                    <div>
                      {item.discount > 0 ? (
                        <>
                          <span className="font-bold text-green-600">
                            {formatCurrency(item.price * (1 - item.discount/100))}
                          </span>
                          <span className="text-xs text-gray-400 line-through ml-2">
                            {formatCurrency(item.price)}
                          </span>
                        </>
                      ) : (
                        <span className="font-bold text-green-600">
                          {formatCurrency(item.price)}
                        </span>
                      )}
                    </div>
                    <span className={`text-xs ${item.stock < 5 ? "text-red-500" : "text-gray-500"}`}>
                      {item.stock < 5 ? `Only ${item.stock} left` : "In stock"}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm p-8 text-center">
            <img
              src="https://cdn-icons-png.flaticon.com/512/4076/4076478.png"
              alt="No items found"
              className="w-32 mx-auto mb-4 opacity-60"
            />
            <h3 className="text-lg font-medium text-gray-700 mb-1">No menu items found</h3>
            <p className="text-gray-500 mb-4">Try adjusting your search or filter criteria</p>
            <button
              onClick={() => {
                setSearchTerm("");
                setSelectedCategory("All");
                setActiveTab("all");
              }}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
            >
              Show Full Menu
            </button>
          </div>
        )}
        
        {/* Personalized Recommendation Banner */}
        {activeTab === "recommended" && recommendedItems.length > 0 && (
          <div className="mt-8 bg-gradient-to-r from-green-50 to-green-100 border border-green-200 rounded-xl p-6">
            <div className="flex flex-col md:flex-row items-center">
              <div className="md:mr-6 mb-4 md:mb-0">
                <img 
                  src="https://cdn-icons-png.flaticon.com/512/2965/2965879.png" 
                  alt="Personalized recommendation"
                  className="w-20 h-20"
                />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-green-800 mb-1">Personalized Just For You</h3>
                <p className="text-green-700 mb-3">
                  Based on your love for {userData.favoriteCategory} and your order history, 
                  we've selected these special items just for you.
                </p>
                <button className="text-sm bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg">
                  See More Recommendations
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}