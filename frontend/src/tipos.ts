export interface Produto {
  id: number;
  descricaoProduto: string;
  precoLiquido: number;
  quantidadeEstoque: number;
}

export interface Cupom {
  id: number;
  codigoCupom: string;
  percentualDesconto: number;
}

export interface ItemCarrinho {
  produto: Produto;
  quantidade: number;
  precoItem: number;
}

export interface Carrinho {
  id: number;
  status: 'ABERTO' | 'FINALIZADO';
  itens: ItemCarrinho[];
  cupom: Cupom | null;
  subtotal: number;
  desconto: number;
  total: number;
}

export interface ErroApi {
  codigo: string;
  mensagem: string;
}
