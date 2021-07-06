// ========================================================
// L4 normal eval
import { Sexp } from "s-expression";
//import { map } from "ramda";
import { CExp, Exp, IfExp, VarDecl , ProcExp,  Program, parseL4Exp , LetExp , AppExp , makeAppExp , makeProcExp } from "./L4-ast";
import { isAppExp, isBoolExp, isCExp, isDefineExp, isIfExp, isLitExp, isNumExp,
         isPrimOp, isProcExp, isStrExp, isVarRef , isLetExp } from "./L4-ast";
import { applyEnv, makeExtEnv , makeEmptyEnv, Env } from './L4-env-normal';
//import { isTrueValue } from "./L4-eval";
import { applyPrimitive } from "./evalPrimitive";
import { isClosure, makeClosure, Value , Closure } from "./L4-value";
import { first, rest, isEmpty } from '../shared/list';
import { Result, makeOk, makeFailure, bind, mapResult } from "../shared/result";
import { parse as p } from "../shared/parser";
import {map} from 'ramda'

const evalExps = (exps: Exp[], env: Env): Result<Value> =>
isEmpty(exps) ? makeFailure("Empty program") :
isDefineExp(first(exps)) ? evalDefineExps(first(exps), rest(exps), env) :
evalCExps(first(exps), rest(exps), env);

const L4NormalEval = (exp: CExp, env: Env): Result<Value> =>
isNumExp(exp) ? makeOk(exp.val) :
isBoolExp(exp) ? makeOk(exp.val) :
isStrExp(exp) ? makeOk(exp.val) :
isPrimOp(exp) ? makeOk(exp) :
isVarRef(exp) ? bind(applyEnv(env, exp.var) , (ok: CExp ) => L4NormalEval(ok , env)):
isLitExp(exp) ? makeOk(exp.val) :
isIfExp(exp) ? evalIf(exp, env) :
isProcExp(exp) ? evalProc(exp, env) :
isLetExp(exp) ? evalLet(exp, env) :
isAppExp(exp) ? bind(L4NormalEval(exp.rator, env), proc => L4normalApplyProc(proc, exp.rands, env)) :
makeFailure("something went wrong");

const isTrueValue = (x: Value): boolean =>
    ! (x === false);

const evalIf  = (exp : IfExp , env : Env) : Result<Value> =>
bind(L4NormalEval(exp.test, env),
(test: Value) => isTrueValue(test) ? L4NormalEval(exp.then, env) : L4NormalEval(exp.alt, env));


const evalProc = (exp: ProcExp, env: Env): Result<Closure> =>
    makeOk(makeClosure(exp.args, exp.body, env));

    const L4normalApplyProc = (proc: Value, args: CExp[], env: Env): Result<Value> => {
        if (isPrimOp(proc)) {
            const argVals: Result<Value[]> = mapResult((arg) => L4NormalEval(arg, env), args);
            return bind(argVals, (args: Value[]) => applyPrimitive(proc, args));
        } else if (isClosure(proc)) {
            // Substitute non-evaluated args into the body of the closure
           const vars = map((v: VarDecl) => v.var, proc.params);
           return evalSequence(proc.body, makeExtEnv(vars, args, proc.env))  
        } else {
            return makeFailure(`Bad proc applied ${proc}`);
        }
    };


// Evaluate a sequence of expressions (in a program)
export const evalSequence = (seq: Exp[], env: Env): Result<Value> =>
isEmpty(seq) ? makeFailure("Empty sequence") :
isDefineExp(first(seq)) ? evalDefineExps(first(seq), rest(seq), env) :
evalCExps(first(seq), rest(seq), env);

const evalCExps = (first: Exp, rest: Exp[], env: Env): Result<Value> =>
isCExp(first) && isEmpty(rest) ? L4NormalEval(first, env) :
isCExp(first) ? bind(L4NormalEval(first, env), _ => evalSequence(rest, env)) :
makeFailure("eval CExp failed"); 


const evalDefineExps = (def: Exp, exps: Exp[], env: Env): Result<Value> =>
isDefineExp(def) ? evalSequence(exps , makeExtEnv([def.var.var] , [def.val] , env)):
makeFailure("define failed " + def); 


const evalLet  = (exp : LetExp , env : Env) : Result<Value> =>
bind(makeOk(rewriteLet(exp)) , (func : AppExp)=>L4NormalEval(func , env));
  

  const rewriteLet = (e: LetExp): AppExp => {
    const vars = map((b) => b.var, e.bindings);
    const vals = map((b) => b.val, e.bindings);
    return makeAppExp(
            makeProcExp(vars, e.body),
            vals);
}


export const evalNormalProgram = (program: Program): Result<Value> =>
    evalExps(program.exps, makeEmptyEnv());

export const evalNormalParse = (s: string): Result<Value> =>
    bind(p(s),
         (parsed: Sexp) => bind(parseL4Exp(parsed),
                                (exp: Exp) => evalExps([exp], makeEmptyEnv())));
