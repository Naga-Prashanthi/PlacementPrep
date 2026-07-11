const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const cron = require('node-cron');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');

const Question        = require('./models/Question');
const User            = require('./models/User');
const PlacementDrive  = require('./models/PlacementDrive');
const VivaSession     = require('./models/VivaSession');
const InterviewSession = require('./models/InterviewSession');

dotenv.config({ path: __dirname + '/.env' });
const app = express();
app.use(cors());
app.use(express.json({ limit: '5mb' }));

// ─── DB ───────────────────────────────────────────────────────────────────────
const MONGODB_URI = process.env.MONGODB_URI;
if (!MONGODB_URI) {
  console.error("FATAL ERROR: MONGODB_URI is not defined in .env file.");
  process.exit(1);
}
mongoose.connect(MONGODB_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB error:', err));

// ─── JWT helpers ─────────────────────────────────────────────────────────────
const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  console.error("FATAL ERROR: JWT_SECRET is not defined in .env file.");
  process.exit(1);
}

const generateToken = (id) =>
  jwt.sign({ id }, JWT_SECRET, { expiresIn: '7d' });

const protect = async (req, res, next) => {
  const auth = req.headers.authorization;
  if (!auth || !auth.startsWith('Bearer '))
    return res.status(401).json({ message: 'No token. Unauthorized.' });
  try {
    const decoded = jwt.verify(auth.split(' ')[1], JWT_SECRET);
    req.user = await User.findById(decoded.id).select('-password');
    if (!req.user) return res.status(401).json({ message: 'User not found.' });
    next();
  } catch {
    res.status(401).json({ message: 'Invalid token.' });
  }
};

const adminOnly = (req, res, next) => {
  if (req.user && req.user.role === 'admin') return next();
  res.status(403).json({ message: 'Admin access only.' });
};

// ─── CRON: daily challenge refresh ───────────────────────────────────────────
cron.schedule('0 0 * * *', async () => {
  try {
    await Question.updateMany({ isDailyChallenge: true }, { isDailyChallenge: false });
    const categories = ['DSA', 'SQL', 'Aptitude', 'Technical Interview', 'HR Interview'];
    const today = new Date(); today.setHours(0, 0, 0, 0);
    for (const cat of categories) {
      const [q] = await Question.aggregate([
        { $match: { category: cat, approvalStatus: 'approved' } },
        { $sample: { size: 1 } }
      ]);
      if (q) await Question.findByIdAndUpdate(q._id, { isDailyChallenge: true, dailyChallengeDate: today });
    }
    console.log('Daily challenges updated.');
  } catch (err) { console.error('Cron error:', err); }
});

// ─── AI ROUTES ───────────────────────────────────────────────────────────────
const aiRoutes = require('./ai_routes');
app.use('/api/ai', protect, aiRoutes);

// ═══════════════════════════════════════════════════════════════════════════════
// AUTH ROUTES
// ═══════════════════════════════════════════════════════════════════════════════

