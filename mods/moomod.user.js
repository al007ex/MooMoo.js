// ==UserScript==
// @name         MooMod
// @namespace    moomoo.js
// @version      1.3.0
// @description  Nuro's MooMod on moomoo.js. - = MooMod menu, ESC = hat menu, F2 = auto placement.
// @author       Nuro (ported to moomoo.js)
// @match        *://*/*
// @run-at       document-start
// @inject-into  page
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

(function(){var Vo=(function(){function fo(Ze,Le){(function(B,De){"use strict";typeof Le=="object"&&typeof Le.exports=="object"?Le.exports=B.document?De(B,!0):function(E){if(!E.document)throw new Error("jQuery requires a window with a document");return De(E)}:De(B)})(typeof Ze<"u"?Ze:this,function(B,De){"use strict";var E=[],V=Object.getPrototypeOf,W=E.slice,s=E.flat?function(e){return E.flat.call(e)}:function(e){return E.concat.apply([],e)},C=E.push,I=E.indexOf,j={},S=j.toString,R=j.hasOwnProperty,P=R.toString,ce=P.call(Object),K={},$=function(e){return typeof e=="function"&&typeof e.nodeType!="number"&&typeof e.item!="function"},Ae=function(e){return e!=null&&e===e.window},_=B.document,dn={type:!0,src:!0,nonce:!0,noModule:!0};function Qn(e,t,n){var o,a,r=(n=n||_).createElement("script");if(r.text=e,t)for(o in dn)(a=t[o]||t.getAttribute&&t.getAttribute(o))&&r.setAttribute(o,a);n.head.appendChild(r).parentNode.removeChild(r)}function jt(e){return e==null?e+"":typeof e=="object"||typeof e=="function"?j[S.call(e)]||"object":typeof e}var Fn="3.7.1",ho=/HTML$/i,i=function(e,t){return new i.fn.init(e,t)};function Wn(e){var t=!!e&&"length"in e&&e.length,n=jt(e);return!$(e)&&!Ae(e)&&(n==="array"||t===0||typeof t=="number"&&0<t&&t-1 in e)}function ue(e,t){return e.nodeName&&e.nodeName.toLowerCase()===t.toLowerCase()}i.fn=i.prototype={jquery:Fn,constructor:i,length:0,toArray:function(){return W.call(this)},get:function(e){return e==null?W.call(this):e<0?this[e+this.length]:this[e]},pushStack:function(e){var t=i.merge(this.constructor(),e);return t.prevObject=this,t},each:function(e){return i.each(this,e)},map:function(e){return this.pushStack(i.map(this,function(t,n){return e.call(t,n,t)}))},slice:function(){return this.pushStack(W.apply(this,arguments))},first:function(){return this.eq(0)},last:function(){return this.eq(-1)},even:function(){return this.pushStack(i.grep(this,function(e,t){return(t+1)%2}))},odd:function(){return this.pushStack(i.grep(this,function(e,t){return t%2}))},eq:function(e){var t=this.length,n=+e+(e<0?t:0);return this.pushStack(0<=n&&n<t?[this[n]]:[])},end:function(){return this.prevObject||this.constructor()},push:C,sort:E.sort,splice:E.splice},i.extend=i.fn.extend=function(){var e,t,n,o,a,r,l=arguments[0]||{},p=1,f=arguments.length,m=!1;for(typeof l=="boolean"&&(m=l,l=arguments[p]||{},p++),typeof l=="object"||$(l)||(l={}),p===f&&(l=this,p--);p<f;p++)if((e=arguments[p])!=null)for(t in e)o=e[t],t!=="__proto__"&&l!==o&&(m&&o&&(i.isPlainObject(o)||(a=Array.isArray(o)))?(n=l[t],r=a&&!Array.isArray(n)?[]:a||i.isPlainObject(n)?n:{},a=!1,l[t]=i.extend(m,r,o)):o!==void 0&&(l[t]=o));return l},i.extend({expando:"jQuery"+(Fn+Math.random()).replace(/\D/g,""),isReady:!0,error:function(e){throw new Error(e)},noop:function(){},isPlainObject:function(e){var t,n;return!(!e||S.call(e)!=="[object Object]")&&(!(t=V(e))||typeof(n=R.call(t,"constructor")&&t.constructor)=="function"&&P.call(n)===ce)},isEmptyObject:function(e){var t;for(t in e)return!1;return!0},globalEval:function(e,t,n){Qn(e,{nonce:t&&t.nonce},n)},each:function(e,t){var n,o=0;if(Wn(e))for(n=e.length;o<n&&t.call(e[o],o,e[o])!==!1;o++);else for(o in e)if(t.call(e[o],o,e[o])===!1)break;return e},text:function(e){var t,n="",o=0,a=e.nodeType;if(!a)for(;t=e[o++];)n+=i.text(t);return a===1||a===11?e.textContent:a===9?e.documentElement.textContent:a===3||a===4?e.nodeValue:n},makeArray:function(e,t){var n=t||[];return e!=null&&(Wn(Object(e))?i.merge(n,typeof e=="string"?[e]:e):C.call(n,e)),n},inArray:function(e,t,n){return t==null?-1:I.call(t,e,n)},isXMLDoc:function(e){var t=e&&e.namespaceURI,n=e&&(e.ownerDocument||e).documentElement;return!ho.test(t||n&&n.nodeName||"HTML")},merge:function(e,t){for(var n=+t.length,o=0,a=e.length;o<n;o++)e[a++]=t[o];return e.length=a,e},grep:function(e,t,n){for(var o=[],a=0,r=e.length,l=!n;a<r;a++)!t(e[a],a)!==l&&o.push(e[a]);return o},map:function(e,t,n){var o,a,r=0,l=[];if(Wn(e))for(o=e.length;r<o;r++)(a=t(e[r],r,n))!=null&&l.push(a);else for(r in e)(a=t(e[r],r,n))!=null&&l.push(a);return s(l)},guid:1,support:K}),typeof Symbol=="function"&&(i.fn[Symbol.iterator]=E[Symbol.iterator]),i.each("Boolean Number String Function Array Date RegExp Object Error Symbol".split(" "),function(e,t){j["[object "+t+"]"]=t.toLowerCase()});var mo=E.pop,go=E.sort,vo=E.splice,le="[\\x20\\t\\r\\n\\f]",Tt=new RegExp("^"+le+"+|((?:^|[^\\\\])(?:\\\\.)*)"+le+"+$","g");i.contains=function(e,t){var n=t&&t.parentNode;return e===n||!(!n||n.nodeType!==1||!(e.contains?e.contains(n):e.compareDocumentPosition&&16&e.compareDocumentPosition(n)))};var yo=/([\0-\x1f\x7f]|^-?\d)|^-$|[^\x80-\uFFFF\w-]/g;function bo(e,t){return t?e==="\0"?"\uFFFD":e.slice(0,-1)+"\\"+e.charCodeAt(e.length-1).toString(16)+" ":"\\"+e}i.escapeSelector=function(e){return(e+"").replace(yo,bo)};var Ue=_,En=C;(function(){var e,t,n,o,a,r,l,p,f,m,v=En,w=i.expando,g=0,D=0,N=me(),L=me(),X=me(),pe=me(),ye=function(c,h){return c===h&&(a=!0),0},Je="checked|selected|async|autofocus|autoplay|controls|defer|disabled|hidden|ismap|loop|multiple|open|readonly|required|scoped",_e="(?:\\\\[\\da-fA-F]{1,6}"+le+"?|\\\\[^\\r\\n\\f]|[\\w-]|[^\0-\\x7f])+",F="\\["+le+"*("+_e+")(?:"+le+"*([*^$|!~]?=)"+le+`*(?:'((?:\\\\.|[^\\\\'])*)'|"((?:\\\\.|[^\\\\"])*)"|(`+_e+"))|)"+le+"*\\]",yt=":("+_e+`)(?:\\((('((?:\\\\.|[^\\\\'])*)'|"((?:\\\\.|[^\\\\"])*)")|((?:\\\\.|[^\\\\()[\\]]|`+F+")*)|.*)\\)|)",ae=new RegExp(le+"+","g"),Y=new RegExp("^"+le+"*,"+le+"*"),bt=new RegExp("^"+le+"*([>+~]|"+le+")"+le+"*"),Nt=new RegExp(le+"|>"),Qe=new RegExp(yt),qt=new RegExp("^"+_e+"$"),it={ID:new RegExp("^#("+_e+")"),CLASS:new RegExp("^\\.("+_e+")"),TAG:new RegExp("^("+_e+"|[*])"),ATTR:new RegExp("^"+F),PSEUDO:new RegExp("^"+yt),CHILD:new RegExp("^:(only|first|last|nth|nth-last)-(child|of-type)(?:\\("+le+"*(even|odd|(([+-]|)(\\d*)n|)"+le+"*(?:([+-]|)"+le+"*(\\d+)|))"+le+"*\\)|)","i"),bool:new RegExp("^(?:"+Je+")$","i"),needsContext:new RegExp("^"+le+"*[>+~]|:(even|odd|eq|gt|lt|nth|first|last)(?:\\("+le+"*((?:-\\d)?\\d*)"+le+"*\\)|)(?=[^-]|$)","i")},xt=/^(?:input|select|textarea|button)$/i,Kt=/^h\d$/i,Oe=/^(?:#([\w-]+)|(\w+)|\.([\w-]+))$/,be=/[+~]/,ve=new RegExp("\\\\[\\da-fA-F]{1,6}"+le+"?|\\\\([^\\r\\n\\f])","g"),Se=function(c,h){var y="0x"+c.slice(1)-65536;return h||(y<0?String.fromCharCode(y+65536):String.fromCharCode(y>>10|55296,1023&y|56320))},at=function(){Ct()},ke=u(function(c){return c.disabled===!0&&ue(c,"fieldset")},{dir:"parentNode",next:"legend"});try{v.apply(E=W.call(Ue.childNodes),Ue.childNodes),E[Ue.childNodes.length].nodeType}catch{v={apply:function(h,y){En.apply(h,W.call(y))},call:function(h){En.apply(h,W.call(arguments,1))}}}function Q(c,h,y,A){var k,z,G,q,T,se,ee,te=h&&h.ownerDocument,re=h?h.nodeType:9;if(y=y||[],typeof c!="string"||!c||re!==1&&re!==9&&re!==11)return y;if(!A&&(Ct(h),h=h||r,p)){if(re!==11&&(T=Oe.exec(c)))if(k=T[1]){if(re===9){if(!(G=h.getElementById(k)))return y;if(G.id===k)return v.call(y,G),y}else if(te&&(G=te.getElementById(k))&&Q.contains(h,G)&&G.id===k)return v.call(y,G),y}else{if(T[2])return v.apply(y,h.getElementsByTagName(c)),y;if((k=T[3])&&h.getElementsByClassName)return v.apply(y,h.getElementsByClassName(k)),y}if(!(pe[c+" "]||f&&f.test(c))){if(ee=c,te=h,re===1&&(Nt.test(c)||bt.test(c))){for((te=be.test(c)&&At(h.parentNode)||h)==h&&K.scope||((q=h.getAttribute("id"))?q=i.escapeSelector(q):h.setAttribute("id",q=w)),z=(se=cn(c)).length;z--;)se[z]=(q?"#"+q:":scope")+" "+un(se[z]);ee=se.join(",")}try{return v.apply(y,te.querySelectorAll(ee)),y}catch{pe(c,!0)}finally{q===w&&h.removeAttribute("id")}}}return ie(c.replace(Tt,"$1"),h,y,A)}function me(){var c=[];return function h(y,A){return c.push(y+" ")>t.cacheLength&&delete h[c.shift()],h[y+" "]=A}}function de(c){return c[w]=!0,c}function ne(c){var h=r.createElement("fieldset");try{return!!c(h)}catch{return!1}finally{h.parentNode&&h.parentNode.removeChild(h),h=null}}function ge(c){return function(h){return ue(h,"input")&&h.type===c}}function Pt(c){return function(h){return(ue(h,"input")||ue(h,"button"))&&h.type===c}}function In(c){return function(h){return"form"in h?h.parentNode&&h.disabled===!1?"label"in h?"label"in h.parentNode?h.parentNode.disabled===c:h.disabled===c:h.isDisabled===c||h.isDisabled!==!c&&ke(h)===c:h.disabled===c:"label"in h&&h.disabled===c}}function Mt(c){return de(function(h){return h=+h,de(function(y,A){for(var k,z=c([],y.length,h),G=z.length;G--;)y[k=z[G]]&&(y[k]=!(A[k]=y[k]))})})}function At(c){return c&&typeof c.getElementsByTagName<"u"&&c}function Ct(c){var h,y=c?c.ownerDocument||c:Ue;return y!=r&&y.nodeType===9&&y.documentElement&&(l=(r=y).documentElement,p=!i.isXMLDoc(r),m=l.matches||l.webkitMatchesSelector||l.msMatchesSelector,l.msMatchesSelector&&Ue!=r&&(h=r.defaultView)&&h.top!==h&&h.addEventListener("unload",at),K.getById=ne(function(A){return l.appendChild(A).id=i.expando,!r.getElementsByName||!r.getElementsByName(i.expando).length}),K.disconnectedMatch=ne(function(A){return m.call(A,"*")}),K.scope=ne(function(){return r.querySelectorAll(":scope")}),K.cssHas=ne(function(){try{return r.querySelector(":has(*,:jqfake)"),!1}catch{return!0}}),K.getById?(t.filter.ID=function(A){var k=A.replace(ve,Se);return function(z){return z.getAttribute("id")===k}},t.find.ID=function(A,k){if(typeof k.getElementById<"u"&&p){var z=k.getElementById(A);return z?[z]:[]}}):(t.filter.ID=function(A){var k=A.replace(ve,Se);return function(z){var G=typeof z.getAttributeNode<"u"&&z.getAttributeNode("id");return G&&G.value===k}},t.find.ID=function(A,k){if(typeof k.getElementById<"u"&&p){var z,G,q,T=k.getElementById(A);if(T){if((z=T.getAttributeNode("id"))&&z.value===A)return[T];for(q=k.getElementsByName(A),G=0;T=q[G++];)if((z=T.getAttributeNode("id"))&&z.value===A)return[T]}return[]}}),t.find.TAG=function(A,k){return typeof k.getElementsByTagName<"u"?k.getElementsByTagName(A):k.querySelectorAll(A)},t.find.CLASS=function(A,k){if(typeof k.getElementsByClassName<"u"&&p)return k.getElementsByClassName(A)},f=[],ne(function(A){var k;l.appendChild(A).innerHTML="<a id='"+w+"' href='' disabled='disabled'></a><select id='"+w+"-\r\\' disabled='disabled'><option selected=''></option></select>",A.querySelectorAll("[selected]").length||f.push("\\["+le+"*(?:value|"+Je+")"),A.querySelectorAll("[id~="+w+"-]").length||f.push("~="),A.querySelectorAll("a#"+w+"+*").length||f.push(".#.+[+~]"),A.querySelectorAll(":checked").length||f.push(":checked"),(k=r.createElement("input")).setAttribute("type","hidden"),A.appendChild(k).setAttribute("name","D"),l.appendChild(A).disabled=!0,A.querySelectorAll(":disabled").length!==2&&f.push(":enabled",":disabled"),(k=r.createElement("input")).setAttribute("name",""),A.appendChild(k),A.querySelectorAll("[name='']").length||f.push("\\["+le+"*name"+le+"*="+le+`*(?:''|"")`)}),K.cssHas||f.push(":has"),f=f.length&&new RegExp(f.join("|")),ye=function(A,k){if(A===k)return a=!0,0;var z=!A.compareDocumentPosition-!k.compareDocumentPosition;return z||(1&(z=(A.ownerDocument||A)==(k.ownerDocument||k)?A.compareDocumentPosition(k):1)||!K.sortDetached&&k.compareDocumentPosition(A)===z?A===r||A.ownerDocument==Ue&&Q.contains(Ue,A)?-1:k===r||k.ownerDocument==Ue&&Q.contains(Ue,k)?1:o?I.call(o,A)-I.call(o,k):0:4&z?-1:1)}),r}for(e in Q.matches=function(c,h){return Q(c,null,null,h)},Q.matchesSelector=function(c,h){if(Ct(c),p&&!pe[h+" "]&&(!f||!f.test(h)))try{var y=m.call(c,h);if(y||K.disconnectedMatch||c.document&&c.document.nodeType!==11)return y}catch{pe(h,!0)}return 0<Q(h,r,null,[c]).length},Q.contains=function(c,h){return(c.ownerDocument||c)!=r&&Ct(c),i.contains(c,h)},Q.attr=function(c,h){(c.ownerDocument||c)!=r&&Ct(c);var y=t.attrHandle[h.toLowerCase()],A=y&&R.call(t.attrHandle,h.toLowerCase())?y(c,h,!p):void 0;return A!==void 0?A:c.getAttribute(h)},Q.error=function(c){throw new Error("Syntax error, unrecognized expression: "+c)},i.uniqueSort=function(c){var h,y=[],A=0,k=0;if(a=!K.sortStable,o=!K.sortStable&&W.call(c,0),go.call(c,ye),a){for(;h=c[k++];)h===c[k]&&(A=y.push(k));for(;A--;)vo.call(c,y[A],1)}return o=null,c},i.fn.uniqueSort=function(){return this.pushStack(i.uniqueSort(W.apply(this)))},(t=i.expr={cacheLength:50,createPseudo:de,match:it,attrHandle:{},find:{},relative:{">":{dir:"parentNode",first:!0}," ":{dir:"parentNode"},"+":{dir:"previousSibling",first:!0},"~":{dir:"previousSibling"}},preFilter:{ATTR:function(c){return c[1]=c[1].replace(ve,Se),c[3]=(c[3]||c[4]||c[5]||"").replace(ve,Se),c[2]==="~="&&(c[3]=" "+c[3]+" "),c.slice(0,4)},CHILD:function(c){return c[1]=c[1].toLowerCase(),c[1].slice(0,3)==="nth"?(c[3]||Q.error(c[0]),c[4]=+(c[4]?c[5]+(c[6]||1):2*(c[3]==="even"||c[3]==="odd")),c[5]=+(c[7]+c[8]||c[3]==="odd")):c[3]&&Q.error(c[0]),c},PSEUDO:function(c){var h,y=!c[6]&&c[2];return it.CHILD.test(c[0])?null:(c[3]?c[2]=c[4]||c[5]||"":y&&Qe.test(y)&&(h=cn(y,!0))&&(h=y.indexOf(")",y.length-h)-y.length)&&(c[0]=c[0].slice(0,h),c[2]=y.slice(0,h)),c.slice(0,3))}},filter:{TAG:function(c){var h=c.replace(ve,Se).toLowerCase();return c==="*"?function(){return!0}:function(y){return ue(y,h)}},CLASS:function(c){var h=N[c+" "];return h||(h=new RegExp("(^|"+le+")"+c+"("+le+"|$)"))&&N(c,function(y){return h.test(typeof y.className=="string"&&y.className||typeof y.getAttribute<"u"&&y.getAttribute("class")||"")})},ATTR:function(c,h,y){return function(A){var k=Q.attr(A,c);return k==null?h==="!=":!h||(k+="",h==="="?k===y:h==="!="?k!==y:h==="^="?y&&k.indexOf(y)===0:h==="*="?y&&-1<k.indexOf(y):h==="$="?y&&k.slice(-y.length)===y:h==="~="?-1<(" "+k.replace(ae," ")+" ").indexOf(y):h==="|="&&(k===y||k.slice(0,y.length+1)===y+"-"))}},CHILD:function(c,h,y,A,k){var z=c.slice(0,3)!=="nth",G=c.slice(-4)!=="last",q=h==="of-type";return A===1&&k===0?function(T){return!!T.parentNode}:function(T,se,ee){var te,re,J,xe,He,Ce=z!==G?"nextSibling":"previousSibling",Re=T.parentNode,Fe=q&&T.nodeName.toLowerCase(),rt=!ee&&!q,he=!1;if(Re){if(z){for(;Ce;){for(J=T;J=J[Ce];)if(q?ue(J,Fe):J.nodeType===1)return!1;He=Ce=c==="only"&&!He&&"nextSibling"}return!0}if(He=[G?Re.firstChild:Re.lastChild],G&&rt){for(he=(xe=(te=(re=Re[w]||(Re[w]={}))[c]||[])[0]===g&&te[1])&&te[2],J=xe&&Re.childNodes[xe];J=++xe&&J&&J[Ce]||(he=xe=0)||He.pop();)if(J.nodeType===1&&++he&&J===T){re[c]=[g,xe,he];break}}else if(rt&&(he=xe=(te=(re=T[w]||(T[w]={}))[c]||[])[0]===g&&te[1]),he===!1)for(;(J=++xe&&J&&J[Ce]||(he=xe=0)||He.pop())&&!((q?ue(J,Fe):J.nodeType===1)&&++he&&(rt&&((re=J[w]||(J[w]={}))[c]=[g,he]),J===T)););return(he-=k)===A||he%A==0&&0<=he/A}}},PSEUDO:function(c,h){var y,A=t.pseudos[c]||t.setFilters[c.toLowerCase()]||Q.error("unsupported pseudo: "+c);return A[w]?A(h):1<A.length?(y=[c,c,"",h],t.setFilters.hasOwnProperty(c.toLowerCase())?de(function(k,z){for(var G,q=A(k,h),T=q.length;T--;)k[G=I.call(k,q[T])]=!(z[G]=q[T])}):function(k){return A(k,0,y)}):A}},pseudos:{not:de(function(c){var h=[],y=[],A=O(c.replace(Tt,"$1"));return A[w]?de(function(k,z,G,q){for(var T,se=A(k,null,q,[]),ee=k.length;ee--;)(T=se[ee])&&(k[ee]=!(z[ee]=T))}):function(k,z,G){return h[0]=k,A(h,null,G,y),h[0]=null,!y.pop()}}),has:de(function(c){return function(h){return 0<Q(c,h).length}}),contains:de(function(c){return c=c.replace(ve,Se),function(h){return-1<(h.textContent||i.text(h)).indexOf(c)}}),lang:de(function(c){return qt.test(c||"")||Q.error("unsupported lang: "+c),c=c.replace(ve,Se).toLowerCase(),function(h){var y;do if(y=p?h.lang:h.getAttribute("xml:lang")||h.getAttribute("lang"))return(y=y.toLowerCase())===c||y.indexOf(c+"-")===0;while((h=h.parentNode)&&h.nodeType===1);return!1}}),target:function(c){var h=B.location&&B.location.hash;return h&&h.slice(1)===c.id},root:function(c){return c===l},focus:function(c){return c===(function(){try{return r.activeElement}catch{}})()&&r.hasFocus()&&!!(c.type||c.href||~c.tabIndex)},enabled:In(!1),disabled:In(!0),checked:function(c){return ue(c,"input")&&!!c.checked||ue(c,"option")&&!!c.selected},selected:function(c){return c.parentNode&&c.parentNode.selectedIndex,c.selected===!0},empty:function(c){for(c=c.firstChild;c;c=c.nextSibling)if(c.nodeType<6)return!1;return!0},parent:function(c){return!t.pseudos.empty(c)},header:function(c){return Kt.test(c.nodeName)},input:function(c){return xt.test(c.nodeName)},button:function(c){return ue(c,"input")&&c.type==="button"||ue(c,"button")},text:function(c){var h;return ue(c,"input")&&c.type==="text"&&((h=c.getAttribute("type"))==null||h.toLowerCase()==="text")},first:Mt(function(){return[0]}),last:Mt(function(c,h){return[h-1]}),eq:Mt(function(c,h,y){return[y<0?y+h:y]}),even:Mt(function(c,h){for(var y=0;y<h;y+=2)c.push(y);return c}),odd:Mt(function(c,h){for(var y=1;y<h;y+=2)c.push(y);return c}),lt:Mt(function(c,h,y){var A;for(A=y<0?y+h:h<y?h:y;0<=--A;)c.push(A);return c}),gt:Mt(function(c,h,y){for(var A=y<0?y+h:y;++A<h;)c.push(A);return c})}}).pseudos.nth=t.pseudos.eq,{radio:!0,checkbox:!0,file:!0,password:!0,image:!0})t.pseudos[e]=ge(e);for(e in{submit:!0,reset:!0})t.pseudos[e]=Pt(e);function uo(){}function cn(c,h){var y,A,k,z,G,q,T,se=L[c+" "];if(se)return h?0:se.slice(0);for(G=c,q=[],T=t.preFilter;G;){for(z in y&&!(A=Y.exec(G))||(A&&(G=G.slice(A[0].length)||G),q.push(k=[])),y=!1,(A=bt.exec(G))&&(y=A.shift(),k.push({value:y,type:A[0].replace(Tt," ")}),G=G.slice(y.length)),t.filter)!(A=it[z].exec(G))||T[z]&&!(A=T[z](A))||(y=A.shift(),k.push({value:y,type:z,matches:A}),G=G.slice(y.length));if(!y)break}return h?G.length:G?Q.error(c):L(c,q).slice(0)}function un(c){for(var h=0,y=c.length,A="";h<y;h++)A+=c[h].value;return A}function u(c,h,y){var A=h.dir,k=h.next,z=k||A,G=y&&z==="parentNode",q=D++;return h.first?function(T,se,ee){for(;T=T[A];)if(T.nodeType===1||G)return c(T,se,ee);return!1}:function(T,se,ee){var te,re,J=[g,q];if(ee){for(;T=T[A];)if((T.nodeType===1||G)&&c(T,se,ee))return!0}else for(;T=T[A];)if(T.nodeType===1||G)if(re=T[w]||(T[w]={}),k&&ue(T,k))T=T[A]||T;else{if((te=re[z])&&te[0]===g&&te[1]===q)return J[2]=te[2];if((re[z]=J)[2]=c(T,se,ee))return!0}return!1}}function d(c){return 1<c.length?function(h,y,A){for(var k=c.length;k--;)if(!c[k](h,y,A))return!1;return!0}:c[0]}function b(c,h,y,A,k){for(var z,G=[],q=0,T=c.length,se=h!=null;q<T;q++)(z=c[q])&&(y&&!y(z,A,k)||(G.push(z),se&&h.push(q)));return G}function x(c,h,y,A,k,z){return A&&!A[w]&&(A=x(A)),k&&!k[w]&&(k=x(k,z)),de(function(G,q,T,se){var ee,te,re,J,xe=[],He=[],Ce=q.length,Re=G||(function(rt,he,pn){for(var st=0,po=he.length;st<po;st++)Q(rt,he[st],pn);return pn})(h||"*",T.nodeType?[T]:T,[]),Fe=!c||!G&&h?Re:b(Re,xe,c,T,se);if(y?y(Fe,J=k||(G?c:Ce||A)?[]:q,T,se):J=Fe,A)for(ee=b(J,He),A(ee,[],T,se),te=ee.length;te--;)(re=ee[te])&&(J[He[te]]=!(Fe[He[te]]=re));if(G){if(k||c){if(k){for(ee=[],te=J.length;te--;)(re=J[te])&&ee.push(Fe[te]=re);k(null,J=[],ee,se)}for(te=J.length;te--;)(re=J[te])&&-1<(ee=k?I.call(G,re):xe[te])&&(G[ee]=!(q[ee]=re))}}else J=b(J===q?J.splice(Ce,J.length):J),k?k(null,q,J,se):v.apply(q,J)})}function M(c){for(var h,y,A,k=c.length,z=t.relative[c[0].type],G=z||t.relative[" "],q=z?1:0,T=u(function(te){return te===h},G,!0),se=u(function(te){return-1<I.call(h,te)},G,!0),ee=[function(te,re,J){var xe=!z&&(J||re!=n)||((h=re).nodeType?T(te,re,J):se(te,re,J));return h=null,xe}];q<k;q++)if(y=t.relative[c[q].type])ee=[u(d(ee),y)];else{if((y=t.filter[c[q].type].apply(null,c[q].matches))[w]){for(A=++q;A<k&&!t.relative[c[A].type];A++);return x(1<q&&d(ee),1<q&&un(c.slice(0,q-1).concat({value:c[q-2].type===" "?"*":""})).replace(Tt,"$1"),y,q<A&&M(c.slice(q,A)),A<k&&M(c=c.slice(A)),A<k&&un(c))}ee.push(y)}return d(ee)}function O(c,h){var y,A,k,z,G,q,T=[],se=[],ee=X[c+" "];if(!ee){for(h||(h=cn(c)),y=h.length;y--;)(ee=M(h[y]))[w]?T.push(ee):se.push(ee);(ee=X(c,(A=se,z=0<(k=T).length,G=0<A.length,q=function(te,re,J,xe,He){var Ce,Re,Fe,rt=0,he="0",pn=te&&[],st=[],po=n,Ro=te||G&&t.find.TAG("*",He),Uo=g+=po==null?1:Math.random()||.1,No=Ro.length;for(He&&(n=re==r||re||He);he!==No&&(Ce=Ro[he])!=null;he++){if(G&&Ce){for(Re=0,re||Ce.ownerDocument==r||(Ct(Ce),J=!p);Fe=A[Re++];)if(Fe(Ce,re||r,J)){v.call(xe,Ce);break}He&&(g=Uo)}z&&((Ce=!Fe&&Ce)&&rt--,te&&pn.push(Ce))}if(rt+=he,z&&he!==rt){for(Re=0;Fe=k[Re++];)Fe(pn,st,re,J);if(te){if(0<rt)for(;he--;)pn[he]||st[he]||(st[he]=mo.call(xe));st=b(st)}v.apply(xe,st),He&&!te&&0<st.length&&1<rt+k.length&&i.uniqueSort(xe)}return He&&(g=Uo,n=po),pn},z?de(q):q))).selector=c}return ee}function ie(c,h,y,A){var k,z,G,q,T,se=typeof c=="function"&&c,ee=!A&&cn(c=se.selector||c);if(y=y||[],ee.length===1){if(2<(z=ee[0]=ee[0].slice(0)).length&&(G=z[0]).type==="ID"&&h.nodeType===9&&p&&t.relative[z[1].type]){if(!(h=(t.find.ID(G.matches[0].replace(ve,Se),h)||[])[0]))return y;se&&(h=h.parentNode),c=c.slice(z.shift().value.length)}for(k=it.needsContext.test(c)?0:z.length;k--&&(G=z[k],!t.relative[q=G.type]);)if((T=t.find[q])&&(A=T(G.matches[0].replace(ve,Se),be.test(z[0].type)&&At(h.parentNode)||h))){if(z.splice(k,1),!(c=A.length&&un(z)))return v.apply(y,A),y;break}}return(se||O(c,ee))(A,h,!p,y,!h||be.test(c)&&At(h.parentNode)||h),y}uo.prototype=t.filters=t.pseudos,t.setFilters=new uo,K.sortStable=w.split("").sort(ye).join("")===w,Ct(),K.sortDetached=ne(function(c){return 1&c.compareDocumentPosition(r.createElement("fieldset"))}),i.find=Q,i.expr[":"]=i.expr.pseudos,i.unique=i.uniqueSort,Q.compile=O,Q.select=ie,Q.setDocument=Ct,Q.tokenize=cn,Q.escape=i.escapeSelector,Q.getText=i.text,Q.isXML=i.isXMLDoc,Q.selectors=i.expr,Q.support=i.support,Q.uniqueSort=i.uniqueSort})();var Ve=function(e,t,n){for(var o=[],a=n!==void 0;(e=e[t])&&e.nodeType!==9;)if(e.nodeType===1){if(a&&i(e).is(n))break;o.push(e)}return o},Mn=function(e,t){for(var n=[];e;e=e.nextSibling)e.nodeType===1&&e!==t&&n.push(e);return n},Zn=i.expr.match.needsContext,jn=/^<([a-z][^\/\0>:\x20\t\r\n\f]*)[\x20\t\r\n\f]*\/?>(?:<\/\1>|)$/i;function fn(e,t,n){return $(t)?i.grep(e,function(o,a){return!!t.call(o,a,o)!==n}):t.nodeType?i.grep(e,function(o){return o===t!==n}):typeof t!="string"?i.grep(e,function(o){return-1<I.call(t,o)!==n}):i.filter(t,e,n)}i.filter=function(e,t,n){var o=t[0];return n&&(e=":not("+e+")"),t.length===1&&o.nodeType===1?i.find.matchesSelector(o,e)?[o]:[]:i.find.matches(e,i.grep(t,function(a){return a.nodeType===1}))},i.fn.extend({find:function(e){var t,n,o=this.length,a=this;if(typeof e!="string")return this.pushStack(i(e).filter(function(){for(t=0;t<o;t++)if(i.contains(a[t],this))return!0}));for(n=this.pushStack([]),t=0;t<o;t++)i.find(e,a[t],n);return 1<o?i.uniqueSort(n):n},filter:function(e){return this.pushStack(fn(this,e||[],!1))},not:function(e){return this.pushStack(fn(this,e||[],!0))},is:function(e){return!!fn(this,typeof e=="string"&&Zn.test(e)?i(e):e||[],!1).length}});var hn,Ft=/^(?:\s*(<[\w\W]+>)[^>]*|#([\w-]+))$/;(i.fn.init=function(e,t,n){var o,a;if(!e)return this;if(n=n||hn,typeof e=="string"){if(!(o=e[0]==="<"&&e[e.length-1]===">"&&3<=e.length?[null,e,null]:Ft.exec(e))||!o[1]&&t)return!t||t.jquery?(t||n).find(e):this.constructor(t).find(e);if(o[1]){if(t=t instanceof i?t[0]:t,i.merge(this,i.parseHTML(o[1],t&&t.nodeType?t.ownerDocument||t:_,!0)),jn.test(o[1])&&i.isPlainObject(t))for(o in t)$(this[o])?this[o](t[o]):this.attr(o,t[o]);return this}return(a=_.getElementById(o[2]))&&(this[0]=a,this.length=1),this}return e.nodeType?(this[0]=e,this.length=1,this):$(e)?n.ready!==void 0?n.ready(e):e(i):i.makeArray(e,this)}).prototype=i.fn,hn=i(_);var H=/^(?:parents|prev(?:Until|All))/,xo={children:!0,contents:!0,next:!0,prev:!0};function Tn(e,t){for(;(e=e[t])&&e.nodeType!==1;);return e}i.fn.extend({has:function(e){var t=i(e,this),n=t.length;return this.filter(function(){for(var o=0;o<n;o++)if(i.contains(this,t[o]))return!0})},closest:function(e,t){var n,o=0,a=this.length,r=[],l=typeof e!="string"&&i(e);if(!Zn.test(e)){for(;o<a;o++)for(n=this[o];n&&n!==t;n=n.parentNode)if(n.nodeType<11&&(l?-1<l.index(n):n.nodeType===1&&i.find.matchesSelector(n,e))){r.push(n);break}}return this.pushStack(1<r.length?i.uniqueSort(r):r)},index:function(e){return e?typeof e=="string"?I.call(i(e),this[0]):I.call(this,e.jquery?e[0]:e):this[0]&&this[0].parentNode?this.first().prevAll().length:-1},add:function(e,t){return this.pushStack(i.uniqueSort(i.merge(this.get(),i(e,t))))},addBack:function(e){return this.add(e==null?this.prevObject:this.prevObject.filter(e))}}),i.each({parent:function(e){var t=e.parentNode;return t&&t.nodeType!==11?t:null},parents:function(e){return Ve(e,"parentNode")},parentsUntil:function(e,t,n){return Ve(e,"parentNode",n)},next:function(e){return Tn(e,"nextSibling")},prev:function(e){return Tn(e,"previousSibling")},nextAll:function(e){return Ve(e,"nextSibling")},prevAll:function(e){return Ve(e,"previousSibling")},nextUntil:function(e,t,n){return Ve(e,"nextSibling",n)},prevUntil:function(e,t,n){return Ve(e,"previousSibling",n)},siblings:function(e){return Mn((e.parentNode||{}).firstChild,e)},children:function(e){return Mn(e.firstChild)},contents:function(e){return e.contentDocument!=null&&V(e.contentDocument)?e.contentDocument:(ue(e,"template")&&(e=e.content||e),i.merge([],e.childNodes))}},function(e,t){i.fn[e]=function(n,o){var a=i.map(this,t,n);return e.slice(-5)!=="Until"&&(o=n),o&&typeof o=="string"&&(a=i.filter(o,a)),1<this.length&&(xo[e]||i.uniqueSort(a),H.test(e)&&a.reverse()),this.pushStack(a)}});var We=/[^\x20\t\r\n\f]+/g;function wt(e){return e}function mn(e){throw e}function Ln(e,t,n,o){var a;try{e&&$(a=e.promise)?a.call(e).done(t).fail(n):e&&$(a=e.then)?a.call(e,t,n):t.apply(void 0,[e].slice(o))}catch(r){n.apply(void 0,[r])}}i.Callbacks=function(e){var t,n;e=typeof e=="string"?(t=e,n={},i.each(t.match(We)||[],function(g,D){n[D]=!0}),n):i.extend({},e);var o,a,r,l,p=[],f=[],m=-1,v=function(){for(l=l||e.once,r=o=!0;f.length;m=-1)for(a=f.shift();++m<p.length;)p[m].apply(a[0],a[1])===!1&&e.stopOnFalse&&(m=p.length,a=!1);e.memory||(a=!1),o=!1,l&&(p=a?[]:"")},w={add:function(){return p&&(a&&!o&&(m=p.length-1,f.push(a)),(function g(D){i.each(D,function(N,L){$(L)?e.unique&&w.has(L)||p.push(L):L&&L.length&&jt(L)!=="string"&&g(L)})})(arguments),a&&!o&&v()),this},remove:function(){return i.each(arguments,function(g,D){for(var N;-1<(N=i.inArray(D,p,N));)p.splice(N,1),N<=m&&m--}),this},has:function(g){return g?-1<i.inArray(g,p):0<p.length},empty:function(){return p&&(p=[]),this},disable:function(){return l=f=[],p=a="",this},disabled:function(){return!p},lock:function(){return l=f=[],a||o||(p=a=""),this},locked:function(){return!!l},fireWith:function(g,D){return l||(D=[g,(D=D||[]).slice?D.slice():D],f.push(D),o||v()),this},fire:function(){return w.fireWith(this,arguments),this},fired:function(){return!!r}};return w},i.extend({Deferred:function(e){var t=[["notify","progress",i.Callbacks("memory"),i.Callbacks("memory"),2],["resolve","done",i.Callbacks("once memory"),i.Callbacks("once memory"),0,"resolved"],["reject","fail",i.Callbacks("once memory"),i.Callbacks("once memory"),1,"rejected"]],n="pending",o={state:function(){return n},always:function(){return a.done(arguments).fail(arguments),this},catch:function(r){return o.then(null,r)},pipe:function(){var r=arguments;return i.Deferred(function(l){i.each(t,function(p,f){var m=$(r[f[4]])&&r[f[4]];a[f[1]](function(){var v=m&&m.apply(this,arguments);v&&$(v.promise)?v.promise().progress(l.notify).done(l.resolve).fail(l.reject):l[f[0]+"With"](this,m?[v]:arguments)})}),r=null}).promise()},then:function(r,l,p){var f=0;function m(v,w,g,D){return function(){var N=this,L=arguments,X=function(){var ye,Je;if(!(v<f)){if((ye=g.apply(N,L))===w.promise())throw new TypeError("Thenable self-resolution");Je=ye&&(typeof ye=="object"||typeof ye=="function")&&ye.then,$(Je)?D?Je.call(ye,m(f,w,wt,D),m(f,w,mn,D)):(f++,Je.call(ye,m(f,w,wt,D),m(f,w,mn,D),m(f,w,wt,w.notifyWith))):(g!==wt&&(N=void 0,L=[ye]),(D||w.resolveWith)(N,L))}},pe=D?X:function(){try{X()}catch(ye){i.Deferred.exceptionHook&&i.Deferred.exceptionHook(ye,pe.error),f<=v+1&&(g!==mn&&(N=void 0,L=[ye]),w.rejectWith(N,L))}};v?pe():(i.Deferred.getErrorHook?pe.error=i.Deferred.getErrorHook():i.Deferred.getStackHook&&(pe.error=i.Deferred.getStackHook()),B.setTimeout(pe))}}return i.Deferred(function(v){t[0][3].add(m(0,v,$(p)?p:wt,v.notifyWith)),t[1][3].add(m(0,v,$(r)?r:wt)),t[2][3].add(m(0,v,$(l)?l:mn))}).promise()},promise:function(r){return r!=null?i.extend(r,o):o}},a={};return i.each(t,function(r,l){var p=l[2],f=l[5];o[l[1]]=p.add,f&&p.add(function(){n=f},t[3-r][2].disable,t[3-r][3].disable,t[0][2].lock,t[0][3].lock),p.add(l[3].fire),a[l[0]]=function(){return a[l[0]+"With"](this===a?void 0:this,arguments),this},a[l[0]+"With"]=p.fireWith}),o.promise(a),e&&e.call(a,a),a},when:function(e){var t=arguments.length,n=t,o=Array(n),a=W.call(arguments),r=i.Deferred(),l=function(p){return function(f){o[p]=this,a[p]=1<arguments.length?W.call(arguments):f,--t||r.resolveWith(o,a)}};if(t<=1&&(Ln(e,r.done(l(n)).resolve,r.reject,!t),r.state()==="pending"||$(a[n]&&a[n].then)))return r.then();for(;n--;)Ln(a[n],l(n),r.reject);return r.promise()}});var Ao=/^(Eval|Internal|Range|Reference|Syntax|Type|URI)Error$/;i.Deferred.exceptionHook=function(e,t){B.console&&B.console.warn&&e&&Ao.test(e.name)&&B.console.warn("jQuery.Deferred exception: "+e.message,e.stack,t)},i.readyException=function(e){B.setTimeout(function(){throw e})};var On=i.Deferred();function gn(){_.removeEventListener("DOMContentLoaded",gn),B.removeEventListener("load",gn),i.ready()}i.fn.ready=function(e){return On.then(e).catch(function(t){i.readyException(t)}),this},i.extend({isReady:!1,readyWait:1,ready:function(e){(e===!0?--i.readyWait:i.isReady)||(i.isReady=!0)!==e&&0<--i.readyWait||On.resolveWith(_,[i])}}),i.ready.then=On.then,_.readyState==="complete"||_.readyState!=="loading"&&!_.documentElement.doScroll?B.setTimeout(i.ready):(_.addEventListener("DOMContentLoaded",gn),B.addEventListener("load",gn));var fe=function(e,t,n,o,a,r,l){var p=0,f=e.length,m=n==null;if(jt(n)==="object")for(p in a=!0,n)fe(e,t,p,n[p],!0,r,l);else if(o!==void 0&&(a=!0,$(o)||(l=!0),m&&(l?(t.call(e,o),t=null):(m=t,t=function(v,w,g){return m.call(i(v),g)})),t))for(;p<f;p++)t(e[p],n,l?o:o.call(e[p],p,t(e[p],n)));return a?e:m?t.call(e):f?t(e[0],n):r},Xn=/^-ms-/,Zt=/-([a-z])/g;function Yn(e,t){return t.toUpperCase()}function ze(e){return e.replace(Xn,"ms-").replace(Zt,Yn)}var St=function(e){return e.nodeType===1||e.nodeType===9||!+e.nodeType};function lt(){this.expando=i.expando+lt.uid++}lt.uid=1,lt.prototype={cache:function(e){var t=e[this.expando];return t||(t={},St(e)&&(e.nodeType?e[this.expando]=t:Object.defineProperty(e,this.expando,{value:t,configurable:!0}))),t},set:function(e,t,n){var o,a=this.cache(e);if(typeof t=="string")a[ze(t)]=n;else for(o in t)a[ze(o)]=t[o];return a},get:function(e,t){return t===void 0?this.cache(e):e[this.expando]&&e[this.expando][ze(t)]},access:function(e,t,n){return t===void 0||t&&typeof t=="string"&&n===void 0?this.get(e,t):(this.set(e,t,n),n!==void 0?n:t)},remove:function(e,t){var n,o=e[this.expando];if(o!==void 0){if(t!==void 0)for(n=(t=Array.isArray(t)?t.map(ze):(t=ze(t))in o?[t]:t.match(We)||[]).length;n--;)delete o[t[n]];(t===void 0||i.isEmptyObject(o))&&(e.nodeType?e[this.expando]=void 0:delete e[this.expando])}},hasData:function(e){var t=e[this.expando];return t!==void 0&&!i.isEmptyObject(t)}};var U=new lt,we=new lt,Jn=/^(?:\{[\w\W]*\}|\[[\w\W]*\])$/,_n=/[A-Z]/g;function zn(e,t,n){var o,a;if(n===void 0&&e.nodeType===1)if(o="data-"+t.replace(_n,"-$&").toLowerCase(),typeof(n=e.getAttribute(o))=="string"){try{n=(a=n)==="true"||a!=="false"&&(a==="null"?null:a===+a+""?+a:Jn.test(a)?JSON.parse(a):a)}catch{}we.set(e,t,n)}else n=void 0;return n}i.extend({hasData:function(e){return we.hasData(e)||U.hasData(e)},data:function(e,t,n){return we.access(e,t,n)},removeData:function(e,t){we.remove(e,t)},_data:function(e,t,n){return U.access(e,t,n)},_removeData:function(e,t){U.remove(e,t)}}),i.fn.extend({data:function(e,t){var n,o,a,r=this[0],l=r&&r.attributes;if(e===void 0){if(this.length&&(a=we.get(r),r.nodeType===1&&!U.get(r,"hasDataAttrs"))){for(n=l.length;n--;)l[n]&&(o=l[n].name).indexOf("data-")===0&&(o=ze(o.slice(5)),zn(r,o,a[o]));U.set(r,"hasDataAttrs",!0)}return a}return typeof e=="object"?this.each(function(){we.set(this,e)}):fe(this,function(p){var f;if(r&&p===void 0)return(f=we.get(r,e))!==void 0||(f=zn(r,e))!==void 0?f:void 0;this.each(function(){we.set(this,e,p)})},null,t,1<arguments.length,null,!0)},removeData:function(e){return this.each(function(){we.remove(this,e)})}}),i.extend({queue:function(e,t,n){var o;if(e)return t=(t||"fx")+"queue",o=U.get(e,t),n&&(!o||Array.isArray(n)?o=U.access(e,t,i.makeArray(n)):o.push(n)),o||[]},dequeue:function(e,t){t=t||"fx";var n=i.queue(e,t),o=n.length,a=n.shift(),r=i._queueHooks(e,t);a==="inprogress"&&(a=n.shift(),o--),a&&(t==="fx"&&n.unshift("inprogress"),delete r.stop,a.call(e,function(){i.dequeue(e,t)},r)),!o&&r&&r.empty.fire()},_queueHooks:function(e,t){var n=t+"queueHooks";return U.get(e,n)||U.access(e,n,{empty:i.Callbacks("once memory").add(function(){U.remove(e,[t+"queue",n])})})}}),i.fn.extend({queue:function(e,t){var n=2;return typeof e!="string"&&(t=e,e="fx",n--),arguments.length<n?i.queue(this[0],e):t===void 0?this:this.each(function(){var o=i.queue(this,e,t);i._queueHooks(this,e),e==="fx"&&o[0]!=="inprogress"&&i.dequeue(this,e)})},dequeue:function(e){return this.each(function(){i.dequeue(this,e)})},clearQueue:function(e){return this.queue(e||"fx",[])},promise:function(e,t){var n,o=1,a=i.Deferred(),r=this,l=this.length,p=function(){--o||a.resolveWith(r,[r])};for(typeof e!="string"&&(t=e,e=void 0),e=e||"fx";l--;)(n=U.get(r[l],e+"queueHooks"))&&n.empty&&(o++,n.empty.add(p));return p(),a.promise(t)}});var Gn=/[+-]?(?:\d*\.|)\d+(?:[eE][+-]?\d+|)/.source,kt=new RegExp("^(?:([+-])=|)("+Gn+")([a-z%]*)$","i"),Ne=["Top","Right","Bottom","Left"],$e=_.documentElement,ct=function(e){return i.contains(e.ownerDocument,e)},Rn={composed:!0};$e.getRootNode&&(ct=function(e){return i.contains(e.ownerDocument,e)||e.getRootNode(Rn)===e.ownerDocument});var Ot=function(e,t){return(e=t||e).style.display==="none"||e.style.display===""&&ct(e)&&i.css(e,"display")==="none"};function vn(e,t,n,o){var a,r,l=20,p=o?function(){return o.cur()}:function(){return i.css(e,t,"")},f=p(),m=n&&n[3]||(i.cssNumber[t]?"":"px"),v=e.nodeType&&(i.cssNumber[t]||m!=="px"&&+f)&&kt.exec(i.css(e,t));if(v&&v[3]!==m){for(f/=2,m=m||v[3],v=+f||1;l--;)i.style(e,t,v+m),(1-r)*(1-(r=p()/f||.5))<=0&&(l=0),v/=r;v*=2,i.style(e,t,v+m),n=n||[]}return n&&(v=+v||+f||0,a=n[1]?v+(n[1]+1)*n[2]:+n[2],o&&(o.unit=m,o.start=v,o.end=a)),a}var yn={};function Dt(e,t){for(var n,o,a,r,l,p,f,m=[],v=0,w=e.length;v<w;v++)(o=e[v]).style&&(n=o.style.display,t?(n==="none"&&(m[v]=U.get(o,"display")||null,m[v]||(o.style.display="")),o.style.display===""&&Ot(o)&&(m[v]=(f=l=r=void 0,l=(a=o).ownerDocument,p=a.nodeName,(f=yn[p])||(r=l.body.appendChild(l.createElement(p)),f=i.css(r,"display"),r.parentNode.removeChild(r),f==="none"&&(f="block"),yn[p]=f)))):n!=="none"&&(m[v]="none",U.set(o,"display",n)));for(v=0;v<w;v++)m[v]!=null&&(e[v].style.display=m[v]);return e}i.fn.extend({show:function(){return Dt(this,!0)},hide:function(){return Dt(this)},toggle:function(e){return typeof e=="boolean"?e?this.show():this.hide():this.each(function(){Ot(this)?i(this).show():i(this).hide()})}});var et,bn,Lt=/^(?:checkbox|radio)$/i,$n=/<([a-z][^\/\0>\x20\t\r\n\f]*)/i,eo=/^$|^module$|\/(?:java|ecma)script/i;et=_.createDocumentFragment().appendChild(_.createElement("div")),(bn=_.createElement("input")).setAttribute("type","radio"),bn.setAttribute("checked","checked"),bn.setAttribute("name","t"),et.appendChild(bn),K.checkClone=et.cloneNode(!0).cloneNode(!0).lastChild.checked,et.innerHTML="<textarea>x</textarea>",K.noCloneChecked=!!et.cloneNode(!0).lastChild.defaultValue,et.innerHTML="<option></option>",K.option=!!et.lastChild;var Ee={thead:[1,"<table>","</table>"],col:[2,"<table><colgroup>","</colgroup></table>"],tr:[2,"<table><tbody>","</tbody></table>"],td:[3,"<table><tbody><tr>","</tr></tbody></table>"],_default:[0,"",""]};function Be(e,t){var n;return n=typeof e.getElementsByTagName<"u"?e.getElementsByTagName(t||"*"):typeof e.querySelectorAll<"u"?e.querySelectorAll(t||"*"):[],t===void 0||t&&ue(e,t)?i.merge([e],n):n}function to(e,t){for(var n=0,o=e.length;n<o;n++)U.set(e[n],"globalEval",!t||U.get(t[n],"globalEval"))}Ee.tbody=Ee.tfoot=Ee.colgroup=Ee.caption=Ee.thead,Ee.th=Ee.td,K.option||(Ee.optgroup=Ee.option=[1,"<select multiple='multiple'>","</select>"]);var Co=/<|&#?\w+;/;function no(e,t,n,o,a){for(var r,l,p,f,m,v,w=t.createDocumentFragment(),g=[],D=0,N=e.length;D<N;D++)if((r=e[D])||r===0)if(jt(r)==="object")i.merge(g,r.nodeType?[r]:r);else if(Co.test(r)){for(l=l||w.appendChild(t.createElement("div")),p=($n.exec(r)||["",""])[1].toLowerCase(),f=Ee[p]||Ee._default,l.innerHTML=f[1]+i.htmlPrefilter(r)+f[2],v=f[0];v--;)l=l.lastChild;i.merge(g,l.childNodes),(l=w.firstChild).textContent=""}else g.push(t.createTextNode(r));for(w.textContent="",D=0;r=g[D++];)if(o&&-1<i.inArray(r,o))a&&a.push(r);else if(m=ct(r),l=Be(w.appendChild(r),"script"),m&&to(l),n)for(v=0;r=l[v++];)eo.test(r.type||"")&&n.push(r);return w}var wo=/^([^.]*)(?:\.(.+)|)/;function Xt(){return!0}function Yt(){return!1}function Jt(e,t,n,o,a,r){var l,p;if(typeof t=="object"){for(p in typeof n!="string"&&(o=o||n,n=void 0),t)Jt(e,p,n,o,t[p],r);return e}if(o==null&&a==null?(a=n,o=n=void 0):a==null&&(typeof n=="string"?(a=o,o=void 0):(a=o,o=n,n=void 0)),a===!1)a=Yt;else if(!a)return e;return r===1&&(l=a,(a=function(f){return i().off(f),l.apply(this,arguments)}).guid=l.guid||(l.guid=i.guid++)),e.each(function(){i.event.add(this,t,a,o,n)})}function ut(e,t,n){n?(U.set(e,t,!1),i.event.add(e,t,{namespace:!1,handler:function(o){var a,r=U.get(this,t);if(1&o.isTrigger&&this[t]){if(r)(i.event.special[t]||{}).delegateType&&o.stopPropagation();else if(r=W.call(arguments),U.set(this,t,r),this[t](),a=U.get(this,t),U.set(this,t,!1),r!==a)return o.stopImmediatePropagation(),o.preventDefault(),a}else r&&(U.set(this,t,i.event.trigger(r[0],r.slice(1),this)),o.stopPropagation(),o.isImmediatePropagationStopped=Xt)}})):U.get(e,t)===void 0&&i.event.add(e,t,Xt)}i.event={global:{},add:function(e,t,n,o,a){var r,l,p,f,m,v,w,g,D,N,L,X=U.get(e);if(St(e))for(n.handler&&(n=(r=n).handler,a=r.selector),a&&i.find.matchesSelector($e,a),n.guid||(n.guid=i.guid++),(f=X.events)||(f=X.events=Object.create(null)),(l=X.handle)||(l=X.handle=function(pe){return typeof i<"u"&&i.event.triggered!==pe.type?i.event.dispatch.apply(e,arguments):void 0}),m=(t=(t||"").match(We)||[""]).length;m--;)D=L=(p=wo.exec(t[m])||[])[1],N=(p[2]||"").split(".").sort(),D&&(w=i.event.special[D]||{},D=(a?w.delegateType:w.bindType)||D,w=i.event.special[D]||{},v=i.extend({type:D,origType:L,data:o,handler:n,guid:n.guid,selector:a,needsContext:a&&i.expr.match.needsContext.test(a),namespace:N.join(".")},r),(g=f[D])||((g=f[D]=[]).delegateCount=0,w.setup&&w.setup.call(e,o,N,l)!==!1||e.addEventListener&&e.addEventListener(D,l)),w.add&&(w.add.call(e,v),v.handler.guid||(v.handler.guid=n.guid)),a?g.splice(g.delegateCount++,0,v):g.push(v),i.event.global[D]=!0)},remove:function(e,t,n,o,a){var r,l,p,f,m,v,w,g,D,N,L,X=U.hasData(e)&&U.get(e);if(X&&(f=X.events)){for(m=(t=(t||"").match(We)||[""]).length;m--;)if(D=L=(p=wo.exec(t[m])||[])[1],N=(p[2]||"").split(".").sort(),D){for(w=i.event.special[D]||{},g=f[D=(o?w.delegateType:w.bindType)||D]||[],p=p[2]&&new RegExp("(^|\\.)"+N.join("\\.(?:.*\\.|)")+"(\\.|$)"),l=r=g.length;r--;)v=g[r],!a&&L!==v.origType||n&&n.guid!==v.guid||p&&!p.test(v.namespace)||o&&o!==v.selector&&(o!=="**"||!v.selector)||(g.splice(r,1),v.selector&&g.delegateCount--,w.remove&&w.remove.call(e,v));l&&!g.length&&(w.teardown&&w.teardown.call(e,N,X.handle)!==!1||i.removeEvent(e,D,X.handle),delete f[D])}else for(D in f)i.event.remove(e,D+t[m],n,o,!0);i.isEmptyObject(f)&&U.remove(e,"handle events")}},dispatch:function(e){var t,n,o,a,r,l,p=new Array(arguments.length),f=i.event.fix(e),m=(U.get(this,"events")||Object.create(null))[f.type]||[],v=i.event.special[f.type]||{};for(p[0]=f,t=1;t<arguments.length;t++)p[t]=arguments[t];if(f.delegateTarget=this,!v.preDispatch||v.preDispatch.call(this,f)!==!1){for(l=i.event.handlers.call(this,f,m),t=0;(a=l[t++])&&!f.isPropagationStopped();)for(f.currentTarget=a.elem,n=0;(r=a.handlers[n++])&&!f.isImmediatePropagationStopped();)f.rnamespace&&r.namespace!==!1&&!f.rnamespace.test(r.namespace)||(f.handleObj=r,f.data=r.data,(o=((i.event.special[r.origType]||{}).handle||r.handler).apply(a.elem,p))!==void 0&&(f.result=o)===!1&&(f.preventDefault(),f.stopPropagation()));return v.postDispatch&&v.postDispatch.call(this,f),f.result}},handlers:function(e,t){var n,o,a,r,l,p=[],f=t.delegateCount,m=e.target;if(f&&m.nodeType&&!(e.type==="click"&&1<=e.button)){for(;m!==this;m=m.parentNode||this)if(m.nodeType===1&&(e.type!=="click"||m.disabled!==!0)){for(r=[],l={},n=0;n<f;n++)l[a=(o=t[n]).selector+" "]===void 0&&(l[a]=o.needsContext?-1<i(a,this).index(m):i.find(a,this,null,[m]).length),l[a]&&r.push(o);r.length&&p.push({elem:m,handlers:r})}}return m=this,f<t.length&&p.push({elem:m,handlers:t.slice(f)}),p},addProp:function(e,t){Object.defineProperty(i.Event.prototype,e,{enumerable:!0,configurable:!0,get:$(t)?function(){if(this.originalEvent)return t(this.originalEvent)}:function(){if(this.originalEvent)return this.originalEvent[e]},set:function(n){Object.defineProperty(this,e,{enumerable:!0,configurable:!0,writable:!0,value:n})}})},fix:function(e){return e[i.expando]?e:new i.Event(e)},special:{load:{noBubble:!0},click:{setup:function(e){var t=this||e;return Lt.test(t.type)&&t.click&&ue(t,"input")&&ut(t,"click",!0),!1},trigger:function(e){var t=this||e;return Lt.test(t.type)&&t.click&&ue(t,"input")&&ut(t,"click"),!0},_default:function(e){var t=e.target;return Lt.test(t.type)&&t.click&&ue(t,"input")&&U.get(t,"click")||ue(t,"a")}},beforeunload:{postDispatch:function(e){e.result!==void 0&&e.originalEvent&&(e.originalEvent.returnValue=e.result)}}}},i.removeEvent=function(e,t,n){e.removeEventListener&&e.removeEventListener(t,n)},i.Event=function(e,t){if(!(this instanceof i.Event))return new i.Event(e,t);e&&e.type?(this.originalEvent=e,this.type=e.type,this.isDefaultPrevented=e.defaultPrevented||e.defaultPrevented===void 0&&e.returnValue===!1?Xt:Yt,this.target=e.target&&e.target.nodeType===3?e.target.parentNode:e.target,this.currentTarget=e.currentTarget,this.relatedTarget=e.relatedTarget):this.type=e,t&&i.extend(this,t),this.timeStamp=e&&e.timeStamp||Date.now(),this[i.expando]=!0},i.Event.prototype={constructor:i.Event,isDefaultPrevented:Yt,isPropagationStopped:Yt,isImmediatePropagationStopped:Yt,isSimulated:!1,preventDefault:function(){var e=this.originalEvent;this.isDefaultPrevented=Xt,e&&!this.isSimulated&&e.preventDefault()},stopPropagation:function(){var e=this.originalEvent;this.isPropagationStopped=Xt,e&&!this.isSimulated&&e.stopPropagation()},stopImmediatePropagation:function(){var e=this.originalEvent;this.isImmediatePropagationStopped=Xt,e&&!this.isSimulated&&e.stopImmediatePropagation(),this.stopPropagation()}},i.each({altKey:!0,bubbles:!0,cancelable:!0,changedTouches:!0,ctrlKey:!0,detail:!0,eventPhase:!0,metaKey:!0,pageX:!0,pageY:!0,shiftKey:!0,view:!0,char:!0,code:!0,charCode:!0,key:!0,keyCode:!0,button:!0,buttons:!0,clientX:!0,clientY:!0,offsetX:!0,offsetY:!0,pointerId:!0,pointerType:!0,screenX:!0,screenY:!0,targetTouches:!0,toElement:!0,touches:!0,which:!0},i.event.addProp),i.each({focus:"focusin",blur:"focusout"},function(e,t){function n(o){if(_.documentMode){var a=U.get(this,"handle"),r=i.event.fix(o);r.type=o.type==="focusin"?"focus":"blur",r.isSimulated=!0,a(o),r.target===r.currentTarget&&a(r)}else i.event.simulate(t,o.target,i.event.fix(o))}i.event.special[e]={setup:function(){var o;if(ut(this,e,!0),!_.documentMode)return!1;(o=U.get(this,t))||this.addEventListener(t,n),U.set(this,t,(o||0)+1)},trigger:function(){return ut(this,e),!0},teardown:function(){var o;if(!_.documentMode)return!1;(o=U.get(this,t)-1)?U.set(this,t,o):(this.removeEventListener(t,n),U.remove(this,t))},_default:function(o){return U.get(o.target,e)},delegateType:t},i.event.special[t]={setup:function(){var o=this.ownerDocument||this.document||this,a=_.documentMode?this:o,r=U.get(a,t);r||(_.documentMode?this.addEventListener(t,n):o.addEventListener(e,n,!0)),U.set(a,t,(r||0)+1)},teardown:function(){var o=this.ownerDocument||this.document||this,a=_.documentMode?this:o,r=U.get(a,t)-1;r?U.set(a,t,r):(_.documentMode?this.removeEventListener(t,n):o.removeEventListener(e,n,!0),U.remove(a,t))}}}),i.each({mouseenter:"mouseover",mouseleave:"mouseout",pointerenter:"pointerover",pointerleave:"pointerout"},function(e,t){i.event.special[e]={delegateType:t,bindType:t,handle:function(n){var o,a=n.relatedTarget,r=n.handleObj;return a&&(a===this||i.contains(this,a))||(n.type=r.origType,o=r.handler.apply(this,arguments),n.type=t),o}}}),i.fn.extend({on:function(e,t,n,o){return Jt(this,e,t,n,o)},one:function(e,t,n,o){return Jt(this,e,t,n,o,1)},off:function(e,t,n){var o,a;if(e&&e.preventDefault&&e.handleObj)return o=e.handleObj,i(e.delegateTarget).off(o.namespace?o.origType+"."+o.namespace:o.origType,o.selector,o.handler),this;if(typeof e=="object"){for(a in e)this.off(a,t,e[a]);return this}return t!==!1&&typeof t!="function"||(n=t,t=void 0),n===!1&&(n=Yt),this.each(function(){i.event.remove(this,e,n,t)})}});var pt=/<script|<style|<link/i,xn=/checked\s*(?:[^=]|=\s*.checked.)/i,Un=/^\s*<!\[CDATA\[|\]\]>\s*$/g;function Vn(e,t){return ue(e,"table")&&ue(t.nodeType!==11?t:t.firstChild,"tr")&&i(e).children("tbody")[0]||e}function An(e){return e.type=(e.getAttribute("type")!==null)+"/"+e.type,e}function So(e){return(e.type||"").slice(0,5)==="true/"?e.type=e.type.slice(5):e.removeAttribute("type"),e}function dt(e,t){var n,o,a,r,l,p;if(t.nodeType===1){if(U.hasData(e)&&(p=U.get(e).events))for(a in U.remove(t,"handle events"),p)for(n=0,o=p[a].length;n<o;n++)i.event.add(t,a,p[a][n]);we.hasData(e)&&(r=we.access(e),l=i.extend({},r),we.set(t,l))}}function tt(e,t,n,o){t=s(t);var a,r,l,p,f,m,v=0,w=e.length,g=w-1,D=t[0],N=$(D);if(N||1<w&&typeof D=="string"&&!K.checkClone&&xn.test(D))return e.each(function(L){var X=e.eq(L);N&&(t[0]=D.call(this,L,X.html())),tt(X,t,n,o)});if(w&&(r=(a=no(t,e[0].ownerDocument,!1,e,o)).firstChild,a.childNodes.length===1&&(a=r),r||o)){for(p=(l=i.map(Be(a,"script"),An)).length;v<w;v++)f=a,v!==g&&(f=i.clone(f,!0,!0),p&&i.merge(l,Be(f,"script"))),n.call(e[v],f,v);if(p)for(m=l[l.length-1].ownerDocument,i.map(l,So),v=0;v<p;v++)f=l[v],eo.test(f.type||"")&&!U.access(f,"globalEval")&&i.contains(m,f)&&(f.src&&(f.type||"").toLowerCase()!=="module"?i._evalUrl&&!f.noModule&&i._evalUrl(f.src,{nonce:f.nonce||f.getAttribute("nonce")},m):Qn(f.textContent.replace(Un,""),f,m))}return e}function zt(e,t,n){for(var o,a=t?i.filter(t,e):e,r=0;(o=a[r])!=null;r++)n||o.nodeType!==1||i.cleanData(Be(o)),o.parentNode&&(n&&ct(o)&&to(Be(o,"script")),o.parentNode.removeChild(o));return e}i.extend({htmlPrefilter:function(e){return e},clone:function(e,t,n){var o,a,r,l,p,f,m,v=e.cloneNode(!0),w=ct(e);if(!(K.noCloneChecked||e.nodeType!==1&&e.nodeType!==11||i.isXMLDoc(e)))for(l=Be(v),o=0,a=(r=Be(e)).length;o<a;o++)p=r[o],f=l[o],(m=f.nodeName.toLowerCase())==="input"&&Lt.test(p.type)?f.checked=p.checked:m!=="input"&&m!=="textarea"||(f.defaultValue=p.defaultValue);if(t)if(n)for(r=r||Be(e),l=l||Be(v),o=0,a=r.length;o<a;o++)dt(r[o],l[o]);else dt(e,v);return 0<(l=Be(v,"script")).length&&to(l,!w&&Be(e,"script")),v},cleanData:function(e){for(var t,n,o,a=i.event.special,r=0;(n=e[r])!==void 0;r++)if(St(n)){if(t=n[U.expando]){if(t.events)for(o in t.events)a[o]?i.event.remove(n,o):i.removeEvent(n,o,t.handle);n[U.expando]=void 0}n[we.expando]&&(n[we.expando]=void 0)}}}),i.fn.extend({detach:function(e){return zt(this,e,!0)},remove:function(e){return zt(this,e)},text:function(e){return fe(this,function(t){return t===void 0?i.text(this):this.empty().each(function(){this.nodeType!==1&&this.nodeType!==11&&this.nodeType!==9||(this.textContent=t)})},null,e,arguments.length)},append:function(){return tt(this,arguments,function(e){this.nodeType!==1&&this.nodeType!==11&&this.nodeType!==9||Vn(this,e).appendChild(e)})},prepend:function(){return tt(this,arguments,function(e){if(this.nodeType===1||this.nodeType===11||this.nodeType===9){var t=Vn(this,e);t.insertBefore(e,t.firstChild)}})},before:function(){return tt(this,arguments,function(e){this.parentNode&&this.parentNode.insertBefore(e,this)})},after:function(){return tt(this,arguments,function(e){this.parentNode&&this.parentNode.insertBefore(e,this.nextSibling)})},empty:function(){for(var e,t=0;(e=this[t])!=null;t++)e.nodeType===1&&(i.cleanData(Be(e,!1)),e.textContent="");return this},clone:function(e,t){return e=e!=null&&e,t=t??e,this.map(function(){return i.clone(this,e,t)})},html:function(e){return fe(this,function(t){var n=this[0]||{},o=0,a=this.length;if(t===void 0&&n.nodeType===1)return n.innerHTML;if(typeof t=="string"&&!pt.test(t)&&!Ee[($n.exec(t)||["",""])[1].toLowerCase()]){t=i.htmlPrefilter(t);try{for(;o<a;o++)(n=this[o]||{}).nodeType===1&&(i.cleanData(Be(n,!1)),n.innerHTML=t);n=0}catch{}}n&&this.empty().append(t)},null,e,arguments.length)},replaceWith:function(){var e=[];return tt(this,arguments,function(t){var n=this.parentNode;i.inArray(this,e)<0&&(i.cleanData(Be(this)),n&&n.replaceChild(t,this))},e)}}),i.each({appendTo:"append",prependTo:"prepend",insertBefore:"before",insertAfter:"after",replaceAll:"replaceWith"},function(e,t){i.fn[e]=function(n){for(var o,a=[],r=i(n),l=r.length-1,p=0;p<=l;p++)o=p===l?this:this.clone(!0),i(r[p])[t](o),C.apply(a,o.get());return this.pushStack(a)}});var Bt=new RegExp("^("+Gn+")(?!px)[a-z%]+$","i"),Me=/^--/,je=function(e){var t=e.ownerDocument.defaultView;return t&&t.opener||(t=B),t.getComputedStyle(e)},ft=function(e,t,n){var o,a,r={};for(a in t)r[a]=e.style[a],e.style[a]=t[a];for(a in o=n.call(e),t)e.style[a]=r[a];return o},_t=new RegExp(Ne.join("|"),"i");function Gt(e,t,n){var o,a,r,l,p=Me.test(t),f=e.style;return(n=n||je(e))&&(l=n.getPropertyValue(t)||n[t],p&&l&&(l=l.replace(Tt,"$1")||void 0),l!==""||ct(e)||(l=i.style(e,t)),!K.pixelBoxStyles()&&Bt.test(l)&&_t.test(t)&&(o=f.width,a=f.minWidth,r=f.maxWidth,f.minWidth=f.maxWidth=f.width=l,l=n.width,f.width=o,f.minWidth=a,f.maxWidth=r)),l!==void 0?l+"":l}function Nn(e,t){return{get:function(){if(!e())return(this.get=t).apply(this,arguments);delete this.get}}}(function(){function e(){if(m){f.style.cssText="position:absolute;left:-11111px;width:60px;margin-top:1px;padding:0;border:0",m.style.cssText="position:relative;display:block;box-sizing:border-box;overflow:scroll;margin:auto;border:1px;padding:1px;width:60%;top:1%",$e.appendChild(f).appendChild(m);var v=B.getComputedStyle(m);n=v.top!=="1%",p=t(v.marginLeft)===12,m.style.right="60%",r=t(v.right)===36,o=t(v.width)===36,m.style.position="absolute",a=t(m.offsetWidth/3)===12,$e.removeChild(f),m=null}}function t(v){return Math.round(parseFloat(v))}var n,o,a,r,l,p,f=_.createElement("div"),m=_.createElement("div");m.style&&(m.style.backgroundClip="content-box",m.cloneNode(!0).style.backgroundClip="",K.clearCloneStyle=m.style.backgroundClip==="content-box",i.extend(K,{boxSizingReliable:function(){return e(),o},pixelBoxStyles:function(){return e(),r},pixelPosition:function(){return e(),n},reliableMarginLeft:function(){return e(),p},scrollboxSize:function(){return e(),a},reliableTrDimensions:function(){var v,w,g,D;return l==null&&(v=_.createElement("table"),w=_.createElement("tr"),g=_.createElement("div"),v.style.cssText="position:absolute;left:-11111px;border-collapse:separate",w.style.cssText="box-sizing:content-box;border:1px solid",w.style.height="1px",g.style.height="9px",g.style.display="block",$e.appendChild(v).appendChild(w).appendChild(g),D=B.getComputedStyle(w),l=parseInt(D.height,10)+parseInt(D.borderTopWidth,10)+parseInt(D.borderBottomWidth,10)===w.offsetHeight,$e.removeChild(v)),l}}))})();var ko=["Webkit","Moz","ms"],oo=_.createElement("div").style,io={};function Cn(e){var t=i.cssProps[e]||io[e];return t||(e in oo?e:io[e]=(function(n){for(var o=n[0].toUpperCase()+n.slice(1),a=ko.length;a--;)if((n=ko[a]+o)in oo)return n})(e)||e)}var wn=/^(none|table(?!-c[ea]).+)/,Go={position:"absolute",visibility:"hidden",display:"block"},Z={letterSpacing:"0",fontWeight:"400"};function qn(e,t,n){var o=kt.exec(t);return o?Math.max(0,o[2]-(n||0))+(o[3]||"px"):t}function Sn(e,t,n,o,a,r){var l=t==="width"?1:0,p=0,f=0,m=0;if(n===(o?"border":"content"))return 0;for(;l<4;l+=2)n==="margin"&&(m+=i.css(e,n+Ne[l],!0,a)),o?(n==="content"&&(f-=i.css(e,"padding"+Ne[l],!0,a)),n!=="margin"&&(f-=i.css(e,"border"+Ne[l]+"Width",!0,a))):(f+=i.css(e,"padding"+Ne[l],!0,a),n!=="padding"?f+=i.css(e,"border"+Ne[l]+"Width",!0,a):p+=i.css(e,"border"+Ne[l]+"Width",!0,a));return!o&&0<=r&&(f+=Math.max(0,Math.ceil(e["offset"+t[0].toUpperCase()+t.slice(1)]-r-f-p-.5))||0),f+m}function kn(e,t,n){var o=je(e),a=(!K.boxSizingReliable()||n)&&i.css(e,"boxSizing",!1,o)==="border-box",r=a,l=Gt(e,t,o),p="offset"+t[0].toUpperCase()+t.slice(1);if(Bt.test(l)){if(!n)return l;l="auto"}return(!K.boxSizingReliable()&&a||!K.reliableTrDimensions()&&ue(e,"tr")||l==="auto"||!parseFloat(l)&&i.css(e,"display",!1,o)==="inline")&&e.getClientRects().length&&(a=i.css(e,"boxSizing",!1,o)==="border-box",(r=p in e)&&(l=e[p])),(l=parseFloat(l)||0)+Sn(e,t,n||(a?"border":"content"),r,o,l)+"px"}function Ie(e,t,n,o,a){return new Ie.prototype.init(e,t,n,o,a)}i.extend({cssHooks:{opacity:{get:function(e,t){if(t){var n=Gt(e,"opacity");return n===""?"1":n}}}},cssNumber:{animationIterationCount:!0,aspectRatio:!0,borderImageSlice:!0,columnCount:!0,flexGrow:!0,flexShrink:!0,fontWeight:!0,gridArea:!0,gridColumn:!0,gridColumnEnd:!0,gridColumnStart:!0,gridRow:!0,gridRowEnd:!0,gridRowStart:!0,lineHeight:!0,opacity:!0,order:!0,orphans:!0,scale:!0,widows:!0,zIndex:!0,zoom:!0,fillOpacity:!0,floodOpacity:!0,stopOpacity:!0,strokeMiterlimit:!0,strokeOpacity:!0},cssProps:{},style:function(e,t,n,o){if(e&&e.nodeType!==3&&e.nodeType!==8&&e.style){var a,r,l,p=ze(t),f=Me.test(t),m=e.style;if(f||(t=Cn(p)),l=i.cssHooks[t]||i.cssHooks[p],n===void 0)return l&&"get"in l&&(a=l.get(e,!1,o))!==void 0?a:m[t];(r=typeof n)=="string"&&(a=kt.exec(n))&&a[1]&&(n=vn(e,t,a),r="number"),n!=null&&n==n&&(r!=="number"||f||(n+=a&&a[3]||(i.cssNumber[p]?"":"px")),K.clearCloneStyle||n!==""||t.indexOf("background")!==0||(m[t]="inherit"),l&&"set"in l&&(n=l.set(e,n,o))===void 0||(f?m.setProperty(t,n):m[t]=n))}},css:function(e,t,n,o){var a,r,l,p=ze(t);return Me.test(t)||(t=Cn(p)),(l=i.cssHooks[t]||i.cssHooks[p])&&"get"in l&&(a=l.get(e,!0,n)),a===void 0&&(a=Gt(e,t,o)),a==="normal"&&t in Z&&(a=Z[t]),n===""||n?(r=parseFloat(a),n===!0||isFinite(r)?r||0:a):a}}),i.each(["height","width"],function(e,t){i.cssHooks[t]={get:function(n,o,a){if(o)return!wn.test(i.css(n,"display"))||n.getClientRects().length&&n.getBoundingClientRect().width?kn(n,t,a):ft(n,Go,function(){return kn(n,t,a)})},set:function(n,o,a){var r,l=je(n),p=!K.scrollboxSize()&&l.position==="absolute",f=(p||a)&&i.css(n,"boxSizing",!1,l)==="border-box",m=a?Sn(n,t,a,f,l):0;return f&&p&&(m-=Math.ceil(n["offset"+t[0].toUpperCase()+t.slice(1)]-parseFloat(l[t])-Sn(n,t,"border",!1,l)-.5)),m&&(r=kt.exec(o))&&(r[3]||"px")!=="px"&&(n.style[t]=o,o=i.css(n,t)),qn(0,o,m)}}}),i.cssHooks.marginLeft=Nn(K.reliableMarginLeft,function(e,t){if(t)return(parseFloat(Gt(e,"marginLeft"))||e.getBoundingClientRect().left-ft(e,{marginLeft:0},function(){return e.getBoundingClientRect().left}))+"px"}),i.each({margin:"",padding:"",border:"Width"},function(e,t){i.cssHooks[e+t]={expand:function(n){for(var o=0,a={},r=typeof n=="string"?n.split(" "):[n];o<4;o++)a[e+Ne[o]+t]=r[o]||r[o-2]||r[0];return a}},e!=="margin"&&(i.cssHooks[e+t].set=qn)}),i.fn.extend({css:function(e,t){return fe(this,function(n,o,a){var r,l,p={},f=0;if(Array.isArray(o)){for(r=je(n),l=o.length;f<l;f++)p[o[f]]=i.css(n,o[f],!1,r);return p}return a!==void 0?i.style(n,o,a):i.css(n,o)},e,t,1<arguments.length)}}),((i.Tween=Ie).prototype={constructor:Ie,init:function(e,t,n,o,a,r){this.elem=e,this.prop=n,this.easing=a||i.easing._default,this.options=t,this.start=this.now=this.cur(),this.end=o,this.unit=r||(i.cssNumber[n]?"":"px")},cur:function(){var e=Ie.propHooks[this.prop];return e&&e.get?e.get(this):Ie.propHooks._default.get(this)},run:function(e){var t,n=Ie.propHooks[this.prop];return this.options.duration?this.pos=t=i.easing[this.easing](e,this.options.duration*e,0,1,this.options.duration):this.pos=t=e,this.now=(this.end-this.start)*t+this.start,this.options.step&&this.options.step.call(this.elem,this.now,this),n&&n.set?n.set(this):Ie.propHooks._default.set(this),this}}).init.prototype=Ie.prototype,(Ie.propHooks={_default:{get:function(e){var t;return e.elem.nodeType!==1||e.elem[e.prop]!=null&&e.elem.style[e.prop]==null?e.elem[e.prop]:(t=i.css(e.elem,e.prop,""))&&t!=="auto"?t:0},set:function(e){i.fx.step[e.prop]?i.fx.step[e.prop](e):e.elem.nodeType!==1||!i.cssHooks[e.prop]&&e.elem.style[Cn(e.prop)]==null?e.elem[e.prop]=e.now:i.style(e.elem,e.prop,e.now+e.unit)}}}).scrollTop=Ie.propHooks.scrollLeft={set:function(e){e.elem.nodeType&&e.elem.parentNode&&(e.elem[e.prop]=e.now)}},i.easing={linear:function(e){return e},swing:function(e){return .5-Math.cos(e*Math.PI)/2},_default:"swing"},i.fx=Ie.prototype.init,i.fx.step={};var $t,en,Rt,ao,Dn=/^(?:toggle|show|hide)$/,ro=/queueHooks$/;function tn(){en&&(_.hidden===!1&&B.requestAnimationFrame?B.requestAnimationFrame(tn):B.setTimeout(tn,i.fx.interval),i.fx.tick())}function so(){return B.setTimeout(function(){$t=void 0}),$t=Date.now()}function Ge(e,t){var n,o=0,a={height:e};for(t=t?1:0;o<4;o+=2-t)a["margin"+(n=Ne[o])]=a["padding"+n]=e;return t&&(a.opacity=a.width=e),a}function Bn(e,t,n){for(var o,a=(qe.tweeners[t]||[]).concat(qe.tweeners["*"]),r=0,l=a.length;r<l;r++)if(o=a[r].call(n,t,e))return o}function qe(e,t,n){var o,a,r=0,l=qe.prefilters.length,p=i.Deferred().always(function(){delete f.elem}),f=function(){if(a)return!1;for(var w=$t||so(),g=Math.max(0,m.startTime+m.duration-w),D=1-(g/m.duration||0),N=0,L=m.tweens.length;N<L;N++)m.tweens[N].run(D);return p.notifyWith(e,[m,D,g]),D<1&&L?g:(L||p.notifyWith(e,[m,1,0]),p.resolveWith(e,[m]),!1)},m=p.promise({elem:e,props:i.extend({},t),opts:i.extend(!0,{specialEasing:{},easing:i.easing._default},n),originalProperties:t,originalOptions:n,startTime:$t||so(),duration:n.duration,tweens:[],createTween:function(w,g){var D=i.Tween(e,m.opts,w,g,m.opts.specialEasing[w]||m.opts.easing);return m.tweens.push(D),D},stop:function(w){var g=0,D=w?m.tweens.length:0;if(a)return this;for(a=!0;g<D;g++)m.tweens[g].run(1);return w?(p.notifyWith(e,[m,1,0]),p.resolveWith(e,[m,w])):p.rejectWith(e,[m,w]),this}}),v=m.props;for(!(function(w,g){var D,N,L,X,pe;for(D in w)if(L=g[N=ze(D)],X=w[D],Array.isArray(X)&&(L=X[1],X=w[D]=X[0]),D!==N&&(w[N]=X,delete w[D]),(pe=i.cssHooks[N])&&"expand"in pe)for(D in X=pe.expand(X),delete w[N],X)D in w||(w[D]=X[D],g[D]=L);else g[N]=L})(v,m.opts.specialEasing);r<l;r++)if(o=qe.prefilters[r].call(m,e,v,m.opts))return $(o.stop)&&(i._queueHooks(m.elem,m.opts.queue).stop=o.stop.bind(o)),o;return i.map(v,Bn,m),$(m.opts.start)&&m.opts.start.call(e,m),m.progress(m.opts.progress).done(m.opts.done,m.opts.complete).fail(m.opts.fail).always(m.opts.always),i.fx.timer(i.extend(f,{elem:e,anim:m,queue:m.opts.queue})),m}i.Animation=i.extend(qe,{tweeners:{"*":[function(e,t){var n=this.createTween(e,t);return vn(n.elem,e,kt.exec(t),n),n}]},tweener:function(e,t){$(e)?(t=e,e=["*"]):e=e.match(We);for(var n,o=0,a=e.length;o<a;o++)n=e[o],qe.tweeners[n]=qe.tweeners[n]||[],qe.tweeners[n].unshift(t)},prefilters:[function(e,t,n){var o,a,r,l,p,f,m,v,w="width"in t||"height"in t,g=this,D={},N=e.style,L=e.nodeType&&Ot(e),X=U.get(e,"fxshow");for(o in n.queue||((l=i._queueHooks(e,"fx")).unqueued==null&&(l.unqueued=0,p=l.empty.fire,l.empty.fire=function(){l.unqueued||p()}),l.unqueued++,g.always(function(){g.always(function(){l.unqueued--,i.queue(e,"fx").length||l.empty.fire()})})),t)if(a=t[o],Dn.test(a)){if(delete t[o],r=r||a==="toggle",a===(L?"hide":"show")){if(a!=="show"||!X||X[o]===void 0)continue;L=!0}D[o]=X&&X[o]||i.style(e,o)}if((f=!i.isEmptyObject(t))||!i.isEmptyObject(D))for(o in w&&e.nodeType===1&&(n.overflow=[N.overflow,N.overflowX,N.overflowY],(m=X&&X.display)==null&&(m=U.get(e,"display")),(v=i.css(e,"display"))==="none"&&(m?v=m:(Dt([e],!0),m=e.style.display||m,v=i.css(e,"display"),Dt([e]))),(v==="inline"||v==="inline-block"&&m!=null)&&i.css(e,"float")==="none"&&(f||(g.done(function(){N.display=m}),m==null&&(v=N.display,m=v==="none"?"":v)),N.display="inline-block")),n.overflow&&(N.overflow="hidden",g.always(function(){N.overflow=n.overflow[0],N.overflowX=n.overflow[1],N.overflowY=n.overflow[2]})),f=!1,D)f||(X?"hidden"in X&&(L=X.hidden):X=U.access(e,"fxshow",{display:m}),r&&(X.hidden=!L),L&&Dt([e],!0),g.done(function(){for(o in L||Dt([e]),U.remove(e,"fxshow"),D)i.style(e,o,D[o])})),f=Bn(L?X[o]:0,o,g),o in X||(X[o]=f.start,L&&(f.end=f.start,f.start=0))}],prefilter:function(e,t){t?qe.prefilters.unshift(e):qe.prefilters.push(e)}}),i.speed=function(e,t,n){var o=e&&typeof e=="object"?i.extend({},e):{complete:n||!n&&t||$(e)&&e,duration:e,easing:n&&t||t&&!$(t)&&t};return i.fx.off?o.duration=0:typeof o.duration!="number"&&(o.duration in i.fx.speeds?o.duration=i.fx.speeds[o.duration]:o.duration=i.fx.speeds._default),o.queue!=null&&o.queue!==!0||(o.queue="fx"),o.old=o.complete,o.complete=function(){$(o.old)&&o.old.call(this),o.queue&&i.dequeue(this,o.queue)},o},i.fn.extend({fadeTo:function(e,t,n,o){return this.filter(Ot).css("opacity",0).show().end().animate({opacity:t},e,n,o)},animate:function(e,t,n,o){var a=i.isEmptyObject(e),r=i.speed(t,n,o),l=function(){var p=qe(this,i.extend({},e),r);(a||U.get(this,"finish"))&&p.stop(!0)};return l.finish=l,a||r.queue===!1?this.each(l):this.queue(r.queue,l)},stop:function(e,t,n){var o=function(a){var r=a.stop;delete a.stop,r(n)};return typeof e!="string"&&(n=t,t=e,e=void 0),t&&this.queue(e||"fx",[]),this.each(function(){var a=!0,r=e!=null&&e+"queueHooks",l=i.timers,p=U.get(this);if(r)p[r]&&p[r].stop&&o(p[r]);else for(r in p)p[r]&&p[r].stop&&ro.test(r)&&o(p[r]);for(r=l.length;r--;)l[r].elem!==this||e!=null&&l[r].queue!==e||(l[r].anim.stop(n),a=!1,l.splice(r,1));!a&&n||i.dequeue(this,e)})},finish:function(e){return e!==!1&&(e=e||"fx"),this.each(function(){var t,n=U.get(this),o=n[e+"queue"],a=n[e+"queueHooks"],r=i.timers,l=o?o.length:0;for(n.finish=!0,i.queue(this,e,[]),a&&a.stop&&a.stop.call(this,!0),t=r.length;t--;)r[t].elem===this&&r[t].queue===e&&(r[t].anim.stop(!0),r.splice(t,1));for(t=0;t<l;t++)o[t]&&o[t].finish&&o[t].finish.call(this);delete n.finish})}}),i.each(["toggle","show","hide"],function(e,t){var n=i.fn[t];i.fn[t]=function(o,a,r){return o==null||typeof o=="boolean"?n.apply(this,arguments):this.animate(Ge(t,!0),o,a,r)}}),i.each({slideDown:Ge("show"),slideUp:Ge("hide"),slideToggle:Ge("toggle"),fadeIn:{opacity:"show"},fadeOut:{opacity:"hide"},fadeToggle:{opacity:"toggle"}},function(e,t){i.fn[e]=function(n,o,a){return this.animate(t,n,o,a)}}),i.timers=[],i.fx.tick=function(){var e,t=0,n=i.timers;for($t=Date.now();t<n.length;t++)(e=n[t])()||n[t]!==e||n.splice(t--,1);n.length||i.fx.stop(),$t=void 0},i.fx.timer=function(e){i.timers.push(e),i.fx.start()},i.fx.interval=13,i.fx.start=function(){en||(en=!0,tn())},i.fx.stop=function(){en=null},i.fx.speeds={slow:600,fast:200,_default:400},i.fn.delay=function(e,t){return e=i.fx&&i.fx.speeds[e]||e,t=t||"fx",this.queue(t,function(n,o){var a=B.setTimeout(n,e);o.stop=function(){B.clearTimeout(a)}})},Rt=_.createElement("input"),ao=_.createElement("select").appendChild(_.createElement("option")),Rt.type="checkbox",K.checkOn=Rt.value!=="",K.optSelected=ao.selected,(Rt=_.createElement("input")).value="t",Rt.type="radio",K.radioValue=Rt.value==="t";var ht,Te=i.expr.attrHandle;i.fn.extend({attr:function(e,t){return fe(this,i.attr,e,t,1<arguments.length)},removeAttr:function(e){return this.each(function(){i.removeAttr(this,e)})}}),i.extend({attr:function(e,t,n){var o,a,r=e.nodeType;if(r!==3&&r!==8&&r!==2)return typeof e.getAttribute>"u"?i.prop(e,t,n):(r===1&&i.isXMLDoc(e)||(a=i.attrHooks[t.toLowerCase()]||(i.expr.match.bool.test(t)?ht:void 0)),n!==void 0?n===null?void i.removeAttr(e,t):a&&"set"in a&&(o=a.set(e,n,t))!==void 0?o:(e.setAttribute(t,n+""),n):a&&"get"in a&&(o=a.get(e,t))!==null?o:(o=i.find.attr(e,t))==null?void 0:o)},attrHooks:{type:{set:function(e,t){if(!K.radioValue&&t==="radio"&&ue(e,"input")){var n=e.value;return e.setAttribute("type",t),n&&(e.value=n),t}}}},removeAttr:function(e,t){var n,o=0,a=t&&t.match(We);if(a&&e.nodeType===1)for(;n=a[o++];)e.removeAttribute(n)}}),ht={set:function(e,t,n){return t===!1?i.removeAttr(e,n):e.setAttribute(n,n),n}},i.each(i.expr.match.bool.source.match(/\w+/g),function(e,t){var n=Te[t]||i.find.attr;Te[t]=function(o,a,r){var l,p,f=a.toLowerCase();return r||(p=Te[f],Te[f]=l,l=n(o,a,r)!=null?f:null,Te[f]=p),l}});var lo=/^(?:input|select|textarea|button)$/i,mt=/^(?:a|area)$/i;function Ke(e){return(e.match(We)||[]).join(" ")}function Xe(e){return e.getAttribute&&e.getAttribute("class")||""}function nt(e){return Array.isArray(e)?e:typeof e=="string"&&e.match(We)||[]}i.fn.extend({prop:function(e,t){return fe(this,i.prop,e,t,1<arguments.length)},removeProp:function(e){return this.each(function(){delete this[i.propFix[e]||e]})}}),i.extend({prop:function(e,t,n){var o,a,r=e.nodeType;if(r!==3&&r!==8&&r!==2)return r===1&&i.isXMLDoc(e)||(t=i.propFix[t]||t,a=i.propHooks[t]),n!==void 0?a&&"set"in a&&(o=a.set(e,n,t))!==void 0?o:e[t]=n:a&&"get"in a&&(o=a.get(e,t))!==null?o:e[t]},propHooks:{tabIndex:{get:function(e){var t=i.find.attr(e,"tabindex");return t?parseInt(t,10):lo.test(e.nodeName)||mt.test(e.nodeName)&&e.href?0:-1}}},propFix:{for:"htmlFor",class:"className"}}),K.optSelected||(i.propHooks.selected={get:function(e){var t=e.parentNode;return t&&t.parentNode&&t.parentNode.selectedIndex,null},set:function(e){var t=e.parentNode;t&&(t.selectedIndex,t.parentNode&&t.parentNode.selectedIndex)}}),i.each(["tabIndex","readOnly","maxLength","cellSpacing","cellPadding","rowSpan","colSpan","useMap","frameBorder","contentEditable"],function(){i.propFix[this.toLowerCase()]=this}),i.fn.extend({addClass:function(e){var t,n,o,a,r,l;return $(e)?this.each(function(p){i(this).addClass(e.call(this,p,Xe(this)))}):(t=nt(e)).length?this.each(function(){if(o=Xe(this),n=this.nodeType===1&&" "+Ke(o)+" "){for(r=0;r<t.length;r++)a=t[r],n.indexOf(" "+a+" ")<0&&(n+=a+" ");l=Ke(n),o!==l&&this.setAttribute("class",l)}}):this},removeClass:function(e){var t,n,o,a,r,l;return $(e)?this.each(function(p){i(this).removeClass(e.call(this,p,Xe(this)))}):arguments.length?(t=nt(e)).length?this.each(function(){if(o=Xe(this),n=this.nodeType===1&&" "+Ke(o)+" "){for(r=0;r<t.length;r++)for(a=t[r];-1<n.indexOf(" "+a+" ");)n=n.replace(" "+a+" "," ");l=Ke(n),o!==l&&this.setAttribute("class",l)}}):this:this.attr("class","")},toggleClass:function(e,t){var n,o,a,r,l=typeof e,p=l==="string"||Array.isArray(e);return $(e)?this.each(function(f){i(this).toggleClass(e.call(this,f,Xe(this),t),t)}):typeof t=="boolean"&&p?t?this.addClass(e):this.removeClass(e):(n=nt(e),this.each(function(){if(p)for(r=i(this),a=0;a<n.length;a++)o=n[a],r.hasClass(o)?r.removeClass(o):r.addClass(o);else e!==void 0&&l!=="boolean"||((o=Xe(this))&&U.set(this,"__className__",o),this.setAttribute&&this.setAttribute("class",o||e===!1?"":U.get(this,"__className__")||""))}))},hasClass:function(e){var t,n,o=0;for(t=" "+e+" ";n=this[o++];)if(n.nodeType===1&&-1<(" "+Ke(Xe(n))+" ").indexOf(t))return!0;return!1}});var Ut=/\r/g;i.fn.extend({val:function(e){var t,n,o,a=this[0];return arguments.length?(o=$(e),this.each(function(r){var l;this.nodeType===1&&((l=o?e.call(this,r,i(this).val()):e)==null?l="":typeof l=="number"?l+="":Array.isArray(l)&&(l=i.map(l,function(p){return p==null?"":p+""})),(t=i.valHooks[this.type]||i.valHooks[this.nodeName.toLowerCase()])&&"set"in t&&t.set(this,l,"value")!==void 0||(this.value=l))})):a?(t=i.valHooks[a.type]||i.valHooks[a.nodeName.toLowerCase()])&&"get"in t&&(n=t.get(a,"value"))!==void 0?n:typeof(n=a.value)=="string"?n.replace(Ut,""):n??"":void 0}}),i.extend({valHooks:{option:{get:function(e){var t=i.find.attr(e,"value");return t??Ke(i.text(e))}},select:{get:function(e){var t,n,o,a=e.options,r=e.selectedIndex,l=e.type==="select-one",p=l?null:[],f=l?r+1:a.length;for(o=r<0?f:l?r:0;o<f;o++)if(((n=a[o]).selected||o===r)&&!n.disabled&&(!n.parentNode.disabled||!ue(n.parentNode,"optgroup"))){if(t=i(n).val(),l)return t;p.push(t)}return p},set:function(e,t){for(var n,o,a=e.options,r=i.makeArray(t),l=a.length;l--;)((o=a[l]).selected=-1<i.inArray(i.valHooks.option.get(o),r))&&(n=!0);return n||(e.selectedIndex=-1),r}}}}),i.each(["radio","checkbox"],function(){i.valHooks[this]={set:function(e,t){if(Array.isArray(t))return e.checked=-1<i.inArray(i(e).val(),t)}},K.checkOn||(i.valHooks[this].get=function(e){return e.getAttribute("value")===null?"on":e.value})});var It=B.location,Do={guid:Date.now()},nn=/\?/;i.parseXML=function(e){var t,n;if(!e||typeof e!="string")return null;try{t=new B.DOMParser().parseFromString(e,"text/xml")}catch{}return n=t&&t.getElementsByTagName("parsererror")[0],t&&!n||i.error("Invalid XML: "+(n?i.map(n.childNodes,function(o){return o.textContent}).join(`
`):e)),t};var on=/^(?:focusinfocus|focusoutblur)$/,an=function(e){e.stopPropagation()};i.extend(i.event,{trigger:function(e,t,n,o){var a,r,l,p,f,m,v,w,g=[n||_],D=R.call(e,"type")?e.type:e,N=R.call(e,"namespace")?e.namespace.split("."):[];if(r=w=l=n=n||_,n.nodeType!==3&&n.nodeType!==8&&!on.test(D+i.event.triggered)&&(-1<D.indexOf(".")&&(D=(N=D.split(".")).shift(),N.sort()),f=D.indexOf(":")<0&&"on"+D,(e=e[i.expando]?e:new i.Event(D,typeof e=="object"&&e)).isTrigger=o?2:3,e.namespace=N.join("."),e.rnamespace=e.namespace?new RegExp("(^|\\.)"+N.join("\\.(?:.*\\.|)")+"(\\.|$)"):null,e.result=void 0,e.target||(e.target=n),t=t==null?[e]:i.makeArray(t,[e]),v=i.event.special[D]||{},o||!v.trigger||v.trigger.apply(n,t)!==!1)){if(!o&&!v.noBubble&&!Ae(n)){for(p=v.delegateType||D,on.test(p+D)||(r=r.parentNode);r;r=r.parentNode)g.push(r),l=r;l===(n.ownerDocument||_)&&g.push(l.defaultView||l.parentWindow||B)}for(a=0;(r=g[a++])&&!e.isPropagationStopped();)w=r,e.type=1<a?p:v.bindType||D,(m=(U.get(r,"events")||Object.create(null))[e.type]&&U.get(r,"handle"))&&m.apply(r,t),(m=f&&r[f])&&m.apply&&St(r)&&(e.result=m.apply(r,t),e.result===!1&&e.preventDefault());return e.type=D,o||e.isDefaultPrevented()||v._default&&v._default.apply(g.pop(),t)!==!1||!St(n)||f&&$(n[D])&&!Ae(n)&&((l=n[f])&&(n[f]=null),i.event.triggered=D,e.isPropagationStopped()&&w.addEventListener(D,an),n[D](),e.isPropagationStopped()&&w.removeEventListener(D,an),i.event.triggered=void 0,l&&(n[f]=l)),e.result}},simulate:function(e,t,n){var o=i.extend(new i.Event,n,{type:e,isSimulated:!0});i.event.trigger(o,null,t)}}),i.fn.extend({trigger:function(e,t){return this.each(function(){i.event.trigger(e,t,this)})},triggerHandler:function(e,t){var n=this[0];if(n)return i.event.trigger(e,t,n,!0)}});var Pe=/\[\]$/,Bo=/\r?\n/g,Io=/^(?:submit|button|image|reset|file)$/i,co=/^(?:input|select|textarea|keygen)/i;function Ye(e,t,n,o){var a;if(Array.isArray(t))i.each(t,function(r,l){n||Pe.test(e)?o(e,l):Ye(e+"["+(typeof l=="object"&&l!=null?r:"")+"]",l,n,o)});else if(n||jt(t)!=="object")o(e,t);else for(a in t)Ye(e+"["+a+"]",t[a],n,o)}i.param=function(e,t){var n,o=[],a=function(r,l){var p=$(l)?l():l;o[o.length]=encodeURIComponent(r)+"="+encodeURIComponent(p??"")};if(e==null)return"";if(Array.isArray(e)||e.jquery&&!i.isPlainObject(e))i.each(e,function(){a(this.name,this.value)});else for(n in e)Ye(n,e[n],t,a);return o.join("&")},i.fn.extend({serialize:function(){return i.param(this.serializeArray())},serializeArray:function(){return this.map(function(){var e=i.prop(this,"elements");return e?i.makeArray(e):this}).filter(function(){var e=this.type;return this.name&&!i(this).is(":disabled")&&co.test(this.nodeName)&&!Io.test(e)&&(this.checked||!Lt.test(e))}).map(function(e,t){var n=i(this).val();return n==null?null:Array.isArray(n)?i.map(n,function(o){return{name:t.name,value:o.replace(Bo,`\r
`)}}):{name:t.name,value:n.replace(Bo,`\r
`)}}).get()}});var Ht=/%20/g,Ho=/#.*$/,Wo=/([?&])_=[^&]*/,Eo=/^(.*?):[ \t]*([^\r\n]*)$/gm,Mo=/^(?:GET|HEAD)$/,rn=/^\/\//,Vt={},ot={},sn="*/".concat("*"),Wt=_.createElement("a");function gt(e){return function(t,n){typeof t!="string"&&(n=t,t="*");var o,a=0,r=t.toLowerCase().match(We)||[];if($(n))for(;o=r[a++];)o[0]==="+"?(o=o.slice(1)||"*",(e[o]=e[o]||[]).unshift(n)):(e[o]=e[o]||[]).push(n)}}function oe(e,t,n,o){var a={},r=e===ot;function l(p){var f;return a[p]=!0,i.each(e[p]||[],function(m,v){var w=v(t,n,o);return typeof w!="string"||r||a[w]?r?!(f=w):void 0:(t.dataTypes.unshift(w),l(w),!1)}),f}return l(t.dataTypes[0])||!a["*"]&&l("*")}function ln(e,t){var n,o,a=i.ajaxSettings.flatOptions||{};for(n in t)t[n]!==void 0&&((a[n]?e:o||(o={}))[n]=t[n]);return o&&i.extend(!0,e,o),e}Wt.href=It.href,i.extend({active:0,lastModified:{},etag:{},ajaxSettings:{url:It.href,type:"GET",isLocal:/^(?:about|app|app-storage|.+-extension|file|res|widget):$/.test(It.protocol),global:!0,processData:!0,async:!0,contentType:"application/x-www-form-urlencoded; charset=UTF-8",accepts:{"*":sn,text:"text/plain",html:"text/html",xml:"application/xml, text/xml",json:"application/json, text/javascript"},contents:{xml:/\bxml\b/,html:/\bhtml/,json:/\bjson\b/},responseFields:{xml:"responseXML",text:"responseText",json:"responseJSON"},converters:{"* text":String,"text html":!0,"text json":JSON.parse,"text xml":i.parseXML},flatOptions:{url:!0,context:!0}},ajaxSetup:function(e,t){return t?ln(ln(e,i.ajaxSettings),t):ln(i.ajaxSettings,e)},ajaxPrefilter:gt(Vt),ajaxTransport:gt(ot),ajax:function(e,t){typeof e=="object"&&(t=e,e=void 0),t=t||{};var n,o,a,r,l,p,f,m,v,w,g=i.ajaxSetup({},t),D=g.context||g,N=g.context&&(D.nodeType||D.jquery)?i(D):i.event,L=i.Deferred(),X=i.Callbacks("once memory"),pe=g.statusCode||{},ye={},Je={},_e="canceled",F={readyState:0,getResponseHeader:function(ae){var Y;if(f){if(!r)for(r={};Y=Eo.exec(a);)r[Y[1].toLowerCase()+" "]=(r[Y[1].toLowerCase()+" "]||[]).concat(Y[2]);Y=r[ae.toLowerCase()+" "]}return Y==null?null:Y.join(", ")},getAllResponseHeaders:function(){return f?a:null},setRequestHeader:function(ae,Y){return f==null&&(ae=Je[ae.toLowerCase()]=Je[ae.toLowerCase()]||ae,ye[ae]=Y),this},overrideMimeType:function(ae){return f==null&&(g.mimeType=ae),this},statusCode:function(ae){var Y;if(ae)if(f)F.always(ae[F.status]);else for(Y in ae)pe[Y]=[pe[Y],ae[Y]];return this},abort:function(ae){var Y=ae||_e;return n&&n.abort(Y),yt(0,Y),this}};if(L.promise(F),g.url=((e||g.url||It.href)+"").replace(rn,It.protocol+"//"),g.type=t.method||t.type||g.method||g.type,g.dataTypes=(g.dataType||"*").toLowerCase().match(We)||[""],g.crossDomain==null){p=_.createElement("a");try{p.href=g.url,p.href=p.href,g.crossDomain=Wt.protocol+"//"+Wt.host!=p.protocol+"//"+p.host}catch{g.crossDomain=!0}}if(g.data&&g.processData&&typeof g.data!="string"&&(g.data=i.param(g.data,g.traditional)),oe(Vt,g,t,F),f)return F;for(v in(m=i.event&&g.global)&&i.active++==0&&i.event.trigger("ajaxStart"),g.type=g.type.toUpperCase(),g.hasContent=!Mo.test(g.type),o=g.url.replace(Ho,""),g.hasContent?g.data&&g.processData&&(g.contentType||"").indexOf("application/x-www-form-urlencoded")===0&&(g.data=g.data.replace(Ht,"+")):(w=g.url.slice(o.length),g.data&&(g.processData||typeof g.data=="string")&&(o+=(nn.test(o)?"&":"?")+g.data,delete g.data),g.cache===!1&&(o=o.replace(Wo,"$1"),w=(nn.test(o)?"&":"?")+"_="+Do.guid+++w),g.url=o+w),g.ifModified&&(i.lastModified[o]&&F.setRequestHeader("If-Modified-Since",i.lastModified[o]),i.etag[o]&&F.setRequestHeader("If-None-Match",i.etag[o])),(g.data&&g.hasContent&&g.contentType!==!1||t.contentType)&&F.setRequestHeader("Content-Type",g.contentType),F.setRequestHeader("Accept",g.dataTypes[0]&&g.accepts[g.dataTypes[0]]?g.accepts[g.dataTypes[0]]+(g.dataTypes[0]!=="*"?", "+sn+"; q=0.01":""):g.accepts["*"]),g.headers)F.setRequestHeader(v,g.headers[v]);if(g.beforeSend&&(g.beforeSend.call(D,F,g)===!1||f))return F.abort();if(_e="abort",X.add(g.complete),F.done(g.success),F.fail(g.error),n=oe(ot,g,t,F)){if(F.readyState=1,m&&N.trigger("ajaxSend",[F,g]),f)return F;g.async&&0<g.timeout&&(l=B.setTimeout(function(){F.abort("timeout")},g.timeout));try{f=!1,n.send(ye,yt)}catch(ae){if(f)throw ae;yt(-1,ae)}}else yt(-1,"No Transport");function yt(ae,Y,bt,Nt){var Qe,qt,it,xt,Kt,Oe=Y;f||(f=!0,l&&B.clearTimeout(l),n=void 0,a=Nt||"",F.readyState=0<ae?4:0,Qe=200<=ae&&ae<300||ae===304,bt&&(xt=(function(be,ve,Se){for(var at,ke,Q,me,de=be.contents,ne=be.dataTypes;ne[0]==="*";)ne.shift(),at===void 0&&(at=be.mimeType||ve.getResponseHeader("Content-Type"));if(at){for(ke in de)if(de[ke]&&de[ke].test(at)){ne.unshift(ke);break}}if(ne[0]in Se)Q=ne[0];else{for(ke in Se){if(!ne[0]||be.converters[ke+" "+ne[0]]){Q=ke;break}me||(me=ke)}Q=Q||me}if(Q)return Q!==ne[0]&&ne.unshift(Q),Se[Q]})(g,F,bt)),!Qe&&-1<i.inArray("script",g.dataTypes)&&i.inArray("json",g.dataTypes)<0&&(g.converters["text script"]=function(){}),xt=(function(be,ve,Se,at){var ke,Q,me,de,ne,ge={},Pt=be.dataTypes.slice();if(Pt[1])for(me in be.converters)ge[me.toLowerCase()]=be.converters[me];for(Q=Pt.shift();Q;)if(be.responseFields[Q]&&(Se[be.responseFields[Q]]=ve),!ne&&at&&be.dataFilter&&(ve=be.dataFilter(ve,be.dataType)),ne=Q,Q=Pt.shift()){if(Q==="*")Q=ne;else if(ne!=="*"&&ne!==Q){if(!(me=ge[ne+" "+Q]||ge["* "+Q])){for(ke in ge)if((de=ke.split(" "))[1]===Q&&(me=ge[ne+" "+de[0]]||ge["* "+de[0]])){me===!0?me=ge[ke]:ge[ke]!==!0&&(Q=de[0],Pt.unshift(de[1]));break}}if(me!==!0)if(me&&be.throws)ve=me(ve);else try{ve=me(ve)}catch(In){return{state:"parsererror",error:me?In:"No conversion from "+ne+" to "+Q}}}}return{state:"success",data:ve}})(g,xt,F,Qe),Qe?(g.ifModified&&((Kt=F.getResponseHeader("Last-Modified"))&&(i.lastModified[o]=Kt),(Kt=F.getResponseHeader("etag"))&&(i.etag[o]=Kt)),ae===204||g.type==="HEAD"?Oe="nocontent":ae===304?Oe="notmodified":(Oe=xt.state,qt=xt.data,Qe=!(it=xt.error))):(it=Oe,!ae&&Oe||(Oe="error",ae<0&&(ae=0))),F.status=ae,F.statusText=(Y||Oe)+"",Qe?L.resolveWith(D,[qt,Oe,F]):L.rejectWith(D,[F,Oe,it]),F.statusCode(pe),pe=void 0,m&&N.trigger(Qe?"ajaxSuccess":"ajaxError",[F,g,Qe?qt:it]),X.fireWith(D,[F,Oe]),m&&(N.trigger("ajaxComplete",[F,g]),--i.active||i.event.trigger("ajaxStop")))}return F},getJSON:function(e,t,n){return i.get(e,t,n,"json")},getScript:function(e,t){return i.get(e,void 0,t,"script")}}),i.each(["get","post"],function(e,t){i[t]=function(n,o,a,r){return $(o)&&(r=r||a,a=o,o=void 0),i.ajax(i.extend({url:n,type:t,dataType:r,data:o,success:a},i.isPlainObject(n)&&n))}}),i.ajaxPrefilter(function(e){var t;for(t in e.headers)t.toLowerCase()==="content-type"&&(e.contentType=e.headers[t]||"")}),i._evalUrl=function(e,t,n){return i.ajax({url:e,type:"GET",dataType:"script",cache:!0,async:!1,global:!1,converters:{"text script":function(){}},dataFilter:function(o){i.globalEval(o,t,n)}})},i.fn.extend({wrapAll:function(e){var t;return this[0]&&($(e)&&(e=e.call(this[0])),t=i(e,this[0].ownerDocument).eq(0).clone(!0),this[0].parentNode&&t.insertBefore(this[0]),t.map(function(){for(var n=this;n.firstElementChild;)n=n.firstElementChild;return n}).append(this)),this},wrapInner:function(e){return $(e)?this.each(function(t){i(this).wrapInner(e.call(this,t))}):this.each(function(){var t=i(this),n=t.contents();n.length?n.wrapAll(e):t.append(e)})},wrap:function(e){var t=$(e);return this.each(function(n){i(this).wrapAll(t?e.call(this,n):e)})},unwrap:function(e){return this.parent(e).not("body").each(function(){i(this).replaceWith(this.childNodes)}),this}}),i.expr.pseudos.hidden=function(e){return!i.expr.pseudos.visible(e)},i.expr.pseudos.visible=function(e){return!!(e.offsetWidth||e.offsetHeight||e.getClientRects().length)},i.ajaxSettings.xhr=function(){try{return new B.XMLHttpRequest}catch{}};var jo={0:200,1223:204},Et=i.ajaxSettings.xhr();K.cors=!!Et&&"withCredentials"in Et,K.ajax=Et=!!Et,i.ajaxTransport(function(e){var t,n;if(K.cors||Et&&!e.crossDomain)return{send:function(o,a){var r,l=e.xhr();if(l.open(e.type,e.url,e.async,e.username,e.password),e.xhrFields)for(r in e.xhrFields)l[r]=e.xhrFields[r];for(r in e.mimeType&&l.overrideMimeType&&l.overrideMimeType(e.mimeType),e.crossDomain||o["X-Requested-With"]||(o["X-Requested-With"]="XMLHttpRequest"),o)l.setRequestHeader(r,o[r]);t=function(p){return function(){t&&(t=n=l.onload=l.onerror=l.onabort=l.ontimeout=l.onreadystatechange=null,p==="abort"?l.abort():p==="error"?typeof l.status!="number"?a(0,"error"):a(l.status,l.statusText):a(jo[l.status]||l.status,l.statusText,(l.responseType||"text")!=="text"||typeof l.responseText!="string"?{binary:l.response}:{text:l.responseText},l.getAllResponseHeaders()))}},l.onload=t(),n=l.onerror=l.ontimeout=t("error"),l.onabort!==void 0?l.onabort=n:l.onreadystatechange=function(){l.readyState===4&&B.setTimeout(function(){t&&n()})},t=t("abort");try{l.send(e.hasContent&&e.data||null)}catch(p){if(t)throw p}},abort:function(){t&&t()}}}),i.ajaxPrefilter(function(e){e.crossDomain&&(e.contents.script=!1)}),i.ajaxSetup({accepts:{script:"text/javascript, application/javascript, application/ecmascript, application/x-ecmascript"},contents:{script:/\b(?:java|ecma)script\b/},converters:{"text script":function(e){return i.globalEval(e),e}}}),i.ajaxPrefilter("script",function(e){e.cache===void 0&&(e.cache=!1),e.crossDomain&&(e.type="GET")}),i.ajaxTransport("script",function(e){var t,n;if(e.crossDomain||e.scriptAttrs)return{send:function(o,a){t=i("<script>").attr(e.scriptAttrs||{}).prop({charset:e.scriptCharset,src:e.url}).on("load error",n=function(r){t.remove(),n=null,r&&a(r.type==="error"?404:200,r.type)}),_.head.appendChild(t[0])},abort:function(){n&&n()}}});var vt,Kn=[],Pn=/(=)\?(?=&|$)|\?\?/;i.ajaxSetup({jsonp:"callback",jsonpCallback:function(){var e=Kn.pop()||i.expando+"_"+Do.guid++;return this[e]=!0,e}}),i.ajaxPrefilter("json jsonp",function(e,t,n){var o,a,r,l=e.jsonp!==!1&&(Pn.test(e.url)?"url":typeof e.data=="string"&&(e.contentType||"").indexOf("application/x-www-form-urlencoded")===0&&Pn.test(e.data)&&"data");if(l||e.dataTypes[0]==="jsonp")return o=e.jsonpCallback=$(e.jsonpCallback)?e.jsonpCallback():e.jsonpCallback,l?e[l]=e[l].replace(Pn,"$1"+o):e.jsonp!==!1&&(e.url+=(nn.test(e.url)?"&":"?")+e.jsonp+"="+o),e.converters["script json"]=function(){return r||i.error(o+" was not called"),r[0]},e.dataTypes[0]="json",a=B[o],B[o]=function(){r=arguments},n.always(function(){a===void 0?i(B).removeProp(o):B[o]=a,e[o]&&(e.jsonpCallback=t.jsonpCallback,Kn.push(o)),r&&$(a)&&a(r[0]),r=a=void 0}),"script"}),K.createHTMLDocument=((vt=_.implementation.createHTMLDocument("").body).innerHTML="<form></form><form></form>",vt.childNodes.length===2),i.parseHTML=function(e,t,n){return typeof e!="string"?[]:(typeof t=="boolean"&&(n=t,t=!1),t||(K.createHTMLDocument?((o=(t=_.implementation.createHTMLDocument("")).createElement("base")).href=_.location.href,t.head.appendChild(o)):t=_),r=!n&&[],(a=jn.exec(e))?[t.createElement(a[1])]:(a=no([e],t,r),r&&r.length&&i(r).remove(),i.merge([],a.childNodes)));var o,a,r},i.fn.load=function(e,t,n){var o,a,r,l=this,p=e.indexOf(" ");return-1<p&&(o=Ke(e.slice(p)),e=e.slice(0,p)),$(t)?(n=t,t=void 0):t&&typeof t=="object"&&(a="POST"),0<l.length&&i.ajax({url:e,type:a||"GET",dataType:"html",data:t}).done(function(f){r=arguments,l.html(o?i("<div>").append(i.parseHTML(f)).find(o):f)}).always(n&&function(f,m){l.each(function(){n.apply(this,r||[f.responseText,m,f])})}),this},i.expr.pseudos.animated=function(e){return i.grep(i.timers,function(t){return e===t.elem}).length},i.offset={setOffset:function(e,t,n){var o,a,r,l,p,f,m=i.css(e,"position"),v=i(e),w={};m==="static"&&(e.style.position="relative"),p=v.offset(),r=i.css(e,"top"),f=i.css(e,"left"),(m==="absolute"||m==="fixed")&&-1<(r+f).indexOf("auto")?(l=(o=v.position()).top,a=o.left):(l=parseFloat(r)||0,a=parseFloat(f)||0),$(t)&&(t=t.call(e,n,i.extend({},p))),t.top!=null&&(w.top=t.top-p.top+l),t.left!=null&&(w.left=t.left-p.left+a),"using"in t?t.using.call(e,w):v.css(w)}},i.fn.extend({offset:function(e){if(arguments.length)return e===void 0?this:this.each(function(a){i.offset.setOffset(this,e,a)});var t,n,o=this[0];return o?o.getClientRects().length?(t=o.getBoundingClientRect(),n=o.ownerDocument.defaultView,{top:t.top+n.pageYOffset,left:t.left+n.pageXOffset}):{top:0,left:0}:void 0},position:function(){if(this[0]){var e,t,n,o=this[0],a={top:0,left:0};if(i.css(o,"position")==="fixed")t=o.getBoundingClientRect();else{for(t=this.offset(),n=o.ownerDocument,e=o.offsetParent||n.documentElement;e&&(e===n.body||e===n.documentElement)&&i.css(e,"position")==="static";)e=e.parentNode;e&&e!==o&&e.nodeType===1&&((a=i(e).offset()).top+=i.css(e,"borderTopWidth",!0),a.left+=i.css(e,"borderLeftWidth",!0))}return{top:t.top-a.top-i.css(o,"marginTop",!0),left:t.left-a.left-i.css(o,"marginLeft",!0)}}},offsetParent:function(){return this.map(function(){for(var e=this.offsetParent;e&&i.css(e,"position")==="static";)e=e.offsetParent;return e||$e})}}),i.each({scrollLeft:"pageXOffset",scrollTop:"pageYOffset"},function(e,t){var n=t==="pageYOffset";i.fn[e]=function(o){return fe(this,function(a,r,l){var p;if(Ae(a)?p=a:a.nodeType===9&&(p=a.defaultView),l===void 0)return p?p[t]:a[r];p?p.scrollTo(n?p.pageXOffset:l,n?l:p.pageYOffset):a[r]=l},e,o,arguments.length)}}),i.each(["top","left"],function(e,t){i.cssHooks[t]=Nn(K.pixelPosition,function(n,o){if(o)return o=Gt(n,t),Bt.test(o)?i(n).position()[t]+"px":o})}),i.each({Height:"height",Width:"width"},function(e,t){i.each({padding:"inner"+e,content:t,"":"outer"+e},function(n,o){i.fn[o]=function(a,r){var l=arguments.length&&(n||typeof a!="boolean"),p=n||(a===!0||r===!0?"margin":"border");return fe(this,function(f,m,v){var w;return Ae(f)?o.indexOf("outer")===0?f["inner"+e]:f.document.documentElement["client"+e]:f.nodeType===9?(w=f.documentElement,Math.max(f.body["scroll"+e],w["scroll"+e],f.body["offset"+e],w["offset"+e],w["client"+e])):v===void 0?i.css(f,m,p):i.style(f,m,v,p)},t,l?a:void 0,l)}})}),i.each(["ajaxStart","ajaxStop","ajaxComplete","ajaxError","ajaxSuccess","ajaxSend"],function(e,t){i.fn[t]=function(n){return this.on(t,n)}}),i.fn.extend({bind:function(e,t,n){return this.on(e,null,t,n)},unbind:function(e,t){return this.off(e,null,t)},delegate:function(e,t,n,o){return this.on(t,e,n,o)},undelegate:function(e,t,n){return arguments.length===1?this.off(e,"**"):this.off(t,e||"**",n)},hover:function(e,t){return this.on("mouseenter",e).on("mouseleave",t||e)}}),i.each("blur focus focusin focusout resize scroll click dblclick mousedown mouseup mousemove mouseover mouseout mouseenter mouseleave change select submit keydown keypress keyup contextmenu".split(" "),function(e,t){i.fn[t]=function(n,o){return 0<arguments.length?this.on(t,null,n,o):this.trigger(t)}});var To=/^[\s\uFEFF\xA0]+|([^\s\uFEFF\xA0])[\s\uFEFF\xA0]+$/g;i.proxy=function(e,t){var n,o,a;if(typeof t=="string"&&(n=e[t],t=e,e=n),$(e))return o=W.call(arguments,2),(a=function(){return e.apply(t||this,o.concat(W.call(arguments)))}).guid=e.guid=e.guid||i.guid++,a},i.holdReady=function(e){e?i.readyWait++:i.ready(!0)},i.isArray=Array.isArray,i.parseJSON=JSON.parse,i.nodeName=ue,i.isFunction=$,i.isWindow=Ae,i.camelCase=ze,i.type=jt,i.now=Date.now,i.isNumeric=function(e){var t=i.type(e);return(t==="number"||t==="string")&&!isNaN(e-parseFloat(e))},i.trim=function(e){return e==null?"":(e+"").replace(To,"$1")},typeof define=="function"&&define.amd&&define("jquery",[],function(){return i});var Oo=B.jQuery,zo=B.$;return i.noConflict=function(e){return B.$===i&&(B.$=zo),e&&B.jQuery===i&&(B.jQuery=Oo),i},typeof De>"u"&&(B.jQuery=B.$=i),i})}function Hn(Ze,Le){if(typeof Ze>"u")throw new Error("jquery-confirm requires jQuery");var B,De;(function(E,V){E.fn.confirm=function(s,C){return typeof s>"u"&&(s={}),typeof s=="string"&&(s={content:s,title:C||!1}),E(this).each(function(){var I=E(this);if(I.attr("jc-attached")){console.warn("jConfirm has already been attached to this element ",I[0]);return}I.on("click",function(j){j.preventDefault();var S=E.extend({},s);if(I.attr("data-title")&&(S.title=I.attr("data-title")),I.attr("data-content")&&(S.content=I.attr("data-content")),typeof S.buttons>"u"&&(S.buttons={}),S.$target=I,I.attr("href")&&Object.keys(S.buttons).length==0){var R=E.extend(!0,{},B.pluginDefaults.defaultButtons,(B.defaults||{}).defaultButtons||{}),P=Object.keys(R)[0];S.buttons=R,S.buttons[P].action=function(){location.href=I.attr("href")}}S.closeIcon=!1;var ce=E.confirm(S)}),I.attr("jc-attached",!0)}),E(this)},E.confirm=function(s,C){if(typeof s>"u"&&(s={}),typeof s=="string"&&(s={content:s,title:C||!1}),typeof s.buttons!="object"&&(s.buttons={}),Object.keys(s.buttons).length==0){var I=E.extend(!0,{},B.pluginDefaults.defaultButtons,(B.defaults||{}).defaultButtons||{});s.buttons=I}return B(s)},E.alert=function(s,C){if(typeof s>"u"&&(s={}),typeof s=="string"&&(s={content:s,title:C||!1}),typeof s.buttons!="object"&&(s.buttons={}),Object.keys(s.buttons).length==0){var I=E.extend(!0,{},B.pluginDefaults.defaultButtons,(B.defaults||{}).defaultButtons||{}),j=Object.keys(I)[0];s.buttons[j]=I[j]}return B(s)},E.dialog=function(s,C){return typeof s>"u"&&(s={}),typeof s=="string"&&(s={content:s,title:C||!1,closeIcon:function(){}}),s.buttons={},typeof s.closeIcon>"u"&&(s.closeIcon=function(){}),s.confirmKeys=[13],B(s)},B=function(s){typeof s>"u"&&(s={});var C=E.extend(!0,{},B.pluginDefaults);B.defaults&&(C=E.extend(!0,C,B.defaults)),C=E.extend(!0,{},C,s);var I=new De(C);return B.instances.push(I),I},De=function(s){E.extend(this,s),this._init()},De.prototype={_init:function(){var s=this;B.instances.length||(B.lastFocused=E("body").find(":focus")),this._id=Math.round(Math.random()*99999),this.contentParsed=E(document.createElement("div")),this.lazyOpen||setTimeout(function(){s.open()},0)},_buildHTML:function(){var s=this;this._parseAnimation(this.animation,"o"),this._parseAnimation(this.closeAnimation,"c"),this._parseBgDismissAnimation(this.backgroundDismissAnimation),this._parseColumnClass(this.columnClass),this._parseTheme(this.theme),this._parseType(this.type);var C=E(this.template);C.find(".jconfirm-box").addClass(this.animationParsed).addClass(this.backgroundDismissAnimationParsed).addClass(this.typeParsed),this.typeAnimated&&C.find(".jconfirm-box").addClass("jconfirm-type-animated"),this.useBootstrap?(C.find(".jc-bs3-row").addClass(this.bootstrapClasses.row),C.find(".jc-bs3-row").addClass("justify-content-md-center justify-content-sm-center justify-content-xs-center justify-content-lg-center"),C.find(".jconfirm-box-container").addClass(this.columnClassParsed),this.containerFluid?C.find(".jc-bs3-container").addClass(this.bootstrapClasses.containerFluid):C.find(".jc-bs3-container").addClass(this.bootstrapClasses.container)):C.find(".jconfirm-box").css("width",this.boxWidth),this.titleClass&&C.find(".jconfirm-title-c").addClass(this.titleClass),C.addClass(this.themeParsed);var I="jconfirm-box"+this._id;C.find(".jconfirm-box").attr("aria-labelledby",I).attr("tabindex",-1),C.find(".jconfirm-content").attr("id",I),this.bgOpacity!==null&&C.find(".jconfirm-bg").css("opacity",this.bgOpacity),this.rtl&&C.addClass("jconfirm-rtl"),this.$el=C.appendTo(this.container),this.$jconfirmBoxContainer=this.$el.find(".jconfirm-box-container"),this.$jconfirmBox=this.$body=this.$el.find(".jconfirm-box"),this.$jconfirmBg=this.$el.find(".jconfirm-bg"),this.$title=this.$el.find(".jconfirm-title"),this.$titleContainer=this.$el.find(".jconfirm-title-c"),this.$content=this.$el.find("div.jconfirm-content"),this.$contentPane=this.$el.find(".jconfirm-content-pane"),this.$icon=this.$el.find(".jconfirm-icon-c"),this.$closeIcon=this.$el.find(".jconfirm-closeIcon"),this.$holder=this.$el.find(".jconfirm-holder"),this.$btnc=this.$el.find(".jconfirm-buttons"),this.$scrollPane=this.$el.find(".jconfirm-scrollpane"),s.setStartingPoint(),this._contentReady=E.Deferred(),this._modalReady=E.Deferred(),this.$holder.css({"padding-top":this.offsetTop,"padding-bottom":this.offsetBottom}),this.setTitle(),this.setIcon(),this._setButtons(),this._parseContent(),this.initDraggable(),this.isAjax&&this.showLoading(!1),E.when(this._contentReady,this._modalReady).then(function(){s.isAjaxLoading?setTimeout(function(){s.isAjaxLoading=!1,s.setContent(),s.setTitle(),s.setIcon(),setTimeout(function(){s.hideLoading(!1),s._updateContentMaxHeight()},100),typeof s.onContentReady=="function"&&s.onContentReady()},50):(s._updateContentMaxHeight(),s.setTitle(),s.setIcon(),typeof s.onContentReady=="function"&&s.onContentReady()),s.autoClose&&s._startCountDown()}),this._watchContent(),this.animation==="none"&&(this.animationSpeed=1,this.animationBounce=1),this.$body.css(this._getCSS(this.animationSpeed,this.animationBounce)),this.$contentPane.css(this._getCSS(this.animationSpeed,1)),this.$jconfirmBg.css(this._getCSS(this.animationSpeed,1)),this.$jconfirmBoxContainer.css(this._getCSS(this.animationSpeed,1))},_typePrefix:"jconfirm-type-",typeParsed:"",_parseType:function(s){this.typeParsed=this._typePrefix+s},setType:function(s){var C=this.typeParsed;this._parseType(s),this.$jconfirmBox.removeClass(C).addClass(this.typeParsed)},themeParsed:"",_themePrefix:"jconfirm-",setTheme:function(s){var C=this.theme;this.theme=s||this.theme,this._parseTheme(this.theme),C&&this.$el.removeClass(C),this.$el.addClass(this.themeParsed),this.theme=s},_parseTheme:function(s){var C=this;s=s.split(","),E.each(s,function(I,j){j.indexOf(C._themePrefix)===-1&&(s[I]=C._themePrefix+E.trim(j))}),this.themeParsed=s.join(" ").toLowerCase()},backgroundDismissAnimationParsed:"",_bgDismissPrefix:"jconfirm-hilight-",_parseBgDismissAnimation:function(s){var C=s.split(","),I=this;E.each(C,function(j,S){S.indexOf(I._bgDismissPrefix)===-1&&(C[j]=I._bgDismissPrefix+E.trim(S))}),this.backgroundDismissAnimationParsed=C.join(" ").toLowerCase()},animationParsed:"",closeAnimationParsed:"",_animationPrefix:"jconfirm-animation-",setAnimation:function(s){this.animation=s||this.animation,this._parseAnimation(this.animation,"o")},_parseAnimation:function(s,C){C=C||"o";var I=s.split(","),j=this;E.each(I,function(R,P){P.indexOf(j._animationPrefix)===-1&&(I[R]=j._animationPrefix+E.trim(P))});var S=I.join(" ").toLowerCase();return C==="o"?this.animationParsed=S:this.closeAnimationParsed=S,S},setCloseAnimation:function(s){this.closeAnimation=s||this.closeAnimation,this._parseAnimation(this.closeAnimation,"c")},setAnimationSpeed:function(s){this.animationSpeed=s||this.animationSpeed},columnClassParsed:"",setColumnClass:function(s){if(!this.useBootstrap){console.warn("cannot set columnClass, useBootstrap is set to false");return}this.columnClass=s||this.columnClass,this._parseColumnClass(this.columnClass),this.$jconfirmBoxContainer.addClass(this.columnClassParsed)},_updateContentMaxHeight:function(){var s=E(V).height()-(this.$jconfirmBox.outerHeight()-this.$contentPane.outerHeight())-(this.offsetTop+this.offsetBottom);this.$contentPane.css({"max-height":s+"px"})},setBoxWidth:function(s){if(this.useBootstrap){console.warn("cannot set boxWidth, useBootstrap is set to true");return}this.boxWidth=s,this.$jconfirmBox.css("width",s)},_parseColumnClass:function(s){s=s.toLowerCase();var C;switch(s){case"xl":case"xlarge":C="col-md-12";break;case"l":case"large":C="col-md-8 col-md-offset-2";break;case"m":case"medium":C="col-md-6 col-md-offset-3";break;case"s":case"small":C="col-md-4 col-md-offset-4";break;case"xs":case"xsmall":C="col-md-2 col-md-offset-5";break;default:C=s}this.columnClassParsed=C},initDraggable:function(){var s=this,C=this.$titleContainer;this.resetDrag(),this.draggable&&(C.on("mousedown",function(I){C.addClass("jconfirm-hand"),s.mouseX=I.clientX,s.mouseY=I.clientY,s.isDrag=!0}),E(V).on("mousemove."+this._id,function(I){s.isDrag&&(s.movingX=I.clientX-s.mouseX+s.initialX,s.movingY=I.clientY-s.mouseY+s.initialY,s.setDrag())}),E(V).on("mouseup."+this._id,function(){C.removeClass("jconfirm-hand"),s.isDrag&&(s.isDrag=!1,s.initialX=s.movingX,s.initialY=s.movingY)}))},resetDrag:function(){this.isDrag=!1,this.initialX=0,this.initialY=0,this.movingX=0,this.movingY=0,this.mouseX=0,this.mouseY=0,this.$jconfirmBoxContainer.css("transform","translate(0px, 0px)")},setDrag:function(){if(this.draggable){this.alignMiddle=!1;var s=this.$jconfirmBox.outerWidth(),C=this.$jconfirmBox.outerHeight(),I=E(V).width(),j=E(V).height(),S=this,R=1;if(S.movingX%R===0||S.movingY%R===0){if(S.dragWindowBorder){var P=I/2-s/2,ce=j/2-C/2;ce-=S.dragWindowGap,P-=S.dragWindowGap,P+S.movingX<0?S.movingX=-P:P-S.movingX<0&&(S.movingX=P),ce+S.movingY<0?S.movingY=-ce:ce-S.movingY<0&&(S.movingY=ce)}S.$jconfirmBoxContainer.css("transform","translate("+S.movingX+"px, "+S.movingY+"px)")}}},_scrollTop:function(){if(typeof pageYOffset<"u")return pageYOffset;var s=document.body,C=document.documentElement;return C=C.clientHeight?C:s,C.scrollTop},_watchContent:function(){var s=this;this._timer&&clearInterval(this._timer);var C=0;this._timer=setInterval(function(){if(s.smoothContent){var I=s.$content.outerHeight()||0;I!==C&&(s.$contentPane.css({height:I}).scrollTop(0),C=I);var j=E(V).height(),S=s.offsetTop+s.offsetBottom+s.$jconfirmBox.height()-s.$contentPane.height()+s.$content.height();S<j?s.$contentPane.addClass("no-scroll"):s.$contentPane.removeClass("no-scroll")}},this.watchInterval)},_overflowClass:"jconfirm-overflow",_hilightAnimating:!1,highlight:function(){this.hiLightModal()},hiLightModal:function(){var s=this;if(!this._hilightAnimating){s.$body.addClass("hilight");var C=parseFloat(s.$body.css("animation-duration"))||2;this._hilightAnimating=!0,setTimeout(function(){s._hilightAnimating=!1,s.$body.removeClass("hilight")},C*1e3)}},_bindEvents:function(){var s=this;this.boxClicked=!1,this.$scrollPane.click(function(I){if(!s.boxClicked){var j=!1,S=!1,R;if(typeof s.backgroundDismiss=="function"?R=s.backgroundDismiss():R=s.backgroundDismiss,typeof R=="string"&&typeof s.buttons[R]<"u"?(j=R,S=!1):typeof R>"u"||R?S=!0:S=!1,j){var P=s.buttons[j].action.apply(s);S=typeof P>"u"||!!P}S?s.close():s.hiLightModal()}s.boxClicked=!1}),this.$jconfirmBox.click(function(I){s.boxClicked=!0});var C=!1;E(V).on("jcKeyDown."+s._id,function(I){C||(C=!0)}),E(V).on("keyup."+s._id,function(I){C&&(s.reactOnKey(I),C=!1)}),E(V).on("resize."+this._id,function(){s._updateContentMaxHeight(),setTimeout(function(){s.resetDrag()},100)})},_cubic_bezier:"0.36, 0.55, 0.19",_getCSS:function(s,C){return{"-webkit-transition-duration":s/1e3+"s","transition-duration":s/1e3+"s","-webkit-transition-timing-function":"cubic-bezier("+this._cubic_bezier+", "+C+")","transition-timing-function":"cubic-bezier("+this._cubic_bezier+", "+C+")"}},_setButtons:function(){var s=this,C=0;if(typeof this.buttons!="object"&&(this.buttons={}),E.each(this.buttons,function(j,S){C+=1,typeof S=="function"&&(s.buttons[j]=S={action:S}),s.buttons[j].text=S.text||j,s.buttons[j].btnClass=S.btnClass||"btn-default",s.buttons[j].action=S.action||function(){},s.buttons[j].keys=S.keys||[],s.buttons[j].isHidden=S.isHidden||!1,s.buttons[j].isDisabled=S.isDisabled||!1,E.each(s.buttons[j].keys,function(P,ce){s.buttons[j].keys[P]=ce.toLowerCase()});var R=E('<button type="button" class="btn"></button>').html(s.buttons[j].text).addClass(s.buttons[j].btnClass).prop("disabled",s.buttons[j].isDisabled).css("display",s.buttons[j].isHidden?"none":"").click(function(P){P.preventDefault();var ce=s.buttons[j].action.apply(s,[s.buttons[j]]);s.onAction.apply(s,[j,s.buttons[j]]),s._stopCountDown(),(typeof ce>"u"||ce)&&s.close()});s.buttons[j].el=R,s.buttons[j].setText=function(P){R.html(P)},s.buttons[j].addClass=function(P){R.addClass(P)},s.buttons[j].removeClass=function(P){R.removeClass(P)},s.buttons[j].disable=function(){s.buttons[j].isDisabled=!0,R.prop("disabled",!0)},s.buttons[j].enable=function(){s.buttons[j].isDisabled=!1,R.prop("disabled",!1)},s.buttons[j].show=function(){s.buttons[j].isHidden=!1,R.css("display","")},s.buttons[j].hide=function(){s.buttons[j].isHidden=!0,R.css("display","none")},s["$_"+j]=s["$$"+j]=R,s.$btnc.append(R)}),C===0&&this.$btnc.hide(),this.closeIcon===null&&C===0&&(this.closeIcon=!0),this.closeIcon){if(this.closeIconClass){var I='<i class="'+this.closeIconClass+'"></i>';this.$closeIcon.html(I)}this.$closeIcon.click(function(j){j.preventDefault();var S=!1,R=!1,P;if(typeof s.closeIcon=="function"?P=s.closeIcon():P=s.closeIcon,typeof P=="string"&&typeof s.buttons[P]<"u"?(S=P,R=!1):typeof P>"u"||P?R=!0:R=!1,S){var ce=s.buttons[S].action.apply(s);R=typeof ce>"u"||!!ce}R&&s.close()}),this.$closeIcon.show()}else this.$closeIcon.hide()},setTitle:function(s,C){if(C=C||!1,typeof s<"u")if(typeof s=="string")this.title=s;else if(typeof s=="function"){typeof s.promise=="function"&&console.error("Promise was returned from title function, this is not supported.");var I=s();typeof I=="string"?this.title=I:this.title=!1}else this.title=!1;this.isAjaxLoading&&!C||(this.$title.html(this.title||""),this.updateTitleContainer())},setIcon:function(s,C){if(C=C||!1,typeof s<"u")if(typeof s=="string")this.icon=s;else if(typeof s=="function"){var I=s();typeof I=="string"?this.icon=I:this.icon=!1}else this.icon=!1;this.isAjaxLoading&&!C||(this.$icon.html(this.icon?'<i class="'+this.icon+'"></i>':""),this.updateTitleContainer())},updateTitleContainer:function(){!this.title&&!this.icon?this.$titleContainer.hide():this.$titleContainer.show()},setContentPrepend:function(s,C){s&&this.contentParsed.prepend(s)},setContentAppend:function(s){s&&this.contentParsed.append(s)},setContent:function(s,C){C=!!C;var I=this;s&&this.contentParsed.html("").append(s),!(this.isAjaxLoading&&!C)&&(this.$content.html(""),this.$content.append(this.contentParsed),setTimeout(function(){I.$body.find("input[autofocus]:visible:first").focus()},100))},loadingSpinner:!1,showLoading:function(s){this.loadingSpinner=!0,this.$jconfirmBox.addClass("loading"),s&&this.$btnc.find("button").prop("disabled",!0)},hideLoading:function(s){this.loadingSpinner=!1,this.$jconfirmBox.removeClass("loading"),s&&this.$btnc.find("button").prop("disabled",!1)},ajaxResponse:!1,contentParsed:"",isAjax:!1,isAjaxLoading:!1,_parseContent:function(){var s=this,C="&nbsp;";if(typeof this.content=="function"){var I=this.content.apply(this);typeof I=="string"?this.content=I:typeof I=="object"&&typeof I.always=="function"?(this.isAjax=!0,this.isAjaxLoading=!0,I.always(function(S,R,P){s.ajaxResponse={data:S,status:R,xhr:P},s._contentReady.resolve(S,R,P),typeof s.contentLoaded=="function"&&s.contentLoaded(S,R,P)}),this.content=C):this.content=C}if(typeof this.content=="string"&&this.content.substr(0,4).toLowerCase()==="url:"){this.isAjax=!0,this.isAjaxLoading=!0;var j=this.content.substring(4,this.content.length);E.get(j).done(function(S){s.contentParsed.html(S)}).always(function(S,R,P){s.ajaxResponse={data:S,status:R,xhr:P},s._contentReady.resolve(S,R,P),typeof s.contentLoaded=="function"&&s.contentLoaded(S,R,P)})}this.content||(this.content=C),this.isAjax||(this.contentParsed.html(this.content),this.setContent(),s._contentReady.resolve())},_stopCountDown:function(){clearInterval(this.autoCloseInterval),this.$cd&&this.$cd.remove()},_startCountDown:function(){var s=this,C=this.autoClose.split("|");if(C.length!==2)return console.error("Invalid option for autoClose. example 'close|10000'"),!1;var I=C[0],j=parseInt(C[1]);if(typeof this.buttons[I]>"u")return console.error("Invalid button key '"+I+"' for autoClose"),!1;var S=Math.ceil(j/1e3);this.$cd=E('<span class="countdown"> ('+S+")</span>").appendTo(this["$_"+I]),this.autoCloseInterval=setInterval(function(){s.$cd.html(" ("+(S-=1)+") "),S<=0&&(s["$$"+I].trigger("click"),s._stopCountDown())},1e3)},_getKey:function(s){switch(s){case 192:return"tilde";case 13:return"enter";case 16:return"shift";case 9:return"tab";case 20:return"capslock";case 17:return"ctrl";case 91:return"win";case 18:return"alt";case 27:return"esc";case 32:return"space"}var C=String.fromCharCode(s);return/^[A-z0-9]+$/.test(C)?C.toLowerCase():!1},reactOnKey:function(s){var C=this,I=E(".jconfirm");if(I.eq(I.length-1)[0]!==this.$el[0])return!1;var j=s.which;if(this.$content.find(":input").is(":focus")&&/13|32/.test(j))return!1;var S=this._getKey(j);if(S==="esc"&&this.escapeKey){if(this.escapeKey===!0)this.$scrollPane.trigger("click");else if(typeof this.escapeKey=="string"||typeof this.escapeKey=="function"){var R;typeof this.escapeKey=="function"?R=this.escapeKey():R=this.escapeKey,R&&(typeof this.buttons[R]>"u"?console.warn("Invalid escapeKey, no buttons found with key "+R):this["$_"+R].trigger("click"))}}E.each(this.buttons,function(P,ce){ce.keys.indexOf(S)!=-1&&C["$_"+P].trigger("click")})},setDialogCenter:function(){console.info("setDialogCenter is deprecated, dialogs are centered with CSS3 tables")},_unwatchContent:function(){clearInterval(this._timer)},close:function(){var s=this;return typeof this.onClose=="function"&&this.onClose(),this._unwatchContent(),E(V).unbind("resize."+this._id),E(V).unbind("keyup."+this._id),E(V).unbind("jcKeyDown."+this._id),this.draggable&&(E(V).unbind("mousemove."+this._id),E(V).unbind("mouseup."+this._id),this.$titleContainer.unbind("mousedown")),s.$el.removeClass(s.loadedClass),E("body").removeClass("jconfirm-no-scroll-"+s._id),s.$jconfirmBoxContainer.removeClass("jconfirm-no-transition"),setTimeout(function(){s.$body.addClass(s.closeAnimationParsed),s.$jconfirmBg.addClass("jconfirm-bg-h");var C=s.closeAnimation==="none"?1:s.animationSpeed;setTimeout(function(){s.$el.remove();var I=B.instances,j=B.instances.length-1;for(j;j>=0;j--)B.instances[j]._id===s._id&&B.instances.splice(j,1);if(!B.instances.length&&s.scrollToPreviousElement&&B.lastFocused&&B.lastFocused.length&&E.contains(document,B.lastFocused[0])){var S=B.lastFocused;if(s.scrollToPreviousElementAnimate){var R=E(V).scrollTop(),P=B.lastFocused.offset().top,ce=E(V).height();if(P>R&&P<R+ce)S.focus();else{var K=P-Math.round(ce/3);E("html, body").animate({scrollTop:K},s.animationSpeed,"swing",function(){S.focus()})}}else S.focus();B.lastFocused=!1}typeof s.onDestroy=="function"&&s.onDestroy()},C*.4)},50),!0},open:function(){return this.isOpen()?!1:(this._buildHTML(),this._bindEvents(),this._open(),!0)},setStartingPoint:function(){var s=!1;if(this.animateFromElement!==!0&&this.animateFromElement)s=this.animateFromElement,B.lastClicked=!1;else if(B.lastClicked&&this.animateFromElement===!0)s=B.lastClicked,B.lastClicked=!1;else return!1;if(!s)return!1;var C=s.offset(),I=s.outerHeight()/2,j=s.outerWidth()/2;I-=this.$jconfirmBox.outerHeight()/2,j-=this.$jconfirmBox.outerWidth()/2;var S=C.top+I;S=S-this._scrollTop();var R=C.left+j,P=E(V).height()/2,ce=E(V).width()/2,K=P-this.$jconfirmBox.outerHeight()/2,$=ce-this.$jconfirmBox.outerWidth()/2;if(S-=K,R-=$,Math.abs(S)>P||Math.abs(R)>ce)return!1;this.$jconfirmBoxContainer.css("transform","translate("+R+"px, "+S+"px)")},_open:function(){var s=this;typeof s.onOpenBefore=="function"&&s.onOpenBefore(),this.$body.removeClass(this.animationParsed),this.$jconfirmBg.removeClass("jconfirm-bg-h"),this.$body.focus(),s.$jconfirmBoxContainer.css("transform","translate(0px, 0px)"),setTimeout(function(){s.$body.css(s._getCSS(s.animationSpeed,1)),s.$body.css({"transition-property":s.$body.css("transition-property")+", margin"}),s.$jconfirmBoxContainer.addClass("jconfirm-no-transition"),s._modalReady.resolve(),typeof s.onOpen=="function"&&s.onOpen(),s.$el.addClass(s.loadedClass)},this.animationSpeed)},loadedClass:"jconfirm-open",isClosed:function(){return!this.$el||this.$el.css("display")===""},isOpen:function(){return!this.isClosed()},toggle:function(){this.isOpen()?this.close():this.open()}},B.instances=[],B.lastFocused=!1,B.pluginDefaults={template:'<div class="jconfirm"><div class="jconfirm-bg jconfirm-bg-h"></div><div class="jconfirm-scrollpane"><div class="jconfirm-row"><div class="jconfirm-cell"><div class="jconfirm-holder"><div class="jc-bs3-container"><div class="jc-bs3-row"><div class="jconfirm-box-container jconfirm-animated"><div class="jconfirm-box" role="dialog" aria-labelledby="labelled" tabindex="-1"><div class="jconfirm-closeIcon">&times;</div><div class="jconfirm-title-c"><span class="jconfirm-icon-c"></span><span class="jconfirm-title"></span></div><div class="jconfirm-content-pane"><div class="jconfirm-content"></div></div><div class="jconfirm-buttons"></div><div class="jconfirm-clear"></div></div></div></div></div></div></div></div></div></div>',title:"Hello",titleClass:"",type:"default",typeAnimated:!0,draggable:!0,dragWindowGap:15,dragWindowBorder:!0,animateFromElement:!0,alignMiddle:!0,smoothContent:!0,content:"Are you sure to continue?",buttons:{},defaultButtons:{ok:{action:function(){}},close:{action:function(){}}},contentLoaded:function(){},icon:"",lazyOpen:!1,bgOpacity:null,theme:"light",animation:"scale",closeAnimation:"scale",animationSpeed:400,animationBounce:1,escapeKey:!0,rtl:!1,container:"body",containerFluid:!1,backgroundDismiss:!1,backgroundDismissAnimation:"shake",autoClose:!1,closeIcon:null,closeIconClass:!1,watchInterval:100,columnClass:"col-md-4 col-md-offset-4 col-sm-6 col-sm-offset-3 col-xs-10 col-xs-offset-1",boxWidth:"50%",scrollToPreviousElement:!0,scrollToPreviousElementAnimate:!0,useBootstrap:!0,offsetTop:40,offsetBottom:40,bootstrapClasses:{container:"container",containerFluid:"container-fluid",row:"row"},onContentReady:function(){},onOpenBefore:function(){},onOpen:function(){},onClose:function(){},onDestroy:function(){},onAction:function(){}};var W=!1;E(V).on("keydown",function(s){if(!W){var C=E(s.target),I=!1;C.closest(".jconfirm-box").length&&(I=!0),I&&E(V).trigger("jcKeyDown"),W=!0}}),E(V).on("keyup",function(){W=!1}),B.lastClicked=!1,E(document).on("mousedown","button, a",function(){B.lastClicked=E(this)})})(Ze,Le)}var Qt=null;return function(Ze){if(Qt)return Qt;var Le={exports:{}};return fo.call(Ze,Ze,Le),Hn.call(Ze,Le.exports,Ze),Qt=Le.exports}})();(function(){"use strict";function fo(B,De){B.register({id:"moomod",name:"MooMod",version:"1.0.0",description:"Nuro's MooMod, ported 1:1. - opens the MooMod menu, ESC the hat menu, F2 auto placement.",menu:!0,menuHint:"MooMod has its own menus: press - (minus) for the MooMod menu, ESC for the hat menu and F2 for auto placement.",liveSettings:!0,defaultEnabled:!0},function(E){const V=typeof unsafeWindow<"u"?unsafeWindow:window,W=V.document;if(!W||!W.createElement)return;let s=null;const C=new Set,I=new Set;let j=!0;function S(u,d){const b=V.setTimeout(function(){C.delete(b),j&&u()},d);return C.add(b),b}function R(u){C.delete(u),V.clearTimeout(u)}function P(u,d){const b=V.setInterval(function(){j&&u()},d);return I.add(b),b}function ce(u){I.delete(u),V.clearInterval(u)}function K(u,d,b,x){u.addEventListener(d,b,x),E.onCleanup(function(){u.removeEventListener(d,b,x)})}const $=[];function Ae(u){return $.push(u),u}const _=[];function dn(u){_.push(u)}E.onCleanup(function(){j=!1;for(const d of C)V.clearTimeout(d);for(const d of I)V.clearInterval(d);C.clear(),I.clear();const u=d=>{s&&s(d).stop(!0),d.remove()};if(s)try{s(W).off(".moomod"),s("#mapDisplay").off(".moomod")}catch{}for(const d of $)try{u(d)}catch{}for(const d of["#infoDiv",".spotDiv",".mapTarget","#botText"])try{for(const b of Array.from(W.querySelectorAll(d)))u(b)}catch{}for(let d=_.length-1;d>=0;d--)try{_[d]()}catch{}});const Qn=`
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
`,jt=`
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

`,Fn=`

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

`,ho=`<h1 id="autotitle">You are currently in CloudyMod auto-pilot.</h1>
     <h3 id="arrivalest">You will arrive in <span id="timeest">30 seconds...</span></h3>

     <button type="button" id="cancelTrip">Cancel</button>`,i=`
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
    cursor: url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAYAAADgdz34AAAFqElEQVRIS61WCVATZxT+NiQBAgoeiAINETlaEJlKp1qlorVKAS9MdcaKoAJeMEW8Ci0V2zrGKaNjvQtjRVTaKVKookirU4VR6VRaRcGoKBCOMUAm4Qgs5Ni+jaKCtkOPnfmz++++/b73vndsGAw43N3dw11dXbNFItHQmpqaXWKxOK26urpnoN1g98zzhp6enkM5jsvMyspa7O3tjYSEBENZWdmU+vr664MFHGjXj8DDw0Pq6Oh4IS8vz0smkyE7OxsKhaJSqVSO/18I3NzcXO3s7M4WFhYGUDQwmUwICQmBTqcTl5eXG/4NSb8InJ2d7Uii/SUlJct9fHwseMHBwaitrZ2lUqku/GcCAmBImm3FxcVb+RzwR3x8PIqKin5mGEZjNpv9BQJB3sOHD9MoQmuDwTBRKBQ+oKP5r8j7RcAbUR5SYmNjt6ekpAj4/bWr1xAVHYWFEXLIFyxEYlIi1C3qNqmbVNKj7xGxvSw62c5FVGn5JLFDQ0NDG71m6iN8gWDs2LFvCoSCgvvK6jEwAt1sN2bOfgcZezLh5z4e9x7cxfRFwbiUcxleDj64WXUDa3et5pp1zemsgfUTi8S3VbWq5H4EJEsISRBJay+F/zv1QkXNvRpfTs+AsQLemB6IIzu+wQRZAO7eV+LdtTNxMf0SvJy8ADOHsM/fQ3tHBzKWHsXK7GVo6WyeUldXd40nYUjruFFOozJ8X/XFrcpbUDerD1Kig9I/S58QMU0OUO2Ex4RCsW4n/KUBUDWokHxoC9KjdmO0vQsYDlh7NA7Rk2IwceRkyI+F4Y66chUVRaaFYOqUqVxWxjF4uIyDVqPFxk+SUPpbaZ2/l7/7D18WgOslIyIxd5M19TO/tyy6NvNnesaZzDD2CKisgWW583BbffMZQdDUIO74gZOQDpNaALRaLeYlzIHISmSRget6DAYCswDywDwoXZsoR2ZaRv5spjOtFflzoWypeEYglUq3REZEKj6N3ioQG60tAHWtNVAcVeBgzNfgWAZG1oRHukYMFzpbwBu0KjjbusNs4tDS1QwHaxeYGQGvJpbnzkBTW+1SykFOXw5G6vX6nMT3189KCtv02FveS3KHYwUWCVrbNIjPi8HWGTvJUwGWfB+O4/LzMBCbojQZ22ZnQiIZjl4BhzUnp6GlvdGPclBlIeB/qDSdRULRlYKNZ8Z52Hlbwufl4L3lZWjt0GD9uVgkBylghgArSYbDEYWkmhG7S1OwOfQwrO2GwWzDIJWSfLX8orCvF572AZVmqJvjK+dOrSiEBA4WbfmkGWlpujTYXByLpLd3UAcJkFAwF+mLzlgIDl3+GGvmH4RwyDDcayrDd6e3tFbcLnd6aaP5ePpkxk/eELtkfBwBk/ZUgkaOQyurQepPsVgznQjIpeS8BUj9oICUNOL4xVQsWbwfJhsRzp5Og7KyiPRvsOj/VKK+DY0JryGiIZczF+aPGSGRkYccDKRrS48GivOrsGzmFzBS4ym+lSM+5pSFIL8oDWHRe9DaXovijMSsNm1rglqt1v/dqIjp6OnYlxNVZuvgKAVLBHqGxbkbR/CaXyg4G2tcKj+B14Mj0WHsQGVVMWRBc/DjplmNjJVwLlXPH88Pvhdm0ZOBt05sZfvVuvn7hG6ySegWmmlxYEVmdIlpWfWCtQH0YppVtC9P/xDaO9f30lhPHDhVX0rAG1HSw+xsHXMj405IJM5u6CJwHqzL2oz7V3JR+0se/A7lotOkhzJWDqNWE0Df8IpBEwQGBooeNdXvDF99eIN4tCt5z6FbZEJ7eyMqFIm/MiJrnZXTqJAR2xXQfLQRJp3uLYqgbNAEZCikKRtD3SBnaH6DoWBpHph62SYrsU0meVsqk0oV6O31ZWxsWHp+gO6V/BMCuLi4SOzt7SXPv0RfMLaqqqrzyT0rGjVD6a+NiT447QPB+f2fdSGSNwBPXhkAAAAASUVORK5CYII=") 6 0, auto !important;
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
    cursor: url("data:image/png;base64,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") 6 0, auto !important;
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
`,Wn=`
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
    <div class="i-close"></div>`,ue="url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAIIAAACCCAYAAACKAxD9AAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAAEnQAABJ0Ad5mH3gAAAFCSURBVHhe7dxBDcMwFAVBuzB7CIoSKIKwSFmEWhutyyIzkhUCq3eK/jyO8zu4vcf/y80JgQiBCIEIgQiBCIEIgQiBCIEIgQiBCIEIgQiBCIEIgQiBCIEIgQiBzOv5ixmLwCIEIgQiBCIEIgQiBCIEIgQiBCIEIgQiBCIEIgQiBCIEIgQiBCIEIgQiBCIEIgQiBCIEIgQiBCIEIgQiBCIEIgQiBCIEIgQiBDK318dVNSwCixCIEIgQiBCIEIgQiOvsxCIQIRAhECEQIRAhECEQIRAhECEQIRAhECEQIRAhECEQIRAhECEQIRAhECEQIRAhECEQIRAhECEQIRAhECEQIRAhECEQIRAhECEQIRAhkLm/n+4sYhFYhECEQIRAhECEQIRAhECEQIRAhECEQIRAhECEQIRAhECEQIRAhECEwGWMH9UwCujTcs1kAAAAAElFTkSuQmCC) no-repeat center center",mo="0 1px 0 rgba(231, 76, 60), 0 2px 0 rgba(231, 76, 60), 0 3px 0 rgba(231, 76, 60), 0 4px 0 rgba(231, 76, 60), 0 5px 0 rgba(231, 76, 60), 0 6px 0 rgba(231, 76, 60), 0 7px 0 rgba(231, 76, 60), 0 8px 0 rgba(231, 76, 60), 0 9px 0 rgba(255, 0, 0)",go="0 1px 0 rgba(255, 255, 255, 0), 0 2px 0 rgba(255, 255, 255, 0), 0 3px 0 rgba(255, 255, 255, 0), 0 4px 0 rgba(255, 255, 255, 0), 0 5px 0 rgba(255, 255, 255, 0), 0 6px 0 rgba(255, 255, 255, 0), 0 7px 0 rgba(255, 255, 255, 0), 0 8px 0 rgba(255, 255, 255, 0), 0 9px 0 rgba(255, 255, 255, 0)",vo=`<div id="youtuberOf">
                           \xB4
		<div class="spanLink" id="featuredYoutube"><a target="_blank" class="ytLink" href="https://www.youtube.com/channel/UCxNHxsTut7atZCUNSJCHx4A?sub_confirmation=1"><i class="material-icons" style="vertical-align: top;">\uE064</i>Nuro.</a></div>
	</div>
Featured Hacker:`,le=`<div id="youtuberOf">
                           \xB4
		<div class="spanLink" id="featuredYoutube"><a target="_blank" class="ytLink" href="https://www.youtube.com/channel/UCrZVnif0yPniQfdwvdMgf_Q?sub_confirmation=1"><i class="material-icons" style="vertical-align: top;">\uE064</i>jabiddle</a></div>
	</div>
Featured Hacker:`,Tt=[`
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
`],yo=`
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

`;function bo(u,d){return'<div id="flextop"><img id="hatimgmain" src="/img/hats/hat_'+d+`.png">
			<h1 id="changeAlert">Biome Hat Changed!</h1></div>
			<h3 id="typealert">Your hat was automatically changed to the <span id="hatname">`+u+`</span></h3>

			<div id="flexlow">
			<button id="sback">Switch Back!</button> <button id="okbtn">OK</button>
			</div>`}const Ue=u=>typeof u=="number"&&!isNaN(u)&&isFinite(u),En=function(){};let Ve=-1;function Mn(u,d){d?Ve=-1:Ve=Ve===u?-1:u}function Zn(u){const d=u[0],b=u[1]||[];switch(d){case"2":return Ue(b[0])?B.send.aim(b[0]):!1;case"33":return b[0]==null?B.send.move(null):Ue(b[0])?B.send.move(b[0]):!1;case"c":return B.send.mouse(!!b[0],Ue(b[1])?b[1]:null);case"5":return Number.isInteger(b[0])?(Mn(b[0],!!b[1]),B.send.selectItem(b[0],!!b[1])):!1;case"13c":return!Number.isInteger(b[1])||b[0]!==0&&b[0]!==1?!1:B.send.store(b[0]===0?1:0,b[1],!!b[2]);case"ch":return typeof b[0]=="string"?B.send.chat(b[0]):!1;case"7":return B.send.toggle(b[0]?1:0);case"8":return typeof b[0]=="string"?B.send.createTribe(b[0]):!1;case"9":return B.send.leaveTribe();case"10":return typeof b[0]=="string"?B.send.joinTribe(b[0]):!1;default:return!1}}const jn=u=>{const d=De&&De._deps&&De._deps.Binding;return d&&d.outgoing&&d.outgoing[u]?d.outgoing[u].wire:null};function fn(u,d){const b=E.net;if(!b||!b.tokens)return!0;const x=jn("selectItem"),M=jn("mouse");return x&&b.tokens(x)<u||M&&b.tokens(M)<d?!1:!b.wouldAllow||!M||b.wouldAllow(M)}let hn=null;function Ft(u){Zn(u)}function H(u){if(!hn)throw new TypeError("Cannot read properties of undefined (reading 'send')");Tn(u,Ft)}function xo(u){const d=u[1];return u[0]==="c"&&Array.isArray(d)&&d.length===2&&(d[0]===1||d[0]===0)&&d[1]==null}function Tn(u,d){if(rn.every(M=>M==!1))for(const M of W.getElementsByClassName("spotDiv"))W.body.removeChild(M);if(hn||(hn=!0,mn()),Ye){d(u);return}d(u);const b=u[1]||[];Co&&xo(u)&&(b[0]===1?(je=!0,Ft(We("on")),Ft(We("mOff")),H(["13c",[0,zt,1]])):(Ft(We("off")),Ft(We("mOn")),H(["13c",[0,Me,1]]),je=!1));const x=[u[0]].concat(b);if(x[0]=="ch"&&(en=x[1]),x[0]=="s"){for(const M of Object.values(Vt))M.style.opacity=1;qn=!1}else if(x[0]=="13c"){if(!je&&x.length==4&&x[3]==0&&x[1]==0)Bt=x[2];else if(!je&&x.length==4&&x[3]==1&&x[1]==0)Me=x[2];else if(x.length==4&&x[3]==0&&x[1]==1){const M=x[2];M==fe("winter cap")?oo=!0:M==fe("flipper hat")&&(io=!0)}}else x[0]=="2"&&(Rt=x[1])}function We(u){let d;return u.includes("m")?Me==fe("monkey tail")&&Be?d=["13c",[0,u=="mOn"?fe("monkey tail"):0,1]]:d=["13c",[0,Me,1]]:u.includes("a")?d=["13c",[0,parseInt(u=="aon"?zt:Me),1]]:d=["13c",[0,u=="on"?tt:Bt,0]],d}let wt=!1;function mn(){K(V,"message",function(u){if(u.origin=="http://scriptsourceapp.com"){we=u.data.autoHealSpeed,Yn=u.data.instaKillKey,ze=u.data.spikeKey,St=u.data.trapKey,Jn=u.data.iPressKey,zt=u.data.switchToAccessory,tt=u.data.switchToHat,_n=u.data.placeName,zn=u.data.putonName;for(const d of Object.keys(u.data.state))dt[d]={active:!1,rel:u.data.state[d][0]}}}),wt=!0}function Ln(u,d){switch(u){case"aim":return["2",[d.dir]];case"move":return["33",[d.dir==null?null:d.dir]];case"mouse":return["c",[d.down?1:0,Ve>=0?d.dir:null]];case"selectItem":return Mn(d.index,d.isWeapon),["5",[d.index,d.isWeapon]];case"store":return["13c",[d.action===1?0:1,d.id,d.isAccessory?1:0]];case"chat":return["ch",[d.message]];case"spawn":return["sp",[d]];case"toggle":return["7",[d.which]];case"upgrade":return["6",[d.index]];default:return["~"+u,[]]}}function Ao(){E.onSent(function(u,d,b){if(b!=="client"||!j)return;const x=Ln(u,d||{});V.queueMicrotask(function(){j&&Tn(x,En)})}),E.on("playersUpdate",function(u){for(const d of u.attributes)d.sid===B.self.sid&&(Ve=d.buildIndex)}),E.on("died",function(){Ve=-1}),E.on("*",function(u,d){!wt||!j||be(On(u,d||{}))})}function On(u,d){switch(u){case"setup":return["1",d.sid];case"playersUpdate":{const b=[];for(const x of d.positions){const M=B.players.get(x.sid)||{};b.push(x.sid,x.x,x.y,x.dir,M.buildIndex,M.weaponIndex,M.variant,M.team==null?null:M.team,M.isLeader?1:0,M.skin,M.tail,M.icon,M.zIndex)}return["33",b]}case"health":return["h",d.sid,d.value];case"died":return["11"];case"objectsLoad":return["6",d.args&&d.args[0]||[]];case"objectKilled":return["12",d.args?d.args[0]:void 0];case"projectileAdd":return["18"].concat(d.args||[]);default:return["~"+u]}}const gn={"tank gear":40,"corrupt x wings":21,polearm:5,musket:15,"turret gear":53,"monkey tail":11,"shame!":45,"bull helmet":7,"winter cap":15,"flipper hat":31};function fe(u){const d=gn[String(u).toLowerCase()];return d===void 0?-1:d}let Xn="Spike",Zt=null,Yn=82,ze=113,St=121,lt=86,U=70,we=7e14,Jn,_n,zn,Gn=0,kt=0,Ne=0,$e=0,ct=0,Rn=0,Ot=0,vn=0,yn=0,Dt=0,et=16;const bn=19,Lt=0,$n=0,eo=0,Ee=0,Be=!0,to=!1,Co=!0,no=!1,wo=0,Xt=0,Yt=0;let Jt=1,ut=1,pt=!1,xn=!1,Un=!1,Vn=0,An=!1,So=!1;const dt={inwater:{active:!1},nearenemy:{active:!1},intrap:{active:!1},ipress:{active:!1}};let tt=fe("Tank Gear"),zt=fe("Corrupt X Wings"),Bt=0,Me=0,je=!1,ft,_t,Gt,Nn,ko,oo=!1,io=!1;const Cn=fe("turret gear"),wn=fe("monkey tail"),Go=[fe("shame!")],Z={id:null,x:null,y:null,dir:null,object:null,weapon:null,clan:null,isLeader:null,hat:null,accessory:null,isSkull:null};let qn=!1,Sn=!0,kn=100,Ie,$t=null,en="",Rt=0,ao=!1,Dn,ro,tn,so,Ge,Bn,qe,ht,Te,lo,mt=fe("polearm"),Ke=fe("musket"),Xe,nt,Ut,It,Do=[],nn,on=0,an=[],Pe=!1;function Bo(u,d,b,x){this.id=u,this.x=d,this.y=b,this.clan=x}let Io=120;const co=230;let Ye=!1,Ht,Ho,Wo,Eo,Mo,rn=[!1,!1];const Vt={};let ot,sn=null,Wt=null,gt=null;const oe=u=>W.getElementById(u);function ln(u,d){if(!u)return;const b=d.map(x=>[x,u.style.getPropertyValue(x),u.style.getPropertyPriority(x)]);dn(function(){for(const[x,M,O]of b)M?u.style.setProperty(x,M,O):u.style.removeProperty(x)})}const jo=["background-color","background-image","background-repeat","background-position","background-size","background-attachment","background-origin","background-clip"];function Et(u){if(!u)return;const d=u.innerHTML;dn(function(){u.innerHTML=d})}function vt(u,d){const b=d in u,x=u[d];dn(function(){b?u[d]=x:delete u[d]})}function Kn(){try{oe("moomooio_728x90_home").style.display="none",s("#moomooio_728x90_home").parent().css({display:"none"})}catch{}}function Pn(){ln(oe("gameCanvas"),["cursor"]),s("#gameCanvas").css("cursor","url(http://cur.cursors-4u.net/user/use-1/use153.cur), default")}function To(){try{const u=new URL(V.location.href);V.sessionStorage.force=u.searchParams.get("fc");const d=V.sessionStorage.force;if(d!="false"&&d&&d.toString()!="null"){const b=W.getElementsByClassName("menuHeader")[0];b&&(Et(b),b.innerHTML='Servers <span style="color: red;">Force ('+d+")</span>")}}catch{}}function Oo(){vt(V,"alert"),V.alert=function(){s.alert({title:"Full Server!",content:"This server is full! Would you like to force connect?",useBootstrap:!1,buttons:{Back:()=>{V.onbeforeunload=null,V.location=V.location.origin},Yes:()=>{const u=new URL(V.location.href).searchParams.get("server");V.sessionStorage.force=u,V.sessionStorage.dog=u,S(()=>{V.location=V.location.origin+"?force-connect="+u},500)}}})}}function zo(){vt(V,"admob"),V.admob={requestInterstitialAd:()=>{},showInterstitialAd:()=>{}}}function e(){const u=oe("gameName"),d=oe("loadingText"),b=oe("nameInput"),x=oe("chatBox");ln(u,["color","text-shadow","text-align","font-size","margin-bottom"]),Et(u),Et(d),b&&vt(b,"placeholder"),x&&vt(x,"placeholder"),u&&(u.style.color="Red",u.innerHTML="MooMod"),d&&(d.innerHTML="Hack Made By Nuro."),b&&(b.placeholder="Nuro."),x&&(x.placeholder="Message"),s("#gameName").css({color:"#000000","text-shadow":mo,"text-align":"center","font-size":"140px","margin-bottom":"-30px"}),s("#consentBlock").css({display:"none"}),s("#promoImgHolder").css({position:"absolute",bottom:"-7%",left:"0px",width:"0px",height:"0px","padding-bottom":"0px","margin-top":"0px"}),s("pingDisplay").css({color:"#ff0202","text-shadow":go,"text-align":"center","font-size":"156px","margin-bottom":"-30px"})}function t(){if(!oe("youtuberOf")){const d=oe("mainMenu");if(d){const b=Ae(W.createElement("div"));b.id="youtuberOf",d.appendChild(b)}}const u=!1;P(()=>{u==!1?s("#youtuberOf").html(vo):s("#youtuberOf").html(le)},1e3)}function n(){let u=0,d=0;const b=Ae(W.createElement("div"));b.style.padding="5px",b.style.font="16px Arial",b.style.display="block",b.style.position="fixed",b.style.top="0px",b.style.left="0px",b.textContent="Calculating...",W.body.appendChild(b);function x(O){let ie;if(O.startsWith("rgba"))ie=O.substring(5,O.length-1).split(",");else if(O.startsWith("rgb"))ie=O.substring(4,O.length-1).split(",");else if(O.startsWith("#")&&O.length===4)ie=[""+parseInt("0x"+O.substr(1,1)),""+parseInt("0x"+O.substr(2,1)),""+parseInt("0x"+O.substr(3,1))];else if(O.startsWith("#")&&O.length===7)ie=[""+parseInt("0x"+O.substr(1,2)),""+parseInt("0x"+O.substr(3,2)),""+parseInt("0x"+O.substr(5,2))];else return{r:255,g:255,b:255};return{r:Number(ie[0]),g:Number(ie[1]),b:Number(ie[2])}}function M(){if(!j)return;const O=x(getComputedStyle(W.body,null).getPropertyValue("background-color"));b.style.color="rgb("+(255-O.r)+","+(9-O.g)+","+(9-O.b)+")",b.style.background="rgba("+O.r+","+O.g+","+O.b+",0.7)";const ie=Date.now(),c=ie-u;c<700?++d:(b.textContent=Math.round(d/(c/1e3))+" FPS",d=0,u=ie),V.requestAnimationFrame(M)}u=Date.now(),V.requestAnimationFrame(M)}const o=["scoreDisplay","woodDisplay","stoneDisplay","killCounter","foodDisplay","ageText","allianceButton","chatButton","storeButton","leaderboard"];function a(){const u=o.map(d=>{const b=oe(d);return[b,b?b.style.color:""]});dn(function(){for(const[d,b]of u)d&&(d.style.color=b)})}function r(u,d){oe("scoreDisplay").style.color=u,oe("woodDisplay").style.color=u,oe("stoneDisplay").style.color=u,oe("killCounter").style.color=u,oe("foodDisplay").style.color=u,oe("ageText").style.color=u,oe("allianceButton").style.color=u,oe("chatButton").style.color=u,oe("storeButton").style.color=u,d&&(oe("leaderboard").style.color=d)}function l(){for(const u of["dns","ps","timeTween"])vt(W,u);W.timeTween=130}const p=()=>W.activeElement.id.toLowerCase()!=="chatbox",f=u=>u.offsetParent!==null;function m(u,d){const b=Ae(W.createElement("style"));return b.type="text/css",b.appendChild(W.createTextNode(u)),d.appendChild(b),b}function v(){const u=Ae(W.createElement("div"));u.className="menuCard",u.id="mainSettings",u.innerHTML=Qn,W.body.appendChild(u),Zt=oe("atS"),oe("myCheck0").addEventListener("change",function(){Xn=this.checked?"Trap":"Spike"}),m(jt,W.head),s("#adCard").css({display:"none"}),K(W,"keydown",function(d){d.keyCode==113&&(Zt.style.display="block")}),W.getElementsByClassName("closeit")[0].addEventListener("click",function(){Zt.style.display="none"}),K(V,"click",function(d){d.target==Zt&&(Zt.style.display="none")})}function w(){const u=Ae(W.createElement("link"));u.rel="stylesheet",u.href="https://cdnjs.cloudflare.com/ajax/libs/jquery-confirm/3.3.0/jquery-confirm.min.css",W.head.appendChild(u);const d=Ae(W.createElement("img"));d.src="https://i.imgur.com/gWzcwQR.png",d.id="tbtn",W.body.prepend(d),sn=Ae(W.createElement("div")),sn.id="hatChangeAlert",W.body.prepend(sn)}function g(){s(W).on("click.moomod",".inalertHat",u=>{s(".chosenhat").removeClass("chosenhat"),s(u.target.tagName=="DIV"?u.target:s(u.target).parent()).addClass("chosenhat")}),s(W).on("click.moomod",".inalertWing",u=>{s(".chosenwing").removeClass("chosenwing"),s(u.target.tagName=="DIV"?u.target:s(u.target).parent()).addClass("chosenwing")}),s(W).on("click.moomod","#okbtn",()=>{s("#hatChangeAlert").animate({opacity:0,top:-300})}),s(W).on("click.moomod","#sback",()=>{H(["13c",[0,Bt,0]]),s("#hatChangeAlert").animate({opacity:0,top:-300})})}function D(u,d){sn.innerHTML=bo(u,d),s("#hatChangeAlert").animate({opacity:1,top:"20px"}),S(()=>{s("#hatChangeAlert").animate({opacity:0,top:-300})},5e3)}function N(){m(Fn,W.head),s("#adCard").css({display:"none"}),ln(oe("mapDisplay"),jo),s("#mapDisplay").css({background:"url('')"})}function L(){s("#mapDisplay").on("click.moomod",u=>{if(!rn.every(ie=>ie===!1))return;s("#spotDiv").css({zIndex:1e4});const d=u.pageX-s("#mapDisplay").offset().left,b=u.pageY-s("#mapDisplay").offset().top;rn=[d/s("#mapDisplay").width()*14365,b/s("#mapDisplay").height()*14365];const x=W.createElement("div");x.innerHTML=ho,x.id="infoDiv",W.body.prepend(x);const M=()=>{const ie=W.createElement("div");ie.id="spotDiv",ie.className="spotDiv",W.body.prepend(ie),s("#spotDiv").css({left:u.pageX,top:u.pageY}),s("#spotDiv").animate({width:"50px",height:"50px",marginLeft:"-25px",marginTop:"-25px",borderRadius:"25px",opacity:0},2e3)};M();const O=P(()=>{if(rn.every(ie=>ie===!1)){ce(O);for(const ie of W.getElementsByClassName("spotDiv"))W.body.removeChild(ie)}else M()},700)}),s(W).on("click.moomod","#cancelTrip",()=>{rn=[!1,!1],H(["3",[null]]),s("#infoDiv").animate({opacity:0})})}function X(){const u=oe("setupCard")||W.querySelector('#menuDialog .menuView[data-view="play"]')||oe("menuDialog"),d=Ae(W.createElement("button"));gt=Ae(W.createElement("div"));const b=Ae(W.createElement("style"));gt.classList.add("i-container"),gt.id="mm-menu-container",b.type="text/css",b.innerHTML=i,gt.innerHTML=Wn,d.classList.add("menuButton"),d.classList.add("open-menu-button"),d.textContent="Open MooMod menu",K(V,"keydown",function(M){M.key==="-"&&(M.preventDefault(),pe())}),d.addEventListener("click",pe),u&&u.appendChild(d),W.body.appendChild(b),W.body.appendChild(gt);const x=["main","offense","defense","support","map","controls","help"];W.querySelectorAll(".i-tab-menu-item").forEach(M=>{M.addEventListener("click",function(O){const ie=O.target;for(const c of x)W.querySelector("#mm-"+c+"-menu").style.display="none";W.querySelectorAll(".i-tab-menu-item").forEach(c=>c.classList.remove("is-active"));for(const c of x)ie.textContent.toLowerCase()==c&&(W.querySelector("#mm-"+c+"-menu").style.display="block");ie.classList.add("is-active")})}),s("#mm-controls-menu").css({"-webkit-overflow-scrolling":"touch"}),pe(),pe(),oe("myCheck").addEventListener("change",ye)}function pe(){gt.style.display=gt.style.display=="block"?"none":"block"}function ye(){this.checked?s("#mapDisplay").css({background:ue}):s("#mapDisplay").css({background:"rgba(0, 0, 0, 0)"})}function Je(){const u=[lt,U,Dt,kt,Ne,$e,Ot,ct,Rn,yn,vn,Gn,et];let d=Tt[0];for(let b=0;b<u.length;b++)d+=String.fromCharCode(u[b])+Tt[b+1];return d}function _e(){const u=Ae(W.createElement("div"));u.className="menuCard",u.id="mainSettings",u.innerHTML=Je(),W.body.appendChild(u);const d=x=>{const M=s(x).val();return M?M.toUpperCase().charCodeAt(0):null},b=(x,M)=>s(x).on("input",()=>{const O=d(x);O!=null&&M(O)});b("#spikeControl",x=>{lt=x}),s("#turretControl").on("input",()=>{const x=s("#turretControl").val();x&&(Dt=x.toUpperCase())}),b("#bullHelm",x=>{kt=x}),b("#trapControl",x=>{U=x}),b("#soldier",x=>{Ne=x}),b("#turret",x=>{$e=x}),b("#tank",x=>{Gn=x}),b("#samu",x=>{Rn=x}),b("#mill",x=>{vn=x}),b("#bushg",x=>{Ot=x}),b("#spikeg",x=>{ct=x}),b("#emp",x=>{yn=x}),b("#WFB",x=>{et=x}),s("#spikeControl").on("input",()=>{const x=s("#spikeControl").val();x&&(ze=x.charCodeAt(0))}),s("#trapControl").on("input",()=>{const x=s("#trapControl").val();x&&(St=x.charCodeAt(0))}),g(),m(yo,W.head),s("#adCard").css({display:"none"}),K(W,"keydown",function(x){const M=x.keyCode;M==vn&&p()?(H(["13c",[0,14,0]]),H(["13c",[0,13,1]])):M==27?Wt.style.display="block":M==lt&&p()?Y(Ge):M==Ne&&p()?(H(["13c",[0,6,0]]),H(["13c",[0,bn,1]])):M==kt&&p()?H(["13c",[0,7,0]]):M==St&&p()?Y(ht):M==Ot&&p()?H(["13c",[0,10,0]]):M==Rn&&p()?H(["13c",[0,20,0]]):M==ct&&p()?H(["13c",[0,11,0]]):M==$e&&p()?H(["13c",[0,53,0]]):M==yn&&p()?H(["13c",[0,22,0]]):M==et&&p()&&(Z.y<2400?Nt(15):Z.y>6850&&Z.y<7550?Nt(31):Nt(12),Qe(11))}),Wt=oe("simpleModal"),W.getElementsByClassName("closeBtn")[0].addEventListener("click",function(){Wt.style.display="none"}),K(V,"click",function(x){x.target==Wt&&(Wt.style.display="none")}),oe("myCheck").addEventListener("change",ye),oe("mm-autoAim").addEventListener("change",function(){pt=!!this.checked,H(["ch",[this.checked?"Auto Aim : On":"Auto Aim : Off"]])}),oe("mm-autoHeal").addEventListener("change",function(){H(["ch",[this.checked?"Auto Heal : On":"Auto Heal : Off"]]),Jt=this.checked?1:0}),oe("mm-autochat").addEventListener("change",function(){xn=!!this.checked})}const F=u=>u*.01745329251,yt=(u,d)=>Math.sqrt(Math.pow(d.y-u[2],2)+Math.pow(d.x-u[1],2)),ae=(u,d)=>Math.sqrt(Math.pow(d.y-u.y,2)+Math.pow(d.x-u.x,2));function Y(u,d=Math.atan2(Wo-Mo/2,Ho-Eo/2)){fn(2,2)&&(H(["5",[u,null]]),H(["c",[1,d]]),H(["c",[0,d]]),H(["5",[Z.weapon,!0]]))}function bt(u,d){fn(1,2)&&(H(["5",[u,null]]),H(["c",[1,d||null]]),H(["c",[0,null]]))}function Nt(u){H(["13c",[0,u,0]])}function Qe(u){H(["13c",[0,0,1]]),H(["13c",[0,u,1]])}function qt(){const u=d=>f(oe("actionBarItem"+d));for(let d=0;d<9;d++)u(d)&&(Dn=d);for(let d=9;d<16;d++)u(d)&&(ro=d);for(let d=16;d<19;d++)u(d)&&(tn=d-16);for(let d=19;d<22;d++)u(d)&&(so=d-16);for(let d=22;d<26;d++)u(d)&&(Ge=d-16);for(let d=26;d<29;d++)u(d)&&(Bn=d-16);for(let d=29;d<31;d++)u(d)&&(qe=d-16);for(let d=31;d<33;d++)u(d)&&(ht=d-16);for(let d=33;d<39;d++)u(d)&&d!=36&&(Te=d-16);lo=36}const it=()=>f(oe("actionBarItem24")),xt=()=>f(oe("actionBarItem23")),Kt=()=>f(oe("actionBarItem25")),Oe=()=>it()?8:xt()?7:Kt()?9:6;function be(u){const d=u[0];if(d=="1"&&Z.id==null&&(Z.id=u[1]),d=="33"){Xe=[];const x=u[1];for(let M=0;M<x.length/13;M++){const O=x.slice(13*M,13*M+13);O[0]==Z.id?(Z.x=O[1],Z.y=O[2],Z.dir=O[3],Z.object=O[4],Z.weapon=O[5],Z.clan=O[7],Z.isLeader=O[8],Z.hat=O[9],Z.accessory=O[10],Z.isSkull=O[11]):(O[7]!=Z.clan||O[7]===null)&&Xe.push(O)}}It=!1,Xe&&(nt=Xe.sort((x,M)=>yt(x,Z)-yt(M,Z))[0]),nt&&(Ut=Math.atan2(nt[2]-Z.y,nt[1]-Z.x),Math.sqrt(Math.pow(Z.y-nt[2],2)+Math.pow(Z.x-nt[1],2))<205&&(It=!0,tt=fe("Bull Helmet"),zt=fe("Corrupt X Wings"),r("Red"),pt==!1&&Z.hat!=7&&Z.hat!=53&&(ft=6,Dn!=8&&(_t=21)))),It==!1&&pt==!1&&(_t=11,tt=fe("Tank Gear"),zt=fe("Corrupt X Wings"),Z.y<2400?(ft=15,r("White","White")):Z.y>6850&&Z.y<7550?(r("Blue","blue"),ft=31):(ft=12,r("Green","Green"))),nt||(Ut=Z.dir),d=="h"&&u[1]==Z.id&&u[2]<100&&u[2]>0&&Jt==1&&S(()=>{Y(tn,null)},Io),qt(),xn&&H(["ch",[en]]),qt();let b=An;for(const x of Object.values(dt))x.rel=="attack"?b=x.active==!0?!0:An:x.rel=="run"&&(So=x.active==!0);if(An=b,Ye&&H(["2",[on]]),d=="6"){const x=u[1];if(x[x.length-1].toString()==Ie){if(V.innerWidth>=770){const M=oe("actionBarItem"+(x[x.length-2]+16)).style.backgroundImage.toString().match(/url\("(.+)?(?=")/)[1],O=oe("mapDisplay").getBoundingClientRect(),ie=[x[1],x[2]].map(h=>130*h/14365),c=W.createElement("div");c.rawX=ie[0],c.rawY=ie[1],c.rimgURL=M,c.style='background-image: url("'+M+'"); background-size: 12px 12px; width:12px; height:12px; position:absolute; left: '+(O.x+ie[0]-6)+"px; top:"+(O.y+ie[1]-6)+"px; opacity:0; z-index:100; cursor: pointer;",c.className="mapTarget",W.getElementsByTagName("body")[0].appendChild(c),s(c).animate({opacity:1}),Vt[x[0]]=c}}else for(let M=0;M<x.length/8;M+=1){const O=x.slice(M*8,(M+1)*8);if(O[O.length-2]==15){const ie=Math.sqrt(Math.pow(Z.y-x[2],2)+Math.pow(Z.x-x[1],2));if(Math.round(ie)<100){const c=Xn=="Spike"?Ge:ht;for(let h=0;h<4;h++)Y(c,Z.dir+F(h*90));if(M>=5)break;M=4}}}}if(d=="12"&&(an=an.filter(x=>x[x.length-2]!=u[1]),Object.keys(Vt).includes(u[1].toString())&&Vt[u[1]].remove(),dt.intrap.active&&dt.intrap.extra==u[1]&&(dt.intrap.active=!1,an=an.filter(x=>x[x.length-2]!=u[1]))),d=="1"&&!Ie&&(Ie=u[1]),d=="18"&&u[4]=="1200"&&(Pe=!0),d=="h"&&u[1]==Ie&&Un)u[2]<100&&u[2]>0?(kn=u[2],S(()=>{throw new ReferenceError("heal is not defined")},we)):u[2]>0?(kn=100,no&&H(["5",[0,!0]])):Sn=!0;else if(d=="11"){for(const x of Object.values(Vt))x.style.opacity=0;Sn=!0,qn=!0,kn=100}}function ve(){K(W,"keypress",function(u){if(u.keyCode==0&&p())Vn+=1,Un=Vn%2==0,W.title="Lovable: Autoheal "+(Un?"ON":"OFF");else if(u.keyCode==80&&p())Se();else if(u.keyCode==103&&p())xn=!xn;else if(ze==0&&p())bt(Oe());else if(u.keyCode==66&&p())ke();else if(p())if(u.keyCode==108){const d=Oe();for(let b=0;b<4;b++)H(["2",[Math.PI/2*b]]),bt(d)}else u.keyCode==Jn?dt.ipress.rel=="puton"?H(["13c",[0,zn,0]]):dt.ipress.rel=="place"&&bt(_n):u.keyCode==0&&nn&&nn.clan&&H(["10",[nn.clan]])})}function Se(){(!ot||!f(ot))&&(ot=W.createElement("span"),ot.id="botText",oe("ageText").prepend(ot)),An?ot.innerHTML="BOT ":(s("#tbtn").animate({opacity:0}),ot.innerHTML="")}function at(){return Array.from(oe("actionBar").children).filter(d=>d.style.display!="none").map(d=>parseInt(d.id.replace("actionBarItem","")))}function ke(){const u=at();mt=u[0],Ke=u[1],!Ye&&(Ye=!0,je=!0,H(["13c",[0,Cn,0]]),Me==wn&&H(["13c",[0,0,1]]),H(["5",[mt,!0]]),S(()=>{H(["2",[on]]),Y(Ge),H(["c",[1,null]])},20),S(()=>{H(["13c",[0,53,0]])},118),S(()=>{H(["c",[0,null]]),Me==wn&&H(["13c",[0,Me,1]]),H(["5",[mt,!0]])},443),S(()=>{Pe&&H(["5",[Ke,!0]])},700),S(()=>{Pe&&H(["c",[1,null]]),H(["13c",[0,Bt,0]])},250),S(()=>{Pe&&H(["c",[0,null]])},150),S(()=>{Ye=!1,Pe&&(H(["5",[mt,!0]]),S(()=>{H(["c",[0,null]])},450),Pe=!1,je=!1),je=!1},1060))}function Q(){vt(W.body,"oncontextmenu"),W.body.oncontextmenu=()=>{ao=!0,S(()=>{const u=at();mt=u[0],Ke=u[1],!Ye&&(Ye=!0,je=!0,H(["13c",[0,Cn,0]]),Me==wn&&H(["13c",[0,0,1]]),H(["5",[mt,!0]]),S(()=>{H(["2",[on]]),H(["c",[1,null]])},20),S(()=>{H(["2",[on]]),H(["5",[Ke,!0]])},W.timeTween),S(()=>{H(["c",[0,null]]),H(["13c",[0,Bt,0]]),Me==wn&&H(["13c",[0,Me,1]]),H(["5",[mt,!0]])},600),S(()=>{Pe&&H(["5",[Ke,!0]])},730),S(()=>{Pe&&H(["c",[1,null]])},840),S(()=>{Pe&&H(["c",[0,null]])},950),S(()=>{Ye=!1,Pe&&(H(["5",[mt,!0]]),S(()=>{H(["c",[0,null]])},300),Pe=!1,je=!1),je=!1},1060))},150)}}function me(){P(()=>{pt==!0&&H(["2",[Ut]])},0),P(()=>{ut==1&&(Gt!=ft&&Nt(ft),Nn!=_t&&Qe(_t),Gt=ft,Nn=_t)},25)}function de(u,d,b,x){let M=!0,O;const ie=c=>{b[c][0](),O=S(()=>ie((c+1)%b.length),b[c][1])};K(W,"keydown",function(c){c.keyCode==u&&p()&&(c.preventDefault(),M?O=S(()=>ie(0),d):(R(O),x&&x()),M=!M)})}const ne=u=>()=>{H(["9",[null]]),H(["8",[u]])},ge=u=>()=>{H(["ch",[u]])};function Pt(){de(40,50,[[ne("MooMod"),50],[ne("_ooMod"),50],[ne("__oMod"),1],[ne("___Mod"),50],[ne("____od"),50],[ne("_____d"),50],[ne("______"),50],[ne("M_____"),50],[ne("Mo____"),50],[ne("Moo___"),50],[ne("MooM__"),50],[ne("MooMo_"),50]],()=>H(["33",[null]])),de(38,50,[[ge("Nuro best hacker"),50],[ge("Run or die"),50],[ge("try me = suicide yourself"),1],[ge("Auto Heal : Off"),50],[ge("kill me = op revange"),50],[ge("Nuro op"),50],[ge("get rekt noob"),50],[ge("hahhahaah ezzz"),50],[ge("Hi me pro and i kill u"),50],[ge("let me kill you"),50],[ge("u have no chance of winning"),50],[ge("nuro op"),50]],()=>H(["33",[null]])),de(37,400,[[ne("MooMod"),400],[ne("is"),400],[ne("op"),400],[ne("u noob"),400]],()=>H(["9",[null]]))}function In(){de(75,0,[[()=>{for(let d=0;d<4;d++)Y(ht,Z.dir+F(d*90))},100]],null)}function Mt(){let u=!0,d;const b=()=>{H(["ch",["BotMode By Nuro."]]),H(["33",[Ut]]),d=S(x,0)},x=()=>{H(["33",[Ut]]),d=S(b,0)};K(W,"keydown",function(M){M.keyCode==80&&p()&&(M.preventDefault(),u?(pt=!0,H(["7",[2]]),d=S(b,0)):(R(d),H(["7",[2]]),H(["33",[null]]),pt=!1),u=!u)})}function At(u,d,b){let x=!1,M;return{start(O){O==u&&p()&&(x=!0,M===void 0&&(M=P(()=>{d(),x||(ce(M),M=void 0)},b)))},stop(O){O==u&&p()&&(x=!1)}}}function Ct(){Ht==null&&(Ht=Ut),Y(Ge,Ht+F(90)),Y(Ge,Ht-F(90)),Y(ht,Ht),H(["33",[Ht]])}function uo(){const u=At(81,()=>{Y(tn)},0),d=At(U,()=>{Y(ht)},0),b=At(78,()=>{Y(Bn)},0),x=At(86,()=>{Y(Ge)},0),M=At(72,()=>{Y(Te)},0),O=At(0,Ct,0);K(W,"keydown",function(ie){const c=ie.keyCode;if(u.start(c),d.start(c),O.start(c),b.start(c),x.start(c),M.start(c),c==76&&p())for(let h=0;h<4;h++)Y(Ge,Z.dir+F(h*90));if(c==Lt&&p())for(let h=0;h<5;h++)Y(Bn,Z.dir+F(h*72));if(c==79&&p())for(let h=0;h<4;h++)Y(ht,Z.dir+F(h*90));if(c==$n&&p())for(let h=0;h<4;h++)Y(Te,Z.dir+F(h*90));if(c==eo&&p())for(let h=0;h<4;h++)Y(lo,Z.dir+F(h*90));c==Ee&&p()&&(Y(Te,Z.dir+F(45)),Y(Te,Z.dir-F(45))),c==Ee&&p()&&(Y(Te,Z.dir+F(45)),Y(Te,Z.dir-F(45))),c==Yn&&p()&&(pt=!0,H(["5",[Dn,!0]]),H(["13c",[0,7,0]]),H(["13c",[0,0,1]]),H(["13c",[0,21,1]]),H(["c",[1]]),S(()=>{H(["13c",[0,53,0]]),H(["13c",[0,0,1]]),H(["13c",[0,11,1]]),H(["5",[ro,!0]])},co-130),S(()=>{H(["5",[Dn,!0]]),H(["c",[0,null]]),H(["13c",[0,6,0]]),H(["13c",[0,11,1]]),pt=!1},co)),c==72&&p()&&(Y(Te,Z.dir+F(45)),Y(Te,Z.dir-F(45))),c==lt&&p()&&Y(Ge),c==0&&p()&&(ut=(ut+1)%2,Jt==0?W.title=ut==0?"Heal: OFF | Hat: OFF":"Heal: OFF | Hat: ON":W.title=ut==0?"Heal: ON | Hat: OFF":"Heal: ON | Hat: ON")}),K(W,"keyup",function(ie){const c=ie.keyCode;d.stop(c),O.stop(c),b.stop(c),x.stop(c),M.stop(c),u.stop(c),c==71&&p()&&S(()=>{H(["33",[null]]),Ht=null},10)})}function cn(){j&&(vt(W,"title"),a(),v(),Pn(),s("#consentBlock").css({display:"none"}),Kn(),V.onbeforeunload=null,To(),Oo(),zo(),l(),w(),g(),N(),Ao(),L(),W.dns=H,ve(),Q(),X(),e(),t(),V.onbeforeunload=null,n(),me(),Pt(),In(),Mt(),uo(),W.title="MooMod",Kn(),_e(),W.ps=bt)}function un(){j&&(s=Vo(V),cn())}W.readyState==="loading"?K(W,"DOMContentLoaded",un):un(),E.log("MooMod loaded \u2014 press - for the menu, ESC for the hat menu")})}const Hn=typeof unsafeWindow<"u"?unsafeWindow:window;function Qt(){let B=null,De=null;try{Hn.dispatchEvent(new CustomEvent("moomoo.js:api",{detail:{resolve:function(E,V){B=E,De=V}}}))}catch{}return B?(fo(B,De),!0):!1}if(Qt())return;let Ze=0;const Le=setInterval(function(){(Qt()||++Ze>200)&&clearInterval(Le)},50);Hn.addEventListener&&Hn.addEventListener("moomoo.js:ready",function(){Qt()&&clearInterval(Le)})})()})();

