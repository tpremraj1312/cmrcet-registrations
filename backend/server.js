import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import multer from 'multer';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { exportToExcel } from './exportToExcel.js';
import PDFDocument from 'pdfkit';
import dotenv from 'dotenv';

// Initialize environment variables
dotenv.config();

// Initialize Express
const app = express();

// Middleware
app.use(helmet());
app.use(cors({ origin: process.env.VITE_FRONTEND_URL, methods: ['GET', 'POST'] }));
app.use(express.json());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
});
app.use(limiter);

// Configure multer for memory storage
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'application/pdf'];
    if (allowedTypes.includes(file.mimetype)) {
      // cborino
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only JPEG, PNG, and PDF are allowed.'));
    }
  },
});

// MongoDB Connection
mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log('Connected to MongoDB'))
  .catch((err) => console.error('MongoDB connection error:', err));

// Schema for Registration Form
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

// Error handling middleware
app.use((err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    return res.status(400).json({ message: `Multer error: ${err.message}` });
  } else if (err) {
    console.error('Server error:', err);
    return res.status(500).json({ message: `Server error: ${err.message}` });
  }
  next();
});

// API Routes
app.post(
  '/api/register',
  upload.fields([
    { name: 'photo', maxCount: 1 },
    { name: 'memo10th', maxCount: 1 },
    { name: 'memo12th', maxCount: 1 },
    { name: 'eapcetHallTicket', maxCount: 1 },
    { name: 'eapcetRankCard', maxCount: 1 },
    { name: 'jeeHallTicket', maxCount: 1 },
    { name: 'jeeRankCard', maxCount: 1 },
  ]),
  async (req, res) => {
    try {
      const { priorities, ...otherFields } = req.body;
      let parsedPriorities = [];
      if (priorities) {
        try {
          parsedPriorities = JSON.parse(priorities);
          if (!Array.isArray(parsedPriorities)) {
            throw new Error('Priorities must be an array');
          }
        } catch (error) {
          return res.status(400).json({ message: `Invalid priorities format: ${error.message}` });
        }
      }

      const registrationData = {
        ...otherFields,
        priorities: parsedPriorities,
        photo: req.files['photo'] ? req.files['photo'][0].buffer : null,
        memo10th: req.files['memo10th'] ? req.files['memo10th'][0].buffer : null,
        memo12th: req.files['memo12th'] ? req.files['memo12th'][0].buffer : null,
        eapcetHallTicket: req.files['eapcetHallTicket'] ? req.files['eapcetHallTicket'][0].buffer : null,
        eapcetRankCard: req.files['eapcetRankCard'] ? req.files['eapcetRankCard'][0].buffer : null,
        jeeHallTicket: req.files['jeeHallTicket'] ? req.files['jeeHallTicket'][0].buffer : null,
        jeeRankCard: req.files['jeeRankCard'] ? req.files['jeeRankCard'][0].buffer : null,
      };

      const numericFields = ['maxMarks12th', 'marksObtained12th', 'percentage12th'];
      ['jeeRank', 'eapcetRank', 'maxMarks10th', 'marksObtained10th', 'gpa10th'].forEach((field) => {
        if (registrationData[field]) numericFields.push(field);
      });

      numericFields.forEach((field) => {
        if (registrationData[field]) {
          registrationData[field] = Number(registrationData[field]);
          if (isNaN(registrationData[field])) {
            throw new Error(`${field} must be a valid number`);
          }
        }
      });

      const registration = new Registration(registrationData);
      await registration.save();
      res.status(201).json({ message: 'Registration successful', id: registration._id });
    } catch (error) {
      console.error('Error saving registration:', error);
      res.status(500).json({ message: `Error saving registration: ${error.message}` });
    }
  }
);

app.get('/api/register/:id', async (req, res) => {
  try {
    const registration = await Registration.findById(req.params.id);
    if (!registration) return res.status(404).json({ message: 'Registration not found' });
    const responseData = {
      ...registration._doc,
      photo: registration.photo ? registration.photo.toString('base64') : null,
      memo10th: registration.memo10th ? registration.memo10th.toString('base64') : null,
      memo12th: registration.memo12th ? registration.memo12th.toString('base64') : null,
      eapcetHallTicket: registration.eapcetHallTicket ? registration.eapcetHallTicket.toString('base64') : null,
      eapcetRankCard: registration.eapcetRankCard ? registration.eapcetRankCard.toString('base64') : null,
      jeeHallTicket: registration.jeeHallTicket ? registration.jeeHallTicket.toString('base64') : null,
      jeeRankCard: registration.jeeRankCard ? registration.jeeRankCard.toString('base64') : null,
    };
    res.json(responseData);
  } catch (error) {
    console.error('Error fetching registration:', error);
    res.status(500).json({ message: `Error fetching registration: ${error.message}` });
  }
});

