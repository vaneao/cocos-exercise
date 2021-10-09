const { ccclass, property } = cc._decorator;

@ccclass
export default class GameClear extends cc.Component {

    backToMenu() {
        cc.director.loadScene('StartMenu');
    }
}
