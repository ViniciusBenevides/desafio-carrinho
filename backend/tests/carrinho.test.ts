import { Decimal } from 'decimal.js';
import { describe, expect, it } from 'vitest';
import {
  adicionarItem,
  alterarQuantidadeItem,
  aplicarCupom,
  calcularTotais,
  finalizarCarrinho,
  removerCupom,
  removerItem,
} from '../src/domain/carrinho.js';
import { ErroDominio } from '../src/domain/erros.js';
import type { Carrinho, Cupom, Produto } from '../src/domain/modelos.js';

const notebook: Produto = {
  id: 1,
  descricaoProduto: 'Notebook Dell Inspiron 15',
  quantidadeEstoque: 8,
  precoLiquido: new Decimal('3499.90'),
};

const mouse: Produto = {
  id: 2,
  descricaoProduto: 'Mouse sem fio Logitech M170',
  quantidadeEstoque: 50,
  precoLiquido: new Decimal('59.90'),
};

const cupom10: Cupom = { id: 1, codigoCupom: '10OFF', percentualDesconto: new Decimal(10) };
const cupom15: Cupom = { id: 2, codigoCupom: '15OFF', percentualDesconto: new Decimal(15) };

function carrinhoVazio(): Carrinho {
  return {
    id: 1,
    status: 'ABERTO',
    itens: [],
    cupom: null,
    subtotal: new Decimal(0),
    desconto: new Decimal(0),
    total: new Decimal(0),
  };
}

function esperarCodigo(fn: () => unknown, codigo: string) {
  try {
    fn();
    expect.unreachable('deveria ter lançado ErroDominio');
  } catch (erro) {
    expect(erro).toBeInstanceOf(ErroDominio);
    expect((erro as ErroDominio).codigo).toBe(codigo);
  }
}

describe('cálculos do carrinho', () => {
  it('carrinho vazio tem subtotal, desconto e total zerados', () => {
    const totais = calcularTotais([], null);
    expect(totais.subtotal.toFixed(2)).toBe('0.00');
    expect(totais.desconto.toFixed(2)).toBe('0.00');
    expect(totais.total.toFixed(2)).toBe('0.00');
  });

  it('subtotal soma preço unitário × quantidade de todos os itens', () => {
    let carrinho = adicionarItem(carrinhoVazio(), notebook, 2);
    carrinho = adicionarItem(carrinho, mouse, 3);
    // 2 × 3499.90 + 3 × 59.90 = 6999.80 + 179.70 = 7179.50
    expect(carrinho.subtotal.toFixed(2)).toBe('7179.50');
    expect(carrinho.desconto.toFixed(2)).toBe('0.00');
    expect(carrinho.total.toFixed(2)).toBe('7179.50');
  });

  it('preço do item reflete a quantidade', () => {
    const carrinho = adicionarItem(carrinhoVazio(), mouse, 4);
    expect(carrinho.itens[0]?.precoItem.toFixed(2)).toBe('239.60');
  });

  it('cupom de 10% aplica desconto sobre o subtotal', () => {
    let carrinho = adicionarItem(carrinhoVazio(), notebook, 1);
    carrinho = aplicarCupom(carrinho, cupom10);
    expect(carrinho.subtotal.toFixed(2)).toBe('3499.90');
    expect(carrinho.desconto.toFixed(2)).toBe('349.99');
    expect(carrinho.total.toFixed(2)).toBe('3149.91');
  });

  it('desconto arredonda para 2 casas (half-up)', () => {
    // 3 × 59.90 = 179.70; 15% = 26.955 → 26.96
    let carrinho = adicionarItem(carrinhoVazio(), mouse, 3);
    carrinho = aplicarCupom(carrinho, cupom15);
    expect(carrinho.desconto.toFixed(2)).toBe('26.96');
    expect(carrinho.total.toFixed(2)).toBe('152.74');
  });

  it('totais são recalculados ao alterar quantidade e remover item', () => {
    let carrinho = adicionarItem(carrinhoVazio(), notebook, 1);
    carrinho = adicionarItem(carrinho, mouse, 1);
    carrinho = aplicarCupom(carrinho, cupom10);

    carrinho = alterarQuantidadeItem(carrinho, mouse.id, 5);
    // 3499.90 + 5 × 59.90 = 3799.40; 10% = 379.94
    expect(carrinho.subtotal.toFixed(2)).toBe('3799.40');
    expect(carrinho.desconto.toFixed(2)).toBe('379.94');
    expect(carrinho.total.toFixed(2)).toBe('3419.46');

    carrinho = removerItem(carrinho, notebook.id);
    // 5 × 59.90 = 299.50; 10% = 29.95
    expect(carrinho.subtotal.toFixed(2)).toBe('299.50');
    expect(carrinho.desconto.toFixed(2)).toBe('29.95');
    expect(carrinho.total.toFixed(2)).toBe('269.55');
  });
});

