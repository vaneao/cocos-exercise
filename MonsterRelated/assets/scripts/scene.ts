const { ccclass, property } = cc._decorator;

@ccclass
export default class Scene extends cc.Component {

    @property(cc.AudioClip)
    backgroundAudio: cc.AudioClip = null;

    @property(cc.AudioClip)
    mouseEnterAudio: cc.AudioClip = null;

    @property(cc.AudioClip)
    mouseUpAudio: cc.AudioClip = null;

    @property(cc.Node)
    mask: cc.Node = null;

    @property(cc.Node)
    gameMenu: cc.Node = null;

    isGameMenu: boolean = false;
    backgroundAudioID: number = null;
    children: cc.Node[] = null;
    grandchild: cc.Node[] = null;

    onLoad() {
        this.init();
    }

    onDestroy() {
        cc.audioEngine.stop(this.backgroundAudioID);
        cc.systemEvent.off(cc.SystemEvent.EventType.KEY_DOWN, this.onKeyDown, this);
    }

    init() {
        if (this.gameMenu) {
            // 启用物理引擎
            cc.director.getPhysicsManager().enabled = true;
            cc.systemEvent.on(cc.SystemEvent.EventType.KEY_DOWN, this.onKeyDown, this);
        }
        // 预加载场景
        const curScene = cc.director.getScene();
        if (curScene.name === 'StartMenu') {
            cc.director.preloadScene('main');
            cc.director.preloadScene('GameOver');
        }

        // 为每个按钮绑定鼠标交互声音
        this.children = this.node.children;
        for (let i = 0, len = this.children.length; i < len; i++) {
            this.grandchild = this.children[i].children;
            for (let j = 0, grandLen = this.grandchild.length; j < grandLen; j++) {
                if (this.grandchild[j].getComponent(cc.Button)) {
                    this.grandchild[j].on(cc.Node.EventType.MOUSE_ENTER, this.onMouseEnter, this);
                    this.grandchild[j].on(cc.Node.EventType.MOUSE_UP, this.onMouseUp, this);
                }
            }
        }

        if (this.backgroundAudio) {
            this.backgroundAudioID = cc.audioEngine.play(this.backgroundAudio, true, 1);
        }
    }

    // 鼠标移入音效
    onMouseEnter() {
        cc.audioEngine.play(this.mouseEnterAudio, false, 1);
    }

    // 鼠标抬起音效
    onMouseUp() {
        cc.audioEngine.play(this.mouseUpAudio, false, 1);
    }

    openMenu() {
        cc.director.pause();
        this.isGameMenu = true;
        this.mask.active = true;
        this.gameMenu.active = true;
    }

    closeMenu() {
        cc.director.resume();
        this.isGameMenu = false;
        this.mask.active = false;
        this.gameMenu.active = false;
    }

    startGame() {
        cc.director.loadScene('main');
    }

    tryAgain() {
        cc.director.loadScene('main');
    }

    backToMenu() {
        cc.director.loadScene('StartMenu');
    }

    onKeyDown(e) {
        switch (e.keyCode) {
            case cc.macro.KEY.escape:
                if (!this.isGameMenu) {
                    this.openMenu();
                } else {
                    this.closeMenu();
                }
                break;
        }
    }
}
