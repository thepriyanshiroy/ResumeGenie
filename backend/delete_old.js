const mongoose = require('mongoose');
require('dotenv').config({ path: './config.env' });
mongoose.connect(process.env.DATABASE_LOCAL || process.env.DATABASE).then(async () => {
  const Resume = require('./src/models/resumeModel');
  const result = await Resume.deleteMany({ filePath: { $regex: '/raw/' } });
  console.log('Deleted resumes:', result.deletedCount);
  process.exit(0);
}).catch(err => {
  console.error(err);
  process.exit(1);
});
