

export default class StartGameView extends Laya.Scene{
    constructor() {
        super()
        this.loadScene('GameView.scene')
    }

    onEnable() {
        this.startBtn.on(Laya.Event.CLICK, this, this.startGame)
    }

    startGame() {
        Laya.Scene.open('GameView.scene')
    }

}