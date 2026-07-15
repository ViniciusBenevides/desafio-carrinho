# Teste Técnico — Carrinho de Compras

API REST de carrinho de compras + front-end que a consome.

| Camada | Stack |
| --- | --- |
| Back-end | Node.js · TypeScript · Express 5 · **Prisma ORM** |
| Banco | **PostgreSQL** (persistência obrigatória — catálogo e cupons via seed/migration) |
| Front-end | React 19 · Vite · TypeScript (sem bibliotecas de UI) |
| Testes | Vitest — 27 testes de domínio e casos de uso |
| Docs | Swagger UI em `/docs` · coleção [`api.http`](api.http) |

---

## Como rodar

### Opção 1 — Docker (recomendado)

Requisito: Docker + Docker Compose.

```bash
docker compose up --build
```

Sobe os três serviços: PostgreSQL 16, API (migrations + seed automáticos) e web.

- Front-end: http://localhost:5173
- API: http://localhost:3001 · Swagger: http://localhost:3001/docs

### Opção 2 — Local, sem Docker

Requisitos: Node.js 20+ e um PostgreSQL acessível.

> **Não tem PostgreSQL instalado?** O projeto inclui um Postgres embarcado
> (binários baixados pelo npm, nada é instalado na máquina):
> `cd backend && npm run db:embedded` — ele sobe em `localhost:5433`.
> Nesse caso, use no `.env` a URL indicada no comentário do passo abaixo (porta **5433**).

**Back-end:**

```bash
cd backend
npm install
cp .env.example .env        # ajuste DATABASE_URL para o seu Postgres
                            # (com o embarcado: postgresql://postgres:postgres@localhost:5433/carrinho?schema=public)
npx prisma migrate deploy   # cria as tabelas
npm run db:seed             # popula catálogo (catalogoProdutos.json) e cupons (cupons.json)
npm run dev                 # API em http://localhost:3001
```

**Front-end** (em outro terminal):

```bash
cd frontend
npm install
npm run dev                 # http://localhost:5173 (a API precisa estar de pé)
```

**Testes:**

```bash
cd backend
npm test
```

---

## Arquitetura

Camadas simples com dependências apontando para dentro — o domínio não conhece
banco, HTTP nem framework:

```
backend/src/
├── domain/           # Regras de negócio PURAS (funções sem I/O)
│   ├── modelos.ts    #   Produto, Cupom, Carrinho, ItemCarrinho (Decimal para dinheiro)
│   ├── carrinho.ts   #   adicionarItem, alterarQuantidadeItem, removerItem,
│   │                 #   aplicarCupom, removerCupom, finalizarCarrinho, cálculos
│   └── erros.ts      #   ErroDominio com códigos semânticos (sem HTTP status)
├── application/      # Orquestração
│   ├── portas.ts     #   Interfaces dos repositórios (ports)
│   ├── casos-de-uso.ts   # carregar → aplicar regra de domínio → persistir
│   └── dto.ts        #   Domínio (Decimal) → JSON (number 2 casas)
├── infrastructure/   # Detalhes técnicos
│   └── repositorios-prisma.ts  # Implementação Prisma dos ports (transações)
└── http/             # Apresentação
    ├── rotas.ts      #   Endpoints REST finos (validam entrada e delegam)
    ├── validacao.ts  #   Schemas zod (forma da requisição)
    ├── erros.ts      #   ErroDominio/ZodError → HTTP status + payload padronizado
    └── openapi.ts    #   Especificação Swagger
```

O ganho prático: as regras do desafio (soma de quantidade, substituição,
estoque, cupom único, carrinho finalizado imutável e todos os cálculos) estão
em **funções puras testadas isoladamente** — os 27 testes rodam sem banco.
Os casos de uso são testados com repositórios fake em memória, provando que a
aplicação depende só dos contratos (ports), não do Prisma.

### Endpoints

| Método | Rota | Descrição |
| --- | --- | --- |
| GET | `/produtos` | Catálogo com preço líquido unitário + estoque |
| POST | `/carrinhos` | Cria carrinho (status `ABERTO`) |
| GET | `/carrinhos/:id` | Carrinho com itens, cupom, subtotal, desconto, total |
| POST | `/carrinhos/:id/itens` | Adiciona produto (**soma** se já existir) |
| PUT | `/carrinhos/:id/itens/:produtoId` | Define quantidade **exata** (substituição) |
| DELETE | `/carrinhos/:id/itens/:produtoId` | Remove item |
| POST | `/carrinhos/:id/cupom` | Aplica cupom (substitui o anterior) |
| DELETE | `/carrinhos/:id/cupom` | Remove cupom |
| POST | `/carrinhos/:id/finalizar` | Checkout — carrinho vira imutável |

