/**
 * Sobe um PostgreSQL embarcado para desenvolvimento local sem Docker.
 * Os binários são baixados pelo pacote `embedded-postgres` (devDependency);
 * nada é instalado no sistema. Uso: npm run db:embedded
 */
import EmbeddedPostgres from 'embedded-postgres';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const raiz = join(dirname(fileURLToPath(import.meta.url)), '..');

const pg = new EmbeddedPostgres({
  databaseDir: join(raiz, '.embedded-postgres'),
  user: 'postgres',
  password: 'postgres',
  port: 5433,
  persistent: true,
});

async function main() {
  await pg.initialise().catch(() => {
    /* diretório já inicializado em execução anterior */
  });
  await pg.start();

  const clientes = await pg.getPgClient();
  await clientes.connect();
  const existe = await clientes.query("SELECT 1 FROM pg_database WHERE datname = 'carrinho'");
  if (existe.rowCount === 0) {
    await clientes.query('CREATE DATABASE carrinho');
  }
  await clientes.end();

  console.log('PostgreSQL embarcado disponível em: postgresql://postgres:postgres@localhost:5433/carrinho');
  console.log('Pressione Ctrl+C para encerrar.');

  const encerrar = async () => {
    await pg.stop();
    process.exit(0);
  };
  process.on('SIGINT', encerrar);
  process.on('SIGTERM', encerrar);
}

main().catch((erro) => {
  console.error('Falha ao subir o PostgreSQL embarcado:', erro);
  process.exit(1);
});
