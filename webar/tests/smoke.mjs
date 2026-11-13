import { chromium } from 'playwright';
import { spawn } from 'node:child_process';
import { mkdir, writeFile } from 'node:fs/promises';
import assert from 'node:assert/strict';
const server = spawn(process.execPath,['server.mjs'],{stdio:'ignore',windowsHide:true});
let browser;
try {
  for (let i=0;i<50;i++) { try { if ((await fetch('http://127.0.0.1:4173')).ok) break; } catch {} await new Promise(r=>setTimeout(r,100)); }
  await mkdir('test-results',{recursive:true});
  browser = await chromium.launch({headless:true,channel:'msedge',args:['--use-fake-device-for-media-stream','--use-fake-ui-for-media-stream','--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
  const context = await browser.newContext({viewport:{width:390,height:844},deviceScaleFactor:1.5,permissions:['camera'],acceptDownloads:true});
  const page = await context.newPage();
  const errors=[];
  page.on('pageerror',e=>errors.push(String(e)));
  await page.addInitScript(() => {
    window.shared = [];
    Object.defineProperty(navigator,'canShare',{value:data=>!!data.files?.length,configurable:true});
    Object.defineProperty(navigator,'share',{value:async data=>{window.shared.push({name:data.files?.[0]?.name,size:data.files?.[0]?.size,title:data.title,url:data.url});},configurable:true});
  });
  await page.goto('http://127.0.0.1:4173');
  await page.waitForFunction(()=>!document.getElementById('capture').disabled,{},{timeout:60000});
  await page.screenshot({path:'test-results/mobile.png'});
  const frames=[];
  for(const index of [0,1,2]) {
    await page.locator(`[data-model="${index}"]`).click();
    await page.waitForFunction(()=>!document.getElementById('capture').disabled);
    assert.equal(await page.locator(`[data-model="${index}"]`).getAttribute('aria-pressed'),'true');
    frames.push(await page.locator('canvas').screenshot());
  }
  assert(!frames[0].equals(frames[1]) && !frames[1].equals(frames[2]),'Models must render distinct images');
  await page.locator('[data-model="1"]').click();
  await page.waitForFunction(()=>!document.getElementById('capture').disabled);
  await page.locator('#camera-button').click();
  await page.waitForFunction(()=>document.getElementById('stage').classList.contains('live'));
  const downloadEvent=page.waitForEvent('download');
  await page.locator('#capture').click();
  const download=await downloadEvent;
  await download.saveAs('test-results/camera-photo.jpg');
  await page.waitForFunction(()=>document.getElementById('photo-preview').complete);
  assert(await page.locator('#photo-dialog').isVisible());
  await page.locator('#share').click();
  const shared=await page.evaluate(()=>window.shared);
  assert(shared[0].size > 10000 && shared[0].name.endsWith('.jpg'));
  await page.screenshot({path:'test-results/photo-dialog.png'});
  await page.locator('#close-photo').click();
  await page.locator('#camera-button').click();
  assert.equal(await page.evaluate(()=>document.getElementById('camera').srcObject),null);
  assert(await page.evaluate(()=>document.documentElement.scrollWidth <= innerWidth));
  await page.setViewportSize({width:844,height:390});
  await page.screenshot({path:'test-results/landscape.png',fullPage:true});
  // Denied permissions must leave the model usable and explain recovery.
  await page.evaluate(()=>{navigator.mediaDevices.getUserMedia=async()=>{throw new DOMException('Denied','NotAllowedError');};});
  await page.locator('#camera-button').click();
  await page.waitForFunction(()=>document.getElementById('status').textContent.includes('Permite'));
  assert.equal(await page.locator('#capture').isDisabled(),false);
  assert.deepEqual(errors,[]);
  const report={status:'passed',checks:['three textured models render','mobile layout','fake camera stream','camera + model JPEG download','file share payload (mock)','camera stop','permission denial','landscape layout'],realMobileCameraTested:false};
  await writeFile('test-results/report.json',JSON.stringify(report,null,2));
  console.log(JSON.stringify(report,null,2));
} finally { await browser?.close(); server.kill(); }
