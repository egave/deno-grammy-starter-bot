-project-name = Deno Grammy Starter Bot

-cmd-start = /start
-cmd-help = /aide
-cmd-charter = /charte
-cmd-profile = /profil
-cmd-display = /voir
-cmd-cancel = /annuler

start = 
  { $hasSignedUp ->
    [1] Welcome {$name} to {-project-name}! 👋

    This application provides a starter kit for a Telegram Bot.
    This kit uses the Grammyjs framework and Deno's serverless hosting solution.
  
    Send /help for a list of available commands.
    
    [0] Welcome {$name} to {-project-name}! 👋
    
    To use this bot, you must first accept its terms of use 👉 /charter
    
    *[other] Hmm... Something went wrong, there seems to be a bug.
  }

aide = 
  Here are the available commands:
  /start: initializes the Bot and displays a welcome message & a description of the Bot
  /help: displays this help message
  /profile: allows you to create/modify/delete your profile
  /display: displays your profile
  /cancel: cancels the current conversation with the Bot
  
info =
  Bot Name: {-project-name}
  Bot Version: {$version}
  Deployment Date: {$version-date}
  --
  User ID: {$user-id}
  First Name: {$first-name}
  Last Name: {$last-name}
  Is Bot: {$is-bot}
  Language Code: {$language-code}
  Chat ID: {$chat-id}
  Chat Type: {$chat-type}

info-light =
  Bot Name: {-project-name}
  Bot Version: {$version}
  Deployment Date: {$version-date}
  --
  Chat ID: {$chat-id}
  Chat Type: {$chat-type}

cancel =
  Cancellation completed!

not-found-message =
  This command does not exist.