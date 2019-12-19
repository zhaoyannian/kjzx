import { Component ,ViewChild} from '@angular/core';
import { IonicPage, NavController, NavParams,AlertController,ModalController } from 'ionic-angular';
import { globalData } from '../../../../icommon/provider/globalData';
import { HttpClient } from '@angular/common/http';
import { ENV } from '@env/environment';
import { weekList } from '../../../../icommon/provider/utils';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { saveEntityUri2,queryListFileUri,queryControlDaysUri,uploadFileUri,queryYearDaysByUserIdUri,queryFlowByTypeUri} from '../../../../icommon/provider/Constants'
import { NativeService } from '../../../../icommon/provider/native';
import {CalendarModal,CalendarModalOptions,} from 'ion2-calendar'
import { Observable } from 'rxjs/Rx';
import _ from 'lodash';
import { Keyboard } from '@ionic-native/keyboard';
@IonicPage()
@Component({
  selector: 'page-vacation-draft',
  templateUrl: 'vacation-draft.html',
})
export class VacationDraftPage {
  userinfor:any;
  editable:any;
  defaultValue:any;
  weekab:any;
  weekab2:any;
  myForm: FormGroup;
  editingEntry:any={};
  isYearsDay:boolean = true ;//判断是否可休年假参数
  startTypeDict:any;
  controlDays:any;
  vacationList:any;
  demoFile:any;
  @ViewChild('uploadImg') uploadImg: any;
  wfAlias:any;
  wfHolderObj:any;
  btns:any;
  isTodo:any;
  date: Date = new Date();
  typeName:any;
  fileList:any = [];
  httpurl:any = ENV.httpurl;
  startHour:boolean = true;
  endHour:boolean = true;
  datamore:any={}
  ismobile:boolean = false;
  collspaed2:boolean = false;//更多详情收展
  constructor(private keyboard: Keyboard,public modalCtrl: ModalController,public NativeService:NativeService,private alerCtrl: AlertController,public fb: FormBuilder,public http:HttpClient,public globalData :globalData,public navCtrl: NavController, public navParams: NavParams) {
    this.userinfor= JSON.parse(localStorage.getItem("objectList"));
    localStorage.setItem("file",'111');
    this.editable = this.navParams.get("opeType") === 'view' ? false : true;
    this.defaultValue =new Date((new Date().getTime() - new Date().getTimezoneOffset() * 60 * 1000)).toISOString();
    this.weekab = '';
    this.weekab2 = '';
    if(this.NativeService.isAndroid()){
        this.ismobile= true;
      }
    this.myForm = this.fb.group({
      opinion: ['',[Validators.required]],
    });
    if (this.navParams.get("opeType") === 'cre') { // 创建
      Object.assign(this.editingEntry, {
        userId: this.userinfor.loginInfo.userId, // 创建人ID
        userName: this.userinfor.loginInfo.userName, //创建人名字
        deptId: this.userinfor.deptTo.deptId, //创建人部门ID
        deptName: this.userinfor.deptTo.deptName, //创建人部门名
        orgId: this.userinfor.staff.corpOrgId, //机构ID
        orgName: this.userinfor.deptTo.deptName, // 机构名称
        corpOrgId: this.userinfor.staff.corpOrgId, // 法人机构ID
        corpOrgName: this.userinfor.deptTo.deptName, // 法人机构名称
        procedureStatus: 'draft',
        leaveDays:'',
        outAddress:'',
        jjlxrName:'',
        jjlxrPhone:'',
        // leaveStart:new Date().getTime(),
        // leaveEnd:new Date().getTime(),
        leaveStart:'',
        leaveEnd:'',
        leaveReason:'',
        startHour: this.startHour == true ? this.editingEntry.startHour = "A" :this.editingEntry.startHour ="P",
        endHour:this.endHour == true ? this.editingEntry.endHour = "A" :this.editingEntry.endHour ="P"
    });
    }else{
      this.editingEntry= this.navParams.get("entry");
      if( !!this.editingEntry.leaveStart){
        this.weekab = weekList[new Date(this.editingEntry.leaveStart).getDay()];
      }
      if (!!this.editingEntry.leaveEnd) {
        this.weekab2 = weekList[new Date(this.editingEntry.leaveStart).getDay()];
      }
      if (!!this.editingEntry.files) {
        this.queryListFile(this.editingEntry.files);
      }
    //   下午是false；上午是true
        this.editingEntry.startHour =="A" ? this.startHour = true :  this.startHour = false;
        this.editingEntry.endHour =="A" ? this.endHour = true :   this.endHour = true;
    }
    this.typeName = !!this.editingEntry.leaveType && this.editingEntry.leaveType !== 'QITA' ? this.editingEntry.leaveType : 'QITAJIA';
    let daysFlow = ""; //定义初始化流程别名
    if ( !!this.editingEntry.leaveType && (this.editingEntry.leaveType === 'SHIJIA' || this.editingEntry.leaveType === 'BINGJIA')) {
        if (this.editingEntry.leaveDays < 4 || !this.editingEntry.leaveDays) { //请假3天内
            daysFlow = "INTHREE";
        } else if (3 < this.editingEntry.leaveDays && this.editingEntry.leaveDays < 16) { //请假3~15天
            daysFlow = "INFIFTEEN";
        } else if (15 < this.editingEntry.leaveDays) {
            daysFlow = "OUTFIFTEEN";
        }
    }
    this.getWfHolder(this.typeName, daysFlow);
  }
  blurInput(){
    let that = this;
    that.datamore.btnscroll = true;
    this.keyboard.onKeyboardShow().subscribe(data =>{
        if(that.NativeService.isAndroid()){
        //   that.datamore.btnscroll = true;
          that.datamore.btnscollHeight = data.keyboardHeight;
        }
      })
        if(that.datamore.btnscollHeight>0){
        }else{
            that.datamore.btnscollHeight = 267
        }
    }
  ionViewDidEnter() {
    // this.getDiction() 
    this.queryApplyRule() 
    this.vacationTypes()
    let that = this;
        that.keyboard.onKeyboardWillHide().subscribe(data =>{
        console.log(data)
        if(that.NativeService.isAndroid()){
            that.datamore.btnscroll = false;
            that.datamore.btnscollHeight = 0;
        }
    })
  } 
  // 获取请假类型
  vacationTypes(){
    this.http.get(ENV.httpurl+'/api/dictOption/queryDictOptionFindByDictCode/DFKY_LEAVE_TYPE').subscribe(data =>{
      this.vacationList =data;
    })
  }
  
