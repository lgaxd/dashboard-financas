import React from 'react';

export default function GastoModal({
  aberto,
  onClose,
  tipoGasto,
  gastoEditando,
  descricao,
  setDescricao,
  valor,
  setValor,
  data,
  setData,
  salvarGasto,
}) {
  if (!aberto) return null;

  return (
    <div style={overlayStyle} onClick={() => onClose(false)}>
      <div style={modalStyle} onClick={e => e.stopPropagation()}>
        <h2>{gastoEditando ? 'Editar' : 'Adicionar'} Gasto {tipoGasto === 'variavel' ? 'Variável' : 'Fixo'}</h2>

        <div style={{ marginBottom: 12 }}>
          <label style={{ display: 'block', fontWeight: 'bold', marginBottom: 4 }}>Descrição</label>
          <input
            value={descricao}
            onChange={e => setDescricao(e.target.value)}
            style={{ width: '100%', padding: 8, fontSize: 16, boxSizing: 'border-box' }}
          />
        </div>

        <div style={{ marginBottom: 12 }}>
          <label style={{ display: 'block', fontWeight: 'bold', marginBottom: 4 }}>Valor</label>
          <input
            type="number"
            value={valor}
            onChange={e => setValor(e.target.value)}
            style={{ width: '100%', padding: 8, fontSize: 16, boxSizing: 'border-box' }}
          />
        </div>

        {tipoGasto === 'variavel' && (
          <div style={{ marginBottom: 12 }}>
            <label style={{ display: 'block', fontWeight: 'bold', marginBottom: 4 }}>Data</label>
            <input
              type="date"
              value={data}
              onChange={e => setData(e.target.value)}
              style={{ width: '100%', padding: 8, fontSize: 16, boxSizing: 'border-box' }}
            />
          </div>
        )}

        <div style={{ textAlign: 'right' }}>
          <button onClick={salvarGasto} style={buttonStyle}>Salvar</button>
          <button onClick={() => onClose(false)} style={{ ...buttonStyle, marginLeft: 8, backgroundColor: '#ccc', color: '#000' }}>Cancelar</button>
        </div>
      </div>
    </div>
  );
}

const overlayStyle = {
  position: 'fixed',
  top: 0, left: 0, right: 0, bottom: 0,
  backgroundColor: 'rgba(0,0,0,0.5)',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  zIndex: 9999,
};

const modalStyle = {
  backgroundColor: 'white',
  padding: 24,
  borderRadius: 6,
  width: '90%',
  maxWidth: 400,
  boxSizing: 'border-box',
};

const buttonStyle = {
  padding: '8px 16px',
  fontSize: 16,
  borderRadius: 4,
  border: 'none',
  cursor: 'pointer',
  backgroundColor: '#007bff',
  color: 'white',
};