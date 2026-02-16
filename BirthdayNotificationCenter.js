const DataStore = require('./DataStore');

class BirthdayNotificationCenter {
  constructor() {
    this.observers = [];
    this.users = new Map();
    this.birthdays = new Map();
    this.subscriptions = new Map();
    this.notifiedToday = new Set(); // prevent spam
    this.dataStore = new DataStore();
  }

  subscribe(notificationHandler) {
    this.observers.push(notificationHandler);
    return () => {
      this.observers = this.observers.filter(obs => obs !== notificationHandler);
    };
  }

  notify(birthday, subscribers) {
    this.observers.forEach(observer => {
      observer(birthday, subscribers);
    });
  }

  addUser(userId, userData) {
    this.users.set(userId, {
      id: userId,
      name: userData.name,
      email: userData.email,
      phone: userData.phone || '',
      preferences: userData.preferences || { emailNotifications: true }
    });
    
    if (!this.subscriptions.has(userId)) {
      this.subscriptions.set(userId, new Set());
    }
  }

  addBirthday(birthdayId, birthdayData) {
    this.birthdays.set(birthdayId, {
      id: birthdayId,
      name: birthdayData.name,
      date: birthdayData.date, // Format: 'MM-DD'
      month: birthdayData.month,
      day: birthdayData.day,
      relationship: birthdayData.relationship || '',
      ownerId: birthdayData.ownerId, // User who created this birthday
      createdAt: new Date().toISOString()
    });
  }

  subscribeToBirthday(userId, birthdayId) {
    if (!this.subscriptions.has(userId)) {
      this.subscriptions.set(userId, new Set());
    }
    this.subscriptions.get(userId).add(birthdayId);
  }

  unsubscribeFromBirthday(userId, birthdayId) {
    if (this.subscriptions.has(userId)) {
      this.subscriptions.get(userId).delete(birthdayId);
    }
  }

  getUserSubscriptions(userId) {
    const subscriptionSet = this.subscriptions.get(userId) || new Set();
    return [...subscriptionSet].map(birthdayId => this.birthdays.get(birthdayId));
  }

  /**
   * Check for today's birthdays and notify subscribers
   */
  checkTodaysBirthdays() {
    const today = new Date();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    const todayKey = `${month}-${day}`;

    console.log(`\nChecking birthdays for ${todayKey}...`);

    let birthdaysFound = 0;

    this.birthdays.forEach((birthday, birthdayId) => {
      const birthdayKey = `${String(birthday.month).padStart(2, '0')}-${String(birthday.day).padStart(2, '0')}`;
      
      // If it's their birthday today and we haven't notified yet
      if (birthdayKey === todayKey && !this.notifiedToday.has(birthdayId)) {
        birthdaysFound++;
        
        // Find all subscribers to this birthday
        const subscribers = this.getSubscribersForBirthday(birthdayId);
        
        if (subscribers.length > 0) {
          console.log(`\nIt's ${birthday.name}'s birthday!`);
          console.log(`   Notifying ${subscribers.length} subscriber(s)...`);
          
          // Notify all observers (email handlers, etc.)
          this.notify(birthday, subscribers);
          
          // Mark as notified today
          this.notifiedToday.add(birthdayId);
        }
      }
    });

    if (birthdaysFound === 0) {
      console.log('   No birthdays today.');
    }

    return birthdaysFound;
  }

  /**
   * Get all users subscribed to a specific birthday
   */
  getSubscribersForBirthday(birthdayId) {
    const subscribers = [];
    
    this.subscriptions.forEach((birthdaySet, userId) => {
      if (birthdaySet.has(birthdayId)) {
        const user = this.users.get(userId);
        if (user && user.preferences.emailNotifications) {
          subscribers.push(user);
        }
      }
    });
    
    return subscribers;
  }

  /**
   * Reset daily notification tracking (call this at midnight)
   */
  resetDailyNotifications() {
    this.notifiedToday.clear();
    console.log('Daily notification tracking reset');
  }

  /**
   * Get all data for persistence
   */
  exportData() {
    return {
      users: Array.from(this.users.entries()),
      birthdays: Array.from(this.birthdays.entries()),
      subscriptions: Array.from(this.subscriptions.entries()).map(([userId, set]) => [
        userId,
        Array.from(set)
      ])
    };
  }

  /**
   * Load data from persistence
   */
  importData(data) {
    if (data.users) {
      this.users = new Map(data.users);
    }
    if (data.birthdays) {
      this.birthdays = new Map(data.birthdays);
    }
    if (data.subscriptions) {
      this.subscriptions = new Map(
        data.subscriptions.map(([userId, arr]) => [userId, new Set(arr)])
      );
    }
  }

  async saveData() {
    const data = this.exportData();
    await this.dataStore.save(data);
  }

  async loadData() {
    const data = await this.dataStore.load();
    this.importData(data);
  }
}

module.exports = BirthdayNotificationCenter;
