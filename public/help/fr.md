## Premiers pas

### Comment commencer

Après avoir créé un compte et vous être connecté, la première chose à faire est d'ajouter un compte bancaire. Allez au menu **Comptes** et choisissez entre connecter une banque directement (compte automatique) ou importer un relevé en PDF, Excel ou CSV (compte manuel).

La connexion automatique se fait via des fournisseurs certifiés d'accès aux données bancaires (GoCardless et Enable Banking). Vos identifiants bancaires ne passent jamais par les serveurs d'Eurodata — l'authentification a lieu directement sur le site de la banque.

### Navigation principale

La barre en haut donne accès aux quatre sections principales :

| Icône | Section | Description |
|-------|---------|-------------|
| 🧾 | **Transactions** | Lister, filtrer, catégoriser et gérer vos transactions |
| 🏦 | **Comptes** | Connecter des banques, importer des relevés, gérer les comptes |
| 📈 | **Analyses** | Graphiques de revenus, dépenses et tendances |
| 🔄 | **Récurrents** | Gérer les paiements et encaissements périodiques |

### Langue et thème

En haut à droite vous pouvez :

- **Changer la langue** en cliquant sur l'icône globe — 8 langues : Anglais, Portugais, Espagnol, Français, Allemand, Italien, Néerlandais, Polonais.
- **Changer entre thème clair et sombre** avec l'icône lune/soleil.

---

## Transactions

C'est la section principale de l'application. Elle affiche toutes vos transactions importées, avec des outils pour filtrer, catégoriser et organiser.

### Cartes de comptes (en haut)

En haut apparaissent des cartes pour chaque compte. Chaque carte affiche : logo de la banque, type (document = manuel, lien = automatique), nom du compte, institution, solde actuel et date de mise à jour si « Afficher les soldes » est activé dans le profil. La case à cocher filtre les transactions affichées.

### Boutons d'action (en haut à droite)

| Icône | Action |
|-------|--------|
| ❓ | Aide contextuelle |
| 🔄 | **Actualiser les transactions** — déclenche l'import pour les comptes automatiques |
| ⚖️ | **Actualiser les soldes** — met à jour les soldes (si affichage activé) |

### Barre d'outils de la liste

Sélectionner tout, Supprimer la sélection, Recherche, Lignes par page (10/20/50), Toutes / Nouvelles uniquement, Filtres catégories et étiquettes, Export CSV (aussi JSON et OFX).

### Éléments de chaque ligne

Case « Inclure dans Analyses », étiquette « Nouvelle » (× pour marquer comme vue), « En attente », Catégorie (modifiable, l'IA apprend), 🔔 Récurrent, 💬 Commentaire, 🗑️ Supprimer, Étiquettes, Montant, Date de comptabilisation, Date de valeur, ▲▼ Flèches pour ajuster la date ±1 jour.

### Pagination

En bas : « Affichage X à Y sur Z » et flèches précédent/suivant.

---

## Comptes

La section **Comptes** permet de gérer toutes vos comptes bancaires.

### Comptes existants

Chaque compte en carte : logo, type, nom modifiable (💾 pour enregistrer), institution, solde. Boutons : 🔔 Alertes, 🔌 Reconnecter (quand le lien a expiré, en général 90 jours), 🔄 Obtenir les transactions (ou assistant d'import pour manuels), 🗑️ Supprimer.

### Connecter une nouvelle banque

1. Choisir le **pays** 2. Rechercher la banque 3. Cliquer — redirection vers le site de la banque pour autoriser 4. Après autorisation, le compte apparaît et les transactions sont importées. Connexion valable environ 90 jours ; utiliser **Reconnecter** quand elle expire.

### Importer un relevé (comptes manuels)

Bouton **Importer un relevé** ou **Obtenir les transactions** sur un compte manuel : 1. Téléverser PDF/Excel/CSV 2. Analyser (IA) 3. Vérifier (inverser les signes si besoin) 4. Assigner à un compte existant ou nouveau.

---

## Analyses

Filtres en haut : Période, Comptes, Étiquettes, Catégories. Configurations enregistrées : 📂 Charger, 💾 Enregistrer, ⭐ Définir par défaut. Bouton 📄 Exporter PDF.

Cartes développables : Reçus (table des revenus), Payés (dépenses), Par catégorie (barres ; estimation en mois courant), Totaux (reçu, payé, différence), Solde cumulé (courbe), Comparaison mensuelle (table avec export CSV).

---

## Récurrents

Suivi des paiements et encaissements périodiques (loyer, abonnements, salaire). Bouton 🔍 **Exécuter les suggestions** — analyse les 6 derniers mois, détecte les motifs récurrents (≥60 % de confiance).

Vue liste : filtres (Compte, État, Tri, Recherche), bouton + Créer un récurrent manuel. Panel suggestions : ✅ Confirmer, ✏️ Modifier et confirmer, ⏭️ Passer, ✖️ Rejeter. Tableau : Nom, Fréquence, Prochaine date, Montant, État, Compte, Actions (Confirmer, Modifier, Pause/Reprise, Supprimer).

Vue calendrier : navigation par mois, marqueurs par jour (vert = effectué, rouge = manquant), barre de résumé.

Formulaire création/édition : Nom, Compte, Motif de description, Fréquence, Jour d'ancrage, Montant attendu/nominal, Tolérances jour et montant, Alertes à l'occurrence et au manque.

---

## Bot Telegram

Eurodata envoie des alertes et répond aux requêtes via **Telegram** avec le bot **@bancos_alerts_bot**.

### Configuration

1. **Profil** (menu en haut à droite → Mon profil) 2. Section Telegram, **Lier Telegram** — lien vers le bot 3. Dans Telegram, envoyer un message au bot puis le **code de vérification** (valide 10 min) 4. Activer **Alertes Telegram** dans les préférences. Vous pouvez aussi chercher **@bancos_alerts_bot** sur Telegram.

### Commandes

| Commande | Description |
|----------|-------------|
| `/transactions [N]` | Dernières N transactions (défaut 10 ; max 100) |
| `/next [N]` | Prochaines N récurrentes (défaut 10) |
| `/balances` | Solde par compte et total |
| `/month [config]` | Totaux du mois ; nom de config Analyses optionnel |
| `/year [config]` | Totaux de l'année à ce jour |

---

## Abonnement

Période d'essai gratuite avec toutes les fonctionnalités. Ensuite, un abonnement actif est nécessaire pour : conserver les connexions automatiques aux banques, recevoir les mises à jour quotidiennes. Sans abonnement, les comptes manuels (import de fichiers) restent utilisables.

**Mon profil** → onglet **Abonnement** : voir le statut, s'abonner ou renouveler, ajouter des comptes automatiques supplémentaires. Le plan de base inclut 2 comptes automatiques ; possibilité d'en ajouter contre un coût mensuel réduit.

---

## Support

En cas de question ou de problème :

- 🐛 **Signaler un bug** — ouvrir une issue sur le dépôt public
- 💡 **Suggerer une fonctionnalité** — partager vos idées
- 💬 **GitHub Discussions** — [github.com/kal001/eurodata-public/discussions](https://github.com/kal001/eurodata-public/discussions)

---
