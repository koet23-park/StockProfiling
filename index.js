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
        loadFromJson(Array.isArray(arr) ? arr : [arr], file.name);
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
      showToast('❌ Excel 읽기 실패. DRM 보호 파일은 로컬에서 JSON으로 변환 후 업로드해 주세요.');
      hideProgress();
    }
  };
  reader.onerror = () => {
    showToast('❌ Excel 읽기 실패. DRM 보호 파일은 로컬에서 JSON으로 변환 후 업로드해 주세요.');
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
  let headers, dataRows;
  if (r0[0] === 'Confidential' && r2.some(v => GRADE_SET.has(v))) {
    headers  = buildCompositeHeaders(r1, r2);
    dataRows = data.slice(3);
  } else if (r1.some(v => GRADE_SET.has(v)) && data.length > 2) {
    headers  = buildCompositeHeaders(r0, r1);
    dataRows = data.slice(2);
  } else {
    headers  = r0;
    dataRows = data.slice(1);
  }
  dataRows = dataRows.filter(r => r.some(c => String(c||'').trim() !== ''));
  const json = dataRows.map(row => {
    const obj = {};
    headers.forEach((h, i) => { obj[h] = row[i] ?? ''; });
    return obj;
  });
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
  const model = get(row,'model_name'), sku = get(row,'sku');
  const errors=[], warnings=[];
  if (!model) errors.push('모델명 누락');
  if (!sku)   errors.push('SKU 누락');
  const price=parseFloat(get(row,'price_usd')), qty=parseInt(get(row,'quantity'));
  if (!isNaN(price)&&(price<0||price>5000)) warnings.push(`가격 범위 이상: ${price}`);
  if (!isNaN(qty)&&qty<0) errors.push(`수량 음수: ${qty}`);
  const isLegacy = colIdx.crn >= 0;
  const category = isLegacy
    ? classifyLegacy(row, model)
    : classifyStandard(model, price, get(row,'condition'), get(row,'network_lock'));
  let score=50;
  if (!errors.length) score+=20;
  if (!warnings.length) score+=10;
  if (model) score+=5; if (sku) score+=5;
  if (!isNaN(price)) score+=5; if (!isNaN(parseInt(get(row,'ram_gb')))) score+=5;
  score = Math.min(100,Math.max(0,score));
  const status = errors.length?'FAIL':warnings.length?'WARNING':'PASS';
  const masterFlag = (status==='PASS'||status==='WARNING')&&score>=50&&model&&sku?'Y':'N';
  return {row, model, sku, validation_status:status,
    error_reason:[...errors,...warnings].join('; ')||'',
    model_category:category, profiling_score:score.toFixed(1), master_flag:masterFlag};
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

function getExpectedGrades(modelName, storage, marketingName) {
  const mn   = ((marketingName || modelName || '')).toUpperCase().trim();
  const stor = (storage || '').toUpperCase().trim();
  const findGrades = (ruleList) => {
    for (const rule of (ruleList || [])) {
      if (rule.prefix && mn.includes(rule.prefix.toUpperCase())) return new Set(rule.grades || []);
    }
    return new Set();
  };
  const crnGrades = findGrades(activeRules.crn);
  for (const excl of (activeRules.exclusions || [])) {
    if (excl.category === 'CRN' &&
        mn.includes((excl.model || '').toUpperCase()) &&
        stor.includes((excl.storage || '').toUpperCase())) {
      crnGrades.clear(); break;
    }
  }
  return { CRN: crnGrades, Refurbish: findGrades(activeRules.refurbish), Recycling: findGrades(activeRules.recycling) };
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
  originalHeaders.forEach((h, i) => {
    const p = parseGradeHeader(h);
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
    const expected      = getExpectedGrades(modelName, storage, marketingName);
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
  const row1 = [], row2 = [];
  let seenCat = '';
  for (let i = 0; i < ncols; i++) {
    const gi = _gradeColMap[i];
    if (gi) {
      row1.push(gi.category === seenCat ? '' : gi.category); seenCat = gi.category;
      row2.push(gi.grade);
    } else { row1.push(originalHeaders[i]); row2.push(''); seenCat = ''; }
  }
  const confRow = Array(ncols).fill(''); confRow[0] = 'Confidential';
  const aoa = [confRow, row1, row2, ...processedRows.map(r => r.row.map(v => v ?? ''))];
  const ws  = SX.utils.aoa_to_sheet(aoa);
  const merges = [];
  merges.push({ s:{r:0,c:0}, e:{r:0,c:ncols-1} });
  for (let c = 0; c < ncols; c++) {
    if (!_gradeColMap[c]) merges.push({ s:{r:1,c}, e:{r:2,c} });
  }
  let gS=-1, gC='';
  for (let c = 0; c <= ncols; c++) {
    const gi = c < ncols ? _gradeColMap[c] : null;
    if (gi && gi.category === gC) continue;
    if (gS >= 0) merges.push({ s:{r:1,c:gS}, e:{r:1,c:c-1} });
    gS = gi ? c : -1; gC = gi ? gi.category : '';
  }
  ws['!merges'] = merges;
  const THIN      = { style:'thin', color:{ auto:1 } };
  const BORD      = { top:THIN, bottom:THIN, left:THIN, right:THIN };
  const FONT      = { name:'Calibri', sz:11 };
  const FONT_B    = { name:'Calibri', sz:11, bold:true };
  const NO_FILL   = { patternType:'none' };
  const WHITE     = { patternType:'solid', fgColor:{ rgb:'FFFFFF' } };
  const DATA_FILL = { patternType:'solid', fgColor:{ rgb:'EFF8FF' } };
  const ERR_FILL  = { patternType:'solid', fgColor:{ rgb:'FFC000' } };
  const gradeIdxs = Object.keys(_gradeColMap).map(Number);
  const firstGradeIdx = gradeIdxs.length > 0 ? Math.min(...gradeIdxs) : Infinity;
  for (let c = 0; c < ncols; c++) {
    const ref = SX.utils.encode_cell({r:0,c});
    if (!ws[ref]) ws[ref] = {v:'',t:'s'};
    ws[ref].s = { fill:WHITE, font:{...FONT,italic:true}, border:BORD, alignment:{horizontal:'left',vertical:'center'} };
  }
  for (let r = 1; r < 3; r++)
    for (let c = 0; c < ncols; c++) {
      const ref = SX.utils.encode_cell({r,c});
      if (!ws[ref]) ws[ref] = {v:'',t:'s'};
      const gi = _gradeColMap[c];
      ws[ref].s = { fill:NO_FILL, font:FONT_B, border:BORD,
                    alignment:{horizontal: gi||r===1 ? 'center':'left', vertical:'center'} };
    }
  processedRows.forEach((row, rowIdx) => {
    const modelName     = ci.model_name     >= 0 ? String(row.row[ci.model_name]     || '') : '';
    const marketingName = ci.marketing_name >= 0 ? String(row.row[ci.marketing_name] || '') : '';
    const storage       = ci.storage_gb     >= 0 ? String(row.row[ci.storage_gb]     || '') : '';
    const expected      = getExpectedGrades(modelName, storage, marketingName);
    for (let c = 0; c < ncols; c++) {
      const ref = SX.utils.encode_cell({r: 3 + rowIdx, c});
      if (!ws[ref]) ws[ref] = { v: row.row[c]??'', t:'s' };
      const gi = _gradeColMap[c];
      let fill = (c < firstGradeIdx && !gi) ? DATA_FILL : NO_FILL;
      if (gi) {
        const cls = getGradeCellClass(gi, row.row[c], expected);
        if (cls === 'grade-err-missing' || cls === 'grade-err-extra') fill = ERR_FILL;
      }
      ws[ref].s = { fill, font:FONT, border:BORD,
                    alignment:{ horizontal: gi ? 'center':'left', vertical:'center' } };
    }
  });
  ws['!cols'] = Array.from({length:ncols}, (_,i) => ({ wch: ORIG_COL_WIDTHS[i] ?? 10 }));
  ws['!rows'] = [{hpt:37.5},{hpt:18},{hpt:18},...Array(processedRows.length).fill({hpt:14.25})];
  SX.utils.book_append_sheet(wb, ws, 'Stock Profiling');
  const ts = new Date().toISOString().slice(0,19).replace(/[-T:]/g,'').replace(/(\d{8})(\d{6})/, '$1_$2');
  SX.writeFile(wb, `Stock_Profiling_Result_${ts}.xlsx`);
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
