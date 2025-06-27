import { useState } from 'react';
import { Settings, Lock, Mail, User } from 'lucide-react';

const AccountSetting = () => {
  const [formData, setFormData] = useState({
    name: 'User',
    email: 'User@gmail.com',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const validationErrors = {};
    
    if (!formData.name) validationErrors.name = 'Name is required';
    if (!formData.email) validationErrors.email = 'Email is required';
    if (formData.newPassword && formData.newPassword !== formData.confirmPassword) {
      validationErrors.confirmPassword = 'Passwords do not match';
    }
    
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    
    // Submit logic here
    console.log('Form submitted:', formData);
    alert('Profile updated successfully!');
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl md:text-3xl font-bold text-green-600 mb-6">Pengaturan Akun</h1>
        
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          {/* Profile Section */}
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-green-400 flex items-center gap-2">
              <User className="w-5 h-5" />
              Informasi Profil
            </h2>
            
            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
              {/* Name Field */}
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                  Nama Lengkap
                </label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <input
                    type="text"
                    name="name"
                    id="name"
                    value={formData.name}
                    onChange={handleChange}
                    className={`block w-full rounded-md border ${errors.name ? 'border-red-300' : 'border-gray-300'} p-2 focus:ring-green-600 focus:border-green-600`}
                  />
                </div>
                {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
              </div>
              
              {/* Email Field */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                  Alamat Email
                </label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="email"
                    name="email"
                    id="email"
                    value={formData.email}
                    onChange={handleChange}
                    className={`block w-full pl-10 rounded-md border ${errors.email ? 'border-red-300' : 'border-gray-300'} p-2 focus:ring-[#6F4E37] focus:border-[#6F4E37]`}
                  />
                </div>
                {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
              </div>
              
              {/* Password Section */}
              <div className="pt-6">
                <h3 className="text-lg font-semibold text-green-400 flex items-center gap-2">
                  <Lock className="w-5 h-5" />
                  Ubah Password
                </h3>
                <p className="mt-1 text-sm text-gray-500">
                  Kosongkan jika tidak ingin mengubah password
                </p>
                
                {/* Current Password */}
                <div className="mt-4">
                  <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700">
                    Password Saat Ini
                  </label>
                  <div className="mt-1 relative rounded-md shadow-sm">
                    <input
                      type="password"
                      name="currentPassword"
                      id="currentPassword"
                      value={formData.currentPassword}
                      onChange={handleChange}
                      className="block w-full rounded-md border border-gray-300 p-2 focus:ring-[#6F4E37] focus:border-[#6F4E37]"
                    />
                  </div>
                </div>
                
                {/* New Password */}
                <div className="mt-4">
                  <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700">
                    Password Baru
                  </label>
                  <div className="mt-1 relative rounded-md shadow-sm">
                    <input
                      type="password"
                      name="newPassword"
                      id="newPassword"
                      value={formData.newPassword}
                      onChange={handleChange}
                      className="block w-full rounded-md border border-gray-300 p-2 focus:ring-[#6F4E37] focus:border-[#6F4E37]"
                    />
                  </div>
                </div>
                
                {/* Confirm Password */}
                <div className="mt-4">
                  <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                    Konfirmasi Password Baru
                  </label>
                  <div className="mt-1 relative rounded-md shadow-sm">
                    <input
                      type="password"
                      name="confirmPassword"
                      id="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      className={`block w-full rounded-md border ${errors.confirmPassword ? 'border-red-300' : 'border-gray-300'} p-2 focus:ring-[#6F4E37] focus:border-[#6F4E37]`}
                    />
                  </div>
                  {errors.confirmPassword && <p className="mt-1 text-sm text-red-600">{errors.confirmPassword}</p>}
                </div>
              </div>
              
              {/* Submit Button */}
              <div className="pt-6">
                <button
                  type="submit"
                  className="w-full md:w-auto px-6 py-2 bg-green-600 text-white rounded-md hover:bg-[#5a3d2a] transition duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#6F4E37]"
                >
                  Simpan Perubahan
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AccountSetting;