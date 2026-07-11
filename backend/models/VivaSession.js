const mongoose = require('mongoose');

const vivaSessionSchema = new mongoose.Schema({
  student:      { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  projectName:  { type: String, required: true },
  techStack:    { type: String, required: true },
  questions: [{
    question:   { type: String },
    answer:     { type: String, default: '' },
    answered:   { type: Boolean, default: false },
    timeTaken:  { type: Number, default: 0 }, // seconds
  }],
  score:              { type: Number, default: 0 },
  totalQuestions:     { type: Number, default: 0 },
  answeredCount:      { type: Number, default: 0 },
  completionPercent:  { type: Number, default: 0 },
  weakAreas:          [{ type: String }],
  completed:          { type: Boolean, default: false },
}, { timestamps: true });

module.exports = mongoose.model('VivaSession', vivaSessionSchema);
