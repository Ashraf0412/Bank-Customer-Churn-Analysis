const filterGeography = document.getElementById('filter-geography');
const filterGender = document.getElementById('filter-gender');
const filterAgeGroup = document.getElementById('filter-age-group');
const filterProducts = document.getElementById('filter-products');
const filterActive = document.getElementById('filter-active');
const resetButton = document.querySelector('.reset-button');
const kpiContainer = document.getElementById('kpi-cards');
const customerTable = document.getElementById('customer-table');

const recordSearchInput = document.getElementById('record-search-input');
const recordSearchButton = document.getElementById('record-search-button');
const recordsFilterGeography = document.getElementById('records-filter-geography');
const recordsFilterGender = document.getElementById('records-filter-gender');
const recordsFilterAgeGroup = document.getElementById('records-filter-age-group');
const recordsFilterCreditCard = document.getElementById('records-filter-credit-card');
const recordsFilterActive = document.getElementById('records-filter-active');
const recordsFilterChurned = document.getElementById('records-filter-churned');
const recordsFilterToggle = document.getElementById('records-filter-toggle');
const recordsFilterPanel = document.getElementById('records-filter-panel');
const recordsResetButton = document.getElementById('records-reset-button');
const recordsApplyButton = document.getElementById('records-apply-button');
const recordsSummary = document.getElementById('records-summary');
const customerRecordsTableBody = document.getElementById('customer-records-table-body');

const riskFilterGeography = document.getElementById('risk-filter-geography');
const riskFilterGender = document.getElementById('risk-filter-gender');
const riskFilterAgeGroup = document.getElementById('risk-filter-age-group');
const riskFilterProducts = document.getElementById('risk-filter-products');
const riskFilterActive = document.getElementById('risk-filter-active');
const riskResetButton = document.getElementById('risk-reset-button');
const riskKpiContainer = document.getElementById('risk-kpi-cards');
const riskAlertsContainer = document.getElementById('risk-alerts');
const riskTableBody = document.getElementById('risk-table-body');

let geoChart, genderChart, ageGroupChart, productChart, activeChart;
let riskDistributionChart, riskFactorsChart, riskGeoChart, riskAgeChart, riskProductChart;
const chartInstances = new Map();
let riskTableSort = { key: 'risk_score', direction: 'desc' };

function groupBy(data, key) {
  return data.reduce((acc, item) => {
    const value = typeof key === 'function' ? key(item) : item[key] || 'Unknown';
    if (!acc[value]) acc[value] = [];
    acc[value].push(item);
    return acc;
  }, {});
}

const GEO_MAP = {
  France: 'Mumbai',
  Germany: 'Pune',
  Spain: 'Hyderabad',
};

function normalizeGeography(geography) {
  return GEO_MAP[geography] || geography || 'Unknown';
}

