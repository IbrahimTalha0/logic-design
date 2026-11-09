import { Box, Def, En, Figure, Formula, KeyPoints, Reveal, Steps, Table } from '../components/ui';
import { AdderLab, AnalysisLab, CodeConverterLab, CombSeqGame } from '../interactives/Ch4Labs';
import { TruthTableLab } from '../interactives/LogicLabs';
import { VerilogPlayground } from '../interactives/VerilogLab';
import { mintermsOf } from '../lib/boolean';
import type { LessonDef } from '../data/types';

const A3 = ['A', 'B', 'C'];
const A4 = ['A', 'B', 'C', 'D'];

/** Şekil 4.1 — kombinasyonel devre blok diyagramı */
function BlockDiagram() {
  return (
    <Figure caption="Şekil 4.1 — Kombinasyonel devrenin blok diyagramı (block diagram of combinational circuit)">
      <svg viewBox="0 0 520 130" className="circuit-svg" style={{ maxWidth: 520 }} role="img" aria-label="n giriş, m çıkış">
        {[30, 50, 70, 90].map((y, i) => (
          <line key={i} x1={40} y1={y} x2={180} y2={y} stroke="var(--accent)" strokeWidth={2.5} />
        ))}
        {[40, 60, 80].map((y, i) => (
          <line key={i} x1={340} y1={y} x2={480} y2={y} stroke="var(--on)" strokeWidth={2.5} />
        ))}
        <rect x={180} y={15} width={160} height={90} rx={10} fill="var(--surface-2)" stroke="var(--ink)" strokeWidth={2} />
        <text x={260} y={56} textAnchor="middle" className="svg-label">Combinational</text>
        <text x={260} y={76} textAnchor="middle" className="svg-label">circuit</text>
        <text x={100} y={118} textAnchor="middle" className="svg-label">n inputs</text>
        <text x={420} y={118} textAnchor="middle" className="svg-label">m outputs</text>
        <text x={20} y={64} className="svg-label">…</text>
      </svg>
    </Figure>
  );
}

