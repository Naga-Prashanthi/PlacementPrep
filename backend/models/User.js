const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name:       { type: String, required: true },
  email:      { type: String, required: true, unique: true },
  password:   { type: String, required: true },
  role:       { type: String, enum: ['student', 'admin'], default: 'student' },
  // Extended profile
  profilePicture: { type: String, default: '' },
  aboutMe:        { type: String, default: '' },
  college:        { type: String, default: '' },
  branch:         { type: String, default: '' },
  graduationYear: { type: Number, default: null },
  targetCompany:  { type: String, default: '' },
  cgpa:           { type: Number, default: 0 },
  backlogs:       { type: Number, default: 0 },
  skills:         [{ type: String }],
  githubProfile:  { type: String, default: '' },
  linkedinProfile:{ type: String, default: '' },
  leetcodeUsername:{ type: String, default: '' },
  // Progress counters
  progress: {
    dsaSolved:         { type: Number, default: 0 },
    sqlSolved:         { type: Number, default: 0 },
    aptitudeSolved:    { type: Number, default: 0 },
    technicalCleared:  { type: Number, default: 0 },
    hrCleared:         { type: Number, default: 0 },
    interviewsCleared: { type: Number, default: 0 },
    streak:            { type: Number, default: 0 },
    lastActiveDate:    { type: Date,   default: null },
  },
  // Per-question progress
  questionProgress: [{
    questionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Question' },
    status: {
      type: String,
      enum: ['Not Started', 'Attempted', 'Solved'],
      default: 'Not Started'
    },
    adminApproved: { type: Boolean, default: false },
  }],
  // Bookmarks
  bookmarks: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Question' }],
  // Notes: key = questionId, value = text
  notes: [{ questionId: String, text: String }],
  // Notifications from admin
  notifications: [{
    message: String,
    read: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now }
  }],
  // Recent activity log
  recentActivity: [{
    description: String,
    createdAt: { type: Date, default: Date.now }
  }],
  // Achievements list
  achievements: [{ title: String, description: String, icon: String, earnedAt: { type: Date, default: Date.now } }],
  registeredAt: { type: Date, default: Date.now },
  
  // AI Feature data
  aiMentorHistory: [{
    role: { type: String, enum: ['user', 'model'] },
    parts: [{ text: String }],
    timestamp: { type: Date, default: Date.now }
  }],
  resumeAnalysis: {
    atsScore: { type: Number, default: 0 },
    feedback: { type: String, default: '' },
    missingSkills: [{ type: String }],
    lastAnalyzed: { type: Date }
  },
  companyReadiness: {
    type: Map,
    of: Number,
    default: {}
  }
});

userSchema.pre('save', async function() {
  if (!this.isModified('password')) return;
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

userSchema.methods.matchPassword = async function(enteredPassword) {
  if (this.password && !this.password.startsWith('$2a$') && !this.password.startsWith('$2b$')) {
    return enteredPassword === this.password;
  }
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
