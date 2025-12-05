// ===========================
// SUPABASE CONFIGURATION
// ===========================
const supabaseUrl = 'https://pswoertvywdqcuqailtn.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBzd29lcnR2eXdkcWN1cWFpbHRuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQyNjMzNzMsImV4cCI6MjA3OTgzOTM3M30.JbFQQxtDbCz8f8XoGrRyetzaN6Dj6MOpebfml3vcmPM';

let supabase;
try {
    if (window.supabase) {
        supabase = window.supabase.createClient(supabaseUrl, supabaseKey);
        console.log('✅ Supabase initialized');
    } else {
        console.error('❌ Supabase library not loaded!');
        alert('Erro Crítico: Biblioteca do Supabase não carregou. Verifique sua internet.');
    }
} catch (e) {
    console.error('❌ Error initializing Supabase:', e);
}

// ===========================
// STATE MANAGEMENT
// ===========================
const AppState = {
    employees: [],
    shifts: [],
    oncalls: [],
    holidays: [],
    schedule: {},
    sectors: [],
    vacations: [],
    currentMonth: new Date(),
    currentView: 'dashboard'
};

// ===========================
// INITIALIZATION
// ===========================
document.addEventListener('DOMContentLoaded', () => {
    initializeApp();
});

async function initializeApp() {
    console.log('🚀 Initializing App...');

    // Theme Initialization
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'light') {
        document.body.classList.add('light-mode');
    }

    if (supabase) {
        await loadAppData();
    } else {
        console.warn('⚠️ Running without Supabase connection');
    }

    setupEventListeners();
    updateMonthDisplay();
    renderDashboard();

    // Hide Loading Screen & Show App
    const loadingScreen = document.getElementById('loadingScreen');
    const appContainer = document.getElementById('app');

    if (loadingScreen) loadingScreen.style.display = 'none';
    if (appContainer) appContainer.style.display = 'flex';

    console.log('✅ App Initialized');
}

async function loadAppData() {
    try {
        console.log('📥 Loading data from Supabase...');

        // Fetch core data
        const [empRes, shiftRes, oncallRes, holidayRes, scheduleRes] = await Promise.all([
            supabase.from('employees').select('*'),
            supabase.from('shifts').select('*'),
            supabase.from('oncalls').select('*'),
            supabase.from('holidays').select('*'),
            supabase.from('monthly_schedules').select('*')
        ]);

        if (empRes.error) throw empRes.error;
        if (shiftRes.error) throw shiftRes.error;
        if (oncallRes.error) throw oncallRes.error;
        if (holidayRes.error) throw holidayRes.error;
        if (scheduleRes.error) throw scheduleRes.error;

        // Try to fetch vacations (might fail if table doesn't exist yet)
        let vacationsData = [];
        try {
            const { data, error } = await supabase.from('vacations').select('*');
            if (error) {
                console.warn('⚠️ Could not load vacations (Table might be missing):', error.message);
            } else {
                vacationsData = data;
            }
        } catch (err) {
            console.warn('⚠️ Error fetching vacations:', err);
        }

        // Map Supabase data to AppState
        AppState.employees = empRes.data.map(e => ({
            id: e.id,
            name: e.name,
            sector: e.sector,
            shiftId: e.shift_id,
            weekendRule: e.weekend_rule
        }));

        AppState.shifts = shiftRes.data.map(s => ({
            id: s.id,
            name: s.name,
            time: s.time,
            color: s.color
        }));

        AppState.oncalls = oncallRes.data.map(o => ({
            id: o.id,
            name: o.name,
            startDate: o.start_date,
            rotation: o.rotation
        }));

        AppState.holidays = holidayRes.data.map(h => ({
            date: h.date,
            name: h.name,
            type: h.type
        }));

        AppState.vacations = vacationsData.map(v => ({
            id: v.id,
            employeeName: v.employee_name,
            start: v.start_date,
            end: v.end_date
        }));

        // Convert schedule array back to object map
        AppState.schedule = {};
        scheduleRes.data.forEach(item => {
            AppState.schedule[item.month_key] = item.data;
        });

        // Rebuild Sectors list
        AppState.sectors = [...new Set(AppState.employees.map(e => e.sector))];

        console.log('✅ Data loaded successfully');

    } catch (error) {
        console.error('❌ Error loading data:', error);
        alert('Erro ao carregar dados. Verifique o console para mais detalhes.');
    }
}

