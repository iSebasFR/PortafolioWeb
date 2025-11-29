// Validación y envío del formulario de cotización con Formspree
document.addEventListener('DOMContentLoaded', function() {
    const cotizarForm = document.getElementById('cotizarForm');
    const submitButton = cotizarForm.querySelector('.submit-button');
    const buttonText = submitButton.querySelector('.button-text');

    // TU ENDPOINT DE FORMSPREE
    const FORMSPREE_ENDPOINT = 'https://formspree.io/f/movoozpl';

    cotizarForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        if (!validarFormularioCompleto()) {
            return;
        }

        await enviarConFormspree();
    });

    function validarFormularioCompleto() {
        const nombre = document.getElementById('nombre');
        const email = document.getElementById('email');
        const mensaje = document.getElementById('mensaje');
        
        // Resetear estilos de error
        [nombre, email, mensaje].forEach(field => {
            field.style.borderColor = 'rgba(139, 0, 255, 0.3)';
        });

        // Validar nombre
        if (!nombre.value.trim()) {
            nombre.style.borderColor = '#ff4444';
            showNotification('Por favor, ingresa tu nombre completo.', 'error');
            nombre.focus();
            return false;
        }

        // Validar email con verificación avanzada
        const resultadoEmail = validarEmailCompleto(email.value);
        if (!resultadoEmail.esValido) {
            email.style.borderColor = '#ff4444';
            showNotification(resultadoEmail.mensaje, 'error');
            email.focus();
            return false;
        }

        // Validar mensaje
        if (!mensaje.value.trim()) {
            mensaje.style.borderColor = '#ff4444';
            showNotification('Por favor, describe tu proyecto en el mensaje.', 'error');
            mensaje.focus();
            return false;
        }

        // Si el email es de dominio sospechoso, mostrar advertencia pero permitir
        if (resultadoEmail.esSospechoso) {
            mostrarAdvertenciaEmailSospechoso(email.value);
        }

        return true;
    }

    function validarEmailCompleto(email) {
        // Validación básica de formato
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!email.trim() || !emailRegex.test(email)) {
            return {
                esValido: false,
                mensaje: 'Por favor, ingresa un email válido con formato: usuario@dominio.com',
                esSospechoso: false
            };
        }

        const dominio = email.split('@')[1].toLowerCase();

        // Lista de dominios de email válidos y comunes
        const dominiosValidos = [
            // Dominios principales
            'gmail.com', 'googlemail.com',
            'hotmail.com', 'outlook.com', 'live.com',
            'yahoo.com', 'ymail.com',
            'icloud.com', 'me.com', 'mac.com',
            'protonmail.com', 'proton.me',
            
            // Proveedores regionales comunes
            'aol.com', 'zoho.com', 'yandex.com', 'mail.com',
            'gmx.com', 'fastmail.com', 'tutanota.com',
            
            // Dominios empresariales/common
            'empresa.com', 'compania.com', 'empresarial.com',
            'business.com', 'correo.com', 'mail.com'
        ];

        // Dominios temporales/sospechosos conocidos
        const dominiosSospechosos = [
            'tempmail.com', 'fakeemail.com', 'throwaway.com',
            'guerrillamail.com', 'mailinator.com', '10minutemail.com',
            'trashmail.com', 'disposable.com', 'temp-mail.org',
            'getnada.com', 'tmpmail.org', 'throwawaymail.com',
            'maildrop.cc', 'spamgourmet.com', 'yopmail.com',
            'sharklasers.com', 'guerrillamail.info'
        ];

        // Verificar si es un dominio sospechoso
        if (dominiosSospechosos.includes(dominio)) {
            return {
                esValido: true, // Permitir pero marcar como sospechoso
                mensaje: '',
                esSospechoso: true,
                tipo: 'sospechoso'
            };
        }

        // Verificar si es un dominio válido conocido
        if (!dominiosValidos.includes(dominio)) {
            return {
                esValido: true, // Permitir dominios personalizados
                mensaje: '',
                esSospechoso: false,
                tipo: 'personalizado'
            };
        }

        // Validación específica para Gmail
        if (dominio === 'gmail.com' || dominio === 'googlemail.com') {
            return validarGmailEspecifico(email);
        }

        return {
            esValido: true,
            mensaje: '',
            esSospechoso: false,
            tipo: 'valido'
        };
    }

    function validarGmailEspecifico(email) {
        const usuario = email.split('@')[0].toLowerCase();
        
        // Patrones comunes en emails falsos
        const patronesSospechosos = [
            // Patrones de spam comunes
            /^test\d*$/i,
            /^demo\d*$/i,
            /^fake\d*$/i,
            /^temp\d*$/i,
            /^spam\d*$/i,
            /^admin\d*$/i,
            /^user\d*$/i,
            /^email\d*$/i,
            /^mail\d*$/i,
            
            // Nombres genéricos muy comunes
            /^aaaaaa$/i,
            /^asdfgh$/i,
            /^qwerty$/i,
            /^zxcvbn$/i,
            /^123456$/i,
            
            // Muy corto o muy largo
            /^.{1,3}$/,
            /^.{30,}$/
        ];

        // Verificar patrones sospechosos
        for (let patron of patronesSospechosos) {
            if (patron.test(usuario)) {
                return {
                    esValido: true, // Permitir pero marcar
                    mensaje: '',
                    esSospechoso: true,
                    tipo: 'gmail_sospechoso'
                };
            }
        }

        return {
            esValido: true,
            mensaje: '',
            esSospechoso: false,
            tipo: 'gmail_valido'
        };
    }

    function mostrarAdvertenciaEmailSospechoso(email) {
        const notificacionAdvertencia = document.createElement('div');
        notificacionAdvertencia.className = 'notification warning';
        notificacionAdvertencia.innerHTML = `
            <div class="notification-content">
                <i class="fas fa-exclamation-triangle"></i>
                <span>
                    <strong>Advertencia:</strong> El email <strong>${email}</strong> parece ser temporal. 
                    Para una mejor comunicación, usa un email personal o empresarial.
                </span>
            </div>
        `;

        Object.assign(notificacionAdvertencia.style, {
            position: 'fixed',
            top: '180px',
            right: '20px',
            background: 'linear-gradient(135deg, #ff9800, #ff5722)',
            color: 'white',
            padding: '20px 25px',
            borderRadius: '10px',
            boxShadow: '0 8px 25px rgba(0,0,0,0.4)',
            zIndex: '1000',
            transform: 'translateX(400px)',
            transition: 'transform 0.4s ease',
            maxWidth: '450px',
            border: '1px solid rgba(255,255,255,0.2)'
        });

        document.body.appendChild(notificacionAdvertencia);

        // Animación de entrada
        setTimeout(() => {
            notificacionAdvertencia.style.transform = 'translateX(0)';
        }, 100);

        // Auto-remover después de 8 segundos
        setTimeout(() => {
            notificacionAdvertencia.style.transform = 'translateX(400px)';
            setTimeout(() => {
                if (notificacionAdvertencia.parentNode) {
                    notificacionAdvertencia.parentNode.removeChild(notificacionAdvertencia);
                }
            }, 400);
        }, 8000);
    }

    // Validación en tiempo real mientras el usuario escribe
    const emailInput = document.getElementById('email');
    if (emailInput) {
        let timeoutId;
        
        emailInput.addEventListener('input', function() {
            clearTimeout(timeoutId);
            
            // Esperar a que el usuario deje de escribir
            timeoutId = setTimeout(() => {
                const email = this.value.trim();
                if (email && email.includes('@')) {
                    const resultado = validarEmailCompleto(email);
                    
                    if (!resultado.esValido) {
                        this.style.borderColor = '#ff4444';
                    } else if (resultado.esSospechoso) {
                        this.style.borderColor = '#ff9800';
                    } else {
                        this.style.borderColor = '#00c853';
                    }
                } else {
                    this.style.borderColor = 'rgba(139, 0, 255, 0.3)';
                }
            }, 500);
        });

        emailInput.addEventListener('blur', function() {
            const email = this.value.trim();
            if (email && email.includes('@')) {
                const resultado = validarEmailCompleto(email);
                if (resultado.esSospechoso) {
                    mostrarAdvertenciaEmailSospechoso(email);
                }
            }
        });
    }

    async function enviarConFormspree() {
        // Cambiar estado del botón
        submitButton.disabled = true;
        buttonText.textContent = 'ENVIANDO...';
        submitButton.style.opacity = '0.7';

        try {
            // Preparar datos para Formspree
            const datos = new URLSearchParams();
            datos.append('nombre', document.getElementById('nombre').value);
            datos.append('email', document.getElementById('email').value);
            datos.append('mensaje', document.getElementById('mensaje').value);
            datos.append('_subject', '🚀 Nueva Cotización Web - SebFR');
            datos.append('_replyto', document.getElementById('email').value);

            const response = await fetch(FORMSPREE_ENDPOINT, {
                method: 'POST',
                body: datos,
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/x-www-form-urlencoded'
                }
            });

            if (response.ok) {
                const result = await response.json();
                
                showNotification('¡Cotización enviada con éxito! Te contactaremos en menos de 24 horas.', 'success');
                cotizarForm.reset();
                
            } else {
                const errorText = await response.text();
                throw new Error(`Error HTTP: ${response.status}`);
            }
        } catch (error) {
            console.error('Error completo:', error);
            
            if (error.message.includes('Failed to fetch')) {
                showNotification('Error de conexión. Verifica tu internet e intenta nuevamente.', 'error');
            } else {
                showNotification('Error al enviar. Por favor, contáctanos directamente por WhatsApp.', 'error');
            }
        } finally {
            // Restaurar botón después de 2 segundos
            setTimeout(() => {
                submitButton.disabled = false;
                buttonText.textContent = 'ENVIAR COTIZACIÓN';
                submitButton.style.opacity = '1';
            }, 2000);
        }
    }

    function showNotification(message, type) {
        // Remover notificaciones existentes
        const notificacionesExistentes = document.querySelectorAll('.notification');
        notificacionesExistentes.forEach(notif => notif.remove());

        // Crear notificación
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <i class="fas ${type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle'}"></i>
                <span>${message}</span>
            </div>
        `;

        // Estilos de la notificación
        Object.assign(notification.style, {
            position: 'fixed',
            top: '100px',
            right: '20px',
            background: type === 'success' 
                ? 'linear-gradient(135deg, #00c853, #64dd17)' 
                : 'linear-gradient(135deg, #ff4444, #cc0000)',
            color: 'white',
            padding: '20px 25px',
            borderRadius: '10px',
            boxShadow: '0 8px 25px rgba(0,0,0,0.4)',
            zIndex: '1000',
            transform: 'translateX(400px)',
            transition: 'transform 0.4s ease',
            maxWidth: '400px',
            border: '1px solid rgba(255,255,255,0.2)'
        });

        document.body.appendChild(notification);

        // Animación de entrada
        setTimeout(() => {
            notification.style.transform = 'translateX(0)';
        }, 100);

        // Auto-remover después de 5 segundos
        setTimeout(() => {
            notification.style.transform = 'translateX(400px)';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 400);
        }, 5000);
    }

    // Efectos de hover en inputs
    const formInputs = cotizarForm.querySelectorAll('.form-input, .form-textarea');
    
    formInputs.forEach(input => {
        input.addEventListener('focus', function() {
            this.style.transform = 'translateY(-2px)';
            this.style.boxShadow = '0 5px 20px rgba(139, 0, 255, 0.3)';
        });

        input.addEventListener('blur', function() {
            this.style.transform = 'translateY(0)';
            this.style.boxShadow = 'none';
        });
    });

    // Función para abrir Gmail
    function abrirGmail() {
        const asunto = "Cotización Web - Proyecto de Desarrollo";
        const cuerpo = "Hola Sebastian,%0D%0A%0D%0AMe interesa cotizar un proyecto web. Por favor, contáctame para más detalles.%0D%0A%0D%0ASaludos,";
        window.open(`https://mail.google.com/mail/?view=cm&fs=1&to=josebastian245@gmail.com&su=${asunto}&body=${cuerpo}`, '_blank');
    }

    // Agregar evento al botón de email
    const emailButton = document.querySelector('.email-button');
    if (emailButton) {
        emailButton.addEventListener('click', function(e) {
            e.preventDefault();
            abrirGmail();
        });
    }
});