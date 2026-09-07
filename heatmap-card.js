/*
 * HeatMap card for Home Assistant
 *
 * Copyright 2023 Kriss Andsten
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/* ------------------------------------------------------------------------- */
/* chroma.js - color conversion library (third-party, pre-minified)        */
/* https://github.com/gka/chroma.js                                         */
/* ------------------------------------------------------------------------- */
/**
 * chroma.js - JavaScript library for color conversions
 *
 * Copyright (c) 2011-2019, Gregor Aisch
 * All rights reserved.
 *
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions are met:
 *
 * 1. Redistributions of source code must retain the above copyright notice, this
 * list of conditions and the following disclaimer.
 *
 * 2. Redistributions in binary form must reproduce the above copyright notice,
 * this list of conditions and the following disclaimer in the documentation
 * and/or other materials provided with the distribution.
 *
 * 3. The name Gregor Aisch may not be used to endorse or promote products
 * derived from this software without specific prior written permission.
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"
 * AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
 * IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
 * DISCLAIMED. IN NO EVENT SHALL GREGOR AISCH OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT,
 * INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING,
 * BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE,
 * DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY
 * OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING
 * NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE,
 * EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 *
 * -------------------------------------------------------
 *
 * chroma.js includes colors from colorbrewer2.org, which are released under
 * the following license:
 *
 * Copyright (c) 2002 Cynthia Brewer, Mark Harrower,
 * and The Pennsylvania State University.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND,
 * either express or implied. See the License for the specific
 * language governing permissions and limitations under the License.
 *
 * ------------------------------------------------------
 *
 * Named colors are taken from X11 Color Names.
 * http://www.w3.org/TR/css3-color/#svg-color
 *
 * @preserve
 */

 !function(r,e){"object"==typeof exports&&"undefined"!=typeof module?module.exports=e():"function"==typeof define&&define.amd?define(e):(r="undefined"!=typeof globalThis?globalThis:r||self).chroma=e()}(this,(function(){"use strict";for(var r=function(r,e,n){return void 0===e&&(e=0),void 0===n&&(n=1),r<e?e:r>n?n:r},e=r,n={},t=0,a=["Boolean","Number","String","Function","Array","Date","RegExp","Undefined","Null"];t<a.length;t+=1){var f=a[t];n["[object "+f+"]"]=f.toLowerCase()}var o=function(r){return n[Object.prototype.toString.call(r)]||"object"},u=o,c=o,i=Math.PI,l={clip_rgb:function(r){r._clipped=!1,r._unclipped=r.slice(0);for(var n=0;n<=3;n++)n<3?((r[n]<0||r[n]>255)&&(r._clipped=!0),r[n]=e(r[n],0,255)):3===n&&(r[n]=e(r[n],0,1));return r},limit:r,type:o,unpack:function(r,e){return void 0===e&&(e=null),r.length>=3?Array.prototype.slice.call(r):"object"==u(r[0])&&e?e.split("").filter((function(e){return void 0!==r[0][e]})).map((function(e){return r[0][e]})):r[0]},last:function(r){if(r.length<2)return null;var e=r.length-1;return"string"==c(r[e])?r[e].toLowerCase():null},PI:i,TWOPI:2*i,PITHIRD:i/3,DEG2RAD:i/180,RAD2DEG:180/i},h={format:{},autodetect:[]},s=l.last,d=l.clip_rgb,b=l.type,p=h,g=function(){for(var r=[],e=arguments.length;e--;)r[e]=arguments[e];var n=this;if("object"===b(r[0])&&r[0].constructor&&r[0].constructor===this.constructor)return r[0];var t=s(r),a=!1;if(!t){a=!0,p.sorted||(p.autodetect=p.autodetect.sort((function(r,e){return e.p-r.p})),p.sorted=!0);for(var f=0,o=p.autodetect;f<o.length;f+=1){var u=o[f];if(t=u.test.apply(u,r))break}}if(!p.format[t])throw new Error("unknown format: "+r);var c=p.format[t].apply(null,a?r:r.slice(0,-1));n._rgb=d(c),3===n._rgb.length&&n._rgb.push(1)};g.prototype.toString=function(){return"function"==b(this.hex)?this.hex():"["+this._rgb.join(",")+"]"};var v=g,m=function(){for(var r=[],e=arguments.length;e--;)r[e]=arguments[e];return new(Function.prototype.bind.apply(m.Color,[null].concat(r)))};m.Color=v,m.version="2.4.2";var y=m,k=l.unpack,w=Math.max,M=function(){for(var r=[],e=arguments.length;e--;)r[e]=arguments[e];var n=k(r,"rgb"),t=n[0],a=n[1],f=n[2],o=1-w(t/=255,w(a/=255,f/=255)),u=o<1?1/(1-o):0,c=(1-t-o)*u,i=(1-a-o)*u,l=(1-f-o)*u;return[c,i,l,o]},N=l.unpack,_=function(){for(var r=[],e=arguments.length;e--;)r[e]=arguments[e];var n=(r=N(r,"cmyk"))[0],t=r[1],a=r[2],f=r[3],o=r.length>4?r[4]:1;return 1===f?[0,0,0,o]:[n>=1?0:255*(1-n)*(1-f),t>=1?0:255*(1-t)*(1-f),a>=1?0:255*(1-a)*(1-f),o]},x=y,A=v,E=h,F=l.unpack,P=l.type,O=M;A.prototype.cmyk=function(){return O(this._rgb)},x.cmyk=function(){for(var r=[],e=arguments.length;e--;)r[e]=arguments[e];return new(Function.prototype.bind.apply(A,[null].concat(r,["cmyk"])))},E.format.cmyk=_,E.autodetect.push({p:2,test:function(){for(var r=[],e=arguments.length;e--;)r[e]=arguments[e];if(r=F(r,"cmyk"),"array"===P(r)&&4===r.length)return"cmyk"}});var j=l.unpack,G=l.last,R=function(r){return Math.round(100*r)/100},q=function(){for(var r=[],e=arguments.length;e--;)r[e]=arguments[e];var n=j(r,"hsla"),t=G(r)||"lsa";return n[0]=R(n[0]||0),n[1]=R(100*n[1])+"%",n[2]=R(100*n[2])+"%","hsla"===t||n.length>3&&n[3]<1?(n[3]=n.length>3?n[3]:1,t="hsla"):n.length=3,t+"("+n.join(",")+")"},L=l.unpack,I=function(){for(var r=[],e=arguments.length;e--;)r[e]=arguments[e];var n=(r=L(r,"rgba"))[0],t=r[1],a=r[2];n/=255,t/=255,a/=255;var f,o,u=Math.min(n,t,a),c=Math.max(n,t,a),i=(c+u)/2;return c===u?(f=0,o=Number.NaN):f=i<.5?(c-u)/(c+u):(c-u)/(2-c-u),n==c?o=(t-a)/(c-u):t==c?o=2+(a-n)/(c-u):a==c&&(o=4+(n-t)/(c-u)),(o*=60)<0&&(o+=360),r.length>3&&void 0!==r[3]?[o,f,i,r[3]]:[o,f,i]},B=l.unpack,C=l.last,D=q,Y=I,S=Math.round,T=function(){for(var r=[],e=arguments.length;e--;)r[e]=arguments[e];var n=B(r,"rgba"),t=C(r)||"rgb";return"hsl"==t.substr(0,3)?D(Y(n),t):(n[0]=S(n[0]),n[1]=S(n[1]),n[2]=S(n[2]),("rgba"===t||n.length>3&&n[3]<1)&&(n[3]=n.length>3?n[3]:1,t="rgba"),t+"("+n.slice(0,"rgb"===t?3:4).join(",")+")")},$=l.unpack,z=Math.round,X=function(){for(var r,e=[],n=arguments.length;n--;)e[n]=arguments[n];var t,a,f,o=(e=$(e,"hsl"))[0],u=e[1],c=e[2];if(0===u)t=a=f=255*c;else{var i=[0,0,0],l=[0,0,0],h=c<.5?c*(1+u):c+u-c*u,s=2*c-h,d=o/360;i[0]=d+1/3,i[1]=d,i[2]=d-1/3;for(var b=0;b<3;b++)i[b]<0&&(i[b]+=1),i[b]>1&&(i[b]-=1),6*i[b]<1?l[b]=s+6*(h-s)*i[b]:2*i[b]<1?l[b]=h:3*i[b]<2?l[b]=s+(h-s)*(2/3-i[b])*6:l[b]=s;t=(r=[z(255*l[0]),z(255*l[1]),z(255*l[2])])[0],a=r[1],f=r[2]}return e.length>3?[t,a,f,e[3]]:[t,a,f,1]},U=X,V=h,W=/^rgb\(\s*(-?\d+),\s*(-?\d+)\s*,\s*(-?\d+)\s*\)$/,K=/^rgba\(\s*(-?\d+),\s*(-?\d+)\s*,\s*(-?\d+)\s*,\s*([01]|[01]?\.\d+)\)$/,Z=/^rgb\(\s*(-?\d+(?:\.\d+)?)%,\s*(-?\d+(?:\.\d+)?)%\s*,\s*(-?\d+(?:\.\d+)?)%\s*\)$/,H=/^rgba\(\s*(-?\d+(?:\.\d+)?)%,\s*(-?\d+(?:\.\d+)?)%\s*,\s*(-?\d+(?:\.\d+)?)%\s*,\s*([01]|[01]?\.\d+)\)$/,J=/^hsl\(\s*(-?\d+(?:\.\d+)?),\s*(-?\d+(?:\.\d+)?)%\s*,\s*(-?\d+(?:\.\d+)?)%\s*\)$/,Q=/^hsla\(\s*(-?\d+(?:\.\d+)?),\s*(-?\d+(?:\.\d+)?)%\s*,\s*(-?\d+(?:\.\d+)?)%\s*,\s*([01]|[01]?\.\d+)\)$/,rr=Math.round,er=function(r){var e;if(r=r.toLowerCase().trim(),V.format.named)try{return V.format.named(r)}catch(r){}if(e=r.match(W)){for(var n=e.slice(1,4),t=0;t<3;t++)n[t]=+n[t];return n[3]=1,n}if(e=r.match(K)){for(var a=e.slice(1,5),f=0;f<4;f++)a[f]=+a[f];return a}if(e=r.match(Z)){for(var o=e.slice(1,4),u=0;u<3;u++)o[u]=rr(2.55*o[u]);return o[3]=1,o}if(e=r.match(H)){for(var c=e.slice(1,5),i=0;i<3;i++)c[i]=rr(2.55*c[i]);return c[3]=+c[3],c}if(e=r.match(J)){var l=e.slice(1,4);l[1]*=.01,l[2]*=.01;var h=U(l);return h[3]=1,h}if(e=r.match(Q)){var s=e.slice(1,4);s[1]*=.01,s[2]*=.01;var d=U(s);return d[3]=+e[4],d}};er.test=function(r){return W.test(r)||K.test(r)||Z.test(r)||H.test(r)||J.test(r)||Q.test(r)};var nr=y,tr=v,ar=h,fr=l.type,or=T,ur=er;tr.prototype.css=function(r){return or(this._rgb,r)},nr.css=function(){for(var r=[],e=arguments.length;e--;)r[e]=arguments[e];return new(Function.prototype.bind.apply(tr,[null].concat(r,["css"])))},ar.format.css=ur,ar.autodetect.push({p:5,test:function(r){for(var e=[],n=arguments.length-1;n-- >0;)e[n]=arguments[n+1];if(!e.length&&"string"===fr(r)&&ur.test(r))return"css"}});var cr=v,ir=y,lr=l.unpack;h.format.gl=function(){for(var r=[],e=arguments.length;e--;)r[e]=arguments[e];var n=lr(r,"rgba");return n[0]*=255,n[1]*=255,n[2]*=255,n},ir.gl=function(){for(var r=[],e=arguments.length;e--;)r[e]=arguments[e];return new(Function.prototype.bind.apply(cr,[null].concat(r,["gl"])))},cr.prototype.gl=function(){var r=this._rgb;return[r[0]/255,r[1]/255,r[2]/255,r[3]]};var hr=l.unpack,sr=function(){for(var r=[],e=arguments.length;e--;)r[e]=arguments[e];var n,t=hr(r,"rgb"),a=t[0],f=t[1],o=t[2],u=Math.min(a,f,o),c=Math.max(a,f,o),i=c-u,l=100*i/255,h=u/(255-i)*100;return 0===i?n=Number.NaN:(a===c&&(n=(f-o)/i),f===c&&(n=2+(o-a)/i),o===c&&(n=4+(a-f)/i),(n*=60)<0&&(n+=360)),[n,l,h]},dr=l.unpack,br=Math.floor,pr=function(){for(var r,e,n,t,a,f,o=[],u=arguments.length;u--;)o[u]=arguments[u];var c,i,l,h=(o=dr(o,"hcg"))[0],s=o[1],d=o[2];d*=255;var b=255*s;if(0===s)c=i=l=d;else{360===h&&(h=0),h>360&&(h-=360),h<0&&(h+=360);var p=br(h/=60),g=h-p,v=d*(1-s),m=v+b*(1-g),y=v+b*g,k=v+b;switch(p){case 0:c=(r=[k,y,v])[0],i=r[1],l=r[2];break;case 1:c=(e=[m,k,v])[0],i=e[1],l=e[2];break;case 2:c=(n=[v,k,y])[0],i=n[1],l=n[2];break;case 3:c=(t=[v,m,k])[0],i=t[1],l=t[2];break;case 4:c=(a=[y,v,k])[0],i=a[1],l=a[2];break;case 5:c=(f=[k,v,m])[0],i=f[1],l=f[2]}}return[c,i,l,o.length>3?o[3]:1]},gr=l.unpack,vr=l.type,mr=y,yr=v,kr=h,wr=sr;yr.prototype.hcg=function(){return wr(this._rgb)},mr.hcg=function(){for(var r=[],e=arguments.length;e--;)r[e]=arguments[e];return new(Function.prototype.bind.apply(yr,[null].concat(r,["hcg"])))},kr.format.hcg=pr,kr.autodetect.push({p:1,test:function(){for(var r=[],e=arguments.length;e--;)r[e]=arguments[e];if(r=gr(r,"hcg"),"array"===vr(r)&&3===r.length)return"hcg"}});var Mr=l.unpack,Nr=l.last,_r=Math.round,xr=function(){for(var r=[],e=arguments.length;e--;)r[e]=arguments[e];var n=Mr(r,"rgba"),t=n[0],a=n[1],f=n[2],o=n[3],u=Nr(r)||"auto";void 0===o&&(o=1),"auto"===u&&(u=o<1?"rgba":"rgb");var c=(t=_r(t))<<16|(a=_r(a))<<8|(f=_r(f)),i="000000"+c.toString(16);i=i.substr(i.length-6);var l="0"+_r(255*o).toString(16);switch(l=l.substr(l.length-2),u.toLowerCase()){case"rgba":return"#"+i+l;case"argb":return"#"+l+i;default:return"#"+i}},Ar=/^#?([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/,Er=/^#?([A-Fa-f0-9]{8}|[A-Fa-f0-9]{4})$/,Fr=function(r){if(r.match(Ar)){4!==r.length&&7!==r.length||(r=r.substr(1)),3===r.length&&(r=(r=r.split(""))[0]+r[0]+r[1]+r[1]+r[2]+r[2]);var e=parseInt(r,16);return[e>>16,e>>8&255,255&e,1]}if(r.match(Er)){5!==r.length&&9!==r.length||(r=r.substr(1)),4===r.length&&(r=(r=r.split(""))[0]+r[0]+r[1]+r[1]+r[2]+r[2]+r[3]+r[3]);var n=parseInt(r,16);return[n>>24&255,n>>16&255,n>>8&255,Math.round((255&n)/255*100)/100]}throw new Error("unknown hex color: "+r)},Pr=y,Or=v,jr=l.type,Gr=h,Rr=xr;Or.prototype.hex=function(r){return Rr(this._rgb,r)},Pr.hex=function(){for(var r=[],e=arguments.length;e--;)r[e]=arguments[e];return new(Function.prototype.bind.apply(Or,[null].concat(r,["hex"])))},Gr.format.hex=Fr,Gr.autodetect.push({p:4,test:function(r){for(var e=[],n=arguments.length-1;n-- >0;)e[n]=arguments[n+1];if(!e.length&&"string"===jr(r)&&[3,4,5,6,7,8,9].indexOf(r.length)>=0)return"hex"}});var qr=l.unpack,Lr=l.TWOPI,Ir=Math.min,Br=Math.sqrt,Cr=Math.acos,Dr=function(){for(var r=[],e=arguments.length;e--;)r[e]=arguments[e];var n,t=qr(r,"rgb"),a=t[0],f=t[1],o=t[2],u=Ir(a/=255,f/=255,o/=255),c=(a+f+o)/3,i=c>0?1-u/c:0;return 0===i?n=NaN:(n=(a-f+(a-o))/2,n/=Br((a-f)*(a-f)+(a-o)*(f-o)),n=Cr(n),o>f&&(n=Lr-n),n/=Lr),[360*n,i,c]},Yr=l.unpack,Sr=l.limit,Tr=l.TWOPI,$r=l.PITHIRD,zr=Math.cos,Xr=function(){for(var r=[],e=arguments.length;e--;)r[e]=arguments[e];var n,t,a,f=(r=Yr(r,"hsi"))[0],o=r[1],u=r[2];return isNaN(f)&&(f=0),isNaN(o)&&(o=0),f>360&&(f-=360),f<0&&(f+=360),(f/=360)<1/3?t=1-((a=(1-o)/3)+(n=(1+o*zr(Tr*f)/zr($r-Tr*f))/3)):f<2/3?a=1-((n=(1-o)/3)+(t=(1+o*zr(Tr*(f-=1/3))/zr($r-Tr*f))/3)):n=1-((t=(1-o)/3)+(a=(1+o*zr(Tr*(f-=2/3))/zr($r-Tr*f))/3)),[255*(n=Sr(u*n*3)),255*(t=Sr(u*t*3)),255*(a=Sr(u*a*3)),r.length>3?r[3]:1]},Ur=l.unpack,Vr=l.type,Wr=y,Kr=v,Zr=h,Hr=Dr;Kr.prototype.hsi=function(){return Hr(this._rgb)},Wr.hsi=function(){for(var r=[],e=arguments.length;e--;)r[e]=arguments[e];return new(Function.prototype.bind.apply(Kr,[null].concat(r,["hsi"])))},Zr.format.hsi=Xr,Zr.autodetect.push({p:2,test:function(){for(var r=[],e=arguments.length;e--;)r[e]=arguments[e];if(r=Ur(r,"hsi"),"array"===Vr(r)&&3===r.length)return"hsi"}});var Jr=l.unpack,Qr=l.type,re=y,ee=v,ne=h,te=I;ee.prototype.hsl=function(){return te(this._rgb)},re.hsl=function(){for(var r=[],e=arguments.length;e--;)r[e]=arguments[e];return new(Function.prototype.bind.apply(ee,[null].concat(r,["hsl"])))},ne.format.hsl=X,ne.autodetect.push({p:2,test:function(){for(var r=[],e=arguments.length;e--;)r[e]=arguments[e];if(r=Jr(r,"hsl"),"array"===Qr(r)&&3===r.length)return"hsl"}});var ae=l.unpack,fe=Math.min,oe=Math.max,ue=function(){for(var r=[],e=arguments.length;e--;)r[e]=arguments[e];var n,t,a,f=(r=ae(r,"rgb"))[0],o=r[1],u=r[2],c=fe(f,o,u),i=oe(f,o,u),l=i-c;return a=i/255,0===i?(n=Number.NaN,t=0):(t=l/i,f===i&&(n=(o-u)/l),o===i&&(n=2+(u-f)/l),u===i&&(n=4+(f-o)/l),(n*=60)<0&&(n+=360)),[n,t,a]},ce=l.unpack,ie=Math.floor,le=function(){for(var r,e,n,t,a,f,o=[],u=arguments.length;u--;)o[u]=arguments[u];var c,i,l,h=(o=ce(o,"hsv"))[0],s=o[1],d=o[2];if(d*=255,0===s)c=i=l=d;else{360===h&&(h=0),h>360&&(h-=360),h<0&&(h+=360);var b=ie(h/=60),p=h-b,g=d*(1-s),v=d*(1-s*p),m=d*(1-s*(1-p));switch(b){case 0:c=(r=[d,m,g])[0],i=r[1],l=r[2];break;case 1:c=(e=[v,d,g])[0],i=e[1],l=e[2];break;case 2:c=(n=[g,d,m])[0],i=n[1],l=n[2];break;case 3:c=(t=[g,v,d])[0],i=t[1],l=t[2];break;case 4:c=(a=[m,g,d])[0],i=a[1],l=a[2];break;case 5:c=(f=[d,g,v])[0],i=f[1],l=f[2]}}return[c,i,l,o.length>3?o[3]:1]},he=l.unpack,se=l.type,de=y,be=v,pe=h,ge=ue;be.prototype.hsv=function(){return ge(this._rgb)},de.hsv=function(){for(var r=[],e=arguments.length;e--;)r[e]=arguments[e];return new(Function.prototype.bind.apply(be,[null].concat(r,["hsv"])))},pe.format.hsv=le,pe.autodetect.push({p:2,test:function(){for(var r=[],e=arguments.length;e--;)r[e]=arguments[e];if(r=he(r,"hsv"),"array"===se(r)&&3===r.length)return"hsv"}});var ve={Kn:18,Xn:.95047,Yn:1,Zn:1.08883,t0:.137931034,t1:.206896552,t2:.12841855,t3:.008856452},me=ve,ye=l.unpack,ke=Math.pow,we=function(r){return(r/=255)<=.04045?r/12.92:ke((r+.055)/1.055,2.4)},Me=function(r){return r>me.t3?ke(r,1/3):r/me.t2+me.t0},Ne=function(r,e,n){return r=we(r),e=we(e),n=we(n),[Me((.4124564*r+.3575761*e+.1804375*n)/me.Xn),Me((.2126729*r+.7151522*e+.072175*n)/me.Yn),Me((.0193339*r+.119192*e+.9503041*n)/me.Zn)]},_e=function(){for(var r=[],e=arguments.length;e--;)r[e]=arguments[e];var n=ye(r,"rgb"),t=n[0],a=n[1],f=n[2],o=Ne(t,a,f),u=o[0],c=o[1],i=o[2],l=116*c-16;return[l<0?0:l,500*(u-c),200*(c-i)]},xe=ve,Ae=l.unpack,Ee=Math.pow,Fe=function(r){return 255*(r<=.00304?12.92*r:1.055*Ee(r,1/2.4)-.055)},Pe=function(r){return r>xe.t1?r*r*r:xe.t2*(r-xe.t0)},Oe=function(){for(var r=[],e=arguments.length;e--;)r[e]=arguments[e];var n,t,a,f=(r=Ae(r,"lab"))[0],o=r[1],u=r[2];return t=(f+16)/116,n=isNaN(o)?t:t+o/500,a=isNaN(u)?t:t-u/200,t=xe.Yn*Pe(t),n=xe.Xn*Pe(n),a=xe.Zn*Pe(a),[Fe(3.2404542*n-1.5371385*t-.4985314*a),Fe(-.969266*n+1.8760108*t+.041556*a),Fe(.0556434*n-.2040259*t+1.0572252*a),r.length>3?r[3]:1]},je=l.unpack,Ge=l.type,Re=y,qe=v,Le=h,Ie=_e;qe.prototype.lab=function(){return Ie(this._rgb)},Re.lab=function(){for(var r=[],e=arguments.length;e--;)r[e]=arguments[e];return new(Function.prototype.bind.apply(qe,[null].concat(r,["lab"])))},Le.format.lab=Oe,Le.autodetect.push({p:2,test:function(){for(var r=[],e=arguments.length;e--;)r[e]=arguments[e];if(r=je(r,"lab"),"array"===Ge(r)&&3===r.length)return"lab"}});var Be=l.unpack,Ce=l.RAD2DEG,De=Math.sqrt,Ye=Math.atan2,Se=Math.round,Te=function(){for(var r=[],e=arguments.length;e--;)r[e]=arguments[e];var n=Be(r,"lab"),t=n[0],a=n[1],f=n[2],o=De(a*a+f*f),u=(Ye(f,a)*Ce+360)%360;return 0===Se(1e4*o)&&(u=Number.NaN),[t,o,u]},$e=l.unpack,ze=_e,Xe=Te,Ue=function(){for(var r=[],e=arguments.length;e--;)r[e]=arguments[e];var n=$e(r,"rgb"),t=n[0],a=n[1],f=n[2],o=ze(t,a,f),u=o[0],c=o[1],i=o[2];return Xe(u,c,i)},Ve=l.unpack,We=l.DEG2RAD,Ke=Math.sin,Ze=Math.cos,He=function(){for(var r=[],e=arguments.length;e--;)r[e]=arguments[e];var n=Ve(r,"lch"),t=n[0],a=n[1],f=n[2];return isNaN(f)&&(f=0),[t,Ze(f*=We)*a,Ke(f)*a]},Je=l.unpack,Qe=He,rn=Oe,en=function(){for(var r=[],e=arguments.length;e--;)r[e]=arguments[e];var n=(r=Je(r,"lch"))[0],t=r[1],a=r[2],f=Qe(n,t,a),o=f[0],u=f[1],c=f[2],i=rn(o,u,c),l=i[0],h=i[1],s=i[2];return[l,h,s,r.length>3?r[3]:1]},nn=l.unpack,tn=en,an=function(){for(var r=[],e=arguments.length;e--;)r[e]=arguments[e];var n=nn(r,"hcl").reverse();return tn.apply(void 0,n)},fn=l.unpack,on=l.type,un=y,cn=v,ln=h,hn=Ue;cn.prototype.lch=function(){return hn(this._rgb)},cn.prototype.hcl=function(){return hn(this._rgb).reverse()},un.lch=function(){for(var r=[],e=arguments.length;e--;)r[e]=arguments[e];return new(Function.prototype.bind.apply(cn,[null].concat(r,["lch"])))},un.hcl=function(){for(var r=[],e=arguments.length;e--;)r[e]=arguments[e];return new(Function.prototype.bind.apply(cn,[null].concat(r,["hcl"])))},ln.format.lch=en,ln.format.hcl=an,["lch","hcl"].forEach((function(r){return ln.autodetect.push({p:2,test:function(){for(var e=[],n=arguments.length;n--;)e[n]=arguments[n];if(e=fn(e,r),"array"===on(e)&&3===e.length)return r}})}));var sn={aliceblue:"#f0f8ff",antiquewhite:"#faebd7",aqua:"#00ffff",aquamarine:"#7fffd4",azure:"#f0ffff",beige:"#f5f5dc",bisque:"#ffe4c4",black:"#000000",blanchedalmond:"#ffebcd",blue:"#0000ff",blueviolet:"#8a2be2",brown:"#a52a2a",burlywood:"#deb887",cadetblue:"#5f9ea0",chartreuse:"#7fff00",chocolate:"#d2691e",coral:"#ff7f50",cornflower:"#6495ed",cornflowerblue:"#6495ed",cornsilk:"#fff8dc",crimson:"#dc143c",cyan:"#00ffff",darkblue:"#00008b",darkcyan:"#008b8b",darkgoldenrod:"#b8860b",darkgray:"#a9a9a9",darkgreen:"#006400",darkgrey:"#a9a9a9",darkkhaki:"#bdb76b",darkmagenta:"#8b008b",darkolivegreen:"#556b2f",darkorange:"#ff8c00",darkorchid:"#9932cc",darkred:"#8b0000",darksalmon:"#e9967a",darkseagreen:"#8fbc8f",darkslateblue:"#483d8b",darkslategray:"#2f4f4f",darkslategrey:"#2f4f4f",darkturquoise:"#00ced1",darkviolet:"#9400d3",deeppink:"#ff1493",deepskyblue:"#00bfff",dimgray:"#696969",dimgrey:"#696969",dodgerblue:"#1e90ff",firebrick:"#b22222",floralwhite:"#fffaf0",forestgreen:"#228b22",fuchsia:"#ff00ff",gainsboro:"#dcdcdc",ghostwhite:"#f8f8ff",gold:"#ffd700",goldenrod:"#daa520",gray:"#808080",green:"#008000",greenyellow:"#adff2f",grey:"#808080",honeydew:"#f0fff0",hotpink:"#ff69b4",indianred:"#cd5c5c",indigo:"#4b0082",ivory:"#fffff0",khaki:"#f0e68c",laserlemon:"#ffff54",lavender:"#e6e6fa",lavenderblush:"#fff0f5",lawngreen:"#7cfc00",lemonchiffon:"#fffacd",lightblue:"#add8e6",lightcoral:"#f08080",lightcyan:"#e0ffff",lightgoldenrod:"#fafad2",lightgoldenrodyellow:"#fafad2",lightgray:"#d3d3d3",lightgreen:"#90ee90",lightgrey:"#d3d3d3",lightpink:"#ffb6c1",lightsalmon:"#ffa07a",lightseagreen:"#20b2aa",lightskyblue:"#87cefa",lightslategray:"#778899",lightslategrey:"#778899",lightsteelblue:"#b0c4de",lightyellow:"#ffffe0",lime:"#00ff00",limegreen:"#32cd32",linen:"#faf0e6",magenta:"#ff00ff",maroon:"#800000",maroon2:"#7f0000",maroon3:"#b03060",mediumaquamarine:"#66cdaa",mediumblue:"#0000cd",mediumorchid:"#ba55d3",mediumpurple:"#9370db",mediumseagreen:"#3cb371",mediumslateblue:"#7b68ee",mediumspringgreen:"#00fa9a",mediumturquoise:"#48d1cc",mediumvioletred:"#c71585",midnightblue:"#191970",mintcream:"#f5fffa",mistyrose:"#ffe4e1",moccasin:"#ffe4b5",navajowhite:"#ffdead",navy:"#000080",oldlace:"#fdf5e6",olive:"#808000",olivedrab:"#6b8e23",orange:"#ffa500",orangered:"#ff4500",orchid:"#da70d6",palegoldenrod:"#eee8aa",palegreen:"#98fb98",paleturquoise:"#afeeee",palevioletred:"#db7093",papayawhip:"#ffefd5",peachpuff:"#ffdab9",peru:"#cd853f",pink:"#ffc0cb",plum:"#dda0dd",powderblue:"#b0e0e6",purple:"#800080",purple2:"#7f007f",purple3:"#a020f0",rebeccapurple:"#663399",red:"#ff0000",rosybrown:"#bc8f8f",royalblue:"#4169e1",saddlebrown:"#8b4513",salmon:"#fa8072",sandybrown:"#f4a460",seagreen:"#2e8b57",seashell:"#fff5ee",sienna:"#a0522d",silver:"#c0c0c0",skyblue:"#87ceeb",slateblue:"#6a5acd",slategray:"#708090",slategrey:"#708090",snow:"#fffafa",springgreen:"#00ff7f",steelblue:"#4682b4",tan:"#d2b48c",teal:"#008080",thistle:"#d8bfd8",tomato:"#ff6347",turquoise:"#40e0d0",violet:"#ee82ee",wheat:"#f5deb3",white:"#ffffff",whitesmoke:"#f5f5f5",yellow:"#ffff00",yellowgreen:"#9acd32"},dn=h,bn=l.type,pn=sn,gn=Fr,vn=xr;v.prototype.name=function(){for(var r=vn(this._rgb,"rgb"),e=0,n=Object.keys(pn);e<n.length;e+=1){var t=n[e];if(pn[t]===r)return t.toLowerCase()}return r},dn.format.named=function(r){if(r=r.toLowerCase(),pn[r])return gn(pn[r]);throw new Error("unknown color name: "+r)},dn.autodetect.push({p:5,test:function(r){for(var e=[],n=arguments.length-1;n-- >0;)e[n]=arguments[n+1];if(!e.length&&"string"===bn(r)&&pn[r.toLowerCase()])return"named"}});var mn=l.unpack,yn=function(){for(var r=[],e=arguments.length;e--;)r[e]=arguments[e];var n=mn(r,"rgb"),t=n[0],a=n[1],f=n[2];return(t<<16)+(a<<8)+f},kn=l.type,wn=function(r){if("number"==kn(r)&&r>=0&&r<=16777215)return[r>>16,r>>8&255,255&r,1];throw new Error("unknown num color: "+r)},Mn=y,Nn=v,_n=h,xn=l.type,An=yn;Nn.prototype.num=function(){return An(this._rgb)},Mn.num=function(){for(var r=[],e=arguments.length;e--;)r[e]=arguments[e];return new(Function.prototype.bind.apply(Nn,[null].concat(r,["num"])))},_n.format.num=wn,_n.autodetect.push({p:5,test:function(){for(var r=[],e=arguments.length;e--;)r[e]=arguments[e];if(1===r.length&&"number"===xn(r[0])&&r[0]>=0&&r[0]<=16777215)return"num"}});var En=y,Fn=v,Pn=h,On=l.unpack,jn=l.type,Gn=Math.round;Fn.prototype.rgb=function(r){return void 0===r&&(r=!0),!1===r?this._rgb.slice(0,3):this._rgb.slice(0,3).map(Gn)},Fn.prototype.rgba=function(r){return void 0===r&&(r=!0),this._rgb.slice(0,4).map((function(e,n){return n<3?!1===r?e:Gn(e):e}))},En.rgb=function(){for(var r=[],e=arguments.length;e--;)r[e]=arguments[e];return new(Function.prototype.bind.apply(Fn,[null].concat(r,["rgb"])))},Pn.format.rgb=function(){for(var r=[],e=arguments.length;e--;)r[e]=arguments[e];var n=On(r,"rgba");return void 0===n[3]&&(n[3]=1),n},Pn.autodetect.push({p:3,test:function(){for(var r=[],e=arguments.length;e--;)r[e]=arguments[e];if(r=On(r,"rgba"),"array"===jn(r)&&(3===r.length||4===r.length&&"number"==jn(r[3])&&r[3]>=0&&r[3]<=1))return"rgb"}});var Rn=Math.log,qn=function(r){var e,n,t,a=r/100;return a<66?(e=255,n=a<6?0:-155.25485562709179-.44596950469579133*(n=a-2)+104.49216199393888*Rn(n),t=a<20?0:.8274096064007395*(t=a-10)-254.76935184120902+115.67994401066147*Rn(t)):(e=351.97690566805693+.114206453784165*(e=a-55)-40.25366309332127*Rn(e),n=325.4494125711974+.07943456536662342*(n=a-50)-28.0852963507957*Rn(n),t=255),[e,n,t,1]},Ln=qn,In=l.unpack,Bn=Math.round,Cn=function(){for(var r=[],e=arguments.length;e--;)r[e]=arguments[e];for(var n,t=In(r,"rgb"),a=t[0],f=t[2],o=1e3,u=4e4,c=.4;u-o>c;){var i=Ln(n=.5*(u+o));i[2]/i[0]>=f/a?u=n:o=n}return Bn(n)},Dn=y,Yn=v,Sn=h,Tn=Cn;Yn.prototype.temp=Yn.prototype.kelvin=Yn.prototype.temperature=function(){return Tn(this._rgb)},Dn.temp=Dn.kelvin=Dn.temperature=function(){for(var r=[],e=arguments.length;e--;)r[e]=arguments[e];return new(Function.prototype.bind.apply(Yn,[null].concat(r,["temp"])))},Sn.format.temp=Sn.format.kelvin=Sn.format.temperature=qn;var $n=l.unpack,zn=Math.cbrt,Xn=Math.pow,Un=Math.sign,Vn=function(){for(var r=[],e=arguments.length;e--;)r[e]=arguments[e];var n=$n(r,"rgb"),t=n[0],a=n[1],f=n[2],o=[Wn(t/255),Wn(a/255),Wn(f/255)],u=o[0],c=o[1],i=o[2],l=zn(.4122214708*u+.5363325363*c+.0514459929*i),h=zn(.2119034982*u+.6806995451*c+.1073969566*i),s=zn(.0883024619*u+.2817188376*c+.6299787005*i);return[.2104542553*l+.793617785*h-.0040720468*s,1.9779984951*l-2.428592205*h+.4505937099*s,.0259040371*l+.7827717662*h-.808675766*s]};function Wn(r){var e=Math.abs(r);return e<.04045?r/12.92:(Un(r)||1)*Xn((e+.055)/1.055,2.4)}var Kn=l.unpack,Zn=Math.pow,Hn=Math.sign,Jn=function(){for(var r=[],e=arguments.length;e--;)r[e]=arguments[e];var n=(r=Kn(r,"lab"))[0],t=r[1],a=r[2],f=Zn(n+.3963377774*t+.2158037573*a,3),o=Zn(n-.1055613458*t-.0638541728*a,3),u=Zn(n-.0894841775*t-1.291485548*a,3);return[255*Qn(4.0767416621*f-3.3077115913*o+.2309699292*u),255*Qn(-1.2684380046*f+2.6097574011*o-.3413193965*u),255*Qn(-.0041960863*f-.7034186147*o+1.707614701*u),r.length>3?r[3]:1]};function Qn(r){var e=Math.abs(r);return e>.0031308?(Hn(r)||1)*(1.055*Zn(e,1/2.4)-.055):12.92*r}var rt=l.unpack,et=l.type,nt=y,tt=v,at=h,ft=Vn;tt.prototype.oklab=function(){return ft(this._rgb)},nt.oklab=function(){for(var r=[],e=arguments.length;e--;)r[e]=arguments[e];return new(Function.prototype.bind.apply(tt,[null].concat(r,["oklab"])))},at.format.oklab=Jn,at.autodetect.push({p:3,test:function(){for(var r=[],e=arguments.length;e--;)r[e]=arguments[e];if(r=rt(r,"oklab"),"array"===et(r)&&3===r.length)return"oklab"}});var ot=l.unpack,ut=Vn,ct=Te,it=function(){for(var r=[],e=arguments.length;e--;)r[e]=arguments[e];var n=ot(r,"rgb"),t=n[0],a=n[1],f=n[2],o=ut(t,a,f),u=o[0],c=o[1],i=o[2];return ct(u,c,i)},lt=l.unpack,ht=He,st=Jn,dt=function(){for(var r=[],e=arguments.length;e--;)r[e]=arguments[e];var n=(r=lt(r,"lch"))[0],t=r[1],a=r[2],f=ht(n,t,a),o=f[0],u=f[1],c=f[2],i=st(o,u,c),l=i[0],h=i[1],s=i[2];return[l,h,s,r.length>3?r[3]:1]},bt=l.unpack,pt=l.type,gt=y,vt=v,mt=h,yt=it;vt.prototype.oklch=function(){return yt(this._rgb)},gt.oklch=function(){for(var r=[],e=arguments.length;e--;)r[e]=arguments[e];return new(Function.prototype.bind.apply(vt,[null].concat(r,["oklch"])))},mt.format.oklch=dt,mt.autodetect.push({p:3,test:function(){for(var r=[],e=arguments.length;e--;)r[e]=arguments[e];if(r=bt(r,"oklch"),"array"===pt(r)&&3===r.length)return"oklch"}});var kt=v,wt=l.type;kt.prototype.alpha=function(r,e){return void 0===e&&(e=!1),void 0!==r&&"number"===wt(r)?e?(this._rgb[3]=r,this):new kt([this._rgb[0],this._rgb[1],this._rgb[2],r],"rgb"):this._rgb[3]},v.prototype.clipped=function(){return this._rgb._clipped||!1};var Mt=v,Nt=ve;Mt.prototype.darken=function(r){void 0===r&&(r=1);var e=this.lab();return e[0]-=Nt.Kn*r,new Mt(e,"lab").alpha(this.alpha(),!0)},Mt.prototype.brighten=function(r){return void 0===r&&(r=1),this.darken(-r)},Mt.prototype.darker=Mt.prototype.darken,Mt.prototype.brighter=Mt.prototype.brighten,v.prototype.get=function(r){var e=r.split("."),n=e[0],t=e[1],a=this[n]();if(t){var f=n.indexOf(t)-("ok"===n.substr(0,2)?2:0);if(f>-1)return a[f];throw new Error("unknown channel "+t+" in mode "+n)}return a};var _t=v,xt=l.type,At=Math.pow;_t.prototype.luminance=function(r){if(void 0!==r&&"number"===xt(r)){if(0===r)return new _t([0,0,0,this._rgb[3]],"rgb");if(1===r)return new _t([255,255,255,this._rgb[3]],"rgb");var e=this.luminance(),n=20,t=function(e,a){var f=e.interpolate(a,.5,"rgb"),o=f.luminance();return Math.abs(r-o)<1e-7||!n--?f:o>r?t(e,f):t(f,a)},a=(e>r?t(new _t([0,0,0]),this):t(this,new _t([255,255,255]))).rgb();return new _t(a.concat([this._rgb[3]]))}return Et.apply(void 0,this._rgb.slice(0,3))};var Et=function(r,e,n){return.2126*(r=Ft(r))+.7152*(e=Ft(e))+.0722*(n=Ft(n))},Ft=function(r){return(r/=255)<=.03928?r/12.92:At((r+.055)/1.055,2.4)},Pt={},Ot=v,jt=l.type,Gt=Pt,Rt=function(r,e,n){void 0===n&&(n=.5);for(var t=[],a=arguments.length-3;a-- >0;)t[a]=arguments[a+3];var f=t[0]||"lrgb";if(Gt[f]||t.length||(f=Object.keys(Gt)[0]),!Gt[f])throw new Error("interpolation mode "+f+" is not defined");return"object"!==jt(r)&&(r=new Ot(r)),"object"!==jt(e)&&(e=new Ot(e)),Gt[f](r,e,n).alpha(r.alpha()+n*(e.alpha()-r.alpha()))},qt=v,Lt=Rt;qt.prototype.mix=qt.prototype.interpolate=function(r,e){void 0===e&&(e=.5);for(var n=[],t=arguments.length-2;t-- >0;)n[t]=arguments[t+2];return Lt.apply(void 0,[this,r,e].concat(n))};var It=v;It.prototype.premultiply=function(r){void 0===r&&(r=!1);var e=this._rgb,n=e[3];return r?(this._rgb=[e[0]*n,e[1]*n,e[2]*n,n],this):new It([e[0]*n,e[1]*n,e[2]*n,n],"rgb")};var Bt=v,Ct=ve;Bt.prototype.saturate=function(r){void 0===r&&(r=1);var e=this.lch();return e[1]+=Ct.Kn*r,e[1]<0&&(e[1]=0),new Bt(e,"lch").alpha(this.alpha(),!0)},Bt.prototype.desaturate=function(r){return void 0===r&&(r=1),this.saturate(-r)};var Dt=v,Yt=l.type;Dt.prototype.set=function(r,e,n){void 0===n&&(n=!1);var t=r.split("."),a=t[0],f=t[1],o=this[a]();if(f){var u=a.indexOf(f)-("ok"===a.substr(0,2)?2:0);if(u>-1){if("string"==Yt(e))switch(e.charAt(0)){case"+":case"-":o[u]+=+e;break;case"*":o[u]*=+e.substr(1);break;case"/":o[u]/=+e.substr(1);break;default:o[u]=+e}else{if("number"!==Yt(e))throw new Error("unsupported value for Color.set");o[u]=e}var c=new Dt(o,a);return n?(this._rgb=c._rgb,this):c}throw new Error("unknown channel "+f+" in mode "+a)}return o};var St=v;Pt.rgb=function(r,e,n){var t=r._rgb,a=e._rgb;return new St(t[0]+n*(a[0]-t[0]),t[1]+n*(a[1]-t[1]),t[2]+n*(a[2]-t[2]),"rgb")};var Tt=v,$t=Math.sqrt,zt=Math.pow;Pt.lrgb=function(r,e,n){var t=r._rgb,a=t[0],f=t[1],o=t[2],u=e._rgb,c=u[0],i=u[1],l=u[2];return new Tt($t(zt(a,2)*(1-n)+zt(c,2)*n),$t(zt(f,2)*(1-n)+zt(i,2)*n),$t(zt(o,2)*(1-n)+zt(l,2)*n),"rgb")};var Xt=v;Pt.lab=function(r,e,n){var t=r.lab(),a=e.lab();return new Xt(t[0]+n*(a[0]-t[0]),t[1]+n*(a[1]-t[1]),t[2]+n*(a[2]-t[2]),"lab")};var Ut=v,Vt=function(r,e,n,t){var a,f,o,u,c,i,l,h,s,d,b,p,g;return"hsl"===t?(o=r.hsl(),u=e.hsl()):"hsv"===t?(o=r.hsv(),u=e.hsv()):"hcg"===t?(o=r.hcg(),u=e.hcg()):"hsi"===t?(o=r.hsi(),u=e.hsi()):"lch"===t||"hcl"===t?(t="hcl",o=r.hcl(),u=e.hcl()):"oklch"===t&&(o=r.oklch().reverse(),u=e.oklch().reverse()),"h"!==t.substr(0,1)&&"oklch"!==t||(c=(a=o)[0],l=a[1],s=a[2],i=(f=u)[0],h=f[1],d=f[2]),isNaN(c)||isNaN(i)?isNaN(c)?isNaN(i)?p=Number.NaN:(p=i,1!=s&&0!=s||"hsv"==t||(b=h)):(p=c,1!=d&&0!=d||"hsv"==t||(b=l)):p=c+n*(i>c&&i-c>180?i-(c+360):i<c&&c-i>180?i+360-c:i-c),void 0===b&&(b=l+n*(h-l)),g=s+n*(d-s),new Ut("oklch"===t?[g,b,p]:[p,b,g],t)},Wt=Vt,Kt=function(r,e,n){return Wt(r,e,n,"lch")};Pt.lch=Kt,Pt.hcl=Kt;var Zt=v;Pt.num=function(r,e,n){var t=r.num(),a=e.num();return new Zt(t+n*(a-t),"num")};var Ht=Vt;Pt.hcg=function(r,e,n){return Ht(r,e,n,"hcg")};var Jt=Vt;Pt.hsi=function(r,e,n){return Jt(r,e,n,"hsi")};var Qt=Vt;Pt.hsl=function(r,e,n){return Qt(r,e,n,"hsl")};var ra=Vt;Pt.hsv=function(r,e,n){return ra(r,e,n,"hsv")};var ea=v;Pt.oklab=function(r,e,n){var t=r.oklab(),a=e.oklab();return new ea(t[0]+n*(a[0]-t[0]),t[1]+n*(a[1]-t[1]),t[2]+n*(a[2]-t[2]),"oklab")};var na=Vt;Pt.oklch=function(r,e,n){return na(r,e,n,"oklch")};var ta=v,aa=l.clip_rgb,fa=Math.pow,oa=Math.sqrt,ua=Math.PI,ca=Math.cos,ia=Math.sin,la=Math.atan2,ha=function(r,e){for(var n=r.length,t=[0,0,0,0],a=0;a<r.length;a++){var f=r[a],o=e[a]/n,u=f._rgb;t[0]+=fa(u[0],2)*o,t[1]+=fa(u[1],2)*o,t[2]+=fa(u[2],2)*o,t[3]+=u[3]*o}return t[0]=oa(t[0]),t[1]=oa(t[1]),t[2]=oa(t[2]),t[3]>.9999999&&(t[3]=1),new ta(aa(t))},sa=y,da=l.type,ba=Math.pow,pa=function(r){var e="rgb",n=sa("#ccc"),t=0,a=[0,1],f=[],o=[0,0],u=!1,c=[],i=!1,l=0,h=1,s=!1,d={},b=!0,p=1,g=function(r){if((r=r||["#fff","#000"])&&"string"===da(r)&&sa.brewer&&sa.brewer[r.toLowerCase()]&&(r=sa.brewer[r.toLowerCase()]),"array"===da(r)){1===r.length&&(r=[r[0],r[0]]),r=r.slice(0);for(var e=0;e<r.length;e++)r[e]=sa(r[e]);f.length=0;for(var n=0;n<r.length;n++)f.push(n/(r.length-1))}return k(),c=r},v=function(r){return r},m=function(r){return r},y=function(r,t){var a,i;if(null==t&&(t=!1),isNaN(r)||null===r)return n;if(t)i=r;else if(u&&u.length>2){var s=function(r){if(null!=u){for(var e=u.length-1,n=0;n<e&&r>=u[n];)n++;return n-1}return 0}(r);i=s/(u.length-2)}else i=h!==l?(r-l)/(h-l):1;i=m(i),t||(i=v(i)),1!==p&&(i=ba(i,p)),i=o[0]+i*(1-o[0]-o[1]),i=Math.min(1,Math.max(0,i));var g=Math.floor(1e4*i);if(b&&d[g])a=d[g];else{if("array"===da(c))for(var y=0;y<f.length;y++){var k=f[y];if(i<=k){a=c[y];break}if(i>=k&&y===f.length-1){a=c[y];break}if(i>k&&i<f[y+1]){i=(i-k)/(f[y+1]-k),a=sa.interpolate(c[y],c[y+1],i,e);break}}else"function"===da(c)&&(a=c(i));b&&(d[g]=a)}return a},k=function(){return d={}};g(r);var w=function(r){var e=sa(y(r));return i&&e[i]?e[i]():e};return w.classes=function(r){if(null!=r){if("array"===da(r))u=r,a=[r[0],r[r.length-1]];else{var e=sa.analyze(a);u=0===r?[e.min,e.max]:sa.limits(e,"e",r)}return w}return u},w.domain=function(r){if(!arguments.length)return a;l=r[0],h=r[r.length-1],f=[];var e=c.length;if(r.length===e&&l!==h)for(var n=0,t=Array.from(r);n<t.length;n+=1){var o=t[n];f.push((o-l)/(h-l))}else{for(var u=0;u<e;u++)f.push(u/(e-1));if(r.length>2){var i=r.map((function(e,n){return n/(r.length-1)})),s=r.map((function(r){return(r-l)/(h-l)}));s.every((function(r,e){return i[e]===r}))||(m=function(r){if(r<=0||r>=1)return r;for(var e=0;r>=s[e+1];)e++;var n=(r-s[e])/(s[e+1]-s[e]);return i[e]+n*(i[e+1]-i[e])})}}return a=[l,h],w},w.mode=function(r){return arguments.length?(e=r,k(),w):e},w.range=function(r,e){return g(r),w},w.out=function(r){return i=r,w},w.spread=function(r){return arguments.length?(t=r,w):t},w.correctLightness=function(r){return null==r&&(r=!0),s=r,k(),v=s?function(r){for(var e=y(0,!0).lab()[0],n=y(1,!0).lab()[0],t=e>n,a=y(r,!0).lab()[0],f=e+(n-e)*r,o=a-f,u=0,c=1,i=20;Math.abs(o)>.01&&i-- >0;)t&&(o*=-1),o<0?(u=r,r+=.5*(c-r)):(c=r,r+=.5*(u-r)),a=y(r,!0).lab()[0],o=a-f;return r}:function(r){return r},w},w.padding=function(r){return null!=r?("number"===da(r)&&(r=[r,r]),o=r,w):o},w.colors=function(e,n){arguments.length<2&&(n="hex");var t=[];if(0===arguments.length)t=c.slice(0);else if(1===e)t=[w(.5)];else if(e>1){var f=a[0],o=a[1]-f;t=ga(0,e,!1).map((function(r){return w(f+r/(e-1)*o)}))}else{r=[];var i=[];if(u&&u.length>2)for(var l=1,h=u.length,s=1<=h;s?l<h:l>h;s?l++:l--)i.push(.5*(u[l-1]+u[l]));else i=a;t=i.map((function(r){return w(r)}))}return sa[n]&&(t=t.map((function(r){return r[n]()}))),t},w.cache=function(r){return null!=r?(b=r,w):b},w.gamma=function(r){return null!=r?(p=r,w):p},w.nodata=function(r){return null!=r?(n=sa(r),w):n},w};function ga(r,e,n){for(var t=[],a=r<e,f=n?a?e+1:e-1:e,o=r;a?o<f:o>f;a?o++:o--)t.push(o);return t}var va=v,ma=pa,ya=y,ka=function(r,e,n){if(!ka[n])throw new Error("unknown blend mode "+n);return ka[n](r,e)},wa=function(r){return function(e,n){var t=ya(n).rgb(),a=ya(e).rgb();return ya.rgb(r(t,a))}},Ma=function(r){return function(e,n){var t=[];return t[0]=r(e[0],n[0]),t[1]=r(e[1],n[1]),t[2]=r(e[2],n[2]),t}};ka.normal=wa(Ma((function(r){return r}))),ka.multiply=wa(Ma((function(r,e){return r*e/255}))),ka.screen=wa(Ma((function(r,e){return 255*(1-(1-r/255)*(1-e/255))}))),ka.overlay=wa(Ma((function(r,e){return e<128?2*r*e/255:255*(1-2*(1-r/255)*(1-e/255))}))),ka.darken=wa(Ma((function(r,e){return r>e?e:r}))),ka.lighten=wa(Ma((function(r,e){return r>e?r:e}))),ka.dodge=wa(Ma((function(r,e){return 255===r||(r=e/255*255/(1-r/255))>255?255:r}))),ka.burn=wa(Ma((function(r,e){return 255*(1-(1-e/255)/(r/255))})));for(var Na=ka,_a=l.type,xa=l.clip_rgb,Aa=l.TWOPI,Ea=Math.pow,Fa=Math.sin,Pa=Math.cos,Oa=y,ja=v,Ga=Math.floor,Ra=Math.random,qa=o,La=Math.log,Ia=Math.pow,Ba=Math.floor,Ca=Math.abs,Da=function(r,e){void 0===e&&(e=null);var n={min:Number.MAX_VALUE,max:-1*Number.MAX_VALUE,sum:0,values:[],count:0};return"object"===qa(r)&&(r=Object.values(r)),r.forEach((function(r){e&&"object"===qa(r)&&(r=r[e]),null==r||isNaN(r)||(n.values.push(r),n.sum+=r,r<n.min&&(n.min=r),r>n.max&&(n.max=r),n.count+=1)})),n.domain=[n.min,n.max],n.limits=function(r,e){return Ya(n,r,e)},n},Ya=function(r,e,n){void 0===e&&(e="equal"),void 0===n&&(n=7),"array"==qa(r)&&(r=Da(r));var t=r.min,a=r.max,f=r.values.sort((function(r,e){return r-e}));if(1===n)return[t,a];var o=[];if("c"===e.substr(0,1)&&(o.push(t),o.push(a)),"e"===e.substr(0,1)){o.push(t);for(var u=1;u<n;u++)o.push(t+u/n*(a-t));o.push(a)}else if("l"===e.substr(0,1)){if(t<=0)throw new Error("Logarithmic scales are only possible for values > 0");var c=Math.LOG10E*La(t),i=Math.LOG10E*La(a);o.push(t);for(var l=1;l<n;l++)o.push(Ia(10,c+l/n*(i-c)));o.push(a)}else if("q"===e.substr(0,1)){o.push(t);for(var h=1;h<n;h++){var s=(f.length-1)*h/n,d=Ba(s);if(d===s)o.push(f[d]);else{var b=s-d;o.push(f[d]*(1-b)+f[d+1]*b)}}o.push(a)}else if("k"===e.substr(0,1)){var p,g=f.length,v=new Array(g),m=new Array(n),y=!0,k=0,w=null;(w=[]).push(t);for(var M=1;M<n;M++)w.push(t+M/n*(a-t));for(w.push(a);y;){for(var N=0;N<n;N++)m[N]=0;for(var _=0;_<g;_++)for(var x=f[_],A=Number.MAX_VALUE,E=void 0,F=0;F<n;F++){var P=Ca(w[F]-x);P<A&&(A=P,E=F),m[E]++,v[_]=E}for(var O=new Array(n),j=0;j<n;j++)O[j]=null;for(var G=0;G<g;G++)null===O[p=v[G]]?O[p]=f[G]:O[p]+=f[G];for(var R=0;R<n;R++)O[R]*=1/m[R];y=!1;for(var q=0;q<n;q++)if(O[q]!==w[q]){y=!0;break}w=O,++k>200&&(y=!1)}for(var L={},I=0;I<n;I++)L[I]=[];for(var B=0;B<g;B++)L[p=v[B]].push(f[B]);for(var C=[],D=0;D<n;D++)C.push(L[D][0]),C.push(L[D][L[D].length-1]);C=C.sort((function(r,e){return r-e})),o.push(C[0]);for(var Y=1;Y<C.length;Y+=2){var S=C[Y];isNaN(S)||-1!==o.indexOf(S)||o.push(S)}}return o},Sa={analyze:Da,limits:Ya},Ta=v,$a=v,za=Math.sqrt,Xa=Math.pow,Ua=Math.min,Va=Math.max,Wa=Math.atan2,Ka=Math.abs,Za=Math.cos,Ha=Math.sin,Ja=Math.exp,Qa=Math.PI,rf=v,ef=v,nf=y,tf=pa,af={cool:function(){return tf([nf.hsl(180,1,.9),nf.hsl(250,.7,.4)])},hot:function(){return tf(["#000","#f00","#ff0","#fff"]).mode("rgb")}},ff={OrRd:["#fff7ec","#fee8c8","#fdd49e","#fdbb84","#fc8d59","#ef6548","#d7301f","#b30000","#7f0000"],PuBu:["#fff7fb","#ece7f2","#d0d1e6","#a6bddb","#74a9cf","#3690c0","#0570b0","#045a8d","#023858"],BuPu:["#f7fcfd","#e0ecf4","#bfd3e6","#9ebcda","#8c96c6","#8c6bb1","#88419d","#810f7c","#4d004b"],Oranges:["#fff5eb","#fee6ce","#fdd0a2","#fdae6b","#fd8d3c","#f16913","#d94801","#a63603","#7f2704"],BuGn:["#f7fcfd","#e5f5f9","#ccece6","#99d8c9","#66c2a4","#41ae76","#238b45","#006d2c","#00441b"],YlOrBr:["#ffffe5","#fff7bc","#fee391","#fec44f","#fe9929","#ec7014","#cc4c02","#993404","#662506"],YlGn:["#ffffe5","#f7fcb9","#d9f0a3","#addd8e","#78c679","#41ab5d","#238443","#006837","#004529"],Reds:["#fff5f0","#fee0d2","#fcbba1","#fc9272","#fb6a4a","#ef3b2c","#cb181d","#a50f15","#67000d"],RdPu:["#fff7f3","#fde0dd","#fcc5c0","#fa9fb5","#f768a1","#dd3497","#ae017e","#7a0177","#49006a"],Greens:["#f7fcf5","#e5f5e0","#c7e9c0","#a1d99b","#74c476","#41ab5d","#238b45","#006d2c","#00441b"],YlGnBu:["#ffffd9","#edf8b1","#c7e9b4","#7fcdbb","#41b6c4","#1d91c0","#225ea8","#253494","#081d58"],Purples:["#fcfbfd","#efedf5","#dadaeb","#bcbddc","#9e9ac8","#807dba","#6a51a3","#54278f","#3f007d"],GnBu:["#f7fcf0","#e0f3db","#ccebc5","#a8ddb5","#7bccc4","#4eb3d3","#2b8cbe","#0868ac","#084081"],Greys:["#ffffff","#f0f0f0","#d9d9d9","#bdbdbd","#969696","#737373","#525252","#252525","#000000"],YlOrRd:["#ffffcc","#ffeda0","#fed976","#feb24c","#fd8d3c","#fc4e2a","#e31a1c","#bd0026","#800026"],PuRd:["#f7f4f9","#e7e1ef","#d4b9da","#c994c7","#df65b0","#e7298a","#ce1256","#980043","#67001f"],Blues:["#f7fbff","#deebf7","#c6dbef","#9ecae1","#6baed6","#4292c6","#2171b5","#08519c","#08306b"],PuBuGn:["#fff7fb","#ece2f0","#d0d1e6","#a6bddb","#67a9cf","#3690c0","#02818a","#016c59","#014636"],Viridis:["#440154","#482777","#3f4a8a","#31678e","#26838f","#1f9d8a","#6cce5a","#b6de2b","#fee825"],Spectral:["#9e0142","#d53e4f","#f46d43","#fdae61","#fee08b","#ffffbf","#e6f598","#abdda4","#66c2a5","#3288bd","#5e4fa2"],RdYlGn:["#a50026","#d73027","#f46d43","#fdae61","#fee08b","#ffffbf","#d9ef8b","#a6d96a","#66bd63","#1a9850","#006837"],RdBu:["#67001f","#b2182b","#d6604d","#f4a582","#fddbc7","#f7f7f7","#d1e5f0","#92c5de","#4393c3","#2166ac","#053061"],PiYG:["#8e0152","#c51b7d","#de77ae","#f1b6da","#fde0ef","#f7f7f7","#e6f5d0","#b8e186","#7fbc41","#4d9221","#276419"],PRGn:["#40004b","#762a83","#9970ab","#c2a5cf","#e7d4e8","#f7f7f7","#d9f0d3","#a6dba0","#5aae61","#1b7837","#00441b"],RdYlBu:["#a50026","#d73027","#f46d43","#fdae61","#fee090","#ffffbf","#e0f3f8","#abd9e9","#74add1","#4575b4","#313695"],BrBG:["#543005","#8c510a","#bf812d","#dfc27d","#f6e8c3","#f5f5f5","#c7eae5","#80cdc1","#35978f","#01665e","#003c30"],RdGy:["#67001f","#b2182b","#d6604d","#f4a582","#fddbc7","#ffffff","#e0e0e0","#bababa","#878787","#4d4d4d","#1a1a1a"],PuOr:["#7f3b08","#b35806","#e08214","#fdb863","#fee0b6","#f7f7f7","#d8daeb","#b2abd2","#8073ac","#542788","#2d004b"],Set2:["#66c2a5","#fc8d62","#8da0cb","#e78ac3","#a6d854","#ffd92f","#e5c494","#b3b3b3"],Accent:["#7fc97f","#beaed4","#fdc086","#ffff99","#386cb0","#f0027f","#bf5b17","#666666"],Set1:["#e41a1c","#377eb8","#4daf4a","#984ea3","#ff7f00","#ffff33","#a65628","#f781bf","#999999"],Set3:["#8dd3c7","#ffffb3","#bebada","#fb8072","#80b1d3","#fdb462","#b3de69","#fccde5","#d9d9d9","#bc80bd","#ccebc5","#ffed6f"],Dark2:["#1b9e77","#d95f02","#7570b3","#e7298a","#66a61e","#e6ab02","#a6761d","#666666"],Paired:["#a6cee3","#1f78b4","#b2df8a","#33a02c","#fb9a99","#e31a1c","#fdbf6f","#ff7f00","#cab2d6","#6a3d9a","#ffff99","#b15928"],Pastel2:["#b3e2cd","#fdcdac","#cbd5e8","#f4cae4","#e6f5c9","#fff2ae","#f1e2cc","#cccccc"],Pastel1:["#fbb4ae","#b3cde3","#ccebc5","#decbe4","#fed9a6","#ffffcc","#e5d8bd","#fddaec","#f2f2f2"]},of=0,uf=Object.keys(ff);of<uf.length;of+=1){var cf=uf[of];ff[cf.toLowerCase()]=ff[cf]}var lf=ff,hf=y;return hf.average=function(r,e,n){void 0===e&&(e="lrgb"),void 0===n&&(n=null);var t=r.length;n||(n=Array.from(new Array(t)).map((function(){return 1})));var a=t/n.reduce((function(r,e){return r+e}));if(n.forEach((function(r,e){n[e]*=a})),r=r.map((function(r){return new ta(r)})),"lrgb"===e)return ha(r,n);for(var f=r.shift(),o=f.get(e),u=[],c=0,i=0,l=0;l<o.length;l++)if(o[l]=(o[l]||0)*n[0],u.push(isNaN(o[l])?0:n[0]),"h"===e.charAt(l)&&!isNaN(o[l])){var h=o[l]/180*ua;c+=ca(h)*n[0],i+=ia(h)*n[0]}var s=f.alpha()*n[0];r.forEach((function(r,t){var a=r.get(e);s+=r.alpha()*n[t+1];for(var f=0;f<o.length;f++)if(!isNaN(a[f]))if(u[f]+=n[t+1],"h"===e.charAt(f)){var l=a[f]/180*ua;c+=ca(l)*n[t+1],i+=ia(l)*n[t+1]}else o[f]+=a[f]*n[t+1]}));for(var d=0;d<o.length;d++)if("h"===e.charAt(d)){for(var b=la(i/u[d],c/u[d])/ua*180;b<0;)b+=360;for(;b>=360;)b-=360;o[d]=b}else o[d]=o[d]/u[d];return s/=t,new ta(o,e).alpha(s>.99999?1:s,!0)},hf.bezier=function(r){var e=function(r){var e,n,t,a,f,o,u;if(2===(r=r.map((function(r){return new va(r)}))).length)e=r.map((function(r){return r.lab()})),f=e[0],o=e[1],a=function(r){var e=[0,1,2].map((function(e){return f[e]+r*(o[e]-f[e])}));return new va(e,"lab")};else if(3===r.length)n=r.map((function(r){return r.lab()})),f=n[0],o=n[1],u=n[2],a=function(r){var e=[0,1,2].map((function(e){return(1-r)*(1-r)*f[e]+2*(1-r)*r*o[e]+r*r*u[e]}));return new va(e,"lab")};else if(4===r.length){var c;t=r.map((function(r){return r.lab()})),f=t[0],o=t[1],u=t[2],c=t[3],a=function(r){var e=[0,1,2].map((function(e){return(1-r)*(1-r)*(1-r)*f[e]+3*(1-r)*(1-r)*r*o[e]+3*(1-r)*r*r*u[e]+r*r*r*c[e]}));return new va(e,"lab")}}else{if(!(r.length>=5))throw new RangeError("No point in running bezier with only one color.");var i,l,h;i=r.map((function(r){return r.lab()})),h=r.length-1,l=function(r){for(var e=[1,1],n=1;n<r;n++){for(var t=[1],a=1;a<=e.length;a++)t[a]=(e[a]||0)+e[a-1];e=t}return e}(h),a=function(r){var e=1-r,n=[0,1,2].map((function(n){return i.reduce((function(t,a,f){return t+l[f]*Math.pow(e,h-f)*Math.pow(r,f)*a[n]}),0)}));return new va(n,"lab")}}return a}(r);return e.scale=function(){return ma(e)},e},hf.blend=Na,hf.cubehelix=function(r,e,n,t,a){void 0===r&&(r=300),void 0===e&&(e=-1.5),void 0===n&&(n=1),void 0===t&&(t=1),void 0===a&&(a=[0,1]);var f,o=0;"array"===_a(a)?f=a[1]-a[0]:(f=0,a=[a,a]);var u=function(u){var c=Aa*((r+120)/360+e*u),i=Ea(a[0]+f*u,t),l=(0!==o?n[0]+u*o:n)*i*(1-i)/2,h=Pa(c),s=Fa(c);return Oa(xa([255*(i+l*(-.14861*h+1.78277*s)),255*(i+l*(-.29227*h-.90649*s)),255*(i+l*(1.97294*h)),1]))};return u.start=function(e){return null==e?r:(r=e,u)},u.rotations=function(r){return null==r?e:(e=r,u)},u.gamma=function(r){return null==r?t:(t=r,u)},u.hue=function(r){return null==r?n:("array"===_a(n=r)?0===(o=n[1]-n[0])&&(n=n[1]):o=0,u)},u.lightness=function(r){return null==r?a:("array"===_a(r)?(a=r,f=r[1]-r[0]):(a=[r,r],f=0),u)},u.scale=function(){return Oa.scale(u)},u.hue(n),u},hf.mix=hf.interpolate=Rt,hf.random=function(){for(var r="#",e=0;e<6;e++)r+="0123456789abcdef".charAt(Ga(16*Ra()));return new ja(r,"hex")},hf.scale=pa,hf.analyze=Sa.analyze,hf.contrast=function(r,e){r=new Ta(r),e=new Ta(e);var n=r.luminance(),t=e.luminance();return n>t?(n+.05)/(t+.05):(t+.05)/(n+.05)},hf.deltaE=function(r,e,n,t,a){void 0===n&&(n=1),void 0===t&&(t=1),void 0===a&&(a=1);var f=function(r){return 360*r/(2*Qa)},o=function(r){return 2*Qa*r/360};r=new $a(r),e=new $a(e);var u=Array.from(r.lab()),c=u[0],i=u[1],l=u[2],h=Array.from(e.lab()),s=h[0],d=h[1],b=h[2],p=(c+s)/2,g=(za(Xa(i,2)+Xa(l,2))+za(Xa(d,2)+Xa(b,2)))/2,v=.5*(1-za(Xa(g,7)/(Xa(g,7)+Xa(25,7)))),m=i*(1+v),y=d*(1+v),k=za(Xa(m,2)+Xa(l,2)),w=za(Xa(y,2)+Xa(b,2)),M=(k+w)/2,N=f(Wa(l,m)),_=f(Wa(b,y)),x=N>=0?N:N+360,A=_>=0?_:_+360,E=Ka(x-A)>180?(x+A+360)/2:(x+A)/2,F=1-.17*Za(o(E-30))+.24*Za(o(2*E))+.32*Za(o(3*E+6))-.2*Za(o(4*E-63)),P=A-x;P=Ka(P)<=180?P:A<=x?P+360:P-360,P=2*za(k*w)*Ha(o(P)/2);var O=s-c,j=w-k,G=1+.015*Xa(p-50,2)/za(20+Xa(p-50,2)),R=1+.045*M,q=1+.015*M*F,L=30*Ja(-Xa((E-275)/25,2)),I=-(2*za(Xa(M,7)/(Xa(M,7)+Xa(25,7))))*Ha(2*o(L)),B=za(Xa(O/(n*G),2)+Xa(j/(t*R),2)+Xa(P/(a*q),2)+I*(j/(t*R))*(P/(a*q)));return Va(0,Ua(100,B))},hf.distance=function(r,e,n){void 0===n&&(n="lab"),r=new rf(r),e=new rf(e);var t=r.get(n),a=e.get(n),f=0;for(var o in t){var u=(t[o]||0)-(a[o]||0);f+=u*u}return Math.sqrt(f)},hf.limits=Sa.limits,hf.valid=function(){for(var r=[],e=arguments.length;e--;)r[e]=arguments[e];try{return new(Function.prototype.bind.apply(ef,[null].concat(r))),!0}catch(r){return!1}},hf.scales=af,hf.colors=sn,hf.brewer=lf,hf}));

/* ------------------------------------------------------------------------- */
/* LitElement via Home Assistant bundle                                      */
/* ------------------------------------------------------------------------- */
const LitElement = Object.getPrototypeOf(customElements.get("ha-panel-lovelace"));
const html = LitElement.prototype.html;
const css = LitElement.prototype.css;

/* ------------------------------------------------------------------------- */
/* Built-in color scales                                                     */
/* ------------------------------------------------------------------------- */
const BUILTIN_SCALES = [
  {
    "key": "net energy",
    "name": "Net (diverging)",
    "documentation": {
      "text": "<p>A diverging blue-white-red scale for signed values such as net grid\nenergy (import minus export). Blue marks the low (negative/export) end,\nwhite the centre, and red the high (positive/import) end.</p>\n<p>Pair it with a second entity and `operation: difference`. With auto\nrange the card centres zero on white by widening the range symmetrically.</p>"
    },
    "steps": [
      {
        "color": "#2166ac",
        "value": 0
      },
      {
        "color": "#f7f7f7",
        "value": 0.5
      },
      {
        "color": "#b2182b",
        "value": 1
      }
    ],
    "type": "relative"
  },
  {
    "key": "black hot",
    "name": "Black hot",
    "steps": [
      {
        "color": "#F5F5F5",
        "value": 0
      },
      {
        "color": "#242124",
        "value": 1
      }
    ],
    "type": "relative"
  },
  {
    "key": "blue hot",
    "name": "Blue hot",
    "documentation": {
      "text": "<p>A single-hue sequential scale: near-black at the low end, saturated blue through the middle, and a pale blue tint at the top. Like <code>black hot</code> and <code>white hot</code>, the name describes what the highest values look like.</p>"
    },
    "steps": [
      {
        "color": "#242124",
        "value": 0
      },
      {
        "color": "#1F6FEB",
        "value": 0.6
      },
      {
        "color": "#CFE4FF",
        "value": 1
      }
    ],
    "type": "relative"
  },
  {
    "device_class": "carbon_dioxide",
    "documentation": {
      "text": "<p>CO\u2082 levels reflect the amount of fresh air in a space. High levels\nindicate insufficient ventilation. The specific effects of higher\nconcentrations of CO\u2082 are highly individual, but studies have shown\nthat levels over 1000 ppm cause cognitive impairment in many\nindividuals.</p>\n<p>Levels over 2000 ppm have been linked to health effects in some\nstudies. There is no conclusive sum of evidence.</p>\n<p>This scale caps at 3000 ppm, as a maximum level that'd signify\nfairly bad air. Levels above 5000 ppm are considered dangerous\nin workplace standards (f.x OSHA in the US) and are indicative\nof greatly insufficient ventilation overall.</p>"
    },
    "key": "carbon dioxide",
    "name": "CO\u2082, indoor exposure",
    "steps": [
      {
        "color": "#6d9b17",
        "value": 520
      },
      {
        "color": "#FFBF00",
        "value": 1000
      },
      {
        "color": "#cf0000",
        "value": 1400
      },
      {
        "color": "#5b0f8c",
        "value": 3000
      }
    ],
    "type": "absolute"
  },
  {
    "documentation": {
      "license": {
        "name": "Apache License 2.0",
        "url": "https://www.apache.org/licenses/LICENSE-2.0"
      },
      "text": "<p>Colors by Cynthia Brewer, <a href=\"https://colorbrewer2.org\" rel=\"noopener\" target=\"_blank\">colorbrewer2.org</a>.\nColorBrewer provides guidance when selecting colors for map visualisations, making them distinct. While it's not a <em>perfect</em> fit for a gradient scale, such as this one, the colors are picked out to be safe for color blindness and offer improved distinction between the various parts of the band.</p>"
    },
    "key": "colorbrewer 5cl bugn",
    "name": "ColorBrewer 5-class BuGn",
    "steps": [
      {
        "color": "#edf8fb",
        "value": 0
      },
      {
        "color": "#b2e2e2",
        "value": 0.25
      },
      {
        "color": "#66c2a4",
        "value": 0.5
      },
      {
        "color": "#2ca25f",
        "value": 0.75
      },
      {
        "color": "#006d2c",
        "value": 1
      }
    ],
    "type": "relative"
  },
  {
    "documentation": {
      "license": {
        "name": "Apache License 2.0",
        "url": "https://www.apache.org/licenses/LICENSE-2.0"
      },
      "text": "<p>Colors by Cynthia Brewer, <a href=\"https://colorbrewer2.org\" rel=\"noopener\" target=\"_blank\">colorbrewer2.org</a>.\nColorBrewer provides guidance when selecting colors for map visualisations, making them distinct. While it's not a <em>perfect</em> fit for a gradient scale, such as this one, the colors are picked out to be safe for color blindness and offer improved distinction between the various parts of the band.</p>"
    },
    "key": "colorbrewer 5cl bupu",
    "name": "ColorBrewer 5-class BuPu",
    "steps": [
      {
        "color": "#edf8fb",
        "value": 0
      },
      {
        "color": "#b3cde3",
        "value": 0.25
      },
      {
        "color": "#8c96c6",
        "value": 0.5
      },
      {
        "color": "#8856a7",
        "value": 0.75
      },
      {
        "color": "#810f7c",
        "value": 1
      }
    ],
    "type": "relative"
  },
  {
    "documentation": {
      "license": {
        "name": "Apache License 2.0",
        "url": "https://www.apache.org/licenses/LICENSE-2.0"
      },
      "text": "<p>Colors by Cynthia Brewer, <a href=\"https://colorbrewer2.org\" rel=\"noopener\" target=\"_blank\">colorbrewer2.org</a>.\nColorBrewer provides guidance when selecting colors for map visualisations, making them distinct. While it's not a <em>perfect</em> fit for a gradient scale, such as this one, the colors are picked out to be safe for color blindness and offer improved distinction between the various parts of the band.</p>"
    },
    "key": "colorbrewer 5cl rdpu",
    "name": "ColorBrewer 5-class BuPu",
    "steps": [
      {
        "color": "#feebe2",
        "value": 0
      },
      {
        "color": "#fbb4b9",
        "value": 0.25
      },
      {
        "color": "#f768a1",
        "value": 0.5
      },
      {
        "color": "#c51b8a",
        "value": 0.75
      },
      {
        "color": "#7a0177",
        "value": 1
      }
    ],
    "type": "relative"
  },
  {
    "documentation": {
      "license": {
        "name": "Apache License 2.0",
        "url": "https://www.apache.org/licenses/LICENSE-2.0"
      },
      "text": "<p>Colors by Cynthia Brewer, <a href=\"https://colorbrewer2.org\" rel=\"noopener\" target=\"_blank\">colorbrewer2.org</a>.\nColorBrewer provides guidance when selecting colors for map visualisations, making them distinct. While it's not a <em>perfect</em> fit for a gradient scale, such as this one, the colors are picked out to be safe for color blindness and offer improved distinction between the various parts of the band.</p>"
    },
    "key": "colorbrewer 5cl ylorbr",
    "name": "ColorBrewer 5-class YlOrBr",
    "steps": [
      {
        "color": "#ffffd4",
        "value": 0
      },
      {
        "color": "#fed98e",
        "value": 0.25
      },
      {
        "color": "#fe9929",
        "value": 0.5
      },
      {
        "color": "#d95f0e",
        "value": 0.75
      },
      {
        "color": "#993404",
        "value": 1
      }
    ],
    "type": "relative"
  },
  {
    "key": "green hot",
    "name": "Green hot",
    "documentation": {
      "text": "<p>A single-hue sequential scale: near-black at the low end, saturated green through the middle, and a pale green tint at the top. Like <code>black hot</code> and <code>white hot</code>, the name describes what the highest values look like.</p>"
    },
    "steps": [
      {
        "color": "#242124",
        "value": 0
      },
      {
        "color": "#2EA043",
        "value": 0.6
      },
      {
        "color": "#D2F5D8",
        "value": 1
      }
    ],
    "type": "relative"
  },
  {
    "device_class": "temperature",
    "documentation": {
      "text": "<p>Indoor temperatures related to human comfort levels. Amalgation\nof multiple sources. As always with temperature, individual\nfactors such as generics, clothing and activity level have a big\nimpact.</p>"
    },
    "key": "indoor temperature",
    "name": "Indoor temperature",
    "steps": [
      {
        "color": "#0f3489",
        "value": 12
      },
      {
        "color": "#595ea3",
        "value": 16
      },
      {
        "color": "#7374b0",
        "value": 18
      },
      {
        "color": "#4caf50",
        "value": 20
      },
      {
        "color": "#4caf50",
        "value": 22
      },
      {
        "color": "#ea755a",
        "value": 24
      },
      {
        "color": "#cf0000",
        "value": 28
      }
    ],
    "type": "absolute",
    "unit": "\u00b0C"
  },
  {
    "device_class": "temperature",
    "documentation": {
      "text": "<p>Indoor temperatures related to human comfort levels. Amalgation\nof multiple sources. As always with temperature, individual\nfactors such as generics, clothing and activity level have a big\nimpact.</p>"
    },
    "key": "indoor temperature f",
    "name": "Indoor temperature",
    "steps": [
      {
        "color": "#0f3489",
        "value": 53
      },
      {
        "color": "#595ea3",
        "value": 60
      },
      {
        "color": "#7374b0",
        "value": 64
      },
      {
        "color": "#4caf50",
        "value": 68
      },
      {
        "color": "#4caf50",
        "value": 71
      },
      {
        "color": "#ea755a",
        "value": 75
      },
      {
        "color": "#cf0000",
        "value": 82
      }
    ],
    "type": "absolute",
    "unit": "\u00b0F"
  },
  {
    "key": "iron red",
    "name": "Iron red",
    "steps": [
      {
        "color": "#230382",
        "value": 0
      },
      {
        "color": "#921C96",
        "value": 0.1
      },
      {
        "color": "#C93F55",
        "value": 0.25
      },
      {
        "color": "#DF6D2D",
        "value": 0.4
      },
      {
        "color": "#EFB03D",
        "value": 0.6
      },
      {
        "color": "#F9DE52",
        "value": 0.75
      },
      {
        "color": "#F5F5D4",
        "value": 1
      }
    ],
    "type": "relative"
  },
  {
    "device_class": "nitrogen_dioxide",
    "documentation": {
      "text": "<p>This scale is based on the European Environment Agency (EEA) Air Quality Index\nas implemented in their <a href=\"https://airindex.eea.europa.eu\" rel=\"noopener\" target=\"_blank\">official interactive map</a>\nas of late 2024.</p>"
    },
    "key": "nitrogen dioxide eaqi",
    "name": "Nitrogen dioxide (European Air Quality Index)",
    "steps": [
      {
        "color": "#50F0E6",
        "legend": "Good",
        "value": 0
      },
      {
        "color": "#50CCAA",
        "legend": "Fair",
        "value": 40
      },
      {
        "color": "#F0E641",
        "legend": "Moderate",
        "value": 90
      },
      {
        "color": "#FF5050",
        "legend": "Poor",
        "value": 120
      },
      {
        "color": "#960032",
        "legend": "Very poor",
        "value": 230
      },
      {
        "color": "#7D2181",
        "legend": "Extremely poor",
        "value": 340
      }
    ],
    "type": "absolute",
    "unit": "\u00b5g/m\u00b3"
  },
  {
    "device_class": "temperature",
    "documentation": {
      "text": "<p>Outdoor temperatures related to human comfort and risk levels.</p>\n<p>Note that this works best when using apparent (or <a href=\"https://en.wikipedia.org/wiki/Wet-bulb_temperature\" rel=\"noopener\" target=\"_blank\">wet bulb</a>)\ntemperature and taking wind chill into account, not just <a href=\"https://en.wikipedia.org/wiki/Dry-bulb_temperature\" rel=\"noopener\" target=\"_blank\">dry bulb</a>\ntemperature, such as a like a thermometer reading.</p>\n<p>Individual factors such as clothing, activity level, wind speed and\nexposure to sun all play a part in how we perceive temperature.\nSee this is a rough guideline.</p>"
    },
    "key": "outdoor temperature",
    "name": "Outdoor temperature",
    "steps": [
      {
        "color": "#0f3489",
        "legend": "Severe risk of frostbite",
        "value": -30
      },
      {
        "color": "#595ea3",
        "legend": "Risk of frostbite",
        "value": 0
      },
      {
        "color": "#7374b0",
        "legend": "Risk of hypothermia",
        "value": 10
      },
      {
        "color": "#7374b0",
        "legend": "Chilling temperatures",
        "value": 15
      },
      {
        "color": "#4caf50",
        "value": 22
      },
      {
        "color": "#4caf50",
        "value": 27
      },
      {
        "color": "#ea755a",
        "legend": "Risk of heat cramps or exhaustion",
        "value": 32
      },
      {
        "color": "#cf0000",
        "legend": "Heat exhaustion more likely",
        "value": 40
      },
      {
        "color": "#5b0f8c",
        "legend": "Heat stroke risk",
        "value": 54
      }
    ],
    "type": "absolute",
    "unit": "\u00b0C"
  },
  {
    "device_class": "temperature",
    "documentation": {
      "text": "<p>Outdoor temperatures related to human comfort and risk levels.</p>\n<p>Note that this works best when using apparent (or <a href=\"https://en.wikipedia.org/wiki/Wet-bulb_temperature\" rel=\"noopener\" target=\"_blank\">wet bulb</a>)\ntemperature and taking wind chill into account, not just <a href=\"https://en.wikipedia.org/wiki/Dry-bulb_temperature\" rel=\"noopener\" target=\"_blank\">dry bulb</a>\ntemperature, such as a like a thermometer reading.</p>\n<p>Individual factors such as clothing, activity level, wind speed and\nexposure to sun all play a part in how we perceive temperature.\nSee this is a rough guideline.</p>"
    },
    "key": "outdoor temperature f",
    "name": "Outdoor temperature",
    "steps": [
      {
        "color": "#0f3489",
        "legend": "Severe risk of frostbite",
        "value": -22
      },
      {
        "color": "#595ea3",
        "legend": "Risk of frostbite",
        "value": 32
      },
      {
        "color": "#7374b0",
        "legend": "Risk of hypothermia",
        "value": 50
      },
      {
        "color": "#7374b0",
        "legend": "Chilling temperatures",
        "value": 59
      },
      {
        "color": "#4caf50",
        "value": 71
      },
      {
        "color": "#4caf50",
        "value": 80
      },
      {
        "color": "#ea755a",
        "legend": "Risk of heat cramps or exhaustion",
        "value": 89
      },
      {
        "color": "#cf0000",
        "legend": "Heat exhaustion more likely",
        "value": 104
      },
      {
        "color": "#5b0f8c",
        "legend": "Heat stroke risk",
        "value": 129
      }
    ],
    "type": "absolute",
    "unit": "\u00b0F"
  },
  {
    "device_class": "ozone",
    "documentation": {
      "text": "<p>This scale is based on the European Environment Agency (EEA) Air Quality Index\nas implemented in their <a href=\"https://airindex.eea.europa.eu\" rel=\"noopener\" target=\"_blank\">official interactive map</a>\nas of late 2024.</p>"
    },
    "key": "ozone eaqi",
    "name": "Ozone (European Air Quality Index)",
    "steps": [
      {
        "color": "#50F0E6",
        "legend": "Good",
        "value": 0
      },
      {
        "color": "#50CCAA",
        "legend": "Fair",
        "value": 50
      },
      {
        "color": "#F0E641",
        "legend": "Moderate",
        "value": 100
      },
      {
        "color": "#FF5050",
        "legend": "Poor",
        "value": 130
      },
      {
        "color": "#960032",
        "legend": "Very poor",
        "value": 240
      },
      {
        "color": "#7D2181",
        "legend": "Extremely poor",
        "value": 380
      }
    ],
    "type": "absolute",
    "unit": "\u00b5g/m\u00b3"
  },
  {
    "device_class": "pm10",
    "documentation": {
      "text": "<p>This scale is based on the European Environment Agency (EEA) Air Quality Index\nas implemented in their <a href=\"https://airindex.eea.europa.eu\" rel=\"noopener\" target=\"_blank\">official interactive map</a>\nas of late 2024.</p>"
    },
    "key": "pm10 eaqi",
    "name": "PM10 (European Air Quality Index)",
    "steps": [
      {
        "color": "#50F0E6",
        "legend": "Good",
        "value": 0
      },
      {
        "color": "#50CCAA",
        "legend": "Fair",
        "value": 20
      },
      {
        "color": "#F0E641",
        "legend": "Moderate",
        "value": 40
      },
      {
        "color": "#FF5050",
        "legend": "Poor",
        "value": 50
      },
      {
        "color": "#960032",
        "legend": "Very poor",
        "value": 100
      },
      {
        "color": "#7D2181",
        "legend": "Extremely poor",
        "value": 150
      }
    ],
    "type": "absolute",
    "unit": "\u00b5g/m\u00b3"
  },
  {
    "device_class": "pm25",
    "documentation": {
      "text": "<p>This scale is based on an aggregate of the World Health Organization\n<a href=\"https://www.who.int/publications/i/item/9789240034228\" rel=\"noopener\" target=\"_blank\">global air quality guidelines</a> \nand <a href=\"https://www.who.int/publications/i/item/9789240000278\" rel=\"noopener\" target=\"_blank\">Personal interventions and risk communication on Air Pollution</a>\nreports.</p>\n<p>The lowest part of the range map to the AQG (Air Quality Goal)\ntarget, a PM<sub>2.5</sub> level of &lt;5 \u03bcg/m<sup>3</sup> which is considered relatively safe.\nThe upper part, &gt;100 \u03bcg/m<sup>3</sup>, is considered the level where the \nhealth benefits of regular physical activity is greatly offset by the\nPM<sub>2.5</sub> exposure.</p>\n<p>Note that the level of &lt;5 \u03bcg/m<sup>3</sup> is the AQG exposure\nlevel on an annaul basis. The WHO also has a 24-hour AQG level of\n&lt;15 \u03bcg/m<sup>3</sup> which is not included in this scale. As we're\ntrending patterns over time, the annual target made more sense for\nthe heatmap.</p>"
    },
    "key": "pm25",
    "name": "PM2.5 (WHO aggregate)",
    "steps": [
      {
        "color": "#6d9b17",
        "legend": "AQG level",
        "value": 5
      },
      {
        "color": "#FFBF00",
        "legend": "Interim target 2",
        "value": 25
      },
      {
        "color": "#cf0000",
        "value": 50
      },
      {
        "color": "#5b0f8c",
        "legends": "Risk level",
        "value": 100
      }
    ],
    "type": "absolute",
    "unit": "\u00b5g/m\u00b3"
  },
  {
    "device_class": "pm25",
    "documentation": {
      "text": "<p>This scale is based on the European Environment Agency (EEA) Air Quality Index\nas implemented in their <a href=\"https://airindex.eea.europa.eu\" rel=\"noopener\" target=\"_blank\">official interactive map</a>\nas of late 2024.</p>"
    },
    "key": "pm25 eaqi",
    "name": "PM2.5 (European Air Quality Index)",
    "steps": [
      {
        "color": "#50F0E6",
        "legend": "Good",
        "value": 0
      },
      {
        "color": "#50CCAA",
        "legend": "Fair",
        "value": 10
      },
      {
        "color": "#F0E641",
        "legend": "Moderate",
        "value": 20
      },
      {
        "color": "#FF5050",
        "legend": "Poor",
        "value": 25
      },
      {
        "color": "#960032",
        "legend": "Very poor",
        "value": 50
      },
      {
        "color": "#7D2181",
        "legend": "Extremely poor",
        "value": 75
      }
    ],
    "type": "absolute",
    "unit": "\u00b5g/m\u00b3"
  },
  {
    "key": "red hot",
    "name": "Red hot",
    "documentation": {
      "text": "<p>A single-hue sequential scale: near-black at the low end, saturated red through the middle, and a pale red tint at the top. Like <code>black hot</code> and <code>white hot</code>, the name describes what the highest values look like.</p>"
    },
    "steps": [
      {
        "color": "#242124",
        "value": 0
      },
      {
        "color": "#CF0000",
        "value": 0.6
      },
      {
        "color": "#FFD5D5",
        "value": 1
      }
    ],
    "type": "relative"
  },
  {
    "key": "stoplight",
    "name": "Stoplight",
    "steps": [
      {
        "color": "#6d9b17",
        "value": 0
      },
      {
        "color": "#fde74c",
        "value": 0.5
      },
      {
        "color": "#cf0000",
        "value": 1
      }
    ],
    "type": "relative"
  },
  {
    "device_class": "sulphur_dioxide",
    "documentation": {
      "text": "<p>This scale is based on the European Environment Agency (EEA) Air Quality Index\nas implemented in their <a href=\"https://airindex.eea.europa.eu\" rel=\"noopener\" target=\"_blank\">official interactive map</a>\nas of late 2024.</p>"
    },
    "key": "sulphur dioxide eaqi",
    "name": "Sulphur dioxide (European Air Quality Index)",
    "steps": [
      {
        "color": "#50F0E6",
        "legend": "Good",
        "value": 0
      },
      {
        "color": "#50CCAA",
        "legend": "Fair",
        "value": 100
      },
      {
        "color": "#F0E641",
        "legend": "Moderate",
        "value": 200
      },
      {
        "color": "#FF5050",
        "legend": "Poor",
        "value": 350
      },
      {
        "color": "#960032",
        "legend": "Very poor",
        "value": 500
      },
      {
        "color": "#7D2181",
        "legend": "Extremely poor",
        "value": 750
      }
    ],
    "type": "absolute",
    "unit": "\u00b5g/m\u00b3"
  },
  {
    "key": "white hot",
    "name": "White hot",
    "steps": [
      {
        "color": "#242124",
        "value": 0
      },
      {
        "color": "#F5F5F5",
        "value": 1
      }
    ],
    "type": "relative"
  }
];

/* ------------------------------------------------------------------------- */
/* Retired scale aliases                                                     */
/* ------------------------------------------------------------------------- */
/*
    Scale keys that used to be built in and have since been removed, each mapped to the
    surviving scale that replaces it.

    Removing a key outright would be a breaking change: get_scale() throws on an
    unrecognised name and setConfig() surfaces that as a card-wide error, so an existing
    dashboard would break on upgrade. Resolving through this map instead keeps those
    configurations rendering.

    Aliases deliberately live outside BUILTIN_SCALES so that get_by() never returns them
    and they stay out of the editor's scale picker - they resolve, but are not offered.
*/
const SCALE_ALIASES = {
    "outdoor temperature oceanic": "outdoor temperature",
    "outdoor temperature oceanic f": "outdoor temperature f",
    "wikipedia climate cool2": "outdoor temperature",
    "wikipedia climate cool2 f": "outdoor temperature f"
};

/* ------------------------------------------------------------------------- */
/* Home Assistant device class mappings                                      */
/* ------------------------------------------------------------------------- */
/*
    Maps every HA sensor device_class to optional metadata used by HeatmapScales:
      - default:      the built-in scale key to use when no scale is explicitly configured
      - unit_system:  the key in hass.config.unit_system whose value identifies the
                      display unit (e.g. "temperature" -> unit_system.temperature = "°F").
                      Only present for device classes where HA performs unit conversion.

    An empty object means the device class is valid for use with the card but has no
    default scale and no unit-system mapping (falls back to the global default: stoplight).
*/
const DEVICE_CLASSES = {
    "apparent_power": {},
    "atmospheric_pressure": {},
    "aqi": {},
    "battery": {},
    "carbon_dioxide": {"default": "carbon dioxide"},
    "carbon_monoxide": {},
    "current": {},
    "date": {},
    "duration": {},
    "energy": {},
    "frequency": {},
    "gas": {},
    "humidity": {},
    "illuminance": {},
    "monetary": {},
    "nitrogen_dioxide": {},
    "nitrogen_monoxide": {},
    "nitrous_oxide": {},
    "ozone": {},
    "pm1": {},
    "pm10": {},
    "pm25": {"default": "pm25"},
    "power_factor": {},
    "power": {},
    "pressure": {},
    "reactive_power": {},
    "signal_strength": {},
    "sulphur_dioxide": {},
    "temperature": {"default": "outdoor temperature", "unit_system": "temperature"},
    "timestamp": {},
    "volatile_organic_compounds": {},
    "voltage": {}
};

const MAX_DAYS = 365;
const MAX_WEEKS = 52;
const MAX_DECIMAL_PLACES = 10;
const MAX_CUSTOM_SCALE_STEPS = 100;

/*
    Below this estimated cell width or height (px), per-cell labels are suppressed
    because they become illegible. Width matters for horizontal carpet plots with many
    columns; height matters when display.height packs many rows into a short card.
*/
const MIN_LABEL_CELL_WIDTH_PX = 22;
const MIN_LABEL_CELL_HEIGHT_PX = 14;

/*
    Bounds offered by the editor's grid height control. These constrain the UI only;
    setConfig accepts any positive height so a hand-written YAML config is not second
    guessed.
*/
// How often the card refetches while showing the current window.
const REFRESH_INTERVAL_MS = 10 * 60 * 1000;

// Days in a week; daily mode pages by whole weeks to stay Monday-aligned.
const DAYS_PER_WEEK = 7;

const MIN_GRID_HEIGHT_PX = 50;
const MAX_GRID_HEIGHT_PX = 2000;

/*
    Axis label spacing. Labels are drawn every Nth position, where N is chosen so that
    consecutive labels are at least this many pixels apart and therefore do not collide.

    A stacked label only needs to clear the line box above it, so the vertical minimum is
    small. A date written across the axis ("01 Sep") needs room for the text itself, hence
    the much larger horizontal minimum.
*/
/*
    Bucket sizes the time axis may be divided into. Restricted to whole divisors of 24 so
    every bucket covers the same number of hours - an uneven final bucket would make the
    axis lie about what a cell represents.
*/
const TIME_INTERVALS = [1, 2, 3, 4, 6, 8, 12, 24];

// Default spacing of time-axis labels in vertical layout, preserved from the original
// hardcoded 24-column header (labels at 00, 04, 08, 12, 16, 20 plus the final hour).
const DEFAULT_HOUR_LABEL_INTERVAL = 4;

// Upper bound for display.time_labels: labelling less often than every 24 slots would
// leave a 24-hour axis with a single label.
const MAX_TIME_LABEL_STRIDE = 24;

const MIN_STACKED_LABEL_PX = 14;
const MIN_DATE_LABEL_PX = 56;

/*
    Height one grid row occupies when no explicit height is configured, derived from the
    `tr { line-height: 1.1 }` rule at the card's 90% font size. Only used to estimate the
    card's height for getCardSize(); the real height still comes from layout.
*/
const APPROX_NATURAL_ROW_PX = 14;

// Home Assistant sizes cards in units of roughly this many pixels.
const HA_CARD_SIZE_UNIT_PX = 50;

/*
    Sections-view grid geometry, from the Home Assistant custom card documentation: each
    section is 12 columns wide, a grid row is 56px tall, and there is an 8px gap between
    rows. getGridOptions() converts an estimated pixel height into whole grid rows.
*/
const GRID_ROW_HEIGHT_PX = 56;
const GRID_GAP_PX = 8;
const SECTION_COLUMNS = 12;

/*
    Rough heights of the fixed furniture around the grid, used only to estimate how many
    grid rows the card needs. Approximate on purpose - the real layout still comes from
    the browser, and being a row out simply means the user drags the handle once.
*/
const CARD_TITLE_PX = 48;
const NAV_ROW_PX = 38;
const COLUMN_HEADER_PX = 24;
const LEGEND_PX = 70;

// Width of the row-title gutter. Must stay in step with `.hm-row-title` in static styles.
const ROW_TITLE_WIDTH_PX = 50;

/*
    How many axis positions to skip between labels so that consecutive labels are at
    least min_px_per_label apart.

    Returns 1 (label everything) when the axis size is not yet known - the card renders
    once before the ResizeObserver has measured anything, and dropping labels on that
    first paint would make the card flicker.
*/
/*
    Combine consecutive hourly slots into buckets of `interval` hours.

    `use_sum` picks the aggregation, and it matters: total/total_increasing entities store
    an hourly delta per slot, which must be added to describe a longer window, while
    measurement entities store an hourly mean, which must be averaged. Summing means (or
    averaging deltas) would silently produce nonsense values.

    Slots with no data are skipped rather than counted as zero; a bucket is null only when
    every hour in it is missing.
*/
/*
    Format an hour (0-23) in 12-hour style, e.g. 0 -> "12 AM", 13 -> "1 PM".
*/
function hour_label_12h(hour) {
    if (hour === 0) { return '12 AM'; }
    if (hour === 12) { return '12 PM'; }
    return hour < 12 ? `${hour} AM` : `${hour - 12} PM`;
}

function bucket_values(vals, interval, use_sum) {
    const buckets = [];
    for (let start = 0; start < vals.length; start += interval) {
        const present = vals.slice(start, start + interval)
            .filter((value) => value !== null && value !== undefined);
        if (present.length === 0) {
            buckets.push(null);
            continue;
        }
        const total = present.reduce((sum, value) => sum + value, 0);
        buckets.push(use_sum ? total : (total / present.length));
    }
    return buckets;
}

function label_stride(label_count, available_px, min_px_per_label) {
    if (!(available_px > 0) || !(label_count > 0)) { return 1; }
    const px_per_label = available_px / label_count;
    if (px_per_label >= min_px_per_label) { return 1; }
    return Math.ceil(min_px_per_label / px_per_label);
}

/* ------------------------------------------------------------------------- */
/* HeatmapScales - scale management and color generation                     */
/* ------------------------------------------------------------------------- */
/*
    Unit conversion functions, keyed as conversions[unit_system_domain][from_unit][to_unit].
    Only temperature is handled for now. Pressure is intentionally omitted - see the
    comment in get_recorder() for why that is messier than it looks.

    Each leaf value is a function (val) -> converted_val applied to every step value
    in a scale when the user's display unit differs from the scale's authored unit.
*/
const conversions = {
    'temperature': {
        '°C': {
            '°F': (val) => parseInt((val * 1.8) + 32)
        },
        '°F': {
            '°C': (val) => parseInt((val - 32) / 1.8)
        }
    }
}

/*
    Manages the built-in color scales and generates ready-to-use scale objects.

    Typical call sequence:
      1. defaults_for(device_class) - find the right scale key for an entity
      2. get_scale(key, device_class, unit_system) - build the renderable scale object
      3. Use scale.gradient(value) to get a chroma color for a data point
         and scale.css to render the legend bar.

    Built-in scale definitions live in BUILTIN_SCALES, which is hand-edited inline in
    this file. (An earlier comment here claimed it was generated from `scales/*.yaml`;
    that generation step belongs to the upstream project and no such directory exists
    in this repository.) Retired keys are redirected via SCALE_ALIASES.
    Custom scales can be passed as plain objects with the same shape.
*/
/* ------------------------------------------------------------------------- */
/* Shared utility helpers                                                     */
/* ------------------------------------------------------------------------- */

/*
    Deep-clone a JSON-serialisable object. Used both to snapshot the immutable
    config/scale objects Home Assistant hands us before mutating them, and to
    clone scale steps prior to on-the-fly unit conversion.
*/
function deep_clone(obj) {
    return JSON.parse(JSON.stringify(obj));
}

/*
    True when a data.min/data.max bound is left to be inferred from the data,
    i.e. it is unset or explicitly 'auto'.
*/
function is_auto(value) {
    return value === undefined || value === 'auto';
}

/*
    Number of days from the given date back to the Monday of its week
    (0 = Monday ... 6 = Sunday). getDay() returns 0 for Sunday, which maps to 6.
*/
function days_from_monday(date) {
    const dow = date.getDay();
    return (dow === 0) ? 6 : (dow - 1);
}

/*
    Locale-aware short "MMM DD" label (e.g. "Mar 20") used for heatmap row dates.
*/
function format_month_day(date, language) {
    const formatter = new Intl.DateTimeFormat(language, { month: 'short', day: '2-digit' });
    if (!month_shortening_is_safe(language)) {
        return formatter.format(date);
    }
    return formatter.formatToParts(date)
        .map((part) => part.type === 'month' ? shorten_month(part.value) : part.value)
        .join('');
}

/*
    Trim a localised short month name to three letters.

    Intl is not consistent about width: en-GB abbreviates September to "Sept" while the
    other eleven months get three letters, and es and ru are uneven in the same way. Mixed
    widths make a date axis look ragged.

    Only Latin and Cyrillic abbreviations are trimmed. Truncating other scripts would
    produce something the locale never uses - Japanese renders months as a bare number
    beside a separate literal, and Arabic writes them out in full. A trailing period is
    dropped first, so "sept." becomes "sep" rather than "sep.".
*/
function shorten_month(month) {
    const bare = month.replace(/\.$/, '');
    if (bare.length <= 3) { return bare; }
    if (!/^[\p{Script=Latin}\p{Script=Cyrillic}]+$/u.test(bare)) { return month; }
    return bare.slice(0, 3);
}

// Cache of language -> whether three-letter months are unambiguous there. Building the
// answer means formatting twelve dates, and format_month_day() is called per grid row.
const month_shortening_cache = new Map();

/*
    True when trimming every month to three letters still leaves twelve distinct names.

    French is the reason this check exists: "juin" and "juil." both trim to "jui", so
    June and July would become indistinguishable on the axis. A tidier axis is not worth
    an ambiguous one, so such locales keep whatever abbreviation Intl gives them.
*/
function month_shortening_is_safe(language) {
    const key = language || '';
    if (month_shortening_cache.has(key)) { return month_shortening_cache.get(key); }

    const formatter = new Intl.DateTimeFormat(language, { month: 'short', day: '2-digit' });
    const shortened = new Set();
    for (let month = 0; month < 12; month++) {
        // Day 1 of a fixed year; only the month part is read.
        const part = formatter.formatToParts(new Date(2024, month, 1))
            .find((candidate) => candidate.type === 'month');
        shortened.add(part === undefined ? String(month) : shorten_month(part.value));
    }
    const safe = (shortened.size === 12);
    month_shortening_cache.set(key, safe);
    return safe;
}

/*
    True when two state_class values cannot be meaningfully combined: one is a
    'measurement' and the other is not ('total' and 'total_increasing' are
    interchangeable). Returns false when either class is unknown (undefined),
    since the entity may not be loaded yet or may be an external statistic.
*/
function state_classes_incompatible(a, b) {
    if (a === undefined || b === undefined) { return false; }
    return (a === 'measurement') !== (b === 'measurement');
}

/*
    Flatten a heatmap grid into its non-null values. Nulls are dropped because
    Math.min/Math.max coerce null to 0, which would skew the computed extent.
*/
function grid_values(grid) {
    var vals = [];
    for (const entry of grid) {
        vals = vals.concat(entry.vals);
    }
    return vals.filter(v => v !== null);
}

class HeatmapScales {
    /*
        Indexes BUILTIN_SCALES by key for O(1) lookup in get_scale().
        The default_scale is the fallback used when no device_class match exists.
    */
    constructor() {
        this.default_scale = 'stoplight';
        this.scale_by_key = {};
        for (const scale of BUILTIN_SCALES) {
            this.scale_by_key[scale.key] = scale;
        }
    }

    /*
        Returns a rendered scale, either a builtin one (if passed a string)
        or a custom scale (if passed an object).
    */
    get_scale(config, device_class = '', unit_system = {}) {
        if (config === undefined) { config = this.default_scale; }
        if (typeof(config) === 'string') {
            var builtin = this.scale_by_key[config];
            if (builtin === undefined) {
                // The key may name a scale that has since been retired. Redirect it to
                // its replacement rather than erroring out an existing dashboard.
                // One hop only - SCALE_ALIASES never points at another alias.
                const replacement = SCALE_ALIASES[config];
                if (replacement !== undefined) {
                    builtin = this.scale_by_key[replacement];
                }
            }
            if (builtin === undefined) {
                throw new Error(`Unknown scale '${config}'`);
            }
            return this.generate_scale(builtin, device_class, unit_system);
        }
        this.validate_custom_scale(config);
        /*
            If we use a custom scale, strip the `docs` key
            as we'll be rendering it in the UI verbatim
        */
        var scale = this.generate_scale(config, device_class, unit_system);
        delete scale.docs;
        return scale;
    }

    validate_custom_scale(config) {
        if (config === null || typeof(config) !== 'object' || Array.isArray(config)) {
            throw new Error("Custom `scale` must be an object");
        }
        if (config.type !== undefined && !['absolute', 'relative'].includes(config.type)) {
            throw new Error("Custom `scale.type` must be 'absolute' or 'relative'");
        }
        if (!Array.isArray(config.steps) ||
            config.steps.length < 2 ||
            config.steps.length > MAX_CUSTOM_SCALE_STEPS) {
            throw new Error(
                `Custom \`scale.steps\` must contain 2-${MAX_CUSTOM_SCALE_STEPS} entries`
            );
        }
        for (const step of config.steps) {
            if (step === null || typeof(step) !== 'object' || Array.isArray(step)) {
                throw new Error("Each custom scale step must be an object");
            }
            if (typeof(step.color) !== 'string' || !chroma.valid(step.color)) {
                throw new Error("Each custom scale step needs a valid color");
            }
            if ('value' in step && !Number.isFinite(step.value)) {
                throw new Error("Custom scale step values must be finite numbers");
            }
            if ((config.type ?? 'relative') === 'absolute' && !Number.isFinite(step.value)) {
                throw new Error("Absolute custom scale steps need numeric values");
            }
        }
    }

    /*
        Create the chromajs object + CSS gradient for the scale.

        We're also doing unit conversion if required; the way this works is that
        we adjust the scale if we need to (frontend unit config differs from
        scale unit config) and we know how to perform the conversion. This is a
        bit more heavy-handed than I'd like, but the alternatives seem messier.

        No caching done on the output, would need to reconsider that decision
        if the function becomes more expensive. Does get a bit messy since we're
        converting units on the fly.
    */
    generate_scale(config, device_class = undefined, unit_system = {}) {
        // Custom scales have been observed to be immutable in Home Assistant 2024.11, requiring to be cloned to be modified
        const steps = deep_clone(config.steps);
        const colors = [];
        const domains = [];
        let unit = config.unit;
        
        // Default conversion function: Do nothing
        let conversion_fn = (val) => val;
        
        // dc_domain = the key in the unit_system object that is relevant
        // for the given device class.
        // TODO: See if this can be simplified. It's a bit more code than
        // I'd like for what it does.
        if (config.unit && device_class && unit_system) {
            const dc_domain = DEVICE_CLASSES[device_class].unit_system;
            const us_unit = unit_system[dc_domain];
            if (dc_domain &&
                us_unit &&
                config.unit !== us_unit &&
                conversions[dc_domain] &&
                conversions[dc_domain][config.unit] && 
                conversions[dc_domain][config.unit][us_unit]) {
                    unit = us_unit;
                    conversion_fn = conversions[dc_domain][config.unit][us_unit]
            }
        }
        
        for (const step of steps) {
            colors.push(step.color);
            if ('value' in step) {
                step.value = conversion_fn(step.value)
                domains.push(step.value)
            }
        }
        
        let gradient;
        if (domains.length > 0 && domains.length === colors.length) {
            gradient = chroma.scale(colors).domain(domains);
        } else {
            gradient = chroma.scale(colors);
        }
        
        return {
            'gradient': gradient,
            'type': config.type ?? 'relative',
            'name': config.name,
            'key': config.key,
            'steps': steps,
            'unit': unit,
            'docs': config.documentation,
            'css': this.legend_css_by_gradient(gradient)
        }
    }

    /*
        Generate CSS for a gradient. There would be cleaner ways to go about this
        than generating a 21 step gradient every time; not sure if it can be safely
        optimized.
     */
    legend_css_by_gradient(gradient) {
        var fragment = [];
        for (const [idx, color] of gradient.colors(21).entries()) {
            fragment.push(`${color} ${idx * 5}%`);
        }
        return fragment.join(', ');
    }

    /*
        Return the default scale name for the given device class. If none
        defined, return the global default (stoplight)
    */
    defaults_for(device_class) {
        if (device_class in DEVICE_CLASSES && 'default' in DEVICE_CLASSES[device_class]) {
            return DEVICE_CLASSES[device_class].default;
        } else {
            return this.default_scale;
        }
    }

    /*
        Fetch scale by attribute, typically type or device_class.
    */
    get_by(field, value) {
        var out = BUILTIN_SCALES.filter(scale => scale[field] === value);
        return out.map(scale => this.get_scale(scale));
    }
}

/* ------------------------------------------------------------------------- */
/* HeatmapCard - main card component                                         */
/* ------------------------------------------------------------------------- */
/*
    * General code layout *

    There are three routines whose quirks drive the overall design and quirks:
      - render(): Displays the actual card contents. Called infrequently. All
                  HTML templating is captured in this and related routines.

      - set hass(): Called by HA's UI rather frequently, so we make sure to
                    cache aggressively. On load (rendering our tag) + after
                    config changes, we're:
                      - Calling populate_meta()
                        to setup some values based on the HA configuration + our
                        card configuration, with defaults as applicable.
                      - Fetch the data to drive the heatmap from Long Term Storage.

      - setConfig(): Called by HA's UI when the card is first displayed
                     and again when the config changes. Note that it's called
                     *before* set hass(), meaning we can't use the hass object
                     to validate our config, annoyingly enough.
*/





class HeatmapCard extends LitElement {
    last_render_ts = 0;
    scales = new HeatmapScales();

    // Provide a stub config for the card picker preview.
    // Prefer sensors with state_class (recorder-tracked); fall back to any sensor.
    static getStubConfig(hass) {
        const entity = hass
            ? (Object.keys(hass.states).find((id) =>
                  id.startsWith('sensor.') && hass.states[id].attributes.state_class
              ) || Object.keys(hass.states).find((id) => id.startsWith('sensor.')))
            : undefined;
        return { entity: entity || '' };
    }

    static get properties() {
        return {
            hass: {},
            config: {},
            grid: [],
            grid_status: undefined,
            meta: {},
            tooltipOpen: false,
            selected_element_data: '',
            // Rendered size of the grid table, maintained by the ResizeObserver set up in
            // firstUpdated(). Drives axis label thinning; 0 until the first measurement.
            grid_width: 0,
            grid_height: 0,
            // Days the visible window is shifted into the past. 0 is the present;
            // negative values page backwards a whole page at a time.
            view_offset: 0
        };
    }

    /*
        Main LitElement render function. Produces the full card HTML including the
        heatmap table, status message, legend, and tooltip overlay.

        The table is built from this.grid: each row is a date (or week in daily mode),
        each cell is a data slot. Cell color is resolved via the chroma gradient at
        render time rather than stored on the grid, so a scale change re-colors
        immediately without re-fetching data.

        Called by Lit whenever a tracked property changes (grid, meta, tooltipOpen, etc.).
    */
    render() {
        // We may be trying to render before we've received the recorder data.
        if (this.grid === undefined) { this.grid = []; }
        // Evaluate once per render - render_cell is called thousands of times.
        this._labels_legible = this.labels_are_legible();
        const is_horizontal = (this.config?.orientation === 'horizontal');
        return html`
            <ha-card header="${this.meta.title}" id="card">
                <div class="card-content">
                    ${this.render_navigation()}
                    <table id="grid" class="${this.grid_css_class()}" style="${this.grid_style()}">
                        <thead>
                            <tr class="hr${this.myhass.locale.time_format}">
                                <th class="hm-row-title">${this.corner_label()}</th>
                                ${is_horizontal ? this.date_column_headers() : this.date_table_headers()}
                            </tr>
                        </thead>
                        <tbody>
                    ${is_horizontal ? this.render_rows_horizontal() : this.render_rows_vertical()}
                        </tbody>
                    </table>
                    ${this.render_status()}
                    ${this.render_legend()}
                    ${this.render_tooltip()}
                </div>
            </ha-card>
        `;
    }

    /*
        Renders one heatmap cell.

        `row` is always the index into this.grid (a day in hourly mode, a week in daily
        mode) and `col` is always the slot within that entry (hour 0-23, or weekday 0-6).
        Both orientations emit the same data-row/data-col pairing, which is what lets
        render_tooltip() stay orientation-agnostic: it resolves this.grid[data-row] and
        derives the time window from data-col regardless of how the table is laid out.
    */
    render_cell(util, row, col) {
        /*
            No reading for this slot. The cell still has to exist so the transposed
            layout stays aligned with its column headers, but it must not be coloured:
            feeding null to the gradient (or to the relative normalisation below) maps
            "missing" onto the bottom of the scale, which is what made not-yet-elapsed
            hours read as zeros in horizontal layout. `.hm-box.null` leaves it blank,
            matching the trailing cells vertical layout simply omits.
        */
        if (util === null || util === undefined) {
            return html`<td @click="${this.toggle_tooltip}" class="hm-box null" data-val="" data-row="${row}" data-col="${col}"></td>`;
        }
        var css_class = "hm-box";
        var r = util;
        if (this.meta.scale.type === 'relative') {
            const diff = this.meta.data.max - this.meta.data.min;
            r = (util - this.meta.data.min) / diff;
            if (r < 0) { r = 0 };
            if (r > 1) { r = 1 };
        }
        const col_value = this.meta.scale.gradient(r);

        // Cell labels are opt-in (display.labels === true). Background stays on
        // currentcolor via the style colour; text colour is set on an inner span so
        // we do not break .hm-box.null or table.fixed-height .hm-box.
        // this.config?. guards the bare makeCard() objects used by unit tests.
        let label_content = '';
        // Prefer the per-render cache from render(); fall back for direct unit-test calls.
        const legible = (typeof this._labels_legible === 'boolean')
            ? this._labels_legible
            : this.labels_are_legible();
        if (this.config?.display?.labels === true && legible) {
            const hide_zero = this.config?.display?.hide_zero === true;
            if (!(hide_zero && Number(util) === 0)) {
                const decimals = this.config?.display?.decimals;
                const text = Number.isInteger(decimals)
                    ? Number(util).toFixed(decimals)
                    : (Number.isInteger(util) ? String(util) : Number(util).toFixed(1));
                let text_color = '#fff';
                try {
                    // Pick whichever of black/white has higher contrast against the cell.
                    text_color = chroma.contrast(col_value, '#111') >= chroma.contrast(col_value, '#fff')
                        ? '#111' : '#fff';
                } catch (e) { /* keep light text */ }
                label_content = html`<span class="hm-label" style="color: ${text_color}">${text}</span>`;
            }
        }

        return html`<td @click="${this.toggle_tooltip}" class="${css_class}" data-val="${util}" data-row="${row}" data-col="${col}" style="color: ${col_value}">${label_content}</td>`
    }

    /*
        True when per-cell labels would still be readable in the current layout.

        Uses the ResizeObserver-maintained grid_width / grid_height (same source as
        column_label_stride) so we do not force layout on every cell. When the grid has
        not been measured yet (width/height still 0), return true so the first paint is
        not missing labels that would appear a moment later.
    */
    labels_are_legible() {
        if (!this.grid || this.grid.length === 0) { return true; }
        // Not measured yet - show labels; matches the label_stride "unknown size" policy.
        if (!this.grid_width || !this.grid_height) { return true; }

        const is_horizontal = (this.config?.orientation === 'horizontal');
        // Horizontal: one column per grid entry (day/week). Vertical: one per time slot.
        const columns = is_horizontal
            ? this.grid.length
            : (this.slot_count() || 24);
        const rows = is_horizontal
            ? (this.slot_count() || 24)
            : this.grid.length;

        const usable_width = this.grid_width - ROW_TITLE_WIDTH_PX;
        const cell_w = usable_width / Math.max(columns, 1);
        const cell_h = this.grid_height / Math.max(rows, 1);

        return cell_w >= MIN_LABEL_CELL_WIDTH_PX && cell_h >= MIN_LABEL_CELL_HEIGHT_PX;
    }

    /*
        Default layout: one table row per grid entry (day or week), one cell per hour or
        weekday. Row titles are the dates, thinned when they would overlap.
    */
    render_rows_vertical() {
        const stride = this.row_label_stride();
        return this.grid.map((entry, row) => html`<tr>
            <td class="hm-row-title"><span>${row % stride === 0 ? entry.date : ''}</span></td>
            ${entry.vals.map((util, idx) => this.render_cell(util, row, idx))}
        </tr>`);
    }

    /*
        Grid entries in the order they appear as columns, oldest first.

        this.grid is newest-first, which is what vertical layout wants: the most recent
        day at the top. Read left to right that same order would put the newest date on
        the left and run time backwards, so horizontal layout reverses it. Each element
        keeps its original index so data-row still identifies the right grid entry.
    */
    ordered_columns() {
        return this.grid.map((entry, row) => ({ entry, row })).reverse();
    }

    /*
        Carpet-plot layout: the grid is transposed so dates run left to right across the
        card and time of day runs top to bottom. Row count is therefore fixed (24 hours,
        or 7 weekdays) no matter how long the configured range is, which is what keeps a
        365-day heatmap a sensible height.

        Note the loop order is inverted relative to render_rows_vertical() but the
        data-row/data-col arguments to render_cell() are not - see render_cell().
    */
    render_rows_horizontal() {
        const slot_count = this.slot_count();
        const stride = this.row_label_stride();
        const columns = this.ordered_columns();
        const slots = [];
        for (let slot = 0; slot < slot_count; slot++) {
            slots.push(html`<tr>
                <td class="hm-row-title"><span>${this.time_axis_label(slot, stride)}</span></td>
                ${columns.map(({ entry, row }) => this.render_cell(entry.vals[slot] ?? null, row, slot))}
            </tr>`);
        }
        return slots;
    }

    /*
        Label for one row of the time axis, or a filler dot when this row falls between
        labels.

        The dot matters: with 24 hourly rows squeezed into a short card the labels thin to
        every second row, and a bare "00, 02, 04" reads as if each cell covered two hours.
        Marking the skipped rows shows that there is a row between them. This is the same
        convention date_table_headers() already uses for unlabelled hour columns in the
        vertical layout.
    */
    time_axis_label(slot, stride) {
        if (slot % stride === 0) { return this.slot_label(slot); }
        return '·';
    }

    /*
        Number of slots in each grid entry: 24 hours in hourly mode, 7 weekdays in daily.
        Read from the data rather than assumed, so a short first/last day cannot desync
        the transposed layout from the vertical one.
    */
    slot_count() {
        return this.grid.reduce((widest, entry) => Math.max(widest, entry.vals.length), 0);
    }

    /*
        Apply the configured time_interval to every row of a freshly built grid.

        Only hourly mode buckets: daily mode's axis is the days of the week, which cannot
        meaningfully be grouped into hours. An interval of 1 is a no-op and returns the
        grid untouched, so the default path is exactly as it was.
    */
    bucket_grid(grid) {
        const interval = this.config.time_interval ?? 1;
        if (interval <= 1 || this.config.mode === 'daily') { return grid; }
        // Deltas add up over a longer window; means have to be averaged. See bucket_values.
        const use_sum = ['total', 'total_increasing'].includes(this.meta.state_class);
        return grid.map((entry) => ({
            ...entry,
            vals: bucket_values(entry.vals, interval, use_sum)
        }));
    }

    /*
        Hours covered by one cell along the time axis.
    */
    time_interval() {
        return this.config.time_interval ?? 1;
    }

    /*
        Label every Nth position on the time axis.

        An explicit display.time_labels wins. Otherwise horizontal layout measures what
        fits (the time axis is vertical there, so it competes for height), while vertical
        layout keeps its long-standing four-hourly labelling.
    */
    time_label_stride(slot_count) {
        const configured = this.config.display?.time_labels;
        if (Number.isInteger(configured) && configured >= 1) { return configured; }
        if (this.config.orientation === 'horizontal') {
            return label_stride(slot_count, this.grid_height, MIN_STACKED_LABEL_PX);
        }
        return Math.max(1, Math.round(DEFAULT_HOUR_LABEL_INTERVAL / this.time_interval()));
    }

    /*
        Label for one slot on the time axis, used as the row title in horizontal layout.

        Hourly mode follows hass.locale.time_format, matching date_table_headers(); daily
        mode reuses the same Monday-anchored weekday naming that mode already uses.
    */
    slot_label(slot) {
        if (this.config.mode === 'daily') {
            // 2024-01-01 is a Monday; used purely to generate locale weekday names.
            const MONDAY_REFERENCE = new Date(2024, 0, 1);
            const day_date = new Date(MONDAY_REFERENCE);
            day_date.setDate(day_date.getDate() + slot);
            return new Intl.DateTimeFormat(this.meta.language, { weekday: 'short' }).format(day_date);
        }
        const interval = this.time_interval();
        const hour = slot * interval;
        if (this.myhass.locale.time_format === '12') {
            // 12-hour labels are already wide ("12 AM"); a range would not fit the
            // 50px gutter, so only the start of the bucket is shown.
            return hour_label_12h(hour);
        }
        const start = String(hour).padStart(2, '0');
        if (interval === 1) { return start; }
        // 24-hour labels are compact enough to show the whole window.
        return `${start}-${String((hour + interval) % 24).padStart(2, '0')}`;
    }

    /*
        Corner cell of the header row: names whichever axis the row titles represent.
        Horizontal layout puts time down the side, vertical puts dates there.
    */
    corner_label() {
        const key = (this.config.orientation === 'horizontal')
            ? 'ui.dialogs.helper_settings.input_datetime.time'
            : 'ui.dialogs.helper_settings.input_datetime.date';
        return this.myhass.localize(key)
            || (this.config.orientation === 'horizontal' ? 'Time' : 'Date');
    }

    /*
        Column headers for horizontal layout: a date every `stride` columns.

        Each header spans the columns it covers rather than sitting in a single one-column
        cell. A date needs far more width than one column provides once the range is long
        - at 60 days a column is around 30px, which clips "01 Sept" to "01 S" - and
        colspan hands the label exactly the gap up to the next one. The spans always sum
        to the column count, so the header row stays aligned with the body.
    */
    date_column_headers() {
        const stride = this.column_label_stride();
        const columns = this.ordered_columns();
        const total = columns.length;
        const headers = [];
        var idx = 0;
        while (idx < total) {
            const remaining = total - idx;
            /*
                Absorb a short trailing group rather than leaving a stub. Dividing 365
                columns by a stride of 11 leaves 2 columns at the end - a few pixels wide,
                nowhere near enough for "30 Aug", so the label would spill past the right
                edge of the card. Taking the remainder now keeps every labelled group at
                least `stride` columns wide, which is by definition enough for a label.
            */
            const span = (remaining < stride * 2) ? remaining : stride;
            headers.push(html`<th colspan="${span}">${columns[idx].entry.date}</th>`);
            idx += span;
        }
        return headers;
    }

    /*
        Stride for the row titles down the left-hand gutter. Measured against the rendered
        height of the grid, so it adapts to display.height and to the card being resized.
    */
    row_label_stride() {
        // Horizontal puts the time axis down the side, so it follows the time-axis
        // rules (including display.time_labels). Vertical puts dates there, which are
        // always measured because their count grows with the configured range.
        if (this.config.orientation === 'horizontal') {
            return this.time_label_stride(this.slot_count());
        }
        return label_stride(this.grid.length, this.grid_height, MIN_STACKED_LABEL_PX);
    }

    /*
        Stride for the date headers across the top in horizontal layout. Measured against
        the grid width less the row-title gutter, which the dates do not occupy.
    */
    column_label_stride() {
        const usable_px = this.grid_width - ROW_TITLE_WIDTH_PX;
        return label_stride(this.grid.length, usable_px, MIN_DATE_LABEL_PX);
    }

    /*
        Extra classes on the grid table: which layout is active, and whether an explicit
        height has been configured. Both are styled in static styles rather than inline so
        the default (vertical, natural height) path emits no extra CSS at all.
    */
    grid_css_class() {
        const classes = [];
        if (this.config.orientation === 'horizontal') { classes.push('horizontal'); }
        if (Number.isFinite(this.config.display?.height)) { classes.push('fixed-height'); }
        return classes.join(' ');
    }

    /*
        Inline style for the grid table. When display.height is configured, the available
        height is divided evenly between rows and published as a custom property that the
        `fixed-height` CSS rules consume.
    */
    grid_style() {
        const height = this.config.display?.height;
        if (!Number.isFinite(height)) { return ''; }
        const rows = (this.config.orientation === 'horizontal')
            ? this.slot_count()
            : this.grid.length;
        if (rows < 1) { return ''; }
        // 1px floor: a sub-pixel row would collapse to nothing and hide the data.
        const row_px = Math.max(1, Math.floor(height / rows));
        return `--hm-cell-height: ${row_px}px;`;
    }

    /*
        Returns the <th> header cells for the column axis of the heatmap table.

        In hourly mode: 24 columns representing hours 0-23. Labels are shown at
        0, 4, 8, 12, 16, 20 and the last hour, with dots for the unlabelled columns.
        Format follows hass.locale.time_format: 12h (12 AM / 4 AM ...) or 24h (00 / 04 ...).

        In daily mode: 7 columns representing Mon-Sun. Labels use the locale short
        weekday name derived from a fixed Monday reference date (2024-01-01).
    */
    date_table_headers() {
        if (this.config.mode === 'daily') {
            // Use locale-aware short weekday names, starting from Monday (index 1..6, then 0)
            // Reference date 2024-01-01 is a Monday - used purely for weekday name generation
            const MONDAY_REFERENCE = new Date(2024, 0, 1);
            const day_formatter = new Intl.DateTimeFormat(this.meta.language, { weekday: 'short' });
            const day_headers = [];
            for (let day_offset = 0; day_offset < 7; day_offset++) {
                const day_date = new Date(MONDAY_REFERENCE);
                day_date.setDate(day_date.getDate() + day_offset);
                day_headers.push(html`<th>${day_formatter.format(day_date)}</th>`);
            }
            return day_headers;
        }
        /*
            Generated rather than hardcoded because the column count now depends on
            time_interval. With the defaults (interval 1, automatic labels) this
            reproduces the original fixed markup exactly: labels at 00, 04, 08, 12, 16
            and 20, the final hour always labelled, and a dot in between.
        */
        const slot_count = this.slot_count() || (24 / this.time_interval());
        const stride = this.time_label_stride(slot_count);
        const interval = this.time_interval();
        const twelve_hour = (this.myhass.locale.time_format === '12');
        const headers = [];
        for (let slot = 0; slot < slot_count; slot++) {
            const last = (slot === slot_count - 1);
            if (slot % stride !== 0 && !last) {
                headers.push(html`<th>·</th>`);
                continue;
            }
            const hour = slot * interval;
            if (twelve_hour) {
                // Split across two lines so the column stays narrow; matches the
                // `tr.hr12 th` sizing rule in static styles.
                const [value, meridiem] = hour_label_12h(hour).split(' ');
                headers.push(html`<th>${value}<br/>${meridiem}</th>`);
            } else {
                headers.push(html`<th>${String(hour).padStart(2, '0')}</th>`);
            }
        }
        return headers;
    }

    /*
        Renders the history navigation row: back, the visible date range, forward, and a
        "Now" shortcut that only appears once the user has actually paged away.

        Forward is disabled at offset 0 rather than hidden, so the control row does not
        change width as you page - a moving target is harder to click repeatedly.

        Hidden entirely when display.navigation is false.
    */
    render_navigation() {
        if (this.config.display?.navigation === false) { return; }
        const browsing_history = (this.view_offset < 0);
        return html`
            <div class="nav-controls">
                <button
                    class="nav-btn"
                    title="Earlier"
                    aria-label="Show earlier data"
                    @click="${() => this.navigate('back')}"
                >&#8592;</button>
                <span class="nav-range">${this.visible_range_label()}</span>
                <button
                    class="nav-btn"
                    title="Later"
                    aria-label="Show later data"
                    ?disabled="${!browsing_history}"
                    @click="${() => this.navigate('forward')}"
                >&#8594;</button>
                <button
                    class="nav-btn nav-now"
                    title="Jump back to the present"
                    aria-label="Jump back to the present"
                    ?hidden="${!browsing_history}"
                    @click="${() => this.navigate('current')}"
                >Now</button>
            </div>
        `;
    }

    /*
        Label describing the window currently on screen, e.g. "21 Aug - 10 Sep".

        Read from the rendered grid rather than computed from the offset, so it always
        describes the data actually being shown - including when the recorder returned
        less history than was asked for. The grid is newest-first, hence the reversed ends.
    */
    visible_range_label() {
        if (!this.grid || this.grid.length === 0) { return ''; }
        const newest = this.grid[0]?.date;
        const oldest = this.grid[this.grid.length - 1]?.date;
        if (!oldest || !newest) { return ''; }
        return (oldest === newest) ? oldest : `${oldest} - ${newest}`;
    }

    /*
        Renders a status message when this.grid_status is set (e.g. "No data").
        Returns nothing when the grid has loaded successfully.
    */
    render_status() {
        if (this.grid_status) {
            return html`<h3>${this.grid_status}</h3>`
        }
    }

    /*
        Renders the color scale legend bar and its tick labels below the heatmap.
        Hidden when config.display.legend is explicitly false.

        The legend is a gradient div whose background CSS is set inline (Lit's CSS
        templating doesn't cleanly handle dynamic linear-gradient values).
        Tick positions and labels come from legend_scale(). Labels are rotated 90
        degrees via CSS; a hidden "shadow" copy of each label provides height so
        the container sizes correctly despite the absolute-positioned ticks.

        The decimals option (config.display.decimals) fixes the number of decimal
        places on tick labels; omitting it lets the raw data value render as-is.
    */
    render_legend() {
        if (this.config.display.legend === false) {
            return;
        }
        const ticks = this.legend_scale(this.meta.scale);
        // display.decimals: integer 0+ sets fixed decimal places; undefined/non-integer = auto
        const decimals = this.config.display?.decimals;
        const fmt = (val) => Number.isInteger(decimals) ? Number(val).toFixed(decimals) : val;
        return html`
            <div class="legend-container">
                <div id="legend" style="background: linear-gradient(90deg, ${this.meta.scale.css})"></div>
                <div class="tick-container">
                    ${ticks.map((tick) => html`
                        <div class="legend-tick" style="left: ${tick[0]}%;">
                            <div class="caption">${fmt(tick[1])} ${this.meta.scale.unit}</div>
                        </div>
                        <span class="legend-shadow">${fmt(tick[1])} ${this.meta.scale.unit}</span>`
                    )}
                </div>
            </div>
        `
    }

    /*
        Renders the click-to-show tooltip overlay.

        The tooltip is always present in the DOM (display:none when inactive) to avoid
        layout thrash on each click. Content is built from this.selected_element_data,
        which is populated by toggle_tooltip() from the clicked cell's data-* attributes.

        In hourly mode: shows the date and the one-hour time window (e.g. "Mar 20 14:00 - 15:00").
        In daily mode: reconstructs the exact calendar date from the week row's nativeDate
        plus the column index (0=Mon .. 6=Sun), then formats it with the locale.

        The value is formatted to 2 decimal places. If the cell has no data (null, rendered
        as '' in the DOM) it shows the HA "No data" localised string instead.
    */
    render_tooltip() {
        var content = '';
        if (this.selected_element_data) {
            // Todo: See if we can use the precision from the entity here.
            var rendered_value;
            // selected_val is read via the data-val attribute in the DOM. The way it's set via Lit,
            // null translates into ''.
            if (this.selected_element_data.val === '') {
                rendered_value = this.myhass.localize('ui.components.data-table.no-data'); // "No data"
            } else {
                const val = +(parseFloat(this.selected_element_data.val).toFixed(2));
                rendered_value = `${val} ${this.meta.scale.unit || this.meta.unit_of_measurement}`;
            }

            if (this.config.mode === 'daily') {
                // In daily mode, compute the exact calendar date from week row + day column.
                // row.nativeDate is the Monday of that week; col is 0 (Mon) through 6 (Sun).
                const weekMonday = this.grid[this.selected_element_data.row]?.nativeDate;
                const col = parseInt(this.selected_element_data.col);
                const cellDate = new Date(weekMonday);
                cellDate.setDate(cellDate.getDate() + col);
                const date_label = cellDate.toLocaleDateString(
                    this.meta.language,
                    { weekday: 'short', month: 'short', day: '2-digit' }
                );
                content = html`<div class="meta">${date_label}</div><div class="value">${rendered_value}</div>`;
            } else {
                const date = this.grid[this.selected_element_data.row]?.date;
                // col is a slot index, which is an hour only when time_interval is 1.
                const interval = this.time_interval();
                const hr = parseInt(this.selected_element_data.col) * interval;
                var from = new Date('2022-03-20 00:00:00').setHours(hr);
                var to = new Date('2022-03-20 00:00:00').setHours(hr + interval);
                var time_format = new Intl.DateTimeFormat('sv-SE', {'hour': 'numeric', 'minute': 'numeric'});
                if (this.myhass.locale.time_format == '12') {
                    time_format = new Intl.DateTimeFormat('en-US', {'hour': 'numeric'});
                }
                content = html`<div class="meta">${date} ${time_format.format(from)} - ${time_format.format(to)}</div><div class="value">${rendered_value}</div>`;
            }
        }
        return html`
            <div id="tooltip" class="${this.tooltipOpen ? 'active' : 'hidden'}">${content}</div>
        `
    }

    /*
        Compute legend tick positions and labels for the given scale.

        Returns an array of [position_percent, label_value] pairs. For relative scales, five
        evenly-spaced ticks are generated between data.min and data.max. For absolute scales,
        each scale step becomes a tick, positioned proportionally within the step value range.

        NOTE: Tick spacing could be improved to snap to human-friendly values (integers, 0.5, etc).
    */
    legend_scale(scale) {
        /*
            Figure out how to space the markings in the legend. There's some room for improvement
            in that we could snap this to more human friendly values such as integers, .5 and
            similar.
        */
        var ticks = [];
        if (scale.type === 'relative') {
            // Figure out our own steps, this scale ranges from 0-1.
            var diff = this.meta.data.max - this.meta.data.min;
            for (var i = 0; i <= 5; i++) {
                ticks.push(
                    [
                        i * 20,
                        +(Number(this.meta.data.min + (diff / 5) * i).toFixed(2))
                    ]
                )}
        } else {
            // This scale has steps defined in the scale. Use them.
            var min = scale.steps[0].value;
            var max = scale.steps[scale.steps.length - 1].value;
            var span = max - min;
            for (const entry of scale.steps) {
                ticks.push([
                    ((entry.value - min) / span) * 100,
                    entry.value
                ])
            }
        }
        return ticks;
    }

    /*
        Click handler for heatmap cells. Toggles the tooltip on/off.

        Clicking an already-selected cell closes the tooltip. Clicking a different cell
        moves the selection. The selected cell is identified by id="selected" in the DOM
        so that CSS can outline it. Clicking away from the grid or pressing Escape also
        dismisses it; see connectedCallback() and close_tooltip().

        Tooltip position is computed relative to the card element so it stays within the
        card bounds regardless of where the card sits on the page. The tooltip is offset
        upward and to the left of the cell; this is approximate and does not yet account
        for proximity to card edges.

        this.selected_element_data is set to the clicked cell's dataset (data-val,
        data-row, data-col) which render_tooltip() reads to build the label.
    */
    toggle_tooltip(e) {
        const oldSelection = this.renderRoot.querySelector("#selected");
        const card = this.renderRoot.querySelector("#card");
        const tooltip = this.renderRoot.querySelector("#tooltip");
        const target = e.target;
        if (oldSelection) {
            oldSelection.removeAttribute('id');
            if (oldSelection === e.target) {
                this.close_tooltip();
                return;
            }
        }
        this.tooltipOpen = true;
        target.id = 'selected';
        /*
            Todo:
              - Improved handling when we're close to the page edges.
              - Fewer assumptions about the size of the tooltip.
        */
        var rect = target.getBoundingClientRect();
        var cardRect = card.getBoundingClientRect();
        var top = rect.top - cardRect.top;
        var left = rect.left - cardRect.left;
        tooltip.style.top = (top - 50 - rect.height).toString() + "px";
        tooltip.style.left = (left - (rect.width / 2) - 70) .toString() + "px";
        this.selected_element_data = target.dataset;
    }

    /*
        Hides the tooltip and clears the cell selection.

        Called when the selected cell is clicked again, when the user clicks anywhere
        that is not a heatmap cell, or when Escape is pressed. Safe to call when no
        tooltip is currently open.
    */
    close_tooltip() {
        const oldSelection = this.renderRoot?.querySelector("#selected");
        if (oldSelection) { oldSelection.removeAttribute('id'); }
        this.selected_element_data = '';
        this.tooltipOpen = false;
    }

    /*
        Registers the dismissal listeners for the tooltip.

        These have to live on the document rather than on the card: a click on the
        dashboard outside this card never reaches the card's own listeners, and without
        that the tooltip can only be closed by hitting the selected cell again - which is
        hard to do because the selection outline overhangs the neighbouring cells.

        The click listener runs in the capture phase so it sees the event before the
        per-cell handler. Clicks whose composed path includes a heatmap cell are left
        alone so that toggle_tooltip() can move or close the selection itself; anything
        else (including the tooltip body) dismisses.
    */
    connectedCallback() {
        super.connectedCallback();
        this._dismiss_on_click = (event) => {
            if (!this.tooltipOpen) { return; }
            // composedPath() is needed to see through the shadow root boundary.
            const clicked_a_cell = event.composedPath().some(
                (node) => node.classList && node.classList.contains('hm-box')
            );
            if (clicked_a_cell) { return; }
            this.close_tooltip();
        };
        this._dismiss_on_escape = (event) => {
            if (this.tooltipOpen && event.key === 'Escape') { this.close_tooltip(); }
        };
        document.addEventListener('click', this._dismiss_on_click, true);
        document.addEventListener('keydown', this._dismiss_on_escape);
    }

    /*
        Starts measuring the grid once it is in the DOM.

        Axis label density depends on how much room each label actually gets, which is not
        knowable until after layout, so it is measured rather than assumed. Watching the
        element (instead of reading it once) is what makes the labels re-thin when the
        dashboard column is resized or the card is moved between sections.

        ResizeObserver is guarded because the card is also loaded in a bare VM by the unit
        tests, where the constructor does not exist.
    */
    firstUpdated() {
        if (typeof ResizeObserver === 'undefined') { return; }
        const grid = this.renderRoot?.querySelector('#grid');
        if (!grid) { return; }
        this._grid_observer = new ResizeObserver((entries) => {
            const box = entries[0]?.contentRect;
            if (!box) { return; }
            // Only react to whole-pixel changes. Writing these properties re-renders, and
            // a re-render can nudge the box by a fraction, which would otherwise loop.
            if (Math.abs(box.width - this.grid_width) < 1 &&
                Math.abs(box.height - this.grid_height) < 1) { return; }
            this.grid_width = box.width;
            this.grid_height = box.height;
        });
        this._grid_observer.observe(grid);
    }

    /*
        Tears down the document-level dismissal listeners added in connectedCallback()
        and stops the grid ResizeObserver. Required because HA moves cards in and out of
        the DOM as dashboards are edited or views are switched.
    */
    disconnectedCallback() {
        document.removeEventListener('click', this._dismiss_on_click, true);
        document.removeEventListener('keydown', this._dismiss_on_escape);
        this._grid_observer?.disconnect();
        this._grid_observer = undefined;
        super.disconnectedCallback();
    }

    /*
        Whenever the state changes, a new `hass` object is set. We fetch some metadata
        the first time over but generally don't want to update frequently.
    */
    /*
        Called by Home Assistant whenever the hass object changes (frequently).
        Throttles data fetches to at most once per 10 minutes to avoid hammering
        the statistics API. On each fetch, rebuilds meta from the current hass state
        then dispatches to either get_recorder() (hourly) or get_recorder_daily() (daily).
    */
    set hass(hass) {
        if (Date.now() - this.last_render_ts < REFRESH_INTERVAL_MS) {
            return;
        }
        /*
            While the user is browsing history the view is pinned to a fixed window in
            the past, which cannot have changed. Refetching would be wasted work, and a
            periodic refresh landing mid-browse would be disorienting.
        */
        if (this.view_offset !== 0) {
            return;
        }
        this.myhass = hass;
        this.fetch_history();
    }

    /*
        Fetch the statistics for the currently visible window and rebuild the grid.

        Split out of set hass() so navigation can trigger a fetch directly: paging
        through history has to bypass the periodic-refresh throttle, since the user is
        waiting on the result of a click rather than a background tick.
    */
    fetch_history() {
        this.meta = this.populate_meta(this.myhass);
        var consumers = [this.config.entity];
        // When a secondary entity is configured, fetch both in the same statistics
        // request; get_recorder() combines them per hour before rendering.
        if (this.config.secondary_entity) {
            // Both entities are processed with the primary's state_class, so an
            // incompatible pairing would silently render garbage. Show an error
            // and skip the fetch instead.
            const conflict = this.secondary_state_class_conflict();
            if (conflict) {
                this.grid = [];
                this.grid_status = conflict;
                this.last_render_ts = Date.now();
                return;
            }
            consumers.push(this.config.secondary_entity);
        }
        if (this.config.mode === 'daily') {
            this.get_recorder_daily(consumers, this.config.weeks);
        } else {
            this.get_recorder(consumers, this.config.days);
        }

        this.last_render_ts = Date.now();
    }

    /*
        How many days one page of history covers - the step taken by the back and
        forward controls. Daily mode pages by whole weeks so rows stay Monday-aligned.
    */
    page_size_days() {
        return (this.config.mode === 'daily')
            ? (this.config.weeks * DAYS_PER_WEEK)
            : this.config.days;
    }

    /*
        The instant the visible window ends at.

        At offset 0 this is simply now, so the newest bucket is the current partial
        hour, exactly as before this feature existed. When browsing history it is the
        end of the target day, so that whole days are shown rather than a window that
        cuts off at the current time of day.
    */
    view_end() {
        const end = new Date();
        if (this.view_offset === 0) { return end; }
        end.setDate(end.getDate() + this.view_offset);
        end.setHours(23, 59, 59, 999);
        return end;
    }

    /*
        Move the visible window by whole pages. 'back' goes further into the past,
        'forward' returns towards the present (never past it), 'current' jumps home.
    */
    navigate(direction) {
        const step = this.page_size_days();
        if (direction === 'back') {
            this.view_offset -= step;
        } else if (direction === 'forward') {
            // Never scroll into the future; offset 0 is the present.
            this.view_offset = Math.min(0, this.view_offset + step);
        } else {
            this.view_offset = 0;
        }
        /*
            The open tooltip describes a cell in the window we are leaving. Its label is
            resolved from this.grid at render time, so leaving it open would silently
            relabel it with data from the new window.
        */
        this.close_tooltip();
        this.fetch_history();
    }

    /*
        Unit overrides sent with every statistics request. Energy is always
        normalised to kWh; temperature follows the frontend's configured unit
        system so scales convert correctly. See get_recorder() for why pressure
        is deliberately omitted.
    */
    statistics_units() {
        return {
            'energy': 'kWh',
            'temperature': this.myhass.config.unit_system.temperature
        };
    }

    /*
        Fill in any auto (unset or 'auto') data.min/data.max bound from the current
        grid's extent. Explicit numeric bounds set in config are left untouched.
    */
    apply_auto_range() {
        if (is_auto(this.config.data.max)) { this.meta.data.max = this.max_from(this.grid); }
        if (is_auto(this.config.data.min)) { this.meta.data.min = this.min_from(this.grid); }
    }

    /*
        Pull data from Recorder/LTS.

        Notable gotcha: We do have a `pressure` unit defined in the unit_system
        structure; it'll default to Pa or Psi respectively for metric/us.

        However, pretty much every integration that deals with atmospheric
        pressure will present as device_class `pressure` instead. Thus, if we
        use the unit_system value, we'll end up with a scale that'll be bogus
        for atmo pressure use cases.

        Ideally integrations would use class atmospheric_pressure instead, but
        I'm guessing we're looking at an imperfect world for a good long while
        yet. On top of that, atmospheric pressure doesn't make a ton of sense
        for heatmaps of hourly data.

        tl;dr - even though we _do_ have a unit_system value for pressure, we
        shouldn't send it. It'll bring more pain than benefit.
    */
    get_recorder(consumers, days) {
        // The window ends at `now` unless the user has paged back into history.
        const end = this.view_end();
        this.grid_status = undefined;
        var startTime = new Date(end.getTime() - (days * 86400000))
        startTime.setHours(23, 0, 0);
        this.myhass.callWS({
            'type': 'recorder/statistics_during_period',
            'statistic_ids': consumers,
            "period":"hour",
            "units": {
                ...this.statistics_units()
            },
            "start_time": startTime.toISOString(),
            "end_time": end.toISOString(),
            "types":["sum", "mean"]
        }).then(recorderResponse => {
            // Build one grid per requested entity, then combine them. For the common
            // single-entity case there is exactly one grid and no combination happens.
            const grids = [];
            for (const consumer of consumers) {
                const consumerData = recorderResponse[consumer];
                if (consumerData === undefined) {
                    // The primary entity has no data at all: nothing to show. A missing
                    // secondary entity is tolerated (it simply contributes nothing).
                    if (consumer === this.config.entity) {
                        this.grid = [];
                        this.grid_status = this.myhass.localize('ui.components.data-table.no-data');
                        return;
                    }
                    grids.push([]);
                    continue;
                }
                switch (this.meta.state_class) {
                    case 'measurement':
                        grids.push(this.calculate_measurement_values(consumerData));
                        break;
                    case 'total':
                    case 'total_increasing':
                        grids.push(this.calculate_increasing_values(consumerData));
                        break;
                    default:
                        throw new Error(`Unknown state_class defined (${this.meta['state_class']} for ${consumer}.`);
                }
            }

            // Only combine when the secondary actually returned data. If the secondary
            // has no statistics at all, a measurement pairing would blank every cell
            // (combine_cell yields null when either side is missing), hiding the primary
            // entirely. Fall back to the primary grid so the card still renders, matching
            // the energy path where a missing secondary already counts as 0.
            const has_secondary_data = grids.length > 1 && grids[1].length > 0;
            this.grid = has_secondary_data
                ? this.combine_grids(grids[0], grids[1], this.config.operation)
                : grids[0];

            // Bucket before computing the range: aggregating hours changes the extremes
            // the scale has to cover, so an auto range taken beforehand would be wrong.
            this.grid = this.bucket_grid(this.grid);

            this.apply_auto_range();
            // Diverging (signed) results read best when zero sits at the centre of the
            // scale. When differencing with auto range, widen to a symmetric [-M, M].
            this.apply_symmetric_range();
        }).catch(error => this.report_fetch_error(error));
    }

    /*
        Surface a failed statistics fetch to the user instead of leaving the card
        blank or stale. callWS() rejects on transport/HA errors, and the .then()
        handlers can themselves throw (e.g. the unknown-state_class Error above).
        Without a .catch() both cases become unhandled promise rejections that are
        silently swallowed, so the card never updates and the user gets no feedback.
    */
    report_fetch_error(error) {
        console.error('heatmap-card: failed to load statistics', error);
        this.grid = [];
        this.grid_status = `Error loading data: ${(error && error.message) ? error.message : error}`;
    }

    /*
        Canonical per-day key (YYYY-MM-DD in local time) used to align rows of two
        grids that may cover different date ranges. Uses local date parts rather than
        toISOString() so the key matches the locale calendar day the row represents.
    */
    day_key(date) {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    }

    /*
        Combine one grid cell (primary vs secondary) for combine_grids().

        operation: 'difference' (primary - secondary) or 'sum' (primary + secondary).

        Null policy differs by state_class:
          - measurement (e.g. temperature): a null on either side yields null, since a
            reading cannot be meaningfully combined with an absent one.
          - increasing/total (e.g. energy): missing cells are treated as 0, matching
            calculate_increasing_values() which already fills gaps with 0.
    */
    combine_cell(primaryVal, secondaryVal, operation, isMeasurement) {
        if (isMeasurement) {
            if (primaryVal === null || primaryVal === undefined ||
                secondaryVal === null || secondaryVal === undefined) {
                return null;
            }
        }
        const primary = (primaryVal === null || primaryVal === undefined) ? 0 : primaryVal;
        const secondary = (secondaryVal === null || secondaryVal === undefined) ? 0 : secondaryVal;
        const result = (operation === 'sum') ? (primary + secondary) : (primary - secondary);
        // Round to match calculate_increasing_values()'s 2-decimal precision and avoid
        // floating point noise (e.g. 0.1 - 0.3) showing up in the tooltip.
        return parseFloat(result.toFixed(2));
    }

    /*
        Combine two per-entity grids cell-by-cell, aligned on calendar day + hour
        rather than array index (the two entities may cover different date ranges).

        The primary grid defines the visible date range; secondary rows are matched by
        day_key(). Days present only in the secondary entity are dropped, which is the
        desired behaviour for net energy where the primary (e.g. import) is the base.

        Returns rows in the same reverse-chronological {date, nativeDate, vals} shape
        that render() expects.
    */
    combine_grids(primary, secondary, operation) {
        const secondaryByDay = new Map();
        for (const row of secondary) {
            secondaryByDay.set(this.day_key(row.nativeDate), row.vals);
        }
        const isMeasurement = this.meta.state_class === 'measurement';
        const out = [];
        for (const row of primary) {
            const otherVals = secondaryByDay.get(this.day_key(row.nativeDate)) ?? [];
            const vals = row.vals.map((primaryVal, hour) =>
                this.combine_cell(primaryVal, otherVals[hour], operation, isMeasurement)
            );
            out.push({ 'date': row.date, 'nativeDate': row.nativeDate, 'vals': vals });
        }
        return out;
    }

    /*
        Returns an error message when the configured secondary entity's state_class is
        incompatible with the primary's, or null when there is no conflict.

        Both entities are processed with the primary entity's state_class: measurement
        entities read the 'mean' statistic while total/total_increasing read 'sum'. A
        measurement statistic has no meaningful 'sum' (and vice versa), so mixing the
        two families would silently render zeros or NaN. 'total' and 'total_increasing'
        are processed identically, so only the measurement-vs-total split matters.

        Unknown state_classes are tolerated: the secondary may not be loaded yet, or may
        be an external statistic with no state object to inspect.
    */
    secondary_state_class_conflict() {
        if (!this.config.secondary_entity) { return null; }
        const primary_class = this.meta.state_class;
        const secondary_class = this.myhass.states[this.config.secondary_entity]?.attributes?.state_class;
        if (!state_classes_incompatible(primary_class, secondary_class)) { return null; }
        return `Cannot combine entities: '${this.config.entity}' has state_class ` +
            `'${primary_class}' but '${this.config.secondary_entity}' has ` +
            `'${secondary_class}'. Both must be measurement, or both total/total_increasing.`;
    }

    /*
        For a signed difference with auto range, widen the range symmetrically around
        zero so a diverging scale renders zero at its midpoint. Only applies when
        differencing two entities and the user has not pinned an explicit min or max.
    */
    apply_symmetric_range() {
        if (!this.config.secondary_entity || this.config.operation !== 'difference') {
            return;
        }
        const minAuto = is_auto(this.config.data.min);
        const maxAuto = is_auto(this.config.data.max);
        if (!minAuto || !maxAuto) {
            return;
        }
        const magnitude = Math.max(Math.abs(this.meta.data.min), Math.abs(this.meta.data.max));
        this.meta.data.min = -magnitude;
        this.meta.data.max = magnitude;
    }

    /*
        Fetch daily statistics for the daily heatmap mode. Only measurement entities
        are supported (total_increasing is not meaningful at day granularity here).

        For the mean/min/max aggregates we request `period: day`, which returns one
        pre-aggregated entry per day. For the 'last' aggregate there is no daily "last
        reading" stored in statistics (measurement sensors only keep mean/min/max), so
        we request `period: hour` instead and reduce each day to its final hour's mean
        in calculate_daily_last_values().
    */
    get_recorder_daily(consumers, weeks) {
        // The window ends at `now` unless the user has paged back into history.
        const end = this.view_end();
        this.grid_status = undefined;

        // The 'last' aggregate needs hourly granularity so we can pick the final hour
        // of each day; the other aggregates come straight from daily statistics.
        const use_last = (this.config.aggregate === 'last');

        // Wind back to the most recent Monday, then go back (weeks * 7) more days.
        // This ensures the grid starts cleanly on a Monday.
        // Days since last Monday (Sunday counts as 6 days back)
        const days_since_monday = days_from_monday(end);
        var startTime = new Date(end);
        startTime.setDate(startTime.getDate() - days_since_monday - (weeks * DAYS_PER_WEEK));
        startTime.setHours(0, 0, 0, 0);

        this.myhass.callWS({
            'type': 'recorder/statistics_during_period',
            'statistic_ids': consumers,
            'period': use_last ? 'hour' : 'day',
            'units': {
                ...this.statistics_units()
            },
            'start_time': startTime.toISOString(),
            'end_time': end.toISOString(),
            'types': use_last ? ['mean'] : ['mean', 'min', 'max']
        }).then(recorderResponse => {
            for (const consumer of consumers) {
                const consumerData = recorderResponse[consumer];
                if (consumerData === undefined) {
                    this.grid = [];
                    this.grid_status = this.myhass.localize('ui.components.data-table.no-data');
                    continue;
                }
                this.grid = use_last
                    ? this.calculate_daily_last_values(consumerData)
                    : this.calculate_daily_values(consumerData);
            }
            this.apply_auto_range();
        }).catch(error => this.report_fetch_error(error));
    }

    /*
        Build the daily grid from Statistics API `period: day` data (mean/min/max
        aggregates). Each daily entry already holds one value per day; we pull the
        configured aggregate from each entry and defer week grouping to
        build_weekly_grid(). The 'last' aggregate uses calculate_daily_last_values()
        instead. Returns rows in reverse-chronological order (most recent week first).
    */
    calculate_daily_values(consumerData) {
        const aggregate = this.config.aggregate; // 'mean', 'min', or 'max'
        // Each daily statistics entry already holds one value per day; pull the
        // configured aggregate out and hand the per-day list to the grid builder.
        const dailyEntries = consumerData.map(entry => ({
            'start': entry.start,
            'value': entry[aggregate] ?? null
        }));
        return this.build_weekly_grid(dailyEntries);
    }

    /*
        Build the daily grid for the 'last' aggregate from hourly statistics.

        Measurement sensors do not store a daily "last reading", so we request
        `period: hour` and reduce each calendar day to the mean of its final hour
        that recorded data. Statistics arrive in chronological order, so a later
        entry for the same day simply overwrites an earlier one, leaving the last
        hour's value. Hours with a null mean are skipped so an empty final hour does
        not blank out the whole day.

        Days are keyed by local midnight (matching how build_weekly_grid buckets
        entries into weeks) and the resulting per-day list is handed to the same
        grid builder used by the mean/min/max path.
    */
    calculate_daily_last_values(consumerData) {
        // Map of local-day ISO key -> { start, value }. A Map preserves insertion
        // order, so once populated in chronological order its values are already
        // sorted for build_weekly_grid.
        const dayValues = new Map();

        // The last-hour-wins reduction relies on ascending order. The statistics API
        // already returns rows chronologically, but sort a copy defensively so a
        // future API change cannot silently invert which hour "wins" for a day.
        const ordered = [...consumerData].sort(
            (a, b) => new Date(a.start) - new Date(b.start)
        );

        for (const entry of ordered) {
            // Skip hours with no recorded mean; they carry no "last reading".
            if (entry.mean === null || entry.mean === undefined) {
                continue;
            }
            const dayStart = new Date(entry.start);
            dayStart.setHours(0, 0, 0, 0);
            const dayKey = dayStart.toISOString();
            // Later hour of the same day overwrites earlier ones -> last hour wins.
            dayValues.set(dayKey, { 'start': dayStart, 'value': entry.mean });
        }

        return this.build_weekly_grid(Array.from(dayValues.values()));
    }

    /*
        Arrange a chronological list of per-day values into the weekly grid.

        Each row represents one week (Mon-Sun) with 7 slots (index 0 = Monday,
        6 = Sunday). `dailyEntries` is an array of { start, value } where `start`
        is any Date-parsable timestamp within the day and `value` is that day's
        already-computed value (or null). Entries must be in ascending date order.

        Returns rows in reverse-chronological order (most recent week first), matching
        the hourly mode layout.
    */
    build_weekly_grid(dailyEntries) {
        // DAYS_PER_WEEK: number of columns in the daily grid
        const DAYS_PER_WEEK = 7;
        var grid = [];
        var weekSlots = null;
        var currentWeekMonday = null;

        for (const entry of dailyEntries) {
            const entryDate = new Date(entry.start);

            // Determine the Monday of the week this entry belongs to.
            const daysFromMonday = days_from_monday(entryDate);
            const monday = new Date(entryDate);
            monday.setDate(monday.getDate() - daysFromMonday);
            monday.setHours(0, 0, 0, 0);
            const mondayKey = monday.toISOString();

            // When we cross into a new week, start a new row.
            if (mondayKey !== currentWeekMonday) {
                weekSlots = Array(DAYS_PER_WEEK).fill(null);
                const weekLabel = format_month_day(monday, this.meta.language);
                grid.push({ 'date': weekLabel, 'nativeDate': monday, 'vals': weekSlots });
                currentWeekMonday = mondayKey;
            }

            // Slot index 0 = Monday, 6 = Sunday
            const slotIndex = daysFromMonday;
            weekSlots[slotIndex] = entry.value ?? null;
        }

        return grid.reverse();
    }

    /*
        Return the maximum non-null value across all rows and slots in the grid.
        Nulls are excluded because Math.max() coerces null to 0, which skews the result.
    */
    max_from(grid) {
        return Math.max(...grid_values(grid));
    }

    /*
        Return the minimum non-null value across all rows and slots in the grid.
        Nulls are excluded because Math.min() coerces null to 0, which skews the result.
    */
    min_from(grid) {
        return Math.min(...grid_values(grid));
    }

    /*
        Build hourly grid rows from Statistics API `period: hour` data for measurement entities.
        Each row represents one calendar date; each of the 24 slots holds the mean for that hour.
        The last row is truncated to the last received hour (strips future hours for today).
        Rows are returned in reverse-chronological order (most recent date first).
    */
    calculate_measurement_values(consumerData) {
        var grid = [];
        var gridTemp = null;
        var prevDate = null;
        var hour = 0;
        for (const entry of consumerData) {
            const start = new Date(entry.start);
            hour = start.getHours();
            const dateRep = format_month_day(start, this.meta.language);

            if (dateRep !== prevDate) {
                // New calendar date: start a fresh row and push it immediately.
                // Previously this checked prevDate !== null, which silently dropped the first date's data.
                gridTemp = Array(24).fill(null);
                grid.push({'date': dateRep, 'nativeDate': start, 'vals': gridTemp});
                prevDate = dateRep;
            }
            gridTemp[hour] = entry.mean;
        }
        /*
            For the last date in the series, remove any entries that we didn't get from
            Home Assistant. This would typically be hours set in the future.
        */
        if (gridTemp) { gridTemp.splice(hour + 1); }
        return grid.reverse();
    }

    /*
        Build hourly grid rows from Statistics API `period: hour` data for total_increasing entities
        (e.g. energy usage, PV generation). Each slot holds the delta (sum[n] - sum[n-1]) for that hour.

        Notable difference vs. calculate_measurement_values(): missing slots are filled with 0 rather
        than null. Gaps are common with PV inverters during off-hours, and showing 0 is more accurate
        than showing a gap. The first hour of the first day is always 0 since there is no prior sum to
        diff against.

        Rows are returned in reverse-chronological order (most recent date first).
    */
    calculate_increasing_values(consumerData) {
        var grid = [];
        var prev_sum = null;
        var gridTemp = null;
        var prevDate = null;
        var hour = 0;
        for (const entry of consumerData) {
            const start = new Date(entry.start);
            hour = start.getHours();
            const dateRep = format_month_day(start, this.meta.language);

            if (dateRep !== prevDate) {
                // New calendar date: start a fresh row and push it immediately.
                // Previously this checked prev !== null, which silently dropped the first date's data.
                gridTemp = Array(24).fill(0);
                grid.push({'date': dateRep, 'nativeDate': start, 'vals': gridTemp});
                prevDate = dateRep;
            }
            if (prev_sum !== null) {
                // Compute hourly delta from the running total. First entry has no prior sum, stays 0.
                gridTemp[hour] = parseFloat((entry.sum - prev_sum).toFixed(2));
            }
            prev_sum = entry.sum;
        }
        /*
            For the last date in the series, remove any entries that we didn't get from
            Home Assistant. This would typically be hours set in the future.
        */
        if (gridTemp) { gridTemp.splice(hour + 1); }
        return grid.reverse();
    }

    /*
        Builds the meta object from the current hass state and card config.
        Called on every data refresh (from set hass()) before fetching recorder data.

        meta holds:
          - unit_of_measurement, state_class, device_class: from the entity attributes
            (device_class can be overridden via config.device_class)
          - language: resolved from hass for locale-aware date formatting
          - scale: the fully rendered scale object (gradient + css + steps + unit)
          - title: from config, or null to suppress the header, or friendly_name as fallback
          - data.min/max: from config (may be a number or 'auto'/undefined; auto values
            are overwritten after the recorder response arrives)
    */
    populate_meta(hass) {
        const consumerAttributes = hass.states[this.config.entity].attributes;
        const device_class = (consumerAttributes.device_class ?? this.config.device_class);
        var meta = {
            'unit_of_measurement': consumerAttributes.unit_of_measurement,
            'state_class': consumerAttributes.state_class,
            'device_class': device_class,
            'language': hass.selectedLanguage ?? hass.language ?? 'en',
            'scale': this.scales.get_scale(
                (this.config.scale ?? this.scales.defaults_for(device_class)),
                device_class,
                this.myhass.config.unit_system
            ),
            'title': (this.config.title ?? (this.config.title === null ? undefined : consumerAttributes.friendly_name)),
            'data': {
                'max': this.config.data.max,
                'min': this.config.data.min
            },
        };
        return meta;
    }

    /*
        The user supplied configuration. Throw an exception and Home Assistant
        will render an error card. No access to the hass object at this point
        sadly; it'd simplify things a bit. Some of the config error checking
        code can be found in render() instead.
    */
    setConfig(config) {
        if (config === null || typeof(config) !== 'object' || Array.isArray(config)) {
            throw new Error("Card configuration must be an object");
        }
        if (typeof(config.entity) !== 'string' || config.entity.length === 0) {
            throw new Error("You need to define an entity");
        }
        if (config.secondary_entity !== undefined &&
            (typeof(config.secondary_entity) !== 'string' ||
            config.secondary_entity.length === 0)) {
            throw new Error("`secondary_entity` must be a non-empty entity ID");
        }
        if (config.days !== undefined &&
            (!Number.isInteger(config.days) || config.days < 1 || config.days > MAX_DAYS)) {
            throw new Error(`\`days\` must be an integer between 1 and ${MAX_DAYS}`);
        }
        if (config.weeks !== undefined &&
            (!Number.isInteger(config.weeks) || config.weeks < 1 || config.weeks > MAX_WEEKS)) {
            throw new Error(`\`weeks\` must be an integer between 1 and ${MAX_WEEKS}`);
        }
        if (config.mode && !['hourly', 'daily'].includes(config.mode)) {
            throw new Error("`mode` must be 'hourly' or 'daily'");
        }
        if (config.orientation &&
            !['vertical', 'horizontal'].includes(config.orientation)) {
            throw new Error("`orientation` must be 'vertical' or 'horizontal'");
        }
        /*
            ha-selector's select control round-trips option values as strings, so the
            editor sends "2" where YAML sends 2. Normalise before validating, and store
            the number, so both paths produce the same config.
        */
        if (typeof(config.time_interval) === 'string' && config.time_interval.trim() !== '') {
            const parsed = Number(config.time_interval);
            if (Number.isInteger(parsed)) { config = {...config, time_interval: parsed}; }
        }
        if (config.time_interval !== undefined &&
            !TIME_INTERVALS.includes(config.time_interval)) {
            throw new Error(
                `\`time_interval\` must be one of ${TIME_INTERVALS.join(', ')}`
            );
        }
        // Daily mode's axis is Monday-Sunday; there are no hours to group.
        if (config.time_interval !== undefined && config.time_interval !== 1 &&
            (config.mode ?? 'hourly') === 'daily') {
            throw new Error("`time_interval` is only supported in hourly mode");
        }
        if (config.aggregate && !['mean', 'min', 'max', 'last'].includes(config.aggregate)) {
            throw new Error("`aggregate` must be 'mean', 'min', 'max', or 'last'");
        }
        if (config.operation && !['difference', 'sum'].includes(config.operation)) {
            throw new Error("`operation` must be 'difference' or 'sum'");
        }
        // Multi-entity combination relies on hourly sum/delta alignment. Daily mode
        // aggregates by mean/min/max, which are not meaningful to subtract, so reject it.
        if (config.secondary_entity && (config.mode ?? 'hourly') === 'daily') {
            throw new Error("`secondary_entity` is only supported in hourly mode");
        }
        if (config.data !== undefined &&
            (config.data === null || typeof(config.data) !== 'object' || Array.isArray(config.data))) {
            throw new Error("`data` must be an object");
        }
        if (config.display !== undefined &&
            (config.display === null ||
            typeof(config.display) !== 'object' ||
            Array.isArray(config.display))) {
            throw new Error("`display` must be an object");
        }
        if (config.display?.legend !== undefined &&
            typeof(config.display.legend) !== 'boolean') {
            throw new Error("`display.legend` must be a boolean");
        }
        if (config.display?.labels !== undefined &&
            typeof(config.display.labels) !== 'boolean') {
            throw new Error("`display.labels` must be a boolean");
        }
        if (config.display?.hide_zero !== undefined &&
            typeof(config.display.hide_zero) !== 'boolean') {
            throw new Error("`display.hide_zero` must be a boolean");
        }
        if (config.display?.decimals !== undefined &&
            (!Number.isInteger(config.display.decimals) ||
            config.display.decimals < 0 ||
            config.display.decimals > MAX_DECIMAL_PLACES)) {
            throw new Error(
                `\`display.decimals\` must be an integer between 0 and ${MAX_DECIMAL_PLACES}`
            );
        }
        if (config.display?.time_labels !== undefined &&
            (!Number.isInteger(config.display.time_labels) ||
            config.display.time_labels < 1 ||
            config.display.time_labels > MAX_TIME_LABEL_STRIDE)) {
            throw new Error(
                `\`display.time_labels\` must be an integer between 1 and ${MAX_TIME_LABEL_STRIDE}`
            );
        }
        if (config.display?.navigation !== undefined &&
            typeof(config.display.navigation) !== 'boolean') {
            throw new Error("`display.navigation` must be a boolean");
        }
        if (config.display?.height !== undefined &&
            (!Number.isFinite(config.display.height) || config.display.height <= 0)) {
            throw new Error("`display.height` must be a positive number of pixels");
        }
        if (config.scale !== undefined) {
            this.scales.get_scale(config.scale);
        }
        this.config = {
            'title': config.title,
            'mode': (config.mode ?? 'hourly'),
            // Layout of the grid: 'vertical' keeps dates down the side (the original and
            // still the default), 'horizontal' transposes to a Grafana-style carpet plot.
            'orientation': (config.orientation ?? 'vertical'),
            // Hours per cell along the time axis; 1 keeps the original hourly grid.
            'time_interval': (config.time_interval ?? 1),
            'days': (config.days ?? 21),
            'weeks': (config.weeks ?? 12),
            'aggregate': (config.aggregate ?? 'mean'),
            'entity': config.entity,
            // Optional second entity; when set the card renders the per-hour
            // combination (difference or sum) of the two entities' values.
            'secondary_entity': config.secondary_entity,
            'operation': (config.operation ?? 'difference'),
            'scale': config.scale,
            'data': (config.data ?? {}),
            'display': (config.display ?? {})
        };
        if (this.config.data.max !== undefined &&
            (this.config.data.max !== 'auto' &&
            !Number.isFinite(this.config.data.max))
        ) {
            throw new Error("`data.max` must be either `auto` or a finite number");
        }
        if (this.config.data.min !== undefined &&
            (this.config.data.min !== 'auto' &&
            !Number.isFinite(this.config.data.min))
        ) {
            throw new Error("`data.min` must be either `auto` or a finite number");
        }

        this.last_render_ts = 0;
        /*
            Reset paging on every config change. The page size is derived from
            days/weeks, so keeping an offset measured in the old page size would land
            the user on an arbitrary window after an edit.
        */
        this.view_offset = 0;
    }
  
    // The height of your card. Home Assistant uses this to automatically
    // distribute all cards over the available columns.
    /*
        Estimated rendered height of the whole card in pixels.

        Used for sizing hints only. The number of data rows is taken from the config
        rather than the fetched grid, so a sensible size is reported before any data has
        arrived - Home Assistant asks for sizing as soon as the card is created.
    */
    estimated_height_px() {
        const daily = (this.config.mode === 'daily');
        const data_rows = (this.config.orientation === 'horizontal')
            ? (daily ? DAYS_PER_WEEK : (24 / (this.config.time_interval ?? 1)))
            : (daily ? this.config.weeks : this.config.days);
        const grid_px = this.config.display?.height
            ?? (Math.max(1, data_rows) * APPROX_NATURAL_ROW_PX);

        var total = grid_px + COLUMN_HEADER_PX + CARD_TITLE_PX;
        if (this.config.display?.navigation !== false) { total += NAV_ROW_PX; }
        if (this.config.display?.legend !== false) { total += LEGEND_PX; }
        return total;
    }

    /*
        Sizing for the sections view. Without this method Home Assistant reports that the
        card "does not fully support resizing yet".

        Horizontal layout is meant for full-width sections and needs the width to spread
        its columns over, so it asks for more of the section by default and refuses to be
        squeezed as narrow as the vertical layout will tolerate. Neither sets a maximum:
        the point of the sections view is that the user gets to decide.
    */
    getGridOptions() {
        const rows = Math.max(
            1,
            Math.ceil((this.estimated_height_px() + GRID_GAP_PX) / (GRID_ROW_HEIGHT_PX + GRID_GAP_PX))
        );
        const horizontal = (this.config.orientation === 'horizontal');
        return {
            rows: rows,
            columns: SECTION_COLUMNS,
            min_rows: 2,
            // A heatmap squeezed into a few columns is unreadable; horizontal needs more
            // width still, since the whole range runs along that axis.
            min_columns: horizontal ? 6 : 3
        };
    }

    getCardSize() {
        /*
            Horizontal layout puts the range along the x axis, so the card's height is
            driven by the number of time slots (24 hours or 7 weekdays), not by how many
            days or weeks were requested. It is therefore near-constant.
        */
        if (this.config.orientation === 'horizontal') {
            const slots = (this.config.mode === 'daily') ? 7 : 24;
            const height = this.config.display?.height ?? (slots * APPROX_NATURAL_ROW_PX);
            return (1 + Math.ceil(height / HA_CARD_SIZE_UNIT_PX));
        }
        if (this.config.mode === 'daily') {
            return (1 + Math.ceil(this.config.weeks / 3));
        }
        if (!this.config.days) {
            return 1;
        } else {
            return (1 + Math.ceil(this.config.days / 6));
        }
    }

    static styles = css`
            /* Heatmap table */
            table {
                border: none;
                border-spacing: 0px;
                table-layout:fixed;
                width: 100%;
                pointer-events: none;
                user-drag: none;
                user-select: none;
                color: var(--secondary-text-color);
            }
            th {
                position:relative;
                font-weight: normal;
                vertical-align: bottom;
            }
            th:not(.hm-row-title) {
                text-align: center;
                white-space: nowrap;
            }
            /* Used for 12hr displays; we need space for two lines */
            tr.hr12 th:not(.hm-row-title) {
                font-size: 70%;
            }
            tr {
                line-height: 1.1;
                overflow: hidden;
                font-size: 90%;
            }
            .hm-row-title {
                text-align: left;
                max-height: 20px;
                min-width: 50px;
                width: 50px;
            }
            .hm-box {
                background-color: currentcolor;
                pointer-events: auto;
                text-align: center;
                vertical-align: middle;
                overflow: hidden;
            }
            /*
                Cells with no reading behind them. Left blank rather than painted with
                the low end of the scale - see render_cell().
            */
            .hm-box.null {
                background-color: transparent;
            }
            /* Per-cell value label (display.labels). Colour is set inline for contrast. */
            .hm-label {
                font-size: 0.7em;
                font-weight: 600;
                line-height: 1.1;
                white-space: nowrap;
                pointer-events: none;
            }
            /*
                Every grid row has to be the same height, including the rows whose date
                label row_label_stride() thinned away. An empty <td> generates no line
                box at all, so those rows collapsed to a sliver next to their labelled
                neighbours. A zero-width inline-block forces a line box, which the row's
                line-height then sizes exactly as if the label were present.

                Excluded under fixed-height, where the labels are lifted out of the flow
                on purpose and --hm-cell-height alone decides the row height.
            */
            table:not(.fixed-height) td.hm-row-title::before {
                content: "";
                display: inline-block;
            }

            /*
                Horizontal (carpet-plot) layout. The transposition itself happens in
                render_rows_horizontal(); the only styling difference is that the date
                labels now run across the header, where they need room to breathe and
                must not wrap.
            */
            table.horizontal th:not(.hm-row-title) {
                font-size: 90%;
                white-space: nowrap;
                /*
                    Left-aligned because the header spans several columns and labels the
                    first of them. Deliberately not clipped: the colspan gives the label
                    the whole gap to the next one, so there is nothing to clip against.
                */
                text-align: left;
                padding-right: 4px;
            }

            /*
                Explicit-height layout, active only when display.height is set.

                Row height comes from --hm-cell-height (see grid_style()). Row titles and
                cell labels are lifted out of the flow so their text cannot force a row
                taller than the configured cell height - without this, every labelled row
                would be taller than its unlabelled neighbours once the cells get short.
            */
            table.fixed-height .hm-box {
                position: relative;
                height: var(--hm-cell-height);
            }
            table.fixed-height .hm-row-title {
                position: relative;
                height: var(--hm-cell-height);
                line-height: 1;
            }
            table.fixed-height .hm-label {
                position: absolute;
                left: 0;
                right: 0;
                top: 50%;
                transform: translateY(-50%);
            }
            /*
                Filler dots between time-axis labels: present enough to show a row exists,
                quiet enough not to compete with the labels themselves.
            */
            table.horizontal .hm-row-title {
                text-align: right;
                padding-right: 4px;
            }

            table.fixed-height .hm-row-title > span {
                position: absolute;
                left: 0;
                top: 50%;
                transform: translateY(-50%);
                white-space: nowrap;
            }
            #selected {
                outline: 6px currentcolor solid;
                z-index: 2;
                margin: 3px;
                position: relative;
                box-shadow: 0px 0px 0px 7px rgba(0,0,0,1), 0px 0px 0px 8px rgba(255,255,255,1);
            }

            /* Legend */
            .legend-container {
                margin-top: 20px;
                width: 80%;
                margin-left: auto;
                margin-right: 5%;
                position: relative;

            }
            .tick-container {
                position: relative;
            }
            #legend {
                height: 10px;
                outline-style: solid;
                outline-width: 1px;
                /*
                    Background is set via the style attribute in the object while rendering,
                    as lit-element and CSS templating is a bit of a PITA.
                */
            }

            .legend-tick {
                position: absolute;
                top: 10px;
                height: 10px;
                vertical-align: bottom;
                border-left-style: solid;
                border-left-width: 1px;
                white-space: nowrap;
                text-align: right;
                opacity: 0.7;
            }

            .legend-container .caption {
                position: relative;
                top: -15px;
                transform: translateY(100%) rotate(90deg);
                transform-origin: center left;
                font-size: 80%;
                text-align: left;
            }

            /*
                We use a non-visible shadow copy of the tick captions
                to get a height for the element. As the ticks themselves
                are position: absolute'd, we can't use their height for
                this purpose without some JS kludging.
            */
            span.legend-shadow {
                margin-top: 15px;
                position: relative;
                border-color: red;
                border-style: solid;
                writing-mode: vertical-rl;
                transform-origin: bottom left;
                font-size: 80%;
                line-height: 0.2;
                visibility: hidden;
            }

            /* History navigation */
            .nav-controls {
                display: flex;
                align-items: center;
                gap: 8px;
                margin-bottom: 8px;
                color: var(--secondary-text-color);
            }
            .nav-range {
                flex: 1;
                font-size: 90%;
                white-space: nowrap;
                overflow: hidden;
                text-overflow: ellipsis;
            }
            .nav-btn {
                background: transparent;
                color: var(--secondary-text-color);
                border: 1.5px solid var(--divider-color);
                border-radius: 8px;
                min-width: 30px;
                height: 30px;
                padding: 0 8px;
                cursor: pointer;
                font-size: 100%;
                line-height: 1;
            }
            .nav-btn:hover:not([disabled]) {
                color: var(--primary-text-color);
                border-color: var(--primary-color);
            }
            /*
                Disabled means "already at the present", which is a normal resting state
                rather than an error, so it is dimmed rather than made to look broken.
            */
            .nav-btn[disabled] {
                opacity: 0.4;
                cursor: default;
            }
            .nav-btn[hidden] {
                display: none;
            }

            /* Detail view */
            #tooltip {
                display: none;
                z-index: 1;
                position: absolute;
                padding: 6px;
                border-radius: 4px;
                background: var(--ha-card-background, var(--card-background-color, white) );
                border-color: currentcolor;
                border-width: 1px;
                border-style: solid;
                white-space: nowrap;
            }
            #tooltip.active {
                display: block;
            }
            #tooltip div.meta {
                font-size: 90%;
            }
            #tooltip div.value {
                font-size: 120%;
            }
        `;

    static getConfigElement() {
        return document.createElement("heatmap-card-editor");
      }
}

/* ------------------------------------------------------------------------- */
/* HeatmapCardEditor - visual editor component                               */
/* ------------------------------------------------------------------------- */
/*
    This editor uses the somewhat rawer HA elements rather than ha-form. This makes it
    more complex and low level than is ideal, but it seemed the lesser evil for the sake
    of making the UI a bit more automagical. Tabs seemed to be of the essence.

    * General code layout *

      - render(): Displays the actual card contents. Called infrequently. All
                  HTML templating is captured in this and related routines. We
                  also do some config checking here and render errors if we
                  detect that we're inside of the card editor; this is fugly, but
                  as we don't have access to the hass object in setConfig(), this
                  seemed like a necessary evil.

                  Calls a lot of section specific render helper functions.

      - setConfig(): As opposed to in the card view (non-editor), we don't 
                     bother with a lot of config validation.
    
    * The editor view *

    - Hide most fields until we've got `entity` picked out; without the entity,
      we have a hard time suggesting scales, hide until we can show something.

    - Unless the entity comes with a `device_class` attached to it, ask the user
      for the device class. Ideally they'd set it in the entity config in HA
      instead. May at some point change the behavior of this card to mandate
      that over accepting an override in the card config.
 
    - Based on the device class, suggest a scale. We split them into absolute
      scales for things like VOC, Carbon Dioxide and similar and relative scales
      for f.x power generation, energy usage. Additionally, the user can supply
      a custom scale of either kind. These three options (abs, rel, custom) go
      into corresponding tabs.

    - The relative tab has inputs for max/min values in the input data; will
      either be supplied by the user or inferred from the data.
    
    - There's a `Card elements` section for showing/hiding/customizing card
      elements beyond the heatmap itself. Largely unused for now.


*/

function safe_http_url(value) {
    try {
        const url = new URL(value);
        return ['http:', 'https:'].includes(url.protocol) ? url.href : undefined;
    } catch {
        return undefined;
    }
}

function render_documentation_node(node) {
    if (node.nodeType === 3) {
        return node.textContent;
    }
    if (node.nodeType !== 1) {
        return '';
    }

    const children = Array.from(node.childNodes, render_documentation_node);
    switch (node.tagName.toLowerCase()) {
        case 'p':
            return html`<p>${children}</p>`;
        case 'a': {
            const href = safe_http_url(node.getAttribute('href'));
            return href
                ? html`<a href="${href}" rel="noopener noreferrer" target="_blank">${children}</a>`
                : children;
        }
        case 'em':
            return html`<em>${children}</em>`;
        case 'strong':
            return html`<strong>${children}</strong>`;
        case 'code':
            return html`<code>${children}</code>`;
        case 'sup':
            return html`<sup>${children}</sup>`;
        case 'sub':
            return html`<sub>${children}</sub>`;
        case 'br':
            return html`<br>`;
        default:
            return children;
    }
}

function render_documentation(text) {
    const parsed = new DOMParser().parseFromString(text ?? '', 'text/html');
    return Array.from(parsed.body.childNodes, render_documentation_node);
}

class HeatmapCardEditor extends LitElement {
    scales = new HeatmapScales();

    static get properties() {
        return {
            _config: {},
            entity: undefined,
            device_class: undefined,
            scale: undefined
        };
    }

    /*
        Store the hass object for use in child elements (entity picker, ha-selector).
        Unlike the main card, the editor does not trigger data fetches from hass updates.
    */
    set hass(hass) {
        this.myhass = hass;
    }

    /*
        Called by HA whenever the config is updated (including immediately after the editor
        is first opened). Pre-loads the ha-entity-picker element if it is not already
        registered, then resolves entity, device_class, and scale reactive properties so
        the render() method has what it needs.
    */
    async setConfig(config) {
        this._config = config;
        // Ensure that the entity picker element is available to us before we render.
        // https://github.com/thomasloven/hass-config/wiki/PreLoading-Lovelace-Elements
        var helpers = await loadCardHelpers();
        if (!customElements.get("ha-entity-picker")) {
            const entities_card = await helpers.createCardElement({type: "entities", entities: []});
            await entities_card.constructor.getConfigElement();
        }

        this.entity = this.myhass.states[this._config.entity];
        this.device_class = (this.entity && this.entity.attributes.device_class) ?? this._config.device_class;
        this.scale = this.scales.get_scale(this._config.scale)
    }

    /*
        Only shown when the entity does not expose a device_class attribute of its own.
        Uses ha-selector (MD3) instead of the deprecated ha-select + mwc-list-item.
        The root value-changed listener in createRenderRoot() handles the config update,
        including setting the default scale for the chosen device class.
    */
    render_device_class_picker() {
        if (!this.entity || this.entity.attributes.device_class) { return; }

        const dc_options = Object.keys(DEVICE_CLASSES).map(dc => ({ value: dc, label: dc }));
        return html`
            <ha-selector
                .hass=${this.myhass}
                .label=${"Device class"}
                .selector=${{select: {options: dc_options}}}
                .value=${this._config.device_class ?? ''}
                .configValue=${"device_class"}
                helper="What device_class best represents this entity?"
            ></ha-selector>
        `;
    }

    /*
        Optional second entity picker plus the combine operation selector.

        When a secondary entity is chosen the card renders the per-hour combination of
        the two entities (e.g. grid import minus export for a net-energy heatmap). Only
        shown in hourly mode; daily mode does not support combination (setConfig rejects
        it). The operation selector is only shown once a secondary entity is picked.

        Both controls carry a .configValue and rely on the delegated value-changed
        listener in createRenderRoot() to update the config.
    */
    render_multi_entity() {
        // Combining two entities is only meaningful with hourly sum/delta values.
        if (this._config.mode === 'daily') { return; }

        const operation_options = [
            { value: 'difference', label: 'Difference (primary - secondary)' },
            { value: 'sum',        label: 'Sum (primary + secondary)' }
        ];

        return html`
            <ha-entity-picker
                .hass=${this.myhass}
                .label=${"Secondary entity (optional)"}
                .value=${this._config.secondary_entity ?? ''}
                .configValue=${"secondary_entity"}
                .includeDomains=${["sensor"]}
                helper="Combine a second entity per hour, e.g. grid import minus export."
            ></ha-entity-picker>
            ${this.render_secondary_entity_warning()}
            ${this._config.secondary_entity ? html`
                <ha-selector
                    .hass=${this.myhass}
                    .label=${"Operation"}
                    .selector=${{select: {options: operation_options}}}
                    .value=${this._config.operation ?? 'difference'}
                    .configValue=${"operation"}
                ></ha-selector>
            ` : ''}
        `;
    }

    /*
        Show a warning banner when the secondary entity's state_class is incompatible
        with the primary's. The card processes both entities with the primary's
        state_class (measurement reads 'mean', total/total_increasing reads 'sum'), so
        mixing the two families cannot produce meaningful values and the card refuses
        to render. Returns nothing when either state_class is unknown (entity not
        loaded, or an external statistic) or when the pairing is compatible.
    */
    render_secondary_entity_warning() {
        if (!this._config.secondary_entity) { return; }
        const primary_class = this.myhass.states[this._config.entity]?.attributes?.state_class;
        const secondary_class = this.myhass.states[this._config.secondary_entity]?.attributes?.state_class;
        if (!state_classes_incompatible(primary_class, secondary_class)) { return; }
        return html`
            <ha-alert
                .title=${"Warning"}
                .type=${"warning"}
                own-margin
            >
                <div>
                    <p>These entities cannot be combined: the primary has
                    <code>state_class</code> <i>${primary_class}</i> but the secondary has
                    <i>${secondary_class}</i>.</p>
                    <p>Both entities must be <i>measurement</i>, or both must be
                    <i>total</i>/<i>total_increasing</i>.</p>
                </div>
            </ha-alert>
        `;
    }

    /*
        Min/max range controls, shared by both the built-in relative scale picker and the
        custom relative scale editor. Each field has a checkbox to let HA infer the value
        automatically from the data instead.
    */
    render_range_controls() {
        const minAuto = is_auto(this._config.data?.min);
        const maxAuto = is_auto(this._config.data?.max);
        return html`
            <h3>Range</h3>
            <div>
                <input
                    type="number"
                    placeholder="0"
                    .value=${minAuto ? '' : String(this._config.data.min)}
                    ?disabled=${minAuto}
                    style="display:block;width:100%;padding:8px 12px;font-size:14px;border:1px solid var(--divider-color,#e0e0e0);border-radius:4px;background:var(--card-background-color,#fff);color:var(--primary-text-color);box-sizing:border-box;"
                    @change=${(e) => {
                        e.stopPropagation();
                        const config = deep_clone(this._config);
                        if (!config.data) config.data = {};
                        config.data.min = parseFloat(e.target.value);
                        this._dispatch_config(config);
                    }}
                >
                <ha-formfield .label=${"Infer from the sensor data"} @change=${this.update_field}>
                    <ha-checkbox
                        .checked=${minAuto}
                        .value=${"auto"}
                        .configValue=${"data.min"}
                    ></ha-checkbox>
                </ha-formfield>
            </div>
            <div>
                <input
                    type="number"
                    placeholder="100"
                    .value=${maxAuto ? '' : String(this._config.data.max)}
                    ?disabled=${maxAuto}
                    style="display:block;width:100%;padding:8px 12px;font-size:14px;border:1px solid var(--divider-color,#e0e0e0);border-radius:4px;background:var(--card-background-color,#fff);color:var(--primary-text-color);box-sizing:border-box;"
                    @change=${(e) => {
                        e.stopPropagation();
                        const config = deep_clone(this._config);
                        if (!config.data) config.data = {};
                        config.data.max = parseFloat(e.target.value);
                        this._dispatch_config(config);
                    }}
                >
                <ha-formfield .label=${"Infer from the sensor data"} @change=${this.update_field}>
                    <ha-checkbox
                        .checked=${maxAuto}
                        .value=${"auto"}
                        .configValue=${"data.max"}
                    ></ha-checkbox>
                </ha-formfield>
            </div>
        `;
    }

    /*
        Render optional documentation and license information for the selected built-in scale.
        Returns nothing if the current scale has no docs block. Scale docs are authored in
        HeatmapScales and may include a free-text description and/or a license block.
    */
    render_scale_docs() {
        if (this.scale === undefined || this.scale.docs === undefined) { return }
        var license_block;
        if (this.scale.docs?.license) {
            const license_url = safe_http_url(this.scale.docs.license.url);
            license_block = html`
                <h4>Scale license</h4>
                <p>
                    This scale is licensed separately from the heatmap card
                    under ${license_url
                        ? html`<a href="${license_url}" rel="noopener noreferrer" target="_blank">${this.scale.docs.license.name}</a>`
                        : this.scale.docs.license.name}.
                </p>
            `
        }
        return html`
            <div class="scale-docs">
                <h3>About this scale</h3>
                ${render_documentation(this.scale.docs?.text)}
                ${license_block}
            </div>
        `
    }

    /*
        Single scale picker showing all built-in scales with gradient preview.
        Absolute scales (with fixed value ranges) are listed first, followed by
        relative scales (which also expose Range controls for min/max).
    */
    render_scale_picker() {
        if (!this.device_class) { return; }

        if (typeof(this._config.scale) === 'object') {
            return this.render_custom_scale_editor();
        }

        // Absolute scales first (specific, value-anchored), then relative (generic)
        const all_scales = [
            ...this.scales.get_by('type', 'absolute'),
            ...this.scales.get_by('type', 'relative')
        ].map(function(scale) { return {
            label: scale.unit ? `${scale.name} [${scale.unit}]` : scale.name,
            value: scale.key,
            css: scale.css
        }});

        // Show gradient preview for the currently selected scale
        const selected_scale = all_scales.find(s => s.value === (this._config.scale || ''));
        const gradient_preview = selected_scale ? html`
            <div style="height:12px;border-radius:4px;margin-top:8px;background:linear-gradient(90deg, ${selected_scale.css});"></div>
        ` : '';

        // Range controls only apply to relative scales (absolute scales have built-in fixed steps)
        var range_section = '';
        if (this.scale?.type === 'relative') {
            range_section = this.render_range_controls();
        }

        return html`
            <h3>Color scale</h3>
            <ha-selector
                .hass=${this.myhass}
                .label=${"Scale"}
                .selector=${{select: {options: all_scales.map(s => ({value: s.value, label: s.label}))}}}
                .value=${this._config.scale || ''}
                @value-changed=${this._scale_changed}
            ></ha-selector>
            ${gradient_preview}
            ${range_section}
            ${this.render_scale_docs()}
            <div>
                <a href="#" @click=${(e) => { e.preventDefault(); this._switch_to_custom(); }}>
                    Use custom thresholds
                </a>
            </div>
        `;
    }

    /*
        Render the custom threshold editor, shown when config.scale is an object (not a string key).
        Allows the user to:
          - Switch between absolute (fixed value steps) and relative (auto-range) scale types
          - Add/remove color steps
          - Set colors via a native color picker; set values via native number input (absolute only)
        Includes a "Back to preset scales" link that calls _reset_to_builtin().

        The type selector uses ha-selector rather than the older ha-select + mwc-list-item
        pair, which stopped rendering when Home Assistant moved from MWC to MD3.
    */
    render_custom_scale_editor() {
        const scale = this._config.scale;
        const steps = scale.steps || [];
        const is_absolute = scale.type !== 'relative';

        // Range controls for auto-range (relative) custom scales
        var range_section = '';
        if (!is_absolute) {
            range_section = this.render_range_controls();
        }

        return html`
            <h3>Custom scale</h3>
            <ha-selector
                .hass=${this.myhass}
                .label=${"Scale type"}
                .selector=${{select: {options: [
                    {value: 'absolute', label: 'Fixed thresholds (value + color)'},
                    {value: 'relative', label: 'Auto-range (colors only, stretches to data)'}
                ]}}}
                .value=${scale.type || 'absolute'}
                @value-changed=${this._custom_type_changed}
            ></ha-selector>
            <div class="custom-steps">
                ${steps.map((step, i) => html`
                    <div class="custom-step-row">
                        <input
                            type="color"
                            .value=${step.color || '#888888'}
                            @change=${(e) => this._update_step_color(i, e.target.value)}
                        >
                        ${is_absolute ? html`
                            <input
                                type="number"
                                .value=${step.value ?? ''}
                                @change=${(e) => this._update_step_value(i, e.target.value)}
                                style="flex:1;padding:4px 8px;font-size:14px;border:1px solid var(--divider-color,#e0e0e0);border-radius:4px;background:var(--card-background-color,#fff);color:var(--primary-text-color);"
                            >
                        ` : html`<span style="flex:1;padding:0 8px;align-self:center;">Step ${i + 1}</span>`}
                        <button
                            class="custom-step-remove"
                            @click=${() => this._remove_step(i)}
                            .disabled=${steps.length <= 2}
                            title="Remove"
                        >&#x2715;</button>
                    </div>
                `)}
            </div>
            <div>
                <a href="#" @click=${(e) => { e.preventDefault(); this._add_step(); }}>+ Add threshold</a>
            </div>
            ${range_section}
            <div>
                <a href="#" @click=${(e) => { e.preventDefault(); this._reset_to_builtin(); }}>
                    Back to preset scales
                </a>
            </div>
        `;
    }

    /*
        Fire the 'config-changed' event that HA listens for to update and persist the card config.
        All editor mutations should go through this method rather than directly dispatching events.
    */
    _dispatch_config(config) {
        const event = new Event('config-changed');
        event.detail = {'config': config};
        this.dispatchEvent(event);
    }

    /*
        Resolve the default built-in scale for the config's primary entity: prefer the
        entity's own device_class, falling back to the device_class set in the config.
        Used when clearing/replacing the multi-entity 'net energy' scale suggestion.
    */
    _default_scale_for_config(config) {
        const device_class = this.myhass.states[config['entity']]?.attributes.device_class
            ?? config['device_class'];
        return this.scales.defaults_for(device_class);
    }

    /*
        Switch from a built-in scale to a custom absolute scale with three default steps.
        Called when the user clicks "Use custom thresholds". Pre-populates with a simple
        green-yellow-red gradient anchored at 0 / 50 / 100.
    */
    _switch_to_custom() {
        const config = deep_clone(this._config);
        config.scale = {
            type: 'absolute',
            name: 'Custom',
            steps: [
                {value: 0,   color: '#4caf50'},
                {value: 50,  color: '#ffeb3b'},
                {value: 100, color: '#cf0000'}
            ]
        };
        this._dispatch_config(config);
    }

    /*
        Revert from a custom scale back to the built-in default for the current device class.
        Also clears any manual data.min/max overrides that were set while in custom mode.
        Called when the user clicks "Back to preset scales".
    */
    _reset_to_builtin() {
        const config = deep_clone(this._config);
        config.scale = this.scales.defaults_for(this.device_class);
        delete config.data;
        this._dispatch_config(config);
    }

    /*
        Append a new empty step to the custom scale. For relative scales the step has
        only a color; for absolute scales a default value of 0 is also added.
    */
    _add_step() {
        const config = deep_clone(this._config);
        const steps = config.scale.steps || [];
        const new_step = config.scale.type === 'relative'
            ? {color: '#888888'}
            : {value: 0, color: '#888888'};
        steps.push(new_step);
        config.scale.steps = steps;
        this._dispatch_config(config);
    }

    /*
        Remove the step at the given index from the custom scale.
        The remove button is disabled in the template when fewer than 2 steps remain,
        so a minimum of 2 steps is enforced without needing a guard here.
    */
    _remove_step(index) {
        const config = deep_clone(this._config);
        config.scale.steps.splice(index, 1);
        this._dispatch_config(config);
    }

    /*
        Update the color hex string for the step at the given index.
        Called on 'change' from the native <input type="color"> in the step row.
    */
    _update_step_color(index, color) {
        const config = deep_clone(this._config);
        config.scale.steps[index].color = color;
        this._dispatch_config(config);
    }

    /*
        Update the numeric value for the step at the given index (absolute scales only).
        Called on 'change' from the native number input in the step row.
    */
    _update_step_value(index, value) {
        const config = deep_clone(this._config);
        config.scale.steps[index].value = parseFloat(value);
        this._dispatch_config(config);
    }

    /*
        Handle a change in custom scale type (absolute <-> relative).
        When switching to relative: strip the value fields from all steps, keeping only colors.
        When switching to absolute: assign evenly-spaced default values based on step count (0..100).
        Stops propagation so the root value-changed handler in createRenderRoot() is not triggered.
    */
    _custom_type_changed(ev) {
        // Stop the event here so the delegated value-changed listener in
        // createRenderRoot() does not also try to apply it as a plain config key.
        ev.stopPropagation();
        const type = ev.detail?.value;
        if (!type) { return; }
        if (type === this._config.scale?.type) { return; }
        const config = deep_clone(this._config);
        config.scale.type = type;
        // Switching to relative: strip values from steps (colors only, evenly spaced)
        // Switching to absolute: add evenly-spaced default values based on step count
        if (type === 'relative') {
            config.scale.steps = config.scale.steps.map(s => ({color: s.color}));
        } else {
            const count = config.scale.steps.length;
            config.scale.steps = config.scale.steps.map((s, i) => ({
                value: i * Math.round(100 / Math.max(count - 1, 1)),
                color: s.color
            }));
        }
        this._dispatch_config(config);
    }

    /*
        Handle scale selection changes from the ha-selector dropdown.
        Manually dispatches config-changed (bypassing the generic createRenderRoot() handler)
        because the scale picker needs its own dedicated handler rather than the generic
        dot-notation config path logic.
    */
    _scale_changed(ev) {
        ev.stopPropagation();
        const scale = ev.detail?.value ?? ev.target.value;
        if (!scale) { return; }
        const config = deep_clone(this._config);
        config['scale'] = scale;
        this._dispatch_config(config);
    }

    /*
        Show a warning banner if the selected entity does not have a state_class that HA will
        record to Long Term Statistics (LTS). Without LTS, the heatmap will always be empty.
        Valid classes are: measurement, total, total_increasing. Returns nothing if the entity
        is not yet loaded or if the state_class is valid.
    */
    render_entity_warning() {
        if (this.entity === undefined) { return; }
        if (this.entity.attributes?.state_class === undefined ||
            ['measurement', 'total', 'total_increasing'].includes(this.entity.attributes?.state_class) === false
            ) {
                return html`
                    <ha-alert
                        .title=${"Warning"}
                        .type=${"warning"}
                        own-margin
                    >
                        <div>
                            <p>This entity has a <code>state_class</code> attribute set to
                            <i>${this.entity.attributes?.state_class ?? 'undefined'}</i>.</p>
                            <p>This means that data won't be saved to Long Term Statistics, which
                            we use to drive the heatmap; no results will be shown.</p>
                        </div>
                    </ha-alert>
                `
        }
    }

    /*
        Render the full visual editor UI. Returns nothing early if hass or config are not yet set.

        Layout (top to bottom):
          - Entity picker (always shown)
          - Entity warning (if entity has an incompatible state_class)
          - Device class picker (if entity has no device_class of its own)
          - Card title field
          - Mode selector (hourly / daily)
          - Weeks/Days field (context-dependent on mode)
          - Aggregate selector (daily mode only)
          - Color scale picker or custom scale editor
          - Card elements section (legend toggle, legend decimals)
    */
    render() {
        if (this.myhass === undefined || this._config === undefined) { return; }

        const is_daily = (this._config.mode === 'daily');

        // Mode selector options
        const mode_options = [
            { value: 'hourly', label: 'Hourly (default)' },
            { value: 'daily',  label: 'Daily' }
        ];

        // Aggregate selector options (only relevant in daily mode)
        const aggregate_options = [
            { value: 'mean', label: 'Mean (average)' },
            { value: 'min',  label: 'Minimum' },
            { value: 'max',  label: 'Maximum' },
            { value: 'last', label: 'Last (final hour of day)' }
        ];

        // Hours per cell on the time axis (hourly mode only)
        // Values are strings because ha-selector's select control compares and emits
        // strings; setConfig converts back to a number.
        const interval_options = TIME_INTERVALS.map((hours) => ({
            value: String(hours),
            label: hours === 1 ? 'Hourly (default)' : `${hours} hours`
        }));

        // Layout options
        const orientation_options = [
            { value: 'vertical',   label: 'Vertical (default) - dates down the side' },
            { value: 'horizontal', label: 'Horizontal - dates across, carpet plot' }
        ];

        /*
            The entity, its warnings and the card title stay outside the panels: they are
            what every card needs, so making them cost a click would be a regression.
            Everything below is grouped, with the two panels people actually revisit open
            by default and the cosmetic one collapsed.
        */
        return html`
        <div class="root card-config">
            <ha-entity-picker
                .required=${true}
                .hass=${this.myhass}
                .value=${this._config.entity}
                .configValue=${"entity"}
                .includeDomains=${["sensor"]}
            ></ha-entity-picker>
            ${this.render_entity_warning()}
            ${this.render_device_class_picker()}
            <ha-selector
                .hass=${this.myhass}
                .label=${"Card title"}
                .value=${this._config.title || ""}
                .selector=${{text: {}}}
                .configValue=${"title"}
            ></ha-selector>

            <ha-expansion-panel header="Data" .expanded=${true}>
                <div class="section">
                    <ha-selector
                        .hass=${this.myhass}
                        .label=${"Mode"}
                        .selector=${{select: {options: mode_options}}}
                        .value=${this._config.mode ?? 'hourly'}
                        .configValue=${"mode"}
                    ></ha-selector>
                    ${is_daily ? html`
                        <ha-selector
                            .hass=${this.myhass}
                            .label=${"Weeks"}
                            .value=${this._config.weeks ?? 12}
                            .selector=${{number: {min: 1, max: MAX_WEEKS, mode: 'box', step: 1}}}
                            .configValue=${"weeks"}
                        ></ha-selector>
                        <ha-selector
                            .hass=${this.myhass}
                            .label=${"Aggregate"}
                            .selector=${{select: {options: aggregate_options}}}
                            .value=${this._config.aggregate ?? 'mean'}
                            .configValue=${"aggregate"}
                        ></ha-selector>
                    ` : html`
                        <ha-selector
                            .hass=${this.myhass}
                            .label=${"Days"}
                            .value=${this._config.days ?? 21}
                            .selector=${{number: {min: 1, max: MAX_DAYS, mode: 'box', step: 1}}}
                            .configValue=${"days"}
                        ></ha-selector>
                        <ha-selector
                            .hass=${this.myhass}
                            .label=${"Hours per cell"}
                            .selector=${{select: {options: interval_options}}}
                            .value=${String(this._config.time_interval ?? 1)}
                            .configValue=${"time_interval"}
                        ></ha-selector>
                    `}
                    ${this.render_multi_entity()}
                </div>
            </ha-expansion-panel>

            <ha-expansion-panel header="Appearance" .expanded=${true}>
                <div class="section">
                    <ha-selector
                        .hass=${this.myhass}
                        .label=${"Layout"}
                        .selector=${{select: {options: orientation_options}}}
                        .value=${this._config.orientation ?? 'vertical'}
                        .configValue=${"orientation"}
                    ></ha-selector>
                    <ha-selector
                        .hass=${this.myhass}
                        .label=${"Grid height (px, blank for automatic)"}
                        .value=${this._config.display?.height ?? ''}
                        .selector=${{number: {min: MIN_GRID_HEIGHT_PX, max: MAX_GRID_HEIGHT_PX, mode: 'box', step: 10}}}
                        .configValue=${"display.height"}
                    ></ha-selector>
                    <ha-selector
                        .hass=${this.myhass}
                        .label=${"Label every Nth time slot (blank for automatic)"}
                        .value=${this._config.display?.time_labels ?? ''}
                        .selector=${{number: {min: 1, max: MAX_TIME_LABEL_STRIDE, mode: 'box', step: 1}}}
                        .configValue=${"display.time_labels"}
                    ></ha-selector>
                    ${this.render_scale_picker()}
                </div>
            </ha-expansion-panel>

            <ha-expansion-panel header="Card elements" .expanded=${false}>
                <div class="section">
                    <ha-formfield .label=${"Show history navigation"}>
                        <ha-switch
                            .checked=${this._config.display?.navigation !== false}
                            @change=${(e) => {
                                const config = deep_clone(this._config);
                                if (!config.display) { config.display = {}; }
                                config.display.navigation = e.target.checked;
                                this._dispatch_config(config);
                            }}
                        ></ha-switch>
                    </ha-formfield>
                    <ha-formfield .label=${"Show legend"}>
                        <ha-switch
                            .checked=${this._config.display?.legend !== false}
                            @change=${(e) => {
                                const config = deep_clone(this._config);
                                if (!config.display) { config.display = {}; }
                                config.display.legend = e.target.checked;
                                this._dispatch_config(config);
                            }}
                        ></ha-switch>
                    </ha-formfield>
                    <ha-formfield .label=${"Show cell labels"}>
                        <ha-switch
                            .checked=${this._config.display?.labels === true}
                            @change=${(e) => {
                                const config = deep_clone(this._config);
                                if (!config.display) { config.display = {}; }
                                config.display.labels = e.target.checked;
                                this._dispatch_config(config);
                            }}
                        ></ha-switch>
                    </ha-formfield>
                    ${this._config.display?.labels === true ? html`
                        <ha-formfield .label=${"Hide zero values in labels"}>
                            <ha-switch
                                .checked=${this._config.display?.hide_zero === true}
                                @change=${(e) => {
                                    const config = deep_clone(this._config);
                                    if (!config.display) { config.display = {}; }
                                    config.display.hide_zero = e.target.checked;
                                    this._dispatch_config(config);
                                }}
                            ></ha-switch>
                        </ha-formfield>
                    ` : ''}
                    <ha-selector
                        .hass=${this.myhass}
                        .label=${"Label / legend decimal places"}
                        .value=${this._config.display?.decimals ?? ''}
                        .selector=${{number: {min: 0, max: MAX_DECIMAL_PLACES, mode: 'box', step: 1}}}
                        .configValue=${"display.decimals"}
                    ></ha-selector>
                </div>
            </ha-expansion-panel>
        </div>`
    }

    /*
        Translate a DOM input/change event from a native input or ha-checkbox into a
        'value-changed' event that the root listener in createRenderRoot() can handle.

        - For checkboxes, emits the element's value when checked, or 0 when unchecked.
        - For numeric strings, parses and emits as a float.
        - For all other strings, emits verbatim.

        The element must have a .configValue property set to the config key (dot notation
        is supported, e.g. "data.min"). Stops propagation of the original event before
        re-dispatching to avoid double-processing.
    */
        update_field(ev) {
            ev.stopPropagation();
            const value = ev.target.value;
            if (this.disabled || value === undefined || value === this.value) {
                return;
            }
            const event = new Event('value-changed', { bubbles: true });
            if ('checked' in ev.target) {
                // Is this a checkbox?
                event.detail = {'value': (ev.target.checked === true ? value : 0)};
            } else if (isNaN(parseFloat(value))) {
                // Can't parse as a number? Use verbatim
                event.detail = {'value': value};
            } else {
                event.detail = {'value': parseFloat(value)};
            }
            ev.target.dispatchEvent(event);
        }

    /*
        Override createRenderRoot() to attach a single delegated 'value-changed' listener on the
        shadow root. This handles all config field updates in one place without needing per-element
        handlers, as long as each element has a .configValue property set to its config key.

        Special cases handled:
          - device_class change: also sets the scale to the default for the new class
          - entity change: if the new entity has a device_class, sets the default scale and clears
            any manually set device_class override in the config
          - dot-notation keys (e.g. "data.min"): walks the config object to find the right nesting

        After updating, fires 'config-changed' for HA to persist the new config.
    */
    createRenderRoot() {
        const root = super.createRenderRoot();
        root.addEventListener("value-changed", (ev) => {
            ev.stopPropagation();
            const key = ev.target.configValue;
            const val = ev.detail.value;
            var config = deep_clone(this._config);

            /*
                When updating the device class, we also want to set the
                scale to the class default.
            */
            if (key === 'device_class') {
                config['scale'] = this.scales.defaults_for(val);
            }

            /*
                When updating the entity, set the scale to the class default
                of this entity if it has a class. If so, also zap the device_class
                value from the config if it's set.
            */
            if (key === 'entity') {
                const new_entity = this.myhass.states[val];
                const new_device_class = (new_entity && new_entity.attributes.device_class);
                if (new_device_class) {
                    config['scale'] = this.scales.defaults_for(new_device_class);
                    delete config['device_class'];
                }
            }

            /*
                Signed differences read best on the diverging 'net energy' scale. Suggest
                it when a secondary entity is added (or the operation is switched to
                difference), but never clobber a user's custom scale object. When the
                secondary entity is cleared, fall back to the primary's device-class default.
            */
            const current_scale_is_custom = (typeof config['scale'] === 'object');
            if (key === 'secondary_entity') {
                if (val && config['operation'] !== 'sum' && !current_scale_is_custom) {
                    config['scale'] = 'net energy';
                } else if (!val && !current_scale_is_custom) {
                    config['scale'] = this._default_scale_for_config(config);
                }
            }
            if (key === 'operation' && config['secondary_entity'] && !current_scale_is_custom) {
                config['scale'] = (val === 'difference') ? 'net energy'
                    : this._default_scale_for_config(config);
            }

            /*
                Daily mode does not support multi-entity combination (setConfig rejects
                it), and the secondary picker is hidden in daily mode. Drop the multi-
                entity keys on the switch, or the card would show an error with no UI
                control left to clear them. Also restore the device-class default scale
                if the 'net energy' suggestion was applied for the secondary entity.
            */
            if (key === 'mode' && val === 'daily' && config['secondary_entity']) {
                delete config['secondary_entity'];
                delete config['operation'];
                if (!current_scale_is_custom) {
                    config['scale'] = this._default_scale_for_config(config);
                }
            }

            /*
                Same trap for the time interval: daily mode has no hours to group, so
                setConfig rejects an interval above 1, and the interval picker is hidden
                in daily mode. Drop it on the switch rather than stranding the user with
                an error and no control.
            */
            if (key === 'mode' && val === 'daily' && config['time_interval'] > 1) {
                delete config['time_interval'];
            }

            /*
                Figure out what object to update; we're making things a bit hard
                on ourselves by supporting dot notation in the configValue
            */
            var root = config;
            var target = key;
            if (key.includes('.')) {
                for (const segment of key.split('.').slice(0, -1)) {
                    if (root[segment] === undefined) {
                        root[segment] = {};
                    }
                    root = root[segment];
                }
                target = key.split('.').slice(-1);
            }
            root[target] = val;

            const event = new Event('config-changed');
            event.detail = {'config': config};
            this.dispatchEvent(event);
        });
        return root;
    }

    /* Copied from ha-form css; used for spacing between combo boxes */
    static styles = css`
        .root > * {
            display: block;
        }
        .root > *:not([own-margin]):not(:last-child) {
            margin-bottom: 24px;
        }

        /*
            Grouping panels. The .section rules repeat the spacing above for the panel
            contents, which are no longer direct children of .root.
        */
        ha-expansion-panel {
            display: block;
            margin-bottom: 12px;
            border: 1px solid var(--divider-color);
            border-radius: 4px;
        }
        .section > * {
            display: block;
        }
        .section > *:not([own-margin]):not(:last-child) {
            margin-bottom: 24px;
        }
        .section {
            padding: 8px 12px 16px 12px;
        }
        ha-alert[own-margin] {
            margin-bottom: 4px;
        }


        a:link, a:visited {
            color: var(--primary-color);
        }

        .scale-docs {
            margin-left: 2em;
            margin-right: 2em;
            word-wrap: break-word;
        }

        .custom-steps {
            display: flex;
            flex-direction: column;
            gap: 8px;
        }

        .custom-step-row {
            display: flex;
            align-items: center;
            gap: 8px;
        }

        .custom-step-row input[type="color"] {
            width: 40px;
            height: 40px;
            border: none;
            padding: 2px;
            cursor: pointer;
            border-radius: 4px;
        }

        .custom-step-remove {
            background: none;
            border: none;
            cursor: pointer;
            color: var(--secondary-text-color);
            font-size: 1.1em;
            padding: 4px 8px;
        }

        .custom-step-remove:disabled {
            opacity: 0.3;
            cursor: default;
        }

        /* Don't mess with the line spacing */
        sup, sub {
            line-height: 0;
        }
    `;
}

/* ------------------------------------------------------------------------- */
/* Registration                                                              */
/* ------------------------------------------------------------------------- */
/* Home Assistant custodial stuff:
    - Register the card
    - Make it available in the card picker UI
*/
customElements.define("heatmap-card", HeatmapCard);
customElements.define("heatmap-card-editor", HeatmapCardEditor);
window.customCards = window.customCards || [];
window.customCards.push({
    type: "heatmap-card",
    name: "Heatmap card",
    preview: true,
    description: "Heat maps of entities or energy data",

    // Suggest this card for sensors that have a state_class attribute, which
    // confirms the recorder is tracking historical values. Without history the
    // day-over-day heatmap grid has nothing meaningful to display.
    getEntitySuggestion: (hass, entityId) => {
        const entityState = hass.states[entityId];
        if (!entityState) return null;

        if (entityId.split('.')[0] !== 'sensor') return null;

        if (!entityState.attributes.state_class) return null;

        return { config: { type: 'custom:heatmap-card', entity: entityId } };
    }
});
console.info(
    "%c HEATMAP-CARD %c 2026.9.3 ",
    "color: black; background: #F2720C; font-weight: 600;",
    "color: black; background: #00a5c9; font-weight: 600;"
);
