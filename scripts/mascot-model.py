"""Builds the mascot as rigid parts and exports public/assets/mascot.glb.

Run: /Applications/Blender.app/Contents/MacOS/Blender --background --python scripts/mascot-model.py

All measurements are pixels of the turnaround sheet: x/y from the front view
(robot centered on x=300, ground at y=985), d is depth with the front positive.
"""
import math
import os
import subprocess

import bmesh
import bpy
from mathutils import Matrix, Vector

S = 0.01
CX, GY = 300, 985
ARC = 10
OUT = os.path.normpath(os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'public', 'assets', 'mascot.glb'))

PIVOTS = {}
WIDEN = 1

COLORS = {
    'green': '#B7F8A2',
    'joint': '#B46258',
    'screen': '#FA7A2C',
    'glint': '#FCC46E',
    'black': '#000000',
}


def linear(hex_color):
    def channel(v):
        v /= 255
        return v / 12.92 if v <= 0.04045 else ((v + 0.055) / 1.055) ** 2.4
    h = hex_color.lstrip('#')
    return tuple(channel(int(h[i:i + 2], 16)) for i in (0, 2, 4)) + (1,)


def reset():
    bpy.ops.wm.read_factory_settings(use_empty=True)
    for name, hex_color in COLORS.items():
        mat = bpy.data.materials.new(name)
        mat.diffuse_color = linear(hex_color)
        bsdf = mat.node_tree.nodes.get('Principled BSDF')
        bsdf.inputs['Base Color'].default_value = linear(hex_color)
        bsdf.inputs['Roughness'].default_value = 1


def world(x, y, d=0):
    return Vector(((x - CX) * WIDEN * S, -d * S, (GY - y) * S))


def link(obj, parent):
    bpy.context.scene.collection.objects.link(obj)
    if parent:
        obj.parent = parent
        obj.matrix_parent_inverse = Matrix.Translation(-PIVOTS[parent.name])
    return obj


def empty(name, x, y, d=0, parent=None):
    obj = bpy.data.objects.new(name, None)
    PIVOTS[name] = world(x, y, d)
    obj.location = PIVOTS[name]
    return link(obj, parent)


def finish(obj, mat):
    for poly in obj.data.polygons:
        poly.use_smooth = True
    obj.data.materials.append(bpy.data.materials[mat])
    obj.data.set_sharp_from_angle(angle=math.radians(50))
    normals = obj.modifiers.new('normals', 'WEIGHTED_NORMAL')
    normals.weight = 100
    normals.keep_sharp = True
    return obj


def quarter(n):
    """n + 1 points of a unit corner from (1, 0) to (0, 1). Its curvature eases in and out,
    so the toon terminator does not kink where a rounding meets a flat face."""
    fine = 32 * n
    pts, x, y = [(0.0, 0.0)], 0.0, 0.0
    for i in range(fine):
        u = (i + 0.5) / fine
        t = math.radians(90) * (3 * u * u - 2 * u * u * u)
        x += math.sin(t)
        y += math.cos(t)
        if (i + 1) % 32 == 0:
            pts.append((x, y))
    return [(1 - px / y, py / y) for px, py in pts]


