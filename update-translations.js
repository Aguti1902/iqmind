const fs = require('fs');
const path = require('path');

const newKeys = {
  "emailPlaceholder": {
    "fr": "Email",
    "de": "E-Mail",
    "it": "Email",
    "pt": "Email",
    "sv": "E-post",
    "no": "E-post"
  },
  "emailRequired": {
    "fr": "Veuillez entrer votre adresse e-mail",
    "de": "Bitte geben Sie Ihre E-Mail-Adresse ein",
    "it": "Si prega di inserire il proprio indirizzo email",
    "pt": "Por favor, insira o seu endereço de email",
    "sv": "Vänligen ange din e-postadress",
    "no": "Vennligst skriv inn e-postadressen din"
  },
  "emailInvalid": {
    "fr": "Veuillez entrer une adresse e-mail valide",
    "de": "Bitte geben Sie eine gültige E-Mail-Adresse ein",
    "it": "Si prega di inserire un indirizzo email valido",
    "pt": "Por favor, insira um endereço de email válido",
    "sv": "Vänligen ange en giltig e-postadress",
    "no": "Vennligst skriv inn en gyldig e-postadresse"
  },
  "termsRequired": {
    "fr": "Veuillez accepter les conditions générales pour continuer",
    "de": "Bitte akzeptieren Sie die Allgemeinen Geschäftsbedingungen, um fortzufahren",
    "it": "Si prega di accettare i termini e le condizioni per continuare",
    "pt": "Por favor, aceite os termos e condições para continuar",
    "sv": "Vänligen acceptera villkoren för att fortsätta",
    "no": "Vennligst godta vilkårene for å fortsette"
  },
  "acceptTerms": {
    "fr": "J'accepte les",
    "de": "Ich akzeptiere die",
    "it": "Accetto i",
    "pt": "Aceito os",
    "sv": "Jag accepterar",
    "no": "Jeg godtar"
  },
  "termsLink": {
    "fr": "conditions générales de service",
    "de": "Allgemeinen Geschäftsbedingungen",
    "it": "termini e condizioni del servizio",
    "pt": "termos e condições do serviço",
    "sv": "användarvillkoren",
    "no": "brukervilkårene"
  },
  "and": {
    "fr": "et",
    "de": "und",
    "it": "e",
    "pt": "e",
    "sv": "och",
    "no": "og"
  },
  "privacyLink": {
    "fr": "politique de confidentialité",
    "de": "Datenschutzrichtlinie",
    "it": "informativa sulla privacy",
    "pt": "política de privacidade",
    "sv": "integritetspolicy",
    "no": "personvernregler"
  },
  "trust1Title": {
    "fr": "Paiement 100% Sécurisé",
    "de": "100% Sichere Zahlung",
    "it": "Pagamento 100% Sicuro",
    "pt": "Pagamento 100% Seguro",
    "sv": "100% Säker Betalning",
    "no": "100% Sikker Betaling"
  },
  "trust1Desc": {
    "fr": "Cryptage SSL",
    "de": "SSL-Verschlüsselung",
    "it": "Crittografia SSL",
    "pt": "Criptografia SSL",
    "sv": "SSL-kryptering",
    "no": "SSL-kryptering"
  },
  "trust2Title": {
    "fr": "Accès Immédiat",
    "de": "Sofortiger Zugriff",
    "it": "Accesso Immediato",
    "pt": "Acesso Imediato",
    "sv": "Omedelbar Åtkomst",
    "no": "Umiddelbar Tilgang"
  },
  "trust2Desc": {
    "fr": "Résultats instantanés",
    "de": "Sofortige Ergebnisse",
    "it": "Risultati istantanei",
    "pt": "Resultados instantâneos",
    "sv": "Omedelbara resultat",
    "no": "Umiddelbare resultater"
  },
  "trust3Title": {
    "fr": "Annuler À Tout Moment",
    "de": "Jederzeit Kündigen",
    "it": "Annulla In Qualsiasi Momento",
    "pt": "Cancelar A Qualquer Momento",
    "sv": "Avboka När Som Helst",
    "no": "Kanseller Når Som Helst"
  },
  "trust3Desc": {
    "fr": "2 jours d'essai gratuit",
    "de": "2 Tage kostenlose Testversion",
    "it": "2 giorni di prova gratuita",
    "pt": "2 dias de teste grátis",
    "sv": "2 dagars gratis provperiod",
    "no": "2 dagers gratis prøveperiode"
  }
};

const languages = ['fr', 'de', 'it', 'pt', 'sv', 'no'];

languages.forEach(lang => {
  const filePath = path.join(__dirname, 'messages', `${lang}.json`);
  const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  
  // Agregar las nuevas claves a estimatedResult
  if (data.estimatedResult) {
    Object.keys(newKeys).forEach(key => {
      if (newKeys[key][lang]) {
        data.estimatedResult[key] = newKeys[key][lang];
      }
    });
  }
  
  // Guardar el archivo actualizado
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
  console.log(`✅ ${lang}.json actualizado`);
});

console.log('\n✅ Todas las traducciones actualizadas');

