"""Shoebox Studio desk props, made in Blender from code (Blender 5.3 as a Python module).
Each prop is modelled from simple shapes, lit like a lamp over a school desk, and rendered
top-down (a little tilted) to a transparent PNG with a soft contact shadow.
Parts that take the player's colour (crayon wax, pencil paint, marker cap, yarn, clay, brush tip)
are white, and a second render saves them as a mask (name_mask.png) so the game can tint them.
Run: python3 desk_props.py  (needs: pip install bpy)   Out: ./out/*.png
By MajorasPride. Original designs, no brands."""
import bpy, bmesh, math, os, sys
from mathutils import Vector, Matrix

OUT = os.path.join(os.path.dirname(os.path.abspath(__file__)), "out")
os.makedirs(OUT, exist_ok=True)
PX = 128  # pixels per scene unit (1 unit = 1 cm on the desk)
# art style kit: real (Cycles, soft lamp light), toon (flat colours + outline, like his other games), pixel (toon made small, then pixel-snapped)
STYLE = os.environ.get("STYLE", "real")
OUT = os.path.join(OUT, STYLE); os.makedirs(OUT, exist_ok=True)
ONLY = sys.argv[sys.argv.index("--")+1:] if "--" in sys.argv else []


def srgb(h):
    c = [int(h[i:i+2], 16)/255 for i in (0, 2, 4)]
    return tuple(x/12.92 if x <= 0.04045 else ((x+0.055)/1.055)**2.4 for x in c)


def reset():
    bpy.ops.wm.read_factory_settings(use_empty=True)
    s = bpy.context.scene
    s.render.engine = 'CYCLES'
    s.cycles.samples = 48
    s.cycles.use_denoising = True
    s.cycles.device = 'CPU'
    s.render.film_transparent = True
    s.view_settings.view_transform = 'Standard'
    s.view_settings.look = 'None'
    s.render.image_settings.file_format = 'PNG'
    s.render.image_settings.color_mode = 'RGBA'
    w = bpy.data.worlds.new("W"); s.world = w; w.use_nodes = True
    bg = w.node_tree.nodes["Background"]; bg.inputs[0].default_value = (1, .97, .92, 1); bg.inputs[1].default_value = .8
    # desk lamp: warm key from top-left, soft
    L = bpy.data.lights.new("Key", 'AREA'); L.energy = 4200; L.size = 30; L.color = (1, .95, .86)
    o = bpy.data.objects.new("Key", L); s.collection.objects.link(o); o.location = (-30, 30, 60)
    o.rotation_euler = (Vector((0, 0, 0)) - o.location).to_track_quat('-Z', 'Y').to_euler()
    # no floor: the game draws each prop's shadow itself, so a picked-up supply can lift off the desk
    bpy.ops.mesh.primitive_plane_add(size=1, location=(0, 0, -50)); bpy.context.object.name = "Plane"
    bpy.context.object.hide_render = True
    if STYLE != "real":
        s.render.engine = 'BLENDER_WORKBENCH'
        sh = s.display.shading; sh.color_type = 'MATERIAL'; sh.show_specular_highlight = STYLE == "toon"
        sh.light = 'STUDIO' if STYLE == "toon" else 'FLAT'
        sh.show_object_outline = True; sh.object_outline_color = (.12, .07, .04)
        sh.show_cavity = STYLE == "toon"; sh.cavity_type = 'BOTH'
        s.display.render_aa = '8' if STYLE == "toon" else 'OFF'
    return s


