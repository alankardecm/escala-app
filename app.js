// ===========================
// STATE MANAGEMENT
// ===========================
const AppState = {
    currentView: 'dashboard',
    currentMonth: new Date(2025, 11, 1), // Dezembro 2025
    employees: [],
    shifts: [],
    oncalls: [],
    holidays: [],
    schedule: {},
    sectors: []
};

// ===========================
// INITIAL DATA SETUP
// ===========================
const DEFAULT_SHIFTS = [
    { id: 't1', name: 'T1', time: '07:00 às 15:00', color: '#00b0f0' },
    { id: 't2', name: 'T2', time: '13:00 às 22:00', color: '#00b050' },
    { id: 't3', name: 'T3', time: '22:00 às 07:00', color: '#9966ff' },
    { id: 'fc', name: 'FC', time: '08:30 às 17:00', color: '#ff6b9d' },
    { id: 'fe', name: 'FE', time: '08:00 às 18:00', color: '#ffa500' },
    { id: 'f', name: 'F', time: 'Folga', color: '#4a4a6a' },
    { id: 'bh', name: 'BH', time: 'Banco de Horas', color: '#2d2d4a' },
    { id: 'yellow', name: 'Atestado', time: 'Atestado/Falta', color: '#ffeb3b' }
];

const DEFAULT_SECTORS = [
    'SUPORTE N1',
    'SUPORTE N2',
    'ATIVAÇÃO REDE',
    'TELEFONIA',
    'REDES',
    'REDES N3',
    'NT TECH'
];

const BRAZILIAN_HOLIDAYS_2025 = [
    { date: '2025-01-01', name: 'Ano Novo', type: 'Nacional' },
    { date: '2025-02-17', name: 'Carnaval', type: 'Nacional' },
    { date: '2025-04-18', name: 'Sexta-feira Santa', type: 'Nacional' },
    { date: '2025-04-21', name: 'Tiradentes', type: 'Nacional' },
    { date: '2025-05-01', name: 'Dia do Trabalho', type: 'Nacional' },
    { date: '2025-06-19', name: 'Corpus Christi', type: 'Nacional' },
    { date: '2025-09-07', name: 'Independência', type: 'Nacional' },
    { date: '2025-10-12', name: 'Nossa Senhora Aparecida', type: 'Nacional' },
    { date: '2025-11-02', name: 'Finados', type: 'Nacional' },
    { date: '2025-11-15', name: 'Proclamação da República', type: 'Nacional' },
    { date: '2025-11-20', name: 'Consciência Negra', type: 'Nacional' },
    { date: '2025-12-25', name: 'Natal', type: 'Nacional' }
];

// ===========================
// INITIALIZATION
// ===========================
document.addEventListener('DOMContentLoaded', () => {
    console.log('🚀 EscalaApp Iniciando...');
    setTimeout(() => initializeApp(), 1500);
});

function initializeApp() {
    // Hide loading screen
    document.getElementById('loadingScreen').style.display = 'none';
    document.getElementById('app').style.display = 'grid';

    // Load data from localStorage or set defaults
    loadAppData();

    // Auto-import if empty
    if (AppState.employees.length === 0 && typeof importCompleteData === 'function') {
        console.log('🚀 Sistema vazio detectado. Executando importação automática...');
        importCompleteData(true); // true = silencioso
    }

    // Setup event listeners
    setupEventListeners();

    // Render initial view
    renderDashboard();
    updateStats();
    updateMonthDisplay();

    console.log('✅ EscalaApp Pronto!');
}

function loadAppData() {
    const savedData = localStorage.getItem('escalaAppData');
    if (savedData) {
        try {
            const parsed = JSON.parse(savedData);
            AppState.employees = parsed.employees || [];
            AppState.shifts = parsed.shifts || DEFAULT_SHIFTS;
            AppState.oncalls = parsed.oncalls || [];
            AppState.holidays = parsed.holidays || BRAZILIAN_HOLIDAYS_2025;
            AppState.sectors = parsed.sectors || DEFAULT_SECTORS;
            AppState.schedule = parsed.schedule || {};
        } catch (e) {
            console.error('Erro ao carregar dados:', e);
            resetToDefaults();
        }
    } else {
        resetToDefaults();
    }
}

