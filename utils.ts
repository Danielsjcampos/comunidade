
export const getNextSaturdays = (count: number = 4): string[] => {
  const saturdays: string[] = [];
  const date = new Date();
  
  // Find next Saturday
  while (date.getDay() !== 6) {
    date.setDate(date.getDate() + 1);
  }

  for (let i = 0; i < count; i++) {
    saturdays.push(date.toISOString().split('T')[0]);
    date.setDate(date.getDate() + 7);
  }

  return saturdays;
};

export const formatDateBR = (dateStr: string): string => {
  const [year, month, day] = dateStr.split('-');
  const date = new Date(Number(year), Number(month) - 1, Number(day));
  return date.toLocaleDateString('pt-BR', { 
    weekday: 'long', 
    day: 'numeric', 
    month: 'long' 
  });
};

export const formatDateShort = (dateStr: string): string => {
  const [year, month, day] = dateStr.split('-');
  return `${day}/${month}`;
};
