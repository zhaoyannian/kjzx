import { NativeService } from './../../../../icommon/provider/native';
import { Component } from '@angular/core'
import {IonicPage, NavController, NavParams, ModalController, AlertController, ViewController } from 'ionic-angular'
import { HttpClient } from '@angular/common/http'
// import { ProjectPage } from '../project/project'
import _ from 'lodash';

@Component({
    selector: "page-fhq-editmx",
    templateUrl: 'editDraftfhq.html'
})

export class fhqEditMxPage {

    objMxData: any = {};
    projectList: any = [];
    // callback;
    callback2;
    item: any = {
        projectDate: 0,
        jobContent: '',
        projectName: ''
    }

    eEntry:any = {

        sourceAddress: '',
        sourcePort: '',
        destinationAddress: '',
        destinationPort: '',
        purpose: ''

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
       
        // if (!this.eEntry.sourceAddress) {
        //     this.NativeService.showAlert("源地址!");
        //     return;
        // }
        // if (!this.eEntry.sourcePort) {
        //     this.NativeService.showAlert("源端口!");
        //     return;
        // }
        if (!this.eEntry.destinationAddress ) {
            this.NativeService.showAlert("请填写目的地址!");
            return;
        }
        if (!this.eEntry.destinationPort ) {
            this.NativeService.showAlert("请填写目的端口!");
            return;
        }
        if (!this.eEntry.purpose ) {
            this.NativeService.showAlert("请填写用途!");
            return;
        }
        this.viewCtrl.dismiss(this.eEntry);
        return;
    }
    
   
   
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

}