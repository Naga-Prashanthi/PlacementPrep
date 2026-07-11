const dotenv = require('dotenv');
dotenv.config({ path: __dirname + '/.env' });
console.log('URI:', process.env.MONGODB_URI);
