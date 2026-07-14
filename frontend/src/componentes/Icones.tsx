import type { SVGProps } from 'react';

/** Ícones de interface — traço 2px, herdam a cor do texto via currentColor. */

function base(props: SVGProps<SVGSVGElement>): SVGProps<SVGSVGElement> {
  return {
    viewBox: '0 0 24 24',
    width: 20,
    height: 20,
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 2,
    strokeLinecap: 'round',
    strokeLinejoin: 'round',
    'aria-hidden': true,
    ...props,
  };
}

export function IconeCarrinho(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...base(props)}>
      <path d="M3 4h2.2l2.3 11.2h10.3l2.2-8H7" />
      <circle cx="9.5" cy="20" r="1.6" />
      <circle cx="17" cy="20" r="1.6" />
    </svg>
  );
}

export function IconeBusca(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...base(props)}>
      <circle cx="11" cy="11" r="6.2" />
      <path d="m15.8 15.8 4.4 4.4" />
    </svg>
  );
}

export function IconeUsuario(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...base(props)}>
      <circle cx="12" cy="8" r="3.6" />
      <path d="M5.2 20c.6-3.6 3.4-5.4 6.8-5.4s6.2 1.8 6.8 5.4" />
    </svg>
  );
}

export function IconeSeta(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...base({ width: 14, height: 14, ...props })}>
      <path d="m6 9 6 6 6-6" />
    </svg>
  );
}

export function IconeLixeira(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...base({ width: 17, height: 17, ...props })}>
      <path d="M4 7h16" />
      <path d="M9.5 7V4.8A.8.8 0 0 1 10.3 4h3.4a.8.8 0 0 1 .8.8V7" />
      <path d="m6.5 7 .9 12.2a1 1 0 0 0 1 .8h7.2a1 1 0 0 0 1-.8L17.5 7" />
    </svg>
  );
}

export function IconeFechar(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...base(props)}>
      <path d="M6 6l12 12M18 6 6 18" />
    </svg>
  );
}

export function IconeCheck(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...base(props)}>
      <path d="m5 12.5 4.5 4.5L19 7.5" />
    </svg>
  );
}

export function IconeAlerta(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...base(props)}>
      <path d="M12 4 2.8 20h18.4L12 4Z" />
      <path d="M12 10.5v4" />
      <path d="M12 17.5v.01" />
    </svg>
  );
}

export function IconeCupom(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...base({ width: 17, height: 17, ...props })}>
      <path d="M4 7.5A1.5 1.5 0 0 1 5.5 6h13A1.5 1.5 0 0 1 20 7.5v2a2.5 2.5 0 0 0 0 5v2a1.5 1.5 0 0 1-1.5 1.5h-13A1.5 1.5 0 0 1 4 16.5v-2a2.5 2.5 0 0 0 0-5v-2Z" />
      <path d="M9.5 9.5h.01" />
      <path d="M14.5 14.5h.01" />
      <path d="m9.5 14.5 5-5" />
    </svg>
  );
}

export function IconeTelefone(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...base({ width: 15, height: 15, ...props })}>
      <path d="M5 4h4l1.5 4.5-2.2 1.6a12 12 0 0 0 5.6 5.6l1.6-2.2L20 15v4a1.5 1.5 0 0 1-1.6 1.5C10 20 4 14 3.5 5.6A1.5 1.5 0 0 1 5 4Z" />
    </svg>
  );
}

export function IconeLocal(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...base({ width: 15, height: 15, ...props })}>
      <path d="M12 21s7-5.8 7-11a7 7 0 1 0-14 0c0 5.2 7 11 7 11Z" />
      <circle cx="12" cy="10" r="2.6" />
    </svg>
  );
}

/** Logomarca: carrinho com "brotos" saindo, como no template de referência. */
export function LogoShopcart(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 32 32" width="30" height="30" fill="none" aria-hidden {...props}>
      <path
        d="M4 6h3l3 15h13l2.5-10H9"
        stroke="#003D29"
        strokeWidth="2.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="12.5" cy="26.5" r="2.1" fill="#003D29" />
      <circle cx="21.5" cy="26.5" r="2.1" fill="#003D29" />
      <path d="M15.5 8V3.4" stroke="#3BB77E" strokeWidth="2.2" strokeLinecap="round" />
      <path d="M15.5 4.5c2.4-.3 3.6.8 3.8 2.6-2.2.4-3.5-.6-3.8-2.6Z" fill="#3BB77E" />
      <path d="M15.5 4.5c-2-.9-3.5-.2-4.2 1.2 1.8 1 3.4.5 4.2-1.2Z" fill="#8FD8B4" />
    </svg>
  );
}
