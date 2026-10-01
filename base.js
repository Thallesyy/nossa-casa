/* peças que a casa e os cômodos usam */
var V3 = THREE.Vector3;

function sorteio(a){
  return function(){
    a |= 0; a = a + 0x6D2B79F5 | 0;
    var t = Math.imul(a ^ a >>> 15, 1 | a);
    t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
}

function suave(a, b, x){
  var t = Math.max(0, Math.min(1, (x - a) / (b - a)));
  return t * t * (3 - 2 * t);
}
function misturar(a, b, t){ return a + (b - a) * t; }

// cor de material pronto do three (ele trabalha em linear)
function corReal(hex){ return new THREE.Color(hex).convertSRGBToLinear(); }

// depois de mandar a textura pra placa de vídeo, solta a memória do canvas (importante no iPhone)
function soltarDepoisDeEnviar(tex){
  tex.onUpdate = function(){ var im = tex.image; if (im && im.width){ im.width = 1; im.height = 1; } tex.onUpdate = null; };
}

// textura desenhada na hora num canvas
function texturaCanvas(w, h, desenhar, repetir, linear){
  var c = document.createElement('canvas');
  c.width = w; c.height = h;
  desenhar(c.getContext('2d'), w, h);
  var t = new THREE.CanvasTexture(c);
  if (!linear) t.encoding = THREE.sRGBEncoding;
  t.anisotropy = 4;
  if (repetir){ t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(repetir[0], repetir[1]); }
  soltarDepoisDeEnviar(t);
  return t;
}

function material(hex, extra){
  var o = { color: corReal(hex), roughness: 0.85, metalness: 0 };
  for (var k in extra) o[k] = extra[k];
  return new THREE.MeshStandardMaterial(o);
}

function caixa(w, h, d, mat, x, y, z, pai){
  var m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat);
  m.position.set(x || 0, y || 0, z || 0);
  if (pai) pai.add(m);
  return m;
}

// caixa com as quinas arredondadas (almofada, sofá, geladeira)
function geoCaixaRedonda(w, h, d, r){
  r = Math.min(r, w / 2 - 0.001, h / 2 - 0.001, d / 2 - 0.001);
  var s = new THREE.Shape(), x = -w / 2 + r, y = -h / 2 + r, ww = w - 2 * r, hh = h - 2 * r, rc = r * 0.5;
  s.moveTo(x + rc, y);
  s.lineTo(x + ww - rc, y); s.quadraticCurveTo(x + ww, y, x + ww, y + rc);
  s.lineTo(x + ww, y + hh - rc); s.quadraticCurveTo(x + ww, y + hh, x + ww - rc, y + hh);
  s.lineTo(x + rc, y + hh); s.quadraticCurveTo(x, y + hh, x, y + hh - rc);
  s.lineTo(x, y + rc); s.quadraticCurveTo(x, y, x + rc, y);
  var g = new THREE.ExtrudeGeometry(s, { depth: Math.max(0.001, d - 2 * r), bevelEnabled: true, bevelThickness: r, bevelSize: r, bevelSegments: 3, curveSegments: 3 });
  g.translate(0, 0, -(d - 2 * r) / 2);
  g.computeVertexNormals();
  return g;
}
function caixaRedonda(w, h, d, r, mat, x, y, z, pai){
  var m = new THREE.Mesh(geoCaixaRedonda(w, h, d, r), mat);
  m.position.set(x || 0, y || 0, z || 0);
  if (pai) pai.add(m);
  return m;
}

function quadBase(){
  var g = new THREE.InstancedBufferGeometry();
  g.setAttribute('position', new THREE.BufferAttribute(new Float32Array([-1,-1,0, 1,-1,0, 1,1,0, -1,1,0]), 3));
  g.setIndex([0, 1, 2, 0, 2, 3]);
  return g;
}

/* ------------------------------------------------------------------
   BRILHOS: luzinhas, lâmpadas, vaga-lumes, poças de luz no chão.
   Tudo num desenho só, com quadradinhos virados pra câmera
   (nada de gl_PointCoord, que não funciona em algumas placas).
   tipo 0 = luz parada que respira, 1 = vaga-lume voando,
   2 = chama de vela, 3 = poça de luz deitada no chão.
   grupo = qual interruptor acende aquela luz (0..7).
   ------------------------------------------------------------------ */
