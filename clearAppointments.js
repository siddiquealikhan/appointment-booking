// clearAppointments.js
import mongoose from "mongoose";
import dotenv from "dotenv";
import { Appointment } from "./server/models/Appointment.js";

dotenv.config();

async function clear() {
  await mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });

  // Remove all appointments:
  const result = await Appointment.deleteMany({});
  console.log(`Deleted ${result.deletedCount} appointments.`);

  // Or to target one patient, use:
  // await Appointment.deleteMany({ patientId: "YOUR_PATIENT_ID" });

  await mongoose.disconnect();
}

clear().catch((err) => {
  console.error(err);
  mongoose.disconnect();
});
