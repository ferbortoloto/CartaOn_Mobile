export const WeekDays = {
  SUNDAY: 0,
  MONDAY: 1,
  TUESDAY: 2,
  WEDNESDAY: 3,
  THURSDAY: 4,
  FRIDAY: 5,
  SATURDAY: 6,
};

export const WeekDaysNames = {
  [WeekDays.SUNDAY]: 'Domingo',
  [WeekDays.MONDAY]: 'Segunda',
  [WeekDays.TUESDAY]: 'Terça',
  [WeekDays.WEDNESDAY]: 'Quarta',
  [WeekDays.THURSDAY]: 'Quinta',
  [WeekDays.FRIDAY]: 'Sexta',
  [WeekDays.SATURDAY]: 'Sábado',
};

export const WeekDaysShort = {
  [WeekDays.SUNDAY]: 'Dom',
  [WeekDays.MONDAY]: 'Seg',
  [WeekDays.TUESDAY]: 'Ter',
  [WeekDays.WEDNESDAY]: 'Qua',
  [WeekDays.THURSDAY]: 'Qui',
  [WeekDays.FRIDAY]: 'Sex',
  [WeekDays.SATURDAY]: 'Sáb',
};

export const TimeSlots = [
  '06:00', '06:30', '07:00', '07:30', '08:00', '08:30', '09:00', '09:30',
  '10:00', '10:30', '11:00', '11:30', '12:00', '12:30', '13:00', '13:30',
  '14:00', '14:30', '15:00', '15:30', '16:00', '16:30', '17:00', '17:30',
  '18:00', '18:30', '19:00', '19:30', '20:00', '20:30', '21:00', '21:30',
  '22:00', '22:30',
];

export const initialAvailability = {
  [WeekDays.MONDAY]: ['08:00', '08:30', '09:00', '09:30', '10:00', '10:30', '14:00', '14:30', '15:00', '15:30', '16:00', '16:30'],
  [WeekDays.TUESDAY]: ['08:00', '08:30', '09:00', '09:30', '10:00', '10:30', '14:00', '14:30', '15:00', '15:30', '16:00', '16:30'],
  [WeekDays.WEDNESDAY]: ['08:00', '08:30', '09:00', '09:30', '10:00', '10:30', '14:00', '14:30', '15:00', '15:30', '16:00', '16:30'],
  [WeekDays.THURSDAY]: ['08:00', '08:30', '09:00', '09:30', '10:00', '10:30', '14:00', '14:30', '15:00', '15:30', '16:00', '16:30'],
  [WeekDays.FRIDAY]: ['08:00', '08:30', '09:00', '09:30', '10:00', '10:30', '14:00', '14:30', '15:00', '15:30', '16:00', '16:30'],
  [WeekDays.SATURDAY]: ['09:00', '09:30', '10:00', '10:30', '11:00', '11:30'],
  [WeekDays.SUNDAY]: [],
};

export const toggleTimeAvailability = (availability, dayOfWeek, time) => {
  const newAvailability = { ...availability };
  if (!newAvailability[dayOfWeek]) newAvailability[dayOfWeek] = [];
  const idx = newAvailability[dayOfWeek].indexOf(time);
  if (idx > -1) {
    newAvailability[dayOfWeek] = newAvailability[dayOfWeek].filter(t => t !== time);
  } else {
    newAvailability[dayOfWeek] = [...newAvailability[dayOfWeek], time].sort();
  }
  return newAvailability;
};
