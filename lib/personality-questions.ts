export interface PersonalityQuestion {
  id: number
  text: string
  dimension: 'O' | 'C' | 'E' | 'A' | 'N' // Openness, Conscientiousness, Extraversion, Agreeableness, Neuroticism
  reverse: boolean // Si true, la puntuación se invierte
}

export const personalityQuestions: PersonalityQuestion[] = [
  // Extraversión (E) - 8 preguntas
  { id: 1, text: 'Soy el alma de la fiesta', dimension: 'E', reverse: false },
  { id: 2, text: 'No hablo mucho', dimension: 'E', reverse: true },
  { id: 3, text: 'Me siento cómodo/a con otras personas', dimension: 'E', reverse: false },
  { id: 4, text: 'Me mantengo en segundo plano', dimension: 'E', reverse: true },
  { id: 5, text: 'Inicio conversaciones', dimension: 'E', reverse: false },
  { id: 6, text: 'Tengo poco que decir', dimension: 'E', reverse: true },
  { id: 7, text: 'Hablo con muchas personas diferentes en las fiestas', dimension: 'E', reverse: false },
  { id: 8, text: 'No me gusta llamar la atención', dimension: 'E', reverse: true },

  // Amabilidad (A) - 9 preguntas
  { id: 9, text: 'Me intereso por los demás', dimension: 'A', reverse: false },
  { id: 10, text: 'No me interesan los problemas de otras personas', dimension: 'A', reverse: true },
  { id: 11, text: 'Hago sentir cómodos a los demás', dimension: 'A', reverse: false },
  { id: 12, text: 'Insulto a la gente', dimension: 'A', reverse: true },
  { id: 13, text: 'Tengo un corazón blando', dimension: 'A', reverse: false },
  { id: 14, text: 'No estoy realmente interesado/a en los demás', dimension: 'A', reverse: true },
  { id: 15, text: 'Me tomo tiempo para los demás', dimension: 'A', reverse: false },
  { id: 16, text: 'Siento las emociones de otros', dimension: 'A', reverse: false },
  { id: 17, text: 'Hago que la gente se sienta a gusto', dimension: 'A', reverse: false },

  // Responsabilidad (C) - 9 preguntas
  { id: 18, text: 'Siempre estoy preparado/a', dimension: 'C', reverse: false },
  { id: 19, text: 'Dejo mis cosas desordenadas', dimension: 'C', reverse: true },
  { id: 20, text: 'Presto atención a los detalles', dimension: 'C', reverse: false },
  { id: 21, text: 'Hago un lío de las cosas', dimension: 'C', reverse: true },
  { id: 22, text: 'Hago las tareas de inmediato', dimension: 'C', reverse: false },
  { id: 23, text: 'A menudo olvido poner las cosas en su lugar', dimension: 'C', reverse: true },
  { id: 24, text: 'Me gusta el orden', dimension: 'C', reverse: false },
  { id: 25, text: 'Evito mis responsabilidades', dimension: 'C', reverse: true },
  { id: 26, text: 'Sigo un horario', dimension: 'C', reverse: false },

  // Neuroticismo (N) - 8 preguntas
  { id: 27, text: 'Me estreso fácilmente', dimension: 'N', reverse: false },
  { id: 28, text: 'Rara vez me siento triste', dimension: 'N', reverse: true },
  { id: 29, text: 'Me preocupo por las cosas', dimension: 'N', reverse: false },
  { id: 30, text: 'Rara vez me molesto', dimension: 'N', reverse: true },
  { id: 31, text: 'Mis emociones cambian fácilmente', dimension: 'N', reverse: false },
  { id: 32, text: 'Soy relajado/a la mayor parte del tiempo', dimension: 'N', reverse: true },
  { id: 33, text: 'Me enojo fácilmente', dimension: 'N', reverse: false },
  { id: 34, text: 'Rara vez me siento preocupado/a', dimension: 'N', reverse: true },

  // Apertura (O) - 10 preguntas
  { id: 35, text: 'Tengo una imaginación vívida', dimension: 'O', reverse: false },
  { id: 36, text: 'No me interesan las ideas abstractas', dimension: 'O', reverse: true },
  { id: 37, text: 'Tengo dificultad para entender ideas abstractas', dimension: 'O', reverse: true },
  { id: 38, text: 'No tengo una buena imaginación', dimension: 'O', reverse: true },
  { id: 39, text: 'Tengo un vocabulario rico', dimension: 'O', reverse: false },
  { id: 40, text: 'Estoy lleno/a de ideas', dimension: 'O', reverse: false },
  { id: 41, text: 'Uso palabras difíciles', dimension: 'O', reverse: false },
  { id: 42, text: 'Paso tiempo reflexionando sobre las cosas', dimension: 'O', reverse: false },
  { id: 43, text: 'Disfruto pensar sobre las cosas', dimension: 'O', reverse: false },
  { id: 44, text: 'Me gusta la variedad', dimension: 'O', reverse: false }
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

