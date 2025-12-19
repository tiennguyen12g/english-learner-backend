export default function GetCurrentTime() {
    const currentDate = new Date();
    const day = String(currentDate.getDate()).padStart(2, '0');
    const month = String(currentDate.getMonth() + 1).padStart(2, '0'); // Months are zero-based
    const year = currentDate.getFullYear();
    const hour = currentDate.getHours();
    const minute = currentDate.getMinutes();
    const second = currentDate.getSeconds();

    const day_month_year = `${day}/${month}/${year}`;
    const fullDateFormat = `${hour}:${minute}:${second} ${day}/${month}/${year}`;
    return {day_month_year: day_month_year, fullDateFormat: fullDateFormat};
}