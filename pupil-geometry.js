/*
 * Géométrie de la pupille libre, côté navigateur (27/11/2026).
 *
 * Reproduit EO_Toolbox.optics (validate_pupil_free, pupil_free_geometry) : mêmes formes, mêmes règles de
 * validation, mêmes grandeurs de référence. Le serveur reste la référence (il revalide et construit le masque) :
 * ce fichier sert à l'éditeur, pour afficher en direct la surface, D_small et D_large, et pour prévenir tout de
 * suite d'une erreur de saisie.
 *
 * Bloc pupil_free : { shapes: [ {type, mode, x, y, rotation_deg, ...} ], grid_step_m? } avec les types
 *   circle          : diameter
 *   rectangle       : width, height
 *   polygon_regular : n_sides (3 à 12), flat_to_flat (distance entre côtés opposés)
 *   polygon_free    : points [[x, y], ...] (3 à 64), coordonnées avant rotation et translation
 *   support         : angles_deg [...] (1 à 16 bras partant du centre), width (largeur d'un bras), toujours en retrait
 * mode : "add" (ajouter) ou "subtract" (retrancher), appliqués dans l'ordre de la liste.
 * Repère Xopt/Yopt en mètres. Rotation en degrés, sens trigonométrique, autour du centre de la forme (origine du
 * repère de la forme avant translation). Un sommet des polygones réguliers est sur +Xopt quand la rotation est nulle.
 *
 * Dépend de vendor/polygon-clipping.min.js (union et différence de polygones, exactes), chargé avant ce fichier.
 *
 * Usage :
 *   var r = NysaPupil.geometry(pupilFree);   // lève une Error (message en français) si le bloc est invalide
 *   r.info.area_m2, r.info.D_small, r.info.D_large, r.info.half_side_m, r.info.clean, r.geom (multipolygone)
 *
 * Différence avec le serveur : le plus petit détail (thinnest_m, qui règle la finesse de la grille du masque)
 * n'est pas calculé ici, et le cercle est un polygone de 512 côtés (de même aire que le cercle) au lieu de 2048.
 */
