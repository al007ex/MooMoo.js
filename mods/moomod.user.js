// ==UserScript==
// @name         MooMod
// @namespace    moomoo.js
// @version      1.3.0
// @description  Nuro's MooMod on moomoo.js. - = MooMod menu, ESC = hat menu, F2 = auto placement.
// @author       Nuro (ported to moomoo.js)
// @match        *://*/*
// @run-at       document-start
// @require      https://pastebin.com/raw/jWDq3mmF?v=1.3.0
// @grant        none
// ==/UserScript==
//
// This @requires the loader above (re-upload the freshly built loader there).
// Tampermonkey caches @require files; the ?v= part makes it fetch the new loader.
// EDIT @match to your server's origin if you want to scope it.
//
// Includes jQuery v3.7.1 (c) OpenJS Foundation and other contributors, MIT license (jquery.org/license)
// and jquery-confirm v3.3.0 (c) 2013-2017 Boniface Pereira, MIT license.

(function(){var Vo=(function(){function kn(Ge,ye){(function(E,$){"use strict";typeof ye=="object"&&typeof ye.exports=="object"?ye.exports=E.document?$(E,!0):function(g){if(!g.document)throw new Error("jQuery requires a window with a document");return $(g)}:$(E)})(typeof Ge<"u"?Ge:this,function(E,$){"use strict";var g=[],M=Object.getPrototypeOf,be=g.slice,l=g.flat?function(e){return g.flat.call(e)}:function(e){return g.concat.apply([],e)},w=g.push,k=g.indexOf,j={},W=j.toString,U=j.hasOwnProperty,R=U.toString,de=R.call(Object),P={},Y=function(e){return typeof e=="function"&&typeof e.nodeType!="number"&&typeof e.item!="function"},ot=function(e){return e!=null&&e===e.window},J=E.document,vo={type:!0,src:!0,nonce:!0,noModule:!0};function Yn(e,t,n){var o,a,r=(n=n||J).createElement("script");if(r.text=e,t)for(o in vo)(a=t[o]||t.getAttribute&&t.getAttribute(o))&&r.setAttribute(o,a);n.head.appendChild(r).parentNode.removeChild(r)}function jt(e){return e==null?e+"":typeof e=="object"||typeof e=="function"?j[W.call(e)]||"object":typeof e}var Jn="3.7.1",yo=/HTML$/i,i=function(e,t){return new i.fn.init(e,t)};function Bn(e){var t=!!e&&"length"in e&&e.length,n=jt(e);return!Y(e)&&!ot(e)&&(n==="array"||t===0||typeof t=="number"&&0<t&&t-1 in e)}function fe(e,t){return e.nodeName&&e.nodeName.toLowerCase()===t.toLowerCase()}i.fn=i.prototype={jquery:Jn,constructor:i,length:0,toArray:function(){return be.call(this)},get:function(e){return e==null?be.call(this):e<0?this[e+this.length]:this[e]},pushStack:function(e){var t=i.merge(this.constructor(),e);return t.prevObject=this,t},each:function(e){return i.each(this,e)},map:function(e){return this.pushStack(i.map(this,function(t,n){return e.call(t,n,t)}))},slice:function(){return this.pushStack(be.apply(this,arguments))},first:function(){return this.eq(0)},last:function(){return this.eq(-1)},even:function(){return this.pushStack(i.grep(this,function(e,t){return(t+1)%2}))},odd:function(){return this.pushStack(i.grep(this,function(e,t){return t%2}))},eq:function(e){var t=this.length,n=+e+(e<0?t:0);return this.pushStack(0<=n&&n<t?[this[n]]:[])},end:function(){return this.prevObject||this.constructor()},push:w,sort:g.sort,splice:g.splice},i.extend=i.fn.extend=function(){var e,t,n,o,a,r,s=arguments[0]||{},f=1,d=arguments.length,m=!1;for(typeof s=="boolean"&&(m=s,s=arguments[f]||{},f++),typeof s=="object"||Y(s)||(s={}),f===d&&(s=this,f--);f<d;f++)if((e=arguments[f])!=null)for(t in e)o=e[t],t!=="__proto__"&&s!==o&&(m&&o&&(i.isPlainObject(o)||(a=Array.isArray(o)))?(n=s[t],r=a&&!Array.isArray(n)?[]:a||i.isPlainObject(n)?n:{},a=!1,s[t]=i.extend(m,r,o)):o!==void 0&&(s[t]=o));return s},i.extend({expando:"jQuery"+(Jn+Math.random()).replace(/\D/g,""),isReady:!0,error:function(e){throw new Error(e)},noop:function(){},isPlainObject:function(e){var t,n;return!(!e||W.call(e)!=="[object Object]")&&(!(t=M(e))||typeof(n=U.call(t,"constructor")&&t.constructor)=="function"&&R.call(n)===de)},isEmptyObject:function(e){var t;for(t in e)return!1;return!0},globalEval:function(e,t,n){Yn(e,{nonce:t&&t.nonce},n)},each:function(e,t){var n,o=0;if(Bn(e))for(n=e.length;o<n&&t.call(e[o],o,e[o])!==!1;o++);else for(o in e)if(t.call(e[o],o,e[o])===!1)break;return e},text:function(e){var t,n="",o=0,a=e.nodeType;if(!a)for(;t=e[o++];)n+=i.text(t);return a===1||a===11?e.textContent:a===9?e.documentElement.textContent:a===3||a===4?e.nodeValue:n},makeArray:function(e,t){var n=t||[];return e!=null&&(Bn(Object(e))?i.merge(n,typeof e=="string"?[e]:e):w.call(n,e)),n},inArray:function(e,t,n){return t==null?-1:k.call(t,e,n)},isXMLDoc:function(e){var t=e&&e.namespaceURI,n=e&&(e.ownerDocument||e).documentElement;return!yo.test(t||n&&n.nodeName||"HTML")},merge:function(e,t){for(var n=+t.length,o=0,a=e.length;o<n;o++)e[a++]=t[o];return e.length=a,e},grep:function(e,t,n){for(var o=[],a=0,r=e.length,s=!n;a<r;a++)!t(e[a],a)!==s&&o.push(e[a]);return o},map:function(e,t,n){var o,a,r=0,s=[];if(Bn(e))for(o=e.length;r<o;r++)(a=t(e[r],r,n))!=null&&s.push(a);else for(r in e)(a=t(e[r],r,n))!=null&&s.push(a);return l(s)},guid:1,support:P}),typeof Symbol=="function"&&(i.fn[Symbol.iterator]=g[Symbol.iterator]),i.each("Boolean Number String Function Array Date RegExp Object Error Symbol".split(" "),function(e,t){j["[object "+t+"]"]=t.toLowerCase()});var bo=g.pop,xo=g.sort,_n=g.splice,ue="[\\x20\\t\\r\\n\\f]",Zt=new RegExp("^"+ue+"+|((?:^|[^\\\\])(?:\\\\.)*)"+ue+"+$","g");i.contains=function(e,t){var n=t&&t.parentNode;return e===n||!(!n||n.nodeType!==1||!(e.contains?e.contains(n):e.compareDocumentPosition&&16&e.compareDocumentPosition(n)))};var In=/([\0-\x1f\x7f]|^-?\d)|^-$|[^\x80-\uFFFF\w-]/g;function Ao(e,t){return t?e==="\0"?"\uFFFD":e.slice(0,-1)+"\\"+e.charCodeAt(e.length-1).toString(16)+" ":"\\"+e}i.escapeSelector=function(e){return(e+"").replace(In,Ao)};var Ee=J,sn=w;(function(){var e,t,n,o,a,r,s,f,d,m,y=sn,S=i.expando,v=0,D=0,N=ie(),F=ie(),Z=ie(),xe=ie(),we=function(c,h){return c===h&&(a=!0),0},ge="checked|selected|async|autofocus|autoplay|controls|defer|disabled|hidden|ismap|loop|multiple|open|readonly|required|scoped",Xe="(?:\\\\[\\da-fA-F]{1,6}"+ue+"?|\\\\[^\\r\\n\\f]|[\\w-]|[^\0-\\x7f])+",ae="\\["+ue+"*("+Xe+")(?:"+ue+"*([*^$|!~]?=)"+ue+`*(?:'((?:\\\\.|[^\\\\'])*)'|"((?:\\\\.|[^\\\\"])*)"|(`+Xe+"))|)"+ue+"*\\]",re=":("+Xe+`)(?:\\((('((?:\\\\.|[^\\\\'])*)'|"((?:\\\\.|[^\\\\"])*)")|((?:\\\\.|[^\\\\()[\\]]|`+ae+")*)|.*)\\)|)",oe=new RegExp(ue+"+","g"),he=new RegExp("^"+ue+"*,"+ue+"*"),Pt=new RegExp("^"+ue+"*([>+~]|"+ue+")"+ue+"*"),Sn=new RegExp(ue+"|>"),tt=new RegExp(re),an=new RegExp("^"+Xe+"$"),st={ID:new RegExp("^#("+Xe+")"),CLASS:new RegExp("^\\.("+Xe+")"),TAG:new RegExp("^("+Xe+"|[*])"),ATTR:new RegExp("^"+ae),PSEUDO:new RegExp("^"+re),CHILD:new RegExp("^:(only|first|last|nth|nth-last)-(child|of-type)(?:\\("+ue+"*(even|odd|(([+-]|)(\\d*)n|)"+ue+"*(?:([+-]|)"+ue+"*(\\d+)|))"+ue+"*\\)|)","i"),bool:new RegExp("^(?:"+ge+")$","i"),needsContext:new RegExp("^"+ue+"*[>+~]|:(even|odd|eq|gt|lt|nth|first|last)(?:\\("+ue+"*((?:-\\d)?\\d*)"+ue+"*\\)|)(?=[^-]|$)","i")},lt=/^(?:input|select|textarea|button)$/i,Qt=/^h\d$/i,Pe=/^(?:#([\w-]+)|(\w+)|\.([\w-]+))$/,Se=/[+~]/,Ae=new RegExp("\\\\[\\da-fA-F]{1,6}"+ue+"?|\\\\([^\\r\\n\\f])","g"),He=function(c,h){var b="0x"+c.slice(1)-65536;return h||(b<0?String.fromCharCode(b+65536):String.fromCharCode(b>>10|55296,1023&b|56320))},bt=function(){xt()},We=x(function(c){return c.disabled===!0&&fe(c,"fieldset")},{dir:"parentNode",next:"legend"});try{y.apply(g=be.call(Ee.childNodes),Ee.childNodes),g[Ee.childNodes.length].nodeType}catch{y={apply:function(h,b){sn.apply(h,be.call(b))},call:function(h){sn.apply(h,be.call(arguments,1))}}}function K(c,h,b,C){var B,z,G,q,T,ce,_,ee=h&&h.ownerDocument,le=h?h.nodeType:9;if(b=b||[],typeof c!="string"||!c||le!==1&&le!==9&&le!==11)return b;if(!C&&(xt(h),h=h||r,f)){if(le!==11&&(T=Pe.exec(c)))if(B=T[1]){if(le===9){if(!(G=h.getElementById(B)))return b;if(G.id===B)return y.call(b,G),b}else if(ee&&(G=ee.getElementById(B))&&K.contains(h,G)&&G.id===B)return y.call(b,G),b}else{if(T[2])return y.apply(b,h.getElementsByTagName(c)),b;if((B=T[3])&&h.getElementsByClassName)return y.apply(b,h.getElementsByClassName(B)),b}if(!(xe[c+" "]||d&&d.test(c))){if(_=c,ee=h,le===1&&(Sn.test(c)||Pt.test(c))){for((ee=Se.test(c)&&Ln(h.parentNode)||h)==h&&P.scope||((q=h.getAttribute("id"))?q=i.escapeSelector(q):h.setAttribute("id",q=S)),z=(ce=u(c)).length;z--;)ce[z]=(q?"#"+q:":scope")+" "+p(ce[z]);_=ce.join(",")}try{return y.apply(b,ee.querySelectorAll(_)),b}catch{xe(c,!0)}finally{q===S&&h.removeAttribute("id")}}}return pe(c.replace(Zt,"$1"),h,b,C)}function ie(){var c=[];return function h(b,C){return c.push(b+" ")>t.cacheLength&&delete h[c.shift()],h[b+" "]=C}}function se(c){return c[S]=!0,c}function me(c){var h=r.createElement("fieldset");try{return!!c(h)}catch{return!1}finally{h.parentNode&&h.parentNode.removeChild(h),h=null}}function nt(c){return function(h){return fe(h,"input")&&h.type===c}}function Ft(c){return function(h){return(fe(h,"input")||fe(h,"button"))&&h.type===c}}function ct(c){return function(h){return"form"in h?h.parentNode&&h.disabled===!1?"label"in h?"label"in h.parentNode?h.parentNode.disabled===c:h.disabled===c:h.isDisabled===c||h.isDisabled!==!c&&We(h)===c:h.disabled===c:"label"in h&&h.disabled===c}}function Mt(c){return se(function(h){return h=+h,se(function(b,C){for(var B,z=c([],b.length,h),G=z.length;G--;)b[B=z[G]]&&(b[B]=!(C[B]=b[B]))})})}function Ln(c){return c&&typeof c.getElementsByTagName<"u"&&c}function xt(c){var h,b=c?c.ownerDocument||c:Ee;return b!=r&&b.nodeType===9&&b.documentElement&&(s=(r=b).documentElement,f=!i.isXMLDoc(r),m=s.matches||s.webkitMatchesSelector||s.msMatchesSelector,s.msMatchesSelector&&Ee!=r&&(h=r.defaultView)&&h.top!==h&&h.addEventListener("unload",bt),P.getById=me(function(C){return s.appendChild(C).id=i.expando,!r.getElementsByName||!r.getElementsByName(i.expando).length}),P.disconnectedMatch=me(function(C){return m.call(C,"*")}),P.scope=me(function(){return r.querySelectorAll(":scope")}),P.cssHas=me(function(){try{return r.querySelector(":has(*,:jqfake)"),!1}catch{return!0}}),P.getById?(t.filter.ID=function(C){var B=C.replace(Ae,He);return function(z){return z.getAttribute("id")===B}},t.find.ID=function(C,B){if(typeof B.getElementById<"u"&&f){var z=B.getElementById(C);return z?[z]:[]}}):(t.filter.ID=function(C){var B=C.replace(Ae,He);return function(z){var G=typeof z.getAttributeNode<"u"&&z.getAttributeNode("id");return G&&G.value===B}},t.find.ID=function(C,B){if(typeof B.getElementById<"u"&&f){var z,G,q,T=B.getElementById(C);if(T){if((z=T.getAttributeNode("id"))&&z.value===C)return[T];for(q=B.getElementsByName(C),G=0;T=q[G++];)if((z=T.getAttributeNode("id"))&&z.value===C)return[T]}return[]}}),t.find.TAG=function(C,B){return typeof B.getElementsByTagName<"u"?B.getElementsByTagName(C):B.querySelectorAll(C)},t.find.CLASS=function(C,B){if(typeof B.getElementsByClassName<"u"&&f)return B.getElementsByClassName(C)},d=[],me(function(C){var B;s.appendChild(C).innerHTML="<a id='"+S+"' href='' disabled='disabled'></a><select id='"+S+"-\r\\' disabled='disabled'><option selected=''></option></select>",C.querySelectorAll("[selected]").length||d.push("\\["+ue+"*(?:value|"+ge+")"),C.querySelectorAll("[id~="+S+"-]").length||d.push("~="),C.querySelectorAll("a#"+S+"+*").length||d.push(".#.+[+~]"),C.querySelectorAll(":checked").length||d.push(":checked"),(B=r.createElement("input")).setAttribute("type","hidden"),C.appendChild(B).setAttribute("name","D"),s.appendChild(C).disabled=!0,C.querySelectorAll(":disabled").length!==2&&d.push(":enabled",":disabled"),(B=r.createElement("input")).setAttribute("name",""),C.appendChild(B),C.querySelectorAll("[name='']").length||d.push("\\["+ue+"*name"+ue+"*="+ue+`*(?:''|"")`)}),P.cssHas||d.push(":has"),d=d.length&&new RegExp(d.join("|")),we=function(C,B){if(C===B)return a=!0,0;var z=!C.compareDocumentPosition-!B.compareDocumentPosition;return z||(1&(z=(C.ownerDocument||C)==(B.ownerDocument||B)?C.compareDocumentPosition(B):1)||!P.sortDetached&&B.compareDocumentPosition(C)===z?C===r||C.ownerDocument==Ee&&K.contains(Ee,C)?-1:B===r||B.ownerDocument==Ee&&K.contains(Ee,B)?1:o?k.call(o,C)-k.call(o,B):0:4&z?-1:1)}),r}for(e in K.matches=function(c,h){return K(c,null,null,h)},K.matchesSelector=function(c,h){if(xt(c),f&&!xe[h+" "]&&(!d||!d.test(h)))try{var b=m.call(c,h);if(b||P.disconnectedMatch||c.document&&c.document.nodeType!==11)return b}catch{xe(h,!0)}return 0<K(h,r,null,[c]).length},K.contains=function(c,h){return(c.ownerDocument||c)!=r&&xt(c),i.contains(c,h)},K.attr=function(c,h){(c.ownerDocument||c)!=r&&xt(c);var b=t.attrHandle[h.toLowerCase()],C=b&&U.call(t.attrHandle,h.toLowerCase())?b(c,h,!f):void 0;return C!==void 0?C:c.getAttribute(h)},K.error=function(c){throw new Error("Syntax error, unrecognized expression: "+c)},i.uniqueSort=function(c){var h,b=[],C=0,B=0;if(a=!P.sortStable,o=!P.sortStable&&be.call(c,0),xo.call(c,we),a){for(;h=c[B++];)h===c[B]&&(C=b.push(B));for(;C--;)_n.call(c,b[C],1)}return o=null,c},i.fn.uniqueSort=function(){return this.pushStack(i.uniqueSort(be.apply(this)))},(t=i.expr={cacheLength:50,createPseudo:se,match:st,attrHandle:{},find:{},relative:{">":{dir:"parentNode",first:!0}," ":{dir:"parentNode"},"+":{dir:"previousSibling",first:!0},"~":{dir:"previousSibling"}},preFilter:{ATTR:function(c){return c[1]=c[1].replace(Ae,He),c[3]=(c[3]||c[4]||c[5]||"").replace(Ae,He),c[2]==="~="&&(c[3]=" "+c[3]+" "),c.slice(0,4)},CHILD:function(c){return c[1]=c[1].toLowerCase(),c[1].slice(0,3)==="nth"?(c[3]||K.error(c[0]),c[4]=+(c[4]?c[5]+(c[6]||1):2*(c[3]==="even"||c[3]==="odd")),c[5]=+(c[7]+c[8]||c[3]==="odd")):c[3]&&K.error(c[0]),c},PSEUDO:function(c){var h,b=!c[6]&&c[2];return st.CHILD.test(c[0])?null:(c[3]?c[2]=c[4]||c[5]||"":b&&tt.test(b)&&(h=u(b,!0))&&(h=b.indexOf(")",b.length-h)-b.length)&&(c[0]=c[0].slice(0,h),c[2]=b.slice(0,h)),c.slice(0,3))}},filter:{TAG:function(c){var h=c.replace(Ae,He).toLowerCase();return c==="*"?function(){return!0}:function(b){return fe(b,h)}},CLASS:function(c){var h=N[c+" "];return h||(h=new RegExp("(^|"+ue+")"+c+"("+ue+"|$)"))&&N(c,function(b){return h.test(typeof b.className=="string"&&b.className||typeof b.getAttribute<"u"&&b.getAttribute("class")||"")})},ATTR:function(c,h,b){return function(C){var B=K.attr(C,c);return B==null?h==="!=":!h||(B+="",h==="="?B===b:h==="!="?B!==b:h==="^="?b&&B.indexOf(b)===0:h==="*="?b&&-1<B.indexOf(b):h==="$="?b&&B.slice(-b.length)===b:h==="~="?-1<(" "+B.replace(oe," ")+" ").indexOf(b):h==="|="&&(B===b||B.slice(0,b.length+1)===b+"-"))}},CHILD:function(c,h,b,C,B){var z=c.slice(0,3)!=="nth",G=c.slice(-4)!=="last",q=h==="of-type";return C===1&&B===0?function(T){return!!T.parentNode}:function(T,ce,_){var ee,le,X,De,je,Be=z!==G?"nextSibling":"previousSibling",Qe=T.parentNode,Ye=q&&T.nodeName.toLowerCase(),ut=!_&&!q,ve=!1;if(Qe){if(z){for(;Be;){for(X=T;X=X[Be];)if(q?fe(X,Ye):X.nodeType===1)return!1;je=Be=c==="only"&&!je&&"nextSibling"}return!0}if(je=[G?Qe.firstChild:Qe.lastChild],G&&ut){for(ve=(De=(ee=(le=Qe[S]||(Qe[S]={}))[c]||[])[0]===v&&ee[1])&&ee[2],X=De&&Qe.childNodes[De];X=++De&&X&&X[Be]||(ve=De=0)||je.pop();)if(X.nodeType===1&&++ve&&X===T){le[c]=[v,De,ve];break}}else if(ut&&(ve=De=(ee=(le=T[S]||(T[S]={}))[c]||[])[0]===v&&ee[1]),ve===!1)for(;(X=++De&&X&&X[Be]||(ve=De=0)||je.pop())&&!((q?fe(X,Ye):X.nodeType===1)&&++ve&&(ut&&((le=X[S]||(X[S]={}))[c]=[v,ve]),X===T)););return(ve-=B)===C||ve%C==0&&0<=ve/C}}},PSEUDO:function(c,h){var b,C=t.pseudos[c]||t.setFilters[c.toLowerCase()]||K.error("unsupported pseudo: "+c);return C[S]?C(h):1<C.length?(b=[c,c,"",h],t.setFilters.hasOwnProperty(c.toLowerCase())?se(function(B,z){for(var G,q=C(B,h),T=q.length;T--;)B[G=k.call(B,q[T])]=!(z[G]=q[T])}):function(B){return C(B,0,b)}):C}},pseudos:{not:se(function(c){var h=[],b=[],C=Q(c.replace(Zt,"$1"));return C[S]?se(function(B,z,G,q){for(var T,ce=C(B,null,q,[]),_=B.length;_--;)(T=ce[_])&&(B[_]=!(z[_]=T))}):function(B,z,G){return h[0]=B,C(h,null,G,b),h[0]=null,!b.pop()}}),has:se(function(c){return function(h){return 0<K(c,h).length}}),contains:se(function(c){return c=c.replace(Ae,He),function(h){return-1<(h.textContent||i.text(h)).indexOf(c)}}),lang:se(function(c){return an.test(c||"")||K.error("unsupported lang: "+c),c=c.replace(Ae,He).toLowerCase(),function(h){var b;do if(b=f?h.lang:h.getAttribute("xml:lang")||h.getAttribute("lang"))return(b=b.toLowerCase())===c||b.indexOf(c+"-")===0;while((h=h.parentNode)&&h.nodeType===1);return!1}}),target:function(c){var h=E.location&&E.location.hash;return h&&h.slice(1)===c.id},root:function(c){return c===s},focus:function(c){return c===(function(){try{return r.activeElement}catch{}})()&&r.hasFocus()&&!!(c.type||c.href||~c.tabIndex)},enabled:ct(!1),disabled:ct(!0),checked:function(c){return fe(c,"input")&&!!c.checked||fe(c,"option")&&!!c.selected},selected:function(c){return c.parentNode&&c.parentNode.selectedIndex,c.selected===!0},empty:function(c){for(c=c.firstChild;c;c=c.nextSibling)if(c.nodeType<6)return!1;return!0},parent:function(c){return!t.pseudos.empty(c)},header:function(c){return Qt.test(c.nodeName)},input:function(c){return lt.test(c.nodeName)},button:function(c){return fe(c,"input")&&c.type==="button"||fe(c,"button")},text:function(c){var h;return fe(c,"input")&&c.type==="text"&&((h=c.getAttribute("type"))==null||h.toLowerCase()==="text")},first:Mt(function(){return[0]}),last:Mt(function(c,h){return[h-1]}),eq:Mt(function(c,h,b){return[b<0?b+h:b]}),even:Mt(function(c,h){for(var b=0;b<h;b+=2)c.push(b);return c}),odd:Mt(function(c,h){for(var b=1;b<h;b+=2)c.push(b);return c}),lt:Mt(function(c,h,b){var C;for(C=b<0?b+h:h<b?h:b;0<=--C;)c.push(C);return c}),gt:Mt(function(c,h,b){for(var C=b<0?b+h:b;++C<h;)c.push(C);return c})}}).pseudos.nth=t.pseudos.eq,{radio:!0,checkbox:!0,file:!0,password:!0,image:!0})t.pseudos[e]=nt(e);for(e in{submit:!0,reset:!0})t.pseudos[e]=Ft(e);function Xn(){}function u(c,h){var b,C,B,z,G,q,T,ce=F[c+" "];if(ce)return h?0:ce.slice(0);for(G=c,q=[],T=t.preFilter;G;){for(z in b&&!(C=he.exec(G))||(C&&(G=G.slice(C[0].length)||G),q.push(B=[])),b=!1,(C=Pt.exec(G))&&(b=C.shift(),B.push({value:b,type:C[0].replace(Zt," ")}),G=G.slice(b.length)),t.filter)!(C=st[z].exec(G))||T[z]&&!(C=T[z](C))||(b=C.shift(),B.push({value:b,type:z,matches:C}),G=G.slice(b.length));if(!b)break}return h?G.length:G?K.error(c):F(c,q).slice(0)}function p(c){for(var h=0,b=c.length,C="";h<b;h++)C+=c[h].value;return C}function x(c,h,b){var C=h.dir,B=h.next,z=B||C,G=b&&z==="parentNode",q=D++;return h.first?function(T,ce,_){for(;T=T[C];)if(T.nodeType===1||G)return c(T,ce,_);return!1}:function(T,ce,_){var ee,le,X=[v,q];if(_){for(;T=T[C];)if((T.nodeType===1||G)&&c(T,ce,_))return!0}else for(;T=T[C];)if(T.nodeType===1||G)if(le=T[S]||(T[S]={}),B&&fe(T,B))T=T[C]||T;else{if((ee=le[z])&&ee[0]===v&&ee[1]===q)return X[2]=ee[2];if((le[z]=X)[2]=c(T,ce,_))return!0}return!1}}function A(c){return 1<c.length?function(h,b,C){for(var B=c.length;B--;)if(!c[B](h,b,C))return!1;return!0}:c[0]}function H(c,h,b,C,B){for(var z,G=[],q=0,T=c.length,ce=h!=null;q<T;q++)(z=c[q])&&(b&&!b(z,C,B)||(G.push(z),ce&&h.push(q)));return G}function O(c,h,b,C,B,z){return C&&!C[S]&&(C=O(C)),B&&!B[S]&&(B=O(B,z)),se(function(G,q,T,ce){var _,ee,le,X,De=[],je=[],Be=q.length,Qe=G||(function(ut,ve,rn){for(var pt=0,go=ve.length;pt<go;pt++)K(ut,ve[pt],rn);return rn})(h||"*",T.nodeType?[T]:T,[]),Ye=!c||!G&&h?Qe:H(Qe,De,c,T,ce);if(b?b(Ye,X=B||(G?c:Be||C)?[]:q,T,ce):X=Ye,C)for(_=H(X,je),C(_,[],T,ce),ee=_.length;ee--;)(le=_[ee])&&(X[je[ee]]=!(Ye[je[ee]]=le));if(G){if(B||c){if(B){for(_=[],ee=X.length;ee--;)(le=X[ee])&&_.push(Ye[ee]=le);B(null,X=[],_,ce)}for(ee=X.length;ee--;)(le=X[ee])&&-1<(_=B?k.call(G,le):De[ee])&&(G[_]=!(q[_]=le))}}else X=H(X===q?X.splice(Be,X.length):X),B?B(null,q,X,ce):y.apply(q,X)})}function ne(c){for(var h,b,C,B=c.length,z=t.relative[c[0].type],G=z||t.relative[" "],q=z?1:0,T=x(function(ee){return ee===h},G,!0),ce=x(function(ee){return-1<k.call(h,ee)},G,!0),_=[function(ee,le,X){var De=!z&&(X||le!=n)||((h=le).nodeType?T(ee,le,X):ce(ee,le,X));return h=null,De}];q<B;q++)if(b=t.relative[c[q].type])_=[x(A(_),b)];else{if((b=t.filter[c[q].type].apply(null,c[q].matches))[S]){for(C=++q;C<B&&!t.relative[c[C].type];C++);return O(1<q&&A(_),1<q&&p(c.slice(0,q-1).concat({value:c[q-2].type===" "?"*":""})).replace(Zt,"$1"),b,q<C&&ne(c.slice(q,C)),C<B&&ne(c=c.slice(C)),C<B&&p(c))}_.push(b)}return A(_)}function Q(c,h){var b,C,B,z,G,q,T=[],ce=[],_=Z[c+" "];if(!_){for(h||(h=u(c)),b=h.length;b--;)(_=ne(h[b]))[S]?T.push(_):ce.push(_);(_=Z(c,(C=ce,z=0<(B=T).length,G=0<C.length,q=function(ee,le,X,De,je){var Be,Qe,Ye,ut=0,ve="0",rn=ee&&[],pt=[],go=n,Ro=ee||G&&t.find.TAG("*",je),Uo=v+=go==null?1:Math.random()||.1,No=Ro.length;for(je&&(n=le==r||le||je);ve!==No&&(Be=Ro[ve])!=null;ve++){if(G&&Be){for(Qe=0,le||Be.ownerDocument==r||(xt(Be),X=!f);Ye=C[Qe++];)if(Ye(Be,le||r,X)){y.call(De,Be);break}je&&(v=Uo)}z&&((Be=!Ye&&Be)&&ut--,ee&&rn.push(Be))}if(ut+=ve,z&&ve!==ut){for(Qe=0;Ye=B[Qe++];)Ye(rn,pt,le,X);if(ee){if(0<ut)for(;ve--;)rn[ve]||pt[ve]||(pt[ve]=bo.call(De));pt=H(pt)}y.apply(De,pt),je&&!ee&&0<pt.length&&1<ut+B.length&&i.uniqueSort(De)}return je&&(v=Uo,n=go),rn},z?se(q):q))).selector=c}return _}function pe(c,h,b,C){var B,z,G,q,T,ce=typeof c=="function"&&c,_=!C&&u(c=ce.selector||c);if(b=b||[],_.length===1){if(2<(z=_[0]=_[0].slice(0)).length&&(G=z[0]).type==="ID"&&h.nodeType===9&&f&&t.relative[z[1].type]){if(!(h=(t.find.ID(G.matches[0].replace(Ae,He),h)||[])[0]))return b;ce&&(h=h.parentNode),c=c.slice(z.shift().value.length)}for(B=st.needsContext.test(c)?0:z.length;B--&&(G=z[B],!t.relative[q=G.type]);)if((T=t.find[q])&&(C=T(G.matches[0].replace(Ae,He),Se.test(z[0].type)&&Ln(h.parentNode)||h))){if(z.splice(B,1),!(c=C.length&&p(z)))return y.apply(b,C),b;break}}return(ce||Q(c,_))(C,h,!f,b,!h||Se.test(c)&&Ln(h.parentNode)||h),b}Xn.prototype=t.filters=t.pseudos,t.setFilters=new Xn,P.sortStable=S.split("").sort(we).join("")===S,xt(),P.sortDetached=me(function(c){return 1&c.compareDocumentPosition(r.createElement("fieldset"))}),i.find=K,i.expr[":"]=i.expr.pseudos,i.unique=i.uniqueSort,K.compile=Q,K.select=pe,K.setDocument=xt,K.tokenize=u,K.escape=i.escapeSelector,K.getText=i.text,K.isXML=i.isXMLDoc,K.selectors=i.expr,K.support=i.support,K.uniqueSort=i.uniqueSort})();var Tt=function(e,t,n){for(var o=[],a=n!==void 0;(e=e[t])&&e.nodeType!==9;)if(e.nodeType===1){if(a&&i(e).is(n))break;o.push(e)}return o},Hn=function(e,t){for(var n=[];e;e=e.nextSibling)e.nodeType===1&&e!==t&&n.push(e);return n},Wn=i.expr.match.needsContext,ln=/^<([a-z][^\/\0>:\x20\t\r\n\f]*)[\x20\t\r\n\f]*\/?>(?:<\/\1>|)$/i;function At(e,t,n){return Y(t)?i.grep(e,function(o,a){return!!t.call(o,a,o)!==n}):t.nodeType?i.grep(e,function(o){return o===t!==n}):typeof t!="string"?i.grep(e,function(o){return-1<k.call(t,o)!==n}):i.filter(t,e,n)}i.filter=function(e,t,n){var o=t[0];return n&&(e=":not("+e+")"),t.length===1&&o.nodeType===1?i.find.matchesSelector(o,e)?[o]:[]:i.find.matches(e,i.grep(t,function(a){return a.nodeType===1}))},i.fn.extend({find:function(e){var t,n,o=this.length,a=this;if(typeof e!="string")return this.pushStack(i(e).filter(function(){for(t=0;t<o;t++)if(i.contains(a[t],this))return!0}));for(n=this.pushStack([]),t=0;t<o;t++)i.find(e,a[t],n);return 1<o?i.uniqueSort(n):n},filter:function(e){return this.pushStack(At(this,e||[],!1))},not:function(e){return this.pushStack(At(this,e||[],!0))},is:function(e){return!!At(this,typeof e=="string"&&Wn.test(e)?i(e):e||[],!1).length}});var I,Co=/^(?:\s*(<[\w\W]+>)[^>]*|#([\w-]+))$/;(i.fn.init=function(e,t,n){var o,a;if(!e)return this;if(n=n||I,typeof e=="string"){if(!(o=e[0]==="<"&&e[e.length-1]===">"&&3<=e.length?[null,e,null]:Co.exec(e))||!o[1]&&t)return!t||t.jquery?(t||n).find(e):this.constructor(t).find(e);if(o[1]){if(t=t instanceof i?t[0]:t,i.merge(this,i.parseHTML(o[1],t&&t.nodeType?t.ownerDocument||t:J,!0)),ln.test(o[1])&&i.isPlainObject(t))for(o in t)Y(this[o])?this[o](t[o]):this.attr(o,t[o]);return this}return(a=J.getElementById(o[2]))&&(this[0]=a,this.length=1),this}return e.nodeType?(this[0]=e,this.length=1,this):Y(e)?n.ready!==void 0?n.ready(e):e(i):i.makeArray(e,this)}).prototype=i.fn,I=i(J);var $n=/^(?:parents|prev(?:Until|All))/,cn={children:!0,contents:!0,next:!0,prev:!0};function En(e,t){for(;(e=e[t])&&e.nodeType!==1;);return e}i.fn.extend({has:function(e){var t=i(e,this),n=t.length;return this.filter(function(){for(var o=0;o<n;o++)if(i.contains(this,t[o]))return!0})},closest:function(e,t){var n,o=0,a=this.length,r=[],s=typeof e!="string"&&i(e);if(!Wn.test(e)){for(;o<a;o++)for(n=this[o];n&&n!==t;n=n.parentNode)if(n.nodeType<11&&(s?-1<s.index(n):n.nodeType===1&&i.find.matchesSelector(n,e))){r.push(n);break}}return this.pushStack(1<r.length?i.uniqueSort(r):r)},index:function(e){return e?typeof e=="string"?k.call(i(e),this[0]):k.call(this,e.jquery?e[0]:e):this[0]&&this[0].parentNode?this.first().prevAll().length:-1},add:function(e,t){return this.pushStack(i.uniqueSort(i.merge(this.get(),i(e,t))))},addBack:function(e){return this.add(e==null?this.prevObject:this.prevObject.filter(e))}}),i.each({parent:function(e){var t=e.parentNode;return t&&t.nodeType!==11?t:null},parents:function(e){return Tt(e,"parentNode")},parentsUntil:function(e,t,n){return Tt(e,"parentNode",n)},next:function(e){return En(e,"nextSibling")},prev:function(e){return En(e,"previousSibling")},nextAll:function(e){return Tt(e,"nextSibling")},prevAll:function(e){return Tt(e,"previousSibling")},nextUntil:function(e,t,n){return Tt(e,"nextSibling",n)},prevUntil:function(e,t,n){return Tt(e,"previousSibling",n)},siblings:function(e){return Hn((e.parentNode||{}).firstChild,e)},children:function(e){return Hn(e.firstChild)},contents:function(e){return e.contentDocument!=null&&M(e.contentDocument)?e.contentDocument:(fe(e,"template")&&(e=e.content||e),i.merge([],e.childNodes))}},function(e,t){i.fn[e]=function(n,o){var a=i.map(this,t,n);return e.slice(-5)!=="Until"&&(o=n),o&&typeof o=="string"&&(a=i.filter(o,a)),1<this.length&&(cn[e]||i.uniqueSort(a),$n.test(e)&&a.reverse()),this.pushStack(a)}});var Je=/[^\x20\t\r\n\f]+/g;function Ot(e){return e}function un(e){throw e}function eo(e,t,n,o){var a;try{e&&Y(a=e.promise)?a.call(e).done(t).fail(n):e&&Y(a=e.then)?a.call(e,t,n):t.apply(void 0,[e].slice(o))}catch(r){n.apply(void 0,[r])}}i.Callbacks=function(e){var t,n;e=typeof e=="string"?(t=e,n={},i.each(t.match(Je)||[],function(v,D){n[D]=!0}),n):i.extend({},e);var o,a,r,s,f=[],d=[],m=-1,y=function(){for(s=s||e.once,r=o=!0;d.length;m=-1)for(a=d.shift();++m<f.length;)f[m].apply(a[0],a[1])===!1&&e.stopOnFalse&&(m=f.length,a=!1);e.memory||(a=!1),o=!1,s&&(f=a?[]:"")},S={add:function(){return f&&(a&&!o&&(m=f.length-1,d.push(a)),(function v(D){i.each(D,function(N,F){Y(F)?e.unique&&S.has(F)||f.push(F):F&&F.length&&jt(F)!=="string"&&v(F)})})(arguments),a&&!o&&y()),this},remove:function(){return i.each(arguments,function(v,D){for(var N;-1<(N=i.inArray(D,f,N));)f.splice(N,1),N<=m&&m--}),this},has:function(v){return v?-1<i.inArray(v,f):0<f.length},empty:function(){return f&&(f=[]),this},disable:function(){return s=d=[],f=a="",this},disabled:function(){return!f},lock:function(){return s=d=[],a||o||(f=a=""),this},locked:function(){return!!s},fireWith:function(v,D){return s||(D=[v,(D=D||[]).slice?D.slice():D],d.push(D),o||y()),this},fire:function(){return S.fireWith(this,arguments),this},fired:function(){return!!r}};return S},i.extend({Deferred:function(e){var t=[["notify","progress",i.Callbacks("memory"),i.Callbacks("memory"),2],["resolve","done",i.Callbacks("once memory"),i.Callbacks("once memory"),0,"resolved"],["reject","fail",i.Callbacks("once memory"),i.Callbacks("once memory"),1,"rejected"]],n="pending",o={state:function(){return n},always:function(){return a.done(arguments).fail(arguments),this},catch:function(r){return o.then(null,r)},pipe:function(){var r=arguments;return i.Deferred(function(s){i.each(t,function(f,d){var m=Y(r[d[4]])&&r[d[4]];a[d[1]](function(){var y=m&&m.apply(this,arguments);y&&Y(y.promise)?y.promise().progress(s.notify).done(s.resolve).fail(s.reject):s[d[0]+"With"](this,m?[y]:arguments)})}),r=null}).promise()},then:function(r,s,f){var d=0;function m(y,S,v,D){return function(){var N=this,F=arguments,Z=function(){var we,ge;if(!(y<d)){if((we=v.apply(N,F))===S.promise())throw new TypeError("Thenable self-resolution");ge=we&&(typeof we=="object"||typeof we=="function")&&we.then,Y(ge)?D?ge.call(we,m(d,S,Ot,D),m(d,S,un,D)):(d++,ge.call(we,m(d,S,Ot,D),m(d,S,un,D),m(d,S,Ot,S.notifyWith))):(v!==Ot&&(N=void 0,F=[we]),(D||S.resolveWith)(N,F))}},xe=D?Z:function(){try{Z()}catch(we){i.Deferred.exceptionHook&&i.Deferred.exceptionHook(we,xe.error),d<=y+1&&(v!==un&&(N=void 0,F=[we]),S.rejectWith(N,F))}};y?xe():(i.Deferred.getErrorHook?xe.error=i.Deferred.getErrorHook():i.Deferred.getStackHook&&(xe.error=i.Deferred.getStackHook()),E.setTimeout(xe))}}return i.Deferred(function(y){t[0][3].add(m(0,y,Y(f)?f:Ot,y.notifyWith)),t[1][3].add(m(0,y,Y(r)?r:Ot)),t[2][3].add(m(0,y,Y(s)?s:un))}).promise()},promise:function(r){return r!=null?i.extend(r,o):o}},a={};return i.each(t,function(r,s){var f=s[2],d=s[5];o[s[1]]=f.add,d&&f.add(function(){n=d},t[3-r][2].disable,t[3-r][3].disable,t[0][2].lock,t[0][3].lock),f.add(s[3].fire),a[s[0]]=function(){return a[s[0]+"With"](this===a?void 0:this,arguments),this},a[s[0]+"With"]=f.fireWith}),o.promise(a),e&&e.call(a,a),a},when:function(e){var t=arguments.length,n=t,o=Array(n),a=be.call(arguments),r=i.Deferred(),s=function(f){return function(d){o[f]=this,a[f]=1<arguments.length?be.call(arguments):d,--t||r.resolveWith(o,a)}};if(t<=1&&(eo(e,r.done(s(n)).resolve,r.reject,!t),r.state()==="pending"||Y(a[n]&&a[n].then)))return r.then();for(;n--;)eo(a[n],s(n),r.reject);return r.promise()}});var wo=/^(Eval|Internal|Range|Reference|Syntax|Type|URI)Error$/;i.Deferred.exceptionHook=function(e,t){E.console&&E.console.warn&&e&&wo.test(e.name)&&E.console.warn("jQuery.Deferred exception: "+e.message,e.stack,t)},i.readyException=function(e){E.setTimeout(function(){throw e})};var ke=i.Deferred();function Lt(){J.removeEventListener("DOMContentLoaded",Lt),E.removeEventListener("load",Lt),i.ready()}i.fn.ready=function(e){return ke.then(e).catch(function(t){i.readyException(t)}),this},i.extend({isReady:!1,readyWait:1,ready:function(e){(e===!0?--i.readyWait:i.isReady)||(i.isReady=!0)!==e&&0<--i.readyWait||ke.resolveWith(J,[i])}}),i.ready.then=ke.then,J.readyState==="complete"||J.readyState!=="loading"&&!J.documentElement.doScroll?E.setTimeout(i.ready):(J.addEventListener("DOMContentLoaded",Lt),E.addEventListener("load",Lt));var Te=function(e,t,n,o,a,r,s){var f=0,d=e.length,m=n==null;if(jt(n)==="object")for(f in a=!0,n)Te(e,t,f,n[f],!0,r,s);else if(o!==void 0&&(a=!0,Y(o)||(s=!0),m&&(s?(t.call(e,o),t=null):(m=t,t=function(y,S,v){return m.call(i(y),v)})),t))for(;f<d;f++)t(e[f],n,s?o:o.call(e[f],f,t(e[f],n)));return a?e:m?t.call(e):d?t(e[0],n):r},to=/^-ms-/,Mn=/-([a-z])/g;function jn(e,t){return t.toUpperCase()}function Oe(e){return e.replace(to,"ms-").replace(Mn,jn)}var Ct=function(e){return e.nodeType===1||e.nodeType===9||!+e.nodeType};function zt(){this.expando=i.expando+zt.uid++}zt.uid=1,zt.prototype={cache:function(e){var t=e[this.expando];return t||(t={},Ct(e)&&(e.nodeType?e[this.expando]=t:Object.defineProperty(e,this.expando,{value:t,configurable:!0}))),t},set:function(e,t,n){var o,a=this.cache(e);if(typeof t=="string")a[Oe(t)]=n;else for(o in t)a[Oe(o)]=t[o];return a},get:function(e,t){return t===void 0?this.cache(e):e[this.expando]&&e[this.expando][Oe(t)]},access:function(e,t,n){return t===void 0||t&&typeof t=="string"&&n===void 0?this.get(e,t):(this.set(e,t,n),n!==void 0?n:t)},remove:function(e,t){var n,o=e[this.expando];if(o!==void 0){if(t!==void 0)for(n=(t=Array.isArray(t)?t.map(Oe):(t=Oe(t))in o?[t]:t.match(Je)||[]).length;n--;)delete o[t[n]];(t===void 0||i.isEmptyObject(o))&&(e.nodeType?e[this.expando]=void 0:delete e[this.expando])}},hasData:function(e){var t=e[this.expando];return t!==void 0&&!i.isEmptyObject(t)}};var V=new zt,Ie=new zt,no=/^(?:\{[\w\W]*\}|\[[\w\W]*\])$/,oo=/[A-Z]/g;function pn(e,t,n){var o,a;if(n===void 0&&e.nodeType===1)if(o="data-"+t.replace(oo,"-$&").toLowerCase(),typeof(n=e.getAttribute(o))=="string"){try{n=(a=n)==="true"||a!=="false"&&(a==="null"?null:a===+a+""?+a:no.test(a)?JSON.parse(a):a)}catch{}Ie.set(e,t,n)}else n=void 0;return n}i.extend({hasData:function(e){return Ie.hasData(e)||V.hasData(e)},data:function(e,t,n){return Ie.access(e,t,n)},removeData:function(e,t){Ie.remove(e,t)},_data:function(e,t,n){return V.access(e,t,n)},_removeData:function(e,t){V.remove(e,t)}}),i.fn.extend({data:function(e,t){var n,o,a,r=this[0],s=r&&r.attributes;if(e===void 0){if(this.length&&(a=Ie.get(r),r.nodeType===1&&!V.get(r,"hasDataAttrs"))){for(n=s.length;n--;)s[n]&&(o=s[n].name).indexOf("data-")===0&&(o=Oe(o.slice(5)),pn(r,o,a[o]));V.set(r,"hasDataAttrs",!0)}return a}return typeof e=="object"?this.each(function(){Ie.set(this,e)}):Te(this,function(f){var d;if(r&&f===void 0)return(d=Ie.get(r,e))!==void 0||(d=pn(r,e))!==void 0?d:void 0;this.each(function(){Ie.set(this,e,f)})},null,t,1<arguments.length,null,!0)},removeData:function(e){return this.each(function(){Ie.remove(this,e)})}}),i.extend({queue:function(e,t,n){var o;if(e)return t=(t||"fx")+"queue",o=V.get(e,t),n&&(!o||Array.isArray(n)?o=V.access(e,t,i.makeArray(n)):o.push(n)),o||[]},dequeue:function(e,t){t=t||"fx";var n=i.queue(e,t),o=n.length,a=n.shift(),r=i._queueHooks(e,t);a==="inprogress"&&(a=n.shift(),o--),a&&(t==="fx"&&n.unshift("inprogress"),delete r.stop,a.call(e,function(){i.dequeue(e,t)},r)),!o&&r&&r.empty.fire()},_queueHooks:function(e,t){var n=t+"queueHooks";return V.get(e,n)||V.access(e,n,{empty:i.Callbacks("once memory").add(function(){V.remove(e,[t+"queue",n])})})}}),i.fn.extend({queue:function(e,t){var n=2;return typeof e!="string"&&(t=e,e="fx",n--),arguments.length<n?i.queue(this[0],e):t===void 0?this:this.each(function(){var o=i.queue(this,e,t);i._queueHooks(this,e),e==="fx"&&o[0]!=="inprogress"&&i.dequeue(this,e)})},dequeue:function(e){return this.each(function(){i.dequeue(this,e)})},clearQueue:function(e){return this.queue(e||"fx",[])},promise:function(e,t){var n,o=1,a=i.Deferred(),r=this,s=this.length,f=function(){--o||a.resolveWith(r,[r])};for(typeof e!="string"&&(t=e,e=void 0),e=e||"fx";s--;)(n=V.get(r[s],e+"queueHooks"))&&n.empty&&(o++,n.empty.add(f));return f(),a.promise(t)}});var dn=/[+-]?(?:\d*\.|)\d+(?:[eE][+-]?\d+|)/.source,wt=new RegExp("^(?:([+-])=|)("+dn+")([a-z%]*)$","i"),Fe=["Top","Right","Bottom","Left"],it=J.documentElement,ft=function(e){return i.contains(e.ownerDocument,e)},Tn={composed:!0};it.getRootNode&&(ft=function(e){return i.contains(e.ownerDocument,e)||e.getRootNode(Tn)===e.ownerDocument});var Gt=function(e,t){return(e=t||e).style.display==="none"||e.style.display===""&&ft(e)&&i.css(e,"display")==="none"};function On(e,t,n,o){var a,r,s=20,f=o?function(){return o.cur()}:function(){return i.css(e,t,"")},d=f(),m=n&&n[3]||(i.cssNumber[t]?"":"px"),y=e.nodeType&&(i.cssNumber[t]||m!=="px"&&+d)&&wt.exec(i.css(e,t));if(y&&y[3]!==m){for(d/=2,m=m||y[3],y=+d||1;s--;)i.style(e,t,y+m),(1-r)*(1-(r=f()/d||.5))<=0&&(s=0),y/=r;y*=2,i.style(e,t,y+m),n=n||[]}return n&&(y=+y||+d||0,a=n[1]?y+(n[1]+1)*n[2]:+n[2],o&&(o.unit=m,o.start=y,o.end=a)),a}var fn={};function Rt(e,t){for(var n,o,a,r,s,f,d,m=[],y=0,S=e.length;y<S;y++)(o=e[y]).style&&(n=o.style.display,t?(n==="none"&&(m[y]=V.get(o,"display")||null,m[y]||(o.style.display="")),o.style.display===""&&Gt(o)&&(m[y]=(d=s=r=void 0,s=(a=o).ownerDocument,f=a.nodeName,(d=fn[f])||(r=s.body.appendChild(s.createElement(f)),d=i.css(r,"display"),r.parentNode.removeChild(r),d==="none"&&(d="block"),fn[f]=d)))):n!=="none"&&(m[y]="none",V.set(o,"display",n)));for(y=0;y<S;y++)m[y]!=null&&(e[y].style.display=m[y]);return e}i.fn.extend({show:function(){return Rt(this,!0)},hide:function(){return Rt(this)},toggle:function(e){return typeof e=="boolean"?e?this.show():this.hide():this.each(function(){Gt(this)?i(this).show():i(this).hide()})}});var St,hn,Xt=/^(?:checkbox|radio)$/i,zn=/<([a-z][^\/\0>\x20\t\r\n\f]*)/i,io=/^$|^module$|\/(?:java|ecma)script/i;St=J.createDocumentFragment().appendChild(J.createElement("div")),(hn=J.createElement("input")).setAttribute("type","radio"),hn.setAttribute("checked","checked"),hn.setAttribute("name","t"),St.appendChild(hn),P.checkClone=St.cloneNode(!0).cloneNode(!0).lastChild.checked,St.innerHTML="<textarea>x</textarea>",P.noCloneChecked=!!St.cloneNode(!0).lastChild.defaultValue,St.innerHTML="<option></option>",P.option=!!St.lastChild;var Ze={thead:[1,"<table>","</table>"],col:[2,"<table><colgroup>","</colgroup></table>"],tr:[2,"<table><tbody>","</tbody></table>"],td:[3,"<table><tbody><tr>","</tr></tbody></table>"],_default:[0,"",""]};function Me(e,t){var n;return n=typeof e.getElementsByTagName<"u"?e.getElementsByTagName(t||"*"):typeof e.querySelectorAll<"u"?e.querySelectorAll(t||"*"):[],t===void 0||t&&fe(e,t)?i.merge([e],n):n}function Gn(e,t){for(var n=0,o=e.length;n<o;n++)V.set(e[n],"globalEval",!t||V.get(t[n],"globalEval"))}Ze.tbody=Ze.tfoot=Ze.colgroup=Ze.caption=Ze.thead,Ze.th=Ze.td,P.option||(Ze.optgroup=Ze.option=[1,"<select multiple='multiple'>","</select>"]);var zo=/<|&#?\w+;/;function So(e,t,n,o,a){for(var r,s,f,d,m,y,S=t.createDocumentFragment(),v=[],D=0,N=e.length;D<N;D++)if((r=e[D])||r===0)if(jt(r)==="object")i.merge(v,r.nodeType?[r]:r);else if(zo.test(r)){for(s=s||S.appendChild(t.createElement("div")),f=(zn.exec(r)||["",""])[1].toLowerCase(),d=Ze[f]||Ze._default,s.innerHTML=d[1]+i.htmlPrefilter(r)+d[2],y=d[0];y--;)s=s.lastChild;i.merge(v,s.childNodes),(s=S.firstChild).textContent=""}else v.push(t.createTextNode(r));for(S.textContent="",D=0;r=v[D++];)if(o&&-1<i.inArray(r,o))a&&a.push(r);else if(m=ft(r),s=Me(S.appendChild(r),"script"),m&&Gn(s),n)for(y=0;r=s[y++];)io.test(r.type||"")&&n.push(r);return S}var ko=/^([^.]*)(?:\.(.+)|)/;function ht(){return!0}function _e(){return!1}function $e(e,t,n,o,a,r){var s,f;if(typeof t=="object"){for(f in typeof n!="string"&&(o=o||n,n=void 0),t)$e(e,f,n,o,t[f],r);return e}if(o==null&&a==null?(a=n,o=n=void 0):a==null&&(typeof n=="string"?(a=o,o=void 0):(a=o,o=n,n=void 0)),a===!1)a=_e;else if(!a)return e;return r===1&&(s=a,(a=function(d){return i().off(d),s.apply(this,arguments)}).guid=s.guid||(s.guid=i.guid++)),e.each(function(){i.event.add(this,t,a,o,n)})}function kt(e,t,n){n?(V.set(e,t,!1),i.event.add(e,t,{namespace:!1,handler:function(o){var a,r=V.get(this,t);if(1&o.isTrigger&&this[t]){if(r)(i.event.special[t]||{}).delegateType&&o.stopPropagation();else if(r=be.call(arguments),V.set(this,t,r),this[t](),a=V.get(this,t),V.set(this,t,!1),r!==a)return o.stopImmediatePropagation(),o.preventDefault(),a}else r&&(V.set(this,t,i.event.trigger(r[0],r.slice(1),this)),o.stopPropagation(),o.isImmediatePropagationStopped=ht)}})):V.get(e,t)===void 0&&i.event.add(e,t,ht)}i.event={global:{},add:function(e,t,n,o,a){var r,s,f,d,m,y,S,v,D,N,F,Z=V.get(e);if(Ct(e))for(n.handler&&(n=(r=n).handler,a=r.selector),a&&i.find.matchesSelector(it,a),n.guid||(n.guid=i.guid++),(d=Z.events)||(d=Z.events=Object.create(null)),(s=Z.handle)||(s=Z.handle=function(xe){return typeof i<"u"&&i.event.triggered!==xe.type?i.event.dispatch.apply(e,arguments):void 0}),m=(t=(t||"").match(Je)||[""]).length;m--;)D=F=(f=ko.exec(t[m])||[])[1],N=(f[2]||"").split(".").sort(),D&&(S=i.event.special[D]||{},D=(a?S.delegateType:S.bindType)||D,S=i.event.special[D]||{},y=i.extend({type:D,origType:F,data:o,handler:n,guid:n.guid,selector:a,needsContext:a&&i.expr.match.needsContext.test(a),namespace:N.join(".")},r),(v=d[D])||((v=d[D]=[]).delegateCount=0,S.setup&&S.setup.call(e,o,N,s)!==!1||e.addEventListener&&e.addEventListener(D,s)),S.add&&(S.add.call(e,y),y.handler.guid||(y.handler.guid=n.guid)),a?v.splice(v.delegateCount++,0,y):v.push(y),i.event.global[D]=!0)},remove:function(e,t,n,o,a){var r,s,f,d,m,y,S,v,D,N,F,Z=V.hasData(e)&&V.get(e);if(Z&&(d=Z.events)){for(m=(t=(t||"").match(Je)||[""]).length;m--;)if(D=F=(f=ko.exec(t[m])||[])[1],N=(f[2]||"").split(".").sort(),D){for(S=i.event.special[D]||{},v=d[D=(o?S.delegateType:S.bindType)||D]||[],f=f[2]&&new RegExp("(^|\\.)"+N.join("\\.(?:.*\\.|)")+"(\\.|$)"),s=r=v.length;r--;)y=v[r],!a&&F!==y.origType||n&&n.guid!==y.guid||f&&!f.test(y.namespace)||o&&o!==y.selector&&(o!=="**"||!y.selector)||(v.splice(r,1),y.selector&&v.delegateCount--,S.remove&&S.remove.call(e,y));s&&!v.length&&(S.teardown&&S.teardown.call(e,N,Z.handle)!==!1||i.removeEvent(e,D,Z.handle),delete d[D])}else for(D in d)i.event.remove(e,D+t[m],n,o,!0);i.isEmptyObject(d)&&V.remove(e,"handle events")}},dispatch:function(e){var t,n,o,a,r,s,f=new Array(arguments.length),d=i.event.fix(e),m=(V.get(this,"events")||Object.create(null))[d.type]||[],y=i.event.special[d.type]||{};for(f[0]=d,t=1;t<arguments.length;t++)f[t]=arguments[t];if(d.delegateTarget=this,!y.preDispatch||y.preDispatch.call(this,d)!==!1){for(s=i.event.handlers.call(this,d,m),t=0;(a=s[t++])&&!d.isPropagationStopped();)for(d.currentTarget=a.elem,n=0;(r=a.handlers[n++])&&!d.isImmediatePropagationStopped();)d.rnamespace&&r.namespace!==!1&&!d.rnamespace.test(r.namespace)||(d.handleObj=r,d.data=r.data,(o=((i.event.special[r.origType]||{}).handle||r.handler).apply(a.elem,f))!==void 0&&(d.result=o)===!1&&(d.preventDefault(),d.stopPropagation()));return y.postDispatch&&y.postDispatch.call(this,d),d.result}},handlers:function(e,t){var n,o,a,r,s,f=[],d=t.delegateCount,m=e.target;if(d&&m.nodeType&&!(e.type==="click"&&1<=e.button)){for(;m!==this;m=m.parentNode||this)if(m.nodeType===1&&(e.type!=="click"||m.disabled!==!0)){for(r=[],s={},n=0;n<d;n++)s[a=(o=t[n]).selector+" "]===void 0&&(s[a]=o.needsContext?-1<i(a,this).index(m):i.find(a,this,null,[m]).length),s[a]&&r.push(o);r.length&&f.push({elem:m,handlers:r})}}return m=this,d<t.length&&f.push({elem:m,handlers:t.slice(d)}),f},addProp:function(e,t){Object.defineProperty(i.Event.prototype,e,{enumerable:!0,configurable:!0,get:Y(t)?function(){if(this.originalEvent)return t(this.originalEvent)}:function(){if(this.originalEvent)return this.originalEvent[e]},set:function(n){Object.defineProperty(this,e,{enumerable:!0,configurable:!0,writable:!0,value:n})}})},fix:function(e){return e[i.expando]?e:new i.Event(e)},special:{load:{noBubble:!0},click:{setup:function(e){var t=this||e;return Xt.test(t.type)&&t.click&&fe(t,"input")&&kt(t,"click",!0),!1},trigger:function(e){var t=this||e;return Xt.test(t.type)&&t.click&&fe(t,"input")&&kt(t,"click"),!0},_default:function(e){var t=e.target;return Xt.test(t.type)&&t.click&&fe(t,"input")&&V.get(t,"click")||fe(t,"a")}},beforeunload:{postDispatch:function(e){e.result!==void 0&&e.originalEvent&&(e.originalEvent.returnValue=e.result)}}}},i.removeEvent=function(e,t,n){e.removeEventListener&&e.removeEventListener(t,n)},i.Event=function(e,t){if(!(this instanceof i.Event))return new i.Event(e,t);e&&e.type?(this.originalEvent=e,this.type=e.type,this.isDefaultPrevented=e.defaultPrevented||e.defaultPrevented===void 0&&e.returnValue===!1?ht:_e,this.target=e.target&&e.target.nodeType===3?e.target.parentNode:e.target,this.currentTarget=e.currentTarget,this.relatedTarget=e.relatedTarget):this.type=e,t&&i.extend(this,t),this.timeStamp=e&&e.timeStamp||Date.now(),this[i.expando]=!0},i.Event.prototype={constructor:i.Event,isDefaultPrevented:_e,isPropagationStopped:_e,isImmediatePropagationStopped:_e,isSimulated:!1,preventDefault:function(){var e=this.originalEvent;this.isDefaultPrevented=ht,e&&!this.isSimulated&&e.preventDefault()},stopPropagation:function(){var e=this.originalEvent;this.isPropagationStopped=ht,e&&!this.isSimulated&&e.stopPropagation()},stopImmediatePropagation:function(){var e=this.originalEvent;this.isImmediatePropagationStopped=ht,e&&!this.isSimulated&&e.stopImmediatePropagation(),this.stopPropagation()}},i.each({altKey:!0,bubbles:!0,cancelable:!0,changedTouches:!0,ctrlKey:!0,detail:!0,eventPhase:!0,metaKey:!0,pageX:!0,pageY:!0,shiftKey:!0,view:!0,char:!0,code:!0,charCode:!0,key:!0,keyCode:!0,button:!0,buttons:!0,clientX:!0,clientY:!0,offsetX:!0,offsetY:!0,pointerId:!0,pointerType:!0,screenX:!0,screenY:!0,targetTouches:!0,toElement:!0,touches:!0,which:!0},i.event.addProp),i.each({focus:"focusin",blur:"focusout"},function(e,t){function n(o){if(J.documentMode){var a=V.get(this,"handle"),r=i.event.fix(o);r.type=o.type==="focusin"?"focus":"blur",r.isSimulated=!0,a(o),r.target===r.currentTarget&&a(r)}else i.event.simulate(t,o.target,i.event.fix(o))}i.event.special[e]={setup:function(){var o;if(kt(this,e,!0),!J.documentMode)return!1;(o=V.get(this,t))||this.addEventListener(t,n),V.set(this,t,(o||0)+1)},trigger:function(){return kt(this,e),!0},teardown:function(){var o;if(!J.documentMode)return!1;(o=V.get(this,t)-1)?V.set(this,t,o):(this.removeEventListener(t,n),V.remove(this,t))},_default:function(o){return V.get(o.target,e)},delegateType:t},i.event.special[t]={setup:function(){var o=this.ownerDocument||this.document||this,a=J.documentMode?this:o,r=V.get(a,t);r||(J.documentMode?this.addEventListener(t,n):o.addEventListener(e,n,!0)),V.set(a,t,(r||0)+1)},teardown:function(){var o=this.ownerDocument||this.document||this,a=J.documentMode?this:o,r=V.get(a,t)-1;r?V.set(a,t,r):(J.documentMode?this.removeEventListener(t,n):o.removeEventListener(e,n,!0),V.remove(a,t))}}}),i.each({mouseenter:"mouseover",mouseleave:"mouseout",pointerenter:"pointerover",pointerleave:"pointerout"},function(e,t){i.event.special[e]={delegateType:t,bindType:t,handle:function(n){var o,a=n.relatedTarget,r=n.handleObj;return a&&(a===this||i.contains(this,a))||(n.type=r.origType,o=r.handler.apply(this,arguments),n.type=t),o}}}),i.fn.extend({on:function(e,t,n,o){return $e(this,e,t,n,o)},one:function(e,t,n,o){return $e(this,e,t,n,o,1)},off:function(e,t,n){var o,a;if(e&&e.preventDefault&&e.handleObj)return o=e.handleObj,i(e.delegateTarget).off(o.namespace?o.origType+"."+o.namespace:o.origType,o.selector,o.handler),this;if(typeof e=="object"){for(a in e)this.off(a,t,e[a]);return this}return t!==!1&&typeof t!="function"||(n=t,t=void 0),n===!1&&(n=_e),this.each(function(){i.event.remove(this,e,n,t)})}});var Rn=/<script|<style|<link/i,ao=/checked\s*(?:[^=]|=\s*.checked.)/i,mn=/^\s*<!\[CDATA\[|\]\]>\s*$/g;function ro(e,t){return fe(e,"table")&&fe(t.nodeType!==11?t:t.firstChild,"tr")&&i(e).children("tbody")[0]||e}function Dt(e){return e.type=(e.getAttribute("type")!==null)+"/"+e.type,e}function gn(e){return(e.type||"").slice(0,5)==="true/"?e.type=e.type.slice(5):e.removeAttribute("type"),e}function Ut(e,t){var n,o,a,r,s,f;if(t.nodeType===1){if(V.hasData(e)&&(f=V.get(e).events))for(a in V.remove(t,"handle events"),f)for(n=0,o=f[a].length;n<o;n++)i.event.add(t,a,f[a][n]);Ie.hasData(e)&&(r=Ie.access(e),s=i.extend({},r),Ie.set(t,s))}}function et(e,t,n,o){t=l(t);var a,r,s,f,d,m,y=0,S=e.length,v=S-1,D=t[0],N=Y(D);if(N||1<S&&typeof D=="string"&&!P.checkClone&&ao.test(D))return e.each(function(F){var Z=e.eq(F);N&&(t[0]=D.call(this,F,Z.html())),et(Z,t,n,o)});if(S&&(r=(a=So(t,e[0].ownerDocument,!1,e,o)).firstChild,a.childNodes.length===1&&(a=r),r||o)){for(f=(s=i.map(Me(a,"script"),Dt)).length;y<S;y++)d=a,y!==v&&(d=i.clone(d,!0,!0),f&&i.merge(s,Me(d,"script"))),n.call(e[y],d,y);if(f)for(m=s[s.length-1].ownerDocument,i.map(s,gn),y=0;y<f;y++)d=s[y],io.test(d.type||"")&&!V.access(d,"globalEval")&&i.contains(m,d)&&(d.src&&(d.type||"").toLowerCase()!=="module"?i._evalUrl&&!d.noModule&&i._evalUrl(d.src,{nonce:d.nonce||d.getAttribute("nonce")},m):Yn(d.textContent.replace(mn,""),d,m))}return e}function Re(e,t,n){for(var o,a=t?i.filter(t,e):e,r=0;(o=a[r])!=null;r++)n||o.nodeType!==1||i.cleanData(Me(o)),o.parentNode&&(n&&ft(o)&&Gn(Me(o,"script")),o.parentNode.removeChild(o));return e}i.extend({htmlPrefilter:function(e){return e},clone:function(e,t,n){var o,a,r,s,f,d,m,y=e.cloneNode(!0),S=ft(e);if(!(P.noCloneChecked||e.nodeType!==1&&e.nodeType!==11||i.isXMLDoc(e)))for(s=Me(y),o=0,a=(r=Me(e)).length;o<a;o++)f=r[o],d=s[o],(m=d.nodeName.toLowerCase())==="input"&&Xt.test(f.type)?d.checked=f.checked:m!=="input"&&m!=="textarea"||(d.defaultValue=f.defaultValue);if(t)if(n)for(r=r||Me(e),s=s||Me(y),o=0,a=r.length;o<a;o++)Ut(r[o],s[o]);else Ut(e,y);return 0<(s=Me(y,"script")).length&&Gn(s,!S&&Me(e,"script")),y},cleanData:function(e){for(var t,n,o,a=i.event.special,r=0;(n=e[r])!==void 0;r++)if(Ct(n)){if(t=n[V.expando]){if(t.events)for(o in t.events)a[o]?i.event.remove(n,o):i.removeEvent(n,o,t.handle);n[V.expando]=void 0}n[Ie.expando]&&(n[Ie.expando]=void 0)}}}),i.fn.extend({detach:function(e){return Re(this,e,!0)},remove:function(e){return Re(this,e)},text:function(e){return Te(this,function(t){return t===void 0?i.text(this):this.empty().each(function(){this.nodeType!==1&&this.nodeType!==11&&this.nodeType!==9||(this.textContent=t)})},null,e,arguments.length)},append:function(){return et(this,arguments,function(e){this.nodeType!==1&&this.nodeType!==11&&this.nodeType!==9||ro(this,e).appendChild(e)})},prepend:function(){return et(this,arguments,function(e){if(this.nodeType===1||this.nodeType===11||this.nodeType===9){var t=ro(this,e);t.insertBefore(e,t.firstChild)}})},before:function(){return et(this,arguments,function(e){this.parentNode&&this.parentNode.insertBefore(e,this)})},after:function(){return et(this,arguments,function(e){this.parentNode&&this.parentNode.insertBefore(e,this.nextSibling)})},empty:function(){for(var e,t=0;(e=this[t])!=null;t++)e.nodeType===1&&(i.cleanData(Me(e,!1)),e.textContent="");return this},clone:function(e,t){return e=e!=null&&e,t=t??e,this.map(function(){return i.clone(this,e,t)})},html:function(e){return Te(this,function(t){var n=this[0]||{},o=0,a=this.length;if(t===void 0&&n.nodeType===1)return n.innerHTML;if(typeof t=="string"&&!Rn.test(t)&&!Ze[(zn.exec(t)||["",""])[1].toLowerCase()]){t=i.htmlPrefilter(t);try{for(;o<a;o++)(n=this[o]||{}).nodeType===1&&(i.cleanData(Me(n,!1)),n.innerHTML=t);n=0}catch{}}n&&this.empty().append(t)},null,e,arguments.length)},replaceWith:function(){var e=[];return et(this,arguments,function(t){var n=this.parentNode;i.inArray(this,e)<0&&(i.cleanData(Me(this)),n&&n.replaceChild(t,this))},e)}}),i.each({appendTo:"append",prependTo:"prepend",insertBefore:"before",insertAfter:"after",replaceAll:"replaceWith"},function(e,t){i.fn[e]=function(n){for(var o,a=[],r=i(n),s=r.length-1,f=0;f<=s;f++)o=f===s?this:this.clone(!0),i(r[f])[t](o),w.apply(a,o.get());return this.pushStack(a)}});var Ue=new RegExp("^("+dn+")(?!px)[a-z%]+$","i"),at=/^--/,mt=function(e){var t=e.ownerDocument.defaultView;return t&&t.opener||(t=E),t.getComputedStyle(e)},Un=function(e,t,n){var o,a,r={};for(a in t)r[a]=e.style[a],e.style[a]=t[a];for(a in o=n.call(e),t)e.style[a]=r[a];return o},so=new RegExp(Fe.join("|"),"i");function vn(e,t,n){var o,a,r,s,f=at.test(t),d=e.style;return(n=n||mt(e))&&(s=n.getPropertyValue(t)||n[t],f&&s&&(s=s.replace(Zt,"$1")||void 0),s!==""||ft(e)||(s=i.style(e,t)),!P.pixelBoxStyles()&&Ue.test(s)&&so.test(t)&&(o=d.width,a=d.minWidth,r=d.maxWidth,d.minWidth=d.maxWidth=d.width=s,s=n.width,d.width=o,d.minWidth=a,d.maxWidth=r)),s!==void 0?s+"":s}function lo(e,t){return{get:function(){if(!e())return(this.get=t).apply(this,arguments);delete this.get}}}(function(){function e(){if(m){d.style.cssText="position:absolute;left:-11111px;width:60px;margin-top:1px;padding:0;border:0",m.style.cssText="position:relative;display:block;box-sizing:border-box;overflow:scroll;margin:auto;border:1px;padding:1px;width:60%;top:1%",it.appendChild(d).appendChild(m);var y=E.getComputedStyle(m);n=y.top!=="1%",f=t(y.marginLeft)===12,m.style.right="60%",r=t(y.right)===36,o=t(y.width)===36,m.style.position="absolute",a=t(m.offsetWidth/3)===12,it.removeChild(d),m=null}}function t(y){return Math.round(parseFloat(y))}var n,o,a,r,s,f,d=J.createElement("div"),m=J.createElement("div");m.style&&(m.style.backgroundClip="content-box",m.cloneNode(!0).style.backgroundClip="",P.clearCloneStyle=m.style.backgroundClip==="content-box",i.extend(P,{boxSizingReliable:function(){return e(),o},pixelBoxStyles:function(){return e(),r},pixelPosition:function(){return e(),n},reliableMarginLeft:function(){return e(),f},scrollboxSize:function(){return e(),a},reliableTrDimensions:function(){var y,S,v,D;return s==null&&(y=J.createElement("table"),S=J.createElement("tr"),v=J.createElement("div"),y.style.cssText="position:absolute;left:-11111px;border-collapse:separate",S.style.cssText="box-sizing:content-box;border:1px solid",S.style.height="1px",v.style.height="9px",v.style.display="block",it.appendChild(y).appendChild(S).appendChild(v),D=E.getComputedStyle(S),s=parseInt(D.height,10)+parseInt(D.borderTopWidth,10)+parseInt(D.borderBottomWidth,10)===S.offsetHeight,it.removeChild(y)),s}}))})();var co=["Webkit","Moz","ms"],Vn=J.createElement("div").style,Yt={};function uo(e){var t=i.cssProps[e]||Yt[e];return t||(e in Vn?e:Yt[e]=(function(n){for(var o=n[0].toUpperCase()+n.slice(1),a=co.length;a--;)if((n=co[a]+o)in Vn)return n})(e)||e)}var L=/^(none|table(?!-c[ea]).+)/,po={position:"absolute",visibility:"hidden",display:"block"},Nn={letterSpacing:"0",fontWeight:"400"};function yn(e,t,n){var o=wt.exec(t);return o?Math.max(0,o[2]-(n||0))+(o[3]||"px"):t}function Vt(e,t,n,o,a,r){var s=t==="width"?1:0,f=0,d=0,m=0;if(n===(o?"border":"content"))return 0;for(;s<4;s+=2)n==="margin"&&(m+=i.css(e,n+Fe[s],!0,a)),o?(n==="content"&&(d-=i.css(e,"padding"+Fe[s],!0,a)),n!=="margin"&&(d-=i.css(e,"border"+Fe[s]+"Width",!0,a))):(d+=i.css(e,"padding"+Fe[s],!0,a),n!=="padding"?d+=i.css(e,"border"+Fe[s]+"Width",!0,a):f+=i.css(e,"border"+Fe[s]+"Width",!0,a));return!o&&0<=r&&(d+=Math.max(0,Math.ceil(e["offset"+t[0].toUpperCase()+t.slice(1)]-r-d-f-.5))||0),d+m}function Do(e,t,n){var o=mt(e),a=(!P.boxSizingReliable()||n)&&i.css(e,"boxSizing",!1,o)==="border-box",r=a,s=vn(e,t,o),f="offset"+t[0].toUpperCase()+t.slice(1);if(Ue.test(s)){if(!n)return s;s="auto"}return(!P.boxSizingReliable()&&a||!P.reliableTrDimensions()&&fe(e,"tr")||s==="auto"||!parseFloat(s)&&i.css(e,"display",!1,o)==="inline")&&e.getClientRects().length&&(a=i.css(e,"boxSizing",!1,o)==="border-box",(r=f in e)&&(s=e[f])),(s=parseFloat(s)||0)+Vt(e,t,n||(a?"border":"content"),r,o,s)+"px"}function Ve(e,t,n,o,a){return new Ve.prototype.init(e,t,n,o,a)}i.extend({cssHooks:{opacity:{get:function(e,t){if(t){var n=vn(e,"opacity");return n===""?"1":n}}}},cssNumber:{animationIterationCount:!0,aspectRatio:!0,borderImageSlice:!0,columnCount:!0,flexGrow:!0,flexShrink:!0,fontWeight:!0,gridArea:!0,gridColumn:!0,gridColumnEnd:!0,gridColumnStart:!0,gridRow:!0,gridRowEnd:!0,gridRowStart:!0,lineHeight:!0,opacity:!0,order:!0,orphans:!0,scale:!0,widows:!0,zIndex:!0,zoom:!0,fillOpacity:!0,floodOpacity:!0,stopOpacity:!0,strokeMiterlimit:!0,strokeOpacity:!0},cssProps:{},style:function(e,t,n,o){if(e&&e.nodeType!==3&&e.nodeType!==8&&e.style){var a,r,s,f=Oe(t),d=at.test(t),m=e.style;if(d||(t=uo(f)),s=i.cssHooks[t]||i.cssHooks[f],n===void 0)return s&&"get"in s&&(a=s.get(e,!1,o))!==void 0?a:m[t];(r=typeof n)=="string"&&(a=wt.exec(n))&&a[1]&&(n=On(e,t,a),r="number"),n!=null&&n==n&&(r!=="number"||d||(n+=a&&a[3]||(i.cssNumber[f]?"":"px")),P.clearCloneStyle||n!==""||t.indexOf("background")!==0||(m[t]="inherit"),s&&"set"in s&&(n=s.set(e,n,o))===void 0||(d?m.setProperty(t,n):m[t]=n))}},css:function(e,t,n,o){var a,r,s,f=Oe(t);return at.test(t)||(t=uo(f)),(s=i.cssHooks[t]||i.cssHooks[f])&&"get"in s&&(a=s.get(e,!0,n)),a===void 0&&(a=vn(e,t,o)),a==="normal"&&t in Nn&&(a=Nn[t]),n===""||n?(r=parseFloat(a),n===!0||isFinite(r)?r||0:a):a}}),i.each(["height","width"],function(e,t){i.cssHooks[t]={get:function(n,o,a){if(o)return!L.test(i.css(n,"display"))||n.getClientRects().length&&n.getBoundingClientRect().width?Do(n,t,a):Un(n,po,function(){return Do(n,t,a)})},set:function(n,o,a){var r,s=mt(n),f=!P.scrollboxSize()&&s.position==="absolute",d=(f||a)&&i.css(n,"boxSizing",!1,s)==="border-box",m=a?Vt(n,t,a,d,s):0;return d&&f&&(m-=Math.ceil(n["offset"+t[0].toUpperCase()+t.slice(1)]-parseFloat(s[t])-Vt(n,t,"border",!1,s)-.5)),m&&(r=wt.exec(o))&&(r[3]||"px")!=="px"&&(n.style[t]=o,o=i.css(n,t)),yn(0,o,m)}}}),i.cssHooks.marginLeft=lo(P.reliableMarginLeft,function(e,t){if(t)return(parseFloat(vn(e,"marginLeft"))||e.getBoundingClientRect().left-Un(e,{marginLeft:0},function(){return e.getBoundingClientRect().left}))+"px"}),i.each({margin:"",padding:"",border:"Width"},function(e,t){i.cssHooks[e+t]={expand:function(n){for(var o=0,a={},r=typeof n=="string"?n.split(" "):[n];o<4;o++)a[e+Fe[o]+t]=r[o]||r[o-2]||r[0];return a}},e!=="margin"&&(i.cssHooks[e+t].set=yn)}),i.fn.extend({css:function(e,t){return Te(this,function(n,o,a){var r,s,f={},d=0;if(Array.isArray(o)){for(r=mt(n),s=o.length;d<s;d++)f[o[d]]=i.css(n,o[d],!1,r);return f}return a!==void 0?i.style(n,o,a):i.css(n,o)},e,t,1<arguments.length)}}),((i.Tween=Ve).prototype={constructor:Ve,init:function(e,t,n,o,a,r){this.elem=e,this.prop=n,this.easing=a||i.easing._default,this.options=t,this.start=this.now=this.cur(),this.end=o,this.unit=r||(i.cssNumber[n]?"":"px")},cur:function(){var e=Ve.propHooks[this.prop];return e&&e.get?e.get(this):Ve.propHooks._default.get(this)},run:function(e){var t,n=Ve.propHooks[this.prop];return this.options.duration?this.pos=t=i.easing[this.easing](e,this.options.duration*e,0,1,this.options.duration):this.pos=t=e,this.now=(this.end-this.start)*t+this.start,this.options.step&&this.options.step.call(this.elem,this.now,this),n&&n.set?n.set(this):Ve.propHooks._default.set(this),this}}).init.prototype=Ve.prototype,(Ve.propHooks={_default:{get:function(e){var t;return e.elem.nodeType!==1||e.elem[e.prop]!=null&&e.elem.style[e.prop]==null?e.elem[e.prop]:(t=i.css(e.elem,e.prop,""))&&t!=="auto"?t:0},set:function(e){i.fx.step[e.prop]?i.fx.step[e.prop](e):e.elem.nodeType!==1||!i.cssHooks[e.prop]&&e.elem.style[uo(e.prop)]==null?e.elem[e.prop]=e.now:i.style(e.elem,e.prop,e.now+e.unit)}}}).scrollTop=Ve.propHooks.scrollLeft={set:function(e){e.elem.nodeType&&e.elem.parentNode&&(e.elem[e.prop]=e.now)}},i.easing={linear:function(e){return e},swing:function(e){return .5-Math.cos(e*Math.PI)/2},_default:"swing"},i.fx=Ve.prototype.init,i.fx.step={};var Nt,bn,rt,qn,Kn=/^(?:toggle|show|hide)$/,Bo=/queueHooks$/;function Le(){bn&&(J.hidden===!1&&E.requestAnimationFrame?E.requestAnimationFrame(Le):E.setTimeout(Le,i.fx.interval),i.fx.tick())}function xn(){return E.setTimeout(function(){Nt=void 0}),Nt=Date.now()}function An(e,t){var n,o=0,a={height:e};for(t=t?1:0;o<4;o+=2-t)a["margin"+(n=Fe[o])]=a["padding"+n]=e;return t&&(a.opacity=a.width=e),a}function gt(e,t,n){for(var o,a=(Ce.tweeners[t]||[]).concat(Ce.tweeners["*"]),r=0,s=a.length;r<s;r++)if(o=a[r].call(n,t,e))return o}function Ce(e,t,n){var o,a,r=0,s=Ce.prefilters.length,f=i.Deferred().always(function(){delete d.elem}),d=function(){if(a)return!1;for(var S=Nt||xn(),v=Math.max(0,m.startTime+m.duration-S),D=1-(v/m.duration||0),N=0,F=m.tweens.length;N<F;N++)m.tweens[N].run(D);return f.notifyWith(e,[m,D,v]),D<1&&F?v:(F||f.notifyWith(e,[m,1,0]),f.resolveWith(e,[m]),!1)},m=f.promise({elem:e,props:i.extend({},t),opts:i.extend(!0,{specialEasing:{},easing:i.easing._default},n),originalProperties:t,originalOptions:n,startTime:Nt||xn(),duration:n.duration,tweens:[],createTween:function(S,v){var D=i.Tween(e,m.opts,S,v,m.opts.specialEasing[S]||m.opts.easing);return m.tweens.push(D),D},stop:function(S){var v=0,D=S?m.tweens.length:0;if(a)return this;for(a=!0;v<D;v++)m.tweens[v].run(1);return S?(f.notifyWith(e,[m,1,0]),f.resolveWith(e,[m,S])):f.rejectWith(e,[m,S]),this}}),y=m.props;for(!(function(S,v){var D,N,F,Z,xe;for(D in S)if(F=v[N=Oe(D)],Z=S[D],Array.isArray(Z)&&(F=Z[1],Z=S[D]=Z[0]),D!==N&&(S[N]=Z,delete S[D]),(xe=i.cssHooks[N])&&"expand"in xe)for(D in Z=xe.expand(Z),delete S[N],Z)D in S||(S[D]=Z[D],v[D]=F);else v[N]=F})(y,m.opts.specialEasing);r<s;r++)if(o=Ce.prefilters[r].call(m,e,y,m.opts))return Y(o.stop)&&(i._queueHooks(m.elem,m.opts.queue).stop=o.stop.bind(o)),o;return i.map(y,gt,m),Y(m.opts.start)&&m.opts.start.call(e,m),m.progress(m.opts.progress).done(m.opts.done,m.opts.complete).fail(m.opts.fail).always(m.opts.always),i.fx.timer(i.extend(d,{elem:e,anim:m,queue:m.opts.queue})),m}i.Animation=i.extend(Ce,{tweeners:{"*":[function(e,t){var n=this.createTween(e,t);return On(n.elem,e,wt.exec(t),n),n}]},tweener:function(e,t){Y(e)?(t=e,e=["*"]):e=e.match(Je);for(var n,o=0,a=e.length;o<a;o++)n=e[o],Ce.tweeners[n]=Ce.tweeners[n]||[],Ce.tweeners[n].unshift(t)},prefilters:[function(e,t,n){var o,a,r,s,f,d,m,y,S="width"in t||"height"in t,v=this,D={},N=e.style,F=e.nodeType&&Gt(e),Z=V.get(e,"fxshow");for(o in n.queue||((s=i._queueHooks(e,"fx")).unqueued==null&&(s.unqueued=0,f=s.empty.fire,s.empty.fire=function(){s.unqueued||f()}),s.unqueued++,v.always(function(){v.always(function(){s.unqueued--,i.queue(e,"fx").length||s.empty.fire()})})),t)if(a=t[o],Kn.test(a)){if(delete t[o],r=r||a==="toggle",a===(F?"hide":"show")){if(a!=="show"||!Z||Z[o]===void 0)continue;F=!0}D[o]=Z&&Z[o]||i.style(e,o)}if((d=!i.isEmptyObject(t))||!i.isEmptyObject(D))for(o in S&&e.nodeType===1&&(n.overflow=[N.overflow,N.overflowX,N.overflowY],(m=Z&&Z.display)==null&&(m=V.get(e,"display")),(y=i.css(e,"display"))==="none"&&(m?y=m:(Rt([e],!0),m=e.style.display||m,y=i.css(e,"display"),Rt([e]))),(y==="inline"||y==="inline-block"&&m!=null)&&i.css(e,"float")==="none"&&(d||(v.done(function(){N.display=m}),m==null&&(y=N.display,m=y==="none"?"":y)),N.display="inline-block")),n.overflow&&(N.overflow="hidden",v.always(function(){N.overflow=n.overflow[0],N.overflowX=n.overflow[1],N.overflowY=n.overflow[2]})),d=!1,D)d||(Z?"hidden"in Z&&(F=Z.hidden):Z=V.access(e,"fxshow",{display:m}),r&&(Z.hidden=!F),F&&Rt([e],!0),v.done(function(){for(o in F||Rt([e]),V.remove(e,"fxshow"),D)i.style(e,o,D[o])})),d=gt(F?Z[o]:0,o,v),o in Z||(Z[o]=d.start,F&&(d.end=d.start,d.start=0))}],prefilter:function(e,t){t?Ce.prefilters.unshift(e):Ce.prefilters.push(e)}}),i.speed=function(e,t,n){var o=e&&typeof e=="object"?i.extend({},e):{complete:n||!n&&t||Y(e)&&e,duration:e,easing:n&&t||t&&!Y(t)&&t};return i.fx.off?o.duration=0:typeof o.duration!="number"&&(o.duration in i.fx.speeds?o.duration=i.fx.speeds[o.duration]:o.duration=i.fx.speeds._default),o.queue!=null&&o.queue!==!0||(o.queue="fx"),o.old=o.complete,o.complete=function(){Y(o.old)&&o.old.call(this),o.queue&&i.dequeue(this,o.queue)},o},i.fn.extend({fadeTo:function(e,t,n,o){return this.filter(Gt).css("opacity",0).show().end().animate({opacity:t},e,n,o)},animate:function(e,t,n,o){var a=i.isEmptyObject(e),r=i.speed(t,n,o),s=function(){var f=Ce(this,i.extend({},e),r);(a||V.get(this,"finish"))&&f.stop(!0)};return s.finish=s,a||r.queue===!1?this.each(s):this.queue(r.queue,s)},stop:function(e,t,n){var o=function(a){var r=a.stop;delete a.stop,r(n)};return typeof e!="string"&&(n=t,t=e,e=void 0),t&&this.queue(e||"fx",[]),this.each(function(){var a=!0,r=e!=null&&e+"queueHooks",s=i.timers,f=V.get(this);if(r)f[r]&&f[r].stop&&o(f[r]);else for(r in f)f[r]&&f[r].stop&&Bo.test(r)&&o(f[r]);for(r=s.length;r--;)s[r].elem!==this||e!=null&&s[r].queue!==e||(s[r].anim.stop(n),a=!1,s.splice(r,1));!a&&n||i.dequeue(this,e)})},finish:function(e){return e!==!1&&(e=e||"fx"),this.each(function(){var t,n=V.get(this),o=n[e+"queue"],a=n[e+"queueHooks"],r=i.timers,s=o?o.length:0;for(n.finish=!0,i.queue(this,e,[]),a&&a.stop&&a.stop.call(this,!0),t=r.length;t--;)r[t].elem===this&&r[t].queue===e&&(r[t].anim.stop(!0),r.splice(t,1));for(t=0;t<s;t++)o[t]&&o[t].finish&&o[t].finish.call(this);delete n.finish})}}),i.each(["toggle","show","hide"],function(e,t){var n=i.fn[t];i.fn[t]=function(o,a,r){return o==null||typeof o=="boolean"?n.apply(this,arguments):this.animate(An(t,!0),o,a,r)}}),i.each({slideDown:An("show"),slideUp:An("hide"),slideToggle:An("toggle"),fadeIn:{opacity:"show"},fadeOut:{opacity:"hide"},fadeToggle:{opacity:"toggle"}},function(e,t){i.fn[e]=function(n,o,a){return this.animate(t,n,o,a)}}),i.timers=[],i.fx.tick=function(){var e,t=0,n=i.timers;for(Nt=Date.now();t<n.length;t++)(e=n[t])()||n[t]!==e||n.splice(t--,1);n.length||i.fx.stop(),Nt=void 0},i.fx.timer=function(e){i.timers.push(e),i.fx.start()},i.fx.interval=13,i.fx.start=function(){bn||(bn=!0,Le())},i.fx.stop=function(){bn=null},i.fx.speeds={slow:600,fast:200,_default:400},i.fn.delay=function(e,t){return e=i.fx&&i.fx.speeds[e]||e,t=t||"fx",this.queue(t,function(n,o){var a=E.setTimeout(n,e);o.stop=function(){E.clearTimeout(a)}})},rt=J.createElement("input"),qn=J.createElement("select").appendChild(J.createElement("option")),rt.type="checkbox",P.checkOn=rt.value!=="",P.optSelected=qn.selected,(rt=J.createElement("input")).value="t",rt.type="radio",P.radioValue=rt.value==="t";var Pn,Ne=i.expr.attrHandle;i.fn.extend({attr:function(e,t){return Te(this,i.attr,e,t,1<arguments.length)},removeAttr:function(e){return this.each(function(){i.removeAttr(this,e)})}}),i.extend({attr:function(e,t,n){var o,a,r=e.nodeType;if(r!==3&&r!==8&&r!==2)return typeof e.getAttribute>"u"?i.prop(e,t,n):(r===1&&i.isXMLDoc(e)||(a=i.attrHooks[t.toLowerCase()]||(i.expr.match.bool.test(t)?Pn:void 0)),n!==void 0?n===null?void i.removeAttr(e,t):a&&"set"in a&&(o=a.set(e,n,t))!==void 0?o:(e.setAttribute(t,n+""),n):a&&"get"in a&&(o=a.get(e,t))!==null?o:(o=i.find.attr(e,t))==null?void 0:o)},attrHooks:{type:{set:function(e,t){if(!P.radioValue&&t==="radio"&&fe(e,"input")){var n=e.value;return e.setAttribute("type",t),n&&(e.value=n),t}}}},removeAttr:function(e,t){var n,o=0,a=t&&t.match(Je);if(a&&e.nodeType===1)for(;n=a[o++];)e.removeAttribute(n)}}),Pn={set:function(e,t,n){return t===!1?i.removeAttr(e,n):e.setAttribute(n,n),n}},i.each(i.expr.match.bool.source.match(/\w+/g),function(e,t){var n=Ne[t]||i.find.attr;Ne[t]=function(o,a,r){var s,f,d=a.toLowerCase();return r||(f=Ne[d],Ne[d]=s,s=n(o,a,r)!=null?d:null,Ne[d]=f),s}});var Jt=/^(?:input|select|textarea|button)$/i,Cn=/^(?:a|area)$/i;function ze(e){return(e.match(Je)||[]).join(" ")}function qe(e){return e.getAttribute&&e.getAttribute("class")||""}function _t(e){return Array.isArray(e)?e:typeof e=="string"&&e.match(Je)||[]}i.fn.extend({prop:function(e,t){return Te(this,i.prop,e,t,1<arguments.length)},removeProp:function(e){return this.each(function(){delete this[i.propFix[e]||e]})}}),i.extend({prop:function(e,t,n){var o,a,r=e.nodeType;if(r!==3&&r!==8&&r!==2)return r===1&&i.isXMLDoc(e)||(t=i.propFix[t]||t,a=i.propHooks[t]),n!==void 0?a&&"set"in a&&(o=a.set(e,n,t))!==void 0?o:e[t]=n:a&&"get"in a&&(o=a.get(e,t))!==null?o:e[t]},propHooks:{tabIndex:{get:function(e){var t=i.find.attr(e,"tabindex");return t?parseInt(t,10):Jt.test(e.nodeName)||Cn.test(e.nodeName)&&e.href?0:-1}}},propFix:{for:"htmlFor",class:"className"}}),P.optSelected||(i.propHooks.selected={get:function(e){var t=e.parentNode;return t&&t.parentNode&&t.parentNode.selectedIndex,null},set:function(e){var t=e.parentNode;t&&(t.selectedIndex,t.parentNode&&t.parentNode.selectedIndex)}}),i.each(["tabIndex","readOnly","maxLength","cellSpacing","cellPadding","rowSpan","colSpan","useMap","frameBorder","contentEditable"],function(){i.propFix[this.toLowerCase()]=this}),i.fn.extend({addClass:function(e){var t,n,o,a,r,s;return Y(e)?this.each(function(f){i(this).addClass(e.call(this,f,qe(this)))}):(t=_t(e)).length?this.each(function(){if(o=qe(this),n=this.nodeType===1&&" "+ze(o)+" "){for(r=0;r<t.length;r++)a=t[r],n.indexOf(" "+a+" ")<0&&(n+=a+" ");s=ze(n),o!==s&&this.setAttribute("class",s)}}):this},removeClass:function(e){var t,n,o,a,r,s;return Y(e)?this.each(function(f){i(this).removeClass(e.call(this,f,qe(this)))}):arguments.length?(t=_t(e)).length?this.each(function(){if(o=qe(this),n=this.nodeType===1&&" "+ze(o)+" "){for(r=0;r<t.length;r++)for(a=t[r];-1<n.indexOf(" "+a+" ");)n=n.replace(" "+a+" "," ");s=ze(n),o!==s&&this.setAttribute("class",s)}}):this:this.attr("class","")},toggleClass:function(e,t){var n,o,a,r,s=typeof e,f=s==="string"||Array.isArray(e);return Y(e)?this.each(function(d){i(this).toggleClass(e.call(this,d,qe(this),t),t)}):typeof t=="boolean"&&f?t?this.addClass(e):this.removeClass(e):(n=_t(e),this.each(function(){if(f)for(r=i(this),a=0;a<n.length;a++)o=n[a],r.hasClass(o)?r.removeClass(o):r.addClass(o);else e!==void 0&&s!=="boolean"||((o=qe(this))&&V.set(this,"__className__",o),this.setAttribute&&this.setAttribute("class",o||e===!1?"":V.get(this,"__className__")||""))}))},hasClass:function(e){var t,n,o=0;for(t=" "+e+" ";n=this[o++];)if(n.nodeType===1&&-1<(" "+ze(qe(n))+" ").indexOf(t))return!0;return!1}});var Go=/\r/g;i.fn.extend({val:function(e){var t,n,o,a=this[0];return arguments.length?(o=Y(e),this.each(function(r){var s;this.nodeType===1&&((s=o?e.call(this,r,i(this).val()):e)==null?s="":typeof s=="number"?s+="":Array.isArray(s)&&(s=i.map(s,function(f){return f==null?"":f+""})),(t=i.valHooks[this.type]||i.valHooks[this.nodeName.toLowerCase()])&&"set"in t&&t.set(this,s,"value")!==void 0||(this.value=s))})):a?(t=i.valHooks[a.type]||i.valHooks[a.nodeName.toLowerCase()])&&"get"in t&&(n=t.get(a,"value"))!==void 0?n:typeof(n=a.value)=="string"?n.replace(Go,""):n??"":void 0}}),i.extend({valHooks:{option:{get:function(e){var t=i.find.attr(e,"value");return t??ze(i.text(e))}},select:{get:function(e){var t,n,o,a=e.options,r=e.selectedIndex,s=e.type==="select-one",f=s?null:[],d=s?r+1:a.length;for(o=r<0?d:s?r:0;o<d;o++)if(((n=a[o]).selected||o===r)&&!n.disabled&&(!n.parentNode.disabled||!fe(n.parentNode,"optgroup"))){if(t=i(n).val(),s)return t;f.push(t)}return f},set:function(e,t){for(var n,o,a=e.options,r=i.makeArray(t),s=a.length;s--;)((o=a[s]).selected=-1<i.inArray(i.valHooks.option.get(o),r))&&(n=!0);return n||(e.selectedIndex=-1),r}}}}),i.each(["radio","checkbox"],function(){i.valHooks[this]={set:function(e,t){if(Array.isArray(t))return e.checked=-1<i.inArray(i(e).val(),t)}},P.checkOn||(i.valHooks[this].get=function(e){return e.getAttribute("value")===null?"on":e.value})});var Bt=E.location,$t={guid:Date.now()},qt=/\?/;i.parseXML=function(e){var t,n;if(!e||typeof e!="string")return null;try{t=new E.DOMParser().parseFromString(e,"text/xml")}catch{}return n=t&&t.getElementsByTagName("parsererror")[0],t&&!n||i.error("Invalid XML: "+(n?i.map(n.childNodes,function(o){return o.textContent}).join(`
`):e)),t};var Ke=/^(?:focusinfocus|focusoutblur)$/,Io=function(e){e.stopPropagation()};i.extend(i.event,{trigger:function(e,t,n,o){var a,r,s,f,d,m,y,S,v=[n||J],D=U.call(e,"type")?e.type:e,N=U.call(e,"namespace")?e.namespace.split("."):[];if(r=S=s=n=n||J,n.nodeType!==3&&n.nodeType!==8&&!Ke.test(D+i.event.triggered)&&(-1<D.indexOf(".")&&(D=(N=D.split(".")).shift(),N.sort()),d=D.indexOf(":")<0&&"on"+D,(e=e[i.expando]?e:new i.Event(D,typeof e=="object"&&e)).isTrigger=o?2:3,e.namespace=N.join("."),e.rnamespace=e.namespace?new RegExp("(^|\\.)"+N.join("\\.(?:.*\\.|)")+"(\\.|$)"):null,e.result=void 0,e.target||(e.target=n),t=t==null?[e]:i.makeArray(t,[e]),y=i.event.special[D]||{},o||!y.trigger||y.trigger.apply(n,t)!==!1)){if(!o&&!y.noBubble&&!ot(n)){for(f=y.delegateType||D,Ke.test(f+D)||(r=r.parentNode);r;r=r.parentNode)v.push(r),s=r;s===(n.ownerDocument||J)&&v.push(s.defaultView||s.parentWindow||E)}for(a=0;(r=v[a++])&&!e.isPropagationStopped();)S=r,e.type=1<a?f:y.bindType||D,(m=(V.get(r,"events")||Object.create(null))[e.type]&&V.get(r,"handle"))&&m.apply(r,t),(m=d&&r[d])&&m.apply&&Ct(r)&&(e.result=m.apply(r,t),e.result===!1&&e.preventDefault());return e.type=D,o||e.isDefaultPrevented()||y._default&&y._default.apply(v.pop(),t)!==!1||!Ct(n)||d&&Y(n[D])&&!ot(n)&&((s=n[d])&&(n[d]=null),i.event.triggered=D,e.isPropagationStopped()&&S.addEventListener(D,Io),n[D](),e.isPropagationStopped()&&S.removeEventListener(D,Io),i.event.triggered=void 0,s&&(n[d]=s)),e.result}},simulate:function(e,t,n){var o=i.extend(new i.Event,n,{type:e,isSimulated:!0});i.event.trigger(o,null,t)}}),i.fn.extend({trigger:function(e,t){return this.each(function(){i.event.trigger(e,t,this)})},triggerHandler:function(e,t){var n=this[0];if(n)return i.event.trigger(e,t,n,!0)}});var Ho=/\[\]$/,Qn=/\r?\n/g,vt=/^(?:submit|button|image|reset|file)$/i,It=/^(?:input|select|textarea|keygen)/i;function Fn(e,t,n,o){var a;if(Array.isArray(t))i.each(t,function(r,s){n||Ho.test(e)?o(e,s):Fn(e+"["+(typeof s=="object"&&s!=null?r:"")+"]",s,n,o)});else if(n||jt(t)!=="object")o(e,t);else for(a in t)Fn(e+"["+a+"]",t[a],n,o)}i.param=function(e,t){var n,o=[],a=function(r,s){var f=Y(s)?s():s;o[o.length]=encodeURIComponent(r)+"="+encodeURIComponent(f??"")};if(e==null)return"";if(Array.isArray(e)||e.jquery&&!i.isPlainObject(e))i.each(e,function(){a(this.name,this.value)});else for(n in e)Fn(n,e[n],t,a);return o.join("&")},i.fn.extend({serialize:function(){return i.param(this.serializeArray())},serializeArray:function(){return this.map(function(){var e=i.prop(this,"elements");return e?i.makeArray(e):this}).filter(function(){var e=this.type;return this.name&&!i(this).is(":disabled")&&It.test(this.nodeName)&&!vt.test(e)&&(this.checked||!Xt.test(e))}).map(function(e,t){var n=i(this).val();return n==null?null:Array.isArray(n)?i.map(n,function(o){return{name:t.name,value:o.replace(Qn,`\r
`)}}):{name:t.name,value:n.replace(Qn,`\r
`)}}).get()}});var Wo=/%20/g,Eo=/#.*$/,Mo=/([?&])_=[^&]*/,en=/^(.*?):[ \t]*([^\r\n]*)$/gm,tn=/^(?:GET|HEAD)$/,Ht=/^\/\//,nn={},Wt={},yt="*/".concat("*"),te=J.createElement("a");function wn(e){return function(t,n){typeof t!="string"&&(n=t,t="*");var o,a=0,r=t.toLowerCase().match(Je)||[];if(Y(n))for(;o=r[a++];)o[0]==="+"?(o=o.slice(1)||"*",(e[o]=e[o]||[]).unshift(n)):(e[o]=e[o]||[]).push(n)}}function fo(e,t,n,o){var a={},r=e===Wt;function s(f){var d;return a[f]=!0,i.each(e[f]||[],function(m,y){var S=y(t,n,o);return typeof S!="string"||r||a[S]?r?!(d=S):void 0:(t.dataTypes.unshift(S),s(S),!1)}),d}return s(t.dataTypes[0])||!a["*"]&&s("*")}function on(e,t){var n,o,a=i.ajaxSettings.flatOptions||{};for(n in t)t[n]!==void 0&&((a[n]?e:o||(o={}))[n]=t[n]);return o&&i.extend(!0,e,o),e}te.href=Bt.href,i.extend({active:0,lastModified:{},etag:{},ajaxSettings:{url:Bt.href,type:"GET",isLocal:/^(?:about|app|app-storage|.+-extension|file|res|widget):$/.test(Bt.protocol),global:!0,processData:!0,async:!0,contentType:"application/x-www-form-urlencoded; charset=UTF-8",accepts:{"*":yt,text:"text/plain",html:"text/html",xml:"application/xml, text/xml",json:"application/json, text/javascript"},contents:{xml:/\bxml\b/,html:/\bhtml/,json:/\bjson\b/},responseFields:{xml:"responseXML",text:"responseText",json:"responseJSON"},converters:{"* text":String,"text html":!0,"text json":JSON.parse,"text xml":i.parseXML},flatOptions:{url:!0,context:!0}},ajaxSetup:function(e,t){return t?on(on(e,i.ajaxSettings),t):on(i.ajaxSettings,e)},ajaxPrefilter:wn(nn),ajaxTransport:wn(Wt),ajax:function(e,t){typeof e=="object"&&(t=e,e=void 0),t=t||{};var n,o,a,r,s,f,d,m,y,S,v=i.ajaxSetup({},t),D=v.context||v,N=v.context&&(D.nodeType||D.jquery)?i(D):i.event,F=i.Deferred(),Z=i.Callbacks("once memory"),xe=v.statusCode||{},we={},ge={},Xe="canceled",ae={readyState:0,getResponseHeader:function(oe){var he;if(d){if(!r)for(r={};he=en.exec(a);)r[he[1].toLowerCase()+" "]=(r[he[1].toLowerCase()+" "]||[]).concat(he[2]);he=r[oe.toLowerCase()+" "]}return he==null?null:he.join(", ")},getAllResponseHeaders:function(){return d?a:null},setRequestHeader:function(oe,he){return d==null&&(oe=ge[oe.toLowerCase()]=ge[oe.toLowerCase()]||oe,we[oe]=he),this},overrideMimeType:function(oe){return d==null&&(v.mimeType=oe),this},statusCode:function(oe){var he;if(oe)if(d)ae.always(oe[ae.status]);else for(he in oe)xe[he]=[xe[he],oe[he]];return this},abort:function(oe){var he=oe||Xe;return n&&n.abort(he),re(0,he),this}};if(F.promise(ae),v.url=((e||v.url||Bt.href)+"").replace(Ht,Bt.protocol+"//"),v.type=t.method||t.type||v.method||v.type,v.dataTypes=(v.dataType||"*").toLowerCase().match(Je)||[""],v.crossDomain==null){f=J.createElement("a");try{f.href=v.url,f.href=f.href,v.crossDomain=te.protocol+"//"+te.host!=f.protocol+"//"+f.host}catch{v.crossDomain=!0}}if(v.data&&v.processData&&typeof v.data!="string"&&(v.data=i.param(v.data,v.traditional)),fo(nn,v,t,ae),d)return ae;for(y in(m=i.event&&v.global)&&i.active++==0&&i.event.trigger("ajaxStart"),v.type=v.type.toUpperCase(),v.hasContent=!tn.test(v.type),o=v.url.replace(Eo,""),v.hasContent?v.data&&v.processData&&(v.contentType||"").indexOf("application/x-www-form-urlencoded")===0&&(v.data=v.data.replace(Wo,"+")):(S=v.url.slice(o.length),v.data&&(v.processData||typeof v.data=="string")&&(o+=(qt.test(o)?"&":"?")+v.data,delete v.data),v.cache===!1&&(o=o.replace(Mo,"$1"),S=(qt.test(o)?"&":"?")+"_="+$t.guid+++S),v.url=o+S),v.ifModified&&(i.lastModified[o]&&ae.setRequestHeader("If-Modified-Since",i.lastModified[o]),i.etag[o]&&ae.setRequestHeader("If-None-Match",i.etag[o])),(v.data&&v.hasContent&&v.contentType!==!1||t.contentType)&&ae.setRequestHeader("Content-Type",v.contentType),ae.setRequestHeader("Accept",v.dataTypes[0]&&v.accepts[v.dataTypes[0]]?v.accepts[v.dataTypes[0]]+(v.dataTypes[0]!=="*"?", "+yt+"; q=0.01":""):v.accepts["*"]),v.headers)ae.setRequestHeader(y,v.headers[y]);if(v.beforeSend&&(v.beforeSend.call(D,ae,v)===!1||d))return ae.abort();if(Xe="abort",Z.add(v.complete),ae.done(v.success),ae.fail(v.error),n=fo(Wt,v,t,ae)){if(ae.readyState=1,m&&N.trigger("ajaxSend",[ae,v]),d)return ae;v.async&&0<v.timeout&&(s=E.setTimeout(function(){ae.abort("timeout")},v.timeout));try{d=!1,n.send(we,re)}catch(oe){if(d)throw oe;re(-1,oe)}}else re(-1,"No Transport");function re(oe,he,Pt,Sn){var tt,an,st,lt,Qt,Pe=he;d||(d=!0,s&&E.clearTimeout(s),n=void 0,a=Sn||"",ae.readyState=0<oe?4:0,tt=200<=oe&&oe<300||oe===304,Pt&&(lt=(function(Se,Ae,He){for(var bt,We,K,ie,se=Se.contents,me=Se.dataTypes;me[0]==="*";)me.shift(),bt===void 0&&(bt=Se.mimeType||Ae.getResponseHeader("Content-Type"));if(bt){for(We in se)if(se[We]&&se[We].test(bt)){me.unshift(We);break}}if(me[0]in He)K=me[0];else{for(We in He){if(!me[0]||Se.converters[We+" "+me[0]]){K=We;break}ie||(ie=We)}K=K||ie}if(K)return K!==me[0]&&me.unshift(K),He[K]})(v,ae,Pt)),!tt&&-1<i.inArray("script",v.dataTypes)&&i.inArray("json",v.dataTypes)<0&&(v.converters["text script"]=function(){}),lt=(function(Se,Ae,He,bt){var We,K,ie,se,me,nt={},Ft=Se.dataTypes.slice();if(Ft[1])for(ie in Se.converters)nt[ie.toLowerCase()]=Se.converters[ie];for(K=Ft.shift();K;)if(Se.responseFields[K]&&(He[Se.responseFields[K]]=Ae),!me&&bt&&Se.dataFilter&&(Ae=Se.dataFilter(Ae,Se.dataType)),me=K,K=Ft.shift()){if(K==="*")K=me;else if(me!=="*"&&me!==K){if(!(ie=nt[me+" "+K]||nt["* "+K])){for(We in nt)if((se=We.split(" "))[1]===K&&(ie=nt[me+" "+se[0]]||nt["* "+se[0]])){ie===!0?ie=nt[We]:nt[We]!==!0&&(K=se[0],Ft.unshift(se[1]));break}}if(ie!==!0)if(ie&&Se.throws)Ae=ie(Ae);else try{Ae=ie(Ae)}catch(ct){return{state:"parsererror",error:ie?ct:"No conversion from "+me+" to "+K}}}}return{state:"success",data:Ae}})(v,lt,ae,tt),tt?(v.ifModified&&((Qt=ae.getResponseHeader("Last-Modified"))&&(i.lastModified[o]=Qt),(Qt=ae.getResponseHeader("etag"))&&(i.etag[o]=Qt)),oe===204||v.type==="HEAD"?Pe="nocontent":oe===304?Pe="notmodified":(Pe=lt.state,an=lt.data,tt=!(st=lt.error))):(st=Pe,!oe&&Pe||(Pe="error",oe<0&&(oe=0))),ae.status=oe,ae.statusText=(he||Pe)+"",tt?F.resolveWith(D,[an,Pe,ae]):F.rejectWith(D,[ae,Pe,st]),ae.statusCode(xe),xe=void 0,m&&N.trigger(tt?"ajaxSuccess":"ajaxError",[ae,v,tt?an:st]),Z.fireWith(D,[ae,Pe]),m&&(N.trigger("ajaxComplete",[ae,v]),--i.active||i.event.trigger("ajaxStop")))}return ae},getJSON:function(e,t,n){return i.get(e,t,n,"json")},getScript:function(e,t){return i.get(e,void 0,t,"script")}}),i.each(["get","post"],function(e,t){i[t]=function(n,o,a,r){return Y(o)&&(r=r||a,a=o,o=void 0),i.ajax(i.extend({url:n,type:t,dataType:r,data:o,success:a},i.isPlainObject(n)&&n))}}),i.ajaxPrefilter(function(e){var t;for(t in e.headers)t.toLowerCase()==="content-type"&&(e.contentType=e.headers[t]||"")}),i._evalUrl=function(e,t,n){return i.ajax({url:e,type:"GET",dataType:"script",cache:!0,async:!1,global:!1,converters:{"text script":function(){}},dataFilter:function(o){i.globalEval(o,t,n)}})},i.fn.extend({wrapAll:function(e){var t;return this[0]&&(Y(e)&&(e=e.call(this[0])),t=i(e,this[0].ownerDocument).eq(0).clone(!0),this[0].parentNode&&t.insertBefore(this[0]),t.map(function(){for(var n=this;n.firstElementChild;)n=n.firstElementChild;return n}).append(this)),this},wrapInner:function(e){return Y(e)?this.each(function(t){i(this).wrapInner(e.call(this,t))}):this.each(function(){var t=i(this),n=t.contents();n.length?n.wrapAll(e):t.append(e)})},wrap:function(e){var t=Y(e);return this.each(function(n){i(this).wrapAll(t?e.call(this,n):e)})},unwrap:function(e){return this.parent(e).not("body").each(function(){i(this).replaceWith(this.childNodes)}),this}}),i.expr.pseudos.hidden=function(e){return!i.expr.pseudos.visible(e)},i.expr.pseudos.visible=function(e){return!!(e.offsetWidth||e.offsetHeight||e.getClientRects().length)},i.ajaxSettings.xhr=function(){try{return new E.XMLHttpRequest}catch{}};var Et={0:200,1223:204},Kt=i.ajaxSettings.xhr();P.cors=!!Kt&&"withCredentials"in Kt,P.ajax=Kt=!!Kt,i.ajaxTransport(function(e){var t,n;if(P.cors||Kt&&!e.crossDomain)return{send:function(o,a){var r,s=e.xhr();if(s.open(e.type,e.url,e.async,e.username,e.password),e.xhrFields)for(r in e.xhrFields)s[r]=e.xhrFields[r];for(r in e.mimeType&&s.overrideMimeType&&s.overrideMimeType(e.mimeType),e.crossDomain||o["X-Requested-With"]||(o["X-Requested-With"]="XMLHttpRequest"),o)s.setRequestHeader(r,o[r]);t=function(f){return function(){t&&(t=n=s.onload=s.onerror=s.onabort=s.ontimeout=s.onreadystatechange=null,f==="abort"?s.abort():f==="error"?typeof s.status!="number"?a(0,"error"):a(s.status,s.statusText):a(Et[s.status]||s.status,s.statusText,(s.responseType||"text")!=="text"||typeof s.responseText!="string"?{binary:s.response}:{text:s.responseText},s.getAllResponseHeaders()))}},s.onload=t(),n=s.onerror=s.ontimeout=t("error"),s.onabort!==void 0?s.onabort=n:s.onreadystatechange=function(){s.readyState===4&&E.setTimeout(function(){t&&n()})},t=t("abort");try{s.send(e.hasContent&&e.data||null)}catch(f){if(t)throw f}},abort:function(){t&&t()}}}),i.ajaxPrefilter(function(e){e.crossDomain&&(e.contents.script=!1)}),i.ajaxSetup({accepts:{script:"text/javascript, application/javascript, application/ecmascript, application/x-ecmascript"},contents:{script:/\b(?:java|ecma)script\b/},converters:{"text script":function(e){return i.globalEval(e),e}}}),i.ajaxPrefilter("script",function(e){e.cache===void 0&&(e.cache=!1),e.crossDomain&&(e.type="GET")}),i.ajaxTransport("script",function(e){var t,n;if(e.crossDomain||e.scriptAttrs)return{send:function(o,a){t=i("<script>").attr(e.scriptAttrs||{}).prop({charset:e.scriptCharset,src:e.url}).on("load error",n=function(r){t.remove(),n=null,r&&a(r.type==="error"?404:200,r.type)}),J.head.appendChild(t[0])},abort:function(){n&&n()}}});var ho,mo=[],Zn=/(=)\?(?=&|$)|\?\?/;i.ajaxSetup({jsonp:"callback",jsonpCallback:function(){var e=mo.pop()||i.expando+"_"+$t.guid++;return this[e]=!0,e}}),i.ajaxPrefilter("json jsonp",function(e,t,n){var o,a,r,s=e.jsonp!==!1&&(Zn.test(e.url)?"url":typeof e.data=="string"&&(e.contentType||"").indexOf("application/x-www-form-urlencoded")===0&&Zn.test(e.data)&&"data");if(s||e.dataTypes[0]==="jsonp")return o=e.jsonpCallback=Y(e.jsonpCallback)?e.jsonpCallback():e.jsonpCallback,s?e[s]=e[s].replace(Zn,"$1"+o):e.jsonp!==!1&&(e.url+=(qt.test(e.url)?"&":"?")+e.jsonp+"="+o),e.converters["script json"]=function(){return r||i.error(o+" was not called"),r[0]},e.dataTypes[0]="json",a=E[o],E[o]=function(){r=arguments},n.always(function(){a===void 0?i(E).removeProp(o):E[o]=a,e[o]&&(e.jsonpCallback=t.jsonpCallback,mo.push(o)),r&&Y(a)&&a(r[0]),r=a=void 0}),"script"}),P.createHTMLDocument=((ho=J.implementation.createHTMLDocument("").body).innerHTML="<form></form><form></form>",ho.childNodes.length===2),i.parseHTML=function(e,t,n){return typeof e!="string"?[]:(typeof t=="boolean"&&(n=t,t=!1),t||(P.createHTMLDocument?((o=(t=J.implementation.createHTMLDocument("")).createElement("base")).href=J.location.href,t.head.appendChild(o)):t=J),r=!n&&[],(a=ln.exec(e))?[t.createElement(a[1])]:(a=So([e],t,r),r&&r.length&&i(r).remove(),i.merge([],a.childNodes)));var o,a,r},i.fn.load=function(e,t,n){var o,a,r,s=this,f=e.indexOf(" ");return-1<f&&(o=ze(e.slice(f)),e=e.slice(0,f)),Y(t)?(n=t,t=void 0):t&&typeof t=="object"&&(a="POST"),0<s.length&&i.ajax({url:e,type:a||"GET",dataType:"html",data:t}).done(function(d){r=arguments,s.html(o?i("<div>").append(i.parseHTML(d)).find(o):d)}).always(n&&function(d,m){s.each(function(){n.apply(this,r||[d.responseText,m,d])})}),this},i.expr.pseudos.animated=function(e){return i.grep(i.timers,function(t){return e===t.elem}).length},i.offset={setOffset:function(e,t,n){var o,a,r,s,f,d,m=i.css(e,"position"),y=i(e),S={};m==="static"&&(e.style.position="relative"),f=y.offset(),r=i.css(e,"top"),d=i.css(e,"left"),(m==="absolute"||m==="fixed")&&-1<(r+d).indexOf("auto")?(s=(o=y.position()).top,a=o.left):(s=parseFloat(r)||0,a=parseFloat(d)||0),Y(t)&&(t=t.call(e,n,i.extend({},f))),t.top!=null&&(S.top=t.top-f.top+s),t.left!=null&&(S.left=t.left-f.left+a),"using"in t?t.using.call(e,S):y.css(S)}},i.fn.extend({offset:function(e){if(arguments.length)return e===void 0?this:this.each(function(a){i.offset.setOffset(this,e,a)});var t,n,o=this[0];return o?o.getClientRects().length?(t=o.getBoundingClientRect(),n=o.ownerDocument.defaultView,{top:t.top+n.pageYOffset,left:t.left+n.pageXOffset}):{top:0,left:0}:void 0},position:function(){if(this[0]){var e,t,n,o=this[0],a={top:0,left:0};if(i.css(o,"position")==="fixed")t=o.getBoundingClientRect();else{for(t=this.offset(),n=o.ownerDocument,e=o.offsetParent||n.documentElement;e&&(e===n.body||e===n.documentElement)&&i.css(e,"position")==="static";)e=e.parentNode;e&&e!==o&&e.nodeType===1&&((a=i(e).offset()).top+=i.css(e,"borderTopWidth",!0),a.left+=i.css(e,"borderLeftWidth",!0))}return{top:t.top-a.top-i.css(o,"marginTop",!0),left:t.left-a.left-i.css(o,"marginLeft",!0)}}},offsetParent:function(){return this.map(function(){for(var e=this.offsetParent;e&&i.css(e,"position")==="static";)e=e.offsetParent;return e||it})}}),i.each({scrollLeft:"pageXOffset",scrollTop:"pageYOffset"},function(e,t){var n=t==="pageYOffset";i.fn[e]=function(o){return Te(this,function(a,r,s){var f;if(ot(a)?f=a:a.nodeType===9&&(f=a.defaultView),s===void 0)return f?f[t]:a[r];f?f.scrollTo(n?f.pageXOffset:s,n?s:f.pageYOffset):a[r]=s},e,o,arguments.length)}}),i.each(["top","left"],function(e,t){i.cssHooks[t]=lo(P.pixelPosition,function(n,o){if(o)return o=vn(n,t),Ue.test(o)?i(n).position()[t]+"px":o})}),i.each({Height:"height",Width:"width"},function(e,t){i.each({padding:"inner"+e,content:t,"":"outer"+e},function(n,o){i.fn[o]=function(a,r){var s=arguments.length&&(n||typeof a!="boolean"),f=n||(a===!0||r===!0?"margin":"border");return Te(this,function(d,m,y){var S;return ot(d)?o.indexOf("outer")===0?d["inner"+e]:d.document.documentElement["client"+e]:d.nodeType===9?(S=d.documentElement,Math.max(d.body["scroll"+e],S["scroll"+e],d.body["offset"+e],S["offset"+e],S["client"+e])):y===void 0?i.css(d,m,f):i.style(d,m,y,f)},t,s?a:void 0,s)}})}),i.each(["ajaxStart","ajaxStop","ajaxComplete","ajaxError","ajaxSuccess","ajaxSend"],function(e,t){i.fn[t]=function(n){return this.on(t,n)}}),i.fn.extend({bind:function(e,t,n){return this.on(e,null,t,n)},unbind:function(e,t){return this.off(e,null,t)},delegate:function(e,t,n,o){return this.on(t,e,n,o)},undelegate:function(e,t,n){return arguments.length===1?this.off(e,"**"):this.off(t,e||"**",n)},hover:function(e,t){return this.on("mouseenter",e).on("mouseleave",t||e)}}),i.each("blur focus focusin focusout resize scroll click dblclick mousedown mouseup mousemove mouseover mouseout mouseenter mouseleave change select submit keydown keypress keyup contextmenu".split(" "),function(e,t){i.fn[t]=function(n,o){return 0<arguments.length?this.on(t,null,n,o):this.trigger(t)}});var jo=/^[\s\uFEFF\xA0]+|([^\s\uFEFF\xA0])[\s\uFEFF\xA0]+$/g;i.proxy=function(e,t){var n,o,a;if(typeof t=="string"&&(n=e[t],t=e,e=n),Y(e))return o=be.call(arguments,2),(a=function(){return e.apply(t||this,o.concat(be.call(arguments)))}).guid=e.guid=e.guid||i.guid++,a},i.holdReady=function(e){e?i.readyWait++:i.ready(!0)},i.isArray=Array.isArray,i.parseJSON=JSON.parse,i.nodeName=fe,i.isFunction=Y,i.isWindow=ot,i.camelCase=Oe,i.type=jt,i.now=Date.now,i.isNumeric=function(e){var t=i.type(e);return(t==="number"||t==="string")&&!isNaN(e-parseFloat(e))},i.trim=function(e){return e==null?"":(e+"").replace(jo,"$1")},typeof define=="function"&&define.amd&&define("jquery",[],function(){return i});var To=E.jQuery,Oo=E.$;return i.noConflict=function(e){return E.$===i&&(E.$=Oo),e&&E.jQuery===i&&(E.jQuery=To),i},typeof $>"u"&&(E.jQuery=E.$=i),i})}function dt(Ge,ye){if(typeof Ge>"u")throw new Error("jquery-confirm requires jQuery");var E,$;(function(g,M){g.fn.confirm=function(l,w){return typeof l>"u"&&(l={}),typeof l=="string"&&(l={content:l,title:w||!1}),g(this).each(function(){var k=g(this);if(k.attr("jc-attached")){console.warn("jConfirm has already been attached to this element ",k[0]);return}k.on("click",function(j){j.preventDefault();var W=g.extend({},l);if(k.attr("data-title")&&(W.title=k.attr("data-title")),k.attr("data-content")&&(W.content=k.attr("data-content")),typeof W.buttons>"u"&&(W.buttons={}),W.$target=k,k.attr("href")&&Object.keys(W.buttons).length==0){var U=g.extend(!0,{},E.pluginDefaults.defaultButtons,(E.defaults||{}).defaultButtons||{}),R=Object.keys(U)[0];W.buttons=U,W.buttons[R].action=function(){location.href=k.attr("href")}}W.closeIcon=!1;var de=g.confirm(W)}),k.attr("jc-attached",!0)}),g(this)},g.confirm=function(l,w){if(typeof l>"u"&&(l={}),typeof l=="string"&&(l={content:l,title:w||!1}),typeof l.buttons!="object"&&(l.buttons={}),Object.keys(l.buttons).length==0){var k=g.extend(!0,{},E.pluginDefaults.defaultButtons,(E.defaults||{}).defaultButtons||{});l.buttons=k}return E(l)},g.alert=function(l,w){if(typeof l>"u"&&(l={}),typeof l=="string"&&(l={content:l,title:w||!1}),typeof l.buttons!="object"&&(l.buttons={}),Object.keys(l.buttons).length==0){var k=g.extend(!0,{},E.pluginDefaults.defaultButtons,(E.defaults||{}).defaultButtons||{}),j=Object.keys(k)[0];l.buttons[j]=k[j]}return E(l)},g.dialog=function(l,w){return typeof l>"u"&&(l={}),typeof l=="string"&&(l={content:l,title:w||!1,closeIcon:function(){}}),l.buttons={},typeof l.closeIcon>"u"&&(l.closeIcon=function(){}),l.confirmKeys=[13],E(l)},E=function(l){typeof l>"u"&&(l={});var w=g.extend(!0,{},E.pluginDefaults);E.defaults&&(w=g.extend(!0,w,E.defaults)),w=g.extend(!0,{},w,l);var k=new $(w);return E.instances.push(k),k},$=function(l){g.extend(this,l),this._init()},$.prototype={_init:function(){var l=this;E.instances.length||(E.lastFocused=g("body").find(":focus")),this._id=Math.round(Math.random()*99999),this.contentParsed=g(document.createElement("div")),this.lazyOpen||setTimeout(function(){l.open()},0)},_buildHTML:function(){var l=this;this._parseAnimation(this.animation,"o"),this._parseAnimation(this.closeAnimation,"c"),this._parseBgDismissAnimation(this.backgroundDismissAnimation),this._parseColumnClass(this.columnClass),this._parseTheme(this.theme),this._parseType(this.type);var w=g(this.template);w.find(".jconfirm-box").addClass(this.animationParsed).addClass(this.backgroundDismissAnimationParsed).addClass(this.typeParsed),this.typeAnimated&&w.find(".jconfirm-box").addClass("jconfirm-type-animated"),this.useBootstrap?(w.find(".jc-bs3-row").addClass(this.bootstrapClasses.row),w.find(".jc-bs3-row").addClass("justify-content-md-center justify-content-sm-center justify-content-xs-center justify-content-lg-center"),w.find(".jconfirm-box-container").addClass(this.columnClassParsed),this.containerFluid?w.find(".jc-bs3-container").addClass(this.bootstrapClasses.containerFluid):w.find(".jc-bs3-container").addClass(this.bootstrapClasses.container)):w.find(".jconfirm-box").css("width",this.boxWidth),this.titleClass&&w.find(".jconfirm-title-c").addClass(this.titleClass),w.addClass(this.themeParsed);var k="jconfirm-box"+this._id;w.find(".jconfirm-box").attr("aria-labelledby",k).attr("tabindex",-1),w.find(".jconfirm-content").attr("id",k),this.bgOpacity!==null&&w.find(".jconfirm-bg").css("opacity",this.bgOpacity),this.rtl&&w.addClass("jconfirm-rtl"),this.$el=w.appendTo(this.container),this.$jconfirmBoxContainer=this.$el.find(".jconfirm-box-container"),this.$jconfirmBox=this.$body=this.$el.find(".jconfirm-box"),this.$jconfirmBg=this.$el.find(".jconfirm-bg"),this.$title=this.$el.find(".jconfirm-title"),this.$titleContainer=this.$el.find(".jconfirm-title-c"),this.$content=this.$el.find("div.jconfirm-content"),this.$contentPane=this.$el.find(".jconfirm-content-pane"),this.$icon=this.$el.find(".jconfirm-icon-c"),this.$closeIcon=this.$el.find(".jconfirm-closeIcon"),this.$holder=this.$el.find(".jconfirm-holder"),this.$btnc=this.$el.find(".jconfirm-buttons"),this.$scrollPane=this.$el.find(".jconfirm-scrollpane"),l.setStartingPoint(),this._contentReady=g.Deferred(),this._modalReady=g.Deferred(),this.$holder.css({"padding-top":this.offsetTop,"padding-bottom":this.offsetBottom}),this.setTitle(),this.setIcon(),this._setButtons(),this._parseContent(),this.initDraggable(),this.isAjax&&this.showLoading(!1),g.when(this._contentReady,this._modalReady).then(function(){l.isAjaxLoading?setTimeout(function(){l.isAjaxLoading=!1,l.setContent(),l.setTitle(),l.setIcon(),setTimeout(function(){l.hideLoading(!1),l._updateContentMaxHeight()},100),typeof l.onContentReady=="function"&&l.onContentReady()},50):(l._updateContentMaxHeight(),l.setTitle(),l.setIcon(),typeof l.onContentReady=="function"&&l.onContentReady()),l.autoClose&&l._startCountDown()}),this._watchContent(),this.animation==="none"&&(this.animationSpeed=1,this.animationBounce=1),this.$body.css(this._getCSS(this.animationSpeed,this.animationBounce)),this.$contentPane.css(this._getCSS(this.animationSpeed,1)),this.$jconfirmBg.css(this._getCSS(this.animationSpeed,1)),this.$jconfirmBoxContainer.css(this._getCSS(this.animationSpeed,1))},_typePrefix:"jconfirm-type-",typeParsed:"",_parseType:function(l){this.typeParsed=this._typePrefix+l},setType:function(l){var w=this.typeParsed;this._parseType(l),this.$jconfirmBox.removeClass(w).addClass(this.typeParsed)},themeParsed:"",_themePrefix:"jconfirm-",setTheme:function(l){var w=this.theme;this.theme=l||this.theme,this._parseTheme(this.theme),w&&this.$el.removeClass(w),this.$el.addClass(this.themeParsed),this.theme=l},_parseTheme:function(l){var w=this;l=l.split(","),g.each(l,function(k,j){j.indexOf(w._themePrefix)===-1&&(l[k]=w._themePrefix+g.trim(j))}),this.themeParsed=l.join(" ").toLowerCase()},backgroundDismissAnimationParsed:"",_bgDismissPrefix:"jconfirm-hilight-",_parseBgDismissAnimation:function(l){var w=l.split(","),k=this;g.each(w,function(j,W){W.indexOf(k._bgDismissPrefix)===-1&&(w[j]=k._bgDismissPrefix+g.trim(W))}),this.backgroundDismissAnimationParsed=w.join(" ").toLowerCase()},animationParsed:"",closeAnimationParsed:"",_animationPrefix:"jconfirm-animation-",setAnimation:function(l){this.animation=l||this.animation,this._parseAnimation(this.animation,"o")},_parseAnimation:function(l,w){w=w||"o";var k=l.split(","),j=this;g.each(k,function(U,R){R.indexOf(j._animationPrefix)===-1&&(k[U]=j._animationPrefix+g.trim(R))});var W=k.join(" ").toLowerCase();return w==="o"?this.animationParsed=W:this.closeAnimationParsed=W,W},setCloseAnimation:function(l){this.closeAnimation=l||this.closeAnimation,this._parseAnimation(this.closeAnimation,"c")},setAnimationSpeed:function(l){this.animationSpeed=l||this.animationSpeed},columnClassParsed:"",setColumnClass:function(l){if(!this.useBootstrap){console.warn("cannot set columnClass, useBootstrap is set to false");return}this.columnClass=l||this.columnClass,this._parseColumnClass(this.columnClass),this.$jconfirmBoxContainer.addClass(this.columnClassParsed)},_updateContentMaxHeight:function(){var l=g(M).height()-(this.$jconfirmBox.outerHeight()-this.$contentPane.outerHeight())-(this.offsetTop+this.offsetBottom);this.$contentPane.css({"max-height":l+"px"})},setBoxWidth:function(l){if(this.useBootstrap){console.warn("cannot set boxWidth, useBootstrap is set to true");return}this.boxWidth=l,this.$jconfirmBox.css("width",l)},_parseColumnClass:function(l){l=l.toLowerCase();var w;switch(l){case"xl":case"xlarge":w="col-md-12";break;case"l":case"large":w="col-md-8 col-md-offset-2";break;case"m":case"medium":w="col-md-6 col-md-offset-3";break;case"s":case"small":w="col-md-4 col-md-offset-4";break;case"xs":case"xsmall":w="col-md-2 col-md-offset-5";break;default:w=l}this.columnClassParsed=w},initDraggable:function(){var l=this,w=this.$titleContainer;this.resetDrag(),this.draggable&&(w.on("mousedown",function(k){w.addClass("jconfirm-hand"),l.mouseX=k.clientX,l.mouseY=k.clientY,l.isDrag=!0}),g(M).on("mousemove."+this._id,function(k){l.isDrag&&(l.movingX=k.clientX-l.mouseX+l.initialX,l.movingY=k.clientY-l.mouseY+l.initialY,l.setDrag())}),g(M).on("mouseup."+this._id,function(){w.removeClass("jconfirm-hand"),l.isDrag&&(l.isDrag=!1,l.initialX=l.movingX,l.initialY=l.movingY)}))},resetDrag:function(){this.isDrag=!1,this.initialX=0,this.initialY=0,this.movingX=0,this.movingY=0,this.mouseX=0,this.mouseY=0,this.$jconfirmBoxContainer.css("transform","translate(0px, 0px)")},setDrag:function(){if(this.draggable){this.alignMiddle=!1;var l=this.$jconfirmBox.outerWidth(),w=this.$jconfirmBox.outerHeight(),k=g(M).width(),j=g(M).height(),W=this,U=1;if(W.movingX%U===0||W.movingY%U===0){if(W.dragWindowBorder){var R=k/2-l/2,de=j/2-w/2;de-=W.dragWindowGap,R-=W.dragWindowGap,R+W.movingX<0?W.movingX=-R:R-W.movingX<0&&(W.movingX=R),de+W.movingY<0?W.movingY=-de:de-W.movingY<0&&(W.movingY=de)}W.$jconfirmBoxContainer.css("transform","translate("+W.movingX+"px, "+W.movingY+"px)")}}},_scrollTop:function(){if(typeof pageYOffset<"u")return pageYOffset;var l=document.body,w=document.documentElement;return w=w.clientHeight?w:l,w.scrollTop},_watchContent:function(){var l=this;this._timer&&clearInterval(this._timer);var w=0;this._timer=setInterval(function(){if(l.smoothContent){var k=l.$content.outerHeight()||0;k!==w&&(l.$contentPane.css({height:k}).scrollTop(0),w=k);var j=g(M).height(),W=l.offsetTop+l.offsetBottom+l.$jconfirmBox.height()-l.$contentPane.height()+l.$content.height();W<j?l.$contentPane.addClass("no-scroll"):l.$contentPane.removeClass("no-scroll")}},this.watchInterval)},_overflowClass:"jconfirm-overflow",_hilightAnimating:!1,highlight:function(){this.hiLightModal()},hiLightModal:function(){var l=this;if(!this._hilightAnimating){l.$body.addClass("hilight");var w=parseFloat(l.$body.css("animation-duration"))||2;this._hilightAnimating=!0,setTimeout(function(){l._hilightAnimating=!1,l.$body.removeClass("hilight")},w*1e3)}},_bindEvents:function(){var l=this;this.boxClicked=!1,this.$scrollPane.click(function(k){if(!l.boxClicked){var j=!1,W=!1,U;if(typeof l.backgroundDismiss=="function"?U=l.backgroundDismiss():U=l.backgroundDismiss,typeof U=="string"&&typeof l.buttons[U]<"u"?(j=U,W=!1):typeof U>"u"||U?W=!0:W=!1,j){var R=l.buttons[j].action.apply(l);W=typeof R>"u"||!!R}W?l.close():l.hiLightModal()}l.boxClicked=!1}),this.$jconfirmBox.click(function(k){l.boxClicked=!0});var w=!1;g(M).on("jcKeyDown."+l._id,function(k){w||(w=!0)}),g(M).on("keyup."+l._id,function(k){w&&(l.reactOnKey(k),w=!1)}),g(M).on("resize."+this._id,function(){l._updateContentMaxHeight(),setTimeout(function(){l.resetDrag()},100)})},_cubic_bezier:"0.36, 0.55, 0.19",_getCSS:function(l,w){return{"-webkit-transition-duration":l/1e3+"s","transition-duration":l/1e3+"s","-webkit-transition-timing-function":"cubic-bezier("+this._cubic_bezier+", "+w+")","transition-timing-function":"cubic-bezier("+this._cubic_bezier+", "+w+")"}},_setButtons:function(){var l=this,w=0;if(typeof this.buttons!="object"&&(this.buttons={}),g.each(this.buttons,function(j,W){w+=1,typeof W=="function"&&(l.buttons[j]=W={action:W}),l.buttons[j].text=W.text||j,l.buttons[j].btnClass=W.btnClass||"btn-default",l.buttons[j].action=W.action||function(){},l.buttons[j].keys=W.keys||[],l.buttons[j].isHidden=W.isHidden||!1,l.buttons[j].isDisabled=W.isDisabled||!1,g.each(l.buttons[j].keys,function(R,de){l.buttons[j].keys[R]=de.toLowerCase()});var U=g('<button type="button" class="btn"></button>').html(l.buttons[j].text).addClass(l.buttons[j].btnClass).prop("disabled",l.buttons[j].isDisabled).css("display",l.buttons[j].isHidden?"none":"").click(function(R){R.preventDefault();var de=l.buttons[j].action.apply(l,[l.buttons[j]]);l.onAction.apply(l,[j,l.buttons[j]]),l._stopCountDown(),(typeof de>"u"||de)&&l.close()});l.buttons[j].el=U,l.buttons[j].setText=function(R){U.html(R)},l.buttons[j].addClass=function(R){U.addClass(R)},l.buttons[j].removeClass=function(R){U.removeClass(R)},l.buttons[j].disable=function(){l.buttons[j].isDisabled=!0,U.prop("disabled",!0)},l.buttons[j].enable=function(){l.buttons[j].isDisabled=!1,U.prop("disabled",!1)},l.buttons[j].show=function(){l.buttons[j].isHidden=!1,U.css("display","")},l.buttons[j].hide=function(){l.buttons[j].isHidden=!0,U.css("display","none")},l["$_"+j]=l["$$"+j]=U,l.$btnc.append(U)}),w===0&&this.$btnc.hide(),this.closeIcon===null&&w===0&&(this.closeIcon=!0),this.closeIcon){if(this.closeIconClass){var k='<i class="'+this.closeIconClass+'"></i>';this.$closeIcon.html(k)}this.$closeIcon.click(function(j){j.preventDefault();var W=!1,U=!1,R;if(typeof l.closeIcon=="function"?R=l.closeIcon():R=l.closeIcon,typeof R=="string"&&typeof l.buttons[R]<"u"?(W=R,U=!1):typeof R>"u"||R?U=!0:U=!1,W){var de=l.buttons[W].action.apply(l);U=typeof de>"u"||!!de}U&&l.close()}),this.$closeIcon.show()}else this.$closeIcon.hide()},setTitle:function(l,w){if(w=w||!1,typeof l<"u")if(typeof l=="string")this.title=l;else if(typeof l=="function"){typeof l.promise=="function"&&console.error("Promise was returned from title function, this is not supported.");var k=l();typeof k=="string"?this.title=k:this.title=!1}else this.title=!1;this.isAjaxLoading&&!w||(this.$title.html(this.title||""),this.updateTitleContainer())},setIcon:function(l,w){if(w=w||!1,typeof l<"u")if(typeof l=="string")this.icon=l;else if(typeof l=="function"){var k=l();typeof k=="string"?this.icon=k:this.icon=!1}else this.icon=!1;this.isAjaxLoading&&!w||(this.$icon.html(this.icon?'<i class="'+this.icon+'"></i>':""),this.updateTitleContainer())},updateTitleContainer:function(){!this.title&&!this.icon?this.$titleContainer.hide():this.$titleContainer.show()},setContentPrepend:function(l,w){l&&this.contentParsed.prepend(l)},setContentAppend:function(l){l&&this.contentParsed.append(l)},setContent:function(l,w){w=!!w;var k=this;l&&this.contentParsed.html("").append(l),!(this.isAjaxLoading&&!w)&&(this.$content.html(""),this.$content.append(this.contentParsed),setTimeout(function(){k.$body.find("input[autofocus]:visible:first").focus()},100))},loadingSpinner:!1,showLoading:function(l){this.loadingSpinner=!0,this.$jconfirmBox.addClass("loading"),l&&this.$btnc.find("button").prop("disabled",!0)},hideLoading:function(l){this.loadingSpinner=!1,this.$jconfirmBox.removeClass("loading"),l&&this.$btnc.find("button").prop("disabled",!1)},ajaxResponse:!1,contentParsed:"",isAjax:!1,isAjaxLoading:!1,_parseContent:function(){var l=this,w="&nbsp;";if(typeof this.content=="function"){var k=this.content.apply(this);typeof k=="string"?this.content=k:typeof k=="object"&&typeof k.always=="function"?(this.isAjax=!0,this.isAjaxLoading=!0,k.always(function(W,U,R){l.ajaxResponse={data:W,status:U,xhr:R},l._contentReady.resolve(W,U,R),typeof l.contentLoaded=="function"&&l.contentLoaded(W,U,R)}),this.content=w):this.content=w}if(typeof this.content=="string"&&this.content.substr(0,4).toLowerCase()==="url:"){this.isAjax=!0,this.isAjaxLoading=!0;var j=this.content.substring(4,this.content.length);g.get(j).done(function(W){l.contentParsed.html(W)}).always(function(W,U,R){l.ajaxResponse={data:W,status:U,xhr:R},l._contentReady.resolve(W,U,R),typeof l.contentLoaded=="function"&&l.contentLoaded(W,U,R)})}this.content||(this.content=w),this.isAjax||(this.contentParsed.html(this.content),this.setContent(),l._contentReady.resolve())},_stopCountDown:function(){clearInterval(this.autoCloseInterval),this.$cd&&this.$cd.remove()},_startCountDown:function(){var l=this,w=this.autoClose.split("|");if(w.length!==2)return console.error("Invalid option for autoClose. example 'close|10000'"),!1;var k=w[0],j=parseInt(w[1]);if(typeof this.buttons[k]>"u")return console.error("Invalid button key '"+k+"' for autoClose"),!1;var W=Math.ceil(j/1e3);this.$cd=g('<span class="countdown"> ('+W+")</span>").appendTo(this["$_"+k]),this.autoCloseInterval=setInterval(function(){l.$cd.html(" ("+(W-=1)+") "),W<=0&&(l["$$"+k].trigger("click"),l._stopCountDown())},1e3)},_getKey:function(l){switch(l){case 192:return"tilde";case 13:return"enter";case 16:return"shift";case 9:return"tab";case 20:return"capslock";case 17:return"ctrl";case 91:return"win";case 18:return"alt";case 27:return"esc";case 32:return"space"}var w=String.fromCharCode(l);return/^[A-z0-9]+$/.test(w)?w.toLowerCase():!1},reactOnKey:function(l){var w=this,k=g(".jconfirm");if(k.eq(k.length-1)[0]!==this.$el[0])return!1;var j=l.which;if(this.$content.find(":input").is(":focus")&&/13|32/.test(j))return!1;var W=this._getKey(j);if(W==="esc"&&this.escapeKey){if(this.escapeKey===!0)this.$scrollPane.trigger("click");else if(typeof this.escapeKey=="string"||typeof this.escapeKey=="function"){var U;typeof this.escapeKey=="function"?U=this.escapeKey():U=this.escapeKey,U&&(typeof this.buttons[U]>"u"?console.warn("Invalid escapeKey, no buttons found with key "+U):this["$_"+U].trigger("click"))}}g.each(this.buttons,function(R,de){de.keys.indexOf(W)!=-1&&w["$_"+R].trigger("click")})},setDialogCenter:function(){console.info("setDialogCenter is deprecated, dialogs are centered with CSS3 tables")},_unwatchContent:function(){clearInterval(this._timer)},close:function(){var l=this;return typeof this.onClose=="function"&&this.onClose(),this._unwatchContent(),g(M).unbind("resize."+this._id),g(M).unbind("keyup."+this._id),g(M).unbind("jcKeyDown."+this._id),this.draggable&&(g(M).unbind("mousemove."+this._id),g(M).unbind("mouseup."+this._id),this.$titleContainer.unbind("mousedown")),l.$el.removeClass(l.loadedClass),g("body").removeClass("jconfirm-no-scroll-"+l._id),l.$jconfirmBoxContainer.removeClass("jconfirm-no-transition"),setTimeout(function(){l.$body.addClass(l.closeAnimationParsed),l.$jconfirmBg.addClass("jconfirm-bg-h");var w=l.closeAnimation==="none"?1:l.animationSpeed;setTimeout(function(){l.$el.remove();var k=E.instances,j=E.instances.length-1;for(j;j>=0;j--)E.instances[j]._id===l._id&&E.instances.splice(j,1);if(!E.instances.length&&l.scrollToPreviousElement&&E.lastFocused&&E.lastFocused.length&&g.contains(document,E.lastFocused[0])){var W=E.lastFocused;if(l.scrollToPreviousElementAnimate){var U=g(M).scrollTop(),R=E.lastFocused.offset().top,de=g(M).height();if(R>U&&R<U+de)W.focus();else{var P=R-Math.round(de/3);g("html, body").animate({scrollTop:P},l.animationSpeed,"swing",function(){W.focus()})}}else W.focus();E.lastFocused=!1}typeof l.onDestroy=="function"&&l.onDestroy()},w*.4)},50),!0},open:function(){return this.isOpen()?!1:(this._buildHTML(),this._bindEvents(),this._open(),!0)},setStartingPoint:function(){var l=!1;if(this.animateFromElement!==!0&&this.animateFromElement)l=this.animateFromElement,E.lastClicked=!1;else if(E.lastClicked&&this.animateFromElement===!0)l=E.lastClicked,E.lastClicked=!1;else return!1;if(!l)return!1;var w=l.offset(),k=l.outerHeight()/2,j=l.outerWidth()/2;k-=this.$jconfirmBox.outerHeight()/2,j-=this.$jconfirmBox.outerWidth()/2;var W=w.top+k;W=W-this._scrollTop();var U=w.left+j,R=g(M).height()/2,de=g(M).width()/2,P=R-this.$jconfirmBox.outerHeight()/2,Y=de-this.$jconfirmBox.outerWidth()/2;if(W-=P,U-=Y,Math.abs(W)>R||Math.abs(U)>de)return!1;this.$jconfirmBoxContainer.css("transform","translate("+U+"px, "+W+"px)")},_open:function(){var l=this;typeof l.onOpenBefore=="function"&&l.onOpenBefore(),this.$body.removeClass(this.animationParsed),this.$jconfirmBg.removeClass("jconfirm-bg-h"),this.$body.focus(),l.$jconfirmBoxContainer.css("transform","translate(0px, 0px)"),setTimeout(function(){l.$body.css(l._getCSS(l.animationSpeed,1)),l.$body.css({"transition-property":l.$body.css("transition-property")+", margin"}),l.$jconfirmBoxContainer.addClass("jconfirm-no-transition"),l._modalReady.resolve(),typeof l.onOpen=="function"&&l.onOpen(),l.$el.addClass(l.loadedClass)},this.animationSpeed)},loadedClass:"jconfirm-open",isClosed:function(){return!this.$el||this.$el.css("display")===""},isOpen:function(){return!this.isClosed()},toggle:function(){this.isOpen()?this.close():this.open()}},E.instances=[],E.lastFocused=!1,E.pluginDefaults={template:'<div class="jconfirm"><div class="jconfirm-bg jconfirm-bg-h"></div><div class="jconfirm-scrollpane"><div class="jconfirm-row"><div class="jconfirm-cell"><div class="jconfirm-holder"><div class="jc-bs3-container"><div class="jc-bs3-row"><div class="jconfirm-box-container jconfirm-animated"><div class="jconfirm-box" role="dialog" aria-labelledby="labelled" tabindex="-1"><div class="jconfirm-closeIcon">&times;</div><div class="jconfirm-title-c"><span class="jconfirm-icon-c"></span><span class="jconfirm-title"></span></div><div class="jconfirm-content-pane"><div class="jconfirm-content"></div></div><div class="jconfirm-buttons"></div><div class="jconfirm-clear"></div></div></div></div></div></div></div></div></div></div>',title:"Hello",titleClass:"",type:"default",typeAnimated:!0,draggable:!0,dragWindowGap:15,dragWindowBorder:!0,animateFromElement:!0,alignMiddle:!0,smoothContent:!0,content:"Are you sure to continue?",buttons:{},defaultButtons:{ok:{action:function(){}},close:{action:function(){}}},contentLoaded:function(){},icon:"",lazyOpen:!1,bgOpacity:null,theme:"light",animation:"scale",closeAnimation:"scale",animationSpeed:400,animationBounce:1,escapeKey:!0,rtl:!1,container:"body",containerFluid:!1,backgroundDismiss:!1,backgroundDismissAnimation:"shake",autoClose:!1,closeIcon:null,closeIconClass:!1,watchInterval:100,columnClass:"col-md-4 col-md-offset-4 col-sm-6 col-sm-offset-3 col-xs-10 col-xs-offset-1",boxWidth:"50%",scrollToPreviousElement:!0,scrollToPreviousElementAnimate:!0,useBootstrap:!0,offsetTop:40,offsetBottom:40,bootstrapClasses:{container:"container",containerFluid:"container-fluid",row:"row"},onContentReady:function(){},onOpenBefore:function(){},onOpen:function(){},onClose:function(){},onDestroy:function(){},onAction:function(){}};var be=!1;g(M).on("keydown",function(l){if(!be){var w=g(l.target),k=!1;w.closest(".jconfirm-box").length&&(k=!0),k&&g(M).trigger("jcKeyDown"),be=!0}}),g(M).on("keyup",function(){be=!1}),E.lastClicked=!1,g(document).on("mousedown","button, a",function(){E.lastClicked=g(this)})})(Ge,ye)}var Dn=null;return function(Ge){if(Dn)return Dn;var ye={exports:{}};return kn.call(Ge,Ge,ye),dt.call(Ge,ye.exports,Ge),Dn=ye.exports}})();(function(){"use strict";function kn(ye){ye.register({id:"moomod",name:"MooMod",version:"1.0.0",description:"Nuro's MooMod, ported 1:1. - opens the MooMod menu, ESC the hat menu, F2 auto placement.",menu:!0,menuHint:"MooMod has its own menus: press - (minus) for the MooMod menu, ESC for the hat menu and F2 for auto placement.",liveSettings:!0,defaultEnabled:!0},function(E){const $=typeof unsafeWindow<"u"?unsafeWindow:window,g=$.document;if(!g||!g.createElement)return;let M=null;const be=new Set,l=new Set;let w=!0;function k(u,p){const x=$.setTimeout(function(){be.delete(x),w&&u()},p);return be.add(x),x}function j(u){be.delete(u),$.clearTimeout(u)}function W(u,p){const x=$.setInterval(function(){w&&u()},p);return l.add(x),x}function U(u){l.delete(u),$.clearInterval(u)}function R(u,p,x,A){u.addEventListener(p,x,A),E.onCleanup(function(){u.removeEventListener(p,x,A)})}const de=[];function P(u){return de.push(u),u}const Y=[];function ot(u){Y.push(u)}E.onCleanup(function(){w=!1;for(const p of be)$.clearTimeout(p);for(const p of l)$.clearInterval(p);be.clear(),l.clear();const u=p=>{M&&M(p).stop(!0),p.remove()};if(M)try{M(g).off(".moomod"),M("#mapDisplay").off(".moomod")}catch{}for(const p of de)try{u(p)}catch{}for(const p of["#infoDiv",".spotDiv",".mapTarget","#botText"])try{for(const x of Array.from(g.querySelectorAll(p)))u(x)}catch{}for(let p=Y.length-1;p>=0;p--)try{Y[p]()}catch{}});const J=`
<div id="atS" class="modal">
    <div class="modal-content">
        <div class="modal-header">
            <span class="closeit">&times;</span>
            <h2 style="font-size: 17px;">Auto placement Settings</h2>
        </div>
        <div class="modal-body" style="font-size: 17px;">
            <div class="flexControl">
                <label class="container">Trap
                    <input type="checkbox" id="myCheck0">
                    <span class="checkmark"></span>
                </label>
            </div>
        </div>
        <div class="modal-footer">
                <h3 class="HatsID"> id: 51,  name: "Moo Cap" </h3>
                <h3 class="HatsID"> id: 50,  name: "Apple Cap" </h3>
                <h3 class="HatsID"> id: 28,  name: "Moo Head" </h3>
                <h3 class="HatsID"> id: 29,  name: "Pig Head" </h3>
                <h3 class="HatsID"> id: 30,  name: "Fluff Head" </h3>
                <h3 class="HatsID"> id: 36,  name: "Pandou Head" </h3>
                <h3 class="HatsID"> id: 37,  name: "Bear Head" </h3>
                <h3 class="HatsID"> id: 38,  name: "Monkey Head" </h3>
                <h3 class="HatsID"> id: 44,  name: "Polar Head" </h3>
                <h3 class="HatsID"> id: 35,  name: "Fez Hat" </h3>
                <h3 class="HatsID"> id: 42,  name: "Enigma Hat" </h3>
                <h3 class="HatsID"> id: 43,  name: "Blitz Hat" </h3>
                <h3 class="HatsID"> id: 49,  name: "Bob XIII Hat" </h3>
                <h3 class="HatsID"> id: 8,  name: "Bummle Hat" </h3>
                <h3 class="HatsID"> id: 2,  name: "Straw Hat" </h3>
                <h3 class="HatsID"> id: 15,  name: "Winter Cap" </h3>
                <h3 class="HatsID"> id: 5,  name: "Cowboy Hat" </h3>
                <h3 class="HatsID"> id: 4,  name: "Ranger Hat" </h3>
                <h3 class="HatsID"> id: 18,  name: "Explorer Hat" </h3>
                <h3 class="HatsID"> id: 31,  name: "Flipper Hat" </h3>
                <h3 class="HatsID"> id: 1,  name: "Marksman Cap" </h3>
                <h3 class="HatsID"> id: 10,  name: "Bush Gear" </h3>
                <h3 class="HatsID"> id: 48,  name: "Halo" </h3>
                <h3 class="HatsID"> id: 6,  name: "Soldier Helmet" </h3>
                <h3 class="HatsID"> id: 23,  name: "Anti Venom Gear" </h3>
                <h3 class="HatsID"> id: 13,  name: "Medic Gear" </h3>
                <h3 class="HatsID"> id: 9,  name: "Miners Helmet" </h3>
                <h3 class="HatsID"> id: 32,  name: "Musketeer Hat" </h3>
                <h3 class="HatsID"> id: 7,  name: "Bull Helmet" </h3>
                <h3 class="HatsID"> id: 22,  name: "Emp Helmet" </h3>
                <h3 class="HatsID"> id: 12,  name: "Booster Hat" </h3>
                <h3 class="HatsID"> id: 26,  name: "Barbarian Armor" </h3>
                <h3 class="HatsID"> id: 21,  name: "Plague Mask" </h3>
                <h3 class="HatsID"> id: 46,  name: "Bull Mask" </h3>
                <h3 class="HatsID"> id: 14,  name: "Windmill Hat" </h3>
                <h3 class="HatsID"> id: 11,  name: "Spike Gear" </h3>
                <h3 class="HatsID"> id: 53,  name: "Turret Gear" </h3>
                <h3 class="HatsID"> id: 20,  name: "Samurai Armor" </h3>
                <h3 class="HatsID"> id: 16,  name: "Dark Knight" </h3>
                <h3 class="HatsID"> id: 27,  name: "Scavenger Gear" </h3>
                <h3 class="HatsID"> id: 40,  name: "Tank Gear" </h3>
                <h3 class="HatsID"> id: 52,  name: "Thief Gear" </h3>
                <h3 class="HatsID"> id: 55,  name: "Bloodthirster" </h3>
                <h3 class="HatsID"> id: 56,  name: "Assassin Gear" </h3>
        </div>
    </div>
</div>
`,vo=`
.keyPressLow {
    margin-left: 8px;
    font-size: 16px;
    margin-right: 8px;
    height: 25px;
    width: 50px;
    background-color: #fcfcfc;
    border-radius: 3.5px;
    border: none;
    text-align: center;
    color: #4A4A4A;
    border: 0.5px solid #f2f2f2;
}
.menuPrompt {
    font-size: 17px;
    font-family: 'Hammersmith One';
    color: #4A4A4A;
    flex: 0.2;
    text-align: center;
    margin-top: 10px;
    display: inline-block;
}
.modal {
    display: none;
    position: fixed;
    z-index: 1;
    left: 0;
    top: 0;
    overflow: auto;
    height: 100%;
    width: 100%;
}
.modal-content {
    margin: 10% auto;
    width: 40%;
    box-shadow: 0 5px 8px 0 rgba(0, 0, 0, 0.2), 0 7px 20px 0 rgba(0, 0, 0, 0.17);
    font-size: 14px;
    line-height: 1.6;
}
.modal-header {
    background: #000000;
    padding: 15px;
    color: #fff;
    border-top-left-radius: 5px;
    border-top-right-radius: 5px;
}
.modal-body {
    padding: 10px 20px;
    background: #fff;
}
.modal-footer {
    background: #000000;
    padding: 10px;
    color: #fff;
    text-align: center;
    border-bottom-left-radius: 5px;
    border-bottom-right-radius: 5px;
}
.closeit {
    color: #FF1100;
    float: right;
    font-size: 25px;
    color: #FF1100;
}
.closeit:hover,
.closeit:focus {
    color: #9e0c02;
    text-decoration: none;
    cursor: pointer;
}
.container {
  display: block;
  position: relative;
  padding-left: 35px;
  margin-bottom: 12px;
  cursor: pointer;
  font-size: 16px;
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  user-select: none;
}
.container input {
  position: absolute;
  opacity: 0;
  cursor: pointer;
  height: 0;
  width: 0;
}
.checkmark {
  position: absolute;
  top: 0;
  left: 0;
  height: 25px;
  width: 25px;
  background-color: #eee;
}
.container:hover input ~ .checkmark {
  background-color: #ccc;
}
.container input:checked ~ .checkmark {
  background-color: #000000;
}
.checkmark:after {
  content: "";
  position: absolute;
  display: none;
}
.container input:checked ~ .checkmark:after {
  display: block;
}

/* Style the checkmark/indicator */
.container .checkmark:after {
  left: 9px;
  top: 5px;
  width: 5px;
  height: 10px;
  border: solid white;
  border-width: 0 3px 3px 0;
  -webkit-transform: rotate(45deg);
  -ms-transform: rotate(45deg);
  transform: rotate(45deg);
}

`,Yn=`

	#sback, #okbtn {
		font-family: sans-serif;
		font-weight: 300;
		border: none;
		outline: none;
		font-size: 15px;

	}

	#sback {

		border-radius: 5px;
		padding: 9px;
		cursor: pointer;
		margin-top: -1.5px;
		background-color: #d85858;
		color: white;


	}

	#okbtn {

		border-radius: 5px;
		padding: 9px;
		cursor: pointer;
		margin-top: -1.5px;
		background-color: #7399d6;
		color: white;

	}

	#flexlow {
		display: flex;
		justify-content: space-evenly;
		align-items: center;
		width: 100%;

	}

	#changeAlert {
		font-family: sans-serif;
		font-weight: 200;
		font-size: 23px;


	}

	#typealert {
		font-family: sans-serif;
		font-weight: 200;
		font-size: 17px;
		width: 95%;
		margin-left: 2.5%;
		text-align: center;
		margin-top: 5.5px;
	}

#hatChangeAlert {
    position: absolute;
    padding: 5px;
    top: -300px;
    opacity: 0;
    left: 20px;
    width: 300px;
    height: 165px;
    border-radius: 10px;
    background-color: rgba(255, 255, 255, 0.7);
    box-shadow: 0 2px 5px 0 rgba(0, 0, 0, 0.08), 0 2px 10px 0 rgba(0, 0, 0, 0.06);



}

#changeAlert {
 display: inline-block;

}

#hatimgmain {
 	width: 50px;
 	height: 50px;
 	display: inline-block;


}

#flextop {
	display: flex;
	width: 100%;
	justify-content: space-evenly;
	align-items: center;

}

