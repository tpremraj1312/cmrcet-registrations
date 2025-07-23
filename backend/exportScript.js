import mongoose from 'mongoose';
import fs from 'fs';
import { exportToExcel } from './exportToExcel.js';
import dotenv from 'dotenv';

dotenv.config();

async function exportRegistrations() {
  try {
    if (!process.env.MONGO_URI) {
      throw new Error('MONGO_URI environment variable is not defined');
    }

    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('Connected to MongoDB');

    // Define schema
    const registrationSchema = new mongoose.Schema({
      name: { type: String, required: true },
      fatherName: { type: String, required: true },
      address: { type: String, required: true },
      mobile: { type: String, required: true },
      resident: { type: String, required: true },
      board12th: { type: String, required: true },
      maxMarks12th: { type: Number, required: true },
      marksObtained12th: { type: Number, required: true },
      percentage12th: { type: Number, required: true },
      memo12th: { type: Buffer, required: true },
      jeeRank: { type: Number },
      eapcetRank: { type: Number },
      board10th: { type: String },
      maxMarks10th: { type: Number },
      marksObtained10th: { type: Number },
      gpa10th: { type: Number },
      priorities: [{ type: String }],
      photo: { type: Buffer },
      memo10th: { type: Buffer },
      eapcetHallTicket: { type: Buffer },
      eapcetRankCard: { type: Buffer },
      jeeHallTicket: { type: Buffer },
      jeeRankCard: { type: Buffer },
      submittedAt: { type: Date, default: Date.now },
    });

    const Registration = mongoose.model('Registration', registrationSchema);

    // Fetch registrations
    const registrations = await Registration.find();
    console.log(`Found ${registrations.length} registrations`);

    if (registrations.length === 0) {
      console.log('No data to export');
      await mongoose.connection.close();
      return;
    }

    // Generate Excel
    const excelBuffer = await exportToExcel(registrations, process.env.VITE_BACKEND_URL);

    // Write Excel file
    const outputPath = 'registrations_export.xlsx';
    fs.writeFileSync(outputPath, excelBuffer);
    console.log(`Excel file saved to ${outputPath}`);

    // Close DB
    await mongoose.connection.close();
    console.log('MongoDB connection closed');
  } catch (error) {
    console.error('Error exporting registrations:', error);
    if (mongoose.connection.readyState) {
      await mongoose.connection.close();
    }
  }
}

// Run the script
exportRegistrations();