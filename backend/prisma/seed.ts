import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const dataDir = join(dirname(fileURLToPath(import.meta.url)), 'data');

interface ProdutoJson {
  id: number;
  descricaoProduto: string;
  quantidadeEstoque: number;
  precoLiquido: number;
}

interface CupomJson {
  id: number;
  codigoCupom: string;
  percentualDesconto: number;
}

function lerJson<T>(arquivo: string): T {
  return JSON.parse(readFileSync(join(dataDir, arquivo), 'utf-8')) as T;
}

async function main() {
  const produtos = lerJson<ProdutoJson[]>('catalogoProdutos.json');
  const cupons = lerJson<CupomJson[]>('cupons.json');

  for (const produto of produtos) {
    await prisma.produto.upsert({
      where: { id: produto.id },
      create: produto,
      update: produto,
    });
  }

  for (const cupom of cupons) {
    await prisma.cupom.upsert({
      where: { id: cupom.id },
      create: cupom,
      update: cupom,
    });
  }

  console.log(`Seed concluído: ${produtos.length} produtos e ${cupons.length} cupons.`);
}

main()
  .catch((erro) => {
    console.error('Falha ao executar o seed:', erro);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
