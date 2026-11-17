"""Export original geometry and camera; never overwrite the source .blend.
Usage: blender --factory-startup --disable-autoexec -b SOURCE --python THIS -- DEST
"""
import bpy, json, sys, math
from pathlib import Path
from mathutils import Vector
out = Path(sys.argv[sys.argv.index('--') + 1]).resolve()
out.mkdir(parents=True, exist_ok=True)
scene = bpy.context.scene
plate = bpy.data.objects['Cube']
ball = bpy.data.objects['Sphere']
cam = scene.camera
array = next(m for m in plate.modifiers if m.type == 'ARRAY')
count = array.count
array.show_viewport = array.show_render = False
bpy.context.view_layer.update()
deps = bpy.context.evaluated_depsgraph_get()
ev = plate.evaluated_get(deps)
mesh = ev.to_mesh()
lo = [min(v.co[k] for v in mesh.vertices) for k in range(3)]
hi = [max(v.co[k] for v in mesh.vertices) for k in range(3)]
ev.to_mesh_clear()
def y_up(v): return [v[0], v[2], -v[1]]
normal = plate.rotation_euler.to_matrix() @ Vector((0,1,0))
direction = cam.rotation_euler.to_matrix() @ Vector((0,0,-1))
focus = cam.data.dof.focus_object.matrix_world.translation
meta = {
  'source': '261101.blend', 'frame': scene.frame_current,
  'referenceAspect': scene.render.resolution_x / scene.render.resolution_y,
  'plate': {'name': plate.name, 'count': count, 'dimensions': [(hi[k]-lo[k])*plate.scale[k] for k in range(3)],
            'spacing': (hi[1]-lo[1])*plate.scale.y*array.relative_offset_displace.y,
            'position': y_up(plate.location), 'normal': y_up(normal)},
  'sphere': {'name': ball.name, 'radius': ball.dimensions.x/2, 'position': y_up(ball.location)},
  'camera': {'name': cam.name, 'position': y_up(cam.location), 'direction': y_up(direction),
             'focus': y_up(focus), 'fstop': cam.data.dof.aperture_fstop},
  'lights': [],
  'materialNotes': {'plate': 'Original nested procedural plastic: transmission 1, roughness 0.1, IOR 1.5; procedural scratches are baked to tangent normals.',
                    'sphere': 'Cycles Translucent/Transparent/Glass/Glossy mix requires a WebGL physical-material approximation.'}
}
for obj in scene.objects:
    if obj.type == 'LIGHT' and not obj.hide_render:
        meta['lights'].append({'name':obj.name,'type':obj.data.type,'position':y_up(obj.location),'color':list(obj.data.color),'energy':obj.data.energy})

# Bake the source procedural microstructure to an interoperable tangent normal map.
# Use a copy of the mesh/material so the scene and source data remain untouched.
copy = plate.copy(); copy.data = plate.data.copy(); copy.name = 'BakePlate'
scene.collection.objects.link(copy)
copy.hide_render = False
for mod in list(copy.modifiers): copy.modifiers.remove(mod)
copy.data.materials.clear()
mat = plate.active_material.copy(); copy.data.materials.append(mat)
bpy.ops.object.select_all(action='DESELECT'); copy.select_set(True); bpy.context.view_layer.objects.active=copy
if not copy.data.uv_layers:
    bpy.ops.object.mode_set(mode='EDIT'); bpy.ops.mesh.select_all(action='SELECT')
    bpy.ops.uv.smart_project(island_margin=.02); bpy.ops.object.mode_set(mode='OBJECT')
image = bpy.data.images.new('Source plate micro-normal', width=1024, height=1024, alpha=False)
image.colorspace_settings.name = 'Non-Color'
target = mat.node_tree.nodes.new('ShaderNodeTexImage'); target.image = image
mat.node_tree.nodes.active = target
scene.render.engine='CYCLES'; scene.cycles.samples=16
scene.render.bake.use_selected_to_active=False
try:
    bpy.ops.object.bake(type='NORMAL', normal_space='TANGENT', margin=12)
    image.filepath_raw=str(out/'plate-normal.png'); image.file_format='PNG'; image.save()
    # Keep the UVs used by the bake on the exported plate.
    plate.data=copy.data.copy(); plate.data.materials.clear(); plate.data.materials.append(bpy.data.materials['Procedural Translucent Plastic.001'])
    meta['normalMap']='plate-normal.png'
except Exception as error:
    meta['normalMap']=None; meta['bakeError']=str(error)
bpy.data.objects.remove(copy, do_unlink=True)

# glTF cannot express arbitrary Cycles shader mixes. Export original geometry,
# normals, UVs, transforms and camera; physical materials are reconstructed on web.
bpy.ops.object.select_all(action='DESELECT')
for obj in [plate, ball, cam]: obj.select_set(True)
bpy.context.view_layer.objects.active=plate
bpy.ops.export_scene.gltf(filepath=str(out/'261101.glb'), export_format='GLB', use_selection=True,
                          export_cameras=True, export_lights=False, export_materials='NONE',
                          export_apply=True, export_animations=False, export_yup=True)
(out/'source.json').write_text(json.dumps(meta, ensure_ascii=False, indent=2), encoding='utf-8')
print('WEB_EXPORT_COMPLETE:', out/'261101.glb')
