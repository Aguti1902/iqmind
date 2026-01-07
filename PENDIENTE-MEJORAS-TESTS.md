# 📋 MEJORAS PENDIENTES EN SISTEMA DE TESTS

## ✅ COMPLETADO

### 1. Test de Ansiedad ✅
- ✅ Ampliado de 7 a 20 preguntas
- ✅ Pantalla de nombre al inicio
- ✅ Duración actualizada en homepage (5-7 min)
- ✅ Evaluación más completa

### 2. Sistema Multi-Test ✅
- ✅ 6 tests disponibles en homepage
- ✅ Flujo de checkout unificado
- ✅ Verificación de pago en resultados
- ✅ Emails automáticos

---

## ⏳ PENDIENTE

### 1. Añadir Pantalla de Nombre (como test IQ)

**Tests que necesitan pantalla de nombre:**

#### Test TDAH
```typescript
// Archivo: app/[lang]/tests/adhd/page.tsx
// Añadir:
const [userName, setUserName] = useState('')

const handleStart = (e: React.FormEvent) => {
  e.preventDefault()
  if (userName.trim()) {
    localStorage.setItem('userName', userName)
    setStarted(true)
  }
}

// Reemplazar pantalla inicial con form de nombre
```

#### Test Depresión
```typescript
// Archivo: app/[lang]/tests/depression/page.tsx
// Mismo patrón que TDAH
```

#### Test EQ
```typescript
// Archivo: app/[lang]/tests/eq/page.tsx
// Mismo patrón que TDAH
```

#### Test Personalidad
```typescript
// Archivo: app/[lang]/tests/personality/page.tsx
// Mismo patrón que TDAH
```

---

### 2. Ampliar Test de Depresión

**Archivo:** `lib/depression-questions.ts`

**Actual:** 9 preguntas (PHQ-9)
**Objetivo:** 20 preguntas

**Preguntas adicionales sugeridas:**
```typescript
{
  id: 10,
  text: 'Sentirse sin esperanza sobre el futuro'
},
{
  id: 11,
  text: 'Tener pensamientos de que estarías mejor muerto/a'
},
{
  id: 12,
  text: 'Dificultad para disfrutar actividades que antes te gustaban'
},
{
  id: 13,
  text: 'Sentirse aislado/a o desconectado/a de los demás'
},
{
  id: 14,
  text: 'Cambios significativos en el peso o apetito'
},
{
  id: 15,
  text: 'Sentir que todo requiere mucho esfuerzo'
},
{
  id: 16,
  text: 'Problemas de memoria o concentración'
},
{
  id: 17,
  text: 'Sentimientos de culpa excesiva'
},
{
  id: 18,
  text: 'Irritabilidad o frustración frecuente'
},
{
  id: 19,
  text: 'Pérdida de interés en relaciones sociales'
},
{
  id: 20,
  text: 'Sentir que la vida no tiene sentido'
}
```

---

### 3. Adaptar Resultado-Estimado por Tipo de Test

**Archivo:** `app/[lang]/resultado-estimado/page.tsx`

**Textos específicos necesarios:**

```typescript
const testMessages = {
  iq: {
    title: 'Tu Coeficiente Intelectual',
    description: 'Descubre tu puntuación exacta de CI',
    features: [
      'Análisis detallado de tu capacidad cognitiva',
      'Comparativa con población mundial',
      'Certificado oficial descargable'
    ]
  },
  personality: {
    title: 'Tu Perfil de Personalidad Completo',
    description: 'Análisis Big Five (OCEAN) detallado',
    features: [
      'Puntuación en 5 dimensiones de personalidad',
      'Gráficos comparativos personalizados',
      'Recomendaciones profesionales y personales'
    ]
  },
  adhd: {
    title: 'Tu Evaluación de TDAH Completa',
    description: 'Análisis basado en criterios DSM-5',
    features: [
      'Nivel de riesgo detallado',
      'Análisis de inatención e hiperactividad',
      'Recomendaciones profesionales'
    ]
  },
  anxiety: {
    title: 'Tu Evaluación de Ansiedad Completa',
    description: 'Análisis GAD-7 Extendido',
    features: [
      'Nivel de severidad detallado',
      'Identificación de síntomas específicos',
      'Estrategias de manejo personalizadas'
    ]
  },
  depression: {
    title: 'Tu Evaluación de Depresión Completa',
    description: 'Análisis PHQ-9 Extendido',
    features: [
      'Nivel de severidad detallado',
      'Análisis de síntomas clave',
      'Recomendaciones de tratamiento'
    ]
  },
  eq: {
    title: 'Tu Inteligencia Emocional Completa',
    description: 'Análisis EQ detallado',
    features: [
      'Puntuación en competencias emocionales',
      'Áreas de fortaleza y mejora',
      'Plan de desarrollo personalizado'
    ]
  }
}
```