function formatCurrency(value) {
  return value.toLocaleString('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 });
}

function getFilters() {
  return {
    geography: filterGeography.value,
    gender: filterGender.value,
    ageGroup: filterAgeGroup.value,
    products: filterProducts.value,
    active: filterActive.value,
  };
}

function applyFilters(data) {
  const filters = getFilters();
  return data.filter((row) => {
    const geographyMatch = filters.geography === 'All' || normalizeGeography(row.geography) === filters.geography;
    const genderMatch = filters.gender === 'All' || row.gender === filters.gender;
    const ageGroupMatch = filters.ageGroup === 'All' || calculateAgeGroup(row.age) === filters.ageGroup;
    const productsMatch = filters.products === 'All' || row.num_of_products.toString() === filters.products;
    const activeMatch = filters.active === 'All' || row.is_active_member === (filters.active === 'Yes' ? 1 : 0);
    return geographyMatch && genderMatch && ageGroupMatch && productsMatch && activeMatch;
  });
}

function calculateAgeGroup(age) {
  if (age <= 30) return 'Under 30';
  if (age <= 40) return '31-40';
  if (age <= 50) return '41-50';
  return '51+';
}

function buildSelectOptions() {
  const geographyOptions = [...new Set(bankData.map((row) => normalizeGeography(row.geography)))].sort();
  const genderOptions = [...new Set(bankData.map((row) => row.gender))].sort();
  const ageGroupOptions = ['Under 30', '31-40', '41-50', '51+'];
  const productOptions = [...new Set(bankData.map((row) => row.num_of_products.toString()))].sort((a, b) => Number(a) - Number(b));
  const activeOptions = ['Yes', 'No'];
  const churnedOptions = ['Yes', 'No'];

  geographyOptions.forEach((option) => {
    const opt = document.createElement('option');
    opt.value = option;
    opt.textContent = option;
    filterGeography.appendChild(opt);
  });

  genderOptions.forEach((option) => {
    const opt = document.createElement('option');
    opt.value = option;
    opt.textContent = option;
    filterGender.appendChild(opt);
  });

  ageGroupOptions.forEach((option) => {
    const opt = document.createElement('option');
    opt.value = option;
    opt.textContent = option;
    filterAgeGroup.appendChild(opt);
  });

  productOptions.forEach((option) => {
    const opt = document.createElement('option');
    opt.value = option;
    opt.textContent = option;
    filterProducts.appendChild(opt);
  });

  activeOptions.forEach((option) => {
    const opt = document.createElement('option');
    opt.value = option;
    opt.textContent = option;
    filterActive.appendChild(opt);
  });

  geographyOptions.forEach((option) => {
    const opt = document.createElement('option');
    opt.value = option;
    opt.textContent = option;
    riskFilterGeography.appendChild(opt);
    recordsFilterGeography.appendChild(opt.cloneNode(true));
  });

  genderOptions.forEach((option) => {
    const opt = document.createElement('option');
    opt.value = option;
    opt.textContent = option;
    riskFilterGender.appendChild(opt);
    recordsFilterGender.appendChild(opt.cloneNode(true));
  });

  ageGroupOptions.forEach((option) => {
    const opt = document.createElement('option');
    opt.value = option;
    opt.textContent = option;
    riskFilterAgeGroup.appendChild(opt);
    recordsFilterAgeGroup.appendChild(opt.cloneNode(true));
  });

  productOptions.forEach((option) => {
    const opt = document.createElement('option');
    opt.value = option;
    opt.textContent = option;
    riskFilterProducts.appendChild(opt);
  });

  activeOptions.forEach((option) => {
    const opt = document.createElement('option');
    opt.value = option;
    opt.textContent = option;
    riskFilterActive.appendChild(opt);
    recordsFilterActive.appendChild(opt.cloneNode(true));
  });

  churnedOptions.forEach((option) => {
    const opt = document.createElement('option');
    opt.value = option;
    opt.textContent = option;
    recordsFilterChurned.appendChild(opt);
  });
}

function updateKPIs(data) {
  const total = data.length;
  const churnRate = total ? (data.filter((row) => row.churned === 1).length / total) * 100 : 0;
  const avgBalance = total ? data.reduce((sum, row) => sum + row.balance, 0) / total : 0;
  const avgSalary = total ? data.reduce((sum, row) => sum + row.estimated_salary, 0) / total : 0;

  kpiContainer.innerHTML = `
    <div class="kpi-card"><h3>Total Customers</h3><p>${total}</p></div>
    <div class="kpi-card"><h3>Churn Rate</h3><p>${churnRate.toFixed(1)}%</p></div>
    <div class="kpi-card"><h3>Average Balance</h3><p>${formatCurrency(avgBalance)}</p></div>
    <div class="kpi-card"><h3>Average Salary</h3><p>${formatCurrency(avgSalary)}</p></div>
  `;
}

function buildChart(chart, labels, values, labelText, color) {
  if (chart) {
    chart.data.labels = labels;
    chart.data.datasets[0].data = values;
    chart.update();
    return;
  }

  return new Chart(document.getElementById(labelText), {
    type: 'bar',
    data: {
      labels,
      datasets: [{
        label: 'Churn Rate',
        data: values,
        backgroundColor: color,
        borderRadius: 8,
      }],
    },
    options: {
      responsive: true,
      plugins: {
        legend: { display: false },
      },
      scales: {
        y: { beginAtZero: true, ticks: { callback: (value) => value + '%' } },
      },
    },
  });
}

function createCharts(data) {
  const groupedGeo = groupBy(data, (row) => normalizeGeography(row.geography));
  const groupedGender = groupBy(data, 'gender');
  const groupedAge = data.reduce((acc, item) => {
    const label = calculateAgeGroup(item.age);
    if (!acc[label]) acc[label] = [];
    acc[label].push(item);
    return acc;
  }, {});
  const groupedProducts = groupBy(data, 'num_of_products');
  const activeSummary = groupBy(data, 'is_active_member');

  const geoLabels = Object.keys(groupedGeo);
  const geoValues = geoLabels.map((label) => {
    const group = groupedGeo[label];
    return Number(((group.filter((row) => row.churned === 1).length / group.length) * 100).toFixed(1));
  });

  const genderLabels = Object.keys(groupedGender);
  const genderValues = genderLabels.map((label) => {
    const group = groupedGender[label];
    return Number(((group.filter((row) => row.churned === 1).length / group.length) * 100).toFixed(1));
  });

  const ageLabels = Object.keys(groupedAge);
  const ageValues = ageLabels.map((label) => {
    const group = groupedAge[label];
    return Number(((group.filter((row) => row.churned === 1).length / group.length) * 100).toFixed(1));
  });

  const productLabels = Object.keys(groupedProducts).sort((a, b) => Number(a) - Number(b));
  const productValues = productLabels.map((label) => {
    const group = groupedProducts[label];
    return Number(((group.filter((row) => row.churned === 1).length / group.length) * 100).toFixed(1));
  });

  const activeLabels = ['Active', 'Inactive'];
  const activeValues = activeLabels.map((label) => {
    const key = label === 'Active' ? 1 : 0;
    const group = activeSummary[key] || [];
    return group.length;
  });

  if (!geoChart) {
    geoChart = new Chart(document.getElementById('geoChart'), {
      type: 'bar',
      data: {
        labels: geoLabels,
        datasets: [{ label: 'Churn Rate', data: geoValues, backgroundColor: '#2563eb' }],
      },
      options: {
        responsive: true,
        plugins: { legend: { display: false } },
        scales: { y: { beginAtZero: true, ticks: { callback: (value) => value + '%' } } },
      },
    });
    chartInstances.set('geoChart', geoChart);
  } else {
    geoChart.data.labels = geoLabels;
    geoChart.data.datasets[0].data = geoValues;
    geoChart.update();
  }

  if (!genderChart) {
    genderChart = new Chart(document.getElementById('genderChart'), {
      type: 'bar',
      data: { labels: genderLabels, datasets: [{ label: 'Churn Rate', data: genderValues, backgroundColor: '#f97316' }] },
      options: { responsive: true, plugins: { legend: { display: false } }, scales: { y: { beginAtZero: true, ticks: { callback: (value) => value + '%' } } } },
    });
    chartInstances.set('genderChart', genderChart);
  } else {
    genderChart.data.labels = genderLabels;
    genderChart.data.datasets[0].data = genderValues;
    genderChart.update();
  }

  if (!ageGroupChart) {
    ageGroupChart = new Chart(document.getElementById('ageGroupChart'), {
      type: 'bar',
      data: { labels: ageLabels, datasets: [{ label: 'Churn Rate', data: ageValues, backgroundColor: '#14b8a6' }] },
      options: { responsive: true, plugins: { legend: { display: false } }, scales: { y: { beginAtZero: true, ticks: { callback: (value) => value + '%' } } } },
    });
    chartInstances.set('ageGroupChart', ageGroupChart);
  } else {
    ageGroupChart.data.labels = ageLabels;
    ageGroupChart.data.datasets[0].data = ageValues;
    ageGroupChart.update();
  }

  if (!productChart) {
    productChart = new Chart(document.getElementById('productChart'), {
      type: 'bar',
      data: { labels: productLabels, datasets: [{ label: 'Churn Rate', data: productValues, backgroundColor: '#ec4899' }] },
      options: { responsive: true, plugins: { legend: { display: false } }, scales: { y: { beginAtZero: true, ticks: { callback: (value) => value + '%' } } } },
    });
    chartInstances.set('productChart', productChart);
  } else {
    productChart.data.labels = productLabels;
    productChart.data.datasets[0].data = productValues;
    productChart.update();
  }

  if (!activeChart) {
    activeChart = new Chart(document.getElementById('activeChart'), {
      type: 'doughnut',
      data: { labels: activeLabels, datasets: [{ label: 'Customer Status', data: activeValues, backgroundColor: ['#22c55e', '#ef4444'] }] },
      options: {
        responsive: false,
        maintainAspectRatio: false,
        plugins: { legend: { position: 'bottom' } },
      },
    });
    chartInstances.set('activeChart', activeChart);
  } else {
    activeChart.data.datasets[0].data = activeValues;
    activeChart.update();
  }
}

function generateKeyInsights(data) {
  if (!data || data.length === 0) {
    return ['No insight data available.'];
  }

  const groupByValue = (items, keyFn) => {
    return items.reduce((acc, item) => {
      const key = keyFn(item);
      if (!acc[key]) acc[key] = [];
      acc[key].push(item);
      return acc;
    }, {});
  };

  const churnRates = (groups) => {
    return Object.entries(groups).map(([group, rows]) => ({
      group,
      churnRate: rows.length ? rows.filter((row) => row.churned === 1).length / rows.length : 0,
      count: rows.length,
    }));
  };

  const geographyGroups = groupByValue(data, (row) => normalizeGeography(row.geography));
  const geographyRates = churnRates(geographyGroups).sort((a, b) => b.churnRate - a.churnRate);
  const topGeography = geographyRates[0];

  const ageGroups = groupByValue(data, (row) => calculateAgeGroup(row.age));
  const ageRates = churnRates(ageGroups).sort((a, b) => b.churnRate - a.churnRate);
  const topAgeGroup = ageRates[0];

  const productGroups = groupByValue(data, (row) => String(row.num_of_products));
  const productRates = churnRates(productGroups).sort((a, b) => b.churnRate - a.churnRate);
  const topProductGroup = productRates[0];

  const activeGroups = groupByValue(data, (row) => (row.is_active_member === 1 ? 'Active' : 'Inactive'));
  const activeRates = churnRates(activeGroups);
  const activeChurn = activeRates.find((item) => item.group === 'Active') || { churnRate: 0 };
  const inactiveChurn = activeRates.find((item) => item.group === 'Inactive') || { churnRate: 0 };
  const activeRatio = activeChurn.churnRate > 0 ? (inactiveChurn.churnRate / activeChurn.churnRate).toFixed(1) : 'N/A';

  const churnedScores = data.filter((row) => row.churned === 1).map((row) => row.credit_score || 0);
  const retainedScores = data.filter((row) => row.churned === 0).map((row) => row.credit_score || 0);
  const avg = (arr) => (arr.length ? arr.reduce((sum, value) => sum + value, 0) / arr.length : 0);
  const avgChurnScore = Math.round(avg(churnedScores));
  const avgRetainedScore = Math.round(avg(retainedScores));

  const insights = [];
  if (topGeography) {
    insights.push(`${topGeography.group} has the highest churn rate at ${(topGeography.churnRate * 100).toFixed(1)}%.`);
  }
  if (topAgeGroup) {
    insights.push(`Customers aged ${topAgeGroup.group} have the highest churn rate at ${(topAgeGroup.churnRate * 100).toFixed(1)}%.`);
  }
  if (activeChurn || inactiveChurn) {
    insights.push(`Inactive members churn at ${(inactiveChurn.churnRate * 100).toFixed(1)}% versus ${(activeChurn.churnRate * 100).toFixed(1)}% for active members (${activeRatio}x higher).`);
  }
  if (topProductGroup) {
    insights.push(`Customers with ${topProductGroup.group} product${topProductGroup.group === '1' ? '' : 's'} have the highest churn rate at ${(topProductGroup.churnRate * 100).toFixed(1)}%.`);
  }
  if (churnedScores.length && retainedScores.length) {
    insights.push(`Churned customers have an average credit score of ${avgChurnScore} vs ${avgRetainedScore} for retained customers.`);
  }

  return insights;
}

function updateInsights(data) {
  const insightsList = document.getElementById('insights-list');
  if (!insightsList) return;

  const insights = generateKeyInsights(data);
  insightsList.innerHTML = insights.map((insight) => `<li>${insight}</li>`).join('');
}

function getRiskFilters() {
  return {
    geography: riskFilterGeography.value,
    gender: riskFilterGender.value,
    ageGroup: riskFilterAgeGroup.value,
    products: riskFilterProducts.value,
    active: riskFilterActive.value,
  };
}

function applyRiskFilters(data) {
  const filters = getRiskFilters();
  return data.filter((row) => {
    const geographyMatch = filters.geography === 'All' || normalizeGeography(row.geography) === filters.geography;
    const genderMatch = filters.gender === 'All' || row.gender === filters.gender;
    const ageGroupMatch = filters.ageGroup === 'All' || calculateAgeGroup(row.age) === filters.ageGroup;
    const productsMatch = filters.products === 'All' || row.num_of_products.toString() === filters.products;
    const activeMatch = filters.active === 'All' || row.is_active_member === (filters.active === 'Yes' ? 1 : 0);
    return geographyMatch && genderMatch && ageGroupMatch && productsMatch && activeMatch;
  });
}

function calculateRiskData(data) {
  if (!data || data.length === 0) {
    return [];
  }

  const meanCreditScore = data.reduce((sum, row) => sum + row.credit_score, 0) / data.length;
  const meanAge = data.reduce((sum, row) => sum + row.age, 0) / data.length;
  const meanBalance = data.reduce((sum, row) => sum + row.balance, 0) / data.length;
  const meanProducts = data.reduce((sum, row) => sum + row.num_of_products, 0) / data.length;

  return data.map((row) => {
    let score = 0;
    if (row.credit_score < meanCreditScore) score += 25;
    if (row.age > meanAge) score += 20;
    if (row.balance > meanBalance) score += 15;
    if (row.num_of_products < meanProducts) score += 15;
    if (row.is_active_member === 0) score += 20;
    if (row.has_credit_card === 0) score += 5;
    if (score > 100) score = 100;
    const riskLevel = score <= 30 ? 'Low' : score <= 60 ? 'Medium' : 'High';
    return { ...row, risk_score: score, risk_level: riskLevel, meanCreditScore, meanAge, meanBalance, meanProducts };
  });
}

function renderRiskKPIs(data) {
  const total = data.length;
  const highRiskCount = data.filter((row) => row.risk_level === 'High').length;
  const averageRiskScore = total ? data.reduce((sum, row) => sum + row.risk_score, 0) / total : 0;
  const predictedChurn = data.filter((row) => row.risk_level === 'High' && row.churned === 1).length;
  const activeHighRisk = data.filter((row) => row.risk_level === 'High' && row.is_active_member === 1).length;

  riskKpiContainer.innerHTML = `
    <div class="kpi-card"><h3>High Risk Customers</h3><p>${highRiskCount}</p></div>
    <div class="kpi-card"><h3>Average Risk Score</h3><p>${averageRiskScore.toFixed(1)}</p></div>
    <div class="kpi-card"><h3>Predicted Churn</h3><p>${predictedChurn}</p></div>
    <div class="kpi-card"><h3>Active High Risk Customers</h3><p>${activeHighRisk}</p></div>
  `;
}

function renderRiskAlerts(data) {
  const total = data.length;
  if (!riskAlertsContainer) return;
  const meanCreditScore = total ? data[0].meanCreditScore : 0;
  const meanAge = total ? data[0].meanAge : 0;
  const meanBalance = total ? data[0].meanBalance : 0;

  const lowCreditCount = data.filter((row) => row.credit_score < meanCreditScore).length;
  const inactiveCount = data.filter((row) => row.is_active_member === 0).length;
  const highBalanceCount = data.filter((row) => row.balance > meanBalance).length;
  const highRiskCount = data.filter((row) => row.risk_level === 'High').length;

  riskAlertsContainer.innerHTML = `
    <div class="alert-card"><h4>Credit Score below Mean</h4><p>${lowCreditCount}</p></div>
    <div class="alert-card"><h4>Inactive Customers</h4><p>${inactiveCount}</p></div>
    <div class="alert-card"><h4>Balance above Mean</h4><p>${highBalanceCount}</p></div>
    <div class="alert-card"><h4>High Risk Customers</h4><p>${highRiskCount}</p></div>
  `;
}

function buildRiskDistributionChart(data) {
  const levels = ['Low', 'Medium', 'High'];
  const counts = levels.map((level) => data.filter((row) => row.risk_level === level).length);

  const config = {
    type: 'doughnut',
    data: {
      labels: levels,
      datasets: [{ data: counts, backgroundColor: ['#22c55e', '#f59e0b', '#ef4444'], borderWidth: 0 }],
    },
    options: {
      responsive: false,
      maintainAspectRatio: false,
      plugins: {
        legend: { position: 'bottom' },
      },
    },
  };

  if (riskDistributionChart) {
    riskDistributionChart.data = config.data;
    riskDistributionChart.update();
  } else {
    riskDistributionChart = new Chart(document.getElementById('riskDistributionChart'), config);
    chartInstances.set('riskDistributionChart', riskDistributionChart);
  }
}


function buildRiskFactorsChart(data) {
  const total = data.length;
  const meanCreditScore = total ? data[0].meanCreditScore : 0;
  const meanAge = total ? data[0].meanAge : 0;
  const meanBalance = total ? data[0].meanBalance : 0;

  const factors = [
    { label: 'Inactive Member', value: data.filter((row) => row.is_active_member === 0).length },
    { label: 'Credit Score Below Mean', value: data.filter((row) => row.credit_score < meanCreditScore).length },
    { label: 'Balance Above Mean', value: data.filter((row) => row.balance > meanBalance).length },
    { label: 'Age Above Mean', value: data.filter((row) => row.age > meanAge).length },
    { label: 'One Product', value: data.filter((row) => row.num_of_products === 1).length },
    { label: 'No Credit Card', value: data.filter((row) => row.has_credit_card === 0).length },
  ];

  const labels = factors.map((item) => item.label);
  const percentages = factors.map((item) => total ? ((item.value / total) * 100).toFixed(1) : 0);

  const config = {
    type: 'bar',
    data: {
      labels,
      datasets: [{ label: 'Percent of Customers', data: percentages, backgroundColor: '#2563eb', borderRadius: 8 }],
    },
    options: {
      indexAxis: 'y',
      responsive: true,
      plugins: {
        legend: { display: false },
      },
      scales: {
        x: { beginAtZero: true, ticks: { callback: (value) => `${value}%` } },
      },
    },
  };

  if (riskFactorsChart) {
    riskFactorsChart.data = config.data;
    riskFactorsChart.update();
  } else {
    riskFactorsChart = new Chart(document.getElementById('riskFactorsChart'), config);
    chartInstances.set('riskFactorsChart', riskFactorsChart);
  }
}

function buildRiskByGeographyChart(data) {
  const groups = groupBy(data, (row) => normalizeGeography(row.geography));
  const labels = ['Mumbai', 'Pune', 'Hyderabad'];
  const percentages = labels.map((label) => {
    const rows = groups[label] || [];
    const highRisk = rows.filter((row) => row.risk_level === 'High').length;
    return rows.length ? Number(((highRisk / rows.length) * 100).toFixed(1)) : 0;
  });

  const config = {
    type: 'bar',
    data: {
      labels,
      datasets: [{ label: 'High Risk %', data: percentages, backgroundColor: '#2563eb', borderRadius: 8 }],
    },
    options: {
      responsive: true,
      plugins: { legend: { display: false } },
      scales: {
        y: { beginAtZero: true, ticks: { callback: (value) => `${value}%` } },
      },
    },
  };

  if (riskGeoChart) {
    riskGeoChart.data = config.data;
    riskGeoChart.update();
  } else {
    riskGeoChart = new Chart(document.getElementById('riskGeoChart'), config);
    chartInstances.set('riskGeoChart', riskGeoChart);
  }
}

function buildRiskByAgeChart(data) {
  const groups = groupBy(data, (row) => calculateAgeGroup(row.age));
  const labels = ['Under 30', '31-40', '41-50', '51+'];
  const percentages = labels.map((label) => {
    const rows = groups[label] || [];
    const highRisk = rows.filter((row) => row.risk_level === 'High').length;
    return rows.length ? Number(((highRisk / rows.length) * 100).toFixed(1)) : 0;
  });

  const config = {
    type: 'bar',
    data: {
      labels,
      datasets: [{ label: 'High Risk %', data: percentages, backgroundColor: '#14b8a6', borderRadius: 8 }],
    },
    options: {
      responsive: true,
      plugins: { legend: { display: false } },
      scales: {
        y: { beginAtZero: true, ticks: { callback: (value) => `${value}%` } },
      },
    },
  };

  if (riskAgeChart) {
    riskAgeChart.data = config.data;
    riskAgeChart.update();
  } else {
    riskAgeChart = new Chart(document.getElementById('riskAgeChart'), config);
    chartInstances.set('riskAgeChart', riskAgeChart);
  }
}

function buildRiskByProductChart(data) {
  const groups = groupBy(data, 'num_of_products');
  const labels = ['1 Product', '2 Products', '3 Products', '4 Products'];
  const percentages = [1, 2, 3, 4].map((value) => {
    const rows = groups[value] || [];
    const highRisk = rows.filter((row) => row.risk_level === 'High').length;
    return rows.length ? Number(((highRisk / rows.length) * 100).toFixed(1)) : 0;
  });

  const config = {
    type: 'bar',
    data: {
      labels,
      datasets: [{ label: 'High Risk %', data: percentages, backgroundColor: '#ec4899', borderRadius: 8 }],
    },
    options: {
      responsive: true,
      plugins: { legend: { display: false } },
      scales: {
        y: { beginAtZero: true, ticks: { callback: (value) => `${value}%` } },
      },
    },
  };

  if (riskProductChart) {
    riskProductChart.data = config.data;
    riskProductChart.update();
  } else {
    riskProductChart = new Chart(document.getElementById('riskProductChart'), config);
    chartInstances.set('riskProductChart', riskProductChart);
  }
}

function renderRiskTable(data) {
  const sorted = [...data].sort((a, b) => {
    const aValue = a[riskTableSort.key];
    const bValue = b[riskTableSort.key];
    if (typeof aValue === 'string') {
      return riskTableSort.direction === 'asc' ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue);
    }
    return riskTableSort.direction === 'asc' ? aValue - bValue : bValue - aValue;
  });

  const rows = sorted.slice(0, 10).map((row) => `
      <tr>
        <td>${row.customer_id}</td>
        <td>${normalizeGeography(row.geography)}</td>
        <td>${row.age}</td>
        <td>${row.credit_score}</td>
        <td>${formatCurrency(row.balance)}</td>
        <td>${row.num_of_products}</td>
        <td>${row.is_active_member === 1 ? 'Yes' : 'No'}</td>
        <td>${row.risk_score}</td>
        <td>${row.risk_level}</td>
        <td>${row.churned === 1 ? 'Yes' : 'No'}</td>
      </tr>`)
    .join('');

  riskTableBody.innerHTML = rows;
}

