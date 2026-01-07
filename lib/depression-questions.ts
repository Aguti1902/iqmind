export interface DepressionQuestion {
  id: number
  text: string
}

export const depressionQuestions: DepressionQuestion[] = [
  // PHQ-9 Original
  {
    id: 1,
    text: 'Poco interés o placer en hacer las cosas'
  },
  {
    id: 2,
    text: 'Sentirse desanimado/a, deprimido/a o sin esperanza'
  },
  {
    id: 3,
    text: 'Dificultad para quedarse o permanecer dormido/a, o dormir demasiado'
  },
  {
    id: 4,
    text: 'Sentirse cansado/a o tener poca energía'
  },
  {
    id: 5,
    text: 'Poco apetito o comer en exceso'
  },
  {
    id: 6,
    text: 'Sentir que eres un fracaso o que has fallado a ti mismo/a o a tu familia'
  },
  {
    id: 7,
    text: 'Dificultad para concentrarse en cosas como leer el periódico o ver televisión'
  },
  {
    id: 8,
    text: 'Moverse o hablar tan lentamente que otras personas lo han notado, o lo contrario: estar tan inquieto/a que te mueves mucho más de lo habitual'
  },
  {
    id: 9,
    text: 'Pensamientos de que estarías mejor muerto/a o de hacerte daño de alguna manera'
  },
  // Preguntas adicionales para evaluación más completa
  {
    id: 10,
    text: 'Sentirse sin esperanza sobre el futuro'
  },
  {
    id: 11,
    text: 'Dificultad para disfrutar actividades que antes te gustaban'
  },
  {
    id: 12,
    text: 'Sentirse aislado/a o desconectado/a de los demás'
  },
  {
    id: 13,
    text: 'Cambios significativos en el peso (pérdida o ganancia)'
  },
  {
    id: 14,
    text: 'Sentir que todo requiere mucho esfuerzo, incluso tareas simples'
  },
  {
    id: 15,
    text: 'Problemas de memoria o dificultad para tomar decisiones'
  },
  {
    id: 16,
    text: 'Sentimientos de culpa excesiva o inapropiada'
  },
  {
    id: 17,
    text: 'Irritabilidad o frustración frecuente, incluso por cosas pequeñas'
  },
  {
    id: 18,
    text: 'Pérdida de interés en relaciones sociales o actividades con amigos'
  },
  {
    id: 19,
    text: 'Sentir que la vida no tiene sentido o propósito'
  },
  {
    id: 20,
    text: 'Experimentar llanto frecuente o ganas de llorar sin razón aparente'
  }
]

export interface DepressionResult {
  totalScore: number
  severity: 'minimal' | 'mild' | 'moderate' | 'moderately_severe' | 'severe'
  needsHelp: boolean
}

export function calculateDepressionScore(answers: { [key: number]: number }): DepressionResult {
  let totalScore = 0

  depressionQuestions.forEach(question => {
    const answer = answers[question.id]
    if (answer !== undefined) {
      totalScore += answer
    }
  })

  // Determinar severidad según escala extendida (20 preguntas, 0-60 puntos)
  let severity: 'minimal' | 'mild' | 'moderate' | 'moderately_severe' | 'severe'
  if (totalScore <= 10) {
    severity = 'minimal'
  } else if (totalScore <= 20) {
    severity = 'mild'
  } else if (totalScore <= 35) {
    severity = 'moderate'
  } else if (totalScore <= 45) {
    severity = 'moderately_severe'
  } else {
    severity = 'severe'
  }

  // Detectar si hay respuesta a la pregunta 9 (pensamientos suicidas)
  const needsHelp = answers[9] !== undefined && answers[9] > 0

  return {
    totalScore,
    severity,
    needsHelp
  }
}

