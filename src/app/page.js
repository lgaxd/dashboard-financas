"use client";

import React, { useState } from 'react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import './globals.css';

import InputsPanel from './components/InputsPanel';
import Summary from './components/Summary';
import Timeline from './components/Timeline';
import GastoModal from './components/GastoModal';

export default function Dashboard() {
  const [anoSelecionado, setAnoSelecionado] = useState(2025);
  const [mesSelecionado, setMesSelecionado] = useState(new Date().getMonth() + 1);
  const [rendaMensal, setRendaMensal] = useState({});
  const [reservaMensal, setReservaMensal] = useState({});
  const [gastosFixos, setGastosFixos] = useState({});
  const [gastosVariaveis, setGastosVariaveis] = useState([]);
  const [modalAberto, setModalAberto] = useState(false);
  const [tipoGasto, setTipoGasto] = useState('variavel');
  const [gastoEditando, setGastoEditando] = useState(null);
  const [descricao, setDescricao] = useState('');
  const [valor, setValor] = useState('');
  const [data, setData] = useState(format(new Date(), 'yyyy-MM-dd'));

  const chaveSelecionada = `${anoSelecionado}-${mesSelecionado}`;
  const rendaAtual = rendaMensal[chaveSelecionada] || 0;
  const reservaAtual = reservaMensal[chaveSelecionada] || 0;
  const gastosFixosAtual = gastosFixos[chaveSelecionada] || [];

  const abrirModal = (tipo, gasto = null) => {
    setTipoGasto(tipo);
    if (gasto) {
      setGastoEditando(gasto);
      setDescricao(gasto.descricao);
      setValor(gasto.valor);
      setData(gasto.data || format(new Date(), 'yyyy-MM-dd'));
    } else {
      setGastoEditando(null);
      setDescricao('');
      setValor('');
      setData(format(new Date(), 'yyyy-MM-dd'));
    }
    setModalAberto(true);
  };

  const salvarGasto = () => {
    const novoGasto = {
      id: gastoEditando ? gastoEditando.id : Date.now(),
      descricao,
      valor: parseFloat(valor),
      data: tipoGasto === 'variavel' ? data : null,
    };

    if (tipoGasto === 'variavel') {
      if (gastoEditando) {
        setGastosVariaveis(gastosVariaveis.map(g => g.id === gastoEditando.id ? novoGasto : g));
      } else {
        setGastosVariaveis([...gastosVariaveis, novoGasto]);
      }
    } else {
      if (gastoEditando) {
        const novosGastosFixos = {...gastosFixos};
        novosGastosFixos[chaveSelecionada] = (gastosFixos[chaveSelecionada] || []).map(g => 
          g.id === gastoEditando.id ? novoGasto : g
        );
        setGastosFixos(novosGastosFixos);
      } else {
        const novosGastosFixos = {...gastosFixos};
        novosGastosFixos[chaveSelecionada] = [...(gastosFixos[chaveSelecionada] || []), novoGasto];
        setGastosFixos(novosGastosFixos);
      }
    }
    setModalAberto(false);
  };

  const gastosVariaveisMes = gastosVariaveis.filter(g => {
    if (!g.data) return false;
    const dataGasto = new Date(g.data);
    return dataGasto.getFullYear() === anoSelecionado && 
           dataGasto.getMonth() + 1 === mesSelecionado;
  });

  const totalGastosFixos = gastosFixosAtual.reduce((acc, g) => acc + g.valor, 0);
  const totalGastosVariaveis = gastosVariaveisMes.reduce((acc, g) => acc + g.valor, 0);
  const limiteGastosVariaveis = rendaAtual - reservaAtual - totalGastosFixos;
  const valorLivre = rendaAtual - reservaAtual - totalGastosFixos - totalGastosVariaveis;

  const porcentagemFixos = rendaAtual ? (totalGastosFixos / rendaAtual) * 100 : 0;
  const porcentagemVariaveis = rendaAtual ? (totalGastosVariaveis / rendaAtual) * 100 : 0;
  const porcentagemLivre = rendaAtual ? (valorLivre / rendaAtual) * 100 : 0;

  return (
    <div style={{ padding: '16px', maxWidth: 800, margin: 'auto' }}>
      <InputsPanel
        rendaMensal={rendaAtual}
        setRendaMensal={(value) => {
          const novasRendas = {...rendaMensal};
          novasRendas[chaveSelecionada] = value;
          setRendaMensal(novasRendas);
        }}
        reservaMensal={reservaAtual}
        setReservaMensal={(value) => {
          const novasReservas = {...reservaMensal};
          novasReservas[chaveSelecionada] = value;
          setReservaMensal(novasReservas);
        }}
        abrirModal={abrirModal}
        mesSelecionado={mesSelecionado}
        setMesSelecionado={setMesSelecionado}
        anoSelecionado={anoSelecionado}
        setAnoSelecionado={setAnoSelecionado}
      />
      <Summary
        totalGastosFixos={totalGastosFixos}
        totalGastosVariaveis={totalGastosVariaveis}
        limiteGastosVariaveis={limiteGastosVariaveis}
        porcentagemFixos={porcentagemFixos}
        porcentagemVariaveis={porcentagemVariaveis}
        porcentagemLivre={porcentagemLivre}
      />
      <Timeline
        gastosFixos={gastosFixosAtual}
        gastosVariaveisMes={gastosVariaveisMes}
        mesSelecionado={mesSelecionado}
        anoSelecionado={anoSelecionado}
        abrirModal={abrirModal}
        totalGastosFixos={totalGastosFixos}
      />
      <GastoModal
        aberto={modalAberto}
        onClose={setModalAberto}
        tipoGasto={tipoGasto}
        gastoEditando={gastoEditando}
        descricao={descricao}
        setDescricao={setDescricao}
        valor={valor}
        setValor={setValor}
        data={data}
        setData={setData}
        salvarGasto={salvarGasto}
      />
    </div>
  );
}