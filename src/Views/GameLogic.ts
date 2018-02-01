import Shape = egret.Shape;

class GameLogic extends BaseView
{
    private refreshBtn:eui.Image;
    private tipsBtn:eui.Image;
    private scoreTxt:eui.Label;
    private rankBtn:eui.Image;
    private _score:number = 0;
    private thisbg:eui.Image;
    private rewardBtn:eui.Image;//onRewardBtn


    public constructor()
    {
        super();
        this.skinName = "resource/eui_skins/GameSkin.exml";
        this.fullScreen = true;
        this.addBlackBg = false;
        this.once( egret.Event.ADDED_TO_STAGE, this.addToStage, this );
    }

    private gameContainer: eui.Component;
    private addToStage()
    {
        this.width = Layout.getInstance().stage.stageWidth;
        this.height = Layout.getInstance().stage.stageHeight;
        this.touchEnabled = true;

        this.creatSubView();

        this.gameContainer = new eui.Component();
        this.addChild( this.gameContainer );
        this.gameContainer.width = Layout.getInstance().stage.stageWidth;
        this.gameContainer.height = Layout.getInstance().stage.stageHeight;

        this.gameContainer.touchEnabled = this.gameContainer.touchChildren = false;
        this.createBoxMatrix();
        this.gameStart();

        
        EventManager.addEventListener(MyUIEvent.restart_Status, this.onRestart, this);
        EventManager.addEventListener(MyUIEvent.goHome_Status, this.onHome, this);
        EventManager.addEventListener(MyUIEvent.OPEN_TIPS, this.onTips, this);
        EventManager.addEventListener(MyUIEvent.RANK_MODULE, this.onRewardBtn, this);

        if(!GlobalData.isFirstLog)
        {
            GlobalData.isFirstLog = true;
            ModuleManager.getInstance().openModule("GameInfoView");
        }

    }

    // private subView:GameSubView;
    private specilNum:number = 0;
    private creatSubView():void
    {
        this.scoreTxt.text = ""+GlobalData.score;
        this.refreshBtn.addEventListener(egret.TouchEvent.TOUCH_TAP, this.onRestart, this);
        this.tipsBtn.addEventListener(egret.TouchEvent.TOUCH_TAP, this.onTips, this);
        this.rankBtn.addEventListener(egret.TouchEvent.TOUCH_TAP, this.onRank, this);
        this.rewardBtn.addEventListener(egret.TouchEvent.TOUCH_TAP, this.onRewardBtn, this);

        
    }

    private boxArr: Box[][] = [];
    private boxW: number = 100*Layout.getInstance().scale;//80
    private spacing: number = 5*Layout.getInstance().scale;
    private createBoxMatrix()
    {
        var beginY: number = this.stage.stageHeight - ( this.maxRow * ( this.boxW + this.spacing ) - this.spacing ) >> 1;
        var beginX: number = this.stage.stageWidth - ( this.maxCol * ( this.boxW + this.spacing ) - this.spacing ) >> 1;
        console.log("boxW"+this.boxW);
        for ( var i = 0; i < this.maxRow; i++ )
        {
            this.boxArr[i] = [];
            for ( var j = 0; j < this.maxCol; j++ )
            {
                var box: Box = new Box();
                box.x = beginX + this.boxW * 0.5 + j * ( this.boxW + 5 );
                box.y = beginY + this.boxW * 0.5 + i * ( this.boxW + this.spacing );
                this.boxArr[i].push( box );
                this.gameContainer.addChild( box );
            }
        }

    }

    private clocks: Clock[] = [];
    private createClock(isSp:boolean =false)
    {
        if(isSp)
        {
            if(this.specilNum>=DataManager.getInstance().gameVO.specilClockLimit)
            {
                isSp = false;
            }
            else
            {
                this.specilNum++;
            }
            
        }
        var clock: Clock = new Clock(isSp);
        var col, row;
        do
        {
            col = Math.floor( Math.random() * this.maxCol );
            row = Math.floor( Math.random() * this.maxRow );
        } while ( this.boxArr[row][col].haveClock || (this.curRow == row && this.curCol == col))
        this.boxArr[row][col].haveClock = true;
        clock.col = col;
        clock.row = row;
        clock.x = this.boxArr[row][col].x;
        clock.y = this.boxArr[row][col].y;
        this.gameContainer.addChild( clock );
        this.clocks.push( clock );
    }
    
