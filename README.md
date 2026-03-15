# TRSAV — GitHub Pages PWA Package
## Total Rental Solutions — Built for: https://johnlaz.github.io/trsav/

---

### 🚀 Deploy to GitHub Pages

**All paths are pre-configured for /trsav/ — do not move files.**

#### Option A — GitHub Web UI (easiest)
1. Go to https://github.com/johnlaz/trsav
2. Delete all existing files in the repo
3. Upload every file from this zip, keeping the folder structure:
   - index.html, offline.html, manifest.json, sw.js, 404.html → repo root
   - icons/ folder → icons/ at repo root
4. Go to Settings → Pages → Source: main branch → / (root) → Save
5. Live at https://johnlaz.github.io/trsav/ within ~60 seconds ✅

#### Option B — Git CLI
```bash
git clone https://github.com/johnlaz/trsav.git && cd trsav
git rm -rf .
# copy all files from this zip here
git add . && git commit -m "Deploy TRSAV PWA" && git push origin main
```

---

### ✅ GitHub Pages Fixes Applied

| Problem | Fix |
|---|---|
| manifest paths broke | All icon/shortcut URLs use /trsav/ prefix |
| SW scope wrong | Registered with scope: '/trsav/' |
| SW precache 404s | All cached paths use /trsav/ prefix |
| .htaccess ignored | Removed — GitHub Pages uses Jekyll/CDN |
| SPA 404 errors | 404.html redirect added |
| og:url was missing | Points to johnlaz.github.io/trsav/ |

---

### 📞 Contact
Total Rental Solutions · 866-401-8600
