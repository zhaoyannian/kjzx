import { Component } from '@angular/core';
import { NavController, AlertController, App } from 'ionic-angular';
import { HttpClient } from '@angular/common/http'
import { ENV } from '@env/environment';
import { NativeService } from '../../../../icommon/provider/native';
import _ from 'lodash';
import * as $ from 'jquery';
import { SchedulePage } from '../newSchedule/newSchedule';
import { EditorViewPage } from '../../../imeeting/meetings/editor/editorView';
import { CreateGroupPage } from './createGroup/createGroup';
import { GroupListPage } from './groupList/groupList';

import { LoginPage } from '../../../../pages/login/login'


@Component({
    selector: 'page-groupCal',
    templateUrl: 'groupCal.html'
})
export class GroupCalPage {
    //人员角色
    roles: any = [];
    //获取token用户登录信息
    loginObj: any;
    //判断用户是否为领导 -- 判断是否有创建群组的权限
    isLeader: any = false;
    now: any;
    //群组信息
    groupArr: any = [1];
    //默认显示第一个群组实体
    groupChoosed: any;
    //默认显示第一个群组名称
    title: any;
    //默认显示第一个群组的日程信息
    colleagueUserIds: any;
    //日程信息
    groupListDate: any = [];
    today: any;
    nextMonthDaysNext: any;
    nextMonthDaysLast: any;
    isToday: any;
    thisWeeks: any = [];
    calendarCount: any = [];
    memberArr: any = [];
    userIdOfShowArr: any = [];
    colleagueList: any = [];
    week: any;
    state:any = ENV.httpurl;
    showStatus:any = true;
    nowTime: any;
    hour: any;
    constructor(public navCtrl: NavController, public http: HttpClient, public NativeService: NativeService, public alertCtrl: AlertController, public appCtrl: App) {
        //当前时间
        this.now = new Date();
        this.today = new Date();
        
    }
     //当进入页面时触发方法
     ionViewDidEnter() {
        this.hour = new Date().getHours();
        if (this.hour < 9) {
            this.nowTime = '早上'
        } else if (this.hour < 12) {
            this.nowTime = '上午'
        } else if (this.hour < 14) {
            this.nowTime = "中午"
        }
        else if (this.hour < 17) {
            this.nowTime = "下午"
        }
        else if (this.hour < 24) {
            this.nowTime = "晚上"
        }
       //初始化群组
       this.initGroup();
    }
    goback(){
        this.navCtrl.pop();
    }
     ///当离开页面时触发方法
     ionViewDidLeave() {
        $('#SelectGroup').hide();
    }
    //初始化数据信息
    ngOnInit() {
        this.loginObj = JSON.parse(localStorage.getItem("objectList"));
        this.roles = this.loginObj['rolesTo'] ? _.map(this.loginObj['rolesTo'], 'roleType') : [];
        _.map(this.roles, (n) => {
            if (n === 'scientist' || n === 'superAdmin') {
                this.isLeader = true;
            }
        });
    }
    initGroup() {
        this.http.get(ENV.httpurl + '/api/calgroup/queryGroupsByUserIdAndGroupType/GROUP').subscribe(data => {
            this.groupArr = data;
            if (this.groupArr.length > 0) {
                //默认显示第一个群组的名称
                _.map(this.groupArr,n=>{
                    n.checked = false;
                })
                this.groupArr[0].checked =true;
                this.groupChoosed = this.groupArr[0];
                this.title = this.groupChoosed.title;
                //默认显示第一个群组的日程信息
                this.colleagueUserIds = this.groupChoosed.members;
                this.setGroup(this.groupChoosed);
            }
        })
    }

