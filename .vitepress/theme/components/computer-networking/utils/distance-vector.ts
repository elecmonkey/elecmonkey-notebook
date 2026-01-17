
export interface Link {
  from: string
  to: string
  cost: number
  active: boolean
}

export type RoutingTable = Record<string, number>

export interface NodeState {
  id: string
  table: RoutingTable // My estimate of distance to everyone
  neighborTables: Record<string, RoutingTable> // What neighbors told me
}

export interface DVStep {
  stepIndex: number
  description: string
  nodes: Record<string, NodeState>
  messages: { from: string, to: string, vector: RoutingTable }[]
}

export class DVSimulator {
  links: Link[]
  nodes: string[] = ['x', 'y', 'z']
  poisonReverse: boolean = false
  maxSteps: number = 1000

  constructor(poisonReverse: boolean = false) {
    this.poisonReverse = poisonReverse
    this.links = [
      { from: 'x', to: 'y', cost: 4, active: true },
      { from: 'y', to: 'z', cost: 1, active: true },
      { from: 'z', to: 'x', cost: 50, active: true }
    ]
  }

  // Initial Stable State
  getInitialState(): NodeState[] {
    // Hardcoded stable state for the 4, 1, 50 triangle
    // x->y=4, x->z=5 (via y)
    // y->x=4, y->z=1
    // z->x=5 (via y), z->y=1
    return [
      {
        id: 'x',
        table: { x: 0, y: 4, z: 5 },
        neighborTables: { y: { x: 4, y: 0, z: 1 }, z: { x: 5, y: 1, z: 0 } }
      },
      {
        id: 'y',
        table: { x: 4, y: 0, z: 1 },
        neighborTables: { x: { x: 0, y: 4, z: 5 }, z: { x: 5, y: 1, z: 0 } }
      },
      {
        id: 'z',
        table: { x: 5, y: 1, z: 0 },
        neighborTables: { x: { x: 0, y: 4, z: 5 }, y: { x: 4, y: 0, z: 1 } }
      }
    ]
  }

  simulateLinkBreak(initialStates: NodeState[]): DVStep[] {
    const steps: DVStep[] = []
    
    // Deep copy states
    let currentNodes: Record<string, NodeState> = {}
    initialStates.forEach(s => currentNodes[s.id] = JSON.parse(JSON.stringify(s)))

    // Step 0: Link Break
    // Change x-y cost to 60 (simulating break/increase)
    this.updateLink('x', 'y', 60)
    
    // Update X and Y's local view of direct link cost
    // X detects change
    this.recomputeTable(currentNodes['x'])
    // Y detects change
    this.recomputeTable(currentNodes['y'])

    steps.push({
      stepIndex: 0,
      description: 'Link x-y cost changes to 60. x and y detect change.',
      nodes: JSON.parse(JSON.stringify(currentNodes)),
      messages: []
    })

    // Loop for convergence
    let hasUpdates = true
    let loopCount = 0

    while (hasUpdates && loopCount < this.maxSteps) {
      loopCount++
      const nextNodes: Record<string, NodeState> = JSON.parse(JSON.stringify(currentNodes))
      const messages: { from: string, to: string, vector: RoutingTable }[] = []
      
      // 1. Send vectors if table changed in previous step
      // For this sim, we assume everyone sends if they changed
      const senders = this.nodes.filter(n => {
        // Simple check: did my table change compared to previous step?
        // Actually, standard DV: send only if table changed.
        // For Step 1 (after break), x and y changed, so they send.
        if (loopCount === 1) return ['x', 'y'].includes(n)
        
        // Check if table changed in the LAST iteration
        const prevStep = steps[steps.length - 1]
        const beforeLast = steps[steps.length - 2]
        if (!beforeLast) return true // Should not happen given loop 1 logic

        const prevTable = prevStep.nodes[n].table
        const oldTable = beforeLast.nodes[n].table
        return JSON.stringify(prevTable) !== JSON.stringify(oldTable)
      })

      senders.forEach(senderId => {
        const sender = currentNodes[senderId]
        this.getNeighbors(senderId).forEach(neighborId => {
          let vectorToSend = { ...sender.table }
          
          // Poison Reverse Logic:
          // If I route to dest via neighbor, tell neighbor distance is Infinity
          if (this.poisonReverse) {
            // Re-calculate next hop to see if we should poison
            this.nodes.forEach(dest => {
               if (dest === senderId) return;
               const nextHop = this.getNextHop(senderId, dest, sender.neighborTables)
               if (nextHop === neighborId) {
                 vectorToSend[dest] = Infinity
               }
            })
          }

          messages.push({ from: senderId, to: neighborId, vector: vectorToSend })
          
          // Update neighbor's neighborTable
          nextNodes[neighborId].neighborTables[senderId] = vectorToSend
        })
      })

      if (messages.length === 0) {
        hasUpdates = false
        break
      }

      // 2. Recompute tables based on new neighbor info
      this.nodes.forEach(n => {
        this.recomputeTable(nextNodes[n])
      })

      steps.push({
        stepIndex: loopCount,
        description: `Round ${loopCount}: ${senders.join(',')} sent updates.`,
        nodes: JSON.parse(JSON.stringify(nextNodes)),
        messages
      })

      currentNodes = nextNodes
    }

    return steps
  }

  private updateLink(u: string, v: string, cost: number) {
    const link = this.links.find(l => (l.from === u && l.to === v) || (l.from === v && l.to === u))
    if (link) link.cost = cost
  }

  private getLinkCost(u: string, v: string): number {
    const link = this.links.find(l => (l.from === u && l.to === v) || (l.from === v && l.to === u))
    return link ? link.cost : Infinity
  }

  private getNeighbors(u: string): string[] {
    return this.links
      .filter(l => (l.from === u || l.to === u) && l.active)
      .map(l => l.from === u ? l.to : l.from)
  }

  private recomputeTable(node: NodeState) {
    this.nodes.forEach(dest => {
      if (dest === node.id) {
        node.table[dest] = 0
        return
      }

      let minCost = Infinity
      
      // Bellman-Ford: min( c(u,v) + Dv(dest) )
      this.getNeighbors(node.id).forEach(neighbor => {
        const costToNeighbor = this.getLinkCost(node.id, neighbor)
        const neighborDistToDest = node.neighborTables[neighbor] ? node.neighborTables[neighbor][dest] : Infinity
        
        // Handle infinity addition
        let total = costToNeighbor + neighborDistToDest
        if (total > 50 && total < Infinity) {
             // Let's cap it for readability in "Count to Infinity" scenario if needed, 
             // but let's keep real math first.
        }

        if (total < minCost) {
          minCost = total
        }
      })

      node.table[dest] = minCost
    })
  }

  private getNextHop(u: string, dest: string, neighborTables: Record<string, RoutingTable>): string | null {
      let minCost = Infinity
      let nextHop = null
      
      this.getNeighbors(u).forEach(neighbor => {
        const costToNeighbor = this.getLinkCost(u, neighbor)
        const neighborDistToDest = neighborTables[neighbor] ? neighborTables[neighbor][dest] : Infinity
        const total = costToNeighbor + neighborDistToDest
        if (total < minCost) {
            minCost = total
            nextHop = neighbor
        }
      })
      return nextHop
  }
}
