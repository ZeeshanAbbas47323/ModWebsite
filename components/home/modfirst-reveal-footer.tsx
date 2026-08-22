"use client"

import Image from "next/image"
import { useEffect, useRef, useState } from "react"

export function ModfirstRevealFooter() {
  const [height, setHeight] = useState(0)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (ref.current) {
      setHeight(ref.current.clientHeight)
    }
    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setHeight(entry.target.clientHeight)
      }
    })
    if (ref.current) observer.observe(ref.current)
    return () => observer.disconnect()
  }, [])

  return (
    <>
      {/* Spacer to push the scroll area so we can reveal the fixed footer */}
      <div style={{ height: height }} className="w-full relative z-0" />

      {/* The actual fixed footer that stays at the bottom */}
      <div
        ref={ref}
        className="fixed bottom-0 left-0 w-full z-[-1] flex items-center justify-center bg-linear-to-t from-primary to-white overflow-hidden"
      >
        {/* Vertical stripe pattern with wider gaps and fade gradient */}
        <div
          className="absolute inset-0 opacity-15"
          style={{
            backgroundImage: "repeating-linear-gradient(90deg, transparent, transparent 10px, #000 10px, #000 11px)",
            maskImage: "linear-gradient(to bottom, transparent 0%, black 100%)",
            WebkitMaskImage: "linear-gradient(to bottom, transparent 0%, black 100%)"
          }}
        />

        <div className="w-full h-full min-h-[40vh] pt-16 md:pt-24 lg:pt-32 pb-4 flex justify-center items-end relative z-10 px-4 md:px-8">
          <Image 
            src="/images/branding/logo-dark-lg.svg" 
            alt="Modfirst Logo" 
            width={1200} 
            height={400} 
            className="w-full max-w-[1600px] h-auto" 
            priority
          />
        </div>
      </div>
    </>
  )
}
