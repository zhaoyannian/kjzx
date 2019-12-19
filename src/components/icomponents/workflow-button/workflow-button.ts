import { NativeService } from './../../../icommon/provider/native';
import { Component, Input } from '@angular/core';
import { NavController, AlertController ,ViewController} from 'ionic-angular';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Observable } from 'rxjs/Rx';
import { HttpClient } from '@angular/common/http';
import { ENV } from '@env/environment';
import { Events } from 'ionic-angular';
// import {  saveEntityUri} from './../../icommon/provider/Constants';
import { Keyboard } from '@ionic-native/keyboard';
import _ from 'lodash';
@Component({
  selector: 'workflow-button',
  templateUrl: 'workflow-button.html'
})
export class WorkflowButtonComponent {
  myForm: FormGroup;
  @Input() opinion_title;
  @Input() editable;
  @Input() wfHolderObj;
  @Input() EditingEntry;
  @Input() datamore;
  @Input() procedureStatus;
  @Input() toggle;
  btnScroll: boolean = false;
  btnscollHeight: any;
  datascroll: any = {}
  ismobile: boolean = false;
  userinforList: any;
  opinion: any;
  constructor(private viewCtrl: ViewController,private alerCtrl: AlertController, public NativeService: NativeService, private keyboard: Keyboard, private events: Events, public http: HttpClient, public navCtrl: NavController, public fb: FormBuilder) {
    this.userinforList = JSON.parse(localStorage.getItem("objectList"));
    this.myForm = this.fb.group({
      opinion: ['同意', [Validators.required]],
    });
    this.events.subscribe('btnscroll', content => {
      let that = this;
      if (content.btnscroll == false) {
        that.datascroll.btnscroll = false;
        that.datascroll.btnscollHeight = 0
      }
    }, error => {
      let that = this;
      that.datascroll.btnscroll = false;
      that.datascroll.btnscollHeight = 0
    });

  }
  ngOnInit() {
    let that = this;
    that.opinion = '同意';
    if (that.NativeService.isAndroid()) {
      that.ismobile = true;
    }
    // that.keyboard.onKeyboardHide().subscribe(data => {
    //   if (that.NativeService.isAndroid()) {
    //     that.btnScroll = false;
    //     that.btnscollHeight = 0
    //   }
    // })
    // that.keyboard.onKeyboardShow().subscribe(data => {
    //   if (that.NativeService.isAndroid()) {
    //     that.btnScroll = true;
    //     that.btnscollHeight = data.keyboardHeight;
    //   }
    // })
  }
  blurInput(){
    let that = this;
    that.datascroll.btnscroll = true;
    this.keyboard.onKeyboardShow().subscribe(data =>{
        if(that.NativeService.isAndroid()){
        //   that.datascroll.btnscroll = true;
          that.datascroll.btnscollHeight = data.keyboardHeight;
        }
      })
    if(that.datascroll.btnscollHeight>0){
    }else{
        that.datascroll.btnscollHeight = 267
    }
  }
  // blurInput() {
  //   let that = this;
  //   that.btnScroll = false;
  //   that.btnscollHeight = 0;
  // }
  focusInput() {
    let that = this;
    that.btnScroll = true;
    that.keyboard.onKeyboardShow().subscribe(data => {
      if (that.NativeService.isAndroid()) {
        that.btnScroll = true;
        that.btnscollHeight = data.keyboardHeight;
      }
    })
    if (that.btnscollHeight > 0) {
    } else {
      that.btnscollHeight = 267
    }
    // let that = this;
    // that.datascroll.btnscroll = true;
    // this.keyboard.onKeyboardShow().subscribe(data => {
    //   if (that.NativeService.isAndroid()) {
    //       that.datascroll.btnscroll = true;
    //     that.datascroll.btnscollHeight = data.keyboardHeight;
    //   }
    // })
    // if (that.datascroll.btnscollHeight > 0) {
    // } else {
    //   that.datascroll.btnscollHeight = 267
    // }
  }

