import React, { useState } from 'react';
import { FiShoppingBag, FiPlus, FiTrash2, FiEdit, FiSearch, FiChevronDown, FiChevronUp, FiX } from 'react-icons/fi';

const initialSales = [
  {
    id: 'INV-001',
    customer: 'Budi Santoso',
    date: '2023-06-10',
    items: [
      { name: 'Latte', quantity: 2, price: 35000 },
      { name: 'Croissant', quantity: 1, price: 15000 }
    ],
    status: 'Completed',
    payment: 'Cash'
  },
  {
    id: 'INV-002',
    customer: 'Siti Aminah',
    date: '2023-06-12',
    items: [
      { name: 'Cappuccino', quantity: 1, price: 30000 },
      { name: 'Donut', quantity: 2, price: 15000 }
    ],
    status: 'Processing',
    payment: 'QRIS'
  },
  {
    id: 'INV-003',
    customer: 'Andi Wijaya',
    date: '2023-06-15',
    items: [
      { name: 'Americano', quantity: 1, price: 25000 },
      { name: 'Sandwich', quantity: 1, price: 35000 }
    ],
    status: 'Completed',
    payment: 'Credit Card'
  }
];

const SalesManagement = () => {
  const [sales, setSales] = useState(initialSales);
  const [showForm, setShowForm] = useState(false);
  const [expandedSale, setExpandedSale] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState({
    customer: '',
    items: [{ name: '', quantity: 1, price: 0 }],
    status: 'Processing',
    payment: 'Cash'
  });

  // Helper functions
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('id-ID', options);
  };

  const calculateTotal = (items) => {
    return items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  };

  // Status change handler
  const handleStatusChange = (saleId, newStatus) => {
    setSales(sales.map(sale => 
      sale.id === saleId ? { ...sale, status: newStatus } : sale
    ));
  };

  // Form handlers
  const handleAddSale = () => {
    if (!formData.customer || formData.items.some(item => !item.name || item.price <= 0)) {
      alert('Please fill all required fields!');
      return;
    }

    const newSale = {
      id: `INV-${String(sales.length + 1).padStart(3, '0')}`,
      customer: formData.customer,
      date: new Date().toISOString().split('T')[0],
      items: formData.items,
      status: formData.status,
      payment: formData.payment
    };

    setSales([...sales, newSale]);
    setFormData({
      customer: '',
      items: [{ name: '', quantity: 1, price: 0 }],
      status: 'Processing',
      payment: 'Cash'
    });
    setShowForm(false);
  };

  const handleItemChange = (index, e) => {
    const { name, value } = e.target;
    const newItems = [...formData.items];
    newItems[index] = {
      ...newItems[index],
      [name]: name === 'quantity' || name === 'price' ? parseInt(value) || 0 : value
    };
    setFormData({
      ...formData,
      items: newItems
    });
  };

  const addItemRow = () => {
    setFormData({
      ...formData,
      items: [...formData.items, { name: '', quantity: 1, price: 0 }]
    });
  };

  const removeItemRow = (index) => {
    const newItems = formData.items.filter((_, i) => i !== index);
    setFormData({
      ...formData,
      items: newItems
    });
  };

  // Filter sales
  const filteredSales = sales.filter(sale =>
    sale.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    sale.customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
    sale.items.some(item => item.name.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // Style helpers
  const getStatusColor = (status) => {
    switch (status) {
      case 'Completed': return 'bg-green-100 text-green-800';
      case 'Processing': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPaymentColor = (payment) => {
    switch (payment) {
      case 'Cash': return 'bg-blue-100 text-blue-800';
      case 'Credit Card': return 'bg-purple-100 text-purple-800';
      case 'QRIS': return 'bg-amber-100 text-amber-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="print:hiddden flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <div className='print:hidden '>
            <h1 className="text-3xl font-bold text-gray-800">Sales Management</h1>
            <p className="text-gray-600">Manage all coffee shop transactions and orders</p>
          </div>
          <button
            onClick={() => setShowForm(true)}
            className="print:hidden mt-4 md:mt-0 flex items-center px-4 py-2 bg-green-800 text-white rounded-lg hover:bg-amber-700 transition duration-200 shadow-sm"
          >
            <FiPlus className=" mr-2" />
            New Transaction
          </button>
        </div>

        {/* Search and Filter */}
        <div className="print:hidden bg-white rounded-xl shadow-sm p-4 mb-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between space-y-4 md:space-y-0">
            <div className="relative w-full md:w-64">
              <input
                type="text"
                placeholder="Search transactions..."
                className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <div className="absolute left-3 top-2.5 text-gray-400">
                <FiSearch />
              </div>
            </div>
            <div className="flex space-x-2">
              <select className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500">
                <option>All Status</option>
                <option>Completed</option>
                <option>Processing</option>
              </select>
              <select className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500">
                <option>All Payment</option>
                <option>Cash</option>
                <option>Credit Card</option>
                <option>QRIS</option>
              </select>
            </div>
          </div>
        </div>

        {/* Sales Table */}
        <div className="bg-white rounded-xl shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Invoice</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Payment</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredSales.map((sale) => (
                <React.Fragment key={sale.id}>
                  <tr className="hover:bg-gray-50 cursor-pointer" onClick={() => setExpandedSale(expandedSale === sale.id ? null : sale.id)}>
                    <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">{sale.id}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{sale.customer}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{formatDate(sale.date)}</td>
                    <td className="px-6 py-4 whitespace-nowrap font-medium">{formatCurrency(calculateTotal(sale.items))}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getPaymentColor(sale.payment)}`}>
                        {sale.payment}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <select
                        value={sale.status}
                        onChange={(e) => handleStatusChange(sale.id, e.target.value)}
                        className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(sale.status)} focus:outline-none focus:ring-1 focus:ring-amber-500`}
                      >
                        <option value="Processing">Processing</option>
                        <option value="Completed">Completed</option>
                      </select>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <button className="text-gray-500 hover:text-gray-700">
                        {expandedSale === sale.id ? <FiChevronUp /> : <FiChevronDown />}
                      </button>
                    </td>
                  </tr>
                  {expandedSale === sale.id && (
                    <tr>
                      <td colSpan="7" className="px-6 py-4 bg-gray-50">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                          <div className="print:hidden col-span-2">
                            <h3 className="font-medium text-gray-700 mb-2">Items</h3>
                            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                              <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                  <tr>
                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Item</th>
                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Qty</th>
                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Subtotal</th>
                                  </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                  {sale.items.map((item, index) => (
                                    <tr key={index}>
                                      <td className="px-4 py-2 whitespace-nowrap">{item.name}</td>
                                      <td className="px-4 py-2 whitespace-nowrap">{item.quantity}</td>
                                      <td className="px-4 py-2 whitespace-nowrap">{formatCurrency(item.price)}</td>
                                      <td className="px-4 py-2 whitespace-nowrap font-medium">{formatCurrency(item.price * item.quantity)}</td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          </div>
                          <div>
                            <h3 className="font-medium text-gray-700 mb-2">Order Summary</h3>
                            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                              <div className="space-y-3">
                                <div className="flex justify-between">
                                  <span className="text-gray-600">Subtotal</span>
                                  <span className="font-medium">{formatCurrency(calculateTotal(sale.items))}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-gray-600">Tax (10%)</span>
                                  <span className="font-medium">{formatCurrency(calculateTotal(sale.items) * 0.1)}</span>
                                </div>
                                <div className="border-t border-gray-200 my-2"></div>
                                <div className="flex justify-between">
                                  <span className="text-gray-800 font-medium">Total</span>
                                  <span className="text-gray-800 font-bold">{formatCurrency(calculateTotal(sale.items) * 1.1)}</span>
                                </div>
                                <div className="print:hidden pt-4">
                                  <button onClick={() => window.print()} className="px-3 py-1 bg-amber-600 text-white rounded-lg text-sm hover:bg-amber-700 mr-2">
                                    Print Receipt
                                  </button>
                                  <button className="px-3 py-1 border border-gray-300 rounded-lg text-sm hover:bg-gray-50">
                                    Edit Order
                                  </button>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
              {filteredSales.length === 0 && (
                <tr>
                  <td colSpan="7" className="px-6 py-4 text-center text-gray-500">
                    No transactions found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Add Sale Modal */}
        {showForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl shadow-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-semibold text-gray-800">New Coffee Order</h2>
                  <button onClick={() => setShowForm(false)} className="text-gray-500 hover:text-gray-700">
                    <FiX size={20} />
                  </button>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Customer</label>
                    <input
                      type="text"
                      name="customer"
                      value={formData.customer}
                      onChange={(e) => setFormData({...formData, customer: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                      placeholder="Customer name"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Items</label>
                    {formData.items.map((item, index) => (
                      <div key={index} className="grid grid-cols-12 gap-3 mb-3">
                        <div className="col-span-5">
                          <input
                            type="text"
                            name="name"
                            value={item.name}
                            onChange={(e) => handleItemChange(index, e)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                            placeholder="Item name"
                          />
                        </div>
                        <div className="col-span-2">
                          <input
                            type="number"
                            name="quantity"
                            value={item.quantity}
                            onChange={(e) => handleItemChange(index, e)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                            min="1"
                          />
                        </div>
                        <div className="col-span-4">
                          <input
                            type="number"
                            name="price"
                            value={item.price}
                            onChange={(e) => handleItemChange(index, e)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                            placeholder="Price"
                          />
                        </div>
                        <div className="col-span-1 flex items-center">
                          {formData.items.length > 1 && (
                            <button
                              onClick={() => removeItemRow(index)}
                              className="text-red-500 hover:text-red-700"
                            >
                              <FiX size={18} />
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                    <button
                      onClick={addItemRow}
                      className="mt-2 flex items-center text-sm px-3 py-1 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition duration-200"
                    >
                      <FiPlus size={14} className="mr-1" />
                      Add Item
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Payment Method</label>
                      <select
                        name="payment"
                        value={formData.payment}
                        onChange={(e) => setFormData({...formData, payment: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                      >
                        <option value="Cash">Cash</option>
                        <option value="Credit Card">Credit Card</option>
                        <option value="QRIS">QRIS</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                      <select
                        name="status"
                        value={formData.status}
                        onChange={(e) => setFormData({...formData, status: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                      >
                        <option value="Processing">Processing</option>
                        <option value="Completed">Completed</option>
                      </select>
                    </div>
                  </div>

                  {formData.items.some(i => i.name && i.price > 0) && (
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-gray-500">Order Total</p>
                          <p className="font-medium">
                            {formatCurrency(calculateTotal(formData.items))}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Tax (10%)</p>
                          <p className="font-medium">
                            {formatCurrency(calculateTotal(formData.items) * 0.1)}
                          </p>
                        </div>
                        <div className="col-span-2 border-t border-gray-200 pt-2">
                          <p className="text-sm text-gray-500">Grand Total</p>
                          <p className="font-bold text-lg">
                            {formatCurrency(calculateTotal(formData.items) * 1.1)}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <div className="mt-6 flex justify-end space-x-3">
                  <button
                    onClick={() => setShowForm(false)}
                    className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition duration-200"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleAddSale}
                    className="px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition duration-200"
                  >
                    Save Order
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SalesManagement;