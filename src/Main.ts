//////////////////////////////////////////////////////////////////////////////////////
//
//  Copyright (c) 2014-present, Egret Technology.
//  All rights reserved.
//  Redistribution and use in source and binary forms, with or without
//  modification, are permitted provided that the following conditions are met:
//
//     * Redistributions of source code must retain the above copyright
//       notice, this list of conditions and the following disclaimer.
//     * Redistributions in binary form must reproduce the above copyright
//       notice, this list of conditions and the following disclaimer in the
//       documentation and/or other materials provided with the distribution.
//     * Neither the name of the Egret nor the
//       names of its contributors may be used to endorse or promote products
//       derived from this software without specific prior written permission.
//
//  THIS SOFTWARE IS PROVIDED BY EGRET AND CONTRIBUTORS "AS IS" AND ANY EXPRESS
//  OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES
//  OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED.
//  IN NO EVENT SHALL EGRET AND CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT,
//  INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT
//  LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;LOSS OF USE, DATA,
//  OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF
//  LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING
//  NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE,
//  EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
//
//////////////////////////////////////////////////////////////////////////////////////

class Main extends eui.UILayer {
    /**
     * 加载进度界面
     * loading process interface
     */
    private loadingView: LoadingUI;
    protected createChildren(): void {
        super.createChildren();

        //修改游戏文件名

        egret.ImageLoader.crossOrigin = "anonymous";
        Layout.getInstance().init(this.stage);
        //
        egret.lifecycle.addLifecycleListener((context) => {
            // custom lifecycle plugin
        })

        
        egret.lifecycle.onPause = () => {
            egret.ticker.pause();
        }

        egret.lifecycle.onResume = () => {
            egret.ticker.resume();
        }

        //注入自定义的素材解析器
        let assetAdapter = new AssetAdapter();
        egret.registerImplementation("eui.IAssetAdapter", assetAdapter);
        egret.registerImplementation("eui.IThemeAdapter", new ThemeAdapter());
        //Config loading process interface
        
        // this.loadingView = new LoadingUI();
        // this.stage.addChild(this.loadingView);
        PreLoadController.initProgress();

        PlayerInfoProxy.getInstance().getMyInfo();//查询用户信息


        //游戏配置
        EventManager.addEventListener(CommonEvent.GET_INFO_SUCESS,this.loadGameDataBack,this);

        HttpCommand.getInstance().getGameConfig();
    }

