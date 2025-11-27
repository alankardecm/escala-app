// ===========================
// DADOS EXTRAÍDOS DA ESCALA DE NOVEMBRO/2025
// ===========================

const COMPLETE_IMPORT_DATA = {
    // Turnos com cores e horários ATUALIZADOS
    shifts: [
        // Turnos de Trabalho
        { id: 't1', name: 'T1', time: '07:00 às 16:00', color: '#00b0f0' },      // Azul Claro
        { id: 't2', name: 'T2', time: '13:00 às 22:00', color: '#00b050' },      // Verde
        { id: 't3', name: 'T3', time: '08:30 às 18:18', color: '#ff6b9d' },      // Rosa (antigo FC)
        { id: 't4', name: 'T4', time: '00:00 às 09:00', color: '#483d8b' },      // Azul Escuro (Madrugada)
        { id: 't5', name: 'T5', time: '08:00 às 16:00', color: '#87ceeb' },      // Azul Céu
        { id: 't6', name: 'T6', time: '09:00 às 18:00', color: '#ff0000' },      // Vermelho (antigo RED)
        { id: 't7', name: 'T7', time: '22:00 às 07:00', color: '#9966ff' },      // Roxo (antigo T3)
        { id: 't8', name: 'T8', time: '08:00 às 17:00', color: '#ffa500' },      // Laranja
        { id: 't9', name: 'T9', time: '10:00 às 19:00', color: '#ff00ff' },      // Pink (antigo PINK)
        { id: 't10', name: 'T10', time: '14:00 às 22:00', color: '#663399' },    // Roxo Escuro (antigo PURPLE)

        // Status / Ausências
        { id: 'f', name: 'F', time: 'Folga', color: '#ffeb3b' },                 // Amarelo
        { id: 'bh', name: 'BH', time: 'Banco de Horas', color: '#2d2d4a' },      // Escuro
        { id: 'fe', name: 'FE', time: 'Férias', color: '#00ced1' },              // Turquesa
        { id: 'ft', name: 'FT', time: 'Falta', color: '#8b0000' },               // Vermelho Escuro
        { id: 'at', name: 'AT', time: 'Atestado', color: '#ffd700' }             // Dourado
    ],

    // Funcionários atualizados com os NOVOS códigos de turno
    employees: [
        // SUPORTE N1
        { name: 'Gustavo Soares', sector: 'SUPORTE N1', shiftId: 't1', pattern: 'F-F-T1-T1-T1-T1-T1' },
        { name: 'Gabriel Agostinho', sector: 'SUPORTE N1', shiftId: 't7', pattern: 'F-F-T7-T7-T7-T7-T7' }, // Era T3 (noite) -> T7
        { name: 'Brenno Benuto', sector: 'SUPORTE N1', shiftId: 't7', pattern: 'F-F-T7-T7-T7-T7-T7' },     // Era T3 (noite) -> T7
        { name: 'Gabriella Piedra', sector: 'SUPORTE N1', shiftId: 't7', pattern: 'F-F-T7-T7-T7-T7-T7' },  // Era T3 (noite) -> T7
        { name: 'Douglas Medeiros', sector: 'SUPORTE N1', shiftId: 't6', pattern: 'F-F-T6-T6-T6-T6-T6' },  // Era RED -> T6
        { name: 'Gabriel Amoedo', sector: 'SUPORTE N1', shiftId: 't7', pattern: 'F-F-T7-T7-T7-T7-T7' },    // Era T3 (noite) -> T7
        { name: 'Vinicius Kiyoshi', sector: 'SUPORTE N1', shiftId: 't1', pattern: 'F-F-T1-T1-T1-T1-T1' },
        { name: 'Hélio Batista', sector: 'SUPORTE N1', shiftId: 't1', pattern: 'F-T1-T1-T1-T1-T1-T1' },
        { name: 'Carlos Santos', sector: 'SUPORTE N1', shiftId: 't2', pattern: 'T2-F-T2-T2-T2-T2-T2' },
        { name: 'Felipe Thacio', sector: 'SUPORTE N1', shiftId: 't2', pattern: 'F-F-T2-T2-T2-T2-T2' },
        { name: 'Lucas Torres', sector: 'SUPORTE N1', shiftId: 't7', pattern: 'F-F-T7-T7-T7-T7-T7' },      // Era T3 (noite) -> T7
        { name: 'Luiz Silva', sector: 'SUPORTE N1', shiftId: 't7', pattern: 'F-F-T7-T7-T7-T7-T7' },        // Era T3 (noite) -> T7
        { name: 'Gabriel Sebastião', sector: 'SUPORTE N1', shiftId: 't7', pattern: 'F-F-T7-T7-T7-T7-T7' }, // Era T3 (noite) -> T7
        { name: 'Riquelme Sousa', sector: 'SUPORTE N1', shiftId: 't2', pattern: 'T2-F-T2-T2-T2-T2-F' },
        { name: 'Joyce Martins', sector: 'SUPORTE N1', shiftId: 't8', pattern: 'F-F-T8-T8-T8-T8-T8' },     // Era FE (trabalho) -> T8 (aprox)

        // SUPORTE N2
        { name: 'Caio Anelli', sector: 'SUPORTE N2', shiftId: 'f', pattern: 'F-F-F-F-F-F-F' },
        { name: 'Christian Campos', sector: 'SUPORTE N2', shiftId: 't3', pattern: 'F-F-T3-T3-T3-T3-T3' },  // Era FC -> T3
        { name: 'Alex Padilha', sector: 'SUPORTE N2', shiftId: 't1', pattern: 'T1-F-T1-T1-T1-T1-T1' },
        { name: 'A K', sector: 'SUPORTE N2', shiftId: 't8', pattern: 'F-F-T8-T8-T8-T8-T8' },               // Era FE -> T8

        // ATIVAÇÃO REDE
        { name: 'Reginaldo Pires', sector: 'ATIVAÇÃO REDE', shiftId: 't1', pattern: 'F-F-T1-T1-T1-T1-T1' },
        { name: 'Murilo Stenico', sector: 'ATIVAÇÃO REDE', shiftId: 't1', pattern: 'F-F-T1-T1-T1-T1-T1' },
        { name: 'Henrique Xavier', sector: 'ATIVAÇÃO REDE', shiftId: 't7', pattern: 'F-F-T7-T7-T7-T7-T7' }, // Era T3 -> T7
        { name: 'D D', sector: 'ATIVAÇÃO REDE', shiftId: 't7', pattern: 'F-F-T7-T7-T7-T7-T7' },             // Era T3 -> T7

        // TELEFONIA
        { name: 'Alexandre Rozendo', sector: 'TELEFONIA', shiftId: 't7', pattern: 'F-F-T7-T7-T7-T7-T7' },   // Era T3 -> T7
        { name: 'Fabricio Amorim', sector: 'TELEFONIA', shiftId: 't1', pattern: 'F-F-T1-T1-T1-T1-T1' },
        { name: 'Melchisedek Silva', sector: 'TELEFONIA', shiftId: 't1', pattern: 'F-F-T1-T1-T1-T1-T1' },
        { name: 'Jose Armando Viana Silva', sector: 'TELEFONIA', shiftId: 't1', pattern: 'F-F-T1-T1-T1-T1-T1' },

        // REDES
        { name: 'Alberto Iraci', sector: 'REDES', shiftId: 't1', pattern: 'F-F-T1-T1-T1-T1-T1' },
        { name: 'Romário Morais', sector: 'REDES', shiftId: 't2', pattern: 'F-F-T2-T2-T2-T2-T2' },
        { name: 'Mikeias Mendes', sector: 'REDES', shiftId: 't8', pattern: 'F-F-T8-T8-T8-T8-T8' },         // Era FE -> T8
        { name: 'Rafael Batista', sector: 'REDES', shiftId: 't1', pattern: 'F-F-T1-T1-T1-T1-T1' },

        // REDES N3
        { name: 'A R', sector: 'REDES N3', shiftId: 't1', pattern: 'F-F-T1-T1-T1-T1-T1' },

        // NT TECH
        { name: 'Diogo Paiva', sector: 'NT TECH', shiftId: 't1', pattern: 'F-F-T1-T1-T1-T1-T1' },
        { name: 'Lucas Travisan', sector: 'NT TECH', shiftId: 't1', pattern: 'F-F-T1-T1-T1-T1-T1' },
        { name: 'Vinicius Augusto', sector: 'NT TECH', shiftId: 't1', pattern: 'F-F-T1-T1-T1-T1-T1' },
        { name: 'Vinicius Silva', sector: 'NT TECH', shiftId: 't1', pattern: 'F-F-T1-T1-T1-T1-T1' }
    ],

    // Plantões com rotações semanais
    oncalls: [
        {
            name: 'PLANTÃO NOC',
            rotation: [
                'Gabriel Correa',
                'Alex Padilha',
                'Gustavo Soares',
                'Lucas Travisan'
            ]
        },
        {
            name: 'PLANTÃO N3',
            rotation: [
                'Rafael Batista',
                'A R'
            ]
        },
        {
            name: 'PLANTÃO VOZ',
            rotation: [
                'Melchisedek Silva',
                'Jose Armando Viana Silva',
                'Fabricio Amorim',
                'Diogo Paiva'
            ]
        },
        {
            name: 'PLANTÃO TECH',
            rotation: [
                'Lucas Travisan',
                'Vinicius Augusto',
                'Vinicius Silva'
            ]
        }
    ],

    // Feriados de Dezembro 2025
    holidays: [
        { date: '2025-12-25', name: 'Natal', type: 'Nacional' }
    ]
};