app.get('/api/image/:id/:field', async (req, res) => {
  try {
    const { id, field } = req.params;
    const validFields = ['photo', 'memo10th', 'memo12th', 'eapcetHallTicket', 'eapcetRankCard', 'jeeHallTicket', 'jeeRankCard'];
    if (!validFields.includes(field)) {
      return res.status(400).json({ message: 'Invalid field' });
    }

    const registration = await Registration.findById(id);
    if (!registration || !registration[field]) {
      return res.status(404).json({ message: 'File not found' });
    }

    const buffer = Buffer.isBuffer(registration[field]) ? registration[field] : Buffer.from(registration[field].data);
    const isPdf = buffer.toString('hex').startsWith('25504446');
    const mimeType = isPdf ? 'application/pdf' : (buffer.toString('hex').startsWith('89504e47') ? 'image/png' : 'image/jpeg');

    res.setHeader('Content-Type', mimeType);
    res.send(buffer);
  } catch (error) {
    console.error('Error serving file:', error);
    res.status(500).json({ message: `Error serving file: ${error.message}` });
  }
});

app.get('/api/download/:id/:field/:filename', async (req, res) => {
  try {
    const { id, field, filename } = req.params;
    const validFields = ['photo', 'memo10th', 'memo12th', 'eapcetHallTicket', 'eapcetRankCard', 'jeeHallTicket', 'jeeRankCard'];
    if (!validFields.includes(field)) {
      return res.status(400).json({ message: 'Invalid field' });
    }

    const registration = await Registration.findById(id);
    if (!registration || !registration[field]) {
      return res.status(404).json({ message: 'File not found' });
    }

    const buffer = Buffer.isBuffer(registration[field]) ? registration[field] : Buffer.from(registration[field].data);
    const isPdf = buffer.toString('hex').startsWith('25504446');
    const mimeType = isPdf ? 'application/pdf' : (buffer.toString('hex').startsWith('89504e47') ? 'image/png' : 'image/jpeg');

    res.setHeader('Content-Type', mimeType);
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.send(buffer);
  } catch (error) {
    console.error('Error serving file:', error);
    res.status(500).json({ message: `Error serving file: ${error.message}` });
  }
});

app.get('/api/export', async (req, res) => {
  try {
    const registrations = await Registration.find();
    const excelBuffer = await exportToExcel(registrations);

    res.setHeader('Content-Disposition', 'attachment; filename=registrations_export.xlsx');
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');

    res.send(excelBuffer);
  } catch (error) {
    console.error('Error exporting to Excel:', error);
    res.status(500).json({ message: `Error exporting to Excel: ${error.message}` });
  }
});

