import { useState, useEffect } from 'react';
import { FiMail, FiUsers, FiCalendar, FiCheckCircle, FiXCircle, FiSettings, FiEdit, FiTrash2, FiSave } from 'react-icons/fi';
import { supabase } from '../supabase';

const PushNotificationPage = () => {
  // Form state
  const [notification, setNotification] = useState({
    subject: '',
    message: '',
    recipientType: 'all',
    scheduled: false,
    scheduleDate: '',
    scheduleTime: '',
  });

  // Data states
  const [draftNotifications, setDraftNotifications] = useState([]);
  const [scheduledNotifications, setScheduledNotifications] = useState([]);
  const [sentNotifications, setSentNotifications] = useState([]);
  const [notificationSettings, setNotificationSettings] = useState({
    email_enabled: true,
    sms_enabled: false,
    push_enabled: false
  });
  const [recipientStats, setRecipientStats] = useState({
    all: 10000,
    loyal: 2000,
    inactive: 1500,
    silver: 3000,
    gold: 2000,
    platinum: 1500
  });

  // UI states
  const [editingId, setEditingId] = useState(null);
  const [showPreview, setShowPreview] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [sendSuccess, setSendSuccess] = useState(false);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('scheduled');

  // Fetch all data
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Fetch drafts
      const { data: draftData, error: draftError } = await supabase
        .from('notifications')
        .select('*')
        .eq('status', 'draft')
        .order('created_at', { ascending: false });

      if (!draftError) setDraftNotifications(draftData);

      // Fetch scheduled
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

      if (!scheduledError) setScheduledNotifications(scheduledData);

      // Fetch sent
      const { data: sentData, error: sentError } = await supabase
        .from('notifications')
        .select('*')
        .eq('status', 'sent')
        .order('created_at', { ascending: false });

      if (!sentError) setSentNotifications(sentData);

      // Fetch settings
      const { data: settingsData, error: settingsError } = await supabase
        .from('notification_settings')
        .select('*')
        .single();

      if (!settingsError) setNotificationSettings(settingsData);

      // Fetch stats
      const { data: statsData, error: statsError } = await supabase
        .rpc('get_recipient_stats');

      if (!statsError) setRecipientStats(statsData);

    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setNotification(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSending(true);
    
    try {
      const scheduledAt = notification.scheduled && notification.scheduleDate && notification.scheduleTime 
        ? new Date(`${notification.scheduleDate}T${notification.scheduleTime}`).toISOString() 
        : null;

      if (editingId) {
        // Update existing
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

        if (notification.scheduled && scheduledAt) {
          await supabase
            .from('scheduled_notifications')
            .upsert({
              notification_id: data.id,
              send_at: scheduledAt,
              status: 'pending'
            });
        } else {
          await supabase
            .from('scheduled_notifications')
            .delete()
            .eq('notification_id', editingId);
        }

      } else {
        // Create new
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
      
      resetForm();
      fetchData();

    } catch (error) {
      console.error('Error:', error);
    } finally {
      setIsSending(false);
    }
  };

  const handleSaveDraft = async () => {
    try {
      const { data, error } = await supabase
        .from('notifications')
        .insert([{
          subject: notification.subject,
          message: notification.message,
          recipient_type: notification.recipientType,
          scheduled: true,
          status: 'draft',
          created_at: new Date().toISOString()
        }])
        .select()
        .single();

      if (error) throw error;

      await supabase
        .from('scheduled_notifications')
        .insert([{
          notification_id: data.id,
          send_at: new Date().toISOString(),
          status: 'draft'
        }]);

      fetchData();
      resetForm();
      alert('Draft saved successfully!');
    } catch (error) {
      console.error('Error saving draft:', error);
      alert('Failed to save draft');
    }
  };

  const handleSendNow = async (notificationId, isDraft = false) => {
    if (window.confirm('Send this notification now?')) {
      try {
        await supabase
          .from('notifications')
          .update({
            status: 'sent',
            scheduled: false,
            schedule_date: null,
            sent_at: new Date().toISOString()
          })
          .eq('id', notificationId);
        
        await supabase
          .from('scheduled_notifications')
          .delete()
          .eq('notification_id', notificationId);
        
        fetchData();
      } catch (error) {
        console.error('Error sending now:', error);
      }
    }
  };

  const handleEdit = (notification) => {
    setEditingId(notification.id);
    setNotification({
      subject: notification.subject,
      message: notification.message,
      recipientType: notification.recipient_type,
      scheduled: notification.scheduled,
      scheduleDate: notification.schedule_date?.split('T')[0] || '',
      scheduleTime: notification.schedule_date?.split('T')[1]?.substring(0, 5) || '',
    });
    document.getElementById('notification-form').scrollIntoView({ behavior: 'smooth' });
  };

  const handleDelete = async (id, isScheduled = false) => {
    if (window.confirm('Are you sure you want to delete?')) {
      try {
        if (isScheduled) {
          await supabase
            .from('scheduled_notifications')
            .delete()
            .eq('id', id);
        }
        
        await supabase
          .from('notifications')
          .delete()
          .eq('id', id);
        
        fetchData();
      } catch (error) {
        console.error('Error deleting:', error);
      }
    }
  };

  const resetForm = () => {
    setNotification({
      subject: '',
      message: '',
      recipientType: 'all',
      scheduled: false,
      scheduleDate: '',
      scheduleTime: '',
    });
    setEditingId(null);
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
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-coffee-800">
            <FiMail className="inline mr-2" />
            Push Notification Manager
          </h1>
          <button 
            onClick={() => setShowPreview(!showPreview)}
            className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-md text-gray-700 transition"
          >
            {showPreview ? 'Hide Preview' : 'Show Preview'}
          </button>
        </div>

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
                    onClick={resetForm}
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
                  placeholder="Notification subject"
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
                  placeholder="Write your message here..."
                  required
                ></textarea>
              </div>

              <div className="mb-6">
                <label className="block text-gray-700 font-medium mb-2">
                  Recipients
                </label>
                <div className="grid grid-cols-2 gap-4">
                  {['all', 'loyal', 'silver', 'gold', 'platinum', 'inactive', 'custom'].map((type) => (
                    <label key={type} className="flex items-center space-x-2">
                      <input
                        type="radio"
                        name="recipientType"
                        value={type}
                        checked={notification.recipientType === type}
                        onChange={handleChange}
                        className="text-coffee-600"
                      />
                      <span>
                        {type === 'all' && 'All Customers'}
                        {type === 'loyal' && 'Loyalty Members'}
                        {type === 'silver' && 'Silver Members'}
                        {type === 'gold' && 'Gold Members'}
                        {type === 'platinum' && 'Platinum Members'}
                        {type === 'inactive' && 'Inactive Customers'}
                        {type === 'custom' && 'Custom Selection'}
                      </span>
                    </label>
                  ))}
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

              <div className="flex justify-end space-x-4 sticky bottom-0 bg-white py-4 border-t">
                <button
                  type="button"
                  className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-100 transition"
                  onClick={resetForm}
                >
                  Clear
                </button>
                <button
                  type="button"
                  className="px-6 py-2 bg-gray-100 hover:bg-gray-200 rounded-md text-gray-700 transition flex items-center"
                  onClick={handleSaveDraft}
                >
                  <FiSave className="mr-2" /> Save Draft
                </button>
                <button
                  type="submit"
                  disabled={isSending}
                  className={`px-6 py-2 rounded-md text-white ${
                    isSending ? 'bg-coffee-400' : 'bg-coffee-600 hover:bg-coffee-700'
                  } transition flex items-center min-w-[180px] justify-center`}
                >
                  {isSending ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Processing...
                    </>
                  ) : (
                    <>
                      <FiMail className="mr-2" />
                      {notification.scheduled ? 
                        (editingId ? 'Update Schedule' : 'Schedule') : 
                        (editingId ? 'Update & Send' : 'Send Now')}
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
                        case 'loyal': return 'Loyalty Members';
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
                  {Object.entries(recipientStats).map(([key, value]) => (
                    <div key={key} className="flex justify-between items-center">
                      <span className="text-gray-600 capitalize">
                        {key === 'all' ? 'All Customers' : 
                         key === 'loyal' ? 'Loyalty Members' :
                         key === 'inactive' ? 'Inactive (30+ days)' : 
                         `${key} Members`}
                      </span>
                      <span className="font-medium">{value.toLocaleString()}</span>
                    </div>
                  ))}
                  <div className="pt-4 border-t border-gray-200">
                    <p className="text-sm text-gray-500">Based on your selection:</p>
                    <p className="text-lg font-bold text-coffee-700">
                      {(() => {
                        const type = notification.recipientType;
                        return type && recipientStats[type] 
                          ? `${recipientStats[type].toLocaleString()} recipients` 
                          : 'Select recipient type';
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
                    {[...draftNotifications, ...scheduledNotifications].length > 0 ? (
                      [...draftNotifications, ...scheduledNotifications].map((item) => (
                        <div key={item.id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                          <div className="p-4">
                            <div className="flex justify-between items-start">
                              <div className="flex-1">
                                <div className="flex items-center justify-between">
                                  <h3 className="font-medium text-gray-800 text-lg">{item.subject || item.notifications?.subject}</h3>
                                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                    item.status === 'draft' ? 'bg-gray-100 text-gray-800' : 'bg-yellow-100 text-yellow-800'
                                  }`}>
                                    {item.status === 'draft' ? 'Draft' : 'Scheduled'}
                                  </span>
                                </div>
                                <p className="text-sm text-gray-600 mt-1 mb-3 line-clamp-2">
                                  {item.message || item.notifications?.message}
                                </p>
                                
                                <div className="flex flex-wrap items-center gap-3 text-sm text-gray-500">
                                  <div className="flex items-center">
                                    <FiUsers className="mr-1.5" />
                                    <span>
                                      {(() => {
                                        const type = item.recipient_type || item.notifications?.recipient_type;
                                        switch(type) {
                                          case 'all': return 'All Customers';
                                          case 'loyal': return 'Loyalty Members';
                                          case 'silver': return 'Silver';
                                          case 'gold': return 'Gold';
                                          case 'platinum': return 'Platinum';
                                          case 'inactive': return 'Inactive';
                                          default: return type;
                                        }
                                      })()}
                                    </span>
                                  </div>
                                  
                                  {item.send_at && (
                                    <div className="flex items-center">
                                      <FiCalendar className="mr-1.5" />
                                      <span>
                                        {new Date(item.send_at).toLocaleString('en-US', {
                                          month: 'short',
                                          day: 'numeric',
                                          hour: '2-digit',
                                          minute: '2-digit'
                                        })}
                                      </span>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                          
                          <div className="bg-gray-50 px-4 py-3 flex justify-end space-x-3 border-t">
                            <button
                              onClick={() => handleEdit(item.status === 'draft' ? item : item.notifications)}
                              className="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                            >
                              <FiEdit className="mr-1.5" /> Edit
                            </button>
                            <button
                              onClick={() => handleSendNow(item.id, item.status === 'draft')}
                              className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm leading-4 font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700"
                            >
                              <FiMail className="mr-1.5" /> Send Now
                            </button>
                            <button
                              onClick={() => handleDelete(item.id, item.status !== 'draft')}
                              className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-red-600 hover:bg-red-700"
                            >
                              <FiTrash2 className="mr-1.5" /> Delete
                            </button>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-8">
                        <FiCalendar className="mx-auto h-12 w-12 text-gray-400" />
                        <h3 className="mt-2 text-sm font-medium text-gray-900">No scheduled notifications</h3>
                        <p className="mt-1 text-sm text-gray-500">Create a new notification or save as draft</p>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="space-y-3">
                    {sentNotifications.length > 0 ? (
                      sentNotifications.map((item) => (
                        <div key={item.id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                          <div className="p-4">
                            <div className="flex justify-between items-start">
                              <div className="flex-1">
                                <h3 className="font-medium text-gray-800 text-lg">{item.subject}</h3>
                                <p className="text-sm text-gray-600 mt-1 mb-3 line-clamp-2">
                                  {item.message}
                                </p>
                                
                                <div className="flex flex-wrap items-center gap-3 text-sm text-gray-500">
                                  <div className="flex items-center">
                                    <FiUsers className="mr-1.5" />
                                    <span>
                                      {(() => {
                                        switch(item.recipient_type) {
                                          case 'all': return 'All Customers';
                                          case 'loyal': return 'Loyalty Members';
                                          case 'silver': return 'Silver';
                                          case 'gold': return 'Gold';
                                          case 'platinum': return 'Platinum';
                                          case 'inactive': return 'Inactive';
                                          default: return item.recipient_type;
                                        }
                                      })()}
                                    </span>
                                  </div>
                                  
                                  {item.sent_at && (
                                    <div className="flex items-center">
                                      <FiCalendar className="mr-1.5" />
                                      <span>
                                        {new Date(item.sent_at).toLocaleString('en-US', {
                                          month: 'short',
                                          day: 'numeric',
                                          hour: '2-digit',
                                          minute: '2-digit'
                                        })}
                                      </span>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                          
                          <div className="bg-gray-50 px-4 py-3 flex justify-end space-x-3 border-t">
                            <button
                              onClick={() => handleDelete(item.id)}
                              className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-red-600 hover:bg-red-700"
                            >
                              <FiTrash2 className="mr-1.5" /> Delete
                            </button>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-8">
                        <FiCheckCircle className="mx-auto h-12 w-12 text-gray-400" />
                        <h3 className="mt-2 text-sm font-medium text-gray-900">No sent notifications</h3>
                        <p className="mt-1 text-sm text-gray-500">Send a notification to see it here</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PushNotificationPage;