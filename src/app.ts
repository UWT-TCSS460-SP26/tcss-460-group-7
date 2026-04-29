import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import fs from 'fs';
import YAML from 'yaml';
import { apiReference } from '@scalar/express-api-reference';
import { routes } from './routes';
import { logger } from './middleware/logger';

const app = express();

// Application-level middleware
app.use(cors());
app.use(express.json());
app.use(logger);

// OpenAPI documentation
const specFile = fs.readFileSync('./openapi.yaml', 'utf8');
const spec = YAML.parse(specFile);

app.use(
  '/api-docs',
  apiReference({
    spec: {
      content: spec,
    },
  })
);

// Routes
app.use(routes);

// 404 handler — must be after all routes
app.use((_request: Request, response: Response) => {
  response.status(404).json({ error: 'Route not found' });
});

// Malformed JSON handler
app.use((err: any, _request: Request, response: Response, _next: NextFunction) => {
  if (err.type === 'entity.parse.failed') {
    response.status(400).json({ error: 'Malformed JSON in request body' });
    return;
  }
  response.status(500).json({ error: 'Internal server error' });
});

export { app };
