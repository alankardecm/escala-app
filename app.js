// ===========================
// SUPABASE CONFIGURATION
// ===========================
const supabaseUrl = 'https://pswoertvywdqcuqailtn.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBzd29lcnR2eXdkcWN1cWFpbHRuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQyNjMzNzMsImV4cCI6MjA3OTgzOTM3M30.JbFQQxtDbCz8f8XoGrRyetzaN6Dj6MOpebfml3vcmPM';

let supabase;
try {
    if (window.supabase) {
        supabase = window.supabase.createClient(supabaseUrl, supabaseKey);
        console.log('✅ Supabase inicializado');
    } else {
        console.error('❌ Biblioteca Supabase não carregada!');
        alert('Erro Crítico: Biblioteca do Supabase não carregou. Verifique sua internet.');
    }
} catch (e) {
    console.error('❌ Erro ao inicializar Supabase:', e);
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
let isSignUpMode = false;

document.addEventListener('DOMContentLoaded', () => {
    initializeApp();
});

async function initializeApp() {
    console.log('🚀 Inicializando App...');

    // Theme Initialization
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'light') {
        document.body.classList.add('light-mode');
    }

    setupEventListeners();

    if (!supabase) {
        console.warn('⚠️ Rodando sem conexão com Supabase');
        showApp();
        return;
    }

    // Check Auth Session
    const { data: { session } } = await supabase.auth.getSession();

    if (session) {
        console.log('✅ Usuário logado:', session.user.email);
        applyPermissions(session.user);
        showApp();
    } else {
        console.log('🔒 Sem sessão, exibindo login');
        showLogin();
    }

    // Listen for Auth Changes
    supabase.auth.onAuthStateChange((event, session) => {
        if (event === 'SIGNED_IN') {
            applyPermissions(session.user);
            showApp();
        } else if (event === 'SIGNED_OUT') {
            showLogin();
        }
    });

    // Auth Switcher
    const authSwitchBtn = document.getElementById('authSwitchBtn');
    console.log('🔍 Botão de troca de Auth encontrado:', authSwitchBtn);
    if (authSwitchBtn) {
        authSwitchBtn.addEventListener('click', (e) => {
            console.log('🖱️ Troca de Auth clicada!');
            e.preventDefault();
            isSignUpMode = !isSignUpMode;

            const title = document.querySelector('.login-header h2');
            const submitBtn = document.getElementById('authSubmitBtn');
            const switchText = document.getElementById('authSwitchText');
            const adminGroup = document.getElementById('adminCodeGroup');

            if (isSignUpMode) {
                title.textContent = 'Criar Conta';
                submitBtn.textContent = 'Cadastrar';
                switchText.textContent = 'Já tem conta?';
                authSwitchBtn.textContent = 'Entrar';
                adminGroup.style.display = 'block';
            } else {
                title.textContent = 'EscalaApp';
                submitBtn.textContent = 'Entrar no Sistema';
                switchText.textContent = 'Não tem conta?';
                authSwitchBtn.textContent = 'Cadastre-se';
                adminGroup.style.display = 'none';
            }
        });
    }

    // Login/Signup Form Listener
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const email = document.getElementById('loginEmail').value;
            const password = document.getElementById('loginPassword').value;
            const adminCode = document.getElementById('adminCode').value;
            const errorDiv = document.getElementById('loginError');
            const btn = document.getElementById('authSubmitBtn');

            errorDiv.style.display = 'none';
            errorDiv.textContent = '';
            btn.disabled = true;
            btn.textContent = 'Processando...';

            try {
                if (isSignUpMode) {
                    // SIGN UP
                    const role = (adminCode === 'escala2025') ? 'admin' : 'viewer';

                    const { data, error } = await supabase.auth.signUp({
                        email: email,
                        password: password,
                        options: {
                            data: { role: role }
                        }
                    });

                    if (error) throw error;

                    if (data.user && !data.session) {
                        alert('Cadastro realizado! 📧 Verifique seu e-mail (e a pasta de Spam) para confirmar a conta antes de fazer login.\n\nDepois de confirmar, volte aqui e faça login.');
                        // Volta para a tela de login
                        authSwitchBtn.click();
                        btn.disabled = false;
                        btn.textContent = 'Entrar no Sistema';
                    } else if (data.user && data.user.identities && data.user.identities.length === 0) {
                        throw new Error('Este email já está cadastrado.');
                    } else {
                        alert(`Conta criada com sucesso! Você é um ${role === 'admin' ? 'ADMINISTRADOR' : 'VISUALIZADOR'}.`);
                    }
                } else {
                    // SIGN IN
                    const { data, error } = await supabase.auth.signInWithPassword({
                        email: email,
                        password: password
                    });
                    if (error) throw error;
                }
            } catch (error) {
                console.error('Erro de Autenticação:', error);
                errorDiv.textContent = 'Erro: ' + (error.message === 'Invalid login credentials' ? 'Dados incorretos' : error.message);
                errorDiv.style.display = 'block';
                btn.disabled = false;
                btn.textContent = isSignUpMode ? 'Cadastrar' : 'Entrar no Sistema';
            }
        });
    }
}

