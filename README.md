# Jarred Marks Law, PLLC — Website

Static website for jarredmarks.com, hosted free on GitHub Pages. No Squarespace subscription needed once live.

## Files

| File | Purpose |
|---|---|
| `index.html` | Homepage |
| `services.html` | Practice areas |
| `about.html` | Attorney bio |
| `contact.html` | Contact form + info |
| `css/styles.css` | All styling |
| `CNAME` | Tells GitHub Pages to serve at jarredmarks.com |

## How to push live

### 1. Put it on GitHub

1. Create a free account at [github.com](https://github.com) (if you don't have one).
2. Create a new **public** repository named `jarredmarks-website`.
3. From this folder, run:
   ```
   git init
   git add .
   git commit -m "Law firm website"
   git branch -M main
   git remote add origin https://github.com/YOUR_USERNAME/jarredmarks-website.git
   git push -u origin main
   ```
4. On GitHub: repo → **Settings → Pages** → under "Build and deployment," set Source to **Deploy from a branch**, branch `main`, folder `/ (root)`. Save.
5. Within a couple of minutes your site is live at `https://YOUR_USERNAME.github.io/jarredmarks-website/`. Preview it there before touching your domain.

### 2. Make the contact form work

GitHub Pages can't process forms itself, so the form uses Formspree (free tier: 50 submissions/month):

1. Sign up at [formspree.io](https://formspree.io) with jarred@jarredmarks.com.
2. Create a new form — Formspree gives you an ID like `xabcdefg`.
3. In `contact.html`, replace `YOUR_FORM_ID` in the form's `action` URL with that ID.
4. Commit and push again. Submissions now arrive in your email inbox.

### 3. Point jarredmarks.com at GitHub Pages

Your domain is currently managed in Squarespace. In Squarespace go to **Settings → Domains → jarredmarks.com → DNS Settings** and:

1. Delete the existing A records Squarespace added for its own hosting.
2. Add these four **A records** (Host: `@`):
   - `185.199.108.153`
   - `185.199.109.153`
   - `185.199.110.153`
   - `185.199.111.153`
3. Add a **CNAME record**: Host `www` → Value `YOUR_USERNAME.github.io`
4. Back on GitHub: **Settings → Pages → Custom domain** → enter `jarredmarks.com` → Save. Once DNS verifies (minutes to a few hours), check **Enforce HTTPS**.

The `CNAME` file in this repo keeps the custom domain setting from being lost on future pushes.

### 4. After it's live

- Confirm https://jarredmarks.com loads the new site, then cancel the Squarespace *website* subscription. **Keep the domain registration** (or transfer it to a registrar like Cloudflare) — you still need to own jarredmarks.com.
- Keep any Google Workspace / email MX records intact when editing DNS — only change the A and www records listed above.

## Making edits later

Edit the HTML files, then:
```
git add .
git commit -m "Describe your change"
git push
```
GitHub Pages redeploys automatically in ~1 minute.

## Adding your headshot

Save your photo as `images/jarred-marks.jpg`, then in `about.html` replace the placeholder `<span class="placeholder">JM</span>` block with the `<img>` tag shown in the comment right above it.
