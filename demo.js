/**
 * Demo script to test the Birthday Notification System
 */

const BirthdayNotificationCenter = require("./BirthdayNotificationCenter");
const EmailNotifier = require("./EmailNotifier");

console.log("Birthday Notification System - Demo\n");
console.log("=".repeat(60));

// Create the notification center
const birthdaySystem = new BirthdayNotificationCenter();

async function runDemo() {
  // Load existing data
  await birthdaySystem.loadData();

  console.log(`\nLoaded existing data...`);
  console.log(`   Existing users: ${birthdaySystem.users.size}`);
  console.log(`   Existing birthdays: ${birthdaySystem.birthdays.size}`);

  // Create email notifier
  const emailNotifier = new EmailNotifier({ enabled: false }); // Simulation mode

  // Subscribe email notifier to the system
  birthdaySystem.subscribe(emailNotifier.handleNotification);

  console.log("\nSetting up demo data...\n");

  // Add users
  birthdaySystem.addUser("user1", {
    name: "Robin Hood",
    email: "robinhood@example.com",
    phone: "555-0001",
    preferences: { emailNotifications: true },
  });

  birthdaySystem.addUser("user2", {
    name: "Little John",
    email: "littlejohn@example.com",
    phone: "555-0002",
    preferences: { emailNotifications: true },
  });

  birthdaySystem.addUser("user3", {
    name: "Maid Marian",
    email: "maidmarian@example.com",
    phone: "555-0003",
    preferences: { emailNotifications: true },
  });

  birthdaySystem.addUser("user4", {
    name: "Prince John",
    email: "princejohn@example.com",
    phone: "555-0003",
    preferences: { emailNotifications: true },
  });

  console.log("Added 4 users");

  // Add birthdays
  // Let's use today's date for demo purposes
  const today = new Date();
  const currentMonth = today.getMonth() + 1;
  const currentDay = today.getDate();

  birthdaySystem.addBirthday("bday1", {
    name: "Mom",
    month: currentMonth,
    day: currentDay, // Today!
    relationship: "Mother",
    ownerId: "user1",
  });

  birthdaySystem.addBirthday("bday2", {
    name: "Best Friend Sarah",
    month: currentMonth,
    day: currentDay, // Also today!
    relationship: "Best Friend",
    ownerId: "user2",
  });

  birthdaySystem.addBirthday("bday3", {
    name: "Uncle John",
    month: 12,
    day: 25, // Christmas - not today
    relationship: "Uncle",
    ownerId: "user1",
  });

  console.log("Added 3 birthdays (2 today, 1 future)");

  // Subscribe users to birthdays
  console.log("\nSetting up subscriptions...\n");

  // Robin subscribes to Mom's birthday
  birthdaySystem.subscribeToBirthday("user1", "bday1");
  console.log("   Robin subscribed to Mom's birthday");

  // Little John subscribes to Mom's birthday too (family friend)
  birthdaySystem.subscribeToBirthday("user2", "bday1");
  console.log("   Little John subscribed to Mom's birthday");

  // Robin and Maid Marian subscribe to Sarah's birthday
  birthdaySystem.subscribeToBirthday("user1", "bday2");
  birthdaySystem.subscribeToBirthday("user3", "bday2");
  console.log("   Robin and Maid Marian subscribed to Sarah's birthday");

  // Everyone subscribes to Uncle John's birthday
  birthdaySystem.subscribeToBirthday("user1", "bday3");
  birthdaySystem.subscribeToBirthday("user2", "bday3");
  birthdaySystem.subscribeToBirthday("user3", "bday3");
  birthdaySystem.subscribeToBirthday("user4", "bday3");
  console.log("   All users subscribed to Uncle John's birthday");

  console.log("\n" + "=".repeat(60));

  // Check today's birthdays
  birthdaySystem.checkTodaysBirthdays();

  console.log("\n" + "=".repeat(60));
  console.log("\nSystem Stats:\n");

  console.log(`   Total Users: ${birthdaySystem.users.size}`);
  console.log(`   Total Birthdays: ${birthdaySystem.birthdays.size}`);
  console.log(
    `   Notifications Sent Today: ${birthdaySystem.notifiedToday.size}`,
  );

  console.log("\nUser Subscriptions:\n");

  birthdaySystem.users.forEach((user, userId) => {
    const subs = birthdaySystem.getUserSubscriptions(userId);
    console.log(`   ${user.name}: subscribed to ${subs.length} birthday(s)`);
    subs.forEach((bday) => {
      console.log(`      - ${bday.name} (${bday.month}/${bday.day})`);
    });
  });

  console.log("\n" + "=".repeat(60));
  console.log("\nDemo complete!\n");

  // Save all data
  await birthdaySystem.saveData();
  console.log("Data saved to file!\n");
}

runDemo().catch(console.error);
