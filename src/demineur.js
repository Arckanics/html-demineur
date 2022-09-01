
function demineur_init(scale = 16) {
    const _window = document.getElementById('pixels-demineur')
    const _head = document.head
    const _css = document.createElement('link')
    _css.href = "src/demineur.css"
    _css.rel = "stylesheet"
    _head.append(_css)

    let _board = []
    for (let i = 0; i < scale; i++) {
        let _rowCount = 0
        _board.push([])
        for (let j = 0; j < scale; j++) {
            let _case = {
                mine : 0,
                neighbour : 0
            }
            _board[i][j] = _case
        }
    }
    let _mine = Math.floor(Math.pow(scale, 2) * 0.15)
    while (_mine > 0) {
        let _row = Math.floor(Math.random() * scale)
        let _case = Math.floor(Math.random() * scale)
        let _item = _board[_row][_case]
        if ( _item.mine == 0 ) {
            _item.mine = 1
            _mine--
        }
    }
    console.log(_board);
}