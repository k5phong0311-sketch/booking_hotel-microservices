const bcrypt = require('bcrypt');
const mysql = require('mysql2/promise');

async function seedAdmin() {
  const connection = await mysql.createConnection({
    host: 'hotel_booking_mysql',
    port: 3306,
    user: 'hotel_user',
    password: 'hotel_password',
    database: 'user_db'
  });

  const email = 'admin@hotel.com';
  const plainPassword = 'password123';
  const fullName = 'Tr\u01b0\u01a1ng V\u0103n Phong (Admin)';
  const role = 'ADMIN';

  // Hash password
  const hashedPassword = await bcrypt.hash(plainPassword, 10);

  // Check if exists
  const [rows] = await connection.execute('SELECT * FROM users WHERE email = ?', [email]);
  if (rows.length > 0) {
    console.log('Admin account already exists!');
    await connection.execute('UPDATE users SET role = "ADMIN", fullName = ? WHERE email = ?', [fullName, email]);
    console.log('Ensured ADMIN role and correct name.');
  } else {
    // Insert
    await connection.execute(
      'INSERT INTO users (email, password, fullName, role) VALUES (?, ?, ?, ?)',
      [email, hashedPassword, fullName, role]
    );
    console.log(`Successfully created Admin account:\n- Email: ${email}\n- Pass: ${plainPassword}`);
  }

  await connection.end();
}

seedAdmin().catch(console.error);
