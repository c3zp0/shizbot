import { RedisClientType } from 'redis';

export default class PhraseService {
    MAX_SENTENCE_LENGTH = 300;

    constructor(private readonly client: RedisClientType) {}

    // @TODO добавить мультиязычность + проверить регулярку
    extractWords(message: string): string[] {
        return message
            .toLowerCase()
            .replace(/[^а-яё\s]/gi, '')
            .split(/\s+/);
    }

    private async updateSequences(words: string[]) {
        // нужно записывать ееще последовательности по 2 слова со старта
        for (let i = 0; i < words.length - 1; i++) {
            const baseWord = words[i];
            const baseWordWith2Words = `${baseWord} ${words[i + 1]}`;

            let sequenceFrom1WordWith1Words = null,
                sequenceFrom1WordWith2Words = null,
                sequenceFrom1WordWith3Words = null,
                sequenceFrom2WordWith1Words = null,
                sequenceFrom2WordWith2Words = null;

            sequenceFrom1WordWith1Words = words[i + 1];

            if (i < words.length - 2) {
                sequenceFrom1WordWith2Words = `${sequenceFrom1WordWith1Words} ${words[i + 2]}`;
                sequenceFrom2WordWith1Words = words[i + 2];
            }

            if (i < words.length - 3) {
                sequenceFrom1WordWith3Words = `${sequenceFrom1WordWith2Words} ${words[i + 3]}`;
                sequenceFrom2WordWith2Words = `${sequenceFrom2WordWith1Words} ${words[i + 3]}`;
            }

            const baseWordPairs = [
                sequenceFrom1WordWith1Words,
                sequenceFrom1WordWith2Words,
                sequenceFrom1WordWith3Words,
            ];
            const base2WordsPairs = [sequenceFrom2WordWith1Words, sequenceFrom2WordWith2Words];

            for (let k = 0; k < 3; k++) {
                let _word = baseWordPairs[k];
                if (_word) {
                    const isSequenceAlreadyExists = await this.client.sIsMember(baseWord, _word);
                    if (!isSequenceAlreadyExists) {
                        await this.client.sAdd(baseWord, _word);
                    }
                }
                _word = base2WordsPairs[k];
                if (_word) {
                    const isSequenceAlreadyExists = await this.client.sIsMember(baseWordWith2Words, _word);
                    if (!isSequenceAlreadyExists) {
                        await this.client.sAdd(baseWordWith2Words, _word);
                    }
                }
            }
        }
    }

    async handleMessage(message: string) {
        const words = this.extractWords(message);
        if (words.length >= 3) {
            await this.updateSequences(words);
        }
        return words;
    }

    async generateSentence(word: string) {
        const sentence: string[] = [word];
        let phraseLength: number = word.length;
        let currentWords: string = word;

        while (phraseLength < this.MAX_SENTENCE_LENGTH) {
            const numberOfSequencesByWord = await this.client.sCard(currentWords);
            if (numberOfSequencesByWord === 0) {
                return sentence.join(' ').trim();
            }
            const nextWord = await this.client.sRandMember(currentWords);
            if (nextWord) {
                sentence.push(nextWord);
                phraseLength += nextWord.length;
                currentWords = nextWord;
                const nextWords = nextWord.trim().split(' ');
                if (nextWords.length > 2) {
                    currentWords = nextWords.slice(-2).join(' ').trim();
                }
            }
        }
        return sentence.join(' ').trim();
    }

    async getRandomSentence() {
        const initialWord = await this.client.RANDOMKEY();
        if (initialWord) {
            return this.generateSentence(initialWord);
        }
        return null;
    }
}
