(window.webpackJsonp=window.webpackJsonp||[]).push([[13],{373:function(e,t,a){"use strict";a.r(t),a.d(t,"datePicker",function(){return F});var l=a(376),n=a(8),i=a.n(n),c=a(18),r=a(0),d=a.n(r),s=a(2),o=a.n(s),m=a(15),p=a(48),y=a(27),g=a(86),v=a(87),b=a.n(v),E=a(35),h=a.n(E),k=a(487),u=a(85),x=a(379),f=a(382),w=a.n(f),A=a(380),R=a.n(A),W=a(377),z=a.n(W),O=a(399),S=a.n(O),N=a(400),j=a.n(N),M=a(402),C=a.n(M),T=a(31),D=a.n(T),I=a(401),J=a.n(I),H=a(88),F=d.a.createRef(),P=u.b.current.offsetWidth>800?500:240,L=u.b.current.offsetWidth>800?240:120,B=d.a.memo(function(e){Object(r.useEffect)(Object(c.a)(i.a.mark(function t(){var a,l,n,c,r,d,o,m,p;return i.a.wrap(function(t){for(;;)switch(t.prev=t.next){case 0:return"active"===A.status&&["admin","\u043e\u0440\u0433\u0430\u043d\u0438\u0437\u0430\u0442\u043e\u0440"].includes(A.role)||e.history.push("/"),t.next=3,g.getDataSimple({name:"\u041d\u043e\u043c\u0435\u0440\u0430 \u0430\u0432\u0442\u043e"});case 3:return a=t.sent,ee(a),t.next=7,g.getDataSimple({name:"\u0426\u0435\u043d\u04301"});case 7:if(a=t.sent,oe(a),-1!==E){t.next=27;break}return t.next=12,g.getDataSimple({name:"\u041e\u0440\u0433\u0430\u043d\u0438\u0437\u0430\u0442\u043e\u0440\u041f\u043eID"});case 12:if(void 0===(a=t.sent)){t.next=25;break}return L(a.region),M(a.name),l=new Date,l=(l=JSON.stringify(l).split("-"))[2].split("T")[0]+" "+x.a[parseInt(l[1])-1]+" "+l[0].replace('"',""),G(l),t.next=22,g.getDataSimple({name:"\u0412\u0441\u0435 \u043e\u0442\u0447\u0435\u0442\u044b \u0440\u0435\u0430\u043b\u0438\u0437\u0430\u0442\u043e\u0440\u043e\u0432 \u043f\u043e \u0434\u0430\u0442\u0435",data:{data:l,organizator:a.name,region:a.region}});case 22:if(a=t.sent,void 0!=u){for(ye.r.otr=100*a.length,n=[],c=[],r=[],d=[],o=0;o<a.length;o++)(m=JSON.parse(a[o].dataTable)).vydano.d1.ml&&(n[o]=1),0!==m.vydano.d2.ml&&(n[o]=2),0!==m.vydano.d3.ml&&(n[o]=3),m.vydano.d1.kl&&(r[o]=1),0!==m.vydano.d2.kl&&(r[o]=2),0!==m.vydano.d3.kl&&(r[o]=3),m.vydano.d1.chl&&(c[o]=1),0!==m.vydano.d2.chl&&(c[o]=2),0!==m.vydano.d3.chl&&(c[o]=3),m.vydano.d1.sl&&(d[o]=1),0!==m.vydano.d2.sl&&(d[o]=2),0!==m.vydano.d3.sl&&(d[o]=3),ye.p.m.v+=m.vydano.i.ml,ye.p.ch.v+=m.vydano.i.chl,ye.p.k.v+=m.vydano.i.kl,ye.p.sl.v+=m.vydano.i.sl,ye.p.m.o+=m.vozvrat.v.ml,ye.p.ch.o+=m.vozvrat.v.chl,ye.p.k.o+=m.vozvrat.v.kl,ye.p.sl.o+=m.vozvrat.v.sl,ye.p.m.s+=m.vozvrat.s.ml,ye.p.ch.s+=m.vozvrat.s.chl,ye.p.k.s+=m.vozvrat.s.kl,ye.p.sl.s+=m.vozvrat.s.sl,ye.p.m.pl+=m.vozvrat.p.ml,ye.p.ch.pl+=m.vozvrat.p.chl,ye.p.k.pl+=m.vozvrat.p.kl,ye.p.sl.pl+=m.vozvrat.p.sl,ye.p.m.ps+=m.vozvrat.virychka.ml,ye.p.ch.ps+=m.vozvrat.virychka.chl,ye.p.k.ps+=m.vozvrat.virychka.kl,ye.p.sl.ps+=m.vozvrat.virychka.sl,ye.p.m.ktt=a.length,ye.p.ch.ktt=a.length,ye.p.k.ktt=a.length,ye.p.sl.ktt=a.length,ye.r.ntp+=m.vozvrat.virychka.sl;ye.p.m.kd=n.length>0?Math.max.apply(Math,n):0,ye.p.k.kd=r.length>0?Math.max.apply(Math,r):0,ye.p.ch.kd=c.length>0?Math.max.apply(Math,c):0,ye.p.sl.kd=d.length>0?Math.max.apply(Math,d):0,ye.p.i=ye.p.m.ps+ye.p.ch.ps+ye.p.k.ps+ye.p.sl.ps,ye.i=ye.p.i-ye.r.otr-ye.r.oo-ye.r.ntp-ye.r.att-ye.r.at-ye.r.vs}ge(ye);case 25:t.next=35;break;case 27:return t.next=29,g.getDataSimple({name:"\u041e\u0442\u0447\u0435\u0442 \u043e\u0440\u0433\u0430\u043d\u0438\u0437\u0430\u0442\u043e\u0440\u0430 \u043f\u043e \u0434\u0430\u043d\u043d\u044b\u043c",data:{data:u[E][1],organizator:u[E][0].split(":")[0],region:u[E][0].split(":")[1].trim()}});case 29:void 0!==(a=t.sent)&&(G(a.data),M(a.organizator),L(a.region),ge(JSON.parse(a.dataTable)),re(a._id)),p=new Date,p=(p=JSON.stringify(p).split("-"))[2].split("T")[0]+" "+x.a[parseInt(p[1])-1]+" "+p[0].replace('"',""),s(p!==a.data);case 35:case"end":return t.stop()}},t,this)})),[]);var t=Object(r.useState)(!1),a=Object(l.a)(t,2),n=a[0],s=a[1],o=e.tableActions,m=o.setSelected,p=o.addData,y=o.setData,v=e.table,E=v.selected,u=v.data,f=e.classes,A=e.user.status,W=Object(r.useState)(""),O=Object(l.a)(W,2),N=O[0],M=O[1],T=Object(r.useState)(""),I=Object(l.a)(T,2),P=I[0],L=I[1],B=Object(r.useState)(""),q=Object(l.a)(B,2),_=q[0],G=q[1],K=Object(r.useState)(new Date),Q=Object(l.a)(K,2),U=Q[0],V=Q[1],X=function(){var e=Object(c.a)(i.a.mark(function e(t){var a,l,n,c,r,d,s;return i.a.wrap(function(e){for(;;)switch(e.prev=e.next){case 0:return V(t),t=(t=JSON.stringify(t).split("-"))[2].split("T")[0]+" "+x.a[parseInt(t[1])-1]+" "+t[0].replace('"',""),G(t),e.next=6,g.getDataSimple({name:"\u0412\u0441\u0435 \u043e\u0442\u0447\u0435\u0442\u044b \u0440\u0435\u0430\u043b\u0438\u0437\u0430\u0442\u043e\u0440\u043e\u0432 \u043f\u043e \u0434\u0430\u0442\u0435",data:{data:t,organizator:N,region:P}});case 6:if(a=e.sent,void 0!=u){for(ye.r.otr=100*a.length,l=[],n=[],c=[],r=[],d=0;d<a.length;d++)(s=JSON.parse(a[d].dataTable)).vydano.d1.ml&&(l[d]=1),0!==s.vydano.d2.ml&&(l[d]=2),0!==s.vydano.d3.ml&&(l[d]=3),s.vydano.d1.kl&&(c[d]=1),0!==s.vydano.d2.kl&&(c[d]=2),0!==s.vydano.d3.kl&&(c[d]=3),s.vydano.d1.chl&&(n[d]=1),0!==s.vydano.d2.chl&&(n[d]=2),0!==s.vydano.d3.chl&&(n[d]=3),s.vydano.d1.sl&&(r[d]=1),0!==s.vydano.d2.sl&&(r[d]=2),0!==s.vydano.d3.sl&&(r[d]=3),ye.p.m.v+=s.vydano.i.ml,ye.p.ch.v+=s.vydano.i.chl,ye.p.k.v+=s.vydano.i.kl,ye.p.sl.v+=s.vydano.i.sl,ye.p.m.o+=s.vozvrat.v.ml,ye.p.ch.o+=s.vozvrat.v.chl,ye.p.k.o+=s.vozvrat.v.kl,ye.p.sl.o+=s.vozvrat.v.sl,ye.p.m.s+=s.vozvrat.s.ml,ye.p.ch.s+=s.vozvrat.s.chl,ye.p.k.s+=s.vozvrat.s.kl,ye.p.sl.s+=s.vozvrat.s.sl,ye.p.m.pl+=s.vozvrat.p.ml,ye.p.ch.pl+=s.vozvrat.p.chl,ye.p.k.pl+=s.vozvrat.p.kl,ye.p.sl.pl+=s.vozvrat.p.sl,ye.p.m.ps+=s.vozvrat.virychka.ml,ye.p.ch.ps+=s.vozvrat.virychka.chl,ye.p.k.ps+=s.vozvrat.virychka.kl,ye.p.sl.ps+=s.vozvrat.virychka.sl,ye.p.m.ktt=a.length,ye.p.ch.ktt=a.length,ye.p.k.ktt=a.length,ye.p.sl.ktt=a.length,ye.r.ntp+=s.vozvrat.virychka.sl;ye.p.m.kd=l.length>0?Math.max.apply(Math,l):0,ye.p.k.kd=c.length>0?Math.max.apply(Math,c):0,ye.p.ch.kd=n.length>0?Math.max.apply(Math,n):0,ye.p.sl.kd=r.length>0?Math.max.apply(Math,r):0,ye.p.i=ye.p.m.ps+ye.p.ch.ps+ye.p.k.ps+ye.p.sl.ps,ye.i=ye.p.i-ye.r.otr-ye.r.oo-ye.r.ntp-ye.r.att-ye.r.at-ye.r.vs}ge(ye);case 9:case"end":return e.stop()}},e,this)}));return function(t){return e.apply(this,arguments)}}(),Y=Object(r.useState)([]),Z=Object(l.a)(Y,2),$=Z[0],ee=Z[1],te=Object(r.useState)(!1),ae=Object(l.a)(te,2),le=ae[0],ne=(ae[1],Object(r.useState)("")),ie=Object(l.a)(ne,2),ce=ie[0],re=ie[1],de=Object(r.useState)({}),se=Object(l.a)(de,2),oe=(se[0],se[1]),me=Object(r.useState)({p:{i:0,m:{v:0,o:0,s:0,pl:0,ktt:0,kd:0,ps:0},ch:{v:0,o:0,s:0,pl:0,ktt:0,kd:0,ps:0},k:{v:0,o:0,s:0,pl:0,ktt:0,kd:0,ps:0},sl:{v:0,o:0,s:0,pl:0,ktt:0,kd:0,ps:0}},r:{otr:0,oo:100,ntp:0,att:0,at:0,vs:0,inc:0},a:{n:0,r:0,d1:0,d2:0,d3:0,s:0,lkm:0},i:0,m:!1}),pe=Object(l.a)(me,2),ye=pe[0],ge=pe[1],ve=function(e,t){if(!ye.m){var a=parseInt(e.target.value);isNaN(a)?ye.r[t]=0:ye.r[t]=a,ye.i=ye.p.i-ye.r.otr-ye.r.oo-ye.r.ntp-ye.r.att-ye.r.at-ye.r.vs,ge(ye)}},be=function(e,t){ye.m||(ye.a[t]=e.target.value,ge(ye))};return d.a.createElement("div",null,d.a.createElement("br",null),d.a.createElement("h1",null,"\u041e\u0442\u0447\u0435\u0442 \u043e\u0440\u0433\u0430\u043d\u0438\u0437\u0430\u0442\u043e\u0440\u0430"),d.a.createElement("b",null,"\u041e\u0440\u0433\u0430\u043d\u0438\u0437\u0430\u0442\u043e\u0440:"),"\xa0",N,"\xa0",d.a.createElement("b",null,"\u0420\u0435\u0433\u0438\u043e\u043d:"),"\xa0",P,d.a.createElement("br",null),-1===E&&["admin","\u043e\u0440\u0433\u0430\u043d\u0438\u0437\u0430\u0442\u043e\u0440"].includes(A.role)?d.a.createElement(d.a.Fragment,null,d.a.createElement("div",{style:{cursor:"pointer"},onClick:function(){F.current.open()}},d.a.createElement("b",null,"\u0414\u0430\u0442\u0430:"),"\xa0",_),d.a.createElement(H.a,{style:{display:"none"},ref:F,className:f.textFieldSmall,value:U,onChange:X})):d.a.createElement(d.a.Fragment,null,d.a.createElement("b",null,"\u0414\u0430\u0442\u0430:"),"\xa0",_,d.a.createElement("br",null)),d.a.createElement("b",null,"\u0412\u044b\u0440\u0443\u0447\u043a\u0430:"),"\xa0",ye.i,d.a.createElement("br",null),d.a.createElement("br",null),d.a.createElement(S.a,null,d.a.createElement(j.a,{expandIcon:d.a.createElement(J.a,null)},d.a.createElement(D.a,{className:f.heading},d.a.createElement("b",null,"\u041f\u0440\u043e\u0434\u0430\u043d\u043e")),d.a.createElement(D.a,{className:f.secondaryHeading},d.a.createElement("div",{style:{display:"inline-block"}},"\u041c: ",d.a.createElement("b",{style:{color:"black"}},ye.p.m.ps),"\xa0\xa0"),d.a.createElement("div",{style:{display:"inline-block"}},"\u0427: ",d.a.createElement("b",{style:{color:"black"}},ye.p.ch.ps),"\xa0\xa0"),d.a.createElement("div",{style:{display:"inline-block"}},"\u041a: ",d.a.createElement("b",{style:{color:"black"}},ye.p.k.ps),"\xa0\xa0"),d.a.createElement("div",{style:{display:"inline-block"}},"\u0421\u041b: ",d.a.createElement("b",{style:{color:"black"}},ye.p.sl.ps),"\xa0\xa0"),d.a.createElement("div",{style:{display:"inline-block"}},"\u0418: ",d.a.createElement("b",{style:{color:"black"}},ye.p.i),"\xa0\xa0"))),d.a.createElement(C.a,{style:{padding:"0px"}},d.a.createElement(S.a,{style:{width:"100%"}},d.a.createElement(j.a,{expandIcon:d.a.createElement(J.a,null)},d.a.createElement(D.a,{className:f.heading},"\u041c\u0430\u043a\u0441\u044b\u043c"),d.a.createElement(D.a,{className:f.secondaryHeading},d.a.createElement("div",{style:{display:"inline-block"}},"\u0412: ",d.a.createElement("b",{style:{color:"black"}},ye.p.m.v),"\xa0\xa0"),d.a.createElement("div",{style:{display:"inline-block"}},"\u041e: ",d.a.createElement("b",{style:{color:"black"}},ye.p.m.o),"\xa0\xa0"),d.a.createElement("div",{style:{display:"inline-block"}},"\u0421: ",d.a.createElement("b",{style:{color:"black"}},ye.p.m.s),"\xa0\xa0"),d.a.createElement("div",{style:{display:"inline-block"}},"\u041f: ",d.a.createElement("b",{style:{color:"black"}},ye.p.m.pl),"\xa0\xa0"),d.a.createElement("div",{style:{display:"inline-block"}},"\u043a \u0422.\u0422.: ",d.a.createElement("b",{style:{color:"black"}},ye.p.m.ktt),"\xa0\xa0"),d.a.createElement("div",{style:{display:"inline-block"}},"\u043a \u0414.: ",d.a.createElement("b",{style:{color:"black"}},ye.p.m.kd),"\xa0\xa0"),d.a.createElement("div",{style:{display:"inline-block"}},"\u041f: ",d.a.createElement("b",{style:{color:"black"}},ye.p.m.ps),"\xa0\xa0"))),d.a.createElement(C.a,{style:{padding:"0px"}},d.a.createElement("center",{style:{width:"100%"}},d.a.createElement("div",{style:{marginRight:"10px",display:"inline-block",verticalAlign:"middle",fontWeight:"bold"}},"\u0412\u044b\u0434\u0430\u043d\u043e:"),"\xa0",ye.p.m.v)),d.a.createElement(C.a,{style:{padding:"0px"}},d.a.createElement("center",{style:{width:"100%"}},d.a.createElement("div",{style:{marginRight:"10px",display:"inline-block",verticalAlign:"middle",fontWeight:"bold"}},"\u041e\u0441\u0442\u0430\u0442\u043e\u043a \u0441\u044a\u0435\u043c:"),"\xa0",ye.p.m.o)),d.a.createElement(C.a,{style:{padding:"0px"}},d.a.createElement("center",{style:{width:"100%"}},d.a.createElement("div",{style:{marginRight:"10px",display:"inline-block",verticalAlign:"middle",fontWeight:"bold"}},"\u0421\u043f\u0438\u0441\u0430\u043d\u0438\u0435 \u043f\u043e \u0430\u043a\u0442\u0443:"),"\xa0",ye.p.m.s)),d.a.createElement(C.a,{style:{padding:"0px"}},d.a.createElement("center",{style:{width:"100%"}},d.a.createElement("div",{style:{marginRight:"10px",display:"inline-block",verticalAlign:"middle",fontWeight:"bold"}},"\u041f\u0440\u043e\u0434\u0430\u043d\u043e \u043b\u0438\u0442\u0440\u043e\u0432:"),"\xa0",ye.p.m.pl)),d.a.createElement(C.a,{style:{padding:"0px"}},d.a.createElement("center",{style:{width:"100%"}},d.a.createElement("div",{style:{marginRight:"10px",display:"inline-block",verticalAlign:"middle",fontWeight:"bold"}},"\u041a\u043e\u043b\u0438\u0447\u0435\u0441\u0442\u0432\u043e \u0422.\u0422.:"),"\xa0",ye.p.m.ktt)),d.a.createElement(C.a,{style:{padding:"0px"}},d.a.createElement("center",{style:{width:"100%"}},d.a.createElement("div",{style:{marginRight:"10px",display:"inline-block",verticalAlign:"middle",fontWeight:"bold"}},"\u041a\u043e\u043b\u0438\u0447\u0435\u0441\u0442\u0432\u043e \u0434\u043e\u043b\u0438\u0432\u043e\u0432:"),"\xa0",ye.p.m.kd)),d.a.createElement(C.a,{style:{padding:"0px"}},d.a.createElement("center",{style:{width:"100%"}},d.a.createElement("div",{style:{marginRight:"10px",display:"inline-block",verticalAlign:"middle",fontWeight:"bold"}},"\u041f\u0440\u043e\u0434\u0430\u043d\u043e \u0441\u043e\u043c:"),"\xa0",ye.p.m.ps)))),d.a.createElement(C.a,{style:{padding:"0px"}},d.a.createElement(S.a,{style:{width:"100%"}},d.a.createElement(j.a,{expandIcon:d.a.createElement(J.a,null)},d.a.createElement(D.a,{className:f.heading},"\u0427\u0430\u043b\u0430\u043f"),d.a.createElement(D.a,{className:f.secondaryHeading},d.a.createElement("div",{style:{display:"inline-block"}},"\u0412: ",d.a.createElement("b",{style:{color:"black"}},ye.p.ch.v),"\xa0\xa0"),d.a.createElement("div",{style:{display:"inline-block"}},"\u041e: ",d.a.createElement("b",{style:{color:"black"}},ye.p.ch.o),"\xa0\xa0"),d.a.createElement("div",{style:{display:"inline-block"}},"\u0421: ",d.a.createElement("b",{style:{color:"black"}},ye.p.ch.s),"\xa0\xa0"),d.a.createElement("div",{style:{display:"inline-block"}},"\u041f: ",d.a.createElement("b",{style:{color:"black"}},ye.p.ch.pl),"\xa0\xa0"),d.a.createElement("div",{style:{display:"inline-block"}},"\u043a \u0422.\u0422.: ",d.a.createElement("b",{style:{color:"black"}},ye.p.ch.ktt),"\xa0\xa0"),d.a.createElement("div",{style:{display:"inline-block"}},"\u043a \u0414.: ",d.a.createElement("b",{style:{color:"black"}},ye.p.ch.kd),"\xa0\xa0"),d.a.createElement("div",{style:{display:"inline-block"}},"\u041f: ",d.a.createElement("b",{style:{color:"black"}},ye.p.ch.ps),"\xa0\xa0"))),d.a.createElement(C.a,{style:{padding:"0px"}},d.a.createElement("center",{style:{width:"100%"}},d.a.createElement("div",{style:{marginRight:"10px",display:"inline-block",verticalAlign:"middle",fontWeight:"bold"}},"\u0412\u044b\u0434\u0430\u043d\u043e:"),"\xa0",ye.p.ch.v)),d.a.createElement(C.a,{style:{padding:"0px"}},d.a.createElement("center",{style:{width:"100%"}},d.a.createElement("div",{style:{marginRight:"10px",display:"inline-block",verticalAlign:"middle",fontWeight:"bold"}},"\u041e\u0441\u0442\u0430\u0442\u043e\u043a \u0441\u044a\u0435\u043c:"),"\xa0",ye.p.ch.o)),d.a.createElement(C.a,{style:{padding:"0px"}},d.a.createElement("center",{style:{width:"100%"}},d.a.createElement("div",{style:{marginRight:"10px",display:"inline-block",verticalAlign:"middle",fontWeight:"bold"}},"\u0421\u043f\u0438\u0441\u0430\u043d\u0438\u0435 \u043f\u043e \u0430\u043a\u0442\u0443:"),"\xa0",ye.p.ch.o)),d.a.createElement(C.a,{style:{padding:"0px"}},d.a.createElement("center",{style:{width:"100%"}},d.a.createElement("div",{style:{marginRight:"10px",display:"inline-block",verticalAlign:"middle",fontWeight:"bold"}},"\u041f\u0440\u043e\u0434\u0430\u043d\u043e \u043b\u0438\u0442\u0440\u043e\u0432:"),"\xa0",ye.p.ch.pl)),d.a.createElement(C.a,{style:{padding:"0px"}},d.a.createElement("center",{style:{width:"100%"}},d.a.createElement("div",{style:{marginRight:"10px",display:"inline-block",verticalAlign:"middle",fontWeight:"bold"}},"\u041a\u043e\u043b\u0438\u0447\u0435\u0441\u0442\u0432\u043e \u0422.\u0422.:"),"\xa0",ye.p.ch.ktt)),d.a.createElement(C.a,{style:{padding:"0px"}},d.a.createElement("center",{style:{width:"100%"}},d.a.createElement("div",{style:{marginRight:"10px",display:"inline-block",verticalAlign:"middle",fontWeight:"bold"}},"\u041a\u043e\u043b\u0438\u0447\u0435\u0441\u0442\u0432\u043e \u0434\u043e\u043b\u0438\u0432\u043e\u0432:"),"\xa0",ye.p.ch.kd)),d.a.createElement(C.a,{style:{padding:"0px"}},d.a.createElement("center",{style:{width:"100%"}},d.a.createElement("div",{style:{marginRight:"10px",display:"inline-block",verticalAlign:"middle",fontWeight:"bold"}},"\u041f\u0440\u043e\u0434\u0430\u043d\u043e \u0441\u043e\u043c:"),"\xa0",ye.p.ch.ps)))),d.a.createElement(C.a,{style:{padding:"0px"}},d.a.createElement(S.a,{style:{width:"100%"}},d.a.createElement(j.a,{expandIcon:d.a.createElement(J.a,null)},d.a.createElement(D.a,{className:f.heading},"\u041a\u0432\u0430\u0441"),d.a.createElement(D.a,{className:f.secondaryHeading},d.a.createElement("div",{style:{display:"inline-block"}},"\u0412: ",d.a.createElement("b",{style:{color:"black"}},ye.p.k.v),"\xa0\xa0"),d.a.createElement("div",{style:{display:"inline-block"}},"\u041e: ",d.a.createElement("b",{style:{color:"black"}},ye.p.k.o),"\xa0\xa0"),d.a.createElement("div",{style:{display:"inline-block"}},"\u0421: ",d.a.createElement("b",{style:{color:"black"}},ye.p.k.s),"\xa0\xa0"),d.a.createElement("div",{style:{display:"inline-block"}},"\u041f: ",d.a.createElement("b",{style:{color:"black"}},ye.p.k.pl),"\xa0\xa0"),d.a.createElement("div",{style:{display:"inline-block"}},"\u043a \u0422.\u0422.: ",d.a.createElement("b",{style:{color:"black"}},ye.p.k.ktt),"\xa0\xa0"),d.a.createElement("div",{style:{display:"inline-block"}},"\u043a \u0414.: ",d.a.createElement("b",{style:{color:"black"}},ye.p.k.kd),"\xa0\xa0"),d.a.createElement("div",{style:{display:"inline-block"}},"\u041f: ",d.a.createElement("b",{style:{color:"black"}},ye.p.k.ps),"\xa0\xa0"))),d.a.createElement(C.a,{style:{padding:"0px"}},d.a.createElement("center",{style:{width:"100%"}},d.a.createElement("div",{style:{marginRight:"10px",display:"inline-block",verticalAlign:"middle",fontWeight:"bold"}},"\u0412\u044b\u0434\u0430\u043d\u043e:"),"\xa0",ye.p.k.v)),d.a.createElement(C.a,{style:{padding:"0px"}},d.a.createElement("center",{style:{width:"100%"}},d.a.createElement("div",{style:{marginRight:"10px",display:"inline-block",verticalAlign:"middle",fontWeight:"bold"}},"\u041e\u0441\u0442\u0430\u0442\u043e\u043a \u0441\u044a\u0435\u043c:"),"\xa0",ye.p.k.o)),d.a.createElement(C.a,{style:{padding:"0px"}},d.a.createElement("center",{style:{width:"100%"}},d.a.createElement("div",{style:{marginRight:"10px",display:"inline-block",verticalAlign:"middle",fontWeight:"bold"}},"\u0421\u043f\u0438\u0441\u0430\u043d\u0438\u0435 \u043f\u043e \u0430\u043a\u0442\u0443:"),"\xa0",ye.p.k.o)),d.a.createElement(C.a,{style:{padding:"0px"}},d.a.createElement("center",{style:{width:"100%"}},d.a.createElement("div",{style:{marginRight:"10px",display:"inline-block",verticalAlign:"middle",fontWeight:"bold"}},"\u041f\u0440\u043e\u0434\u0430\u043d\u043e \u043b\u0438\u0442\u0440\u043e\u0432:"),"\xa0",ye.p.k.pl)),d.a.createElement(C.a,{style:{padding:"0px"}},d.a.createElement("center",{style:{width:"100%"}},d.a.createElement("div",{style:{marginRight:"10px",display:"inline-block",verticalAlign:"middle",fontWeight:"bold"}},"\u041a\u043e\u043b\u0438\u0447\u0435\u0441\u0442\u0432\u043e \u0422.\u0422.:"),"\xa0",ye.p.k.ktt)),d.a.createElement(C.a,{style:{padding:"0px"}},d.a.createElement("center",{style:{width:"100%"}},d.a.createElement("div",{style:{marginRight:"10px",display:"inline-block",verticalAlign:"middle",fontWeight:"bold"}},"\u041a\u043e\u043b\u0438\u0447\u0435\u0441\u0442\u0432\u043e \u0434\u043e\u043b\u0438\u0432\u043e\u0432:"),"\xa0",ye.p.k.kd)),d.a.createElement(C.a,{style:{padding:"0px"}},d.a.createElement("center",{style:{width:"100%"}},d.a.createElement("div",{style:{marginRight:"10px",display:"inline-block",verticalAlign:"middle",fontWeight:"bold"}},"\u041f\u0440\u043e\u0434\u0430\u043d\u043e \u0441\u043e\u043c:"),"\xa0",ye.p.k.ps)))),d.a.createElement(C.a,{style:{padding:"0px"}},d.a.createElement(S.a,{style:{width:"100%"}},d.a.createElement(j.a,{expandIcon:d.a.createElement(J.a,null)},d.a.createElement(D.a,{className:f.heading},"\u0421\u0442\u0430\u043a\u0430\u043d \u041b\u0435\u0433\u0435\u043d\u0434\u0430"),d.a.createElement(D.a,{className:f.secondaryHeading},d.a.createElement("div",{style:{display:"inline-block"}},"\u0412: ",d.a.createElement("b",{style:{color:"black"}},ye.p.sl.v),"\xa0\xa0"),d.a.createElement("div",{style:{display:"inline-block"}},"\u041e: ",d.a.createElement("b",{style:{color:"black"}},ye.p.sl.o),"\xa0\xa0"),d.a.createElement("div",{style:{display:"inline-block"}},"\u0421: ",d.a.createElement("b",{style:{color:"black"}},ye.p.sl.s),"\xa0\xa0"),d.a.createElement("div",{style:{display:"inline-block"}},"\u041f: ",d.a.createElement("b",{style:{color:"black"}},ye.p.sl.pl),"\xa0\xa0"),d.a.createElement("div",{style:{display:"inline-block"}},"\u043a \u0422.\u0422.: ",d.a.createElement("b",{style:{color:"black"}},ye.p.sl.ktt),"\xa0\xa0"),d.a.createElement("div",{style:{display:"inline-block"}},"\u043a \u0414.: ",d.a.createElement("b",{style:{color:"black"}},ye.p.sl.kd),"\xa0\xa0"),d.a.createElement("div",{style:{display:"inline-block"}},"\u041f: ",d.a.createElement("b",{style:{color:"black"}},ye.p.sl.ps),"\xa0\xa0"))),d.a.createElement(C.a,{style:{padding:"0px"}},d.a.createElement("center",{style:{width:"100%"}},d.a.createElement("div",{style:{marginRight:"10px",display:"inline-block",verticalAlign:"middle",fontWeight:"bold"}},"\u0412\u044b\u0434\u0430\u043d\u043e:"),"\xa0",ye.p.sl.v)),d.a.createElement(C.a,{style:{padding:"0px"}},d.a.createElement("center",{style:{width:"100%"}},d.a.createElement("div",{style:{marginRight:"10px",display:"inline-block",verticalAlign:"middle",fontWeight:"bold"}},"\u041e\u0441\u0442\u0430\u0442\u043e\u043a \u0441\u044a\u0435\u043c:"),"\xa0",ye.p.sl.o)),d.a.createElement(C.a,{style:{padding:"0px"}},d.a.createElement("center",{style:{width:"100%"}},d.a.createElement("div",{style:{marginRight:"10px",display:"inline-block",verticalAlign:"middle",fontWeight:"bold"}},"\u0421\u043f\u0438\u0441\u0430\u043d\u0438\u0435 \u043f\u043e \u0430\u043a\u0442\u0443:"),"\xa0",ye.p.sl.o)),d.a.createElement(C.a,{style:{padding:"0px"}},d.a.createElement("center",{style:{width:"100%"}},d.a.createElement("div",{style:{marginRight:"10px",display:"inline-block",verticalAlign:"middle",fontWeight:"bold"}},"\u041f\u0440\u043e\u0434\u0430\u043d\u043e \u0448\u0442\u0443\u043a:"),"\xa0",ye.p.sl.pl)),d.a.createElement(C.a,{style:{padding:"0px"}},d.a.createElement("center",{style:{width:"100%"}},d.a.createElement("div",{style:{marginRight:"10px",display:"inline-block",verticalAlign:"middle",fontWeight:"bold"}},"\u041a\u043e\u043b\u0438\u0447\u0435\u0441\u0442\u0432\u043e \u0422.\u0422.:"),"\xa0",ye.p.sl.ktt)),d.a.createElement(C.a,{style:{padding:"0px"}},d.a.createElement("center",{style:{width:"100%"}},d.a.createElement("div",{style:{marginRight:"10px",display:"inline-block",verticalAlign:"middle",fontWeight:"bold"}},"\u041a\u043e\u043b\u0438\u0447\u0435\u0441\u0442\u0432\u043e \u0434\u043e\u043b\u0438\u0432\u043e\u0432:"),"\xa0",ye.p.sl.kd)),d.a.createElement(C.a,{style:{padding:"0px"}},d.a.createElement("center",{style:{width:"100%"}},d.a.createElement("div",{style:{marginRight:"10px",display:"inline-block",verticalAlign:"middle",fontWeight:"bold"}},"\u041f\u0440\u043e\u0434\u0430\u043d\u043e \u0441\u043e\u043c:"),"\xa0",ye.p.sl.ps)))),d.a.createElement("br",null)),d.a.createElement(S.a,null,d.a.createElement(j.a,{expandIcon:d.a.createElement(J.a,null)},d.a.createElement(D.a,{className:f.heading},"\u0420\u0430\u0441\u0445\u043e\u0434\u044b"),d.a.createElement(D.a,{className:f.secondaryHeading},d.a.createElement("div",{style:{display:"inline-block"}},"\u041e\u0442\u043f: ",d.a.createElement("b",{style:{color:"black"}},ye.r.otr),"\xa0\xa0"),d.a.createElement("div",{style:{display:"inline-block"}},"\u041e\u043e: ",d.a.createElement("b",{style:{color:"black"}},ye.r.oo),"\xa0\xa0"),d.a.createElement("div",{style:{display:"inline-block"}},"\u041d\u0442\u043f: ",d.a.createElement("b",{style:{color:"black"}},ye.r.ntp),"\xa0\xa0"),d.a.createElement("div",{style:{display:"inline-block"}},"\u0410\u0442\u0442: ",d.a.createElement("b",{style:{color:"black"}},ye.r.att),"\xa0\xa0"),d.a.createElement("div",{style:{display:"inline-block"}},"\u0410\u0442: ",d.a.createElement("b",{style:{color:"black"}},ye.r.at),"\xa0\xa0"),d.a.createElement("div",{style:{display:"inline-block"}},"\u0412: ",d.a.createElement("b",{style:{color:"black"}},ye.r.fv),"\xa0\xa0"))),d.a.createElement(C.a,{style:{padding:"0px"}},d.a.createElement("center",{style:{width:"100%"}},d.a.createElement("div",{style:{marginRight:"10px",display:"inline-block",verticalAlign:"middle",fontWeight:"bold"}},"\u041e\u0431\u0435\u0434 \u0442\u043e\u0440\u0433\u043e\u0432\u043e\u0433\u043e \u043f\u0440\u0435\u0434\u0441\u0442\u0430\u0432\u0438\u0442\u0435\u043b\u044f:"),"\xa0",ye.r.otr)),d.a.createElement("br",null),d.a.createElement("br",null),d.a.createElement(C.a,{style:{padding:"0px"}},d.a.createElement("center",{style:{width:"100%"}},d.a.createElement("div",{style:{marginRight:"10px",display:"inline-block",verticalAlign:"middle",fontWeight:"bold"}},"\u041e\u0431\u0435\u0434 \u043e\u0440\u0433\u0430\u043d\u0438\u0437\u0430\u0442\u043e\u0440\u0430:"),"\xa0",ye.r.oo)),d.a.createElement(C.a,{style:{padding:"0px"}},d.a.createElement("center",{style:{width:"100%"}},d.a.createElement("div",{style:{marginRight:"10px",display:"inline-block",verticalAlign:"middle",fontWeight:"bold"}},"\u041d\u0435\u0434\u043e\u0441\u0434\u0430\u0447\u0430 \u0442\u043e\u0440\u0433\u043e\u0432\u043e\u0433\u043e \u043f\u0440\u0435\u0434\u0441\u0442\u0430\u0432\u0438\u0442\u0435\u043b\u044f:"),"\xa0",ye.r.ntp)),d.a.createElement(C.a,{style:{padding:"0px"}},d.a.createElement("center",{style:{width:"100%"}},d.a.createElement("div",{style:{marginRight:"10px",display:"inline-block",verticalAlign:"middle",fontWeight:"bold"}},"\u0418\u043d\u043a\u0430\u0441\u0441\u0430\u0446\u0438\u044f:"),"\xa0",ye.r.inc)),d.a.createElement(C.a,{style:{padding:"0px"}},d.a.createElement("center",{style:{width:"100%"}},d.a.createElement("div",{style:{marginRight:"10px",display:"inline-block",verticalAlign:"middle",fontWeight:"bold"}},"\u0410\u0440\u0435\u043d\u0434\u0430 \u0442\u043e\u0440\u0433\u043e\u0432\u043e\u0439 \u0442\u043e\u0447\u043a\u0438:"),"\xa0",ye.r.att)),d.a.createElement(C.a,{style:{padding:"0px"}},d.a.createElement("center",{style:{width:"100%"}},d.a.createElement("div",{style:{marginRight:"10px",display:"inline-block",verticalAlign:"middle",fontWeight:"bold"}},"\u0410\u0440\u0435\u043d\u0434\u0430 \u0442\u0430\u0447\u043a\u0438:"),d.a.createElement(b.a,{disabled:"admin"!==A.role&&(n||"\u043e\u0440\u0433\u0430\u043d\u0438\u0437\u0430\u0442\u043e\u0440"!==A.role||ye.m),style:{width:"70px",display:"inline-block",verticalAlign:"middle"},type:"login",margin:"normal",value:ye.r.at,onChange:function(e){ve(e,"at")}}))),d.a.createElement(C.a,{style:{padding:"0px"}},d.a.createElement("center",{style:{width:"100%"}},d.a.createElement("div",{style:{marginRight:"10px",display:"inline-block",verticalAlign:"middle",fontWeight:"bold"}},"\u0412\u044a\u0435\u0437\u0434 \u043d\u0430 \u0440\u044b\u043d\u043e\u043a, \u0441\u0442\u043e\u044f\u043d\u043a\u0430:"),d.a.createElement(b.a,{disabled:"admin"!==A.role&&(n||"\u043e\u0440\u0433\u0430\u043d\u0438\u0437\u0430\u0442\u043e\u0440"!==A.role||ye.m),style:{width:"70px",display:"inline-block",verticalAlign:"middle"},type:"login",margin:"normal",value:ye.r.vs,onChange:function(e){ve(e,"vs")}})))),d.a.createElement(S.a,null,d.a.createElement(j.a,{expandIcon:d.a.createElement(J.a,null)},d.a.createElement(D.a,{className:f.heading},"\u0410\u0432\u0442\u043e"),d.a.createElement(D.a,{className:f.secondaryHeading},d.a.createElement("div",{style:{display:"inline-block"}},"\u2116: ",d.a.createElement("b",{style:{color:"black"}},ye.a.n),"\xa0\xa0"),d.a.createElement("div",{style:{display:"inline-block"}},"\u0420: ",d.a.createElement("b",{style:{color:"black"}},ye.a.r),"\xa0\xa0"),d.a.createElement("div",{style:{display:"inline-block"}},"\u04141: ",d.a.createElement("b",{style:{color:"black"}},ye.a.d1),"\xa0\xa0"),d.a.createElement("div",{style:{display:"inline-block"}},"\u04142: ",d.a.createElement("b",{style:{color:"black"}},ye.a.d2),"\xa0\xa0"),d.a.createElement("div",{style:{display:"inline-block"}},"\u04143: ",d.a.createElement("b",{style:{color:"black"}},ye.a.d3),"\xa0\xa0"),d.a.createElement("div",{style:{display:"inline-block"}},"\u0421: ",d.a.createElement("b",{style:{color:"black"}},ye.a.s),"\xa0\xa0"),d.a.createElement("div",{style:{display:"inline-block"}},"\u041b\u043a\u043c: ",d.a.createElement("b",{style:{color:"black"}},ye.a.lkm),"\xa0\xa0"))),d.a.createElement(C.a,{style:{padding:"0px"}},d.a.createElement("center",{style:{width:"100%"}},d.a.createElement("div",{style:{marginRight:"10px",display:"inline-block",verticalAlign:"middle",fontWeight:"bold"}},"\u0430\u0432\u0442\u043e:"),d.a.createElement(b.a,{disabled:"admin"!==A.role&&(n||"\u043e\u0440\u0433\u0430\u043d\u0438\u0437\u0430\u0442\u043e\u0440"!==A.role||ye.m),select:!0,style:{width:"120px"},className:f.textField,value:ye.a.n,onChange:function(e){be(e,"n")},SelectProps:{MenuProps:{className:f.menu}},margin:"normal"},$.map(function(e){return d.a.createElement(z.a,{key:e,value:e},e)})))),d.a.createElement(C.a,{style:{padding:"0px"}},d.a.createElement("center",{style:{width:"100%"}},d.a.createElement("div",{style:{marginRight:"10px",display:"inline-block",verticalAlign:"middle",fontWeight:"bold"}},"\u0420\u0430\u0441\u0442\u0430\u043d\u043e\u0432\u043a\u0430:"),d.a.createElement(b.a,{disabled:"admin"!==A.role&&(n||"\u043e\u0440\u0433\u0430\u043d\u0438\u0437\u0430\u0442\u043e\u0440"!==A.role||ye.m),style:{width:"70px",display:"inline-block",verticalAlign:"middle"},type:"login",margin:"normal",value:ye.a.r,onChange:function(e){be(e,"r")}}))),d.a.createElement(C.a,{style:{padding:"0px"}},d.a.createElement("center",{style:{width:"100%"}},d.a.createElement("div",{style:{marginRight:"10px",display:"inline-block",verticalAlign:"middle",fontWeight:"bold"}},"1-\u0439 \u0434\u043e\u043b\u0438\u0432:"),d.a.createElement(b.a,{disabled:"admin"!==A.role&&(n||"\u043e\u0440\u0433\u0430\u043d\u0438\u0437\u0430\u0442\u043e\u0440"!==A.role||ye.m),style:{width:"70px",display:"inline-block",verticalAlign:"middle"},type:"login",margin:"normal",value:ye.a.d1,onChange:function(e){be(e,"d1")}}))),d.a.createElement(C.a,{style:{padding:"0px"}},d.a.createElement("center",{style:{width:"100%"}},d.a.createElement("div",{style:{marginRight:"10px",display:"inline-block",verticalAlign:"middle",fontWeight:"bold"}},"2-\u0439 \u0434\u043e\u043b\u0438\u0432:"),d.a.createElement(b.a,{disabled:"admin"!==A.role&&(n||"\u043e\u0440\u0433\u0430\u043d\u0438\u0437\u0430\u0442\u043e\u0440"!==A.role||ye.m),style:{width:"70px",display:"inline-block",verticalAlign:"middle"},type:"login",margin:"normal",value:ye.a.d2,onChange:function(e){be(e,"d2")}}))),d.a.createElement(C.a,{style:{padding:"0px"}},d.a.createElement("center",{style:{width:"100%"}},d.a.createElement("div",{style:{marginRight:"10px",display:"inline-block",verticalAlign:"middle",fontWeight:"bold"}},"3-\u0439 \u0434\u043e\u043b\u0438\u0432:"),d.a.createElement(b.a,{disabled:"admin"!==A.role&&(n||"\u043e\u0440\u0433\u0430\u043d\u0438\u0437\u0430\u0442\u043e\u0440"!==A.role||ye.m),style:{width:"70px",display:"inline-block",verticalAlign:"middle"},type:"login",margin:"normal",value:ye.a.d3,onChange:function(e){be(e,"d3")}}))),d.a.createElement(C.a,{style:{padding:"0px"}},d.a.createElement("center",{style:{width:"100%"}},d.a.createElement("div",{style:{marginRight:"10px",display:"inline-block",verticalAlign:"middle",fontWeight:"bold"}},"\u0421\u044a\u0435\u043c:"),d.a.createElement(b.a,{disabled:"admin"!==A.role&&(n||"\u043e\u0440\u0433\u0430\u043d\u0438\u0437\u0430\u0442\u043e\u0440"!==A.role||ye.m),style:{width:"70px",display:"inline-block",verticalAlign:"middle"},type:"login",margin:"normal",value:ye.a.s,onChange:function(e){be(e,"s")}}))),d.a.createElement(C.a,{style:{padding:"0px"}},d.a.createElement("center",{style:{width:"100%"}},d.a.createElement("div",{style:{marginRight:"10px",display:"inline-block",verticalAlign:"middle",fontWeight:"bold"}},"\u041b\u0438\u0448\u043d\u0438\u0435 \u043a\u043c:"),d.a.createElement(b.a,{disabled:"admin"!==A.role&&(n||"\u043e\u0440\u0433\u0430\u043d\u0438\u0437\u0430\u0442\u043e\u0440"!==A.role||ye.m),style:{width:"70px",display:"inline-block",verticalAlign:"middle"},type:"login",margin:"normal",value:ye.a.lkm,onChange:function(e){be(e,"lkm")}})))),d.a.createElement("center",{style:{width:"100%"}},d.a.createElement(R.a,{control:d.a.createElement(w.a,{checked:ye.m,color:"primary",disabled:"admin"!==A.role&&(n||ye.m||"admin"!==A.role),onChange:function(e){!function(e){ye.m=e.target.checked,ge(ye)}(e)}}),label:"\u041f\u0440\u0438\u043d\u044f\u0442"})),d.a.createElement("br",null),d.a.createElement("div",null,d.a.createElement(k.a,{className:"link",to:""},d.a.createElement(h.a,{variant:"contained",color:"primary",onClick:function(){-1===E?p({search:"",sort:"",page:0,name:"\u041e\u0442\u0447\u0435\u0442 \u043e\u0440\u0433\u0430\u043d\u0438\u0437\u0430\u0442\u043e\u0440\u0430",data:{dataTable:JSON.stringify(ye),data:_,organizator:N,region:P,disabled:le}}):y({id:ce,search:"",sort:"",page:0,name:"\u041e\u0442\u0447\u0435\u0442 \u043e\u0440\u0433\u0430\u043d\u0438\u0437\u0430\u0442\u043e\u0440\u0430",data:{dataTable:JSON.stringify(ye),data:_,organizator:N,region:P,disabled:le}}),m(-1)},className:f.button},"\u0421\u043e\u0445\u0440\u0430\u043d\u0438\u0442\u044c")),d.a.createElement(k.a,{className:"link",to:"",onClick:function(){m(-1)}},d.a.createElement(h.a,{variant:"contained",color:"secondary",className:f.button},"\u041e\u0442\u043c\u0435\u043d\u0430"))))});Event.propTypes={classes:o.a.object.isRequired},t.default=Object(m.withStyles)(function(e){return{button:{margin:e.spacing.unit},textFieldSmall:{display:"inline-block",marginLeft:e.spacing.unit,marginRight:e.spacing.unit,width:L},textField:{marginLeft:e.spacing.unit,marginRight:e.spacing.unit,width:P},urls:{margin:e.spacing.unit,width:P,maxHeight:100,overflow:"auto"},message:{width:P,marginTop:e.spacing.unit,marginBottom:e.spacing.unit,marginLeft:"calc((100% - "+P+"px)/2)",marginRight:"calc((100% - "+P+"px)/2)"},MuiPickersToolbar:{toolbar:{backgroundColor:"#000"}},MuiPickersModal:{dialogAction:{color:"#000"}},heading:{fontSize:e.typography.pxToRem(15),flexBasis:"33.33%",flexShrink:0},secondaryHeading:{fontSize:e.typography.pxToRem(15),color:e.palette.text.secondary}}})(Object(p.b)(function(e){return{user:e.user,table:e.table}},function(e){return{tableActions:Object(y.b)(g,e)}})(B))},379:function(e,t,a){"use strict";a.d(t,"a",function(){return l});var l=["\u044f\u043d\u0432\u0430\u0440\u044c","\u0444\u0435\u0432\u0440\u0430\u043b\u044c","\u043c\u0430\u0440\u0442","\u0430\u043f\u0440\u0435\u043b\u044c","\u043c\u0430\u0439","\u0438\u044e\u043d\u044c","\u0438\u044e\u043b\u044c","\u0430\u0432\u0433\u0443\u0441\u0442","\u0441\u0435\u043d\u0442\u044f\u0431\u0440\u044c","\u043e\u043a\u0442\u044f\u0431\u0440\u044c","\u043d\u043e\u044f\u0431\u0440\u044c","\u0434\u0435\u043a\u0430\u0431\u0440\u044c"]}}]);
//# sourceMappingURL=13.a0651b7c.chunk.js.map