const fs = require('fs');
const path = require('path');

const translations = {
  "fr": {
    "mainTitle": "Découvrez votre",
    "mainTitleHighlight": "Capacité Intellectuelle!",
    "mainSubtitle": "Fournissez votre email pour accéder à votre évaluation complète de l'intelligence et profil mental personnalisé."
  },
  "de": {
    "mainTitle": "Entdecken Sie Ihre",
    "mainTitleHighlight": "Intellektuelle Kapazität!",
    "mainSubtitle": "Geben Sie Ihre E-Mail an, um auf Ihre umfassende Intelligenzbewertung und personalisiertes mentales Profil zuzugreifen."
  },
  "it": {
    "mainTitle": "Scopri la tua",
    "mainTitleHighlight": "Capacità Intellettuale!",
    "mainSubtitle": "Fornisci la tua email per accedere alla tua valutazione completa dell'intelligenza e profilo mentale personalizzato."
  },
  "pt": {
    "mainTitle": "Descubra a sua",
    "mainTitleHighlight": "Capacidade Intelectual!",
    "mainSubtitle": "Forneça o seu email para aceder à sua avaliação completa de inteligência e perfil mental personalizado."
  },
  "sv": {
    "mainTitle": "Upptäck din",
    "mainTitleHighlight": "Intellektuella Kapacitet!",
    "mainSubtitle": "Ange din e-postadress för att få tillgång till din omfattande intelligensbedömning och personlig mental profil."
  },
  "no": {
    "mainTitle": "Oppdag din",
    "mainTitleHighlight": "Intellektuelle Kapasitet!",
    "mainSubtitle": "Oppgi e-postadressen din for å få tilgang til din omfattende intelligensvurdering og personlige mentale profil."
  }
};

Object.keys(translations).forEach(lang => {
  const filePath = path.join(__dirname, 'messages', `${lang}.json`);
  const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  
  if (data.estimatedResult) {
    data.estimatedResult.mainTitle = translations[lang].mainTitle;
    data.estimatedResult.mainTitleHighlight = translations[lang].mainTitleHighlight;
    data.estimatedResult.mainSubtitle = translations[lang].mainSubtitle;
  }
  
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
  console.log(`✅ ${lang}.json actualizado`);
});

console.log('\n✅ Títulos principales traducidos en todos los idiomas');