#tbtn {
 position: absolute;
 left: 0;
 top: 0;
 width: 80px;
 height: 80px;
 opacity: 0;

}

.chosenhat {
  border: 1px solid #7daaf2;
}

.chosenwing {
  border: 1px solid #7daaf2;
}

.inalertHat {
     margin-left: 30px !important;
     margin-top: 10px !important;
}

.inalertWing {
     margin-left: 30px !important;
     margin-top: 10px !important;
}

option {
  border-radius: 0px;
}

#hrule {
  margin-top: 20px;
}

#endwrap {
 margin-top: 15px;
 width: 100%;
text-align: center;
margin-bottom: -15px;
}

#createEnd {
width: 100%;
text-align: center;
margin: 0 auto;

}

.lowprompt {
margin-bottom: -100px !important;

}


.lowpromptdetail {
margin-left: 25px;
color: #4c4c4c !important;
margin-top: 20px !important;
margin-bottom: 0 !important;

}

.toplow {
  margin-top: 10px !important;
}


.objplace {
   width: 45px;
   height: 45px;
   margin-bottom: -17px;
   border: 0.5px solid #f2f2f2;
   border-radius: 10px;
   margin-left: 5px;
   cursor: pointer;
}

.selPrev {
width: 80px;
height: 80px;
display: block;
margin: auto;
margin-top: 10px;

}

