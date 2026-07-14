import { z } from 'zod';

export const esquemaIdParam = z.object({
  id: z.coerce.number().int().positive(),
});

export const esquemaIdEProdutoParam = z.object({
  id: z.coerce.number().int().positive(),
  produtoId: z.coerce.number().int().positive(),
});

export const esquemaAdicionarItem = z.object({
  produtoId: z.number({ required_error: 'produtoId é obrigatório' }).int(),
  quantidade: z.number().int().optional().default(1),
});

export const esquemaAlterarQuantidade = z.object({
  quantidade: z.number({ required_error: 'quantidade é obrigatória' }).int(),
});

export const esquemaAplicarCupom = z.object({
  codigoCupom: z
    .string({ required_error: 'codigoCupom é obrigatório' })
    .trim()
    .min(1, 'codigoCupom não pode ser vazio'),
});
