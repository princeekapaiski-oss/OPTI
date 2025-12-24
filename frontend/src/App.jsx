import React, { useState, useRef } from "react";
import ForceGraph2D from "react-force-graph-2d";
import axios from "axios";
import "./App.css";

// === URL бекенда на Render ===
// Замените на ваш реальный URL после деплоя бекенда Render
const API_URL = "https://opti-mugz.onrender.com/api/optimize";

export default function App() {
  const [nodes, setNodes] = useState(["A", "B", "C"]);
  const [edges, setEdges] = useState([
    { from: "A", to: "B", value: 10 },
    { from: "A", to: "C", value: 5 },
    { from: "B", to: "C", value: 15 }
  ]);

  const [graphData, setGraphData] = useState({ nodes: [], links: [] });
  const [flowResult, setFlowResult] = useState({});
  const [explanation, setExplanation] = useState([]);
  const fgRef = useRef(null);

  /* ---------- ШАБЛОНЫ СЕТЕЙ ---------- */
  const templates = {
    linear: {
      nodes: ["A", "B", "C", "D"],
      edges: [
        { from: "A", to: "B", value: 10 },
        { from: "B", to: "C", value: 8 },
        { from: "C", to: "D", value: 6 }
      ]
    },
    star: {
      nodes: ["A", "B", "C", "D"],
      edges: [
        { from: "A", to: "B", value: 10 },
        { from: "A", to: "C", value: 10 },
        { from: "A", to: "D", value: 10 }
      ]
    },
    full: {
      nodes: ["A", "B", "C"],
      edges: [
        { from: "A", to: "B", value: 10 },
        { from: "A", to: "C", value: 10 },
        { from: "B", to: "C", value: 10 }
      ]
    },
    tree: {
      nodes: ["A", "B", "C", "D", "E"],
      edges: [
        { from: "A", to: "B", value: 10 },
        { from: "A", to: "C", value: 10 },
        { from: "B", to: "D", value: 5 },
        { from: "B", to: "E", value: 5 }
      ]
    },
    transport: {
      nodes: ["S", "A", "B", "T"],
      edges: [
        { from: "S", to: "A", value: 10 },
        { from: "S", to: "B", value: 5 },
        { from: "A", to: "T", value: 7 },
        { from: "B", to: "T", value: 8 }
      ]
    }
  };

  const loadTemplate = key => {
    setNodes([...templates[key].nodes]);
    setEdges([...templates[key].edges]);
    setGraphData({ nodes: [], links: [] });
    setExplanation([]);
    setFlowResult({});
  };

  /* ---------- ВВОД ---------- */
  const handleAddNode = () => setNodes([...nodes, ""]);
  const handleNodeChange = (i, val) => {
    const updated = [...nodes];
    updated[i] = val;
    setNodes(updated);
  };
  const handleAddEdge = () => setEdges([...edges, { from: "", to: "", value: 0 }]);
  const handleEdgeChange = (i, field, val) => {
    const updated = [...edges];
    updated[i][field] = field === "value" ? Number(val) : val;
    setEdges(updated);
  };

  /* ---------- ОПТИМИЗАЦИЯ ---------- */
  const handleOptimize = async () => {
    try {
      const payload = {};
      edges.forEach(e => {
        if (e.from && e.to) payload[`${e.from}->${e.to}`] = e.value;
      });

      const res = await axios.post(API_URL, payload);
      setFlowResult(res.data);

      const nodesSet = new Set();
      const links = [];
      const explain = [];

      Object.entries(res.data).forEach(([key, flow]) => {
        const [from, to] = key.split("->");
        nodesSet.add(from);
        nodesSet.add(to);

        links.push({ source: from, target: to, value: flow });

        if (flow > 0) {
          explain.push(`По каналу ${from} → ${to} оптимально передано ${flow} единиц потока`);
        }
      });

      // Если бекенд вернул _meta (например max_flow)
      if (res.data._meta) {
        explain.unshift(
          `Источник: ${res.data._meta.source}, Сток: ${res.data._meta.sink}, Максимальный поток: ${res.data._meta.max_flow}`
        );
      }

      setGraphData({ nodes: Array.from(nodesSet).map(id => ({ id })), links });
      setExplanation(explain);

      setTimeout(() => fgRef.current?.zoomToFit(400), 300);
    } catch (err) {
      alert("Ошибка оптимизации. Проверьте введённые данные или работу сервера.");
      console.error(err);
    }
  };

  return (
    <div className="app-container">
      <h1>OPTI — ваш сервис по оптимизации сетей</h1>

      <div className="template-section">
        <h2>Шаблоны сетей</h2>
        {Object.keys(templates).map((key) => (
          <button key={key} onClick={() => loadTemplate(key)}>
            {key.charAt(0).toUpperCase() + key.slice(1)}
          </button>
        ))}
      </div>

      <div className="input-section">
        <h2>Узлы</h2>
        {nodes.map((n, i) => (
          <input key={i} value={n} onChange={(e) => handleNodeChange(i, e.target.value)} />
        ))}
        <button onClick={handleAddNode}>+ Узел</button>

        <h2>Рёбра</h2>
        {edges.map((e, i) => (
          <div key={i} className="edge-input">
            <input value={e.from} onChange={(ev) => handleEdgeChange(i, "from", ev.target.value)} />
            →
            <input value={e.to} onChange={(ev) => handleEdgeChange(i, "to", ev.target.value)} />
            <input type="number" value={e.value} onChange={(ev) => handleEdgeChange(i, "value", ev.target.value)} />
          </div>
        ))}
        <button onClick={handleAddEdge}>+ Ребро</button>

        <button className="optimize-btn" onClick={handleOptimize}>
          Оптимизировать сеть
        </button>
      </div>

      <div className="graph-section">
        <ForceGraph2D
          ref={fgRef}
          graphData={graphData}
          nodeAutoColorBy="id"
          linkWidth={(l) => Math.max(2, l.value)}
          linkColor={(l) => (l.value > 0 ? "#00c853" : "#ccc")}
          linkDirectionalArrowLength={6}
          nodeLabel="id"
        />
      </div>

      <div className="result-section">
        <h2>Результаты оптимизации</h2>
        <ul>
          {explanation.map((e, i) => (
            <li key={i}>{e}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}
