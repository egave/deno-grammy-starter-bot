### Localization for deno-grammy-starter Bot

## Global phrases shared across pages

-project-name = Deno Grammy Starter Bot

-cmd-start = /start
-cmd-help = /help
-cmd-cgu = /terms
-cmd-profile = /profile
-cmd-cancel = /cancel
-cmd-back = /back
-cmd-quit = /quit
-cmd-skip = /skip

## Commands

start = 
  { $hasSignedUp ->
    [1] Welcome {$name} to {-project-name}! 👋

    This application provides a starter kit for a Telegram Bot.
    This kit uses the Grammyjs framework and Deno's serverless hosting solution.
  
    Send {-cmd-help} for a list of available commands.
    
    [0] Welcome {$name} to {-project-name}! 👋
    
    To use this bot, you must first accept its terms of use 👉 {-cmd-cgu}
    
    *[other] Hmm... Something went wrong, there seems to be a bug.
  }

help = 
  <blockquote>❓<b> Here are the available commands:</b></blockquote>
  {-cmd-start}: initializes the Bot and show a welcome message & a description of the Bot
  {-cmd-help}: show this help message
  {-cmd-cgu}: allows you to read and accept/decline the Terms of Use
  {-cmd-profile}: allows you to create/modify/delete your profile
  {-cmd-cancel}: cancels an ongoing conversation with the Bot
  
info =
  Bot Name: {-project-name}
  Bot Version: {$version}
  Deployment Date: {$version-date}
  --
  user-id: {$user-id}
  first-name: {$first-name}
  last-name: {$last-name}
  is-bot: {$is-bot}
  language-code: {$language-code}
  chat-id: {$chat-id}
  chat-type: {$chat-type}

info-light =
  Bot Name: {-project-name}
  Bot Version: {$version}
  Deployment Date: {$version-date}
  --
  chat-id: {$chat-id}
  chat-type: {$chat-type}

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
  ✅ I accept

btn-refuse =
  ❌ I refuse

btn-replay-cgu = 
  Review Terms

btn-woman = 
  Woman 👩‍🦰

btn-man = 
  Man 👨🏻 

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

btn-bio-add =
  Write a short bio

btn-bio-edit =
  Edit your bio

month-label-january =
  January

month-label-february = 
  February

month-label-march =
  March

month-label-april = 
  April

month-label-may = 
  May

month-label-june =
  June

month-label-july =
  July

month-label-august = 
  August

month-label-september =
  September

month-label-october =
  October

month-label-november =
  November

month-label-december =
  December

need-sign-cgu =
  To use this bot, you must accept its terms of use 👉 {-cmd-cgu} 

cgu-text-0 =
  These terms outline the principles and commitments to accept before using our Telegram bot. The bot aims to provide educational information about creating Telegram Bot applications.

  The bot is provided as is, without any functionality guarantee. Bugs may occur, and we will try to fix them, but immediate fixes are not guaranteed. Your suggestions for improving the bot are welcome, but the author is not responsible for any bot malfunctions. You use the bot at your own risk and responsibility.

  By using this bot, you agree to respect the rules and principles outlined in these terms.

  When first using the bot, you will be prompted to read and approve these terms before accessing its features. This action constitutes your electronic signature, confirming your acceptance of the terms and conditions.

  Thank you for your attention and understanding. We look forward to offering you a rewarding experience with our Telegram bot.

cgu-accepted =
  Thank you for your signature! You can now access all of the Bot's features. 

cgu-refused =
  You have not accepted the Bot's terms of use.
  Therefore, you cannot use it.
 
cgu-already-accepted =
  You have accepted the Terms of Use of <b>{-project-name}</b> on <b>{$date}</b>. ✅

  All that's left is to create your {-cmd-profile}. 🌟

cgu-already-refused =
  You have refused the Terms of Use of <b>{-project-name}</b> on <b>{$date}</b>. ❌
  
  You can review the Terms and accept them to start using <b>{-project-name}</b>.

cgu-quit =
  Have a great adventure with {-project-name} !

age-text =
  {" "}- {$age} years old

profile-view =
  <blockquote><b>{$title}</b></blockquote>

  { $gender ->
    [Man] <tg-emoji emoji-id="5368324170671202286">🙋‍♂️ </tg-emoji><strong>{$contact}</strong>{$age} 
    [Woman] <tg-emoji emoji-id="5368324170671202286">🙋‍♀️ </tg-emoji><strong>{$contact}</strong>{$age}
    *[other]
      <strong>{$contact}</strong>{$age}
  }
  <blockquote>
    <i>Member of {-project-name} since <b>{$membership}</b></i>
  </blockquote>
  {$bio}

profile-create =
  Your profile hasn't been created yet.
  Would you like to create it now?

profile-create-no = 
  Too bad. The {-cmd-profile} is required to use the application.

profile-create-step1 = 
  Are you a woman 👩‍🦰 or a man 👨🏻 ?

