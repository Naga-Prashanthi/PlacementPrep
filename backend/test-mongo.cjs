const mongoose = require('mongoose');

const uri = 'mongodb://239x1a3329_db_user:KZAAA4ZZAxkmztOP@ac-7ew9vvr-shard-00-00.qmx2wto.mongodb.net:27017,ac-7ew9vvr-shard-00-01.qmx2wto.mongodb.net:27017,ac-7ew9vvr-shard-00-02.qmx2wto.mongodb.net:27017/?ssl=true&replicaSet=atlas-2xfa5s-shard-0&authSource=admin&appName=Cluster0';

console.log('Connecting to MongoDB...');
mongoose.connect(uri)
  .then(() => {
    console.log('Successfully connected to MongoDB!');
    process.exit(0);
  })
  .catch(err => {
    console.error('Failed to connect:', err.message);
    process.exit(1);
  });