    setGroup(groupChoosed) {
        _.map(this.groupArr,n=>{
            n.checked = false;
        })
        groupChoosed.checked =true;
        this.groupChoosed = groupChoosed;
        this.title = this.groupChoosed.title;
        this.colleagueUserIds = this.groupChoosed.members;
        //置空缓存数据
        this.groupListDate = [];
        //初始化数据
        this.initData();
        $('#SelectGroup').hide();
    }
    //初始化数据，在init()中，包括初始化月、星期、今天的数据
    initData() {
        //初始化，上一个月，下一个月的时间
        this.today = new Date();
        let year = this.today.getFullYear();
        let month = this.today.getMonth();
        this.nextMonthDaysNext = new Date(year, month + 1, 0).getDate();
        this.nextMonthDaysLast = new Date(year, month, 0).getDate();
        //本周时间，上一月下一月，同步更新星期数,上一周下一周，同步页更新星期数
        this.initWeek(this.today);
        //默认当天日程
        this.initMyColleagueList(this.today);
        this.isToday = this.today;
    }
    //初始化周时间,同步获取当天是否有日程
    initWeek(selectDay) {
        this.NativeService.showLoading();
        var week = [];
        var whichWeek = selectDay.getDay();
        var time = selectDay.getTime();
        var sunTime = time - whichWeek * 24 * 60 * 60 * 1000;
        for (let x = 0; x < 7; x++) {
            let date = new Date(sunTime + x * 24 * 60 * 60 * 1000);
            week.push(date);
        }
        this.haveCalendar(week);
    }
    //判断当天是不是有日程，便于显示黄点还是蓝点
    haveCalendar(weeks) {
        if (weeks.length > 0) {
            this.http.post(ENV.httpurl + '/api/staff/queryStaffsByUserIdsAndQueryKey', {
                userIds: this.groupChoosed ? this.groupChoosed.members : '',
                queryKey: ''
            }).subscribe((data) => {
                this.memberArr = data;
                _.map(this.memberArr, (o) => o.checked = true);
                this.userIdOfShowArr = this.memberArr.slice(0);
                //传入参数 userIds
                let colleagueUserIds = [];
                _.map(this.userIdOfShowArr, (o) => {
                    colleagueUserIds.push(o.userId);
                });
                this.http.post(ENV.httpurl + "/api/cal/queryAppCalendarListForDateCount", {
                    members: colleagueUserIds,
                    dates: weeks
                }).subscribe(
                    (data) => {
                        this.calendarCount = data;
                        this.thisWeeks = [];
                        for (let j = 0; j < this.calendarCount.length; j++) {
                            let obj = {};
                            obj['week'] = weeks[j];
                            obj['count'] = this.calendarCount[j];
                            this.thisWeeks.push(obj);
                        }
                    },
                    () => {
                        let hasToken = localStorage.getItem("token");
                        if(hasToken == '1' || hasToken == null ){ // 弹提示
                            localStorage.setItem('token', '1'); // 会议室异常，跳到登录页
                            let activeNav: NavController = this.appCtrl.getActiveNav();
                            activeNav.push(LoginPage);
                        } else {
                            this.NativeService.showAlert("后端异常，请联系管理员9");
                        } 
                    }
                    );
            },
                () => {
                    let hasToken = localStorage.getItem("token");
                    if(hasToken == '1' || hasToken == null ){ // 弹提示
                        localStorage.setItem('token', '1'); // 会议室异常，跳到登录页
                        let activeNav: NavController = this.appCtrl.getActiveNav();
                        activeNav.push(LoginPage);
                    } else {
                        this.NativeService.showAlert("后端异常，请联系管理员0");
                    } 
                }
                );

        }
    }
    //查询我的同事及日程
    initMyColleagueList(date) {
        this.http.post(ENV.httpurl + "/api/calgroup/queryMyColleagueUserIds", {
            queryKey: ''
        }).subscribe((data) => {
            this.memberArr = data;
            _.map(this.memberArr, (o) => o.checked = true);
            this.userIdOfShowArr = this.memberArr.slice(0);
            this.queryColleagueCalendars(this.userIdOfShowArr, date);
        });
    }


    //查询同事日程
    queryColleagueCalendars(userIds, selectDay) {
        // this.http.post(ENV.httpurl + "/api/cal/queryAppCalendarListForDate", {
        //     members: _.map(userIds, (o) => o.userId),
        //     date: new Date(selectDay)
        // }).subscribe(
        //     (data) => {
        //         //同事日程 TODO 待完善
        //         let dataList = _.filter(data,n=> n['calendarTos'].length > 0);
        //         this.colleagueList = dataList;
        //     },
        //     () => {
        //         this.NativeService.showAlert("后端异常，请联系管理员")
        //     }
        //     );

        // var groupToday = new Date();
        this.queryGroupCalender(selectDay);
    }

    //查询天对应的日程
    queryDateCalendarPage(date) {
        this.today = date;
        let year = this.today.getFullYear();
        let month = this.today.getMonth();
        this.nextMonthDaysNext = new Date(year, month + 1, 0).getDate();
        this.nextMonthDaysLast = new Date(year, month, 0).getDate();
        this.initWeek(this.today);
        this.queryGroupCalender(this.today);
    }

    //查询天对应的日程
    queryGroupCalender(date) {
        this.http.post(ENV.httpurl + "/api/cal/queryAppCalendarListForDate", {
            members: this.colleagueUserIds,
            date: date
        }).subscribe(
            (data) => {
                //过滤无日程信息人员
                let dataList = _.filter(data,n=> n['calendarTos'].length > 0);
                this.groupListDate = dataList;
                this.NativeService.hideLoading();
            },
            () => {
                let hasToken = localStorage.getItem("token");
                if(hasToken == '1' || hasToken == null ){ // 弹提示
                    localStorage.setItem('token', '1'); // 会议室异常，跳到登录页
                    let activeNav: NavController = this.appCtrl.getActiveNav();
                    activeNav.push(LoginPage);
                } else {
                    this.NativeService.showAlert("后端异常，请联系管理员!");
                } 
            }
            );
    }

