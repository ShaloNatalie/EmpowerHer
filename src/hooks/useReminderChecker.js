import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { fetchReminders, saveReminder } from '../services/firestore';
import { serverTimestamp } from 'firebase/firestore';

export const useReminderChecker = () => {
  const { user } = useAuth();
  // Using a short interval to check frequently. 
  // We fetch once on mount (and refocus if we want), and then check the array locally.
  const [reminders, setReminders] = useState([]);
  const [toastMessage, setToastMessage] = useState(null); // Simple toast state if we want to render it

  const loadReminders = async () => {
    if (!user) return;
    try {
      const data = await fetchReminders(user.uid);
      setReminders(data);
    } catch (err) {
      console.error("Error fetching reminders for checker:", err);
    }
  };

  useEffect(() => {
    loadReminders();
    
    // Refresh on focus just in case
    const onFocus = () => loadReminders();
    window.addEventListener('focus', onFocus);
    return () => window.removeEventListener('focus', onFocus);
  }, [user]);

  useEffect(() => {
    if (reminders.length === 0) return;

    const checkInterval = setInterval(() => {
      const now = Date.now();
      
      reminders.forEach(async (rem) => {
        if (rem.status !== 'Active') return;
        
        // Ensure we have a valid nextDueAt (number timestamp)
        if (!rem.nextDueAt) return;
        
        if (rem.nextDueAt <= now) {
          // If Once, it should not have been shown yet.
          // If Monthly, lastNotificationShownAt might exist, but nextDueAt should be in the future if it was already processed.
          // The logic below ensures we only trigger if it is actually due right now.
          if (rem.repeat === 'Once' && rem.notificationShown) return;

          // Display Native Browser Notification
          if (rem.browserNotificationEnabled && "Notification" in window && Notification.permission === 'granted') {
            const title = "EmpowerHer reminder";
            const options = {
              body: `Time for your scheduled ${rem.type.toLowerCase()}. EmpowerHer does not provide diagnosis. If you notice unusual changes, visit a qualified healthcare provider.`,
              icon: '/favicon.ico',
              requireInteraction: true
            };

            // Try Service Worker first
            if ('serviceWorker' in navigator) {
              navigator.serviceWorker.ready.then(registration => {
                registration.showNotification(title, options);
              }).catch(() => {
                new Notification(title, options);
              });
            } else {
              new Notification(title, options);
            }
          }

          // Trigger in-app toast
          setToastMessage(`Due now: ${rem.title}. Visit the reminders page for details.`);
          setTimeout(() => setToastMessage(null), 10000);

          // Update Firestore to prevent duplicate triggers
          const payload = {
            lastNotificationShownAt: serverTimestamp()
          };
          
          if (rem.repeat === 'Once') {
            payload.notificationShown = true;
          } else if (rem.repeat === 'Monthly') {
            // Calculate next month's due date
            const currentDue = new Date(rem.nextDueAt);
            currentDue.setMonth(currentDue.getMonth() + 1);
            payload.nextDueAt = currentDue.getTime();
            // Leave notificationShown as it is or false
          }

          // Optimistically update local state so it doesn't fire again while waiting for Firestore
          setReminders(prev => prev.map(p => {
            if (p.id === rem.id) {
              return { ...p, notificationShown: payload.notificationShown || p.notificationShown, nextDueAt: payload.nextDueAt || p.nextDueAt };
            }
            return p;
          }));

          try {
            await saveReminder(rem.id, payload);
          } catch (err) {
            console.error("Error updating reminder after notification:", err);
          }
        }
      });
    }, 15000); // Check every 15 seconds

    return () => clearInterval(checkInterval);
  }, [reminders]);

  return { toastMessage, dismissToast: () => setToastMessage(null) };
};
