// import { Result, makeOk, mapResult, makeFailure, isOk, isOkT } from "../shared/result";
// import { Parsed, isLetrecExp, isSetExp, isLitExp, isPrimOp , AppExp , isProgram, isDefineExp, isProcExp, isAppExp, isIfExp, isLetExp, isVarRef, isStrExp, isBoolExp, isNumExp, isExp, isCExp, DefineExp, makeNumExp, Exp ,CExp , isAtomicExp, AtomicExp, isCompoundExp, CompoundExp, makeVarRef, makeAppExp, makePrimOp } from "./L4-ast";
// import { Graph, makeNodeDecl, makeGraph, makeNodeRef, Edge, makeEdge, makeDir, makeAtomicGraph, makeCompoundGraph, isAtomicGraph, isCompoundGraph, CompoundGraph , GraphContent ,Node, AtomicGraph } from "./mermaid-ast";
// import { makeVarDecl } from "../L3/L3-ast";
// //import { makeVarGen } from "../L3/substitute";
// import { bind, map } from "ramda";
// import { cons } from "../shared/list";


import { Result, makeOk, makeFailure, bind, isOk, mapResult,safe2,safe3, isFailure} from "../shared/result";
import {  Exp, isExp, Parsed, isVarRef, isDefineExp, isProgram,isAppExp,makeAppExp, makePrimOp, isIfExp, isProcExp, isLetExp, isLitExp, DefineExp , isNumExp,isAtomicExp, AtomicExp,makeVarDecl, isBoolExp, isStrExp, isPrimOp, makeNumExp, isCompoundExp, CompoundExp, isLetrecExp, isSetExp, AppExp, IfExp, ProcExp, Program, LetrecExp, LitExp, LetExp, SetExp, CExp, isCExp, makeBoolExp, makeIfExp, Binding, makeBinding, makeLetExp, VarRef, makeLitExp, makeProgram, parseL4, parseL4Exp, parseL4Program} from "./L4-ast"
import { Graph, makeNodeDecl, makeGraph, makeNodeRef, Edge, makeEdge, makeDir, makeAtomicGraph, makeCompoundGraph, isAtomicGraph, isCompoundGraph, CompoundGraph , GraphContent ,Node, AtomicGraph, isNodeDecl, NodeDecl, isNodeRef } from "./mermaid-ast";
import { map, reduce, is, equals, isEmpty, zip } from "ramda";
import { makeVarRef, makeDefineExp, isVarDecl, VarDecl } from "../L3/L3-ast";
import { cons } from "../shared/list";
import { makeCompoundSExp, CompoundSExp,isCompoundSExp, SExpValue, isSymbolSExp , isClosure , isEmptySExp, makeEmptySExp    } from "./L4-value";
import { Sexp } from "s-expression";
import { parse as p, isSexpString, isToken } from "../shared/parser";
import { equal } from "assert";
import { Test } from "mocha";




export const makeVarGen = (v: string) : () => string => {
  let count: number = 0;
  return () => {
      count++;
      return `${v}_${count}`;
  };
};

const makeVarGenAppExp : () => string = makeVarGen("AppExp")
const makeVarGenRandsExp : () => string =  makeVarGen("Rands") 
const makeVarGenDefineExp : () => string = makeVarGen("DefineExp")
const makeVarGenVarDecl : () => string = makeVarGen("VarDecl")
const makeVarGenPrimOp : () =>  string = makeVarGen("PrimOp")
const makeVarGenStringExp : () => string = makeVarGen("StrExp")
const makeVarGenstring : () => string = makeVarGen("string")
const makeVarGenNumExp : () =>string = makeVarGen ("NumExp")
const makeVarGenNumber : () =>string = makeVarGen ("number")
const makeVarGenBoolExp : () => string =makeVarGen("BoolExp")
const makeVarGenboolean : () => string =makeVarGen("boolean")
const makeVarGenIfExp : () => string = makeVarGen("IfExp")
const makeVarGenProcExp: () => string = makeVarGen("ProcExp")
const makeVarGenBind: () => string = makeVarGen("Binding")
const makeVarGenLet: ()=> string = makeVarGen("LetExp")
const makeVarGenVarRef: () => string = makeVarGen("VarRef")
const makeVarGenLetrec: () => string = makeVarGen("LetrecExp")
const makeVarGenSetExp: () => string = makeVarGen("Set")
const makeVarGenEmptySExp: () =>string = makeVarGen("EmptySExp")
const makeVarGenSymbolSExp : () => string = makeVarGen("SymbolSExp")
const makeVarGenCompoundSExp : () => string = makeVarGen("CompuondSExp")
const makeVarGenExps : () => string = makeVarGen("Exps")
const makeVarGenProgram : () => string = makeVarGen("Program")
const makeVarGenLitExp: () => string = makeVarGen("LitExp") 
const makeVarGenParams: () =>string = makeVarGen("Params")
const makeVarGenBody: ()=> string = makeVarGen("Body")
const makeVarGenBindings: ()=> string = makeVarGen("Bindings")


