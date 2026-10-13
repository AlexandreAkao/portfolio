/**
 * Akira drawn as a 1960s TV cartoon: round wire glasses, the dark swept fringe,
 * the white sherpa collar (the cartoon collar of the era) on a black puffer.
 * Drawn the way cels were printed: every colour is a flat plate set a few units
 * off the ink line, and the line boils through three inkings (see cartoon.css).
 * Decorative: the name is always on the page as text.
 */

type Pose = 'roller' | 'wave' | 'peek' | 'point' | 'teacher';

const INK = '#121212';
const SKIN = '#f4c9a0';
const HAIR = '#1b1716';
const SHINE = '#3d4470';
const JACKET = '#25272f';
const QUILT = '#3e4250';
const PAPER = '#fbfbfb';
const SCARF = '#2b3a5c';
const KNIT = '#40507a';
const JEANS = '#2f4f86';
const SHOE = '#5a3524';
const WOOD = '#d39a4a';
const CAP = '#1e1e24';
const TASSEL = '#f3c623';

/** A coloured plate printed off register under its ink line. */
function Part({ d, fill, w = 3.4 }: { d: string; fill: string; w?: number }) {
  return (
    <>
      <path d={d} fill={fill} transform="translate(3 2.5)" />
      <path d={d} fill="none" stroke={INK} strokeWidth={w} strokeLinejoin="round" strokeLinecap="round" />
    </>
  );
}

/** A line in register: details drawn straight onto the cel. */
function Line({ d, color = INK, w = 3 }: { d: string; color?: string; w?: number }) {
  return <path d={d} fill="none" stroke={color} strokeWidth={w} strokeLinecap="round" strokeLinejoin="round" />;
}

function Torso() {
  return (
    <>
      <Part fill={JACKET} w={4} d="M132 236 C116 238 108 250 106 264 C100 276 104 288 110 292 C102 300 102 316 110 322 C104 330 104 346 114 352 C150 364 226 364 262 352 C272 346 272 330 266 322 C274 316 274 300 266 292 C272 288 276 276 268 264 C266 250 258 238 242 236 Z" />
      <Line color={QUILT} d="M112 292 C150 301 226 301 264 292 M112 322 C150 331 226 331 264 322" />
      <Part fill={SKIN} d="M170 200 L168 238 L206 238 L204 200 Z" />
      <Part fill={PAPER} d="M152 216 C136 220 122 230 116 246 a9 9 0 0 0 6 14 a9 9 0 0 0 10 10 a9 9 0 0 0 14 6 a9 9 0 0 0 14 4 L182 292 L172 244 C168 232 162 222 152 216 Z" />
      <Part fill={PAPER} d="M222 216 C238 220 252 230 258 246 a9 9 0 0 1 -6 14 a9 9 0 0 1 -10 10 a9 9 0 0 1 -14 6 a9 9 0 0 1 -14 4 L192 292 L202 244 C206 232 212 222 222 216 Z" />
      <Part fill={SCARF} d="M166 228 C178 240 198 240 210 228 L212 244 C198 256 176 256 164 244 Z" />
      <Part fill={SCARF} d="M172 250 L188 254 L186 336 L168 334 Z" />
      <Line color={KNIT} w={2.5} d="M171 276 L186 278 M170 298 L186 300 M169 318 L185 320" />
    </>
  );
}

