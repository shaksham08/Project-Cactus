const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');

const routes = require('./routes');
const { notFoundMiddleware, errorMiddleware } = require('./middlewares/error.middleware');

const app = express();

const clientUrl = process.env.CLIENT_URL;

app.use(
  cors({
    origin: clientUrl || true,
    credentials: Boolean(clientUrl),
  })
);
app.use(helmet());
app.use(morgan('dev'));
app.use(express.json({ limit: '2mb' }));

app.get('/api/health', (request, response) => {
  response.status(200).json({
    success: true,
    message: 'Cactus backend is running.',
    timestamp: new Date().toISOString(),
  });
});

app.use('/api', routes);

app.use(notFoundMiddleware);
app.use(errorMiddleware);

module.exports = app;