require('dotenv').config();
const express = require('express');
const jobRoutes = require('./src/routes/jobs');
const coverLetterRoutes = require('./src/routes/coverLetters');
const { startScheduler } = require('./src/services/scheduler');

const app = express();
app.use(express.json());
app.get('/', (req, res) => res.redirect('/jobs/search'));
app.use('/jobs', jobRoutes);
app.use('/cover-letters', coverLetterRoutes);

// 전역 에러 핸들러
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: '서버 오류가 발생했습니다.' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  startScheduler();
});
