// Sistema de gestión de historial de tests

export interface TestResult {
  id: string
  date: string
  iq: number
  correctAnswers: number
  totalQuestions: number
  timeElapsed: number
  answers: (number | null)[]
  categoryScores?: {
    logicalReasoning: number
    visualPerception: number
    patternRecognition: number
    abstractThinking: number
    workingMemory: number
    processingSpeed: number
  }
}

export interface TestHistory {
  tests: TestResult[]
  userName: string
  email: string
}

const STORAGE_KEY = 'testHistory'

/**
 * Guardar un nuevo resultado de test
 */
export function saveTestResult(result: Omit<TestResult, 'id' | 'date'>): TestResult {
  const history = getTestHistory()
  
  const newTest: TestResult = {
    ...result,
    id: generateTestId(),
    date: new Date().toISOString()
  }
  
  history.tests.unshift(newTest) // Añadir al principio (más reciente primero)
  
  // Guardar en localStorage
  localStorage.setItem(STORAGE_KEY, JSON.stringify(history))
  
  // También mantener compatibilidad con el sistema antiguo
  localStorage.setItem('userIQ', result.iq.toString())
  localStorage.setItem('correctAnswers', result.correctAnswers.toString())
  
  return newTest
}

/**
 * Obtener el historial completo de tests
 */
export function getTestHistory(): TestHistory {
  if (typeof window === 'undefined') return { tests: [], userName: '', email: '' }
  
  const stored = localStorage.getItem(STORAGE_KEY)
  
  if (stored) {
    try {
      return JSON.parse(stored)
    } catch (e) {
      console.error('Error parsing test history:', e)
    }
  }
  
  // Si no existe, crear uno nuevo con datos existentes
  const userName = localStorage.getItem('userName') || ''
  const email = localStorage.getItem('userEmail') || ''
  const currentIQ = parseInt(localStorage.getItem('userIQ') || '0')
  const currentCorrect = parseInt(localStorage.getItem('correctAnswers') || '0')
  
  const newHistory: TestHistory = {
    tests: currentIQ > 0 ? [{
      id: generateTestId(),
      date: new Date().toISOString(),
      iq: currentIQ,
      correctAnswers: currentCorrect,
      totalQuestions: 20,
      timeElapsed: 0,
      answers: []
    }] : [],
    userName,
    email
  }
  
  return newHistory
}

/**
 * Obtener el último test realizado
 */
export function getLatestTest(): TestResult | null {
  const history = getTestHistory()
  return history.tests.length > 0 ? history.tests[0] : null
}

/**
 * Obtener estadísticas generales
 */
export function getTestStatistics() {
  const history = getTestHistory()
  
  if (history.tests.length === 0) {
    return {
      totalTests: 0,
      averageIQ: 0,
      highestIQ: 0,
      lowestIQ: 0,
      averageCorrect: 0,
      improvement: 0,
      lastTestDate: null
    }
  }
  
  const iqs = history.tests.map(t => t.iq)
  const corrects = history.tests.map(t => t.correctAnswers)
  
  const totalTests = history.tests.length
  const averageIQ = Math.round(iqs.reduce((a, b) => a + b, 0) / totalTests)
  const highestIQ = Math.max(...iqs)
  const lowestIQ = Math.min(...iqs)
  const averageCorrect = Math.round(corrects.reduce((a, b) => a + b, 0) / totalTests)
  
  // Calcular mejora (comparar último con primero)
  const improvement = totalTests > 1 
    ? history.tests[0].iq - history.tests[totalTests - 1].iq 
    : 0
  
  const lastTestDate = history.tests[0].date
  
  return {
    totalTests,
    averageIQ,
    highestIQ,
    lowestIQ,
    averageCorrect,
    improvement,
    lastTestDate
  }
}

/**
 * Obtener datos para el gráfico de evolución
 */
export function getEvolutionData() {
  const history = getTestHistory()
  
  // Ordenar por fecha (más antiguo primero para el gráfico)
  const sortedTests = [...history.tests].reverse()
  
  return sortedTests.map((test, index) => ({
    testNumber: index + 1,
    date: new Date(test.date).toLocaleDateString(),
    iq: test.iq,
    correctAnswers: test.correctAnswers,
    fullDate: test.date
  }))
}

/**
 * Comparar dos tests
 */
export function compareTests(testId1: string, testId2: string) {
  const history = getTestHistory()
  const test1 = history.tests.find(t => t.id === testId1)
  const test2 = history.tests.find(t => t.id === testId2)
  
  if (!test1 || !test2) return null
  
  return {
    iqDifference: test1.iq - test2.iq,
    correctDifference: test1.correctAnswers - test2.correctAnswers,
    timeDifference: test1.timeElapsed - test2.timeElapsed,
    test1,
    test2
  }
}

/**
 * Limpiar historial (útil para testing)
 */
export function clearTestHistory() {
  localStorage.removeItem(STORAGE_KEY)
}

/**
 * Actualizar información del usuario
 */
export function updateUserInfo(userName: string, email: string) {
  const history = getTestHistory()
  history.userName = userName
  history.email = email
  localStorage.setItem(STORAGE_KEY, JSON.stringify(history))
  localStorage.setItem('userName', userName)
  localStorage.setItem('userEmail', email)
}

/**
 * Generar ID único para test
 */
function generateTestId(): string {
  return `test_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}

/**
 * Calcular puntuaciones por categoría basadas en las preguntas
 */
export function calculateCategoryScores(answers: (number | null)[], questions: any[]) {
  const categories = {
    logicalReasoning: { correct: 0, total: 0 },
    visualPerception: { correct: 0, total: 0 },
    patternRecognition: { correct: 0, total: 0 },
    abstractThinking: { correct: 0, total: 0 },
    workingMemory: { correct: 0, total: 0 },
    processingSpeed: { correct: 0, total: 0 }
  }
  
  answers.forEach((answer, index) => {
    if (index >= questions.length) return
    
    const question = questions[index]
    const isCorrect = answer === question.correctAnswer
    
    // Distribuir preguntas en categorías según dificultad y posición
    let category: keyof typeof categories
    
    if (index < 7) {
      // Preguntas fáciles
      if (index % 2 === 0) category = 'visualPerception'
      else category = 'patternRecognition'
    } else if (index < 14) {
      // Preguntas medias
      if (index % 2 === 0) category = 'logicalReasoning'
      else category = 'abstractThinking'
    } else {
      // Preguntas difíciles
      if (index % 2 === 0) category = 'workingMemory'
      else category = 'processingSpeed'
    }
    
    categories[category].total++
    if (isCorrect) categories[category].correct++
  })
  
  return {
    logicalReasoning: (categories.logicalReasoning.correct / categories.logicalReasoning.total) * 100,
    visualPerception: (categories.visualPerception.correct / categories.visualPerception.total) * 100,
    patternRecognition: (categories.patternRecognition.correct / categories.patternRecognition.total) * 100,
    abstractThinking: (categories.abstractThinking.correct / categories.abstractThinking.total) * 100,
    workingMemory: (categories.workingMemory.correct / categories.workingMemory.total) * 100,
    processingSpeed: (categories.processingSpeed.correct / categories.processingSpeed.total) * 100
  }
}

