import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { HttpClient } from '@angular/common/http'
import { ENV } from '@env/environment';
import { AlertController } from 'ionic-angular/components/alert/alert-controller';
import _ from 'lodash';

@IonicPage()
@Component({
  selector: 'page-user-car',
  templateUrl: 'user-car.html',
})
export class UserCarPage {
  thisWeeks: any = [];
  today: any = new Date();
  now: any;
  nextMonthDaysNext: any;
  nextMonthDaysLast: any;
  isToday: any;
  week: any;
  calendarCount: any = [];
  carList: any = [];
  state: any = ENV.httpurl;
  //今日限行车牌号
  carNUm: any;
  weekDays: any = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];
  constructor(public navCtrl: NavController, public navParams: NavParams, public http: HttpClient, public alertCtrl: AlertController) {
    //当前时间
    this.now = new Date();
  }

  ionViewDidEnter() {
    //查询全部车辆信息
    this.http.post(ENV.httpurl + '/api/ReserveCar/queryVehicles', {}).subscribe(data => {
      this.carList = data;
      this.initData();
    });
  }

  ionViewDidLoad() {
    // this.initData();
  }

  //初始化数据，在init()中，包括初始化月、星期、今天的数据
  async initData() {
    //初始化，上一个月，下一个月的时间
    this.today = new Date();
    let year = this.today.getFullYear();
    let month = this.today.getMonth();
    this.nextMonthDaysNext = new Date(year, month + 1, 0).getDate();
    this.nextMonthDaysLast = new Date(year, month, 0).getDate();
    //本周时间，上一月下一月，同步更新星期数,上一周下一周，同步页更新星期数
    await this.initWeek(this.today);
    //默认当天占用情况
    await this.initMrReserve(this.today);
    this.isToday = this.today;
  } 
  //初始化周时间,同步获取当天是否有日程
  initWeek(selectDay) {
    var week = [];
    var whichWeek = selectDay.getDay();
    var time = selectDay.getTime();
    var sunTime = time - whichWeek * 24 * 60 * 60 * 1000;
    for (let x = 0; x < 7; x++) {
      let date = new Date(sunTime + x * 24 * 60 * 60 * 1000);
      // let da = date.getDate();
      week.push(date);
    }
    this.haveCalendar(week);
  }
  //初始化用车情况
  initMrReserve(today) {
    if (this.carList.length > 0) {
      for (let v in this.carList) {
        let year = today.getFullYear();
        let month = today.getMonth() + 1;
        let monthStr = month > 9 ? month + '' : '0' + month;
        let day = today.getDate();
        let dayStr = day > 9 ? day + '' : '0' + day;
        let dateStr = year + '-' + monthStr + '-' + dayStr;

        this.http.get(ENV.httpurl + "/api/ReserveCar/queryReserveCarByIdDate/" + this.carList[v].id + '/' + dateStr).subscribe(data => {
          _.map(data, (n) => {
            //整合人员头像
            this.http.get(ENV.httpurl + '/api/staff/getStaffInfoByUserid/' + n['userId']).subscribe(async data => {
              n['photoId'] = data['photo'];
            });
          });
          this.carList[v].list = data;
        });

        let date = new Date(today);
        let btime = date.getFullYear() + "-" + (date.getMonth() + 1) + "-" + date.getUTCDate();
        this.http.get(ENV.httpurl + '/api/ReserveCar/queryLimitByDate/' + btime).subscribe(data => {
          let num = this.weekDays[today.getDay()];
          this.carNUm = data[num];
          //整合车辆限行问题  --- todo
          if (!!this.carNUm) {
            if (_.includes(this.carNUm, this.carList[v].numberPlate.substring(this.carList[v].numberPlate.length - 1))) {
              this.carList[v].limit = '限行';
            }
          }
        });
      }
    }
  }
  //显示日期
  haveCalendar(weeks) {
    if (weeks.length > 0) {
      let entry = {
        dates: weeks
      };
      this.http.post(ENV.httpurl + "/api/ReserveCar/queryReserveCarCount", entry).subscribe(
        data => {
          this.calendarCount = data;
          this.thisWeeks = [];
          for (let v in data) {
            let obj = {
              week: '',
              count: ''
            };
            obj.week = weeks[v];
            obj.count = data[v];
            this.thisWeeks.push(obj);
          }
        },
        () => {
          this.alertCtrl.create({
            title: ' 提示',
            subTitle: '后端异常，请联系管理员。',
            buttons: ['确定']
          }).present();
        }
      );
    } else {

    }
  }
  //下一周时间判断
  moveWeek(selectDay, round) {
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
    //查询占用情况
    this.initMrReserve(lastWe);
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
      //同步下面的周时间
    }
  }

  //查询天对应的用车信息
  queryDateMrReserve(date) {
    this.today = date;
    let year = this.today.getFullYear();
    let month = this.today.getMonth();
    this.nextMonthDaysNext = new Date(year, month + 1, 0).getDate();
    this.nextMonthDaysLast = new Date(year, month, 0).getDate();
    this.initWeek(this.today);
    this.carNUm = '';
    this.initMrReserve(this.today);
  }
  //车辆信息
  goCarView(car) {
    this.navCtrl.push('CarInfoPage', { entry: car });
  }
  //新增用车申请
  createCarFn() {
    this.navCtrl.push('UserCarDraftPage', { entry: null, opeType: 'cre', ref: null });
  }
  //水牌信息 -- 当天用车情况
  getShuiPai() {
    let obj = {
      meetingDate: this.today,
      status: '2'
    };
    this.navCtrl.push('ShuiPaiCarPage', { entity: obj });
  }
  //用车详情
  goUseCarView(car) {
    this.navCtrl.push('UserCarViewPage', { 'id': car.id });
  }
  //设置样式显示
  checkClassType(cur, now) {
    let curN = new Date(cur);
    let nowN = new Date(now);
    return curN.getTime() >= nowN.getTime() ? true : false;
  }

  //恢复到今天，对应今的图标
  initToday() {
    sessionStorage.setItem("date", this.now);
    this.initData();
  }
  getShow() {
    return (this.today.getFullYear() + '-' + this.today.getMonth() + '-' + this.today.getDate()) !== (this.now.getFullYear() + '-' + this.now.getMonth() + '-' + this.now.getDate()) ? true : false;
  }
  goback(){
    this.navCtrl.pop();
  }
}