def rbox(name, box, big, small, axis, mat, parent, mirror=False):
    """Rounded box: a rounded-rect profile extruded along `axis`.

    `big` is the profile corner radius, or one per corner:
      axis 'X' (side profile): (top front, top back, bottom back, bottom front)
      axis 'Y' (front profile): (top left, top right, bottom right, bottom left)
    `small` fillets the two rims, or one per end, 0 for a flat end:
      'X': (left, right)   'Y': (front, back)   'Z': (top, bottom)
    """
    x0, x1, y0, y1, d0, d1 = box
    if not isinstance(big, tuple):
        big = (big,) * 4
    if not isinstance(small, tuple):
        small = (small, small)
    if axis == 'X':
        corners = [big[1], big[0], big[3], big[2]]
        plus, minus = small[1], small[0]
    elif axis == 'Y':
        corners = [big[1], big[0], big[3], big[2]]
        plus, minus = small[1], small[0]
    else:
        corners = list(big)
        plus, minus = small
    if mirror:
        x0, x1 = 2 * CX - x1, 2 * CX - x0
        if axis == 'X':
            plus, minus = minus, plus
        if axis == 'Y':
            corners = [corners[1], corners[0], corners[3], corners[2]]
    x0, x1 = CX + (x0 - CX) * WIDEN, CX + (x1 - CX) * WIDEN
    half = {'X': (x1 - x0) / 2, 'Y': (d1 - d0) / 2, 'Z': (y1 - y0) / 2}
    a, b = {'X': ('Y', 'Z'), 'Y': ('X', 'Z'), 'Z': ('X', 'Y')}[axis]
    ha, hb, hc = half[a], half[b], half[axis]
    corners = [min(r, ha - 0.01, hb - 0.01) for r in corners]

    def arc(r):
        return max(1, min(ARC, math.ceil(r / 4)))

    def ring(inset, w):
        pts = []
        for corner, (sa, sb) in enumerate(((1, 1), (-1, 1), (-1, -1), (1, -1))):
            r = max(corners[corner] - inset, 0.05)
            turn = math.radians(90 * corner)
            for qa, qb in quarter(arc(corners[corner])):
                ca = qa * math.cos(turn) - qb * math.sin(turn)
                cb = qa * math.sin(turn) + qb * math.cos(turn)
                pts.append((sa * (ha - inset - r) + r * ca, sb * (hb - inset - r) + r * cb, w))
        return pts

    def end(fillet, sign):
        if not fillet:
            return [ring(0, sign * hc)]
        fillet = min(fillet, ha - 0.3, hb - 0.3)
        return [
            ring(fillet * (1 - qb), sign * (hc - fillet * (1 - qa)))
            for qa, qb in quarter(arc(fillet))
        ]

    rings = end(plus, 1) + list(reversed(end(minus, -1)))

    index = {'X': 0, 'Y': 1, 'Z': 2}
    bm = bmesh.new()
    verts = []
    for r in rings:
        row = []
        for u, v, w in r:
            co = [0, 0, 0]
            co[index[a]], co[index[b]], co[index[axis]] = u, v, w
            row.append(bm.verts.new(Vector(co) * S))
        verts.append(row)
    n = len(verts[0])
    for r0, r1 in zip(verts, verts[1:]):
        for i in range(n):
            bm.faces.new((r0[i], r0[(i + 1) % n], r1[(i + 1) % n], r1[i]))
    bm.faces.new(verts[0])
    bm.faces.new(verts[-1])
    bmesh.ops.recalc_face_normals(bm, faces=bm.faces)
    mesh = bpy.data.meshes.new(name)
    bm.to_mesh(mesh)
    bm.free()

    obj = bpy.data.objects.new(name, mesh)
    obj.location = Vector(((x0 + x1) / 2 - CX, -(d0 + d1) / 2, GY - (y0 + y1) / 2)) * S
    return finish(link(obj, parent), mat)


def egg(name, x, y, d, radii, mat, parent):
    """Ellipsoid around (x, y, d) with radii (side, front, back, up, down)."""
    side, front, back, up, down = radii
    bm = bmesh.new()
    bmesh.ops.create_uvsphere(bm, u_segments=40, v_segments=20, radius=1)
    for v in bm.verts:
        v.co.x *= side * S
        v.co.y *= (front if v.co.y < 0 else back) * S
        v.co.z *= (up if v.co.z > 0 else down) * S
    mesh = bpy.data.meshes.new(name)
    bm.to_mesh(mesh)
    bm.free()
    obj = bpy.data.objects.new(name, mesh)
    obj.location = world(x, y, d)
    return finish(link(obj, parent), mat)


def taper(obj, d0, d1, factor, y):
    """Shrinks the cross-section around height y, from full size at depth d0 to `factor` at d1."""
    for v in obj.data.vertices:
        d = -(v.co.y + obj.location.y) / S
        k = 1 - (1 - factor) * min(max((d0 - d) / (d0 - d1), 0), 1)
        height = (GY - y) * S - obj.location.z
        v.co.x *= k
        v.co.z = height + (v.co.z - height) * k


def squash_depth(obj, factor):
    for v in obj.data.vertices:
        v.co.y *= factor


def cutter(x0, x1, d0, d1, y0, y1):
    bm = bmesh.new()
    bmesh.ops.create_cube(bm, size=1)
    mesh = bpy.data.meshes.new('cutter')
    bm.to_mesh(mesh)
    bm.free()
    obj = bpy.data.objects.new('cutter', mesh)
    x0, x1 = CX + (x0 - CX) * WIDEN, CX + (x1 - CX) * WIDEN
    obj.scale = Vector((x1 - x0, d1 - d0, y1 - y0)) * S
    obj.location = Vector(((x0 + x1) / 2 - CX, -(d0 + d1) / 2, GY - (y0 + y1) / 2)) * S
    bpy.context.scene.collection.objects.link(obj)
    return obj


def carve(obj, tool):
    obj.modifiers.clear()
    mod = obj.modifiers.new('cut', 'BOOLEAN')
    mod.operation = 'DIFFERENCE'
    mod.solver = 'EXACT'
    mod.object = tool
    bpy.context.view_layer.update()
    mesh = bpy.data.meshes.new_from_object(obj.evaluated_get(bpy.context.evaluated_depsgraph_get()))
    mat = obj.data.materials[0].name
    obj.modifiers.clear()
    obj.data = mesh
    obj.data.materials.clear()
    finish(obj, mat)


