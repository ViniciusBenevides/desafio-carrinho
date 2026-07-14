/**
 * Implementações Prisma dos ports da aplicação. Toda a tradução entre
 * linhas do banco e modelos de domínio (incluindo Decimal) acontece aqui.
 */
import type { Prisma, PrismaClient } from '@prisma/client';
import { Decimal } from 'decimal.js';
import type { Carrinho, Cupom, Produto } from '../domain/modelos.js';
import type {
  RepositorioCarrinhos,
  RepositorioCupons,
  RepositorioProdutos,
  Repositorios,
} from '../application/portas.js';

type ProdutoLinha = { id: number; descricaoProduto: string; quantidadeEstoque: number; precoLiquido: Prisma.Decimal };
type CupomLinha = { id: number; codigoCupom: string; percentualDesconto: Prisma.Decimal };

function paraDecimal(valor: Prisma.Decimal): Decimal {
  return new Decimal(valor.toString());
}

function mapearProduto(linha: ProdutoLinha): Produto {
  return {
    id: linha.id,
    descricaoProduto: linha.descricaoProduto,
    quantidadeEstoque: linha.quantidadeEstoque,
    precoLiquido: paraDecimal(linha.precoLiquido),
  };
}

function mapearCupom(linha: CupomLinha): Cupom {
  return {
    id: linha.id,
    codigoCupom: linha.codigoCupom,
    percentualDesconto: paraDecimal(linha.percentualDesconto),
  };
}

const incluirRelacoesCarrinho = {
  itens: { include: { produto: true }, orderBy: { id: 'asc' } },
  cupom: true,
} satisfies Prisma.CarrinhoInclude;

type CarrinhoLinha = Prisma.CarrinhoGetPayload<{ include: typeof incluirRelacoesCarrinho }>;

function mapearCarrinho(linha: CarrinhoLinha): Carrinho {
  return {
    id: linha.id,
    status: linha.status,
    itens: linha.itens.map((item) => ({
      produto: mapearProduto(item.produto),
      quantidade: item.quantidade,
      precoItem: paraDecimal(item.precoItem),
    })),
    cupom: linha.cupom ? mapearCupom(linha.cupom) : null,
    subtotal: paraDecimal(linha.subtotal),
    desconto: paraDecimal(linha.desconto),
    total: paraDecimal(linha.total),
  };
}

class ProdutosPrisma implements RepositorioProdutos {
  constructor(private readonly prisma: PrismaClient) {}

  async listarTodos(): Promise<Produto[]> {
    const linhas = await this.prisma.produto.findMany({ orderBy: { id: 'asc' } });
    return linhas.map(mapearProduto);
  }

  async buscarPorId(id: number): Promise<Produto | null> {
    const linha = await this.prisma.produto.findUnique({ where: { id } });
    return linha ? mapearProduto(linha) : null;
  }
}

class CuponsPrisma implements RepositorioCupons {
  constructor(private readonly prisma: PrismaClient) {}

  async buscarPorCodigo(codigoCupom: string): Promise<Cupom | null> {
    const linha = await this.prisma.cupom.findUnique({ where: { codigoCupom } });
    return linha ? mapearCupom(linha) : null;
  }
}

class CarrinhosPrisma implements RepositorioCarrinhos {
  constructor(private readonly prisma: PrismaClient) {}

  async criar(): Promise<Carrinho> {
    const linha = await this.prisma.carrinho.create({ data: {}, include: incluirRelacoesCarrinho });
    return mapearCarrinho(linha);
  }

  async buscarPorId(id: number): Promise<Carrinho | null> {
    const linha = await this.prisma.carrinho.findUnique({ where: { id }, include: incluirRelacoesCarrinho });
    return linha ? mapearCarrinho(linha) : null;
  }

  async salvar(carrinho: Carrinho): Promise<void> {
    await this.prisma.$transaction([
      this.prisma.carrinhoItem.deleteMany({ where: { carrinhoId: carrinho.id } }),
      this.prisma.carrinhoItem.createMany({
        data: carrinho.itens.map((item) => ({
          carrinhoId: carrinho.id,
          produtoId: item.produto.id,
          quantidade: item.quantidade,
          precoItem: item.precoItem.toFixed(2),
        })),
      }),
      this.prisma.carrinho.update({
        where: { id: carrinho.id },
        data: {
          status: carrinho.status,
          cupomId: carrinho.cupom?.id ?? null,
          subtotal: carrinho.subtotal.toFixed(2),
          desconto: carrinho.desconto.toFixed(2),
          total: carrinho.total.toFixed(2),
        },
      }),
    ]);
  }
}

export function criarRepositoriosPrisma(prisma: PrismaClient): Repositorios {
  return {
    produtos: new ProdutosPrisma(prisma),
    cupons: new CuponsPrisma(prisma),
    carrinhos: new CarrinhosPrisma(prisma),
  };
}
