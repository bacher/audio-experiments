const NOTES_FREQ = [
  [16.352, 18.354, 20.602, 21.827, 24.5, 27.5, 30.868],
  [32.703, 36.708, 41.203, 43.654, 48.999, 55.0, 61.735],
  [65.406, 73.416, 82.407, 87.307, 97.999, 110.0, 123.47],
  [130.81, 146.83, 164.81, 174.61, 196.0, 220.0, 246.94],
  [261.63, 293.66, 329.63, 349.23, 392.0, 440.0, 493.88],
  [523.25, 587.32, 659.26, 698.46, 783.99, 880.0, 987.77],
  [1046.5, 1174.7, 1318.5, 1396.9, 1568.0, 1760.0, 1975.5],
  [2093.0, 2349.3, 2637.0, 2793.8, 3136.0, 3520.0, 3951.1],
  [4186.0, 4698.6, 5274.0, 5587.7, 6271.9, 7040.0, 7902.1],
];

export function printLevels() {
  for (let i = 0; i < NOTES_FREQ.length; i += 1) {
    const n = NOTES_FREQ[i];
    const list = [1];

    for (let j = 0; j < n.length - 1; j += 1) {
      const delta = n[j + 1] / n[0];
      list.push(delta);
    }
    console.log(`Delta ${i} ${n[0]}`, list);
  }
}

export function printDeltas() {
  for (let i = 0; i < NOTES_FREQ.length; i += 1) {
    const n = NOTES_FREQ[i];
    const list = ['1.000'];

    for (let j = 0; j < n.length; j += 1) {
      if (j === n.length - 1 && i === NOTES_FREQ.length - 1) {
        break;
      }

      const next = j === n.length - 1 ? NOTES_FREQ[i + 1][0] : n[j + 1];
      const delta = next / n[j];
      list.push(delta.toFixed(3));
    }

    console.log(`Delta ${i} ${n[0].toFixed(1).padStart(6, ' ')}`, list);
  }
}
