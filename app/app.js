// Leonida Legend: a GTA VI trophy guide and tracker.
// Loads app/data/trophies.json, renders the checklist, roadmap and missable
// panels, and keeps earned trophies in localStorage. No network use at all:
// the only fetch is the local trophies.json file, and export/import are files.
const STORAGE_KEY = 'gta6-trophy-checklist';
const KIND_LABELS = {
  story: 'Story',
  missable: 'Missable',
  collectibles: 'Collectibles',
  activities: 'Activities',
  completion: 'Completion',
  online: 'Online',
};
const ROADMAP_STAGES = [
  {
    title: 'Play the story, chapters 1 to 4 and the final mission',
    text: 'Follow the mission markers through Gone Fishing, the four chapters and the final mission. All 12 main-story trophies unlock on completion and none can be missed. Do not grind side content yet.',
    ids: [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13],
  },
  {
    title: 'Protect the one missable trophy as you go',
    text: 'Meditate at every meditation spot the moment you find it. PowerPyx and GTABase flag Positive Mental Attitude as the only possibly missable trophy, because one spot can become unavailable later in the story.',
    ids: [28],
  },
  {
    title: 'Finish the contact strands and stranger missions',
    text: 'Take missions from Andy, Kenton, Billy, Randy and Tyrone whenever their icons appear, and complete 8 stranger strands across Leonida. The five contact finales count as story trophies as well, so the story total is 17. These unlock gradually, so keep checking the map.',
    ids: [22, 23, 24, 26, 27, 25, 29],
  },
  {
    title: 'Clear the activities',
    text: 'Gold all 42 Shooting Range challenges, win drone races at all 14 Top Fun locations, win 20 different races, beat Cal at fishing, finish an arcade game and a bowling game, and try every activity type once.',
    ids: [17, 18, 19, 20, 21, 46, 16, 15, 51],
  },
  {
    title: 'Sweep collectibles and exploration',
    text: 'Complete 3 of the 18 card sets, scan 100 WAiNK locations, discover 100 vehicles, visit all 52 areas of Leonida, buy all 8 garages and register 10 vehicles in the Scooter Bros app. Do these on one big road trip.',
    ids: [30, 31, 35, 42, 54, 55],
  },
  {
    title: 'Crime, money and combat',
    text: 'Rob 5 bank vaults, an armored truck and one illegal operation per gang, rob shops with your partner, lose a 4-star wanted level together, and build your laundered and spent totals. Keep cheats off: they disable trophies.',
    ids: [40, 41, 43, 34, 33, 39, 36, 37, 38, 52, 53],
  },
  {
    title: 'Mop up the odd and hidden trophies',
    text: 'The cryptic hidden trophies: a cocktail on Ocean Beach, the showroom smash, the partner trophy, 500 Criminal Profile actions, a second-try success and the mystery event, plus One Last Thing for completing 50 challenges, which finishes passively along the way. None is tied to the story, so they can all be done in free roam.',
    ids: [44, 45, 47, 48, 49, 50, 32],
  },
  {
    title: 'Finish 100% completion, then the platinum',
    text: 'Work the 35-task completion checklist (Progress, then Stats) until it reads 100%. A Long Road is the gold for that, and the platinum pops right behind it.',
    ids: [14, 1],
  },
];

const params = new URLSearchParams(location.search);
const doc = await (await fetch('data/trophies.json')).json();
const trophies = doc.trophies;
const byId = new Map(trophies.map((t) => [t.id, t]));

let earned = new Set(JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]'));
let openGuideId = null;
let activeKind = 'all';

const listEl = document.getElementById('trophyList');
const emptyEl = document.getElementById('emptyState');
const filterNote = document.getElementById('filterNote');
const searchEl = document.getElementById('search');
const gradeEl = document.getElementById('grade');
const spoilerEl = document.getElementById('spoiler');
const hideEarnedEl = document.getElementById('hideEarned');

function saveProgress() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify([...earned]));
}

function isSpoilerHidden(trophy) {
  return spoilerEl.checked && trophy.hidden && !earned.has(trophy.name);
}

function gradeCounts() {
  const counts = { platinum: [0, 0], gold: [0, 0], silver: [0, 0], bronze: [0, 0] };
  for (const t of trophies) {
    counts[t.grade][1] += 1;
    if (earned.has(t.name)) counts[t.grade][0] += 1;
  }
  return counts;
}

function renderProgress() {
  const counts = gradeCounts();
  document.getElementById('progressCount').textContent = `${earned.size} / ${trophies.length}`;
  document.getElementById('progressPct').textContent = `${Math.round((earned.size / trophies.length) * 100)}%`;
  document.getElementById('progressFill').style.width = `${(earned.size / trophies.length) * 100}%`;
  document.getElementById('progressGrades').textContent =
    `Platinum ${counts.platinum[0]}/${counts.platinum[1]} · Gold ${counts.gold[0]}/${counts.gold[1]} · Silver ${counts.silver[0]}/${counts.silver[1]} · Bronze ${counts.bronze[0]}/${counts.bronze[1]}`;
}