  // 流程处理
  manage= _.throttle(function (btn) {
    let self = this;
    if (self.wfHolderObj.opinionRequired()) {
      if (self.opinion_title.length == 0) {
        self.NativeService.showAlert('请填写办理意见！');
        return;
      }
    }
    if(this.datamore.wfAlias && this.datamore.wfAlias.indexOf('SealApply') > -1){
      if (!this.EditingEntry.applyReason) {
        this.NativeService.showAlert('请填写申请事由！');
        return;
      }
      if (!this.EditingEntry.phone) {
          this.NativeService.showAlert('请填写联系电话！');
          return;
      }
      this.EditingEntry.fileId = !!this.datamore.fileList && this.datamore.fileList.length > 0 ? _.map(this.datamore.fileList, 'id').join(',') : null;
    }
    this.NativeService.showLoading();
    btn.proc(self.opinion_title, () => self.save(), () => self.getWfData(), () => self.lastDo(), () => self.beforeSelectRes(), (selected) => self.afterSelectRes(selected), () => self.getNextPoint(), () => self.procBackPoint(),this.EditingEntry);
  },800);
  // 保存业务表数据
  save(): Observable<any> {
    return Observable.create(observer => {
      var self = this;
      // this.EditingEntry.startDate = new Date(Math.round(Date.parse(this.EditingEntry.startDate)) + new Date().getTimezoneOffset() * 60 * 1000).toISOString();
      return self.http.post(ENV.httpurl + self.datamore.url, self.EditingEntry).subscribe(resp => {
        self.EditingEntry.id = resp['id']; // 将id重置回去，为了wfData获取数据
        observer.next(resp['businessKey']);// 在流程提交组件里获取
        return self.EditingEntry;
      }, error => {
        this.NativeService.hideLoading();
        observer.error(false);
      });
    });
  }
  getWfData() {
  }
  // 选人之前处理，没有什么处理时，可以不写返回值
  beforeSelectRes() {
    return {}
  }
  procBackPoint() {
    // return {}
    if (this.toggle == 'awiatData') {
      this.events.publish('tabs:awiatData', 'awiatData','');
    } else if (this.toggle == 'complateData') {
      this.events.publish('tabs:complateData', 'complateData','');
    } else if (this.toggle == 'AllData') {
      this.events.publish('tabs:AllData', 'AllData','');
    }
    this.NativeService.showToast("操作成功").then(() => {
      setTimeout(() => {
        // this.navCtrl.pop()
        this.viewCtrl.dismiss();
      }, 800)
    })  // 流程提交后 返回的页面
  }
  // 选人之后处理
  afterSelectRes(selected) {
    console.debug('选择的人....', selected);
  }
  // 获取下一环节，默认提交给下一环节，可以不写返回值
  getNextPoint() {
  }
  // 提交流程后的操作
  lastDo() {
    if (this.toggle == 'awiatData') {
      this.events.publish('tabs:awiatData', 'awiatData','');
    } else if (this.toggle == 'complateData') {
      this.events.publish('tabs:complateData', 'complateData','');
    } else if (this.toggle == 'AllData') {

      this.events.publish('tabs:AllData', 'AllData','');
    }
    this.navCtrl.pop();
    // this.NativeService.showToast("操作成功").then(() => {
    //   this.NativeService.hideLoading();
    //   setTimeout(() => {
    //     // this.navCtrl.pop()
    //     this.viewCtrl.dismiss();
    //   }, 800)
    // })  // 流程提交后 返回的页面
  }
  callBack() {
    this.alerCtrl.create({
      title: "您确认想要召回当前审批么？（仅在下一环节办理人查看和办理前可以召回）",
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
            this.NativeService.showLoading();
            this.http.get(ENV.httpurl + '/api/wf/callbackMySubmit/' + this.wfHolderObj.wfInst.listPointInstTo[this.wfHolderObj.wfInst.listPointInstTo.length - 1].pointInst.id + '/' + this.userinforList['staff'].userId).subscribe(data => {
              this.NativeService.hideLoading();
              if (data['data'] == true) {
                if (this.toggle == 'awiatData') {
                  this.events.publish('tabs:awiatData', 'awiatData','');
                } else if (this.toggle == 'complateData') {
                  this.events.publish('tabs:complateData', 'complateData','');
                } else if (this.toggle == 'AllData') {

                  this.events.publish('tabs:AllData', 'AllData','');
                }
                this.NativeService.showToast("召回成功!").then(() => {
                  setTimeout(() => {
                    // this.navCtrl.pop()
                    this.viewCtrl.dismiss();
                  }, 800)
                })
              } else {
                this.NativeService.showAlert(data['message']);
              }
            }, error => {
              this.NativeService.showAlert("操作失败!");
              this.NativeService.hideLoading();
            })
          }
        }
      ]
    }).present();

  }

}
