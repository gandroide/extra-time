import React, { useState, useEffect, useMemo } from 'react';
import styles from './Calculadora.module.css';
import { useCalculadora } from '../../hooks/useCalculadora';

const Calculadora = () => {
    const { resultados, loading, error, fileName, calcularReporte, reiniciar } = useCalculadora();
    const [paginaActual, setPaginaActual] = useState(1);
    const [searchTerm, setSearchTerm] = useState('');
    const registrosPorPagina = 12;

    const [datosPersistentes, setDatosPersistentes] = useState(() => {
        const saved = localStorage.getItem('st_gonzalez_report');
        return saved ? JSON.parse(saved) : [];
    });

    useEffect(() => {
        if (resultados.length > 0) {
            localStorage.setItem('st_gonzalez_report', JSON.stringify(resultados));
            setDatosPersistentes(resultados);
        }
    }, [resultados]);

    const dataOriginal = resultados.length > 0 ? resultados : datosPersistentes;

    // Lógica de filtrado corregida para búsqueda por fecha, ID y nombre
    const dataFiltrada = useMemo(() => {
        const term = searchTerm.toLowerCase().trim();
        if (!term) return dataOriginal;

        return dataOriginal.filter(item => {
            const valNombre = String(item.usuario).toLowerCase();
            const valId = String(item.idUsuario).toLowerCase();
            const valFecha = String(item.fechaPeriodo).toLowerCase();

            return valNombre.includes(term) || 
                   valId.includes(term) || 
                   valFecha.includes(term);
        });
    }, [dataOriginal, searchTerm]);

    useEffect(() => {
        setPaginaActual(1);
    }, [searchTerm]);

    const totalPaginas = Math.ceil(dataFiltrada.length / registrosPorPagina);
    const actuales = dataFiltrada.slice((paginaActual - 1) * registrosPorPagina, paginaActual * registrosPorPagina);

    const handleReset = () => {
        localStorage.removeItem('st_gonzalez_report');
        setDatosPersistentes([]);
        setSearchTerm('');
        reiniciar();
    };

    // Estilos de colores solicitados
    const blueStyle = { color: '#007bff', fontWeight: 'bold' };
    const greenStyle = { color: '#28a745', fontWeight: 'bold' };
    const redStyle = { color: '#dc3545', fontWeight: 'bold' };

    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <h1 className={styles.title}>Reporte de Asistencia Logística</h1>
            </header>

            <div className={styles.uploadArea}>
                {dataOriginal.length === 0 ? (
                    <label className={styles.fileLabel}>
                        <input type="file" accept=".csv" onChange={(e) => calcularReporte(e.target.files[0])} className={styles.hiddenInput} />
                        <div className={styles.uploadBtn}>📁 Cargar Reporte original.csv</div>
                    </label>
                ) : (
                    <div className={styles.controlsRow} style={{ display: 'flex', gap: '10px', width: '100%', maxWidth: '800px' }}>
                        <input 
                            type="text" 
                            className={styles.searchInput}
                            placeholder="🔍 Buscar por nombre, ID o fecha (ej: 13/10)..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            style={{ flex: 1, padding: '10px', borderRadius: '5px', border: '1px solid #ccc' }}
                        />
                        <button className={styles.btnReset} onClick={handleReset}>🔄 Nuevo Archivo</button>
                    </div>
                )}
            </div>

            {dataFiltrada.length > 0 ? (
                <div className={styles.resultsArea}>
                    <div className={styles.tableWrapper}>
                        <table className={styles.table}>
                            <thead>
                                <tr>
                                    <th>Usuario</th>
                                    <th>ID Usuario</th>
                                    <th>Fecha/Período</th>
                                    <th>Primera Entrada</th>
                                    <th>Última Salida</th>
                                    <th>Tipo Turno</th>
                                    <th>Horas Trabajadas</th>
                                    <th>Jornada</th>
                                    <th>Horas Normales</th>
                                    <th>Horas Extras</th>
                                </tr>
                            </thead>
                            <tbody>
                                {actuales.map((item, index) => (
                                    <tr key={index} className={item.tipoTurno === 'Nocturno' ? styles.nightRow : ''}>
                                        <td className={styles.bold}>{item.usuario}</td>
                                        <td>{item.idUsuario}</td>
                                        <td>{item.fechaPeriodo}</td>
                                        <td>{item.primeraEntrada}</td>
                                        <td>{item.ultimaSalida}</td>
                                        <td>{item.tipoTurno}</td>
                                        <td style={blueStyle}>{item.horasTrabajadas}</td>
                                        <td>{item.jornada}</td>
                                        <td style={greenStyle}>{item.horasNormales}</td>
                                        <td style={redStyle}>{item.horasExtras}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    <div className={styles.pagination}>
                        <button disabled={paginaActual === 1} onClick={() => setPaginaActual(p => p - 1)}>Anterior</button>
                        <span>Página {paginaActual} de {totalPaginas} ({dataFiltrada.length} resultados)</span>
                        <button disabled={paginaActual === totalPaginas} onClick={() => setPaginaActual(p => p + 1)}>Siguiente</button>
                    </div>
                </div>
            ) : dataOriginal.length > 0 && (
                <div style={{ padding: '20px', textAlign: 'center', color: '#666' }}>
                    No se encontraron resultados para la búsqueda.
                </div>
            )}
        </div>
    );
};

export default Calculadora;