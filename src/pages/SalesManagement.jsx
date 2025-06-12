import React, { useState } from "react";

const dummyCustomers = [
  { id: 1, name: "Budi Santoso" },
  { id: 2, name: "Siti Aminah" },
  { id: 3, name: "Andi Wijaya" },
  { id: 4, name: "Rina Marlina" },
  { id: 5, name: "Dedi Kurniawan" },
];

const orderHistory = [
  {
    customerId: 1,
    orders: [
      { invoice: "INV-001", date: "2025-05-10", items: "2x Latte, 1x Croissant", total: "Rp 85.000", status: "Selesai" },
      { invoice: "INV-003", date: "2025-05-15", items: "1x Cappuccino, 1x Donut", total: "Rp 65.000", status: "Selesai" },
      { invoice: "INV-006", date: "2025-06-01", items: "3x Latte", total: "Rp 90.000", status: "Selesai" },
    ]
  },
  {
    customerId: 2,
    orders: [
      { invoice: "INV-002", date: "2025-05-11", items: "1x Espresso", total: "Rp 25.000", status: "Diproses" },
      { invoice: "INV-007", date: "2025-06-05", items: "1x Espresso, 2x Brownies", total: "Rp 70.000", status: "Selesai" },
    ]
  },
  {
    customerId: 3,
    orders: [
      { invoice: "INV-004", date: "2025-05-12", items: "1x Latte, 1x Muffin", total: "Rp 50.000", status: "Selesai" },
    ]
  },
  {
    customerId: 4,
    orders: [
      { invoice: "INV-005", date: "2025-05-13", items: "2x Croissant", total: "Rp 60.000", status: "Selesai" },
    ]
  },
  {
    customerId: 5,
    orders: [
      { invoice: "INV-008", date: "2025-06-10", items: "1x Americano, 1x Donut", total: "Rp 55.000", status: "Diproses" },
      { invoice: "INV-009", date: "2025-06-11", items: "2x Cappuccino", total: "Rp 80.000", status: "Selesai" },
    ]
  },
];

const initialSales = [
  {
    id: 1,
    invoice: "INV-001",
    customerId: 1,
    date: "2025-05-10",
    total: 85000,
    status: "Selesai",
    points: 300,
  },
  {
    id: 2,
    invoice: "INV-002",
    customerId: 2,
    date: "2025-05-11",
    total: 25000,
    status: "Diproses",
    points: 100,
  },
];

function countItems(itemString) {
  const itemPattern = /(\d+)x\s/g;
  let totalItems = 0;
  let match;
  while ((match = itemPattern.exec(itemString)) !== null) {
    totalItems += parseInt(match[1]);
  }
  return totalItems;
}

