(function () {
  'use strict';

  var J = window.JuegoAdivinar;
  var partida = J.reiniciarPartida();
  var rechazos = 0;

  var entrada = document.getElementById('entrada');
  var mensaje = document.getElementById('mensaje');

  function textoPista(pista) {
    if (pista === J.PISTA.ACIERTO) return '¡acertaste!';
    return pista === J.PISTA.MAYOR ? 'el secreto es mayor' : 'el secreto es menor';
  }

  function mostrarMensaje(texto, tipo) {
    mensaje.textContent = texto;
    mensaje.className = 'mensaje ' + (tipo || '');
  }

  function pintar() {
    var cfg = partida.config;
    document.getElementById('reglas').textContent =
      'Adivina el número entre ' + cfg.min + ' y ' + cfg.max + ' en ' + cfg.maxIntentos +
      ' intentos. Las entradas inválidas o repetidas no gastan intentos.';
    document.getElementById('restantes').textContent = String(cfg.maxIntentos - partida.intentosUsados);
    document.getElementById('rechazos').textContent = String(rechazos);

    var lista = document.getElementById('historial');
    lista.textContent = '';
    partida.historial.forEach(function (h) {
      var li = document.createElement('li');
      li.textContent = h.valor + ' → ' + textoPista(h.pista);
      lista.appendChild(li);
    });

    var terminada = partida.estado !== J.ESTADO.EN_CURSO;
    entrada.disabled = terminada;
    document.getElementById('enviar').disabled = terminada;
  }

  document.getElementById('formulario').addEventListener('submit', function (evento) {
    evento.preventDefault();

    var r = J.procesarIntento(partida, entrada.value);
    partida = r.estado;

    if (!r.resultado.aceptado) {
      rechazos++;
      mostrarMensaje(r.resultado.mensaje, 'aviso');
    } else if (partida.estado === J.ESTADO.GANADA) {
      mostrarMensaje('¡Ganaste en ' + partida.intentosUsados + ' intento(s)! El número era ' + partida.secreto + '.', 'ok');
    } else if (partida.estado === J.ESTADO.PERDIDA) {
      mostrarMensaje('Se acabaron los intentos. El número era ' + partida.secreto + '.', 'error');
    } else {
      mostrarMensaje(r.resultado.valor + ': ' + textoPista(r.resultado.pista) + '.', '');
    }

    entrada.value = '';
    pintar();
    if (partida.estado === J.ESTADO.EN_CURSO) entrada.focus();
  });

  document.getElementById('nueva').addEventListener('click', function () {
    partida = J.reiniciarPartida();
    rechazos = 0;
    mostrarMensaje('', '');
    entrada.value = '';
    pintar();
    entrada.focus();
  });

  pintar();
})();
