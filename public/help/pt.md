## Primeiros Passos

### Como começar

Após criar conta e iniciar sessão, a primeira coisa a fazer é adicionar uma conta bancária. Aceda ao menu **Contas** e escolha entre ligar um banco diretamente (conta automática) ou importar um extrato em PDF, Excel ou CSV (conta manual).

A ligação automática é feita através de fornecedores de acesso a dados bancários certificados (GoCardless e Enable Banking). As suas credenciais bancárias nunca passam pelos servidores do Eurodata — o processo de autenticação ocorre diretamente no site do banco.

### Navegação principal

A barra de navegação no topo dá acesso às quatro secções principais:

| Ícone | Secção | Descrição |
|-------|--------|-----------|
| 🧾 | **Transações** | Listar, filtrar, categorizar e gerir as suas transações |
| 🏦 | **Contas** | Ligar bancos, importar extratos, gerir contas |
| 📈 | **Análises** | Gráficos de receitas, despesas e tendências |
| 🔄 | **Recorrentes** | Gerir pagamentos e recebimentos periódicos |

### Idioma e tema

No canto superior direito pode:

- **Mudar o idioma** clicando no ícone de globo — 8 idiomas disponíveis: Inglês, Português, Espanhol, Francês, Alemão, Italiano, Holandês, Polaco.
- **Mudar entre tema claro e escuro** clicando no ícone de lua/sol.

---

## Transações

Esta é a secção principal da aplicação. Mostra todas as suas transações importadas, com ferramentas para filtrar, categorizar e organizar.

### Cartões de contas (topo da página)

No topo aparecem cartões para cada conta bancária configurada. Cada cartão mostra:

- **Logo do banco** (ou ícone genérico de banco)
- **Tipo de conta:** ícone de documento = conta manual (importada por ficheiro); ícone de ligação = conta automática (ligada ao banco)
- **Nome da conta** com a cor associada
- **Nome da instituição** e fornecedor dos dados
- **Saldo atual** e data de última atualização (se a opção "Mostrar saldos" estiver ativa no perfil)

**Caixa de seleção em cada cartão:** marcar ou desmarcar um cartão filtra as transações mostradas na lista. Por defeito, todas as contas estão selecionadas.

### Botões de ação (canto superior direito)

| Ícone | Ação |
|-------|------|
| ❓| Abre a ajuda contextual desta secção |
| 🔄 | **Atualizar transações** — despoleta a importação de novas transações em todas as contas automáticas. Fica desativado se o limite de pedidos for atingido |
| ⚖️ | **Atualizar saldos** — atualiza o saldo de todas as contas (aparece apenas se "Mostrar saldos" estiver ativo) |

### Barra de ferramentas da lista

| Elemento | Descrição |
|----------|-----------|
| **Selecionar tudo** (caixa) | Ativa o modo de seleção múltipla; aparece o botão "Eliminar selecionadas" |
| 🗑️ **Eliminar selecionadas** | Elimina todas as transações selecionadas (aparece apenas quando há seleções ativas) |
| **Pesquisar** | Filtra a lista pela descrição da transação ou nome da conta |
| **Linhas por página** | Escolha entre 10, 20 ou 50 transações por página |
| **Todas / Só novas** | Alterna entre mostrar todas as transações ou apenas as marcadas como novas (ainda não revistas) |
| **Categorias** | Filtro por uma ou mais categorias; inclui opção "Sem categoria". Use os botões "Todas" / "Nenhuma" para seleção rápida |
| **Etiquetas** | Filtro por etiquetas; inclui opção "Sem etiqueta" |
| 📄 **Exportar CSV** | Exporta as transações para ficheiro CSV (compatível com Excel). Permite escolher contas, categorias e etiquetas a incluir. Também disponível em formato JSON e OFX |

### Elementos de cada linha de transação

Cada linha da lista contém os seguintes elementos:

