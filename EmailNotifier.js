/**
 * Email Notification Handler
 * For MVP: simulates email sending with console logs
 * Later: integrate with Nodemailer
 */

class EmailNotifier {
  constructor(config = {}) {
    this.enabled = config.enabled || false;
    this.from = config.from || 'noreply@garrett-knows.com';
  }

  /**
   * Send birthday notification email (simulated for MVP)
   */
  async sendBirthdayNotification(birthday, subscriber) {
    const subject = `It's ${birthday.name}'s Birthday!`;
    const body = this.createEmailBody(birthday, subscriber);

    if (this.enabled) {
      // TODO: Real email sending with Nodemailer
      console.log('   [EMAIL WOULD BE SENT]');
    } else {
      // Simulation for MVP
      console.log(`\n   Email Simulation`);
      console.log(`   To: ${subscriber.email} (${subscriber.name})`);
      console.log(`   Subject: ${subject}`);
      console.log(`   ---`);
      console.log(`   ${body}`);
      console.log(`   ---\n`);
    }

    return { success: true, recipient: subscriber.email };
  }

  /**
   * Create email body text
   */
  createEmailBody(birthday, subscriber) {
    return `
Hi ${subscriber.name}!

Just a friendly reminder that today is ${birthday.name}'s birthday!

${birthday.relationship ? `Relationship: ${birthday.relationship}` : ''}

Don't forget to wish them a happy birthday!

Best,
Garrett Knows
    `.trim();
  }

  /**
   * Observer pattern handler - called when birthday notification triggered
   */
  handleNotification = async (birthday, subscribers) => {
    console.log(`\n   Sending ${subscribers.length} email(s) for ${birthday.name}...`);
    
    for (const subscriber of subscribers) {
      await this.sendBirthdayNotification(birthday, subscriber);
    }
  }
}

module.exports = EmailNotifier;
