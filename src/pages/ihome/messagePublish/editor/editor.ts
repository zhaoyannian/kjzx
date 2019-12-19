import { NativeService } from './../../../../icommon/provider/native';
import { Component } from '@angular/core';
import { NavController, NavParams, LoadingController } from 'ionic-angular';
import { HttpClient } from '@angular/common/http'
import { ENV } from '@env/environment';

// @IonicPage()
@Component({
    selector:'page-editor',
    templateUrl:'editor.html'
})

export class EditorPage{
    newEntity:any={};
    detailList:any = [];
    objModel:any ={};
    state:any = ENV.httpurl;
    constructor(public nativeService:NativeService,public NavCtrl:NavController, public navParams: NavParams, public http: HttpClient,public load:LoadingController){
        this.newEntity = this.navParams.get("entity");
    }
    ionViewDidLoad() {
    }

    ngOnInit(){
        this.nativeService.showLoading();

        if(!!this.newEntity.id){
            this.http.post(ENV.httpurl + "/api/orderInfo/loadDetail",{id:this.newEntity.id}).subscribe(data =>{
                this.detailList = data['listDetail'];
                 this.nativeService.hideLoading();    
            });
        }else{
             this.nativeService.hideLoading();
        }

        
    }
}