export const mapL4toMermaid = (exp: Parsed): Result<Graph> =>
isExp(exp) ? bind(handleExp(exp),(g:GraphContent)=>(makeOk(makeGraph(makeDir("TD"),g)))): 
isProgram(exp) ?bind(handleProgram(exp.exps),(g:GraphContent)=>(makeOk(makeGraph(makeDir("TD"),g)))) : makeFailure("")



export const handleProgram = (exps : Exp[]) : Result<GraphContent> => 
{


  const idExps : string = makeVarGenExps();
  const programBodyArr :Result<CompoundGraph[]> =  mapResult( (x)=>{
    return programbodyhelper(x, idExps);},exps);
  const programBody: Result<CompoundGraph> = bind(programBodyArr , (x1:CompoundGraph[]) =>
  makeOk(
    makeCompoundGraph(

      x1.reduce( (acc,curr)=>
      ( acc.concat(curr.edges)
        
        ) ,Array<Edge>() )
     )
   )
  ); 


  const e : Edge = makeEdge(makeNodeDecl(makeVarGenProgram(),"Program"), makeNodeDecl(idExps,":"),"exps");
  return bind((programBody),
    (g: CompoundGraph) => (
      makeOk(
        makeCompoundGraph(
          [e].concat(g.edges)
      )
    )
  )
  )
}

export const programbodyhelper=(exp: Exp,idDots:string) : Result<CompoundGraph> =>
isDefineExp(exp) ? handleDefineForProgBody(exp,makeVarGenDefineExp(),idDots)
:
isAtomicExp(exp)? bind(handleAtomicExp(exp) ,(ag:AtomicGraph) =>(makeOk(makeCompoundGraph([(makeEdge(makeNodeRef(idDots),ag.root,""))]))))
 :handleSingleDotsSubCompound(idDots,exp,"")


export const handleDefineForProgBody= (exp:DefineExp , name:string, idDots:string) : Result<CompoundGraph> => 
bind(handleDefineExp(exp,makeNodeRef(name)), (g:CompoundGraph)=>makeOk(
  makeCompoundGraph(([makeEdge(makeNodeRef(idDots), makeNodeDecl(name,"DefineExp") ,"")].concat(
    g.edges
  )))
  )
) 

  export const handleExp = (exp: Exp) : Result<GraphContent> => 
  isDefineExp(exp) ? handleDefineExp(exp,makeNodeDecl(makeVarGenDefineExp(),"DefineExp")) : 
  isCExp(exp) ? handleCExp(exp) : makeFailure("")



export const handleDefineExp = (exp : DefineExp,node:Node) : Result<CompoundGraph> => 
{
    const idDefine:string = node.id;
    const graph: Result<CompoundGraph> = isAtomicExp(exp.val)? 
    bind(
      handleAtomicExp(exp.val) , (ag:AtomicGraph) => (
        makeOk(
          makeCompoundGraph(
            [makeEdge(makeNodeRef(idDefine),ag.root,"val")]
          )
        )
      )
    )
    
    : handleSingleDotsSubCompound(idDefine,exp.val,"val");
    

   
 return isOk(graph) ? 
    makeOk(
      makeCompoundGraph(
       [            makeEdge( node, makeNodeDecl(makeVarGenVarDecl(), "VarDecl(" + exp.var.var+ ")") , "var")
         ]
     .concat( 
       graph.value.edges
     )

         ))

         : makeFailure("");
       
}



export const handleCExp = (exp : CExp) : Result<GraphContent> =>
 isAtomicExp(exp) ? handleAtomicExp(exp) : isCompoundExp(exp)? handleCompoundExp(exp) : makeFailure(" ")
 
export const handleCompoundExp = (exp: CompoundExp ) : Result<GraphContent> => 
 isAppExp(exp) ?handleAppExp(exp.rator,exp.rands,makeNodeDecl(makeVarGenAppExp(),"AppExp")) :