app.post('/api/auth/register', async (req, res) => {
  try {
    const { name, email, password, college, branch, graduationYear, targetCompany } = req.body;
    if (await User.findOne({ email }))
      return res.status(400).json({ message: 'Email already registered.' });
    const user = await User.create({ name, email, password, college, branch, graduationYear, targetCompany, role: 'student' });
    res.status(201).json({ _id: user._id, name: user.name, email: user.email, role: user.role, token: generateToken(user._id) });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ message: 'No account found with this email. Please sign up first.' });
    if (!(await user.matchPassword(password))) return res.status(401).json({ message: 'Incorrect password.' });
    res.json({
      _id: user._id, name: user.name, email: user.email, role: user.role,
      college: user.college, branch: user.branch, graduationYear: user.graduationYear,
      targetCompany: user.targetCompany, cgpa: user.cgpa, backlogs: user.backlogs,
      profilePicture: user.profilePicture, aboutMe: user.aboutMe, skills: user.skills,
      githubProfile: user.githubProfile, linkedinProfile: user.linkedinProfile, leetcodeUsername: user.leetcodeUsername,
      progress: user.progress, questionProgress: user.questionProgress,
      bookmarks: user.bookmarks, achievements: user.achievements,
      registeredAt: user.registeredAt,
      token: generateToken(user._id)
    });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

app.get('/api/auth/me', protect, (req, res) => res.json(req.user));

app.put('/api/auth/profile', protect, async (req, res) => {
  try {
    const { name, college, branch, graduationYear, targetCompany, cgpa, backlogs, profilePicture, aboutMe, skills, githubProfile, linkedinProfile, leetcodeUsername } = req.body;
    const user = await User.findById(req.user._id);
    if (name !== undefined) user.name = name;
    if (college !== undefined) user.college = college;
    if (branch !== undefined) user.branch = branch;
    if (graduationYear !== undefined) user.graduationYear = graduationYear;
    if (targetCompany !== undefined) user.targetCompany = targetCompany;
    if (cgpa !== undefined) user.cgpa = cgpa;
    if (backlogs !== undefined) user.backlogs = backlogs;
    if (profilePicture !== undefined) user.profilePicture = profilePicture;
    if (aboutMe !== undefined) user.aboutMe = aboutMe;
    if (skills !== undefined) user.skills = skills;
    if (githubProfile !== undefined) user.githubProfile = githubProfile;
    if (linkedinProfile !== undefined) user.linkedinProfile = linkedinProfile;
    if (leetcodeUsername !== undefined) user.leetcodeUsername = leetcodeUsername;
    await user.save();
    res.json({ message: 'Profile updated.', user });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// ═══════════════════════════════════════════════════════════════════════════════
// STUDENT ROUTES
// ═══════════════════════════════════════════════════════════════════════════════

app.get('/api/student/profile', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .select('-password')
      .populate('questionProgress.questionId', 'title category company difficulty');
    res.json(user);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

app.post('/api/student/bookmark', protect, async (req, res) => {
  try {
    const { questionId } = req.body;
    const user = await User.findById(req.user._id);
    const idx = user.bookmarks.indexOf(questionId);
    if (idx > -1) user.bookmarks.splice(idx, 1);
    else user.bookmarks.push(questionId);
    await user.save();
    res.json({ bookmarks: user.bookmarks });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

app.post('/api/student/note', protect, async (req, res) => {
  try {
    const { questionId, text } = req.body;
    const user = await User.findById(req.user._id);
    const existing = user.notes.find(n => n.questionId === questionId);
    if (existing) existing.text = text;
    else user.notes.push({ questionId, text });
    await user.save();
    res.json({ notes: user.notes });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

app.get('/api/student/notifications', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    res.json(user.notifications);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

app.put('/api/student/notifications/read', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    user.notifications.forEach(n => { n.read = true; });
    await user.save();
    res.json({ message: 'All notifications marked read.' });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

app.post('/api/student/eligibility', protect, async (req, res) => {
  try {
    const { cgpa, backlogs } = req.body;
    const eligibility = [
      { company: 'Google',     minCGPA: 8.0, maxBacklogs: 0, eligible: cgpa >= 8.0 && backlogs === 0 },
      { company: 'Microsoft',  minCGPA: 7.5, maxBacklogs: 0, eligible: cgpa >= 7.5 && backlogs === 0 },
      { company: 'Amazon',     minCGPA: 7.0, maxBacklogs: 0, eligible: cgpa >= 7.0 && backlogs === 0 },
      { company: 'Wipro',      minCGPA: 6.5, maxBacklogs: 0, eligible: cgpa >= 6.5 && backlogs === 0 },
      { company: 'Cognizant',  minCGPA: 6.5, maxBacklogs: 0, eligible: cgpa >= 6.5 && backlogs === 0 },
      { company: 'Capgemini',  minCGPA: 6.0, maxBacklogs: 1, eligible: cgpa >= 6.0 && backlogs <= 1 },
      { company: 'Infosys',    minCGPA: 6.0, maxBacklogs: 0, eligible: cgpa >= 6.0 && backlogs === 0 },
      { company: 'TCS',        minCGPA: 6.0, maxBacklogs: 0, eligible: cgpa >= 6.0 && backlogs === 0 },
      { company: 'Accenture',  minCGPA: 5.0, maxBacklogs: 2, eligible: cgpa >= 5.0 && backlogs <= 2 },
    ];
    res.json(eligibility);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// ─── Student Question Submission ──────────────────────────────────────────────
app.post('/api/student/submit-question', protect, async (req, res) => {
  try {
    const { company, category, title, description, difficulty, yearAsked, roundType, notes } = req.body;
    const q = await Question.create({
      company, category, title, description,
      difficulty: difficulty || 'Medium',
      yearAsked: yearAsked || new Date().getFullYear(),
      roundType, notes,
      approvalStatus: 'pending',
      createdBy: req.user._id,
    });
    res.status(201).json({ message: 'Question submitted for review!', question: q });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// ─── Question Status Update ───────────────────────────────────────────────────
app.post('/api/questions/status', protect, async (req, res) => {
  try {
    const { questionId, status } = req.body;
    if (!['Attempted', 'Solved'].includes(status))
      return res.status(400).json({ message: 'Invalid status.' });

    const effectiveStatus = status; // Mock verification: rely on frontend's logic

    const user = await User.findById(req.user._id);
    const q    = await Question.findById(questionId);
    if (!q) return res.status(404).json({ message: 'Question not found.' });

    const existing = user.questionProgress.find(qp => qp.questionId.toString() === questionId);
    const wasSolved = existing && existing.status === 'Solved';

    if (existing) {
      if (existing.status !== 'Solved') {
        existing.status = effectiveStatus;
        if (effectiveStatus === 'Solved') existing.solvedAt = new Date();
      }
    } else {
      user.questionProgress.push({ 
        questionId, 
        status: effectiveStatus,
        ...(effectiveStatus === 'Solved' ? { solvedAt: new Date() } : {})
      });
    }

    if (!wasSolved && effectiveStatus === 'Solved') {
      if (q.category === 'DSA')                 user.progress.dsaSolved = (user.progress.dsaSolved || 0) + 1;
      if (q.category === 'SQL')                 user.progress.sqlSolved = (user.progress.sqlSolved || 0) + 1;
      if (q.category === 'Aptitude')            user.progress.aptitudeSolved = (user.progress.aptitudeSolved || 0) + 1;
      if (q.category === 'Technical Interview') user.progress.technicalCleared = (user.progress.technicalCleared || 0) + 1;
      if (q.category === 'HR Interview')        user.progress.hrCleared = (user.progress.hrCleared || 0) + 1;
    }

    user.recentActivity.unshift({ description: `${effectiveStatus} "${q.title}"` });
    if (user.recentActivity.length > 20) user.recentActivity = user.recentActivity.slice(0, 20);
    await user.save();

    res.json({ questionProgress: user.questionProgress, progress: user.progress,
      message: effectiveStatus === 'Attempted' ? 'Marked as Attempted.' : 'Marked as Solved.' });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// ═══════════════════════════════════════════════════════════════════════════════
// QUESTIONS (public read, admin write)
// ═══════════════════════════════════════════════════════════════════════════════

app.get('/api/questions', async (req, res) => {
  try {
    const { category, company, difficulty, search, status } = req.query;
    const query = { approvalStatus: status || 'approved' };
    if (category)  query.category  = category;
    if (company)   query.company   = new RegExp(`^${company}$`, 'i');
    if (difficulty) query.difficulty = difficulty;
    if (search)    query.title     = new RegExp(search, 'i');
    res.json(await Question.find(query).sort({ reportCount: -1, createdAt: -1 }));
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// Analytics: trending/frequent questions (MUST be before :id route)
app.get('/api/questions/analytics', async (req, res) => {
  try {
    const trending  = await Question.find({ approvalStatus: 'approved' }).sort({ reportCount: -1 }).limit(10);
    const byCompany = await Question.aggregate([
      { $match: { approvalStatus: 'approved' } },
      { $group: { _id: '$company', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);
    const byCategory = await Question.aggregate([
      { $match: { approvalStatus: 'approved' } },
      { $group: { _id: '$category', count: { $sum: 1 } } }
    ]);
    res.json({ trending, byCompany, byCategory });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

app.get('/api/questions/:id', async (req, res) => {
  try {
    const q = await Question.findById(req.params.id);
    if (!q) return res.status(404).json({ message: 'Question not found.' });
    res.json(q);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

app.get('/api/challenges/daily', async (req, res) => {
  try {
    res.json(await Question.find({ isDailyChallenge: true, approvalStatus: 'approved' }));
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// ═══════════════════════════════════════════════════════════════════════════════
// ADMIN ROUTES
// ═══════════════════════════════════════════════════════════════════════════════

app.get('/api/admin/students', protect, adminOnly, async (req, res) => {
  try {
    res.json(await User.find({ role: 'student' }).select('-password'));
  } catch (err) { res.status(500).json({ message: err.message }); }
});

app.post('/api/admin/approve', protect, adminOnly, async (req, res) => {
  try {
    const { studentId, questionId } = req.body;
    const student = await User.findById(studentId);
    if (!student) return res.status(404).json({ message: 'Student not found.' });
    const qp = student.questionProgress.find(q => q.questionId.toString() === questionId);
    if (qp) { qp.status = 'Solved'; qp.adminApproved = true; }
    else student.questionProgress.push({ questionId, status: 'Solved', adminApproved: true });
    await student.save();
    res.json({ message: 'Question approved as Solved.' });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

app.post('/api/admin/notify', protect, adminOnly, async (req, res) => {
  try {
    const { message } = req.body;
    await User.updateMany({ role: 'student' }, { $push: { notifications: { message } } });
    res.json({ message: 'Notification sent to all students.' });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// Admin: full question CRUD
app.post('/api/admin/questions', protect, adminOnly, async (req, res) => {
  try {
    const { title, category, company, description, difficulty, frequency, topic, yearAsked, source } = req.body;
    const q = await Question.create({
      title, category, company, description,
      difficulty: difficulty || 'Medium',
      frequency:  frequency  || 'Medium',
      topic, yearAsked, source,
      approvalStatus: 'approved',
      createdBy: req.user._id,
    });
    res.status(201).json(q);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

app.put('/api/admin/questions/:id', protect, adminOnly, async (req, res) => {
  try {
    const q = await Question.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!q) return res.status(404).json({ message: 'Question not found.' });
    res.json(q);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

app.delete('/api/admin/questions/:id', protect, adminOnly, async (req, res) => {
  try {
    await Question.findByIdAndDelete(req.params.id);
    res.json({ message: 'Question deleted.' });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// Admin: moderate student-submitted questions
app.get('/api/admin/submissions', protect, adminOnly, async (req, res) => {
  try {
    const submissions = await Question.find({ approvalStatus: 'pending' })
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 });
    res.json(submissions);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

app.put('/api/admin/submissions/:id', protect, adminOnly, async (req, res) => {
  try {
    const { action, ...updates } = req.body; // action: 'approve' | 'reject'
    const status = action === 'approve' ? 'approved' : 'rejected';
    const q = await Question.findByIdAndUpdate(req.params.id, { ...updates, approvalStatus: status }, { new: true });
    res.json({ message: `Submission ${status}.`, question: q });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// Admin: refresh daily challenges manually
app.get('/api/challenges/refresh', protect, adminOnly, async (req, res) => {
  try {
    await Question.updateMany({ isDailyChallenge: true }, { isDailyChallenge: false });
    const categories = ['DSA', 'SQL', 'Aptitude'];
    for (const cat of categories) {
      const [q] = await Question.aggregate([
        { $match: { category: cat, approvalStatus: 'approved' } },
        { $sample: { size: 1 } }
      ]);
      if (q) await Question.findByIdAndUpdate(q._id, { isDailyChallenge: true });
    }
    res.json({ message: 'Daily challenges refreshed.' });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// Admin analytics
app.get('/api/admin/analytics', protect, adminOnly, async (req, res) => {
  try {
    const students       = await User.find({ role: 'student' }).select('-password');
    const totalStudents  = students.length;
    const totalQuestions = await Question.countDocuments({ approvalStatus: 'approved' });
    const pendingSubmissions = await Question.countDocuments({ approvalStatus: 'pending' });
    const avgDSA = students.reduce((s, u) => s + (u.progress?.dsaSolved || 0), 0) / (totalStudents || 1);
    const avgSQL = students.reduce((s, u) => s + (u.progress?.sqlSolved || 0), 0) / (totalStudents || 1);

    const vivaCount      = await VivaSession.countDocuments({ completed: true });
    const interviewCount = await InterviewSession.countDocuments({ completed: true });

    const questionMap = {};
    students.forEach(student => {
      student.questionProgress.forEach(qp => {
        const id = qp.questionId?.toString();
        if (!id) return;
        if (!questionMap[id]) questionMap[id] = { attempted: 0, solved: 0 };
        if (qp.status === 'Attempted') questionMap[id].attempted++;
        if (qp.status === 'Solved')    questionMap[id].solved++;
      });
    });

    res.json({
      totalStudents, totalQuestions, pendingSubmissions,
      avgDSA: avgDSA.toFixed(1), avgSQL: avgSQL.toFixed(1),
      vivaCount, interviewCount, questionMap
    });
  } catch (err) { res.status(500).json({ message: err.message }); }
});
// Setup nodemailer transporter
const transporter = nodemailer.createTransport({
  service: 'gmail', // Use your preferred email service
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// Admin: send notification to all students
app.post('/api/admin/notify', protect, adminOnly, async (req, res) => {
  try {
    const { message } = req.body;
    if (!message || !message.trim()) return res.status(400).json({ message: 'Message is required.' });
    
    const students = await User.find({ role: 'student' });
    const notification = { message: message.trim(), read: false, createdAt: new Date() };
    
    // Save to database
    for (const student of students) {
      student.notifications.unshift(notification);
      if (student.notifications.length > 50) student.notifications = student.notifications.slice(0, 50);
      await student.save();
    }

    // Send emails in background
    if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
      const emailPromises = students.map(student => {
        const mailOptions = {
          from: `"PlacementPrep" <${process.env.EMAIL_USER}>`,
          to: student.email,
          subject: 'Important Notification from PlacementPrep Admin',
          text: `Hello ${student.name},\n\nYou have a new notification:\n\n${message.trim()}\n\nBest regards,\nPlacementPrep Team`,
          html: `<p>Hello <strong>${student.name}</strong>,</p>
                 <p>You have a new notification:</p>
                 <blockquote style="border-left: 4px solid #2563eb; padding-left: 10px; margin-left: 0; color: #374151;">
                   ${message.trim()}
                 </blockquote>
                 <p>Best regards,<br><strong>PlacementPrep Team</strong></p>`
        };
        return transporter.sendMail(mailOptions).catch(err => console.error('Email failed for', student.email, err));
      });
      // Fire and forget
      Promise.all(emailPromises);
    } else {
      console.log('EMAIL_USER or EMAIL_PASS not set in .env. Skipping real emails.');
    }

    res.json({ message: `Notification sent to ${students.length} students.` });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// Placement Drives
app.post('/api/admin/drives', protect, adminOnly, async (req, res) => {
  try {
    const drive = await PlacementDrive.create(req.body);
    res.status(201).json(drive);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

app.get('/api/admin/drives', protect, async (req, res) => {
  try {
    res.json(await PlacementDrive.find().sort({ createdAt: -1 }));
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// ═══════════════════════════════════════════════════════════════════════════════
// VIVA SIMULATOR ROUTES
// ═══════════════════════════════════════════════════════════════════════════════

app.post('/api/viva/start', protect, async (req, res) => {
  try {
    const { projectName, techStack, questions } = req.body;
    const session = await VivaSession.create({
      student: req.user._id,
      projectName,
      techStack,
      questions: questions.map(q => ({ question: q, answer: '', answered: false })),
      totalQuestions: questions.length,
    });
    res.status(201).json(session);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

app.put('/api/viva/:id/answer', protect, async (req, res) => {
  try {
    const { questionIndex, answer, timeTaken } = req.body;
    const session = await VivaSession.findById(req.params.id);
    if (!session) return res.status(404).json({ message: 'Session not found.' });
    if (session.student.toString() !== req.user._id.toString())
      return res.status(403).json({ message: 'Access denied.' });

    session.questions[questionIndex].answer   = answer;
    session.questions[questionIndex].answered = answer.trim().length > 0;
    session.questions[questionIndex].timeTaken = timeTaken || 0;
    await session.save();
    res.json(session);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

app.put('/api/viva/:id/complete', protect, async (req, res) => {
  try {
    const session = await VivaSession.findById(req.params.id);
    if (!session) return res.status(404).json({ message: 'Session not found.' });

    const answeredCount = session.questions.filter(q => q.answered).length;
    const completionPercent = Math.round((answeredCount / session.totalQuestions) * 100);
    const score = Math.round(completionPercent * 0.8 + (answeredCount > 5 ? 10 : 0));

    session.answeredCount     = answeredCount;
    session.completionPercent = completionPercent;
    session.score             = Math.min(score, 100);
    session.completed         = true;

    // determine weak areas (unanswered questions)
    session.weakAreas = session.questions
      .filter(q => !q.answered)
      .map(q => q.question)
      .slice(0, 5);

    await session.save();

    // log activity
    const user = await User.findById(req.user._id);
    user.recentActivity.unshift({ description: `Completed Viva: ${session.projectName} (Score: ${session.score}%)` });
    if (user.recentActivity.length > 20) user.recentActivity = user.recentActivity.slice(0, 20);
    await user.save();

    res.json(session);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

app.get('/api/viva/my', protect, async (req, res) => {
  try {
    const sessions = await VivaSession.find({ student: req.user._id }).sort({ createdAt: -1 });
    res.json(sessions);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

app.get('/api/viva/:id', protect, async (req, res) => {
  try {
    const session = await VivaSession.findById(req.params.id);
    if (!session) return res.status(404).json({ message: 'Session not found.' });
    res.json(session);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// ═══════════════════════════════════════════════════════════════════════════════
// INTERVIEW SIMULATOR ROUTES
// ═══════════════════════════════════════════════════════════════════════════════

app.post('/api/interview/start', protect, async (req, res) => {
  try {
    const { interviewType, company, questions } = req.body;
    const session = await InterviewSession.create({
      student: req.user._id,
      interviewType,
      company: company || '',
      questions: questions.map(q => ({ question: q, transcript: '', timeTaken: 0, completed: false })),
    });
    res.status(201).json(session);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

app.put('/api/interview/:id/answer', protect, async (req, res) => {
  try {
    const { questionIndex, transcript, timeTaken } = req.body;
    const session = await InterviewSession.findById(req.params.id);
    if (!session) return res.status(404).json({ message: 'Session not found.' });

    session.questions[questionIndex].transcript = transcript;
    session.questions[questionIndex].timeTaken  = timeTaken || 0;
    session.questions[questionIndex].completed  = transcript.trim().length > 5;
    await session.save();
    res.json(session);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

app.put('/api/interview/:id/complete', protect, async (req, res) => {
  try {
    const { totalDuration } = req.body;
    const session = await InterviewSession.findById(req.params.id);
    if (!session) return res.status(404).json({ message: 'Session not found.' });

    const questionsAttempted = session.questions.filter(q => q.transcript.trim().length > 0).length;
    const questionsCompleted = session.questions.filter(q => q.completed).length;
    const overallScore = Math.round((questionsCompleted / session.questions.length) * 100);

    session.questionsAttempted = questionsAttempted;
    session.questionsCompleted = questionsCompleted;
    session.overallScore       = overallScore;
    session.totalDuration      = totalDuration || 0;
    session.completed          = true;
    session.strengths  = questionsCompleted >= session.questions.length * 0.7
      ? ['Good question coverage', 'Consistent answers'] : ['Attempted all questions'];
    session.weaknesses = questionsCompleted < session.questions.length * 0.5
      ? ['Low answer completion', 'Short responses'] : ['Some answers need elaboration'];

    await session.save();

    const user = await User.findById(req.user._id);
    user.progress.interviewsCleared = (user.progress.interviewsCleared || 0) + 1;
    user.recentActivity.unshift({ description: `Completed ${session.interviewType} Mock Interview (Score: ${overallScore}%)` });
    if (user.recentActivity.length > 20) user.recentActivity = user.recentActivity.slice(0, 20);
    await user.save();

    res.json(session);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

app.get('/api/interview/my', protect, async (req, res) => {
  try {
    const sessions = await InterviewSession.find({ student: req.user._id }).sort({ createdAt: -1 });
    res.json(sessions);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

app.get('/api/interview/:id', protect, async (req, res) => {
  try {
    const session = await InterviewSession.findById(req.params.id);
    if (!session) return res.status(404).json({ message: 'Session not found.' });
    res.json(session);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// ─── START ────────────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
