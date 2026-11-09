import { Tabs } from '../components/ui';
import { KMap, KMapPractice } from '../interactives/KMap';
import { BaseConverter, BcdAdder, CodeExplorer, ComplementLab, SignedLab, TwosAdder } from '../interactives/NumberLabs';
import { EquivalenceChecker, GatePlayground, ParityLab, TimingDiagram, TruthTableLab } from '../interactives/LogicLabs';
import { TwoLevelCircuit } from '../interactives/Circuits';
import { AdderLab, AnalysisLab, CodeConverterLab } from '../interactives/Ch4Labs';

export default function Tools() {
  return (
    <div className="page">
      <h1>🧰 Tüm Simülatörler</h1>
      <p className="muted">Kendi sorularını kontrol etmek için bu araçları kullan. Ödev ve kitap problemlerinin cevaplarını burada doğrulayabilirsin.</p>
      <Tabs
        tabs={[
          { label: 'K-map', content: <><KMap n={4} /><KMapPractice /></> },
          { label: 'Doğruluk tablosu', content: <><TruthTableLab /><EquivalenceChecker /></> },
          { label: 'Devreler', content: <><TwoLevelCircuit /><GatePlayground /><TimingDiagram /></> },
          { label: 'Sayılar', content: <><BaseConverter /><ComplementLab /></> },
          { label: 'İşaretli', content: <><SignedLab /><TwosAdder /></> },
          { label: 'Kodlar', content: <><CodeExplorer /><BcdAdder /><ParityLab /></> },
          { label: 'Bölüm 4', content: <><AnalysisLab /><CodeConverterLab /><AdderLab /></> },
        ]}
      />
    </div>
  );
}
