import { config } from './config/index.js';
import app from './app.js';

app.listen(config.port, () => {
  console.log(`🚀 Servidor rodando em http://localhost:${config.port}`);
  console.log(`📁 Ambiente: ${config.nodeEnv}`);
});