function resetToDefaults() {
    AppState.shifts = DEFAULT_SHIFTS;
    AppState.holidays = BRAZILIAN_HOLIDAYS_2025;
    AppState.sectors = DEFAULT_SECTORS;
    AppState.employees = [];
    AppState.oncalls = [];
    AppState.schedule = {};
    saveAppData();
}

function saveAppData() {
    const dataToSave = {
        employees: AppState.employees,
        shifts: AppState.shifts,
        oncalls: AppState.oncalls,
        holidays: AppState.holidays,
        sectors: AppState.sectors,
        schedule: AppState.schedule
    };
    localStorage.setItem('escalaAppData', JSON.stringify(dataToSave));
    console.log('💾 Dados salvos');
}

// ===========================
// EVENT LISTENERS
// ===========================
function setupEventListeners() {
    // Navigation
    document.querySelectorAll('.nav-item').forEach(item => {
        item.addEventListener('click', (e) => {
            const view = e.currentTarget.dataset.view;
            switchView(view);
        });
    });

    // Month navigation
    document.getElementById('prevMonth').addEventListener('click', () => changeMonth(-1));
    document.getElementById('nextMonth').addEventListener('click', () => changeMonth(1));

    // Generate schedule button
    document.getElementById('generateSchedule').addEventListener('click', generateSmartSchedule);

    // Action buttons
    document.getElementById('addEmployee').addEventListener('click', showAddEmployeeModal);
    document.getElementById('addShift').addEventListener('click', showAddShiftModal);
    document.getElementById('addOncall').addEventListener('click', showAddOncallModal);
    document.getElementById('addHoliday').addEventListener('click', showAddHolidayModal);

    // Export/Import
    document.querySelector('.btn-export').addEventListener('click', exportToExcel);
    document.getElementById('quickImport').addEventListener('click', () => importCompleteData(false));
    document.getElementById('importExcel').addEventListener('click', importFromExcel);
    document.getElementById('exportData').addEventListener('click', exportData);
    document.getElementById('clearData').addEventListener('click', clearAllData);
}

// ===========================
// VIEW SWITCHING
// ===========================
function switchView(viewName) {
    // Update navigation
    document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.toggle('active', item.dataset.view === viewName);
    });

    // Update views
    document.querySelectorAll('.view').forEach(view => {
        view.classList.remove('active');
    });
    document.getElementById(`${viewName}View`).classList.add('active');

    // Update header
    const titles = {
        dashboard: { title: 'Dashboard', subtitle: 'Visão geral do sistema de escalas' },
        calendar: { title: 'Escala do Mês', subtitle: 'Visualizar e gerenciar a escala mensal' },
        employees: { title: 'Funcionários', subtitle: 'Gerenciar cadastro de funcionários' },
        shifts: { title: 'Turnos', subtitle: 'Configurar horários de trabalho' },
        oncall: { title: 'Plantões', subtitle: 'Gerenciar escalas de plantão' },
        holidays: { title: 'Feriados', subtitle: 'Gerenciar feriados e folgas especiais' },
        settings: { title: 'Configurações', subtitle: 'Importar/Exportar dados do sistema' }
    };

    document.getElementById('pageTitle').textContent = titles[viewName].title;
    document.getElementById('pageSubtitle').textContent = titles[viewName].subtitle;

    AppState.currentView = viewName;

    // Render view content
    switch (viewName) {
        case 'dashboard':
            renderDashboard();
            break;
        case 'calendar':
            renderCalendar();
            break;
        case 'employees':
            renderEmployees();
            break;
        case 'shifts':
            renderShifts();
            break;
        case 'oncall':
            renderOncall();
            break;
        case 'holidays':
            renderHolidays();
            break;
    }
}

// ===========================
// MONTH NAVIGATION
// ===========================
function changeMonth(delta) {
    AppState.currentMonth = new Date(
        AppState.currentMonth.getFullYear(),
        AppState.currentMonth.getMonth() + delta,
        1
    );
    updateMonthDisplay();
    if (AppState.currentView === 'calendar') {
        renderCalendar();
    }
}

function updateMonthDisplay() {
    const months = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
        'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
    const monthStr = `${months[AppState.currentMonth.getMonth()]} ${AppState.currentMonth.getFullYear()}`;
    document.getElementById('currentMonth').textContent = monthStr;
}

