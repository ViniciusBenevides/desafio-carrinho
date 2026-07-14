/**
 * Ports (interfaces) da camada de aplicação. A infraestrutura (Prisma)
 * implementa estes contratos; os casos de uso dependem apenas deles.
 */
import type { Carrinho, Cupom, Produto } from '../domain/modelos.js';

export interface RepositorioProdutos {
  listarTodos(): Promise<Produto[]>;
  buscarPorId(id: number): Promise<Produto | null>;
}

export interface RepositorioCupons {
  buscarPorCodigo(codigoCupom: string): Promise<Cupom | null>;
}

export interface RepositorioCarrinhos {
  criar(): Promise<Carrinho>;
  buscarPorId(id: number): Promise<Carrinho | null>;
  /** Persiste o estado completo do carrinho (itens, cupom, status e totais) atomicamente. */
  salvar(carrinho: Carrinho): Promise<void>;
}

export interface Repositorios {
  produtos: RepositorioProdutos;
  cupons: RepositorioCupons;
  carrinhos: RepositorioCarrinhos;
}
