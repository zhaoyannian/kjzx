import { Component, ViewChild } from '@angular/core';
import { NavController, NavParams, IonicPage } from 'ionic-angular';
import { ENV } from '@env/environment';
import { HttpClient } from '@angular/common/http';
import { AlertController } from 'ionic-angular/components/alert/alert-controller';
import { SelectMeetingPage } from './selectMeeting';
import { SelectPersonPage } from './selectPerson';
import { NativeService } from '../../../../icommon/provider/native';
import _ from 'lodash';

@IonicPage()
@Component({
    selector: 'page-meetngsedit',
    templateUrl: 'meetngsedit.html',
})
export class MeetngseditPage {
    objModel: any = {};
    meetingTypes;
    selectedMRInfo: any = [];
    deviceList: any = [];
    canSave: any;
    meetingStaff: any = [];
    meetList: any = [];
    admin: any;
    statusArr: any = [
        { 'draft': '0' },
        { 'approve': '1' },
        { 'done': '2' },
        { 'disagree': '3' }
    ];
    deleteMeetingStaffs: any = [];
    loginObj: any;
    meetTimeList: any = [];
    isApprove: any;
    isManager: any;
    state: any = ENV.httpurl;
    startDate: any;
    startDate2: any;
    endDate: any;
    endDate2: any;
    @ViewChild('startDateTime') myInput;
    @ViewChild('endDateTime') myInput2;
    weekDay: any;
    weekDay1: any;
    weekDays: any = ["星期日", "星期一", "星期二", "星期三", "星期四", "星期五", "星期六"];
    ishsowtime: boolean = true;
    purposeTypes: any;
    deviceLAll:any;
    constructor(public NavCtrl: NavController, public navParams: NavParams, public http: HttpClient, public alertCtrl: AlertController, public NativeService: NativeService) {
    }
    ngOnInit() {
        //设置初始默认值
        // let normalDate = new Date();
        var normalDate
        if (new Date(this.navParams.get("chooseData")).getTime() > new Date().getTime()) {
            normalDate = this.navParams.get("chooseData");
        } else {
            normalDate = new Date();
        }
        let btime = normalDate.getFullYear() + "-" + (normalDate.getMonth() + 1) + "-" + normalDate.getDate() + " " + (normalDate.getUTCMinutes() < 30 ? normalDate.getHours() : normalDate.getHours() + 1) + ":" + (normalDate.getUTCMinutes() < 30 ? "30" : "00") + ":00";
        let etime = normalDate.getFullYear() + "-" + (normalDate.getMonth() + 1) + "-" + normalDate.getDate() + " " + (normalDate.getHours() + 1) + ":" + (normalDate.getUTCMinutes() < 30 ? "00" : "30") + ":00";
        this.startDate = new Date((new Date(Date.parse(btime.replace(/-/g, "/"))).getTime() - new Date().getTimezoneOffset() * 60 * 1000)).toISOString();
        this.startDate2 = new Date(Date.parse(btime.replace(/-/g, "/"))).getTime()
        this.endDate = new Date((new Date(Date.parse(etime.replace(/-/g, "/"))).getTime() - new Date().getTimezoneOffset() * 60 * 1000)).toISOString();
        this.endDate2 = new Date(Date.parse(etime.replace(/-/g, "/"))).getTime()
        this.weekDay = this.weekDays[new Date().getDay()];
        this.weekDay1 = this.weekDays[new Date().getDay()];
        //设置默认时间值
        if (!!this.startDate) {
            this.objModel.meetingDate = this.startDate.substring(0, this.startDate.indexOf("T"));
            let begin = this.startDate.substring(this.startDate.indexOf("T") + 1).split(':');
            this.objModel.beginTime = begin[0] + ":" + begin[1];
        }
        if (!!this.endDate) {
            let end = this.endDate.substring(this.endDate.indexOf("T") + 1).split(':');
            this.objModel.endTime = end[0] + ":" + end[1];
        }
        this.loginObj = JSON.parse(localStorage.getItem("objectList"));
        this.objModel.createUserId = this.loginObj['loginInfo'].userId;
        this.objModel.corpOrgId = this.loginObj['corpOrgId'];
        this.objModel.corpOrgName = this.loginObj['deptTo'].deptName;
        this.objModel.deptName = this.loginObj['deptTo'].deptName;
        this.objModel.createUserName = this.loginObj['loginInfo'].userName;
        this.objModel.deptId = this.loginObj['deptTo'].deptId;
        this.objModel.phone = this.loginObj['loginInfo'].mobNum;
        this.objModel.meetingType = "firm_inside";  //会议类型，默认单位内
        //获取会议信息
        this.queryMeetingRoom();
        //获取会议类型信息
        this.getMeetType();
        //获取登录人员角色
        this.isAdmin();
        this.getTypes()
    }
    getTypes(){
        this.http.get(ENV.httpurl + '/api/dictOption/queryDictOptionFindByDictCode/BLQY_NETWORKRESOURCE_PURPOSETYPE').subscribe(data => {
            this.purposeTypes = data;
        });
    }
    goback() {
        localStorage.setItem('counti', '0')
        this.NavCtrl.pop();
    }
    //获取会议类型信息
    getMeetType() {
        this.http.post(ENV.httpurl + '/api/meetingType/queryAllByDict/1', {}).subscribe(resp => {
            if (!resp) {
                this.NativeService.showAlert("还没有启用状态的会议类型，请联系管理员，添加启用的会议类型");
            } else {
                this.meetingTypes = resp;
            }
        });
    }
    async openTime(item) {
        this.ishsowtime = true;
        if (item == 'startDate') {
            await this.myInput.open();//为
        } else {
            await this.myInput2.open();//为
        }
    }
    //选择会议室
    selectMeeting() {
        this.selectedMRInfo = [];
        this.NavCtrl.push(SelectMeetingPage, { 'callback': this.meetBackFunction, 'id': this.objModel.meetingAddress });
    }
    //会议信息返回值处理
    meetBackFunction = (params) => {
        return new Promise((resolve, reject) => {
            if (typeof (params) != 'undefined') {
                resolve('ok');
                if (!!params.dataList) {
                    this.selectedMRInfo = params.dataList;
                    this.objModel.meetingAddress = this.selectedMRInfo[0].id;
                    this.deviceList = this.selectedMRInfo[0].devices;
                    this.initState(this.selectedMRInfo[0]);
                    //   this.prepareEnd();
                    this.judgeDate();
                }
            } else {
                reject(Error('error'))
            }
        });
    }
    initState(data) {
        if (!!data.apprManager) {
            this.isApprove = true;
            var manager = !!data.apprManager ? data.apprManager.split(',') : [];
            var res = _.find(manager, function (o) {
                return o.userId == this.loginObj['loginInfo'].userId;
            });
            if (!!res) {
                this.isManager = true;
                if (!!this.objModel.meetingStatus && this.objModel.meetingStatus == this.statusArr[1].approve) {
                }
            }

        } else {
            this.isApprove = false;
        }
        //初始化人员
        if (this.objModel.meetingStaff && this.objModel.meetingStaff.length > 0) {
            var meetingStaffArr = [];
            _(this.objModel.meetingStaff).forEach(function (value) {
                let staff = {
                    'id': value.id,
                    'userId': value.userId,
                    'userName': value.userName,
                    'photo': value.photo
                };
                meetingStaffArr.push(staff);
            });
            this.meetingStaff = meetingStaffArr;
        }
    }
    //选择参会人员
    selectPerson() {
        this.watchMeetingStaff(this.objModel);
        this.NavCtrl.push(SelectPersonPage, { 'callback': this.staffBackFunction, 'meetingStaff': this.meetingStaff, 'defaultPerson': true });
    }
    //人员信息对应
    staffBackFunction = (params) => {
        return new Promise((resolve, reject) => {
            if (typeof (params) != 'undefined') {
                resolve('ok');
                if (!!params.dataList) {
                    this.meetingStaff = params.dataList;
                    this.watchMeetingStaff(this.objModel);
                }
            } else {
                reject(Error('error'))
            }
        });
    }