MATS = {}
def mat(name, hexcol, rough=.55, metal=0., tint=False, sss=0., coat=0., trans=0., alpha=1.):
    m = bpy.data.materials.new(name); m.use_nodes = True
    b = m.node_tree.nodes["Principled BSDF"]
    b.inputs["Base Color"].default_value = (*srgb(hexcol), 1)
    b.inputs["Roughness"].default_value = rough
    b.inputs["Metallic"].default_value = metal
    if sss:
        b.inputs["Subsurface Weight"].default_value = sss
        b.inputs["Subsurface Radius"].default_value = (.4, .3, .25)
    if coat: b.inputs["Coat Weight"].default_value = coat
    if trans:
        b.inputs["Transmission Weight"].default_value = trans; b.inputs["IOR"].default_value = 1.45
    if alpha < 1: b.inputs["Alpha"].default_value = alpha
    m.diffuse_color = (*srgb(hexcol), 1)
    m["tint"] = 1 if tint else 0
    return m


def obj_from_bm(bm, name, m, smooth=True, loc=(0, 0, 0)):
    me = bpy.data.meshes.new(name); bm.to_mesh(me); bm.free()
    if smooth:
        for p in me.polygons: p.use_smooth = True
    ob = bpy.data.objects.new(name, me); bpy.context.scene.collection.objects.link(ob)
    ob.location = loc; me.materials.append(m); return ob


def cylinder(name, m, r, length, seg=24, r2=None, axis='X', loc=(0, 0, 0), smooth=True, bevel=0.):
    bm = bmesh.new()
    bmesh.ops.create_cone(bm, cap_ends=True, segments=seg, radius1=r, radius2=r if r2 is None else r2, depth=length)
    if axis == 'X': bmesh.ops.rotate(bm, verts=bm.verts, cent=(0, 0, 0), matrix=Matrix.Rotation(math.radians(90), 3, 'Y'))
    if axis == 'Y': bmesh.ops.rotate(bm, verts=bm.verts, cent=(0, 0, 0), matrix=Matrix.Rotation(math.radians(90), 3, 'X'))
    ob = obj_from_bm(bm, name, m, smooth, loc)
    if bevel:
        mod = ob.modifiers.new("b", 'BEVEL'); mod.width = bevel; mod.segments = 2; mod.limit_method = 'ANGLE'
    return ob


def box(name, m, size, loc=(0, 0, 0), bevel=.05, seg=3):
    bm = bmesh.new(); bmesh.ops.create_cube(bm, size=1)
    for v in bm.verts: v.co.x *= size[0]; v.co.y *= size[1]; v.co.z *= size[2]
    ob = obj_from_bm(bm, name, m, False, loc)
    if bevel:
        mod = ob.modifiers.new("b", 'BEVEL'); mod.width = bevel; mod.segments = seg
    return ob


def sphere(name, m, r, loc=(0, 0, 0), scale=(1, 1, 1), sub=3):
    bm = bmesh.new(); bmesh.ops.create_icosphere(bm, subdivisions=sub, radius=r)
    for v in bm.verts: v.co.x *= scale[0]; v.co.y *= scale[1]; v.co.z *= scale[2]
    return obj_from_bm(bm, name, m, True, loc)


def lay(objs, rotz=0., loc=(0, 0, 0)):
    """Parent a group to an empty so it can be turned on the desk."""
    e = bpy.data.objects.new("grp", None); bpy.context.scene.collection.objects.link(e)
    for o in objs: o.parent = e
    e.rotation_euler.z = math.radians(rotz); e.location = loc
    return e


