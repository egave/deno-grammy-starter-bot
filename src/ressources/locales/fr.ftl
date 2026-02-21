### Localization for deno-grammy-starter Bot

## Global phrases shared across pages

-project-name = Deno Grammy Starter Bot

-cmd-start = /start
-cmd-help = /aide
-cmd-cgu = /cgu
-cmd-profile = /profil
-cmd-cancel = /annuler
-cmd-back = /retour
-cmd-quit = /quitter
-cmd-skip = /passer

## Commands

start = 
  { $hasSignedUp ->
    [1] Bienvenu {$name}, sur le {-project-name} ! 👋

    Cette application fourni un kit de démarrage d'un Bot Telegram.
    Ce kit utilise le framework Grammyjs et la solution d'hébergement serverless de Deno.
  
    Envoi {-cmd-help} pour une liste des commandes disponibles.
    
    [0]  Bienvenu {$name}, sur le {-project-name} ! 👋
    
    Pour pouvoir utiliser ce bot, il faut d'abord accepter sa charte d'utilisation 👉 {-cmd-cgu}
    
    *[other] Humm... On ne devrait pas arriver là, il y a un bug.
  }

help = 
  <blockquote>❓<b> Voici les commandes disponibles :</b></blockquote>
  {-cmd-start} : initialise le Bot et affiche un message de bienvenue & une description du Bot
  {-cmd-help} : affiche ce message d'aide
  {-cmd-cgu} : permet de lire et acceter/refuser les CGUs
  {-cmd-profile} : permet de créer/modifier/supprimer ton profil
  {-cmd-quit} : termine une conversation en cours avec le Bot
  
info =
  Nom du Bot : {-project-name}
  Version du Bot: {$version}
  Date de mise en service : {$version-date}
  --
  user-id: {$user-id}
  first-name: {$first-name}
  last-name: {$last-name}
  is-bot: {$is-bot}
  language-code: {$language-code}
  chat-id: {$chat-id}
  chat-type: {$chat-type}

info-light =
  Nom du Bot : {-project-name}
  Version du Bot: {$version}
  Date de mise en service : {$version-date}
  --
  chat-id: {$chat-id}
  chat-type: {$chat-type}

quit =
  Annulation effectuée !

not-found-message =
  Cette commande n'existe pas.

## Phrases for admin Commands

context-init =
    La contexte de la session a été réinitialisé.

## Phrases for messages

-man =
  Homme

-woman =
  Femme

btn-yes =
  oui

btn-no =
  non

btn-accept =
  ✅ J'accepte

btn-refuse =
  ❌ Je refuse

btn-replay-cgu = 
  Revoir les CGUs

btn-woman = 
  Femme 👩‍🦰

btn-man = 
  Homme 👨🏻 

btn-edit =
  Modifier

btn-delete =
  Supprimer

btn-photo-add = 
  Ajouter photo de profil

btn-photo-edit = 
  Changer la photo de profil

btn-photo-delete =
  Supprimer photo de profil

btn-bio-add =
  Écrire une petite bio

btn-bio-edit =
  Modifier ta bio

month-label-janvier =
  janvier

month-label-fevrier = 
  Février

month-label-mars =
  Mars

month-label-avril = 
  Avril

month-label-mai = 
  Mai

month-label-juin =
  Juin

month-label-juillet =
  Juillet

month-label-aout = 
  Août

month-label-septembre =
  Septembre

month-label-octobre =
  Octobre

month-label-novembre =
  Novembre

month-label-decembre =
  Décembre

need-sign-cgu =
  Pour utiiser ce bot, vous devez accepter sa charte d'utilisation 👉 {-cmd-cgu} 

cgu-text-0 =
  Cette charte énonce les principes et les engagements à accepter avant d'utiliser notre bot Telegram. Le bot vise à fournir des informations pédagogiques sur la création d'applications de type Bot Telegram.

  Le bot est fourni tel quel, sans garantie de bon fonctionnement. Des bugs peuvent survenir, et nous nous efforcerons de les résoudre, mais les corrections immédiates ne sont pas garanties. Vos suggestions pour améliorer le bot sont les bienvenues, mais l'auteur n'est pas responsable des malfaçons du bot. Vous utilisez le bot à vos propres risques et responsabilités.

  En utilisant ce bot, vous acceptez de respecter les règles et les principes énoncés dans cette charte.

  Lors de la première utilisation du bot, vous serez invité à lire et à approuver cette charte avant d'accéder à ses fonctionnalités. Cette action constitue votre signature électronique, attestant votre acceptation des termes et conditions.

  Merci pour votre attention et votre compréhension. Nous sommes impatients de vous offrir une expérience enrichissante avec notre bot Telegram.

