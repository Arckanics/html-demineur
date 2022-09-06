
// global

let _demineur = {
    start : false,
    begin : null,
    status: 0,
    currTime: null,
    timer : null,
    flagleft: 0,
    gameSetting: {
        scale: 14, 
        element: 'pixels-demineur', 
        force: 0.11,
        resetTxt: "reset"
    }
}

// DOM

const timer_display = (ms) => {
    ms = ms/1000
    let min = String(Math.floor(ms / 60)).padStart(2,'0')
    let sec = (ms % 60).toFixed(2).padStart(5,'0')
    return `${min}:${sec}`
}

const test_case = (c, max) => {
    const {x,y} = c
    return (0 <= x && x < max && 0 <= y && y < max) ? true : false
}

const case_drawing = (_target, _grid, query, endgame) => {
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

const draw_flag = (_target, _grid, query) => {
    let _node = _grid.querySelector(query)
    _target.flag = !_target.flag
    _node.classList.toggle('_d_flag')
}

const draw_mine = (_target, _grid, query) => {
    _target.opened = true
    let _node = _grid.querySelector(query)
    _node.classList.add('_d_mine')
}

const case_opening = (_target, _board, _grid, fromUser) => {
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
        case_drawing(v, _grid, query)
    })
    _loop_section.map((v) => {
        case_opening(v, _board, _grid, false)
    })
}

// interface

const ui_update = (cond) => {
    if (cond !== undefined) {
        clearInterval(_demineur.timer)
        if (cond) {
            _demineur.status = 0
        } else {
            _demineur.status = 2
        }
        let reset = document.createElement('button')
        reset.innerText = _demineur.gameSetting.resetTxt
        reset.classList.add('_d_restart')
        _demineur.parent.appendChild(reset)
        reset.addEventListener('click', (e)=>{
            e.preventDefault()
            e.stopPropagation()
            _demineur.status = 0
            _demineur.start = false
            _demineur.flagleft = 0
            demineur_init()
        })
    }
    let emote = _demineur.emotes[_demineur.status]
    let main = _demineur.parent
    main.querySelector('._d_emote').replaceWith(emote)
    main.querySelector('._d_flagCount').innerText = String(_demineur.flagleft).padStart(4, '0')

}


// victoire

const game_won = (_board, _mineMap) => {
    let caseCount = Math.pow(_board.length, 2)
    let opened = 0, flagged = 0, mineCount = _mineMap.length
    for (let y = 0; y < _board.length; y++) {
        for (let x = 0; x < _board.length; x++) {
            let _case = _board[y][x]
            _case.flag && _case.mine == 1 ? flagged++ : null
            _case.opened ? opened++ : null
        }
    }
    if (!_demineur.start) {
        _demineur.start = true
        _demineur.begin = Date.now()
        _demineur.status++
        _demineur.currTime.innerText = timer_display(Date.now() - _demineur.begin)
        _demineur.timer = setInterval(() => {
            _demineur.currTime.innerText = timer_display(Date.now() - _demineur.begin)
        }, 50)
        _demineur.flagleft = mineCount-flagged
        ui_update()
    } else {
        _demineur.flagleft = mineCount-flagged
        ui_update()
    }
    if (caseCount - opened == flagged && flagged == mineCount) {
        return true
    }
    return false
}

// defaite

const update_all = (_board, _grid) => {
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

const update_demineur = (_target, _board, _grid, _sound, e, _mineMap) => {
    const {x,y} = _target.coord
    let query = `._d_case[x="${x}"][y="${y}"]`
    const scale = _board.length
    if (e.type === "contextmenu") {
        if (_target.opened === false) {
            draw_flag(_target, _grid, query)
            if (game_won(_board, _mineMap)) {
                ui_update(true)
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
            ui_update(false)
            update_all(_board, _grid)
        } else {
            case_opening(_target, _board, _grid, true, query)
            if (game_won(_board, _mineMap)) {
                ui_update(true)
                update_all(_board, _grid)
            }
        }
    }
}

const init_game = (scale, _window, _board, _mineMap) => {
    let _grid = document.createElement('section')
        _grid.classList.add('_demineur')
    let _ui_top = document.createElement('section')
        _ui_top.classList.add('_demineur_top')
    
    _window.classList.add('_d_parent')

    const preloadImg = (imgs) => {
        let output = []
        for (let i = 0; i < imgs.length; i++) {
            let img = new Image();
            img.src = imgs[i]
            img.classList.add('_d_emote')
            output.push(img)
        }
        return output;
    }

    _demineur.emotes = preloadImg([
        "/src/emote/win.png",
        "/src/emote/confused.png",
        "/src/emote/loose.png"
    ])

    _demineur.currTime = document.createElement('div')
    _demineur.currTime.setAttribute('class','_d_timer')
    _demineur.currTime.innerText = "00:00.00"
    _demineur.parent = _window
    _demineur.ui_top = _ui_top

    let _emote = document.createElement('img')
    _emote.classList.add('_d_emote')
    let _flag = document.createElement('div')
    _flag.classList.add('_d_flagCount')
    

    _ui_top.appendChild(_demineur.currTime)
    _ui_top.appendChild(_emote)
    _ui_top.appendChild(_flag)


    const _sound = new Audio("src/sound.wav")
    _sound.preload
    _sound.volume = .6

    _window.appendChild(_ui_top)

    ui_update()

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

function demineur_init() {
    const {scale, element, force} = _demineur.gameSetting
    _demineur.start = false
    const _window = document.getElementById(element)
    while (_window.firstChild) {
        _window.firstChild.remove()
    }
    const _head = document.head

    if ([..._head.querySelectorAll('link[href="src/demineur.css"]')].length == 0) {
        const _css = document.createElement('link')
        _css.href = "src/demineur.css"
        _css.rel = "stylesheet"
        _head.append(_css)
    }
    

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