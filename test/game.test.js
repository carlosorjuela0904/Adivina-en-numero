const { test, describe } = require('node:test');
const assert = require('node:assert');
const J = require('../game.js');

function partidaConSecreto(secreto) {
  return J.reiniciarPartida({ min: 1, max: 100, maxIntentos: 10 }, () => secreto - 1);
}

function jugar(partida, numeros) {
  let actual = partida;
  for (const n of numeros) actual = J.procesarIntento(actual, String(n)).estado;
  return actual;
}

describe('CC1 - Las entradas inválidas o repetidas no gastan intento', () => {
  const entradasInvalidas = [
    '', '   ', 'abc', 'hola', '7.5', '7,5', '-3', '+5', '1e1', '0x10',
    '7abc', 'a7', '5 5', '0', '101', '500', '1000000000000', '３', '!', '12.0'
  ];

  for (const entrada of entradasInvalidas) {
    test(`la entrada ${JSON.stringify(entrada)} no gasta intento`, () => {
      const antes = partidaConSecreto(42);
      const r = J.procesarIntento(antes, entrada);
      assert.strictEqual(r.resultado.aceptado, false);
      assert.strictEqual(r.estado, antes, 'debe devolver la MISMA partida');
      assert.strictEqual(r.estado.intentosUsados, 0);
      assert.ok(r.resultado.mensaje.length > 0, 'debe explicar el motivo');
    });
  }

  test('un número repetido no gasta intento', () => {
    const despues = jugar(partidaConSecreto(42), [10, 20]);
    const r = J.procesarIntento(despues, '10');
    assert.strictEqual(r.resultado.aceptado, false);
    assert.strictEqual(r.resultado.codigo, J.CODIGO.REPETIDO);
    assert.strictEqual(r.estado.intentosUsados, 2);
  });

  test('"010" cuenta como repetido del 10', () => {
    const despues = jugar(partidaConSecreto(42), [10]);
    const r = J.procesarIntento(despues, '010');
    assert.strictEqual(r.resultado.codigo, J.CODIGO.REPETIDO);
    assert.strictEqual(r.estado.intentosUsados, 1);
  });

  test('muchas entradas malas seguidas no acaban la partida', () => {
    let p = partidaConSecreto(42);
    for (let i = 0; i < 50; i++) p = J.procesarIntento(p, 'abc').estado;
    assert.strictEqual(p.intentosUsados, 0);
    assert.strictEqual(p.estado, J.ESTADO.EN_CURSO);
  });
});

describe('CC2 - El número secreto siempre está entre 1 y 100', () => {
  test('en 1000 partidas ningún secreto sale del rango', () => {
    for (let i = 0; i < 1000; i++) {
      const p = J.reiniciarPartida();
      assert.ok(Number.isInteger(p.secreto));
      assert.ok(p.secreto >= 1 && p.secreto <= 100, `secreto fuera de rango: ${p.secreto}`);
    }
  });

  test('descarta los valores que darían ventaja a unos números', () => {
    const valores = [4294967295, 41];
    const secreto = J.generarNumeroSecreto(1, 100, () => valores.shift());
    assert.strictEqual(secreto, 42);
  });

  test('con un rango inválido lanza error', () => {
    assert.throws(() => J.generarNumeroSecreto(10, 1), RangeError);
    assert.throws(() => J.generarNumeroSecreto(1.5, 10), RangeError);
  });
});

describe('RF1 - Iniciar partida', () => {
  test('empieza con 10 intentos, sin historial y en curso', () => {
    const p = J.reiniciarPartida();
    assert.strictEqual(p.config.maxIntentos, 10);
    assert.strictEqual(p.intentosUsados, 0);
    assert.deepStrictEqual(p.historial, []);
    assert.strictEqual(p.estado, J.ESTADO.EN_CURSO);
  });
});