---

### 4. Adaptar Checkout por Tipo de Test

**Archivo:** `app/[lang]/checkout/page.tsx`

**Cambios necesarios:**

```typescript
// Detectar tipo de test
const testType = localStorage.getItem('testType') || 'iq'

// Mensajes personalizados
const checkoutMessages = {
  iq: {
    title: 'Desbloquea tu Resultado de CI',
    subtitle: 'Accede a tu puntuación exacta y análisis completo'
  },
  personality: {
    title: 'Desbloquea tu Perfil de Personalidad',
    subtitle: 'Accede a tu análisis Big Five completo'
  },
  adhd: {
    title: 'Desbloquea tu Evaluación de TDAH',
    subtitle: 'Accede a tu análisis completo y recomendaciones'
  },
  anxiety: {
    title: 'Desbloquea tu Evaluación de Ansiedad',
    subtitle: 'Accede a tu análisis GAD-7 completo'
  },
  depression: {
    title: 'Desbloquea tu Evaluación de Depresión',
    subtitle: 'Accede a tu análisis PHQ-9 completo'
  },
  eq: {
    title: 'Desbloquea tu Inteligencia Emocional',
    subtitle: 'Accede a tu análisis EQ completo'
  }
}

// Usar en el render
<h1>{checkoutMessages[testType].title}</h1>
<p>{checkoutMessages[testType].subtitle}</p>
```

---

## 🎯 PRIORIDAD DE IMPLEMENTACIÓN

### Alta Prioridad (Crítico para UX)
1. ✅ Test de ansiedad ampliado
2. 🔄 Añadir pantalla de nombre a todos los tests
3. 🔄 Ampliar test de depresión

### Media Prioridad (Mejora UX)
4. 🔄 Adaptar resultado-estimado por tipo
5. 🔄 Adaptar checkout por tipo

### Baja Prioridad (Opcional)
6. ⏳ Ampliar otros tests (TDAH, EQ, Personalidad)
7. ⏳ Añadir más preguntas de validación

---

## 📝 NOTAS DE IMPLEMENTACIÓN

### Patrón para Pantalla de Nombre

Todos los tests deben seguir este patrón:

```typescript
// 1. Estado
const [userName, setUserName] = useState('')
const [started, setStarted] = useState(false)

// 2. Handler
const handleStart = (e: React.FormEvent) => {
  e.preventDefault()
  if (userName.trim()) {
    localStorage.setItem('userName', userName)
    setStarted(true)
  }
}

// 3. Pantalla inicial
if (!started) {
  return (
    <form onSubmit={handleStart}>
      <input
        type="text"
        value={userName}
        onChange={(e) => setUserName(e.target.value)}
        placeholder="Introduce tu nombre"
        required
        autoFocus
      />
      <button type="submit">Comenzar Test</button>
    </form>
  )
}
```

---

## 🚀 COMANDOS GIT PARA IMPLEMENTAR

```bash
# 1. Añadir pantalla nombre a TDAH
git add app/[lang]/tests/adhd/page.tsx
git commit -m "✅ TDAH: Añadida pantalla de nombre al inicio"

# 2. Añadir pantalla nombre a Depresión
git add app/[lang]/tests/depression/page.tsx
git commit -m "✅ Depresión: Añadida pantalla de nombre al inicio"

# 3. Ampliar test de Depresión
git add lib/depression-questions.ts
git commit -m "📝 Depresión: Ampliado de 9 a 20 preguntas"

# 4. Adaptar resultado-estimado
git add app/[lang]/resultado-estimado/page.tsx
git commit -m "🎨 Resultado-estimado: Textos específicos por tipo de test"

# 5. Adaptar checkout
git add app/[lang]/checkout/page.tsx
git commit -m "🎨 Checkout: Mensajes personalizados por tipo de test"
```

---

## ✅ CHECKLIST FINAL

- [x] Test ansiedad ampliado (7 → 20 preguntas)
- [x] Test ansiedad con pantalla de nombre
- [x] Homepage actualizado
- [ ] Test TDAH con pantalla de nombre
- [ ] Test Depresión con pantalla de nombre
- [ ] Test EQ con pantalla de nombre
- [ ] Test Personalidad con pantalla de nombre
- [ ] Test Depresión ampliado (9 → 20 preguntas)
- [ ] Resultado-estimado adaptado por tipo
- [ ] Checkout adaptado por tipo

---

**Fecha:** 7 de Enero de 2026
**Estado:** 30% Completado
**Próximos pasos:** Implementar pantallas de nombre en tests restantes

