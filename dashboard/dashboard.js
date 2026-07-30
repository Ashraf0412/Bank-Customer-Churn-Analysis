const filterGeography = document.getElementById('filter-geography');
const filterGender = document.getElementById('filter-gender');
const filterAgeGroup = document.getElementById('filter-age-group');
const filterProducts = document.getElementById('filter-products');
const filterActive = document.getElementById('filter-active');
const resetButton = document.querySelector('.reset-button');
const kpiContainer = document.getElementById('kpi-cards');
const customerTable = document.getElementById('customer-table');

let geoChart, genderChart, ageGroupChart, productChart, activeChart;
const chartInstances = new Map();

function groupBy(data, key) {
  return data.reduce((acc, item) => {
    const value = item[key] || 'Unknown';
    if (!acc[value]) acc[value] = [];
    acc[value].push(item);
    return acc;
  }, {});
}

function formatCurrency(value) {
  return value.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });
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
    const geographyMatch = filters.geography === 'All' || row.geography === filters.geography;
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
  const geographyOptions = [...new Set(bankData.map((row) => row.geography))].sort();
  const genderOptions = [...new Set(bankData.map((row) => row.gender))].sort();
  const ageGroupOptions = ['Under 30', '31-40', '41-50', '51+'];
  const productOptions = [...new Set(bankData.map((row) => row.num_of_products.toString()))].sort((a, b) => Number(a) - Number(b));
  const activeOptions = ['Yes', 'No'];

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
  const groupedGeo = groupBy(data, 'geography');
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
      options: { responsive: true, plugins: { legend: { position: 'bottom' } } },
    });
    chartInstances.set('activeChart', activeChart);
  } else {
    activeChart.data.datasets[0].data = activeValues;
    activeChart.update();
  }
}

function updateCustomerTable(data) {
  const rows = data
    .filter((row) => row.churned === 1)
    .sort((a, b) => b.balance - a.balance)
    .slice(0, 10)
    .map((row) => `
      <tr>
        <td>${row.customer_id}</td>
        <td>${row.geography}</td>
        <td>${row.gender}</td>
        <td>${row.age}</td>
        <td>${formatCurrency(row.balance)}</td>
        <td>${formatCurrency(row.estimated_salary)}</td>
        <td>${row.churned === 1 ? 'Yes' : 'No'}</td>
      </tr>`)
    .join('');

  customerTable.innerHTML = rows;
}

function refreshDashboard() {
  const filteredData = applyFilters(bankData);
  updateKPIs(filteredData);
  createCharts(filteredData);
  updateCustomerTable(filteredData);
}

function initDashboard() {
  buildSelectOptions();
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
  if (downloadButton) {
    downloadButton.addEventListener('click', () => {
      const exportTarget = document.querySelector('.dashboard-main');
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
          filename: 'bank-churn-dashboard.pdf',
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
          if (visiblePageKey !== 'dashboard') {
            showPage(visiblePageKey);
          }
        });
      }

      if (visiblePageKey !== 'dashboard') {
        showPage('dashboard');
        setTimeout(exportDashboard, 1000);
      } else {
        exportDashboard();
      }
    });
  }
}

window.addEventListener('DOMContentLoaded', initDashboard);