   //获取数据字典
  getDiction(){
    this.http.get(ENV.httpurl+'/api/dictOption/queryDictOptionFindByDictCode/DFKY_TIME_TYPE').subscribe(data =>{
      this.startTypeDict = data;
      if(this.startHour == true){
        this.editingEntry.startHour =  _.find(this.startTypeDict, function (o) {
            return o.optionValue == "A"
        });
        }else{
            this.editingEntry.startHour =  _.find(this.startTypeDict, function (o) {
                return o.optionValue == "P"
            });
        }
        if(this.endHour == true){
            this.editingEntry.endHour =  _.find(this.startTypeDict, function (o) {
                return o.optionValue == "A"
            });
        }else{
            this.editingEntry.endHour =  _.find(this.startTypeDict, function (o) {
                return o.optionValue == "P"
            });
        }
      console.log(this.startTypeDict);
    })
  }
  savestartHour(){
    console.log(this.startHour)
     //   下午是false；上午是true
     let that = this;
     this.startHour == true ? this.editingEntry.startHour = "A" :this.editingEntry.startHour ="P";
     that.setDays();
  }
  saveendHour(){
    console.log(this.endHour)
      //   下午是false；上午是true
      let that = this;
      this.endHour == true ? this.editingEntry.endHour = "A" :this.editingEntry.endHour ="P";
      that.setDays();
    }
   //查询允许请假规则
   queryApplyRule() {
    this.http.post(ENV.httpurl+queryControlDaysUri,{}).subscribe(data =>{
      this.controlDays = data;
    })
  }
   //查询所有附件
  queryListFile(file){
    this.http.get(ENV.httpurl+queryListFileUri +'/'+file).subscribe(data =>{
      this.fileList = data;
      console.log(this.fileList)
    })
  }
     // 获取wfHolder
     getWfHolder(typeName, param) {
        this.getWfAlias(typeName, param).then(wfAlias => {
          return this.globalData.getHolderFromWfAliasRef(wfAlias,this.navParams.get("ref"),null).subscribe(async data =>{
            return new Promise((resolve,reject) => {
              if(data){
                resolve(data)
              }
            }).then(data =>{
              this.wfHolderObj =this.globalData.compOtherInfo(data); 
              this.globalData.setProc(this.wfHolderObj.btns())
              return this.wfHolderObj;
            })
          })
      })
    }
    // 根据业务情况获取流程别名
    getWfAlias(typeName, param) {
      var data = {
          typeName: typeName,
          daysType: param
      };
      return this.queryFlow(data).then(result => {
          if (typeName === 'NIANJIA') {
              this.wfAlias = result['monthFolw'];
          } else if (typeName === "SHIJIA" || typeName == "BINGJIA") {
              this.wfAlias = result['daysFolw'];
          } else {
              this.wfAlias = !!result['qitaFolw'] ? result['qitaFolw'] : result['daysFolw'];
          }
          return this.wfAlias;
      });
  }
  //查询请假流程
  queryFlow(data) {
      return new Promise((resolve,reject) => {
        return this.http.post(ENV.httpurl + queryFlowByTypeUri,data).subscribe(resp => {
            resolve(resp);
            console.log(resp)
        }) // 出错，返回空对象);
    })
  }
   //请假时间选择判断
   setDays() {
    let start = this.editingEntry.leaveStart;
    let end = this.editingEntry.leaveEnd;
    let startHour = this.editingEntry.startHour;
    let endHour = this.editingEntry.endHour;
    if (!!start && !!end) {
        this.changeLaveType();
        // let startTime = start.getTime();
        // let endTime = end.getTime();
        let startTime = start;
        let endTime = end;
        if (startTime > endTime) {
            this.NativeService.showAlert('结束时间不能在开始时间之前！');
            this.editingEntry.leaveDays = 0;
        } else if (startTime === endTime) {
            if (startHour === endHour) {
                this.editingEntry.leaveDays = 0.5;
            } else if (startHour === 'A' && endHour === 'P') {
                this.editingEntry.leaveDays = 1;
            } else {
              this.NativeService.showAlert('时间选择错误，请重新选择！');
                this.editingEntry.leaveDays = 0;
            }
        } else {
            let days = (endTime - startTime) / (24 * 3600 * 1000);
            if (startHour === endHour) {
                this.editingEntry.leaveDays = (days + 0.5);
            } else if (startHour === 'A' && endHour === 'P') {
                this.editingEntry.leaveDays = (days + 1);
            } else {
                this.editingEntry.leaveDays = days;
            }
        }
    }
}
  //选择请假类型
  changeLaveType() {
    if (this.editingEntry.leaveType === 'NIANJIA') {
        this.yearDays();
    } else if (this.editingEntry.leaveType === 'SHIJIA' || this.editingEntry.leaveType === 'BINGJIA') {
        let daysFlow = ""; //定义初始化流程别名
        if (this.editingEntry.leaveDays < 4 || !this.editingEntry.leaveDays) { //请假3天内
            daysFlow = "INTHREE";
        } else if (3 < this.editingEntry.leaveDays && this.editingEntry.leaveDays < 16) { //请假3~15天
            daysFlow = "INFIFTEEN";
        } else if (15 < this.editingEntry.leaveDays) {
            daysFlow = "OUTFIFTEEN";
        }
        this.getWfHolder(this.editingEntry.leaveType, daysFlow);
    } else {
        this.getWfHolder('QITAJIA',null);
    }
  }
    //年假判断
    yearDays() {
      let that = this;
      let start = this.editingEntry.leaveStart;
      let nowMonth = new Date(start).getMonth() + 1;
      that.queryYearsDay().then((data) => {
          this.editingEntry.annualDays = data['annualDays'];
          this.editingEntry.usedDays = data['usedDays'];
          this.editingEntry.shengyuDays = data['shengyuDays'];
          if (nowMonth === 12) {
              this.isYearsDay = false;
              this.NativeService.showAlert('12月份禁止休年假！');
              return;
          }
          this.getWfHolder(this.editingEntry.leaveType,null);
      });
  }
  //查询年假天数
  queryYearsDay() {
      return new Promise((resolve,reject) => {
        return this.http.post(ENV.httpurl + queryYearDaysByUserIdUri,{}).subscribe(resp => {
            resolve(resp);
            console.log(resp)
        },error =>{
            reject();
        }) // 出错，返回空对象);
    })
  }

