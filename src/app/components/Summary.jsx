import React from 'react';

export default function Summary({
  totalGastosFixos,
  totalGastosVariaveis,
  limiteGastosVariaveis,
  porcentagemFixos,
  porcentagemVariaveis,
  porcentagemLivre,
}) {
  return (
    <div style={{
      border: '1px solid #ccc',
      padding: 16,
      marginBottom: 24,
      borderRadius: 6,
      backgroundColor: '#fff',
    }}>
      <h2 style={{ fontSize: 20, marginBottom: 16 }}>Resumo</h2>
      <p>Gastos Fixos: {totalGastosFixos.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</p>
      <p>Gastos Variáveis: {totalGastosVariaveis.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</p>
      <p>Limite de Variáveis: {limiteGastosVariaveis.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</p>
      <div style={{ display: 'flex', height: 16, backgroundColor: '#eee', borderRadius: 8, overflow: 'hidden', marginTop: 16 }}>
        <div style={{ width: `${porcentagemFixos}%`, backgroundColor: '#dc3545' }} />
        <div style={{ width: `${porcentagemVariaveis}%`, backgroundColor: '#ffc107' }} />
        <div style={{ width: `${porcentagemLivre}%`, backgroundColor: '#28a745' }} />
      </div>
    </div>
  );
}