isIfExp(exp) ?  handleIfExp(exp.test,exp.then,exp.alt,makeNodeDecl(makeVarGenIfExp(),"IfExp")):
isProcExp(exp) ?  handleProcExp(exp.args,exp.body,makeNodeDecl(makeVarGenProcExp(),"ProcExp")) : 
isLetExp(exp) ?  handleLetExp(exp.bindings,exp.body,makeNodeDecl(makeVarGenLet(),"LetExp")) : 
isLitExp(exp) ?  handleLitExp(exp,makeNodeDecl(makeVarGenLitExp(),"LitExp")) :
isLetrecExp(exp) ? handleLetrecExp(exp.bindings,exp.body,makeNodeDecl(makeVarGenLetrec(),"LetrecExp")): 
isSetExp(exp) ? handleSetExp(exp.var,exp.val,makeNodeDecl(makeVarGenSetExp(),"SetExp")):
makeFailure("")


//SExpValue = number | boolean | string | PrimOp | Closure | SymbolSExp | EmptySExp | CompoundSExp


export const handleLitExp = (exp:LitExp, node:Node) : Result<GraphContent> => 
typeof(exp.val) === 'string'  ? makeOk(makeCompoundGraph([makeEdge(node,makeNodeDecl(makeVarGenstring(),"string(" + exp.val +")"),"val")])):
typeof(exp.val) === 'boolean' ? makeOk(makeCompoundGraph([makeEdge(node,makeNodeDecl(makeVarGenboolean(),"boolean(" + exp? "#t" : "#f" +")"),"val")])) :
typeof(exp.val) === 'number' ? makeOk(makeCompoundGraph([makeEdge(node,makeNodeDecl(makeVarGenNumber(),"number(" + exp.val +")"),"val")])) :
isSymbolSExp(exp.val) ? makeOk( makeCompoundGraph([makeEdge(node, makeNodeDecl(makeVarGenSymbolSExp(),"SymbolSExp(" + exp.val +")")  , "val"  )])) :
isEmptySExp(exp.val) ? makeOk(
    makeCompoundGraph(
      [
        makeEdge(node,makeNodeDecl(makeVarGenEmptySExp(), "EmptySExp") , "val" )
      ]
    )):
isPrimOp(exp.val) ? makeOk(makeCompoundGraph([makeEdge(node,makeNodeDecl(makeVarGenPrimOp(),"PrimOp(" + exp.val.op +")"),"val")])):
isCompoundSExp(exp.val) ? 
callHandleCompSLit(node,exp.val): 
makeFailure("")



export const handleCompoundInLit = ( node:Node,exp:CompoundSExp ) : Result<CompoundGraph> => 
safe2(
  (vg1:CompoundGraph , vg2:CompoundGraph) => 
  {
      return makeOk(
      makeCompoundGraph(
      vg1.edges 
  
      .concat(vg2.edges))
    );
        }
  
  )(handleSExp(node,exp.val1,"val1"),handleSExp(makeNodeRef(node.id),exp.val2,"val2"))

  export const callHandleCompSLit = (node:Node,exp:CompoundSExp):Result<CompoundGraph> =>
  {
    const idRoot: string = makeVarGenCompoundSExp(); 
    return bind(
      handleCompoundInLit(makeNodeRef(idRoot),exp), 
      (g:CompoundGraph)=> (makeOk(makeCompoundGraph([makeEdge(node,(makeNodeDecl(idRoot,"CompoundSExp")),"val")].concat(g.edges))) )
    );
    
  }

  export const callHandleCompS = (id:string  , exp:CompoundSExp , node:Node,edgelabal:string) : Result<CompoundGraph> => 

    bind(
      handleCompoundInLit(makeNodeRef(id),exp),
       (g:CompoundGraph)=>(
      makeOk(
        makeCompoundGraph(
          [makeEdge(node,makeNodeDecl(id,"CompoundExp"),edgelabal)].concat(g.edges)
        )
      )
    ))
  

//node = root , edgelabal= labal when connect to father , exp= new exp to handle
export const handleSExp = (node:Node,exp : SExpValue,edgelabal:string) : Result<CompoundGraph> => 
isCompoundSExp(exp) ? 
 callHandleCompS(makeVarGenCompoundSExp(),exp,node,edgelabal)
: 
isEmptySExp(exp) ? makeOk(makeCompoundGraph([makeEdge(node,(makeNodeDecl(makeVarGenEmptySExp(), "EmptySExp")),edgelabal)])):
isSymbolSExp(exp) ?makeOk( 
 makeCompoundGraph(
   [makeEdge(
   node,  makeNodeDecl(makeVarGenSymbolSExp(),"SymbolSExp(" + exp.val +")") ,edgelabal
   )]
    
  )
) :
typeof(exp) === 'number' ? makeOk(makeCompoundGraph([makeEdge(node,makeNodeDecl(makeVarGenNumber(),"number(" + exp +")"),edgelabal)]))
: typeof(exp) === 'boolean'? makeOk(makeCompoundGraph([makeEdge(node,makeNodeDecl(makeVarGenboolean(),"boolean(" + exp ? "#t" : "#f" + ")"),edgelabal)]))
: typeof(exp) === 'string' ? makeOk(makeCompoundGraph(([makeEdge(node,makeNodeDecl(makeVarGenstring(),"string(" + exp + ")"),edgelabal)])))
: isPrimOp(exp) ? makeOk(makeCompoundGraph([makeEdge(node,(makeNodeDecl(makeVarGenPrimOp(),"PrimOp(" + exp.op + ")")),edgelabal)]))
: makeFailure("")







