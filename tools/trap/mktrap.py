#!/usr/bin/env python3
# jserr-r30f: build an instrumented three r164.1 for the gauntlet's GTRAP debug mode (never deployed).
# Usage: curl -sS -o /tmp/three.module.js https://cdn.jsdelivr.net/npm/three@0.164.1/build/three.module.js
#        python3 tools/trap/mktrap.py /tmp/three.module.js /tmp/three.trap.js
#        GTRAP=/tmp/three.trap.js node tools/gauntlet.js ...   -> docs/shots/gauntlet/<ver>/trap.jsonl
# Every upload of a BufferAttribute whose array is null (createBuffer, or a version bump of a buffer already on the GPU) records the drawn object,
# the attribute key, where the array was nulled (ns), where its geometry was disposed (ds) and where needsUpdate was set on the freed array (vs).
import sys
s = open(sys.argv[1], encoding='utf8').read()
rec = ("try { const o = globalThis.__curObj, g = o && o.geometry; let k = '?'; if ( g ) { for ( const n in g.attributes ) if ( g.attributes[ n ] === attribute ) k = n; if ( g.index === attribute ) k = 'index'; } "
       "( globalThis.__NA = globalThis.__NA || [] ).push( { path: '%s', k, name: o && o.name, type: o && o.type, inst: !! ( o && o.isInstancedMesh ), ud: o ? JSON.stringify( Object.keys( o.userData || {} ) ) : '', "
       "gud: g ? JSON.stringify( Object.keys( g.userData || {} ) ) : '', par: o && o.parent ? ( o.parent.name || o.parent.type ) + '/' + JSON.stringify( Object.keys( o.parent.userData || {} ) ) : '', "
       "cnt: attribute.count, isz: attribute.itemSize, ns: attribute.__ns, vs: attribute.__vs, ds: g && g.__ds, at: new Error( 'upload' ).stack.slice( 0, 1200 ) } ); } catch ( e ) {}")
def rep(a, b):
    global s
    assert s.count(a) == 1, a[:60]
    s = s.replace(a, b, 1)
rep("\tfunction createBuffer( attribute, bufferType ) {\n\n\t\tconst array = attribute.array;",
    "\tfunction createBuffer( attribute, bufferType ) {\n\n\t\tconst array = attribute.array;\n\t\tif ( array === null ) { " + rec % 'create' + " }")
rep("\t\t\tif ( data.size !== attribute.array.byteLength ) {",
    "\t\t\tif ( attribute.array === null ) { " + rec % 'update' + " }\n\t\t\tif ( data.size !== attribute.array.byteLength ) {")
rep("\tfunction update( object ) {\n\n\t\tconst frame = info.render.frame;\n",
    "\tfunction update( object ) {\n\n\t\tconst frame = info.render.frame;\n\t\tglobalThis.__curObj = object;\n")
s += """
Object.defineProperty(BufferAttribute.prototype,'array',{configurable:true,get(){return this.__a},set(v){if(v===null&&this.__a)this.__ns=new Error('nulled').stack.slice(0,1500);this.__a=v}});
{const D=Object.getOwnPropertyDescriptor(BufferAttribute.prototype,'needsUpdate');Object.defineProperty(BufferAttribute.prototype,'needsUpdate',{configurable:true,set(v){if(v===true&&this.__a===null)this.__vs=new Error('needsUpdate on freed').stack.slice(0,1500);D.set.call(this,v)}})}
{const d=BufferGeometry.prototype.dispose;BufferGeometry.prototype.dispose=function(){this.__ds=new Error('gdispose').stack.slice(0,1200);return d.call(this)}}
"""
open(sys.argv[2], 'w', encoding='utf8').write(s)
print('trap written', sys.argv[2])