function refreshRiskPage() {
  const filtered = applyRiskFilters(bankData);
  const riskData = calculateRiskData(filtered);
  renderRiskKPIs(riskData);
  renderRiskAlerts(riskData);
  buildRiskDistributionChart(riskData);
  buildRiskFactorsChart(riskData);
  buildRiskByGeographyChart(riskData);
  buildRiskByAgeChart(riskData);
  buildRiskByProductChart(riskData);
  renderRiskTable(riskData);
}

function initRiskPage() {
  const riskInputs = [riskFilterGeography, riskFilterGender, riskFilterAgeGroup, riskFilterProducts, riskFilterActive];
  riskInputs.forEach((input) => {
    if (!input) return;
    input.addEventListener('change', refreshRiskPage);
  });

  if (riskResetButton) {
    riskResetButton.addEventListener('click', () => {
      riskFilterGeography.value = 'All';
      riskFilterGender.value = 'All';
      riskFilterAgeGroup.value = 'All';
      riskFilterProducts.value = 'All';
      riskFilterActive.value = 'All';
      refreshRiskPage();
    });
  }

  const riskHeaders = document.querySelectorAll('#risk-table th[data-sort]');
  riskHeaders.forEach((header) => {
    header.style.cursor = 'pointer';
    header.addEventListener('click', () => {
      const key = header.dataset.sort;
      if (riskTableSort.key === key) {
        riskTableSort.direction = riskTableSort.direction === 'asc' ? 'desc' : 'asc';
      } else {
        riskTableSort.key = key;
        riskTableSort.direction = 'desc';
      }
      refreshRiskPage();
    });
  });
}