// =====================================================================
// 4.1 Kombinasyonel devreler
// =====================================================================
function L4_1() {
  return (
    <>
      <p>
        İlk üç bölümde parçaları topladık: sayıları ve kodları (Bölüm 1), Boole cebrini ve kapıları (Bölüm 2), sadeleştirmeyi ve Verilog'u (Bölüm 3). Bölüm 4'te bunları
        birleştirip <b>gerçek devreler</b> analiz edeceğiz ve tasarlayacağız.
      </p>

      <h2>İki tür lojik devre</h2>
      <Def
        term="Combinational circuit"
        en="A combinational circuit consists of logic gates whose outputs at any time are determined from only the present combination of inputs."
        tr="Kombinasyonel devre, çıkışları her an yalnızca girişlerin o anki kombinasyonuna bağlı olan lojik kapılardan oluşur."
      />
      <Def
        term="Sequential circuit"
        en="Sequential circuits employ storage elements in addition to logic gates. Their outputs are a function of the inputs and the state of the storage elements."
        tr="Ardışıl devreler, lojik kapılara ek olarak bellek (saklama) elemanları kullanır. Çıkışları hem girişlerin hem de bellek elemanlarının durumunun (state) fonksiyonudur."
      />
      <Box kind="analogy">
        <b>Kombinasyonel</b> = hesap makinesinin "×" işlemi: aynı iki sayıyı verirsen her zaman aynı sonucu alırsın; geçmişte ne yaptığın önemsizdir.
        <br />
        <b>Ardışıl</b> = asansör: "3" tuşuna basınca ne olacağı, asansörün <i>şu an hangi katta olduğuna</i> (geçmişine) bağlıdır. Bellek var.
      </Box>
      <p>
        Bellek elemanlarının durumu geçmiş girişlere bağlı olduğundan ardışıl devrenin çıkışı <b>geçmiş girişlere de</b> bağlıdır ve davranışı zaman içindeki giriş ve durum
        sırasıyla tanımlanır. Ardışıl devreler sonraki bölümlerin konusu; bu bölüm yalnızca kombinasyonel devrelerle ilgilenir.
      </p>

      <h2>Kombinasyonel devrenin yapısı</h2>
      <BlockDiagram />
      <ul>
        <li>
          <b>n giriş</b> dış bir kaynaktan gelir, <b>m çıkış</b> dış bir hedefe gider. Çoğu uygulamada kaynak ve hedef <En>register</En>'lardır.
        </li>
        <li>
          Register'lar kapılarla birlikte devreye dahil edilirse, <b>toplam devre ardışıl</b> sayılır (çünkü register bellek içerir).
        </li>
        <li>
          n giriş için <b>2ⁿ</b> giriş kombinasyonu vardır; her kombinasyon için her çıkışın tek bir değeri vardır → devre bir <b>doğruluk tablosu</b> ile tanımlanabilir.
        </li>
        <li>
          Ya da her çıkış için bir tane olmak üzere <b>m tane Boole fonksiyonu</b> ile tanımlanır; her fonksiyon n giriş değişkeni cinsinden yazılır.
        </li>
      </ul>
      <Box kind="info">
        Fiziksel olarak her sinyal aslında bir analog gerilimdir; biz onu 0 veya 1 olarak <b>yorumlarız</b>. Lojik simülatörler yalnızca 0 ve 1 gösterir.
      </Box>

      <h2>Bu bölümdeki üç görev</h2>
      <Table
        head={['Görev', 'İngilizce', 'Başlangıç → Sonuç']}
        rows={[
          ['Analiz', 'analysis', 'Verilen devre şeması → Boole fonksiyonları / doğruluk tablosu / ne yaptığı'],
          ['Tasarım (sentez)', 'design (synthesis)', 'Sözel tanım (spesifikasyon) → devre şeması'],
          ['HDL modeli', 'HDL model', 'Yaygın devrelerin Verilog tanımları'],
        ]}
      />

      <h2>Standart bileşenler</h2>
      <p>
        Dijital tasarımda çok sık kullanılan bazı kombinasyonel devreler hazır entegre devre olarak bulunur ve <b>standart bileşen</b> <En>standard components</En> olarak
        anılır: <En>adders</En> (toplayıcılar), <En>subtractors</En> (çıkarıcılar), <En>comparators</En> (karşılaştırıcılar), <En>decoders</En> (kod çözücüler),{' '}
        <En>encoders</En> (kodlayıcılar), <En>multiplexers</En> (çoğullayıcılar).
      </p>
      <ul>
        <li>
          Bunlar <b>MSI</b> (orta ölçekli entegrasyon) devreleri olarak satılır.
        </li>
        <li>
          Karmaşık <b>VLSI</b> devrelerde (ör. <b>ASIC</b>) <b>standart hücre</b> <En>standard cells</En> olarak da kullanılır ve VLSI içinde, çok entegreli MSI tasarımdaki
          gibi birbirine bağlanır.
        </li>
      </ul>
      <CombSeqGame />

      <KeyPoints
        items={[
          'Combinational: çıkış yalnızca ŞU ANKİ girişlere bağlı. Sequential: kapılar + bellek; çıkış geçmiş girişlere de bağlı.',
          'n giriş → 2ⁿ kombinasyon; devre bir doğruluk tablosu veya m tane Boole fonksiyonu ile tanımlanır.',
          'Register devreye dahil edilirse toplam devre ardışıl olur.',
          'Bölümün görevleri: analysis, design (synthesis), HDL modeling.',
          'Standart bileşenler: adder, subtractor, comparator, decoder, encoder, multiplexer — MSI; VLSI/ASIC içinde standard cell.',
        ]}
      />
    </>
  );
}
const q4_1: LessonDef['questions'] = [
  { id: '4-1-a', kind: 'mc', q: 'The outputs of a combinational circuit at any time are determined by:', tr: 'Kombinasyonel bir devrenin çıkışları herhangi bir anda neye bağlıdır?', options: ['only the present combination of inputs', 'the present inputs and the past inputs', 'the state of the storage elements only', 'the clock'], answer: 0 },
  { id: '4-1-b', kind: 'mc', q: 'What distinguishes a sequential circuit from a combinational circuit?', tr: 'Ardışıl devreyi kombinasyonel devreden ayıran nedir?', options: ['It employs storage elements in addition to logic gates.', 'It uses only NAND gates.', 'It has more outputs than inputs.', 'It cannot be described by Boolean functions.'], answer: 0 },
  { id: '4-1-c', kind: 'text', q: 'A combinational circuit has 5 input variables. How many possible input combinations are there?', tr: '5 girişli bir kombinasyonel devrede kaç farklı giriş kombinasyonu vardır?', answer: '32', norm: 'num', explain: '2⁵ = 32' },
  { id: '4-1-d', kind: 'mc', q: 'A combinational circuit with n inputs and m outputs can be described by:', tr: 'n girişli, m çıkışlı kombinasyonel devre neyle tanımlanabilir?', options: ['m Boolean functions, one for each output, each expressed in terms of the n input variables', 'n Boolean functions, one for each input', 'a single Boolean function of m variables', 'a state table only'], answer: 0 },
  { id: '4-1-e', kind: 'mc', q: 'If the source and destination registers are included with the combinational gates, the total circuit must be considered:', tr: 'Kaynak ve hedef register\'lar kapılarla birlikte dahil edilirse toplam devre nasıl kabul edilir?', options: ['a sequential circuit', 'a combinational circuit', 'an analog circuit', 'a degenerate circuit'], answer: 0 },
  { id: '4-1-f', kind: 'mc', q: 'Which of the following is NOT listed as a standard combinational component?', tr: 'Aşağıdakilerden hangisi standart kombinasyonel bileşen DEĞİLDİR?', options: ['flip-flop', 'multiplexer', 'decoder', 'comparator'], answer: 0, explain: 'Flip-flop bir bellek elemanıdır → ardışıl devrelerin parçasıdır.' },
  { id: '4-1-g', kind: 'mc', q: 'Standard combinational components are available in integrated circuits as:', tr: 'Standart kombinasyonel bileşenler entegre devre olarak hangi ölçekte bulunur?', options: ['medium-scale integration (MSI) circuits', 'small-scale integration (SSI) only', 'analog circuits', 'memory chips'], answer: 0 },
  { id: '4-1-h', kind: 'mc', q: 'The three tasks addressed in Chapter 4 are:', tr: 'Bölüm 4\'te ele alınan üç görev hangileridir?', options: ['analyze a given circuit, synthesize (design) a circuit for a given behavior, and write HDL models', 'build, test and sell circuits', 'minimize, encode and decode', 'add, subtract and compare'], answer: 0 },
];

