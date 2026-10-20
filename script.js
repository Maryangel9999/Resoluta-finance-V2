const form = document.getElementById('markup-form');

function calcularMarkup() {
  const custo = Number(document.getElementById('custo').value) || 0;
  const variaveis = Number(document.getElementById('variaveis').value) || 0;
  const fixas = Number(document.getElementById('fixas').value) || 0;
  const lucro = Number(document.getElementById('lucro').value) || 0;
  const impostos = Number(document.getElementById('impostos').value) || 0;
  const quantidade = Number(document.getElementById('quantidade').value) || 1;
  const precoPraticado = Number(document.getElementById('precoPraticado').value) || 0;

  const totalPercentual = variaveis + fixas + lucro + impostos;

  if (totalPercentual >= 100 || custo < 0 || quantidade <= 0) {
    document.getElementById('markupDivisor').textContent = 'Inválido';
    document.getElementById('markupMultiplicador').textContent = 'Inválido';
    document.getElementById('precoSugerido').textContent = 'R$ 0,00';
    document.getElementById('faturamento').textContent = 'R$ 0,00';
    document.getElementById('lucroEst').textContent = 'R$ 0,00';
    return;
  }

  const divisor = 1 - (totalPercentual / 100);
  const multiplicador = divisor === 0 ? 0 : 1 / divisor;
  const precoSugerido = divisor === 0 ? 0 : custo / divisor;
  const faturamentoTotal = precoSugerido * quantidade;
  const lucroLiquido = faturamentoTotal - (custo * quantidade) - (custo * quantidade * (variaveis + fixas + impostos) / 100);

  document.getElementById('markupDivisor').textContent = divisor.toFixed(4);
  document.getElementById('markupMultiplicador').textContent = multiplicador.toFixed(4);
  document.getElementById('precoSugerido').textContent = formatCurrency(precoSugerido);
  document.getElementById('faturamento').textContent = formatCurrency(faturamentoTotal);
  document.getElementById('lucroEst').textContent = formatCurrency(lucroLiquido);

  if (precoPraticado > 0) {
    const margemResultado = ((precoPraticado - custo) / precoPraticado) * 100;
    document.getElementById('precoSugerido').textContent += ` | atual: ${formatCurrency(precoPraticado)} • margem: ${margemResultado.toFixed(1)}%`;
  }
}

function formatCurrency(value) {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value || 0);
}

if (form) {
  form.addEventListener('submit', function (event) {
    event.preventDefault();
    calcularMarkup();
  });
}

calcularMarkup();