function updateCustomerTable(data) {
  const rows = data
    .filter((row) => row.churned === 1)
    .sort((a, b) => b.balance - a.balance)
    .slice(0, 10)
    .map((row) => `
      <tr>
        <td>${row.customer_id}</td>
        <td>${normalizeGeography(row.geography)}</td>
        <td>${row.gender}</td>
        <td>${row.age}</td>
        <td>${formatCurrency(row.balance)}</td>
        <td>${formatCurrency(row.estimated_salary)}</td>
        <td>${row.churned === 1 ? 'Yes' : 'No'}</td>
      </tr>`)
    .join('');

  customerTable.innerHTML = rows;
}

function getRecordFilters() {
  return {
    geography: recordsFilterGeography.value,
    gender: recordsFilterGender.value,
    ageGroup: recordsFilterAgeGroup.value,
    creditCard: recordsFilterCreditCard.value,
    active: recordsFilterActive?.value || 'All',
    churned: recordsFilterChurned?.value || 'All',
    searchTerm: recordSearchInput?.value.trim().toLowerCase() || '',
  };
}

function applyRecordFilters(data) {
  const filters = getRecordFilters();

  return data.filter((row) => {
    const geographyMatch = filters.geography === 'All' || normalizeGeography(row.geography) === filters.geography;
    const genderMatch = filters.gender === 'All' || row.gender === filters.gender;
    const ageGroupMatch = filters.ageGroup === 'All' || calculateAgeGroup(row.age) === filters.ageGroup;
    const creditCardMatch = filters.creditCard === 'All' || row.has_credit_card === (filters.creditCard === 'Yes' ? 1 : 0);
    const activeMatch = filters.active === 'All' || row.is_active_member === (filters.active === 'Yes' ? 1 : 0);
    const churnedMatch = filters.churned === 'All' || row.churned === (filters.churned === 'Yes' ? 1 : 0);
    const searchMatch = !filters.searchTerm ||
      row.customer_id.toString().includes(filters.searchTerm) ||
      row.customer_name.toLowerCase().includes(filters.searchTerm);

    return geographyMatch && genderMatch && ageGroupMatch && creditCardMatch && activeMatch && churnedMatch && searchMatch;
  });
}

