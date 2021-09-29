import CoinController from "../controller/CoinController";
import Game from "../Game";
import Net from "../model/Net";
import Weapon from "../model/Weapon";

const { ccclass, property } = cc._decorator;

@ccclass
export default class BulletSpawn extends cc.Component {

    @property(cc.Prefab)
    bulletPrefab: cc.Prefab = null;

    @property(cc.Prefab)
    netPrefab: cc.Prefab = null;

    @property(cc.Node)
    weaponNode: cc.Node = null;

    @property(cc.Node)
    coinController: cc.Node = null;

    // 子弹对象池
    bulletPool: cc.NodePool;
    netsPool: cc.NodePool;

    oneBullet: cc.Node;
    oneFish: cc.Node;
    oneNet: cc.Node;

    onLoad() {
        this.bulletPool = new cc.NodePool();
        // 网格池
        this.netsPool = new cc.NodePool();
        this.register();
    }

    onDestroy() {
        this.unregister();
    }

    register() {
        // 添加触摸事件
        this.node.on(cc.Node.EventType.TOUCH_START, this.onTouchStart, this);

        this.node.on('despawn-bullet', this.despawnBullet, this);
        this.node.on('despawn-net', this.despawnNet, this);
        this.node.on('cast-net', this.castNet, this);
    }

    unregister() {
        this.node.off(cc.Node.EventType.TOUCH_START, this.onTouchStart, this);
        this.node.off('despawn-bullet', this.despawnBullet, this);
        this.node.off('despawn-net', this.despawnNet, this);
        this.node.off('cast-net', this.castNet, this);
    }

    onTouchStart(e: cc.Event.EventTouch) {
        // 触点是世界坐标，需要转换为和炮台一致的坐标系下
        const touchPos = cc.v3(this.node.convertToNodeSpaceAR(e.getLocation()));
        // 炮台坐标
        const weaponPos = this.weaponNode.position;
        // 炮台到触点的方向向量
        const dir = cc.v3(touchPos).sub(weaponPos);
        // 计算夹角，这个夹角是带方向的
        const angle = Math.atan2(dir.y, dir.x);
        // 将弧度转换为欧拉角
        const degree = angle / Math.PI * 180;
        // 设置炮台角度
        this.weaponNode.angle = degree - 90;
        const bulletLevel = this.weaponNode.getComponent(Weapon).curLevel;

        this.shot(bulletLevel);
    }

    despawnBullet(e: cc.Event.EventCustom) {
        this.bulletPool.put(e.target);
        e.stopPropagation();
    }

    despawnNet(e: cc.Event.EventCustom) {
        this.netsPool.put(e.target);
        e.stopPropagation();
    }

    castNet(e: cc.Event.EventCustom) {
        if (this.netsPool.size() > 0) {
            this.oneNet = this.netsPool.get(this);
        } else {
            this.oneNet = cc.instantiate(this.netPrefab);
        }
        const bullet = e.target;
        const bulletLevel: number = bullet.getComponent('Bullet').bulletLevel;
        this.oneNet.getComponent(Net).init(e.getUserData(), bulletLevel);
        this.node.addChild(this.oneNet);
    }

    // 发射炮弹
    shot(level: number) {
        if (this.bulletPool.size() > 0) {
            this.oneBullet = this.bulletPool.get(this);
        } else {
            this.oneBullet = cc.instantiate(this.bulletPrefab);
        }
        this.node.addChild(this.oneBullet);

        if (this.coinController === null) return;
        const coinController = this.coinController.getComponent(CoinController);
        if (coinController.reduceCoin(level)) {
            this.oneBullet.emit('shot', this.weaponNode, level);
        } else if (coinController.curValue === 0) {
            const gameController = cc.find('/Canvas').getComponent(Game);
            gameController.over();
        }
    }
}
