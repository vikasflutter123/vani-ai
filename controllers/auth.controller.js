//const pool = require('../config/db');
//const jwt = require('jsonwebtoken');
//
//const SECRET = process.env.JWT_SECRET || 'secret123';
//
//
//
///* ================= SIGNUP ================= */
//const signup = async (req, res) => {
//  const { name, countryCode, mobile } = req.body;
//  const phone = countryCode + mobile;
//
//  try {
//    await pool.query(
//      'INSERT INTO users (name, phone) VALUES ($1,$2)',
//      [name, phone]
//    );
//
//    res.json({ message: 'Signup successful' });
//
//  } catch (err) {
//    if (err.code === '23505') {
//      return res.status(409).json({ message: 'Mobile already registered' });
//    }
//    res.status(500).json({ message: 'Server error' });
//  }
//};
//
///* ================= SEND OTP ================= */
//const sendOtp = async (req, res) => {
//  const { countryCode, mobile, flow } = req.body;
//  const phone = countryCode + mobile;
//
//  if (!countryCode || !mobile || !flow) {
//    return res.status(400).json({ message: 'Invalid request' });
//  }
//
//  const user = await pool.query(
//    'SELECT id FROM users WHERE phone=$1',
//    [phone]
//  );
//
//  if (flow === 'signup' && user.rows.length > 0) {
//    return res.status(409).json({ message: 'Already registered' });
//  }
//
//  if (flow === 'login' && user.rows.length === 0) {
//    return res.status(404).json({ message: 'User not registered' });
//  }
//
//  console.log('OTP:', phone, '=> 123456');
//  res.json({ message: 'OTP sent' });
//};
//
///* ================= VERIFY OTP ================= */
//const verifyOtp = async (req, res) => {
//  const { otp, phone, name, flow } = req.body;
//
//  if (otp !== '123456') {
//    return res.status(400).json({ message: 'Invalid OTP' });
//  }
//
//  let user = await pool.query(
//    'SELECT * FROM users WHERE phone=$1',
//    [phone]
//  );
//
//  let isNewUser = false;
//
//  if (flow === 'signup' && user.rows.length === 0) {
//    const insert = await pool.query(
//      'INSERT INTO users (name, phone) VALUES ($1,$2) RETURNING *',
//      [name, phone]
//    );
//    user = { rows: [insert.rows[0]] };
//    isNewUser = true;
//  }
//
//  if (flow === 'login' && user.rows.length === 0) {
//    return res.status(404).json({ message: 'User not registered' });
//  }
//
//  const token = jwt.sign(
//    { phone },
//    SECRET,
//    { expiresIn: '1h' }
//  );
//
//  res.json({
//    token,
//    name: user.rows[0].name,
//    isNewUser   // 🔥 THIS IS THE KEY
//  });
//};
//
//
///* ================= TOKEN ================= */
//const verifyToken = (req, res, next) => {
//  const authHeader = req.headers.authorization; // "Bearer <token>"
//  if (!authHeader) return res.status(401).json({ message: 'Token missing' });
//
//  const token = authHeader.split(' ')[1]; // extract token
//  if (!token) return res.status(401).json({ message: 'Token missing' });
//
//  try {
//    req.user = jwt.verify(token, SECRET);
//    next();
//  } catch (err) {
//    console.error(err);
//    res.status(401).json({ message: 'Invalid token' });
//  }
//};
//
//
///* ================= UPDATE LANGUAGE ================= */
//const updateLanguage = async (req, res) => {
//  const { learningLanguage, nativeLanguage } = req.body;
//
//  await pool.query(
//    `UPDATE users
//     SET learning_language=$1, native_language=$2
//     WHERE phone=$3`,
//    [learningLanguage, nativeLanguage, req.user.phone]
//  );
//
//  res.json({ message: 'Language updated' });
//};
//
///* ================= GET QUESTIONS ================= */
//const getQuestions = async (req, res) => {
//  try {
//    const { learningLanguage, nativeLanguage } = req.query;
//
//    if (!learningLanguage || !nativeLanguage)
//      return res.status(400).json({ message: 'Missing language params' });
//
//    const result = await pool.query(
//      `SELECT id, question, options FROM questions
//       WHERE learning_language=$1 AND native_language=$2
//       ORDER BY RANDOM() LIMIT 10`,
//      [learningLanguage, nativeLanguage]
//    );
//
//    if (!result.rows.length) return res.status(404).json({ message: 'No questions found' });
//
//    res.json(result.rows);
//  } catch (err) {
//    console.error(err);
//    res.status(500).json({ message: 'Server error' });
//  }
//};
//
///* ================= SUBMIT ASSESSMENT ================= */
//const submitAssessment = async (req, res) => {
//  try {
//    const { answers } = req.body;
//
//    const userRes = await pool.query('SELECT id FROM users WHERE phone=$1', [req.user.phone]);
//    const userId = userRes.rows[0].id;
//    let correct = 0;
//
//    for (const a of answers) {
//      const q = await pool.query('SELECT correct_option FROM questions WHERE id=$1', [a.questionId]);
//      const isCorrect = q.rows[0].correct_option === a.selected;
//      if (isCorrect) correct++;
//
//      await pool.query(
//        `INSERT INTO user_answers (user_id, question_id, selected_option, is_correct)
//         VALUES ($1,$2,$3,$4)`,
//        [userId, a.questionId, a.selected, isCorrect]
//      );
//    }
//
////    res.json({ total: answers.length, correct, wrong: answers.length - correct });
//
//        // ================= LEVEL LOGIC =================
//        let level = 'A1';
//        let label = 'Beginner';
//
//        if (correct >= 7) {
//          level = 'B1';
//          label = 'Intermediate';
//        }
//        if (correct >= 9) {
//          level = 'B2';
//          label = 'Upper Intermediate';
//        }
//
//        // Optional: save level in DB
//        await pool.query(
//          'UPDATE users SET level=$1 WHERE id=$2',
//          [level, userId]
//        );
//
//        res.json({
//          total: answers.length,
//          correct,
//          wrong: answers.length - correct,
//          level,
//          label
//        });
//
//
//  } catch (err) {
//    console.error(err);
//    res.status(500).json({ message: 'Submission failed' });
//  }
//};
//
//
///* ================= POSTS ================= */
//const createPost = async (req, res) => {
//  const user = await pool.query(
//    'SELECT id FROM users WHERE phone=$1',
//    [req.user.phone]
//  );
//
//  await pool.query(
//    'INSERT INTO posts (user_id, text) VALUES ($1,$2)',
//    [user.rows[0].id, req.body.text]
//  );
//
//  res.json({ message: 'Post added' });
//};
//
//const getPosts = async (req, res) => {
//  const result = await pool.query(`
//    SELECT posts.text, posts.created_at, users.name
//    FROM posts
//    JOIN users ON users.id = posts.user_id
//    ORDER BY posts.created_at DESC
//  `);
//
//  res.json(result.rows);
//};
//
///* ================= EXPORTS ================= */
//module.exports = {
//  signup,
//  sendOtp,
//  verifyOtp,
//  verifyToken,
//  updateLanguage,
//  getQuestions,
//  submitAssessment,
//  createPost,
//  getPosts
//};



