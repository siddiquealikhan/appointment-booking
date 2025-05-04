import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import cookieParser from "cookie-parser";
import { Patient, Doctor, Appointment } from "./models/index.js";

// Load environment variables
dotenv.config();

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 5002;

// Middleware
app.use(express.json());
app.use(cookieParser());
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);

// MongoDB connection
mongoose
  .connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("MongoDB connection error:", err));

// Auth middleware (used only for specific endpoints)
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
  } catch (error) {
    res
      .status(401)
      .json({ message: "Authentication failed", error: error.message });
  }
};

// Patient Registration
app.post("/api/patients/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const existingPatient = await Patient.findOne({ email });
    if (existingPatient) {
      return res.status(400).json({ message: "Email already in use" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newPatient = new Patient({
      name,
      email,
      password: hashedPassword,
      role: "patient",
    });

    await newPatient.save();

    const token = jwt.sign(
      {
        id: newPatient._id,
        name: newPatient.name,
        email: newPatient.email,
        role: "patient",
      },
      process.env.JWT_SECRET || "secret_jwt_key",
      { expiresIn: "7d" }
    );

    res.status(201).json({
      message: "Patient registered successfully",
      token,
      user: {
        id: newPatient._id,
        name: newPatient.name,
        email: newPatient.email,
        role: "patient",
      },
    });
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Doctor Registration (Not used since there's no registration page, but keeping for reference)
app.post("/api/doctors/register", async (req, res) => {
  try {
    const { name, email, password, specialty } = req.body;

    const existingDoctor = await Doctor.findOne({ email });
    if (existingDoctor) {
      return res.status(400).json({ message: "Email already in use" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newDoctor = new Doctor({
      name,
      email,
      password: hashedPassword,
      specialty,
      role: "doctor",
    });

    await newDoctor.save();

    const token = jwt.sign(
      {
        id: newDoctor._id,
        name: newDoctor.name,
        email: newDoctor.email,
        role: "doctor",
        specialty: newDoctor.specialty,
      },
      process.env.JWT_SECRET || "secret_jwt_key",
      { expiresIn: "7d" }
    );

    res.status(201).json({
      message: "Doctor registered successfully",
      token,
      user: {
        id: newDoctor._id,
        name: newDoctor.name,
        email: newDoctor.email,
        role: "doctor",
        specialty: newDoctor.specialty,
      },
    });
  } catch (error) {
    console.error("Doctor registration error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Patient Login
app.post("/api/patients/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const patient = await Patient.findOne({ email });
    if (!patient) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, patient.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign(
      {
        id: patient._id,
        name: patient.name,
        email: patient.email,
        role: "patient",
      },
      process.env.JWT_SECRET || "secret_jwt_key",
      { expiresIn: "7d" }
    );

    res.json({
      message: "Login successful",
      token,
      user: {
        id: patient._id,
        name: patient.name,
        email: patient.email,
        role: "patient",
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Doctor Login (Reverted to use bcrypt with debug logging)
app.post("/api/doctors/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log("Login attempt:", { email, password }); // Debug: Log incoming credentials

    const doctor = await Doctor.findOne({ email });
    console.log("Doctor found:", doctor); // Debug: Log the doctor document

    if (!doctor) {
      console.log("Doctor not found for email:", email);
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, doctor.password);
    if (!isMatch) {
      console.log("Password mismatch:", {
        inputPassword: password,
        storedPassword: doctor.password,
      });
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign(
      {
        id: doctor._id,
        name: doctor.name,
        email: doctor.email,
        role: "doctor",
      },
      process.env.JWT_SECRET || "secret_jwt_key",
      { expiresIn: "7d" }
    );

    console.log("Login successful for:", email);
    res.json({
      message: "Login successful",
      token,
      user: {
        id: doctor._id,
        name: doctor.name,
        email: doctor.email,
        role: "doctor",
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Get Authenticated User (still requires auth)
app.get("/api/auth/me", auth, (req, res) => {
  res.json(req.user);
});

// Fetch All Doctors (no auth required)
app.get("/api/doctors", async (req, res) => {
  try {
    const doctors = await Doctor.find({}, "name specialty");
    console.log("Doctors fetched:", doctors); // Debug: Log the fetched doctors
    res.json(doctors);
  } catch (error) {
    console.error("Fetch doctors error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Book an Appointment (requires auth)
app.post("/api/appointments/book", auth, async (req, res) => {
  try {
    const { doctorId, date, time, reason } = req.body;
    console.log("Booking attempt:", {
      doctorId,
      date,
      time,
      reason,
      patientId: req.user.id,
    }); // Debug: Log incoming data

    if (!doctorId || !date || !time || !reason) {
      console.log("Missing fields:", { doctorId, date, time, reason });
      return res.status(400).json({ message: "All fields are required" });
    }

    const doctor = await Doctor.findById(doctorId);
    if (!doctor) {
      console.log("Doctor not found for ID:", doctorId);
      return res.status(404).json({ message: "Doctor not found" });
    }

    const newAppointment = new Appointment({
      patientId: req.user.id,
      doctorId,
      date: new Date(date),
      time,
      reason,
      status: "upcoming",
    });

    await newAppointment.save();
    console.log("Appointment saved:", newAppointment); // Debug: Log saved appointment

    res.status(201).json({
      message: "Appointment booked successfully",
      appointment: newAppointment,
    });
  } catch (error) {
    console.error("Booking error:", error); // Debug: Log any errors
    res.status(500).json({ message: "Server error" });
  }
});

// Fetch Appointments for a Patient (no auth required, use query parameter)
app.get("/api/appointments", async (req, res) => {
  try {
    const { email } = req.query;
    console.log("Fetching appointments for email:", email); // Debug: Log the email

    if (!email) {
      return res.status(400).json({ message: "Patient email is required" });
    }

    const patient = await Patient.findOne({ email });
    console.log("Patient found:", patient); // Debug: Log the patient

    if (!patient) {
      return res.status(404).json({ message: "Patient not found" });
    }

    const appointments = await Appointment.find({ patientId: patient._id })
      .populate("doctorId", "name")
      .sort({ date: -1 });
    console.log("Appointments found:", appointments); // Debug: Log the appointments

    // Transform the response to match the frontend's expected format
    const formattedAppointments = appointments.map((appointment) => ({
      id: appointment._id.toString(),
      doctorName: appointment.doctorId?.name || "Unknown",
      date: appointment.date.toISOString(),
      time: appointment.time,
      status: appointment.status,
      reason: appointment.reason,
    }));

    res.json(formattedAppointments);
  } catch (error) {
    console.error("Fetch appointments error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Get all appointments for the logged-in doctor
app.get("/api/appointments/doctor", auth, async (req, res) => {
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
  } catch (error) {
    console.error("Doctor fetch all error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Get today's appointments for the logged-in doctor
app.get("/api/appointments/doctor/today", auth, async (req, res) => {
  try {
    if (req.user.role !== "doctor") {
      return res.status(403).json({ message: "Access denied" });
    }
    const doctorId = req.user.id;

    const start = new Date();
    start.setHours(0, 0, 0, 0);
    const end = new Date();
    end.setHours(23, 59, 59, 999);

    const appointments = await Appointment.find({
      doctorId,
      date: { $gte: start, $lt: end },
    })
      .populate("patientId", "name")
      .sort({ time: 1 });

    const formatted = appointments.map((a) => ({
      id: a._id.toString(),
      patientName: a.patientId.name,
      date: a.date.toISOString(),
      time: a.time,
      status: a.status,
      reason: a.reason,
    }));

    res.json(formatted);
  } catch (error) {
    console.error("Doctor fetch today error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Cancel an Appointment (requires auth)
app.patch("/api/appointments/:id/cancel", auth, async (req, res) => {
  try {
    const appointment = await Appointment.findOne({
      _id: req.params.id,
      patientId: req.user.id,
    });

    if (!appointment) {
      return res.status(404).json({ message: "Appointment not found" });
    }

    if (appointment.status !== "upcoming") {
      return res
        .status(400)
        .json({ message: "Only upcoming appointments can be cancelled" });
    }

    appointment.status = "cancelled";
    await appointment.save();

    res.json({ message: "Appointment cancelled successfully", appointment });
  } catch (error) {
    console.error("Cancel appointment error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Reschedule an Appointment (requires auth)
app.patch("/api/appointments/:id/reschedule", auth, async (req, res) => {
  try {
    const { date, time } = req.body;

    if (!date || !time) {
      return res.status(400).json({ message: "Date and time are required" });
    }

    const appointment = await Appointment.findOne({
      _id: req.params.id,
      patientId: req.user.id,
    });

    if (!appointment) {
      return res.status(404).json({ message: "Appointment not found" });
    }

    if (appointment.status !== "upcoming") {
      return res
        .status(400)
        .json({ message: "Only upcoming appointments can be rescheduled" });
    }

    appointment.date = new Date(date);
    appointment.time = time;
    await appointment.save();

    res.json({ message: "Appointment rescheduled successfully", appointment });
  } catch (error) {
    console.error("Reschedule appointment error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
