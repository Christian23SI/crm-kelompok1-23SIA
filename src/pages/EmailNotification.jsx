// import { useState, useEffect } from 'react';
// import { FiMail, FiUsers, FiCalendar, FiCheckCircle, FiXCircle, FiSettings } from 'react-icons/fi';
// import { supabase } from '../supabase'; // Sesuaikan dengan path Anda

// const PushNotificationPage = () => {
//   // State untuk form
//   const [notification, setNotification] = useState({
//     subject: '',
//     message: '',
//     recipientType: 'all',
//     scheduled: false,
//     scheduleDate: '',
//     scheduleTime: '',
//   });

//   // State untuk data dari Supabase
//   const [scheduledNotifications, setScheduledNotifications] = useState([]);
//   const [notificationSettings, setNotificationSettings] = useState({
//     email_enabled: true,
//     sms_enabled: false,
//     push_enabled: false
//   });
//   const [recipientStats, setRecipientStats] = useState({
//     all: 0,
//     loyal: 0,
//     inactive: 0,
//     silver: 0,
//     gold: 0,
//     platinum: 0
//   });

//   // State untuk UI
//   const [showPreview, setShowPreview] = useState(false);
//   const [isSending, setIsSending] = useState(false);
//   const [sendSuccess, setSendSuccess] = useState(false);
//   const [loading, setLoading] = useState(true);

//   // Load data awal
//   useEffect(() => {
//     fetchData();
//   }, []);

//   const fetchData = async () => {
//     try {
//       setLoading(true);
      
//       // Ambil scheduled notifications
//       const { data: scheduledData, error: scheduledError } = await supabase
//         .from('scheduled_notifications')
//         .select(`
//           id,
//           send_at,
//           status,
//           notifications (
//             subject
//           )
//         `)
//         .order('send_at', { ascending: true })
//         .limit(5);
      
//       if (!scheduledError) {
//         setScheduledNotifications(scheduledData);
//       }

//       // Ambil notification settings
//       const { data: settingsData, error: settingsError } = await supabase
//         .from('notification_settings')
//         .select('*')
//         .single();
      
//       if (!settingsError && settingsData) {
//         setNotificationSettings(settingsData);
//       }

//       // Ambil recipient stats (contoh, sesuaikan dengan query Anda)
//       const { data: statsData, error: statsError } = await supabase
//         .rpc('get_recipient_stats');
      
//       if (!statsError && statsData) {
//         setRecipientStats(statsData);
//       }

//     } catch (error) {
//       console.error('Error fetching data:', error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   // Handler untuk perubahan input
//   const handleChange = (e) => {
//     const { name, value, type, checked } = e.target;
//     setNotification(prev => ({
//       ...prev,
//       [name]: type === 'checkbox' ? checked : value
//     }));
//   };

//   // Handler untuk submit
//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setIsSending(true);
    
//     try {
//       // Format scheduled time jika dijadwalkan
//       let scheduledAt = null;
//       if (notification.scheduled && notification.scheduleDate && notification.scheduleTime) {
//         scheduledAt = new Date(`${notification.scheduleDate}T${notification.scheduleTime}`).toISOString();
//       }

//       // Simpan notifikasi ke database
//       const { data, error } = await supabase
//         .from('notifications')
//         .insert([{
//           subject: notification.subject,
//           message: notification.message,
//           recipient_type: notification.recipientType,
//           scheduled: notification.scheduled,
//           schedule_date: scheduledAt,
//           status: notification.scheduled ? 'scheduled' : 'sent'
//         }])
//         .select()
//         .single();

//       if (error) throw error;

//       // Jika dijadwalkan, buat scheduled notification
//       if (notification.scheduled && scheduledAt) {
//         await supabase
//           .from('scheduled_notifications')
//           .insert([{
//             notification_id: data.id,
//             send_at: scheduledAt,
//             status: 'pending'
//           }]);
//       }

//       setSendSuccess(true);
//       setTimeout(() => setSendSuccess(false), 3000);
      
//       // Reset form
//       setNotification({
//         subject: '',
//         message: '',
//         recipientType: 'all',
//         scheduled: false,
//         scheduleDate: '',
//         scheduleTime: '',
//       });

//       // Refresh data
//       fetchData();

//     } catch (error) {
//       console.error('Error sending notification:', error);
//     } finally {
//       setIsSending(false);
//     }
//   };

//   // Handler untuk menghapus scheduled notification
//   const handleDeleteScheduled = async (id) => {
//     try {
//       await supabase
//         .from('scheduled_notifications')
//         .delete()
//         .eq('id', id);
      
//       fetchData(); // Refresh data
//     } catch (error) {
//       console.error('Error deleting scheduled notification:', error);
//     }
//   };

//   // Handler untuk mengubah settings
//   const handleSettingChange = async (field, value) => {
//     try {
//       const newSettings = { ...notificationSettings, [field]: value };
//       setNotificationSettings(newSettings);
      
//       await supabase
//         .from('notification_settings')
//         .upsert({
//           ...newSettings,
//           updated_at: new Date().toISOString()
//         });
//     } catch (error) {
//       console.error('Error updating settings:', error);
//     }
//   };

