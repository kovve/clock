class PreLoadController{

    private static loadedLen:number;

    public static initProgress():void
    {
        this.loadedLen = window["main_load_progress"];
    }
    public static setProgress(current:number, total:number):void {

        var addnum:number = Math.floor(current*((100- this.loadedLen)/total));

        window["showProgress"](addnum+this.loadedLen);

    }

    public static closeProgress():void
    {
        window["hideProgress"]();
        // window.hideProgress();
    }

}