(function(root){
  "use strict";

  var PC = root.polygonClipping || (typeof require === "function" ? require("polygon-clipping") : null);

  var MAX_SHAPES = 200, MAX_EXTENT_M = 50.0, MAX_POINTS = 64, MAX_ARMS = 16, CIRCLE_SIDES = 512;

  function fail(msg){ throw new Error(msg); }
  function isNum(v){ return typeof v === "number" && isFinite(v); }

  // Lit un nombre fini dans une forme (message d'erreur identique à celui du serveur, forme numéro i + 1).
  function num(shape, key, i, positive, def){
    if(!(key in shape)){
      if(def !== undefined) return Number(def);
      fail("Forme " + (i + 1) + " : champ '" + key + "' manquant.");
    }
    var v = shape[key];
    if(!isNum(v)) fail("Forme " + (i + 1) + " : '" + key + "' doit être un nombre fini.");
    if(positive && v <= 0) fail("Forme " + (i + 1) + " : '" + key + "' doit être strictement positif.");
    return v;
  }

  // Valide un bloc pupil_free et renvoie une copie nettoyée (valeurs par défaut posées). Lève une Error sinon.
  function validate(pupilFree){
    if(!pupilFree || typeof pupilFree !== "object" || Array.isArray(pupilFree)){
      fail("Pupille libre : le bloc doit être un objet avec une liste 'shapes'.");
    }
    var shapes = pupilFree.shapes;
    if(!Array.isArray(shapes) || shapes.length === 0) fail("Pupille libre : la liste de formes est vide.");
    if(shapes.length > MAX_SHAPES) fail("Pupille libre : " + shapes.length + " formes, maximum " + MAX_SHAPES + ".");

    var clean = [], nAdd = 0;
    shapes.forEach(function(s, i){
      if(!s || typeof s !== "object" || Array.isArray(s)) fail("Forme " + (i + 1) + " : doit être un objet.");
      var t = s.type;
      var c = { type: t, x: num(s, "x", i, false, 0), y: num(s, "y", i, false, 0), rotation_deg: num(s, "rotation_deg", i, false, 0) };
      var mode = s.mode === undefined ? "add" : s.mode;
      if(t === "support") mode = "subtract";          // un support retire toujours de la matière
      if(mode !== "add" && mode !== "subtract") fail("Forme " + (i + 1) + " : 'mode' doit être 'add' ou 'subtract'.");
      c.mode = mode;

      if(t === "circle"){
        c.diameter = num(s, "diameter", i, true);
      } else if(t === "rectangle"){
        c.width = num(s, "width", i, true);
        c.height = num(s, "height", i, true);
      } else if(t === "polygon_regular"){
        var n = s.n_sides;
        if(typeof n !== "number" || !isFinite(n) || Math.floor(n) !== n || n < 3 || n > 12){
          fail("Forme " + (i + 1) + " : 'n_sides' doit être un entier entre 3 et 12.");
        }
        c.n_sides = n;
        c.flat_to_flat = num(s, "flat_to_flat", i, true);
      } else if(t === "polygon_free"){
        var pts = s.points;
        if(!Array.isArray(pts) || pts.length < 3 || pts.length > MAX_POINTS){
          fail("Forme " + (i + 1) + " : 'points' doit contenir entre 3 et " + MAX_POINTS + " points.");
        }
        c.points = pts.map(function(p){
          if(!Array.isArray(p) || p.length !== 2 || !isNum(p[0]) || !isNum(p[1])){
            fail("Forme " + (i + 1) + " : chaque point doit être [x, y] avec des nombres finis.");
          }
          return [Number(p[0]), Number(p[1])];
        });
      } else if(t === "support"){
        var angs = s.angles_deg;
        if(!Array.isArray(angs) || angs.length < 1 || angs.length > MAX_ARMS){
          fail("Forme " + (i + 1) + " : 'angles_deg' doit contenir entre 1 et " + MAX_ARMS + " angles.");
        }
        if(angs.some(function(a){ return !isNum(a); })) fail("Forme " + (i + 1) + " : les angles doivent être des nombres finis.");
        c.angles_deg = angs.map(Number);
        c.width = num(s, "width", i, true);
      } else {
        fail("Forme " + (i + 1) + " : type inconnu '" + t + "'.");
      }
      if(mode === "add") nAdd++;
      clean.push(c);
    });
    if(nAdd === 0) fail("Pupille libre : il faut au moins une forme en mode 'add'.");
    var out = { shapes: clean };
    var gs = pupilFree.grid_step_m;
    if(isNum(gs) && gs > 0) out.grid_step_m = gs;
    return out;
  }

  // ---------------------------------------------------------------------------------------------------------
  // Géométrie élémentaire. Un multipolygone est une liste de polygones ; un polygone est une liste d'anneaux
  // (le premier est le contour, les suivants des trous) ; un anneau est une liste de points [x, y].
  // ---------------------------------------------------------------------------------------------------------
  function rotateRing(ring, deg){
    if(deg === 0) return ring;
    var a = deg * Math.PI / 180, co = Math.cos(a), si = Math.sin(a);
    return ring.map(function(p){ return [p[0] * co - p[1] * si, p[0] * si + p[1] * co]; });
  }
  function translateRing(ring, dx, dy){
    if(dx === 0 && dy === 0) return ring;
    return ring.map(function(p){ return [p[0] + dx, p[1] + dy]; });
  }
  // Les sommets sont arrondis au picomètre : sans cela, une rotation de 90° laisse des écarts de l'ordre de 1e-17 qui
  // rendent des côtés "presque" alignés, et la bibliothèque de découpe échoue sur ces quasi-coïncidences.
  function snap(v){ return Math.round(v * 1e12) / 1e12; }
  function transformMulti(multi, deg, dx, dy){
    return multi.map(function(poly){
      return poly.map(function(ring){
        return translateRing(rotateRing(ring, deg), dx, dy).map(function(p){ return [snap(p[0]), snap(p[1])]; });
      });
    });
  }
  function ringArea(ring){                      // aire signée (formule du lacet)
    var s = 0;
    for(var i = 0, n = ring.length; i < n; i++){
      var p = ring[i], q = ring[(i + 1) % n];
      s += p[0] * q[1] - q[0] * p[1];
    }
    return s / 2;
  }
  function multiArea(multi){
    var a = 0;
    multi.forEach(function(poly){
      poly.forEach(function(ring, k){ a += (k === 0 ? 1 : -1) * Math.abs(ringArea(ring)); });
    });
    return a;
  }
  function multiVertices(multi){                // sommets des contours extérieurs (suffisent pour l'enveloppe convexe)
    var pts = [];
    multi.forEach(function(poly){ poly[0].forEach(function(p){ pts.push(p); }); });
    return pts;
  }

  function segmentsCross(a, b, c, d){           // intersection stricte de deux segments
    function o(p, q, r){ return (q[0] - p[0]) * (r[1] - p[1]) - (q[1] - p[1]) * (r[0] - p[0]); }
    var o1 = o(a, b, c), o2 = o(a, b, d), o3 = o(c, d, a), o4 = o(c, d, b);
    return ((o1 > 0 && o2 < 0) || (o1 < 0 && o2 > 0)) && ((o3 > 0 && o4 < 0) || (o3 < 0 && o4 > 0));
  }
  function polygonIsSimple(pts){                // pas de côtés qui se croisent, aire non nulle
    var n = pts.length;
    if(Math.abs(ringArea(pts)) <= 1e-18) return false;
    for(var i = 0; i < n; i++){
      for(var j = i + 1; j < n; j++){
        if(j === i + 1 || (i === 0 && j === n - 1)) continue;     // côtés voisins
        if(segmentsCross(pts[i], pts[(i + 1) % n], pts[j], pts[(j + 1) % n])) return false;
      }
    }
    return true;
  }

  // Enveloppe convexe (chaîne monotone d'Andrew), sommets dans l'ordre trigonométrique, sans répétition.
  function convexHull(points){
    var pts = points.slice().sort(function(a, b){ return a[0] - b[0] || a[1] - b[1]; });
    var uniq = [];
    pts.forEach(function(p){ var l = uniq[uniq.length - 1]; if(!l || l[0] !== p[0] || l[1] !== p[1]) uniq.push(p); });
    if(uniq.length < 3) return uniq;
    function cross(o, a, b){ return (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0]); }
    var lower = [], upper = [], i;
    for(i = 0; i < uniq.length; i++){
      while(lower.length >= 2 && cross(lower[lower.length - 2], lower[lower.length - 1], uniq[i]) <= 0) lower.pop();
      lower.push(uniq[i]);
    }
    for(i = uniq.length - 1; i >= 0; i--){
      while(upper.length >= 2 && cross(upper[upper.length - 2], upper[upper.length - 1], uniq[i]) <= 0) upper.pop();
      upper.push(uniq[i]);
    }
    lower.pop(); upper.pop();
    return lower.concat(upper);
  }

  // Largeur minimale : plus petite distance entre deux droites parallèles encadrant l'enveloppe convexe.
  function minCaliperWidth(hull){
    var n = hull.length;
    if(n < 3) return 0;
    var best = Infinity;
    for(var i = 0; i < n; i++){
      var p = hull[i], q = hull[(i + 1) % n];
      var ex = q[0] - p[0], ey = q[1] - p[1], L = Math.hypot(ex, ey);
      if(L === 0) continue;
      var dmax = 0;
      for(var j = 0; j < n; j++){
        var d = Math.abs(ex * (hull[j][1] - p[1]) - ey * (hull[j][0] - p[0])) / L;
        if(d > dmax) dmax = d;
      }
      if(dmax < best) best = dmax;
    }
    return best;
  }

  // Rayon du plus petit cercle englobant (algorithme de Welzl itératif, ordre mélangé de façon reproductible).
  function minEnclosingRadius(points){
    var P = points.slice(), seed = 12345;
    for(var k = P.length - 1; k > 0; k--){
      seed = (seed * 1103515245 + 12345) % 2147483648;
      var j = seed % (k + 1), tmp = P[k]; P[k] = P[j]; P[j] = tmp;
    }
    function circle2(a, b){ return { x: (a[0] + b[0]) / 2, y: (a[1] + b[1]) / 2, r: Math.hypot(a[0] - b[0], a[1] - b[1]) / 2 }; }
    function circle3(a, b, c){
      var bx = b[0] - a[0], by = b[1] - a[1], cx = c[0] - a[0], cy = c[1] - a[1];
      var d = 2 * (bx * cy - by * cx);
      if(Math.abs(d) < 1e-300) return null;
      var ux = (cy * (bx * bx + by * by) - by * (cx * cx + cy * cy)) / d;
      var uy = (bx * (cx * cx + cy * cy) - cx * (bx * bx + by * by)) / d;
      return { x: ux + a[0], y: uy + a[1], r: Math.hypot(ux, uy) };
    }
    function inside(c, p){ return Math.hypot(p[0] - c.x, p[1] - c.y) <= c.r * (1 + 1e-12) + 1e-15; }
    var c = null;
    for(var i = 0; i < P.length; i++){
      if(c && inside(c, P[i])) continue;
      c = { x: P[i][0], y: P[i][1], r: 0 };
      for(var j2 = 0; j2 < i; j2++){
        if(inside(c, P[j2])) continue;
        c = circle2(P[i], P[j2]);
        for(var k2 = 0; k2 < j2; k2++){
          if(inside(c, P[k2])) continue;
          var c3 = circle3(P[i], P[j2], P[k2]);
          if(c3) c = c3;
        }
      }
    }
    return c ? c.r : 0;
  }

  // ---------------------------------------------------------------------------------------------------------
  // Forme -> multipolygone (mètres, repère Xopt/Yopt). Rotation autour de l'origine de la forme, puis translation.
  // ---------------------------------------------------------------------------------------------------------
  // Les bras d'une forme "support" : un multipolygone par bras (rectangle partant du centre), déjà tournés et déplacés.
  function supportArms(c, supportLength){
    var hw = c.width / 2;
    return c.angles_deg.map(function(a){
      return transformMulti([[rotateRing([[0, -hw], [supportLength, -hw], [supportLength, hw], [0, hw]], a)]], c.rotation_deg, c.x, c.y);
    });
  }

  function shapeGeometry(c, supportLength){
    var ring, multi, k, n;
    if(c.type === "circle"){
      n = CIRCLE_SIDES;
      var r = c.diameter / 2, rEff = r * Math.sqrt((2 * Math.PI / n) / Math.sin(2 * Math.PI / n));   // polygone de même aire que le cercle
      ring = [];
      for(k = 0; k < n; k++) ring.push([rEff * Math.cos(2 * Math.PI * k / n), rEff * Math.sin(2 * Math.PI * k / n)]);
      multi = [[ring]];
    } else if(c.type === "rectangle"){
      var w = c.width / 2, h = c.height / 2;
      multi = [[[[-w, -h], [w, -h], [w, h], [-w, h]]]];
    } else if(c.type === "polygon_regular"){
      n = c.n_sides;
      var R = (c.flat_to_flat / 2) / Math.cos(Math.PI / n);        // rayon circonscrit depuis l'apothème
      ring = [];
      for(k = 0; k < n; k++) ring.push([R * Math.cos(2 * Math.PI * k / n), R * Math.sin(2 * Math.PI * k / n)]);   // un sommet sur +Xopt
      multi = [[ring]];
    } else if(c.type === "polygon_free"){
      if(!polygonIsSimple(c.points)) fail("Polygone libre invalide (côtés qui se croisent, points alignés ou aire nulle).");
      multi = [[c.points.map(function(p){ return [p[0], p[1]]; })]];
    } else if(c.type === "support"){
      // Les bras se recouvrent près du centre : l'union directe fait parfois échouer la bibliothèque (sommets
      // presque confondus). Pour le dessin on tente l'union, sinon on garde les bras côte à côte (le tracé est le
      // même) ; pour le calcul de la pupille, geometry() retire les bras un par un (voir supportArms).
      var arms = supportArms(c, supportLength);
      multi = arms.length === 1 ? arms[0] : null;
      if(!multi){
        try{ multi = PC.union.apply(null, arms); }
        catch(e){ multi = []; arms.forEach(function(a){ multi = multi.concat(a); }); }
      }
      return multi;
    } else {
      fail("Type de forme inconnu : " + c.type);
    }
    return transformMulti(multi, c.rotation_deg, c.x, c.y);
  }

  // Géométrie finale (union / différence des formes dans l'ordre) et grandeurs de référence.
  function geometry(pupilFree){
    var clean = validate(pupilFree), shapes = clean.shapes;

    // longueur des bras : au-delà du bord de la pupille (formes "add" seules, avant toute soustraction)
    var addGeoms = [];
    shapes.forEach(function(c){ if(c.mode === "add") addGeoms.push(shapeGeometry(c)); });
    var addUnion = addGeoms.length === 1 ? addGeoms[0] : PC.union.apply(null, addGeoms);
    var hullPts = convexHull(multiVertices(addUnion));

    var geom = [];
    shapes.forEach(function(c){
      var g;
      if(c.type === "support"){
        var d = 0;
        hullPts.forEach(function(p){ var q = Math.hypot(p[0] - c.x, p[1] - c.y); if(q > d) d = q; });
        // retrait bras par bras (plus robuste que de réunir d'abord les bras)
        supportArms(c, 1.05 * d + 0.01).forEach(function(arm){
          if(geom.length) geom = PC.difference(geom, arm);
        });
        return;
      }
      g = shapeGeometry(c);
      if(c.mode === "add") geom = geom.length ? PC.union(geom, g) : g;
      else geom = geom.length ? PC.difference(geom, g) : geom;
    });

    var area = multiArea(geom);
    if(!geom.length || !(area > 0)) fail("Pupille libre : la surface finale est nulle (tout a été retiré).");

    var verts = multiVertices(geom), minx = Infinity, miny = Infinity, maxx = -Infinity, maxy = -Infinity;
    verts.forEach(function(p){
      if(p[0] < minx) minx = p[0]; if(p[0] > maxx) maxx = p[0];
      if(p[1] < miny) miny = p[1]; if(p[1] > maxy) maxy = p[1];
    });
    var half = Math.max(Math.abs(minx), Math.abs(maxx), Math.abs(miny), Math.abs(maxy)) * 1.01;
    if(2 * half > MAX_EXTENT_M) fail("Pupille libre : étendue trop grande (" + (2 * half).toFixed(1) + " m), maximum " + MAX_EXTENT_M.toFixed(0) + " m.");

    var hull = convexHull(verts);
    return {
      geom: geom,
      info: {
        area_m2: area,
        D_small: minCaliperWidth(hull),
        D_large: 2 * minEnclosingRadius(hull),
        half_side_m: half,
        clean: clean
      }
    };
  }

  var api = { validate: validate, geometry: geometry, shapeGeometry: shapeGeometry,
              MAX_SHAPES: MAX_SHAPES, MAX_POINTS: MAX_POINTS, MAX_ARMS: MAX_ARMS, MAX_EXTENT_M: MAX_EXTENT_M };
  if(typeof module === "object" && module.exports) module.exports = api;
  root.NysaPupil = api;
})(typeof window !== "undefined" ? window : globalThis);
