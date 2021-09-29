import CoinController from "../controller/CoinController";

const { ccclass, property } = cc._decorator;

@ccclass
export default class FishSpawn extends cc.Component {

    @property(cc.Prefab)
    fishPrefab: cc.Prefab = null;

    @property(cc.Node)
    coinController: cc.Node = null;

    // 鱼对象池
    fishPool: cc.NodePool = null;

    onLoad() {
        this.fishPool = new cc.NodePool();
        const initCount = 20;
        for (let i = 0; i < initCount; i++) {
            const fish = cc.instantiate(this.fishPrefab);
            this.fishPool.put(fish);
        }
    }

    start() {
        this.schedule(this.createFish, 2);
        this.node.on('despawn-fish', this.despawnFish, this);
    }

    createFish() {
        const fishCount = 3;
        for (let i = 0; i < fishCount; i++) {
            let fish: cc.Node = null;
            if (this.fishPool.size() > 0) {
                fish = this.fishPool.get();
            } else {
                fish = cc.instantiate(this.fishPrefab);
            }
            this.node.addChild(fish);
        }
    }

    despawnFish(e: cc.Event.EventCustom) {
        const node: cc.Node = e.target;
        const coin = this.coinController.getComponent(CoinController);
        coin.gainCoins(node.position, e.getUserData());
        this.fishPool.put(e.target);
        e.stopPropagation();
    }
}
