
export interface Edge {
  from: string
  to: string
  cost: number
}

export interface Graph {
  nodes: string[]
  edges: Edge[]
}

export interface DijkstraStep {
  stepIndex: number
  N_prime: string[] // Set of nodes with permanent least cost
  D: Record<string, number> // Current least cost from source to v
  p: Record<string, string> // Predecessor node
  current_u: string | null // Node just added to N'
  updated_neighbors: string[] // Nodes whose D(v) changed this step
}

export class DijkstraSolver {
  graph: Graph
  source: string

  constructor(graph: Graph, source: string) {
    this.graph = graph
    this.source = source
  }

  solve(): DijkstraStep[] {
    const steps: DijkstraStep[] = []
    const nodes = this.graph.nodes
    const N_prime: string[] = [this.source]
    const D: Record<string, number> = {}
    const p: Record<string, string> = {}

    // Initialize
    nodes.forEach(v => {
      if (v === this.source) {
        D[v] = 0
        p[v] = '-'
      } else {
        const edge = this.findEdge(this.source, v)
        if (edge) {
          D[v] = edge.cost
          p[v] = this.source
        } else {
          D[v] = Infinity
          p[v] = '-'
        }
      }
    })

    // Initial Step 0
    steps.push({
      stepIndex: 0,
      N_prime: [...N_prime],
      D: { ...D },
      p: { ...p },
      current_u: this.source,
      updated_neighbors: []
    })

    // Loop until all nodes are in N'
    while (N_prime.length < nodes.length) {
      // Find w not in N' with minimum D(w)
      let minDist = Infinity
      let u: string | null = null

      nodes.forEach(w => {
        if (!N_prime.includes(w)) {
          if (D[w] < minDist) {
            minDist = D[w]
            u = w
          }
        }
      })

      if (u === null) break; // Graph disconnected or complete

      N_prime.push(u)
      const current_u = u
      const updated_neighbors: string[] = []

      // Update neighbors of u
      nodes.forEach(v => {
        if (!N_prime.includes(v)) {
          const edge = this.findEdge(current_u!, v)
          if (edge) {
            const newDist = D[current_u!] + edge.cost
            if (newDist < D[v]) {
              D[v] = newDist
              p[v] = current_u!
              updated_neighbors.push(v)
            }
          }
        }
      })

      steps.push({
        stepIndex: steps.length,
        N_prime: [...N_prime],
        D: { ...D },
        p: { ...p },
        current_u: current_u,
        updated_neighbors
      })
    }

    return steps
  }

  private findEdge(u: string, v: string): Edge | undefined {
    return this.graph.edges.find(
      e => (e.from === u && e.to === v) || (e.from === v && e.to === u)
    )
  }
}

// === Presets ===

export const defaultGraph: Graph = {
  nodes: ['u', 'v', 'x', 'y', 'z', 'w'],
  edges: [
    { from: 'u', to: 'v', cost: 2 },
    { from: 'u', to: 'x', cost: 1 },
    { from: 'u', to: 'w', cost: 5 },
    { from: 'v', to: 'x', cost: 2 },
    { from: 'v', to: 'w', cost: 3 },
    { from: 'x', to: 'w', cost: 3 },
    { from: 'x', to: 'y', cost: 1 },
    { from: 'y', to: 'w', cost: 1 },
    { from: 'y', to: 'z', cost: 2 },
    { from: 'w', to: 'z', cost: 5 }
  ]
}

export const triangleGraph: Graph = {
  nodes: ['A', 'B', 'C'],
  edges: [
    { from: 'A', to: 'B', cost: 4 },
    { from: 'B', to: 'C', cost: 1 },
    { from: 'C', to: 'A', cost: 10 }
  ]
}

export const diamondGraph: Graph = {
  nodes: ['S', 'A', 'B', 'T'],
  edges: [
    { from: 'S', to: 'A', cost: 1 },
    { from: 'S', to: 'B', cost: 4 },
    { from: 'A', to: 'B', cost: 2 },
    { from: 'A', to: 'T', cost: 6 },
    { from: 'B', to: 'T', cost: 3 }
  ]
}

export const starGraph: Graph = {
  nodes: ['C', 'N1', 'N2', 'N3', 'N4', 'N5'],
  edges: [
    { from: 'C', to: 'N1', cost: 2 },
    { from: 'C', to: 'N2', cost: 5 },
    { from: 'C', to: 'N3', cost: 1 },
    { from: 'C', to: 'N4', cost: 8 },
    { from: 'C', to: 'N5', cost: 3 },
    { from: 'N1', to: 'N2', cost: 2 },
    { from: 'N3', to: 'N4', cost: 4 }
  ]
}

// Preset Coordinate Maps for nice layout
export const presetCoords: Record<string, Record<string, {x: number, y: number}>> = {
  'default': {
    'u': { x: 50, y: 125 },
    'v': { x: 150, y: 50 },
    'x': { x: 150, y: 200 },
    'w': { x: 300, y: 50 },
    'y': { x: 300, y: 200 },
    'z': { x: 400, y: 125 }
  },
  'triangle': {
    'A': { x: 100, y: 200 },
    'B': { x: 250, y: 50 },
    'C': { x: 400, y: 200 }
  },
  'diamond': {
    'S': { x: 50, y: 125 },
    'A': { x: 200, y: 50 },
    'B': { x: 200, y: 200 },
    'T': { x: 350, y: 125 }
  },
  'star': {
    'C': { x: 225, y: 155 },
    'N1': { x: 225, y: 55 },
    'N2': { x: 320, y: 125 },
    'N3': { x: 295, y: 235 },
    'N4': { x: 155, y: 235 },
    'N5': { x: 130, y: 125 }
  }
}

export const presets = [
  { id: 'default', name: 'Textbook Example (6 nodes)', graph: defaultGraph },
  { id: 'triangle', name: 'Triangle Loop', graph: triangleGraph },
  { id: 'diamond', name: 'Diamond (Rhombus)', graph: diamondGraph },
  { id: 'star', name: 'Star Network', graph: starGraph }
]
