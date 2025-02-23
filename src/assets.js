/* Sprites */
import spriteBean from './sprites/bean.png';
import spriteMark from './sprites/mark.png';
import spriteSunO from './sprites/sun-o.png';

/* Sounds */
import soundExplosion1 from './sounds/explosion-1.wav';
import soundExplosion2 from './sounds/explosion-2.wav';
import soundExplosion3 from './sounds/explosion-3.wav';
import soundExplosion4 from './sounds/explosion-4.wav';

/* Background */
import musicBackground from './music/background.wav';

function importAssets(k) {
    k.loadSprite("bean", spriteBean);
    k.loadSprite("mark", spriteMark);
    k.loadSprite("sun", spriteSunO);

    k.loadSound('explosion-1', soundExplosion1);
    k.loadSound('explosion-2', soundExplosion2);
    k.loadSound('explosion-3', soundExplosion3);
    k.loadSound('explosion-4', soundExplosion4);

    k.loadMusic('bg', musicBackground);
}

export { importAssets };