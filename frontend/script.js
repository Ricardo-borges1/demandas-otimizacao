let demandaCount = 0;
const demandaCards = document.getElementById('demandaCards');
const relatorioArea = document.getElementById('relatorio');
const dataInput = document.getElementById('data');

// Carregar demandas ao selecionar data
dataInput.addEventListener('change', () => {
  const data = dataInput.value;
  demandaCards.innerHTML = '';
  if(!data) return;
  fetch(`http://localhost:3000/demandas/${data}`)
    .then(res => res.json())
    .then(demandas => {
      demandas.forEach(d => criarCard(d));
    });
});

// Criar card de demanda (inputs definidos)
function criarCard(dados = {}) {
  demandaCount++;
  const card = document.createElement('div');
  card.className = 'demanda-card';
  card.dataset.id = demandaCount;

  card.innerHTML = `
    <button class="closeCard">×</button>

    <h3>Demanda ${demandaCount}</h3>

    <label>Unidade:</label>
    <input type="text" class="unidade" value="${dados.unidade || ''}" required>

    <label>Chamado(s) (separar por /):</label>
    <input type="text" class="chamado" value="${dados.chamado || ''}">

    <label>Solicitante:</label>
    <input type="text" class="solicitante" value="${dados.solicitante || ''}">

    <label>Local:</label>
    <input type="text" class="local" value="${dados.local || ''}">

    <label>Defeito:</label>
    <textarea class="defeito">${dados.defeito || ''}</textarea>

    <label>Ação:</label>
    <textarea class="acao" readonly>${dados.acao || ''}</textarea>
    <button class="editarAcao">Editar Ação</button>
  `;

  // Botão fechar
  card.querySelector('.closeCard').addEventListener('click', () => card.remove());

  // Editar ação
  card.querySelector('.editarAcao').addEventListener('click', () => {
    const acaoField = card.querySelector('.acao');
    if(acaoField.hasAttribute('readonly')){
      acaoField.removeAttribute('readonly');
      card.querySelector('.editarAcao').textContent = 'Salvar Ação';
    } else {
      acaoField.setAttribute('readonly', true);
      card.querySelector('.editarAcao').textContent = 'Editar Ação';
    }
  });

  demandaCards.appendChild(card);
  return card;
}

// Adicionar nova demanda
document.getElementById('addDemanda').addEventListener('click', () => criarCard());

// Salvar todas demandas no backend
document.getElementById('salvarTodas').addEventListener('click', () => {
  const data = dataInput.value;
  const responsaveis = document.getElementById('responsaveis').value;
  if(!data || !responsaveis) return alert('Preencha a data e os responsáveis!');

  const cards = document.querySelectorAll('.demanda-card');
  let promises = [];

  cards.forEach(card => {
    const demanda = {
      data: data,
      responsavel: responsaveis,
      unidade: card.querySelector('.unidade').value,
      chamado: card.querySelector('.chamado').value,
      solicitante: card.querySelector('.solicitante').value,
      local: card.querySelector('.local').value,
      defeito: card.querySelector('.defeito').value,
      acao: card.querySelector('.acao').value
    };
    promises.push(fetch('http://localhost:3000/salvar-demanda', {
      method: 'POST',
      headers: {'Content-Type':'application/json'},
      body: JSON.stringify(demanda)
    }));
  });

  Promise.all(promises)
    .then(() => alert('Demandas salvas com sucesso!'))
    .catch(err => console.error(err));
});

// Gerar relatório
document.getElementById('gerarRelatorio').addEventListener('click', () => {
  const data = dataInput.value;
  const responsaveis = document.getElementById('responsaveis').value;
  if(!data || !responsaveis) return alert('Preencha a data e os responsáveis!');

  let texto = `DEMANDAS ${formatData(data)}\n${responsaveis.toUpperCase()}\n\n`;
  document.querySelectorAll('.demanda-card').forEach((card, i) => {
    const unidade = card.querySelector('.unidade').value;
    const chamado = card.querySelector('.chamado').value;
    const solicitante = card.querySelector('.solicitante').value;
    const local = card.querySelector('.local').value;
    const defeito = card.querySelector('.defeito').value;
    const acao = card.querySelector('.acao').value;

    texto += `${i+1}....${unidade}\n`;
    if(chamado) texto += `chamado(s): ${chamado}\n`;
    if(solicitante) texto += `solicitante: ${solicitante}\n`;
    if(local) texto += `local: ${local}\n`;
    if(defeito) texto += `defeito: ${defeito}\n`;
    texto += `ação: ${acao}\n\n`;
  });

  relatorioArea.textContent = texto;
});

// Copiar relatório
document.getElementById('copiarRelatorio').addEventListener('click', () => {
  if(relatorioArea.textContent) navigator.clipboard.writeText(relatorioArea.textContent)
    .then(() => alert('Relatório copiado!'));
});

function formatData(data){
  // data vem no formato "YYYY-MM-DD", usamos direto
  const partes = data.split('-'); // ["2025","08","21"]
  const day = partes[2];
  const month = partes[1];
  const year = partes[0];
  return `${day}/${month}/${year}`;
}
