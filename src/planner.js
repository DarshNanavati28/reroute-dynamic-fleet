const names=['Depot','North Market','Riverside Clinic','West Warehouse','Hilltop School','East Pharmacy','South Hub','Lakeview Store'];
const matrix=[[0,18,24,15,29,34,22,31],[18,0,13,17,14,22,28,19],[24,13,0,26,12,18,21,17],[15,17,26,0,23,25,11,19],[29,14,12,23,0,16,25,10],[34,22,18,25,16,0,20,14],[22,28,21,11,25,20,0,18],[31,19,17,19,10,14,18,0]];
const deliveries=[
{id:'DL-1042',customer:'Northside Fresh',location:'North Market',size:18,windowStart:510,windowEnd:660,service:12,priority:'Standard',status:'planned'},
{id:'DL-1043',customer:'Mercy Clinic',location:'Riverside Clinic',size:12,windowStart:540,windowEnd:630,service:18,priority:'Urgent',status:'planned'},
{id:'DL-1044',customer:'Cedar Supply',location:'West Warehouse',size:24,windowStart:510,windowEnd:720,service:12,priority:'Standard',status:'planned'},
{id:'DL-1045',customer:'Hilltop School',location:'Hilltop School',size:15,windowStart:570,windowEnd:690,service:15,priority:'Standard',status:'planned'},
{id:'DL-1046',customer:'Beacon Pharmacy',location:'East Pharmacy',size:10,windowStart:540,windowEnd:660,service:12,priority:'Standard',status:'planned'},
{id:'DL-1047',customer:'Southbank Grocers',location:'South Hub',size:20,windowStart:510,windowEnd:700,service:15,priority:'Standard',status:'planned'},
{id:'DL-1048',customer:'Lakeside Market',location:'Lakeview Store',size:14,windowStart:585,windowEnd:720,service:12,priority:'Standard',status:'planned'},
{id:'DL-1049',customer:'Nora Patel',location:'North Market',size:6,windowStart:570,windowEnd:615,service:10,priority:'Urgent',status:'planned'}
];
const vehicles=[{id:'V-01',name:'Sprinter 01',capacity:42,color:'#557ae7'},{id:'V-02',name:'Cargo van 02',capacity:38,color:'#27a889'},{id:'V-03',name:'Box truck 03',capacity:48,color:'#e99a4c'}];
const initial={depot:'Depot',startTime:480,locations:names,travelTimes:matrix,vehicles,deliveries};
const clone=x=>JSON.parse(JSON.stringify(x));
const timeLabel=m=>`${String(Math.floor(m/60)%24).padStart(2,'0')}:${String(m%60).padStart(2,'0')}`;
function routeAll(state,disruptions=[]){
 const unassigned=[...state.deliveries.filter(d=>d.status!=='completed')].sort((a,b)=>a.windowEnd-b.windowEnd || (a.priority==='Urgent'?-1:1));
 const routes=state.vehicles.map(v=>({vehicle:v,stops:[],time:state.startTime,location:0,load:0,failedAt:null}));
 const failedAt=new Map(disruptions.filter(x=>x.type==='failure').map(x=>[x.vehicleId,Math.min(...disruptions.filter(y=>y.type==='failure'&&y.vehicleId===x.vehicleId).map(y=>y.time))]));
 const fixed=state.deliveries.filter(d=>d.status==='completed');
 for(const r of routes){const locked=fixed.filter(d=>d.vehicleId===r.vehicle.id).sort((a,b)=>(a.completedAt||a.serviceStart||0)-(b.completedAt||b.serviceStart||0));r.stops=locked;r.load=locked.reduce((n,d)=>n+d.size,0);r.location=locked.length?state.locations.indexOf(locked.at(-1).location):0;r.time=locked.length?Math.max(...locked.map(d=>d.completedAt||((d.serviceStart||state.startTime)+d.service))):state.startTime;r.failedAt=failedAt.get(r.vehicle.id)??null;}
 const reasons={};
 for(const d of unassigned){let best=null;
  for(const r of routes){if(r.failedAt!==null&&r.failedAt<=r.time)continue;if(r.load+d.size>r.vehicle.capacity)continue;
   const to=state.locations.indexOf(d.location),from=state.locations[r.location];if(to<0||from===undefined)continue;
   const closure=disruptions.filter(x=>x.type==='closure'&&((x.from===from&&x.to===d.location)||(x.to===from&&x.from===d.location))&&r.time>=x.start&&r.time<x.end).reduce((n,x)=>n+x.extraMinutes,0);
   const travel=(state.travelTimes[from?state.locations.indexOf(from):0]?.[to]??Infinity)+closure;
   const arrival=r.time+travel,serviceStart=Math.max(arrival,d.windowStart);if(serviceStart>d.windowEnd)continue;
   if(r.failedAt!==null&&serviceStart>=r.failedAt)continue;
   const score=serviceStart-r.time+d.service+r.stops.length*4;if(!best||score<best.score)best={r,travel,arrival,serviceStart,score};
  }
  if(best){const {r,travel,arrival,serviceStart}=best;r.stops.push({...d,vehicleId:r.vehicle.id,departureFrom:state.locations[r.location],travel,arrival,wait:serviceStart-arrival,serviceStart,depart:serviceStart+d.service,loadAfter:r.load+d.size});r.time=serviceStart+d.service;r.location=state.locations.indexOf(d.location);r.load+=d.size;
  }else{reasons[d.id]=d.size>Math.max(...state.vehicles.map(v=>v.capacity))?'Delivery exceeds every available vehicle capacity':failedAt.size?'No feasible vehicle remains before capacity or time-window limits (failed vehicles are excluded)':'No feasible vehicle and time-window slot remains';}
 }
 return {routes,unassigned:unassigned.filter(d=>!routes.some(r=>r.stops.some(s=>s.id===d.id))),reasons};
}
export {names,matrix,deliveries,vehicles,initial,clone,timeLabel,routeAll};