//   if (loading) {
//     return (
//       <div className="min-h-screen bg-gray-50 p-6 flex items-center justify-center">
//         <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-coffee-600"></div>
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-screen bg-gray-50 p-6">
//       <div className="max-w-6xl mx-auto">
//         {/* Header */}
//         <div className="flex justify-between items-center mb-8">
//           <h1 className="text-3xl font-bold text-coffee-800">
//             <FiMail className="inline mr-2" />
//             Push Notification via Email
//           </h1>
//           <div className="flex space-x-2">
//             <button 
//               onClick={() => setShowPreview(!showPreview)}
//               className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-md text-gray-700 transition"
//             >
//               {showPreview ? 'Hide Preview' : 'Show Preview'}
//             </button>
//           </div>
//         </div>

//         {/* Success Message */}
//         {sendSuccess && (
//           <div className="mb-6 p-4 bg-green-100 border border-green-400 text-green-700 rounded">
//             <FiCheckCircle className="inline mr-2" />
//             Notification {notification.scheduled ? 'scheduled' : 'sent'} successfully!
//           </div>
//         )}

//         <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
//           {/* Form Section */}
//           <div className="lg:col-span-2 bg-white rounded-lg shadow p-6">
//             <form onSubmit={handleSubmit}>
//               <div className="mb-6">
//                 <label className="block text-gray-700 font-medium mb-2" htmlFor="subject">
//                   Subject
//                 </label>
//                 <input
//                   type="text"
//                   id="subject"
//                   name="subject"
//                   value={notification.subject}
//                   onChange={handleChange}
//                   className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-coffee-500"
//                   placeholder="Enter notification subject"
//                   required
//                 />
//               </div>

//               <div className="mb-6">
//                 <label className="block text-gray-700 font-medium mb-2" htmlFor="message">
//                   Message
//                 </label>
//                 <textarea
//                   id="message"
//                   name="message"
//                   value={notification.message}
//                   onChange={handleChange}
//                   rows="6"
//                   className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-coffee-500"
//                   placeholder="Write your notification message here..."
//                   required
//                 ></textarea>
//               </div>

//               <div className="mb-6">
//                 <label className="block text-gray-700 font-medium mb-2">
//                   Recipients
//                 </label>
//                 <div className="grid grid-cols-2 gap-4">
//                   <label className="flex items-center space-x-2">
//                     <input
//                       type="radio"
//                       name="recipientType"
//                       value="all"
//                       checked={notification.recipientType === 'all'}
//                       onChange={handleChange}
//                       className="text-coffee-600"
//                     />
//                     <span>All Customers</span>
//                   </label>
//                   <label className="flex items-center space-x-2">
//                     <input
//                       type="radio"
//                       name="recipientType"
//                       value="loyal"
//                       checked={notification.recipientType === 'loyal'}
//                       onChange={handleChange}
//                       className="text-coffee-600"
//                     />
//                     <span>All Loyalty Members</span>
//                   </label>
//                   <label className="flex items-center space-x-2">
//                     <input
//                       type="radio"
//                       name="recipientType"
//                       value="silver"
//                       checked={notification.recipientType === 'silver'}
//                       onChange={handleChange}
//                       className="text-coffee-600"
//                     />
//                     <span>Silver Members</span>
//                   </label>
//                   <label className="flex items-center space-x-2">
//                     <input
//                       type="radio"
//                       name="recipientType"
//                       value="gold"
//                       checked={notification.recipientType === 'gold'}
//                       onChange={handleChange}
//                       className="text-coffee-600"
//                     />
//                     <span>Gold Members</span>
//                   </label>
//                   <label className="flex items-center space-x-2">
//                     <input
//                       type="radio"
//                       name="recipientType"
//                       value="platinum"
//                       checked={notification.recipientType === 'platinum'}
//                       onChange={handleChange}
//                       className="text-coffee-600"
//                     />
//                     <span>Platinum Members</span>
//                   </label>
//                   <label className="flex items-center space-x-2">
//                     <input
//                       type="radio"
//                       name="recipientType"
//                       value="inactive"
//                       checked={notification.recipientType === 'inactive'}
//                       onChange={handleChange}
//                       className="text-coffee-600"
//                     />
//                     <span>Inactive Customers</span>
//                   </label>
//                   <label className="flex items-center space-x-2">
//                     <input
//                       type="radio"
//                       name="recipientType"
//                       value="custom"
//                       checked={notification.recipientType === 'custom'}
//                       onChange={handleChange}
//                       className="text-coffee-600"
//                     />
//                     <span>Custom Selection</span>
//                   </label>
//                 </div>
//               </div>

//               <div className="mb-6">
//                 <label className="flex items-center space-x-2">
//                   <input
//                     type="checkbox"
//                     name="scheduled"
//                     checked={notification.scheduled}
//                     onChange={handleChange}
//                     className="text-coffee-600"
//                   />
//                   <span className="text-gray-700 font-medium">Schedule for later</span>
//                 </label>