def render(name, w_cm, h_cm, tilt=12, mask=True, cx=0., cy=0.):
    """Orthographic camera looking down at the desk, tilted a little so props read as 3D."""
    s = bpy.context.scene
    cam = bpy.data.objects.new("Cam", bpy.data.cameras.new("Cam")); s.collection.objects.link(cam); s.camera = cam
    cam.data.type = 'ORTHO'; cam.data.ortho_scale = max(w_cm, h_cm)
    t = math.radians(tilt)
    cam.location = (cx, cy - math.sin(t)*80, math.cos(t)*80)
    cam.rotation_euler = (t, 0, 0)
    s.render.resolution_x = int(w_cm*PX/4); s.render.resolution_y = int(h_cm*PX/4)  # 32 px per cm
    s.render.filepath = os.path.join(OUT, name + ".png")
    bpy.ops.render.render(write_still=True)
    if not mask or STYLE != "real": return
    # mask pass: tint parts white emission, everything else holdout, no shadows
    s.cycles.samples = 8; s.cycles.use_denoising = False
    white = bpy.data.materials.new("mW"); white.use_nodes = True
    nt = white.node_tree; nt.nodes.clear(); em = nt.nodes.new("ShaderNodeEmission"); em.inputs[0].default_value = (1, 1, 1, 1)
    out = nt.nodes.new("ShaderNodeOutputMaterial"); nt.links.new(em.outputs[0], out.inputs[0])
    hold = bpy.data.materials.new("mH"); hold.use_nodes = True
    nt = hold.node_tree; nt.nodes.clear(); h = nt.nodes.new("ShaderNodeHoldout")
    out = nt.nodes.new("ShaderNodeOutputMaterial"); nt.links.new(h.outputs[0], out.inputs[0])
    for o in s.objects:
        if o.type != 'MESH': continue
        for i, sl in enumerate(o.material_slots):
            sl.material = white if (sl.material and sl.material.get("tint")) else hold
    s.render.filepath = os.path.join(OUT, name + "_mask.png")
    bpy.ops.render.render(write_still=True)
    s.cycles.samples = 48; s.cycles.use_denoising = True


# ------------------------------------------------------------------ props
def crayon():
    reset()
    wax = mat("wax", "f4f4f2", rough=.35, tint=True, sss=.15)
    paper = mat("wrap", "f7f7f4", rough=.8, tint=True)
    ink = mat("ink", "26221f", rough=.7)
    L, r = 9.0, .55
    parts = [cylinder("body", wax, r, L*.86, 18, axis='X', loc=(-L*.07, 0, r))]
    tip = cylinder("tip", wax, r, L*.14, 18, r2=r*.28, axis='X', loc=(L*.43+L*.07*0, 0, r))
    tip.location.x = L*.36 + L*.07; parts.append(tip)
    wr = cylinder("wrap", paper, r*1.06, L*.62, 18, axis='X', loc=(-L*.12, 0, r)); parts.append(wr)
    for x in (-L*.38, -L*.30, L*.12, L*.18):
        parts.append(cylinder("band", ink, r*1.08, .18, 18, axis='X', loc=(x, 0, r)))
    lay(parts, 0)
    render("crayon", 11, 2.4, tilt=14)


def crayon_box():
    reset()
    card = mat("card", "f2c53d", rough=.75)
    card2 = mat("card2", "2f7fd0", rough=.75)
    inside = mat("in", "e9d9a8", rough=.85)
    o = []
    W, D, H = 14.0, 4.2, 5.0  # holds 12 crayons standing in two rows, lying flat on the desk: box seen from above
    # box lying on its back, open lid flipped up toward the top of the picture
    o.append(box("base", card, (W, H, D*.5), (0, 0, D*.25), .08))
    o.append(box("well", inside, (W-.6, H-.6, .2), (0, 0, D*.5+.01), .02))
    o.append(box("stripe", card2, (W+.02, H*.32, D*.5+.02), (0, -H*.18, D*.25), .06))
    lid = box("lid", card, (W, H*.75, .18), (0, H*.5+H*.36, .09), .05); o.append(lid)
    o.append(box("lidstripe", card2, (W+.02, H*.22, .2), (0, H*.5+H*.42, .1), .04))
    lay(o)
    render("crayon_box", 16, 13, tilt=10, mask=False)


def cpencil():
    reset()
    paint = mat("paint", "f4f4f2", rough=.3, tint=True, coat=.3)
    wood = mat("wood", "e8c79a", rough=.7)
    lead = mat("lead", "f4f4f2", rough=.4, tint=True)
    endc = mat("end", "f4f4f2", rough=.5, tint=True)
    L, r = 16.0, .42
    b = cylinder("body", paint, r, L*.88, 6, axis='X', loc=(-L*.06, 0, r), smooth=False, bevel=.04)
    cone = cylinder("cone", wood, r*.92, L*.1, 18, r2=r*.25, axis='X', loc=(L*.44, 0, r))
    tip = cylinder("lead", lead, r*.25, L*.03, 12, r2=.02, axis='X', loc=(L*.505, 0, r))
    lay([b, cone, tip])
    render("cpencil", 18, 1.6, tilt=14)