#choiceWrap {
display: flex;
justify-content: space-evenly;
align-items: center;


}

#middlePlus {
display: inline-block;
width: 50px;
height: 50px;
font-weight: 100;
font-family: sans-serif;
color: #4A4A4A;
opacity: 0.8;

}

.selectObj {
cursor: pointer;
 width: 100px;
height: 100px;
background-color: #fcfcfc;
display: inline-block;
border-radius: 10px;
 box-shadow: 0 2px 5px 0 rgba(0, 0, 0, 0.08), 0 2px 10px 0 rgba(0, 0, 0, 0.06);

}


.selectObjAlert {
 cursor: pointer;
 width: 100px;
 height: 100px;
 background-color: #fcfcfc;
 display: inline-block;
 border-radius: 10px;
 box-shadow: 0 2px 5px 0 rgba(0, 0, 0, 0.08), 0 2px 10px 0 rgba(0, 0, 0, 0.06);

}

#mnwrap {
  width: 100%;
text-align: center;
margin-bottom: -7px;
margin-top: 8px;
}

#flexControl {


}

#keyPress {
   margin-left: 20px;
   height: 20px;
   width: 50px;
   background-color: #e5e3e3;
   border-radius: 7.5px;
font-size: 16px;
border: none;
text-align: center;
color: #4A4A4A;

}

