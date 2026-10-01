const bcrypt = require('bcrypt');
const mysql = require('mysql2/promise');

async function seedAdmin() {
  const connection = await mysql.createConnection({
    host: 'localhost',
    port: 3306,
    user: 'hotel_user',
    password: 'hotel_password',
    database: 'user_db'
  });

  const email = 'admin@hotel.com';
  const plainPassword = 'password123';
  const fullName = 'Trương Văn Phong (Admin)';
  const role = 'ADMIN';

  // Hash password
  const hashedPassword = await bcrypt.hash(plainPassword, 10);

  // Check if exists
  const [rows] = await connection.execute('SELECT * FROM users WHERE email = ?', [email]);
  if (rows.length > 0) {
    console.log('Tài khoản admin đã tồn tại!');
    await connection.execute('UPDATE users SET role = "ADMIN" WHERE email = ?', [email]);
    console.log('Đã đảm bảo quyền ADMIN.');
  } else {
    // Insert
    await connection.execute(
      'INSERT INTO users (email, password, fullName, role) VALUES (?, ?, ?, ?)',
      [email, hashedPassword, fullName, role]
    );
    console.log(`Đã tạo thành công tài khoản Admin:\n- Email: ${email}\n- Pass: ${plainPassword}`);
  }

  await connection.end();
}

seedAdmin().catch(console.error);
