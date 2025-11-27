'use client'

import { VisualCell as VisualCellType } from '@/lib/visual-questions'

interface VisualCellProps {
  cell: VisualCellType
  size?: number
  isOption?: boolean
  isHighlighted?: boolean
}

export default function VisualCell({ cell, size = 120, isOption = false, isHighlighted = false }: VisualCellProps) {
  const bgColor = cell.backgroundColor || '#FFFFFF'
  
  // Renderizado según el tipo
  const renderContent = () => {
    switch (cell.type) {
      case 'number':
        return (
          <div className="w-full h-full flex items-center justify-center">
            <span className="text-4xl font-bold text-[#07C59A]">{cell.content}</span>
          </div>
        )
      
      case 'shape':
        return renderShape()
      
      case 'card':
        return renderCard()
      
      case 'grid':
        return renderGrid()
      
      case 'arrow':
        return renderArrows()
      
      case 'pattern':
        return renderPattern()
      
      case 'empty':
        return (
          <div className="w-full h-full flex items-center justify-center">
            <span className="text-5xl font-bold text-[#07C59A]">?</span>
          </div>
        )
      
      default:
        return null
    }
  }

  const renderShape = () => {
    const fill = cell.fillColor || 'none'
    const stroke = cell.strokeColor || '#113240'
    const strokeWidth = cell.fillColor ? 0 : 2

    let shapeElement
    switch (cell.content) {
      case 'circle':
        shapeElement = (
          <circle
            cx="50"
            cy="50"
            r="30"
            fill={fill}
            stroke={stroke}
            strokeWidth={strokeWidth}
          />
        )
        break
      
      case 'square':
        shapeElement = (
          <rect
            x="20"
            y="20"
            width="60"
            height="60"
            fill={fill}
            stroke={stroke}
            strokeWidth={strokeWidth}
          />
        )
        break
      
      case 'triangle':
        shapeElement = (
          <polygon
            points="50,20 80,70 20,70"
            fill={fill}
            stroke={stroke}
            strokeWidth={strokeWidth}
          />
        )
        break
      
      case 'hexagon':
        shapeElement = (
          <polygon
            points="50,15 75,30 75,60 50,75 25,60 25,30"
            fill={fill}
            stroke={stroke}
            strokeWidth={strokeWidth}
          />
        )
        break
      
      default:
        shapeElement = null
    }

    // Si es anidada, agregar forma interior
    let innerElement = null
    if (cell.nested && cell.innerShape) {
      const innerStroke = stroke === '#113240' ? '#07C59A' : '#113240'
      switch (cell.innerShape) {
        case 'triangle':
          innerElement = (
            <polygon
              points="50,35 65,60 35,60"
              fill="none"
              stroke={innerStroke}
              strokeWidth="2"
            />
          )
          break
        case 'circle':
          innerElement = (
            <circle
              cx="50"
              cy="50"
              r="15"
              fill="none"
              stroke={innerStroke}
              strokeWidth="2"
            />
          )
          break
        case 'hexagon':
          innerElement = (
            <polygon
              points="50,30 62,40 62,55 50,65 38,55 38,40"
              fill="none"
              stroke={innerStroke}
              strokeWidth="2"
            />
          )
          break
      }
    }

    return (
      <svg viewBox="0 0 100 100" className="w-full h-full p-2">
        {shapeElement}
        {innerElement}
      </svg>
    )
  }

  const renderCard = () => {
    const fill = cell.fillColor || 'none'
    const stroke = cell.strokeColor || '#113240'

    let cardShape
    switch (cell.content) {
      case 'heart':
        cardShape = (
          <path
            d="M50,70 C50,70 25,50 25,35 C25,25 30,20 40,25 C45,27.5 50,32.5 50,32.5 C50,32.5 55,27.5 60,25 C70,20 75,25 75,35 C75,50 50,70 50,70 Z"
            fill={fill}
            stroke={stroke}
            strokeWidth={fill === 'none' ? 2 : 0}
          />
        )
        break
      
      case 'diamond':
        cardShape = (
          <path
            d="M50,20 L75,50 L50,80 L25,50 Z"
            fill={fill}
            stroke={stroke}
            strokeWidth={fill === 'none' ? 2 : 0}
          />
        )
        break
      
      case 'club':
        cardShape = (
          <>
            <circle cx="40" cy="40" r="10" fill={fill} stroke={stroke} strokeWidth={fill === 'none' ? 2 : 0} />
            <circle cx="60" cy="40" r="10" fill={fill} stroke={stroke} strokeWidth={fill === 'none' ? 2 : 0} />
            <circle cx="50" cy="30" r="10" fill={fill} stroke={stroke} strokeWidth={fill === 'none' ? 2 : 0} />
            <path d="M43,50 L57,50 L55,75 L45,75 Z" fill={fill} stroke={stroke} strokeWidth={fill === 'none' ? 2 : 0} />
          </>
        )
        break
    }

    return (
      <svg viewBox="0 0 100 100" className="w-full h-full p-2">
        {cardShape}
      </svg>
    )
  }

  const renderGrid = () => {
    // Grid 2x2 con cuadrado en posición específica
    const positions: { [key: string]: { x: number, y: number } } = {
      'top-left': { x: 10, y: 10 },
      'top-center': { x: 40, y: 10 },
      'top-right': { x: 70, y: 10 },
      'center-left': { x: 10, y: 40 },
      'center': { x: 40, y: 40 },
      'center-right': { x: 70, y: 40 },
      'bottom-left': { x: 10, y: 70 },
      'bottom-center': { x: 40, y: 70 },
      'bottom-right': { x: 70, y: 70 },
      'cross': { x: 40, y: 40 } // Para X
    }

    const pos = positions[cell.content as string] || { x: 40, y: 40 }

    return (
      <svg viewBox="0 0 100 100" className="w-full h-full p-1">
        {/* Grid lines */}
        <line x1="33" y1="0" x2="33" y2="100" stroke="#113240" strokeWidth="1.5" />
        <line x1="67" y1="0" x2="67" y2="100" stroke="#113240" strokeWidth="1.5" />
        <line x1="0" y1="33" x2="100" y2="33" stroke="#113240" strokeWidth="1.5" />
        <line x1="0" y1="67" x2="100" y2="67" stroke="#113240" strokeWidth="1.5" />
        
        {/* Square at position */}
        {cell.content !== 'cross' ? (
          <rect
            x={pos.x}
            y={pos.y}
            width="20"
            height="20"
            fill="#07C59A"
          />
        ) : (
          <>
            <line x1="30" y1="30" x2="70" y2="70" stroke="#113240" strokeWidth="3" />
            <line x1="70" y1="30" x2="30" y2="70" stroke="#113240" strokeWidth="3" />
            <rect x="65" y="65" width="15" height="15" fill="#07C59A" />
          </>
        )}
      </svg>
    )
  }

  const renderPattern = () => {
    // Renderiza patrones de áreas rellenas en cuadrado
    const patternType = cell.content as string

    return (
      <svg viewBox="0 0 100 100" className="w-full h-full p-2">
        <rect x="10" y="10" width="80" height="80" fill="none" stroke="#113240" strokeWidth="2" />
        {patternType === 'top-left-triangle' && (
          <polygon points="10,10 90,10 10,90" fill="#07C59A" />
        )}
        {patternType === 'top-right-half' && (
          <rect x="50" y="10" width="40" height="80" fill="#07C59A" />
        )}
        {patternType === 'bottom-right-diagonal' && (
          <polygon points="90,10 90,90 10,90" fill="#07C59A" />
        )}
        {patternType === 'bottom-left-triangle' && (
          <polygon points="10,10 10,90 90,90" fill="#07C59A" />
        )}
        {patternType === 'bottom-half' && (
          <rect x="10" y="50" width="80" height="40" fill="#07C59A" />
        )}
        {patternType === 'right-triangle' && (
          <polygon points="90,10 90,90 50,50" fill="#07C59A" />
        )}
        {patternType === 'top-half' && (
          <rect x="10" y="10" width="80" height="40" fill="#07C59A" />
        )}
        {patternType === 'full-square' && (
          <rect x="10" y="10" width="80" height="80" fill="#07C59A" />
        )}
        {patternType === 'right-half' && (
          <rect x="50" y="10" width="40" height="80" fill="#07C59A" />
        )}
        {patternType === 'left-half' && (
          <rect x="10" y="10" width="40" height="80" fill="#07C59A" />
        )}
        {patternType === 'center-square' && (
          <rect x="35" y="35" width="30" height="30" fill="#07C59A" />
        )}
        {patternType === 'full-square-red' && (
          <rect x="10" y="10" width="80" height="80" fill="#113240" />
        )}
      </svg>
    )
  }

  const renderArrows = () => {
    const count = cell.count || 1
    const arrows = []
    
    for (let i = 0; i < count; i++) {
      let arrowPath
      const offset = count > 1 ? (i * 25 - (count - 1) * 12.5) : 0
      
      switch (cell.direction) {
        case 'up':
          arrowPath = (
            <g key={i} transform={`translate(${50 + offset}, 0)`}>
              <line x1="0" y1="70" x2="0" y2="30" stroke="#07C59A" strokeWidth="4" />
              <polygon points="-8,35 0,25 8,35" fill="#07C59A" />
            </g>
          )
          break
        case 'down':
          arrowPath = (
            <g key={i} transform={`translate(${50 + offset}, 0)`}>
              <line x1="0" y1="30" x2="0" y2="70" stroke="#07C59A" strokeWidth="4" />
              <polygon points="-8,65 0,75 8,65" fill="#07C59A" />
            </g>
          )
          break
        case 'left':
          arrowPath = (
            <g key={i} transform={`translate(0, ${50 + offset})`}>
              <line x1="70" y1="0" x2="30" y2="0" stroke="#07C59A" strokeWidth="4" />
              <polygon points="35,-8 25,0 35,8" fill="#07C59A" />
            </g>
          )
          break
        case 'right':
          arrowPath = (
            <g key={i} transform={`translate(0, ${50 + offset})`}>
              <line x1="30" y1="0" x2="70" y2="0" stroke="#07C59A" strokeWidth="4" />
              <polygon points="65,-8 75,0 65,8" fill="#07C59A" />
            </g>
          )
          break
      }
      arrows.push(arrowPath)
    }

    return (
      <svg viewBox="0 0 100 100" className="w-full h-full p-2">
        {arrows}
      </svg>
    )
  }

  return (
    <div
      className={`rounded-xl border-2 flex items-center justify-center ${
        isHighlighted
          ? 'border-[#07C59A] border-4'
          : isOption
          ? 'border-[#07C59A]/40 hover:border-[#07C59A] hover:shadow-lg transition-all duration-200 cursor-pointer'
          : 'border-[#07C59A]/30'
      }`}
      style={{
        backgroundColor: bgColor,
        width: isOption ? '100%' : `${size}px`,
        height: isOption ? 'auto' : `${size}px`,
        aspectRatio: '1',
      }}
    >
      {renderContent()}
    </div>
  )
}

