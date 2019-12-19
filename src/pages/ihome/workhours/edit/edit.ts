import { NativeService } from './../../../../icommon/provider/native';
import { globalData } from './../../../../icommon/provider/globalData';
import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, ModalController, AlertController,ViewController } from 'ionic-angular';
import { Keyboard } from '@ionic-native/keyboard';
import { HttpClient } from '@angular/common/http';
import _ from 'lodash';
import { ENV } from '@env/environment';
import { entryUri, saveEntityUri, uuid } from '../../../../icommon/provider/Constants';
import { weekList } from '../../../../icommon/provider/utils';
import { Events } from 'ionic-angular';
import { WorkhoursEditMxPage } from '../draft/eidtDraftMx';
@IonicPage()
@Component({
  selector: 'page-edit',
  templateUrl: 'edit.html',
})
export class EditPage {
  editingEntry: any;
  editable: any;
  totalDate: any = 0;
  wfHolderObj: any;
  opinionList: any;
  // points:any;
  update: any;
  btns: any;
  isTodo: any;
  weekab: any;
  opinion: any;
  datamore: any = {}
  procedureStatus: any;
  entry: any;
  toggle: any;
  isrefresh:boolean=false;;
  constructor(private viewCtrl: ViewController,public modalCtrl: ModalController, private alerCtrl: AlertController, private events: Events, public NativeService: NativeService, public globalData: globalData,
    public navCtrl: NavController, public navParams: NavParams, public http: HttpClient, private keyboard: Keyboard) {
    this.editable = this.navParams.get("opeType") == 'view' ? false : true;
    this.entry = this.navParams.get("entry");
    this.toggle = this.navParams.get("toggle");

    if (this.navParams.get("opeType") == 'update') {
      this.update = true
    }


  }
  goback() {
    this.navCtrl.pop();
  }
  dismiss() {
    this.viewCtrl.dismiss();
  }
  ionViewDidEnter() {
    if(!this.isrefresh){
      this.getEditingEntry()
      this.wfHolder()
    }
    this.datamore.url = saveEntityUri
    this.keyboard.onKeyboardShow().subscribe(data => {
      console.log(data)
      if (this.NativeService.isAndroid()) {
        this.datamore.btnscroll = true;
        this.datamore.btnscollHeight = data.keyboardHeight;
        this.events.publish('btnscroll', this.datamore);
      }
    })
    this.keyboard.onKeyboardWillHide().subscribe(data => {
      console.log(data)
      if (this.NativeService.isAndroid()) {
        this.datamore.btnscroll = false;
        this.events.publish('btnscroll', this.datamore);
      }
    })
  }
  // 获取工作流配置、实例信息
  wfHolder() {
    let that = this
    if (!!this.navParams.get("wfAlias")) {
      this.globalData.getHolderFromWfAliasRef(this.navParams.get("wfAlias"), this.navParams.get("ref"), null).subscribe(async data => {
        this.wfHolderObj = this.globalData.compOtherInfo(data);
        let status = this.entry.businessObject && this.entry.businessObject.procedureStatus || this.entry.procedureStatus;
        if ((!!this.wfHolderObj.wfInst.listPointInstTo[this.wfHolderObj.wfInst.listPointInstTo.length - 1].listResourceInst[0].readTime && status != "back") || this.toggle == 'awiatData') {
          this.procedureStatus = "complete";
        } else {
          this.procedureStatus = "waiting";
        }
        // if (this.wfHolderObj.wfInst.listPointInstTo.length > 1 && this.wfHolderObj.pointInst.status !='waiting') {
        //   this.procedureStatus = this.wfHolderObj.wfInst.listPointInstTo[this.wfHolderObj.wfInst.listPointInstTo.length - 1].pointInst.status;
        // } else {
        //   this.procedureStatus = "";
        // }
        console.log(this.procedureStatus)
        this.isTodo = this.wfHolderObj.isTodo()
        this.btns = this.wfHolderObj.btns() //获取按钮
        this.globalData.setProc(this.wfHolderObj.btns()) //给按钮设置函数
        await that.getOptionAll(this.wfHolderObj)
      })
    }
  }
  // 获取详情信息
  getEditingEntry() {
    this.http.get(ENV.httpurl + entryUri + '/' + this.navParams.get("id")).subscribe(data => {
      this.editingEntry = data;
      this.weekab = weekList[new Date(this.editingEntry.startDate).getDay()];
      // if (this.entry.pointId == 0 && this.editable) {
        // this.editingEntry.startDate = new Date(this.editingEntry.startDate).toISOString();
        this.editingEntry.startDate = new Date( (this.editingEntry.startDate -(new Date().getTimezoneOffset() * 60 * 1000))).toISOString()
      // }
      if (!!this.editingEntry.devices) {
        _.map(this.editingEntry.devices, (device) => {
          device.detailId = device.id;
          this.totalDate = (parseFloat(this.totalDate) + parseFloat(device.projectDate)).toFixed(1);
          this.editingEntry.totalDate = this.totalDate;
          // this.totalDate = (this.totalDate+ parseFloat(device.projectDate)).toFixed(1);
        });
      }
    })
  }
  // 获取办理意见列表（1、获取工作流配置、实例信息得到wfHolder）
  getOptionAll(wfHolderObj) {
    // this.points=this.globalData.getPoints(wfHolderObj)
    this.opinionList = this.globalData.getOpinions(wfHolderObj);
  }
  viewFlow() {
    this.navCtrl.push("WorkFlowPage", { wfAlias: this.navParams.get("wfAlias"), ref: this.navParams.get("ref") })
  }
  ionViewDidLoad() {
  }
  delete(item, i) {
    this.alerCtrl.create({
      title: "确定删除吗？",
      message: "",
      buttons: [
        {
          text: '取消',
          handler: () => {
          }
        },
        {
          text: '确定',
          handler: () => {
            this.editingEntry.devices.forEach(element => {
              if (element.id == item.id) {
                this.totalDate = (parseFloat(this.totalDate) - parseFloat(element.projectDate)).toFixed(1)
                this.editingEntry.totalDate = this.totalDate;
                this.editingEntry.devices.splice(i, 1);
              }
            });
          }
        }
      ]
    }).present();

  }
  edit(item, i) {
    this.isrefresh = true;
    let profileModal = this.modalCtrl.create('EditProjectModalPage', { item: item });
    profileModal.onDidDismiss(data => {
      if (data) {
        item = data;
        this.totalDate = 0;
        this.editingEntry.devices.forEach(element => {
          this.totalDate = (parseFloat(this.totalDate) + parseFloat(element.projectDate)).toFixed(1)
          this.editingEntry.totalDate = this.totalDate;
        });
      }
    });
    profileModal.present();
  }

  addWorkhoursMxFn() {
    this.isrefresh = true;
    let profileModal = this.modalCtrl.create(WorkhoursEditMxPage);
    profileModal.onDidDismiss(data => {
      if (data) {
        this.totalDate = (parseFloat(this.totalDate) + parseFloat(data.projectDate)).toFixed(1)
        this.editingEntry.totalDate = this.totalDate;
        data.detailId = uuid(); // 添加 "主键" 用于区分每条明细
        this.editingEntry.devices.push(data); // 数组操作
      }
    });
    profileModal.present();
    // this.NavCtrl.push(WorkhoursEditMxPage, { 'projectList': this.editingEntry.devices, 'callback2': this.myCallbackFunction })
  }

}
