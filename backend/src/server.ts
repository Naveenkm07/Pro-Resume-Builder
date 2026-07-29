import 'dotenv/config';
import app from './app';
import { connectToDatabase } from './db';

const PORT = process.env.PORT || 3001;

connectToDatabase().then(() => {
  app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
  });
}).catch(err => {
  console.error("Failed to connect to database on startup:", err);
});
