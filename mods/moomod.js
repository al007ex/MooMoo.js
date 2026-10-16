(function () {

// ---- bundled libraries: jQuery 3.7.1 (c) OpenJS Foundation, MIT · jquery-confirm 3.3.0 (c) Boniface Pereira, MIT
// (see build-moomod.mjs for why). MOOMOD_JQUERY(window) starts them once and returns that jQuery.
var MOOMOD_JQUERY = (function () {
    function jquery(window, module) {
/*! jQuery v3.7.1 | (c) OpenJS Foundation and other contributors | jquery.org/license */
!function(e,t){"use strict";"object"==typeof module&&"object"==typeof module.exports?module.exports=e.document?t(e,!0):function(e){if(!e.document)throw new Error("jQuery requires a window with a document");return t(e)}:t(e)}("undefined"!=typeof window?window:this,function(ie,e){"use strict";var oe=[],r=Object.getPrototypeOf,ae=oe.slice,g=oe.flat?function(e){return oe.flat.call(e)}:function(e){return oe.concat.apply([],e)},s=oe.push,se=oe.indexOf,n={},i=n.toString,ue=n.hasOwnProperty,o=ue.toString,a=o.call(Object),le={},v=function(e){return"function"==typeof e&&"number"!=typeof e.nodeType&&"function"!=typeof e.item},y=function(e){return null!=e&&e===e.window},C=ie.document,u={type:!0,src:!0,nonce:!0,noModule:!0};function m(e,t,n){var r,i,o=(n=n||C).createElement("script");if(o.text=e,t)for(r in u)(i=t[r]||t.getAttribute&&t.getAttribute(r))&&o.setAttribute(r,i);n.head.appendChild(o).parentNode.removeChild(o)}function x(e){return null==e?e+"":"object"==typeof e||"function"==typeof e?n[i.call(e)]||"object":typeof e}var t="3.7.1",l=/HTML$/i,ce=function(e,t){return new ce.fn.init(e,t)};function c(e){var t=!!e&&"length"in e&&e.length,n=x(e);return!v(e)&&!y(e)&&("array"===n||0===t||"number"==typeof t&&0<t&&t-1 in e)}function fe(e,t){return e.nodeName&&e.nodeName.toLowerCase()===t.toLowerCase()}ce.fn=ce.prototype={jquery:t,constructor:ce,length:0,toArray:function(){return ae.call(this)},get:function(e){return null==e?ae.call(this):e<0?this[e+this.length]:this[e]},pushStack:function(e){var t=ce.merge(this.constructor(),e);return t.prevObject=this,t},each:function(e){return ce.each(this,e)},map:function(n){return this.pushStack(ce.map(this,function(e,t){return n.call(e,t,e)}))},slice:function(){return this.pushStack(ae.apply(this,arguments))},first:function(){return this.eq(0)},last:function(){return this.eq(-1)},even:function(){return this.pushStack(ce.grep(this,function(e,t){return(t+1)%2}))},odd:function(){return this.pushStack(ce.grep(this,function(e,t){return t%2}))},eq:function(e){var t=this.length,n=+e+(e<0?t:0);return this.pushStack(0<=n&&n<t?[this[n]]:[])},end:function(){return this.prevObject||this.constructor()},push:s,sort:oe.sort,splice:oe.splice},ce.extend=ce.fn.extend=function(){var e,t,n,r,i,o,a=arguments[0]||{},s=1,u=arguments.length,l=!1;for("boolean"==typeof a&&(l=a,a=arguments[s]||{},s++),"object"==typeof a||v(a)||(a={}),s===u&&(a=this,s--);s<u;s++)if(null!=(e=arguments[s]))for(t in e)r=e[t],"__proto__"!==t&&a!==r&&(l&&r&&(ce.isPlainObject(r)||(i=Array.isArray(r)))?(n=a[t],o=i&&!Array.isArray(n)?[]:i||ce.isPlainObject(n)?n:{},i=!1,a[t]=ce.extend(l,o,r)):void 0!==r&&(a[t]=r));return a},ce.extend({expando:"jQuery"+(t+Math.random()).replace(/\D/g,""),isReady:!0,error:function(e){throw new Error(e)},noop:function(){},isPlainObject:function(e){var t,n;return!(!e||"[object Object]"!==i.call(e))&&(!(t=r(e))||"function"==typeof(n=ue.call(t,"constructor")&&t.constructor)&&o.call(n)===a)},isEmptyObject:function(e){var t;for(t in e)return!1;return!0},globalEval:function(e,t,n){m(e,{nonce:t&&t.nonce},n)},each:function(e,t){var n,r=0;if(c(e)){for(n=e.length;r<n;r++)if(!1===t.call(e[r],r,e[r]))break}else for(r in e)if(!1===t.call(e[r],r,e[r]))break;return e},text:function(e){var t,n="",r=0,i=e.nodeType;if(!i)while(t=e[r++])n+=ce.text(t);return 1===i||11===i?e.textContent:9===i?e.documentElement.textContent:3===i||4===i?e.nodeValue:n},makeArray:function(e,t){var n=t||[];return null!=e&&(c(Object(e))?ce.merge(n,"string"==typeof e?[e]:e):s.call(n,e)),n},inArray:function(e,t,n){return null==t?-1:se.call(t,e,n)},isXMLDoc:function(e){var t=e&&e.namespaceURI,n=e&&(e.ownerDocument||e).documentElement;return!l.test(t||n&&n.nodeName||"HTML")},merge:function(e,t){for(var n=+t.length,r=0,i=e.length;r<n;r++)e[i++]=t[r];return e.length=i,e},grep:function(e,t,n){for(var r=[],i=0,o=e.length,a=!n;i<o;i++)!t(e[i],i)!==a&&r.push(e[i]);return r},map:function(e,t,n){var r,i,o=0,a=[];if(c(e))for(r=e.length;o<r;o++)null!=(i=t(e[o],o,n))&&a.push(i);else for(o in e)null!=(i=t(e[o],o,n))&&a.push(i);return g(a)},guid:1,support:le}),"function"==typeof Symbol&&(ce.fn[Symbol.iterator]=oe[Symbol.iterator]),ce.each("Boolean Number String Function Array Date RegExp Object Error Symbol".split(" "),function(e,t){n["[object "+t+"]"]=t.toLowerCase()});var pe=oe.pop,de=oe.sort,he=oe.splice,ge="[\\x20\\t\\r\\n\\f]",ve=new RegExp("^"+ge+"+|((?:^|[^\\\\])(?:\\\\.)*)"+ge+"+$","g");ce.contains=function(e,t){var n=t&&t.parentNode;return e===n||!(!n||1!==n.nodeType||!(e.contains?e.contains(n):e.compareDocumentPosition&&16&e.compareDocumentPosition(n)))};var f=/([\0-\x1f\x7f]|^-?\d)|^-$|[^\x80-\uFFFF\w-]/g;function p(e,t){return t?"\0"===e?"\ufffd":e.slice(0,-1)+"\\"+e.charCodeAt(e.length-1).toString(16)+" ":"\\"+e}ce.escapeSelector=function(e){return(e+"").replace(f,p)};var ye=C,me=s;!function(){var e,b,w,o,a,T,r,C,d,i,k=me,S=ce.expando,E=0,n=0,s=W(),c=W(),u=W(),h=W(),l=function(e,t){return e===t&&(a=!0),0},f="checked|selected|async|autofocus|autoplay|controls|defer|disabled|hidden|ismap|loop|multiple|open|readonly|required|scoped",t="(?:\\\\[\\da-fA-F]{1,6}"+ge+"?|\\\\[^\\r\\n\\f]|[\\w-]|[^\0-\\x7f])+",p="\\["+ge+"*("+t+")(?:"+ge+"*([*^$|!~]?=)"+ge+"*(?:'((?:\\\\.|[^\\\\'])*)'|\"((?:\\\\.|[^\\\\\"])*)\"|("+t+"))|)"+ge+"*\\]",g=":("+t+")(?:\\((('((?:\\\\.|[^\\\\'])*)'|\"((?:\\\\.|[^\\\\\"])*)\")|((?:\\\\.|[^\\\\()[\\]]|"+p+")*)|.*)\\)|)",v=new RegExp(ge+"+","g"),y=new RegExp("^"+ge+"*,"+ge+"*"),m=new RegExp("^"+ge+"*([>+~]|"+ge+")"+ge+"*"),x=new RegExp(ge+"|>"),j=new RegExp(g),A=new RegExp("^"+t+"$"),D={ID:new RegExp("^#("+t+")"),CLASS:new RegExp("^\\.("+t+")"),TAG:new RegExp("^("+t+"|[*])"),ATTR:new RegExp("^"+p),PSEUDO:new RegExp("^"+g),CHILD:new RegExp("^:(only|first|last|nth|nth-last)-(child|of-type)(?:\\("+ge+"*(even|odd|(([+-]|)(\\d*)n|)"+ge+"*(?:([+-]|)"+ge+"*(\\d+)|))"+ge+"*\\)|)","i"),bool:new RegExp("^(?:"+f+")$","i"),needsContext:new RegExp("^"+ge+"*[>+~]|:(even|odd|eq|gt|lt|nth|first|last)(?:\\("+ge+"*((?:-\\d)?\\d*)"+ge+"*\\)|)(?=[^-]|$)","i")},N=/^(?:input|select|textarea|button)$/i,q=/^h\d$/i,L=/^(?:#([\w-]+)|(\w+)|\.([\w-]+))$/,H=/[+~]/,O=new RegExp("\\\\[\\da-fA-F]{1,6}"+ge+"?|\\\\([^\\r\\n\\f])","g"),P=function(e,t){var n="0x"+e.slice(1)-65536;return t||(n<0?String.fromCharCode(n+65536):String.fromCharCode(n>>10|55296,1023&n|56320))},M=function(){V()},R=J(function(e){return!0===e.disabled&&fe(e,"fieldset")},{dir:"parentNode",next:"legend"});try{k.apply(oe=ae.call(ye.childNodes),ye.childNodes),oe[ye.childNodes.length].nodeType}catch(e){k={apply:function(e,t){me.apply(e,ae.call(t))},call:function(e){me.apply(e,ae.call(arguments,1))}}}function I(t,e,n,r){var i,o,a,s,u,l,c,f=e&&e.ownerDocument,p=e?e.nodeType:9;if(n=n||[],"string"!=typeof t||!t||1!==p&&9!==p&&11!==p)return n;if(!r&&(V(e),e=e||T,C)){if(11!==p&&(u=L.exec(t)))if(i=u[1]){if(9===p){if(!(a=e.getElementById(i)))return n;if(a.id===i)return k.call(n,a),n}else if(f&&(a=f.getElementById(i))&&I.contains(e,a)&&a.id===i)return k.call(n,a),n}else{if(u[2])return k.apply(n,e.getElementsByTagName(t)),n;if((i=u[3])&&e.getElementsByClassName)return k.apply(n,e.getElementsByClassName(i)),n}if(!(h[t+" "]||d&&d.test(t))){if(c=t,f=e,1===p&&(x.test(t)||m.test(t))){(f=H.test(t)&&U(e.parentNode)||e)==e&&le.scope||((s=e.getAttribute("id"))?s=ce.escapeSelector(s):e.setAttribute("id",s=S)),o=(l=Y(t)).length;while(o--)l[o]=(s?"#"+s:":scope")+" "+Q(l[o]);c=l.join(",")}try{return k.apply(n,f.querySelectorAll(c)),n}catch(e){h(t,!0)}finally{s===S&&e.removeAttribute("id")}}}return re(t.replace(ve,"$1"),e,n,r)}function W(){var r=[];return function e(t,n){return r.push(t+" ")>b.cacheLength&&delete e[r.shift()],e[t+" "]=n}}function F(e){return e[S]=!0,e}function $(e){var t=T.createElement("fieldset");try{return!!e(t)}catch(e){return!1}finally{t.parentNode&&t.parentNode.removeChild(t),t=null}}function B(t){return function(e){return fe(e,"input")&&e.type===t}}function _(t){return function(e){return(fe(e,"input")||fe(e,"button"))&&e.type===t}}function z(t){return function(e){return"form"in e?e.parentNode&&!1===e.disabled?"label"in e?"label"in e.parentNode?e.parentNode.disabled===t:e.disabled===t:e.isDisabled===t||e.isDisabled!==!t&&R(e)===t:e.disabled===t:"label"in e&&e.disabled===t}}function X(a){return F(function(o){return o=+o,F(function(e,t){var n,r=a([],e.length,o),i=r.length;while(i--)e[n=r[i]]&&(e[n]=!(t[n]=e[n]))})})}function U(e){return e&&"undefined"!=typeof e.getElementsByTagName&&e}function V(e){var t,n=e?e.ownerDocument||e:ye;return n!=T&&9===n.nodeType&&n.documentElement&&(r=(T=n).documentElement,C=!ce.isXMLDoc(T),i=r.matches||r.webkitMatchesSelector||r.msMatchesSelector,r.msMatchesSelector&&ye!=T&&(t=T.defaultView)&&t.top!==t&&t.addEventListener("unload",M),le.getById=$(function(e){return r.appendChild(e).id=ce.expando,!T.getElementsByName||!T.getElementsByName(ce.expando).length}),le.disconnectedMatch=$(function(e){return i.call(e,"*")}),le.scope=$(function(){return T.querySelectorAll(":scope")}),le.cssHas=$(function(){try{return T.querySelector(":has(*,:jqfake)"),!1}catch(e){return!0}}),le.getById?(b.filter.ID=function(e){var t=e.replace(O,P);return function(e){return e.getAttribute("id")===t}},b.find.ID=function(e,t){if("undefined"!=typeof t.getElementById&&C){var n=t.getElementById(e);return n?[n]:[]}}):(b.filter.ID=function(e){var n=e.replace(O,P);return function(e){var t="undefined"!=typeof e.getAttributeNode&&e.getAttributeNode("id");return t&&t.value===n}},b.find.ID=function(e,t){if("undefined"!=typeof t.getElementById&&C){var n,r,i,o=t.getElementById(e);if(o){if((n=o.getAttributeNode("id"))&&n.value===e)return[o];i=t.getElementsByName(e),r=0;while(o=i[r++])if((n=o.getAttributeNode("id"))&&n.value===e)return[o]}return[]}}),b.find.TAG=function(e,t){return"undefined"!=typeof t.getElementsByTagName?t.getElementsByTagName(e):t.querySelectorAll(e)},b.find.CLASS=function(e,t){if("undefined"!=typeof t.getElementsByClassName&&C)return t.getElementsByClassName(e)},d=[],$(function(e){var t;r.appendChild(e).innerHTML="<a id='"+S+"' href='' disabled='disabled'></a><select id='"+S+"-\r\\' disabled='disabled'><option selected=''></option></select>",e.querySelectorAll("[selected]").length||d.push("\\["+ge+"*(?:value|"+f+")"),e.querySelectorAll("[id~="+S+"-]").length||d.push("~="),e.querySelectorAll("a#"+S+"+*").length||d.push(".#.+[+~]"),e.querySelectorAll(":checked").length||d.push(":checked"),(t=T.createElement("input")).setAttribute("type","hidden"),e.appendChild(t).setAttribute("name","D"),r.appendChild(e).disabled=!0,2!==e.querySelectorAll(":disabled").length&&d.push(":enabled",":disabled"),(t=T.createElement("input")).setAttribute("name",""),e.appendChild(t),e.querySelectorAll("[name='']").length||d.push("\\["+ge+"*name"+ge+"*="+ge+"*(?:''|\"\")")}),le.cssHas||d.push(":has"),d=d.length&&new RegExp(d.join("|")),l=function(e,t){if(e===t)return a=!0,0;var n=!e.compareDocumentPosition-!t.compareDocumentPosition;return n||(1&(n=(e.ownerDocument||e)==(t.ownerDocument||t)?e.compareDocumentPosition(t):1)||!le.sortDetached&&t.compareDocumentPosition(e)===n?e===T||e.ownerDocument==ye&&I.contains(ye,e)?-1:t===T||t.ownerDocument==ye&&I.contains(ye,t)?1:o?se.call(o,e)-se.call(o,t):0:4&n?-1:1)}),T}for(e in I.matches=function(e,t){return I(e,null,null,t)},I.matchesSelector=function(e,t){if(V(e),C&&!h[t+" "]&&(!d||!d.test(t)))try{var n=i.call(e,t);if(n||le.disconnectedMatch||e.document&&11!==e.document.nodeType)return n}catch(e){h(t,!0)}return 0<I(t,T,null,[e]).length},I.contains=function(e,t){return(e.ownerDocument||e)!=T&&V(e),ce.contains(e,t)},I.attr=function(e,t){(e.ownerDocument||e)!=T&&V(e);var n=b.attrHandle[t.toLowerCase()],r=n&&ue.call(b.attrHandle,t.toLowerCase())?n(e,t,!C):void 0;return void 0!==r?r:e.getAttribute(t)},I.error=function(e){throw new Error("Syntax error, unrecognized expression: "+e)},ce.uniqueSort=function(e){var t,n=[],r=0,i=0;if(a=!le.sortStable,o=!le.sortStable&&ae.call(e,0),de.call(e,l),a){while(t=e[i++])t===e[i]&&(r=n.push(i));while(r--)he.call(e,n[r],1)}return o=null,e},ce.fn.uniqueSort=function(){return this.pushStack(ce.uniqueSort(ae.apply(this)))},(b=ce.expr={cacheLength:50,createPseudo:F,match:D,attrHandle:{},find:{},relative:{">":{dir:"parentNode",first:!0}," ":{dir:"parentNode"},"+":{dir:"previousSibling",first:!0},"~":{dir:"previousSibling"}},preFilter:{ATTR:function(e){return e[1]=e[1].replace(O,P),e[3]=(e[3]||e[4]||e[5]||"").replace(O,P),"~="===e[2]&&(e[3]=" "+e[3]+" "),e.slice(0,4)},CHILD:function(e){return e[1]=e[1].toLowerCase(),"nth"===e[1].slice(0,3)?(e[3]||I.error(e[0]),e[4]=+(e[4]?e[5]+(e[6]||1):2*("even"===e[3]||"odd"===e[3])),e[5]=+(e[7]+e[8]||"odd"===e[3])):e[3]&&I.error(e[0]),e},PSEUDO:function(e){var t,n=!e[6]&&e[2];return D.CHILD.test(e[0])?null:(e[3]?e[2]=e[4]||e[5]||"":n&&j.test(n)&&(t=Y(n,!0))&&(t=n.indexOf(")",n.length-t)-n.length)&&(e[0]=e[0].slice(0,t),e[2]=n.slice(0,t)),e.slice(0,3))}},filter:{TAG:function(e){var t=e.replace(O,P).toLowerCase();return"*"===e?function(){return!0}:function(e){return fe(e,t)}},CLASS:function(e){var t=s[e+" "];return t||(t=new RegExp("(^|"+ge+")"+e+"("+ge+"|$)"))&&s(e,function(e){return t.test("string"==typeof e.className&&e.className||"undefined"!=typeof e.getAttribute&&e.getAttribute("class")||"")})},ATTR:function(n,r,i){return function(e){var t=I.attr(e,n);return null==t?"!="===r:!r||(t+="","="===r?t===i:"!="===r?t!==i:"^="===r?i&&0===t.indexOf(i):"*="===r?i&&-1<t.indexOf(i):"$="===r?i&&t.slice(-i.length)===i:"~="===r?-1<(" "+t.replace(v," ")+" ").indexOf(i):"|="===r&&(t===i||t.slice(0,i.length+1)===i+"-"))}},CHILD:function(d,e,t,h,g){var v="nth"!==d.slice(0,3),y="last"!==d.slice(-4),m="of-type"===e;return 1===h&&0===g?function(e){return!!e.parentNode}:function(e,t,n){var r,i,o,a,s,u=v!==y?"nextSibling":"previousSibling",l=e.parentNode,c=m&&e.nodeName.toLowerCase(),f=!n&&!m,p=!1;if(l){if(v){while(u){o=e;while(o=o[u])if(m?fe(o,c):1===o.nodeType)return!1;s=u="only"===d&&!s&&"nextSibling"}return!0}if(s=[y?l.firstChild:l.lastChild],y&&f){p=(a=(r=(i=l[S]||(l[S]={}))[d]||[])[0]===E&&r[1])&&r[2],o=a&&l.childNodes[a];while(o=++a&&o&&o[u]||(p=a=0)||s.pop())if(1===o.nodeType&&++p&&o===e){i[d]=[E,a,p];break}}else if(f&&(p=a=(r=(i=e[S]||(e[S]={}))[d]||[])[0]===E&&r[1]),!1===p)while(o=++a&&o&&o[u]||(p=a=0)||s.pop())if((m?fe(o,c):1===o.nodeType)&&++p&&(f&&((i=o[S]||(o[S]={}))[d]=[E,p]),o===e))break;return(p-=g)===h||p%h==0&&0<=p/h}}},PSEUDO:function(e,o){var t,a=b.pseudos[e]||b.setFilters[e.toLowerCase()]||I.error("unsupported pseudo: "+e);return a[S]?a(o):1<a.length?(t=[e,e,"",o],b.setFilters.hasOwnProperty(e.toLowerCase())?F(function(e,t){var n,r=a(e,o),i=r.length;while(i--)e[n=se.call(e,r[i])]=!(t[n]=r[i])}):function(e){return a(e,0,t)}):a}},pseudos:{not:F(function(e){var r=[],i=[],s=ne(e.replace(ve,"$1"));return s[S]?F(function(e,t,n,r){var i,o=s(e,null,r,[]),a=e.length;while(a--)(i=o[a])&&(e[a]=!(t[a]=i))}):function(e,t,n){return r[0]=e,s(r,null,n,i),r[0]=null,!i.pop()}}),has:F(function(t){return function(e){return 0<I(t,e).length}}),contains:F(function(t){return t=t.replace(O,P),function(e){return-1<(e.textContent||ce.text(e)).indexOf(t)}}),lang:F(function(n){return A.test(n||"")||I.error("unsupported lang: "+n),n=n.replace(O,P).toLowerCase(),function(e){var t;do{if(t=C?e.lang:e.getAttribute("xml:lang")||e.getAttribute("lang"))return(t=t.toLowerCase())===n||0===t.indexOf(n+"-")}while((e=e.parentNode)&&1===e.nodeType);return!1}}),target:function(e){var t=ie.location&&ie.location.hash;return t&&t.slice(1)===e.id},root:function(e){return e===r},focus:function(e){return e===function(){try{return T.activeElement}catch(e){}}()&&T.hasFocus()&&!!(e.type||e.href||~e.tabIndex)},enabled:z(!1),disabled:z(!0),checked:function(e){return fe(e,"input")&&!!e.checked||fe(e,"option")&&!!e.selected},selected:function(e){return e.parentNode&&e.parentNode.selectedIndex,!0===e.selected},empty:function(e){for(e=e.firstChild;e;e=e.nextSibling)if(e.nodeType<6)return!1;return!0},parent:function(e){return!b.pseudos.empty(e)},header:function(e){return q.test(e.nodeName)},input:function(e){return N.test(e.nodeName)},button:function(e){return fe(e,"input")&&"button"===e.type||fe(e,"button")},text:function(e){var t;return fe(e,"input")&&"text"===e.type&&(null==(t=e.getAttribute("type"))||"text"===t.toLowerCase())},first:X(function(){return[0]}),last:X(function(e,t){return[t-1]}),eq:X(function(e,t,n){return[n<0?n+t:n]}),even:X(function(e,t){for(var n=0;n<t;n+=2)e.push(n);return e}),odd:X(function(e,t){for(var n=1;n<t;n+=2)e.push(n);return e}),lt:X(function(e,t,n){var r;for(r=n<0?n+t:t<n?t:n;0<=--r;)e.push(r);return e}),gt:X(function(e,t,n){for(var r=n<0?n+t:n;++r<t;)e.push(r);return e})}}).pseudos.nth=b.pseudos.eq,{radio:!0,checkbox:!0,file:!0,password:!0,image:!0})b.pseudos[e]=B(e);for(e in{submit:!0,reset:!0})b.pseudos[e]=_(e);function G(){}function Y(e,t){var n,r,i,o,a,s,u,l=c[e+" "];if(l)return t?0:l.slice(0);a=e,s=[],u=b.preFilter;while(a){for(o in n&&!(r=y.exec(a))||(r&&(a=a.slice(r[0].length)||a),s.push(i=[])),n=!1,(r=m.exec(a))&&(n=r.shift(),i.push({value:n,type:r[0].replace(ve," ")}),a=a.slice(n.length)),b.filter)!(r=D[o].exec(a))||u[o]&&!(r=u[o](r))||(n=r.shift(),i.push({value:n,type:o,matches:r}),a=a.slice(n.length));if(!n)break}return t?a.length:a?I.error(e):c(e,s).slice(0)}function Q(e){for(var t=0,n=e.length,r="";t<n;t++)r+=e[t].value;return r}function J(a,e,t){var s=e.dir,u=e.next,l=u||s,c=t&&"parentNode"===l,f=n++;return e.first?function(e,t,n){while(e=e[s])if(1===e.nodeType||c)return a(e,t,n);return!1}:function(e,t,n){var r,i,o=[E,f];if(n){while(e=e[s])if((1===e.nodeType||c)&&a(e,t,n))return!0}else while(e=e[s])if(1===e.nodeType||c)if(i=e[S]||(e[S]={}),u&&fe(e,u))e=e[s]||e;else{if((r=i[l])&&r[0]===E&&r[1]===f)return o[2]=r[2];if((i[l]=o)[2]=a(e,t,n))return!0}return!1}}function K(i){return 1<i.length?function(e,t,n){var r=i.length;while(r--)if(!i[r](e,t,n))return!1;return!0}:i[0]}function Z(e,t,n,r,i){for(var o,a=[],s=0,u=e.length,l=null!=t;s<u;s++)(o=e[s])&&(n&&!n(o,r,i)||(a.push(o),l&&t.push(s)));return a}function ee(d,h,g,v,y,e){return v&&!v[S]&&(v=ee(v)),y&&!y[S]&&(y=ee(y,e)),F(function(e,t,n,r){var i,o,a,s,u=[],l=[],c=t.length,f=e||function(e,t,n){for(var r=0,i=t.length;r<i;r++)I(e,t[r],n);return n}(h||"*",n.nodeType?[n]:n,[]),p=!d||!e&&h?f:Z(f,u,d,n,r);if(g?g(p,s=y||(e?d:c||v)?[]:t,n,r):s=p,v){i=Z(s,l),v(i,[],n,r),o=i.length;while(o--)(a=i[o])&&(s[l[o]]=!(p[l[o]]=a))}if(e){if(y||d){if(y){i=[],o=s.length;while(o--)(a=s[o])&&i.push(p[o]=a);y(null,s=[],i,r)}o=s.length;while(o--)(a=s[o])&&-1<(i=y?se.call(e,a):u[o])&&(e[i]=!(t[i]=a))}}else s=Z(s===t?s.splice(c,s.length):s),y?y(null,t,s,r):k.apply(t,s)})}function te(e){for(var i,t,n,r=e.length,o=b.relative[e[0].type],a=o||b.relative[" "],s=o?1:0,u=J(function(e){return e===i},a,!0),l=J(function(e){return-1<se.call(i,e)},a,!0),c=[function(e,t,n){var r=!o&&(n||t!=w)||((i=t).nodeType?u(e,t,n):l(e,t,n));return i=null,r}];s<r;s++)if(t=b.relative[e[s].type])c=[J(K(c),t)];else{if((t=b.filter[e[s].type].apply(null,e[s].matches))[S]){for(n=++s;n<r;n++)if(b.relative[e[n].type])break;return ee(1<s&&K(c),1<s&&Q(e.slice(0,s-1).concat({value:" "===e[s-2].type?"*":""})).replace(ve,"$1"),t,s<n&&te(e.slice(s,n)),n<r&&te(e=e.slice(n)),n<r&&Q(e))}c.push(t)}return K(c)}function ne(e,t){var n,v,y,m,x,r,i=[],o=[],a=u[e+" "];if(!a){t||(t=Y(e)),n=t.length;while(n--)(a=te(t[n]))[S]?i.push(a):o.push(a);(a=u(e,(v=o,m=0<(y=i).length,x=0<v.length,r=function(e,t,n,r,i){var o,a,s,u=0,l="0",c=e&&[],f=[],p=w,d=e||x&&b.find.TAG("*",i),h=E+=null==p?1:Math.random()||.1,g=d.length;for(i&&(w=t==T||t||i);l!==g&&null!=(o=d[l]);l++){if(x&&o){a=0,t||o.ownerDocument==T||(V(o),n=!C);while(s=v[a++])if(s(o,t||T,n)){k.call(r,o);break}i&&(E=h)}m&&((o=!s&&o)&&u--,e&&c.push(o))}if(u+=l,m&&l!==u){a=0;while(s=y[a++])s(c,f,t,n);if(e){if(0<u)while(l--)c[l]||f[l]||(f[l]=pe.call(r));f=Z(f)}k.apply(r,f),i&&!e&&0<f.length&&1<u+y.length&&ce.uniqueSort(r)}return i&&(E=h,w=p),c},m?F(r):r))).selector=e}return a}function re(e,t,n,r){var i,o,a,s,u,l="function"==typeof e&&e,c=!r&&Y(e=l.selector||e);if(n=n||[],1===c.length){if(2<(o=c[0]=c[0].slice(0)).length&&"ID"===(a=o[0]).type&&9===t.nodeType&&C&&b.relative[o[1].type]){if(!(t=(b.find.ID(a.matches[0].replace(O,P),t)||[])[0]))return n;l&&(t=t.parentNode),e=e.slice(o.shift().value.length)}i=D.needsContext.test(e)?0:o.length;while(i--){if(a=o[i],b.relative[s=a.type])break;if((u=b.find[s])&&(r=u(a.matches[0].replace(O,P),H.test(o[0].type)&&U(t.parentNode)||t))){if(o.splice(i,1),!(e=r.length&&Q(o)))return k.apply(n,r),n;break}}}return(l||ne(e,c))(r,t,!C,n,!t||H.test(e)&&U(t.parentNode)||t),n}G.prototype=b.filters=b.pseudos,b.setFilters=new G,le.sortStable=S.split("").sort(l).join("")===S,V(),le.sortDetached=$(function(e){return 1&e.compareDocumentPosition(T.createElement("fieldset"))}),ce.find=I,ce.expr[":"]=ce.expr.pseudos,ce.unique=ce.uniqueSort,I.compile=ne,I.select=re,I.setDocument=V,I.tokenize=Y,I.escape=ce.escapeSelector,I.getText=ce.text,I.isXML=ce.isXMLDoc,I.selectors=ce.expr,I.support=ce.support,I.uniqueSort=ce.uniqueSort}();var d=function(e,t,n){var r=[],i=void 0!==n;while((e=e[t])&&9!==e.nodeType)if(1===e.nodeType){if(i&&ce(e).is(n))break;r.push(e)}return r},h=function(e,t){for(var n=[];e;e=e.nextSibling)1===e.nodeType&&e!==t&&n.push(e);return n},b=ce.expr.match.needsContext,w=/^<([a-z][^\/\0>:\x20\t\r\n\f]*)[\x20\t\r\n\f]*\/?>(?:<\/\1>|)$/i;function T(e,n,r){return v(n)?ce.grep(e,function(e,t){return!!n.call(e,t,e)!==r}):n.nodeType?ce.grep(e,function(e){return e===n!==r}):"string"!=typeof n?ce.grep(e,function(e){return-1<se.call(n,e)!==r}):ce.filter(n,e,r)}ce.filter=function(e,t,n){var r=t[0];return n&&(e=":not("+e+")"),1===t.length&&1===r.nodeType?ce.find.matchesSelector(r,e)?[r]:[]:ce.find.matches(e,ce.grep(t,function(e){return 1===e.nodeType}))},ce.fn.extend({find:function(e){var t,n,r=this.length,i=this;if("string"!=typeof e)return this.pushStack(ce(e).filter(function(){for(t=0;t<r;t++)if(ce.contains(i[t],this))return!0}));for(n=this.pushStack([]),t=0;t<r;t++)ce.find(e,i[t],n);return 1<r?ce.uniqueSort(n):n},filter:function(e){return this.pushStack(T(this,e||[],!1))},not:function(e){return this.pushStack(T(this,e||[],!0))},is:function(e){return!!T(this,"string"==typeof e&&b.test(e)?ce(e):e||[],!1).length}});var k,S=/^(?:\s*(<[\w\W]+>)[^>]*|#([\w-]+))$/;(ce.fn.init=function(e,t,n){var r,i;if(!e)return this;if(n=n||k,"string"==typeof e){if(!(r="<"===e[0]&&">"===e[e.length-1]&&3<=e.length?[null,e,null]:S.exec(e))||!r[1]&&t)return!t||t.jquery?(t||n).find(e):this.constructor(t).find(e);if(r[1]){if(t=t instanceof ce?t[0]:t,ce.merge(this,ce.parseHTML(r[1],t&&t.nodeType?t.ownerDocument||t:C,!0)),w.test(r[1])&&ce.isPlainObject(t))for(r in t)v(this[r])?this[r](t[r]):this.attr(r,t[r]);return this}return(i=C.getElementById(r[2]))&&(this[0]=i,this.length=1),this}return e.nodeType?(this[0]=e,this.length=1,this):v(e)?void 0!==n.ready?n.ready(e):e(ce):ce.makeArray(e,this)}).prototype=ce.fn,k=ce(C);var E=/^(?:parents|prev(?:Until|All))/,j={children:!0,contents:!0,next:!0,prev:!0};function A(e,t){while((e=e[t])&&1!==e.nodeType);return e}ce.fn.extend({has:function(e){var t=ce(e,this),n=t.length;return this.filter(function(){for(var e=0;e<n;e++)if(ce.contains(this,t[e]))return!0})},closest:function(e,t){var n,r=0,i=this.length,o=[],a="string"!=typeof e&&ce(e);if(!b.test(e))for(;r<i;r++)for(n=this[r];n&&n!==t;n=n.parentNode)if(n.nodeType<11&&(a?-1<a.index(n):1===n.nodeType&&ce.find.matchesSelector(n,e))){o.push(n);break}return this.pushStack(1<o.length?ce.uniqueSort(o):o)},index:function(e){return e?"string"==typeof e?se.call(ce(e),this[0]):se.call(this,e.jquery?e[0]:e):this[0]&&this[0].parentNode?this.first().prevAll().length:-1},add:function(e,t){return this.pushStack(ce.uniqueSort(ce.merge(this.get(),ce(e,t))))},addBack:function(e){return this.add(null==e?this.prevObject:this.prevObject.filter(e))}}),ce.each({parent:function(e){var t=e.parentNode;return t&&11!==t.nodeType?t:null},parents:function(e){return d(e,"parentNode")},parentsUntil:function(e,t,n){return d(e,"parentNode",n)},next:function(e){return A(e,"nextSibling")},prev:function(e){return A(e,"previousSibling")},nextAll:function(e){return d(e,"nextSibling")},prevAll:function(e){return d(e,"previousSibling")},nextUntil:function(e,t,n){return d(e,"nextSibling",n)},prevUntil:function(e,t,n){return d(e,"previousSibling",n)},siblings:function(e){return h((e.parentNode||{}).firstChild,e)},children:function(e){return h(e.firstChild)},contents:function(e){return null!=e.contentDocument&&r(e.contentDocument)?e.contentDocument:(fe(e,"template")&&(e=e.content||e),ce.merge([],e.childNodes))}},function(r,i){ce.fn[r]=function(e,t){var n=ce.map(this,i,e);return"Until"!==r.slice(-5)&&(t=e),t&&"string"==typeof t&&(n=ce.filter(t,n)),1<this.length&&(j[r]||ce.uniqueSort(n),E.test(r)&&n.reverse()),this.pushStack(n)}});var D=/[^\x20\t\r\n\f]+/g;function N(e){return e}function q(e){throw e}function L(e,t,n,r){var i;try{e&&v(i=e.promise)?i.call(e).done(t).fail(n):e&&v(i=e.then)?i.call(e,t,n):t.apply(void 0,[e].slice(r))}catch(e){n.apply(void 0,[e])}}ce.Callbacks=function(r){var e,n;r="string"==typeof r?(e=r,n={},ce.each(e.match(D)||[],function(e,t){n[t]=!0}),n):ce.extend({},r);var i,t,o,a,s=[],u=[],l=-1,c=function(){for(a=a||r.once,o=i=!0;u.length;l=-1){t=u.shift();while(++l<s.length)!1===s[l].apply(t[0],t[1])&&r.stopOnFalse&&(l=s.length,t=!1)}r.memory||(t=!1),i=!1,a&&(s=t?[]:"")},f={add:function(){return s&&(t&&!i&&(l=s.length-1,u.push(t)),function n(e){ce.each(e,function(e,t){v(t)?r.unique&&f.has(t)||s.push(t):t&&t.length&&"string"!==x(t)&&n(t)})}(arguments),t&&!i&&c()),this},remove:function(){return ce.each(arguments,function(e,t){var n;while(-1<(n=ce.inArray(t,s,n)))s.splice(n,1),n<=l&&l--}),this},has:function(e){return e?-1<ce.inArray(e,s):0<s.length},empty:function(){return s&&(s=[]),this},disable:function(){return a=u=[],s=t="",this},disabled:function(){return!s},lock:function(){return a=u=[],t||i||(s=t=""),this},locked:function(){return!!a},fireWith:function(e,t){return a||(t=[e,(t=t||[]).slice?t.slice():t],u.push(t),i||c()),this},fire:function(){return f.fireWith(this,arguments),this},fired:function(){return!!o}};return f},ce.extend({Deferred:function(e){var o=[["notify","progress",ce.Callbacks("memory"),ce.Callbacks("memory"),2],["resolve","done",ce.Callbacks("once memory"),ce.Callbacks("once memory"),0,"resolved"],["reject","fail",ce.Callbacks("once memory"),ce.Callbacks("once memory"),1,"rejected"]],i="pending",a={state:function(){return i},always:function(){return s.done(arguments).fail(arguments),this},"catch":function(e){return a.then(null,e)},pipe:function(){var i=arguments;return ce.Deferred(function(r){ce.each(o,function(e,t){var n=v(i[t[4]])&&i[t[4]];s[t[1]](function(){var e=n&&n.apply(this,arguments);e&&v(e.promise)?e.promise().progress(r.notify).done(r.resolve).fail(r.reject):r[t[0]+"With"](this,n?[e]:arguments)})}),i=null}).promise()},then:function(t,n,r){var u=0;function l(i,o,a,s){return function(){var n=this,r=arguments,e=function(){var e,t;if(!(i<u)){if((e=a.apply(n,r))===o.promise())throw new TypeError("Thenable self-resolution");t=e&&("object"==typeof e||"function"==typeof e)&&e.then,v(t)?s?t.call(e,l(u,o,N,s),l(u,o,q,s)):(u++,t.call(e,l(u,o,N,s),l(u,o,q,s),l(u,o,N,o.notifyWith))):(a!==N&&(n=void 0,r=[e]),(s||o.resolveWith)(n,r))}},t=s?e:function(){try{e()}catch(e){ce.Deferred.exceptionHook&&ce.Deferred.exceptionHook(e,t.error),u<=i+1&&(a!==q&&(n=void 0,r=[e]),o.rejectWith(n,r))}};i?t():(ce.Deferred.getErrorHook?t.error=ce.Deferred.getErrorHook():ce.Deferred.getStackHook&&(t.error=ce.Deferred.getStackHook()),ie.setTimeout(t))}}return ce.Deferred(function(e){o[0][3].add(l(0,e,v(r)?r:N,e.notifyWith)),o[1][3].add(l(0,e,v(t)?t:N)),o[2][3].add(l(0,e,v(n)?n:q))}).promise()},promise:function(e){return null!=e?ce.extend(e,a):a}},s={};return ce.each(o,function(e,t){var n=t[2],r=t[5];a[t[1]]=n.add,r&&n.add(function(){i=r},o[3-e][2].disable,o[3-e][3].disable,o[0][2].lock,o[0][3].lock),n.add(t[3].fire),s[t[0]]=function(){return s[t[0]+"With"](this===s?void 0:this,arguments),this},s[t[0]+"With"]=n.fireWith}),a.promise(s),e&&e.call(s,s),s},when:function(e){var n=arguments.length,t=n,r=Array(t),i=ae.call(arguments),o=ce.Deferred(),a=function(t){return function(e){r[t]=this,i[t]=1<arguments.length?ae.call(arguments):e,--n||o.resolveWith(r,i)}};if(n<=1&&(L(e,o.done(a(t)).resolve,o.reject,!n),"pending"===o.state()||v(i[t]&&i[t].then)))return o.then();while(t--)L(i[t],a(t),o.reject);return o.promise()}});var H=/^(Eval|Internal|Range|Reference|Syntax|Type|URI)Error$/;ce.Deferred.exceptionHook=function(e,t){ie.console&&ie.console.warn&&e&&H.test(e.name)&&ie.console.warn("jQuery.Deferred exception: "+e.message,e.stack,t)},ce.readyException=function(e){ie.setTimeout(function(){throw e})};var O=ce.Deferred();function P(){C.removeEventListener("DOMContentLoaded",P),ie.removeEventListener("load",P),ce.ready()}ce.fn.ready=function(e){return O.then(e)["catch"](function(e){ce.readyException(e)}),this},ce.extend({isReady:!1,readyWait:1,ready:function(e){(!0===e?--ce.readyWait:ce.isReady)||(ce.isReady=!0)!==e&&0<--ce.readyWait||O.resolveWith(C,[ce])}}),ce.ready.then=O.then,"complete"===C.readyState||"loading"!==C.readyState&&!C.documentElement.doScroll?ie.setTimeout(ce.ready):(C.addEventListener("DOMContentLoaded",P),ie.addEventListener("load",P));var M=function(e,t,n,r,i,o,a){var s=0,u=e.length,l=null==n;if("object"===x(n))for(s in i=!0,n)M(e,t,s,n[s],!0,o,a);else if(void 0!==r&&(i=!0,v(r)||(a=!0),l&&(a?(t.call(e,r),t=null):(l=t,t=function(e,t,n){return l.call(ce(e),n)})),t))for(;s<u;s++)t(e[s],n,a?r:r.call(e[s],s,t(e[s],n)));return i?e:l?t.call(e):u?t(e[0],n):o},R=/^-ms-/,I=/-([a-z])/g;function W(e,t){return t.toUpperCase()}function F(e){return e.replace(R,"ms-").replace(I,W)}var $=function(e){return 1===e.nodeType||9===e.nodeType||!+e.nodeType};function B(){this.expando=ce.expando+B.uid++}B.uid=1,B.prototype={cache:function(e){var t=e[this.expando];return t||(t={},$(e)&&(e.nodeType?e[this.expando]=t:Object.defineProperty(e,this.expando,{value:t,configurable:!0}))),t},set:function(e,t,n){var r,i=this.cache(e);if("string"==typeof t)i[F(t)]=n;else for(r in t)i[F(r)]=t[r];return i},get:function(e,t){return void 0===t?this.cache(e):e[this.expando]&&e[this.expando][F(t)]},access:function(e,t,n){return void 0===t||t&&"string"==typeof t&&void 0===n?this.get(e,t):(this.set(e,t,n),void 0!==n?n:t)},remove:function(e,t){var n,r=e[this.expando];if(void 0!==r){if(void 0!==t){n=(t=Array.isArray(t)?t.map(F):(t=F(t))in r?[t]:t.match(D)||[]).length;while(n--)delete r[t[n]]}(void 0===t||ce.isEmptyObject(r))&&(e.nodeType?e[this.expando]=void 0:delete e[this.expando])}},hasData:function(e){var t=e[this.expando];return void 0!==t&&!ce.isEmptyObject(t)}};var _=new B,z=new B,X=/^(?:\{[\w\W]*\}|\[[\w\W]*\])$/,U=/[A-Z]/g;function V(e,t,n){var r,i;if(void 0===n&&1===e.nodeType)if(r="data-"+t.replace(U,"-$&").toLowerCase(),"string"==typeof(n=e.getAttribute(r))){try{n="true"===(i=n)||"false"!==i&&("null"===i?null:i===+i+""?+i:X.test(i)?JSON.parse(i):i)}catch(e){}z.set(e,t,n)}else n=void 0;return n}ce.extend({hasData:function(e){return z.hasData(e)||_.hasData(e)},data:function(e,t,n){return z.access(e,t,n)},removeData:function(e,t){z.remove(e,t)},_data:function(e,t,n){return _.access(e,t,n)},_removeData:function(e,t){_.remove(e,t)}}),ce.fn.extend({data:function(n,e){var t,r,i,o=this[0],a=o&&o.attributes;if(void 0===n){if(this.length&&(i=z.get(o),1===o.nodeType&&!_.get(o,"hasDataAttrs"))){t=a.length;while(t--)a[t]&&0===(r=a[t].name).indexOf("data-")&&(r=F(r.slice(5)),V(o,r,i[r]));_.set(o,"hasDataAttrs",!0)}return i}return"object"==typeof n?this.each(function(){z.set(this,n)}):M(this,function(e){var t;if(o&&void 0===e)return void 0!==(t=z.get(o,n))?t:void 0!==(t=V(o,n))?t:void 0;this.each(function(){z.set(this,n,e)})},null,e,1<arguments.length,null,!0)},removeData:function(e){return this.each(function(){z.remove(this,e)})}}),ce.extend({queue:function(e,t,n){var r;if(e)return t=(t||"fx")+"queue",r=_.get(e,t),n&&(!r||Array.isArray(n)?r=_.access(e,t,ce.makeArray(n)):r.push(n)),r||[]},dequeue:function(e,t){t=t||"fx";var n=ce.queue(e,t),r=n.length,i=n.shift(),o=ce._queueHooks(e,t);"inprogress"===i&&(i=n.shift(),r--),i&&("fx"===t&&n.unshift("inprogress"),delete o.stop,i.call(e,function(){ce.dequeue(e,t)},o)),!r&&o&&o.empty.fire()},_queueHooks:function(e,t){var n=t+"queueHooks";return _.get(e,n)||_.access(e,n,{empty:ce.Callbacks("once memory").add(function(){_.remove(e,[t+"queue",n])})})}}),ce.fn.extend({queue:function(t,n){var e=2;return"string"!=typeof t&&(n=t,t="fx",e--),arguments.length<e?ce.queue(this[0],t):void 0===n?this:this.each(function(){var e=ce.queue(this,t,n);ce._queueHooks(this,t),"fx"===t&&"inprogress"!==e[0]&&ce.dequeue(this,t)})},dequeue:function(e){return this.each(function(){ce.dequeue(this,e)})},clearQueue:function(e){return this.queue(e||"fx",[])},promise:function(e,t){var n,r=1,i=ce.Deferred(),o=this,a=this.length,s=function(){--r||i.resolveWith(o,[o])};"string"!=typeof e&&(t=e,e=void 0),e=e||"fx";while(a--)(n=_.get(o[a],e+"queueHooks"))&&n.empty&&(r++,n.empty.add(s));return s(),i.promise(t)}});var G=/[+-]?(?:\d*\.|)\d+(?:[eE][+-]?\d+|)/.source,Y=new RegExp("^(?:([+-])=|)("+G+")([a-z%]*)$","i"),Q=["Top","Right","Bottom","Left"],J=C.documentElement,K=function(e){return ce.contains(e.ownerDocument,e)},Z={composed:!0};J.getRootNode&&(K=function(e){return ce.contains(e.ownerDocument,e)||e.getRootNode(Z)===e.ownerDocument});var ee=function(e,t){return"none"===(e=t||e).style.display||""===e.style.display&&K(e)&&"none"===ce.css(e,"display")};function te(e,t,n,r){var i,o,a=20,s=r?function(){return r.cur()}:function(){return ce.css(e,t,"")},u=s(),l=n&&n[3]||(ce.cssNumber[t]?"":"px"),c=e.nodeType&&(ce.cssNumber[t]||"px"!==l&&+u)&&Y.exec(ce.css(e,t));if(c&&c[3]!==l){u/=2,l=l||c[3],c=+u||1;while(a--)ce.style(e,t,c+l),(1-o)*(1-(o=s()/u||.5))<=0&&(a=0),c/=o;c*=2,ce.style(e,t,c+l),n=n||[]}return n&&(c=+c||+u||0,i=n[1]?c+(n[1]+1)*n[2]:+n[2],r&&(r.unit=l,r.start=c,r.end=i)),i}var ne={};function re(e,t){for(var n,r,i,o,a,s,u,l=[],c=0,f=e.length;c<f;c++)(r=e[c]).style&&(n=r.style.display,t?("none"===n&&(l[c]=_.get(r,"display")||null,l[c]||(r.style.display="")),""===r.style.display&&ee(r)&&(l[c]=(u=a=o=void 0,a=(i=r).ownerDocument,s=i.nodeName,(u=ne[s])||(o=a.body.appendChild(a.createElement(s)),u=ce.css(o,"display"),o.parentNode.removeChild(o),"none"===u&&(u="block"),ne[s]=u)))):"none"!==n&&(l[c]="none",_.set(r,"display",n)));for(c=0;c<f;c++)null!=l[c]&&(e[c].style.display=l[c]);return e}ce.fn.extend({show:function(){return re(this,!0)},hide:function(){return re(this)},toggle:function(e){return"boolean"==typeof e?e?this.show():this.hide():this.each(function(){ee(this)?ce(this).show():ce(this).hide()})}});var xe,be,we=/^(?:checkbox|radio)$/i,Te=/<([a-z][^\/\0>\x20\t\r\n\f]*)/i,Ce=/^$|^module$|\/(?:java|ecma)script/i;xe=C.createDocumentFragment().appendChild(C.createElement("div")),(be=C.createElement("input")).setAttribute("type","radio"),be.setAttribute("checked","checked"),be.setAttribute("name","t"),xe.appendChild(be),le.checkClone=xe.cloneNode(!0).cloneNode(!0).lastChild.checked,xe.innerHTML="<textarea>x</textarea>",le.noCloneChecked=!!xe.cloneNode(!0).lastChild.defaultValue,xe.innerHTML="<option></option>",le.option=!!xe.lastChild;var ke={thead:[1,"<table>","</table>"],col:[2,"<table><colgroup>","</colgroup></table>"],tr:[2,"<table><tbody>","</tbody></table>"],td:[3,"<table><tbody><tr>","</tr></tbody></table>"],_default:[0,"",""]};function Se(e,t){var n;return n="undefined"!=typeof e.getElementsByTagName?e.getElementsByTagName(t||"*"):"undefined"!=typeof e.querySelectorAll?e.querySelectorAll(t||"*"):[],void 0===t||t&&fe(e,t)?ce.merge([e],n):n}function Ee(e,t){for(var n=0,r=e.length;n<r;n++)_.set(e[n],"globalEval",!t||_.get(t[n],"globalEval"))}ke.tbody=ke.tfoot=ke.colgroup=ke.caption=ke.thead,ke.th=ke.td,le.option||(ke.optgroup=ke.option=[1,"<select multiple='multiple'>","</select>"]);var je=/<|&#?\w+;/;function Ae(e,t,n,r,i){for(var o,a,s,u,l,c,f=t.createDocumentFragment(),p=[],d=0,h=e.length;d<h;d++)if((o=e[d])||0===o)if("object"===x(o))ce.merge(p,o.nodeType?[o]:o);else if(je.test(o)){a=a||f.appendChild(t.createElement("div")),s=(Te.exec(o)||["",""])[1].toLowerCase(),u=ke[s]||ke._default,a.innerHTML=u[1]+ce.htmlPrefilter(o)+u[2],c=u[0];while(c--)a=a.lastChild;ce.merge(p,a.childNodes),(a=f.firstChild).textContent=""}else p.push(t.createTextNode(o));f.textContent="",d=0;while(o=p[d++])if(r&&-1<ce.inArray(o,r))i&&i.push(o);else if(l=K(o),a=Se(f.appendChild(o),"script"),l&&Ee(a),n){c=0;while(o=a[c++])Ce.test(o.type||"")&&n.push(o)}return f}var De=/^([^.]*)(?:\.(.+)|)/;function Ne(){return!0}function qe(){return!1}function Le(e,t,n,r,i,o){var a,s;if("object"==typeof t){for(s in"string"!=typeof n&&(r=r||n,n=void 0),t)Le(e,s,n,r,t[s],o);return e}if(null==r&&null==i?(i=n,r=n=void 0):null==i&&("string"==typeof n?(i=r,r=void 0):(i=r,r=n,n=void 0)),!1===i)i=qe;else if(!i)return e;return 1===o&&(a=i,(i=function(e){return ce().off(e),a.apply(this,arguments)}).guid=a.guid||(a.guid=ce.guid++)),e.each(function(){ce.event.add(this,t,i,r,n)})}function He(e,r,t){t?(_.set(e,r,!1),ce.event.add(e,r,{namespace:!1,handler:function(e){var t,n=_.get(this,r);if(1&e.isTrigger&&this[r]){if(n)(ce.event.special[r]||{}).delegateType&&e.stopPropagation();else if(n=ae.call(arguments),_.set(this,r,n),this[r](),t=_.get(this,r),_.set(this,r,!1),n!==t)return e.stopImmediatePropagation(),e.preventDefault(),t}else n&&(_.set(this,r,ce.event.trigger(n[0],n.slice(1),this)),e.stopPropagation(),e.isImmediatePropagationStopped=Ne)}})):void 0===_.get(e,r)&&ce.event.add(e,r,Ne)}ce.event={global:{},add:function(t,e,n,r,i){var o,a,s,u,l,c,f,p,d,h,g,v=_.get(t);if($(t)){n.handler&&(n=(o=n).handler,i=o.selector),i&&ce.find.matchesSelector(J,i),n.guid||(n.guid=ce.guid++),(u=v.events)||(u=v.events=Object.create(null)),(a=v.handle)||(a=v.handle=function(e){return"undefined"!=typeof ce&&ce.event.triggered!==e.type?ce.event.dispatch.apply(t,arguments):void 0}),l=(e=(e||"").match(D)||[""]).length;while(l--)d=g=(s=De.exec(e[l])||[])[1],h=(s[2]||"").split(".").sort(),d&&(f=ce.event.special[d]||{},d=(i?f.delegateType:f.bindType)||d,f=ce.event.special[d]||{},c=ce.extend({type:d,origType:g,data:r,handler:n,guid:n.guid,selector:i,needsContext:i&&ce.expr.match.needsContext.test(i),namespace:h.join(".")},o),(p=u[d])||((p=u[d]=[]).delegateCount=0,f.setup&&!1!==f.setup.call(t,r,h,a)||t.addEventListener&&t.addEventListener(d,a)),f.add&&(f.add.call(t,c),c.handler.guid||(c.handler.guid=n.guid)),i?p.splice(p.delegateCount++,0,c):p.push(c),ce.event.global[d]=!0)}},remove:function(e,t,n,r,i){var o,a,s,u,l,c,f,p,d,h,g,v=_.hasData(e)&&_.get(e);if(v&&(u=v.events)){l=(t=(t||"").match(D)||[""]).length;while(l--)if(d=g=(s=De.exec(t[l])||[])[1],h=(s[2]||"").split(".").sort(),d){f=ce.event.special[d]||{},p=u[d=(r?f.delegateType:f.bindType)||d]||[],s=s[2]&&new RegExp("(^|\\.)"+h.join("\\.(?:.*\\.|)")+"(\\.|$)"),a=o=p.length;while(o--)c=p[o],!i&&g!==c.origType||n&&n.guid!==c.guid||s&&!s.test(c.namespace)||r&&r!==c.selector&&("**"!==r||!c.selector)||(p.splice(o,1),c.selector&&p.delegateCount--,f.remove&&f.remove.call(e,c));a&&!p.length&&(f.teardown&&!1!==f.teardown.call(e,h,v.handle)||ce.removeEvent(e,d,v.handle),delete u[d])}else for(d in u)ce.event.remove(e,d+t[l],n,r,!0);ce.isEmptyObject(u)&&_.remove(e,"handle events")}},dispatch:function(e){var t,n,r,i,o,a,s=new Array(arguments.length),u=ce.event.fix(e),l=(_.get(this,"events")||Object.create(null))[u.type]||[],c=ce.event.special[u.type]||{};for(s[0]=u,t=1;t<arguments.length;t++)s[t]=arguments[t];if(u.delegateTarget=this,!c.preDispatch||!1!==c.preDispatch.call(this,u)){a=ce.event.handlers.call(this,u,l),t=0;while((i=a[t++])&&!u.isPropagationStopped()){u.currentTarget=i.elem,n=0;while((o=i.handlers[n++])&&!u.isImmediatePropagationStopped())u.rnamespace&&!1!==o.namespace&&!u.rnamespace.test(o.namespace)||(u.handleObj=o,u.data=o.data,void 0!==(r=((ce.event.special[o.origType]||{}).handle||o.handler).apply(i.elem,s))&&!1===(u.result=r)&&(u.preventDefault(),u.stopPropagation()))}return c.postDispatch&&c.postDispatch.call(this,u),u.result}},handlers:function(e,t){var n,r,i,o,a,s=[],u=t.delegateCount,l=e.target;if(u&&l.nodeType&&!("click"===e.type&&1<=e.button))for(;l!==this;l=l.parentNode||this)if(1===l.nodeType&&("click"!==e.type||!0!==l.disabled)){for(o=[],a={},n=0;n<u;n++)void 0===a[i=(r=t[n]).selector+" "]&&(a[i]=r.needsContext?-1<ce(i,this).index(l):ce.find(i,this,null,[l]).length),a[i]&&o.push(r);o.length&&s.push({elem:l,handlers:o})}return l=this,u<t.length&&s.push({elem:l,handlers:t.slice(u)}),s},addProp:function(t,e){Object.defineProperty(ce.Event.prototype,t,{enumerable:!0,configurable:!0,get:v(e)?function(){if(this.originalEvent)return e(this.originalEvent)}:function(){if(this.originalEvent)return this.originalEvent[t]},set:function(e){Object.defineProperty(this,t,{enumerable:!0,configurable:!0,writable:!0,value:e})}})},fix:function(e){return e[ce.expando]?e:new ce.Event(e)},special:{load:{noBubble:!0},click:{setup:function(e){var t=this||e;return we.test(t.type)&&t.click&&fe(t,"input")&&He(t,"click",!0),!1},trigger:function(e){var t=this||e;return we.test(t.type)&&t.click&&fe(t,"input")&&He(t,"click"),!0},_default:function(e){var t=e.target;return we.test(t.type)&&t.click&&fe(t,"input")&&_.get(t,"click")||fe(t,"a")}},beforeunload:{postDispatch:function(e){void 0!==e.result&&e.originalEvent&&(e.originalEvent.returnValue=e.result)}}}},ce.removeEvent=function(e,t,n){e.removeEventListener&&e.removeEventListener(t,n)},ce.Event=function(e,t){if(!(this instanceof ce.Event))return new ce.Event(e,t);e&&e.type?(this.originalEvent=e,this.type=e.type,this.isDefaultPrevented=e.defaultPrevented||void 0===e.defaultPrevented&&!1===e.returnValue?Ne:qe,this.target=e.target&&3===e.target.nodeType?e.target.parentNode:e.target,this.currentTarget=e.currentTarget,this.relatedTarget=e.relatedTarget):this.type=e,t&&ce.extend(this,t),this.timeStamp=e&&e.timeStamp||Date.now(),this[ce.expando]=!0},ce.Event.prototype={constructor:ce.Event,isDefaultPrevented:qe,isPropagationStopped:qe,isImmediatePropagationStopped:qe,isSimulated:!1,preventDefault:function(){var e=this.originalEvent;this.isDefaultPrevented=Ne,e&&!this.isSimulated&&e.preventDefault()},stopPropagation:function(){var e=this.originalEvent;this.isPropagationStopped=Ne,e&&!this.isSimulated&&e.stopPropagation()},stopImmediatePropagation:function(){var e=this.originalEvent;this.isImmediatePropagationStopped=Ne,e&&!this.isSimulated&&e.stopImmediatePropagation(),this.stopPropagation()}},ce.each({altKey:!0,bubbles:!0,cancelable:!0,changedTouches:!0,ctrlKey:!0,detail:!0,eventPhase:!0,metaKey:!0,pageX:!0,pageY:!0,shiftKey:!0,view:!0,"char":!0,code:!0,charCode:!0,key:!0,keyCode:!0,button:!0,buttons:!0,clientX:!0,clientY:!0,offsetX:!0,offsetY:!0,pointerId:!0,pointerType:!0,screenX:!0,screenY:!0,targetTouches:!0,toElement:!0,touches:!0,which:!0},ce.event.addProp),ce.each({focus:"focusin",blur:"focusout"},function(r,i){function o(e){if(C.documentMode){var t=_.get(this,"handle"),n=ce.event.fix(e);n.type="focusin"===e.type?"focus":"blur",n.isSimulated=!0,t(e),n.target===n.currentTarget&&t(n)}else ce.event.simulate(i,e.target,ce.event.fix(e))}ce.event.special[r]={setup:function(){var e;if(He(this,r,!0),!C.documentMode)return!1;(e=_.get(this,i))||this.addEventListener(i,o),_.set(this,i,(e||0)+1)},trigger:function(){return He(this,r),!0},teardown:function(){var e;if(!C.documentMode)return!1;(e=_.get(this,i)-1)?_.set(this,i,e):(this.removeEventListener(i,o),_.remove(this,i))},_default:function(e){return _.get(e.target,r)},delegateType:i},ce.event.special[i]={setup:function(){var e=this.ownerDocument||this.document||this,t=C.documentMode?this:e,n=_.get(t,i);n||(C.documentMode?this.addEventListener(i,o):e.addEventListener(r,o,!0)),_.set(t,i,(n||0)+1)},teardown:function(){var e=this.ownerDocument||this.document||this,t=C.documentMode?this:e,n=_.get(t,i)-1;n?_.set(t,i,n):(C.documentMode?this.removeEventListener(i,o):e.removeEventListener(r,o,!0),_.remove(t,i))}}}),ce.each({mouseenter:"mouseover",mouseleave:"mouseout",pointerenter:"pointerover",pointerleave:"pointerout"},function(e,i){ce.event.special[e]={delegateType:i,bindType:i,handle:function(e){var t,n=e.relatedTarget,r=e.handleObj;return n&&(n===this||ce.contains(this,n))||(e.type=r.origType,t=r.handler.apply(this,arguments),e.type=i),t}}}),ce.fn.extend({on:function(e,t,n,r){return Le(this,e,t,n,r)},one:function(e,t,n,r){return Le(this,e,t,n,r,1)},off:function(e,t,n){var r,i;if(e&&e.preventDefault&&e.handleObj)return r=e.handleObj,ce(e.delegateTarget).off(r.namespace?r.origType+"."+r.namespace:r.origType,r.selector,r.handler),this;if("object"==typeof e){for(i in e)this.off(i,t,e[i]);return this}return!1!==t&&"function"!=typeof t||(n=t,t=void 0),!1===n&&(n=qe),this.each(function(){ce.event.remove(this,e,n,t)})}});var Oe=/<script|<style|<link/i,Pe=/checked\s*(?:[^=]|=\s*.checked.)/i,Me=/^\s*<!\[CDATA\[|\]\]>\s*$/g;function Re(e,t){return fe(e,"table")&&fe(11!==t.nodeType?t:t.firstChild,"tr")&&ce(e).children("tbody")[0]||e}function Ie(e){return e.type=(null!==e.getAttribute("type"))+"/"+e.type,e}function We(e){return"true/"===(e.type||"").slice(0,5)?e.type=e.type.slice(5):e.removeAttribute("type"),e}function Fe(e,t){var n,r,i,o,a,s;if(1===t.nodeType){if(_.hasData(e)&&(s=_.get(e).events))for(i in _.remove(t,"handle events"),s)for(n=0,r=s[i].length;n<r;n++)ce.event.add(t,i,s[i][n]);z.hasData(e)&&(o=z.access(e),a=ce.extend({},o),z.set(t,a))}}function $e(n,r,i,o){r=g(r);var e,t,a,s,u,l,c=0,f=n.length,p=f-1,d=r[0],h=v(d);if(h||1<f&&"string"==typeof d&&!le.checkClone&&Pe.test(d))return n.each(function(e){var t=n.eq(e);h&&(r[0]=d.call(this,e,t.html())),$e(t,r,i,o)});if(f&&(t=(e=Ae(r,n[0].ownerDocument,!1,n,o)).firstChild,1===e.childNodes.length&&(e=t),t||o)){for(s=(a=ce.map(Se(e,"script"),Ie)).length;c<f;c++)u=e,c!==p&&(u=ce.clone(u,!0,!0),s&&ce.merge(a,Se(u,"script"))),i.call(n[c],u,c);if(s)for(l=a[a.length-1].ownerDocument,ce.map(a,We),c=0;c<s;c++)u=a[c],Ce.test(u.type||"")&&!_.access(u,"globalEval")&&ce.contains(l,u)&&(u.src&&"module"!==(u.type||"").toLowerCase()?ce._evalUrl&&!u.noModule&&ce._evalUrl(u.src,{nonce:u.nonce||u.getAttribute("nonce")},l):m(u.textContent.replace(Me,""),u,l))}return n}function Be(e,t,n){for(var r,i=t?ce.filter(t,e):e,o=0;null!=(r=i[o]);o++)n||1!==r.nodeType||ce.cleanData(Se(r)),r.parentNode&&(n&&K(r)&&Ee(Se(r,"script")),r.parentNode.removeChild(r));return e}ce.extend({htmlPrefilter:function(e){return e},clone:function(e,t,n){var r,i,o,a,s,u,l,c=e.cloneNode(!0),f=K(e);if(!(le.noCloneChecked||1!==e.nodeType&&11!==e.nodeType||ce.isXMLDoc(e)))for(a=Se(c),r=0,i=(o=Se(e)).length;r<i;r++)s=o[r],u=a[r],void 0,"input"===(l=u.nodeName.toLowerCase())&&we.test(s.type)?u.checked=s.checked:"input"!==l&&"textarea"!==l||(u.defaultValue=s.defaultValue);if(t)if(n)for(o=o||Se(e),a=a||Se(c),r=0,i=o.length;r<i;r++)Fe(o[r],a[r]);else Fe(e,c);return 0<(a=Se(c,"script")).length&&Ee(a,!f&&Se(e,"script")),c},cleanData:function(e){for(var t,n,r,i=ce.event.special,o=0;void 0!==(n=e[o]);o++)if($(n)){if(t=n[_.expando]){if(t.events)for(r in t.events)i[r]?ce.event.remove(n,r):ce.removeEvent(n,r,t.handle);n[_.expando]=void 0}n[z.expando]&&(n[z.expando]=void 0)}}}),ce.fn.extend({detach:function(e){return Be(this,e,!0)},remove:function(e){return Be(this,e)},text:function(e){return M(this,function(e){return void 0===e?ce.text(this):this.empty().each(function(){1!==this.nodeType&&11!==this.nodeType&&9!==this.nodeType||(this.textContent=e)})},null,e,arguments.length)},append:function(){return $e(this,arguments,function(e){1!==this.nodeType&&11!==this.nodeType&&9!==this.nodeType||Re(this,e).appendChild(e)})},prepend:function(){return $e(this,arguments,function(e){if(1===this.nodeType||11===this.nodeType||9===this.nodeType){var t=Re(this,e);t.insertBefore(e,t.firstChild)}})},before:function(){return $e(this,arguments,function(e){this.parentNode&&this.parentNode.insertBefore(e,this)})},after:function(){return $e(this,arguments,function(e){this.parentNode&&this.parentNode.insertBefore(e,this.nextSibling)})},empty:function(){for(var e,t=0;null!=(e=this[t]);t++)1===e.nodeType&&(ce.cleanData(Se(e,!1)),e.textContent="");return this},clone:function(e,t){return e=null!=e&&e,t=null==t?e:t,this.map(function(){return ce.clone(this,e,t)})},html:function(e){return M(this,function(e){var t=this[0]||{},n=0,r=this.length;if(void 0===e&&1===t.nodeType)return t.innerHTML;if("string"==typeof e&&!Oe.test(e)&&!ke[(Te.exec(e)||["",""])[1].toLowerCase()]){e=ce.htmlPrefilter(e);try{for(;n<r;n++)1===(t=this[n]||{}).nodeType&&(ce.cleanData(Se(t,!1)),t.innerHTML=e);t=0}catch(e){}}t&&this.empty().append(e)},null,e,arguments.length)},replaceWith:function(){var n=[];return $e(this,arguments,function(e){var t=this.parentNode;ce.inArray(this,n)<0&&(ce.cleanData(Se(this)),t&&t.replaceChild(e,this))},n)}}),ce.each({appendTo:"append",prependTo:"prepend",insertBefore:"before",insertAfter:"after",replaceAll:"replaceWith"},function(e,a){ce.fn[e]=function(e){for(var t,n=[],r=ce(e),i=r.length-1,o=0;o<=i;o++)t=o===i?this:this.clone(!0),ce(r[o])[a](t),s.apply(n,t.get());return this.pushStack(n)}});var _e=new RegExp("^("+G+")(?!px)[a-z%]+$","i"),ze=/^--/,Xe=function(e){var t=e.ownerDocument.defaultView;return t&&t.opener||(t=ie),t.getComputedStyle(e)},Ue=function(e,t,n){var r,i,o={};for(i in t)o[i]=e.style[i],e.style[i]=t[i];for(i in r=n.call(e),t)e.style[i]=o[i];return r},Ve=new RegExp(Q.join("|"),"i");function Ge(e,t,n){var r,i,o,a,s=ze.test(t),u=e.style;return(n=n||Xe(e))&&(a=n.getPropertyValue(t)||n[t],s&&a&&(a=a.replace(ve,"$1")||void 0),""!==a||K(e)||(a=ce.style(e,t)),!le.pixelBoxStyles()&&_e.test(a)&&Ve.test(t)&&(r=u.width,i=u.minWidth,o=u.maxWidth,u.minWidth=u.maxWidth=u.width=a,a=n.width,u.width=r,u.minWidth=i,u.maxWidth=o)),void 0!==a?a+"":a}function Ye(e,t){return{get:function(){if(!e())return(this.get=t).apply(this,arguments);delete this.get}}}!function(){function e(){if(l){u.style.cssText="position:absolute;left:-11111px;width:60px;margin-top:1px;padding:0;border:0",l.style.cssText="position:relative;display:block;box-sizing:border-box;overflow:scroll;margin:auto;border:1px;padding:1px;width:60%;top:1%",J.appendChild(u).appendChild(l);var e=ie.getComputedStyle(l);n="1%"!==e.top,s=12===t(e.marginLeft),l.style.right="60%",o=36===t(e.right),r=36===t(e.width),l.style.position="absolute",i=12===t(l.offsetWidth/3),J.removeChild(u),l=null}}function t(e){return Math.round(parseFloat(e))}var n,r,i,o,a,s,u=C.createElement("div"),l=C.createElement("div");l.style&&(l.style.backgroundClip="content-box",l.cloneNode(!0).style.backgroundClip="",le.clearCloneStyle="content-box"===l.style.backgroundClip,ce.extend(le,{boxSizingReliable:function(){return e(),r},pixelBoxStyles:function(){return e(),o},pixelPosition:function(){return e(),n},reliableMarginLeft:function(){return e(),s},scrollboxSize:function(){return e(),i},reliableTrDimensions:function(){var e,t,n,r;return null==a&&(e=C.createElement("table"),t=C.createElement("tr"),n=C.createElement("div"),e.style.cssText="position:absolute;left:-11111px;border-collapse:separate",t.style.cssText="box-sizing:content-box;border:1px solid",t.style.height="1px",n.style.height="9px",n.style.display="block",J.appendChild(e).appendChild(t).appendChild(n),r=ie.getComputedStyle(t),a=parseInt(r.height,10)+parseInt(r.borderTopWidth,10)+parseInt(r.borderBottomWidth,10)===t.offsetHeight,J.removeChild(e)),a}}))}();var Qe=["Webkit","Moz","ms"],Je=C.createElement("div").style,Ke={};function Ze(e){var t=ce.cssProps[e]||Ke[e];return t||(e in Je?e:Ke[e]=function(e){var t=e[0].toUpperCase()+e.slice(1),n=Qe.length;while(n--)if((e=Qe[n]+t)in Je)return e}(e)||e)}var et=/^(none|table(?!-c[ea]).+)/,tt={position:"absolute",visibility:"hidden",display:"block"},nt={letterSpacing:"0",fontWeight:"400"};function rt(e,t,n){var r=Y.exec(t);return r?Math.max(0,r[2]-(n||0))+(r[3]||"px"):t}function it(e,t,n,r,i,o){var a="width"===t?1:0,s=0,u=0,l=0;if(n===(r?"border":"content"))return 0;for(;a<4;a+=2)"margin"===n&&(l+=ce.css(e,n+Q[a],!0,i)),r?("content"===n&&(u-=ce.css(e,"padding"+Q[a],!0,i)),"margin"!==n&&(u-=ce.css(e,"border"+Q[a]+"Width",!0,i))):(u+=ce.css(e,"padding"+Q[a],!0,i),"padding"!==n?u+=ce.css(e,"border"+Q[a]+"Width",!0,i):s+=ce.css(e,"border"+Q[a]+"Width",!0,i));return!r&&0<=o&&(u+=Math.max(0,Math.ceil(e["offset"+t[0].toUpperCase()+t.slice(1)]-o-u-s-.5))||0),u+l}function ot(e,t,n){var r=Xe(e),i=(!le.boxSizingReliable()||n)&&"border-box"===ce.css(e,"boxSizing",!1,r),o=i,a=Ge(e,t,r),s="offset"+t[0].toUpperCase()+t.slice(1);if(_e.test(a)){if(!n)return a;a="auto"}return(!le.boxSizingReliable()&&i||!le.reliableTrDimensions()&&fe(e,"tr")||"auto"===a||!parseFloat(a)&&"inline"===ce.css(e,"display",!1,r))&&e.getClientRects().length&&(i="border-box"===ce.css(e,"boxSizing",!1,r),(o=s in e)&&(a=e[s])),(a=parseFloat(a)||0)+it(e,t,n||(i?"border":"content"),o,r,a)+"px"}function at(e,t,n,r,i){return new at.prototype.init(e,t,n,r,i)}ce.extend({cssHooks:{opacity:{get:function(e,t){if(t){var n=Ge(e,"opacity");return""===n?"1":n}}}},cssNumber:{animationIterationCount:!0,aspectRatio:!0,borderImageSlice:!0,columnCount:!0,flexGrow:!0,flexShrink:!0,fontWeight:!0,gridArea:!0,gridColumn:!0,gridColumnEnd:!0,gridColumnStart:!0,gridRow:!0,gridRowEnd:!0,gridRowStart:!0,lineHeight:!0,opacity:!0,order:!0,orphans:!0,scale:!0,widows:!0,zIndex:!0,zoom:!0,fillOpacity:!0,floodOpacity:!0,stopOpacity:!0,strokeMiterlimit:!0,strokeOpacity:!0},cssProps:{},style:function(e,t,n,r){if(e&&3!==e.nodeType&&8!==e.nodeType&&e.style){var i,o,a,s=F(t),u=ze.test(t),l=e.style;if(u||(t=Ze(s)),a=ce.cssHooks[t]||ce.cssHooks[s],void 0===n)return a&&"get"in a&&void 0!==(i=a.get(e,!1,r))?i:l[t];"string"===(o=typeof n)&&(i=Y.exec(n))&&i[1]&&(n=te(e,t,i),o="number"),null!=n&&n==n&&("number"!==o||u||(n+=i&&i[3]||(ce.cssNumber[s]?"":"px")),le.clearCloneStyle||""!==n||0!==t.indexOf("background")||(l[t]="inherit"),a&&"set"in a&&void 0===(n=a.set(e,n,r))||(u?l.setProperty(t,n):l[t]=n))}},css:function(e,t,n,r){var i,o,a,s=F(t);return ze.test(t)||(t=Ze(s)),(a=ce.cssHooks[t]||ce.cssHooks[s])&&"get"in a&&(i=a.get(e,!0,n)),void 0===i&&(i=Ge(e,t,r)),"normal"===i&&t in nt&&(i=nt[t]),""===n||n?(o=parseFloat(i),!0===n||isFinite(o)?o||0:i):i}}),ce.each(["height","width"],function(e,u){ce.cssHooks[u]={get:function(e,t,n){if(t)return!et.test(ce.css(e,"display"))||e.getClientRects().length&&e.getBoundingClientRect().width?ot(e,u,n):Ue(e,tt,function(){return ot(e,u,n)})},set:function(e,t,n){var r,i=Xe(e),o=!le.scrollboxSize()&&"absolute"===i.position,a=(o||n)&&"border-box"===ce.css(e,"boxSizing",!1,i),s=n?it(e,u,n,a,i):0;return a&&o&&(s-=Math.ceil(e["offset"+u[0].toUpperCase()+u.slice(1)]-parseFloat(i[u])-it(e,u,"border",!1,i)-.5)),s&&(r=Y.exec(t))&&"px"!==(r[3]||"px")&&(e.style[u]=t,t=ce.css(e,u)),rt(0,t,s)}}}),ce.cssHooks.marginLeft=Ye(le.reliableMarginLeft,function(e,t){if(t)return(parseFloat(Ge(e,"marginLeft"))||e.getBoundingClientRect().left-Ue(e,{marginLeft:0},function(){return e.getBoundingClientRect().left}))+"px"}),ce.each({margin:"",padding:"",border:"Width"},function(i,o){ce.cssHooks[i+o]={expand:function(e){for(var t=0,n={},r="string"==typeof e?e.split(" "):[e];t<4;t++)n[i+Q[t]+o]=r[t]||r[t-2]||r[0];return n}},"margin"!==i&&(ce.cssHooks[i+o].set=rt)}),ce.fn.extend({css:function(e,t){return M(this,function(e,t,n){var r,i,o={},a=0;if(Array.isArray(t)){for(r=Xe(e),i=t.length;a<i;a++)o[t[a]]=ce.css(e,t[a],!1,r);return o}return void 0!==n?ce.style(e,t,n):ce.css(e,t)},e,t,1<arguments.length)}}),((ce.Tween=at).prototype={constructor:at,init:function(e,t,n,r,i,o){this.elem=e,this.prop=n,this.easing=i||ce.easing._default,this.options=t,this.start=this.now=this.cur(),this.end=r,this.unit=o||(ce.cssNumber[n]?"":"px")},cur:function(){var e=at.propHooks[this.prop];return e&&e.get?e.get(this):at.propHooks._default.get(this)},run:function(e){var t,n=at.propHooks[this.prop];return this.options.duration?this.pos=t=ce.easing[this.easing](e,this.options.duration*e,0,1,this.options.duration):this.pos=t=e,this.now=(this.end-this.start)*t+this.start,this.options.step&&this.options.step.call(this.elem,this.now,this),n&&n.set?n.set(this):at.propHooks._default.set(this),this}}).init.prototype=at.prototype,(at.propHooks={_default:{get:function(e){var t;return 1!==e.elem.nodeType||null!=e.elem[e.prop]&&null==e.elem.style[e.prop]?e.elem[e.prop]:(t=ce.css(e.elem,e.prop,""))&&"auto"!==t?t:0},set:function(e){ce.fx.step[e.prop]?ce.fx.step[e.prop](e):1!==e.elem.nodeType||!ce.cssHooks[e.prop]&&null==e.elem.style[Ze(e.prop)]?e.elem[e.prop]=e.now:ce.style(e.elem,e.prop,e.now+e.unit)}}}).scrollTop=at.propHooks.scrollLeft={set:function(e){e.elem.nodeType&&e.elem.parentNode&&(e.elem[e.prop]=e.now)}},ce.easing={linear:function(e){return e},swing:function(e){return.5-Math.cos(e*Math.PI)/2},_default:"swing"},ce.fx=at.prototype.init,ce.fx.step={};var st,ut,lt,ct,ft=/^(?:toggle|show|hide)$/,pt=/queueHooks$/;function dt(){ut&&(!1===C.hidden&&ie.requestAnimationFrame?ie.requestAnimationFrame(dt):ie.setTimeout(dt,ce.fx.interval),ce.fx.tick())}function ht(){return ie.setTimeout(function(){st=void 0}),st=Date.now()}function gt(e,t){var n,r=0,i={height:e};for(t=t?1:0;r<4;r+=2-t)i["margin"+(n=Q[r])]=i["padding"+n]=e;return t&&(i.opacity=i.width=e),i}function vt(e,t,n){for(var r,i=(yt.tweeners[t]||[]).concat(yt.tweeners["*"]),o=0,a=i.length;o<a;o++)if(r=i[o].call(n,t,e))return r}function yt(o,e,t){var n,a,r=0,i=yt.prefilters.length,s=ce.Deferred().always(function(){delete u.elem}),u=function(){if(a)return!1;for(var e=st||ht(),t=Math.max(0,l.startTime+l.duration-e),n=1-(t/l.duration||0),r=0,i=l.tweens.length;r<i;r++)l.tweens[r].run(n);return s.notifyWith(o,[l,n,t]),n<1&&i?t:(i||s.notifyWith(o,[l,1,0]),s.resolveWith(o,[l]),!1)},l=s.promise({elem:o,props:ce.extend({},e),opts:ce.extend(!0,{specialEasing:{},easing:ce.easing._default},t),originalProperties:e,originalOptions:t,startTime:st||ht(),duration:t.duration,tweens:[],createTween:function(e,t){var n=ce.Tween(o,l.opts,e,t,l.opts.specialEasing[e]||l.opts.easing);return l.tweens.push(n),n},stop:function(e){var t=0,n=e?l.tweens.length:0;if(a)return this;for(a=!0;t<n;t++)l.tweens[t].run(1);return e?(s.notifyWith(o,[l,1,0]),s.resolveWith(o,[l,e])):s.rejectWith(o,[l,e]),this}}),c=l.props;for(!function(e,t){var n,r,i,o,a;for(n in e)if(i=t[r=F(n)],o=e[n],Array.isArray(o)&&(i=o[1],o=e[n]=o[0]),n!==r&&(e[r]=o,delete e[n]),(a=ce.cssHooks[r])&&"expand"in a)for(n in o=a.expand(o),delete e[r],o)n in e||(e[n]=o[n],t[n]=i);else t[r]=i}(c,l.opts.specialEasing);r<i;r++)if(n=yt.prefilters[r].call(l,o,c,l.opts))return v(n.stop)&&(ce._queueHooks(l.elem,l.opts.queue).stop=n.stop.bind(n)),n;return ce.map(c,vt,l),v(l.opts.start)&&l.opts.start.call(o,l),l.progress(l.opts.progress).done(l.opts.done,l.opts.complete).fail(l.opts.fail).always(l.opts.always),ce.fx.timer(ce.extend(u,{elem:o,anim:l,queue:l.opts.queue})),l}ce.Animation=ce.extend(yt,{tweeners:{"*":[function(e,t){var n=this.createTween(e,t);return te(n.elem,e,Y.exec(t),n),n}]},tweener:function(e,t){v(e)?(t=e,e=["*"]):e=e.match(D);for(var n,r=0,i=e.length;r<i;r++)n=e[r],yt.tweeners[n]=yt.tweeners[n]||[],yt.tweeners[n].unshift(t)},prefilters:[function(e,t,n){var r,i,o,a,s,u,l,c,f="width"in t||"height"in t,p=this,d={},h=e.style,g=e.nodeType&&ee(e),v=_.get(e,"fxshow");for(r in n.queue||(null==(a=ce._queueHooks(e,"fx")).unqueued&&(a.unqueued=0,s=a.empty.fire,a.empty.fire=function(){a.unqueued||s()}),a.unqueued++,p.always(function(){p.always(function(){a.unqueued--,ce.queue(e,"fx").length||a.empty.fire()})})),t)if(i=t[r],ft.test(i)){if(delete t[r],o=o||"toggle"===i,i===(g?"hide":"show")){if("show"!==i||!v||void 0===v[r])continue;g=!0}d[r]=v&&v[r]||ce.style(e,r)}if((u=!ce.isEmptyObject(t))||!ce.isEmptyObject(d))for(r in f&&1===e.nodeType&&(n.overflow=[h.overflow,h.overflowX,h.overflowY],null==(l=v&&v.display)&&(l=_.get(e,"display")),"none"===(c=ce.css(e,"display"))&&(l?c=l:(re([e],!0),l=e.style.display||l,c=ce.css(e,"display"),re([e]))),("inline"===c||"inline-block"===c&&null!=l)&&"none"===ce.css(e,"float")&&(u||(p.done(function(){h.display=l}),null==l&&(c=h.display,l="none"===c?"":c)),h.display="inline-block")),n.overflow&&(h.overflow="hidden",p.always(function(){h.overflow=n.overflow[0],h.overflowX=n.overflow[1],h.overflowY=n.overflow[2]})),u=!1,d)u||(v?"hidden"in v&&(g=v.hidden):v=_.access(e,"fxshow",{display:l}),o&&(v.hidden=!g),g&&re([e],!0),p.done(function(){for(r in g||re([e]),_.remove(e,"fxshow"),d)ce.style(e,r,d[r])})),u=vt(g?v[r]:0,r,p),r in v||(v[r]=u.start,g&&(u.end=u.start,u.start=0))}],prefilter:function(e,t){t?yt.prefilters.unshift(e):yt.prefilters.push(e)}}),ce.speed=function(e,t,n){var r=e&&"object"==typeof e?ce.extend({},e):{complete:n||!n&&t||v(e)&&e,duration:e,easing:n&&t||t&&!v(t)&&t};return ce.fx.off?r.duration=0:"number"!=typeof r.duration&&(r.duration in ce.fx.speeds?r.duration=ce.fx.speeds[r.duration]:r.duration=ce.fx.speeds._default),null!=r.queue&&!0!==r.queue||(r.queue="fx"),r.old=r.complete,r.complete=function(){v(r.old)&&r.old.call(this),r.queue&&ce.dequeue(this,r.queue)},r},ce.fn.extend({fadeTo:function(e,t,n,r){return this.filter(ee).css("opacity",0).show().end().animate({opacity:t},e,n,r)},animate:function(t,e,n,r){var i=ce.isEmptyObject(t),o=ce.speed(e,n,r),a=function(){var e=yt(this,ce.extend({},t),o);(i||_.get(this,"finish"))&&e.stop(!0)};return a.finish=a,i||!1===o.queue?this.each(a):this.queue(o.queue,a)},stop:function(i,e,o){var a=function(e){var t=e.stop;delete e.stop,t(o)};return"string"!=typeof i&&(o=e,e=i,i=void 0),e&&this.queue(i||"fx",[]),this.each(function(){var e=!0,t=null!=i&&i+"queueHooks",n=ce.timers,r=_.get(this);if(t)r[t]&&r[t].stop&&a(r[t]);else for(t in r)r[t]&&r[t].stop&&pt.test(t)&&a(r[t]);for(t=n.length;t--;)n[t].elem!==this||null!=i&&n[t].queue!==i||(n[t].anim.stop(o),e=!1,n.splice(t,1));!e&&o||ce.dequeue(this,i)})},finish:function(a){return!1!==a&&(a=a||"fx"),this.each(function(){var e,t=_.get(this),n=t[a+"queue"],r=t[a+"queueHooks"],i=ce.timers,o=n?n.length:0;for(t.finish=!0,ce.queue(this,a,[]),r&&r.stop&&r.stop.call(this,!0),e=i.length;e--;)i[e].elem===this&&i[e].queue===a&&(i[e].anim.stop(!0),i.splice(e,1));for(e=0;e<o;e++)n[e]&&n[e].finish&&n[e].finish.call(this);delete t.finish})}}),ce.each(["toggle","show","hide"],function(e,r){var i=ce.fn[r];ce.fn[r]=function(e,t,n){return null==e||"boolean"==typeof e?i.apply(this,arguments):this.animate(gt(r,!0),e,t,n)}}),ce.each({slideDown:gt("show"),slideUp:gt("hide"),slideToggle:gt("toggle"),fadeIn:{opacity:"show"},fadeOut:{opacity:"hide"},fadeToggle:{opacity:"toggle"}},function(e,r){ce.fn[e]=function(e,t,n){return this.animate(r,e,t,n)}}),ce.timers=[],ce.fx.tick=function(){var e,t=0,n=ce.timers;for(st=Date.now();t<n.length;t++)(e=n[t])()||n[t]!==e||n.splice(t--,1);n.length||ce.fx.stop(),st=void 0},ce.fx.timer=function(e){ce.timers.push(e),ce.fx.start()},ce.fx.interval=13,ce.fx.start=function(){ut||(ut=!0,dt())},ce.fx.stop=function(){ut=null},ce.fx.speeds={slow:600,fast:200,_default:400},ce.fn.delay=function(r,e){return r=ce.fx&&ce.fx.speeds[r]||r,e=e||"fx",this.queue(e,function(e,t){var n=ie.setTimeout(e,r);t.stop=function(){ie.clearTimeout(n)}})},lt=C.createElement("input"),ct=C.createElement("select").appendChild(C.createElement("option")),lt.type="checkbox",le.checkOn=""!==lt.value,le.optSelected=ct.selected,(lt=C.createElement("input")).value="t",lt.type="radio",le.radioValue="t"===lt.value;var mt,xt=ce.expr.attrHandle;ce.fn.extend({attr:function(e,t){return M(this,ce.attr,e,t,1<arguments.length)},removeAttr:function(e){return this.each(function(){ce.removeAttr(this,e)})}}),ce.extend({attr:function(e,t,n){var r,i,o=e.nodeType;if(3!==o&&8!==o&&2!==o)return"undefined"==typeof e.getAttribute?ce.prop(e,t,n):(1===o&&ce.isXMLDoc(e)||(i=ce.attrHooks[t.toLowerCase()]||(ce.expr.match.bool.test(t)?mt:void 0)),void 0!==n?null===n?void ce.removeAttr(e,t):i&&"set"in i&&void 0!==(r=i.set(e,n,t))?r:(e.setAttribute(t,n+""),n):i&&"get"in i&&null!==(r=i.get(e,t))?r:null==(r=ce.find.attr(e,t))?void 0:r)},attrHooks:{type:{set:function(e,t){if(!le.radioValue&&"radio"===t&&fe(e,"input")){var n=e.value;return e.setAttribute("type",t),n&&(e.value=n),t}}}},removeAttr:function(e,t){var n,r=0,i=t&&t.match(D);if(i&&1===e.nodeType)while(n=i[r++])e.removeAttribute(n)}}),mt={set:function(e,t,n){return!1===t?ce.removeAttr(e,n):e.setAttribute(n,n),n}},ce.each(ce.expr.match.bool.source.match(/\w+/g),function(e,t){var a=xt[t]||ce.find.attr;xt[t]=function(e,t,n){var r,i,o=t.toLowerCase();return n||(i=xt[o],xt[o]=r,r=null!=a(e,t,n)?o:null,xt[o]=i),r}});var bt=/^(?:input|select|textarea|button)$/i,wt=/^(?:a|area)$/i;function Tt(e){return(e.match(D)||[]).join(" ")}function Ct(e){return e.getAttribute&&e.getAttribute("class")||""}function kt(e){return Array.isArray(e)?e:"string"==typeof e&&e.match(D)||[]}ce.fn.extend({prop:function(e,t){return M(this,ce.prop,e,t,1<arguments.length)},removeProp:function(e){return this.each(function(){delete this[ce.propFix[e]||e]})}}),ce.extend({prop:function(e,t,n){var r,i,o=e.nodeType;if(3!==o&&8!==o&&2!==o)return 1===o&&ce.isXMLDoc(e)||(t=ce.propFix[t]||t,i=ce.propHooks[t]),void 0!==n?i&&"set"in i&&void 0!==(r=i.set(e,n,t))?r:e[t]=n:i&&"get"in i&&null!==(r=i.get(e,t))?r:e[t]},propHooks:{tabIndex:{get:function(e){var t=ce.find.attr(e,"tabindex");return t?parseInt(t,10):bt.test(e.nodeName)||wt.test(e.nodeName)&&e.href?0:-1}}},propFix:{"for":"htmlFor","class":"className"}}),le.optSelected||(ce.propHooks.selected={get:function(e){var t=e.parentNode;return t&&t.parentNode&&t.parentNode.selectedIndex,null},set:function(e){var t=e.parentNode;t&&(t.selectedIndex,t.parentNode&&t.parentNode.selectedIndex)}}),ce.each(["tabIndex","readOnly","maxLength","cellSpacing","cellPadding","rowSpan","colSpan","useMap","frameBorder","contentEditable"],function(){ce.propFix[this.toLowerCase()]=this}),ce.fn.extend({addClass:function(t){var e,n,r,i,o,a;return v(t)?this.each(function(e){ce(this).addClass(t.call(this,e,Ct(this)))}):(e=kt(t)).length?this.each(function(){if(r=Ct(this),n=1===this.nodeType&&" "+Tt(r)+" "){for(o=0;o<e.length;o++)i=e[o],n.indexOf(" "+i+" ")<0&&(n+=i+" ");a=Tt(n),r!==a&&this.setAttribute("class",a)}}):this},removeClass:function(t){var e,n,r,i,o,a;return v(t)?this.each(function(e){ce(this).removeClass(t.call(this,e,Ct(this)))}):arguments.length?(e=kt(t)).length?this.each(function(){if(r=Ct(this),n=1===this.nodeType&&" "+Tt(r)+" "){for(o=0;o<e.length;o++){i=e[o];while(-1<n.indexOf(" "+i+" "))n=n.replace(" "+i+" "," ")}a=Tt(n),r!==a&&this.setAttribute("class",a)}}):this:this.attr("class","")},toggleClass:function(t,n){var e,r,i,o,a=typeof t,s="string"===a||Array.isArray(t);return v(t)?this.each(function(e){ce(this).toggleClass(t.call(this,e,Ct(this),n),n)}):"boolean"==typeof n&&s?n?this.addClass(t):this.removeClass(t):(e=kt(t),this.each(function(){if(s)for(o=ce(this),i=0;i<e.length;i++)r=e[i],o.hasClass(r)?o.removeClass(r):o.addClass(r);else void 0!==t&&"boolean"!==a||((r=Ct(this))&&_.set(this,"__className__",r),this.setAttribute&&this.setAttribute("class",r||!1===t?"":_.get(this,"__className__")||""))}))},hasClass:function(e){var t,n,r=0;t=" "+e+" ";while(n=this[r++])if(1===n.nodeType&&-1<(" "+Tt(Ct(n))+" ").indexOf(t))return!0;return!1}});var St=/\r/g;ce.fn.extend({val:function(n){var r,e,i,t=this[0];return arguments.length?(i=v(n),this.each(function(e){var t;1===this.nodeType&&(null==(t=i?n.call(this,e,ce(this).val()):n)?t="":"number"==typeof t?t+="":Array.isArray(t)&&(t=ce.map(t,function(e){return null==e?"":e+""})),(r=ce.valHooks[this.type]||ce.valHooks[this.nodeName.toLowerCase()])&&"set"in r&&void 0!==r.set(this,t,"value")||(this.value=t))})):t?(r=ce.valHooks[t.type]||ce.valHooks[t.nodeName.toLowerCase()])&&"get"in r&&void 0!==(e=r.get(t,"value"))?e:"string"==typeof(e=t.value)?e.replace(St,""):null==e?"":e:void 0}}),ce.extend({valHooks:{option:{get:function(e){var t=ce.find.attr(e,"value");return null!=t?t:Tt(ce.text(e))}},select:{get:function(e){var t,n,r,i=e.options,o=e.selectedIndex,a="select-one"===e.type,s=a?null:[],u=a?o+1:i.length;for(r=o<0?u:a?o:0;r<u;r++)if(((n=i[r]).selected||r===o)&&!n.disabled&&(!n.parentNode.disabled||!fe(n.parentNode,"optgroup"))){if(t=ce(n).val(),a)return t;s.push(t)}return s},set:function(e,t){var n,r,i=e.options,o=ce.makeArray(t),a=i.length;while(a--)((r=i[a]).selected=-1<ce.inArray(ce.valHooks.option.get(r),o))&&(n=!0);return n||(e.selectedIndex=-1),o}}}}),ce.each(["radio","checkbox"],function(){ce.valHooks[this]={set:function(e,t){if(Array.isArray(t))return e.checked=-1<ce.inArray(ce(e).val(),t)}},le.checkOn||(ce.valHooks[this].get=function(e){return null===e.getAttribute("value")?"on":e.value})});var Et=ie.location,jt={guid:Date.now()},At=/\?/;ce.parseXML=function(e){var t,n;if(!e||"string"!=typeof e)return null;try{t=(new ie.DOMParser).parseFromString(e,"text/xml")}catch(e){}return n=t&&t.getElementsByTagName("parsererror")[0],t&&!n||ce.error("Invalid XML: "+(n?ce.map(n.childNodes,function(e){return e.textContent}).join("\n"):e)),t};var Dt=/^(?:focusinfocus|focusoutblur)$/,Nt=function(e){e.stopPropagation()};ce.extend(ce.event,{trigger:function(e,t,n,r){var i,o,a,s,u,l,c,f,p=[n||C],d=ue.call(e,"type")?e.type:e,h=ue.call(e,"namespace")?e.namespace.split("."):[];if(o=f=a=n=n||C,3!==n.nodeType&&8!==n.nodeType&&!Dt.test(d+ce.event.triggered)&&(-1<d.indexOf(".")&&(d=(h=d.split(".")).shift(),h.sort()),u=d.indexOf(":")<0&&"on"+d,(e=e[ce.expando]?e:new ce.Event(d,"object"==typeof e&&e)).isTrigger=r?2:3,e.namespace=h.join("."),e.rnamespace=e.namespace?new RegExp("(^|\\.)"+h.join("\\.(?:.*\\.|)")+"(\\.|$)"):null,e.result=void 0,e.target||(e.target=n),t=null==t?[e]:ce.makeArray(t,[e]),c=ce.event.special[d]||{},r||!c.trigger||!1!==c.trigger.apply(n,t))){if(!r&&!c.noBubble&&!y(n)){for(s=c.delegateType||d,Dt.test(s+d)||(o=o.parentNode);o;o=o.parentNode)p.push(o),a=o;a===(n.ownerDocument||C)&&p.push(a.defaultView||a.parentWindow||ie)}i=0;while((o=p[i++])&&!e.isPropagationStopped())f=o,e.type=1<i?s:c.bindType||d,(l=(_.get(o,"events")||Object.create(null))[e.type]&&_.get(o,"handle"))&&l.apply(o,t),(l=u&&o[u])&&l.apply&&$(o)&&(e.result=l.apply(o,t),!1===e.result&&e.preventDefault());return e.type=d,r||e.isDefaultPrevented()||c._default&&!1!==c._default.apply(p.pop(),t)||!$(n)||u&&v(n[d])&&!y(n)&&((a=n[u])&&(n[u]=null),ce.event.triggered=d,e.isPropagationStopped()&&f.addEventListener(d,Nt),n[d](),e.isPropagationStopped()&&f.removeEventListener(d,Nt),ce.event.triggered=void 0,a&&(n[u]=a)),e.result}},simulate:function(e,t,n){var r=ce.extend(new ce.Event,n,{type:e,isSimulated:!0});ce.event.trigger(r,null,t)}}),ce.fn.extend({trigger:function(e,t){return this.each(function(){ce.event.trigger(e,t,this)})},triggerHandler:function(e,t){var n=this[0];if(n)return ce.event.trigger(e,t,n,!0)}});var qt=/\[\]$/,Lt=/\r?\n/g,Ht=/^(?:submit|button|image|reset|file)$/i,Ot=/^(?:input|select|textarea|keygen)/i;function Pt(n,e,r,i){var t;if(Array.isArray(e))ce.each(e,function(e,t){r||qt.test(n)?i(n,t):Pt(n+"["+("object"==typeof t&&null!=t?e:"")+"]",t,r,i)});else if(r||"object"!==x(e))i(n,e);else for(t in e)Pt(n+"["+t+"]",e[t],r,i)}ce.param=function(e,t){var n,r=[],i=function(e,t){var n=v(t)?t():t;r[r.length]=encodeURIComponent(e)+"="+encodeURIComponent(null==n?"":n)};if(null==e)return"";if(Array.isArray(e)||e.jquery&&!ce.isPlainObject(e))ce.each(e,function(){i(this.name,this.value)});else for(n in e)Pt(n,e[n],t,i);return r.join("&")},ce.fn.extend({serialize:function(){return ce.param(this.serializeArray())},serializeArray:function(){return this.map(function(){var e=ce.prop(this,"elements");return e?ce.makeArray(e):this}).filter(function(){var e=this.type;return this.name&&!ce(this).is(":disabled")&&Ot.test(this.nodeName)&&!Ht.test(e)&&(this.checked||!we.test(e))}).map(function(e,t){var n=ce(this).val();return null==n?null:Array.isArray(n)?ce.map(n,function(e){return{name:t.name,value:e.replace(Lt,"\r\n")}}):{name:t.name,value:n.replace(Lt,"\r\n")}}).get()}});var Mt=/%20/g,Rt=/#.*$/,It=/([?&])_=[^&]*/,Wt=/^(.*?):[ \t]*([^\r\n]*)$/gm,Ft=/^(?:GET|HEAD)$/,$t=/^\/\//,Bt={},_t={},zt="*/".concat("*"),Xt=C.createElement("a");function Ut(o){return function(e,t){"string"!=typeof e&&(t=e,e="*");var n,r=0,i=e.toLowerCase().match(D)||[];if(v(t))while(n=i[r++])"+"===n[0]?(n=n.slice(1)||"*",(o[n]=o[n]||[]).unshift(t)):(o[n]=o[n]||[]).push(t)}}function Vt(t,i,o,a){var s={},u=t===_t;function l(e){var r;return s[e]=!0,ce.each(t[e]||[],function(e,t){var n=t(i,o,a);return"string"!=typeof n||u||s[n]?u?!(r=n):void 0:(i.dataTypes.unshift(n),l(n),!1)}),r}return l(i.dataTypes[0])||!s["*"]&&l("*")}function Gt(e,t){var n,r,i=ce.ajaxSettings.flatOptions||{};for(n in t)void 0!==t[n]&&((i[n]?e:r||(r={}))[n]=t[n]);return r&&ce.extend(!0,e,r),e}Xt.href=Et.href,ce.extend({active:0,lastModified:{},etag:{},ajaxSettings:{url:Et.href,type:"GET",isLocal:/^(?:about|app|app-storage|.+-extension|file|res|widget):$/.test(Et.protocol),global:!0,processData:!0,async:!0,contentType:"application/x-www-form-urlencoded; charset=UTF-8",accepts:{"*":zt,text:"text/plain",html:"text/html",xml:"application/xml, text/xml",json:"application/json, text/javascript"},contents:{xml:/\bxml\b/,html:/\bhtml/,json:/\bjson\b/},responseFields:{xml:"responseXML",text:"responseText",json:"responseJSON"},converters:{"* text":String,"text html":!0,"text json":JSON.parse,"text xml":ce.parseXML},flatOptions:{url:!0,context:!0}},ajaxSetup:function(e,t){return t?Gt(Gt(e,ce.ajaxSettings),t):Gt(ce.ajaxSettings,e)},ajaxPrefilter:Ut(Bt),ajaxTransport:Ut(_t),ajax:function(e,t){"object"==typeof e&&(t=e,e=void 0),t=t||{};var c,f,p,n,d,r,h,g,i,o,v=ce.ajaxSetup({},t),y=v.context||v,m=v.context&&(y.nodeType||y.jquery)?ce(y):ce.event,x=ce.Deferred(),b=ce.Callbacks("once memory"),w=v.statusCode||{},a={},s={},u="canceled",T={readyState:0,getResponseHeader:function(e){var t;if(h){if(!n){n={};while(t=Wt.exec(p))n[t[1].toLowerCase()+" "]=(n[t[1].toLowerCase()+" "]||[]).concat(t[2])}t=n[e.toLowerCase()+" "]}return null==t?null:t.join(", ")},getAllResponseHeaders:function(){return h?p:null},setRequestHeader:function(e,t){return null==h&&(e=s[e.toLowerCase()]=s[e.toLowerCase()]||e,a[e]=t),this},overrideMimeType:function(e){return null==h&&(v.mimeType=e),this},statusCode:function(e){var t;if(e)if(h)T.always(e[T.status]);else for(t in e)w[t]=[w[t],e[t]];return this},abort:function(e){var t=e||u;return c&&c.abort(t),l(0,t),this}};if(x.promise(T),v.url=((e||v.url||Et.href)+"").replace($t,Et.protocol+"//"),v.type=t.method||t.type||v.method||v.type,v.dataTypes=(v.dataType||"*").toLowerCase().match(D)||[""],null==v.crossDomain){r=C.createElement("a");try{r.href=v.url,r.href=r.href,v.crossDomain=Xt.protocol+"//"+Xt.host!=r.protocol+"//"+r.host}catch(e){v.crossDomain=!0}}if(v.data&&v.processData&&"string"!=typeof v.data&&(v.data=ce.param(v.data,v.traditional)),Vt(Bt,v,t,T),h)return T;for(i in(g=ce.event&&v.global)&&0==ce.active++&&ce.event.trigger("ajaxStart"),v.type=v.type.toUpperCase(),v.hasContent=!Ft.test(v.type),f=v.url.replace(Rt,""),v.hasContent?v.data&&v.processData&&0===(v.contentType||"").indexOf("application/x-www-form-urlencoded")&&(v.data=v.data.replace(Mt,"+")):(o=v.url.slice(f.length),v.data&&(v.processData||"string"==typeof v.data)&&(f+=(At.test(f)?"&":"?")+v.data,delete v.data),!1===v.cache&&(f=f.replace(It,"$1"),o=(At.test(f)?"&":"?")+"_="+jt.guid+++o),v.url=f+o),v.ifModified&&(ce.lastModified[f]&&T.setRequestHeader("If-Modified-Since",ce.lastModified[f]),ce.etag[f]&&T.setRequestHeader("If-None-Match",ce.etag[f])),(v.data&&v.hasContent&&!1!==v.contentType||t.contentType)&&T.setRequestHeader("Content-Type",v.contentType),T.setRequestHeader("Accept",v.dataTypes[0]&&v.accepts[v.dataTypes[0]]?v.accepts[v.dataTypes[0]]+("*"!==v.dataTypes[0]?", "+zt+"; q=0.01":""):v.accepts["*"]),v.headers)T.setRequestHeader(i,v.headers[i]);if(v.beforeSend&&(!1===v.beforeSend.call(y,T,v)||h))return T.abort();if(u="abort",b.add(v.complete),T.done(v.success),T.fail(v.error),c=Vt(_t,v,t,T)){if(T.readyState=1,g&&m.trigger("ajaxSend",[T,v]),h)return T;v.async&&0<v.timeout&&(d=ie.setTimeout(function(){T.abort("timeout")},v.timeout));try{h=!1,c.send(a,l)}catch(e){if(h)throw e;l(-1,e)}}else l(-1,"No Transport");function l(e,t,n,r){var i,o,a,s,u,l=t;h||(h=!0,d&&ie.clearTimeout(d),c=void 0,p=r||"",T.readyState=0<e?4:0,i=200<=e&&e<300||304===e,n&&(s=function(e,t,n){var r,i,o,a,s=e.contents,u=e.dataTypes;while("*"===u[0])u.shift(),void 0===r&&(r=e.mimeType||t.getResponseHeader("Content-Type"));if(r)for(i in s)if(s[i]&&s[i].test(r)){u.unshift(i);break}if(u[0]in n)o=u[0];else{for(i in n){if(!u[0]||e.converters[i+" "+u[0]]){o=i;break}a||(a=i)}o=o||a}if(o)return o!==u[0]&&u.unshift(o),n[o]}(v,T,n)),!i&&-1<ce.inArray("script",v.dataTypes)&&ce.inArray("json",v.dataTypes)<0&&(v.converters["text script"]=function(){}),s=function(e,t,n,r){var i,o,a,s,u,l={},c=e.dataTypes.slice();if(c[1])for(a in e.converters)l[a.toLowerCase()]=e.converters[a];o=c.shift();while(o)if(e.responseFields[o]&&(n[e.responseFields[o]]=t),!u&&r&&e.dataFilter&&(t=e.dataFilter(t,e.dataType)),u=o,o=c.shift())if("*"===o)o=u;else if("*"!==u&&u!==o){if(!(a=l[u+" "+o]||l["* "+o]))for(i in l)if((s=i.split(" "))[1]===o&&(a=l[u+" "+s[0]]||l["* "+s[0]])){!0===a?a=l[i]:!0!==l[i]&&(o=s[0],c.unshift(s[1]));break}if(!0!==a)if(a&&e["throws"])t=a(t);else try{t=a(t)}catch(e){return{state:"parsererror",error:a?e:"No conversion from "+u+" to "+o}}}return{state:"success",data:t}}(v,s,T,i),i?(v.ifModified&&((u=T.getResponseHeader("Last-Modified"))&&(ce.lastModified[f]=u),(u=T.getResponseHeader("etag"))&&(ce.etag[f]=u)),204===e||"HEAD"===v.type?l="nocontent":304===e?l="notmodified":(l=s.state,o=s.data,i=!(a=s.error))):(a=l,!e&&l||(l="error",e<0&&(e=0))),T.status=e,T.statusText=(t||l)+"",i?x.resolveWith(y,[o,l,T]):x.rejectWith(y,[T,l,a]),T.statusCode(w),w=void 0,g&&m.trigger(i?"ajaxSuccess":"ajaxError",[T,v,i?o:a]),b.fireWith(y,[T,l]),g&&(m.trigger("ajaxComplete",[T,v]),--ce.active||ce.event.trigger("ajaxStop")))}return T},getJSON:function(e,t,n){return ce.get(e,t,n,"json")},getScript:function(e,t){return ce.get(e,void 0,t,"script")}}),ce.each(["get","post"],function(e,i){ce[i]=function(e,t,n,r){return v(t)&&(r=r||n,n=t,t=void 0),ce.ajax(ce.extend({url:e,type:i,dataType:r,data:t,success:n},ce.isPlainObject(e)&&e))}}),ce.ajaxPrefilter(function(e){var t;for(t in e.headers)"content-type"===t.toLowerCase()&&(e.contentType=e.headers[t]||"")}),ce._evalUrl=function(e,t,n){return ce.ajax({url:e,type:"GET",dataType:"script",cache:!0,async:!1,global:!1,converters:{"text script":function(){}},dataFilter:function(e){ce.globalEval(e,t,n)}})},ce.fn.extend({wrapAll:function(e){var t;return this[0]&&(v(e)&&(e=e.call(this[0])),t=ce(e,this[0].ownerDocument).eq(0).clone(!0),this[0].parentNode&&t.insertBefore(this[0]),t.map(function(){var e=this;while(e.firstElementChild)e=e.firstElementChild;return e}).append(this)),this},wrapInner:function(n){return v(n)?this.each(function(e){ce(this).wrapInner(n.call(this,e))}):this.each(function(){var e=ce(this),t=e.contents();t.length?t.wrapAll(n):e.append(n)})},wrap:function(t){var n=v(t);return this.each(function(e){ce(this).wrapAll(n?t.call(this,e):t)})},unwrap:function(e){return this.parent(e).not("body").each(function(){ce(this).replaceWith(this.childNodes)}),this}}),ce.expr.pseudos.hidden=function(e){return!ce.expr.pseudos.visible(e)},ce.expr.pseudos.visible=function(e){return!!(e.offsetWidth||e.offsetHeight||e.getClientRects().length)},ce.ajaxSettings.xhr=function(){try{return new ie.XMLHttpRequest}catch(e){}};var Yt={0:200,1223:204},Qt=ce.ajaxSettings.xhr();le.cors=!!Qt&&"withCredentials"in Qt,le.ajax=Qt=!!Qt,ce.ajaxTransport(function(i){var o,a;if(le.cors||Qt&&!i.crossDomain)return{send:function(e,t){var n,r=i.xhr();if(r.open(i.type,i.url,i.async,i.username,i.password),i.xhrFields)for(n in i.xhrFields)r[n]=i.xhrFields[n];for(n in i.mimeType&&r.overrideMimeType&&r.overrideMimeType(i.mimeType),i.crossDomain||e["X-Requested-With"]||(e["X-Requested-With"]="XMLHttpRequest"),e)r.setRequestHeader(n,e[n]);o=function(e){return function(){o&&(o=a=r.onload=r.onerror=r.onabort=r.ontimeout=r.onreadystatechange=null,"abort"===e?r.abort():"error"===e?"number"!=typeof r.status?t(0,"error"):t(r.status,r.statusText):t(Yt[r.status]||r.status,r.statusText,"text"!==(r.responseType||"text")||"string"!=typeof r.responseText?{binary:r.response}:{text:r.responseText},r.getAllResponseHeaders()))}},r.onload=o(),a=r.onerror=r.ontimeout=o("error"),void 0!==r.onabort?r.onabort=a:r.onreadystatechange=function(){4===r.readyState&&ie.setTimeout(function(){o&&a()})},o=o("abort");try{r.send(i.hasContent&&i.data||null)}catch(e){if(o)throw e}},abort:function(){o&&o()}}}),ce.ajaxPrefilter(function(e){e.crossDomain&&(e.contents.script=!1)}),ce.ajaxSetup({accepts:{script:"text/javascript, application/javascript, application/ecmascript, application/x-ecmascript"},contents:{script:/\b(?:java|ecma)script\b/},converters:{"text script":function(e){return ce.globalEval(e),e}}}),ce.ajaxPrefilter("script",function(e){void 0===e.cache&&(e.cache=!1),e.crossDomain&&(e.type="GET")}),ce.ajaxTransport("script",function(n){var r,i;if(n.crossDomain||n.scriptAttrs)return{send:function(e,t){r=ce("<script>").attr(n.scriptAttrs||{}).prop({charset:n.scriptCharset,src:n.url}).on("load error",i=function(e){r.remove(),i=null,e&&t("error"===e.type?404:200,e.type)}),C.head.appendChild(r[0])},abort:function(){i&&i()}}});var Jt,Kt=[],Zt=/(=)\?(?=&|$)|\?\?/;ce.ajaxSetup({jsonp:"callback",jsonpCallback:function(){var e=Kt.pop()||ce.expando+"_"+jt.guid++;return this[e]=!0,e}}),ce.ajaxPrefilter("json jsonp",function(e,t,n){var r,i,o,a=!1!==e.jsonp&&(Zt.test(e.url)?"url":"string"==typeof e.data&&0===(e.contentType||"").indexOf("application/x-www-form-urlencoded")&&Zt.test(e.data)&&"data");if(a||"jsonp"===e.dataTypes[0])return r=e.jsonpCallback=v(e.jsonpCallback)?e.jsonpCallback():e.jsonpCallback,a?e[a]=e[a].replace(Zt,"$1"+r):!1!==e.jsonp&&(e.url+=(At.test(e.url)?"&":"?")+e.jsonp+"="+r),e.converters["script json"]=function(){return o||ce.error(r+" was not called"),o[0]},e.dataTypes[0]="json",i=ie[r],ie[r]=function(){o=arguments},n.always(function(){void 0===i?ce(ie).removeProp(r):ie[r]=i,e[r]&&(e.jsonpCallback=t.jsonpCallback,Kt.push(r)),o&&v(i)&&i(o[0]),o=i=void 0}),"script"}),le.createHTMLDocument=((Jt=C.implementation.createHTMLDocument("").body).innerHTML="<form></form><form></form>",2===Jt.childNodes.length),ce.parseHTML=function(e,t,n){return"string"!=typeof e?[]:("boolean"==typeof t&&(n=t,t=!1),t||(le.createHTMLDocument?((r=(t=C.implementation.createHTMLDocument("")).createElement("base")).href=C.location.href,t.head.appendChild(r)):t=C),o=!n&&[],(i=w.exec(e))?[t.createElement(i[1])]:(i=Ae([e],t,o),o&&o.length&&ce(o).remove(),ce.merge([],i.childNodes)));var r,i,o},ce.fn.load=function(e,t,n){var r,i,o,a=this,s=e.indexOf(" ");return-1<s&&(r=Tt(e.slice(s)),e=e.slice(0,s)),v(t)?(n=t,t=void 0):t&&"object"==typeof t&&(i="POST"),0<a.length&&ce.ajax({url:e,type:i||"GET",dataType:"html",data:t}).done(function(e){o=arguments,a.html(r?ce("<div>").append(ce.parseHTML(e)).find(r):e)}).always(n&&function(e,t){a.each(function(){n.apply(this,o||[e.responseText,t,e])})}),this},ce.expr.pseudos.animated=function(t){return ce.grep(ce.timers,function(e){return t===e.elem}).length},ce.offset={setOffset:function(e,t,n){var r,i,o,a,s,u,l=ce.css(e,"position"),c=ce(e),f={};"static"===l&&(e.style.position="relative"),s=c.offset(),o=ce.css(e,"top"),u=ce.css(e,"left"),("absolute"===l||"fixed"===l)&&-1<(o+u).indexOf("auto")?(a=(r=c.position()).top,i=r.left):(a=parseFloat(o)||0,i=parseFloat(u)||0),v(t)&&(t=t.call(e,n,ce.extend({},s))),null!=t.top&&(f.top=t.top-s.top+a),null!=t.left&&(f.left=t.left-s.left+i),"using"in t?t.using.call(e,f):c.css(f)}},ce.fn.extend({offset:function(t){if(arguments.length)return void 0===t?this:this.each(function(e){ce.offset.setOffset(this,t,e)});var e,n,r=this[0];return r?r.getClientRects().length?(e=r.getBoundingClientRect(),n=r.ownerDocument.defaultView,{top:e.top+n.pageYOffset,left:e.left+n.pageXOffset}):{top:0,left:0}:void 0},position:function(){if(this[0]){var e,t,n,r=this[0],i={top:0,left:0};if("fixed"===ce.css(r,"position"))t=r.getBoundingClientRect();else{t=this.offset(),n=r.ownerDocument,e=r.offsetParent||n.documentElement;while(e&&(e===n.body||e===n.documentElement)&&"static"===ce.css(e,"position"))e=e.parentNode;e&&e!==r&&1===e.nodeType&&((i=ce(e).offset()).top+=ce.css(e,"borderTopWidth",!0),i.left+=ce.css(e,"borderLeftWidth",!0))}return{top:t.top-i.top-ce.css(r,"marginTop",!0),left:t.left-i.left-ce.css(r,"marginLeft",!0)}}},offsetParent:function(){return this.map(function(){var e=this.offsetParent;while(e&&"static"===ce.css(e,"position"))e=e.offsetParent;return e||J})}}),ce.each({scrollLeft:"pageXOffset",scrollTop:"pageYOffset"},function(t,i){var o="pageYOffset"===i;ce.fn[t]=function(e){return M(this,function(e,t,n){var r;if(y(e)?r=e:9===e.nodeType&&(r=e.defaultView),void 0===n)return r?r[i]:e[t];r?r.scrollTo(o?r.pageXOffset:n,o?n:r.pageYOffset):e[t]=n},t,e,arguments.length)}}),ce.each(["top","left"],function(e,n){ce.cssHooks[n]=Ye(le.pixelPosition,function(e,t){if(t)return t=Ge(e,n),_e.test(t)?ce(e).position()[n]+"px":t})}),ce.each({Height:"height",Width:"width"},function(a,s){ce.each({padding:"inner"+a,content:s,"":"outer"+a},function(r,o){ce.fn[o]=function(e,t){var n=arguments.length&&(r||"boolean"!=typeof e),i=r||(!0===e||!0===t?"margin":"border");return M(this,function(e,t,n){var r;return y(e)?0===o.indexOf("outer")?e["inner"+a]:e.document.documentElement["client"+a]:9===e.nodeType?(r=e.documentElement,Math.max(e.body["scroll"+a],r["scroll"+a],e.body["offset"+a],r["offset"+a],r["client"+a])):void 0===n?ce.css(e,t,i):ce.style(e,t,n,i)},s,n?e:void 0,n)}})}),ce.each(["ajaxStart","ajaxStop","ajaxComplete","ajaxError","ajaxSuccess","ajaxSend"],function(e,t){ce.fn[t]=function(e){return this.on(t,e)}}),ce.fn.extend({bind:function(e,t,n){return this.on(e,null,t,n)},unbind:function(e,t){return this.off(e,null,t)},delegate:function(e,t,n,r){return this.on(t,e,n,r)},undelegate:function(e,t,n){return 1===arguments.length?this.off(e,"**"):this.off(t,e||"**",n)},hover:function(e,t){return this.on("mouseenter",e).on("mouseleave",t||e)}}),ce.each("blur focus focusin focusout resize scroll click dblclick mousedown mouseup mousemove mouseover mouseout mouseenter mouseleave change select submit keydown keypress keyup contextmenu".split(" "),function(e,n){ce.fn[n]=function(e,t){return 0<arguments.length?this.on(n,null,e,t):this.trigger(n)}});var en=/^[\s\uFEFF\xA0]+|([^\s\uFEFF\xA0])[\s\uFEFF\xA0]+$/g;ce.proxy=function(e,t){var n,r,i;if("string"==typeof t&&(n=e[t],t=e,e=n),v(e))return r=ae.call(arguments,2),(i=function(){return e.apply(t||this,r.concat(ae.call(arguments)))}).guid=e.guid=e.guid||ce.guid++,i},ce.holdReady=function(e){e?ce.readyWait++:ce.ready(!0)},ce.isArray=Array.isArray,ce.parseJSON=JSON.parse,ce.nodeName=fe,ce.isFunction=v,ce.isWindow=y,ce.camelCase=F,ce.type=x,ce.now=Date.now,ce.isNumeric=function(e){var t=ce.type(e);return("number"===t||"string"===t)&&!isNaN(e-parseFloat(e))},ce.trim=function(e){return null==e?"":(e+"").replace(en,"$1")},"function"==typeof define&&define.amd&&define("jquery",[],function(){return ce});var tn=ie.jQuery,nn=ie.$;return ce.noConflict=function(e){return ie.$===ce&&(ie.$=nn),e&&ie.jQuery===ce&&(ie.jQuery=tn),ce},"undefined"==typeof e&&(ie.jQuery=ie.$=ce),ce});

    }
    function jqueryConfirm(jQuery, window) {
/*!
 * jquery-confirm v3.3.0 (http://craftpip.github.io/jquery-confirm/)
 * Author: Boniface Pereira
 * Website: www.craftpip.com
 * Contact: hey@craftpip.com
 *
 * Copyright 2013-2017 jquery-confirm
 * Licensed under MIT (https://github.com/craftpip/jquery-confirm/blob/master/LICENSE)
 */
if(typeof jQuery==="undefined"){throw new Error("jquery-confirm requires jQuery");}var jconfirm,Jconfirm;(function($,window){$.fn.confirm=function(options,option2){if(typeof options==="undefined"){options={};}if(typeof options==="string"){options={content:options,title:(option2)?option2:false};}$(this).each(function(){var $this=$(this);if($this.attr("jc-attached")){console.warn("jConfirm has already been attached to this element ",$this[0]);return;}$this.on("click",function(e){e.preventDefault();var jcOption=$.extend({},options);if($this.attr("data-title")){jcOption.title=$this.attr("data-title");}if($this.attr("data-content")){jcOption.content=$this.attr("data-content");}if(typeof jcOption.buttons=="undefined"){jcOption.buttons={};}jcOption["$target"]=$this;if($this.attr("href")&&Object.keys(jcOption.buttons).length==0){var buttons=$.extend(true,{},jconfirm.pluginDefaults.defaultButtons,(jconfirm.defaults||{}).defaultButtons||{});var firstBtn=Object.keys(buttons)[0];jcOption.buttons=buttons;jcOption.buttons[firstBtn].action=function(){location.href=$this.attr("href");};}jcOption.closeIcon=false;var instance=$.confirm(jcOption);});$this.attr("jc-attached",true);});return $(this);};$.confirm=function(options,option2){if(typeof options==="undefined"){options={};}if(typeof options==="string"){options={content:options,title:(option2)?option2:false};}if(typeof options.buttons!="object"){options.buttons={};}if(Object.keys(options.buttons).length==0){var buttons=$.extend(true,{},jconfirm.pluginDefaults.defaultButtons,(jconfirm.defaults||{}).defaultButtons||{});options.buttons=buttons;}return jconfirm(options);};$.alert=function(options,option2){if(typeof options==="undefined"){options={};}if(typeof options==="string"){options={content:options,title:(option2)?option2:false};}if(typeof options.buttons!="object"){options.buttons={};}if(Object.keys(options.buttons).length==0){var buttons=$.extend(true,{},jconfirm.pluginDefaults.defaultButtons,(jconfirm.defaults||{}).defaultButtons||{});var firstBtn=Object.keys(buttons)[0];options.buttons[firstBtn]=buttons[firstBtn];}return jconfirm(options);};$.dialog=function(options,option2){if(typeof options==="undefined"){options={};}if(typeof options==="string"){options={content:options,title:(option2)?option2:false,closeIcon:function(){}};}options.buttons={};if(typeof options.closeIcon=="undefined"){options.closeIcon=function(){};}options.confirmKeys=[13];return jconfirm(options);};jconfirm=function(options){if(typeof options==="undefined"){options={};}var pluginOptions=$.extend(true,{},jconfirm.pluginDefaults);if(jconfirm.defaults){pluginOptions=$.extend(true,pluginOptions,jconfirm.defaults);}pluginOptions=$.extend(true,{},pluginOptions,options);var instance=new Jconfirm(pluginOptions);jconfirm.instances.push(instance);return instance;};Jconfirm=function(options){$.extend(this,options);this._init();};Jconfirm.prototype={_init:function(){var that=this;if(!jconfirm.instances.length){jconfirm.lastFocused=$("body").find(":focus");}this._id=Math.round(Math.random()*99999);this.contentParsed=$(document.createElement("div"));if(!this.lazyOpen){setTimeout(function(){that.open();},0);}},_buildHTML:function(){var that=this;this._parseAnimation(this.animation,"o");this._parseAnimation(this.closeAnimation,"c");this._parseBgDismissAnimation(this.backgroundDismissAnimation);this._parseColumnClass(this.columnClass);this._parseTheme(this.theme);this._parseType(this.type);var template=$(this.template);template.find(".jconfirm-box").addClass(this.animationParsed).addClass(this.backgroundDismissAnimationParsed).addClass(this.typeParsed);if(this.typeAnimated){template.find(".jconfirm-box").addClass("jconfirm-type-animated");}if(this.useBootstrap){template.find(".jc-bs3-row").addClass(this.bootstrapClasses.row);template.find(".jc-bs3-row").addClass("justify-content-md-center justify-content-sm-center justify-content-xs-center justify-content-lg-center");template.find(".jconfirm-box-container").addClass(this.columnClassParsed);if(this.containerFluid){template.find(".jc-bs3-container").addClass(this.bootstrapClasses.containerFluid);}else{template.find(".jc-bs3-container").addClass(this.bootstrapClasses.container);}}else{template.find(".jconfirm-box").css("width",this.boxWidth);}if(this.titleClass){template.find(".jconfirm-title-c").addClass(this.titleClass);}template.addClass(this.themeParsed);var ariaLabel="jconfirm-box"+this._id;template.find(".jconfirm-box").attr("aria-labelledby",ariaLabel).attr("tabindex",-1);template.find(".jconfirm-content").attr("id",ariaLabel);if(this.bgOpacity!==null){template.find(".jconfirm-bg").css("opacity",this.bgOpacity);}if(this.rtl){template.addClass("jconfirm-rtl");}this.$el=template.appendTo(this.container);this.$jconfirmBoxContainer=this.$el.find(".jconfirm-box-container");this.$jconfirmBox=this.$body=this.$el.find(".jconfirm-box");this.$jconfirmBg=this.$el.find(".jconfirm-bg");this.$title=this.$el.find(".jconfirm-title");this.$titleContainer=this.$el.find(".jconfirm-title-c");this.$content=this.$el.find("div.jconfirm-content");this.$contentPane=this.$el.find(".jconfirm-content-pane");this.$icon=this.$el.find(".jconfirm-icon-c");this.$closeIcon=this.$el.find(".jconfirm-closeIcon");this.$holder=this.$el.find(".jconfirm-holder");this.$btnc=this.$el.find(".jconfirm-buttons");this.$scrollPane=this.$el.find(".jconfirm-scrollpane");that.setStartingPoint();this._contentReady=$.Deferred();this._modalReady=$.Deferred();this.$holder.css({"padding-top":this.offsetTop,"padding-bottom":this.offsetBottom,});this.setTitle();this.setIcon();this._setButtons();this._parseContent();this.initDraggable();if(this.isAjax){this.showLoading(false);}$.when(this._contentReady,this._modalReady).then(function(){if(that.isAjaxLoading){setTimeout(function(){that.isAjaxLoading=false;that.setContent();that.setTitle();that.setIcon();setTimeout(function(){that.hideLoading(false);that._updateContentMaxHeight();},100);if(typeof that.onContentReady==="function"){that.onContentReady();}},50);}else{that._updateContentMaxHeight();that.setTitle();that.setIcon();if(typeof that.onContentReady==="function"){that.onContentReady();}}if(that.autoClose){that._startCountDown();}});this._watchContent();if(this.animation==="none"){this.animationSpeed=1;this.animationBounce=1;}this.$body.css(this._getCSS(this.animationSpeed,this.animationBounce));this.$contentPane.css(this._getCSS(this.animationSpeed,1));this.$jconfirmBg.css(this._getCSS(this.animationSpeed,1));this.$jconfirmBoxContainer.css(this._getCSS(this.animationSpeed,1));},_typePrefix:"jconfirm-type-",typeParsed:"",_parseType:function(type){this.typeParsed=this._typePrefix+type;},setType:function(type){var oldClass=this.typeParsed;this._parseType(type);this.$jconfirmBox.removeClass(oldClass).addClass(this.typeParsed);},themeParsed:"",_themePrefix:"jconfirm-",setTheme:function(theme){var previous=this.theme;this.theme=theme||this.theme;this._parseTheme(this.theme);if(previous){this.$el.removeClass(previous);}this.$el.addClass(this.themeParsed);this.theme=theme;},_parseTheme:function(theme){var that=this;theme=theme.split(",");$.each(theme,function(k,a){if(a.indexOf(that._themePrefix)===-1){theme[k]=that._themePrefix+$.trim(a);}});this.themeParsed=theme.join(" ").toLowerCase();},backgroundDismissAnimationParsed:"",_bgDismissPrefix:"jconfirm-hilight-",_parseBgDismissAnimation:function(bgDismissAnimation){var animation=bgDismissAnimation.split(",");var that=this;$.each(animation,function(k,a){if(a.indexOf(that._bgDismissPrefix)===-1){animation[k]=that._bgDismissPrefix+$.trim(a);}});this.backgroundDismissAnimationParsed=animation.join(" ").toLowerCase();},animationParsed:"",closeAnimationParsed:"",_animationPrefix:"jconfirm-animation-",setAnimation:function(animation){this.animation=animation||this.animation;this._parseAnimation(this.animation,"o");},_parseAnimation:function(animation,which){which=which||"o";var animations=animation.split(",");var that=this;$.each(animations,function(k,a){if(a.indexOf(that._animationPrefix)===-1){animations[k]=that._animationPrefix+$.trim(a);}});var a_string=animations.join(" ").toLowerCase();if(which==="o"){this.animationParsed=a_string;}else{this.closeAnimationParsed=a_string;}return a_string;},setCloseAnimation:function(closeAnimation){this.closeAnimation=closeAnimation||this.closeAnimation;this._parseAnimation(this.closeAnimation,"c");},setAnimationSpeed:function(speed){this.animationSpeed=speed||this.animationSpeed;},columnClassParsed:"",setColumnClass:function(colClass){if(!this.useBootstrap){console.warn("cannot set columnClass, useBootstrap is set to false");return;}this.columnClass=colClass||this.columnClass;this._parseColumnClass(this.columnClass);this.$jconfirmBoxContainer.addClass(this.columnClassParsed);},_updateContentMaxHeight:function(){var height=$(window).height()-(this.$jconfirmBox.outerHeight()-this.$contentPane.outerHeight())-(this.offsetTop+this.offsetBottom);this.$contentPane.css({"max-height":height+"px"});},setBoxWidth:function(width){if(this.useBootstrap){console.warn("cannot set boxWidth, useBootstrap is set to true");return;}this.boxWidth=width;this.$jconfirmBox.css("width",width);},_parseColumnClass:function(colClass){colClass=colClass.toLowerCase();var p;switch(colClass){case"xl":case"xlarge":p="col-md-12";break;case"l":case"large":p="col-md-8 col-md-offset-2";break;case"m":case"medium":p="col-md-6 col-md-offset-3";break;case"s":case"small":p="col-md-4 col-md-offset-4";break;case"xs":case"xsmall":p="col-md-2 col-md-offset-5";break;default:p=colClass;}this.columnClassParsed=p;},initDraggable:function(){var that=this;var $t=this.$titleContainer;this.resetDrag();if(this.draggable){$t.on("mousedown",function(e){$t.addClass("jconfirm-hand");that.mouseX=e.clientX;that.mouseY=e.clientY;that.isDrag=true;});$(window).on("mousemove."+this._id,function(e){if(that.isDrag){that.movingX=e.clientX-that.mouseX+that.initialX;that.movingY=e.clientY-that.mouseY+that.initialY;that.setDrag();}});$(window).on("mouseup."+this._id,function(){$t.removeClass("jconfirm-hand");if(that.isDrag){that.isDrag=false;that.initialX=that.movingX;that.initialY=that.movingY;}});}},resetDrag:function(){this.isDrag=false;this.initialX=0;this.initialY=0;this.movingX=0;this.movingY=0;this.mouseX=0;this.mouseY=0;this.$jconfirmBoxContainer.css("transform","translate("+0+"px, "+0+"px)");},setDrag:function(){if(!this.draggable){return;}this.alignMiddle=false;var boxWidth=this.$jconfirmBox.outerWidth();var boxHeight=this.$jconfirmBox.outerHeight();var windowWidth=$(window).width();var windowHeight=$(window).height();var that=this;var dragUpdate=1;if(that.movingX%dragUpdate===0||that.movingY%dragUpdate===0){if(that.dragWindowBorder){var leftDistance=(windowWidth/2)-boxWidth/2;var topDistance=(windowHeight/2)-boxHeight/2;topDistance-=that.dragWindowGap;leftDistance-=that.dragWindowGap;if(leftDistance+that.movingX<0){that.movingX=-leftDistance;}else{if(leftDistance-that.movingX<0){that.movingX=leftDistance;}}if(topDistance+that.movingY<0){that.movingY=-topDistance;}else{if(topDistance-that.movingY<0){that.movingY=topDistance;}}}that.$jconfirmBoxContainer.css("transform","translate("+that.movingX+"px, "+that.movingY+"px)");}},_scrollTop:function(){if(typeof pageYOffset!=="undefined"){return pageYOffset;}else{var B=document.body;var D=document.documentElement;D=(D.clientHeight)?D:B;return D.scrollTop;}},_watchContent:function(){var that=this;if(this._timer){clearInterval(this._timer);}var prevContentHeight=0;this._timer=setInterval(function(){if(that.smoothContent){var contentHeight=that.$content.outerHeight()||0;if(contentHeight!==prevContentHeight){that.$contentPane.css({height:contentHeight}).scrollTop(0);prevContentHeight=contentHeight;}var wh=$(window).height();var total=that.offsetTop+that.offsetBottom+that.$jconfirmBox.height()-that.$contentPane.height()+that.$content.height();if(total<wh){that.$contentPane.addClass("no-scroll");}else{that.$contentPane.removeClass("no-scroll");}}},this.watchInterval);},_overflowClass:"jconfirm-overflow",_hilightAnimating:false,highlight:function(){this.hiLightModal();},hiLightModal:function(){var that=this;if(this._hilightAnimating){return;}that.$body.addClass("hilight");var duration=parseFloat(that.$body.css("animation-duration"))||2;this._hilightAnimating=true;setTimeout(function(){that._hilightAnimating=false;that.$body.removeClass("hilight");},duration*1000);},_bindEvents:function(){var that=this;this.boxClicked=false;this.$scrollPane.click(function(e){if(!that.boxClicked){var buttonName=false;var shouldClose=false;var str;if(typeof that.backgroundDismiss=="function"){str=that.backgroundDismiss();}else{str=that.backgroundDismiss;}if(typeof str=="string"&&typeof that.buttons[str]!="undefined"){buttonName=str;shouldClose=false;}else{if(typeof str=="undefined"||!!(str)==true){shouldClose=true;}else{shouldClose=false;}}if(buttonName){var btnResponse=that.buttons[buttonName].action.apply(that);shouldClose=(typeof btnResponse=="undefined")||!!(btnResponse);}if(shouldClose){that.close();}else{that.hiLightModal();}}that.boxClicked=false;});this.$jconfirmBox.click(function(e){that.boxClicked=true;});var isKeyDown=false;$(window).on("jcKeyDown."+that._id,function(e){if(!isKeyDown){isKeyDown=true;}});$(window).on("keyup."+that._id,function(e){if(isKeyDown){that.reactOnKey(e);isKeyDown=false;}});$(window).on("resize."+this._id,function(){that._updateContentMaxHeight();setTimeout(function(){that.resetDrag();},100);});},_cubic_bezier:"0.36, 0.55, 0.19",_getCSS:function(speed,bounce){return{"-webkit-transition-duration":speed/1000+"s","transition-duration":speed/1000+"s","-webkit-transition-timing-function":"cubic-bezier("+this._cubic_bezier+", "+bounce+")","transition-timing-function":"cubic-bezier("+this._cubic_bezier+", "+bounce+")"};},_setButtons:function(){var that=this;var total_buttons=0;if(typeof this.buttons!=="object"){this.buttons={};}$.each(this.buttons,function(key,button){total_buttons+=1;if(typeof button==="function"){that.buttons[key]=button={action:button};}that.buttons[key].text=button.text||key;that.buttons[key].btnClass=button.btnClass||"btn-default";that.buttons[key].action=button.action||function(){};that.buttons[key].keys=button.keys||[];that.buttons[key].isHidden=button.isHidden||false;that.buttons[key].isDisabled=button.isDisabled||false;$.each(that.buttons[key].keys,function(i,a){that.buttons[key].keys[i]=a.toLowerCase();});var button_element=$('<button type="button" class="btn"></button>').html(that.buttons[key].text).addClass(that.buttons[key].btnClass).prop("disabled",that.buttons[key].isDisabled).css("display",that.buttons[key].isHidden?"none":"").click(function(e){e.preventDefault();var res=that.buttons[key].action.apply(that,[that.buttons[key]]);that.onAction.apply(that,[key,that.buttons[key]]);that._stopCountDown();if(typeof res==="undefined"||res){that.close();}});that.buttons[key].el=button_element;that.buttons[key].setText=function(text){button_element.html(text);};that.buttons[key].addClass=function(className){button_element.addClass(className);};that.buttons[key].removeClass=function(className){button_element.removeClass(className);};that.buttons[key].disable=function(){that.buttons[key].isDisabled=true;button_element.prop("disabled",true);};that.buttons[key].enable=function(){that.buttons[key].isDisabled=false;button_element.prop("disabled",false);};that.buttons[key].show=function(){that.buttons[key].isHidden=false;button_element.css("display","");};that.buttons[key].hide=function(){that.buttons[key].isHidden=true;button_element.css("display","none");};that["$_"+key]=that["$$"+key]=button_element;that.$btnc.append(button_element);});if(total_buttons===0){this.$btnc.hide();}if(this.closeIcon===null&&total_buttons===0){this.closeIcon=true;}if(this.closeIcon){if(this.closeIconClass){var closeHtml='<i class="'+this.closeIconClass+'"></i>';this.$closeIcon.html(closeHtml);}this.$closeIcon.click(function(e){e.preventDefault();var buttonName=false;var shouldClose=false;var str;if(typeof that.closeIcon=="function"){str=that.closeIcon();}else{str=that.closeIcon;}if(typeof str=="string"&&typeof that.buttons[str]!="undefined"){buttonName=str;shouldClose=false;}else{if(typeof str=="undefined"||!!(str)==true){shouldClose=true;}else{shouldClose=false;}}if(buttonName){var btnResponse=that.buttons[buttonName].action.apply(that);shouldClose=(typeof btnResponse=="undefined")||!!(btnResponse);}if(shouldClose){that.close();}});this.$closeIcon.show();}else{this.$closeIcon.hide();}},setTitle:function(string,force){force=force||false;if(typeof string!=="undefined"){if(typeof string=="string"){this.title=string;}else{if(typeof string=="function"){if(typeof string.promise=="function"){console.error("Promise was returned from title function, this is not supported.");}var response=string();if(typeof response=="string"){this.title=response;}else{this.title=false;}}else{this.title=false;}}}if(this.isAjaxLoading&&!force){return;}this.$title.html(this.title||"");this.updateTitleContainer();},setIcon:function(iconClass,force){force=force||false;if(typeof iconClass!=="undefined"){if(typeof iconClass=="string"){this.icon=iconClass;}else{if(typeof iconClass==="function"){var response=iconClass();if(typeof response=="string"){this.icon=response;}else{this.icon=false;}}else{this.icon=false;}}}if(this.isAjaxLoading&&!force){return;}this.$icon.html(this.icon?'<i class="'+this.icon+'"></i>':"");this.updateTitleContainer();},updateTitleContainer:function(){if(!this.title&&!this.icon){this.$titleContainer.hide();}else{this.$titleContainer.show();}},setContentPrepend:function(content,force){if(!content){return;}this.contentParsed.prepend(content);},setContentAppend:function(content){if(!content){return;}this.contentParsed.append(content);},setContent:function(content,force){force=!!force;var that=this;if(content){this.contentParsed.html("").append(content);}if(this.isAjaxLoading&&!force){return;}this.$content.html("");this.$content.append(this.contentParsed);setTimeout(function(){that.$body.find("input[autofocus]:visible:first").focus();},100);},loadingSpinner:false,showLoading:function(disableButtons){this.loadingSpinner=true;this.$jconfirmBox.addClass("loading");if(disableButtons){this.$btnc.find("button").prop("disabled",true);}},hideLoading:function(enableButtons){this.loadingSpinner=false;this.$jconfirmBox.removeClass("loading");if(enableButtons){this.$btnc.find("button").prop("disabled",false);}},ajaxResponse:false,contentParsed:"",isAjax:false,isAjaxLoading:false,_parseContent:function(){var that=this;var e="&nbsp;";if(typeof this.content=="function"){var res=this.content.apply(this);if(typeof res=="string"){this.content=res;}else{if(typeof res=="object"&&typeof res.always=="function"){this.isAjax=true;this.isAjaxLoading=true;res.always(function(data,status,xhr){that.ajaxResponse={data:data,status:status,xhr:xhr};that._contentReady.resolve(data,status,xhr);if(typeof that.contentLoaded=="function"){that.contentLoaded(data,status,xhr);}});this.content=e;}else{this.content=e;}}}if(typeof this.content=="string"&&this.content.substr(0,4).toLowerCase()==="url:"){this.isAjax=true;this.isAjaxLoading=true;var u=this.content.substring(4,this.content.length);$.get(u).done(function(html){that.contentParsed.html(html);}).always(function(data,status,xhr){that.ajaxResponse={data:data,status:status,xhr:xhr};that._contentReady.resolve(data,status,xhr);if(typeof that.contentLoaded=="function"){that.contentLoaded(data,status,xhr);}});}if(!this.content){this.content=e;}if(!this.isAjax){this.contentParsed.html(this.content);this.setContent();that._contentReady.resolve();}},_stopCountDown:function(){clearInterval(this.autoCloseInterval);if(this.$cd){this.$cd.remove();}},_startCountDown:function(){var that=this;var opt=this.autoClose.split("|");if(opt.length!==2){console.error("Invalid option for autoClose. example 'close|10000'");return false;}var button_key=opt[0];var time=parseInt(opt[1]);if(typeof this.buttons[button_key]==="undefined"){console.error("Invalid button key '"+button_key+"' for autoClose");return false;}var seconds=Math.ceil(time/1000);this.$cd=$('<span class="countdown"> ('+seconds+")</span>").appendTo(this["$_"+button_key]);this.autoCloseInterval=setInterval(function(){that.$cd.html(" ("+(seconds-=1)+") ");if(seconds<=0){that["$$"+button_key].trigger("click");that._stopCountDown();}},1000);},_getKey:function(key){switch(key){case 192:return"tilde";case 13:return"enter";case 16:return"shift";case 9:return"tab";case 20:return"capslock";case 17:return"ctrl";case 91:return"win";case 18:return"alt";case 27:return"esc";case 32:return"space";}var initial=String.fromCharCode(key);if(/^[A-z0-9]+$/.test(initial)){return initial.toLowerCase();}else{return false;}},reactOnKey:function(e){var that=this;var a=$(".jconfirm");if(a.eq(a.length-1)[0]!==this.$el[0]){return false;}var key=e.which;if(this.$content.find(":input").is(":focus")&&/13|32/.test(key)){return false;}var keyChar=this._getKey(key);if(keyChar==="esc"&&this.escapeKey){if(this.escapeKey===true){this.$scrollPane.trigger("click");}else{if(typeof this.escapeKey==="string"||typeof this.escapeKey==="function"){var buttonKey;if(typeof this.escapeKey==="function"){buttonKey=this.escapeKey();}else{buttonKey=this.escapeKey;}if(buttonKey){if(typeof this.buttons[buttonKey]==="undefined"){console.warn("Invalid escapeKey, no buttons found with key "+buttonKey);}else{this["$_"+buttonKey].trigger("click");}}}}}$.each(this.buttons,function(key,button){if(button.keys.indexOf(keyChar)!=-1){that["$_"+key].trigger("click");}});},setDialogCenter:function(){console.info("setDialogCenter is deprecated, dialogs are centered with CSS3 tables");},_unwatchContent:function(){clearInterval(this._timer);},close:function(){var that=this;if(typeof this.onClose==="function"){this.onClose();}this._unwatchContent();$(window).unbind("resize."+this._id);$(window).unbind("keyup."+this._id);$(window).unbind("jcKeyDown."+this._id);if(this.draggable){$(window).unbind("mousemove."+this._id);$(window).unbind("mouseup."+this._id);this.$titleContainer.unbind("mousedown");}that.$el.removeClass(that.loadedClass);$("body").removeClass("jconfirm-no-scroll-"+that._id);that.$jconfirmBoxContainer.removeClass("jconfirm-no-transition");setTimeout(function(){that.$body.addClass(that.closeAnimationParsed);that.$jconfirmBg.addClass("jconfirm-bg-h");var closeTimer=(that.closeAnimation==="none")?1:that.animationSpeed;setTimeout(function(){that.$el.remove();var l=jconfirm.instances;var i=jconfirm.instances.length-1;for(i;i>=0;i--){if(jconfirm.instances[i]._id===that._id){jconfirm.instances.splice(i,1);}}if(!jconfirm.instances.length){if(that.scrollToPreviousElement&&jconfirm.lastFocused&&jconfirm.lastFocused.length&&$.contains(document,jconfirm.lastFocused[0])){var $lf=jconfirm.lastFocused;if(that.scrollToPreviousElementAnimate){var st=$(window).scrollTop();var ot=jconfirm.lastFocused.offset().top;var wh=$(window).height();if(!(ot>st&&ot<(st+wh))){var scrollTo=(ot-Math.round((wh/3)));$("html, body").animate({scrollTop:scrollTo},that.animationSpeed,"swing",function(){$lf.focus();});}else{$lf.focus();}}else{$lf.focus();}jconfirm.lastFocused=false;}}if(typeof that.onDestroy==="function"){that.onDestroy();}},closeTimer*0.4);},50);return true;},open:function(){if(this.isOpen()){return false;}this._buildHTML();this._bindEvents();this._open();return true;},setStartingPoint:function(){var el=false;if(this.animateFromElement!==true&&this.animateFromElement){el=this.animateFromElement;jconfirm.lastClicked=false;}else{if(jconfirm.lastClicked&&this.animateFromElement===true){el=jconfirm.lastClicked;jconfirm.lastClicked=false;}else{return false;}}if(!el){return false;}var offset=el.offset();var iTop=el.outerHeight()/2;var iLeft=el.outerWidth()/2;iTop-=this.$jconfirmBox.outerHeight()/2;iLeft-=this.$jconfirmBox.outerWidth()/2;var sourceTop=offset.top+iTop;sourceTop=sourceTop-this._scrollTop();var sourceLeft=offset.left+iLeft;var wh=$(window).height()/2;var ww=$(window).width()/2;var targetH=wh-this.$jconfirmBox.outerHeight()/2;var targetW=ww-this.$jconfirmBox.outerWidth()/2;sourceTop-=targetH;sourceLeft-=targetW;if(Math.abs(sourceTop)>wh||Math.abs(sourceLeft)>ww){return false;}this.$jconfirmBoxContainer.css("transform","translate("+sourceLeft+"px, "+sourceTop+"px)");},_open:function(){var that=this;if(typeof that.onOpenBefore==="function"){that.onOpenBefore();}this.$body.removeClass(this.animationParsed);this.$jconfirmBg.removeClass("jconfirm-bg-h");this.$body.focus();that.$jconfirmBoxContainer.css("transform","translate("+0+"px, "+0+"px)");setTimeout(function(){that.$body.css(that._getCSS(that.animationSpeed,1));that.$body.css({"transition-property":that.$body.css("transition-property")+", margin"});that.$jconfirmBoxContainer.addClass("jconfirm-no-transition");that._modalReady.resolve();if(typeof that.onOpen==="function"){that.onOpen();}that.$el.addClass(that.loadedClass);},this.animationSpeed);},loadedClass:"jconfirm-open",isClosed:function(){return !this.$el||this.$el.css("display")==="";},isOpen:function(){return !this.isClosed();},toggle:function(){if(!this.isOpen()){this.open();}else{this.close();}}};jconfirm.instances=[];jconfirm.lastFocused=false;jconfirm.pluginDefaults={template:'<div class="jconfirm"><div class="jconfirm-bg jconfirm-bg-h"></div><div class="jconfirm-scrollpane"><div class="jconfirm-row"><div class="jconfirm-cell"><div class="jconfirm-holder"><div class="jc-bs3-container"><div class="jc-bs3-row"><div class="jconfirm-box-container jconfirm-animated"><div class="jconfirm-box" role="dialog" aria-labelledby="labelled" tabindex="-1"><div class="jconfirm-closeIcon">&times;</div><div class="jconfirm-title-c"><span class="jconfirm-icon-c"></span><span class="jconfirm-title"></span></div><div class="jconfirm-content-pane"><div class="jconfirm-content"></div></div><div class="jconfirm-buttons"></div><div class="jconfirm-clear"></div></div></div></div></div></div></div></div></div></div>',title:"Hello",titleClass:"",type:"default",typeAnimated:true,draggable:true,dragWindowGap:15,dragWindowBorder:true,animateFromElement:true,alignMiddle:true,smoothContent:true,content:"Are you sure to continue?",buttons:{},defaultButtons:{ok:{action:function(){}},close:{action:function(){}}},contentLoaded:function(){},icon:"",lazyOpen:false,bgOpacity:null,theme:"light",animation:"scale",closeAnimation:"scale",animationSpeed:400,animationBounce:1,escapeKey:true,rtl:false,container:"body",containerFluid:false,backgroundDismiss:false,backgroundDismissAnimation:"shake",autoClose:false,closeIcon:null,closeIconClass:false,watchInterval:100,columnClass:"col-md-4 col-md-offset-4 col-sm-6 col-sm-offset-3 col-xs-10 col-xs-offset-1",boxWidth:"50%",scrollToPreviousElement:true,scrollToPreviousElementAnimate:true,useBootstrap:true,offsetTop:40,offsetBottom:40,bootstrapClasses:{container:"container",containerFluid:"container-fluid",row:"row"},onContentReady:function(){},onOpenBefore:function(){},onOpen:function(){},onClose:function(){},onDestroy:function(){},onAction:function(){}};var keyDown=false;$(window).on("keydown",function(e){if(!keyDown){var $target=$(e.target);var pass=false;if($target.closest(".jconfirm-box").length){pass=true;}if(pass){$(window).trigger("jcKeyDown");}keyDown=true;}});$(window).on("keyup",function(){keyDown=false;});jconfirm.lastClicked=false;$(document).on("mousedown","button, a",function(){jconfirm.lastClicked=$(this);});})(jQuery,window);
    }
    var instance = null;
    return function (win) {
        if (instance) return instance;
        var holder = { exports: {} };
        jquery.call(win, win, holder);          // CommonJS path: no window.jQuery / window.$
        jqueryConfirm.call(win, holder.exports, win);
        return (instance = holder.exports);
    };
})();

/* ===== moomod/00-head.js ===== */
/*
 * MooMod (by Nuro) — a 1:1 port onto moomoo.js
 * =============================================
 * Its own standalone script: it only needs the loader. It is NOT part of MooMooPlus or
 * MooMoo Lite. (jQuery + jquery-confirm, which the original @required, are bundled in by
 * mods/build-moomod.mjs as MOOMOD_JQUERY — the only name these files use from outside.)
 *
 * The original userscript spoke the 2020 moomoo.io protocol itself: it hooked
 * WebSocket.prototype.send, read every frame as msgpack ["type", [args]] and wrote its
 * own frames the same way. This port keeps the script's logic statement for statement
 * and swaps only the transport:
 *   - 20-wire.js speaks the OLD packet language to the rest of the script and translates
 *     it to loader actions (and the server's events back into old frames), so every
 *     handler still reads like the original: send(["13c", [0, 7, 0]]) equips a hat
 *   - the menus, styles and texts are the original's, character for character
 *   - the original's quirks are kept (F2 / ESC only ever OPEN their menus, the auto heal
 *     checkbox starts unticked while auto heal is on, ...). The few places that differ
 *     are marked "PORT:" — server rules the old site didn't have, and things the new
 *     client doesn't have (no #setupCard, no "Featured YouTuber" box)
 *
 * Deobfuscated original: ~/Downloads/MooMod.deobfuscated.js (variable names below are
 * the readable versions of its _0x names).
 *
 * Files (concatenated in name order into one scope by mods/build-moomod.mjs):
 *   00-head    registration, tracked timers / listeners (disabling the mod undoes it all)
 *   10-assets  the original HTML + CSS
 *   20-wire    old protocol <-> loader: the send hook, frame translation, server limits
 *   30-state   the script's variables
 *   40-page    page touches: logo, title, ads, cursor, alert, featured hacker, FPS counter
 *   50-menus   F2 auto placement, ESC hat menu, the "-" MooMod menu, autopilot, alerts
 *   60-game    the per-message brain: enemy / biome hats, HUD colours, auto heal, markers
 *   70-keys    every key: spammers, instas, four-places, auto trap, bot mode, arrow spams
 *   90-init    runs the setup in the original's exact order
 */
(function () {
    "use strict";

    function boot(MooMoo) {
        MooMoo.register({
            id: "moomod",
            name: "MooMod",
            version: "1.0.0",
            description: "Nuro's MooMod, ported 1:1. - opens the MooMod menu, ESC the hat menu, F2 auto placement.",
            menu: true,
            menuHint: "MooMod has its own menus: press - (minus) for the MooMod menu, ESC for the hat menu and F2 for auto placement.",
            liveSettings: true,
            defaultEnabled: true
        }, function (ctx) {
            const win = (typeof unsafeWindow !== "undefined") ? unsafeWindow : window;
            const document = win.document;
            if (!document || !document.createElement) return;           // headless (tests without a page)
            // jQuery + jquery-confirm (the original @required both). They're bundled in by
            // build-moomod.mjs and started privately once the page has a document (jQuery can't
            // start at document-start, where moomoo.js scripts run) — see 90-init.
            let $ = null;

            // ---- everything the original left running is tracked, so disabling undoes it ----
            const timeouts = new Set();
            const intervals = new Set();
            let alive = true;
            function setTimeout(fn, ms) {
                const id = win.setTimeout(function () { timeouts.delete(id); if (alive) fn(); }, ms);
                timeouts.add(id);
                return id;
            }
            function clearTimeout(id) { timeouts.delete(id); win.clearTimeout(id); }
            function setInterval(fn, ms) {
                const id = win.setInterval(function () { if (alive) fn(); }, ms);
                intervals.add(id);
                return id;
            }
            function clearInterval(id) { intervals.delete(id); win.clearInterval(id); }
            function listen(target, type, fn, opts) {
                target.addEventListener(type, fn, opts);
                ctx.onCleanup(function () { target.removeEventListener(type, fn, opts); });
            }
            const owned = [];                       // elements we created (removed on disable)
            function own(el) { owned.push(el); return el; }
            const restores = [];                    // page values we changed (put back on disable)
            function remember(fn) { restores.push(fn); }
            ctx.onCleanup(function () {
                alive = false;
                for (const id of timeouts) win.clearTimeout(id);
                for (const id of intervals) win.clearInterval(id);
                timeouts.clear(); intervals.clear();
                const stop = (el) => { if ($) $(el).stop(true); el.remove(); };
                if ($) { try { $(document).off(".moomod"); $("#mapDisplay").off(".moomod"); } catch (e) { /* ignore */ } }
                for (const el of owned) { try { stop(el); } catch (e) { /* ignore */ } }
                // extra copies made at runtime (autopilot boxes, pulse rings, map markers)
                for (const sel of ["#infoDiv", ".spotDiv", ".mapTarget", "#botText"]) {
                    try { for (const el of Array.from(document.querySelectorAll(sel))) stop(el); } catch (e) { /* ignore */ }
                }
                for (let i = restores.length - 1; i >= 0; i--) { try { restores[i](); } catch (e) { /* ignore */ } }
            });

/* ===== moomod/10-assets.js ===== */
            // =====================================================================
            // 10-assets — the original's markup and styles, character for character.
            // (PORT: the hat icons point at this server's /img/hats/ instead of
            // http://moomoo.io/img/hats/ — same pictures.)
            // =====================================================================

            // F2 — "Auto placement Settings" modal (+ the hat id list in its footer)
            const AUTO_PLACE_HTML = `
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
`;
            const AUTO_PLACE_CSS = `
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

`;

            // the CloudyMod stylesheet (hat change alert, autopilot box, map pulse, BOT text, ...)
            const CLOUDY_CSS = `

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

`;

            // the autopilot box a minimap click opens
            const AUTOPILOT_HTML = `<h1 id="autotitle">You are currently in CloudyMod auto-pilot.</h1>
     <h3 id="arrivalest">You will arrive in <span id="timeest">30 seconds...</span></h3>

     <button type="button" id="cancelTrip">Cancel</button>`;

            // the "-" MooMod menu (tabs: Main / Offense / Defense / Support / Map / controls / Help)
            const MENU_CSS = `
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
    cursor: url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAYAAADgdz34AAAFqElEQVRIS61WCVATZxT+NiQBAgoeiAINETlaEJlKp1qlorVKAS9MdcaKoAJeMEW8Ci0V2zrGKaNjvQtjRVTaKVKookirU4VR6VRaRcGoKBCOMUAm4Qgs5Ni+jaKCtkOPnfmz++++/b73vndsGAw43N3dw11dXbNFItHQmpqaXWKxOK26urpnoN1g98zzhp6enkM5jsvMyspa7O3tjYSEBENZWdmU+vr664MFHGjXj8DDw0Pq6Oh4IS8vz0smkyE7OxsKhaJSqVSO/18I3NzcXO3s7M4WFhYGUDQwmUwICQmBTqcTl5eXG/4NSb8InJ2d7Uii/SUlJct9fHwseMHBwaitrZ2lUqku/GcCAmBImm3FxcVb+RzwR3x8PIqKin5mGEZjNpv9BQJB3sOHD9MoQmuDwTBRKBQ+oKP5r8j7RcAbUR5SYmNjt6ekpAj4/bWr1xAVHYWFEXLIFyxEYlIi1C3qNqmbVNKj7xGxvSw62c5FVGn5JLFDQ0NDG71m6iN8gWDs2LFvCoSCgvvK6jEwAt1sN2bOfgcZezLh5z4e9x7cxfRFwbiUcxleDj64WXUDa3et5pp1zemsgfUTi8S3VbWq5H4EJEsISRBJay+F/zv1QkXNvRpfTs+AsQLemB6IIzu+wQRZAO7eV+LdtTNxMf0SvJy8ADOHsM/fQ3tHBzKWHsXK7GVo6WyeUldXd40nYUjruFFOozJ8X/XFrcpbUDerD1Kig9I/S58QMU0OUO2Ex4RCsW4n/KUBUDWokHxoC9KjdmO0vQsYDlh7NA7Rk2IwceRkyI+F4Y66chUVRaaFYOqUqVxWxjF4uIyDVqPFxk+SUPpbaZ2/l7/7D18WgOslIyIxd5M19TO/tyy6NvNnesaZzDD2CKisgWW583BbffMZQdDUIO74gZOQDpNaALRaLeYlzIHISmSRget6DAYCswDywDwoXZsoR2ZaRv5spjOtFflzoWypeEYglUq3REZEKj6N3ioQG60tAHWtNVAcVeBgzNfgWAZG1oRHukYMFzpbwBu0KjjbusNs4tDS1QwHaxeYGQGvJpbnzkBTW+1SykFOXw5G6vX6nMT3189KCtv02FveS3KHYwUWCVrbNIjPi8HWGTvJUwGWfB+O4/LzMBCbojQZ22ZnQiIZjl4BhzUnp6GlvdGPclBlIeB/qDSdRULRlYKNZ8Z52Hlbwufl4L3lZWjt0GD9uVgkBylghgArSYbDEYWkmhG7S1OwOfQwrO2GwWzDIJWSfLX8orCvF572AZVmqJvjK+dOrSiEBA4WbfmkGWlpujTYXByLpLd3UAcJkFAwF+mLzlgIDl3+GGvmH4RwyDDcayrDd6e3tFbcLnd6aaP5ePpkxk/eELtkfBwBk/ZUgkaOQyurQepPsVgznQjIpeS8BUj9oICUNOL4xVQsWbwfJhsRzp5Og7KyiPRvsOj/VKK+DY0JryGiIZczF+aPGSGRkYccDKRrS48GivOrsGzmFzBS4ym+lSM+5pSFIL8oDWHRe9DaXovijMSsNm1rglqt1v/dqIjp6OnYlxNVZuvgKAVLBHqGxbkbR/CaXyg4G2tcKj+B14Mj0WHsQGVVMWRBc/DjplmNjJVwLlXPH88Pvhdm0ZOBt05sZfvVuvn7hG6ySegWmmlxYEVmdIlpWfWCtQH0YppVtC9P/xDaO9f30lhPHDhVX0rAG1HSw+xsHXMj405IJM5u6CJwHqzL2oz7V3JR+0se/A7lotOkhzJWDqNWE0Df8IpBEwQGBooeNdXvDF99eIN4tCt5z6FbZEJ7eyMqFIm/MiJrnZXTqJAR2xXQfLQRJp3uLYqgbNAEZCikKRtD3SBnaH6DoWBpHph62SYrsU0meVsqk0oV6O31ZWxsWHp+gO6V/BMCuLi4SOzt7SXPv0RfMLaqqqrzyT0rGjVD6a+NiT447QPB+f2fdSGSNwBPXhkAAAAASUVORK5CYII=") 6 0, auto !important;
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
`;
            const MENU_HTML = `
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
    <div class="i-close"></div>`;

            // "Use biome map": the minimap background
            const BIOME_MAP_BG = `url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAIIAAACCCAYAAACKAxD9AAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAAEnQAABJ0Ad5mH3gAAAFCSURBVHhe7dxBDcMwFAVBuzB7CIoSKIKwSFmEWhutyyIzkhUCq3eK/jyO8zu4vcf/y80JgQiBCIEIgQiBCIEIgQiBCIEIgQiBCIEIgQiBCIEIgQiBCIEIgQiBzOv5ixmLwCIEIgQiBCIEIgQiBCIEIgQiBCIEIgQiBCIEIgQiBCIEIgQiBCIEIgQiBCIEIgQiBCIEIgQiBCIEIgQiBCIEIgQiBCIEIgQiBDK318dVNSwCixCIEIgQiBCIEIgQiOvsxCIQIRAhECEQIRAhECEQIRAhECEQIRAhECEQIRAhECEQIRAhECEQIRAhECEQIRAhECEQIRAhECEQIRAhECEQIRAhECEQIRAhECEQIRAhkLm/n+4sYhFYhECEQIRAhECEQIRAhECEQIRAhECEQIRAhECEQIRAhECEQIRAhECEwGWMH9UwCujTcs1kAAAAAElFTkSuQmCC) no-repeat center center`;

            // the red 3D "MooMod" logo, and the (never applied) ping display shadow
            const LOGO_SHADOW = `0 1px 0 rgba(231, 76, 60), 0 2px 0 rgba(231, 76, 60), 0 3px 0 rgba(231, 76, 60), 0 4px 0 rgba(231, 76, 60), 0 5px 0 rgba(231, 76, 60), 0 6px 0 rgba(231, 76, 60), 0 7px 0 rgba(231, 76, 60), 0 8px 0 rgba(231, 76, 60), 0 9px 0 rgba(255, 0, 0)`;
            const PING_SHADOW = `0 1px 0 rgba(255, 255, 255, 0), 0 2px 0 rgba(255, 255, 255, 0), 0 3px 0 rgba(255, 255, 255, 0), 0 4px 0 rgba(255, 255, 255, 0), 0 5px 0 rgba(255, 255, 255, 0), 0 6px 0 rgba(255, 255, 255, 0), 0 7px 0 rgba(255, 255, 255, 0), 0 8px 0 rgba(255, 255, 255, 0), 0 9px 0 rgba(255, 255, 255, 0)`;

            // the main menu's "Featured" box (the second one is never shown: its flag is always false)
            const FEATURED_NURO = `<div id="youtuberOf">
                           ´
		<div class="spanLink" id="featuredYoutube"><a target="_blank" class="ytLink" href="https://www.youtube.com/channel/UCxNHxsTut7atZCUNSJCHx4A?sub_confirmation=1"><i class="material-icons" style="vertical-align: top;"></i>Nuro.</a></div>
	</div>
Featured Hacker:`;
            const FEATURED_JABIDDLE = `<div id="youtuberOf">
                           ´
		<div class="spanLink" id="featuredYoutube"><a target="_blank" class="ytLink" href="https://www.youtube.com/channel/UCrZVnif0yPniQfdwvdMgf_Q?sub_confirmation=1"><i class="material-icons" style="vertical-align: top;"></i>jabiddle</a></div>
	</div>
Featured Hacker:`;

            // ESC — the "MooMod Hat settings" menu. The original glued the key boxes' values in
            // between these pieces with String.fromCharCode(key) (see hatMenuHtml in 50-menus).
            const HAT_MENU_PARTS = [
                `
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
<h3 class="menuPrompt lowpromptdetail toplow">When I press <input value="`,
                `" id="spikeControl" class="keyPressLow" maxlength="1" type="text"/> place a <img class="objplace" src="https://i.imgur.com/0wiUP4V.png"/></h3>
<h3 class="menuPrompt lowpromptdetail">When I press <input value="`,
                `" id="trapControl" class="keyPressLow" maxlength="1" type="text"/> place a <img class="objplace" src="https://i.imgur.com/mHWrRQV.png"/></h3>
<h3 class="menuPrompt lowpromptdetail">When I press <input value="`,
                `" id="turretControl" class="keyPressLow" maxlength="1" type="text"/> place a <img class="objplace" src="https://i.imgur.com/87ra7xS.png"/></h3>
<h3 class="menuPrompt lowpromptdetail">When I press <input value="`,
                `" id="bullHelm" class="keyPressLow" maxlength="1" type="text"/> put on <img class="objplace" src="/img/hats/hat_7.png"/></h3>
<h3 class="menuPrompt lowpromptdetail">When I press <input value="`,
                `" id="soldier" class="keyPressLow" maxlength="1" type="text"/> put on <img class="objplace" src="/img/hats/hat_6.png"/></h3>
<h3 class="menuPrompt lowpromptdetail">When I press <input value="`,
                `" id="turret" class="keyPressLow" maxlength="1" type="text"/> put on <img class="objplace" src="/img/hats/hat_53.png"/></h3>
<h3 class="menuPrompt lowpromptdetail">When I press <input value="`,
                `" id="bushg" class="keyPressLow" maxlength="1" type="text"/> put on <img class="objplace" src="/img/hats/hat_10.png"/></h3>
<h3 class="menuPrompt lowpromptdetail">When I press <input value="`,
                `" id="spikeg" class="keyPressLow" maxlength="1" type="text"/> put on <img class="objplace" src="/img/hats/hat_11.png"/></h3>
<h3 class="menuPrompt lowpromptdetail">When I press <input value="`,
                `" id="samu" class="keyPressLow" maxlength="1" type="text"/> put on <img class="objplace" src="/img/hats/hat_20.png"/></h3>
<h3 class="menuPrompt lowpromptdetail">When I press <input value="`,
                `" id="emp" class="keyPressLow" maxlength="1" type="text"/> put on <img class="objplace" src="/img/hats/hat_22.png"/></h3>
<h3 class="menuPrompt lowpromptdetail">When I press <input value="`,
                `" id="mill" class="keyPressLow" maxlength="1" type="text"/> put on <img class="objplace" src="/img/hats/hat_14.png"/></h3>
<h3 class="menuPrompt lowpromptdetail">When I press <input value="`,
                `" id="tank" class="keyPressLow" maxlength="1" type="text"/> put on <img class="objplace" src="/img/hats/hat_40.png"/></h3>
<h3 class="menuPrompt">Winter Flipper Booster: </h3> <input value="`,
                `" id="WFB" class="keyPressLow" maxlength="1" type="text"/>

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
`
            ];
            const HAT_MENU_CSS = `
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

`;

            // the "Biome Hat Changed!" alert (only shown when biomeHatAlerts is on — it never is)
            function hatAlertHtml(name, id) {
                return "<div id=\"flextop\"><img id=\"hatimgmain\" src=\"/img/hats/hat_" + id + ".png\">\n\t\t\t<h1 id=\"changeAlert\">Biome Hat Changed!</h1></div>\n\t\t\t<h3 id=\"typealert\">Your hat was automatically changed to the <span id=\"hatname\">" + name + "</span></h3>\n\n\t\t\t<div id=\"flexlow\">\n\t\t\t<button id=\"sback\">Switch Back!</button> <button id=\"okbtn\">OK</button>\n\t\t\t</div>";
            }

/* ===== moomod/20-wire.js ===== */
            // =====================================================================
            // 20-wire — the old protocol, spoken on top of the loader.
            // =====================================================================
            // The original sent frames as msgpack ["type", [args]] straight on the game socket,
            // and its WebSocket.prototype.send hook saw every frame — the client's AND its own —
            // on the way out. Here:
            //   send(packet)     the original's _0x43ca03 / document.dns / socket.send: through
            //                    the hook, then onto the wire
            //   rawSend(packet)  the hook's own this.oldSend(...): straight onto the wire
            //   toWire(packet)   one old packet -> the loader action it means on this server
            // The client's own frames reach the hook through ctx.onSent (turned back into old
            // packets), and the server's events reach onMessage (60-game) as old frames.

            const isNumber = (v) => typeof v === "number" && !isNaN(v) && isFinite(v);   // the server's UTILS.isNumber
            const noop = function () {};

            // What the client is holding, as the old client knew it (it sent a direction with a
            // click only while holding a building). Server updates + the selects that went out.
            let heldBuild = -1;
            function noteSelect(index, isWeapon) {
                if (isWeapon) heldBuild = -1;
                else heldBuild = heldBuild === index ? -1 : index;     // the server puts an item away when it's picked twice
            }

            // PORT: this server strikes malformed packets (40 strikes = kicked). Whatever the old
            // server quietly ignored or coped with — a NaN build direction, an undefined item slot,
            // the made-up "3" packet, toggle 2 — is turned into what that server did with it, or dropped.
            function toWire(packet) {
                const type = packet[0], a = packet[1] || [];
                switch (type) {
                    case "2":   // look direction
                        return isNumber(a[0]) ? MooMoo.send.aim(a[0]) : false;
                    case "33":  // move direction (null = stop)
                        if (a[0] == null) return MooMoo.send.move(null);
                        return isNumber(a[0]) ? MooMoo.send.move(a[0]) : false;
                    case "c":   // mouse [1 down | 0 up, build direction]. No readable direction (null, or the
                                // NaN the script's never-installed mouse tracking produced) = build where
                                // you're looking, which is what the old server did with it.
                        return MooMoo.send.mouse(!!a[0], isNumber(a[1]) ? a[1] : null);
                    case "5":   // select [index, isWeapon]
                        if (!Number.isInteger(a[0])) return false;
                        noteSelect(a[0], !!a[1]);
                        return MooMoo.send.selectItem(a[0], !!a[1]);
                    case "13c": // store [0 equip | 1 buy, id, isAccessory]   (the vocabulary's store is 1 equip / 0 buy)
                        if (!Number.isInteger(a[1]) || (a[0] !== 0 && a[0] !== 1)) return false;
                        return MooMoo.send.store(a[0] === 0 ? 1 : 0, a[1], !!a[2]);
                    case "ch":  // chat
                        return typeof a[0] === "string" ? MooMoo.send.chat(a[0]) : false;
                    case "7":   // the old server flipped auto gather for any truthy value (bot mode sends 2)
                        return MooMoo.send.toggle(a[0] ? 1 : 0);
                    case "8":   // create tribe
                        return typeof a[0] === "string" ? MooMoo.send.createTribe(a[0]) : false;
                    case "9":   // leave tribe
                        return MooMoo.send.leaveTribe();
                    case "10":  // ask to join a tribe
                        return typeof a[0] === "string" ? MooMoo.send.joinTribe(a[0]) : false;
                    default:    // "3" was never a real packet: the old server dropped it, so do we
                        return false;
                }
            }

            // PORT: the server allows about 18 item selects and 36 clicks a second. A placement that
            // only half goes out leaves the wrong thing in your hand, so a placement macro is sent
            // whole or not at all (the old site had no such limit, every one went out).
            const wireOf = (action) => {
                const b = win.MooMooBinding;
                return b && b.outgoing && b.outgoing[action] ? b.outgoing[action].wire : null;
            };
            function roomFor(selects, clicks) {
                const net = ctx.net;
                if (!net || !net.tokens) return true;
                const z = wireOf("selectItem"), f = wireOf("mouse");
                if (z && net.tokens(z) < selects) return false;
                if (f && net.tokens(f) < clicks) return false;
                return !net.wouldAllow || !f || net.wouldAllow(f);
            }

            // ---- the hook ----
            let gameSocket = null;          // _0x6f10cd: grabbed by the hook on the first frame that goes out

            function rawSend(packet) {      // this.oldSend(...)
                toWire(packet);
            }
            function send(packet) {         // _0x43ca03(packet) == _0x6f10cd.send(encode(packet))
                // before the hook has seen a frame the original had no socket and threw right here
                if (!gameSocket) throw new TypeError("Cannot read properties of undefined (reading 'send')");
                hook(packet, rawSend);
            }

            // ["c", [1, null]] / ["c", [0, null]] — byte for byte the frames [146,161,99,146,1|0,192]
            // the hook watched for (the old client's attack press / release while holding a weapon).
            function isSwingFrame(packet) {
                const a = packet[1];
                return packet[0] === "c" && Array.isArray(a) && a.length === 2 && (a[0] === 1 || a[0] === 0) && a[1] == null;
            }

            // The original's WebSocket.prototype.send replacement, for one old packet.
            // putOnWire sends it (the client's own frames are already out: noop).
            function hook(packet, putOnWire) {
                if (tripTarget.every((v) => v == false)) {
                    for (const el of document.getElementsByClassName("spotDiv")) document.body.removeChild(el);
                }
                if (!gameSocket) {
                    gameSocket = true;
                    attachSocket();
                }
                if (instaRunning) {
                    putOnWire(packet);
                    return;
                }
                putOnWire(packet);
                const args = packet[1] || [];
                if (hitHats && isSwingFrame(packet)) {
                    if (args[0] === 1) {            // "started swing": hit hat + hit accessory on
                        swinging = true;
                        rawSend(hitHatPacket("on"));
                        rawSend(hitHatPacket("mOff"));
                        send(["13c", [0, hitAcc, 1]]);
                    } else {                        // "ended swing": back to your own
                        rawSend(hitHatPacket("off"));
                        rawSend(hitHatPacket("mOn"));
                        send(["13c", [0, myAcc, 1]]);
                        swinging = false;
                    }
                }
                const data = [packet[0]].concat(args);
                if (data[0] == "ch") {
                    lastChat = data[1];
                }
                if (data[0] == "s") {              // "user respawned" — the old spawn packet was "sp", so never
                    for (const marker of Object.values(mapMarkers)) marker.style.opacity = 1;
                    isDead = false;
                } else if (data[0] == "13c") {
                    if (!swinging && data.length == 4 && data[3] == 0 && data[1] == 0) {
                        myHat = data[2];                                  // "Changed hat to"
                    } else if (!swinging && data.length == 4 && data[3] == 1 && data[1] == 0) {
                        myAcc = data[2];                                  // "Changed accessory to"
                    } else if (data.length == 4 && data[3] == 0 && data[1] == 1) {
                        const bought = data[2];                           // "BOUGHT HAT"
                        if (bought == idOf("winter cap")) ownsWinterCap = true;
                        else if (bought == idOf("flipper hat")) ownsFlipperHat = true;
                    }
                } else if (data[0] == "2") {
                    lastAim = data[1];
                }
            }

            // _0x21cd2c: the hat / accessory frames the hook sends around a swing
            function hitHatPacket(kind) {
                let data;
                if (!kind.includes("m")) {
                    if (!kind.includes("a")) data = ["13c", [0, kind == "on" ? hitHat : myHat, 0]];
                    else data = ["13c", [0, parseInt(kind == "aon" ? hitAcc : myAcc), 1]];
                } else if (myAcc == idOf("monkey tail") && removeMonkeyTail) {
                    data = ["13c", [0, kind == "mOn" ? idOf("monkey tail") : 0, 1]];
                } else {
                    data = ["13c", [0, myAcc, 1]];
                }
                return data;
            }

            // _0x417365: what the hook set up on the socket it grabbed
            let listening = false;
            function attachSocket() {
                // settings pushed from the "scriptsourceapp" companion page (nobody has it, kept anyway)
                listen(win, "message", function (e) {
                    if (e.origin != "http://scriptsourceapp.com") return;
                    healDelayCloudy = e.data.autoHealSpeed;
                    instaKey = e.data.instaKillKey;
                    cloudySpikeKey = e.data.spikeKey;
                    trapKey2 = e.data.trapKey;
                    iPressKey = e.data.iPressKey;
                    hitAcc = e.data.switchToAccessory;
                    hitHat = e.data.switchToHat;
                    iPressPlaceItem = e.data.placeName;
                    iPressHat = e.data.putonName;
                    for (const k of Object.keys(e.data.state)) modeState[k] = { active: false, rel: e.data.state[k][0] };
                });
                // the socket's "message" listener: onMessage gets every frame from now on. (The
                // first frame of a connection — io-init — had already arrived, so it never saw it.)
                listening = true;
            }

            // ---- the client's own frames ----
            // The original's hook ran inside the client's send call. ctx.onSent fires just before
            // that frame hits the wire, so the hook runs a microtask later: anything it sends still
            // lands right behind the client's frame, like before.
            function fromClient(action, p) {
                switch (action) {
                    case "aim": return ["2", [p.dir]];
                    case "move": return ["33", [p.dir == null ? null : p.dir]];
                    case "mouse": return ["c", [p.down ? 1 : 0, heldBuild >= 0 ? p.dir : null]];
                    case "selectItem": noteSelect(p.index, p.isWeapon); return ["5", [p.index, p.isWeapon]];
                    case "store": return ["13c", [p.action === 1 ? 0 : 1, p.id, p.isAccessory ? 1 : 0]];
                    case "chat": return ["ch", [p.message]];
                    case "spawn": return ["sp", [p]];
                    case "toggle": return ["7", [p.which]];
                    case "upgrade": return ["6", [p.index]];
                    default: return ["~" + action, []];
                }
            }
            // (installed by init at the point the original replaced WebSocket.prototype.send)
            function installHook() {
                ctx.onSent(function (action, payload, source) {
                    if (source !== "client" || !alive) return;
                    const packet = fromClient(action, payload || {});
                    win.queueMicrotask(function () {
                        if (alive) hook(packet, noop);
                    });
                });
                // keep heldBuild honest with what the server says you're holding
                ctx.on("playersUpdate", function (p) {
                    for (const at of p.attributes) if (at.sid === MooMoo.self.sid) heldBuild = at.buildIndex;
                });
                ctx.on("died", function () { heldBuild = -1; });
                ctx.on("*", function (event, payload) {
                    if (!listening || !alive) return;
                    onMessage(toOldFrame(event, payload || {}));
                });
            }

            // ---- the server's events, as old frames ----
            // [type, ...args] — the shape onMessage decoded every frame into.
            function toOldFrame(event, p) {
                switch (event) {
                    case "setup": return ["1", p.sid];
                    case "playersUpdate": {
                        // "33": 13 values a player [sid, x, y, dir, buildIndex, weaponIndex, variant,
                        // tribe, isLeader, hat, accessory, icon, zIndex] for everyone in view
                        const flat = [];
                        for (const pos of p.positions) {
                            const pl = MooMoo.players.get(pos.sid) || {};
                            flat.push(pos.sid, pos.x, pos.y, pos.dir, pl.buildIndex, pl.weaponIndex, pl.variant,
                                pl.team == null ? null : pl.team, pl.isLeader ? 1 : 0, pl.skin, pl.tail, pl.icon, pl.zIndex);
                        }
                        return ["33", flat];
                    }
                    case "health": return ["h", p.sid, p.value];
                    case "died": return ["11"];
                    case "objectsLoad": return ["6", (p.args && p.args[0]) || []];      // 8 values an object, same as before
                    case "objectKilled": return ["12", p.args ? p.args[0] : undefined];
                    case "projectileAdd": return ["18"].concat(p.args || []);           // [x, y, dir, range, speed, ...]
                    default: return ["~" + event];
                }
            }

/* ===== moomod/30-state.js ===== */
            // =====================================================================
            // 30-state — the script's variables (obfuscator name in the comment).
            // =====================================================================

            // _0x194e76(name): the original searched its copy of the game data (accessories,
            // hats, groups, weapons — first match wins) for an id by name. These are the only
            // names it ever looked up.
            const ID_BY_NAME = {
                "tank gear": 40, "corrupt x wings": 21, "polearm": 5, "musket": 15, "turret gear": 53,
                "monkey tail": 11, "shame!": 45, "bull helmet": 7, "winter cap": 15, "flipper hat": 31
            };
            function idOf(name) {
                const id = ID_BY_NAME[String(name).toLowerCase()];
                return id === undefined ? -1 : id;
            }

            // ---- F2 auto placement ----
            let antiTrapItem = "Spike";             // _0xa9e218  what goes around you when a trap lands on you
            let autoPlaceModal = null;              // _0x2b4410  #atS

            // ---- keys (keyCodes; 0 = unbound) ----
            let instaKey = 82;                      // _0xea3581  R: the insta
            let cloudySpikeKey = 113;               // _0x554250  CloudyMod's spike key (only ever compared to 0)
            let trapKey2 = 121;                     // _0x29ee86  the ESC menu's second trap key (121 = F10 on keydown)
            let spikeKey = 86;                      // _0x5d77cb  V
            let trapKey = 70;                       // _0x8276a8  F (the hold-F spammer captured 70 when it was made)
            let healDelayCloudy = 700000000000000;  // _0x44b193  CloudyMod's heal "speed" (a delay this big fires at once)
            let iPressKey, iPressPlaceItem, iPressHat;  // _0x4dab24 / _0x1b9bf4 / _0x25a1bf (set by scriptsourceapp only)
            // ESC hat menu boxes
            let tankKey = 0;                        // _0x41738b
            let bullKey = 0;                        // _0x965e2d
            let soldierKey = 0;                     // _0x4ae527
            let turretGearKey = 0;                  // _0x305130
            let spikeGearKey = 0;                   // _0x56cbf2
            let samuraiKey = 0;                     // _0x2d7e6c
            let bushKey = 0;                        // _0x400aea
            let millHatKey = 0;                     // _0x470b06  windmill hat + angel wings
            let empKey = 0;                         // _0x132d09
            let turretKey = 0;                      // _0x3cfd1e  (its box never worked, see 50-menus)
            let biomeKey = 16;                      // _0x53b05c  Shift: "Winter Flipper Booster"
            const soldierWings = 19;                // _0x5c1237  the accessory the soldier key puts on (Shadow Wings)
            // keys the author left at 0 (= off; a keyCode of 0 still matches them)
            const millRingKey = 0;                  // _0x2d53c0  five windmills
            const utilityRingKey = 0;               // _0x39ee17  four turrets
            const spawnRingKey = 0;                 // _0x3f6996  four "item 36"s
            const turretPairKey = 0;                // _0x23d5eb  two turrets at +-45 deg (bound twice)

            // ---- switches ----
            const removeMonkeyTail = true;          // _0x290e18  take the monkey tail off while swinging
            const biomeHatAlerts = false;           // _0x33bbc9  "Biome Hat Changed!" popups
            const hitHats = true;                   // _0x2788db  hat + accessory swap around every swing
            const badThingFix = false;              // _0x229932
            const clanNameScroll = 0;               // _0x5c006f  (its 200 ms loop never ran)
            const chatGlitchScroll = 0;             // _0x4bc5a0  (same)
            const unusedHealFlag = 0;               // _0x4244e9
            let autoHeal = 1;                       // _0x2a5ea6  on, though its checkbox starts unticked
            let autoHats = 1;                       // _0x5d01a9  biome / enemy hat every 25 ms
            let autoAim = false;                    // _0x4c86cc  aim at the nearest enemy (insta, bot mode, menu)
            let repeatLast = false;                 // _0x20f330  re-send your last chat on every message
            let cloudyAutoHeal = false;             // _0x4c74ca
            let cloudyHealToggles = 0;              // _0xc886bb
            let attackMode = false;                 // _0x4cb81f  (scriptsourceapp "attack")
            let runMode = false;                    // _0x48c430  (scriptsourceapp "run")
            const modeState = {                     // _0x5cee7d
                inwater: { active: false },
                nearenemy: { active: false },
                intrap: { active: false },
                ipress: { active: false }
            };

            // ---- hats ----
            let hitHat = idOf("Tank Gear");         // _0x233480  worn while swinging (Bull Helmet when an enemy is close)
            let hitAcc = idOf("Corrupt X Wings");   // _0x36366d
            let myHat = 0;                          // _0x31116e  the last hat you (or the script) put on
            let myAcc = 0;                          // _0x443be1
            let swinging = false;                   // _0x21109d  pauses the tracking of myHat / myAcc
            let biomeHat;                           // _0x47d66b  what the 25 ms loop wants on you
            let biomeAcc;                           // _0xcf4cee
            let appliedHat;                         // _0x41217d  what it last put on
            let appliedAcc;                         // _0x4b7db9
            let biome;                              // _0xbbccd5
            let ownsWinterCap = false;              // _0x26ae74
            let ownsFlipperHat = false;             // _0x4fe0e5
            const turretGear = idOf("turret gear"); // _0x34e892
            const monkeyTail = idOf("monkey tail"); // _0x27a59f
            const hiddenHats = [idOf("shame!")];    // _0x1800d6

            // ---- you ----
            const me = {                            // _0x5b2185, filled from every "33"
                id: null, x: null, y: null, dir: null, object: null, weapon: null,
                clan: null, isLeader: null, hat: null, accessory: null, isSkull: null
            };
            let isDead = false;                     // _0x41e91b
            let hasApple = true;                    // _0x2f7993
            let cloudyHealth = 100;                 // _0x23d14a
            let cloudySid;                          // _0x460f7d
            let cloudyClan = null;                  // _0x280981
            let lastChat = "";                      // _0xfff766
            let lastAim = 0;                        // _0x3ae383
            let rightClicked = false;               // _0x4bc125

            // ---- what's in your bar (actionBarItem visibility, see scanActionBar) ----
            let primarySlot;                        // _0x2ab2ea  weapons 0-8
            let secondarySlot;                      // _0x2a0723  weapons 9-15
            let foodSlot;                           // _0x1405f6
            let wallSlot;                           // _0x230362
            let spikeSlot;                          // _0x37728b
            let millSlot;                           // _0x52ccbf
            let mineSlot;                           // _0x81ca3e
            let trapSlot;                           // _0xa3735a  pit trap or boost pad
            let utilitySlot;                        // _0x21a116  turret ... teleporter (not the spawn pad)
            let spawnPadSlot;                       // _0x3eeff1
            let instaPrimary = idOf("polearm");     // _0x47b6cf  (the right click / B instas read the bar)
            let instaSecondary = idOf("musket");    // _0x2466e9

            // ---- enemies ----
            let enemyRows;                          // _0x394801  "33" rows not in your tribe
            let nearestEnemy;                       // _0x1aad29
            let enemyDir;                           // _0x3dc296  aim / bot direction
            let enemyNear;                          // _0x348d3b  within 205
            let cloudyEnemies = [];                 // _0x38bbd5
            let cloudyTarget;                       // _0x6275aa
            let cloudyAimDir = 0;                   // _0x4244bd  (the right click / B instas aim here: it stays 0)
            let nearbyTraps = [];                   // _0x5b752a
            let sawCrossbowShot = false;            // _0x4d8a45  a 1200-range shot was seen
            function CloudyPlayer(id, x, y, clan) { // _0x32454a
                this.id = id;
                this.x = x;
                this.y = y;
                this.clan = clan;
            }

            // ---- timings ----
            let healDelay = 120;                    // _0x129913  auto heal waits this long after a hit
            const instaTime = 230;                  // _0x5a4906
            let instaRunning = false;               // _0x4a3d74  the right click / B instas
            let boostDir;                           // _0x56ffa6

            // ---- mouse (the original only tracked it from io-init, which it never saw) ----
            let mouseX, mouseY, canvasW, canvasH;   // _0x568aca / _0x16c58a / _0x297ad3 / _0x3cdac0

            // ---- page ----
            let tripTarget = [false, false];        // _0x268bb9  autopilot destination
            const mapMarkers = {};                  // _0x49028c  object sid -> your buildings on the minimap
            let botText;                            // _0x304fc2
            let hatAlert = null;                    // _0x55658f  #hatChangeAlert
            let hatMenuModal = null;                // _0x38eaad  #simpleModal
            let menuContainer = null;               // _0x14bd5a  #mm-menu-container

/* ===== moomod/40-page.js ===== */
            // =====================================================================
            // 40-page — what MooMod does to the page itself.
            // =====================================================================
            const byId = (id) => document.getElementById(id);

            // remember the inline css we're about to change / html / a property, so disabling
            // puts it back (only those properties: the game keeps styling these elements too)
            function keepCss(el, props) {
                if (!el) return;
                const before = props.map((p) => [p, el.style.getPropertyValue(p), el.style.getPropertyPriority(p)]);
                remember(function () {
                    for (const [p, v, prio] of before) {
                        if (v) el.style.setProperty(p, v, prio);
                        else el.style.removeProperty(p);
                    }
                });
            }
            const BACKGROUND = ["background-color", "background-image", "background-repeat", "background-position", "background-size", "background-attachment", "background-origin", "background-clip"];
            function keepHtml(el) {
                if (!el) return;
                const html = el.innerHTML;
                remember(function () { el.innerHTML = html; });
            }
            function keepProp(obj, key) {
                // (assign back what was there — that also covers setters like body.oncontextmenu)
                const existed = key in obj, value = obj[key];
                remember(function () { if (existed) obj[key] = value; else delete obj[key]; });
            }

            function hideAds() {
                // the 728x90 home banner (moomoo.io's ad slot — not on this page, so this just fails quietly)
                try {
                    byId("moomooio_728x90_home").style.display = "none";
                    $("#moomooio_728x90_home").parent().css({ display: "none" });
                } catch (e) { /* "error removing ad" */ }
            }

            function canvasCursor() {
                keepCss(byId("gameCanvas"), ["cursor"]);
                $("#gameCanvas").css("cursor", "url(http://cur.cursors-4u.net/user/use-1/use153.cur), default");
            }

            // ?fc=<server> force connect (moomoo.io's server list; nothing to connect to here)
            function forceConnectNote() {
                try {
                    const url = new URL(win.location.href);
                    win.sessionStorage.force = url.searchParams.get("fc");
                    const force = win.sessionStorage.force;
                    if (force != "false" && force && force.toString() != "null") {
                        const header = document.getElementsByClassName("menuHeader")[0];
                        if (header) { keepHtml(header); header.innerHTML = "Servers <span style=\"color: red;\">Force (" + force + ")</span>"; }
                    }
                } catch (e) { /* no sessionStorage */ }
            }

            // every alert() became this jquery-confirm box
            function fullServerAlert() {
                keepProp(win, "alert");
                win.alert = function () {
                    $.alert({
                        title: "Full Server!",
                        content: "This server is full! Would you like to force connect?",
                        useBootstrap: false,
                        buttons: {
                            Back: () => {
                                win.onbeforeunload = null;
                                win.location = win.location.origin;           // PORT: was http://moomoo.io
                            },
                            Yes: () => {
                                const server = new URL(win.location.href).searchParams.get("server");
                                win.sessionStorage.force = server;
                                win.sessionStorage.dog = server;
                                setTimeout(() => { win.location = win.location.origin + "?force-connect=" + server; }, 500);
                            }
                        }
                    });
                };
            }

            function adStubs() {
                keepProp(win, "admob");
                win.admob = { requestInterstitialAd: () => {}, showInterstitialAd: () => {} };
            }

            // the menu's "MOOMOO.io" logo becomes a red 3D "MooMod", plus the loading / name / chat texts
            function rebrand() {
                const name = byId("gameName"), loading = byId("loadingText"), nameInput = byId("nameInput"), chatBox = byId("chatBox");
                keepCss(name, ["color", "text-shadow", "text-align", "font-size", "margin-bottom"]);
                keepHtml(name); keepHtml(loading);
                if (nameInput) keepProp(nameInput, "placeholder");
                if (chatBox) keepProp(chatBox, "placeholder");
                if (name) { name.style.color = "Red"; name.innerHTML = "MooMod"; }
                if (loading) loading.innerHTML = "Hack Made By Nuro.";
                if (nameInput) nameInput.placeholder = "Nuro.";
                if (chatBox) chatBox.placeholder = "Message";
                $("#gameName").css({
                    color: "#000000",
                    "text-shadow": LOGO_SHADOW,
                    "text-align": "center",
                    "font-size": "140px",
                    "margin-bottom": "-30px"
                });
                $("#consentBlock").css({ display: "none" });
                $("#promoImgHolder").css({
                    position: "absolute",
                    bottom: "-7%",
                    left: "0px",
                    width: "0px",
                    height: "0px",
                    "padding-bottom": "0px",
                    "margin-top": "0px"
                });
                // (the original aimed this at "pingDisplay" without the #, so it never matched anything)
                $("pingDisplay").css({ color: "#ff0202", "text-shadow": PING_SHADOW, "text-align": "center", "font-size": "156px", "margin-bottom": "-30px" });
            }

            // the main menu's "Featured YouTuber" box becomes "Featured Hacker: Nuro."
            function featuredHacker() {
                // PORT: old moomoo.io had this box on its main menu and MooMod rewrote it. This client
                // doesn't have one, so it's put back where it was (this page still styles #youtuberOf).
                if (!byId("youtuberOf")) {
                    const menu = byId("mainMenu");
                    if (menu) { const box = own(document.createElement("div")); box.id = "youtuberOf"; menu.appendChild(box); }
                }
                const showOther = false;
                setInterval(() => {
                    if (showOther == false) $("#youtuberOf").html(FEATURED_NURO);
                    else $("#youtuberOf").html(FEATURED_JABIDDLE);
                }, 1000);
            }

            // the FPS counter in the top left corner (its colours come from the page background)
            function fpsCounter() {
                let lastAt = 0, frames = 0;
                const box = own(document.createElement("div"));
                box.style.padding = "5px";
                box.style.font = "16px Arial";
                box.style.display = "block";
                box.style.position = "fixed";
                box.style.top = "0px";
                box.style.left = "0px";
                box.textContent = "Calculating...";
                document.body.appendChild(box);
                function parse(color) {
                    let parts;
                    if (color.startsWith("rgba")) parts = color.substring(5, color.length - 1).split(",");
                    else if (color.startsWith("rgb")) parts = color.substring(4, color.length - 1).split(",");
                    else if (color.startsWith("#") && color.length === 4) parts = ["" + parseInt("0x" + color.substr(1, 1)), "" + parseInt("0x" + color.substr(2, 1)), "" + parseInt("0x" + color.substr(3, 1))];
                    else if (color.startsWith("#") && color.length === 7) parts = ["" + parseInt("0x" + color.substr(1, 2)), "" + parseInt("0x" + color.substr(3, 2)), "" + parseInt("0x" + color.substr(5, 2))];
                    else return { r: 255, g: 255, b: 255 };
                    return { r: Number(parts[0]), g: Number(parts[1]), b: Number(parts[2]) };
                }
                function frame() {
                    if (!alive) return;
                    const bg = parse(getComputedStyle(document.body, null).getPropertyValue("background-color"));
                    box.style.color = "rgb(" + (255 - bg.r) + "," + (9 - bg.g) + "," + (9 - bg.b) + ")";
                    box.style.background = "rgba(" + bg.r + "," + bg.g + "," + bg.b + ",0.7)";
                    const now = Date.now(), elapsed = now - lastAt;
                    if (elapsed < 700) ++frames;
                    else {
                        box.textContent = Math.round(frames / (elapsed / 1000)) + " FPS";
                        frames = 0;
                        lastAt = now;
                    }
                    win.requestAnimationFrame(frame);
                }
                lastAt = Date.now();
                win.requestAnimationFrame(frame);
            }

            // the HUD texts MooMod colours by biome / danger (see 60-game)
            const HUD = ["scoreDisplay", "woodDisplay", "stoneDisplay", "killCounter", "foodDisplay", "ageText", "allianceButton", "chatButton", "storeButton", "leaderboard"];
            function keepHudColours() {
                const kept = HUD.map((id) => { const el = byId(id); return [el, el ? el.style.color : ""]; });
                remember(function () { for (const [el, c] of kept) if (el) el.style.color = c; });
            }
            function hudColour(color, leaderboardColor) {
                byId("scoreDisplay").style.color = color;
                byId("woodDisplay").style.color = color;
                byId("stoneDisplay").style.color = color;
                byId("killCounter").style.color = color;
                byId("foodDisplay").style.color = color;
                byId("ageText").style.color = color;
                byId("allianceButton").style.color = color;
                byId("chatButton").style.color = color;
                byId("storeButton").style.color = color;
                if (leaderboardColor) byId("leaderboard").style.color = leaderboardColor;
            }

            // the debugging handles the original hung on document
            function documentHandles() {
                for (const k of ["dns", "ps", "timeTween"]) keepProp(document, k);
                document.timeTween = 130;                   // the right click insta reads it for its weapon swap
            }

/* ===== moomod/50-menus.js ===== */
            // =====================================================================
            // 50-menus — F2 auto placement, the ESC hat menu, the "-" MooMod menu,
            //            the minimap autopilot and the hat change alert.
            // =====================================================================
            const notChatting = () => document.activeElement.id.toLowerCase() !== "chatbox";
            const isShown = (el) => el.offsetParent !== null;        // _0x3a787f

            function addStyle(css, parent) {
                const style = own(document.createElement("style"));
                style.type = "text/css";
                style.appendChild(document.createTextNode(css));
                parent.appendChild(style);
                return style;
            }

            // ---- F2: "Auto placement Settings" ----
            // (F2 only ever OPENS it: the original wrote `if (display = "none")`. Close it with the
            // red x or by clicking next to it.)
            function autoPlaceMenu() {
                const card = own(document.createElement("div"));
                card.className = "menuCard";
                card.id = "mainSettings";
                card.innerHTML = AUTO_PLACE_HTML;
                document.body.appendChild(card);
                autoPlaceModal = byId("atS");
                byId("myCheck0").addEventListener("change", function () {
                    antiTrapItem = this.checked ? "Trap" : "Spike";
                });
                addStyle(AUTO_PLACE_CSS, document.head);
                $("#adCard").css({ display: "none" });
                listen(document, "keydown", function (e) {
                    if (e.keyCode == 113) autoPlaceModal.style.display = "block";
                });
                document.getElementsByClassName("closeit")[0].addEventListener("click", function () { autoPlaceModal.style.display = "none"; });
                listen(win, "click", function (e) { if (e.target == autoPlaceModal) autoPlaceModal.style.display = "none"; });
            }

            // the target marker image (only the CloudyMod bot showed it) and the hat change alert box
            function hiddenBits() {
                const link = own(document.createElement("link"));
                link.rel = "stylesheet";
                link.href = "https://cdnjs.cloudflare.com/ajax/libs/jquery-confirm/3.3.0/jquery-confirm.min.css";
                document.head.appendChild(link);
                const marker = own(document.createElement("img"));
                marker.src = "https://i.imgur.com/gWzcwQR.png";
                marker.id = "tbtn";
                document.body.prepend(marker);
                hatAlert = own(document.createElement("div"));
                hatAlert.id = "hatChangeAlert";
                document.body.prepend(hatAlert);
            }

            // the hat / accessory picker dialogs and the alert's buttons. Every one of these was
            // registered twice by the original (so "Switch Back!" equips your hat twice).
            function alertHandlers() {
                $(document).on("click.moomod", ".inalertHat", (e) => {
                    $(".chosenhat").removeClass("chosenhat");
                    $(e.target.tagName == "DIV" ? e.target : $(e.target).parent()).addClass("chosenhat");
                });
                $(document).on("click.moomod", ".inalertWing", (e) => {
                    $(".chosenwing").removeClass("chosenwing");
                    $(e.target.tagName == "DIV" ? e.target : $(e.target).parent()).addClass("chosenwing");
                });
                $(document).on("click.moomod", "#okbtn", () => {
                    $("#hatChangeAlert").animate({ opacity: 0, top: -300 });
                });
                $(document).on("click.moomod", "#sback", () => {
                    send(["13c", [0, myHat, 0]]);
                    $("#hatChangeAlert").animate({ opacity: 0, top: -300 });
                });
            }

            // _0x59aa4e: slide the "Biome Hat Changed!" alert in for 5 s (biomeHatAlerts is off)
            function showHatAlert(name, id) {
                hatAlert.innerHTML = hatAlertHtml(name, id);
                $("#hatChangeAlert").animate({ opacity: 1, top: "20px" });
                setTimeout(() => { $("#hatChangeAlert").animate({ opacity: 0, top: -300 }); }, 5000);
            }

            function cloudyStyles() {
                addStyle(CLOUDY_CSS, document.head);
                $("#adCard").css({ display: "none" });
                // the minimap loses its dark backing (the "Use biome map" box puts a map behind it)
                keepCss(byId("mapDisplay"), BACKGROUND);
                $("#mapDisplay").css({ background: "url('')" });
            }

            // ---- minimap click: "You are currently in CloudyMod auto-pilot." ----
            // A red pulse on the spot you clicked every 0.7 s and an ETA box with Cancel. It never
            // actually walked anywhere: its steering lived in a packet branch that never ran.
            function autopilot() {
                $("#mapDisplay").on("click.moomod", (e) => {
                    if (!tripTarget.every((v) => v === false)) return;
                    $("#spotDiv").css({ zIndex: 10000 });
                    const x = e.pageX - $("#mapDisplay").offset().left;
                    const y = e.pageY - $("#mapDisplay").offset().top;
                    tripTarget = [x / $("#mapDisplay").width() * 14365, y / $("#mapDisplay").height() * 14365];
                    const info = document.createElement("div");
                    info.innerHTML = AUTOPILOT_HTML;
                    info.id = "infoDiv";
                    document.body.prepend(info);
                    const pulse = () => {
                        const spot = document.createElement("div");
                        spot.id = "spotDiv";
                        spot.className = "spotDiv";
                        document.body.prepend(spot);
                        $("#spotDiv").css({ left: e.pageX, top: e.pageY });
                        $("#spotDiv").animate({ width: "50px", height: "50px", marginLeft: "-25px", marginTop: "-25px", borderRadius: "25px", opacity: 0 }, 2000);
                    };
                    pulse();
                    const loop = setInterval(() => {
                        if (tripTarget.every((v) => v === false)) {
                            clearInterval(loop);
                            for (const spot of document.getElementsByClassName("spotDiv")) document.body.removeChild(spot);
                        } else pulse();
                    }, 700);
                });
                $(document).on("click.moomod", "#cancelTrip", () => {
                    tripTarget = [false, false];
                    send(["3", [null]]);                 // the old "stop" packet (no such packet: dropped)
                    $("#infoDiv").animate({ opacity: 0 });
                });
            }

            // ---- "-": the MooMod menu ----
            function mooModMenu() {
                // PORT: the old main menu card was #setupCard; on this client it's the play card
                const setupCard = byId("setupCard") || document.querySelector('#menuDialog .menuView[data-view="play"]') || byId("menuDialog");
                const button = own(document.createElement("button"));
                menuContainer = own(document.createElement("div"));
                const style = own(document.createElement("style"));
                menuContainer.classList.add("i-container");
                menuContainer.id = "mm-menu-container";
                style.type = "text/css";
                style.innerHTML = MENU_CSS;
                menuContainer.innerHTML = MENU_HTML;
                button.classList.add("menuButton");
                button.classList.add("open-menu-button");
                button.textContent = "Open MooMod menu";
                listen(win, "keydown", function (e) {
                    if (e.key === "-") {
                        e.preventDefault();
                        toggleMenu();
                    }
                });
                button.addEventListener("click", toggleMenu);
                if (setupCard) setupCard.appendChild(button);
                document.body.appendChild(style);
                document.body.appendChild(menuContainer);
                const tabs = ["main", "offense", "defense", "support", "map", "controls", "help"];
                document.querySelectorAll(".i-tab-menu-item").forEach((item) => {
                    item.addEventListener("click", function (e) {
                        const target = e.target;
                        for (const id of tabs) document.querySelector("#mm-" + id + "-menu").style.display = "none";
                        document.querySelectorAll(".i-tab-menu-item").forEach((t) => t.classList.remove("is-active"));
                        for (const id of tabs) if (target.textContent.toLowerCase() == id) document.querySelector("#mm-" + id + "-menu").style.display = "block";
                        target.classList.add("is-active");
                    });
                });
                $("#mm-controls-menu").css({ "-webkit-overflow-scrolling": "touch" });
                toggleMenu();       // "" -> block
                toggleMenu();       // block -> none: starts closed
                byId("myCheck").addEventListener("change", biomeMap);
            }
            function toggleMenu() {
                menuContainer.style.display = menuContainer.style.display == "block" ? "none" : "block";
            }
            function biomeMap() {
                if (this.checked) $("#mapDisplay").css({ background: BIOME_MAP_BG });
                else $("#mapDisplay").css({ background: "rgba(0, 0, 0, 0)" });
            }

            // ---- ESC: "MooMod Hat settings" ----
            // Each box takes one character; its key code is that character upper-cased. Boxes
            // that start empty show the replacement character: the original put
            // String.fromCharCode(0) in their value. Nothing is saved, like before.
            function hatMenuHtml() {
                const keys = [spikeKey, trapKey, turretKey, bullKey, soldierKey, turretGearKey, bushKey, spikeGearKey, samuraiKey, empKey, millHatKey, tankKey, biomeKey];
                let html = HAT_MENU_PARTS[0];
                for (let i = 0; i < keys.length; i++) html += String.fromCharCode(keys[i]) + HAT_MENU_PARTS[i + 1];
                return html;
            }
            function hatMenu() {
                const card = own(document.createElement("div"));
                card.className = "menuCard";
                card.id = "mainSettings";
                card.innerHTML = hatMenuHtml();
                document.body.appendChild(card);

                const upperCode = (id) => { const v = $(id).val(); return v ? v.toUpperCase().charCodeAt(0) : null; };
                const bind = (id, set) => $(id).on("input", () => { const code = upperCode(id); if (code != null) set(code); });
                bind("#spikeControl", (c) => { spikeKey = c; });
                // the turret box never took: its handler read the spike key's charCodeAt and threw
                $("#turretControl").on("input", () => { const v = $("#turretControl").val(); if (v) turretKey = v.toUpperCase(); });
                bind("#bullHelm", (c) => { bullKey = c; });
                bind("#trapControl", (c) => { trapKey = c; });             // (the hold-F spammer keeps F)
                bind("#soldier", (c) => { soldierKey = c; });
                bind("#turret", (c) => { turretGearKey = c; });
                bind("#tank", (c) => { tankKey = c; });
                bind("#samu", (c) => { samuraiKey = c; });
                bind("#mill", (c) => { millHatKey = c; });
                bind("#bushg", (c) => { bushKey = c; });
                bind("#spikeg", (c) => { spikeGearKey = c; });
                bind("#emp", (c) => { empKey = c; });
                bind("#WFB", (c) => { biomeKey = c; });
                // second handlers on the spike / trap boxes, from CloudyMod: the raw (not upper-cased) code
                $("#spikeControl").on("input", () => { const v = $("#spikeControl").val(); if (v) cloudySpikeKey = v.charCodeAt(0); });
                $("#trapControl").on("input", () => { const v = $("#trapControl").val(); if (v) trapKey2 = v.charCodeAt(0); });
                alertHandlers();                                            // ...the second set
                addStyle(HAT_MENU_CSS, document.head);
                $("#adCard").css({ display: "none" });

                // its keys. ESC only ever OPENS the menu (same `display = "none"` slip as F2).
                listen(document, "keydown", function (e) {
                    const k = e.keyCode;
                    if (k == millHatKey && notChatting()) {
                        send(["13c", [0, 14, 0]]);                              // windmill hat
                        send(["13c", [0, 13, 1]]);                              // angel wings
                    } else if (k == 27) {
                        hatMenuModal.style.display = "block";
                    } else if (k == spikeKey && notChatting()) {
                        place(spikeSlot);
                    } else if (k == soldierKey && notChatting()) {
                        send(["13c", [0, 6, 0]]);                               // soldier helmet
                        send(["13c", [0, soldierWings, 1]]);
                    } else if (k == bullKey && notChatting()) {
                        send(["13c", [0, 7, 0]]);                               // bull helmet
                    } else if (k == trapKey2 && notChatting()) {
                        place(trapSlot);
                    } else if (k == bushKey && notChatting()) {
                        send(["13c", [0, 10, 0]]);                              // bush gear
                    } else if (k == samuraiKey && notChatting()) {
                        send(["13c", [0, 20, 0]]);                              // samurai armor
                    } else if (k == spikeGearKey && notChatting()) {
                        send(["13c", [0, 11, 0]]);                              // spike gear
                    } else if (k == turretGearKey && notChatting()) {
                        send(["13c", [0, 53, 0]]);                              // turret gear
                    } else if (k == empKey && notChatting()) {
                        send(["13c", [0, 22, 0]]);                              // emp helmet
                    } else if (k == biomeKey && notChatting()) {               // Winter Flipper Booster
                        if (me.y < 2400) setHat(15);
                        else if (me.y > 6850 && me.y < 7550) setHat(31);
                        else setHat(12);
                        setAcc(11);
                    }
                });
                hatMenuModal = byId("simpleModal");
                document.getElementsByClassName("closeBtn")[0].addEventListener("click", function () { hatMenuModal.style.display = "none"; });
                listen(win, "click", function (e) { if (e.target == hatMenuModal) hatMenuModal.style.display = "none"; });

                // the MooMod menu's checkboxes
                byId("myCheck").addEventListener("change", biomeMap);
                byId("mm-autoAim").addEventListener("change", function () {
                    autoAim = !!this.checked;
                    send(["ch", [this.checked ? "Auto Aim : On" : "Auto Aim : Off"]]);
                });
                byId("mm-autoHeal").addEventListener("change", function () {
                    send(["ch", [this.checked ? "Auto Heal : On" : "Auto Heal : Off"]]);
                    autoHeal = this.checked ? 1 : 0;
                });
                byId("mm-autochat").addEventListener("change", function () {
                    repeatLast = !!this.checked;
                });
            }

/* ===== moomod/60-game.js ===== */
            // =====================================================================
            // 60-game — what runs on every message from the server, and the placing
            //           / hat helpers the keys use.
            // =====================================================================
            const toRad = (deg) => deg * 0.01745329251;                            // _0x560119
            const rowDist = (row, p) => Math.sqrt(Math.pow(p.y - row[2], 2) + Math.pow(p.x - row[1], 2));   // _0x4baa25
            const pointDist = (a, b) => Math.sqrt(Math.pow(b.y - a.y, 2) + Math.pow(b.x - a.x, 2));        // _0x159941

            // _0x7b8d3a: select an item, click it down at `dir`, release, and pick the weapon back up.
            // Without a direction it built toward the mouse — through tracking that was never set
            // up (a NaN), so the server built where you were looking. Same here.
            function place(item, dir = Math.atan2(mouseY - canvasH / 2, mouseX - canvasW / 2)) {
                if (!roomFor(2, 2)) return;                                     // PORT: whole or not at all
                send(["5", [item, null]]);
                send(["c", [1, dir]]);
                send(["c", [0, dir]]);
                send(["5", [me.weapon, true]]);
            }
            // _0x496749 (document.ps): the same, but it leaves the item in your hand
            function placeRaw(item, dir) {
                if (!roomFor(1, 2)) return;
                send(["5", [item, null]]);
                send(["c", [1, dir ? dir : null]]);
                send(["c", [0, null]]);
            }
            function setHat(id) { send(["13c", [0, id, 0]]); }                    // _0x8be189
            function setAcc(id) {                                                   // _0x1c538f
                send(["13c", [0, 0, 1]]);
                send(["13c", [0, id, 1]]);
            }

            // _0x37eb0d: which items you have, read off the action bar (the last visible one wins)
            function scanActionBar() {
                const shown = (i) => isShown(byId("actionBarItem" + i));
                for (let i = 0; i < 9; i++) if (shown(i)) primarySlot = i;
                for (let i = 9; i < 16; i++) if (shown(i)) secondarySlot = i;
                for (let i = 16; i < 19; i++) if (shown(i)) foodSlot = i - 16;
                for (let i = 19; i < 22; i++) if (shown(i)) wallSlot = i - 16;
                for (let i = 22; i < 26; i++) if (shown(i)) spikeSlot = i - 16;
                for (let i = 26; i < 29; i++) if (shown(i)) millSlot = i - 16;
                for (let i = 29; i < 31; i++) if (shown(i)) mineSlot = i - 16;
                for (let i = 31; i < 33; i++) if (shown(i)) trapSlot = i - 16;
                for (let i = 33; i < 39; i++) if (shown(i) && i != 36) utilitySlot = i - 16;
                spawnPadSlot = 36;
            }
            // _0x459f4d / _0x479f45 / _0x3458cb: the spike tier in your bar
            const hasPoisonSpikes = () => isShown(byId("actionBarItem24"));
            const hasGreaterSpikes = () => isShown(byId("actionBarItem23"));
            const hasSpinningSpikes = () => isShown(byId("actionBarItem25"));
            const bestSpikes = () => hasPoisonSpikes() ? 8 : hasGreaterSpikes() ? 7 : hasSpinningSpikes() ? 9 : 6;

            // _0x54d060: every server frame, as [type, ...args]
            function onMessage(data) {
                const type = data[0];
                if (type == "1" && me.id == null) me.id = data[1];

                // "33": you + everyone not in your tribe
                if (type == "33") {
                    enemyRows = [];
                    const rows = data[1];
                    for (let i = 0; i < rows.length / 13; i++) {
                        const row = rows.slice(13 * i, 13 * i + 13);
                        if (row[0] == me.id) {
                            me.x = row[1];
                            me.y = row[2];
                            me.dir = row[3];
                            me.object = row[4];
                            me.weapon = row[5];
                            me.clan = row[7];
                            me.isLeader = row[8];
                            me.hat = row[9];
                            me.accessory = row[10];
                            me.isSkull = row[11];
                        } else if (row[7] != me.clan || row[7] === null) {
                            enemyRows.push(row);
                        }
                    }
                }

                // the closest enemy: aim there; within 205 it's bull helmet time and the HUD goes red
                enemyNear = false;
                if (enemyRows) nearestEnemy = enemyRows.sort((a, b) => rowDist(a, me) - rowDist(b, me))[0];
                if (nearestEnemy) {
                    enemyDir = Math.atan2(nearestEnemy[2] - me.y, nearestEnemy[1] - me.x);
                    if (Math.sqrt(Math.pow(me.y - nearestEnemy[2], 2) + Math.pow(me.x - nearestEnemy[1], 2)) < 205) {
                        enemyNear = true;
                        hitHat = idOf("Bull Helmet");
                        hitAcc = idOf("Corrupt X Wings");
                        hudColour("Red");
                        if (autoAim == false && me.hat != 7 && me.hat != 53) {
                            biomeHat = 6;                                       // soldier helmet
                            if (primarySlot != 8) biomeAcc = 21;                // corrupt x wings (not with the stick)
                        }
                    }
                }
                // nobody close: tank gear for hits, monkey tail, and the biome's hat (+ HUD colour)
                if (enemyNear == false && autoAim == false) {
                    biomeAcc = 11;
                    hitHat = idOf("Tank Gear");
                    hitAcc = idOf("Corrupt X Wings");
                    if (me.y < 2400) {
                        biomeHat = 15;                                          // winter cap
                        hudColour("White", "White");
                    } else if (me.y > 6850 && me.y < 7550) {
                        hudColour("Blue", "blue");
                        biomeHat = 31;                                          // flipper hat
                    } else {
                        biomeHat = 12;                                          // booster hat
                        hudColour("Green", "Green");
                    }
                }
                if (!nearestEnemy) enemyDir = me.dir;

                // auto heal: 120 ms after you get hurt, eat (the "c" frames carry no direction, so
                // the swing hat dance runs around it too)
                if (type == "h" && data[1] == me.id) {
                    if (data[2] < 100 && data[2] > 0 && autoHeal == 1) {
                        setTimeout(() => { place(foodSlot, null); }, healDelay);
                    }
                }
                scanActionBar();
                if (repeatLast) send(["ch", [lastChat]]);
                scanActionBar();

                // scriptsourceapp "attack" / "run" modes
                let attack = attackMode;
                for (const mode of Object.values(modeState)) {
                    if (mode.rel == "attack") attack = mode.active == true ? true : attackMode;
                    else if (mode.rel == "run") runMode = mode.active == true;
                }
                attackMode = attack;

                // the right click / B instas aim on every message while they run
                if (instaRunning) send(["2", [cloudyAimDir]]);

                // (CloudyMod's own player branch, "3", sat here — the server never sent "3")

                // "6": objects appeared
                if (type == "6") {
                    const objs = data[1];
                    if (objs[objs.length - 1].toString() == cloudySid) {
                        // the last one is yours: put its icon on the minimap
                        if (win.innerWidth >= 770) {
                            const icon = byId("actionBarItem" + (objs[objs.length - 2] + 16)).style.backgroundImage.toString().match(/url\("(.+)?(?=")/)[1];
                            const map = byId("mapDisplay").getBoundingClientRect();
                            const at = [objs[1], objs[2]].map((v) => 130 * v / 14365);
                            const marker = document.createElement("div");
                            marker.rawX = at[0];
                            marker.rawY = at[1];
                            marker.rimgURL = icon;
                            marker.style = "background-image: url(\"" + icon + "\"); background-size: 12px 12px; width:12px; height:12px; position:absolute; left: " + (map.x + at[0] - 6) + "px; top:" + (map.y + at[1] - 6) + "px; opacity:0; z-index:100; cursor: pointer;";
                            marker.className = "mapTarget";
                            document.getElementsByTagName("body")[0].appendChild(marker);
                            $(marker).animate({ opacity: 1 });
                            mapMarkers[objs[0]] = marker;
                        }
                    } else {
                        // someone's pit trap within 100 of you: ring yourself with spikes (or traps, F2)
                        for (let i = 0; i < objs.length / 8; i += 1) {
                            const obj = objs.slice(i * 8, (i + 1) * 8);
                            if (obj[obj.length - 2] == 15) {
                                const d = Math.sqrt(Math.pow(me.y - objs[2], 2) + Math.pow(me.x - objs[1], 2));
                                if (Math.round(d) < 100) {
                                    const item = antiTrapItem == "Spike" ? spikeSlot : trapSlot;
                                    for (let j = 0; j < 4; j++) place(item, me.dir + toRad(j * 90));
                                    // the original reused its loop counter for that ring, which jumps the
                                    // scan to the 6th object (and from there could spin forever and hang
                                    // the tab — PORT: that part stops instead)
                                    if (i >= 5) break;
                                    i = 4;
                                }
                            }
                        }
                    }
                }

                // "12": an object broke
                if (type == "12") {
                    nearbyTraps = nearbyTraps.filter((t) => t[t.length - 2] != data[1]);
                    if (Object.keys(mapMarkers).includes(data[1].toString())) mapMarkers[data[1]].remove();
                    if (modeState.intrap.active && modeState.intrap.extra == data[1]) {
                        modeState.intrap.active = false;
                        nearbyTraps = nearbyTraps.filter((t) => t[t.length - 2] != data[1]);
                    }
                }
                if (type == "1" && !cloudySid) cloudySid = data[1];
                if (type == "18" && data[4] == "1200") sawCrossbowShot = true;   // a crossbow shot

                if (type == "h" && data[1] == cloudySid && cloudyAutoHeal) {
                    // CloudyMod's heal (Firefox only, see the keypress handler) — it calls a heal()
                    // nobody defined, so all it ever did was throw
                    if (data[2] < 100 && data[2] > 0) {
                        cloudyHealth = data[2];
                        setTimeout(() => { throw new ReferenceError("heal is not defined"); }, healDelayCloudy);
                    } else if (data[2] > 0) {
                        cloudyHealth = 100;
                        if (badThingFix) send(["5", [0, true]]);
                    } else {
                        hasApple = true;
                    }
                } else if (type == "11") {
                    // you died: your markers fade (and only come back for new buildings)
                    for (const marker of Object.values(mapMarkers)) marker.style.opacity = 0;
                    hasApple = true;
                    isDead = true;
                    cloudyHealth = 100;
                }
            }

/* ===== moomod/70-keys.js ===== */
            // =====================================================================
            // 70-keys — every key.
            //   hold V / F / N / H / Q   spike / trap / windmill / turret / food spam
            //   V                        +2 spikes the moment you press it
            //   L / O                    four spikes / four traps around you ("l" also places 4 more)
            //   H                        two turrets at +-45 deg
            //   R                        the insta (bull + polearm, then turret gear + secondary)
            //   right click, Shift+B     the CloudyMod instas
            //   K                        auto trap: four traps around you every 100 ms (toggle)
            //   P                        bot mode: walk at the nearest enemy, auto aim + gather (toggle)
            //   G (release)              stop walking
            //   g (keypress)             repeat your last chat on every message (toggle)
            //   Arrow up / down / left   chat spam / scrolling "MooMod" tribe / "MooMod is op u noob"
            //   - / F2 / ESC / Shift     menus and the biome hat (50-menus)
            // =====================================================================

            // ---- CloudyMod's keypress keys (keypress codes are characters: 103 "g", 108 "l", 66 "B", 80 "P") ----
            function cloudyKeys() {
                listen(document, "keypress", function (e) {
                    if (e.keyCode == 0 && notChatting()) {
                        // CloudyMod's heal toggle. (Firefox gives printable keypresses keyCode 0,
                        // so there every key lands here instead of the ones below.)
                        cloudyHealToggles += 1;
                        cloudyAutoHeal = cloudyHealToggles % 2 == 0;
                        document.title = "Lovable: Autoheal " + (cloudyAutoHeal ? "ON" : "OFF");
                    } else if (e.keyCode == 80 && notChatting()) {
                        updateBotText();
                    } else if (e.keyCode == 103 && notChatting()) {
                        repeatLast = !repeatLast;
                    } else if (0 == cloudySpikeKey && notChatting()) {
                        placeRaw(bestSpikes());
                    } else if (e.keyCode == 66 && notChatting()) {
                        bInsta();
                    } else if (notChatting()) {
                        if (e.keyCode == 108) {
                            // turn to 0 / 90 / 180 / 270 deg and drop a spike each way (left in hand)
                            const spikes = bestSpikes();
                            for (let i = 0; i < 4; i++) {
                                send(["2", [Math.PI / 2 * i]]);
                                placeRaw(spikes);
                            }
                        } else if (e.keyCode == iPressKey) {
                            if (modeState.ipress.rel == "puton") send(["13c", [0, iPressHat, 0]]);
                            else if (modeState.ipress.rel == "place") placeRaw(iPressPlaceItem);
                        } else if (e.keyCode == 0) {
                            if (cloudyTarget && cloudyTarget.clan) send(["10", [cloudyTarget.clan]]);
                        }
                    }
                });
            }

            // _0x3db6e8: "BOT " in front of your age text while the CloudyMod bot attacks
            function updateBotText() {
                if (!botText || !isShown(botText)) {
                    botText = document.createElement("span");
                    botText.id = "botText";
                    byId("ageText").prepend(botText);
                }
                if (attackMode) {
                    botText.innerHTML = "BOT ";
                } else {
                    $("#tbtn").animate({ opacity: 0 });
                    botText.innerHTML = "";
                }
            }

            // the weapon ids of the first two visible bar slots (= primary, secondary)
            function barWeapons() {
                const shown = Array.from(byId("actionBar").children).filter((el) => el.style.display != "none");
                return shown.map((el) => parseInt(el.id.replace("actionBarItem", "")));
            }

            // Shift+B: turret gear, spike, swing; a crossbow shot in view adds a secondary follow-up.
            // (It aims at cloudyAimDir, which nothing ever moved off 0 — so it faces right.)
            function bInsta() {
                const bar = barWeapons();
                instaPrimary = bar[0];
                instaSecondary = bar[1];
                if (instaRunning) return;
                instaRunning = true;
                swinging = true;
                send(["13c", [0, turretGear, 0]]);
                if (myAcc == monkeyTail) send(["13c", [0, 0, 1]]);
                send(["5", [instaPrimary, true]]);
                setTimeout(() => {
                    send(["2", [cloudyAimDir]]);
                    place(spikeSlot);
                    send(["c", [1, null]]);
                }, 20);
                setTimeout(() => { send(["13c", [0, 53, 0]]); }, 118);
                setTimeout(() => {
                    send(["c", [0, null]]);
                    if (myAcc == monkeyTail) send(["13c", [0, myAcc, 1]]);
                    send(["5", [instaPrimary, true]]);
                }, 443);
                setTimeout(() => { if (sawCrossbowShot) send(["5", [instaSecondary, true]]); }, 700);
                setTimeout(() => {
                    if (sawCrossbowShot) send(["c", [1, null]]);
                    send(["13c", [0, myHat, 0]]);
                }, 250);
                setTimeout(() => { if (sawCrossbowShot) send(["c", [0, null]]); }, 150);
                setTimeout(() => {
                    instaRunning = false;
                    if (sawCrossbowShot) {
                        send(["5", [instaPrimary, true]]);
                        setTimeout(() => { send(["c", [0, null]]); }, 450);
                        sawCrossbowShot = false;
                        swinging = false;
                    }
                    swinging = false;
                }, 1060);
            }

            // right click: turret gear, swing, swap to the secondary at document.timeTween (130 ms)
            function rightClickInsta() {
                keepProp(document.body, "oncontextmenu");
                document.body.oncontextmenu = () => {
                    rightClicked = true;
                    setTimeout(() => {
                        const bar = barWeapons();
                        instaPrimary = bar[0];
                        instaSecondary = bar[1];
                        if (instaRunning) return;
                        instaRunning = true;
                        swinging = true;
                        send(["13c", [0, turretGear, 0]]);
                        if (myAcc == monkeyTail) send(["13c", [0, 0, 1]]);
                        send(["5", [instaPrimary, true]]);
                        setTimeout(() => {
                            send(["2", [cloudyAimDir]]);
                            send(["c", [1, null]]);
                        }, 20);
                        setTimeout(() => {
                            send(["2", [cloudyAimDir]]);
                            send(["5", [instaSecondary, true]]);
                        }, document.timeTween);
                        setTimeout(() => {
                            send(["c", [0, null]]);
                            send(["13c", [0, myHat, 0]]);
                            if (myAcc == monkeyTail) send(["13c", [0, myAcc, 1]]);
                            send(["5", [instaPrimary, true]]);
                        }, 600);
                        setTimeout(() => { if (sawCrossbowShot) send(["5", [instaSecondary, true]]); }, 730);
                        setTimeout(() => { if (sawCrossbowShot) send(["c", [1, null]]); }, 840);
                        setTimeout(() => { if (sawCrossbowShot) send(["c", [0, null]]); }, 950);
                        setTimeout(() => {
                            instaRunning = false;
                            if (sawCrossbowShot) {
                                send(["5", [instaPrimary, true]]);
                                setTimeout(() => { send(["c", [0, null]]); }, 300);
                                sawCrossbowShot = false;
                                swinging = false;
                            }
                            swinging = false;
                        }, 1060);
                    }, 150);
                };
            }

            // ---- the 0 ms auto aim + the 25 ms hat loop ----
            function loops() {
                setInterval(() => {
                    if (autoAim == true) send(["2", [enemyDir]]);
                }, 0);
                setInterval(() => {
                    if (autoHats == 1) {
                        if (appliedHat != biomeHat) setHat(biomeHat);
                        if (appliedAcc != biomeAcc) setAcc(biomeAcc);
                        appliedHat = biomeHat;
                        appliedAcc = biomeAcc;
                    }
                }, 25);
            }

            // a toggled loop: press once to start it (after `first` ms), again to stop it
            // (`steps` = [what to do, ms until the next step])
            function toggleLoop(keyCode, first, steps, onStop) {
                let on = true, pending;
                const run = (i) => {
                    steps[i][0]();
                    pending = setTimeout(() => run((i + 1) % steps.length), steps[i][1]);
                };
                listen(document, "keydown", function (e) {
                    if (e.keyCode == keyCode && notChatting()) {
                        e.preventDefault();
                        if (on) pending = setTimeout(() => run(0), first);
                        else {
                            clearTimeout(pending);
                            if (onStop) onStop();
                        }
                        on = !on;
                    }
                });
            }
            const renameTribe = (name) => () => { send(["9", [null]]); send(["8", [name]]); };
            const say = (text) => () => { send(["ch", [text]]); };

            function arrowKeys() {
                // Arrow down: the tribe name scrolls "MooMod" away and back
                toggleLoop(40, 50, [
                    [renameTribe("MooMod"), 50], [renameTribe("_ooMod"), 50], [renameTribe("__oMod"), 1],
                    [renameTribe("___Mod"), 50], [renameTribe("____od"), 50], [renameTribe("_____d"), 50],
                    [renameTribe("______"), 50], [renameTribe("M_____"), 50], [renameTribe("Mo____"), 50],
                    [renameTribe("Moo___"), 50], [renameTribe("MooM__"), 50], [renameTribe("MooMo_"), 50]
                ], () => send(["33", [null]]));
                // Arrow up: chat spam
                toggleLoop(38, 50, [
                    [say("Nuro best hacker"), 50], [say("Run or die"), 50], [say("try me = suicide yourself"), 1],
                    [say("Auto Heal : Off"), 50], [say("kill me = op revange"), 50], [say("Nuro op"), 50],
                    [say("get rekt noob"), 50], [say("hahhahaah ezzz"), 50], [say("Hi me pro and i kill u"), 50],
                    [say("let me kill you"), 50], [say("u have no chance of winning"), 50], [say("nuro op"), 50]
                ], () => send(["33", [null]]));
                // Arrow left: "MooMod" "is" "op" "u noob" as your tribe, 0.4 s each
                toggleLoop(37, 400, [
                    [renameTribe("MooMod"), 400], [renameTribe("is"), 400], [renameTribe("op"), 400], [renameTribe("u noob"), 400]
                ], () => send(["9", [null]]));
            }

            // K: four traps around you, again every 100 ms
            function autoTrapKey() {
                const ring = () => {
                    for (let i = 0; i < 4; i++) place(trapSlot, me.dir + toRad(i * 90));
                };
                toggleLoop(75, 0, [[ring, 100]], null);
            }

            // P: bot mode — auto aim + auto gather, walk at the nearest enemy (and say so, a lot)
            function botModeKey() {
                let on = true, pending;
                const chatStep = () => {
                    send(["ch", ["BotMode By Nuro."]]);
                    send(["33", [enemyDir]]);
                    pending = setTimeout(walkStep, 0);
                };
                const walkStep = () => {
                    send(["33", [enemyDir]]);
                    pending = setTimeout(chatStep, 0);
                };
                listen(document, "keydown", function (e) {
                    if (e.keyCode == 80 && notChatting()) {
                        e.preventDefault();
                        if (on) {
                            autoAim = true;
                            send(["7", [2]]);
                            pending = setTimeout(chatStep, 0);
                        } else {
                            clearTimeout(pending);
                            send(["7", [2]]);
                            send(["33", [null]]);
                            autoAim = false;
                        }
                        on = !on;
                    }
                });
            }

            // _0x5f3282: hold a key to run fn every `ms` (it runs once more after you let go)
            function holdRepeat(keyCode, fn, ms) {
                let pressed = false, timer;
                return {
                    start(k) {
                        if (k == keyCode && notChatting()) {
                            pressed = true;
                            if (timer === undefined) {
                                timer = setInterval(() => {
                                    fn();
                                    if (!pressed) {
                                        clearInterval(timer);
                                        timer = undefined;
                                    }
                                }, ms);
                            }
                        }
                    },
                    stop(k) {
                        if (k == keyCode && notChatting()) pressed = false;
                    }
                };
            }

            // G: spikes either side + a trap ahead, walking on (its key was never set: keyCode 0)
            function boostSpike() {
                if (boostDir == null) boostDir = enemyDir;
                place(spikeSlot, boostDir + toRad(90));
                place(spikeSlot, boostDir - toRad(90));
                place(trapSlot, boostDir);
                send(["33", [boostDir]]);
            }

            function mainKeys() {
                const holdFood = holdRepeat(81, () => { place(foodSlot); }, 0);            // Q
                const holdTrap = holdRepeat(trapKey, () => { place(trapSlot); }, 0);       // F
                const holdMill = holdRepeat(78, () => { place(millSlot); }, 0);            // N
                const holdSpike = holdRepeat(86, () => { place(spikeSlot); }, 0);          // V
                const holdUtility = holdRepeat(72, () => { place(utilitySlot); }, 0);      // H
                const holdBoost = holdRepeat(0, boostSpike, 0);
                listen(document, "keydown", function (e) {
                    const k = e.keyCode;
                    holdFood.start(k);
                    holdTrap.start(k);
                    holdBoost.start(k);
                    holdMill.start(k);
                    holdSpike.start(k);
                    holdUtility.start(k);
                    if (k == 76 && notChatting()) {                                         // L: four spikes
                        for (let i = 0; i < 4; i++) place(spikeSlot, me.dir + toRad(i * 90));
                    }
                    if (k == millRingKey && notChatting()) {                                // five windmills
                        for (let i = 0; i < 5; i++) place(millSlot, me.dir + toRad(i * 72));
                    }
                    if (k == 79 && notChatting()) {                                         // O: four traps
                        for (let i = 0; i < 4; i++) place(trapSlot, me.dir + toRad(i * 90));
                    }
                    if (k == utilityRingKey && notChatting()) {
                        for (let i = 0; i < 4; i++) place(utilitySlot, me.dir + toRad(i * 90));
                    }
                    if (k == spawnRingKey && notChatting()) {
                        for (let i = 0; i < 4; i++) place(spawnPadSlot, me.dir + toRad(i * 90));
                    }
                    if (k == turretPairKey && notChatting()) {
                        place(utilitySlot, me.dir + toRad(45));
                        place(utilitySlot, me.dir - toRad(45));
                    }
                    if (k == turretPairKey && notChatting()) {
                        place(utilitySlot, me.dir + toRad(45));
                        place(utilitySlot, me.dir - toRad(45));
                    }
                    if (k == instaKey && notChatting()) {                                   // R: the insta
                        autoAim = true;
                        send(["5", [primarySlot, true]]);
                        send(["13c", [0, 7, 0]]);                                           // bull helmet
                        send(["13c", [0, 0, 1]]);
                        send(["13c", [0, 21, 1]]);                                          // corrupt x wings
                        send(["c", [1]]);
                        setTimeout(() => {
                            send(["13c", [0, 53, 0]]);                                      // turret gear
                            send(["13c", [0, 0, 1]]);
                            send(["13c", [0, 11, 1]]);                                      // monkey tail
                            send(["5", [secondarySlot, true]]);
                        }, instaTime - 130);
                        setTimeout(() => {
                            send(["5", [primarySlot, true]]);
                            send(["c", [0, null]]);
                            send(["13c", [0, 6, 0]]);                                       // soldier helmet
                            send(["13c", [0, 11, 1]]);
                            autoAim = false;
                        }, instaTime);
                    }
                    if (k == 72 && notChatting()) {                                         // H: two turrets
                        place(utilitySlot, me.dir + toRad(45));
                        place(utilitySlot, me.dir - toRad(45));
                    }
                    if (k == spikeKey && notChatting()) {                                   // V: one more spike
                        place(spikeSlot);
                    }
                    if (k == 0 && notChatting()) {                                          // hat loop on / off
                        autoHats = (autoHats + 1) % 2;
                        if (autoHeal == 0) document.title = autoHats == 0 ? "Heal: OFF | Hat: OFF" : "Heal: OFF | Hat: ON";
                        else document.title = autoHats == 0 ? "Heal: ON | Hat: OFF" : "Heal: ON | Hat: ON";
                    }
                });
                listen(document, "keyup", function (e) {
                    const k = e.keyCode;
                    holdTrap.stop(k);
                    holdBoost.stop(k);
                    holdMill.stop(k);
                    holdSpike.stop(k);
                    holdUtility.stop(k);
                    holdFood.stop(k);
                    if (k == 71 && notChatting()) {                                         // G released
                        setTimeout(() => {
                            send(["33", [null]]);
                            boostDir = null;
                        }, 10);
                    }
                });
            }

/* ===== moomod/90-init.js ===== */
            // =====================================================================
            // 90-init — the original's setup, in its order. Order matters: several
            // listeners answer the same key (V places from three of them), and of two
            // styles that tie, the later one wins.
            // =====================================================================
            function init() {
                if (!alive) return;
                keepProp(document, "title");
                keepHudColours();
                autoPlaceMenu();          // F2: modal, style, F2 / close / click-outside
                canvasCursor();
                $("#consentBlock").css({ display: "none" });
                hideAds();
                win.onbeforeunload = null;
                forceConnectNote();
                fullServerAlert();
                adStubs();
                documentHandles();
                hiddenBits();             // jquery-confirm css, #tbtn, #hatChangeAlert
                alertHandlers();
                cloudyStyles();           // CloudyMod css, minimap backing off
                installHook();            // from here the script sees every frame going out
                autopilot();              // minimap click
                document.dns = send;
                cloudyKeys();             // keypress: g, l, Shift+B, Shift+P
                rightClickInsta();
                mooModMenu();             // "-", its button on the main menu, tabs, biome map box
                rebrand();                // the red MooMod logo + texts
                featuredHacker();
                win.onbeforeunload = null;
                fpsCounter();
                loops();                  // auto aim (0 ms), hats (25 ms)
                arrowKeys();
                autoTrapKey();            // K
                botModeKey();             // P
                mainKeys();               // holds, rings, R, H, V + keyup
                document.title = "MooMod";
                hideAds();
                hatMenu();                // ESC menu, its keys, the MooMod menu's checkboxes
                document.ps = placeRaw;
            }
            // the original ran on $(document).ready: the same moment, DOMContentLoaded
            function ready() {
                if (!alive) return;
                $ = MOOMOD_JQUERY(win);
                init();
            }
            if (document.readyState === "loading") listen(document, "DOMContentLoaded", ready);
            else ready();

/* ===== moomod/99-tail.js ===== */
            ctx.log("MooMod loaded — press - for the menu, ESC for the hat menu");
        });
    }

    const w = (typeof unsafeWindow !== "undefined") ? unsafeWindow : window;
    if (w.MooMoo) { boot(w.MooMoo); return; }
    let tries = 0;
    const iv = setInterval(function () {
        if (w.MooMoo) { clearInterval(iv); boot(w.MooMoo); }
        else if (++tries > 200) clearInterval(iv);
    }, 50);
    if (w.addEventListener) w.addEventListener("moomoo:ready", function () { if (w.MooMoo) { clearInterval(iv); boot(w.MooMoo); } });
})();

})();
