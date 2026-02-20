const express = require("express");
const BirthdayNotificationCenter = require("./BirthdayNotificationCenter");
const EmailNotifier = require("./EmailNotifier");
const birthdayRoutes = require("./routes/birthdays");
const cron = require('node-cron');

const app = express();
const PORT = 3000;

app.use(express.json());
app.use(express.static("public"));

// Initialize the system
const birthdaySystem = new BirthdayNotificationCenter();
const emailNotifier = new EmailNotifier({ enabled: false });

birthdaySystem.subscribe(emailNotifier.handleNotification);

// Initialize routes with the birthday system
birthdayRoutes.initialize(birthdaySystem);

// Load existing data on startup
birthdaySystem.loadData().then(() => {
  console.log("Data loaded");
  console.log(`Users: ${birthdaySystem.users.size}`);
  console.log(`Birthdays: ${birthdaySystem.birthdays.size}`);
});

// Simple test route
app.get("/", (req, res) => {
  res.send(
    "<h1>Garrett Knows - Birthday Notifications</h1><p>Server is working!</p>",
  );
});

// Manual trigger for testing cron job
app.get('/api/check-birthdays', (req, res) => {
  console.log('Manual birthday check triggered...');
  const count = birthdaySystem.checkTodaysBirthdays();
  res.json({ 
    birthdaysFound: count,
    message: count > 0 ? `Found ${count} birthday(s) today!` : 'No birthdays today.'
  });
});

// Mount birthday routes
app.use("/api/birthdays", birthdayRoutes.router);

// Cron jobs
// Check for birthdays daily at 8:00 AM
cron.schedule('0 8 * * *', () => {
  console.log('Running daily birthday check...');
  birthdaySystem.checkTodaysBirthdays();
});

// Debug route to see subscriptions
app.get('/api/subscriptions', (req, res) => {
  const subs = Array.from(birthdaySystem.subscriptions.entries()).map(([userId, bdaySet]) => ({
    userId,
    birthdays: Array.from(bdaySet)
  }));
  res.json(subs);
});

app.get('/api/test-subscribe', (req, res) => {
  birthdaySystem.subscribeToBirthday('user1', 'bday_1771602940302');
  birthdaySystem.saveData();
  res.json({ success: true, message: 'Subscribed user1 to test birthday' });
});

// Reset notification tracking at midnight
cron.schedule('0 0 * * *', () => {
  console.log('Resetting daily notifications...');
  birthdaySystem.resetDailyNotifications();
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
