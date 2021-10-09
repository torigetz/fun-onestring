
(() => {
    const log = (msg = '') => console.log(`[number-game] ${msg}`)

    const getText = () => ({
        MAIN: 'Привет!\n\nТвоя задача состоит в том, чтоб ввести число больше, чем выбрал компьютер (от 1 до 1000)\n\nНачнем?',
        INPUT_NUMBER: 'Введите число:',
        NUMBER_ERROR: 'Введите число!',
        LOSE: 'Ты проиграл!',
        WIN: 'Ты выиграл!\n\nПовторить?',
        NICE_DAY: 'Хорошего дня!',
        REALLY_QUIT: 'Ты действительно хочешь выйти?'
    });

    const random = (min, max) => {
        let rand = min - 0.5 + Math.random() * (max - min + 1);

        return Math.round(rand);
    }

    const quit = () => {
        alert(getText().NICE_DAY);
        log('user quit');
    }
    
    const game = () => {
        const generated = random(1, 1000);

        const userInput = prompt(getText().INPUT_NUMBER);
        log(`text: ${userInput}`);

        if (userInput === null) {
            const reallyQuit = confirm(getText().REALLY_QUIT);

            if (reallyQuit) {
                return quit();
            } else {
                return game();
            }
        }

        const parsed = parseInt(userInput);

        const check = isNaN(parsed);
        log(`parsed is NaN?: ${ check ? 'yes' : 'no' }`);

        if (check) {
            alert(getText().NUMBER_ERROR);
            return game();
        }

        if (parsed > generated) {
            const nextGame = confirm(getText().WIN);

            if (nextGame) {
                return game();
            } else {
                return quit();
            }
        } else {
            alert(getText().LOSE);
            return game();
        }
    }

    const main = () => {
        log('program started');
        
        const answer = confirm(getText().MAIN);

        if (answer) {
            log('start game');
            game();
        } else {
            return quit();
        }
    }

    main();
})();
