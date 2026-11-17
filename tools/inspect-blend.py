"""Read the source scene without saving or running embedded Python."""
import bpy, json, sys
from pathlib import Path

out = Path(sys.argv[sys.argv.index('--') + 1])
def value(v):
    if isinstance(v, (str, int, float, bool)): return v
    try: return list(v)
    except TypeError: return v
def nodes(owner):
    if not owner or not owner.use_nodes: return []
    return [{"name": n.name, "type": n.type,
             "inputs": {s.name: {"value": value(s.default_value) if hasattr(s, 'default_value') else None,
                                   "links": [l.from_node.name + '.' + l.from_socket.name for l in s.links]}
                        for s in n.inputs}}
            for n in owner.node_tree.nodes]

scene = bpy.context.scene
data = {"blender": bpy.app.version_string, "frame": scene.frame_current,
        "render": {"engine": scene.render.engine, "x": scene.render.resolution_x,
                   "y": scene.render.resolution_y, "percentage": scene.render.resolution_percentage},
        "view": {"transform": scene.view_settings.view_transform, "look": scene.view_settings.look,
                 "exposure": scene.view_settings.exposure, "gamma": scene.view_settings.gamma},
        "camera": scene.camera.name if scene.camera else None,
        "world": nodes(scene.world), "objects": [],
        "materials": {m.name: nodes(m) for m in bpy.data.materials}}
for obj in scene.objects:
    entry = {"name": obj.name, "type": obj.type, "hide_render": obj.hide_render,
             "visible": obj.visible_get(), "location": list(obj.location), "rotation": list(obj.rotation_euler),
             "scale": list(obj.scale), "dimensions": list(obj.dimensions),
             "matrix": [list(r) for r in obj.matrix_world],
             "parent": obj.parent.name if obj.parent else None,
             "materials": [s.material.name if s.material else None for s in obj.material_slots],
             "modifiers": [{"name": m.name, "type": m.type,
                             "levels": getattr(m, 'levels', None), "render_levels": getattr(m, 'render_levels', None),
                             "width": getattr(m, 'width', None), "segments": getattr(m, 'segments', None),
                             "show_render": m.show_render} for m in obj.modifiers]}
    if obj.type == 'MESH': entry.update(vertices=len(obj.data.vertices), polygons=len(obj.data.polygons))
    if obj.type == 'CAMERA':
        c = obj.data
        entry['camera'] = {k: value(getattr(c, k)) for k in ['type', 'lens', 'sensor_width', 'sensor_height', 'sensor_fit', 'ortho_scale', 'shift_x', 'shift_y', 'clip_start', 'clip_end']}
        entry['camera']['dof'] = {"use": c.dof.use_dof, "focus": c.dof.focus_distance, "fstop": c.dof.aperture_fstop, "object": c.dof.focus_object.name if c.dof.focus_object else None}
    if obj.type == 'LIGHT':
        entry['light'] = {k: value(getattr(obj.data, k)) for k in ['type', 'energy', 'color', 'use_shadow']}
        entry['light']['size'] = getattr(obj.data, 'size', None)
        entry['light']['radius'] = getattr(obj.data, 'shadow_soft_size', None)
    data['objects'].append(entry)
out.write_text(json.dumps(data, ensure_ascii=False, indent=2), encoding='utf-8')
print('SCENE_INSPECTED:', len(data['objects']), 'objects;', len(data['materials']), 'materials')
