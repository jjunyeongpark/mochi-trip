import test from 'node:test';
import assert from 'node:assert/strict';
import {removeNeutralBackdrop} from '../lib/mascot-matte.ts';

test('removes neutral backdrop while preserving the actual cream and suitcase colors',()=>{
 const width=100,height=100,pixels=new Uint8ClampedArray(width*height*4).fill(255);
 const paint=(x:number,y:number,rgb:number[])=>pixels.set([...rgb,255],(y*width+x)*4);
 paint(20,20,[237,237,237]);paint(50,45,[240,235,229]);
 for(let y=65;y<80;y++)for(let x=25;x<35;x++)paint(x,y,[86,83,63]);
 for(let y=16;y<23;y++)for(let x=20;x<27;x++)paint(x,y,[225,220,205]);
 removeNeutralBackdrop(pixels,width,height);
 assert.equal(pixels[(20*width+20)*4+3],0);
 assert.equal(pixels[(19*width+23)*4+3],0);
 assert.deepEqual([...pixels.slice((45*width+50)*4,(45*width+50)*4+4)],[240,235,229,255]);
 assert.deepEqual([...pixels.slice((70*width+30)*4,(70*width+30)*4+4)],[86,83,63,255]);
});

test('protects bright highlights inside the body and clears the outside margins',()=>{
 const width=100,height=100,pixels=new Uint8ClampedArray(width*height*4).fill(245);
 removeNeutralBackdrop(pixels,width,height);
 assert.equal(pixels[(53*width+50)*4+3],255);
 assert.equal(pixels[3],0);
});
