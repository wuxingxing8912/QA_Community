const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const swaggerUi = require('swagger-ui-express');

const routes = require('./routes');
const { notFound, errorHandler } = require('./middleware');
const swaggerSpec = require('./config/swagger');

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

app.get('/', (req, res) => res.json({ name: 'QA Community API', version: '1.0.0' }));
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.get('/api-docs.json', (req, res) => res.json(swaggerSpec));
app.use('/api', routes);

app.use(notFound);
app.use(errorHandler);

module.exports = app;
