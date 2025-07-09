import { InlineKeyboard } from 'grammyjs'
import type { CustomContext } from '../models/customContext.ts'
import { DEFAULTS } from '../config.ts'
import { Month } from '../models/month.ts'
//import { SearchResult } from '../models/searchResult.ts'

export function inlineCharteKeyboardButtons (ctx: CustomContext): InlineKeyboard {
    const inlineKeyboard = new InlineKeyboard()
    .text(ctx.t('btn-accept'), "cgu:yes")
    .text(ctx.t('btn-refuse'), "cgu:no");

    return inlineKeyboard;
}
export function inlineReplayCGUKeyboardButtons(ctx: CustomContext): InlineKeyboard {
    const inlineKeyboard = new InlineKeyboard()
    .text(ctx.t('btn-replay-cgu'), "y")

    return inlineKeyboard;
}

// Simple keyboard for navigation selection. 
export function inlineCGUKeyboardButtons (ctx: CustomContext, 
    index: number, max: number, showAcceptRefuse: boolean): 
    { inlineKeyboard: InlineKeyboard, cguValues: string[] } {
    const inlineKeyboard = new InlineKeyboard()
    const cguValues: string[] = [];  // Tableau pour stocker les valeurs des boutons

    if (showAcceptRefuse && index === max-1) {
        inlineKeyboard.text(ctx.t('btn-accept'), "accept")
        cguValues.push('accept');  // Ajouter "Accept" aux valeurs
        inlineKeyboard.text(ctx.t('btn-refuse'), "refuse")
        .row();
        cguValues.push('refuse');  // Ajouter "Refuse" aux valeurs
    }
    
    if (index > 0) {
        inlineKeyboard.text(index + '/' + max + ' ' + ctx.t('btn-previous'), 'previous');
        cguValues.push('previous');  // Ajouter "Previous" aux valeurs
    }
    if (!showAcceptRefuse && index === max-1) {
        inlineKeyboard.text(ctx.t('btn-quit'), "quit")
        cguValues.push('quit');  // Ajouter "quit" aux valeurs
    }

    if (index < max-1) {
        const nextPageNumber: number = index+2;
        inlineKeyboard.text(ctx.t('btn-next') + ' ' + nextPageNumber + '/' + max, "next")
        cguValues.push('next');  // Ajouter "Previous" aux valeurs
    }
    // Retourner à la fois le clavier et les valeurs
    return {
    inlineKeyboard,
    cguValues
    };
};

export function inlineProfileMenuKeyboardButtons (ctx: CustomContext, hasPhotos: boolean, hasBio: boolean): 
        { inlineKeyboard: InlineKeyboard, profileMenuValues: string[] } {
    const inlineKeyboard = new InlineKeyboard()
    const profileMenuValues: string[] = [];  // Tableau pour stocker les valeurs des boutons
    
    const addOrEditPhotoKeyboard = "do-photo";
    let addOrEditPhotoButton = "btn-photo-add";
    //Le profile a au moins une photo de profile
    if (hasPhotos)
        addOrEditPhotoButton = "btn-photo-edit";
    
    const addOrEditBioKeyboard = "do-bio";
    let addOrEditBioButton = "btn-bio-add";
    //Le profile a au moins une photo de profile
    if (hasBio)
        addOrEditBioButton = "btn-bio-edit";

    // Define inlineKeyboard
    inlineKeyboard
    //.text(ctx.t('btn-display'), "display")
    .text(ctx.t('btn-edit'), "do-base")
    // Profile cannot be delete once created
    .text(ctx.t('btn-delete'), "delete").row()
    .text(ctx.t(addOrEditPhotoButton), addOrEditPhotoKeyboard)

    if (hasPhotos)
        inlineKeyboard.text(ctx.t('btn-photo-delete'), "delete-photo")
    
    inlineKeyboard
    .row()
    .text(ctx.t(addOrEditBioButton), addOrEditBioKeyboard);

    profileMenuValues.push("display", "do-base", "delete", addOrEditPhotoKeyboard, "delete-photo", "do-bio");
    
    return {inlineKeyboard,
         profileMenuValues};
}

// Simple yes/no keyboard with custom data.
export function inlineYesNoKeyboardButtons (ctx: CustomContext): InlineKeyboard {
    const inlineKeyboard = new InlineKeyboard()
    .text(ctx.t('btn-yes'), "y")
    .text(ctx.t('btn-no'), "n");

    return inlineKeyboard;
}

// Simple yes/back keyboard with custom data.
export function inlineYesBackKeyboardButtons (ctx: CustomContext, backButtonLabel: string): InlineKeyboard {
    const inlineKeyboard = new InlineKeyboard()
    .text(ctx.t('btn-yes'), "y")
    .text(ctx.t(backButtonLabel), "back");

    return inlineKeyboard;
}

