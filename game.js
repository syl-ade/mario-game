kaboom({
    global:true,
    fullscreen:true,
    scale:1,
    debug: true,
    clearColor: [0,0,0,1],
})

loadRoot('./graphics')
loadSprite('coin', '/coin.png')
loadSprite('evil-shroom','/evil-shroom.png')
loadSprite('brick', '/brick.png')
loadSprite('mario', '/mario.png')
loadSprite('block', '/block.png')
loadSprite('mushroom', '/mushroom.png')
loadSprite('surprise', '/surprise.png')
loadSprite('unboxed', '/unboxed.png')
loadSprite('pipe-bottom-left', '/pipe-bottom-left.png')
loadSprite('pipe-bottom-right', '/pipe-bottom-right.png')
loadSprite('pipe-top-left', '/pipe-top-left.png')
loadSprite('pipe-top-right', '/pipe-top-right.png')



scene ("game", ({level, score}) => {
    layers(['bg', 'obj', 'ui'], 'obj' )

    const maps = [    
        [
            '                                            ',
            '                                            ',
            '                                            ',
            '                                            ',
            '                                            ',
            '                                            ',
            '                                            ',
            '      $%    =*=%=  * =                      ',
            '                                            ',
            '                                            ',
            '                 ^    ^                +  $ ',
            '============================    ============',
        ],
        
    [ 
        
    
    '                                                             ',
    '                                                             ',
    '                                                             ',
    '                                                             ',
    '                                                             ',
    '                                                             ',
    '   $              ===%$%              %                      ',
    '                                                             ',
    '                                                             ',
    '           ^   $        $                   $$          ^  - ',
    '============================    =============================',

],
    [ 
    '                                                                         ',
    '                                                                         ',
    '                                                                         ',
    '                                                                         ',
    '                                                                         ',
    '                                                                         ',
    '                                                                         ',
    '                                                                         ',
    '                                                                         ',
    '============================    ========================================',],
    
    [
    ]
]
    
    const MOVE_SPEED = 120
    const JUMP_FORCE = 360
    const BIG_JUMP_FORCE = 500
    const ENEMY_SPEED = 20
const FALL_DEATH = 400
    let CURRENT_JUMP_FORCE = JUMP_FORCE
    let isJumping = true


    const levelCfg= {
        width: 20,
        height: 20,
        '=':[sprite('block'), solid()],
        '$':[sprite('coin'), 'coin'],
        '%':[sprite('surprise'), solid(),scale(0.5), 'coin-surprise'],
        '*':[sprite('surprise'), solid(), scale(0.5),  'mushroom-surprise'],
        '}':[sprite('unboxed'), solid()],
        '(':[sprite('pipe-bottom-left'), solid(), scale(0.5), 'pipe'],
        ')':[sprite('pipe-bottom-right'), solid(), scale(0.5), 'pipe'],
        '+':[sprite('pipe-top-left'), solid(), scale(0.5), 'pipe'],
        '-':[sprite('pipe-top-right'), solid(), scale(0.5), 'pipe'],
        '^':[sprite('evil-shroom'), solid(), body(), 'dangerous'],
        '#':[sprite('mushroom'), solid(), 'mushroom', body()],


       
    }

    const gameLevel = addLevel(maps[level], levelCfg)

   const scoreLabel = add([
            text(score),
            pos(30,6),
            layer('ui'),
            scale(1.5),
            {
                value: score,
            }
        ])

        add([text('level '+ parseInt(level+1)), pos(4,-20), scale(1.5)])


        function big() {
            let timer = 0
            let isBig = false
            return {
                update() {
                    if (isBig) {
                        timer -= dt()
                        if (timer <= 0) {
                            this.smallify()
                        }
                    }
                },
                isBig() {
                    return isBig
                },
                smalify() {
                    CURRENT_JUMP_FORCE = JUMP_FORCE

                    this.scale = vec2(1)
                    timer = 0
                    isBig = false
                },
                biggify(time) {
                    CURRENT_JUMP_FORCE = BIG_JUMP_FORCE
                    this.scale = vec2(2)
                    timer = time
                    isBig = true
                }
            }
        }

    const player = add([
         sprite('mario'), solid(), 
        pos(30,0),
        body(),
        big(),
        origin('bot')
    ] )

    action('mushroom', (m) => {
        m.move(20,0)
    })
    
    player.on('headbump', (obj) =>{
        if (obj.is('coin-surprise')) {
            gameLevel.spawn('$', obj.gridPos.sub(0,1.5))
            destroy(obj)
            gameLevel.spawn('}', obj.gridPos.sub(0,0))
        }
        if (obj.is('mushroom-surprise')) {
            gameLevel.spawn('#', obj.gridPos.sub(0,1.5))
            destroy(obj)
            gameLevel.spawn('}', obj.gridPos.sub(0,0))
        }
    })
    

    player.collides('mushroom', (m) => {
        destroy(m)
        player.biggify(6)
    })

    player.collides('coin', (c) => {
        destroy(c)
        scoreLabel.value++
        scoreLabel.text=scoreLabel.value
    })

    action('dangerous', (d) => {
        d.move(-ENEMY_SPEED,0)
    })

    player.collides('dangerous', (d) => {
        if (isJumping) {
            destroy(d)
        }else {
        go('lose', {score: scoreLabel.value}) 
        }
    })

    player.action(() => {
        camPos(player.pos)
        if (player.pos.y >=FALL_DEATH) {
            go ('lose', {score: scoreLabel.value})
        }
    })

    player.collides ('pipe', () => {
        keyDown('down', () => {
            go('game', {
                level: (level + 1),
                score: scoreLabel.value,
            })
         })
    })

    keyDown('left', () => {
        player.move(-MOVE_SPEED,0)
    })
    keyDown('right', () => {
        player.move(MOVE_SPEED,0)
    })

    player.action(() => {
        if(player.grounded()) {
            isJumping = false
        }
    })

    keyPress('space', () => {
        if(player.grounded()) {
            isJumping= true
            player.jump(CURRENT_JUMP_FORCE)
        } 
    })
})

scene('lose', ({score})=> {
    add([text(score, 32), origin('center'), pos(width()/2, height()/2)])
})

start("game", {level: 0, score:0})