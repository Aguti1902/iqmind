export interface EQQuestion {
  id: number
  text: string
  category: 'self_awareness' | 'self_regulation' | 'motivation' | 'empathy' | 'social_skills'
  reverse?: boolean
}

export const eqQuestions: EQQuestion[] = [
  // Autoconciencia (Self-Awareness) - 7 preguntas
  {
    id: 1,
    text: 'Puedo identificar fácilmente mis emociones cuando las experimento',
    category: 'self_awareness'
  },
  {
    id: 2,
    text: 'Entiendo las razones detrás de mis sentimientos',
    category: 'self_awareness'
  },
  {
    id: 3,
    text: 'Soy consciente de cómo mis emociones afectan mi comportamiento',
    category: 'self_awareness'
  },
  {
    id: 4,
    text: 'Reconozco mis fortalezas y limitaciones emocionales',
    category: 'self_awareness'
  },
  {
    id: 5,
    text: 'A menudo me sorprendo con mis propias reacciones emocionales',
    category: 'self_awareness',
    reverse: true
  },
  {
    id: 6,
    text: 'Presto atención a mis estados de ánimo y sentimientos',
    category: 'self_awareness'
  },
  {
    id: 7,
    text: 'Puedo distinguir entre diferentes emociones que experimento',
    category: 'self_awareness'
  },

  // Autorregulación (Self-Regulation) - 7 preguntas
  {
    id: 8,
    text: 'Puedo controlar mis emociones cuando necesito hacerlo',
    category: 'self_regulation'
  },
  {
    id: 9,
    text: 'Me recupero rápidamente después de situaciones estresantes',
    category: 'self_regulation'
  },
  {
    id: 10,
    text: 'Puedo calmarme cuando estoy enojado/a o molesto/a',
    category: 'self_regulation'
  },
  {
    id: 11,
    text: 'Mis emociones me dominan fácilmente',
    category: 'self_regulation',
    reverse: true
  },
  {
    id: 12,
    text: 'Puedo adaptarme a los cambios emocionalmente',
    category: 'self_regulation'
  },
  {
    id: 13,
    text: 'Exploto fácilmente cuando algo me frustra',
    category: 'self_regulation',
    reverse: true
  },
  {
    id: 14,
    text: 'Puedo manejar mis impulsos efectivamente',
    category: 'self_regulation'
  },

  // Motivación (Motivation) - 6 preguntas
  {
    id: 15,
    text: 'Me motivo fácilmente para alcanzar mis objetivos',
    category: 'motivation'
  },
  {
    id: 16,
    text: 'Persisto en mis metas a pesar de los obstáculos',
    category: 'motivation'
  },
  {
    id: 17,
    text: 'Encuentro energía interna para completar tareas difíciles',
    category: 'motivation'
  },
  {
    id: 18,
    text: 'Me rindo fácilmente cuando las cosas se ponen difíciles',
    category: 'motivation',
    reverse: true
  },
  {
    id: 19,
    text: 'Mantengo una actitud positiva incluso en situaciones desafiantes',
    category: 'motivation'
  },
  {
    id: 20,
    text: 'Me entusiasmo con nuevos proyectos y desafíos',
    category: 'motivation'
  },

  // Empatía (Empathy) - 7 preguntas
  {
    id: 21,
    text: 'Puedo percibir fácilmente cómo se sienten los demás',
    category: 'empathy'
  },
  {
    id: 22,
    text: 'Comprendo las perspectivas de otras personas',
    category: 'empathy'
  },
  {
    id: 23,
    text: 'Me preocupo por los sentimientos de los demás',
    category: 'empathy'
  },
  {
    id: 24,
    text: 'Me cuesta entender por qué las personas se sienten como se sienten',
    category: 'empathy',
    reverse: true
  },
  {
    id: 25,
    text: 'Soy sensible a las necesidades emocionales de otros',
    category: 'empathy'
  },
  {
    id: 26,
    text: 'Puedo "leer" las emociones en las expresiones faciales de las personas',
    category: 'empathy'
  },
  {
    id: 27,
    text: 'Me conecto emocionalmente con las experiencias de otros',
    category: 'empathy'
  },

  // Habilidades Sociales (Social Skills) - 6 preguntas
  {
    id: 28,
    text: 'Manejo bien los conflictos con otras personas',
    category: 'social_skills'
  },
  {
    id: 29,
    text: 'Puedo influir positivamente en las emociones de los demás',
    category: 'social_skills'
  },
  {
    id: 30,
    text: 'Construyo relaciones positivas fácilmente',
    category: 'social_skills'
  },
  {
    id: 31,
    text: 'Me cuesta trabajar en equipo',
    category: 'social_skills',
    reverse: true
  },
  {
    id: 32,
    text: 'Soy efectivo/a comunicando mis sentimientos a otros',
    category: 'social_skills'
  },
  {
    id: 33,
    text: 'Sé cómo apoyar emocionalmente a las personas',
    category: 'social_skills'
  }
]

export interface EQResult {
  totalScore: number
  selfAwareness: number
  selfRegulation: number
  motivation: number
  empathy: number
  socialSkills: number
  overallEQ: number
}

