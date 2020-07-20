# bftojs

A Brainf\*ck to JavaScript transpiler, made in JavaScript - output is made to work with NodeJS.

It also supports TrivialBrainf\*ckSubstitution (TBS) languages in general, having a small internal lookup for popular ones like [Ook!](https://esolangs.org/wiki/Ook!) and [Alphuck](https://esolangs.org/wiki/Alphuck) (and of course, Brainf\*ck itself).

The output is minified, and with code that doesn't take in user input simply runs the normally generated JavaScript, gets the output of it and simply makes the finalised output `console.log` that.

It takes in code / input in the terminal, with command line arguments to choose what TBS language. There are future plans to allow a file as input instead, but currently is not implemented.