cgu-accepted =
  Merci pour votre signature ! Vous pouvez maintenant accéder à l'ensemble des fonctionnalités du Bot. 

cgu-refused =
  Vous n'avez pas accépté les conditions d'utilisation du Bot.
  Vous ne pouvez donc pas l'utiliser.
 
cgu-already-accepted =
  Tu as accepté les Conditions Générales d'Utilisation de <b>{-project-name}</b> le <b>{$date}</b>. ✅

  Il ne te reste plus qu’à créer ton {-cmd-profile}. 🌟

cgu-already-refused =
  Tu as refusé les Conditions Générales d'Utilisation de <b>{-project-name}</b> le <b>{$date}</b>. ❌
  
  Tu peux revoir les CGUs et les accepter pour commencer à utiliser <b>{-project-name}</b>.

cgu-quit =
  Belle aventure avec {-project-name} !

age-text =
  {" "}- {$age} ans

profile-view =
  <blockquote><b>{$title}</b></blockquote>

  { $gender ->
    [Man] <tg-emoji emoji-id="5368324170671202286">🙋‍♂️</tg-emoji><strong>{$contact}</strong>{$age} 
    [Woman] <tg-emoji emoji-id="5368324170671202286">🙋‍♀️</tg-emoji><strong>{$contact}</strong>{$age}
    *[other]
      <strong>{$contact}</strong>{$age}
  }
  <blockquote>
    <i>Membre {-project-name} depuis <b>{$membership}</b></i>
  </blockquote>
  {$bio}

profile-create =
  Ton profil n'est pas encore créé.
  Veux-tu le créer maintenant ?

profile-create-no = 
  Dommage. Le {-cmd-profile} est nécessaire pour utiliser l'application.

profile-create-step1 = 
  Es-tu une femme 👩‍🦰 ou un homme 👨🏻 ?

profile-ask-for-decade = 
  {$gender ->
    [Man] Super ! tu es un {-man}
    Renseigne ta date d'anniversaire.
    Tu es né dans les années ?...
    [Woman] Super ! tu es une {-woman}
    Renseigne ta date d'anniversaire.
    Tu es née dans les années ?...
   *[other] <tg-emoji emoji-id="5368324170671202286">🤔</tg-emoji>, ni Homme ni Femme ?
    Renseigne ta date d'anniversaire.
    Tu es né dans les années ?...
  }

profile-ask-for-year =
  Continue... en quelle année exactement ?

profile-ask-for-month =
  Encore un petit effort... en quel mois ?

profile-ask-for-day =
  Et pour terminer... quel jour ?

birthday-decade-selected =
  Décennie choisie >> {$decade}

birthday-year-selected =
  Année de naissance >> {$year}

birthday-month-selected = 
  Mois de naissance >> {$month}

birthday-day-selected = 
  Jour de naissance >> {$day}

birthday-skipped =
  Tu as passé cette étape 

profile-birthday-skiped =
  Tu pourras renseigner ta date de naissance plus tard dans tes paramètres si nécessaire en modifiant ton profil.

profile-create-step3 = 
  Quel est ton lieu de résidence (code_postal) ?

profile-write-bio = 
  Complète ton profil avec une petite description (ou {-cmd-skip} cette étape)

profile-modify-bio =
  Saisis ta nouvelle bio (ou {-cmd-skip})

profile-confirm-replace-bio =
  Es-tu sûr de vouloir mettre à jour ta bio ?
  Cette opération ne pourra être annulée.

profile-bio-save-OK =
  Ta bio a bien été enregistrée.
  Tu peux consulter ou modifier ton profil avec 👉 {-cmd-profile}

profile-bio-save-KO =
  Erreur dans la sauvegarde de ta bio.
  Réessaie.

profile-bio-save-canceled =
  Modification annulée. Ta bio n'a pas été modifiée.

