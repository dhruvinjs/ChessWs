import React, { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { ChevronLeft, ChevronRight } from "lucide-react"

export type Testimonial = {
  quote: string
  author: string
  title?: string
  image?: string
}

type Props = {
  testimonials: Testimonial[]
}

export function TestimonialCarousel({ testimonials }: Props) {
  const [index, setIndex] = useState(0)
  const total = testimonials.length

  const prev = () => setIndex((i) => (i - 1 + total) % total)
  const next = () => setIndex((i) => (i + 1) % total)

  const { quote, author, title, image } = testimonials[index]

  return (
    <div className="relative max-w-3xl mx-auto">
      {/* Slide */}
      <AnimatePresence initial={false}>
        <motion.div
          key={index}
          className="flex flex-col md:flex-row items-center bg-brown-700 rounded-xl p-8 shadow-xl text-cream"
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -50 }}
          transition={{ duration: 0.5 }}
        >
          {image && (
            <img
              src={image}
              alt={author}
              className="w-24 h-24 rounded-full object-cover mr-6 hidden md:block"
            />
          )}
          <div>
            <p className="italic text-lg">“{quote}”</p>
            <p className="mt-4 font-semibold">{author}</p>
            {title && <p className="text-sm text-cream/80">{title}</p>}
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Controls */}
      <button
        onClick={prev}
        aria-label="Previous"
        className="absolute top-1/2 left-0 transform -translate-y-1/2 p-2 rounded-full bg-brown-800 hover:bg-brown-700 transition"
      >
        <ChevronLeft size={24} className="text-cream" />
      </button>
      <button
        onClick={next}
        aria-label="Next"
        className="absolute top-1/2 right-0 transform -translate-y-1/2 p-2 rounded-full bg-brown-800 hover:bg-brown-700 transition"
      >
        <ChevronRight size={24} className="text-cream" />
      </button>

      {/* Indicators */}
      <div className="flex justify-center mt-4 space-x-2">
        {testimonials.map((_, i) => (
          <button
            key={i}
            onClick={() => setIndex(i)}
            className={`w-3 h-3 rounded-full transition ${
              i === index ? "bg-gold-500" : "bg-cream/50"
            }`}
            aria-label={`Show testimonial ${i + 1}`}
          />
        ))}
      </div>
    </div>
  )
}
