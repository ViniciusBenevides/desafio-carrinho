import type { Carrinho, ErroApi, Produto } from './tipos';

const BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3001';

export class ApiError extends Error {
  constructor(
    readonly codigo: string,
    mensagem: string,
  ) {
    super(mensagem);
    this.name = 'ApiError';
  }
}

async function requisitar<T>(caminho: string, opcoes?: RequestInit): Promise<T> {
  let resposta: Response;
  try {
    resposta = await fetch(`${BASE_URL}${caminho}`, {
      headers: { 'Content-Type': 'application/json' },
      ...opcoes,
    });
  } catch {
    throw new ApiError('SEM_CONEXAO', 'Não foi possível conectar à API. Verifique se o back-end está rodando.');
  }

  const corpo = (await resposta.json().catch(() => null)) as (T & { erro?: ErroApi }) | null;

  if (!resposta.ok) {
    const erro = corpo?.erro;
    throw new ApiError(erro?.codigo ?? 'ERRO_DESCONHECIDO', erro?.mensagem ?? 'Erro inesperado na API.');
  }

  return corpo as T;
}

export const api = {
  listarProdutos: () => requisitar<Produto[]>('/produtos'),

  criarCarrinho: () => requisitar<Carrinho>('/carrinhos', { method: 'POST' }),

  obterCarrinho: (id: number) => requisitar<Carrinho>(`/carrinhos/${id}`),

  adicionarItem: (carrinhoId: number, produtoId: number, quantidade = 1) =>
    requisitar<Carrinho>(`/carrinhos/${carrinhoId}/itens`, {
      method: 'POST',
      body: JSON.stringify({ produtoId, quantidade }),
    }),

  alterarQuantidade: (carrinhoId: number, produtoId: number, quantidade: number) =>
    requisitar<Carrinho>(`/carrinhos/${carrinhoId}/itens/${produtoId}`, {
      method: 'PUT',
      body: JSON.stringify({ quantidade }),
    }),

  removerItem: (carrinhoId: number, produtoId: number) =>
    requisitar<Carrinho>(`/carrinhos/${carrinhoId}/itens/${produtoId}`, { method: 'DELETE' }),

  aplicarCupom: (carrinhoId: number, codigoCupom: string) =>
    requisitar<Carrinho>(`/carrinhos/${carrinhoId}/cupom`, {
      method: 'POST',
      body: JSON.stringify({ codigoCupom }),
    }),

  removerCupom: (carrinhoId: number) => requisitar<Carrinho>(`/carrinhos/${carrinhoId}/cupom`, { method: 'DELETE' }),

  finalizarCarrinho: (carrinhoId: number) =>
    requisitar<Carrinho>(`/carrinhos/${carrinhoId}/finalizar`, { method: 'POST' }),
};

export function formatarBRL(valor: number): string {
  return valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}
