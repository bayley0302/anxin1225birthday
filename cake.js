(() => {
  const canvas = document.querySelector('.cake canvas');
  const ctx = canvas.getContext('2d');
  let seed = 2512;
  const random = () => {
    seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
    return seed / 4294967296;
  };
  function ellipse(x,y,rx,ry,colors) {
    const fill = ctx.createLinearGradient(0,y-ry,0,y+ry);
    colors.forEach((color,i) => fill.addColorStop(i/(colors.length-1),color));
    ctx.fillStyle = fill;
    ctx.beginPath();
    ctx.ellipse(x,y,rx,ry,0,0,Math.PI*2);
    ctx.fill();
  }
  function frosting(y, width, topWidth, height) {
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(300-topWidth,y-height);
    ctx.quadraticCurveTo(300,y-height-50,300+topWidth,y-height);
    ctx.bezierCurveTo(300+topWidth+20,y-height*.5,300+width,y-48,300+width,y);
    ctx.bezierCurveTo(300+width,y+75,300-width,y+75,300-width,y);
    ctx.bezierCurveTo(300-width,y-48,300-topWidth-20,y-height*.5,300-topWidth,y-height);
    ctx.clip();
    ellipse(300,y-height*.45,width+30,height+100,['#e0e3af','#b8bf78','#6d7541']);
    for (let i=-9;i<=9;i++) {
      const ratio=i/9;
      const x=300+ratio*width;
      const base=y+43*(1-ratio*ratio);
      const topX=300+ratio*topWidth;
      const color=ctx.createLinearGradient(x-width/14,0,x+width/12,0);
      const light=65+Math.round(random()*7);
      color.addColorStop(0,'#777e45');
      color.addColorStop(.35,`hsl(66 33% ${light+10}%)`);
      color.addColorStop(.7,`hsl(65 32% ${light}%)`);
      color.addColorStop(1,'#8d9556');
      ctx.beginPath();ctx.moveTo(topX,y-height-14);
      ctx.bezierCurveTo(topX+ratio*10,y-height*.56,x-6,y-24,x,base+random()*7);
      ctx.strokeStyle=color;ctx.lineWidth=width/7;ctx.lineCap='round';ctx.stroke();
    }
    for(let i=0;i<2100;i++){
      const x=300-width+random()*width*2,yDot=y-height-15+random()*(height+60);
      ctx.fillStyle=random()>.36?'#fff8dd66':'#42391228';
      ctx.fillRect(x,yDot,1+random()*2,1+random()*1.5);
    }
    ctx.restore();
    for(let i=0;i<11;i++){
      const q=(i-5)/5.4;
      ellipse(300+q*width,y+40*(1-q*q),width/10,12+random()*6,['#e3e1ae','#b0b777','#85894c']);
    }
  }
  function berry(x,y,s,angle) {
    ctx.save();
    ctx.translate(x,y);ctx.rotate(angle);ctx.scale(s,s);
    ctx.beginPath();
    ctx.moveTo(0,-35);ctx.bezierCurveTo(11,-39,28,-13,28,9);
    ctx.bezierCurveTo(28,40,-28,40,-27,10);
    ctx.bezierCurveTo(-26,-7,-10,-34,0,-35);
    const fill=ctx.createRadialGradient(-12,-18,2,6,4,43);
    fill.addColorStop(0,'#ef7668');fill.addColorStop(.55,'#b6292d');fill.addColorStop(1,'#731923');
    ctx.shadowColor='#46312770';ctx.shadowBlur=8;ctx.shadowOffsetY=5;
    ctx.fillStyle=fill;ctx.fill();ctx.clip();ctx.shadowColor='transparent';
    for(let i=0;i<160;i++){
      const sx=random()*57-29, sy=random()*65-35;
      ctx.fillStyle=sy<-13||random()<.48?'#fff9e8b0':'#efb17b';
      ctx.fillRect(sx,sy,1+random()*2,1+random()*3);
    }
    ctx.restore();
  }
  function cane(x,y,s,angle) {
    ctx.save();ctx.translate(x,y);ctx.rotate(angle);ctx.scale(s,s);
    const path=new Path2D();
    path.moveTo(0,38);path.lineTo(0,-9);path.bezierCurveTo(0,-34,31,-33,31,-10);
    ctx.lineWidth=14;ctx.lineCap='round';ctx.strokeStyle='#fcf5dd';ctx.stroke(path);
    ctx.lineCap='butt';ctx.setLineDash([9,9]);ctx.strokeStyle='#ac2637';ctx.stroke(path);
    ctx.restore();
  }
  ellipse(300,555,281,51,['#fff','#c7c6bd']);
  ellipse(300,548,270,41,['#ecece3','#fff','#e0dfd4']);
  frosting(511,235,95,148);
  berry(97,490,.81,.48);berry(165,519,.96,.24);berry(310,538,1.04,-.06);berry(486,499,.89,-.39);
  cane(399,517,1.17,-.23);
  frosting(392,181,69,145);
  berry(155,390,.81,.44);berry(242,420,.91,.14);berry(403,406,.91,-.31);
  cane(343,390,.88,.17);
  frosting(273,120,29,144);
  berry(211,265,.68,.48);berry(382,268,.74,-.38);
  cane(280,287,.69,-.31);
  for(let x=265;x<=335;x+=14) ellipse(x,138,15,10,['#fff9d9','#d1be8f']);
  berry(300,111,.93,.04);
})();
