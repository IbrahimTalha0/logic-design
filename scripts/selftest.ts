import { minimalSOP, minimalPOS, parse, truthTable, sortedVars } from '../src/lib/boolean.ts';
import { simulate, gradeModule } from '../src/lib/verilog.ts';
import { intToBaseSteps, fracToBaseSteps, radixComplement, diminishedComplement, signedViews, toSignedBinary, binToGray } from '../src/lib/numbers.ts';

let fails = 0;
const eq = (name: string, got: unknown, want: unknown) => {
  if (typeof got === 'string' && typeof want === 'string' && name.startsWith('Ex')) {
    const norm = (x: string) => x.includes('(') ? x.match(/\([^)]*\)/g)!.sort().join('') : x.split(' + ').sort().join(' + ');
    got = norm(got); want = norm(want);
  }
  const ok = JSON.stringify(got) === JSON.stringify(want);
  if (!ok) fails++;
  console.log(ok ? 'OK  ' : 'FAIL', name, ok ? '' : `got=${JSON.stringify(got)} want=${JSON.stringify(want)}`);
};
// Kitap örnekleri
eq('Ex3.1', minimalSOP(['x','y','z'], [2,3,4,5]).expr, "x'y + xy'");
eq('Ex3.2', minimalSOP(['x','y','z'], [3,4,6,7]).expr, "xz' + yz");
eq('Ex3.5', minimalSOP(['w','x','y','z'], [0,1,2,4,5,6,8,9,12,13,14]).expr, "y' + w'z' + xz'");
eq('Ex3.7 SOP', minimalSOP(['A','B','C','D'], [0,1,2,5,8,9,10]).expr, "B'D' + B'C' + A'C'D");
eq('Ex3.7 POS', minimalPOS(['A','B','C','D'], [0,1,2,5,8,9,10]).expr, "(A' + B')(C' + D')(B' + D)");
eq('Ex3.8 dc', minimalSOP(['w','x','y','z'], [1,3,7,11,15], [0,2,5]).expr, "yz + w'x'");
eq('parse', truthTable(parse("A'B + C"), ['A','B','C']), [0,1,1,1,0,1,0,1]);
eq('vars', sortedVars(parse("z + xy'")), ['x','y','z']);
eq('41->bin', intToBaseSteps(41, 2).result, '101001');
eq('153->oct', intToBaseSteps(153, 8).result, '231');
eq('.6875->bin', fracToBaseSteps('6875', 2).result, '1011');
eq('10s comp 012398', radixComplement('012398', 10), '987602');
eq('9s comp 546700', diminishedComplement('546700', 10), '453299');
eq('2s comp 1101100', radixComplement('1101100', 2), '0010100');
eq('signed 11111001', signedViews('11111001').twosComplement, -7);
eq('to -9 sm', toSignedBinary(-9, 8, 'sm'), '10001001');
eq('to -9 1s', toSignedBinary(-9, 8, 'ones'), '11110110');
eq('to -9 2s', toSignedBinary(-9, 8, 'twos'), '11110111');
eq('gray 0111', binToGray('0111'), '0100');

const ex31 = `// Verilog model of circuit of Figure 3.35. IEEE 1364-1995 Syntax
module Simple_Circuit (A, B, C, D, E);
 output D, E;
 input A, B, C;
 wire w1;
 and G1 (w1, A, B); // Optional gate instance name
 not G2 (E, C);
 or  G3 (D, w1, E);
endmodule`;
const r1 = simulate(ex31);
eq('ex3.1 diags', r1.diags, []);
eq('ex3.1 D', r1.result && r1.result.mode === 'truth' ? r1.result.rows.map(r => r.out.join('')) : null, ['11','00','11','00','11','00','11','10']);

const ex33 = `module Simple_Circuit_prop_delay (A, B, C, D, E);
 output D, E;
 input A, B, C;
 wire w1;
 and #(30) G1 (w1, A, B);
 not #(10) G2 (E, C);
 or  #(20) G3 (D, w1, E);
endmodule
module t_Simple_Circuit_prop_delay;
 wire D, E;
 reg A, B, C;
 Simple_Circuit_prop_delay M1 (A, B, C, D, E); // Instance name required
 initial
  begin
   A = 1'b0; B = 1'b0; C = 1'b0;
   #100 A = 1'b1; B = 1'b1; C = 1'b1;
  end
 initial #200 $finish;
endmodule`;
const r3 = simulate(ex33);
eq('ex3.3 diags', r3.diags.filter(d=>d.level!=='info'), []);
if (r3.result && r3.result.mode === 'wave') {
  const ch = r3.result.changes.filter(c => c.name === 'D' || c.name === 'E').map(c => `${c.t}:${c.name}=${c.v}`);
  eq('ex3.3 changes', ch, ['10:E=1','30:D=1','110:E=0','130:D=0','150:D=1']);
  eq('ex3.3 end', r3.result.endTime, 200);
}
const bad = simulate(`module m(A,B,F); input A,B; output F; and (A, B, F); endmodule`);
eq('lint output-first', bad.diags.some(d => d.msg.includes('İLK terminal')), true);
const bad2 = simulate(`module m(A,B,F); input A,B; output F; AND g(F,A,B); endmodule`);
eq('lint case', bad2.diags.some(d => d.msg.includes('küçük harf')), true);
const bad3 = simulate(`module m(A,B,F); input A,B; output F
 and g(F,A,B); endmodule`);
