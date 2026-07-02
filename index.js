// ═══════════════════════════════════════════
// 1. DEFAULT RULES
// ═══════════════════════════════════════════
const GRADES_ALL  = ['A+','A','B+','B','C+','C','D+','D','E'];
const GRADES_CRN  = ['A+','A','B+','B','C+','C','D+','D'];
const GRADES_REF  = ['A+','B+','C+'];

const DEFAULT_RULES = {
  crn: [
    {prefix:'GALAXY S23',       grades:GRADES_CRN},
    {prefix:'GALAXY S23 FE',    grades:GRADES_CRN},
    {prefix:'GALAXY S23+',      grades:GRADES_CRN},
    {prefix:'GALAXY S23 ULTRA', grades:GRADES_CRN},
    {prefix:'GALAXY S24',       grades:GRADES_CRN},
    {prefix:'GALAXY S24 FE',    grades:GRADES_CRN},
    {prefix:'GALAXY S24+',      grades:GRADES_CRN},
    {prefix:'GALAXY S24 ULTRA', grades:GRADES_CRN},
    {prefix:'GALAXY S25',       grades:GRADES_CRN},
    {prefix:'GALAXY S25+',      grades:GRADES_CRN},
    {prefix:'GALAXY S25 ULTRA', grades:GRADES_CRN},
    {prefix:'GALAXY Z FLIP5',   grades:GRADES_CRN},
    {prefix:'GALAXY Z FLIP6',   grades:GRADES_CRN},
    {prefix:'GALAXY Z FLIP7',   grades:GRADES_CRN},
    {prefix:'GALAXY Z FOLD5',   grades:GRADES_CRN},
    {prefix:'GALAXY Z FOLD6',   grades:GRADES_CRN},
    {prefix:'GALAXY Z FOLD7',   grades:GRADES_CRN},
  ],
  refurbish: [
    {prefix:'GALAXY S21',          grades:GRADES_REF},
    {prefix:'GALAXY S21+',         grades:GRADES_REF},
    {prefix:'GALAXY S21 ULTRA',    grades:GRADES_REF},
    {prefix:'GALAXY S22',          grades:GRADES_REF},
    {prefix:'GALAXY S22+',         grades:GRADES_REF},
    {prefix:'GALAXY S22 ULTRA',    grades:GRADES_REF},
    {prefix:'GALAXY S23',          grades:GRADES_REF},
    {prefix:'GALAXY S23+',         grades:GRADES_REF},
    {prefix:'GALAXY S23 ULTRA',    grades:GRADES_REF},
    {prefix:'GALAXY S24',          grades:GRADES_REF},
    {prefix:'GALAXY S24+',         grades:GRADES_REF},
    {prefix:'GALAXY S24 ULTRA',    grades:GRADES_REF},
    {prefix:'GALAXY S25',          grades:GRADES_REF},
    {prefix:'GALAXY S25+',         grades:GRADES_REF},
    {prefix:'GALAXY S25 ULTRA',    grades:GRADES_REF},
    {prefix:'GALAXY S26',          grades:GRADES_REF},
    {prefix:'GALAXY NOTE20',       grades:GRADES_REF},
    {prefix:'GALAXY NOTE20 ULTRA', grades:GRADES_REF},
    {prefix:'GALAXY Z FLIP5',      grades:GRADES_REF},
    {prefix:'GALAXY Z FLIP6',      grades:GRADES_REF},
    {prefix:'GALAXY Z FLIP7',      grades:GRADES_REF},
    {prefix:'GALAXY Z FOLD5',      grades:GRADES_REF},
    {prefix:'GALAXY Z FOLD6',      grades:GRADES_REF},
    {prefix:'GALAXY Z FOLD7',      grades:GRADES_REF},
  ],
  recycling: [
    {prefix:'GALAXY S10',    grades:GRADES_ALL},
    {prefix:'GALAXY S20',    grades:GRADES_ALL},
    {prefix:'GALAXY S21',    grades:GRADES_ALL},
    {prefix:'GALAXY S22',    grades:GRADES_ALL},
    {prefix:'GALAXY S23',    grades:GRADES_ALL},
    {prefix:'GALAXY S24',    grades:GRADES_ALL},
    {prefix:'GALAXY S25',    grades:GRADES_ALL},
    {prefix:'GALAXY NOTE10', grades:GRADES_ALL},
    {prefix:'GALAXY NOTE20', grades:GRADES_ALL},
    {prefix:'GALAXY Z FLIP', grades:GRADES_ALL},
    {prefix:'GALAXY Z FOLD', grades:GRADES_ALL},
    {prefix:'GALAXY A52',    grades:GRADES_ALL},
    {prefix:'GALAXY A53',    grades:GRADES_ALL},
    {prefix:'GALAXY A54',    grades:GRADES_ALL},
  ],
  exclusions: [
    {model:'GALAXY S25 ULTRA', storage:'1TB', category:'CRN'},
  ],
  categoryKeywords: [
    {keyword:'ULTRA',   category:'flagship'},
    {keyword:'FOLD',    category:'flagship'},
    {keyword:'FLIP',    category:'flagship'},
    {keyword:'S23',     category:'flagship'},
    {keyword:'S24',     category:'flagship'},
    {keyword:'S25',     category:'flagship'},
    {keyword:'NOTE20',  category:'premium mid-range'},
    {keyword:'S21',     category:'premium mid-range'},
    {keyword:'S22',     category:'premium mid-range'},
    {keyword:'A7',      category:'mid-range'},
    {keyword:'A5',      category:'mid-range'},
    {keyword:'A3',      category:'mid-range'},
    {keyword:'A0',      category:'low-end'},
    {keyword:'A1',      category:'low-end'},
    {keyword:'A2',      category:'low-end'},
  ],
};

// ═══════════════════════════════════════════
// 1-1. UTILITY FUNCTIONS (규칙 기반 검증용)
// ═══════════════════════════════════════════

function norm(str) {
  return String(str || '').trim().toUpperCase().replace(/\s+/g, ' ');
}

function shouldSkip(modelName, storage, category) {
  const mn = norm(modelName);
  const st = norm(storage);
  for (const excl of (activeRules.exclusions || [])) {
    if (excl.category !== category) continue;
    if (mn.includes(norm(excl.model)) && st.includes(norm(excl.storage || ''))) {
      return true;
    }
  }
  return false;
}

function matchesPrefix(modelName, marketingName, prefixList) {
  const sources = [
    norm(marketingName || ''),
    norm(modelName || '')
  ].filter(s => s);

  for (const source of sources) {
    for (const rule of (prefixList || [])) {
      const rulePrefix = norm(rule.prefix || '');
      if (!rulePrefix) continue;

      if (source === rulePrefix) return rule;
      if (source.startsWith(rulePrefix)) {
        const nextChar = source[rulePrefix.length];
        if ([' ', '+', '-', '_'].includes(nextChar)) return rule;
      }
    }
  }
  return null;
}

function lookupCrnGrades(modelName, storage, rule) {
  const mn = norm(modelName);
  const st = norm(storage);

  // CRN Storage 제외 규칙
  if (mn.includes('GALAXY S25 ULTRA') && st.includes('1TB')) return new Set();
  if (mn.includes('SM-S938') && st.includes('1TB')) return new Set();

  return new Set(rule.grades || []);
}

function lookupRecyclingGrades(modelName, manufacturer, rule) {
  const mn = norm(modelName);
  const mfr = norm(manufacturer || '');

  // R2Destroy1: Samsung A-series N-6+, S-series N-8+
  if (mfr.includes('SAMSUNG')) {
    if (mn.includes('GALAXY A')) {
      return new Set(['A+', 'A', 'B+', 'B', 'C+']);
    }
  }

  // R2Destroy2: All OEMs → E
  if (mn.match(/GALAXY|IPHONE|PIXEL/)) {
    return new Set(['E']);
  }

  return new Set(rule.grades || []);
}

// ═══════════════════════════════════════════
// 2. RULES STATE  (localStorage 연동)
// ═══════════════════════════════════════════
const LS_KEY = 'stockProfiling_rules_v1';

function loadRules() {
  try {
    const saved = localStorage.getItem(LS_KEY);
    return saved ? JSON.parse(saved) : structuredClone(DEFAULT_RULES);
  } catch { return structuredClone(DEFAULT_RULES); }
}

function saveRules() {
  const rules = collectRules();
  localStorage.setItem(LS_KEY, JSON.stringify(rules));
  activeRules = rules;
  document.getElementById('save-hint').textContent = '✅ 저장되었습니다 — ' + new Date().toLocaleTimeString('ko-KR');
  renderCurRulesSummary(rules);
  showToast('💾 규칙이 저장되었습니다.');
}

