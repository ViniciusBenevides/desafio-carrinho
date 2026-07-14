import type { ReactElement } from 'react';

/**
 * Ilustrações autorais dos produtos do catálogo — traço verde-floresta com
 * preenchimentos suaves (menta/bege/pêssego), no estilo flat do design system.
 * O catálogo não tem fotos, então cada produto ganha um desenho por categoria.
 */

const TRACO = '#003D29';
const MENTA = '#D2F7EC';
const BEGE = '#F2E4D9';
const PESSEGO = '#FFE6CC';

interface PropsIlustracao {
  /** Descrição do produto — decide qual desenho usar. */
  descricao: string;
  className?: string;
}

function Quadro({ children, className }: { children: ReactElement | ReactElement[]; className?: string }) {
  return (
    <svg
      viewBox="0 0 96 96"
      className={className}
      fill="none"
      stroke={TRACO}
      strokeWidth="3"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      {children}
    </svg>
  );
}

function Notebook({ className }: { className?: string }) {
  return (
    <Quadro className={className}>
      <rect x="24" y="20" width="48" height="34" rx="4" fill={MENTA} />
      <path d="M31 27h20" strokeWidth="2.4" opacity="0.55" />
      <path d="M14 66c0-2.2 1.8-4 4-4h60c2.2 0 4 1.8 4 4v1c0 2.2-1.8 4-4 4H18c-2.2 0-4-1.8-4-4v-1Z" fill="#fff" />
      <path d="M41 66h14" strokeWidth="2.4" />
    </Quadro>
  );
}

function Mouse({ className }: { className?: string }) {
  return (
    <Quadro className={className}>
      <path d="M36 28c3-4.5 7-7 12-7s9 2.5 12 7" strokeWidth="2.4" opacity="0.5" />
      <path d="M40 34c2-3 4.6-4.5 8-4.5s6 1.5 8 4.5" strokeWidth="2.4" opacity="0.75" />
      <rect x="34" y="36" width="28" height="42" rx="14" fill={BEGE} />
      <path d="M34 52h28" strokeWidth="2.4" />
      <path d="M48 42v6" strokeWidth="3.4" />
    </Quadro>
  );
}

function Teclado({ className }: { className?: string }) {
  return (
    <Quadro className={className}>
      <rect x="10" y="32" width="76" height="34" rx="7" fill={MENTA} />
      <g strokeWidth="2.6">
        <path d="M20 42h.1M31 42h.1M42 42h.1M53 42h.1M64 42h.1M75 42h.1" />
        <path d="M20 51h.1M31 51h.1M42 51h.1M53 51h.1M64 51h.1M75 51h.1" />
        <path d="M32 59h32" />
      </g>
    </Quadro>
  );
}

function Monitor({ className }: { className?: string }) {
  return (
    <Quadro className={className}>
      <rect x="14" y="18" width="68" height="42" rx="5" fill={BEGE} />
      <path d="M24 30c6-5 14-6 21-3" strokeWidth="2.4" opacity="0.5" />
      <path d="M48 60v10" strokeWidth="4" />
      <path d="M32 74h32" strokeWidth="3.4" />
    </Quadro>
  );
}

function Headset({ className }: { className?: string }) {
  return (
    <Quadro className={className}>
      <path d="M24 52c0-16 10-26 24-26s24 10 24 26" strokeWidth="4" />
      <rect x="17" y="46" width="14" height="24" rx="7" fill={MENTA} />
      <rect x="65" y="46" width="14" height="24" rx="7" fill={MENTA} />
      <path d="M24 66c0 8 8 12 17 12" strokeWidth="2.6" />
      <circle cx="45" cy="78" r="2.4" fill={TRACO} stroke="none" />
    </Quadro>
  );
}

function Webcam({ className }: { className?: string }) {
  return (
    <Quadro className={className}>
      <rect x="26" y="16" width="44" height="38" rx="11" fill={PESSEGO} />
      <circle cx="48" cy="35" r="10" fill="#fff" />
      <circle cx="48" cy="35" r="3.6" fill={TRACO} stroke="none" />
      <circle cx="62" cy="24" r="1.6" fill={TRACO} stroke="none" />
      <path d="M41 54l-5 16M55 54l5 16" strokeWidth="2.6" />
      <path d="M30 72h36" strokeWidth="3.4" />
    </Quadro>
  );
}

