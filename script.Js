/**
 * Lógica da Calculadora de Precificação por Markup — Resoluta Finance
 * Fórmulas baseadas nas diretrizes oficiais da especificação AGI.
 */

function calcularMarkup() {
    // Captura dos inputs
    const custoDireto = parseFloat(document.getElementById('custoDireto').value);
    const despesasVar = parseFloat(document.getElementById('despesasVar').value) || 0;
    const despesasFixas = parseFloat(document.getElementById('despesasFixas').value) || 0;
    const margemLucro = parseFloat(document.getElementById('margemLucro').value) || 0;

    // Validação básica
    if (isNaN(custoDireto) || custoDireto <= 0) {
        alert("Por favor, insira um Custo Direto Unitário válido.");
        return;
    }

    // Conversão de percentuais para fator unitário
    const somaPercentuais = (despesasVar + despesasFixas + margemLucro) / 100;

    if (somaPercentuais >= 1) {
        alert("A soma das despesas e da margem de lucro não pode atingir ou ultrapassar 100%. Revise os valores.");
        return;
    }

    // Fórmulas Oficiais
    const markupDivisor = 1 - somaPercentuais;
    const markupMultiplicador = 1 / markupDivisor;
    const precoVenda = custoDireto / markupMultiplicador; // Equivalente a custoDireto / markupDivisor

    // Lucro Líquido Estimado em R$
    const lucroEstimado = precoVenda * (margemLucro / 100);

    // Exibição dos resultados na interface
    document.getElementById('resPreçoVenda').innerText = `R$ ${precoVenda.toFixed(2)}`;
    document.getElementById('resMarkupDivisor').innerText = markupDivisor.toFixed(4);
    document.getElementById('resMarkupMult').innerText = markupMultiplicador.toFixed(4);
    document.getElementById('resLucroEstimado').innerText = `R$ ${lucroEstimado.toFixed(2)}`;

    // Revela o card de resultados
    document.getElementById('calcResultado').classList.remove('hidden');
}

function abrirModal(modalId) {
    // Função pronta para expansão futura do fluxo de Autenticação/Login
    console.log(`Abrindo modal: ${modalId}`);
}
