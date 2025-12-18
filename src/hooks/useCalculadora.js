import { useState } from 'react';
import Papa from 'papaparse';
import { processWorkHours } from '../utils/nightShiftHelper';

export const useCalculadora = () => {
    const [resultados, setResultados] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [fileName, setFileName] = useState("");

    const calcularReporte = (file) => {
        if (!file) return;

        setLoading(true);
        setError(null);
        setFileName(file.name);

        Papa.parse(file, {
  header: true,
  skipEmptyLines: true,
  dynamicTyping: true,
  delimiter: "", // Esto obliga a PapaParse a ADIVINAR si es coma o punto y coma
  complete: (results) => {
    console.log("Datos crudos del CSV:", results.data); // Mira esto en la consola (F12)
    const filtrados = processWorkHours(results.data);
    setResultados(filtrados);
  }
});
    };

    const reiniciar = () => {
        setResultados([]);
        setError(null);
        setFileName("");
    };

    return {
        resultados,
        loading,
        error,
        fileName,
        calcularReporte,
        reiniciar
    };
};