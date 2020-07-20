const { performance } = require('perf_hooks');

let dbg = true;
let dbgTimeStart, dbgTimeStart2, dbgTimeStart3;

let tbsLookup = {
  'brainfuck': ['>', '<', '+', '-', '.', ',', '[', ']'],
  'ook': ['Ook. Ook?', 'Ook? Ook.', 'Ook. Ook.', 'Ook! Ook!', 'Ook! Ook.', 'Ook. Ook!', 'Ook! Ook?', 'Ook? Ook!'],
  'alphuck': ['a', 'c', 'e', 'i', 'j', 'o', 'p', 's']
};

function bratoja(inp) {
  if (dbg) {
    dbgTimeStart = performance.now();
    console.log('input', inp);
  }

  let hasInput = inp.includes(',');
  let doCollapse = !hasInput;

  let out = (hasInput ? `let i=()=>{let l=b.length;let r=b.charCodeAt(l);b=b.substr(0,l-1);return b;};let b='';process.stdin.resume();process.stdin.setEncoding('ascii');process.stdin.on('data',(c)=>{b+=c;});` : '') +
  `let g=r=>{for(;r;)p++,r--},h=r=>{for(;r;)p--,r--},j=r=>{for(;r;)a[p]++,r--},k=r=>{for(;r;)a[p]--,r--},m=r=>{for(;r;)o(a[p]),r--},n=r=>{for(;r;)a[p]=i(),r--},` +
  (doCollapse ? `o=r=>{q+=String.fromCharCode(r)},q='',` : `o=r=>{process.stdout.write(String.fromCharCode(r))},`) +
  `a=Array(3e4).fill(0),p=0;`;

  let minFns = ['g', 'h', 'j', 'k', 'm', 'n'];

  for (let c of inp) {
    switch (c) {
      case '>':
        out += 'g(1);'; //'p++;';
        break;
      case '<':
        out += 'h(1);'; //'p--;';
        break;
      case '+':
        out += 'j(1);'; //'a[p]++;';
        break;
      case '-':
        out += 'k(1);'; // 'a[p]--;';
        break;
      case '.':
        out += 'm(1);'; //'o(a[p]);';
        break;
      case ',':
        out += 'n(1);'; // 'a[p] = i();';
        break;
      case '[':
        out += 'for(;a[p];){';
        break;
      case ']':
        out += '}';
        break;
    }
  }

  if (dbg) {
    console.log('main took', `${(performance.now() - dbgTimeStart).toFixed(2)}ms`);
    dbgTimeStart2 = performance.now();
  }

  for (let f of minFns) {
    let r = new RegExp(`${f}\\(([0-9]+)\\);${f}\\(([0-9]+)\\)`, 'g');

    while (r.test(out)) out = out.replace(r, (_, one, two) => {
      return `${f}(${parseInt(one) + parseInt(two)})`
    });
  }

  if (dbg) {
    console.log('function collapse took', `${(performance.now() - dbgTimeStart2).toFixed(2)}ms`);
    dbgTimeStart2 = performance.now();
  }

  if (doCollapse) {
    out += 'q';

    if (dbg) {
      console.log('output collapse - executing');
      dbgTimeStart3 = performance.now();
    }

    let evalOut = eval(out).replace(/\n/g, '\\n');
    if (dbg) console.log(evalOut);

    if (dbg) console.log('execution took', `${(performance.now() - dbgTimeStart3).toFixed(2)}ms`);
    out = `console.log('${evalOut}')`;

    if (dbg) console.log('output collapse took', `${(performance.now() - dbgTimeStart2).toFixed(2)}ms`);
  }

  if (dbg) {
    console.log('total took', `${(performance.now() - dbgTimeStart).toFixed(2)}ms`);

    console.log('char count', inp.length, '>', out.length, `(${(out.length / inp.length).toPrecision(3)}x increase)`);
  }

  return out;
}

function escReg(s) {
  return new RegExp([...s].map(x => `\\${x}`).join(''), 'g');
}

function tbstoja(inp, [a, b, c, d, e, f, g, h]) {
  inp = inp.replace(escReg(a), '>');
  inp = inp.replace(escReg(b), '<');
  inp = inp.replace(escReg(c), '+');
  inp = inp.replace(escReg(d), '-');
  inp = inp.replace(escReg(e), '.');
  inp = inp.replace(escReg(f), ',');
  inp = inp.replace(escReg(g), '[');
  inp = inp.replace(escReg(h), ']');

  return bratoja(inp);
}

function avaliableTBSLangs() {
  return Object.keys(tbsLookup).map(x => x[0].toUpperCase() + x.substr(1)).join(', ');
}

function helpMsg() {
  console.log(`Usage: tbstoja [options]
Transpiles Brainfuck and some other TrivialBrainfuckSubstitution (TBS) languages into JavaScript.
TBS languages avaliable: ${avaliableTBSLangs()}

Options:
  -l, --lang                    Which TBS language to use (defaults to Brainfuck)`);
}

const readline = require('readline');

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

let args = process.argv.slice(2);
if (args[0] === '-h' || args[0] === '-help' || args[0] === '--help') return helpMsg();

let lang = 'brainfuck';
for (let i = 0; i < args.length; i += 2) {
  if (args[i] === '-l' || args[i] === '--lang') lang = args[i + 1].toLowerCase();
}

if (!tbsLookup[lang]) {
  console.error(`TBS language ${lang} not found in dictionary, avaliable TBS languages:`);
  console.log(avaliableTBSLangs());
}

rl.question('', function(inp) {
  let done = tbstoja(inp, tbsLookup[lang]);
  console.log(done);
  console.log('Executing...\n');
  dbgTimeStart = performance.now();
  eval(done);
  console.log('\nExecuted - took', `${(performance.now() - dbgTimeStart).toFixed(2)}ms`);
  rl.close();
});

rl.on('close', function() {
    process.exit(0);
});