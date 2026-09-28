import{n as e,t}from"./jsx-runtime-DpJIb57s.js";import{a as n,h as r,l as i,m as a}from"./model-DLPi8F1i.js";import{B as o,G as s,Kn as c,Nn as l,R as u,U as d,Un as f,V as p,W as m,a as ee,c as te,dn as h,et as g,i as _,l as v,o as y,ot as b,q as x,r as S,s as C,t as w,w as ne,z as re}from"./index-BxdtFtOg.js";import{n as T}from"./render-CXj6N3yi.js";import{o as E}from"./export-Dj1UiT33.js";import{t as D}from"./html-CKdZsG3a.js";var O=E(),k=e(),A=t(),j=`'DM Sans Variable', 'DM Sans', -apple-system, 'Segoe UI', sans-serif`,M=e=>e.replace(/[^a-z0-9_-]/gi,``),N=(e,t)=>e.length>t?`${e.slice(0,t-1)}…`:e,P=320,F=200;function ie({graph:e,sheet:t,title:n,scope:r}){let i=v(e),a=re(e,t),o=d(e,!!(a.length||i.points.length||i.implicitCurves.length))?_(e.viewport,P,F):e.viewport,s=e=>te(e,o,P,F),c=[...i.curves.map(e=>({id:e.entry.id,color:e.entry.color,text:e.label,...y(e,o,P,F)})),...i.implicitCurves.map(e=>({id:e.entry.id,color:e.entry.color,text:e.label,...S(e,o,P,F)}))].filter(e=>e.path),l=s({x:0,y:0}),u=C(o.xMin,o.xMax,5),f=C(o.yMin,o.yMax,4),p=`clip-${M(r)}`,m=(e,t,n)=>Math.max(t,Math.min(n,e));return(0,A.jsxs)(`svg`,{className:`pf-figure-svg`,viewBox:`0 0 ${P} ${F}`,xmlns:`http://www.w3.org/2000/svg`,role:`img`,"aria-label":`Graph: ${n}`,children:[(0,A.jsx)(`defs`,{children:(0,A.jsx)(`clipPath`,{id:p,children:(0,A.jsx)(`rect`,{width:P,height:F})})}),(0,A.jsx)(`rect`,{width:P,height:F,fill:`#fbfcfa`}),e.showGrid&&(0,A.jsxs)(`g`,{stroke:`#e7ece4`,strokeWidth:`1`,children:[u.map(e=>(0,A.jsx)(`line`,{x1:s({x:e,y:0}).x,x2:s({x:e,y:0}).x,y1:0,y2:F},`x${e}`)),f.map(e=>(0,A.jsx)(`line`,{x1:0,x2:P,y1:s({x:0,y:e}).y,y2:s({x:0,y:e}).y},`y${e}`))]}),(0,A.jsxs)(`g`,{stroke:`#8f9f86`,strokeWidth:`1.2`,children:[l.y>=0&&l.y<=F&&(0,A.jsx)(`line`,{x1:0,x2:P,y1:l.y,y2:l.y}),l.x>=0&&l.x<=P&&(0,A.jsx)(`line`,{x1:l.x,x2:l.x,y1:0,y2:F})]}),(0,A.jsxs)(`g`,{fontFamily:j,fontSize:`9`,fill:`#607255`,stroke:`#fbfcfa`,strokeWidth:`3`,paintOrder:`stroke`,children:[u.filter(e=>e!==0).map(e=>(0,A.jsx)(`text`,{x:m(s({x:e,y:0}).x,12,306),y:m(l.y+12,12,196),textAnchor:`middle`,children:I(e)},e)),f.filter(e=>e!==0).map(e=>(0,A.jsx)(`text`,{x:m(l.x-4,22,314),y:m(s({x:0,y:e}).y-3,10,192),textAnchor:`end`,children:I(e)},e))]}),(0,A.jsxs)(`g`,{clipPath:`url(#${p})`,children:[a.map(({plot:e,points:t})=>(0,A.jsxs)(`g`,{children:[e.connect&&(0,A.jsx)(`path`,{d:ee(t,o,P,F,e.closed),stroke:e.color,strokeWidth:1.8,fill:`none`,strokeLinejoin:`round`}),t.map((t,n)=>t&&(0,A.jsx)(`circle`,{cx:s(t).x,cy:s(t).y,r:3.2,fill:e.color,stroke:`#fff`,strokeWidth:1},n))]},e.id)),i.points.map(e=>(0,A.jsx)(`circle`,{cx:s(e).x,cy:s(e).y,r:3.6,fill:e.entry.color,stroke:`#fff`,strokeWidth:1},e.entry.id)),c.map(e=>(0,A.jsx)(`path`,{d:e.path,stroke:e.color,strokeWidth:1.8,fill:`none`,strokeLinejoin:`round`},e.id)),e.showLabels&&c.map(e=>e.label&&e.text&&(0,A.jsx)(`text`,{x:s(e.label).x+5,y:s(e.label).y-5,fontFamily:`'Cambria Math', Georgia, serif`,fontSize:`10`,fill:e.color,stroke:`#fbfcfa`,strokeWidth:`3`,paintOrder:`stroke`,children:N(e.text,22)},`${e.id}-label`))]})]})}var I=e=>Math.abs(e)>=1e5||Math.abs(e)<.001?e.toExponential(1):String(Number(e.toPrecision(4)));function ae({sheet:e,title:t,maxRows:n=7,maxCols:r=5}){let i=o(e),a=Object.entries(e.cells).filter(([,e])=>e.input.trim()).map(([e])=>x(e)).filter(e=>!!e),c=a.length?Math.min(...a.map(e=>e.row)):0,l=a.length?Math.min(...a.map(e=>e.col)):0,u=Array.from({length:Math.min(n,e.rows-c)},(e,t)=>c+t),d=Array.from({length:Math.min(r,e.columns-l)},(e,t)=>l+t);return(0,A.jsxs)(`table`,{className:`pf-sheet`,"aria-label":`Spreadsheet: ${t}`,children:[(0,A.jsx)(`thead`,{children:(0,A.jsxs)(`tr`,{children:[(0,A.jsx)(`th`,{}),d.map(e=>(0,A.jsx)(`th`,{scope:`col`,children:s(e)},e))]})}),(0,A.jsx)(`tbody`,{children:u.map(t=>(0,A.jsxs)(`tr`,{children:[(0,A.jsx)(`th`,{scope:`row`,children:t+1}),d.map(n=>{let r=m({row:t,col:n}),a=e.cells[r],o=i[r],s=p(o,a?.format),c=typeof o?.value==`number`;return(0,A.jsx)(`td`,{style:{fontWeight:a?.format?.bold?650:void 0,textAlign:a?.format?.align??(c?`right`:`left`),background:a?.format?.fill&&a.format.fill!==`none`?a.format.fill:void 0},children:N(s,14)},n)})]},t))})]})}function L({canvas:e,pageId:t,scope:n}){let r=e.pages.find(e=>e.id===t)??e.pages[0];if(!r)return(0,A.jsx)(G,{text:`No canvases yet`});let i=e.page.infinite&&r.elements.length?(()=>{let e=u(r.elements.map(e=>ne(e,r)));return{x:e.x-40,y:e.y-40,width:e.width+80,height:e.height+80}})():{x:0,y:0,width:e.page.width,height:e.page.height};return(0,A.jsx)(T,{page:r,size:e.page,scope:`pf-${M(n)}`,className:`pf-figure-svg`,bounds:i})}function R({document:e}){let t=e.blocks.filter(e=>e.type===`image`||e.type===`divider`||l(e).trim()).slice(0,8);return t.length?(0,A.jsx)(`div`,{className:`pf-doc`,"aria-hidden":`true`,style:{fontFamily:e.style.fontFamily},dangerouslySetInnerHTML:{__html:D(t)}}):(0,A.jsx)(G,{text:`An empty page`})}function z({collection:e}){let t=e.items.map(h).filter(Boolean).slice(0,6);if(t.length)return(0,A.jsx)(`div`,{className:`pf-covers count-${Math.min(t.length,6)}`,"aria-hidden":`true`,children:t.map((e,t)=>(0,A.jsx)(`img`,{src:e,alt:``,loading:`lazy`},t))});let n=e.rootIds.map(t=>e.collections.find(e=>e.id===t)).filter(e=>!!e).flatMap(t=>t.childIds.length?t.childIds.map(t=>e.collections.find(e=>e.id===t)).filter(e=>!!e):[t]);return(0,A.jsx)(`div`,{className:`pf-tiles`,"aria-hidden":`true`,children:n.slice(0,6).map(e=>(0,A.jsxs)(`span`,{style:{borderColor:e.accent},children:[(0,A.jsx)(`span`,{className:`pf-tile-emoji`,children:e.emoji||`📁`}),(0,A.jsx)(`span`,{className:`pf-tile-name`,children:N(e.name,18)})]},e.id))})}function B({model:e,title:t}){let n=e.features.filter(e=>!e.suppressed);return(0,A.jsxs)(`div`,{className:`pf-art`,children:[(0,A.jsxs)(`svg`,{viewBox:`0 0 160 140`,role:`img`,"aria-label":`3D model: ${t}`,children:[(0,A.jsx)(`path`,{d:`M80 8L140 40V100L80 132L20 100V40Z`,fill:e.color||`#d9e3d2`,stroke:`#3f5a4b`,strokeWidth:`2.5`,strokeLinejoin:`round`}),(0,A.jsx)(`path`,{d:`M80 8V72M20 40L80 72L140 40`,fill:`none`,stroke:`#3f5a4b`,strokeWidth:`2.5`,strokeLinejoin:`round`,opacity:`0.55`})]}),(0,A.jsxs)(`ul`,{className:`pf-chips`,children:[n.slice(0,5).map(e=>(0,A.jsx)(`li`,{children:N(e.name,20)},e.id)),n.length>5&&(0,A.jsxs)(`li`,{children:[`+`,n.length-5]}),!n.length&&(0,A.jsx)(`li`,{children:`No features yet`})]})]})}function V({plate:e,title:t}){let r=i(e.printer),o=n(e)?.objects??[],s=[];for(let e=50;e<Math.max(r.x,r.y);e+=50)s.push(e);return(0,A.jsxs)(`svg`,{className:`pf-figure-svg`,viewBox:`0 0 ${r.x} ${r.y}`,role:`img`,"aria-label":`Build plate: ${t}, ${o.length} ${o.length===1?`object`:`objects`}`,xmlns:`http://www.w3.org/2000/svg`,children:[(0,A.jsx)(`rect`,{width:r.x,height:r.y,fill:`#1f2a26`}),(0,A.jsxs)(`g`,{stroke:`#2f3d37`,strokeWidth:`1`,children:[s.filter(e=>e<r.x).map(e=>(0,A.jsx)(`line`,{x1:e,x2:e,y1:0,y2:r.y},`x${e}`)),s.filter(e=>e<r.y).map(e=>(0,A.jsx)(`line`,{x1:0,x2:r.x,y1:e,y2:e},`y${e}`))]}),o.map(e=>{let t=a(e);return(0,A.jsx)(`rect`,{x:r.x/2+e.x-t.width/2,y:r.y/2-e.y-t.depth/2,width:Math.max(1,t.width),height:Math.max(1,t.depth),rx:2,fill:e.color||`#7db27f`,stroke:`#e8f0e6`,strokeWidth:`1.5`,opacity:`0.92`},e.id)})]})}function H({painting:e}){return(0,A.jsxs)(`div`,{className:`pf-painting`,"aria-hidden":`true`,children:[e.image?(0,A.jsx)(`img`,{src:e.image.src,alt:``}):(0,A.jsx)(`span`,{className:`pf-empty`,children:`No picture yet`}),(0,A.jsx)(`span`,{className:`pf-swatches`,children:e.stack.map(e=>(0,A.jsx)(`span`,{style:{background:e.color},title:e.name},e.id))})]})}function U({code:e,entry:t}){let n=e.files.map(e=>e.path).sort(),r=t||e.entry;return n.length?(0,A.jsxs)(`pre`,{className:`pf-code`,"aria-hidden":`true`,children:[n.slice(0,8).map(e=>(0,A.jsxs)(`span`,{className:e===r?`is-entry`:``,children:[e===r?`★ `:`  `,N(e,32),`
`]},e)),n.length>8?`  … ${n.length-8} more`:``]}):(0,A.jsx)(G,{text:`No files yet`})}function W({title:e,scope:t}){let n=`globe-${M(t)}`;return(0,A.jsxs)(`svg`,{className:`pf-figure-svg`,viewBox:`0 0 320 200`,role:`img`,"aria-label":`Interactive scene: ${e}`,xmlns:`http://www.w3.org/2000/svg`,children:[(0,A.jsx)(`defs`,{children:(0,A.jsxs)(`radialGradient`,{id:n,cx:`38%`,cy:`35%`,r:`70%`,children:[(0,A.jsx)(`stop`,{offset:`0`,stopColor:`#4c8ac4`}),(0,A.jsx)(`stop`,{offset:`0.55`,stopColor:`#1f4d7a`}),(0,A.jsx)(`stop`,{offset:`1`,stopColor:`#0a1a2b`})]})}),(0,A.jsx)(`rect`,{width:`320`,height:`200`,fill:`#080f15`}),(0,A.jsx)(`circle`,{cx:`160`,cy:`100`,r:`72`,fill:`url(#${n})`}),(0,A.jsx)(`path`,{d:`M160 28A72 72 0 0 1 160 172A40 72 0 0 0 160 28Z`,fill:`#03080e`,opacity:`0.55`}),(0,A.jsx)(`path`,{d:`M118 70c12-8 26-6 34 4s22 6 30-2 18-2 24 8-6 20-18 22-22-4-32-2-24 10-32 2-16-24-6-32z`,fill:`#5a9a5a`,opacity:`0.8`})]})}function G({text:e}){return(0,A.jsx)(`div`,{className:`pf-empty`,"aria-hidden":`true`,children:e})}var K=[`painter`,`canvas`,`graph`,`sheet`,`document`,`collection`,`modeler`,`slicer`,`code`];function q(e,t,n=e.id){let r=t?.title??e.title;if(t)switch(t.type){case`canvas-show`:return e.canvas?(0,A.jsx)(L,{canvas:e.canvas,pageId:t.source.startPage,scope:n}):(0,A.jsx)(G,{text:`No canvases yet`});case`document-read`:return e.document?(0,A.jsx)(R,{document:e.document}):(0,A.jsx)(G,{text:`An empty page`});case`collection-browse`:return e.collection?(0,A.jsx)(z,{collection:e.collection}):(0,A.jsx)(G,{text:`No collections yet`});case`modeler-view`:return e.modeler?(0,A.jsx)(B,{model:e.modeler,title:r}):(0,A.jsx)(G,{text:`No model yet`});case`slicer-view`:return e.slicer?(0,A.jsx)(V,{plate:e.slicer,title:r}):(0,A.jsx)(G,{text:`An empty plate`});case`painter-view`:return e.painter?(0,A.jsx)(H,{painting:e.painter}):(0,A.jsx)(G,{text:`No painting yet`});case`code-run`:return e.code?(0,A.jsx)(U,{code:e.code,entry:t.source.entry}):(0,A.jsx)(G,{text:`No files yet`});case`interactive-scene`:return(0,A.jsx)(W,{title:r,scope:n})}if(e.projectType===`code`){let t=e.outputs.find(e=>e.type===`interactive-scene`);return t?(0,A.jsx)(W,{title:t.title,scope:n}):(0,A.jsx)(U,{code:e.code??{version:1,files:[],entry:``}})}switch(K.find(t=>e.tools.includes(t))){case`painter`:return e.painter?(0,A.jsx)(H,{painting:e.painter}):(0,A.jsx)(G,{text:`No painting yet`});case`canvas`:return e.canvas?(0,A.jsx)(L,{canvas:e.canvas,scope:n}):(0,A.jsx)(G,{text:`No canvases yet`});case`graph`:return e.graph?(0,A.jsx)(ie,{graph:e.graph,sheet:e.sheet,title:r,scope:n}):(0,A.jsx)(G,{text:`An empty graph`});case`sheet`:return e.sheet?(0,A.jsx)(ae,{sheet:e.sheet,title:r}):(0,A.jsx)(G,{text:`An empty spreadsheet`});case`document`:return e.document?(0,A.jsx)(R,{document:e.document}):(0,A.jsx)(G,{text:`An empty page`});case`collection`:return e.collection?(0,A.jsx)(z,{collection:e.collection}):(0,A.jsx)(G,{text:`No collections yet`});case`modeler`:return e.modeler?(0,A.jsx)(B,{model:e.modeler,title:r}):(0,A.jsx)(G,{text:`No model yet`});case`slicer`:return e.slicer?(0,A.jsx)(V,{plate:e.slicer,title:r}):(0,A.jsx)(G,{text:`An empty plate`});case`code`:return e.code?(0,A.jsx)(U,{code:e.code}):(0,A.jsx)(G,{text:`No files yet`});default:return(0,A.jsx)(G,{text:e.title})}}function J(e,t){let i=(e,t,n=`${t}s`)=>`${e.toLocaleString(`en-US`)} ${e===1?t:n}`;switch(t?{"canvas-show":`canvas`,"document-read":`document`,"collection-browse":`collection`,"modeler-view":`modeler`,"slicer-view":`slicer`,"painter-view":`painter`,"code-run":`code`,"interactive-scene":`scene`}[t.type]:e.projectType===`code`?e.outputs.some(e=>e.type===`interactive-scene`)?`scene`:`code`:K.find(t=>e.tools.includes(t))){case`graph`:{let t=e.graph?.entries??[],n=t.filter(e=>e.kind!==`parameter`&&e.kind!==`note`).length,r=t.filter(e=>e.kind===`parameter`&&e.mode===`slider`).length;return[i(n,`curve`),r?i(r,`slider`):``].filter(Boolean).join(` · `)}case`sheet`:{let t=e.sheet;return`${i(t?Object.values(t.cells).filter(e=>e.input.trim()).length:0,`filled cell`)}${t?` · ${t.rows} × ${t.columns}`:``}`}case`canvas`:{let t=e.canvas;return t?`${i(t.pages.length,`canvas`,`canvases`)} · ${c[t.mode]}`:`Visual canvas`}case`document`:return e.document?i(f(e.document).words,`word`):`Document`;case`collection`:{let t=e.collection;return t?`${i(t.items.length,`item`)} · ${i(t.collections.length,`collection`)}`:`Collection`}case`modeler`:{let t=e.modeler;return t?`${i(t.features.filter(e=>!e.suppressed).length,`feature`)} · ${t.material}`:`3D model`}case`slicer`:{let t=e.slicer;if(!t)return`Print plate`;let a=n(t)?.objects.length??0;return t.sliced?`${r(t.sliced.seconds)} · ${t.sliced.grams} g · ${i(a,`object`)}`:`${i(a,`object`)} · not sliced`}case`painter`:{let t=e.painter;return t?`${i(t.stack.length,`filament`)} · ${i(t.maxLayers,`layer`)} · ${t.width} mm wide`:`Filament painting`}case`code`:return e.code?i(e.code.files.length,`file`):`Bundled source`;case`scene`:return`Interactive scene`;default:return``}}var oe=(0,k.memo)(function({project:e,output:t,scope:n}){return(0,A.jsx)(`div`,{className:`pf-figure`,children:q(e,t,n??e.id)})}),Y=`
.pf-page {
  --pf-ink: #233c32;
  --pf-muted: #61705c;
  --pf-border: #e4e9e2;
  --pf-surface: #fff;
  --pf-soft: #f3f6f0;
  --pf-accent: #285f4b;
  --pf-figure-height: var(--portfolio-figure-height, 200px);
  color: var(--pf-ink);
  background: #fafbf9;
  font-family: 'DM Sans Variable', 'DM Sans', -apple-system, 'Segoe UI', sans-serif;
  font-size: 15px;
  line-height: 1.6;
  margin: 0;
  padding: 0 clamp(20px, 5vw, 72px) 60px;
}
.pf-page *, .pf-page *::before, .pf-page *::after { box-sizing: border-box; }
.pf-page a { color: var(--pf-accent); }
.pf-page h1, .pf-page h2, .pf-page h3 {
  font-family: 'Manrope Variable', 'Manrope', 'DM Sans Variable', 'Segoe UI', sans-serif;
  margin: 0;
  line-height: 1.2;
}
.pf-hero {
  max-width: 820px;
  margin: 0 auto;
  padding: clamp(40px, 7vw, 88px) 0 40px;
}
.pf-eyebrow {
  display: block;
  font-size: 11px;
  letter-spacing: 2px;
  font-weight: 650;
  color: var(--pf-accent);
  margin-bottom: 16px;
}
.pf-hero h1 {
  font-size: clamp(34px, 5.5vw, 58px);
  letter-spacing: -1.5px;
  font-weight: 750;
}
.pf-tagline {
  font-size: clamp(17px, 2vw, 21px);
  color: var(--pf-muted);
  margin: 14px 0 0;
  max-width: 640px;
}
.pf-author {
  margin: 22px 0 0;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 10px;
}
.pf-author::before {
  content: '';
  width: 26px;
  height: 2px;
  background: var(--pf-accent);
}
.pf-intro { max-width: 640px; margin-top: 26px; }
.pf-intro p { margin: 0 0 1em; color: #3f5148; }
.pf-links { display: flex; flex-wrap: wrap; gap: 10px; margin: 24px 0 0; padding: 0; list-style: none; }
.pf-links a {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  border: 1px solid var(--pf-border);
  border-radius: 999px;
  padding: 7px 14px;
  font-size: 13px;
  font-weight: 600;
  text-decoration: none;
  background: var(--pf-surface);
}
.pf-links a:hover { border-color: var(--pf-accent); }
.pf-toc {
  max-width: 820px;
  margin: 0 auto 8px;
  display: flex;
  flex-wrap: wrap;
  gap: 6px 22px;
  padding: 18px 0;
  border-top: 1px solid var(--pf-border);
  border-bottom: 1px solid var(--pf-border);
  font-size: 13px;
}
.pf-toc a { text-decoration: none; font-weight: 600; color: var(--pf-muted); }
.pf-toc a:hover { color: var(--pf-accent); }
.pf-section { max-width: 1120px; margin: 0 auto; padding: 44px 0 8px; }
.pf-section-head { max-width: 820px; margin: 0 auto 26px; }
.pf-section h2 {
  font-size: clamp(22px, 2.6vw, 30px);
  letter-spacing: -0.6px;
  font-weight: 700;
}
.pf-section-head p { color: var(--pf-muted); margin: 10px 0 0; max-width: 640px; }
.pf-grid { display: grid; gap: 24px; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); }
.pf-grid.rows { grid-template-columns: 1fr; max-width: 820px; margin: 0 auto; }
.pf-entry {
  border: 1px solid var(--pf-border);
  border-radius: 12px;
  background: var(--pf-surface);
  overflow: hidden;
  display: flex;
  flex-direction: column;
  min-width: 0;
}
.pf-grid.cards .pf-entry.wide { grid-column: span 2; }
@media (max-width: 720px) { .pf-grid.cards .pf-entry.wide { grid-column: span 1; } }
.pf-grid.rows .pf-entry { flex-direction: row; align-items: stretch; }
.pf-grid.rows .pf-entry .pf-figure { width: 40%; flex: none; height: auto; min-height: 180px; border-bottom: 0; border-right: 1px solid var(--pf-border); }
@media (max-width: 720px) {
  .pf-grid.rows .pf-entry { flex-direction: column; }
  .pf-grid.rows .pf-entry .pf-figure { width: 100%; border-right: 0; border-bottom: 1px solid var(--pf-border); }
}
.pf-figure {
  height: var(--pf-figure-height, var(--portfolio-figure-height, 200px));
  background: var(--pf-soft);
  border-bottom: 1px solid var(--pf-border);
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  position: relative;
}
.pf-figure > * { max-width: 100%; max-height: 100%; }
.pf-figure:has(.pf-sheet), .pf-figure:has(.pf-doc) { justify-content: flex-start; align-items: flex-start; }
.pf-figure svg { width: 100%; height: 100%; display: block; }
.pf-figure .pf-figure-svg { background: #fbfcfa; }
.pf-entry-body { padding: 18px 20px 20px; display: flex; flex-direction: column; gap: 6px; flex: 1; }
.pf-entry h2, .pf-entry h3 { font-size: 18px; font-weight: 700; letter-spacing: -0.3px; }
.pf-entry h2 a, .pf-entry h3 a { color: inherit; text-decoration: none; }
.pf-entry h2 a:hover, .pf-entry h3 a:hover { color: var(--pf-accent); }
.pf-role { font-size: 12px; letter-spacing: 1px; text-transform: uppercase; font-weight: 650; color: var(--pf-accent); margin: 0; }
.pf-caption { margin: 4px 0 0; color: #3f5148; font-size: 14px; }
.pf-entry-meta {
  margin-top: auto;
  padding-top: 14px;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px 14px;
  font-size: 12px;
  color: var(--pf-muted);
}
.pf-entry-meta .pf-tools { display: inline-flex; flex-wrap: wrap; gap: 6px; }
.pf-entry-meta .pf-tools span {
  border: 1px solid var(--pf-border);
  border-radius: 4px;
  padding: 2px 7px;
  font-weight: 650;
  color: var(--pf-accent);
  background: #f2f6ee;
  font-size: 11px;
}
.pf-entry-meta a { font-weight: 600; text-decoration: none; margin-left: auto; }
.pf-entry-meta a:hover { text-decoration: underline; }
.pf-footer {
  max-width: 820px;
  margin: 60px auto 0;
  padding-top: 20px;
  border-top: 1px solid var(--pf-border);
  font-size: 12px;
  color: var(--pf-muted);
  display: flex;
  justify-content: space-between;
  gap: 12px;
  flex-wrap: wrap;
}
.pf-empty-page { max-width: 820px; margin: 40px auto; color: var(--pf-muted); }
/* Figures */
.pf-figure .pf-sheet {
  border-collapse: collapse;
  font-size: 11px;
  background: #fff;
  margin: 10px;
  box-shadow: 0 1px 4px rgba(0,0,0,0.08);
}
.pf-sheet th, .pf-sheet td { border: 1px solid #e3e8df; padding: 4px 8px; max-width: 110px; overflow: hidden; white-space: nowrap; text-overflow: ellipsis; }
.pf-sheet th { background: #f1f4ee; color: #61705c; font-weight: 600; text-align: center; }
.pf-figure .pf-doc {
  width: min(86%, 420px);
  margin: 14px 7%;
  background: #fff;
  padding: 22px 26px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.08);
  font-size: 9px;
  line-height: 1.5;
  color: #1f2a24;
  overflow: hidden;
  max-height: 100%;
}
.pf-doc h1 { font-size: 18px; margin: 0 0 6px; font-weight: 700; }
.pf-doc h2 { font-size: 13px; margin: 8px 0 4px; }
.pf-doc h3, .pf-doc h4 { font-size: 11px; margin: 6px 0 3px; }
.pf-doc p, .pf-doc li { margin: 0 0 4px; }
.pf-doc ul, .pf-doc ol { padding-left: 14px; margin: 0; }
.pf-doc blockquote { margin: 4px 0; padding-left: 8px; border-left: 2px solid #cbd5cf; color: #4a5a52; }
.pf-doc pre { background: #f3f5f2; padding: 6px; border-radius: 4px; white-space: pre-wrap; }
.pf-doc figure { margin: 4px 0; } .pf-doc img { max-width: 100%; }
.pf-doc hr { border: 0; border-top: 1px solid #cbd5cf; }
.pf-covers { display: grid; gap: 6px; padding: 12px; width: 100%; height: 100%; grid-template-columns: repeat(3, 1fr); }
.pf-covers.count-1 { grid-template-columns: 1fr; } .pf-covers.count-2 { grid-template-columns: 1fr 1fr; }
.pf-covers.count-4 { grid-template-columns: 1fr 1fr; }
.pf-covers img { width: 100%; height: 100%; object-fit: cover; border-radius: 6px; min-height: 0; }
.pf-tiles { display: flex; flex-wrap: wrap; gap: 8px; padding: 16px; justify-content: center; }
.pf-tiles > span { display: flex; flex-direction: column; align-items: center; gap: 4px; width: 92px; padding: 10px 6px; border: 2px solid; border-radius: 8px; background: #fff; font-size: 11px; text-align: center; }
.pf-tile-emoji { font-size: 22px; }
.pf-art { display: flex; flex-direction: column; align-items: center; gap: 8px; padding: 12px; width: 100%; height: 100%; }
.pf-art svg { height: 60%; width: auto; }
.pf-chips { list-style: none; margin: 0; padding: 0; display: flex; flex-wrap: wrap; justify-content: center; gap: 5px; font-size: 11px; }
.pf-chips li { border: 1px solid #d3e0cb; border-radius: 4px; padding: 2px 7px; background: #fff; color: #3f5a4b; }
.pf-painting { position: relative; width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; background: #f3f6f0; }
.pf-painting img { max-width: 100%; max-height: 100%; object-fit: contain; }
.pf-swatches { position: absolute; left: 10px; bottom: 10px; display: flex; gap: 4px; }
.pf-swatches span { width: 16px; height: 16px; border-radius: 4px; border: 1px solid rgba(255,255,255,0.8); box-shadow: 0 1px 3px rgba(0,0,0,0.3); }
.pf-code { margin: 0; padding: 16px 20px; font-family: 'DM Mono', Menlo, Consolas, monospace; font-size: 12px; line-height: 1.7; color: #d7e3d9; background: #1d2a25; width: 100%; height: 100%; overflow: hidden; }
.pf-code .is-entry { color: #ffd77a; }
.pf-empty { color: var(--pf-muted); font-size: 13px; padding: 16px; }
@media print {
  .pf-page { padding: 0; background: #fff; }
  .pf-entry { break-inside: avoid; }
  .pf-links a { border-color: #999; }
}
`,X={eyebrow:`PORTFOLIO`,footerLine:`Assembled in Junga Workspace`},se=(e,t)=>{let{project:n,output:r}=e;return n?t===`app`?r?`#/project/${n.id}/output/${r.id}`:`#/project/${n.id}`:n.referenceUrl:``};function Z({portfolio:e,library:t,links:n,copy:r=X,date:i=new Date,body:a=`div`}){let o=b(e,t),s=g(e.intro),c=o.filter(e=>e.section.title.trim()).length>1,l=a;return(0,A.jsxs)(`div`,{className:`pf-page`,style:{"--pf-accent":e.accent},children:[(0,A.jsx)(`style`,{children:Y}),(0,A.jsxs)(`header`,{className:`pf-hero`,children:[(0,A.jsx)(`span`,{className:`pf-eyebrow`,children:r.eyebrow}),(0,A.jsx)(`h1`,{children:e.title}),e.tagline&&(0,A.jsx)(`p`,{className:`pf-tagline`,children:e.tagline}),e.author&&(0,A.jsx)(`p`,{className:`pf-author`,children:e.author}),s.length>0&&(0,A.jsx)(`div`,{className:`pf-intro`,children:s.map((e,t)=>(0,A.jsx)(`p`,{children:e},t))}),e.links.some(e=>e.url)&&(0,A.jsx)(`ul`,{className:`pf-links`,children:e.links.filter(e=>e.url).map((e,t)=>(0,A.jsx)(`li`,{children:(0,A.jsx)(`a`,{href:e.url,target:`_blank`,rel:`noopener noreferrer`,children:e.label.trim()||ce(e.url)})},t))})]}),c&&(0,A.jsx)(`nav`,{className:`pf-toc`,"aria-label":`Portfolio sections`,children:o.filter(e=>e.section.title.trim()).map(({section:e})=>(0,A.jsx)(`a`,{href:`#pf-section-${e.id}`,children:e.title},e.id))}),(0,A.jsxs)(l,{className:`pf-body`,children:[o.length===0&&(0,A.jsx)(`p`,{className:`pf-empty-page`,children:`Nothing to show yet. Add projects to this portfolio to present them here.`}),o.map(({section:t,entries:r})=>{let i=!!t.title.trim(),a=i?`h3`:`h2`;return(0,A.jsxs)(`section`,{id:`pf-section-${t.id}`,className:`pf-section`,"aria-label":i?void 0:`Work`,children:[(i||t.description.trim())&&(0,A.jsxs)(`div`,{className:`pf-section-head`,children:[i&&(0,A.jsx)(`h2`,{children:t.title}),t.description.trim()&&(0,A.jsx)(`p`,{children:t.description})]}),(0,A.jsx)(`div`,{className:`pf-grid ${e.layout}`,children:r.map(e=>(0,A.jsx)(Q,{resolved:e,links:n,Heading:a},e.entry.id))})]},t.id)})]}),(0,A.jsxs)(`footer`,{className:`pf-footer`,children:[(0,A.jsx)(`span`,{children:r.footerLine}),(0,A.jsx)(`span`,{children:i.toLocaleDateString(void 0,{year:`numeric`,month:`long`,day:`numeric`})})]})]})}function Q({resolved:e,links:t,Heading:n}){let{entry:r,project:i,output:a,title:o,caption:s}=e;if(!i)return null;let c=se(e,t),l=J(i,a),u=i.projectType===`code`?(0,A.jsx)(`span`,{children:`Code project`}):i.tools.map(e=>(0,A.jsx)(`span`,{children:w[e].name},e));return(0,A.jsxs)(`article`,{className:`pf-entry ${r.size}`,children:[(0,A.jsx)(`div`,{className:`pf-figure`,children:q(i,a,`${r.id}-${i.id}`)}),(0,A.jsxs)(`div`,{className:`pf-entry-body`,children:[(0,A.jsx)(n,{children:c?(0,A.jsx)(`a`,{href:c,children:o}):o}),r.role.trim()&&(0,A.jsx)(`p`,{className:`pf-role`,children:r.role}),s&&(0,A.jsx)(`p`,{className:`pf-caption`,children:s}),(0,A.jsxs)(`div`,{className:`pf-entry-meta`,children:[(0,A.jsx)(`span`,{className:`pf-tools`,children:u}),l&&(0,A.jsx)(`span`,{children:l}),t===`app`&&c&&(0,A.jsx)(`a`,{href:c,children:a?`Open output`:`Open project`}),t===`export`&&i.referenceUrl&&(0,A.jsx)(`a`,{href:i.referenceUrl,target:`_blank`,rel:`noopener noreferrer`,children:`Reference`})]})]})]})}var ce=e=>{try{let t=new URL(e);return t.protocol===`mailto:`?t.pathname:t.hostname.replace(/^www\./,``)}catch{return e}},$=e=>e.replace(/[&<>"]/g,e=>({"&":`&amp;`,"<":`&lt;`,">":`&gt;`,'"':`&quot;`})[e]);function le(e,t,n=X,r=new Date){let i=(0,O.renderToStaticMarkup)((0,k.createElement)(Z,{portfolio:e,library:t,links:`export`,copy:n,date:r,body:`main`}));return`<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="description" content="${$(e.tagline||`${e.title} — a portfolio of selected work.`)}">
<title>${$(e.title)}${e.author?` · ${$(e.author)}`:``}</title>
<style>html, body { margin: 0; background: #fafbf9; }</style>
</head>
<body>${i}</body>
</html>
`}function ue(e,t){let n=[`# ${e.title}`,``];e.tagline&&n.push(`*${e.tagline}*`,``),e.author&&n.push(`**${e.author}**`,``);for(let t of g(e.intro))n.push(t,``);let r=e.links.filter(e=>e.url);r.length&&n.push(r.map(e=>`[${e.label.trim()||e.url}](${e.url})`).join(` · `),``);for(let{section:r,entries:i}of b(e,t)){r.title.trim()&&n.push(`## ${r.title}`,``),r.description.trim()&&n.push(r.description,``);for(let{project:e,output:t,title:r,caption:a,entry:o}of i){if(!e)continue;let i=e.projectType===`code`?`Code project`:e.tools.map(e=>w[e].name).join(`, `),s=[o.role.trim(),i,J(e,t)].filter(Boolean);n.push(`### ${r}`,``),s.length&&n.push(s.join(` · `),``),a&&n.push(a,``),e.referenceUrl&&n.push(`Reference: ${e.referenceUrl}`,``)}}return n.join(`
`).replace(/\n{3,}/g,`

`).trimEnd()+`
`}var de=(e,t)=>`${e.title.replace(/[^a-z0-9-_ ]/gi,``).trim().replace(/\s+/g,`-`).toLowerCase()||`portfolio`}.${t}`;export{Y as a,Z as i,le as n,oe as o,ue as r,J as s,de as t};