# Οδηγίες Ρύθμισης — Lab Reports System
# Εργαστήριο Μοριακής Οικολογίας

Σύστημα 3 αρχείων:
  Code.gs       → Google Apps Script (backend/API)
  member.html   → Σελίδα για τα μέλη του εργαστηρίου
  dashboard.html → PI Dashboard (μόνο εσύ)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
ΒΗΜΑ 1 — Δημιούργησε το Google Sheet
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
1. Πήγαινε στο https://sheets.google.com
2. Δημιούργησε νέο spreadsheet
3. Δώσε του όνομα π.χ. "Lab Reports 2026"
4. Αντέγραψε το ID από τη διεύθυνση URL:
   https://docs.google.com/spreadsheets/d/ >>>ΑΥΤΟ<<< /edit
5. Άνοιξε το Code.gs και βάλε το ID στη γραμμή:
   var SHEET_ID = 'ΒΑΛΕ_ΕΔΩ_ΤΟ_ID';
6. Επίσης άλλαξε το PI_TOKEN σε κάτι δικό σου:
   var PI_TOKEN = 'κάτι-μυστικό-2026';

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
ΒΗΜΑ 2 — Ρύθμισε το Google Apps Script
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
1. Στο Google Sheet: Επεκτάσεις → Apps Script
2. Διέγραψε τον υπάρχοντα κώδικα
3. Κόπιαρε ΟΛΟ το περιεχόμενο του Code.gs και επικόλλησε
4. Αποθήκευσε (Ctrl+S)
5. Επέλεξε τη συνάρτηση "setupSheets" από το dropdown
6. Πάτησε ▶ Run — θα σου ζητήσει άδειες, δώσε τες
7. Ελέγξε ότι δημιουργήθηκαν τα tabs: Members, Tasks, Reports

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
ΒΗΜΑ 3 — Deploy ως Web App
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
1. Στο Apps Script: Deploy → New deployment
2. Τύπος: Web app
3. Ρυθμίσεις:
   - Execute as: Me (η δική σου Google account)
   - Who has access: Anyone  ← ΣΗΜΑΝΤΙΚΟ
4. Πάτησε Deploy
5. Αντέγραψε το URL που εμφανίζεται (μοιάζει με:
   https://script.google.com/macros/s/XXXX.../exec)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
ΒΗΜΑ 4 — Ενημέρωσε τα HTML αρχεία
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Στο member.html ΚΑΙ στο dashboard.html, βρες τη γραμμή:
   var API_URL = 'PASTE_YOUR_APPS_SCRIPT_URL_HERE';
και αντικατέστησε με το URL του βήματος 3.

Στο dashboard.html βρες επίσης:
   (δεν χρειάζεται αλλαγή — το token το πληκτρολογείς κατά την είσοδο)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
ΒΗΜΑ 5 — Ανέβασε τα HTML αρχεία
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
ΕΠΙΛΟΓΗ Α — GitHub Pages (συνιστάται, δωρεάν):
1. Δημιούργησε λογαριασμό στο github.com
2. New repository → "lab-reports" → Public
3. Ανέβασε member.html και dashboard.html
4. Settings → Pages → Branch: main → Save
5. Σε ~1 λεπτό έχεις:
   https://ΧΡΗΣΤΗΣ.github.io/lab-reports/member.html
   https://ΧΡΗΣΤΗΣ.github.io/lab-reports/dashboard.html

ΕΠΙΛΟΓΗ Β — Google Drive (πιο απλό):
1. Ανέβασε τα αρχεία στο Google Drive
2. Κλικ δεξί → Share → Anyone with link
3. Μοιράσου το link στα μέλη
   (Σημείωση: τα HTML αρχεία ανοίγουν ως preview, όχι ως app)
   → Καλύτερα το GitHub Pages

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
ΒΗΜΑ 6 — Μοίρασε τα links
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Στα μέλη του εργαστηρίου:
  → https://ΧΡΗΣΤΗΣ.github.io/lab-reports/member.html
  (επιλέγουν το όνομά τους κατά την είσοδο)

Εσύ (PI):
  → https://ΧΡΗΣΤΗΣ.github.io/lab-reports/dashboard.html
  (πληκτρολογείς το token που έβαλες στο Code.gs)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
ΠΡΟΣΘΗΚΗ/ΑΛΛΑΓΗ ΜΕΛΩΝ Ή TASKS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Απλά επεξεργάσου τα αντίστοιχα tabs στο Google Sheet:
  - Members → προσθαφαίρεσε μέλη
  - Tasks   → προσθαφαίρεσε/τροποποίησε tasks και αναθέσεις
Δεν χρειάζεται αλλαγή κώδικα!

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
ΣΥΝΟΨΗ ΚΟΣΤΟΥΣ
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Google Sheets:     ΔΩΡΕΑΝ
Google Apps Script: ΔΩΡΕΑΝ (6 λεπ/ημέρα εκτέλεσης — υπεραρκετό)
GitHub Pages:      ΔΩΡΕΑΝ
ΣΥΝΟΛΟ:            0€