export function getDepressionInterpretation(severity: string): {
  title: string
  description: string
  recommendations: string[]
} {
  const interpretations = {
    minimal: {
      title: 'Depresión Mínima',
      description: 'Tus respuestas indican niveles mínimos de síntomas depresivos. Tu estado de ánimo está en el rango normal.',
      recommendations: [
        'Mantén hábitos saludables: ejercicio regular, sueño adecuado, alimentación balanceada',
        'Cultiva relaciones sociales positivas',
        'Practica actividades que disfrutas',
        'Continúa con técnicas de autocuidado',
        'Si notas cambios en tu estado de ánimo, no dudes en buscar apoyo'
      ]
    },
    mild: {
      title: 'Depresión Leve',
      description: 'Experimentas algunos síntomas depresivos leves que ocasionalmente pueden afectar tu bienestar. Es importante monitorear estos síntomas.',
      recommendations: [
        'Establece una rutina diaria estructurada',
        'Practica ejercicio físico regular (30 min al día)',
        'Mantén contacto con amigos y familiares',
        'Considera técnicas de mindfulness o meditación',
        'Dedica tiempo a hobbies y actividades placenteras',
        'Si los síntomas persisten más de 2 semanas, consulta con un profesional'
      ]
    },
    moderate: {
      title: 'Depresión Moderada',
      description: 'Tus síntomas depresivos son significativos y probablemente están afectando tu vida diaria. Se recomienda buscar ayuda profesional.',
      recommendations: [
        'Consulta con un profesional de salud mental (psicólogo o psiquiatra)',
        'La terapia cognitivo-conductual es efectiva para la depresión',
        'Evita el aislamiento social, aunque sea difícil',
        'Establece metas pequeñas y alcanzables cada día',
        'No te automediques',
        'Habla con personas de confianza sobre cómo te sientes',
        'Considera un chequeo médico para descartar causas físicas'
      ]
    },
    moderately_severe: {
      title: 'Depresión Moderadamente Severa',
      description: 'Experimentas síntomas depresivos graves que están interfiriendo significativamente con tu funcionamiento diario. Es importante buscar ayuda profesional inmediatamente.',
      recommendations: [
        'Busca ayuda profesional lo antes posible',
        'Un psiquiatra puede evaluar si la medicación es apropiada',
        'La combinación de terapia y medicación suele ser muy efectiva',
        'Informa a familiares cercanos sobre tu situación',
        'Evita tomar decisiones importantes mientras te sientes así',
        'Si tienes pensamientos de autolesión, busca ayuda de emergencia',
        'Recuerda: la depresión es tratable y puedes mejorar'
      ]
    },
    severe: {
      title: 'Depresión Severa',
      description: 'Tus respuestas indican depresión severa. Esta es una situación seria que requiere atención profesional inmediata.',
      recommendations: [
        '⚠️ URGENTE: Busca ayuda profesional inmediatamente',
        'Contacta con servicios de emergencia si tienes pensamientos de hacerte daño',
        'No estés solo/a: informa a alguien de confianza',
        'Un psiquiatra debe evaluar tu situación',
        'Puede ser necesario tratamiento intensivo o hospitalización',
        'La depresión severa es altamente tratable con el apoyo adecuado',
        'Línea de Crisis 024 (España) - Disponible 24/7',
        'Teléfono de la Esperanza: 717 003 717'
      ]
    }
  }

  return interpretations[severity as keyof typeof interpretations]
}

export function getSeverityColor(severity: string): {
  bg: string
  text: string
  light: string
  border: string
} {
  const colors = {
    minimal: { 
      bg: 'from-green-500 to-green-600', 
      text: 'text-green-600', 
      light: 'bg-green-50',
      border: 'border-green-500'
    },
    mild: { 
      bg: 'from-blue-500 to-blue-600', 
      text: 'text-blue-600', 
      light: 'bg-blue-50',
      border: 'border-blue-500'
    },
    moderate: { 
      bg: 'from-yellow-500 to-yellow-600', 
      text: 'text-yellow-600', 
      light: 'bg-yellow-50',
      border: 'border-yellow-500'
    },
    moderately_severe: { 
      bg: 'from-orange-500 to-orange-600', 
      text: 'text-orange-600', 
      light: 'bg-orange-50',
      border: 'border-orange-500'
    },
    severe: { 
      bg: 'from-red-500 to-red-600', 
      text: 'text-red-600', 
      light: 'bg-red-50',
      border: 'border-red-500'
    }
  }
  return colors[severity as keyof typeof colors] || colors.minimal
}

