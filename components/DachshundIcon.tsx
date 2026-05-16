interface DachshundIconProps {
  variant?: 'light' | 'dark'  // light = blanco (sobre fondo dorado), dark = marrón (sobre fondo crema)
  className?: string
}

export default function DachshundIcon({
  variant = 'light',
  className = 'w-8 h-5',
}: DachshundIconProps) {
  const fill   = variant === 'light' ? 'white'   : '#8B6F47'
  const accent = variant === 'light' ? '#D4B896' : '#6E5234'

  return (
    <svg
      viewBox="0 0 54 33"
      className={className}
      aria-label="perro salchicha"
    >
      {/* Cola — se curva hacia arriba a la izquierda */}
      <path
        d="M7 18 C3 12 5 6 10 4 C9 8 7 13 11 18 Z"
        fill={fill}
      />
      {/* Cuerpo — óvalo largo, la esencia del salchicha */}
      <ellipse cx="21" cy="21" rx="13" ry="7" fill={fill} />
      {/* Cuello */}
      <ellipse cx="33" cy="16" rx="4.5" ry="6.5" fill={fill} />
      {/* Cabeza */}
      <circle cx="39" cy="11" r="8" fill={fill} />
      {/* Oreja caída */}
      <ellipse cx="34.5" cy="20" rx="4.5" ry="7" fill={fill} />
      {/* Hocico largo — lo más característico */}
      <ellipse cx="49" cy="17" rx="6" ry="4" fill={fill} />
      {/* Patitas traseras */}
      <rect x="9"  y="26" width="4" height="7" rx="2" fill={fill} />
      <rect x="15" y="26" width="4" height="7" rx="2" fill={fill} />
      {/* Patitas delanteras */}
      <rect x="27" y="26" width="4" height="7" rx="2" fill={fill} />
      <rect x="33" y="26" width="4" height="7" rx="2" fill={fill} />
      {/* Nariz */}
      <ellipse cx="54" cy="17" rx="2" ry="1.8" fill={accent} />
      {/* Ojo */}
      <circle cx="40" cy="8" r="1.8" fill={accent} />
    </svg>
  )
}
