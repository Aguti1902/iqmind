export interface PersonalityQuestion {
  id: number
  text: string
  texts?: Record<string, string>
  dimension: 'O' | 'C' | 'E' | 'A' | 'N'
  reverse: boolean
}

export const personalityQuestions: PersonalityQuestion[] = [
  // Extraversión (E)
  { id: 1, text: 'Soy el alma de la fiesta', texts: { en: 'I am the life of the party', fr: 'Je suis l\'âme de la fête', de: 'Ich bin die Seele der Party', it: 'Sono l\'anima della festa', pt: 'Sou a alma da festa' }, dimension: 'E', reverse: false },
  { id: 2, text: 'No hablo mucho', texts: { en: 'I don\'t talk a lot', fr: 'Je ne parle pas beaucoup', de: 'Ich rede nicht viel', it: 'Non parlo molto', pt: 'Não falo muito' }, dimension: 'E', reverse: true },
  { id: 3, text: 'Me siento cómodo/a con otras personas', texts: { en: 'I feel comfortable around people', fr: 'Je me sens à l\'aise avec les autres', de: 'Ich fühle mich wohl unter Menschen', it: 'Mi sento a mio agio con gli altri', pt: 'Sinto-me confortável com outras pessoas' }, dimension: 'E', reverse: false },
  { id: 4, text: 'Me mantengo en segundo plano', texts: { en: 'I keep in the background', fr: 'Je reste en retrait', de: 'Ich halte mich im Hintergrund', it: 'Rimango in secondo piano', pt: 'Fico em segundo plano' }, dimension: 'E', reverse: true },
  { id: 5, text: 'Inicio conversaciones', texts: { en: 'I start conversations', fr: 'Je lance des conversations', de: 'Ich starte Gespräche', it: 'Inizio conversazioni', pt: 'Inicio conversas' }, dimension: 'E', reverse: false },
  { id: 6, text: 'Tengo poco que decir', texts: { en: 'I have little to say', fr: 'J\'ai peu à dire', de: 'Ich habe wenig zu sagen', it: 'Ho poco da dire', pt: 'Tenho pouco a dizer' }, dimension: 'E', reverse: true },
  { id: 7, text: 'Hablo con muchas personas diferentes en las fiestas', texts: { en: 'I talk to a lot of different people at parties', fr: 'Je parle à beaucoup de personnes différentes aux fêtes', de: 'Ich spreche mit vielen verschiedenen Leuten auf Partys', it: 'Parlo con molte persone diverse alle feste', pt: 'Falo com muitas pessoas diferentes nas festas' }, dimension: 'E', reverse: false },
  { id: 8, text: 'No me gusta llamar la atención', texts: { en: 'I don\'t like to draw attention to myself', fr: 'Je n\'aime pas attirer l\'attention', de: 'Ich mag es nicht, Aufmerksamkeit auf mich zu ziehen', it: 'Non mi piace attirare l\'attenzione', pt: 'Não gosto de chamar atenção para mim' }, dimension: 'E', reverse: true },

  // Amabilidad (A)
  { id: 9, text: 'Me intereso por los demás', texts: { en: 'I am interested in people', fr: 'Je m\'intéresse aux autres', de: 'Ich interessiere mich für Menschen', it: 'Sono interessato/a alle persone', pt: 'Tenho interesse pelas pessoas' }, dimension: 'A', reverse: false },
  { id: 10, text: 'No me interesan los problemas de otras personas', texts: { en: 'I don\'t care about other people\'s problems', fr: 'Les problèmes des autres ne m\'intéressent pas', de: 'Mich interessieren die Probleme anderer nicht', it: 'Non mi interessano i problemi degli altri', pt: 'Não me interessam os problemas dos outros' }, dimension: 'A', reverse: true },
  { id: 11, text: 'Hago sentir cómodos a los demás', texts: { en: 'I make people feel at ease', fr: 'Je mets les autres à l\'aise', de: 'Ich bringe andere dazu, sich wohl zu fühlen', it: 'Faccio sentire gli altri a loro agio', pt: 'Faço as pessoas se sentirem à vontade' }, dimension: 'A', reverse: false },
  { id: 12, text: 'Insulto a la gente', texts: { en: 'I insult people', fr: 'J\'insulte les gens', de: 'Ich beleitige Menschen', it: 'Insulto le persone', pt: 'Insulto as pessoas' }, dimension: 'A', reverse: true },
  { id: 13, text: 'Tengo un corazón blando', texts: { en: 'I have a soft heart', fr: 'J\'ai un cœur tendre', de: 'Ich habe ein weiches Herz', it: 'Ho un cuore tenero', pt: 'Tenho um coração mole' }, dimension: 'A', reverse: false },
  { id: 14, text: 'No estoy realmente interesado/a en los demás', texts: { en: 'I am not really interested in others', fr: 'Je ne suis pas vraiment intéressé(e) par les autres', de: 'Ich bin nicht wirklich an anderen interessiert', it: 'Non sono davvero interessato/a agli altri', pt: 'Não estou realmente interessado/a nos outros' }, dimension: 'A', reverse: true },
  { id: 15, text: 'Me tomo tiempo para los demás', texts: { en: 'I take time out for others', fr: 'Je prends du temps pour les autres', de: 'Ich nehme mir Zeit für andere', it: 'Mi prendo del tempo per gli altri', pt: 'Reservo tempo para os outros' }, dimension: 'A', reverse: false },
  { id: 16, text: 'Siento las emociones de otros', texts: { en: 'I feel others\' emotions', fr: 'Je ressens les émotions des autres', de: 'Ich fühle die Emotionen anderer', it: 'Sento le emozioni degli altri', pt: 'Sinto as emoções dos outros' }, dimension: 'A', reverse: false },
  { id: 17, text: 'Hago que la gente se sienta a gusto', texts: { en: 'I make people feel comfortable', fr: 'Je mets les gens à l\'aise', de: 'Ich mache Menschen sich behaglich', it: 'Faccio sentire le persone a proprio agio', pt: 'Faço as pessoas se sentirem confortáveis' }, dimension: 'A', reverse: false },

  // Responsabilidad (C)
  { id: 18, text: 'Siempre estoy preparado/a', texts: { en: 'I am always prepared', fr: 'Je suis toujours préparé(e)', de: 'Ich bin immer vorbereitet', it: 'Sono sempre preparato/a', pt: 'Estou sempre preparado/a' }, dimension: 'C', reverse: false },
  { id: 19, text: 'Dejo mis cosas desordenadas', texts: { en: 'I leave my belongings around', fr: 'Je laisse mes affaires en désordre', de: 'Ich lasse meine Sachen herumliegen', it: 'Lascio le mie cose in disordine', pt: 'Deixo minhas coisas espalhadas' }, dimension: 'C', reverse: true },
  { id: 20, text: 'Presto atención a los detalles', texts: { en: 'I pay attention to details', fr: 'Je fais attention aux détails', de: 'Ich achte auf Details', it: 'Presto attenzione ai dettagli', pt: 'Presto atenção aos detalhes' }, dimension: 'C', reverse: false },
  { id: 21, text: 'Hago un lío de las cosas', texts: { en: 'I make a mess of things', fr: 'Je fais un désordre des choses', de: 'Ich mache Dinge durcheinander', it: 'Faccio un pasticcio delle cose', pt: 'Faço bagunça com as coisas' }, dimension: 'C', reverse: true },
  { id: 22, text: 'Hago las tareas de inmediato', texts: { en: 'I get chores done right away', fr: 'Je fais les tâches immédiatement', de: 'Ich erledige Aufgaben sofort', it: 'Faccio i compiti subito', pt: 'Faço as tarefas imediatamente' }, dimension: 'C', reverse: false },
  { id: 23, text: 'A menudo olvido poner las cosas en su lugar', texts: { en: 'I often forget to put things back in their proper place', fr: 'J\'oublie souvent de remettre les choses à leur place', de: 'Ich vergesse oft, Dinge an ihren Platz zu legen', it: 'Dimentico spesso di mettere le cose al loro posto', pt: 'Esqueço de colocar as coisas no lugar' }, dimension: 'C', reverse: true },
  { id: 24, text: 'Me gusta el orden', texts: { en: 'I like order', fr: 'J\'aime l\'ordre', de: 'Ich mag Ordnung', it: 'Mi piace l\'ordine', pt: 'Gosto de ordem' }, dimension: 'C', reverse: false },
  { id: 25, text: 'Evito mis responsabilidades', texts: { en: 'I shirk my duties', fr: 'J\'évite mes responsabilités', de: 'Ich weiche meinen Pflichten aus', it: 'Evito le mie responsabilità', pt: 'Evito as minhas responsabilidades' }, dimension: 'C', reverse: true },
  { id: 26, text: 'Sigo un horario', texts: { en: 'I follow a schedule', fr: 'Je suis un horaire', de: 'Ich halte einen Zeitplan ein', it: 'Seguo un orario', pt: 'Sigo um horário' }, dimension: 'C', reverse: false },

  // Neuroticismo (N)
  { id: 27, text: 'Me estreso fácilmente', texts: { en: 'I get stressed out easily', fr: 'Je me stresse facilement', de: 'Ich werde leicht gestresst', it: 'Mi stresso facilmente', pt: 'Fico estressado/a facilmente' }, dimension: 'N', reverse: false },
  { id: 28, text: 'Rara vez me siento triste', texts: { en: 'I seldom feel blue', fr: 'Je me sens rarement triste', de: 'Ich fühle mich selten traurig', it: 'Mi sento raramente triste', pt: 'Raramente me sinto triste' }, dimension: 'N', reverse: true },
  { id: 29, text: 'Me preocupo por las cosas', texts: { en: 'I worry about things', fr: 'Je m\'inquiète des choses', de: 'Ich mache mir Sorgen um Dinge', it: 'Mi preoccupo per le cose', pt: 'Preocupo-me com as coisas' }, dimension: 'N', reverse: false },
  { id: 30, text: 'Rara vez me molesto', texts: { en: 'I am seldom in a bad mood', fr: 'Je suis rarement de mauvaise humeur', de: 'Ich bin selten schlechter Laune', it: 'Sono raramente di cattivo umore', pt: 'Raramente fico de mau humor' }, dimension: 'N', reverse: true },
  { id: 31, text: 'Mis emociones cambian fácilmente', texts: { en: 'My moods change easily', fr: 'Mes humeurs changent facilement', de: 'Meine Stimmungen ändern sich leicht', it: 'I miei stati d\'animo cambiano facilmente', pt: 'Meu humor muda facilmente' }, dimension: 'N', reverse: false },
  { id: 32, text: 'Soy relajado/a la mayor parte del tiempo', texts: { en: 'I am relaxed most of the time', fr: 'Je suis détendu(e) la plupart du temps', de: 'Ich bin die meiste Zeit entspannt', it: 'Sono rilassato/a la maggior parte del tempo', pt: 'Estou relaxado/a a maior parte do tempo' }, dimension: 'N', reverse: true },
  { id: 33, text: 'Me enojo fácilmente', texts: { en: 'I get angry easily', fr: 'Je me mets facilement en colère', de: 'Ich werde leicht wütend', it: 'Mi arrabbio facilmente', pt: 'Fico com raiva facilmente' }, dimension: 'N', reverse: false },
  { id: 34, text: 'Rara vez me siento preocupado/a', texts: { en: 'I seldom worry', fr: 'Je m\'inquiète rarement', de: 'Ich mache mir selten Sorgen', it: 'Mi preoccupo raramente', pt: 'Raramente me preocupo' }, dimension: 'N', reverse: true },

  // Apertura (O)
  { id: 35, text: 'Tengo una imaginación vívida', texts: { en: 'I have a vivid imagination', fr: 'J\'ai une imagination vive', de: 'Ich habe eine lebhafte Fantasie', it: 'Ho un\'immaginazione vivida', pt: 'Tenho uma imaginação vívida' }, dimension: 'O', reverse: false },
  { id: 36, text: 'No me interesan las ideas abstractas', texts: { en: 'I am not interested in abstract ideas', fr: 'Les idées abstraites ne m\'intéressent pas', de: 'Abstrakte Ideen interessieren mich nicht', it: 'Non mi interessano le idee astratte', pt: 'Não me interessam ideias abstratas' }, dimension: 'O', reverse: true },
  { id: 37, text: 'Tengo dificultad para entender ideas abstractas', texts: { en: 'I have difficulty understanding abstract ideas', fr: 'J\'ai du mal à comprendre les idées abstraites', de: 'Ich habe Schwierigkeiten, abstrakte Ideen zu verstehen', it: 'Ho difficoltà a capire idee astratte', pt: 'Tenho dificuldade em entender ideias abstratas' }, dimension: 'O', reverse: true },
  { id: 38, text: 'No tengo una buena imaginación', texts: { en: 'I do not have a good imagination', fr: 'Je n\'ai pas une bonne imagination', de: 'Ich habe keine gute Fantasie', it: 'Non ho una buona immaginazione', pt: 'Não tenho uma boa imaginação' }, dimension: 'O', reverse: true },
  { id: 39, text: 'Tengo un vocabulario rico', texts: { en: 'I have a rich vocabulary', fr: 'J\'ai un vocabulaire riche', de: 'Ich habe einen reichen Wortschatz', it: 'Ho un vocabolario ricco', pt: 'Tenho um vocabulário rico' }, dimension: 'O', reverse: false },
  { id: 40, text: 'Estoy lleno/a de ideas', texts: { en: 'I am full of ideas', fr: 'Je suis plein(e) d\'idées', de: 'Ich bin voller Ideen', it: 'Sono pieno/a di idee', pt: 'Estou cheio/a de ideias' }, dimension: 'O', reverse: false },
  { id: 41, text: 'Uso palabras difíciles', texts: { en: 'I use difficult words', fr: 'J\'utilise des mots difficiles', de: 'Ich benutze schwierige Wörter', it: 'Uso parole difficili', pt: 'Uso palavras difíceis' }, dimension: 'O', reverse: false },
  { id: 42, text: 'Paso tiempo reflexionando sobre las cosas', texts: { en: 'I spend time reflecting on things', fr: 'Je passe du temps à réfléchir aux choses', de: 'Ich verbringe Zeit damit, über Dinge nachzudenken', it: 'Passo tempo a riflettere sulle cose', pt: 'Passo tempo refletindo sobre as coisas' }, dimension: 'O', reverse: false },
  { id: 43, text: 'Disfruto pensar sobre las cosas', texts: { en: 'I enjoy thinking about things', fr: 'J\'aime penser aux choses', de: 'Ich genieße es, über Dinge nachzudenken', it: 'Mi piace pensare alle cose', pt: 'Gosto de pensar sobre as coisas' }, dimension: 'O', reverse: false },
  { id: 44, text: 'Me gusta la variedad', texts: { en: 'I enjoy variety', fr: 'J\'aime la variété', de: 'Ich mag Abwechslung', it: 'Mi piace la varietà', pt: 'Gosto de variedade' }, dimension: 'O', reverse: false }
]

