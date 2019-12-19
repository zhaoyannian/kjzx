import { NativeService } from './../../../../icommon/provider/native';
import { Component } from '@angular/core';
import { NavController, NavParams} from 'ionic-angular';
import { HttpClient } from '@angular/common/http'
import { ENV } from '@env/environment';
import _ from 'lodash';
@Component({
    selector:'page-project',
    templateUrl:'project.html'
})

export class ProjectPage{
    page: any = 1;
    //一页多少条
    pageSize: any = 10;
    allList:any;
    callback;
    projectInfo:any;
    projectList:any =[];
    isShow:any;
    //总条数
    totalCount: number;
    constructor(public nativeService:NativeService,public navCtrl:NavController,public navParams:NavParams,public http:HttpClient){
        //接收editDraftMx页面的callback
        this.callback = this.navParams.get('callback');
        this.projectInfo = this.navParams.get("projectList");
    }
    ionViewDidEnter() {
        this.init(null,null)
    }
    init(queryKey,refresher){
        // queryBySearchApp
        let pageInfo = { page: 1, pageSize: this.pageSize,queryKey:queryKey };
        this.http.post(ENV.httpurl + "/api/projectTable/queryBySearchStatusArr",{ params: pageInfo }).subscribe(result=>{
            if(result['length']>0){
                this.allList = result;
                this.allList.forEach(element => {
                    // if(!!this.projectInfo){
                    //     element.checked =false;
                    //     element.projectDate = '';
                    //     element.jobContent = '';
                    //     this.projectInfo.forEach(element2 => {
                    //         if(element.id == element2.id){
                    //             element.checked = element2.checked
                    //             element.projectDate = element2.projectDate
                    //             element.jobContent = element2.jobContent
                    //         }
                    //     });
                    // }else{
                        element.checked =false;
                    // }
                });
            }else{
                this.allList=[] 
            }
            if(!!refresher){
                refresher.complete();
            }
            this.nativeService.hideLoading();
        },error =>{
            if(!!refresher){
                refresher.complete();
            }
            this.nativeService.hideLoading();
        })
    }
      //刷新
    tabslideRefreshFn(refresher){
        this.init(null,refresher)
    }
    //下拉分页查询
    tabslideNextRefreshFn(infiniteScroll){
        if (this.totalCount == this.allList.length) {
          infiniteScroll.complete();
        } else {
            this.page += 1;
            let pageInfo = { page: this.page, pageSize: this.pageSize,queryKey:null };
            this.http.post(ENV.httpurl + "/api/projectTable/queryBySearchStatusArr",{ params: pageInfo }).subscribe(result=>{
                this.allList = this.allList.concat(result);
                this.allList.forEach(element => {
                    element.checked =false;
                });
                infiniteScroll.complete();
            })
        }   
    }
    chooseItem(item){
        item.checked = !item.checked;
        this.isShow = _.find(this.allList, function (o) {
            return o.checked == true;
        });
    }
    onCancel(ev){
    }
    getItems(ev){
        var val = ev.target.value;
        if (val && val.trim() != '') {
            this.init(val,null)
        } 
    }
    chooseAll(){
        this.allList.forEach(element => {
            if(element.checked == true){
                this.projectList.push(element)
            }
        });
        this.callback({'projectList':this.projectList}).then(()=>{
            this.navCtrl.pop();
        });
    }
}