export const handleSetExp = (_var: VarRef , val: CExp ,node:Node) : Result<CompoundGraph> =>
bind(handleCExp(val),
  (g:GraphContent)=>(
    makeOk(
      makeCompoundGraph(
       [ makeEdge(node, makeNodeDecl(makeVarGenVarRef(),"VarRef(" + _var.var + ")") , "var")].concat(
         isAtomicGraph(g) ? [makeEdge(makeNodeRef(node.id),g.root,"val")] : (

          [makeEdge(makeNodeRef(node.id),g.edges[0].from,"val")].concat(g.edges)
         )
       )
      )
    )
  ) 
  )


  const handleProcExp = (args: VarDecl[] ,body: CExp[], nodeProcExp:Node) : Result<CompoundGraph> =>
{
  const idDots1 :string = makeVarGenBody();
  const idDots2 :string = makeVarGenParams();

  const e1 : Edge = makeEdge(makeNodeRef(nodeProcExp.id), makeNodeDecl(idDots1,":"),"body");
  const e2 : Edge =  makeEdge(nodeProcExp, makeNodeDecl(idDots2,":"),"args");  

  const bodyGraph :Result<CompoundGraph[]> =  mapResult( (x)=>( isAtomicExp(x)? bind(handleAtomicExp(x), (ag:AtomicGraph)=>(makeOk(makeCompoundGraph([makeEdge(makeNodeRef(idDots1),ag.root,"")]))))  : handleSingleDotsSubCompound(idDots1,x,"")),body);  
  const bodydotsGraph: Result<CompoundGraph> = bind(bodyGraph , (x:CompoundGraph[]) =>
  makeOk(
    makeCompoundGraph(

     x.reduce( (acc,curr)=>
     ( acc.concat(curr.edges)
       
       ) ,Array<Edge>() )
    )
  )); 


   const argsGraph :Result<GraphContent[]> =  mapResult( (y)=>(makeOk(makeAtomicGraph(makeNodeDecl(makeVarGenVarDecl(), "VarDecl(" +y.var+
   ")"  )))),args);

   const argsdotsGraph: Result<CompoundGraph> = bind(argsGraph , (y1:GraphContent[]) =>
   makeOk(ArrHelper(y1,idDots2))); 

return safe2(
  (g1: GraphContent , g2: GraphContent) => (
    makeOk(
      makeCompoundGraph(
        [e2].concat(isAtomicGraph(g2)? [] :g2.edges ).concat([e1])
        .concat( 
          isAtomicGraph(g1)? [] :g1.edges
        )
    )
  )
)
)(bodydotsGraph,argsdotsGraph);

}

const handleBindWithAtomicExp = (idDots :string ,exp: AtomicExp,vardecl: VarDecl) : Result<CompoundGraph> => 
{
  const g:Result<AtomicGraph> = handleAtomicExp(exp); 
  const bindingsEdge: string = makeVarGenBind();
const e: Edge = makeEdge(makeNodeRef(idDots),makeNodeDecl(bindingsEdge,"Binding"),"");
return  bind(g , (g1 : AtomicGraph)=>(makeOk(
  makeCompoundGraph(
   ([e,   makeEdge(makeNodeRef(bindingsEdge),makeNodeDecl(makeVarGenVarDecl(), "VarDecl(" +vardecl.var+
    ")" ) , "var" )]).concat(

      [makeEdge(makeNodeRef(bindingsEdge), g1.root , "val")]
      )
    )
  )
))

}


