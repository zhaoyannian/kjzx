import { globalData } from '../../../../icommon/provider/globalData';
import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, ModalController } from 'ionic-angular';
import { HttpClient } from '@angular/common/http';
import { FormGroup, Validators, FormBuilder } from '@angular/forms';
import { NativeService } from '../../../../icommon/provider/native';
import { WfwaichuServer } from '../../../../icommon/provider/wfwaichu';
/**
 * Generated class for the EditPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-waichuedit',
  templateUrl: 'waichuedit.html',
})
export class WaichuEditPage {
  myForm: FormGroup;
  opinionList:any = [];
  userinfo = JSON.parse(localStorage['objectList']);
  btnTitle = '提交';
  selpeople:any;
  constructor(public globalData :globalData,
    public navCtrl: NavController, public navParams: NavParams,public http:HttpClient,public fb: FormBuilder,
    private nat: NativeService,private wf: WfwaichuServer,private modal:ModalController) {

      let that = this;
      this.wf.getNewWorkFlow('goOutFlow').then(function(data) {
        let shenfen:number = data['startPointId'];//当前用户身份
        
        if(shenfen == 0) {
          //申请者
          let setting = data['points'][shenfen];
          //** 改循环按钮********/
          //如果身份是0申请者，一般只有一个按钮；
          that.btnTitle = setting['btns'][parseInt(data['startBtnId']) - 1]['title'];//先扒出按钮名称
          //选择人员数组
          that.selpeople = setting['listResource'][0]['targetCache'];
        }
        //如果身份是审核中，按钮数量不确定，名称不确定
      }).catch(function(err) {
      });
      

      this.myForm = this.fb.group({
        outInfo: ['',[Validators.required,Validators.maxLength(500)]],
        address: ['',[Validators.required]],
        isBack: [true],
        startDate: [],
        endDate: [],
        startType: ['',[Validators.required]],
        endType: ['',[Validators.required]],
        goOutDays:[0],
        applyDate: [this.nat.getDateNow("yyyy-MM-dd'T'HH:mm:ss.SSSZ")]
      });
  }
  ionViewDidEnter() {
  }
  ionViewDidLoad() {
    
  }

  viewFlow() {
  }

  getState(e) {
    if(e.hour<=12) {
      this.myForm.get('startType').setValue('上午');
    }else {
      this.myForm.get('startType').setValue('下午');
    }
  }

  getEnd(e) {
    if(e.hour<=12) {
      this.myForm.get('endType').setValue('上午');
    }else {
      this.myForm.get('endType').setValue('下午');
    }
  }

  /**
   * 提交
   * @param state 暂存为:draft,提交为:complate
   */
  submit(state="complate") {
    // let modal = this.modal.create('SelpeoplePage',{'list':this.selpeople});
    // modal.onDidDismiss(data=>{
    //   if(!!data) {
    //     return false;
    //   }else {
    //     return false;
    //   }
    // });
    // modal.present();
    if(!this.modalPromise()){
      return false;
    }
    if(this.myForm.get('outInfo').invalid) {
      this.nat.showToast('请填写外出原因');
      return false;
    }
    if(this.myForm.get('address').invalid) {
      this.nat.showToast('请填写地点');
      return false;
    }
    if(this.myForm.get('startType').invalid) {
      this.nat.showToast('请选择开始时间');
      return false;
    }
    if(this.myForm.get('endType').invalid) {
      this.nat.showToast('请选择结束时间');
      return false;
    }
    // let sd = this.myForm.value.startDate.split('T')[0];
    // let ed = this.myForm.value.endDate.split('T')[0];
    // let d1:any = new Date(sd);
    // let d2:any = new Date(ed);
    // let cha = Number(d2 - d1) / 1000 / 60 / 60 / 24;//时间差天数
    // if(this.myForm.value.startType == this.myForm.value.endType) {
    //   cha += 0;
    // }else {
    //   cha += 0.5;
    // }
    // let params = this.myForm.value;
    // params.goOutDays = cha;
    // params.startDate = sd;
    // params.endDate = ed;
    // params.procedureStatus = state;
    // this.nat.showLoading();
    // this.http.post(ENV.httpurl +'/api/goOut/saveOrUpdate',params).subscribe(data=>{
    //   this.nat.hideLoading();
    //   this.navCtrl.pop();
    // }, error=>{
    //   this.nat.showToast(error.Message);
    // })
  }
  goback(){
    this.navCtrl.pop();
  }
  /**
   * 弹出选择办理人员模态框，如果返回值为空，不继续下一步
   */
  modalPromise() {
    let modal = this.modal.create('SelpeoplePage',{'list':this.selpeople});
    let next = false;
    modal.onDidDismiss(data=>{
      if(!!data) {
        next = false;
      }else {
        next = false;
      }
    });
    modal.present();
    return next;
  }
}
