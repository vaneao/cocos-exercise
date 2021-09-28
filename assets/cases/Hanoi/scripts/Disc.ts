import Game from "./Game";

const { ccclass, property } = cc._decorator;
/** 圆盘颜色 */
const COLOR = [
    { R: 255, G: 217, B: 103 },
    { R: 204, G: 153, B: 204 },
    { R: 244, G: 177, B: 132 },
    { R: 157, G: 195, B: 230 },
    { R: 129, G: 209, B: 142 },
    { R: 255, G: 230, B: 253 },
]

@ccclass
export default class Disc extends cc.Component {

    canvasNode: cc.Node = null;
    canMove: boolean = false;  // 是否可以移动圆盘
    tempPos: cc.Vec3 = cc.v3(0, 0);  // 缓存移动前的坐标

    // 游戏加载时调用
    onLoad() {
        this.canvasNode = cc.find('/Canvas');
        this.registerEvent();
    }

    onDestroy() {
        this.unregisterEvent();
    }

    // 初始化圆盘颜色和大小（discNo:圆盘编号, discNum:圆盘总数量）
    init(discNo: number, discNum: number) {
        const width = this.node.width;
        this.node.color = new cc.Color(COLOR[discNo].R, COLOR[discNo].G, COLOR[discNo].B);
        this.node.setContentSize(cc.size(width * (discNum - discNo), width));
    }

    // 注册事件
    registerEvent() {
        this.node.on(cc.Node.EventType.TOUCH_START, this.touchStart, this);
        this.node.on(cc.Node.EventType.TOUCH_MOVE, this.touchMove, this);
        this.node.on(cc.Node.EventType.TOUCH_END, this.touchEnd, this);
        this.node.on(cc.Node.EventType.TOUCH_CANCEL, this.touchEnd, this);
    }

    // 注销事件
    unregisterEvent() {
        this.node.off(cc.Node.EventType.TOUCH_START, this.touchStart, this);
        this.node.off(cc.Node.EventType.TOUCH_MOVE, this.touchMove, this);
        this.node.off(cc.Node.EventType.TOUCH_END, this.touchEnd, this);
        this.node.off(cc.Node.EventType.TOUCH_CANCEL, this.touchEnd, this);
    }

    touchStart() {
        const gameController = this.canvasNode.getComponent(Game);
        const pos = this.node.position;
        const towerIndex = gameController.getTowerIndex(pos);
        this.tempPos = pos;

        // 拿到当前 touch 的是哪座塔后，再判断当前 touch 的圆盘是否是这座塔上最上面的那个圆盘
        // 如果是，允许移动；否则不允许移动
        if (this.node.width === gameController.getTopDiscWidth(towerIndex)) {
            this.canMove = true;
            this.node.opacity = 200;
        }
    }

    touchMove(e: cc.Event.EventTouch) {
        if (this.canMove) {
            // 算出新坐标
            const newPos = cc.v3(e.getDelta()).add(this.node.position);
            this.node.position = newPos;
        }
    }

    touchEnd() {
        const gameController = this.canvasNode.getComponent(Game);
        // 如果移动到的位置不能放置圆盘，则自动将圆盘放回移动前的位置
        if (!gameController.canPlaceDisc(this.tempPos, this.node)) {
            this.node.position = this.tempPos;
        }

        this.node.opacity = 255;
        this.canMove = false;
        if (gameController.isWin()) {
            cc.log('游戏获胜！');
        }
    }
}