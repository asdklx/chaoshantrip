(() => {
  'use strict';
  const $ = id => document.getElementById(id);
  const places = window.TRIP_PLACES;
  const plan = window.TRIP_PLAN;
  const escape = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const STORE_KEY = 'chaoshan-trip-v2';
  const defaults = {day:'d1',mode:'relaxed',nanxi:true,view:'planner',filter:'all',routeVariant:'',saved:[],checks:[],skipped:[]};
  let state = {...defaults};
  try {
    const old = JSON.parse(localStorage.getItem(STORE_KEY) || 'null');
    if (old && typeof old === 'object') {
      for (const [key, values] of Object.entries({day:['arrival','d1','d2','d3'],mode:['relaxed','outdoor','rain'],view:['planner','explore','prepare'],filter:['all','puning','north','jieyang','food','saved']})) if(values.includes(old[key])) state[key]=old[key];
      if(typeof old.routeVariant==='string') state.routeVariant=old.routeVariant;
      for(const key of ['saved','checks','skipped']) if(Array.isArray(old[key])) state[key]=old[key].filter(x=>typeof x==='string');
      state.nanxi=old.nanxi===true;
    }
  } catch (_) { /* A private browser can disable storage; the planner still works. */ }
  let selected = 'home';
  let cityDetail = false;
  let toastTimeout;
  let mapProjection, mapZoom, mapTransform, mapWidth=600, mapHeight=390;
  const svg = d3.select('#route-map');
  const scene = svg.append('g');
  const save = () => {try {localStorage.setItem(STORE_KEY,JSON.stringify(state));} catch (_) {}};
  // A place can have an exact `coords` value or a deliberately approximate
  // `mapCoords`/`visualCoords` value. The latter keeps the planner useful for
  // places whose precise entrance or branch still needs to be confirmed in
  // Amap, while allowing the route and saved markers to remain visible.
  const visualCoords = id => {
    const p=places[id];
    if(!p)return null;
    const c=p.coords || p.mapCoords || p.visualCoords;
    return Array.isArray(c)&&c.length===2&&c.every(v=>Number.isFinite(Number(v)))?[Number(c[0]),Number(c[1])]:null;
  };
  const hasExactCoords = id => Array.isArray(places[id]?.coords) && places[id].coords.length===2;
  const searchLink = id => {const p=places[id];return `https://uri.amap.com/search?keyword=${encodeURIComponent(p.query || p.name)}&city=${encodeURIComponent(p.area==='shenzhen'?'深圳':'揭阳')}&view=map&src=chaoshan-trip`;};
  const baiduSearch = id => `https://api.map.baidu.com/place/search?query=${encodeURIComponent(places[id].query || places[id].name)}&region=${encodeURIComponent(places[id].area==='shenzhen'?'深圳':'揭阳')}&output=html&src=webapp.chaoshan.trip`;
  const routePoint = id => {const p=places[id];return p.coords && !['home','hotel','mountain'].includes(id)?`latlng:${p.coords[1]},${p.coords[0]}|name:${p.query||p.name}`:p.query||p.name;};
  const routeLink = (from,to,mode='driving') => `https://api.map.baidu.com/direction?origin=${encodeURIComponent(routePoint(from))}&destination=${encodeURIComponent(routePoint(to))}&mode=${mode}&region=${encodeURIComponent(places[from].area==='shenzhen'?'深圳':'揭阳')}&coord_type=wgs84&output=html&src=webapp.chaoshan.trip`;
  // Amap's public URI scheme opens a real car route with live traffic and
  // turn-by-turn directions. Coordinates are only sent for verified points;
  // area anchors fall back to a named search so the traveller can confirm the
  // entrance before starting navigation.
  const amapPoint = id => {
    const p=places[id], c=hasExactCoords(id)?p.coords:null;
    return c ? `${c[0]},${c[1]},${encodeURIComponent(p.query||p.name)}` : encodeURIComponent(p.query||p.name);
  };
  const amapRouteLink = (from,to,via=[]) => {
    const a=places[from], b=places[to], ac=hasExactCoords(from), bc=hasExactCoords(to);
    if(!ac || !bc) return searchLink(to);
    const viaPart=via.filter(hasExactCoords).map(amapPoint).join(';');
    return `https://uri.amap.com/navigation?from=${amapPoint(from)}&to=${amapPoint(to)}${viaPart?`&via=${viaPart}`:''}&mode=car&coordinate=wgs84&callnative=0`;
  };

  /*
   * The overview map is deliberately a road-corridor illustration rather
   * than a straight point-to-point connector. Each preset contains optional
   * intermediate road waypoints, and its links open the live Amap/Baidu route.
   * This makes the choice explicit while avoiding a false promise that a
   * static map can know National Day traffic or temporary road controls.
   */
  const ROUTE_PRESETS = {
    arrival: [
      {id:'arrival-direct',label:'普宁站 → 御景城',note:'夜间接站后直接回家',points:['puning-station','home'],via:{'puning-station>home':[[116.186,23.286],[116.178,23.303],[116.166,23.316]]}},
    ],
    d1: [
      {id:'d1-city',label:'人民公园顺路',note:'接站 → 御景城 → 人民公园 → 御景城 → 酒店',points:['puning-station','home','park','home','hotel'],via:{'puning-station>home':[[116.186,23.286],[116.178,23.303],[116.166,23.316]],'home>park':[[116.159,23.309],[116.164,23.303]],'park>home':[[116.164,23.303],[116.159,23.309]],'home>hotel':[[116.171,23.344],[116.193,23.381],[116.207,23.417],[116.212,23.431]]}},
      {id:'d1-rest',label:'直接入住德安里',note:'接站 → 御景城 → 酒店，下午少绕行',points:['puning-station','home','hotel'],via:{'puning-station>home':[[116.186,23.286],[116.178,23.303],[116.166,23.316]],'home>hotel':[[116.171,23.344],[116.193,23.381],[116.207,23.417],[116.212,23.431]]}},
    ],
    d2: [
      {id:'d2-water-temple',label:'水乡＋南岩',note:'德安里 → 南溪水乡 → 南岩古寺 → 御景城',points:['hotel','nanxi','nanyan','home'],via:{'hotel>nanxi':[[116.216,23.428],[116.227,23.414],[116.237,23.401]],'nanxi>nanyan':[[116.242,23.400],[116.248,23.406]],'nanyan>home':[[116.245,23.404],[116.229,23.381],[116.202,23.350],[116.178,23.326]]}},
      {id:'d2-water-home',label:'只走南溪水乡',note:'德安里 → 南溪水乡 → 御景城',points:['hotel','nanxi','home'],via:{'hotel>nanxi':[[116.216,23.428],[116.227,23.414],[116.237,23.401]],'nanxi>home':[[116.225,23.383],[116.205,23.355],[116.178,23.326]]}},
      {id:'d2-direct-home',label:'直接回御景城',note:'退房 → 御景城，适合雨天或想休息',points:['hotel','home'],via:{'hotel>home':[[116.209,23.413],[116.197,23.381],[116.178,23.344],[116.166,23.316]]}},
    ],
    d3: [
      {id:'d3-mountain',label:'百二丘田山线',note:'御景城 → 百二丘田 → 御景城 → 普宁站',points:['home','mountain','home','puning-station'],via:{'home>mountain':[[116.163,23.300],[116.157,23.282],[116.166,23.265]],'mountain>home':[[116.166,23.276],[116.172,23.294],[116.166,23.316]],'home>puning-station':[[116.176,23.302],[116.185,23.287],[116.194,23.269]]}},
      {id:'d3-direct-station',label:'休息后直接去车站',note:'御景城 → 普宁站，给返程留充足缓冲',points:['home','puning-station'],via:{'home>puning-station':[[116.176,23.302],[116.185,23.287],[116.194,23.269]]}},
    ],
  };
  const routePresets = () => {
    let presets=(ROUTE_PRESETS[state.day]||[]).slice();
    if(state.day==='d1'&&skippedVisit('park')) presets=presets.filter(p=>p.id!=='d1-city');
    if(state.day==='d2'&&(!nanxiPlanned()||skippedVisit('nanxi'))) presets=presets.filter(p=>p.id==='d2-direct-home');
    if(state.day==='d2'&&skippedVisit('nanyan')) presets=presets.filter(p=>p.id!=='d2-water-temple');
    if(state.day==='d3'&&!mountainPlanned()) presets=presets.filter(p=>p.id==='d3-direct-station');
    return presets.length?presets:ROUTE_PRESETS[state.day]||[];
  };
  const activeRoutePreset = () => {const options=routePresets();return options.find(p=>p.id===state.routeVariant)||options[0]||null;};
  const routeShape = preset => {
    if(!preset)return [];
    const out=[];
    for(let i=0;i<preset.points.length-1;i++){
      const from=preset.points[i],to=preset.points[i+1],a=visualCoords(from),b=visualCoords(to);
      if(!a||!b)continue;
      const via=(preset.via&&preset.via[`${from}>${to}`])||[];
      const seg=[a,...via,b];
      if(i)seg.shift();
      out.push(...seg);
    }
    return out;
  };
  const external = (href,label,cls='') => `<a href="${escape(href)}" class="${cls}" target="_blank" rel="noopener noreferrer">${label}</a>`;
  const toast = msg => {$('toast').textContent=msg;$('toast').hidden=false;clearTimeout(toastTimeout);toastTimeout=setTimeout(()=>$('toast').hidden=true,2800);};
  const areaName = area => ({puning:'普宁市区',north:'洪阳 · 南溪',jieyang:'揭阳榕城',shenzhen:'深圳'}[area]||area);
  const activeDay = () => plan.days.find(d=>d.id===state.day);
  const nanxiEnabled = () => state.nanxi && state.mode!=='rain';
  const stopKey = (day, stop) => `${day.id}-${stop.place}-${stop.time}`;
  const skippedVisit = (id, day=activeDay()) => day.stops.some(s=>s.place===id&&s.kind==='visit'&&state.skipped.includes(stopKey(day,s)));
  const nanxiPlanned = () => nanxiEnabled() && !skippedVisit('nanxi',plan.days.find(d=>d.id==='d2'));
  const mountainPlanned = () => state.mode!=='rain' && !skippedVisit('mountain',plan.days.find(d=>d.id==='d3'));

  function dayCopy(day) {
    if(day.id==='d2'&&!nanxiPlanned()) return {
      ...day, short:'德安里 → 回家', title:'从德安里回家，留一天慢下来',
      subtitle:state.mode==='rain'?'雨天取消南溪水边和周边行程，早餐退房后直接回御景城。':'南溪行程已跳过，早餐退房后直接回御景城，午后留给休息。',
      notes:[
        '早餐、退房后约 09:00 从德安里周边出发，直接回御景城；交通规划预留 60–90 分钟，以当天导航为准。',
        '南溪水乡、南溪午饭和周边短停均已取消；午饭在御景城附近解决，不自动增加其他景点。',
        mountainPlanned()?'回家休息，为 10 月 3 日早上百二丘田留体力。':'回家休息，10 月 3 日继续保留打包和返程缓冲。'
      ]
    };
    if(day.id==='d3'&&!mountainPlanned()) return {
      ...day, short:'御景城 → 返程', title:'在家休息，从容回深圳',
      subtitle:state.mode==='rain'?'雨天取消百二丘田，上午在御景城休息，下午打包，晚上按时返程。':'百二丘田已跳过，上午留给休息；晚上的已购车次与到站缓冲不变。',
      notes:[
        '今天不安排百二丘田和其他远郊景点；上午休息，午饭在御景城附近解决。',
        '下午整理行李、午休，提前约好亲友送站或出租车，自家车留在家里。',
        '已购 D665：普宁 21:08 → 深圳北 22:35；约 19:00 从御景城出发，目标 20:00 到普宁站。'
      ]
    };
    return day;
  }

  function dayStops(day) {
    if(day.id==='d2'&&!nanxiPlanned()) {
      const breakfast=day.stops[0], nanxi=day.stops.find(s=>s.place==='nanxi'&&s.kind==='visit'), dinner=day.stops[day.stops.length-1];
      return [
        {...breakfast,desc:'早餐后退房，核对随身行李和酒店停车，准备直接回御景城。',key:stopKey(day,breakfast),skipped:false},
        {time:'09:00–10:30',title:'直接回御景城',desc:'从德安里周边直接返家；路上不再绕行南溪，按当日导航预留车程。',place:'home',kind:'drive',duration:'规划预留 60–90 分钟',key:'d2-direct-home',skipped:false},
        ...(nanxiEnabled()&&skippedVisit('nanxi',day)?[{...nanxi,time:'已取消',duration:'不占用时间',key:stopKey(day,nanxi),skipped:true}]:[]),
        {time:'10:30–18:00',title:'御景城午饭、休息',desc:'午饭在家或附近解决，下午休息、自由活动，不再安排水乡和周边景点。',place:'home',kind:'rest',duration:'上午、下午留白',key:'d2-home-rest',skipped:false},
        {...dinner,desc:'在御景城吃饭、休息，按次日安排准备行李和随身用品。',key:stopKey(day,dinner),skipped:false}
      ];
    }
    return day.stops.filter(s=>
      !(s.optional==='nanxi'&&!nanxiEnabled()) &&
      !(day.id==='d3'&&!mountainPlanned()&&s.place==='mountain'&&s.kind==='drive')
    ).map(s=>{
      const stop={...s};
      if(day.id==='d2' && s.place==='nanxi' && s.kind==='visit') Object.assign(stop,{time:'10:00–12:00',desc:'在游客中心、临水步道或大港码头中选择当天可访问的部分。导航搜“南溪水乡大港码头”；先核实具体接待、停车和游船，不默认有国庆船班。',duration:'约 1.5–2 小时'});
      if(day.id==='d3'&&!mountainPlanned()) {
        if(s.time==='06:30') Object.assign(stop,{time:'早上',title:'御景城早餐、休息',desc:'不必为山线早起，按自己的节奏吃早餐、休息。',duration:'自由安排'});
        if(s.time==='11:30') Object.assign(stop,{title:'御景城午饭',desc:'在家或御景城附近吃午饭，下午继续休息、整理行李。'});
      }
      if(state.mode==='rain'){
        if(s.place==='deanli') stop.desc='先确认德安里开放区域与雨势；古厝院落并非全程室内。大雨就跳过，回德安里周边酒店休息，不在雨中赶点。';
        if(s.place==='mountain') Object.assign(stop,{title:'雨天取消百二丘田，留家休息',desc:'山路、路滑和能见度不适合安排百二丘田；上午留在御景城休息。',place:'home',kind:'rest',duration:'自由安排'});
        if(['xuegong','chenghuang','jinxianmen'].includes(s.place)) stop.desc+=' 雨天只在天气允许时短逛，场馆不是全程有顶；可点击“跳过”。';
      }
      stop.key=stopKey(day,s);
      stop.skipped=!(state.mode==='rain'&&s.place==='mountain')&&state.skipped.includes(stop.key);
      return stop;
    });
  }

  function routeLegs() {
    if(state.day==='arrival') return [{from:'qinghu',to:'shenzhen-north',mode:'driving',time:'含叫车等待预留 30–60 分钟',note:'9/30 夜间 · 不依赖通宵地铁'}];
    if(state.day==='d1') return [{from:'puning-station',to:'home',mode:'driving',time:'含出站、等车预留 45–75 分钟',note:'凌晨接站 · 送到御景城'},...(skippedVisit('park')?[]:[{from:'home',to:'park',mode:'driving',time:'单程规划预留 15–30 分钟',note:'午饭后轻松短走'},{from:'park',to:'home',mode:'driving',time:'单程规划预留 15–30 分钟',note:'回御景城收拾、再北上'}]),{from:'home',to:'hotel',mode:'driving',time:'规划预留 45–75 分钟',note:'15:30–16:30 出发 · 德安里周边入住'}];
    if(state.day==='d2') return [...(nanxiEnabled()&&!skippedVisit('nanxi')?[{from:'hotel',to:'nanxi',mode:'driving',time:'规划预留 30–60 分钟',note:'大港码头与停车先核实'}]:[]),...(nanxiEnabled()&&!skippedVisit('nanxi')&&!skippedVisit('nanyan')?[{from:'nanxi',to:'nanyan',mode:'driving',time:'规划预留 15–30 分钟',note:'周边最多加一个点，可跳过'},{from:'nanyan',to:'home',mode:'driving',time:'规划预留 60–90 分钟',note:'最迟 15:30 左右离开'}]:nanxiEnabled()&&!skippedVisit('nanxi')?[{from:'nanxi',to:'home',mode:'driving',time:'规划预留 60–90 分钟',note:'跳过周边点，直接回御景城'}]:[{from:'hotel',to:'home',mode:'driving',time:'规划预留 60–90 分钟',note:'雨天或跳过南溪直接回御景城'}])];
    return [...(state.mode==='rain'||skippedVisit('mountain')?[]:[{from:'home',to:'mountain',mode:'driving',time:'规划预留 30–45 分钟',note:'导航实际入口；灰寨村仅作方位参考'},{from:'mountain',to:'home',mode:'driving',time:'最迟 11:00 离开山线',note:'回御景城午饭与休息'}]),{from:'home',to:'puning-station',mode:'driving',time:'含叫车与步行预留 45–60 分钟',note:'19:00 出门，20:00 到站；车辆留家'}];
  }

  function routePoints() {
    if(state.day==='arrival') return ['puning-station','home'];
    if(state.day==='d1') return ['puning-station','home',...(skippedVisit('park')?[]:['park','home']),'hotel'];
    if(state.day==='d2') return ['hotel',...(nanxiEnabled()&&!skippedVisit('nanxi')?['nanxi']:[]),...(nanxiEnabled()&&!skippedVisit('nanxi')&&!skippedVisit('nanyan')?['nanyan']:[]),'home'];
    return ['home',...(state.mode==='rain'||skippedVisit('mountain')?[]:['mountain','home']),'puning-station'];
  }

  function renderTabs() {
    $('day-tabs').innerHTML=plan.days.map((d,i)=>{const stay={arrival:'夜间出发',d1:'住德安里周边',d2:'住御景城',d3:'返深圳'}[d.id];return `<button class="day-tab" role="tab" id="tab-${d.id}" aria-controls="day-panel" aria-selected="${state.day===d.id}" data-day="${d.id}"><span class="date-num">${i===0?'09.30':`10.0${i}`}<small>${i===0?'DEPARTURE':`DAY ${String(i).padStart(2,'0')}`}</small></span><span class="day-name">${dayCopy(d).short}<small>${d.weekday} · ${stay}</small></span></button>`;}).join('');
    $('day-panel').setAttribute('aria-labelledby',`tab-${state.day}`);
  }

  function renderDay() {
    const day=dayCopy(activeDay());
    renderTabs();
    $('day-eyebrow').textContent=`${day.date} · ${day.weekday} / ${state.mode==='outdoor'?'晴天版':state.mode==='rain'?'雨天版':'轻松版'}`;
    $('day-title').textContent=day.title;
    $('day-subtitle').textContent=day.subtitle;
    $('day-stay').textContent=`⌂ ${day.stay}`;
    $('day-options').innerHTML=state.day==='d2'?`<label class="option-row"><input id="nanxi-toggle" type="checkbox" ${nanxiEnabled()?'checked':''} ${state.mode==='rain'?'disabled':''}><span>保留南溪水乡主线</span></label><p class="option-description">${state.mode==='rain'?'雨天已取消水边停留；切换晴天或轻松版后可恢复。':skippedVisit('nanxi')?'南溪主线已跳过；点下方「恢复此站」可恢复水乡与周边安排。':'南溪是今天主线；关闭后从德安里周边直接回御景城。游船仍需现场确认。'}</p>`:'';
    $('timeline').innerHTML=dayStops(day).map(s=>{
      const p=places[s.place];
      const skip=s.kind==='visit' && ['park','mountain','deanli','nanxi','nanyan'].includes(s.place);
      return `<li class="timeline-item ${s.kind}" ${s.skipped?'style="opacity:.52"':''}><div class="timeline-time">${escape(s.time)}${s.skipped?' · 已跳过':''}</div><div class="timeline-title-row"><button class="timeline-title" ${p?'data-place="'+s.place+'"':'disabled'}>${escape(s.title)}</button><span class="duration">${escape(s.duration)}</span></div><p class="timeline-desc">${escape(s.skipped?'这个时段留给休息或自由活动，不自动塞入其他景点。':s.desc)}</p><div class="inline-links">${p&&!s.skipped?external(searchLink(s.place),'高德地点 ↗'):''}${skip?`<button class="skip-stop" data-skip="${escape(s.key)}">${s.skipped?'恢复此站':'跳过此站'}</button>`:''}</div></li>`;
    }).join('');
    $('day-note').innerHTML=day.notes.map(n=>`<p>${escape(n)}</p>`).join('');
    const presets=routePresets(), activePreset=activeRoutePreset();
    if(state.routeVariant!==activePreset?.id){state.routeVariant=activePreset?.id||'';save();}
    const presetBox=$('route-presets');
    if(presetBox) presetBox.innerHTML=presets.length?`<div class="route-preset-heading"><span>预设驾车路线</span><small>选择后地图按道路走向显示</small></div><div class="route-preset-list">${presets.map(p=>`<button class="route-preset ${p.id===activePreset?.id?'active':''}" data-route-preset="${escape(p.id)}" aria-pressed="${p.id===activePreset?.id}"><strong>${escape(p.label)}</strong><small>${escape(p.note)}</small></button>`).join('')}</div>`:'';
    $('route-legs').innerHTML=routeLegs().map(l=>`<div class="leg"><span>${escape(places[l.from].short||places[l.from].name)} → ${escape(places[l.to].short||places[l.to].name)}</span><small>${escape(l.time)}<br>${escape(l.note)}</small><div class="leg-links">${external(amapRouteLink(l.from,l.to),'高德驾车 ↗')}${external(routeLink(l.from,l.to,l.mode),'百度驾车 ↗')}</div></div>`).join('');
    document.querySelectorAll('[data-mode]').forEach(b=>b.setAttribute('aria-pressed',b.dataset.mode===state.mode));
    selected=state.day==='arrival'?'puning-station':state.day==='d1'?'home':state.day==='d2'?'hotel':mountainPlanned()?'mountain':'home';
    renderPlace();
    renderMap(true);
  }

  function renderPlace() {
    const p=places[selected];if(!p)return;
    const precise=hasExactCoords(selected) && !['mountain','home','hotel'].includes(selected);
    const point=visualCoords(selected);
    const mapNote=!point?'<p>此点未标注地图坐标；点高德核对具体入口与实际位置。</p>':!hasExactCoords(selected)?'<p class="coordinate-note">地图使用片区定位参考；具体入口、分店和停车请以高德导航为准。</p>':selected==='mountain'?'<p>地图仅标灰寨村方位，不是百二丘田景区入口。</p>':precise?'<p class="coordinate-note">地图为建筑／场地中心点；停车、入口请看导航。</p>':'';
    const address=p.address?`<p class="place-address"><b>地址：</b>${escape(p.address)}</p>`:'';
    $('place-detail').innerHTML=`<div class="detail-top"><h3>${escape(p.name)}</h3><span>${escape(areaName(p.area))} · ${escape(p.duration||'位置参考')}</span></div><p>${escape(p.description)}</p>${address}<span class="verified-status">${escape(p.access)}</span>${mapNote}<div class="detail-actions">${external(searchLink(selected),'高德地点 ↗')}${external(baiduSearch(selected),'百度地点 ↗')}${p.source?external(p.source,'来源 ↗'):''}${p.extra?`<button data-save="${selected}">${state.saved.includes(selected)?'✓ 已加入想去':'＋ 加入想去'}</button>`:''}</div>`;
  }

  function mapBounds(ids) {
    const coords=ids.map(visualCoords).filter(Boolean);
    if(!coords.length)return [[116.13,23.27],[116.22,23.34]];
    let xmin=d3.min(coords,d=>d[0]),xmax=d3.max(coords,d=>d[0]),ymin=d3.min(coords,d=>d[1]),ymax=d3.max(coords,d=>d[1]);
    const minSpan=cityDetail ? .008 : .042;
    if(xmax-xmin<minSpan){const mid=(xmin+xmax)/2;xmin=mid-minSpan/2;xmax=mid+minSpan/2;}
    if(ymax-ymin<minSpan){const mid=(ymin+ymax)/2;ymin=mid-minSpan/2;ymax=mid+minSpan/2;}
    return [[xmin,ymin],[xmax,ymax]];
  }

  function renderMap(reset=false) {
    if($('planner-view').hidden)return;
    mapWidth=$('map-wrap').clientWidth || 600;
    mapHeight=$('map-wrap').clientHeight || 390;
    svg.attr('viewBox',`0 0 ${mapWidth} ${mapHeight}`);
    // Keep every collected restaurant in the map viewport, even before it is
    // marked「想去」. Saved places are highlighted separately below.
    const foodIds=Object.values(places).filter(p=>p.category==='餐饮'&&visualCoords(p.id)).map(p=>p.id);
    const ids=[...routePoints(),...state.saved,...foodIds];
    const bounds=mapBounds(ids);
    mapProjection=d3.geoMercator().fitExtent([[42,38],[mapWidth-75,mapHeight-46]],{type:'MultiPoint',coordinates:[bounds[0],bounds[1]]});
    if(reset || !mapTransform)mapTransform=d3.zoomIdentity;
    if(!mapZoom){mapZoom=d3.zoom().scaleExtent([.6,30]).on('zoom',event=>{mapTransform=event.transform;drawMap();});svg.call(mapZoom).on('dblclick.zoom',null);}
    mapZoom.extent([[0,0],[mapWidth,mapHeight]]);
    svg.call(mapZoom.transform,mapTransform);
    $('map-title').textContent=state.day==='arrival'?'抵达后 · 普宁站到御景城':state.day==='d1'?'御景城 → 德安里住宿':state.day==='d2'?(nanxiEnabled()&&!skippedVisit('nanxi')?'德安里 → 南溪 → 御景城':'德安里 → 御景城'):(state.mode==='rain'||skippedVisit('mountain')?'御景城 → 普宁站':'御景城 → 百二丘田 → 普宁站');
    $('fit-map').textContent='全览';
    drawMap();
  }

  function renderSavedSummary() {
    const box=$('map-saved-summary');
    if(!box)return;
    const saved=state.saved.map(id=>places[id]).filter(Boolean);
    const foods=Object.values(places).filter(p=>p.category==='餐饮'&&visualCoords(p.id));
    const foodItems=foods.map(p=>`<button class="saved-summary-item food-summary-item" data-place="${escape(p.id)}"><span class="food-dot" aria-hidden="true"></span>${escape(p.short||p.name)}</button>`).join('');
    if(!saved.length){box.innerHTML=`<span class="saved-summary-empty">还没有标记「想去」；在「周边好去处」加入后，这里会显示收藏点。</span><div class="saved-summary-title food-summary-heading">餐饮收藏 · ${foods.length} 家</div><div class="saved-summary-items">${foodItems}</div><p class="saved-summary-note">餐饮点使用普宁市区片区锚点，仅用于地图浏览；点名称可打开详情，再用高德核对分店。</p>`;return;}
    const located=saved.filter(p=>visualCoords(p.id)), unresolved=saved.filter(p=>!visualCoords(p.id));
    const item=p=>`<button class="saved-summary-item" data-place="${escape(p.id)}"><span class="saved-dot" aria-hidden="true"></span>${escape(p.short||p.name)}${visualCoords(p.id)?(hasExactCoords(p.id)?'':' · 片区参考'):' · 待核位'}</button>`;
    box.innerHTML=`<div class="saved-summary-title">想去 · ${saved.length} 个${located.length?` · 地图已标 ${located.length} 个`:''}</div><div class="saved-summary-items">${saved.map(item).join('')}</div>${unresolved.length?`<p class="saved-summary-note">${unresolved.map(p=>escape(p.short||p.name)).join('、')} 暂无地图坐标，点名称可打开详情，再用高德核对门店。</p>`:''}<div class="saved-summary-title food-summary-heading">餐饮收藏 · ${foods.length} 家</div><div class="saved-summary-items">${foodItems}</div><p class="saved-summary-note">餐饮点使用普宁市区片区锚点，仅用于地图浏览；点名称可打开详情，再用高德核对分店。</p>`;
  }

  function drawMap() {
    if(!mapProjection||!mapTransform)return;
    const projected=d3.geoTransform({point:function(x,y){const p=mapTransform.apply(mapProjection([x,y]));this.stream.point(p[0],p[1]);}});
    const path=d3.geoPath(projected);
    scene.selectAll('*').remove();
    const order={urban:0,water:1,road:2};
    const features=[...(window.TRIP_GEO?.features||[])].sort((a,b)=>order[a.properties.kind]-order[b.properties.kind]);
    scene.append('g').selectAll('path').data(features).join('path').attr('class',d=>`geo-${d.properties.kind} ${d.properties.class||''}`).attr('d',path);
    const route=routePoints();
    const ids=[...new Set(route.filter(id=>visualCoords(id)))];
    const preset=activeRoutePreset();
    const shape=routeShape(preset);
    const coords=(shape.length?shape:route.map(id=>visualCoords(id)).filter(Boolean)).map(c=>mapTransform.apply(mapProjection(c)));
    scene.append('path').datum(coords).attr('class','route-path').attr('d',d3.line().curve(d3.curveCatmullRom.alpha(.35)));
    if(preset){
      scene.append('text').attr('class','route-label').attr('x',18).attr('y',22).text(`驾车预设 · ${preset.label}`);
    }
    if(!cityDetail){const labels=[{name:'普宁',pos:[116.139,23.322]},{name:'洪阳',pos:[116.180,23.459]},{name:'南溪',pos:[116.235,23.395]}];scene.append('g').selectAll('text').data(labels).join('text').attr('class','town-label').attr('x',d=>mapTransform.apply(mapProjection(d.pos))[0]).attr('y',d=>mapTransform.apply(mapProjection(d.pos))[1]).text(d=>d.name);}
    let nearby=state.day==='d1'?['park']:state.day==='d2'?['deanli']:['deanli'];
    nearby=nearby.filter(id=>{const c=visualCoords(id);return !ids.includes(id)&&c&&!ids.some(other=>String(visualCoords(other))===String(c));});
    const savedIds=state.saved.filter(id=>visualCoords(id)&&!ids.includes(id));
    const foodIds=Object.values(places).filter(p=>p.category==='餐饮'&&visualCoords(p.id)&&!ids.includes(p.id)&&!state.saved.includes(p.id)).map(p=>p.id);
    const all=[...nearby.map(id=>({id,nearby:true})),...ids.map((id,i)=>({id,n:i+1,nearby:false})),...savedIds.map(id=>({id,saved:true,nearby:false})),...foodIds.map(id=>({id,food:true,nearby:true}))];
    const group=scene.append('g').selectAll('g').data(all).join('g').attr('class','place-marker').attr('role','button').attr('tabindex','0').attr('aria-label',d=>`查看${places[d.id].name}`).attr('transform',d=>{const c=visualCoords(d.id),p=mapTransform.apply(mapProjection(c));return `translate(${p[0]},${p[1]})`;}).on('click',(event,d)=>{event.stopPropagation();selected=d.id;renderPlace();drawMap();}).on('keydown',(event,d)=>{if(['Enter',' '].includes(event.key)){event.preventDefault();selected=d.id;renderPlace();drawMap();}});
    group.append('circle').attr('r',22).attr('fill','transparent');
    group.append('circle').attr('r',d=>d.food?6:d.nearby?5:d.saved?9:13).attr('class',d=>`point-circle ${d.food?'food-point':''} ${d.saved?'saved-point':''} ${selected===d.id?'active':''}`);
    group.filter(d=>!d.nearby&&!d.saved).append('text').attr('class',d=>`point-text ${selected===d.id?'active':''}`).text(d=>d.n);
    const placed=[];
    group.filter(d=>!d.nearby||selected===d.id).each(function(d){
      const p=mapTransform.apply(mapProjection(visualCoords(d.id)));
      const label=d.saved?`想去 · ${places[d.id].short||places[d.id].name}`:d.food?`餐饮 · ${places[d.id].short||places[d.id].name}`:d.id==='home'?'御景城·家附近':d.id==='hotel'?'德安里周边住宿':places[d.id].mapLabel||places[d.id].short||places[d.id].name;
      const labelWidth=Array.from(label).length*12;
      let x=19,y=4,anchor='start';
      if(p[0]+x+labelWidth>mapWidth-8){x=-19;anchor='end';}
      if(cityDetail){if(d.id==='xuegong') {x=-19;y=-8;anchor='end';}if(d.id==='chenghuang'){x=-19;y=14;anchor='end';}}
      if(p[0]+x-(anchor==='end'?labelWidth:0)<8){x=8-p[0];anchor='start';}
      if(p[0]+x+(anchor==='start'?labelWidth:0)>mapWidth-8){x=mapWidth-8-p[0];anchor='end';}
      for(let n=0;n<5;n++){
        const box={left:p[0]+(anchor==='end'?x-labelWidth:x),right:p[0]+(anchor==='end'?x:x+labelWidth),top:p[1]+y-12,bottom:p[1]+y+3};
        if(!placed.some(b=>box.left<b.right+3&&box.right>b.left-3&&box.top<b.bottom+3&&box.bottom>b.top-3)){placed.push(box);break;}y+=19;
      }
      d3.select(this).append('text').attr('class','point-label').attr('x',x).attr('y',y).attr('text-anchor',anchor).text(label);
    });
    if(!features.length){scene.append('text').attr('x',20).attr('y',20).attr('fill','#5d6b57').attr('font-size',12).text('底图暂未加载 · 分段导航仍可打开');}
    if(state.day==='d2'&&nanxiEnabled()&&!skippedVisit('nanxi')&&!hasExactCoords('nanxi')){scene.append('text').attr('x',14).attr('y',mapHeight-43).attr('fill','#5d6b57').attr('font-size',11).text('南溪为片区定位参考，入口请用高德核对');}
    renderSavedSummary();
  }

  function renderExplore() {
    const items=Object.values(places).filter(p=>p.extra&&(state.filter==='all'||(state.filter==='saved'?state.saved.includes(p.id):state.filter==='food'?p.category==='餐饮':p.area===state.filter)));
    $('place-grid').innerHTML=items.length?items.map(p=>{const facts=p.category==='餐饮'?`<div class="food-facts"><span>${escape(p.cuisine||'餐饮')}</span><span>评分 ${escape(p.rating||'—')} · ${escape(p.reviews||'暂无评论')}</span><span>${escape(p.price||'价格待核')}</span><span>适合 ${escape(p.meal||'按当天营业安排')}</span></div>`:'';const address=p.address?`<div class="place-address"><b>地址：</b>${escape(p.address)}</div>`:'';return `<article class="explore-card"><div class="place-art"><span class="art-label">${escape(areaName(p.area))}${p.collection?' · 我的收藏':''}</span><span class="art-word" aria-hidden="true">${escape(p.art||'游')}</span></div><div class="explore-card-content"><div class="card-meta"><span>${escape(p.category)}</span><span>${escape(p.duration)}</span></div><h3>${escape(p.name)}</h3>${facts}${address}<p>${escape(p.description)}</p><div class="visit-info">${escape(p.access)} ${p.source?external(p.source,'资料 ↗'):''}</div><div class="detail-actions">${external(searchLink(p.id),'高德地点 / 导航 ↗')}${external(baiduSearch(p.id),'百度地点 ↗')}<button data-save="${p.id}" aria-pressed="${state.saved.includes(p.id)}">${state.saved.includes(p.id)?'✓ 已想去':'＋ 想去'}</button></div></div></article>`}).join(''):'<p class="explore-empty">还没有符合条件的地点。切换片区或回到「全部」看看。</p>';
    document.querySelectorAll('[data-filter]').forEach(b=>b.setAttribute('aria-pressed',b.dataset.filter===state.filter));
    $('saved-count').textContent=state.saved.length;
  }

  function renderPrep() {
    $('checklist').innerHTML=plan.preparation.map((g,gi)=>`<section class="check-group"><h4>${escape(g.title)}</h4>${g.items.map((item,i)=>{const key=`${gi}-${i}`;return `<label class="check-item"><input type="checkbox" data-check="${key}" ${state.checks.includes(key)?'checked':''}><span>${escape(item)}</span></label>`;}).join('')}</section>`).join('');
    $('hotel-search').href=searchLink('hotel');
    $('sources-list').innerHTML='<ol>'+(window.TRIP_SOURCES||[]).map(s=>`<li>${external(s.url,escape(s.title))} · ${escape(s.date)}<br>${escape(s.note)}</li>`).join('')+'</ol>';
    $('changes-list').innerHTML=plan.changes.map(c=>`<div class="change-item"><div><small>草稿</small>${escape(c.from)}</div><div><small>这次建议</small>${escape(c.to)}</div><p>${escape(c.why)}</p></div>`).join('');
  }

  function showView(view) {
    state.view=view;
    for(const id of ['planner','explore','prepare']) $(id+'-view').hidden=id!==view;
    document.querySelectorAll('[data-view]').forEach(b=>{b.classList.toggle('active',b.dataset.view===view);b.setAttribute('aria-pressed',b.dataset.view===view);});
    if(view==='planner')renderMap(true);
    if(view==='explore')renderExplore();
    save();
  }

  function buildPrint() {
    $('print-content').innerHTML=`<h1>潮汕小行 · 四人国庆行程</h1><p>2026 年 10 月 1–3 日 · 普宁御景城有家、有车 · ${state.mode==='outdoor'?'晴天户外版':state.mode==='rain'?'雨天版':'轻松版'} · ${nanxiPlanned()?'包含南溪主线':'跳过南溪水乡'}</p><p>已购：10/1 C8066 深圳北 01:20 → 普宁 02:59；10/3 D665 普宁 21:08 → 深圳北 22:35。</p><p>住宿：10/1 普宁华庭优品客房（洪阳大道后山村洪马路西270号）；10/2 回御景城；10/3 返回深圳。</p>${plan.days.map(raw=>{const d=dayCopy(raw);return `<section class="print-day"><h2>${escape(d.date+' · '+d.title)}</h2><p>${escape(d.subtitle)}</p><table><thead><tr><th>时间</th><th>安排</th></tr></thead><tbody>${dayStops(d).map(s=>`<tr><td>${escape(s.time)}</td><td><b>${escape(s.title)}${s.skipped?'（已跳过）':''}</b><br>${escape(s.skipped?'自由休息时段':s.desc)}</td></tr>`).join('')}</tbody></table></section>`;}).join('')}<p>交通均为规划预留，非实时导航。国庆开放与船班出发前复核。${mountainPlanned()?'10/3 百二丘田最迟 11:00 离开山线；':'10/3 百二丘田已取消；'}约 19:00 从御景城出门，目标 20:00 到普宁站，车辆留家。资料核对日期：2026-09-29。</p>`;
  }

  document.addEventListener('click',event=>{
    const b=event.target.closest('button');if(!b)return;
    if(b.dataset.day){state.day=b.dataset.day;save();renderDay();}
    else if(b.dataset.mode){state.mode=b.dataset.mode;save();renderDay();toast(state.mode==='outdoor'?'已切换晴天户外安排':state.mode==='rain'?'已取消水乡与山线户外活动':'已恢复轻松节奏');}
    else if(b.dataset.view)showView(b.dataset.view);
    else if(b.dataset.routePreset){state.routeVariant=b.dataset.routePreset;save();renderDay();toast('已切换驾车路线，地图按预设道路走向更新');}
    else if(b.dataset.place){selected=b.dataset.place;renderPlace();drawMap();if(window.innerWidth<761)$('place-detail').scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth',block:'center'});}
    else if(b.dataset.save){const id=b.dataset.save;state.saved=state.saved.includes(id)?state.saved.filter(x=>x!==id):[...state.saved,id];save();renderExplore();renderPlace();if(!$('planner-view').hidden)renderMap(true);toast(state.saved.includes(id)?'已加入想去，地图已更新':'已移出想去，地图已更新');}
    else if(b.dataset.filter){state.filter=b.dataset.filter;save();renderExplore();}
    else if(b.dataset.skip){const id=b.dataset.skip;state.skipped=state.skipped.includes(id)?state.skipped.filter(x=>x!==id):[...state.skipped,id];save();renderDay();toast('行程已更新，空余时段留给休息');}
  });
  document.addEventListener('change',event=>{
    if(event.target.id==='nanxi-toggle'){state.nanxi=event.target.checked;save();renderDay();toast(state.nanxi?'南溪主线已加入，下午按计划回御景城':'已从德安里周边直接回御景城，午后多留休息');}
    if(event.target.dataset.check){const key=event.target.dataset.check;state.checks=event.target.checked?[...new Set([...state.checks,key])]:state.checks.filter(x=>x!==key);save();}
  });
  $('day-tabs').addEventListener('keydown',event=>{
    if(!['ArrowLeft','ArrowRight','Home','End'].includes(event.key))return;event.preventDefault();
    const ids=plan.days.map(d=>d.id),index=ids.indexOf(state.day);state.day=ids[event.key==='Home'?0:event.key==='End'?ids.length-1:(index+(event.key==='ArrowRight'?1:-1)+ids.length)%ids.length];save();renderDay();$(`tab-${state.day}`).focus();
  });
  $('zoom-in').addEventListener('click',()=>svg.call(mapZoom.scaleBy,1.5));
  $('zoom-out').addEventListener('click',()=>svg.call(mapZoom.scaleBy,1/1.5));
  $('fit-map').addEventListener('click',()=>renderMap(true));
  $('print').addEventListener('click',()=>{buildPrint();window.print();});
  window.addEventListener('beforeprint',buildPrint);
  new ResizeObserver(()=>{if(!$('planner-view').hidden)renderMap(true);}).observe($('map-wrap'));
  renderPrep();renderDay();renderExplore();showView(state.view);
})();
