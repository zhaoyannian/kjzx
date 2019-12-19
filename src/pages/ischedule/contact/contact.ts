import { Component } from '@angular/core';
import { NavController, ModalController,PopoverController,AlertController } from 'ionic-angular';
import { CalendarComponentOptions } from "ion2-calendar";
import { NewSchedulePage } from './new-schedule/new-schedule';
import { PopoverPage } from './popover';
import { HttpClient } from '@angular/common/http'
import { ENV } from '@env/environment';
import { NativeService } from '.././../../icommon/provider/native';
@Component({
  selector: 'page-contact',
  templateUrl: 'contact.html'
})
export class ContactPage {
  date: string;
  type: 'string';
  dateMulti: string;
  chooseData:any;
  // daysConfig: DayConfig[] = [];
  myResultDate:any = [];
  optionsMulti: CalendarComponentOptions = {
    pickMode: 'single',
    from:new Date(new Date().getTime() - 24 * 60 * 60 * 1000 * 365 * 5),
    to:new Date(new Date().getTime() + 24 * 60 * 60 * 1000 * 365 * 10),
    showToggleButtons:true,
    showMonthPicker:true,
    monthPickerFormat:['一月', '二月', '三月', '四月', '五月', '六月', '七月', '八月', '九月', '十月', '十一月', '十二月'],
    monthFormat:'YYYY 年 MM 月 DD日',
    weekdays:['日', '一', '二', '三', '四', '五', '六'],
    weekStart:0,
    // daysConfig:this.daysConfig.push({
    //   date: new Date(2018, 0, 1),
    //   subTitle: 'New Year\'s',
    //   cssClass: 'my-day'
    // })
    // daysConfig:[{date:new Date(),subTitle:2,cssClass:'red'}]
  };
  constructor(public navCtrl: NavController, public modalCtrl: ModalController,public http:HttpClient,public popoverCtrl: PopoverController, public NativeService:NativeService, public alertCtrl: AlertController) {
  }
  ionViewDidEnter(){
    //初始化查询日程信息
    let date = new Date();
    if(!!this.chooseData){
      date = new Date(this.chooseData.time);
    }
    this.queryDateCalendar(date);
  }
  //选择日程类型
  choose(){
    let popover = this.popoverCtrl.create(PopoverPage);
    popover.present();
  }
  add(){
    if(!!this.chooseData){
      this.navCtrl.push(NewSchedulePage,{'entry':{},chooseData:this.chooseData})
    }else{
      this.navCtrl.push(NewSchedulePage,{'entry':{},chooseData:{time:new Date().getTime()}})
    }
    
  }
  onSelect($event) {
    this.chooseData=$event;
    let date = new Date(this.chooseData.time);
    this.queryDateCalendar(date);
  }
  monthChange($event) {
  }

   //查询天对应的日程
   queryDateCalendar(date) {
    this.http.post(ENV.httpurl+ "/api/cal/queryMyAppCalendarListForDate", {
        date: date
    }).subscribe(
        (data) => {
            this.myResultDate = data;
        },
        () => {
        }
    );
}
  //时间显示形式，方法
  timeMethod(startDate, closeDate) {
    return this.NativeService.timeMethod(startDate, closeDate);
  }

  update(entry){
    this.navCtrl.push(NewSchedulePage,{'entry':entry,chooseData:!!this.chooseData ? this.chooseData:new Date().getTime()});
  }
  //删除日程
  removeItem(item){
    if(item){
      if(item.allowed === 'false'){
        this.NativeService.showAlert("系统日程，不能删除");
      }
      if(item.repetitionType !== 'NOREPEAT'){
        const confirm = this.alertCtrl.create({
          message: '该条日程重复，确认一并删除吗？',
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
      }else{
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

  deleteItem(item){
    this.http.post(ENV.httpurl + '/api/calendar/deleteCalendars',item).subscribe(data =>{
      if(!!this.chooseData){
        this.queryDateCalendar(this.chooseData);
      }else{
        let date = new Date();
        this.queryDateCalendar(date);
      }
    });
  }
}
