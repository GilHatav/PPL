import { any, range } from "ramda";

 export function* biased(generator1:Generator, generator2:Generator)
{
    let g1_val1 = generator1.next();
    let g1_val2 = generator1.next();
    let g2 = generator2.next();
    while(!g1_val1.done || !g1_val2.done || !g2.done)
    {
       if(g1_val1.done && g1_val2.done && !g2.done)
        {
            yield(g2.value)
            g2=generator2.next();
        }
        else if (g1_val1.done)
        {
            if(g2.done)
            {
                yield(g1_val2.value)
                g1_val2 = generator1.next()
            }
            else 
            {
                yield(g1_val2.value)
                yield(g2.value)
                g2=generator2.next();
                g1_val2 = generator1.next()
            }
        }
        else if(g1_val2.done)
        {
            if(g2.done)
            {
                yield(g1_val1.value)
                g1_val1 = generator1.next();
            }
            else{
                yield(g1_val1.value)
                yield(g2.value)
                g1_val1 = generator1.next();
                g2=generator2.next();
            }
        }
        else if(g2.done)
        {
            yield(g1_val1.value)
            yield(g1_val2.value)
            g1_val1=generator1.next();
            g1_val2=generator1.next();
        }
        else
        {
            yield(g1_val1.value)
            yield(g1_val2).value
            yield(g2.value)
             g1_val1 = generator1.next();
            g1_val2 = generator1.next();
             g2 = generator2.next();
        }

    }
}  

export function* braid(generator1:Generator, generator2:Generator)
{
    let g1 = generator1.next();
    let g2 = generator2.next();
    while(!g1.done || !g2.done)
    {
    // if(g1.done && g2.done)
    // {
    //     return;
    // }
    // else
     if(g1.done)
    {
        yield(g2.value);
        g2=generator2.next();
    }
    else if(g2.done)
    {
        yield(g1.value);
        g1=generator1.next();
    }
    else 
    {
            yield(g1.value);
            yield(g2.value);
            g1=generator1.next();
            g2=generator2.next();
    }
    }
}
