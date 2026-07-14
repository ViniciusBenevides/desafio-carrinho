/**
 * Conversão dos modelos de domínio (com Decimal) para DTOs serializáveis
 * em JSON. Valores monetários saem como number já arredondado a 2 casas.
 */
import type { Decimal } from 'decimal.js';
import type { Carrinho, Cupom, Produto } from '../domain/modelos.js';

function paraNumero(valor: Decimal): number {
  return Number(valor.toFixed(2));
}

export function produtoParaDto(produto: Produto) {
  return {
    id: produto.id,
    descricaoProduto: produto.descricaoProduto,
    precoLiquido: paraNumero(produto.precoLiquido),
    quantidadeEstoque: produto.quantidadeEstoque,
  };
}

export function cupomParaDto(cupom: Cupom) {
  return {
    id: cupom.id,
    codigoCupom: cupom.codigoCupom,
    percentualDesconto: cupom.percentualDesconto.toNumber(),
  };
}

export function carrinhoParaDto(carrinho: Carrinho) {
  return {
    id: carrinho.id,
    status: carrinho.status,
    itens: carrinho.itens.map((item) => ({
      produto: produtoParaDto(item.produto),
      quantidade: item.quantidade,
      precoItem: paraNumero(item.precoItem),
    })),
    cupom: carrinho.cupom ? cupomParaDto(carrinho.cupom) : null,
    subtotal: paraNumero(carrinho.subtotal),
    desconto: paraNumero(carrinho.desconto),
    total: paraNumero(carrinho.total),
  };
}

export type ProdutoDto = ReturnType<typeof produtoParaDto>;
export type CarrinhoDto = ReturnType<typeof carrinhoParaDto>;
