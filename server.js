const express = require('express');
const BirthdayNotificationCenter = require('./BirthdayNotificationCenter');
const EmailNotifier = require('./EmailNotifier');

const app = express();
const port = 3000;

// Initialize the system
const birthdaySystem = new BirthdayNotificationCenter();
const emailNotifier = new EmailNotifier({ enabled: false});

birthdaySystem.subscribe(emailNotifier.handleNotification);

// Load existing data on startup
birthdaySystem.loadData().then(() => {
    console.log('Data loaded');
    console.log(`Users: ${birthdaySystem.users.size}`);
    console.log(`Birthdays: ${birthdaySystem.birthdays.size}`);
});

app.get('/', (req, res) => {
    res.send('<h1>Garrett Knows - Birthday Notifications</h1><p>Server is working!</p>');
});

app.get('/api/birthdays', (req, res) => {
    const birthdays = Array.from(birthdaySystem.birthdays.values());
    res.json(birthdays);
})

app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});