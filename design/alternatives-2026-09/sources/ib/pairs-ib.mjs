import { cr, mix } from "./contrast.mjs";
const P0="#FCFAF4",P1="#EBE5D7",P2="#E1D9C6",I="#1D1812",G="#564E41",RD="#A32E1F",RA="#CC3E2B",R="#D2402C",U="#1D3F8F",O="#D99A2B",N="#15110D",A="#F0B43C",W="#F3D9D2",C9="#C9BFAE",NF="#231D16",NT="#F3EFE4",NB="#FF6A52";
const rows=[
["papier-0 / rouge d'action (bandeau Tour, chapeau)",P0,RA],
["rouge profond / papier-0 (pastille active)",RD,P0],
["papier-0 / outremer (bandeau moteur)",P0,U],
["outremer / papier-0 (texte)",U,P0],
["outremer / papier-1 (texte)",U,P1],
["encre / ocre (bandeau jeu)",I,O],
["ocre / papier-1 (marque)",O,P1],
["papier-0 / encre (bandeau ib-ink)",P0,I],
["rouge route / encre (picto ib-ink)",R,I],
["rouge d'action / encre",RA,I],
["rouge #E0523C / encre",'#E0523C',I],
["sépia / papier-0 (légende profil)",G,P0],
["rouge profond / papier-0 (Ret. HC)",RD,P0],
["rouge route / papier-0 (tracé HC)",R,P0],
["rouge route / lavis rouge (tracé sur col)",R,W],
["encre / papier-0",I,P0],
["encre / papier-2 (aplat profil)",I,P2],
["ambre / nuit (légende hub)",A,N],
["ambre / #231D16 (aplat de col de nuit)",A,NF],
["crème / nuit",NT,N],
["#C9BFAE / nuit",C9,N],
["ocre / nuit (col ouvert)",O,N],
["encre / ambre (drapeau 3)",N,A],
["papier-0 / outremer 14 % sur papier-0 (secteur chrono)",I,mix(U,P0,.14)],
];
for (const [n,a,b] of rows) console.log(n.padEnd(52), a, b, cr(a,b).toFixed(2));
