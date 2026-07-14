import { Router } from 'express';
import type { CasosDeUso } from '../application/casos-de-uso.js';
import { carrinhoParaDto, produtoParaDto } from '../application/dto.js';
import {
  esquemaAdicionarItem,
  esquemaAlterarQuantidade,
  esquemaAplicarCupom,
  esquemaIdEProdutoParam,
  esquemaIdParam,
} from './validacao.js';

export function criarRotas(casosDeUso: CasosDeUso): Router {
  const rotas = Router();

  rotas.get('/produtos', async (_req, res) => {
    const produtos = await casosDeUso.listarProdutos();
    res.json(produtos.map(produtoParaDto));
  });

  rotas.post('/carrinhos', async (_req, res) => {
    const carrinho = await casosDeUso.criarCarrinho();
    res.status(201).json(carrinhoParaDto(carrinho));
  });

  rotas.get('/carrinhos/:id', async (req, res) => {
    const { id } = esquemaIdParam.parse(req.params);
    res.json(carrinhoParaDto(await casosDeUso.obterCarrinho(id)));
  });

  rotas.post('/carrinhos/:id/itens', async (req, res) => {
    const { id } = esquemaIdParam.parse(req.params);
    const { produtoId, quantidade } = esquemaAdicionarItem.parse(req.body);
    res.status(201).json(carrinhoParaDto(await casosDeUso.adicionarItem(id, produtoId, quantidade)));
  });

  rotas.put('/carrinhos/:id/itens/:produtoId', async (req, res) => {
    const { id, produtoId } = esquemaIdEProdutoParam.parse(req.params);
    const { quantidade } = esquemaAlterarQuantidade.parse(req.body);
    res.json(carrinhoParaDto(await casosDeUso.alterarQuantidadeItem(id, produtoId, quantidade)));
  });

  rotas.delete('/carrinhos/:id/itens/:produtoId', async (req, res) => {
    const { id, produtoId } = esquemaIdEProdutoParam.parse(req.params);
    res.json(carrinhoParaDto(await casosDeUso.removerItem(id, produtoId)));
  });

  rotas.post('/carrinhos/:id/cupom', async (req, res) => {
    const { id } = esquemaIdParam.parse(req.params);
    const { codigoCupom } = esquemaAplicarCupom.parse(req.body);
    res.json(carrinhoParaDto(await casosDeUso.aplicarCupom(id, codigoCupom)));
  });

  rotas.delete('/carrinhos/:id/cupom', async (req, res) => {
    const { id } = esquemaIdParam.parse(req.params);
    res.json(carrinhoParaDto(await casosDeUso.removerCupom(id)));
  });

  rotas.post('/carrinhos/:id/finalizar', async (req, res) => {
    const { id } = esquemaIdParam.parse(req.params);
    res.json(carrinhoParaDto(await casosDeUso.finalizarCarrinho(id)));
  });

  return rotas;
}