// ===========================
// FUNÇÃO DE IMPORTAÇÃO AUTOMÁTICA
// ===========================

function importCompleteData(silent = false) {
    console.log('🔄 Iniciando importação completa dos dados...');

    // Importar turnos
    AppState.shifts = COMPLETE_IMPORT_DATA.shifts;

    // Importar funcionários com IDs únicos
    AppState.employees = COMPLETE_IMPORT_DATA.employees.map(emp => ({
        ...emp,
        id: generateId()
    }));

    // Importar plantões com IDs únicos
    AppState.oncalls = COMPLETE_IMPORT_DATA.oncalls.map(oncall => ({
        ...oncall,
        id: generateId()
    }));

    // Manter feriados existentes e adicionar novos
    const existingHolidays = AppState.holidays || [];
    COMPLETE_IMPORT_DATA.holidays.forEach(newHoliday => {
        if (!existingHolidays.some(h => h.date === newHoliday.date)) {
            existingHolidays.push(newHoliday);
        }
    });
    AppState.holidays = existingHolidays;

    // Atualizar setores
    const uniqueSectors = [...new Set(AppState.employees.map(e => e.sector))];
    AppState.sectors = uniqueSectors;

    // Salvar tudo
    saveAppData();

    console.log('✨ Importação concluída com sucesso!');

    // Atualizar interface
    updateStats();
    if (typeof renderDashboard === 'function') renderDashboard();

    // Notificar usuário apenas se não for silencioso
    if (!silent) {
        alert(`✅ Dados importados com sucesso!\n\n` +
            `- ${AppState.employees.length} funcionários\n` +
            `- ${AppState.shifts.length} turnos\n` +
            `- ${AppState.oncalls.length} plantões\n` +
            `- ${AppState.sectors.length} setores\n\n` +
            `Agora você pode gerar a escala de Dezembro!`);
    }

    return true;
}

