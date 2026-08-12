import app from '../backend/src/app';
import { connectToDatabase } from '../backend/src/db';

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req: any, res: any) {
  try {
    const timeout = new Promise((_, reject) => setTimeout(() => reject(new Error('Database connection timeout (5s)')), 5000));
    await Promise.race([connectToDatabase(), timeout]);
    return app(req, res);
  } catch (error: any) {
    console.error("Critical server error (DB Connection):", error);
    return res.status(500).json({ 
      error: "Failed to connect to the database. Make sure Vercel environment variables are set correctly.",
      details: error.message 
    });
  }
}