function trophyCard(trophy) {
  const li = document.createElement('li');
  li.className = 'trophy' + (earned.has(trophy.name) ? ' earned' : '');
  const top = document.createElement('div');
  top.className = 'trophy-top';
  const box = document.createElement('input');
  box.type = 'checkbox';
  box.checked = earned.has(trophy.name);
  box.setAttribute('aria-label', `Mark ${trophy.name} as earned`);
  box.addEventListener('change', () => {
    if (box.checked) earned.add(trophy.name);
    else earned.delete(trophy.name);
    saveProgress();
    renderProgress();
    renderChecklist();
    renderRoadmap();
    renderMissables();
  });
  top.append(box);
  const text = document.createElement('div');
  const name = document.createElement('p');
  name.className = 'trophy-name';
  const desc = document.createElement('p');
  desc.className = 'trophy-desc';
  if (isSpoilerHidden(trophy)) {
    name.textContent = trophy.kind === 'story' ? 'Hidden story trophy' : 'Hidden trophy';
    name.classList.add('spoiler-mask');
    desc.textContent = 'Hidden until earned: turn off “Hide story spoilers” or earn it to reveal its name and description.';
    desc.classList.add('spoiler-mask');
  } else {
    name.textContent = trophy.name;
    desc.textContent = trophy.description;
  }
  text.append(name, desc);
  const meta = document.createElement('div');
  meta.className = 'trophy-meta';
  const grade = document.createElement('span');
  grade.className = `badge ${trophy.grade}`;
  grade.textContent = trophy.grade;
  meta.append(grade);
  const kind = document.createElement('span');
  kind.className = 'tag';
  kind.textContent = KIND_LABELS[trophy.kind] ?? trophy.kind;
  meta.append(kind);
  if (trophy.count) {
    const count = document.createElement('span');
    count.className = 'tag';
    count.textContent = `Target: ${trophy.count.toLocaleString('en-US')}`;
    meta.append(count);
  }
  if (trophy.hidden) {
    const hidden = document.createElement('span');
    hidden.className = 'tag hidden';
    hidden.textContent = 'Hidden on PSN';
    meta.append(hidden);
  }
  if (trophy.missable) {
    const miss = document.createElement('span');
    miss.className = 'tag missable';
    miss.textContent = 'MISSABLE — do it early';
    meta.append(miss);
  }
  text.append(meta);
  top.append(text);
  li.append(top);
  if (!isSpoilerHidden(trophy)) {
    const toggle = document.createElement('button');
    toggle.type = 'button';
    toggle.className = 'guide-toggle';
    toggle.textContent = openGuideId === trophy.id ? 'Hide guide' : 'Show guide + sources';
    toggle.addEventListener('click', () => {
      openGuideId = openGuideId === trophy.id ? null : trophy.id;
      renderChecklist();
      renderMissables();
    });
    li.append(toggle);
    if (openGuideId === trophy.id) {
      const guide = document.createElement('div');
      guide.className = 'guide';
      const body = document.createElement('p');
      body.textContent = trophy.guide;
      const sources = document.createElement('p');
      sources.className = 'sources';
      sources.textContent = `Sources: ${trophy.sources.join(', ')}. Guide text is original to this page.`;
      guide.append(body, sources);
      li.append(guide);
    }
  }
  return li;
}

function visibleTrophies() {
  const q = searchEl.value.trim().toLowerCase();
  const shown = trophies.filter((t) => {
    if (activeKind === 'online') return false;
    if (activeKind !== 'all' && t.kind !== activeKind) return false;
    if (gradeEl.value !== 'all' && t.grade !== gradeEl.value) return false;
    if (hideEarnedEl.checked && earned.has(t.name)) return false;
    if (q && !`${t.name} ${t.description}`.toLowerCase().includes(q)) return false;
    return true;
  });
  // Keep the trophy whose guide is open at the top of the list, so its guide
  // stays visible beside the checklist instead of scrolling away.
  if (openGuideId) {
    const at = shown.findIndex((t) => t.id === openGuideId);
    if (at > 0) shown.unshift(shown.splice(at, 1)[0]);
  }
  return shown;
}

function renderChecklist() {
  const shown = visibleTrophies();
  listEl.replaceChildren(...shown.map(trophyCard));
  emptyEl.hidden = shown.length > 0;
  if (activeKind === 'online') {
    filterNote.textContent = 'Online: 0 trophies. The whole 55-trophy list is single-player and offline (PSNProfiles / Exophase), so there is nothing to track here.';
  } else {
    const kindText = activeKind === 'all' ? 'all kinds' : KIND_LABELS[activeKind];
    filterNote.textContent = `Showing ${shown.length} of ${trophies.length} trophies (${kindText}${gradeEl.value !== 'all' ? `, ${gradeEl.value}` : ''}${searchEl.value.trim() ? `, matching “${searchEl.value.trim()}”` : ''}).`;
  }
}

