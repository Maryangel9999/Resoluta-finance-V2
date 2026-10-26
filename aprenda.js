/* ==========================================================================
   Resoluta Finance — Área Educativa "Aprenda"
   Cinco módulos com aulas, exercícios, glossário e questionários interativos.
   ========================================================================== */
(function () {
  'use strict';

  var STORAGE_KEY = 'resoluta_learn_progress_v1';

  /* ======================================================================
     CONTEÚDO — 5 MÓDULOS
     ====================================================================== */
  var MODULES = [
    {
      id: 'fundamentos',
      icon: 'fa-seedling',
      title: 'Fundamentos da Gestão Financeira',
      desc: 'A base de tudo: por que organizar o dinheiro do negócio muda o jogo.',
      lessons: [
        {
          title: 'Separe o caixa do negócio do seu bolso',
          minutes: 4,
          html:
            '<p>O primeiro passo para qualquer negócio saudável é <strong>separar o dinheiro da empresa do dinheiro pessoal</strong>. Quando tudo fica na mesma conta, você perde a noção do que é lucro e do que é consumo próprio — e o negócio parece lucrativo quando, na verdade, está apenas pagando as suas contas pessoais.</p>' +
            '<p>Defina um <strong>pró-labore</strong>: um valor fixo mensal que você retira como remuneração pelo seu trabalho. Ele é uma <em>despesa</em> do negócio, assim como o aluguel ou a energia. O restante que sobra é lucro — e lucro é o que permite reinvestir, crescer e formar reserva.</p>' +
            '<div class="lesson-callout"><i class="fa-solid fa-lightbulb" aria-hidden="true"></i><div><strong>Dica prática:</strong> abra uma conta (ou pelo menos uma carteira digital) exclusiva para o negócio. Todo dinheiro que entra e sai do negócio passa por lá.</div></div>' +
            '<ul><li>Anote <strong>todas</strong> as entradas e saídas, mesmo as pequenas.</li><li>Pague-se um pró-labore fixo em vez de tirar dinheiro solto.</li><li>Nunca use o cartão do negócio para despesas pessoais.</li></ul>'
        },
        {
          title: 'Receita, custo, despesa e lucro',
          minutes: 5,
          html:
            '<p>Esses quatro conceitos aparecem em todo lugar, mas muita gente confunde. Veja a diferença:</p>' +
            '<ul>' +
            '<li><strong>Receita:</strong> é tudo o que você vende. Se vendeu R$ 5.000 no mês, sua receita é R$ 5.000 — mesmo que ainda não tenha recebido.</li>' +
            '<li><strong>Custo:</strong> gasto ligado <em>diretamente</em> ao que você vende. Ex.: a farinha e o recheio do bolo, a peça que você revende, o material do artesanato.</li>' +
            '<li><strong>Despesa:</strong> gasto para <em>manter o negócio funcionando</em>, independente de vender mais ou menos. Ex.: aluguel, internet, energia, pró-labore, contador.</li>' +
            '<li><strong>Lucro:</strong> o que sobra depois de pagar custos e despesas. <strong>Lucro = Receita − Custos − Despesas.</strong></li>' +
            '</ul>' +
            '<div class="lesson-callout"><i class="fa-solid fa-calculator" aria-hidden="true"></i><div><strong>Exemplo:</strong> receita de R$ 5.000, custos de R$ 2.000 e despesas de R$ 1.800 → lucro de <strong>R$ 1.200</strong>.</div></div>' +
            '<p>Vender muito não garante lucro. É possível faturar alto e ainda assim perder dinheiro se os custos e as despesas comerem toda a receita.</p>'
        },
        {
          title: 'O ciclo do dinheiro no negócio',
          minutes: 4,
          html:
            '<p>O dinheiro do seu negócio percorre um ciclo. Entendê-lo ajuda a prever quando o caixa vai apertar:</p>' +
            '<ol><li>Você <strong>compra</strong> insumos ou mercadorias (saída de dinheiro).</li><li><strong>Produz</strong> ou organiza o que vai vender.</li><li><strong>Vende</strong> — e aqui nasce a receita.</li><li><strong>Recebe</strong> o pagamento (à vista ou a prazo).</li><li><strong>Paga</strong> fornecedores, contas e impostos.</li><li><strong>Reinveste</strong> o lucro para crescer.</li></ol>' +
            '<p>O ponto crítico é o intervalo entre <em>pagar</em> e <em>receber</em>. Se você paga o fornecedor hoje e só recebe em 30 dias, precisa de dinheiro para cobrir esse vão — é para isso que serve o <strong>capital de giro</strong>, que você verá no módulo 4.</p>' +
            '<div class="lesson-callout"><i class="fa-solid fa-clock" aria-hidden="true"></i><div><strong>Atenção:</strong> quanto maior o prazo que você dá ao cliente e menor o prazo que o fornecedor te dá, maior a necessidade de caixa.</div></div>'
        }
      ],
      exercise: {
        type: 'classify',
        prompt: 'Classifique cada item como Custo, Despesa ou Receita.',
        options: ['Custo', 'Despesa', 'Receita'],
        items: [
          { text: 'Farinha comprada para fazer os bolos', answer: 'Custo' },
          { text: 'Aluguel do ponto comercial', answer: 'Despesa' },
          { text: 'Valor recebido pela venda de 30 doces', answer: 'Receita' },
          { text: 'Conta de internet do negócio', answer: 'Despesa' },
          { text: 'Embalagens usadas em cada produto', answer: 'Custo' }
        ],
        explain: 'Custos estão ligados diretamente ao produto vendido; despesas mantêm o negócio funcionando; receita é o valor das vendas.'
      },
      quiz: [
        { q: 'O que é o pró-labore?', options: ['O lucro final do negócio', 'A remuneração fixa do dono pelo seu trabalho', 'Um imposto mensal'], answer: 1, explain: 'O pró-labore é a retirada fixa do dono e deve ser tratado como despesa do negócio.' },
        { q: 'Qual a fórmula do lucro?', options: ['Receita − Custos − Despesas', 'Receita + Custos', 'Despesas − Receita'], answer: 0, explain: 'Lucro é o que sobra da receita após pagar custos e despesas.' },
        { q: 'Por que separar o dinheiro pessoal do dinheiro do negócio?', options: ['Para pagar menos imposto', 'Para enxergar o lucro real e tomar decisões melhores', 'Porque o banco exige'], answer: 1, explain: 'A separação revela o lucro verdadeiro e evita confundir consumo pessoal com resultado do negócio.' }
      ]
    },

    {
      id: 'custos',
      icon: 'fa-calculator',
      title: 'Custos, Despesas e Formação de Preço',
      desc: 'Aprenda a somar tudo o que o seu produto realmente custa antes de definir o preço.',
      lessons: [
        {
          title: 'Custos fixos e variáveis',
          minutes: 4,
          html:
            '<p>Os custos e despesas se dividem em dois grandes grupos, e essa divisão é essencial para precificar e calcular o ponto de equilíbrio:</p>' +
            '<ul>' +
            '<li><strong>Fixos:</strong> não mudam com a quantidade vendida. Aluguel, internet, salários, pró-labore. Se você vender 10 ou 1.000 unidades, o aluguel é o mesmo.</li>' +
            '<li><strong>Variáveis:</strong> acompanham o volume. Matéria-prima, embalagem, comissão de venda, taxa de cartão. Vendeu mais? O custo variável sobe na mesma proporção.</li>' +
            '</ul>' +
            '<div class="lesson-callout"><i class="fa-solid fa-lightbulb" aria-hidden="true"></i><div><strong>Regra de bolso:</strong> se o gasto aumenta quando você vende mais, é variável. Se continua igual, é fixo.</div></div>'
        },
        {
          title: 'Custos diretos e indiretos',
          minutes: 4,
          html:
            '<p>Além de fixos e variáveis, os custos podem ser <strong>diretos</strong> ou <strong>indiretos</strong>:</p>' +
            '<ul><li><strong>Diretos:</strong> dá para medir quanto cada produto consome. Ex.: 200 g de farinha por bolo.</li>' +
            '<li><strong>Indiretos:</strong> não dá para separar facilmente por produto. Ex.: a energia da cozinha, o aluguel, a internet. Precisamos <em>ratear</em> (dividir) esses valores entre os produtos.</li></ul>' +
            '<p>Uma forma simples de ratear é dividir o total das despesas fixas pelo número de produtos vendidos no mês, chegando a um <strong>custo fixo por unidade</strong>. É esse valor que entra na conta do preço.</p>' +
            '<div class="lesson-callout"><i class="fa-solid fa-calculator" aria-hidden="true"></i><div><strong>Exemplo:</strong> despesas fixas de R$ 1.200 e 100 unidades vendidas → R$ 12,00 de custo fixo por unidade.</div></div>'
        },
        {
          title: 'Como as despesas fixas entram no preço',
          minutes: 5,
          html:
            '<p>Muita gente precifica olhando só o custo da matéria-prima e esquece as despesas fixas — e depois se pergunta por que o dinheiro não sobra. O preço precisa cobrir <strong>tudo</strong>:</p>' +
            '<ol><li>Custo direto (matéria-prima, embalagem).</li><li>Parte das despesas variáveis (impostos, taxa de cartão, comissão).</li><li>Parte das despesas fixas (rateio).</li><li>E ainda gerar <strong>lucro</strong>.</li></ol>' +
            '<p>Uma forma prática de transformar isso em percentuais é usar o <strong>markup</strong>, que você aprende no módulo 3. Antes disso, o importante é ter clareza de todos os números que compõem o seu custo.</p>' +
            '<div class="lesson-callout"><i class="fa-solid fa-triangle-exclamation" aria-hidden="true"></i><div><strong>Erro comum:</strong> precificar só pelo custo direto. O preço fica bonito na etiqueta, mas o negócio não paga as próprias contas.</div></div>'
        }
      ],
      exercise: {
        type: 'calc',
        prompt: 'Você vende 200 unidades por mês. Calcule o custo por unidade e o custo total.',
        fields: [
          { id: 'ex2a', label: 'Custo direto por unidade (R$)', answer: 6, tolerance: 0.01 },
          { id: 'ex2b', label: 'Despesas fixas totais do mês (R$)', answer: 1000, tolerance: 0.01 },
          { id: 'ex2c', label: 'Custo fixo por unidade (R$) — despesas fixas ÷ 200', answer: 5, tolerance: 0.01 },
          { id: 'ex2d', label: 'Custo total por unidade (R$) — direto + fixo unitário', answer: 11, tolerance: 0.01 }
        ],
        explain: 'Custo fixo por unidade = 1000 ÷ 200 = R$ 5,00. Custo total por unidade = 6 + 5 = R$ 11,00.'
      },
      quiz: [
        { q: 'Qual destes é um custo variável?', options: ['Aluguel', 'Embalagem por unidade', 'Internet'], answer: 1, explain: 'A embalagem acompanha o volume vendido, então é variável.' },
        { q: 'O que significa ratear despesas fixas?', options: ['Aumentar o preço', 'Dividir o valor fixo entre as unidades vendidas', 'Eliminar custos'], answer: 1, explain: 'Ratear é distribuir o total fixo por unidade para saber quanto cada produto precisa cobrir.' },
        { q: 'Precificar apenas pelo custo direto leva a quê?', options: ['A preços que não cobrem as despesas fixas', 'A mais lucro', 'A menos imposto'], answer: 0, explain: 'Sem incluir despesas fixas e variáveis, o preço pode não pagar as contas do negócio.' }
      ]
    },

    {
      id: 'precificacao',
      icon: 'fa-tags',
      title: 'Precificação e Markup',
      desc: 'O módulo mais pedido: defina o preço de venda com segurança usando markup.',
      lessons: [
        {
          title: 'O que é markup e por que usá-lo',
          minutes: 5,
          html:
            '<p><strong>Markup</strong> é um índice aplicado sobre o custo para chegar ao preço de venda. Ele já embute as despesas variáveis, as despesas fixas e a margem de lucro que você deseja. É a ferramenta mais simples e poderosa para precificar.</p>' +
            '<p>Em vez de chutar um preço, você calcula. Assim, cada venda contribui para pagar as contas e ainda sobra lucro — exatamente o que o negócio precisa.</p>' +
            '<div class="lesson-callout"><i class="fa-solid fa-lightbulb" aria-hidden="true"></i><div><strong>Pense assim:</strong> o markup responde à pergunta "por quanto eu preciso vender para que sobre dinheiro no fim do mês?".</div></div>'
        },
        {
          title: 'Markup divisor e multiplicador',
          minutes: 6,
          html:
            '<p>Existem duas formas de representar o markup, e elas se completam:</p>' +
            '<div class="lesson-formula"><strong>Markup Divisor</strong> = 1 − (% Despesas Variáveis + % Despesas Fixas + % Lucro Desejado)</div>' +
            '<div class="lesson-formula"><strong>Markup Multiplicador</strong> = 1 ÷ Markup Divisor</div>' +
            '<div class="lesson-formula"><strong>Preço de Venda</strong> = Custo Direto Unitário ÷ Markup Divisor</div>' +
            '<p>As porcentagens são escritas em decimal (8% = 0,08). Veja um exemplo completo:</p>' +
            '<ul><li>Custo direto: R$ 12,00</li><li>Despesas variáveis: 8%</li><li>Despesas fixas: 12%</li><li>Lucro desejado: 20%</li></ul>' +
            '<p>Markup divisor = 1 − (0,08 + 0,12 + 0,20) = 1 − 0,40 = <strong>0,60</strong>. Multiplicador = 1 ÷ 0,60 = <strong>1,6667</strong>. Preço = 12 ÷ 0,60 = <strong>R$ 20,00</strong>.</p>' +
            '<div class="lesson-callout"><i class="fa-solid fa-triangle-exclamation" aria-hidden="true"></i><div><strong>Cuidado:</strong> se a soma dos percentuais chegar a 100% ou mais, o markup divisor fica zero ou negativo — significa que o preço seria impossível. Revise suas margens.</div></div>'
        },
        {
          title: 'Passo a passo para precificar',
          minutes: 5,
          html:
            '<p>Siga esta sequência para nunca errar no preço:</p>' +
            '<ol><li><strong>Some o custo direto</strong> de uma unidade (matéria-prima + embalagem).</li><li><strong>Levante os percentuais</strong>: despesas variáveis (impostos, taxa de cartão, comissão) e despesas fixas rateadas.</li><li><strong>Defina a margem de lucro</strong> que você quer ganhar.</li><li><strong>Calcule o markup divisor</strong> com a fórmula.</li><li><strong>Divida o custo pelo divisor</strong> e encontre o preço.</li><li><strong>Confira o mercado</strong>: o preço é competitivo? Se não, ajuste custos ou margem — nunca venda abaixo do custo.</li></ol>' +
            '<div class="lesson-callout"><i class="fa-solid fa-rocket" aria-hidden="true"></i><div><strong>Atalho:</strong> use a <a href="app.html#precificacao">Calculadora de Markup</a> da Resoluta Finance para fazer essa conta em segundos, já com todos os campos.</div></div>'
        },
        {
          title: 'Erros comuns ao precificar',
          minutes: 4,
          html:
            '<p>Evite as armadilhas que mais destroem a margem dos pequenos negócios:</p>' +
            '<ul>' +
            '<li><strong>Copiar o preço do concorrente</strong> sem saber o custo dele (nem o seu).</li>' +
            '<li><strong>Esquecer as despesas variáveis</strong>, como a taxa da maquininha, que pode passar de 3%.</li>' +
            '<li><strong>Dar desconto sobre o preço de venda</strong> sem checar se ainda cobre o custo.</li>' +
            '<li><strong>Não reajustar</strong> quando a matéria-prima sobe.</li>' +
            '<li><strong>Confundir margem com markup</strong> — são coisas diferentes.</li>' +
            '</ul>' +
            '<div class="lesson-callout"><i class="fa-solid fa-lightbulb" aria-hidden="true"></i><div><strong>Margem x markup:</strong> o markup é aplicado sobre o <em>custo</em>; a margem é calculada sobre o <em>preço de venda</em>. Por isso os números não são iguais.</div></div>'
        }
      ],
      exercise: {
        type: 'calc',
        prompt: 'Calcule o preço de venda usando markup. Custo direto de R$ 12,00; despesas variáveis 8%; despesas fixas 12%; lucro desejado 20%.',
        fields: [
          { id: 'ex3a', label: 'Markup divisor (ex.: 0,60)', answer: 0.6, tolerance: 0.005 },
          { id: 'ex3b', label: 'Markup multiplicador (ex.: 1,6667)', answer: 1.6667, tolerance: 0.01 },
          { id: 'ex3c', label: 'Preço de venda sugerido (R$)', answer: 20, tolerance: 0.05 }
        ],
        explain: 'Divisor = 1 − (0,08 + 0,12 + 0,20) = 0,60. Multiplicador = 1 ÷ 0,60 = 1,6667. Preço = 12 ÷ 0,60 = R$ 20,00.'
      },
      quiz: [
        { q: 'Qual é a fórmula do markup divisor?', options: ['1 + (custos + lucro)', '1 − (% variáveis + % fixas + % lucro)', 'Custo ÷ preço'], answer: 1, explain: 'Subtrai-se de 1 a soma dos percentuais de despesas e do lucro desejado.' },
        { q: 'Com custo de R$ 30 e markup divisor de 0,75, qual o preço?', options: ['R$ 40,00', 'R$ 22,50', 'R$ 37,50'], answer: 0, explain: 'Preço = 30 ÷ 0,75 = R$ 40,00.' },
        { q: 'O que acontece se a soma dos percentuais chegar a 100%?', options: ['O preço dobra', 'O markup divisor fica zero e o preço é impossível', 'Nada muda'], answer: 1, explain: 'Divisor igual a zero torna o cálculo inválido — é preciso rever as margens.' }
      ]
    },

    {
      id: 'fluxo',
      icon: 'fa-money-bill-trend-up',
      title: 'Fluxo de Caixa e Capital de Giro',
      desc: 'Controle o dinheiro que entra e sai e nunca mais seja pego de surpresa.',
      lessons: [
        {
          title: 'Fluxo de caixa: realizado e projetado',
          minutes: 5,
          html:
            '<p>O <strong>fluxo de caixa</strong> é o registro de todo o dinheiro que entra e sai do negócio, organizado por data. Ele mostra a realidade do seu caixa — diferente do lucro, que é um conceito contábil.</p>' +
            '<ul>' +
            '<li><strong>Realizado:</strong> o que já aconteceu. Entradas e saídas efetivamente pagas e recebidas.</li>' +
            '<li><strong>Projetado:</strong> o que ainda vai acontecer. Contas a pagar e a receber com data futura.</li>' +
            '</ul>' +
            '<p>Olhar os dois juntos permite antecipar os dias em que o saldo pode ficar negativo e agir antes — negociando prazos, antecipando recebíveis ou segurando compras.</p>' +
            '<div class="lesson-callout"><i class="fa-solid fa-lightbulb" aria-hidden="true"></i><div><strong>Regra de ouro:</strong> registre o dinheiro na data em que ele efetivamente entra ou sai, não na data da venda.</div></div>'
        },
        {
          title: 'Capital de giro líquido (CGL)',
          minutes: 5,
          html:
            '<p>O <strong>capital de giro líquido</strong> mede se o negócio tem recursos de curto prazo suficientes para honrar suas obrigações de curto prazo:</p>' +
            '<div class="lesson-formula"><strong>CGL = Ativo Circulante − Passivo Circulante</strong></div>' +
            '<ul><li><strong>Ativo circulante:</strong> dinheiro em caixa, contas a receber, estoques — o que vira dinheiro em até 12 meses.</li><li><strong>Passivo circulante:</strong> contas a pagar, empréstimos e impostos de curto prazo.</li></ul>' +
            '<p>Se o CGL é <strong>positivo</strong>, sobra folga. Se é <strong>negativo</strong>, o negócio depende de dívidas para se manter — um sinal de alerta.</p>' +
            '<div class="lesson-callout"><i class="fa-solid fa-calculator" aria-hidden="true"></i><div><strong>Exemplo:</strong> ativo circulante de R$ 8.000 e passivo de R$ 5.000 → CGL de <strong>R$ 3.000</strong>.</div></div>'
        },
        {
          title: 'Evite o aperto de caixa',
          minutes: 4,
          html:
            '<p>O famoso "apertou o caixa" quase sempre tem as mesmas causas — e soluções conhecidas:</p>' +
            '<ul>' +
            '<li><strong>Prazos desalinhados:</strong> você paga rápido e recebe devagar. Negocie prazo com fornecedores ou cobre uma parte à vista.</li>' +
            '<li><strong>Estoque parado:</strong> dinheiro preso em mercadoria que não gira. Reduza compras do que vende pouco.</li>' +
            '<li><strong>Despesas fora de controle:</strong> pequenos gastos recorrentes somam muito no fim do mês.</li>' +
            '<li><strong>Falta de reserva:</strong> monte um caixa de emergência para meses fracos.</li>' +
            '</ul>' +
            '<div class="lesson-callout"><i class="fa-solid fa-shield-halved" aria-hidden="true"></i><div><strong>Meta:</strong> ter sempre de 1 a 3 meses de despesas fixas guardados como reserva de emergência.</div></div>'
        }
      ],
      exercise: {
        type: 'calc',
        prompt: 'Calcule o capital de giro líquido. Ativo circulante de R$ 8.000 (caixa + a receber + estoque); passivo circulante de R$ 5.000.',
        fields: [
          { id: 'ex4a', label: 'Capital de giro líquido (R$)', answer: 3000, tolerance: 0.5 }
        ],
        explain: 'CGL = 8.000 − 5.000 = R$ 3.000 (positivo, portanto há folga de curto prazo).'
      },
      quiz: [
        { q: 'Qual a diferença entre fluxo realizado e projetado?', options: ['Realizado já aconteceu; projetado é futuro', 'São iguais', 'Projetado é o lucro'], answer: 0, explain: 'O realizado registra o que já ocorreu; o projetado inclui lançamentos futuros.' },
        { q: 'Como se calcula o capital de giro líquido?', options: ['Ativo circulante − Passivo circulante', 'Receita − Despesas', 'Custo ÷ preço'], answer: 0, explain: 'CGL = ativo circulante menos passivo circulante.' },
        { q: 'Um CGL negativo indica o quê?', options: ['Muita folga de caixa', 'Dependência de dívidas de curto prazo', 'Lucro alto'], answer: 1, explain: 'CGL negativo significa que as obrigações de curto prazo superam os recursos disponíveis.' }
      ]
    },

    {
      id: 'planejamento',
      icon: 'fa-bullseye',
      title: 'Planejamento, Metas e Indicadores',
      desc: 'Transforme os números em decisões: metas, ponto de equilíbrio e indicadores.',
      lessons: [
        {
          title: 'Margem de contribuição e ponto de equilíbrio',
          minutes: 6,
          html:
            '<p>A <strong>margem de contribuição</strong> é o que sobra de cada venda depois de pagar os custos e despesas variáveis. É ela que "contribui" para pagar as despesas fixas e gerar lucro:</p>' +
            '<div class="lesson-formula"><strong>Margem de Contribuição = Receita − Custos e Despesas Variáveis</strong></div>' +
            '<p>O <strong>índice de margem de contribuição</strong> é essa margem dividida pela receita. Com ele, calculamos o <strong>ponto de equilíbrio</strong> — quanto você precisa faturar para não ter lucro nem prejuízo:</p>' +
            '<div class="lesson-formula"><strong>Ponto de Equilíbrio (R$) = Despesas Fixas ÷ Índice de Margem de Contribuição</strong></div>' +
            '<div class="lesson-callout"><i class="fa-solid fa-calculator" aria-hidden="true"></i><div><strong>Exemplo:</strong> despesas fixas de R$ 3.000 e índice de margem de contribuição de 60% → ponto de equilíbrio de R$ 5.000. Tudo o que vender acima disso é lucro.</div></div>' +
            '<p>Se a margem de contribuição for negativa, cada venda aumenta o prejuízo — sinal de que o preço está abaixo do custo variável.</p>'
        },
        {
          title: 'Metas que funcionam',
          minutes: 4,
          html:
            '<p>Uma meta vaga ("quero vender mais") não orienta nenhuma decisão. Use metas <strong>SMART</strong>:</p>' +
            '<ul><li><strong>S</strong> — Específica: o que exatamente você quer?</li><li><strong>M</strong> — Mensurável: qual o número?</li><li><strong>A</strong> — Alcançável: é realista com seus recursos?</li><li><strong>R</strong> — Relevante: faz sentido para o negócio?</li><li><strong>T</strong> — Temporal: até quando?</li></ul>' +
            '<p>Exemplo de meta SMART: "faturar R$ 15.000 em outubro, 20% acima de setembro, aumentando o ticket médio com combos".</p>' +
            '<div class="lesson-callout"><i class="fa-solid fa-bullseye" aria-hidden="true"></i><div><strong>Acompanhe:</strong> use o módulo <a href="app.html#metas">Planejamento e Metas</a> para ver o progresso percentual e saber se você está no ritmo certo.</div></div>'
        },
        {
          title: 'Indicadores do dia a dia',
          minutes: 5,
          html:
            '<p>Não dá para melhorar o que não se mede. Estes indicadores são simples e reveladores:</p>' +
            '<ul>' +
            '<li><strong>Ticket médio:</strong> faturamento ÷ número de vendas. Quanto cada cliente gasta em média.</li>' +
            '<li><strong>Margem de lucro:</strong> lucro ÷ receita. Quanto de cada real vendido vira lucro.</li>' +
            '<li><strong>Ponto de equilíbrio:</strong> o mínimo que você precisa faturar.</li>' +
            '<li><strong>Capital de giro líquido:</strong> sua folga de curto prazo.</li>' +
            '<li><strong>Prazo médio de recebimento:</strong> em quantos dias você recebe.</li>' +
            '</ul>' +
            '<div class="lesson-callout"><i class="fa-solid fa-chart-line" aria-hidden="true"></i><div><strong>Ritual saudável:</strong> reserve 30 minutos por semana para revisar esses números e tomar decisões com base neles.</div></div>'
        }
      ],
      exercise: {
        type: 'calc',
        prompt: 'Calcule o ponto de equilíbrio. Despesas fixas de R$ 3.000 e índice de margem de contribuição de 60% (0,60).',
        fields: [
          { id: 'ex5a', label: 'Ponto de equilíbrio (R$)', answer: 5000, tolerance: 1 }
        ],
        explain: 'Ponto de equilíbrio = 3.000 ÷ 0,60 = R$ 5.000,00.'
      },
      quiz: [
        { q: 'O que a margem de contribuição representa?', options: ['O que sobra da venda após os custos variáveis', 'O lucro final', 'O imposto'], answer: 0, explain: 'É o valor que contribui para pagar as despesas fixas e gerar lucro.' },
        { q: 'Qual a fórmula do ponto de equilíbrio em reais?', options: ['Despesas fixas ÷ índice de margem de contribuição', 'Receita × lucro', 'Custo + preço'], answer: 0, explain: 'Divide-se o total das despesas fixas pelo índice de margem de contribuição.' },
        { q: 'Uma meta SMART precisa ser, entre outras coisas:', options: ['Vaga e flexível', 'Mensurável e com prazo', 'Secreta'], answer: 1, explain: 'Metas eficazes são mensuráveis e têm prazo definido.' }
      ]
    }
  ];

  /* ======================================================================
     GLOSSÁRIO
     ====================================================================== */
  var GLOSSARY = [
    { term: 'Markup', def: 'Índice aplicado sobre o custo para chegar ao preço de venda, já embutindo despesas variáveis, fixas e lucro desejado.' },
    { term: 'Margem de lucro', def: 'Percentual do lucro em relação à receita. Lucro ÷ Receita.' },
    { term: 'Margem de contribuição', def: 'O que sobra da venda após descontar custos e despesas variáveis. Contribui para pagar as despesas fixas.' },
    { term: 'Ponto de equilíbrio', def: 'Faturamento mínimo necessário para cobrir todos os custos e despesas, sem lucro nem prejuízo.' },
    { term: 'Custo fixo', def: 'Gasto que não muda com a quantidade vendida, como aluguel e internet.' },
    { term: 'Custo variável', def: 'Gasto que acompanha o volume vendido, como matéria-prima e embalagem.' },
    { term: 'Custo direto', def: 'Custo possível de medir por produto, como a farinha de cada bolo.' },
    { term: 'Custo indireto', def: 'Custo que não se separa facilmente por produto e precisa ser rateado, como a energia da cozinha.' },
    { term: 'Despesa', def: 'Gasto para manter o negócio funcionando, independente do volume de vendas.' },
    { term: 'Receita', def: 'Total vendido em um período, independente de já ter sido recebido.' },
    { term: 'Lucro', def: 'O que sobra após pagar custos e despesas: Receita − Custos − Despesas.' },
    { term: 'Fluxo de caixa', def: 'Registro de todas as entradas e saídas de dinheiro do negócio, por data.' },
    { term: 'Capital de giro líquido', def: 'Ativo circulante menos passivo circulante. Mede a folga financeira de curto prazo.' },
    { term: 'Ativo circulante', def: 'Recursos que viram dinheiro em até 12 meses: caixa, contas a receber e estoques.' },
    { term: 'Passivo circulante', def: 'Obrigações de curto prazo: contas a pagar, empréstimos e impostos.' },
    { term: 'Ticket médio', def: 'Valor médio gasto por cliente: Faturamento ÷ Número de vendas.' },
    { term: 'Pró-labore', def: 'Remuneração fixa do dono pelo seu trabalho no negócio; é uma despesa.' },
    { term: 'Rateio', def: 'Divisão de um custo ou despesa indireta entre os produtos ou unidades.' },
    { term: 'Markup multiplicador', def: '1 dividido pelo markup divisor. Multiplica o custo para achar o preço.' },
    { term: 'Reserva de emergência', def: 'Dinheiro guardado para cobrir meses fracos ou imprevistos, idealmente de 1 a 3 meses de despesas fixas.' }
  ];

  /* ======================================================================
     ESTADO / PROGRESSO
     ====================================================================== */
  function load() {
    try {
      var raw = JSON.parse(localStorage.getItem(STORAGE_KEY));
      if (raw && raw.lessons && raw.quizzes) { if (!raw.module) raw.module = MODULES[0].id; return raw; }
    } catch (e) {}
    return { module: MODULES[0].id, lessons: {}, quizzes: {} };
  }
  function save() { try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); } catch (e) {} }
  var state = load();

  function totalLessons() { var n = 0; MODULES.forEach(function (m) { n += m.lessons.length; }); return n; }
  function doneLessons() { var n = 0; Object.keys(state.lessons).forEach(function (k) { if (state.lessons[k]) n++; }); return n; }
  function quizCount() { var n = 0; Object.keys(state.quizzes).forEach(function (k) { if (state.quizzes[k] && state.quizzes[k].done) n++; }); return n; }

  function esc(s) { return (window.ResolutaAuth && window.ResolutaAuth.sanitize) ? window.ResolutaAuth.sanitize(s == null ? '' : s) : String(s == null ? '' : s); }

  /* ======================================================================
     RENDER — NAVEGAÇÃO DE MÓDULOS
     ====================================================================== */
  function moduleProgress(m) {
    var done = 0;
    m.lessons.forEach(function (l, i) { if (state.lessons[m.id + ':' + i]) done++; });
    return { done: done, total: m.lessons.length, pct: Math.round((done / m.lessons.length) * 100) };
  }

  function renderNav() {
    var nav = document.getElementById('learnNav');
    if (!nav) return;
    var html = '<div class="learn-nav-title"><i class="fa-solid fa-list-check" aria-hidden="true"></i> Módulos</div>';
    MODULES.forEach(function (m, idx) {
      var p = moduleProgress(m);
      var active = state.module === m.id ? ' active' : '';
      html += '<button type="button" class="learn-nav-item' + active + '" data-module="' + m.id + '" aria-current="' + (state.module === m.id ? 'true' : 'false') + '">' +
        '<span class="lni-ico"><i class="fa-solid ' + m.icon + '" aria-hidden="true"></i></span>' +
        '<span class="lni-text"><strong>' + (idx + 1) + '. ' + esc(m.title) + '</strong>' +
        '<span class="lni-bar"><span style="width:' + p.pct + '%"></span></span>' +
        '<span class="lni-meta">' + p.done + '/' + p.total + ' aulas · ' + p.pct + '%</span></span>' +
        (p.pct === 100 ? '<i class="fa-solid fa-circle-check lni-done" aria-label="Módulo concluído"></i>' : '') +
        '</button>';
    });
    nav.innerHTML = html;
    nav.querySelectorAll('[data-module]').forEach(function (b) {
      b.addEventListener('click', function () { goModule(b.getAttribute('data-module')); });
    });
  }

  function goModule(id) {
    state.module = id; save(); renderNav(); renderModule();
    var content = document.getElementById('learnContent');
    if (content && window.matchMedia('(max-width: 900px)').matches) {
      document.getElementById('trilha').scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  /* ======================================================================
     RENDER — MÓDULO (aulas + exercício + quiz)
     ====================================================================== */
  function renderModule() {
    var wrap = document.getElementById('learnContent');
    if (!wrap) return;
    var m = null;
    MODULES.forEach(function (x) { if (x.id === state.module) m = x; });
    if (!m) { m = MODULES[0]; state.module = m.id; }
    var idx = MODULES.indexOf(m);

    var html = '<article class="learn-module">' +
      '<header class="learn-module-head">' +
      '<span class="learn-module-ico"><i class="fa-solid ' + m.icon + '" aria-hidden="true"></i></span>' +
      '<div><span class="learn-module-kicker">Módulo ' + (idx + 1) + ' de ' + MODULES.length + '</span>' +
      '<h2>' + esc(m.title) + '</h2><p>' + esc(m.desc) + '</p></div>' +
      '</header>';

    // Aulas
    html += '<div class="learn-lessons">';
    m.lessons.forEach(function (l, i) {
      var key = m.id + ':' + i;
      var done = !!state.lessons[key];
      html += '<section class="lesson' + (done ? ' done' : '') + '" data-lesson="' + key + '">' +
        '<div class="lesson-head">' +
        '<h3><span class="lesson-num">' + (i + 1) + '</span> ' + esc(l.title) + '</h3>' +
        '<div class="lesson-tools">' +
        '<span class="lesson-time"><i class="fa-regular fa-clock" aria-hidden="true"></i> ' + l.minutes + ' min</span>' +
        '<button type="button" class="lesson-listen" data-listen="' + key + '" aria-label="Ouvir esta aula em voz alta"><i class="fa-solid fa-volume-high" aria-hidden="true"></i> Ouvir</button>' +
        '</div></div>' +
        '<div class="lesson-body" id="body-' + key + '">' + l.html + '</div>' +
        '<div class="lesson-foot">' +
        '<button type="button" class="btn btn-sm ' + (done ? 'btn-ghost' : 'btn-primary') + ' lesson-complete" data-complete="' + key + '">' +
        '<i class="fa-solid ' + (done ? 'fa-rotate-left' : 'fa-check') + '" aria-hidden="true"></i> ' + (done ? 'Marcar como não lida' : 'Marcar aula como lida') +
        '</button></div></section>';
    });
    html += '</div>';

    // Exercício
    if (m.exercise) html += renderExercise(m.exercise, m.id);

    // Quiz
    if (m.quiz) html += renderQuiz(m.quiz, m.id);

    // Navegação entre módulos
    html += '<div class="learn-module-nav">' +
      (idx > 0 ? '<button type="button" class="btn btn-ghost" data-module="' + MODULES[idx - 1].id + '"><i class="fa-solid fa-arrow-left" aria-hidden="true"></i> Módulo anterior</button>' : '<span></span>') +
      (idx < MODULES.length - 1 ? '<button type="button" class="btn btn-primary" data-module="' + MODULES[idx + 1].id + '">Próximo módulo <i class="fa-solid fa-arrow-right" aria-hidden="true"></i></button>' : '<a class="btn btn-primary" href="#glossario">Ver glossário <i class="fa-solid fa-book" aria-hidden="true"></i></a>') +
      '</div></article>';

    wrap.innerHTML = html;
    bindModule(m);
    updateProgressUI();
  }

  function renderExercise(ex, mid) {
    var html = '<section class="learn-exercise" aria-label="Exercício prático">' +
      '<div class="learn-exercise-head"><i class="fa-solid fa-pen-ruler" aria-hidden="true"></i><div><h3>Exercício prático</h3><p>' + esc(ex.prompt) + '</p></div></div>';

    if (ex.type === 'classify') {
      html += '<div class="classify-list">';
      ex.items.forEach(function (it, i) {
        html += '<div class="classify-row" data-idx="' + i + '">' +
          '<span class="classify-text">' + esc(it.text) + '</span>' +
          '<select class="classify-select" aria-label="Classificação de: ' + esc(it.text) + '"><option value="">Escolha…</option>' +
          ex.options.map(function (o) { return '<option value="' + esc(o) + '">' + esc(o) + '</option>'; }).join('') +
          '</select><span class="classify-fb" aria-hidden="true"></span></div>';
      });
      html += '</div>';
    } else if (ex.type === 'calc') {
      html += '<div class="form-grid">';
      ex.fields.forEach(function (f) {
        html += '<div class="field"><label for="' + f.id + '">' + esc(f.label) + '</label>' +
          '<input type="number" step="any" id="' + f.id + '" inputmode="decimal" placeholder="0"><span class="calc-fb" aria-hidden="true"></span></div>';
      });
      html += '</div>';
    }

    html += '<div class="learn-exercise-foot">' +
      '<button type="button" class="btn btn-primary" data-check="' + mid + '"><i class="fa-solid fa-circle-check" aria-hidden="true"></i> Conferir respostas</button>' +
      '<button type="button" class="btn btn-ghost" data-retry="' + mid + '"><i class="fa-solid fa-rotate" aria-hidden="true"></i> Limpar</button>' +
      '</div><div class="learn-exercise-result" id="exResult-' + mid + '" role="status" aria-live="polite"></div></section>';
    return html;
  }

  function renderQuiz(quiz, mid) {
    var saved = state.quizzes[mid];
    var html = '<section class="learn-quiz" aria-label="Questionário do módulo">' +
      '<div class="learn-quiz-head"><i class="fa-solid fa-circle-question" aria-hidden="true"></i><div><h3>Questionário</h3><p>Escolha uma alternativa por pergunta e confira seu desempenho.</p></div></div>';
    quiz.forEach(function (q, qi) {
      html += '<fieldset class="quiz-q" data-q="' + qi + '"><legend>Pergunta ' + (qi + 1) + ' de ' + quiz.length + '</legend>' +
        '<p>' + esc(q.q) + '</p><div class="quiz-options">';
      q.options.forEach(function (o, oi) {
        html += '<label class="quiz-opt"><input type="radio" name="q-' + mid + '-' + qi + '" value="' + oi + '"> <span>' + esc(o) + '</span></label>';
      });
      html += '</div><div class="quiz-fb" id="fb-' + mid + '-' + qi + '" aria-live="polite"></div></fieldset>';
    });
    html += '<div class="learn-quiz-foot">' +
      '<button type="button" class="btn btn-primary" data-quizcheck="' + mid + '"><i class="fa-solid fa-check-double" aria-hidden="true"></i> Verificar respostas</button>' +
      '<button type="button" class="btn btn-ghost" data-quizretry="' + mid + '"><i class="fa-solid fa-rotate" aria-hidden="true"></i> Refazer</button>' +
      '</div><div class="learn-quiz-result" id="quizResult-' + mid + '" role="status" aria-live="polite">' +
      (saved && saved.done ? '<div class="alert alert-info"><i class="fa-solid fa-clock-rotate-left" aria-hidden="true"></i><div>Melhor resultado anterior: <strong>' + saved.score + '/' + saved.total + '</strong> acertos.</div></div>' : '') +
      '</div></section>';
    return html;
  }

  /* ======================================================================
     BIND — interações do módulo
     ====================================================================== */
  function bindModule(m) {
    // Marcar aula como lida
    document.querySelectorAll('[data-complete]').forEach(function (b) {
      b.addEventListener('click', function () {
        var key = b.getAttribute('data-complete');
        state.lessons[key] = !state.lessons[key];
        if (!state.lessons[key]) delete state.lessons[key];
        save();
        renderNav();
        // atualiza visual do botão e da seção sem re-renderizar tudo
        var sec = document.querySelector('[data-lesson="' + key + '"]');
        if (sec) {
          var isDone = !!state.lessons[key];
          sec.classList.toggle('done', isDone);
          b.className = 'btn btn-sm ' + (isDone ? 'btn-ghost' : 'btn-primary') + ' lesson-complete';
          b.innerHTML = '<i class="fa-solid ' + (isDone ? 'fa-rotate-left' : 'fa-check') + '" aria-hidden="true"></i> ' + (isDone ? 'Marcar como não lida' : 'Marcar aula como lida');
        }
        updateProgressUI();
      });
    });

    // Ouvir aula
    document.querySelectorAll('[data-listen]').forEach(function (b) {
      b.addEventListener('click', function () {
        var key = b.getAttribute('data-listen');
        var body = document.getElementById('body-' + key);
        if (!body) return;
        if (!('speechSynthesis' in window)) { b.innerHTML = '<i class="fa-solid fa-volume-xmark" aria-hidden="true"></i> Indisponível'; return; }
        if (window.speechSynthesis.speaking) { window.speechSynthesis.cancel(); }
        var u = new SpeechSynthesisUtterance(body.innerText || body.textContent);
        u.lang = 'pt-BR'; u.rate = 0.98;
        window.speechSynthesis.speak(u);
        b.innerHTML = '<i class="fa-solid fa-volume-high" aria-hidden="true"></i> Ouvindo…';
        u.onend = function () { b.innerHTML = '<i class="fa-solid fa-volume-high" aria-hidden="true"></i> Ouvir'; };
      });
    });

    // Exercício: conferir
    var checkBtn = document.querySelector('[data-check="' + m.id + '"]');
    if (checkBtn) checkBtn.addEventListener('click', function () { checkExercise(m); });
    var retryBtn = document.querySelector('[data-retry="' + m.id + '"]');
    if (retryBtn) retryBtn.addEventListener('click', function () { retryExercise(m); });

    // Quiz: conferir / refazer
    var qc = document.querySelector('[data-quizcheck="' + m.id + '"]');
    if (qc) qc.addEventListener('click', function () { checkQuiz(m); });
    var qr = document.querySelector('[data-quizretry="' + m.id + '"]');
    if (qr) qr.addEventListener('click', function () { retryQuiz(m); });

    // Navegação entre módulos
    document.querySelectorAll('.learn-module-nav [data-module]').forEach(function (b) {
      b.addEventListener('click', function () { goModule(b.getAttribute('data-module')); });
    });
  }

  function checkExercise(m) {
    var ex = m.exercise;
    var result = document.getElementById('exResult-' + m.id);
    var correct = 0, total = 0, allDone = true;

    if (ex.type === 'classify') {
      document.querySelectorAll('.classify-row').forEach(function (row, i) {
        var it = ex.items[i];
        var sel = row.querySelector('.classify-select');
        var fb = row.querySelector('.classify-fb');
        total++;
        if (!sel.value) { allDone = false; fb.textContent = ''; return; }
        if (sel.value === it.answer) { correct++; row.classList.add('ok'); row.classList.remove('bad'); fb.innerHTML = '<i class="fa-solid fa-check"></i>'; }
        else { row.classList.add('bad'); row.classList.remove('ok'); fb.innerHTML = '<i class="fa-solid fa-xmark"></i>'; }
      });
    } else if (ex.type === 'calc') {
      ex.fields.forEach(function (f) {
        var el = document.getElementById(f.id);
        var fb = el.parentNode.querySelector('.calc-fb');
        total++;
        var v = parseFloat(el.value);
        if (isNaN(v)) { allDone = false; fb.textContent = ''; el.classList.remove('ok', 'bad'); return; }
        if (Math.abs(v - f.answer) <= (f.tolerance || 0.01)) { correct++; el.classList.add('ok'); el.classList.remove('bad'); fb.innerHTML = '<i class="fa-solid fa-check"></i> Correto'; }
        else { el.classList.add('bad'); el.classList.remove('ok'); fb.innerHTML = '<i class="fa-solid fa-xmark"></i> Revise'; }
      });
    }

    if (!allDone) { result.innerHTML = '<div class="alert alert-warning"><i class="fa-solid fa-circle-info" aria-hidden="true"></i><div>Preencha todas as respostas antes de conferir.</div></div>'; return; }
    var ok = correct === total;
    result.innerHTML = '<div class="alert ' + (ok ? 'alert-success' : 'alert-info') + '"><i class="fa-solid ' + (ok ? 'fa-trophy' : 'fa-lightbulb') + '" aria-hidden="true"></i><div><strong>' + correct + ' de ' + total + ' corretos.</strong> ' + esc(ex.explain) + '</div></div>';
  }

  function retryExercise(m) {
    document.querySelectorAll('.classify-row').forEach(function (row) { row.classList.remove('ok', 'bad'); var s = row.querySelector('.classify-select'); if (s) s.value = ''; var fb = row.querySelector('.classify-fb'); if (fb) fb.textContent = ''; });
    m.exercise.fields && m.exercise.fields.forEach(function (f) { var el = document.getElementById(f.id); if (el) { el.value = ''; el.classList.remove('ok', 'bad'); var fb = el.parentNode.querySelector('.calc-fb'); if (fb) fb.textContent = ''; } });
    var result = document.getElementById('exResult-' + m.id); if (result) result.innerHTML = '';
  }

  function checkQuiz(m) {
    var quiz = m.quiz, correct = 0, answered = 0;
    quiz.forEach(function (q, qi) {
      var sel = document.querySelector('input[name="q-' + m.id + '-' + qi + '"]:checked');
      var fb = document.getElementById('fb-' + m.id + '-' + qi);
      var fieldset = fb.closest('.quiz-q');
      fieldset.classList.remove('ok', 'bad');
      if (!sel) { fb.innerHTML = '<span class="quiz-warn">Selecione uma alternativa.</span>'; return; }
      answered++;
      var chosen = parseInt(sel.value, 10);
      if (chosen === q.answer) { correct++; fieldset.classList.add('ok'); fb.innerHTML = '<i class="fa-solid fa-circle-check"></i> Correto! ' + esc(q.explain); }
      else { fieldset.classList.add('bad'); fb.innerHTML = '<i class="fa-solid fa-circle-xmark"></i> Resposta correta: <strong>' + esc(q.options[q.answer]) + '</strong>. ' + esc(q.explain); }
    });
    if (answered < quiz.length) { document.getElementById('quizResult-' + m.id).innerHTML = '<div class="alert alert-warning"><i class="fa-solid fa-circle-info" aria-hidden="true"></i><div>Responda todas as ' + quiz.length + ' perguntas para ver o resultado completo.</div></div>'; return; }
    var pct = Math.round((correct / quiz.length) * 100);
    var prev = state.quizzes[m.id];
    if (!prev || correct > prev.score) state.quizzes[m.id] = { done: true, score: correct, total: quiz.length };
    else prev.done = true;
    save();
    var msg = pct === 100 ? 'Excelente! Você dominou o módulo.' : pct >= 60 ? 'Bom trabalho! Revise as que errou.' : 'Continue estudando — releia as aulas e tente de novo.';
    document.getElementById('quizResult-' + m.id).innerHTML = '<div class="alert ' + (pct >= 60 ? 'alert-success' : 'alert-info') + '"><i class="fa-solid fa-award" aria-hidden="true"></i><div><strong>' + correct + '/' + quiz.length + ' (' + pct + '%).</strong> ' + msg + '</div></div>';
    renderNav();
    updateProgressUI();
  }

  function retryQuiz(m) {
    document.querySelectorAll('input[name^="q-' + m.id + '-"]').forEach(function (r) { r.checked = false; });
    m.quiz.forEach(function (q, qi) {
      var fb = document.getElementById('fb-' + m.id + '-' + qi); if (fb) fb.innerHTML = '';
      var f = fb && fb.closest('.quiz-q'); if (f) f.classList.remove('ok', 'bad');
    });
    var r = document.getElementById('quizResult-' + m.id); if (r) r.innerHTML = '';
  }

  /* ======================================================================
     RENDER — GLOSSÁRIO
     ====================================================================== */
  function renderGlossary(filter) {
    var grid = document.getElementById('glossaryGrid');
    if (!grid) return;
    var f = (filter || '').toLowerCase().trim();
    var list = GLOSSARY.filter(function (g) { return !f || g.term.toLowerCase().indexOf(f) !== -1 || g.def.toLowerCase().indexOf(f) !== -1; });
    if (!list.length) { grid.innerHTML = '<p class="empty-state">Nenhum termo encontrado para "' + esc(filter) + '".</p>'; return; }
    grid.innerHTML = list.map(function (g) {
      return '<div class="glossary-item"><h3><i class="fa-solid fa-bookmark" aria-hidden="true"></i> ' + esc(g.term) + '</h3><p>' + esc(g.def) + '</p></div>';
    }).join('');
  }

  /* ======================================================================
     PROGRESSO GERAL
     ====================================================================== */
  function updateProgressUI() {
     
    var total = totalLessons();
    var done = doneLessons();

     var pct = total ? Math.round((done / total) * 100) : 0;
     
     var badge = document.getElementById('gamificationBadge');
    
     if (badge) {

  if (pct >= 100) {
    badge.innerHTML = '🥇 Mestre da Gestão';
  }
  else if (pct >= 60) {
    badge.innerHTML = '🥈 Planejador Financeiro';
  }
  else if (pct >= 20) {
    badge.innerHTML = '🥉 Explorador Financeiro';
  }
  else {
    badge.innerHTML = '🚀 Iniciante';
  }

    }
     
    var ring = document.getElementById('progressRing');
    var pctEl = document.getElementById('progressPct');
    var note = document.getElementById('progressNote');
    var sL = document.getElementById('statLessons');
    var sQ = document.getElementById('statQuizzes');
    if (pctEl) pctEl.textContent = pct + '%';
    if (ring) ring.style.setProperty('--p', pct);
    if (sL) sL.textContent = done;
    if (sQ) sQ.textContent = quizCount();
    if (note) {
      note.textContent = pct === 0 ? 'Você ainda não concluiu nenhuma aula. Bora começar?' :
        pct === 100 ? 'Parabéns! Você concluiu todos os módulos. 🎉' :
        'Você já concluiu ' + done + ' de ' + total + ' aulas. Continue assim!';
    }
  }

  /* ======================================================================
     INIT
     ====================================================================== */
  function init() {
    if (window.ResolutaA11y) window.ResolutaA11y.init();
    renderNav();
    renderModule();
    renderGlossary('');
    updateProgressUI();

    var search = document.getElementById('glossarySearch');
    if (search) search.addEventListener('input', function () { renderGlossary(search.value); });

    var ano = document.getElementById('anoAtual'); if (ano) ano.textContent = new Date().getFullYear();
  }

  document.addEventListener('DOMContentLoaded', init);
})();