    /**
     * 删除参会人员
     * @param i 下标
     */
    deletePeer2(i) {
        console.log(this.meetingStaff.splice(i, 1));
    }
    deleteBackFunction = (params) => {
        return new Promise((resolve, reject) => {
            if (typeof (params) != 'undefined') {
                resolve('ok');
                if (!!params.dataList) {
                    this.meetingStaff = params.dataList;
                }
            } else {
                reject(Error('error'))
            }
        });
    }
    watchMeetingStaff(entity) {
        if (this.selectedMRInfo.length > 0) {
            if (this.objModel.meetingType === 'firm_inside' && this.meetingStaff.length > this.selectedMRInfo[0].galleryful) {
                let rtn = '该会议室可容纳 ' + this.selectedMRInfo[0].galleryful + '人,人数已超出！';
                this.NativeService.showAlert(rtn);
                //超过可容纳人数后只做提醒，不要影响选择的人员
                // this.meetingStaff = entity.meetingStaff;
                // return;
            }
        }

        this.deleteMeetingStaffs = _.map(entity.meetingStaff, 'id');
        this.meetingStaff = this.meetingStaff.length > 0 ? this.meetingStaff : [];
        //保存人员
        let meetingStaffArr = [];
        for (let d in this.meetingStaff) {
            let staff = {
                'id': this.getUid(),
                'userId': this.meetingStaff[d].userId,
                'userName': this.meetingStaff[d].userName,
                'photo': this.meetingStaff[d].photo
            };
            meetingStaffArr.push(staff);
        }
        entity.meetingStaff = meetingStaffArr;
        this.objModel.meetingStaffNumber = meetingStaffArr.length;
        return;
    }
    getUid() {
        let uuid = this.NativeService.uuid();
        let uuidN = _.join(uuid.split('-'), '');
        return uuidN;
    }
    saveEntry = _.throttle(function (entity) {
        let that = this;
        if (!entity.meetingName) {
            that.NativeService.showAlert("请填写会议标题！");
            return;
        }
        if (!entity.meetingDate) {
            that.NativeService.showAlert("请选择会议时间！");
            return;
        }
        if (!entity.beginTime || !that.startDate) {
            that.NativeService.showAlert("请选择会议开始时间！");
            return;
        }
        if (!entity.endTime || !that.endDate) {
            that.NativeService.showAlert("请选择会议结束时间！");
            return;
        }
        if (!entity.phone) {
            that.NativeService.showAlert("请填写联系电话！");
            return;
        }
        if (!!this.startDate) {
            let end = this.endDate.substring(this.endDate.indexOf("T") + 1).split(':');
            if (this.startDate.substring(0, this.startDate.indexOf("T")) > this.endDate.substring(0, this.endDate.indexOf("T"))) {
                this.NativeService.showAlert("会议结束时间不能小于开始时间，请重新选择会议结束时间！");
                // this.endDate = '';
                // this.objModel.endTime = '';
                return false;
            } else if (this.startDate.substring(0, this.startDate.indexOf("T")) < this.endDate.substring(0, this.endDate.indexOf("T"))) {
                this.NativeService.showAlert("会议不可跨天，请重新选择会议结束时间！");
                // this.endDate = '';
                // this.objModel.endTime = '';
                return false;
            }
            if (this.objModel.endTime < this.objModel.beginTime) {
                this.NativeService.showAlert("会议结束时间不能小于开始时间，请重新选择会议结束时间！");
                // this.endDate = '';
                // this.objModel.endTime = '';
                return false;
            }

            let dateN = new Date();
            let btime = "" + dateN.getFullYear() + (dateN.getMonth() + 1 > 9 ? dateN.getMonth() + 1 : "0" + (dateN.getMonth() + 1)) + (dateN.getDate() > 9 ? dateN.getDate() : "0" + dateN.getDate()) + (dateN.getHours() > 9 ? dateN.getHours() : "0" + dateN.getHours()) + (dateN.getUTCMinutes() > 9 ? dateN.getUTCMinutes() : "0" + dateN.getUTCMinutes());
            let nbtime = this.objModel.meetingDate.split("-")[0] + this.objModel.meetingDate.split("-")[1] + this.objModel.meetingDate.split("-")[2] + this.objModel.beginTime.split(":")[0] + this.objModel.beginTime.split(":")[1];
            let ebtime = this.objModel.meetingDate.split("-")[0] + this.objModel.meetingDate.split("-")[1] + this.objModel.meetingDate.split("-")[2] + end[0] + end[1];
            if (btime > nbtime) {
                // this.startDate = '';
                // this.objModel.beginTime = '';
                if (btime > ebtime) {
                    // this.endDate = '';
                    // this.objModel.endTime = '';
                }
                this.NativeService.showAlert("选择时间已过，请重新选择！");
                return false;
            }
        }
        if (!!this.endDate) {
            let begin = this.startDate.substring(this.startDate.indexOf("T") + 1).split(':');
            if (this.startDate.substring(0, this.startDate.indexOf("T")) > this.endDate.substring(0, this.endDate.indexOf("T"))) {
                this.NativeService.showAlert("会议结束时间不能小于开始时间，请重新选择会议结束时间！");
                // this.endDate = '';
                // this.objModel.endTime = '';
                return false;
            } else if (this.startDate.substring(0, this.startDate.indexOf("T")) < this.endDate.substring(0, this.endDate.indexOf("T"))) {
                this.NativeService.showAlert("会议不可跨天，请重新选择会议结束时间！");
                // this.endDate = '';
                // this.objModel.endTime = '';
                return false;
            }
            if (this.objModel.endTime < this.objModel.beginTime) {
                this.NativeService.showAlert("会议结束时间不能小于开始时间，请重新选择会议结束时间！");
                // this.endDate = '';
                // this.objModel.endTime = '';
                return false;
            }

            let dateN = new Date();
            let btime = "" + dateN.getFullYear() + (dateN.getMonth() + 1 > 9 ? dateN.getMonth() + 1 : "0" + (dateN.getMonth() + 1)) + (dateN.getDate() > 9 ? dateN.getDate() : "0" + dateN.getDate()) + (dateN.getHours() > 9 ? dateN.getHours() : "0" + dateN.getHours()) + (dateN.getUTCMinutes() > 9 ? dateN.getUTCMinutes() : "0" + dateN.getUTCMinutes());
            let nbtime = this.objModel.meetingDate.split("-")[0] + this.objModel.meetingDate.split("-")[1] + this.objModel.meetingDate.split("-")[2] + begin[0] + begin[1];
            let ebtime = this.objModel.meetingDate.split("-")[0] + this.objModel.meetingDate.split("-")[1] + this.objModel.meetingDate.split("-")[2] + this.objModel.endTime.split(":")[0] + this.objModel.endTime.split(":")[1];
            if (btime > nbtime) {
                // this.startDate = '';
                // this.objModel.beginTime = '';
                if (btime > ebtime) {
                    // this.endDate = '';
                    // this.objModel.endTime = '';
                }
                this.NativeService.showAlert("选择时间已过，请重新选择！");
                return false;
            }
        }
        let startHour = !!entity.beginTime ? entity.beginTime.slice(0, 2) : '0';
        let startMin = !!entity.beginTime ? entity.beginTime.slice(3, 5) : '0';
        let endHour = !!entity.endTime ? entity.endTime.slice(0, 2) : '0';
        let endMin = !!entity.endTime ? entity.endTime.slice(3, 5) : '0';
        if (parseInt(endHour) !== 0 && (parseInt(endHour) < parseInt(startHour) || (
            parseInt(endHour) === parseInt(startHour) &&
            parseInt(endMin) <= parseInt(startMin)
        ))) {
            that.canSave = false;
            that.NativeService.showAlert("会议结束时间不能小于开始时间，请重新选择会议结束时间！");
            return;
        }

        //只有草稿状态可以修改
        // if(confirm("点击确定后，将不能修改页面内容，确定继续吗？")){
        //点击“保存或提交”时，如果启用了会议审批，meetingStatus = 1，没有启用meetingStatus = 2;
        // self.getFilePath(entity);
        entity.beginTimeStr = !!entity.beginTime ? entity.beginTime.split(':').join('') : '';
        entity.endTimeStr = !!entity.endTime ? entity.endTime.split(':').join('') : '';
        entity.outBegintime = entity.beginTime;
        entity.outEndtime = entity.endTime;
        entity.outRoomdays = entity.meetingDate;
        entity.meetingStaff = [];
        entity.meetingStaff = that.meetingStaff;
        entity.meetingStaffNumber = that.meetingStaff.length;

        if (!entity.meetingAddress && entity.meetingType == 'firm_inside') {
            that.NativeService.showAlert("请选择会议室！");
            return;
        }
        // if (!entity.meetingStaff || entity.meetingStaff.length === 0) {
        //     that.NativeService.showAlert("请选择参会人员！");
        //     return;
        // }
        console.log(this.deviceLAll)
        let deviceIds = [];
        let deviceName = [];
        _.each(that.deviceList, (d) => {
            _.each(this.deviceLAll,n=>{
                if(n == d.id){
                    deviceIds.push(d.id);
                    deviceName.push(d.deviceName);
                }
            })
        });
        entity.devicesIds = deviceIds.toString();
        entity.devicesNames = deviceName.toString();
        if (entity.meetingType == 'firm_inside' && !!that.selectedMRInfo[0] && !!that.selectedMRInfo[0].apprManager) {
            let manager = !!that.selectedMRInfo[0].apprManager ? that.selectedMRInfo[0].apprManager.split(',') : [];
            let res = _.find(manager, function (o) {
                return o.userId == that.loginObj['loginInfo'].userId;
            });
            if ((!!res || that.admin)) {
                entity.meetingStatus = that.statusArr[2].done;
            } else {
                entity.meetingStatus = that.statusArr[1].approve;
            }
        } else {
            entity.meetingStatus = that.statusArr[2].done;
        }
        entity.isApprove = !!that.selectedMRInfo[0] && !!that.selectedMRInfo[0].apprManager;

        this.NativeService.showLoading();
        that.http.post(ENV.httpurl + '/api/meetingApi/saveOrUpdate', entity).subscribe(data => {
            this.NativeService.hideLoading();
            if (!data || data.message=='时间冲突!!') {
                that.NativeService.showAlert("该时间段已被预订！");
                return;
            }
            if (!!that.selectedMRInfo[0] && !!that.selectedMRInfo[0].apprManager) {
                let manager = !!that.selectedMRInfo[0].apprManager ? that.selectedMRInfo[0].apprManager.split(',') : [];
                let res = _.find(manager, function (o) {
                    return o.userId == that.loginObj['loginInfo'].userId;
                });
                if (!(!!res || that.admin)) {
                    that.http.post(ENV.httpurl + '/api/meetingInfo/sendMessageSubmit/' + data['id'], manager).subscribe()
                }
            }
            if (that.deleteMeetingStaffs.length > 0) {
                that.http.post(ENV.httpurl + '/api/meetingStaff/deleteMeetingStaffs', that.deleteMeetingStaffs).subscribe(data => {
                    that.NavCtrl.pop();
                });
            } else {
                that.NavCtrl.pop();
            }
        }, error => {
            this.NativeService.hideLoading();
            // that.NativeService.showAlert("操作失败，请联系管理员！");
            return;
        });
    }, 800);

