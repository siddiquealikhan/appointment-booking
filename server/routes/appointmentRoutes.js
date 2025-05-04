const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const Appointment = require("../models/Appointment");

// Auth middleware (copy of your index.js logic)
const auth = (req, res, next) => {
  try {
    const token = req.header("Authorization")?.replace("Bearer ", "");
    if (!token) {
      return res.status(401).json({ message: "Authentication token required" });
    }
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || "secret_jwt_key"
    );
    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ message: "Invalid or expired token" });
  }
};

// POST: Book a new appointment
router.post("/book", auth, async (req, res) => {
  try {
    // patientId is pulled from req.user by auth middleware
    const appointment = new Appointment({
      patientId: req.user.id,
      doctorId: req.body.doctorId,
      date: new Date(req.body.date),
      time: req.body.time,
      reason: req.body.reason,
    });
    await appointment.save();
    res.status(201).json({ message: "Appointment booked successfully" });
  } catch (err) {
    console.error("Failed to book appointment:", err);
    res.status(500).json({ error: "Failed to book appointment" });
  }
});

// GET: Get appointments by patient email (if you still need it)
router.get("/patient/:email", async (req, res) => {
  try {
    // If you want to keep this, you should change it to lookup by patientId
    const appointments = await Appointment.find({
      patientEmail: req.params.email,
    });
    res.json(appointments);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch appointments" });
  }
});

// GET: Doctor’s appointments for today
router.get("/doctor", auth, async (req, res) => {
  try {
    if (req.user.role !== "doctor") {
      return res.status(403).json({ message: "Access denied" });
    }
    const doctorId = req.user.id;

    const appointments = await Appointment.find({ doctorId })
      .populate("patientId", "name")
      .sort({ date: -1, time: 1 });

    const formatted = appointments.map((a) => ({
      id: a._id.toString(),
      patientName: a.patientId.name,
      date: a.date.toISOString(),
      time: a.time,
      status: a.status,
      reason: a.reason,
    }));

    res.json(formatted);
  } catch (err) {
    console.error("Failed to fetch doctor's appointments:", err);
    res.status(500).json({ error: "Failed to fetch appointments" });
  }
});

module.exports = router;
