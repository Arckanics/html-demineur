
function display_cases(scale, _window, _board) {
    let _screen = document.createElement('section')
    for (let i = 0; i < scale; i++) {
        let _row = document.createElement('div')
        _row.classList.add('_d_row')
        for (let j = 0; j < scale ; j++) {
            let _case = document.createElement('div')
            _case.classList.add('_d_case')
            if (_board[i][j].mine) {
                _case.classList.add('_d_mine')
            } else {
                _case.innerText = _board[i][j].neighbour > 0 ? _board[i][j].neighbour : ''
            }
            _row.append(_case)
        }
        _screen.append(_row)
    }
    _window.append(_screen)
}

function demineur_init(scale = 16, element = 'pixels-demineur') {
    const _window = document.getElementById('pixels-demineur')
    const _head = document.head
    const _css = document.createElement('link')
    _css.href = "src/demineur.css"
    _css.rel = "stylesheet"
    _head.append(_css)

    _window.classList.add('_demineur')

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

    let _mineMap = []
    while (_mine > 0) {
        let _row = Math.floor(Math.random() * scale)
        let _case = Math.floor(Math.random() * scale)
        let _item = _board[_row][_case]
        if ( _item.mine == 0 ) {
            _item.mine = 1
            _mine--
            _mineMap.push({
                pos: {
                    x: _case,
                    y: _row
                }
            })
        }
    }

    for (let i = 0; i < _mineMap.length; i++) {
        let _mine = _mineMap[i]
        let _cursor = {..._mine.pos}
        let {x,y} = _cursor
        x--
        y--
        for (let i = 0; i < 3; i++) {
            for (let j = 0; j < 3; j++) {
                try {
                    _board[y+i][x+j].neighbour++
                } catch {
                    null
                }
            }
        }
    }
    
    display_cases(scale, _window, _board)
}