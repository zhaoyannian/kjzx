import { Component } from '@angular/core';
import { NavController, IonicPage, AlertController, NavParams, App } from 'ionic-angular';
import { SchedulePage } from './newSchedule/newSchedule';
import { GroupCalPage } from './groupCal/groupCal';
import { MoreListPage } from './moreList/moreList';
import { EditorViewPage } from '../../imeeting/meetings/editor/editorView';
import { HttpClient } from '@angular/common/http'
import { ENV } from '@env/environment';
import { NativeService } from '.././../../icommon/provider/native';

import { LoginPage } from '../../../pages/login/login'


import _ from 'lodash';
import * as $ from 'jquery';
import { Events } from 'ionic-angular';
@IonicPage()
@Component({
  selector: 'page-calendar',
  templateUrl: 'calendar.html'
})

export class CalendarPage {
  date: string;
  type: 'string';
  dateMulti: string;
  chooseData: any;
  // daysConfig: DayConfig[] = [];
  myResultDate: any = [];
  today: any = new Date();
  nextMonthDaysNext: any;
  nextMonthDaysLast: any;
  isToday: any;
  thisWeeks: any = [];
  calendarCount: any = [];
  definition: any = [];
  defTimeData: any = [];
  week: any;
  now: any;
  memberArr: any = [];
  userIdOfShowArr: any = [];
  calendarList: any = [];
  calendarType: any = '0';
  calendarTypeEntry: any = {
    0: '我的日程',
    1: '部门日程',
    2: '领导日程',
    3: '群组日程',
    4: '同事日程',
    5: '全部日程'

  };
  loginObj: any;
  roles: any = [];
  isDeptManager: any;
  isManager: any;
  isLeader: any;
  goOutCals: any = [];
  meetingCals: any = [];
  calendarNList: any = [];
  leaveCals: any = [];
  evectionCals: any = [];
  allCalList: any = [];
  coaCalDicts: any = [];
  allType: any = true;
  userCalTos: any = [];
  state: any = ENV.httpurl;
  showStatus: any = true;
  //岗位日程模块
  leadArr: any = [];
  //岗位日程类型上下午是否显示
  types: any;
  //岗位人员id
  gwUserIds: any = [];
  syMore: boolean = false;
  nowTime: any;
  hour: any;
  page: any = 1;
  pageSize: any = 1;
  noMoreData: boolean = false;
  constructor(public events: Events, public navParams: NavParams, public navCtrl: NavController, public http: HttpClient, public NativeService: NativeService, public alertCtrl: AlertController, public appCtrl: App) {
    //当前时间
    this.now = new Date();
    //初始化数据
    // this.initData();
    events.subscribe('tabs:more', (num) => {
      CalendarPage.prototype.syMore = true;
    });


  }
  ngOnInit() {
    this.loginObj = JSON.parse(localStorage.getItem("objectList"));
    this.roles = this.loginObj['rolesTo'] ? _.map(this.loginObj['rolesTo'], 'roleType') : [];
    this.isDeptManager = _.includes(this.roles, 'deptroles') || _.includes(this.roles, 'superAdmin') ? true : false;
    this.isManager = _.includes(this.roles, 'officeDirector') ? true : false;
    this.isLeader = _.includes(this.roles, 'scientist') || _.includes(this.roles, 'superAdmin') ? true : false;
    this.getDiction();
  }
  //获取岗位日程信息
  getGwCal() {
    this.http.post(ENV.httpurl + '/api/cal/position', {}).subscribe(data => {
      this.leadArr = data;
      _.map(this.leadArr, n => {
        n.checked = false;
      })
    });
  }
  //获取岗位日程是否显示
  getDictGw() {
    this.http.get(ENV.httpurl + "/api/dictOption/queryDictOptionFindByDictCode/SYS_CALENDAR_CONFIG").subscribe(data => {
      this.types = _.filter(data, (n) => n['optionName'] === 'ampm')[0]['optionValue'];
    });
  }
  //获取数据字典
  getDiction() {
    this.http.get(ENV.httpurl + "/api/dictOption/queryDictOptionFindByDictCode/COA_CAL_TYPE").subscribe(data => {
      this.coaCalDicts = data;
    });
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
    //获取岗位日程信息
    this.getGwCal();
    //获取岗位日程是否显示
    this.getDictGw();
    if (!!CalendarPage.prototype.syMore) {
      this.calendarType = '0';
    } else {
      this.calendarType = !!this.calendarType ? (this.calendarType === '3' ? '0' : this.calendarType) : '0';
    }
    this.initData();
    this.events.publish('tabs:slide0', 'slide0');
  }
  ///当离开页面时触发方法
  ionViewDidLeave() {
    $('#Select').hide();
  }
  //初始化数据，在init()中，包括初始化月、星期、今天的数据
  initData() {
    //初始化，上一个月，下一个月的时间
    var dateStr = sessionStorage.getItem("date");
    if (!dateStr || CalendarPage.prototype.syMore == true) {
      this.today = new Date();
      let year = this.today.getFullYear();
      let month = this.today.getMonth();
      this.nextMonthDaysNext = new Date(year, month + 1, 0).getDate();
      this.nextMonthDaysLast = new Date(year, month, 0).getDate();
    } else {
      this.today = new Date(dateStr);
      let year = this.today.getFullYear();
      let month = this.today.getMonth();
      this.nextMonthDaysNext = new Date(year, month + 1, 0).getDate();
      this.nextMonthDaysLast = new Date(year, month, 0).getDate();
    }
    //本周时间，上一月下一月，同步更新星期数,上一周下一周，同步页更新星期数
    this.initWeek(this.today);
    //默认当天日程
    this.page = 1;
    this.pageSize = 10;
    this.selctALL(this.calendarType, this.today);
    this.isToday = this.now;
  }
  //查询天对应的日程
  queryDateCalendarPage(date) {
    this.today = date;
    let year = this.today.getFullYear();
    let month = this.today.getMonth();
    this.nextMonthDaysNext = new Date(year, month + 1, 0).getDate();
    this.nextMonthDaysLast = new Date(year, month, 0).getDate();
    this.initWeek(this.today);
    this.page = 1;
    this.pageSize = 10;
    this.selctALL(this.calendarType, this.today);
    sessionStorage.setItem("date", date);
  }
  //查询天对应的日程（我的日程）
  queryDateCalendar(date, refresher) {
    this.http.post(ENV.httpurl + "/api/cal/queryMyAppCalendarListForDate?page=" + this.page + "&pageSize=" + this.pageSize, {
      date: date,
    }).subscribe(
      (data) => {
        this.myResultDate = data;
        if (!!refresher) {
          refresher.complete()
        }
      },
      () => {
        if (!!refresher) {
          refresher.complete()
        }
      }
    );
  }
  //时间显示形式，方法
  timeMethod(startDate, closeDate) {
    return this.NativeService.timeMethod(startDate, closeDate);
  }
  //新增日程信息
  add() {
    this.navCtrl.push(SchedulePage, { 'entry': {}, chooseData: this.today, editable: false, title: '创建' });
  }
  //删除日程（我的日程模块调用）
  removeItem(item) {
    if (item) {
      if (item.allowed === 'false') {
        this.NativeService.showAlert("系统日程，不能删除");
      }
      if (item.repetitionType !== 'NOREPEAT') {
        const confirm = this.alertCtrl.create({
          message: '确认删除该条日程吗？',
          buttons: [
            {
              text: '取消',
              handler: () => {
              }
            },
            {
              text: '确定',
              handler: () => {
                this.deleteItem(item);
              }
            }
          ]
        });
        confirm.present();
      } else {
        const confirm = this.alertCtrl.create({
          message: '确认删除该条日程吗？',
          buttons: [
            {
              text: '取消',
              handler: () => {
              }
            },
            {
              text: '确定',
              handler: () => {
                this.deleteItem(item);
              }
            }
          ]
        });
        confirm.present();
      }
    }
  }
  //删除日程公共方法（我的日程模块调用）
  deleteItem(item) {
    this.http.post(ENV.httpurl + '/api/calendar/deleteCalendars', item).subscribe(data => {
      if (!!this.chooseData) {
        this.queryDateCalendarPage(this.chooseData);
      } else {
        let date = new Date();
        this.queryDateCalendarPage(date);
      }
    });
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
      // let da = date.getDate();
      week.push(date);
    }
    // this.haveCalendar(week);
    this.getCountAll(this.calendarType, week);
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
    this.getCountAll(this.calendarType, week);
    //查询日程
    this.today = lastWe;
    this.page = 1;
    this.pageSize = 10;
    this.selctALL(this.calendarType, this.today);
  }
  //判断当天是不是有日程，便于显示黄点还是蓝点  --- 我的日程
  haveCalendarMy(weeks) {
    var self = this;
    if (weeks.length > 0) {
      this.http.post(ENV.httpurl + "/api/cal/queryMyAppCalendarCount", weeks).subscribe(
        (data) => {
          this.calendarCount = data;
          self.thisWeeks = [];
          for (let j = 0; j < this.calendarCount.length; j++) {
            let obj = {};
            obj['week'] = weeks[j];
            obj['count'] = this.calendarCount[j];
            self.thisWeeks.push(obj);
          }
        },
        () => {
          // let hasToken = localStorage.getItem("token");
          // if(hasToken == '1' || hasToken == null ){ // 弹提示
          localStorage.setItem('token', '1'); // 日程异常，跳到登录页
          let activeNav: NavController = this.appCtrl.getActiveNav();
          activeNav.push(LoginPage);
          // } else {
          //     this.NativeService.showAlert("会议后端异常，请联系管理员");
          // }
        }
      );
    } else {

    }
  }
  //判断当天是不是有日程，便于显示黄点还是蓝点  --- 同事日程、领导日程，部门日程
  //"/api/calgroup/queryMyColleagueUserIds" 同事日程
  //"/api/group/queryMyBossUserIds" 领导日程
  //"/api/group/queryMyDeptUserIds" 部门日程
  haveCalendarTs(weeks, uri, calUri) {
    if (weeks.length > 0) {
      this.http.post(ENV.httpurl + uri, {
        queryKey: ''
      }).subscribe((data) => {
        this.memberArr = data;
        _.map(this.memberArr, (o) => o.checked = true);
        this.userIdOfShowArr = this.memberArr.slice(0);

        if (!!calUri) {
          this.queryColleagueCalendars(this.userIdOfShowArr, this.today, calUri);
        }
        //传入参数 userIds
        let colleagueUserIds = [];
        _.map(this.userIdOfShowArr, (o) => {
          colleagueUserIds.push(o.userId);
        });
        if (colleagueUserIds && colleagueUserIds.length > 0) {
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
              if (hasToken == '1' || hasToken == null) { // 弹提示
                localStorage.setItem('token', '1'); // 会议室异常，跳到登录页
                let activeNav: NavController = this.appCtrl.getActiveNav();
                activeNav.push(LoginPage);
              } else {
                this.NativeService.showAlert("后端异常，请联系管理员1");
              }
            }
          );
        } else {
          this.thisWeeks = [];
          for (let j = 0; j < weeks.length; j++) {
            let obj = {};
            obj['week'] = weeks[j];
            obj['count'] = 0;
            this.thisWeeks.push(obj);
          }
        }
      },
        () => {
          let hasToken = localStorage.getItem("token");
          if (hasToken == '1' || hasToken == null) { // 弹提示
            localStorage.setItem('token', '1'); // 会议室异常，跳到登录页
            let activeNav: NavController = this.appCtrl.getActiveNav();
            activeNav.push(LoginPage);
          } else {
            this.NativeService.showAlert("后端异常，请联系管理员2")
          }
        }
      );
    }
  }
  //判断当天是不是有日程，便于显示黄点还是蓝点  --- 全部日程  --- TODO
  haveCalendarALl(weeks) {
    if (weeks.length > 0) {
      this.http.post(ENV.httpurl + "/api/cal/queryAppCalendarListForDateCount", {
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
          if (hasToken == '1' || hasToken == null) { // 弹提示
            localStorage.setItem('token', '1'); // 会议室异常，跳到登录页
            let activeNav: NavController = this.appCtrl.getActiveNav();
            activeNav.push(LoginPage);
          } else {
            this.NativeService.showAlert("后端异常，请联系管理员3");
          }
        }
      );
    } else {
      this.thisWeeks = [];
    }
  }
  //判断当天是不是有日程，便于显示黄点还是蓝点  --- 岗位日程  --- TODO
  haveCalendarGw(weeks) {
    if (weeks.length > 0) {
      let a = _.filter(this.gwUserIds, n => {
        return n != undefined;
      })
      this.http.post(ENV.httpurl + "/api/cal/queryAppCalendarListForDateCount", {
        members: a,
        dates: weeks
      }).subscribe(
        (data) => {
          this.calendarCount = data;
          this.thisWeeks = [];
          for (let j = 0; j < this.calendarCount.length; j++) {
            let obj = {};
            obj['week'] = weeks[j];
            obj['count'] = this.gwUserIds.length > 0 ? this.calendarCount[j] : 0;
            this.thisWeeks.push(obj);
          }
        },
        () => {
          let hasToken = localStorage.getItem("token");
          if (hasToken == '1' || hasToken == null) { // 弹提示
            localStorage.setItem('token', '1'); // 会议室异常，跳到登录页
            let activeNav: NavController = this.appCtrl.getActiveNav();
            activeNav.push(LoginPage);
          } else {
            this.NativeService.showAlert("后端异常，请联系管理员4");
          }
        }
      );
    } else {
      this.thisWeeks = [];
    }
  }
  //查询我的(同事,部门，领导)及日程
  initMyColleagueList(date, uri, calUri) {
    this.http.post(ENV.httpurl + uri, {
      queryKey: ''
    }).subscribe((data) => {
      this.memberArr = data;
      this.userIdOfShowArr = this.memberArr.slice(0);
      this.queryColleagueCalendars(this.userIdOfShowArr, date, calUri);
    });
  }
  //查询(同事,部门，领导)日程
  queryColleagueCalendars(userIds, selectDay, calUri) {
    if (userIds && userIds.length > 0) {
      this.http.post(ENV.httpurl + calUri, {
        members: _.map(userIds, (o) => o.userId),
        date: new Date(selectDay)
      }).subscribe(
        (data) => {
          //日程 TODO 待完善
          this.calendarList = data;
        },
        () => {
          let hasToken = localStorage.getItem("token");
          if (hasToken == '1' || hasToken == null) { // 弹提示
            localStorage.setItem('token', '1'); // 会议室异常，跳到登录页
            let activeNav: NavController = this.appCtrl.getActiveNav();
            activeNav.push(LoginPage);
          } else {
            this.NativeService.showAlert("后端异常，请联系管理员5");
          }
        }
      );
    } else {
      this.calendarList = [];
    }
  }

  //恢复到今天，对应今的图标
  initToday() {
    sessionStorage.setItem("date", this.now);
    this.initData();
  }
  getShow() {
    return (this.today.getFullYear() + '-' + this.today.getMonth() + '-' + this.today.getDate()) !== (this.now.getFullYear() + '-' + this.now.getMonth() + '-' + this.now.getDate()) ? true : false;
  }

  choose(el) {
    $('#' + el).toggle(200);
  }
  //选择日程类型调用不同信息
  selctCT(i) {
    this.calendarType = i;
    if (i !== '0' && i !== '1' && i !== '2' && i !== '3' && i !== '4' && i !== '5') {
      this.calendarType = i.name;
      this.gwUserIds = _.map(i.staffs, 'userId');
      _.map(this.leadArr, n => {
        n.checked = false;
      })
      i.checked = true;
    }
    $('#Select').hide();
    this.initWeek(this.today);
    this.page = 1;
    this.pageSize = 10;
    this.selctALL(i, this.today);
  }
  //刷新
  tabslideRefreshFn(refresher) {
    this.page = 1;
    this.pageSize = 10;
    if (this.calendarType == '0') {
      this.queryDateCalendar(this.today, refresher)
    }
  }
  //下拉分页查询
  tabslideNextRefreshFn(infiniteScroll) {
    if (!!this.noMoreData) {
      infiniteScroll.complete();
    } else {
      this.page += 1;
      if (this.calendarType == '0') {
        this.http.post(ENV.httpurl + "/api/cal/queryMyAppCalendarListForDate?page=" + this.page + "&pageSize=" + this.pageSize, {
          date: this.today,
        }).subscribe(data => {
          if (data['length'] == 0) {
            this.noMoreData = true;
          } else {
            this.myResultDate = this.myResultDate.concat(data);
          }
          infiniteScroll.complete()
        });
      }
    }
  }
  //获取个日程类型当天日程信息
  selctALL(i, day) {
    switch (i) {
      case '0': //我的日程
        this.queryDateCalendar(day, null);
        break;
      case '1': //部门日程 --- 整合，查询日程信息个数同时，查询日程信息  getCountAll
        // let uri = '/api/group/queryMyDeptUserIds';
        // let calUri = '/api/cal/queryAppCalendarListForDate';
        // this.initMyColleagueList(day, uri, calUri);
        break;
      case '2': //领导日程
        let uri1 = '/api/group/queryAllStaffs';
        let calUri1 = '/api/cal/queryAppCalendarListForDate';
        this.initMyColleagueList(day, uri1, calUri1);
        break;
      case '3': //群组日程
        this.navCtrl.push(GroupCalPage);
        break;
      case '4':  //同事日程
        //默认当天日程 --- 整合，查询日程信息个数同时，查询日程信息  getCountAll
        // let uri2 = '/api/calgroup/queryMyColleagueUserIds';
        // let calUri2 = '/api/cal/queryAppCalendarListForDate';
        // this.initMyColleagueList(day, uri2, calUri2);
        break;
      case '5':  //全部日程
        if (this.allType) {
          this.queryAllCalGroupByUserDate(day);
        } else {
          this.queryDateCalendarAll(day);
        }
        break;
      default:
        let calUri2 = '/api/cal/queryAppCalendarListForDate';
        this.queryDateGwCal(this.gwUserIds, day, calUri2);
    }
  }
  //获取各类日程个数方法
  getCountAll(i, weeks) {
    switch (i) {
      case '0': //我的日程
        this.haveCalendarMy(weeks);
        break;
      case '1': //部门日程
        let uri = '/api/group/queryMyDeptUserIds';
        let calUri = '/api/cal/queryAppCalendarListForDate';
        this.haveCalendarTs(weeks, uri, calUri);
        break;
      case '2': //领导日程
        let uri1 = '/api/group/queryMyBossUserIds';
        this.haveCalendarTs(weeks, uri1, '');
        break;
      case '3': //群组日程

        break;
      case '4':  //同事日程
        //默认当天日程
        let uri2 = '/api/calgroup/queryMyColleagueUserIds';
        let calUri2 = '/api/cal/queryAppCalendarListForDate';
        this.haveCalendarTs(weeks, uri2, calUri2);
        break;
      case '5':  //全部日程
        this.haveCalendarALl(weeks);
        break;
      default:
        this.haveCalendarGw(weeks);
    }
    this.NativeService.hideLoading();
  }
  //全部日程的周日程视图数据
  queryAllCalGroupByUserDate(date) {
    var weekToday = this.today.getDay() + 1;
    this.userCalTos = [];
    this.http.post(ENV.httpurl + "/api/calendar/queryAllCalendars", { calendar: date }, { params: {} }).subscribe(
      (data) => {
        _.each(_.filter(data, (calData) => !!calData[weekToday].length), (userCalData) => {
          var userCalTo = {
            userIdd: userCalData[0],
            userName: userCalData[weekToday][0].userName,
            photoId: userCalData[weekToday][0].photo,
            calendarTos: userCalData[weekToday]
          };
          // self.transformService.transformStaffEntity('userIdd', ['userName', 'photo'], ['userName', 'photoId'], [userCalTo]);
          this.userCalTos.push(userCalTo);
        });
      },
      () => {
        let hasToken = localStorage.getItem("token");
        if (hasToken == '1' || hasToken == null) { // 弹提示
          localStorage.setItem('token', '1'); // 会议室异常，跳到登录页
          let activeNav: NavController = this.appCtrl.getActiveNav();
          activeNav.push(LoginPage);
        } else {
          this.NativeService.showAlert("后端异常，请联系管理员6");
        }
      }
    );
  }
  //查询岗位日程数据
  queryDateGwCal(userIds, selectDay, calUri) {
    if (userIds && userIds.length > 0) {
      this.http.post(ENV.httpurl + calUri, {
        members: _.filter(userIds, n => {
          return n != undefined;
        }),
        date: new Date(selectDay)
      }).subscribe(
        (data) => {
          // let dataList = _.filter(data,n=> n['calendarTos'].length > 0);
          //日程 TODO 待完善
          this.calendarList = data;
        },
        () => {
          let hasToken = localStorage.getItem("token");
          if (hasToken == '1' || hasToken == null) { // 弹提示
            localStorage.setItem('token', '1'); // 会议室异常，跳到登录页
            let activeNav: NavController = this.appCtrl.getActiveNav();
            activeNav.push(LoginPage);
          } else {
            this.NativeService.showAlert("后端异常，请联系管理员7");
          }
        }
      );
    } else {
      this.calendarList = [];
    }
  }
  //查询天对应的日程
  queryDateCalendarAll(date) {
    this.http.post(ENV.httpurl + "/api/cal/queryisBossMonthCalendars", {
      date: date
    }).subscribe(
      (data) => {
        this.allCalList = data;
        this.goOutCals = [];
        this.meetingCals = [];
        this.calendarNList = [];
        this.leaveCals = [];
        this.evectionCals = [];
        if (this.allCalList.length > 0) {
          _.map(this.allCalList, (cal) => {
            cal.calTypeText = _.find(this.coaCalDicts, {
              dictCode: 'COA_CAL_TYPE',
              optionValue: cal.calType
            })['optionName'];
            if (cal.calType == 'goout') {
              this.goOutCals.push(cal);
            }
            if (cal.calType == 'meeting') {
              this.meetingCals.push(cal);
            }
            if (cal.calType == 'calendar') {
              this.calendarNList.push(cal);
            }
            if (cal.calType == 'leave') {
              this.leaveCals.push(cal);
            }
            if (cal.calType == 'evection') {
              this.evectionCals.push(cal);
            }
          });
        }
      },
      () => {
        let hasToken = localStorage.getItem("token");
        if (hasToken == '1' || hasToken == null) { // 弹提示
          localStorage.setItem('token', '1'); // 会议室异常，跳到登录页
          let activeNav: NavController = this.appCtrl.getActiveNav();
          activeNav.push(LoginPage);
        } else {
          this.NativeService.showAlert("后端异常，请联系管理员8");
        }
      }
    );
  }
  //设置样式显示,日程信息有数据显示...
  checkClassType(cur, now) {
    let curN = new Date(cur);
    let nowN = new Date(now);
    return curN.getTime() >= nowN.getTime() ? true : false;
  }

  //查看日程/修改日程信息（我的日程模块调用） type = true / fasle
  viewCal(entry, type) {
    if (entry.calType === 'meeting') { //会议
      // this.http.get(ENV.httpurl+"/api/meetingApi/queryEntity/"+entry.busId).subscribe(data =>{
      //     this.navCtrl.push(EditorViewPage, { selectMr: data});
      this.navCtrl.push(EditorViewPage, { 'busId': entry.busId });
      //   })
    } else if (entry.calType === 'goout') { //外出

    } else if (entry.calType === 'leave') { //请假
      this.showStatus = false;
      this.http.get(ENV.httpurl + "/api/leaveApply/queryEntity/" + entry.busId).subscribe(async data => {
        setTimeout(() => {
          this.showStatus = true;
        }, 10);
        this.navCtrl.push('VacationDraftPage', { entry: data, opeType: 'view', ref: null });
      });
    } else if (entry.calType === 'evection') {

    } else {
      this.navCtrl.push(SchedulePage, { 'entry': entry, chooseData: this.today, editable: type, title: (type ? '查询' : '修改') });
    }
  }
  //查询分组日程
  goMoreList(list) {
    this.navCtrl.push(MoreListPage, { 'myResultDate': list });
  }
  //获取岗位日程数据
  // getGwData(data, type) {
  //     if (type === 'AM') {
  //         return _.filter(data, (n) => n.calClass === 'AM' || n.calClass === 'ALL' || n.calClass === 'CROSS');
  //     } else {
  //         return _.filter(data, (n) => n.calClass === 'PM' || n.calClass === 'ALL' || n.calClass === 'CROSS');
  //     }
  // }
  getGwData(data, type) {
    if (type === 'AM') {
      // return _.filter(data, (n) => n.calClass === 'AM' || n.calClass === 'ALL' || n.calClass === 'CROSS');
      return _.filter(data, (n) => n.calClass === 'AM');
    } else if (type === 'PM') {
      return _.filter(data, (n) => n.calClass === 'PM');
    } else if (type === 'CROSS') {
      return _.filter(data, (n) => n.calClass === 'CROSS');
    } else if (type === 'ALL') {
      return _.filter(data, (n) => n.calClass === 'ALL');
    }
  }
}