function criarBrilhos(lista){
  var n = lista.length, g = quadBase();
  var centro = new Float32Array(n * 3), dados = new Float32Array(n * 4), cor = new Float32Array(n * 4);
  lista.forEach(function(b, k){
    centro.set([b.x, b.y, b.z], k * 3);
    dados.set([b.tam, b.fase || 0, b.tipo || 0, b.grupo || 0], k * 4);
    var c = new THREE.Color(b.cor || '#ffcf8a');
    cor.set([c.r, c.g, c.b, b.forca === undefined ? 1 : b.forca], k * 4);
  });
  g.setAttribute('centro', new THREE.InstancedBufferAttribute(centro, 3));
  g.setAttribute('dados', new THREE.InstancedBufferAttribute(dados, 4));
  g.setAttribute('cor', new THREE.InstancedBufferAttribute(cor, 4));
  g.instanceCount = n;
  var u = { uTempo: { value: 0 }, uGrupo: { value: [1, 1, 1, 1, 1, 1, 1, 1] } };
  var mesh = new THREE.Mesh(g, new THREE.ShaderMaterial({
    uniforms: u, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
    vertexShader: [
      'attribute vec3 centro; attribute vec4 dados; attribute vec4 cor;',
      'uniform float uTempo; uniform float uGrupo[8];',
      'varying vec2 vC; varying vec3 vCor; varying float vA; varying float vChao;',
      'void main(){',
      '  vec3 c = centro; float t = uTempo + dados.y * 10.0;',
      '  float a = cor.a * uGrupo[int(dados.w + 0.5)];',
      '  vChao = 0.0;',
      '  if (dados.z > 0.5 && dados.z < 1.5) {',
      '    c += vec3(sin(t * 0.37) * 0.7, sin(t * 0.53) * 0.3, cos(t * 0.29) * 0.7);',
      '    a *= pow(0.5 + 0.5 * sin(t * 1.7 + dados.y * 13.0), 2.0);',
      '  } else if (dados.z > 1.5 && dados.z < 2.5) {',
      '    a *= 0.82 + 0.18 * sin(t * 9.0) * sin(t * 5.3 + 1.0);',
      '  } else if (dados.z < 0.5) {',
      '    a *= 0.9 + 0.1 * sin(t * 1.6);',
      '  }',
      '  vec4 mv;',
      '  if (dados.z > 2.5) {',
      '    vChao = 1.0;',
      '    mv = modelViewMatrix * vec4(c + vec3(position.x, 0.0, position.y) * dados.x, 1.0);',
      '  } else {',
      '    mv = modelViewMatrix * vec4(c, 1.0);',
      '    mv.xy += position.xy * dados.x;',
      '  }',
      '  gl_Position = projectionMatrix * mv;',
      '  vC = position.xy; vCor = cor.rgb; vA = a;',
      '}'
    ].join('\n'),
    fragmentShader: [
      'varying vec2 vC; varying vec3 vCor; varying float vA; varying float vChao;',
      'void main(){',
      '  float r2 = dot(vC, vC);',
      '  float g = vChao > 0.5 ? exp(-r2 * 3.0) * 0.55 : exp(-r2 * 6.0) * 0.55 + exp(-r2 * 60.0) * 1.2;',
      '  g *= 1.0 - smoothstep(0.75, 1.0, sqrt(r2));',
      '  gl_FragColor = vec4(vCor, g * vA);',
      '}'
    ].join('\n')
  }));
  mesh.frustumCulled = false;
  mesh.renderOrder = 5;
  return { mesh: mesh, u: u, grupo: function(i, v){ u.uGrupo.value[i] = v; } };
}

// lâmpadas penduradas num fio que faz barriga (varal de luzinhas)
function pontosDeVaral(a, b, n, barriga){
  var out = [];
  for (var i = 0; i < n; i++){
    var t = (i + 0.5) / n;
    var p = a.clone().lerp(b, t);
    p.y -= barriga * 4 * t * (1 - t);
    out.push(p);
  }
  return out;
}
function fioDeVaral(a, b, barriga, mat, pai){
  var pts = [];
  for (var i = 0; i <= 16; i++){
    var t = i / 16, p = a.clone().lerp(b, t);
    p.y -= barriga * 4 * t * (1 - t);
    pts.push(p);
  }
  var tubo = new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 24, 0.008, 4, false), mat);
  pai.add(tubo);
  return tubo;
}

