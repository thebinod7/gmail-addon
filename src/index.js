/* Written by Amit Agarwal */

function onGmailMessageOpen(){
    console.log("Hello gmail!");
   return showGmailCard();
}

function onDefaultHomePageOpen(){
    return showHomeCard();
}

function showHomeCard() {
    var msg = CardService.newTextParagraph().setText(
      "Welcome to homepage!"
    );
    var updatedCard = CardService.newCardBuilder()
      .addSection(CardService.newCardSection().addWidget(msg))
      .build();
    return updatedCard;
}

function showGmailCard() {
    var msg = CardService.newTextParagraph().setText(
      "You are inside gmail."
    );
    var updatedCard = CardService.newCardBuilder()
      .addSection(CardService.newCardSection().addWidget(msg))
      .build();
    return updatedCard;
}

global.onGmailMessageOpen = onGmailMessageOpen;
global.onDefaultHomePageOpen = onDefaultHomePageOpen;