// Simple yes/no keyboard with custom data.
export function inlineYesBackTripListKeyboardButtons (ctx: CustomContext): InlineKeyboard {
    const inlineKeyboard = new InlineKeyboard()
    .text(ctx.t('btn-yes'), "y")
    .text(ctx.t('btn-back-trip-list'), "n");

    return inlineKeyboard;
}

export function inlineAcceptBookingKeyboard(
    ctx: CustomContext,
    idTrip: string, idPassenger: number):
InlineKeyboard {
    const inlineKeyboard = new InlineKeyboard()
    .text(ctx.t('btn-accept'), `booking-accept:${idTrip}/${idPassenger}`)
    .text(ctx.t('btn-refuse'), `booking-refuse:${idTrip}/${idPassenger}`)
    .row()
    .text(ctx.t('btn-display-passenger-profile'), `display-profile:${idPassenger}/${idTrip}`);

    return inlineKeyboard;
}

// Simple keyboard for gender selection. 
export function inlineGenderKeyboardButtons (ctx: CustomContext): InlineKeyboard {
    const inlineKeyboard = new InlineKeyboard()
    .text(ctx.t('btn-woman'), "w")
    .text(ctx.t('btn-man'), "m");

    return inlineKeyboard;
};

// Simple keyboard for navigation selection. 
export function inlineAllTripsKeyboardButtons (ctx: CustomContext, 
    index: number, max: number): { inlineKeyboard: InlineKeyboard, allTripsValues: string[] } {
    const inlineKeyboard = new InlineKeyboard()
    const allTripsValues: string[] = [];  // Tableau pour stocker les valeurs des boutons

    if (index > 0) {
    inlineKeyboard.text(ctx.t('btn-previous'), 'previous');
    allTripsValues.push('previous');  // Ajouter "Previous" aux valeurs
    }
    if (index < max-1) {
    inlineKeyboard.text(ctx.t('btn-next'), "next")
    allTripsValues.push('next');  // Ajouter "Previous" aux valeurs
    }

    // Retourner à la fois le clavier et les valeurs
    return {
    inlineKeyboard,
    allTripsValues
    };
};

// Simple keyboard for navigation selection. 
export function inlineSearchTripsKeyboardButtons (ctx: CustomContext, 
                index: number, max: number, isBooked: boolean, canUnbook: boolean,
                remainingCapacity: number, hasProfile: boolean): 
{ inlineKeyboard: InlineKeyboard, foundTripsValues: string[] } {
    const inlineKeyboard = new InlineKeyboard()
    const foundTripsValues: string[] = [];  // Tableau pour stocker les valeurs des boutons

    // On permet à l'utilisateur de réserver uniquement s'il a un profile
    if (hasProfile) {
        if (isBooked) {
            if (canUnbook) {
                inlineKeyboard.text(ctx.t('btn-unbook-trip'), 'unbook-trip');
                foundTripsValues.push('unbook-trip');
            }
        } else {
            inlineKeyboard.text(ctx.t('btn-book-trip', { "number": 1 }), 'book-trip:1');
            foundTripsValues.push('book-trip:1');
            if (remainingCapacity === 2) {
                inlineKeyboard.text(ctx.t('btn-book-trip', { "number": 2 }), 'book-trip:2')
                foundTripsValues.push('book-trip:2');
            } else if (remainingCapacity > 2) {
                inlineKeyboard.text(ctx.t('btn-book-trip', { "number": remainingCapacity }), 'book-trip:' + remainingCapacity)
                foundTripsValues.push('book-trip:' + remainingCapacity);
            }
        }
        // Sauter une ligne
        inlineKeyboard.row();

        // On affiche le bouton permettant de voir le profil conducteur
        inlineKeyboard.text(ctx.t('btn-display-driver-profile'), 'display-profile');
        foundTripsValues.push('display-profile');
    } else {
        // On affiche un bouton indiquant : "Pour réserver, veuillez créer cotre profil"
        inlineKeyboard.text(ctx.t('btn-create-profile-first'), 'create-profile-first');
        foundTripsValues.push('create-profile-first');
    }
    // Sauter une ligne
    inlineKeyboard.row();
    
    if (index > 0) {
        inlineKeyboard.text(ctx.t('btn-previous'), 'previous');
        foundTripsValues.push('previous');  // Ajouter "Previous" aux valeurs
    }
    if (index < max-1) {
        inlineKeyboard.text(ctx.t('btn-next'), "next")
        foundTripsValues.push('next');  // Ajouter "Previous" aux valeurs
    }

    // Retourner à la fois le clavier et les valeurs
    return {
        inlineKeyboard,
        foundTripsValues
    };
};


