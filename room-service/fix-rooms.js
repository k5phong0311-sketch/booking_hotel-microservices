const mysql = require('mysql2/promise');

async function seedRooms() {
  const connection = await mysql.createConnection({
    host: 'hotel_booking_mysql',
    port: 3306,
    user: 'hotel_user',
    password: 'hotel_password',
    database: 'room_db'
  });

  const rooms = [
    {
      id: 1,
      name: 'Ph\u00f2ng Standard H\u01b0\u1edbng Ph\u1ed1',
      description: 'Ph\u00f2ng ti\u00eau chu\u1ea9n v\u1edbi gi\u01b0\u1eddng \u0111\u01a1n, c\u1eeda s\u1ed5 h\u01b0\u1edbng ph\u1ed1 nh\u1ed9n nh\u1ecbp, \u0111\u1ea7y \u0111\u1ee7 ti\u1ec7n nghi c\u01a1 b\u1ea3n ph\u00f9 h\u1ee3p cho kh\u00e1ch \u0111i c\u00f4ng t\u00e1c ng\u1eafn ng\u00e0y.'
    },
    {
      id: 2,
      name: 'Ph\u00f2ng Superior \u0110\u00f4i',
      description: 'Ph\u00f2ng Superior v\u1edbi gi\u01b0\u1eddng \u0111\u00f4i c\u1ee1 l\u1edbn, kh\u00f4ng gian tho\u00e1ng \u0111\u00e3ng, ph\u00f2ng t\u1eafm \u0111\u1ee9ng sang tr\u1ecdng v\u1edbi v\u00f2i sen m\u01b0a.'
    },
    {
      id: 3,
      name: 'Ph\u00f2ng Deluxe H\u01b0\u1edbng Bi\u1ec3n',
      description: 'T\u1eadn h\u01b0\u1edfng b\u00ecnh minh tr\u00ean bi\u1ec3n ngay t\u1eeb ban c\u00f4ng ri\u00eang bi\u1ec7t. Gi\u01b0\u1eddng King size cao c\u1ea5p, minibar mi\u1ec5n ph\u00ed v\u00e0 d\u1ecbch v\u1ee5 ph\u00f2ng 24/7.'
    },
    {
      id: 4,
      name: 'Suite Ho\u00e0ng Gia (Premium)',
      description: 'Tr\u1ea3i nghi\u1ec7m \u0111\u1ec9nh cao l\u01b0u tr\u00fa v\u1edbi kh\u00f4ng gian 120m2 bao g\u1ed3m ph\u00f2ng kh\u00e1ch, ph\u00f2ng ng\u1ee7 ri\u00eang bi\u1ec7t, b\u1ed3n t\u1eafm s\u1ee5c Jacuzzi v\u00e0 view to\u00e0n c\u1ea3nh 360 \u0111\u1ed9.'
    },
    {
      id: 5,
      name: 'Ph\u00f2ng Standard Ti\u1ebft Ki\u1ec7m',
      description: 'Ph\u00f2ng 1 gi\u01b0\u1eddng \u0111\u01a1n g\u1ecdn g\u00e0ng, s\u1ea1ch s\u1ebd, ph\u00f9 h\u1ee3p ngh\u1ec9 ch\u00e2n qua \u0111\u00eam.'
    },
    {
      id: 6,
      name: 'Ph\u00f2ng Deluxe G\u00f3c (Corner)',
      description: 'Ph\u00f2ng g\u00f3c v\u1edbi 2 m\u1eb7t k\u00ednh c\u01b0\u1eddng l\u1ef1c, ng\u1eafm tr\u1ecdn v\u1eb9n th\u00e0nh ph\u1ed1 v\u1ec1 \u0111\u00eam c\u1ef1c k\u1ef3 l\u00e3ng m\u1ea1n.'
    },
    {
      id: 7,
      name: 'Suite Gia \u0110\u00ecnh 2 Ph\u00f2ng Ng\u1ee7',
      description: 'R\u1ea5t th\u00edch h\u1ee3p cho gia \u0111\u00ecnh c\u00f3 tr\u1ebb em. G\u1ed3m 1 ph\u00f2ng Master v\u00e0 1 ph\u00f2ng Twin, thi\u1ebft k\u1ebf th\u00f4ng nhau ti\u1ec7n l\u1ee3i.'
    }
  ];

  for (const r of rooms) {
    await connection.execute(
      'UPDATE rooms SET name = ?, description = ? WHERE id = ?',
      [r.name, r.description, r.id]
    );
    console.log(`Updated room ID ${r.id} successfully.`);
  }

  await connection.end();
}

seedRooms().catch(console.error);
