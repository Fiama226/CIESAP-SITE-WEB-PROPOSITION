# CIESAP Burkina – site vitrine bilingue (FR / EN)

Site **100 % statique** (HTML + CSS + JS + images, aucun PHP, aucune base de données).
- Français : racine du site (`/`)
- Anglais : sous `/en/` (même arborescence)
- Les ressources (`wp-content/`, `wp-includes/`) sont communes aux deux langues.

Tous les liens sont **relatifs** : le site fonctionne à la racine d'un (sous-)domaine comme dans un sous-dossier.

---

## 1. Déployer sur un VPS (Ubuntu/Debian + Nginx + HTTPS)

Dans les exemples, remplacez :
- `demo.votredomaine.com` par votre sous-domaine
- `IP_DU_VPS` par l'adresse IP du serveur
- `utilisateur` par votre utilisateur SSH

### 1.1 DNS (déjà créé : à vérifier)

Chez votre registrar, le sous-domaine doit avoir un enregistrement **A** vers l'IP du VPS (et **AAAA** si le VPS a une IPv6).

```bash
nslookup demo.votredomaine.com
```
La réponse doit afficher `IP_DU_VPS`. La propagation peut prendre de quelques minutes à quelques heures. Sans DNS correct, le certificat HTTPS (étape 1.5) échouera.

### 1.2 Préparer le serveur

```bash
ssh utilisateur@IP_DU_VPS

sudo apt update && sudo apt install -y nginx
sudo ufw allow OpenSSH && sudo ufw allow 'Nginx Full' && sudo ufw enable   # pare-feu (ports 22, 80, 443)

sudo mkdir -p /var/www/ciesap
sudo chown -R $USER:$USER /var/www/ciesap
```

### 1.3 Envoyer les fichiers

**N'envoyez pas** : `tools/`, `.playwright-mcp/`, `.remember/`, `__pycache__/`, `README.md`, ni les dossiers de sauvegarde (`finbiz-main_backup_*`).

Depuis la racine du projet (dossier `finbiz-main`), au choix :

**Option A : `rsync`** (Linux, macOS, WSL) – envoie uniquement ce qui a changé :
```bash
rsync -avz --delete \
  --exclude 'tools/' --exclude '.playwright-mcp/' --exclude '.remember/' \
  --exclude '__pycache__/' --exclude 'README.md' --exclude '.git/' \
  ./ utilisateur@IP_DU_VPS:/var/www/ciesap/
```
Attention : `--delete` supprime sur le serveur ce qui n'existe plus en local. Ajoutez `--dry-run` pour simuler d'abord.

**Option B : `scp` depuis Windows (PowerShell / Git Bash)**, sans rsync :
```bash
tar --exclude=tools --exclude=.playwright-mcp --exclude=.remember --exclude=__pycache__ \
    --exclude=README.md -czf ../ciesap-site.tar.gz .
scp ../ciesap-site.tar.gz utilisateur@IP_DU_VPS:/tmp/
ssh utilisateur@IP_DU_VPS "tar -xzf /tmp/ciesap-site.tar.gz -C /var/www/ciesap && rm /tmp/ciesap-site.tar.gz"
```
(À lancer depuis le dossier du site : `tar` archive le dossier courant. L'archive est créée **à côté** du dossier, dans `../`, pour ne pas s'inclure elle-même.)

### 1.4 Configurer Nginx

```bash
sudo nano /etc/nginx/sites-available/ciesap
```
Contenu :
```nginx
server {
    listen 80;
    listen [::]:80;
    server_name demo.votredomaine.com;

    root /var/www/ciesap;
    index index.html;

    # Site statique : un dossier = une page (dossier/index.html)
    location / {
        try_files $uri $uri/ =404;
    }

    # Compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/css application/javascript application/json image/svg+xml text/plain;

    # Polices auto-hebergees (woff2 est deja compresse : pas de gzip)
    location ~* \.woff2$ {
        default_type font/woff2;
        expires 1y;
        add_header Cache-Control "public, immutable";
        access_log off;
    }

    # Cache tres long pour wp-content (les fichiers portent un hash de version)
    location /wp-content/ {
        expires 1y;
        add_header Cache-Control "public, immutable";
        access_log off;
    }

    # Cache long pour les ressources
    location ~* \.(css|js|webp|jpg|jpeg|png|svg|gif|ico|woff2?|ttf)$ {
        expires 30d;
        add_header Cache-Control "public";
        access_log off;
    }

    # Pas de cache pour les pages HTML (les modifs apparaissent tout de suite)
    location ~* \.html$ {
        add_header Cache-Control "no-cache";
    }

    # Ne jamais servir les fichiers cachés (.git, .env, etc.)
    location ~ /\. { deny all; }

    error_page 404 /index.html;
}
```
Activer et recharger :
```bash
sudo ln -s /etc/nginx/sites-available/ciesap /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx
```
Ouvrez `http://demo.votredomaine.com` : le site doit s'afficher.