function updateCustomerRecords(data) {
  const filteredRecords = applyRecordFilters(data);
  const count = filteredRecords.length;
  recordsSummary.textContent = count === data.length ? 'Showing all customer records' : `Showing ${count} record${count === 1 ? '' : 's'}`;

  if (filteredRecords.length === 0) {
    customerRecordsTableBody.innerHTML = '<tr><td colspan="8">No records found.</td></tr>';
    return;
  }

  const rows = filteredRecords.map((row) => `
      <tr>
        <td>${row.customer_id}</td>
        <td>${row.customer_name}</td>
        <td>${normalizeGeography(row.geography)}</td>
        <td>${row.gender}</td>
        <td>${row.age}</td>
        <td>${formatCurrency(row.balance)}</td>
        <td>${formatCurrency(row.estimated_salary)}</td>
        <td>${row.churned === 1 ? 'Yes' : 'No'}</td>
      </tr>`)
    .join('');

  customerRecordsTableBody.innerHTML = rows;
}

function initCustomerRecords() {
  const recordInputs = [recordsFilterGeography, recordsFilterGender, recordsFilterAgeGroup, recordsFilterCreditCard, recordsFilterActive, recordsFilterChurned];
  recordInputs.forEach((input) => {
    if (!input) return;
    input.addEventListener('change', () => updateCustomerRecords(bankData));
  });

  if (recordSearchButton) {
    recordSearchButton.addEventListener('click', () => updateCustomerRecords(bankData));
  }

  if (recordSearchInput) {
    recordSearchInput.addEventListener('keydown', (event) => {
      if (event.key === 'Enter') {
        updateCustomerRecords(bankData);
      }
    });
  }

  if (recordsFilterToggle && recordsFilterPanel) {
    recordsFilterToggle.addEventListener('click', () => {
      recordsFilterPanel.classList.toggle('open');
    });
  }

  if (recordsApplyButton) {
    recordsApplyButton.addEventListener('click', () => updateCustomerRecords(bankData));
  }

  if (recordsResetButton) {
    recordsResetButton.addEventListener('click', () => {
      recordsFilterGeography.value = 'All';
      recordsFilterGender.value = 'All';
      recordsFilterAgeGroup.value = 'All';
      recordsFilterCreditCard.value = 'All';
      if (recordsFilterActive) recordsFilterActive.value = 'All';
      if (recordsFilterChurned) recordsFilterChurned.value = 'All';
      updateCustomerRecords(bankData);
    });
  }
}

