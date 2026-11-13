"""Get the Blender renders ready for the game: trim empty edges, keep masks lined up, make the tinted parts
pure white (so colour multiplies cleanly), and turn texture tiles into mid-grey relief tiles.
Out: ../looks/assets/<style>/  +  ../looks/assets/atlas.json (sizes and trims)"""
import json, os, glob
from PIL import Image, ImageOps, ImageStat
SRC = 'out'; DST = '../looks/assets'
atlas = {}
props = ['crayon', 'crayon_box', 'cpencil', 'pencil', 'pencil_cup', 'marker', 'brush_round', 'brush_flat', 'palette_knife',
         'mixing_palette', 'water_cup', 'yarn_ball', 'clay_lump', 'eraser', 'art_tin', 'stump']
for st in ['real', 'toon', 'pixel']:
    os.makedirs(f'{DST}/{st}', exist_ok=True)
    for n in props:
        im = Image.open(f'{SRC}/{st}/{n}.png').convert('RGBA')
        mk = f'{SRC}/real/{n}_mask.png'
        mask = Image.open(mk).convert('RGBA').getchannel('A') if os.path.exists(mk) and Image.open(mk).getbbox() else None
        if mask and mask.size != im.size: mask = mask.resize(im.size, Image.NEAREST if st == 'pixel' else Image.BILINEAR)
        bb = im.getchannel('A').point(lambda v: 255 if v > 8 else 0).getbbox()
        im = im.crop(bb)
        if st != 'pixel': im = im.resize((max(1, im.width//2), max(1, im.height//2)), Image.LANCZOS)
        if mask:
            mask = mask.crop(bb)
            if mask.size != im.size: mask = mask.resize(im.size, Image.LANCZOS)
            # lift tinted parts so their brightest is white
            L = im.convert('L'); vals = [v for v, m in zip(L.get_flattened_data(), mask.get_flattened_data()) if m > 128]
            if vals:
                hi = sorted(vals)[int(len(vals)*.97)]
                k = 255/max(40, hi)
                lifted = im.convert('RGB').point(lambda v: min(255, int(v*k)))
                im = Image.composite(Image.merge('RGBA', (*lifted.split(), im.getchannel('A'))), im, mask)
            if st == 'pixel': mask = mask.point(lambda v: 255 if v > 110 else 0)
            mask.save(f'{DST}/{st}/{n}_mask.png')
        if n == 'mixing_palette':
            W0, H0 = Image.open(f'{SRC}/{st}/{n}.png').size
            wl = json.load(open(f'{SRC}/real/mixing_palette_wells.json'))
            atlas.setdefault('wells', {})[st] = [dict(x=(w['x']*W0-bb[0])/(bb[2]-bb[0]), y=(w['y']*H0-bb[1])/(bb[3]-bb[1]), r=w['r']*W0/(bb[2]-bb[0])) for w in wl]
        im.save(f'{DST}/{st}/{n}.png', optimize=True)
        atlas.setdefault(n, {})[st] = dict(w=im.width, h=im.height, mask=bool(mask))
    # textures: relief tiles, mean 128
    for n in ['tex_clay', 'tex_knit', 'tex_felt', 'tex_yarn_strand']:
        im = Image.open(f'{SRC}/{st}/{n}.png').convert('RGBA')
        if n in ('tex_knit', 'tex_yarn_strand'):
            bb = im.getchannel('A').getbbox(); im = im.crop(bb)
            L = im.convert('L'); m = ImageStat.Stat(L, im.getchannel('A')).mean[0]
            kk = 3.4 if n == 'tex_yarn_strand' else 2.0
            g = L.point(lambda v: max(0, min(255, int(128+(v-m)*kk))))
            out = Image.merge('RGBA', (g, g, g, im.getchannel('A')))
            if n == 'tex_knit':  # fill the gaps between stitches with a shadow so the tile is solid
                bgc = Image.new('RGBA', im.size, (70, 70, 70, 255)); bgc.alpha_composite(out); out = bgc
        else:
            L = im.convert('L'); m = ImageStat.Stat(L).mean[0]; sd = ImageStat.Stat(L).stddev[0] or 1
            want = 20 if n == 'tex_clay' else 30
            g = L.point(lambda v: max(0, min(255, int(128+(v-m)*want/sd))))
            out = Image.merge('RGBA', (g, g, g, Image.new('L', im.size, 255)))
        out.save(f'{DST}/{st}/{n}.png', optimize=True)
        atlas.setdefault(n, {})[st] = dict(w=out.width, h=out.height)
wells = atlas.pop('wells')
json.dump(dict(props=atlas, wells=wells), open(f'{DST}/atlas.json', 'w'))
print('ok', sum(os.path.getsize(f) for f in glob.glob(DST + '/*/*.png'))//1024, 'KB')
