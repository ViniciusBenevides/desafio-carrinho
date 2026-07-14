import { formatarBRL } from '../api';
import type { Produto } from '../tipos';

const ICONES: Array<[RegExp, string]> = [
  [/notebook/i, '💻'],
  [/mouse/i, '🖱️'],
  [/teclado/i, '⌨️'],
  [/monitor/i, '🖥️'],
  [/headset/i, '🎧'],
  [/webcam/i, '📷'],
  [/ssd/i, '💾'],
  [/cadeira/i, '🪑'],
  [/carregador/i, '🔌'],
  [/hub/i, '🔗'],
];

function iconeDoProduto(descricao: string): string {
  return ICONES.find(([padrao]) => padrao.test(descricao))?.[1] ?? '📦';
}

interface Props {
  produtos: Produto[];
  quantidadePorProduto: Map<number, number>;
  carrinhoFinalizado: boolean;
  ocupado: boolean;
  aoAdicionar: (produtoId: number) => void;
}

export function CatalogoProdutos({ produtos, quantidadePorProduto, carrinhoFinalizado, ocupado, aoAdicionar }: Props) {
  return (
    <section className="catalogo" aria-label="Catálogo de produtos">
      <div className="catalogo-titulo">
        <h1>
          Equipamentos para quem
          <br />
          <em>constrói o futuro</em>
        </h1>
        <p className="catalogo-subtitulo">
          {produtos.length} produtos em catálogo · preços à vista · estoque em tempo real
        </p>
      </div>

      <div className="grade-produtos">
        {produtos.map((produto) => {
          const noCarrinho = quantidadePorProduto.get(produto.id) ?? 0;
          const esgotado = produto.quantidadeEstoque === 0;
          const limiteAtingido = noCarrinho >= produto.quantidadeEstoque;
          const poucoEstoque = !esgotado && produto.quantidadeEstoque <= 5;

          return (
            <article className="cartao-produto" key={produto.id}>
              <div className="cartao-visual" aria-hidden="true">
                <span className="cartao-icone">{iconeDoProduto(produto.descricaoProduto)}</span>
              </div>

              <div className="cartao-info">
                <span className={`selo-estoque${poucoEstoque ? ' selo-alerta' : ''}${esgotado ? ' selo-esgotado' : ''}`}>
                  {esgotado
                    ? 'esgotado'
                    : poucoEstoque
                      ? `últimas ${produto.quantidadeEstoque} unidades`
                      : `${produto.quantidadeEstoque} em estoque`}
                </span>
                <h2 className="cartao-nome">{produto.descricaoProduto}</h2>
                <span className="cartao-preco">{formatarBRL(produto.precoLiquido)}</span>
              </div>

              <button
                type="button"
                className="botao-adicionar"
                disabled={esgotado || limiteAtingido || ocupado || carrinhoFinalizado}
                onClick={() => aoAdicionar(produto.id)}
              >
                {limiteAtingido && !esgotado ? 'Estoque no limite' : 'Adicionar'}
                {noCarrinho > 0 && !limiteAtingido && <span className="botao-contagem">{noCarrinho} no carrinho</span>}
              </button>
            </article>
          );
        })}
      </div>
    </section>
  );
}
