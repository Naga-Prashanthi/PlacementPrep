const mongoose = require('mongoose');

const interviewSessionSchema = new mongoose.Schema({
  student:       { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  interviewType: {
    type: String,
    enum: ['HR', 'Technical', 'SQL', 'DSA', 'Company-Specific'],
    required: true
  },
  company:       { type: String, default: '' }, // for company-specific
  questions: [{
    question:    { type: String },
    transcript:  { type: String, default: '' }, // spoken → text
    timeTaken:   { type: Number, default: 0 },  // seconds
    completed:   { type: Boolean, default: false },
  }],
  totalDuration:     { type: Number, default: 0 }, // seconds
  questionsAttempted: { type: Number, default: 0 },
  questionsCompleted: { type: Number, default: 0 },
  overallScore:       { type: Number, default: 0 },
  strengths:          [{ type: String }],
  weaknesses:         [{ type: String }],
  completed:          { type: Boolean, default: false },
}, { timestamps: true });

module.exports = mongoose.model('InterviewSession', interviewSessionSchema);