// ===========================
// DASHBOARD RENDERING
// ===========================
function renderDashboard() {
    updateStats();
    renderSectorsOverview();
    renderUpcomingHolidays();
}

function updateStats() {
    document.getElementById('totalEmployees').textContent = AppState.employees.length;
    document.getElementById('totalShifts').textContent = AppState.shifts.length;
    document.getElementById('totalOncall').textContent = AppState.oncalls.length;

    const currentMonthHolidays = AppState.holidays.filter(h => {
        const holidayDate = new Date(h.date);
        return holidayDate.getMonth() === AppState.currentMonth.getMonth() &&
            holidayDate.getFullYear() === AppState.currentMonth.getFullYear();
    });
    document.getElementById('totalHolidays').textContent = currentMonthHolidays.length;
}

function renderSectorsOverview() {
    const container = document.getElementById('sectorsOverview');
    if (AppState.sectors.length === 0) {
        container.innerHTML = '<p class="empty-state">Nenhum setor cadastrado ainda</p>';
        return;
    }

    const sectorCounts = AppState.sectors.map(sector => ({
        name: sector,
        count: AppState.employees.filter(e => e.sector === sector).length
    }));

    container.innerHTML = sectorCounts.map(s => `
        <div style="display: flex; justify-content: space-between; padding: 0.75rem 0; border-bottom: 1px solid var(--border-color);">
            <span style="font-weight: 500;">${s.name}</span>
            <span style="color: var(--text-secondary);">${s.count} funcionário${s.count !== 1 ? 's' : ''}</span>
        </div>
    `).join('');
}

function renderUpcomingHolidays() {
    const container = document.getElementById('upcomingHolidays');

    // Sort holidays by date
    const sortedHolidays = [...AppState.holidays].sort((a, b) => new Date(a.date) - new Date(b.date));

    // Filter for future holidays (or current month)
    const today = new Date();
    const futureHolidays = sortedHolidays.filter(h => new Date(h.date) >= new Date(today.getFullYear(), today.getMonth(), 1));

    if (futureHolidays.length === 0) {
        container.innerHTML = '<p class="empty-state">Nenhum feriado próximo</p>';
        return;
    }

    container.innerHTML = futureHolidays.slice(0, 3).map(h => {
        const date = new Date(h.date);
        const day = date.getDate();
        const month = date.toLocaleString('pt-BR', { month: 'short' });

        return `
        <div style="display: flex; justify-content: space-between; align-items: center; padding: 0.75rem 0; border-bottom: 1px solid var(--border-color);">
            <div>
                <div style="font-weight: 500;">${h.name}</div>
                <div style="font-size: 0.8rem; color: var(--text-secondary);">${h.type}</div>
            </div>
            <div style="color: var(--primary-color); font-weight: 600;">${day} de ${month}</div>
        </div>
    `}).join('');
}

