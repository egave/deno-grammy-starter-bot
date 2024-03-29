### Localization for deno-grammy-starter Bot

## Global phrases shared across pages

-project-name = Deno Grammy Starter Bot

-cmd-start = /start
-cmd-help = /aide
-cmd-charter = /charte
-cmd-profile = /profil
-cmd-display = /voir
-cmd-cancel = /annuler

## Commands

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

## Phrases for admin Commands

context-init =
    The session context has been reset.

## Phrases for messages

-man =
  Man

-woman =
  Woman

btn-yes =
  yes

btn-no =
  no

btn-accept =
  I accept

btn-refuse =
  I refuse

btn-woman = 
  Woman 👩‍🦰

btn-man = 
  Man 👨🏻 

btn-display =
  View

btn-edit =
  Edit

btn-delete =
  Delete

btn-photo-add = 
  Add profile photo

btn-photo-edit = 
  Change profile photo

btn-photo-delete =
  Delete profile photo

need-sign-charter =
  To use this bot, you must accept its terms of use 👉 {-cmd-charter} 

charter-text = 
  This charter sets out the principles and commitments to be accepted before using our Telegram bot. The bot aims to provide educational information on creating Telegram Bot applications.

  The bot is provided as is, without warranty of any kind. Bugs may occur, and we will endeavor to fix them, but immediate corrections are not guaranteed. Your suggestions for improving the bot are welcome, but the author is not responsible for any shortcomings of the bot. You use the bot at your own risk and responsibility.

  By using this bot, you agree to abide by the rules and principles set out in this charter.

  When you first use the bot, you will be prompted to read and approve this charter before accessing its features. This action constitutes your electronic signature, attesting to your acceptance of the terms and conditions.

  Thank you for your attention and understanding. We look forward to providing you with a rewarding experience with our Telegram bot.

charter-accepted =
  Thank you for your signature! You can now access all of the Bot's features.
  
charter-refused =
  You have not accepted the Bot's terms of use. Therefore, you cannot use it. 

profile-view =
  { $gender ->
    [Man] <tg-emoji emoji-id="5368324170671202286">🙋‍♂️ </tg-emoji><strong>{$contact}</strong> - <b>{$age}</b> years
    [Woman] <tg-emoji emoji-id="5368324170671202286">🙋‍♀️ </tg-emoji><strong>{$contact}</strong> - <b>{$age}</b> years
    *[other] <strong>{$contact}</strong> - <b>{$age}</b> years
  }
  Lives in <b>{$postal_code}</b>
  
  <u>Biography :</u>
  <blockquote><b><i>{$bio}</i></b></blockquote>

profile-create =
  Your profile has not been created yet. Do you want to create it now?

profile-create-no = 
  Too bad. The woman (or man) of your dreams might be waiting for you?

profile-create-step1 = 
  Are you a woman 👩‍🦰 or a man 👨🏻 ?

profile-create-step2 = 
  {$gender ->
    [Man] Great! you're a Man
    [Woman] Great! you're a Woman
   *[other] <tg-emoji emoji-id="5368324170671202286">🤔</tg-emoji>, neither Man nor Woman?
  }
  How old are you?

profile-create-step3 = 
  What is your place of residence (postal code)?

profile-create-step4 = 
  Write your bio to attract your future partner.

profile-manage =
  Your profile already exists. You can view, edit, delete your profile, or detail your profile and define the relationships you are looking for by clicking on the buttons below.

profile-missing-baseProfile =
  Your profile has not been created yet. You can create your profile now using the /profile command.

profile-save-OK =
  Your profile has been successfully saved and is visible to other members of the group. You can view your profile 👉 /view Or feel free to complete it for more encounters! 👉 /profile

profile-save-KO =
  Oops! Your profile was not saved correctly.

profile-photo-save-KO =
  Oops! Your photo was not saved correctly.

profile-photo-upload-confirmation =
  Do you want to upload your profile photo now?

profile-photo-upload-confirmation-yes =
  Send me your photo! (or /cancel)

profile-photo-upload-confirmation-no =
  Too bad, a profile with a photo makes 10x more encounters!

profile-photo-upload-cancel =
  Profile photo upload canceled. 

profile-photo-received =
  Photo received 😍! You're going to make hearts flutter!

profile-delete-OK =
  Your profile has been successfully deleted.

profile-delete-KO = 
  Oops! Your profile was not deleted correctly.

profile-delete-confirmation =
  Do you really want to delete your profile? All your data will be erased...

profile-delete-OK =
  Your profile has been deleted.

profile-delete-confirmation-no =
  OK.

profile-photo-delete-confirmation =
  Do you want to delete your profile photo now?

profile-photo-delete-OK =
  Your profile photo has been deleted.

profile-photo-delete-KO = 
  Oops! Your profile photo was not deleted correctly.

profile-photo-delete-confirmation-no =
  OK.

stat-message = 
  Hello singles! 👋
  <b>Here are the statistics of the Bot '{$bot_name}' 👇</b>

stat-number-men = 
  🔷 {$number} men's profiles

stat-number-women = 
  🔶 {$number} women's profiles

stat-by-age-range =
  ♦️ {$number} profiles in the age range {$range}

stat-new-profiles-week =
  🟢 {$number} new profiles in the last 1 week

stat-new-profiles-month =
  🔵 {$number} new profiles in the last 1 month

stat-match-since-1-week =
  💛 {$number} matches in the last 1 week

stat-match-since-1-month =
  🧡 {$number} matches in the last 1 month 

stat-match-total =
  💙 {$number} matches since the beginning of the application 

create-profile-first =
  Searching is only accessible to users who have created a profile 😉. You can create your profile now using the /profile command

userId-undefined =
  Oops! The user is not known.

## Phrases for errors

profile-use-buttons-error =
  Use buttons to respond!

profile-expected-number-error =
  Please enter a number.

profile-age-minor-error =
  Your age cannot be less than 18 years.

profile-age-senior-error =
  You're not going to make me believe you're {$age} years old! 😱
  Please provide your real age (18 to 99 years).

non-available=
  Not available

cmd_only_admin_error =
  You must be an administrator to perform this action.