def segmented(name, make, regions, parents, mirror):
    """Splits a limb into an upper and a lower part along a stepped seam.
    `regions` is [(x0, x1, d0, d1, seam_y), ...], rectangles in the top view
    that together cover the limb."""
    for part, parent in zip(('upper', 'lower'), parents):
        obj = make(f'{name}_{part}', parent)
        for x0, x1, d0, d1, seam in regions:
            if mirror:
                x0, x1 = 2 * CX - x1, 2 * CX - x0
            box = (x0 - 0.5, x1 + 0.5, d0 - 0.5, d1 + 0.5)
            tool = cutter(*box, seam, 2000) if part == 'upper' else cutter(*box, -1000, seam)
            carve(obj, tool)
            bpy.data.objects.remove(tool)


def build():
    root = empty('mascot', CX, GY)
    pelvis = empty('pelvis', 300, 665, parent=root)
    torso = empty('torso', 300, 610, parent=pelvis)
    head = empty('head', 300, 300, parent=torso)

    back = rbox('head_back', (103, 497, 8, 290, -207, 31), 46, (0, 60), 'Y', 'green', head)
    knob = rbox('head_knob', (118, 482, 55, 240, -255, -202), 30, (0, 26), 'Y', 'green', head)
    for obj in (back, knob):
        taper(obj, 31, -255, 0.82, 235)
    front = rbox('head_front', (103, 497, 8, 290, 31, 113), 46, 0, 'Y', 'green', head)
    frame = rbox('head_frame', (103, 497, 8, 290, 113, 133), 46, (18, 0), 'Y', 'green', head)
    lining = rbox('head_lining', (130.5, 469.5, 29.5, 265.5, 80, 133.4), 41.5, 0, 'Y', 'green', head)
    cuts = (
        (front, rbox('pocket', (130, 470, 29, 266, 60, 190), 42, 0, 'Y', 'black', None)),
        (frame, rbox('pocket', (130, 470, 29, 266, 60, 190), 42, 0, 'Y', 'black', None)),
        (lining, rbox('pocket', (135, 465, 34, 261, 113, 190), 40, 0, 'Y', 'black', None)),
    )
    for obj, tool in cuts:
        carve(obj, tool)
        bpy.data.objects.remove(tool)
    screen = rbox('head_screen', (150, 450, 48, 253, 57.6, 171.6), 36, (91, 0), 'Y', 'screen', head)
    squash_depth(screen, 0.13)
    glint = rbox('head_screen__glint', (180, 199, 74, 116, 110, 124), 9.5, 6, 'Y', 'glint', head)
    glint.rotation_euler.y = math.radians(-8)
    for side in (False, True):
        for i, y in enumerate((53, 68, 83)):
            inset = 46 - math.sqrt(46 ** 2 - max(54 - y, 0) ** 2)
            box = (101.5 + inset, 107 + inset, y - 0.4, y + 0.4, 50, 73)
            rbox(f'head_vent_{"L" if side else "R"}{i}', box, 0.9, 1, 'X', 'black', head, side)

    # The head sits forward of the neck.
    for obj in head.children:
        obj.location.y -= 32 * S
    rbox('neck', (273, 327, 284, 324, -32, 22), 26, 3, 'Z', 'joint', torso)
    global WIDEN
    WIDEN = 1.2
    rbox('yoke', (220, 380, 312, 362, -70, 54), (24, 24, 5, 5), 24, 'X', 'green', torso)
    rbox('chest', (216, 384, 345, 465, -90, 85), (46, 46, 22, 22), 8, 'X', 'green', torso)
    rbox('belly', (220, 380, 425, 607, -80, 78), 40, 40, 'Y', 'green', torso)
    rbox('waist', (280, 320, 600, 630, -28, 28), 19.9, 3, 'Z', 'joint', pelvis)

    rbox('pelvis_block', (272, 328, 608, 705, -38, 38), 14, 12, 'Y', 'green', pelvis)

    for mirror in (False, True):
        s = 'L' if mirror else 'R'
        flip = (lambda x: 2 * CX - x) if mirror else (lambda x: x)

        rbox(f'shoulder_pad_{s}', (200, 246, 342, 469, -95, 97), (50, 50, 26, 26), (0, 12), 'X', 'green', torso, mirror)
        # Only the pad facing the viewer outlines its end. On the far one that line would
        # double the edge against the arm behind it.
        cap = f'shoulder_cap_{s}' if s == 'L' else f'shoulder_pad_{s}__cap'
        rbox(cap, (196, 200, 342, 469, -95, 97), (50, 50, 26, 26), (3.5, 0), 'X', 'green', torso, mirror)
        rbox(f'shoulder_joint_{s}', (176, 200, 366, 414, -43, 5), 23.9, 3, 'X', 'joint', torso, mirror)

        arm = empty(f'arm_{s}', flip(160), 390, -19, torso)
        forearm = empty(f'forearm_{s}', flip(158), 538, -19, arm)
        hand = empty(f'hand_{s}', flip(155), 681, -19, forearm)
        segmented(
            f'arm_{s}',
            lambda n, p: rbox(n, (126, 190, 355, 680, -53, 15), (33.9, 33.9, 14, 14), 30, 'X', 'green', p, mirror),
            [(-999, 999, -999, -35, 528), (170, 999, -35, 999, 528), (-999, 170, -35, 999, 548)] if mirror
            else [(-999, 999, -999, -35, 528), (-999, 148, -35, 999, 528), (148, 999, -35, 999, 548)],
            (arm, forearm),
            mirror,
        )
        rbox(f'elbow_{s}', (135, 181, 510, 566, -40, 2), 28, 3, 'Y', 'joint', arm, mirror)
        rbox(f'palm_{s}', (140, 178, 678, 727, -48, 6), 12, 12, 'X', 'green', hand, mirror)
        def digit(name, knuckle, fan, segments):
            """Chain of capsules from `knuckle` (x, y, d): `fan` splays it front or back, each
            segment is (length, width, depth, curl towards the body)."""
            x, y, d = knuckle
            joint = hand
            for part, (length, width, depth, curl) in zip('ab', segments):
                joint = empty(name if part == 'a' else f'{name}_tip', flip(x), y, d, joint)
                c, f = math.radians(curl), math.radians(fan)
                step = (math.sin(c), math.cos(c) * math.cos(f), math.cos(c) * math.sin(f))
                cx, cy, cd = (o + v * length / 2 for o, v in zip((x, y, d), step))
                box = (cx - width / 2, cx + width / 2, cy - length / 2, cy + length / 2, cd - depth / 2, cd + depth / 2)
                seg = rbox(f'{name}{part}', box, min(width, depth) / 2 - 0.5, min(width, depth) / 2 - 1, 'Z', 'green', joint, mirror)
                seg.rotation_mode = 'YXZ'
                seg.rotation_euler = (-f, c if mirror else -c, 0)
                x, y, d = (o + v * (length - 7) for o, v in zip((x, y, d), step))

        for i in range(3):
            digit(f'finger_{s}{i}', (151, 716, -39 + i * 18), 0, ((30, 23, 18, 35), (24, 21, 17, 105)))
        digit(f'thumb_{s}', (162, 690, 10), 14, ((27, 24, 21, 10), (22, 22, 19, 45)))

        rbox(f'hip_joint_{s}', (252, 274, 650, 690, -20, 20), 19.9, 3, 'X', 'joint', pelvis, mirror)
        leg = empty(f'leg_{s}', flip(233), 670, 0, pelvis)
        shin = empty(f'shin_{s}', flip(233), 812, 0, leg)
        foot = empty(f'foot_{s}', flip(233), 950, -10, shin)
        segmented(
            f'leg_{s}',
            lambda n, p: rbox(n, (198, 260, 645, 940, -42, 40), (26, 26, 10, 10), 30, 'X', 'green', p, mirror),
            [(-999, 999, 32, 999, 800), (-999, 999, -999, 32, 825)],
            (leg, shin),
            mirror,
        )
        rbox(f'ankle_{s}', (207, 259, 940, 973, -45, -6), 10, 8, 'X', 'joint', foot, mirror)
        shoe = egg(f'foot_{s}', flip(233), 962, 20, (48, 70, 28, 40, 20), 'green', foot)
        sole = cutter(-999, 999, -999, 999, 975, 2000)
        carve(shoe, sole)
        bpy.data.objects.remove(sole)
        # A thin plate inside the shoe whose rim shows as the toe cap line.
        line = egg(f'toe_line_{s}', flip(233), 962, 20, (48.7, 70.7, 28.7, 40.7, 20), 'black', foot)
        for box in ((-999, 48), (49.5, 999)):
            tool = cutter(-999, 999, *box, -999, 2000)
            carve(line, tool)
            bpy.data.objects.remove(tool)
        for x0, y0 in ((flip(233), 942), (-999, 957)):
            tool = cutter(x0, 999, -999, 999, y0, 2000)
            carve(line, tool)
            bpy.data.objects.remove(tool)
        foot.rotation_euler.z = math.radians(16 if mirror else 10)


reset()
build()
bpy.ops.export_scene.gltf(
    filepath=OUT,
    export_format='GLB',
    export_apply=True,
    export_yup=True,
    export_animations=False,
    export_extras=False,
)
subprocess.run(['npx', '--yes', '@gltf-transform/cli', 'meshopt', OUT, OUT], check=True)