function Ssd({ className }: { className?: string }) {
  return (
    <Quadro className={className}>
      <rect x="18" y="26" width="60" height="44" rx="9" fill={MENTA} />
      <rect x="27" y="35" width="30" height="14" rx="3.5" fill="#fff" strokeWidth="2.4" />
      <path d="M28 60h18" strokeWidth="2.4" />
      <circle cx="68" cy="61" r="2" fill={TRACO} stroke="none" />
      <circle cx="68" cy="36" r="2" fill={TRACO} stroke="none" />
    </Quadro>
  );
}

function Cadeira({ className }: { className?: string }) {
  return (
    <Quadro className={className}>
      <rect x="31" y="10" width="34" height="38" rx="11" fill={BEGE} />
      <path d="M38 20c4-3 12-3 18 0" strokeWidth="2.4" opacity="0.5" />
      <rect x="27" y="52" width="42" height="11" rx="5.5" fill={BEGE} />
      <path d="M23 44v12M73 44v12" strokeWidth="3.2" />
      <path d="M48 63v9" strokeWidth="4" />
      <path d="M32 78c4-4 9-6 16-6s12 2 16 6" strokeWidth="3" />
      <circle cx="32" cy="81" r="2.6" fill={TRACO} stroke="none" />
      <circle cx="64" cy="81" r="2.6" fill={TRACO} stroke="none" />
    </Quadro>
  );
}

function Carregador({ className }: { className?: string }) {
  return (
    <Quadro className={className}>
      <path d="M38 26v-9M58 26v-9" strokeWidth="4" />
      <rect x="27" y="26" width="42" height="44" rx="11" fill={PESSEGO} />
      <path d="M50 34 40 50h7l-2 12 11-16h-7l1-12Z" fill={TRACO} stroke="none" />
    </Quadro>
  );
}

function Hub({ className }: { className?: string }) {
  return (
    <Quadro className={className}>
      <path d="M16 48c-7 0-7-14 0-14h10" strokeWidth="2.6" />
      <rect x="7" y="29" width="9" height="10" rx="2.5" fill="#fff" strokeWidth="2.4" />
      <rect x="16" y="39" width="64" height="20" rx="10" fill={MENTA} />
      <g strokeWidth="2.4">
        <rect x="26" y="45" width="9" height="8" rx="1.8" fill="#fff" />
        <rect x="40" y="45" width="9" height="8" rx="1.8" fill="#fff" />
        <rect x="54" y="45" width="9" height="8" rx="1.8" fill="#fff" />
        <rect x="68" y="45" width="9" height="8" rx="1.8" fill="#fff" />
      </g>
    </Quadro>
  );
}

function Pacote({ className }: { className?: string }) {
  return (
    <Quadro className={className}>
      <rect x="22" y="30" width="52" height="42" rx="7" fill={BEGE} />
      <path d="M22 44h52M48 30v14" strokeWidth="2.6" />
    </Quadro>
  );
}

const DESENHOS: Array<[RegExp, (p: { className?: string }) => ReactElement]> = [
  [/notebook/i, Notebook],
  [/mouse/i, Mouse],
  [/teclado/i, Teclado],
  [/monitor/i, Monitor],
  [/headset/i, Headset],
  [/webcam/i, Webcam],
  [/ssd/i, Ssd],
  [/cadeira/i, Cadeira],
  [/carregador/i, Carregador],
  [/hub/i, Hub],
];

export function IlustracaoProduto({ descricao, className }: PropsIlustracao) {
  const Desenho = DESENHOS.find(([padrao]) => padrao.test(descricao))?.[1] ?? Pacote;
  return <Desenho className={className} />;
}

/** Destaque do hero — headset em escala maior. */
export function IlustracaoHero({ className }: { className?: string }) {
  return <Headset className={className} />;
}
