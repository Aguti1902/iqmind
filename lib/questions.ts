export interface Question {
  id: number
  type: 'pattern' | 'logic' | 'sequence'
  difficulty: 'easy' | 'medium' | 'hard'
  question: string
  pattern: string[][] // Matriz 3x3 con los patrones visuales
  options: string[][] // 6 opciones, cada una es una matriz 2x2 o el elemento faltante
  correctAnswer: number
}

// 20 preguntas de matrices visuales tipo Raven - VERSIÓN DIFÍCIL
export const questions: Question[] = [
  // FÁCILES (1-5) - Introducción progresiva
  {
    id: 1,
    type: 'pattern',
    difficulty: 'easy',
    question: '¿Qué figura completa el patrón?',
    pattern: [
      ['●', '●●', '●●●'],
      ['○', '○○', '○○○'],
      ['▲', '▲▲', '?']
    ],
    options: [
      ['▲▲▲'],
      ['▲▲'],
      ['▲'],
      ['○○○'],
      ['●●●'],
      ['']
    ],
    correctAnswer: 0
  },
  {
    id: 2,
    type: 'pattern',
    difficulty: 'easy',
    question: '¿Qué figura completa el patrón?',
    pattern: [
      ['◐', '◑', '◐'],
      ['◑', '◐', '◑'],
      ['◐', '◑', '?']
    ],
    options: [
      ['◐'],
      ['◑'],
      ['●'],
      ['○'],
      ['◉'],
      ['⊙']
    ],
    correctAnswer: 0
  },
  {
    id: 3,
    type: 'pattern',
    difficulty: 'easy',
    question: '¿Qué figura completa el patrón?',
    pattern: [
      ['△', '▽', '△'],
      ['▽', '△', '▽'],
      ['△', '▽', '?']
    ],
    options: [
      ['△'],
      ['▽'],
      ['◁'],
      ['▷'],
      [''],
      ['△▽']
    ],
    correctAnswer: 0
  },
  {
    id: 4,
    type: 'pattern',
    difficulty: 'easy',
    question: '¿Qué figura completa el patrón?',
    pattern: [
      ['/', '\\', 'X'],
      ['/', '\\', 'X'],
      ['/', '\\', '?']
    ],
    options: [
      ['X'],
      ['/'],
      ['\\'],
      ['+'],
      ['—'],
      ['|']
    ],
    correctAnswer: 0
  },
  {
    id: 5,
    type: 'pattern',
    difficulty: 'easy',
    question: '¿Qué figura completa el patrón?',
    pattern: [
      ['■', '□', '■'],
      ['□', '■', '□'],
      ['■', '□', '?']
    ],
    options: [
      ['■'],
      ['□'],
      ['▣'],
      ['▢'],
      [''],
      ['■□']
    ],
    correctAnswer: 0
  },

  // MEDIAS (6-12) - Requieren pensar en múltiples dimensiones
  {
    id: 6,
    type: 'pattern',
    difficulty: 'medium',
    question: '¿Qué figura completa el patrón?',
    pattern: [
      ['●', '●●', '●●●'],
      ['▲', '▲▲', '▲▲▲'],
      ['■', '■■', '?']
    ],
    options: [
      ['■■■'],
      ['■■'],
      ['■'],
      ['●●●'],
      ['▲▲▲'],
      ['■■■■']
    ],
    correctAnswer: 0
  },
  {
    id: 7,
    type: 'pattern',
    difficulty: 'medium',
    question: '¿Qué figura completa el patrón?',
    pattern: [
      ['◐○', '○◐', '◐○'],
      ['○◐', '◐○', '○◐'],
      ['◐○', '○◐', '?']
    ],
    options: [
      ['◐○'],
      ['○◐'],
      ['○○'],
      ['◐◐'],
      [''],
      ['●○']
    ],
    correctAnswer: 0
  },
  {
    id: 8,
    type: 'pattern',
    difficulty: 'medium',
    question: '¿Qué figura completa el patrón?',
    pattern: [
      ['/', '—', '\\'],
      ['|', 'X', '|'],
      ['\\', '—', '?']
    ],
    options: [
      ['/'],
      ['\\'],
      ['—'],
      ['|'],
      ['X'],
      ['+']
    ],
    correctAnswer: 0
  },
  {
    id: 9,
    type: 'pattern',
    difficulty: 'medium',
    question: '¿Qué figura completa el patrón?',
    pattern: [
      ['△', '△▽', '△▽△'],
      ['○', '○●', '○●○'],
      ['□', '□■', '?']
    ],
    options: [
      ['□■□'],
      ['□■'],
      ['■□■'],
      ['□□'],
      ['■■'],
      ['']
    ],
    correctAnswer: 0
  },
  {
    id: 10,
    type: 'pattern',
    difficulty: 'medium',
    question: '¿Qué figura completa el patrón?',
    pattern: [
      ['●', '○', '●○'],
      ['▲', '▽', '▲▽'],
      ['■', '□', '?']
    ],
    options: [
      ['■□'],
      ['□■'],
      ['■■'],
      ['□□'],
      [''],
      ['●○']
    ],
    correctAnswer: 0
  },
  {
    id: 11,
    type: 'pattern',
    difficulty: 'medium',
    question: '¿Qué figura completa el patrón?',
    pattern: [
      ['◐', '◑', '◉'],
      ['◑', '◉', '◐'],
      ['◉', '◐', '?']
    ],
    options: [
      ['◑'],
      ['◐'],
      ['◉'],
      ['○'],
      ['●'],
      ['⊙']
    ],
    correctAnswer: 0
  },
  {
    id: 12,
    type: 'pattern',
    difficulty: 'medium',
    question: '¿Qué figura completa el patrón?',
    pattern: [
      ['/', '//', '///'],
      ['\\', '\\\\', '\\\\\\'],
      ['|', '||', '?']
    ],
    options: [
      ['|||'],
      ['||'],
      ['|'],
      ['||||'],
      ['/'],
      ['\\']
    ],
    correctAnswer: 0
  },

  // DIFÍCILES (13-20) - Requieren análisis profundo y múltiples transformaciones
  {
    id: 13,
    type: 'pattern',
    difficulty: 'hard',
    question: '¿Qué figura completa el patrón?',
    pattern: [
      ['●○', '○●', '●●'],
      ['○●', '●●', '○○'],
      ['●●', '○○', '?']
    ],
    options: [
      ['●○'],
      ['○●'],
      ['●●'],
      ['○○'],
      [''],
      ['●']
    ],
    correctAnswer: 0
  },
  {
    id: 14,
    type: 'pattern',
    difficulty: 'hard',
    question: '¿Qué figura completa el patrón?',
    pattern: [
      ['△', '△▽', '▽'],
      ['▽', '△▽', '△'],
      ['△', '▽△', '?']
    ],
    options: [
      ['▽'],
      ['△'],
      ['△▽'],
      ['▽△'],
      [''],
      ['△△']
    ],
    correctAnswer: 0
  },
  {
    id: 15,
    type: 'pattern',
    difficulty: 'hard',
    question: '¿Qué figura completa el patrón?',
    pattern: [
      ['/', '\\', '|'],
      ['\\', '|', '/'],
      ['|', '/', '?']
    ],
    options: [
      ['\\'],
      ['/'],
      ['|'],
      ['X'],
      ['—'],
      ['+']
    ],
    correctAnswer: 0
  },
  {
    id: 16,
    type: 'pattern',
    difficulty: 'hard',
    question: '¿Qué figura completa el patrón?',
    pattern: [
      ['●○', '○●', '●○'],
      ['○●', '●○', '○●'],
      ['●○', '○●', '?']
    ],
    options: [
      ['●○'],
      ['○●'],
      ['●●'],
      ['○○'],
      [''],
      ['●']
    ],
    correctAnswer: 0
  },
  {
    id: 17,
    type: 'pattern',
    difficulty: 'hard',
    question: '¿Qué figura completa el patrón?',
    pattern: [
      ['■□', '□■', '■□'],
      ['□■', '■□', '□■'],
      ['■□', '□■', '?']
    ],
    options: [
      ['■□'],
      ['□■'],
      ['■■'],
      ['□□'],
      [''],
      ['▣']
    ],
    correctAnswer: 0
  },
  {
    id: 18,
    type: 'pattern',
    difficulty: 'hard',
    question: '¿Qué figura completa el patrón?',
    pattern: [
      ['◐◑', '◑◐', '◐◑'],
      ['◑◐', '◐◑', '◑◐'],
      ['◐◑', '◑◐', '?']
    ],
    options: [
      ['◐◑'],
      ['◑◐'],
      ['◐◐'],
      ['◑◑'],
      ['○●'],
      ['●○']
    ],
    correctAnswer: 0
  },
  {
    id: 19,
    type: 'pattern',
    difficulty: 'hard',
    question: '¿Qué figura completa el patrón?',
    pattern: [
      ['/', '—', '\\'],
      ['|', 'X', '|'],
      ['\\', '—', '?']
    ],
    options: [
      ['/'],
      ['\\'],
      ['|'],
      ['—'],
      ['X'],
      ['+']
    ],
    correctAnswer: 0
  },
  {
    id: 20,
    type: 'pattern',
    difficulty: 'hard',
    question: '¿Qué figura completa el patrón?',
    pattern: [
      ['△▽△', '▽△▽', '△▽△'],
      ['▽△▽', '△▽△', '▽△▽'],
      ['△▽△', '▽△▽', '?']
    ],
    options: [
      ['△▽△'],
      ['▽△▽'],
      ['△△△'],
      ['▽▽▽'],
      [''],
      ['△▽']
    ],
    correctAnswer: 0
  }
]

