// Fehérjedús, rostos receptek 1 adagra. A tápértékek közelítő becslések.
// p = fehérje (g), f = rost (g), kcal, t = elkészítési idő (perc)

export const RECIPES = {
  lunch: [
    { name: 'Csirkés bulgursaláta csicseriborsóval', t: 25, p: 50, f: 17, kcal: 700,
      ing: ['150 g csirkemell', '60 g bulgur (száraz)', '120 g főtt csicseriborsó', '1 uborka, 1 paradicsom', 'petrezselyem, fél citrom leve', '1 ek olívaolaj, só, bors'],
      steps: ['A bulgurt öntsd le kétszeres mennyiségű forrásban lévő vízzel, fedd le, és hagyd állni 10 percig.', 'A csirkét sózd, borsozd, és serpenyőben süsd meg oldalanként 5–6 perc alatt.', 'Kockázd fel a zöldségeket, keverd össze mindent a citromlével és az olajjal, a csirkét szeleteld a tetejére.'] },
    { name: 'Vöröslencse-curry pulykával és barna rizzsel', t: 30, p: 56, f: 13, kcal: 750,
      ing: ['150 g pulykamell', '70 g vöröslencse (száraz)', '60 g barna rizs (száraz)', '200 g paradicsompüré (passata)', '1 marék spenót, 1 kis fej hagyma', '1 tk curry, 1 tk olaj'],
      steps: ['Tedd fel a rizst főni a csomagolás szerint.', 'A hagymát pirítsd meg az olajon, add hozzá a kockára vágott pulykát és a curryt.', 'Mehet rá a lencse, a passata és 2 dl víz; főzd 15 percig, a végén keverd bele a spenótot.'] },
    { name: 'Tonhalas-babos teljes kiőrlésű tészta', t: 15, p: 50, f: 13, kcal: 600,
      ing: ['80 g teljes kiőrlésű tészta (száraz)', '1 konzerv tonhal saját lében (kb. 120 g lecsepegtetve)', '100 g főtt vörösbab', '6–8 koktélparadicsom, 1 marék rukkola', '1 gerezd fokhagyma, 1 tk olívaolaj, citrom'],
      steps: ['Főzd ki a tésztát.', 'Közben a fokhagymát és a félbevágott paradicsomot futtasd át az olajon, add hozzá a babot és a tonhalat.', 'Forgasd bele a tésztát, a tetejére rukkola és pár csepp citrom.'] },
    { name: 'Csirkés quinoatál brokkolival és avokádóval', t: 25, p: 49, f: 15, kcal: 620,
      ing: ['150 g csirkemell', '70 g quinoa (száraz)', '200 g brokkoli', 'fél avokádó', 'szójaszósz, citrom, chilipehely'],
      steps: ['A quinoát öblítsd át, és főzd 15 percig kétszeres vízben.', 'A brokkolit párold 5 percig, a csirkét süsd meg serpenyőben.', 'Tálban rendezd el, a tetejére avokádó, szójaszósz és citrom.'] },
    { name: 'Sült édesburgonya darált pulykával és fekete babbal', t: 35, p: 50, f: 19, kcal: 670,
      ing: ['300 g édesburgonya', '150 g darált pulyka', '120 g főtt fekete bab', '50 g natúr joghurt', '1 tk füstölt paprika, kömény, újhagyma'],
      steps: ['Az édesburgonyát vágd félbe, és süsd 200 °C-on kb. 25 percig.', 'A pulykát pirítsd meg a fűszerekkel, a végén keverd hozzá a babot.', 'Töltsd az édesburgonyára, a tetejére joghurt és újhagyma.'] },
    { name: 'Lazacos hajdinatál edamaméval', t: 20, p: 43, f: 12, kcal: 620,
      ing: ['130 g lazacfilé', '60 g hajdina (száraz)', '80 g hüvelyezett edamame (fagyasztott)', '1 uborka', '1 tk szezámmag, szójaszósz'],
      steps: ['A hajdinát főzd 10–12 percig, az edamamét az utolsó 3 percben dobd hozzá.', 'A lazacot süsd serpenyőben, bőrös felével lefelé 4 percig, majd fordítsd meg 2 percre.', 'Tálald uborkával, szezámmal és szójaszósszal.'] },
    { name: 'Csirkés-humuszos teljes kiőrlésű tortilla', t: 15, p: 49, f: 15, kcal: 680,
      ing: ['2 teljes kiőrlésű tortilla', '150 g csirkemell', '80 g humusz', 'saláta, 1 kaliforniai paprika', 'só, bors, fokhagymapor'],
      steps: ['A csirkét fűszerezd, süsd meg, és csíkozd fel.', 'A tortillákat kend meg humusszal, rakd rá a salátát, a paprikát és a csirkét.', 'Tekerd fel, és száraz serpenyőben pirítsd meg mindkét oldalát 1–1 percig.'] },
    { name: 'Barnalencse-saláta tojással és fetával', t: 25, p: 40, f: 11, kcal: 560,
      ing: ['80 g barna lencse (száraz)', '2 tojás', '50 g light feta', '1 paradicsom, 1 marék rukkola', 'lilahagyma, 1 tk olívaolaj, balzsamecet'],
      steps: ['A lencsét főzd 20 percig puhára, majd szűrd le.', 'A tojásokat főzd keményre (9 perc).', 'Keverd össze a lencsét a zöldségekkel, morzsold rá a fetát, a tetejére a negyedelt tojások.'] },
    { name: 'Marhás-babos chili barna rizzsel', t: 35, p: 47, f: 13, kcal: 650,
      ing: ['150 g sovány darált marha', '120 g főtt vesebab', '200 g darabolt paradicsom', '50 g kukorica, 1 kis fej hagyma', '60 g barna rizs (száraz)', 'chili, kömény, füstölt paprika'],
      steps: ['Tedd fel a rizst főni.', 'A hagymát és a húst pirítsd meg a fűszerekkel.', 'Add hozzá a paradicsomot, a babot és a kukoricát, főzd 15 percig, majd tálald a rizzsel.'] },
    { name: 'Tofus-zöldséges pirított soba', t: 20, p: 45, f: 10, kcal: 680,
      ing: ['200 g natúr tofu', '80 g hajdinatészta (soba)', '50 g edamame', '200 g brokkoli és sárgarépa', 'szójaszósz, gyömbér, 1 tk szezámolaj'],
      steps: ['A tofut kockázd fel, és pirítsd ropogósra a szezámolajon.', 'A tésztát főzd ki, a zöldségeket pirítsd 4–5 percig.', 'Forgass össze mindent a szójaszósszal és a reszelt gyömbérrel.'] },
  ],
  dinner: [
    { name: 'Tepsis csirke csicseriborsóval és zöldségekkel', t: 35, p: 45, f: 11, kcal: 470,
      ing: ['150 g csirkemell', '100 g főtt csicseriborsó', '1 cukkini, 1 kaliforniai paprika, 1 lilahagyma', '1 ek olívaolaj', 'füstölt paprika, fokhagyma, oregánó'],
      steps: ['Mindent vágj nagyobb darabokra, és forgasd össze az olajjal és a fűszerekkel.', 'Tepsiben süsd 200 °C-on 25 percig, félidőben forgasd át.'] },
    { name: 'Tőkehal zöldlencseágyon', t: 30, p: 47, f: 10, kcal: 430,
      ing: ['180 g tőkehal', '60 g zöldlencse (száraz)', '1 marék spenót, 1 paradicsom', 'citrom, fokhagyma', '1 tk olívaolaj'],
      steps: ['A lencsét főzd puhára (kb. 20 perc).', 'A halat sózd, borsozd, és süsd serpenyőben oldalanként 3 percig.', 'A lencsébe keverd bele a spenótot és a paradicsomot, a tetejére a hal és citrom.'] },
    { name: 'Spenótos-gombás omlett teljes kiőrlésű kenyérrel', t: 15, p: 40, f: 9, kcal: 490,
      ing: ['3 tojás + 100 g tojásfehérje', '100 g gomba, 1 marék spenót', '2 szelet teljes kiőrlésű kenyér (kb. 80 g)', 'só, bors, 1 tk olaj'],
      steps: ['A gombát pirítsd meg, add hozzá a spenótot.', 'Öntsd rá a felvert tojást, és lassú tűzön, fedő alatt süsd meg.', 'Tálald a pirított kenyérrel.'] },
    { name: 'Pulykás-brokkolis wok barna rizzsel', t: 25, p: 45, f: 9, kcal: 490,
      ing: ['150 g pulykamell', '250 g brokkoli, sárgarépa és paprika', '50 g barna rizs (száraz)', 'szójaszósz, gyömbér, fokhagyma', '1 tk olaj'],
      steps: ['Tedd fel a rizst főni.', 'A csíkokra vágott pulykát nagy lángon pirítsd meg, majd vedd ki.', 'A zöldségeket pirítsd 4–5 percig, tedd vissza a húst, és forgasd össze a szósszal.'] },
    { name: 'Fehérbab-krémleves csirkével', t: 25, p: 46, f: 11, kcal: 420,
      ing: ['150 g főtt fehérbab', '100 g főtt (vagy sült) csirkemell', '1 kis fej hagyma, 2 gerezd fokhagyma', '3 dl zöldségalaplé', 'rozmaring, 1 tk olívaolaj'],
      steps: ['A hagymát és a fokhagymát párold meg az olajon, add hozzá a babot, az alaplevet és a rozmaringot.', 'Főzd 10 percig, majd turmixold krémesre.', 'A tetejére kockázd a csirkét.'] },
    { name: 'Sült lazac zöldbabbal, édesburgonyával és fokhagymás skyrral', t: 30, p: 42, f: 10, kcal: 550,
      ing: ['130 g lazacfilé', '200 g zöldbab', '150 g édesburgonya', '150 g skyr, 1 gerezd fokhagyma, kapor'],
      steps: ['Az édesburgonyát kockázd fel, és süsd 200 °C-on 20 percig.', 'A lazacot tedd mellé az utolsó 12 percre, a zöldbabot párold 6 percig.', 'A skyrt keverd ki fokhagymával és kaporral, ez lesz a mártás.'] },
    { name: 'Töltött paprika darált pulykával', t: 50, p: 38, f: 8, kcal: 480,
      ing: ['2 nagy töltenivaló paprika', '150 g darált pulyka', '40 g barna rizs (száraz)', '200 g paradicsompüré (passata)', '1 kis cukkini lereszelve, só, bors, pirospaprika'],
      steps: ['A rizst főzd félpuhára, és keverd össze a hússal, a cukkinivel és a fűszerekkel.', 'Töltsd a paprikákba, öntsd le a passatával és 1 dl vízzel.', 'Fedő alatt főzd 30–35 percig.'] },
    { name: 'Csicseriborsós shakshuka fetával', t: 25, p: 36, f: 14, kcal: 560,
      ing: ['3 tojás', '120 g főtt csicseriborsó', '400 g darabolt paradicsom', '1 marék spenót, 30 g feta', 'kömény, füstölt paprika, chili'],
      steps: ['A paradicsomot főzd be a fűszerekkel és a csicseriborsóval 10 perc alatt.', 'Keverd bele a spenótot, csinálj mélyedéseket, és üsd beléjük a tojásokat.', 'Fedő alatt főzd 6–8 percig, a tetejére morzsold a fetát.'] },
    { name: 'Tilápia sült zöldségekkel és quinoával', t: 30, p: 43, f: 8, kcal: 460,
      ing: ['180 g tilápiafilé', '50 g quinoa (száraz)', '1 cukkini, fél padlizsán', '1 tk olívaolaj', 'citrom, kapor, só, bors'],
      steps: ['A zöldségeket kockázd fel, és süsd 200 °C-on 20 percig.', 'Közben főzd ki a quinoát.', 'A halat az utolsó 10 percre tedd a zöldségek mellé, citrommal és kaporral.'] },
  ],
  snack: [
    { name: 'Skyr bogyós gyümölccsel, zabbal és chiával', t: 3, p: 28, f: 11, kcal: 345,
      ing: ['200 g skyr', '100 g (fagyasztott) bogyós gyümölcs', '30 g zabpehely', '10 g chiamag'],
      steps: ['Rétegezd egy pohárba vagy dobozba. Előző este összekeverve reggelre krémes lesz.'] },
    { name: 'Fűszeres túrókrém zöldségrudakkal', t: 5, p: 29, f: 6, kcal: 300,
      ing: ['200 g sovány túró', '1 újhagyma, pirospaprika, só', 'sárgarépa és kaliforniai paprika rudakra vágva', '1 szelet teljes kiőrlésű kenyér'],
      steps: ['A túrót keverd ki 2–3 ek vízzel, az apróra vágott újhagymával és a fűszerekkel, és mártogasd bele a zöldségeket.'] },
    { name: 'Sós edamame', t: 6, p: 17, f: 8, kcal: 180,
      ing: ['150 g hüvelyezett edamame (fagyasztott)', 'pehelysó, chilipehely'],
      steps: ['Főzd 4–5 percig sós vízben, szűrd le, és szórd meg sóval és chilivel.'] },
    { name: 'Ropogós pirított csicseriborsó egy pohár kefirrel', t: 30, p: 21, f: 11, kcal: 440,
      ing: ['150 g főtt csicseriborsó', '1 tk olívaolaj, füstölt paprika, só', '2,5 dl kefir'],
      steps: ['A csicseriborsót töröld szárazra, forgasd össze az olajjal és a fűszerekkel.', '200 °C-on süsd 25 percig, félidőben rázd át. Hidegen is ropogós marad, dobozban 2–3 napig eláll.'] },
    { name: 'Overnight oats skyrral', t: 5, p: 31, f: 10, kcal: 460,
      ing: ['50 g zabpehely', '150 g skyr', '1,5 dl tej', '1 ek chiamag', 'fél banán'],
      steps: ['Este keverd össze dobozban, és tedd hűtőbe. Reggel vagy edzés után kanalazd ki, a tetejére a banán.'] },
    { name: 'Cottage cheese almával, fahéjjal és dióval', t: 3, p: 24, f: 5, kcal: 380,
      ing: ['200 g cottage cheese', '1 alma', '15 g dió', 'fahéj'],
      steps: ['Az almát kockázd fel, keverd a cottage cheese-hez, a tetejére fahéj és tört dió.'] },
    { name: 'Főtt tojás humusszal és zöldségekkel', t: 10, p: 17, f: 7, kcal: 280,
      ing: ['2 tojás', '60 g humusz', 'uborka, sárgarépa, retek'],
      steps: ['A tojásokat főzd keményre (9 perc), hűtsd le. A zöldségeket mártogasd a humuszba.'] },
    { name: 'Kakaós-banános fehérjeturmix', t: 3, p: 37, f: 7, kcal: 450,
      ing: ['3 dl tej', '1 banán', '1 adag (30 g) fehérjepor', '20 g zabpehely', '1 ek cukrozatlan kakaópor'],
      steps: ['Turmixold össze. Edzés után 1 órán belül jó választás.'] },
  ],
};

// Napi választás: minden nap más kombináció. A három lista hossza eltérő,
// így ugyanaz az ebéd–vacsora–nasi hármas csak ritkán ismétlődik.
export function dayNumber(date, timeZone = 'Europe/Budapest') {
  const p = Object.fromEntries(new Intl.DateTimeFormat('en-CA', { timeZone, year: 'numeric', month: '2-digit', day: '2-digit' })
    .formatToParts(date).map((x) => [x.type, x.value]));
  return Math.floor(Date.UTC(+p.year, +p.month - 1, +p.day) / 86400000);
}

export function recipesFor(n) {
  const pick = (list, offset) => list[((n + offset) % list.length + list.length) % list.length];
  return {
    lunch: pick(RECIPES.lunch, 0),
    dinner: pick(RECIPES.dinner, 4),
    snack: pick(RECIPES.snack, 2),
  };
}
