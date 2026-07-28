export function snap(value: number, targets: number[]) {

  const DISTANCE = 8;

  for (const target of targets) {

    if (Math.abs(value - target) <= DISTANCE) {

      return target;

    }

  }

  return value;

}