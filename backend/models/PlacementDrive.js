const mongoose = require('mongoose');

const placementDriveSchema = new mongoose.Schema({
  companyName: { type: String, required: true },
  roleTitle: { type: String, required: true },
  jobDescription: { type: String },
  eligibility: {
    minCGPA: { type: Number, default: 0 },
    maxBacklogs: { type: Number, default: 0 },
    allowedBranches: [{ type: String }]
  },
  salaryPackage: { type: String },
  driveDate: { type: Date },
  lastDateToApply: { type: Date },
  link: { type: String },
  applicants: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('PlacementDrive', placementDriveSchema);
