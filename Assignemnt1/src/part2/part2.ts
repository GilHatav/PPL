import { Func } from "mocha";
import { compose, map, sort, concat } from "ramda";
import fs from "fs";

/* Question 1 */
export const partition = <T>(predicate: (x:T)=>boolean , arr: T[]) => ([arr.filter(x=>predicate(x)),arr.filter(x=>!predicate(x))]);

/* Question 2 */
export const mapMat : <T,T2>(func :(x:T)=>T2 ,arr :T[][]) =>T2[][] = 
(func,arr) => 
(arr.map(x=>(x.map(y=>func(y)))));

const donothing = <T>(x:T) => (x);
 
/* Question 3 */
export const composeMany : <T>(funcArray : ((x:T)=>T)[]) => ((y:T)=>T) = (funcArray) => (funcArray.reduce( (acc,curr) => compose(acc,curr) , donothing ));

/* Question 4 */
interface Languages {
    english: string;
    japanese: string;
    chinese: string;
    french: string;
}

interface Stats {
    HP: number;
    Attack: number;
    Defense: number;
    "Sp. Attack": number;
    "Sp. Defense": number;
    Speed: number;
}

interface Pokemon {
    id: number;
    name: Languages;
    type: string[];
    base: Stats;
}

/* 4-1 */
//export const sortArray = (arr: Pokemon[]) => (arr.sort((a, b) => (a.base.Speed > b.base.Speed) ? 1 : -1))
//export const findmaxspeed = (sortedArray : Pokemon[]) => (sortedArray[sortedArray.length-1].base.Speed)
export const onlyspeeds:(arr: Pokemon[]) => Number[] = (arr) => arr.reduce((acc,curr) => acc.concat([curr.base.Speed]),Array<Number>()) ;
export const sortArray = (arr: Number[]) => (arr.sort((a, b) => (a> b) ? 1 : -1));
export const maxSpeed : (pokedex : Pokemon[]) => Pokemon[] = (pokedex) => 
{
    let speeds = onlyspeeds(pokedex);
    return (pokedex.filter(x=>(x.base.Speed==sortArray(speeds)[speeds.length-1])));
};

/*4-2*/
export const containGrassType: (arr:string[])=>(boolean)= (arr) => (arr.some(x=>x==='Grass')); 
export const grassTypes : (pokedex : Pokemon[])=>(string[]) = (pokedex) => (pokedex.filter(x=>containGrassType(x.type)===true).map(y=>y.name.english)).sort();


/*4-3*/
export const allTypesSorted : (pokedex: Array<Pokemon>)=>(Array<string>) = (pokedex) => (pokedex.reduce((acc,curr) => acc.concat(curr.type),Array<string>()).sort());
export const alreadyexist = (arr :Array<string> , value: string) => (arr.includes(value));
export const uniqueTypes: (pokedex:Array<Pokemon>)=>(Array<string>) = (pokedex)=>(allTypesSorted(pokedex).reduce((acc,curr)=>((!alreadyexist(acc,curr) ? acc.concat([curr]) : acc.concat([]))),Array<string>())); 









