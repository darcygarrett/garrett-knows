const fs = require("fs").promises;
const path = require("path");

class DataStore {
  constructor(filePath = "./data/system-data.json") {
    this.filePath = filePath;
  }

  async save(data) {
    // Make sure the data directory exists
    const dir = path.dirname(this.filePath);
    await fs.mkdir(dir, { recursive: true });

    // Write data to as pretty JSON
    await fs.writeFile(this.filePath, JSON.stringify(data, null, 2), "utf-8");
  }

  async load() {
    try {
      const fileConent = await fs.readFile(this.filePath, "utf-8");
      return JSON.parse(fileConent);
    } catch (error) {
      // If file doesn't exist, return empty data structure
      if (error.code === "ENOENT") {
        return {
          users: [],
          birthdays: [],
          subscriptions: [],
        };
      }
      // If it's another error, throw it
      throw error;
    }
  }
}

module.exports = DataStore;
