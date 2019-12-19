import { globalData } from './../../../../icommon/provider/globalData';
import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams,ToastController, LoadingController,AlertController } from 'ionic-angular';
import { NativeService } from './../../../../icommon/provider/native';
import { HttpClient } from '@angular/common/http';
import { ENV } from '@env/environment';
// import { FormGroup, FormBuilder, Validators } from '@angular/forms';
@IonicPage()
@Component({
  selector: 'page-information',
  templateUrl: 'information.html',
})
export class InformationPage {
  userinfor:any;
  sexList:any;
  mobile: any;
  emailWork:any;
  officeTel:any;
  generName:any;
  httpurl:any;
  // registerForm: FormGroup;
  constructor(public navCtrl: NavController, public navParams: NavParams,
     public globalData: globalData,public NativeService:NativeService,private alerCtrl: AlertController,
     public http: HttpClient,
    //  private fb: FormBuilder,
     public toastCtrl: ToastController,public loadingCtrl: LoadingController) {
      this.userinfor= JSON.parse(localStorage.getItem("objectList"));
      this.httpurl=ENV.httpurl;
      // this.registerForm = this.fb.group({
      //   userName:[this.userinfor.staff.userName],
      //   gener:[this.userinfor.staff.gener],
      //   deptName:[this.userinfor.deptTo.deptName],
      //   mobile:[this.userinfor.staff.mobile,[Validators.required, Validators.minLength(11),Validators.maxLength(11),Validators.pattern('1[0-9]{10}')]],
      //   emailWork:[this.userinfor.loginInfo.emailWork,[Validators.required,Validators.pattern('^[a-zA-Z0-9_.-]+@[a-zA-Z0-9-]+(\.[a-zA-Z0-9-]+)*\.[a-zA-Z0-9]{2,6}$')]],
      //   officeAddr:[this.userinfor.staff.officeAddr,[Validators.required, Validators.minLength(3)]],
      //   officeTel:[this.userinfor.staff.officeTel,[Validators.required, Validators.minLength(3)]],
      //   // Validators.pattern('^(\d{3,4}-?)?\d{7,9}$')
      // })
      // this.mobile = this.registerForm.controls['mobile'];
      // this.emailWork = this.registerForm.controls['emailWork'];
      // this.officeTel = this.registerForm.controls['officeTel'];
  }
    ionViewDidEnter() {
      this.userinfor= JSON.parse(localStorage.getItem("objectList"));
    }
    ionViewDidLoad() {
    }
    ngOnInit(){
      if(!!this.userinfor && this.userinfor!= undefined){
        this.getSex();
      }
    }
    getSex(){
      this.http.post(ENV.httpurl + "/api/dictOption/queryDictOptionFindByDictCode/STAFF_GENDER",{}).subscribe(data => {
        this.sexList=data;
        let loginObj = JSON.parse(localStorage.getItem("objectList"));
        if(!!loginObj['staff'].gender){
          let getSex = this.sexList.filter(function (item) {
            return item.optionValue == loginObj['staff'].gender;
          });
          // this.registerForm.patchValue({
          //   gener: getSex[0].optionName
          // });
          this.generName = getSex[0].optionName;
          this.userinfor.staff.gender=getSex[0].optionValue;
        }else{
          let getSex = this.sexList.filter(function (item) {
            return item.optionValue == "M";
          });
          this.generName = getSex[0].optionName;
          // this.registerForm.patchValue({
          //   gener: getSex[0].optionName
          // });
          this.userinfor.staff.gender=getSex[0].optionValue;
        }
      })
    }
    change(){
      if (!/^1[3456789]\d{9}$/.test(this.userinfor.staff.mobile)) {
        this.NativeService.showAlert("请输入正确的手机号码")
        return false
      }else if(!/^[a-zA-Z0-9_.-]+@[a-zA-Z0-9-]+(\.[a-zA-Z0-9-]+)*\.[a-zA-Z0-9]{2,6}$/.test(this.userinfor.loginInfo.emailWork)){
        this.NativeService.showAlert("请输入正确的邮箱")
        return false
      }
      // else if(this.userinfor.staff.officeAddr.length ==0){
      //   this.NativeService.showAlert("请输入办公地址")
      // }else if(this.userinfor.staff.officeTel.length ==0){
      //   this.NativeService.showAlert("座机号码")
      // }
      else{
      Promise.all([new Promise((resolve,reject) => {
          var parmas = {
            mobile:this.userinfor.staff.mobile,
            userId:this.userinfor.staff.userId
          }
          this.http.post(ENV.httpurl + "/api/staff/mobileExists",parmas).subscribe(data => {
            if(data['result']==true){
              resolve(true);
            }else{
              this.NativeService.showAlert("请确保手机号码是唯一的!");
              reject();
            }
          })
          }),new Promise((resolve,reject) => {
            var parmas2 = {
              mail:this.userinfor.loginInfo.emailWork,
              userId:this.userinfor.staff.userId
            }
            this.http.post(ENV.httpurl + "/api/staff/mailExists",parmas2).subscribe(data => {
              if(data['result']==true){
                  resolve(true);
              }else{
                this.NativeService.showAlert("请确保邮箱是唯一的!");
                reject();
              }
            })
          })])
      .then(data => {
          var parmas = {
            userName:this.userinfor.staff.userName,
            gener:this.userinfor.staff.gender,
            mobNum:this.userinfor.staff.mobile,
            emailWork:this.userinfor.loginInfo.emailWork,
            officeAddr:this.userinfor.staff.officeAddr,
            officeTel:this.userinfor.staff.officeTel,
            corpDeptName:this.userinfor.deptTo.deptName,
            userId:this.userinfor.staff.userId
          }
          let loading = this.loadingCtrl.create({
            spinner: 'crescent',
          });
          this.http.post(ENV.httpurl + "/api/staff/updateCurrentLoginInfo",parmas).subscribe(data => {
            if(data['result']==true){
              loading.dismiss();
              this.userinfor.staff.mobile=parmas.mobNum;
              this.userinfor.staff.officeAddr=parmas.officeAddr;
              this.userinfor.staff.officeTel=parmas.officeTel;
              this.userinfor.loginInfo.emailWork=parmas.emailWork;
              localStorage.setItem("objectList", JSON.stringify(this.userinfor));
              this.NativeService.showToast("修改成功").then(()=>{
                setTimeout(() => {
                  this.navCtrl.pop()
                },800)
              })
            }
            
          })
      }).catch(e =>{
      })
    }
    }
    viewAvatar(){
      this.navCtrl.push('InforEditPage');
    }
    // 单选暂时不用
    presentPrompt() {
      const alert = this.alerCtrl.create({
        title: '请选择',
        inputs: [
          {
            type:'radio',
            label: '男',
            checked:true,
          },
          {
            type:'radio',
            label: '女',
            value:"女"
          }
        ],
        buttons: [
          {
            text: '取消',
            role: 'cancel',
            handler: data => {
            }
          },
          {
            text: '完成',
            handler: data => {
            }
          }
        ]
      });
      alert.present();
    }
    goback(){
      this.navCtrl.pop();
    }
}