describe('RF2 - Validar el intento', () => {
  test('acepta un número válido y gasta un intento', () => {
    const r = J.procesarIntento(partidaConSecreto(42), '30');
    assert.strictEqual(r.resultado.aceptado, true);
    assert.strictEqual(r.estado.intentosUsados, 1);
  });

  test('acepta los extremos 1 y 100', () => {
    assert.strictEqual(J.procesarIntento(partidaConSecreto(42), '1').resultado.aceptado, true);
    assert.strictEqual(J.procesarIntento(partidaConSecreto(42), '100').resultado.aceptado, true);
  });

  test('acepta espacios alrededor: " 42 "', () => {
    assert.strictEqual(J.procesarIntento(partidaConSecreto(7), ' 42 ').resultado.valor, 42);
  });

  const tabla = [
    ['', J.CODIGO.VACIO],
    ['abc', J.CODIGO.NO_ENTERO],
    ['7.5', J.CODIGO.NO_ENTERO],
    ['0', J.CODIGO.FUERA_DE_RANGO],
    ['101', J.CODIGO.FUERA_DE_RANGO]
  ];
  for (const [entrada, codigo] of tabla) {
    test(`${JSON.stringify(entrada)} responde ${codigo}`, () => {
      const r = J.validarEntrada(entrada, partidaConSecreto(42));
      assert.strictEqual(r.codigo, codigo);
    });
  }
});

describe('RF3 - Dar pista y terminar la partida', () => {
  test('pista MAYOR cuando el secreto es más grande', () => {
    assert.strictEqual(J.compararConSecreto(10, 42), J.PISTA.MAYOR);
  });
  test('pista MENOR cuando el secreto es más pequeño', () => {
    assert.strictEqual(J.compararConSecreto(90, 42), J.PISTA.MENOR);
  });
  test('ACIERTO cuando es el mismo número', () => {
    assert.strictEqual(J.compararConSecreto(42, 42), J.PISTA.ACIERTO);
  });

  test('gana al acertar', () => {
    const p = jugar(partidaConSecreto(42), [10, 42]);
    assert.strictEqual(p.estado, J.ESTADO.GANADA);
    assert.strictEqual(p.intentosUsados, 2);
  });

  test('pierde al gastar los 10 intentos', () => {
    const p = jugar(partidaConSecreto(42), [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
    assert.strictEqual(p.estado, J.ESTADO.PERDIDA);
    assert.strictEqual(p.intentosUsados, 10);
  });

  test('acertar en el último intento cuenta como ganar', () => {
    const p = jugar(partidaConSecreto(42), [1, 2, 3, 4, 5, 6, 7, 8, 9, 42]);
    assert.strictEqual(p.estado, J.ESTADO.GANADA);
  });

  test('con la partida terminada no se aceptan más intentos', () => {
    const p = jugar(partidaConSecreto(42), [42]);
    const r = J.procesarIntento(p, '5');
    assert.strictEqual(r.resultado.codigo, J.CODIGO.PARTIDA_TERMINADA);
    assert.strictEqual(r.estado, p);
  });

  test('el historial guarda solo los intentos que contaron', () => {
    let p = partidaConSecreto(42);
    p = J.procesarIntento(p, '10').estado;
    p = J.procesarIntento(p, 'abc').estado;
    p = J.procesarIntento(p, '10').estado;
    p = J.procesarIntento(p, '90').estado;
    assert.deepStrictEqual(p.historial.map(h => h.valor), [10, 90]);
  });

  test('procesarIntento no modifica la partida original', () => {
    const antes = partidaConSecreto(42);
    J.procesarIntento(antes, '10');
    assert.strictEqual(antes.intentosUsados, 0);
    assert.strictEqual(antes.historial.length, 0);
  });
});

describe('Punto 3 - Las 5 funciones existen con los nombres del informe', () => {
  for (const nombre of ['generarNumeroSecreto', 'validarEntrada', 'compararConSecreto', 'procesarIntento', 'reiniciarPartida']) {
    test(nombre, () => assert.strictEqual(typeof J[nombre], 'function'));
  }
});