function showLogin() {
    document.getElementById('loadingScreen').style.display = 'none';
    document.getElementById('app').style.display = 'none';
    document.getElementById('loginContainer').style.display = 'flex';
}

function applyPermissions(user) {
    const role = user.user_metadata?.role || 'viewer';
    console.log('👤 Papel do Usuário:', role);

    if (role === 'admin') {
        document.body.classList.remove('read-only-mode');
    } else {
        document.body.classList.add('read-only-mode');
    }
}

function showApp() {
    document.getElementById('loadingScreen').style.display = 'none';
    document.getElementById('loginContainer').style.display = 'none';
    document.getElementById('app').style.display = 'flex';

    // Load Data only when showing app
    if (supabase) {
        loadAppData().then(() => {
            updateMonthDisplay();
            renderDashboard();
        });
    } else {
        updateMonthDisplay();
        renderDashboard();
    }
}

async function loadAppData() {
    try {
        console.log('📥 Carregando dados do Supabase...');

        // Bypass local cache issues by adding a robust instruction
        // Fetch core data sequence with simple cache busting attempt if supported, 
        // otherwise just standard select.
        const [empRes, shiftRes, oncallRes, holidayRes, scheduleRes] = await Promise.all([
            supabase.from('employees').select('*'),
            supabase.from('shifts').select('*'), // Simpler is better, removed complex logic
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
                console.warn('⚠️ Não foi possível carregar férias (Tabela pode estar ausente):', error.message);
            } else {
                vacationsData = data;
            }
        } catch (err) {
            console.warn('⚠️ Erro ao buscar férias:', err);
        }

        // Map Supabase data to AppState
        AppState.employees = empRes.data.map(e => ({
            id: e.id,
            name: e.name,
            sector: e.sector,
            shiftId: e.shift_id,
            weekendRule: e.weekend_rule
        }));

        AppState.holidays = holidayRes.data.map(h => ({
            date: h.date,
            name: h.name,
            type: h.type
        }));

        // Safety check: Prevent overwriting with empty data if Supabase returns nothing but we already have data
        if (shiftRes.data && shiftRes.data.length > 0) {
            AppState.shifts = shiftRes.data.map(s => ({
                id: s.id,
                name: s.name,
                time: s.time,
                color: s.color
            }));
        } else if (AppState.shifts.length === 0) {
            // Only warn if we really have no data at all
            console.warn('⚠️ Recebido 0 turnos do Supabase.');
        }

        AppState.oncalls = oncallRes.data.map(o => ({
            id: o.id,
            name: o.name,
            startDate: o.start_date,
            rotation: o.rotation
        }));


        AppState.vacations = vacationsData.map(v => ({
            id: v.id,
            employeeName: v.employee_name,
            start: v.start_date,
            end: v.end_date
        }));

        // Convert schedule array back to object map
        AppState.schedule = {};
        if (scheduleRes.data) {
            scheduleRes.data.forEach(item => {
                AppState.schedule[item.month_key] = item.data;
            });
            console.log('📅 Escalas carregadas:', Object.keys(AppState.schedule));
        }

        // Rebuild Sectors list
        AppState.sectors = [...new Set(AppState.employees.map(e => e.sector))];

        console.log('✅ Dados carregados com sucesso');
        // updateMonthDisplay(); // Removed to avoid potential race conditions if called twice, let showApp handle it
        // renderDashboard(); // Removed, let showApp handle it

    } catch (error) {
        console.error('❌ Erro ao carregar dados:', error);
        alert('Erro ao carregar dados. Verifique o console para mais detalhes.');
    }
}

