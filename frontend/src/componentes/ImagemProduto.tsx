import { useState } from 'react';
import { IlustracaoProduto } from './Ilustracoes';

interface Props {
  produtoId: number;
  descricao: string;
  className?: string;
}

/**
 * Foto real do produto, servida de `public/produtos/{id}.jpg` (offline,
 * nada vem de CDN externo). Se o arquivo não existir ou falhar, cai na
 * ilustração SVG da categoria — o catálogo nunca fica sem imagem.
 */
export function ImagemProduto({ produtoId, descricao, className }: Props) {
  const [semFoto, setSemFoto] = useState(false);

  if (semFoto) {
    return <IlustracaoProduto descricao={descricao} className={className} />;
  }

  return (
    <img
      src={`/produtos/${produtoId}.jpg`}
      alt={descricao}
      className={className}
      loading="lazy"
      onError={() => setSemFoto(true)}
    />
  );
}
