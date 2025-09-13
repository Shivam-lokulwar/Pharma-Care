import { useState, useEffect } from 'react';

export const useNotifications = () => {
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    // Load notifications from localStorage on mount
    const savedNotifications = localStorage.getItem('pharmacare_notifications');
    if (savedNotifications) {
      try {
        setNotifications(JSON.parse(savedNotifications));
      } catch (error) {
        console.error('Error loading notifications:', error);
        setNotifications([]);
      }
    }
  }, []);

  const saveNotifications = (newNotifications) => {
    setNotifications(newNotifications);
    localStorage.setItem('pharmacare_notifications', JSON.stringify(newNotifications));
  };

  const addNotification = (notification) => {
    const newNotification = {
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      read: false,
      ...notification
    };
    
    const updatedNotifications = [newNotification, ...notifications];
    saveNotifications(updatedNotifications);
  };

  const markAsRead = (notificationId) => {
    const updatedNotifications = notifications.map(notification =>
      notification.id === notificationId
        ? { ...notification, read: true, readAt: new Date().toISOString() }
        : notification
    );
    saveNotifications(updatedNotifications);
  };

  const markAllAsRead = () => {
    const updatedNotifications = notifications.map(notification => ({
      ...notification,
      read: true,
      readAt: new Date().toISOString()
    }));
    saveNotifications(updatedNotifications);
  };

  const deleteNotification = (notificationId) => {
    const updatedNotifications = notifications.filter(
      notification => notification.id !== notificationId
    );
    saveNotifications(updatedNotifications);
  };

  const clearAllNotifications = () => {
    saveNotifications([]);
  };

  const unreadCount = notifications.filter(notification => !notification.read).length;

  return {
    notifications,
    unreadCount,
    addNotification,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearAllNotifications
  };
};

// export default useNotifications;