// Simple keyboard for edit menu keyboard selection. 
export function inlineEditTripMenuKeyboardButtons (ctx: CustomContext): 
{ inlineKeyboard: InlineKeyboard, editTripValues: string[] } {

    const inlineKeyboard = new InlineKeyboard()
    const editTripValues: string[] = [];  // Tableau pour stocker les valeurs des boutons
    
    // inlineKeyboard.text(ctx.t('btn-edit-date'), 'edit-date')
    // .row()
    // .text(ctx.t('btn-edit-start'), 'edit-start')
    // .text(ctx.t('btn-edit-end'), 'edit-end')
    // .row()
    inlineKeyboard.text(ctx.t('btn-edit-places'), 'edit-places')
    .text(ctx.t('btn-edit-price'), 'edit-price')
    .row()
    .text(ctx.t('btn-edit-comment'), 'edit-comment')
    .row()
    .text(ctx.t('btn-back-trip-list'), 'back-trip-list')

    editTripValues.push(/*'edit-date', 'edit-start', 
        'edit-end', */'edit-places', 'edit-price', 'edit-comment', 'back-trip-list'); 
    // Retourner à la fois le clavier et les valeurs
    return {
        inlineKeyboard,
        editTripValues
    };
};

// Simple menu keyboard to manage trip bookings. 
export function inlineManageTripBookingsMenuKeyboardButtons (ctx: CustomContext,
    index: number, max: number, isPending: boolean, isRefused: boolean 
): { inlineKeyboard: InlineKeyboard, manageTripBookingsValues: string[] } {
    const inlineKeyboard = new InlineKeyboard()
    const manageTripBookingsValues: string[] = [];  // Tableau pour stocker les valeurs des boutons
    
    if (isPending) {
        inlineKeyboard.text(ctx.t('btn-accept'), 'accept')
        .text(ctx.t('btn-refuse'), 'refuse')
        .row();
        manageTripBookingsValues.push('accept', 'refuse');
    }

    if (isRefused) {
        inlineKeyboard.text(ctx.t('btn-accept'), 'accept')
        .row();
        manageTripBookingsValues.push('accept');
    }

    inlineKeyboard.text(ctx.t('btn-display-passenger-profile'), 'display-profile')
    .row();
    manageTripBookingsValues.push('display-profile');

    if (index > 0) {
        inlineKeyboard.text(ctx.t('btn-previous'), 'previous');
        manageTripBookingsValues.push('previous');  // Ajouter "Previous" aux valeurs
    }
    if (index < max-1) {
        inlineKeyboard.text(ctx.t('btn-next'), "next")
        manageTripBookingsValues.push('next');  // Ajouter "Previous" aux valeurs
    }

    inlineKeyboard.row()
    .text(ctx.t('btn-back-trip-list'), 'back-trip-list');
    manageTripBookingsValues.push('back-trip-list');
    
    return {
        inlineKeyboard,
        manageTripBookingsValues
    };
};

// Simple menu keyboard to manage passenger profile display. 
export function inlineDisplayProfileMenuKeyboardButtons (
    ctx: CustomContext,
    displaySendMessageButton: boolean,
    backButtonLabel?: string
): { inlineKeyboard: InlineKeyboard, displayProfileValues: string[] } {
    const inlineKeyboard = new InlineKeyboard()
    const displayProfileValues: string[] = [];  // Tableau pour stocker les valeurs des boutons

    inlineKeyboard.text(ctx.t('btn-report-profile'), 'report-profile');
    displayProfileValues.push('report-profile');

    if (displaySendMessageButton) {
        inlineKeyboard.text(ctx.t('btn-send-message'), 'send-message');
        displayProfileValues.push('send-message');
    }
    if (backButtonLabel) {
        inlineKeyboard.row()
            .text(ctx.t(backButtonLabel), 'back');
        displayProfileValues.push('back');
    }
    
    return {
        inlineKeyboard,
        displayProfileValues
    };
};

// Simple menu keyboard to manage passenger profile display. 
export function inlineReplyToMenuKeyboardButtons (
    ctx: CustomContext,
    from: number,
    to: number,
    idTrip: string
): InlineKeyboard {
    const inlineKeyboard = new InlineKeyboard()

    inlineKeyboard.text(ctx.t('btn-reply-to'), `reply-to:${from}/${to}/${idTrip}`);
    
    return inlineKeyboard;
};

// Simple menu keyboard to manage driver profile display. 
// Function NOT USED.
// Using more genric function: inlineDisplayProfileMenuKeyboardButtons
/* 
export function inlineDisplayDriverMenuKeyboardButtons (ctx: CustomContext): { inlineKeyboard: InlineKeyboard, displayProfileValues: string[] } {
    const inlineKeyboard = new InlineKeyboard()
    const displayProfileValues: string[] = [];  // Tableau pour stocker les valeurs des boutons
    
    inlineKeyboard.row()
    .text(ctx.t('btn-back-search-result'), 'back-search-result');
    displayProfileValues.push('back-search-result');
    
    return {
        inlineKeyboard,
        displayProfileValues
    };
};
*/

