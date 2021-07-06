import { Exp, Program, isProgram, isBoolExp, isNumExp, isVarRef, isPrimOp, isDefineExp, isProcExp, isIfExp, isAppExp, makeAppExp, makePrimOp, makeNumExp, makeIfExp, makeVarRef, makeProcExp, makeVarDecl, makeDefineExp, makeProgram, parseL2, isVarDecl} from '../imp/L2-ast';
import { Result, bind, mapResult, makeOk, makeFailure, safe3, safe2 } from '../imp/result';
import { isForExp, makeForExp } from './L21-ast';
import { map, isEmpty, equals, is } from 'ramda';
import { rest } from '../imp/list';
import { CExp } from '../imp/L3-ast';
import { for2app } from './q3';


//Purpose: Transform L2 program to JavaScript program.
//Signatures: l2ToJS(L2AST). 
//Type: [Exp|Program -> Result<string>].

export const l2ToJS = (exp: Exp | Program): Result<string> => 
    isProgram(exp) ? bind(mapResult(l2ToJS, exp.exps), (exps: string[]) => makeOk(`${exps.slice(0,exps.length-1).join(";\n")};\nconsole.log(${exps[exps.length-1]});`)) : 
    isBoolExp(exp) ? makeOk(exp.val ? "true" : "false") : 
    isNumExp(exp) ? makeOk(exp.val.toString()) : 
    isVarRef(exp) ? makeOk(exp.var) :
   // isVarDecl(exp) ? makeOk(exp.var):
    isPrimOp(exp) ? equals(exp.op,'=') ? makeOk('==='): equals(exp.op,"not")? makeOk('!'):equals(exp.op,"and")?makeOk("&&"):equals(exp.op,"or")?makeOk("||") :equals(exp.op,"eq?")? makeOk("==="): makeOk(exp.op) : 
    isDefineExp(exp) ? bind(l2ToJS(exp.val), (val: string) => makeOk(`const ${exp.var.var} = ${val}`)) : 

    isProcExp(exp) ? exp.body.length>1 ? bind(mapResult(l2ToJS, exp.body), (body: string[]) => makeOk(`((${map(v => v.var, exp.args).join(",")}) => {${body.slice(0,body.length-1).join("; ")}; return ${body[body.length-1]};})`)) : 
    bind(mapResult(l2ToJS, exp.body), (body: string[]) => makeOk(`((${map(v => v.var, exp.args).join(",")}) => ${body.join(" ")})`)):


    isIfExp(exp) ? safe3((test: string, then: string, alt: string) => makeOk(`(${test} ? ${then} : ${alt})`))
                    (l2ToJS(exp.test), l2ToJS(exp.then), l2ToJS(exp.alt)) :

    isAppExp(exp) ? isProcExp(exp.rator) ? safe2((rator: string, rands: string[]) => makeOk(`${rator}(${rands})`)) 
                                                            (l2ToJS(exp.rator), mapResult(l2ToJS, exp.rands)) : 

                                                            exp.rands.length===1 && isVarRef(exp.rands[0]) ? safe2((rator: string, rands: string[]) => makeOk(`(${rator}${rands})`)) 
                                                            (l2ToJS(exp.rator), mapResult(l2ToJS, exp.rands)) : 

                                                            isVarRef(exp.rator) ? safe2((rator: string, rands: string[]) => makeOk(`${rator}(${rands})`)) 
                                                            (l2ToJS(exp.rator), mapResult(l2ToJS, exp.rands)) : 

                                                            isPrimOp(exp.rator)&&(equals(exp.rator.op,"number?"))?
                                                            safe2((rator: string, rands: string[]) => makeOk(`(typeof ${rands} === 'number')`)) 
                                                            (l2ToJS(exp.rator), mapResult(l2ToJS, exp.rands)) :
                                                            isPrimOp(exp.rator)&&(equals(exp.rator.op,"boolean?"))?
                                                            safe2((rator: string, rands: string[]) => makeOk(`(typeof ${rands} === 'boolean')`)) 
                                                            (l2ToJS(exp.rator), mapResult(l2ToJS, exp.rands)) :

                                                            exp.rands.length>2 && isPrimOp(exp.rator) && (equals(exp.rator.op,"<")||equals(exp.rator.op,">")) ?

                                                            safe2((rator: string, rands: string[]) => makeOk(AppExpWithMultiOperands(rator,rands,0))) 
                                                            (l2ToJS(exp.rator), mapResult(l2ToJS, exp.rands)) :

                                                            safe2((rator: string, rands: string[]) => makeOk(`(${rands.join(" "+rator+" ")})`)) 
                                                            (l2ToJS(exp.rator), mapResult(l2ToJS, exp.rands)) : 
    makeFailure(`Unknown expression: ${exp}`);


export const AppExpWithMultiOperands =(rator:string,rands:string[],index:number): string =>
rest(rands).length==2?
`(${rands[index]}${rator}${rands[index+1]})` :

`(${rands[index]}${rator}${rands[index+1]})&&`.concat(AppExpWithMultiOperands(rator,rest(rands),index+1));


const e = makeForExp(makeVarDecl("i"), makeNumExp(1),makeNumExp(1),makeForExp(makeVarDecl("j"), makeNumExp(2),makeNumExp(2),makeForExp(makeVarDecl("k"), makeNumExp(3),makeNumExp(3),makeAppExp(makePrimOp("+"),[makeVarRef("i"),makeVarRef("j"),makeVarRef("k")]))))
console.log(JSON.stringify(for2app(e),null,2));