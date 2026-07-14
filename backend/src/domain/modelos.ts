import type { Decimal } from 'decimal.js';

export interface Produto {
  id: number;
  descricaoProduto: string;
  quantidadeEstoque: number;
  /** Preço líquido unitário. Sempre Decimal — nunca float — para valores monetários. */
  precoLiquido: Decimal;
}

export interface Cupom {
  id: number;
  codigoCupom: string;
  percentualDesconto: Decimal;
}

export type StatusCarrinho = 'ABERTO' | 'FINALIZADO';

export interface ItemCarrinho {
  produto: Produto;
  quantidade: number;
  /** Preço do item = preço líquido unitário × quantidade. */
  precoItem: Decimal;
}

export interface Carrinho {
  id: number;
  status: StatusCarrinho;
  itens: ItemCarrinho[];
  cupom: Cupom | null;
  subtotal: Decimal;
  desconto: Decimal;
  total: Decimal;
}
