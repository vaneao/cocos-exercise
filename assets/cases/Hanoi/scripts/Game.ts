const { ccclass, property } = cc._decorator;
const TOWER = {
    ONE: 0,
    TWO: 1,
    THREE: 2
}

@ccclass
export default class Game extends cc.Component {

    @property(cc.Node)
    discLayer: cc.Node = null;  // 圆盘层

    @property(cc.Node)
    disc: cc.Node = null;  // 圆盘

    @property([cc.Node])
    towers: cc.Node[] = [];  // 第一座塔

    @property(cc.Node)
    levelNode: cc.Node = null;  // 关卡节点

    @property(cc.Node)
    hanoiNode: cc.Node = null;  // hanoi 节点

    @property(cc.Node)
    winPopupNode: cc.Node = null;  // 弹窗节点

    @property([cc.Node])
    levels: cc.Node[] = [];  // 关卡

    @property(cc.AudioClip)
    hit: cc.AudioClip = null;  // 圆盘放置音效

    @property(cc.AudioClip)
    win: cc.AudioClip = null;  // 获胜音效

    // 分别存储塔以及圆盘的宽度 [塔的编号][圆盘的编号] = 某个圆盘的宽度
    // 比如:[0][1] 代表第一座塔的第二个圆盘的宽度，依次类推
    discArr: number[][] = [];

    towerNum: number = 3;  // 塔的数量 
    discNum: number = 3;  // 初始化圆盘数量

    onLoad() {
        this.resetGame();
    }

    // 重置游戏
    resetGame() {
        this.winPopupNode.active = false;
        this.levelNode.active = true;
        this.hanoiNode.active = false;

        // 销毁节点
        this.discLayer.removeAllChildren();
        this.discLayer.destroyAllChildren();
    }

    // 选择难度
    selectLevel(e: cc.Event.EventTouch) {
        this.discNum = Number(e.target.name);

        this.levelNode.active = false;
        this.hanoiNode.active = true;
        this.discLayer.active = true;

        this.initDiscArr();
        this.initDisc();
    }

    // 初始化塔和对应的圆盘宽度数组
    initDiscArr() {
        this.discArr.length = this.discNum;
        for (let i = 0; i < this.discNum; i++) {
            this.discArr[i] = [];
        }
    }

    // 初始化圆盘位置
    initDisc() {
        const num = this.discNum;
        for (let i = 0; i < num; i++) {
            const discNode = cc.instantiate(this.disc);
            discNode.x = this.towers[0].x + 2;
            discNode.y = 46 * i - 273.7;
            // 圆盘从大到小，从下到上放置在第一个汉诺塔上
            discNode.getComponent('Disc').init(i, num);
            discNode.active = true;
            // 将初始化好的圆盘添加到圆盘层
            this.discLayer.addChild(discNode, 10, `disc_${i + 1}`);
            // 将初始化好的圆盘添加到圆盘宽度数组中
            this.discArr[0].push(discNode.width);
        }
    }

    // 获取移动的是哪个塔上的圆盘，或者可以判断当前圆盘坐标是否在某座塔上
    getTowerIndex(pos: cc.Vec3) {
        for (let i = 0; i < this.towerNum; i++) {
            let tower = this.hanoiNode.children[i];
            // 如果当前 touch 的节点坐标包含在某个塔上，返回是哪座塔（塔的编号）
            if (tower.getBoundingBox().contains(cc.v2(pos))) return i;
        }
        // 每座塔上都没有找到，返回 -1
        return -1;
    }

    // 判断当前移动到的位置是否能放置圆盘
    canPlaceDisc(startPos: cc.Vec3, discNode: cc.Node) {
        const oldTowerIndex = this.getTowerIndex(startPos);
        const newTowerIndex = this.getTowerIndex(discNode.position);

        // 移动到的坐标不在任何一座塔上，或者移动圆盘宽度大于目标塔顶层圆盘宽度，不允许放置
        if (oldTowerIndex === -1 || newTowerIndex === -1 ||
            !this.placeDisc(oldTowerIndex, newTowerIndex)) {
            return false;
        }

        const newTower = this.hanoiNode.children[newTowerIndex];
        discNode.x = newTower.x + 2;
        discNode.y = 46 * (this.discArr[newTowerIndex].length - 1) - 273.7;
        cc.audioEngine.play(this.hit, false, 1);
        return true;
    }

    // 放置圆盘（将圆盘从原始塔放入目标塔）
    placeDisc(oldTowerIndex: number, newTowerIndex: number): boolean {
        // 如果塔的编号大于已有塔的数量、塔的编号小于0、移动前和移动后在同一座塔，都不允许放置圆盘
        if (oldTowerIndex >= this.discArr.length || oldTowerIndex < 0
            || newTowerIndex >= this.discArr.length || newTowerIndex < 0
            || oldTowerIndex === newTowerIndex) {
            return false;
        }

        // oldTowerHeight: 旧塔的高度（旧塔 = 原始塔）
        const oldTowerHeight = this.discArr[oldTowerIndex].length;
        // newTowerHeight: 新塔的高度（新塔 = 目标塔）
        const newTowerHeight = this.discArr[newTowerIndex].length;
        // oldWidth: 旧塔最顶层圆盘的宽度（也就是正在移动的那个圆盘的宽度）
        const oldWidth = this.discArr[oldTowerIndex][oldTowerHeight - 1];
        // newWidth: 新塔最顶层圆盘的宽度
        const newWidth = this.discArr[newTowerIndex][newTowerHeight - 1];
        // 移动圆盘的宽度大于新塔最顶层圆盘的宽度
        if (oldWidth > newWidth) {
            return false;
        }

        // moveDisc：当前移动的那个圆盘（更新 discArr，从旧塔移除，然后放入新塔）
        const moveDisc = this.discArr[oldTowerIndex].pop();
        this.discArr[newTowerIndex].push(moveDisc);
        return true;
    }

    // 获取某座塔上最上面那个圆盘的宽度
    getTopDiscWidth(towerIndex: number) {
        const tower = this.discArr[towerIndex];
        return tower[tower.length - 1];
    }

    // 判断当前游戏是否获胜（所有圆盘从第一座塔都移动到其他任意一座塔上后，视为获胜）
    isWin() {
        if (this.discArr[TOWER.TWO].length === this.discNum ||
            this.discArr[TOWER.THREE].length === this.discNum) {
            // 播放游戏获胜音效
            cc.audioEngine.play(this.win, false, 1);
            // 展示弹窗
            this.hanoiNode.active = false;
            this.discLayer.active = false;
            this.winPopupNode.active = true;

            return true;
        }
        return false;
    }
}
