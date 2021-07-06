

//mermaid - AST: 

//types:
export type Node = NodeRef | NodeDecl
export type GraphContent = AtomicGraph | CompoundGraph   

//interfaces: 
export interface Graph {tag: "Graph" ; dir: Dir ;  content: GraphContent }
export interface Dir {tag: "Dir" ; dir: string }
export interface AtomicGraph {tag: "AtomicGraph" ; root: NodeDecl} 
export interface CompoundGraph {tag: "CompoundGraph" ; edges: Edge[] }
export interface Edge {tag: "Edge"; from: Node ; to: Node; label: string} 
export interface NodeDecl {tag: "NodeDecl" ; id: string ; label: string } 
export interface NodeRef {tag: "NodeRef" ; id: string } 
export interface EdgeLabel {tag: "EdgeLabel" ; id: string } 


//constructor:
export const makeGraph = (dir : Dir  , content: GraphContent): Graph => ({tag:"Graph" , dir: dir , content: content })
export const makeDir = (dir : string):Dir => ({tag: "Dir" , dir : dir})
export const makeAtomicGraph = (node : NodeDecl): AtomicGraph => ({tag: "AtomicGraph" , root : node})
export const makeCompoundGraph = (edges : Edge[]): CompoundGraph => ({tag: "CompoundGraph" , edges: edges})
export const makeEdge = (from: Node , to: Node , label: string) : Edge =>({tag:"Edge" , from: from , to: to , label: label})
export const makeNodeDecl = (id: string , label: string) : NodeDecl => ({tag:"NodeDecl" , id: id , label: label})
export const makeNodeRef = (id: string ):NodeRef => ({tag:"NodeRef" , id: id})
export const makeEdgeLabel = (id: string ):EdgeLabel => ({tag:"EdgeLabel" , id: id})


//Type predicates for disjoint types:
export const isGraph =  (x: any) : x is Graph => x.tag === "Graph"
export const isDir =  (x: any) : x is Dir => x.tag === "Dir"
export const isAtomicGraph =  (x: any) : x is AtomicGraph => x.tag === "AtomicGraph"
export const isCompoundGraph =  (x: any) : x is CompoundGraph => x.tag === "CompoundGraph"
export const isEdge=  (x: any) : x is Edge => x.tag === "Edge"
export const isNodeDecl=  (x: any) : x is NodeDecl => x.tag === "NodeDecl"
export const isNodeRef=  (x: any) : x is NodeRef => x.tag === "NodeRef"
export const isEdgeLabel=  (x: any) : x is EdgeLabel => x.tag === "EdgeLabel"


// Type predicates for type unions
export const isNode = (x: any) => isNodeDecl(x) || isNodeRef(x);
export const isGraphContent = (x: any) => isAtomicGraph(x) || isCompoundGraph(x);










