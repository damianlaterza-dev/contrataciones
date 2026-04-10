"use client";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { DateRange } from "react-day-picker";
import { CalendarIcon } from "lucide-react";

interface Props {
  value?: DateRange;
  onChange: (range: DateRange | undefined) => void;
}

export function DatePickerRange({ value, onChange }: Props) {
  const handleReset = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange(undefined);
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          data-empty={!value}
          className="data-[empty=true]:text-muted-foreground w-full justify-between text-left font-normal">
          <span className="text-sm">
            {!value?.from
              ? "Seleccioná las fechas"
              : value.to
                ? `${format(value.from, "LLL dd, y", { locale: es })} - ${format(value.to, "LLL dd, y", { locale: es })}`
                : format(value.from, "LLL dd, y", { locale: es })}
          </span>
          <CalendarIcon size={14}/>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          locale={es}
          mode="range"
          selected={value}
          onSelect={onChange}
          defaultMonth={value?.from}
          numberOfMonths={1}
        />
        <div className="flex items-center justify-end w-full">
          <Button size={"sm"} className="mx-4 mb-4" onClick={handleReset}>
            Limpiar
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