const handleSingleDotsSubBinding = (idDots:string, exp:CExp,vardecl:VarDecl) : Result<CompoundGraph> => 
{
 
  const idExp:string = 
  isAppExp(exp) ?makeVarGenAppExp():
  isIfExp(exp) ?  makeVarGenIfExp():
  isProcExp(exp) ?  makeVarGenProcExp() : 
  isLetExp(exp) ? makeVarGenLet() : 
  isLitExp(exp) ?  makeVarGenLitExp() :
  isLetrecExp(exp) ?makeVarGenLetrec(): 
  isSetExp(exp) ? makeVarGenSetExp():
  "";


const g : Result<GraphContent> = isAppExp(exp) ?handleAppExp(exp.rator,exp.rands,makeNodeRef(idExp)) :
isIfExp(exp) ?  handleIfExp(exp.test,exp.then,exp.alt,makeNodeRef(idExp)):
isProcExp(exp) ?  handleProcExp(exp.args,exp.body,makeNodeRef(idExp)) : 
isLetExp(exp) ?  handleLetExp(exp.bindings,exp.body,makeNodeRef(idExp)) : 
isLitExp(exp) ?  handleLitExp(exp,makeNodeRef(idExp)) :
isLetrecExp(exp) ? handleLetrecExp(exp.bindings,exp.body,makeNodeRef(idExp)): 
isSetExp(exp) ? handleSetExp(exp.var,exp.val,makeNodeRef(idExp)):
makeFailure("");

const bindingsEdge: string = makeVarGenBind();
const e: Edge = makeEdge(makeNodeRef(idDots),makeNodeDecl(bindingsEdge,"Binding"),"");
return  bind(g , (g1 : GraphContent)=>(makeOk(
  makeCompoundGraph(
   ([e,   makeEdge(makeNodeRef(bindingsEdge),makeNodeDecl(makeVarGenVarDecl(), "VarDecl(" +vardecl.var+
    ")" ) , "var" )]).concat(

      [makeEdge(makeNodeRef(bindingsEdge),isAtomicGraph(g1) ? g1.root : makeNodeDecl(idExp,exp.tag ),"val")].concat(
        isCompoundGraph(g1) ? g1.edges : []
      )
    )
  )
)))


};


export const handleLetrecExp = (bindings: Binding[] ,body: CExp[],nodeLetrecExp : Node ) : Result<CompoundGraph> => 
{
  const idDotsbody :string = makeVarGenBody();
    const idDotsbind :string = makeVarGenBindings(); //":"
    const idBind_ :string = makeVarGenBindings(); //"Bindings"
    //const idLetrecExp : string = makeVarGenLetrec();
  
  
    const e1 : Edge = makeEdge(makeNodeRef(nodeLetrecExp.id), makeNodeDecl(idDotsbody,":"),"body"); //edge To body-dots
    const e2: Edge = makeEdge(nodeLetrecExp,makeNodeDecl(idDotsbind,":"),"bindings");
    //const e2 : Edge =  makeEdge(makeNodeRef(idBind_), makeNodeDecl(idDotsbind,"Binding"),"");  //edge To args-dots
  
    const bodyGraph :Result<CompoundGraph[]> =  mapResult( (x)=>( isAtomicExp(x)? bind(handleAtomicExp(x), (ag:AtomicGraph)=>(makeOk(makeCompoundGraph([makeEdge(makeNodeRef(idDotsbody),ag.root,"")]))))  : handleSingleDotsSubCompound(idDotsbody,x,"")),body); 
    const bodydotsGraph: Result<CompoundGraph> = bind(bodyGraph , (x:CompoundGraph[]) =>
    makeOk(
      makeCompoundGraph(
       x.reduce( (acc,curr)=>
       ( acc.concat(curr.edges)
         
         ) ,Array<Edge>() )
      )
    )); 

    
      
    const bindingGraph :Result<CompoundGraph[]> =  mapResult( (x)=>( 
      isAtomicExp(x.val) ? handleBindWithAtomicExp(idDotsbind,x.val,x.var):
     handleSingleDotsSubBinding(idDotsbind,x.val,x.var))
      ,bindings);  
    const binddotsGraph: Result<CompoundGraph> = bind(bindingGraph , (x:CompoundGraph[]) =>
    makeOk(
      makeCompoundGraph(
  
       x.reduce( (acc,curr)=>
       ( acc.concat(curr.edges)
         
         ) ,Array<Edge>() )
      )
    )); 

    
    return safe2(
      (g1: GraphContent , g2: GraphContent) => (
        makeOk(
          makeCompoundGraph(
            [e2].concat(isAtomicGraph(g2)? [] :g2.edges ).concat([e1])
            .concat( 
              isAtomicGraph(g1)? [] :g1.edges
            )
        )
      )
    )
    )(bodydotsGraph,binddotsGraph);
          
          }
 

