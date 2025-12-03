// ===========================
// DADOS BASE - NOVEMBRO 2025
// ===========================

const COMPLETE_IMPORT_DATA = {
    // Turnos
    shifts: [
        { id: 't1', name: 'T1', time: '07:00 às 16:00', color: '#00b0f0' },
        { id: 't2', name: 'T2', time: '13:00 às 22:00', color: '#00b050' },
        { id: 't3', name: 'T3', time: '08:30 às 18:18', color: '#ff6b9d' },
        { id: 't4', name: 'T4', time: '00:00 às 09:00', color: '#E0AAFF' },
        { id: 't5', name: 'T5', time: '08:00 às 16:00', color: '#87ceeb' },
        { id: 't6', name: 'T6', time: '09:00 às 18:00', color: '#ff0000' },
        { id: 't7', name: 'T7', time: '22:00 às 07:00', color: '#9966ff' },
        { id: 't8', name: 'T8', time: '08:00 às 17:00', color: '#ffa500' },
        { id: 't9', name: 'T9', time: '10:00 às 19:00', color: '#ff00ff' },
        { id: 't10', name: 'T10', time: '14:00 às 22:00', color: '#C77DFF' },
        { id: 't11', name: 'T11', time: '11:00 às 20:00', color: '#a52a2a' },
        { id: 't12', name: 'T12', time: '12:00 às 21:00', color: '#20b2aa' },
        { id: '12x36', name: '12x36', time: '12h Trabalho / 36h Folga', color: '#708090' },

        { id: 'f', name: 'F', time: 'Folga', color: '#ffeb3b' },
        { id: 'bh', name: 'BH', time: 'Banco de Horas', color: '#2d2d4a' },
        { id: 'fe', name: 'FE', time: 'Férias', color: '#00ced1' },
        { id: 'ft', name: 'FT', time: 'Falta', color: '#8b0000' },
        { id: 'at', name: 'AT', time: 'Atestado', color: '#ffd700' }
    ],

    // Funcionários
    employees: [
        // SUPORTE N1
        { name: 'Gustavo Soares', sector: 'SUPORTE N1', shiftId: 't1', weekendRule: 'alternating_sun' },
        { name: 'Gabriel Agostinho', sector: 'SUPORTE N1', shiftId: 't6', weekendRule: 'alternating_sun' },
        { name: 'Brenno Benuto', sector: 'SUPORTE N1', shiftId: 't6', weekendRule: 'alternating_sun' },
        { name: 'Gabriella Piedra', sector: 'SUPORTE N1', shiftId: 't1', weekendRule: 'alternating_sat' },
        { name: 'Douglas Medeiros', sector: 'SUPORTE N1', shiftId: 't4', weekendRule: 'alternating' },
        { name: 'Gabriel Amoedo', sector: 'SUPORTE N1', shiftId: 't7', weekendRule: 'alternating' },
        { name: 'Vinicius Kiyoshi', sector: 'SUPORTE N1', shiftId: 't6', weekendRule: 'alternating_sun' },
        { name: 'Hélio Batista', sector: 'SUPORTE N1', shiftId: 't8', weekendRule: 'alternating' },
        { name: 'Carlos Santos', sector: 'SUPORTE N1', shiftId: 't2', weekendRule: 'alternating' },
        { name: 'Felipe Thacio', sector: 'SUPORTE N1', shiftId: 't1', weekendRule: 'alternating' },
        { name: 'Lucas Torres', sector: 'SUPORTE N1', shiftId: 't6', weekendRule: 'alternating_sun' },
        { name: 'Luiz Silva', sector: 'SUPORTE N1', shiftId: 't3', weekendRule: 'alternating' },
        { name: 'Gabriel Sebastião', sector: 'SUPORTE N1', shiftId: 't3', weekendRule: 'alternating' },
        { name: 'Riquelme Sousa', sector: 'SUPORTE N1', shiftId: 't3', weekendRule: 'alternating' },
        { name: 'Joyce Martins', sector: 'SUPORTE N1', shiftId: 't6', weekendRule: 'off' },

        // SUPORTE N2
        { name: 'Caio Anelli', sector: 'SUPORTE N2', shiftId: '12x36', weekendRule: '12x36' },
        { name: 'Christian Campos', sector: 'SUPORTE N2', shiftId: 't3', weekendRule: 'alternating' },
        { name: 'Alex Padilha', sector: 'SUPORTE N2', shiftId: 't8', weekendRule: 'alternating' },
        { name: 'A K', sector: 'SUPORTE N2', shiftId: 't3', weekendRule: 'alternating' },

        // OUTROS
        { name: 'Reginaldo Pires', sector: 'ATIVAÇÃO REDE', shiftId: 't3', weekendRule: 'off' },
        { name: 'Murilo Stenico', sector: 'ATIVAÇÃO REDE', shiftId: 't3', weekendRule: 'off' },
        { name: 'Henrique Xavier', sector: 'ATIVAÇÃO REDE', shiftId: 't3', weekendRule: 'off' },
        { name: 'D D', sector: 'ATIVAÇÃO REDE', shiftId: 't6', weekendRule: 'off' },

        { name: 'Alexandre Rozendo', sector: 'TELEFONIA', shiftId: 't6', weekendRule: 'alternating_sun' },
        { name: 'Fabricio Amorim', sector: 'TELEFONIA', shiftId: 't8', weekendRule: 'alternating_sun' },
        { name: 'Melchisedek Silva', sector: 'TELEFONIA', shiftId: 't3', weekendRule: 'off' },
        { name: 'Jose Armando Viana Silva', sector: 'TELEFONIA', shiftId: 't3', weekendRule: 'off' },

        { name: 'Alberto Iraci', sector: 'REDES', shiftId: 't1', weekendRule: 'off' },
        { name: 'Romário Morais', sector: 'REDES', shiftId: 't2', weekendRule: 'off' },
        { name: 'Mikeias Mendes', sector: 'REDES', shiftId: 't8', weekendRule: 'off' },

        { name: 'A R', sector: 'REDES N3', shiftId: 't1', weekendRule: 'off' },
        { name: 'Rafael Batista', sector: 'REDES N3', shiftId: 't1', weekendRule: 'off' },

        { name: 'Diogo Paiva', sector: 'NT TECH', shiftId: 't1', weekendRule: 'off' },
        { name: 'Lucas Travisan', sector: 'NT TECH', shiftId: 't1', weekendRule: 'off' },
        { name: 'Vinicius Augusto', sector: 'NT TECH', shiftId: 't1', weekendRule: 'off' },
        { name: 'Vinicius Silva', sector: 'NT TECH', shiftId: 't1', weekendRule: 'off' }
    ],

    // Tabela de Férias
    vacations: [
        { employeeName: 'Joyce Martins', start: '2025-11-01', end: '2025-12-07' },
        { employeeName: 'Douglas Medeiros', start: '2026-03-01', end: '2026-03-20' }
    ],

    // Plantões (Data Base: 03/11/2025)
    oncalls: [
        {
            name: 'PLANTÃO NOC',
            startDate: '2025-11-03',
            rotation: ['Gabriel Correa', 'Alex Padilha', 'Gustavo Soares', 'Lucas Travisan']
        },
        {
            name: 'PLANTÃO N3',
            startDate: '2025-11-03',
            rotation: ['Rafael Batista', 'A R']
        },
        {
            name: 'PLANTÃO VOZ',
            startDate: '2025-11-03',
            rotation: ['Melchisedek Silva', 'Jose Armando Viana Silva', 'Fabricio Amorim', 'Diogo Paiva']
        },
        {
            name: 'PLANTÃO TECH',
            startDate: '2025-11-03',
            rotation: ['Lucas Travisan', 'Vinicius Augusto', 'Vinicius Silva']
        }
    ],

    holidays: [
        { date: '2025-12-25', name: 'Natal', type: 'Nacional' },
        { date: '2026-01-01', name: 'Ano Novo', type: 'Nacional' }
    ]
};