.keyPressLow {
margin-left: 8px;
font-size: 16px;
margin-right: 8px;
   height: 25px;
   width: 50px;
   background-color: #fcfcfc;
   border-radius: 3.5px;
border: none;
text-align: center;
color: #4A4A4A;
   border: 0.5px solid #f2f2f2;


}

#keyPress:focus {
border: none;
outline: none;
}

.keyPressLow:focus{

outline: none;
}

input[type=range] {
  -webkit-appearance: none;
  margin-top: 0px;
  width: 100%;
}
input[type=range]:focus {
  outline: none;
}
#healSlider::-webkit-slider-runnable-track {
  width: 100%;
  height: 10px;
  cursor: pointer;
  animate: 0.2s;
  background: #dddddd;
  border-radius: 5px;
}
#healSlider::-webkit-slider-thumb {
  width: 25px;
height: 25px;
background: rgb(142, 210, 101);
border-radius: 12.5px;
margin-top: -6.25px;
  -webkit-appearance: none;

}


#speedContain {
width: 80%;
height: 40px;
background-color: #75d679;
border-radius: 20px;
margin-left: 10%;
box-shadow: 1px 1px 4px gray;
}

#currentSpeed {
height: 40px;
width: 100%;
text-align: center;

color: white;
font-weight: 400 !important;
font-family: sans-serif;
font-size: 20px;
}