function Head() {
  return (
    <>
      <Part fill={SKIN} d="M138 140 C124 134 122 162 138 166 Z" />
      <Part fill={SKIN} d="M236 140 C250 134 252 162 236 166 Z" />
      <Part fill={SKIN} d="M136 96 C132 128 134 162 146 184 C156 202 172 212 188 212 C204 212 220 202 230 184 C242 162 244 128 240 96 Z" />
      <Part fill={HAIR} w={4} d="M128 160 C116 132 114 96 126 70 C140 42 172 26 204 30 C236 34 258 58 258 92 C258 118 252 140 244 160 L238 122 C232 116 226 112 222 110 C214 116 204 124 196 136 C198 124 196 116 192 110 C182 120 172 130 158 142 C163 128 163 118 160 112 C152 122 146 134 140 150 L134 160 Z" />
      <path d="M150 58 C172 44 206 42 230 56 C206 50 176 52 156 64 Z" fill={SHINE} />
      {/* Eyes open, and the same eyes shut for the blink */}
      <g className="cartoon-eyes">
        <ellipse cx="166" cy="156" rx="4.4" ry="5.4" fill={INK} />
        <ellipse cx="208" cy="156" rx="4.4" ry="5.4" fill={INK} />
        <Line w={2.6} d="M158 151 Q166 146 174 151 M200 151 Q208 146 216 151" />
      </g>
      <g className="cartoon-eyes-shut">
        <Line w={2.8} d="M158 155 Q166 160 174 155 M200 155 Q208 160 216 155" />
      </g>
      <Line w={3.2} d="M147 153 a18 18 0 1 0 36 0 a18 18 0 1 0 -36 0 M191 153 a18 18 0 1 0 36 0 a18 18 0 1 0 -36 0" />
      <Line d="M183 150 Q187 145 191 150 M147 149 L138 146 M227 149 L236 146" />
      <Line color={PAPER} w={2.5} d="M171 140 Q177 143 179 149 M215 140 Q221 143 223 149" />
      <Line d="M189 160 C187 170 184 174 186 178 C188 180 193 180 196 178" />
      <Line w={3.4} d="M172 192 Q188 202 204 191 M169 189 L172 192 M204 191 L207 188" />
    </>
  );
}

/** The roller painter: a long pole in both hands, the roller standing at his left on the ground line. */
function Roller() {
  return (
    <>
      <Line w={4} d="M80 348 L52 348 C46 348 44 352 44 356 L44 364" />
      <Part fill={PAPER} d="M30 374 C30 366 36 362 44 362 C52 362 58 366 58 374 L58 420 C58 428 52 432 44 432 C36 432 30 428 30 420 Z" />
      <Line color="#dcdcdc" w={3.5} d="M37 372 L37 424" />
      <Part fill={JEANS} d="M152 350 L150 420 L167 420 L170 350 Z" />
      <Part fill={JEANS} d="M204 350 L207 420 L224 420 L222 350 Z" />
      <Part fill={SHOE} d="M130 432 C128 422 140 415 154 415 C165 415 171 422 171 432 Z" />
      <Part fill={SHOE} d="M204 432 C204 422 212 415 226 415 C240 415 247 422 245 432 Z" />
      <Torso />
      <Line w={10} d="M80 348 L200 258" />
      <Line color={WOOD} w={5} d="M80 348 L200 258" />
      <Part fill={JACKET} d="M118 248 C104 262 100 290 108 310 C112 320 126 322 132 314 C128 296 128 276 134 258 Z" />
      <Part fill={SKIN} d="M108 318 C106 308 116 302 126 306 C136 310 136 322 128 328 C120 332 110 326 108 318 Z" />
      <Part fill={JACKET} d="M252 246 C268 260 266 290 244 298 C224 304 204 294 186 282 L194 262 C212 272 228 274 238 266 Z" />
      <Part fill={SKIN} d="M172 268 C172 256 186 252 194 260 C202 268 198 282 188 284 C178 286 172 278 172 268 Z" />
      <Head />
    </>
  );
}

/** Waving goodbye: the open hand swings on its wrist (cartoon.css). */
function Wave() {
  return (
    <>
      <Torso />
      <g className="cartoon-wave">
        <Part fill={JACKET} d="M244 250 C262 236 274 214 276 192 L300 196 C300 226 284 256 262 270 Z" />
        <Part fill={SKIN} d="M276 196 C266 192 264 178 270 170 L268 148 C268 142 276 142 277 148 L279 164 L280 140 C280 133 289 133 289 140 L289 162 L292 144 C293 137 301 138 301 145 L299 166 L306 156 C310 151 316 156 313 162 L302 186 C298 196 286 200 276 196 Z" />
      </g>
      <Head />
    </>
  );
}

