import { makeIfExp, isDefineExp, ForExp, AppExp, Exp, Program, makeAppExp, makeProcExp, isForExp, isCExp, makeNumExp, CExp, isProgram, makeProgram, makeForExp, isAppExp, isIfExp, isProcExp, makeDefineExp  } from "./L21-ast";
import { Result, makeOk, safe3, safe2, mapResult, makeFailure, bind} from "../imp/result";
import {makeVarDecl, NumExp, VarDecl, makePrimOp, makeVarRef, isBoolExp, isNumExp, isPrimOp, isVarRef, isVarDecl, isExp} from "../imp/L2-ast";
import { equal } from "assert";
import { equals } from "ramda";
import { Certificate } from "crypto";


export const safe4 = <T1, T2, T3, T4,T5>(f: (x: T1, y: T2, z: T3 , w: T4) => Result<T5>): (xr: Result<T1>, yr: Result<T2>, zr: Result<T3>, wr:Result<T4>) => Result<T5> =>
(xr: Result<T1>, yr: Result<T2>, zr: Result<T3>, wr: Result<T4>) =>
    bind(xr, (x: T1) => bind(yr, (y: T2) => bind(zr, (z: T3) => bind(wr, (w:T4)=>f(x, y, z, w)))));

    export const safe1 = <T1, T2>(f: (x: T1) => Result<T2>): (xr: Result<T1>) => Result<T2> =>
    (xr: Result<T1>) =>
        bind(xr, (x: T1) =>  f(x));

//Purpose: Apply syntactic transformation form "ForExp" to "AppExp".
//Signatures: for2app(exp).
//Type: [ForExp->AppExp].

export const for2app = (exp: ForExp): AppExp =>
makeAppExp(makeProcExp(  []    , makeForBody( exp.var,exp.body ,  exp.start.val  ,exp.end.val, Array<CExp>() ) ),[]);

export const makeForBody=(vardec:VarDecl,body:CExp,start:number,endval:number,array:Array<CExp>) : Array<CExp> =>
! (start > endval) ? (makeForBody(vardec,body,start+1,endval,array.concat([makeAppExp(makeProcExp([vardec],[isForExp(body)? for2app(body) : body]), [makeNumExp(start)]  )])))
: array;

export const recuForBody = (cexp:CExp) :CExp => 

isForExp(cexp)? for2app(cexp) : cexp


//Purpose: By a given L21 AST L21toL2 returns L2 AST.
//Signatures: L21ToL2(L21AST)
//Type: [Exp | Program -> Result<Exp | Program>].
export const L21ToL2 = (exp: Exp | Program): Result<Exp | Program> =>
  isVarDecl(exp) ? makeOk(exp) : 
  isCExp(exp)? handleCExp(exp):
  isDefineExp(exp) ? safe2((var_: VarDecl, val: CExp) => makeOk(makeDefineExp(var_,val)))
  (makeOk(exp.var), handleCExp(exp.val)) : 
  isProgram(exp) ? 
  bind(  mapResult(handleProgram, exp.exps), exps => makeOk(makeProgram(exps))) : makeFailure("Unexpected expression" +exp);
  
   
export const handleProgram = (exp: Exp):Result<Exp> => 
isCExp(exp) ? handleCExp(exp):
isDefineExp(exp)? safe2((var_: VarDecl, val: CExp) => makeOk(makeDefineExp(var_,val)))
(makeOk(exp.var), handleCExp(exp.val)) : makeFailure("Unexpected expression " + exp); 


  export const handleCExp = (e: CExp) : Result<CExp> =>
  isBoolExp(e) ? makeOk(e): 
isNumExp(e) ? makeOk(e) :
  isPrimOp(e) ? makeOk(e) :
  isVarRef(e) ? makeOk(e) :
  isForExp(e) ? safe4((loopvar:VarDecl,svar:NumExp,evar:NumExp,body:CExp)=> (makeOk(for2app(makeForExp(loopvar,svar,evar,body)))))
                        (makeOk(e.var),makeOk(e.start),makeOk(e.end),handleCExp(e.body)) : 
  isIfExp(e) ? safe3((test: CExp, then: CExp, alt: CExp)=>(makeOk(makeIfExp(test,then,alt))))
                (handleCExp(e.test),handleCExp(e.then),handleCExp(e.alt)):
  isAppExp(e) ? safe2((rator: CExp, rands: CExp[]) => makeOk(makeAppExp(rator, rands)))
  (handleCExp(e.rator), mapResult(handleCExp, e.rands)) :
  isProcExp(e) ? safe2((args: VarDecl[], body: CExp[]) => makeOk(makeProcExp(args,body)))
  (makeOk(e.args), mapResult(handleCExp, e.body)) :
  makeFailure("Unexpected expression " + e);


  



