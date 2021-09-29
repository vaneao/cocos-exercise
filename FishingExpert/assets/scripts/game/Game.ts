const { ccclass, property } = cc._decorator;

@ccclass
export default class Game extends cc.Component {

    @property(cc.Node)
    gameOverNode: cc.Node = null;

    onLoad() {
        this.gameOverNode.zIndex = 2;
        this.gameOverNode.active = false;
    }

    over() {
        this.gameOverNode.active = true;
        // 取消所有回调事件
        this.unscheduleAllCallbacks();
    }

    restart() {
        cc.game.restart();
    }
}
