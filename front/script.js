// Ajuste apenas o endereço da API caso a porta exibida no terminal seja diferente.
const API_URL = "http://localhost:5224/api/Atividades";

// ===== Elementos da página =====
const mensagem = document.querySelector("#mensagem");
const carregando = document.querySelector("#carregando");
const areaConteudo = document.querySelector("#areaConteudo");
const totalAtividades = document.querySelector("#totalAtividades");
const botaoAtualizar = document.querySelector("#botaoAtualizar");

const formAtividade = document.querySelector("#formAtividade");
const tituloFormulario = document.querySelector("#tituloFormulario");
const campoTipo = document.querySelector("#tipo");
const camposCurso = document.querySelector("#camposCurso");
const camposWorkshop = document.querySelector("#camposWorkshop");
const botaoSalvar = document.querySelector("#botaoSalvar");
const botaoCancelar = document.querySelector("#botaoCancelar");

const modalDetalhes = document.querySelector("#modalDetalhes");
const detalheDescricao = document.querySelector("#detalheDescricao");
const detalheDuracao = document.querySelector("#detalheDuracao");
const detalheInscricao = document.querySelector("#detalheInscricao");
const botaoInscrever = document.querySelector("#botaoInscrever");

// Guarda o id da atividade em edição (null = cadastrando uma nova)
let idEmEdicao = null;

// Guarda o id da atividade aberta no modal de detalhes
let idDetalhe = null;

// ===== Mensagens e carregamento =====

function mostrarMensagem(texto, tipo) {
  // tipo: "success", "danger", "warning" ou "info"
  mensagem.className = `alert alert-${tipo}`;
  mensagem.textContent = texto;
}

function esconderMensagem() {
  mensagem.className = "alert d-none";
  mensagem.textContent = "";
}

function mostrarCarregando(ativo) {
  carregando.classList.toggle("d-none", !ativo);
}

// ===== Tratamento das respostas da API =====

// Verifica o status da resposta. Se for erro, lê a mensagem enviada pela API.
function tratarResposta(resposta) {
  if (!resposta.ok) {
    return resposta.json()
      .catch(() => ({}))
      .then((dados) => {
        const texto = dados.mensagem || `Erro ${resposta.status} ao comunicar com a API.`;
        throw new Error(texto);
      });
  }

  // DELETE retorna 204 (sem conteúdo)
  if (resposta.status === 204) {
    return null;
  }

  return resposta.json();
}

// Mensagem amigável quando a API está desligada
function textoDoErro(erro) {
  if (erro instanceof TypeError) {
    return "Não foi possível conectar à API. Verifique se o backend está em execução.";
  }
  return erro.message;
}

// A API não informa o tipo, então ele é descoberto pelos campos recebidos
function identificarTipo(atividade) {
  return atividade.professor !== undefined ? "curso" : "workshop";
}

// ===== GET: listagem =====

function carregarAtividades() {
  mostrarCarregando(true);

  fetch(API_URL)
    .then(tratarResposta)
    .then((lista) => {
      // A listagem traz apenas id, título e ano.
      // Para mostrar professor/instrutor, cada atividade é buscada pelo id.
      const requisicoes = lista.map((item) =>
        fetch(`${API_URL}/${item.id}`).then(tratarResposta)
      );
      return Promise.all(requisicoes);
    })
    .then((atividades) => {
      exibirAtividades(atividades);
    })
    .catch((erro) => {
      mostrarMensagem(textoDoErro(erro), "danger");
    })
    .finally(() => {
      mostrarCarregando(false);
    });
}

function exibirAtividades(atividades) {
  areaConteudo.textContent = "";
  totalAtividades.textContent = atividades.length;

  if (atividades.length === 0) {
    const aviso = document.createElement("p");
    aviso.className = "text-secondary";
    aviso.textContent = "Nenhuma atividade cadastrada.";
    areaConteudo.appendChild(aviso);
    return;
  }

  atividades.forEach((atividade) => {
    areaConteudo.appendChild(criarCard(atividade));
  });
}

// Cria um elemento com classe e texto (evita repetir código)
function criarElemento(tag, classes, texto) {
  const elemento = document.createElement(tag);
  if (classes) {
    elemento.className = classes;
  }
  if (texto !== undefined) {
    elemento.textContent = texto;
  }
  return elemento;
}

