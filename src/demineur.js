
// DOM

function test_case(c, max) {
    const {x,y} = c
    if (0 <= x && x < max && 0 <= y && y < max) {
        return true
    }
    return false
}

function case_drawing(_target, _grid, query, endgame) {
    if (_target.flag === true && !endgame) {
        return false
    }
    let color = ['turquoise', 'yellow', 'red', 'darkblue', 'darkred', 'darkaqua', 'black', 'aztecpurple']
    let _text = _target.spot
    let _node = _grid.querySelector(query)
    _node.classList.add('_d_opened')
    if (_text > 0) {
        _node.setAttribute('style', `color: ${color[_text-1]}`)
        _node.innerText = _text
    }
    _target.opened = true
}

function draw_flag(_target, _grid, query) {
    let _node = _grid.querySelector(query)
    _target.flag = !_target.flag
    _node.classList.toggle('_d_flag')
}

function draw_mine(_target, _grid, query) {
    _target.opened = true
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
        const {x,y} = v.coord
        let query = `._d_case[x="${x}"][y="${y}"]`
        case_drawing(v,_grid, query)
    })
    _loop_section.map((v) => {
        case_opening(v, _board, _grid, false)
    })
}

// victoire

function game_won(_board, _mineMap) {
    let caseCount = Math.pow(_board.length, 2)
    let opened = 0, flagged = 0, mineCount = _mineMap.length
    for (let y = 0; y < _board.length; y++) {
        for (let x = 0; x < _board.length; x++) {
            let _case = _board[y][x]
            _case.flag && _case.mine == 1 ? flagged++ : null
            _case.opened ? opened++ : null
        }
    }
    if (caseCount - opened == flagged && flagged == mineCount) {
        return true
    }
    return false
}

// defaite

function update_all(_board, _grid) {
    for (let y = 0; y < _board.length; y++) {
        for (let x = 0; x < _board.length; x++) {
            let _case = _board[y][x]
            let query = `._d_case[x="${x}"][y="${y}"]`
            if (_case.mine == 1) {
                draw_mine(_case, _grid, query)
            } else {
                case_drawing(_case, _grid, query, "endgame")
            }
        }
    }
}

// initial

function update_demineur(_target, _board, _grid, _sound, e, _mineMap) {
    const {x,y} = _target.coord
    let query = `._d_case[x="${x}"][y="${y}"]`
    const scale = _board.length
    if (e.type === "contextmenu") {
        if (_target.opened === false) {
            draw_flag(_target, _grid, query)
            if (game_won(_board, _mineMap)) {
                update_all(_board, _grid)
            }
        }
    } else {
        if (_target.flag === true || _target.opened === true) {
            return false
        }
        if (_target.mine == 1) {
            _sound.play()
            draw_mine(_target, _grid, query)
            update_all(_board, _grid)
        } else {
            case_opening(_target, _board, _grid, true, query)
            if (game_won(_board, _mineMap)) {
                update_all(_board, _grid)
            }
        }
    }
}

function init_game(scale, _window, _board, _mineMap) {
    let _grid = document.createElement('section')
        _grid.classList.add('_demineur')
    let _ui_top = document.createElement('section')
        _ui_top.classList.add('_demineur_top')

    const _sound = new Audio("src/sound.wav")
    _sound.preload
    _sound.volume = .6

    _window.appendChild(_ui_top)

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
        let x = Number(c.getAttribute('x')),
            y = Number(c.getAttribute('y'));

        const eventMouse = (e) => {
            e.preventDefault()
            e.stopPropagation()
            update_demineur(_board[y][x], _board, _grid, _sound, e, _mineMap)
        }

        c.addEventListener('contextmenu', eventMouse)
        c.addEventListener('click', eventMouse)
    })
}

function demineur_init(scale = 16, element = 'pixels-demineur', force = 0.12) {
    const _window = document.getElementById(element)
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
                spot : 0,
                opened: false,
                flag: false,
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
    init_game(scale, _window, _board, _mineMap)
}