export const handleIfExp = (test:CExp,then:CExp,alt:CExp, nodedecl:Node) : Result<CompoundGraph> =>
{
  
  return safe3(
    (testg:GraphContent , theng : GraphContent , altg : GraphContent) => 
    (
      makeOk(
        makeCompoundGraph(
        (isAtomicGraph(testg) ? [makeEdge(nodedecl,testg.root,"test")] : testg.edges).concat(
        (isAtomicGraph(theng) ? [makeEdge(makeNodeRef(nodedecl.id),theng.root,"then")] : theng.edges).concat(
          isAtomicGraph(altg) ? [makeEdge(makeNodeRef(nodedecl.id),altg.root,"alt")] : altg.edges)
        )
      )
      )
    )
 // )(isAtomicExp(test)? handleAtomicExp(test) :handleSingleDotsSubCompoundWithNodeDecl(nodedecl.id,"IfExp",test,"test"),isAtomicExp(then) ? handleAtomicExp(then):  handleSingleDotsSubCompound(nodedecl.id,then,"then"),isAtomicExp(alt)? handleAtomicExp(alt): handleSingleDotsSubCompound(nodedecl.id,alt,"alt"));
 )(isAtomicExp(test)? handleAtomicExp(test) :isNodeRef(nodedecl) ? handleSingleDotsSubCompound(nodedecl.id,test,"test") : handleForTest(nodedecl,test),isAtomicExp(then) ? handleAtomicExp(then):  handleSingleDotsSubCompound(nodedecl.id,then,"then"),isAtomicExp(alt)? handleAtomicExp(alt): handleSingleDotsSubCompound(nodedecl.id,alt,"alt"));

} 

export const handleForTest=(node:NodeDecl, exp:CompoundExp) : Result<CompoundGraph> =>
{
  
 
  const idExp:string = isAppExp(exp) ?makeVarGenAppExp():
  isIfExp(exp) ?  makeVarGenIfExp():
  isProcExp(exp) ?  makeVarGenProcExp() : 
  isLetExp(exp) ? makeVarGenLet() : 
  isLitExp(exp) ?  makeVarGenLitExp() :
  isLetrecExp(exp) ?makeVarGenLetrec(): 
  isSetExp(exp) ? makeVarGenSetExp():
  "";



const g : Result<GraphContent> = isAppExp(exp) ?handleAppExp(exp.rator,exp.rands,makeNodeRef(idExp)) :
isIfExp(exp) ?  handleIfExp(exp.test,exp.then,exp.alt,makeNodeRef(idExp)):
isProcExp(exp) ?  handleProcExp(exp.args,exp.body,makeNodeRef(idExp)) : 
isLetExp(exp) ?  handleLetExp(exp.bindings,exp.body,makeNodeRef(idExp)) : 
isLitExp(exp) ?  handleLitExp(exp,makeNodeRef(idExp)) :
isLetrecExp(exp) ? handleLetrecExp(exp.bindings,exp.body,makeNodeRef(idExp)): 
isSetExp(exp) ? handleSetExp(exp.var,exp.val,makeNodeRef(idExp)):
makeFailure("");


return bind(g , (g1 : GraphContent)=>(makeOk(
  makeCompoundGraph(
    [makeEdge(node,isAtomicGraph(g1) ? g1.root : makeNodeDecl(idExp,exp.tag ),"test")].concat(
      isCompoundGraph(g1) ? g1.edges : []
    )
  )
)));

}


export const handleAtomicExp = (exp: AtomicExp) : Result<AtomicGraph> => 
 isNumExp(exp) ? makeOk(makeAtomicGraph(makeNodeDecl(makeVarGenNumExp(),"NumExp(" + exp.val +")")))
: isBoolExp(exp) ? makeOk(makeAtomicGraph(makeNodeDecl(makeVarGenBoolExp(),"BoolExp(" +( exp.val ? "#t" : "#f" ) + ")")))
: isStrExp(exp) ? makeOk(makeAtomicGraph(makeNodeDecl(makeVarGenStringExp(),"StrExp(" + exp.val + ")")))
: isPrimOp(exp) ? makeOk(makeAtomicGraph(makeNodeDecl(makeVarGenPrimOp(),"PrimOp(" + exp.op + ")")))
: isVarRef(exp) ? !equals(exp.var,"")? makeOk(makeAtomicGraph(makeNodeDecl(makeVarGenVarRef(),"VarRef(" + exp.var + ")"))): makeFailure("")
: makeFailure("")


