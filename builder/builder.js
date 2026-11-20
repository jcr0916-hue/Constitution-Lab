/* Constitution Lab — Constitution Builder, phase 1 (Draft + Form + Take office).
   Static, no build step. Everything the builder knows lives in data.json.
   The whole constitution is one plain object (C), which is what later makes saving easy. */
(function(){
'use strict';

var KEY = 'constitutionlab.builder.v1';
var D = null;          // data.json
var C = null;          // the constitution
var step = 'draft';    // draft | form | office
var app = document.getElementById('app');
var stepper = document.getElementById('stepper');

/* ---------- small helpers ---------- */
function esc(s){ return String(s == null ? '' : s).replace(/[&<>"']/g, function(c){ return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]; }); }
function reduced(){ try{ return window.matchMedia('(prefers-reduced-motion: reduce)').matches; }catch(e){ return false; } }
function pick(arr, avoid){
  var pool = arr.filter(function(x){ return avoid.indexOf(x) < 0; });
  if(!pool.length) pool = arr;
  return pool[Math.floor(Math.random() * pool.length)];
}
function mulberry32(a){ return function(){ a |= 0; a = a + 0x6D2B79F5 | 0; var t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
function newSeed(){ return 1000 + Math.floor(Math.random() * 9000); }
function lever(id){ return D.levers.filter(function(l){ return l.id === id; })[0]; }
function option(leverId, optId){ var l = lever(leverId); return l ? l.options.filter(function(o){ return o.id === optId; })[0] : null; }
function save(){ try{ sessionStorage.setItem(KEY, JSON.stringify({ C:C, step:step })); }catch(e){} }
function load(){ try{ var raw = sessionStorage.getItem(KEY); return raw ? JSON.parse(raw) : null; }catch(e){ return null; } }
function clearSaved(){ try{ sessionStorage.removeItem(KEY); }catch(e){} }
function fresh(){ return { version:1, country:'', rules:{ hog:null, legislature:null, electoral:null }, actors:{}, seed:newSeed() }; }

/* ---------- rules ---------- */
function leverApplies(l){
  if(!l.needs) return true;
  return Object.keys(l.needs).every(function(k){ return l.needs[k].indexOf(C.rules[k]) >= 0; });
}
function draftComplete(){
  return D.levers.every(function(l){ return !leverApplies(l) || !!C.rules[l.id]; });
}
function watchFor(){
  return D.interaction_rules.filter(function(r){
    return Object.keys(r['if']).every(function(k){ return C.rules[k] && r['if'][k].indexOf(C.rules[k]) >= 0; });
  });
}
function hasLegislature(){ return C.rules.legislature && C.rules.legislature !== 'none'; }
function isElected(){ return hasLegislature() && ['fptp','proportional','mixed','limited_franchise'].indexOf(C.rules.electoral) >= 0; }
function isBicameral(){ return C.rules.legislature === 'bicameral_equal' || C.rules.legislature === 'bicameral_weak_upper'; }

/* ---------- roles: the constitution decides which exist ---------- */
function roles(){
  var R = D.roles, P = D.pools, h = C.rules.hog, list = [];
  list.push({ key:'country', group:'Your country', label:'Country', name:P.countries, def:{ name:'Norland' } });
  if(h === 'dual_executive'){
    list.push({ key:'president', group:'Who runs the government', label:R.hog.dual_executive_president.label, title:R.hog.dual_executive_president.titles, name:P.people });
    list.push({ key:'pm', group:'Who runs the government', label:R.hog.dual_executive_pm.label, title:R.hog.dual_executive_pm.titles, name:P.people, def:{ title:'Prime Minister', name:'Dana Reyes' } });
  } else if(h === 'collegial_directorial' || h === 'ruling_council'){
    var rc = R.hog[h];
    list.push({ key:h === 'ruling_council' ? 'rcouncil' : 'council', group:'Who runs the government', label:rc.label, body:true, name:rc.council_names });
    list.push({ key:'chair', group:'Who runs the government', label:h === 'collegial_directorial' ? 'This year’s chair' : 'Leader of the council', title:rc.chair_titles, name:P.people, def:{ name:'Dana Reyes' } });
    if(h === 'collegial_directorial'){
      for(var i = 1; i < rc.size; i++){ list.push({ key:'member' + i, group:'Who runs the government', label:'Councillor ' + (i + 1), name:P.people, compact:true }); }
    }
  } else if(h){
    var r = R.hog[h];
    list.push({ key:'hog', group:'Who runs the government', label:r.label, title:r.titles, name:P.people, def:{ name:'Dana Reyes' } });
  }
  if(h === 'parliamentary_confidence'){
    list.push({ key:'hos', group:'Who runs the government', label:R.head_of_state.label, title:R.head_of_state.titles, name:P.people });
  }
  var L = C.rules.legislature;
  if(L === 'unicameral') list.push({ key:'leg', group:'The legislature', label:'The legislature', body:true, name:R.legislature.unicameral });
  if(isBicameral()){
    list.push({ key:'lower', group:'The legislature', label:'Lower chamber', body:true, name:R.legislature.lower });
    list.push({ key:'upper', group:'The legislature', label:'Upper chamber', body:true, name:R.legislature.upper });
  }
  if(L === 'advisory_council') list.push({ key:'adv', group:'The legislature', label:'The council', body:true, name:R.legislature.advisory });
  list.push({ key:'court', group:'The courts', label:'Top court', body:true, name:R.court });
  if(isElected()){
    D.pools.parties.slice(0, 4).forEach(function(p, i){
      list.push({ key:'party' + i, group:'Parties', label:'Party ' + (i + 1), body:true, party:i, name:D.pools.parties.map(function(x){ return x.name; }), def:{ name:p.name } });
    });
  }
  list.push({ key:'cos', group:'Supporting cast', label:R.chief_of_staff.label, name:P.people, def:{ name:R.chief_of_staff['default'] } });
  if(isElected()) list.push({ key:'opp', group:'Supporting cast', label:R.opposition.label, name:P.people, def:{ name:R.opposition['default'] } });
  return list;
}
function usedNames(exceptKey){
  var out = [];
  Object.keys(C.actors).forEach(function(k){ if(k !== exceptKey && C.actors[k] && C.actors[k].name) out.push(C.actors[k].name); });
  return out;
}
function fillActors(){
  roles().forEach(function(r){
    var a = C.actors[r.key] || {};
    if(r.title && (!a.title || r.title.indexOf(a.title) < 0 && !a.custom)) a.title = (r.def && r.def.title && r.title.indexOf(r.def.title) >= 0) ? r.def.title : r.title[0];
    if(!a.name){ a.name = (r.def && r.def.name && usedNames(r.key).indexOf(r.def.name) < 0) ? r.def.name : pick(r.name, usedNames(r.key)); }
    C.actors[r.key] = a;
  });
  C.country = C.actors.country.name;
}
function A(key){ return C.actors[key] || { name:'' }; }
function full(key){ var a = A(key); return (a.title ? a.title + ' ' : '') + a.name; }
function leader(){
  var h = C.rules.hog;
  if(h === 'dual_executive') return 'pm';
  if(h === 'collegial_directorial' || h === 'ruling_council') return 'chair';
  return 'hog';
}
function legName(){ return isBicameral() ? A('lower').name : (C.rules.legislature === 'advisory_council' ? A('adv').name : A('leg').name); }

/* ---------- taking office: a small seeded seat generator ---------- */
function dhondt(weights, seats){
  var won = weights.map(function(){ return 0; });
  for(var s = 0; s < seats; s++){
    var best = -1, bi = 0;
    weights.forEach(function(w, i){ var q = w / (won[i] + 1); if(q > best){ best = q; bi = i; } });
    won[bi]++;
  }
  return won;
}
function voteShares(rng, skew){
  var raw = [0.55 + rng() * 0.6, 0.45 + rng() * 0.6, 0.15 + rng() * 0.35, 0.08 + rng() * 0.25];
  if(skew) raw[0] *= 1.35;
  var t = raw.reduce(function(a, b){ return a + b; }, 0);
  return raw.map(function(v){ return v / t; });
}
function districts(rng, shares, n){
  var won = shares.map(function(){ return 0; });
  for(var d = 0; d < n; d++){
    var best = -1, bi = 0;
    shares.forEach(function(s, i){ var local = s * Math.exp((rng() - 0.5) * 1.8); if(local > best){ best = local; bi = i; } });
    won[bi]++;
  }
  return won;
}
function chamber(rng, size, label){
  var e = C.rules.electoral;
  if(e === 'lot') return { label:label, size:size, kind:'lot', groups:[{ name:'Citizens chosen by lot', seats:size, color:'#7c8aa5' }] };
  if(e === 'appointed_by_ruler') return { label:label, size:size, kind:'appointed', groups:[{ name:'Appointed members', seats:size, color:'#7c8aa5' }] };
  var shares = voteShares(rng, e === 'limited_franchise'), seats;
  if(e === 'proportional') seats = dhondt(shares, size);
  else if(e === 'mixed'){
    var half = Math.round(size / 2), dist = districts(rng, shares, half), ent = dhondt(shares, size);
    seats = ent.map(function(x, i){ return Math.max(x, dist[i]); });
  } else seats = districts(rng, shares, size);
  var groups = seats.map(function(s, i){ return { name:A('party' + i).name, seats:s, color:D.pools.parties[i].color, votes:shares[i], party:i }; });
  var total = seats.reduce(function(a, b){ return a + b; }, 0);
  return { label:label, size:total, kind:'elected', groups:groups };
}
function majorityOf(ch){
  var need = Math.floor(ch.size / 2) + 1;
  var sorted = ch.groups.filter(function(g){ return g.seats > 0; }).slice().sort(function(a, b){ return b.seats - a.seats; });
  var gov = [], n = 0, rest = sorted.slice();
  // Start with the largest party, then add the smallest partner that completes a majority (else the next largest).
  while(rest.length && n < need){
    var g = n === 0 ? rest[0] : (rest.slice().reverse().filter(function(x){ return n + x.seats >= need; })[0] || rest[0]);
    gov.push(g); n += g.seats; rest.splice(rest.indexOf(g), 1);
  }
  return { need:need, gov:gov, seats:n, single:gov.length === 1, largest:sorted[0] };
}
function presidentialVote(rng, shares){
  // The president's party is drawn in proportion to vote share; the winning margin is modest.
  var r = rng(), acc = 0, idx = 0;
  for(var i = 0; i < shares.length; i++){ acc += shares[i]; if(r <= acc){ idx = i; break; } }
  return { party:idx, pct:Math.round(48 + rng() * 10) };
}
function takeOffice(){
  var rng = mulberry32(C.seed), h = C.rules.hog, out = { chambers:[], story:[], labels:[] };
  if(hasLegislature()){
    var size = C.rules.legislature === 'advisory_council' ? 60 : 100;
    out.chambers.push(chamber(rng, size, legName()));
    if(isBicameral()) out.chambers.push(chamber(rng, 50, A('upper').name));
  }
  var lower = out.chambers[0], m = lower && lower.kind === 'elected' ? majorityOf(lower) : null;
  var lead = leader(), who = esc(full(lead));
  var leg = esc(legName());
  var govList = m ? m.gov.map(function(g){ return esc(g.name); }).join(' + ') : '';
  var e = C.rules.electoral;

  // How the legislature was filled
  if(lower){
    if(lower.kind === 'elected'){
      out.story.push(e === 'limited_franchise'
        ? 'Elections to the ' + leg + ' are held, but only about one adult in six can vote. ' + esc(m.largest.name) + ' comes first.'
        : 'Voters fill the ' + leg + '. ' + esc(m.largest.name) + ' comes first with ' + Math.round(m.largest.votes * 100) + '% of the vote and ' + m.largest.seats + ' of ' + lower.size + ' seats.');
    } else if(lower.kind === 'lot'){
      out.story.push('A lottery draws ' + lower.size + ' citizens to sit in the ' + leg + '. None of them belongs to a party.');
    } else {
      out.story.push('All ' + lower.size + ' members of the ' + leg + ' are appointed by ' + esc(appointer()) + '.');
    }
  } else {
    out.story.push('There is no legislature to elect.');
  }

  // How the government took office
  if(h === 'parliamentary_confidence' || h === 'assembly_appointed'){
    if(!hasLegislature() || C.rules.legislature === 'advisory_council'){
      out.story.push(who + ' is seated by the founders. Under these rules no body can remove them.');
      out.labels.push('No body can remove the government');
    } else if(m){
      out.govParties = m.gov.map(function(g){ return g.party; });
      if(m.single){ out.story.push(esc(m.gov[0].name) + ' holds a majority on its own, so ' + who + ' takes office with ' + m.seats + ' votes. A majority is ' + m.need + '.'); out.labels.push('Single-party majority: ' + esc(m.gov[0].name)); }
      else { out.story.push('No party has a majority. After negotiations, ' + govList + ' agree to back ' + who + ', with ' + m.seats + ' seats between them.'); out.labels.push('Coalition: ' + govList); }
    } else {
      var rounds = 2 + Math.floor(rng() * 4);
      out.story.push('With no parties, members negotiate from scratch. After ' + rounds + ' rounds of voting, the ' + leg + ' chooses ' + who + '.');
      out.labels.push('Majority built member by member');
    }
  } else if(h === 'direct_presidential'){
    var pv = isElected() ? presidentialVote(rng, lower.groups.map(function(g){ return g.votes; })) : { party:-1, pct:Math.round(48 + rng() * 10) };
    out.story.push(who + ' wins the presidential election with ' + pv.pct + '% of the vote' + (pv.party >= 0 ? ', standing for ' + esc(A('party' + pv.party).name) : '') + '.');
    if(m){
      out.govParties = [pv.party];
      var mine = lower.groups[pv.party].seats;
      if(mine >= m.need){ out.labels.push('Unified government: the president’s party controls the ' + leg); }
      else { out.labels.push('Divided government: the president’s party has ' + mine + ' of ' + lower.size + ' seats'); out.story.push('The president’s party has ' + mine + ' seats in the ' + leg + ', short of a majority. Every law will need votes from other parties.'); }
    } else if(!hasLegislature()) out.labels.push('The president makes the laws');
    else out.labels.push('The president has no party bloc in the ' + leg);
  } else if(h === 'dual_executive'){
    var pv2 = isElected() ? presidentialVote(rng, lower.groups.map(function(g){ return g.votes; })) : { party:-1, pct:Math.round(48 + rng() * 10) };
    out.story.push(esc(full('president')) + ' wins the presidential election with ' + pv2.pct + '% of the vote' + (pv2.party >= 0 ? ', standing for ' + esc(A('party' + pv2.party).name) : '') + '.');
    if(m){
      out.story.push((m.single ? esc(m.gov[0].name) + ' holds a majority and backs ' : govList + ' form a coalition and back ') + who + ' to lead the government.');
      out.govParties = m.gov.map(function(g){ return g.party; });
      var inGov = m.gov.some(function(g){ return g.party === pv2.party; });
      out.labels.push(inGov ? 'President and prime minister on the same side' : 'Cohabitation: the president’s party is in opposition');
    } else {
      out.story.push('The president appoints ' + who + '. With no legislature able to remove them, the prime minister answers only to the president.');
      out.labels.push('The prime minister answers to the president');
    }
  } else if(h === 'collegial_directorial'){
    var council = esc(A('council').name);
    if(m){
      var share = dhondt(lower.groups.map(function(g){ return g.seats; }), 7);
      out.govParties = share.map(function(x, i){ return x ? i : -1; }).filter(function(i){ return i >= 0; });
      var parts = share.map(function(s, i){ return s ? s + ' ' + esc(lower.groups[i].name) : null; }).filter(Boolean).join(', ');
      out.story.push('The ' + leg + ' elects the seven members of the ' + council + ' in proportion to its seats: ' + parts + '. ' + who + ' chairs it this year.');
      out.labels.push(share.filter(function(s){ return s > 0; }).length > 1 ? 'Council shared across parties' : 'Council held by one party');
    } else {
      out.story.push('The seven members of the ' + council + ' are chosen' + (lower ? ' by the ' + leg : ' by the founders') + '. ' + who + ' chairs it this year.');
      out.labels.push('Seven councillors, no single leader');
    }
  } else if(h === 'ruling_monarch'){
    out.story.unshift(who + ' succeeds to the throne.');
    if(m) out.labels.push('The monarch governs; ' + esc(m.largest.name) + ' is the largest group in the ' + leg);
    else out.labels.push('The monarch governs');
  } else if(h === 'ruling_council'){
    out.story.unshift('The ' + esc(A('rcouncil').name) + ' meets in private and chooses ' + who + ' as its leader.');
    if(m) out.labels.push('The council governs; ' + esc(m.largest.name) + ' is the largest group in the ' + leg);
    else out.labels.push('The council governs');
  }
  if(out.chambers[1] && out.chambers[1].kind === 'elected' && m && out.govParties){
    var upc = out.chambers[1], upNeed = Math.floor(upc.size / 2) + 1, gp0 = out.govParties;
    var upSeats = upc.groups.filter(function(g){ return gp0.indexOf(g.party) >= 0; }).reduce(function(a, g){ return a + g.seats; }, 0);
    var weak = C.rules.legislature === 'bicameral_weak_upper';
    out.story.push('The ' + esc(A('upper').name) + ' was chosen at a different time. ' + (upSeats >= upNeed
      ? 'The governing side has ' + upSeats + ' of ' + upc.size + ' seats there, a majority in both chambers.'
      : 'The governing side has only ' + upSeats + ' of ' + upc.size + ' seats there, short of a majority. That chamber ' + (weak ? 'can delay its bills, but not block them.' : 'can block its bills.')));
  }
  if(isElected() && lower && lower.kind === 'elected'){
    var gp = out.govParties || [];
    var outside = lower.groups.filter(function(g){ return gp.indexOf(g.party) < 0 && g.seats > 0; }).sort(function(a, b){ return b.seats - a.seats; })[0];
    out.oppParty = outside ? outside.name : m.largest.name;
  }
  return out;
}
function appointer(){
  var h = C.rules.hog;
  if(h === 'parliamentary_confidence') return full('hos');
  if(h === 'dual_executive') return full('president');
  if(h === 'collegial_directorial') return 'the ' + A('council').name;
  if(h === 'ruling_council') return 'the ' + A('rcouncil').name;
  return full('hog');
}

/* ---------- rendering ---------- */
function renderStepper(){
  var steps = [['draft','1','Write the rules'],['form','2','Name your government'],['office','3','Take office']];
  var reach = { draft:true, form:draftComplete(), office:draftComplete() };
  stepper.innerHTML = steps.map(function(s){
    var cur = s[0] === step;
    return '<li><button type="button" data-goto="' + s[0] + '"' + (cur ? ' aria-current="step"' : '') + (reach[s[0]] ? '' : ' disabled') + '><span class="n">' + s[1] + '</span>' + s[2] + '</button></li>';
  }).join('');
}
function watchHtml(){
  var w = watchFor();
  var h = '<section class="watch" aria-labelledby="watchH"><h2 id="watchH">Watch for</h2>';
  if(!w.length){
    h += '<p class="quiet">' + (draftComplete() ? 'No particular tensions between these three rules. Every design trades one risk for another; experiments will show yours.' : 'As you choose, notes appear here about how your rules interact. They are explanations, not warnings or scores.') + '</p>';
  } else {
    h += w.map(function(r){
      return '<div class="note"><h3>' + esc(r.then) + '</h3><p>' + esc(r.explanation) + '</p>' +
        (r.mitigations.length ? '<p class="mit"><b>Designs that soften this:</b> ' + r.mitigations.map(esc).join(' · ') + '</p>' : '') +
        (r.cases.length ? '<p class="mit"><b>Echoes:</b> ' + r.cases.map(esc).join(' · ') + '</p>' : '') + '</div>';
    }).join('');
  }
  return h + '</section>';
}
function optionDetail(l, o){
  return '<div class="detail" id="detail-' + l.id + '"><dl>' +
    '<div><dt>How it works</dt><dd>' + esc(o.mechanism) + '</dd></div>' +
    '<div><dt>How it’s filled</dt><dd>' + esc(o.how_chosen) + '</dd></div>' +
    '<div><dt>How it ends</dt><dd>' + esc(o.how_removed) + '</dd></div></dl>' +
    '<details class="echoes"><summary>Real-world echoes</summary><p class="quiet">Each echo is about this one rule, never a whole country or your whole design.</p>' +
    o.echoes.map(function(e){ return '<div class="echo"><b>' + esc(e.place) + '</b><p>' + esc(e.text) + '</p></div>'; }).join('') +
    '</details></div>';
}
function renderDraft(){
  var h = '<header class="panel-head"><p class="kicker">Step 1 of 3</p><h1>Write the rules</h1><p class="lead">Three rules to start: who runs the government, the legislature, and who chooses it. Any combination is allowed, including ones that don’t fit together. The lab will tell you what to watch for.</p></header>';
  D.levers.forEach(function(l){
    var applies = leverApplies(l), sel = C.rules[l.id];
    h += '<fieldset class="lever' + (applies ? '' : ' off') + '"><legend><span class="n">' + l.step + '</span>' + esc(l.title) + '</legend><p class="q">' + esc(l.question) + '</p>';
    if(!applies) h += '<p class="quiet">' + esc(l.skipped_note) + '</p>';
    h += '<div class="opts">' + l.options.map(function(o){
      var id = 'o-' + l.id + '-' + o.id;
      return '<label class="opt" for="' + id + '"><input type="radio" name="' + l.id + '" id="' + id + '" value="' + o.id + '"' + (sel === o.id ? ' checked' : '') + (applies ? '' : ' disabled') + '><span class="t">' + esc(o.label) + '</span><span class="s">' + esc(o.short) + '</span></label>';
    }).join('') + '</div>';
    if(applies && sel) h += optionDetail(l, option(l.id, sel));
    h += '</fieldset>';
  });
  h += watchHtml();
  h += '<p class="defaults">' + esc(D.defaults_note) + '</p>';
  h += '<div class="actions"><button class="go" type="button" data-act="toForm"' + (draftComplete() ? '' : ' disabled') + '>Name your government →</button>' +
       (draftComplete() ? '' : '<span class="quiet">Choose one option for each rule to continue.</span>') + '</div>';
  app.innerHTML = h;
}
function renderForm(){
  fillActors();
  var h = '<header class="panel-head"><p class="kicker">Step 2 of 3</p><h1>Name your government</h1><p class="lead">Your rules created these offices and bodies. Keep the suggested names, type your own, or press 🎲 to draw another.</p></header>';
  var groups = [], byGroup = {};
  roles().forEach(function(r){ if(!byGroup[r.group]){ byGroup[r.group] = []; groups.push(r.group); } byGroup[r.group].push(r); });
  groups.forEach(function(g){
    h += '<fieldset class="roles"><legend>' + esc(g) + '</legend>';
    var compact = byGroup[g].filter(function(r){ return r.compact; });
    byGroup[g].filter(function(r){ return !r.compact; }).forEach(function(r){ h += roleRow(r); });
    if(compact.length) h += '<div class="compact">' + compact.map(roleRow).join('') + '</div>';
    h += '</fieldset>';
  });
  h += '<div class="actions"><button class="ghost" type="button" data-act="toDraft">← Back to the rules</button><button class="ghost" type="button" data-act="rollAll">🎲 Draw all names</button><button class="go" type="button" data-act="toOffice">Take office →</button></div>';
  app.innerHTML = h;
}
function roleRow(r){
  var a = C.actors[r.key], id = 'f-' + r.key;
  var h = '<div class="role' + (r.party != null ? ' party' : '') + '"' + (r.party != null ? ' style="--pc:' + D.pools.parties[r.party].color + '"' : '') + '><span class="rl" id="' + id + '-l">' + esc(r.label) + '</span><div class="fields">';
  if(r.title){
    h += '<label class="fld t"><span>Title</span><input list="' + id + '-tl" data-key="' + r.key + '" data-field="title" value="' + esc(a.title) + '" aria-describedby="' + id + '-l" maxlength="40"></label>';
    h += '<datalist id="' + id + '-tl">' + r.title.map(function(t){ return '<option value="' + esc(t) + '">'; }).join('') + '</datalist>';
  }
  h += '<label class="fld n"><span>' + (r.body ? 'Name' : (r.key === 'country' ? 'Name' : 'Name')) + '</span><input data-key="' + r.key + '" data-field="name" value="' + esc(a.name) + '" aria-describedby="' + id + '-l" maxlength="48"></label>';
  h += '<button type="button" class="dice" data-roll="' + r.key + '" aria-label="Draw another name for ' + esc(r.label) + '" title="Draw another">🎲</button>';
  return h + '</div></div>';
}
function bar(ch){
  var need = Math.floor(ch.size / 2) + 1;
  var segs = ch.groups.filter(function(g){ return g.seats > 0; }).map(function(g){
    return '<span class="seg" style="flex:' + g.seats + ';background:' + g.color + '" title="' + esc(g.name) + ': ' + g.seats + '"></span>';
  }).join('');
  var legend = ch.groups.map(function(g){
    return '<li><span class="sw" style="background:' + g.color + '"></span>' + esc(g.name) + ' <b>' + g.seats + '</b>' + (g.votes != null ? ' <span class="quiet">(' + Math.round(g.votes * 100) + '% of votes)</span>' : '') + '</li>';
  }).join('');
  var desc = ch.groups.map(function(g){ return g.name + ' ' + g.seats; }).join(', ');
  return '<figure class="seats"><figcaption><b>' + esc(ch.label) + '</b> · ' + ch.size + ' seats' + (ch.kind === 'elected' ? ' · majority is ' + need : '') + '</figcaption>' +
    '<div class="bar" role="img" aria-label="' + esc(ch.label + ': ' + desc + '. Majority is ' + need + '.') + '">' + segs + (ch.kind === 'elected' ? '<span class="mid" style="left:' + (need / ch.size * 100) + '%"></span>' : '') + '</div>' +
    '<ul class="legend">' + legend + '</ul></figure>';
}
function renderOffice(){
  fillActors();
  var r = takeOffice(), lead = leader();
  var h = '<header class="panel-head"><p class="kicker">Step 3 of 3 · ' + esc(C.country) + '</p><h1>' + esc(full(lead)) + ' takes office.</h1></header>';
  h += '<section class="how" aria-labelledby="howH"><h2 id="howH">How it happened</h2><ol>' + r.story.map(function(s){ return '<li>' + s + '</li>'; }).join('') + '</ol>';
  if(r.labels.length) h += '<p class="tags">' + r.labels.map(function(l){ return '<span class="tag">' + l + '</span>'; }).join('') + '</p>';
  h += '</section>';
  if(r.chambers.length) h += '<section class="chambers" aria-label="Seats">' + r.chambers.map(bar).join('') + (r.chambers.some(function(c){ return c.kind !== 'appointed'; }) ? '<p class="quiet">Draw #' + C.seed + '. The same number always produces the same result, so you can change one rule and compare.</p>' : '') + '</section>';
  h += '<section class="glance" aria-labelledby="glH"><h2 id="glH">Your constitution at a glance</h2><dl>';
  D.levers.forEach(function(l){ var o = option(l.id, C.rules[l.id]); h += '<div><dt>' + esc(l.title) + '</dt><dd>' + (leverApplies(l) && o ? esc(o.label) : '<span class="quiet">Not applicable</span>') + '</dd></div>'; });
  h += '</dl><h3>Cast</h3><ul class="cast">';
  roles().forEach(function(rr){
    if(rr.key === 'country' || rr.party != null) return;
    var line = rr.key === 'opp' && r.oppParty ? esc(A('opp').name) + ' <span class="quiet">leads ' + esc(r.oppParty) + '</span>' : esc(full(rr.key));
    h += '<li><span class="quiet">' + esc(rr.label) + '</span> ' + line + '</li>';
  });
  h += '</ul></section>';
  h += watchHtml();
  h += '<div class="actions"><button class="go" type="button" data-act="toDraft">Change one rule</button><button class="ghost" type="button" data-act="reroll">Hold the election again</button><button class="ghost" type="button" data-act="toForm">Rename people</button></div>';
  h += '<section class="next"><h2>What comes next</h2><p>Soon you’ll be able to run experiments against this government: pass a bill, lose a majority, face an emergency. Until then, <a href="../experiments/norland/">Experiment 01</a> shows how one rule change moves the danger somewhere else.</p></section>';
  app.innerHTML = h;
}
function render(focus){
  renderStepper();
  if(step === 'draft') renderDraft();
  else if(step === 'form') renderForm();
  else renderOffice();
  save();
  if(focus){
    var h1 = app.querySelector('h1');
    if(h1){ h1.setAttribute('tabindex', '-1'); h1.focus({ preventScroll:true }); }
    try{ window.scrollTo({ top:0, behavior:reduced() ? 'auto' : 'smooth' }); }catch(e){ window.scrollTo(0, 0); }
  }
}
function go(s){ step = s; render(true); }

/* ---------- events ---------- */
app.addEventListener('change', function(e){
  var t = e.target;
  if(t.type === 'radio'){
    C.rules[t.name] = t.value;
    if(t.name === 'hog'){ ['hog','president','pm','chair'].forEach(function(k){ if(C.actors[k]) delete C.actors[k].custom; }); }
    var y = window.scrollY;
    renderStepper(); renderDraft(); save();
    window.scrollTo(0, y);
    var again = document.getElementById(t.id); if(again) again.focus({ preventScroll:true });
  }
});
app.addEventListener('input', function(e){
  var t = e.target, k = t.getAttribute('data-key');
  if(!k) return;
  var f = t.getAttribute('data-field');
  C.actors[k] = C.actors[k] || {};
  C.actors[k][f] = t.value;
  if(f === 'title') C.actors[k].custom = true;
  if(k === 'country') C.country = t.value;
  save();
});
app.addEventListener('focusout', function(e){
  var t = e.target, k = t.getAttribute && t.getAttribute('data-key');
  if(!k) return;
  if(!t.value.trim()){ var f = t.getAttribute('data-field'); delete C.actors[k][f]; fillActors(); t.value = C.actors[k][f] || ''; save(); }
});
app.addEventListener('click', function(e){
  var b = e.target.closest('button');
  if(!b) return;
  var roll = b.getAttribute('data-roll'), act = b.getAttribute('data-act');
  if(roll){
    var r = roles().filter(function(x){ return x.key === roll; })[0];
    C.actors[roll].name = pick(r.name, usedNames(roll).concat([C.actors[roll].name]));
    if(roll === 'country') C.country = C.actors[roll].name;
    var inp = app.querySelector('input[data-key="' + roll + '"][data-field="name"]'); if(inp) inp.value = C.actors[roll].name;
    save();
  }
  if(act === 'toForm') go('form');
  if(act === 'toDraft') go('draft');
  if(act === 'toOffice') go('office');
  if(act === 'reroll'){ C.seed = newSeed(); render(false); }
  if(act === 'rollAll'){
    roles().forEach(function(r){ if(r.party == null) delete C.actors[r.key].name; });
    roles().forEach(function(r){ if(r.party == null){ C.actors[r.key].name = pick(r.name, usedNames(r.key)); } });
    C.country = C.actors.country.name;
    render(false);
  }
});
stepper.addEventListener('click', function(e){
  var b = e.target.closest('button[data-goto]');
  if(b && !b.disabled) go(b.getAttribute('data-goto'));
});
var restart = document.getElementById('restart');
if(restart) restart.addEventListener('click', function(){ clearSaved(); C = fresh(); go('draft'); });

/* ---------- start ---------- */
fetch('data.json').then(function(r){ if(!r.ok) throw new Error(r.status); return r.json(); }).then(function(data){
  D = data;
  var s = load();
  if(s && s.C && s.C.version === 1){ C = s.C; step = s.step || 'draft'; } else { C = fresh(); }
  if(!C.seed) C.seed = newSeed();
  if(step !== 'draft' && !draftComplete()) step = 'draft';
  render(false);
}).catch(function(){
  app.innerHTML = '<div class="panel-head"><h1>The builder couldn’t load.</h1><p class="lead">Its rules file didn’t arrive. If you opened this file directly from disk, serve the folder instead (for example <code>python3 -m http.server</code>).</p></div>';
});
})();
