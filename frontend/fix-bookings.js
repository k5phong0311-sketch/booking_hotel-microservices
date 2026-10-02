const fs = require('fs');

let c = fs.readFileSync('src/pages/MyBookingsPage.tsx', 'utf8');

c = c.replace(
  "import { useLocation } from 'react-router-dom';",
  "import { useLocation } from 'react-router-dom';\nimport { useAuth } from '../context/AuthContext';"
);

c = c.replace(
  "const location = useLocation();",
  "const location = useLocation();\n  const { user } = useAuth();"
);

c = c.replace(
  "fetchBookings();",
  "if (user) fetchBookings();"
);

c = c.replace(
  "bookingService.getMyBookings()",
  "bookingService.getMyBookings(user.id)"
);

c = c.replace(
  "const handleCancel = async (bookingId: string) => {",
  "const handleCancel = async (bookingId: number) => {"
);

fs.writeFileSync('src/pages/MyBookingsPage.tsx', c);
