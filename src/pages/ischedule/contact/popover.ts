import { NavController,ViewController } from 'ionic-angular';
import { Component } from '@angular/core';
import _ from 'lodash';
@Component({
    selector: 'page-popover',
    templateUrl: 'popover.html'
  })
export class PopoverPage{
    loginObj: any;
    roles:any =[];
    isDeptManager:any;
    isManager:any;
    isLeader:any;
    constructor(public navCtrl: NavController,public viewCtrl: ViewController) {
      
    }

    goCalendar(type) {
        this.viewCtrl.dismiss();
        switch(type){
          case 'my':
          break;
          case 'dept':
          break;
          case 'leader':
          break;
          case 'group':
          break;
          case 'colleague':
          break;
          case 'all':
          break;
        }
        
    }

    ngOnInit() {
      this.loginObj = JSON.parse(localStorage.getItem("objectList"));
      this.roles = this.loginObj['rolesTo'] ? _.map(this.loginObj['rolesTo'], 'roleType') : [];
      this.isDeptManager = _.includes(this.roles, 'deptroles') ? true : false;
      this.isManager = _.includes(this.roles, 'officeDirector') ? true : false;
      this.isLeader = _.includes(this.roles, 'scientist') || _.includes(this.roles, 'superAdmin') ? true : false;
    }
  }