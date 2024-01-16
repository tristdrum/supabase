import { Check, ChevronsUpDown } from 'lucide-react'
import { noop } from 'lodash'
import { useState } from 'react'
import {
  Button_Shadcn_ as Button,
  Popover_Shadcn_ as Popover,
  PopoverTrigger_Shadcn_ as PopoverTrigger,
  PopoverContent_Shadcn_ as PopoverContent,
  Command_Shadcn_ as Command,
  CommandInput_Shadcn_ as CommandInput,
  CommandEmpty_Shadcn_ as CommandEmpty,
  CommandItem_Shadcn_ as CommandItem,
  CommandGroup_Shadcn_ as CommandGroup,
  cn,
  ScrollArea,
} from 'ui'

export interface ComboBoxOption {
  id: string
  value: string
  displayName: string
}

export function ComboBox<Opt extends ComboBoxOption>({
  isLoading,
  disabled,
  name,
  options,
  selectedOption,
  onSelectOption = noop,
  className,
}: {
  isLoading: boolean
  disabled?: boolean
  name: string
  options: Opt[]
  selectedOption?: string
  onSelectOption?: (newValue: string) => void
  className?: string
}) {
  const [open, setOpen] = useState(false)

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <div className={className}>
        <PopoverTrigger asChild aria-label={`Select ${name}`} disabled={disabled}>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className={cn(
              'overflow-hidden',
              'h-auto min-h-10',
              'flex justify-between',
              'border-none',
              'py-0 pl-0 pr-1 text-left'
            )}
          >
            {isLoading ? 'Loading...' : selectedOption ?? `Select a ${name}...`}
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
      </div>
      <PopoverContent className="z-[999999] p-0" side="bottom">
        <Command>
          <CommandInput placeholder="Search project..." className="border-none ring-0" />
          <CommandEmpty>No project found.</CommandEmpty>
          <CommandGroup>
            <ScrollArea className={options.length > 10 ? 'h-[280px]' : ''}>
              {options.map((option) => (
                <CommandItem
                  key={option.id}
                  value={option.value}
                  onSelect={(selectedValue: string) => {
                    setOpen(false)
                    onSelectOption(selectedValue)
                  }}
                  className="cursor-pointer"
                >
                  <Check
                    className={cn(
                      'mr-2 h-4 w-4',
                      selectedOption === option.value ? 'opacity-100' : 'opacity-0'
                    )}
                  />
                  {option.displayName}
                </CommandItem>
              ))}
            </ScrollArea>
          </CommandGroup>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