function refreshDashboard() {
  const filteredData = applyFilters(bankData);
  updateKPIs(filteredData);
  createCharts(filteredData);
  updateCustomerTable(filteredData);
  updateInsights(filteredData);
}

function initDashboard() {
  buildSelectOptions();
  initRiskPage();
  initCustomerRecords();
  refreshDashboard();

  filterGeography.addEventListener('change', refreshDashboard);
  filterGender.addEventListener('change', refreshDashboard);
  filterAgeGroup.addEventListener('change', refreshDashboard);
  filterProducts.addEventListener('change', refreshDashboard);
  filterActive.addEventListener('change', refreshDashboard);

  if (resetButton) {
    resetButton.addEventListener('click', () => {
      filterGeography.value = 'All';
      filterGender.value = 'All';
      filterAgeGroup.value = 'All';
      filterProducts.value = 'All';
      filterActive.value = 'All';
      refreshDashboard();
    });
  }

  const navButtons = document.querySelectorAll('.nav-link');
  const pages = document.querySelectorAll('.page');

  function showPage(pageKey) {
    pages.forEach((page) => {
      const isActive = page.dataset.page === pageKey;
      page.classList.toggle('page-hidden', !isActive);
    });
    navButtons.forEach((button) => button.classList.toggle('active', button.dataset.page === pageKey));
    if (pageKey === 'dashboard') {
      refreshDashboard();
    }
    if (pageKey === 'risk-insights') {
      refreshRiskPage();
    }
    if (pageKey === 'customer-records') {
      updateCustomerRecords(bankData);
    }
  }

  navButtons.forEach((button) => {
    button.addEventListener('click', () => showPage(button.dataset.page));
  });

  showPage('dashboard');

  const activeCanvas = document.getElementById('activeChart');
  if (activeCanvas) {
    activeCanvas.style.maxHeight = '320px';
  }

  const chartCards = document.querySelectorAll('.chart-card');
  chartCards.forEach((card) => {
    card.addEventListener('dblclick', () => {
      card.classList.toggle('expanded-chart');
      const canvas = card.querySelector('canvas');
      if (canvas) {
        setTimeout(() => {
          if (chartInstances.has(canvas.id)) {
            chartInstances.get(canvas.id).resize();
          }
        }, 100);
      }
    });
  });

  const downloadButton = document.getElementById('download-report');
  const downloadRiskButton = document.getElementById('download-risk-report');

  function exportPageContent(exportTarget, pageKey, filename, restorePageKey) {
    const visiblePage = document.querySelector('.page:not(.page-hidden)');
    const visiblePageKey = visiblePage?.dataset.page || 'dashboard';
    if (!exportTarget) return;

    function resizeCharts() {
      chartInstances.forEach((chart) => {
        chart.resize();
      });
    }

    function exportDashboard() {
      resizeCharts();
      window.scrollTo(0, 0);

      const options = {
        margin: 10,
        filename,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: {
          scale: 2,
          useCORS: true,
          backgroundColor: '#f8fafc',
          logging: true,
          windowWidth: 1400,
          scrollY: -window.scrollY,
        },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'landscape' },
      };

      html2pdf().set(options).from(exportTarget).save().finally(() => {
        if (restorePageKey) {
          showPage(restorePageKey);
        } else if (visiblePageKey && visiblePageKey !== pageKey) {
          showPage(visiblePageKey);
        }
      });
    }

    if (visiblePageKey !== pageKey) {
      showPage(pageKey);
      setTimeout(exportDashboard, 1000);
    } else {
      exportDashboard();
    }
  }

  if (downloadButton) {
    downloadButton.addEventListener('click', () => {
      const dashboardPage = document.querySelector('.page[data-page="dashboard"]');
      if (!dashboardPage) return;
      exportPageContent(dashboardPage, 'dashboard', 'bank-churn-dashboard.pdf');
    });
  }

  if (downloadRiskButton) {
    downloadRiskButton.addEventListener('click', () => {
      const riskPage = document.querySelector('.page[data-page="risk-insights"]');
      if (!riskPage) return;
      refreshRiskPage();
      setTimeout(() => {
        exportPageContent(riskPage, 'risk-insights', 'risk-insights.pdf', 'dashboard');
      }, 300);
    });
  }
}

window.addEventListener('DOMContentLoaded', initDashboard);
