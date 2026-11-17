"""Bake the source backdrop/light bounce to scene-linear HDR reflections."""
import bpy, sys, math
from pathlib import Path
out=Path(sys.argv[sys.argv.index('--')+1]).resolve()
scene=bpy.context.scene
for obj in scene.objects:
    if obj.type=='MESH' and obj.name!='BG': obj.hide_render=True
camera=bpy.data.objects.new('Web reflection probe',bpy.data.cameras.new('Web reflection probe'))
scene.collection.objects.link(camera)
camera.location=bpy.data.objects['Focus Depth of Field'].location
camera.rotation_euler=(math.pi/2,0,0)
camera.data.type='PANO';camera.data.panorama_type='EQUIRECTANGULAR'
scene.camera=camera
scene.render.resolution_x=1024;scene.render.resolution_y=512;scene.render.resolution_percentage=100
scene.cycles.samples=32;scene.cycles.use_denoising=True
scene.render.image_settings.file_format='HDR';scene.render.image_settings.color_mode='RGB'
scene.render.filepath=str(out/'environment.hdr')
bpy.ops.render.render(write_still=True)
print('SOURCE_ENVIRONMENT_COMPLETE')