// Función para calcular el IQ basado en respuestas correctas (20 preguntas)
// Ajustado para test más difícil - puntuaciones más generosas
export function calculateIQ(correctAnswers: number): number {
  // Sistema de puntuación ajustado para test difícil: 
  // 0-4 correctas: 75-89 (por debajo del promedio)
  // 5-8 correctas: 90-99 (promedio bajo)
  // 9-12 correctas: 100-109 (promedio)
  // 13-15 correctas: 110-119 (por encima del promedio)
  // 16-17 correctas: 120-129 (superior)
  // 18 correctas: 130-139 (muy superior)
  // 19-20 correctas: 140+ (genio)
  
  if (correctAnswers <= 4) return 75 + correctAnswers * 3.5
  if (correctAnswers <= 8) return 90 + (correctAnswers - 4) * 2.5
  if (correctAnswers <= 12) return 100 + (correctAnswers - 8) * 2.5
  if (correctAnswers <= 15) return 110 + (correctAnswers - 12) * 3
  if (correctAnswers <= 17) return 120 + (correctAnswers - 15) * 5
  if (correctAnswers === 18) return 135
  if (correctAnswers === 19) return 142
  return 150
}

export function getIQCategory(iq: number): string {
  if (iq < 70) return 'Muy bajo'
  if (iq < 85) return 'Bajo'
  if (iq < 100) return 'Por debajo del promedio'
  if (iq < 115) return 'Promedio'
  if (iq < 130) return 'Por encima del promedio'
  if (iq < 145) return 'Superior'
  return 'Muy superior'
}

export function getIQDescription(iq: number): string {
  if (iq < 70) return 'Tu puntuación indica dificultades significativas en el razonamiento abstracto.'
  if (iq < 85) return 'Tu puntuación está por debajo del promedio pero con margen de mejora.'
  if (iq < 100) return 'Tu capacidad de razonamiento está ligeramente por debajo del promedio poblacional.'
  if (iq < 115) return 'Tienes una inteligencia dentro del rango promedio, como la mayoría de la población.'
  if (iq < 130) return 'Tu inteligencia está por encima del promedio. Tienes excelentes capacidades de razonamiento.'
  if (iq < 145) return 'Posees una inteligencia superior. Tu capacidad de análisis está muy por encima del promedio.'
  return 'Tu puntuación indica un nivel de inteligencia excepcional, en el rango de genio.'
}