export function calculateEQScores(answers: { [key: number]: number }): EQResult {
  const scores = {
    self_awareness: [] as number[],
    self_regulation: [] as number[],
    motivation: [] as number[],
    empathy: [] as number[],
    social_skills: [] as number[]
  }

  eqQuestions.forEach(question => {
    const answer = answers[question.id]
    if (answer !== undefined) {
      // Invertir si es pregunta reversa
      const score = question.reverse ? (6 - answer) : answer
      scores[question.category].push(score)
    }
  })

  // Calcular promedios y normalizar a 0-100
  const calculateAverage = (arr: number[]) => {
    if (arr.length === 0) return 50
    const sum = arr.reduce((a, b) => a + b, 0)
    const avg = sum / arr.length
    return Math.round(((avg - 1) / 4) * 100)
  }

  const selfAwareness = calculateAverage(scores.self_awareness)
  const selfRegulation = calculateAverage(scores.self_regulation)
  const motivation = calculateAverage(scores.motivation)
  const empathy = calculateAverage(scores.empathy)
  const socialSkills = calculateAverage(scores.social_skills)

  // Calcular EQ general
  const overallEQ = Math.round(
    (selfAwareness + selfRegulation + motivation + empathy + socialSkills) / 5
  )

  return {
    totalScore: Object.values(answers).reduce((a, b) => a + b, 0),
    selfAwareness,
    selfRegulation,
    motivation,
    empathy,
    socialSkills,
    overallEQ
  }
}

export function getEQInterpretation(category: string, score: number): string {
  const interpretations: { [key: string]: { low: string, medium: string, high: string } } = {
    selfAwareness: {
      low: 'Puedes beneficiarte de practicar mindfulness y llevar un diario emocional para conectar mejor con tus sentimientos.',
      medium: 'Tienes una comprensión decente de tus emociones, con espacio para profundizar en el autoconocimiento.',
      high: 'Excelente autoconciencia emocional. Reconoces y comprendes tus emociones con claridad.'
    },
    selfRegulation: {
      low: 'Trabajar en técnicas de manejo emocional como la respiración profunda o la meditación puede ayudarte.',
      medium: 'Manejas tus emociones razonablemente bien, aunque hay situaciones que te resultan desafiantes.',
      high: 'Tienes un excelente control emocional. Manejas el estrés y regulas tus emociones efectivamente.'
    },
    motivation: {
      low: 'Encuentra formas de conectar tus tareas con tus valores personales para aumentar la motivación intrínseca.',
      medium: 'Tu motivación varía según la situación. Trabajar en establecer metas claras puede ayudar.',
      high: 'Altamente motivado/a y perseverante. Tu impulso interno te ayuda a superar obstáculos.'
    },
    empathy: {
      low: 'Practica la escucha activa y trata de ver situaciones desde la perspectiva de otros.',
      medium: 'Comprendes las emociones de otros de manera adecuada en la mayoría de situaciones.',
      high: 'Altamente empático/a. Conectas profundamente con las emociones y experiencias de otros.'
    },
    socialSkills: {
      low: 'Trabajar en habilidades de comunicación y resolución de conflictos puede mejorar tus relaciones.',
      medium: 'Manejas las interacciones sociales razonablemente bien, con margen para perfeccionar.',
      high: 'Excelentes habilidades sociales. Construyes relaciones positivas y manejas conflictos efectivamente.'
    }
  }

  const levels = interpretations[category]
  if (!levels) return ''

  if (score < 40) return levels.low
  if (score < 65) return levels.medium
  return levels.high
}

export function getOverallEQLevel(score: number): {
  title: string
  description: string
  color: string
} {
  if (score < 40) {
    return {
      title: 'Inteligencia Emocional en Desarrollo',
      description: 'Hay un gran potencial de crecimiento en tu inteligencia emocional. Considera practicar mindfulness, terapia o coaching emocional.',
      color: 'from-blue-500 to-blue-600'
    }
  } else if (score < 55) {
    return {
      title: 'Inteligencia Emocional Media-Baja',
      description: 'Tienes una base de habilidades emocionales con áreas específicas que podrías desarrollar más.',
      color: 'from-cyan-500 to-cyan-600'
    }
  } else if (score < 70) {
    return {
      title: 'Inteligencia Emocional Media-Alta',
      description: 'Tienes buenas habilidades emocionales. Con práctica continua, puedes alcanzar niveles excepcionales.',
      color: 'from-green-500 to-green-600'
    }
  } else if (score < 85) {
    return {
      title: 'Inteligencia Emocional Alta',
      description: 'Excelentes habilidades emocionales. Manejas tus emociones y relaciones de manera muy efectiva.',
      color: 'from-emerald-500 to-emerald-600'
    }
  } else {
    return {
      title: 'Inteligencia Emocional Excepcional',
      description: 'Nivel sobresaliente de inteligencia emocional. Eres un modelo en el manejo de emociones y relaciones.',
      color: 'from-purple-500 to-purple-600'
    }
  }
}

