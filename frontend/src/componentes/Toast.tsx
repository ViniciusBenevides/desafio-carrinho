import { useEffect } from 'react';
import { IconeAlerta, IconeCheck } from './Icones';

export interface MensagemToast {
  tipo: 'erro' | 'sucesso';
  mensagem: string;
}

interface Props {
  mensagem: MensagemToast;
  aoFechar: () => void;
}

export function Toast({ mensagem, aoFechar }: Props) {
  useEffect(() => {
    const temporizador = setTimeout(aoFechar, 4200);
    return () => clearTimeout(temporizador);
  }, [mensagem, aoFechar]);

  return (
    <div className={`toast toast-${mensagem.tipo}`} role="alert" onClick={aoFechar}>
      <span className="toast-icone">{mensagem.tipo === 'erro' ? <IconeAlerta /> : <IconeCheck />}</span>
      {mensagem.mensagem}
    </div>
  );
}
