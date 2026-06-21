// Firestore Service Placeholders
// All functions will connect to Firebase Firestore later.

// -------------------------
// 1. SELF-CHECK RECORDS
// -------------------------
export const fetchSelfCheckRecords = async (userId) => {
  console.log(`Firestore: Fetching self-check logs for user: ${userId}`);
  // Return empty list/mock list for now
  return [
    { id: '1', date: '2026-05-15', notes: 'No abnormalities found. Left & right normal.', status: 'healthy' },
    { id: '2', date: '2026-06-15', notes: 'Normal self-examination. Felt fine.', status: 'healthy' }
  ];
};

export const saveSelfCheckRecord = async (userId, recordData) => {
  console.log(`Firestore: Saving self-check record for user: ${userId}`, recordData);
  return { id: 'mock-record-id-' + Date.now(), ...recordData };
};

// -------------------------
// 2. CLINIC/FACILITY DIRECTORY
// -------------------------
export const fetchClinics = async () => {
  console.log("Firestore: Fetching clinic directory");
  // Mock clinics in Kenya for prototype demo
  return [
    { id: 'c1', name: 'Nairobi West Hospital Oncology Clinic', location: 'Nairobi', phone: '0730 600000', services: 'Mammography, Consultation' },
    { id: 'c2', name: 'Kenyatta National Hospital Cancer Centre', location: 'Nairobi', phone: '020 2726300', services: 'Comprehensive Oncology, Diagnostics' },
    { id: 'c3', name: 'Mombasa Hospital', location: 'Mombasa', phone: '0722 203053', services: 'Ultrasound, Diagnostics' }
  ];
};

// -------------------------
// 3. REMINDERS
// -------------------------
export const fetchReminders = async (userId) => {
  console.log(`Firestore: Fetching reminders for user: ${userId}`);
  return [
    { id: 'r1', frequency: 'Monthly', dayOfMonth: 1, enabled: true, time: '08:00' }
  ];
};

export const updateReminderSettings = async (userId, reminderData) => {
  console.log(`Firestore: Updating reminder settings for user: ${userId}`, reminderData);
  return { success: true };
};

// -------------------------
// 4. EDUCATIONAL CONTENT
// -------------------------
export const fetchEducationalContent = async () => {
  console.log("Firestore: Fetching educational articles");
  return [
    {
      id: 'e1',
      title: 'Understanding Breast Cancer: Basics',
      summary: 'Learn about the anatomy of the breast and what breast cancer actually is.',
      category: 'Awareness',
      content: 'Breast cancer is a disease in which cells in the breast grow out of control...'
    },
    {
      id: 'e2',
      title: 'How to Perform a Breast Self-Examination (BSE)',
      summary: 'A step-by-step pictorial guide on the three methods: Shower, Mirror, and Lying Down.',
      category: 'Self-Exam',
      content: 'Step 1: Look in the mirror with shoulders straight...'
    }
  ];
};
