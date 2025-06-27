import React, { useState, useEffect } from 'react';
import { 
  ShoppingBag, Plus, Trash2, Edit, Search, ChevronDown, ChevronUp, X,
  Printer, CreditCard, Wallet, QrCode, CheckCircle, Clock, ArrowLeft
} from 'lucide-react';
import { supabase } from '../supabase';

const SalesManagement = () => {
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [expandedSale, setExpandedSale] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState({
    table_number: '',
    nama_pemesan: '',
    items: [{ name: '', quantity: 1, price: 0 }],
    status: 'Processing',
    payment_method: 'Cash',
    notes: ''
  });

  // Fetch orders from Supabase
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('orders')
          .select(`
            id,
            table_number,
            nama_pemesan,
            order_date,
            total_amount,
            discount_amount,
            final_amount,
            status,
            payment_method,
            voucher_code,
            notes,
            order_items:order_items(
              quantity,
              price,
              products:products(
                name,
                image
              )
            )
          `)
          .order('order_date', { ascending: false });

        if (error) throw error;

        // Transform data to match our UI structure
        const transformedData = data.map(order => ({
          id: `INV-${String(order.id).padStart(3, '0')}`,
          customer: order.nama_pemesan,
          date: order.order_date,
          items: order.order_items.map(item => ({
            name: item.products?.name || 'Unknown Product',
            quantity: item.quantity,
            price: item.price
          })),
          status: order.status,
          payment: order.payment_method,
          table_number: order.table_number,
          notes: order.notes,
          final_amount: order.final_amount
        }));

        setSales(transformedData);
      } catch (error) {
        console.error('Error fetching orders:', error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  // Helper functions
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    return new Date(dateString).toLocaleDateString('id-ID', options);
  };

  const calculateTotal = (items) => {
    return items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  };

  // Status change handler
  const handleStatusChange = async (orderId, newStatus) => {
    try {
      // Update in Supabase
      const { error } = await supabase
        .from('orders')
        .update({ status: newStatus })
        .eq('id', orderId.replace('INV-', ''));

      if (error) throw error;

      // Update local state
      setSales(sales.map(sale => 
        sale.id === orderId ? { ...sale, status: newStatus } : sale
      ));
    } catch (error) {
      console.error('Error updating status:', error.message);
    }
  };

  // Form handlers
  const handleAddSale = async () => {
    if (!formData.nama_pemesan || !formData.table_number || 
        formData.items.some(item => !item.name || item.price <= 0)) {
      alert('Please fill all required fields!');
      return;
    }

    try {
      setLoading(true);
      
      // Create order in Supabase
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert({
          table_number: formData.table_number,
          nama_pemesan: formData.nama_pemesan,
          total_amount: calculateTotal(formData.items),
          final_amount: calculateTotal(formData.items),
          status: formData.status,
          payment_method: formData.payment_method,
          notes: formData.notes
        })
        .select()
        .single();

      if (orderError) throw orderError;

      // Create order items
      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(
          formData.items.map(item => ({
            order_id: order.id,
            product_id: null, // You might want to map to actual product IDs
            quantity: item.quantity,
            price: item.price
          }))
        );

      if (itemsError) throw itemsError;

      // Refresh orders
      const { data: newOrders } = await supabase
        .from('orders')
        .select('*')
        .order('order_date', { ascending: false });

      setSales(newOrders.map(order => ({
        id: `INV-${String(order.id).padStart(3, '0')}`,
        customer: order.nama_pemesan,
        date: order.order_date,
        items: [], // You might want to fetch items here
        status: order.status,
        payment: order.payment_method
      })));

      setFormData({
        table_number: '',
        nama_pemesan: '',
        items: [{ name: '', quantity: 1, price: 0 }],
        status: 'Processing',
        payment_method: 'Cash',
        notes: ''
      });
      setShowForm(false);
    } catch (error) {
      console.error('Error creating order:', error.message);
    } finally {
      setLoading(false);
    }
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

  const getPaymentIcon = (payment) => {
    switch (payment) {
      case 'Cash': return <Wallet size={16} className="mr-1" />;
      case 'Credit Card': return <CreditCard size={16} className="mr-1" />;
      case 'QRIS': return <QrCode size={16} className="mr-1" />;
      default: return null;
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Completed': return <CheckCircle size={16} className="mr-1" />;
      case 'Processing': return <Clock size={16} className="mr-1" />;
      default: return null;
    }
  };

  // Print receipt
  const printReceipt = (sale) => {
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <html>
        <head>
          <title>Receipt ${sale.id}</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; }
            .header { text-align: center; margin-bottom: 20px; }
            .info { margin-bottom: 15px; }
            table { width: 100%; border-collapse: collapse; margin-bottom: 15px; }
            th, td { padding: 8px; text-align: left; border-bottom: 1px solid #ddd; }
            .total { font-weight: bold; margin-top: 10px; }
            .thank-you { text-align: center; margin-top: 20px; font-style: italic; }
          </style>
        </head>
        <body>
          <div class="header">
            <h2>Fore Coffee</h2>
            <p>Jl. Coffee Street No. 123</p>
            <p>${formatDate(sale.date)}</p>
          </div>
          <div class="info">
            <p><strong>Invoice:</strong> ${sale.id}</p>
            <p><strong>Customer:</strong> ${sale.customer}</p>
            <p><strong>Table:</strong> ${sale.table_number}</p>
          </div>
          <table>
            <thead>
              <tr>
                <th>Item</th>
                <th>Qty</th>
                <th>Price</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              ${sale.items.map(item => `
                <tr>
                  <td>${item.name}</td>
                  <td>${item.quantity}</td>
                  <td>${formatCurrency(item.price)}</td>
                  <td>${formatCurrency(item.price * item.quantity)}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
          <div class="total">
            <p>Total: ${formatCurrency(sale.final_amount)}</p>
            <p>Payment: ${sale.payment}</p>
          </div>
          <div class="thank-you">
            <p>Thank you for your order!</p>
          </div>
          <script>
            window.onload = function() {
              setTimeout(function() {
                window.print();
                window.close();
              }, 200);
            }
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  if (loading && sales.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Sales Management</h1>
            <p className="text-gray-600">Manage all coffee shop transactions and orders</p>
          </div>
          <button
            onClick={() => setShowForm(true)}
            className="mt-4 md:mt-0 flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition duration-200 shadow-sm"
          >
            <Plus className="mr-2" size={18} />
            New Transaction
          </button>
        </div>

        {/* Search and Filter */}
        <div className="bg-white rounded-xl shadow-sm p-4 mb-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between space-y-4 md:space-y-0">
            <div className="relative w-full md:w-64">
              <div className="absolute left-3 top-2.5 text-gray-400">
                <Search size={18} />
              </div>
              <input
                type="text"
                placeholder="Search transactions..."
                className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Sales Table */}
        <div className="bg-white rounded-xl shadow overflow-hidden">
          <div className="overflow-x-auto">
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
                    <tr 
                      className="hover:bg-gray-50 cursor-pointer" 
                      onClick={() => setExpandedSale(expandedSale === sale.id ? null : sale.id)}
                    >
                      <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">
                        {sale.id}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {sale.customer}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {formatDate(sale.date)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap font-medium">
                        {formatCurrency(sale.final_amount)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full ${getPaymentColor(sale.payment)}`}>
                          {getPaymentIcon(sale.payment)}
                          {sale.payment}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(sale.status)}`}>
                          {getStatusIcon(sale.status)}
                          {sale.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <button 
                          className="text-gray-500 hover:text-gray-700"
                          onClick={(e) => {
                            e.stopPropagation();
                            setExpandedSale(expandedSale === sale.id ? null : sale.id);
                          }}
                        >
                          {expandedSale === sale.id ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                        </button>
                      </td>
                    </tr>
                    {expandedSale === sale.id && (
                      <tr>
                        <td colSpan="7" className="px-6 py-4 bg-gray-50">
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="col-span-2">
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
                                        <td className="px-4 py-2 whitespace-nowrap font-medium">
                                          {formatCurrency(item.price * item.quantity)}
                                        </td>
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
                                    <span className="font-medium">
                                      {formatCurrency(calculateTotal(sale.items))}
                                    </span>
                                  </div>
                                  {sale.discount_amount > 0 && (
                                    <div className="flex justify-between">
                                      <span className="text-gray-600">Discount</span>
                                      <span className="font-medium text-green-600">
                                        -{formatCurrency(sale.discount_amount)}
                                      </span>
                                    </div>
                                  )}
                                  <div className="border-t border-gray-200 my-2"></div>
                                  <div className="flex justify-between">
                                    <span className="text-gray-800 font-medium">Total</span>
                                    <span className="text-gray-800 font-bold">
                                      {formatCurrency(sale.final_amount)}
                                    </span>
                                  </div>
                                  {sale.notes && (
                                    <div className="mt-3">
                                      <p className="text-sm text-gray-600">Notes:</p>
                                      <p className="text-sm text-gray-800">{sale.notes}</p>
                                    </div>
                                  )}
                                  <div className="pt-4 flex space-x-2">
                                    <button 
                                      onClick={() => printReceipt(sale)}
                                      className="flex items-center px-3 py-1 bg-green-600 text-white rounded-lg text-sm hover:bg-green-700"
                                    >
                                      <Printer size={16} className="mr-1" />
                                      Print Receipt
                                    </button>
                                    <select
                                      value={sale.status}
                                      onChange={(e) => handleStatusChange(sale.id, e.target.value)}
                                      className={`px-3 py-1 text-sm rounded-lg border ${getStatusColor(sale.status)} focus:outline-none focus:ring-1 focus:ring-green-500`}
                                    >
                                      <option value="Processing">Processing</option>
                                      <option value="Completed">Completed</option>
                                    </select>
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
                      {loading ? 'Loading...' : 'No transactions found'}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Add Sale Modal */}
        {showForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl shadow-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-semibold text-gray-800">New Coffee Order</h2>
                  <button 
                    onClick={() => setShowForm(false)}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    <X size={20} />
                  </button>
                </div>

                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Customer Name*</label>
                      <input
                        type="text"
                        name="nama_pemesan"
                        value={formData.nama_pemesan}
                        onChange={(e) => setFormData({...formData, nama_pemesan: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                        placeholder="Customer name"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Table Number*</label>
                      <input
                        type="text"
                        name="table_number"
                        value={formData.table_number}
                        onChange={(e) => setFormData({...formData, table_number: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                        placeholder="Table number"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Items*</label>
                    {formData.items.map((item, index) => (
                      <div key={index} className="grid grid-cols-12 gap-3 mb-3">
                        <div className="col-span-5">
                          <input
                            type="text"
                            name="name"
                            value={item.name}
                            onChange={(e) => handleItemChange(index, e)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                            placeholder="Item name"
                          />
                        </div>
                        <div className="col-span-2">
                          <input
                            type="number"
                            name="quantity"
                            value={item.quantity}
                            onChange={(e) => handleItemChange(index, e)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                            min="1"
                          />
                        </div>
                        <div className="col-span-4">
                          <input
                            type="number"
                            name="price"
                            value={item.price}
                            onChange={(e) => handleItemChange(index, e)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                            placeholder="Price"
                          />
                        </div>
                        <div className="col-span-1 flex items-center">
                          {formData.items.length > 1 && (
                            <button
                              onClick={() => removeItemRow(index)}
                              className="text-red-500 hover:text-red-700"
                            >
                              <X size={18} />
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                    <button
                      onClick={addItemRow}
                      className="mt-2 flex items-center text-sm px-3 py-1 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition duration-200"
                    >
                      <Plus size={14} className="mr-1" />
                      Add Item
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Payment Method</label>
                      <select
                        name="payment_method"
                        value={formData.payment_method}
                        onChange={(e) => setFormData({...formData, payment_method: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
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
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                      >
                        <option value="Processing">Processing</option>
                        <option value="Completed">Completed</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                    <textarea
                      name="notes"
                      value={formData.notes}
                      onChange={(e) => setFormData({...formData, notes: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                      rows={2}
                      placeholder="Special requests, allergies, etc."
                    ></textarea>
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
                        <div className="border-t border-gray-200 col-span-2 pt-2">
                          <p className="text-sm text-gray-500">Grand Total</p>
                          <p className="font-bold text-lg">
                            {formatCurrency(calculateTotal(formData.items))}
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
                    disabled={loading}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition duration-200 disabled:opacity-50"
                  >
                    {loading ? 'Saving...' : 'Save Order'}
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