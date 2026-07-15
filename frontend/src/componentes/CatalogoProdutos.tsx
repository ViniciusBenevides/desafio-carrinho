import { useMemo, useState } from 'react';
import { formatarBRL } from '../api';
import type { Produto } from '../tipos';
import { IlustracaoHero } from './Ilustracoes';
import { ImagemProduto } from './ImagemProduto';

type Ordenacao = 'relevancia' | 'menor-preco' | 'maior-preco' | 'nome';

const ROTULOS_ORDENACAO: Record<Ordenacao, string> = {
  relevancia: 'Relevância',
  'menor-preco': 'Menor preço',
  'maior-preco': 'Maior preço',
  nome: 'Nome (A–Z)',
};

interface Props {
  produtos: Produto[];
  busca: string;
  quantidadePorProduto: Map<number, number>;
  carrinhoFinalizado: boolean;
  ocupado: boolean;
  aoAdicionar: (produtoId: number) => void;
  aoAplicarCupom: (codigo: string) => void;
}

export function CatalogoProdutos({
  produtos,
  busca,
  quantidadePorProduto,
  carrinhoFinalizado,
  ocupado,
  aoAdicionar,
  aoAplicarCupom,
}: Props) {
  const [ordenacao, setOrdenacao] = useState<Ordenacao>('relevancia');
  const buscando = busca.trim() !== '';

  const produtosVisiveis = useMemo(() => {
    const termo = busca.trim().toLowerCase();
    const filtrados = termo
      ? produtos.filter((produto) => produto.descricaoProduto.toLowerCase().includes(termo))
      : produtos;

    const ordenados = [...filtrados];
    if (ordenacao === 'menor-preco') ordenados.sort((a, b) => a.precoLiquido - b.precoLiquido);
    if (ordenacao === 'maior-preco') ordenados.sort((a, b) => b.precoLiquido - a.precoLiquido);
    if (ordenacao === 'nome') ordenados.sort((a, b) => a.descricaoProduto.localeCompare(b.descricaoProduto, 'pt-BR'));
    return ordenados;
  }, [produtos, busca, ordenacao]);

  return (
    <section className="catalogo" aria-label="Catálogo de produtos">
      {!buscando && (
        <div className="hero">
          <div className="hero-texto">
            <h1>
              Monte seu setup com
              <br />
              até <em>15% de desconto</em>
            </h1>
            <p>Aplique os cupons no carrinho e economize em todo o catálogo.</p>
            <div className="hero-acoes">
              <button type="button" className="botao-primario" onClick={() => aoAplicarCupom('15OFF')} disabled={ocupado || carrinhoFinalizado}>
                Aplicar cupom 15OFF
              </button>
              <button type="button" className="botao-fantasma" onClick={() => aoAplicarCupom('10OFF')} disabled={ocupado || carrinhoFinalizado}>
                Prefiro o 10OFF
              </button>
            </div>
          </div>
          <IlustracaoHero className="hero-ilustracao" />
        </div>
      )}

      <div className="catalogo-barra">
        <h2 className="catalogo-titulo">
          {buscando ? (
            <>
              {produtosVisiveis.length === 0
                ? 'Nenhum produto encontrado'
                : `${produtosVisiveis.length} resultado${produtosVisiveis.length > 1 ? 's' : ''}`}
              <span className="titulo-busca"> para “{busca.trim()}”</span>
            </>
          ) : (
            'Produtos para você'
          )}
        </h2>

        <label className="seletor-ordenacao">
          <span>Ordenar por</span>
          <select value={ordenacao} onChange={(evento) => setOrdenacao(evento.target.value as Ordenacao)}>
            {Object.entries(ROTULOS_ORDENACAO).map(([valor, rotulo]) => (
              <option key={valor} value={valor}>
                {rotulo}
              </option>
            ))}
          </select>
        </label>
      </div>

      {produtosVisiveis.length === 0 ? (
        <p className="catalogo-vazio">Tente buscar por outro termo — ex.: “mouse”, “monitor” ou “ssd”.</p>
      ) : (
        <div className="grade-produtos">
          {produtosVisiveis.map((produto) => {
            const noCarrinho = quantidadePorProduto.get(produto.id) ?? 0;
            const esgotado = produto.quantidadeEstoque === 0;
            const limiteAtingido = noCarrinho >= produto.quantidadeEstoque;
            const poucoEstoque = !esgotado && produto.quantidadeEstoque <= 5;

            return (
              <article className="cartao-produto" key={produto.id}>
                <div className="cartao-visual">
                  <ImagemProduto
                    produtoId={produto.id}
                    descricao={produto.descricaoProduto}
                    className="cartao-ilustracao"
                  />
                  {(poucoEstoque || esgotado) && (
                    <span className={`selo-estoque${esgotado ? ' selo-esgotado' : ''}`}>
                      {esgotado ? 'Esgotado' : `Últimas ${produto.quantidadeEstoque} un.`}
                    </span>
                  )}
                  {noCarrinho > 0 && <span className="selo-no-carrinho">{noCarrinho} no carrinho</span>}
                </div>

                <div className="cartao-info">
                  <div className="cartao-linha">
                    <h3 className="cartao-nome">{produto.descricaoProduto}</h3>
                    <span className="cartao-preco">{formatarBRL(produto.precoLiquido)}</span>
                  </div>
                  <p className="cartao-meta">
                    {esgotado ? 'Sem previsão de reposição' : `Pronta entrega · ${produto.quantidadeEstoque} em estoque`}
                  </p>
                  <button
                    type="button"
                    className="botao-adicionar"
                    disabled={esgotado || limiteAtingido || ocupado || carrinhoFinalizado}
                    onClick={() => aoAdicionar(produto.id)}
                  >
                    {esgotado ? 'Indisponível' : limiteAtingido ? 'Estoque máximo' : 'Adicionar ao carrinho'}
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}
