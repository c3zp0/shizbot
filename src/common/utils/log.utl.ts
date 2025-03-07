export const logMessageGenerator = (
    topic: string,
    place: string,
    reason: string,
    uniqueString?: string,
): string =>
    `${topic.toLowerCase()} ${uniqueString || ''} in ${place} is ${reason}`;
