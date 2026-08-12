import app from '../backend/src/app';
import { connectToDatabase } from '../backend/src/db';

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req: any, res: any) {
  try {
    await connectToDatabase();
    return app(req, res);
  } catch (error: any) {
    console.error("Critical server error (DB Connection):", error);
    return res.status(500).json({ 
      error: "Failed to connect to the database. Make sure Vercel environment variables (POSTGRES_URL) are set correctly.",
      details: error.message 
    });
  }
}
