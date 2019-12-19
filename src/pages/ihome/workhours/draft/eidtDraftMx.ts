import { NativeService } from './../../../../icommon/provider/native';
import { Component } from '@angular/core'
import { NavController, NavParams, ModalController, AlertController, ViewController } from 'ionic-angular'
import { HttpClient } from '@angular/common/http'
// import { ProjectPage } from '../project/project'
import _ from 'lodash';

@Component({
    selector: "page-workhours-editmx",
    templateUrl: 'editDraftMx.html'
})

export class WorkhoursEditMxPage {

    objMxData: any = {};
    projectList: any = [];
    // callback;
    callback2;
    item: any = {
        projectDate: 0,
        jobContent: '',
        projectName: ''
    }
    constructor(private viewCtrl: ViewController, private alerCtrl: AlertController, public modalCtrl: ModalController, public NativeService: NativeService, public NavCtrl: NavController, public http: HttpClient, public navParams: NavParams) {
        this.projectList = [];
        //接收editDraft页面的callback2
        this.callback2 = this.navParams.get('callback2');
    }
    dismiss() {
        this.viewCtrl.dismiss();
    }
    saveWorkhoursMxFn() {
        // let allljob = _.filter(this.projectList, n => { return n.jobContent == null || n.jobContent == '' })
        // let alltime = _.filter(this.projectList, n => { return n.projectDate == 0 })
        // let dateAll = 0;
        // if (allljob.length > 0) {
        //     this.NativeService.showAlert("请填写工作内容!");
        //     return;
        // }
        // if (alltime.length > 0) {
        //     this.NativeService.showAlert("项目用时必须大于0!");
        //     return;
        // }
        // _.map(this.projectList, n => {
        //     dateAll += n.projectDate;
        // })
        // if (dateAll > 1) {
        //     this.NativeService.showAlert("项目用时总和不能大于1!");
        //     return;
        // }
        // this.callback2({ 'projectList': this.projectList }).then(() => {
        //     this.NavCtrl.pop();
        // });
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
                this.projectList = [];
                // data.projectDate = 0;
                this.projectList.push(data);
                // this.item.projectDate = 0;
                // this.item.projectName = data;
                Object.assign(this.item, data);
            }
        });
        profileModal.present();
        // this.NavCtrl.push(ProjectPage,{'projectList':this.projectList,'callback': this.myCallbackFunction})
    }
    addItem(item) {
        // item.projectDate = (parseFloat(item.projectDate) + (0.1)).toFixed(1);
        this.item.projectDate = Math.round((this.item.projectDate + 0.1) * 10) / 10
    }
    reduceItem(item) {
        // item.projectDate = (parseFloat(item.projectDate) - (0.1)).toFixed(1);
        this.item.projectDate =Math.round((this.item.projectDate - 0.1) * 10) / 10
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
    //     this.item.projectDate = (parseFloat(this.item.projectDate) - (0.0)).toFixed(1);
    // }
    removeItem(i) {
        const confirm = this.alerCtrl.create({
            message: '确认删除该项目吗？',
            buttons: [
                {
                    text: '取消',
                    handler: () => {
                    }
                },
                {
                    text: '确定',
                    handler: () => {
                        // this.projectList.splice(i,1); 
                        this.item.projectName = '';
                    }
                }
            ]
        });
        confirm.present();
    }
    goback() {
        this.NavCtrl.pop();
    }
    // myCallbackFunction  =(params) => {
    //     return new Promise((resolve, reject) => {
    //         if(typeof(params)!='undefined'){
    //             resolve('ok');
    //             this.projectList = params.projectList;
    //             if(!!this.projectList){
    //                 this.projectList.forEach(element => {
    //                     element.projectDate = 0;
    //                 });
    //             }
    //         }else{
    //             reject(Error('error'))
    //         }
    //     });
    // }

}