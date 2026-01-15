//const express = require('express');
//
//const pool = require('../config/db');
//const path = require('path');
//const {
//  signup,
//  sendOtp,
//  verifyOtp,
//  createPost,
//  getPosts,
//  verifyToken,
//  updateLanguage,
//  getQuestions,
//  submitAssessment
//} = require('../controllers/auth.controller');
//
//const router = express.Router();
//router.use(express.static(path.join(__dirname, '../public')));
//
//// GET PRACTICE CATEGORIES
//router.get('/categories', verifyToken, async (req, res) => {
//  const result = await pool.query('SELECT * FROM categories');
//  res.json(result.rows);
//});
//
//// Serve landing page at root
//router.get('/', (req, res) => {
//    res.sendFile(path.join(__dirname, '../public', 'index.html'));
//});
//
///* auth */
//router.post('/signup', signup);
//
///* otp */
//router.post('/send-otp', sendOtp);
//router.post('/verify-otp', verifyOtp);
//
//
///* update-language */
//router.post('/update-language', verifyToken, updateLanguage);
//
///* assessment-questions */
//router.get('/assessment/questions', verifyToken, getQuestions);
//router.post('/assessment/submit', verifyToken, submitAssessment);
//
//
//
///* posts */
//router.get('/posts', verifyToken, getPosts);
//router.post('/posts', verifyToken, createPost);
//
//
//
//
////Lessons (LEVEL BASED + LOCKED)
//router.get('/lessons', verifyToken, async (req, res) => {
//  const user = await pool.query(
//    'SELECT level,id FROM users WHERE phone=$1',
//    [req.user.phone]
//  );
//
//  const lessons = await pool.query(
//    `SELECT * FROM lessons
//     WHERE level=$1
//     ORDER BY order_no`,
//    [user.rows[0].level]
//  );
//
//  const progress = await pool.query(
//    `SELECT lesson_id, completed
//     FROM user_lessons
//     WHERE user_id=$1`,
//    [user.rows[0].id]
//  );
//
//  const completedMap = {};
//  progress.rows.forEach(p => completedMap[p.lesson_id] = p.completed);
//
//  const data = lessons.rows.map((l, i) => ({
//    ...l,
//    status:
//      completedMap[l.id] ? 'done' :
//      i === 0 || completedMap[lessons.rows[i-1]?.id] ? 'active' : 'locked'
//  }));
//
//  res.json(data);
//});
//
//// Lesson Categories (LEVEL BASED)
//router.get('/lesson-categories', verifyToken, async (req, res) => {
//  const user = await pool.query(
//    'SELECT level FROM users WHERE phone=$1',
//    [req.user.phone]
//  );
//
//  const lessons = await pool.query(
//    `SELECT id, title, description
//     FROM lessons
//     WHERE level=$1
//     ORDER BY order_no`,
//    [user.rows[0].level]
//  );
//
//  // 🔥 ALL ACTIVE
//  const data = lessons.rows.map(l => ({
//    ...l,
//    status: 'active'
//  }));
//
//  res.json(data);
//});
//
//
//
////Sub Lessons API
//router.get('/lessons/:lessonId/sub-lessons', verifyToken, async (req, res) => {
//  const result = await pool.query(
//    `SELECT * FROM sub_lessons
//     WHERE lesson_id=$1
//     ORDER BY order_no`,
//    [req.params.lessonId]
//  );
//
//  res.json(result.rows);
//});
//
////Mark Lesson Complete
//router.post('/lessons/:lessonId/complete', verifyToken, async (req, res) => {
//  const user = await pool.query(
//    'SELECT id FROM users WHERE phone=$1',
//    [req.user.phone]
//  );
//
//  await pool.query(
//    `INSERT INTO user_lessons (user_id, lesson_id, completed)
//     VALUES ($1,$2,true)
//     ON CONFLICT DO NOTHING`,
//    [user.rows[0].id, req.params.lessonId]
//  );
//
//  res.json({ success: true });
//});
//
////AI CHAT API (CATEGORY / LESSON RESTRICTED)
//router.post('/ai/chat', verifyToken, async (req, res) => {
//  const { message, mode, context } = req.body;
//
//  let systemPrompt = '';
//
//  if (mode === 'category') {
//    systemPrompt = `You are an English tutor.
//    Only talk about "${context}".
//    If user asks anything outside, politely refuse.`;
//  }
//
//  if (mode === 'lesson') {
//    systemPrompt = `
//    Teach the lesson: ${context}
//    Use simple English.
//    Give 15–30 sentences.
//    Ask 2 questions at the end.
//    `;
//  }
//
//  // 🔥 MOCK RESPONSE (replace with OpenAI later)
//  res.json({
//    reply: `${systemPrompt}\n\nSample response for: ${message}`
//  });
//});
//
//
//
//
//
//module.exports = router;