// ===========================
// CALENDAR RENDERING
// ===========================
function renderCalendar() {
    const tableBody = document.getElementById('scheduleBody');
    const tableHeader = document.getElementById('calendarHeader');
    const legendContainer = document.getElementById('shiftLegend');

    // Clear existing
    tableBody.innerHTML = '';
    legendContainer.innerHTML = '';

    // Render Legend
    AppState.shifts.forEach(shift => {
        const item = document.createElement('div');
        item.className = 'legend-item';
        item.innerHTML = `
            <div class="legend-color" style="background-color: ${shift.color}"></div>
            <span>${shift.name}</span>
        `;
        legendContainer.appendChild(item);
    });

    // Setup dates
    const year = AppState.currentMonth.getFullYear();
    const month = AppState.currentMonth.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    // Reset header (keep first 3 columns)
    while (tableHeader.children.length > 3) {
        tableHeader.removeChild(tableHeader.lastChild);
    }

    // Add date columns
    for (let i = 1; i <= daysInMonth; i++) {
        const date = new Date(year, month, i);
        const dayOfWeek = date.toLocaleDateString('pt-BR', { weekday: 'short' }).slice(0, 3);
        const th = document.createElement('th');
        th.innerHTML = `${i}<br><span style="font-size: 0.8rem; font-weight: normal;">${dayOfWeek}</span>`;

        // Highlight weekends
        if (date.getDay() === 0 || date.getDay() === 6) {
            th.style.backgroundColor = 'rgba(255, 255, 255, 0.05)';
        }

        tableHeader.appendChild(th);
    }

    // Check if schedule exists for this month
    const monthKey = `${year}-${String(month + 1).padStart(2, '0')}`;
    const currentSchedule = AppState.schedule[monthKey];

    if (!currentSchedule) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="${daysInMonth + 3}" class="empty-state">
                    Nenhuma escala gerada para este mês. Clique em "Gerar Escala".
                </td>
            </tr>
        `;
        return;
    }

    // Group employees by sector
    const employeesBySector = {};
    AppState.sectors.forEach(sector => {
        employeesBySector[sector] = AppState.employees.filter(e => e.sector === sector);
    });

    // Render rows
    Object.keys(employeesBySector).forEach(sector => {
        if (employeesBySector[sector].length === 0) return;

        // Sector header row
        const sectorRow = document.createElement('tr');
        sectorRow.innerHTML = `
            <td colspan="${daysInMonth + 3}" style="background-color: rgba(102, 126, 234, 0.1); font-weight: bold; padding: 0.75rem;">
                ${sector}
            </td>
        `;
        tableBody.appendChild(sectorRow);

        // Employee rows
        employeesBySector[sector].forEach(emp => {
            const tr = document.createElement('tr');

            // Employee info
            const shiftName = AppState.shifts.find(s => s.id === emp.shiftId)?.name || emp.shiftId;
            tr.innerHTML = `
                <td>${emp.sector}</td>
                <td style="font-weight: 500;">${emp.name}</td>
                <td>${shiftName}</td>
            `;

            // Days
            for (let i = 1; i <= daysInMonth; i++) {
                const dayKey = String(i).padStart(2, '0');
                const shiftId = currentSchedule[emp.id]?.[dayKey];
                const shift = AppState.shifts.find(s => s.id === shiftId);

                const td = document.createElement('td');
                td.className = 'shift-cell';

                if (shift) {
                    td.textContent = shift.name;
                    td.style.backgroundColor = shift.color;
                    td.style.color = getContrastColor(shift.color);
                } else {
                    td.textContent = '-';
                }

                tr.appendChild(td);
            }

            tableBody.appendChild(tr);
        });
    });
}

// ===========================
// CRUD OPERATIONS (Simplified)
// ===========================
function renderEmployees() {
    const tbody = document.getElementById('employeesTable');
    if (AppState.employees.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" class="empty-state">Nenhum funcionário cadastrado</td></tr>';
        return;
    }

    tbody.innerHTML = AppState.employees.map(emp => {
        const shift = AppState.shifts.find(s => s.id === emp.shiftId);
        return `
        <tr>
            <td>${emp.name}</td>
            <td><span class="badge">${emp.sector}</span></td>
            <td>${shift ? shift.name : emp.shiftId}</td>
            <td style="font-family: monospace; font-size: 0.8rem;">${emp.pattern || '-'}</td>
            <td>
                <button class="btn-icon btn-sm" onclick="deleteEmployee('${emp.id}')" style="color: #ff6b6b;">
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M4 4L12 12M12 4L4 12" stroke="currentColor" stroke-width="2"/></svg>
                </button>
            </td>
        </tr>
    `}).join('');
}

function renderShifts() {
    const grid = document.getElementById('shiftsGrid');
    grid.innerHTML = AppState.shifts.map(shift => `
        <div class="card">
            <div class="card-body">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem;">
                    <h4 style="margin: 0;">${shift.name}</h4>
                    <div style="width: 20px; height: 20px; border-radius: 50%; background-color: ${shift.color};"></div>
                </div>
                <p style="color: var(--text-secondary); font-size: 0.9rem;">${shift.time}</p>
            </div>
        </div>
    `).join('');
}

function renderOncall() {
    const container = document.getElementById('oncallContainer');
    if (AppState.oncalls.length === 0) {
        container.innerHTML = '<p class="empty-state">Nenhum plantão configurado</p>';
        return;
    }

    container.innerHTML = AppState.oncalls.map(oncall => `
        <div class="card" style="margin-bottom: 1rem;">
            <div class="card-header">
                <h4>${oncall.name}</h4>
                <button class="btn-icon btn-sm" onclick="deleteOncall('${oncall.id}')">
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M4 4L12 12M12 4L4 12" stroke="currentColor" stroke-width="2"/></svg>
                </button>
            </div>
            <div class="card-body">
                <p style="margin-bottom: 0.5rem; font-size: 0.9rem; color: var(--text-secondary);">Rotação Semanal:</p>
                <div style="display: flex; gap: 0.5rem; flex-wrap: wrap;">
                    ${oncall.rotation.map((person, idx) => `
                        <span class="badge" style="background: rgba(255,255,255,0.1);">
                            ${idx + 1}. ${person}
                        </span>
                    `).join('')}
                </div>
            </div>
        </div>
    `).join('');
}

function renderHolidays() {
    const tbody = document.getElementById('holidaysTable');
    // Sort by date
    const sortedHolidays = [...AppState.holidays].sort((a, b) => new Date(a.date) - new Date(b.date));

    tbody.innerHTML = sortedHolidays.map(h => {
        const date = new Date(h.date).toLocaleDateString('pt-BR');
        return `
        <tr>
            <td>${date}</td>
            <td>${h.name}</td>
            <td><span class="badge">${h.type}</span></td>
            <td>
                <button class="btn-icon btn-sm" onclick="deleteHoliday('${h.date}')" style="color: #ff6b6b;">
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M4 4L12 12M12 4L4 12" stroke="currentColor" stroke-width="2"/></svg>
                </button>
            </td>
        </tr>
    `}).join('');
}

// ===========================
// MODAL & UTILS (Placeholders)
// ===========================
function showAddEmployeeModal() { alert('Funcionalidade em desenvolvimento: Adicionar Funcionário'); }
function showAddShiftModal() { alert('Funcionalidade em desenvolvimento: Adicionar Turno'); }
function showAddOncallModal() { alert('Funcionalidade em desenvolvimento: Adicionar Plantão'); }
function showAddHolidayModal() { alert('Funcionalidade em desenvolvimento: Adicionar Feriado'); }

function deleteEmployee(id) {
    if (confirm('Tem certeza que deseja remover este funcionário?')) {
        AppState.employees = AppState.employees.filter(e => e.id !== id);
        saveAppData();
        renderEmployees();
        updateStats();
    }
}

function deleteOncall(id) {
    if (confirm('Remover este plantão?')) {
        AppState.oncalls = AppState.oncalls.filter(o => o.id !== id);
        saveAppData();
        renderOncall();
        updateStats();
    }
}

function deleteHoliday(date) {
    if (confirm('Remover este feriado?')) {
        AppState.holidays = AppState.holidays.filter(h => h.date !== date);
        saveAppData();
        renderHolidays();
        updateStats();
    }
}

// ===========================
// EXPORT / IMPORT
// ===========================
function exportData() {
    const dataStr = JSON.stringify(AppState, null, 2);
    const blob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = `escala_backup_${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
}

function importFromExcel() {
    alert('Funcionalidade em desenvolvimento. Use a "Importação Rápida" por enquanto.');
}

function exportToExcel() {
    alert('Funcionalidade em desenvolvimento. Use "Exportar Dados" para backup JSON.');
}

function clearAllData() {
    if (confirm('ATENÇÃO: Isso apagará TODOS os dados do sistema. Tem certeza?')) {
        localStorage.removeItem('escalaAppData');
        location.reload();
    }
}

// Helper
function generateId() {
    return Math.random().toString(36).substr(2, 9);
}

function isDateHoliday(date) {
    const dateStr = date.toISOString().split('T')[0];
    return AppState.holidays.some(h => h.date === dateStr);
}

function getContrastColor(hexcolor) {
    // If hexcolor is not valid, return white
    if (!hexcolor || !hexcolor.startsWith('#')) return '#ffffff';

    const r = parseInt(hexcolor.substr(1, 2), 16);
    const g = parseInt(hexcolor.substr(3, 2), 16);
    const b = parseInt(hexcolor.substr(5, 2), 16);
    const yiq = ((r * 299) + (g * 587) + (b * 114)) / 1000;
    return (yiq >= 128) ? '#000000' : '#ffffff';
}
