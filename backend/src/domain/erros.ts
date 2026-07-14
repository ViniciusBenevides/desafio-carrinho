export type CodigoErroDominio =
  | 'PRODUTO_NAO_ENCONTRADO'
  | 'CARRINHO_NAO_ENCONTRADO'
  | 'ITEM_NAO_ENCONTRADO'
  | 'CUPOM_INVALIDO'
  | 'QUANTIDADE_INVALIDA'
  | 'ESTOQUE_INSUFICIENTE'
  | 'CARRINHO_FINALIZADO';

/**
 * Erro de regra de negócio. O domínio conhece apenas o código semântico;
 * o mapeamento para HTTP status acontece na camada de apresentação.
 */
export class ErroDominio extends Error {
  constructor(
    readonly codigo: CodigoErroDominio,
    mensagem: string,
  ) {
    super(mensagem);
    this.name = 'ErroDominio';
  }

  static produtoNaoEncontrado(produtoId: number) {
    return new ErroDominio('PRODUTO_NAO_ENCONTRADO', `Produto ${produtoId} não encontrado no catálogo.`);
  }

  static carrinhoNaoEncontrado(carrinhoId: number) {
    return new ErroDominio('CARRINHO_NAO_ENCONTRADO', `Carrinho ${carrinhoId} não encontrado.`);
  }

  static itemNaoEncontrado(produtoId: number) {
    return new ErroDominio('ITEM_NAO_ENCONTRADO', `O produto ${produtoId} não está no carrinho.`);
  }

  static cupomInvalido(codigo: string) {
    return new ErroDominio('CUPOM_INVALIDO', `Cupom "${codigo}" é inválido ou não existe.`);
  }

  static quantidadeInvalida(quantidade: number) {
    return new ErroDominio(
      'QUANTIDADE_INVALIDA',
      `Quantidade deve ser um número inteiro maior que zero (recebido: ${quantidade}).`,
    );
  }

  static estoqueInsuficiente(descricaoProduto: string, disponivel: number, solicitado: number) {
    return new ErroDominio(
      'ESTOQUE_INSUFICIENTE',
      `Estoque insuficiente para "${descricaoProduto}": disponível ${disponivel}, solicitado ${solicitado}.`,
    );
  }

  static carrinhoFinalizado(carrinhoId: number) {
    return new ErroDominio(
      'CARRINHO_FINALIZADO',
      `O carrinho ${carrinhoId} já foi finalizado e não pode mais ser alterado.`,
    );
  }
}
