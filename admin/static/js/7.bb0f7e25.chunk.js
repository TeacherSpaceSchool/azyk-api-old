(window.webpackJsonp=window.webpackJsonp||[]).push([[7],{368:function(e,a,t){"use strict";t.r(a);var n=t(377),l=t(15),i=t.n(l),r=t(19),c=t(0),s=t.n(c),o=t(2),m=t.n(o),u=t(14),d=t(49),g=t(27),p=t(87),b=t(88),h=t.n(b),f=t(36),E=t.n(f),v=t(487),y=t(86),x=t(89),k=t(29),O=t(399),S=t.n(O),w=t(400),j=t.n(w),N=t(402),R=t.n(N),A=t(32),D=t.n(A),J=t(401),T=t.n(J),C=void 0===y.b||y.b.current.offsetWidth>800?500:240,W=void 0===y.b||y.b.current.offsetWidth>800?240:120,F=s.a.memo(function(e){Object(c.useEffect)(Object(r.a)(i.a.mark(function a(){var t,n,l,r,c,s,o,m,g;return i.a.wrap(function(a){for(;;)switch(a.prev=a.next){case 0:if("active"===b.status&&["admin","\u043e\u0440\u0433\u0430\u043d\u0438\u0437\u0430\u0442\u043e\u0440"].includes(b.role)||e.history.push("/"),-1!==u){a.next=20;break}return t=[],a.next=5,p.getDataSimple({name:"\u0420\u0435\u0433\u0438\u043e\u043d\u0418\u043c\u044f"});case 5:n=a.sent,l=0;case 7:if(!(l<n.length)){a.next=17;break}return r=[],a.next=11,p.getDataSimple({name:"\u0422\u043e\u0447\u043a\u0430\u041f\u043e\u0420\u0435\u0433\u0438\u043e\u043d\u0443",data:{region:n[l]}});case 11:for(c=a.sent,s=0;s<c.length;s++)r[s]={name:c[s],plan:0,current:0};t[l]={name:n[l],plan:0,current:0,points:r};case 14:l++,a.next=7;break;case 17:U(t),a.next=35;break;case 20:return a.next=22,p.getDataSimple({name:"\u041f\u043b\u0430\u043d\u041f\u043e\u0414\u0430\u0442\u0435",data:{date:d[u][0]}});case 22:if(o=a.sent,U(JSON.parse(o.regions)),w(o.date),_(o.norma),I(o.current),H(o._id),"\u043e\u0440\u0433\u0430\u043d\u0438\u0437\u0430\u0442\u043e\u0440"!==b.role){a.next=35;break}for(m=JSON.parse(o.regions),g=0;g<m.length;g++)J.region===m[g].name&&(_(JSON.parse(o.regions)[0].plan),I(JSON.parse(o.regions)[0].current));return a.next=33,p.getDataSimple({name:"\u041f\u0440\u043e\u0444\u0438\u043b\u044c"});case 33:o=a.sent,C(o);case 35:case"end":return a.stop()}},a,this)})),[]);var a=e.tableActions,t=a.setSelected,l=a.addData,o=a.setData,m=e.table,u=m.selected,d=m.data,g=e.classes,b=e.user.status,f=Object(c.useState)("2019-01-01"),y=Object(n.a)(f,2),O=y[0],w=y[1],N=Object(c.useState)({}),A=Object(n.a)(N,2),J=A[0],C=A[1],W=Object(c.useState)("2019-01-01"),F=Object(n.a)(W,2),M=F[0],H=F[1],L=Object(c.useState)(0),z=Object(n.a)(L,2),B=z[0],I=z[1],P=Object(c.useState)(0),q=Object(n.a)(P,2),Y=q[0],_=q[1],G=Object(c.useState)([]),K=Object(n.a)(G,2),Q=K[0],U=K[1];return s.a.createElement("div",null,s.a.createElement("br",null),s.a.createElement("br",null),-1===u?s.a.createElement(s.a.Fragment,null,s.a.createElement(x.a,{views:["year","month"],label:"\u0414\u0430\u0442\u0430",className:g.textField,value:O,onChange:w}),s.a.createElement("br",null)):s.a.createElement("div",{class:g.message},s.a.createElement("h3",null,O)),s.a.createElement("div",{className:g.message},s.a.createElement("div",{style:{display:"inline-block",marginRight:"10px",verticalAlign:"middle"}},"\u0426\u0435\u043b\u044c: ",s.a.createElement("div",{style:{display:"inline-block",fontWeight:"bold"}},Y)),s.a.createElement("div",{style:{display:"inline-block",marginRight:"10px",verticalAlign:"middle"}},"\u041f\u0440\u043e\u0433\u0440\u0435\u0441\u0441: ",s.a.createElement("div",{style:{display:"inline-block",fontWeight:"bold"}},B))),s.a.createElement("br",null),void 0!=Q&&Q.length>0?Q.map(function(e,a){if("admin"==b.role||"\u043e\u0440\u0433\u0430\u043d\u0438\u0437\u0430\u0442\u043e\u0440"==b.role&&J.region===e.name)return s.a.createElement(S.a,null,s.a.createElement(j.a,{expandIcon:s.a.createElement(T.a,null)},s.a.createElement(D.a,{className:g.heading},e.name),s.a.createElement(D.a,{className:g.secondaryHeading},"\u0426\u0435\u043b\u044c: ",s.a.createElement("b",{style:{color:"black"}},e.plan),"\xa0\xa0 \u041f\u0440\u043e\u0433\u0440\u0435\u0441\u0441: ",s.a.createElement("b",{style:{color:"black"}},e.current))),void 0!=e.points&&e.points.length>0?e.points.map(function(e,t){return s.a.createElement(R.a,null,s.a.createElement("center",{style:{width:"100%"}},s.a.createElement("b",null,e.name),s.a.createElement("br",null),s.a.createElement("div",{style:{width:"40px",marginRight:"10px",display:"inline-block",verticalAlign:"middle"}},"\u0426\u0435\u043b\u044c:"),s.a.createElement(h.a,{style:{marginTop:"12px",marginRight:"10px",width:"70px",display:"inline-block",verticalAlign:"middle"},type:"login",margin:"normal",value:e.plan,onChange:function(e){!function(e,a,t){var n=parseInt(e.target.value);Q[a].points[t].plan=isNaN(n)?0:n,Q[a].plan=0;for(var l=0;l<Q[a].points.length;l++)Q[a].plan+=Q[a].points[l].plan;n=0;for(var i=0;i<Q.length;i++)n+=Q[i].plan;U(Q),_(n)}(e,a,t)}}),s.a.createElement("div",{style:{display:"inline-block",marginRight:"10px",verticalAlign:"middle"}},"\u041f\u0440\u043e\u0433\u0440\u0435\u0441\u0441: ",s.a.createElement("div",{style:{display:"inline-block",fontWeight:"bold"}},e.current))))}):null)}):null,s.a.createElement("br",null),s.a.createElement("div",null,s.a.createElement(v.a,{className:"link",to:""},s.a.createElement(E.a,{variant:"contained",color:"primary",onClick:function(){-1===u?l({search:"",sort:"",page:0,name:"\u041f\u043b\u0430\u043d",data:{norma:Y,regions:JSON.stringify(Q),date:k.b[new Date(O).getMonth()]+" "+(1900+new Date(O).getYear())}}):o({id:M,search:"",sort:"",page:0,name:"\u041f\u043b\u0430\u043d",data:{norma:Y,regions:JSON.stringify(Q)}}),t(-1)},className:g.button},"\u0421\u043e\u0445\u0440\u0430\u043d\u0438\u0442\u044c")),s.a.createElement(v.a,{className:"link",to:"",onClick:function(){t(-1)}},s.a.createElement(E.a,{variant:"contained",color:"secondary",className:g.button},"\u041e\u0442\u043c\u0435\u043d\u0430"))))});Event.propTypes={classes:m.a.object.isRequired},a.default=Object(u.withStyles)(function(e){return{button:{margin:e.spacing.unit},textFieldSmall:{display:"inline-block",marginLeft:e.spacing.unit,marginRight:e.spacing.unit,width:W},textField:{marginLeft:e.spacing.unit,marginRight:e.spacing.unit,width:C},urls:{margin:e.spacing.unit,width:C,maxHeight:100,overflow:"auto"},message:{width:C,marginTop:e.spacing.unit,marginBottom:e.spacing.unit,marginLeft:"calc((100% - "+C+"px)/2)",marginRight:"calc((100% - "+C+"px)/2)"},MuiPickersToolbar:{toolbar:{backgroundColor:"#000"}},MuiPickersModal:{dialogAction:{color:"#000"}},heading:{fontSize:e.typography.pxToRem(15),flexBasis:"33.33%",flexShrink:0},secondaryHeading:{fontSize:e.typography.pxToRem(15),color:e.palette.text.secondary}}})(Object(d.b)(function(e){return{user:e.user,table:e.table}},function(e){return{tableActions:Object(g.b)(p,e)}})(F))}}]);
//# sourceMappingURL=7.bb0f7e25.chunk.js.map