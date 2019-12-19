import {Component } from '@angular/core';
import { NavController, NavParams} from 'ionic-angular';
import { HttpClient } from '@angular/common/http';
import { ENV } from '@env/environment';
import { NativeService } from '../../../../../icommon/provider/native';
import { SelectPersonPage } from '../../../../imeeting/meetings/editor/selectPerson';
import { DeletePersonPage } from '../../../../imeeting/meetings/editor/deletePerson';
import _ from 'lodash';

@Component({
    selector: 'page-createGroup',
    templateUrl: 'createGroup.html'
})
export class CreateGroupPage{
    obj:any={};
    objNew:any ={};
    groupStaff:any = [];
    state:any = ENV.httpurl;
    editable:any;
    title:any;
    loginObj:any;
    constructor(public navCtrl:NavController,public navParams: NavParams,public http:HttpClient,public NativeService: NativeService){
        this.objNew = this.navParams.get("obj");
        this.editable = this.navParams.get("type");
        this.title = this.navParams.get("title");
        this.loginObj = JSON.parse(localStorage.getItem("objectList"));
        this.obj = this.objNew;
        if(!!this.objNew.members){
            this.getMembers(this.objNew.members);
        }
    }
    goback(){
        this.navCtrl.pop();
    }
    getMembers(ids){
        this.http.post(ENV.httpurl+"/api/staff/queryStaffsInUserIds",ids).subscribe(data =>{
            this.groupStaff = data;
        });
    }
     //选择参会人员
     selectPerson() {
        this.navCtrl.push(SelectPersonPage, { 'callback': this.staffBackFunction, 'meetingStaff': this.groupStaff ,'defaultPerson':true,'choose':true});
    }
    //人员信息对应
    staffBackFunction = (params) => {
        return new Promise((resolve, reject) => {
            if (typeof (params) != 'undefined') {
                resolve('ok');
                if (!!params.dataList) {
                    this.groupStaff = params.dataList;
                }
            } else {
                reject(Error('error'))
            }
        });
    }
      /**
     * 删除参会人员
     * @param i 下标
     */
    deletePeer2(i) {
        console.log(this.groupStaff.splice(i, 1));
    }
     //删除参会人员
     deletePeer() {
        this.navCtrl.push(DeletePersonPage, { 'callback': this.deleteBackFunction, 'meetingStaff': this.groupStaff });
    }
    deleteBackFunction = (params) => {
        return new Promise((resolve, reject) => {
            if (typeof (params) != 'undefined') {
                resolve('ok');
                if (!!params.dataList) {
                    this.groupStaff = params.dataList;
                }
            } else {
                reject(Error('error'))
            }
        });
    }

    //保存或修改群组
    saveGroup = _.throttle(function () {
        if(this.obj.title === '' || this.obj.title === null|| this.obj.title === undefined){
            this.NativeService.showAlert("群组名称必填!");
            return;
          }
        if(this.groupStaff.length<=1){
            this.NativeService.showAlert("1人以上才能创建群组!");
            return;
        }
        let members = [];
        _.map(this.groupStaff,n =>{
            members.push(n.userId);
        });
        let a = _.find(members, (n) => n=== this.loginObj['loginInfo'].userId);
        if(!a){
            this.NativeService.showAlert("请选择管理员!");
            return;
        }
        this.NativeService.showLoading();
        this.obj.members = members;
        this.obj.memberStaffs = members.join(',');
        this.obj.id = !!this.objNew.id ?this.objNew.id :'';
        this.obj.groupId = !this.obj.groupId ? '' : this.objNew.groupId;
        
        this.http.post(ENV.httpurl+"/api/group/saveOrUpdateGroup",this.obj).subscribe(data =>{
            this.NativeService.hideLoading();
            this.NativeService.showToast("保存成功").then(()=>{
                setTimeout(() => {
                  this.navCtrl.pop()
                },800)
              })
        },error =>{
            this.NativeService.hideLoading();
        });
    },800)
}