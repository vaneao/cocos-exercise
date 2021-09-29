const { ccclass, property } = cc._decorator;

@ccclass
export default class Weapon extends cc.Component {

    @property(cc.Animation)
    anim: cc.Animation = null;

    curLevel: number;
    clipsNum: number;

    onLoad() {
        this.init();
    }

    init() {
        this.curLevel = 1;
        // 获取动画剪辑数
        this.clipsNum = this.anim.getClips().length;
    }

    // +
    plus() {
        if (this.curLevel < this.clipsNum) this.curLevel++;
        this.playAnim();
    }

    // -
    reduce() {
        if (this.curLevel > 1) this.curLevel--;
        this.playAnim();
    }

    // 播放动画
    playAnim() {
        this.anim.play(`weapon_level_${this.curLevel}`);
    }
}