    queryMeetingRoom() {
        this.http.get(ENV.httpurl + '/api/meetingRoomInfo/queryAllMeetingRoom/1').subscribe(data => {
            this.meetList = data;
            if (this.meetList.length < 1) {
                this.NativeService.showAlert("还没有启用状态的会议室，请联系管理员，添加启用的会议室");
                return;
            }
        })
    }
    queryMeetingType() {
        this.http.post(ENV.httpurl + '/1', {}).subscribe(data => {

        })
    }

    isAdmin() {
        this.admin = false;
        let loginObj = JSON.parse(localStorage.getItem("objectList"));
        _.map(loginObj['rolesTo'], (o) => {
            //会议室管理员或者超管
            if (o.roleType == 'superAdmin') {
                this.admin = true;
            }
        });
    }
    //翻译
    transFormTime() {
        if (this.objModel.beginTime) {
            let bh = this.objModel.beginTime.getHours();
            let bm = this.objModel.beginTime.getMinutes();
            let bhStr = bh >= 10 ? bh.toString() : '0' + bh;
            let bmStr = bm >= 10 ? bm.toString() : '0' + bm;
            this.objModel.beginTime = bhStr + ':' + bmStr;
        }
        if (this.objModel.endTime) {
            let eh = this.objModel.endTime.getHours();
            let em = this.objModel.endTime.getMinutes();
            let ehStr = eh >= 10 ? eh.toString() : '0' + eh;
            let emStr = em >= 10 ? em.toString() : '0' + em;
            this.objModel.endTime = ehStr + ':' + emStr;
        }
    }
    start(date) {
        if (!!date) {
            // let mydate= new Date(date);
            this.startDate = date;
            // this.weekDay = this.weekDays[mydate.getDay()];
            this.objModel.meetingDate = date.substring(0, date.indexOf("T"));

            this.startDate2 = new Date(Date.parse(this.objModel.meetingDate)).getTime();
            let mydate = new Date(this.startDate2);
            this.weekDay = this.weekDays[mydate.getDay()];

            let begin = date.substring(date.indexOf("T") + 1).split(':');
            this.objModel.beginTime = begin[0] + ":" + begin[1];
            // if (!!this.endDate) {
            //     if (date.substring(0, date.indexOf("T")) > this.endDate.substring(0, this.endDate.indexOf("T"))) {
            //         this.NativeService.showAlert("会议结束时间不能小于开始时间，请重新选择会议结束时间！");
            //         this.endDate = '';
            //         this.objModel.endTime = '';
            //         return false;
            //     } else if (date.substring(0, date.indexOf("T")) < this.endDate.substring(0, this.endDate.indexOf("T"))) {
            //         this.NativeService.showAlert("会议不可跨天，请重新选择会议结束时间！");
            //         this.endDate = '';
            //         this.objModel.endTime = '';
            //         return false;
            //     }
            //     if (this.objModel.endTime < this.objModel.beginTime) {
            //         this.NativeService.showAlert("会议结束时间不能小于开始时间，请重新选择会议结束时间！");
            //         this.endDate = '';
            //         this.objModel.endTime = '';
            //         return false;
            //     }

            //     let dateN = new Date();
            //     let btime = "" + dateN.getFullYear() + (dateN.getMonth() + 1 > 9 ? dateN.getMonth() + 1 : "0" + (dateN.getMonth() + 1)) + (dateN.getDate() > 9 ? dateN.getDate() : "0" + dateN.getDate()) + (dateN.getHours() > 9 ? dateN.getHours() : "0" + dateN.getHours()) + (dateN.getUTCMinutes() > 9 ? dateN.getUTCMinutes() : "0" + dateN.getUTCMinutes());
            //     let nbtime = this.objModel.meetingDate.split("-")[0] + this.objModel.meetingDate.split("-")[1] + this.objModel.meetingDate.split("-")[2] + begin[0] + begin[1];
            //     let ebtime = this.objModel.meetingDate.split("-")[0] + this.objModel.meetingDate.split("-")[1] + this.objModel.meetingDate.split("-")[2] + this.objModel.endTime.split(":")[0] + this.objModel.endTime.split(":")[1];
            //     if (btime > nbtime) {
            //         this.startDate = '';
            //         this.objModel.beginTime = '';
            //         if (btime > ebtime) {
            //             this.endDate = '';
            //             this.objModel.endTime = '';
            //         }
            //         this.NativeService.showAlert("选择时间已过，请重新选择！");
            //         return false;
            //     }
            // }
            //判断时间区间内，是否有会议
            if (!!this.objModel.meetingAddress) {
                this.judgeDate();
            }
        }
    }
    end(date) {
        if (!!date) {
            let mydate = new Date(date);
            this.endDate = date;
            // this.endDate2 = new Date(Date.parse(date)).getTime();

            let res = date.substring(0, date.indexOf("T"));
            this.endDate2 = new Date(Date.parse(res)).getTime();
            this.weekDay1 = this.weekDays[new Date(res).getDay()];

            // this.weekDay1 = this.weekDays[mydate.getDay()];
            let end = date.substring(date.indexOf("T") + 1).split(':');
            this.objModel.endTime = end[0] + ":" + end[1];
            // if (!!this.startDate) {
            //     if (this.startDate.substring(0, this.startDate.indexOf("T")) > date.substring(0, date.indexOf("T"))) {
            //         this.NativeService.showAlert("会议结束时间不能小于开始时间，请重新选择会议结束时间！");
            //         this.endDate = '';
            //         this.objModel.endTime = '';
            //         return false;
            //     } else if (this.startDate.substring(0, this.startDate.indexOf("T")) < date.substring(0, date.indexOf("T"))) {
            //         this.NativeService.showAlert("会议不可跨天，请重新选择会议结束时间！");
            //         this.endDate = '';
            //         this.objModel.endTime = '';
            //         return false;
            //     }
            //     if (this.objModel.endTime < this.objModel.beginTime) {
            //         this.NativeService.showAlert("会议结束时间不能小于开始时间，请重新选择会议结束时间！");
            //         this.endDate = '';
            //         this.objModel.endTime = '';
            //         return false;
            //     }

            //     let dateN = new Date();
            //     let btime = "" + dateN.getFullYear() + (dateN.getMonth() + 1 > 9 ? dateN.getMonth() + 1 : "0" + (dateN.getMonth() + 1)) + (dateN.getDate() > 9 ? dateN.getDate() : "0" + dateN.getDate()) + (dateN.getHours() > 9 ? dateN.getHours() : "0" + dateN.getHours()) + (dateN.getUTCMinutes() > 9 ? dateN.getUTCMinutes() : "0" + dateN.getUTCMinutes());
            //     let nbtime = this.objModel.meetingDate.split("-")[0] + this.objModel.meetingDate.split("-")[1] + this.objModel.meetingDate.split("-")[2] + this.objModel.beginTime.split(":")[0] + this.objModel.beginTime.split(":")[1];
            //     let ebtime = this.objModel.meetingDate.split("-")[0] + this.objModel.meetingDate.split("-")[1] + this.objModel.meetingDate.split("-")[2] + end[0] + end[1];
            //     if (btime > nbtime) {
            //         this.startDate = '';
            //         this.objModel.beginTime = '';
            //         if (btime > ebtime) {
            //             this.endDate = '';
            //             this.objModel.endTime = '';
            //         }
            //         this.NativeService.showAlert("选择时间已过，请重新选择！");
            //         return false;
            //     }
            // }
            //判断时间区间内，是否有会议
            if (!!this.objModel.meetingAddress) {
                this.judgeDate();
            }
        }
    }

