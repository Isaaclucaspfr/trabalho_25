import { app } from './aplicacao-http.js';
import { env } from './config/configuracao-ambiente.js';

app.listen(env.port, () => {
  console.log(`EventHub backend running on ${env.port}`);
});
