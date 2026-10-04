# OB: road network repair + audit (ob_roads.js) — ONE anchor: right after CITY_S is built, before CITY_G / AJ / JUNC / meshes / HUB.nodes / QV
exec(open('P.py').read())
A='const CITY_G=new Map();CITY_S.forEach('
R(A, open('ob_roads.js').read()+'\n'+A)
save()
