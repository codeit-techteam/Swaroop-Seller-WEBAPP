const wait = (ms = 220) =>
  new Promise<void>((resolve) => {
    setTimeout(resolve, ms);
  });

export async function delay<T>(value: T, ms = 220): Promise<T> {
  await wait(ms);
  return value;
}
