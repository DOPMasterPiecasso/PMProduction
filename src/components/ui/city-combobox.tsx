"use client"

import * as React from "react"
import { Combobox } from "@base-ui/react/combobox"
import { cn } from "@/lib/utils"
import { CheckIcon, ChevronDownIcon, XIcon, SearchIcon } from "lucide-react"

interface City {
  id: string
  nama: string
  provinsi?: string
}

interface CityComboboxProps {
  cities: City[]
  value: string
  onChange: (value: string) => void
  placeholder?: string
  className?: string
  searchPlaceholder?: string
}

export function CityCombobox({
  cities,
  value,
  onChange,
  placeholder = "Semua Kota",
  className,
  searchPlaceholder = "Cari kota...",
}: CityComboboxProps) {
  const [open, setOpen] = React.useState(false)
  const selectedCity = cities.find((c) => c.id === value)

  return (
    <Combobox.Root
      value={value}
      onValueChange={(newVal) => {
        if (typeof newVal === "string") {
          onChange(newVal)
        }
      }}
      onOpenChange={setOpen}
      autoHighlight
    >
      <Combobox.GroupLabel hidden />
      <div
        className={cn(
          "relative flex items-center gap-1 rounded-lg border border-black/[0.08] bg-white text-[12px] text-[#18181B]",
          className
        )}
      >
        <div className="flex items-center gap-1.5 flex-1 pl-2.5 pr-1">
          <SearchIcon className="size-3.5 shrink-0 text-gray-400" />
          <Combobox.Input
            placeholder={placeholder}
            className="w-full bg-transparent py-2 pr-1 text-[12px] outline-none placeholder:text-gray-300"
            onFocus={() => setOpen(true)}
          />
        </div>
        <button
          type="button"
          tabIndex={-1}
          onClick={() => {
            if (value) {
              onChange("")
            }
          }}
          className={cn(
            "flex items-center justify-center rounded p-1 text-gray-400 hover:text-gray-600 transition-colors",
            !value && "hidden"
          )}
        >
          <XIcon className="size-3.5" />
        </button>
        <Combobox.Trigger className="flex items-center justify-center pr-2 pl-1 py-2 text-gray-400 cursor-pointer">
          <ChevronDownIcon
            className={cn("size-4 transition-transform", open && "rotate-180")}
          />
        </Combobox.Trigger>
      </div>

      <Combobox.Portal>
        <Combobox.Positioner
          side="bottom"
          sideOffset={4}
          align="start"
          className="isolate z-50"
        >
          <Combobox.Popup className="relative isolate z-50 max-h-64 w-(--anchor-width) min-w-48 origin-(--transform-origin) overflow-x-hidden overflow-y-auto rounded-lg bg-white shadow-md ring-1 ring-foreground/10 duration-100 data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95 data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-95">
            <Combobox.List className="scroll-my-1 p-1">
              {cities.map((city) => (
                <Combobox.Item
                  key={city.id}
                  value={city.id}
                  className={cn(
                    "relative flex w-full cursor-default items-center gap-2 rounded-md py-1.5 pr-8 pl-2 text-[12px] outline-hidden select-none",
                    "data-highlighted:bg-gray-100 focus:bg-gray-100",
                    "data-disabled:pointer-events-none data-disabled:opacity-50"
                  )}
                >
                  <div className="flex flex-1 flex-col">
                    <span>{city.nama}</span>
                    {city.provinsi && (
                      <span className="text-[10px] text-gray-400">{city.provinsi}</span>
                    )}
                  </div>
                  <Combobox.ItemIndicator
                    render={
                      <span className="pointer-events-none absolute right-2 flex size-4 items-center justify-center">
                        <CheckIcon className="size-3.5 text-blue-600" />
                      </span>
                    }
                  />
                </Combobox.Item>
              ))}
            </Combobox.List>

            <Combobox.Empty>
              <div className="px-2 py-4 text-center text-[12px] text-gray-400">
                Kota tidak ditemukan
              </div>
            </Combobox.Empty>
          </Combobox.Popup>
        </Combobox.Positioner>
      </Combobox.Portal>
    </Combobox.Root>
  )
}
