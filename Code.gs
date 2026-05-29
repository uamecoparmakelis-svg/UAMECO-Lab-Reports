// ============================================================
// ΕΡΓΑΣΤΗΡΙΟ ΜΟΡΙΑΚΗΣ ΟΙΚΟΛΟΓΙΑΣ — Google Apps Script Backend
// ============================================================
// Οδηγίες ρύθμισης: βλ. README παρακάτω

var SHEET_ID = '1mTUQMDDQQfgVIXtolFzIAkrt0La1mzMTouEh1l1FwGk'; // ← ΒΑΛΕ ΕΔΩ ΤΟ ID ΤΟΥ GOOGLE SHEET ΣΟΥ
var PI_TOKEN = 'roumelis47!15233'; // ← ΑΛΛΑΞΕ ΣΕ ΚΑΤΙ ΜΥΣΤΙΚΟ

// Ονόματα φύλλων (tabs)
var SHEET_REPORTS = 'Reports';
var SHEET_MEMBERS = 'Members';
var SHEET_TASKS   = 'Tasks';

// ── Βασικά μέλη & tasks (φορτώνονται από το Sheet) ──────────
function getMembers() {
  var ss = SpreadsheetApp.openById(SHEET_ID);
  var sh = ss.getSheetByName(SHEET_MEMBERS);
  var rows = sh.getDataRange().getValues();
  var members = [];
  for (var i = 1; i < rows.length; i++) {
    if (rows[i][0]) members.push({ id: rows[i][0], name: rows[i][1], initials: rows[i][2] });
  }
  return members;
}

function getTasks() {
  var ss = SpreadsheetApp.openById(SHEET_ID);
  var sh = ss.getSheetByName(SHEET_TASKS);
  var rows = sh.getDataRange().getValues();
  var tasks = [];
  for (var i = 1; i < rows.length; i++) {
    if (rows[i][0]) tasks.push({
      id:      rows[i][0],
      label:   rows[i][1],
      freq:    rows[i][2],
      members: rows[i][3].toString().split(',').map(function(s){ return s.trim(); })
    });
  }
  return tasks;
}

// ── HTTP entry point ─────────────────────────────────────────
function doGet(e) {
  var action = e.parameter.action || '';
  var result;
  try {
    if      (action === 'getConfig')   result = actionGetConfig(e);
    else if (action === 'getReports')  result = actionGetReports(e);
    else if (action === 'saveReport')  result = actionSaveReport(e);
    else if (action === 'getDashboard')result = actionGetDashboard(e);
    else result = { error: 'Unknown action' };
  } catch(err) {
    result = { error: err.toString() };
  }
  return ContentService
    .createTextOutput(JSON.stringify(result))
    .setMimeType(ContentService.MimeType.JSON);
}

// ── Actions ──────────────────────────────────────────────────

// Επιστρέφει config (members + tasks) για ένα μέλος
function actionGetConfig(e) {
  var memberId = e.parameter.member || '';
  var members  = getMembers();
  var tasks    = getTasks();
  var member   = members.find(function(m){ return m.id === memberId; });
  if (!member) return { error: 'Member not found' };
  var myTasks  = tasks.filter(function(t){ return t.members.indexOf(memberId) > -1; });
  return { member: member, tasks: myTasks };
}

// Επιστρέφει reports ενός μέλους για μια περίοδο
function actionGetReports(e) {
  var memberId = e.parameter.member || '';
  var period   = e.parameter.period || '';
  var ss = SpreadsheetApp.openById(SHEET_ID);
  var sh = ss.getSheetByName(SHEET_REPORTS);
  var rows = sh.getDataRange().getValues();
  var results = [];
  for (var i = 1; i < rows.length; i++) {
    if (rows[i][0] === period && rows[i][1] === memberId) {
      results.push({ taskId: rows[i][2], status: rows[i][3], note: rows[i][4], updatedAt: rows[i][5] });
    }
  }
  return { reports: results };
}

// Αποθηκεύει / ενημερώνει report
function actionSaveReport(e) {
  var memberId = e.parameter.member || '';
  var period   = e.parameter.period || '';
  var taskId   = e.parameter.task   || '';
  var status   = e.parameter.status || 'pending';
  var note     = e.parameter.note   || '';
  var now      = new Date().toISOString();

  var ss = SpreadsheetApp.openById(SHEET_ID);
  var sh = ss.getSheetByName(SHEET_REPORTS);
  var rows = sh.getDataRange().getValues();

  // Ψάχνουμε αν υπάρχει ήδη εγγραφή
  for (var i = 1; i < rows.length; i++) {
    if (rows[i][0] === period && rows[i][1] === memberId && rows[i][2] === taskId) {
      sh.getRange(i + 1, 4, 1, 3).setValues([[status, note, now]]);
      return { success: true, action: 'updated' };
    }
  }
  // Νέα εγγραφή
  sh.appendRow([period, memberId, taskId, status, note, now]);
  return { success: true, action: 'created' };
}

