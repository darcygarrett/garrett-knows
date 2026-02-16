const express = require("express");
const router = express.Router();

// This will be passed in from server.js
let birthdaySystem;

function initialize(system) {
  birthdaySystem = system;
}

// GET all birthdays
router.get("/", (req, res) => {
  const birthdays = Array.from(birthdaySystem.birthdays.values());
  res.json(birthdays);
});

// POST new birthday
router.post("/", async (req, res) => {
  const { name, month, day, relationship } = req.body;

  const birthdayId = `bday_${Date.now()}`;

  birthdaySystem.addBirthday(birthdayId, {
    name,
    month: parseInt(month),
    day: parseInt(day),
    relationship,
    ownerId: "web_user",
  });

  await birthdaySystem.saveData();

  res.json({ success: true, id: birthdayId });
});

// DELETE birthday
router.delete("/:id", async (req, res) => {
  const birthdayId = req.params.id;

  birthdaySystem.birthdays.delete(birthdayId);

  birthdaySystem.subscriptions.forEach((birthdaySet) => {
    birthdaySet.delete(birthdayId);
  });

  await birthdaySystem.saveData();

  res.json({ success: true });
});

// PUT update birthday
router.put("/:id", async (req, res) => {
  const birthdayId = req.params.id;
  const { name, month, day, relationship } = req.body;

  const birthday = birthdaySystem.birthdays.get(birthdayId);

  if (!birthday) {
    return res.status(404).json({ error: "Birthday not found" });
  }

  birthday.name = name;
  birthday.month = parseInt(month);
  birthday.day = parseInt(day);
  birthday.relationship = relationship;

  birthdaySystem.birthdays.set(birthdayId, birthday);

  await birthdaySystem.saveData();

  res.json({ success: true });
});

module.exports = { router, initialize };