async function saveAppData() {
    console.log('Salvando dados no Supabase...');

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

        console.log('✅ Dados salvos no Supabase');

    } catch (error) {
        console.error('Erro ao salvar dados:', error);
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
            document.documentElement.classList.toggle('light-mode');
            const isLight = document.body.classList.contains('light-mode');
            localStorage.setItem('theme', isLight ? 'light' : 'dark');
        });
    }

    // Month Navigation
    document.getElementById('prevMonth').addEventListener('click', () => changeMonth(-1));
    document.getElementById('nextMonth').addEventListener('click', () => changeMonth(1));

    // Actions
    const saveChangesBtn = document.getElementById('saveChanges');
    if (saveChangesBtn) {
        saveChangesBtn.addEventListener('click', async () => {
            await saveAppData();
            alert('✅ Alterações salvas no banco de dados!');
        });
    }

    const generateScheduleBtn = document.getElementById('generateSchedule');
    if (generateScheduleBtn) generateScheduleBtn.addEventListener('click', generateSchedule);

    const addEmployeeBtn = document.getElementById('addEmployee');
    if (addEmployeeBtn) addEmployeeBtn.addEventListener('click', () => openEmployeeModal());

    const addVacationBtn = document.getElementById('addVacationBtn');
    if (addVacationBtn) addVacationBtn.addEventListener('click', () => openVacationModal());

    const addShiftBtn = document.getElementById('addShift');
    if (addShiftBtn) addShiftBtn.addEventListener('click', showAddShiftModal);

    const addOncallBtn = document.getElementById('addOncall');
    if (addOncallBtn) addOncallBtn.addEventListener('click', showAddOncallModal);

    const addHolidayBtn = document.getElementById('addHoliday');
    if (addHolidayBtn) addHolidayBtn.addEventListener('click', showAddHolidayModal);

    // Settings Actions
    const quickImportBtn = document.getElementById('quickImport');
    if (quickImportBtn) quickImportBtn.addEventListener('click', () => importCompleteData(false));

    const cleanTestUsersBtn = document.getElementById('cleanTestUsers');
    if (cleanTestUsersBtn) cleanTestUsersBtn.addEventListener('click', cleanTestUsers);

    const clearDataBtn = document.getElementById('clearData');
    if (clearDataBtn) clearDataBtn.addEventListener('click', clearAllData);

    // Reports Export
    const exportReportsBtn = document.getElementById('exportReportsBtn');
    if (exportReportsBtn) exportReportsBtn.addEventListener('click', exportReportsToExcel);

    // Logout
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', async () => {
            if (confirm('Deseja realmente sair?')) {
                try {
                    await supabase.auth.signOut();
                } catch (error) {
                    console.error('Erro ao sair:', error);
                } finally {
                    // Force clear Supabase local storage
                    Object.keys(localStorage).forEach(key => {
                        if (key.startsWith('sb-')) {
                            localStorage.removeItem(key);
                        }
                    });
                    window.location.reload();
                }
            }
        });
    }
}

