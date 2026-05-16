import dotenv from 'dotenv';
import path from 'path';

// Force load .env from the root directory immediately
dotenv.config({ path: path.resolve(__dirname, '../.env') });

import { app } from './app';

const PORT = parseInt(process.env.PORT || '3000', 10);

app.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`Server running at http://localhost:${PORT}`);
  // eslint-disable-next-line no-console
  console.log(`API docs at http://localhost:${PORT}/api-docs`);
});
