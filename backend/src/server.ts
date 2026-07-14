/**
 * Composition root: monta as dependências (Prisma → repositórios →
 * casos de uso → app Express) e sobe o servidor.
 */
import { criarCasosDeUso } from './application/casos-de-uso.js';
import { criarApp } from './http/app.js';
import { prisma } from './infrastructure/prisma.js';
import { criarRepositoriosPrisma } from './infrastructure/repositorios-prisma.js';

const porta = Number(process.env.PORT ?? 3001);

const repositorios = criarRepositoriosPrisma(prisma);
const casosDeUso = criarCasosDeUso(repositorios);
const app = criarApp(casosDeUso);

app.listen(porta, () => {
  console.log(`API do carrinho rodando em http://localhost:${porta}`);
  console.log(`Documentação Swagger em http://localhost:${porta}/docs`);
});
