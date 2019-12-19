import { Component } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';
import { HttpClient } from '@angular/common/http'
import { ENV } from '@env/environment';
import { NativeService } from '../../../../icommon/provider/native';
import { SchedulePage } from '../newSchedule/newSchedule';
import { EditorViewPage } from '../../../imeeting/meetings/editor/editorView';

@Component({
    selector: 'page-moreList',
    templateUrl: 'moreList.html'
})
export class MoreListPage{
    myResultDate:any=[];
    title:any ;
    state:any = ENV.httpurl;
    showStatus:any = true;
    constructor(public navCtrl: NavController, public http: HttpClient, public NativeService: NativeService, public navParams: NavParams) {
        this.myResultDate = this.navParams.get("myResultDate");
        this.title = this.myResultDate[0].calTypeText;
    }
    goback(){
        this.navCtrl.pop();
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
            this.navCtrl.push(SchedulePage, { 'entry': entry, chooseData: new Date() ,editable:true, title: '查询'});            
        }
    }
    //时间显示形式，方法
    timeMethod(startDate, closeDate) {
        return this.NativeService.timeMethod(startDate, closeDate);
    }
}