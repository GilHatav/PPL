/* Question 1 */

interface Some<T> {
    tag: "Some";
    value: T;
}
interface None {
    tag: "None";
}

export type Optional<T>  = None | Some<T>;

export const makeSome = <T>(value: T): Some<T> => ({ tag: "Some", value: value});
export const makeNone = (): None => ({ tag: "None"});

export const isSome = <T>(x: any): x is Some<T> => x.tag === "Some";
export const isNone = (x: any): x is None => x.tag === "None";

/* Question 2 */
export const bind = <T, U>(optional: Optional<T>, f: (x: T) => Optional<U>): Optional<U> => {
    if(isSome(optional)){
    const newOptional = f(optional.value);
    if(isSome(newOptional))
        return newOptional;
    else 
        return makeNone();
    } 
    else
        return makeNone();   
}
    



