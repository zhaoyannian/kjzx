import { Component } from '@angular/core';
import { NavController, NavParams, AlertController } from 'ionic-angular';
import { HttpClient } from '@angular/common/http';
import { ENV } from '@env/environment';
import { NativeService } from '../../../../../icommon/provider/native';
import { CreateGroupPage } from '../createGroup/createGroup';
@Component({
    selector: 'page-groupList',
    templateUrl: 'groupList.html'
})
export class GroupListPage {
    groupLists: any = [];
    boss: boolean;
    uri: any;
    constructor(public navCtrl: NavController, public navParams: NavParams, public http: HttpClient, public NativeService: NativeService, public alertCtrl: AlertController) {
        this.boss = this.navParams.get("boss");
        this.uri = !!this.boss ? '/api/group/queryMyGroups/GROUP' : '/api/group/queryUnBossGroups';

        this.groupList(this.uri);
    }
    //当进入页面时触发方法
    ionViewDidEnter() {
        this.groupList(this.uri);
    }
    goback(){
        this.navCtrl.pop();
    }
    groupList(uri) {
        this.NativeService.showLoading();
        this.http.get(ENV.httpurl + uri).subscribe(data => {
            this.groupLists = data;
            this.NativeService.hideLoading();
        });
    }
    //查询群组
    view(entry) {
        this.navCtrl.push(CreateGroupPage, { 'obj': entry, 'type': true, 'title': '查询' });
    }
    //修改群组
    update(entry) {
        this.navCtrl.push(CreateGroupPage, { 'obj': entry, 'type': false, 'title': '修改' });
    }
    //创建群组
    createRequest() {
        this.navCtrl.push(CreateGroupPage, { 'obj': {}, 'type': false, 'title': '创建' });
    }
    delete(id) {
        let ids = [];
        ids.push(id);
        const confirm = this.alertCtrl.create({
            message: '删除后，您将看不到该群组内其他成员的日程，确认删除？',
            buttons: [
                {
                    text: '取消',
                    handler: () => {
                    }
                },
                {
                    text: '确定',
                    handler: () => {
                        this.http.post(ENV.httpurl + "/api/group/deleteGroupsByIds", ids).subscribe(data => {
                            this.groupList(this.uri);
                        });
                    }
                }
            ]
        });
        confirm.present();
    }
}