function criarCard(atividade) {
  const tipo = identificarTipo(atividade);
  const ehCurso = tipo === "curso";

  const coluna = criarElemento("div", "col");

  const card = criarElemento("article", `card card-atividade h-100 shadow-sm ${tipo}`);
  card.dataset.id = atividade.id;
  if (atividade.id === idEmEdicao) {
    card.classList.add("em-edicao");
  }

  const corpo = criarElemento("div", "card-body d-flex flex-column");

  const etiqueta = criarElemento(
    "span",
    `badge align-self-start mb-2 ${ehCurso ? "text-bg-primary" : "text-bg-success"}`,
    ehCurso ? "Curso" : "Workshop"
  );

  const titulo = criarElemento("h3", "card-title h5", atividade.titulo);
  const ano = criarElemento("p", "text-secondary small mb-2", `Ano: ${atividade.ano}`);

  let responsavel;
  let informacoes;
  if (ehCurso) {
    responsavel = `Professor: ${atividade.professor}`;
    informacoes = `${atividade.cargaHoraria} h • ${atividade.vagas} vagas`;
  } else {
    responsavel = `Instrutor: ${atividade.instrutor}`;
    informacoes = `${atividade.local} • ${atividade.duracaoHoras} h`;
  }

  const textoResponsavel = criarElemento("p", "card-text mb-1", responsavel);
  const textoInformacoes = criarElemento("p", "card-text text-secondary small", informacoes);

  // Botões de ação
  const acoes = criarElemento("div", "d-flex flex-wrap gap-2 mt-auto pt-2");

  const botaoDetalhes = criarElemento("button", "btn btn-sm btn-outline-primary", "Detalhes");
  botaoDetalhes.type = "button";
  botaoDetalhes.addEventListener("click", () => verDetalhes(atividade.id));

  const botaoEditar = criarElemento("button", "btn btn-sm btn-outline-warning", "Editar");
  botaoEditar.type = "button";
  botaoEditar.addEventListener("click", () => iniciarEdicao(atividade));

  const botaoExcluir = criarElemento("button", "btn btn-sm btn-outline-danger", "Excluir");
  botaoExcluir.type = "button";
  botaoExcluir.addEventListener("click", () => excluirAtividade(atividade));

  acoes.append(botaoDetalhes, botaoEditar, botaoExcluir);
  corpo.append(etiqueta, titulo, ano, textoResponsavel, textoInformacoes, acoes);
  card.appendChild(corpo);
  coluna.appendChild(card);

  return coluna;
}

// ===== Detalhes e inscrição =====

function verDetalhes(id) {
  mostrarCarregando(true);

  fetch(`${API_URL}/${id}/descricao`)
    .then(tratarResposta)
    .then((dados) => {
      idDetalhe = id;
      detalheDescricao.textContent = dados.descricao;
      detalheDuracao.textContent = dados.duracao;
      detalheInscricao.classList.add("d-none");

      // Somente cursos permitem inscrição
      botaoInscrever.classList.toggle("d-none", dados.tipo !== "Curso");

      bootstrap.Modal.getOrCreateInstance(modalDetalhes).show();
    })
    .catch((erro) => {
      mostrarMensagem(textoDoErro(erro), "danger");
    })
    .finally(() => {
      mostrarCarregando(false);
    });
}

function inscrever() {
  botaoInscrever.disabled = true;

  fetch(`${API_URL}/${idDetalhe}/inscrever`, { method: "POST" })
    .then(tratarResposta)
    .then((dados) => {
      detalheInscricao.className = "alert alert-success mt-3 mb-0";
      detalheInscricao.textContent = dados.mensagem;
    })
    .catch((erro) => {
      detalheInscricao.className = "alert alert-danger mt-3 mb-0";
      detalheInscricao.textContent = textoDoErro(erro);
    })
    .finally(() => {
      botaoInscrever.disabled = false;
    });
}

// ===== Formulário =====

// Mostra os campos do curso ou do workshop conforme o tipo escolhido
function alternarCampos() {
  const ehCurso = campoTipo.value === "curso";
  camposCurso.classList.toggle("d-none", !ehCurso);
  camposWorkshop.classList.toggle("d-none", ehCurso);
}

function valor(id) {
  return document.querySelector(`#${id}`).value.trim();
}

// Marca o campo como válido ou inválido e retorna o resultado
function marcarCampo(id, valido) {
  const campo = document.querySelector(`#${id}`);
  campo.classList.toggle("is-invalid", !valido);
  campo.classList.toggle("is-valid", valido);
  return valido;
}

function textoPreenchido(id) {
  return marcarCampo(id, valor(id) !== "");
}

function numeroPositivo(id) {
  const numero = Number(valor(id));
  return marcarCampo(id, valor(id) !== "" && Number.isInteger(numero) && numero > 0);
}

function validarFormulario() {
  const ano = Number(valor("ano"));

  // Cada validação é executada para que todos os campos com erro sejam marcados
  const resultados = [
    textoPreenchido("titulo"),
    marcarCampo("ano", Number.isInteger(ano) && ano >= 2000 && ano <= 2100)
  ];

  if (campoTipo.value === "curso") {
    resultados.push(
      textoPreenchido("professor"),
      numeroPositivo("cargaHoraria"),
      numeroPositivo("vagas")
    );
  } else {
    resultados.push(
      textoPreenchido("instrutor"),
      textoPreenchido("local"),
      numeroPositivo("duracaoHoras")
    );
  }

  return resultados.every((resultado) => resultado);
}

