-man =
  Homme

-woman =
  Femme

btn-yes =
  oui

btn-no =
  non

btn-accept =
  J'accepte

btn-refuse =
  Je refuse

btn-woman = 
  Femme 👩‍🦰

btn-man = 
  Homme 👨🏻 

btn-display =
  Voir

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

need-sign-charter =
  Pour utiiser ce bot, vous devez accepter sa charte d'utilisation 👉 {-cmd-charter} 

charter-text = 
  Cette charte énonce les principes et les engagements à accepter avant d'utiliser notre bot Telegram. Le bot vise à fournir des informations pédagogiques sur la création d'applications de type Bot Telegram.

  Le bot est fourni tel quel, sans garantie de bon fonctionnement. Des bugs peuvent survenir, et nous nous efforcerons de les résoudre, mais les corrections immédiates ne sont pas garanties. Vos suggestions pour améliorer le bot sont les bienvenues, mais l'auteur n'est pas responsable des malfaçons du bot. Vous utilisez le bot à vos propres risques et responsabilités.

  En utilisant ce bot, vous acceptez de respecter les règles et les principes énoncés dans cette charte.

  Lors de la première utilisation du bot, vous serez invité à lire et à approuver cette charte avant d'accéder à ses fonctionnalités. Cette action constitue votre signature électronique, attestant votre acceptation des termes et conditions.

  Merci pour votre attention et votre compréhension. Nous sommes impatients de vous offrir une expérience enrichissante avec notre bot Telegram.

charter-accepted =
  Merci pour votre signature ! Vous pouvez maintenant accéder à l'ensemble des fonctionnalités du Bot. 

charter-refused =
  Vous n'avez pas accépté les conditions d'utilisation du Bot.
  Vous ne pouvez donc pas l'utiliser. 

profile-view =
  { $gender ->
    [Man] <tg-emoji emoji-id="5368324170671202286">🙋‍♂️ </tg-emoji><strong>{$contact}</strong> - <b>{$age}</b> ans
    [Woman] <tg-emoji emoji-id="5368324170671202286">🙋‍♀️ </tg-emoji><strong>{$contact}</strong> - <b>{$age}</b> ans
    *[other] <strong>{$contact}</strong> - <b>{$age}</b> ans
  }
  Habite à <b>{$postal_code}</b>
  
  <u>Biographie :</u>
  <blockquote><b><i>{$bio}</i></b></blockquote>

profile-create =
  Ton profil n'est pas encore créé.
  Veux-tu le créer maintenant ?

profile-create-no = 
  Dommage. La femme (ou l'homme) de tes rêves n'attend peut-être que toi ?

profile-create-step1 = 
  Es-tu une femme 👩‍🦰 ou un homme 👨🏻 ?

profile-create-step2 = 
  {$gender ->
    [Man] Super ! tu es un {-man}
    [Woman] Super ! tu es une {-woman}
   *[other] <tg-emoji emoji-id="5368324170671202286">🤔</tg-emoji>, ni Homme ni Femme ?
  }
  Quel âge as-tu ?

profile-create-step3 = 
  Quel est ton lieu de résidence (code_postal) ?

profile-create-step4 = 
  Ecrivez votre bio pour séduire votre futur chéri(e).

profile-manage =
  Ton profil existe déjà.
  Tu peux voir, modifier, supprimer ton profil,
  ou détailler ton profil et définir les relations recherchées 
  en cliquant sur les boutons ci-dessous.

profile-missing-baseProfile =
  Ton profil n'est pas encore créé.
  Tu peux créer ton profil maintenant en utilisant la commande /profil

profile-save-OK =
  Ton profil a bien été enregistré et est visible par les autres membres du groupe.
  Tu peux consulter ton profil 👉 /voir
  Ou n'hésite pas à le compléter pour plus de rencontres ! 👉 /profil

profile-save-KO =
  Oups ! Ton profil n'a pas été correctement enregistré.

profile-photo-save-KO =
  Oups ! Ta photo n'a pas été correctement enregistré.

profile-photo-upload-confirmation =
  Veux-tu charger ta photo de profil maintenant ?

profile-photo-upload-confirmation-yes =
  Envoie-moi ta photo ! (ou /annuler)

profile-photo-upload-confirmation-no =
  Dommage, un profil avec photo fait 10x plus de rencontres !

profile-photo-upload-cancel =
  Chargement de la photo de profil annulé. 

profile-photo-received =
  Photo reçue 😍 !
  Tu vas faire chavirer les coeurs !

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
