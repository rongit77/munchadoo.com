export function Mascot({ small = false }: { small?: boolean }) {
  return (
    <svg
      className={small ? "mascot small" : "mascot"}
      viewBox="0 0 240 220"
      aria-hidden="true"
    >
      <path
        d="M62 154 Q18 150 25 122 Q30 111 47 129M186 146 Q227 123 219 102"
        fill="none"
        stroke="#27352a"
        strokeWidth="12"
        strokeLinecap="round"
      />
      <path
        d="M77 176 L69 205 M159 177 L169 205"
        stroke="#27352a"
        strokeWidth="15"
        strokeLinecap="round"
      />
      <path
        d="M53 80 Q54 38 98 42 Q111 13 135 39 Q187 32 191 86 L197 141 Q197 185 154 187 L91 186 Q45 185 45 147Z"
        fill="#d9eb8a"
        stroke="#27352a"
        strokeWidth="4"
      />
      <ellipse cx="95" cy="103" rx="8" ry="13" fill="#27352a" />
      <ellipse cx="145" cy="103" rx="8" ry="13" fill="#27352a" />
      <circle cx="97" cy="99" r="2.7" fill="white" />
      <circle cx="147" cy="99" r="2.7" fill="white" />
      <path d="M102 130 Q121 155 140 130" fill="#27352a" />
      <path d="M112 141 Q122 132 131 142" fill="#ed7f65" />
      <ellipse cx="76" cy="125" rx="11" ry="6" fill="#eda58b" />
      <ellipse cx="163" cy="125" rx="11" ry="6" fill="#eda58b" />
      <path
        d="M210 86 l-2-20 m9 24 12-17"
        stroke="#27352a"
        strokeWidth="4"
        strokeLinecap="round"
      />
    </svg>
  );
}
export function FoodArt({ kind }: { kind: string }) {
  return (
    <svg viewBox="0 0 300 190" aria-hidden="true" className="food-art">
      <ellipse cx="150" cy="155" rx="79" ry="12" fill="#27352a" opacity=".08" />
      {kind === "pizza" ? (
        <g transform="rotate(-12 150 100)">
          <path
            d="M87 54 Q150 24 217 54 L155 159Z"
            fill="#f6cf68"
            stroke="#6b4527"
            strokeWidth="3"
          />
          <path
            d="M87 54 Q150 24 217 54"
            fill="none"
            stroke="#c98d52"
            strokeWidth="19"
            strokeLinecap="round"
          />
          <path
            d="M98 60 Q150 39 204 59"
            fill="none"
            stroke="#f1b66f"
            strokeWidth="7"
            strokeLinecap="round"
          />
          <circle cx="133" cy="78" r="13" fill="#d96647" />
          <circle cx="177" cy="73" r="12" fill="#d96647" />
          <circle cx="153" cy="116" r="12" fill="#d96647" />
          <path
            d="M112 92 q12-11 13 4 M167 95 q14-8 14 5"
            fill="none"
            stroke="#6d8950"
            strokeWidth="5"
          />
        </g>
      ) : kind === "burger" ? (
        <g>
          <path
            d="M81 87 Q82 34 150 34 Q218 34 220 87Z"
            fill="#e7aa58"
            stroke="#805332"
            strokeWidth="3"
          />
          <path
            d="M82 139 Q85 159 108 160 H193 Q215 157 219 138"
            fill="#e7aa58"
            stroke="#805332"
            strokeWidth="3"
          />
          <rect x="76" y="115" width="149" height="23" rx="10" fill="#6d4133" />
          <path
            d="M77 103 L104 116 L127 103 L157 117 L180 102 L216 113 L223 93 H78Z"
            fill="#8fa85b"
          />
          <path d="M86 114 H216 L184 133 L153 115 L126 132Z" fill="#f3cb54" />
          <rect x="85" y="88" width="130" height="9" rx="4" fill="#ce6246" />
          {[116, 145, 176].map((x, i) => (
            <path
              key={x}
              d={`M${x} ${59 - (i % 2) * 10} l5 3`}
              stroke="#fff0cb"
              strokeWidth="4"
              strokeLinecap="round"
            />
          ))}
        </g>
      ) : kind === "noodle" ? (
        <g>
          <path
            d="M81 101 Q88 160 150 163 Q212 160 219 101Z"
            fill="#f6f1dc"
            stroke="#55546c"
            strokeWidth="3"
          />
          <ellipse
            cx="150"
            cy="101"
            rx="69"
            ry="20"
            fill="#bf724d"
            stroke="#55546c"
            strokeWidth="3"
          />
          <path
            d="M100 99 q15-20 27 0 t27 0 t28 0 t23 0 M104 107 q13-13 25 0 t24 0 t25 0"
            fill="none"
            stroke="#f2d58b"
            strokeWidth="5"
          />
          <path
            d="M153 82 L201 21 M166 85 L219 29"
            stroke="#77533e"
            strokeWidth="6"
            strokeLinecap="round"
          />
          <circle cx="119" cy="96" r="6" fill="#71945d" />
          <circle cx="183" cy="106" r="6" fill="#71945d" />
          <path
            d="M110 131 Q151 150 190 130"
            stroke="#df9a86"
            strokeWidth="4"
            fill="none"
          />
        </g>
      ) : kind === "salad" ? (
        <g>
          <path
            d="M77 103 Q92 163 151 163 Q208 163 223 103"
            fill="#f3efce"
            stroke="#56705a"
            strokeWidth="3"
          />
          {[
            [105, 84],
            [136, 70],
            [170, 73],
            [196, 89],
            [145, 103],
            [178, 103],
          ].map(([x, y], i) => (
            <ellipse
              key={x}
              cx={x}
              cy={y}
              rx="23"
              ry="18"
              transform={`rotate(${i * 20} ${x} ${y})`}
              fill={i % 2 ? "#71935d" : "#a5b76d"}
              stroke="#56705a"
              strokeWidth="2"
            />
          ))}
          <circle cx="119" cy="102" r="12" fill="#d87b56" />
          <circle cx="177" cy="87" r="12" fill="#d87b56" />
          <path
            d="M82 111 Q150 138 220 111"
            fill="#f3efce"
            stroke="#56705a"
            strokeWidth="3"
          />
        </g>
      ) : (
        <g>
          <ellipse cx="145" cy="155" rx="65" ry="9" fill="#f8ead6" />
          <path
            d="M185 83 Q228 76 215 111 Q208 129 185 126"
            stroke="#845d49"
            strokeWidth="10"
            fill="none"
          />
          <path
            d="M96 77 H191 L180 137 Q171 154 143 154 Q112 153 106 135Z"
            fill="#f7edda"
            stroke="#845d49"
            strokeWidth="3"
          />
          <ellipse
            cx="144"
            cy="77"
            rx="47"
            ry="12"
            fill="#986a4e"
            stroke="#845d49"
            strokeWidth="3"
          />
          <path
            d="M118 45 Q106 30 119 18 M146 49 Q134 30 146 17 M174 46 Q163 34 175 22"
            fill="none"
            stroke="#b28672"
            strokeWidth="4"
            strokeLinecap="round"
          />
          <path
            d="M135 108 Q141 97 147 108 Q154 98 159 108 Q161 117 146 127 Q130 118 135 108"
            fill="#d98670"
          />
        </g>
      )}
    </svg>
  );
}