    private loadGameDataBack():void
    {

        var vc: RES.VersionController = new RES.VersionController();
        vc.getVirtualUrl = function (url: string): string {
            return url + '?v=' + GlobalData.version;
        };
        RES.registerVersionController(vc);
        EventManager.removeEventListener(CommonEvent.GET_INFO_SUCESS,this.loadGameDataBack,this)
        document.title = DataManager.getInstance().gameVO.appName || "时钟射手";
        RES.addEventListener(RES.ResourceEvent.CONFIG_COMPLETE, this.onConfigComplete, this);
        RES.loadConfig("resource/default.res.json", "resource/");
    }
    /**
     * 配置文件加载完成,开始预加载皮肤主题资源和preload资源组。
     * Loading of configuration file is complete, start to pre-load the theme configuration file and the preload resource group
     */
    private onConfigComplete(event: RES.ResourceEvent): void {
        RES.removeEventListener(RES.ResourceEvent.CONFIG_COMPLETE, this.onConfigComplete, this);
        // load skin theme configuration file, you can manually modify the file. And replace the default skin.
        //加载皮肤主题配置文件,可以手动修改这个文件。替换默认皮肤。
        let theme = new eui.Theme("resource/default.thm.json", this.stage);
        theme.addEventListener(eui.UIEvent.COMPLETE, this.onThemeLoadComplete, this);

        RES.addEventListener(RES.ResourceEvent.GROUP_COMPLETE, this.onResourceLoadComplete, this);
        RES.addEventListener(RES.ResourceEvent.GROUP_LOAD_ERROR, this.onResourceLoadError, this);
        RES.addEventListener(RES.ResourceEvent.GROUP_PROGRESS, this.onResourceProgress, this);
        RES.addEventListener(RES.ResourceEvent.ITEM_LOAD_ERROR, this.onItemLoadError, this);
        RES.loadGroup("game");
    }
    private isThemeLoadEnd: boolean = false;
    /**
     * 主题文件加载完成,开始预加载
     * Loading of theme configuration file is complete, start to pre-load the 
     */
    private onThemeLoadComplete(): void {
        this.isThemeLoadEnd = true;
        this.createScene();
    }
    private isResourceLoadEnd: boolean = false;
    /**
     * preload资源组加载完成
     * preload resource group is loaded
     */
    private onResourceLoadComplete(event: RES.ResourceEvent): void {
        if (event.groupName == "game") {
            // this.stage.removeChild(this.loadingView);
            RES.removeEventListener(RES.ResourceEvent.GROUP_COMPLETE, this.onResourceLoadComplete, this);
            RES.removeEventListener(RES.ResourceEvent.GROUP_LOAD_ERROR, this.onResourceLoadError, this);
            RES.removeEventListener(RES.ResourceEvent.GROUP_PROGRESS, this.onResourceProgress, this);
            RES.removeEventListener(RES.ResourceEvent.ITEM_LOAD_ERROR, this.onItemLoadError, this);
            this.isResourceLoadEnd = true;
           
            this.createScene();
        }
    }
    private createScene() {
        if (this.isThemeLoadEnd && this.isResourceLoadEnd) {
            this.init();
            RES.addEventListener(RES.ResourceEvent.ITEM_LOAD_ERROR, this.onBgLoaderro, this);
            if(DataManager.getInstance().gameVO.bgImage)
            {
                this.createBG(null);
                // RES.getResByUrl(DataManager.getInstance().gameVO.bgImage,this.createBG,this,RES.ResourceItem.TYPE_IMAGE);
                // RES.getResByUrl('http://game.hslmnews.com/resource/assets/GameBG.jpg',this.createBG,this,RES.ResourceItem.TYPE_IMAGE);
            }
            else
            {
                // alert("背景图片没有配置！")
                this.createBG(null);
            }

        }
    }
    /**
     * 资源组加载出错
     *  The resource group loading failed
     */
    private onItemLoadError(event: RES.ResourceEvent): void {
        console.warn("Url:" + event.resItem.url + " has failed to load");
    }
    /**
     * 资源组加载出错
     * Resource group loading failed
     */
    private onResourceLoadError(event: RES.ResourceEvent): void {
        //TODO
        console.warn("Group:" + event.groupName + " has failed to load");
        //忽略加载失败的项目
        //ignore loading failed projects
        this.onResourceLoadComplete(event);
    }
    /*背景加载失败*/
    private onBgLoaderro():void
    {
        // RES.getResByUrl('resource/assets/GameBG.jpg',this.createBG,this,RES.ResourceItem.TYPE_IMAGE);
        // alert("背景配置错误")
    }
    /**
     * preload资源组加载进度
     * loading process of preload resource
     */
    private onResourceProgress(event: RES.ResourceEvent): void {
        if (event.groupName == "game") {
            PreLoadController.setProgress(event.itemsLoaded, event.itemsTotal);
            // this.loadingView.setProgress(event.itemsLoaded, event.itemsTotal);
        }
    }
    /**
     * 创建场景界面
     * Create scene interface
     */
     private init():void
    {

        GlobalData.GameStage = this.stage;
        GlobalData.GameStage_width = this.stage.stageWidth; //egret.MainContext.instance.stage.stageWidth;
        GlobalData.GameStage_height = this.stage.stageHeight; //egret.MainContext.instance.stage.stageHeight;

        UIManager.getInstance().startGame();
    }
    private bg: egret.Bitmap;
    private createBG(e:any)
    {

        RES.removeEventListener(RES.ResourceEvent.ITEM_LOAD_ERROR, this.onBgLoaderro, this);
        var img: egret.Texture = <egret.Texture>e;
        if(img)
        {
            this.bg = new egret.Bitmap( img );
        }
        else
        {
            this.bg = new egret.Bitmap( RES.getRes( "GameBG_jpg" ) );
        }
        // this.bg.width = this.stage.stageWidth;
        // this.bg.height = this.stage.stageHeight;
        UIManager.getInstance().mapLevel.addChild( this.bg );

        PreLoadController.closeProgress();
        // SoundManager.getIns().addBgMusic("http://game.hslmnews.com/bg_music.mp3");

        this.startCreateScene();

    }

    protected startCreateScene(): void {
        ModuleManager.getInstance().openModule("GameStartView");
    }
}