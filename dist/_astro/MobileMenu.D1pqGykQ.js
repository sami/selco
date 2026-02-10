import{j as r}from"./jsx-runtime.D_zvdyIk.js";import{r as l}from"./index.DiEladB3.js";/**
 * @license lucide-react v0.563.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const x=(...t)=>t.filter((e,a,o)=>!!e&&e.trim()!==""&&o.indexOf(e)===a).join(" ").trim();/**
 * @license lucide-react v0.563.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const p=t=>t.replace(/([a-z0-9])([A-Z])/g,"$1-$2").toLowerCase();/**
 * @license lucide-react v0.563.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const b=t=>t.replace(/^([A-Z])|[\s-_]+(\w)/g,(e,a,o)=>o?o.toUpperCase():a.toLowerCase());/**
 * @license lucide-react v0.563.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const f=t=>{const e=b(t);return e.charAt(0).toUpperCase()+e.slice(1)};/**
 * @license lucide-react v0.563.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */var y={xmlns:"http://www.w3.org/2000/svg",width:24,height:24,viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:2,strokeLinecap:"round",strokeLinejoin:"round"};/**
 * @license lucide-react v0.563.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const k=t=>{for(const e in t)if(e.startsWith("aria-")||e==="role"||e==="title")return!0;return!1};/**
 * @license lucide-react v0.563.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const v=l.forwardRef(({color:t="currentColor",size:e=24,strokeWidth:a=2,absoluteStrokeWidth:o,className:d="",children:n,iconNode:u,...s},h)=>l.createElement("svg",{ref:h,...y,width:e,height:e,stroke:t,strokeWidth:o?Number(a)*24/Number(e):a,className:x("lucide",d),...!n&&!k(s)&&{"aria-hidden":"true"},...s},[...u.map(([c,m])=>l.createElement(c,m)),...Array.isArray(n)?n:[n]]));/**
 * @license lucide-react v0.563.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const i=(t,e)=>{const a=l.forwardRef(({className:o,...d},n)=>l.createElement(v,{ref:n,iconNode:e,className:x(`lucide-${p(f(t))}`,`lucide-${t}`,o),...d}));return a.displayName=f(t),a};/**
 * @license lucide-react v0.563.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const w=[["rect",{width:"16",height:"20",x:"4",y:"2",rx:"2",key:"1nb95v"}],["line",{x1:"8",x2:"16",y1:"6",y2:"6",key:"x4nwl0"}],["line",{x1:"16",x2:"16",y1:"14",y2:"18",key:"wjye3r"}],["path",{d:"M16 10h.01",key:"1m94wz"}],["path",{d:"M12 10h.01",key:"1nrarc"}],["path",{d:"M8 10h.01",key:"19clt8"}],["path",{d:"M12 14h.01",key:"1etili"}],["path",{d:"M8 14h.01",key:"6423bh"}],["path",{d:"M12 18h.01",key:"mhygvu"}],["path",{d:"M8 18h.01",key:"lrp35t"}]],g=i("calculator",w);/**
 * @license lucide-react v0.563.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const j=[["path",{d:"M4 20h16a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.93a2 2 0 0 1-1.66-.9l-.82-1.2A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13c0 1.1.9 2 2 2Z",key:"1fr9dc"}],["path",{d:"M8 10v4",key:"tgpxqk"}],["path",{d:"M12 10v2",key:"hh53o1"}],["path",{d:"M16 10v6",key:"1d6xys"}]],N=i("folder-kanban",j);/**
 * @license lucide-react v0.563.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const M=[["path",{d:"M15 21v-8a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v8",key:"5wwlr5"}],["path",{d:"M3 10a2 2 0 0 1 .709-1.528l7-6a2 2 0 0 1 2.582 0l7 6A2 2 0 0 1 21 10v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z",key:"r6nss1"}]],C=i("house",M);/**
 * @license lucide-react v0.563.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const $=[["path",{d:"M4 5h16",key:"1tepv9"}],["path",{d:"M4 12h16",key:"1lakjw"}],["path",{d:"M4 19h16",key:"1djgab"}]],_=i("menu",$);/**
 * @license lucide-react v0.563.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const A=[["path",{d:"M18 6 6 18",key:"1bl5f8"}],["path",{d:"m6 6 12 12",key:"d8bk6v"}]],E=i("x",A);function z({currentPath:t,baseUrl:e}){const[a,o]=l.useState(!1);l.useEffect(()=>(a?document.body.style.overflow="hidden":document.body.style.overflow="unset",()=>{document.body.style.overflow="unset"}),[a]);const d=[{href:e,label:"Home",icon:C},{href:`${e}/projects`,label:"Projects",icon:N},{href:`${e}/calculators`,label:"Calculators",icon:g}],n=s=>s.endsWith("/")?s.slice(0,-1):s,u=n(t);return r.jsxs("div",{className:"md:hidden",children:[r.jsx("button",{onClick:()=>o(!0),className:"p-2 text-ui-blue-dark hover:bg-ui-blue-light/50 rounded-md transition-colors focus-ring","aria-label":"Open menu","aria-expanded":a,children:r.jsx(_,{className:"w-6 h-6"})}),a&&r.jsx("div",{className:"fixed inset-0 bg-ui-blue-dark/20 backdrop-blur-sm z-50 animate-in fade-in duration-200",onClick:()=>o(!1)}),r.jsx("div",{className:`fixed top-0 right-0 h-full w-4/5 max-w-sm bg-surface shadow-2xl z-50 transform transition-transform duration-300 ease-out ${a?"translate-x-0":"translate-x-full"}`,children:r.jsxs("div",{className:"flex flex-col h-full",children:[r.jsxs("div",{className:"flex items-center justify-between p-4 border-b border-border",children:[r.jsx("span",{className:"font-bold text-lg text-brand-blue",children:"Menu"}),r.jsx("button",{onClick:()=>o(!1),className:"p-2 text-muted-foreground hover:bg-muted rounded-md transition-colors focus-ring","aria-label":"Close menu",children:r.jsx(E,{className:"w-6 h-6"})})]}),r.jsx("nav",{className:"flex-1 overflow-y-auto p-4 space-y-2",children:d.map(s=>{const h=n(s.href),c=u===h||s.href!==e&&u.startsWith(h),m=s.icon;return r.jsxs("a",{href:s.href,className:`flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-all ${c?"bg-brand-blue/5 text-brand-blue":"text-muted-foreground hover:bg-muted hover:text-foreground"}`,onClick:()=>o(!1),children:[r.jsx(m,{className:`w-5 h-5 ${c?"text-brand-blue":"text-muted-foreground"}`}),s.label,c&&r.jsx("span",{className:"ml-auto w-1.5 h-1.5 rounded-full bg-brand-yellow"})]},s.href)})}),r.jsx("div",{className:"p-4 border-t border-border",children:r.jsxs("div",{className:"text-xs text-center text-muted-foreground",children:["© ",new Date().getFullYear()," Sami.codes"]})})]})})]})}export{z as default};
