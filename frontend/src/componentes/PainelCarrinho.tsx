import { useState, type FormEvent } from 'react';
import { formatarBRL } from '../api';
import type { Carrinho } from '../tipos';
import { IconeCheck, IconeCupom, IconeFechar, IconeLixeira } from './Icones';
import { IlustracaoProduto } from './Ilustracoes';

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
  const totalDeItens = carrinho.itens.reduce((soma, item) => soma + item.quantidade, 0);

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
      <div className={`pano-de-fundo${aberto ? ' visivel' : ''}`} onClick={aoFechar} aria-hidden="true" />

      <aside className={`painel-carrinho${aberto ? ' painel-aberto' : ''}`} aria-label="Carrinho de compras" aria-hidden={!aberto}>
        <div className="painel-topo">
          <h2>
            {finalizado ? 'Pedido confirmado' : 'Seu carrinho'}
            {!finalizado && totalDeItens > 0 && <span className="painel-contagem">{totalDeItens}</span>}
          </h2>
          <button type="button" className="botao-fechar" onClick={aoFechar} aria-label="Fechar carrinho">
            <IconeFechar />
          </button>
        </div>

        {finalizado && (
          <div className="confirmacao">
            <span className="confirmacao-icone">
              <IconeCheck />
            </span>
            <div>
              <strong>Compra finalizada!</strong>
              <p>
                O pedido <strong>#{carrinho.id}</strong> foi fechado e não pode mais ser alterado.
              </p>
            </div>
          </div>
        )}

        {vazio && !finalizado ? (
          <div className="carrinho-vazio">
            <p>
              <strong>Seu carrinho está vazio.</strong>
            </p>
            <p>Adicione produtos do catálogo para começar.</p>
          </div>
        ) : (
          <ul className="lista-itens">
            {carrinho.itens.map((item) => (
              <li className="item-carrinho" key={item.produto.id}>
                <div className="item-miniatura">
                  <IlustracaoProduto descricao={item.produto.descricaoProduto} className="item-ilustracao" />
                </div>

                <div className="item-detalhes">
                  <div className="item-cabeca">
                    <span className="item-nome">{item.produto.descricaoProduto}</span>
                    {!finalizado && (
                      <button
                        type="button"
                        className="botao-remover-item"
                        disabled={ocupado}
                        onClick={() => aoRemoverItem(item.produto.id)}
                        aria-label={`Remover ${item.produto.descricaoProduto}`}
                      >
                        <IconeLixeira />
                      </button>
                    )}
                  </div>
                  <span className="item-unitario">{formatarBRL(item.produto.precoLiquido)} cada</span>

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
                  <IconeCupom />
                  {carrinho.cupom.codigoCupom} · −{carrinho.cupom.percentualDesconto}%
                </span>
                <button type="button" className="botao-texto" disabled={ocupado} onClick={aoRemoverCupom}>
                  remover
                </button>
              </div>
            ) : (
              <>
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
                <p className="cupom-dica">
                  Disponíveis:
                  <button type="button" className="cupom-sugestao" disabled={ocupado} onClick={() => aoAplicarCupom('10OFF')}>
                    10OFF
                  </button>
                  <button type="button" className="cupom-sugestao" disabled={ocupado} onClick={() => aoAplicarCupom('15OFF')}>
                    15OFF
                  </button>
                </p>
              </>
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
