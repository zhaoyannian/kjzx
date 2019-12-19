import { Component } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';
import { ENV } from '@env/environment';
@Component({
    selector: 'page-meetView',
    templateUrl: 'meetView.html',
})
export class MeetInfoViewPage {
    entry:any;
    status: any = {
        0: '停用',
        1: '启用'
    };
    state: any = ENV.httpurl;
    roomPhotoIds:any=[];
    constructor(public navCtrl: NavController, public navParams: NavParams) {
        this.entry = this.navParams.get('entry');
        if(this.entry.roomPhotoIds){
            this.roomPhotoIds = this.entry.roomPhotoIds.split(',');
        }
    }
    goback(){
        this.navCtrl.pop();
    }
}