export interface PersonalityResult {
  openness: number
  conscientiousness: number
  extraversion: number
  agreeableness: number
  neuroticism: number
}

export function calculatePersonalityScores(answers: { [key: number]: number }): PersonalityResult {
  const scores = {
    O: [] as number[],
    C: [] as number[],
    E: [] as number[],
    A: [] as number[],
    N: [] as number[]
  }

  personalityQuestions.forEach(question => {
    const answer = answers[question.id]
    if (answer !== undefined) {
      // Invertir puntuación si la pregunta es reversa
      const score = question.reverse ? (6 - answer) : answer
      scores[question.dimension].push(score)
    }
  })

  // Calcular promedio para cada dimensión y normalizar a 0-100
  const calculateAverage = (arr: number[]) => {
    if (arr.length === 0) return 50
    const sum = arr.reduce((a, b) => a + b, 0)
    const avg = sum / arr.length
    // Convertir de escala 1-5 a 0-100
    return Math.round(((avg - 1) / 4) * 100)
  }

  return {
    openness: calculateAverage(scores.O),
    conscientiousness: calculateAverage(scores.C),
    extraversion: calculateAverage(scores.E),
    agreeableness: calculateAverage(scores.A),
    neuroticism: calculateAverage(scores.N)
  }
}

export function getPersonalityInterpretation(dimension: string, score: number): string {
  const interpretations: { [key: string]: { low: string, medium: string, high: string } } = {
    openness: {
      low: 'Prefieres lo práctico y familiar. Valoras la tradición y las rutinas establecidas.',
      medium: 'Equilibras la apertura a nuevas experiencias con preferencias establecidas.',
      high: 'Eres creativo/a, imaginativo/a y buscas nuevas experiencias. Te gusta explorar ideas abstractas.'
    },
    conscientiousness: {
      low: 'Eres más espontáneo/a y flexible. Prefieres adaptarte sobre planificar.',
      medium: 'Balanceas la organización con la espontaneidad según la situación.',
      high: 'Eres organizado/a, responsable y orientado/a a objetivos. Valoras la disciplina y el orden.'
    },
    extraversion: {
      low: 'Prefieres ambientes tranquilos y actividades introspectivas. Recargas energía en soledad.',
      medium: 'Disfrutas tanto de momentos sociales como de tiempo a solas.',
      high: 'Eres sociable, enérgico/a y disfrutas estar rodeado/a de gente. Te sientes vivo/a en situaciones sociales.'
    },
    agreeableness: {
      low: 'Eres más competitivo/a y directo/a. Priorizas la verdad sobre la armonía.',
      medium: 'Equilibras la cooperación con la asertividad según el contexto.',
      high: 'Eres empático/a, cooperativo/a y valoras las relaciones armoniosas. Te importa el bienestar de los demás.'
    },
    neuroticism: {
      low: 'Eres emocionalmente estable, calmado/a y manejas bien el estrés.',
      medium: 'Experimentas emociones normales sin extremos marcados.',
      high: 'Eres más sensible emocionalmente y tiendes a experimentar emociones intensas. Puedes beneficiarte de técnicas de manejo del estrés.'
    }
  }

  const levels = interpretations[dimension.toLowerCase()]
  if (!levels) return ''

  if (score < 40) return levels.low
  if (score < 60) return levels.medium
  return levels.high
}

