
export function getEventStatus(event, now) {
    if(event.adminStatus === "LIVE NOW"){
        return "LIVE NOW";
    }
    if(event.adminStatus==="ENDED"){
        return "ENDED";
    }
    const start = new Date(`${event.date} ${event.startTime}`);
    const end = new Date(`${event.date} ${event.endTime}`);

    const thirtyMinutesBefore =
        start.getTime() - 30 * 60 * 1000;

    if (now < thirtyMinutesBefore) {
        return "UPCOMING";
    }

    if (now >= thirtyMinutesBefore && now < start) {
        return "STARTING SOON";
    }

    if (now >= start && now <= end) {
        return "LIVE NOW";
    }

    return "ENDED";
}

export function getTimeRemaining(event, now) {
  const dateParts = event.date.split("-").map(Number);

  let year, month, day;

  if (dateParts[0] > 31) {
    [year, month, day] = dateParts;
  } else {
    [day, month, year] = dateParts;
  }

  const [startHours, startMinutes] =
    event.startTime.split(":").map(Number);

  const start = new Date(
    year,
    month - 1,
    day,
    startHours,
    startMinutes
  );

  if (Number.isNaN(start.getTime())) {
    console.error("Invalid event date or time:", event.date, event.startTime);
    return null;
  }

  const difference = start.getTime() - now.getTime();

  if (difference <= 0) {
    return null;
  }

  const totalSeconds = Math.floor(difference / 1000);

  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  return { days, hours, minutes, seconds };
}

