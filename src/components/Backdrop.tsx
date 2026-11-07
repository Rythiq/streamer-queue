export function Backdrop() {
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
      <div className="absolute inset-0 bg-ink" />
      <div className="grid-lines absolute inset-0" />
      <div className="absolute -top-56 left-1/2 h-[42rem] w-[64rem] -translate-x-1/2 rounded-[100%] bg-[radial-gradient(closest-side,rgba(201,255,63,0.075),transparent)]" />
      <div className="absolute -right-40 top-1/3 size-[34rem] rounded-full bg-[radial-gradient(closest-side,rgba(87,231,255,0.06),transparent)]" />
      <div className="absolute -left-48 top-2/3 size-[30rem] rounded-full bg-[radial-gradient(closest-side,rgba(201,255,63,0.035),transparent)]" />
      <div className="noise absolute inset-0" />
    </div>
  )
}
