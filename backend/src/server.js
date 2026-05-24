import { app } from './app.js';
import { env } from './config/env.js';

app.listen(env.port, () => {
  console.log(`EventHub backend running on ${env.port}`);
});
