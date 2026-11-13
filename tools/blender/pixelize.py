"""Pixel style kit: takes the toon renders, shrinks them to chunky pixels, snaps alpha and colours. Out: out/pixel/"""
import glob, os
from PIL import Image
os.makedirs('out/pixel', exist_ok=True)
for f in glob.glob('out/toon/*.png'):
    n = os.path.basename(f)
    im = Image.open(f).convert('RGBA')
    k = 4 if not n.startswith('tex_') else 2
    sm = im.resize((max(1, im.width//k), max(1, im.height//k)), Image.BOX)
    a = sm.getchannel('A').point(lambda v: 255 if v > 110 else 0)
    rgb = sm.convert('RGB').quantize(colors=20, method=Image.Quantize.MEDIANCUT, dither=Image.Dither.NONE).convert('RGB')
    out = rgb.convert('RGBA'); out.putalpha(a)
    out.save('out/pixel/' + n)
print('ok')
