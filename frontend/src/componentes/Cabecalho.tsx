import { IconeBusca, IconeCarrinho, IconeLocal, IconeSeta, IconeTelefone, IconeUsuario, LogoShopcart } from './Icones';

interface Props {
  totalDeItens: number;
  busca: string;
  aoBuscar: (termo: string) => void;
  aoAbrirCarrinho: () => void;
}

export function Cabecalho({ totalDeItens, busca, aoBuscar, aoAbrirCarrinho }: Props) {
  return (
    <header className="cabecalho">
      <div className="faixa-topo">
        <div className="faixa-conteudo">
          <span className="faixa-item faixa-telefone">
            <IconeTelefone />
            +55 62 3000-0000
          </span>
          <span className="faixa-item faixa-promo">Frete grátis em compras acima de R$ 199 · Use os cupons 10OFF e 15OFF</span>
          <span className="faixa-item faixa-local">
            <IconeLocal />
            Goiânia — GO
          </span>
        </div>
      </div>

      <div className="barra-principal">
        <a className="marca" href="/" aria-label="Shopcart — página inicial">
          <LogoShopcart />
          <span>Shopcart</span>
        </a>

        <nav className="navegacao" aria-label="Seções da loja">
          <span className="nav-item">
            Categorias
            <IconeSeta />
          </span>
          <span className="nav-item">Ofertas</span>
          <span className="nav-item">Novidades</span>
          <span className="nav-item">Entrega</span>
        </nav>

        <div className="campo-busca">
          <IconeBusca className="busca-icone" />
          <input
            type="search"
            placeholder="Buscar produto"
            value={busca}
            onChange={(evento) => aoBuscar(evento.target.value)}
            aria-label="Buscar produto no catálogo"
          />
        </div>

        <div className="acoes-cabecalho">
          <span className="acao-conta">
            <IconeUsuario />
            <span className="acao-rotulo">Conta</span>
          </span>
          <button type="button" className="botao-carrinho" onClick={aoAbrirCarrinho} aria-label="Abrir carrinho">
            <span className="carrinho-icone-area">
              <IconeCarrinho />
              {totalDeItens > 0 && (
                <span className="badge-contagem" key={totalDeItens}>
                  {totalDeItens}
                </span>
              )}
            </span>
            <span className="acao-rotulo">Carrinho</span>
          </button>
        </div>
      </div>
    </header>
  );
}
