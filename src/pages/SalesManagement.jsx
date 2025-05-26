import React, { useState } from "react";

const dummyCustomers = [
  { id: 1, name: "Budi Santoso" },
  { id: 2, name: "Siti Aminah" },
  { id: 3, name: "Andi Wijaya" },
];

const initialSales = [
  {
    id: 1,
    invoice: "INV-001",
    customerId: 1,
    date: "2025-05-10",
    total: 1500000,
    status: "Lunas",
  },
  {
    id: 2,
    invoice: "INV-002",
    customerId: 2,
    date: "2025-05-11",
    total: 250000,
    status: "Belum Lunas",
  },
];

function formatCurrency(num) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
  }).format(num);
}

export default function SalesManagement() {
  const [sales, setSales] = useState(initialSales);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    invoice: "",
    customerId: "",
    date: "",
    total: "",
    status: "Belum Lunas",
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleAddSale = () => {
    if (
      !formData.invoice ||
      !formData.customerId ||
      !formData.date ||
      !formData.total
    ) {
      alert("Semua field wajib diisi!");
      return;
    }
    const newSale = {
      id: sales.length + 1,
      invoice: formData.invoice,
      customerId: Number(formData.customerId),
      date: formData.date,
      total: Number(formData.total),
      status: formData.status,
    };
    setSales([...sales, newSale]);
    setFormData({
      invoice: "",
      customerId: "",
      date: "",
      total: "",
      status: "Belum Lunas",
    });
    setShowForm(false);
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

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <h1 className="text-2xl font-semibold mb-4">Management Penjualan</h1>

      <button
        onClick={() => setShowForm((prev) => !prev)}
        className="mb-4 px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 transition"
      >
        {showForm ? "Batal Tambah Penjualan" : "Tambah Penjualan"}
      </button>

      {showForm && (
        <div className="mb-6 p-4 border border-gray-300 rounded shadow-sm bg-white">
          <div className="mb-2">
            <label className="block font-medium mb-1">Nomor Invoice</label>
            <input
              type="text"
              name="invoice"
              value={formData.invoice}
              onChange={handleInputChange}
              placeholder="Misal: INV-003"
              className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-indigo-400"
            />
          </div>

          <div className="mb-2">
            <label className="block font-medium mb-1">Pelanggan</label>
            <select
              name="customerId"
              value={formData.customerId}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-indigo-400"
            >
              <option value="">-- Pilih Pelanggan --</option>
              {dummyCustomers.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <div className="mb-2">
            <label className="block font-medium mb-1">Tanggal</label>
            <input
              type="date"
              name="date"
              value={formData.date}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-indigo-400"
            />
          </div>

          <div className="mb-2">
            <label className="block font-medium mb-1">Total (Rp)</label>
            <input
              type="number"
              name="total"
              value={formData.total}
              onChange={handleInputChange}
              placeholder="Jumlah total penjualan"
              className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-indigo-400"
              min="0"
            />
          </div>

          <div className="mb-4">
            <label className="block font-medium mb-1">Status</label>
            <select
              name="status"
              value={formData.status}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-indigo-400"
            >
              <option value="Belum Lunas">Belum Lunas</option>
              <option value="Lunas">Lunas</option>
              <option value="Batal">Batal</option>
            </select>
          </div>

          <button
            onClick={handleAddSale}
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition"
          >
            Simpan
          </button>
        </div>
      )}

      <div className="overflow-x-auto bg-white rounded shadow">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Invoice
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Pelanggan
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Tanggal
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Total
              </th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                Aksi
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {sales.map((sale) => (
              <tr key={sale.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">{sale.invoice}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {getCustomerName(sale.customerId)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">{sale.date}</td>
                <td className="px-6 py-4 whitespace-nowrap text-right">
                  {formatCurrency(sale.total)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-center">
                  {sale.status === "Lunas" ? (
                    <span className="inline-flex px-2 text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                      Lunas
                    </span>
                  ) : sale.status === "Belum Lunas" ? (
                    <span className="inline-flex px-2 text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">
                      Belum Lunas
                    </span>
                  ) : (
                    <span className="inline-flex px-2 text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">
                      Batal
                    </span>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-center space-x-2">
                  <button
                    className="text-indigo-600 hover:text-indigo-900 font-semibold"
                    onClick={() => alert("Fitur Edit belum tersedia")}
                  >
                    Edit
                  </button>
                  <button
                    className="text-red-600 hover:text-red-900 font-semibold"
                    onClick={() => handleDelete(sale.id)}
                  >
                    Hapus
                  </button>
                </td>
              </tr>
            ))}
            {sales.length === 0 && (
              <tr>
                <td colSpan={6} className="text-center py-4 text-gray-500">
                  Tidak ada data penjualan
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
