// Chicken Dance Piano
// Captured from https://dzen.ru/a/X5vOhp5bwz8NBsn3

const LINE_1 = ['so', 'so', 'la', 'la', 'mi', 'mi', 'so~'];
const LINE_2 = ['so', 'so', 'la', 'la', 'do^', 'do^', 'si~'];
const LINE_3 = ['fa', 'fa', 'so', 'so', 're', 're', 'fa~'];
const LINE_4 = ['fa', 'fa', 'so', 'so', 'si', 'si', 'la~'];

export const track: string[] = [
  ...LINE_1,
  ...LINE_1,
  ...LINE_2,
  ...['si~', 'la~', 'so~', 'fa~'],
  ...LINE_3,
  ...LINE_3,
  ...LINE_4,
  ...['la~', 'so~', 'fa~', 'mi~'],
  ...['mi~', 'so', 'mi^~', 're^', 're^~', 'do^~'],
  ...['mi~', 'so', 're^~', 'do^', 'si~'],
  ...['re~', 'fa', 're^', 'do^', 'do^', 'si'],
  ...['re^', 're^', 'do^', 'do^', 'si~'],
  ...['si', 'do^', 're^', 'do^~'],
];
