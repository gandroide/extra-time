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

    const dataFiltrada = useMemo(() => {
        const term = searchTerm.toLowerCase().trim();
        if (!term) return dataOriginal;
        return dataOriginal.filter(item => {
            return String(item.usuario).toLowerCase().includes(term) || 
                   String(item.idUsuario).toLowerCase().includes(term) || 
                   String(item.fechaPeriodo).toLowerCase().includes(term);
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

    // Estilos de colores explícitos para iOS
    const blueStyle = { color: '#007bff', fontWeight: '700', whiteSpace: 'nowrap' };
    const greenStyle = { color: '#28a745', fontWeight: '700', whiteSpace: 'nowrap' };
    const redStyle = { color: '#dc3545', fontWeight: '700', whiteSpace: 'nowrap' };
    const cellStyle = { whiteSpace: 'nowrap' };

    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <h1 className={styles.title}>Reporte ST GONZALEZ</h1>
            </header>

            <div className={styles.uploadArea}>
                {dataOriginal.length === 0 ? (
                    <label className={styles.fileLabel}>
                        <input type="file" accept=".csv" onChange={(e) => calcularReporte(e.target.files[0])} className={styles.hiddenInput} />
                        <div className={styles.uploadBtn}>📁 Cargar Reporte CSV</div>
                    </label>
                ) : (
                    <div className={styles.controlsRow}>
                        <input 
                            type="text" 
                            className={styles.searchInput}
                            placeholder="🔍 Buscar nombre, ID o fecha..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                        <button className={styles.btnReset} onClick={handleReset}>🔄 Nuevo</button>
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
                                    <th>ID</th>
                                    <th>Fecha</th>
                                    <th>Entrada</th>
                                    <th>Salida</th>
                                    <th>Turno</th>
                                    <th>Trabajadas</th>
                                    <th>Jornada</th>
                                    <th>Normales</th>
                                    <th>Extras</th>
                                </tr>
                            </thead>
                            <tbody>
                                {actuales.map((item, index) => (
                                    <tr key={index} className={item.tipoTurno === 'Nocturno' ? styles.nightRow : ''}>
                                        <td className={styles.boldCell}>{item.usuario}</td>
                                        <td style={cellStyle}>{item.idUsuario}</td>
                                        <td style={cellStyle}>{item.fechaPeriodo}</td>
                                        <td style={cellStyle}>{item.primeraEntrada}</td>
                                        <td style={cellStyle}>{item.ultimaSalida}</td>
                                        <td style={cellStyle}>{item.tipoTurno}</td>
                                        <td style={blueStyle}>{item.horasTrabajadas}</td>
                                        <td style={cellStyle}>{item.jornada}</td>
                                        <td style={greenStyle}>{item.horasNormales}</td>
                                        <td style={redStyle}>{item.horasExtras}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    <div className={styles.pagination}>
                        <button disabled={paginaActual === 1} onClick={() => setPaginaActual(p => p - 1)}>« Anterior</button>
                        <span className={styles.pageIndicator}>{paginaActual} / {totalPaginas}</span>
                        <button disabled={paginaActual === totalPaginas} onClick={() => setPaginaActual(p => p + 1)}>Siguiente »</button>
                    </div>
                </div>
            ) : dataOriginal.length > 0 && (
                <div className={styles.noResults}>No hay resultados para la búsqueda</div>
            )}
        </div>
    );
};

export default Calculadora;