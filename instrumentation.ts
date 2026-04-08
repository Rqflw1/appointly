export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    if (process.env.NODE_ENV === "development") return;
    // Avoid Turbopack resolving Prisma runtime at build time.
    // This keeps cron wiring strictly runtime-only in Node.js.
    // eslint-disable-next-line @typescript-eslint/no-implied-eval
    const req = eval("require") as NodeRequire;
    const cron = req("node-cron");
    const {
      deleteUnreferenced,
      deleteExpired,
      resetDocumentIndexes,
      fetchAndSaveCurrencyRates
    } = req("./app/_lib/serverFunctions/cron");

    cron.schedule("0 0 */1 * * *", deleteUnreferenced);
    cron.schedule("0 0 */1 * * *", deleteExpired);
    cron.schedule("0 0 0 * * *", resetDocumentIndexes);
    // cron.schedule("0 0 3 * * *", fetchAndSaveCurrencyRates);
  }
}
