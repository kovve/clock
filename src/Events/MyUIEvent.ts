/**
 *
 * @author 
 *
 */
class MyUIEvent extends egret.Event{
    public constructor(type: string,bubbles: boolean = false,cancelable: boolean = false) {
        super(type,bubbles,cancelable);
    }
	
    public data:any = null;

    public static restart_Status: string = "restart_status";

    public static goHome_Status: string = "goHome_Status";

    public static OPEN_TIPS:string = "OPEN_TIPS";

    public static RANK_MODULE:string = "RANK_MODULE";
    
}
