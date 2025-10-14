# 🎨 Nuevo Diseño Visual del Test IQ

## 📋 Resumen

Rediseño completo del test de IQ con un sistema visual profesional basado en SVG, inspirado en tests psicométricos de alta calidad. El nuevo diseño utiliza un esquema de colores coral/rosa y presenta las preguntas de forma más visual y atractiva.

---

## 🎨 Paleta de Colores

### Colores Principales
- **Coral Principal:** `#E94444` - Bordes, formas principales, números
- **Rosa Claro:** `#FFE5E5` - Fondos alternados de celdas
- **Blanco:** `#FFFFFF` - Fondos de celdas alternados
- **Negro:** `#000000` - Formas secundarias, textos
- **Gris Oscuro:** `#1e293b` - Círculos de letras A-F

---

## 📐 Estructura del Layout

### Desktop (≥1024px)
```
┌────────────────────────────────────────────────────────┐
│  Header: Nombre, Pregunta X de 20, Tiempo             │
├────────────────────────────────────────────────────────┤
│  Barra de progreso                                     │
├──────────────────────────┬─────────────────────────────┤
│                          │                             │
│  Matriz 3x3              │  Opciones A-F (Grid 2x3)   │
│  (Izquierda)             │  (Derecha - Borde coral)    │
│                          │                             │
│  [  ] [  ] [  ]         │    A         B              │
│  [  ] [  ] [  ]         │   [ ]       [ ]             │
│  [  ] [  ] [?]          │                             │
│                          │    C         D              │
│                          │   [ ]       [ ]             │
│                          │                             │
│                          │    E         F              │
│                          │   [ ]       [ ]             │
└──────────────────────────┴─────────────────────────────┘
```

### Mobile (<1024px)
```
┌────────────────────────┐
│  Header compacto       │
├────────────────────────┤
│  Progreso              │
├────────────────────────┤
│  Matriz 3x3            │
│  [  ] [  ] [  ]        │
│  [  ] [  ] [  ]        │
│  [  ] [  ] [?]         │
├────────────────────────┤
│  Opciones (2x3)        │
│    A         B         │
│   [ ]       [ ]        │
│    C         D         │
│   [ ]       [ ]        │
│    E         F         │
│   [ ]       [ ]        │
└────────────────────────┘
```

---

## 🧩 Tipos de Preguntas Visuales