// sombra suave embaixo das coisas (sem mapa de sombra, que pesa)
var _texSombra = null;
function sombraNoChao(w, d, x, y, z, forca, pai){
  if (!_texSombra) _texSombra = texturaCanvas(64, 64, function(c){
    var gr = c.createRadialGradient(32, 32, 0, 32, 32, 32);
    gr.addColorStop(0, 'rgba(0,0,0,1)'); gr.addColorStop(0.5, 'rgba(0,0,0,0.6)'); gr.addColorStop(1, 'rgba(0,0,0,0)');
    c.fillStyle = gr; c.fillRect(0, 0, 64, 64);
  }, null, true);
  var m = new THREE.Mesh(new THREE.PlaneGeometry(w, d), new THREE.MeshBasicMaterial({ map: _texSombra, transparent: true, opacity: forca === undefined ? 0.5 : forca, depthWrite: false, color: 0x000000 }));
  m.rotation.x = -Math.PI / 2;
  m.position.set(x, y + 0.004, z);
  m.renderOrder = 1;
  pai.add(m);
  return m;
}

// foto (data URI) virando textura, cortada pra caber na proporção do quadro
function texturaDeFoto(uri, aspecto, pronto){
  var img = new Image();
  var tex = new THREE.Texture();
  tex.encoding = THREE.sRGBEncoding;
  tex.anisotropy = 4;
  img.onload = function(){
    var c = document.createElement('canvas'), lado = 512;
    var w = aspecto >= 1 ? lado : Math.round(lado * aspecto), h = aspecto >= 1 ? Math.round(lado / aspecto) : lado;
    c.width = w; c.height = h;
    var ar = img.width / img.height, sx, sy, sw, sh;
    if (ar > aspecto){ sh = img.height; sw = sh * aspecto; sx = (img.width - sw) / 2; sy = 0; }
    else { sw = img.width; sh = sw / aspecto; sx = 0; sy = (img.height - sh) * 0.35; }
    c.getContext('2d').drawImage(img, sx, sy, sw, sh, 0, 0, w, h);
    tex.image = c;
    tex.needsUpdate = true;
    soltarDepoisDeEnviar(tex);
    if (pronto) pronto();
  };
  img.src = uri;
  return tex;
}

/* ------------------------------------------------------------------
   Junta as peças paradas que usam o mesmo material num desenho só.
   Cada caixinha separada custa uma chamada pra placa de vídeo; com a
   grade, os livros e as molduras isso passava de 180 por quadro.
   Não mexe no que tem userData.manter, no que é invisível (área de
   toque), em shader próprio e em InstancedMesh.
   ------------------------------------------------------------------ */
function chaveDoMaterial(m){
  return [m.type, m.color ? m.color.getHexString() : '', m.emissive ? m.emissive.getHexString() + m.emissiveIntensity : '',
    m.roughness, m.metalness, m.map ? m.map.uuid : '', m.side, m.flatShading, m.transparent, m.opacity, m.vertexColors].join('|');
}
function mesclarEstaticos(raiz, destino){
  raiz.updateMatrixWorld(true);
  var grupos = {}, remover = [];
  raiz.traverse(function(o){
    if (!o.isMesh || o.isInstancedMesh || !o.visible || o.userData.manter) return;
    if (Array.isArray(o.material) || o.material.isShaderMaterial) return;
    var p = o.parent, preso = false;
    while (p){ if (p.userData && p.userData.manter) { preso = true; break; } p = p.parent; }
    if (preso) return;
    var k = chaveDoMaterial(o.material);
    (grupos[k] = grupos[k] || { mat: o.material, lista: [] }).lista.push(o);
    remover.push(o);
  });
  Object.keys(grupos).forEach(function(k){
    var G = grupos[k];
    if (G.lista.length < 2){ remover.splice(remover.indexOf(G.lista[0]), 1); return; }
    var pos = [], nor = [], uv = [];
    G.lista.forEach(function(o){
      var g = o.geometry.index ? o.geometry.toNonIndexed() : o.geometry.clone();
      g.applyMatrix4(o.matrixWorld);
      var a = g.attributes;
      for (var i = 0; i < a.position.count; i++){
        pos.push(a.position.getX(i), a.position.getY(i), a.position.getZ(i));
        if (a.normal) nor.push(a.normal.getX(i), a.normal.getY(i), a.normal.getZ(i)); else nor.push(0, 1, 0);
        if (a.uv) uv.push(a.uv.getX(i), a.uv.getY(i)); else uv.push(0, 0);
      }
      g.dispose();
    });
    var geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
    geo.setAttribute('normal', new THREE.Float32BufferAttribute(nor, 3));
    geo.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2));
    var m = new THREE.Mesh(geo, G.mat);
    m.renderOrder = G.lista[0].renderOrder;
    destino.add(m);
  });
  remover.forEach(function(o){ if (o.parent) o.parent.remove(o); });
}