// Monta o objeto no formato esperado pela API
function montarDados() {
  const dados = {
    titulo: valor("titulo"),
    ano: Number(valor("ano"))
  };

  if (campoTipo.value === "curso") {
    dados.professor = valor("professor");
    dados.cargaHoraria = Number(valor("cargaHoraria"));
    dados.vagas = Number(valor("vagas"));
  } else {
    dados.instrutor = valor("instrutor");
    dados.local = valor("local");
    dados.duracaoHoras = Number(valor("duracaoHoras"));
  }

  return dados;
}

// ===== POST e PUT =====

function salvarAtividade(evento) {
  evento.preventDefault();
  esconderMensagem();

  if (!validarFormulario()) {
    mostrarMensagem("Verifique os campos destacados no formulário.", "warning");
    return;
  }

  const tipo = campoTipo.value;
  const editando = idEmEdicao !== null;

  // POST /curso ou /workshop  |  PUT /curso/{id} ou /workshop/{id}
  const url = editando ? `${API_URL}/${tipo}/${idEmEdicao}` : `${API_URL}/${tipo}`;
  const metodo = editando ? "PUT" : "POST";

  botaoSalvar.disabled = true;
  mostrarCarregando(true);

  fetch(url, {
    method: metodo,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(montarDados())
  })
    .then(tratarResposta)
    .then((atividade) => {
      const acao = editando ? "atualizada" : "cadastrada";
      mostrarMensagem(`Atividade "${atividade.titulo}" ${acao} com sucesso!`, "success");
      limparFormulario();
      carregarAtividades();
    })
    .catch((erro) => {
      mostrarMensagem(textoDoErro(erro), "danger");
    })
    .finally(() => {
      botaoSalvar.disabled = false;
      mostrarCarregando(false);
    });
}

function iniciarEdicao(atividade) {
  const tipo = identificarTipo(atividade);
  idEmEdicao = atividade.id;

  limparValidacao();
  campoTipo.value = tipo;
  campoTipo.disabled = true; // o tipo não muda na edição, pois a rota do PUT depende dele
  alternarCampos();

  document.querySelector("#titulo").value = atividade.titulo;
  document.querySelector("#ano").value = atividade.ano;

  if (tipo === "curso") {
    document.querySelector("#professor").value = atividade.professor;
    document.querySelector("#cargaHoraria").value = atividade.cargaHoraria;
    document.querySelector("#vagas").value = atividade.vagas;
  } else {
    document.querySelector("#instrutor").value = atividade.instrutor;
    document.querySelector("#local").value = atividade.local;
    document.querySelector("#duracaoHoras").value = atividade.duracaoHoras;
  }

  tituloFormulario.textContent = `Editar atividade: ${atividade.titulo}`;
  botaoSalvar.textContent = "Salvar alterações";
  botaoCancelar.classList.remove("d-none");

  destacarCardEmEdicao();
  document.querySelector("#novaAtividade").scrollIntoView({ behavior: "smooth" });
}

function destacarCardEmEdicao() {
  document.querySelectorAll(".card-atividade").forEach((card) => {
    card.classList.toggle("em-edicao", Number(card.dataset.id) === idEmEdicao);
  });
}

function limparValidacao() {
  formAtividade.querySelectorAll(".is-valid, .is-invalid").forEach((campo) => {
    campo.classList.remove("is-valid", "is-invalid");
  });
}

function limparFormulario() {
  formAtividade.reset();
  limparValidacao();

  idEmEdicao = null;
  campoTipo.disabled = false;
  alternarCampos();

  tituloFormulario.textContent = "Nova atividade";
  botaoSalvar.textContent = "Salvar atividade";
  botaoCancelar.classList.add("d-none");

  destacarCardEmEdicao();
}

// ===== DELETE =====

function excluirAtividade(atividade) {
  const confirmado = confirm(`Deseja realmente excluir "${atividade.titulo}"?`);
  if (!confirmado) {
    return;
  }

  mostrarCarregando(true);

  fetch(`${API_URL}/${atividade.id}`, { method: "DELETE" })
    .then(tratarResposta)
    .then(() => {
      mostrarMensagem(`Atividade "${atividade.titulo}" excluída com sucesso.`, "success");

      // Se a atividade excluída estava em edição, o formulário é limpo
      if (atividade.id === idEmEdicao) {
        limparFormulario();
      }

      carregarAtividades();
    })
    .catch((erro) => {
      mostrarMensagem(textoDoErro(erro), "danger");
    })
    .finally(() => {
      mostrarCarregando(false);
    });
}

// ===== Eventos =====

campoTipo.addEventListener("change", () => {
  limparValidacao();
  alternarCampos();
});

formAtividade.addEventListener("submit", salvarAtividade);
botaoCancelar.addEventListener("click", limparFormulario);
botaoAtualizar.addEventListener("click", carregarAtividades);
botaoInscrever.addEventListener("click", inscrever);

// Carrega a lista assim que a página abre
carregarAtividades();
