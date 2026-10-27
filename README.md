# WPG landing page

A plain website: HTML, CSS and JavaScript. No build step, no libraries.
It runs on GitHub Pages for free, and the early-access form saves sign-ups into
your own Google Sheet.

## What is in this folder

```
index.html                  the landing page
privacy.html                the privacy page linked under the form
css/styles.css              all the styles (colours and fonts are at the top)
js/config.js                your settings — the form link goes here
js/main.js                  the interactive parts (buttons, Nest, Make files, form)
assets/img/                 the pictures (WebP: small and fast)
assets/favicon.svg          the little icon in the browser tab
assets/og-image.jpg         the picture shown when the link is shared
setup/google-apps-script.gs the code for the sign-up sheet (not used by the page itself)
.nojekyll                   tells GitHub Pages to serve the files as they are
```

## Step 1 — Put the site on GitHub Pages (about 5 minutes)

1. On github.com, click **+** (top right) › **New repository**.
   Name: `wpg`. Choose **Public**. Click **Create repository**.
2. On the new page, click **uploading an existing file**.
3. Open this folder on your computer, select **everything inside it**
   (not the folder itself) and drag it into the browser window.
   Tip: `.nojekyll` is a hidden file — in Windows Explorer turn on
   View › Show › Hidden items so it is selected too.
4. Click **Commit changes**.
5. Go to **Settings** › **Pages**. Under *Build and deployment*:
   Source **Deploy from a branch**, Branch **main**, folder **/ (root)**. Click **Save**.
6. Wait 1–2 minutes and refresh. GitHub shows the address:
   `https://YOUR-USERNAME.github.io/wpg/`

## Step 2 — Connect the sign-up form to a Google Sheet (about 5 minutes)

1. Open sheets.google.com with inegvin@gmail.com and create a **blank sheet**.
   Name it `WPG sign-ups`.
2. In the sheet: **Extensions** › **Apps Script**.
3. Delete the code you see, open `setup/google-apps-script.gs` from this folder,
   copy all of it and paste it in. Click the **save** icon.
4. Click **Deploy** › **New deployment**. Click the gear next to *Select type* › **Web app**.
   - Description: `WPG sign-ups`
   - Execute as: **Me**
   - Who has access: **Anyone**
   Click **Deploy**.
5. Google asks for permission: **Authorize access** › pick your account ›
   if you see "Google hasn't verified this app", click **Advanced** ›
   **Go to … (unsafe)** › **Allow**. (It is your own script, so this is expected.)
6. Copy the **Web app URL** (it ends with `/exec`).
7. On GitHub, open `js/config.js`, click the **pencil** (Edit), paste the link
   between the quotes:
   `formEndpoint: "https://script.google.com/macros/s/…/exec"`
   then **Commit changes**. The site updates within a minute or two.
8. Test it: open your site, sign up with your own email. A new row appears in the
   sheet (tab **Sign-ups**) and you get an email.

## Changing things later

- **Text:** edit `index.html` on GitHub (pencil icon) and commit.
- **Pictures:** upload a new file with the **same name** into `assets/img/`.
- **Colours:** the top of `css/styles.css` (`--accent` is the orange).
- **Contact email:** search for `inegvin@gmail.com` in `index.html`, `privacy.html`,
  `js/main.js` and `setup/google-apps-script.gs`.
- **Your own domain later:** Settings › Pages › *Custom domain*. Then also change
  `og:image` in `index.html` to the full address, e.g.
  `https://wpg.pp.ua/assets/og-image.jpg`, so shared links show the picture.
- **If you edit the Apps Script later:** Deploy › Manage deployments › edit ›
  Version: **New version** › Deploy. The link stays the same.
