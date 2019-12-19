import { NativeService } from './../../../../icommon/provider/native';
import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, ViewController, ModalController, AlertController } from 'ionic-angular';

/**
 * Generated class for the EditProjectModalPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-edit-project-modal',
  templateUrl: 'edit-project-modal.html',
})
export class EditProjectModalPage {
  item: any;
  constructor(public NativeService: NativeService, private alerCtrl: AlertController, public modalCtrl: ModalController, private viewCtrl: ViewController, public navCtrl: NavController, public navParams: NavParams) {
    this.item = this.navParams.get("item");
  }

  ionViewDidLoad() {
  }
  addItem(item) {
    // item.projectDate = ( parseFloat( item.projectDate) + (0.1)).toFixed(1);
    this.item.projectDate = Math.round((this.item.projectDate + 0.1) * 10) / 10;
  }
  reduceItem(item) {
    // item.projectDate = ( parseFloat( item.projectDate) - (0.1)).toFixed(1);
    this.item.projectDate = Math.round((this.item.projectDate - 0.1) * 10) / 10;
  }
  dismiss() {
    this.viewCtrl.dismiss();
  }
  focusInput() {
    let re = /^[0-9]+.?[0-9]*$/;
    if (!re.test(this.item.projectDate)) {
      this.NativeService.showToast("请输入数字!")
      this.item.projectDate = 0;
      return false;
    }
  }
  blurInput() {
    // let re = /^[0-9]+.?[0-9]*$/;
    // if (!re.test(this.item.projectDate)) {
    //     this.NativeService.showToast("请输入数字!")
    //     this.item.projectDate = 0;
    //     return false;
    // }
    if (this.item.projectDate > 1) {
      this.item.projectDate = 1.0;
    } else {
      this.item.projectDate = Math.round(this.item.projectDate * 10) / 10;
    }
  }
  // changeprojectDate() {
  //   this.item.projectDate = (parseFloat(this.item.projectDate) - (0.0)).toFixed(1);
  // }
  editProject() {
    if (!this.item.jobContent) {
      this.NativeService.showAlert("请填写工作内容!");
      return;
    }
    if (!this.item.projectName) {
      this.NativeService.showAlert("请选择项目!");
      return;
    }
    if (!this.item.projectDate || this.item.projectDate == 'NaN') {
      this.NativeService.showAlert("项目用时必须大于0!");
      return;
    }
    if (!!this.item.projectDate && this.item.projectDate <= 0) {
      this.NativeService.showAlert("项目用时必须大于0!");
      return;
    }
    if (!!this.item.projectDate && this.item.projectDate > 1) {
      this.NativeService.showAlert("项目用时总和不能大于1!");
      return;
    }
    this.viewCtrl.dismiss(this.item);
  }
  selectProjectFn() {
    let profileModal = this.modalCtrl.create('ChooseProjectModalPage');
    profileModal.onDidDismiss(data => {
      if (data) {
        console.log(data);
        this.item.projectName = data.projectName;
      }
    });
    profileModal.present();
  }
  // removeItem(i) {
  //   const confirm = this.alerCtrl.create({
  //       message: '确认删除该项目吗？',
  //       buttons: [
  //           {
  //               text: '取消',
  //               handler: () => {
  //               }
  //           },
  //           {
  //               text: '确定',
  //               handler: () => {
  //                   this.projectList.splice(i,1); 
  //               }
  //           }
  //       ]
  //   });
  //   confirm.present();
  // }
}