const pool = require('../config/db');
const jwt = require('jsonwebtoken');
const path = require('path');
const multer = require('multer');

const SECRET = process.env.JWT_SECRET || 'secret123';

/* ================= MULTER CONFIG ================= */
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../public/uploads'));
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) cb(null, true);
    else cb(new Error('Only image files are allowed!'), false);
  },
  limits: { fileSize: 5 * 1024 * 1024 }
});

/* ================= SIGNUP ================= */
const signup = async (req, res) => {
  try {
    const { name, countryCode, mobile } = req.body;
    const phone = countryCode + mobile;

    await pool.query('INSERT INTO users (name, phone) VALUES ($1,$2)', [name, phone]);
    res.json({ message: 'Signup successful' });
  } catch (err) {
    if (err.code === '23505') return res.status(409).json({ message: 'Mobile already registered' });
    res.status(500).json({ message: 'Server error' });
  }
};

/* ================= SEND OTP ================= */
const sendOtp = async (req, res) => {
  const { countryCode, mobile, flow } = req.body;
  if (!countryCode || !mobile || !flow) return res.status(400).json({ message: 'Invalid request' });

  const phone = countryCode + mobile;
  const user = await pool.query('SELECT id FROM users WHERE phone=$1', [phone]);

  if (flow === 'signup' && user.rows.length > 0) return res.status(409).json({ message: 'Already registered' });
  if (flow === 'login' && user.rows.length === 0) return res.status(404).json({ message: 'User not registered' });

  console.log('OTP:', phone, '=> 123456');
  res.json({ message: 'OTP sent' });
};

/* ================= VERIFY OTP ================= */
const verifyOtp = async (req, res) => {
  const { otp, phone, name, flow } = req.body;
  if (otp !== '123456') return res.status(400).json({ message: 'Invalid OTP' });

  let user = await pool.query('SELECT * FROM users WHERE phone=$1', [phone]);
  let isNewUser = false;

  if (flow === 'signup' && user.rows.length === 0) {
    const insert = await pool.query('INSERT INTO users (name, phone) VALUES ($1,$2) RETURNING *', [name, phone]);
    user = { rows: [insert.rows[0]] };
    isNewUser = true;
  }
  if (flow === 'login' && user.rows.length === 0) return res.status(404).json({ message: 'User not registered' });

  const token = jwt.sign({ phone }, SECRET, { expiresIn: '7d' });
  res.json({
    token,
    name: user.rows[0].name,
    phone: user.rows[0].phone,
    isNewUser
  });
};

