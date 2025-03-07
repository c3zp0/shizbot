enum TimePartsEnum {
    SECONDS = 's',
    MINUTES = 'm',
    HOURS = 'h',
    DAYS = 'd',
}

export function parseSecondsIntoTimeString(seconds: number) {
    const d = Math.floor(seconds / (3600 * 24));
    const h = Math.floor((seconds % (3600 * 24)) / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = Math.floor(seconds % 60);

    const dDisplay =
        d > 0
            ? d +
              ' ' +
              parseAmountInString(d, {
                  one: 'день',
                  second: 'дня',
                  many: 'дней',
              })
            : '';
    const hDisplay =
        h > 0
            ? h +
              ' ' +
              parseAmountInString(h, {
                  one: 'час',
                  second: 'часа',
                  many: 'часов',
              })
            : '';
    const mDisplay =
        m > 0
            ? m +
              ' ' +
              parseAmountInString(m, {
                  one: 'минута',
                  second: 'минуты',
                  many: 'минут',
              })
            : '';
    const sDisplay =
        s > 0
            ? s +
              ' ' +
              parseAmountInString(s, {
                  one: 'секунда',
                  second: 'секунды',
                  many: 'секунд',
              })
            : '';
    return `${dDisplay} ${hDisplay} ${mDisplay} ${sDisplay}`.trim();
}

function parseAmountInString(
    amount: number,
    aliases: { one: string; second: string; many: string },
) {
    switch (amount % 10) {
        case 1: {
            return aliases.one;
        }
        case 2:
        case 3:
        case 4: {
            return aliases.second;
        }
        default: {
            return aliases.many;
        }
    }
}

export const MonthMapRu = {
    '1': 'Январь',
    '2': 'Февраль',
    '3': 'Март',
    '4': 'Апрель',
    '5': 'Май',
    '6': 'Июнь',
    '7': 'Июль',
    '8': 'Август',
    '9': 'Сентябь',
    '10': 'Октябрь',
    '11': 'Ноябрь',
    '12': 'Декабрь',
};
