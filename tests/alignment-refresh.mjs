import assert from 'node:assert/strict';
import fs from 'node:fs';
import {launchBrowser} from './browser.mjs';
const browser=await launchBrowser();
const page=await browser.newPage();
const results=[];
for(const width of [320,390,768,1440]) {
 await page.setViewportSize({width,height:1000});
 for(const file of ['index','home-2']) {
  await page.goto(`http://127.0.0.1:4173/pages/${file}.html`);
  const result=await page.evaluate(()=>({overflow:document.documentElement.scrollWidth>innerWidth, checklist:[...document.querySelectorAll('.check-list li')].every(el=>getComputedStyle(el).fontSize==='16px'),cards:[...document.querySelectorAll('.program-card')].map(el=>Math.round(el.getBoundingClientRect().height)),tiles:[...document.querySelectorAll('.exam-strip-item')].map(el=>Math.round(el.getBoundingClientRect().height))}));
  assert.equal(result.overflow,false); assert.equal(result.checklist,true);
  if(width===1440) {assert.ok(new Set(result.cards).size<=1);assert.ok(new Set(result.tiles).size<=1);}
  if(width===1440||width===390) {
   const target=page.locator(file==='index'?'.exam-strip':'.featured-programs');
   await target.screenshot({path:`documentation/screenshots/aligned-${file}-${width}.png`});
  }
  results.push({width,file,...result});
 }
}
await browser.close();fs.writeFileSync('documentation/alignment-refresh-results.json',JSON.stringify(results,null,2));console.log('Exam strip, program cards and checklist typography passed at 320, 390, 768 and 1440px.');