#numfocus {
  background-color: white;
color: #75d679;
border-radius: 20px;
margin-right: -24%;
padding: 10px;
display: inline-block;
font-size: 20px;
font-weight: 400;
font-family: sans-serif;

}

#cspeed {
      display: inline-block;
      height: 300px;
margin-top: 0px;
margin-left: -10px;
color: white;
font-weight: 400 !important;
font-family: sans-serif;
font-size: 20px;

}



.menuPrompt {
font-size: 18px;
font-family: 'Hammersmith One';
color: #4A4A4A;
flex: 0.2;
text-align: center;
margin-top: 10px;
display: inline-block;

}

#mainSettings {
   width: 400px;
   height: 375px;
overflow-y: scroll;

}

#settingsTitle {
font-size: 32px;
font-family: 'Hammersmith One';
color: #4A4A4A;
width: 100%;
text-align: center;
margin-top: 10px;

}

#rmvMonkey {
   font-size: 16.5px;
   opacity: 0.9;

}



#infoDiv {
  position: absolute;
  left: -25%;
  right: 0%;
  text-align: center;
  background-color: rgba(252, 252, 252, 0.5);
  display: inline-block;
  box-shadow: 0 2px 5px 0 rgba(0, 0, 0, 0.08), 0 2px 10px 0 rgba(0, 0, 0, 0.06);

}

#autotitle {
  font-family: sans-serif;
  font-size: 30px;
  font-weight: 200;
}

#arrivalest {
  font-family: sans-serif;
  font-size: 20px;
  font-weight: 200;
}

#timeest {

}

#cancelTrip {
  background-color: rgb(203, 68, 74);
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 17px;
  font-family: sans-serif;
  cursor: pointer;
  outline: none;
  font-weight: 300;
  margin-bottom: 18px;
  width: 112px;
  height: 33.6px;

}

#spotDiv {
position: absolute;
width: 10px;
height: 10px;
marginLeft: -5px;
marginTop: -5px;
opacity: 1;
background-color: rgb(203, 68, 74);
left: 0;
right: 0;
border-radius: 5px;
z-index: 1000;

}

@media only screen and (max-width: 765px){
#numfocus {
margin-right: -13%;
}
}

#botText {
color: #5aed57;
font-size: 20px;
font-family: sans-serif;
font-weight: 300;
}

`,jt=`<h1 id="autotitle">You are currently in CloudyMod auto-pilot.</h1>
     <h3 id="arrivalest">You will arrive in <span id="timeest">30 seconds...</span></h3>

     <button type="button" id="cancelTrip">Cancel</button>`,Jn=`
  .open-menu-button {
    background-color: #ef3f3f;
    margin-top: 5px;
  }

  .open-menu-button:hover {
    background-color: rgb(130, 11, 11);
  }

  #mm-menu-container {
    cursor: url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAYAAADgdz34AAADq0lEQVRIS62VfWhTVxiHf+fem5sU7OwY0ylF2qZ2WKHKolVaqq1toBNEULv+IdtwBbGGCkVnq2MZ6wpDRZgMttUPWgcm1M90xn4gWh2rTKnT+oltvtOt2Iy022qaJjc5e2+qrAxGjUvg5V445z7Pec/v3FyWlZU1zDnf4PV67wLgVCn9sewlSzif/+ZN5vVXu91ub0rpBGM5a9dwYctGxL497nY/eqxPdRcst6yMv3HsBEIHD2Hico9DFIUih8MRSFUn7O21ZVx/5CTSpoCnR7+Gv6e9V6OTq1MlYUtL1vHC5lNIiwC6UBz3rAcwdMN22+vzrUhFF2xZUTlf39ieEKRFBcyJSzh3ohZDzp+uiKK42eVy/fF/RMywuoK/X3cWOrUDEugUAelMg47uzyI9dy0todDk/kAgMPGqEraqsILvqrkAbZQRXIQuxqBVGCQlDMvPzZMX75/Z7/F4vnplQdEKIzdv7SCoAG1MgBwnAZWGM8SUcXx6eQdu/3prM72IHSSJJStiJQYjP1xlhxwTIRNUotIQRWJ0z4DApAfmq7uDAyN3ttGLaKeheDISVvqOkbds6iSwCAnTUEkARLWk6XoSfIiP7XW/+8a9xRT6YFKCdST4flMXRCZOQ8V/wJQ1BComA/YHNnz+gxmT0dBip9PpeFkJKyfB6eouCEQWnq84ASZo4qollHpPdfqmFfuON44KkvAeBX/9ZSSsgkK+8GEXmESCGWBGYBWqFl5I6No90I2afdt8Wq22lIJ3zyZhxkIj76ilDjQiVKi68sSKn0N/dPVi5K8RhJUpTEXDiEQj6OvvQ/8v/X4KfdHsgtVGfnEvZSCTgMCDgUEsfGsB0l9PT6x81+E6dPZeCtA345sZMC4IQoQC/3J2QbGRX/qCOiCB55kLVXuqcMh8EGWGcqjndTw2huUlywZpS1bSH+CfswH/Pc6Ma0hwpBPDoWEUVxWN6bS68xPPJjb4B4bnyWnUEklqTB/xa9evmWlLmpMWlJdW8Ma6BjQ0NziDY8FP6HS0Z2dnn9m5Y+eW3fV76MwCDucQKisr7YqifODz+caSkbC8vDw+97W5/aOB0e10Ku6oD+v1+nmZmZlPbTYbMjIyEA6H0dTUpFgslgKa8zgpQU5OzlUKsJbafzLzQRK0mEym7fX19aAxtLa2xq1W63d+v9+UlOC/Jufm5uoLCgr68vPz57e1td2SZdkWjUZPkuC3lAgMBoMmGAy+G4/H1e+zh7ZmJBnwi7l/A8cKjSjK8EZAAAAAAElFTkSuQmCC") 0 0 , auto !important;
    user-select: none;
    font-size: 14px;
    overflow: hidden;
    color: #fff;
    font-family: Verdana,sans-serif;
    box-sizing: border-box;
    position: fixed;
    top: 50%;
    left: 50%;
    height: 366px;
    width: 500px;
    margin-top: -183px;
    margin-left: -250px;
    z-index: 2147000000;
  }

  .i-checkbox-label {
    font-size: 12px;
    user-select: none;
    color: #fff;
    font-family: Verdana,sans-serif;
    box-sizing: border-box;
    cursor: url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAYAAADgdz34AAADq0lEQVRIS62VfWhTVxiHf+fem5sU7OwY0ylF2qZ2WKHKolVaqq1toBNEULv+IdtwBbGGCkVnq2MZ6wpDRZgMttUPWgcm1M90xn4gWh2rTKnT+oltvtOt2Iy022qaJjc5e2+qrAxGjUvg5V445z7Pec/v3FyWlZU1zDnf4PV67wLgVCn9sewlSzif/+ZN5vVXu91ub0rpBGM5a9dwYctGxL497nY/eqxPdRcst6yMv3HsBEIHD2Hico9DFIUih8MRSFUn7O21ZVx/5CTSpoCnR7+Gv6e9V6OTq1MlYUtL1vHC5lNIiwC6UBz3rAcwdMN22+vzrUhFF2xZUTlf39ieEKRFBcyJSzh3ohZDzp+uiKK42eVy/fF/RMywuoK/X3cWOrUDEugUAelMg47uzyI9dy0todDk/kAgMPGqEraqsILvqrkAbZQRXIQuxqBVGCQlDMvPzZMX75/Z7/F4vnplQdEKIzdv7SCoAG1MgBwnAZWGM8SUcXx6eQdu/3prM72IHSSJJStiJQYjP1xlhxwTIRNUotIQRWJ0z4DApAfmq7uDAyN3ttGLaKeheDISVvqOkbds6iSwCAnTUEkARLWk6XoSfIiP7XW/+8a9xRT6YFKCdST4flMXRCZOQ8V/wJQ1BComA/YHNnz+gxmT0dBip9PpeFkJKyfB6eouCEQWnq84ASZo4qollHpPdfqmFfuON44KkvAeBX/9ZSSsgkK+8GEXmESCGWBGYBWqFl5I6No90I2afdt8Wq22lIJ3zyZhxkIj76ilDjQiVKi68sSKn0N/dPVi5K8RhJUpTEXDiEQj6OvvQ/8v/X4KfdHsgtVGfnEvZSCTgMCDgUEsfGsB0l9PT6x81+E6dPZeCtA345sZMC4IQoQC/3J2QbGRX/qCOiCB55kLVXuqcMh8EGWGcqjndTw2huUlywZpS1bSH+CfswH/Pc6Ma0hwpBPDoWEUVxWN6bS68xPPJjb4B4bnyWnUEklqTB/xa9evmWlLmpMWlJdW8Ma6BjQ0NziDY8FP6HS0Z2dnn9m5Y+eW3fV76MwCDucQKisr7YqifODz+caSkbC8vDw+97W5/aOB0e10Ku6oD+v1+nmZmZlPbTYbMjIyEA6H0dTUpFgslgKa8zgpQU5OzlUKsJbafzLzQRK0mEym7fX19aAxtLa2xq1W63d+v9+UlOC/Jufm5uoLCgr68vPz57e1td2SZdkWjUZPkuC3lAgMBoMmGAy+G4/H1e+zh7ZmJBnwi7l/A8cKjSjK8EZAAAAAAElFTkSuQmCC") 0 0 , auto !important;
    display: block;
    margin: 4px;
  }

  .i-checkbox-label {
    font-size: 12px;
    user-select: none;
    color: #fff;
    font-family: Verdana,sans-serif;
    box-sizing: border-box;
    cursor: url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAYAAADgdz34AAADq0lEQVRIS62VfWhTVxiHf+fem5sU7OwY0ylF2qZ2WKHKolVaqq1toBNEULv+IdtwBbGGCkVnq2MZ6wpDRZgMttUPWgcm1M90xn4gWh2rTKnT+oltvtOt2Iy022qaJjc5e2+qrAxGjUvg5V445z7Pec/v3FyWlZU1zDnf4PV67wLgVCn9sewlSzif/+ZN5vVXu91ub0rpBGM5a9dwYctGxL497nY/eqxPdRcst6yMv3HsBEIHD2Hico9DFIUih8MRSFUn7O21ZVx/5CTSpoCnR7+Gv6e9V6OTq1MlYUtL1vHC5lNIiwC6UBz3rAcwdMN22+vzrUhFF2xZUTlf39ieEKRFBcyJSzh3ohZDzp+uiKK42eVy/fF/RMywuoK/X3cWOrUDEugUAelMg47uzyI9dy0todDk/kAgMPGqEraqsILvqrkAbZQRXIQuxqBVGCQlDMvPzZMX75/Z7/F4vnplQdEKIzdv7SCoAG1MgBwnAZWGM8SUcXx6eQdu/3prM72IHSSJJStiJQYjP1xlhxwTIRNUotIQRWJ0z4DApAfmq7uDAyN3ttGLaKeheDISVvqOkbds6iSwCAnTUEkARLWk6XoSfIiP7XW/+8a9xRT6YFKCdST4flMXRCZOQ8V/wJQ1BComA/YHNnz+gxmT0dBip9PpeFkJKyfB6eouCEQWnq84ASZo4qollHpPdfqmFfuON44KkvAeBX/9ZSSsgkK+8GEXmESCGWBGYBWqFl5I6No90I2afdt8Wq22lIJ3zyZhxkIj76ilDjQiVKi68sSKn0N/dPVi5K8RhJUpTEXDiEQj6OvvQ/8v/X4KfdHsgtVGfnEvZSCTgMCDgUEsfGsB0l9PT6x81+E6dPZeCtA345sZMC4IQoQC/3J2QbGRX/qCOiCB55kLVXuqcMh8EGWGcqjndTw2huUlywZpS1bSH+CfswH/Pc6Ma0hwpBPDoWEUVxWN6bS68xPPJjb4B4bnyWnUEklqTB/xa9evmWlLmpMWlJdW8Ma6BjQ0NziDY8FP6HS0Z2dnn9m5Y+eW3fV76MwCDucQKisr7YqifODz+caSkbC8vDw+97W5/aOB0e10Ku6oD+v1+nmZmZlPbTYbMjIyEA6H0dTUpFgslgKa8zgpQU5OzlUKsJbafzLzQRK0mEym7fX19aAxtLa2xq1W63d+v9+UlOC/Jufm5uoLCgr68vPz57e1td2SZdkWjUZPkuC3lAgMBoMmGAy+G4/H1e+zh7ZmJBnwi7l/A8cKjSjK8EZAAAAAAElFTkSuQmCC") 0 0 , auto !important;
  }

  #mm-main-menu {
    cursor: url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAYAAADgdz34AAADq0lEQVRIS62VfWhTVxiHf+fem5sU7OwY0ylF2qZ2WKHKolVaqq1toBNEULv+IdtwBbGGCkVnq2MZ6wpDRZgMttUPWgcm1M90xn4gWh2rTKnT+oltvtOt2Iy022qaJjc5e2+qrAxGjUvg5V445z7Pec/v3FyWlZU1zDnf4PV67wLgVCn9sewlSzif/+ZN5vVXu91ub0rpBGM5a9dwYctGxL497nY/eqxPdRcst6yMv3HsBEIHD2Hico9DFIUih8MRSFUn7O21ZVx/5CTSpoCnR7+Gv6e9V6OTq1MlYUtL1vHC5lNIiwC6UBz3rAcwdMN22+vzrUhFF2xZUTlf39ieEKRFBcyJSzh3ohZDzp+uiKK42eVy/fF/RMywuoK/X3cWOrUDEugUAelMg47uzyI9dy0todDk/kAgMPGqEraqsILvqrkAbZQRXIQuxqBVGCQlDMvPzZMX75/Z7/F4vnplQdEKIzdv7SCoAG1MgBwnAZWGM8SUcXx6eQdu/3prM72IHSSJJStiJQYjP1xlhxwTIRNUotIQRWJ0z4DApAfmq7uDAyN3ttGLaKeheDISVvqOkbds6iSwCAnTUEkARLWk6XoSfIiP7XW/+8a9xRT6YFKCdST4flMXRCZOQ8V/wJQ1BComA/YHNnz+gxmT0dBip9PpeFkJKyfB6eouCEQWnq84ASZo4qollHpPdfqmFfuON44KkvAeBX/9ZSSsgkK+8GEXmESCGWBGYBWqFl5I6No90I2afdt8Wq22lIJ3zyZhxkIj76ilDjQiVKi68sSKn0N/dPVi5K8RhJUpTEXDiEQj6OvvQ/8v/X4KfdHsgtVGfnEvZSCTgMCDgUEsfGsB0l9PT6x81+E6dPZeCtA345sZMC4IQoQC/3J2QbGRX/qCOiCB55kLVXuqcMh8EGWGcqjndTw2huUlywZpS1bSH+CfswH/Pc6Ma0hwpBPDoWEUVxWN6bS68xPPJjb4B4bnyWnUEklqTB/xa9evmWlLmpMWlJdW8Ma6BjQ0NziDY8FP6HS0Z2dnn9m5Y+eW3fV76MwCDucQKisr7YqifODz+caSkbC8vDw+97W5/aOB0e10Ku6oD+v1+nmZmZlPbTYbMjIyEA6H0dTUpFgslgKa8zgpQU5OzlUKsJbafzLzQRK0mEym7fX19aAxtLa2xq1W63d+v9+UlOC/Jufm5uoLCgr68vPz57e1td2SZdkWjUZPkuC3lAgMBoMmGAy+G4/H1e+zh7ZmJBnwi7l/A8cKjSjK8EZAAAAAAElFTkSuQmCC") 0 0 , auto !important;
    font-size: 12px;
    user-select: none;
    color: #fff;
    font-family: Verdana,sans-serif;
    box-sizing: border-box;
    position: relative;
    height: 100%;
    padding: .5em 1em;
    border-top: none;
    margin-left: 130px;
    display: none;
  }
  #mm-offense-menu {
    cursor: url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAYAAADgdz34AAADq0lEQVRIS62VfWhTVxiHf+fem5sU7OwY0ylF2qZ2WKHKolVaqq1toBNEULv+IdtwBbGGCkVnq2MZ6wpDRZgMttUPWgcm1M90xn4gWh2rTKnT+oltvtOt2Iy022qaJjc5e2+qrAxGjUvg5V445z7Pec/v3FyWlZU1zDnf4PV67wLgVCn9sewlSzif/+ZN5vVXu91ub0rpBGM5a9dwYctGxL497nY/eqxPdRcst6yMv3HsBEIHD2Hico9DFIUih8MRSFUn7O21ZVx/5CTSpoCnR7+Gv6e9V6OTq1MlYUtL1vHC5lNIiwC6UBz3rAcwdMN22+vzrUhFF2xZUTlf39ieEKRFBcyJSzh3ohZDzp+uiKK42eVy/fF/RMywuoK/X3cWOrUDEugUAelMg47uzyI9dy0todDk/kAgMPGqEraqsILvqrkAbZQRXIQuxqBVGCQlDMvPzZMX75/Z7/F4vnplQdEKIzdv7SCoAG1MgBwnAZWGM8SUcXx6eQdu/3prM72IHSSJJStiJQYjP1xlhxwTIRNUotIQRWJ0z4DApAfmq7uDAyN3ttGLaKeheDISVvqOkbds6iSwCAnTUEkARLWk6XoSfIiP7XW/+8a9xRT6YFKCdST4flMXRCZOQ8V/wJQ1BComA/YHNnz+gxmT0dBip9PpeFkJKyfB6eouCEQWnq84ASZo4qollHpPdfqmFfuON44KkvAeBX/9ZSSsgkK+8GEXmESCGWBGYBWqFl5I6No90I2afdt8Wq22lIJ3zyZhxkIj76ilDjQiVKi68sSKn0N/dPVi5K8RhJUpTEXDiEQj6OvvQ/8v/X4KfdHsgtVGfnEvZSCTgMCDgUEsfGsB0l9PT6x81+E6dPZeCtA345sZMC4IQoQC/3J2QbGRX/qCOiCB55kLVXuqcMh8EGWGcqjndTw2huUlywZpS1bSH+CfswH/Pc6Ma0hwpBPDoWEUVxWN6bS68xPPJjb4B4bnyWnUEklqTB/xa9evmWlLmpMWlJdW8Ma6BjQ0NziDY8FP6HS0Z2dnn9m5Y+eW3fV76MwCDucQKisr7YqifODz+caSkbC8vDw+97W5/aOB0e10Ku6oD+v1+nmZmZlPbTYbMjIyEA6H0dTUpFgslgKa8zgpQU5OzlUKsJbafzLzQRK0mEym7fX19aAxtLa2xq1W63d+v9+UlOC/Jufm5uoLCgr68vPz57e1td2SZdkWjUZPkuC3lAgMBoMmGAy+G4/H1e+zh7ZmJBnwi7l/A8cKjSjK8EZAAAAAAElFTkSuQmCC") 0 0 , auto !important;
    font-size: 12px;
    user-select: none;
    color: #fff;
    font-family: Verdana,sans-serif;
    box-sizing: border-box;
    position: relative;
    height: 100%;
    padding: .5em 1em;
    border-top: none;
    margin-left: 130px;
    display: block;
  }

  #mm-defense-menu {
