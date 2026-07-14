/**
 * Tratamento centralizado de erros: converte erros de domínio e de
 * validação em respostas HTTP padronizadas no formato
 * { erro: { codigo, mensagem, detalhes? } }.
 */
import type { NextFunction, Request, Response } from 'express';
import { ZodError } from 'zod';
import { ErroDominio, type CodigoErroDominio } from '../domain/erros.js';

const statusPorCodigo: Record<CodigoErroDominio, number> = {
  PRODUTO_NAO_ENCONTRADO: 404,
  CARRINHO_NAO_ENCONTRADO: 404,
  ITEM_NAO_ENCONTRADO: 404,
  CUPOM_INVALIDO: 422,
  QUANTIDADE_INVALIDA: 400,
  ESTOQUE_INSUFICIENTE: 422,
  CARRINHO_FINALIZADO: 409,
};

export function middlewareDeErros(erro: unknown, _req: Request, res: Response, _next: NextFunction): void {
  if (erro instanceof ErroDominio) {
    res.status(statusPorCodigo[erro.codigo]).json({
      erro: { codigo: erro.codigo, mensagem: erro.message },
    });
    return;
  }

  // JSON malformado rejeitado pelo express.json() é erro do cliente, não do servidor
  if (erro instanceof SyntaxError && 'body' in erro) {
    res.status(400).json({
      erro: { codigo: 'REQUISICAO_INVALIDA', mensagem: 'JSON malformado no corpo da requisição.' },
    });
    return;
  }

  if (erro instanceof ZodError) {
    res.status(400).json({
      erro: {
        codigo: 'REQUISICAO_INVALIDA',
        mensagem: 'Requisição inválida.',
        detalhes: erro.issues.map((issue) => ({
          campo: issue.path.join('.') || '(corpo)',
          problema: issue.message,
        })),
      },
    });
    return;
  }

  console.error('Erro inesperado:', erro);
  res.status(500).json({
    erro: { codigo: 'ERRO_INTERNO', mensagem: 'Erro interno do servidor.' },
  });
}
