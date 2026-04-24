# MundaManager FR — Extension Chrome

Extension Chrome qui traduit automatiquement l'interface de [mundamanager.com](https://www.mundamanager.com) de l'anglais vers le français.

---

## Installation

L'extension n'est pas publiée sur le Chrome Web Store. Elle s'installe en mode développeur en deux étapes.

### 1. Télécharger la dernière version

Aller sur la page [Releases](../../releases/latest), télécharger le fichier `mundamanager-fr.zip` et le **décompresser** dans un dossier de votre choix (ex: `Documents/mundamanager-fr`).

### 2. Charger dans Chrome

1. Ouvrir Chrome et aller à l'adresse `chrome://extensions`
2. Activer le **Mode développeur** via l'interrupteur en haut à droite
3. Cliquer sur **Charger l'extension non empaquetée**
4. Sélectionner le dossier décompressé à l'étape précédente
5. L'extension apparaît dans la liste — se rendre sur [mundamanager.com](https://www.mundamanager.com), la traduction est automatique

### Mise à jour

Pour mettre à jour vers une nouvelle version :

1. Télécharger le nouveau `.zip` depuis les [Releases](../../releases/latest)
2. Remplacer les fichiers dans le dossier existant (écraser)
3. Aller sur `chrome://extensions` et cliquer sur l'icône **↻** de l'extension

---

## Ajouter ou corriger une traduction

Toutes les traductions sont dans `translations.js`, un dictionnaire trié alphabétiquement :

```js
const TRANSLATIONS = {
  "Add Fighter": "Ajouter un Combattant",
  Campaign: "Campagne",
  // ...
};
```

**Pour ajouter une entrée :**

1. Ouvrir `translations.js` dans un éditeur de texte
2. Ajouter la ligne `'Texte anglais': 'Traduction française',`
3. Enregistrer le fichier
4. Aller sur `chrome://extensions` et cliquer sur **↻** pour recharger l'extension

**Règles à respecter :**

- La clé doit correspondre exactement au texte affiché sur le site (majuscules comprises)
- Si la clé ou la valeur contient une apostrophe `'`, utiliser des guillemets doubles : `"Texte d'exemple": "Valeur d'exemple"`
- Préférer les termes les plus longs : `'Sawn-Off Shotgun'` doit être présent si `'Shotgun'` l'est aussi, sinon le terme court sera remplacé en premier
- L'ordre alphabétique dans le fichier n'est pas obligatoire mais recommandé pour la lisibilité

**Pour contribuer :** ouvrir une [Pull Request](../../pulls) ou signaler un terme manquant via les [Issues](../../issues).

---

## Publier une nouvelle release

> Cette section s'adresse aux mainteneurs du projet.

Une release crée automatiquement le `.zip` téléchargeable via GitHub Actions. Il suffit de pousser un tag Git :

```bash
# 1. Committer les changements
git add -A
git commit -m "v1.1 - nouvelles traductions"

# 2. Créer un tag (remplacer v1.1 par la version souhaitée)
git tag v1.1

# 3. Pousser le commit et le tag
git push && git push --tags
```

GitHub Actions génère alors automatiquement le fichier `mundamanager-fr.zip` et crée la release avec les notes de changements.

---

## Fonctionnement technique

L'extension injecte deux fichiers sur toutes les pages de `mundamanager.com` :

- **`translations.js`** — ~1 600 entrées anglais → français
- **`content.js`** — moteur de traduction

Le moteur :

- Parcourt les nœuds texte du DOM avec un `TreeWalker`
- Compile toutes les clés en une **unique regex**, les plus longues en premier (pour que `Sawn-Off Shotgun` soit reconnu avant `Shotgun`)
- Les abréviations de stats (`CL`, `LD`, `WIL`…) utilisent une regex **sensible à la casse** pour ne pas corrompre des mots comme `Vehicle`
- Toutes les autres clés utilisent une regex **insensible à la casse** avec frontières de mots
- Le traitement se fait en tranches via `requestIdleCallback` pour ne pas bloquer le rendu
- Un `MutationObserver` re-traduit le contenu chargé dynamiquement par React

---

## Structure du projet

```
manifest.json               Configuration de l'extension (Manifest V3)
translations.js             ~1 100 traductions anglais → français
content.js                  Moteur d'injection et de traduction
.github/workflows/
  release.yml               Workflow GitHub Actions (génération du .zip)
```

---

## Compatibilité

- Chrome / Chromium (Manifest V3)
- Site ciblé : `*://www.mundamanager.com/*`

---

## Licence

Projet personnel, non affilié à Games Workshop ou à mundamanager.com.
