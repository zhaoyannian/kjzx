import { Component} from '@angular/core';
import { IonicPage, NavController, NavParams} from 'ionic-angular';
import { globalData } from '../../../../icommon/provider/globalData';
import { HttpClient } from '@angular/common/http';
import { ENV } from '@env/environment';
import { NativeService } from '../../../../icommon/provider/native';
import { entryUri7, queryListFileUri,saveEntityUri7} from '../../../../icommon/provider/Constants';
import { Keyboard } from '@ionic-native/keyboard';
import { Events } from 'ionic-angular';

@IonicPage()
@Component({
  selector: 'page-matters-edit',
  templateUrl: 'matters-edit.html',
})
export class MattersEditPage {
  editable: any;
  editingEntry = {};
  //附件列表信息
  fileList: any;
  //流程信息
  wfHolderObj: any;
  isTodo: any;
  btns: any;
  opinionList: any;
  //页面所需接口
  httpurl: any = ENV.httpurl;
  saveUrl: any = saveEntityUri7;

  datamore: any = {}
  procedureStatus:any;
  constructor(public http: HttpClient, public globalData: globalData, public navCtrl: NavController, public navParams: NavParams,private events: Events,private keyboard: Keyboard,public NativeService :NativeService) {
    this.editable = this.navParams.get("opeType") === 'view' ? false : true;
    this.procedureStatus = this.navParams.get("entry").procedureStatus;
  }
  ionViewDidEnter() {
    this.getEditingEntry();
    this.wfHolder();

    this.datamore.url = saveEntityUri7
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
    this.http.get(ENV.httpurl + entryUri7 + '/' + this.navParams.get("id")).subscribe(async data => {
      this.editingEntry = data;
      if (!!this.editingEntry['fuId']) {
        await this.queryListFile(this.editingEntry['fuId']);
      }
    })
  }
  //获取附件信息
  queryListFile(file) {
    this.http.get(ENV.httpurl + queryListFileUri + '/' + file).subscribe(data => {
      this.fileList = data;
    });
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
  // 附件图标问题
  fileIcon(fileName) {
    let postfix = getFileExtName(fileName);
    //图片附件
    if ("|jpg|png|jpeg|bmp|gif|".indexOf(postfix) > 0) {
      return 'img';
      //word附件
    } else if ("|docx|doc|".indexOf(postfix) > 0) {
      return 'doc';
      //excel附件
    } else if ("|xlsx|xls|".indexOf(postfix) > 0) {
      return 'excel';
      //PDF附件
    } else if ("|pdf|".indexOf(postfix) > 0) {
      return 'pdf';
      //压缩包附件
    } else if ("|rar|zip|tar|gz|war|7z|".indexOf(postfix) > 0) {
      return 'zip';
      // ppt
    } else if ("|pptx|ppt|".indexOf(postfix) > 0) {
      return 'ppt';
      // txt
    } else if ("|txt|".indexOf(postfix) > 0) {
      return 'txt';
      // 其他附件
    } else {
      return 'file';
    }

    function getFileExtName(name) {
      try {
        return name.split('.').pop().toLowerCase();
      } catch (error) {
        return 'file';
      }
    }
  }
  goback(){
    this.navCtrl.pop();
  }
}
