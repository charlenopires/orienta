import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import type { ChecklistItem as ChecklistItemType } from "@/lib/checklist-data"

interface ChecklistItemProps {
  item: ChecklistItemType
  answer: boolean | null
  observation: string
  onAnswerChange: (answer: boolean) => void
  onObservationChange: (text: string) => void
}

export function ChecklistItem({
  item,
  answer,
  observation,
  onAnswerChange,
  onObservationChange,
}: ChecklistItemProps) {
  const radioValue = answer === null ? "" : answer ? "sim" : "nao"

  return (
    <div className="space-y-2 rounded-md border border-border p-3">
      <div className="flex items-start justify-between gap-4">
        <p className="flex-1 text-sm leading-relaxed">{item.question}</p>
        <RadioGroup
          value={radioValue}
          onValueChange={(v) => onAnswerChange(v === "sim")}
          className="flex items-center gap-3 shrink-0"
        >
          <div className="flex items-center gap-1.5">
            <RadioGroupItem value="sim" id={`${item.id}-sim`} />
            <Label htmlFor={`${item.id}-sim`} className="text-sm cursor-pointer">
              Sim
            </Label>
          </div>
          <div className="flex items-center gap-1.5">
            <RadioGroupItem value="nao" id={`${item.id}-nao`} />
            <Label htmlFor={`${item.id}-nao`} className="text-sm cursor-pointer">
              Não
            </Label>
          </div>
        </RadioGroup>
      </div>
      <div
        className="grid transition-all duration-200 ease-in-out"
        style={{
          gridTemplateRows: answer === false ? "1fr" : "0fr",
        }}
      >
        <div className="overflow-hidden">
          <Textarea
            placeholder="Descreva o que precisa ser corrigido..."
            value={observation}
            onChange={(e) => onObservationChange(e.target.value)}
            className="mt-1 min-h-[60px] resize-none"
          />
        </div>
      </div>
    </div>
  )
}