const handleSingleDotsSubCompound = (idDots:string, exp:CExp , edgelabal : string) : Result<CompoundGraph> => 
{
  const idExp:string = isAppExp(exp) ?makeVarGenAppExp():
  isIfExp(exp) ?  makeVarGenIfExp():
  isProcExp(exp) ?  makeVarGenProcExp() : 
  isLetExp(exp) ? makeVarGenLet() : 
  isLitExp(exp) ?  makeVarGenLitExp() :
  isLetrecExp(exp) ?makeVarGenLetrec(): 
  isSetExp(exp) ? makeVarGenSetExp():
  "";



const g : Result<GraphContent> = isAppExp(exp) ?handleAppExp(exp.rator,exp.rands,makeNodeRef(idExp)) :
isIfExp(exp) ?  handleIfExp(exp.test,exp.then,exp.alt,makeNodeRef(idExp)):
isProcExp(exp) ?  handleProcExp(exp.args,exp.body,makeNodeRef(idExp)) : 
isLetExp(exp) ?  handleLetExp(exp.bindings,exp.body,makeNodeRef(idExp)) : 
isLitExp(exp) ?  handleLitExp(exp,makeNodeRef(idExp)) :
isLetrecExp(exp) ? handleLetrecExp(exp.bindings,exp.body,makeNodeRef(idExp)): 
isSetExp(exp) ? handleSetExp(exp.var,exp.val,makeNodeRef(idExp)):
makeFailure("");


return bind(g , (g1 : GraphContent)=>(makeOk(
  makeCompoundGraph(
    [makeEdge(makeNodeRef(idDots),isAtomicGraph(g1) ? g1.root : makeNodeDecl(idExp,exp.tag ),edgelabal)].concat(
      isCompoundGraph(g1) ? g1.edges : []
    )
  )
)));

};



const handleAppExp = (rator: CExp, rands: CExp[], appExpNode:Node): Result<CompoundGraph> =>
{
  const idDots :string = makeVarGenRandsExp();

 //const ratorGraph : Result<GraphContent> = handleCExp(rator);
    
 const ratorGraph : Result<GraphContent> = isAtomicExp(rator) ? handleAtomicExp(rator) : handleSingleDotsSubCompound(appExpNode.id,rator,"rator");
     const randsGraph :Result<CompoundGraph[]> =  mapResult( (x)=>( isAtomicExp(x)? bind(handleAtomicExp(x), (ag:AtomicGraph)=>(makeOk(makeCompoundGraph([makeEdge(makeNodeRef(idDots),ag.root,"")]))))  :  handleSingleDotsSubCompound(idDots,x,"")),rands);
  
     const dotsGraph: Result<CompoundGraph> = bind(randsGraph , (x:CompoundGraph[]) =>
     makeOk(
       makeCompoundGraph(

        x.reduce( (acc,curr)=>
        ( acc.concat(curr.edges)
          
          ) ,Array<Edge>() )
       )
     )); 
    
    //const appNode = makeNodeDecl(AppExpID,"AppExp"); 
    const dotsNode : Node = makeNodeDecl(idDots,":");
   // makeEdge(appExpNode,dotsNode,"rands");
  
    return safe2( (gc:GraphContent, gc2 : CompoundGraph)=>
    
    makeOk(makeCompoundGraph(
      isAtomicGraph(gc) ?
      [makeEdge(appExpNode,gc.root,"rator")].concat([makeEdge(makeNodeRef(appExpNode.id),dotsNode,"rands")].concat(gc2.edges)) : ( gc.edges).concat([makeEdge(makeNodeRef(appExpNode.id),dotsNode,"rands")].concat(gc2.edges)) )
    
    )
    
    )(ratorGraph,dotsGraph)
    
    }



const ArrHelper = (arr : GraphContent[], idDots: string) : CompoundGraph  => 
{
  
  //let edges1 : Edge[] = [];
   return makeCompoundGraph(

    arr.reduce( (acc,curr)=>
    ( 
      isAtomicGraph(curr) ? acc.concat([makeEdge(makeNodeRef(idDots),curr.root,"")] ):
      acc.concat([makeEdge(makeNodeRef(idDots),curr.edges[0].from,"")].concat(curr.edges))
     ) ,Array<Edge>() )
   );
}



