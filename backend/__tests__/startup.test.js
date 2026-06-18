const { waitForDatabase } = require('../config/startup');

describe('Inicialização do banco de dados', () => {
  let warnSpy;

  beforeEach(() => {
    warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
  });

  afterEach(() => {
    warnSpy.mockRestore();
  });

  test('continua após uma falha temporária de conexão', async () => {
    const query = jest.fn()
      .mockRejectedValueOnce(new Error('ECONNREFUSED'))
      .mockResolvedValueOnce([[{ connected: 1 }]]);
    const db = { promise: () => ({ query }) };

    await expect(waitForDatabase(db, { attempts: 2, delayMs: 0 }))
      .resolves.toBeUndefined();
    expect(query).toHaveBeenCalledTimes(2);
  });

  test('falha depois de esgotar as tentativas', async () => {
    const error = new Error('ECONNREFUSED');
    const query = jest.fn().mockRejectedValue(error);
    const db = { promise: () => ({ query }) };

    await expect(waitForDatabase(db, { attempts: 3, delayMs: 0 }))
      .rejects.toThrow('ECONNREFUSED');
    expect(query).toHaveBeenCalledTimes(3);
  });
});
