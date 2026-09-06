import { firebaseConfig } from './firebase-config.js';
let ctx=null;
export async function initFirebase(){
  if(ctx) return ctx;
  const appMod=await import('https://www.gstatic.com/firebasejs/12.2.1/firebase-app.js');
  const dbMod=await import('https://www.gstatic.com/firebasejs/12.2.1/firebase-database.js');
  const app=appMod.initializeApp(firebaseConfig);
  const db=dbMod.getDatabase(app);
  ctx={app,db,dbMod};
  return ctx;
}
const path='oabFocus/manasses/state';
export async function loadCloud(){const c=await initFirebase();const s=await c.dbMod.get(c.dbMod.ref(c.db,path));return s.exists()?s.val():null;}
export async function saveCloud(state){const c=await initFirebase();await c.dbMod.set(c.dbMod.ref(c.db,path),{...state,cloudUpdatedAt:new Date().toISOString()});}
export async function clearCloud(){const c=await initFirebase();await c.dbMod.remove(c.dbMod.ref(c.db,path));}
