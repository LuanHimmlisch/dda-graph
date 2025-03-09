import canAutoplay from 'can-autoplay';

let initialized = false;

function runFirstFocus(run = []) {
    if (initialized) return;

    initialized = true;

    run.forEach(fun => fun());
}

function checkForFirstFocus(...args) {
    canAutoplay.audio().then(({ result }) => {
        if (result) {
            return runFirstFocus(args);
        }

        window.addEventListener('click', () => runFirstFocus(args), {
            once: true
        });
    });
}


export {
    checkForFirstFocus
};