import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import path from 'node:path';
const root=path.resolve(import.meta.dirname,'..');
const code=fs.readFileSync(root+'/mods/make-it-so/main.js','utf8');
const layout=JSON.parse(fs.readFileSync(root+'/layouts/make-it-so.json','utf8'));
const methods=new Set('size justify_center items_start cursor_pointer w_full h flex_none bg flex items_end justify_end px pb text_color text_size font_weight w h_full rounded_tl rounded_tr rounded_br rounded_bl rounded_l rounded_r rounded flex_1 size_full items_center gap pr pl pt min_w min_h truncate justify_between p opacity overflow_x_scrollbar overflow_y_scrollbar'.split(' '));
function el(kind='div'){
 const n={kind,key:undefined,motion:undefined,styles:{},nodes:[],events:{}};let proxy;
 proxy=new Proxy(n,{get(o,k){if(k in o)return o[k];if(k==='id')return v=>(o.key=v,proxy);
 if(k==='child')return v=>(o.nodes.push(v),proxy);if(k==='children')return vs=>(o.nodes.push(...vs),proxy);
 if(k==='when')return (v,f)=>v?f(proxy):proxy;if(k==='hover')return f=>(f(el()),proxy);
 if(k==='on_click')return f=>(o.events.click=f,proxy);if(k==='on_mouse_down')return (b,f)=>(o.events[b]=f,proxy);
 if(k==='loop')return (a,p)=>{assert.equal(a,'opacity');assert.equal(typeof p,'object');assert.ok(p.period>0);o.motion=p;return proxy;};
 if(methods.has(k))return (...v)=>(o.styles[k]=v,proxy);throw Error('Unknown builder '+String(k));}});return proxy;
}
let state={spaces:[],agents:[],machines:[],part:'top'},calls=[],timers=[];
const ctx=vm.createContext({Date,Math,String,View:class{},div:()=>el(),svg:()=>el('svg'),h_flex:()=>el('row'),v_flex:()=>el('column'),
 spaces:()=>state.spaces,agents:()=>state.agents,machines:()=>state.machines,props:()=>({part:state.part,overlay:'overlay-1'}),window:()=>({platform:state.platform??'macos',buttons:state.buttons??false,maximized:false}),
 run:(...x)=>calls.push(['run',...x]),setAgentOrder:x=>calls.push(['order',x]),openOverlay:x=>calls.push(['open',x]),closeOverlay:x=>calls.push(['close',x])});