| Elemento | Descrição |
|----------|-----------|
| **Caixa de seleção** (esquerda) | Seleciona a transação para ações em massa (aparece ao ativar "Selecionar tudo") |
| **Incluir em Análises** (caixa) | Quando marcada, esta transação é contabilizada nos gráficos e totais de Análises. Desmarque para excluir transações pontuais ou incorretas das estatísticas |
| **Descrição** | Texto da transação tal como vem do banco. Por baixo aparece o nome da conta com a cor associada |
| **Etiqueta "Nova"** | Aparece em transações importadas recentemente. Clique no **×** para marcar como revista e remover a etiqueta |
| **"Pendente"** | Indica que a transação ainda não foi processada definitivamente pelo banco |
| **Categoria** (menu pendente) | Categoria atribuída pela IA. Clique para alterar — o sistema aprende com as suas correções ao longo do tempo |
| 🔔 **Recorrente** (ícone de sino) | Configura um pagamento recorrente a partir desta transação. Permite definir alertas para quando ocorrer ou quando faltar |
| 💬 **Comentário** (ícone de balão) | Adiciona ou edita uma nota pessoal para esta transação. O ícone fica preenchido quando existe um comentário |
| 🗑️ **Eliminar** (ícone de lixo, vermelho) | Remove esta transação permanentemente. Pede confirmação |
| **Etiquetas** | Etiquetas atribuídas à transação, mostradas como badges coloridos. Clique para abrir o painel de seleção de etiquetas |
| **Montante** | Valor da transação (direita). Positivo = recebido; negativo = pago |
| **Data de lançamento** | Data em que a transação aparece no extrato |
| **Data de contabilização** | Data original da operação (pode diferir da data de lançamento) |
| ▲▼ **Setas de data** | Ajusta a data de lançamento ±1 dia. Útil para corrigir datas que o banco reporta incorretamente |

### Paginação

Em baixo da lista encontra os controlos de paginação: informação "A mostrar X a Y de Z", e setas para a página anterior / seguinte.

---

## Contas

A secção **Contas** permite gerir todas as suas contas bancárias — ligar novos bancos, importar extratos manualmente ou gerir contas existentes.

### Contas existentes

Cada conta aparece num cartão com:

- **Logo do banco** (clicável nas contas manuais para atualizar a imagem)
- **Tipo:** ícone de documento (manual) ou ícone de ligação (automática)
- **Nome amigável** editável diretamente no campo — clique em 💾 para guardar
- **Nome da instituição** e fornecedor
- **Saldo** (se ativo no perfil)

**Botões de ação por conta:**

| Ícone | Ação |
|-------|------|
| 🔔 **Alertas** | Ver e editar alertas da conta (ex.: saldo abaixo de X€) |
| 🔌 **Religar** | Reautenticar a ligação ao banco quando expirou (normalmente a cada 90 dias). O ícone fica vermelho/exclamação quando é necessária autenticação |
| 🔄 **Obter transações** | Importa manualmente novas transações desta conta (contas automáticas) ou abre o assistente de importação (contas manuais) |
| 🗑️ **Eliminar** (vermelho) | Remove a conta e todas as suas transações. Esta operação é irreversível |

### Ligar um novo banco

Para ligar um banco automaticamente:

1. Selecione o **país** no menu pendente
2. Pesquise o banco pelo nome na caixa de pesquisa
3. Clique no banco pretendido — será redirecionado para o site do banco para autorizar o acesso
4. Após autorização, a conta aparece na lista e as transações são importadas

A ligação tem validade de aproximadamente 90 dias; quando expirar, o ícone de ligação da conta ficará com um sinal de alerta e deverá clicar em **Religar** para renovar.

### Importar extrato (contas manuais)

Clique em **Importar extrato** (ícone de importação, canto superior direito) ou no botão **Obter transações** de uma conta manual para abrir o assistente de importação:

1. **Upload do ficheiro** — arraste ou selecione um ficheiro PDF, Excel (.xlsx) ou CSV
2. **Analisar** — a IA analisa o ficheiro e extrai as transações automaticamente
3. **Rever** — veja as transações detetadas e opcionalmente inverta os sinais (útil quando débitos e créditos estão trocados)
4. **Atribuir** — selecione a conta existente para onde importar, ou crie uma nova conta

---

## Análises

A secção **Análises** apresenta gráficos e tabelas com as suas receitas, despesas e tendências para o período selecionado.

### Painel de filtros

No topo da página encontra os filtros:

| Filtro | Descrição |
|--------|-----------|
| **Período** | Mês atual, Último mês, Ano até hoje, Últimos 12 meses, ou Personalizado (com datas início e fim à escolha) |
| **Contas** | Selecione uma ou mais contas a incluir na análise |
| **Etiquetas** | Filtre pelos projetos ou etiquetas que quer analisar; inclui opção "Sem etiqueta" |
| **Categorias** | Selecione categorias a incluir; use "Todas" / "Nenhuma" para seleção rápida |