profile-manage =
  Ton profil existe déjà.
  Tu peux voir, modifier, supprimer ton profil,
  ou détailler ton profil en cliquant sur les boutons ci-dessous.

profile-missing-baseProfile =
  Ton profil n'est pas encore créé.
  Tu peux créer ton profil maintenant en utilisant la commande /profil

profile-save-new-OK =
  Ton profil a bien été enregistré et est visible par les autres utilisateurs de {-project-name}.
  Envoie {-cmd-help} pour la liste complète des commandes disponibles.

profile-save-OK =
  Ton profil a bien été enregistré et est visible par les autres utilisateurs de {-project-name}.
  N'hésite pas à le compléter ! 👉 {-cmd-profile}

profile-save-KO =
  Oups ! Ton profil n'a pas été correctement enregistré. Réessaie.

profile-photo-upload-confirmation =
  Veux-tu charger ta photo de profil maintenant ?

profile-photo-upload-confirmation-yes =
  Envoie ta photo de profil ! (ou {-cmd-skip} cette étape)

profile-photo-upload-confirmation-no =
  Dommage, un profil avec photo inspire 10x plus de confiance !

profile-bio-confirmation-no =
  Modification annulée.

profile-photo-upload-OK =
  Photo reçue 😍 !

profile-photo-changed-OK =
  Photo reçue 😍 !
  Tu peux consulter ou modifier ton profil avec 👉 {-cmd-profile}

profile-photo-upload-KO =
  Oups ! Ta photo n'a pas été correctement enregistrée. Réessaie.

profile-photo-upload-error =
  Oups ! Une erreur est survenue au chargement de la photo.
  Réessaie.

profile-delete-OK =
  Ton profil a bien été supprimé.

profile-delete-KO = 
  Oups! Ton profil n'a pas été correctement supprimé.

profile-delete-confirmation =
  Veux-tu vraiment supprimer ton profil ?
  Toutes tes données seront effacées...

profile-delete-OK =
  Ton profil a été supprimé.

profile-delete-confirmation-no =
  OK.

profile-photo-delete-confirmation =
  Veux-tu supprimer ta photo de profil maintenant?

profile-photo-delete-OK =
  Ta photo de profil a été supprimée.

profile-photo-delete-KO = 
  Oups! Ta photo de profil n'a pas été correctement supprimé

profile-photo-delete-confirmation-no =
  OK.

stat-message = 
  Hello les célib ! 👋
  <b>Voici les statistiques du Bot '{$bot_name}' 👇</b>

stat-number-men = 
  🔷 {$number} profils d'hommes

stat-number-women = 
  🔶 {$number} profils de femmes

stat-by-age-range =
  ♦️ {$number} profils dans la tranche d'âge {$range}

stat-new-profiles-week =
  🟢 {$number} nouveaux profils depuis 1 semaine

stat-new-profiles-month =
  🔵 {$number} nouveaux profils depuis 1 mois

stat-match-since-1-week =
  💛 {$number} matchs depuis 1 semaine

stat-match-since-1-month =
  🧡 {$number} matchs depuis 1 mois 

stat-match-total =
  💙 {$number} matchs depuis le début de l'application 

create-profile-first =
  La recherche n'est accessible qu'aux utilisateurs ayant créé un profil 😉.
  Tu peux créer ton profil maintenant en utilisant la commande /profil

userId-undefined =
  Oups! L'utilisateur n'est pas connu.

## Phrases for errors

profile-use-buttons-error =
  Utilise les boutons pour répondre !

profile-expected-number-error =
  Merci de saisir un nombre

profile-age-minor-error =
  Votre âge ne peut être inférieur à 18 ans.

profile-age-senior-error =
  Tu ne vas pas me faire croire que tu as {$age} ans ! 😱
  Renseigne ton véritable âge (18 à 99 ans)

profile-year-duration-text = 
  {$years} ans

profile-year-month-duration-text =
  {$years} ans et {$months} mois

profile-month-duration-text = 
  {$months} mois

profile-day-duration-text =
  { $days ->
    [0] aujourd'hui
    [1] {$days} jour
    *[other] {$days} jours
  }

non-available=
  non défini

cmd_only_admin_error =
  Vous devez être administrateur pour effectuer cette action.

not-found-command =
  Commande inconnue.
  Pour connaitre l'ensemble des commandes disponibles, utilise la commande {-cmd-help}. 