profile-ask-for-decade = 
  {$gender ->
    [Man] Great! you're a {-man}
    Enter your birth date.
    You were born in the ... years?
    [Woman] Great! you're a {-woman}
    Enter your birth date.
    You were born in the ... years?
   *[other] <tg-emoji emoji-id="5368324170671202286">🤔</tg-emoji>, neither Man nor Woman?
    Enter your birth date.
    You were born in the ... years?
  }

profile-ask-for-year =
  Continue... in which exact year?

profile-ask-for-month =
  Almost there... in which month?

profile-ask-for-day =
  And finally... which day?

birthday-decade-selected =
  Decade selected >> {$decade}

birthday-year-selected =
  Birth year >> {$year}

birthday-month-selected = 
  Birth month >> {$month}

birthday-day-selected = 
  Birth day >> {$day}

birthday-skipped =
  You skipped this step 

profile-birthday-skiped =
  You can provide your birth date later in your settings if needed by editing your profile.

profile-create-step3 = 
  What is your place of residence (postal_code)?

profile-write-bio = 
  Complete your profile with a short description (or {-cmd-skip} this step)

profile-modify-bio =
  Enter your new bio (or {-cmd-skip})

profile-confirm-replace-bio =
  Are you sure you want to update your bio?
  This operation cannot be undone.

profile-bio-save-OK =
  Your bio has been saved successfully.
  You can view or edit your profile with 👉 {-cmd-profile}

profile-bio-save-KO =
  Error saving your bio.
  Please try again.

profile-bio-save-canceled =
  Update canceled. Your bio has not been modified.

profile-manage =
  Your profile already exists.
  You can view, edit, delete your profile,
  or detail your profile by clicking on the buttons below.

profile-missing-baseProfile =
  Your profile hasn't been created yet.
  You can create your profile now using the command /profile

profile-save-new-OK =
  Your profile has been saved successfully and is visible to other users of {-project-name}.
  Send {-cmd-help} for the complete list of available commands.

profile-save-OK =
  Your profile has been saved successfully and is visible to other users of {-project-name}.
  Feel free to complete it! 👉 {-cmd-profile}

profile-save-KO =
  Oops! Your profile wasn't saved correctly. Please try again.

profile-photo-upload-confirmation =
  Do you want to upload your profile photo now?

profile-photo-upload-confirmation-yes =
  Send your profile photo! (or {-cmd-skip} this step)

profile-photo-upload-confirmation-no =
  Too bad, a profile with a photo inspires 10x more confidence!

profile-bio-confirmation-no =
  Update canceled.

profile-photo-upload-OK =
  Photo received 😍 !

profile-photo-changed-OK =
  Photo received 😍 !
  You can view or edit your profile with 👉 {-cmd-profile}

profile-photo-upload-KO =
  Oops! Your photo wasn't saved correctly. Please try again.

profile-photo-upload-error =
  Oops! An error occurred while uploading the photo.
  Please try again.

profile-delete-OK =
  Your profile has been deleted successfully.

profile-delete-KO = 
  Oops! Your profile wasn't deleted correctly.

profile-delete-confirmation =
  Do you really want to delete your profile?
  All your data will be erased...

profile-delete-OK =
  Your profile has been deleted.

profile-delete-confirmation-no =
  OK.

profile-photo-delete-confirmation =
  Do you want to delete your profile photo now?

profile-photo-delete-OK =
  Your profile photo has been deleted.

profile-photo-delete-KO = 
  Oops! Your profile photo wasn't deleted correctly

profile-photo-delete-confirmation-no =
  OK.

stat-message = 
  Hello singles! 👋
  <b>Here are the statistics of the '{$bot_name}' Bot 👇</b>

stat-number-men = 
  🔷 {$number} men's profiles

stat-number-women = 
  🔶 {$number} women's profiles

stat-by-age-range =
  ♦️ {$number} profiles in the {$range} age range

stat-new-profiles-week =
  🟢 {$number} new profiles in the last week

stat-new-profiles-month =
  🔵 {$number} new profiles in the last month

stat-match-since-1-week =
  💛 {$number} matches in the last week

stat-match-since-1-month =
  🧡 {$number} matches in the last month 

stat-match-total =
  💙 {$number} matches since the application started 

create-profile-first =
  Searching is only accessible to users who have created a profile 😉.
  You can create your profile now using the command /profile

userId-undefined =
  Oops! The user is not known.

## Phrases for errors

profile-use-buttons-error =
  Use the buttons to respond!

profile-expected-number-error =
  Please enter a number

profile-age-minor-error =
  Your age cannot be less than 18 years.

profile-age-senior-error =
  You're not going to make me believe you're {$age} years old! 😱
  Please provide your real age (18 to 99 years)

profile-year-duration-text = 
  {$years} years

profile-year-month-duration-text =
  {$years} years and {$months} months

profile-month-duration-text = 
  {$months} months

profile-day-duration-text =
  { $days ->
    [0] today
    [1] {$days} day
    *[other] {$days} days
  }

non-available=
  not defined

cmd_only_admin_error =
  You must be an administrator to perform this action.