**Configurações guardadas:**

Pode guardar conjuntos de filtros para reutilização:

| Ícone | Ação |
|-------|------|
| 📂 **Carregar config** | Carrega uma configuração guardada anteriormente |
| 💾 **Guardar config** | Guarda a configuração atual com um nome à sua escolha. Pode definir como predefinida |
| ⭐ **Definir como predefinida** | Define a configuração atualmente aplicada como predefinida (abre automaticamente na próxima visita) |

### Exportar PDF

O botão 📄 **Exportar PDF** (canto superior direito) imprime ou guarda a página de Análises como PDF — útil para relatórios mensais.

### Cartões de análise

Todos os cartões podem ser expandidos ou recolhidos clicando no título ou na seta ▲▼. Os dados refletem sempre os filtros aplicados.

#### Recebidos

Tabela com todas as transações de receita no período: data, descrição, conta, montante (verde). Passando o rato por cima de uma linha aparece um resumo completo com categoria, etiquetas e comentário. Mostra o total por moeda no rodapé.

#### Pagos

Igual ao cartão Recebidos mas para despesas, com montantes a vermelho.

#### Por Categoria

Gráfico de barras horizontais com o total por categoria. Barras verdes para receitas, vermelhas para despesas. No modo **Mês atual**, aparece uma barra tracejada a indicar o valor estimado até ao final do mês com base no histórico.

#### Totais

Três caixas lado a lado:
- **Total Recebido** (verde)
- **Total Pago** (vermelho)
- **Diferença** (verde se positiva, vermelho se negativa)

#### Saldo Acumulado

Gráfico de linha com a evolução do saldo ao longo do período. No modo **Mês atual**, uma linha tracejada projeta o saldo estimado até ao final do mês.

#### Comparação Mensal

Tabela com uma linha por mês: Mês | Recebido | Pago | Diferença, com linha de totais no rodapé. No modo **Mês atual**, aparece uma linha em itálico com a estimativa do mês corrente, com botão de exportação para CSV.

---

## Recorrentes

A secção **Recorrentes** ajuda-o a acompanhar pagamentos e recebimentos periódicos: rendas, assinaturas, salários, seguros, etc.

### Deteção automática de sugestões

O botão 🔍 **Executar sugestões** (canto superior direito) analisa os últimos 6 meses de transações e deteta padrões recorrentes com pelo menos 60% de confiança. As sugestões detetadas ficam disponíveis para revisão.

Na primeira utilização, a aplicação pode oferecer-se para executar a análise automaticamente.

### Vista em lista

A vista de lista mostra todos os recorrentes configurados.

**Filtros:**

| Filtro | Descrição |
|--------|-----------|
| **Conta** | Filtrar por conta bancária |
| **Estado** | Todos / Ativo / Pausado / Sugerido |
| **Ordenar por** | Data seguinte, Nome, Frequência, Montante, Confiança |
| **Pesquisar** | Filtrar pelo nome do recorrente |

**Botão + Criar recorrente manual** — abre o formulário de criação (ver em baixo).

#### Painel de sugestões

Quando existem sugestões por rever, é apresentado um painel para as avaliar uma a uma:

| Botão | Ação |
|-------|------|
| ✅ **Confirmar** | Aceita a sugestão e adiciona o recorrente |
| ✏️ **Editar e confirmar** | Abre o formulário de edição antes de confirmar |
| ⏭️ **Saltar** | Passa para a sugestão seguinte (sem confirmar nem descartar) |
| ✖️ **Descartar** | Rejeita a sugestão |

#### Tabela de recorrentes

Colunas: **Nome** | **Frequência** | **Próxima data** | **Montante** | **Estado** | **Conta** | **Ações**

**Ícones de estado:**

| Ícone | Estado |
|-------|--------|
| ✅ (verde) | **Ativo** — a ser acompanhado |
| ⏸️ (cinzento) | **Pausado** — temporariamente suspenso |
| 🕐 (âmbar) | **Sugerido** — aguarda confirmação |
| ✖️ (cinzento) | **Descartado** |

**Ações por linha:**

| Ícone | Ação |
|-------|------|
| ✅ **Confirmar** | Confirma uma sugestão pendente |
| ✏️ **Editar** | Abre o formulário de edição |
| ⏸️ / ▶️ **Pausar / Retomar** | Alterna entre estado ativo e pausado |
| 🗑️ **Eliminar** (vermelho) | Remove o recorrente permanentemente |

