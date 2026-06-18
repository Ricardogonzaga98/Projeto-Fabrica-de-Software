const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

async function waitForDatabase(db, options = {}) {
  const attempts = options.attempts ?? 10;
  const delayMs = options.delayMs ?? 1000;
  let lastError;

  for (let attempt = 1; attempt <= attempts; attempt++) {
    try {
      await db.promise().query('SELECT 1');
      return;
    } catch (error) {
      lastError = error;

      if (attempt < attempts) {
        console.warn(`Banco indisponível. Nova tentativa ${attempt + 1}/${attempts}...`);
        await delay(delayMs);
      }
    }
  }

  throw lastError;
}

module.exports = { waitForDatabase };
