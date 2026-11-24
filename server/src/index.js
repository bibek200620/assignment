import mongoose from 'mongoose';
import { createApp } from './app.js';

try {
  const app = createApp();
  await mongoose.connect(
    process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/amazon_clone',
    { serverSelectionTimeoutMS: 8000 },
  );
  const server = app.listen(Number(process.env.PORT) || 5001, '127.0.0.1', () =>
    console.log(
      `Amazon Clone API running at http://localhost:${process.env.PORT || 5001} (MongoDB connected)`,
    ),
  );
  for (const signal of ['SIGINT', 'SIGTERM'])
    process.on(signal, () =>
      server.close(async () => {
        await mongoose.disconnect();
        process.exit(0);
      }),
    );
} catch (error) {
  console.error(
    `Cannot start Amazon Clone: ${error.message}\nCheck .env and run npm run db:up.`,
  );
  process.exit(1);
}
