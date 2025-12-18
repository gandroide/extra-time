import './App.css'
import Calculadora from './components/Calculadora/Calculadora'

function App() {
  return (
    <div className="app-container">
      {/* Mantenemos el encabezado visual, pero corregimos 
          'class' por 'className' y 'for' por 'htmlFor' 
      */}
      <div className="header-main">
          <h1>Calculadora de Horas - Proyecto Transporte</h1>
          <p>Detección Inteligente de Turnos Nocturnos Activa</p>
      </div>

      <main>
        {/* Aquí es donde ocurre la magia. 
          Tu componente Calculadora ya tiene el input, 
          la lógica de PapaParse y la tabla.
        */}
        <Calculadora />
      </main>

      {/* Sección informativa (opcional, movida del HTML original) */}
      <div className="info-box-react">
          <h3>⚙️ Configuración del Sistema:</h3>
          <ul>
              <li>• Day Divide: 03:00 AM</li>
              <li>• Umbral Nocturno: Entrada ≥ 17:00</li>
              <li>• Algoritmo de dos pasadas activo</li>
          </ul>
      </div>
    </div>
  )
}   

export default App