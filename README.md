# Coolect 📸
### אלבום דיגיטלי חכם לאירועים — QR → העלאה → גלריה בזמן אמת

---

## מה יש פה

| קובץ | מה עושה |
|---|---|
| `src/pages/Home.jsx` | Landing Page מלא |
| `src/pages/CreateEvent.jsx` | יצירת אירוע + קבלת QR |
| `src/pages/Upload.jsx` | דף לאורחים — סורקים QR ומעלים תמונות |
| `src/pages/EventGallery.jsx` | גלריה בזמן אמת למארגן + הורדת ZIP |
| `src/pages/Dashboard.jsx` | ניהול כל האירועים |
| `src/firebase.js` | **← כאן מכניסים את פרטי Firebase שלך** |
| `firestore.rules` | חוקי אבטחה ל-Firestore |
| `storage.rules` | חוקי אבטחה ל-Storage |

---

## שלב 1 — Firebase Setup (10 דקות)

### 1.1 צור פרויקט
1. כנס ל: https://console.firebase.google.com
2. לחץ **Add project** → תן שם (לדוג׳: `coolect-prod`)
3. השבת Google Analytics (לא צריך) → **Create project**

### 1.2 הפעל Firestore
1. בתפריט שמאל → **Firestore Database**
2. לחץ **Create database**
3. בחר **Start in production mode** → בחר region: `europe-west1` (הכי קרוב לישראל) → **Done**

### 1.3 הפעל Storage
1. בתפריט שמאל → **Storage**
2. לחץ **Get started** → **Next** → **Done**

### 1.4 הפעל Anonymous Auth
1. בתפריט שמאל → **Authentication** → **Get started**
2. לשונית **Sign-in method**
3. לחץ **Anonymous** → Enable → **Save**

### 1.5 קח את ה-Config
1. לחץ על גלגל השיניים (⚙️) → **Project settings**
2. גלול למטה → **Your apps** → לחץ **</>** (Web)
3. תן שם לאפליקציה → **Register app**
4. תראה קוד כזה — **העתק אותו:**

```javascript
const firebaseConfig = {
  apiKey: "AIza...",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abc123"
};
```

5. פתח `src/firebase.js` והחלף את הערכים

### 1.6 העלה חוקי אבטחה
1. **Firestore Rules** → לשונית Rules → העתק תוכן `firestore.rules` → Publish
2. **Storage Rules** → לשונית Rules → העתק תוכן `storage.rules` → Publish

---

## שלב 2 — הרץ לוקאלית

```bash
# התקן תלויות
npm install

# הרץ dev server
npm run dev
```

פתח http://localhost:5173 🎉

---

## שלב 3 — Deploy ל-Vercel (5 דקות)

### 3.1 GitHub
```bash
git init
git add .
git commit -m "initial commit"
# צור repo ב-GitHub ודחוף
git remote add origin https://github.com/YOUR_USER/coolect.git
git push -u origin main
```

### 3.2 Vercel
1. כנס ל: https://vercel.com → **New Project**
2. ייבא את ה-repo מ-GitHub
3. Framework: **Vite** (Vercel מזהה אוטומטית)
4. לחץ **Deploy** ✅

האתר חי! קבל כתובת `coolect.vercel.app` (אפשר לחבר דומיין אישי לאחר מכן)

---

## מבנה Firestore

```
events/
  {eventId}/
    name: "חתונת דנה ואורי"
    date: "2024-08-15"
    description: "..."
    createdBy: "uid_of_organizer"
    createdAt: Timestamp
    photoCount: 247
    active: true
    
    photos/
      {photoId}/
        url: "https://firebasestorage..."
        fileName: "1234567_abc.jpg"
        uploadedAt: Timestamp
        size: 2048000
```

---

## זרימת המשתמשים

```
מארגן:
  / → /create → [ממלא שם ותאריך] → מקבל QR + לינק
  /dashboard → רואה כל האירועים
  /gallery/:id → גלריה חיה + הורדת ZIP

אורח (בלי הרשמה):
  סורק QR → /upload/:id → בוחר תמונות → מעלה
```

---

## פיצ'רים מובנים

✅ יצירת אירוע + QR ייחודי  
✅ העלאת תמונות ללא הרשמה  
✅ גלריה בזמן אמת (Firestore onSnapshot)  
✅ Lightbox לצפייה בתמונות  
✅ הורדת ZIP של כל התמונות  
✅ שיתוף בוואטסאפ בקליק  
✅ העתקת קישור  
✅ הפעלה/השבתה של אירוע  
✅ דשבורד לכל האירועים  
✅ מונה תמונות בזמן אמת  
✅ Drag & drop להעלאה  
✅ Progress bar לכל תמונה  
✅ Lightbox עם ניווט  
✅ RTL עברית מלא  
✅ Responsive מובייל  

---

## השלבים הבאים (אחרי Deploy)

- [ ] חיבור דומיין אישי ב-Vercel
- [ ] הוספת Stripe לתשלומים
- [ ] מיילים אוטומטיים (Resend)
- [ ] עיצוב Landing Page מלוקק
- [ ] אנליטיקס (Mixpanel / PostHog)
