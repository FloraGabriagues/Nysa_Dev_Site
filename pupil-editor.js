// ============================================================================
// Nysa : éditeur de pupille libre (fenêtre plein écran).
//
// Utilisation (creer-instrument.html) :
//   NysaPupilEditor.open({ block: <bloc pupil_free ou null>, onApply: function(cleanBlock){ ... } });
//
// Dépend de vendor/polygon-clipping.min.js et de pupil-geometry.js (chargés avant), et de i18n.js (tx, nysaLang).
// Tout le CSS est limité à la classe .pe : rien ne déborde sur le reste de la page.
// ============================================================================
(function(){
"use strict";

var CSS = ".pe .layout{display:grid;grid-template-columns:minmax(340px,430px) 1fr;gap:22px;align-items:start}\n@media(max-width:900px){.pe .layout{grid-template-columns:1fr}}\n.pe .card{background:var(--panel);border:1px solid var(--line-soft);border-radius:8px;padding:18px 20px;margin-bottom:18px}\n.pe .subhead{font-family:var(--mono);font-size:12px;letter-spacing:.13em;text-transform:uppercase;color:var(--muted);margin:0 0 12px;display:flex;align-items:center;gap:10px}\n.pe .subhead .dot{width:8px;height:8px;border-radius:50%;flex:none;background:var(--photon)}\n.pe .subhead .count{margin-left:auto;letter-spacing:0;text-transform:none;color:var(--muted-2)}\n.pe .hint{font-size:12.5px;color:var(--muted);margin:0 0 12px;line-height:1.5}\n.pe .btn{appearance:none;cursor:pointer;border-radius:4px;padding:8px 12px;font-family:var(--body);font-size:13px;font-weight:500;border:1px solid var(--line);background:transparent;color:var(--paper)}\n.pe .btn:hover{border-color:var(--pixel);color:var(--pixel)}\n.pe .btn:disabled{opacity:.4;cursor:not-allowed}\n.pe .btn:disabled:hover{border-color:var(--line);color:var(--paper)}\n.pe .btn.primary{background:var(--pixel);color:#052824;border-color:var(--pixel)}\n.pe .btn.primary:hover{background:#7DE6DC;color:#052824}\n.pe .btnrow{display:flex;flex-wrap:wrap;gap:8px}\n.pe .ibtn{appearance:none;cursor:pointer;background:transparent;border:1px solid var(--line);color:var(--muted);border-radius:3px;min-width:28px;height:28px;padding:0 6px;font-family:var(--mono);font-size:13px;line-height:1}\n.pe .ibtn:hover{border-color:var(--pixel);color:var(--pixel)}\n.pe .ibtn.danger:hover{border-color:var(--alert);color:var(--alert)}\n.pe .ibtn:disabled{opacity:.3;cursor:not-allowed}\n.pe .ibtn:disabled:hover{border-color:var(--line);color:var(--muted)}\n.pe .scard{border:1px solid var(--line-soft);border-left:3px solid var(--add);border-radius:6px;margin-bottom:10px;background:var(--panel-2)}\n.pe .scard.sub{border-left-color:var(--alert)}\n.pe .scard.sel{border-color:var(--line);border-left-width:3px}\n.pe .scard.sel:not(.sub){border-left-color:var(--add)}\n.pe .shead{display:flex;align-items:center;gap:10px;padding:10px 10px 10px 12px;cursor:pointer}\n.pe .shead:focus-visible{outline:2px solid var(--pixel);outline-offset:-2px}\n.pe .sidx{font-family:var(--mono);font-size:12px;color:var(--muted);width:22px;flex:none}\n.pe .stitle{flex:1;min-width:0;font-size:13.5px;line-height:1.35;display:flex;flex-direction:column}\n.pe .stitle b{font-weight:500;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}\n.pe .smode{font-family:var(--mono);font-size:11.5px;color:var(--add)}\n.pe .scard.sub .smode{color:var(--alert)}\n.pe .sbtns{display:flex;gap:5px;flex:none}\n.pe .serr{font-size:12.5px;color:var(--alert);margin:0;padding:0 12px 10px 44px}\n.pe .sbody{padding:4px 14px 14px;border-top:1px solid var(--line-soft)}\n.pe .field{margin:12px 0 0}\n.pe .field label,.pe .field .lab{display:block;font-size:12.5px;color:var(--muted);margin-bottom:5px}\n.pe .field .row{display:flex;gap:8px;align-items:center;min-width:0}\n.pe .field input[type=text]{flex:1;min-width:0;background:var(--void);border:1px solid var(--line);border-radius:3px;color:var(--paper);padding:7px 9px;font-family:var(--mono);font-size:13.5px}\n.pe .field input[type=text]:focus{outline:none;border-color:var(--pixel)}\n.pe .field .unit{font-family:var(--mono);font-size:12px;color:var(--muted-2);min-width:18px}\n.pe .field .lockhint{font-size:12px;color:var(--muted-2);margin:0}\n.pe .grid2{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1fr);gap:0 14px}\n.pe .modeseg{display:inline-flex;border:1px solid var(--line);border-radius:4px;overflow:hidden}\n.pe .modeseg button{appearance:none;cursor:pointer;background:transparent;border:none;color:var(--muted);font-family:var(--body);font-size:12.5px;padding:5px 14px}\n.pe .modeseg button + button{border-left:1px solid var(--line)}\n.pe .modeseg button.on.add{background:rgba(106,169,255,.16);color:var(--add)}\n.pe .modeseg button.on.sub{background:rgba(240,119,109,.16);color:var(--alert)}\n.pe input[type=range]{width:100%;margin:8px 0 0;accent-color:var(--pixel)}\n.pe .rowlist{display:flex;flex-direction:column;gap:6px;margin-bottom:8px}\n.pe .rowlist .prow{display:flex;gap:8px;align-items:center}\n.pe .rowlist .pidx{font-family:var(--mono);font-size:12px;color:var(--muted-2);width:22px;flex:none}\n.pe .spread{display:flex;flex-wrap:wrap;gap:8px;align-items:center;margin-top:10px;padding-top:10px;border-top:1px solid var(--line-soft);font-size:12.5px;color:var(--muted)}\n.pe .spread input{width:64px;flex:none;background:var(--void);border:1px solid var(--line);border-radius:3px;color:var(--paper);padding:6px 8px;font-family:var(--mono);font-size:13px}\n.pe .empty{font-size:13px;color:var(--muted-2);margin:0 0 10px}\n.pe .ctrlrow{display:flex;flex-wrap:wrap;gap:14px;margin-bottom:12px}\n.pe .ctrlrow .c{display:flex;flex-direction:column;gap:4px}\n.pe .ctrlrow label{font-family:var(--mono);font-size:11.5px;color:var(--muted);text-transform:uppercase;letter-spacing:.08em}\n.pe .ctrlrow select{background:var(--panel-2);color:var(--paper);border:1px solid var(--line);border-radius:3px;padding:7px 9px;font-family:var(--body);font-size:13.5px}\n.pe .previewbox{border:1px solid var(--line-soft);border-radius:6px;overflow:hidden;background:var(--void)}\n.pe #preview{touch-action:none;user-select:none;-webkit-user-select:none}\n.pe #preview svg{display:block;width:100%;height:auto;max-height:78vh;aspect-ratio:1/1}\n.pe .legend{display:flex;flex-wrap:wrap;gap:16px;margin-top:10px;font-family:var(--mono);font-size:12px;color:var(--muted)}\n.pe .legend i{display:inline-block;width:18px;height:0;border-top:2px solid;vertical-align:middle;margin-right:6px}\n.pe .legend .lres{border-color:var(--pixel)}\n.pe .legend .ladd{border-color:var(--add)}\n.pe .legend .lsub{border-color:var(--alert);border-top-style:dashed}\n.pe .gridnote{font-size:12px;color:var(--photon);margin:8px 0 0}\n.pe .drawbar{display:flex;flex-wrap:wrap;align-items:center;gap:10px;margin:0 0 12px;padding:10px 12px;border:1px solid var(--photon);border-radius:5px;background:rgba(245,172,87,.08);font-size:13px;color:var(--paper)}\n.pe .drawbar[hidden]{display:none}\n.pe .drawbar span{flex:1;min-width:200px}\n.pe .mousehint{font-size:12px;color:var(--muted-2);margin:8px 0 0;line-height:1.5}\n.pe .vals{display:grid;grid-template-columns:repeat(auto-fill,minmax(190px,1fr));gap:8px}\n.pe .val{background:var(--panel-2);border:1px solid var(--line-soft);border-radius:5px;padding:8px 11px}\n.pe .val .k{font-family:var(--mono);font-size:11.5px;color:var(--muted);text-transform:uppercase;letter-spacing:.07em}\n.pe .val .v{font-family:var(--mono);font-size:16px;color:var(--pixel)}\n.pe .val .v small{font-size:12px;color:var(--muted-2)}\n.pe .gerr{font-size:13.5px;color:var(--alert);margin:10px 0 0}\n.pe .gok{font-size:12.5px;color:var(--muted);margin:10px 0 0;line-height:1.5}\n.pe textarea{width:100%;min-height:150px;resize:vertical;background:var(--void);color:var(--paper);border:1px solid var(--line);border-radius:4px;padding:10px;font-family:var(--mono);font-size:12px;line-height:1.45}\n.pe textarea:focus{outline:none;border-color:var(--pixel)}\n.pe .jmsg{font-size:12.5px;margin:8px 0 0;min-height:18px}\n.pe-overlay{position:fixed;inset:0;z-index:160;background:var(--void);color:var(--paper);display:flex;flex-direction:column;--add:#6AA9FF;font-family:var(--body);font-size:16px;line-height:1.6}\n.pe .pe-top{display:flex;align-items:center;justify-content:space-between;gap:12px;flex-wrap:wrap;padding:12px 26px;border-bottom:1px solid var(--line-soft);background:var(--panel)}\n.pe .pe-top h2{font-family:var(--display);font-weight:600;font-size:17px;margin:0;color:var(--paper)}\n.pe .pe-topbtns{display:flex;gap:10px}\n.pe .pe-scroll{flex:1;overflow-y:auto}\n.pe .pe-wrap{max-width:1280px;margin:0 auto;padding:22px 26px 60px}\n.pe .pe-json summary{list-style:none}\n.pe .pe-json summary::-webkit-details-marker{display:none}\n.pe *{box-sizing:border-box}\n";

var MAXS = NysaPupil.MAX_SHAPES, MAXP = NysaPupil.MAX_POINTS, MAXA = NysaPupil.MAX_ARMS;
var root = null;                       // la fenêtre, quand elle est ouverte
var state, drag, view, lastRes, lastOutlines, raf, opts, initialJson, prevFocus, prevOverflow;

function tl(){ return (typeof nysaLang === "function") ? nysaLang() : "fr"; }
// Nombre écrit pour l'affichage (virgule en français, point en anglais).
function nf(v){ var s = String(v); return tl() === "fr" ? s.replace(".", ",") : s; }
function $(id){ return root ? root.querySelector("#" + id) : null; }
function esc(v){ return String(v).replace(/&/g, "&amp;").replace(/'/g, "&#39;").replace(/"/g, "&quot;").replace(/</g, "&lt;"); }
function toNum(s){
  if(s === "" || s === undefined || s === null) return undefined;
  var v = Number(s);
  return isFinite(v) ? v : undefined;
}
function fmt(x){
  if(!isFinite(x)) return "-";
  if(x === 0) return "0";
  return String(Number(Number(x).toPrecision(4)));
}
function fmtL(x){ return nf(fmt(x)); }
function numStr(x){ return String(Number(Number(x).toPrecision(10))); }

function typeLabel(t){
  return t === "circle" ? tx("Cercle") : t === "rectangle" ? tx("Rectangle") : t === "polygon_regular" ? tx("Polygone régulier")
    : t === "polygon_free" ? tx("Polygone libre") : tx("Supports");
}

// Messages de validation de pupil-geometry.js (écrits en français, comme ceux du serveur) : traduits ici pour l'affichage.
var GEO_EN = [
  [/^Forme (\d+) : champ '(.+)' manquant\.$/, "Shape $1: field '$2' is missing."],
  [/^Forme (\d+) : '(.+)' doit être un nombre fini\.$/, "Shape $1: '$2' must be a finite number."],
  [/^Forme (\d+) : '(.+)' doit être strictement positif\.$/, "Shape $1: '$2' must be strictly positive."],
  [/^Pupille libre : le bloc doit être un objet avec une liste 'shapes'\.$/, "Free pupil: the block must be an object with a 'shapes' list."],
  [/^Pupille libre : la liste de formes est vide\.$/, "Free pupil: the list of shapes is empty."],
  [/^Pupille libre : (\d+) formes, maximum (\d+)\.$/, "Free pupil: $1 shapes, maximum $2."],
  [/^Forme (\d+) : doit être un objet\.$/, "Shape $1: must be an object."],
  [/^Forme (\d+) : 'mode' doit être 'add' ou 'subtract'\.$/, "Shape $1: 'mode' must be 'add' or 'subtract'."],
  [/^Forme (\d+) : 'n_sides' doit être un entier entre 3 et 12\.$/, "Shape $1: 'n_sides' must be an integer between 3 and 12."],
  [/^Forme (\d+) : 'points' doit contenir entre 3 et (\d+) points\.$/, "Shape $1: 'points' must contain between 3 and $2 points."],
  [/^Forme (\d+) : chaque point doit être \[x, y\] avec des nombres finis\.$/, "Shape $1: each point must be [x, y] with finite numbers."],
  [/^Forme (\d+) : 'angles_deg' doit contenir entre 1 et (\d+) angles\.$/, "Shape $1: 'angles_deg' must contain between 1 and $2 angles."],
  [/^Forme (\d+) : les angles doivent être des nombres finis\.$/, "Shape $1: the angles must be finite numbers."],
  [/^Forme (\d+) : type inconnu '(.+)'\.$/, "Shape $1: unknown type '$2'."],
  [/^Pupille libre : il faut au moins une forme en mode 'add'\.$/, "Free pupil: at least one shape in 'add' mode is required."],
  [/^Polygone libre invalide \(côtés qui se croisent, points alignés ou aire nulle\)\.$/, "Invalid free polygon (crossing sides, aligned points or zero area)."],
  [/^Type de forme inconnu : (.+)$/, "Unknown shape type: $1"],
  [/^Pupille libre : la surface finale est nulle \(tout a été retiré\)\.$/, "Free pupil: the final area is zero (everything was removed)."],
  [/^Pupille libre : étendue trop grande \((.+) m\), maximum (.+) m\.$/, "Free pupil: extent too large ($1 m), maximum $2 m."]
];
function trGeo(msg){
  if(tl() === "fr") return msg;
  for(var i = 0; i < GEO_EN.length; i++){
    if(GEO_EN[i][0].test(msg)) return msg.replace(GEO_EN[i][0], GEO_EN[i][1]);
  }
  return msg;
}

function newShape(type){
  var s = { type: type, mode: "add", x: "0", y: "0", rot: "0" };
  if(type === "circle"){ s.diameter = "1"; }
  else if(type === "rectangle"){ s.width = "0.5"; s.height = "0.2"; }
  else if(type === "polygon_regular"){ s.n_sides = "6"; s.flat_to_flat = "0.5"; }
  else if(type === "polygon_free"){ s.points = [{x:"-0.2", y:"-0.15"}, {x:"0.2", y:"-0.15"}, {x:"0", y:"0.2"}]; }
  else if(type === "support"){ s.mode = "subtract"; s.angles = ["-90", "30", "150"]; s.width = "0.03"; }
  return s;
}

// Forme de l'état (textes) -> forme du bloc pupil_free (nombres). Un champ vide est omis.
function buildShape(s){
  var o = { type: s.type, mode: s.mode }, v;
  function put(key, val){ if(val !== undefined) o[key] = val; }
  put("x", toNum(s.x)); put("y", toNum(s.y)); put("rotation_deg", toNum(s.rot));
  if(s.type === "circle"){ put("diameter", toNum(s.diameter)); }
  else if(s.type === "rectangle"){ put("width", toNum(s.width)); put("height", toNum(s.height)); }
  else if(s.type === "polygon_regular"){ put("n_sides", toNum(s.n_sides)); put("flat_to_flat", toNum(s.flat_to_flat)); }
  else if(s.type === "polygon_free"){
    o.points = s.points.map(function(p){
      var a = toNum(p.x), b = toNum(p.y);
      return [a === undefined ? NaN : a, b === undefined ? NaN : b];
    });
  } else if(s.type === "support"){
    o.angles_deg = s.angles.map(function(a){ v = toNum(a); return v === undefined ? NaN : v; });
    put("width", toNum(s.width));
  }
  return o;
}
function buildBlock(){
  var b = { shapes: state.shapes.map(buildShape) };
  if(state.serverGrid) b.grid_step_m = state.serverGrid;
  return b;
}
function fromBlockShape(c){
  var s = { type: c.type, mode: c.mode, x: numStr(c.x), y: numStr(c.y), rot: numStr(c.rotation_deg) };
  if(c.type === "circle"){ s.diameter = numStr(c.diameter); }
  else if(c.type === "rectangle"){ s.width = numStr(c.width); s.height = numStr(c.height); }
  else if(c.type === "polygon_regular"){ s.n_sides = numStr(c.n_sides); s.flat_to_flat = numStr(c.flat_to_flat); }
  else if(c.type === "polygon_free"){ s.points = c.points.map(function(p){ return { x: numStr(p[0]), y: numStr(p[1]) }; }); }
  else if(c.type === "support"){ s.angles = c.angles_deg.map(numStr); s.width = numStr(c.width); }
  return s;
}

// ===================== Exemples =====================
function exampleCirc(){
  var a = newShape("circle"); a.diameter = "0.3";
  var b = newShape("circle"); b.mode = "subtract"; b.diameter = "0.085";
  var c = newShape("support"); c.angles = ["-90", "30", "150"]; c.width = "0.03";
  return [a, b, c];
}
function exampleWebb(){
  var ff = 0.10, gap = 0.004, pitch = ff + gap, out = [], k, ang;
  function hex(rd, deg){
    var s = newShape("polygon_regular");
    s.n_sides = "6"; s.flat_to_flat = numStr(ff);
    s.x = numStr(rd * Math.cos(deg * Math.PI / 180)); s.y = numStr(rd * Math.sin(deg * Math.PI / 180));
    out.push(s);
  }
  for(k = 0; k < 6; k++){ ang = 30 + 60 * k; hex(pitch, ang); }
  for(k = 0; k < 6; k++){ ang = 30 + 60 * k; hex(2 * pitch, ang); }
  for(k = 0; k < 6; k++){ ang = 60 * k; hex(Math.sqrt(3) * pitch, ang); }
  return out;
}

// ===================== Filtre de frappe des champs numériques =====================
function filterNumeric(e){
  var el = e.target;
  if(!el.matches || !el.matches("input[data-num]")) return;
  var raw = el.value, pos = el.selectionStart;
  var v = raw.replace(/,/g, ".").replace(/[^0-9.]/g, "");
  var neg = el.hasAttribute("data-neg") && /^\s*-/.test(raw);
  if(el.hasAttribute("data-int")){ v = v.replace(/\./g, ""); }
  else { var dot = v.indexOf("."); if(dot >= 0) v = v.slice(0, dot + 1) + v.slice(dot + 1).replace(/\./g, ""); }
  if(neg) v = "-" + v;
  if(v !== raw){
    el.value = v;
    try{ var p = Math.max(0, pos - (raw.length - v.length)); el.setSelectionRange(p, p); }catch(_){}
  }
}

// ===================== Liste des formes =====================
function summary(s){
  var t = typeLabel(s.type), q = "?";
  function g(k){ var v = toNum(s[k]); return v === undefined ? q : fmtL(v); }
  if(s.type === "circle") return tx("{type}, Ø {d} m", { type: t, d: g("diameter") });
  if(s.type === "rectangle") return tx("{type}, {w} × {h} m", { type: t, w: g("width"), h: g("height") });
  if(s.type === "polygon_regular") return tx("{n} côtés, {ff} m entre côtés", { n: g("n_sides"), ff: g("flat_to_flat") });
  if(s.type === "polygon_free") return tx("{type}, {n} points", { type: t, n: s.points.length });
  return tx("{type}, {n} bras de {w} m", { type: t, n: s.angles.length, w: g("width") });
}

function numField(i, f, label, unit, val, o){
  o = o || {};
  return "<div class='field'><label for='f-" + i + "-" + f + "'>" + label + "</label><div class='row'>" +
    "<input type='text' inputmode='decimal' autocomplete='off' data-num" + (o.neg ? " data-neg" : "") + (o.int ? " data-int" : "") +
    " id='f-" + i + "-" + f + "' data-i='" + i + "' data-f='" + f + "' value='" + esc(val) + "'>" +
    "<span class='unit'>" + unit + "</span></div></div>";
}

function bodyHtml(s, i){
  var h = "", j;
  if(s.type === "support"){
    h += "<div class='field'><span class='lab'>" + tx("Mode") + "</span><p class='lockhint'>" + tx("Un support retire toujours de la matière.") + "</p></div>";
  } else {
    h += "<div class='field'><span class='lab'>" + tx("Mode") + "</span><div class='modeseg'>" +
      "<button type='button' data-act='mode' data-m='add' data-i='" + i + "' class='add" + (s.mode === "add" ? " on" : "") + "'>" + tx("Ajouter") + "</button>" +
      "<button type='button' data-act='mode' data-m='subtract' data-i='" + i + "' class='sub" + (s.mode === "subtract" ? " on" : "") + "'>" + tx("Retirer") + "</button></div></div>";
  }
  if(s.type === "circle"){
    h += numField(i, "diameter", tx("Diamètre"), "m", s.diameter);
  } else if(s.type === "rectangle"){
    h += "<div class='grid2'>" + numField(i, "width", tx("Largeur"), "m", s.width) + numField(i, "height", tx("Hauteur"), "m", s.height) + "</div>";
  } else if(s.type === "polygon_regular"){
    h += "<div class='grid2'>" + numField(i, "n_sides", tx("Nombre de côtés (3 à 12)"), "", s.n_sides, {int: true}) +
      numField(i, "flat_to_flat", tx("Distance entre côtés opposés"), "m", s.flat_to_flat) + "</div>";
  } else if(s.type === "support"){
    h += numField(i, "width", tx("Largeur d'un bras"), "m", s.width);
  }
  h += "<div class='grid2'>" + numField(i, "x", tx("Position X"), "m", s.x, {neg: true}) + numField(i, "y", tx("Position Y"), "m", s.y, {neg: true}) + "</div>";

  var rot = toNum(s.rot), rv = (rot !== undefined && rot >= -180 && rot <= 180) ? rot : 0;
  h += "<div class='field'><label for='f-" + i + "-rot'>" + tx("Rotation (cran de {c}°)", { c: state.cran }) + "</label><div class='row'>" +
    "<input type='text' inputmode='decimal' autocomplete='off' data-num data-neg id='f-" + i + "-rot' data-i='" + i + "' data-f='rot' value='" + esc(s.rot) + "'>" +
    "<span class='unit'>°</span>" +
    "<button type='button' class='ibtn' data-act='rotstep' data-d='-1' data-i='" + i + "' aria-label='" + txa("Un cran vers la droite") + "' title='" + txa("Un cran vers la droite") + "'>−</button>" +
    "<button type='button' class='ibtn' data-act='rotstep' data-d='1' data-i='" + i + "' aria-label='" + txa("Un cran vers la gauche") + "' title='" + txa("Un cran vers la gauche") + "'>+</button></div>" +
    "<input type='range' min='-180' max='180' step='" + state.cran + "' value='" + rv + "' data-i='" + i + "' data-f='rotslider' aria-label='" + txa("Rotation de la forme") + "'></div>";

  if(s.type === "polygon_free"){
    h += "<div class='field'><span class='lab'>" + tx("Points du contour, avant rotation et translation (m)") + "</span><div class='rowlist'>";
    for(j = 0; j < s.points.length; j++){
      h += "<div class='prow'><span class='pidx'>" + (j + 1) + "</span>" +
        "<input type='text' inputmode='decimal' autocomplete='off' data-num data-neg data-i='" + i + "' data-f='pt' data-j='" + j + "' data-c='x' value='" + esc(s.points[j].x) + "' aria-label='" + txa("Point {n}, X", { n: j + 1 }) + "'>" +
        "<input type='text' inputmode='decimal' autocomplete='off' data-num data-neg data-i='" + i + "' data-f='pt' data-j='" + j + "' data-c='y' value='" + esc(s.points[j].y) + "' aria-label='" + txa("Point {n}, Y", { n: j + 1 }) + "'>" +
        "<button type='button' class='ibtn danger' data-act='ptdel' data-i='" + i + "' data-j='" + j + "' aria-label='" + txa("Supprimer ce point") + "'>×</button></div>";
    }
    h += "</div><div class='btnrow'><button type='button' class='btn' data-act='ptadd' data-i='" + i + "'" + (s.points.length >= MAXP ? " disabled" : "") + ">" + tx("+ Ajouter un point") + "</button>" +
      "<button type='button' class='btn' data-act='draw' data-i='" + i + "'>" + tx("Tracer à la souris") + "</button>" +
      "<button type='button' class='btn' data-act='recenter' data-i='" + i + "'>" + tx("Centrer le pivot") + "</button></div>" +
      "<p class='hint' style='margin:8px 0 0'>" + tx("La rotation se fait autour de l'origine des points. Tracée à la souris, la forme a son pivot en son centre ; « Centrer le pivot » le replace au centre d'une forme saisie à la main, sans la déplacer. Le contour ne doit pas se croiser.") + "</p></div>";
  }
  if(s.type === "support"){
    h += "<div class='field'><span class='lab'>" + tx("Direction des bras (degrés, 0° vers +X, sens trigonométrique)") + "</span><div class='rowlist'>";
    for(j = 0; j < s.angles.length; j++){
      h += "<div class='prow'><span class='pidx'>" + (j + 1) + "</span>" +
        "<input type='text' inputmode='decimal' autocomplete='off' data-num data-neg data-i='" + i + "' data-f='arm' data-j='" + j + "' value='" + esc(s.angles[j]) + "' aria-label='" + txa("Direction du bras {n}", { n: j + 1 }) + "'>" +
        "<span class='unit'>°</span>" +
        "<button type='button' class='ibtn danger' data-act='armdel' data-i='" + i + "' data-j='" + j + "' aria-label='" + txa("Supprimer ce bras") + "'>×</button></div>";
    }
    h += "</div><button type='button' class='btn' data-act='armadd' data-i='" + i + "'" + (s.angles.length >= MAXA ? " disabled" : "") + ">" + tx("+ Ajouter un bras") + "</button>" +
      "<div class='spread'>" + tx("Répartir") + " <input type='text' inputmode='numeric' data-num data-int id='sp-n-" + i + "' value='3' aria-label='" + txa("Nombre de bras") + "'> " + tx("bras à partir de") + " " +
      "<input type='text' inputmode='decimal' data-num data-neg id='sp-a-" + i + "' value='-90' aria-label='" + txa("Premier angle") + "'> ° " +
      "<button type='button' class='btn' data-act='spread' data-i='" + i + "'>" + tx("Appliquer") + "</button></div></div>";
  }
  return h;
}

function cardHtml(s, i){
  var sel = (i === state.sel), n = state.shapes.length;
  return "<div class='scard" + (sel ? " sel" : "") + (s.mode === "subtract" ? " sub" : "") + "'>" +
    "<div class='shead' data-act='sel' data-i='" + i + "' role='button' tabindex='0' aria-expanded='" + sel + "'>" +
      "<span class='sidx'>" + (i + 1) + "</span>" +
      "<span class='stitle'><b id='ttl-" + i + "'>" + esc(summary(s)) + "</b><span class='smode'>" + (s.mode === "add" ? tx("ajoute") : tx("retire")) + "</span></span>" +
      "<span class='sbtns'>" +
        "<button type='button' class='ibtn' data-act='up' data-i='" + i + "' title='" + txa("Monter") + "' aria-label='" + txa("Monter dans la liste") + "'" + (i === 0 ? " disabled" : "") + ">▲</button>" +
        "<button type='button' class='ibtn' data-act='down' data-i='" + i + "' title='" + txa("Descendre") + "' aria-label='" + txa("Descendre dans la liste") + "'" + (i === n - 1 ? " disabled" : "") + ">▼</button>" +
        "<button type='button' class='ibtn' data-act='dup' data-i='" + i + "' title='" + txa("Dupliquer") + "' aria-label='" + txa("Dupliquer la forme") + "'" + (n >= MAXS ? " disabled" : "") + ">⧉</button>" +
        "<button type='button' class='ibtn danger' data-act='del' data-i='" + i + "' title='" + txa("Supprimer") + "' aria-label='" + txa("Supprimer la forme") + "'>×</button>" +
      "</span></div>" +
    "<p class='serr' id='err-" + i + "' hidden></p>" +
    (sel ? "<div class='sbody'>" + bodyHtml(s, i) + "</div>" : "") +
  "</div>";
}

function renderList(){
  var host = $("shapeList");
  if(!state.shapes.length){ host.innerHTML = "<p class='empty'>" + tx("Aucune forme. Ajoutez-en une avec les boutons ci-dessus.") + "</p>"; }
  else host.innerHTML = state.shapes.map(cardHtml).join("");
  $("shapeCount").textContent = state.shapes.length + " / " + MAXS;
  var add = root.querySelectorAll("#addBtns .btn");
  for(var k = 0; k < add.length; k++) add[k].disabled = state.shapes.length >= MAXS;
}

function select(i){
  state.sel = i;
  renderList();
  refresh();
  if(i >= 0){
    var head = root.querySelector(".shead[data-i='" + i + "']");
    if(head && head.scrollIntoView) head.scrollIntoView({ block: "nearest" });
  }
}

function snapRot(cur, dir){
  var c = state.cran, q = cur / c, n;
  if(dir > 0) n = Math.floor(q + 1e-9) + 1; else n = Math.ceil(q - 1e-9) - 1;
  var v = n * c;
  while(v > 180) v -= 360;
  while(v <= -180) v += 360;
  return v;
}

function addShape(type){
  if(state.shapes.length >= MAXS) return;
  state.shapes.push(newShape(type));
  select(state.shapes.length - 1);
}
function loadShapes(shapes, noConfirm){
  if(!noConfirm && state.shapes.length && !confirm(tx("Remplacer les formes actuelles par cet exemple ?"))) return;
  state.shapes = shapes; state.sel = -1; state.serverGrid = null;
  renderList(); refresh();
}

// ===================== Calcul et affichage =====================
function stripIdx(msg){ return trGeo(msg).replace(/^(Forme|Shape) 2 ?: /, "").replace(/^./, function(c){ return c.toUpperCase(); }); }
var DUMMY = { type: "circle", mode: "add", diameter: 1 };

function maxDistFrom(verts, x, y){
  var d = 0;
  verts.forEach(function(p){ var q = Math.hypot(p[0] - x, p[1] - y); if(q > d) d = q; });
  return d;
}

function refresh(){
  var block = buildBlock(), n = state.shapes.length, i, outlines = [], errs = [], addVerts = [], res = null, gerr = "";

  // Chaque forme est validée seule (avec une forme « ajouter » fictive devant elle), puis dessinée seule.
  // Les supports passent en second : leur longueur dépend des formes ajoutées.
  function oneShape(k){
    var obj = block.shapes[k];
    var c = NysaPupil.validate({ shapes: [DUMMY, obj] }).shapes[1];
    return { c: c, g: NysaPupil.shapeGeometry(c) };
  }
  for(i = 0; i < n; i++){
    if(state.shapes[i].type === "support") continue;
    try{
      var o = oneShape(i);
      outlines[i] = o.g;
      if(o.c.mode === "add") o.g.forEach(function(poly){ poly[0].forEach(function(p){ addVerts.push(p); }); });
    }catch(e){ errs[i] = stripIdx(e.message); }
  }
  for(i = 0; i < n; i++){
    if(state.shapes[i].type !== "support") continue;
    try{
      var c0 = NysaPupil.validate({ shapes: [DUMMY, block.shapes[i]] }).shapes[1];
      var L = addVerts.length ? 1.05 * maxDistFrom(addVerts, c0.x, c0.y) + 0.01 : 1;
      outlines[i] = NysaPupil.shapeGeometry(c0, L);
    }catch(e2){ errs[i] = stripIdx(e2.message); }
  }

  var anyErr = errs.some(function(x){ return !!x; });
  try{ res = NysaPupil.geometry(block); }catch(e3){ gerr = trGeo(e3.message); }
  lastRes = res; lastOutlines = outlines;
  if(state.draw && !state.shapes[state.draw.i]){ state.draw = null; }

  for(i = 0; i < n; i++){
    var er = $("err-" + i), tt = $("ttl-" + i);
    if(tt) tt.textContent = summary(state.shapes[i]);
    if(er){ er.textContent = errs[i] || ""; er.hidden = !errs[i]; }
  }
  renderValues(res, anyErr ? tx("Corrigez les formes signalées dans la liste.") : gerr, n);
  renderPreview(res, outlines);
  updateJson(block);
  updateDrawBar();
  $("peApply").disabled = !res;
}

function renderValues(res, gerr, n){
  var vals = $("vals"), g = $("gerr");
  if(res){
    var inf = res.info, adds = 0, subs = 0;
    inf.clean.shapes.forEach(function(c){ if(c.mode === "add") adds++; else subs++; });
    vals.innerHTML =
      "<div class='val'><div class='k'>" + tx("Surface") + "</div><div class='v'>" + fmtL(inf.area_m2) + " <small>m²</small></div></div>" +
      "<div class='val'><div class='k'>D_small</div><div class='v'>" + fmtL(inf.D_small) + " <small>m</small></div></div>" +
      "<div class='val'><div class='k'>D_large</div><div class='v'>" + fmtL(inf.D_large) + " <small>m</small></div></div>" +
      "<div class='val'><div class='k'>" + tx("Ø équivalent (surface)") + "</div><div class='v'>" + fmtL(Math.sqrt(4 * inf.area_m2 / Math.PI)) + " <small>m</small></div></div>" +
      "<div class='val'><div class='k'>" + tx("Étendue") + "</div><div class='v'>" + fmtL(2 * inf.half_side_m) + " <small>m</small></div></div>" +
      "<div class='val'><div class='k'>" + tx("Formes") + "</div><div class='v'>" + n + " <small>" + tx("({a} ajoutées, {s} retirées)", { a: adds, s: subs }) + "</small></div></div>";
    g.hidden = true;
  } else {
    vals.innerHTML = "";
    g.textContent = gerr || tx("Pupille invalide.");
    g.hidden = false;
  }
}

// ---------- aperçu SVG ----------
function niceStep(raw){
  var steps = [0.001, 0.002, 0.005, 0.01, 0.02, 0.05, 0.1, 0.2, 0.5, 1, 2, 5, 10];
  for(var k = 0; k < steps.length; k++) if(steps[k] >= raw) return steps[k];
  return 10;
}
function scanExtent(g, acc){
  g.forEach(function(poly){ poly[0].forEach(function(p){
    var m = Math.max(Math.abs(p[0]), Math.abs(p[1])); if(m > acc.v) acc.v = m;
  }); });
}

function renderPreview(res, outlines){
  var S = 600, C = 300, i, n = state.shapes.length;

  var half;
  if(state.view !== "auto") half = Number(state.view);
  else {
    var acc = { v: 0 };
    outlines.forEach(function(g, k){ if(g && state.shapes[k].type !== "support") scanExtent(g, acc); });
    if(res) scanExtent(res.geom, acc);
    if(acc.v === 0) outlines.forEach(function(g){ if(g) scanExtent(g, acc); });
    half = Math.max(acc.v * 1.18, 0.02);
  }
  var k0 = C / half;
  function X(x){ return (C + x * k0).toFixed(1); }
  function Y(y){ return (C - y * k0).toFixed(1); }
  function ringPath(r){ return "M" + r.map(function(p){ return X(p[0]) + "," + Y(p[1]); }).join("L") + "Z"; }
  function multiPath(m){ return m.map(function(poly){ return poly.map(ringPath).join(""); }).join(""); }

  var step = state.grid === "auto" ? niceStep(2 * half / 10) : Number(state.grid), note = "";
  if(2 * half / step > 80){ var bigger = niceStep(2 * half / 10); note = tx("Grille agrandie à {s} m pour rester lisible.", { s: fmtL(bigger) }); step = bigger; }
  $("gridNote").textContent = note; $("gridNote").hidden = !note;

  var grid = "<g stroke='var(--line-soft)' stroke-width='1'>", nMin = Math.ceil(-half / step - 1e-9), nMax = Math.floor(half / step + 1e-9), q, v;
  var labEvery = Math.max(1, Math.ceil(46 / (step * k0))), labels = "";
  for(q = nMin; q <= nMax; q++){
    v = q * step;
    if(q !== 0) grid += "<line x1='" + X(v) + "' y1='0' x2='" + X(v) + "' y2='" + S + "'/><line x1='0' y1='" + Y(v) + "' x2='" + S + "' y2='" + Y(v) + "'/>";
    if(q !== 0 && q % labEvery === 0 && Number(X(v)) > 26 && Number(X(v)) < S - 26){
      var lab = nf(String(Number(v.toPrecision(6))));
      labels += "<text x='" + X(v) + "' y='" + (S - 6) + "' text-anchor='middle'>" + lab + "</text>" +
                "<text x='5' y='" + (Number(Y(v)) + 3.5).toFixed(1) + "'>" + lab + "</text>";
    }
  }
  grid += "</g><g stroke='var(--line)' stroke-width='1.2'><line x1='" + C + "' y1='0' x2='" + C + "' y2='" + S + "'/><line x1='0' y1='" + C + "' x2='" + S + "' y2='" + C + "'/></g>";
  labels = "<g font-family='var(--mono)' font-size='10.5' fill='var(--muted-2)'>" + labels +
    "<text x='" + (S - 6) + "' y='" + (C - 7) + "' text-anchor='end' fill='var(--muted)'>X (m)</text>" +
    "<text x='" + (C + 7) + "' y='14' fill='var(--muted)'>Y (m)</text></g>";

  var fill = res ? "<path d='" + multiPath(res.geom) + "' fill='var(--pixel)' fill-opacity='.24' fill-rule='evenodd' stroke='var(--pixel)' stroke-width='1.5' stroke-linejoin='round'/>" : "";

  var lines = "", selLine = "", marks = "";
  for(i = 0; i < n; i++){
    var g = outlines[i], s = state.shapes[i];
    if(!g) continue;
    var sub = s.mode === "subtract", isSel = (i === state.sel);
    var colr = sub ? "var(--alert)" : "var(--add)";
    var path = "<path d='" + multiPath(g) + "' fill='" + (isSel ? (sub ? "rgba(240,119,109,.08)" : "rgba(106,169,255,.08)") : "none") + "' stroke='" + colr + "' stroke-width='" + (isSel ? 2.4 : 1.1) + "'" + (sub ? " stroke-dasharray='6 4'" : "") + " stroke-linejoin='round' fill-rule='evenodd'/>";
    if(isSel) selLine += path; else lines += path;
    var cx = toNum(s.x), cy = toNum(s.y);
    if(cx === undefined) cx = 0;
    if(cy === undefined) cy = 0;
    if(isSel){
      marks += "<g stroke='var(--paper)' stroke-width='1.4'><line x1='" + (Number(X(cx)) - 6) + "' y1='" + Y(cy) + "' x2='" + (Number(X(cx)) + 6) + "' y2='" + Y(cy) + "'/><line x1='" + X(cx) + "' y1='" + (Number(Y(cy)) - 6) + "' x2='" + X(cx) + "' y2='" + (Number(Y(cy)) + 6) + "'/></g>";
    }
    if(n <= 40 || isSel){
      marks += "<text x='" + (Number(X(cx)) + 7) + "' y='" + (Number(Y(cy)) - 6) + "' font-family='var(--mono)' font-size='" + (isSel ? 13 : 11) + "' fill='" + (isSel ? "var(--paper)" : "var(--muted-2)") + "'>" + (i + 1) + "</text>";
    }
  }

  var barLen = niceStep(half * 0.45), barPx = barLen * k0;
  var bar = "<g stroke='var(--paper)' stroke-width='2'><line x1='30' y1='" + (S - 26) + "' x2='" + (30 + barPx).toFixed(1) + "' y2='" + (S - 26) + "'/><line x1='30' y1='" + (S - 31) + "' x2='30' y2='" + (S - 21) + "'/><line x1='" + (30 + barPx).toFixed(1) + "' y1='" + (S - 31) + "' x2='" + (30 + barPx).toFixed(1) + "' y2='" + (S - 21) + "'/></g>" +
    "<text x='" + (30 + barPx / 2).toFixed(1) + "' y='" + (S - 34) + "' text-anchor='middle' font-family='var(--mono)' font-size='11.5' fill='var(--paper)'>" + fmtL(barLen) + " m</text>";
  var extent = "<text x='" + (S - 6) + "' y='14' text-anchor='end' font-family='var(--mono)' font-size='11' fill='var(--muted-2)'>" + tx("vue ± {h} m", { h: fmtL(half) }) + "</text>";

  view = { S: S, C: C, k: k0, half: half, step: step, handle: null };
  var over = "", ss = state.shapes[state.sel];
  if(!state.draw && ss && outlines[state.sel]){
    var hx = toNum(ss.x) || 0, hy = toNum(ss.y) || 0, th = (toNum(ss.rot) || 0) * Math.PI / 180, dm = 0;
    outlines[state.sel].forEach(function(poly){ poly[0].forEach(function(p){ var qd = Math.hypot(p[0] - hx, p[1] - hy); if(qd > dm) dm = qd; }); });
    var Rpx = Math.max(46, Math.min(dm * k0 + 18, 210)), cxp = Number(X(hx)), cyp = Number(Y(hy));
    var hxp = cxp + Rpx * Math.cos(th), hyp = cyp - Rpx * Math.sin(th);
    var hcol = ss.mode === "subtract" ? "var(--alert)" : "var(--add)";
    view.handle = { px: hxp, py: hyp };
    over += "<line x1='" + cxp + "' y1='" + cyp + "' x2='" + hxp.toFixed(1) + "' y2='" + hyp.toFixed(1) + "' stroke='" + hcol + "' stroke-width='1.4' stroke-dasharray='3 3'/>" +
      "<circle cx='" + hxp.toFixed(1) + "' cy='" + hyp.toFixed(1) + "' r='8' fill='var(--void)' stroke='" + hcol + "' stroke-width='2.4'/>" +
      "<circle cx='" + hxp.toFixed(1) + "' cy='" + hyp.toFixed(1) + "' r='2.6' fill='" + hcol + "'/>" +
      "<text x='" + (hxp + 12).toFixed(1) + "' y='" + (hyp + 4).toFixed(1) + "' font-family='var(--mono)' font-size='12' fill='" + hcol + "'>" + fmtL(toNum(ss.rot) || 0) + "°</text>";
  }
  if(state.draw){
    var dp = state.draw.pts, poly = dp.map(function(p){ return X(p.x) + "," + Y(p.y); });
    if(dp.length){
      over += "<polyline points='" + poly.join(" ") + (state.draw.cursor ? " " + X(state.draw.cursor.x) + "," + Y(state.draw.cursor.y) : "") + "' fill='none' stroke='var(--photon)' stroke-width='2' stroke-dasharray='5 3'/>";
      if(state.draw.cursor && dp.length >= 2){ over += "<line x1='" + X(state.draw.cursor.x) + "' y1='" + Y(state.draw.cursor.y) + "' x2='" + X(dp[0].x) + "' y2='" + Y(dp[0].y) + "' stroke='var(--photon)' stroke-width='1' stroke-dasharray='2 4' opacity='.6'/>"; }
    }
    dp.forEach(function(p, k){ over += "<circle cx='" + X(p.x) + "' cy='" + Y(p.y) + "' r='" + (k === 0 ? 8 : 4.5) + "' fill='" + (k === 0 ? "none" : "var(--photon)") + "' stroke='var(--photon)' stroke-width='2'/>"; });
    if(state.draw.cursor){ over += "<circle cx='" + X(state.draw.cursor.x) + "' cy='" + Y(state.draw.cursor.y) + "' r='3' fill='var(--paper)'/>"; }
  }

  $("preview").innerHTML =
    "<svg viewBox='0 0 " + S + " " + S + "' xmlns='http://www.w3.org/2000/svg' role='img' aria-label='" + txa("Aperçu de la pupille") + "'>" +
      "<rect width='" + S + "' height='" + S + "' fill='var(--void)'/>" +
      grid + fill + lines + selLine + marks + labels + bar + extent + over +
    "</svg>";
}

// ---------- JSON ----------
function jsonText(block){
  return JSON.stringify(block, function(k, v){ return (typeof v === "number" && !isFinite(v)) ? null : v; }, 2);
}
function updateJson(block){
  var ta = $("json");
  if(document.activeElement !== ta) ta.value = jsonText(block);
}

// ===================== Souris sur l'aperçu =====================
function scheduleRefresh(){ if(raf) return; raf = requestAnimationFrame(function(){ raf = 0; if(root) refresh(); }); }
function worldFromEvent(e){
  var svg = $("preview").querySelector("svg");
  if(!svg || !view) return null;
  var m = svg.getScreenCTM();
  if(!m) return null;
  var pt = svg.createSVGPoint(); pt.x = e.clientX; pt.y = e.clientY;
  var q = pt.matrixTransform(m.inverse());
  return { px: q.x, py: q.y, x: (q.x - view.C) / view.k, y: (view.C - q.y) / view.k };
}
function snapOn(e){ return state.snap === "grid" && !e.altKey; }
function snapV(v, e){ return snapOn(e) ? Math.round(v / view.step) * view.step : v; }
function coordStr(v){ return numStr(Number(v.toFixed(6))); }

function inRing(ring, x, y){
  var inside = false, n = ring.length, i, j = n - 1;
  for(i = 0; i < n; j = i++){
    var a = ring[i], b = ring[j];
    if(((a[1] > y) !== (b[1] > y)) && (x < (b[0] - a[0]) * (y - a[1]) / (b[1] - a[1]) + a[0])) inside = !inside;
  }
  return inside;
}
function inMulti(multi, x, y){
  return multi.some(function(poly){
    if(!inRing(poly[0], x, y)) return false;
    for(var h = 1; h < poly.length; h++) if(inRing(poly[h], x, y)) return false;
    return true;
  });
}
function hitShape(x, y){
  var s = state.sel;
  if(s >= 0 && lastOutlines[s] && inMulti(lastOutlines[s], x, y)) return s;
  for(var i = state.shapes.length - 1; i >= 0; i--) if(lastOutlines[i] && inMulti(lastOutlines[i], x, y)) return i;
  return -1;
}
function onHandle(w){ return view && view.handle && Math.hypot(w.px - view.handle.px, w.py - view.handle.py) <= 13; }

function setField(i, f, val){
  var el = $("f-" + i + "-" + f);
  if(el) el.value = val;
  if(f === "rot"){
    var sl = root.querySelector("#shapeList input[type=range][data-i='" + i + "']"), v = toNum(val);
    if(sl && v !== undefined && v >= -180 && v <= 180) sl.value = v;
  }
}

function endDrag(){
  if(!drag) return;
  var prev = $("preview");
  try{ prev.releasePointerCapture(drag.pid); }catch(_){}
  drag = null;
  prev.style.cursor = "default";
}
function cancelDrag(){
  if(!drag) return;
  var s = state.shapes[drag.i];
  if(s){
    if(drag.kind === "move"){ s.x = drag.sx0; s.y = drag.sy0; setField(drag.i, "x", s.x); setField(drag.i, "y", s.y); }
    else { s.rot = drag.rot0; setField(drag.i, "rot", s.rot); }
  }
  try{ $("preview").releasePointerCapture(drag.pid); }catch(_){}
  drag = null;
  refresh();
}

// Centre d'une forme polygonale (centre de gravité de sa surface ; à défaut, moyenne des sommets).
function centroid(pts){
  var a = 0, cx = 0, cy = 0, n = pts.length, i, p, q, f;
  for(i = 0; i < n; i++){
    p = pts[i]; q = pts[(i + 1) % n];
    f = p.x * q.y - q.x * p.y;
    a += f; cx += (p.x + q.x) * f; cy += (p.y + q.y) * f;
  }
  if(Math.abs(a) < 1e-18){
    cx = 0; cy = 0;
    pts.forEach(function(r){ cx += r.x; cy += r.y; });
    return { x: cx / n, y: cy / n };
  }
  return { x: cx / (3 * a), y: cy / (3 * a) };
}
function recenterShape(i){
  var s = state.shapes[i];
  if(!s || s.type !== "polygon_free") return;
  var pts = s.points.map(function(p){ return { x: toNum(p.x), y: toNum(p.y) }; });
  if(pts.length < 3 || pts.some(function(p){ return p.x === undefined || p.y === undefined; })) return;
  var c = centroid(pts), r = (toNum(s.rot) || 0) * Math.PI / 180, co = Math.cos(r), si = Math.sin(r);
  s.points = pts.map(function(p){ return { x: numStr(Number((p.x - c.x).toFixed(9))), y: numStr(Number((p.y - c.y).toFixed(9))) }; });
  s.x = numStr(Number(((toNum(s.x) || 0) + c.x * co - c.y * si).toFixed(9)));
  s.y = numStr(Number(((toNum(s.y) || 0) + c.x * si + c.y * co).toFixed(9)));
}

// ---------- tracé d'un polygone libre ----------
function startDraw(i){
  if(state.sel !== i) select(i);
  state.draw = { i: i, pts: [], cursor: null };
  refresh();
}
function addDrawPoint(w, e){
  var d = state.draw, sx = snapV(w.x, e), sy = snapV(w.y, e);
  if(d.pts.length >= 3 && Math.hypot(w.px - (view.C + d.pts[0].x * view.k), w.py - (view.C - d.pts[0].y * view.k)) <= 12){ commitDraw(); return; }
  if(d.pts.length >= MAXP) return;
  var last = d.pts[d.pts.length - 1];
  if(last && Math.abs(last.x - sx) < 1e-12 && Math.abs(last.y - sy) < 1e-12) return;
  d.pts.push({ x: sx, y: sy });
  d.cursor = { x: sx, y: sy };
  refresh();
}
function commitDraw(){
  var d = state.draw;
  if(!d || d.pts.length < 3) return;
  var s = state.shapes[d.i];
  if(!s){ state.draw = null; refresh(); return; }
  // Le pivot de la forme est placé au centre de la forme tracée ; les points deviennent relatifs à ce centre, avant rotation.
  var c = centroid(d.pts), r = (toNum(s.rot) || 0) * Math.PI / 180, co = Math.cos(r), si = Math.sin(r);
  s.x = numStr(Number(c.x.toFixed(9))); s.y = numStr(Number(c.y.toFixed(9)));
  s.points = d.pts.map(function(p){
    var dx = p.x - c.x, dy = p.y - c.y;
    return { x: numStr(Number((dx * co + dy * si).toFixed(9))), y: numStr(Number((-dx * si + dy * co).toFixed(9))) };
  });
  state.draw = null;
  renderList(); refresh();
}
function cancelDraw(){ state.draw = null; renderList(); refresh(); }
function updateDrawBar(){
  var bar = $("drawBar");
  if(!state.draw){ bar.hidden = true; return; }
  var n = state.draw.pts.length;
  $("drawMsg").textContent = tx("Tracé du polygone libre {i} : {n} point(s).", { i: state.draw.i + 1, n: n }) + " " +
    (n < 3 ? tx("Cliquez pour poser les points.") : tx("Cliquez sur le premier point (cercle) ou sur Terminer pour fermer.")) + " " + tx("Retour arrière : retire le dernier point.");
  $("btnDrawEnd").disabled = n < 3;
  bar.hidden = false;
}

// ===================== Fenêtre =====================
function optionsGrid(){
  var v = [["0.001", "1 mm"], ["0.002", "2 mm"], ["0.005", "5 mm"], ["0.01", "1 cm"], ["0.02", "2 cm"], ["0.05", "5 cm"],
    ["0.1", "10 cm"], ["0.2", "20 cm"], ["0.5", "50 cm"], ["1", "1 m"], ["2", "2 m"], ["5", "5 m"]];
  return "<option value='auto' selected>" + tx("Automatique") + "</option>" + v.map(function(o){ return "<option value='" + o[0] + "'>" + o[1] + "</option>"; }).join("");
}
function optionsView(){
  var v = ["0.05", "0.1", "0.2", "0.5", "1", "2", "5", "10", "25"];
  return "<option value='auto' selected>" + tx("Automatique") + "</option>" + v.map(function(o){ return "<option value='" + o + "'>" + nf(o) + " m</option>"; }).join("");
}

function modalHtml(){
  return "" +
  "<div class='pe-top'>" +
    "<h2 id='peTitle'>" + tx("Éditeur de pupille libre") + "</h2>" +
    "<div class='pe-topbtns'>" +
      "<button class='btn' type='button' id='peCancel'>" + tx("Annuler") + "</button>" +
      "<button class='btn primary' type='button' id='peApply'>" + tx("Appliquer à l'instrument") + "</button>" +
    "</div>" +
  "</div>" +
  "<div class='pe-scroll'><div class='pe-wrap'><div class='layout'>" +
    "<div class='leftcol'>" +
      "<div class='card'>" +
        "<p class='subhead'><span class='dot'></span><span>" + tx("Ajouter une forme") + "</span></p>" +
        "<div class='btnrow' id='addBtns'>" +
          "<button class='btn' type='button' data-add='circle'>" + tx("+ Cercle") + "</button>" +
          "<button class='btn' type='button' data-add='rectangle'>" + tx("+ Rectangle") + "</button>" +
          "<button class='btn' type='button' data-add='polygon_regular'>" + tx("+ Polygone régulier") + "</button>" +
          "<button class='btn' type='button' data-add='polygon_free'>" + tx("+ Polygone libre") + "</button>" +
          "<button class='btn' type='button' data-add='support'>" + tx("+ Supports") + "</button>" +
        "</div>" +
        "<p class='hint' style='margin-top:12px'>" + tx("Les formes s'appliquent dans l'ordre de la liste : « Ajouter » réunit, « Retirer » découpe. Un support retire toujours de la matière.") + "</p>" +
        "<div class='btnrow'>" +
          "<button class='btn' type='button' data-example='circ'>" + tx("Exemple : cercle, obscuration, 3 supports") + "</button>" +
          "<button class='btn' type='button' data-example='webb'>" + tx("Exemple : 18 hexagones") + "</button>" +
          "<button class='btn' type='button' data-example='clear'>" + tx("Tout effacer") + "</button>" +
        "</div>" +
      "</div>" +
      "<div class='card'>" +
        "<p class='subhead'><span class='dot'></span><span>" + tx("Formes") + "</span><span class='count' id='shapeCount'></span></p>" +
        "<div id='shapeList'></div>" +
      "</div>" +
    "</div>" +
    "<div class='rightcol'>" +
      "<div class='card'>" +
        "<p class='subhead'><span class='dot'></span><span>" + tx("Aperçu de la pupille") + "</span></p>" +
        "<div class='ctrlrow'>" +
          "<div class='c'><label for='selCran'>" + tx("Cran de rotation") + "</label><select id='selCran'>" +
            "<option value='1'>1°</option><option value='5'>5°</option><option value='15' selected>15°</option><option value='30'>30°</option><option value='60'>60°</option></select></div>" +
          "<div class='c'><label for='selGrid'>" + tx("Pas de grille") + "</label><select id='selGrid'>" + optionsGrid() + "</select></div>" +
          "<div class='c'><label for='selSnap'>" + tx("Aimantation") + "</label><select id='selSnap'>" +
            "<option value='grid' selected>" + tx("Sur la grille") + "</option><option value='none'>" + tx("Aucune") + "</option></select></div>" +
          "<div class='c'><label for='selView'>" + tx("Demi-largeur de la vue") + "</label><select id='selView'>" + optionsView() + "</select></div>" +
        "</div>" +
        "<div class='drawbar' id='drawBar' hidden><span id='drawMsg'></span>" +
          "<button class='btn primary' type='button' id='btnDrawEnd'>" + tx("Terminer") + "</button>" +
          "<button class='btn' type='button' id='btnDrawCancel'>" + tx("Annuler") + "</button></div>" +
        "<div class='previewbox' id='preview'></div>" +
        "<div class='legend'><span><i class='lres'></i>" + tx("pupille obtenue") + "</span><span><i class='ladd'></i>" + tx("forme ajoutée") + "</span><span><i class='lsub'></i>" + tx("forme retirée") + "</span></div>" +
        "<p class='gridnote' id='gridNote' hidden></p>" +
        "<p class='mousehint'>" + tx("Souris : glisser une forme pour la déplacer, glisser la poignée ronde pour la tourner (par crans). Alt maintenu : sans aimantation. Échap : annuler le geste en cours.") + "</p>" +
      "</div>" +
      "<div class='card'>" +
        "<p class='subhead'><span class='dot'></span><span>" + tx("Valeurs calculées") + "</span></p>" +
        "<div class='vals' id='vals'></div>" +
        "<p class='gerr' id='gerr' hidden></p>" +
        "<p class='gok'>" + tx("D_small est la plus petite largeur de la pupille (enveloppe convexe). D_large est le diamètre du plus petit cercle qui l'englobe. La surface est exacte.") + "</p>" +
      "</div>" +
      "<details class='card pe-json'>" +
        "<summary class='subhead' style='cursor:pointer;margin:0'><span class='dot'></span><span>" + tx("Importer ou exporter (JSON)") + "</span></summary>" +
        "<p class='hint' style='margin-top:12px'>" + tx("Le bloc qui sera envoyé au serveur. Vous pouvez aussi y coller une pupille (par exemple celle d'un fichier de test) puis cliquer sur « Appliquer le JSON ».") + "</p>" +
        "<textarea id='json' spellcheck='false'></textarea>" +
        "<div class='btnrow' style='margin-top:10px'>" +
          "<button class='btn primary' type='button' id='btnJsonApply'>" + tx("Appliquer le JSON") + "</button>" +
          "<button class='btn' type='button' id='btnCopy'>" + tx("Copier") + "</button></div>" +
        "<p class='jmsg' id='jmsg'></p>" +
      "</details>" +
    "</div>" +
  "</div></div></div>";
}

function onKey(e){
  if(!root) return;
  var typing = e.target && e.target.matches && e.target.matches("input,textarea,select");
  if(e.key === "Escape"){
    if(drag) { cancelDrag(); e.stopPropagation(); }
    else if(state.draw){ cancelDraw(); e.stopPropagation(); }
  } else if(state.draw && e.key === "Enter" && !typing){
    e.preventDefault(); commitDraw();
  } else if(state.draw && e.key === "Backspace" && !typing){
    e.preventDefault(); state.draw.pts.pop(); refresh();
  }
}

function wire(){
  var listEl = $("shapeList"), prev = $("preview");
  listEl.addEventListener("input", filterNumeric, true);
  listEl.addEventListener("input", function(e){
    var el = e.target, f = el.getAttribute && el.getAttribute("data-f");
    if(!f) return;
    var i = Number(el.getAttribute("data-i")), s = state.shapes[i];
    if(!s) return;
    if(f === "pt") s.points[Number(el.getAttribute("data-j"))][el.getAttribute("data-c")] = el.value;
    else if(f === "arm") s.angles[Number(el.getAttribute("data-j"))] = el.value;
    else if(f === "rotslider"){ s.rot = String(Number(el.value)); var t = $("f-" + i + "-rot"); if(t) t.value = s.rot; }
    else {
      s[f] = el.value;
      if(f === "rot"){
        var sl = listEl.querySelector("input[type=range][data-i='" + i + "']"), v = toNum(el.value);
        if(sl && v !== undefined && v >= -180 && v <= 180) sl.value = v;
      }
    }
    refresh();
  });
  listEl.addEventListener("click", function(e){
    var el = e.target.closest ? e.target.closest("[data-act]") : null;
    if(!el) return;
    var act = el.getAttribute("data-act"), i = Number(el.getAttribute("data-i")), j = Number(el.getAttribute("data-j")), s = state.shapes[i];
    if(!s) return;
    var tmp, focusSel = null;
    if(act === "draw"){ startDraw(i); return; }
    if(act === "recenter"){ recenterShape(i); renderList(); refresh(); return; }
    if(state.draw){ state.draw = null; updateDrawBar(); }
    if(act === "sel"){ select(state.sel === i ? -1 : i); return; }
    if(act === "up" && i > 0){ tmp = state.shapes[i - 1]; state.shapes[i - 1] = s; state.shapes[i] = tmp; state.sel = (state.sel === i) ? i - 1 : (state.sel === i - 1 ? i : state.sel); }
    else if(act === "down" && i < state.shapes.length - 1){ tmp = state.shapes[i + 1]; state.shapes[i + 1] = s; state.shapes[i] = tmp; state.sel = (state.sel === i) ? i + 1 : (state.sel === i + 1 ? i : state.sel); }
    else if(act === "dup"){
      if(state.shapes.length >= MAXS) return;
      state.shapes.splice(i + 1, 0, JSON.parse(JSON.stringify(s)));
      state.sel = i + 1;
    }
    else if(act === "del"){
      state.shapes.splice(i, 1);
      if(state.sel === i) state.sel = -1; else if(state.sel > i) state.sel -= 1;
    }
    else if(act === "mode"){ s.mode = el.getAttribute("data-m"); }
    else if(act === "rotstep"){
      var cur = toNum(s.rot); if(cur === undefined) cur = 0;
      s.rot = numStr(snapRot(cur, Number(el.getAttribute("data-d"))));
    }
    else if(act === "ptadd"){
      if(s.points.length >= MAXP) return;
      var last = s.points[s.points.length - 1];
      s.points.push({ x: last ? last.x : "0", y: last ? last.y : "0" });
      focusSel = "input[data-f='pt'][data-i='" + i + "'][data-j='" + (s.points.length - 1) + "'][data-c='x']";
    }
    else if(act === "ptdel"){ s.points.splice(j, 1); }
    else if(act === "armadd"){
      if(s.angles.length >= MAXA) return;
      s.angles.push("0");
      focusSel = "input[data-f='arm'][data-i='" + i + "'][data-j='" + (s.angles.length - 1) + "']";
    }
    else if(act === "armdel"){ s.angles.splice(j, 1); }
    else if(act === "spread"){
      var n = toNum($("sp-n-" + i).value), a0 = toNum($("sp-a-" + i).value);
      if(n === undefined || n < 1) n = 1;
      n = Math.min(MAXA, Math.floor(n));
      if(a0 === undefined) a0 = 0;
      s.angles = [];
      for(var k = 0; k < n; k++) s.angles.push(numStr(a0 + 360 * k / n));
    }
    else return;
    renderList();
    refresh();
    if(focusSel){ var f = listEl.querySelector(focusSel); if(f){ f.focus(); f.select(); } }
  });
  listEl.addEventListener("keydown", function(e){
    if((e.key === "Enter" || e.key === " ") && e.target.getAttribute && e.target.getAttribute("data-act") === "sel"){
      e.preventDefault();
      var i = Number(e.target.getAttribute("data-i"));
      select(state.sel === i ? -1 : i);
    }
  });

  $("addBtns").addEventListener("click", function(e){
    var t = e.target.getAttribute && e.target.getAttribute("data-add");
    if(t) addShape(t);
  });
  root.querySelector("[data-example='circ']").addEventListener("click", function(){ loadShapes(exampleCirc()); });
  root.querySelector("[data-example='webb']").addEventListener("click", function(){ loadShapes(exampleWebb()); });
  root.querySelector("[data-example='clear']").addEventListener("click", function(){
    if(state.shapes.length && !confirm(tx("Effacer toutes les formes ?"))) return;
    loadShapes([], true);
  });
  $("selCran").addEventListener("change", function(e){ state.cran = Number(e.target.value); renderList(); refresh(); });
  $("selGrid").addEventListener("change", function(e){ state.grid = e.target.value; refresh(); });
  $("selView").addEventListener("change", function(e){ state.view = e.target.value; refresh(); });
  $("selSnap").addEventListener("change", function(e){ state.snap = e.target.value; });

  $("btnJsonApply").addEventListener("click", function(){
    var msg = $("jmsg");
    try{
      var data = JSON.parse($("json").value);
      if(data && !data.shapes && (data.pupil_free || data.pupilFree)) data = data.pupil_free || data.pupilFree;
      var clean = NysaPupil.validate(data);
      NysaPupil.geometry(clean);
      state.shapes = clean.shapes.map(fromBlockShape);
      state.serverGrid = clean.grid_step_m || null;
      state.sel = -1;
      renderList(); refresh();
      $("json").blur();
      $("json").value = jsonText(buildBlock());
      msg.style.color = "var(--ok)"; msg.textContent = tx("Pupille chargée : {n} forme(s).", { n: state.shapes.length });
    }catch(err){
      msg.style.color = "var(--alert)";
      msg.textContent = (err instanceof SyntaxError) ? tx("JSON illisible : {msg}", { msg: err.message }) : trGeo(err.message);
    }
  });
  $("btnCopy").addEventListener("click", function(){
    var ta = $("json"), msg = $("jmsg");
    function ok(){ msg.style.color = "var(--ok)"; msg.textContent = tx("Copié."); }
    if(navigator.clipboard && navigator.clipboard.writeText){
      navigator.clipboard.writeText(ta.value).then(ok, function(){ ta.select(); document.execCommand("copy"); ok(); });
    } else { ta.select(); document.execCommand("copy"); ok(); }
  });

  // souris sur l'aperçu : les événements sont posés sur le conteneur, qui ne change jamais (le SVG est refait à chaque mouvement)
  prev.addEventListener("pointerdown", function(e){
    if(e.button !== 0) return;
    var w = worldFromEvent(e);
    if(!w) return;
    if(state.draw){ addDrawPoint(w, e); return; }
    var i, s;
    if(onHandle(w)){
      i = state.sel; s = state.shapes[i];
      drag = { kind: "rot", i: i, rot0: s.rot, pid: e.pointerId };
    } else {
      i = hitShape(w.x, w.y);
      if(i < 0){ if(state.sel >= 0) select(-1); return; }
      if(i !== state.sel) select(i);
      s = state.shapes[i];
      drag = { kind: "move", i: i, x0: toNum(s.x) || 0, y0: toNum(s.y) || 0, sx0: s.x, sy0: s.y, w0: w, moved: false, pid: e.pointerId };
    }
    try{ prev.setPointerCapture(e.pointerId); }catch(_){}
    e.preventDefault();
  });
  prev.addEventListener("pointermove", function(e){
    var w = worldFromEvent(e);
    if(!w) return;
    if(state.draw){
      state.draw.cursor = { x: snapV(w.x, e), y: snapV(w.y, e) };
      prev.style.cursor = "crosshair";
      scheduleRefresh();
      return;
    }
    if(!drag){
      prev.style.cursor = onHandle(w) ? "grab" : (hitShape(w.x, w.y) >= 0 ? "move" : "default");
      return;
    }
    var s = state.shapes[drag.i];
    if(!s){ drag = null; return; }
    if(drag.kind === "move"){
      if(!drag.moved && Math.hypot(w.px - drag.w0.px, w.py - drag.w0.py) < 3) return;
      drag.moved = true;
      var nx = snapV(drag.x0 + (w.x - drag.w0.x), e), ny = snapV(drag.y0 + (w.y - drag.w0.y), e);
      s.x = coordStr(nx); s.y = coordStr(ny);
      setField(drag.i, "x", s.x); setField(drag.i, "y", s.y);
    } else {
      var cx = toNum(s.x) || 0, cy = toNum(s.y) || 0;
      var ang = Math.atan2(w.y - cy, w.x - cx) * 180 / Math.PI;
      if(!e.altKey) ang = Math.round(ang / state.cran) * state.cran;
      while(ang > 180) ang -= 360;
      while(ang <= -180) ang += 360;
      s.rot = coordStr(ang);
      setField(drag.i, "rot", s.rot);
    }
    scheduleRefresh();
  });
  prev.addEventListener("pointerup", endDrag);
  prev.addEventListener("pointercancel", endDrag);
  $("btnDrawEnd").addEventListener("click", commitDraw);
  $("btnDrawCancel").addEventListener("click", cancelDraw);

  $("peCancel").addEventListener("click", function(){
    if(jsonText(buildBlock()) !== initialJson && !confirm(tx("Fermer sans appliquer ? Les modifications de la pupille seront perdues."))) return;
    close();
  });
  $("peApply").addEventListener("click", function(){
    var clean;
    try{ clean = NysaPupil.validate(buildBlock()); NysaPupil.geometry(clean); }catch(err){ return; }
    var cb = opts && opts.onApply;
    close();
    if(cb) cb(clean);
  });
}

function close(){
  if(!root) return;
  if(raf){ cancelAnimationFrame(raf); raf = 0; }
  document.removeEventListener("keydown", onKey, true);
  root.remove(); root = null;
  document.body.style.overflow = prevOverflow || "";
  if(prevFocus && prevFocus.focus) try{ prevFocus.focus(); }catch(_){}
}

function open(o){
  if(root) return;
  opts = o || {};
  if(!document.getElementById("peStyle")){
    var st = document.createElement("style");
    st.id = "peStyle"; st.textContent = CSS;
    document.head.appendChild(st);
  }
  state = { shapes: [], sel: -1, cran: 15, grid: "auto", view: "auto", snap: "grid", serverGrid: null, draw: null };
  drag = null; view = null; lastRes = null; lastOutlines = []; raf = 0;
  var blk = opts.block;
  if(blk && blk.shapes && blk.shapes.length){
    try{
      var clean = NysaPupil.validate(blk);
      state.shapes = clean.shapes.map(fromBlockShape);
      state.serverGrid = clean.grid_step_m || null;
    }catch(_){ state.shapes = []; }
  }
  if(!state.shapes.length) state.shapes = exampleCirc();
  state.sel = -1;

  root = document.createElement("div");
  root.className = "pe pe-overlay";
  root.setAttribute("role", "dialog"); root.setAttribute("aria-modal", "true"); root.setAttribute("aria-labelledby", "peTitle");
  root.innerHTML = modalHtml();
  prevFocus = document.activeElement;
  prevOverflow = document.body.style.overflow;
  document.body.style.overflow = "hidden";
  document.body.appendChild(root);
  wire();
  document.addEventListener("keydown", onKey, true);
  renderList();
  refresh();
  initialJson = jsonText(buildBlock());
  // Pas d'exemple par défaut : si rien n'était défini, l'exemple sert seulement de point de départ ; on le compte comme modifié.
  if(!(blk && blk.shapes && blk.shapes.length)) initialJson = "";
  $("peApply").focus();
}

window.NysaPupilEditor = { open: open, close: close, isOpen: function(){ return !!root; } };
})();
