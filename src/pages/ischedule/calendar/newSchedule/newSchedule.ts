import { Component, ViewChild } from '@angular/core';
import { globalData } from '../../../../icommon/provider/globalData';
import { IonicPage, NavController, NavParams, ModalController, Platform } from 'ionic-angular';
import {
  CalendarModal,
  CalendarModalOptions,
} from 'ion2-calendar'
import { HttpClient } from '@angular/common/http'
import { ENV } from '@env/environment';
import { NativeService } from '../../../../icommon/provider/native';
import { BackButtonService } from '../../../../icommon/provider/backButton.service';
import _ from 'lodash';
@IonicPage()
@Component({
  selector: 'page-newSchedule',
  templateUrl: 'newSchedule.html',
})
export class SchedulePage {
  gender: string = "f";
  schedule: any = {};
  calTypeList: any = [];
  officeStatusList: any = [];
  timeRemindList: any = [];
  repetTypeList: any = [];
  date: Date = new Date();
  // employees3:any=[{id:'EVERYDAY',name:"每天"},{id:'EVERYWEEK',name:"每月"},{id:'EVERYMONTH',name:"每周"}];
  editable: any;
  title: any;
  year: any;
  moth: any;
  year1: any;
  moth1: any;
  weekDay: any;
  weekDay1: any;
  weekDays: any = ["星期日", "星期一", "星期二", "星期三", "星期四", "星期五", "星期六"];
  //全天
  allDay: boolean = true;
  open: boolean = true;
  @ViewChild('detailBeginTime') myInput;
  @ViewChild('detailEndTime') myInput2;
  iontime: boolean = false;
  iontime2: boolean = false;
  iontime3: boolean = false;
  myCalendar: any;
  overTime: any;
  constructor(public backButtonService: BackButtonService, public platform: Platform, public globalData: globalData, public navCtrl: NavController, private nat: NativeService, public navParams: NavParams, public modalCtrl: ModalController, public http: HttpClient) {
    var normalDate
    if (new Date(this.navParams.get("chooseData")).getTime() > new Date().getTime()) {
        normalDate = this.navParams.get("chooseData");
    } else {
        normalDate = new Date();
    }
    this.schedule = this.navParams.get("entry");
    this.editable = this.navParams.get("editable");
    this.title = this.navParams.get("title");
    // this.schedule.beginTime = this.schedule.beginTime || new Date(str);
    // this.schedule.endTime = this.schedule.endTime || new Date(str);
    // this.schedule.calendar = this.schedule.calendar || new Date(str);
    // this.schedule.overTime = this.schedule.overTime || new Date(str);
    // this.schedule.detailBeginTime = this.schedule.detailBeginTime || "08:00";
    // this.schedule.detailEndTime = this.schedule.detailEndTime || "18:00";

    this.schedule.beginTime = this.schedule.beginTime ? new Date((this.schedule.beginTime - (new Date().getTimezoneOffset() * 60 * 1000))).toISOString() :  new Date((new Date(Date.parse((normalDate.getFullYear() + "-" + (normalDate.getMonth() + 1) + "-" + normalDate.getDate() + " " + '00:00:00').replace(/-/g, "/"))).getTime() - new Date().getTimezoneOffset() * 60 * 1000)).toISOString();
    this.schedule.endTime = this.schedule.endTime ? new Date((this.schedule.endTime - (new Date().getTimezoneOffset() * 60 * 1000))).toISOString() :  new Date((new Date(Date.parse((normalDate.getFullYear() + "-" + (normalDate.getMonth() + 1) + "-" + normalDate.getDate() + " " + '00:00:00').replace(/-/g, "/"))).getTime() - new Date().getTimezoneOffset() * 60 * 1000)).toISOString();
    //设置默认时间值



    //设置默认时间值
    if (!!this.schedule.calendar) {
      this.schedule.calendar = new Date((this.schedule.calendar - (new Date().getTimezoneOffset() * 60 * 1000))).toISOString()
      // this.schedule.calendar = new Date(this.schedule.calendar).toISOString();
    } else {
      this.schedule.calendar =  new Date((new Date(Date.parse((normalDate.getFullYear() + "-" + (normalDate.getMonth() + 1) + "-" + normalDate.getDate() + " " + '08:00:00').replace(/-/g, "/"))).getTime() - new Date().getTimezoneOffset() * 60 * 1000)).toISOString();
      let begin = this.schedule.calendar.substring(this.schedule.calendar.indexOf("T") + 1).split(':');
      this.schedule.detailBeginTime = begin[0] + ":" + begin[1];
    }
    if (!!this.schedule.overTime) {
      // this.schedule.overTime = new Date(this.schedule.overTime).toISOString();
      this.schedule.overTime = new Date((this.schedule.overTime - (new Date().getTimezoneOffset() * 60 * 1000))).toISOString()
      this.overTime = new Date(Date.parse(this.schedule.overTime)).getTime()
    } else {
      this.schedule.overTime =  new Date((new Date(Date.parse((normalDate.getFullYear() + "-" + (normalDate.getMonth() + 1) + "-" + normalDate.getDate() + " " + '18:00:00').replace(/-/g, "/"))).getTime() - new Date().getTimezoneOffset() * 60 * 1000)).toISOString();
      let end = this.schedule.overTime.substring(this.schedule.overTime.indexOf("T") + 1).split(':');
      this.schedule.detailEndTime = end[0] + ":" + end[1];
      this.overTime =new Date(Date.parse((normalDate.getFullYear() + "-" + (normalDate.getMonth() + 1) + "-" + normalDate.getDate() + " " + '18:00:00').replace(/-/g, "/"))).getTime()
    }
    if (!!this.schedule.allDay) {
      this.schedule.allDay = this.schedule.allDay == 'true' ? true : false;
    } else {
      this.schedule.allDay = true;
    }
    if (this.editable) {
      this.initAllday();
    }
    // if (this.nat.isMobile()) {
    //   this.platform.ready().then(() => {
    //     this.platform.registerBackButtonAction(() => {
    //       if(this.iontime ==true || this.iontime2 ==true || this.iontime3 ==true  ){
    //         this.myInput.dismiss();
    //         this.myInput2.dismiss();
    //         this.myCalendar.dismiss()
    //       }else{
    //         this.backButtonService.registerBackButtonAction(null);
    //       }
    //     });
    //   })
    // }
  }
  changeAllday() {
    this.initAllday();
  }
  initAllday() {
    // this.schedule.allDay = this.allDay==true ? 'true':'false';
    // this.schedule.allDay = !!this.schedule.allDay ? this.schedule.allDay : 'true';
    if (this.schedule.allDay === false) {
      // this.allDay = false;
      var myDate = new Date(this.schedule.calendar);
      this.weekDay = this.weekDays[myDate.getDay()];
      this.year = myDate.getFullYear();
      this.moth = (myDate.getMonth() + 1) + "-" + myDate.getUTCDate();

      var myDate1 = new Date(this.schedule.overTime);
      this.weekDay1 = this.weekDays[myDate1.getDay()];
      this.year1 = myDate1.getFullYear();
      this.moth1 = (myDate1.getMonth() + 1) + "-" + myDate1.getUTCDate();
    } else {
      // this.allDay = true;
      // var myBeDate = new Date(this.schedule.beginTime);
      // this.weekDay = this.weekDays[myBeDate.getDay()];
      // this.year = myBeDate.getFullYear();
      // this.moth = (myBeDate.getMonth() + 1) + "-" + myBeDate.getUTCDate();

      // var myBeDate1 = new Date(this.schedule.endTime);
      // this.weekDay1 = this.weekDays[myBeDate1.getDay()];
      // this.year1 = myBeDate1.getFullYear();
      // this.moth1 = (myBeDate1.getMonth() + 1) + "-" + myBeDate1.getUTCDate();
    }
  }
  goback() {
    this.navCtrl.pop();
  }
  ngOnInit() {
    let loginObj = JSON.parse(localStorage.getItem("objectList"));
    this.schedule.userId = this.schedule.userId || loginObj['staff'].userId;
    this.schedule.userName = this.schedule.userName || loginObj['staff'].userName;
    this.schedule.orgId = this.schedule.orgId || loginObj['orgId'];
    this.schedule.orgName = this.schedule.orgName || loginObj['deptTo'].deptName;
    // 初始化下拉框默认值
    this.schedule.calType = this.schedule.calType || 'calendar';
    this.schedule.officeStatus = this.schedule.officeStatus || 'HOME';
    this.schedule.timeRemind = this.schedule.timeRemind || 'NOPROMPT';
    // this.schedule.repetitionType = this.schedule.repetitionType || 'EVERYDAY';
    this.schedule.open = this.schedule.open || 'true';
    // if(!!this.schedule.allDay){
    //   this.schedule.allDay = this.schedule.allDay=='true' ? true: false;
    // }else{
    //   this.schedule.allDay = true;
    // }
    // this.schedule.allDay = this.schedule.allDay || true;

    this.open = this.schedule.open == 'true' ? true : false;
    // this.allDay = this.schedule.allDay == 'true' ? true : false;
    //回显日期
    // this.schedule.calendar = this.schedule.calendar ? new Date(this.schedule.calendar) : new Date();
    // this.schedule.beginTime = this.schedule.beginTime ? new Date(this.schedule.beginTime) : new Date();
    // this.schedule.endTime = this.schedule.endTime ? new Date(this.schedule.endTime) : new Date();
    // this.schedule.overTime = this.schedule.overTime ? new Date(this.schedule.overTime) : new Date();

    //翻译日程类型
    let list = [];
    list.push(this.schedule);
    let dictOpts = [
      { dict: 'COA_CAL_TYPE', orgField: 'calType', destField: 'calTypeName' }
    ];
    this.globalData.transformDict(dictOpts, list, 'oa');
    this.schedule = list[0];
    //获取下拉列表数值
    this.querySelectList();
  }

