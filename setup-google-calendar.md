# 📅 Setup Google Calendar API - Ghid Complet

## 🔧 **Pasul 1: Google Cloud Console**

### 1. Accesează Google Cloud Console
```
https://console.cloud.google.com/
```

### 2. Creează un proiect nou (sau folosește unul existent)
- Click pe proiectul curent în stânga sus
- Selectează "**NEW PROJECT**" sau "**PROIECT NOU**"
- Dă-i un nume: `News Dashboard Calendar`
- Click "**CREATE**"

### 3. Activează Google Calendar API
- În meniul din stânga, mergi la "**APIs & Services**" → "**Library**"
- Caută: "**Google Calendar API**"
- Click pe el și apoi "**ENABLE**"

### 4. Activează Google+ API (opțional dar recomandat)
- Caută: "**Google+ API**"
- Click pe el și apoi "**ENABLE**"

## 🔑 **Pasul 2: Configurare OAuth 2.0**

### 1. Creează Credentials
- Mergi la "**APIs & Services**" → "**Credentials**"
- Click pe "**+ CREATE CREDENTIALS**"
- Selectează "**OAuth client ID**"

### 2. Configurează OAuth Client
- **Application type**: "**Web application**"
- **Name**: `News Dashboard Calendar`
- **Authorized JavaScript origins**:
  ```
  http://localhost:3000
  https://your-domain.com  (dacă e deployed)
  ```
- **Authorized redirect URIs**:
  ```
  http://localhost:3000/api/auth/callback/google
  http://localhost:3000
  ```
- Click "**CREATE**"

### 3. Salvează Credentials
- Vei vedea **Client ID** și **Client Secret**
- Copiază-le în safety! Le vei folosi în environment variables.

## ⚙️ **Pasul 3: Environment Variables**

### 1. Creează fișierul `.env.local` în rădăcina proiectului:
```env
# Google OAuth
GOOGLE_CLIENT_ID=tu-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=tu-client-secret

# NextAuth
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=un-secret-lung-sigur-32-caractere-minim
```

### 2. Exemplu NEXTAUTH_SECRET:
```bash
# Generează un secret sigur:
openssl rand -base64 32
# Sau folosește: node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

## 🚀 **Pasul 4: Testare**

### 1. Pornește aplicația:
```bash
npm run dev
```

### 2. Navighează la:
```
http://localhost:3000/dashboard
```

### 3. Autentificare:
- Widget-ul calendar va afișa "Conectați-vă pentru a vedea calendarul"
- Click pe "Conectare Google"
- Va redirecta către Google OAuth
- Aprobă permisiunile calendarului
- Te va întoarce înapoi la dashboard

## 🔍 **Depanare - Probleme Comune**

### **PROBLEMĂ CRITICĂ: "erderom.ro has not completed the Google verification process"**
**Soluție IMEDIATĂ:**
1. Mergi la Google Cloud Console: https://console.cloud.google.com/
2. Selectează proiectul tău
3. Navighează la "**APIs & Services**" → "**OAuth consent screen**"
4. Verifică status-ul - ar trebui să fie "**Testing**"
5. Scroll down la "**Test users**"
6. Click "**+ ADD USERS**"
7. Adaugă email-ul: `masaproiect@gmail.com`
8. Click "**SAVE**"
9. Așteaptă 1-2 minute pentru propagare
10. Reîncearcă autentificarea

**IMPORTANT:** Pentru aplicații în testing, DOAR utilizatorii din lista "Test users" se pot autentifica!

### **Problemă: "redirect_uri_mismatch"**
**Soluție:**
- Verifică în Google Console la Credentials → OAuth Client ID
- Asigură-te că `http://localhost:3000/api/auth/callback/google` e în "Authorized redirect URIs"
- Verifică că nu există slash-uri extra (`/` la final)

### **Problemă: "invalid_client"**
**Soluție:**
- Verifică că `GOOGLE_CLIENT_ID` e corect în `.env.local`
- Asigură-te că nu ai spații sau caractere extra
- Copiază direct din Google Console

### **Problemă: "access_denied"**
**Soluție:**
- Verifică că Google Calendar API e activat
- Verifică scope-urile în NextAuth config includ `calendar.readonly`
- **VERIFICĂ:** Email-ul tău e în "Test users" listă!

### **Problemă: Widget-ul rămâne la loading**
**Verifică în browser console (F12):**
- Caută erori JavaScript
- Verifică network tab pentru failed requests
- Asigură-te că `.env.local` e încărcat corect

## � **Testare Rapidă**

### 1. Verifică NextAuth session:
```javascript
// În browser console:
localStorage.getItem('next-auth.session-token')
```

### 2. Testează API direct:
```
http://localhost:3000/api/auth/session
```

### 3. Verifică Google Calendar API:
- Mergi la: https://console.developers.google.com/apis/api/calendar/overview
- Verifică că API e "Enabled"

## � **Security Considerations**

### **Important pentru producție:**
1. **Nu commit** `.env.local` în Git!
2. **Folosește HTTPS** în producție
3. **Limitează redirect URIs** doar la domeniile tale
4. **Activează** Application Restriction Settings
5. **Folosește** environment variables securizate

## 🎯 **Resurse Utile**

### **Documentație oficială:**
- [Google Calendar API](https://developers.google.com/calendar/api/v3/reference)
- [NextAuth Google Provider](https://next-auth.js.org/providers/google)

### **Test endpoints:**
- [OAuth 2.0 Playground](https://developers.google.com/oauthplayground)
- [Calendar API Explorer](https://developers.google.com/calendar/api/v3/reference/events/list)

---

## ✅ **Checklist Final:**

- [ ] Proiect creat în Google Cloud Console
- [ ] Google Calendar API activat
- [ ] OAuth 2.0 Client ID creat
- [ ] Redirect URI configurat corect
- [ ] `.env.local` creat cu toate variabilele
- [ ] `GOOGLE_CLIENT_ID` copiat corect
- [ ] `GOOGLE_CLIENT_SECRET` copiat corect
- [ ] `NEXTAUTH_SECRET` generat
- [ ] App repornit după `.env.local`
- [ ] Testat autentificare Google
- [ ] Calendar widget afișează evenimente

Dacă ai urmat toți pașii, calendarul va funcționa perfect! 🎉
