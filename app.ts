require('dotenv').config();
import 'module-alias/register';
import express from 'express';
import webhookRoutes from './src/routes/webhookRoutes';

const app = express();
app.use(express.json());

// Роуты
app.use('/webhook', webhookRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Сервер запущен на порту ${PORT}`));