def graphite_pencil():
    reset()
    paint = mat("paint", "f2c230", rough=.3, coat=.3)
    wood = mat("wood", "e8c79a", rough=.7)
    lead = mat("lead", "2b2b30", rough=.35, metal=.3)
    ferr = mat("ferr", "c9c9cc", rough=.25, metal=1)
    rub = mat("rub", "f08aa0", rough=.6)
    L, r = 16.0, .42
    o = [cylinder("body", paint, r, L*.78, 6, axis='X', loc=(-L*.01, 0, r), smooth=False, bevel=.04),
         cylinder("cone", wood, r*.92, L*.1, 18, r2=r*.25, axis='X', loc=(L*.43, 0, r)),
         cylinder("lead", lead, r*.25, L*.03, 12, r2=.02, axis='X', loc=(L*.495, 0, r)),
         cylinder("ferr", ferr, r*1.04, L*.06, 18, axis='X', loc=(-L*.42, 0, r)),
         cylinder("rub", rub, r*1.0, L*.05, 18, axis='X', loc=(-L*.475, 0, r))]
    lay(o)
    render("pencil", 18, 1.6, tilt=14, mask=False)


def pencil_cup():
    reset()
    tin = mat("tin", "7aa7c7", rough=.35, metal=.6)
    rim = mat("rim", "d9dde2", rough=.2, metal=1)
    o = [cylinder("cup", tin, 3.4, 9, 32, axis='Z', loc=(0, 0, 4.5)),
         cylinder("rim", rim, 3.55, .5, 32, axis='Z', loc=(0, 0, 9)),
         cylinder("rim2", rim, 3.55, .5, 32, axis='Z', loc=(0, 0, .25))]
    hole = cylinder("hole", mat("dark", "2a221c", rough=.9), 3.1, .1, 32, axis='Z', loc=(0, 0, 9.26)); o.append(hole)
    lay(o)
    render("pencil_cup", 8.4, 9.4, tilt=34, mask=False, cy=2.6)


def marker():
    reset()
    bodym = mat("body", "f1f1ee", rough=.35)
    cap = mat("cap", "f4f4f2", rough=.3, tint=True)
    band = mat("band", "f4f4f2", rough=.4, tint=True)
    L, r = 13.0, .75
    o = [cylinder("body", bodym, r, L*.62, 24, axis='X', loc=(-L*.15, 0, r)),
         cylinder("cap", cap, r*1.08, L*.34, 24, axis='X', loc=(L*.33, 0, r*1.02)),
         cylinder("clip", cap, .14, L*.26, 8, axis='X', loc=(L*.32, 0, r*2.0)),
         cylinder("end", band, r*1.02, L*.06, 24, axis='X', loc=(-L*.47, 0, r)),
         cylinder("label", band, r*1.01, L*.12, 24, axis='X', loc=(-L*.1, 0, r))]
    lay(o)
    render("marker", 14.5, 2.6, tilt=14)


def brush(kind="round"):
    reset()
    handle = mat("handle", "c4472f", rough=.25, coat=.6)
    ferr = mat("ferr", "cfd2d6", rough=.2, metal=1)
    hair = mat("hair", "d8b98a", rough=.8)
    tip = mat("tip", "f4f4f2", rough=.35, tint=True)
    L = 20.0
    o = [cylinder("h", handle, .38, L*.62, 20, r2=.26, axis='X', loc=(-L*.12, 0, .45))]
    # handle flares toward the ferrule
    o[0].rotation_euler.y = math.radians(180)
    o.append(cylinder("f", ferr, .42, L*.13, 20, r2=.36, axis='X', loc=(L*.255, 0, .45)))
    if kind == "round":
        o.append(sphere("hair", hair, 1, (L*.36, 0, .45), (1.6, .38, .38)))
        o.append(sphere("tip", tip, 1, (L*.42, 0, .45), (.85, .26, .26)))
    else:
        o.append(box("hair", hair, (2.4, 1.3, .32), (L*.37, 0, .45), .12))
        o.append(box("tip", tip, (.9, 1.3, .34), (L*.42, 0, .45), .12))
    lay(o, 0)
    render("brush_" + kind, 22, 2.2, tilt=12)


