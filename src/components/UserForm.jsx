import { useState, useEffect } from 'react';
import { supabase } from '../supabase';

const UserForm = ({ addUser, updateUser, editingUser }) => {
  const [form, setForm] = useState({ name: '', email: '', role: '' });

  useEffect(() => {
    if (editingUser) setForm(editingUser);
    else setForm({ name: '', email: '', role: '' });
  }, [editingUser]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.role) return;

    editingUser ? updateUser(form) : addUser(form);
    setForm({ name: '', email: '', role: '' });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <input
        type="text"
        placeholder="Nama"
        className="w-full p-2 border rounded"
        value={form.name}
        onChange={e => setForm({ ...form, name: e.target.value })}
      />
      <input
        type="email"
        placeholder="Email"
        className="w-full p-2 border rounded"
        value={form.email}
        onChange={e => setForm({ ...form, email: e.target.value })}
      />
      <select
        className="w-full p-2 border rounded"
        value={form.role}
        onChange={e => setForm({ ...form, role: e.target.value })}
      >
        <option value="">Pilih Role</option>
        <option value="Admin">Admin</option>
        <option value="Editor">Editor</option>
        <option value="Viewer">Viewer</option>
      </select>
      <button type="submit" className="bg-green-600 text-white px-4 py-2 rounded">
        {editingUser ? 'Perbarui' : 'Tambah'}
      </button>
    </form>
  );
};

export default UserForm;

  
