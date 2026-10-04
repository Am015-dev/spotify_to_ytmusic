# pSM4: city props share ONE vertex-colour material instead of a new identical MeshStandardMaterial per prop-type x tile group
# (~12k materials in the seamless Athens, ~3k per split district). Each material costs a uniforms clone in the prewarm compile
# (85 MB in the seamless build) and a material switch per draw. Same pattern the lazy-biome props already use (D.__pm).
exec(open('P.py').read())
R("mat=def.mat||new THREE.MeshStandardMaterial({vertexColors:true,roughness:.5,metalness:.08})",
  "mat=def.mat||(D.__pmC||(D.__pmC=new THREE.MeshStandardMaterial({vertexColors:true,roughness:.5,metalness:.08})))")
save()
