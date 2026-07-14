import { Decimal } from 'decimal.js';
import { beforeEach, describe, expect, it } from 'vitest';
import { criarCasosDeUso, type CasosDeUso } from '../src/application/casos-de-uso.js';
import type { Repositorios } from '../src/application/portas.js';
import { ErroDominio } from '../src/domain/erros.js';
import type { Carrinho, Cupom, Produto } from '../src/domain/modelos.js';

const produtos: Produto[] = [
  { id: 1, descricaoProduto: 'Notebook', quantidadeEstoque: 8, precoLiquido: new Decimal('3499.90') },
  { id: 2, descricaoProduto: 'Mouse', quantidadeEstoque: 50, precoLiquido: new Decimal('59.90') },
];

const cupons: Cupom[] = [
  { id: 1, codigoCupom: '10OFF', percentualDesconto: new Decimal(10) },
  { id: 2, codigoCupom: '15OFF', percentualDesconto: new Decimal(15) },
];

/** Repositórios fake em memória — os casos de uso só conhecem os ports. */
function criarRepositoriosEmMemoria(): Repositorios {
  const carrinhos = new Map<number, Carrinho>();
  let proximoId = 1;

  return {
    produtos: {
      listarTodos: async () => produtos,
      buscarPorId: async (id) => produtos.find((produto) => produto.id === id) ?? null,
    },
    cupons: {
      buscarPorCodigo: async (codigo) => cupons.find((cupom) => cupom.codigoCupom === codigo) ?? null,
    },
    carrinhos: {
      criar: async () => {
        const carrinho: Carrinho = {
          id: proximoId++,
          status: 'ABERTO',
          itens: [],
          cupom: null,
          subtotal: new Decimal(0),
          desconto: new Decimal(0),
          total: new Decimal(0),
        };
        carrinhos.set(carrinho.id, carrinho);
        return carrinho;
      },
      buscarPorId: async (id) => carrinhos.get(id) ?? null,
      salvar: async (carrinho) => {
        carrinhos.set(carrinho.id, carrinho);
      },
    },
  };
}

async function esperarCodigo(promessa: Promise<unknown>, codigo: string) {
  await expect(promessa).rejects.toSatisfy(
    (erro) => erro instanceof ErroDominio && erro.codigo === codigo,
    `esperava ErroDominio com código ${codigo}`,
  );
}

describe('casos de uso do carrinho', () => {
  let casosDeUso: CasosDeUso;

  beforeEach(() => {
    casosDeUso = criarCasosDeUso(criarRepositoriosEmMemoria());
  });

  it('fluxo completo: criar, adicionar, cupom, alterar, finalizar', async () => {
    const criado = await casosDeUso.criarCarrinho();

    await casosDeUso.adicionarItem(criado.id, 1, 1);
    await casosDeUso.adicionarItem(criado.id, 2, 2);
    await casosDeUso.aplicarCupom(criado.id, '10OFF');
    const alterado = await casosDeUso.alterarQuantidadeItem(criado.id, 2, 5);

    // 3499.90 + 5 × 59.90 = 3799.40; 10% = 379.94; total 3419.46
    expect(alterado.subtotal.toFixed(2)).toBe('3799.40');
    expect(alterado.desconto.toFixed(2)).toBe('379.94');
    expect(alterado.total.toFixed(2)).toBe('3419.46');

    const finalizado = await casosDeUso.finalizarCarrinho(criado.id);
    expect(finalizado.status).toBe('FINALIZADO');

    // o estado persistido reflete a finalização
    const relido = await casosDeUso.obterCarrinho(criado.id);
    expect(relido.status).toBe('FINALIZADO');
    await esperarCodigo(casosDeUso.adicionarItem(criado.id, 1, 1), 'CARRINHO_FINALIZADO');
  });

  it('persiste as alterações a cada operação', async () => {
    const criado = await casosDeUso.criarCarrinho();
    await casosDeUso.adicionarItem(criado.id, 1, 2);

    const relido = await casosDeUso.obterCarrinho(criado.id);
    expect(relido.itens[0]?.quantidade).toBe(2);
    expect(relido.subtotal.toFixed(2)).toBe('6999.80');
  });

  it('carrinho inexistente retorna CARRINHO_NAO_ENCONTRADO', async () => {
    await esperarCodigo(casosDeUso.obterCarrinho(999), 'CARRINHO_NAO_ENCONTRADO');
    await esperarCodigo(casosDeUso.adicionarItem(999, 1, 1), 'CARRINHO_NAO_ENCONTRADO');
  });

  it('produto inexistente retorna PRODUTO_NAO_ENCONTRADO', async () => {
    const criado = await casosDeUso.criarCarrinho();
    await esperarCodigo(casosDeUso.adicionarItem(criado.id, 999, 1), 'PRODUTO_NAO_ENCONTRADO');
  });

  it('cupom inexistente retorna CUPOM_INVALIDO e não altera o carrinho', async () => {
    const criado = await casosDeUso.criarCarrinho();
    await casosDeUso.adicionarItem(criado.id, 2, 1);
    await esperarCodigo(casosDeUso.aplicarCupom(criado.id, 'NAOEXISTE'), 'CUPOM_INVALIDO');

    const relido = await casosDeUso.obterCarrinho(criado.id);
    expect(relido.cupom).toBeNull();
    expect(relido.desconto.toFixed(2)).toBe('0.00');
  });

  it('troca de cupom mantém apenas o segundo ativo', async () => {
    const criado = await casosDeUso.criarCarrinho();
    await casosDeUso.adicionarItem(criado.id, 1, 1);
    await casosDeUso.aplicarCupom(criado.id, '10OFF');
    const comSegundoCupom = await casosDeUso.aplicarCupom(criado.id, '15OFF');

    expect(comSegundoCupom.cupom?.codigoCupom).toBe('15OFF');
    expect(comSegundoCupom.desconto.toFixed(2)).toBe('524.99');
  });

  it('erro de estoque não persiste alteração parcial', async () => {
    const criado = await casosDeUso.criarCarrinho();
    await casosDeUso.adicionarItem(criado.id, 1, 8);
    await esperarCodigo(casosDeUso.adicionarItem(criado.id, 1, 1), 'ESTOQUE_INSUFICIENTE');

    const relido = await casosDeUso.obterCarrinho(criado.id);
    expect(relido.itens[0]?.quantidade).toBe(8);
  });
});
