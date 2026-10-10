// Itt tudod hangolni a tervet. A módosítás után elég pusholni, újraszinkron nem kell.

export const CONFIG = {
  timezone: 'Europe/Budapest',

  // Az edzésnapok sorrendje, pontosan úgy, ahogy a Lyftában hívod őket.
  rotation: ['Hát/Váll', 'Mell/Bicepsz'],

  // Ismétléstartományok sorozatonként: [első sorozat], [minden további].
  // Ha a felső határt eléred, jön a súlyemelés; ha az alsó alatt maradsz, tartás.
  repRanges: [[8, 12], [10, 15]],

  // Gyakorlatonkénti felülírás. A kulcs a gyakorlat slugja (a név kisbetűvel, kötőjelekkel).
  // step: súlylépcső kg-ban (alapból az előzményeidből becsüli, 2,5 és 10 kg között).
  exercises: {
    // 'pulldown': { step: 4 },
    // 'lever-lateral-raise': { repRanges: [[10, 15], [12, 18]] },
  },

  // Opcionális magyar megjelenítési nevek.
  names: {
    // 'pulldown': 'Mellhez húzás',
  },

  // Ennyi összehasonlítható alkalom után nézzük a megakadást.
  stagnationWindow: 4,
};
