var __reflect = (this && this.__reflect) || function (p, c, t) {
    p.__class__ = c, t ? t.push(c) : t = [c], p.__types__ = p.__types__ ? t.concat(p.__types__) : t;
};
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var Shape = egret.Shape;
var GameLogic = (function (_super) {
    __extends(GameLogic, _super);
    function GameLogic() {
        var _this = _super.call(this) || this;
        _this._score = 0;
        // private subView:GameSubView;
        _this.specilNum = 0;
        _this.boxArr = [];
        _this.boxW = 100 * Layout.getInstance().scale; //80
        _this.spacing = 5 * Layout.getInstance().scale;
        _this.clocks = [];
        _this.initClockMaxCount = 9; //10
        _this.maxCol = 6; //7
        _this.maxRow = 9; //10
        _this.skinName = "resource/eui_skins/GameSkin.exml";
        _this.fullScreen = true;
        _this.addBlackBg = false;
        _this.once(egret.Event.ADDED_TO_STAGE, _this.addToStage, _this);
        return _this;
    }
    GameLogic.prototype.addToStage = function () {
        this.width = Layout.getInstance().stage.stageWidth;
        this.height = Layout.getInstance().stage.stageHeight;
        this.touchEnabled = true;
        this.creatSubView();
        this.gameContainer = new eui.Component();
        this.addChild(this.gameContainer);
        this.gameContainer.width = Layout.getInstance().stage.stageWidth;
        this.gameContainer.height = Layout.getInstance().stage.stageHeight;
        this.gameContainer.touchEnabled = this.gameContainer.touchChildren = false;
        this.createBoxMatrix();
        this.gameStart();
        EventManager.addEventListener(MyUIEvent.restart_Status, this.onRestart, this);
        EventManager.addEventListener(MyUIEvent.goHome_Status, this.onHome, this);
        EventManager.addEventListener(MyUIEvent.OPEN_TIPS, this.onTips, this);
        EventManager.addEventListener(MyUIEvent.RANK_MODULE, this.onRewardBtn, this);
        if (!GlobalData.isFirstLog) {
            GlobalData.isFirstLog = true;
            ModuleManager.getInstance().openModule("GameInfoView");
        }
    };
    GameLogic.prototype.creatSubView = function () {
        this.scoreTxt.text = "" + GlobalData.score;
        this.refreshBtn.addEventListener(egret.TouchEvent.TOUCH_TAP, this.onRestart, this);
        this.tipsBtn.addEventListener(egret.TouchEvent.TOUCH_TAP, this.onTips, this);
        this.rankBtn.addEventListener(egret.TouchEvent.TOUCH_TAP, this.onRank, this);
        this.rewardBtn.addEventListener(egret.TouchEvent.TOUCH_TAP, this.onRewardBtn, this);
    };
    GameLogic.prototype.createBoxMatrix = function () {
        var beginY = this.stage.stageHeight - (this.maxRow * (this.boxW + this.spacing) - this.spacing) >> 1;
        var beginX = this.stage.stageWidth - (this.maxCol * (this.boxW + this.spacing) - this.spacing) >> 1;
        console.log("boxW" + this.boxW);
        for (var i = 0; i < this.maxRow; i++) {
            this.boxArr[i] = [];
            for (var j = 0; j < this.maxCol; j++) {
                var box = new Box();
                box.x = beginX + this.boxW * 0.5 + j * (this.boxW + 5);
                box.y = beginY + this.boxW * 0.5 + i * (this.boxW + this.spacing);
                this.boxArr[i].push(box);
                this.gameContainer.addChild(box);
            }
        }
    };
    GameLogic.prototype.createClock = function (isSp) {
        if (isSp === void 0) { isSp = false; }
        if (isSp) {
            if (this.specilNum >= DataManager.getInstance().gameVO.specilClockLimit) {
                isSp = false;
            }
            else {
                this.specilNum++;
            }
        }
        var clock = new Clock(isSp);
        var col, row;
        do {
            col = Math.floor(Math.random() * this.maxCol);
            row = Math.floor(Math.random() * this.maxRow);
        } while (this.boxArr[row][col].haveClock || (this.curRow == row && this.curCol == col));
        this.boxArr[row][col].haveClock = true;
        clock.col = col;
        clock.row = row;
        clock.x = this.boxArr[row][col].x;
        clock.y = this.boxArr[row][col].y;
        this.gameContainer.addChild(clock);
        this.clocks.push(clock);
    };
    GameLogic.prototype.gameStart = function () {
        for (var i = 0; i < this.clocks.length; i++) {
            this.gameContainer.removeChild(this.clocks[i]);
        }
        this.clocks = [];
        for (var i = 0; i < this.maxRow; i++) {
            for (var j = 0; j < this.maxCol; j++) {
                this.boxArr[i][j].haveClock = false;
            }
        }
        this.playerIdx = Math.floor(Math.random() * this.initClockMaxCount);
        for (var i = 0; i < this.initClockMaxCount; i++) {
            this.createClock();
            if (i === this.playerIdx) {
                this.clocks[i].changeToPlayer();
            }
        }
        this.thisbg.addEventListener(egret.TouchEvent.TOUCH_TAP, this.touchHandler, this);
        this.addEventListener(egret.Event.ENTER_FRAME, this.update, this);
        this.allowTouch = true;
    };
    GameLogic.prototype.update = function () {
        if (!!this.ball && this.gameContainer.contains(this.ball)) {
            this.ball.x += Math.cos(this.ball.angle * Math.PI / 180) * this.ball.speed;
            this.ball.y += Math.sin(this.ball.angle * Math.PI / 180) * this.ball.speed;
            if (this.ball.x > this.stage.stageWidth || this.ball.x < 0 || this.ball.y < 0 || this.ball.y > this.stage.stageHeight) {
                this.gameOver();
                if (this.gameContainer.contains(this.ball)) {
                    this.gameContainer.removeChild(this.ball);
                }
                return;
            }
            for (var i = 0; i < this.clocks.length; i++) {
                var clock = this.clocks[i];
                if (this.hitCheck(this.ball, clock)) {
                    SoundManager.getIns().play("hitSound_mp3");
                    this.playerIdx = i;
                    clock.changeToPlayer();
                    if (this.gameContainer.contains(this.ball)) {
                        this.gameContainer.removeChild(this.ball);
                    }
                    if (clock.isSpecil) {
                        this.specilNum--;
                        this.score = GlobalData.score + (DataManager.getInstance().gameVO.specilShotScore || 2);
                    }
                    else {
                        // this.score += DataManager.getInstance().gameVO.normalShotScore || 5;
                        this.score = GlobalData.score + (DataManager.getInstance().gameVO.normalShotScore || 2);
                    }
                    this.allowTouch = true;
                }
            }
        }
    };
    GameLogic.prototype.hitCheck = function (obj1, obj2) {
        var rect1 = obj1.getBounds();
        var rect2 = obj2.getBounds();
        rect2.width = rect2.height = obj2.width * obj2.scaleX;
        rect1.x = obj1.localToGlobal().x;
        rect1.y = obj1.localToGlobal().y;
        rect2.x = obj2.localToGlobal().x;
        rect2.y = obj2.localToGlobal().y;
        return rect1.intersects(rect2);
    };
    GameLogic.prototype.touchHandler = function () {
        if (this.allowTouch) {
            this.allowTouch = false;
            this.player = this.clocks[this.playerIdx];
            this.curRow = this.player.row;
            this.curCol = this.player.col;
            this.boxArr[this.player.row][this.player.col].haveClock = false;
            this.createBall(this.player.x, this.player.y, this.player.stick.rotation);
            if (this.gameContainer.contains(this.player)) {
                this.gameContainer.removeChild(this.player);
            }
            egret.Tween.removeTweens(this.player);
            this.clocks.splice(this.playerIdx, 1);
            var random = (Math.random() * 10);
            // this.createClock(random<3);
            this.createClock();
        }
    };
    GameLogic.prototype.createBall = function (x, y, angle) {
        if (!this.ball) {
            this.ball = new PlayerPoint();
        }
        this.ball.x = x;
        this.ball.y = y;
        this.ball.angle = angle - 90;
        this.gameContainer.addChild(this.ball);
    };
    GameLogic.prototype.onRestart = function (event) {
        this.score = 0;
        this.destroyGame();
        this.enabled = true;
        // UIManager.getInstance().closeSubPanel(this.endPanl);
        ModuleManager.getInstance().destoryModule("GameEndView");
        this.gameStart();
    };
    GameLogic.prototype.destroy = function () {
        this.enabled = true;
        ModuleManager.getInstance().destoryModule("GameEndView");
        this.destroyGame();
        this.ball = null;
        this.refreshBtn.removeEventListener(egret.TouchEvent.TOUCH_TAP, this.onRestart, this);
        this.tipsBtn.removeEventListener(egret.TouchEvent.TOUCH_TAP, this.onTips, this);
        this.rankBtn.removeEventListener(egret.TouchEvent.TOUCH_TAP, this.onRank, this);
        EventManager.removeEventListener(MyUIEvent.goHome_Status, this.onHome, this);
    };
    GameLogic.prototype.onHome = function (event) {
        this.destroy();
        ModuleManager.getInstance().destroyForInstance(this);
        ModuleManager.getInstance().openModule("GameStartView");
    };
    /**
     * 打开排行榜
     */
    GameLogic.prototype.onRank = function (event) {
        ModuleManager.getInstance().openModule("RankListView");
    };
    GameLogic.prototype.onTips = function (event) {
        ModuleManager.getInstance().openModule("GameInfoView");
    };
    GameLogic.prototype.onRewardBtn = function (event) {
        ModuleManager.getInstance().openModule("GameRewardsView");
    };
    Object.defineProperty(GameLogic.prototype, "score", {
        get: function () {
            return this._score;
        },
        set: function (num) {
            this._score = num;
            GlobalData.score = num;
            this.scoreTxt.text = "" + GlobalData.score;
        },
        enumerable: true,
        configurable: true
    });
    GameLogic.prototype.gameOver = function () {
        SoundManager.getIns().play("gameFail_mp3");
        ModuleManager.getInstance().openModule("GameEndView");
        this.destroyGame();
    };
    GameLogic.prototype.destroyGame = function () {
        this.thisbg.removeEventListener(egret.TouchEvent.TOUCH_TAP, this.touchHandler, this);
        this.removeEventListener(egret.Event.ENTER_FRAME, this.update, this);
        for (var i = 0; i < this.clocks.length; i++) {
            this.gameContainer.removeChild(this.clocks[i]);
            this.clocks[i] = null;
        }
        this.clocks = [];
        if (this.gameContainer.contains(this.ball)) {
            this.gameContainer.removeChild(this.ball);
        }
    };
    return GameLogic;
}(BaseView));
__reflect(GameLogic.prototype, "GameLogic");
var Box = (function (_super) {
    __extends(Box, _super);
    function Box() {
        var _this = _super.call(this) || this;
        _this.texture = RES.getRes("rect_png");
        _this.anchorOffsetX = _this.width >> 1;
        _this.anchorOffsetY = _this.height >> 1;
        // this.fillMode = egret.BitmapFillMode.SCALE;
        // this.scale9Grid = new egret.Rectangle(10,10,60,60);
        _this.haveClock = false;
        _this.touchEnabled = _this.touchEnabled = false;
        _this.scaleX = _this.scaleY = (100 * Layout.getInstance().scale) / _this.width;
        return _this;
    }
    return Box;
}(egret.Bitmap));
__reflect(Box.prototype, "Box");
var Clock = (function (_super) {
    __extends(Clock, _super);
    function Clock(_isSpecial) {
        if (_isSpecial === void 0) { _isSpecial = false; }
        var _this = _super.call(this) || this;
        _this.isSpecil = false;
        _this.isSpecil = _isSpecial;
        if (_isSpecial) {
            RES.getResByUrl(DataManager.getInstance().gameVO.specilClockURL, _this.createItem, _this, RES.ResourceItem.TYPE_IMAGE);
            // RES.getResByUrl('resource/assets/specil.jpg',this.createItem,this,RES.ResourceItem.TYPE_IMAGE);
        }
        else {
            _this.dial = new egret.Bitmap(RES.getRes("other_png"));
            _this.init();
        }
        _this.touchEnabled = _this.touchEnabled = false;
        return _this;
    }
    Clock.prototype.createItem = function (e) {
        RES.removeEventListener(RES.ResourceEvent.ITEM_LOAD_ERROR, this.createItem, this);
        var img = e;
        this.dial = new egret.Bitmap(img);
        this.init();
    };
    Clock.prototype.init = function () {
        this.addChild(this.dial);
        this.stick = new egret.Bitmap(RES.getRes("otherStick_png"));
        this.stick.anchorOffsetX = this.stick.width >> 1;
        this.stick.anchorOffsetY = this.stick.height - this.stick.width * 0.5;
        this.stick.x = this.width >> 1;
        this.stick.y = this.height >> 1;
        this.addChild(this.stick);
        this.anchorOffsetX = this.width >> 1;
        this.anchorOffsetY = this.height >> 1;
        this.scaleX = this.scaleY = ((100 * Layout.getInstance().scale) / this.width) * (Math.random() * 0.3 + 0.55);
        this.animSpeed = (Math.random() * 1 + 1) * 1e3 * 1.5;
        this.setAnim();
    };
    Clock.prototype.setAnim = function () {
        egret.Tween.get(this.stick, { loop: true })
            .to({ rotation: 360 }, this.animSpeed);
    };
    Clock.prototype.changeToPlayer = function () {
        this.dial.texture = RES.getRes("player_png");
        this.stick.texture = RES.getRes("playerStick_png");
        this.stick.anchorOffsetX = this.stick.width >> 1;
        this.stick.anchorOffsetY = this.stick.height - this.stick.width * 0.5;
        this.stick.x = this.width >> 1;
        this.stick.y = this.height >> 1;
    };
    return Clock;
}(egret.DisplayObjectContainer));
__reflect(Clock.prototype, "Clock");
var PlayerPoint = (function (_super) {
    __extends(PlayerPoint, _super);
    function PlayerPoint() {
        var _this = _super.call(this) || this;
        _this.texture = RES.getRes("playerPoint_png");
        _this.anchorOffsetX = _this.width >> 1;
        _this.anchorOffsetY = _this.height >> 1;
        _this.scaleX = _this.scaleY = 1.45;
        _this.speed = DataManager.getInstance().gameVO.pointSpeed || 30;
        return _this;
    }
    return PlayerPoint;
}(egret.Bitmap));
__reflect(PlayerPoint.prototype, "PlayerPoint");
