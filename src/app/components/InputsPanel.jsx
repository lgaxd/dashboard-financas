import React from 'react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export default function InputsPanel({
  rendaMensal,
  setRendaMensal,
  reservaMensal,
  setReservaMensal,
  abrirModal,
  mesSelecionado,
  setMesSelecionado,
  anoSelecionado,
  setAnoSelecionado,
}) {
  return (
    <div style={{
      border: '1px solid #ccc',
      padding: 16,
      marginBottom: 24,
      borderRadius: 6,
      backgroundColor: '#fff',
    }}>
      <div style={{ marginBottom: 12 }}>
        <label style={{ display: 'block', fontWeight: 'bold', marginBottom: 4 }}>Ano</label>
        <select
          value={anoSelecionado}
          onChange={e => setAnoSelecionado(parseInt(e.target.value))}
          style={{ width: '100%', padding: 8, fontSize: 16 }}
        >
          <option value={2025}>2025</option>
          <option value={2026}>2026</option>
          <option value={2027}>2027</option>
        </select>
      </div>

      <div style={{ marginBottom: 12 }}>
        <label style={{ display: 'block', fontWeight: 'bold', marginBottom: 4 }}>Renda Mensal</label>
        <input
          type="number"
          value={rendaMensal}
          onChange={e => setRendaMensal(parseFloat(e.target.value) || 0)}
          style={{ width: '100%', padding: 8, fontSize: 16, boxSizing: 'border-box' }}
        />
      </div>
      <div style={{ marginBottom: 12 }}>
        <label style={{ display: 'block', fontWeight: 'bold', marginBottom: 4 }}>Reserva Mensal</label>
        <input
          type="number"
          value={reservaMensal}
          onChange={e => setReservaMensal(parseFloat(e.target.value) || 0)}
          style={{ width: '100%', padding: 8, fontSize: 16, boxSizing: 'border-box' }}
        />
      </div>
      <div style={{ marginBottom: 12 }}>
        <button onClick={() => abrirModal('fixo')} style={buttonStyle}>Adicionar Gasto Fixo</button>
        <button onClick={() => abrirModal('variavel')} style={{ ...buttonStyle, marginLeft: 8 }}>Adicionar Gasto Variável</button>
      </div>
      <div>
        <label style={{ display: 'block', fontWeight: 'bold', marginBottom: 4 }}>Mês</label>
        <select
          value={mesSelecionado}
          onChange={e => setMesSelecionado(parseInt(e.target.value))}
          style={{ width: '100%', padding: 8, fontSize: 16 }}
        >
          {Array.from({ length: 12 }).map((_, i) => (
            <option key={i} value={i + 1}>
              {format(new Date(2025, i, 1), 'MMMM', { locale: ptBR })}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}

const buttonStyle = {
  padding: '8px 16px',
  fontSize: 16,
  borderRadius: 4,
  border: 'none',
  cursor: 'pointer',
  backgroundColor: '#007bff',
  color: 'white',
};