cursor: url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAYAAADgdz34AAADq0lEQVRIS62VfWhTVxiHf+fem5sU7OwY0ylF2qZ2WKHKolVaqq1toBNEULv+IdtwBbGGCkVnq2MZ6wpDRZgMttUPWgcm1M90xn4gWh2rTKnT+oltvtOt2Iy022qaJjc5e2+qrAxGjUvg5V445z7Pec/v3FyWlZU1zDnf4PV67wLgVCn9sewlSzif/+ZN5vVXu91ub0rpBGM5a9dwYctGxL497nY/eqxPdRcst6yMv3HsBEIHD2Hico9DFIUih8MRSFUn7O21ZVx/5CTSpoCnR7+Gv6e9V6OTq1MlYUtL1vHC5lNIiwC6UBz3rAcwdMN22+vzrUhFF2xZUTlf39ieEKRFBcyJSzh3ohZDzp+uiKK42eVy/fF/RMywuoK/X3cWOrUDEugUAelMg47uzyI9dy0todDk/kAgMPGqEraqsILvqrkAbZQRXIQuxqBVGCQlDMvPzZMX75/Z7/F4vnplQdEKIzdv7SCoAG1MgBwnAZWGM8SUcXx6eQdu/3prM72IHSSJJStiJQYjP1xlhxwTIRNUotIQRWJ0z4DApAfmq7uDAyN3ttGLaKeheDISVvqOkbds6iSwCAnTUEkARLWk6XoSfIiP7XW/+8a9xRT6YFKCdST4flMXRCZOQ8V/wJQ1BComA/YHNnz+gxmT0dBip9PpeFkJKyfB6eouCEQWnq84ASZo4qollHpPdfqmFfuON44KkvAeBX/9ZSSsgkK+8GEXmESCGWBGYBWqFl5I6No90I2afdt8Wq22lIJ3zyZhxkIj76ilDjQiVKi68sSKn0N/dPVi5K8RhJUpTEXDiEQj6OvvQ/8v/X4KfdHsgtVGfnEvZSCTgMCDgUEsfGsB0l9PT6x81+E6dPZeCtA345sZMC4IQoQC/3J2QbGRX/qCOiCB55kLVXuqcMh8EGWGcqjndTw2huUlywZpS1bSH+CfswH/Pc6Ma0hwpBPDoWEUVxWN6bS68xPPJjb4B4bnyWnUEklqTB/xa9evmWlLmpMWlJdW8Ma6BjQ0NziDY8FP6HS0Z2dnn9m5Y+eW3fV76MwCDucQKisr7YqifODz+caSkbC8vDw+97W5/aOB0e10Ku6oD+v1+nmZmZlPbTYbMjIyEA6H0dTUpFgslgKa8zgpQU5OzlUKsJbafzLzQRK0mEym7fX19aAxtLa2xq1W63d+v9+UlOC/Jufm5uoLCgr68vPz57e1td2SZdkWjUZPkuC3lAgMBoMmGAy+G4/H1e+zh7ZmJBnwi7l/A8cKjSjK8EZAAAAAAElFTkSuQmCC") 0 0 , auto !important;
font-size: 12px;
user-select: none;
color: #fff;
font-family: Verdana,sans-serif;
box-sizing: border-box;
position: relative;
height: 100%;
padding: .5em 1em;
border-top: none;
margin-left: 130px;
display: none;
  }

  #mm-support-menu {
cursor: url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAYAAADgdz34AAADq0lEQVRIS62VfWhTVxiHf+fem5sU7OwY0ylF2qZ2WKHKolVaqq1toBNEULv+IdtwBbGGCkVnq2MZ6wpDRZgMttUPWgcm1M90xn4gWh2rTKnT+oltvtOt2Iy022qaJjc5e2+qrAxGjUvg5V445z7Pec/v3FyWlZU1zDnf4PV67wLgVCn9sewlSzif/+ZN5vVXu91ub0rpBGM5a9dwYctGxL497nY/eqxPdRcst6yMv3HsBEIHD2Hico9DFIUih8MRSFUn7O21ZVx/5CTSpoCnR7+Gv6e9V6OTq1MlYUtL1vHC5lNIiwC6UBz3rAcwdMN22+vzrUhFF2xZUTlf39ieEKRFBcyJSzh3ohZDzp+uiKK42eVy/fF/RMywuoK/X3cWOrUDEugUAelMg47uzyI9dy0todDk/kAgMPGqEraqsILvqrkAbZQRXIQuxqBVGCQlDMvPzZMX75/Z7/F4vnplQdEKIzdv7SCoAG1MgBwnAZWGM8SUcXx6eQdu/3prM72IHSSJJStiJQYjP1xlhxwTIRNUotIQRWJ0z4DApAfmq7uDAyN3ttGLaKeheDISVvqOkbds6iSwCAnTUEkARLWk6XoSfIiP7XW/+8a9xRT6YFKCdST4flMXRCZOQ8V/wJQ1BComA/YHNnz+gxmT0dBip9PpeFkJKyfB6eouCEQWnq84ASZo4qollHpPdfqmFfuON44KkvAeBX/9ZSSsgkK+8GEXmESCGWBGYBWqFl5I6No90I2afdt8Wq22lIJ3zyZhxkIj76ilDjQiVKi68sSKn0N/dPVi5K8RhJUpTEXDiEQj6OvvQ/8v/X4KfdHsgtVGfnEvZSCTgMCDgUEsfGsB0l9PT6x81+E6dPZeCtA345sZMC4IQoQC/3J2QbGRX/qCOiCB55kLVXuqcMh8EGWGcqjndTw2huUlywZpS1bSH+CfswH/Pc6Ma0hwpBPDoWEUVxWN6bS68xPPJjb4B4bnyWnUEklqTB/xa9evmWlLmpMWlJdW8Ma6BjQ0NziDY8FP6HS0Z2dnn9m5Y+eW3fV76MwCDucQKisr7YqifODz+caSkbC8vDw+97W5/aOB0e10Ku6oD+v1+nmZmZlPbTYbMjIyEA6H0dTUpFgslgKa8zgpQU5OzlUKsJbafzLzQRK0mEym7fX19aAxtLa2xq1W63d+v9+UlOC/Jufm5uoLCgr68vPz57e1td2SZdkWjUZPkuC3lAgMBoMmGAy+G4/H1e+zh7ZmJBnwi7l/A8cKjSjK8EZAAAAAAElFTkSuQmCC") 0 0 , auto !important;
font-size: 12px;
user-select: none;
color: #fff;
font-family: Verdana,sans-serif;
box-sizing: border-box;
position: relative;
height: 100%;
padding: .5em 1em;
border-top: none;
margin-left: 130px;
display: none;
  }
  #mm-map-menu {
cursor: url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAYAAADgdz34AAADq0lEQVRIS62VfWhTVxiHf+fem5sU7OwY0ylF2qZ2WKHKolVaqq1toBNEULv+IdtwBbGGCkVnq2MZ6wpDRZgMttUPWgcm1M90xn4gWh2rTKnT+oltvtOt2Iy022qaJjc5e2+qrAxGjUvg5V445z7Pec/v3FyWlZU1zDnf4PV67wLgVCn9sewlSzif/+ZN5vVXu91ub0rpBGM5a9dwYctGxL497nY/eqxPdRcst6yMv3HsBEIHD2Hico9DFIUih8MRSFUn7O21ZVx/5CTSpoCnR7+Gv6e9V6OTq1MlYUtL1vHC5lNIiwC6UBz3rAcwdMN22+vzrUhFF2xZUTlf39ieEKRFBcyJSzh3ohZDzp+uiKK42eVy/fF/RMywuoK/X3cWOrUDEugUAelMg47uzyI9dy0todDk/kAgMPGqEraqsILvqrkAbZQRXIQuxqBVGCQlDMvPzZMX75/Z7/F4vnplQdEKIzdv7SCoAG1MgBwnAZWGM8SUcXx6eQdu/3prM72IHSSJJStiJQYjP1xlhxwTIRNUotIQRWJ0z4DApAfmq7uDAyN3ttGLaKeheDISVvqOkbds6iSwCAnTUEkARLWk6XoSfIiP7XW/+8a9xRT6YFKCdST4flMXRCZOQ8V/wJQ1BComA/YHNnz+gxmT0dBip9PpeFkJKyfB6eouCEQWnq84ASZo4qollHpPdfqmFfuON44KkvAeBX/9ZSSsgkK+8GEXmESCGWBGYBWqFl5I6No90I2afdt8Wq22lIJ3zyZhxkIj76ilDjQiVKi68sSKn0N/dPVi5K8RhJUpTEXDiEQj6OvvQ/8v/X4KfdHsgtVGfnEvZSCTgMCDgUEsfGsB0l9PT6x81+E6dPZeCtA345sZMC4IQoQC/3J2QbGRX/qCOiCB55kLVXuqcMh8EGWGcqjndTw2huUlywZpS1bSH+CfswH/Pc6Ma0hwpBPDoWEUVxWN6bS68xPPJjb4B4bnyWnUEklqTB/xa9evmWlLmpMWlJdW8Ma6BjQ0NziDY8FP6HS0Z2dnn9m5Y+eW3fV76MwCDucQKisr7YqifODz+caSkbC8vDw+97W5/aOB0e10Ku6oD+v1+nmZmZlPbTYbMjIyEA6H0dTUpFgslgKa8zgpQU5OzlUKsJbafzLzQRK0mEym7fX19aAxtLa2xq1W63d+v9+UlOC/Jufm5uoLCgr68vPz57e1td2SZdkWjUZPkuC3lAgMBoMmGAy+G4/H1e+zh7ZmJBnwi7l/A8cKjSjK8EZAAAAAAElFTkSuQmCC") 0 0 , auto !important;
font-size: 12px;
user-select: none;
color: #fff;
font-family: Verdana,sans-serif;
box-sizing: border-box;
position: relative;
height: 100%;
padding: .5em 1em;
border-top: none;
margin-left: 130px;
display: none;
  }
  #mm-controls-menu {
cursor: url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAYAAADgdz34AAADq0lEQVRIS62VfWhTVxiHf+fem5sU7OwY0ylF2qZ2WKHKolVaqq1toBNEULv+IdtwBbGGCkVnq2MZ6wpDRZgMttUPWgcm1M90xn4gWh2rTKnT+oltvtOt2Iy022qaJjc5e2+qrAxGjUvg5V445z7Pec/v3FyWlZU1zDnf4PV67wLgVCn9sewlSzif/+ZN5vVXu91ub0rpBGM5a9dwYctGxL497nY/eqxPdRcst6yMv3HsBEIHD2Hico9DFIUih8MRSFUn7O21ZVx/5CTSpoCnR7+Gv6e9V6OTq1MlYUtL1vHC5lNIiwC6UBz3rAcwdMN22+vzrUhFF2xZUTlf39ieEKRFBcyJSzh3ohZDzp+uiKK42eVy/fF/RMywuoK/X3cWOrUDEugUAelMg47uzyI9dy0todDk/kAgMPGqEraqsILvqrkAbZQRXIQuxqBVGCQlDMvPzZMX75/Z7/F4vnplQdEKIzdv7SCoAG1MgBwnAZWGM8SUcXx6eQdu/3prM72IHSSJJStiJQYjP1xlhxwTIRNUotIQRWJ0z4DApAfmq7uDAyN3ttGLaKeheDISVvqOkbds6iSwCAnTUEkARLWk6XoSfIiP7XW/+8a9xRT6YFKCdST4flMXRCZOQ8V/wJQ1BComA/YHNnz+gxmT0dBip9PpeFkJKyfB6eouCEQWnq84ASZo4qollHpPdfqmFfuON44KkvAeBX/9ZSSsgkK+8GEXmESCGWBGYBWqFl5I6No90I2afdt8Wq22lIJ3zyZhxkIj76ilDjQiVKi68sSKn0N/dPVi5K8RhJUpTEXDiEQj6OvvQ/8v/X4KfdHsgtVGfnEvZSCTgMCDgUEsfGsB0l9PT6x81+E6dPZeCtA345sZMC4IQoQC/3J2QbGRX/qCOiCB55kLVXuqcMh8EGWGcqjndTw2huUlywZpS1bSH+CfswH/Pc6Ma0hwpBPDoWEUVxWN6bS68xPPJjb4B4bnyWnUEklqTB/xa9evmWlLmpMWlJdW8Ma6BjQ0NziDY8FP6HS0Z2dnn9m5Y+eW3fV76MwCDucQKisr7YqifODz+caSkbC8vDw+97W5/aOB0e10Ku6oD+v1+nmZmZlPbTYbMjIyEA6H0dTUpFgslgKa8zgpQU5OzlUKsJbafzLzQRK0mEym7fX19aAxtLa2xq1W63d+v9+UlOC/Jufm5uoLCgr68vPz57e1td2SZdkWjUZPkuC3lAgMBoMmGAy+G4/H1e+zh7ZmJBnwi7l/A8cKjSjK8EZAAAAAAElFTkSuQmCC") 0 0 , auto !important;
font-size: 12px;
user-select: none;
color: #fff;
font-family: Verdana,sans-serif;
box-sizing: border-box;
position: relative;
height: 100%;
padding: .5em 1em;
border-top: none;
margin-left: 130px;
display: none;
  }
  #mm-help-menu {
cursor: url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAYAAADgdz34AAADq0lEQVRIS62VfWhTVxiHf+fem5sU7OwY0ylF2qZ2WKHKolVaqq1toBNEULv+IdtwBbGGCkVnq2MZ6wpDRZgMttUPWgcm1M90xn4gWh2rTKnT+oltvtOt2Iy022qaJjc5e2+qrAxGjUvg5V445z7Pec/v3FyWlZU1zDnf4PV67wLgVCn9sewlSzif/+ZN5vVXu91ub0rpBGM5a9dwYctGxL497nY/eqxPdRcst6yMv3HsBEIHD2Hico9DFIUih8MRSFUn7O21ZVx/5CTSpoCnR7+Gv6e9V6OTq1MlYUtL1vHC5lNIiwC6UBz3rAcwdMN22+vzrUhFF2xZUTlf39ieEKRFBcyJSzh3ohZDzp+uiKK42eVy/fF/RMywuoK/X3cWOrUDEugUAelMg47uzyI9dy0todDk/kAgMPGqEraqsILvqrkAbZQRXIQuxqBVGCQlDMvPzZMX75/Z7/F4vnplQdEKIzdv7SCoAG1MgBwnAZWGM8SUcXx6eQdu/3prM72IHSSJJStiJQYjP1xlhxwTIRNUotIQRWJ0z4DApAfmq7uDAyN3ttGLaKeheDISVvqOkbds6iSwCAnTUEkARLWk6XoSfIiP7XW/+8a9xRT6YFKCdST4flMXRCZOQ8V/wJQ1BComA/YHNnz+gxmT0dBip9PpeFkJKyfB6eouCEQWnq84ASZo4qollHpPdfqmFfuON44KkvAeBX/9ZSSsgkK+8GEXmESCGWBGYBWqFl5I6No90I2afdt8Wq22lIJ3zyZhxkIj76ilDjQiVKi68sSKn0N/dPVi5K8RhJUpTEXDiEQj6OvvQ/8v/X4KfdHsgtVGfnEvZSCTgMCDgUEsfGsB0l9PT6x81+E6dPZeCtA345sZMC4IQoQC/3J2QbGRX/qCOiCB55kLVXuqcMh8EGWGcqjndTw2huUlywZpS1bSH+CfswH/Pc6Ma0hwpBPDoWEUVxWN6bS68xPPJjb4B4bnyWnUEklqTB/xa9evmWlLmpMWlJdW8Ma6BjQ0NziDY8FP6HS0Z2dnn9m5Y+eW3fV76MwCDucQKisr7YqifODz+caSkbC8vDw+97W5/aOB0e10Ku6oD+v1+nmZmZlPbTYbMjIyEA6H0dTUpFgslgKa8zgpQU5OzlUKsJbafzLzQRK0mEym7fX19aAxtLa2xq1W63d+v9+UlOC/Jufm5uoLCgr68vPz57e1td2SZdkWjUZPkuC3lAgMBoMmGAy+G4/H1e+zh7ZmJBnwi7l/A8cKjSjK8EZAAAAAAElFTkSuQmCC") 0 0 , auto !important;
font-size: 12px;
user-select: none;
color: #fff;
font-family: Verdana,sans-serif;
box-sizing: border-box;
position: relative;
height: 100%;
padding: .5em 1em;
border-top: none;
margin-left: 130px;
display: none;
  }



  .i-tab-container {
    cursor: url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAYAAADgdz34AAADq0lEQVRIS62VfWhTVxiHf+fem5sU7OwY0ylF2qZ2WKHKolVaqq1toBNEULv+IdtwBbGGCkVnq2MZ6wpDRZgMttUPWgcm1M90xn4gWh2rTKnT+oltvtOt2Iy022qaJjc5e2+qrAxGjUvg5V445z7Pec/v3FyWlZU1zDnf4PV67wLgVCn9sewlSzif/+ZN5vVXu91ub0rpBGM5a9dwYctGxL497nY/eqxPdRcst6yMv3HsBEIHD2Hico9DFIUih8MRSFUn7O21ZVx/5CTSpoCnR7+Gv6e9V6OTq1MlYUtL1vHC5lNIiwC6UBz3rAcwdMN22+vzrUhFF2xZUTlf39ieEKRFBcyJSzh3ohZDzp+uiKK42eVy/fF/RMywuoK/X3cWOrUDEugUAelMg47uzyI9dy0todDk/kAgMPGqEraqsILvqrkAbZQRXIQuxqBVGCQlDMvPzZMX75/Z7/F4vnplQdEKIzdv7SCoAG1MgBwnAZWGM8SUcXx6eQdu/3prM72IHSSJJStiJQYjP1xlhxwTIRNUotIQRWJ0z4DApAfmq7uDAyN3ttGLaKeheDISVvqOkbds6iSwCAnTUEkARLWk6XoSfIiP7XW/+8a9xRT6YFKCdST4flMXRCZOQ8V/wJQ1BComA/YHNnz+gxmT0dBip9PpeFkJKyfB6eouCEQWnq84ASZo4qollHpPdfqmFfuON44KkvAeBX/9ZSSsgkK+8GEXmESCGWBGYBWqFl5I6No90I2afdt8Wq22lIJ3zyZhxkIj76ilDjQiVKi68sSKn0N/dPVi5K8RhJUpTEXDiEQj6OvvQ/8v/X4KfdHsgtVGfnEvZSCTgMCDgUEsfGsB0l9PT6x81+E6dPZeCtA345sZMC4IQoQC/3J2QbGRX/qCOiCB55kLVXuqcMh8EGWGcqjndTw2huUlywZpS1bSH+CfswH/Pc6Ma0hwpBPDoWEUVxWN6bS68xPPJjb4B4bnyWnUEklqTB/xa9evmWlLmpMWlJdW8Ma6BjQ0NziDY8FP6HS0Z2dnn9m5Y+eW3fV76MwCDucQKisr7YqifODz+caSkbC8vDw+97W5/aOB0e10Ku6oD+v1+nmZmZlPbTYbMjIyEA6H0dTUpFgslgKa8zgpQU5OzlUKsJbafzLzQRK0mEym7fX19aAxtLa2xq1W63d+v9+UlOC/Jufm5uoLCgr68vPz57e1td2SZdkWjUZPkuC3lAgMBoMmGAy+G4/H1e+zh7ZmJBnwi7l/A8cKjSjK8EZAAAAAAElFTkSuQmCC") 0 0 , auto !important;
    font-size: 12px;
    user-select: none;
    color: #fff;
    font-family: Verdana,sans-serif;
    box-sizing: border-box;
    width: 100%;
    height: 100%;
    background-color: #222;
  }

  .i-tab-menu, .sidebar {
    cursor: url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAYAAADgdz34AAADq0lEQVRIS62VfWhTVxiHf+fem5sU7OwY0ylF2qZ2WKHKolVaqq1toBNEULv+IdtwBbGGCkVnq2MZ6wpDRZgMttUPWgcm1M90xn4gWh2rTKnT+oltvtOt2Iy022qaJjc5e2+qrAxGjUvg5V445z7Pec/v3FyWlZU1zDnf4PV67wLgVCn9sewlSzif/+ZN5vVXu91ub0rpBGM5a9dwYctGxL497nY/eqxPdRcst6yMv3HsBEIHD2Hico9DFIUih8MRSFUn7O21ZVx/5CTSpoCnR7+Gv6e9V6OTq1MlYUtL1vHC5lNIiwC6UBz3rAcwdMN22+vzrUhFF2xZUTlf39ieEKRFBcyJSzh3ohZDzp+uiKK42eVy/fF/RMywuoK/X3cWOrUDEugUAelMg47uzyI9dy0todDk/kAgMPGqEraqsILvqrkAbZQRXIQuxqBVGCQlDMvPzZMX75/Z7/F4vnplQdEKIzdv7SCoAG1MgBwnAZWGM8SUcXx6eQdu/3prM72IHSSJJStiJQYjP1xlhxwTIRNUotIQRWJ0z4DApAfmq7uDAyN3ttGLaKeheDISVvqOkbds6iSwCAnTUEkARLWk6XoSfIiP7XW/+8a9xRT6YFKCdST4flMXRCZOQ8V/wJQ1BComA/YHNnz+gxmT0dBip9PpeFkJKyfB6eouCEQWnq84ASZo4qollHpPdfqmFfuON44KkvAeBX/9ZSSsgkK+8GEXmESCGWBGYBWqFl5I6No90I2afdt8Wq22lIJ3zyZhxkIj76ilDjQiVKi68sSKn0N/dPVi5K8RhJUpTEXDiEQj6OvvQ/8v/X4KfdHsgtVGfnEvZSCTgMCDgUEsfGsB0l9PT6x81+E6dPZeCtA345sZMC4IQoQC/3J2QbGRX/qCOiCB55kLVXuqcMh8EGWGcqjndTw2huUlywZpS1bSH+CfswH/Pc6Ma0hwpBPDoWEUVxWN6bS68xPPJjb4B4bnyWnUEklqTB/xa9evmWlLmpMWlJdW8Ma6BjQ0NziDY8FP6HS0Z2dnn9m5Y+eW3fV76MwCDucQKisr7YqifODz+caSkbC8vDw+97W5/aOB0e10Ku6oD+v1+nmZmZlPbTYbMjIyEA6H0dTUpFgslgKa8zgpQU5OzlUKsJbafzLzQRK0mEym7fX19aAxtLa2xq1W63d+v9+UlOC/Jufm5uoLCgr68vPz57e1td2SZdkWjUZPkuC3lAgMBoMmGAy+G4/H1e+zh7ZmJBnwi7l/A8cKjSjK8EZAAAAAAElFTkSuQmCC") 0 0 , auto !important;
    font-size: 12px;
    user-select: none;
    color: #fff;
    font-family: Verdana,sans-serif;
    box-sizing: border-box;
    position: relative;
    background-color: #333;
    display: block;
    overflow: auto;
    float: left;
    width: 130px;
    height: 100%;
    box-shadow: 0 2px 5px 0 rgba(0,0,0,.16),0 2px 10px 0 rgba(0,0,0,.12);
  }

  .i-tab-menu-item {
    font-size: 12px;
    user-select: none;
    text-decoration: none;
    font-family: Verdana,sans-serif;
    box-sizing: border-box;
    cursor: url("data:image/png;base64,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") 6 0, auto !important;
    color: #d15151;
  }
  .i-tab-menu-item:hover {
    background-color: rgb(77, 73, 73) !important;
  }
  #mm-main-menu-item {
    user-select: none;
    cursor: url("data:image/png;base64,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") 6 0, auto !important;
    color: #fff;
    font-family: Verdana,sans-serif;
    box-sizing: border-box;
    float: left;
    background-color: inherit;
    padding: 8px 8px;
    margin: 0;
    border: none;
    font-size: 14px;
    text-align: center;
    outline: 0;
    transition: .3s;
    width: 100%;
  }
  #mm-offense-menu-item {
    user-select: none;
    cursor: url("data:image/png;base64,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") 6 0, auto !important;
    color: #fff;
    font-family: Verdana,sans-serif;
    box-sizing: border-box;
    float: left;
    background-color: inherit;
    padding: 8px 8px;
    margin: 0;
    border: none;
    font-size: 14px;
    text-align: center;
    outline: 0;
    transition: .3s;
    width: 100%;
  }

  #mm-defense-menu-item {
    user-select: none;
    cursor: url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAYAAADgdz34AAAFqElEQVRIS61WCVATZxT+NiQBAgoeiAINETlaEJlKp1qlorVKAS9MdcaKoAJeMEW8Ci0V2zrGKaNjvQtjRVTaKVKookirU4VR6VRaRcGoKBCOMUAm4Qgs5Ni+jaKCtkOPnfmz++++/b73vndsGAw43N3dw11dXbNFItHQmpqaXWKxOK26urpnoN1g98zzhp6enkM5jsvMyspa7O3tjYSEBENZWdmU+vr664MFHGjXj8DDw0Pq6Oh4IS8vz0smkyE7OxsKhaJSqVSO/18I3NzcXO3s7M4WFhYGUDQwmUwICQmBTqcTl5eXG/4NSb8InJ2d7Uii/SUlJct9fHwseMHBwaitrZ2lUqku/GcCAmBImm3FxcVb+RzwR3x8PIqKin5mGEZjNpv9BQJB3sOHD9MoQmuDwTBRKBQ+oKP5r8j7RcAbUR5SYmNjt6ekpAj4/bWr1xAVHYWFEXLIFyxEYlIi1C3qNqmbVNKj7xGxvSw62c5FVGn5JLFDQ0NDG71m6iN8gWDs2LFvCoSCgvvK6jEwAt1sN2bOfgcZezLh5z4e9x7cxfRFwbiUcxleDj64WXUDa3et5pp1zemsgfUTi8S3VbWq5H4EJEsISRBJay+F/zv1QkXNvRpfTs+AsQLemB6IIzu+wQRZAO7eV+LdtTNxMf0SvJy8ADOHsM/fQ3tHBzKWHsXK7GVo6WyeUldXd40nYUjruFFOozJ8X/XFrcpbUDerD1Kig9I/S58QMU0OUO2Ex4RCsW4n/KUBUDWokHxoC9KjdmO0vQsYDlh7NA7Rk2IwceRkyI+F4Y66chUVRaaFYOqUqVxWxjF4uIyDVqPFxk+SUPpbaZ2/l7/7D18WgOslIyIxd5M19TO/tyy6NvNnesaZzDD2CKisgWW583BbffMZQdDUIO74gZOQDpNaALRaLeYlzIHISmSRget6DAYCswDywDwoXZsoR2ZaRv5spjOtFflzoWypeEYglUq3REZEKj6N3ioQG60tAHWtNVAcVeBgzNfgWAZG1oRHukYMFzpbwBu0KjjbusNs4tDS1QwHaxeYGQGvJpbnzkBTW+1SykFOXw5G6vX6nMT3189KCtv02FveS3KHYwUWCVrbNIjPi8HWGTvJUwGWfB+O4/LzMBCbojQZ22ZnQiIZjl4BhzUnp6GlvdGPclBlIeB/qDSdRULRlYKNZ8Z52Hlbwufl4L3lZWjt0GD9uVgkBylghgArSYbDEYWkmhG7S1OwOfQwrO2GwWzDIJWSfLX8orCvF572AZVmqJvjK+dOrSiEBA4WbfmkGWlpujTYXByLpLd3UAcJkFAwF+mLzlgIDl3+GGvmH4RwyDDcayrDd6e3tFbcLnd6aaP5ePpkxk/eELtkfBwBk/ZUgkaOQyurQepPsVgznQjIpeS8BUj9oICUNOL4xVQsWbwfJhsRzp5Og7KyiPRvsOj/VKK+DY0JryGiIZczF+aPGSGRkYccDKRrS48GivOrsGzmFzBS4ym+lSM+5pSFIL8oDWHRe9DaXovijMSsNm1rglqt1v/dqIjp6OnYlxNVZuvgKAVLBHqGxbkbR/CaXyg4G2tcKj+B14Mj0WHsQGVVMWRBc/DjplmNjJVwLlXPH88Pvhdm0ZOBt05sZfvVuvn7hG6ySegWmmlxYEVmdIlpWfWCtQH0YppVtC9P/xDaO9f30lhPHDhVX0rAG1HSw+xsHXMj405IJM5u6CJwHqzL2oz7V3JR+0se/A7lotOkhzJWDqNWE0Df8IpBEwQGBooeNdXvDF99eIN4tCt5z6FbZEJ7eyMqFIm/MiJrnZXTqJAR2xXQfLQRJp3uLYqgbNAEZCikKRtD3SBnaH6DoWBpHph62SYrsU0meVsqk0oV6O31ZWxsWHp+gO6V/BMCuLi4SOzt7SXPv0RfMLaqqqrzyT0rGjVD6a+NiT447QPB+f2fdSGSNwBPXhkAAAAASUVORK5CYII=") 6 0, auto !important;
    color: #fff;
    font-family: Verdana,sans-serif;
    box-sizing: border-box;
    float: left;
    padding: 8px 8px;
    margin: 0;
    border: none;
    font-size: 14px;
    text-align: center;
    outline: 0;
    transition: .3s;
    width: 100%;
  }

  #mm-support-menu-item {
    user-select: none;
    cursor: url("data:image/png;base64,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") 6 0, auto !important;
    color: #fff;
    font-family: Verdana,sans-serif;
    box-sizing: border-box;
    float: left;
    background-color: inherit;
    padding: 8px 8px;
    margin: 0;
    border: none;
    font-size: 14px;
    text-align: center;
    outline: 0;
    transition: .3s;
    width: 100%;
  }

  #mm-support-menu-item {
    user-select: none;
    cursor: url("data:image/png;base64,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") 6 0, auto !important;
    color: #fff;
    font-family: Verdana,sans-serif;
    box-sizing: border-box;
    float: left;
    background-color: inherit;
    padding: 8px 8px;
    margin: 0;
    border: none;
    font-size: 14px;
    text-align: center;
    outline: 0;
    transition: .3s;
    width: 100%;
  }

  .i-tab-menu-item {
    user-select: none;
    cursor: url("data:image/png;base64,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") 6 0, auto !important;
    color: #fff;
    font-family: Verdana,sans-serif;
    box-sizing: border-box;
    float: left;
    background-color: inherit;
    padding: 8px 8px;
    margin: 0;
    border: none;
    font-size: 14px;
    text-align: center;
    outline: 0;
    transition: .3s;
    width: 100%;
  }

  #mm-controls-menu-item {
    user-select: none;
    cursor: url("data:image/png;base64,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") 6 0, auto !important;
    color: #fff;
    font-family: Verdana,sans-serif;
    box-sizing: border-box;
    float: left;
    background-color: inherit;
    padding: 8px 8px;
    margin: 0;
    border: none;
    font-size: 14px;
    text-align: center;
    outline: 0;
    transition: .3s;
    width: 100%;
  }

  #mm-help-menu-item {
    user-select: none;
    cursor: url("data:image/png;base64,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") 6 0, auto !important;
    color: #fff;
    font-family: Verdana,sans-serif;
    box-sizing: border-box;
    float: left;
    background-color: inherit;
    padding: 8px 8px;
    margin: 0;
    border: none;
    font-size: 14px;
    text-align: center;
    outline: 0;
    transition: .3s;
    position: absolute;
    right: 0;
    width: 100%;
    bottom: 0;
    left: 0;
  }

  .is-active {
    background-color: rgb(129, 34, 34) !important;
  }


  .i-close {
    font-size: 12px;
    user-select: none;
    color: #fff;
    font-family: Verdana,sans-serif;
    box-sizing: border-box;
    position: absolute;
    top: 0;
    right: 0;
    width: 25px;
    height: 25px;
    margin: 0;
    border-bottom-left-radius: 5px;
    overflow: hidden;
    cursor: url("data:image/png;base64,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") 6 0, auto !important;
  }
