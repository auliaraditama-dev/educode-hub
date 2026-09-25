import assert from "node:assert/strict";
import vm from "node:vm";
const base = process.env.TEST_BASE_URL || "http://localhost:3001";
for (const path of ["/", "/jobsheet/database-mvc", "/offline", "/offline.html"]) {
  const response = await fetch(base + path);
  assert.equal(response.status,200,path);
  const html=await response.text();
  const script=html.match(/<script[^>]*id="educode-theme"[^>]*>([\s\S]*?)<\/script>/)?.[1] || (path==="/offline.html" ? html.match(/<script>([\s\S]*?)<\/script>/)?.[1] : null);
  assert.ok(script,`blocking theme script: ${path}`);
  assert.ok(html.indexOf(script) < html.indexOf("<body"),`theme before body: ${path}`);
  const dataset={},style={};
  vm.runInNewContext(script,{document:{documentElement:{dataset,style},querySelectorAll:()=>[]},window:{matchMedia:()=>({matches:false})},localStorage:{getItem:key=>key==="educode:theme"?"dark":null,setItem:()=>{}}});
  assert.equal(dataset.theme,"dark"); assert.equal(style.backgroundColor,"#141923");
}
for (const [from,to] of [["/fillcode","/latihan"],["/latihan-variasi","/latihan?tab=variasi"]]) {
  const response=await fetch(base+from,{redirect:"manual"});
  assert.equal(response.status,308);
  assert.equal(response.headers.get("location"),to);
}
const flight=await fetch(base+"/simulasi?_rsc=check",{headers:{RSC:"1"}});
assert.match(flight.headers.get("content-type")||"",/text\/x-component/);
console.log("PASS: production theme script executes before body on 4 routes, legacy redirects, and RSC response type.");
