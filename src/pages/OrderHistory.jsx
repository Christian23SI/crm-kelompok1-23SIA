import React, { useState, useEffect } from "react";
import { supabase } from "../supabase";
import {
  Clock,
  CheckCircle,
  XCircle,
  ShoppingBag,
  ArrowLeft,
  Printer,
  RotateCw,
} from "lucide-react";
import { useParams, Link, useNavigate } from "react-router-dom";

export default function OrderHistory() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [reordering, setReordering] = useState(false);
  const { orderId } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserAndOrders = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);

      try {
        setLoading(true);
        let query = supabase
          .from('orders')
          .select(`
            id,
            customer_id,
            nama_pemesan,
            table_number,
            order_date,
            total_amount,
            discount_amount,
            final_amount,
            status,
            payment_method,
            voucher_code,
            notes,
            order_items:order_items(
              id,
              quantity,
              price,
              notes,
              product_id,
              products:products(
                id,
                name,
                image,
                category
              )
            )
          `)
          .order('order_date', { ascending: false });

        if (orderId) {
          query = query.eq('id', orderId);
        } else if (user) {
          query = query.eq('customer_id', user.id);
        }

        const { data, error } = await query;

        if (error) throw error;
        setOrders(orderId ? [data] : data);
      } catch (error) {
        console.error("Error fetching orders:", error.message);
        alert("Gagal memuat riwayat pesanan");
      } finally {
        setLoading(false);
      }
    };

    fetchUserAndOrders();
  }, [orderId, user]);

  const getStatusColor = (status) => {
    switch (status) {
      case 'Completed': return 'bg-green-100 text-green-800';
      case 'Processing': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Completed': return <CheckCircle className="text-green-500 mr-1" size={18} />;
      case 'Processing': return <Clock className="text-yellow-500 mr-1" size={18} />;
      default: return <Clock className="text-gray-500 mr-1" size={18} />;
    }
  };

  const handleReorder = async (oldOrder) => {
    if (!window.confirm(`Anda yakin ingin memesan ulang order #${oldOrder.id}?`)) {
      return;
    }

    try {
      setReordering(true);
      
      // Buat order baru berdasarkan order lama
      const newOrder = {
        customer_id: user?.id || null,
        table_number: oldOrder.table_number,
        nama_pemesan: oldOrder.nama_pemesan,
        total_amount: oldOrder.total_amount,
        discount_amount: oldOrder.discount_amount,
        final_amount: oldOrder.final_amount,
        payment_method: oldOrder.payment_method,
        voucher_code: oldOrder.voucher_code,
        notes: `Re-order dari pesanan #${oldOrder.id}`,
        status: 'Processing'
      };

      // Insert order baru ke database
      const { data: insertedOrder, error: orderError } = await supabase
        .from('orders')
        .insert(newOrder)
        .select()
        .single();

      if (orderError) throw orderError;

      // Siapkan order items untuk diinsert
      const orderItems = oldOrder.order_items.map(item => ({
        order_id: insertedOrder.id,
        product_id: item.product_id,
        quantity: item.quantity,
        price: item.price,
        notes: item.notes
      }));

      // Insert order items
      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems);

      if (itemsError) throw itemsError;

      alert("Pesanan berhasil dibuat ulang!");
      navigate(`/pemesananuser`);
    } catch (error) {
      console.error("Error reordering:", error.message);
      alert("Gagal membuat pesanan ulang: " + error.message);
    } finally {
      setReordering(false);
    }
  };

  const printReceipt = (order) => {
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <html>
        <head>
          <title>Receipt #${order.id}</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; max-width: 400px; margin: 0 auto; }
            .header { text-align: center; margin-bottom: 20px; border-bottom: 1px dashed #ccc; padding-bottom: 10px; }
            .info { margin-bottom: 15px; }
            table { width: 100%; border-collapse: collapse; margin: 15px 0; }
            th { text-align: left; padding: 5px 0; border-bottom: 1px dashed #ccc; }
            td { padding: 5px 0; border-bottom: 1px dashed #eee; }
            .total-row { font-weight: bold; }
            .thank-you { text-align: center; margin-top: 20px; font-style: italic; color: #555; }
            .status { display: inline-block; padding: 2px 8px; border-radius: 12px; font-size: 12px; }
            .completed { background: #d1fae5; color: #065f46; }
            .processing { background: #fef3c7; color: #92400e; }
          </style>
        </head>
        <body>
          <div class="header">
            <h2>Restoran Anda</h2>
            <p>${new Date(order.order_date).toLocaleString('id-ID')}</p>
          </div>
          
          <div class="info">
            <p><strong>Invoice:</strong> #${order.id}</p>
            <p><strong>Customer:</strong> ${order.nama_pemesan}</p>
            <p><strong>Table:</strong> ${order.table_number}</p>
            <p><strong>Status:</strong> 
              <span class="status ${order.status.toLowerCase()}">${order.status}</span>
            </p>
          </div>
          
          <table>
            <thead>
              <tr>
                <th>Item</th>
                <th>Qty</th>
                <th>Price</th>
              </tr>
            </thead>
            <tbody>
              ${order.order_items.map(item => `
                <tr>
                  <td>${item.products?.name || 'Unknown'}</td>
                  <td>${item.quantity}</td>
                  <td>${new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(item.price)}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
          
          <table>
            <tr>
              <td>Subtotal:</td>
              <td>${new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(order.total_amount)}</td>
            </tr>
            ${order.discount_amount > 0 ? `
            <tr>
              <td>Discount:</td>
              <td>-${new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(order.discount_amount)}</td>
            </tr>
            ` : ''}
            <tr class="total-row">
              <td>Total:</td>
              <td>${new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(order.final_amount)}</td>
            </tr>
            <tr>
              <td>Payment:</td>
              <td>${order.payment_method}</td>
            </tr>
          </table>
          
          ${order.notes ? `<p><strong>Notes:</strong> ${order.notes}</p>` : ''}
          
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
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8 flex items-center">
          {orderId && (
            <Link to="/order-history" className="mr-4 text-gray-600 hover:text-green-600">
              <ArrowLeft size={24} />
            </Link>
          )}
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {orderId ? 'Detail Pesanan' : 'Riwayat Pesanan'}
            </h1>
            <p className="text-gray-500">
              {orderId ? "Detail pesanan Anda" : "Daftar pesanan sebelumnya"}
            </p>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
        {orders.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-8 text-center">
            <ShoppingBag className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-lg font-medium text-gray-900">Tidak ada pesanan</h3>
            <p className="mt-1 text-gray-500">
              {user ? "Anda belum memiliki pesanan" : "Silakan masuk untuk melihat riwayat pesanan"}
            </p>
            {!user && (
              <div className="mt-6">
                <Link
                  to="/signin"
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                >
                  Masuk
                </Link>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map(order => (
              <div key={order.id} className="bg-white rounded-lg shadow-sm overflow-hidden">
                {/* Order Header */}
                <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                  <div className="flex items-center space-x-4">
                    {getStatusIcon(order.status)}
                    <div>
                      <h2 className="text-lg font-medium text-gray-900">
                        Pesanan #${order.id}
                      </h2>
                      <p className="text-sm text-gray-500">
                        {new Date(order.order_date).toLocaleString('id-ID')}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-green-600">
                      Rp{order.final_amount.toLocaleString('id-ID')}
                    </p>
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                      {order.status}
                    </span>
                  </div>
                </div>

                {/* Order Details */}
                <div className="px-6 py-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                    <div>
                      <h3 className="text-sm font-medium text-gray-500 mb-2">Nama Pemesan</h3>
                      <p className="text-sm text-gray-900">{order.nama_pemesan}</p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-500 mb-2">Nomor Meja</h3>
                      <p className="text-sm text-gray-900">{order.table_number}</p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-500 mb-2">Metode Pembayaran</h3>
                      <p className="text-sm text-gray-900 capitalize">{order.payment_method}</p>
                    </div>
                    {order.voucher_code && (
                      <div>
                        <h3 className="text-sm font-medium text-gray-500 mb-2">Kode Voucher</h3>
                        <p className="text-sm text-gray-900">{order.voucher_code}</p>
                      </div>
                    )}
                  </div>

                  {order.notes && (
                    <div className="mb-6">
                      <h3 className="text-sm font-medium text-gray-500 mb-2">Catatan</h3>
                      <p className="text-sm text-gray-900">{order.notes}</p>
                    </div>
                  )}

                  {/* Order Items */}
                  <h3 className="text-sm font-medium text-gray-500 mb-2">Item Pesanan</h3>
                  <div className="space-y-4">
                    {order.order_items.map((item, index) => (
                      <div key={index} className="flex items-start border-b pb-4">
                        <div className="flex-shrink-0">
                          <img
                            src={item.products?.image || 'https://via.placeholder.com/100'}
                            alt={item.products?.name}
                            className="h-16 w-16 rounded-md object-cover"
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.src = 'https://via.placeholder.com/100';
                            }}
                          />
                        </div>
                        <div className="ml-4 flex-1">
                          <div className="flex justify-between">
                            <h3 className="text-sm font-medium text-gray-900">
                              {item.products?.name || 'Produk tidak diketahui'}
                            </h3>
                            <p className="ml-4 text-sm font-medium text-gray-900">
                              Rp{(item.price * item.quantity).toLocaleString('id-ID')}
                            </p>
                          </div>
                          <p className="text-sm text-gray-500">{item.products?.category || ''}</p>
                          <div className="mt-1">
                            <span className="text-sm text-gray-500">
                              {item.quantity} × Rp{item.price.toLocaleString('id-ID')}
                            </span>
                          </div>
                          {item.notes && (
                            <div className="mt-1">
                              <p className="text-xs text-gray-500">Catatan: {item.notes}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Order Summary */}
                  <div className="mt-6 border-t border-gray-200 pt-4">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Subtotal</span>
                      <span className="text-sm font-medium">
                        Rp{order.total_amount.toLocaleString('id-ID')}
                      </span>
                    </div>
                    {order.discount_amount > 0 && (
                      <div className="flex justify-between mt-1">
                        <span className="text-sm text-gray-600">Diskon</span>
                        <span className="text-sm font-medium text-green-600">
                          -Rp{order.discount_amount.toLocaleString('id-ID')}
                        </span>
                      </div>
                    )}
                    <div className="flex justify-between mt-2 pt-2 border-t border-gray-200">
                      <span className="text-base font-medium">Total</span>
                      <span className="text-base font-bold">
                        Rp{order.final_amount.toLocaleString('id-ID')}
                      </span>
                    </div>
                  </div>

                  {/* Order Actions */}
                  <div className="mt-6 flex justify-end space-x-3">
                    <button
                      onClick={() => handleReorder(order)}
                      disabled={reordering}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center disabled:opacity-50"
                    >
                      {reordering ? (
                        <>
                          <RotateCw className="mr-2 animate-spin" size={18} />
                          Memproses...
                        </>
                      ) : (
                        <>
                          <RotateCw className="mr-2" size={18} />
                          Pesan Ulang
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}