const express = require('express');
const path = require('path');
const pool = require('../config/db');
const {
  signup,
  sendOtp,
  verifyOtp,
  verifyToken,
  updateLanguage,
  getQuestions,
  submitAssessment,
  createPost,
  getPosts,
  updateProfile,
  getProfile,
  upload
} = require('../controllers/auth.controller');

const router = express.Router();

/* ================= AUTH ROUTES ================= */
router.post('/signup', signup);
router.post('/send-otp', sendOtp);
router.post('/verify-otp', verifyOtp);

/* ================= PROFILE ROUTES ================= */
router.post('/profile', verifyToken, upload.single('avatar'), updateProfile);
router.get('/profile', verifyToken, getProfile);

/* ================= LANGUAGE ROUTES ================= */
router.post('/update-language', verifyToken, updateLanguage);

/* ================= ASSESSMENT ROUTES ================= */
router.get('/assessment/questions', verifyToken, getQuestions);
router.post('/assessment/submit', verifyToken, submitAssessment);

/* ================= POSTS ROUTES ================= */
router.get('/posts', verifyToken, getPosts);
router.post('/posts', verifyToken, createPost);

/* ================= CATEGORIES ROUTES ================= */
router.get('/categories', verifyToken, async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM categories ORDER BY id');
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

/* ================= LESSONS ROUTES ================= */
router.get('/lesson-categories', verifyToken, async (req, res) => {
  try {
    const user = await pool.query(
      'SELECT level FROM users WHERE phone=$1',
      [req.user.phone]
    );

    const lessons = await pool.query(
      `SELECT id, title, description
       FROM lessons
       WHERE level=$1
       ORDER BY order_no`,
      [user.rows[0]?.level || 'A1']
    );

    res.json(lessons.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/lessons', verifyToken, async (req, res) => {
  try {
    const user = await pool.query(
      'SELECT level, id FROM users WHERE phone=$1',
      [req.user.phone]
    );

    const lessons = await pool.query(
      `SELECT * FROM lessons
       WHERE level=$1
       ORDER BY order_no`,
      [user.rows[0]?.level || 'A1']
    );

    const progress = await pool.query(
      `SELECT lesson_id, completed
       FROM user_lessons
       WHERE user_id=$1`,
      [user.rows[0]?.id]
    );

    const completedMap = {};
    progress.rows.forEach(p => completedMap[p.lesson_id] = p.completed);

    const data = lessons.rows.map((l, i) => ({
      ...l,
      status:
        completedMap[l.id] ? 'done' :
        i === 0 || completedMap[lessons.rows[i-1]?.id] ? 'active' : 'locked'
    }));

    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/lessons/:lessonId/sub-lessons', verifyToken, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT * FROM sub_lessons
       WHERE lesson_id=$1
       ORDER BY order_no`,
      [req.params.lessonId]
    );

    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/lessons/:lessonId/complete', verifyToken, async (req, res) => {
  try {
    const user = await pool.query(
      'SELECT id FROM users WHERE phone=$1',
      [req.user.phone]
    );

    await pool.query(
      `INSERT INTO user_lessons (user_id, lesson_id, completed)
       VALUES ($1,$2,true)
       ON CONFLICT (user_id, lesson_id) DO UPDATE
       SET completed = EXCLUDED.completed`,
      [user.rows[0].id, req.params.lessonId]
    );

    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

/* ================= AI CHAT ROUTES ================= */
router.post('/ai/chat', verifyToken, async (req, res) => {
  const { message, mode, context } = req.body;

  let systemPrompt = '';

  if (mode === 'category') {
    systemPrompt = `You are an English tutor. Only talk about "${context}". If user asks anything outside, politely refuse.`;
  } else if (mode === 'lesson') {
    systemPrompt = `Teach the lesson: ${context}. Use simple English. Give 15–30 sentences. Ask 2 questions at the end.`;
  } else {
    systemPrompt = 'You are an English tutor. Help the user practice English conversation.';
  }

  // Mock response (replace with actual OpenAI/Google Gemini API)
  const mockResponse = `Based on your "${context}" request:

1. Here's the main concept explained simply.
2. Let's practice with an example.
3. Try this exercise yourself.

What specific aspect would you like to focus on?`;

  res.json({
    reply: mockResponse,
    suggestions: [
      "Can you explain more?",
      "Give me an example",
      "Let me practice this"
    ]
  });
});

module.exports = router;