  prepareStart() {
  }
  openCalendar(dateType) {
    const options: CalendarModalOptions = {
      title: '',
      defaultDate: this.date,
      monthFormat: 'YYYY 年 MM 月 DD日 ',
      weekdays: ['日', '一', '二', '三', '四', '五', '六'],
      weekStart: 0,
      closeLabel: '关闭',
      doneLabel: '确定',
      defaultScrollTo: this.date
    };

    this.myCalendar = this.modalCtrl.create(CalendarModal, {
      options: options
    });

    this.myCalendar.present();

    this.myCalendar.onDidDismiss((date, type) => {
      if (type === 'done') {
        this.date = date.dateObj;
        switch (dateType) {
          case "calendar":
            this.schedule.calendar = date.dateObj;
            break;
          case "overTime":
            this.schedule.overTime = date.dateObj;
            break;
          case "beginTime":
            this.schedule.beginTime = date.dateObj;
            break;
          case "endTime":
            this.schedule.endTime = date.dateObj;
            break;
        }
      }
    })

  }
  ionViewDidLoad() {
  }
  cancle() {
    this.navCtrl.pop();
  }
  openTime(item) {
    if (item == 'detailBeginTime') {
      this.myInput.open();
    } else {
      this.myInput2.open();
    }
  }
  start(date) {
    if (!!date) {
      this.schedule.calendar = date;
      let startDate2 = new Date(Date.parse(date.substring(0, date.indexOf("T")))).getTime();
      let mydate = new Date(startDate2);
      this.weekDay = this.weekDays[mydate.getDay()];
      let begin = date.substring(date.indexOf("T") + 1).split(':');
      this.schedule.detailBeginTime = begin[0] + ":" + begin[1];
    }
  }
  end(date) {
    if (!!date) {
      this.schedule.overTime = date;
      let startDate2 = new Date(Date.parse(date.substring(0, date.indexOf("T")))).getTime();
      this.overTime = startDate2;
      let mydate = new Date(startDate2);
      this.weekDay1 = this.weekDays[mydate.getDay()];
      let end = date.substring(date.indexOf("T") + 1).split(':');
      this.schedule.detailEndTime = end[0] + ":" + end[1];
    }
  }
  save = _.throttle(function () {
    if (!this.schedule.title) {
      this.nat.showAlert('请填写标题！');
      return;
    }
    if (this.allDay === false) {
      if (!this.schedule.detailBeginTime) {
        this.nat.showAlert('请选择开始时分！');
        return;
      }
      if (!this.schedule.detailEndTime) {
        this.nat.showAlert('请选择结束时分！');
        return;
      }

      if (new Date(Date.parse(this.schedule.calendar)).getTime() > new Date(Date.parse(this.schedule.overTime)).getTime()) {
        this.nat.showAlert("结束日期不能大于开始日期！");
        return;
      }
      // if (new Date(this.schedule.calendar).getTime() == new Date(this.schedule.overTime).getTime()) {
      //   if (this.CompareDate(this.schedule.detailBeginTime, this.schedule.detailEndTime) === false) {
      //     this.nat.showAlert("结束时分不能小于开始时分！")
      //     return;
      //   }
      // }
    } else {
      if (new Date(this.schedule.beginTime).getTime() > new Date(this.schedule.endTime).getTime()) {
        this.nat.showAlert("结束日期不能大于开始日期！");
        return;
      }
    }
    this.nat.showLoading();
    this.schedule.open = this.open == true ? 'true' : 'false';
    this.schedule.allDay = this.schedule.allDay == true ? 'true' : 'false';
    this.schedule.beginTime = new Date(Math.round(Date.parse(this.schedule.beginTime)) + new Date().getTimezoneOffset() * 60 * 1000).toISOString();
    this.schedule.endTime = new Date(Math.round(Date.parse(this.schedule.endTime)) + new Date().getTimezoneOffset() * 60 * 1000).toISOString();
    this.schedule.calendar = new Date(Math.round(Date.parse(this.schedule.calendar)) + new Date().getTimezoneOffset() * 60 * 1000).toISOString();
    this.schedule.overTime = new Date(Math.round(Date.parse(this.schedule.overTime)) + new Date().getTimezoneOffset() * 60 * 1000).toISOString();
    this.schedule.repetitionType = "EVERYDAY";
    this.http.post(ENV.httpurl + '/api/cal/saveOrUpdateCalendar', this.schedule).subscribe(data => {
      this.nat.showToast("保存成功").then(() => {
        this.nat.hideLoading();
        setTimeout(() => {
          this.navCtrl.pop()
        }, 800)
      })
    },error =>{
      this.nat.hideLoading();
    });
  }, 800)
  CompareDate(t1, t2) {
    let date = new Date();
    let dangqian = date.toLocaleTimeString('chinese', { hour12: false })
    let dq: any; let a: any; let b: any; let dqdq: any; let aa: any; let bb: any;
    dq = dangqian.split(":");
    a = t1.split(":");
    b = t2.split(":");
    dqdq = date.setHours(dq[0], dq[1]);
    aa = date.setHours(a[0], a[1]);
    bb = date.setHours(b[0], b[1]);
    return aa < bb
  }
  querySelectList() {
    //日程类型
    this.http.post(ENV.httpurl + '/api/dictOption/getListByDictCode', { dictCode: 'COA_CAL_TYPE' }).subscribe((data) => {
      this.calTypeList = data;
    });
    // 办公状态
    this.http.post(ENV.httpurl + '/api/dictOption/getListByDictCode', { dictCode: 'COA_CALENDAR_OFFICE_STATUS' }).subscribe((data) => {
      this.officeStatusList = data;
    });
    //提前提示
    this.http.post(ENV.httpurl + '/api/dictOption/getListByDictCode', { dictCode: 'COA_CAL_REMIND_TIME_REMAIN' }).subscribe((data) => {
      this.timeRemindList = data;
    });

    this.http.post(ENV.httpurl + '/api/dictOption/getListByDictCode', { dictCode: 'COA_CAL_REPETITION_REPETITION_TYPE' }).subscribe((data) => {
      this.repetTypeList = data;
    });
  }

}
