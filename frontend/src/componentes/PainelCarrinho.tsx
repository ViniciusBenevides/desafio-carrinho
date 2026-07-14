import { useState, type FormEvent } from 'react';
import { formatarBRL } from '../api';
import type { Carrinho } from '../tipos';

interface Props {
  carrinho: Carrinho;
  ocupado: boolean;
  aberto: boolean;
  aoFechar: () => void;
  aoAlterarQuantidade: (produtoId: number, quantidade: number) => void;
  aoRemoverItem: (produtoId: number) => void;
  aoAplicarCupom: (codigo: string) => void;
  aoRemoverCupom: () => void;
  aoFinalizar: () => void;
  aoIniciarNovoCarrinho: () => void;
}

export function PainelCarrinho({
  carrinho,
  ocupado,
  aberto,
  aoFechar,
  aoAlterarQuantidade,
  aoRemoverItem,
  aoAplicarCupom,
  aoRemoverCupom,
  aoFinalizar,
  aoIniciarNovoCarrinho,
}: Props) {
  const [codigoCupom, setCodigoCupom] = useState('');
  const finalizado = carrinho.status === 'FINALIZADO';
  const vazio = carrinho.itens.length === 0;

  function enviarCupom(evento: FormEvent) {
    evento.preventDefault();
    const codigo = codigoCupom.trim().toUpperCase();
    if (codigo) {
      aoAplicarCupom(codigo);
      setCodigoCupom('');
    }
  }

  return (
    <>
      {aberto && <div className="pano-de-fundo" onClick={aoFechar} aria-hidden="true" />}

      <aside className={`painel-carrinho${aberto ? ' painel-aberto' : ''}`} aria-label="Carrinho de compras">
        <div className="painel-topo">
          <h2>
            {finalizado ? 'Pedido confirmado' : 'Seu carrinho'}
            <span className="painel-id">#{carrinho.id}</span>
          </h2>
          <button type="button" className="botao-fechar" onClick={aoFechar} aria-label="Fechar carrinho">
            ×
          </button>
        </div>

        {finalizado && (
          <div className="confirmacao">
            <span className="confirmacao-icone" aria-hidden="true">
              ✓
            </span>
            <p>
              Compra finalizada! O carrinho <strong>#{carrinho.id}</strong> foi fechado e não pode mais ser alterado.
            </p>
          </div>
        )}

        {vazio && !finalizado ? (
          <p className="carrinho-vazio">
            Seu carrinho está vazio.
            <br />
            Adicione produtos do catálogo ao lado.
          </p>
        ) : (
          <ul className="lista-itens">
            {carrinho.itens.map((item) => (
              <li className="item-carrinho" key={item.produto.id}>
                <div className="item-cabeca">
                  <span className="item-nome">{item.produto.descricaoProduto}</span>
                  {!finalizado && (
                    <button
                      type="button"
                      className="botao-remover"
                      disabled={ocupado}
                      onClick={() => aoRemoverItem(item.produto.id)}
                      aria-label={`Remover ${item.produto.descricaoProduto}`}
                    >
                      remover
                    </button>
                  )}
                </div>

                <div className="item-rodape">
                  {finalizado ? (
                    <span className="item-qtd-fixa">{item.quantidade} un.</span>
                  ) : (
                    <div className="seletor-quantidade" aria-label="Quantidade">
                      <button
                        type="button"
                        disabled={ocupado || item.quantidade <= 1}
                        onClick={() => aoAlterarQuantidade(item.produto.id, item.quantidade - 1)}
                        aria-label="Diminuir quantidade"
                      >
                        −
                      </button>
                      <span className="quantidade">{item.quantidade}</span>
                      <button
                        type="button"
                        disabled={ocupado || item.quantidade >= item.produto.quantidadeEstoque}
                        onClick={() => aoAlterarQuantidade(item.produto.id, item.quantidade + 1)}
                        aria-label="Aumentar quantidade"
                      >
                        +
                      </button>
                    </div>
                  )}
                  <div className="item-precos">
                    <span className="item-unitario">{formatarBRL(item.produto.precoLiquido)} / un.</span>
                    <span className="item-total">{formatarBRL(item.precoItem)}</span>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}

        {!finalizado && !vazio && (
          <div className="area-cupom">
            {carrinho.cupom ? (
              <div className="cupom-aplicado">
                <span className="cupom-chip">
                  {carrinho.cupom.codigoCupom} · −{carrinho.cupom.percentualDesconto}%
                </span>
                <button type="button" className="botao-remover" disabled={ocupado} onClick={aoRemoverCupom}>
                  remover cupom
                </button>
              </div>
            ) : (
              <form className="form-cupom" onSubmit={enviarCupom}>
                <input
                  type="text"
                  placeholder="Cupom de desconto"
                  value={codigoCupom}
                  onChange={(evento) => setCodigoCupom(evento.target.value)}
                  disabled={ocupado}
                  aria-label="Código do cupom"
                />
                <button type="submit" disabled={ocupado || codigoCupom.trim() === ''}>
                  Aplicar
                </button>
              </form>
            )}
            {!carrinho.cupom && (
              <p className="cupom-dica">
                Disponíveis:{' '}
                <button type="button" className="cupom-sugestao" onClick={() => aoAplicarCupom('10OFF')}>
                  10OFF
                </button>{' '}
                <button type="button" className="cupom-sugestao" onClick={() => aoAplicarCupom('15OFF')}>
                  15OFF
                </button>
              </p>
            )}
          </div>
        )}

        {(!vazio || finalizado) && (
          <dl className="totais">
            <div className="linha-total">
              <dt>Subtotal</dt>
              <dd>{formatarBRL(carrinho.subtotal)}</dd>
            </div>
            <div className={`linha-total${carrinho.desconto > 0 ? ' linha-desconto' : ''}`}>
              <dt>Desconto{carrinho.cupom ? ` (${carrinho.cupom.codigoCupom})` : ''}</dt>
              <dd>{carrinho.desconto > 0 ? `− ${formatarBRL(carrinho.desconto)}` : formatarBRL(0)}</dd>
            </div>
            <div className="linha-total linha-final">
              <dt>Total</dt>
              <dd>{formatarBRL(carrinho.total)}</dd>
            </div>
          </dl>
        )}

        {finalizado ? (
          <button type="button" className="botao-finalizar" disabled={ocupado} onClick={aoIniciarNovoCarrinho}>
            Iniciar novo carrinho
          </button>
        ) : (
          <button type="button" className="botao-finalizar" disabled={ocupado || vazio} onClick={aoFinalizar}>
            Finalizar compra
          </button>
        )}
      </aside>
    </>
  );
}
