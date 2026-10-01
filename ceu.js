/* o céu: pôr do sol rosado que vira noite, com sol, lua e estrelas */
function criarCeu(scene){
  // z = topo do céu, hz = horizonte, chao = neblina lá longe, luz = sol/lua, hc/hb = luz que vem do céu / do chão
  var PALETAS = [
    { z:'#4a3e86', hz:'#ffb0c4', chao:'#e3a2ba', luz:'#ffbfae', li:1.15, hc:'#c3a0d0', hb:'#4a3440', hi:0.95, noite:0 },
    { z:'#2b2a66', hz:'#c98fb6', chao:'#6c4c70', luz:'#e08ea6', li:0.55, hc:'#7570b0', hb:'#2a2030', hi:0.75, noite:0.45 },
    { z:'#05081a', hz:'#1d2852', chao:'#10152c', luz:'#9db2ea', li:0.5,  hc:'#33427c', hb:'#100e18', hi:0.8,  noite:1 }
  ];

  var u = {
    uZenite: { value: new THREE.Color() }, uHorizonte: { value: new THREE.Color() }, uAbaixo: { value: new THREE.Color() },
    uSol: { value: new V3(0, 0.1, -1) }, uLua: { value: new V3(0.2, 0.3, -1).normalize() },
    uSolVis: { value: 1 }, uLuaVis: { value: 0 }
  };
  var cupula = new THREE.Mesh(new THREE.SphereGeometry(500, 40, 20), new THREE.ShaderMaterial({
    uniforms: u, side: THREE.BackSide, depthWrite: false, fog: false,
    vertexShader: [
      'varying vec3 vDir;',
      'void main(){',
      '  vDir = position;',
      '  vec4 p = projectionMatrix * modelViewMatrix * vec4(position, 1.0);',
      '  gl_Position = p.xyww;',
      '}'
    ].join('\n'),
    fragmentShader: [
      'uniform vec3 uZenite; uniform vec3 uHorizonte; uniform vec3 uAbaixo;',
      'uniform vec3 uSol; uniform vec3 uLua; uniform float uSolVis; uniform float uLuaVis;',
      'varying vec3 vDir;',
      'void main(){',
      '  vec3 d = normalize(vDir);',
      '  vec3 cor = mix(uHorizonte, uZenite, sqrt(clamp(d.y, 0.0, 1.0)));',
      '  cor = mix(cor, uAbaixo, clamp(-d.y * 5.0, 0.0, 1.0));',
      '  float c = dot(d, uSol);',
      '  if (c > 0.0 && uSolVis > 0.0) {',
      '    float c2 = c * c, c4 = c2 * c2, c8 = c4 * c4, c32 = c8 * c8 * c8 * c8;',
      '    cor += uHorizonte * (c4 * c2 * 0.4 + c32 * c32 * 0.6) * uSolVis;',
      '    if (c > 0.999) cor = mix(cor, vec3(1.0, 0.95, 0.88), smoothstep(0.9993, 0.9996, c) * uSolVis);',
      '  }',
      '  float cl = dot(d, uLua);',
      '  if (cl > 0.9 && uLuaVis > 0.0) {',
      '    float l2 = cl * cl, l4 = l2 * l2, l8 = l4 * l4, l32 = l8 * l8 * l8 * l8;',
      '    cor += vec3(0.5, 0.58, 0.85) * l32 * l32 * l32 * 0.4 * uLuaVis;',
      '    if (cl > 0.9994) {',
      '      vec3 lu = normalize(cross(uLua, vec3(0.0, 1.0, 0.0)));',
      '      vec3 lv = cross(lu, uLua);',
      '      vec2 q = vec2(dot(d, lu), dot(d, lv)) / 0.0245;',
      '      vec2 m1 = (q - vec2(-0.18, 0.28)) * vec2(1.0, 1.6);',
      '      vec2 m2 = (q - vec2(0.3, 0.05)) * vec2(1.4, 0.9);',
      '      vec2 m3 = (q - vec2(-0.32, -0.12)) * vec2(0.8, 1.3);',
      '      float mar = exp(-dot(m1, m1) * 5.0) * 0.7 + exp(-dot(m2, m2) * 7.0) * 0.45 + exp(-dot(m3, m3) * 6.0) * 0.5;',
      '      vec3 luaCor = mix(vec3(0.97, 0.96, 0.9), vec3(0.8, 0.8, 0.8), clamp(mar, 0.0, 1.0));',
      '      luaCor *= 1.0 - 0.18 * dot(q, q);',
      '      cor = mix(cor, luaCor, smoothstep(0.99955, 0.9997, cl) * uLuaVis);',
      '    }',
      '  }',
      '  cor += (fract(52.9829189 * fract(dot(gl_FragCoord.xy, vec2(0.06711056, 0.00583715)))) - 0.5) / 255.0;',
      '  gl_FragColor = vec4(cor, 1.0);',
      '}'
    ].join('\n')
  }));
  cupula.renderOrder = 10; // depois do que é opaco: só pinta o pedaço de tela que sobrou
  cupula.frustumCulled = false;
  scene.add(cupula);

  // estrelas: quadradinhos de tamanho fixo em pixels
  var tela = { value: new THREE.Vector2(1, 1) };
  var estrelas = (function(){
    var n = 900, r = sorteio(77), g = quadBase();
    var centro = new Float32Array(n * 3), dados = new Float32Array(n * 2);
    for (var k = 0; k < n; k++){
      var a = r() * Math.PI * 2, y = Math.pow(r(), 1.5) * 0.97 + 0.02, s = Math.sqrt(1 - y * y);
      centro.set([Math.cos(a) * s * 420, y * 420, Math.sin(a) * s * 420], k * 3);
      dados.set([1.3 + Math.pow(r(), 3) * 3.4, r() * 100], k * 2);
    }
    g.setAttribute('centro', new THREE.InstancedBufferAttribute(centro, 3));
    g.setAttribute('dados', new THREE.InstancedBufferAttribute(dados, 2));
    g.instanceCount = n;
    var uu = { uTela: tela, uTempo: { value: 0 }, uVis: { value: 0 } };
    var m = new THREE.Mesh(g, new THREE.ShaderMaterial({
      uniforms: uu, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, fog: false,
      vertexShader: [
        'attribute vec3 centro; attribute vec2 dados;',
        'uniform vec2 uTela; uniform float uTempo; uniform float uVis;',
        'varying vec2 vC; varying float vB;',
        'void main(){',
        '  vec4 clip = projectionMatrix * modelViewMatrix * vec4(centro, 1.0);',
        '  clip.xy += position.xy * (dados.x * 2.0 / uTela) * clip.w;',
        '  vC = position.xy;',
        '  vB = uVis * (0.65 + 0.35 * sin(uTempo * (1.2 + fract(dados.y) * 2.0) + dados.y)) * smoothstep(0.0, 0.1, centro.y / 420.0);',
        '  gl_Position = clip;',
        '}'
      ].join('\n'),
      fragmentShader: [
        'varying vec2 vC; varying float vB;',
        'void main(){',
        '  float a = 1.0 - smoothstep(0.0, 1.0, length(vC));',
        '  a = a * a * vB;',
        '  gl_FragColor = vec4(vec3(1.0, 0.97, 0.92), a);',
        '}'
      ].join('\n')
    }));
    m.frustumCulled = false;
    m.renderOrder = 11;
    scene.add(m);
    return { mesh: m, u: uu };
  })();

  var hemi = new THREE.HemisphereLight(0xffffff, 0x000000, 1);
  scene.add(hemi);
  var luz = new THREE.DirectionalLight(0xffffff, 1);
  scene.add(luz);
  scene.add(luz.target);
  scene.fog = new THREE.Fog(0x000000, 30, 140);

  var estado = { p: 0, noite: 0 };
  var tmp = new THREE.Color();

  function cor(chave, p){
    var i = p < 0.5 ? 0 : 1, t = p < 0.5 ? p / 0.5 : (p - 0.5) / 0.5;
    t = t * t * (3 - 2 * t);
    return tmp.set(PALETAS[i][chave]).lerp(new THREE.Color(PALETAS[i + 1][chave]), t);
  }
  function num(chave, p){
    var i = p < 0.5 ? 0 : 1, t = p < 0.5 ? p / 0.5 : (p - 0.5) / 0.5;
    t = t * t * (3 - 2 * t);
    return misturar(PALETAS[i][chave], PALETAS[i + 1][chave], t);
  }

  // p = 0: pôr do sol rosado; p = 1: noite fechada
  function definir(p){
    p = Math.max(0, Math.min(1, p));
    estado.p = p;
    u.uZenite.value.copy(cor('z', p));
    u.uHorizonte.value.copy(cor('hz', p));
    u.uAbaixo.value.copy(cor('chao', p));
    scene.fog.color.copy(cor('hz', p)).convertSRGBToLinear();
    hemi.color.copy(cor('hc', p)).convertSRGBToLinear();
    hemi.groundColor.copy(cor('hb', p)).convertSRGBToLinear();
    hemi.intensity = num('hi', p);
    luz.color.copy(cor('luz', p)).convertSRGBToLinear();
    luz.intensity = num('li', p);
    var noite = num('noite', p);
    estado.noite = noite;
    // o sol desce atrás da casa, um pouco pra esquerda; a lua sobe do outro lado
    var elSol = misturar(0.13, -0.09, suave(0, 0.6, p));
    var sol = new V3(-0.2, elSol, -1).normalize();
    var elLua = misturar(-0.06, 0.2, suave(0.35, 1, p));
    var lua = new V3(0.17, elLua, -1).normalize();
    u.uSol.value.copy(sol);
    u.uLua.value.copy(lua);
    u.uSolVis.value = suave(-0.08, 0.0, elSol) * (1 - suave(0.4, 0.7, p));
    u.uLuaVis.value = suave(0.45, 0.9, p) * suave(-0.04, 0.02, elLua);
    estrelas.u.uVis.value = suave(0.45, 0.95, p);
    // a luz principal vem do sol no começo e da lua no fim
    var dir = sol.clone().setY(Math.max(sol.y, 0.25)).lerp(lua.clone().setY(Math.max(lua.y, 0.45)), suave(0.35, 0.75, p)).normalize();
    luz.position.copy(dir).multiplyScalar(40);
    luz.target.position.set(0, 0, 0);
  }

  function atualizar(dt, camera){
    cupula.position.copy(camera.position);
    estrelas.mesh.position.copy(camera.position);
    estrelas.u.uTempo.value += dt;
  }

  function tamanho(w, h){ tela.value.set(w, h); }

  definir(0);
  return { definir: definir, atualizar: atualizar, tamanho: tamanho, estado: estado, hemi: hemi, luz: luz };
}