function exportReportsToExcel() {
    const year = AppState.currentMonth.getFullYear();
    const month = AppState.currentMonth.getMonth();
    const monthName = AppState.currentMonth.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });

    let csvContent = `RELATÓRIO DE HORAS - ${monthName.toUpperCase()}\n\n`;

    // 1. Suporte FDS
    csvContent += "SUPORTE FINAL DE SEMANA E FERIADOS\n";
    csvContent += "Data;Dia;Nome;Turno;Horário;Horas\n";

    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const monthKey = `${year}-${String(month + 1).padStart(2, '0')}`;
    const schedule = AppState.schedule[monthKey];

    if (schedule) {
        for (let day = 1; day <= daysInMonth; day++) {
            const date = new Date(year, month, day);
            const dayOfWeek = date.getDay();
            const isHoliday = isDateHoliday(date);

            if (dayOfWeek !== 0 && dayOfWeek !== 6 && !isHoliday) continue;

            AppState.employees.forEach(emp => {
                const shiftId = schedule[emp.id]?.[String(day).padStart(2, '0')];
                if (!shiftId) return;
                const shift = AppState.shifts.find(s => s.id === shiftId);
                if (!shift || ['f', 'fe', 'bh', 'at', 'ft'].includes(shift.id)) return;

                let hours = 0;
                if (shift.id === '12x36') hours = 12;
                else {
                    const times = shift.time.match(/(\d{2}):(\d{2})/g);
                    if (times && times.length >= 2) {
                        const [h1, m1] = times[0].split(':').map(Number);
                        const [h2, m2] = times[1].split(':').map(Number);
                        let diff = (h2 * 60 + m2) - (h1 * 60 + m1);
                        if (diff < 0) diff += 24 * 60;
                        hours = diff / 60;
                    }
                }

                if (hours > 0) {
                    csvContent += `${date.toLocaleDateString('pt-BR')};${date.toLocaleDateString('pt-BR', { weekday: 'short' })};${emp.name};${shift.name};${shift.time};${hours.toFixed(2).replace('.', ',')}\n`;
                }
            });
        }
    }

    csvContent += "\n\nPLANTÕES (SOBREAVISO)\n";
    csvContent += "Data;Dia;Nome;Plantão;Horário;Horas\n";

    // 2. Plantões
    const onCallRules = {
        'PLANTÃO NOC': { weekdays: { hours: 9 }, weekends: { hours: 10 } },
        'PLANTÃO VOZ': { weekdays: { hours: 14 }, weekends: { hours: 24 } },
        'PLANTÃO TECH': { weekdays: { hours: 10 }, weekends: { hours: 24 } },
        'PLANTÃO N3': { weekdays: { hours: 0 }, weekends: { hours: 0 } }
    };

    AppState.oncalls.forEach(oncall => {
        const rule = onCallRules[oncall.name.toUpperCase()] || onCallRules['PLANTÃO NOC'];
        const startDate = new Date(oncall.startDate);
        const getMonday = (d) => {
            const date = new Date(d);
            const day = date.getDay();
            const diff = date.getDate() - day + (day === 0 ? -6 : 1);
            return new Date(date.setDate(diff));
        };
        const startMonday = getMonday(startDate);
        const rotation = oncall.rotation;

        for (let day = 1; day <= daysInMonth; day++) {
            const date = new Date(year, month, day);
            const currentMonday = getMonday(date);
            const dayOfWeek = date.getDay();
            const isHoliday = isDateHoliday(date);
            const isWeekendOrHoliday = dayOfWeek === 0 || dayOfWeek === 6 || isHoliday;

            const diffTime = currentMonday.getTime() - startMonday.getTime();
            const diffWeeks = Math.floor(diffTime / (1000 * 60 * 60 * 24 * 7));

            if (diffWeeks < 0) continue;

            const personName = rotation[diffWeeks % rotation.length];
            const hours = isWeekendOrHoliday ? rule.weekends.hours : rule.weekdays.hours;

            if (hours > 0) {
                csvContent += `${date.toLocaleDateString('pt-BR')};${date.toLocaleDateString('pt-BR', { weekday: 'short' })};${personName};${oncall.name};-;${hours.toFixed(2).replace('.', ',')}\n`;
            }
        }
    });

    // Download
    const blob = new Blob([new Uint8Array([0xEF, 0xBB, 0xBF]), csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `Relatorio_Horas_${monthName.replace(/ /g, '_')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
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
        dashboard: { title: 'Painel', subtitle: 'Visão geral do sistema de escalas' },
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
        case 'employees': renderEmployees(); renderVacations(); break;
        case 'shifts': renderShifts(); break;
        case 'oncall': renderOncall(); break;
        case 'holidays': renderHolidays(); break;
        case 'reports': renderReports(); break;
    }
}

async function cleanTestUsers() {
    if (!confirm('Isso removerá todos os funcionários com "Teste" no nome. Continuar?')) return;

    // Local Filter
    const initialCount = AppState.employees.length;
    AppState.employees = AppState.employees.filter(e => !e.name.toLowerCase().includes('teste'));
    const removedCount = initialCount - AppState.employees.length;

    // Supabase Delete
    if (typeof supabase !== 'undefined') {
        const { error } = await supabase.from('employees').delete().ilike('name', '%teste%');
        if (error) {
            console.error('Error cleaning test users:', error);
            alert('Erro ao limpar banco de dados.');
        }
    }

    saveAppData();
    alert(`✅ Limpeza concluída! ${removedCount} usuários removidos.`);
    renderEmployees();
    updateStats();
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
        // Normalize start date to its Monday to align rotation
        const getMonday = (d) => {
            const date = new Date(d);
            const day = date.getDay();
            const diff = date.getDate() - day + (day === 0 ? -6 : 1);
            return new Date(date.setDate(diff));
        };
        const startMonday = getMonday(startDate);
        const rotation = oncall.rotation;

        for (let day = 1; day <= daysInMonth; day++) {
            const date = new Date(year, month, day);
            const currentMonday = getMonday(date);

            const dayOfWeek = date.getDay(); // 0=Sun, 6=Sat
            const isHoliday = isDateHoliday(date);
            const isWeekendOrHoliday = dayOfWeek === 0 || dayOfWeek === 6 || isHoliday;

            const diffTime = currentMonday.getTime() - startMonday.getTime();
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

    tableBody.innerHTML = '';




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
    console.log('📅 Rendering Calendar for:', monthKey);
    const currentSchedule = AppState.schedule[monthKey];

    if (!currentSchedule) {
        const isReadOnly = document.body.classList.contains('read-only-mode');
        tableBody.innerHTML = `
            <tr>
                <td colspan="${daysInMonth + 3}" class="empty-state" style="padding: 3rem; text-align: center;">
                    <div style="display: flex; flex-direction: column; align-items: center; gap: 1rem;">
                        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" style="color: var(--text-muted);">
                            <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                            <line x1="16" y1="2" x2="16" y2="6"></line>
                            <line x1="8" y1="2" x2="8" y2="6"></line>
                            <line x1="3" y1="10" x2="21" y2="10"></line>
                        </svg>
                        <p>Nenhuma escala encontrada para este mês.</p>
                        ${isReadOnly
                ? '<p style="font-size: 0.9rem; color: var(--text-secondary);">O administrador precisa gerar e <strong>SALVAR</strong> a escala.</p>'
                : '<p style="font-size: 0.9rem; color: var(--text-secondary);">Clique em "Gerar Escala" e depois não esqueça de <strong>SALVAR</strong>.</p>'}
                    </div>
                </td>
            </tr>
        `;
        return;
    }


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
            <td colspan="3" class="sticky-col" style="font-weight:600; color: var(--text-primary); text-align: left; padding-left: 1rem; border-right: 1px solid var(--border-color); background: var(--bg-card); z-index: 15;">
                ${oncall.name}
            </td>
            `;

        const startDate = new Date(oncall.startDate);
        const getMonday = (d) => {
            const date = new Date(d);
            const day = date.getDay();
            const diff = date.getDate() - day + (day === 0 ? -6 : 1);
            return new Date(date.setDate(diff));
        };
        const startMonday = getMonday(startDate);

        for (let day = 1; day <= daysInMonth; day++) {
            const date = new Date(year, month, day);
            const dayOfWeek = date.getDay();
            const td = document.createElement('td');

            if (dayOfWeek === 0 || dayOfWeek === 6) {
                td.style.backgroundColor = 'var(--bg-tertiary)';
            }

            const currentMonday = getMonday(date);
            const diffTime = currentMonday.getTime() - startMonday.getTime();
            const diffWeeks = Math.floor(diffTime / (1000 * 60 * 60 * 24 * 7));

            let assigned = null;
            if (diffWeeks >= 0 && oncall.rotation && oncall.rotation.length > 0) {
                assigned = oncall.rotation[diffWeeks % oncall.rotation.length];
            }

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
                        box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
                    ">
                        ${assigned}
                    </div>
                    `;
            }
            tr.appendChild(td);
        }
        tableBody.appendChild(tr);
    });


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
            const shiftTime = shift ? shift.time : '';

            tr.innerHTML = `
            <td class="sticky-col" style="background: var(--bg-card); color: var(--text-secondary); font-size: 0.75rem;">${emp.sector}</td>
            <td class="sticky-col" style="background: var(--bg-card); color: var(--text-primary); font-weight: 500;">${emp.name}</td>
                <td class="sticky-col" style="background: var(--bg-card); color: var(--text-secondary); font-size: 0.75rem;">${shiftTime}</td>
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
                    // Use dynamic colors from shift definition
                    const color = shiftObj.color || '#cccccc';
                    // Create transparent background (approx 15% opacity)
                    const shiftColor = color.startsWith('#') && color.length === 7 ? color + '26' : color;
                    const textColor = color;
                    const borderColor = color;

                    td.innerHTML = `
                    <div class="shift-cell" style="
                        background-color: ${shiftColor};
                        color: ${textColor};
                        border: 1px solid ${borderColor};
                        border-radius: 6px;
                        padding: 2px 0;
                        font-weight: 700;
                        font-size: 0.75rem;
                        box-shadow: 0 1px 2px rgba(0, 0, 0, 0.03);
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

// --- Vacation Modal Logic ---
function openVacationModal() {
    const modal = document.getElementById('vacationModal');
    const empSelect = document.getElementById('vacationEmp');

    // Populate Employees
    empSelect.innerHTML = AppState.employees
        .sort((a, b) => a.name.localeCompare(b.name))
        .map(e => `<option value="${e.name}">${e.name}</option>`)
        .join('');

    document.getElementById('vacationStart').value = '';
    document.getElementById('vacationEnd').value = '';

    modal.style.display = 'flex';
}

function closeVacationModal() {
    document.getElementById('vacationModal').style.display = 'none';
}

function saveVacation() {
    const name = document.getElementById('vacationEmp').value;
    const start = document.getElementById('vacationStart').value;
    const end = document.getElementById('vacationEnd').value;

    if (!name || !start || !end) {
        alert('Preencha todos os campos!');
        return;
    }

    if (start > end) {
        alert('A data de início não pode ser depois da data de fim.');
        return;
    }

    if (!AppState.vacations) AppState.vacations = [];

    AppState.vacations.push({
        id: generateId(),
        employeeName: name,
        start: start,
        end: end
    });

    // Update Schedule Immediately
    const emp = AppState.employees.find(e => e.name === name);
    if (emp) {
        // Use T12:00:00 to avoid timezone issues affecting the day
        const startDate = new Date(start + 'T12:00:00');
        const endDate = new Date(end + 'T12:00:00');

        for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
            const year = d.getFullYear();
            const month = String(d.getMonth() + 1).padStart(2, '0');
            const day = String(d.getDate()).padStart(2, '0');
            const monthKey = `${year}-${month}`;

            if (AppState.schedule[monthKey] && AppState.schedule[monthKey][emp.id]) {
                AppState.schedule[monthKey][emp.id][day] = 'fe';
            }
        }
    }

    saveAppData();
    renderVacations();
    closeVacationModal();
    alert('✅ Férias agendadas e escala atualizada!');

    if (AppState.currentView === 'calendar') renderCalendar();
}

function renderVacations() {
    const tbody = document.getElementById('vacationsTable');
    if (!tbody) return; // Guard clause if element doesn't exist

    if (!AppState.vacations || AppState.vacations.length === 0) {
        tbody.innerHTML = '<tr><td colspan="4" class="empty-state">Nenhuma férias agendada</td></tr>';
        return;
    }

    // Sort by start date
    const sortedVacations = [...AppState.vacations].sort((a, b) => new Date(a.start) - new Date(b.start));

    tbody.innerHTML = sortedVacations.map(v => {
        const startFmt = new Date(v.start).toLocaleDateString('pt-BR', { timeZone: 'UTC' });
        const endFmt = new Date(v.end).toLocaleDateString('pt-BR', { timeZone: 'UTC' });
        return `
        <tr>
            <td>${v.employeeName}</td>
            <td>${startFmt}</td>
            <td>${endFmt}</td>
            <td>
                <button class="btn-icon btn-sm" onclick="deleteVacation('${v.id}')" style="color: #ff6b6b;">
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M4 4L12 12M12 4L4 12" stroke="currentColor" stroke-width="2"/></svg>
                </button>
            </td>
        </tr>
    `}).join('');
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
// ===========================
// MODAL & UTILS
// ===========================

// --- Employee Modal Logic ---
function openEmployeeModal(empId = null) {
    const modal = document.getElementById('employeeModal');
    const title = document.getElementById('employeeModalTitle');
    const form = document.getElementById('employeeForm');

    // Populate Selects
    const sectorSelect = document.getElementById('empSector');
    sectorSelect.innerHTML = AppState.sectors.map(s => `<option value="${s}">${s}</option>`).join('');
    // Add option to add new sector if needed? For now, stick to existing or let user manage sectors elsewhere.
    // Or add an "Other" option? Let's keep it simple for now, maybe add a prompt if they want a new sector.
    // Actually, let's add all unique sectors from employees + a generic list if empty.

    const shiftSelect = document.getElementById('empShift');
    shiftSelect.innerHTML = AppState.shifts.map(s => `<option value="${s.id}">${s.name} (${s.time})</option>`).join('');

    if (empId) {
        // EDIT MODE
        const emp = AppState.employees.find(e => e.id === empId);
        if (!emp) return;

        title.textContent = 'Editar Funcionário';
        document.getElementById('empId').value = emp.id;
        document.getElementById('empName').value = emp.name;
        document.getElementById('empSector').value = emp.sector;
        document.getElementById('empShift').value = emp.shiftId;
        document.getElementById('empWeekendRule').value = emp.weekendRule;
    } else {
        // ADD MODE
        title.textContent = 'Adicionar Funcionário';
        document.getElementById('empId').value = '';
        form.reset();
        // Set defaults
        if (AppState.sectors.length > 0) document.getElementById('empSector').value = AppState.sectors[0];
        if (AppState.shifts.length > 0) document.getElementById('empShift').value = AppState.shifts[0].id;
        document.getElementById('empWeekendRule').value = 'alternating';
    }

    modal.style.display = 'flex';
}

function closeEmployeeModal() {
    document.getElementById('employeeModal').style.display = 'none';
}

function saveEmployee() {
    const id = document.getElementById('empId').value;
    const name = document.getElementById('empName').value;
    const sector = document.getElementById('empSector').value;
    const shiftId = document.getElementById('empShift').value;
    const weekendRule = document.getElementById('empWeekendRule').value;

    if (!name || !sector || !shiftId) {
        alert('Por favor, preencha todos os campos obrigatórios.');
        return;
    }

    if (id) {
        // UPDATE
        const index = AppState.employees.findIndex(e => e.id === id);
        if (index !== -1) {
            AppState.employees[index] = { ...AppState.employees[index], name, sector, shiftId, weekendRule };
            alert('✅ Funcionário atualizado!');
        }
    } else {
        // CREATE
        const newEmp = {
            id: generateId(),
            name,
            sector,
            shiftId,
            weekendRule
        };
        AppState.employees.push(newEmp);
        alert('✅ Funcionário adicionado!');
    }

    saveAppData();
    renderEmployees();
    updateStats();
    closeEmployeeModal();
}

// Update renderEmployees to include Edit button
function renderEmployees() {
    const container = document.getElementById('employeesList');

    // Group by Sector
    const employeesBySector = AppState.employees.reduce((acc, emp) => {
        acc[emp.sector] = acc[emp.sector] || [];
        acc[emp.sector].push(emp);
        return acc;
    }, {});

    container.innerHTML = Object.keys(employeesBySector).map(sector => `
        <div class="sector-group" style="margin-bottom: 2rem;">
            <h3 style="margin-bottom: 1rem; color: var(--primary); border-bottom: 1px solid var(--border-color); padding-bottom: 0.5rem;">
                ${sector} <span class="badge" style="margin-left: 0.5rem;">${employeesBySector[sector].length}</span>
            </h3>
            <div class="table-container">
                <table class="data-table">
                    <thead>
                        <tr>
                            <th>Nome</th>
                            <th>Turno</th>
                            <th>Regra FDS</th>
                            <th style="text-align: right;">Ações</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${employeesBySector[sector].map(emp => {
        const shift = AppState.shifts.find(s => s.id === emp.shiftId);
        return `
                            <tr>
                                <td>${emp.name}</td>
                                <td><span class="badge" style="background-color: ${shift ? shift.color + '20' : '#333'}; color: ${shift ? shift.color : '#fff'}; border: 1px solid ${shift ? shift.color : '#555'}">${shift ? shift.name : emp.shiftId}</span></td>
                                <td>${getWeekendRuleLabel(emp.weekendRule)}</td>
                                <td style="text-align: right;">
                                    <button class="btn-icon" onclick="openEmployeeModal('${emp.id}')" title="Editar">
                                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                                    </button>
                                    <button class="btn-icon" onclick="deleteEmployee('${emp.id}')" title="Excluir" style="color: #ff6b6b;">
                                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                                    </button>
                                </td>
                            </tr>
                            `;
    }).join('')}
                    </tbody>
                </table>
            </div>
        </div>
    `).join('');
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

async function deleteEmployee(id) {
    if (confirm('Tem certeza que deseja remover este funcionário?')) {
        // 1. Remove from Local State
        AppState.employees = AppState.employees.filter(e => e.id !== id);

        // 2. Remove from Supabase
        if (typeof supabase !== 'undefined') {
            const { error } = await supabase.from('employees').delete().eq('id', id);
            if (error) {
                console.error('Error deleting employee:', error);
                alert('Erro ao excluir do banco de dados.');
                return; // Stop if DB delete fails
            }
        }

        renderEmployees();
        updateStats();
    }
}

async function deleteOncall(id) {
    if (confirm('Remover este plantão?')) {
        AppState.oncalls = AppState.oncalls.filter(o => o.id !== id);

        if (typeof supabase !== 'undefined') {
            await supabase.from('oncalls').delete().eq('id', id);
        }

        renderOncall();
        updateStats();
    }
}

async function deleteHoliday(date) {
    if (confirm('Remover este feriado?')) {
        AppState.holidays = AppState.holidays.filter(h => h.date !== date);

        if (typeof supabase !== 'undefined') {
            await supabase.from('holidays').delete().eq('date', date);
        }

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
                } else if (emp.weekendRule === 'alternating_sun') {
                    // Logic: Work Sunday on alternating weeks. Saturday is always OFF.
                    // We use the same parity check as 'alternating' to keep teams aligned.
                    const firstDayOfYear = new Date(year, 0, 1);
                    const pastDaysOfYear = (date - firstDayOfYear) / 86400000;
                    const weekNum = Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);

                    if ((weekNum + index) % 2 !== 0) {
                        assignedShiftId = 'f'; // Off Weekend
                    } else {
                        if (dayOfWeek === 6) assignedShiftId = 'f'; // Saturday Off
                        if (dayOfWeek === 0) assignedShiftId = 't5'; // Sunday Work (Using T5 as default Sunday shift)
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
    // 2. Process Plantões (On-Call)
    AppState.oncalls.forEach(oncall => {
        oncall.schedule = {}; // Reset for the month
        const startDate = new Date(oncall.startDate);
        // Normalize start date to its Monday to align rotation
        const getMonday = (d) => {
            const date = new Date(d);
            const day = date.getDay();
            const diff = date.getDate() - day + (day === 0 ? -6 : 1);
            return new Date(date.setDate(diff));
        };
        const startMonday = getMonday(startDate);
        const rotation = oncall.rotation;

        for (let day = 1; day <= daysInMonth; day++) {
            const currentDate = new Date(year, month, day);
            const currentMonday = getMonday(currentDate);

            const diffTime = currentMonday.getTime() - startMonday.getTime();
            const diffWeeks = Math.floor(diffTime / (1000 * 60 * 60 * 24 * 7));

            if (diffWeeks >= 0) {
                const personIndex = diffWeeks % rotation.length;
                // Handle negative modulo if needed (though diffWeeks >= 0 check handles start)
                oncall.schedule[day] = rotation[personIndex];
            }
        }
    });

    saveAppData();
    renderCalendar();
    alert(`✅ Escala de ${monthKey} gerada com sucesso!\n\nConsiderando:\n- Férias\n- Regra 12x36\n- Plantões`);
}

function getWeekendRuleLabel(rule) {
    switch (rule) {
        case 'alternating': return 'FDS Alternado';
        case 'alternating_sat': return 'Sábado Alternado';
        case 'alternating_sun': return 'Domingo Alternado';
        case 'off': return 'FDS Folga';
        case '12x36': return 'Escala 12x36';
        default: return rule;
    }
}
