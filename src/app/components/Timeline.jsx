import React from 'react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export default function Timeline({ gastosFixos, gastosVariaveisMes, mesSelecionado, anoSelecionado, abrirModal, totalGastosFixos }) {
  return (
    <div style={{
      border: '1px solid #ccc',
      padding: 16,
      borderRadius: 6,
      backgroundColor: '#fff',
      marginBottom: 24,
    }}>
      <h2 style={{ fontSize: 20, marginBottom: 16 }}>Timeline do Mês</h2>

      {gastosFixos.length > 0 && (
        <details style={{ marginBottom: 16 }}>
          <summary style={{ cursor: 'pointer', fontWeight: 'bold', marginBottom: 8 }}>
            Gastos Fixos ({format(new Date(anoSelecionado, mesSelecionado - 1, 1), 'MMMM/yyyy', { locale: ptBR })}) - Total:{' '}
            {totalGastosFixos.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
          </summary>
          {gastosFixos.map(g => (
            <div key={g.id} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
              <span>{g.descricao} - {g.valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span>
              <button
                style={buttonOutlineStyle}
                onClick={() => abrirModal('fixo', g)}
              >
                Editar
              </button>
            </div>
          ))}
        </details>
      )}

      {Array.from(new Set(gastosVariaveisMes.map(g => g.data)))
        .sort()
        .map(dia => (
          <details key={dia} style={{ marginBottom: 16 }}>
            <summary style={{ cursor: 'pointer', fontWeight: 'bold', marginBottom: 8 }}>
              {format(new Date(dia), 'dd/MM/yyyy', { locale: ptBR })} - Total:{' '}
              {gastosVariaveisMes
                .filter(g => g.data === dia)
                .reduce((acc, g) => acc + g.valor, 0)
                .toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
            </summary>
            {gastosVariaveisMes
              .filter(g => g.data === dia)
              .map(g => (
                <div key={g.id} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                  <span>{g.descricao} - {g.valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span>
                  <button
                    style={buttonOutlineStyle}
                    onClick={() => abrirModal('variavel', g)}
                  >
                    Editar
                  </button>
                </div>
              ))}
          </details>
        ))}
    </div>
  );
}

const buttonOutlineStyle = {
  padding: '4px 8px',
  fontSize: 14,
  borderRadius: 4,
  border: '1px solid #333',
  backgroundColor: 'white',
  cursor: 'pointer',
};