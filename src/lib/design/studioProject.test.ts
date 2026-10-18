/** Copyright Imagine Engine Studios Corp. */
import { describe, it } from 'node:test';
import { strict as assert } from 'node:assert';
import { completeStudioProject, reconcileStudioBoard } from './studioProject';
import { captureMaterials } from './studioMaterials';
import type { Board3D } from './board3D';
const points=[{x:0,y:0},{x:20,y:0},{x:20,y:20},{x:0,y:20}];
describe('complete studio documents',()=>{
 it('captures independent defaults instead of a live reference',()=>{
  const defaults={paverId:'original'};const a=captureMaterials(undefined,defaults),b=captureMaterials(undefined,defaults);a.paverId='changed';assert.equal(b.paverId,'original');assert.equal(defaults.paverId,'original');
 });
 it('round-trips per-body textures and detail without altering other pools',()=>{
  const state={scale:10,additionalPools:[{id:'a',points,materials:{finishUrl:'/original.webp'}},{id:'b',points,materials:{finishUrl:'/untouched.webp'}}],site:[]};
  const board:Board3D={origin:{x:0,y:0},fences:[],screens:[],surfaces:[{itemId:'__deck_a',kind:'deck',color:'#fff',image:'/own-deck.webp',scale:2,regions:[]}],waters:[{itemId:'a',kind:'pool',label:'Pool',pts:points.map(p=>({x:p.x/10,z:p.y/10})),depth:7,finish:'/changed.webp',coping:'/own-coping.webp',waterline:'/own-waterline.webp',copingWidth:1}]};
  const next=reconcileStudioBoard(state,board);assert.equal(next.additionalPools[0].materials.finishUrl,'/changed.webp');assert.equal(next.additionalPools[0].materials.paverUrl,'/own-deck.webp');assert.equal(next.additionalPools[0].details3D.depth,7);assert.equal(next.additionalPools[1].materials.finishUrl,'/untouched.webp');assert.equal(state.additionalPools[0].materials.finishUrl,'/original.webp');
  const restored=JSON.parse(JSON.stringify(completeStudioProject(next,{camera:'saved'},board)));assert.equal(restored.additionalPools[0].materials.waterlineUrl,'/own-waterline.webp');assert.equal(restored.scene3D.camera,'saved');
 });
 it('preserves empty designs and intentional empty attached decks',()=>{
  const doc=completeStudioProject({points:[],additionalPools:[],additionalDeckPoints:{a:[]},site:[]},null,null);assert.deepEqual(doc.points,[]);assert.deepEqual(doc.additionalDeckPoints.a,[]);
 });
});