function resetRules() {
  if (!confirm('기본값으로 복원하시겠습니까? 현재 변경사항이 사라집니다.')) return;
  activeRules = structuredClone(DEFAULT_RULES);
  localStorage.removeItem(LS_KEY);
  renderRuleTables(activeRules);
  showToast('↺ 기본값으로 복원되었습니다.');
}

function exportRules() {
  const rules = collectRules();
  const blob = new Blob([JSON.stringify(rules, null, 2)], {type:'application/json'});
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'profiling_rules.json';
  a.click();
}

function importRules(event) {
  const file = event.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = e => {
    try {
      const imported = JSON.parse(e.target.result);
      activeRules = imported;
      renderRuleTables(activeRules);
      showToast('📥 규칙 파일을 가져왔습니다. 저장 버튼을 눌러 적용하세요.');
    } catch { showToast('❌ JSON 파싱 오류'); }
    event.target.value = '';
  };
  reader.readAsText(file);
}

let activeRules = loadRules();

// ═══════════════════════════════════════════
// 3. RULE TABLE RENDERING
// ═══════════════════════════════════════════
const CATEGORY_OPTIONS = ['flagship','premium mid-range','mid-range','low-end','refurbished','carrier-locked','global/unlocked','unknown'];

function gradeCheckboxes(rowId, type, selectedGrades) {
  const grades = GRADES_ALL;
  return `<div class="grade-grid">` + grades.map(g => {
    const id = `${rowId}_${g.replace('+','p')}`;
    const checked = selectedGrades.includes(g) ? 'checked' : '';
    return `<input class="grade-cb" type="checkbox" id="${id}" value="${g}" ${checked}>
            <label class="grade-label" for="${id}">${g}</label>`;
  }).join('') + `</div>`;
}

function modelRow(type, idx, item) {
  const rowId = `${type}_${idx}`;
  return `<tr id="tr_${rowId}">
    <td><input class="cell-input" value="${escHtml(item.prefix)}" placeholder="예) GALAXY S25 ULTRA" data-field="prefix" data-type="${type}" data-idx="${idx}"></td>
    <td>${gradeCheckboxes(rowId, type, item.grades)}</td>
    <td style="text-align:center"><button class="btn btn-red btn-sm" onclick="deleteRow('${type}',${idx})">✕</button></td>
  </tr>`;
}

function exclusionRow(idx, item) {
  return `<tr id="tr_exclusion_${idx}">
    <td><input class="cell-input" value="${escHtml(item.model)}" placeholder="모델명" data-field="model" data-type="exclusion" data-idx="${idx}"></td>
    <td><input class="cell-input" value="${escHtml(item.storage)}" placeholder="예) 1TB, 256GB" data-field="storage" data-type="exclusion" data-idx="${idx}"></td>
    <td>
      <select class="cell-input" data-field="category" data-type="exclusion" data-idx="${idx}">
        ${['CRN','Refurbish','Recycling'].map(c => `<option ${item.category===c?'selected':''}>${c}</option>`).join('')}
      </select>
    </td>
    <td style="text-align:center"><button class="btn btn-red btn-sm" onclick="deleteRow('exclusion',${idx})">✕</button></td>
  </tr>`;
}

function categoryRow(idx, item) {
  return `<tr id="tr_category_${idx}">
    <td><input class="cell-input" value="${escHtml(item.keyword)}" placeholder="예) ULTRA, FOLD" data-field="keyword" data-type="category" data-idx="${idx}"></td>
    <td>
      <select class="cell-input" data-field="category" data-type="category" data-idx="${idx}">
        ${CATEGORY_OPTIONS.map(c => `<option ${item.category===c?'selected':''}>${c}</option>`).join('')}
      </select>
    </td>
    <td style="text-align:center"><button class="btn btn-red btn-sm" onclick="deleteRow('category',${idx})">✕</button></td>
  </tr>`;
}

function renderRuleTables(rules) {
  document.getElementById('crn-tbody').innerHTML       = rules.crn.map((r,i) => modelRow('crn',i,r)).join('');
  document.getElementById('refurbish-tbody').innerHTML = rules.refurbish.map((r,i) => modelRow('refurbish',i,r)).join('');
  document.getElementById('recycling-tbody').innerHTML = rules.recycling.map((r,i) => modelRow('recycling',i,r)).join('');
  document.getElementById('exclusion-tbody').innerHTML = rules.exclusions.map((r,i) => exclusionRow(i,r)).join('');
  document.getElementById('category-tbody').innerHTML  = rules.categoryKeywords.map((r,i) => categoryRow(i,r)).join('');
}

// ═══════════════════════════════════════════
// 4. ROW ADD / DELETE
// ═══════════════════════════════════════════
function addRow(type) {
  const rules = collectRules();
  if (type === 'crn')       rules.crn.push({prefix:'', grades:GRADES_CRN.slice()});
  if (type === 'refurbish') rules.refurbish.push({prefix:'', grades:GRADES_REF.slice()});
  if (type === 'recycling') rules.recycling.push({prefix:'', grades:GRADES_ALL.slice()});
  if (type === 'exclusion') rules.exclusions.push({model:'', storage:'', category:'CRN'});
  if (type === 'category')  rules.categoryKeywords.push({keyword:'', category:'flagship'});
  activeRules = rules;
  renderRuleTables(rules);
  setTimeout(() => {
    const newInput = document.querySelector(`#${type}-tbody tr:last-child .cell-input`);
    if (newInput) newInput.focus();
  }, 50);
}

function deleteRow(type, idx) {
  const rules = collectRules();
  if (type === 'crn')       rules.crn.splice(idx,1);
  if (type === 'refurbish') rules.refurbish.splice(idx,1);
  if (type === 'recycling') rules.recycling.splice(idx,1);
  if (type === 'exclusion') rules.exclusions.splice(idx,1);
  if (type === 'category')  rules.categoryKeywords.splice(idx,1);
  activeRules = rules;
  renderRuleTables(rules);
}

// ═══════════════════════════════════════════
// 5. COLLECT RULES FROM DOM
// ═══════════════════════════════════════════
function collectModelRows(tbodyId) {
  const rows = [];
  document.querySelectorAll(`#${tbodyId} tr`).forEach(tr => {
    const prefixEl = tr.querySelector('[data-field="prefix"]');
    if (!prefixEl) return;
    const prefix = prefixEl.value.trim();
    const grades = [...tr.querySelectorAll('.grade-cb:checked')].map(cb => cb.value);
    rows.push({prefix, grades});
  });
  return rows;
}

function collectRules() {
  const crn      = collectModelRows('crn-tbody');
  const refurbish = collectModelRows('refurbish-tbody');
  const recycling = collectModelRows('recycling-tbody');
  const exclusions = [];
  document.querySelectorAll('#exclusion-tbody tr').forEach(tr => {
    const model    = tr.querySelector('[data-field="model"]')?.value.trim() || '';
    const storage  = tr.querySelector('[data-field="storage"]')?.value.trim() || '';
    const category = tr.querySelector('[data-field="category"]')?.value || 'CRN';
    exclusions.push({model, storage, category});
  });
  const categoryKeywords = [];
  document.querySelectorAll('#category-tbody tr').forEach(tr => {
    const keyword  = tr.querySelector('[data-field="keyword"]')?.value.trim() || '';
    const category = tr.querySelector('[data-field="category"]')?.value || 'flagship';
    categoryKeywords.push({keyword, category});
  });
  return {crn, refurbish, recycling, exclusions, categoryKeywords};
}

// ═══════════════════════════════════════════
// 6. PAGE SWITCH
// ═══════════════════════════════════════════
function switchPage(name, btn) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.page-nav button').forEach(b => b.classList.remove('active'));
  document.getElementById('page-' + name).classList.add('active');
  btn.classList.add('active');
  if (name === 'rules') {
    renderRuleTables(activeRules);
    renderCurRulesSummary(activeRules);
  }
}

// ═══════════════════════════════════════════
// 6-1. 현재 규칙 요약 렌더
// ═══════════════════════════════════════════
const CAT_BADGE_STYLE = {
  'flagship':          'background:#DBEAFE;color:#1D4ED8',
  'premium mid-range': 'background:#EDE9FE;color:#6D28D9',
  'mid-range':         'background:#DCFCE7;color:#166534',
  'low-end':           'background:#F1F5F9;color:#475569',
  'refurbished':       'background:#FEF3C7;color:#92400E',
  'carrier-locked':    'background:#FFEDD5;color:#9A3412',
  'global/unlocked':   'background:#D1FAE5;color:#065F46',
  'unknown':           'background:#F1F5F9;color:#94A3B8',
};

