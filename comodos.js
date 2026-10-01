/* os cômodos por dentro: sala, quarto, cozinha e varanda */
function criarComodos(celular){
  var r = sorteio(520);
  var m4 = new THREE.Matrix4(), q4 = new THREE.Quaternion(), s4 = new V3(), p4 = new V3();

  /* ---------------- texturas que mais de um cômodo usa ---------------- */
  function texAssoalho(cor1, cor2){
    return texturaCanvas(256, 256, function(c, w, h){
      var n = 6, alt = h / n;
      for (var i = 0; i < n; i++){
        var off = (i * 97) % w;
        for (var x = -off; x < w; x += 180){
          var t = Math.random();
          var g = c.createLinearGradient(0, i * alt, 0, (i + 1) * alt);
          var base = new THREE.Color(cor1).lerp(new THREE.Color(cor2), t);
          g.addColorStop(0, '#' + base.clone().offsetHSL(0, 0, 0.04).getHexString());
          g.addColorStop(1, '#' + base.clone().offsetHSL(0, 0, -0.04).getHexString());
          c.fillStyle = g; c.fillRect(x, i * alt, 178, alt - 2);
          c.strokeStyle = 'rgba(60,35,20,0.12)';
          for (var k = 0; k < 5; k++){ c.beginPath(); var yy = i * alt + 4 + Math.random() * (alt - 8); c.moveTo(x, yy); c.bezierCurveTo(x + 60, yy + 3, x + 120, yy - 3, x + 178, yy); c.stroke(); }
        }
        c.fillStyle = 'rgba(40,25,15,0.5)'; c.fillRect(0, (i + 1) * alt - 2, w, 2);
      }
    }, [3, 3]);
  }

  // casca do cômodo: chão, paredes e rodapé
  function casca(scene, opcoes){
    var W = opcoes.largura || 7, D = opcoes.fundo || 6, H = opcoes.altura || 3.2;
    var chao = new THREE.Mesh(new THREE.PlaneGeometry(W, D), new THREE.MeshStandardMaterial({ map: opcoes.chao, roughness: 0.75 }));
    chao.rotation.x = -Math.PI / 2;
    scene.add(chao);
    var mParede = new THREE.MeshStandardMaterial({ map: opcoes.parede, color: 0xffffff, roughness: 0.95 });
    var fundo = new THREE.Mesh(new THREE.PlaneGeometry(W, H), mParede);
    fundo.position.set(0, H / 2, -D / 2);
    scene.add(fundo);
    [-1, 1].forEach(function(lado){
      var p = new THREE.Mesh(new THREE.PlaneGeometry(D, H), opcoes.lateral || mParede);
      p.rotation.y = -lado * Math.PI / 2;
      p.position.set(lado * W / 2, H / 2, 0);
      scene.add(p);
    });
    var teto = new THREE.Mesh(new THREE.PlaneGeometry(W, D), material(opcoes.teto || '#cbbba6', { roughness: 1 }));
    teto.rotation.x = Math.PI / 2;
    teto.position.y = H;
    scene.add(teto);
    var mRodape = material(opcoes.rodape || '#f4efe6', { roughness: 0.6 });
    caixa(W, 0.14, 0.03, mRodape, 0, 0.07, -D / 2 + 0.015, scene);
    caixa(W, 0.12, 0.06, mRodape, 0, H - 0.06, -D / 2 + 0.03, scene);
    caixa(0.03, 0.14, D, mRodape, -W / 2 + 0.015, 0.07, 0, scene);
    caixa(0.03, 0.14, D, mRodape, W / 2 - 0.015, 0.07, 0, scene);
    return { W: W, D: D, H: H };
  }

  function texPapelDeParede(fundo, desenho, tom){
    return texturaCanvas(256, 256, function(c, w, h){
      c.fillStyle = fundo; c.fillRect(0, 0, w, h);
      c.fillStyle = tom;
      if (desenho === 'listras'){
        for (var x = 0; x < w; x += 32){ c.globalAlpha = 0.5; c.fillRect(x, 0, 12, h); c.globalAlpha = 0.25; c.fillRect(x + 18, 0, 3, h); }
      } else if (desenho === 'bolinhas'){
        for (var y = 0; y < h; y += 32) for (var x2 = (y / 32 % 2) * 16; x2 < w; x2 += 32){ c.globalAlpha = 0.55; c.beginPath(); c.arc(x2 + 8, y + 8, 2.6, 0, Math.PI * 2); c.fill(); }
      } else if (desenho === 'folhas'){
        c.globalAlpha = 0.35;
        for (var k = 0; k < 14; k++){
          var fx = (k * 73) % w, fy = (k * 151) % h;
          c.save(); c.translate(fx, fy); c.rotate(k);
          c.beginPath(); c.ellipse(0, 0, 14, 5, 0, 0, Math.PI * 2); c.fill();
          c.restore();
        }
      }
      c.globalAlpha = 1;
      for (var n = 0; n < 1500; n++){ c.fillStyle = 'rgba(0,0,0,' + Math.random() * 0.03 + ')'; c.fillRect(Math.random() * w, Math.random() * h, 1, 1); }
    }, [5, 2]);
  }

  // abajur: base, haste, cúpula acesa e luz quente de verdade
  function abajur(scene, x, y, z, alt, brilhos, opcoes){
    opcoes = opcoes || {};
    var mBase = material(opcoes.base || '#2f2a26', { metalness: 0.3, roughness: 0.5 });
    var base = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.2, 0.05, 16), mBase);
    base.position.set(x, y + 0.025, z); scene.add(base);
    var haste = new THREE.Mesh(new THREE.CylinderGeometry(0.018, 0.018, alt, 8), mBase);
    haste.position.set(x, y + alt / 2, z); scene.add(haste);
    var cup = new THREE.Mesh(new THREE.CylinderGeometry(opcoes.topo || 0.17, opcoes.boca || 0.26, opcoes.cupAlt || 0.32, 20, 1, true),
      new THREE.MeshStandardMaterial({ color: corReal(opcoes.cupula || '#f3e1c2'), emissive: corReal('#ffb466'), emissiveIntensity: 0.9, side: THREE.DoubleSide, roughness: 1 }));
    cup.position.set(x, y + alt + 0.05, z); scene.add(cup);
    var luz = new THREE.PointLight(corReal('#ffbe7a'), opcoes.forca || 1.6, opcoes.alcance || 7, 1.6);
    luz.position.set(x, y + alt, z + 0.1); scene.add(luz);
    brilhos.push({ x: x, y: y + alt + 0.02, z: z + 0.05, tam: 0.75, cor: '#ffc27a', forca: 0.6 });
    return luz;
  }

  function vaso(scene, x, z, alt, cor, folhasCor, brilhos){
    var v = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.16, alt, 16), material(cor, { roughness: 0.7 }));
    v.position.set(x, alt / 2, z); scene.add(v);
    var folha = new THREE.Mesh(new THREE.IcosahedronGeometry(1, 0), material(folhasCor, { flatShading: true }));
    var im = new THREE.InstancedMesh(folha.geometry, folha.material, 14);
    for (var i = 0; i < 14; i++){
      var a = r() * 6.28, rr = r() * 0.28, yy = alt + 0.15 + r() * 0.75;
      q4.setFromEuler(new THREE.Euler(r() * 0.6 - 0.3, a, r() * 0.8 - 0.4));
      m4.compose(p4.set(x + Math.cos(a) * rr, yy, z + Math.sin(a) * rr), q4, s4.set(0.08, 0.32, 0.16));
      im.setMatrixAt(i, m4);
    }
    scene.add(im);
  }

  function luzesBase(scene, ceu, chao, forca){
    var h = new THREE.HemisphereLight(corReal(ceu), corReal(chao), forca);
    scene.add(h);
    return h;
  }

  function moldura(w, h, cor){
    var g = new THREE.Group();
    var mm = material(cor, { roughness: 0.45, metalness: cor === '#c9a44c' ? 0.6 : 0.05 });
    var e = 0.05;
    caixa(w + e * 2, e, 0.045, mm, 0, h / 2 + e / 2, 0, g);
    caixa(w + e * 2, e, 0.045, mm, 0, -h / 2 - e / 2, 0, g);
    caixa(e, h, 0.045, mm, -w / 2 - e / 2, 0, 0, g);
    caixa(e, h, 0.045, mm, w / 2 + e / 2, 0, 0, g);
    var paspatur = new THREE.Mesh(new THREE.PlaneGeometry(w, h), material('#f7f2ea', { roughness: 1 }));
    paspatur.position.z = -0.005; g.add(paspatur);
    var foto = new THREE.Mesh(new THREE.PlaneGeometry(w * 0.84, h * 0.84), new THREE.MeshStandardMaterial({ color: corReal('#d9cfc2'), roughness: 0.6 }));
    foto.position.z = 0.002; foto.userData.manter = true; g.add(foto);
    return { grupo: g, foto: foto, aspecto: w / h };
  }

  /* ================================================================
     SALA: os quadros com as nossas fotos
     ================================================================ */
  function criarSala(){
    var scene = new THREE.Scene();
    scene.background = new THREE.Color('#1a120e');
    var brilhos = [];
    casca(scene, { chao: texAssoalho('#9a6a45', '#7b5134'), parede: texPapelDeParede('#f6e3e6', 'listras', '#efbfcc'), rodape: '#f6efe4' });
    // lambri branco até a meia altura
    var mLambri = material('#f4efe6', { roughness: 0.7 });
    caixa(7, 0.95, 0.03, mLambri, 0, 0.475, -2.985, scene);
    caixa(7, 0.05, 0.05, mLambri, 0, 0.97, -2.97, scene);
    for (var lx = -3.3; lx < 3.4; lx += 0.55) caixa(0.02, 0.8, 0.012, material('#e6ded2'), lx, 0.48, -2.965, scene);

    // tapete
    var tTapete = texturaCanvas(256, 256, function(c, w, h){
      c.fillStyle = '#e59ab0'; c.beginPath(); c.arc(128, 128, 128, 0, Math.PI * 2); c.fill();
      ['#fbe6ec', '#c96b8a', '#f6c6d3', '#d27c97'].forEach(function(cor, i){ c.strokeStyle = cor; c.lineWidth = 7; c.beginPath(); c.arc(128, 128, 112 - i * 22, 0, Math.PI * 2); c.stroke(); });
    });
    var tapete = new THREE.Mesh(new THREE.CircleGeometry(1.6, 40), new THREE.MeshStandardMaterial({ map: tTapete, roughness: 1, transparent: true }));
    tapete.rotation.x = -Math.PI / 2; tapete.position.set(0, 0.006, -1.25); scene.add(tapete);

    // sofá
    var mSofa = material('#d98ea4', { roughness: 0.95 });
    var mSofaEsc = material('#c77a92', { roughness: 0.95 });
    sombraNoChao(3.2, 1.4, 0, 0, -2.4, 0.55, scene);
    caixaRedonda(2.7, 0.42, 0.95, 0.08, mSofaEsc, 0, 0.3, -2.42, scene);
    caixaRedonda(2.7, 0.8, 0.28, 0.1, mSofa, 0, 0.82, -2.82, scene);
    [-1, 1].forEach(function(l){ caixaRedonda(0.26, 0.62, 0.98, 0.1, mSofa, l * 1.32, 0.55, -2.42, scene); });
    [-0.6, 0.6].forEach(function(x){ caixaRedonda(1.18, 0.2, 0.82, 0.08, mSofa, x, 0.6, -2.36, scene); });
    var alm1 = caixaRedonda(0.46, 0.42, 0.14, 0.06, material('#f7dbe3', { roughness: 1 }), -0.85, 0.86, -2.62, scene); alm1.rotation.set(-0.25, 0.2, 0.12);
    var alm2 = caixaRedonda(0.44, 0.4, 0.14, 0.06, material('#efe3d1', { roughness: 1 }), 0.88, 0.85, -2.62, scene); alm2.rotation.set(-0.25, -0.2, -0.1);
    var manta = caixaRedonda(0.6, 0.05, 0.9, 0.02, material('#f2ece4', { roughness: 1 }), 1.0, 0.72, -2.3, scene); manta.rotation.z = -0.05;

    // mesinha de centro com vela, livro e caneca
    var mMadeira = material('#6b4a33', { roughness: 0.55 });
    caixaRedonda(1.15, 0.06, 0.6, 0.02, mMadeira, 0, 0.42, -1.15, scene);
    [[-0.5, -0.24], [0.5, -0.24], [-0.5, 0.24], [0.5, 0.24]].forEach(function(q){ caixa(0.05, 0.4, 0.05, mMadeira, q[0], 0.2, -1.15 + q[1], scene); });
    sombraNoChao(1.4, 0.9, 0, 0, -1.15, 0.4, scene);
    caixa(0.32, 0.05, 0.22, material('#7a2d33'), -0.22, 0.475, -1.1, scene).rotation.y = 0.3;
    var caneca = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.04, 0.1, 14), material('#efe7da', { roughness: 0.4 }));
    caneca.position.set(0.3, 0.5, -1.05); scene.add(caneca);
    var vela = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 0.12, 14), material('#f4ead8'));
    vela.position.set(0.05, 0.51, -1.25); scene.add(vela);
    brilhos.push({ x: 0.05, y: 0.62, z: -1.25, tam: 0.22, cor: '#ffcf7a', forca: 1, tipo: 2 });
    brilhos.push({ x: 0.05, y: 0.62, z: -1.25, tam: 0.6, cor: '#ff9a4a', forca: 0.35, tipo: 2, fase: 2 });

    // abajur de pé e planta
    abajur(scene, 2.15, 0, -2.3, 1.55, brilhos, { forca: 1.8, alcance: 8 });
    vaso(scene, -2.15, -2.35, 0.5, '#f0b3c4', '#4f7a45', brilhos);

    // estante na parede da direita
    var mEst = material('#7a5638', { roughness: 0.6 });
    caixa(0.35, 2.0, 1.6, mEst, 3.32, 1.0, -0.9, scene);
    for (var pr = 0; pr < 4; pr++){
      caixa(0.3, 0.03, 1.5, material('#5d412a'), 3.3, 0.25 + pr * 0.5, -0.9, scene);
      var z0 = -1.6;
      while (z0 < -0.25){
        var lw = 0.05 + r() * 0.05, lh = 0.28 + r() * 0.14;
        caixa(0.22, lh, lw, material(['#7a2d33', '#2f4b5c', '#c79a4a', '#efe3d1', '#4f6b45', '#8c5a8a'][Math.floor(r() * 6)]), 3.25, 0.27 + pr * 0.5 + lh / 2, z0, scene);
        z0 += lw + 0.01;
      }
    }

    // os quadros na parede, em cima do sofá
    var LAYOUT = [[0.7, 0.9, -1.35, 2.05, '#2b2421'], [0.9, 0.66, -0.35, 2.3, '#c9a44c'], [0.55, 0.55, -0.5, 1.68, '#f4efe6'],
                  [0.75, 0.95, 0.62, 1.98, '#2b2421'], [0.5, 0.62, 1.5, 2.25, '#f4efe6'], [0.55, 0.42, 1.48, 1.62, '#c9a44c'], [0.42, 0.42, 0.35, 2.78, '#2b2421']];
    var quadros = [], clicaveis = [];
    LAYOUT.forEach(function(L, i){
      var q = moldura(L[0], L[1], L[4]);
      q.grupo.position.set(L[2], L[3], -2.96);
      q.grupo.rotation.z = (r() - 0.5) * 0.02;
      scene.add(q.grupo);
      quadros.push(q);
      clicaveis.push({ obj: q.grupo, acao: 'foto', indice: i });
    });
    // luz de galeria em cima dos quadros
    var spot = new THREE.PointLight(corReal('#ffd7a8'), 0.9, 4.5, 1.5);
    spot.position.set(0, 2.6, -1.9); scene.add(spot);

    luzesBase(scene, '#ffe2c4', '#3a2a22', 0.55);
    var b = criarBrilhos(brilhos); scene.add(b.mesh);
    mesclarEstaticos(scene, scene);

    function colocarFotos(lista){
      quadros.forEach(function(q, i){
        var uri = lista[i % lista.length];
        if (!uri) return;
        q.foto.material.map = texturaDeFoto(uri, q.aspecto * 0.84 / 0.84, function(){ q.foto.material.needsUpdate = true; });
        q.foto.material.color = new THREE.Color(1, 1, 1);
        q.foto.material.needsUpdate = true;
      });
    }

    return {
      id: 'sala', scene: scene, clicaveis: clicaveis, colocarFotos: colocarFotos,
      cam: { pos: new V3(0, 1.45, 2.9), alvo: new V3(0, 1.45, -2.9) },
      atualizar: function(dt, t){ b.u.uTempo.value = t; }
    };
  }

  /* ================================================================
     QUARTO: a cama, as luzinhas e a carta
     ================================================================ */
  function criarQuarto(){
    var scene = new THREE.Scene();
    scene.background = new THREE.Color('#120c12');
    var brilhos = [];
    casca(scene, { chao: texAssoalho('#b08a66', '#93704f'), parede: texPapelDeParede('#d8c3cf', 'bolinhas', '#f6ecf1') });

    // cama
    var mMadeira = material('#7b5a40', { roughness: 0.6 });
    sombraNoChao(2.6, 2.8, 0, 0, -1.75, 0.55, scene);
    caixaRedonda(2.1, 0.32, 2.3, 0.04, mMadeira, 0, 0.22, -1.8, scene);
    caixaRedonda(2.2, 1.25, 0.14, 0.06, material('#caa7a3', { roughness: 1 }), 0, 0.95, -2.9, scene);
    for (var cx = -0.9; cx <= 0.91; cx += 0.3) caixa(0.02, 1.0, 0.02, material('#b89490'), cx, 0.98, -2.82, scene);
    caixaRedonda(1.96, 0.24, 2.18, 0.08, material('#f5f1ea', { roughness: 1 }), 0, 0.5, -1.8, scene);
    var edredom = caixaRedonda(2.04, 0.13, 1.45, 0.06, material('#e8b4b8', { roughness: 1 }), 0, 0.66, -1.35, scene);
    caixaRedonda(2.06, 0.1, 0.42, 0.05, material('#f3d5d2', { roughness: 1 }), 0, 0.73, -2.0, scene);
    caixaRedonda(2.08, 0.07, 0.5, 0.03, material('#b97b84', { roughness: 1 }), 0, 0.715, -0.82, scene);
    [-0.5, 0.5].forEach(function(x, i){
      var tr = caixaRedonda(0.78, 0.2, 0.42, 0.09, material(i ? '#f6efe7' : '#efe3d6', { roughness: 1 }), x, 0.74, -2.58, scene);
      tr.rotation.x = -0.35;
    });
    caixaRedonda(0.5, 0.36, 0.12, 0.06, material('#d99aa0', { roughness: 1 }), 0, 0.8, -2.42, scene).rotation.x = -0.3;

    // criados-mudos com abajur
    [-1, 1].forEach(function(l){
      caixaRedonda(0.5, 0.55, 0.42, 0.03, mMadeira, l * 1.42, 0.275, -2.7, scene);
      caixa(0.36, 0.02, 0.02, material('#d1a75a', { metalness: 0.7, roughness: 0.3 }), l * 1.42, 0.38, -2.48, scene);
    });
    abajur(scene, -1.42, 0.55, -2.72, 0.42, brilhos, { forca: 1.4, topo: 0.12, boca: 0.18, cupAlt: 0.22, cupula: '#f6dfe0' });
    abajur(scene, 1.42, 0.55, -2.72, 0.42, brilhos, { forca: 0.9, topo: 0.12, boca: 0.18, cupAlt: 0.22, cupula: '#f6dfe0' });

    // luzinhas na parede, em cima da cama
    var fio = material('#2a2224');
    [[new V3(-1.9, 2.55, -2.95), new V3(1.9, 2.55, -2.95), 0.4, 15], [new V3(-1.6, 2.2, -2.95), new V3(1.6, 2.2, -2.95), 0.25, 11]].forEach(function(v, j){
      fioDeVaral(v[0], v[1], v[2], fio, scene);
      pontosDeVaral(v[0], v[1], v[3], v[2]).forEach(function(p, i){
        brilhos.push({ x: p.x, y: p.y - 0.03, z: p.z + 0.03, tam: 0.2, cor: '#ffdca0', forca: 1, fase: i * 0.6 + j });
        var bb = new THREE.Mesh(new THREE.SphereGeometry(0.025, 8, 6), new THREE.MeshBasicMaterial({ color: 0xfff0c8 }));
        bb.position.set(p.x, p.y - 0.03, p.z + 0.02); scene.add(bb);
      });
    });

    // janela com a lua, na parede da direita
    var tNoite = texturaCanvas(256, 256, function(c, w, h){
      var g = c.createLinearGradient(0, 0, 0, h); g.addColorStop(0, '#0b1030'); g.addColorStop(1, '#2a3366');
      c.fillStyle = g; c.fillRect(0, 0, w, h);
      for (var k = 0; k < 70; k++){ c.fillStyle = 'rgba(255,255,240,' + (0.3 + Math.random() * 0.7) + ')'; c.fillRect(Math.random() * w, Math.random() * h * 0.8, 1.5, 1.5); }
      var lg = c.createRadialGradient(170, 70, 2, 170, 70, 60); lg.addColorStop(0, 'rgba(255,250,230,0.5)'); lg.addColorStop(1, 'rgba(255,250,230,0)');
      c.fillStyle = lg; c.fillRect(0, 0, w, h);
      c.fillStyle = '#f6f1df'; c.beginPath(); c.arc(170, 70, 20, 0, Math.PI * 2); c.fill();
      c.fillStyle = '#0d1a14'; c.beginPath(); c.moveTo(0, h); for (var x = 0; x <= w; x += 16) c.lineTo(x, h - 30 - Math.sin(x * 0.05) * 14 - Math.random() * 18); c.lineTo(w, h); c.fill();
    });
    var janela = new THREE.Mesh(new THREE.PlaneGeometry(1.3, 1.4), new THREE.MeshBasicMaterial({ map: tNoite }));
    janela.rotation.y = -Math.PI / 2; janela.position.set(3.49, 1.75, -0.6); scene.add(janela);
    var mBranco = material('#f4efe6');
    caixa(0.06, 1.55, 0.08, mBranco, 3.46, 1.75, -0.6, scene);
    caixa(0.06, 0.06, 1.45, mBranco, 3.46, 2.48, -0.6, scene);
    caixa(0.06, 0.06, 1.45, mBranco, 3.46, 1.02, -0.6, scene);
    [-1, 1].forEach(function(l){ caixa(0.06, 1.55, 0.06, mBranco, 3.46, 1.75, -0.6 + l * 0.68, scene); });
    [-1, 1].forEach(function(l){ var cort = caixaRedonda(0.08, 2.1, 0.45, 0.03, material('#e9c9c6', { roughness: 1 }), 3.38, 1.6, -0.6 + l * 0.95, scene); });

    // tapete felpudo ao lado da cama
    var tap = new THREE.Mesh(new THREE.CircleGeometry(0.75, 32), material('#f2e8e0', { roughness: 1 }));
    tap.rotation.x = -Math.PI / 2; tap.scale.set(1.5, 1, 1); tap.position.set(1.7, 0.006, -0.5); scene.add(tap);

    // a carta em cima da cama
    var tEnvelope = texturaCanvas(256, 176, function(c, w, h){
      c.fillStyle = '#f6ecd9'; c.fillRect(0, 0, w, h);
      c.strokeStyle = 'rgba(150,120,90,0.35)'; c.lineWidth = 2;
      c.beginPath(); c.moveTo(0, 0); c.lineTo(w / 2, h * 0.58); c.lineTo(w, 0); c.stroke();
      c.beginPath(); c.moveTo(0, h); c.lineTo(w * 0.42, h * 0.48); c.moveTo(w, h); c.lineTo(w * 0.58, h * 0.48); c.stroke();
      c.fillStyle = '#a3192f'; c.beginPath(); c.arc(w / 2, h * 0.56, 20, 0, Math.PI * 2); c.fill();
      c.fillStyle = '#d4384f';
      c.beginPath(); var cx2 = w / 2, cy2 = h * 0.56 + 2;
      c.moveTo(cx2, cy2 + 8); c.bezierCurveTo(cx2 - 14, cy2 - 2, cx2 - 6, cy2 - 12, cx2, cy2 - 4); c.bezierCurveTo(cx2 + 6, cy2 - 12, cx2 + 14, cy2 - 2, cx2, cy2 + 8); c.fill();
      c.fillStyle = 'rgba(80,50,40,0.75)'; c.font = 'italic 22px Georgia, serif'; c.textAlign = 'center'; c.fillText('pra Nicolly', w / 2, h * 0.9);
    });
    var envelope = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.012, 0.34), [
      material('#efe3cd'), material('#efe3cd'), new THREE.MeshStandardMaterial({ map: tEnvelope, roughness: 0.9 }), material('#efe3cd'), material('#efe3cd'), material('#efe3cd')
    ]);
    envelope.position.set(0.1, 0.745, -1.35);
    envelope.userData.manter = true;
    envelope.rotation.y = -0.25;
    scene.add(envelope);
    var halo = { x: 0.1, y: 0.8, z: -1.35, tam: 0.8, cor: '#ffd9a8', forca: 0.55, fase: 0 };
    brilhos.push(halo);
    var toqueCarta = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.4, 0.7), new THREE.MeshBasicMaterial());
    toqueCarta.visible = false; toqueCarta.position.copy(envelope.position); scene.add(toqueCarta);

    luzesBase(scene, '#f4d6e6', '#2a1a22', 0.45);
    var luzLuz = new THREE.PointLight(corReal('#ffd6a6'), 0.8, 6, 1.6);
    luzLuz.position.set(0, 2.3, -2.4); scene.add(luzLuz);
    var b = criarBrilhos(brilhos); scene.add(b.mesh);
    mesclarEstaticos(scene, scene);

    return {
      id: 'quarto', scene: scene,
      clicaveis: [{ obj: toqueCarta, acao: 'carta' }, { obj: envelope, acao: 'carta' }],
      cam: { pos: new V3(0, 2.25, 2.4), alvo: new V3(0, 0.9, -1.7) },
      atualizar: function(dt, t){
        b.u.uTempo.value = t;
        envelope.position.y = 0.745 + Math.sin(t * 1.6) * 0.006;
      }
    };
  }

  /* ================================================================
     COZINHA: a geladeira com as nossas datas
     ================================================================ */
  function criarCozinha(datas, diaDeHoje){
    var scene = new THREE.Scene();
    scene.background = new THREE.Color('#16110c');
    var brilhos = [];
    var tPiso = texturaCanvas(256, 256, function(c, w, h){
      for (var y = 0; y < 8; y++) for (var x = 0; x < 8; x++){
        c.fillStyle = (x + y) % 2 ? '#fbf3ef' : '#ea9fb4'; c.fillRect(x * 32, y * 32, 32, 32);
      }
      for (var k = 0; k < 2000; k++){ c.fillStyle = 'rgba(0,0,0,' + Math.random() * 0.05 + ')'; c.fillRect(Math.random() * w, Math.random() * h, 1, 1); }
    }, [2, 2]);
    var tAzulejo = texturaCanvas(256, 256, function(c, w, h){
      c.fillStyle = '#d8d2c8'; c.fillRect(0, 0, w, h);
      for (var y = 0; y < 16; y++) for (var x = -1; x < 9; x++){
        var g = c.createLinearGradient(0, y * 16, 0, y * 16 + 16);
        g.addColorStop(0, '#fbf8f2'); g.addColorStop(1, '#ece6dc');
        c.fillStyle = g; c.fillRect(x * 32 + (y % 2) * 16 + 1, y * 16 + 1, 30, 14);
      }
    }, [5, 2]);
    casca(scene, { chao: tPiso, parede: texPapelDeParede('#fbefee', 'folhas', '#eaa7ba') });

    // azulejo atrás da bancada
    var azulejo = new THREE.Mesh(new THREE.PlaneGeometry(4.2, 0.75), new THREE.MeshStandardMaterial({ map: tAzulejo, roughness: 0.3 }));
    azulejo.position.set(-1.0, 1.32, -2.985); scene.add(azulejo);

    // armários de baixo e bancada
    var mArm = material('#e9a9bb', { roughness: 0.55 });
    var mPuxador = material('#d1a75a', { metalness: 0.8, roughness: 0.3 });
    caixa(4.2, 0.9, 0.62, mArm, -1.0, 0.45, -2.68, scene);
    for (var i = 0; i < 5; i++){
      caixa(0.78, 0.76, 0.02, material('#f1bccb', { roughness: 0.5 }), -2.68 + i * 0.84, 0.47, -2.36, scene);
      caixa(0.12, 0.025, 0.03, mPuxador, -2.68 + i * 0.84, 0.75, -2.34, scene);
    }
    caixa(4.3, 0.06, 0.68, material('#e9e2d6', { roughness: 0.25 }), -1.0, 0.93, -2.66, scene);
    // prateleiras com potes
    var mPrat = material('#7a5638', { roughness: 0.6 });
    [1.85, 2.35].forEach(function(y, j){
      caixa(2.6, 0.05, 0.3, mPrat, -1.6, y, -2.85, scene);
      for (var k = 0; k < 7; k++){
        var pote = new THREE.Mesh(new THREE.CylinderGeometry(0.07 + r() * 0.04, 0.07 + r() * 0.04, 0.16 + r() * 0.12, 12), material(['#e9d5b0', '#c97a5a', '#f2efe8', '#8fa58c', '#d9b25a'][Math.floor(r() * 5)], { roughness: 0.4 }));
        pote.position.set(-2.7 + k * 0.36 + r() * 0.05, y + 0.12, -2.85); scene.add(pote);
      }
    });
    // chaleira e canecas na bancada
    var chaleira = new THREE.Mesh(new THREE.SphereGeometry(0.16, 16, 12), material('#f2f0ec', { roughness: 0.35 }));
    chaleira.scale.set(1, 0.85, 1); chaleira.position.set(-2.2, 1.09, -2.6); scene.add(chaleira);
    [-1.6, -1.45].forEach(function(x){ var cc = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.045, 0.11, 12), material('#f4ede2', { roughness: 0.4 })); cc.position.set(x, 1.015, -2.55); scene.add(cc); });
    var tabua = caixaRedonda(0.5, 0.03, 0.32, 0.01, material('#a7744a'), -0.6, 0.975, -2.62, scene);

    // geladeira retrô com os bilhetes das datas
    var mGel = material('#f6c3d1', { roughness: 0.35 });
    sombraNoChao(1.3, 1.1, 1.75, 0, -2.5, 0.5, scene);
    var gel = caixaRedonda(1.05, 2.05, 0.8, 0.12, mGel, 1.75, 1.03, -2.55, scene);
    caixa(1.0, 0.012, 0.01, material('#df9fb2'), 1.75, 1.42, -2.145, scene);
    caixa(0.04, 0.5, 0.06, mPuxador, 1.33, 1.72, -2.11, scene);
    caixa(0.04, 0.6, 0.06, mPuxador, 1.33, 1.0, -2.11, scene);

    var CORES_NOTA = ['#fff3a8', '#ffd6e0', '#d6f0ff', '#e2f7d4', '#ffe1c2'];
    var notas = [];
    var lista = datas.slice(-8);
    lista.forEach(function(d, k){
      var cor = CORES_NOTA[k % CORES_NOTA.length];
      var t = texturaCanvas(128, 128, function(c, w, h){
        c.fillStyle = cor; c.fillRect(0, 0, w, h);
        c.fillStyle = 'rgba(0,0,0,0.06)'; c.fillRect(0, h - 10, w, 10);
        c.fillStyle = '#5a3a35'; c.textAlign = 'center';
        c.font = '600 22px Georgia, serif'; c.fillText(d.curta, w / 2, 44);
        c.font = 'italic 19px Georgia, serif';
        var palavras = d.titulo.split(' '), linha = '', y = 76;
        palavras.forEach(function(p){ if ((linha + ' ' + p).length > 11){ c.fillText(linha.trim(), w / 2, y); y += 22; linha = p; } else linha += ' ' + p; });
        c.fillText(linha.trim(), w / 2, y);
      });
      var nota = new THREE.Mesh(new THREE.PlaneGeometry(0.22, 0.22), new THREE.MeshStandardMaterial({ map: t, roughness: 0.9 }));
      var col = k % 3, lin = Math.floor(k / 3);
      nota.position.set(1.47 + col * 0.28, 1.85 - lin * 0.3 + (col % 2) * 0.04, -2.142);
      nota.rotation.z = (r() - 0.5) * 0.3;
      scene.add(nota);
      var ima = new THREE.Mesh(new THREE.SphereGeometry(0.022, 10, 8), material(['#d9443f', '#3f7fd9', '#f2c14e', '#5aa36b'][k % 4], { roughness: 0.3 }));
      ima.scale.z = 0.5;
      ima.position.set(nota.position.x, nota.position.y + 0.08, -2.13); scene.add(ima);
      notas.push(nota);
    });

    // calendário na parede com o dia de hoje
    var tCal = texturaCanvas(192, 256, function(c, w, h){
      c.fillStyle = '#fbf7ef'; c.fillRect(0, 0, w, h);
      c.fillStyle = '#c4122f'; c.fillRect(0, 0, w, 56);
      c.fillStyle = '#fff'; c.font = '600 24px Georgia, serif'; c.textAlign = 'center'; c.fillText(diaDeHoje.mes, w / 2, 37);
      c.fillStyle = '#3b2833'; c.font = '700 92px Georgia, serif'; c.fillText(String(diaDeHoje.dia), w / 2, 150);
      c.font = 'italic 22px Georgia, serif'; c.fillStyle = '#8a5a5a'; c.fillText('dia ' + diaDeHoje.n + ' de nós', w / 2, 200);
      c.fillStyle = 'rgba(0,0,0,0.12)'; for (var k = 0; k < 8; k++) c.fillRect(20 + k * 20, 6, 6, 10);
    });
    var cal = new THREE.Mesh(new THREE.PlaneGeometry(0.48, 0.64), new THREE.MeshStandardMaterial({ map: tCal, roughness: 0.9 }));
    cal.position.set(0.55, 2.05, -2.985); cal.rotation.z = 0.03; scene.add(cal);

    // mesinha redonda com um vaso de rosa e luminária pendente
    var mMesa = material('#8a6446', { roughness: 0.5 });
    var tampo = new THREE.Mesh(new THREE.CylinderGeometry(0.55, 0.55, 0.05, 32), mMesa);
    tampo.position.set(-1.0, 0.76, -0.9); scene.add(tampo);
    var pe = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.08, 0.74, 10), mMesa); pe.position.set(-1.0, 0.37, -0.9); scene.add(pe);
    var pePe = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.32, 0.03, 20), mMesa); pePe.position.set(-1.0, 0.015, -0.9); scene.add(pePe);
    sombraNoChao(1.5, 1.5, -1.0, 0, -0.9, 0.45, scene);
    var vasoR = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.07, 0.22, 12), new THREE.MeshStandardMaterial({ color: corReal('#cfe3ea'), roughness: 0.1, transparent: true, opacity: 0.7 }));
    vasoR.position.set(-1.0, 0.9, -0.9); scene.add(vasoR);
    var caule = new THREE.Mesh(new THREE.CylinderGeometry(0.006, 0.006, 0.3, 5), material('#3f6b35')); caule.position.set(-1.0, 1.08, -0.9); scene.add(caule);
    var rosa = new THREE.Mesh(new THREE.IcosahedronGeometry(0.06, 1), material('#c4122f', { roughness: 0.6 })); rosa.position.set(-1.0, 1.25, -0.9); scene.add(rosa);
    [-1, 1].forEach(function(l){
      var cad = new THREE.Group(); cad.position.set(-1.0 + l * 0.8, 0, -0.9); cad.rotation.y = l * Math.PI / 2; scene.add(cad);
      caixa(0.42, 0.04, 0.42, mMesa, 0, 0.46, 0, cad);
      [[-0.18, -0.18], [0.18, -0.18], [-0.18, 0.18], [0.18, 0.18]].forEach(function(q){ caixa(0.035, 0.46, 0.035, mMesa, q[0], 0.23, q[1], cad); });
      caixa(0.42, 0.5, 0.04, mMesa, 0, 0.72, 0.19, cad);
    });
    var cabo = new THREE.Mesh(new THREE.CylinderGeometry(0.006, 0.006, 1.4, 4), material('#222')); cabo.position.set(-1.0, 2.5, -0.9); scene.add(cabo);
    var pendente = new THREE.Mesh(new THREE.ConeGeometry(0.26, 0.24, 24, 1, true), new THREE.MeshStandardMaterial({ color: corReal('#d77894'), side: THREE.DoubleSide, roughness: 0.4, metalness: 0.2 }));
    pendente.position.set(-1.0, 1.72, -0.9); scene.add(pendente);
    brilhos.push({ x: -1.0, y: 1.6, z: -0.9, tam: 0.6, cor: '#ffd08a', forca: 0.8 });
    var luzMesa = new THREE.PointLight(corReal('#ffc98a'), 1.6, 6, 1.6); luzMesa.position.set(-1.0, 1.55, -0.9); scene.add(luzMesa);

    luzesBase(scene, '#fff0dc', '#3a2c20', 0.6);
    var luzGel = new THREE.PointLight(corReal('#ffe2bd'), 0.7, 4, 1.6); luzGel.position.set(1.4, 2.4, -1.4); scene.add(luzGel);
    var b = criarBrilhos(brilhos); scene.add(b.mesh);
    gel.userData.manter = true; cal.userData.manter = true;
    notas.forEach(function(n){ n.userData.manter = true; });
    mesclarEstaticos(scene, scene);

    var clic = [{ obj: gel, acao: 'datas' }, { obj: cal, acao: 'datas' }];
    notas.forEach(function(n){ clic.push({ obj: n, acao: 'datas' }); });
    return {
      id: 'cozinha', scene: scene, clicaveis: clic,
      cam: { pos: new V3(0, 1.5, 3.0), alvo: new V3(0.25, 1.3, -2.6) },
      atualizar: function(dt, t){ b.u.uTempo.value = t; }
    };
  }

  /* ================================================================
     VARANDA: duas cadeiras olhando a noite e o toca-discos
     ================================================================ */
  function criarVaranda(){
    var scene = new THREE.Scene();
    var brilhos = [];
    scene.fog = new THREE.Fog(corReal('#141a38'), 8, 40);

    // céu da noite
    var ceuG = new THREE.Mesh(new THREE.SphereGeometry(60, 32, 16), new THREE.ShaderMaterial({
      side: THREE.BackSide, depthWrite: false, fog: false,
      vertexShader: 'varying vec3 vDir; void main(){ vDir = position; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }',
      fragmentShader: [
        'varying vec3 vDir;',
        'void main(){',
        '  vec3 d = normalize(vDir);',
        '  vec3 cor = mix(vec3(0.11, 0.15, 0.32), vec3(0.02, 0.03, 0.1), sqrt(clamp(d.y, 0.0, 1.0)));',
        '  cor = mix(cor, vec3(0.05, 0.07, 0.15), clamp(-d.y * 4.0, 0.0, 1.0));',
        '  vec3 lua = normalize(vec3(0.13, 0.36, -1.0));',
        '  float c = dot(d, lua);',
        '  float c2 = c * c, c4 = c2 * c2, c8 = c4 * c4, c32 = c8 * c8 * c8 * c8;',
        '  cor += vec3(0.45, 0.52, 0.8) * c32 * c32 * 0.5 * step(0.0, c);',
        '  cor = mix(cor, vec3(0.96, 0.95, 0.88), smoothstep(0.9993, 0.9996, c));',
        '  gl_FragColor = vec4(cor, 1.0);',
        '}'
      ].join('\n')
    }));
    scene.add(ceuG);
    // estrelas
    var est = [];
    for (var k = 0; k < (celular ? 260 : 360); k++){
      var a = (r() - 0.5) * Math.PI * 2, el = 0.06 + Math.asin(r()) * 0.95;
      var grande = r() < 0.08;
      est.push({ x: Math.sin(a) * Math.cos(el) * 50, y: Math.sin(el) * 50, z: -Math.cos(a) * Math.cos(el) * 50, tam: grande ? 0.65 + r() * 0.3 : 0.2 + r() * 0.24, cor: r() < 0.2 ? '#ffd9e4' : '#fff7e6', forca: 0.5 + r() * 0.5, fase: r() * 20 });
    }

    // deque e a casa atrás
    var tDeque = texAssoalho('#7a6150', '#5f4a3d');
    var deque = new THREE.Mesh(new THREE.PlaneGeometry(5, 4), new THREE.MeshStandardMaterial({ map: tDeque, roughness: 0.8 }));
    deque.rotation.x = -Math.PI / 2; deque.position.set(0, 0, -0.5); scene.add(deque);
    var mBranco = material('#f2ece2', { roughness: 0.6 });
    // grade da varanda
    caixa(5, 0.07, 0.09, mBranco, 0, 1.0, -2.5, scene);
    for (var gx = -2.5; gx <= 2.5; gx += 0.18) caixa(0.035, 0.98, 0.035, mBranco, gx, 0.5, -2.5, scene);
    [-1, 1].forEach(function(l){
      caixa(0.07, 0.07, 4, mBranco, l * 2.5, 1.0, -0.5, scene);
      for (var gz = -2.5; gz <= 1.5; gz += 0.18) caixa(0.035, 0.98, 0.035, mBranco, l * 2.5, 0.5, gz, scene);
    });
    // jardim lá embaixo e árvores escuras
    var gramado = new THREE.Mesh(new THREE.PlaneGeometry(120, 120), new THREE.MeshLambertMaterial({ color: corReal('#14261a') }));
    gramado.rotation.x = -Math.PI / 2; gramado.position.y = -3.4; scene.add(gramado);
    var copas = new THREE.InstancedMesh(new THREE.IcosahedronGeometry(1, 1), new THREE.MeshLambertMaterial({ color: corReal('#183020'), flatShading: true }), 40);
    for (var i = 0; i < 40; i++){
      var ax = (r() - 0.5) * 50, az = -8 - r() * 26, s = 1.2 + r() * 2.0;
      // as copas ficam abaixo da linha do horizonte, pra noite aparecer inteira
      var topo = misturar(-2.2, 0.4, (-az - 8) / 26);
      m4.compose(p4.set(ax, topo - s, az), q4.setFromEuler(new THREE.Euler(r(), r(), r())), s4.set(s, s * 1.15, s));
      copas.setMatrixAt(i, m4);
    }
    // morros bem lá no fundo
    var morros = new THREE.InstancedMesh(new THREE.SphereGeometry(1, 16, 8, 0, Math.PI * 2, 0, Math.PI / 2), new THREE.MeshLambertMaterial({ color: corReal('#1a2a36') }), 4);
    for (var mo = 0; mo < 4; mo++){
      m4.compose(p4.set(-30 + mo * 20, -3.4, -50), q4.set(0, 0, 0, 1), s4.set(16, 4 + r() * 3, 10));
      morros.setMatrixAt(mo, m4);
    }
    scene.add(morros);
    scene.add(copas);
    // vaga-lumes lá embaixo
    for (var v = 0; v < 30; v++) brilhos.push({ x: (r() - 0.5) * 16, y: -2.6 + r() * 2.5, z: -4 - r() * 8, tam: 0.12, cor: '#e2ff8c', forca: 1, tipo: 1, fase: r() * 10 });

    // varal de luzinhas cruzando por cima
    var fio = material('#1c1a18');
    [[new V3(-2.5, 2.4, 1.4), new V3(2.5, 2.4, -2.5), 0.4, 14], [new V3(2.5, 2.4, 1.4), new V3(-2.5, 2.4, -2.5), 0.4, 14], [new V3(-2.5, 2.2, -2.5), new V3(2.5, 2.2, -2.5), 0.3, 12]].forEach(function(v, j){
      fioDeVaral(v[0], v[1], v[2], fio, scene);
      pontosDeVaral(v[0], v[1], v[3], v[2]).forEach(function(p, i){
        brilhos.push({ x: p.x, y: p.y - 0.04, z: p.z, tam: 0.24, cor: '#ffd98f', forca: 1, fase: i * 0.5 + j * 3 });
        var bb = new THREE.Mesh(new THREE.SphereGeometry(0.03, 8, 6), new THREE.MeshBasicMaterial({ color: 0xffeec4 }));
        bb.scale.y = 1.3; bb.position.set(p.x, p.y - 0.04, p.z); scene.add(bb);
      });
    });

    // duas cadeiras de costas pra gente, olhando a noite
    var mCad = material('#c7a57e', { roughness: 0.8 });
    var cadeiras = [];
    var mAlm = material('#f3b7c8', { roughness: 1 });
    [-0.85, 0.85].forEach(function(x, i){
      var g = new THREE.Group(); g.position.set(x, 0, -1.2); g.rotation.y = (i ? -1 : 1) * 0.18; scene.add(g);
      caixaRedonda(0.72, 0.1, 0.68, 0.04, mCad, 0, 0.42, 0, g);
      caixaRedonda(0.72, 0.75, 0.1, 0.05, mCad, 0, 0.8, 0.32, g).rotation.x = 0.18;
      caixaRedonda(0.62, 0.1, 0.58, 0.05, mAlm, 0, 0.5, -0.02, g);
      [[-0.32, -0.28], [0.32, -0.28], [-0.32, 0.28], [0.32, 0.28]].forEach(function(q){ caixa(0.05, 0.42, 0.05, mCad, q[0], 0.21, q[1], g); });
      [-0.36, 0.36].forEach(function(xx){ caixa(0.06, 0.06, 0.62, mCad, xx, 0.62, 0, g); });
      sombraNoChao(0.9, 0.9, x, 0, -1.2, 0.45, scene);
      // tocando na cadeira, ela senta e olha pro céu
      var toqueCad = new THREE.Mesh(new THREE.BoxGeometry(0.95, 1.25, 0.95), new THREE.MeshBasicMaterial());
      toqueCad.visible = false; toqueCad.position.set(x, 0.62, -1.2); scene.add(toqueCad);
      // olhar de quem tá sentado: pra frente e um pouco pra cima, com a grade e as árvores embaixo
      var olho = new V3(x * 0.95, 1.08, -1.05);
      cadeiras.push({ obj: toqueCad, acao: 'ceu', sentar: { pos: olho, alvo: olho.clone().add(new V3(x > 0 ? 2.0 : 1.2, 6.8, -20)) } });
    });
    // manta numa das cadeiras
    var manta = caixaRedonda(0.5, 0.04, 0.55, 0.02, material('#e07d9a', { roughness: 1 }), -0.85, 0.58, -1.15, scene); manta.rotation.set(0.1, 0.2, 0.15);

    // mesinha com o toca-discos
    var mMesa = material('#6b4a33', { roughness: 0.5 });
    var tampo = new THREE.Mesh(new THREE.CylinderGeometry(0.38, 0.38, 0.04, 28), mMesa); tampo.position.set(0, 0.62, -0.55); scene.add(tampo);
    var pe = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.06, 0.6, 10), mMesa); pe.position.set(0, 0.3, -0.55); scene.add(pe);
    sombraNoChao(1.0, 1.0, 0, 0, -0.55, 0.45, scene);
    var toca = new THREE.Group(); toca.position.set(0, 0.645, -0.55); toca.rotation.y = 0.15; scene.add(toca);
    caixaRedonda(0.5, 0.08, 0.38, 0.02, material('#8a5a3a', { roughness: 0.45 }), 0, 0.04, 0, toca);
    var prato = new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.15, 0.015, 32), material('#3a3a3a', { metalness: 0.6, roughness: 0.4 }));
    prato.position.set(-0.06, 0.09, 0); toca.add(prato);
    var disco = new THREE.Group(); disco.position.set(-0.06, 0.1, 0); disco.userData.manter = true; toca.add(disco);
    var tSulcos = texturaCanvas(256, 256, function(c, w, h){
      c.fillStyle = '#0d0c0d'; c.beginPath(); c.arc(128, 128, 128, 0, Math.PI * 2); c.fill();
      for (var rr = 50; rr < 126; rr += 2){ c.strokeStyle = 'rgba(255,255,255,' + (0.03 + Math.random() * 0.04) + ')'; c.beginPath(); c.arc(128, 128, rr, 0, Math.PI * 2); c.stroke(); }
      c.fillStyle = 'rgba(255,255,255,0.12)'; c.beginPath(); c.moveTo(128, 128); c.arc(128, 128, 126, -0.5, -0.2); c.fill();
    });
    var vinil = new THREE.Mesh(new THREE.CircleGeometry(0.14, 40), new THREE.MeshStandardMaterial({ map: tSulcos, roughness: 0.35, metalness: 0.2 }));
    vinil.rotation.x = -Math.PI / 2; disco.add(vinil);
    var rotulo = new THREE.Mesh(new THREE.CircleGeometry(0.045, 24), material('#e8c2c8'));
    rotulo.rotation.x = -Math.PI / 2; rotulo.position.y = 0.001; disco.add(rotulo);
    var braco = caixa(0.012, 0.012, 0.2, material('#cfcfcf', { metalness: 0.8, roughness: 0.3 }), 0.13, 0.12, 0.02, toca);
    braco.rotation.y = 0.5; braco.userData.manter = true;
    var piloto = new THREE.Mesh(new THREE.SphereGeometry(0.008, 6, 6), new THREE.MeshBasicMaterial({ color: 0x331111 }));
    piloto.position.set(0.2, 0.085, 0.15); piloto.userData.manter = true; toca.add(piloto);
    // pilha de discos encostada na mesa
    var capasMesh = [];
    for (var cI = 0; cI < 4; cI++){
      var capa = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.3, 0.008), material(['#2c2a35', '#7a2d33', '#d9b25a', '#3f5a4e'][cI]));
      capa.position.set(0.48 + cI * 0.015, 0.16, -0.25 - cI * 0.01); capa.rotation.set(-0.08, 0.35, -0.25 + cI * 0.03);
      capa.userData.manter = true; scene.add(capa); capasMesh.push(capa);
    }
    var toqueToca = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.8, 0.9), new THREE.MeshBasicMaterial());
    toqueToca.visible = false; toqueToca.position.set(0.1, 0.6, -0.5); scene.add(toqueToca);
    var haloToca = { x: 0, y: 0.75, z: -0.55, tam: 0.55, cor: '#ffd9a8', forca: 0.35 };
    brilhos.push(haloToca);

    // vasos e lanterna no chão
    vaso(scene, -2.1, -2.1, 0.45, '#b8673f', '#3f6b3a', brilhos);
    vaso(scene, 2.1, -2.1, 0.4, '#d9c7a8', '#4a7a40', brilhos);
    var lant = new THREE.Group(); lant.position.set(1.4, 0, -1.9); scene.add(lant);
    caixa(0.22, 0.32, 0.22, new THREE.MeshBasicMaterial({ color: 0xffe0a8, transparent: true, opacity: 0.85 }), 0, 0.2, 0, lant);
    caixa(0.26, 0.04, 0.26, material('#2a2623', { metalness: 0.4 }), 0, 0.38, 0, lant);
    caixa(0.26, 0.04, 0.26, material('#2a2623', { metalness: 0.4 }), 0, 0.02, 0, lant);
    brilhos.push({ x: 1.4, y: 0.2, z: -1.9, tam: 0.5, cor: '#ffc27a', forca: 0.8, tipo: 2 });

    var todas = est.concat(brilhos);
    var b = criarBrilhos(todas); scene.add(b.mesh);
    // as estrelas ficam fora da neblina
    b.mesh.material.fog = false;

    luzesBase(scene, '#3a4a86', '#140f14', 0.75);
    var lua = new THREE.DirectionalLight(corReal('#a9bdf0'), 0.45); lua.position.set(6, 6, -12); scene.add(lua);
    var luzVaral = new THREE.PointLight(corReal('#ffcf8a'), 1.4, 7, 1.5); luzVaral.position.set(0, 2.1, -0.6); scene.add(luzVaral);
    var luzLant = new THREE.PointLight(corReal('#ffb46b'), 0.6, 3, 1.6); luzLant.position.set(1.4, 0.3, -1.9); scene.add(luzLant);
    mesclarEstaticos(scene, scene);

    var texRastro = texturaCanvas(256, 16, function(c, w, h){
      var g = c.createLinearGradient(0, 0, w, 0);
      g.addColorStop(0, 'rgba(255,220,235,0)'); g.addColorStop(0.8, 'rgba(255,235,245,0.85)'); g.addColorStop(1, 'rgba(255,255,255,1)');
      c.fillStyle = g; c.fillRect(0, h * 0.3, w, h * 0.4);
      var v = c.createLinearGradient(0, 0, 0, h); v.addColorStop(0, 'rgba(0,0,0,1)'); v.addColorStop(0.5, 'rgba(0,0,0,0)'); v.addColorStop(1, 'rgba(0,0,0,1)');
      c.globalCompositeOperation = 'destination-out'; c.fillStyle = v; c.fillRect(0, 0, w, h);
    }, null, true);
    var rastro = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), new THREE.MeshBasicMaterial({ map: texRastro, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, opacity: 0, fog: false }));
    rastro.userData.manter = true;
    rastro.renderOrder = 6;
    scene.add(rastro);
    var cadente = { t: 0, prox: 4, ini: new V3(), dir: new V3(), frequente: false };
    var _dir = new V3(), _dir2 = new V3();
    function atualizarCadente(dt, camera){
      cadente.t += dt;
      if (cadente.t > cadente.prox){
        cadente.t = 0;
        cadente.prox = (cadente.frequente ? 2.5 : 7) + Math.random() * 4;
        camera.getWorldDirection(_dir);
        var az = Math.atan2(_dir.x, -_dir.z) + (Math.random() - 0.5) * 0.7;
        var el = Math.max(0.35, Math.asin(Math.max(-1, Math.min(1, _dir.y)))) + (Math.random() - 0.3) * 0.4;
        cadente.ini.set(Math.sin(az) * Math.cos(el), Math.sin(el), -Math.cos(az) * Math.cos(el)).multiplyScalar(40).add(camera.position);
        cadente.dir.set(Math.random() < 0.5 ? 1 : -1, -0.5, (Math.random() - 0.5) * 0.4).normalize();
      }
      var k = cadente.t / 0.9;
      if (k > 1){ rastro.material.opacity = 0; return; }
      var len = 7;
      rastro.position.copy(cadente.ini).addScaledVector(cadente.dir, k * 16 - len / 2);
      rastro.quaternion.copy(camera.quaternion);
      _dir.set(1, 0, 0).applyQuaternion(camera.quaternion);
      _dir2.set(0, 1, 0).applyQuaternion(camera.quaternion);
      var dx = cadente.dir.dot(_dir), dy = cadente.dir.dot(_dir2);
      rastro.rotateZ(Math.atan2(dy, dx));
      rastro.scale.set(len * Math.max(0.2, Math.hypot(dx, dy)), 0.32, 1);
      rastro.material.opacity = Math.sin(Math.PI * k);
    }

    var tocando = false;
    function colocarCapas(capas, ordem){
      capasMesh.forEach(function(cm, i){
        var id = ordem[i % ordem.length];
        if (!capas[id]) return;
        cm.material = new THREE.MeshStandardMaterial({ map: texturaDeFoto(capas[id], 1), roughness: 0.6 });
      });
    }
    function rotuloDe(uri){ rotulo.material = new THREE.MeshStandardMaterial({ map: texturaDeFoto(uri, 1), roughness: 0.6 }); }

    return {
      id: 'varanda', scene: scene,
      clicaveis: [{ obj: toqueToca, acao: 'musica' }].concat(capasMesh.map(function(c){ return { obj: c, acao: 'musica' }; }), cadeiras),
      cam: { pos: new V3(0, 1.65, 2.6), alvo: new V3(0, 1.05, -3.0) },
      colocarCapas: colocarCapas, rotuloDe: rotuloDe,
      tocar: function(sim){ tocando = sim; piloto.material.color.set(sim ? 0xff4a4a : 0x331111); },
      sentado: function(sim){ cadente.frequente = sim; if (sim) cadente.prox = Math.min(cadente.prox, cadente.t + 2.2); },
      atualizar: function(dt, t, camera){
        b.u.uTempo.value = t;
        if (camera) atualizarCadente(dt, camera);
        if (tocando) disco.rotation.y -= dt * 3.49;
        braco.rotation.y = tocando ? 0.2 : 0.5;
      }
    };
  }

  return { criarSala: criarSala, criarQuarto: criarQuarto, criarCozinha: criarCozinha, criarVaranda: criarVaranda };
}
