import Coins from "../model/Coins";
import NumUp from "../NumUp";

const { ccclass, property } = cc._decorator;

@ccclass
export default class CoinController extends cc.Component {

    @property(cc.Prefab)
    coinPlusPrefab: cc.Prefab = null;

    @property(cc.Prefab)
    coinsPrefab: cc.Prefab = null;

    @property([cc.Sprite])
    number: cc.Sprite[] = [];

    @property(cc.SpriteAtlas)
    timerAtlas: cc.SpriteAtlas = null;

    @property
    curValue: number = 500;

    @property
    toValue: number = 0;

    coinUpPool: cc.NodePool;
    coinsPool: cc.NodePool;

    // + 金币数字
    coinUp: cc.Node;

    // 获得金币
    oneCoin: cc.Node;

    onLoad() {
        this.coinUpPool = new cc.NodePool();
        this.coinsPool = new cc.NodePool();
        this.setValue(this.curValue);
        this.register();
    }

    onDestroy() {
        this.unregister();
    }

    register() {
        this.node.on('despawn-coins', this.despawnCoins, this);
        this.node.on('despawn-coinup', this.despawnCoinup, this);
    }

    unregister() {
        this.node.off('despawn-coins', this.despawnCoins, this);
        this.node.off('despawn-coinup', this.despawnCoinup, this);
    }

    // 数字固定长度 length，不够的补 0
    prefixInteger(num: number, length: number) {
        return (Array(length).join('0') + num).slice(-length);
    }

    setValue(value: number) {
        const str = this.prefixInteger(value, 6);
        const nums = str.split('');
        for (let i = 0, len = this.number.length; i < len; i++) {
            this.number[i].spriteFrame = this.timerAtlas.getSpriteFrame(nums[i].toString());
        }
    }

    despawnCoins(e: cc.Event) {
        this.coinsPool.put(e.target);
        e.stopPropagation();
    }

    despawnCoinup(e: cc.Event) {
        this.coinUpPool.put(e.target);
        e.stopPropagation();
    }

    // 更新金币数
    updateCoinsNum(value: number) {
        this.curValue += value;
        this.setValue(this.curValue);
    }

    // 发射子弹消耗金币
    reduceCoin(level: number): boolean {
        if (this.curValue >= level) {
            this.setValue(this.curValue -= level);
            return true;
        }
        return false;
    }

    // 生成金币动画
    gainCoins(coinPos: cc.Vec3, coinnum: number) {
        // 上升的数字对象池
        if (this.coinUpPool.size() > 0) {
            this.coinUp = this.coinUpPool.get();
        } else {
            this.coinUp = cc.instantiate(this.coinPlusPrefab);
        }

        this.node.addChild(this.coinUp);
        this.coinUp.getComponent(NumUp).init(coinPos, coinnum);

        // 金币对象池
        if (this.coinsPool.size() > 0) {
            this.oneCoin = this.coinsPool.get();
        } else {
            this.oneCoin = cc.instantiate(this.coinsPrefab);
        }
        this.node.addChild(this.oneCoin);

        // 转为世界坐标
        const world = this.number[3].node.convertToWorldSpaceAR(cc.v3());
        const pos = this.node.convertToNodeSpaceAR(world);
        this.oneCoin.getComponent(Coins).goDown(coinPos, pos);
        this.updateCoinsNum(coinnum);
    }
}