/*
export function inlineChooseResultRadiusMenuKeyboardButtons(
    ctx: CustomContext,
    results: SearchResult[][]
): { inlineKeyboard: InlineKeyboard; indexValues: string[] } {
    const inlineKeyboard = new InlineKeyboard();
    const indexValues: string[] = [];

    results.forEach((radiusResults, index) => {
        if (radiusResults.length > 0) {
            // Use the radiusKm from the first SearchResult in the array
            const radius = radiusResults[0].radiusKm;
            inlineKeyboard.row().text(
                ctx.t("btn-search-radius-result", {
                    radius: radius,
                    number: radiusResults.length,
                }),
                index.toString()
            );
            indexValues.push(index.toString());
        }
    });

    return { inlineKeyboard, indexValues };
}
*/

export function inlineBackTripListKeyboardButtons (ctx: CustomContext):
    { inlineKeyboard: InlineKeyboard, backTripListValues: string[] } 
{
    const inlineKeyboard = new InlineKeyboard();
    const backTripListValues: string[] = [];  // Tableau pour stocker les valeurs des boutons

    inlineKeyboard.text(ctx.t('btn-back-trip-list'), 'back-trip-list')
    .text(ctx.t('btn-exit-conversation'), 'exit-conversation')

    backTripListValues.push('back-trip-list', 'exit-conversation');  // Ajouter "Retour à la liste des voyages" aux valeurs

    return {
        inlineKeyboard,
        backTripListValues
    };
}
export function inlineBackBookingListKeyboardButtons (ctx: CustomContext):
    { inlineKeyboard: InlineKeyboard, backBookingListValues: string[] } 
{
    const inlineKeyboard = new InlineKeyboard();
    const backBookingListValues: string[] = [];  // Tableau pour stocker les valeurs des boutons
    
    inlineKeyboard.text(ctx.t('btn-back-booking-list'), 'back-booking-list')
    .text(ctx.t('btn-exit-conversation'), 'exit-conversation')
    
    backBookingListValues.push('back-booking-list', 'exit-conversation');  // Ajouter "Retour à la liste des voyages" aux valeurs

    return {
        inlineKeyboard,
        backBookingListValues
    };
}
export function inlineBackTripKeyboardButtons (ctx: CustomContext):
    { inlineKeyboard: InlineKeyboard, backTripValues: string[] } 
{
    const inlineKeyboard = new InlineKeyboard();
    const backTripValues: string[] = [];  // Tableau pour stocker les valeurs des boutons
    
    inlineKeyboard.text(ctx.t('btn-back-trip'), 'back-trip')
    .text(ctx.t('btn-back-trip-list'), 'back-trip-list')
    
    backTripValues.push('back-trip', 'back-trip-list');  // Ajouter "Retour à la liste des voyages" aux valeurs

    return {
        inlineKeyboard,
        backTripValues
    };
}

/*
export function inlineBackBookingListOrTripListKeyboardButtons (ctx: CustomContext):
    { inlineKeyboard: InlineKeyboard, backBackBookingValues: string[] } 
{
    const inlineKeyboard = new InlineKeyboard();
    const backBackBookingValues: string[] = [];  // Tableau pour stocker les valeurs des boutons
    
    inlineKeyboard.text(ctx.t('btn-back-booking-list'), 'back-booking-list')
    .text(ctx.t('btn-back-trip-list'), 'back-trip-list')
    
    backBackBookingValues.push('back-booking-list', 'back-trip-list');  // Ajouter "Retour à la liste des voyages" aux valeurs

    return {
        inlineKeyboard,
        backBackBookingValues
    };
}
*/

// Clavier inline pour choisir la localisation du point de départ
export function inlineLocationKeyboardButtons(ctx: CustomContext): 
            { inlineKeyboard: InlineKeyboard, locationValues: string[] } {
    const inlineKeyboard = new InlineKeyboard();
    const locationValues: string[] = [];  // Tableau pour stocker les valeurs des boutons

    // Ajout des boutons pour les options de localisation
    inlineKeyboard.text(ctx.t('trip-location-by-address'), 'address');
    locationValues.push('address');  // Ajouter "Adresse précise" aux valeurs

    inlineKeyboard.text(ctx.t('trip-location-by-free-entry'), 'free-entry');
    locationValues.push('free-entry');  // Ajouter "Saisie libre" aux valeurs

    inlineKeyboard.row();  // Saut de ligne
    inlineKeyboard.text(ctx.t('trip-no-location'), 'no-location');
    locationValues.push('no-location');  // Ajouter "Pas de précision" aux valeurs

    // Retourner à la fois le clavier et les valeurs
    return {
        inlineKeyboard,
        locationValues
    };
}