/* ================= VERIFY TOKEN ================= */
const verifyToken = (req, res, next) => {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) return res.status(401).json({ message: 'Token missing' });

  try {
    const token = header.split(' ')[1];
    const decoded = jwt.verify(token, SECRET);
    req.user = { phone: decoded.phone };
    next();
  } catch {
    return res.status(401).json({ message: 'Invalid token' });
  }
};

/* ================= UPDATE PROFILE ================= */
const updateProfile = async (req, res) => {
  try {
    const { name, email, language } = req.body;
    const phone = req.user.phone;

    let avatarUrl = req.file ? `/uploads/${req.file.filename}` : null;

    const result = await pool.query(
      `UPDATE users
       SET name = COALESCE($1, name),
           email = COALESCE($2, email),
           native_language = COALESCE($3, native_language),
           avatar_url = COALESCE($4, avatar_url)
       WHERE phone=$5
       RETURNING name, email, native_language, avatar_url`,
      [name, email, language, avatarUrl, phone]
    );

    if (!result.rowCount) return res.status(404).json({ message: 'User not found' });

    res.json({
      message: 'Profile updated',
      profile: result.rows[0]
    });
  } catch (err) {
    console.error('UPDATE PROFILE ERROR:', err);
    res.status(500).json({ message: 'Profile update failed' });
  }
};

/* ================= GET PROFILE ================= */
const getProfile = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT name, email, phone, native_language, learning_language,
              level, avatar_url, created_at
       FROM users WHERE phone=$1`,
      [req.user.phone]
    );

    if (!result.rowCount) return res.status(404).json({ message: 'User not found' });

    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

/* ================= UPDATE LANGUAGE ================= */
const updateLanguage = async (req, res) => {
  const { learningLanguage, nativeLanguage } = req.body;

  try {
    await pool.query(
      `UPDATE users
       SET learning_language=$1, native_language=$2
       WHERE phone=$3`,
      [learningLanguage, nativeLanguage, req.user.phone]
    );

    res.json({ message: 'Language updated' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

/* ================= GET QUESTIONS ================= */
const getQuestions = async (req, res) => {
  try {
    const { learningLanguage, nativeLanguage } = req.query;

    if (!learningLanguage || !nativeLanguage)
      return res.status(400).json({ message: 'Missing language params' });

    const result = await pool.query(
      `SELECT id, question, options FROM questions
       WHERE learning_language=$1 AND native_language=$2
       ORDER BY RANDOM() LIMIT 10`,
      [learningLanguage, nativeLanguage]
    );

    if (!result.rows.length) return res.status(404).json({ message: 'No questions found' });

    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

/* ================= SUBMIT ASSESSMENT ================= */
const submitAssessment = async (req, res) => {
  try {
    const { answers } = req.body;

    const userRes = await pool.query('SELECT id FROM users WHERE phone=$1', [req.user.phone]);
    const userId = userRes.rows[0].id;
    let correct = 0;

    for (const a of answers) {
      const q = await pool.query('SELECT correct_option FROM questions WHERE id=$1', [a.questionId]);
      const isCorrect = q.rows[0].correct_option === a.selected;
      if (isCorrect) correct++;

      await pool.query(
        `INSERT INTO user_answers (user_id, question_id, selected_option, is_correct)
         VALUES ($1,$2,$3,$4)`,
        [userId, a.questionId, a.selected, isCorrect]
      );
    }

    let level = 'A1';
    let label = 'Beginner';
    if (correct >= 7) {
      level = 'B1';
      label = 'Intermediate';
    }
    if (correct >= 9) {
      level = 'B2';
      label = 'Upper Intermediate';
    }

    await pool.query(
      'UPDATE users SET level=$1 WHERE id=$2',
      [level, userId]
    );

    res.json({
      total: answers.length,
      correct,
      wrong: answers.length - correct,
      level,
      label
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Submission failed' });
  }
};

/* ================= POSTS ================= */
const createPost = async (req, res) => {
  const user = await pool.query(
    'SELECT id FROM users WHERE phone=$1',
    [req.user.phone]
  );

  await pool.query(
    'INSERT INTO posts (user_id, text) VALUES ($1,$2)',
    [user.rows[0].id, req.body.text]
  );

  res.json({ message: 'Post added' });
};

const getPosts = async (req, res) => {
  const result = await pool.query(`
    SELECT posts.text, posts.created_at, users.name, users.avatar_url
    FROM posts
    JOIN users ON users.id = posts.user_id
    ORDER BY posts.created_at DESC
  `);

  res.json(result.rows);
};

/* ================= EXPORTS ================= */
module.exports = {
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
};