def palette_knife():
    reset()
    handle = mat("handle", "8a5a35", rough=.45, coat=.4)
    steel = mat("steel", "d6d9de", rough=.15, metal=1)
    o = [cylinder("h", handle, .45, 9, 20, r2=.35, axis='X', loc=(-5, 0, .55)),
         cylinder("f", steel, .3, 1.2, 16, axis='X', loc=(-.1, 0, .55))]
    # cranked neck then a flat trowel blade
    o.append(cylinder("neck", steel, .1, 2.2, 8, axis='X', loc=(1.4, 0, .4)))
    bm = bmesh.new()
    pts = [(0, -.05), (1.5, -.75), (5.6, -.55), (6.6, 0), (5.6, .55), (1.5, .75), (0, .05)]
    vs = [bm.verts.new((x+2.4, y, .14)) for x, y in pts]
    f = bm.faces.new(vs)
    ext = bmesh.ops.extrude_face_region(bm, geom=[f])
    for v in [e for e in ext["geom"] if isinstance(e, bmesh.types.BMVert)]: v.co.z -= .06
    o.append(obj_from_bm(bm, "blade", steel, False))
    lay(o, 0)
    render("palette_knife", 16, 2.2, tilt=14, mask=False)


def mixing_palette():
    reset()
    plastic = mat("pl", "fbfaf7", rough=.25, coat=.4)
    W, H = 18, 12
    bm = bmesh.new()
    # kidney-ish oval with a thumb hole
    seg = 48
    vs = [bm.verts.new((math.cos(a)*W/2*(1-.06*math.cos(2*a)), math.sin(a)*H/2, 0)) for a in [i/seg*math.tau for i in range(seg)]]
    f = bm.faces.new(vs)
    ext = bmesh.ops.extrude_face_region(bm, geom=[f])
    for v in [e for e in ext["geom"] if isinstance(e, bmesh.types.BMVert)]: v.co.z += .55
    p = obj_from_bm(bm, "pal", plastic, False)
    mod = p.modifiers.new("b", 'BEVEL'); mod.width = .25; mod.segments = 3
    o = [p]
    # 6 wells round the rim + a big mixing dish in the middle (cut with boolean)
    wells = []
    for i in range(6):
        a = math.radians(200 - i*44)
        wells.append((math.cos(a)*W*.36, math.sin(a)*H*.33, 1.25))
    wells.append((W*.08, -H*.05, 2.6))
    for k, (x, y, r) in enumerate(wells):
        c = sphere("cut%d" % k, plastic, r, (x, y, .55+r*.35), (1, 1, .55))
        b = p.modifiers.new("w%d" % k, 'BOOLEAN'); b.object = c; b.operation = 'DIFFERENCE'; c.hide_render = True
    th = cylinder("thumb", plastic, 1.1, 3, 24, axis='Z', loc=(-W*.3, -H*.18, .3)); th.hide_render = True
    b = p.modifiers.new("th", 'BOOLEAN'); b.object = th; b.operation = 'DIFFERENCE'
    lay(o)
    render("mixing_palette", 20, 14, tilt=8, mask=False)
    # where the wells land in the picture (fractions), for the game to paint paint in them
    import json
    tilt = math.radians(8)
    js = [dict(x=.5 + x/20, y=.5 - (y*math.cos(tilt) + .6*math.sin(tilt))/14, r=r/20) for x, y, r in wells]
    json.dump(js, open(os.path.join(OUT, "mixing_palette_wells.json"), "w"))