//                 {notification.scheduled && (
//                   <div className="mt-4 grid grid-cols-2 gap-4">
//                     <div>
//                       <label className="block text-gray-700 mb-2" htmlFor="scheduleDate">
//                         Date
//                       </label>
//                       <input
//                         type="date"
//                         id="scheduleDate"
//                         name="scheduleDate"
//                         value={notification.scheduleDate}
//                         onChange={handleChange}
//                         min={new Date().toISOString().split('T')[0]}
//                         className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-coffee-500"
//                         required
//                       />
//                     </div>
//                     <div>
//                       <label className="block text-gray-700 mb-2" htmlFor="scheduleTime">
//                         Time
//                       </label>
//                       <input
//                         type="time"
//                         id="scheduleTime"
//                         name="scheduleTime"
//                         value={notification.scheduleTime}
//                         onChange={handleChange}
//                         className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-coffee-500"
//                         required
//                       />
//                     </div>
//                   </div>
//                 )}
//               </div>

//               <div className="flex justify-end space-x-4">
//                 <button
//                   type="button"
//                   className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-100 transition"
//                 >
//                   Save Draft
//                 </button>
//                 <button
//                   type="submit"
//                   disabled={isSending}
//                   className={`px-6 py-2 rounded-md text-white ${isSending ? 'bg-coffee-400' : 'bg-coffee-600 hover:bg-coffee-700'} transition flex items-center`}
//                 >
//                   {isSending ? (
//                     <>
//                       <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
//                         <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
//                         <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
//                       </svg>
//                       {notification.scheduled ? 'Scheduling...' : 'Sending...'}
//                     </>
//                   ) : (
//                     <>
//                       <FiMail className="mr-2" />
//                       {notification.scheduled ? 'Schedule Notification' : 'Send Notification'}
//                     </>
//                   )}
//                 </button>
//               </div>
//             </form>
//           </div>

//           {/* Preview/Stats Section */}
//           <div className="space-y-6">
//             {showPreview ? (
//               <div className="bg-white rounded-lg shadow p-6">
//                 <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
//                   <FiMail className="mr-2" />
//                   Email Preview
//                 </h2>
//                 <div className="border border-gray-200 rounded p-4">
//                   <div className="border-b border-gray-200 pb-2 mb-4">
//                     <p className="font-medium">{notification.subject || "(No subject)"}</p>
//                     <p className="text-sm text-gray-500">to: {(() => {
//                       switch(notification.recipientType) {
//                         case 'all': return 'All Customers';
//                         case 'loyal': return 'All Loyalty Members';
//                         case 'silver': return 'Silver Members';
//                         case 'gold': return 'Gold Members';
//                         case 'platinum': return 'Platinum Members';
//                         case 'inactive': return 'Inactive Customers';
//                         case 'custom': return 'Selected Customers';
//                         default: return 'Recipients';
//                       }
//                     })()}</p>
//                   </div>
//                   <div className="whitespace-pre-line text-gray-700">
//                     {notification.message || "Your message will appear here..."}
//                   </div>
//                 </div>
//               </div>
//             ) : (
//               <div className="bg-white rounded-lg shadow p-6">
//                 <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
//                   <FiUsers className="mr-2" />
//                   Recipient Stats
//                 </h2>
//                 <div className="space-y-4">
//                   <div className="flex justify-between items-center">
//                     <span className="text-gray-600">All Customers</span>
//                     <span className="font-medium">{recipientStats.all.toLocaleString()}</span>
//                   </div>
//                   <div className="flex justify-between items-center">
//                     <span className="text-gray-600">All Loyalty Members</span>
//                     <span className="font-medium">{recipientStats.loyal.toLocaleString()}</span>
//                   </div>
//                   <div className="flex justify-between items-center">
//                     <span className="text-gray-600">Silver Members</span>
//                     <span className="font-medium">{recipientStats.silver.toLocaleString()}</span>
//                   </div>
//                   <div className="flex justify-between items-center">
//                     <span className="text-gray-600">Gold Members</span>
//                     <span className="font-medium">{recipientStats.gold.toLocaleString()}</span>
//                   </div>
//                   <div className="flex justify-between items-center">
//                     <span className="text-gray-600">Platinum Members</span>
//                     <span className="font-medium">{recipientStats.platinum.toLocaleString()}</span>
//                   </div>
//                   <div className="flex justify-between items-center">
//                     <span className="text-gray-600">Inactive (30+ days)</span>
//                     <span className="font-medium">{recipientStats.inactive.toLocaleString()}</span>
//                   </div>
//                   <div className="pt-4 border-t border-gray-200">
//                     <p className="text-sm text-gray-500">Based on your selection:</p>
//                     <p className="text-lg font-bold text-coffee-700">
//                       {(() => {
//                         switch(notification.recipientType) {
//                           case 'all': return `${recipientStats.all.toLocaleString()} recipients`;
//                           case 'loyal': return `${recipientStats.loyal.toLocaleString()} recipients`;
//                           case 'silver': return `${recipientStats.silver.toLocaleString()} recipients`;
//                           case 'gold': return `${recipientStats.gold.toLocaleString()} recipients`;
//                           case 'platinum': return `${recipientStats.platinum.toLocaleString()} recipients`;
//                           case 'inactive': return `${recipientStats.inactive.toLocaleString()} recipients`;
//                           case 'custom': return 'Custom selection required';
//                           default: return 'Select recipient type';
//                         }
//                       })()}
//                     </p>
//                   </div>
//                 </div>
//               </div>
//             )}

