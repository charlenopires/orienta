import { useState } from "react"
import { Check, ChevronsUpDown } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import type { Student } from "@/lib/types"

interface StudentComboboxProps {
  students: Student[]
  value: string | null
  onChange: (studentId: string | null) => void
}

export function StudentCombobox({ students, value, onChange }: StudentComboboxProps) {
  const [open, setOpen] = useState(false)
  const selected = students.find((s) => s.id === value)

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between"
        >
          {selected ? (
            <span className="truncate">
              {selected.name} — {selected.course}
            </span>
          ) : (
            <span className="text-muted-foreground">Selecione um aluno...</span>
          )}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
        <Command>
          <CommandInput placeholder="Buscar aluno..." />
          <CommandList>
            <CommandEmpty>Nenhum aluno encontrado.</CommandEmpty>
            <CommandGroup>
              {students.map((student) => (
                <CommandItem
                  key={student.id}
                  value={`${student.name} ${student.course}`}
                  onSelect={() => {
                    onChange(student.id === value ? null : student.id)
                    setOpen(false)
                  }}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      value === student.id ? "opacity-100" : "opacity-0",
                    )}
                  />
                  <div className="flex flex-col">
                    <span>{student.name}</span>
                    <span className="text-xs text-muted-foreground">{student.course}</span>
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