// Dashboard για τον PI — επιστρέφει όλα
function actionGetDashboard(e) {
  var token  = e.parameter.token || '';
  if (token !== PI_TOKEN) return { error: 'Unauthorized' };
  var period = e.parameter.period || getCurrentPeriod();

  var members = getMembers();
  var tasks   = getTasks();
  var ss = SpreadsheetApp.openById(SHEET_ID);
  var sh = ss.getSheetByName(SHEET_REPORTS);
  var rows = sh.getDataRange().getValues();

  // Χτίζουμε map: memberId -> taskId -> {status, note}
  var reportMap = {};
  for (var i = 1; i < rows.length; i++) {
    if (rows[i][0] !== period) continue;
    var mid = rows[i][1], tid = rows[i][2];
    if (!reportMap[mid]) reportMap[mid] = {};
    reportMap[mid][tid] = { status: rows[i][3], note: rows[i][4], updatedAt: rows[i][5] };
  }

  var summary = members.map(function(m) {
    var myTasks = tasks.filter(function(t){ return t.members.indexOf(m.id) > -1; });
    var done    = 0, pending = 0, missed = 0, taskDetails = [];
    myTasks.forEach(function(t) {
      var r = (reportMap[m.id] || {})[t.id] || { status: 'pending', note: '' };
      if      (r.status === 'done')   done++;
      else if (r.status === 'missed') missed++;
      else                            pending++;
      taskDetails.push({ taskId: t.id, label: t.label, freq: t.freq, status: r.status, note: r.note });
    });
    return { member: m, tasks: taskDetails, done: done, pending: pending, missed: missed,
             pct: myTasks.length ? Math.round(done / myTasks.length * 100) : 0 };
  });

  return { period: period, summary: summary };
}

// ── Βοηθητικές ───────────────────────────────────────────────
function getCurrentPeriod() {
  var d = new Date();
  var y = d.getFullYear();
  var m = ('0' + (d.getMonth() + 1)).slice(-2);
  var h = d.getDate() <= 15 ? 'A' : 'B';
  return y + '-' + m + '-' + h; // π.χ. "2026-06-A"
}

// ── Αρχικοποίηση Sheet (τρέξε μία φορά) ─────────────────────
function setupSheets() {
  var ss = SpreadsheetApp.openById(SHEET_ID);

  // Members tab
  var msh = ss.getSheetByName(SHEET_MEMBERS) || ss.insertSheet(SHEET_MEMBERS);
  msh.clearContents();
  msh.getRange(1,1,1,3).setValues([['id','name','initials']]);
  msh.getRange(2,1,10,3).setValues([
    ['alonaris','Αλωνάρης','ΑΛ'],
    ['spanou','Σπάνου','ΣΠ'],
    ['triantafyllou','Τριανταφύλλου','ΤΡ'],
    ['zachariadou','Ζαχαριάδου','ΖΑ'],
    ['papadaki','Παπαδάκη','ΠΑ'],
    ['protopappas','Πρωτόπαππας','ΠΡ'],
    ['konstantinidis','Κωνσταντινίδης','ΚΩ'],
    ['lepenos','Λεπενού','ΛΕ'],
    ['stranga','Στράγγα','ΣΤ'],
    ['mparklessia','Μπαρκλέσια','ΜΠ'],
  ]);

  // Tasks tab
  var tsh = ss.getSheetByName(SHEET_TASKS) || ss.insertSheet(SHEET_TASKS);
  tsh.clearContents();
  tsh.getRange(1,1,1,4).setValues([['id','label','freq','members']]);
  tsh.getRange(2,1,15,4).setValues([
    ['water','Γέμισμα βαρελιού H₂O','Εβδομαδιαία','alonaris,protopappas'],
    ['tbe','TBE 10X παρασκευή','Εβδομαδιαία','spanou,lepenos'],
    ['washing','Πλύσιμο σκευών','Καθημερινά','spanou,konstantinidis,protopappas,stranga'],
    ['tanks','Πλύσιμο tank ηλεκτροφόρησης','2μηνιαία','triantafyllou,zachariadou'],
    ['gelred','GelRed / Orange G παρασκευή','Μηνιαία','alonaris,stranga'],
    ['ddh2o','Γέμισμα eppendorf ddH₂O','Μηνιαία','papadaki,lepenos,triantafyllou'],
    ['loading','Loading Dye (Orange G)','Μηνιαία','triantafyllou'],
    ['protk','Proteinase-K stock έλεγχος','Εβδομαδιαία','triantafyllou'],
    ['dntps','Αραίωση dNTPs','Κατά ανάγκη','zachariadou,mparklessia'],
    ['autoclave','Αποστείρωση tips/eppendorfs','Εβδομαδιαία','protopappas,konstantinidis'],
    ['ph','pH-μέτρο βαθμονόμηση','6μηνιαία','papadaki'],
    ['orders','Παραγγελίες αναλώσιμων','Εβδομαδιαία','lepenos,konstantinidis'],
    ['cleaning','Καθαρισμός εργαστηρίου','Εβδομαδιαία','alonaris,spanou,triantafyllou,zachariadou,papadaki,protopappas,konstantinidis,lepenos,stranga,mparklessia'],
    ['ethanol','Αιθανόλη 70% / Χλωρίνη 10%','Κατά ανάγκη','stranga'],
    ['ice','Παγομηχανή έλεγχος','Μηνιαία','spanou'],
  ]);

  // Reports tab
  var rsh = ss.getSheetByName(SHEET_REPORTS) || ss.insertSheet(SHEET_REPORTS);
  rsh.clearContents();
  rsh.getRange(1,1,1,6).setValues([['period','memberId','taskId','status','note','updatedAt']]);

  SpreadsheetApp.flush();
  Logger.log('Setup complete!');
}