describe('adicionar item', () => {
  it('produto novo entra com a quantidade informada', () => {
    const carrinho = adicionarItem(carrinhoVazio(), notebook, 1);
    expect(carrinho.itens).toHaveLength(1);
    expect(carrinho.itens[0]?.quantidade).toBe(1);
  });

  it('produto já existente tem a quantidade somada', () => {
    let carrinho = adicionarItem(carrinhoVazio(), notebook, 1);
    carrinho = adicionarItem(carrinho, notebook, 1);
    expect(carrinho.itens).toHaveLength(1);
    expect(carrinho.itens[0]?.quantidade).toBe(2);
    expect(carrinho.itens[0]?.precoItem.toFixed(2)).toBe('6999.80');
  });

  it('rejeita quantidade menor ou igual a zero', () => {
    esperarCodigo(() => adicionarItem(carrinhoVazio(), notebook, 0), 'QUANTIDADE_INVALIDA');
    esperarCodigo(() => adicionarItem(carrinhoVazio(), notebook, -3), 'QUANTIDADE_INVALIDA');
  });

  it('rejeita quantidade acima do estoque', () => {
    esperarCodigo(() => adicionarItem(carrinhoVazio(), notebook, 9), 'ESTOQUE_INSUFICIENTE');
  });

  it('rejeita quando a soma com a quantidade existente estoura o estoque', () => {
    const carrinho = adicionarItem(carrinhoVazio(), notebook, 8);
    esperarCodigo(() => adicionarItem(carrinho, notebook, 1), 'ESTOQUE_INSUFICIENTE');
  });
});

describe('alterar quantidade (substituição)', () => {
  it('define a quantidade exata, para mais e para menos', () => {
    let carrinho = adicionarItem(carrinhoVazio(), mouse, 2);
    carrinho = alterarQuantidadeItem(carrinho, mouse.id, 5);
    expect(carrinho.itens[0]?.quantidade).toBe(5);
    carrinho = alterarQuantidadeItem(carrinho, mouse.id, 1);
    expect(carrinho.itens[0]?.quantidade).toBe(1);
    expect(carrinho.itens[0]?.precoItem.toFixed(2)).toBe('59.90');
  });

  it('rejeita item que não está no carrinho', () => {
    esperarCodigo(() => alterarQuantidadeItem(carrinhoVazio(), 99, 1), 'ITEM_NAO_ENCONTRADO');
  });

  it('rejeita quantidade menor ou igual a zero e acima do estoque', () => {
    const carrinho = adicionarItem(carrinhoVazio(), notebook, 1);
    esperarCodigo(() => alterarQuantidadeItem(carrinho, notebook.id, 0), 'QUANTIDADE_INVALIDA');
    esperarCodigo(() => alterarQuantidadeItem(carrinho, notebook.id, 9), 'ESTOQUE_INSUFICIENTE');
  });
});

describe('remover item', () => {
  it('remove e recalcula os totais', () => {
    let carrinho = adicionarItem(carrinhoVazio(), notebook, 1);
    carrinho = removerItem(carrinho, notebook.id);
    expect(carrinho.itens).toHaveLength(0);
    expect(carrinho.total.toFixed(2)).toBe('0.00');
  });

  it('rejeita remover produto que não está no carrinho', () => {
    esperarCodigo(() => removerItem(carrinhoVazio(), 42), 'ITEM_NAO_ENCONTRADO');
  });
});

describe('cupom', () => {
  it('apenas um cupom ativo por vez: o segundo substitui o primeiro', () => {
    let carrinho = adicionarItem(carrinhoVazio(), notebook, 1);
    carrinho = aplicarCupom(carrinho, cupom10);
    carrinho = aplicarCupom(carrinho, cupom15);
    expect(carrinho.cupom?.codigoCupom).toBe('15OFF');
    expect(carrinho.desconto.toFixed(2)).toBe('524.99'); // 15% de 3499.90 = 524.985 → 524.99
  });

  it('remover o cupom zera o desconto', () => {
    let carrinho = adicionarItem(carrinhoVazio(), notebook, 1);
    carrinho = aplicarCupom(carrinho, cupom10);
    carrinho = removerCupom(carrinho);
    expect(carrinho.cupom).toBeNull();
    expect(carrinho.desconto.toFixed(2)).toBe('0.00');
    expect(carrinho.total.toFixed(2)).toBe('3499.90');
  });
});

describe('finalizar carrinho', () => {
  it('muda o status para FINALIZADO', () => {
    const carrinho = finalizarCarrinho(adicionarItem(carrinhoVazio(), mouse, 1));
    expect(carrinho.status).toBe('FINALIZADO');
  });

  it('carrinho finalizado não aceita nenhuma alteração', () => {
    const finalizado = finalizarCarrinho(adicionarItem(carrinhoVazio(), mouse, 1));
    esperarCodigo(() => adicionarItem(finalizado, notebook, 1), 'CARRINHO_FINALIZADO');
    esperarCodigo(() => alterarQuantidadeItem(finalizado, mouse.id, 2), 'CARRINHO_FINALIZADO');
    esperarCodigo(() => removerItem(finalizado, mouse.id), 'CARRINHO_FINALIZADO');
    esperarCodigo(() => aplicarCupom(finalizado, cupom10), 'CARRINHO_FINALIZADO');
    esperarCodigo(() => removerCupom(finalizado), 'CARRINHO_FINALIZADO');
    esperarCodigo(() => finalizarCarrinho(finalizado), 'CARRINHO_FINALIZADO');
  });
});
