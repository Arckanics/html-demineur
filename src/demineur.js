

// petite fonctions

function test_case(c, max) {
    const {x,y} = c
    if (0 <= x && x < max && 0 <= y && y < max) {
        return true
    }
    return false
}

function case_drawing(_target, _grid) {
    let color = ['blue', 'green', 'red', 'darkblue', 'darkred', 'darkaqua', 'black', 'aztecpurple']
    const {x,y} = _target.coord
    let query = `._d_case[x="${x}"][y="${y}"]`
    let _text = _target.spot
    let _node = _grid.querySelector(query)
    _node.classList.add('_d_opened')
    if (_text > 0) {
        _node.setAttribute('style', `color: ${color[_text]}`)
        _node.innerText = _text
    }
    _target.opened = true
}

function draw_mine(_target, _grid) {
    if (_target.opened == true) {
        return false;
    }
    const {x,y} = _target.coord
    let query = `._d_case[x="${x}"][y="${y}"]`
    let _node = _grid.querySelector(query)
    _node.classList.add('_d_mine')
}

function case_opening(_target, _board, _grid, fromUser) {
    if (fromUser == true && _target.opened == true) {
        return false;
    }
    
    let _open_section = [_target]
    let _loop_section = []
    let cursor = {..._target.coord}; cursor.x--; cursor.y--;
    for (let _y = 0; _y < 3; _y++) {
        for (let _x = 0; _x < 3; _x++) {
            if (test_case({x:cursor.x+_x,y:cursor.y+_y}, _board.length)) {
                let _case = _board[cursor.y+_y][cursor.x+_x]
                if (_case !== _target) {
                    if (_case.mine == 0 && _case.opened == false) {
                        if (_case.spot > 0) {
                            _open_section.push(_case)
                        } else {
                            _loop_section.push(_case)
                        }
                    }
                }
            }
        }        
    }
    _open_section.map((v)=>{
        case_drawing(v,_grid)
        v.opened = true
    })
    _loop_section.map((v) => {
        case_opening(v, _board, _grid, false)
    })
}

// defaite

function update_all(_board) {
    for (let y = 0; y < _board.length; y++) {
        for (let x = 0; x < _board.length; x++) {
            _board[y][x].opened = true
        }
    }
}



// initial

function update_demineur(_target, _board, _grid) {
    const {x,y} = _target.coord
    const scale = _board.length
    if (_target.mine == 1) {
        draw_mine(_target, _grid)
        update_all(_board)
    } else {
        case_opening(_target, _board, _grid, true)
    }
}

function init_game(scale, _window, _board, _mine) {
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
            update_demineur(_board[pos.y][pos.x], _board, _grid)
        }, true)
    })
}

function demineur_init(scale = 28, element = 'pixels-demineur', force = 0.1) {
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
                spot : 0,
                opened: false,
                coord: {x:j,y:i}
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
            _mineMap.push(_item)
        }
    }

    for (let i = 0; i < _mineMap.length; i++) {
        let _mine = _mineMap[i]
        let _rel_cursor = { x: _mine.coord.x - 1, y: _mine.coord.y -1 }
        let {x,y} = _rel_cursor
        for (let i = 0; i < 3; i++) {
            for (let j = 0; j < 3; j++) {
                try {
                    _board[y+i][x+j].spot++
                } catch {
                    null
                }
            }
        }
    }

    init_game(scale, _window, _board, _mine)
}