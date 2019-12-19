import { Component } from '@angular/core';
import { MeetingsPage } from '../imeeting/meetings/meetings';
import { CalendarPage } from '../ischedule/calendar/calendar';
import { HomePage } from '../ihome/home/home';
import { MinePage } from  '../icontacts/mine/mine';
import { HttpClient } from '@angular/common/http'
// import { ENV } from '@env/environment';
import { Events } from 'ionic-angular';

@Component({
  selector: 'page-tabs',
  templateUrl: 'tabs.html'
})
export class TabsPage {
  wfDbCount:any;
  DbCount:any;
  tab1Root = HomePage;
  tab2Root = MeetingsPage;
  tab3Root = CalendarPage;
  tab4Root = MinePage;
  constructor(public http:HttpClient,public events: Events) {
    events.subscribe('tabs:num', (num, time) => {
      if(num>0){
        TabsPage.prototype.wfDbCount = num > 99 ? '99+' :num; 
      }else{
        TabsPage.prototype.wfDbCount = '';  
      }
      
    });
  }

  ionViewDidEnter(){
    // this.loadDbCountFn();
  }
  //获取待办数量
  // loadDbCountFn(){
  //   this.http.get(ENV.httpurl + "/api/wf/queryDbCount").subscribe(data=>{
  //     if(data==0){
  //       this.DbCount = 0;
  //     }else{
  //       this.DbCount = data;
  //     }
  //   })
  // }
}
