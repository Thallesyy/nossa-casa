# A nossa casa

Uma casa de dois andares, com jardim, que começa num pôr do sol rosado e vai anoitecendo
até as luzes acenderem. Ela toca numa janela (ou no nome do cômodo) e entra:

- **A sala:** quadros com as nossas fotos na parede. Tocando num quadro, a foto abre grande
  e dá pra passar todas.
- **O quarto:** cama, luzinhas e uma carta em cima da cama.
- **A cozinha:** a geladeira com os bilhetes das nossas datas, e um calendário com o dia de
  hoje. Os mesversários aparecem sozinhos todo dia 20.
- **A varanda:** duas cadeiras olhando a noite e um toca-discos com as nossas músicas. A
  música continua tocando pela casa toda, com um botãozinho de pausar no canto.

Por fora tem roseiras, cerca branca, caminho de pedra, poste de luz, vaga-lumes, a lua e a
fumaça saindo da chaminé. A porta tem o número 20.

## Como abrir

Abra o `index.html` no navegador. No iPhone precisa estar publicado (GitHub Pages) e abrir
pelo link no Safari.

## Trocar coisas

- **Textos** (título, carta, dicas de cada cômodo): `textos.js`, em `TEXTOS`.
- **Texto de cada mesversário**: `textos.js`, em `MESVERSARIOS` (os que não tiverem texto
  aparecem só com o nome, tipo "3 meses").
- **Outras datas especiais** (primeiro date, primeiro beijo...): `textos.js`, em `ESPECIAIS`.
- **Nomes das músicas**: `textos.js`, em `MUSICAS`.
- **Fotos da sala**: a lista fica em `ferramentas/preparar-fotos.py`. As 7 primeiras vão nos
  quadros da parede. Depois de trocar, rode `python3 ferramentas/preparar-fotos.py`.
- **Músicas e capas**: `python3 ferramentas/copiar-musicas.py` (copia do toca-discos) e
  `python3 ferramentas/preparar-capas.py`.

## Arquivos

- `index.html`: a página, a abertura, entrar e sair dos cômodos, foto, carta, datas e música
- `ceu.js`: o céu (pôr do sol, noite, lua e estrelas)
- `casa.js`: a casa por fora e o jardim
- `comodos.js`: os quatro cômodos por dentro
- `base.js`: peças que os outros usam (luzinhas, texturas, caixas)
- `textos.js`: os textos
- `fotos.js` e `capas.js`: as fotos e capas embutidas (gerados), carregados só quando ela
  entra na sala ou na varanda

## Para testar

- `index.html?teste=1&intro=0`: pula a abertura.
- `index.html?teste=1&t=6`: a abertura parada no segundo 6.
- `index.html?teste=1&comodo=sala` (ou `quarto`, `cozinha`, `varanda`): já dentro do cômodo.
- `&dia=200`: como fica no dia 200 (muda o calendário e os bilhetes da geladeira).

No modo `teste=1` nada anda sozinho (é pra tirar print). Pra ver normal, abra sem ele.