eq('lint semicolon', bad3.diags[0]?.line, 1);
console.log(bad3.diags[0]?.msg);
const g = gradeModule(`module f(x,y,z,F); input x,y,z; output F; assign F = x & y | ~z; endmodule`, { module: 'f', inputs: ['x','y','z'], outputs: { F: e => (e.x & e.y) | (1 - e.z) } });
eq('grade assign', g.ok, true);
const g2 = gradeModule(`module f(input x, y, z, output F); wire a; nand(a, x, y); nand(F, a, z); endmodule`, { module: 'f', inputs: ['x','y','z'], outputs: { F: e => ((e.x & e.y) | (1 - e.z)) } });
eq('grade nand ansi (xy + z\')', g2.ok, true);
// HDL Example 3.4 (book operators && || !)
const ex34 = gradeModule(`module Circuit_Boolean_CA (E, F, A, B, C, D);
 output E, F;
 input A, B, C, D;
 assign E = A || (B && C) || ((!B) && D);
 assign F = ((!B) && C) || (B && (!C) && (!D));
endmodule`, { module: 'Circuit_Boolean_CA', inputs: ['A','B','C','D'], outputs: { E: e => e.A | (e.B & e.C) | ((1-e.B) & e.D), F: e => ((1-e.B) & e.C) | (e.B & (1-e.C) & (1-e.D)) } });
eq('HDL ex3.4', ex34.ok, true);
// HDL Example 3.5 UDP
const udpSrc = `primitive UDP_02467 (D, A, B, C);
 output D;
 input A, B, C;
 table
 // A B C : D
    0 0 0 : 1;
    0 0 1 : 0;
    0 1 0 : 1;
    0 1 1 : 0;
    1 0 0 : 1;
    1 0 1 : 0;
    1 1 0 : 1;
    1 1 1 : 1;
 endtable
endprimitive`;
const u1 = simulate(udpSrc);
eq('UDP diags', u1.diags, []);
if (u1.result?.mode === 'truth') eq('UDP table', u1.result.rows.map(r => r.out[0]), [1,0,1,0,1,0,1,1]);
const u2 = gradeModule(udpSrc + `
module Circuit_with_UDP_02467 (e, f, a, b, c, d);
 output e, f;
 input a, b, c, d;
 UDP_02467 (e, a, b, c);
 and (f, e, d);
endmodule`, { module: 'Circuit_with_UDP_02467', inputs: ['a','b','c','d'], outputs: { e: x => [1,0,1,0,1,0,1,1][x.a*4+x.b*2+x.c], f: x => [1,0,1,0,1,0,1,1][x.a*4+x.b*2+x.c] & x.d } });
eq('UDP instance', u2.ok, true);
if (!u2.ok) console.log(u2.messages, u2.sim.diags);
const u3 = simulate(`primitive p (A, D); input A; output D; table 0 : 1; 1 : 0; endtable endprimitive`);
eq('UDP output first', u3.diags.some(d => d.msg.includes('İLK')), true);
const u4 = simulate(`primitive p (D, A); output D; input A; table 0 : 1; 1 : 0; endprimitive`);
eq('UDP endtable', u4.diags.some(d => d.msg.includes('endtable')), true);
const u5 = simulate(`primitive p (D, A, B); output D; input A, B; table 0 ? : 1; 1 0 : 0; 1 1 : 1; endtable endprimitive`);
if (u5.result?.mode === 'truth') eq('UDP ?', u5.result.rows.map(r => r.out[0]), [1,1,0,1]);
const u6 = simulate(`module m(F, A); output F; input A; sub (F, A); endmodule module sub(Y, X); output Y; input X; not(Y, X); endmodule`);
eq('module instance name still required', u6.diags.some(d => d.msg.includes('instance name')), true);
console.log(fails ? `${fails} FAIL` : 'ALL PASS');
