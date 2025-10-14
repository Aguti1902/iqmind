const fs = require('fs');
const path = require('path');

const translations = {
  "en": {
    "errorMessage": "There was an error sending the message. Please try again.",
    "required": "* Required fields",
    "namePlaceholder": "Your name",
    "emailPlaceholder": "your@email.com",
    "messagePlaceholder": "Tell us how we can help you...",
    "subjectSelect": "Select a subject",
    "subjectTech": "Technical Support",
    "subjectBilling": "Billing and Payments",
    "subjectRefund": "Refund Request",
    "subjectSubscription": "Subscription Management",
    "subjectResult": "Problem with Results",
    "subjectOther": "Other",
    "emailDirect": "Or write to us directly at:"
  },
  "fr": {
    "errorMessage": "Une erreur s'est produite lors de l'envoi du message. Veuillez réessayer.",
    "required": "* Champs obligatoires",
    "namePlaceholder": "Votre nom",
    "emailPlaceholder": "votre@email.com",
    "messagePlaceholder": "Dites-nous comment nous pouvons vous aider...",
    "subjectSelect": "Sélectionnez un sujet",
    "subjectTech": "Support Technique",
    "subjectBilling": "Facturation et Paiements",
    "subjectRefund": "Demande de Remboursement",
    "subjectSubscription": "Gestion de l'Abonnement",
    "subjectResult": "Problème avec les Résultats",
    "subjectOther": "Autre",
    "emailDirect": "Ou écrivez-nous directement à:"
  },
  "de": {
    "errorMessage": "Beim Senden der Nachricht ist ein Fehler aufgetreten. Bitte versuchen Sie es erneut.",
    "required": "* Pflichtfelder",
    "namePlaceholder": "Ihr Name",
    "emailPlaceholder": "ihre@email.com",
    "messagePlaceholder": "Sagen Sie uns, wie wir Ihnen helfen können...",
    "subjectSelect": "Wählen Sie ein Thema",
    "subjectTech": "Technischer Support",
    "subjectBilling": "Abrechnung und Zahlungen",
    "subjectRefund": "Rückerstattungsanfrage",
    "subjectSubscription": "Abonnementverwaltung",
    "subjectResult": "Problem mit Ergebnissen",
    "subjectOther": "Andere",
    "emailDirect": "Oder schreiben Sie uns direkt an:"
  },
  "it": {
    "errorMessage": "Si è verificato un errore durante l'invio del messaggio. Si prega di riprovare.",
    "required": "* Campi obbligatori",
    "namePlaceholder": "Il tuo nome",
    "emailPlaceholder": "tua@email.com",
    "messagePlaceholder": "Dicci come possiamo aiutarti...",
    "subjectSelect": "Seleziona un argomento",
    "subjectTech": "Supporto Tecnico",
    "subjectBilling": "Fatturazione e Pagamenti",
    "subjectRefund": "Richiesta di Rimborso",
    "subjectSubscription": "Gestione Abbonamento",
    "subjectResult": "Problema con i Risultati",
    "subjectOther": "Altro",
    "emailDirect": "O scrivici direttamente a:"
  },
  "pt": {
    "errorMessage": "Ocorreu um erro ao enviar a mensagem. Por favor, tente novamente.",
    "required": "* Campos obrigatórios",
    "namePlaceholder": "O seu nome",
    "emailPlaceholder": "seu@email.com",
    "messagePlaceholder": "Diga-nos como podemos ajudá-lo...",
    "subjectSelect": "Selecione um assunto",
    "subjectTech": "Suporte Técnico",
    "subjectBilling": "Faturação e Pagamentos",
    "subjectRefund": "Pedido de Reembolso",
    "subjectSubscription": "Gestão de Subscrição",
    "subjectResult": "Problema com Resultados",
    "subjectOther": "Outro",
    "emailDirect": "Ou escreva-nos diretamente para:"
  },
  "sv": {
    "errorMessage": "Det uppstod ett fel när meddelandet skickades. Försök igen.",
    "required": "* Obligatoriska fält",
    "namePlaceholder": "Ditt namn",
    "emailPlaceholder": "din@email.com",
    "messagePlaceholder": "Berätta för oss hur vi kan hjälpa dig...",
    "subjectSelect": "Välj ett ämne",
    "subjectTech": "Teknisk Support",
    "subjectBilling": "Fakturering och Betalningar",
    "subjectRefund": "Återbetalningsbegäran",
    "subjectSubscription": "Prenumerationshantering",
    "subjectResult": "Problem med Resultat",
    "subjectOther": "Annat",
    "emailDirect": "Eller skriv till oss direkt på:"
  },
  "no": {
    "errorMessage": "Det oppsto en feil ved sending av meldingen. Vennligst prøv igjen.",
    "required": "* Obligatoriske felt",
    "namePlaceholder": "Ditt navn",
    "emailPlaceholder": "din@email.com",
    "messagePlaceholder": "Fortell oss hvordan vi kan hjelpe deg...",
    "subjectSelect": "Velg et emne",
    "subjectTech": "Teknisk Støtte",
    "subjectBilling": "Fakturering og Betalinger",
    "subjectRefund": "Refusjonsforespørsel",
    "subjectSubscription": "Abonnementshåndtering",
    "subjectResult": "Problem med Resultater",
    "subjectOther": "Annet",
    "emailDirect": "Eller skriv til oss direkte på:"
  }
};

Object.keys(translations).forEach(lang => {
  const filePath = path.join(__dirname, 'messages', `${lang}.json`);
  const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  
  if (data.contact) {
    Object.keys(translations[lang]).forEach(key => {
      data.contact[key] = translations[lang][key];
    });
  }
  
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
  console.log(`✅ ${lang}.json actualizado`);
});

console.log('\n✅ Página de contacto traducida en todos los idiomas');

