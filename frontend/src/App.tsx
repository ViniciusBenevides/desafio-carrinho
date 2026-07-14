import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { api, ApiError } from './api';
import { Cabecalho } from './componentes/Cabecalho';
import { CatalogoProdutos } from './componentes/CatalogoProdutos';
import { LogoShopcart } from './componentes/Icones';
import { PainelCarrinho } from './componentes/PainelCarrinho';
import { Toast, type MensagemToast } from './componentes/Toast';
import type { Carrinho, Produto } from './tipos';

const CHAVE_CARRINHO = 'carrinhoId';

export default function App() {
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [carrinho, setCarrinho] = useState<Carrinho | null>(null);
  const [toast, setToast] = useState<MensagemToast | null>(null);
  const [ocupado, setOcupado] = useState(false);
  const [drawerAberto, setDrawerAberto] = useState(false);
  const [busca, setBusca] = useState('');
  const [carregando, setCarregando] = useState(true);
  const [falhaDeConexao, setFalhaDeConexao] = useState(false);
  const inicializado = useRef(false);

  const notificarErro = useCallback((erro: unknown) => {
    const mensagem = erro instanceof ApiError ? erro.message : 'Algo deu errado. Tente novamente.';
    setToast({ tipo: 'erro', mensagem });
  }, []);

  const iniciarNovoCarrinho = useCallback(async () => {
    const novo = await api.criarCarrinho();
    localStorage.setItem(CHAVE_CARRINHO, String(novo.id));
    setCarrinho(novo);
    return novo;
  }, []);

  const restaurarOuCriarCarrinho = useCallback(async (): Promise<Carrinho> => {
    const idSalvo = localStorage.getItem(CHAVE_CARRINHO);
    if (idSalvo) {
      try {
        const existente = await api.obterCarrinho(Number(idSalvo));
        // um carrinho finalizado em visita anterior não pode ser reutilizado
        if (existente.status === 'ABERTO') return existente;
      } catch {
        /* carrinho não existe mais: cria um novo abaixo */
      }
    }
    const novo = await api.criarCarrinho();
    localStorage.setItem(CHAVE_CARRINHO, String(novo.id));
    return novo;
  }, []);

  useEffect(() => {
    // evita corrida na dupla invocação do StrictMode (criaria dois carrinhos)
    if (inicializado.current) return;
    inicializado.current = true;

    async function carregar() {
      try {
        const [catalogo, carrinhoInicial] = await Promise.all([api.listarProdutos(), restaurarOuCriarCarrinho()]);
        setProdutos(catalogo);
        setCarrinho(carrinhoInicial);
      } catch (erro) {
        setFalhaDeConexao(true);
        notificarErro(erro);
      } finally {
        setCarregando(false);
      }
    }
    void carregar();
  }, [restaurarOuCriarCarrinho, notificarErro]);

  /** Executa uma operação que devolve o carrinho recalculado pela API. */
  const executar = useCallback(
    async (operacao: () => Promise<Carrinho>, mensagemSucesso?: string) => {
      setOcupado(true);
      try {
        setCarrinho(await operacao());
        if (mensagemSucesso) setToast({ tipo: 'sucesso', mensagem: mensagemSucesso });
      } catch (erro) {
        notificarErro(erro);
      } finally {
        setOcupado(false);
      }
    },
    [notificarErro],
  );

  const aplicarCupom = useCallback(
    (codigo: string, abrirDrawer = false) => {
      if (!carrinho) return;
      void executar(() => api.aplicarCupom(carrinho.id, codigo), `Cupom ${codigo.toUpperCase()} aplicado.`).then(() => {
        if (abrirDrawer) setDrawerAberto(true);
      });
    },
    [carrinho, executar],
  );

  const quantidadePorProduto = useMemo(() => {
    const mapa = new Map<number, number>();
    carrinho?.itens.forEach((item) => mapa.set(item.produto.id, item.quantidade));
    return mapa;
  }, [carrinho]);

  const totalDeItens = useMemo(
    () => carrinho?.itens.reduce((soma, item) => soma + item.quantidade, 0) ?? 0,
    [carrinho],
  );

  if (carregando) {
    return (
      <div className="tela-carregando">
        <span className="marca marca-grande">
          <LogoShopcart />
          Shopcart
        </span>
        <p>carregando catálogo…</p>
      </div>
    );
  }

  if (falhaDeConexao && produtos.length === 0) {
    return (
      <div className="tela-carregando">
        <span className="marca marca-grande">
          <LogoShopcart />
          Shopcart
        </span>
        <p>Não foi possível conectar à API.</p>
        <p className="dica">Suba o back-end (porta 3001) e recarregue a página.</p>
        {toast && <Toast mensagem={toast} aoFechar={() => setToast(null)} />}
      </div>
    );
  }

  return (
    <div className="app">
      <Cabecalho
        totalDeItens={totalDeItens}
        busca={busca}
        aoBuscar={setBusca}
        aoAbrirCarrinho={() => setDrawerAberto(true)}
      />

      <main className="conteudo">
        <CatalogoProdutos
          produtos={produtos}
          busca={busca}
          quantidadePorProduto={quantidadePorProduto}
          carrinhoFinalizado={carrinho?.status === 'FINALIZADO'}
          ocupado={ocupado}
          aoAdicionar={(produtoId) =>
            carrinho && executar(() => api.adicionarItem(carrinho.id, produtoId), 'Produto adicionado ao carrinho.')
          }
          aoAplicarCupom={(codigo) => aplicarCupom(codigo, true)}
        />
      </main>

      {carrinho && (
        <PainelCarrinho
          carrinho={carrinho}
          ocupado={ocupado}
          aberto={drawerAberto}
          aoFechar={() => setDrawerAberto(false)}
          aoAlterarQuantidade={(produtoId, quantidade) =>
            executar(() => api.alterarQuantidade(carrinho.id, produtoId, quantidade))
          }
          aoRemoverItem={(produtoId) => executar(() => api.removerItem(carrinho.id, produtoId))}
          aoAplicarCupom={(codigo) => aplicarCupom(codigo)}
          aoRemoverCupom={() => executar(() => api.removerCupom(carrinho.id))}
          aoFinalizar={() => executar(() => api.finalizarCarrinho(carrinho.id), 'Compra finalizada com sucesso!')}
          aoIniciarNovoCarrinho={() =>
            executar(async () => {
              const novo = await iniciarNovoCarrinho();
              setDrawerAberto(false);
              return novo;
            })
          }
        />
      )}

      <footer className="rodape">
        <div className="rodape-conteudo">
          <div className="rodape-marca">
            <span className="marca marca-clara">
              <LogoShopcart className="logo-claro" />
              Shopcart
            </span>
            <p>Periféricos e equipamentos para o seu setup, com envio para todo o Brasil.</p>
          </div>
          <div className="rodape-colunas">
            <div>
              <h3>Loja</h3>
              <span>Catálogo</span>
              <span>Ofertas</span>
              <span>Cupons</span>
            </div>
            <div>
              <h3>Ajuda</h3>
              <span>Entregas</span>
              <span>Trocas e devoluções</span>
              <span>Fale conosco</span>
            </div>
          </div>
        </div>
        <div className="rodape-base">
          <span>Shopcart — teste técnico de carrinho de compras · API própria em Node.js + PostgreSQL</span>
        </div>
      </footer>

      {toast && <Toast mensagem={toast} aoFechar={() => setToast(null)} />}
    </div>
  );
}