function renderRoadmap() {
  const list = document.getElementById('roadmapList');
  list.replaceChildren(...ROADMAP_STAGES.map((stage) => {
    const li = document.createElement('li');
    const h = document.createElement('h3');
    h.textContent = stage.title;
    const p = document.createElement('p');
    p.textContent = stage.text;
    const names = document.createElement('p');
    names.className = 'stage-trophies';
    const done = stage.ids.filter((id) => earned.has(byId.get(id).name)).length;
    names.innerHTML = '';
    const label = document.createElement('b');
    label.textContent = `${done}/${stage.ids.length} earned: `;
    names.append(label);
    // The spoiler setting hides story names everywhere, not just in the
    // checklist: a hidden, un-earned trophy shows only its masked label here.
    names.append(stage.ids.map((id) => {
      const t = byId.get(id);
      return isSpoilerHidden(t) ? (t.kind === 'story' ? 'Hidden story trophy' : 'Hidden trophy') : t.name;
    }).join(' · '));
    li.append(h, p, names);
    return li;
  }));
}

function renderMissables() {
  const list = document.getElementById('missableList');
  list.replaceChildren(...trophies.filter((t) => t.missable).map(trophyCard));
}

function switchTab(name) {
  for (const button of document.querySelectorAll('.tab')) {
    button.classList.toggle('active', button.dataset.tab === name);
  }
  for (const panel of document.querySelectorAll('.tab-panel')) {
    panel.hidden = panel.id !== `tab-${name}`;
  }
}

for (const button of document.querySelectorAll('.tab')) {
  button.addEventListener('click', () => switchTab(button.dataset.tab));
}
for (const button of document.querySelectorAll('.kind')) {
  button.addEventListener('click', () => {
    activeKind = button.dataset.kind;
    for (const b of document.querySelectorAll('.kind')) b.classList.toggle('active', b === button);
    renderChecklist();
  });
}
searchEl.addEventListener('input', renderChecklist);
gradeEl.addEventListener('change', renderChecklist);
spoilerEl.addEventListener('change', renderChecklist);
hideEarnedEl.addEventListener('change', renderChecklist);

document.getElementById('export').addEventListener('click', () => {
  const payload = { game: 'Grand Theft Auto VI', exported: new Date().toISOString(), earned: [...earned] };
  const a = document.createElement('a');
  a.href = URL.createObjectURL(new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' }));
  a.download = 'gta6-trophy-progress.json';
  a.click();
  URL.revokeObjectURL(a.href);
});
document.getElementById('import').addEventListener('change', async (event) => {
  const file = event.target.files[0];
  if (!file) return;
  try {
    const data = JSON.parse(await file.text());
    const names = Array.isArray(data) ? data : data.earned;
    const valid = new Set(trophies.map((t) => t.name));
    earned = new Set(names.filter((n) => valid.has(n)));
    saveProgress();
    renderProgress();
    renderChecklist();
    renderRoadmap();
    renderMissables();
  } catch {
    filterNote.textContent = 'That file could not be imported: it is not a progress file from this guide.';
  }
  event.target.value = '';
});

// Demo and deep-link params, so one screenshot can show several parts at once:
// ?demo=1 checks a dozen trophies, turns spoilers off and opens the missable
// trophy's guide. ?view=roadmap or ?view=missables opens that tab.
// ?filter=missable, ?spoiler=1 and ?guide=<id> set the filter, spoiler mode
// and the open guide.
function applyDemoMode() {
  if (params.get('view') === 'roadmap') switchTab('roadmap');
  if (params.get('view') === 'missables') switchTab('missables');
  if (params.get('filter')) {
    activeKind = params.get('filter');
    for (const b of document.querySelectorAll('.kind')) b.classList.toggle('active', b.dataset.kind === activeKind);
  }
  if (params.get('guide')) openGuideId = Number(params.get('guide'));
  if (params.get('demo') === '1') {
    // A half-finished run on purpose: no story trophy earned yet, so the
    // story cards below stay masked and the shot shows the spoiler setting
    // at work, with the missable trophy's guide open on top.
    for (const id of [15, 21, 35, 42, 46]) earned.add(byId.get(id).name);
    saveProgress();
    spoilerEl.checked = true;
    openGuideId = 28;
  }
  // The spoiler param is read last, so a deep link can override demo mode's
  // spoiler-on default (e.g. a roadmap screenshot that shows every name).
  if (params.get('spoiler') === '1') spoilerEl.checked = true;
  if (params.get('spoiler') === '0') spoilerEl.checked = false;
}

applyDemoMode();
renderProgress();
renderChecklist();
renderRoadmap();
renderMissables();