    judgeDate() {
        if (!this.objModel.beginTime || !this.objModel.beginTime) {
            this.NativeService.showAlert("请选择会议开始或结束时间！");
            return false;
        }
        let startHour = !!this.objModel.beginTime ? this.objModel.beginTime.slice(0, 2) : '0';
        let startMin = !!this.objModel.beginTime ? this.objModel.beginTime.slice(3, 5) : '0';
        let endHour = !!this.objModel.endTime ? this.objModel.endTime.slice(0, 2) : '0';
        let endMin = !!this.objModel.endTime ? this.objModel.endTime.slice(3, 5) : '0';
        if (parseInt(endHour) !== 0 && (parseInt(endHour) > parseInt(startHour) || (
            parseInt(endHour) === parseInt(startHour) &&
            parseInt(endMin) >= parseInt(startMin)
        ))) {
            let entity = {
                meetingDate: this.objModel.meetingDate,
                meetingAddress: this.objModel.meetingAddress
            };
            return this.http.post(ENV.httpurl + '/api/meetingInfo/queryMeInfoByTimeAndMR', entity).subscribe(
                (data) => {
                    this.meetTimeList = data;
                    if (this.meetTimeList && this.meetTimeList.length > 0) {
                        for (var k = 0; k < this.meetTimeList.length; k++) {
                            let begins = this.meetTimeList[k]['beginTime'].split(":");
                            let ends = this.meetTimeList[k]['endTime'].split(":");
                            if (parseInt(endHour) < parseInt(begins[0]) || parseInt(startHour) > parseInt(ends[0])) {

                            } else if (parseInt(endHour) === parseInt(begins[0])) {
                                if (parseInt(endMin) <= parseInt(begins[1])) {

                                } else {
                                    this.NativeService.showAlert("此时间段内已有会议进行，请重新选择会议开始及结束时间！");
                                    this.endDate = '';
                                    this.objModel.endTime = '';
                                    break;
                                }
                            } else if (parseInt(startHour) === parseInt(ends[0])) {
                                if (parseInt(startMin) >= parseInt(ends[1])) {
                                } else {
                                    this.NativeService.showAlert("此时间段内已有会议进行，请重新选择会议开始及结束时间！");
                                    this.endDate = '';
                                    this.objModel.endTime = '';
                                    break;
                                }
                            } else {
                                this.NativeService.showAlert("此时间段内已有会议进行，请重新选择会议开始及结束时间！");
                                this.endDate = '';
                                this.objModel.endTime = '';
                                break;
                            }
                        }
                    }
                });
        }
    }

    checkPhone(data) {
        if (data.length > 0) {
            if (data.indexOf('1') !== 0) {
                this.objModel.phone = parseInt('');
                this.NativeService.showAlert("手机号码输入不合法");
                return;
            }
            if (data.length > 11) {
                this.objModel.phone = parseInt(data.substring(0, 11));
            }
        } else {
            this.objModel.phone = '';
            this.NativeService.showAlert("手机号码必填");
            return;
        }
    }
}