// ===========================
// IMPORTAÇÃO
// ===========================
async function importCompleteData(silent = false) {
    console.log('🔄 Importando dados...');

    // 1. Limpar dados antigos do Supabase para evitar duplicatas
    if (typeof supabase !== 'undefined' && supabase) {
        try {
            console.log('🧹 Limpando banco de dados...');
            await supabase.from('employees').delete().neq('id', '00000000-0000-0000-0000-000000000000');
            await supabase.from('shifts').delete().neq('id', '0');
            await supabase.from('oncalls').delete().neq('id', '0');
            await supabase.from('vacations').delete().neq('id', '0');
            // Não limpamos monthly_schedules para não perder históricos de meses anteriores se não for necessário,
            // mas se for um reset completo, deveríamos. O usuário pediu "Importar Dados Completos", o que soa como reset.
            // Vamos manter o histórico de escalas por segurança, ou limpar?
            // O problema relatado foi duplicação de FUNCIONÁRIOS. Então limpar employees é o principal.
        } catch (error) {
            console.error('Erro ao limpar Supabase:', error);
        }
    }

    AppState.shifts = COMPLETE_IMPORT_DATA.shifts;
    AppState.employees = COMPLETE_IMPORT_DATA.employees.map(emp => ({ ...emp, id: generateId() }));
    AppState.oncalls = COMPLETE_IMPORT_DATA.oncalls.map(oncall => ({ ...oncall, id: generateId() }));
    AppState.vacations = (COMPLETE_IMPORT_DATA.vacations || []).map(v => ({ ...v, id: generateId() }));

    const existingHolidays = AppState.holidays || [];
    COMPLETE_IMPORT_DATA.holidays.forEach(h => {
        if (!existingHolidays.some(eh => eh.date === h.date)) existingHolidays.push(h);
    });
    AppState.holidays = existingHolidays;

    AppState.sectors = [...new Set(AppState.employees.map(e => e.sector))];

    // Salvar os novos dados
    await saveAppData();

    if (!silent) alert('✅ Dados importados e duplicatas removidas!');
    if (typeof renderDashboard === 'function') renderDashboard();
    return true;
}

