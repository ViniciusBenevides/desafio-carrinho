/**
 * Regras de negócio do carrinho — funções puras, sem nenhuma dependência
 * de infraestrutura (banco, HTTP, framework). Cada operação valida as
 * invariantes, aplica a mudança e devolve um novo carrinho já recalculado.
 */
import { Decimal } from 'decimal.js';
import { ErroDominio } from './erros.js';
import type { Carrinho, Cupom, ItemCarrinho, Produto } from './modelos.js';

const CEM = new Decimal(100);

/** Arredonda valores monetários para 2 casas (half-up, padrão comercial). */
export function arredondar(valor: Decimal): Decimal {
  return valor.toDecimalPlaces(2, Decimal.ROUND_HALF_UP);
}

export function calcularPrecoItem(precoLiquidoUnitario: Decimal, quantidade: number): Decimal {
  return arredondar(precoLiquidoUnitario.times(quantidade));
}

export interface Totais {
  subtotal: Decimal;
  desconto: Decimal;
  total: Decimal;
}

export function calcularTotais(itens: ItemCarrinho[], cupom: Cupom | null): Totais {
  const subtotal = arredondar(
    itens.reduce((acumulado, item) => acumulado.plus(item.precoItem), new Decimal(0)),
  );
  const desconto = cupom ? arredondar(subtotal.times(cupom.percentualDesconto).dividedBy(CEM)) : new Decimal(0);
  const total = subtotal.minus(desconto);
  return { subtotal, desconto, total };
}

function recalcular(carrinho: Carrinho, itens: ItemCarrinho[], cupom: Cupom | null): Carrinho {
  return { ...carrinho, itens, cupom, ...calcularTotais(itens, cupom) };
}

function garantirAberto(carrinho: Carrinho): void {
  if (carrinho.status === 'FINALIZADO') {
    throw ErroDominio.carrinhoFinalizado(carrinho.id);
  }
}

function validarQuantidade(quantidade: number): void {
  if (!Number.isInteger(quantidade) || quantidade <= 0) {
    throw ErroDominio.quantidadeInvalida(quantidade);
  }
}

function validarEstoque(produto: Produto, quantidadeDesejada: number): void {
  if (quantidadeDesejada > produto.quantidadeEstoque) {
    throw ErroDominio.estoqueInsuficiente(produto.descricaoProduto, produto.quantidadeEstoque, quantidadeDesejada);
  }
}

function criarItem(produto: Produto, quantidade: number): ItemCarrinho {
  return { produto, quantidade, precoItem: calcularPrecoItem(produto.precoLiquido, quantidade) };
}

/**
 * Adiciona um produto ao carrinho. Se o produto já está no carrinho,
 * a quantidade informada é SOMADA à existente; caso contrário o item
 * entra com a quantidade informada.
 */
export function adicionarItem(carrinho: Carrinho, produto: Produto, quantidade: number): Carrinho {
  garantirAberto(carrinho);
  validarQuantidade(quantidade);

  const itemExistente = carrinho.itens.find((item) => item.produto.id === produto.id);
  const novaQuantidade = (itemExistente?.quantidade ?? 0) + quantidade;
  validarEstoque(produto, novaQuantidade);

  const itens = itemExistente
    ? carrinho.itens.map((item) => (item.produto.id === produto.id ? criarItem(produto, novaQuantidade) : item))
    : [...carrinho.itens, criarItem(produto, novaQuantidade)];

  return recalcular(carrinho, itens, carrinho.cupom);
}

/**
 * Define a quantidade EXATA de um item já existente (substituição),
 * podendo aumentar ou diminuir o valor anterior.
 */
export function alterarQuantidadeItem(carrinho: Carrinho, produtoId: number, quantidade: number): Carrinho {
  garantirAberto(carrinho);
  validarQuantidade(quantidade);

  const itemExistente = carrinho.itens.find((item) => item.produto.id === produtoId);
  if (!itemExistente) {
    throw ErroDominio.itemNaoEncontrado(produtoId);
  }
  validarEstoque(itemExistente.produto, quantidade);

  const itens = carrinho.itens.map((item) =>
    item.produto.id === produtoId ? criarItem(item.produto, quantidade) : item,
  );

  return recalcular(carrinho, itens, carrinho.cupom);
}

export function removerItem(carrinho: Carrinho, produtoId: number): Carrinho {
  garantirAberto(carrinho);

  if (!carrinho.itens.some((item) => item.produto.id === produtoId)) {
    throw ErroDominio.itemNaoEncontrado(produtoId);
  }

  const itens = carrinho.itens.filter((item) => item.produto.id !== produtoId);
  return recalcular(carrinho, itens, carrinho.cupom);
}

/** Aplica um cupom ao carrinho. Apenas um cupom ativo por vez: substitui o anterior. */
export function aplicarCupom(carrinho: Carrinho, cupom: Cupom): Carrinho {
  garantirAberto(carrinho);
  return recalcular(carrinho, carrinho.itens, cupom);
}

export function removerCupom(carrinho: Carrinho): Carrinho {
  garantirAberto(carrinho);
  return recalcular(carrinho, carrinho.itens, null);
}

/** Finaliza o carrinho (checkout). A partir daqui nenhuma alteração é permitida. */
export function finalizarCarrinho(carrinho: Carrinho): Carrinho {
  garantirAberto(carrinho);
  return { ...carrinho, status: 'FINALIZADO' };
}
