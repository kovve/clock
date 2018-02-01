var __reflect = (this && this.__reflect) || function (p, c, t) {
    p.__class__ = c, t ? t.push(c) : t = [c], p.__types__ = p.__types__ ? t.concat(p.__types__) : t;
};
var PreLoadController = (function () {
    function PreLoadController() {
    }
    PreLoadController.initProgress = function () {
        this.loadedLen = window["main_load_progress"];
    };
    PreLoadController.setProgress = function (current, total) {
        var addnum = Math.floor(current * ((100 - this.loadedLen) / total));
        window["showProgress"](addnum + this.loadedLen);
    };
    PreLoadController.closeProgress = function () {
        window["hideProgress"]();
        // window.hideProgress();
    };
    return PreLoadController;
}());
__reflect(PreLoadController.prototype, "PreLoadController");
