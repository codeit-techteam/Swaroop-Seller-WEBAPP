const wait = (ms = 280) =>
  new Promise<void>((resolve) => {
    setTimeout(resolve, ms);
  });

export async function delay<T>(value: T, ms = 280): Promise<T> {
  await wait(ms);
  return value;
}

export class RepositoryError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "RepositoryError";
  }
}
