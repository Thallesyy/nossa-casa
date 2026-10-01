"""
Gera o capas.js a partir das capas das músicas (eu-e-voce-react/public/capa1..7.jpg).

  python3 ferramentas/preparar-capas.py
"""
import base64, io, json, os
from PIL import Image, ImageOps

AQUI = os.path.dirname(os.path.abspath(__file__))
ORIGEM = os.path.join(AQUI, '..', '..', 'eu-e-voce-react 2', 'eu-e-voce-react', 'public')
SAIDA = os.path.join(AQUI, '..', 'capas.js')

CAPAS = {
    'pyramids': 'capa1', 'love-drought': 'capa2', 'best-part': 'capa3', 'all-of-me': 'capa4',
    'especial': 'capa5', 'haunted': 'capa6', 'dance-for-you': 'capa7',
}


def main():
    saida = {}
    for chave, arquivo in CAPAS.items():
        img = ImageOps.exif_transpose(Image.open(os.path.join(ORIGEM, arquivo + '.jpg'))).convert('RGB')
        img.thumbnail((400, 400), Image.LANCZOS)
        buf = io.BytesIO()
        img.save(buf, 'JPEG', quality=84, optimize=True, progressive=True)
        saida[chave] = 'data:image/jpeg;base64,' + base64.b64encode(buf.getvalue()).decode('ascii')
    with open(SAIDA, 'w', encoding='utf-8') as f:
        f.write('/* gerado por ferramentas/preparar-capas.py , não edite à mão */\n')
        f.write('var CAPAS = ' + json.dumps(saida) + ';\n')
    print('ok: %d capas, %.2f MB' % (len(saida), os.path.getsize(SAIDA) / 1e6))


if __name__ == '__main__':
    main()
