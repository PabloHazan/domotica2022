export const Day = (date: Date = new Date()) => {
    const day = new Date(date);
    day.setHours(0, 0, 0, 0);
    return day
}
