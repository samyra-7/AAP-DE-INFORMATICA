/* Base local de funcionários — usada só para preencher automaticamente
   o formulário de "Novo desligamento" a partir da matrícula.
   Troque/expanda esta lista pelos dados reais da empresa
   (ou substitua por uma consulta ao banco de dados, se tiver um). */

const BASE_FUNCIONARIOS = [
  {
    matricula: "10482", nome: "Mariana Costa Ribeiro",
    cargo: "Analista Fiscal", setor: "Controladoria",
    empresa: "Matriz", gestor: "Paulo Andrade",
    admissao: "2021-03-15", salario: "4200"
  },
  {
    matricula: "10233", nome: "Diego Fernandes Lima",
    cargo: "Auxiliar de Produção", setor: "Operações",
    empresa: "Unidade II", gestor: "Sandra Muniz",
    admissao: "2019-08-01", salario: "2600"
  },
  {
    matricula: "10877", nome: "Helena Souza Prado",
    cargo: "Designer", setor: "Marketing",
    empresa: "Matriz", gestor: "Rafael Nunes",
    admissao: "2022-11-07", salario: "5100"
  },
  {
    matricula: "10041", nome: "Lucas Martins Oliveira",
    cargo: "Assistente de RH", setor: "Recursos Humanos",
    empresa: "Matriz", gestor: "Camila Ferreira",
    admissao: "2023-02-13", salario: "2800"
  },
  {
    matricula: "10526", nome: "Beatriz Almeida Santos",
    cargo: "Analista de RH", setor: "Recursos Humanos",
    empresa: "Matriz", gestor: "Camila Ferreira",
    admissao: "2020-06-22", salario: "4500"
  },
  {
    matricula: "10318", nome: "Gabriel Rodrigues Melo",
    cargo: "Assistente Financeiro", setor: "Financeiro",
    empresa: "Unidade II", gestor: "Roberto Lima",
    admissao: "2022-01-10", salario: "3100"
  },
  {
    matricula: "10952", nome: "Isabela Carvalho Dias",
    cargo: "Analista de Marketing", setor: "Marketing",
    empresa: "Matriz", gestor: "Rafael Nunes",
    admissao: "2021-09-06", salario: "4300"
  },
  {
    matricula: "10176", nome: "Matheus Pereira Gomes",
    cargo: "Operador de Produção", setor: "Operações",
    empresa: "Unidade II", gestor: "Sandra Muniz",
    admissao: "2024-04-08", salario: "2400"
  },
  {
    matricula: "10643", nome: "Laura Mendes Barbosa",
    cargo: "Assistente Administrativo", setor: "Administrativo",
    empresa: "Matriz", gestor: "Fernanda Rocha",
    admissao: "2023-07-17", salario: "2900"
  },
  {
    matricula: "10721", nome: "Pedro Henrique Castro",
    cargo: "Analista de TI", setor: "Tecnologia",
    empresa: "Matriz", gestor: "André Martins",
    admissao: "2020-10-19", salario: "5800"
  },
  {
    matricula: "10095", nome: "Camila Oliveira Freitas",
    cargo: "Assistente Fiscal", setor: "Controladoria",
    empresa: "Matriz", gestor: "Paulo Andrade",
    admissao: "2024-01-15", salario: "3000"
  },
  {
    matricula: "10437", nome: "Rafael Santos Moreira",
    cargo: "Supervisor de Produção", setor: "Operações",
    empresa: "Unidade II", gestor: "Sandra Muniz",
    admissao: "2018-05-14", salario: "6200"
  },
  {
    matricula: "10812", nome: "Ana Clara Ribeiro Lopes",
    cargo: "Recrutadora", setor: "Recursos Humanos",
    empresa: "Matriz", gestor: "Camila Ferreira",
    admissao: "2022-08-01", salario: "3900"
  },
  {
    matricula: "10264", nome: "Bruno Almeida Cardoso",
    cargo: "Auxiliar de Logística", setor: "Logística",
    empresa: "Unidade II", gestor: "Marcelo Teixeira",
    admissao: "2023-03-20", salario: "2500"
  },
  {
    matricula: "10589", nome: "Juliana Ferreira Costa",
    cargo: "Analista Contábil", setor: "Controladoria",
    empresa: "Matriz", gestor: "Paulo Andrade",
    admissao: "2021-12-13", salario: "4600"
  },
  {
    matricula: "10124", nome: "Thiago Martins Souza",
    cargo: "Vendedor", setor: "Comercial",
    empresa: "Unidade I", gestor: "Patrícia Mendes",
    admissao: "2024-02-05", salario: "2700"
  },
  {
    matricula: "10908", nome: "Letícia Gomes Araújo",
    cargo: "Analista Comercial", setor: "Comercial",
    empresa: "Matriz", gestor: "Patrícia Mendes",
    admissao: "2020-07-27", salario: "4400"
  },
  {
    matricula: "10357", nome: "Felipe Costa Nascimento",
    cargo: "Motorista", setor: "Logística",
    empresa: "Unidade II", gestor: "Marcelo Teixeira",
    admissao: "2019-11-11", salario: "3200"
  },
  {
    matricula: "10691", nome: "Amanda Rodrigues Pinto",
    cargo: "Assistente de Compras", setor: "Suprimentos",
    empresa: "Matriz", gestor: "Eduardo Barros",
    admissao: "2023-05-08", salario: "3100"
  },
  {
    matricula: "10063", nome: "Vinícius Barbosa Silva",
    cargo: "Analista de Dados", setor: "Tecnologia",
    empresa: "Matriz", gestor: "André Martins",
    admissao: "2022-09-19", salario: "5600"
  },
  {
    matricula: "10415", nome: "Sofia Martins Carvalho",
    cargo: "Recepcionista", setor: "Administrativo",
    empresa: "Unidade I", gestor: "Fernanda Rocha",
    admissao: "2024-06-03", salario: "2200"
  },
  {
    matricula: "10784", nome: "Gustavo Lima Pereira",
    cargo: "Técnico de Segurança", setor: "Segurança do Trabalho",
    empresa: "Unidade II", gestor: "Marcelo Teixeira",
    admissao: "2021-04-12", salario: "3800"
  },
  {
    matricula: "10208", nome: "Larissa Souza Fernandes",
    cargo: "Analista de Qualidade", setor: "Qualidade",
    empresa: "Unidade II", gestor: "Sandra Muniz",
    admissao: "2022-03-07", salario: "4100"
  },
  {
    matricula: "10836", nome: "Daniel Ribeiro Costa",
    cargo: "Assistente de Marketing", setor: "Marketing",
    empresa: "Matriz", gestor: "Rafael Nunes",
    admissao: "2024-03-11", salario: "2900"
  },
  {
    matricula: "10503", nome: "Manuela Castro Almeida",
    cargo: "Analista Financeiro", setor: "Financeiro",
    empresa: "Matriz", gestor: "Roberto Lima",
    admissao: "2020-02-17", salario: "4700"
  },
  {
    matricula: "10189", nome: "João Pedro Mendes",
    cargo: "Estoquista", setor: "Logística",
    empresa: "Unidade I", gestor: "Marcelo Teixeira",
    admissao: "2023-10-02", salario: "2300"
  },
  {
    matricula: "10941", nome: "Vitória Almeida Rocha",
    cargo: "Advogada", setor: "Jurídico",
    empresa: "Matriz", gestor: "Ricardo Azevedo",
    admissao: "2021-06-14", salario: "6500"
  },
  {
    matricula: "10302", nome: "Enzo Ferreira Santos",
    cargo: "Jovem Aprendiz", setor: "Recursos Humanos",
    empresa: "Matriz", gestor: "Camila Ferreira",
    admissao: "2025-01-06", salario: "1100"
  },
  {
    matricula: "10628", nome: "Nicole Martins Ribeiro",
    cargo: "Assistente Jurídico", setor: "Jurídico",
    empresa: "Matriz", gestor: "Ricardo Azevedo",
    admissao: "2023-08-21", salario: "3200"
  },
  {
    matricula: "10072", nome: "Samuel Oliveira Barros",
    cargo: "Eletricista", setor: "Manutenção",
    empresa: "Unidade II", gestor: "Cláudio Reis",
    admissao: "2019-04-29", salario: "3600"
  },
  {
    matricula: "10496", nome: "Eduarda Costa Martins",
    cargo: "Analista de Treinamento", setor: "Recursos Humanos",
    empresa: "Matriz", gestor: "Camila Ferreira",
    admissao: "2022-05-16", salario: "4200"
  },
  {
    matricula: "10705", nome: "Leonardo Souza Lima",
    cargo: "Coordenador Comercial", setor: "Comercial",
    empresa: "Unidade I", gestor: "Patrícia Mendes",
    admissao: "2018-09-10", salario: "7200"
  },
  {
    matricula: "10291", nome: "Maria Eduarda Gomes",
    cargo: "Assistente de DP", setor: "Departamento Pessoal",
    empresa: "Matriz", gestor: "Camila Ferreira",
    admissao: "2024-05-20", salario: "3000"
  },
  {
    matricula: "10859", nome: "Arthur Nunes Ferreira",
    cargo: "Desenvolvedor", setor: "Tecnologia",
    empresa: "Matriz", gestor: "André Martins",
    admissao: "2021-01-18", salario: "6800"
  },
  {
    matricula: "10547", nome: "Clara Barbosa Mendes",
    cargo: "Analista de Compras", setor: "Suprimentos",
    empresa: "Matriz", gestor: "Eduardo Barros",
    admissao: "2020-11-09", salario: "4500"
  },
  {
    matricula: "10153", nome: "Miguel Costa Ribeiro",
    cargo: "Auxiliar de Manutenção", setor: "Manutenção",
    empresa: "Unidade II", gestor: "Cláudio Reis",
    admissao: "2023-01-23", salario: "2500"
  },
  {
    matricula: "10973", nome: "Alice Fernandes Souza",
    cargo: "Analista de Comunicação", setor: "Marketing",
    empresa: "Matriz", gestor: "Rafael Nunes",
    admissao: "2022-12-05", salario: "4300"
  },
  {
    matricula: "10381", nome: "Bernardo Lima Castro",
    cargo: "Operador de Empilhadeira", setor: "Logística",
    empresa: "Unidade II", gestor: "Marcelo Teixeira",
    admissao: "2020-08-24", salario: "2900"
  },
  {
    matricula: "10674", nome: "Luiza Prado Martins",
    cargo: "Analista de Processos", setor: "Qualidade",
    empresa: "Unidade II", gestor: "Sandra Muniz",
    admissao: "2021-07-12", salario: "4800"
  },
  {
    matricula: "10028", nome: "Heitor Almeida Santos",
    cargo: "Assistente de Vendas", setor: "Comercial",
    empresa: "Unidade I", gestor: "Patrícia Mendes",
    admissao: "2024-07-01", salario: "2600"
  },
  {
    matricula: "10468", nome: "Melissa Ribeiro Costa",
    cargo: "Contadora", setor: "Controladoria",
    empresa: "Matriz", gestor: "Paulo Andrade",
    admissao: "2019-02-25", salario: "6100"
  },
  {
    matricula: "10739", nome: "Davi Martins Oliveira",
    cargo: "Analista de Sistemas", setor: "Tecnologia",
    empresa: "Matriz", gestor: "André Martins",
    admissao: "2023-04-17", salario: "5400"
  },
  {
    matricula: "10247", nome: "Yasmin Ferreira Lopes",
    cargo: "Auxiliar Administrativo", setor: "Administrativo",
    empresa: "Unidade I", gestor: "Fernanda Rocha",
    admissao: "2022-06-06", salario: "2400"
  },
  {
    matricula: "10804", nome: "Caio Rodrigues Almeida",
    cargo: "Técnico de Manutenção", setor: "Manutenção",
    empresa: "Unidade II", gestor: "Cláudio Reis",
    admissao: "2020-12-07", salario: "3900"
  },
  {
    matricula: "10572", nome: "Lívia Santos Barbosa",
    cargo: "Analista de Departamento Pessoal", setor: "Departamento Pessoal",
    empresa: "Matriz", gestor: "Camila Ferreira",
    admissao: "2021-10-04", salario: "4600"
  },
  {
    matricula: "10106", nome: "Otávio Mendes Rocha",
    cargo: "Supervisor de Logística", setor: "Logística",
    empresa: "Unidade II", gestor: "Marcelo Teixeira",
    admissao: "2018-03-19", salario: "5900"
  },
  {
    matricula: "10926", nome: "Elisa Costa Fernandes",
    cargo: "Assistente de Qualidade", setor: "Qualidade",
    empresa: "Unidade II", gestor: "Sandra Muniz",
    admissao: "2024-08-12", salario: "2800"
  },
  {
    matricula: "10364", nome: "Murilo Souza Cardoso",
    cargo: "Analista de Planejamento", setor: "Financeiro",
    empresa: "Matriz", gestor: "Roberto Lima",
    admissao: "2022-02-14", salario: "4900"
  },
  {
    matricula: "10615", nome: "Rebeca Almeida Nunes",
    cargo: "Assistente de Suprimentos", setor: "Suprimentos",
    empresa: "Matriz", gestor: "Eduardo Barros",
    admissao: "2023-11-06", salario: "3000"
  },
  {
    matricula: "10084", nome: "Antônio Ribeiro Martins",
    cargo: "Gerente Administrativo", setor: "Administrativo",
    empresa: "Matriz", gestor: "Fernanda Rocha",
    admissao: "2017-06-12", salario: "8500"
  }
];
