
window.addEventListener('load', () => {
    
    let script = document.createElement('script')
    script.src = "src/demineur.js"
    script.addEventListener('load', ()=>{
        demineur_init()
        script.removeEventListener('load', this)
    })
    document.querySelector('head').append(script)
    
})