/** Hands over a ledge at y 214: the title's top edge, which he holds on to. */
function Peek() {
  return (
    <>
      <Head />
      <Part fill={SKIN} d="M118 214 C118 204 126 199 140 199 C154 199 162 205 162 214 L162 222 C162 228 157 230 152 228 C148 231 142 231 139 228 C135 231 129 231 126 228 C121 230 118 227 118 222 Z" />
      <Line w={2.6} d="M129 216 L128 227 M140 216 L139 228 M151 216 L151 227" />
      <Part fill={SKIN} d="M258 214 C258 204 250 199 236 199 C222 199 214 205 214 214 L214 222 C214 228 219 230 224 228 C228 231 234 231 237 228 C241 231 247 231 250 228 C255 230 258 227 258 222 Z" />
      <Line w={2.6} d="M247 216 L248 227 M236 216 L237 228 M225 216 L225 227" />
    </>
  );
}

/** The mortarboard, for the teacher at Education's blackboard. */
function Mortarboard() {
  return (
    <>
      <Part fill={CAP} d="M172 44 L172 62 C190 70 222 70 240 62 L240 44 Z" />
      <Part fill={CAP} d="M144 36 L206 13 L268 36 L206 59 Z" />
      <Line color={TASSEL} w={3} d="M206 36 L254 46 L256 76" />
      <Part fill={TASSEL} d="M250 75 L262 75 L265 94 L247 94 Z" />
    </>
  );
}

/** Pointing at the Email ticket beside him. */
function Point() {
  return (
    <>
      <Torso />
      <Part fill={JACKET} d="M118 248 C104 262 100 300 106 336 L124 338 C122 304 126 276 134 258 Z" />
      <Part fill={SKIN} d="M103 338 C101 328 111 324 119 328 C127 332 127 344 119 348 C111 350 103 346 103 338 Z" />
      <Part fill={JACKET} d="M246 246 C270 238 296 236 318 238 L320 264 C298 264 272 268 252 276 Z" />
      <Part fill={SKIN} d="M316 238 C324 232 334 234 338 239 L358 237 C365 237 365 246 358 247 L340 249 C340 257 331 262 321 260 C314 258 312 248 316 238 Z" />
      <Line w={2.6} d="M327 238 C326 231 334 230 335 238 M324 250 L336 249" />
      <Head />
    </>
  );
}

const views: Record<Pose, string> = {
  roller: '0 0 280 440',
  wave: '100 20 222 300',
  peek: '106 20 164 214',
  point: '96 20 272 350',
  teacher: '96 8 272 362',
};

interface Props {
  pose: Pose;
  className?: string;
}

export default function Caricature({ pose, className = '' }: Props) {
  return (
    <svg viewBox={views[pose]} className={`cartoon-char ${className}`} aria-hidden="true" focusable="false">
      <g className="cartoon-ink">
        {pose === 'roller' && <Roller />}
        {pose === 'wave' && <Wave />}
        {pose === 'peek' && <Peek />}
        {(pose === 'point' || pose === 'teacher') && <Point />}
        {pose === 'teacher' && <Mortarboard />}
      </g>
    </svg>
  );
}

/** The inkings the line boils through; rendered once on the page, beside the hero. */
export function CartoonInks() {
  return (
    <svg width="0" height="0" className="cartoon-defs" aria-hidden="true" focusable="false">
      {[3, 11, 23].map((seed, i) => (
        <filter key={seed} id={`cartoon-ink-${i}`} x="-5%" y="-5%" width="110%" height="110%">
          <feTurbulence type="fractalNoise" baseFrequency="0.04" numOctaves="2" seed={seed} />
          <feDisplacementMap in="SourceGraphic" scale="2.6" />
        </filter>
      ))}
    </svg>
  );
}
