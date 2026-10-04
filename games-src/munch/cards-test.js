// temporary test deck (replaced by the real card table)
const TRAITNAME={human:'Human',elf:'Elf',dwarf:'Dwarf',halfling:'Halfling',warrior:'Warrior',wizard:'Wizard',thief:'Thief',cleric:'Cleric'};
const EXPS=[];
const RULES_HTML='<p>Test rules.</p>';
const CARDS=[];
for(let i=1;i<=20;i++)CARDS.push({k:'mon'+i,d:'door',t:'monster',n:'Test Monster '+i,lvl:i,tr:Math.ceil(i/4),lv:i>=16?2:1,x:'',badt:'lose a level',bad:i>=18?[['death']]:[['lvl',i>10?2:1]],cp:2});
['elf','dwarf','halfling'].forEach(r=>CARDS.push({k:'r_'+r,d:'door',t:'race',race:r,n:TRAITNAME[r],x:'',cp:3}));
['warrior','wizard','thief','cleric'].forEach(r=>CARDS.push({k:'c_'+r,d:'door',t:'class',cls:r,n:TRAITNAME[r],x:'',cp:3}));
for(let i=0;i<6;i++)CARDS.push({k:'cu'+i,d:'door',t:'curse',n:'Test Curse '+i,x:'Lose a level.',ops:[['lvl',1]]});
CARDS.push({k:'enh1',d:'door',t:'enh',n:'Enraged',b:5,trb:1,x:'+5 to monster',cp:2},{k:'enh2',d:'door',t:'enh',n:'Baby',b:-5,trb:-1,x:'-5',cp:2},{k:'wan',d:'door',t:'special',sp:'wander',n:'Wandering',x:'',cp:3},{k:'half',d:'door',t:'special',sp:'half',n:'Mixed Heritage',x:'',cp:2},{k:'sup',d:'door',t:'special',sp:'super',n:'Super',x:'',cp:2},{k:'div',d:'door',t:'special',sp:'divine',n:'Divine',x:''});
[['head',1,400],['armor',2,400],['foot',1,400],['1h',2,400,1],['2h',4,600,2],['big',3,600,2,1]].forEach(([s,b,g,h,big],i)=>CARDS.push({k:'it'+i,d:'tr',t:'item',slot:s==='1h'||s==='2h'||s==='big'?'hand':s,hands:h||0,big:!!big,b,g,n:'Item '+s,x:'',cp:4}));
CARDS.push({k:'os1',d:'tr',t:'oneshot',b:2,g:100,n:'Potion +2',x:'',cp:6,cb:1},{k:'os2',d:'tr',t:'oneshot',b:3,g:200,n:'Potion +3',x:'',cp:4},{k:'poly',d:'tr',t:'oneshot',sp:'poly',g:1300,n:'Poly',x:''},{k:'flee',d:'tr',t:'oneshot',sp:'flee',g:200,n:'Flee',x:''},{k:'dbl',d:'tr',t:'oneshot',sp:'dbl',g:300,n:'Double',x:''},{k:'inv',d:'tr',t:'oneshot',sp:'invis',g:200,n:'Invis',x:''},{k:'lv',d:'tr',t:'level',n:'Level',x:'',cp:9});
const DEF={};for(const c of CARDS)DEF[c.k]=c;
