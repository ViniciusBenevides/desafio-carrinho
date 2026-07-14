import cors from 'cors';
import express from 'express';
import swaggerUi from 'swagger-ui-express';
import type { CasosDeUso } from '../application/casos-de-uso.js';
import { middlewareDeErros } from './erros.js';
import { documentoOpenApi } from './openapi.js';
import { criarRotas } from './rotas.js';

export function criarApp(casosDeUso: CasosDeUso): express.Express {
  const app = express();

  app.use(cors());
  app.use(express.json());

  app.get('/health', (_req, res) => {
    res.json({ status: 'ok' });
  });

  app.use('/docs', swaggerUi.serve, swaggerUi.setup(documentoOpenApi));
  app.get('/docs-json', (_req, res) => {
    res.json(documentoOpenApi);
  });

  app.use(criarRotas(casosDeUso));

  app.use((_req, res) => {
    res.status(404).json({ erro: { codigo: 'ROTA_NAO_ENCONTRADA', mensagem: 'Rota não encontrada.' } });
  });

  app.use(middlewareDeErros);

  return app;
}
