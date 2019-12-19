import { Component } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';
import _ from 'lodash';
import { ENV } from '@env/environment';
@Component({
    selector: 'page-deletePerson',
    templateUrl: 'deletePerson.html'
})


export class DeletePersonPage {
    dataList: any = [];
    callback;
    data: any = [];
    state:any = ENV.httpurl;
    constructor(public NavCtrl: NavController, public navParams: NavParams) {
        //接收myorder页面的searchBack
        this.callback = this.navParams.get('callback');
        this.dataList = this.navParams.get("meetingStaff");
    }
    goback(){
        this.NavCtrl.pop();
    }
    deleteMembers() {
        _.remove(this.dataList, function (n) {
            return n['checkNed'] === true;
        });
        this.callback({ 'dataList': this.dataList }).then(() => {
            this.NavCtrl.pop();
        });
    }
}