A coluna **Próxima data** mostra uma contagem decrescente: "Hoje", "Amanhã" ou "Em N dias".

### Vista em calendário

Alterne para a vista de calendário com o botão **Calendário** no topo.

- **Navegação por mês** — setas anterior/seguinte e botão "Hoje"
- **Grelha do mês** — cada dia mostra os pagamentos esperados como marcadores coloridos:
  - Verde: pagamento ocorrido
  - Vermelho: pagamento em falta
  - Cor predefinida: pagamento previsto
- **Barra de resumo** — total de ocorrências e montante total convertido para a moeda base
- Clique num marcador para abrir os detalhes e editar o recorrente

### Criar / editar um recorrente

O formulário de criação ou edição contém os seguintes campos:

| Campo | Descrição |
|-------|-----------|
| **Nome** | Nome descritivo (ex.: "Renda", "Netflix", "Salário") |
| **Conta** | Conta bancária associada (apenas na criação) |
| **Padrão de descrição** | Texto que costuma aparecer na descrição da transação (para correspondência automática) |
| **Frequência** | Semanal / Quinzenal / Mensal / Trimestral / Anual |
| **Dia âncora** | Dia do mês esperado (1–31) |
| **Montante esperado** | Valor habitual (negativo para despesas, vazio para montante variável) |
| **Montante nominal** | Valor de referência quando o montante é variável |
| **Tolerância de dias** | Número de dias de margem antes e depois da data âncora para detetar a transação |
| **Tolerância de montante** | Margem percentual ou absoluta para aceitar variações no montante |
| **Alertar quando ocorrer** | Envia notificação quando a transação correspondente é detetada |
| **Alertar quando faltar** | Envia notificação se o pagamento não for detetado dentro da tolerância |

---

## Bot de Telegram

O Eurodata pode enviar alertas e responder a consultas pelo **Telegram** através do bot **@bancos_alerts_bot**.

### Como configurar

1. Aceda ao seu **Perfil** (menu no canto superior direito → O meu perfil)
2. Na secção Telegram, clique em **Ligar Telegram** — a aplicação mostra uma ligação direta para o bot **@bancos_alerts_bot** no Telegram
3. Abra o Telegram, envie uma mensagem ao bot e depois envie o **código de verificação** apresentado na aplicação (válido por 10 minutos)
4. Após ligação bem-sucedida, ative os **Alertas Telegram** na secção de preferências

Também pode pesquisar diretamente por **@bancos_alerts_bot** no Telegram.

### Comandos disponíveis

| Comando | Descrição |
|---------|-----------|
| `/transactions [N]` | Mostra as últimas N transações (predefinido: 10; máximo: 100) |
| `/next [N]` | Mostra as próximas N transações recorrentes previstas (predefinido: 10) |
| `/balances` | Mostra o saldo atual de cada conta e o total |
| `/month [nome da config]` | Totais do mês corrente: recebido, pago, diferença. Aceita opcionalmente o nome de uma configuração de Análises |
| `/year [nome da config]` | Totais do ano até hoje. Aceita opcionalmente o nome de uma configuração de Análises |

---

## Subscrição

### Período de avaliação gratuito

A aplicação inclui um período de avaliação gratuito. Durante este período tem acesso a todas as funcionalidades sem restrições.

### Subscrição ativa

Após o período de avaliação, é necessária uma subscrição ativa para:
- Manter ligações automáticas a bancos
- Receber atualizações diárias de transações e saldos

Sem subscrição ativa, as contas manuais (importação de ficheiros) continuam a funcionar.

### Gerir a subscrição

Aceda a **O meu perfil** → separador **Subscrição** para:
- Ver o estado atual da subscrição
- Subscrever ou renovar
- Adicionar contas automáticas extra (além das incluídas no plano base)

Cada plano base inclui 2 contas automáticas. Pode adicionar mais contas por um custo mensal reduzido adicional.

---

## Suporte

Se tiver dúvidas que esta página não responde, ou se encontrar algum problema:

- 🐛 **Reportar um erro** — abra um issue no repositório público
- 💡 **Sugerir uma funcionalidade** — partilhe as suas ideias
- 💬 **GitHub Discussions** — participe na comunidade em [github.com/kal001/eurodata-public/discussions](https://github.com/kal001/eurodata-public/discussions)

---
