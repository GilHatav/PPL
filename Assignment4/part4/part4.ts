
//Question 1.a: 

export function f(x: number): Promise<number> {
        return new Promise<number>((resolve, reject)=>{
            x !== 0 ?  resolve(1/x):
            reject("divisor cannot be 0");
        }
    ).catch((err)=>err)
}

/*f(5)
  .then((result) => console.log('result: ', result))
  .catch((error) => console.log('error: ', error));

  f(0)
  .then((result) => console.log('result: ', result))
  .catch((error) => console.log('error: ', error)); */

  export function g(x: number): Promise<number> {
        return new Promise<number>((resolve, reject)=>{
        resolve(x*x);
        }
    )
} 

 /*g(5)
.then((result) => console.log('result: ', result))
  .catch((error) => console.log('error: ', error));

  g(0)
  .then((result) => console.log('result: ', result))
  .catch((error) => console.log('error: ', error)); */

  export function h(x:number): Promise<number> { 

   return g(x).then(f).catch((err)=>err)
    
  }

  /*h(0)
  .then((result) => console.log('result: ', result))
  .catch((error) => console.log('error: ', error));

  h(1)
  .then((result) => console.log('result: ', result))
  .catch((error) => console.log('error: ', error));

  h(2)
  .then((result) => console.log('result: ', result))
  .catch((error) => console.log('error: ', error)); */



//Question 2: 

export function slower<T1 ,T2>(arr : [Promise<T1> , Promise<T2>]) : Promise<[number ,T1|T2]> { 
    
    return new Promise<[number ,T1|T2]>((resolve, reject)=>{
    
       let firstAndSecodn: boolean = false;
       let secondAndFirst: boolean = false;
       let res1: T1 ; 
       let res2: T2 ; 
        arr[0].then((result1)=> {firstAndSecodn = true
                            secondAndFirst = false;
                            res1 =result1
        }).catch((err)=>err)

        arr[1].then((result2)=> {secondAndFirst = true
            firstAndSecodn = false;
            res2 = result2
        }).catch((err)=>err)
      
        Promise.all(arr).then(()=>{
            if(firstAndSecodn){
                return resolve([0, res1])
             }
     
             else if(secondAndFirst){
                return resolve([1, res2])
             } 
           
        }).catch(()=> {return reject("error")})
      
                                 
    }).catch((err)=>{return (err)})

}
/*
const promise1 = new Promise(function(resolve, reject){ 
    setTimeout(resolve ,100, 'one');
});

const promise2 = new Promise(function(resolve, reject){ 
    setTimeout(resolve ,500, 'two');
});

slower([promise1, promise2]).then(function(value){
    console.log(value);
})
.catch((error)=> console.log('error' , error)) */

    
