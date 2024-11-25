document.addEventListener('DOMContentLoaded', function() {
    // Obtener referencias a elementos del formulario
    const form = document.getElementById('formularioTurnos');
    const nombreInput = document.getElementById('nombre');
    const apellidoInput = document.getElementById('apellido');
    const fechaTurnoInput = document.getElementById('fechaTurno');
    const ultimoControlInput = document.getElementById('ultimoControl');
    const edadInput = document.getElementById('edad');
    const telefonoInput = document.getElementById('telefono');
    const dniInput = document.getElementById('dni');
    const checkboxes = document.querySelectorAll('input[name="motivo"]');
    const selectHorario = document.getElementById('horario');
    const btnSeleccionarTodos = document.getElementById('seleccionarTodos');
    const btnMayusculas = document.getElementById('btnMayusculas');
    const btnMinusculas = document.getElementById('btnMinusculas');

    // Función para ajustar la fecha según la zona horaria
    function ajustarFecha(fecha) {
        const offset = fecha.getTimezoneOffset();
        return new Date(fecha.getTime() + (offset * 60 * 1000));
    }

    // Función mejorada para validar campos
    function validarCampo(input, mensaje) {
        const isValid = input.value.trim() !== '';
        input.style.borderColor = isValid ? '#ddd' : 'red';
        
        // Remover error previo si existe
        const prevError = input.parentElement.querySelector('.error-message');
        if (prevError) {
            prevError.remove();
        }
        
        // Agregar nuevo error si es inválido
        if (!isValid) {
            const errorDiv = document.createElement('div');
            errorDiv.className = 'error-message';
            errorDiv.textContent = mensaje;
            errorDiv.style.color = 'red';
            errorDiv.style.fontSize = '0.8rem';
            errorDiv.style.marginTop = '0.3rem';
            input.parentElement.appendChild(errorDiv);
        }
        
        return isValid;
    }

    // Eventos para campos de texto (validación al perder foco)
    nombreInput.addEventListener('blur', function() {
        validarCampo(this, 'Por favor ingrese su nombre');
    });

    apellidoInput.addEventListener('blur', function() {
        validarCampo(this, 'Por favor ingrese su apellido');
    });

    telefonoInput.addEventListener('blur', function() {
        validarCampo(this, 'Por favor ingrese un número de teléfono válido');
    });

    dniInput.addEventListener('blur', function() {
        validarCampo(this, 'Por favor ingrese su número de DNI');
    });

    // Validación de edad con cálculos
    edadInput.addEventListener('input', function() {
        const edad = parseInt(this.value);
        
        // Remover error previo
        const prevError = this.parentElement.querySelector('.error-message');
        if (prevError) {
            prevError.remove();
        }

        if (isNaN(edad) || edad < 0) {
            this.value = '';
            validarCampo(this, 'La edad debe ser un número positivo');
            return;
        }
        
        if (edad > 120) {
            this.value = '120';
            validarCampo(this, 'La edad máxima permitida es 120 años');
            return;
        }

        // Validar que sea un número entero
        if (!Number.isInteger(edad)) {
            this.value = Math.floor(edad);
            validarCampo(this, 'La edad debe ser un número entero');
            return;
        }

        // Si llegamos aquí, la edad es válida
        this.style.borderColor = '#ddd';
    });

    // Control de fechas
    function actualizarFechasMinimas() {
        const hoy = new Date();
        const fechaHoyStr = hoy.toISOString().split('T')[0];
        
        // Establecer fecha mínima para el turno
        fechaTurnoInput.min = fechaHoyStr;
        
        // Establecer fecha máxima para el último control
        ultimoControlInput.max = fechaHoyStr;

        // Si la fecha del turno es hoy, actualizar horarios disponibles
        if (fechaTurnoInput.value === fechaHoyStr) {
            actualizarHorariosDisponibles(hoy);
        }
    }

    // Función para actualizar horarios disponibles
    function actualizarHorariosDisponibles(fecha) {
        const horaActual = fecha.getHours();
        const minutosActuales = fecha.getMinutes();
        const opciones = selectHorario.options;

        let algunaOpcionDisponible = false;
        
        for (let i = 1; i < opciones.length; i++) {
            const horaOpcion = parseInt(opciones[i].value);
            const esPasado = horaActual > horaOpcion || 
                            (horaActual === horaOpcion && minutosActuales > 0);
            
            opciones[i].disabled = esPasado;
            opciones[i].style.color = esPasado ? '#999' : '#000';
            
            if (!esPasado) algunaOpcionDisponible = true;
            
            if (esPasado && opciones[i].selected) {
                selectHorario.value = '';
            }
        }
        
        if (!algunaOpcionDisponible) {
            alert('No hay horarios disponibles para hoy. Por favor seleccione otra fecha.');
            fechaTurnoInput.value = '';
        }
    }

    // Función para validar si es fin de semana
    function esFinDeSemana(fecha) {
        const dia = fecha.getDay();
        return dia === 0 || dia === 6; // 0 es domingo, 6 es sábado
    }

    // Evento para fecha del turno
    fechaTurnoInput.addEventListener('change', function() {
        const fechaSeleccionada = new Date(this.value + 'T00:00:00');
        const hoy = new Date();
        
        // Validar si es fin de semana
        if (esFinDeSemana(fechaSeleccionada)) {
            alert('No se pueden agendar turnos los fines de semana. Por favor seleccione un día hábil (Lunes a Viernes).');
            this.value = '';
            return;
        }

        // Resetear las opciones de horario
        Array.from(selectHorario.options).forEach((opcion, index) => {
            if (index > 0) {
                opcion.disabled = false;
                opcion.style.color = '#000';
            }
        });

        // Si la fecha seleccionada es hoy, actualizar horarios
        if (this.value === hoy.toISOString().split('T')[0]) {
            actualizarHorariosDisponibles(hoy);
        }

        validarCampo(this, 'Por favor seleccione una fecha para el turno');
    });

    // Evento para último control dental
    ultimoControlInput.addEventListener('change', function() {
        const fechaControl = new Date(this.value + 'T00:00:00');
        const hoy = new Date();
        
        if (fechaControl > hoy) {
            this.value = hoy.toISOString().split('T')[0];
            validarCampo(this, 'La fecha del último control no puede ser posterior a hoy');
        } else {
            validarCampo(this, 'Por favor indique la fecha de su último control dental');
        }
    });

    // Botón para seleccionar todos los checkboxes
    btnSeleccionarTodos.addEventListener('click', function() {
        const todosSeleccionados = Array.from(checkboxes).every(cb => cb.checked);
        checkboxes.forEach(checkbox => checkbox.checked = !todosSeleccionados);
        this.textContent = todosSeleccionados ? 'Seleccionar Todos' : 'Deseleccionar Todos';
    });

    // Botones para convertir texto de horarios a mayúsculas/minúsculas
    btnMayusculas.addEventListener('click', function() {
        Array.from(selectHorario.options).forEach(option => {
            option.text = option.text.toUpperCase();
        });
    });

    btnMinusculas.addEventListener('click', function() {
        Array.from(selectHorario.options).forEach(option => {
            option.text = option.text.toLowerCase();
        });
    });

    // Validación del formulario al enviar
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        let isValid = true;
        let errores = [];

        // Validar campos obligatorios
        if (!validarCampo(nombreInput, 'Por favor ingrese su nombre')) {
            errores.push('El campo nombre es obligatorio');
            isValid = false;
        }
        if (!validarCampo(apellidoInput, 'Por favor ingrese su apellido')) {
            errores.push('El campo apellido es obligatorio');
            isValid = false;
        }
        if (!validarCampo(fechaTurnoInput, 'Por favor seleccione una fecha para el turno')) {
            errores.push('Debe seleccionar una fecha para el turno');
            isValid = false;
        }
        if (!validarCampo(ultimoControlInput, 'Por favor indique la fecha de su último control dental')) {
            errores.push('Debe indicar la fecha de su último control dental');
            isValid = false;
        }
        if (!validarCampo(edadInput, 'Por favor ingrese su edad')) {
            errores.push('El campo edad es obligatorio');
            isValid = false;
        }
        if (!validarCampo(telefonoInput, 'Por favor ingrese un número de teléfono válido')) {
            errores.push('El campo teléfono es obligatorio');
            isValid = false;
        }
        if (!validarCampo(dniInput, 'Por favor ingrese su número de DNI')) {
            errores.push('El campo DNI es obligatorio');
            isValid = false;
        }

        // Validar checkboxes (al menos 2 seleccionados)
        const checkboxesSeleccionados = Array.from(checkboxes).filter(cb => cb.checked).length;
        if (checkboxesSeleccionados < 2) {
            errores.push('Debe seleccionar al menos dos motivos de consulta');
            isValid = false;
        }

        // Validar horario seleccionado
        if (!selectHorario.value) {
            errores.push('Debe seleccionar un horario para el turno');
            isValid = false;
        }

        // Validar que no sea fin de semana
        if (fechaTurnoInput.value) {
            const fechaSeleccionada = new Date(fechaTurnoInput.value + 'T00:00:00');
            if (esFinDeSemana(fechaSeleccionada)) {
                errores.push('No se pueden agendar turnos los fines de semana');
                isValid = false;
            }
        }

        // Si hay errores, mostrarlos
        if (!isValid) {
            const mensajeError = 'Por favor corrija los siguientes errores:\n\n' + 
                               errores.map(error => '- ' + error).join('\n');
            alert(mensajeError);
            return;
        }

        // Si todo está válido, mostrar mensaje de confirmación
        if (isValid) {
            const fechaTurno = new Date(fechaTurnoInput.value + 'T00:00:00');
            const opcionesFecha = { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
            };
            const fechaFormateada = fechaTurno.toLocaleDateString('es-ES', opcionesFecha);
            const horarioSeleccionado = selectHorario.options[selectHorario.selectedIndex].text;

            const mensaje = `¡Gracias ${nombreInput.value} ${apellidoInput.value}!

Su turno ha sido reservado exitosamente para el ${fechaFormateada} a las ${horarioSeleccionado}.

Información importante:
- Por favor llegue 10 minutos antes de su turno
- Traiga su DNI y cualquier estudio previo relevante
- Si necesita cancelar o reprogramar, contáctenos con 24hs de anticipación

¡Que tenga un excelente día!`;

            alert(mensaje);
            form.reset();
            
            // Limpiar mensajes de error
            document.querySelectorAll('.error-message').forEach(error => error.remove());
            
            // Resetear bordes de campos
            const inputs = form.querySelectorAll('input, select');
            inputs.forEach(input => input.style.borderColor = '#ddd');
        }
    });

    // Inicializar fechas al cargar
    actualizarFechasMinimas();
});