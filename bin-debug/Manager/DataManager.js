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
/**
 *
 * @author
 *
 */
var DataManager = (function (_super) {
    __extends(DataManager, _super);
    function DataManager() {
        var _this = _super.call(this) || this;
        _this.gameVO = new GameVo();
        return _this;
    }
    DataManager.getInstance = function () {
        if (this.instance == null) {
            this.instance = new DataManager();
        }
        return this.instance;
    };
    DataManager.prototype.localRankList = function (e) {
        this.localSortList = e;
        if (this.localSortList.length > 1) {
            this.localSortList.sort(this.compare);
        }
        this.localGet = true;
    };
    DataManager.prototype.nationRankList = function (e) {
        this.nationSortList = e;
        if (this.nationSortList.length > 1) {
            this.nationSortList.sort(this.compare);
        }
        this.nationGet = true;
    };
    DataManager.prototype.compare = function (a, b) {
        var scoreA = parseInt(a["userScore"]);
        var scoreB = parseInt(b["userScore"]);
        if (scoreA > scoreB) {
            return -1;
        }
        else if (scoreA < scoreB) {
            return 1;
        }
        return 0;
    };
    DataManager.prototype.updateGameVo = function (obj) {
        this.gameVO = GameVo.createVo(obj);
        console.log(this.gameVO);
    };
    return DataManager;
}(egret.EventDispatcher));
__reflect(DataManager.prototype, "DataManager");