    private initClockMaxCount: number = 9;//10
    private maxCol: number = 6;//7
    private maxRow: number = 9;//10
    private playerIdx: number;
    private allowTouch: boolean;
    private gameStart()
    {
        for ( var i = 0; i < this.clocks.length; i++ )
        {
            this.gameContainer.removeChild( this.clocks[i] );
        }
        this.clocks = [];
        for ( var i = 0; i < this.maxRow; i++ )
        {
            for ( var j = 0; j < this.maxCol; j++ )
            {
                this.boxArr[i][j].haveClock = false;
            }
        }
        this.playerIdx = Math.floor( Math.random() * this.initClockMaxCount );
        for ( var i = 0; i < this.initClockMaxCount; i++ )
        {
            this.createClock();
            if ( i === this.playerIdx )
            {
                this.clocks[i].changeToPlayer();
            }
        }

        this.thisbg.addEventListener( egret.TouchEvent.TOUCH_TAP, this.touchHandler, this );

        this.addEventListener( egret.Event.ENTER_FRAME, this.update, this );
        this.allowTouch = true;
    }
    
    private update()
    {
        if ( !!this.ball && this.gameContainer.contains( this.ball ) )
        {
            this.ball.x += Math.cos( this.ball.angle * Math.PI / 180 ) * this.ball.speed;
            this.ball.y += Math.sin( this.ball.angle * Math.PI / 180 ) * this.ball.speed;
            if ( this.ball.x > this.stage.stageWidth || this.ball.x < 0 || this.ball.y < 0 || this.ball.y > this.stage.stageHeight )
            {
                this.gameOver();
                if ( this.gameContainer.contains( this.ball ) )
                {
                    this.gameContainer.removeChild( this.ball );
                }
                return;
            }
            for ( var i = 0; i < this.clocks.length; i++ ) 
            {
                var clock = this.clocks[i];
                if ( this.hitCheck( this.ball, clock ) )
                {
                    SoundManager.getIns().play("hitSound_mp3");
                    this.playerIdx = i;
                    clock.changeToPlayer();
                    if ( this.gameContainer.contains( this.ball ))
                    {
                        this.gameContainer.removeChild( this.ball );
                    }
                    if(clock.isSpecil)
                    {
                        this.specilNum--;
                        this.score = GlobalData.score + (DataManager.getInstance().gameVO.specilShotScore || 2);
                    }
                    else
                    {
                        // this.score += DataManager.getInstance().gameVO.normalShotScore || 5;
                        this.score = GlobalData.score + (DataManager.getInstance().gameVO.normalShotScore || 2);
                    }

                    this.allowTouch = true;
                }
            }
        }
    }

    private hitCheck( obj1: any, obj2: any ): boolean
    {
        var rect1: egret.Rectangle = obj1.getBounds();
        var rect2: egret.Rectangle = obj2.getBounds();
        rect2.width = rect2.height = obj2.width * obj2.scaleX;
        rect1.x = obj1.localToGlobal().x;
        rect1.y = obj1.localToGlobal().y;
        rect2.x = obj2.localToGlobal().x;
        rect2.y = obj2.localToGlobal().y;
        return rect1.intersects( rect2 );
    }

    private player:Clock;
    private curRow:number;
    private curCol:number;
    private touchHandler()
    {

        if ( this.allowTouch )
        {
            this.allowTouch = false;
            this.player = this.clocks[this.playerIdx] as Clock;
            this.curRow = this.player.row;
            this.curCol = this.player.col;

            this.boxArr[this.player.row][this.player.col].haveClock = false;
            this.createBall( this.player.x, this.player.y, this.player.stick.rotation );
            if ( this.gameContainer.contains( this.player ) )
            {
                this.gameContainer.removeChild( this.player );
            }
            egret.Tween.removeTweens( this.player );
            this.clocks.splice( this.playerIdx, 1 );
            var random:number = (Math.random() * 10);
            // this.createClock(random<3);
            this.createClock();
        }
    }

    private ball: PlayerPoint;
    private createBall( x, y, angle )
    {
        if ( !this.ball )
        {
            this.ball = new PlayerPoint();
        }
        this.ball.x = x;
        this.ball.y = y;
        this.ball.angle = angle - 90;
        this.gameContainer.addChild( this.ball );
    }

    private onRestart(event: egret.TouchEvent):void
    {
        this.score = 0;

        this.destroyGame();
        this.enabled = true;
        // UIManager.getInstance().closeSubPanel(this.endPanl);
        ModuleManager.getInstance().destoryModule("GameEndView");
        this.gameStart();
    }
     private destroy():void
    {
        this.enabled = true;
        ModuleManager.getInstance().destoryModule("GameEndView");

        this.destroyGame();
        this.ball = null;

        this.refreshBtn.removeEventListener(egret.TouchEvent.TOUCH_TAP, this.onRestart, this);
        this.tipsBtn.removeEventListener(egret.TouchEvent.TOUCH_TAP, this.onTips, this);
        this.rankBtn.removeEventListener(egret.TouchEvent.TOUCH_TAP, this.onRank, this);

        EventManager.removeEventListener(MyUIEvent.goHome_Status, this.onHome, this);


    }
    private onHome(event: MyUIEvent):void
    {
        this.destroy();
        ModuleManager.getInstance().destroyForInstance(this);
        ModuleManager.getInstance().openModule("GameStartView");
    }

