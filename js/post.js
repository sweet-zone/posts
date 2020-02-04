
(function() {
    var anchor = document.getElementById('anchor')
    var container = document.getElementById('container')
    if(anchor) {
        anchor.addEventListener('click', function() {
            container.classList.toggle('full')
            anchor.classList.toggle('full')
        }, false)
    }
})()