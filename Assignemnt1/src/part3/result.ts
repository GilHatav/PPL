/* Question 3 */

import { any, hasIn, compose } from "ramda";

export type Result<T> = Failure | OK<T>;

interface Failure{
    tag: 'Failure';
    message: string;
}

interface OK<T>{
    tag: 'Ok';
    value: T;
}

export const makeOk = <T>(value:T) : OK<T> => ({tag: "Ok" , value: value})
export const makeFailure = (message:string) : Failure => ({tag:'Failure' , message: message})

export const isOk = <T>(x:any) : x is OK<T> => x.tag === "Ok";
export const isFailure = (x:any) : x is Failure => x.tag === "Failure";

/* Question 4 */
export const bind = <T,U>(res:Result<T> , f:(x:T) =>Result<U>) : Result<U> => 
{
    if(isOk(res))
        {
            const newOkRes = f(res.value);
           if(isOk(newOkRes))
            return makeOk(newOkRes.value);
           else return makeFailure(newOkRes.message);
        }
    else
        {
           return res
        }
}


/* Question 5 */
interface User {
    name: string;
    email: string;
    handle: string;
}

const validateName = (user: User): Result<User> =>
    user.name.length === 0 ? makeFailure("Name cannot be empty") :
    user.name === "Bananas" ? makeFailure("Bananas is not a name") :
    makeOk(user);

const validateEmail = (user: User): Result<User> =>
    user.email.length === 0 ? makeFailure("Email cannot be empty") :
    user.email.endsWith("bananas.com") ? makeFailure("Domain bananas.com is not allowed") :
    makeOk(user);

const validateHandle = (user: User): Result<User> =>
    user.handle.length === 0 ? makeFailure("Handle cannot be empty") :
    user.handle.startsWith("@") ? makeFailure("This isn't Twitter") :
    makeOk(user);

//const changename = (user:User): Result<User> => 
  //  validateName({name: 'Bananas', email: user.email , handle: user.handle });

/*
    //test bind 
    const user1 = { name: "Ben", email: "bene@post.bgu.ac.il", handle: "bene" };
    const u2 = bind(makeOk(user1),validateName);
    console.log(u2);
    const u3 = bind(u2,changename);
    console.log(u3);
*/  

const user1 = { name: "Ben", email: "bene@post.bananas.com", handle: "bene" };
const user2 = { name: "Bananas", email: "me@bananas.com", handle: "bene" };


export const naiveValidateUser = (user:User):Result<User> => 
    isFailure(validateName(user)) ? validateName(user) :
    isFailure(validateEmail(user)) ? validateEmail(user) : 
    isFailure(validateHandle(user)) ? validateHandle(user) :
    makeOk(user);
    
//console.log(naiveValidateUser(user1));
//console.log(naiveValidateUser(user2));


export const monadicValidateUser = (user:User):Result<User> => bind(bind(validateName(user),validateEmail),validateHandle)

//console.log(monadicValidateUser(user2));