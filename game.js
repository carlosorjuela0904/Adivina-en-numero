(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.JuegoAdivinar = factory();
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  var CONFIG_POR_DEFECTO = { min: 1, max: 100, maxIntentos: 10 };

  var ESTADO = { EN_CURSO: 'EN_CURSO', GANADA: 'GANADA', PERDIDA: 'PERDIDA' };

  var CODIGO = {
    ACEPTADA: 'ACEPTADA',
    VACIO: 'VACIO',
    NO_ENTERO: 'NO_ENTERO',
    FUERA_DE_RANGO: 'FUERA_DE_RANGO',
    REPETIDO: 'REPETIDO',
    PARTIDA_TERMINADA: 'PARTIDA_TERMINADA'
  };

  var PISTA = { MAYOR: 'MAYOR', MENOR: 'MENOR', ACIERTO: 'ACIERTO' };

  function aleatorio32() {
    return globalThis.crypto.getRandomValues(new Uint32Array(1))[0];
  }

  function generarNumeroSecreto(min, max, rng) {
    if (!Number.isInteger(min) || !Number.isInteger(max) || min > max) {
      throw new RangeError('El rango no es válido: min y max deben ser enteros y min <= max.');
    }
    var fuente = rng || aleatorio32;
    var cantidad = max - min + 1;
    var limite = Math.floor(4294967296 / cantidad) * cantidad;
    var r;
    do { r = fuente(); } while (r >= limite);
    return min + (r % cantidad);
  }

  function validarEntrada(texto, estado) {
    if (estado.estado !== ESTADO.EN_CURSO) {
      return rechazar(CODIGO.PARTIDA_TERMINADA, 'La partida ya terminó. Pulsa "Nueva partida".');
    }

    var limpio = (texto == null ? '' : String(texto)).trim();

    if (limpio === '') {
      return rechazar(CODIGO.VACIO, 'Escribe un número antes de enviar. No se gastó ningún intento.');
    }
    if (!/^[0-9]{1,9}$/.test(limpio)) {
      return rechazar(CODIGO.NO_ENTERO,
        'Solo se aceptan números enteros (sin letras, signos ni decimales). No se gastó ningún intento.');
    }

    var valor = parseInt(limpio, 10);
    var cfg = estado.config;

    if (valor < cfg.min || valor > cfg.max) {
      return rechazar(CODIGO.FUERA_DE_RANGO,
        'El número debe estar entre ' + cfg.min + ' y ' + cfg.max + '. No se gastó ningún intento.');
    }
    for (var i = 0; i < estado.historial.length; i++) {
      if (estado.historial[i].valor === valor) {
        return rechazar(CODIGO.REPETIDO, 'Ya probaste el ' + valor + '. No se gastó ningún intento.');
      }
    }

    return { ok: true, codigo: CODIGO.ACEPTADA, valor: valor, mensaje: '' };
  }

  function rechazar(codigo, mensaje) {
    return { ok: false, codigo: codigo, valor: null, mensaje: mensaje };
  }

  function compararConSecreto(valor, secreto) {
    if (valor === secreto) return PISTA.ACIERTO;
    return valor < secreto ? PISTA.MAYOR : PISTA.MENOR;
  }

  function procesarIntento(estado, texto) {
    var v = validarEntrada(texto, estado);

    if (!v.ok) {
      return { estado: estado, resultado: { aceptado: false, codigo: v.codigo, mensaje: v.mensaje } };
    }

    var pista = compararConSecreto(v.valor, estado.secreto);
    var usados = estado.intentosUsados + 1;

    var nuevoEstado = ESTADO.EN_CURSO;
    if (pista === PISTA.ACIERTO) nuevoEstado = ESTADO.GANADA;
    else if (usados >= estado.config.maxIntentos) nuevoEstado = ESTADO.PERDIDA;

    return {
      estado: {
        config: estado.config,
        secreto: estado.secreto,
        intentosUsados: usados,
        historial: estado.historial.concat([{ valor: v.valor, pista: pista }]),
        estado: nuevoEstado
      },
      resultado: { aceptado: true, codigo: CODIGO.ACEPTADA, valor: v.valor, pista: pista, mensaje: '' }
    };
  }

  function reiniciarPartida(config, rng) {
    var cfg = {
      min: config && config.min != null ? config.min : CONFIG_POR_DEFECTO.min,
      max: config && config.max != null ? config.max : CONFIG_POR_DEFECTO.max,
      maxIntentos: config && config.maxIntentos != null ? config.maxIntentos : CONFIG_POR_DEFECTO.maxIntentos
    };
    if (!Number.isInteger(cfg.maxIntentos) || cfg.maxIntentos < 1) {
      throw new RangeError('maxIntentos debe ser un entero mayor o igual a 1.');
    }
    return {
      config: cfg,
      secreto: generarNumeroSecreto(cfg.min, cfg.max, rng),
      intentosUsados: 0,
      historial: [],
      estado: ESTADO.EN_CURSO
    };
  }

  return {
    CONFIG_POR_DEFECTO: CONFIG_POR_DEFECTO,
    ESTADO: ESTADO,
    CODIGO: CODIGO,
    PISTA: PISTA,
    generarNumeroSecreto: generarNumeroSecreto,
    validarEntrada: validarEntrada,
    compararConSecreto: compararConSecreto,
    procesarIntento: procesarIntento,
    reiniciarPartida: reiniciarPartida
  };
});
