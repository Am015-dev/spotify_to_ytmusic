// TR_DATA = terrain height-field data, per city. split-1: the data is in two lazy chunks (52f_terr_fra.js, 52a_terr_ath.js) and the Athens quadtree bit-blob in 10c_qtc_blob.js;
// only the current city's chunks are fetched, here, before the terrain module (53) reads them. In a raw src/ page (hot.js, XCV empty) the ORDER entries after this module hold them inline.
const TR_DATA={};
await Promise.all((CID==="ath"?["10c_qtc_blob","52a_terr_ath"]:["52f_terr_fra"]).map(XC_need));   // downloads were started in 10z_lazy.js
