"use client";

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import './globals.css';
import pb from './lib/pocketbase.js';

import InputsPanel from './components/InputsPanel';
import Summary from './components/Summary';
import Timeline from './components/Timeline';
import GastoModal from './components/GastoModal';
import Login from './components/Login';

export default function Dashboard() {
  // Estados
  const [usuario, setUsuario] = useState(null);
  const [anoSelecionado, setAnoSelecionado] = useState(new Date().getFullYear());
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
  const [carregando, setCarregando] = useState(false);

  // Chave para o mês/ano atual
  const chaveSelecionada = useMemo(() =>
    `${anoSelecionado}-${String(mesSelecionado).padStart(2, '0')}`,
    [anoSelecionado, mesSelecionado]
  );

  // Verificação de autenticação
  useEffect(() => {
    // Verifica se já existe uma sessão válida
    if (pb.authStore.isValid) {
      setUsuario(pb.authStore.model);
    }

    // Listener para mudanças na autenticação
    const unsubscribe = pb.authStore.onChange((token, model) => {
      setUsuario(model);
    });

    return () => unsubscribe();
  }, []);

  // Carregar gastos quando o usuário ou período mudar
  const carregarGastos = useCallback(async () => {
    if (!usuario?.id) return;

    setCarregando(true);
    try {
      const { items: gastos } = await pb.collection('gastos').getList(1, 500, {
        filter: `usuario = "${usuario.id}" && mes_referencia = "${chaveSelecionada}"`,
        sort: '-data',
        $autoCancel: false
      });

      // Processar gastos fixos e variáveis
      const fixos = gastos.filter(g => g.tipo === 'fixo');
      const variaveis = gastos.filter(g => g.tipo === 'variavel');

      setGastosFixos(prev => ({
        ...prev,
        [chaveSelecionada]: fixos
      }));

      setGastosVariaveis(variaveis);
    } catch (error) {
      console.error("Erro ao carregar gastos:", error);
      if (error.status === 401) {
        pb.authStore.clear();
        setUsuario(null);
      }
    } finally {
      setCarregando(false);
    }
  }, [usuario, chaveSelecionada]);

  // Carregar gastos quando necessário
  useEffect(() => {
    if (usuario?.id) {
      carregarGastos();
    }
  }, [usuario, carregarGastos]);

  // Valores atuais para o período selecionado
  const rendaAtual = useMemo(() =>
    rendaMensal[chaveSelecionada] || 0,
    [rendaMensal, chaveSelecionada]
  );

  const reservaAtual = useMemo(() =>
    reservaMensal[chaveSelecionada] || 0,
    [reservaMensal, chaveSelecionada]
  );

  const gastosFixosAtual = useMemo(() =>
    gastosFixos[chaveSelecionada] || [],
    [gastosFixos, chaveSelecionada]
  );

  // Login
  const fazerLogin = async (email, senha) => {
    try {
      const authData = await pb.collection('users').authWithPassword(email, senha);
      setUsuario(authData.record);
    } catch (error) {
      console.error("Erro no login:", error);
      alert("Credenciais inválidas");
    }
  };

  // Logout
  const fazerLogout = () => {
    pb.authStore.clear();
    setUsuario(null);
  };

  // Abrir modal para adicionar/editar gastos
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

  // Salvar gasto (criação ou edição)
  const salvarGasto = async () => {
    try {
      // Validações iniciais
      if (!usuario?.id) {
        throw new Error("Por favor, faça login antes de salvar gastos");
      }

      // Validação dos campos obrigatórios
      const errors = [];
      if (!descricao.trim()) errors.push("Descrição é obrigatória");
      if (!valor || isNaN(valor)) errors.push("Valor inválido");
      if (tipoGasto === 'variavel' && !data) errors.push("Data é obrigatória para gastos variáveis");

      if (errors.length > 0) {
        throw new Error(errors.join("\n"));
      }

      // Preparação dos dados
      const mesAno = `${anoSelecionado}-${String(mesSelecionado).padStart(2, '0')}`;
      const dataGasto = {
        usuario: usuario.id,
        tipo: tipoGasto,
        descricao: descricao.trim(),
        valor: Number(valor),
        mes_referencia: mesAno,
        ...(tipoGasto === 'variavel' && { data: new Date(data).toISOString() })
      };

      console.log("Dados sendo enviados:", dataGasto); // Para debug

      // Operação de criação/atualização
      if (gastoEditando) {
        await pb.collection('gastos').update(gastoEditando.id, dataGasto);
      } else {
        await pb.collection('gastos').create(dataGasto);
      }

      // Atualização da UI
      await carregarGastos();
      setModalAberto(false);

    } catch (error) {
      console.error("Erro detalhado:", {
        message: error.message,
        status: error.status,
        response: error.response,
        data: error.data
      });

      alert(error.message || "Erro ao salvar. Verifique o console para detalhes.");
    }
  };

  // Deletar gasto
  const deletarGasto = async () => {
    if (!gastoEditando) return;

    try {
      await pb.collection('gastos').delete(gastoEditando.id);
      await carregarGastos();
      setModalAberto(false);
      setGastoEditando(null);
    } catch (error) {
      console.error("Erro ao deletar gasto:", error);
      alert("Erro ao deletar gasto. Verifique o console para detalhes.");
    }
  };

  // Filtrar gastos variáveis pelo mês atual
  const gastosVariaveisMes = useMemo(() => {
    return gastosVariaveis.filter(g => {
      if (!g.data) return false;
      const dataGasto = new Date(g.data);
      return dataGasto.getFullYear() === anoSelecionado &&
        dataGasto.getMonth() + 1 === mesSelecionado;
    });
  }, [gastosVariaveis, anoSelecionado, mesSelecionado]);

  // Cálculos financeiros
  const totalGastosFixos = useMemo(() =>
    gastosFixosAtual.reduce((acc, g) => acc + g.valor, 0),
    [gastosFixosAtual]
  );

  const totalGastosVariaveis = useMemo(() =>
    gastosVariaveisMes.reduce((acc, g) => acc + g.valor, 0),
    [gastosVariaveisMes]
  );

  const limiteGastosVariaveis = useMemo(() =>
    rendaAtual - reservaAtual - totalGastosFixos,
    [rendaAtual, reservaAtual, totalGastosFixos]
  );

  const valorLivre = useMemo(() =>
    rendaAtual - reservaAtual - totalGastosFixos - totalGastosVariaveis,
    [rendaAtual, reservaAtual, totalGastosFixos, totalGastosVariaveis]
  );

  const porcentagemFixos = useMemo(() =>
    rendaAtual ? (totalGastosFixos / rendaAtual) * 100 : 0,
    [rendaAtual, totalGastosFixos]
  );

  const porcentagemVariaveis = useMemo(() =>
    rendaAtual ? (totalGastosVariaveis / rendaAtual) * 100 : 0,
    [rendaAtual, totalGastosVariaveis]
  );

  const porcentagemLivre = useMemo(() =>
    rendaAtual ? (valorLivre / rendaAtual) * 100 : 0,
    [rendaAtual, valorLivre]
  );

  // Renderização condicional
  if (!usuario) {
    return <Login onLoginSuccess={(userData) => setUsuario(userData)} />;
  }

  return (
    <div style={{ padding: '16px', maxWidth: 800, margin: 'auto', position: 'relative' }}>
      {carregando && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(255, 255, 255, 0.7)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1000
        }}>
          <div style={{ fontSize: 24 }}>Carregando...</div>
        </div>
      )}

      <button
        onClick={fazerLogout}
        style={{
          position: 'absolute',
          top: 16,
          right: 16,
          padding: '8px 16px',
          backgroundColor: '#ff4d4f',
          color: 'white',
          border: 'none',
          borderRadius: 4,
          cursor: 'pointer'
        }}
      >
        Sair
      </button>

      <InputsPanel
        rendaMensal={rendaAtual}
        setRendaMensal={(value) => {
          setRendaMensal(prev => ({
            ...prev,
            [chaveSelecionada]: value
          }));
        }}
        reservaMensal={reservaAtual}
        setReservaMensal={(value) => {
          setReservaMensal(prev => ({
            ...prev,
            [chaveSelecionada]: value
          }));
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
        onClose={() => setModalAberto(false)}
        tipoGasto={tipoGasto}
        gastoEditando={gastoEditando}
        descricao={descricao}
        setDescricao={setDescricao}
        valor={valor}
        setValor={setValor}
        data={data}
        setData={setData}
        salvarGasto={salvarGasto}
        deletarGasto={deletarGasto}
      />
    </div>
  );
}