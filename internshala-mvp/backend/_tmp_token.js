require('dotenv').config();
const jwt = require('jsonwebtoken');
const SECRET = process.env.JWT_SECRET;
const tok = jwt.sign({ userId: 29, email: 'varunpanchakarla@gmail.com' }, SECRET, { expiresIn: '7d' });
require('fs').writeFileSync(require('path').join(process.cwd(), 'tmp_varun_token.txt'), tok);
console.log('token written');
