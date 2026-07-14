interface Props {
  totalDeItens: number;
  aoAbrirCarrinho: () => void;
}

export function Cabecalho({ totalDeItens, aoAbrirCarrinho }: Props) {
  return (
    <header className="cabecalho">
      <div className="cabecalho-conteudo">
        <div className="marca-grupo">
          <span className="marca">VOLTZ</span>
          <span className="marca-tag">tech store</span>
        </div>

        <button type="button" className="botao-carrinho-mobile" onClick={aoAbrirCarrinho}>
          Carrinho
          {totalDeItens > 0 && (
            <span className="badge-contagem" key={totalDeItens}>
              {totalDeItens}
            </span>
          )}
        </button>
      </div>
    </header>
  );
}