def water_cup():
    reset()
    glass = mat("glass", "ffffff", rough=.05, trans=1.)
    water = mat("water", "f4f4f2", rough=.05, tint=True, trans=.6)
    o = [cylinder("glass", glass, 3.2, 7.5, 40, r2=3.6, axis='Z', loc=(0, 0, 3.75)),
         cylinder("water", water, 3.0, 5.2, 40, r2=3.3, axis='Z', loc=(0, 0, 2.7))]
    sol = o[0].modifiers.new("s", 'SOLIDIFY'); sol.thickness = .18
    lay(o)
    render("water_cup", 8.4, 10, tilt=34, cy=2.4)


def yarn_ball():
    reset()
    y = mat("yarn", "f4f4f2", rough=.9, tint=True, sss=.2)
    base = sphere("core", y, 3.2, (0, 0, 3.1), sub=4)
    o = [base]
    import random; R = random.Random(7)
    # wrap strands: thin tori at random angles around the ball
    for i in range(26):
        bm = bmesh.new()
        bmesh.ops.create_circle(bm, segments=64, radius=3.25+R.random()*.08)
        me = bpy.data.meshes.new("c"); bm.to_mesh(me); bm.free()
        ob = bpy.data.objects.new("wrap", me); bpy.context.scene.collection.objects.link(ob)
        ob.location = (0, 0, 3.1); ob.rotation_euler = (R.random()*math.pi, R.random()*math.pi, R.random()*math.pi)
        mod = ob.modifiers.new("sk", 'SKIN')
        for v in ob.data.skin_vertices[0].data: v.radius = (.22, .22)
        ob.modifiers.new("ss", 'SUBSURF').levels = 1
        ob.data.materials.append(y); o.append(ob)
    # loose tail
    cv = bpy.data.curves.new("tail", 'CURVE'); cv.dimensions = '3D'; cv.bevel_depth = .2; cv.bevel_resolution = 3
    sp = cv.splines.new('BEZIER'); sp.bezier_points.add(3)
    for p, co in zip(sp.bezier_points, [(2.6, -1.8, 1.4), (4.4, -3.2, .25), (6.6, -2.2, .2), (8.4, -3.6, .2)]):
        p.co = co; p.handle_left_type = p.handle_right_type = 'AUTO'
    t = bpy.data.objects.new("tail", cv); bpy.context.scene.collection.objects.link(t); t.data.materials.append(y); o.append(t)
    lay(o)
    render("yarn_ball", 12, 9, tilt=20, cx=1.6, cy=0.6)


def clay_lump():
    reset()
    c = mat("clay", "f4f4f2", rough=.62, tint=True, sss=.25)
    s = sphere("lump", c, 3, (0, 0, 2.0), (1.25, 1.0, .7), sub=5)
    tex = bpy.data.textures.new("n", 'CLOUDS'); tex.noise_scale = 1.6
    d = s.modifiers.new("d", 'DISPLACE'); d.texture = tex; d.strength = .5
    # a thumb dent
    dent = sphere("dent", c, 1.2, (-.8, .5, 3.35), (1.2, 1, .5)); dent.hide_render = True
    b = s.modifiers.new("b", 'BOOLEAN'); b.object = dent; b.operation = 'DIFFERENCE'
    s.modifiers.new("ss", 'SUBSURF').levels = 1
    lay([s])
    render("clay_lump", 9.5, 7.5, tilt=18, cy=.6)


def eraser():
    reset()
    pink = mat("pink", "f39ab0", rough=.7)
    o = [box("e", pink, (5, 2.4, 1.1), (0, 0, .55), .35, 4)]
    lay(o, -8)
    render("eraser", 6.4, 3.8, tilt=18, mask=False)


