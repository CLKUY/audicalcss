function setCookie(a,b,c){var d=new Date;d.setDate(d.getDate()+c);var e=escape(b)+(null==c?"":"; expires="+d.toUTCString());document.cookie=a+"="+e}function getCookie(a){var b,c,d,e=document.cookie.split(";");for(b=0;b<e.length;b++)if(c=e[b].substr(0,e[b].indexOf("=")),d=e[b].substr(e[b].indexOf("=")+1),c=c.replace(/^\s+|\s+$/g,""),c==a)return unescape(d)}