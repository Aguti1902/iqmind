const fs = require('fs');
const path = require('path');

const translations = {
  "en": "This legal document is primarily available in Spanish. For inquiries in other languages, please contact support@iqmind.io",
  "fr": "Ce document juridique est principalement disponible en espagnol. Pour des demandes dans d'autres langues, veuillez contacter support@iqmind.io",
  "de": "Dieses rechtliche Dokument ist hauptsächlich auf Spanisch verfügbar. Für Anfragen in anderen Sprachen kontaktieren Sie bitte support@iqmind.io",
  "it": "Questo documento legale è disponibile principalmente in spagnolo. Per richieste in altre lingue, contattare support@iqmind.io",
  "pt": "Este documento legal está disponível principalmente em espanhol. Para consultas em outros idiomas, contacte support@iqmind.io",
  "sv": "Detta juridiska dokument är främst tillgängligt på spanska. För förfrågningar på andra språk, kontakta support@iqmind.io",
  "no": "Dette juridiske dokumentet er primært tilgjengelig på spansk. For henvendelser på andre språk, kontakt support@iqmind.io"
};

Object.keys(translations).forEach(lang => {
  const filePath = path.join(__dirname, 'messages', `${lang}.json`);
  const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  
  data.legal = {
    noticeTranslation: translations[lang]
  };
  
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
  console.log(`✅ ${lang}.json actualizado`);
});

console.log('\n✅ Avisos legales traducidos');

