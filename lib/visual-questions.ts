export interface VisualCell {
  type: 'number' | 'shape' | 'pattern' | 'arrow' | 'card' | 'grid' | 'empty'
  content?: string | number
  fillColor?: string
  strokeColor?: string
  backgroundColor?: string
  rotation?: number
  nested?: boolean
  innerShape?: string
  direction?: 'up' | 'down' | 'left' | 'right'
  count?: number
}

export interface VisualQuestion {
  id: number
  type: 'sequence' | 'pattern' | 'logic'
  difficulty: 'easy' | 'medium' | 'hard'
  question: string
  matrix: VisualCell[][]
  options: VisualCell[]
  correctAnswer: number
}

export const visualQuestions: VisualQuestion[] = [
  // PREGUNTA 1 - FÁCIL: Secuencia numérica +10
  {
    id: 1,
    type: 'sequence',
    difficulty: 'easy',
    question: 'Completa la secuencia',
    matrix: [
      [
        { type: 'number', content: 2, backgroundColor: '#F0F9F9' },
        { type: 'number', content: 12, backgroundColor: '#FFFFFF' },
        { type: 'number', content: 22, backgroundColor: '#F0F9F9' }
      ],
      [
        { type: 'number', content: 32, backgroundColor: '#FFFFFF' },
        { type: 'number', content: 42, backgroundColor: '#F0F9F9' },
        { type: 'number', content: 52, backgroundColor: '#FFFFFF' }
      ],
      [
        { type: 'number', content: 62, backgroundColor: '#F0F9F9' },
        { type: 'number', content: 72, backgroundColor: '#FFFFFF' },
        { type: 'empty', backgroundColor: '#F0F9F9' }
      ]
    ],
    options: [
      { type: 'number', content: 32 },
      { type: 'number', content: 83 },
      { type: 'number', content: 82 },
      { type: 'number', content: 70 },
      { type: 'number', content: 52 },
      { type: 'number', content: 92 }
    ],
    correctAnswer: 2 // 82
  },

  // PREGUNTA 2 - FÁCIL: Rotación de área rellena en cuadrado
  {
    id: 2,
    type: 'pattern',
    difficulty: 'easy',
    question: 'Completa la secuencia',
    matrix: [
      [
        { type: 'pattern', content: 'top-left-triangle', backgroundColor: '#F0F9F9' },
        { type: 'pattern', content: 'top-right-half', backgroundColor: '#FFFFFF' },
        { type: 'pattern', content: 'bottom-right-diagonal', backgroundColor: '#F0F9F9' }
      ],
      [
        { type: 'pattern', content: 'bottom-left-triangle', backgroundColor: '#FFFFFF' },
        { type: 'pattern', content: 'bottom-half', backgroundColor: '#F0F9F9' },
        { type: 'pattern', content: 'right-triangle', backgroundColor: '#FFFFFF' }
      ],
      [
        { type: 'pattern', content: 'top-half', backgroundColor: '#F0F9F9' },
        { type: 'pattern', content: 'full-square', backgroundColor: '#FFFFFF' },
        { type: 'empty', backgroundColor: '#F0F9F9' }
      ]
    ],
    options: [
      { type: 'pattern', content: 'full-square' },
      { type: 'pattern', content: 'right-half' },
      { type: 'pattern', content: 'bottom-right-diagonal' },
      { type: 'pattern', content: 'center-square' },
      { type: 'pattern', content: 'left-half' },
      { type: 'pattern', content: 'full-square-red' }
    ],
    correctAnswer: 1 // right-half
  },

  // PREGUNTA 3 - FÁCIL: Formas básicas con relleno/borde
  {
    id: 3,
    type: 'pattern',
    difficulty: 'easy',
    question: 'Completa la secuencia',
    matrix: [
      [
        { type: 'shape', content: 'square', strokeColor: '#031C43', backgroundColor: '#F0F9F9' },
        { type: 'shape', content: 'square', fillColor: '#031C43', strokeColor: '#218B8E', backgroundColor: '#FFFFFF' },
        { type: 'shape', content: 'square', strokeColor: '#031C43', backgroundColor: '#F0F9F9' }
      ],
      [
        { type: 'shape', content: 'circle', strokeColor: '#031C43', backgroundColor: '#FFFFFF' },
        { type: 'shape', content: 'circle', fillColor: '#031C43', backgroundColor: '#F0F9F9' },
        { type: 'shape', content: 'circle', strokeColor: '#031C43', nested: true, innerShape: 'circle', backgroundColor: '#FFFFFF' }
      ],
      [
        { type: 'shape', content: 'square', strokeColor: '#031C43', backgroundColor: '#F0F9F9' },
        { type: 'shape', content: 'square', fillColor: '#031C43', backgroundColor: '#FFFFFF' },
        { type: 'empty', backgroundColor: '#F0F9F9' }
      ]
    ],
    options: [
      { type: 'shape', content: 'square', strokeColor: '#031C43' },
      { type: 'shape', content: 'square', fillColor: '#218B8E' },
      { type: 'shape', content: 'square', strokeColor: '#218B8E' },
      { type: 'shape', content: 'square', fillColor: '#031C43', strokeColor: '#218B8E' },
      { type: 'shape', content: 'circle', strokeColor: '#031C43' },
      { type: 'shape', content: 'triangle', fillColor: '#218B8E' }
    ],
    correctAnswer: 0 // square con solo borde
  },

  // PREGUNTA 4 - FÁCIL: Palos de cartas - patrón de alternancia
  {
    id: 4,
    type: 'pattern',
    difficulty: 'easy',
    question: 'Completa la secuencia',
    matrix: [
      [
        { type: 'card', content: 'diamond', fillColor: '#218B8E', backgroundColor: '#F0F9F9' },
        { type: 'card', content: 'heart', fillColor: '#218B8E', backgroundColor: '#FFFFFF' },
        { type: 'card', content: 'club', fillColor: '#218B8E', backgroundColor: '#F0F9F9' }
      ],
      [
        { type: 'card', content: 'diamond', strokeColor: '#031C43', backgroundColor: '#FFFFFF' },
        { type: 'card', content: 'heart', strokeColor: '#031C43', backgroundColor: '#F0F9F9' },
        { type: 'card', content: 'club', strokeColor: '#031C43', backgroundColor: '#FFFFFF' }
      ],
      [
        { type: 'card', content: 'diamond', fillColor: '#218B8E', backgroundColor: '#F0F9F9' },
        { type: 'empty', backgroundColor: '#FFFFFF' },
        { type: 'card', content: 'club', fillColor: '#218B8E', backgroundColor: '#F0F9F9' }
      ]
    ],
    options: [
      { type: 'card', content: 'heart', strokeColor: '#031C43' },
      { type: 'card', content: 'diamond', fillColor: '#218B8E' },
      { type: 'card', content: 'club', fillColor: '#218B8E' },
      { type: 'card', content: 'heart', fillColor: '#218B8E' },
      { type: 'card', content: 'club', strokeColor: '#031C43' },
      { type: 'card', content: 'heart', fillColor: '#031C43' }
    ],
    correctAnswer: 3 // heart relleno verde
  },

  // PREGUNTA 5 - MEDIA: Grid con posiciones en secuencia
  {
    id: 5,
    type: 'pattern',
    difficulty: 'medium',
    question: 'Completa la secuencia',
    matrix: [
      [
        { type: 'grid', content: 'top-left', backgroundColor: '#F0F9F9' },
        { type: 'grid', content: 'top-center', backgroundColor: '#FFFFFF' },
        { type: 'grid', content: 'top-right', backgroundColor: '#F0F9F9' }
      ],
      [
        { type: 'grid', content: 'center-left', backgroundColor: '#FFFFFF' },
        { type: 'grid', content: 'center', backgroundColor: '#F0F9F9' },
        { type: 'grid', content: 'center-right', backgroundColor: '#FFFFFF' }
      ],
      [
        { type: 'grid', content: 'bottom-left', backgroundColor: '#F0F9F9' },
        { type: 'grid', content: 'bottom-center', backgroundColor: '#FFFFFF' },
        { type: 'empty', backgroundColor: '#F0F9F9' }
      ]
    ],
    options: [
      { type: 'grid', content: 'center' },
      { type: 'grid', content: 'bottom-right' },
      { type: 'grid', content: 'center-right' },
      { type: 'grid', content: 'top-center' },
      { type: 'grid', content: 'center-left' },
      { type: 'grid', content: 'cross' }
    ],
    correctAnswer: 1 // bottom-right
  },

  // PREGUNTA 6 - MEDIA: Formas anidadas - triángulos con círculos y hexágonos
  {
    id: 6,
    type: 'pattern',
    difficulty: 'medium',
    question: 'Completa la secuencia',
    matrix: [
      [
        { type: 'shape', content: 'triangle', fillColor: '#031C43', nested: true, innerShape: 'triangle', backgroundColor: '#F0F9F9' },
        { type: 'shape', content: 'triangle', fillColor: '#031C43', backgroundColor: '#FFFFFF' },
        { type: 'shape', content: 'triangle', strokeColor: '#031C43', nested: true, innerShape: 'triangle', backgroundColor: '#F0F9F9' }
      ],
      [
        { type: 'shape', content: 'circle', fillColor: '#031C43', nested: true, innerShape: 'circle', backgroundColor: '#FFFFFF' },
        { type: 'shape', content: 'circle', fillColor: '#031C43', backgroundColor: '#F0F9F9' },
        { type: 'shape', content: 'circle', strokeColor: '#031C43', nested: true, innerShape: 'circle', backgroundColor: '#FFFFFF' }
      ],
      [
        { type: 'shape', content: 'hexagon', fillColor: '#031C43', nested: true, innerShape: 'hexagon', backgroundColor: '#F0F9F9' },
        { type: 'shape', content: 'hexagon', fillColor: '#031C43', backgroundColor: '#FFFFFF' },
        { type: 'empty', backgroundColor: '#F0F9F9' }
      ]
    ],
    options: [
      { type: 'shape', content: 'hexagon', strokeColor: '#031C43', nested: true, innerShape: 'hexagon' },
      { type: 'shape', content: 'hexagon', fillColor: '#218B8E' },
      { type: 'shape', content: 'circle', strokeColor: '#031C43' },
      { type: 'shape', content: 'hexagon', fillColor: '#031C43', nested: true },
      { type: 'shape', content: 'triangle', fillColor: '#031C43' },
      { type: 'shape', content: 'hexagon', fillColor: '#218B8E', nested: true }
    ],
    correctAnswer: 0 // hexágono con borde y hexágono interior
  },

  // PREGUNTA 7 - MEDIA: Flechas direccionales simples
  {
    id: 7,
    type: 'pattern',
    difficulty: 'medium',
    question: 'Completa la secuencia',
    matrix: [
      [
        { type: 'arrow', direction: 'left', count: 1, backgroundColor: '#F0F9F9' },
        { type: 'arrow', direction: 'down', count: 1, backgroundColor: '#FFFFFF' },
        { type: 'arrow', direction: 'right', count: 1, backgroundColor: '#F0F9F9' }
      ],
      [
        { type: 'arrow', direction: 'down', count: 2, backgroundColor: '#FFFFFF' },
        { type: 'arrow', direction: 'right', count: 2, backgroundColor: '#F0F9F9' },
        { type: 'arrow', direction: 'left', count: 2, backgroundColor: '#FFFFFF' }
      ],
      [
        { type: 'arrow', direction: 'right', count: 3, backgroundColor: '#F0F9F9' },
        { type: 'arrow', direction: 'left', count: 3, backgroundColor: '#FFFFFF' },
        { type: 'empty', backgroundColor: '#F0F9F9' }
      ]
    ],
    options: [
      { type: 'arrow', direction: 'up', count: 1 },
      { type: 'arrow', direction: 'up', count: 3 },
      { type: 'arrow', direction: 'left', count: 3 },
      { type: 'arrow', direction: 'down', count: 3 },
      { type: 'arrow', direction: 'right', count: 3 },
      { type: 'arrow', direction: 'down', count: 2 }
    ],
    correctAnswer: 3 // 3 flechas abajo
  },

  // PREGUNTA 8 - MEDIA: Círculos con múltiples triángulos alternando
  {
    id: 8,
    type: 'pattern',
    difficulty: 'medium',
    question: 'Completa la secuencia',
    matrix: [
      [
        { type: 'shape', content: 'circle', fillColor: '#031C43', backgroundColor: '#F0F9F9' },
        { type: 'shape', content: 'triangle', fillColor: '#218B8E', backgroundColor: '#FFFFFF' },
        { type: 'shape', content: 'circle', strokeColor: '#031C43', backgroundColor: '#F0F9F9' }
      ],
      [
        { type: 'shape', content: 'triangle', strokeColor: '#031C43', backgroundColor: '#FFFFFF' },
        { type: 'shape', content: 'circle', fillColor: '#218B8E', backgroundColor: '#F0F9F9' },
        { type: 'shape', content: 'triangle', fillColor: '#031C43', backgroundColor: '#FFFFFF' }
      ],
      [
        { type: 'shape', content: 'circle', strokeColor: '#218B8E', backgroundColor: '#F0F9F9' },
        { type: 'shape', content: 'triangle', fillColor: '#218B8E', backgroundColor: '#FFFFFF' },
        { type: 'empty', backgroundColor: '#F0F9F9' }
      ]
    ],
    options: [
      { type: 'shape', content: 'circle', fillColor: '#218B8E' },
      { type: 'shape', content: 'triangle', strokeColor: '#031C43' },
      { type: 'shape', content: 'circle', strokeColor: '#031C43' },
      { type: 'shape', content: 'triangle', fillColor: '#218B8E' },
      { type: 'shape', content: 'circle', fillColor: '#031C43' },
      { type: 'shape', content: 'square', fillColor: '#218B8E' }
    ],
    correctAnswer: 2 // círculo con borde azul oscuro
  },

  // PREGUNTA 9 - MEDIA: Secuencia numérica con multiplicación
  {
    id: 9,
    type: 'sequence',
    difficulty: 'medium',
    question: 'Completa la secuencia',
    matrix: [
      [
        { type: 'number', content: 3, backgroundColor: '#F0F9F9' },
        { type: 'number', content: 6, backgroundColor: '#FFFFFF' },
        { type: 'number', content: 12, backgroundColor: '#F0F9F9' }
      ],
      [
        { type: 'number', content: 24, backgroundColor: '#FFFFFF' },
        { type: 'number', content: 48, backgroundColor: '#F0F9F9' },
        { type: 'number', content: 96, backgroundColor: '#FFFFFF' }
      ],
      [
        { type: 'number', content: 192, backgroundColor: '#F0F9F9' },
        { type: 'number', content: 384, backgroundColor: '#FFFFFF' },
        { type: 'empty', backgroundColor: '#F0F9F9' }
      ]
    ],
    options: [
      { type: 'number', content: 576 },
      { type: 'number', content: 678 },
      { type: 'number', content: 768 },
      { type: 'number', content: 486 },
      { type: 'number', content: 864 },
      { type: 'number', content: 512 }
    ],
    correctAnswer: 2 // 768 (x2)
  },

  // PREGUNTA 10 - MEDIA: Cuadrados con diferentes rellenos en diagonal
  {
    id: 10,
    type: 'pattern',
    difficulty: 'medium',
    question: 'Completa la secuencia',
    matrix: [
      [
        { type: 'shape', content: 'square', fillColor: '#031C43', backgroundColor: '#F0F9F9' },
        { type: 'shape', content: 'square', strokeColor: '#031C43', backgroundColor: '#FFFFFF' },
        { type: 'shape', content: 'square', fillColor: '#218B8E', backgroundColor: '#F0F9F9' }
      ],
      [
        { type: 'shape', content: 'square', strokeColor: '#218B8E', backgroundColor: '#FFFFFF' },
        { type: 'shape', content: 'square', fillColor: '#031C43', backgroundColor: '#F0F9F9' },
        { type: 'shape', content: 'square', strokeColor: '#031C43', backgroundColor: '#FFFFFF' }
      ],
      [
        { type: 'shape', content: 'square', fillColor: '#218B8E', backgroundColor: '#F0F9F9' },
        { type: 'shape', content: 'square', strokeColor: '#218B8E', backgroundColor: '#FFFFFF' },
        { type: 'empty', backgroundColor: '#F0F9F9' }
      ]
    ],
    options: [
      { type: 'shape', content: 'square', fillColor: '#218B8E' },
      { type: 'shape', content: 'square', strokeColor: '#031C43' },
      { type: 'shape', content: 'square', fillColor: '#031C43' },
      { type: 'shape', content: 'square', strokeColor: '#218B8E' },
      { type: 'shape', content: 'circle', fillColor: '#031C43' },
      { type: 'shape', content: 'triangle', fillColor: '#218B8E' }
    ],
    correctAnswer: 2 // cuadrado relleno azul oscuro
  },

  // PREGUNTA 11 - DIFÍCIL: Formas combinadas con rotación
  {
    id: 11,
    type: 'pattern',
    difficulty: 'hard',
    question: 'Completa la secuencia',
    matrix: [
      [
        { type: 'shape', content: 'circle', fillColor: '#031C43', nested: true, innerShape: 'triangle', backgroundColor: '#F0F9F9' },
        { type: 'shape', content: 'square', fillColor: '#218B8E', nested: true, innerShape: 'circle', backgroundColor: '#FFFFFF' },
        { type: 'shape', content: 'triangle', fillColor: '#031C43', nested: true, innerShape: 'square', backgroundColor: '#F0F9F9' }
      ],
      [
        { type: 'shape', content: 'square', strokeColor: '#031C43', nested: true, innerShape: 'triangle', backgroundColor: '#FFFFFF' },
        { type: 'shape', content: 'triangle', strokeColor: '#218B8E', nested: true, innerShape: 'circle', backgroundColor: '#F0F9F9' },
        { type: 'shape', content: 'circle', strokeColor: '#031C43', nested: true, innerShape: 'square', backgroundColor: '#FFFFFF' }
      ],
      [
        { type: 'shape', content: 'triangle', fillColor: '#218B8E', backgroundColor: '#F0F9F9' },
        { type: 'shape', content: 'circle', fillColor: '#031C43', backgroundColor: '#FFFFFF' },
        { type: 'empty', backgroundColor: '#F0F9F9' }
      ]
    ],
    options: [
      { type: 'shape', content: 'square', fillColor: '#218B8E' },
      { type: 'shape', content: 'triangle', strokeColor: '#031C43' },
      { type: 'shape', content: 'square', fillColor: '#031C43' },
      { type: 'shape', content: 'circle', fillColor: '#218B8E' },
      { type: 'shape', content: 'hexagon', fillColor: '#031C43' },
      { type: 'shape', content: 'square', strokeColor: '#218B8E' }
    ],
    correctAnswer: 0 // cuadrado relleno verde
  },

  // PREGUNTA 12 - DIFÍCIL: Patrón de alternancia complejo con cartas
  {
    id: 12,
    type: 'pattern',
    difficulty: 'hard',
    question: 'Completa la secuencia',
    matrix: [
      [
        { type: 'card', content: 'heart', fillColor: '#218B8E', backgroundColor: '#F0F9F9' },
        { type: 'card', content: 'diamond', strokeColor: '#031C43', backgroundColor: '#FFFFFF' },
        { type: 'card', content: 'club', fillColor: '#218B8E', backgroundColor: '#F0F9F9' }
      ],
      [
        { type: 'card', content: 'diamond', fillColor: '#031C43', backgroundColor: '#FFFFFF' },
        { type: 'card', content: 'club', strokeColor: '#218B8E', backgroundColor: '#F0F9F9' },
        { type: 'card', content: 'heart', fillColor: '#031C43', backgroundColor: '#FFFFFF' }
      ],
      [
        { type: 'card', content: 'club', fillColor: '#218B8E', backgroundColor: '#F0F9F9' },
        { type: 'card', content: 'heart', strokeColor: '#031C43', backgroundColor: '#FFFFFF' },
        { type: 'empty', backgroundColor: '#F0F9F9' }
      ]
    ],
    options: [
      { type: 'card', content: 'diamond', fillColor: '#218B8E' },
      { type: 'card', content: 'club', strokeColor: '#031C43' },
      { type: 'card', content: 'heart', fillColor: '#218B8E' },
      { type: 'card', content: 'diamond', strokeColor: '#218B8E' },
      { type: 'card', content: 'club', fillColor: '#031C43' },
      { type: 'card', content: 'heart', fillColor: '#031C43' }
    ],
    correctAnswer: 0 // diamante relleno verde
  },

  // PREGUNTA 13 - DIFÍCIL: Secuencia de Fibonacci
  {
    id: 13,
    type: 'sequence',
    difficulty: 'hard',
    question: 'Completa la secuencia',
    matrix: [
      [
        { type: 'number', content: 1, backgroundColor: '#F0F9F9' },
        { type: 'number', content: 1, backgroundColor: '#FFFFFF' },
        { type: 'number', content: 2, backgroundColor: '#F0F9F9' }
      ],
      [
        { type: 'number', content: 3, backgroundColor: '#FFFFFF' },
        { type: 'number', content: 5, backgroundColor: '#F0F9F9' },
        { type: 'number', content: 8, backgroundColor: '#FFFFFF' }
      ],
      [
        { type: 'number', content: 13, backgroundColor: '#F0F9F9' },
        { type: 'number', content: 21, backgroundColor: '#FFFFFF' },
        { type: 'empty', backgroundColor: '#F0F9F9' }
      ]
    ],
    options: [
      { type: 'number', content: 28 },
      { type: 'number', content: 34 },
      { type: 'number', content: 32 },
      { type: 'number', content: 29 },
      { type: 'number', content: 35 },
      { type: 'number', content: 30 }
    ],
    correctAnswer: 1 // 34 (13+21)
  },

  // PREGUNTA 14 - DIFÍCIL: Grid con múltiples cuadrados
  {
    id: 14,
    type: 'pattern',
    difficulty: 'hard',
    question: 'Completa la secuencia',
    matrix: [
      [
        { type: 'grid', content: 'top-left', backgroundColor: '#F0F9F9' },
        { type: 'grid', content: 'top-right', backgroundColor: '#FFFFFF' },
        { type: 'grid', content: 'bottom-left', backgroundColor: '#F0F9F9' }
      ],
      [
        { type: 'grid', content: 'bottom-right', backgroundColor: '#FFFFFF' },
        { type: 'grid', content: 'center', backgroundColor: '#F0F9F9' },
        { type: 'grid', content: 'top-center', backgroundColor: '#FFFFFF' }
      ],
      [
        { type: 'grid', content: 'center-left', backgroundColor: '#F0F9F9' },
        { type: 'grid', content: 'center-right', backgroundColor: '#FFFFFF' },
        { type: 'empty', backgroundColor: '#F0F9F9' }
      ]
    ],
    options: [
      { type: 'grid', content: 'top-left' },
      { type: 'grid', content: 'bottom-center' },
      { type: 'grid', content: 'center' },
      { type: 'grid', content: 'top-right' },
      { type: 'grid', content: 'bottom-left' },
      { type: 'grid', content: 'cross' }
    ],
    correctAnswer: 1 // bottom-center
  },

  // PREGUNTA 15 - DIFÍCIL: Flechas con rotación compleja
  {
    id: 15,
    type: 'pattern',
    difficulty: 'hard',
    question: 'Completa la secuencia',
    matrix: [
      [
        { type: 'arrow', direction: 'up', count: 1, backgroundColor: '#F0F9F9' },
        { type: 'arrow', direction: 'up', count: 2, backgroundColor: '#FFFFFF' },
        { type: 'arrow', direction: 'down', count: 1, backgroundColor: '#F0F9F9' }
      ],
      [
        { type: 'arrow', direction: 'down', count: 2, backgroundColor: '#FFFFFF' },
        { type: 'arrow', direction: 'left', count: 1, backgroundColor: '#F0F9F9' },
        { type: 'arrow', direction: 'left', count: 2, backgroundColor: '#FFFFFF' }
      ],
      [
        { type: 'arrow', direction: 'right', count: 1, backgroundColor: '#F0F9F9' },
        { type: 'arrow', direction: 'right', count: 2, backgroundColor: '#FFFFFF' },
        { type: 'empty', backgroundColor: '#F0F9F9' }
      ]
    ],
    options: [
      { type: 'arrow', direction: 'up', count: 1 },
      { type: 'arrow', direction: 'down', count: 2 },
      { type: 'arrow', direction: 'left', count: 3 },
      { type: 'arrow', direction: 'up', count: 3 },
      { type: 'arrow', direction: 'right', count: 3 },
      { type: 'arrow', direction: 'down', count: 1 }
    ],
    correctAnswer: 0 // 1 flecha arriba (retoma ciclo)
  },

  // PREGUNTA 16 - DIFÍCIL: Hexágonos con patrones internos complejos
  {
    id: 16,
    type: 'pattern',
    difficulty: 'hard',
    question: 'Completa la secuencia',
    matrix: [
      [
        { type: 'shape', content: 'hexagon', fillColor: '#031C43', backgroundColor: '#F0F9F9' },
        { type: 'shape', content: 'hexagon', strokeColor: '#218B8E', backgroundColor: '#FFFFFF' },
        { type: 'shape', content: 'hexagon', fillColor: '#218B8E', nested: true, innerShape: 'hexagon', backgroundColor: '#F0F9F9' }
      ],
      [
        { type: 'shape', content: 'hexagon', strokeColor: '#031C43', nested: true, innerShape: 'circle', backgroundColor: '#FFFFFF' },
        { type: 'shape', content: 'hexagon', fillColor: '#031C43', nested: true, innerShape: 'hexagon', backgroundColor: '#F0F9F9' },
        { type: 'shape', content: 'hexagon', strokeColor: '#218B8E', nested: true, innerShape: 'hexagon', backgroundColor: '#FFFFFF' }
      ],
      [
        { type: 'shape', content: 'hexagon', fillColor: '#218B8E', backgroundColor: '#F0F9F9' },
        { type: 'shape', content: 'hexagon', strokeColor: '#031C43', backgroundColor: '#FFFFFF' },
        { type: 'empty', backgroundColor: '#F0F9F9' }
      ]
    ],
    options: [
      { type: 'shape', content: 'hexagon', fillColor: '#218B8E', nested: true, innerShape: 'circle' },
      { type: 'shape', content: 'hexagon', fillColor: '#031C43' },
      { type: 'shape', content: 'hexagon', strokeColor: '#218B8E' },
      { type: 'shape', content: 'circle', fillColor: '#218B8E' },
      { type: 'shape', content: 'hexagon', fillColor: '#218B8E' },
      { type: 'shape', content: 'hexagon', strokeColor: '#031C43', nested: true }
    ],
    correctAnswer: 0 // hexágono verde con círculo interior
  },

  // PREGUNTA 17 - DIFÍCIL: Secuencia aritmética compleja (-5, +3)
  {
    id: 17,
    type: 'sequence',
    difficulty: 'hard',
    question: 'Completa la secuencia',
    matrix: [
      [
        { type: 'number', content: 50, backgroundColor: '#F0F9F9' },
        { type: 'number', content: 45, backgroundColor: '#FFFFFF' },
        { type: 'number', content: 48, backgroundColor: '#F0F9F9' }
      ],
      [
        { type: 'number', content: 43, backgroundColor: '#FFFFFF' },
        { type: 'number', content: 46, backgroundColor: '#F0F9F9' },
        { type: 'number', content: 41, backgroundColor: '#FFFFFF' }
      ],
      [
        { type: 'number', content: 44, backgroundColor: '#F0F9F9' },
        { type: 'number', content: 39, backgroundColor: '#FFFFFF' },
        { type: 'empty', backgroundColor: '#F0F9F9' }
      ]
    ],
    options: [
      { type: 'number', content: 36 },
      { type: 'number', content: 42 },
      { type: 'number', content: 38 },
      { type: 'number', content: 44 },
      { type: 'number', content: 40 },
      { type: 'number', content: 37 }
    ],
    correctAnswer: 1 // 42 (39+3)
  },

  // PREGUNTA 18 - DIFÍCIL: Triángulos con múltiples transformaciones
  {
    id: 18,
    type: 'pattern',
    difficulty: 'hard',
    question: 'Completa la secuencia',
    matrix: [
      [
        { type: 'shape', content: 'triangle', fillColor: '#031C43', backgroundColor: '#F0F9F9' },
        { type: 'shape', content: 'circle', fillColor: '#218B8E', nested: true, innerShape: 'triangle', backgroundColor: '#FFFFFF' },
        { type: 'shape', content: 'square', strokeColor: '#031C43', nested: true, innerShape: 'circle', backgroundColor: '#F0F9F9' }
      ],
      [
        { type: 'shape', content: 'triangle', strokeColor: '#218B8E', backgroundColor: '#FFFFFF' },
        { type: 'shape', content: 'circle', strokeColor: '#031C43', nested: true, innerShape: 'square', backgroundColor: '#F0F9F9' },
        { type: 'shape', content: 'square', fillColor: '#218B8E', nested: true, innerShape: 'triangle', backgroundColor: '#FFFFFF' }
      ],
      [
        { type: 'shape', content: 'triangle', fillColor: '#218B8E', nested: true, innerShape: 'circle', backgroundColor: '#F0F9F9' },
        { type: 'shape', content: 'circle', fillColor: '#031C43', backgroundColor: '#FFFFFF' },
        { type: 'empty', backgroundColor: '#F0F9F9' }
      ]
    ],
    options: [
      { type: 'shape', content: 'square', fillColor: '#031C43' },
      { type: 'shape', content: 'square', strokeColor: '#218B8E', nested: true, innerShape: 'square' },
      { type: 'shape', content: 'circle', fillColor: '#218B8E' },
      { type: 'shape', content: 'triangle', strokeColor: '#031C43' },
      { type: 'shape', content: 'square', fillColor: '#218B8E' },
      { type: 'shape', content: 'hexagon', fillColor: '#031C43' }
    ],
    correctAnswer: 0 // cuadrado relleno azul oscuro
  },

  // PREGUNTA 19 - DIFÍCIL: Patrón mixto de cartas con inversión
  {
    id: 19,
    type: 'pattern',
    difficulty: 'hard',
    question: 'Completa la secuencia',
    matrix: [
      [
        { type: 'card', content: 'heart', fillColor: '#031C43', backgroundColor: '#F0F9F9' },
        { type: 'card', content: 'heart', strokeColor: '#218B8E', backgroundColor: '#FFFFFF' },
        { type: 'card', content: 'diamond', fillColor: '#218B8E', backgroundColor: '#F0F9F9' }
      ],
      [
        { type: 'card', content: 'diamond', strokeColor: '#031C43', backgroundColor: '#FFFFFF' },
        { type: 'card', content: 'club', fillColor: '#031C43', backgroundColor: '#F0F9F9' },
        { type: 'card', content: 'club', strokeColor: '#218B8E', backgroundColor: '#FFFFFF' }
      ],
      [
        { type: 'card', content: 'heart', fillColor: '#218B8E', backgroundColor: '#F0F9F9' },
        { type: 'card', content: 'heart', strokeColor: '#031C43', backgroundColor: '#FFFFFF' },
        { type: 'empty', backgroundColor: '#F0F9F9' }
      ]
    ],
    options: [
      { type: 'card', content: 'diamond', fillColor: '#031C43' },
      { type: 'card', content: 'club', fillColor: '#218B8E' },
      { type: 'card', content: 'heart', fillColor: '#031C43' },
      { type: 'card', content: 'diamond', strokeColor: '#218B8E' },
      { type: 'card', content: 'club', strokeColor: '#031C43' },
      { type: 'card', content: 'heart', strokeColor: '#218B8E' }
    ],
    correctAnswer: 0 // diamante relleno azul oscuro
  },

  // PREGUNTA 20 - DIFÍCIL: Grid con patrón diagonal complejo
  {
    id: 20,
    type: 'pattern',
    difficulty: 'hard',
    question: 'Completa la secuencia',
    matrix: [
      [
        { type: 'grid', content: 'top-left', backgroundColor: '#F0F9F9' },
        { type: 'grid', content: 'center', backgroundColor: '#FFFFFF' },
        { type: 'grid', content: 'bottom-right', backgroundColor: '#F0F9F9' }
      ],
      [
        { type: 'grid', content: 'top-center', backgroundColor: '#FFFFFF' },
        { type: 'grid', content: 'center-left', backgroundColor: '#F0F9F9' },
        { type: 'grid', content: 'bottom-center', backgroundColor: '#FFFFFF' }
      ],
      [
        { type: 'grid', content: 'top-right', backgroundColor: '#F0F9F9' },
        { type: 'grid', content: 'center-right', backgroundColor: '#FFFFFF' },
        { type: 'empty', backgroundColor: '#F0F9F9' }
      ]
    ],
    options: [
      { type: 'grid', content: 'bottom-left' },
      { type: 'grid', content: 'center' },
      { type: 'grid', content: 'top-left' },
      { type: 'grid', content: 'bottom-right' },
      { type: 'grid', content: 'cross' },
      { type: 'grid', content: 'bottom-center' }
    ],
    correctAnswer: 0 // bottom-left (patrón diagonal)
  }
]

// Funciones auxiliares
export function calculateIQ(correctAnswers: number): number {
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
