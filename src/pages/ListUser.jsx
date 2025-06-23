import { useEffect, useState } from 'react';
import { supabase } from '../supabase';
import UserForm from '../components/UserForm';

function User() {
  const [users, setUsers] = useState([]);
  const [editingUser, setEditingUser] = useState(null);

  const fetchUsers = async () => {
    const { data, error } = await supabase.from('users').select('*').order('created_at', { ascending: false });
    if (error) console.error(error);
    else setUsers(data);
  };

  const addUser = async (user) => {
    const { error } = await supabase.from('users').insert(user);
    if (error) console.error(error);
    else fetchUsers();
  };

  const updateUser = async (user) => {
    const { error } = await supabase.from('users').update(user).eq('id', user.id);
    if (error) console.error(error);
    else {
      fetchUsers();
      setEditingUser(null);
    }
  };

  const deleteUser = async (id) => {
    const { error } = await supabase.from('users').delete().eq('id', id);
    if (error) console.error(error);
    else fetchUsers();
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  return (
    <div className="max-w-xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">CRUD Pengguna dengan Supabase</h1>
      <UserForm
        addUser={addUser}
        updateUser={updateUser}
        editingUser={editingUser}
      />
      <ul className="mt-4">
        {users.map(user => (
          <li key={user.id} className="border p-2 my-2 flex justify-between">
            <div>
              <p className="font-semibold">{user.name}</p>
              <p className="text-sm text-gray-600">{user.email} - {user.role}</p>
            </div>
            <div className="space-x-2">
              <button
                onClick={() => setEditingUser(user)}
                className="text-blue-600 hover:underline"
              >
                Edit
              </button>
              <button
                onClick={() => deleteUser(user.id)}
                className="text-red-600 hover:underline"
              >
                Hapus
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default User;


