from flask import Flask, request, jsonify
import networkx as nx
from flask_cors import CORS

app = Flask(__name__)
CORS(app)


@app.route("/")
def index():
    return "OPTI backend работает"


@app.route("/api/optimize", methods=["POST"])
def optimize():
    edges = request.get_json()
    if not edges:
        return jsonify({"error": "Нет данных"}), 400

    G = nx.DiGraph()

    for k, v in edges.items():
        try:
            u, t = k.split("->")
            G.add_edge(u.strip(), t.strip(), capacity=v)
        except:
            return jsonify({"error": f"Неверное ребро {k}"}), 400

    # 🔹 АВТОПОИСК ИСТОЧНИКА И СТОКА
    in_deg = dict(G.in_degree())
    out_deg = dict(G.out_degree())

    sources = [n for n in G.nodes if in_deg[n] == 0]
    sinks = [n for n in G.nodes if out_deg[n] == 0]

    if not sources or not sinks:
        return jsonify({"error": "Не удалось определить источник и сток"}), 400

    source = sources[0]
    sink = sinks[0]

    try:
        flow_value, flow_dict = nx.maximum_flow(G, source, sink)
    except Exception as e:
        return jsonify({"error": str(e)}), 400

    result = {}
    for u, flows in flow_dict.items():
        for v, f in flows.items():
            result[f"{u}->{v}"] = f

    result["_meta"] = {
        "source": source,
        "sink": sink,
        "max_flow": flow_value
    }

    return jsonify(result)


if __name__ == "__main__":
    app.run(host='0.0.0.0', port=5000, debug=True)