//             {/* Scheduled Notifications */}
//             <div className="bg-white rounded-lg shadow p-6">
//               <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
//                 <FiCalendar className="mr-2" />
//                 Scheduled Notifications
//               </h2>
//               <div className="space-y-3">
//                 {scheduledNotifications.length > 0 ? (
//                   scheduledNotifications.map((item) => (
//                     <div key={item.id} className="flex justify-between items-center p-2 bg-gray-50 rounded">
//                       <div>
//                         <p className="font-medium">{item.notifications.subject}</p>
//                         <p className="text-sm text-gray-500">
//                           {new Date(item.send_at).toLocaleDateString('en-US', {
//                             month: 'short',
//                             day: 'numeric',
//                             year: 'numeric',
//                             hour: '2-digit',
//                             minute: '2-digit'
//                           })}
//                         </p>
//                       </div>
//                       <button 
//                         onClick={() => handleDeleteScheduled(item.id)}
//                         className="text-red-500 hover:text-red-700"
//                         title="Cancel scheduled notification"
//                       >
//                         <FiXCircle />
//                       </button>
//                     </div>
//                   ))
//                 ) : (
//                   <p className="text-gray-500 text-center py-4">No scheduled notifications</p>
//                 )}
//                 <div className="text-center pt-2">
//                   <button className="text-sm text-coffee-600 hover:text-coffee-800 font-medium">
//                     View All
//                   </button>
//                 </div>
//               </div>
//             </div>

//             {/* Notification Settings */}
//             <div className="bg-white rounded-lg shadow p-6">
//               <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
//                 <FiSettings className="mr-2" />
//                 Notification Settings
//               </h2>
//               <div className="space-y-3">
//                 <label className="flex items-center justify-between">
//                   <span className="text-gray-700">Email Notifications</span>
//                   <div className="relative inline-block w-10 mr-2 align-middle select-none">
//                     <input 
//                       type="checkbox" 
//                       id="toggle-email" 
//                       className="sr-only" 
//                       checked={notificationSettings.email_enabled}
//                       onChange={(e) => handleSettingChange('email_enabled', e.target.checked)}
//                     />
//                     <div className={`block w-10 h-6 rounded-full ${notificationSettings.email_enabled ? 'bg-coffee-600' : 'bg-gray-300'}`}></div>
//                     <div className={`dot absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition ${notificationSettings.email_enabled ? 'transform translate-x-4' : ''}`}></div>
//                   </div>
//                 </label>
//                 <label className="flex items-center justify-between">
//                   <span className="text-gray-700">SMS Notifications</span>
//                   <div className="relative inline-block w-10 mr-2 align-middle select-none">
//                     <input 
//                       type="checkbox" 
//                       id="toggle-sms" 
//                       className="sr-only" 
//                       checked={notificationSettings.sms_enabled}
//                       onChange={(e) => handleSettingChange('sms_enabled', e.target.checked)}
//                     />
//                     <div className={`block w-10 h-6 rounded-full ${notificationSettings.sms_enabled ? 'bg-coffee-600' : 'bg-gray-300'}`}></div>
//                     <div className={`dot absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition ${notificationSettings.sms_enabled ? 'transform translate-x-4' : ''}`}></div>
//                   </div>
//                 </label>
//                 <label className="flex items-center justify-between">
//                   <span className="text-gray-700">Push Notifications</span>
//                   <div className="relative inline-block w-10 mr-2 align-middle select-none">
//                     <input 
//                       type="checkbox" 
//                       id="toggle-push" 
//                       className="sr-only" 
//                       checked={notificationSettings.push_enabled}
//                       onChange={(e) => handleSettingChange('push_enabled', e.target.checked)}
//                     />
//                     <div className={`block w-10 h-6 rounded-full ${notificationSettings.push_enabled ? 'bg-coffee-600' : 'bg-gray-300'}`}></div>
//                     <div className={`dot absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition ${notificationSettings.push_enabled ? 'transform translate-x-4' : ''}`}></div>
//                   </div>
//                 </label>
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default PushNotificationPage;

import { useState, useEffect } from 'react';
import { FiMail, FiUsers, FiCalendar, FiCheckCircle, FiXCircle, FiSettings, FiEdit, FiTrash2 } from 'react-icons/fi';
import { supabase } from '../supabase';