vm.runInContext(code.replace(/^import .*;\n/gm,'').replace('export default class MakeItSo','globalThis.MakeItSo = class MakeItSo'),ctx);
function render(part){state.part=part;timers=[];const v=new ctx.MakeItSo();v.init({part},{timer:{every:(ms,f)=>timers.push([ms,f])}});return v.render();}
function find(n,id){if(n?.key===id)return n;for(const c of n?.nodes??[]){const f=find(c,id);if(f)return f;}return null;}
function text(n){return typeof n==='string'?n:(n?.nodes??[]).map(text).join(' ');}
function click(n,id){const target=find(n,id);assert.ok(target,id);assert.ok(target.events.click,id+' clickable');target.events.click();}
function last(){return JSON.parse(JSON.stringify(calls.at(-1)));}
let passed=0;function test(name,f){f();passed++;console.log('PASS '+name);}
test('layout: native active tab, 4 mod regions, bundled ANSI palette',()=>{assert.equal(layout.children[1].children[1].children[1].content.tab,'active');assert.equal(layout.children[0].content.mod,'make-it-so');for(let i=0;i<16;i++)assert.match(layout.colors['ansi'+i],/^#[0-9a-f]{6}$/);});
test('no network, files, shell, or executable imports',()=>{assert.ok(!/\b(fetch|exec|home|readFile|writeFile|spawn|setInterval|setTimeout)\s*\(/.test(code));assert.deepEqual([...code.matchAll(/from "([^"]+)"/g)].map(m=>m[1]),['gpui-kit','gpui-base','herdr']);});
test('empty state: all five parts render',()=>{for(const p of ['top','side','tabs','bottom','machines'])assert.ok(render(p));});
state={...state,machines:[{name:null,layout:'ready'},{name:'remote',layout:'ready'},{name:'offline',layout:'unavailable'}],spaces:[{id:'s1',name:'Bridge',index:1,active:true,tabs:[{id:'t1',index:1,name:'Build',active:true,status:'working'},{id:'t2',index:2,name:'Review',status:'blocked'},{id:'t3',index:3,name:'Hidden',settled:true}]},{id:'s2',name:'Sensors',index:2,status:'blocked',tabs:[]}],agents:[{address:'t1',status:'working',focused:true,program:{name:'Codex'},tab_name:'Build',space_name:'Bridge',pane:'p1'},{address:'remote/t2',status:'blocked',program:{name:'Claude'},tab_name:'Review',space_name:'Sensors',pane:'p2'},{address:'t3',status:'done',tab_name:'QA',space_name:'Bridge'}]};
test('space switch and crew focus use real ids',()=>{const n=render('side');click(n,'space-s2');assert.deepEqual(last(),['run','space.select',{id:'s2'}]);click(n,'agent-remote/t2');assert.deepEqual(last(),['run','agent.focus',{terminal:'remote/t2'}]);assert.ok(find(n,'space-s2').motion);});
test('sidebar scrolls, no truncation of large crews',()=>{state.agents.push(...Array.from({length:40},(_,i)=>({address:'extra'+i,status:'idle'})));const n=render('side');assert.ok('overflow_y_scrollbar' in n.styles);assert.ok(find(n,'agent-extra39'));state.agents.splice(3);});
test('tabs: select, hidden settled tabs, blocked animation, new menu',()=>{const n=render('tabs');assert.equal(find(n,'tab-t3'),null);assert.ok(find(n,'tab-t2').motion);click(n,'tab-t2');assert.deepEqual(last(),['run','tab.select',{id:'t2'}]);click(n,'tab-new');assert.equal(last()[1].mod,'new-menu');});
test('machine picker: closes before creating, offline disabled',()=>{const n=render('machines');assert.equal(find(n,'new-space-offline').events.click,undefined);click(n,'new-space-remote');assert.deepEqual(last(),['run','space.new',{machine:'remote'}]);assert.deepEqual(JSON.parse(JSON.stringify(calls.at(-2))),['close','overlay-1']);});
test('new space: remote selector points to independent mod',()=>{click(render('side'),'space-new');assert.equal(last()[1].mod,'make-it-so');});
test('counts, settings, palette, and context menu',()=>{const n=render('bottom');assert.match(text(n),/01 WORKING.*01 NEED YOU.*01 DONE/);click(n,'settings');assert.deepEqual(last(),['run','app.settings']);click(n,'palette');assert.deepEqual(last(),['run','app.palette']);let stopped=false;find(render('side'),'space-s1').events.right({}, {stop_propagation:()=>stopped=true});assert.ok(stopped);assert.equal(last()[1].props.tab,'space');});
test('timers only in top/bottom; clock callback updates safely',()=>{render('side');assert.equal(timers.length,0);render('bottom');assert.equal(timers.length,1);let notified=false;timers[0][1]({notify:()=>notified=true});assert.ok(notified);});
test('local unavailable is not presented as ready',()=>{state.machines=[{name:null,layout:'unavailable'}];click(render('side'),'space-new');assert.equal(last()[0],'open');assert.equal(find(render('machines'),'new-space-local').events.click,undefined);});
test('window controls on Windows/Linux stop dragging and call commands',()=>{state.buttons=true;state.platform='windows';const n=render('top');for(const action of ['minimize','maximize','close']){click(n,'window-'+action);assert.deepEqual(last(),['run','window.'+action]);let stopped=false;find(n,'window-'+action).events.left({}, {stop_propagation:()=>stopped=true});assert.ok(stopped);}state.buttons=false;});
test('local-only ready creates locally without a popup',()=>{state.machines=[{name:null,layout:'ready'}];click(render('side'),'space-new');assert.deepEqual(last(),['run','space.new',{}]);});
test('remote-only list keeps missing local disabled',()=>{state.machines=[{name:'remote',layout:'ready'}];const n=render('machines');assert.equal(find(n,'new-space-local').events.click,undefined);click(n,'new-space-remote');assert.deepEqual(last(),['run','space.new',{machine:'remote'}]);});
test('refit font and license are bundled',()=>{assert.equal(layout.ui_font,'Antonio');assert.ok(fs.statSync(root+'/mods/make-it-so/fonts/Antonio.ttf').size>10000);assert.match(fs.readFileSync(root+'/mods/make-it-so/fonts/OFL.txt','utf8'),/SIL OPEN FONT LICENSE/);});
test('sidebar uses measured counts and distinguishes ready hosts',()=>{state.machines=[{name:null,layout:'ready'},{name:'offline',layout:'unavailable'}];state.agents=[];const n=render('side');assert.match(text(n),/NO AGENTS ATTACHED/);assert.match(text(n),/READY HOSTS 01/);assert.match(text(n),/ATTACHED AGENTS 00/);});
test('geometry: compact sidebar and preserved native terminal',()=>{assert.equal(layout.children[1].children[0].size.px,188);assert.equal(layout.children[1].children[1].children[1].content.tab,'active');assert.ok(code.includes('const SIDE = 188'));});
test('no fictional telemetry or stardate function',()=>{assert.ok(!code.includes('function stardate'));assert.ok(!code.includes('Math.random'));assert.match(text(render('tabs')),/TERMINAL MATRIX/);});
test('macOS traffic lights use the elbow position and native buttons',()=>{assert.deepEqual(layout.traffic_lights,[22,24]);const before={platform:state.platform,buttons:state.buttons};try{state.platform='macos';state.buttons=false;assert.equal(find(render('top'),'window-close'),null);}finally{Object.assign(state,before);}});
test('Make it so name and UI asset paths stay consistent',()=>{assert.match(text(render('top')),/Make it so/);assert.equal(layout.preview,'mods/make-it-so/preview.svg');assert.match(fs.readFileSync(root+'/'+layout.preview,'utf8'),/>Make it so</);assert.ok(fs.existsSync(root+'/mods/make-it-so/mod.json'));});
console.log(`${passed} checks passed. Mock tests do NOT validate Herdr GPUI runtime or visual layout.`);
