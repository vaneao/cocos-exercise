import Game from "../Game";
import Bullet from "./Bullet";
import { FishState, FishType } from "./FishType";

const { ccclass, property } = cc._decorator;

@ccclass
export default class Fish extends cc.Component {

    @property(cc.SpriteAtlas)
    spAtlas: cc.SpriteAtlas = null;

    @property(cc.JsonAsset)
    jsonData: cc.JsonAsset = null;

    anim: cc.Animation = null;

    // Health point 血量 默认 10
    hp: number = 10;

    // gold 打死掉落金币数量
    gold: number = 2;

    // fish state 鱼的生命状态，默认都是活的
    fishState: FishState = FishState.alive;

    // 保存上一次坐标，用于更新角度
    lastPosition: cc.Vec3;

    allFishType: FishType[];
    fishType: FishType;

    // 暂存 game 实例
    game: Game;

    // 鱼移动的贝塞尔曲线
    bezier1: cc.Vec2[] = [cc.v2(50, -100), cc.v2(300, -400), cc.v2(1800, -650)];
    bezier2: cc.Vec2[] = [cc.v2(100, -200), cc.v2(400, -300), cc.v2(1800, -600)];
    bezier3: cc.Vec2[] = [cc.v2(150, -300), cc.v2(600, -400), cc.v2(1800, -500)];
    bezier4: cc.Vec2[] = [cc.v2(50, 50), cc.v2(400, 100), cc.v2(1800, 200)];
    bezier5: cc.Vec2[] = [cc.v2(80, 200), cc.v2(300, 500), cc.v2(1800, 650)];
    bezier6: cc.Vec2[] = [cc.v2(100, 100), cc.v2(350, 400), cc.v2(1800, 500)];
    bezier7: cc.Vec2[] = [cc.v2(100, 2), cc.v2(350, -2), cc.v2(1800, 0)];
    bezierArray: cc.Vec2[][];

    onLoad() {
        this.init();
    }

    onEnable() {
        this.spawnFish();
        this.node.getComponent(cc.BoxCollider).enabled = true;
    }

    update(dt) {
        this.updateDegree();
    }

    init() {
        this.bezierArray = [];
        this.bezierArray.push(this.bezier1);
        this.bezierArray.push(this.bezier2);
        this.bezierArray.push(this.bezier3);
        this.bezierArray.push(this.bezier4);
        this.bezierArray.push(this.bezier5);
        this.bezierArray.push(this.bezier6);
        this.bezierArray.push(this.bezier7);

        this.anim = this.node.getComponent(cc.Animation);
        this.allFishType = this.jsonData.json;
    }

    spawnFish() {
        const fishStr = this.allFishType.length;
        const randomFish = Math.floor(Math.random() * fishStr);
        this.fishType = this.allFishType[randomFish];
        const sprite = this.node.getComponent(cc.Sprite);
        sprite.spriteFrame = this.spAtlas.getSpriteFrame(`${this.fishType.name}_run_0`);

        // 设置鱼的血量
        this.hp = this.fishType.hp;

        // 掉落金币
        this.gold = this.fishType.gold;
        this.fishState = FishState.alive;
        this.anim.play(`${this.fishType.name}_run`);

        const pos = cc.v3(-Math.random() * 100 - 200, (Math.random() - 0.5) * 2 * 300 + 350);
        const canvas = cc.Canvas.instance;
        this.node.position = canvas.node.convertToNodeSpaceAR(pos);
        const index = Math.floor(Math.random() * this.bezierArray.length);
        const bezier = this.bezierArray[index];

        // 贝塞尔曲线第一个控制点，用来计算初始角度
        const firstPos = bezier[0];
        const k = Math.atan(firstPos.y / firstPos.x);
        this.node.angle = -k * 180 / Math.PI;

        this.lastPosition = this.node.position;
        this.changeCollider();
        this.swimming(bezier);
    }

    // 重新设置碰撞区域
    changeCollider() {
        const collider = this.node.getComponent(cc.BoxCollider);
        collider.size = this.node.getContentSize();
    }

    // 小鱼游泳，贝塞尔曲线实现
    swimming(trace: cc.Vec2[]) {
        const windowSize = cc.winSize;
        const speed = Math.random() * 10 + 10;
        cc.tween(this.node)
            .bezierBy(speed, trace[0], trace[1], trace[2])
            .start();
    }

    updateDegree() {
        const curPos = this.node.position;
        // 如果位移不超过1，不改变角度
        if (this.lastPosition.sub(curPos).mag() < 1) return;
        // 移动的方向向量
        const dir = curPos.sub(this.lastPosition);

        const radin = Math.atan2(dir.y, dir.x);
        this.node.angle = cc.misc.radiansToDegrees(radin);
        this.lastPosition = curPos;
    }

    beAttack() {
        if (this.isDie()) {
            // 停止贝塞尔曲线动作
            this.node.stopAllActions();
            // 播放死亡动画
            this.anim.play(`${this.fishType.name}_die`);
            // 被打死的动画播放完成后回调 // 死亡动画播放完回收鱼
            this.anim.on(cc.Animation.EventType.FINISHED, this.despawnFish, this);
            // 播放金币动画
            this.node.parent.convertToWorldSpaceAR(this.node.position);
        }
    }

    // 碰撞检测，鱼被打死的逻辑
    isDie(): boolean {
        if (this.fishState === FishState.dead) return true;
        return false;
    }

    despawnFish() {
        const e = new cc.Event.EventCustom('despawn-fish', true);
        e.setUserData(this.gold);
        this.node.dispatchEvent(e);
        this.node.getComponent(cc.BoxCollider).enabled = true;
    }

    onCollisionEnter(other: cc.BoxCollider, self: cc.BoxCollider) {
        if (this.isDie()) return;
        if (other.node.group === 'bullet') {
            const bullet = other.node.getComponent(Bullet);
            this.hp -= bullet.getAttackValue();

            if (this.hp <= 0) {
                this.fishState = FishState.dead;
                this.beAttack();
            }
        }
    }
}
