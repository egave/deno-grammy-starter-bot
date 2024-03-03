-project-name = Deno Grammy Starter Bot

-cmd-start = /start
-cmd-help = /aide
-cmd-charter = /charte
-cmd-profile = /profil
-cmd-display = /voir
-cmd-cancel = /annuler

start = 
  { $hasSignedUp ->
    [1] Bienvenu {$name}, sur le {-project-name} ! 👋

    Cette application fourni un kit de démarrage d'un Bot Telegram.
    Ce kit utilise le framework Grammyjs et la solution d'hébergement serverless de Deno.
  
    Envoi {-cmd-help} pour une liste des commandes disponibles.
    
    [0]  Bienvenu {$name}, sur le {-project-name} ! 👋
    
    Pour pouvoir utiliser ce bot, il faut d'abord accepter sa charte d'utilisation 👉 {-cmd-charter}
    
    *[other] Humm... On ne devrait pas arriver là, il y a un bug.
  }

aide = 
  Voici les commandes disponibles :
  {-cmd-start} : initialise le Bot et affiche un message de bienvenue & une description du Bot
  {-cmd-help} : affiche ce message d'aide
  {-cmd-profile} : permet de créer/modifier/supprimer ton profil
  {-cmd-display} : affiche ton profil
  {-cmd-cancel} : annule une conversation en cours avec le Bot
  
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

cancel =
  Annulation effectuée !

not-found-message =
  Cette commande n'existe pas.