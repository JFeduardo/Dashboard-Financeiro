# Dashboard Financeiro

Aplicação web para controlar receitas e despesas: mostra o saldo, gráficos por categoria e por mês, orçamentos com alertas, meta de economia e importação/exportação em CSV. Os dados ficam salvos no próprio navegador.

## Funcionalidades

- **Transações:** cadastrar, editar e excluir receitas e despesas, com categoria e data
- **Parcelas e recorrência:** uma transação pode se repetir por vários meses (ex.: "Notebook (1/6)")
- **Filtros:** por mês, por categoria e busca por descrição (ignora acentos e maiúsculas)
- **Resumo:** saldo, receitas, despesas e comparação com o mês anterior
- **Gráficos:** despesas por categoria (barras e pizza), evolução mês a mês (linha) e comparativo entre meses
- **Orçamento por categoria:** limite mensal com aviso ao chegar em 80% e alerta ao estourar
- **Meta de economia:** progresso mensal em relação ao valor que se quer guardar
- **CSV:** exportar todas as transações e importar um arquivo (linhas inválidas são ignoradas e listadas)
- **Validação:** formulário e importação conferidos com Zod, com mensagens de erro claras

## Tecnologias

- [Next.js](https://nextjs.org/) (App Router) e [React](https://react.dev/)
- [TypeScript](https://www.typescriptlang.org/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Recharts](https://recharts.org/) para os gráficos
- [Zod](https://zod.dev/) para validação de dados
- [Vitest](https://vitest.dev/) e [Testing Library](https://testing-library.com/) para testes
- GitHub Actions para integração contínua

## Como rodar

Requisito: Node.js 20 ou superior.

```bash
npm install
npm run dev
```

Abra `http://localhost:3000` no navegador.

### Scripts

| Comando | O que faz |
| --- | --- |
| `npm run dev` | Servidor de desenvolvimento |
| `npm run build` | Build de produção |
| `npm test` | Roda os testes uma vez |
| `npm run test:watch` | Roda os testes e repete a cada alteração |
| `npm run lint` | Verifica o código com o ESLint |

## Estrutura do projeto

```
app/            páginas e layout (Next.js)
components/     componentes de tela (formulário, lista, gráficos, painéis)
context/        FinanceContext: estado compartilhado com useReducer + Context
hooks/          useDashboardData: cálculos derivados com useMemo
lib/            funções puras: finanças, datas, formatação, CSV, validação, armazenamento
types/          tipos do TypeScript
tests/          testes unitários e de integração
```

## Decisões de projeto

- **Lógica fora dos componentes.** Os cálculos (totais, agrupamentos, comparações, orçamentos, parcelas) são funções puras em `lib/finance.ts`, sem React. Isso facilita testar e reutilizar.
- **Estado com `useReducer` e Context.** Todas as alterações passam por um reducer (`lib/reducer.ts`), uma função pura que recebe o estado e uma ação e devolve o novo estado. O Context entrega esse estado a qualquer componente sem repassar props.
- **Dados validados ao entrar.** O que vem do formulário, de um CSV ou do `localStorage` passa por um schema do Zod. Dados corrompidos são descartados em vez de quebrar a tela.
- **Persistência no `localStorage`.** A leitura acontece em um efeito, depois que a página abre no navegador, para que servidor e navegador renderizem o mesmo conteúdo inicial.
- **Mês de referência.** Orçamentos, meta e comparação usam o mês escolhido ou, em "Todos", o mês mais recente com dados.

## Testes

Os testes cobrem as funções de cálculo, o CSV, a validação, o reducer, o formulário e o fluxo completo da aplicação (adicionar, editar, excluir, filtrar, parcelar, orçamento e meta).

```bash
npm test
```

## Limitações e próximos passos

- Os dados ficam apenas no navegador em que foram cadastrados e não são criptografados
- Back-end com banco de dados e login para sincronizar entre aparelhos
- Categorias personalizadas pelo usuário