### Erros padronizados

Toda falha de negócio retorna `{ "erro": { "codigo", "mensagem" } }`:

| Código | HTTP | Quando |
| --- | --- | --- |
| `QUANTIDADE_INVALIDA` | 400 | Quantidade ≤ 0 ou não inteira |
| `REQUISICAO_INVALIDA` | 400 | Corpo/parâmetros malformados (zod) |
| `PRODUTO_NAO_ENCONTRADO` / `CARRINHO_NAO_ENCONTRADO` / `ITEM_NAO_ENCONTRADO` | 404 | Recurso inexistente |
| `CARRINHO_FINALIZADO` | 409 | Mutação após o checkout |
| `CUPOM_INVALIDO` / `ESTOQUE_INSUFICIENTE` | 422 | Regra de negócio violada |

---

## Decisões de design e premissas

1. **Dinheiro nunca em float.** `Decimal(10,2)`/`Decimal(12,2)` no banco e
   `decimal.js` no domínio; arredondamento *half-up* a 2 casas (padrão
   comercial). A serialização JSON converte para `number` já arredondado.

2. **Totais persistidos no carrinho.** `subtotal`, `desconto` e `total` são
   recalculados pelo domínio a cada mutação e gravados na tabela `carrinho`.
   Motivo: após a finalização o carrinho é um registro histórico — os valores
   ficam estáveis mesmo que o preço do produto mude no catálogo depois.

3. **Adição com quantidade informada.** O enunciado diz que o produto novo
   "entra com quantidade 1"; interpretei o `1` como o caso típico e deixei a
   `quantidade` opcional no payload (padrão `1`). Produto novo entra com a
   quantidade enviada; produto existente tem a quantidade **somada** — nos dois
   casos validando o estoque do total resultante.

4. **Estoque validado, não decrementado.** A API impede que o carrinho exceda
   o estoque, mas o checkout não baixa o estoque — reserva/baixa de estoque
   envolve decisões (expiração de reserva, concorrência) que estão fora do
   escopo do enunciado. Está isolado no domínio, então evoluir é localizado.

5. **Nomenclatura em português.** O ubiquitous language do enunciado
   (`precoLiquido`, `codigoCupom`, `Carrinho`) foi mantido no código, na API e
   no banco (em `snake_case` nas colunas, o idiomático em PostgreSQL — ex.:
   `preco_liquido`, `quantidade_estoque` — via `@map` do Prisma).

6. **`deleteMany` + `createMany` ao salvar itens.** O repositório persiste o
   estado completo do carrinho numa transação. Para carrinhos de e-commerce
   (dezenas de itens no máximo) é simples e correto; com volume real, trocaria
   por *diff* de itens sem tocar nas outras camadas. O fluxo
   carregar → regra de domínio → salvar assume **um cliente por carrinho**
   (sem lock): requisições simultâneas no mesmo carrinho podem se sobrescrever.
   A evolução natural — lock otimista com coluna `version` — está listada em
   "com mais tempo" e ficaria contida no repositório.

7. **Cupom sobre o subtotal.** Percentual aplicado ao subtotal, como pede o
   enunciado; troca de cupom substitui o anterior (apenas um ativo), e cupom
   inexistente retorna `422` sem alterar o estado do carrinho.

8. **Front-end sem lib de UI.** CSS autoral com design system próprio
   (paleta verde-floresta/bege, botões pill, tipografia Manrope + Inter
   self-hosted via `@fontsource` — nada é baixado em runtime). Como o
   catálogo não tem fotos, cada produto ganhou uma imagem ilustrativa de
   catálogo de varejo servida localmente (`public/produtos/`), com
   **fallback para uma ilustração SVG autoral** por categoria caso o arquivo
   falte. Busca e ordenação do catálogo são client-side (o catálogo é
   pequeno); já o estado do carrinho vem sempre da resposta da API — o front
   nunca calcula totais, só exibe (fonte única da verdade no back).

9. **Carrinho retomado por `localStorage`.** O front guarda o `carrinhoId` e
   retoma o carrinho aberto ao recarregar a página; carrinho finalizado em
   visita anterior gera um novo automaticamente.

## O que eu faria com mais tempo

- Reserva/baixa de estoque no checkout com lock otimista (`version` na linha).
- Testes de integração da camada HTTP (supertest) e E2E do front (Playwright).
- Paginação do catálogo e busca por descrição.
- CI (GitHub Actions) rodando typecheck + testes + build nos dois pacotes.
