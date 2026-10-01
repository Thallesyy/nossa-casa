/* os textos da casa: são rascunhos, pode mudar à vontade */
var TEXTOS = {
  titulo: 'a nossa casa',
  subtitulo: 'a que ainda não existe,\nmas eu já sei como vai ser',
  dica: 'toca numa janela pra entrar',

  sala:    { titulo: 'a sala',    dica: 'toca num quadro' },
  quarto:  { titulo: 'o quarto',  dica: 'tem uma carta pra você em cima da cama' },
  cozinha: { titulo: 'a cozinha', dica: 'toca na geladeira' },
  varanda: { titulo: 'a varanda', dica: 'toca no toca-discos, ou senta numa cadeira pra ver o céu', ceu: 'o nosso céu' },

  // a carta do quarto (cada \n é uma quebra de linha)
  carta:
    'Nicolly\n\n' +
    'Essa é a casa que tanto sonhamos, eu sei que ela nao ta perfeita e ainda falta muita coisa, ' +
    'mas eu queria mostrar que eu ja imagino nossa casa, cada comodo aqui tem um memoria e um motivo ' +
    'do porque eu tanto quero viver isso com voce\n\n' +
    'Eu te amo',
  assinatura: 'com amor:Thales'
};

// os mesversários aparecem sozinhos na geladeira, todo dia 20. aqui vai o texto de cada um (opcional)
var MESVERSARIOS = {
  1: 'nosso primeiro mesversário.'
};

// outras datas especiais pra geladeira: 'aaaa-mm-dd'
var ESPECIAIS = [
  { data: '2026-05-20', titulo: 'o pedido', texto: 'o dia em que eu fiz o pedido, em Sapucaia do Sul.' }
];

// as músicas da varanda (os arquivos ficam em musicas/)
var MUSICAS = [
  { id: 'pyramids',      titulo: 'Pyramids',             artista: 'Frank Ocean' },
  { id: 'love-drought',  titulo: 'Love Drought',         artista: 'Beyoncé' },
  { id: 'best-part',     titulo: 'Best Part',            artista: 'Daniel Caesar e H.E.R.' },
  { id: 'all-of-me',     titulo: 'All of Me',            artista: 'John Legend' },
  { id: 'haunted',       titulo: 'Haunted',              artista: 'Beyoncé' },
  { id: 'dance-for-you', titulo: 'Dance for You',        artista: 'Beyoncé' },
  { id: 'especial',      titulo: 'essa aqui é especial', artista: 'Thales' }
];
