"""
Copia as músicas já cortadas/tratadas do toca-discos pra cá (mesmos arquivos, sem reprocessar).

  python3 ferramentas/copiar-musicas.py
"""
import os, shutil

AQUI = os.path.dirname(os.path.abspath(__file__))
ORIGEM = os.path.join(AQUI, '..', '..', 'toca-discos', 'musicas')
SAIDA = os.path.join(AQUI, '..', 'musicas')

FAIXAS = ['pyramids', 'love-drought', 'best-part', 'all-of-me', 'especial', 'haunted', 'dance-for-you']


def main():
    os.makedirs(SAIDA, exist_ok=True)
    for faixa in FAIXAS:
        origem = os.path.join(ORIGEM, faixa + '.mp3')
        destino = os.path.join(SAIDA, faixa + '.mp3')
        shutil.copyfile(origem, destino)
        print('copiado:', faixa + '.mp3')


if __name__ == '__main__':
    main()