// ===========================
// GERADOR DE ESCALA INTELIGENTE V2
// ===========================
function generateSmartSchedule() {
    if (AppState.employees.length === 0) {
        alert('❌ Importe os dados primeiro!');
        return;
    }

    const year = AppState.currentMonth.getFullYear();
    const month = AppState.currentMonth.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const monthKey = `${year}-${String(month + 1).padStart(2, '0')}`;

    const schedule = {};

    AppState.employees.forEach((emp, index) => {
        schedule[emp.id] = {};

        for (let day = 1; day <= daysInMonth; day++) {
            const date = new Date(year, month, day);
            const dateStr = date.toISOString().split('T')[0];
            const dayKey = String(day).padStart(2, '0');
            const dayOfWeek = date.getDay();
            const isHoliday = isDateHoliday(date);

            // 1. REGRA SUPREMA: FÉRIAS
            const isOnVacation = AppState.vacations.some(v => {
                return v.employeeName === emp.name && dateStr >= v.start && dateStr <= v.end;
            });

            if (isOnVacation) {
                schedule[emp.id][dayKey] = 'fe';
                continue;
            }

            // 2. REGRA 12x36 (Caio Anelli)
            if (emp.shiftId === '12x36') {
                const baseDate = new Date('2025-11-01');
                const diffTime = date.getTime() - baseDate.getTime();
                const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

                // CORREÇÃO: Invertido para que 27/11 seja Folga
                if (diffDays % 2 !== 0) {
                    schedule[emp.id][dayKey] = 't9'; // Trabalha
                } else {
                    schedule[emp.id][dayKey] = 'f'; // Folga
                }
                continue;
            }

            // 3. REGRA PADRÃO
            let shift = 'f';

            if (dayOfWeek >= 1 && dayOfWeek <= 5) {
                shift = emp.shiftId;
                if (isHoliday) shift = 'bh';
            } else {
                if (emp.weekendRule === 'alternating') {
                    const weekNum = getWeekNumber(date);
                    const isWorkingWeekend = (weekNum + index) % 2 === 0;
                    if (isWorkingWeekend) {
                        if (dayOfWeek === 6) shift = 't10';
                        if (dayOfWeek === 0) shift = 'f';
                    }
                } else if (emp.weekendRule === 'alternating_sat') {
                    const weekNum = getWeekNumber(date);
                    if (dayOfWeek === 6 && weekNum % 2 === 0) shift = 't10';
                }
            }

            schedule[emp.id][dayKey] = shift;
        }
    });

    // 4. PLANTÕES (Visualização)
    const onCallSchedule = {}; // { '01': { 'NOC': 'ID' } }

    AppState.oncalls.forEach(oncall => {
        const startDate = new Date(oncall.startDate);
        const rotation = oncall.rotation;

        for (let day = 1; day <= daysInMonth; day++) {
            const currentDate = new Date(year, month, day);
            const dateStr = String(day).padStart(2, '0');

            const diffTime = currentDate.getTime() - startDate.getTime();
            const diffWeeks = Math.floor(diffTime / (1000 * 60 * 60 * 24 * 7));

            if (diffWeeks < 0) continue;

            const personName = rotation[diffWeeks % rotation.length];
            const emp = AppState.employees.find(e => e.name === personName);

            if (emp) {
                if (!onCallSchedule[dateStr]) onCallSchedule[dateStr] = [];
                onCallSchedule[dateStr].push({ empId: emp.id, type: oncall.name });
            }
        }
    });

    if (!AppState.scheduleMeta) AppState.scheduleMeta = {};
    AppState.scheduleMeta[monthKey] = onCallSchedule;

    AppState.schedule[monthKey] = schedule;
    saveAppData();

    alert(`✅ Escala de ${monthKey} gerada com sucesso!\n\nPlantões e 12x36 calculados.`);

    if (AppState.currentView !== 'calendar') switchView('calendar');
    else renderCalendar();
}

function getWeekNumber(d) {
    d = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
    d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7));
    var yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    var weekNo = Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
    return weekNo;
}

console.log('📦 import-data.js carregado');
