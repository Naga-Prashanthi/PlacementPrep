const mongoose = require('mongoose');
const Question = require('../models/Question');
const User = require('../models/User');

const companyData = {
  "Amazon": {
    "DSA": ["Two Sum", "Merge Intervals", "Top K Frequent Elements", "Number of Islands", "LRU Cache", "Product of Array Except Self", "K Closest Points to Origin", "Meeting Rooms", "Binary Tree Level Order Traversal", "Word Ladder"],
    "SQL": ["INNER JOIN", "LEFT JOIN", "Window Functions", "RANK and DENSE_RANK", "Top N Salary", "Employee Manager Queries", "Group By and Having", "Subqueries"],
    "Aptitude": ["Profit and Loss", "Time and Work", "Probability", "Permutation and Combination", "Data Interpretation"],
    "Technical Interview": ["OOPs Concepts", "DBMS", "Operating Systems", "REST APIs", "Java Collections"],
    "HR Interview": ["Tell me about yourself", "Why Amazon?", "Leadership Principles Example", "Conflict Resolution Experience", "Career Goals"]
  },
  "Google": {
    "DSA": ["Longest Substring Without Repeating Characters", "Median of Two Sorted Arrays", "Trapping Rain Water", "Course Schedule", "Clone Graph", "Word Search II", "Merge K Sorted Lists", "Alien Dictionary", "Minimum Window Substring", "Serialize and Deserialize Binary Tree"],
    "SQL": ["Complex Joins", "Window Functions", "CTE Queries", "Recursive Queries", "Ranking Functions", "Aggregation Problems", "Data Analysis Queries"],
    "Aptitude": ["Logical Reasoning", "Analytical Ability", "Number Series", "Puzzles", "Data Sufficiency"],
    "Technical Interview": ["System Design Basics", "Computer Networks", "DBMS", "Operating Systems", "Scalability Concepts"],
    "HR Interview": ["Why Google?", "Explain a difficult problem you solved", "Teamwork Experience", "Innovation Example", "Leadership Experience"]
  },
  "Microsoft": {
    "DSA": ["Rotate Image", "Search in Rotated Sorted Array", "Implement Trie", "Meeting Rooms II", "Merge Intervals", "Maximum Subarray", "Lowest Common Ancestor", "Copy List with Random Pointer"],
    "SQL": ["Joins", "Views", "Stored Procedures", "Triggers", "Window Functions", "Ranking Queries"],
    "Aptitude": ["Probability", "Logical Reasoning", "Quantitative Aptitude", "Data Interpretation", "Analytical Thinking"],
    "Technical Interview": ["OOPs", "Design Patterns", "DBMS", "OS", "Networking"],
    "HR Interview": ["Why Microsoft?", "Strengths and Weaknesses", "Challenging Project Experience", "Leadership Example"]
  },
  "Infosys": {
    "DSA": ["Array Rotation", "Missing Number", "Palindrome String", "Fibonacci Series", "Reverse Linked List", "Binary Search", "Matrix Traversal", "Anagram Check"],
    "SQL": ["INNER JOIN", "LEFT JOIN", "GROUP BY", "HAVING", "Normalization Queries", "Aggregate Functions"],
    "Aptitude": ["Profit and Loss", "Time and Work", "Number Series", "Coding Decoding", "Probability"],
    "Technical Interview": ["OOPs Concepts", "Java Basics", "DBMS Normalization", "SQL Joins", "Collections Framework"],
    "HR Interview": ["Tell me about yourself", "Why Infosys?", "Explain your project", "Future Goals", "Strengths and Weaknesses"]
  },
  "TCS": {
    "DSA": ["Prime Number", "Factorial", "String Reversal", "Remove Duplicates", "Matrix Addition", "Frequency Count", "Array Sorting"],
    "SQL": ["Joins", "Aggregate Functions", "Group By", "Subqueries", "Constraints"],
    "Aptitude": ["Percentages", "Time and Distance", "Quantitative Aptitude", "Data Interpretation", "Logical Reasoning"],
    "Technical Interview": ["Java Basics", "OOPs", "DBMS", "Operating Systems", "Computer Networks"],
    "HR Interview": ["Why TCS?", "Tell me about yourself", "Teamwork Experience", "Project Explanation"]
  },
  "Cognizant": {
    "DSA": ["Two Sum", "Valid Parentheses", "Maximum Subarray", "Merge Sorted Arrays", "Linked List Cycle", "Reverse String", "Binary Search", "Longest Common Prefix"],
    "SQL": ["Joins", "Subqueries", "Window Functions", "Ranking Queries", "Aggregate Functions"],
    "Aptitude": ["Probability", "Blood Relations", "Seating Arrangement", "Puzzles", "Logical Reasoning"],
    "Technical Interview": ["Java Collections", "Exception Handling", "DBMS Basics", "Operating Systems", "OOPs Concepts"],
    "HR Interview": ["Why Cognizant?", "Explain your final year project", "Career Goals", "Strengths and Weaknesses"]
  },
  "Accenture": {
    "DSA": ["Find Missing Number", "Majority Element", "Rotate Array", "Maximum Product Subarray", "Stock Buy and Sell", "Kadane Algorithm", "Queue Problems", "Stack Problems"],
    "SQL": ["Joins", "Window Functions", "Views", "Stored Procedures", "Subqueries"],
    "Aptitude": ["Percentages", "Time and Work", "Logical Reasoning", "Probability", "Data Interpretation"],
    "Technical Interview": ["Java", "DBMS", "OOPs", "REST APIs", "Software Development Lifecycle"],
    "HR Interview": ["Why Accenture?", "Leadership Experience", "Project Challenges", "Future Career Plans"]
  }
};

const dotenv = require('dotenv');
dotenv.config({ path: __dirname + '/../.env' });

const seedData = async () => {
  const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/placementTracker';
  await mongoose.connect(uri);
  console.log('Connected to DB');

  // Safe Seeding: Only clear questions, DO NOT clear users.
  await Question.deleteMany();
  // await User.deleteMany(); // Removed to safeguard registered students

  // Create an Admin user only if it doesn't exist
  let admin = await User.findOne({ email: 'admin@admin.com' });
  if (!admin) {
    admin = new User({
      name: 'Admin',
      email: 'admin@admin.com',
      password: 'adminpassword',
      role: 'admin'
    });
    await admin.save();
    console.log('Created Admin (admin@admin.com / adminpassword)');
  } else {
    console.log('Admin account already exists.');
  }

  // Create a default Student user only if it doesn't exist
  let student = await User.findOne({ email: 'student@student.com' });
  if (!student) {
    student = new User({
      name: 'John Doe',
      email: 'student@student.com',
      password: 'studentpassword',
      role: 'student'
    });
    await student.save();
    console.log('Created Student (student@student.com / studentpassword)');
  } else {
    console.log('Default student account already exists.');
  }

  const questionsToInsert = [];

  for (const company of Object.keys(companyData)) {
    for (const category of Object.keys(companyData[company])) {
      const qs = companyData[company][category];
      for (const title of qs) {
        questionsToInsert.push({
          title,
          category,
          company
        });
      }
    }
  }

  await Question.insertMany(questionsToInsert);
  console.log('Inserted All Company Specific Questions!');

  console.log('Seeding complete!');
  process.exit();
};

seedData().catch(err => {
  console.error(err);
  process.exit(1);
});
