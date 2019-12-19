import { Component } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';
import { NativeService } from '../../../../icommon/provider/native';
import { ENV } from '@env/environment';
import { HttpClient } from '@angular/common/http';
import { globalData } from '../../../../icommon/provider/globalData';
import _ from 'lodash';

@Component({
    selector: 'page-editorView',
    templateUrl: 'editorAppro.html',
})
export class EditorApproPage {

    meetingTypes;
    selectMr: any = {};
    meetingStaff: any = [];
    selectedMRInfo: any = {};
    meetType: any = {
        firm_inside: '单位内',
        firm_outside: '单位外'
    };
    state: any = ENV.httpurl;
    weekDays: any = ["星期天", "星期一", "星期二", "星期三", "星期四", "星期五", "星期六"];
    weekDay: any;
    busId: any;
    year: any;
    moth: any;
    constructor(public globalData: globalData, public nativeService: NativeService, public navCtrl: NavController, public navParams: NavParams, public http: HttpClient) {
        this.busId = this.navParams.get('busId');
        this.getModal(this.busId);
    }
    goback() {
        this.navCtrl.pop();
    }
    getModal(busId) {
        this.http.get(ENV.httpurl + "/api/meetingApi/queryEntity/" + busId).subscribe(data => {
            this.selectMr = data;
            var myDate = new Date(Date.parse(this.selectMr.meetingDate.replace(/-/g, "/")));
            this.weekDay = this.weekDays[myDate.getDay()];
            this.year = this.selectMr.meetingDate.split('-')[0];
            this.moth = this.selectMr.meetingDate.split('-')[1] + "-" + this.selectMr.meetingDate.split('-')[2];

            this.transformEntry(this.selectMr);
            //获取会议室信息
            this.readMeetingRoomInfo();
            //翻译人员头像
            this.transPhoto();
        });
    }
    transPhoto() {
        let clzName2 = 'com.stonewomb.common.auth.entity.Staff';
        let inputField2 = 'userId';
        let indexedField2 = 'userId';
        let valueFields2 = ['photo'];
        let destFields2 = ['photo'];
        this.globalData.transformEntity(clzName2, inputField2, indexedField2, valueFields2, destFields2, this.selectMr.meetingStaff, 'oa');
    }
    //获取会议类型信息
    getMeetType() {
        this.http.post(ENV.httpurl + '/api/meetingType/queryAllByDict/1', {}).subscribe(resp => {
            if (!resp) {
                this.nativeService.showAlert("还没有启用状态的会议类型，请联系管理员，添加启用的会议类型");
            } else {
                this.meetingTypes = resp;
            }
        });
    }
    transformEntry(entry) {
        if (entry.meetingStatus === '1') {
            entry.status = '审批中';
        } else {
            entry.status = entry.meetingStatus;
        }
        if (entry.createUserId) {
            let inputField = 'createUserId';
            let valueFields = ['userName'];
            let destFields = ['createUserName'];
            this.globalData.transformStaffEntity(inputField, valueFields, destFields, [entry], 'oa');
        }
    }
    initMeetingStaff() {
        //初始化人员
        if (this.selectMr.meetingStaff && this.selectMr.meetingStaff.length > 0) {
            var meetingStaffArr = [];
            _(this.selectMr.meetingStaff).forEach(function (value) {
                let staff = {
                    'id': value.id,
                    'userId': value.userId,
                    'userName': value.userName
                };
                meetingStaffArr.push(staff);
            });
            this.meetingStaff = meetingStaffArr;
        }
    }
    readMeetingRoomInfo() {
        //查询出会议状态为草稿，审批中，完成的会议室信息，“3”为不同意状态，后端查询非状态为三的信息
        this.http.get(ENV.httpurl + "/api/meetingRoomInfo/" + this.selectMr.meetingAddress)
            .subscribe(data => {
                // console.debug("***resp:",resp);
                let initMeetingRoom = data;
                this.selectedMRInfo.name = initMeetingRoom['name'];
                this.selectedMRInfo.address = initMeetingRoom['address'];
                this.selectedMRInfo.maxStaff = initMeetingRoom['galleryful'];
            });
    }

    approvalMeeting(entry, status) {
        entry.meetingStatus = status;
        this.nativeService.showLoading();
        if (status === '2') {
            this.http.post(ENV.httpurl + "/api/meetingApi/meetInfoFinish/" + entry.id, {}).subscribe(
                () => {
                    this.nativeService.hideLoading();
                    this.nativeService.showToast("操作成功").then(() => {
                        setTimeout(() => {
                            this.goBack();
                        }, 800)
                    })

                }
            );
        }
        if (status === '3') {
            this.http.get(ENV.httpurl + "/api/meetingApi/meetInfoRollBack/" + entry.id).subscribe(
                () => {
                    this.nativeService.hideLoading();
                    this.nativeService.showToast("操作成功").then(() => {
                        setTimeout(() => {
                            this.goBack();
                        }, 800)
                    })
                }
            );
        }
    }

    goBack() {
        this.navCtrl.pop();
    }
}