let patches=[],editId=null;
const $=id=>document.getElementById(id);
async function load(){const r=await fetch("/api/patches");patches=await r.json();render();}
function badge(v){return `<span class="badge ${String(v).toLowerCase().replaceAll(" ","-")}">${v}</span>`}
function render(){
$("total").textContent=patches.length;
$("pending").textContent=patches.filter(p=>p.testing==="Pending").length;
$("tested").textContent=patches.filter(p=>p.testing==="Tested").length;
$("deployed").textContent=patches.filter(p=>p.deployment==="Deployed").length;
let q=$("search").value.toLowerCase(),f=$("filter").value;
let rows=patches.filter(p=>(p.id+" "+p.software+" "+p.version+" "+p.priority+" "+p.testing+" "+p.deployment).toLowerCase().includes(q)&&(f==="All"||p.testing===f||p.deployment===f));
$("table").innerHTML=rows.map(p=>`<tr><td class="id">${p.id}</td><td><b>${p.software}</b></td><td>${p.version}</td><td>${badge(p.priority)}</td><td>${badge(p.testing)}</td><td>${badge(p.deployment)}</td><td>${p.date||"-"}</td><td><button class="secondary" onclick="editPatch('${p.id}')">Edit</button> <button class="secondary" onclick="deletePatch('${p.id}')">Delete</button></td></tr>`).join("");
}
function reset(){editId=null;$("form").reset();$("date").value=new Date().toISOString().slice(0,10);$("formTitle").textContent="Add New Patch";$("id").disabled=false;location.hash="add";}
function editPatch(id){let p=patches.find(x=>x.id===id);if(!p)return;editId=id;$("id").value=p.id;$("software").value=p.software;$("version").value=p.version;$("priority").value=p.priority;$("testing").value=p.testing;$("deployment").value=p.deployment;$("date").value=p.date;$("description").value=p.description||"";$("id").disabled=true;$("formTitle").textContent="Edit Patch";location.hash="add";window.scrollTo({top:$("add").offsetTop,behavior:"smooth"});}
async function deletePatch(id){if(!confirm("Delete this patch?"))return;await fetch("/api/patches/"+encodeURIComponent(id),{method:"DELETE"});load();}
$("form").addEventListener("submit",async e=>{e.preventDefault();let data={id:$("id").value,software:$("software").value,version:$("version").value,priority:$("priority").value,testing:$("testing").value,deployment:$("deployment").value,date:$("date").value,description:$("description").value};let url=editId?"/api/patches/"+encodeURIComponent(editId):"/api/patches";let r=await fetch(url,{method:editId?"PUT":"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(data)});let x=await r.json();if(!r.ok)return alert(x.message);alert(editId?"Patch updated!":"Patch added!");reset();load();location.hash="patches";});
$("search").addEventListener("input",render);$("filter").addEventListener("change",render);$("clear").addEventListener("click",reset);$("addTop").addEventListener("click",reset);$("date").value=new Date().toISOString().slice(0,10);load();