    /**
     * 打开排行榜
     */
    private onRank(event: egret.TouchEvent):void
    {
        ModuleManager.getInstance().openModule("RankListView");
    }
    private onTips(event: egret.TouchEvent):void
    {
        ModuleManager.getInstance().openModule("GameInfoView");

    }

     private onRewardBtn(event: egret.TouchEvent):void
    {
        ModuleManager.getInstance().openModule("GameRewardsView");

    }

    public set score(num:number)
    {
        this._score = num;
        GlobalData.score = num;
        this.scoreTxt.text = ""+GlobalData.score;

    }
    public get score():number
    {
        return this._score;
    }

    private gameOver()
    {
      SoundManager.getIns().play("gameFail_mp3");
      ModuleManager.getInstance().openModule("GameEndView");
      this.destroyGame(); 
    }
    private destroyGame()
    {
       this.thisbg.removeEventListener( egret.TouchEvent.TOUCH_TAP, this.touchHandler, this );
       this.removeEventListener( egret.Event.ENTER_FRAME, this.update, this );
       for ( var i = 0; i < this.clocks.length; i++ )
        {
            this.gameContainer.removeChild( this.clocks[i] );
            this.clocks[i] = null;
        }
        this.clocks = [];
        if ( this.gameContainer.contains( this.ball ) )
         {
             this.gameContainer.removeChild( this.ball );
        }
    }
}

class Box extends egret.Bitmap
{
    public haveClock: boolean;
    public constructor()
    {
        super();
        this.texture = RES.getRes( "rect_png" );

        this.anchorOffsetX = this.width >> 1;
        this.anchorOffsetY = this.height >> 1;
        // this.fillMode = egret.BitmapFillMode.SCALE;
        // this.scale9Grid = new egret.Rectangle(10,10,60,60);
        this.haveClock = false;
        this.touchEnabled = this.touchEnabled = false;
        this.scaleX = this.scaleY = (100*Layout.getInstance().scale)/this.width;

        
    }
}

class Clock extends egret.DisplayObjectContainer
{
    public dial: egret.Bitmap;
    public stick: egret.Bitmap;
    private animSpeed: number;
    public col: number;
    public row: number;
    public isSpecil:boolean = false;
    public constructor(_isSpecial:boolean = false)
    {
        super();
         this.isSpecil = _isSpecial;
        if(_isSpecial)
        {
            RES.getResByUrl(DataManager.getInstance().gameVO.specilClockURL,this.createItem,this,RES.ResourceItem.TYPE_IMAGE);

            // RES.getResByUrl('resource/assets/specil.jpg',this.createItem,this,RES.ResourceItem.TYPE_IMAGE);
        }
        else
        {
            this.dial = new egret.Bitmap( RES.getRes( "other_png" ) );
            this.init();
        }
        this.touchEnabled = this.touchEnabled = false;
    }
    private createItem(e:any):void
    {
        RES.removeEventListener(RES.ResourceEvent.ITEM_LOAD_ERROR, this.createItem, this);
        var img: egret.Texture = <egret.Texture>e;
        this.dial = new egret.Bitmap( img );
        this.init();
    }
    public init():void
    {
        this.addChild( this.dial );
        this.stick = new egret.Bitmap( RES.getRes( "otherStick_png" ) );
        this.stick.anchorOffsetX = this.stick.width >> 1;
        this.stick.anchorOffsetY = this.stick.height - this.stick.width * 0.5;
        this.stick.x = this.width >> 1;
        this.stick.y = this.height >> 1;
        this.addChild( this.stick );
        this.anchorOffsetX = this.width >> 1;
        this.anchorOffsetY = this.height >> 1;
        this.scaleX = this.scaleY = ((100*Layout.getInstance().scale)/this.width)*(Math.random() * 0.3 + 0.55);
        this.animSpeed = ( Math.random() * 1 + 1 ) * 1e3*1.5;
        this.setAnim();
    }

    public setAnim()
    {
        egret.Tween.get( this.stick, { loop: true })
            .to( { rotation: 360 }, this.animSpeed );
    }

    public changeToPlayer()
    {
        this.dial.texture = RES.getRes( "player_png" );
        this.stick.texture = RES.getRes( "playerStick_png" );
        this.stick.anchorOffsetX = this.stick.width >> 1;
        this.stick.anchorOffsetY = this.stick.height - this.stick.width * 0.5;
        this.stick.x = this.width >> 1;
        this.stick.y = this.height >> 1;
    }
}

class PlayerPoint extends egret.Bitmap
{
    public angle: number;
    public speed: number;
    public constructor()
    {
        super();
        this.texture = RES.getRes( "playerPoint_png" );
        this.anchorOffsetX = this.width >> 1;
        this.anchorOffsetY = this.height >> 1;
        this.scaleX = this.scaleY = 1.45;
        this.speed = DataManager.getInstance().gameVO.pointSpeed || 30;
    }
}