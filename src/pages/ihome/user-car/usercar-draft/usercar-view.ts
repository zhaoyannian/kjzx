import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { ENV } from '@env/environment';
import { HttpClient } from '@angular/common/http';
import { globalData } from '../../../../icommon/provider/globalData';
import { entryUri9} from '../../../../icommon/provider/Constants';

@IonicPage()
@Component({
    selector: 'page-usercar-view',
    templateUrl: 'usercar-view.html',
})
export class UserCarViewPage {
    busId: any;
    editingEntry: any = {};
    //用车人数组
    userCarStaffs: any = [];
    tripType: boolean = false;
    driverEntourage: boolean = true;
    selfDriving: boolean = false;
    state: any = ENV.httpurl;
    constructor(public globalData: globalData, public NavCtrl: NavController, public navParams: NavParams, public http: HttpClient) {

    }

    ionViewDidEnter() {
        this.getEditingEntry();
    }

     //获取详情信息
     getEditingEntry() {
        this.http.get(ENV.httpurl + entryUri9 + '/' + this.navParams.get("id")).subscribe(async data => {
            this.editingEntry = data;
            this.editingEntry['tripType'] == "单程" ? this.tripType = false : this.tripType = true;
            this.editingEntry['driverEntourage'] == "是" ? this.driverEntourage = false : this.driverEntourage = true;
            this.editingEntry['selfDriving'] == "是" ? this.selfDriving = true : this.selfDriving = false;

            if (!!this.editingEntry.isMessage) {
                this.editingEntry.isMessageNew = this.editingEntry.isMessage.split(',');
            }
            //单程  出发-结束时间
            if (!!this.editingEntry.outTime) {
                this.editingEntry.outTimeNew = this.getDate(this.editingEntry.outTime);
            }
            if (!!this.editingEntry.endTime) {
                this.editingEntry.endTimeNew = this.getDate(this.editingEntry.endTime);
            }
            //往返 去 - 出发-结束时间
            if (!!this.editingEntry.goOutTime) {
                this.editingEntry.goOutTimeNew = this.getDate(this.editingEntry.goOutTime);
            }
            if (!!this.editingEntry.goEndTime) {
                this.editingEntry.goEndTimeNew = this.getDate(this.editingEntry.goEndTime);
            }
            //往返 回 - 出发-结束时间
            if (!!this.editingEntry.backOutTime) {
                this.editingEntry.backOutTimeNew = this.getDate(this.editingEntry.backOutTime);
            }
            if (!!this.editingEntry.backEndTime) {
                this.editingEntry.backEndTimeNew = this.getDate(this.editingEntry.backEndTime);
            }
            if (this.editingEntry.useCarUserId && !this.editingEntry.special) {
                this.getUsers();
            }
        })
    }
    getUsers() {
        let userIds = this.editingEntry['useCarUserId'].split(',');
        this.http.post(ENV.httpurl + '/api/staff/queryStaffsInUserIds', userIds).subscribe(async data => {
            this.userCarStaffs = data;
        })
    }
    getDate(date) {
        let normalDate = new Date(date);
        let time = normalDate.getFullYear() + "-" + (normalDate.getMonth() + 1) + "-" + normalDate.getUTCDate() + " " + normalDate.getHours() + ":" + normalDate.getUTCMinutes() + ":" + normalDate.getUTCSeconds();
        return new Date((new Date(Date.parse(time.replace(/-/g, "/"))).getTime() - new Date().getTimezoneOffset() * 60 * 1000)).toISOString();
    }
    goback(){
        this.NavCtrl.pop();
      }
}