    //恢复到今天，对应今的图标
    initToday() {
        this.NativeService.showLoading();
        this.today = new Date();
        this.queryDateCalendarPage(this.today);
    }

    //周，左右滑动，上一周，下一周
    updateWeek(date, around) {
        this.moveWeek(date, around);
        var getNextDate = (currentDate, around) => {
            var current = new Date(currentDate);
            current.setDate(current.getDate() + around); //获取AddDayCount天后的日期
            this.week = current.getDay();
            return current;
        };
        if (!!date) {
            this.today = getNextDate(date, around);
        }
    }


    //下一个月
    updateDateMonthNext(date, around) {

        var getNextDate = (currentDate, around) => {
            var current = new Date(currentDate);
            current.setDate(current.getDate() + around);
            this.week = current.getDay();
            return current;
        };
        if (!!date) {
            this.today = getNextDate(date, around);
            let year = this.today.getFullYear();
            let month = this.today.getMonth();
            this.nextMonthDaysNext = new Date(year, month + 1, 0).getDate();
            this.nextMonthDaysLast = new Date(year, month, 0).getDate();
            this.moveWeek(date, around);
        }
    }


    //上一个月
    updateDateMonthLast(date, around) {
        var getNextDate = (currentDate, around) => {
            var current = new Date(currentDate);
            current.setDate(current.getDate() + around); //获取AddDayCount天后的日期
            this.week = current.getDay();
            return current;
        };
        if (!!date) {
            this.today = getNextDate(date, around);
            let year = this.today.getFullYear();
            let month = this.today.getMonth();
            this.nextMonthDaysLast = new Date(year, month, 0).getDate();
            this.nextMonthDaysNext = new Date(year, month + 1, 0).getDate();
            this.moveWeek(date, around);
        }
    }
    //下一周时间判断
    moveWeek(selectDay, round) {
        this.NativeService.showLoading();   
        var week = [];
        let sevenTime = selectDay.getTime() + round * 24 * 60 * 60 * 1000;
        let lastWe = new Date(sevenTime);
        var whichWeek = lastWe.getDay();
        var time = lastWe.getTime();
        var sunTime = time - whichWeek * 24 * 60 * 60 * 1000;
        for (let x = 0; x < 7; x++) {
            let date = new Date(sunTime + x * 24 * 60 * 60 * 1000);
            week.push(date);
        }
        this.haveCalendar(week);
        //查询日程
        this.initMyColleagueList(lastWe);
    }
    //设置样式显示,日程信息有数据显示...
    checkClassType(cur, now) {
        let curN = new Date(cur);
        let nowN = new Date(now);
        return curN.getTime() >= nowN.getTime() ? true : false;
    }
    //时间显示形式，方法
    timeMethod(startDate, closeDate) {
        return this.NativeService.timeMethod(startDate, closeDate);
    }
    //今 图标显示与否控制
    getShow() {
        return (this.today.getFullYear() + '-' + this.today.getMonth() + '-' + this.today.getDate()) !== (this.now.getFullYear() + '-' + this.now.getMonth() + '-' + this.now.getDate()) ? true : false;
    }
    //点击展开群组列表
    choose() {
        if(this.groupArr.length>0){
            $('#SelectGroup').toggle(200);
        }else{
            this.navCtrl.pop();
        }
       
    }


    //查看日程
    viewCal(entry){
        if (entry.calType === 'meeting') { //会议
            // this.http.get(ENV.httpurl+"/api/meetingApi/queryEntity/"+entry.busId).subscribe(data =>{
            //     this.navCtrl.push(EditorViewPage, { selectMr: data});
                this.navCtrl.push(EditorViewPage, { 'busId':  entry.busId });
            //   })
        } else if (entry.calType === 'goout') { //外出
           
        } else if (entry.calType === 'leave') { //请假
            this.showStatus = false;
            this.http.get(ENV.httpurl + "/api/leaveApply/queryEntity/" + entry.busId).subscribe(async data => {
                setTimeout(() => {
                  this.showStatus = true;
                },10);
                this.navCtrl.push('VacationDraftPage', { entry: data, opeType: 'view', ref: null });
              });
        } else if(entry.calType === 'evection'){
            
        }else {
            this.navCtrl.push(SchedulePage, { 'entry': entry, chooseData: this.today ,editable:true, title: '查询' });            
        }
    }

    //直接创建群组，满足以下条件：
    //1.人员角色类型（roleType）为'scientist' 或者 'superAdmin',可以进行群组的创建
    //2.没有群组
    createRequest(){
        this.navCtrl.push(CreateGroupPage,{'obj':{},'type':false,'title':'创建'});
    }
    //进入我的群组页面（群组列表页面）
    goGroupList(){
        this.navCtrl.push(GroupListPage,{'boss':this.isLeader});
    }
}