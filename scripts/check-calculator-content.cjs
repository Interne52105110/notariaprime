// Check the actual prerendered HTML: an answer hidden behind a JS click must fail.
require('../tests/register.cjs');
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const { toolHelp } = require('../src/content/tool-help.ts');
const { toolResources } = require('../src/content/tool-resources.ts');
const { guides } = require('../src/content/guides.ts');
const root = path.join(__dirname, '../.next/server/app');
const escape = s => s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#x27;');
const sitemapSource = fs.readFileSync(path.join(__dirname,'../src/app/sitemap.ts'),'utf8').split('const CALCULATEURS = [')[1].split('];')[0];
const routes = [...sitemapSource.matchAll(/"([a-z-]+)"/g)].map(m=>'/'+m[1]).sort();
assert.deepEqual(Object.keys(toolHelp).sort(), routes);
const directory = fs.readFileSync(path.join(root,'features.html'),'utf8');
let answers = 0;
for (const route of routes) {
  const html = fs.readFileSync(path.join(root, route.slice(1)+'.html'),'utf8');
  const help = toolHelp[route];
  assert.equal((html.match(/<h1(?:\s|>)/g)||[]).length,1, route+' H1');
  assert.equal((html.match(/<main(?:\s|>)/g)||[]).length,1, route+' main landmark');
  assert.ok(directory.includes('href="'+route+'"'),route+' missing from directory');
  const faq = html.match(/<section id="outil-faq"[^]*?<\/section>/)?.[0];
  assert.ok(faq,route+' FAQ missing from initial HTML');
  for (const [question, answer] of help.faq) {
    assert.ok(faq.includes(escape(question)),route+' missing question: '+question);
    assert.ok(faq.includes(escape(answer)),route+' missing answer: '+question);
    answers++;
  }
  assert.equal((faq.match(/<details(?:\s|>)/g)||[]).length,help.faq.length);
  for (const [slug] of toolResources[route].guides) assert.ok(guides.some(g=>g.slug===slug),route+' broken guide '+slug);
  for (const [related] of help.related) assert.ok(routes.includes(related),route+' broken related tool '+related);
  for (const anchor of ['outil-methode','outil-exemples','outil-faq','outil-sources','outil-calculateur']) assert.equal((html.match(new RegExp('id="'+anchor+'"','g'))||[]).length,1,route+' duplicate/missing anchor '+anchor);
}
console.log(`${routes.length} calculator pages: initial HTML, ${answers} FAQ answers, headings, anchors and internal links checked.`);
