# Edzésterv

Saját, magyar nyelvű edzés-dashboard a Lyfta adataidból. Megmutatja a következő edzést
(Hát/Váll ↔ Mell/Bicepsz), sorozatonként a célsúlyt és a célismétlést, a haladásodat
grafikonon, és az összes korábbi edzést.

Hogyan működik: egy GitHub Action minden este lehúzza a Lyftából az edzéseidet a
`data/history.json` fájlba, és kiteszi az oldalt GitHub Pagesre. A tervet a böngésző
számolja szabályalapon, így a `js/config.js` módosítása után nem kell újraszinkronizálni.

## Beállítás (egyszer kell)

1. **Repó létrehozása.** GitHubon hozz létre egy új, publikus repót (pl. `edzesterv`).
   A GitHub Pages ingyenes fiókkal csak publikus repóból működik.
2. **Feltöltés.** Csomagold ki a zipet, és a mappában:
   ```bat
   git init -b main
   git add .
   git commit -m "Initial commit"
   git remote add origin https://github.com/FELHASZNALONEV/edzesterv.git
   git push -u origin main
   ```
3. **API kulcs secretként.** Repó → Settings → Secrets and variables → Actions →
   New repository secret. Név: `LYFTA_API_KEY`, érték: egy *friss* kulcs a
   https://my.lyfta.app/community/api oldalról. Ezt a kulcsot sehova máshova ne másold.
4. **Pages bekapcsolása.** Repó → Settings → Pages → Source: **GitHub Actions**.
5. **Első szinkron.** Repó → Actions → „Lyfta szinkron” → Run workflow.
   Pár perc múlva az oldal elérhető: `https://FELHASZNALONEV.github.io/edzesterv/`

Ezután minden nap 20:00 UTC-kor (nyáron 22:00, télen 21:00 budapesti idő) magától fut.
Edzés után a Run workflow gombbal azonnal is frissítheted.

## Hangolás: `js/config.js`

- `rotation`: az edzésnapok sorrendje, pontosan a Lyftában használt nevekkel.
- `repRanges`: ismétléstartomány az első és a további sorozatokra (alapból 8–12 és 10–15).
- `exercises`: gyakorlatonkénti felülírás, pl. `'pulldown': { step: 4 }` a súlylépcsőre.
  A slug a gyakorlat neve kisbetűvel, kötőjelekkel (Lever Seated Row → `lever-seated-row`).
- `names`: opcionális magyar nevek a gyakorlatokhoz.

## A szabályok

Sorozatonként, a legutóbbi elvégzett sorozatod alapján:

- **Súlyemelés**: elérted a tartomány tetejét → +1 lépcső, cél az alsó határ.
- **Ismétlés +1**: a tartományon belül vagy → ugyanaz a súly, eggyel több ismétlés.
- **Tartás**: az alsó határ alatt maradtál → ugyanaz a súly, cél az alsó határ.
  Egy gyengébb alkalom még nem ok a visszalépésre.
- **Visszalépés**: csak ha 3 egymást követő alkalommal az alsó határ alatt maradtál ugyanazon a súlyon.

A súlylépcsőt a korábban használt súlyaidból becsli (a legkisebb különbség, 2,5 és 10 kg
között), de gyakorlatonként felülírhatod. **Megakadt** egy gyakorlat, ha 4 alkalom óta
nincs jobb becsült 1RM, és közben súlyt sem emeltél.

## Adatvédelem

Az oldal publikus link, bárki láthatja, aki ismeri. A `noindex` csak a keresőket tartja távol.
A szinkron szándékosan **nem** menti el a nevedet, a testsúlyodat, a Lyfta azonosítóit és a
képeket, csak a dátumot, az edzés nevét, a gyakorlatokat, a súlyokat, az ismétléseket és a
rekordjelöléseket. A tesztek ezt minden futásnál ellenőrzik.

## Helyi futtatás (Windows, cmd)

```bat
set LYFTA_API_KEY=a_kulcsod
node scripts\sync.mjs
node scripts\test.mjs
python -m http.server 8000
```
Majd nyisd meg: http://localhost:8000 (Node 18+ és Python kell hozzá).

## Jó tudni

- Ha 60 napig nincs commit a repóban (pl. hosszabb edzésszünet), a GitHub leállítja az
  ütemezett futást. Ilyenkor az Actions fülön egy kattintással újra engedélyezheted.
- Ha a Lyfta hirtelen sokkal kevesebb edzést ad vissza, a szinkron leáll, és nem írja felül
  az előzményt. `FORCE=1` környezeti változóval felülbírálható.
