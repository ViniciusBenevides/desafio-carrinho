/**
 * Especificação OpenAPI 3.0 servida no Swagger UI (/docs).
 */
const erroPadrao = {
  type: 'object',
  properties: {
    erro: {
      type: 'object',
      properties: {
        codigo: { type: 'string', example: 'ESTOQUE_INSUFICIENTE' },
        mensagem: { type: 'string' },
        detalhes: {
          type: 'array',
          description: 'Presente apenas em erros de validação da requisição (REQUISICAO_INVALIDA)',
          items: {
            type: 'object',
            properties: {
              campo: { type: 'string' },
              problema: { type: 'string' },
            },
          },
        },
      },
    },
  },
} as const;

const produto = {
  type: 'object',
  properties: {
    id: { type: 'integer', example: 1 },
    descricaoProduto: { type: 'string', example: 'Notebook Dell Inspiron 15' },
    precoLiquido: { type: 'number', format: 'decimal', example: 3499.9 },
    quantidadeEstoque: { type: 'integer', example: 8 },
  },
} as const;

const carrinho = {
  type: 'object',
  properties: {
    id: { type: 'integer', example: 1 },
    status: { type: 'string', enum: ['ABERTO', 'FINALIZADO'] },
    itens: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          produto,
          quantidade: { type: 'integer', example: 2 },
          precoItem: { type: 'number', format: 'decimal', example: 6999.8 },
        },
      },
    },
    cupom: {
      type: 'object',
      nullable: true,
      properties: {
        id: { type: 'integer', example: 1 },
        codigoCupom: { type: 'string', example: '10OFF' },
        percentualDesconto: { type: 'number', example: 10 },
      },
    },
    subtotal: { type: 'number', format: 'decimal', example: 6999.8 },
    desconto: { type: 'number', format: 'decimal', example: 699.98 },
    total: { type: 'number', format: 'decimal', example: 6299.82 },
  },
} as const;

function respostaCarrinho(descricao: string) {
  return {
    description: descricao,
    content: { 'application/json': { schema: { $ref: '#/components/schemas/Carrinho' } } },
  };
}

function respostaErro(descricao: string) {
  return {
    description: descricao,
    content: { 'application/json': { schema: { $ref: '#/components/schemas/Erro' } } },
  };
}

const parametroCarrinhoId = {
  name: 'id',
  in: 'path',
  required: true,
  schema: { type: 'integer' },
  description: 'ID do carrinho',
} as const;

const parametroProdutoId = {
  name: 'produtoId',
  in: 'path',
  required: true,
  schema: { type: 'integer' },
  description: 'ID do produto',
} as const;

