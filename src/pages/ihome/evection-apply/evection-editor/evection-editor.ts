
import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { globalData } from '../../../../icommon/provider/globalData';
import { HttpClient } from '@angular/common/http';
import { ENV } from '@env/environment';
import { NativeService } from '../../../../icommon/provider/native';
import { entryUri8, saveEntityUri8 } from '../../../../icommon/provider/Constants';
import { Keyboard } from '@ionic-native/keyboard';
import { Events } from 'ionic-angular';
import { weekList } from '../../../../icommon/provider/utils';

@IonicPage()
@Component({
    selector: 'page-evection-editor',
    templateUrl: 'evection-editor.html',
})
export class EvectionEditorPage {
    editable: any;
    editingEntry: any;
    //流程信息
    wfHolderObj: any;
    isTodo: any;
    btns: any;
    opinionList: any;
    //页面所需接口
    httpurl: any = ENV.httpurl;
    saveUrl: any = saveEntityUri8;
    weekab: any;
    weekab2: any;
    datamore: any = {}
    procedureStatus:any;
    constructor(public http: HttpClient, public globalData: globalData, public navCtrl: NavController, public navParams: NavParams, private events: Events, private keyboard: Keyboard, public NativeService: NativeService) {
        this.editable = this.navParams.get("opeType") === 'view' ? false : true;
        this.procedureStatus = this.navParams.get("entry").procedureStatus;
    }
    ionViewDidEnter() {
        this.getEditingEntry();
        this.wfHolder();

        this.datamore.url = saveEntityUri8
        this.keyboard.onKeyboardShow().subscribe(data => {
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

    //获取详情信息
    getEditingEntry() {
        this.http.get(ENV.httpurl + entryUri8 + '/' + this.navParams.get("id")).subscribe(async data => {
            this.editingEntry = data;

            this.weekab = weekList[new Date(this.editingEntry.evOutDate).getDay()];
            this.weekab2 = weekList[new Date(this.editingEntry.evBackDate).getDay()];
        })
    }
    // 获取工作流配置、实例信息
    wfHolder() {
        let that = this;
        if (!!this.navParams.get("wfAlias")) {
            this.globalData.getHolderFromWfAliasRef(this.navParams.get("wfAlias"), this.navParams.get("ref"), null).subscribe(async data => {
                this.wfHolderObj = this.globalData.compOtherInfo(data);
                this.isTodo = this.wfHolderObj.isTodo();
                this.btns = this.wfHolderObj.btns();  //获取按钮
                this.globalData.setProc(this.wfHolderObj.btns()); //给按钮设置函数
                await that.getOptionAll(this.wfHolderObj);
            })
        }
    }
    //获取办理意见列表（1、获取工作流配置、实例信息得到wfHolder）
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