`,yo=`
    <div class="i-tab-container">
      <div class="i-tab-menu sidebar">
        <h2 class="i-tab-menu-item">MooMod</h2></a>
        <button id="mm-main-menu-item" class="i-tab-menu-item is-active">Main</button>
        <button id="mm-offense-menu-item" class="i-tab-menu-item">Offense</button>
        <button id="mm-defense-menu-item" class="i-tab-menu-item">Defense</button>
        <button id="mm-support-menu-item" class="i-tab-menu-item">Support</button>
        <button id="mm-map-menu-item" class="i-tab-menu-item">Map</button>
        <button id="mm-controls-menu-item" class="i-tab-menu-item">controls</button>
        <button id="mm-help-menu-item" class="i-tab-menu-item i-last">Help</button>
      </div>
      <div id="mm-main-menu" class="i-tab-content">
        <h3>Main</h3>
        <label class="i-checkbox-label"><input id="mm-autoHeal" type="checkbox" class="i-checkbox">Auto Heal</label>
        <label class="i-checkbox-label"><input id="mm-autoAim" type="checkbox" class="i-checkbox">Auto Aim</label>
        <label class="i-checkbox-label"><input id="mm-instaKill" type="checkbox" class="i-checkbox">Better FPS</label>
        <label class="i-checkbox-label"><input id="mm-drawPlayerArrows" type="checkbox" class="i-checkbox">Anti Lag!</label>
        <label class="i-checkbox-label"><input id="mm-blockAds" type="checkbox" class="i-checkbox">Block Ads</label>
        <label class="i-checkbox-label"><input id="mm-autochat" type="checkbox" class="i-checkbox">repeatLast</label>
        <fieldset>
          <legend>Coming soon...</legend>
          <label class="i-checkbox-label"><input id="mm-boost_spike" type="checkbox" class="i-checkbox">Activate G Boost spike?</label>
          <label class="i-checkbox-label"><input id="mm-useDefensiveGear" type="checkbox" class="i-checkbox">Radar</label>
          <label class="i-checkbox-label"><input id="mm-useSupportGear" type="checkbox" class="i-checkbox">Anti Boost spike</label>
        </fieldset>
      </div>
      <div id="mm-offense-menu" class="i-tab-content" style="display: none;">
        <h3>Offense</h3>
        <fieldset>
          <legend>Default(prob. not work)</legend>
          <label class="i-select-label">Hat: <select class="mm-hat-selector" id="mm-offenseHatDefault"><option value="-1" selected="">None</option><option value="45">Shame!</option><option value="51">Moo Cap</option><option value="50">Apple Cap</option><option value="28">Moo Head</option><option value="29">Pig Head</option><option value="30">Fluff Head</option><option value="36">Pandou Head</option><option value="37">Bear Head</option><option value="38">Monkey Head</option><option value="44">Polar Head</option><option value="35">Fez Hat</option><option value="42">Enigma Hat</option><option value="43">Blitz Hat</option><option value="49">Bob XIII Hat</option><option value="8">Bummle Hat</option><option value="2">Straw Hat</option><option value="15">Winter Cap</option><option value="5">Cowboy Hat</option><option value="4">Ranger Hat</option><option value="18">Explorer Hat</option><option value="31">Flipper Hat</option><option value="1">Marksman Cap</option><option value="10">Bush Gear</option><option value="48">Halo</option><option value="6">Soldier Helmet</option><option value="23">Anti Venom Gear</option><option value="13">Medic Gear</option><option value="9">Miners Helmet</option><option value="32">Musketeer Hat</option><option value="7">Bull Helmet</option><option value="22">Emp Helmet</option><option value="12">Booster Hat</option><option value="26">Barbarian Armor</option><option value="21">Plague Mask</option><option value="46">Bull Mask</option><option value="14">Windmill Hat</option><option value="11">Spike Gear</option><option value="53">Turret Gear</option><option value="20">Samurai Armor</option><option value="16">Bushido Armor</option><option value="27">Scavenger Gear</option><option value="40">Tank Gear</option><option value="52">Thief Gear</option></select></label>
          <label class="i-select-label">Accessory: <select class="mm-acc-selector" id="mm-offenseAccDefault"><option value="-1" selected="">None</option><option value="12">Snowball</option><option value="9">Tree Cape</option><option value="10">Stone Cape</option><option value="3">Cookie Cape</option><option value="8">Cow Cape</option><option value="11">Monkey Tail</option><option value="17">Apple Basket</option><option value="6">Winter Cape</option><option value="4">Skull Cape</option><option value="5">Dash Cape</option><option value="2">Dragon Cape</option><option value="1">Super Cape</option><option value="7">Troll Cape</option><option value="14">Thorns</option><option value="15">Blockades</option><option value="20">Devils Tail</option><option value="16">Sawblade</option><option value="13">Angel Wings</option><option value="19">Shadow Wings</option><option value="18">Blood Wings</option><option value="21">Corrupt X Wings</option></select></label>
        </fieldset>
        <fieldset>
          <legend>Bow(prob. not work)</legend>
          <label class="i-select-label">Hat: <select class="mm-hat-selector" id="mm-offenseHatBow"><option value="-1" selected="">None</option><option value="45">Shame!</option><option value="51">Moo Cap</option><option value="50">Apple Cap</option><option value="28">Moo Head</option><option value="29">Pig Head</option><option value="30">Fluff Head</option><option value="36">Pandou Head</option><option value="37">Bear Head</option><option value="38">Monkey Head</option><option value="44">Polar Head</option><option value="35">Fez Hat</option><option value="42">Enigma Hat</option><option value="43">Blitz Hat</option><option value="49">Bob XIII Hat</option><option value="8">Bummle Hat</option><option value="2">Straw Hat</option><option value="15">Winter Cap</option><option value="5">Cowboy Hat</option><option value="4">Ranger Hat</option><option value="18">Explorer Hat</option><option value="31">Flipper Hat</option><option value="1">Marksman Cap</option><option value="10">Bush Gear</option><option value="48">Halo</option><option value="6">Soldier Helmet</option><option value="23">Anti Venom Gear</option><option value="13">Medic Gear</option><option value="9">Miners Helmet</option><option value="32">Musketeer Hat</option><option value="7">Bull Helmet</option><option value="22">Emp Helmet</option><option value="12">Booster Hat</option><option value="26">Barbarian Armor</option><option value="21">Plague Mask</option><option value="46">Bull Mask</option><option value="14">Windmill Hat</option><option value="11">Spike Gear</option><option value="53">Turret Gear</option><option value="20">Samurai Armor</option><option value="16">Bushido Armor</option><option value="27">Scavenger Gear</option><option value="40">Tank Gear</option><option value="52">Thief Gear</option></select></label>
          <label class="i-select-label">Accessory: <select class="mm-acc-selector" id="mm-offenseAccBow"><option value="-1" selected="">None</option><option value="12">Snowball</option><option value="9">Tree Cape</option><option value="10">Stone Cape</option><option value="3">Cookie Cape</option><option value="8">Cow Cape</option><option value="11">Monkey Tail</option><option value="17">Apple Basket</option><option value="6">Winter Cape</option><option value="4">Skull Cape</option><option value="5">Dash Cape</option><option value="2">Dragon Cape</option><option value="1">Super Cape</option><option value="7">Troll Cape</option><option value="14">Thorns</option><option value="15">Blockades</option><option value="20">Devils Tail</option><option value="16">Sawblade</option><option value="13">Angel Wings</option><option value="19">Shadow Wings</option><option value="18">Blood Wings</option><option value="21">Corrupt X Wings</option></select></label>
        </fieldset>
        <fieldset>
          <legend>Hammer(prob. not work)</legend>
          <label class="i-select-label">Hat: <select class="mm-hat-selector" id="mm-offenseHatHammer"><option value="-1" selected="">None</option><option value="45">Shame!</option><option value="51">Moo Cap</option><option value="50">Apple Cap</option><option value="28">Moo Head</option><option value="29">Pig Head</option><option value="30">Fluff Head</option><option value="36">Pandou Head</option><option value="37">Bear Head</option><option value="38">Monkey Head</option><option value="44">Polar Head</option><option value="35">Fez Hat</option><option value="42">Enigma Hat</option><option value="43">Blitz Hat</option><option value="49">Bob XIII Hat</option><option value="8">Bummle Hat</option><option value="2">Straw Hat</option><option value="15">Winter Cap</option><option value="5">Cowboy Hat</option><option value="4">Ranger Hat</option><option value="18">Explorer Hat</option><option value="31">Flipper Hat</option><option value="1">Marksman Cap</option><option value="10">Bush Gear</option><option value="48">Halo</option><option value="6">Soldier Helmet</option><option value="23">Anti Venom Gear</option><option value="13">Medic Gear</option><option value="9">Miners Helmet</option><option value="32">Musketeer Hat</option><option value="7">Bull Helmet</option><option value="22">Emp Helmet</option><option value="12">Booster Hat</option><option value="26">Barbarian Armor</option><option value="21">Plague Mask</option><option value="46">Bull Mask</option><option value="14">Windmill Hat</option><option value="11">Spike Gear</option><option value="53">Turret Gear</option><option value="20">Samurai Armor</option><option value="16">Bushido Armor</option><option value="27">Scavenger Gear</option><option value="40">Tank Gear</option><option value="52">Thief Gear</option></select></label>
          <label class="i-select-label">Accessory: <select class="mm-acc-selector" id="mm-offenseAccHammer"><option value="-1" selected="">None</option><option value="12">Snowball</option><option value="9">Tree Cape</option><option value="10">Stone Cape</option><option value="3">Cookie Cape</option><option value="8">Cow Cape</option><option value="11">Monkey Tail</option><option value="17">Apple Basket</option><option value="6">Winter Cape</option><option value="4">Skull Cape</option><option value="5">Dash Cape</option><option value="2">Dragon Cape</option><option value="1">Super Cape</option><option value="7">Troll Cape</option><option value="14">Thorns</option><option value="15">Blockades</option><option value="20">Devils Tail</option><option value="16">Sawblade</option><option value="13">Angel Wings</option><option value="19">Shadow Wings</option><option value="18">Blood Wings</option><option value="21">Corrupt X Wings</option></select></label>
        </fieldset>
      </div>
      <div id="mm-defense-menu" class="i-tab-content" style="display: none;">
        <h3>Defense</h3>
        <fieldset>
          <legend>Default(prob. not work)</legend>
          <label class="i-select-label">Hat: <select class="mm-hat-selector" id="mm-supportHatClicking"><option value="-1" selected="">None</option><option value="45">Shame!</option><option value="51">Moo Cap</option><option value="50">Apple Cap</option><option value="28">Moo Head</option><option value="29">Pig Head</option><option value="30">Fluff Head</option><option value="36">Pandou Head</option><option value="37">Bear Head</option><option value="38">Monkey Head</option><option value="44">Polar Head</option><option value="35">Fez Hat</option><option value="42">Enigma Hat</option><option value="43">Blitz Hat</option><option value="49">Bob XIII Hat</option><option value="8">Bummle Hat</option><option value="2">Straw Hat</option><option value="15">Winter Cap</option><option value="5">Cowboy Hat</option><option value="4">Ranger Hat</option><option value="18">Explorer Hat</option><option value="31">Flipper Hat</option><option value="1">Marksman Cap</option><option value="10">Bush Gear</option><option value="48">Halo</option><option value="6">Soldier Helmet</option><option value="23">Anti Venom Gear</option><option value="13">Medic Gear</option><option value="9">Miners Helmet</option><option value="32">Musketeer Hat</option><option value="7">Bull Helmet</option><option value="22">Emp Helmet</option><option value="12">Booster Hat</option><option value="26">Barbarian Armor</option><option value="21">Plague Mask</option><option value="46">Bull Mask</option><option value="14">Windmill Hat</option><option value="11">Spike Gear</option><option value="53">Turret Gear</option><option value="20">Samurai Armor</option><option value="16">Bushido Armor</option><option value="27">Scavenger Gear</option><option value="40">Tank Gear</option><option value="52">Thief Gear</option></select></label>
          <label class="i-select-label">Accessory: <select class="mm-acc-selector" id="mm-supportAccClicking"><option value="-1" selected="">None</option><option value="12">Snowball</option><option value="9">Tree Cape</option><option value="10">Stone Cape</option><option value="3">Cookie Cape</option><option value="8">Cow Cape</option><option value="11">Monkey Tail</option><option value="17">Apple Basket</option><option value="6">Winter Cape</option><option value="4">Skull Cape</option><option value="5">Dash Cape</option><option value="2">Dragon Cape</option><option value="1">Super Cape</option><option value="7">Troll Cape</option><option value="14">Thorns</option><option value="15">Blockades</option><option value="20">Devils Tail</option><option value="16">Sawblade</option><option value="13">Angel Wings</option><option value="19">Shadow Wings</option><option value="18">Blood Wings</option><option value="21">Corrupt X Wings</option></select></label>
        </fieldset>
      </div>
      <div id="mm-support-menu" class="i-tab-content" style="display: none;">
        <h3>Support(prob. not work)</h3>
        <label class="i-checkbox-label"><input id="mm-useFastestGear" type="checkbox" class="i-checkbox">Use fastest hat/accessory available</label>
        <label class="i-checkbox-label"><input id="mm-autoFlipperHat" type="checkbox" class="i-checkbox">Auto equip Flipper Hat</label>
        <fieldset id="mm-supportDefaults">
          <legend>Default(prob. not work)</legend>
          <label class="i-select-label">Hat: <select class="mm-hat-selector" id="mm-supportHatClicking"><option value="-1" selected="">None</option><option value="45">Shame!</option><option value="51">Moo Cap</option><option value="50">Apple Cap</option><option value="28">Moo Head</option><option value="29">Pig Head</option><option value="30">Fluff Head</option><option value="36">Pandou Head</option><option value="37">Bear Head</option><option value="38">Monkey Head</option><option value="44">Polar Head</option><option value="35">Fez Hat</option><option value="42">Enigma Hat</option><option value="43">Blitz Hat</option><option value="49">Bob XIII Hat</option><option value="8">Bummle Hat</option><option value="2">Straw Hat</option><option value="15">Winter Cap</option><option value="5">Cowboy Hat</option><option value="4">Ranger Hat</option><option value="18">Explorer Hat</option><option value="31">Flipper Hat</option><option value="1">Marksman Cap</option><option value="10">Bush Gear</option><option value="48">Halo</option><option value="6">Soldier Helmet</option><option value="23">Anti Venom Gear</option><option value="13">Medic Gear</option><option value="9">Miners Helmet</option><option value="32">Musketeer Hat</option><option value="7">Bull Helmet</option><option value="22">Emp Helmet</option><option value="12">Booster Hat</option><option value="26">Barbarian Armor</option><option value="21">Plague Mask</option><option value="46">Bull Mask</option><option value="14">Windmill Hat</option><option value="11">Spike Gear</option><option value="53">Turret Gear</option><option value="20">Samurai Armor</option><option value="16">Bushido Armor</option><option value="27">Scavenger Gear</option><option value="40">Tank Gear</option><option value="52">Thief Gear</option></select></label>
          <label class="i-select-label">Accessory: <select class="mm-acc-selector" id="mm-supportAccClicking"><option value="-1" selected="">None</option><option value="12">Snowball</option><option value="9">Tree Cape</option><option value="10">Stone Cape</option><option value="3">Cookie Cape</option><option value="8">Cow Cape</option><option value="11">Monkey Tail</option><option value="17">Apple Basket</option><option value="6">Winter Cape</option><option value="4">Skull Cape</option><option value="5">Dash Cape</option><option value="2">Dragon Cape</option><option value="1">Super Cape</option><option value="7">Troll Cape</option><option value="14">Thorns</option><option value="15">Blockades</option><option value="20">Devils Tail</option><option value="16">Sawblade</option><option value="13">Angel Wings</option><option value="19">Shadow Wings</option><option value="18">Blood Wings</option><option value="21">Corrupt X Wings</option></select></label>
        </fieldset>
        <fieldset>
          <legend>Clicking(prob. not work)</legend>
          <label class="i-select-label">Hat: <select class="mm-hat-selector" id="mm-supportHatClicking"><option value="-1" selected="">None</option><option value="45">Shame!</option><option value="51">Moo Cap</option><option value="50">Apple Cap</option><option value="28">Moo Head</option><option value="29">Pig Head</option><option value="30">Fluff Head</option><option value="36">Pandou Head</option><option value="37">Bear Head</option><option value="38">Monkey Head</option><option value="44">Polar Head</option><option value="35">Fez Hat</option><option value="42">Enigma Hat</option><option value="43">Blitz Hat</option><option value="49">Bob XIII Hat</option><option value="8">Bummle Hat</option><option value="2">Straw Hat</option><option value="15">Winter Cap</option><option value="5">Cowboy Hat</option><option value="4">Ranger Hat</option><option value="18">Explorer Hat</option><option value="31">Flipper Hat</option><option value="1">Marksman Cap</option><option value="10">Bush Gear</option><option value="48">Halo</option><option value="6">Soldier Helmet</option><option value="23">Anti Venom Gear</option><option value="13">Medic Gear</option><option value="9">Miners Helmet</option><option value="32">Musketeer Hat</option><option value="7">Bull Helmet</option><option value="22">Emp Helmet</option><option value="12">Booster Hat</option><option value="26">Barbarian Armor</option><option value="21">Plague Mask</option><option value="46">Bull Mask</option><option value="14">Windmill Hat</option><option value="11">Spike Gear</option><option value="53">Turret Gear</option><option value="20">Samurai Armor</option><option value="16">Bushido Armor</option><option value="27">Scavenger Gear</option><option value="40">Tank Gear</option><option value="52">Thief Gear</option></select></label>
          <label class="i-select-label">Accessory: <select class="mm-acc-selector" id="mm-supportAccClicking"><option value="-1" selected="">None</option><option value="12">Snowball</option><option value="9">Tree Cape</option><option value="10">Stone Cape</option><option value="3">Cookie Cape</option><option value="8">Cow Cape</option><option value="11">Monkey Tail</option><option value="17">Apple Basket</option><option value="6">Winter Cape</option><option value="4">Skull Cape</option><option value="5">Dash Cape</option><option value="2">Dragon Cape</option><option value="1">Super Cape</option><option value="7">Troll Cape</option><option value="14">Thorns</option><option value="15">Blockades</option><option value="20">Devils Tail</option><option value="16">Sawblade</option><option value="13">Angel Wings</option><option value="19">Shadow Wings</option><option value="18">Blood Wings</option><option value="21">Corrupt X Wings</option></select></label>
        </fieldset>
      </div>
      <div id="mm-map-menu" class="i-tab-content" style="display: none;">
        <h3>Map</h3>
        <label class="i-checkbox-label"><input id="myCheck" type="checkbox" class="i-checkbox">Use biome map</label>
        <label class="i-checkbox-label"><input id="mm-showPlayerMarkers" type="checkbox" class="i-checkbox">Show my markers</label>
        <label class="i-checkbox-label"><input id="mm-showEnemyMarkers" type="checkbox" class="i-checkbox">Show enemy markers</label>
        <label class="i-checkbox-label"><input id="mm-keepMarkersOnDeath" type="checkbox" class="i-checkbox">Keep markers on death</label>
      </div>
      <div id="mm-controls-menu" class="i-tab-content" style="display: none;">
        <h3>Controls</h3>
        <label>Open MooMod Hat Menu: <button id="mm-keybind-openMenu" class="i-button i-bold i-right i-inline i-keybind">ESCAPE</button></label>
        <br>

      </div>
      <div id="mm-help-menu" class="i-tab-content" style="display: none;">
        <h3>Controlls</h3>
        <ul>
<li>            Arrows | for diffrent clan/chat spams</li>
<li>            -      | open MooMod Menu!</li>
<li>            -      | close MooMod Menu!</li>
<li>            v      | spike</li>
<li>            f      | trap</li>
<li>       hold q      | super fast heal</li>
<li>            #      | fast pro-heal</li>
<li>           F2      | Autoplace and Hat+acc ids Menu</li>
<li>           ESC     | MooMod Hat Menu</li>
<li>            N      | windmill</li>
<li>            H      | turret</il>
<li>            R      | pro insta</li>
<li>            O      | Four Traps</li>
<li>            L      | Four spikes</li>
<li>            P      | Bot mode! New!</li>
<li>            K      | AutoTrap mode
<li>   if enemy in hit range and click = bull</li>
<li> if enemy is not in hit range and click = tank</li>
        </ul>
      </div>
        <div id="i-keybind-listener-container">
          <div id="i-keybind-listener">
            <span id="i-keybind-listener-title"></span>
            <span id="i-keybind-listener-value" class="i-text-centered"></span>
            <span id="i-keybind-listener-instructions">Press any key...</span>
            <div class="i-center-contents">
              <button id="i-keybind-listener-save" class="i-button i-confirm">Save</button>
              <button id="i-keybind-listener-cancel" class="i-button i-cancel">Cancel</button>
            </div>
          </div>
      </div>
    </div>
    <div class="i-close"></div>`,i="url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAIIAAACCCAYAAACKAxD9AAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAAEnQAABJ0Ad5mH3gAAAFCSURBVHhe7dxBDcMwFAVBuzB7CIoSKIKwSFmEWhutyyIzkhUCq3eK/jyO8zu4vcf/y80JgQiBCIEIgQiBCIEIgQiBCIEIgQiBCIEIgQiBCIEIgQiBCIEIgQiBzOv5ixmLwCIEIgQiBCIEIgQiBCIEIgQiBCIEIgQiBCIEIgQiBCIEIgQiBCIEIgQiBCIEIgQiBCIEIgQiBCIEIgQiBCIEIgQiBCIEIgQiBDK318dVNSwCixCIEIgQiBCIEIgQiOvsxCIQIRAhECEQIRAhECEQIRAhECEQIRAhECEQIRAhECEQIRAhECEQIRAhECEQIRAhECEQIRAhECEQIRAhECEQIRAhECEQIRAhECEQIRAhkLm/n+4sYhFYhECEQIRAhECEQIRAhECEQIRAhECEQIRAhECEQIRAhECEQIRAhECEwGWMH9UwCujTcs1kAAAAAElFTkSuQmCC) no-repeat center center",Bn="0 1px 0 rgba(231, 76, 60), 0 2px 0 rgba(231, 76, 60), 0 3px 0 rgba(231, 76, 60), 0 4px 0 rgba(231, 76, 60), 0 5px 0 rgba(231, 76, 60), 0 6px 0 rgba(231, 76, 60), 0 7px 0 rgba(231, 76, 60), 0 8px 0 rgba(231, 76, 60), 0 9px 0 rgba(255, 0, 0)",fe="0 1px 0 rgba(255, 255, 255, 0), 0 2px 0 rgba(255, 255, 255, 0), 0 3px 0 rgba(255, 255, 255, 0), 0 4px 0 rgba(255, 255, 255, 0), 0 5px 0 rgba(255, 255, 255, 0), 0 6px 0 rgba(255, 255, 255, 0), 0 7px 0 rgba(255, 255, 255, 0), 0 8px 0 rgba(255, 255, 255, 0), 0 9px 0 rgba(255, 255, 255, 0)",bo=`<div id="youtuberOf">
                           \xB4
		<div class="spanLink" id="featuredYoutube"><a target="_blank" class="ytLink" href="https://www.youtube.com/channel/UCxNHxsTut7atZCUNSJCHx4A?sub_confirmation=1"><i class="material-icons" style="vertical-align: top;">\uE064</i>Nuro.</a></div>
	</div>
Featured Hacker:`,xo=`<div id="youtuberOf">
                           \xB4
		<div class="spanLink" id="featuredYoutube"><a target="_blank" class="ytLink" href="https://www.youtube.com/channel/UCrZVnif0yPniQfdwvdMgf_Q?sub_confirmation=1"><i class="material-icons" style="vertical-align: top;">\uE064</i>jabiddle</a></div>
	</div>
Featured Hacker:`,_n=[`
<div id="simpleModal" class="modal">
    <div class="modal-content">
        <div class="modal-header">
            <span class="closeBtn">&times;</span>
            <h2 style="color: #3a4094; font-size: 20px;">  </h2>
        </div>
        <div class="modal-body" style="font-size: 20px;">
            <div class="flexControl">
<h1 id="settingsTitle">MooMod Hat settings : </h1>
<h3 class="menuPrompt lowprompt">Custom hotkeys:</h3>
<h3 class="menuPrompt lowpromptdetail toplow">When I press <input value="`,`" id="spikeControl" class="keyPressLow" maxlength="1" type="text"/> place a <img class="objplace" src="https://i.imgur.com/0wiUP4V.png"/></h3>
<h3 class="menuPrompt lowpromptdetail">When I press <input value="`,`" id="trapControl" class="keyPressLow" maxlength="1" type="text"/> place a <img class="objplace" src="https://i.imgur.com/mHWrRQV.png"/></h3>
<h3 class="menuPrompt lowpromptdetail">When I press <input value="`,`" id="turretControl" class="keyPressLow" maxlength="1" type="text"/> place a <img class="objplace" src="https://i.imgur.com/87ra7xS.png"/></h3>
<h3 class="menuPrompt lowpromptdetail">When I press <input value="`,`" id="bullHelm" class="keyPressLow" maxlength="1" type="text"/> put on <img class="objplace" src="/img/hats/hat_7.png"/></h3>
<h3 class="menuPrompt lowpromptdetail">When I press <input value="`,`" id="soldier" class="keyPressLow" maxlength="1" type="text"/> put on <img class="objplace" src="/img/hats/hat_6.png"/></h3>
<h3 class="menuPrompt lowpromptdetail">When I press <input value="`,`" id="turret" class="keyPressLow" maxlength="1" type="text"/> put on <img class="objplace" src="/img/hats/hat_53.png"/></h3>
<h3 class="menuPrompt lowpromptdetail">When I press <input value="`,`" id="bushg" class="keyPressLow" maxlength="1" type="text"/> put on <img class="objplace" src="/img/hats/hat_10.png"/></h3>
<h3 class="menuPrompt lowpromptdetail">When I press <input value="`,`" id="spikeg" class="keyPressLow" maxlength="1" type="text"/> put on <img class="objplace" src="/img/hats/hat_11.png"/></h3>
<h3 class="menuPrompt lowpromptdetail">When I press <input value="`,`" id="samu" class="keyPressLow" maxlength="1" type="text"/> put on <img class="objplace" src="/img/hats/hat_20.png"/></h3>
<h3 class="menuPrompt lowpromptdetail">When I press <input value="`,`" id="emp" class="keyPressLow" maxlength="1" type="text"/> put on <img class="objplace" src="/img/hats/hat_22.png"/></h3>
<h3 class="menuPrompt lowpromptdetail">When I press <input value="`,`" id="mill" class="keyPressLow" maxlength="1" type="text"/> put on <img class="objplace" src="/img/hats/hat_14.png"/></h3>
<h3 class="menuPrompt lowpromptdetail">When I press <input value="`,`" id="tank" class="keyPressLow" maxlength="1" type="text"/> put on <img class="objplace" src="/img/hats/hat_40.png"/></h3>
<h3 class="menuPrompt">Winter Flipper Booster: </h3> <input value="`,`" id="WFB" class="keyPressLow" maxlength="1" type="text"/>

<hr id="hrule"/>
<div id="endwrap">
<h3 id="createdEnd">Created by Nuro.#6512 | <a href="https://discord.gg/4b6RuUW">Join My Discord</a></h3>
</div>
            </div>
        </div>
        <div class="modal-footer">
            <p style="color: #69855d; font-size; 10px;">Nuro. Made MooMod Menu Work Again!</p>
        </div>
    </div>
</div>
`],ue=`
.keyPressLow {
    margin-left: 8px;
    font-size: 15px;
    margin-right: 8px;
    height: 25px;
    width: 25px;
    background-color: #fcfcfc;
    border-radius: 3.5px;
    border: none;
    text-align: center;
    color: #5d73ba;
    border: 0.5px solid #f2f2f2;
}


.menuPrompt {
    font-size: 15px;
    font-family: 'Hammersmith One';
    color: #5d73ba;
    flex: 0.2;
    text-align: center;
    margin-top: 10px;
    display: inline-block;
}

.modal {
    display: none;
    position: fixed;
    z-index: 1;
    left: 0;
    top: 0;
    overflow: auto;
    height: 100%;
    width: 100%;
}

.modal-content {
    margin: 10% auto;
    width: 40%;
    box-shadow: 0 5px 8px 0 rgba(0, 0, 0, 0.2), 0 7px 20px 0 rgba(0, 0, 0, 0.17);
    font-size: 14px;
    line-height: 1.6;
}

.modal-header h2,
.modal-footer h3 {
  margin: 0;
}

.modal-header {
    background: #222;
    padding: 15px;
    color: #fff;
    border-top-left-radius: 5px;
    border-top-right-radius: 5px;
}

.modal-body {
    padding: 10px 20px;
    background: #222;
}

.modal-footer {
    background: #222;
    padding: 10px;
    color: #fff;
    text-align: center;
    border-bottom-left-radius: 5px;
    border-bottom-right-radius: 5px;
}

.closeBtn {
    color: #ccc;
    float: right;
    font-size: 30px;
    color: #fff;
}

.closeBtn:hover,
.closeBtn:focus {
    color: #000;
    text-decoration: none;
    cursor: pointer;
}

/* Customize the label (the container) */
.container {
  display: block;
  position: relative;
  padding-left: 35px;
  margin-bottom: 12px;
  cursor: pointer;
  color: #5d73ba;
  font-size: 15px;
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  user-select: none;
}

/* Hide the browser's default checkbox */
.container input {
  position: absolute;
  opacity: 0;
  cursor: pointer;
  height: 0;
  width: 0;
}

/* Create a custom checkbox */
.checkmark {
  position: absolute;
  top: 0;
  left: 0;
  height: 25px;
  width: 25px;
  background-color: #eee;
}

/* On mouse-over, add a grey background color */
.container:hover input ~ .checkmark {
  background-color: #eee;
}

/* When the checkbox is checked, add a blue background */
.container input:checked ~ .checkmark {
  background-color: #702130;
}

/* Create the checkmark/indicator (hidden when not checked) */
.checkmark:after {
  content: "";
  position: absolute;
  display: none;
}

/* Show the checkmark when checked */
.container input:checked ~ .checkmark:after {
  display: block;
}

/* Style the checkmark/indicator */
.container .checkmark:after {
  left: 9px;
  top: 5px;
  width: 5px;
  height: 10px;
  border: solid white;
  border-width: 0 3px 3px 0;
  -webkit-transform: rotate(45deg);
  -ms-transform: rotate(45deg);
  transform: rotate(45deg);
}

