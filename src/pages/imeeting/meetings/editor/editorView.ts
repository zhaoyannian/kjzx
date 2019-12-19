import { Component } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';
import { ENV } from '@env/environment';
import { HttpClient } from '@angular/common/http';
import { globalData } from '../../../../icommon/provider/globalData';
@Component({
    selector: 'page-editorView',
    templateUrl: 'editorView.html'
})

export class EditorViewPage {
    selectMr: any = {
        meetingStaff:[]
    };
    meetingTypes: any = {};
    meetType: any = {
        firm_inside: '单位内',
        firm_outside: '单位外'
    };
    state: any = ENV.httpurl;
    selectedMRInfo: any = {};
    weekDays: any = ["星期天", "星期一", "星期二", "星期三", "星期四", "星期五", "星期六"];
    weekDay: any;
    busId: any;
    year:any;
    moth:any;
    collspaed2:boolean = false;//更多详情收展
    constructor(public globalData: globalData, public NavCtrl: NavController, public navParams: NavParams, public http: HttpClient) {
        this.busId = this.navParams.get('busId');
        this.getModal(this.busId);
    }

    ionViewDidLoad() {
    }
    goback(){
        localStorage.setItem('counti','0')
        this.NavCtrl.pop();
    }
    getModal(busId) {
        this.http.get(ENV.httpurl + "/api/meetingApi/queryEntity/" + busId).subscribe(data => {
            this.selectMr = data;
            var myDate = new Date(Date.parse(this.selectMr.meetingDate.replace(/-/g, "/")));
            this.weekDay = this.weekDays[myDate.getDay()];
            this.year= this.selectMr.meetingDate.split('-')[0];
            this.moth = this.selectMr.meetingDate.split('-')[1]+"-"+this.selectMr.meetingDate.split('-')[2];
            //获取会议室信息
            this.readMeetingRoomInfo();
            //翻译人员头像
            this.transPhoto();
        });
    }
    readMeetingRoomInfo() {
        //查询出会议状态为草稿，审批中，完成的会议室信息，“3”为不同意状态，后端查询非状态为三的信息
        this.http.get(ENV.httpurl + "/api/meetingRoomInfo/" + this.selectMr.meetingAddress)
            .subscribe(data => {
                let initMeetingRoom = data;
                this.selectedMRInfo.name = initMeetingRoom['name'];
                this.selectedMRInfo.address = initMeetingRoom['address'];
                this.selectedMRInfo.maxStaff = initMeetingRoom['galleryful'];
            });
    }
    transPhoto() {
        let clzName2 = 'com.stonewomb.common.auth.entity.Staff';
        let inputField2 = 'userId';
        let indexedField2 = 'userId';
        let valueFields2 = ['photo'];
        let destFields2 = ['photo'];
        this.globalData.transformEntity(clzName2, inputField2, indexedField2, valueFields2, destFields2, this.selectMr.meetingStaff,'oa');
    }

    /**
     * 更多详情收展
     */
    showhide(bool) {
        if(bool) {
            document.getElementById('show1').style.display = 'none';
            document.getElementById('show2').style.display = 'block';
            document.getElementById('show3').style.display = 'block';
        }else
        {
            document.getElementById('show1').style.display = 'block';
            document.getElementById('show2').style.display = 'none';
            document.getElementById('show3').style.display = 'none';
        }
    }
}