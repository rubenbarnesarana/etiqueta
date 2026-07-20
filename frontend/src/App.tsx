function App() {
  return (
    <div
      style={{
        height: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        background: "#f5f5f5",
        fontFamily: "Arial",
      }}
    >
      <div
        style={{
          textAlign: "center",
          background: "white",
          padding: 40,
          borderRadius: 12,
          boxShadow: "0 10px 30px rgba(0,0,0,.15)",
        }}
      >
        <h1 style={{ color: "#1E7D3A", marginBottom: 10 }}>
          ETIQUETA
        </h1>

        <h3>Sistema de Gestión de Etiquetas</h3>

        <p>Versión 1.0</p>

        <button
          style={{
            background: "#1E7D3A",
            color: "white",
            border: "none",
            padding: "12px 30px",
            borderRadius: 6,
            cursor: "pointer",
            fontSize: 16,
          }}
        >
          Entrar
        </button>
      </div>
    </div>
  );
}

export default App;