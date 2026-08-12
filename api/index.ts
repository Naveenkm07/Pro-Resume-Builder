import app from '../backend/src/app';
import { connectToDatabase } from '../backend/src/db';

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req: any, res: any) {
  await connectToDatabase();
  return app(req, res);
}