> Le site est entierement autonome : aucune requete vers un service tiers (Google Fonts, CDN emoji, Google Maps, reactheme.com). Les polices sont dans `wp-content/fonts/`, la carte de contact est une image OpenStreetMap locale (`wp-content/uploads/ciesap/map-ouagadougou.webp`) avec un lien vers openstreetmap.org. Aucune en-tete CSP ni DNS externe n'est necessaire.

> Si la page par défaut de Nginx répond à la place, supprimez le lien par défaut : `sudo rm /etc/nginx/sites-enabled/default`.

### 1.5 HTTPS gratuit (Let's Encrypt)

```bash
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d demo.votredomaine.com
```
Acceptez la redirection HTTP → HTTPS. Le renouvellement est automatique ; test : `sudo certbot renew --dry-run`.

### 1.6 Vérifications après déploiement

- `https://demo.votredomaine.com/` (français) et `https://demo.votredomaine.com/en/` (anglais) s'affichent.
- Le sélecteur **FR | EN** de l'en-tête bascule bien vers la page équivalente, dans les deux sens.
- Aucune image cassée : ouvrez la console du navigateur (F12 → Réseau) ; tout doit être en 200.
- Forcez le rechargement (Ctrl+F5) si vous voyez une ancienne version.

---

## 2. Mettre à jour le site plus tard

1. Modifiez les pages **françaises** (ou l'anglais directement dans `en/`).
2. `python tools/build_en.py` : crée les pages `en/` manquantes et met à jour le sélecteur de langue et les `hreflang`. **N'écrase jamais** les traductions existantes.
   (`--force` régénère tout `en/` et **efface les traductions** : à éviter, une confirmation est demandée.)
3. `python tools/check_bilingual.py` doit afficher `RESULTAT: OK` (0 lien mort, équivalents FR/EN présents).
4. Renvoyez les fichiers (étape 1.3).

---

## 3. À régler avant la mise en production définitive

| Sujet | Situation actuelle |
|---|---|
| **`hreflang`** | Les URL sont **relatives** (suffisant pour une démo). Avant un vrai lancement, les rendre absolues (`https://demo.votredomaine.com/...` et `.../en/...`) : la fonction `hreflang_block` de `tools/build_en.py` les génère. |
| **Formulaires** (contact, commentaires, newsletter) | Ils **n'envoient rien** : le site est statique. Prévoir un service (Formspree, Web3Forms…), un petit script serveur, ou un lien `mailto:`. |
| **Réseaux sociaux** | Les icônes n'ont pas encore d'URL. |
| **Contenu fictif** | Équipe, projets, articles, témoignages et « Mot du Directeur » sont des contenus de démonstration (FR et EN) à remplacer. |
| **Google Maps** (page Contact) et **polices Google** | Chargés depuis Internet : prévoir un repli ou un hébergement local des polices. |
| **Indexation** | Tant que c'est une démo, ajoutez dans `server { }` : `add_header X-Robots-Tag "noindex, nofollow" always;` pour éviter que Google l'indexe. Retirez-le au lancement. |

---

## 4. Dépannage rapide

| Problème | Piste |
|---|---|
| Page blanche / 403 | Droits : `sudo chown -R www-data:www-data /var/www/ciesap` puis `sudo chmod -R o+rX /var/www/ciesap` |
| 404 sur `/en/` | Vérifiez que le dossier `en/` a bien été envoyé (`ls /var/www/ciesap/en`). |
| Page par défaut de Nginx | `sudo rm /etc/nginx/sites-enabled/default && sudo systemctl reload nginx` |
| Certbot échoue | Le DNS ne pointe pas encore vers le VPS (étape 1.1) ou le port 80 est bloqué (étape 1.2). |
| Ancien design affiché | Ctrl+F5 (les CSS sont mis en cache 30 jours). |
| Logs | `sudo tail -f /var/log/nginx/error.log` |
