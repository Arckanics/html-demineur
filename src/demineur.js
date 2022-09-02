
function update_demineur(_target, _board, pos, _grid) {
    let _update_cases = []
    let _auto_opening = []
    if (_target.mine == 1) {
        // loose function
    } else {
        _update_cases.push({_case: _target, _pos: pos})
        pos.x--
        pos.y--
        let {x,y} = pos
        for (let i = 0; i < 3; i++) {
            for (let j = 0; j < 3; j++) {
                if (i !== 1 || j !== 1) {
                    try {
                        let _case = _board[y+i][x+j]
                        let _pos = {
                            y:y+i,
                            x:x+j
                        }
                        if (_case.mine == 0 && _case.neighbour == 0 && _case.opened == false) {
                            _update_cases.push({_case, _pos})
                            _auto_opening.push({_case, _pos})
                        } else if (_case.mine == 0 && _case.neighbour > 0 && _case.opened == false) {
                            _update_cases.push({_case, _pos})
                        }
                    } catch {
                        null
                    }
                }
            }
        }
    }

    _update_cases.map((v, i) => {
        const {x,y} = v._pos
        v._case.opened = true
        let query = `._d_case[x="${x}"][y="${y}"]`
        let txt = v._case.neighbour > 0 ? v._case.neighbour : ''
        try {
            let html_case = _grid.querySelector(query)
            html_case.classList.add('_d_opened')
            html_case.innerText = txt
        } catch {
            null
        }
    })

    _auto_opening.map((v, i) => {
        update_demineur(v._case, _board, pos, _grid)
    })
}

function init_game(scale, _window, _board) {
    let _grid = document.createElement('section')
        _grid.classList.add('_demineur')
    for (let i = 0; i < scale; i++) {
        let _row = document.createElement('section')
        _row.classList.add('_d_row')
        for (let j = 0; j < scale; j++) {
            let _case = document.createElement('div')
                _case.classList.add('_d_case')
                _case.setAttribute('x', j)
                _case.setAttribute('y', i)
                
            _row.append(_case)
        }
        _grid.append(_row)
    }
    _window.append(_grid)
    let _cases = [..._window.querySelectorAll('._d_case')]
    _cases.map((c,i)=>{
        let pos = {
            x: Number(c.getAttribute('x')),
            y: Number(c.getAttribute('y'))
        }
        c.addEventListener('click', ()=>{
            update_demineur(_board[pos.y][pos.x], _board, pos, _grid)
        })
    })
}

function demineur_init(scale = 16, element = 'pixels-demineur', force = 0.1) {
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
                neighbour : 0,
                opened: false
            }
            _board[i][j] = _case
        }
    }
    let _mine = Math.floor(Math.pow(scale, 2) * force)

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
    
    init_game(scale, _window, _board)
}