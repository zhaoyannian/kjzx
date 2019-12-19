import { Component } from "@angular/core";
import {
  IonicPage,
  NavController,
  NavParams,
  Events,
  App
} from "ionic-angular";
import { HttpClient } from "@angular/common/http";
import { ENV } from "@env/environment";
import { AlertController } from "ionic-angular/components/alert/alert-controller";
import { EditorViewPage } from "./editor/editorView";
import { MeetInfoViewPage } from "./meetView/meetView";

import { LoginPage } from "../../../pages/login/login";

import _ from "lodash";
import * as $ from "jquery";

@IonicPage()
@Component({
  selector: "page-meetings",
  templateUrl: "meetings.html"
})
export class MeetingsPage {
  today: any;
  nextMonthDaysNext: any;
  nextMonthDaysLast: any;
  isToday: any;
  meetingRoomList: any = [];
  meetingRoomListOne: any = [];
  meetingRoomListTwo: any = [];
  roomSelected: any;
  thisWeeks: any = [];
  calendarCount: any = [];
  definition: any = [];
  defTimeData: any = [];
  week: any;
  meetingTypes: any = [];
  now: any;
  counti: any = 0;
  color: any = [
    "",
    "bg-primary",
    "bg-info",
    "bg-success",
    "bg-warning",
    "bg-danger"
  ];
  constructor(
    public events: Events,
    public navCtrl: NavController,
    public navParams: NavParams,
    public http: HttpClient,
    public alertCtrl: AlertController,
    public appCtrl: App
  ) {
    let that = this;
    // $(function () {
    //   localStorage.setItem('counti','0')
    //   $(document).on('click', '.huiyi', function () {
    //     if (localStorage.getItem('counti') =='1') {
    //       return false;
    //     } else {
    //       localStorage.setItem('counti','1')
    //       event.stopPropagation();
    //       that.goPage($(this).attr('id'));
    //       return false;
    //     }
    //   });
    // });
    //当前时间
    this.now = new Date();
    var dateStr = sessionStorage.getItem("mettingdate");
    if (!dateStr) {
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
  }

  goPage(id) {
    // if (this.counti > 0)
    //   return;
    // else {
    //   this.counti++;
    let activeNav: NavController = this.appCtrl.getActiveNavs()[0];
    console.log(activeNav);
    activeNav.popToRoot().then(() => {
      activeNav.push(EditorViewPage, { busId: id });

      event.stopPropagation();
      return false;
    });
    // }
    // this.navCtrl.push(EditorViewPage, { 'busId': id });
  }

  ionViewDidEnter() {
    let that = this;
    $(function() {
      localStorage.setItem("counti", "0");
      $(document).on("click", ".huiyi", function() {
        if (localStorage.getItem("counti") == "1") {
          return false;
        } else {
          localStorage.setItem("counti", "1");
          event.stopPropagation();
          that.goPage($(this).attr("id"));
          return false;
        }
      });
    });
    // this.counti = 0;
    //查询全部会议信息
    this.http
      .get(ENV.httpurl + "/api/meetingApi/queryMrInfoList/1")
      .subscribe(data => {
        this.meetingRoomList = data;
        this.meetingRoomListOne = _.filter(
          this.meetingRoomList,
          n => n.affiliatedPark === "中关村园区"
        );
        this.meetingRoomListTwo = _.filter(
          this.meetingRoomList,
          n => n.affiliatedPark === "怀柔园区"
        );
        //初始化数据
        this.assemblyData();
        this.initData();
        this.events.publish("tabs:slide0", "slide0");
      });
  }
  //恢复到今天，对应今的图标
  initToday() {
    sessionStorage.setItem("mettingdate", this.now);
    this.initData();
  }
  //水牌信息
  getShuiPai() {
    let obj = {
      meetingDate: this.today,
      status: "2"
    };
    this.navCtrl.push("ShuiPaiPage", { entity: obj });
  }
  //我的申请
  myApplay() {
    this.navCtrl.push("MyReplymeetingPage");
  }

  createMeetingFn() {
    this.navCtrl.push("MeetngseditPage", { chooseData: this.today });
  }

  //初始化数据，在init()中，包括初始化月、星期、今天的数据
  initData() {
    //初始化，上一个月，下一个月的时间
    var dateStr = sessionStorage.getItem("mettingdate");
    if (!dateStr) {
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
    //默认当天占用情况
    this.initMrReserve(this.today);
    this.isToday = this.now;
  }
  getShow() {
    return this.today.getFullYear() +
      "-" +
      this.today.getMonth() +
      "-" +
      this.today.getDate() !==
      new Date().getFullYear() +
        "-" +
        new Date().getMonth() +
        "-" +
        new Date().getDate()
      ? true
      : false;
  }
  /**
   * 渲染会议信息块
   * @param y y轴,会议室下标
   */
  // draw(y) {
  //   if (this.meetingRoomList.length > 0) {
  //     let el: any = document.getElementById("draw").getElementsByTagName("tr")[
  //       y
  //     ];
  //     //获取Y轴节点
  //     const genRandom = (min, max) =>
  //       ((Math.random() * (max - min + 1)) | 0) + min;

  //     for (let i = 0; i < this.meetingRoomList[y]["miList"].length; i++) {
  //       // let num = genRandom(1, 6);
  //       let data = this.meetingRoomList[y]["miList"][i];
  //       let photo = "assets/imgs/people-head.png";
  //       if (!!data.photo) {
  //         // photo = ENV.httpurl + '/base/fileinfo/getFileImage?id=' + data.photo;
  //         photo = ENV.httpurl + "/api/fileinfo/downloadFile/" + data.photo;
  //       }
  //       let x1 = this.findIndex(data.bitem); //X轴起点
  //       let x2 = this.findEndIndex(data.eitem); //X轴终点
  //       let cha = x2 - x1 == 0 ? 1 : x2 - x1 + 1;
  //       let width = 50 * cha;
  //       if (x1 >= 0) {
  //         el.children[x1].innerHTML = `
  //         <div class="huiyi col3 w${width}" style="width:${width}px" id="${
  //           data.id
  //         }">
  //           <div><img src="${photo}" alt=""></div>
  //           <div>
  //             <p>${data.createUserName} <span>${data.bitem.substring(
  //           0,
  //           5
  //         )}-${data.eitem.substring(0, 5)}</span></p>
  //             <p>${data.meetingName}</p>
  //           </div>
  //         </div>`;
  //       }
  //     }
  //   }
  // }

  drawOne(y) {
    let n = parseInt(y) + 1;
    if (this.meetingRoomListOne.length > 0) {
      let el: any = document.getElementById("draw").getElementsByTagName("tr")[
        n
      ];
      //获取Y轴节点
      const genRandom = (min, max) =>
        ((Math.random() * (max - min + 1)) | 0) + min;

      for (let i = 0; i < this.meetingRoomListOne[y]["miList"].length; i++) {
        // let num = genRandom(1, 6);
        let data = this.meetingRoomListOne[y]["miList"][i];
        let photo = "assets/imgs/people-head.png";
        if (!!data.photo) {
          // photo = ENV.httpurl + '/base/fileinfo/getFileImage?id=' + data.photo;
          photo = ENV.httpurl + "/api/fileinfo/downloadFile/" + data.photo;
        }
        let x1 = this.findIndex(data.bitem); //X轴起点
        let x2 = this.findEndIndex(data.eitem); //X轴终点
        let cha = x2 - x1 == 0 ? 1 : x2 - x1 + 1;
        let width = 50 * cha;
        if (x1 >= 0) {
          el.children[x1].innerHTML = `
          <div class="huiyi col3 w${width}" style="width:${width}px" id="${
            data.id
          }">
            <div><img src="${photo}" alt=""></div>
            <div>
              <p>${data.createUserName} <span>${data.bitem.substring(
            0,
            5
          )}-${data.eitem.substring(0, 5)}</span></p>
              <p>${data.meetingName}</p>
            </div>
          </div>`;
        }
      }
    }
  }
  drawTwo(y) {
    let n = parseInt(y) + 1;
    if (this.meetingRoomListTwo.length > 0) {
      let el: any = document
        .getElementById("drawTwo")
        .getElementsByTagName("tr")[n];
      //获取Y轴节点
      const genRandom = (min, max) =>
        ((Math.random() * (max - min + 1)) | 0) + min;

      for (let i = 0; i < this.meetingRoomListTwo[y]["miList"].length; i++) {
        // let num = genRandom(1, 6);
        let data = this.meetingRoomListTwo[y]["miList"][i];
        let photo = "assets/imgs/people-head.png";
        if (!!data.photo) {
          // photo = ENV.httpurl + '/base/fileinfo/getFileImage?id=' + data.photo;
          photo = ENV.httpurl + "/api/fileinfo/downloadFile/" + data.photo;
        }
        let x1 = this.findIndex(data.bitem); //X轴起点
        let x2 = this.findEndIndex(data.eitem); //X轴终点
        let cha = x2 - x1 == 0 ? 1 : x2 - x1 + 1;
        let width = 50 * cha;
        if (x1 >= 0) {
          el.children[x1].innerHTML = `
          <div class="huiyi col3 w${width}" style="width:${width}px" id="${
            data.id
          }">
            <div><img src="${photo}" alt=""></div>
            <div>
              <p>${data.createUserName} <span>${data.bitem.substring(
            0,
            5
          )}-${data.eitem.substring(0, 5)}</span></p>
              <p>${data.meetingName}</p>
            </div>
          </div>`;
        }
      }
    }
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

  /**
   * 清空table上的会议信息
   */
  emptyTable() {
    // if (this.meetingRoomList.length > 0 && !!document.getElementById("draw")) {
    //   let tr = document.getElementById("draw").getElementsByTagName("tr");
    //   if (tr.length > 0) {
    //     // for(let i=0;i<tr.length;i++) {
    //     //   let td = tr[i].getElementsByTagName('td');
    //     //   for(let j=0;j<td.length;j++) {
    //     //     td[j].innerHTML = '';
    //     //   }
    //     // }
    //     $("#draw tr td").html("");
    //   } else {
    //   }
    // }
    if (this.meetingRoomList.length > 0) {
      if (!!document.getElementById("draw")) {
        let tr = document.getElementById("draw").getElementsByTagName("tr");
        if (tr.length > 0) {
          $("#draw tr td").html("");
        } else {
        }
      }
      if (!!document.getElementById("drawTwo")) {
        let tr = document.getElementById("drawTwo").getElementsByTagName("tr");
        if (tr.length > 0) {
          $("#drawTwo tr td").html("");
        } else {
        }
      }
    }
  }
  //初始化会议室占用
  initMrReserve(today) {
    this.emptyTable();
    if (this.meetingRoomList.length > 0) {
      this.roomSelected = this.meetingRoomList;
      for (let v in this.meetingRoomListOne) {
        let year = today.getFullYear();
        let month = today.getMonth() + 1;
        let monthStr = month > 9 ? month + "" : "0" + month;
        let day = today.getDate();
        let dayStr = day > 9 ? day + "" : "0" + day;
        let dateStr = year + "-" + monthStr + "-" + dayStr;
        // queryMeetInfoByMrId 新接口
        this.http
          .get(
            ENV.httpurl +
              "/api/meetingApi/queryMeetInfoByMrId" +
              "/" +
              this.meetingRoomListOne[v].id +
              "/" +
              dateStr +
              "/3"
          )
          .subscribe(data => {
            for (let d in data) {
              data[d].bitem = data[d].beginTime;
              data[d].eitem = data[d].endTime;
              data[d].status = parseInt(data[d].meetingStatus) + 1;
            }
            this.meetingRoomListOne[v].miList = data;
            if (JSON.stringify(data) != "[]") {
              this.drawOne(v);
            }
          });
      }
      for (let v in this.meetingRoomListTwo) {
        let year = today.getFullYear();
        let month = today.getMonth() + 1;
        let monthStr = month > 9 ? month + "" : "0" + month;
        let day = today.getDate();
        let dayStr = day > 9 ? day + "" : "0" + day;
        let dateStr = year + "-" + monthStr + "-" + dayStr;
        // queryMeetInfoByMrId 新接口
        this.http
          .get(
            ENV.httpurl +
              "/api/meetingApi/queryMeetInfoByMrId" +
              "/" +
              this.meetingRoomListTwo[v].id +
              "/" +
              dateStr +
              "/3"
          )
          .subscribe(data => {
            for (let d in data) {
              data[d].bitem = data[d].beginTime;
              data[d].eitem = data[d].endTime;
              data[d].status = parseInt(data[d].meetingStatus) + 1;
            }
            this.meetingRoomListTwo[v].miList = data;
            if (JSON.stringify(data) != "[]") {
              this.drawTwo(v);
            }
          });
      }
    } else {
      this.alertCtrl
        .create({
          title: " 提示",
          subTitle: "请联系管理员，添加启用的会议室",
          buttons: ["确定"]
        })
        .present();
    }
  }

  //显示日期
  haveCalendar(weeks) {
    if (weeks.length > 0) {
      let entry = {
        dates: weeks
      };
      this.http
        .post(ENV.httpurl + "/api/meetingApi/queryMeetinfoCount", entry)
        .subscribe(
          data => {
            this.calendarCount = data;
            this.thisWeeks = [];
            for (let v in data) {
              let obj = {
                week: "",
                count: ""
              };
              obj.week = weeks[v];
              obj.count = data[v];
              this.thisWeeks.push(obj);
            }
          },
          () => {
            // this.alertCtrl.create({
            //   title: ' 提示',
            //   subTitle: '后端异常，请联系管理员',
            //   buttons: ['确定']
            // }).present();
            localStorage.setItem("token", "1"); // 会议室异常，跳到登录页
            let activeNav: NavController = this.appCtrl.getActiveNav();
            activeNav.push(LoginPage);
          }
        );
    } else {
    }
  }

  /**
   * 根据会议室id查询会议记录
   * @param  {[type]} mrId [description]
   * @return {[type]}      [description]
   */
  queryMeetingInfo(roomId, meetingDate) {
    let year = meetingDate.getFullYear();
    let month = meetingDate.getMonth() + 1;
    let monthStr = month > 9 ? month + "" : "0" + month;
    let day = meetingDate.getDate();
    let dayStr = day > 9 ? day + "" : "0" + day;
    let dateStr = year + "-" + monthStr + "-" + dayStr;
    return this.http
      .get(
        ENV.httpurl +
          "/api/meetingApi/queryMeetingInfoByMrId" +
          "/" +
          roomId +
          "/" +
          dateStr +
          "/3"
      )
      .subscribe(data => data);
  }

  /**
   * 组装时间段
   * @return {[type]} [description]
   */
  assemblyData() {
    let mintime = 8;
    let maxtime = 23;
    let interval = 30;
    // TODO 缺少判断 mintime、maxtime是否合法，interval是否为指定规则
    let checkTime = mintime > maxtime ? false : true;
    if (checkTime) {
      // 把最大时间和最小时间转换成分钟数相减除以间隔得到间隔时间段。
      let _part = (maxtime - mintime) * (60 / interval); // 46
      let _parts = []; // 储存拼接后的时间段数组
      let intervalNumber = 60 / (60 / interval);
      let total = 0;
      for (var i = 0; i < _part + 1; i++) {
        // 循环所有时间段并且拼接字符串
        let hour = total > 59 ? (mintime += 1) : mintime;
        // let timeEntry = {};
        total = total > 59 ? 0 : total;
        _parts.push(hour + ":" + (total === 0 ? "00" : total));
        total += intervalNumber;
      }
      this.definition = _parts;
      let timeEntities = [];
      for (var j = 0; j <= _parts.length - 2; j++) {
        timeEntities[j] = {};
        timeEntities[j].bitem = _parts[j];
        timeEntities[j].eitem = _parts[j + 1];
      }
      this.defTimeData = timeEntities;
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

  //查询天对应的会议信息
  queryDateMrReserve(date) {
    this.today = date;
    let year = this.today.getFullYear();
    let month = this.today.getMonth();
    this.nextMonthDaysNext = new Date(year, month + 1, 0).getDate();
    this.nextMonthDaysLast = new Date(year, month, 0).getDate();
    this.initWeek(this.today);
    this.initMrReserve(this.today);
    sessionStorage.setItem("mettingdate", date);
  }

  // 确定阴影层的色块.(临时解决方案.待优化2016-11-16)
  viewFindColorRange(viewData, defIdx) {
    var checkIdx = e => {
      let bIdx = this.findIndex(e.bitem);
      let eIdx = this.findEndIndex(e.eitem);
      return eIdx >= defIdx && eIdx >= bIdx && defIdx >= bIdx ? true : false;
    };
    if (Array.isArray(viewData)) {
      if (viewData.length > 0) {
        let checkbe = _.map(viewData, e =>
          checkIdx(e) ? Number(e.status) : 0
        );
        return _.find(checkbe, be => be !== 0) === undefined
          ? 0
          : _.find(checkbe, be => be !== 0);
      }
      return 0;
    }
  }

  // 确定viewData的范围
  viewFindRange(viewData, defIdx) {
    // 内部函数确定是否在此方格添加覆盖层.
    var checkIdx = e => {
      let bIdx = this.findIndex(e.bitem);
      let eIdx = this.findEndIndex(e.eitem);
      return eIdx >= defIdx && eIdx >= bIdx && defIdx >= bIdx ? true : false;
    };
    // 回显数据(外部)处理覆盖层.
    if (Array.isArray(viewData)) {
      if (viewData.length > 0) {
        // 遍历viewData查找是否有匹配的下标.
        let checkbe = _.map(viewData, e => checkIdx(e));
        return _.find(checkbe, be => be === true) ? true : false;
      }
      return false;
    }
    // // 选择数据覆盖层处理.  angular.isObject(viewData)
    if (viewData instanceof Object) {
      return checkIdx(viewData);
    }
  }
  // 查找bitem在_definition中的下标
  findIndex(item) {
    let a = !!item
      ? _.findIndex(
          this.defTimeData,
          def =>
            def["bitem"] === item ||
            "0" + def["bitem"] === item ||
            (parseInt(item.replace(":", "")) -
              parseInt(def["bitem"].replace(":", "")) <
              30 &&
              parseInt(item.replace(":", "")) -
                parseInt(def["bitem"].replace(":", "")) >
                0)
        )
      : -1;
    return a;
  }

  // 查找ebitem在_definition中的下标
  findEndIndex(item) {
    return !!item
      ? _.findIndex(
          this.defTimeData,
          def =>
            def["eitem"] === item ||
            "0" + def["eitem"] === item ||
            (parseInt(def["eitem"].replace(":", "")) -
              parseInt(item.replace(":", "")) <
              70 &&
              parseInt(def["eitem"].replace(":", "")) -
                parseInt(item.replace(":", "")) >
                0)
        )
      : -1;
  }

  queryMeetingType(entry) {
    this.http
      .post(ENV.httpurl + "/api/meetingType/queryAllByDict" + "/1", {})
      .subscribe(data => {
        this.meetingTypes = data;
        if (this.meetingTypes.length < 1) {
          this.alertCtrl
            .create({
              title: " 提示",
              subTitle:
                "还没有启用状态的会议类型，请联系管理员，添加启用的会议类型",
              buttons: ["确定"]
            })
            .present();
        } else {
          for (let v in this.meetingTypes) {
            if (data[v].id == entry.meetingType) {
              entry.meetingTypeName = data[v].typeName;
            }
          }
        }
      });
  }

  //设置样式显示
  checkClassType(cur, now) {
    let curN = new Date(cur);
    let nowN = new Date(now);
    return curN.getTime() >= nowN.getTime() ? true : false;
  }

  //点击查看详情页面
  viewDetail($current, mrList) {
    let biStrList = $current.bitem.split(":");
    let eiStrList = $current.eitem.split(":");
    let begin = parseInt(biStrList[0] + "" + biStrList[1]);
    let end = parseInt(eiStrList[0] + "" + eiStrList[1]);
    let selectMr;
    if (mrList && mrList.length > 0) {
      _.map(mrList, e => {
        let mrBegin = parseInt(e.beginTimeStr);
        let mrEnd = parseInt(e.endTimeStr);
        if (mrBegin - begin < 30 && end <= mrEnd) {
          selectMr = e;
          this.queryMeetingType(selectMr);
        }
      });
      if (selectMr) {
        // this.navCtrl.push(EditorViewPage, { selectMr: selectMr });
        this.navCtrl.push(EditorViewPage, { busId: selectMr.id });
      }
    }
  }

  //会议室详情查看
  goMeetView(room) {
    this.navCtrl.push(MeetInfoViewPage, { entry: room });
  }

  //区分园区
  getData(dataList, type) {
    if (type === "怀柔园区") {
      return _.filter(dataList, n => n.affiliatedPark === type);
    } else {
      return _.filter(dataList, n => n.affiliatedPark === type);
    }
  }
}
