import { VerilogExercises, VerilogPlayground } from '../interactives/VerilogLab';

export default function VerilogPage() {
  return (
    <div className="page">
      <h1>Verilog Laboratuvarı</h1>
      <p className="muted">
        Konu anlatımı için <a href="#/ders/3-7">Ders 3.7</a>'ye bak. Burada serbestçe kod yazabilir, kitap örneklerini çalıştırabilir ve kod sorularıyla antrenman yapabilirsin.
        Simülatör sınav kapsamındaki Verilog alt kümesini destekler: module, input/output/wire/reg, kapı primitive'leri ve gecikmeleri, assign, modül örnekleme, test bench (initial, #, $finish).
      </p>
      <VerilogExercises />
      <VerilogPlayground initial={1} height={20} />
    </div>
  );
}