export const handleBindExp = (exp : Binding,idBind: string) : Result<CompoundGraph> => 
  bind( 
    handleCExp(exp.val) , (g:GraphContent)=>(
      makeOk( makeCompoundGraph([makeEdge(makeNodeDecl(idBind, "Binding"), makeNodeDecl(makeVarGenVarDecl(), "VarDecl(" +exp.var.var+
      ")" ) , "val" ), ].concat(isAtomicGraph(g) ? [makeEdge(makeNodeRef(idBind),g.root,"var")] : [makeEdge(makeNodeRef(idBind),g.edges[0].from,"var")].concat(g.edges))
      
      )
      
      )
    )
  )
  


  export const handleLetExp = (bindings: Binding[] ,body: CExp[],nodeLetExp : Node ) : Result<CompoundGraph> => 
  {
    const idDotsbody :string = makeVarGenBody();
    const idDotsbind :string = makeVarGenBindings(); //":"
    const idBind_ :string = makeVarGenBindings(); //"Bindings"
    //const idLetrecExp : string = makeVarGenLetrec();
  
  
    const e1 : Edge = makeEdge(makeNodeRef(nodeLetExp.id), makeNodeDecl(idDotsbody,":"),"body"); //edge To body-dots
    const e2: Edge = makeEdge(nodeLetExp,makeNodeDecl(idDotsbind,":"),"bindings");
    //const e2 : Edge =  makeEdge(makeNodeRef(idBind_), makeNodeDecl(idDotsbind,"Binding"),"");  //edge To args-dots
  
    const bodyGraph :Result<CompoundGraph[]> =  mapResult( (x)=>( isAtomicExp(x)? bind(handleAtomicExp(x), (ag:AtomicGraph)=>(makeOk(makeCompoundGraph([makeEdge(makeNodeRef(idDotsbody),ag.root,"")]))))  : handleSingleDotsSubCompound(idDotsbody,x,"")),body); 
    const bodydotsGraph: Result<CompoundGraph> = bind(bodyGraph , (x:CompoundGraph[]) =>
    makeOk(
      makeCompoundGraph(
       x.reduce( (acc,curr)=>
       ( acc.concat(curr.edges)
         
         ) ,Array<Edge>() )
      )
    )); 

    
      
    const bindingGraph :Result<CompoundGraph[]> =  mapResult( (x)=>( 
      isAtomicExp(x.val) ? handleBindWithAtomicExp(idDotsbind,x.val,x.var):
     handleSingleDotsSubBinding(idDotsbind,x.val,x.var))
      ,bindings);  
    const binddotsGraph: Result<CompoundGraph> = bind(bindingGraph , (x:CompoundGraph[]) =>
    makeOk(
      makeCompoundGraph(
  
       x.reduce( (acc,curr)=>
       ( acc.concat(curr.edges)
         
         ) ,Array<Edge>() )
      )
    )); 

    
    return safe2(
      (g1: GraphContent , g2: GraphContent) => (
        makeOk(
          makeCompoundGraph(
            [e2].concat(isAtomicGraph(g2)? [] :g2.edges ).concat([e1])
            .concat( 
              isAtomicGraph(g1)? [] :g1.edges
            )
        )
      )
    )
    )(bodydotsGraph,binddotsGraph);
            }



export const unparseMermaid = (exp: Graph): Result<string> => 
makeOk("graph " + exp.dir.dir +"\r\n\t"+unparseMermaidString(exp)) 

export const unparseMermaidString = (exp: Graph): string =>
   isAtomicGraph(exp.content) ? unparseAtomicGraph(exp.content) : 
   isCompoundGraph(exp.content) ? unparseCompoundGraph(exp.content) : 
   ""

export const unparseAtomicGraph = (exp : AtomicGraph): string => 
 exp.root.id+ `["${exp.root.label}"]`
 //"["+ exp.root.label+"]"

export const unparseCompoundGraph = (exp:CompoundGraph) : string=> 
  exp.edges.slice(0,exp.edges.length-1)
  .reduce((acc,curr) => acc.concat(unpareSingelEdge(curr).concat("\r\n\t"))  , "" ).concat(unpareSingelEdge(exp.edges[exp.edges.length-1]))


export const unpareSingelEdge = (e : Edge): string => 
unparseNode(e.from) + " -->" + createEdgeString(e.label) + unparseNode(e.to) 

 export const unparseNode = (node : Node) : string => 
 isNodeDecl(node) ? (node.id +  createNodeDeclString(node.label) ) : node.id 
 

 const createEdgeString = (s: string) => equals(s,"") ? " " : "|" +s + "| "
  const createNodeDeclString = (s : string) => equals(s,":")||equals(s,"Program")||equals(s,"IfExp")||equals(s,"ProcExp")||equals(s,"AppExp")||equals(s,"LetrecExp")||equals(s,"Binding")||equals(s,"bindings")||equals(s,"LetExp")||equals(s,"DefineExp")||equals(s,"SetExp")? ( `[${s}]`) :`["${s}"]`

 //
 
 export const parseL4Mermaid = (x: string): Result<Parsed> =>
 equals(x,"") ? makeFailure(""):
 x.startsWith("(L4") ?  bind(p(x), parseL4Program) :bind(p(x), parseL4Exp)

 


 export const L4toMermaid = (concrete: string): Result<string> =>
 bind (parseL4Mermaid(concrete) , (p:Parsed)=> ( bind(  mapL4toMermaid(p),(g:Graph)=>unparseMermaid(g) )   ) )
