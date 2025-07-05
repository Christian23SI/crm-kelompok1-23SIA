import React, { useState } from 'react';
import {
  FiUser, FiMail, FiPhone, FiStar, FiShoppingBag,
  FiPlus, FiTrash2, FiEdit, FiChevronDown, FiChevronUp, FiX
} from 'react-icons/fi';

const CustomerManagement = () => {
  const initialCustomers = [
    {
      id: 1,
      name: 'Abellia ',
      email: 'abel@gmail.com',
      phone: '081234567890',
      tier: 'Gold',
      points: 1250,
      joinDate: '2023-05-15',
      purchases: [
        { id: 'INV-001', date: '2023-06-10', items: '2x Latte, 1x Croissant', total: 85000, status: 'Completed', pointsEarned: 85 },
        { id: 'INV-002', date: '2023-06-15', items: '1x Espresso', total: 25000, status: 'Completed', pointsEarned: 25 },
        { id: 'INV-005', date: '2023-07-01', items: '3x Cappuccino', total: 90000, status: 'Completed', pointsEarned: 90 }
      ]
    },
    {
      id: 2,
      name: 'Siti Aminah',
      email: 'siti@gmail.com',
      phone: '089876543210',
      tier: 'Platinum',
      points: 3200,
      joinDate: '2022-11-20',
      purchases: [
        { id: 'INV-003', date: '2023-06-12', items: '1x Latte, 2x Donut', total: 65000, status: 'Completed', pointsEarned: 65 },
        { id: 'INV-004', date: '2023-06-18', items: '1x Flat White, 1x Sandwich', total: 75000, status: 'Completed', pointsEarned: 75 }
      ]
    },
    {
      id: 3,
      name: 'Andi Wijaya',
      email: 'andi@gmail.com',
      phone: '081299988877',
      tier: 'Silver',
      points: 450,
      joinDate: '2023-08-05',
      purchases: [
        { id: 'INV-006', date: '2023-08-10', items: '1x Americano', total: 30000, status: 'Completed', pointsEarned: 30 }
      ]
    }
  ];

  const [customers, setCustomers] = useState(initialCustomers);
  const [showForm, setShowForm] = useState(false);
  const [expandedCustomer, setExpandedCustomer] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    tier: 'Silver'
  });
  const [searchTerm, setSearchTerm] = useState('');

  const formatCurrency = (amount) =>
    new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(amount);

  const formatDate = (dateString) =>
    new Date(dateString).toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleAddCustomer = () => {
    if (!formData.name || !formData.email || !formData.phone) {
      alert('Please fill all required fields!');
      return;
    }

    const newCustomer = {
      id: customers.length + 1,
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
      tier: formData.tier,
      points: 0,
      joinDate: new Date().toISOString().split('T')[0],
      purchases: []
    };

    setCustomers([...customers, newCustomer]);
    setFormData({ name: '', email: '', phone: '', tier: 'Silver' });
    setShowForm(false);
  };

  const handleDeleteCustomer = (id) => {
    if (window.confirm('Are you sure you want to delete this customer?')) {
      setCustomers(customers.filter(customer => customer.id !== id));
    }
  };

  const toggleCustomerDetails = (id) => {
    setExpandedCustomer(expandedCustomer === id ? null : id);
  };

  const filteredCustomers = customers.filter(customer =>
    customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.phone.includes(searchTerm)
  );

  const getTierColor = (tier) => {
    switch (tier) {
      case 'Platinum':
        return 'bg-blue-100 text-blue-800';
      case 'Gold':
        return 'bg-yellow-100 text-yellow-800';
      case 'Silver':
        return 'bg-gray-200 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Customer Management</h1>
            <p className="text-gray-600">Manage your Fore Coffee customers and their loyalty points</p>
          </div>
          <button
            onClick={() => setShowForm(true)}
            className="mt-4 md:mt-0 flex items-center px-4 py-2 bg-green-800 text-white rounded-lg hover:bg-amber-700 transition duration-200 shadow-sm"
          >
            <FiPlus className="mr-2" />
            Add Customer
          </button>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-xl shadow-sm p-4 mb-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
            <div className="relative w-full md:w-64">
              <input
                type="text"
                placeholder="Search customers..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <div className="absolute left-3 top-2.5 text-gray-400">
                <FiUser />
              </div>
            </div>
            <div className="flex space-x-2">
              <select className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500">
                <option>All Tiers</option>
                <option>Platinum</option>
                <option>Gold</option>
                <option>Silver</option>
              </select>
              <select className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500">
                <option>Sort by: Newest</option>
                <option>Sort by: Oldest</option>
                <option>Sort by: Most Points</option>
                <option>Sort by: Name</option>
              </select>
            </div>
          </div>
        </div>

        {/* Add Customer Modal */}
        {showForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl shadow-lg w-full max-w-md">
              <div className="p-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-semibold text-gray-800">Add New Customer</h2>
                  <button onClick={() => setShowForm(false)} className="text-gray-500 hover:text-gray-700">
                    <FiX size={20} />
                  </button>
                </div>
                <div className="space-y-4">
                  {['name', 'email', 'phone'].map((field) => (
                    <div key={field}>
                      <label className="block text-sm font-medium text-gray-700 mb-1 capitalize">{field}</label>
                      <input
                        type={field === 'email' ? 'email' : field === 'phone' ? 'tel' : 'text'}
                        name={field}
                        value={formData[field]}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                        placeholder={`Enter ${field}`}
                      />
                    </div>
                  ))}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Tier Level</label>
                    <select
                      name="tier"
                      value={formData.tier}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                    >
                      <option value="Silver">Silver</option>
                      <option value="Gold">Gold</option>
                      <option value="Platinum">Platinum</option>
                    </select>
                  </div>
                </div>
                <div className="mt-6 flex justify-end space-x-3">
                  <button
                    onClick={() => setShowForm(false)}
                    className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition duration-200"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleAddCustomer}
                    className="px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition duration-200"
                  >
                    Save Customer
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Customers Table */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
 <div className="grid grid-cols-12 bg-[#064E3B] p-4 border-b border-gray-200 text-sm uppercase tracking-wider font-bold text-white">

    <div className="col-span-4 md:col-span-3">Customer</div>
    <div className="col-span-4 md:col-span-3">Contact</div>
    <div className="hidden md:block md:col-span-2">Joined</div>
    <div className="col-span-4 md:col-span-2 text-center">Points</div>
    <div className="col-span-4 md:col-span-2 text-right">Actions</div>
  </div>

          {filteredCustomers.length === 0 ? (
    <div className="p-8 text-center text-gray-500">
      No customers found. Try adjusting your search or add a new customer.
    </div>
          ) : (
            filteredCustomers.map((customer) => (
      <div key={customer.id} className="border-b border-gray-200 last:border-b-0">
                <div className="grid grid-cols-12 p-4 hover:bg-gray-50 cursor-pointer">
                  <div className="col-span-4 md:col-span-3 flex items-center" onClick={() => toggleCustomerDetails(customer.id)}>
                    <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center text-amber-600 mr-3">
                      <FiUser size={18} />
                    </div>
                    <div>
                      <div className="font-medium text-gray-800">{customer.name}</div>
                      <div className={`text-xs px-2 py-0.5 rounded-full ${getTierColor(customer.tier)} inline-block`}>
                        {customer.tier}
                      </div>
                    </div>
                  </div>
                  <div className="col-span-4 md:col-span-3 flex flex-col justify-center">
                    <div className="flex items-center text-sm text-gray-600 mb-1">
                      <FiMail className="mr-2 text-gray-400" />
                      {customer.email}
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <FiPhone className="mr-2 text-gray-400" />
                      {customer.phone}
                    </div>
                  </div>
                  <div className="hidden md:flex md:col-span-2 items-center text-sm text-gray-500">
                    {formatDate(customer.joinDate)}
                  </div>
                  <div className="col-span-4 md:col-span-2 flex items-center justify-center">
                    <div className="flex items-center">
                      <FiStar className="text-amber-500 mr-1" />
                      <span className="font-medium">{customer.points}</span>
                    </div>
                  </div>
                  <div className="col-span-4 md:col-span-2 flex items-center justify-end space-x-2">
                    <button
                      onClick={() => alert('Edit feature coming soon!')}
                      className="p-2 text-gray-500 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition duration-200"
                    >
                      <FiEdit size={18} />
                    </button>
                    <button
                      onClick={() => handleDeleteCustomer(customer.id)}
                      className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition duration-200"
                    >
                      <FiTrash2 size={18} />
                    </button>
                    <button
                      onClick={() => toggleCustomerDetails(customer.id)}
                      className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition duration-200"
                    >
                      {expandedCustomer === customer.id ? <FiChevronUp size={18} /> : <FiChevronDown size={18} />}
                    </button>
                  </div>
                </div>

                {expandedCustomer === customer.id && (
                  <div className="bg-gray-50 p-4 border-t border-gray-200">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-medium text-gray-700 flex items-center">
                        <FiShoppingBag className="mr-2 text-amber-600" />
                        Purchase History
                      </h3>
                      <button
                        onClick={() => alert('Add purchase feature coming soon!')}
                        className="flex items-center text-sm px-3 py-1 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition duration-200"
                      >
                        <FiPlus size={14} className="mr-1" />
                        Add Purchase
                      </button>
                    </div>
                    {customer.purchases.length === 0 ? (
                      <div className="text-center py-4 text-gray-500 text-sm">No purchase history yet</div>
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                          <thead className="bg-gray-100">
                            <tr>
                              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order</th>
                              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Items</th>
                              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Points</th>
                            </tr>
                          </thead>
                          <tbody className="bg-white divide-y divide-gray-200">
                            {customer.purchases.map((purchase) => (
                              <tr key={purchase.id} className="hover:bg-gray-50">
                                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                                  {formatDate(purchase.date)}
                                </td>
                                <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-800">
                                  {purchase.id}
                                </td>
                                <td className="px-4 py-3 text-sm text-gray-800">
                                  {purchase.items}
                                </td>
                                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-800">
                                  {formatCurrency(purchase.total)}
                                </td>
                                <td className="px-4 py-3 whitespace-nowrap text-sm text-amber-600 font-medium">
                                  +{purchase.pointsEarned}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))
          )}
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
          {[
            {
              label: 'Total Customers',
              value: customers.length,
              icon: <FiUser size={20} />,
              bg: 'bg-amber-50',
              color: 'text-amber-600'
            },
            {
              label: 'Total Points Issued',
              value: customers.reduce((sum, c) => sum + c.points, 0),
              icon: <FiStar size={20} />,
              bg: 'bg-green-50',
              color: 'text-green-600'
            },
            {
              label: 'Avg. Points per Customer',
              value: customers.length > 0
                ? Math.round(customers.reduce((sum, c) => sum + c.points, 0) / customers.length)
                : 0,
              icon: <FiShoppingBag size={20} />,
              bg: 'bg-blue-50',
              color: 'text-blue-600'
            }
          ].map((stat, idx) => (
            <div key={idx} className={`rounded-xl p-4 shadow-sm ${stat.bg}`}>
              <div className="flex items-center space-x-3">
                <div className={`p-2 rounded-full ${stat.color} bg-white shadow`}>
                  {stat.icon}
                </div>
                <div>
                  <div className="text-sm text-gray-500">{stat.label}</div>
                  <div className="text-xl font-semibold text-gray-800">{stat.value}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CustomerManagement;