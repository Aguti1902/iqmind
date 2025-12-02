export interface ADHDQuestion {
  id: number
  text: string
  category: 'inattention' | 'hyperactivity'
}

export const adhdQuestions: ADHDQuestion[] = [
  // Inatención (9 preguntas)
  {
    id: 1,
    text: 'Me cuesta prestar atención a los detalles o cometo errores por descuido en el trabajo o en otras actividades',
    category: 'inattention'
  },
  {
    id: 2,
    text: 'Tengo dificultades para mantener la atención en tareas o actividades',
    category: 'inattention'
  },
  {
    id: 3,
    text: 'Parece que no escucho cuando me hablan directamente',
    category: 'inattention'
  },
  {
    id: 4,
    text: 'No sigo instrucciones y no termino las tareas',
    category: 'inattention'
  },
  {
    id: 5,
    text: 'Tengo dificultades para organizar tareas y actividades',
    category: 'inattention'
  },
  {
    id: 6,
    text: 'Evito, me disgusta o soy reacio a dedicarme a tareas que requieren un esfuerzo mental sostenido',
    category: 'inattention'
  },
  {
    id: 7,
    text: 'Pierdo objetos necesarios para tareas o actividades (llaves, papeles, celular, etc.)',
    category: 'inattention'
  },
  {
    id: 8,
    text: 'Me distraigo fácilmente con estímulos externos',
    category: 'inattention'
  },
  {
    id: 9,
    text: 'Soy olvidadizo en las actividades diarias',
    category: 'inattention'
  },

  // Hiperactividad/Impulsividad (9 preguntas)
  {
    id: 10,
    text: 'Jugueteo con las manos o los pies, o me muevo en el asiento',
    category: 'hyperactivity'
  },
  {
    id: 11,
    text: 'Me levanto en situaciones en las que se espera que permanezca sentado',
    category: 'hyperactivity'
  },
  {
    id: 12,
    text: 'Siento inquietud o necesidad de estar en constante movimiento',
    category: 'hyperactivity'
  },
  {
    id: 13,
    text: 'Tengo dificultad para participar tranquilamente en actividades de ocio',
    category: 'hyperactivity'
  },
  {
    id: 14,
    text: 'Actúo como si estuviera "motorizado" o "como si tuviera un motor"',
    category: 'hyperactivity'
  },
  {
    id: 15,
    text: 'Hablo excesivamente',
    category: 'hyperactivity'
  },
  {
    id: 16,
    text: 'Respondo antes de que terminen de hacerme una pregunta',
    category: 'hyperactivity'
  },
  {
    id: 17,
    text: 'Tengo dificultad para esperar mi turno',
    category: 'hyperactivity'
  },
  {
    id: 18,
    text: 'Interrumpo o me entrometo en las actividades de otros',
    category: 'hyperactivity'
  }
]

export interface ADHDResult {
  totalScore: number
  inattentionScore: number
  hyperactivityScore: number
  riskLevel: 'low' | 'moderate' | 'high'
  category: 'none' | 'predominantly_inattentive' | 'predominantly_hyperactive' | 'combined'
}

export function calculateADHDScores(answers: { [key: number]: number }): ADHDResult {
  let inattentionScore = 0
  let hyperactivityScore = 0

  adhdQuestions.forEach(question => {
    const answer = answers[question.id]
    if (answer !== undefined) {
      if (question.category === 'inattention') {
        inattentionScore += answer
      } else {
        hyperactivityScore += answer
      }
    }
  })

  const totalScore = inattentionScore + hyperactivityScore
  const maxScore = 18 * 4 // 18 preguntas x 4 puntos máximo cada una

  // Determinar nivel de riesgo basado en puntuación total
  let riskLevel: 'low' | 'moderate' | 'high'
  const percentage = (totalScore / maxScore) * 100

  if (percentage < 33) {
    riskLevel = 'low'
  } else if (percentage < 66) {
    riskLevel = 'moderate'
  } else {
    riskLevel = 'high'
  }

  // Determinar categoría predominante
  let category: 'none' | 'predominantly_inattentive' | 'predominantly_hyperactive' | 'combined'
  const inattentionPercentage = (inattentionScore / (9 * 4)) * 100
  const hyperactivityPercentage = (hyperactivityScore / (9 * 4)) * 100

  if (inattentionPercentage < 40 && hyperactivityPercentage < 40) {
    category = 'none'
  } else if (inattentionPercentage >= 50 && hyperactivityPercentage >= 50) {
    category = 'combined'
  } else if (inattentionPercentage > hyperactivityPercentage) {
    category = 'predominantly_inattentive'
  } else {
    category = 'predominantly_hyperactive'
  }

  return {
    totalScore,
    inattentionScore,
    hyperactivityScore,
    riskLevel,
    category
  }
}

export function getADHDInterpretation(riskLevel: string): {
  title: string
  description: string
  recommendations: string[]
} {
  const interpretations = {
    low: {
      title: 'Riesgo Bajo',
      description: 'Tus respuestas sugieren que no presentas síntomas significativos de TDAH. Experimentas niveles normales de distracción y actividad.',
      recommendations: [
        'Continúa con tus rutinas actuales de organización y productividad',
        'Mantén hábitos saludables de sueño y ejercicio',
        'Practica técnicas de mindfulness para mantener el enfoque'
      ]
    },
    moderate: {
      title: 'Riesgo Moderado',
      description: 'Tus respuestas indican algunos síntomas que podrían estar afectando tu vida diaria. Estos síntomas pueden ser manejables con estrategias adecuadas.',
      recommendations: [
        'Implementa sistemas de organización (listas, alarmas, calendarios)',
        'Divide tareas grandes en pasos más pequeños y manejables',
        'Considera técnicas como Pomodoro para mantener el enfoque',
        'Si los síntomas persisten o empeoran, consulta con un profesional'
      ]
    },
    high: {
      title: 'Riesgo Alto',
      description: 'Tus respuestas sugieren la presencia de varios síntomas significativos que podrían indicar TDAH. Es importante buscar una evaluación profesional.',
      recommendations: [
        'Consulta con un profesional de salud mental para una evaluación completa',
        'Un diagnóstico formal puede abrir acceso a tratamientos efectivos',
        'Mantén un registro de síntomas para compartir con el profesional',
        'No te autodiagnostiques; este test es solo orientativo',
        'Existen tratamientos efectivos disponibles si se confirma el diagnóstico'
      ]
    }
  }

  return interpretations[riskLevel as keyof typeof interpretations]
}

export function getCategoryInterpretation(category: string): string {
  const categories = {
    none: 'No se identifican patrones significativos de TDAH.',
    predominantly_inattentive: 'Predominan los síntomas de inatención (dificultad para concentrarse, organizarse y completar tareas).',
    predominantly_hyperactive: 'Predominan los síntomas de hiperactividad/impulsividad (inquietud, dificultad para quedarse quieto, impulsividad).',
    combined: 'Se presentan tanto síntomas de inatención como de hiperactividad/impulsividad en niveles significativos.'
  }

  return categories[category as keyof typeof categories] || categories.none
}