def art_tin():
    reset()
    tin = mat("tin", "3f8a63", rough=.35, metal=.5)
    lid = mat("lid", "e8443a", rough=.35, metal=.5)
    o = [box("t", tin, (12, 7, 1.6), (0, 0, .8), .3, 3), box("l", lid, (12.1, 7.1, .5), (0, 0, 1.7), .25, 3)]
    lay(o, 4)
    render("art_tin", 14, 9.4, tilt=14, mask=False)


def stump():
    """Blending stump (tortillon): rolled grey paper, pointed at both ends, a smudge of graphite on one tip."""
    reset()
    paper = mat("p", "d9d6cf", rough=.9)
    smudge = mat("s", "6e6a66", rough=.9)
    L, r = 12.0, .55
    o = [cylinder("body", paper, r, L*.7, 20, axis='X', loc=(0, 0, r)),
         cylinder("t1", paper, r, L*.15, 20, r2=.06, axis='X', loc=(L*.425, 0, r)),
         cylinder("t2", smudge, r, L*.15, 20, r2=.06, axis='X', loc=(-L*.425, 0, r))]
    o[2].rotation_euler.y = math.radians(180)
    lay(o)
    render("stump", 13.5, 1.8, tilt=14, mask=False)


# ------------------------------------------------------------------ textures (seamless tiles)
def yarn_strand_tile():
    """A 3-ply twisted yarn strand along X, seamless left to right (one full twist per tile)."""
    reset()
    y = mat("yarn", "f4f4f2", rough=.95, tint=True, sss=.2)
    T = 4.0  # tile length = one twist
    for k in range(3):
        cv = bpy.data.curves.new("ply", 'CURVE'); cv.dimensions = '3D'; cv.bevel_depth = .42; cv.bevel_resolution = 4
        sp = cv.splines.new('POLY'); n = 64; sp.points.add(n)
        for i in range(n+1):
            x = -T*1.5 + i/n*T*3; a = x/T*math.tau + k*math.tau/3
            sp.points[i].co = (x, math.cos(a)*.42, 1+math.sin(a)*.42, 1)
        o = bpy.data.objects.new("ply", cv); bpy.context.scene.collection.objects.link(o); o.data.materials.append(y)
    # fibre fuzz: little hairs
    import random; R = random.Random(3)
    hair = mat("fz", "f4f4f2", rough=1, tint=True)
    for i in range(70):
        x = -T*1.5 + R.random()*T*3; a = R.random()*math.tau
        cyl = cylinder("fz", hair, .025, .5, 4, axis='Y', loc=(x, math.cos(a)*.8, 1+math.sin(a)*.8))
        cyl.rotation_euler = (a, R.random(), R.random())
    bpy.data.objects["Plane"].hide_render = True
    s = bpy.context.scene
    render("tex_yarn_strand", T, 2.2, tilt=0)


def knit_tile():
    """Stockinette knitting: rows of V stitches, seamless both ways."""
    reset()
    y = mat("yarn", "f4f4f2", rough=.95, tint=True, sss=.2)
    bpy.data.objects["Plane"].hide_render = True
    cols, rows, sw, sh = 4, 4, 1.0, 0.8
    for r in range(-1, rows+1):
        for c in range(-1, cols+1):
            for s in (-1, 1):  # each stitch is two slanted legs (a V)
                x = c*sw + s*sw*.24; yv = r*sh
                leg = sphere("leg", y, .5, (x, yv+sh*.15, .3), (.36, .95, .34), sub=3)
                leg.rotation_euler.z = math.radians(-s*28)
    W, H = cols*sw, rows*sh
    render("tex_knit", W, H, tilt=0, cx=W/2-sw/2, cy=H/2-sh/2)