// Fonction pour générer un clavier inline pour le choix des mois
export function inlineMonthKeyboardButtons(
    ctx: CustomContext, 
    maxMonthsInAdvance: number = 6, 
    monthsPerLine: number = 3
) {
    const inlineKeyboard = new InlineKeyboard();
    const monthKeys = Object.keys(Month);  // Récupérer les clés de l'énum
    const monthValues: string[] = [];  // Tableau pour stocker les valeurs des boutons

    // Récupère la date actuelle
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth();  // Mois courant (0-11)
    const currentYear = currentDate.getFullYear();
    const currentDay = currentDate.getDate();  // Jour courant
    
    // Vérifier si c'est le dernier jour du mois
    const lastDayOfMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    const isLastDay = currentDay === lastDayOfMonth;

    // Liste des mois en utilisant l'enum Month
    const monthLabels = [
        Month.JANVIER, Month.FEVRIER, Month.MARS, Month.AVRIL, 
        Month.MAI, Month.JUIN, Month.JUILLET, Month.AOUT, 
        Month.SEPTEMBRE, Month.OCTOBRE, Month.NOVEMBRE, Month.DECEMBRE
    ];

    // Générer la liste des mois dans l'intervalle autorisé (mois actuels + mois d'anticipation)
    const totalMonths = Math.min(maxMonthsInAdvance, 12);  // Limite à 12 mois au maximum
    let monthCounter = 0;  // Compteur pour positionner les mois dans le keyboard
    
    // Si c'est le dernier jour, on commence au mois suivant
    const startOffset = isLastDay ? 1 : 0;

    for (let i = 0; i < totalMonths; i++) {
        const monthIndex = (currentMonth + i + startOffset) % 12;  // Pour gérer les années
        const year = currentYear + Math.floor((currentMonth + i + startOffset) / 12);  // Calcul de l'année
        const key = monthKeys[monthIndex];
        // Traduction du libellé des mois depuis les fichiers de langue
        const monthLabel = ctx.t(monthLabels[monthIndex]) + ` ${year}`;

        // Ajoute le mois au clavier inline
        inlineKeyboard.text(monthLabel, `${key}-${year}`);
        monthValues.push(`${key}-${year}`);  // Enregistrer la valeur correspondante pour plus tard

        // Ajoute une nouvelle ligne après chaque groupe de 'monthsPerLine'
        if (++monthCounter % monthsPerLine === 0) {
            inlineKeyboard.row();
        }
    }

    return  {
        inlineKeyboard,
        monthValues
    };
}

