import { NativeService } from './../../../../icommon/provider/native';
import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { globalData } from '../../../../icommon/provider/globalData';
import { HttpClient } from '@angular/common/http';
import { ENV } from '@env/environment';
import { Keyboard } from '@ionic-native/keyboard';
import { weekList } from '../../../../icommon/provider/utils';
import { entryUri6, saveEntityUri6 } from '../../../../icommon/provider/Constants';
import { Events } from 'ionic-angular';


@IonicPage()
@Component({
    selector: 'page-goout-editor',
    templateUrl: 'goout-editor.html'
})

export class GooutEditorPage {
    editingEntry: any;
    editable: any;
    wfHolderObj: any;
    opinionList: any;
    update: any;
    btns: any;
    isTodo: any;
    weekab: any;
    weekab2: any;
    opinion: any;
    startHour: any;
    endHour: any;
    isBack:any;
    datamore: any = {};
    collspaed2: boolean = false;//更多详情收展
    procedureStatus:any;
    constructor(private events: Events, public NativeService: NativeService, public http: HttpClient, public globalData: globalData, public navCtrl: NavController, public navParams: NavParams, private keyboard: Keyboard) {
        this.editable = this.navParams.get("opeType") == 'view' ? false : true;
        this.procedureStatus = this.navParams.get("entry").procedureStatus;
        if (this.navParams.get("opeType") == 'update') {
            this.update = true
        }
    }
    ionViewDidLoad() {
        this.getEditingEntry()
        this.wfHolder()
        this.datamore.url = saveEntityUri6;
        this.keyboard.onKeyboardWillShow().subscribe(data => {
            if (this.NativeService.isAndroid()) {
                this.datamore.btnscroll = true;
                this.datamore.btnscollHeight = data.keyboardHeight;
                this.events.publish('btnscroll', this.datamore);
            }
        })
        this.keyboard.onKeyboardWillHide().subscribe(data => {
            if (this.NativeService.isAndroid()) {
                this.datamore.btnscroll = false;
                this.events.publish('btnscroll', this.datamore);
            }
        })
    }
    // 获取详情信息
    getEditingEntry() {
        this.http.get(ENV.httpurl + entryUri6 + '/' + this.navParams.get("id")).subscribe(async data => {
            this.editingEntry = data;
            this.startHour = this.editingEntry.startType == "A" ? "上午" : "下午";
            this.endHour = this.editingEntry.endType == "A" ? "上午" : "下午";
            this.weekab = weekList[new Date(this.editingEntry.startDate).getDay()];
            this.weekab2 = weekList[new Date(this.editingEntry.endDate).getDay()];
            this.isBack = this.editingEntry.isBack =="yes" ? true :false;
        })
    }
    // 获取工作流配置、实例信息
    wfHolder() {
        let that = this
        if (!!this.navParams.get("wfAlias")) {
            this.globalData.getHolderFromWfAliasRef(this.navParams.get("wfAlias"), this.navParams.get("ref"), null).subscribe(async data => {
                this.wfHolderObj = this.globalData.compOtherInfo(data);
                this.isTodo = this.wfHolderObj.isTodo()
                this.btns = this.wfHolderObj.btns() //获取按钮
                this.globalData.setProc(this.wfHolderObj.btns()) //给按钮设置函数
                await that.getOptionAll(this.wfHolderObj)
            })
        }
    }
    // 获取办理意见列表（1、获取工作流配置、实例信息得到wfHolder）
    getOptionAll(wfHolderObj) {
        this.opinionList = this.globalData.getOpinions(wfHolderObj);
    }
    viewFlow() {
        this.navCtrl.push("WorkFlowPage", { wfAlias: this.navParams.get("wfAlias"), ref: this.navParams.get("ref") })
    }
    goback(){
        this.navCtrl.pop();
      }
}