export default function SalesManagement() {
  const [sales, setSales] = useState(initialSales);
  const [showForm, setShowForm] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editId, setEditId] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [modalData, setModalData] = useState([]);
  const [modalCustomer, setModalCustomer] = useState("");

  const [formData, setFormData] = useState({
    invoice: "",
    customerName: "",
    date: "",
    total: "",
    status: "Diproses",
    points: 0,
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddSale = () => {
    if (!formData.invoice || !formData.customerName || !formData.date || !formData.total) {
      alert("Semua field wajib diisi!");
      return;
    }

    const customer = dummyCustomers.find(c => c.name.toLowerCase() === formData.customerName.toLowerCase());
    if (!customer) {
      alert("Nama pelanggan tidak ditemukan.");
      return;
    }

    const orderData = orderHistory.find(o => o.customerId === customer.id);
    const orderMatch = orderData?.orders.find(o => o.invoice === formData.invoice);
    const totalItems = orderMatch ? countItems(orderMatch.items) : 1;

    const newSale = {
      id: sales.length + 1,
      invoice: formData.invoice,
      customerId: customer.id,
      date: formData.date,
      total: Number(formData.total),
      status: formData.status,
      points: totalItems * 100,
    };

    setSales([...sales, newSale]);
    resetForm();
  };

  const handleUpdateSale = () => {
    const customer = dummyCustomers.find(c => c.name.toLowerCase() === formData.customerName.toLowerCase());
    if (!customer) {
      alert("Nama pelanggan tidak ditemukan.");
      return;
    }

    const updatedSales = sales.map((sale) =>
      sale.id === editId
        ? {
            ...sale,
            invoice: formData.invoice,
            customerId: customer.id,
            date: formData.date,
            total: Number(formData.total),
            status: formData.status,
            points: countItems(orderHistory.find(o => o.customerId === customer.id)
              ?.orders.find(o => o.invoice === formData.invoice)?.items || "") * 100,
          }
        : sale
    );
    setSales(updatedSales);
    resetForm();
  };

  const resetForm = () => {
    setFormData({ invoice: "", customerName: "", date: "", total: "", status: "Diproses", points: 0 });
    setEditMode(false);
    setEditId(null);
    setShowForm(false);
  };

  const handleEdit = (sale) => {
    const cust = dummyCustomers.find(c => c.id === sale.customerId);
    setFormData({
      ...sale,
      customerName: cust ? cust.name : "",
    });
    setEditId(sale.id);
    setEditMode(true);
    setShowForm(true);
  };

  const handleDelete = (id) => {
    if (window.confirm("Yakin ingin menghapus penjualan ini?")) {
      setSales(sales.filter((s) => s.id !== id));
    }
  };

  const getCustomerName = (id) => {
    const cust = dummyCustomers.find((c) => c.id === id);
    return cust ? cust.name : "-";
  };

  const handleShowRiwayat = (customerId) => {
    const data = orderHistory.find((c) => c.customerId === customerId);
    setModalData(data ? data.orders : []);
    setModalCustomer(getCustomerName(customerId));
    setShowModal(true);
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h1 className="text-2xl font-semibold mb-4">Manajemen Penjualan</h1>

      <button
        onClick={() => {
          setShowForm(!showForm);
          if (showForm && editMode) resetForm();
        }}
        className="mb-4 px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 transition"
      >
        {showForm ? (editMode ? "Batal Edit" : "Batal Tambah") : (editMode ? "Edit Penjualan" : "Tambah Penjualan")}
      </button>

      {/* Form */}
      {showForm && (
        <div className="mb-6 p-4 border border-gray-300 rounded shadow-sm bg-white">
          {["invoice", "customerName", "date", "total"].map((field) => (
            <div key={field} className="mb-2">
              <label className="block font-medium mb-1 capitalize">{field}</label>
              <input
                type={field === "date" ? "date" : "text"}
                name={field}
                value={formData[field]}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border rounded"
                placeholder={field === "customerName" ? "Ketik nama pelanggan" : ""}
              />
            </div>
          ))}

          <div className="mb-4">
            <label className="block font-medium mb-1">Status</label>
            <select
              name="status"
              value={formData.status}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border rounded"
            >
              <option value="Diproses">Diproses</option>
              <option value="Selesai">Selesai</option>
              <option value="Dibatalkan">Dibatalkan</option>
            </select>
          </div>

          <button
            onClick={editMode ? handleUpdateSale : handleAddSale}
            className="px-4 py-2 bg-green-600 text-white rounded"
          >
            {editMode ? "Perbarui" : "Simpan"}
          </button>
        </div>
      )}

      {/* Tabel */}
      <div className="overflow-x-auto bg-white rounded shadow">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              {["Invoice", "Pelanggan", "Tanggal", "Status", "+Poin", "Riwayat", "Aksi"].map((head) => (
                <th key={head} className="px-6 py-3 text-xs font-medium text-gray-500 text-center">{head}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {sales.map((sale) => (
              <tr key={sale.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 text-center">{sale.invoice}</td>
                <td className="px-6 py-4 text-center">{getCustomerName(sale.customerId)}</td>
                <td className="px-6 py-4 text-center">{sale.date}</td>
                <td className="px-6 py-4 text-center">{sale.status}</td>
                <td className="px-6 py-4 text-center text-green-700 font-semibold">+{sale.points}</td>
                <td className="px-6 py-4 text-center">
                  <button onClick={() => handleShowRiwayat(sale.customerId)} className="text-blue-600 hover:underline">
                    Lihat
                  </button>
                </td>
                <td className="px-6 py-4 text-center space-x-2">
                  <button onClick={() => handleEdit(sale)} className="text-indigo-600 font-semibold">Edit</button>
                  <button onClick={() => handleDelete(sale.id)} className="text-red-600 font-semibold">Hapus</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal Riwayat */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl shadow-lg">
            <div className="flex justify-between mb-4">
              <h2 className="text-lg font-semibold">Riwayat Pembelian - {modalCustomer}</h2>
              <button onClick={() => setShowModal(false)} className="text-red-500 font-bold">×</button>
            </div>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2">Tanggal</th>
                  <th className="text-left py-2">Invoice</th>
                  <th className="text-left py-2">Item</th>
                  <th className="text-left py-2">Total</th>
                  <th className="text-left py-2">Status</th>
                </tr>
              </thead>
              <tbody>
                {modalData.length > 0 ? modalData.map((o, i) => (
                  <tr key={i} className="border-b">
                    <td className="py-2">{o.date}</td>
                    <td>{o.invoice}</td>
                    <td>{o.items}</td>
                    <td>{o.total}</td>
                    <td>{o.status}</td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan="5" className="text-center py-4 text-gray-500">Tidak ada riwayat</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
