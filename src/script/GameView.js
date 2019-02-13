export default class Game extends Laya.Script{
    /** @prop {name: Dici, tips: '地刺', type: prefab} */
    /** @prop {name: Normal, tips: '橡皮怪', type: prefab} */

    constructor() {
        super()
    }

    onEnable() {
        this.wallWidth = 45    // 墙宽
        this.jump = 30         // 橡皮怪跳跃的高度
        this.DiciHeight = 140   // 地刺高度
        this.gameOver = false

        let dataSource = []
        for(let i = 0; i < 50; i++) {
            dataSource.push({
                player_name: '' + i,
                player_score: '100'
            })
        }

        this.owner.list_rank.dataSource = dataSource

        this.Dicis = []
        this.Tween = Laya.Tween
        this._gameBox = this.owner.getChildByName('gameBox')
        this.oneCreateDici()
        this.createNormal()

        this.owner.startBtn.on(Laya.Event.CLICK, this, this.startGame)
    }

    startGame() {
        Laya.Scene.open('GameView.scene')
    }

    onStageClick() {
        if(this.gameOver) {
            return
        }
        let NormalPosition = 'left'
        if (this.Normal.x < Laya.stage.width / 2) {         // 橡皮怪在左侧
            NormalPosition = 'left'
        } else {                                            // 橡皮怪在右侧
            NormalPosition = 'right'
        }

        if (Laya.stage.mouseX < Laya.stage.width / 2) {     // 点击的页面左侧
            if (NormalPosition === 'left') {
                // is.Normal.height/2 因为视图中橡皮怪是根据中心点定位的
                this.Tween.to(this.Normal, { x : this.wallWidth + this.jump + this.Normal.width/2 }, 50, Laya.Ease.elasticOut, Laya.Handler.create(this, () => {
                    this.Tween.to(this.Normal, { x : this.wallWidth + this.Normal.width/2 }, 50)
                }))
            } else {
                this.Tween.to(this.Normal, { x : this.wallWidth + this.Normal.width/2 }, 100);
                this.Normal.scaleX = 1
            }
        } else {                                            // 否则点击的右侧
            if (NormalPosition === 'left') {
                this.Tween.to(this.Normal, { x : Laya.stage.width - this.Normal.width - this.wallWidth + this.Normal.width/2 }, 100);
                this.Normal.scaleX = -1
            } else {
                this.Tween.to(this.Normal, { x : Laya.stage.width - this.Normal.width - this.wallWidth + this.Normal.width/2 - this.jump}, 50, Laya.Ease.elasticOut, Laya.Handler.create(this, () => {
                    this.Tween.to(this.Normal, { x : Laya.stage.width - this.Normal.width - this.wallWidth + this.Normal.width/2 }, 50)
                }))
            }
        }

        let n = 0
        this.Dicis.forEach((v, index) => {
            // 要移动的高度为 自身y点坐标 减去 自身的高度
            let y = v.y + v.height
            this.Tween.to(v, { y : y}, 100, null, Laya.Handler.create(this, () => {
                n++
                if (n === this.Dicis.length) {
                    for (let i = 0; i < this.Dicis.length - 1; i++) {
                        if (this.Normal.getBounds().intersects(this.Dicis[i].getBounds())) {
                            this.GameOver()
                            break
                        }
                    }
                }
            }));
        })
        this.checkDici()
    }

    GameOver() {
        this.gameOver = true
        this._gameBox.removeChildren()
        this.owner.gameOver.visible = true
    }

    // 检测第一个地刺是否超出页面
    checkDici() {
        if (this.Dicis[0].y >= Laya.stage.height) {
            this.createDici(this.Dicis[this.Dicis.length - 1].y)
            this.Dicis[0].removeSelf()
            this.Dicis.shift()
        }
    }

    // 首次创建地刺
    oneCreateDici() {
        for(let i = 0; i < 8; i++) {
            this.createDici(Laya.stage.height - (i * this.DiciHeight *2 + (this.DiciHeight + Math.ceil(this.DiciHeight/2)) + 100))
        }
    }

    // 定义创建地刺的方法
    createDici(y) {
        // 生成随机数  如果是1 靠左  2 靠右
        let direction = Math.random() < 0.5 ? 1 : 2
        let Dici = Laya.Pool.getItemByCreateFun('dici', this.Dici.create, this.Dici)
        if (direction === 1) {
            Dici.pos(this.wallWidth + Dici.width/2, y - Dici.height)
        } else {
            Dici.pos(Laya.stage.width-Dici.width - this.wallWidth + Dici.width/2, y - Dici.height)
            Dici.rotation = '180'
        }
        this._gameBox.addChild(Dici)
        this.Dicis.push(Dici)
    }

    // 创建橡皮鬼
    createNormal() {
        this.Normal = Laya.Pool.getItemByCreateFun('normal', this.Normal.create, this.Normal)
        this.Normal.pos(this.wallWidth + this.Normal.width/2, Laya.stage.height - (this.Normal.height/2 + 102))
        this._gameBox.addChild(this.Normal)
    }
}