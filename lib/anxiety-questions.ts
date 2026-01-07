export interface AnxietyQuestion {
  id: number
  text: string
}

export const anxietyQuestions: AnxietyQuestion[] = [
  // GAD-7 Original
  {
    id: 1,
    text: 'Sentirse nervioso/a, ansioso/a o con los nervios de punta'
  },
  {
    id: 2,
    text: 'No poder parar o controlar la preocupación'
  },
  {
    id: 3,
    text: 'Preocuparse demasiado por diferentes cosas'
  },
  {
    id: 4,
    text: 'Dificultad para relajarse'
  },
  {
    id: 5,
    text: 'Estar tan inquieto/a que es difícil quedarse quieto/a'
  },
  {
    id: 6,
    text: 'Irritarse o enfadarse con facilidad'
  },
  {
    id: 7,
    text: 'Sentir miedo, como si algo terrible fuera a suceder'
  },
  // Preguntas adicionales para evaluación más completa
  {
    id: 8,
    text: 'Tener dificultad para concentrarse debido a la ansiedad'
  },
  {
    id: 9,
    text: 'Experimentar tensión muscular o dolores relacionados con el estrés'
  },
  {
    id: 10,
    text: 'Tener problemas para conciliar o mantener el sueño debido a preocupaciones'
  },
  {
    id: 11,
    text: 'Evitar situaciones sociales o lugares por sentir ansiedad'
  },
  {
    id: 12,
    text: 'Experimentar sudoración excesiva o temblores cuando está ansioso/a'
  },
  {
    id: 13,
    text: 'Sentir que su corazón late rápido o de forma irregular'
  },
  {
    id: 14,
    text: 'Tener pensamientos repetitivos o intrusivos que causan malestar'
  },
  {
    id: 15,
    text: 'Sentir náuseas o malestar estomacal relacionado con la ansiedad'
  },
  {
    id: 16,
    text: 'Necesitar constante seguridad o confirmación de otros'
  },
  {
    id: 17,
    text: 'Sentir mareos o sensación de desmayo en momentos de ansiedad'
  },
  {
    id: 18,
    text: 'Experimentar dificultad para respirar o sensación de ahogo'
  },
  {
    id: 19,
    text: 'Tener cambios en el apetito relacionados con la ansiedad'
  },
  {
    id: 20,
    text: 'Sentir que las preocupaciones interfieren con su trabajo o estudios'
  }
]

export interface AnxietyResult {
  totalScore: number
  severity: 'minimal' | 'mild' | 'moderate' | 'severe'
}

export function calculateAnxietyScore(answers: { [key: number]: number }): AnxietyResult {
  let totalScore = 0

  anxietyQuestions.forEach(question => {
    const answer = answers[question.id]
    if (answer !== undefined) {
      totalScore += answer
    }
  })

  // Determinar severidad según escala GAD-7
  let severity: 'minimal' | 'mild' | 'moderate' | 'severe'
  if (totalScore <= 4) {
    severity = 'minimal'
  } else if (totalScore <= 9) {
    severity = 'mild'
  } else if (totalScore <= 14) {
    severity = 'moderate'
  } else {
    severity = 'severe'
  }

  return {
    totalScore,
    severity
  }
}

export function getAnxietyInterpretation(severity: string): {
  title: string
  description: string
  recommendations: string[]
} {
  const interpretations = {
    minimal: {
      title: 'Ansiedad Mínima',
      description: 'Tus respuestas indican niveles mínimos de ansiedad. Experimentas una cantidad normal de preocupación y nerviosismo que no interfiere con tu vida diaria.',
      recommendations: [
        'Mantén hábitos saludables de sueño, ejercicio y alimentación',
        'Practica técnicas de mindfulness o meditación para el bienestar general',
        'Continúa con actividades que disfrutas y te relajan',
        'Mantén conexiones sociales saludables'
      ]
    },
    mild: {
      title: 'Ansiedad Leve',
      description: 'Experimentas algunos síntomas de ansiedad que ocasionalmente pueden afectar tu bienestar, pero generalmente son manejables.',
      recommendations: [
        'Implementa técnicas de respiración profunda cuando te sientas ansioso/a',
        'Practica ejercicio regular (al menos 30 minutos, 3-4 veces por semana)',
        'Establece rutinas de sueño consistentes',
        'Limita la cafeína y el alcohol',
        'Considera journaling o escribir sobre tus preocupaciones',
        'Si persiste o empeora, consulta con un profesional'
      ]
    },
    moderate: {
      title: 'Ansiedad Moderada',
      description: 'Tus síntomas de ansiedad son significativos y probablemente están afectando tu vida diaria, relaciones o rendimiento laboral/académico.',
      recommendations: [
        'Considera buscar ayuda profesional (psicólogo o psiquiatra)',
        'La terapia cognitivo-conductual (TCC) es muy efectiva para la ansiedad',
        'Practica técnicas de relajación progresiva',
        'Identifica y cuestiona pensamientos ansiosos',
        'Mantén un registro de tus síntomas para compartir con un profesional',
        'Evita la automedicación',
        'El apoyo de amigos y familiares es importante'
      ]
    },
    severe: {
      title: 'Ansiedad Severa',
      description: 'Tus respuestas indican niveles severos de ansiedad que probablemente están interfiriendo significativamente con tu vida diaria. Es importante buscar ayuda profesional.',
      recommendations: [
        'Busca ayuda profesional lo antes posible',
        'Un psiquiatra o psicólogo puede ofrecer tratamiento especializado',
        'La combinación de terapia y medicación puede ser muy efectiva',
        'Considera opciones de tratamiento intensivo si es necesario',
        'Habla con personas de confianza sobre cómo te sientes',
        'Si experimentas pensamientos de autolesión, busca ayuda inmediata',
        'Recuerda: la ansiedad es tratable y puedes mejorar con el apoyo adecuado'
      ]
    }
  }

  return interpretations[severity as keyof typeof interpretations]
}

export function getSeverityColor(severity: string): {
  bg: string
  text: string
  light: string
} {
  const colors = {
    minimal: { bg: 'from-green-500 to-green-600', text: 'text-green-600', light: 'bg-green-50' },
    mild: { bg: 'from-blue-500 to-blue-600', text: 'text-blue-600', light: 'bg-blue-50' },
    moderate: { bg: 'from-yellow-500 to-yellow-600', text: 'text-yellow-600', light: 'bg-yellow-50' },
    severe: { bg: 'from-red-500 to-red-600', text: 'text-red-600', light: 'bg-red-50' }
  }
  return colors[severity as keyof typeof colors] || colors.minimal
}