// ===========================
// GERADOR INTELIGENTE DE ESCALA
// ===========================

function generateSmartSchedule() {
    if (AppState.employees.length === 0) {
        alert('❌ Nenhum funcionário cadastrado. Execute a importação primeiro!');
        return;
    }

    const year = AppState.currentMonth.getFullYear();
    const month = AppState.currentMonth.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const monthKey = `${year}-${String(month + 1).padStart(2, '0')}`;

    console.log(`🗓️ Gerando escala para ${monthKey}...`);

    const schedule = {};

    AppState.employees.forEach(emp => {
        schedule[emp.id] = {};

        // Analisar padrão de trabalho
        const pattern = emp.pattern ? emp.pattern.split('-') : [emp.shiftId];
        let patternIndex = 0;

        for (let day = 1; day <= daysInMonth; day++) {
            const date = new Date(year, month, day);
            const dayKey = String(day).padStart(2, '0');
            const isHoliday = isDateHoliday(date);
            const dayOfWeek = date.getDay(); // 0 = Domingo, 6 = Sábado

            // Aplicar padrão cíclico
            let shiftForDay = pattern[patternIndex % pattern.length].toLowerCase();

            // Se for feriado e não é folga, marcar como BH
            if (isHoliday && shiftForDay !== 'f') {
                shiftForDay = 'bh';
            }

            schedule[emp.id][dayKey] = shiftForDay;
            patternIndex++;
        }
    });

    // Aplicar plantões semanais
    AppState.oncalls.forEach(oncall => {
        const rotationLength = oncall.rotation.length;
        let weekNumber = 0;

        for (let day = 1; day <= daysInMonth; day++) {
            const date = new Date(year, month, day);
            const dayOfWeek = date.getDay();

            // Nova semana começa na segunda-feira (day = 1)
            if (dayOfWeek === 1 && day > 1) {
                weekNumber++;
            }

            const personOnCall = oncall.rotation[weekNumber % rotationLength];

            // Encontrar funcionário e marcar plantão (sobrepor turno normal)
            const employee = AppState.employees.find(e => e.name === personOnCall);
            if (employee && schedule[employee.id]) {
                const dayKey = String(day).padStart(2, '0');
                // Adicionar marcador de plantão (pode customizar aqui)
                // Por enquanto, mantém o turno normal mas poderíamos adicionar indicador
            }
        }
    });

    AppState.schedule[monthKey] = schedule;
    saveAppData();

    console.log('✅ Escala gerada com sucesso!');

    alert(`✅ Escala de ${monthKey} gerada!\n\n` +
        `Total de dias: ${daysInMonth}\n` +
        `Funcionários escalados: ${AppState.employees.length}\n\n` +
        `Visualize na aba "Escala do Mês"`);

    // Mudar para visualização de calendário
    if (AppState.currentView !== 'calendar') {
        switchView('calendar');
    } else {
        renderCalendar();
    }
}

console.log('📦 import-data.js carregado - Use importCompleteData() para importar todos os dados');