// Fonction pour générer un clavier inline pour le choix des jours
export function inlineDayKeyboardButtons(
    ctx: CustomContext, 
    month: Month, 
    year: number, // Ajout de l'année comme paramètre
    daysPerLine: number = 7 // Une semaine (lundi à dimanche)
) {
    const inlineKeyboard = new InlineKeyboard();
    const dayValues: string[] = []; // Tableau pour stocker les valeurs des boutons

    // Mapping des mois avec le nombre de jours par défaut
    const daysInMonth = {
        [Month.JANVIER]: 31,
        [Month.FEVRIER]: (year: number) => 
            (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0 ? 29 : 28,
        [Month.MARS]: 31,
        [Month.AVRIL]: 30,
        [Month.MAI]: 31,
        [Month.JUIN]: 30,
        [Month.JUILLET]: 31,
        [Month.AOUT]: 31,
        [Month.SEPTEMBRE]: 30,
        [Month.OCTOBRE]: 31,
        [Month.NOVEMBRE]: 30,
        [Month.DECEMBRE]: 31,
    };

    // Nombre de jours dans le mois sélectionné en fonction de l'année
    const daysInSelectedMonth = month === Month.FEVRIER ? daysInMonth[month](year) : daysInMonth[month];

    let startDay = 1;
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth();  // Mois courant (0-11)

    // Si le mois sélectionné est le mois en cours, démarre à J+1
    if (month === Object.values(Month)[currentMonth]) {
        startDay = currentDate.getDate() + 1;
    }

    // Calculer le jour de la semaine du 1er du mois (0 = dimanche, 1 = lundi, ..., 6 = samedi)
    const firstDayOfMonth = new Date(year, Object.values(Month).indexOf(month), 1).getDay();
    // Bug Fix #47
    const offset = firstDayOfMonth === 0 ? (firstDayOfMonth + 7) % 7 : firstDayOfMonth - 1;
    let dayCounter = 0;  // Compteur pour positionner les jours dans le keyboard

    // Ajouter des boutons vides (◾) avant le 1er jour du mois
    for (let i = 0; i < offset; i++) {
        inlineKeyboard.text('◽', 'void'); // Bouton vide avec callback unique
        dayCounter++;
        if (dayCounter % daysPerLine === 0) {
            inlineKeyboard.row();
        }
    }

    // Génère les boutons des jours
    for (let day = startDay; day <= daysInSelectedMonth; day++) {
        inlineKeyboard.text(day.toString(), `${day}`);
        dayValues.push(`${day}`);

        // Ajoute une nouvelle ligne après chaque groupe de 7 jours (lundi à dimanche)
        if (++dayCounter % daysPerLine === 0) {
            inlineKeyboard.row();
        }
    }

    // Ajouter des boutons vides (◾) après le dernier jour jusqu'au dimanche
    if (dayCounter % daysPerLine !== 0) {
        const remainingDays = daysPerLine - (dayCounter % daysPerLine);
        for (let i = 0; i < remainingDays; i++) {
            inlineKeyboard.text('◽', 'void'); // Bouton vide avec callback unique
            dayCounter++;
        }
    }

    return {
        inlineKeyboard,
        dayValues
    };
}

// Function to generate an inline keyboard for selecting the hour of the trip
export function inlineHourKeyboardButtons(
    hoursPerLine: number = 6 // Default to 6 buttons per line
) {
    const inlineKeyboard = new InlineKeyboard();
    const hourValues: string[] = [];  // Array to store button values (time)

    let hourCounter = 0;  // Counter to position the buttons

    // Loop to generate time buttons from 00 to 23
    for (let hour = 0; hour < 24; hour++) {
        const hourLabel = hour < 10 ? `0${hour}` : `${hour}`; // Format hour to always be two digits
        inlineKeyboard.text(hourLabel, `${hourLabel}`); // Add the button with the label
        hourValues.push(`${hourLabel}`); // Add the value to the array

        // Add a new row after 'hoursPerLine' buttons
        if (++hourCounter % hoursPerLine === 0) {
            inlineKeyboard.row();
        }
    }

    return {
        inlineKeyboard,
        hourValues
    };
}

// Function to generate an inline keyboard for selecting the minutes in two rows
export function inlineMinuteKeyboardButtons(
    buttonsPerLine: number = 6 // Default to 6 buttons per line
) {
    const inlineKeyboard = new InlineKeyboard();
    const minuteValues: string[] = [];  // Array to store the values of the minute buttons

    let minuteCounter = 0;  // Counter to position the buttons

    // Loop to generate minute buttons from 00 to 55, spaced by 5 minutes
    for (let minute = 0; minute < 60; minute += 15) {
        const minuteLabel = minute < 10 ? `0${minute}` : `${minute}`; // Format minutes to two digits
        inlineKeyboard.text(minuteLabel, `${minuteLabel}`);  // Add button with minute label
        minuteValues.push(`${minuteLabel}`);  // Store the minute value for callback queries

        // Add a new row after 'buttonsPerLine' buttons
        if (++minuteCounter % buttonsPerLine === 0) {
            inlineKeyboard.row();
        }
    }

    return {
        inlineKeyboard,
        minuteValues
    };
}

export function inlineBirthdayDecadeKeyboardButtons(ctx: CustomContext){
    const nbElemsPerRow: number = 3;
    const currentYear = new Date().getFullYear(); // Année actuelle
    const minYear = currentYear - 99; // Année minimale (99 ans en arrière)
    const maxYear = currentYear - 18; // Année maximale (18 ans en arrière)

    // Ajuster les décennies en fonction des limites
    const startDecade = Math.floor(minYear / 10) * 10; // Première décennie
    const endDecade = Math.floor(maxYear / 10) * 10; // Dernière décennie

    // Générer toutes les décennies
    const decades: number[] = [];
    for (let decade = startDecade; decade <= endDecade; decade += 10) {
        decades.push(decade);
    }

    // Convertir les décennies en chaînes
    const decadeValues: string[] = decades.map((decade) => `${decade}`);

    // Construire le clavier Telegram
    const inlineKeyboard = new InlineKeyboard();
    for (let i = 0; i < decadeValues.length; i++) {
        inlineKeyboard.text(`${decadeValues[i]}s`, `${decadeValues[i]}`);
        // Ajouter une nouvelle ligne après chaque "buttonsPerLine" boutons
        if ((i + 1) % nbElemsPerRow === 0) {
            inlineKeyboard.row();
        }
    }

    // Ajouter un bouton pour passer le choix de la date de naissance (si facultative)
    if (!DEFAULTS.PROFILE.BIRTHDAY_MANDATORY) {
        inlineKeyboard.row().text(ctx.t('btn-birthday-skip'), 'birthday-skip');
        decadeValues.push('birthday-skip');
    }

    return {
        inlineKeyboard,
        decadeValues
    };
}

export function inlineBirthdayYearKeyboardButtons(decade: string) {
    const nbElemsPerRow: number = 5;
    const currentYear = new Date().getFullYear(); // Année actuelle
    const minYear = currentYear - 99; // Année minimale (99 ans en arrière)
    const maxYear = currentYear - 18; // Année maximale (18 ans en arrière)

    // Décennie choisie (convertie en entier pour les calculs)
    const decadeStart = parseInt(decade, 10);
    if (isNaN(decadeStart)) {
        throw new Error("Invalid decade provided");
    }

    // Années valides dans la décennie choisie
    const validYears: number[] = [];
    for (let year = decadeStart; year < decadeStart + 10; year++) {
        if (year >= minYear && year <= maxYear) {
            validYears.push(year);
        }
    }

    const yearValues = validYears.map((y) => `${y}`);

    // Générer le clavier inline
    const inlineKeyboard = new InlineKeyboard();
    for (let i = 0; i < yearValues.length; i++) {
        inlineKeyboard.text(`${yearValues[i]}`, `${yearValues[i]}`);
        // Ajouter une nouvelle ligne après chaque "nbElemsPerRow" boutons
        if ((i + 1) % nbElemsPerRow === 0) {
            inlineKeyboard.row();
        }
    }

    // Retourner le clavier et les années valides
    return {
        inlineKeyboard,
        yearValues // Transforme en chaîne si nécessaire
    };
}

export function inlineBirthdayMonthKeyboardButtons(ctx: CustomContext, year: string) {
    const nbElemsPerRow: number = 4;
    const inlineKeyboard = new InlineKeyboard();
    const currentYear = new Date().getFullYear();
    const currentMonth = new Date().getMonth(); // Index des mois (0 = janvier, 11 = décembre)

    console.debug("currentYear: ", currentYear);
    console.debug("currentMonth: ", currentMonth);
    const yearInt = parseInt(year, 10);
    console.debug("yearInt: ", yearInt);
    if (isNaN(yearInt)) {
        throw new Error("Invalid year provided");
    }

    const monthLabels = [
        Month.JANVIER, Month.FEVRIER, Month.MARS, Month.AVRIL,
        Month.MAI, Month.JUIN, Month.JUILLET, Month.AOUT,
        Month.SEPTEMBRE, Month.OCTOBRE, Month.NOVEMBRE, Month.DECEMBRE
    ];

    const monthValues: string[] = [];
    let monthCounter = 0;

    for (let monthIndex = 0; monthIndex < 12; monthIndex++) {
        // Vérification des mois valides en fonction de l'année choisie
        const isValid =
            (yearInt === currentYear - 18 && monthIndex <= currentMonth) || // Mois de l'année actuelle
            (yearInt > currentYear - 99 && yearInt < currentYear - 18); // Entre 18 et 99 ans

        if (isValid) {
            const monthLabel = ctx.t(monthLabels[monthIndex]); // Traduction du libellé
            inlineKeyboard.text(monthLabel, `${monthIndex + 1}_${monthLabel}`);
            monthValues.push(`${monthIndex + 1}_${monthLabel}`);

            // Ajoute une nouvelle ligne après chaque groupe de 'nbElemsPerRow' boutons
            if (++monthCounter % nbElemsPerRow === 0) {
                inlineKeyboard.row();
            }
        }
    }

    return {
        inlineKeyboard,
        monthValues,
    };
}

export function inlineBirthdayDayKeyboardButtons(
    ctx: CustomContext, 
    year: string,
    month: string
) {
    const nbElemsPerRow: number = 6;
    const inlineKeyboard = new InlineKeyboard();
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth() + 1; // Mois actuel (1-12)
    const currentDay = currentDate.getDate(); // Jour actuel

    console.debug("currentYear:", currentYear);
    console.debug("currentMonth:", currentMonth);
    console.debug("currentDay:", currentDay);

    const yearInt = parseInt(year, 10);
    if (isNaN(yearInt)) {
        throw new Error("Invalid year provided");
    }

    const monthInt = parseInt(month, 10);
    if (isNaN(monthInt) || monthInt < 1 || monthInt > 12) {
        throw new Error("Invalid month provided");
    }

    console.debug("yearInt:", yearInt);
    console.debug("monthInt:", monthInt);

    // Déterminer le nombre de jours dans le mois sélectionné
    const daysInMonth = new Date(yearInt, monthInt, 0).getDate();
    console.debug("daysInMonth:", daysInMonth);

    const dayValues: string[] = [];
    let dayCounter = 0;

    for (let day = 1; day <= daysInMonth; day++) {
        // Vérification des jours valides en fonction de l'année et du mois choisis
        const isValid = 
            (yearInt === currentYear && monthInt === currentMonth && day <= currentDay) || // Mois et année actuels
            (yearInt > currentYear - 99 && yearInt < currentYear - 18) || // Entre 18 et 99 ans
            (yearInt === currentYear - 18 && monthInt < currentMonth) || // Juste 18 ans mais mois déjà dépassé
            (yearInt === currentYear - 18 && monthInt === currentMonth && day <= currentDay); // Exactement 18 ans ce mois-ci

        if (isValid) {
            inlineKeyboard.text(`${day}`, `${day}`);
            dayValues.push(day.toString());

            // Ajoute une nouvelle ligne après chaque groupe de 'nbElemsPerRow' boutons
            if (++dayCounter % nbElemsPerRow === 0) {
                inlineKeyboard.row();
            }
        }
    }

    return {
        inlineKeyboard,
        dayValues,
    };
}

enum AdminCmds {
    SEND_MESSAGE = "ac-send-message",
    MANAGE_REPORTS = "ac-manage-reports",
    BUG_FIX = "ac-bug-fix",
    INIT_FIX = "ac-init-fix",
    EXPIRE_TRIP = "ac-expire-trip",
    // DELETE_ALL_ARCHIVED_TRIPS = "ac-delete-all-archived-trips",
    // DELETE_ALL_TRIPS = "ac-delete-all-trips",
    // DELETE_ALL_BOOKINGS = "ac-delete-all-bookings",
    // ADD_DUMMY_CGUS = "ac-add-dummy-cgus",
    // ADD_DUMMY_PROFILES = "ac-add-dummy-profiles",
    // ADD_DUMMY_TRIPS = "ac-add-dummy-trips",
    // ADD_DUMMY_BOOKINGS = "ac-add-dummy-bookings",
    // DISPLAY_ALL_TRIPS = "ac-display-all-trips",
    SEND_REMINDER = "ac-send-reminder"
}

// Fonction pour générer le clavier inline pour le choix du type de voie 
// avec pagination et renvoyer les valeurs de sélection
export function inlineAdminCmdsKeyboardButtons(
    ctx: CustomContext, 
    page: number,
    nbElemsPerPage: number = 6, // Nombre d'éléments par page
    nbElemsPerRow: number = 2) { // Nombre d'éléments par ligne
    const inlineKeyboard = new InlineKeyboard();
    const adminCmdsKeys = Object.keys(AdminCmds);  // Récupérer les clés de l'énum
    const adminCmdsValues: string[] = [];  // Tableau pour stocker les valeurs des boutons

    // Calculer l'index de début et de fin pour la pagination
    const startIndex = page * nbElemsPerPage;
    const endIndex = Math.min(startIndex + nbElemsPerPage, adminCmdsKeys.length);

    // Ajouter les boutons pour la page actuelle
    for (let i = startIndex; i < endIndex; i++) {
        const key = adminCmdsKeys[i];
        const value = ctx.t(AdminCmds[key as keyof typeof AdminCmds]);
        
        // Ajouter un bouton pour chaque type de voie
        inlineKeyboard.text(value, `${key}`);  // `${key}` est un callback data unique
        
        // Ajouter un saut de ligne après chaque groupe de `nbElemsPerRow` éléments
        if ((i + 1) % nbElemsPerRow === 0) {
            inlineKeyboard.row();
        }

        adminCmdsValues.push(`${key}`);  // Enregistrer la valeur correspondante pour plus tard
    }
    
    // Forcer les boutons "Précédent" et "Suivant" à aller sur une nouvelle ligne
    inlineKeyboard.row();
    
    // Ajouter les boutons "Précédent" et "Suivant" pour naviguer
    if (page > 0) {
        inlineKeyboard.text(ctx.t('btn-previous'), 'previous');
        adminCmdsValues.push('previous');  // Ajouter "Previous" aux valeurs
    }
    if (endIndex < adminCmdsKeys.length) {
        inlineKeyboard.text(ctx.t('btn-next'), 'next');
        adminCmdsValues.push('next');  // Ajouter "Next" aux valeurs
    }

    // Retourner à la fois le clavier et les valeurs
    return {
        inlineKeyboard,
        adminCmdsValues
    };
}

export function inlineReportsKeyboardButtons (ctx: CustomContext, 
    index: number, max: number): { inlineKeyboard: InlineKeyboard, reportsValues: string[] } {
    const inlineKeyboard = new InlineKeyboard()
    const reportsValues: string[] = [];  // Tableau pour stocker les valeurs des boutons

    inlineKeyboard.text(ctx.t('btn-approve'), 'approve')
    .row()
    reportsValues.push('approve');  // Ajouter "Previous" aux valeurs

    inlineKeyboard.text(ctx.t('btn-reject'), 'reject')
    .row()
    reportsValues.push('reject');  // Ajouter "Previous" aux valeurs
    
    if (index > 0) {
        inlineKeyboard.text(ctx.t('btn-previous'), 'previous');
        reportsValues.push('previous');  // Ajouter "Previous" aux valeurs
    }
    if (index < max-1) {
        inlineKeyboard.text(ctx.t('btn-next'), "next")
        reportsValues.push('next');  // Ajouter "Previous" aux valeurs
    }

    // Retourner à la fois le clavier et les valeurs
    return {
        inlineKeyboard,
        reportsValues
    };
};

export function inlineChooseForWhomKeyboardButtons (ctx: CustomContext)
        : { inlineKeyboard: InlineKeyboard, toWhomValues: string[] } {
    const inlineKeyboard = new InlineKeyboard()
    const toWhomValues: string[] = [];  // Tableau pour stocker les valeurs des boutons

    inlineKeyboard.text(ctx.t('btn-send-to-all'), 'send-to-all')
    .text(ctx.t('btn-send-to-session-only'), 'send-to-session-only')
    .row()
    .text(ctx.t('btn-send-to-cgu-only'), 'send-to-cgu-only')
    .text(ctx.t('btn-send-to-profiles'), 'send-to-profiles');

    toWhomValues.push('send-to-all', 'send-to-session-only', 'send-to-cgu-only', 'send-to-profiles');  // Ajouter "Previous" aux valeurs

    // Retourner à la fois le clavier et les valeurs
    return {
        inlineKeyboard,
        toWhomValues
    };
};