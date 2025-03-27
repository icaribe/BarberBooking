import { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Calendar } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface DateSelectorProps {
  selectedDate: Date | null;
  onSelect: (date: Date | null) => void;
}

const DateSelector = ({ selectedDate, onSelect }: DateSelectorProps) => {
  const [date, setDate] = useState<Date | undefined>(selectedDate || undefined);

  const handleSelect = (newDate: Date | undefined) => {
    setDate(newDate);
    onSelect(newDate || null);
  };

  // Disable past dates and Sundays
  const disabledDays = (date: Date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date < today || date.getDay() === 0;
  };

  return (
    <div>
      <h3 className="font-montserrat font-medium mb-2">Escolha a data</h3>
      <div className="bg-secondary p-3 rounded-lg">
        <Calendar
          mode="single"
          selected={date}
          onSelect={handleSelect}
          className="border-none"
          disabled={disabledDays}
          locale={ptBR}
          ISOWeek
          weekStartsOn={1} // Monday
          classNames={{
            day_selected: "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground",
            day_today: "bg-secondary text-foreground border border-primary",
            day_outside: "text-muted-foreground opacity-50",
            day_disabled: "text-muted-foreground opacity-50",
            day_range_middle: "rounded-none",
            day_hidden: "invisible",
            caption: "flex justify-center pt-1 relative items-center mb-2",
            caption_label: "text-sm font-medium",
            nav: "space-x-1 flex items-center",
            nav_button: "h-7 w-7 bg-transparent p-0 opacity-90 hover:opacity-100",
            nav_button_previous: "absolute left-1",
            nav_button_next: "absolute right-1",
            head_cell: "text-muted-foreground rounded-md w-9 font-normal text-[0.8rem]",
            table: "w-full border-collapse space-y-1",
            cell: "text-center text-sm relative p-0 focus-within:relative focus-within:z-20",
            day: "h-9 w-9 p-0 font-normal aria-selected:opacity-100 rounded-md",
            day_range_end: "rounded-r-md",
            day_range_start: "rounded-l-md",
          }}
        />
      </div>
    </div>
  );
};

export default DateSelector;
