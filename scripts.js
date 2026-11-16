(function(){
  var racine=document.documentElement,bouton=document.getElementById('langue');
  function regler(l){
    racine.setAttribute('data-lang',l);racine.setAttribute('lang',l);
    bouton.textContent=l==='fr'?'EN':'FR';
    bouton.setAttribute('aria-label',l==='fr'?'Switch to English':'Passer au français');
    var t=document.body.getAttribute('data-titre-'+l);if(t)document.title=t;
  }
  var choix=null;
  try{choix=localStorage.getItem('langue')}catch(e){}
  if(!choix){choix=/^fr/i.test(navigator.language||'fr')?'fr':'en'}
  regler(choix);
  bouton.addEventListener('click',function(){
    var l=racine.getAttribute('data-lang')==='fr'?'en':'fr';regler(l);
    try{localStorage.setItem('langue',l)}catch(e){}
  });

  /* Filtres des publications */
  var boutons=document.querySelectorAll('.filtres button'),refs=document.querySelectorAll('#refs li');
  boutons.forEach(function(b){b.addEventListener('click',function(){
    var f=b.getAttribute('data-filtre');
    boutons.forEach(function(x){x.setAttribute('aria-pressed',x===b?'true':'false')});
    var n=0;refs.forEach(function(li){var v=(f==='tout'||li.getAttribute('data-type')===f);li.hidden=!v;if(v)n++});
    var c=document.getElementById('compte');if(c)c.textContent=n;
  })});

  /* Section active dans la navigation */
  var liens=document.querySelectorAll('.liens a');
  if('IntersectionObserver' in window){
    var obs=new IntersectionObserver(function(es){es.forEach(function(e){
      if(e.isIntersecting){liens.forEach(function(a){a.setAttribute('aria-current',a.getAttribute('href')==='#'+e.target.id?'true':'false')})}
    })},{rootMargin:'-40% 0px -55% 0px'});
    document.querySelectorAll('main section[id]').forEach(function(s){obs.observe(s)});
  }

  /* Courbes de niveau de l'ouverture, calculées à partir d'un relief fictif */
  var svg=document.getElementById('relief');if(!svg)return;var L=1600,H=900,nx=128,ny=72;
  function h(i,j){var s=Math.sin(i*127.1+j*311.7)*43758.5453;return s-Math.floor(s)}
  function lisse(t){return t*t*(3-2*t)}
  function bruit(x,y){var i=Math.floor(x),j=Math.floor(y),u=lisse(x-i),v=lisse(y-j);
    return (h(i,j)*(1-u)+h(i+1,j)*u)*(1-v)+(h(i,j+1)*(1-u)+h(i+1,j+1)*u)*v}
  function alt(x,y){
    var n=bruit(x*3.2,y*2.2)*.55+bruit(x*7,y*5+9)*.22+bruit(x*14+3,y*11)*.08;
    var dx=x-.8,dy=(y-.5)*.62,sommet=Math.exp(-(dx*dx+dy*dy)*9)*.75;
    var bx=x-.18,by=(y-1.05)*.6,butte=Math.exp(-(bx*bx+by*by)*14)*.35;
    return n+sommet+butte}
  var g=[],i,j;
  for(j=0;j<=ny;j++){g[j]=[];for(i=0;i<=nx;i++){g[j][i]=alt(i/nx,j/ny)}}
  function coupe(a,b,n){return (n-a)/(b-a)}
  var niveaux=17,html='',k;
  for(k=0;k<niveaux;k++){
    var n=.22+k*.075,d='';
    for(j=0;j<ny;j++){for(i=0;i<nx;i++){
      var a=g[j][i],b=g[j][i+1],c=g[j+1][i+1],e=g[j+1][i],p=[];
      if((a<n)!==(b<n))p.push([i+coupe(a,b,n),j]);
      if((b<n)!==(c<n))p.push([i+1,j+coupe(b,c,n)]);
      if((e<n)!==(c<n))p.push([i+coupe(e,c,n),j+1]);
      if((a<n)!==(e<n))p.push([i,j+coupe(a,e,n)]);
      for(var q=0;q+1<p.length;q+=2){
        d+='M'+(p[q][0]/nx*L).toFixed(1)+' '+(p[q][1]/ny*H).toFixed(1)+'L'+(p[q+1][0]/nx*L).toFixed(1)+' '+(p[q+1][1]/ny*H).toFixed(1);
      }
    }}
    var m=k%4===0;
    html+='<path'+(m?' class="maitresse"':'')+' style="--o:'+(m?.26:.15)+';animation-delay:'+(k*70)+'ms" d="'+d+'"/>';
  }
  svg.innerHTML=html;
})();
