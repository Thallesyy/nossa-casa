"""
Gera o fotos.js da sala a partir das fotos do casal do site eu-e-voce-react.

  python3 ferramentas/preparar-fotos.py

As 7 primeiras da lista vão nos quadros da parede; todas aparecem quando ela toca num quadro.
Ficaram de fora as quase repetidas (as selfies no espelho) e a us23 (tem um bebê).
"""
import base64, io, json, os
from PIL import Image, ImageOps

AQUI = os.path.dirname(os.path.abspath(__file__))
ORIGEM = os.path.join(AQUI, '..', '..', 'eu-e-voce-react 2', 'eu-e-voce-react', 'public')
SAIDA = os.path.join(AQUI, '..', 'fotos.js')

FOTOS = [
    'us13', 'us40', 'us24', 'us33', 'us26', 'us9', 'us5',
    'us1', 'us4', 'us6', 'us8', 'us10', 'us12', 'us14', 'us16', 'us21', 'us22',
    'us27', 'us28', 'us30', 'us32', 'us39', 'us44',
]


def main():
    saida = {}
    for nome in FOTOS:
        img = ImageOps.exif_transpose(Image.open(os.path.join(ORIGEM, nome + '.jpg'))).convert('RGB')
        img.thumbnail((900, 900), Image.LANCZOS)
        buf = io.BytesIO()
        img.save(buf, 'JPEG', quality=80, optimize=True, progressive=True)
        saida[nome] = 'data:image/jpeg;base64,' + base64.b64encode(buf.getvalue()).decode('ascii')
    with open(SAIDA, 'w', encoding='utf-8') as f:
        f.write('/* gerado por ferramentas/preparar-fotos.py , não edite à mão */\n')
        f.write('var FOTOS_CASA = ' + json.dumps(saida) + ';\n')
    print('ok: %d fotos, %.2f MB' % (len(saida), os.path.getsize(SAIDA) / 1e6))


if __name__ == '__main__':
    main()
