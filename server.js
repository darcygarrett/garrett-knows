const express = require("express");
const BirthdayNotificationCenter = require("./BirthdayNotificationCenter");
const EmailNotifier = require("./EmailNotifier");
const birthdayRoutes = require("./routes/birthdays");

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

// Mount birthday routes
app.use("/api/birthdays", birthdayRoutes.router);

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