### 1. Secuencias Numéricas
```typescript
{
  type: 'number',
  content: 2, 12, 22, 32, 42, 52, 62, 72, ?
  // Detectar: +10 en cada paso
}
```
**Renderizado:** Números grandes en color coral (#E94444)

### 2. Formas Geométricas
```typescript
{
  type: 'shape',
  content: 'circle' | 'square' | 'triangle' | 'hexagon'
  fillColor: '#E94444' | '#000000' | 'none'
  strokeColor: '#000000' | '#E94444'
}
```
**Ejemplos:**
- Círculo relleno negro
- Triángulo con solo borde coral
- Cuadrado relleno coral
- Hexágono con borde negro

### 3. Formas Anidadas
```typescript
{
  type: 'shape',
  content: 'triangle',
  fillColor: '#000000',
  nested: true,
  innerShape: 'triangle' // Forma interior
}
```
**Renderizado:** Triángulo negro con triángulo rojo interior

### 4. Palos de Cartas
```typescript
{
  type: 'card',
  content: 'heart' | 'diamond' | 'club'
  fillColor: '#E94444' | 'none'
  backgroundColor: '#E94444' | '#FFE5E5' | '#FFFFFF'
}
```
**Ejemplos:**
- ♥ Corazón relleno
- ♦ Diamante con solo borde
- ♣ Trébol con fondo coral

### 5. Grids con Posiciones
```typescript
{
  type: 'grid',
  content: 'top-left' | 'center' | 'bottom-right' | etc.
}
```
**Renderizado:** Grid 2x2 con cuadrado coral en posición específica

### 6. Flechas Direccionales
```typescript
{
  type: 'arrow',
  direction: 'up' | 'down' | 'left' | 'right'
  count: 1 | 2 | 3 // Número de flechas
}
```
**Ejemplos:**
- ← Una flecha izquierda
- ↓↓↓ Tres flechas abajo
- →→ Dos flechas derecha

---

## 🎨 Componentes Principales

### VisualCell Component
```tsx
<VisualCell 
  cell={{
    type: 'shape',
    content: 'circle',
    fillColor: '#000000',
    backgroundColor: '#FFE5E5'
  }}
  size={120}
  isOption={false}
/>
```

**Props:**
- `cell`: Objeto con configuración de la celda
- `size`: Tamaño en pixels (default: 120)
- `isOption`: Si es una opción clickeable (default: false)

**Renderizado:**
- SVG con `viewBox="0 0 100 100"` para escalado perfecto
- Padding interno automático
- Bordes redondeados coral
- Hover effects en opciones

---

## 📊 Sistema de Preguntas

### Estructura de Pregunta Visual
```typescript
interface VisualQuestion {
  id: number
  type: 'sequence' | 'pattern' | 'logic'
  difficulty: 'easy' | 'medium' | 'hard'
  question: string // "Completa la secuencia"
  matrix: VisualCell[][] // Matriz 3x3
  options: VisualCell[] // 6 opciones (A-F)
  correctAnswer: number // 0-5
}
```

### Distribución de Dificultad
- **Fáciles (1-5):** 25% - Patrones simples y secuencias numéricas
- **Medias (6-12):** 35% - Formas anidadas, grids, flechas
- **Difíciles (13-20):** 40% - Combinaciones complejas

---

## 🎯 Elementos del Diseño

### Celdas de Matriz
```css
.celda-matriz {
  width: 120px;
  height: 120px;
  border: 2px solid rgba(233, 68, 68, 0.3);
  border-radius: 0.75rem;
  background: var(--bg-color); /* #FFE5E5 o #FFFFFF */
}
```

### Opciones (A-F)
```css
.opcion {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.75rem;
}

.opcion-letra {
  width: 3rem;
  height: 3rem;
  background: #1e293b;
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.125rem;
  font-weight: bold;
}

.opcion-celda {
  border: 2px solid rgba(233, 68, 68, 0.4);
  transition: all 0.2s;
}

.opcion-celda:hover {
  border-color: #E94444;
  box-shadow: 0 10px 15px rgba(0, 0, 0, 0.1);
  cursor: pointer;
}
```

### Panel de Opciones (Derecho)
```css
.panel-opciones {
  background: white;
  border-radius: 1.5rem;
  border: 4px solid #E94444;
  padding: 3rem;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
}
```

---

## 📱 Responsividad

### Breakpoints
- **Mobile:** < 1024px - Layout vertical (matriz arriba, opciones abajo)
- **Desktop:** ≥ 1024px - Layout horizontal (matriz izquierda, opciones derecha)

### Ajustes Mobile
```css
@media (max-width: 1023px) {
  .grid-cols-3 { grid-template-columns: repeat(3, 1fr); }
  .opcion-celda { aspect-ratio: 1; }
  .panel-opciones { padding: 2rem; }
}
```

---

## 🎨 Renderizado SVG

### Ejemplo: Círculo con Hexágono Interior
```svg
<svg viewBox="0 0 100 100">
  <!-- Círculo exterior -->
  <circle 
    cx="50" 
    cy="50" 
    r="30" 
    fill="#000000" 
  />
  <!-- Hexágono interior -->
  <polygon 
    points="50,30 62,40 62,55 50,65 38,55 38,40" 
    fill="none" 
    stroke="#E94444" 
    stroke-width="2" 
  />
</svg>
```

### Ejemplo: Palo de Carta (Corazón)
```svg
<svg viewBox="0 0 100 100">
  <path 
    d="M50,70 C50,70 25,50 25,35 C25,25 30,20 40,25 
       C45,27.5 50,32.5 50,32.5 C50,32.5 55,27.5 60,25 
       C70,20 75,25 75,35 C75,50 50,70 50,70 Z"
    fill="#E94444"
  />
</svg>
```

### Ejemplo: Flecha Direccional
```svg
<svg viewBox="0 0 100 100">
  <!-- Línea de flecha -->
  <line 
    x1="50" 
    y1="70" 
    x2="50" 
    y2="30" 
    stroke="#E94444" 
    stroke-width="4" 
  />
  <!-- Punta de flecha -->
  <polygon 
    points="42,35 50,25 58,35" 
    fill="#E94444" 
  />
</svg>
```

---

## 🔄 Flujo de Usuario

### 1. Pantalla de Bienvenida
- Input para nombre
- Instrucciones del test
- Botón "Comenzar Test"

### 2. Durante el Test
```
Para cada pregunta:
1. Mostrar matriz 3x3 (8 celdas + "?")
2. Mostrar 6 opciones (A-F)
3. Usuario hace clic en opción
4. Animación de selección (300ms)
5. Auto-avance a siguiente pregunta
6. Actualizar barra de progreso
```

### 3. Anti-Bot en Última Pregunta
```
Si timeElapsed < 60 segundos:
  → Mostrar modal de advertencia
  → No finalizar test
  → Usuario puede continuar
```

### 4. Finalización
```
1. Calcular respuestas correctas
2. Guardar en localStorage
3. Redirigir a /analizando (6 segundos)
4. Mostrar resultado estimado
```

---

## 📊 Ejemplo de Pregunta Completa

```typescript
{
  id: 1,
  type: 'sequence',
  difficulty: 'easy',
  question: 'Completa la secuencia',
  matrix: [
    [
      { type: 'number', content: 2, backgroundColor: '#FFE5E5' },
      { type: 'number', content: 12, backgroundColor: '#FFE5E5' },
      { type: 'number', content: 22, backgroundColor: '#FFE5E5' }
    ],
    [
      { type: 'number', content: 32, backgroundColor: '#FFE5E5' },
      { type: 'number', content: 42, backgroundColor: '#FFE5E5' },
      { type: 'number', content: 52, backgroundColor: '#FFE5E5' }
    ],
    [
      { type: 'number', content: 62, backgroundColor: '#FFE5E5' },
      { type: 'number', content: 72, backgroundColor: '#FFE5E5' },
      { type: 'empty', backgroundColor: '#FFE5E5' }
    ]
  ],
  options: [
    { type: 'number', content: 32 },  // A - Incorrecto
    { type: 'number', content: 83 },  // B - Incorrecto
    { type: 'number', content: 82 },  // C - ✓ CORRECTO
    { type: 'number', content: 70 },  // D - Incorrecto
    { type: 'number', content: 52 },  // E - Incorrecto
    { type: 'number', content: 92 }   // F - Incorrecto
  ],
  correctAnswer: 2 // Opción C (82)
}
```

---

## 🚀 Ventajas del Nuevo Diseño

### Profesionalismo
✅ Diseño limpio y moderno tipo tests psicométricos  
✅ Colores consistentes y agradables a la vista  
✅ Tipografía clara y legible  

### Usabilidad
✅ Opciones con letras A-F (estándar en tests)  
✅ Hover effects claros  
✅ Layout intuitivo lado a lado  
✅ Responsive perfecto  

### Visual
✅ Renderizado SVG escalable sin pérdida de calidad  
✅ Formas geométricas precisas  
✅ Animaciones suaves  
✅ Feedback visual inmediato  

### Credibilidad
✅ Parece un test profesional real  
✅ Diseño similar a tests como Raven's Matrices  
✅ Justifica el precio premium  
✅ Genera confianza en el usuario  

---

## 📝 Archivos del Sistema

```
lib/
  visual-questions.ts        # 20 preguntas visuales

components/
  VisualCell.tsx            # Renderizado de celdas visuales

app/[lang]/test/
  page.tsx                  # Componente principal del test
```

---

## 🎓 Extensibilidad

### Añadir Nuevos Tipos de Celdas
```typescript
// En VisualCell.tsx
case 'nuevo-tipo':
  return renderNuevoTipo()

// En visual-questions.ts
{
  type: 'nuevo-tipo',
  content: 'configuración',
  ...
}
```

### Crear Nuevas Preguntas
```typescript
{
  id: 21,
  type: 'pattern',
  difficulty: 'hard',
  question: 'Completa la secuencia',
  matrix: [...], // 3x3 grid
  options: [...], // 6 options
  correctAnswer: 3
}
```

---

**Fecha de implementación:** ${new Date().toLocaleDateString('es-ES')}

**Versión:** 3.0 - Visual Professional Design

**Status:** ✅ Producción Ready

**Basado en:** Capturas de pantalla del usuario en `/public/images/Test/`