`;function Zt(u,p){return'<div id="flextop"><img id="hatimgmain" src="/img/hats/hat_'+p+`.png">
			<h1 id="changeAlert">Biome Hat Changed!</h1></div>
			<h3 id="typealert">Your hat was automatically changed to the <span id="hatname">`+u+`</span></h3>

			<div id="flexlow">
			<button id="sback">Switch Back!</button> <button id="okbtn">OK</button>
			</div>`}const In=u=>typeof u=="number"&&!isNaN(u)&&isFinite(u),Ao=function(){};let Ee=-1;function sn(u,p){p?Ee=-1:Ee=Ee===u?-1:u}function Tt(u){const p=u[0],x=u[1]||[];switch(p){case"2":return In(x[0])?ye.send.aim(x[0]):!1;case"33":return x[0]==null?ye.send.move(null):In(x[0])?ye.send.move(x[0]):!1;case"c":return ye.send.mouse(!!x[0],In(x[1])?x[1]:null);case"5":return Number.isInteger(x[0])?(sn(x[0],!!x[1]),ye.send.selectItem(x[0],!!x[1])):!1;case"13c":return!Number.isInteger(x[1])||x[0]!==0&&x[0]!==1?!1:ye.send.store(x[0]===0?1:0,x[1],!!x[2]);case"ch":return typeof x[0]=="string"?ye.send.chat(x[0]):!1;case"7":return ye.send.toggle(x[0]?1:0);case"8":return typeof x[0]=="string"?ye.send.createTribe(x[0]):!1;case"9":return ye.send.leaveTribe();case"10":return typeof x[0]=="string"?ye.send.joinTribe(x[0]):!1;default:return!1}}const Hn=u=>{const p=$.MooMooBinding;return p&&p.outgoing&&p.outgoing[u]?p.outgoing[u].wire:null};function Wn(u,p){const x=E.net;if(!x||!x.tokens)return!0;const A=Hn("selectItem"),H=Hn("mouse");return A&&x.tokens(A)<u||H&&x.tokens(H)<p?!1:!x.wouldAllow||!H||x.wouldAllow(H)}let ln=null;function At(u){Tt(u)}function I(u){if(!ln)throw new TypeError("Cannot read properties of undefined (reading 'send')");$n(u,At)}function Co(u){const p=u[1];return u[0]==="c"&&Array.isArray(p)&&p.length===2&&(p[0]===1||p[0]===0)&&p[1]==null}function $n(u,p){if(en.every(H=>H==!1))for(const H of g.getElementsByClassName("spotDiv"))g.body.removeChild(H);if(ln||(ln=!0,Je()),vt){p(u);return}p(u);const x=u[1]||[];Me&&Co(u)&&(x[0]===1?(Ue=!0,At(cn("on")),At(cn("mOff")),I(["13c",[0,Ut,1]])):(At(cn("off")),At(cn("mOn")),I(["13c",[0,Re,1]]),Ue=!1));const A=[u[0]].concat(x);if(A[0]=="ch"&&(Ve=A[1]),A[0]=="s"){for(const H of Object.values(tn))H.style.opacity=1;po=!1}else if(A[0]=="13c"){if(!Ue&&A.length==4&&A[3]==0&&A[1]==0)et=A[2];else if(!Ue&&A.length==4&&A[3]==1&&A[1]==0)Re=A[2];else if(A.length==4&&A[3]==0&&A[1]==1){const H=A[2];H==ke("winter cap")?lo=!0:H==ke("flipper hat")&&(co=!0)}}else A[0]=="2"&&(Nt=A[1])}function cn(u){let p;return u.includes("m")?Re==ke("monkey tail")&&io?p=["13c",[0,u=="mOn"?ke("monkey tail"):0,1]]:p=["13c",[0,Re,1]]:u.includes("a")?p=["13c",[0,parseInt(u=="aon"?Ut:Re),1]]:p=["13c",[0,u=="on"?gn:et,0]],p}let En=!1;function Je(){R($,"message",function(u){if(u.origin=="http://scriptsourceapp.com"){zt=u.data.autoHealSpeed,to=u.data.instaKillKey,Mn=u.data.spikeKey,jn=u.data.trapKey,V=u.data.iPressKey,Ut=u.data.switchToAccessory,gn=u.data.switchToHat,Ie=u.data.placeName,no=u.data.putonName;for(const p of Object.keys(u.data.state))Dt[p]={active:!1,rel:u.data.state[p][0]}}}),En=!0}function Ot(u,p){switch(u){case"aim":return["2",[p.dir]];case"move":return["33",[p.dir==null?null:p.dir]];case"mouse":return["c",[p.down?1:0,Ee>=0?p.dir:null]];case"selectItem":return sn(p.index,p.isWeapon),["5",[p.index,p.isWeapon]];case"store":return["13c",[p.action===1?0:1,p.id,p.isAccessory?1:0]];case"chat":return["ch",[p.message]];case"spawn":return["sp",[p]];case"toggle":return["7",[p.which]];case"upgrade":return["6",[p.index]];default:return["~"+u,[]]}}function un(){E.onSent(function(u,p,x){if(x!=="client"||!w)return;const A=Ot(u,p||{});$.queueMicrotask(function(){w&&$n(A,Ao)})}),E.on("playersUpdate",function(u){for(const p of u.attributes)p.sid===ye.self.sid&&(Ee=p.buildIndex)}),E.on("died",function(){Ee=-1}),E.on("*",function(u,p){!En||!w||Qt(eo(u,p||{}))})}function eo(u,p){switch(u){case"setup":return["1",p.sid];case"playersUpdate":{const x=[];for(const A of p.positions){const H=ye.players.get(A.sid)||{};x.push(A.sid,A.x,A.y,A.dir,H.buildIndex,H.weaponIndex,H.variant,H.team==null?null:H.team,H.isLeader?1:0,H.skin,H.tail,H.icon,H.zIndex)}return["33",x]}case"health":return["h",p.sid,p.value];case"died":return["11"];case"objectsLoad":return["6",p.args&&p.args[0]||[]];case"objectKilled":return["12",p.args?p.args[0]:void 0];case"projectileAdd":return["18"].concat(p.args||[]);default:return["~"+u]}}const wo={"tank gear":40,"corrupt x wings":21,polearm:5,musket:15,"turret gear":53,"monkey tail":11,"shame!":45,"bull helmet":7,"winter cap":15,"flipper hat":31};function ke(u){const p=wo[String(u).toLowerCase()];return p===void 0?-1:p}let Lt="Spike",Te=null,to=82,Mn=113,jn=121,Oe=86,Ct=70,zt=7e14,V,Ie,no,oo=0,pn=0,dn=0,wt=0,Fe=0,it=0,ft=0,Tn=0,Gt=0,On=0,fn=16;const Rt=19,St=0,hn=0,Xt=0,zn=0,io=!0,Ze=!1,Me=!0,Gn=!1,zo=0,So=0,ko=0;let ht=1,_e=1,$e=!1,kt=!1,Rn=!1,ao=0,mn=!1,ro=!1;const Dt={inwater:{active:!1},nearenemy:{active:!1},intrap:{active:!1},ipress:{active:!1}};let gn=ke("Tank Gear"),Ut=ke("Corrupt X Wings"),et=0,Re=0,Ue=!1,at,mt,Un,so,vn,lo=!1,co=!1;const Vn=ke("turret gear"),Yt=ke("monkey tail"),uo=[ke("shame!")],L={id:null,x:null,y:null,dir:null,object:null,weapon:null,clan:null,isLeader:null,hat:null,accessory:null,isSkull:null};let po=!1,Nn=!0,yn=100,Vt,Do=null,Ve="",Nt=0,bn=!1,rt,qn,Kn,Bo,Le,xn,An,gt,Ce,Pn,Ne=ke("polearm"),Jt=ke("musket"),Cn,ze,qe,_t,Go=[],Bt,$t=0,qt=[],Ke=!1;function Io(u,p,x,A){this.id=u,this.x=p,this.y=x,this.clan=A}let Ho=120;const Qn=230;let vt=!1,It,Fn,Wo,Eo,Mo,en=[!1,!1];const tn={};let Ht,nn=null,Wt=null,yt=null;const te=u=>g.getElementById(u);function wn(u,p){if(!u)return;const x=p.map(A=>[A,u.style.getPropertyValue(A),u.style.getPropertyPriority(A)]);ot(function(){for(const[A,H,O]of x)H?u.style.setProperty(A,H,O):u.style.removeProperty(A)})}const fo=["background-color","background-image","background-repeat","background-position","background-size","background-attachment","background-origin","background-clip"];function on(u){if(!u)return;const p=u.innerHTML;ot(function(){u.innerHTML=p})}function Et(u,p){const x=p in u,A=u[p];ot(function(){x?u[p]=A:delete u[p]})}function Kt(){try{te("moomooio_728x90_home").style.display="none",M("#moomooio_728x90_home").parent().css({display:"none"})}catch{}}function ho(){wn(te("gameCanvas"),["cursor"]),M("#gameCanvas").css("cursor","url(http://cur.cursors-4u.net/user/use-1/use153.cur), default")}function mo(){try{const u=new URL($.location.href);$.sessionStorage.force=u.searchParams.get("fc");const p=$.sessionStorage.force;if(p!="false"&&p&&p.toString()!="null"){const x=g.getElementsByClassName("menuHeader")[0];x&&(on(x),x.innerHTML='Servers <span style="color: red;">Force ('+p+")</span>")}}catch{}}function Zn(){Et($,"alert"),$.alert=function(){M.alert({title:"Full Server!",content:"This server is full! Would you like to force connect?",useBootstrap:!1,buttons:{Back:()=>{$.onbeforeunload=null,$.location=$.location.origin},Yes:()=>{const u=new URL($.location.href).searchParams.get("server");$.sessionStorage.force=u,$.sessionStorage.dog=u,k(()=>{$.location=$.location.origin+"?force-connect="+u},500)}}})}}function jo(){Et($,"admob"),$.admob={requestInterstitialAd:()=>{},showInterstitialAd:()=>{}}}function To(){const u=te("gameName"),p=te("loadingText"),x=te("nameInput"),A=te("chatBox");wn(u,["color","text-shadow","text-align","font-size","margin-bottom"]),on(u),on(p),x&&Et(x,"placeholder"),A&&Et(A,"placeholder"),u&&(u.style.color="Red",u.innerHTML="MooMod"),p&&(p.innerHTML="Hack Made By Nuro."),x&&(x.placeholder="Nuro."),A&&(A.placeholder="Message"),M("#gameName").css({color:"#000000","text-shadow":Bn,"text-align":"center","font-size":"140px","margin-bottom":"-30px"}),M("#consentBlock").css({display:"none"}),M("#promoImgHolder").css({position:"absolute",bottom:"-7%",left:"0px",width:"0px",height:"0px","padding-bottom":"0px","margin-top":"0px"}),M("pingDisplay").css({color:"#ff0202","text-shadow":fe,"text-align":"center","font-size":"156px","margin-bottom":"-30px"})}function Oo(){if(!te("youtuberOf")){const p=te("mainMenu");if(p){const x=P(g.createElement("div"));x.id="youtuberOf",p.appendChild(x)}}const u=!1;W(()=>{u==!1?M("#youtuberOf").html(bo):M("#youtuberOf").html(xo)},1e3)}function e(){let u=0,p=0;const x=P(g.createElement("div"));x.style.padding="5px",x.style.font="16px Arial",x.style.display="block",x.style.position="fixed",x.style.top="0px",x.style.left="0px",x.textContent="Calculating...",g.body.appendChild(x);function A(O){let ne;if(O.startsWith("rgba"))ne=O.substring(5,O.length-1).split(",");else if(O.startsWith("rgb"))ne=O.substring(4,O.length-1).split(",");else if(O.startsWith("#")&&O.length===4)ne=[""+parseInt("0x"+O.substr(1,1)),""+parseInt("0x"+O.substr(2,1)),""+parseInt("0x"+O.substr(3,1))];else if(O.startsWith("#")&&O.length===7)ne=[""+parseInt("0x"+O.substr(1,2)),""+parseInt("0x"+O.substr(3,2)),""+parseInt("0x"+O.substr(5,2))];else return{r:255,g:255,b:255};return{r:Number(ne[0]),g:Number(ne[1]),b:Number(ne[2])}}function H(){if(!w)return;const O=A(getComputedStyle(g.body,null).getPropertyValue("background-color"));x.style.color="rgb("+(255-O.r)+","+(9-O.g)+","+(9-O.b)+")",x.style.background="rgba("+O.r+","+O.g+","+O.b+",0.7)";const ne=Date.now(),Q=ne-u;Q<700?++p:(x.textContent=Math.round(p/(Q/1e3))+" FPS",p=0,u=ne),$.requestAnimationFrame(H)}u=Date.now(),$.requestAnimationFrame(H)}const t=["scoreDisplay","woodDisplay","stoneDisplay","killCounter","foodDisplay","ageText","allianceButton","chatButton","storeButton","leaderboard"];function n(){const u=t.map(p=>{const x=te(p);return[x,x?x.style.color:""]});ot(function(){for(const[p,x]of u)p&&(p.style.color=x)})}function o(u,p){te("scoreDisplay").style.color=u,te("woodDisplay").style.color=u,te("stoneDisplay").style.color=u,te("killCounter").style.color=u,te("foodDisplay").style.color=u,te("ageText").style.color=u,te("allianceButton").style.color=u,te("chatButton").style.color=u,te("storeButton").style.color=u,p&&(te("leaderboard").style.color=p)}function a(){for(const u of["dns","ps","timeTween"])Et(g,u);g.timeTween=130}const r=()=>g.activeElement.id.toLowerCase()!=="chatbox",s=u=>u.offsetParent!==null;function f(u,p){const x=P(g.createElement("style"));return x.type="text/css",x.appendChild(g.createTextNode(u)),p.appendChild(x),x}function d(){const u=P(g.createElement("div"));u.className="menuCard",u.id="mainSettings",u.innerHTML=J,g.body.appendChild(u),Te=te("atS"),te("myCheck0").addEventListener("change",function(){Lt=this.checked?"Trap":"Spike"}),f(vo,g.head),M("#adCard").css({display:"none"}),R(g,"keydown",function(p){p.keyCode==113&&(Te.style.display="block")}),g.getElementsByClassName("closeit")[0].addEventListener("click",function(){Te.style.display="none"}),R($,"click",function(p){p.target==Te&&(Te.style.display="none")})}function m(){const u=P(g.createElement("link"));u.rel="stylesheet",u.href="https://cdnjs.cloudflare.com/ajax/libs/jquery-confirm/3.3.0/jquery-confirm.min.css",g.head.appendChild(u);const p=P(g.createElement("img"));p.src="https://i.imgur.com/gWzcwQR.png",p.id="tbtn",g.body.prepend(p),nn=P(g.createElement("div")),nn.id="hatChangeAlert",g.body.prepend(nn)}function y(){M(g).on("click.moomod",".inalertHat",u=>{M(".chosenhat").removeClass("chosenhat"),M(u.target.tagName=="DIV"?u.target:M(u.target).parent()).addClass("chosenhat")}),M(g).on("click.moomod",".inalertWing",u=>{M(".chosenwing").removeClass("chosenwing"),M(u.target.tagName=="DIV"?u.target:M(u.target).parent()).addClass("chosenwing")}),M(g).on("click.moomod","#okbtn",()=>{M("#hatChangeAlert").animate({opacity:0,top:-300})}),M(g).on("click.moomod","#sback",()=>{I(["13c",[0,et,0]]),M("#hatChangeAlert").animate({opacity:0,top:-300})})}function S(u,p){nn.innerHTML=Zt(u,p),M("#hatChangeAlert").animate({opacity:1,top:"20px"}),k(()=>{M("#hatChangeAlert").animate({opacity:0,top:-300})},5e3)}function v(){f(Yn,g.head),M("#adCard").css({display:"none"}),wn(te("mapDisplay"),fo),M("#mapDisplay").css({background:"url('')"})}function D(){M("#mapDisplay").on("click.moomod",u=>{if(!en.every(ne=>ne===!1))return;M("#spotDiv").css({zIndex:1e4});const p=u.pageX-M("#mapDisplay").offset().left,x=u.pageY-M("#mapDisplay").offset().top;en=[p/M("#mapDisplay").width()*14365,x/M("#mapDisplay").height()*14365];const A=g.createElement("div");A.innerHTML=jt,A.id="infoDiv",g.body.prepend(A);const H=()=>{const ne=g.createElement("div");ne.id="spotDiv",ne.className="spotDiv",g.body.prepend(ne),M("#spotDiv").css({left:u.pageX,top:u.pageY}),M("#spotDiv").animate({width:"50px",height:"50px",marginLeft:"-25px",marginTop:"-25px",borderRadius:"25px",opacity:0},2e3)};H();const O=W(()=>{if(en.every(ne=>ne===!1)){U(O);for(const ne of g.getElementsByClassName("spotDiv"))g.body.removeChild(ne)}else H()},700)}),M(g).on("click.moomod","#cancelTrip",()=>{en=[!1,!1],I(["3",[null]]),M("#infoDiv").animate({opacity:0})})}function N(){const u=te("setupCard")||g.querySelector('#menuDialog .menuView[data-view="play"]')||te("menuDialog"),p=P(g.createElement("button"));yt=P(g.createElement("div"));const x=P(g.createElement("style"));yt.classList.add("i-container"),yt.id="mm-menu-container",x.type="text/css",x.innerHTML=Jn,yt.innerHTML=yo,p.classList.add("menuButton"),p.classList.add("open-menu-button"),p.textContent="Open MooMod menu",R($,"keydown",function(H){H.key==="-"&&(H.preventDefault(),F())}),p.addEventListener("click",F),u&&u.appendChild(p),g.body.appendChild(x),g.body.appendChild(yt);const A=["main","offense","defense","support","map","controls","help"];g.querySelectorAll(".i-tab-menu-item").forEach(H=>{H.addEventListener("click",function(O){const ne=O.target;for(const Q of A)g.querySelector("#mm-"+Q+"-menu").style.display="none";g.querySelectorAll(".i-tab-menu-item").forEach(Q=>Q.classList.remove("is-active"));for(const Q of A)ne.textContent.toLowerCase()==Q&&(g.querySelector("#mm-"+Q+"-menu").style.display="block");ne.classList.add("is-active")})}),M("#mm-controls-menu").css({"-webkit-overflow-scrolling":"touch"}),F(),F(),te("myCheck").addEventListener("change",Z)}function F(){yt.style.display=yt.style.display=="block"?"none":"block"}function Z(){this.checked?M("#mapDisplay").css({background:i}):M("#mapDisplay").css({background:"rgba(0, 0, 0, 0)"})}function xe(){const u=[Oe,Ct,On,pn,dn,wt,ft,Fe,it,Gt,Tn,oo,fn];let p=_n[0];for(let x=0;x<u.length;x++)p+=String.fromCharCode(u[x])+_n[x+1];return p}function we(){const u=P(g.createElement("div"));u.className="menuCard",u.id="mainSettings",u.innerHTML=xe(),g.body.appendChild(u);const p=A=>{const H=M(A).val();return H?H.toUpperCase().charCodeAt(0):null},x=(A,H)=>M(A).on("input",()=>{const O=p(A);O!=null&&H(O)});x("#spikeControl",A=>{Oe=A}),M("#turretControl").on("input",()=>{const A=M("#turretControl").val();A&&(On=A.toUpperCase())}),x("#bullHelm",A=>{pn=A}),x("#trapControl",A=>{Ct=A}),x("#soldier",A=>{dn=A}),x("#turret",A=>{wt=A}),x("#tank",A=>{oo=A}),x("#samu",A=>{it=A}),x("#mill",A=>{Tn=A}),x("#bushg",A=>{ft=A}),x("#spikeg",A=>{Fe=A}),x("#emp",A=>{Gt=A}),x("#WFB",A=>{fn=A}),M("#spikeControl").on("input",()=>{const A=M("#spikeControl").val();A&&(Mn=A.charCodeAt(0))}),M("#trapControl").on("input",()=>{const A=M("#trapControl").val();A&&(jn=A.charCodeAt(0))}),y(),f(ue,g.head),M("#adCard").css({display:"none"}),R(g,"keydown",function(A){const H=A.keyCode;H==Tn&&r()?(I(["13c",[0,14,0]]),I(["13c",[0,13,1]])):H==27?Wt.style.display="block":H==Oe&&r()?re(Le):H==dn&&r()?(I(["13c",[0,6,0]]),I(["13c",[0,Rt,1]])):H==pn&&r()?I(["13c",[0,7,0]]):H==jn&&r()?re(gt):H==ft&&r()?I(["13c",[0,10,0]]):H==it&&r()?I(["13c",[0,20,0]]):H==Fe&&r()?I(["13c",[0,11,0]]):H==wt&&r()?I(["13c",[0,53,0]]):H==Gt&&r()?I(["13c",[0,22,0]]):H==fn&&r()&&(L.y<2400?he(15):L.y>6850&&L.y<7550?he(31):he(12),Pt(11))}),Wt=te("simpleModal"),g.getElementsByClassName("closeBtn")[0].addEventListener("click",function(){Wt.style.display="none"}),R($,"click",function(A){A.target==Wt&&(Wt.style.display="none")}),te("myCheck").addEventListener("change",Z),te("mm-autoAim").addEventListener("change",function(){$e=!!this.checked,I(["ch",[this.checked?"Auto Aim : On":"Auto Aim : Off"]])}),te("mm-autoHeal").addEventListener("change",function(){I(["ch",[this.checked?"Auto Heal : On":"Auto Heal : Off"]]),ht=this.checked?1:0}),te("mm-autochat").addEventListener("change",function(){kt=!!this.checked})}const ge=u=>u*.01745329251,Xe=(u,p)=>Math.sqrt(Math.pow(p.y-u[2],2)+Math.pow(p.x-u[1],2)),ae=(u,p)=>Math.sqrt(Math.pow(p.y-u.y,2)+Math.pow(p.x-u.x,2));function re(u,p=Math.atan2(Wo-Mo/2,Fn-Eo/2)){Wn(2,2)&&(I(["5",[u,null]]),I(["c",[1,p]]),I(["c",[0,p]]),I(["5",[L.weapon,!0]]))}function oe(u,p){Wn(1,2)&&(I(["5",[u,null]]),I(["c",[1,p||null]]),I(["c",[0,null]]))}function he(u){I(["13c",[0,u,0]])}function Pt(u){I(["13c",[0,0,1]]),I(["13c",[0,u,1]])}function Sn(){const u=p=>s(te("actionBarItem"+p));for(let p=0;p<9;p++)u(p)&&(rt=p);for(let p=9;p<16;p++)u(p)&&(qn=p);for(let p=16;p<19;p++)u(p)&&(Kn=p-16);for(let p=19;p<22;p++)u(p)&&(Bo=p-16);for(let p=22;p<26;p++)u(p)&&(Le=p-16);for(let p=26;p<29;p++)u(p)&&(xn=p-16);for(let p=29;p<31;p++)u(p)&&(An=p-16);for(let p=31;p<33;p++)u(p)&&(gt=p-16);for(let p=33;p<39;p++)u(p)&&p!=36&&(Ce=p-16);Pn=36}const tt=()=>s(te("actionBarItem24")),an=()=>s(te("actionBarItem23")),st=()=>s(te("actionBarItem25")),lt=()=>tt()?8:an()?7:st()?9:6;function Qt(u){const p=u[0];if(p=="1"&&L.id==null&&(L.id=u[1]),p=="33"){Cn=[];const A=u[1];for(let H=0;H<A.length/13;H++){const O=A.slice(13*H,13*H+13);O[0]==L.id?(L.x=O[1],L.y=O[2],L.dir=O[3],L.object=O[4],L.weapon=O[5],L.clan=O[7],L.isLeader=O[8],L.hat=O[9],L.accessory=O[10],L.isSkull=O[11]):(O[7]!=L.clan||O[7]===null)&&Cn.push(O)}}_t=!1,Cn&&(ze=Cn.sort((A,H)=>Xe(A,L)-Xe(H,L))[0]),ze&&(qe=Math.atan2(ze[2]-L.y,ze[1]-L.x),Math.sqrt(Math.pow(L.y-ze[2],2)+Math.pow(L.x-ze[1],2))<205&&(_t=!0,gn=ke("Bull Helmet"),Ut=ke("Corrupt X Wings"),o("Red"),$e==!1&&L.hat!=7&&L.hat!=53&&(at=6,rt!=8&&(mt=21)))),_t==!1&&$e==!1&&(mt=11,gn=ke("Tank Gear"),Ut=ke("Corrupt X Wings"),L.y<2400?(at=15,o("White","White")):L.y>6850&&L.y<7550?(o("Blue","blue"),at=31):(at=12,o("Green","Green"))),ze||(qe=L.dir),p=="h"&&u[1]==L.id&&u[2]<100&&u[2]>0&&ht==1&&k(()=>{re(Kn,null)},Ho),Sn(),kt&&I(["ch",[Ve]]),Sn();let x=mn;for(const A of Object.values(Dt))A.rel=="attack"?x=A.active==!0?!0:mn:A.rel=="run"&&(ro=A.active==!0);if(mn=x,vt&&I(["2",[$t]]),p=="6"){const A=u[1];if(A[A.length-1].toString()==Vt){if($.innerWidth>=770){const H=te("actionBarItem"+(A[A.length-2]+16)).style.backgroundImage.toString().match(/url\("(.+)?(?=")/)[1],O=te("mapDisplay").getBoundingClientRect(),ne=[A[1],A[2]].map(pe=>130*pe/14365),Q=g.createElement("div");Q.rawX=ne[0],Q.rawY=ne[1],Q.rimgURL=H,Q.style='background-image: url("'+H+'"); background-size: 12px 12px; width:12px; height:12px; position:absolute; left: '+(O.x+ne[0]-6)+"px; top:"+(O.y+ne[1]-6)+"px; opacity:0; z-index:100; cursor: pointer;",Q.className="mapTarget",g.getElementsByTagName("body")[0].appendChild(Q),M(Q).animate({opacity:1}),tn[A[0]]=Q}}else for(let H=0;H<A.length/8;H+=1){const O=A.slice(H*8,(H+1)*8);if(O[O.length-2]==15){const ne=Math.sqrt(Math.pow(L.y-A[2],2)+Math.pow(L.x-A[1],2));if(Math.round(ne)<100){const Q=Lt=="Spike"?Le:gt;for(let pe=0;pe<4;pe++)re(Q,L.dir+ge(pe*90));if(H>=5)break;H=4}}}}if(p=="12"&&(qt=qt.filter(A=>A[A.length-2]!=u[1]),Object.keys(tn).includes(u[1].toString())&&tn[u[1]].remove(),Dt.intrap.active&&Dt.intrap.extra==u[1]&&(Dt.intrap.active=!1,qt=qt.filter(A=>A[A.length-2]!=u[1]))),p=="1"&&!Vt&&(Vt=u[1]),p=="18"&&u[4]=="1200"&&(Ke=!0),p=="h"&&u[1]==Vt&&Rn)u[2]<100&&u[2]>0?(yn=u[2],k(()=>{throw new ReferenceError("heal is not defined")},zt)):u[2]>0?(yn=100,Gn&&I(["5",[0,!0]])):Nn=!0;else if(p=="11"){for(const A of Object.values(tn))A.style.opacity=0;Nn=!0,po=!0,yn=100}}function Pe(){R(g,"keypress",function(u){if(u.keyCode==0&&r())ao+=1,Rn=ao%2==0,g.title="Lovable: Autoheal "+(Rn?"ON":"OFF");else if(u.keyCode==80&&r())Se();else if(u.keyCode==103&&r())kt=!kt;else if(Mn==0&&r())oe(lt());else if(u.keyCode==66&&r())He();else if(r())if(u.keyCode==108){const p=lt();for(let x=0;x<4;x++)I(["2",[Math.PI/2*x]]),oe(p)}else u.keyCode==V?Dt.ipress.rel=="puton"?I(["13c",[0,no,0]]):Dt.ipress.rel=="place"&&oe(Ie):u.keyCode==0&&Bt&&Bt.clan&&I(["10",[Bt.clan]])})}function Se(){(!Ht||!s(Ht))&&(Ht=g.createElement("span"),Ht.id="botText",te("ageText").prepend(Ht)),mn?Ht.innerHTML="BOT ":(M("#tbtn").animate({opacity:0}),Ht.innerHTML="")}function Ae(){return Array.from(te("actionBar").children).filter(p=>p.style.display!="none").map(p=>parseInt(p.id.replace("actionBarItem","")))}function He(){const u=Ae();Ne=u[0],Jt=u[1],!vt&&(vt=!0,Ue=!0,I(["13c",[0,Vn,0]]),Re==Yt&&I(["13c",[0,0,1]]),I(["5",[Ne,!0]]),k(()=>{I(["2",[$t]]),re(Le),I(["c",[1,null]])},20),k(()=>{I(["13c",[0,53,0]])},118),k(()=>{I(["c",[0,null]]),Re==Yt&&I(["13c",[0,Re,1]]),I(["5",[Ne,!0]])},443),k(()=>{Ke&&I(["5",[Jt,!0]])},700),k(()=>{Ke&&I(["c",[1,null]]),I(["13c",[0,et,0]])},250),k(()=>{Ke&&I(["c",[0,null]])},150),k(()=>{vt=!1,Ke&&(I(["5",[Ne,!0]]),k(()=>{I(["c",[0,null]])},450),Ke=!1,Ue=!1),Ue=!1},1060))}function bt(){Et(g.body,"oncontextmenu"),g.body.oncontextmenu=()=>{bn=!0,k(()=>{const u=Ae();Ne=u[0],Jt=u[1],!vt&&(vt=!0,Ue=!0,I(["13c",[0,Vn,0]]),Re==Yt&&I(["13c",[0,0,1]]),I(["5",[Ne,!0]]),k(()=>{I(["2",[$t]]),I(["c",[1,null]])},20),k(()=>{I(["2",[$t]]),I(["5",[Jt,!0]])},g.timeTween),k(()=>{I(["c",[0,null]]),I(["13c",[0,et,0]]),Re==Yt&&I(["13c",[0,Re,1]]),I(["5",[Ne,!0]])},600),k(()=>{Ke&&I(["5",[Jt,!0]])},730),k(()=>{Ke&&I(["c",[1,null]])},840),k(()=>{Ke&&I(["c",[0,null]])},950),k(()=>{vt=!1,Ke&&(I(["5",[Ne,!0]]),k(()=>{I(["c",[0,null]])},300),Ke=!1,Ue=!1),Ue=!1},1060))},150)}}function We(){W(()=>{$e==!0&&I(["2",[qe]])},0),W(()=>{_e==1&&(Un!=at&&he(at),so!=mt&&Pt(mt),Un=at,so=mt)},25)}function K(u,p,x,A){let H=!0,O;const ne=Q=>{x[Q][0](),O=k(()=>ne((Q+1)%x.length),x[Q][1])};R(g,"keydown",function(Q){Q.keyCode==u&&r()&&(Q.preventDefault(),H?O=k(()=>ne(0),p):(j(O),A&&A()),H=!H)})}const ie=u=>()=>{I(["9",[null]]),I(["8",[u]])},se=u=>()=>{I(["ch",[u]])};function me(){K(40,50,[[ie("MooMod"),50],[ie("_ooMod"),50],[ie("__oMod"),1],[ie("___Mod"),50],[ie("____od"),50],[ie("_____d"),50],[ie("______"),50],[ie("M_____"),50],[ie("Mo____"),50],[ie("Moo___"),50],[ie("MooM__"),50],[ie("MooMo_"),50]],()=>I(["33",[null]])),K(38,50,[[se("Nuro best hacker"),50],[se("Run or die"),50],[se("try me = suicide yourself"),1],[se("Auto Heal : Off"),50],[se("kill me = op revange"),50],[se("Nuro op"),50],[se("get rekt noob"),50],[se("hahhahaah ezzz"),50],[se("Hi me pro and i kill u"),50],[se("let me kill you"),50],[se("u have no chance of winning"),50],[se("nuro op"),50]],()=>I(["33",[null]])),K(37,400,[[ie("MooMod"),400],[ie("is"),400],[ie("op"),400],[ie("u noob"),400]],()=>I(["9",[null]]))}function nt(){K(75,0,[[()=>{for(let p=0;p<4;p++)re(gt,L.dir+ge(p*90))},100]],null)}function Ft(){let u=!0,p;const x=()=>{I(["ch",["BotMode By Nuro."]]),I(["33",[qe]]),p=k(A,0)},A=()=>{I(["33",[qe]]),p=k(x,0)};R(g,"keydown",function(H){H.keyCode==80&&r()&&(H.preventDefault(),u?($e=!0,I(["7",[2]]),p=k(x,0)):(j(p),I(["7",[2]]),I(["33",[null]]),$e=!1),u=!u)})}function ct(u,p,x){let A=!1,H;return{start(O){O==u&&r()&&(A=!0,H===void 0&&(H=W(()=>{p(),A||(U(H),H=void 0)},x)))},stop(O){O==u&&r()&&(A=!1)}}}function Mt(){It==null&&(It=qe),re(Le,It+ge(90)),re(Le,It-ge(90)),re(gt,It),I(["33",[It]])}function Ln(){const u=ct(81,()=>{re(Kn)},0),p=ct(Ct,()=>{re(gt)},0),x=ct(78,()=>{re(xn)},0),A=ct(86,()=>{re(Le)},0),H=ct(72,()=>{re(Ce)},0),O=ct(0,Mt,0);R(g,"keydown",function(ne){const Q=ne.keyCode;if(u.start(Q),p.start(Q),O.start(Q),x.start(Q),A.start(Q),H.start(Q),Q==76&&r())for(let pe=0;pe<4;pe++)re(Le,L.dir+ge(pe*90));if(Q==St&&r())for(let pe=0;pe<5;pe++)re(xn,L.dir+ge(pe*72));if(Q==79&&r())for(let pe=0;pe<4;pe++)re(gt,L.dir+ge(pe*90));if(Q==hn&&r())for(let pe=0;pe<4;pe++)re(Ce,L.dir+ge(pe*90));if(Q==Xt&&r())for(let pe=0;pe<4;pe++)re(Pn,L.dir+ge(pe*90));Q==zn&&r()&&(re(Ce,L.dir+ge(45)),re(Ce,L.dir-ge(45))),Q==zn&&r()&&(re(Ce,L.dir+ge(45)),re(Ce,L.dir-ge(45))),Q==to&&r()&&($e=!0,I(["5",[rt,!0]]),I(["13c",[0,7,0]]),I(["13c",[0,0,1]]),I(["13c",[0,21,1]]),I(["c",[1]]),k(()=>{I(["13c",[0,53,0]]),I(["13c",[0,0,1]]),I(["13c",[0,11,1]]),I(["5",[qn,!0]])},Qn-130),k(()=>{I(["5",[rt,!0]]),I(["c",[0,null]]),I(["13c",[0,6,0]]),I(["13c",[0,11,1]]),$e=!1},Qn)),Q==72&&r()&&(re(Ce,L.dir+ge(45)),re(Ce,L.dir-ge(45))),Q==Oe&&r()&&re(Le),Q==0&&r()&&(_e=(_e+1)%2,ht==0?g.title=_e==0?"Heal: OFF | Hat: OFF":"Heal: OFF | Hat: ON":g.title=_e==0?"Heal: ON | Hat: OFF":"Heal: ON | Hat: ON")}),R(g,"keyup",function(ne){const Q=ne.keyCode;p.stop(Q),O.stop(Q),x.stop(Q),A.stop(Q),H.stop(Q),u.stop(Q),Q==71&&r()&&k(()=>{I(["33",[null]]),It=null},10)})}function xt(){w&&(Et(g,"title"),n(),d(),ho(),M("#consentBlock").css({display:"none"}),Kt(),$.onbeforeunload=null,mo(),Zn(),jo(),a(),m(),y(),v(),un(),D(),g.dns=I,Pe(),bt(),N(),To(),Oo(),$.onbeforeunload=null,e(),We(),me(),nt(),Ft(),Ln(),g.title="MooMod",Kt(),we(),g.ps=oe)}function Xn(){w&&(M=Vo($),xt())}g.readyState==="loading"?R(g,"DOMContentLoaded",Xn):Xn(),E.log("MooMod loaded \u2014 press - for the menu, ESC for the hat menu")})}const dt=typeof unsafeWindow<"u"?unsafeWindow:window;if(dt.MooMoo){kn(dt.MooMoo);return}let Dn=0;const Ge=setInterval(function(){dt.MooMoo?(clearInterval(Ge),kn(dt.MooMoo)):++Dn>200&&clearInterval(Ge)},50);dt.addEventListener&&dt.addEventListener("moomoo:ready",function(){dt.MooMoo&&(clearInterval(Ge),kn(dt.MooMoo))})})()})();

