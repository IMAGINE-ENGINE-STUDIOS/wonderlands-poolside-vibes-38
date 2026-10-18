/** Copyright Imagine Engine Studios Corp. */
import { describe, it } from 'node:test';
import { strict as assert } from 'node:assert';
import { computeNetAreas, netRegions } from './boardNetArea';
const rect = (x: number, y: number, w: number, h: number) => [{x,y},{x:x+w,y},{x:x+w,y:y+h},{x,y:y+h}];
describe('additive surface ownership', () => {
 it('new decking fills only unpaved area and never covers a pool or coping', () => {
  const items = [{id:'pool',kind:'pool',pts:rect(4,4,2,2)}, {id:'coping',kind:'coping',pts:rect(3,3,4,4)}, {id:'existing',kind:'deck',pts:rect(0,0,10,10)}, {id:'new',kind:'deck',pts:rect(0,0,20,10)}];
  const areas=computeNetAreas(items); assert.equal(areas.get('existing'),84); assert.equal(areas.get('new'),100);
  assert.equal(netRegions(items,items[3])[0][0].some(p=>p.x===10),true);
 });
 it('new turf excludes water, coping, every deck and earlier turf', () => {
  const items=[{id:'pool',kind:'pool',pts:rect(2,2,2,2)},{id:'coping',kind:'coping',pts:rect(1,1,4,4)},{id:'deck',kind:'deck',pts:rect(0,0,10,10)},{id:'old',kind:'turf',pts:rect(10,0,5,10)},{id:'new',kind:'turf',pts:rect(0,0,20,10)}];
  const a=computeNetAreas(items); assert.equal(a.get('old'),50);assert.equal(a.get('new'),50);
 });
 it('a fully covered surface has zero regions and zero billable area',()=>{
  const items=[{id:'old',kind:'deck',pts:rect(0,0,20,20)},{id:'new',kind:'deck',pts:rect(5,5,2,2)}];
  assert.deepEqual(netRegions(items,items[1]),[]); assert.equal(computeNetAreas(items).get('new'),0);
 });
});
