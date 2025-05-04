import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";
import { Doctor } from "./server/models/Doctor.js";

dotenv.config();

async function seed() {
  await mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });

  // 1. Remove existing
  await Doctor.deleteMany({});
  console.log("Cleared doctors collection");

  // 2. Prepare new docs
  const docs = [
    {
      name: "Dr. Siddique Ali Khan",
      email: "siddique@example.com",
      specialty: "Cardiologist",
    },
    {
      name: "Dr. Prashant Naik",
      email: "prashant@example.com",
      specialty: "Dermatologist",
    },
    {
      name: "Dr. Wajihuddin",
      email: "wajihuddin@example.com",
      specialty: "Pediatrician",
    },
  ];

  // 3. Hash a default password for each
  const password = "doctor123";
  for (let doc of docs) {
    doc.password = await bcrypt.hash(password, 10);
  }

  // 4. Insert them
  await Doctor.insertMany(docs);
  console.log(
    "Seeded doctors:",
    docs.map((d) => d.name)
  );

  mongoose.disconnect();
}

seed().catch((err) => {
  console.error(err);
  mongoose.disconnect();
});