async function saveAppData() {
    console.log('Saving data to Supabase...');

    try {
        // 1. Upsert Employees
        const employeesData = AppState.employees.map(e => ({
            id: e.id,
            name: e.name,
            sector: e.sector,
            shift_id: e.shiftId,
            weekend_rule: e.weekendRule
        }));
        if (employeesData.length > 0) {
            await supabase.from('employees').upsert(employeesData);
        }

        // 2. Upsert Shifts
        const shiftsData = AppState.shifts.map(s => ({
            id: s.id,
            name: s.name,
            time: s.time,
            color: s.color
        }));
        if (shiftsData.length > 0) {
            await supabase.from('shifts').upsert(shiftsData);
        }

        // 3. Upsert Oncalls
        const oncallsData = AppState.oncalls.map(o => ({
            id: o.id,
            name: o.name,
            start_date: o.startDate,
            rotation: o.rotation
        }));
        if (oncallsData.length > 0) {
            await supabase.from('oncalls').upsert(oncallsData);
        }

        // 4. Upsert Holidays
        const holidaysData = AppState.holidays.map(h => ({
            date: h.date,
            name: h.name,
            type: h.type
        }));
        if (holidaysData.length > 0) {
            await supabase.from('holidays').upsert(holidaysData);
        }

        // 5. Upsert Vacations
        const vacationsData = AppState.vacations.map(v => ({
            id: v.id,
            employee_name: v.employeeName,
            start_date: v.start,
            end_date: v.end
        }));
        if (vacationsData.length > 0) {
            await supabase.from('vacations').upsert(vacationsData);
        }

        // 6. Upsert Schedule
        const year = AppState.currentMonth.getFullYear();
        const month = AppState.currentMonth.getMonth();
        const monthKey = `${year}-${String(month + 1).padStart(2, '0')}`;

        if (AppState.schedule[monthKey]) {
            await supabase.from('monthly_schedules').upsert({
                month_key: monthKey,
                data: AppState.schedule[monthKey]
            });
        }

        console.log('✅ Data saved to Supabase');

    } catch (error) {
        console.error('Error saving data:', error);
    }
}

function setupEventListeners() {
    // Navigation
    document.querySelectorAll('.nav-item').forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            const view = item.dataset.view;
            switchView(view);
        });
    });

    // Theme Toggle
    const themeToggleBtn = document.getElementById('themeToggle');
    if (themeToggleBtn) {
        themeToggleBtn.addEventListener('click', () => {
            document.body.classList.toggle('light-mode');
            const isLight = document.body.classList.contains('light-mode');
            localStorage.setItem('theme', isLight ? 'light' : 'dark');
        });
    }

    // Month Navigation
    document.getElementById('prevMonth').addEventListener('click', () => changeMonth(-1));
    document.getElementById('nextMonth').addEventListener('click', () => changeMonth(1));

    // Actions
    document.getElementById('generateSchedule').addEventListener('click', generateSchedule);
    document.getElementById('addEmployee').addEventListener('click', showAddEmployeeModal);
    document.getElementById('addShift').addEventListener('click', showAddShiftModal);
    document.getElementById('addOncall').addEventListener('click', showAddOncallModal);
    document.getElementById('addHoliday').addEventListener('click', showAddHolidayModal);

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
    document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.toggle('active', item.dataset.view === viewName);
    });
    document.querySelectorAll('.view').forEach(view => {
        view.classList.remove('active');
    });
    document.getElementById(`${viewName}View`).classList.add('active');

    const titles = {
        dashboard: { title: 'Dashboard', subtitle: 'Visão geral do sistema de escalas' },
        calendar: { title: 'Escala do Mês', subtitle: 'Visualizar e gerenciar a escala mensal' },
        employees: { title: 'Funcionários', subtitle: 'Gerenciar cadastro de funcionários e férias' },
        shifts: { title: 'Turnos', subtitle: 'Configurar horários de trabalho' },
        oncall: { title: 'Plantões', subtitle: 'Gerenciar escalas de plantão' },
        holidays: { title: 'Feriados', subtitle: 'Gerenciar feriados e folgas especiais' },
        reports: { title: 'Relatórios de Horas', subtitle: 'Acompanhamento de horas extras e sobreaviso' },
        settings: { title: 'Configurações', subtitle: 'Importar/Exportar dados do sistema' }
    };

    document.getElementById('pageTitle').textContent = titles[viewName].title;
    document.getElementById('pageSubtitle').textContent = titles[viewName].subtitle;

    AppState.currentView = viewName;

    switch (viewName) {
        case 'dashboard': renderDashboard(); break;
        case 'calendar': renderCalendar(); break;
        case 'employees': renderEmployees(); break;
        case 'shifts': renderShifts(); break;
        case 'oncall': renderOncall(); break;
        case 'holidays': renderHolidays(); break;
        case 'reports': renderReports(); break;
    }
}

// ===========================
// REPORTS RENDERING
// ===========================
function renderReports() {
    renderWeekendSupportReport();
    renderOnCallReports();
}