function renderCurRulesSummary(rules) {
  const body = document.getElementById('curRulesBody');
  const modelCol = (title, color, list) => {
    if (!list.length) return `<div class="cur-col"><h4>${title}</h4><p style="font-size:12px;color:var(--text-sub)">등록된 규칙 없음</p></div>`;
    const rows = list.map(r => `
      <div class="cur-model-item">
        <span class="cur-model-name">${escHtml(r.prefix || '(미입력)')}</span>
        <span class="cur-grade-tags">${(r.grades||[]).map(g =>
          `<span class="cur-grade-tag" style="background:${color}18;color:${color};border-color:${color}44">${g}</span>`
        ).join('')}</span>
      </div>`).join('');
    return `<div class="cur-col"><h4>${title} <span style="font-weight:400;color:var(--text-sub)">(${list.length}개)</span></h4>${rows}</div>`;
  };
  const exclRows = (rules.exclusions||[]).map(e => `
    <div class="cur-excl-item">
      <strong>${escHtml(e.model)}</strong> ${escHtml(e.storage)}
      <span class="cur-excl-badge">${escHtml(e.category)} 제외</span>
    </div>`).join('') || '<p style="font-size:12px;color:var(--text-sub)">제외 규칙 없음</p>';
  const kwRows = (rules.categoryKeywords||[]).map(k => {
    const st = CAT_BADGE_STYLE[k.category] || CAT_BADGE_STYLE['unknown'];
    return `<div class="cur-kw-item">
      <span class="cur-kw-keyword">${escHtml(k.keyword)}</span>
      <span class="cur-cat-badge" style="${st}">${escHtml(k.category)}</span>
    </div>`;
  }).join('') || '<p style="font-size:12px;color:var(--text-sub)">키워드 없음</p>';
  body.innerHTML =
    modelCol('🔵 CRN 적용 모델', '#1565C0', rules.crn||[]) +
    modelCol('🟠 Refurbish 적용 모델', '#F57C00', rules.refurbish||[]) +
    modelCol('🟢 Recycling 적용 모델', '#388E3C', rules.recycling||[]) +
    `<div class="cur-col cur-full-col" style="display:grid;grid-template-columns:1fr 1fr;gap:14px;border-top:1px solid var(--border);padding-top:14px;margin-top:2px;">
      <div><h4>⛔ Storage 제외 규칙 <span style="font-weight:400;color:var(--text-sub)">(${(rules.exclusions||[]).length}개)</span></h4>${exclRows}</div>
      <div><h4>🏷️ 카테고리 키워드 <span style="font-weight:400;color:var(--text-sub)">(${(rules.categoryKeywords||[]).length}개)</span></h4>${kwRows}</div>
    </div>`;
}

function toggleCurRules() {
  const header = document.getElementById('curRulesToggle');
  const body   = document.getElementById('curRulesBody');
  header.classList.toggle('collapsed');
  body.classList.toggle('collapsed');
}

// ═══════════════════════════════════════════
// 7. DASHBOARD — UPLOAD & PROFILING
// ═══════════════════════════════════════════
let allRows = [], originalHeaders = [], processedRows = [];
let colIdx = {};
let _gradeColMap = {};
let _gradeRowMeta = null;
let _currentFilter = 'all';

const ALIASES = {
  model_name:     ['model','model name','modelname','model_no','모델명','모델','actual_model','actual model'],
  marketing_name: ['marketing name','marketing_name','marketing','마케팅명'],
  sku:            ['sku','sku_code','item_code','상품코드','gvi'],
  manufacturer:   ['manufacturer','brand','make','브랜드','제조사','actual manufacturer'],
  price_usd:      ['price','price_usd','msrp','가격'],
  ram_gb:         ['ram','ram_gb','memory','메모리','램'],
  storage_gb:     ['storage','storage_gb','rom','저장용량','저장소'],
  condition:      ['condition','grade','상태','등급'],
  network_lock:   ['network_lock','carrier_lock','locked','통신사잠금'],
  quantity:       ['qty','quantity','stock','재고','수량'],
  crn:            ['crn'],
  refurbish:      ['refurbish','refurb'],
  recycling:      ['recycling'],
  valid_yn:       ['valid_yn','valid y/n','valid'],
  display_bi:     ['display_bi','display bi','display bi'],
};

function findColIdx(headers) {
  const norm = h => h.toLowerCase().replace(/[\s_\-]+/g,'_');
  const result = {};
  for (const [key, aliases] of Object.entries(ALIASES)) {
    result[key] = -1;
    for (let i=0; i<headers.length; i++) {
      if (aliases.some(a => norm(a) === norm(headers[i]))) { result[key]=i; break; }
    }
  }
  return result;
}

// GitHub Pages 접속 시 DRM 안내 배너 표시
(function() {
  const isLocalhost = ['localhost', '127.0.0.1'].includes(location.hostname);
  const isFile      = location.protocol === 'file:';
  if (!isLocalhost && !isFile) {
    document.getElementById('drmBanner').classList.add('show');
  }
})();

// 드래그앤드롭
const dz = document.getElementById('dropZone');
dz.addEventListener('dragover', e => { e.preventDefault(); dz.classList.add('drag'); });
dz.addEventListener('dragleave', () => dz.classList.remove('drag'));
dz.addEventListener('drop', e => { e.preventDefault(); dz.classList.remove('drag'); const f=e.dataTransfer.files[0]; if(f) handleFile(f); });
document.getElementById('fileInput').addEventListener('change', e => { if(e.target.files[0]) handleFile(e.target.files[0]); });

function handleFile(file) {
  if (file.size > 52428800) { showToast('⚠️ 50MB 이하 파일만 지원합니다.'); return; }

  if (/\.json$/i.test(file.name)) {
    showProgress('JSON 읽는 중...');
    const r = new FileReader();
    r.onload = e => {
      try {
        const arr = JSON.parse(e.target.result);
        const data = Array.isArray(arr) ? arr : [arr];
        if (!data.length || data[0] == null) {
          showToast('❌ JSON 파일이 비어있습니다. Excel 변환 결과를 확인해 주세요.');
          hideProgress(); return;
        }
        // 배열의 배열 → loadFromAoa, 객체 배열 → loadFromJson
        if (Array.isArray(data[0])) {
          loadFromAoa(data, file.name);
        } else {
          loadFromJson(data, file.name);
        }
      } catch(err) { showToast('❌ JSON 오류: ' + err.message); hideProgress(); }
    };
    r.readAsText(file, 'utf-8');
    return;
  }

  // xlsx/xls 처리
  if (location.protocol === 'file:') {
    showToast('❌ 파일을 직접 열면 Excel 읽기가 불가합니다.\n"python -m http.server 5500" 실행 후\nhttp://localhost:5500/index.html 로 접속해 주세요.');
    hideProgress();
    return;
  }

  showProgress('Excel → JSON 변환 중...');

  const isLocalhost = ['localhost', '127.0.0.1'].includes(location.hostname);

  if (isLocalhost) {
    // 로컬 환경: Python 서버 fetch로 Samsung DRM 우회
    const encodedName = file.name.split('/').map(encodeURIComponent).join('/');
    const url = location.origin + '/' + encodedName;
    fetch(url)
      .then(res => {
        if (!res.ok) throw new Error(`파일을 찾을 수 없습니다 (${res.status}). 엑셀 파일을 대시보드와 같은 폴더에 넣고 다시 시도해 주세요.`);
        return res.arrayBuffer();
      })
      .then(buf => {
        const wb   = XLSX.read(buf, {type:'array'});
        const ws   = wb.Sheets[wb.SheetNames[0]];
        const data = XLSX.utils.sheet_to_json(ws, {header:1, defval:''});
        if (!data || data.length < 2) throw new Error('시트에 데이터가 없습니다.');
        loadFromAoa(data, file.name);
      })
      .catch(err => {
        if (err instanceof TypeError && err.message.toLowerCase().includes('fetch')) {
          showToast('❌ 서버에 연결할 수 없습니다.\n"python -m http.server 5500" 이 실행 중인지 확인해 주세요.');
        } else {
          showToast('❌ ' + err.message);
        }
        hideProgress();
      });
    return;
  }

  // GitHub Pages 등 외부 서버: FileReader 직접 사용
  const reader = new FileReader();
  reader.onload = e => {
    try {
      const wb   = XLSX.read(e.target.result, {type:'array'});
      const ws   = wb.Sheets[wb.SheetNames[0]];
      const data = XLSX.utils.sheet_to_json(ws, {header:1, defval:''});
      if (!data || data.length < 2) throw new Error('시트에 데이터가 없습니다.');
      loadFromAoa(data, file.name);
    } catch(err) {
      showToast('❌ DRM 파일입니다. 아래 안내에 따라 JSON으로 변환 후 업로드해 주세요.');
      document.getElementById('drmBanner').classList.add('show');
      document.getElementById('drmBanner').scrollIntoView({behavior:'smooth', block:'center'});
      hideProgress();
    }
  };
  reader.onerror = () => {
    showToast('❌ DRM 파일입니다. 아래 안내에 따라 JSON으로 변환 후 업로드해 주세요.');
    document.getElementById('drmBanner').classList.add('show');
    document.getElementById('drmBanner').scrollIntoView({behavior:'smooth', block:'center'});
    hideProgress();
  };
  reader.readAsArrayBuffer(file);
}

