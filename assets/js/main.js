/*
 * Farmácia Sambati — comportamento do site (JavaScript puro, sem dependências).
 *
 * 1. Menu de navegação no celular.
 * 2. Horário: destaca o dia de hoje na tabela e mostra se a farmácia está aberta.
 *    Os horários são lidos da própria tabela (atributos data-abre / data-fecha em
 *    index.html), então basta atualizar a tabela quando o horário mudar.
 * 3. Ano atual no rodapé.
 */
(function () {
  'use strict';

  // ---------- 3. Ano atual no rodapé ----------
  const anoAtual = String(new Date().getFullYear());
  document.querySelectorAll('[data-ano-atual]').forEach((el) => {
    el.textContent = anoAtual;
  });

  // ---------- 1. Menu no celular ----------
  const cabecalho = document.querySelector('.cabecalho');
  const botaoMenu = document.querySelector('.menu-botao');

  if (cabecalho && botaoMenu) {
    const menuAberto = () => botaoMenu.getAttribute('aria-expanded') === 'true';
    const definirMenu = (aberto) => {
      botaoMenu.setAttribute('aria-expanded', String(aberto));
      cabecalho.classList.toggle('cabecalho--aberto', aberto);
    };

    botaoMenu.addEventListener('click', () => definirMenu(!menuAberto()));

    // Fecha ao escolher um link, ao clicar fora, com Esc ou ao passar para o layout de computador.
    cabecalho.addEventListener('click', (evento) => {
      if (evento.target.closest('.menu__lista a')) definirMenu(false);
    });
    document.addEventListener('click', (evento) => {
      if (menuAberto() && !cabecalho.contains(evento.target)) definirMenu(false);
    });
    document.addEventListener('keydown', (evento) => {
      if (evento.key === 'Escape' && menuAberto()) {
        definirMenu(false);
        botaoMenu.focus();
      }
    });
    window.matchMedia('(min-width: 60em)').addEventListener('change', (evento) => {
      if (evento.matches) definirMenu(false);
    });
  }

  // ---------- 2. Horário de funcionamento ----------
  const UM_DIA = 24 * 60 * 60 * 1000;
  const NOMES_DIAS = ['domingo', 'segunda-feira', 'terça-feira', 'quarta-feira', 'quinta-feira', 'sexta-feira', 'sábado'];

  // Datas em que o horário pode ser diferente do habitual (o site avisa e sugere ligar antes).
  const DATAS_FIXAS = {
    '01-01': 'feriado de Ano-Novo',
    '04-21': 'feriado de Tiradentes',
    '05-01': 'feriado do Dia do Trabalhador',
    '09-07': 'feriado da Independência',
    '10-12': 'feriado de Nossa Senhora Aparecida',
    '11-02': 'feriado de Finados',
    '11-15': 'feriado da Proclamação da República',
    '11-20': 'feriado da Consciência Negra',
    '12-24': 'véspera de Natal',
    '12-25': 'Natal',
    '12-31': 'véspera de Ano-Novo'
  };
  // Dias contados a partir do domingo de Páscoa.
  const DATAS_MOVEIS = {
    '-48': 'Carnaval',
    '-47': 'Carnaval',
    '-46': 'Quarta-feira de Cinzas',
    '-2': 'Sexta-feira Santa',
    '60': 'Corpus Christi'
  };

  const tabela = document.querySelector('[data-horarios]');
  if (tabela) iniciarHorarios(tabela, document.querySelectorAll('[data-status]'));

  function iniciarHorarios(tabelaHorarios, indicadores) {
    const horario = {};
    tabelaHorarios.querySelectorAll('tr[data-dia]').forEach((linha) => {
      horario[linha.dataset.dia] = { abre: linha.dataset.abre, fecha: linha.dataset.fecha, linha };
    });

    const atualizar = () => {
      let agora;
      try {
        agora = agoraEmRolandia();
      } catch (erro) {
        return; // Navegador sem suporte a fuso horário: a tabela continua visível normalmente.
      }

      Object.keys(horario).forEach((dia) => {
        const { linha } = horario[dia];
        const eHoje = Number(dia) === agora.diaSemana;
        let etiqueta = linha.querySelector('.etiqueta-hoje');
        linha.classList.toggle('hoje', eHoje);
        if (eHoje) {
          linha.setAttribute('aria-current', 'date');
          if (!etiqueta) {
            etiqueta = document.createElement('span');
            etiqueta.className = 'etiqueta-hoje';
            etiqueta.textContent = 'hoje';
            linha.querySelector('th').append(' ', etiqueta);
          }
        } else {
          linha.removeAttribute('aria-current');
          if (etiqueta) etiqueta.remove();
        }
      });

      const situacao = calcularSituacao(horario, agora);
      indicadores.forEach((indicador) => {
        indicador.dataset.estado = situacao.estado;
        indicador.querySelector('.status__titulo').textContent = situacao.titulo;
        indicador.querySelector('.status__detalhe').textContent = situacao.detalhe;
        indicador.hidden = false;
      });
    };

    atualizar();
    setInterval(atualizar, 60 * 1000);
  }

  function calcularSituacao(horario, agora) {
    const hoje = horario[agora.diaSemana];
    const especial = dataEspecial(agora.data);

    if (especial) {
      return { estado: 'especial', titulo: `Hoje é ${especial}`, detalhe: 'o horário pode ser diferente. Ligue antes de vir.' };
    }
    if (hoje && hoje.abre && agora.minutos >= minutos(hoje.abre) && agora.minutos < minutos(hoje.fecha)) {
      return { estado: 'aberta', titulo: 'Aberta agora', detalhe: `hoje até as ${hora(hoje.fecha)}` };
    }
    return { estado: 'fechada', titulo: 'Fechada agora', detalhe: proximaAbertura(horario, agora) };
  }

  function proximaAbertura(horario, agora) {
    const hoje = horario[agora.diaSemana];
    if (hoje && hoje.abre && agora.minutos < minutos(hoje.abre)) return `abre hoje às ${hora(hoje.abre)}`;

    for (let i = 1; i <= 7; i += 1) {
      const diaSemana = (agora.diaSemana + i) % 7;
      const dia = horario[diaSemana];
      if (!dia || !dia.abre) continue;
      const quando = i === 1 ? 'amanhã' : NOMES_DIAS[diaSemana];
      const especial = dataEspecial(agora.data + i * UM_DIA);
      if (especial) return `${quando} é ${especial}: o horário pode ser diferente`;
      return `abre ${quando} às ${hora(dia.abre)}`;
    }
    return '';
  }

  // Data, dia da semana e horário atuais no fuso de Rolândia (PR).
  function agoraEmRolandia() {
    const partes = {};
    new Intl.DateTimeFormat('en-US', {
      timeZone: 'America/Sao_Paulo',
      year: 'numeric',
      month: 'numeric',
      day: 'numeric',
      weekday: 'short',
      hour: 'numeric',
      minute: 'numeric',
      hourCycle: 'h23'
    })
      .formatToParts(new Date())
      .forEach((parte) => {
        partes[parte.type] = parte.value;
      });

    return {
      data: Date.UTC(Number(partes.year), Number(partes.month) - 1, Number(partes.day)),
      diaSemana: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].indexOf(partes.weekday),
      minutos: (Number(partes.hour) % 24) * 60 + Number(partes.minute)
    };
  }

  function dataEspecial(dataUTC) {
    const data = new Date(dataUTC);
    const fixa = DATAS_FIXAS[data.toISOString().slice(5, 10)];
    if (fixa) return fixa;
    const diasDesdePascoa = Math.round((dataUTC - pascoa(data.getUTCFullYear())) / UM_DIA);
    return DATAS_MOVEIS[diasDesdePascoa] || null;
  }

  // Domingo de Páscoa (algoritmo de Meeus/Jones/Butcher), em milissegundos UTC.
  function pascoa(ano) {
    const a = ano % 19;
    const b = Math.floor(ano / 100);
    const c = ano % 100;
    const d = Math.floor(b / 4);
    const e = b % 4;
    const f = Math.floor((b + 8) / 25);
    const g = Math.floor((b - f + 1) / 3);
    const h = (19 * a + b - d - g + 15) % 30;
    const i = Math.floor(c / 4);
    const k = c % 4;
    const l = (32 + 2 * e + 2 * i - h - k) % 7;
    const m = Math.floor((a + 11 * h + 22 * l) / 451);
    const mes = Math.floor((h + l - 7 * m + 114) / 31);
    const dia = ((h + l - 7 * m + 114) % 31) + 1;
    return Date.UTC(ano, mes - 1, dia);
  }

  function minutos(hhmm) {
    const [h, m] = hhmm.split(':').map(Number);
    return h * 60 + m;
  }

  // "08:00" → "8h"; "13:30" → "13h30"
  function hora(hhmm) {
    const [h, m] = hhmm.split(':').map(Number);
    return m ? `${h}h${String(m).padStart(2, '0')}` : `${h}h`;
  }
})();
