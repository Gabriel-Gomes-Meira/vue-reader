
// No contexto do iframe, adicionar o listener de clique
document.addEventListener('click', (event) => {
    // Verifica se o clique foi feito dentro de um elemento de texto (p, span, div ou qualquer outro)
    const isInsideText = event.target.closest('p, span, div, li');

    // Se o clique não for dentro de um elemento de texto, envia a mensagem de "click fora"
    if (!isInsideText) {
        window.parent.postMessage('clickOutsideIframe', '*');
    }
})