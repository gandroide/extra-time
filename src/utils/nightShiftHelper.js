const CONFIG = {
    nightShiftEntryHour: 17,
    dayDivideHour: 3,
    minShiftHours: 4,
    maxShiftHours: 16,
    lunchBreakHours: 1,
    standardWorkHours: 8
};

export const formatMinutesToTime = (totalMinutes) => {
    if (isNaN(totalMinutes) || totalMinutes < 0) return "0:00";
    const hours = Math.floor(totalMinutes / 60);
    const mins = Math.round(totalMinutes % 60);
    return `${hours}:${mins.toString().padStart(2, '0')}`;
};

export const processWorkHours = (rawData) => {
    if (!rawData || rawData.length === 0) return [];

    const records = rawData.map(row => {
        const fechaHoraStr = row['Fecha y Hora (Registros de acceso)'];
        const idUsuario = row['Id (Usuario)'];
        const nombre = row['Nombre (Usuario)'];

        if (!nombre || !fechaHoraStr || idUsuario === "0" || nombre.trim() === "") return null;

        const cleanStr = String(fechaHoraStr).trim();
        const partes = cleanStr.split(' ');
        if (partes.length < 2) return null;

        const [fecha, hora] = partes;
        const [d, m, y] = fecha.split('/');
        const [hh, mm] = hora.split(':');
        const dateTime = new Date(y, m - 1, d, hh, mm);

        if (isNaN(dateTime.getTime())) return null;

        const workDate = new Date(dateTime);
        if (dateTime.getHours() < CONFIG.dayDivideHour) {
            workDate.setDate(workDate.getDate() - 1);
        }

        return {
            idUsuario: String(idUsuario),
            nombre: nombre.trim(),
            dateTime,
            workDate: workDate.toLocaleDateString('es-DO'), // Formato "DD/MM/YYYY"
            hora
        };
    }).filter(r => r !== null);

    const groups = {};
    records.forEach(r => {
        if (!groups[r.idUsuario]) groups[r.idUsuario] = [];
        groups[r.idUsuario].push(r);
    });

    const results = [];
    Object.values(groups).forEach(employeeRecords => {
        employeeRecords.sort((a, b) => a.dateTime - b.dateTime);

        for (let i = 0; i < employeeRecords.length; i++) {
            const entry = employeeRecords[i];
            
            for (let j = i + 1; j < employeeRecords.length; j++) {
                const exit = employeeRecords[j];
                const duration = (exit.dateTime - entry.dateTime) / (1000 * 60 * 60);
                
                const isNight = entry.dateTime.getHours() >= CONFIG.nightShiftEntryHour;
                const isSameWorkDay = entry.workDate === exit.workDate;

                if ((isNight || isSameWorkDay) && duration >= CONFIG.minShiftHours && duration <= CONFIG.maxShiftHours) {
                    const netHours = duration - CONFIG.lunchBreakHours;
                    const normalHours = Math.min(netHours, CONFIG.standardWorkHours);
                    const extraHours = Math.max(0, netHours - CONFIG.standardWorkHours);

                    results.push({
                        usuario: entry.nombre,
                        idUsuario: String(entry.idUsuario),
                        fechaPeriodo: String(entry.workDate),
                        primeraEntrada: entry.hora,
                        ultimaSalida: exit.hora,
                        tipoTurno: isNight ? 'Nocturno' : 'Diurno',
                        horasTrabajadas: formatMinutesToTime(netHours * 60),
                        jornada: '8:00',
                        horasNormales: formatMinutesToTime(normalHours * 60),
                        horasExtras: formatMinutesToTime(extraHours * 60)
                    });
                    i = j;
                    break;
                }
            }
        }
    });

    return results;
};