const mysql = require('mysql2/promise');

const images = [
  'https://images.unsplash.com/photo-1611892440504-42a792e24d32?q=80&w=1000&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1590490360182-c33d57733427?q=80&w=1000&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?q=80&w=1000&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1505691938895-1758d7feb511?q=80&w=1000&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?q=80&w=1000&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?q=80&w=1000&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1566665797739-1674de7a421a?q=80&w=1000&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1578683010236-d716f9a3f461?q=80&w=1000&auto=format&fit=crop'
];

const types = ['SINGLE', 'DOUBLE', 'SUITE', 'DELUXE'];

const generateRoom = (id) => {
  const type = types[Math.floor(Math.random() * types.length)];
  let name = '';
  let price = 0;
  let desc = '';
  
  if (type === 'SINGLE') {
    name = `Ph\u00f2ng \u0110\u01a1n Ti\u00eau Chu\u1ea9n ${id}`;
    price = 500000 + Math.floor(Math.random() * 5) * 100000;
    desc = `Ph\u00f2ng \u0111\u01a1n g\u1ecdn g\u00e0ng, \u0111\u1ea7y \u0111\u1ee7 ti\u1ec7n nghi.`;
  } else if (type === 'DOUBLE') {
    name = `Ph\u00f2ng \u0110\u00f4i Superior ${id}`;
    price = 1000000 + Math.floor(Math.random() * 8) * 100000;
    desc = `Ph\u00f2ng \u0111\u00f4i r\u1ed9ng r\u00e3i v\u1edbi 2 gi\u01b0\u1eddng l\u1edbn.`;
  } else if (type === 'DELUXE') {
    name = `Ph\u00f2ng Deluxe H\u01b0\u1edbng Bi\u1ec3n ${id}`;
    price = 2000000 + Math.floor(Math.random() * 10) * 100000;
    desc = `Ph\u00f2ng Deluxe c\u1ea5p cao v\u1edbi view nh\u00ecn ra bi\u1ec3n.`;
  } else {
    name = `Suite Ho\u00e0ng Gia ${id}`;
    price = 4000000 + Math.floor(Math.random() * 20) * 100000;
    desc = `Tr\u1ea3i nghi\u1ec7m s\u1ef1 sang tr\u1ecdng b\u1eadc nh\u1ea5t v\u1edbi Suite ${id}.`;
  }
  
  return {
    id,
    name,
    type,
    pricePerNight: price,
    description: desc,
    imageUrl: images[Math.floor(Math.random() * images.length)],
    isAvailable: true,
    floor: Math.floor(Math.random() * 10) + 1
  };
};

async function seedRooms() {
  const connection = await mysql.createConnection({
    host: 'hotel_booking_mysql',
    user: 'root',
    password: 'rootpassword',
    database: 'room_db'
  });

  console.log('Connected to MySQL');

  // Truncate table securely avoiding foreign key checks if any
  await connection.query('SET FOREIGN_KEY_CHECKS = 0;');
  await connection.query('TRUNCATE TABLE rooms;');
  await connection.query('SET FOREIGN_KEY_CHECKS = 1;');
  
  console.log('Table truncated.');

  const rooms = [];
  for(let i=1; i<=30; i++) {
    rooms.push(generateRoom(i));
  }

  const values = rooms.map(r => [r.name, r.type, r.pricePerNight, r.description, r.imageUrl, r.isAvailable, r.floor, new Date()]);

  await connection.query(
    'INSERT INTO rooms (name, type, pricePerNight, description, imageUrl, isAvailable, floor, createdAt) VALUES ?',
    [values]
  );

  console.log('Inserted 30 rooms successfully!');
  await connection.end();
}

seedRooms().catch(err => {
  console.error(err);
  process.exit(1);
});
