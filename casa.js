/* a casa por fora: dois andares, jardim, cerca, roseiras, árvores e as luzes */
function criarCasa(scene, celular){
  var casa = new THREE.Group();
  scene.add(casa);
  var r = sorteio(2005);

  /* ---------------- texturas ---------------- */
  var texTabuas = texturaCanvas(256, 512, function(c, w, h){
    c.fillStyle = '#f5c9d4'; c.fillRect(0, 0, w, h);
    var n = 32, alt = h / n;
    for (var i = 0; i < n; i++){
      var y = i * alt;
      var g = c.createLinearGradient(0, y, 0, y + alt);
      g.addColorStop(0, 'rgba(255,255,255,0.35)'); g.addColorStop(0.75, 'rgba(0,0,0,0)'); g.addColorStop(1, 'rgba(130,60,80,0.28)');
      c.fillStyle = g; c.fillRect(0, y, w, alt);
      c.fillStyle = 'rgba(120,55,75,0.35)'; c.fillRect(0, y + alt - 1.5, w, 1.5);
    }
    for (var k = 0; k < 900; k++){ c.fillStyle = 'rgba(140,80,100,' + (Math.random() * 0.05) + ')'; c.fillRect(Math.random() * w, Math.random() * h, 1 + Math.random() * 6, 1); }
  });
  var texTelha = texturaCanvas(256, 256, function(c, w, h){
    c.fillStyle = '#4d4558'; c.fillRect(0, 0, w, h);
    var linhas = 8, alt = h / linhas;
    for (var i = 0; i < linhas; i++){
      var off = (i % 2) * 16;
      for (var x = -32 + off; x < w; x += 32){
        var tom = 70 + Math.random() * 25;
        var g = c.createLinearGradient(0, i * alt, 0, (i + 1) * alt);
        g.addColorStop(0, 'rgb(' + (tom + 2) + ',' + (tom - 8) + ',' + (tom + 10) + ')');
        g.addColorStop(1, 'rgb(' + (tom - 24) + ',' + (tom - 33) + ',' + (tom - 16) + ')');
        c.fillStyle = g;
        c.fillRect(x + 1, i * alt + 1, 30, alt - 2);
      }
      c.fillStyle = 'rgba(0,0,0,0.45)'; c.fillRect(0, (i + 1) * alt - 3, w, 3);
    }
  }, [4, 3]);
  var texTijolo = texturaCanvas(128, 128, function(c, w, h){
    c.fillStyle = '#6f4a3f'; c.fillRect(0, 0, w, h);
    for (var i = 0; i < 8; i++) for (var x = -16 + (i % 2) * 16; x < w; x += 32){
      var t = 120 + Math.random() * 40;
      c.fillStyle = 'rgb(' + t + ',' + (t * 0.55 | 0) + ',' + (t * 0.45 | 0) + ')';
      c.fillRect(x + 1, i * 16 + 1, 30, 14);
    }
  }, [1, 3]);
  var texPedra = texturaCanvas(128, 128, function(c, w, h){
    c.fillStyle = '#8b857c'; c.fillRect(0, 0, w, h);
    for (var k = 0; k < 40; k++){
      var t = 110 + Math.random() * 50;
      c.fillStyle = 'rgb(' + t + ',' + (t - 4) + ',' + (t - 10) + ')';
      c.beginPath(); c.ellipse(Math.random() * w, Math.random() * h, 8 + Math.random() * 14, 6 + Math.random() * 8, Math.random() * 3, 0, Math.PI * 2); c.fill();
    }
  }, [6, 1]);
  var texPlaca = texturaCanvas(128, 96, function(c, w, h){
    c.fillStyle = '#fbeef1'; c.fillRect(0, 0, w, h);
    c.strokeStyle = '#c4547a'; c.lineWidth = 4; c.strokeRect(6, 6, w - 12, h - 12);
    c.fillStyle = '#b03a62'; c.font = 'italic 600 56px Georgia, serif'; c.textAlign = 'center'; c.textBaseline = 'middle';
    c.fillText('20', w / 2, h / 2 + 3);
  });

  /* ---------------- materiais ---------------- */
  var mParede = new THREE.MeshStandardMaterial({ map: texTabuas, roughness: 0.9, color: 0xffffff });
  var mTelha = new THREE.MeshStandardMaterial({ map: texTelha, roughness: 0.8 });
  var mBranco = material('#f6f1e8', { roughness: 0.7 });
  var mFundacao = new THREE.MeshStandardMaterial({ map: texPedra, roughness: 1 });
  var mTijolo = new THREE.MeshStandardMaterial({ map: texTijolo, roughness: 0.95 });
  var mPorta = material('#a33e66', { roughness: 0.5 });
  var mMetal = material('#2a2623', { roughness: 0.5, metalness: 0.4 });
  var mJanelaVerde = material('#de8aa5', { roughness: 0.7 });
  var mMadeira = material('#8a6446', { roughness: 0.8 });
  var mTerra = material('#3b2a22', { roughness: 1 });

  /* ---------------- o corpo da casa ---------------- */
  var L = 8, P = 6, H = 6.2, CUME = 8.9;
  caixa(L + 0.3, 0.45, P + 0.3, mFundacao, 0, 0.22, 0, casa);
  var corpo = caixa(L, H, P, mParede, 0, H / 2 + 0.05, 0, casa);
  texTabuas.repeat.set(1, 1);

  // empenas (os triângulos dos lados, embaixo do telhado)
  [-1, 1].forEach(function(lado){
    var s = new THREE.Shape();
    s.moveTo(-P / 2, 0); s.lineTo(P / 2, 0); s.lineTo(0, CUME - H - 0.05); s.lineTo(-P / 2, 0);
    var g = new THREE.ShapeGeometry(s);
    var uv = g.attributes.uv;
    for (var i = 0; i < uv.count; i++) uv.setXY(i, uv.getX(i) / H, uv.getY(i) / H);
    var m = new THREE.Mesh(g, mParede);
    m.rotation.y = lado * Math.PI / 2;
    m.position.set(lado * L / 2, H + 0.05, 0);
    casa.add(m);
  });

  // telhado de duas águas
  var beiral = 0.55, ladoX = L / 2 + 0.45;
  var run = P / 2 + beiral, yBeiral = H + 0.05 - beiral * (CUME - H) / (P / 2);
  var queda = CUME - yBeiral, comp = Math.sqrt(run * run + queda * queda), ang = Math.atan2(queda, run);
  [-1, 1].forEach(function(lado){
    var agua = caixa(ladoX * 2, 0.16, comp, mTelha, 0, (CUME + yBeiral) / 2, lado * run / 2, casa);
    agua.rotation.x = lado * ang;
    // acabamento branco na beirada
    var beira = caixa(ladoX * 2 + 0.05, 0.18, 0.1, mBranco, 0, yBeiral - 0.05, lado * (run + 0.02), casa);
  });
  caixa(ladoX * 2 + 0.06, 0.14, 0.3, mTelha, 0, CUME + 0.06, 0, casa);
  // acabamento nas pontas do telhado (frente e fundo da empena)
  [-1, 1].forEach(function(lx){
    [-1, 1].forEach(function(lz){
      var t = caixa(0.1, 0.22, comp, mBranco, lx * (ladoX + 0.02), (CUME + yBeiral) / 2 - 0.08, lz * run / 2, casa);
      t.rotation.x = lz * ang;
    });
  });
  // quinas brancas
  [[-1, 1], [1, 1], [-1, -1], [1, -1]].forEach(function(q){ caixa(0.18, H, 0.18, mBranco, q[0] * (L / 2 + 0.02), H / 2 + 0.05, q[1] * (P / 2 + 0.02), casa); });
  // faixa entre os andares
  caixa(L + 0.08, 0.14, 0.1, mBranco, 0, 3.25, P / 2 + 0.04, casa);

  // chaminé
  var chamine = caixa(0.9, 3.4, 0.9, mTijolo, 2.6, CUME - 0.9, -1.3, casa);
  caixa(1.1, 0.16, 1.1, material('#4a3a34'), 2.6, CUME + 0.86, -1.3, casa);
  var bocaChamine = new V3(2.6, CUME + 1.0, -1.3);

  /* ---------------- janelas ---------------- */
  // o que aparece através do vidro: luz quente, cortina dos lados e um detalhe de cada cômodo
  function texDentro(tipo){
    return texturaCanvas(128, 128, function(c, w, h){
      var g = c.createRadialGradient(w * 0.5, h * 0.42, 4, w * 0.5, h * 0.5, w * 0.75);
      g.addColorStop(0, '#fff2cf'); g.addColorStop(0.5, '#ffc77e'); g.addColorStop(1, '#b8622f');
      c.fillStyle = g; c.fillRect(0, 0, w, h);
      if (tipo === 'sala'){
        c.fillStyle = 'rgba(90,45,25,0.55)'; c.fillRect(10, 86, 70, 26); c.fillRect(14, 78, 62, 12);
        c.fillStyle = 'rgba(120,70,40,0.5)'; c.fillRect(84, 40, 3, 72); c.beginPath(); c.moveTo(78, 40); c.lineTo(94, 40); c.lineTo(90, 30); c.lineTo(82, 30); c.fill();
        c.fillStyle = 'rgba(110,60,35,0.4)'; [[22, 30, 16, 20], [44, 26, 20, 26], [70, 34, 10, 14]].forEach(function(q){ c.fillRect(q[0], q[1], q[2], q[3]); });
      } else if (tipo === 'cozinha'){
        c.strokeStyle = 'rgba(110,60,30,0.55)'; c.lineWidth = 2; c.beginPath(); c.moveTo(64, 0); c.lineTo(64, 34); c.stroke();
        c.fillStyle = 'rgba(110,60,30,0.6)'; c.beginPath(); c.moveTo(50, 46); c.lineTo(78, 46); c.lineTo(70, 34); c.lineTo(58, 34); c.fill();
        c.fillStyle = 'rgba(255,250,230,0.9)'; c.beginPath(); c.arc(64, 48, 6, 0, Math.PI * 2); c.fill();
        c.fillStyle = 'rgba(100,55,30,0.45)'; c.fillRect(0, 96, w, 32);
        c.fillStyle = 'rgba(120,150,90,0.6)'; c.beginPath(); c.arc(30, 92, 9, 0, Math.PI * 2); c.fill();
      } else if (tipo === 'quarto'){
        c.fillStyle = 'rgba(255,240,200,0.95)';
        for (var i = 0; i < 9; i++){ var x = 14 + i * 12.5, y = 26 + Math.sin(i / 8 * Math.PI) * 10; c.beginPath(); c.arc(x, y, 2.4, 0, Math.PI * 2); c.fill(); }
        c.fillStyle = 'rgba(120,60,60,0.4)'; c.fillRect(16, 90, 96, 30);
        c.fillStyle = 'rgba(255,230,230,0.35)'; c.fillRect(24, 84, 26, 10); c.fillRect(78, 84, 26, 10);
      } else {
        c.fillStyle = 'rgba(255,240,200,0.9)';
        for (var j = 0; j < 7; j++){ c.beginPath(); c.arc(16 + j * 16, 18 + Math.sin(j / 6 * Math.PI) * 8, 2.6, 0, Math.PI * 2); c.fill(); }
        c.fillStyle = 'rgba(90,50,30,0.45)'; c.fillRect(30, 92, 68, 30);
      }
      // cortinas
      [0, 1].forEach(function(lado){
        var x0 = lado ? w - 26 : 0;
        var cg = c.createLinearGradient(x0, 0, x0 + 26, 0);
        cg.addColorStop(0, 'rgba(245,215,205,0.95)'); cg.addColorStop(0.3, 'rgba(225,180,170,0.95)'); cg.addColorStop(0.6, 'rgba(250,225,215,0.95)'); cg.addColorStop(1, 'rgba(215,165,155,0.95)');
        c.fillStyle = cg;
        c.beginPath();
        if (lado){ c.moveTo(w, 0); c.lineTo(w - 26, 0); c.quadraticCurveTo(w - 14, h * 0.6, w - 20, h); c.lineTo(w, h); }
        else { c.moveTo(0, 0); c.lineTo(26, 0); c.quadraticCurveTo(14, h * 0.6, 20, h); c.lineTo(0, h); }
        c.fill();
      });
    }, null, true);
  }

  var reflexo = { value: new THREE.Color('#2a2f55') };
  var relogio = { value: 0 };
  function matVidro(tipo){
    return new THREE.ShaderMaterial({
      uniforms: { uMapa: { value: texDentro(tipo) }, uAceso: { value: 0 }, uFrio: reflexo, uTempo: relogio },
      vertexShader: 'varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }',
      fragmentShader: [
        'uniform sampler2D uMapa; uniform float uAceso; uniform vec3 uFrio; uniform float uTempo;',
        'varying vec2 vUv;',
        'void main(){',
        '  vec3 dentro = texture2D(uMapa, vUv).rgb;',
        '  float tremor = 0.97 + 0.03 * sin(uTempo * 2.3 + vUv.y * 3.0);',
        '  vec3 apagado = uFrio * (0.55 + 0.45 * vUv.y) + dentro * 0.04;',
        '  vec3 cor = mix(apagado, dentro * 1.08 * tremor, uAceso);',
        '  cor += vec3(0.1, 0.1, 0.14) * smoothstep(0.55, 1.0, vUv.x + vUv.y * 0.6) * (1.0 - uAceso * 0.75);',
        '  gl_FragColor = vec4(cor, 1.0);',
        '}'
      ].join('\n')
    });
  }

  var hotspots = [];
  var Z = P / 2 + 0.02;
  // moldura branca com cruzeta, peitoril e vidro; devolve o vidro
  function janela(id, x, y, w, h, opcoes){
    opcoes = opcoes || {};
    var g = new THREE.Group();
    g.position.set(x, y, Z);
    casa.add(g);
    var vidro = new THREE.Mesh(new THREE.PlaneGeometry(w, h), matVidro(opcoes.interior || id));
    vidro.position.z = 0.02;
    g.add(vidro);
    var e = 0.12;
    caixa(w + e * 2, e, 0.14, mBranco, 0, h / 2 + e / 2, 0.06, g);
    caixa(w + e * 2, e, 0.14, mBranco, 0, -h / 2 - e / 2, 0.06, g);
    caixa(e, h, 0.14, mBranco, -w / 2 - e / 2, 0, 0.06, g);
    caixa(e, h, 0.14, mBranco, w / 2 + e / 2, 0, 0.06, g);
    if (!opcoes.porta){
      caixa(0.05, h, 0.06, mBranco, 0, 0, 0.05, g);
      caixa(w, 0.05, 0.06, mBranco, 0, opcoes.travessa || 0, 0.05, g);
      caixa(w + 0.45, 0.08, 0.3, mBranco, 0, -h / 2 - e - 0.03, 0.14, g);
    } else {
      caixa(0.07, h, 0.07, mBranco, 0, 0, 0.05, g);
      for (var k = 1; k < 4; k++) caixa(w, 0.04, 0.05, mBranco, 0, -h / 2 + k * h / 4, 0.05, g);
    }
    if (opcoes.venezianas){
      [-1, 1].forEach(function(lado){
        var v = caixa(w * 0.48, h + 0.1, 0.06, mJanelaVerde, lado * (w / 2 + e + w * 0.26), 0, 0.03, g);
        for (var q = 0; q < 7; q++) caixa(w * 0.44, 0.03, 0.05, material('#c9718f'), lado * (w / 2 + e + w * 0.26), -h / 2 + 0.12 + q * (h - 0.1) / 6.5, 0.07, g);
      });
    }
    // área de toque bem maior que a janela, pra ser fácil acertar no celular
    var toque = new THREE.Mesh(new THREE.BoxGeometry(w + 1.2, h + 1.0, 1.4), new THREE.MeshBasicMaterial());
    toque.visible = false;
    toque.position.set(0, 0, 0.5);
    g.add(toque);
    var h0 = { id: id, alvo: toque, vidro: vidro, centro: new V3(x, y, Z + 0.1), grupo: g };
    hotspots.push(h0);
    return h0;
  }

  // floreira com rosinhas embaixo da janela
  var rosas = [], folhas = [];
  function floreira(x, y, w){
    caixa(w, 0.3, 0.32, mBranco, x, y, Z + 0.2, casa);
    for (var i = 0; i < Math.round(w * 6); i++){
      var px = x - w / 2 + 0.1 + r() * (w - 0.2), pz = Z + 0.16 + r() * 0.12;
      folhas.push([px, y + 0.2 + r() * 0.1, pz, 0.12 + r() * 0.06]);
      if (r() < 0.75) rosas.push([px + (r() - 0.5) * 0.08, y + 0.3 + r() * 0.12, pz + 0.05, 0.05 + r() * 0.025]);
    }
  }

  janela('sala', -2.35, 1.95, 1.7, 1.55, { venezianas: true, travessa: 0.15 });
  floreira(-2.35, 0.9, 1.9);
  janela('cozinha', 2.35, 1.95, 1.5, 1.4, { venezianas: true });
  floreira(2.35, 0.95, 1.7);
  janela('quarto', -2.1, 4.75, 1.4, 1.4, { travessa: 0.1 });
  floreira(-2.1, 3.75, 1.6);
  var portaVaranda = janela('varanda', 2.1, 4.55, 1.2, 2.0, { porta: true, interior: 'varanda' });

  /* ---------------- porta da frente ---------------- */
  var portaG = new THREE.Group();
  portaG.position.set(0, 0.45, Z);
  casa.add(portaG);
  caixa(1.15, 2.35, 0.1, mPorta, 0, 1.175, 0.04, portaG);
  [[-0.27, 1.55], [0.27, 1.55], [-0.27, 0.65], [0.27, 0.65]].forEach(function(q){ caixa(0.4, q[1] > 1 ? 0.8 : 0.7, 0.04, material('#8d2f55', { roughness: 0.5 }), q[0], q[1], 0.11, portaG); });
  caixa(1.4, 0.14, 0.16, mBranco, 0, 2.42, 0.06, portaG);
  caixa(0.12, 2.4, 0.16, mBranco, -0.64, 1.2, 0.06, portaG);
  caixa(0.12, 2.4, 0.16, mBranco, 0.64, 1.2, 0.06, portaG);
  var macaneta = new THREE.Mesh(new THREE.SphereGeometry(0.045, 10, 8), material('#d1a75a', { metalness: 0.8, roughness: 0.3 }));
  macaneta.position.set(0.38, 1.15, 0.14); portaG.add(macaneta);
  var placa = new THREE.Mesh(new THREE.PlaneGeometry(0.36, 0.27), new THREE.MeshStandardMaterial({ map: texPlaca, roughness: 0.6 }));
  placa.position.set(0.95, 1.95, 0.03); portaG.add(placa);
  // degraus
  caixa(1.9, 0.18, 0.5, mFundacao, 0, 0.36, Z + 0.25, casa);
  caixa(2.3, 0.18, 0.5, mFundacao, 0, 0.18, Z + 0.6, casa);
  // telhadinho em cima da porta
  var marquise = caixa(2.0, 0.1, 0.9, mTelha, 0, 3.0, Z + 0.4, casa);
  marquise.rotation.x = 0.28;
  [-0.85, 0.85].forEach(function(x){ var m = caixa(0.07, 0.07, 0.75, mBranco, x, 2.82, Z + 0.32, casa); m.rotation.x = -0.7; });
  // lanterna ao lado da porta
  var lanterna = new THREE.Group();
  lanterna.position.set(-0.95, 2.25, Z + 0.12);
  casa.add(lanterna);
  caixa(0.06, 0.06, 0.16, mMetal, 0, 0.12, -0.06, lanterna);
  caixa(0.22, 0.04, 0.22, mMetal, 0, 0.2, 0.06, lanterna);
  caixa(0.18, 0.04, 0.18, mMetal, 0, -0.14, 0.06, lanterna);
  var chamaLanterna = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.28, 0.14), new THREE.MeshBasicMaterial({ color: 0x3a2a1a }));
  chamaLanterna.userData.manter = true;
  chamaLanterna.position.set(0, 0.03, 0.06);
  lanterna.add(chamaLanterna);
  // a porta também entra na sala
  var toquePorta = new THREE.Mesh(new THREE.BoxGeometry(1.8, 3.0, 1.4), new THREE.MeshBasicMaterial());
  toquePorta.visible = false;
  toquePorta.position.set(0, 1.5, 0.6);
  portaG.add(toquePorta);
  hotspots.push({ id: 'sala', alvo: toquePorta, vidro: null, centro: new V3(0, 1.7, Z + 0.1), grupo: portaG, porta: true });

  /* ---------------- varanda (no segundo andar) ---------------- */
  var VX0 = 0.75, VX1 = 3.45, VZ = Z + 1.35, VY = 3.42;
  caixa(VX1 - VX0, 0.14, VZ - Z, mMadeira, (VX0 + VX1) / 2, VY, (Z + VZ) / 2, casa);
  caixa(VX1 - VX0 + 0.06, 0.08, 0.08, mBranco, (VX0 + VX1) / 2, VY - 0.1, VZ, casa);
  // mãos-francesas embaixo da varanda
  [VX0 + 0.2, VX1 - 0.2].forEach(function(x){ var m = caixa(0.1, 0.1, 1.5, mBranco, x, VY - 0.55, Z + 0.62, casa); m.rotation.x = 0.75; });
  // grade
  var yCorr = VY + 0.95;
  caixa(VX1 - VX0, 0.07, 0.09, mBranco, (VX0 + VX1) / 2, yCorr, VZ, casa);
  caixa(0.07, 0.07, VZ - Z, mBranco, VX0, yCorr, (Z + VZ) / 2, casa);
  caixa(0.07, 0.07, VZ - Z, mBranco, VX1, yCorr, (Z + VZ) / 2, casa);
  for (var gx = VX0; gx <= VX1 + 0.001; gx += 0.18) caixa(0.035, 0.9, 0.035, mBranco, gx, VY + 0.5, VZ, casa);
  for (var gz = Z + 0.18; gz < VZ; gz += 0.18){ caixa(0.035, 0.9, 0.035, mBranco, VX0, VY + 0.5, gz, casa); caixa(0.035, 0.9, 0.035, mBranco, VX1, VY + 0.5, gz, casa); }
  // vasinhos na varanda
  [[VX0 + 0.3, Z + 0.35], [VX1 - 0.3, Z + 0.35]].forEach(function(q){
    var vaso = new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.11, 0.26, 10), material('#b8673f'));
    vaso.position.set(q[0], VY + 0.2, q[1]); casa.add(vaso);
    for (var i = 0; i < 5; i++) folhas.push([q[0] + (r() - 0.5) * 0.2, VY + 0.42 + r() * 0.12, q[1] + (r() - 0.5) * 0.2, 0.13]);
    for (var j = 0; j < 4; j++) rosas.push([q[0] + (r() - 0.5) * 0.22, VY + 0.52 + r() * 0.1, q[1] + (r() - 0.5) * 0.2, 0.05]);
  });
  // toque na varanda inteira
  var toqueVaranda = new THREE.Mesh(new THREE.BoxGeometry(VX1 - VX0 + 0.6, 2.8, VZ - Z + 0.8), new THREE.MeshBasicMaterial());
  toqueVaranda.visible = false;
  toqueVaranda.position.set((VX0 + VX1) / 2, VY + 1.2, (Z + VZ) / 2 + 0.2);
  casa.add(toqueVaranda);
  hotspots.push({ id: 'varanda', alvo: toqueVaranda, vidro: portaVaranda.vidro, centro: new V3((VX0 + VX1) / 2, VY + 1.1, VZ), grupo: null });

  /* ---------------- jardim ---------------- */
  // chão: gramado que some na neblina
  var chaoGeo = new THREE.CircleGeometry(160, 64, 0, Math.PI * 2);
  var texGramado = texturaCanvas(256, 256, function(c, w, h){
    c.fillStyle = '#3f6233'; c.fillRect(0, 0, w, h);
    for (var k = 0; k < 2600; k++){
      var t = Math.random();
      c.fillStyle = t < 0.5 ? 'rgba(30,55,25,0.35)' : (t < 0.85 ? 'rgba(95,135,65,0.3)' : 'rgba(140,150,80,0.25)');
      var x = Math.random() * w, y = Math.random() * h;
      c.fillRect(x, y, 1 + Math.random() * 2, 3 + Math.random() * 5);
    }
  }, [70, 70]);
  var chao = new THREE.Mesh(chaoGeo, new THREE.MeshLambertMaterial({ map: texGramado, color: corReal('#cfd8c4') }));
  chao.rotation.x = -Math.PI / 2;
  scene.add(chao);

  // caminho de pedras do portão até a porta
  var nPedras = 9;
  var pedraGeo = new THREE.CylinderGeometry(0.42, 0.46, 0.08, 9);
  var pedras = new THREE.InstancedMesh(pedraGeo, new THREE.MeshLambertMaterial({ color: corReal('#a49b8f') }), nPedras);
  var mat4 = new THREE.Matrix4(), q4 = new THREE.Quaternion(), s4 = new V3(), p4 = new V3();
  for (var ip = 0; ip < nPedras; ip++){
    var zz = Z + 1.3 + ip * 0.9, xx = Math.sin(ip * 0.9) * 0.25 + (r() - 0.5) * 0.12;
    q4.setFromEuler(new THREE.Euler(0, r() * 3, 0));
    s4.set(0.85 + r() * 0.3, 1, 0.7 + r() * 0.25);
    p4.set(xx, 0.04, zz);
    mat4.compose(p4, q4, s4);
    pedras.setMatrixAt(ip, mat4);
  }
  scene.add(pedras);

  // grama de verdade perto da casa
  var grama = (function(){
    var n = celular ? 4200 : 7000;
    var geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.Float32BufferAttribute([-0.5,0,0, 0.5,0,0, -0.32,0.45,0, 0.32,0.45,0, 0,1,0], 3));
    geo.setAttribute('normal', new THREE.Float32BufferAttribute([0,1,0, 0,1,0, 0,1,0, 0,1,0, 0,1,0], 3));
    var base = new THREE.Color('#1c2e17'), ponta = new THREE.Color('#5d8a3f');
    geo.setAttribute('color', new THREE.Float32BufferAttribute([base.r,base.g,base.b, base.r,base.g,base.b, 0.6*base.r+0.4*ponta.r,0.6*base.g+0.4*ponta.g,0.6*base.b+0.4*ponta.b, 0.6*base.r+0.4*ponta.r,0.6*base.g+0.4*ponta.g,0.6*base.b+0.4*ponta.b, ponta.r,ponta.g,ponta.b], 3));
    geo.setIndex([0,1,2, 1,3,2, 2,3,4]);
    var mat = new THREE.MeshLambertMaterial({ vertexColors: true, side: THREE.DoubleSide });
    var tempo = { value: 0 };
    mat.onBeforeCompile = function(sh){
      sh.uniforms.uTempo = tempo;
      sh.vertexShader = 'uniform float uTempo;\n' + sh.vertexShader.replace('#include <project_vertex>', [
        'vec4 mvPosition = vec4(transformed, 1.0);',
        '#ifdef USE_INSTANCING',
        '  mvPosition = instanceMatrix * mvPosition;',
        '#endif',
        'float hh = position.y * position.y;',
        'mvPosition.x += sin(uTempo * 1.5 + mvPosition.x * 0.6 + mvPosition.z * 0.4) * hh * 0.06;',
        'mvPosition.z += cos(uTempo * 1.2 + mvPosition.x * 0.3) * hh * 0.03;',
        'mvPosition = modelViewMatrix * mvPosition;',
        'gl_Position = projectionMatrix * mvPosition;'
      ].join('\n'));
    };
    var im = new THREE.InstancedMesh(geo, mat, n);
    var cor = new THREE.Color();
    var k = 0, tentativas = 0;
    while (k < n && tentativas < n * 4){
      tentativas++;
      var x = (r() - 0.5) * 30, z = -7 + r() * 20;
      if (Math.abs(x) < L / 2 + 0.25 && Math.abs(z) < P / 2 + 0.25) continue;          // dentro da casa
      if (Math.abs(x) < 0.85 && z > Z && z < 10.4) continue;                            // caminho
      var dist = Math.sqrt(x * x + (z - 2) * (z - 2));
      if (r() < dist / 18) continue;                                                     // mais denso perto
      q4.setFromEuler(new THREE.Euler(0, r() * 6.28, 0));
      var alt = 0.18 + r() * 0.24;
      s4.set(0.05 + r() * 0.04, alt, 1);
      p4.set(x, 0, z);
      mat4.compose(p4, q4, s4);
      im.setMatrixAt(k, mat4);
      cor.setHSL(0.27 + r() * 0.06, 0.5, 0.75 + r() * 0.35);
      im.setColorAt(k, cor);
      k++;
    }
    im.count = k;
    im.frustumCulled = false;
    scene.add(im);
    return { mesh: im, tempo: tempo };
  })();

  // cerca branca com portão aberto
  var cerca = (function(){
    var zC = 10.4, xs = [];
    for (var x = -13; x <= 13.01; x += 0.32) if (Math.abs(x) > 0.95) xs.push(x);
    var geo = new THREE.BoxGeometry(0.1, 1.0, 0.05);
    var im = new THREE.InstancedMesh(geo, mBranco, xs.length);
    xs.forEach(function(x, i){
      mat4.compose(p4.set(x, 0.5, zC), q4.set(0, 0, 0, 1), s4.set(1, 0.9 + (Math.abs(Math.round(x / 0.32)) % 2) * 0.12, 1));
      im.setMatrixAt(i, mat4);
    });
    scene.add(im);
    [-1, 1].forEach(function(lado){
      caixa(12.1, 0.07, 0.05, mBranco, lado * 7.0, 0.75, zC - 0.04, scene);
      caixa(12.1, 0.07, 0.05, mBranco, lado * 7.0, 0.3, zC - 0.04, scene);
      caixa(0.14, 1.2, 0.14, mBranco, lado * 0.95, 0.6, zC, scene);
    });
    // portão aberto pra dentro
    var portao = new THREE.Group();
    portao.position.set(-0.9, 0, zC);
    portao.rotation.y = -1.1;
    scene.add(portao);
    for (var i = 0; i < 5; i++) caixa(0.1, 0.95, 0.05, mBranco, 0.16 + i * 0.32 * 0.5, 0.48, 0, portao);
    caixa(0.85, 0.07, 0.05, mBranco, 0.42, 0.75, -0.04, portao);
    caixa(0.85, 0.07, 0.05, mBranco, 0.42, 0.3, -0.04, portao);
    return im;
  })();

  // poste de luz no portão
  var poste = new THREE.Group();
  poste.position.set(1.55, 0, 10.0);
  scene.add(poste);
  var hasteP = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.07, 2.4, 8), mMetal);
  hasteP.position.y = 1.2; poste.add(hasteP);
  caixa(0.3, 0.05, 0.3, mMetal, 0, 2.62, 0, poste);
  var vidroPoste = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.3, 0.22), new THREE.MeshBasicMaterial({ color: 0x3a2a1a }));
  vidroPoste.userData.manter = true;
  vidroPoste.position.y = 2.45; poste.add(vidroPoste);
  caixa(0.26, 0.04, 0.26, mMetal, 0, 2.28, 0, poste);

  // caixa de correio
  var correio = new THREE.Group();
  correio.position.set(-1.6, 0, 10.0);
  scene.add(correio);
  var hasteC = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 1.0, 6), mMadeira);
  hasteC.position.y = 0.5; correio.add(hasteC);
  var cx = caixaRedonda(0.3, 0.26, 0.45, 0.1, material('#ef9cb6', { roughness: 0.5 }), 0, 1.1, 0, correio);
  var bandeira = caixa(0.03, 0.18, 0.06, material('#e8c35a'), 0.17, 1.2, 0.08, correio);

  // roseiras: ao longo da cerca e dos lados do caminho
  function roseira(x, z, tam){
    var nf = Math.round(4 + tam * 6);
    for (var i = 0; i < nf; i++) folhas.push([x + (r() - 0.5) * tam, 0.15 + r() * tam * 0.5, z + (r() - 0.5) * tam * 0.6, tam * (0.3 + r() * 0.2)]);
    var nr = Math.round(3 + tam * 8);
    for (var j = 0; j < nr; j++) rosas.push([x + (r() - 0.5) * tam * 1.1, 0.25 + r() * tam * 0.6, z + (r() - 0.5) * tam * 0.7 + 0.08, 0.055 + r() * 0.03]);
  }
  for (var rx = -12.4; rx <= 12.4; rx += 1.15) if (Math.abs(rx) > 1.6) roseira(rx + (r() - 0.5) * 0.3, 9.85, 0.75 + r() * 0.35);
  [-1, 1].forEach(function(lado){
    for (var zr = Z + 1.6; zr < 9.2; zr += 1.25) roseira(lado * (1.15 + r() * 0.2), zr, 0.55 + r() * 0.2);
    roseira(lado * 3.3, Z + 0.75, 1.1);
    roseira(lado * 1.45, Z + 0.7, 0.8);
  });

  var folhagem = new THREE.InstancedMesh(new THREE.IcosahedronGeometry(1, 0), new THREE.MeshLambertMaterial({ color: corReal('#2f5a2c'), flatShading: true }), folhas.length);
  folhas.forEach(function(f, i){
    q4.setFromEuler(new THREE.Euler(r() * 3, r() * 3, r() * 3));
    mat4.compose(p4.set(f[0], f[1], f[2]), q4, s4.set(f[3], f[3] * 0.85, f[3]));
    folhagem.setMatrixAt(i, mat4);
    folhagem.setColorAt(i, new THREE.Color().setHSL(0.3 + r() * 0.05, 0.45, 0.65 + r() * 0.5));
  });
  scene.add(folhagem);

  var CORES_ROSA = ['#c4122f', '#e44f88', '#f3a2bf', '#fff1f2', '#ff9772', '#c4122f', '#e44f88'];
  var botoes = new THREE.InstancedMesh(new THREE.IcosahedronGeometry(1, 1), new THREE.MeshLambertMaterial({ color: 0xffffff }), rosas.length);
  rosas.forEach(function(f, i){
    mat4.compose(p4.set(f[0], f[1], f[2]), q4.set(0, 0, 0, 1), s4.set(f[3], f[3] * 0.85, f[3]));
    botoes.setMatrixAt(i, mat4);
    botoes.setColorAt(i, corReal(CORES_ROSA[Math.floor(r() * CORES_ROSA.length)]));
  });
  scene.add(botoes);

  // árvores: tronco e copa de bolotas
  var mTronco = material('#4a3426', { roughness: 1 });
  var copas = [];
  function arvore(x, z, alt, larg){
    var tronco = new THREE.Mesh(new THREE.CylinderGeometry(0.16 * larg, 0.26 * larg, alt * 0.55, 7), mTronco);
    tronco.position.set(x, alt * 0.275, z);
    scene.add(tronco);
    var n = 9;
    for (var i = 0; i < n; i++){
      var a = i / n * Math.PI * 2, rr = (i === 0 ? 0 : 0.9 + r() * 0.5) * larg;
      copas.push([x + Math.cos(a) * rr, alt * (0.62 + r() * 0.3) + (i === 0 ? 0.5 : 0), z + Math.sin(a) * rr, larg * (1.0 + r() * 0.45)]);
    }
  }
  arvore(-8.2, -3.5, 7.5, 1.6);
  arvore(-11.5, 4.5, 5.2, 1.15);
  arvore(8.6, -2.5, 6.6, 1.45);
  arvore(12.5, 5.5, 4.6, 1.0);
  var copa = new THREE.InstancedMesh(new THREE.IcosahedronGeometry(1, 1), new THREE.MeshLambertMaterial({ color: corReal('#2c4f2a'), flatShading: true }), copas.length);
  copas.forEach(function(f, i){
    q4.setFromEuler(new THREE.Euler(r() * 3, r() * 3, r() * 3));
    mat4.compose(p4.set(f[0], f[1], f[2]), q4, s4.set(f[3], f[3] * 0.8, f[3]));
    copa.setMatrixAt(i, mat4);
    copa.setColorAt(i, new THREE.Color().setHSL(0.29 + r() * 0.05, 0.4, 0.6 + r() * 0.5));
  });
  scene.add(copa);

  // morros e mato lá no fundo, pra o horizonte não ficar reto
  (function(){
    var n = 70, im = new THREE.InstancedMesh(new THREE.ConeGeometry(1, 1, 6), new THREE.MeshLambertMaterial({ color: corReal('#1d3320') }), n);
    for (var i = 0; i < n; i++){
      var a = -Math.PI * 0.95 + (i / n) * Math.PI * 1.9 + (r() - 0.5) * 0.05, d = 45 + r() * 30;
      var h = 6 + r() * 10;
      mat4.compose(p4.set(Math.sin(a) * d, h / 2 - 0.5, -Math.cos(a) * d), q4.set(0, 0, 0, 1), s4.set(2.2 + r() * 2, h, 2.2 + r() * 2));
      im.setMatrixAt(i, mat4);
    }
    scene.add(im);
    var morros = new THREE.InstancedMesh(new THREE.SphereGeometry(1, 16, 8, 0, Math.PI * 2, 0, Math.PI / 2), new THREE.MeshLambertMaterial({ color: corReal('#24402a') }), 7);
    for (var j = 0; j < 7; j++){
      var a2 = -1.2 + j * 0.4 + (r() - 0.5) * 0.2, d2 = 80 + r() * 25;
      mat4.compose(p4.set(Math.sin(a2) * d2, -1, -Math.cos(a2) * d2), q4.set(0, 0, 0, 1), s4.set(30 + r() * 20, 10 + r() * 8, 20));
      morros.setMatrixAt(j, mat4);
    }
    scene.add(morros);
  })();

  /* ---------------- luzes de verdade (poucas, pra não pesar) ---------------- */
  var luzFrente = new THREE.PointLight(corReal('#ffb46b'), 0, 10, 1.6);  // o que sai das janelas de baixo
  luzFrente.position.set(0, 1.9, Z + 1.6);
  scene.add(luzFrente);
  var luzVaranda = new THREE.PointLight(corReal('#ffc78a'), 0, 7, 1.8);
  luzVaranda.position.set((VX0 + VX1) / 2, VY + 1.6, VZ - 0.2);
  scene.add(luzVaranda);
  var luzPoste = new THREE.PointLight(corReal('#ffcf8f'), 0, 8, 1.8);
  luzPoste.position.set(1.55, 2.4, 10.0);
  scene.add(luzPoste);

  /* ---------------- brilhos ---------------- */
  var lista = [];
  // halo em volta das janelas (grupos 0 sala, 1 cozinha, 2 quarto, 3 varanda)
  var GRUPO = { sala: 0, cozinha: 1, quarto: 2, varanda: 3 };
  hotspots.forEach(function(h){
    if (!h.vidro || h.porta) return;
    var g = GRUPO[h.id];
    lista.push({ x: h.centro.x, y: h.centro.y, z: h.centro.z + 0.15, tam: 1.6, cor: '#ffb870', forca: 0.42, grupo: g });
  });
  // poças de luz no chão na frente das janelas de baixo
  lista.push({ x: -2.35, y: 0.03, z: Z + 1.8, tam: 2.6, cor: '#ffb066', forca: 0.5, tipo: 3, grupo: 0 });
  lista.push({ x: 2.35, y: 0.03, z: Z + 1.8, tam: 2.4, cor: '#ffb066', forca: 0.5, tipo: 3, grupo: 1 });
  // lanterna da porta e poste (grupo 4)
  lista.push({ x: -0.95, y: 2.28, z: Z + 0.2, tam: 0.6, cor: '#ffd08a', forca: 1.0, tipo: 2, grupo: 4, fase: 1 });
  lista.push({ x: 0, y: 0.05, z: Z + 1.2, tam: 1.8, cor: '#ffb870', forca: 0.55, tipo: 3, grupo: 4 });
  lista.push({ x: 1.55, y: 2.45, z: 10.0, tam: 0.75, cor: '#ffd59a', forca: 1.0, tipo: 2, grupo: 4, fase: 3 });
  lista.push({ x: 1.55, y: 0.05, z: 10.0, tam: 2.6, cor: '#ffc27a', forca: 0.55, tipo: 3, grupo: 4 });
  // varal de luzinhas da varanda (grupo 3)
  var lampadas = [];
  var fios = material('#1c1a18');
  var a1 = new V3(VX0 - 0.02, VY + 2.4, Z + 0.15), b1 = new V3(VX1 + 0.02, VY + 2.4, Z + 0.15);
  var a2 = new V3(VX0, yCorr + 0.05, VZ), b2 = new V3(VX1, yCorr + 0.05, VZ);
  var a3 = new V3(VX0, VY + 2.3, Z + 0.2), b3 = new V3(VX0, yCorr + 0.1, VZ);
  [[a1, b1, 0.35, 11], [a2, b2, 0.12, 10], [new V3(VX1, VY + 2.3, Z + 0.2), new V3(VX1, yCorr + 0.1, VZ), 0.2, 5], [a3, b3, 0.2, 5]].forEach(function(v){
    fioDeVaral(v[0], v[1], v[2], fios, casa);
    pontosDeVaral(v[0], v[1], v[3], v[2]).forEach(function(p, i){ lampadas.push(p); lista.push({ x: p.x, y: p.y - 0.03, z: p.z, tam: 0.22, cor: '#ffd98f', forca: 1.0, grupo: 3, fase: i * 0.7 }); });
  });
  var bulbos = new THREE.InstancedMesh(new THREE.SphereGeometry(0.035, 8, 6), new THREE.MeshBasicMaterial({ color: 0x3a3226 }), lampadas.length);
  lampadas.forEach(function(p, i){ mat4.compose(p4.set(p.x, p.y - 0.03, p.z), q4.set(0, 0, 0, 1), s4.set(1, 1.25, 1)); bulbos.setMatrixAt(i, mat4); });
  casa.add(bulbos);
  // vaga-lumes no jardim (grupo 5)
  for (var v = 0; v < (celular ? 40 : 60); v++){
    var vx = (r() - 0.5) * 24, vz = -2 + r() * 13;
    if (Math.abs(vx) < 4.4 && vz < Z + 0.4) vz += 6;
    lista.push({ x: vx, y: 0.4 + r() * 1.8, z: vz, tam: 0.16, cor: '#e2ff8c', forca: 1.0, tipo: 1, grupo: 5, fase: r() * 10 });
  }
  var brilhos = criarBrilhos(lista);
  scene.add(brilhos.mesh);
  for (var gi = 0; gi < 8; gi++) brilhos.grupo(gi, 0);

  /* ---------------- fumaça da chaminé ---------------- */
  var fumaca = (function(){
    var n = 9, g = quadBase(), dados = new Float32Array(n);
    for (var i = 0; i < n; i++) dados[i] = i / n;
    g.setAttribute('fase', new THREE.InstancedBufferAttribute(dados, 1));
    g.instanceCount = n;
    var uu = { uTempo: relogio, uBoca: { value: bocaChamine }, uCor: { value: new THREE.Color('#9a93a6') }, uForca: { value: 0.35 } };
    var m = new THREE.Mesh(g, new THREE.ShaderMaterial({
      uniforms: uu, transparent: true, depthWrite: false,
      vertexShader: [
        'attribute float fase; uniform float uTempo; uniform vec3 uBoca;',
        'varying vec2 vC; varying float vA;',
        'void main(){',
        '  float k = fract(uTempo * 0.06 + fase);',
        '  vec3 c = uBoca + vec3(k * 2.2 + sin(k * 6.0 + fase * 9.0) * 0.3, k * 4.5, -k * 0.6);',
        '  float tam = 0.35 + k * 1.6;',
        '  vec4 mv = modelViewMatrix * vec4(c, 1.0);',
        '  mv.xy += position.xy * tam;',
        '  gl_Position = projectionMatrix * mv;',
        '  vC = position.xy; vA = smoothstep(0.0, 0.12, k) * (1.0 - smoothstep(0.45, 1.0, k));',
        '}'
      ].join('\n'),
      fragmentShader: [
        'uniform vec3 uCor; uniform float uForca; varying vec2 vC; varying float vA;',
        'void main(){',
        '  float a = exp(-dot(vC, vC) * 3.0) * vA * uForca;',
        '  gl_FragColor = vec4(uCor, a);',
        '}'
      ].join('\n')
    }));
    m.frustumCulled = false;
    m.renderOrder = 4;
    scene.add(m);
    return uu;
  })();

  // tudo que é parado vira poucos desenhos
  var estaticos = new THREE.Group();
  scene.add(estaticos);
  mesclarEstaticos(casa, estaticos);
  [poste, correio].forEach(function(o){ mesclarEstaticos(o, estaticos); });

  /* ---------------- acender as coisas ---------------- */
  var acesas = { sala: 0, cozinha: 0, quarto: 0, varanda: 0, lanternas: 0, vagalumes: 0 };
  var corChamaApagada = new THREE.Color(0x3a2a1a), corChamaAcesa = new THREE.Color(0xffe2a8);
  function acender(nome, t){
    acesas[nome] = t;
    if (GRUPO[nome] !== undefined) brilhos.grupo(GRUPO[nome], t);
    if (nome === 'lanternas'){
      brilhos.grupo(4, t);
      chamaLanterna.material.color.copy(corChamaApagada).lerp(corChamaAcesa, t);
      vidroPoste.material.color.copy(corChamaApagada).lerp(corChamaAcesa, t);
      luzPoste.intensity = 1.4 * t;
    }
    if (nome === 'vagalumes') brilhos.grupo(5, t);
    if (nome === 'varanda'){
      bulbos.material.color.copy(new THREE.Color(0x3a3226)).lerp(new THREE.Color(0xffe7b0), t);
      luzVaranda.intensity = 1.3 * t;
    }
    hotspots.forEach(function(h){ if (h.id === nome && h.vidro) h.vidro.material.uniforms.uAceso.value = t; });
    luzFrente.intensity = 1.1 * Math.max(acesas.sala, acesas.cozinha) + 0.5 * acesas.lanternas;
  }

  function atualizar(dt, ceu){
    relogio.value += dt;
    brilhos.u.uTempo.value = relogio.value;
    grama.tempo.value = relogio.value;
    // o vidro apagado reflete o céu
    reflexo.value.set(ceu.estado.noite > 0.5 ? '#1a2142' : '#7a6390').lerp(new THREE.Color('#1a2142'), ceu.estado.p);
    fumaca.uCor.value.set('#b5a6b8').lerp(new THREE.Color('#5b5f78'), ceu.estado.noite);
  }

  // aparelho sofrendo: metade da grama
  function aliviar(){ grama.mesh.count = Math.floor(grama.mesh.count / 2); }

  return {
    hotspots: hotspots, acender: acender, atualizar: atualizar, aliviar: aliviar,
    alvoCamera: new V3(0, 3.7, 1.2),
    caixaFrente: { meiaLargura: 5.1, base: -0.2, topo: CUME + 1.4 }
  };
}
