import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createServer} from 'node:http';
import vm from 'node:vm';
const clientSource=readFileSync(new URL('../client.js',import.meta.url),'utf8');
const core=clientSource.split('// COMMUNITY-CORE-BEGIN')[1]?.split('// COMMUNITY-CORE-END')[0];
assert.ok(core,'community controller must be present');
const create=vm.runInNewContext(core+'\ncreateCommunityController',{URL,Date,JSON,Error,AbortController,TextDecoder,fetch,setTimeout,clearTimeout});
const origin='https://xingchendata.com';
const stamp=Date.parse('2026-10-25T08:00:00+08:00');
const group=(id='one',state='open',expiresAt='2026-11-01T00:00:00+08:00')=>({id,name:'DPIA技术交流群',state,expiresAt,image:origin+'/community/images/'+id+'.png'});
const config=(groups=[group()],revision='1')=>({schemaVersion:1,revision,groups});
const response=data=>Response.json(data);
function clock(){let now=stamp,serial=0;const pending=new Map();return {now:()=>now,setTimeout:(fn,ms)=>{const id=++serial;pending.set(id,{fn,at:now+ms});return id;},clearTimeout:id=>pending.delete(id),async tick(ms){const end=now+ms;for(;;){const item=[...pending].filter(([,v])=>v.at<=end).sort((a,b)=>a[1].at-b[1].at)[0];if(!item)break;pending.delete(item[0]);now=item[1].at;item[1].fn();await new Promise(r=>setImmediate(r));}now=end;},pending};}
function fixture(fetcher,extra={}){const c=clock(),states=[];const ctrl=create({fetch:fetcher,onChange:s=>states.push(s),now:c.now,setTimeout:c.setTimeout,clearTimeout:c.clearTimeout,...extra});return {ctrl,c,states};}
test('DPIAP-013@1: HTTP manifest loads with no credentials or assessment context',async t=>{
 const server=createServer((req,res)=>{res.setHeader('Content-Type','application/json');res.end(JSON.stringify(config()));});
 await new Promise(r=>server.listen(0,'127.0.0.1',r));t.after(()=>new Promise(r=>server.close(r)));
 const requests=[];const f=fixture((url,options)=>{requests.push({url,options});return fetch('http://127.0.0.1:'+server.address().port,options);});t.after(()=>f.ctrl.stop());await f.ctrl.start();
 assert.equal(f.ctrl.state().status,'ready');assert.equal(f.ctrl.state().group.id,'one');assert.equal(requests.length,1);
 assert.equal(new URL(requests[0].url).pathname,'/community/dpia.json');assert.equal(requests[0].options.credentials,'omit');assert.equal(requests[0].options.cache,'no-store');assert.equal(requests[0].options.referrerPolicy,'no-referrer');assert.equal(requests[0].options.body,undefined);
});
test('DPIAP-013@1: expiry hides current QR and selects a valid alternate at the boundary',async()=>{
 let calls=0;const f=fixture(()=>{calls++;return response(config([group('expiring','open',new Date(stamp+1000).toISOString()),group('next')]));});
 await f.ctrl.start();assert.equal(f.ctrl.state().group.id,'expiring');await f.c.tick(1000);assert.equal(f.ctrl.state().group.id,'next');assert.equal(calls,2);f.ctrl.stop();
});
test('DPIAP-013@1: full and expired groups are skipped, with honest unavailable fallback',async()=>{
 let groups=[group('full','full'),group('old','open','2026-10-24T00:00:00+08:00'),group('next')];const f=fixture(()=>response(config(groups)));
 await f.ctrl.start();assert.equal(f.ctrl.state().group.id,'next');groups=groups.slice(0,2);await f.ctrl.refresh();assert.equal(f.ctrl.state().status,'unavailable');assert.equal(f.ctrl.state().group,undefined);f.ctrl.stop();
});
test('DPIAP-013@1: untrusted, malformed, oversized and redirected configuration is refused',async()=>{
 const invalid=[config([{...group(),image:'https://evil.example/qr.png'}]),config([{...group(),expiresAt:'2026-11-01'}]),config([{...group(),state:'unknown'}]),{schemaVersion:9,groups:[]},config([group('../outside')])];
 for(const data of invalid){const f=fixture(()=>response(data));await f.ctrl.start();assert.equal(f.ctrl.state().status,'error');f.ctrl.stop();}
 for(const res of [new Response('x'.repeat(65537),{headers:{'content-type':'application/json'}}),new Response('{}',{status:302}),new Response('{}',{headers:{'content-type':'text/html'}})]){const f=fixture(()=>res);await f.ctrl.start();assert.equal(f.ctrl.state().status,'error');f.ctrl.stop();}
});
test('DPIAP-013@1: network, timeout and image errors clear QR and retry obtains the actual new revision',async()=>{
 let mode='ok';const f=fixture(()=>{if(mode==='fail')throw Error('offline');if(mode==='hang')return new Promise(()=>{});return response(config([group(mode==='new'?'new':'one')],mode));});
 await f.ctrl.start();f.ctrl.imageFailed(f.ctrl.state().group.image);assert.equal(f.ctrl.state().status,'error');mode='new';await f.ctrl.refresh();assert.equal(f.ctrl.state().group.id,'new');mode='fail';await f.ctrl.refresh();assert.equal(f.ctrl.state().group,undefined);mode='hang';const waiting=f.ctrl.refresh();await f.c.tick(8000);await waiting;assert.equal(f.ctrl.state().status,'error');f.ctrl.stop();
});
test('DPIAP-013@1: late responses and responses after teardown cannot overwrite current state',async()=>{
 const waiting=[];const f=fixture(()=>new Promise(resolve=>waiting.push(resolve)));const first=f.ctrl.start();await Promise.resolve();const second=f.ctrl.refresh();await Promise.resolve();waiting[1](response(config([group('new')],'new')));await second;waiting[0](response(config([group('old')],'old')));await first;assert.equal(f.ctrl.state().group.id,'new');const last=f.ctrl.refresh();await Promise.resolve();f.ctrl.stop();const count=f.states.length;waiting[2](response(config()));await last;assert.equal(f.states.length,count);assert.equal(f.c.pending.size,0);
});
test('DPIAP-013@1: five-minute scheduler pauses while hidden, refreshes on return and stops on teardown',async()=>{
 let n=0;const f=fixture(()=>{n++;return response(config([group()],String(n)));});await f.ctrl.start();await f.c.tick(300000);assert.equal(n,2);f.ctrl.setVisible(false);await f.c.tick(900000);assert.equal(n,2);await f.ctrl.setVisible(true);assert.equal(n,3);await f.ctrl.refresh();assert.equal(n,4);f.ctrl.stop();await f.c.tick(900000);assert.equal(n,4);assert.equal(f.c.pending.size,0);
});
test('DPIAP-013@1: help opens and closes without replacing assessment UI or making business requests',async()=>{
 const hooks=[],effects=[];let cursor=0,component,props,tree;const calls=[];
 const React={Component:class{},Fragment:'fragment',createElement:(type,props,...children)=>({type,props:props||{},children:children.flat(Infinity)}),useState(initial){const i=cursor++;if(!(i in hooks))hooks[i]=initial;return [hooks[i],value=>hooks[i]=typeof value==='function'?value(hooks[i]):value];},useRef(initial){return hooks[cursor++]??={current:initial};},useEffect(fn,deps){const i=cursor++,old=hooks[i];if(!old||deps.some((x,j)=>!Object.is(x,old[j]))){hooks[i]=deps;effects.push(fn);}}};
 vm.runInNewContext(clientSource,{window:{__ModuleLoader__:{load(spec){spec.factory(()=>React).apply({connection:{rpc:{call:async(a,b,p)=>{calls.push(p);return {ok:true,value:{cases:[],testFixtures:[],errors:[]}};}}},slots:{inject:(n,fn)=>fn(),register:(options,fn)=>{if(options.name==='main'){component=fn;props=options.inject();}}},uiWorkspace:{}});}}},setTimeout,clearTimeout,setInterval,clearInterval,console});
 const nodes=(n,out=[])=>{if(n&&typeof n==='object'){out.push(n);for(const child of n.children||[])nodes(child,out);}return out;};const text=n=>typeof n==='string'?n:(n?.children||[]).map(text).join('');
 const render=async()=>{cursor=0;tree=component(props);for(const fn of effects.splice(0))fn();await new Promise(r=>setImmediate(r));cursor=0;tree=component(props);};
 await render();assert.ok(nodes(tree).some(n=>n.type?.name==='CommunityContact'));const button=nodes(tree).find(n=>n.type==='button'&&text(n)==='帮助与交流');assert.ok(button);button.props.onClick();await render();const help=nodes(tree).find(n=>n.type?.name==='CommunityHelp');assert.ok(help);help.props.onClose();await render();assert.ok(!nodes(tree).some(n=>n.type?.name==='CommunityHelp'));assert.equal(calls.length,1);assert.equal(calls[0].action,'list');assert.ok(text(tree).includes('从材料开始'));
});
