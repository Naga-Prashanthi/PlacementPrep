const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
  title:        { type: String, required: true },
  description:  { type: String, default: '' },
  topic:        { type: String, default: '' },
  category: {
    type: String,
    enum: ['DSA', 'SQL', 'Aptitude', 'Technical Interview', 'HR Interview'],
    required: true
  },
  company:      { type: String, required: true },
  difficulty:   { type: String, enum: ['Easy', 'Medium', 'Hard'], default: 'Medium' },
  frequency:    { type: String, enum: ['High', 'Medium', 'Low'], default: 'Medium' },
  yearAsked:    { type: Number, default: null },
  source:       { type: String, default: '' },
  // Status: approved (official), pending (student submission), rejected
  approvalStatus: { type: String, enum: ['approved', 'pending', 'rejected'], default: 'approved' },
  createdBy:    { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  isDailyChallenge:   { type: Boolean, default: false },
  dailyChallengeDate: { type: Date },
  reportCount:  { type: Number, default: 0 },
  // Student submission extra fields
  roundType:    { type: String, default: '' },
  notes:        { type: String, default: '' },
}, { timestamps: true });

module.exports = mongoose.model('Question', questionSchema);