function renderWeekendSupportReport() {
    const summaryBody = document.getElementById('weekendSupportSummaryBody');
    const detailBody = document.getElementById('weekendSupportDetailBody');

    summaryBody.innerHTML = '';
    detailBody.innerHTML = '';

    const year = AppState.currentMonth.getFullYear();
    const month = AppState.currentMonth.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const monthKey = `${year}-${String(month + 1).padStart(2, '0')}`;
    const schedule = AppState.schedule[monthKey];

    if (!schedule) {
        detailBody.innerHTML = '<tr><td colspan="6" class="empty-state">Nenhuma escala gerada para este mês.</td></tr>';
        return;
    }

    const employeeHours = {}; // { empId: totalHours }
    const details = [];

    // Initialize hours for all employees
    AppState.employees.forEach(e => employeeHours[e.id] = 0);

    for (let day = 1; day <= daysInMonth; day++) {
        const date = new Date(year, month, day);
        const dayOfWeek = date.getDay(); // 0=Sun, 6=Sat
        const isHoliday = isDateHoliday(date);

        // Filter: Only Weekends or Holidays
        if (dayOfWeek !== 0 && dayOfWeek !== 6 && !isHoliday) continue;

        AppState.employees.forEach(emp => {
            const shiftId = schedule[emp.id]?.[String(day).padStart(2, '0')];
            if (!shiftId) return;

            const shift = AppState.shifts.find(s => s.id === shiftId);
            if (!shift) return;

            // Calculate Hours
            // Ignore 'f', 'fe', 'bh', 'at', 'ft'
            if (['f', 'fe', 'bh', 'at', 'ft'].includes(shift.id)) return;

            let hours = 0;
            let timeStr = shift.time;

            if (shift.id === '12x36') {
                hours = 12;
            } else {
                // Parse "07:00 às 16:00"
                const times = timeStr.match(/(\d{2}):(\d{2})/g);
                if (times && times.length >= 2) {
                    const [h1, m1] = times[0].split(':').map(Number);
                    const [h2, m2] = times[1].split(':').map(Number);

                    let diff = (h2 * 60 + m2) - (h1 * 60 + m1);
                    if (diff < 0) diff += 24 * 60; // Crosses midnight

                    // Subtract 1 hour lunch if > 6 hours (Assumption based on standard laws, can be adjusted)
                    // Actually, let's stick to raw duration or check if user wants lunch deducted.
                    // Image shows "8:00:00" for 8h to 16:00. That's 8 hours. 
                    // So 16 - 8 = 8. No lunch deduction in the display?
                    // Let's assume raw difference for now.
                    hours = diff / 60;
                }
            }

            if (hours > 0) {
                employeeHours[emp.id] += hours;
                details.push({
                    date: date.toLocaleDateString('pt-BR'),
                    day: date.toLocaleDateString('pt-BR', { weekday: 'short' }),
                    name: emp.name,
                    turn: shift.name,
                    time: shift.time,
                    hours: hours
                });
            }
        });
    }

    // Render Summary
    const sortedEmployees = AppState.employees
        .filter(e => employeeHours[e.id] > 0)
        .sort((a, b) => employeeHours[b.id] - employeeHours[a.id]);

    summaryBody.innerHTML = sortedEmployees.map(emp => `
        <tr>
            <td>${emp.name}</td>
            <td style="font-weight: bold;">${employeeHours[emp.id].toFixed(2)}h</td>
        </tr>
    `).join('');

    // Render Details
    detailBody.innerHTML = details.map(d => `
        <tr>
            <td>${d.date}</td>
            <td>${d.day}</td>
            <td>${d.name}</td>
            <td><span class="badge">${d.turn}</span></td>
            <td style="font-size: 0.8rem;">${d.time}</td>
            <td>${d.hours.toFixed(2)}h</td>
        </tr>
    `).join('');
}

