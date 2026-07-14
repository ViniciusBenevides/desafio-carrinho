/**
 * Casos de uso da aplicação: orquestram repositórios (ports) e as regras
 * puras do domínio. Não conhecem HTTP nem Prisma.
 */
import {
  adicionarItem,
  alterarQuantidadeItem,
  aplicarCupom,
  finalizarCarrinho,
  removerCupom,
  removerItem,
} from '../domain/carrinho.js';
import { ErroDominio } from '../domain/erros.js';
import type { Carrinho, Produto } from '../domain/modelos.js';
import type { Repositorios } from './portas.js';

export function criarCasosDeUso(repositorios: Repositorios) {
  const { produtos, cupons, carrinhos } = repositorios;

  async function carregarCarrinho(carrinhoId: number): Promise<Carrinho> {
    const carrinho = await carrinhos.buscarPorId(carrinhoId);
    if (!carrinho) throw ErroDominio.carrinhoNaoEncontrado(carrinhoId);
    return carrinho;
  }

  async function carregarProduto(produtoId: number): Promise<Produto> {
    const produto = await produtos.buscarPorId(produtoId);
    if (!produto) throw ErroDominio.produtoNaoEncontrado(produtoId);
    return produto;
  }

  async function aplicarEPersistir(
    carrinhoId: number,
    operacao: (carrinho: Carrinho) => Carrinho | Promise<Carrinho>,
  ): Promise<Carrinho> {
    const carrinho = await carregarCarrinho(carrinhoId);
    const atualizado = await operacao(carrinho);
    await carrinhos.salvar(atualizado);
    return atualizado;
  }

  return {
    listarProdutos: () => produtos.listarTodos(),

    criarCarrinho: () => carrinhos.criar(),

    obterCarrinho: (carrinhoId: number) => carregarCarrinho(carrinhoId),

    adicionarItem: (carrinhoId: number, produtoId: number, quantidade: number) =>
      aplicarEPersistir(carrinhoId, async (carrinho) => {
        const produto = await carregarProduto(produtoId);
        return adicionarItem(carrinho, produto, quantidade);
      }),

    alterarQuantidadeItem: (carrinhoId: number, produtoId: number, quantidade: number) =>
      aplicarEPersistir(carrinhoId, (carrinho) => alterarQuantidadeItem(carrinho, produtoId, quantidade)),

    removerItem: (carrinhoId: number, produtoId: number) =>
      aplicarEPersistir(carrinhoId, (carrinho) => removerItem(carrinho, produtoId)),

    aplicarCupom: (carrinhoId: number, codigoCupom: string) =>
      aplicarEPersistir(carrinhoId, async (carrinho) => {
        const cupom = await cupons.buscarPorCodigo(codigoCupom);
        if (!cupom) throw ErroDominio.cupomInvalido(codigoCupom);
        return aplicarCupom(carrinho, cupom);
      }),

    removerCupom: (carrinhoId: number) => aplicarEPersistir(carrinhoId, (carrinho) => removerCupom(carrinho)),

    finalizarCarrinho: (carrinhoId: number) =>
      aplicarEPersistir(carrinhoId, (carrinho) => finalizarCarrinho(carrinho)),
  };
}

export type CasosDeUso = ReturnType<typeof criarCasosDeUso>;
