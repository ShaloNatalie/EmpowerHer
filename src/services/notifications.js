// Browser Notification Service Placeholder

export const requestNotificationPermission = async () => {
  if (!('Notification' in window)) {
    console.warn("This browser does not support desktop notification");
    return 'unsupported';
  }

  try {
    const permission = await Notification.requestPermission();
    console.log(`Notification permission status: ${permission}`);
    return permission;
  } catch (error) {
    console.error("Error requesting notification permission:", error);
    return 'denied';
  }
};

export const scheduleLocalNotification = (title, options = {}) => {
  if (!('Notification' in window) || Notification.permission !== 'granted') {
    console.warn("Notifications not enabled or supported.");
    return false;
  }

  console.log(`Scheduling local notification: "${title}"`, options);
  // Trigger a test notification immediately as a demonstration
  new Notification(title, {
    icon: '/favicon.svg',
    badge: '/favicon.svg',
    ...options
  });
  return true;
};