def clay_tile():
    """Clay surface: soft lumps, a few fingerprint swirls and tool marks. A periodic heightmap made with numpy
    displaces a plane in Blender, which is lit and rendered straight down, so the tile repeats with no seam."""
    import numpy as np
    reset()
    bpy.data.objects["Plane"].hide_render = True
    N = 256; R = np.random.default_rng(11)
    def pnoise(freq, amp):
        F = np.zeros((N, N), complex); k = freq
        for _ in range(40):
            u, v = R.integers(-k, k+1, 2); F[u % N, v % N] += (R.normal()+1j*R.normal())
        n = np.real(np.fft.ifft2(F)); return n/(n.std()+1e-9)*amp
    h = pnoise(4, .5) + pnoise(10, .35) + pnoise(26, .12)  # soft lumps from kneading
    yy, xx = np.mgrid[0:N, 0:N]/N
    for _ in range(2):  # faint fingerprint ridges (wrapped distance so they tile), no deep dents
        cx, cy, rad = R.random(), R.random(), .16+R.random()*.06
        dx = (xx-cx+.5) % 1-.5; dy = (yy-cy+.5) % 1-.5; d = np.sqrt(dx*dx+dy*dy*1.6)
        h += np.where(d < rad, np.sin(d*170)*.05*np.sin(np.pi*d/rad), 0) - np.where(d < rad, .25*np.sin(np.pi*d/rad), 0)
    h = (h-h.min())/(h.max()-h.min())
    img = bpy.data.images.new("h", N, N, float_buffer=True)
    px = np.repeat(h.reshape(-1, 1), 4, axis=1); px[:, 3] = 1
    img.pixels = px.ravel().tolist()
    tex = bpy.data.textures.new("ht", 'IMAGE'); tex.image = img; tex.extension = 'REPEAT'
    bpy.ops.mesh.primitive_grid_add(x_subdivisions=255, y_subdivisions=255, size=10, location=(0, 0, 0))
    g = bpy.context.object
    d = g.modifiers.new("d", 'DISPLACE'); d.texture = tex; d.texture_coords = 'UV'; d.strength = .6
    for p in g.data.polygons: p.use_smooth = True
    g.data.materials.append(mat("clay", "f4f4f2", rough=.6, sss=.15))
    k = bpy.data.objects["Key"]; k.location = (-60, 20, 25); k.rotation_euler = (Vector((0, 0, 0)) - k.location).to_track_quat('-Z', 'Y').to_euler()
    render("tex_clay", 10, 10, tilt=0, mask=False)


def felt_tile():
    """Felt: dense random fibres, seamless (fibres that cross an edge are drawn on both sides)."""
    reset()
    bpy.data.objects["Plane"].hide_render = True
    bpy.ops.mesh.primitive_plane_add(size=6, location=(0, 0, 0))
    bpy.context.object.data.materials.append(mat("base", "e8e8e4", rough=1))
    f = mat("f", "f6f6f2", rough=1)
    import random; R = random.Random(5)
    for i in range(500):
        x, y = R.uniform(-3, 3), R.uniform(-3, 3); a = R.random()*math.pi; L = R.uniform(.3, .9)
        for ox in (-6, 0, 6):
            for oy in (-6, 0, 6):
                if abs(x+ox) > 3.6 or abs(y+oy) > 3.6: continue
                c = cylinder("fb", f, .018, L, 4, axis='X', loc=(x+ox, y+oy, .03+R.random()*.04))
                c.rotation_euler.z = a
    render("tex_felt", 6, 6, tilt=0, mask=False)


ALL = [crayon, crayon_box, cpencil, graphite_pencil, pencil_cup, marker, lambda: brush("round"), lambda: brush("flat"),
       palette_knife, mixing_palette, water_cup, yarn_ball, clay_lump, eraser, art_tin, stump,
       yarn_strand_tile, knit_tile, clay_tile, felt_tile]
NAMES = ["crayon", "crayon_box", "cpencil", "pencil", "pencil_cup", "marker", "brush_round", "brush_flat",
         "palette_knife", "mixing_palette", "water_cup", "yarn_ball", "clay_lump", "eraser", "art_tin", "stump",
         "yarn_strand", "knit", "clay", "felt"]
for n, fn in zip(NAMES, ALL):
    if ONLY and n not in ONLY: continue
    print("== making", n); fn()
print("done")
