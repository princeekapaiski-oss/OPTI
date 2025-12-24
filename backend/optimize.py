import pulp
import networkx as nx

def optimize_network(edges, demand):
    G = nx.Graph()
    for e in edges:
        G.add_edge(e['u'], e['v'])

    prob = pulp.LpProblem("NetOpt", pulp.LpMinimize)
    x = {e['id']: pulp.LpVariable(e['id'], cat='Binary') for e in edges}

    prob += pulp.lpSum(e['cost'] * x[e['id']] for e in edges)
    prob += pulp.lpSum(e['capacity'] * x[e['id']] for e in edges) >= demand

    prob.solve(pulp.PULP_CBC_CMD(msg=False))
    return [e['id'] for e in edges if x[e['id']].value() == 1]