export const documentoOpenApi = {
  openapi: '3.0.3',
  info: {
    title: 'API Carrinho de Compras',
    description:
      'Teste técnico — API REST de carrinho de compras com catálogo, cupons de desconto, cálculo automático de totais e checkout.',
    version: '1.0.0',
  },
  tags: [
    { name: 'Produtos', description: 'Catálogo de produtos' },
    { name: 'Carrinho', description: 'Operações do carrinho de compras' },
  ],
  paths: {
    '/produtos': {
      get: {
        tags: ['Produtos'],
        summary: 'Lista o catálogo de produtos',
        responses: {
          200: {
            description: 'Catálogo com preço líquido unitário e estoque disponível',
            content: {
              'application/json': {
                schema: { type: 'array', items: { $ref: '#/components/schemas/Produto' } },
              },
            },
          },
        },
      },
    },
    '/carrinhos': {
      post: {
        tags: ['Carrinho'],
        summary: 'Cria um novo carrinho (status ABERTO)',
        responses: { 201: respostaCarrinho('Carrinho criado') },
      },
    },
    '/carrinhos/{id}': {
      get: {
        tags: ['Carrinho'],
        summary: 'Consulta um carrinho com itens, cupom e totais',
        parameters: [parametroCarrinhoId],
        responses: {
          200: respostaCarrinho('Carrinho encontrado'),
          404: respostaErro('Carrinho não encontrado'),
        },
      },
    },
    '/carrinhos/{id}/itens': {
      post: {
        tags: ['Carrinho'],
        summary: 'Adiciona um produto ao carrinho',
        description:
          'Se o produto já está no carrinho, a quantidade informada é somada à existente. `quantidade` é opcional (padrão 1).',
        parameters: [parametroCarrinhoId],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['produtoId'],
                properties: {
                  produtoId: { type: 'integer', example: 1 },
                  quantidade: { type: 'integer', example: 1, default: 1 },
                },
              },
            },
          },
        },
        responses: {
          201: respostaCarrinho('Item adicionado; totais recalculados'),
          400: respostaErro('Quantidade inválida (menor ou igual a zero) ou requisição malformada'),
          404: respostaErro('Carrinho ou produto não encontrado'),
          409: respostaErro('Carrinho já finalizado'),
          422: respostaErro('Estoque insuficiente'),
        },
      },
    },
    '/carrinhos/{id}/itens/{produtoId}': {
      put: {
        tags: ['Carrinho'],
        summary: 'Define a quantidade exata de um item (substituição)',
        parameters: [parametroCarrinhoId, parametroProdutoId],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['quantidade'],
                properties: { quantidade: { type: 'integer', example: 5 } },
              },
            },
          },
        },
        responses: {
          200: respostaCarrinho('Quantidade substituída; totais recalculados'),
          400: respostaErro('Quantidade inválida (menor ou igual a zero) ou requisição malformada'),
          404: respostaErro('Carrinho ou item não encontrado'),
          409: respostaErro('Carrinho já finalizado'),
          422: respostaErro('Estoque insuficiente'),
        },
      },
      delete: {
        tags: ['Carrinho'],
        summary: 'Remove um produto do carrinho',
        parameters: [parametroCarrinhoId, parametroProdutoId],
        responses: {
          200: respostaCarrinho('Item removido; totais recalculados'),
          404: respostaErro('Carrinho ou item não encontrado'),
          409: respostaErro('Carrinho já finalizado'),
        },
      },
    },
    '/carrinhos/{id}/cupom': {
      post: {
        tags: ['Carrinho'],
        summary: 'Aplica um cupom de desconto (substitui o anterior, se houver)',
        parameters: [parametroCarrinhoId],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['codigoCupom'],
                properties: { codigoCupom: { type: 'string', example: '10OFF' } },
              },
            },
          },
        },
        responses: {
          200: respostaCarrinho('Cupom aplicado; totais recalculados'),
          400: respostaErro('Requisição malformada (codigoCupom ausente ou vazio)'),
          404: respostaErro('Carrinho não encontrado'),
          409: respostaErro('Carrinho já finalizado'),
          422: respostaErro('Cupom inválido ou inexistente'),
        },
      },
      delete: {
        tags: ['Carrinho'],
        summary: 'Remove o cupom aplicado',
        parameters: [parametroCarrinhoId],
        responses: {
          200: respostaCarrinho('Cupom removido; totais recalculados'),
          404: respostaErro('Carrinho não encontrado'),
          409: respostaErro('Carrinho já finalizado'),
        },
      },
    },
    '/carrinhos/{id}/finalizar': {
      post: {
        tags: ['Carrinho'],
        summary: 'Finaliza o carrinho (checkout)',
        description: 'Após finalizado, o carrinho não pode mais ser alterado.',
        parameters: [parametroCarrinhoId],
        responses: {
          200: respostaCarrinho('Carrinho finalizado'),
          404: respostaErro('Carrinho não encontrado'),
          409: respostaErro('Carrinho já estava finalizado'),
        },
      },
    },
  },
  components: {
    schemas: {
      Produto: produto,
      Carrinho: carrinho,
      Erro: erroPadrao,
    },
  },
};