let _convertedJson = null;
let _convertedJsonName = '';

function buildCompositeHeaders(row1, row2) {
  const GRADE_SET = new Set(['A+','A','B+','B','C+','C','D+','D','E']);
  let currentCat = '';
  return row1.map((h, i) => {
    const h1 = String(h || '').trim();
    if (h1) currentCat = h1;
    const grade = String(row2[i] || '').trim();
    if (GRADE_SET.has(grade) && currentCat) return `${currentCat} ${grade}`;
    return h1 || String(row2[i] || '').trim();
  });
}

function loadFromAoa(data, name) {
  const GRADE_SET = new Set(['A+','A','B+','B','C+','C','D+','D','E']);
  const r0 = data[0]?.map(c => String(c||'').trim()) || [];
  const r1 = data[1]?.map(c => String(c||'').trim()) || [];
  const r2 = data[2]?.map(c => String(c||'').trim()) || [];
  let headers, dataRows, gradeRow;

  if (r0[0] === 'Confidential' && r2.some(v => GRADE_SET.has(v))) {
    // Stock Profiling 형식: Row 1="Confidential", Row 2=헤더, Row 3=등급, Row 4+=데이터
    // 합성 헤더를 만들지 말고 원본 헤더(r1) 유지
    headers = r1;
    gradeRow = r2;
    dataRows = data.slice(3);
  } else if (r1.some(v => GRADE_SET.has(v)) && data.length > 2) {
    // 대안 형식: Row 1=헤더, Row 2=등급, Row 3+=데이터
    headers = r0;
    gradeRow = r1;
    dataRows = data.slice(2);
  } else {
    // 등급 행이 없는 형식 (예: Stock Profiling 입력 원본)
    headers = r0;
    gradeRow = null;
    dataRows = data.slice(1);
  }

  dataRows = dataRows.filter(r => r.some(c => String(c||'').trim() !== ''));
  const json = dataRows.map(row => {
    const obj = {};
    headers.forEach((h, i) => { obj[h] = row[i] ?? ''; });
    return obj;
  });

  // gradeRow를 메타데이터로 저장 (profileRow에서 사용)
  if (gradeRow) {
    _gradeRowMeta = gradeRow;
  }

  if (/\.(xlsx|xls)$/i.test(name)) {
    _convertedJson = json;
    _convertedJsonName = name.replace(/\.(xlsx|xls)$/i, '.json');
    document.getElementById('jsonBannerDesc').textContent = ` · ${_convertedJsonName} — DRM 없이 재사용 가능`;
    document.getElementById('jsonBanner').classList.add('show');
  }
  loadFromJson(json, name);
}

function loadFromJson(json, name) {
  colIdx = {};
  if (!json || !json.length || json[0] == null) {
    showToast('❌ 데이터 행이 없습니다. JSON 파일 구조를 확인해 주세요.');
    hideProgress(); return;
  }
  originalHeaders = Object.keys(json[0]);
  allRows = json.map(obj => originalHeaders.map(k => obj[k] ?? ''));
  if (!_convertedJson) document.getElementById('jsonBanner').classList.remove('show');
  runProfiling(name);
}

