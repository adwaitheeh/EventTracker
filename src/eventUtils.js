
export function getEventStatus(event, now) {
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
export function getTimeRemaining(event,now){
    const start= new Date(`${event.date} {event.startTime}`);
}
