'use client'

import * as React from 'react'
import Image from 'next/image'
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel'
import { Card, CardContent } from '@/components/ui/card'

interface InstagramCarouselProps {
  images: { url: string; alt: string }[]
}

export function InstagramCarousel({ images }: InstagramCarouselProps) {
  if (!images || images.length === 0) {
    return (
      <div className="flex aspect-square w-full items-center justify-center rounded-md border border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-900">
        <p className="text-sm text-slate-500">No media available</p>
      </div>
    )
  }

  return (
    <Carousel className="w-full max-w-sm mx-auto">
      <CarouselContent>
        {images.map((image, index) => (
          <CarouselItem key={index}>
            <div className="p-1">
              <Card className="overflow-hidden border-none shadow-none rounded-sm">
                <CardContent className="flex aspect-square items-center justify-center p-0 relative bg-slate-100 dark:bg-slate-800">
                  <div className="absolute inset-0 flex items-center justify-center">
                    {/* Placeholder content for the demo if image URL is a generic placeholder */}
                    <span className="text-2xl font-semibold text-slate-300 dark:text-slate-600 select-none">Slide {index + 1}</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </CarouselItem>
        ))}
      </CarouselContent>
      <CarouselPrevious className="left-2" />
      <CarouselNext className="right-2" />
      
      {/* Pagination Indicators */}
      <div className="flex justify-center gap-1.5 mt-3">
        {images.map((_, i) => (
          <div key={i} className="h-1.5 w-1.5 rounded-full bg-slate-300 dark:bg-slate-600" />
        ))}
      </div>
    </Carousel>
  )
}