   //判断请假规则
   leaveRule() {
    let now = new Date().getTime();
    let start = this.editingEntry.leaveStart;
    let end = this.editingEntry.leaveEnd;
    // let startTime = start.getTime();
    // let endTime = end.getTime();
     let startTime = start;
    let endTime = end;
    if (startTime > endTime) {
        this.NativeService.showAlert('结束时间不能在开始时间之前！');
        this.editingEntry.leaveDays = 0;
        return false;
    } else {
        if (!!this.controlDays.afterDays || this.controlDays.beforDays) {
            if (now > startTime) { //补假
                let days = (now - startTime) / (24 * 3600 * 1000);
                if (days > this.controlDays.afterDays) {
                    this.NativeService.showAlert('超过允许补假时间，无法补填申请');
                    return false ;
                }else{
                  return true;
                }
            }else if (now < startTime) { //提前申请
                let days = (startTime - now) / (24 * 3600 * 1000);
                if (days > this.controlDays.beforDays) {
                    this.NativeService.showAlert('超过允许提前申请请假时间，无法提交申请');
                    return false;
                }else{
                  return true;
                }
            }
        }
    }
}
openCalendar(dateType) {
  if(this.editable){
    const options: CalendarModalOptions = {
      title: '选择日期',
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
        switch(dateType){
          case "leaveStart":
          this.editingEntry.leaveStart= date.time;
          this.setDays()
          break;
          case "leaveEnd":
          this.editingEntry.leaveEnd= date.time;
          this.setDays()
          break;
        }
       
      }
    })
  }
}
//流程操作
    manage(btn, opinion) {
        if(this.isEmpty()){
            btn.proc(this.myForm.value.opinion, () => this.sureSub(), () => this.getWfData(), () => this.lastDo(), () => this.beforeSelectRes(), (selected) => this.afterSelectRes(selected), () => this.getNextPoint());
        }  
    }
  //保存业务表数据
   sureSub(): Observable<any> {
    return Observable.create(observer => {
        var self = this;
        
        let leaverule = self.leaveRule();
        if (self.isYearsDay && leaverule) {
          return self.http.post( ENV.httpurl+ saveEntityUri2, self.editingEntry).subscribe(resp => {
            self.editingEntry.id = resp['id']; // 将id重置回去，为了wfData获取数据
            observer.next(resp['businessKey']);// 在流程提交组件里获取
          },error =>{
              observer.error(error);
          });
        }
    });
  }
  // 暂存（有流程）/保存（无流程）
  saveAndReturn() {
    if(this.isEmpty()){
        this.sureSub().subscribe(data =>{
            this.NativeService.showToast("操作成功").then(()=>{
                setTimeout(() => {
                  this.navCtrl.pop()
                },800)
              })
          },error =>{
          })
    }
  }
  isEmpty(){
    if(!this.editingEntry.leaveType){
        this.NativeService.showAlert('请选择请假类型！');
        return; 
    }
    if(!this.editingEntry.leaveStart){
        this.NativeService.showAlert('请选择开始日期！');
        return; 
    }
    if(!this.editingEntry.leaveEnd){
        this.NativeService.showAlert('请选择结束日期！');
        return; 
    }
    if(!this.editingEntry.leaveReason){
        this.NativeService.showAlert('请填写请假内容！');
        return; 
    }
    this.editingEntry.files = !!this.fileList && this.fileList.length > 0 ? _.map(this.fileList, 'id').join(',') : null;
    if (this.editingEntry.leaveType === 'BINGJIA' && parseInt(this.editingEntry.leaveDays) > 2) {
        if (!this.editingEntry.files) {
            this.NativeService.showAlert('请上传附件！');
            return;
        }
    }
    if (this.editingEntry.leaveType === 'NIANJIA' && parseInt(this.editingEntry.leaveDays) > parseInt(this.editingEntry.shengyuDays)) {
      this.NativeService.showAlert('年假天数不足！');
      return;
    }
    return true;
  }
  // 选人之前处理，没有什么处理时，可以不写返回值
  beforeSelectRes() {
    
    return {}
  }
  // 选人之后处理
  afterSelectRes(selected) {
      console.debug('选择的人....', selected);
  }
  // 获取下一环节，默认提交给下一环节，可以不写返回值
  getNextPoint() {

  }
  
  // 提交流程后的操作
  lastDo() {
    this.NativeService.showToast("操作成功").then(()=>{
        setTimeout(() => {
          this.navCtrl.pop()
        },800)
      })
    // this.navCtrl.pop();  // 流程提交后 返回的页面
  }   
  // 获取保存到流程实例workflowInstData字段中的数据，建议保存关联键（主键id）
  getWfData() {
    return {
        bizId: this.editingEntry.id
    };
  }

  onChangeleaveStart(ev: any){
    this.weekab = weekList[new Date(this.editingEntry.leaveStart).getDay()];
  }
  onChangeleaveEnd(ev: any) {
    this.weekab2 = weekList[new Date(this.editingEntry.leaveEnd).getDay()];
  }
  
   // 上传文件
   uploadFile(ev) {
     console.log(ev)
    let formData = new FormData();
    formData.append('files', ev.target.files[0]);
    formData.append('filePath', 'file');
    
    this.http.post(ENV.httpurl + uploadFileUri, formData).subscribe(data => {
          this.uploadImg.nativeElement.value = ''
            console.log(data);
            if (!data['objBean']) {
                this.NativeService.showAlert('文件上传失败！');
            } else {
                this.fileList.push(data['objBean']);
            }
        },error =>{
          console.log(error)
        })
  }
  // 附件图标问题
  fileIcon(fileName) {
    let postfix = getFileExtName(fileName);
    //图片附件
    if ("|jpg|png|jpeg|bmp|gif|".indexOf(postfix) > 0) {
        return 'img';
        //word附件
    } else if ("|docx|doc|".indexOf(postfix) > 0) {
        return 'doc';
        //excel附件
    } else if ("|xlsx|xls|".indexOf(postfix) > 0) {
        return 'excel';
        //PDF附件
    } else if ("|pdf|".indexOf(postfix) > 0) {
        return 'pdf';
        //压缩包附件
    } else if ("|rar|zip|tar|gz|war|7z|".indexOf(postfix) > 0) {
        return 'zip';
        // ppt
    } else if ("|pptx|ppt|".indexOf(postfix) > 0) {
        return 'ppt';
        // txt
    } else if ("|txt|".indexOf(postfix) > 0) {
        return 'txt';
        // 其他附件
    } else {
        return 'file';
    }

    function getFileExtName(name) {
        try {
            return name.split('.').pop().toLowerCase();
        } catch (error) {
            return 'file';
        }
    }
  }
  /**
     * 删除附件
     */
    removeFile(entity,i) {
      this.alerCtrl.create({
        title: "确定删除吗？",
        message:"",
        buttons: [
          {
            text: '取消',
            handler: () => {
            }
          },
          {
            text: '确定',
            handler: () => {
                _.remove(this.fileList, (file) => {
                  return file['id'] == entity.id;
              });
            }
          }
        ]
      }).present();
    
  }
  goback(){
    this.navCtrl.pop();
  }

}