app.post(
  '/api/export/pdf',
  upload.fields([
    { name: 'photo', maxCount: 1 },
    { name: 'memo10th', maxCount: 1 },
    { name: 'memo12th', maxCount: 1 },
    { name: 'eapcetHallTicket', maxCount: 1 },
    { name: 'eapcetRankCard', maxCount: 1 },
    { name: 'jeeHallTicket', maxCount: 1 },
    { name: 'jeeRankCard', maxCount: 1 },
  ]),
  async (req, res) => {
    try {
      const { priorities, ...otherFields } = req.body;
      let parsedPriorities = [];
      if (priorities) {
        try {
          parsedPriorities = JSON.parse(priorities);
          if (!Array.isArray(parsedPriorities)) {
            throw new Error('Priorities must be an array');
          }
        } catch (error) {
          return res.status(400).json({ message: `Invalid priorities format: ${error.message}` });
        }
      }

      const formData = {
        ...otherFields,
        priorities: parsedPriorities,
        photo: req.files['photo'] ? req.files['photo'][0].buffer : null,
        memo10th: req.files['memo10th'] ? req.files['memo10th'][0].buffer : null,
        memo12th: req.files['memo12th'] ? req.files['memo12th'][0].buffer : null,
        eapcetHallTicket: req.files['eapcetHallTicket'] ? req.files['eapcetHallTicket'][0].buffer : null,
        eapcetRankCard: req.files['eapcetRankCard'] ? req.files['eapcetRankCard'][0].buffer : null,
        jeeHallTicket: req.files['jeeHallTicket'] ? req.files['jeeHallTicket'][0].buffer : null,
        jeeRankCard: req.files['jeeRankCard'] ? req.files['jeeRankCard'][0].buffer : null,
      };

      const doc = new PDFDocument({ margin: 50 });
      res.setHeader('Content-Disposition', `attachment; filename=application_${formData.name || 'form'}.pdf`);
      res.setHeader('Content-Type', 'application/pdf');
      doc.pipe(res);

      // Header
      doc.fontSize(16).text('CMR College of Engineering & Technology', { align: 'center' });
      doc.fontSize(12).text('Application for Admission to Category B Seats - B.Tech 2025-26', { align: 'center' });
      doc.moveDown();

      // Personal Information
      doc.fontSize(14).text('Personal Information', { underline: true });
      doc.moveDown(0.5);
      doc.fontSize(10);
      doc.text(`Full Name: ${formData.name || 'N/A'}`);
      doc.text(`Father's Name: ${formData.fatherName || 'N/A'}`);
      doc.text(`Address: ${formData.address || 'N/A'}`);
      doc.text(`Mobile Number: ${formData.mobile || 'N/A'}`);
      doc.text(`Resident: ${formData.resident || 'N/A'}`);
      doc.moveDown();

      // Entrance Exam Details
      doc.fontSize(14).text('Entrance Exam Details', { underline: true });
      doc.moveDown(0.5);
      doc.fontSize(10);
      doc.text(`JEE Rank: ${formData.jeeRank || 'N/A'}`);
      doc.text(`EAPCET Rank: ${formData.eapcetRank || 'N/A'}`);
      doc.moveDown();

      // 10th Class Details
      doc.fontSize(14).text('10th Class Details', { underline: true });
      doc.moveDown(0.5);
      doc.fontSize(10);
      doc.text(`Board: ${formData.board10th || 'N/A'}`);
      doc.text(`Total Marks: ${formData.maxMarks10th || 'N/A'}`);
      doc.text(`Marks Obtained: ${formData.marksObtained10th || 'N/A'}`);
      doc.text(`GPA: ${formData.gpa10th || 'N/A'}`);
      doc.moveDown();

      // 12th Class Details
      doc.fontSize(14).text('12th Class Details', { underline: true });
      doc.moveDown(0.5);
      doc.fontSize(10);
      doc.text(`Board: ${formData.board12th || 'N/A'}`);
      doc.text(`Total Marks: ${formData.maxMarks12th || 'N/A'}`);
      doc.text(`Marks Obtained: ${formData.marksObtained12th || 'N/A'}`);
      doc.text(`Percentage: ${formData.percentage12th || 'N/A'}`);
      doc.moveDown();

      // Branch Preferences
      doc.fontSize(14).text('Branch Preferences', { underline: true });
      doc.moveDown(0.5);
      doc.fontSize(10);
      formData.priorities.forEach((priority, index) => {
        doc.text(`Priority ${index + 1}: ${priority || 'N/A'}`);
      });
      doc.moveDown();

      // Uploaded Files
      doc.fontSize(14).text('Uploaded Files', { underline: true });
      doc.moveDown(0.5);
      doc.fontSize(10);

      const fileFields = [
        { name: 'photo', label: 'Photo' },
        { name: 'memo10th', label: '10th Memo' },
        { name: 'memo12th', label: '12th Memo' },
        { name: 'eapcetHallTicket', label: 'EAPCET Hall Ticket' },
        { name: 'eapcetRankCard', label: 'EAPCET Rank Card' },
        { name: 'jeeHallTicket', label: 'JEE Hall Ticket' },
        { name: 'jeeRankCard', label: 'JEE Rank Card' },
      ];

      for (const { name, label } of fileFields) {
        if (formData[name]) {
          const buffer = formData[name];
          const isPdf = buffer.toString('hex').startsWith('25504446');
          doc.text(`${label}:`);
          if (isPdf) {
            doc.fontSize(10).text('PDF document attached (view separately)', { indent: 10 });
          } else {
            try {
              doc.image(buffer, {
                fit: [250, 250],
                align: 'center',
                valign: 'center',
              });
            } catch (error) {
              doc.text('Error embedding image', { indent: 10 });
            }
          }
          doc.moveDown();
        } else {
          doc.text(`${label}: Not uploaded`);
          doc.moveDown();
        }
      }

      doc.end();
    } catch (error) {
      console.error('Error generating PDF:', error);
      res.status(500).json({ message: `Error generating PDF: ${error.message}` });
    }
  }
);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));