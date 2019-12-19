import { NativeService } from './../../../../icommon/provider/native';
import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams,ModalController } from 'ionic-angular';
import {
  CalendarModal,
  CalendarModalOptions,
} from 'ion2-calendar'
import { HttpClient } from '@angular/common/http'
import { ENV } from '@env/environment';

@IonicPage()
@Component({
  selector: 'page-new-schedule',
  templateUrl: 'new-schedule.html',
})
export class NewSchedulePage {
  gender: string = "f";
  schedule:any = {};
  calTypeList:any=[];
  officeStatusList:any=[];
  timeRemindList:any=[];
  date: Date = new Date();
  employees3:any=[{id:'EVERYDAY',name:"每天"},{id:'EVERYWEEK',name:"每月"},{id:'EVERYMONTH',name:"每周"}];
  constructor(public NativeService:NativeService,public navCtrl: NavController, public navParams: NavParams,public modalCtrl: ModalController,public http:HttpClient) {
    let str = this.navParams.get("chooseData");
    this.schedule = this.navParams.get("entry");
    this.schedule.startDate=new Date(str.time);
    this.schedule.endDate=new Date();
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
    this.schedule.repetitionType = this.schedule.repetitionType || 'EVERYDAY';
    this.schedule.open =  this.schedule.open || 'true';
    this.schedule.allDay =  this.schedule.allDay || 'true';
    //回显日期
    this.schedule.calendar = this.schedule.calendar ? new Date(this.schedule.calendar) : new Date();
    this.schedule.beginTime = this.schedule.beginTime ? new Date(this.schedule.beginTime) : new Date();
    this.schedule.endTime = this.schedule.endTime ? new Date(this.schedule.endTime) : new Date();
    this.schedule.overTime = this.schedule.overTime ? new Date(this.schedule.overTime) : new Date();
    //获取下拉列表数值
    this.querySelectList();
  }

  prepareStart() {
  }
  openCalendar(dateType) {
    const options: CalendarModalOptions = {
      title: 'BASIC',
      defaultDate: this.date,
      monthFormat: 'YYYY 年 MM 月 DD日 ',
      weekdays: ['日', '一', '二', '三', '四', '五', '六'],
      weekStart:0,
      closeLabel: '关闭',
      doneLabel: '确定',
      defaultScrollTo:this.date
    };

    let myCalendar = this.modalCtrl.create(CalendarModal, {
      options: options
    });

    myCalendar.present();

    myCalendar.onDidDismiss((date, type) => {
      if (type === 'done') {
        this.date = date.dateObj;
        switch(dateType){
          case "calendar":
          this.schedule.calendar= date.dateObj;
          break;
          case "overTime":
          this.schedule.overTime= date.dateObj;
          break;
          case "beginTime":
          this.schedule.beginTime= date.dateObj;
          break;
          case "endTime":
          this.schedule.endTime= date.dateObj;
          break;
        }
      }
    })

  }
  ionViewDidLoad() {
  }
  cancle(){
    this.navCtrl.pop();
  }
  save(){
    this.http.post(ENV.httpurl + '/api/cal/saveOrUpdateCalendar',this.schedule).subscribe(data =>{
      // this.navCtrl.pop();
      this.NativeService.showToast("保存成功").then(()=>{
        setTimeout(() => {
          this.navCtrl.pop()
        },800)
      })
    });
  }

  querySelectList(){
     //日程类型
     this.http.post(ENV.httpurl + '/api/dictOption/getListByDictCode',{dictCode:'COA_CAL_TYPE'}).subscribe((data) =>{
      this.calTypeList = data;
  });
  // 办公状态
  this.http.post(ENV.httpurl + '/api/dictOption/getListByDictCode',{dictCode:'COA_CALENDAR_OFFICE_STATUS'}).subscribe((data) =>{
    this.officeStatusList = data;
  });
  //提前提示
  this.http.post(ENV.httpurl + '/api/dictOption/getListByDictCode',{dictCode:'COA_CAL_REMIND_TIME_REMAIN'}).subscribe((data) =>{
    this.timeRemindList = data;
  });
  }
}
