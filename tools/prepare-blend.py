"""Inspect the two visible source models and make a small comparison render.
The source .blend is never saved. Run with --factory-startup --disable-autoexec.
"""
import bpy, json, sys
from pathlib import Path
out = Path(sys.argv[sys.argv.index('--') + 1]).resolve()
out.mkdir(parents=True, exist_ok=True)
details = {}
for name in ['Cube', 'Sphere']:
    obj = bpy.data.objects[name]
    details[name] = {'modifiers': []}
    for m in obj.modifiers:
        if m.type == 'ARRAY': details[name]['modifiers'].append({k: getattr(m, k)[:] if k.endswith('displace') else getattr(m, k) for k in ['count', 'use_relative_offset', 'relative_offset_displace', 'use_constant_offset', 'constant_offset_displace']})
    def graph(tree, prefix=''):
        result = []
        for n in tree.nodes:
            row = {'name': prefix+n.name, 'type': n.type,
                   'inputs': [(s.name, list(s.default_value) if hasattr(s, 'default_value') and hasattr(s.default_value, '__len__') and not isinstance(s.default_value, str) else getattr(s, 'default_value', None), [(l.from_node.name, l.from_socket.name) for l in s.links]) for s in n.inputs],
                   'outputs': [(s.name, list(s.default_value) if hasattr(s, 'default_value') and hasattr(s.default_value, '__len__') and not isinstance(s.default_value, str) else getattr(s, 'default_value', None)) for s in n.outputs if hasattr(s, 'default_value')]}
            result.append(row)
            if n.type == 'GROUP': result.extend(graph(n.node_tree, prefix+n.name+'/'))
        return result
    details[name]['nodes'] = graph(obj.active_material.node_tree)
    deps = bpy.context.evaluated_depsgraph_get()
    evaluated = obj.evaluated_get(deps)
    mesh = evaluated.to_mesh()
    details[name]['evaluated'] = {'vertices': len(mesh.vertices), 'polygons': len(mesh.polygons)}
    evaluated.to_mesh_clear()
(out/'blend-details.json').write_text(json.dumps(details, ensure_ascii=False, indent=2), encoding='utf-8')
scene = bpy.context.scene
scene.render.resolution_percentage = 25
scene.cycles.samples = 32
scene.cycles.use_denoising = True
scene.render.filepath = str(out/'blender-source-preview.png')
bpy.ops.render.render(write_still=True)
print('SOURCE_RENDER_COMPLETE')
