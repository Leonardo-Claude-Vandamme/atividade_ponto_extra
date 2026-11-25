Questão prática A — Painel de Gestão de Atividades
Utilizando o projeto-base fornecido, crie uma interface para gerenciamento de cursos e workshops disponíveis na API.

Exemplo visual da tela
------------------------------------------------
| Atividades Formativas       Início  Gestão  |
------------------------------------------------

              PAINEL DE GESTÃO

| Atividades cadastradas                       |
|                                              |
| Curso de JavaScript                          |
| Professor: Equipe Web                        |
| [Detalhes] [Editar] [Excluir]                |
|                                              |
| Workshop de Git                              |
| Instrutor: Laboratório Web                   |
| [Detalhes] [Editar] [Excluir]                |
------------------------------------------------

              NOVA ATIVIDADE

| Tipo | Título | Ano | Dados específicos       |
|                                              |
|              [Salvar atividade]              |

------------------------------------------------
| Rodapé                                       |
------------------------------------------------
O exemplo representa apenas uma possibilidade de organização. O aluno poderá escolher suas próprias cores, componentes e disposição dos elementos.

A tela deverá possuir
Bootstrap local;
layout responsivo;
listagem das atividades retornadas pela API;
formulário para cadastrar curso ou workshop;
requisição GET para carregar as atividades;
requisição POST para cadastrar uma atividade;
requisição PUT para editar uma atividade;
requisição DELETE para excluir uma atividade;
validação dos campos principais;
mensagens de sucesso, erro ou carregamento;
manipulação do DOM e eventos com JavaScript;
código organizado, indentado e com nomes compreensíveis;
uso de .then() e .catch() para tratar as requisições;
manutenção do backend original.
Os recursos de detalhes e inscrição poderão ser utilizados caso façam sentido na interface criada.