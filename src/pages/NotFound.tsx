import { ArrowLeft } from 'lucide-react'
import { Link } from 'react-router-dom'
import { buttonClass } from '../components/buttonStyles'
import { Corners } from '../components/Corners'
import { Shell } from '../components/Shell'

export default function NotFound() {
  return (
    <Shell max="viewer">
      <div className="panel relative overflow-hidden rounded-3xl p-8 text-center sm:p-12">
        <Corners tone="neutral" />
        <p className="num bg-gradient-to-b from-white/30 to-white/[0.04] bg-clip-text text-[clamp(4rem,18vw,7rem)] font-bold leading-none text-transparent">
          404
        </p>
        <p className="eyebrow mt-5">Off the board</p>
        <h1 className="display mt-3 text-3xl sm:text-4xl">This page isn’t in the line.</h1>
        <p className="mx-auto mt-3 max-w-sm text-sm leading-relaxed text-fog">
          The address doesn’t match a queue or a console. Double-check the link, or start a
          fresh queue.
        </p>
        <div className="mt-6 flex justify-center">
          <Link to="/" className={buttonClass('primary')}>
            <ArrowLeft aria-hidden className="size-4" />
            Back home
          </Link>
        </div>
      </div>
    </Shell>
  )
}