function downloadConvertedJson() {
  if (!_convertedJson) return;
  const blob = new Blob([JSON.stringify(_convertedJson, null, 2)], { type: 'application/json' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = _convertedJsonName;
  a.click();
  URL.revokeObjectURL(a.href);
  showToast(`💾 ${_convertedJsonName} 저장 완료`);
}

function runProfiling(name) {
  showProgress(`${allRows.length}행 프로파일링 중...`);
  setTimeout(() => {
    processedRows = allRows.map((row,idx) => profileRow(row,idx));
    renderAll(name);
    hideProgress();
    showToast(`✅ ${allRows.length.toLocaleString()}행 분석 완료`);
  }, 80);
}

// ═══════════════════════════════════════════
// 8. PROFILING ENGINE
// ═══════════════════════════════════════════
function get(row, key) {
  const i = colIdx[key];
  if (i<0||i===undefined) return '';
  const v = row[i];
  return v==null?'':String(v).trim();
}

function profileRow(row, idx) {
  if (!Object.keys(colIdx).length) colIdx = findColIdx(originalHeaders);

  // 1. 필수 필드 추출
  const model = get(row, 'model_name');
  const storage = get(row, 'storage_gb');
  const marketing = get(row, 'marketing_name');
  const manufacturer = get(row, 'manufacturer');
  const sku = get(row, 'sku');
  const price = parseFloat(get(row, 'price_usd'));

  // 2. M~AM 컬럼(등급별 Y/N)에서 Y인 카테고리/등급 수집
  const foundGrades = { CRN: new Set(), Refurbish: new Set(), Recycling: new Set() };
  let hasAnyGrade = false;

  for (let i = 0; i < originalHeaders.length; i++) {
    const gradeInfo = _gradeColMap[i];
    if (!gradeInfo) continue;

    const cellValue = String(row[i] || '').trim().toUpperCase();
    if (cellValue === 'Y') {
      foundGrades[gradeInfo.category].add(gradeInfo.grade);
      hasAnyGrade = true;
    }
  }

  // 3. matched_model 결정: E열(Actual Model)을 Stock Profiling과 동일하게 사용
  const actual_model = get(row, 'actual_model');  // E열
  let matched_model = actual_model || model || marketing || '';
  let match_type = 'skipped';

  if (matched_model) {
    match_type = 'direct_rule';
  } else if (hasAnyGrade) {
    match_type = 'direct_rule';
  }

  // 4. 검증 상태 결정 (Stock Profiling: E열(actual_model) 있으면 OK)
  let validation_status = 'OK';
  let errors = [];

  // Stock Profiling 기준: actual_model (E열)이 있으면 기본적으로 OK
  // SKU 검증은 추가 정보로만 사용
  if (!sku) {
    errors.push('SKU 누락');
    // SKU 누락만으로는 ERROR를 일으키지 않음 (actual_model이 있으면 OK)
  }

  // actual_model이 없으면 ERROR
  if (!actual_model) {
    errors.push('모델 정보 누락');
    validation_status = 'ERROR';
  }

  // 5. 점수 계산 (UI용, 기존 로직 유지)
  let score = 50;
  if (validation_status === 'OK') score += 20;
  if (model) score += 5;
  if (sku) score += 5;
  if (!isNaN(price)) score += 5;
  const ram = parseInt(get(row, 'ram_gb'));
  if (!isNaN(ram)) score += 5;
  score = Math.min(100, Math.max(0, score));

  // 6. 카테고리 분류 (UI용)
  const category = classifyStandard(model, price, get(row, 'condition'), get(row, 'network_lock'));

  // 7. 결과 객체 반환
  return {
    row: row,
    model: model,
    sku: sku,
    validation_status: validation_status,
    error_reason: errors.join('; ') || '',
    matched_model: matched_model,
    match_type: match_type,
    model_category: category,
    profiling_score: score.toFixed(1),
    master_flag: validation_status === 'OK' && score >= 50 && model && sku ? 'Y' : 'N'
  };
}

function classifyLegacy(row, model) {
  if (get(row,'crn').toUpperCase()==='Y') return classifyByKeywords(model)||'flagship';
  if (get(row,'refurbish').toUpperCase()==='Y') return 'refurbished';
  return classifyByKeywords(model)||'unknown';
}

function classifyStandard(model, price, condition, lock) {
  const cond=(condition||'').toLowerCase(), lk=(lock||'').toLowerCase();
  if (/refurb|used|renewed|리퍼|중고/.test(cond)) return 'refurbished';
  if (/locked|carrier|잠금/.test(lk)) return 'carrier-locked';
  if (/unlocked|global|언락/.test(lk)) return 'global/unlocked';
  const byKw = classifyByKeywords(model);
  if (byKw) return byKw;
  if (!isNaN(price)) {
    if (price>=800) return 'flagship';
    if (price>=400) return 'premium mid-range';
    if (price>=200) return 'mid-range';
    if (price>=0)   return 'low-end';
  }
  return 'unknown';
}

function classifyByKeywords(model) {
  const mn = (model||'').toUpperCase();
  for (const {keyword, category} of (activeRules.categoryKeywords||[])) {
    if (keyword && mn.includes(keyword.toUpperCase())) return category;
  }
  return null;
}

// ═══════════════════════════════════════════
// 9. GRADE MATRIX VALIDATION
// ═══════════════════════════════════════════
function parseGradeHeader(h) {
  const m = String(h).match(/^(CRN|Refurbish|Refurb|Recycling)\s+([A-E][+]?)$/i);
  if (!m) return null;
  let cat = m[1];
  if (/^refurb$/i.test(cat)) cat = 'Refurbish';
  else cat = cat.charAt(0).toUpperCase() + cat.slice(1).toLowerCase();
  if (cat === 'Crn') cat = 'CRN';
  return { category: cat, grade: m[2] };
}

function getExpectedGrades(modelName, storage, marketingName, manufacturer) {
  const activeGrades = { CRN: new Set(), Refurbish: new Set(), Recycling: new Set() };
  let matched_model = null;
  let match_type = null;

  // ===== CRN 처리 =====
  if (!shouldSkip(modelName, storage, 'CRN')) {
    const crnRule = matchesPrefix(modelName, marketingName, activeRules.crn);
    if (crnRule) {
      const grades = lookupCrnGrades(modelName, storage, crnRule);
      activeGrades.CRN = grades;
      if (grades.size > 0) {
        matched_model = crnRule.prefix;
        match_type = 'direct_rule';
      }
    }
  }

  // ===== Refurbish 처리 =====
  if (!shouldSkip(modelName, storage, 'Refurbish')) {
    const refRule = matchesPrefix(modelName, marketingName, activeRules.refurbish);
    if (refRule) {
      activeGrades.Refurbish = new Set(refRule.grades || []);
      if (!matched_model) {
        matched_model = refRule.prefix;
        match_type = 'direct_rule';
      }
    }
  }

  // ===== Recycling 처리 =====
  if (!shouldSkip(modelName, storage, 'Recycling')) {
    const recycRule = matchesPrefix(modelName, marketingName, activeRules.recycling);
    if (recycRule) {
      const grades = lookupRecyclingGrades(modelName, manufacturer, recycRule);
      activeGrades.Recycling = grades;
      if (!matched_model) {
        matched_model = recycRule.prefix;
        match_type = 'direct_rule';
      }
    }
  }

  // matched_model이 없으면 skipped로 표시
  if (!matched_model) {
    match_type = 'skipped';
  }

  return {
    CRN: activeGrades.CRN,
    Refurbish: activeGrades.Refurbish,
    Recycling: activeGrades.Recycling,
    matched_model: matched_model || '',
    match_type: match_type || ''
  };
}

function getGradeCellClass(gradeInfo, cellValue, expectedGrades) {
  const expected = expectedGrades[gradeInfo.category];
  if (!expected) return '';
  const actual = (cellValue || '').toUpperCase().trim();
  const shouldBeY = expected.has(gradeInfo.grade);
  if (actual === 'Y' && shouldBeY)                        return 'grade-ok-y';
  if ((actual === 'N' || actual === '') && !shouldBeY)    return 'grade-ok-n';
  if (actual === 'Y' && !shouldBeY)                       return 'grade-err-extra';
  if ((actual === 'N' || actual === '') && shouldBeY)     return 'grade-err-missing';
  return '';
}

// ═══════════════════════════════════════════
// 10. RENDER
// ═══════════════════════════════════════════
function renderAll(name) {
  _gradeColMap = {};
  const GRADE_SET = new Set(['A+','A','B+','B','C+','C','D+','D','E']);

  originalHeaders.forEach((h, i) => {
    // 먼저 합성 헤더 형식 시도 (이전 호환성)
    let p = parseGradeHeader(h);

    // 합성 헤더 아니면, 원본 헤더 + _gradeRowMeta 조합 시도
    if (!p && _gradeRowMeta) {
      const headerCat = String(h||'').trim().toLowerCase();
      const headerGrade = String(_gradeRowMeta[i]||'').trim();

      if ((headerCat === 'crn' || headerCat === 'refurbish' || headerCat === 'recycling') &&
          GRADE_SET.has(headerGrade)) {
        let cat = headerCat;
        if (cat === 'crn') cat = 'CRN';
        else if (cat === 'refurbish') cat = 'Refurbish';
        else cat = 'Recycling';
        p = {category: cat, grade: headerGrade};
      }
    }

    if (p) _gradeColMap[i] = p;
  });

  _currentFilter = 'all';
  document.querySelectorAll('.filter-btn').forEach((b,i) => b.classList.toggle('active', i===0));
  renderMatrixTable(processedRows);
  document.getElementById('results').classList.remove('hidden');
}

function filterRows(filter, el) {
  _currentFilter = filter;
  document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
  el.classList.add('active');
  let rows = processedRows;
  if (filter === 'err') rows = processedRows.filter(r => r._hasGradeError);
  if (filter === 'ok')  rows = processedRows.filter(r => !r._hasGradeError);
  renderMatrixTable(rows);
}

function buildMatrixThead() {
  const groups = [];
  for (let i = 0; i < originalHeaders.length; i++) {
    const h = originalHeaders[i];
    const gi = _gradeColMap[i];
    if (gi) {
      const last = groups[groups.length - 1];
      if (last && last.type === 'grade' && last.cat === gi.category) {
        last.cols.push({ grade: gi.grade, i });
      } else {
        groups.push({ type: 'grade', cat: gi.category, cols: [{ grade: gi.grade, i }] });
      }
    } else {
      groups.push({ type: 'info', name: h, i });
    }
  }
  const totalCols = 2 + originalHeaders.length;
  const tr0 = `<tr><th class="th-conf" colspan="${totalCols}">Confidential</th></tr>`;
  let tr1 = '<tr><th class="row-num" rowspan="2">#</th><th class="row-result" rowspan="2">검증</th>';
  for (const g of groups) {
    if (g.type === 'info') {
      tr1 += `<th rowspan="2">${escHtml(g.name)}</th>`;
    } else {
      tr1 += `<th colspan="${g.cols.length}" class="th-group-label">${escHtml(g.cat)}</th>`;
    }
  }
  tr1 += '</tr>';
  let tr2 = '<tr>';
  for (const g of groups) {
    if (g.type === 'grade') {
      for (const { grade } of g.cols) {
        tr2 += `<th class="th-grade-sub">${escHtml(grade)}</th>`;
      }
    }
  }
  tr2 += '</tr>';
  return tr0 + tr1 + tr2;
}

function renderMatrixTable(rows) {
  const ci = findColIdx(originalHeaders);
  const totalCount = processedRows.length;
  document.getElementById('tableHead').innerHTML = buildMatrixThead();
  const gradeIdxs = Object.keys(_gradeColMap).map(Number);
  const firstGradeIdx = gradeIdxs.length > 0 ? Math.min(...gradeIdxs) : Infinity;
  const tbody = rows.map((r, rowIdx) => {
    const modelName     = ci.model_name     >= 0 ? String(r.row[ci.model_name]     || '') : '';
    const marketingName = ci.marketing_name >= 0 ? String(r.row[ci.marketing_name] || '') : '';
    const storage       = ci.storage_gb     >= 0 ? String(r.row[ci.storage_gb]     || '') : '';
    const manufacturer  = ci.manufacturer   >= 0 ? String(r.row[ci.manufacturer]   || '') : '';
    const expected      = getExpectedGrades(modelName, storage, marketingName, manufacturer);
    let hasErr = false;
    let cells = '';
    r.row.forEach((val, i) => {
      const gi = _gradeColMap[i];
      if (gi) {
        const cls = getGradeCellClass(gi, val, expected);
        if (cls === 'grade-err-missing' || cls === 'grade-err-extra') hasErr = true;
        cells += `<td class="grade-cell ${cls}">${escHtml(String(val))}</td>`;
      } else {
        const infoCls = i < firstGradeIdx ? 'cell-info' : '';
        cells += `<td${infoCls ? ` class="${infoCls}"` : ''}>${escHtml(String(val))}</td>`;
      }
    });
    r._hasGradeError = hasErr;
    const badge = hasErr ? '<span class="badge-err">오류</span>' : '<span class="badge-ok">정상</span>';
    return `<tr><td class="row-num">${rowIdx+1}</td><td class="row-result">${badge}</td>${cells}</tr>`;
  }).join('');
  document.getElementById('tableBody').innerHTML = tbody;
  const totalErr = processedRows.filter(r => r._hasGradeError).length;
  const totalOk  = totalCount - totalErr;
  document.getElementById('resultSummaryText').innerHTML =
    `<span class="sum-filename">${escHtml(rows.length < totalCount
      ? `${rows.length}행 표시 중 (전체 ${totalCount.toLocaleString()}행)`
      : totalCount.toLocaleString() + '행')}</span>` +
    `&nbsp;·&nbsp;<span class="sum-ok">정상 ${totalOk.toLocaleString()}</span>` +
    `&nbsp;·&nbsp;<span class="sum-err">오류 ${totalErr.toLocaleString()}</span>`;
}

// ═══════════════════════════════════════════
// 11. DOWNLOAD (xlsx-js-style)
// ═══════════════════════════════════════════
const ORIG_COL_WIDTHS = [
  2.67,11.67,11.67,14.17,29.17,9.17,14.17,20.33,9.17,9.17,10.33,7.67,
  4.17,4.17,4.17,4.17,4.17,4.17,4.17,4.17,4.17,
  4.17,4.17,4.17,4.17,4.17,4.17,4.17,4.17,4.17,
  4.17,4.17,4.17,4.17,4.17,4.17,4.17,4.17,4.17,
  6.67,14.17,11.67,14.17,11.67
];

function downloadResult() {
  const SX    = window.XLSXStyle || XLSX;
  const ci    = findColIdx(originalHeaders);
  const ncols = originalHeaders.length;
  const wb    = SX.utils.book_new();

  // ===== SHEET 1: Stock Profiling Results =====
  const confRow = Array(ncols + 5).fill(''); confRow[0] = 'Confidential';
  const headerRow = [...originalHeaders, 'Validation_Result', 'Expected_Value', 'Error_Reason', 'Matched_Eligibility_Model', 'Match_Type'];
  const gradeRow = Array(ncols + 5).fill('');
  for (let i = 0; i < ncols; i++) {
    const gi = _gradeColMap[i];
    if (gi) gradeRow[i] = gi.grade;
  }

  const aoa = [
    confRow,
    headerRow,
    gradeRow,
    ...processedRows.map((prow, idx) => {
      const dataRow = [...prow.row.map(v => v ?? '')];
      // Status 값 변환: PASS/FAIL/WARNING → OK/ERROR
      const statusMap = {'PASS': 'OK', 'FAIL': 'ERROR', 'WARNING': 'OK'};
      const resultStatus = statusMap[prow.validation_status] || prow.validation_status;
      dataRow.push(resultStatus);                         // AS: Validation_Result
      dataRow.push('');                                   // AT: Expected_Value
      dataRow.push(prow.error_reason || '');             // AU: Error_Reason
      dataRow.push(prow.matched_model || '');            // AV: Matched_Eligibility_Model
      dataRow.push(prow.match_type || '');               // AW: Match_Type
      return dataRow;
    })
  ];
  const ws  = SX.utils.aoa_to_sheet(aoa);

  // Build merges
  const merges = [];
  merges.push({ s:{r:0,c:0}, e:{r:0,c:ncols+4} });

  let gS=-1, gC='';
  for (let c = 0; c <= ncols; c++) {
    const gi = c < ncols ? _gradeColMap[c] : null;
    if (gi && gi.category === gC) continue;
    if (gS >= 0 && gC) merges.push({ s:{r:1,c:gS}, e:{r:1,c:c-1} });
    gS = gi ? c : -1;
    gC = gi ? gi.category : '';
  }
  for (let c = 0; c < ncols; c++) {
    if (!_gradeColMap[c]) merges.push({ s:{r:1,c}, e:{r:2,c} });
  }
  // Result columns merge with row 3 (single row header)
  for (let c = ncols; c < ncols + 5; c++) {
    merges.push({ s:{r:1,c}, e:{r:2,c} });
  }

  ws['!merges'] = merges;

  // Styling
  const THIN      = { style:'thin', color:{ auto:1 } };
  const BORD      = { top:THIN, bottom:THIN, left:THIN, right:THIN };
  const FONT      = { name:'Roboto', sz:9 };
  const FONT_B    = { name:'Roboto', sz:9, bold:true };
  const FONT_CONF = { name:'Arial', sz:18, italic:false };
  const FONT_RES_HEADER = { name:'Calibri', sz:11, bold:true, color:{rgb:'FFFFFFFF'} };
  const FONT_RES_OK = { name:'Calibri', sz:11 };
  const FONT_RES_ERROR = { name:'Calibri', sz:11, color:{rgb:'FFC62828'}, bold:true };
  const NO_FILL   = { patternType:'none' };
  const WHITE     = { patternType:'solid', fgColor:{ rgb:'FFFFFF' } };
  const DATA_FILL = { patternType:'solid', fgColor:{ rgb:'EFF8FF' } };
  const ERR_FILL  = { patternType:'solid', fgColor:{ rgb:'FFC000' } };
  const RES_HEADER_FILL = { patternType:'solid', fgColor:{ rgb:'FF1565C0' } };
  const RES_OK_FILL = { patternType:'solid', fgColor:{ rgb:'FFC8E6C9' } };
  const RES_ERROR_FILL = { patternType:'solid', fgColor:{ rgb:'FFFF0000' } };
  const RES_ERROR_TEXT_FILL = { patternType:'solid', fgColor:{ rgb:'FFFFCCCC' } };

  const gradeIdxs = Object.keys(_gradeColMap).map(Number);
  const firstGradeIdx = gradeIdxs.length > 0 ? Math.min(...gradeIdxs) : Infinity;

  // Row 1: Confidential
  for (let c = 0; c < ncols; c++) {
    const ref = SX.utils.encode_cell({r:0,c});
    if (!ws[ref]) ws[ref] = {v:'',t:'s'};
    ws[ref].s = { fill:WHITE, font:FONT_CONF, border:BORD, alignment:{horizontal:'left',vertical:'center'} };
  }

  // Row 2: Headers
  for (let c = 0; c < ncols + 5; c++) {
    const ref = SX.utils.encode_cell({r:1,c});
    if (!ws[ref]) ws[ref] = {v:'',t:'s'};
    if (c >= ncols) {
      // Result columns header
      ws[ref].s = { fill:RES_HEADER_FILL, font:FONT_RES_HEADER, border:NO_FILL,
                    alignment:{horizontal:'center',vertical:'center'} };
    } else {
      ws[ref].s = { fill:NO_FILL, font:FONT_B, border:BORD,
                    alignment:{horizontal:'center',vertical:'center'} };
    }
  }

  // Row 3: Grades
  for (let c = 0; c < ncols; c++) {
    const ref = SX.utils.encode_cell({r:2,c});
    if (!ws[ref]) ws[ref] = {v:'',t:'s'};
    ws[ref].s = { fill:NO_FILL, font:FONT_B, border:BORD,
                  alignment:{horizontal:_gradeColMap[c]?'center':'left',vertical:'center'} };
  }

  // Data rows
  processedRows.forEach((row, rowIdx) => {
    const modelName     = ci.model_name     >= 0 ? String(row.row[ci.model_name]     || '') : '';
    const marketingName = ci.marketing_name >= 0 ? String(row.row[ci.marketing_name] || '') : '';
    const storage       = ci.storage_gb     >= 0 ? String(row.row[ci.storage_gb]     || '') : '';
    const expected      = getExpectedGrades(modelName, storage, marketingName);
    for (let c = 0; c < ncols + 5; c++) {
      const ref = SX.utils.encode_cell({r: 3 + rowIdx, c});
      if (c < ncols) {
        if (!ws[ref]) ws[ref] = { v: row.row[c]??'', t:'s' };
        const gi = _gradeColMap[c];
        let fill = (c < firstGradeIdx && !gi) ? DATA_FILL : NO_FILL;
        if (gi) {
          const cls = getGradeCellClass(gi, row.row[c], expected);
          if (cls === 'grade-err-missing' || cls === 'grade-err-extra') fill = ERR_FILL;
        }
        ws[ref].s = { fill, font:FONT, border:BORD,
                      alignment:{ horizontal: gi ? 'center':'left', vertical:'center' } };
      } else {
        // Result columns
        let cellValue = '';
        let cellFill = NO_FILL;
        let cellFont = FONT_RES_OK;

        if (c === ncols) {
          // AS: Validation_Result
          const statusMap = {
            'PASS': 'OK',
            'FAIL': 'ERROR',
            'WARNING': 'ERROR'
          };
          const rawStatus = row.validation_status || '';
          cellValue = statusMap[rawStatus] || rawStatus;

          if (cellValue === 'OK') {
            cellFill = RES_OK_FILL;
            cellFont = { name:'Calibri', sz:11, color:{rgb:'FF1B5E20'}, bold:true };
          } else if (cellValue === 'ERROR') {
            cellFill = RES_ERROR_FILL;
            cellFont = { name:'Calibri', sz:11, color:{rgb:'FFFFFFFF'}, bold:true };
          }
        } else if (c === ncols + 1) {
          // AT: Expected_Value
          cellValue = '';
          cellFont = FONT_RES_OK;
        } else if (c === ncols + 2) {
          // AU: Error_Reason
          cellValue = row.error_reason || '';
          if (cellValue) {
            cellFill = RES_ERROR_TEXT_FILL;
            cellFont = FONT_RES_ERROR;
          }
        } else if (c === ncols + 3) {
          // AV: Matched_Eligibility_Model
          cellValue = row.matched_model || '';
          cellFont = FONT_RES_OK;
        } else if (c === ncols + 4) {
          // AW: Match_Type
          cellValue = row.match_type || '';
          cellFont = FONT_RES_OK;
        }

        if (!ws[ref]) ws[ref] = { v: cellValue, t:'s' };
        ws[ref].s = { fill:cellFill, font:cellFont, border:NO_FILL,
                      alignment:{ horizontal: c === ncols ? 'center':'left', vertical:'top' } };
      }
    }
  });

  const colWidths = Array.from({length:ncols}, (_,i) => ({ wch: ORIG_COL_WIDTHS[i] ?? 10 }));
  colWidths.push({wch:20}, {wch:15}, {wch:30}, {wch:25}, {wch:15}); // AS, AT, AU, AV, AW
  ws['!cols'] = colWidths;
  ws['!rows'] = [{hpt:37.5},{hpt:18},{hpt:18},...Array(processedRows.length).fill({hpt:14.25})];
  SX.utils.book_append_sheet(wb, ws, 'Stock Profiling');

  // ===== SHEET 2: Validation Rules =====
  const rules = collectRules();
  const rulesWs = buildValidationRulesSheet(rules, wb);
  SX.utils.book_append_sheet(wb, rulesWs, 'Validation_Rules');

  const ts = new Date().toISOString().slice(0,19).replace(/[-T:]/g,'').replace(/(\d{8})(\d{6})/, '$1_$2');
  SX.writeFile(wb, `Stock_Profiling_Result_${ts}.xlsx`);
}

function buildValidationRulesSheet(rules, wb) {
  const SX = window.XLSXStyle || XLSX;
  const rows = [];

  // 색상 정의
  const COLOR_BLUE_DARK = 'FF0D47A1';    // 진한 파란색
  const COLOR_BLUE_LIGHT = 'FFE3F2FD';   // 연한 파란색

  // 폰트 정의 (Default와 Calibri 구분)
  const FONT_TITLE = { name: 'Default', sz: 16, bold: true, color: { rgb: COLOR_BLUE_DARK } };
  const FONT_SECTION = { name: 'Default', sz: 12, bold: true, color: { rgb: 'FFFFFFFF' } };
  const FONT_HEADER = { name: 'Default', sz: 11, bold: true, color: { rgb: COLOR_BLUE_DARK } };
  const FONT_DATA = { name: 'Calibri', sz: 11 };

  // 테두리 정의
  const THIN_BORDER = { style: 'thin', color: { auto: 1 } };
  const BORDER_ALL = { top: THIN_BORDER, bottom: THIN_BORDER, left: THIN_BORDER, right: THIN_BORDER };

  // Row 1: Title
  rows.push(['Stock Profiling 검증 규칙 정의', '']);

  // Row 2: Empty
  rows.push(['', '']);

  // 1. Channel Definitions
  rows.push(['1. 채널 정의 (Channel Definitions)', '']);
  rows.push(['채널', '정의']);

  const channels = [
    { name: 'CRN', desc: 'N-1 ~ N-3 (Bar: S25/S24/S23), N ~ N-2 (FF: FF7/FF6/FF5) | Memory Variant Specific: Y | Grades: A/A+, B/B+, C/C+, D/D+' },
    { name: 'Refurbish', desc: 'N ~ N-5 (Bar: S26/S25/S24/S23/S22/S21), Note20F, FF5+ | Memory Variant Specific: N | Grades: A+, B+, C+' },
    { name: 'Auction', desc: 'Non-CRN/Refurb Eligible (All OEMs) | Grades: A/A+, B/B+, C/C+, D/D+ → Recycling 컬럼에 반영' },
    { name: 'R2Destroy1', desc: 'Samsung Only: A series N-6+, J/M/F Series, S-series N-8+, A0X-A10, Xcover | Grades: A+~E → Recycling 컬럼에 반영' },
    { name: 'R2Destroy2', desc: 'All OEMs, All Models (Fail data clear) | Grade: E → Recycling 컬럼에 반영' },
    { name: 'BuyersRemorse', desc: 'Samsung Only, Allowable Return Window | Grade matrix 미반영' }
  ];
  channels.forEach(ch => rows.push([ch.name, ch.desc]));

  // Empty row
  rows.push(['', '']);

  // 2. CRN 규칙
  rows.push(['2. CRN 규칙', '']);
  rows.push(['항목', '정의']);

  const crnGrades = rules.crn && rules.crn[0] ? rules.crn[0].grades.join(', ') : 'A+, A, B+, B, C+, C, D+, D';
  rows.push(['적용 Grade', crnGrades]);
  rows.push(['Storage 구분 여부', 'Y (storage별 상이, Eligibility 파일 참조)']);

  const crnPrefixes = (rules.crn || []).map(r => r.prefix).filter(p => p).join(', ');
  const crnPrefixesDisplay = crnPrefixes || 'GALAXY S23, GALAXY S24, GALAXY S25, GALAXY Z FLIP5, GALAXY Z FLIP6, GALAXY Z FLIP7, GALAXY Z FOLD5, GALAXY Z FOLD6, GALAXY Z FOLD7';
  rows.push(['대상 모델 (Model Prefixes)', crnPrefixesDisplay]);

  rows.push(['', '']);

  // 3. Refurbish 규칙
  rows.push(['3. Refurbish 규칙', '']);
  rows.push(['항목', '정의']);

  const refGrades = rules.refurbish && rules.refurbish[0] ? rules.refurbish[0].grades.join(', ') : 'A+, B+, C+';
  rows.push(['적용 Grade', refGrades]);
  rows.push(['Storage 구분 여부', 'N (storage 무관 고정 Grade 적용)']);

  const refPrefixes = (rules.refurbish || []).map(r => r.prefix).filter(p => p).join(', ');
  const refPrefixesDisplay = refPrefixes || 'GALAXY S21, GALAXY S22, GALAXY S23, GALAXY S24, GALAXY S25, GALAXY S26, GALAXY NOTE20, GALAXY Z FLIP5, GALAXY Z FLIP6, GALAXY Z FLIP7, GALAXY Z FOLD5, GALAXY Z FOLD6, GALAXY Z FOLD7';
  rows.push(['대상 모델 (Model Prefixes)', refPrefixesDisplay]);

  rows.push(['', '']);

  // 4. Recycling 규칙
  rows.push(['4. Recycling 규칙', '']);
  rows.push(['항목', '정의']);
  rows.push(['R2 Destroy 1', 'Samsung Only: A series N-6+, J/M/F Series, S-series N-8+, A0X-A10, Xcover | Grades: A+~E → Recycling 컬럼에 반영']);
  rows.push(['R2 Destroy 2', 'All OEMs, All Models (Fail data clear) | Grade: E → Recycling 컬럼에 반영']);
  rows.push(['Auction', 'Non-CRN/Refurb Eligible (All OEMs) | Grades: A/A+, B/B+, C/C+, D/D+ → Recycling 컬럼에 반영']);
  rows.push(['Auction 미적용 대상 모델 (R2 Destroy만 적용)', 'GALAXY S10, GALAXY S20, GALAXY S21, GALAXY S22, GALAXY S23, GALAXY S24, GALAXY S25, GALAXY S26, GALAXY NOTE10, GALAXY NOTE20, GALAXY Z, SM-F, SM-S9, SM-S7, SM-S8']);
  rows.push(['Auction 미적용 사유', 'Stock Profiling 실제 데이터 기준: S10세대 이후 / Note10 이후 / Z-series는 Recycling=E만 표시']);

  rows.push(['', '']);

  // 5. CRN Storage 예외
  rows.push(['5. CRN Storage 예외 (해당 Storage는 CRN 비대상)', '']);
  rows.push(['모델', '제외 Storage']);
  const exclusions = (rules.exclusions || []).filter(e => e.category === 'CRN');
  if (exclusions.length > 0) {
    exclusions.forEach(e => rows.push([e.model || '', e.storage || '']));
  } else {
    rows.push(['GALAXY S25 ULTRA', '1TB']);
    rows.push(['GS25 Ultra', '1TB']);
    rows.push(['SM-S938', '1TB']);
  }

  rows.push(['', '']);

  // 6. SM 모델번호 매핑 규칙
  rows.push(['6. SM 모델번호 매핑 규칙', '']);
  rows.push(['구분', '대상 SM 모델번호']);
  rows.push(['CRN 대상', 'SM-S921, SM-S931, SM-S936, SM-S937, SM-S938, SM-F731, SM-F741, SM-F946, SM-F958, SM-S721, SM-S731, SAMSUNG-GS23']);
  rows.push(['Refurbish 대상', 'SM-S921, SM-S931, SM-S936, SM-S937, SM-S938, SM-F731, SM-F741, SM-F946, SM-F958, SM-S721, SM-S731, SM-F936, SAMSUNG-GS23']);

  rows.push(['', '']);

  // 7. 검증 제외 모델 패턴
  rows.push(['7. 검증 제외 모델 패턴 (와일드카드/비특정 모델)', '']);
  rows.push(['구분', '패턴']);
  rows.push(['시작 문자열 일치', 'ANY GALAXY, ANY-GALAXY, ANY ANDROID, ANY-ANDROID, ANY-SMARTPHONE, ANY-OTHER, OTHER SAMSUNG, OTHER ANDROID, GALAXY TAB']);
  rows.push(['정확히 일치', 'TABLET, GALAXY-TAB-A9, GALAXY-TAB-A9+, ANY-SMARTPHONE']);

  const aoa = rows;
  const ws = SX.utils.aoa_to_sheet(aoa);

  // Column widths
  ws['!cols'] = [{wch:30}, {wch:95}];

  // Row heights and styling
  const merges = [];
  const rowHeights = {};

  // Row 1: Title
  rowHeights[0] = {hpt: 22}; // Default height for title
  ws['A1'].s = { font: FONT_TITLE, alignment: { horizontal: 'left', vertical: 'bottom' } };

  // Row 2: Empty
  rowHeights[1] = {hpt: 14.25};

  // Row 3: Section 1
  rowHeights[2] = {hpt: 22};
  merges.push({s:{r:2,c:0}, e:{r:2,c:1}});
  ws['A3'].s = { font: FONT_SECTION, fill: {patternType:'solid', fgColor:{rgb:COLOR_BLUE_DARK}},
                alignment: {horizontal:'left', vertical:'center'} };

  // Row 4: Header
  ws['A4'].s = { font: FONT_HEADER, fill: {patternType:'solid', fgColor:{rgb:COLOR_BLUE_LIGHT}},
                border: BORDER_ALL, alignment: {horizontal:'center', vertical:'center'} };
  ws['B4'].s = { font: FONT_HEADER, fill: {patternType:'solid', fgColor:{rgb:COLOR_BLUE_LIGHT}},
                border: BORDER_ALL, alignment: {horizontal:'center', vertical:'center'} };

  // Rows 5-10: Data
  for (let i = 5; i <= 10; i++) {
    const row = i - 1;
    if (aoa[row]) {
      const contentLength = (aoa[row][1] || '').length;
      rowHeights[i-1] = {hpt: contentLength > 50 ? 28 : 16};

      ws[SX.utils.encode_cell({r:row,c:0})].s = { font: FONT_DATA, border: BORDER_ALL,
                                                    alignment: {horizontal:'left', vertical:'top', wrapText:true} };
      ws[SX.utils.encode_cell({r:row,c:1})].s = { font: FONT_DATA, border: BORDER_ALL,
                                                    alignment: {horizontal:'left', vertical:'top', wrapText:true} };
    }
  }

  // Row 11: Empty
  rowHeights[10] = {hpt: 14.25};

  // Row 12: Section 2
  rowHeights[11] = {hpt: 22};
  merges.push({s:{r:11,c:0}, e:{r:11,c:1}});
  ws['A12'].s = { font: FONT_SECTION, fill: {patternType:'solid', fgColor:{rgb:COLOR_BLUE_DARK}},
                alignment: {horizontal:'left', vertical:'center'} };

  // Row 13: Header
  ws['A13'].s = { font: FONT_HEADER, fill: {patternType:'solid', fgColor:{rgb:COLOR_BLUE_LIGHT}},
                border: BORDER_ALL, alignment: {horizontal:'center', vertical:'center'} };
  ws['B13'].s = { font: FONT_HEADER, fill: {patternType:'solid', fgColor:{rgb:COLOR_BLUE_LIGHT}},
                border: BORDER_ALL, alignment: {horizontal:'center', vertical:'center'} };

  // Rows 14-16: Data
  for (let i = 14; i <= 16; i++) {
    const row = i - 1;
    if (aoa[row]) {
      const contentLength = (aoa[row][1] || '').length;
      rowHeights[i-1] = {hpt: contentLength > 50 ? 28 : 16};

      ws[SX.utils.encode_cell({r:row,c:0})].s = { font: FONT_DATA, border: BORDER_ALL,
                                                    alignment: {horizontal:'left', vertical:'top', wrapText:true} };
      ws[SX.utils.encode_cell({r:row,c:1})].s = { font: FONT_DATA, border: BORDER_ALL,
                                                    alignment: {horizontal:'left', vertical:'top', wrapText:true} };
    }
  }

  // Row 17: Empty
  rowHeights[16] = {hpt: 14.25};

  // Row 18: Section 3
  rowHeights[17] = {hpt: 22};
  merges.push({s:{r:17,c:0}, e:{r:17,c:1}});
  ws['A18'].s = { font: FONT_SECTION, fill: {patternType:'solid', fgColor:{rgb:COLOR_BLUE_DARK}},
                alignment: {horizontal:'left', vertical:'center'} };

  // Row 19: Header
  ws['A19'].s = { font: FONT_HEADER, fill: {patternType:'solid', fgColor:{rgb:COLOR_BLUE_LIGHT}},
                border: BORDER_ALL, alignment: {horizontal:'center', vertical:'center'} };
  ws['B19'].s = { font: FONT_HEADER, fill: {patternType:'solid', fgColor:{rgb:COLOR_BLUE_LIGHT}},
                border: BORDER_ALL, alignment: {horizontal:'center', vertical:'center'} };

  // Rows 20-22: Data
  for (let i = 20; i <= 22; i++) {
    const row = i - 1;
    if (aoa[row]) {
      const contentLength = (aoa[row][1] || '').length;
      rowHeights[i-1] = {hpt: contentLength > 50 ? 28 : 16};

      ws[SX.utils.encode_cell({r:row,c:0})].s = { font: FONT_DATA, border: BORDER_ALL,
                                                    alignment: {horizontal:'left', vertical:'top', wrapText:true} };
      ws[SX.utils.encode_cell({r:row,c:1})].s = { font: FONT_DATA, border: BORDER_ALL,
                                                    alignment: {horizontal:'left', vertical:'top', wrapText:true} };
    }
  }

  ws['!merges'] = merges;
  ws['!rows'] = Object.keys(rowHeights).map(k => rowHeights[parseInt(k)]);

  return ws;
}

// ═══════════════════════════════════════════
// 12. UTILS
// ═══════════════════════════════════════════
function resetData() {
  processedRows = []; originalHeaders = []; _gradeColMap = {};
  _convertedJson = null; _convertedJsonName = null;
  document.getElementById('results').classList.add('hidden');
  document.getElementById('jsonBanner').classList.remove('show');
  document.getElementById('progressWrap').style.display = 'none';
  document.getElementById('fileInput').value = '';
  document.getElementById('tableHead').innerHTML = '';
  document.getElementById('tableBody').innerHTML = '';
}

function escHtml(s) {
  return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

function showProgress(msg) {
  document.getElementById('progressWrap').style.display='block';
  document.getElementById('progressText').textContent=msg;
  document.getElementById('results').classList.add('hidden');
}
function hideProgress() { document.getElementById('progressWrap').style.display='none'; }

let toastTimer;
function showToast(msg) {
  const t=document.getElementById('toast');
  t.textContent=msg; t.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer=setTimeout(()=>t.classList.remove('show'),2800);
}