// =====================================================================
// 4.2 Analiz prosedürü
// =====================================================================
function L4_2() {
  return (
    <>
      <p>
        <b>Analiz</b>, elinde bir devre şeması varken "bu devre ne yapıyor?" sorusunu cevaplamaktır. Sınavda sık çıkan tip: <i>"Analyze the circuit: find the Boolean
        functions and the truth table."</i>
      </p>
      <Def
        term="Analysis"
        en="The analysis of a combinational circuit requires that we determine the function that the circuit implements. This task starts with a given logic diagram and culminates with a set of Boolean functions, a truth table, or, possibly, an explanation of the circuit operation."
        tr="Kombinasyonel devrenin analizi, devrenin gerçeklediği fonksiyonu belirlemektir. Verilen bir lojik şemayla başlar; bir dizi Boole fonksiyonu, bir doğruluk tablosu veya devrenin nasıl çalıştığının açıklamasıyla biter."
      />
      <Box kind="tip">Devrenin adı veya ne yaptığı zaten verilmişse, analiz problemi o fonksiyonun <b>doğrulanmasına</b> (verification) indirgenir.</Box>

      <h2>Adım 0 — Gerçekten kombinasyonel mi?</h2>
      <p>
        İlk iş devrenin ardışıl olmadığından emin olmak: kombinasyonel devre şemasında <b>geri besleme yolu</b> veya <b>bellek elemanı</b> yoktur.
      </p>
      <Def
        term="Feedback path"
        en="A feedback path is a connection from the output of one gate to the input of a second gate whose output forms part of the input to the first gate."
        tr="Geri besleme yolu, bir kapının çıkışından ikinci bir kapının girişine giden ve o ikinci kapının çıkışı da birinci kapının girişinin bir parçası olan bağlantıdır (yani sinyal döngüye girer)."
      />
      <p className="muted small">Geri besleme yolları ardışıl devre tanımlar; özel yöntemlerle analiz edilir ve bu bölümde ele alınmaz.</p>

      <h2>Yöntem 1 — Boole fonksiyonlarını bulmak</h2>
      <Steps>
        <li>
          Yalnızca <b>giriş değişkenlerine</b> bağlı kapıların çıkışlarına (anlamlı) isimler ver; her birinin Boole fonksiyonunu yaz.
        </li>
        <li>
          Girişlere ve <b>daha önce isimlendirilmiş</b> kapılara bağlı kapılara yeni isimler ver; fonksiyonlarını bul.
        </li>
        <li>Çıkışlara ulaşana kadar 2. adımı tekrarla.</li>
        <li>
          Önceki tanımları tekrar tekrar <b>yerine koyarak</b> <En>repeated substitution</En> çıkış fonksiyonlarını yalnızca giriş değişkenleri cinsinden yaz.
        </li>
      </Steps>
      <AnalysisLab />
      <Reveal label="F1'in cebirsel türetilmesini adım adım göster">
        <Formula>
          F1 = T3 + T2 = F2'T1 + ABC = (AB + AC + BC)'(A + B + C) + ABC
        </Formula>
        <p className="small">DeMorgan ile (AB + AC + BC)' = (A' + B')(A' + C')(B' + C'):</p>
        <Formula>= (A' + B')(A' + C')(B' + C')(A + B + C) + ABC</Formula>
        <Formula>= (A' + B'C')(AB' + AC' + BC' + B'C) + ABC</Formula>
        <Formula>= A'BC' + A'B'C + AB'C' + ABC</Formula>
        <p className="small">
          Sonuç: F1 = Σ(1, 2, 4, 7) = A ⊕ B ⊕ C ve F2 = AB + AC + BC = Σ(3, 5, 6, 7). Bu iki fonksiyon <b>tam toplayıcının</b> (full adder) toplam ve elde çıkışlarıdır.
        </p>
      </Reveal>

      <h2>Yöntem 2 — Doğrudan doğruluk tablosu</h2>
      <p>Boole fonksiyonlarını türetmeden, şemadan doğrudan doğruluk tablosu da çıkarılabilir:</p>
      <Steps>
        <li>
          Giriş sayısını belirle. n giriş için 2ⁿ kombinasyonu, <b>0'dan 2ⁿ − 1'e</b> kadar ikili sayılar olarak tabloya yaz.
        </li>
        <li>Seçilen kapıların çıkışlarını isimlendir.</li>
        <li>Yalnızca girişlere bağlı kapıların çıkış sütunlarını doldur.</li>
        <li>Önceki sütunlara bağlı kapıların sütunlarını, tüm çıkışlar belirlenene kadar doldur.</li>
      </Steps>
      <Box kind="example">
        Tablo 4.1'de (laboratuvardaki tablo) F2 iki veya üç giriş 1 olduğunda 1'dir; F2' onun tümleyenidir; T1 = OR, T2 = AND; T3, T1 ve F2' ikisi de 1 iken 1; F1 ise T2 veya
        T3 1 iken 1. A, B, C, F1, F2 sütunları tam toplayıcının x, y, z, S, C tablosuyla aynıdır.
      </Box>

      <h2>Simülasyonla analiz?</h2>
      <p>
        Lojik simülasyon ile analiz <b>pratik değildir</b>, çünkü anlamlı çıkışlar için gereken giriş deseni sayısı çok büyük olabilir. Ama simülasyonun çok pratik bir
        kullanımı vardır: devrenin işlevinin <b>spesifikasyonla gerçekten uyuştuğunu doğrulamak</b> <En>verification</En>. Aşağıda Şekil 4.2'nin Verilog modeli var; tüm iç
        sinyalleri (T1, T2, T3, F2n) tabloda görebilirsin.
      </p>
      <VerilogPlayground initial={7} height={18} />

      <Box kind="exam" title="Analiz sorusu nasıl çözülür?">
        <ol>
          <li>Her kapının çıkışına isim yaz (T1, T2, … ) — kâğıt üzerinde şemanın üstüne.</li>
          <li>Önce girişe en yakın kapılar, sonra sırayla çıkışa doğru ilerle.</li>
          <li>Yerine koy, sadeleştir (Boole cebri veya K-map).</li>
          <li>Doğruluk tablosu istenirse ara sütunları da yaz — kısmi puan getirir.</li>
          <li>Tablo tanıdık bir şeye benziyorsa (toplayıcı, parite, çoğunluk…) adını söyle.</li>
        </ol>
      </Box>

      <KeyPoints
        items={[
          'Analiz: şema → Boole fonksiyonları / doğruluk tablosu / işlev açıklaması.',
          'Önce kombinasyonel olduğunu kontrol et: feedback path veya bellek elemanı yok.',
          'Kapı çıkışlarını etiketle (girişe yakın olanlardan başla), sonra yerine koy (repeated substitution).',
          'Doğruluk tablosu yöntemi: 2ⁿ satır, ara sütunlar, sonra çıkışlar.',
          'Şekil 4.2: F1 = A⊕B⊕C, F2 = AB + AC + BC → tam toplayıcı.',
          'Simülasyon analiz için pratik değil, doğrulama (verification) için çok faydalı.',
        ]}
      />
    </>
  );
}
const q4_2: LessonDef['questions'] = [
  { id: '4-2-a', kind: 'mc', q: 'The first step in the analysis of a combinational circuit is to:', tr: 'Kombinasyonel devre analizinin ilk adımı nedir?', options: ['make sure that the given circuit is combinational and not sequential', 'write a test bench', 'simplify the circuit with a K-map', 'count the number of gates'], answer: 0 },
  { id: '4-2-b', kind: 'mc', q: 'A logic diagram that contains a feedback path defines:', tr: 'Geri besleme yolu içeren bir lojik şema neyi tanımlar?', options: ['a sequential circuit', 'a combinational circuit', 'a two-level circuit', 'a code converter'], answer: 0 },
  { id: '4-2-c', kind: 'expr', q: 'A circuit has gates T1 = AND(A, B), T2 = NOT(C), and output F = OR(T1, T2). Find F as a function of the inputs.', tr: 'Bir devrede T1 = AND(A, B), T2 = NOT(C) ve çıkış F = OR(T1, T2). F\'yi girişler cinsinden bulun.', vars: A3, ones: mintermsOf("AB + C'", A3), minimal: 'sop', explain: "F = T1 + T2 = AB + C'" },
  { id: '4-2-d', kind: 'expr', q: 'Analyze: T1 = NOR(A, B), T2 = AND(A, B), F = NOR(T1, T2). Give F in simplest SOP form.', tr: 'Analiz edin: T1 = NOR(A, B), T2 = AND(A, B), F = NOR(T1, T2). F\'yi en sade SOP olarak verin.', vars: ['A', 'B'], ones: [1, 2], minimal: 'sop', explain: "F = (T1 + T2)' = ((A + B)' + AB)' = (A + B)(A' + B') = A'B + AB' (XOR)" },
  { id: '4-2-e', kind: 'text', q: 'In the analysis example of Fig. 4.2, list the minterms of F1 = A\'BC\' + A\'B\'C + AB\'C\' + ABC.', tr: 'Şekil 4.2 örneğinde F1\'in mintermlerini listeleyin.', answer: '1,2,4,7', norm: 'list' },
  { id: '4-2-f', kind: 'mc', q: 'The circuit of Fig. 4.2 (F1 = A ⊕ B ⊕ C, F2 = AB + AC + BC) implements:', tr: 'Şekil 4.2 devresi (F1 = A⊕B⊕C, F2 = AB + AC + BC) neyi gerçekler?', options: ['a full adder (F1 = sum, F2 = carry)', 'a half adder', 'a BCD-to-excess-3 converter', 'a parity checker only'], answer: 0 },
  { id: '4-2-g', kind: 'mc', q: 'Why is logic simulation not practical for analyzing a circuit, yet useful?', tr: 'Lojik simülasyon neden analiz için pratik değildir ama yine de faydalıdır?', options: ['The number of input patterns needed may be very large; but it is very practical for verifying that the functionality matches the specification.', 'Simulators cannot show 0s and 1s.', 'It only works for sequential circuits.', 'It always gives wrong results for combinational circuits.'], answer: 0 },
  { id: '4-2-h', kind: 'mc', q: 'To obtain the truth table directly from a logic diagram with n inputs, we first list:', tr: 'n girişli bir şemadan doğrudan doğruluk tablosu elde etmek için önce ne listelenir?', options: ['the binary numbers from 0 to 2ⁿ − 1', 'the prime implicants', 'the maxterms only', 'the gate delays'], answer: 0 },
  { id: '4-2-i', kind: 'expr', q: "Analyze: T1 = AND(A', B), T2 = AND(A, C), F = OR(T1, T2, B). Find F in simplest SOP form.", tr: "Analiz edin: T1 = AND(A', B), T2 = AND(A, C), F = OR(T1, T2, B). F'yi en sade SOP olarak bulun.", vars: A3, ones: mintermsOf("A'B + AC + B", A3), minimal: 'sop', explain: "F = A'B + AC + B = B + AC (A'B, B tarafından yutulur — absorption)" },
];

// =====================================================================
// 4.3 Tasarım prosedürü
// =====================================================================
function L4_3() {
  return (
    <>
      <p>
        Tasarım, analizin tersidir: elimizde sözel bir istek (spesifikasyon) var, sonunda bir <b>devre şeması</b> (veya şemanın çıkarılabileceği Boole fonksiyonları) elde etmek
        istiyoruz. Bölüm 3'teki K-map bilgisi burada asıl işe yarıyor.
      </p>
      <h2>Tasarımın 4 adımı</h2>
      <Def
        term="Design procedure"
        en="1. From the specifications of the circuit, determine the required number of inputs and outputs and assign a symbol to each. 2. Derive the truth table that defines the required relationship between inputs and outputs. 3. Obtain the simplified Boolean functions for each output as a function of the input variables. 4. Draw the logic diagram and verify the correctness of the design (manually or by simulation)."
        tr="1. Spesifikasyondan gerekli giriş ve çıkış sayısını belirle, her birine bir sembol ver. 2. Girişlerle çıkışlar arasındaki ilişkiyi tanımlayan doğruluk tablosunu çıkar. 3. Her çıkış için sadeleştirilmiş Boole fonksiyonunu bul. 4. Lojik şemayı çiz ve tasarımın doğruluğunu (elle veya simülasyonla) doğrula."
      />
      <Box kind="warn">
        Sözel tanımlar çoğu zaman <b>eksiktir</b>; yanlış yorum <b>yanlış doğruluk tablosu</b> demektir. Tablo, devrenin tam tanımıdır — en kritik adım budur.
      </Box>
      <p>
        Sadeleştirme için herhangi bir yöntem kullanılabilir: cebirsel işlem, harita yöntemi veya bilgisayar programı. Genellikle birden fazla sade ifade vardır; seçim pratik
        kısıtlara göre yapılır:
      </p>
      <ul>
        <li>kapı sayısı ve bir kapının giriş sayısı,</li>
        <li>sinyalin kapılardan geçerken yayılma süresi (propagation time),</li>
        <li>bağlantı sayısı (interconnections),</li>
        <li>her kapının sürme kapasitesi (bağlanabilecek kapı sayısı, yani fan-out) …</li>
      </ul>
      <p className="small muted">Genelde önce standart formda (SOP/POS) sade fonksiyon bulunur, sonra diğer performans kriterleri için iyileştirilir.</p>

      <Reveal label="Isınma örneği: 3 kişilik oylama devresi (çoğunluk)">
        <p>
          <b>Spesifikasyon:</b> 3 jüri üyesi (A, B, C) evet = 1 / hayır = 0 oy veriyor. Çoğunluk evet derse lamba F yansın.
        </p>
        <ol>
          <li>Girişler A, B, C; çıkış F.</li>
          <li>Doğruluk tablosu: en az iki giriş 1 ise F = 1 → F = Σ(3, 5, 6, 7).</li>
          <li>K-map: F = AB + AC + BC.</li>
          <li>Şema: 3 tane 2 girişli AND + 1 tane 3 girişli OR. (Tanıdık geldi mi? Şekil 4.2'deki F2!)</li>
        </ol>
        <TruthTableLab initial="AB + AC + BC" />
      </Reveal>

      <h2>Kod dönüştürme örneği</h2>
      <Def
        term="Code converter"
        en="A code converter is a circuit that makes the two systems compatible even though each uses a different binary code."
        tr="Kod dönüştürücü, farklı ikili kodlar kullanan iki sistemi birbiriyle uyumlu hale getiren devredir."
      />
      <p>
        Aynı bilgi için farklı sistemler farklı kodlar kullanabilir. Bir sistemin çıkışı diğerinin girişi olacaksa araya bir dönüştürücü konur: girişler A kodunun bit
        kombinasyonunu alır, çıkışlar B kodunun karşılık gelen kombinasyonunu üretir. Örnek: <b>BCD → Excess-3</b> (Bölüm 1.7'deki kodlar; Excess-3 = BCD + 3).
      </p>
      <h3>Adım 1–2: Girişler, çıkışlar, tablo</h3>
      <p>
        Her iki kod da 4 bit → 4 giriş (A, B, C, D) ve 4 çıkış (w, x, y, z). 4 değişkenin 16 kombinasyonu vardır ama tabloda yalnızca <b>10 tanesi</b> var. Geriye kalan{' '}
        <b>6 kombinasyon (1010–1111)</b> BCD'de anlamsızdır ve hiç gelmez → <b>don't-care</b>. Çıkışa 0 veya 1, hangisi devreyi sadeleştiriyorsa onu verebiliriz.
      </p>
      <Table
        compact
        caption="Tablo 4.2 — BCD → Excess-3"
        head={['Rakam', 'A B C D', 'w x y z']}
        rows={[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((d) => [d, d.toString(2).padStart(4, '0').split('').join(' '), (d + 3).toString(2).padStart(4, '0').split('').join(' ')])}
      />
      <h3>Adım 3: Haritalar</h3>
      <p>
        Her çıkış için ayrı bir harita: 1'ler tablodaki çıkış sütunundan gelir, 10–15 karelerine X yazılır. Laboratuvarda bir çıkış seç, "Sonuç" adımında grupları gör:
      </p>
      <CodeConverterLab />
      <Formula>
        z = D' &nbsp;·&nbsp; y = CD + C'D' &nbsp;·&nbsp; x = B'C + B'D + BC'D' &nbsp;·&nbsp; w = A + BC + BD
      </Formula>

      <h3>Adım 4: Şema — ortak kapı kullanımı</h3>
      <p>
        İki seviyeli şema doğrudan bu ifadelerden çizilebilir. Ama ifadeleri cebirle düzenleyip <b>birden fazla çıkışta ortak kapı</b> kullanırsak daha az kapı gerekir (çok
        çıkışlı sistemlerde 3+ seviyeli esneklik):
      </p>
      <Formula>
        y = CD + C'D' = CD + (C + D)'
        <br />
        x = B'C + B'D + BC'D' = B'(C + D) + B(C + D)'
        <br />w = A + BC + BD = A + B(C + D)
      </Formula>
      <p>
        <b>(C + D)</b> çıkışlı OR kapısı üç çıkışın (w, x, y) gerçeklenmesinde ortak kullanılır.
      </p>
      <Table
        head={['', 'İki seviyeli SOP', 'Şekil 4.4 (çok seviyeli)']}
        rows={[
          ['AND kapısı', '7', '4'],
          ['OR kapısı', '3', '4'],
          ['Tersleyici (devre içi)', '—', '1'],
          ['Gerekli giriş tersleyicileri', "B', C', D'", "B', D'"],
          ['Kapı başına giriş', '3\'e kadar', 'en fazla 2'],
        ]}
      />
      <Box kind="exam">
        Kitabın sonucu: <b>üç seviyeli devre daha az kapı gerektirir ve hepsi en fazla iki girişlidir.</b> (Giriş tersleyicileri sayılmadan SOP: 7 AND + 3 OR; Şekil 4.4: 4 AND
        + 4 OR + 1 tersleyici.)
      </Box>
      <p>Aynı dönüştürücünün Verilog modeli (Şekil 4.4'ün yapısıyla):</p>
      <VerilogPlayground initial={8} height={12} />

      <KeyPoints
        items={[
          'Tasarım: (1) giriş/çıkış sayısı ve isimleri (2) doğruluk tablosu (3) her çıkışı sadeleştir (4) şemayı çiz ve doğrula.',
          'Sözel tanımı yanlış yorumlamak = yanlış tablo. Tablo devrenin tam tanımıdır.',
          'Pratik kısıtlar: kapı sayısı, kapı giriş sayısı, yayılma süresi, bağlantı sayısı, sürme kapasitesi.',
          'Code converter: farklı kod kullanan iki sistemi uyumlu yapar.',
          "BCD → Excess-3: 10 geçerli giriş, 6 don't-care (10–15). z = D', y = CD + C'D', x = B'C + B'D + BC'D', w = A + BC + BD.",
          'Ortak (C + D) kapısı ile 3 seviyeli devre: daha az kapı, hepsi ≤ 2 giriş.',
        ]}
      />
    </>
  );
}
const ex3 = (bit: number) => [0, 1, 2, 3, 4, 5, 6, 7, 8, 9].filter((d) => ((d + 3) >> bit) & 1);
const q4_3: LessonDef['questions'] = [
  { id: '4-3-a', kind: 'mc', q: 'What is the first step of the combinational circuit design procedure?', tr: 'Kombinasyonel devre tasarım prosedürünün ilk adımı nedir?', options: ['From the specifications, determine the required number of inputs and outputs and assign a symbol to each.', 'Draw the logic diagram.', 'Simplify the Boolean functions.', 'Write the Verilog test bench.'], answer: 0 },
  { id: '4-3-b', kind: 'mc', q: 'Why is it important that the verbal specifications be interpreted correctly?', tr: 'Sözel spesifikasyonun doğru yorumlanması neden önemlidir?', options: ['Because they are often incomplete, and any wrong interpretation may result in an incorrect truth table.', 'Because K-maps cannot handle errors.', 'Because gates are expensive.', 'Because simulation is impossible.'], answer: 0 },
  { id: '4-3-c', kind: 'text', q: 'In the BCD-to-excess-3 converter, how many of the 16 input combinations are don\'t-care conditions?', tr: 'BCD → Excess-3 dönüştürücüde 16 giriş kombinasyonundan kaçı don\'t-care\'dir?', answer: '6', norm: 'num' },
  { id: '4-3-d', kind: 'text', q: 'What is the excess-3 output (w x y z) of the converter when the BCD input is A B C D = 0110?', tr: 'BCD girişi 0110 iken dönüştürücünün Excess-3 çıkışı (w x y z) nedir?', answer: '1001', norm: 'bin', explain: '0110 = 6 → 6 + 3 = 9 = 1001' },
  { id: '4-3-e', kind: 'expr', q: "Using don't-cares d = Σ(10–15), simplify the output y of the BCD-to-excess-3 converter: y = Σ(0, 3, 4, 7, 8).", tr: "d = Σ(10–15) don't-care'leriyle BCD → Excess-3 dönüştürücünün y çıkışını sadeleştirin: y = Σ(0, 3, 4, 7, 8).", vars: A4, ones: ex3(1), dc: [10, 11, 12, 13, 14, 15], minimal: 'sop', explain: "y = CD + C'D'" },
  { id: '4-3-f', kind: 'expr', q: "Simplify the output w of the BCD-to-excess-3 converter: w = Σ(5, 6, 7, 8, 9), d = Σ(10–15).", tr: "BCD → Excess-3 dönüştürücünün w çıkışını sadeleştirin: w = Σ(5, 6, 7, 8, 9), d = Σ(10–15).", vars: A4, ones: ex3(3), dc: [10, 11, 12, 13, 14, 15], minimal: 'sop', explain: 'w = A + BC + BD' },
  { id: '4-3-g', kind: 'mc', q: 'In the multilevel implementation of the BCD-to-excess-3 converter (Fig. 4.4), which gate output is shared by three outputs?', tr: 'BCD → Excess-3 dönüştürücünün çok seviyeli gerçeklemesinde (Şekil 4.4) hangi kapı çıkışı üç çıkış tarafından ortak kullanılır?', options: ['C + D', 'CD', "D'", 'A + B'], answer: 0 },
  { id: '4-3-h', kind: 'mc', q: 'Which is NOT one of the practical constraints mentioned for choosing an implementation?', tr: 'Hangisi gerçekleme seçiminde belirtilen pratik kısıtlardan biri DEĞİLDİR?', options: ['the color of the integrated circuit package', 'number of gates', 'propagation time of the signal through the gates', 'number of interconnections'], answer: 0 },
  { id: '4-3-i', kind: 'mc', q: 'Compared with the two-level SOP implementation, the three-level circuit of Fig. 4.4:', tr: 'İki seviyeli SOP gerçeklemeye kıyasla Şekil 4.4\'teki üç seviyeli devre:', options: ['requires fewer gates, all of which have no more than two inputs', 'requires more gates but is faster', 'uses only NAND gates', 'needs inverters for all four inputs'], answer: 0 },
];

// =====================================================================
// 4.4 Yarım ve tam toplayıcı
// =====================================================================
function L4_4() {
  return (
    <>
      <p>
        Bilgisayarların yaptığı en temel aritmetik işlem iki ikili rakamın toplanmasıdır. Bu ders §4.5'in girişidir: toplayıcıların <b>tanımları</b> ve neden "yarım" ve
        "tam" denildiği.
      </p>
      <h2>İki biti toplamak</h2>
      <Table
        compact
        head={['İşlem', 'Sonuç', 'Not']}
        rows={[
          ['0 + 0', '0', 'tek basamak'],
          ['0 + 1', '1', 'tek basamak'],
          ['1 + 0', '1', 'tek basamak'],
          ['1 + 1', '10', 'iki basamak: soldaki 1 = elde (carry)'],
        ]}
      />
      <p>
        Toplanan sayılara <En>augend</En> (ilk sayı) ve <En>addend</En> (eklenen sayı) denir. İkisi de 1 olunca sonuç iki basamaklıdır; yüksek anlamlı bit{' '}
        <b>elde</b> <En>carry</En>'dir. Sayılar çok basamaklıysa her basamaktan çıkan elde, bir üst basamağın bit çiftine eklenir.
      </p>
      <Def
        term="Half adder"
        en="A combinational circuit that performs the addition of two bits is called a half adder."
        tr="İki biti toplayan kombinasyonel devreye yarım toplayıcı denir."
      />
      <Def
        term="Full adder"
        en="One that performs the addition of three bits (two significant bits and a previous carry) is a full adder."
        tr="Üç biti (iki anlamlı bit ve önceki basamaktan gelen elde) toplayan devreye tam toplayıcı denir."
      />
      <Box kind="tip">
        İsimler şuradan gelir: <b>iki yarım toplayıcı</b> birleştirilerek bir <b>tam toplayıcı</b> yapılabilir.
      </Box>
      <AdderLab />

      <h2>Tasarım prosedürüyle yarım toplayıcı</h2>
      <p>4.3'teki adımları uygulayalım:</p>
      <ol>
        <li>Girişler x, y (toplanan bitler); çıkışlar S (sum, toplam) ve C (carry, elde).</li>
        <li>Doğruluk tablosu: yukarıdaki laboratuvarın "Half adder" tablosu.</li>
        <li>
          Sadeleştir: <b>S = x'y + xy' = x ⊕ y</b>, <b>C = xy</b>.
        </li>
        <li>Şema: bir XOR ve bir AND kapısı.</li>
      </ol>
      <Box kind="info">
        Tam toplayıcıyı aslında 4.3'teki analiz örneğinde zaten gördük: <b>S = x ⊕ y ⊕ z</b> (tek sayıda 1 varsa) ve <b>C = xy + xz + yz</b> (en az iki 1 varsa) — Şekil
        4.2'nin F1 ve F2 çıkışları.
      </Box>

      <KeyPoints
        items={[
          '1 + 1 = 10 → yüksek anlamlı bit carry (elde). Augend + addend.',
          'Half adder: 2 bit toplar → S = x ⊕ y, C = xy.',
          'Full adder: 3 bit toplar (2 anlamlı bit + önceki elde) → S = x ⊕ y ⊕ z, C = xy + xz + yz.',
          'İki half adder ile bir full adder yapılabilir (isimlerin kaynağı).',
        ]}
      />
    </>
  );
}
const q4_4: LessonDef['questions'] = [
  { id: '4-4-a', kind: 'mc', q: 'A combinational circuit that performs the addition of two bits is called:', tr: 'İki biti toplayan kombinasyonel devreye ne denir?', options: ['a half adder', 'a full adder', 'a code converter', 'a comparator'], answer: 0 },
  { id: '4-4-b', kind: 'mc', q: 'A full adder adds:', tr: 'Tam toplayıcı neyi toplar?', options: ['three bits: two significant bits and a previous carry', 'two bits only', 'two 4-bit numbers', 'a BCD digit and 3'], answer: 0 },
  { id: '4-4-c', kind: 'mc', q: 'Why are the circuits called "half" and "full" adders?', tr: 'Devrelere neden "yarım" ve "tam" toplayıcı denir?', options: ['Because two half adders can be employed to implement a full adder.', 'Because a half adder works only half of the time.', 'Because a half adder has half as many inputs as outputs.', 'Because a full adder uses only full-size gates.'], answer: 0 },
  { id: '4-4-d', kind: 'text', q: 'In binary addition 1 + 1 = 10, the higher significant bit of the result is called the ___.', tr: '1 + 1 = 10 toplamında sonucun yüksek anlamlı bitine ne denir?', answer: ['carry', 'CARRY'], norm: 'upper' },
  { id: '4-4-e', kind: 'mc', q: 'The outputs of a half adder are:', tr: 'Yarım toplayıcının çıkışları nelerdir?', options: ['S = x ⊕ y, C = xy', 'S = xy, C = x ⊕ y', 'S = x + y, C = xy', "S = x'y', C = x + y"], answer: 0 },
  { id: '4-4-f', kind: 'text', q: 'A full adder has inputs x = 1, y = 0, z = 1. Give the outputs as C S (two bits).', tr: 'Tam toplayıcının girişleri x = 1, y = 0, z = 1. Çıkışları C S olarak (iki bit) yazın.', answer: '10', norm: 'bin', explain: '1 + 0 + 1 = 2 = 10 → C = 1, S = 0' },
  {
    id: '4-4-g',
    kind: 'verilog',
    q: 'Using primitive gates, write a Verilog module named HA with inputs a, b and outputs s, c that produces the sum and carry of adding the two bits (Problem 3.39).',
    tr: "Primitive kapılar kullanarak a, b girişli ve s, c çıkışlı, iki bitin toplamını ve eldesini üreten HA adlı Verilog modülünü yazın (Problem 3.39).",
    module: 'HA',
    inputs: ['a', 'b'],
    outputs: { s: (e) => e.a ^ e.b, c: (e) => e.a & e.b },
    starter: `module HA (a, b, s, c);

endmodule`,
    explain: 'Örnek: input a, b; output s, c; xor (s, a, b); and (c, a, b);',
  },
];

export const CH4: LessonDef[] = [
  { id: '4-1', chapter: 4, num: '4.1', title: 'Kombinasyonel Devreler', titleEn: 'Combinational Circuits', book: '§4.1–4.2, s. 125–126', minutes: 20, Component: L4_1, questions: q4_1 },
  { id: '4-2', chapter: 4, num: '4.2', title: 'Analiz Prosedürü', titleEn: 'Analysis Procedure', book: '§4.3, s. 126–129', minutes: 35, Component: L4_2, questions: q4_2 },
  { id: '4-3', chapter: 4, num: '4.3', title: 'Tasarım Prosedürü ve Kod Dönüştürücü', titleEn: 'Design Procedure', book: '§4.4, s. 129–133', minutes: 45, Component: L4_3, questions: q4_3 },
  { id: '4-4', chapter: 4, num: '4.4', title: 'Yarım ve Tam Toplayıcı (Giriş)', titleEn: 'Binary Adder (Introduction)', book: '§4.5 giriş, s. 133', minutes: 20, Component: L4_4, questions: q4_4 },
];