const PushNotificationPage = () => {
  // State for form
  const [notification, setNotification] = useState({
    subject: '',
    message: '',
    recipientType: 'all',
    scheduled: false,
    scheduleDate: '',
    scheduleTime: '',
  });

  // State for editing
  const [editingId, setEditingId] = useState(null);
  
  // State for data from Supabase
  const [scheduledNotifications, setScheduledNotifications] = useState([]);
  const [sentNotifications, setSentNotifications] = useState([]);
  const [notificationSettings, setNotificationSettings] = useState({
    email_enabled: true,
    sms_enabled: false,
    push_enabled: false
  });
  const [recipientStats, setRecipientStats] = useState({
    all: 0,
    loyal: 0,
    inactive: 0,
    silver: 0,
    gold: 0,
    platinum: 0
  });

  // State for UI
  const [showPreview, setShowPreview] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [sendSuccess, setSendSuccess] = useState(false);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('scheduled'); // 'scheduled' or 'sent'

  // Load initial data
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Get scheduled notifications with full notification details
      const { data: scheduledData, error: scheduledError } = await supabase
        .from('scheduled_notifications')
        .select(`
          id,
          send_at,
          status,
          notifications (
            id,
            subject,
            message,
            recipient_type,
            scheduled,
            schedule_date,
            status
          )
        `)
        .order('send_at', { ascending: true });
      
      if (!scheduledError) {
        setScheduledNotifications(scheduledData);
      }

      // Get sent notifications
      const { data: sentData, error: sentError } = await supabase
        .from('notifications')
        .select('*')
        .eq('status', 'sent')
        .order('created_at', { ascending: false })
        .limit(5);
      
      if (!sentError) {
        setSentNotifications(sentData);
      }

      // Get notification settings
      const { data: settingsData, error: settingsError } = await supabase
        .from('notification_settings')
        .select('*')
        .single();
      
      if (!settingsError && settingsData) {
        setNotificationSettings(settingsData);
      }

      // Get recipient stats
      const { data: statsData, error: statsError } = await supabase
        .rpc('get_recipient_stats');
      
      if (!statsError && statsData) {
        setRecipientStats(statsData);
      }

    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Handle input changes
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setNotification(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  // Handle form submission (create or update)
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSending(true);
    
    try {
      // Format scheduled time if scheduled
      let scheduledAt = null;
      if (notification.scheduled && notification.scheduleDate && notification.scheduleTime) {
        scheduledAt = new Date(`${notification.scheduleDate}T${notification.scheduleTime}`).toISOString();
      }

      if (editingId) {
        // Update existing notification
        const { data, error } = await supabase
          .from('notifications')
          .update({
            subject: notification.subject,
            message: notification.message,
            recipient_type: notification.recipientType,
            scheduled: notification.scheduled,
            schedule_date: scheduledAt,
            status: notification.scheduled ? 'scheduled' : 'sent',
            updated_at: new Date().toISOString()
          })
          .eq('id', editingId)
          .select()
          .single();

        if (error) throw error;

        // If scheduled, update scheduled notification
        if (notification.scheduled && scheduledAt) {
          await supabase
            .from('scheduled_notifications')
            .upsert({
              notification_id: data.id,
              send_at: scheduledAt,
              status: 'pending'
            });
        } else {
          // If changed from scheduled to immediate, delete scheduled record
          await supabase
            .from('scheduled_notifications')
            .delete()
            .eq('notification_id', editingId);
        }

      } else {
        // Create new notification
        const { data, error } = await supabase
          .from('notifications')
          .insert([{
            subject: notification.subject,
            message: notification.message,
            recipient_type: notification.recipientType,
            scheduled: notification.scheduled,
            schedule_date: scheduledAt,
            status: notification.scheduled ? 'scheduled' : 'sent'
          }])
          .select()
          .single();

        if (error) throw error;

        // If scheduled, create scheduled notification
        if (notification.scheduled && scheduledAt) {
          await supabase
            .from('scheduled_notifications')
            .insert([{
              notification_id: data.id,
              send_at: scheduledAt,
              status: 'pending'
            }]);
        }
      }

      setSendSuccess(true);
      setTimeout(() => setSendSuccess(false), 3000);
      
      // Reset form and editing state
      setNotification({
        subject: '',
        message: '',
        recipientType: 'all',
        scheduled: false,
        scheduleDate: '',
        scheduleTime: '',
      });
      setEditingId(null);

      // Refresh data
      fetchData();

    } catch (error) {
      console.error('Error sending notification:', error);
    } finally {
      setIsSending(false);
    }
  };

  // Handle editing a notification
  const handleEdit = (notification) => {
    setEditingId(notification.id);
    setNotification({
      subject: notification.subject,
      message: notification.message,
      recipientType: notification.recipient_type,
      scheduled: notification.scheduled,
      scheduleDate: notification.schedule_date ? notification.schedule_date.split('T')[0] : '',
      scheduleTime: notification.schedule_date ? notification.schedule_date.split('T')[1].substring(0, 5) : '',
    });
    // Scroll to form
    document.getElementById('notification-form').scrollIntoView({ behavior: 'smooth' });
  };

  // Handle deleting a notification
  const handleDelete = async (id, isScheduled = false) => {
    if (window.confirm('Are you sure you want to delete this notification?')) {
      try {
        if (isScheduled) {
          // Delete from scheduled notifications first
          await supabase
            .from('scheduled_notifications')
            .delete()
            .eq('id', id);
        }
        
        // Then delete the notification itself
        await supabase
          .from('notifications')
          .delete()
          .eq('id', id);
        
        fetchData(); // Refresh data
      } catch (error) {
        console.error('Error deleting notification:', error);
      }
    }
  };

  // Handle sending a scheduled notification immediately
  const handleSendNow = async (notificationId) => {
    if (window.confirm('Send this notification now?')) {
      try {
        // Update notification status to sent
        await supabase
          .from('notifications')
          .update({
            status: 'sent',
            scheduled: false,
            schedule_date: null,
            sent_at: new Date().toISOString()
          })
          .eq('id', notificationId);
        
        // Delete from scheduled notifications
        await supabase
          .from('scheduled_notifications')
          .delete()
          .eq('notification_id', notificationId);
        
        fetchData(); // Refresh data
      } catch (error) {
        console.error('Error sending notification now:', error);
      }
    }
  };

  // Handle setting changes
  const handleSettingChange = async (field, value) => {
    try {
      const newSettings = { ...notificationSettings, [field]: value };
      setNotificationSettings(newSettings);
      
      await supabase
        .from('notification_settings')
        .upsert({
          ...newSettings,
          updated_at: new Date().toISOString()
        });
    } catch (error) {
      console.error('Error updating settings:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-coffee-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-coffee-800">
            <FiMail className="inline mr-2" />
            Push Notification via Email
          </h1>
          <div className="flex space-x-2">
            <button 
              onClick={() => setShowPreview(!showPreview)}
              className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-md text-gray-700 transition"
            >
              {showPreview ? 'Hide Preview' : 'Show Preview'}
            </button>
          </div>
        </div>

        {/* Success Message */}
        {sendSuccess && (
          <div className="mb-6 p-4 bg-green-100 border border-green-400 text-green-700 rounded">
            <FiCheckCircle className="inline mr-2" />
            Notification {notification.scheduled ? 'scheduled' : 'sent'} successfully!
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Form Section */}
          <div className="lg:col-span-2 bg-white rounded-lg shadow p-6" id="notification-form">
            <form onSubmit={handleSubmit}>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold text-gray-800">
                  {editingId ? 'Edit Notification' : 'Create New Notification'}
                </h2>
                {editingId && (
                  <button
                    type="button"
                    onClick={() => {
                      setEditingId(null);
                      setNotification({
                        subject: '',
                        message: '',
                        recipientType: 'all',
                        scheduled: false,
                        scheduleDate: '',
                        scheduleTime: '',
                      });
                    }}
                    className="text-sm text-gray-500 hover:text-gray-700"
                  >
                    Cancel Edit
                  </button>
                )}
              </div>

              <div className="mb-6">
                <label className="block text-gray-700 font-medium mb-2" htmlFor="subject">
                  Subject
                </label>
                <input
                  type="text"
                  id="subject"
                  name="subject"
                  value={notification.subject}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-coffee-500"
                  placeholder="Enter notification subject"
                  required
                />
              </div>

              <div className="mb-6">
                <label className="block text-gray-700 font-medium mb-2" htmlFor="message">
                  Message
                </label>
                <textarea
                  id="message"
                  name="message"
                  value={notification.message}
                  onChange={handleChange}
                  rows="6"
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-coffee-500"
                  placeholder="Write your notification message here..."
                  required
                ></textarea>
              </div>

              <div className="mb-6">
                <label className="block text-gray-700 font-medium mb-2">
                  Recipients
                </label>
                <div className="grid grid-cols-2 gap-4">
                  <label className="flex items-center space-x-2">
                    <input
                      type="radio"
                      name="recipientType"
                      value="all"
                      checked={notification.recipientType === 'all'}
                      onChange={handleChange}
                      className="text-coffee-600"
                    />
                    <span>All Customers</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <input
                      type="radio"
                      name="recipientType"
                      value="loyal"
                      checked={notification.recipientType === 'loyal'}
                      onChange={handleChange}
                      className="text-coffee-600"
                    />
                    <span>All Loyalty Members</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <input
                      type="radio"
                      name="recipientType"
                      value="silver"
                      checked={notification.recipientType === 'silver'}
                      onChange={handleChange}
                      className="text-coffee-600"
                    />
                    <span>Silver Members</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <input
                      type="radio"
                      name="recipientType"
                      value="gold"
                      checked={notification.recipientType === 'gold'}
                      onChange={handleChange}
                      className="text-coffee-600"
                    />
                    <span>Gold Members</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <input
                      type="radio"
                      name="recipientType"
                      value="platinum"
                      checked={notification.recipientType === 'platinum'}
                      onChange={handleChange}
                      className="text-coffee-600"
                    />
                    <span>Platinum Members</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <input
                      type="radio"
                      name="recipientType"
                      value="inactive"
                      checked={notification.recipientType === 'inactive'}
                      onChange={handleChange}
                      className="text-coffee-600"
                    />
                    <span>Inactive Customers</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <input
                      type="radio"
                      name="recipientType"
                      value="custom"
                      checked={notification.recipientType === 'custom'}
                      onChange={handleChange}
                      className="text-coffee-600"
                    />
                    <span>Custom Selection</span>
                  </label>
                </div>
              </div>

              <div className="mb-6">
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    name="scheduled"
                    checked={notification.scheduled}
                    onChange={handleChange}
                    className="text-coffee-600"
                  />
                  <span className="text-gray-700 font-medium">Schedule for later</span>
                </label>

                {notification.scheduled && (
                  <div className="mt-4 grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-gray-700 mb-2" htmlFor="scheduleDate">
                        Date
                      </label>
                      <input
                        type="date"
                        id="scheduleDate"
                        name="scheduleDate"
                        value={notification.scheduleDate}
                        onChange={handleChange}
                        min={new Date().toISOString().split('T')[0]}
                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-coffee-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-gray-700 mb-2" htmlFor="scheduleTime">
                        Time
                      </label>
                      <input
                        type="time"
                        id="scheduleTime"
                        name="scheduleTime"
                        value={notification.scheduleTime}
                        onChange={handleChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-coffee-500"
                        required
                      />
                    </div>
                  </div>
                )}
              </div>

              <div className="flex justify-end space-x-4">
                <button
                  type="button"
                  className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-100 transition"
                  onClick={() => {
                    setNotification({
                      subject: '',
                      message: '',
                      recipientType: 'all',
                      scheduled: false,
                      scheduleDate: '',
                      scheduleTime: '',
                    });
                    setEditingId(null);
                  }}
                >
                  Clear
                </button>
                <button
                  type="submit"
                  disabled={isSending}
                  className={`px-6 py-2 rounded-md text-white ${isSending ? 'bg-coffee-400' : 'bg-coffee-600 hover:bg-coffee-700'} transition flex items-center`}
                >
                  {isSending ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      {notification.scheduled ? 'Scheduling...' : 'Sending...'}
                    </>
                  ) : (
                    <>
                      <FiMail className="mr-2" />
                      {notification.scheduled ? 
                        (editingId ? 'Update Scheduled Notification' : 'Schedule Notification') : 
                        (editingId ? 'Update and Send Now' : 'Send Notification')}
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>

          {/* Preview/Stats Section */}
          <div className="space-y-6">
            {showPreview ? (
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
                  <FiMail className="mr-2" />
                  Email Preview
                </h2>
                <div className="border border-gray-200 rounded p-4">
                  <div className="border-b border-gray-200 pb-2 mb-4">
                    <p className="font-medium">{notification.subject || "(No subject)"}</p>
                    <p className="text-sm text-gray-500">to: {(() => {
                      switch(notification.recipientType) {
                        case 'all': return 'All Customers';
                        case 'loyal': return 'All Loyalty Members';
                        case 'silver': return 'Silver Members';
                        case 'gold': return 'Gold Members';
                        case 'platinum': return 'Platinum Members';
                        case 'inactive': return 'Inactive Customers';
                        case 'custom': return 'Selected Customers';
                        default: return 'Recipients';
                      }
                    })()}</p>
                  </div>
                  <div className="whitespace-pre-line text-gray-700">
                    {notification.message || "Your message will appear here..."}
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
                  <FiUsers className="mr-2" />
                  Recipient Stats
                </h2>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">All Customers</span>
                    <span className="font-medium">{recipientStats.all.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">All Loyalty Members</span>
                    <span className="font-medium">{recipientStats.loyal.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Silver Members</span>
                    <span className="font-medium">{recipientStats.silver.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Gold Members</span>
                    <span className="font-medium">{recipientStats.gold.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Platinum Members</span>
                    <span className="font-medium">{recipientStats.platinum.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Inactive (30+ days)</span>
                    <span className="font-medium">{recipientStats.inactive.toLocaleString()}</span>
                  </div>
                  <div className="pt-4 border-t border-gray-200">
                    <p className="text-sm text-gray-500">Based on your selection:</p>
                    <p className="text-lg font-bold text-coffee-700">
                      {(() => {
                        switch(notification.recipientType) {
                          case 'all': return `${recipientStats.all.toLocaleString()} recipients`;
                          case 'loyal': return `${recipientStats.loyal.toLocaleString()} recipients`;
                          case 'silver': return `${recipientStats.silver.toLocaleString()} recipients`;
                          case 'gold': return `${recipientStats.gold.toLocaleString()} recipients`;
                          case 'platinum': return `${recipientStats.platinum.toLocaleString()} recipients`;
                          case 'inactive': return `${recipientStats.inactive.toLocaleString()} recipients`;
                          case 'custom': return 'Custom selection required';
                          default: return 'Select recipient type';
                        }
                      })()}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Notifications Tabs */}
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <div className="flex border-b">
                <button
                  className={`px-4 py-3 font-medium ${activeTab === 'scheduled' ? 'text-coffee-600 border-b-2 border-coffee-600' : 'text-gray-500'}`}
                  onClick={() => setActiveTab('scheduled')}
                >
                  <FiCalendar className="inline mr-2" />
                  Scheduled
                </button>
                <button
                  className={`px-4 py-3 font-medium ${activeTab === 'sent' ? 'text-coffee-600 border-b-2 border-coffee-600' : 'text-gray-500'}`}
                  onClick={() => setActiveTab('sent')}
                >
                  <FiCheckCircle className="inline mr-2" />
                  Sent
                </button>
              </div>
              
              <div className="p-4">
                {activeTab === 'scheduled' ? (
                  <div className="space-y-3">
                    {scheduledNotifications.length > 0 ? (
                      scheduledNotifications.map((item) => (
                        <div key={item.id} className="p-3 bg-gray-50 rounded border border-gray-200">
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <h3 className="font-medium text-gray-800">{item.notifications.subject}</h3>
                              <p className="text-sm text-gray-600 mb-2">{item.notifications.message.substring(0, 50)}...</p>
                              <div className="flex items-center text-sm text-gray-500">
                                <FiUsers className="mr-1" />
                                <span className="mr-3">
                                  {(() => {
                                    switch(item.notifications.recipient_type) {
                                      case 'all': return 'All Customers';
                                      case 'loyal': return 'Loyalty Members';
                                      case 'silver': return 'Silver Members';
                                      case 'gold': return 'Gold Members';
                                      case 'platinum': return 'Platinum Members';
                                      case 'inactive': return 'Inactive Customers';
                                      default: return item.notifications.recipient_type;
                                    }
                                  })()}
                                </span>
                                <FiCalendar className="mr-1" />
                                <span>
                                  {new Date(item.send_at).toLocaleString('en-US', {
                                    month: 'short',
                                    day: 'numeric',
                                    year: 'numeric',
                                    hour: '2-digit',
                                    minute: '2-digit'
                                  })}
                                </span>
                              </div>
                            </div>
                            <div className="flex space-x-2">
                              <button
                                onClick={() => handleEdit(item.notifications)}
                                className="text-blue-500 hover:text-blue-700"
                                title="Edit"
                              >
                                <FiEdit />
                              </button>
                              <button
                                onClick={() => handleSendNow(item.notifications.id)}
                                className="text-green-500 hover:text-green-700"
                                title="Send now"
                              >
                                <FiMail />
                              </button>
                              <button
                                onClick={() => handleDelete(item.notifications.id, true)}
                                className="text-red-500 hover:text-red-700"
                                title="Delete"
                              >
                                <FiTrash2 />
                              </button>
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-gray-500 text-center py-4">No scheduled notifications</p>
                    )}
                  </div>
                ) : (
                  <div className="space-y-3">
                    {sentNotifications.length > 0 ? (
                      sentNotifications.map((item) => (
                        <div key={item.id} className="p-3 bg-gray-50 rounded border border-gray-200">
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <h3 className="font-medium text-gray-800">{item.subject}</h3>
                              <p className="text-sm text-gray-600 mb-2">{item.message.substring(0, 50)}...</p>
                              <div className="flex items-center text-sm text-gray-500">
                                <FiUsers className="mr-1" />
                                <span>
                                  {(() => {
                                    switch(item.recipient_type) {
                                      case 'all': return 'All Customers';
                                      case 'loyal': return 'Loyalty Members';
                                      case 'silver': return 'Silver Members';
                                      case 'gold': return 'Gold Members';
                                      case 'platinum': return 'Platinum Members';
                                      case 'inactive': return 'Inactive Customers';
                                      default: return item.recipient_type;
                                    }
                                  })()}
                                </span>
                              </div>
                            </div>
                            <div className="flex space-x-2">
                              <button
                                onClick={() => handleDelete(item.id)}
                                className="text-red-500 hover:text-red-700"
                                title="Delete"
                              >
                                <FiTrash2 />
                              </button>
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-gray-500 text-center py-4">No sent notifications</p>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Notification Settings */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
                <FiSettings className="mr-2" />
                Notification Settings
              </h2>
              <div className="space-y-3">
                <label className="flex items-center justify-between">
                  <span className="text-gray-700">Email Notifications</span>
                  <div className="relative inline-block w-10 mr-2 align-middle select-none">
                    <input 
                      type="checkbox" 
                      id="toggle-email" 
                      className="sr-only" 
                      checked={notificationSettings.email_enabled}
                      onChange={(e) => handleSettingChange('email_enabled', e.target.checked)}
                    />
                    <div className={`block w-10 h-6 rounded-full ${notificationSettings.email_enabled ? 'bg-coffee-600' : 'bg-gray-300'}`}></div>
                    <div className={`dot absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition ${notificationSettings.email_enabled ? 'transform translate-x-4' : ''}`}></div>
                  </div>
                </label>
                <label className="flex items-center justify-between">
                  <span className="text-gray-700">SMS Notifications</span>
                  <div className="relative inline-block w-10 mr-2 align-middle select-none">
                    <input 
                      type="checkbox" 
                      id="toggle-sms" 
                      className="sr-only" 
                      checked={notificationSettings.sms_enabled}
                      onChange={(e) => handleSettingChange('sms_enabled', e.target.checked)}
                    />
                    <div className={`block w-10 h-6 rounded-full ${notificationSettings.sms_enabled ? 'bg-coffee-600' : 'bg-gray-300'}`}></div>
                    <div className={`dot absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition ${notificationSettings.sms_enabled ? 'transform translate-x-4' : ''}`}></div>
                  </div>
                </label>
                <label className="flex items-center justify-between">
                  <span className="text-gray-700">Push Notifications</span>
                  <div className="relative inline-block w-10 mr-2 align-middle select-none">
                    <input 
                      type="checkbox" 
                      id="toggle-push" 
                      className="sr-only" 
                      checked={notificationSettings.push_enabled}
                      onChange={(e) => handleSettingChange('push_enabled', e.target.checked)}
                    />
                    <div className={`block w-10 h-6 rounded-full ${notificationSettings.push_enabled ? 'bg-coffee-600' : 'bg-gray-300'}`}></div>
                    <div className={`dot absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition ${notificationSettings.push_enabled ? 'transform translate-x-4' : ''}`}></div>
                  </div>
                </label>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PushNotificationPage;