var j;
var me = 232772;
async function load() {
  loadLnk();
  msgs.innerText = "Downloading history...";
  // let f = await fetch("all.json");
  let req = new XMLHttpRequest();
  req.onload = async () => {
    msgs.innerText = "Parsing JSON..."; await new Promise(r=>setTimeout(r, 0));
    j = JSON.parse(req.responseText);
    msgs.innerText = "Preparing data..."; await new Promise(r=>setTimeout(r, 0));
    j.forEach(c=>{
      c.userLower = c.username.toLowerCase()
      c.htmlLower = c.html.toLowerCase()
      if (c.replyID!=-1) {
        c.html = `<a href="https://chat.stackexchange.com/transcript/52405?m=${c.replyID}#${c.replyID}" class="reply"> </a>${c.html}`
        c.htmlLower = `:${c.replyID} ${c.htmlLower}`;
      }
      c.date = new Date(c.time*1000);
    });
    msgs.innerText = "Sorting..."; await new Promise(r=>setTimeout(r, 0));
    j.sort((a,b)=>b.date-a.date);
    msgs.innerText = "Searching..."; await new Promise(r=>setTimeout(r, 0));
    upd();
  };
  req.open("GET", "all.json");
  req.send();
}

var matched;
function upd() {
  if (!j) return;
  matched = j;
  if (usr.value) {
    if (/^[0-9-]+$/.test(usr.value)) {
      let test = +usr.value;
      matched = j.filter(c=>c.userID == test);
    } else {
      let test = usr.value.toLowerCase();
      matched = j.filter(c=>c.userLower.includes(test));
    }
  }
  if (txt.value) { // a&b|c&d
    let exp = txt.value.toLowerCase();
    if (exp[0]!=' ') {
      let ands = [];
      let ors = [];
      let curr="";
      let i = 0;
      while (i<exp.length) {
        let c = exp[i++];
        if (c=='\\') curr+= exp[i++];
        else if (c=='&') { ands.push(curr); curr=""; }
        else if (c=='|') { ands.push(curr); curr=""; ors.push(ands); ands = []; }
        else curr+= c;
      }
      ands.push(curr); ors.push(ands);
      console.log(ors);
      ors = ors.filter(c=>c.length).map(c=>c.filter(k=>k.length));
      matched = matched.filter(c=>ors.some(ands => ands.every(k=>c.htmlLower.includes(k))));
    } else {
      exp = exp.substring(1);
      matched = matched.filter(c=>c.htmlLower.includes(exp));
    }
  }
  pam = ((matched.length-1)/psz|0)+1;
  page = 0;
  render();
}

var page = 0;
var psz = 100;
var pam = 0;
function render() {
  let arrows = `<div style="padding:8px 0px 5px 0px">
  <a class="arr" href="javascript:0" onclick="p(-9e9)">«</a>
  <a class="arr" href="javascript:0" onclick="p(  -1)">&lt;</a>
  <a class="arr" href="javascript:0" onclick="p(   1)">&gt;</a>
  <a class="arr" href="javascript:0" onclick="p( 9e9)">»</a></div>`;
  let res = `${arrows}Page ${page+1} of ${pam}; ${matched.length} found <span style="width:30px"></div>`;
  for (let i = page*psz; i < Math.min((page+1)*psz, matched.length); i++) {
    let m = matched[i];
    res+= `
<div class="msg">
 <div class="user"><a href="https://chat.stackexchange.com/users/${m.userID}">${m.username}</a></div>
 <div class="mcont fr${me==m.userID?" me":""}">
  <div class="fc"><a class="opt" href="https://chat.stackexchange.com/transcript/52405?m=${m.msgID}#${m.msgID}"></a></div>
  <div class="fc" style="width:100%;max-width:98%;min-width:98%"><div>
   <div class="time" title="${m.date}">${df(m.date)}</div>
   <div class="src">${m.html==""? '<span class="removed">(removed)</span>' : m.html}</div>
  </div></div>
 </div>
</div>`;
  }
  msgs.innerHTML = res+"<br>"+arrows;
}

function p(d) {
  page+= d;
  if (page>=pam) page = pam-1;
  if (page < 0) page = 0;
  render();
}

let dateNow = new Date();
function df(d) {
  let [wd, mo, dy, yr, tm] = (d+"").split(' ');
  tm = tm.substring(0,tm.length-3);
  if (d.getFullYear() == dateNow.getFullYear()) return `${mo} ${dy} ${tm}`;
  else return `${mo} ${dy} '${yr.substr(2)} ${tm}`
}





function saveLnk(copyLink = false) {
  let b64 = "#s"+enc(txt.value)+"#"+enc(usr.value);
  history.pushState({}, "", b64);
  if (copyLink) copy(location.href.replace("/#", "#"));
}
function loadLnk() {
  let hash = decodeURIComponent(location.hash.slice(1));
  let t = hash[0];
  if (t=='s') {
    let [te, ue] = hash.slice(1).split("#");
    txt.value = dec(te);
    usr.value = dec(ue);
    upd();
  }
}
window.onload=load;
window.onhashchange=loadLnk;

function enc(str) {
  if (!str) return str;
  let bytes = new TextEncoder("utf-8").encode(str);
  return arrToB64(deflate(bytes));
}
function dec(str) {
  if (!str) return str;
  try {
    return new TextDecoder("utf-8").decode(inflate(b64ToArr(str)));
  } catch (e) {
    return "failed to decode - full link not copied?";
  }
}

function arrToB64(arr) {
  var bytestr = "";
  arr.forEach(c => bytestr+= String.fromCharCode(c));
  return btoa(bytestr).replace(/\+/g, "@").replace(/=+/, "");
}
function b64ToArr(str) {
  return new Uint8Array([...atob(decodeURIComponent(str).replace(/@/g, "+"))].map(c=>c.charCodeAt()))
}

function deflate(arr) {
  return pako.deflateRaw(arr, {"level": 9});
}
function inflate(arr) {
  return pako.inflateRaw(arr);
}