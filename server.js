const express = require('express');
const BirthdayNotificationCenter = require('./BirthdayNotificationCenter');
const EmailNotifier = require('./EmailNotifier');

const app = express();
const port = 3000;

app.use(express.json());
app.use(express.static('public'));

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

// API endpoint to add a birthday
app.post('/api/birthdays', async (req, res) => {
    const { name, month, day, relationship } = req.body;
    const birthdayId = `bday_${Date.now()}`;

    birthdaySystem.addBirthday(birthdayId, {
        name,
        month: parseInt(month),
        day: parseInt(day),
        relationship,
        ownderId: 'web_user' // For now, all web-added birthdays have this owner
    })

    // Save to file
    await birthdaySystem.saveData();

    res.json({ success: true, birthdayId });
});

// API endpoint to delete a birthday
app.delete('/api/birthdays/:id', async (req, res) => {
  const birthdayId = req.params.id;
  
  // Delete the birthday
  birthdaySystem.birthdays.delete(birthdayId);
  
  // Remove from all subscriptions
  birthdaySystem.subscriptions.forEach((birthdaySet) => {
    birthdaySet.delete(birthdayId);
  });
  
  // Save to file
  await birthdaySystem.saveData();
  
  res.json({ success: true });
});

// API endpoint to update a birthday
app.put('/api/birthdays/:id', async (req, res) => {
  const birthdayId = req.params.id;
  const { name, month, day, relationship } = req.body;
  
  const birthday = birthdaySystem.birthdays.get(birthdayId);
  
  if (!birthday) {
    return res.status(404).json({ error: 'Birthday not found' });
  }
  
  // Update the birthday
  birthday.name = name;
  birthday.month = parseInt(month);
  birthday.day = parseInt(day);
  birthday.relationship = relationship;
  
  birthdaySystem.birthdays.set(birthdayId, birthday);
  
  // Save to file
  await birthdaySystem.saveData();
  
  res.json({ success: true });
});

app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});