function renderOnCallReports() {
    const container = document.getElementById('onCallReportsContainer');
    container.innerHTML = '';

    const year = AppState.currentMonth.getFullYear();
    const month = AppState.currentMonth.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    // Define Rules for each On-Call Type (Hardcoded based on requirements)
    const onCallRules = {
        'PLANTÃO NOC': {
            weekdays: { start: 22, end: 7, hours: 9 },
            weekends: { start: 22, end: 8, hours: 10 }, // Sat, Sun, Holiday
            color: '#4caf50' // Green
        },
        'PLANTÃO VOZ': {
            weekdays: { start: 18, end: 8, hours: 14 },
            weekends: { start: 8, end: 8, hours: 24 },
            color: '#9c27b0' // Purple
        },
        'PLANTÃO TECH': {
            weekdays: { start: 22, end: 8, hours: 10 },
            weekends: { start: 8, end: 8, hours: 24 },
            color: '#ff9800' // Orange
        },
        'PLANTÃO N3': {
            weekdays: { start: 0, end: 0, hours: 0 }, // Not specified in images, assuming standard or 0
            weekends: { start: 0, end: 0, hours: 0 },
            color: '#2196f3' // Blue
        }
    };

    // We need to map the "oncalls" from AppState to these rules
    // AppState.oncalls has { name: "PLANTÃO NOC", ... }

    AppState.oncalls.forEach(oncall => {
        const rule = onCallRules[oncall.name.toUpperCase()] || onCallRules['PLANTÃO NOC']; // Fallback

        // Calculate Hours
        const employeeHours = {};
        const details = [];

        // We need to reconstruct the rotation for the month
        // Logic similar to generateSchedule but just for reading
        const startDate = new Date(oncall.startDate);
        const rotation = oncall.rotation;

        for (let day = 1; day <= daysInMonth; day++) {
            const date = new Date(year, month, day);
            const dayOfWeek = date.getDay(); // 0=Sun, 6=Sat
            const isHoliday = isDateHoliday(date);
            const isWeekendOrHoliday = dayOfWeek === 0 || dayOfWeek === 6 || isHoliday;

            const diffTime = date.getTime() - startDate.getTime();
            const diffWeeks = Math.floor(diffTime / (1000 * 60 * 60 * 24 * 7));

            if (diffWeeks < 0) continue;

            const personName = rotation[diffWeeks % rotation.length];

            // Determine hours based on rule
            let hours = isWeekendOrHoliday ? rule.weekends.hours : rule.weekdays.hours;
            let start = isWeekendOrHoliday ? rule.weekends.start : rule.weekdays.start;
            let end = isWeekendOrHoliday ? rule.weekends.end : rule.weekdays.end;

            if (hours > 0) {
                if (!employeeHours[personName]) employeeHours[personName] = 0;
                employeeHours[personName] += hours;

                details.push({
                    date: date.toLocaleDateString('pt-BR'),
                    name: personName,
                    start: `${start}:00`,
                    end: `${end}:00`,
                    hours: hours
                });
            }
        }

        // Create UI for this On-Call
        const section = document.createElement('div');
        section.className = 'card';
        section.style.marginBottom = '2rem';

        const summaryRows = Object.entries(employeeHours)
            .sort(([, a], [, b]) => b - a)
            .map(([name, hours]) => `
                <tr>
                    <td>${name}</td>
                    <td style="font-weight: bold;">${hours.toFixed(2)}h</td>
                </tr>
            `).join('');

        const detailRows = details.map(d => `
            <tr>
                <td>${d.date}</td>
                <td>${d.name}</td>
                <td>${d.start}</td>
                <td>${d.end}</td>
                <td>${d.hours.toFixed(2)}h</td>
            </tr>
        `).join('');

        section.innerHTML = `
            <div class="card-header" style="background: linear-gradient(90deg, ${rule.color}20 0%, transparent 100%); border-left: 4px solid ${rule.color};">
                <h3>${oncall.name} - Sobreaviso</h3>
            </div>
            <div class="card-body">
                <div class="table-container" style="margin-bottom: 1.5rem;">
                    <table class="data-table">
                        <thead>
                            <tr>
                                <th>Nome</th>
                                <th>Total Horas</th>
                            </tr>
                        </thead>
                        <tbody>${summaryRows}</tbody>
                    </table>
                </div>
                <div class="table-container">
                    <h4 style="margin: 1rem 0; color: var(--text-secondary);">Detalhamento Diário</h4>
                    <table class="data-table">
                        <thead>
                            <tr>
                                <th>Data</th>
                                <th>Nome</th>
                                <th>Início</th>
                                <th>Fim</th>
                                <th>Qtd. Horas</th>
                            </tr>
                        </thead>
                        <tbody>${detailRows}</tbody>
                    </table>
                </div>
            </div>
        `;

        container.appendChild(section);
    });
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
    if (AppState.currentView === 'calendar') renderCalendar();
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
    const sortedHolidays = [...AppState.holidays].sort((a, b) => new Date(a.date) - new Date(b.date));
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
            <div style="color: var(--primary); font-weight: 600;">${day} de ${month}</div>
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

    tableBody.innerHTML = '';
    legendContainer.innerHTML = '';

    // Render Legend
    AppState.shifts.forEach(shift => {
        const item = document.createElement('div');
        item.className = 'legend-item';
        item.innerHTML = `
            <div class="legend-color" style="background-color: ${shift.color}40; border: 1px solid ${shift.color}"></div>
            <span>${shift.name}</span>
        `;
        legendContainer.appendChild(item);
    });

    const year = AppState.currentMonth.getFullYear();
    const month = AppState.currentMonth.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    while (tableHeader.children.length > 3) {
        tableHeader.removeChild(tableHeader.lastChild);
    }

    for (let i = 1; i <= daysInMonth; i++) {
        const date = new Date(year, month, i);
        const dayOfWeek = date.toLocaleDateString('pt-BR', { weekday: 'short' }).slice(0, 3);
        const th = document.createElement('th');
        th.innerHTML = `${i}<br><span style="font-size: 0.8rem; font-weight: normal;">${dayOfWeek}</span>`;
        if (date.getDay() === 0 || date.getDay() === 6) {
            th.style.backgroundColor = 'rgba(255, 255, 255, 0.05)';
        }
        tableHeader.appendChild(th);
    }

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

    // 1. RENDER ON-CALL ROWS
    if (AppState.oncalls.length > 0) {
        const onCallHeader = document.createElement('tr');
        onCallHeader.innerHTML = `
            <td colspan="${daysInMonth + 3}" style="background: linear-gradient(90deg, rgba(191, 216, 62, 0.15) 0%, transparent 100%); color: #BFD83E; font-weight: bold; padding: 1rem; border-bottom: 1px solid rgba(191, 216, 62, 0.3); text-align: left; letter-spacing: 1px;">
                <span style="margin-right: 8px;">★</span> ESCALA DE PLANTÃO
            </td>
        `;
        tableBody.appendChild(onCallHeader);

        AppState.oncalls.forEach(oncall => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td colspan="3" style="font-weight:600; color: var(--text-primary); text-align: left; padding-left: 1rem; border-right: 1px solid var(--border-color); background: var(--bg-card);">
                    ${oncall.name}
                </td>
            `;

            for (let day = 1; day <= daysInMonth; day++) {
                const date = new Date(year, month, day);
                const dayOfWeek = date.getDay();
                const td = document.createElement('td');

                if (dayOfWeek === 0 || dayOfWeek === 6) {
                    td.style.backgroundColor = 'var(--bg-tertiary)';
                }

                const assigned = oncall.schedule[day];
                if (assigned) {
                    td.innerHTML = `
                        <div style="
                            background-color: var(--bg-card); 
                            color: var(--text-primary); 
                            border: 1px solid var(--primary); 
                            border-radius: 4px; 
                            padding: 2px 4px; 
                            font-size: 0.7rem; 
                            font-weight: 600;
                            white-space: nowrap;
                            overflow: hidden;
                            text-overflow: ellipsis;
                            box-shadow: 0 1px 2px rgba(0,0,0,0.05);
                        ">
                            ${assigned}
                        </div>
                    `;
                }
                tr.appendChild(td);
            }
            tableBody.appendChild(tr);
        });
    }

    // 2. RENDER EMPLOYEE ROWS
    const employeesBySector = {};
    AppState.employees.forEach(emp => {
        if (!employeesBySector[emp.sector]) {
            employeesBySector[emp.sector] = [];
        }
        employeesBySector[emp.sector].push(emp);
    });

    Object.keys(employeesBySector).forEach(sector => {
        const sectorHeader = document.createElement('tr');
        sectorHeader.innerHTML = `
            <td colspan="${daysInMonth + 3}" style="background: var(--bg-tertiary); font-weight: bold; text-align: left; padding: 0.75rem 1rem; color: var(--text-primary); border-top: 1px solid var(--border-color); border-bottom: 1px solid var(--border-color);">
                ${sector}
            </td>
        `;
        tableBody.appendChild(sectorHeader);

        employeesBySector[sector].forEach(emp => {
            const tr = document.createElement('tr');
            const shift = AppState.shifts.find(s => s.id === emp.shiftId);
            const shiftName = shift ? shift.name : emp.shiftId;

            tr.innerHTML = `
                <td class="sticky-col" style="background: var(--bg-card); color: var(--text-secondary); font-size: 0.75rem;">${emp.sector}</td>
                <td class="sticky-col" style="background: var(--bg-card); color: var(--text-primary); font-weight: 500;">${emp.name}</td>
                <td class="sticky-col" style="background: var(--bg-card); color: var(--text-secondary); font-size: 0.75rem;">${shiftName}</td>
            `;

            for (let day = 1; day <= daysInMonth; day++) {
                const date = new Date(year, month, day);
                const dayOfWeek = date.getDay();
                const td = document.createElement('td');

                if (dayOfWeek === 0 || dayOfWeek === 6) {
                    td.style.backgroundColor = 'var(--bg-tertiary)';
                }

                const dayKey = String(day).padStart(2, '0');
                const shiftId = currentSchedule[emp.id]?.[dayKey];
                const shiftObj = AppState.shifts.find(s => s.id === shiftId);

                td.style.padding = '4px';
                td.style.cursor = 'pointer';
                td.title = 'Clique para alterar';
                td.onclick = () => editCell(emp.id, dayKey, shiftId);

                if (shiftObj) {
                    let shiftColor = 'var(--shift-off)';
                    let textColor = 'white';
                    let borderColor = 'transparent';
                    const type = shiftObj.name.toUpperCase();

                    if (type === 'F') {
                        shiftColor = 'rgba(255, 235, 59, 0.15)';
                        textColor = '#b45309';
                        borderColor = '#fcd34d';
                    } else if (type === 'FE') {
                        shiftColor = 'var(--shift-fe)';
                    } else if (['T1', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'T8', 'T9', 'T10', 'T11', 'T12'].includes(type)) {
                        if (['T1', 'T4', 'T7', 'T10'].includes(type)) shiftColor = 'rgba(0, 176, 240, 0.15)';
                        if (['T2', 'T5', 'T8', 'T11'].includes(type)) shiftColor = 'rgba(0, 176, 80, 0.15)';
                        if (['T3', 'T6', 'T9', 'T12'].includes(type)) shiftColor = 'rgba(255, 107, 157, 0.15)';

                        if (['T1', 'T4', 'T7', 'T10'].includes(type)) { textColor = '#0077a3'; borderColor = '#00b0f0'; }
                        if (['T2', 'T5', 'T8', 'T11'].includes(type)) { textColor = '#007033'; borderColor = '#00b050'; }
                        if (['T3', 'T6', 'T9', 'T12'].includes(type)) { textColor = '#a8326b'; borderColor = '#ff6b9d'; }
                    } else if (type === 'BH') {
                        shiftColor = '#a1a1aa';
                    }

                    td.innerHTML = `
                        <div class="shift-cell" style="
                            background-color: ${shiftColor}; 
                            color: ${textColor}; 
                            border: 1px solid ${borderColor};
                            border-radius: 6px;
                            padding: 2px 0;
                            font-weight: 700;
                            font-size: 0.75rem;
                            box-shadow: 0 1px 2px rgba(0,0,0,0.03);
                        ">
                            ${shiftObj.name}
                        </div>
                    `;
                } else {
                    td.innerHTML = '<span style="color: var(--text-muted);">-</span>';
                }
                tr.appendChild(td);
            }
            tableBody.appendChild(tr);
        });
    });
}

function editCell(empId, day, currentShiftId) {
    const emp = AppState.employees.find(e => e.id === empId);
    const year = AppState.currentMonth.getFullYear();
    const month = AppState.currentMonth.getMonth() + 1;
    const monthKey = `${year}-${String(month).padStart(2, '0')}`;

    const newShiftName = prompt(
        `Editar escala de ${emp.name} para dia ${day}/${month}:\n\n` +
        `Digite o código do turno (ex: T1, T2, F, BH, FE, AT):`,
        currentShiftId ? (AppState.shifts.find(s => s.id === currentShiftId)?.name || '') : ''
    );

    if (newShiftName !== null) {
        const normalizedInput = newShiftName.trim().toLowerCase();
        const shift = AppState.shifts.find(s =>
            s.name.toLowerCase() === normalizedInput ||
            s.id === normalizedInput
        );

        if (shift) {
            if (!AppState.schedule[monthKey]) AppState.schedule[monthKey] = {};
            if (!AppState.schedule[monthKey][empId]) AppState.schedule[monthKey][empId] = {};
            AppState.schedule[monthKey][empId][day] = shift.id;
            saveAppData();
            renderCalendar();
        } else if (normalizedInput === '') {
            if (AppState.schedule[monthKey]?.[empId]) {
                delete AppState.schedule[monthKey][empId][day];
                saveAppData();
                renderCalendar();
            }
        } else {
            alert('❌ Código de turno inválido!\nUse códigos como: T1, T2, F, BH, etc.');
        }
    }
}

// ===========================
// CRUD OPERATIONS & VACATIONS
// ===========================
function renderEmployees() {
    const container = document.getElementById('employeesView');

    // Inject Vacation Section if missing
    if (!document.getElementById('vacationSection')) {
        const vacationHTML = `
            <div id="vacationSection" style="margin-top: 3rem; border-top: 1px solid var(--border-color); padding-top: 2rem;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;">
                    <h3>📅 Programação de Férias</h3>
                    <button class="btn-primary" onclick="addVacation()">+ Programar Férias</button>
                </div>
                <div class="card">
                    <table class="data-table">
                        <thead>
                            <tr>
                                <th>Funcionário</th>
                                <th>Início</th>
                                <th>Fim</th>
                                <th>Ações</th>
                            </tr>
                        </thead>
                        <tbody id="vacationsTableBody"></tbody>
                    </table>
                </div>
            </div>
        `;
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = vacationHTML;
        container.appendChild(tempDiv);
    }

    const tbody = document.getElementById('employeesTable');
    if (AppState.employees.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" class="empty-state">Nenhum funcionário cadastrado</td></tr>';
    } else {
        tbody.innerHTML = AppState.employees.map(emp => {
            const shift = AppState.shifts.find(s => s.id === emp.shiftId);
            return `
            <tr>
                <td>${emp.name}</td>
                <td><span class="badge">${emp.sector}</span></td>
                <td>${shift ? shift.name : emp.shiftId}</td>
                <td style="font-family: monospace; font-size: 0.8rem;">${emp.weekendRule === 'alternating' ? 'FDS Alternado' : (emp.weekendRule === '12x36' ? '12x36' : 'FDS Folga')}</td>
                <td>
                    <button class="btn-danger btn-sm" onclick="deleteEmployee('${emp.id}')">
                        <svg width="14" height="14" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" style="margin-right: 4px;">
                            <path d="M2 4H14M5 4V2H11V4M6 4V12M10 4V12M4 4H12V14H4V4Z" stroke="currentColor" stroke-width="2"/>
                        </svg>
                        Excluir
                    </button>
                </td>
            </tr>
        `}).join('');
    }
    renderVacations();
}

function renderVacations() {
    const tbody = document.getElementById('vacationsTableBody');
    if (!tbody) return;

    const vacations = AppState.vacations || [];
    if (vacations.length === 0) {
        tbody.innerHTML = '<tr><td colspan="4" class="empty-state">Nenhuma férias programada</td></tr>';
        return;
    }

    tbody.innerHTML = vacations.map((v) => {
        const start = new Date(v.start).toLocaleDateString('pt-BR');
        const end = new Date(v.end).toLocaleDateString('pt-BR');
        return `
            <tr>
                <td>${v.employeeName}</td>
                <td>${start}</td>
                <td>${end}</td>
                <td>
                    <button class="btn-danger btn-sm" onclick="deleteVacation('${v.id}')">
                        <svg width="14" height="14" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" style="margin-right: 4px;">
                            <path d="M2 4H14M5 4V2H11V4M6 4V12M10 4V12M4 4H12V14H4V4Z" stroke="currentColor" stroke-width="2"/>
                        </svg>
                        Excluir
                    </button>
                </td>
            </tr>
        `;
    }).join('');
}

function addVacation() {
    const name = prompt('Nome do Funcionário (exatamente como no cadastro):');
    if (!name) return;

    const empExists = AppState.employees.some(e => e.name.toLowerCase() === name.toLowerCase());
    if (!empExists) {
        alert('❌ Funcionário não encontrado! Verifique o nome.');
        return;
    }

    const start = prompt('Data de Início (AAAA-MM-DD):');
    if (!start) return;

    const end = prompt('Data de Fim (AAAA-MM-DD):');
    if (!end) return;

    if (!AppState.vacations) AppState.vacations = [];

    AppState.vacations.push({
        id: generateId(),
        employeeName: name,
        start: start,
        end: end
    });

    saveAppData();
    renderVacations();
    alert('✅ Férias agendadas com sucesso!');
}

function deleteVacation(id) {
    if (confirm('Cancelar estas férias?')) {
        AppState.vacations = AppState.vacations.filter(v => v.id !== id);

        // Also delete from Supabase
        supabase.from('vacations').delete().eq('id', id).then(() => {
            console.log('Vacation deleted from Supabase');
        });

        saveAppData();
        renderVacations();
    }
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
// MODAL & UTILS
// ===========================
function showAddEmployeeModal() {
    const name = prompt('Nome do Funcionário:');
    if (!name) return;

    const sector = prompt('Setor (ex: SUPORTE N1, REDES):', 'SUPORTE N1');
    if (!sector) return;

    const shiftId = prompt('Turno Padrão (ex: t1, t2, 12x36):', 't1');
    if (!shiftId) return;

    const weekendRule = prompt('Regra de Fim de Semana (alternating, alternating_sat, off, 12x36):', 'alternating');

    const newEmp = {
        id: generateId(),
        name,
        sector,
        shiftId: shiftId.toLowerCase(),
        weekendRule
    };

    AppState.employees.push(newEmp);

    if (!AppState.sectors.includes(sector)) {
        AppState.sectors.push(sector);
    }

    saveAppData();
    renderEmployees();
    updateStats();
    alert('✅ Funcionário adicionado com sucesso!');
}

function showAddShiftModal() {
    const id = prompt('Código do Turno (ex: t13):');
    if (!id) return;

    if (AppState.shifts.some(s => s.id === id.toLowerCase())) {
        alert('❌ Já existe um turno com este código!');
        return;
    }

    const name = prompt('Nome do Turno (ex: T13):', id.toUpperCase());
    if (!name) return;

    const time = prompt('Horário (ex: 14:00 às 23:00):');
    if (!time) return;

    const color = prompt('Cor em Hexadecimal (ex: #ff0000) ou deixe vazio para aleatório:', '#' + Math.floor(Math.random() * 16777215).toString(16));

    AppState.shifts.push({
        id: id.toLowerCase(),
        name,
        time,
        color: color || '#cccccc'
    });

    saveAppData();
    renderShifts();
    updateStats();
    alert('✅ Turno adicionado!');
}

function showAddOncallModal() {
    const name = prompt('Nome do Plantão (ex: PLANTÃO EXTRA):');
    if (!name) return;

    const startDate = prompt('Data de Início da Rotação (AAAA-MM-DD):', new Date().toISOString().split('T')[0]);
    if (!startDate) return;

    const rotationStr = prompt('Nomes da Rotação (separados por vírgula):\nEx: João Silva, Maria Souza, Pedro Santos');
    if (!rotationStr) return;

    const rotation = rotationStr.split(',').map(n => n.trim()).filter(n => n);

    if (rotation.length === 0) {
        alert('❌ Nenhuma pessoa válida na rotação.');
        return;
    }

    AppState.oncalls.push({
        id: generateId(),
        name,
        startDate,
        rotation
    });

    saveAppData();
    renderOncall();
    updateStats();
    alert('✅ Plantão configurado!');
}

function showAddHolidayModal() {
    const date = prompt('Data do Feriado (AAAA-MM-DD):');
    if (!date) return;

    const name = prompt('Nome do Feriado:');
    if (!name) return;

    const type = prompt('Tipo (Nacional, Estadual, Opcional):', 'Nacional');

    AppState.holidays.push({
        date,
        name,
        type
    });

    saveAppData();
    renderHolidays();
    updateStats();
    alert('✅ Feriado adicionado!');
}

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

function importFromExcel() { alert('Funcionalidade em desenvolvimento. Use a "Importação Rápida" por enquanto.'); }
function exportToExcel() { alert('Funcionalidade em desenvolvimento. Use "Exportar Dados" para backup JSON.'); }

function clearAllData() {
    if (confirm('ATENÇÃO: Isso apagará TODOS os dados do sistema. Tem certeza?')) {
        localStorage.removeItem('escalaAppData');
        location.reload();
    }
}

function generateId() { return Math.random().toString(36).substr(2, 9); }
function isDateHoliday(date) {
    const dateStr = date.toISOString().split('T')[0];
    return AppState.holidays.some(h => h.date === dateStr);
}

function getContrastColor(hexcolor) {
    if (!hexcolor || !hexcolor.startsWith('#')) return '#ffffff';
    const r = parseInt(hexcolor.substr(1, 2), 16);
    const g = parseInt(hexcolor.substr(3, 2), 16);
    const b = parseInt(hexcolor.substr(5, 2), 16);
    const yiq = ((r * 299) + (g * 587) + (b * 114)) / 1000;
    return (yiq >= 128) ? '#000000' : '#ffffff';
}

// ===========================
// SCHEDULE GENERATION LOGIC
// ===========================
function generateSchedule() {
    const year = AppState.currentMonth.getFullYear();
    const month = AppState.currentMonth.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const monthKey = `${year}-${String(month + 1).padStart(2, '0')}`;

    if (!AppState.schedule[monthKey]) {
        AppState.schedule[monthKey] = {};
    }

    // 1. Process Employees
    AppState.employees.forEach((emp, index) => {
        if (!AppState.schedule[monthKey][emp.id]) {
            AppState.schedule[monthKey][emp.id] = {};
        }

        for (let day = 1; day <= daysInMonth; day++) {
            const date = new Date(year, month, day);
            const dateStr = date.toISOString().split('T')[0];
            const dayKey = String(day).padStart(2, '0');
            const dayOfWeek = date.getDay(); // 0=Sun, 6=Sat
            const isHoliday = isDateHoliday(date);

            // 1. VACATION CHECK (Priority #1)
            const isOnVacation = AppState.vacations.some(v => {
                return v.employeeName === emp.name && dateStr >= v.start && dateStr <= v.end;
            });

            if (isOnVacation) {
                AppState.schedule[monthKey][emp.id][dayKey] = 'fe';
                continue;
            }

            let assignedShiftId = emp.shiftId; // Default to their standard shift

            // 2. 12x36 LOGIC (Priority #2)
            if (emp.weekendRule === '12x36' || emp.shiftId === '12x36') {
                const baseDate = new Date('2025-11-01');
                const diffTime = date.getTime() - baseDate.getTime();
                const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

                if (diffDays % 2 !== 0) {
                    assignedShiftId = 't9';
                    if (AppState.shifts.some(s => s.id === '12x36')) assignedShiftId = '12x36';
                } else {
                    assignedShiftId = 'f';
                }

                AppState.schedule[monthKey][emp.id][dayKey] = assignedShiftId;
                continue;
            }

            // 3. WEEKEND & HOLIDAY RULES
            if (dayOfWeek === 0 || dayOfWeek === 6) {
                if (emp.weekendRule === 'off') {
                    assignedShiftId = 'f'; // Folga
                } else if (emp.weekendRule === 'alternating') {
                    const firstDayOfYear = new Date(year, 0, 1);
                    const pastDaysOfYear = (date - firstDayOfYear) / 86400000;
                    const weekNum = Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);

                    if ((weekNum + index) % 2 !== 0) {
                        assignedShiftId = 'f';
                    } else {
                        if (dayOfWeek === 6) assignedShiftId = 't10';
                        if (dayOfWeek === 0) assignedShiftId = 'f';
                    }
                } else if (emp.weekendRule === 'alternating_sat') {
                    if (dayOfWeek === 0) assignedShiftId = 'f';
                    else {
                        const firstDayOfYear = new Date(year, 0, 1);
                        const pastDaysOfYear = (date - firstDayOfYear) / 86400000;
                        const weekNum = Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);

                        if (weekNum % 2 !== 0) assignedShiftId = 'f';
                        else assignedShiftId = 't10';
                    }
                }
            }

            // Holiday Logic
            if (isHoliday && assignedShiftId !== 'f') {
                assignedShiftId = 'bh';
            }

            // Assign
            AppState.schedule[monthKey][emp.id][dayKey] = assignedShiftId;
        }
    });

    // 2. Process Plantões (On-Call)
    AppState.oncalls.forEach(oncall => {
        oncall.schedule = {}; // Reset for the month
        const startDate = new Date(oncall.startDate);
        const rotation = oncall.rotation;

        for (let day = 1; day <= daysInMonth; day++) {
            const currentDate = new Date(year, month, day);

            const diffTime = currentDate.getTime() - startDate.getTime();
            const diffWeeks = Math.floor(diffTime / (1000 * 60 * 60 * 24 * 7));

            if (diffWeeks >= 0) {
                const personIndex = diffWeeks % rotation.length;
                oncall.schedule[day] = rotation[personIndex];
            }
        }
    });

    saveAppData();
    renderCalendar();
    alert(`✅ Escala de ${monthKey} gerada com sucesso!\n\nConsiderando:\n- Férias\n- Regra 12x36\n- Plantões`);
}
